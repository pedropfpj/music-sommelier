const { resolveAccessContext } = require("./_access-control");
const { notifyCommunityActivity } = require("./_community-email");
const { commentAuthorProfiles } = require("./_user-profile");
const { hasDurableStore } = require("./_usage-store");
const { isProductionLike } = require("./_request-security");
const {
  assessUserGeneratedText,
  createModerationReport,
  readBlockedUserIds,
  setBlockedUser
} = require("./_ugc-safety");
const {
  enforceDurableMusicDailyLimit,
  durableRateLimitsRequired,
  envInt,
  envText,
  envFlag,
  parseBody,
  requireMusicApi,
  sendJson,
  trimText
} = require("./_music-apis");

const ALLOWED_TARGET_TYPES = new Set(["track", "video", "artist", "dj", "event", "festival", "news", "playlist", "post"]);
const MAX_COMMENT_LENGTH = 800;
const COMMENT_LIMIT = 40;

function supabaseConfig() {
  const supabaseUrl = envText("SUPABASE_URL").replace(/\/+$/, "");
  const serviceKey =
    envText("SUPABASE_SERVICE_ROLE_KEY") ||
    envText("SUPABASE_SERVICE_KEY") ||
    envText("SUPABASE_SERVICE_ROLE");
  return {
    enabled: Boolean(supabaseUrl && serviceKey),
    supabaseUrl,
    serviceKey
  };
}

function normalizeTargetType(value = "") {
  const targetType = String(value || "").trim().toLowerCase();
  if (ALLOWED_TARGET_TYPES.has(targetType)) return targetType;
  return "";
}

function normalizeTargetKey(value = "") {
  return trimText(value, 240);
}

function normalizeCommentId(value = "") {
  return trimText(value, 80);
}

function setupNeededFromError(error = "") {
  return /schema cache|does not exist|could not find|column .* does not exist|relation .* does not exist|permission denied|insufficient privilege|check constraint/i.test(String(error || ""));
}

function restHeaders(config, { prefer = "" } = {}) {
  const headers = {
    apikey: config.serviceKey,
    Authorization: `Bearer ${config.serviceKey}`,
    Accept: "application/json",
    "Content-Type": "application/json"
  };
  if (prefer) headers.Prefer = prefer;
  return headers;
}

async function supabaseRest(config, path, options = {}) {
  const response = await fetch(`${config.supabaseUrl}/rest/v1/${path.replace(/^\/+/, "")}`, {
    signal: AbortSignal.timeout(12000),
    method: options.method || "GET",
    headers: restHeaders(config, { prefer: options.prefer || "" }),
    body: options.body === undefined ? undefined : JSON.stringify(options.body)
  });
  const text = await response.text();
  let payload = null;
  if (text) {
    try {
      payload = JSON.parse(text);
    } catch {
      payload = text;
    }
  }
  if (!response.ok) {
    const detail = payload?.message || payload?.error || payload?.details || response.statusText;
    const error = new Error(String(detail || "supabase_request_failed"));
    error.status = response.status;
    error.payload = payload;
    throw error;
  }
  return payload;
}

function urlList(values = []) {
  return values
    .map((value) => String(value || "").trim())
    .filter(Boolean)
    .map((value) => `"${value.replace(/"/g, '\\"')}"`)
    .join(",");
}

function publicProfile(row = {}) {
  const metadata = row.metadata && typeof row.metadata === "object" ? row.metadata : {};
  const username = trimText(row.username || metadata.username || "", 60);
  const displayName = trimText(row.display_name || metadata.displayName || username || "Sonic listener", 80);
  return {
    id: row.id || "",
    username,
    displayName,
    // A post's client metadata is not consent to publish an account photo.
    // Community portraits require a verified, visibility-aware profile lookup.
    avatarUrl: ""
  };
}

function viewerContext(access = {}, blockedUserIds = []) {
  return {
    authenticated: Boolean(access.authenticated),
    role: access.role || "anonymous",
    canModerate: Boolean(access.canModerate || access.owner || access.moderator),
    blockedUserIds: Array.isArray(blockedUserIds) ? blockedUserIds : []
  };
}

function storageAuthorFromMetadata(access, metadata = {}) {
  const username = trimText(metadata.username || "", 60);
  const displayName = trimText(
    metadata.displayName ||
      metadata.display_name ||
      username ||
      "Sonic listener",
    80
  );
  return {
    username,
    displayName,
    avatarUrl: ""
  };
}

function requestTargetFromBodyOrQuery(req, body = {}) {
  return {
    targetType: normalizeTargetType(body.targetType || body.target_type || req.query?.targetType || req.query?.target_type),
    targetKey: normalizeTargetKey(body.targetKey || body.target_key || req.query?.targetKey || req.query?.target_key)
  };
}

async function fetchProfiles(config, userIds = [], access = {}) {
  const ids = Array.from(new Set(userIds.map((id) => String(id || "").trim()).filter(Boolean)));
  if (!ids.length) return new Map();
  try {
    return await commentAuthorProfiles({ url: config.supabaseUrl, key: config.serviceKey }, ids.slice(0, COMMENT_LIMIT), access);
  } catch (_error) {
    return new Map();
  }
}

async function fetchReactionSummary(config, commentIds = [], currentUserId = "") {
  const ids = Array.from(new Set(commentIds.map((id) => String(id || "").trim()).filter(Boolean)));
  const summary = new Map(ids.map((id) => [id, { likes: 0, dislikes: 0, myReaction: 0 }]));
  if (!ids.length) return { enabled: true, summary };
  try {
    const rows = await supabaseRest(config, "rpc/sonic_comment_reaction_summary", {
      method: "POST", body: { p_comment_ids: ids, p_user_id: currentUserId }
    });
    (Array.isArray(rows) ? rows : []).forEach(row => {
      if (summary.has(row.comment_id)) summary.set(row.comment_id, {
        likes: Number(row.likes) || 0, dislikes: Number(row.dislikes) || 0,
        myReaction: Number(row.my_reaction) || 0
      });
    });
    return { enabled: true, summary };
  } catch (error) {
    if (setupNeededFromError(error.message)) return { enabled: false, summary };
    throw error;
  }
}

async function fetchCommentsForTarget(config, params) {
  const visible = new URLSearchParams(params);
  visible.set("status", "eq.visible");
  return supabaseRest(config, `comments?${visible.toString()}`);
}

function serializeComment(row = {}, profiles = new Map(), reactions = new Map(), currentUserId = "") {
  const profile = profiles.get(row.user_id) || publicProfile({ id: row.user_id || "" });
  const reaction = reactions.get(row.id) || { likes: 0, dislikes: 0, myReaction: 0 };
  return {
    id: row.id,
    targetType: row.target_type,
    targetKey: row.target_key,
    body: row.body || "",
    createdAt: row.created_at || "",
    updatedAt: row.updated_at || "",
    mine: Boolean(currentUserId && row.user_id === currentUserId),
    author: profile,
    reactions: reaction
  };
}

async function targetLikeSummary(config, access, targetType, targetKey, liked = null) {
  if (!["track", "video"].includes(targetType)) return null;
  return supabaseRest(config, "rpc/sonic_target_like", {
    method: "POST",
    body: { p_user_id: access.userId, p_target_type: targetType, p_target_key: targetKey, p_liked: liked }
  });
}

async function likeTarget(req, res, config, access, body) {
  const { targetType, targetKey } = requestTargetFromBodyOrQuery(req, body);
  const methods = ["GET", "POST", "PATCH", "DELETE", "OPTIONS"];
  if (!["track", "video"].includes(targetType) || !targetKey || typeof body.liked !== "boolean") {
    sendJson(req, res, 400, { ok: false, error: "invalid_social_target" }, methods);
    return;
  }
  try {
    const targetReaction = await targetLikeSummary(config, access, targetType, targetKey, body.liked);
    sendJson(req, res, 200, { ok: true, targetReaction }, methods);
  } catch (error) {
    sendJson(req, res, 503, { ok: false, setupNeeded: setupNeededFromError(error.message), error: "target_like_unavailable" }, methods);
  }
}

async function listComments(req, res, config, access) {
  const targetType = normalizeTargetType(req.query?.targetType || req.query?.target_type);
  const targetKey = normalizeTargetKey(req.query?.targetKey || req.query?.target_key);
  if (!targetType || !targetKey) {
    sendJson(req, res, 400, { ok: false, error: "missing_target" }, ["GET", "POST", "PATCH", "DELETE", "OPTIONS"]);
    return;
  }

  const params = new URLSearchParams({
    target_type: `eq.${targetType}`,
    target_key: `eq.${targetKey}`,
    select: "id,user_id,target_type,target_key,body,created_at,updated_at",
    order: "created_at.desc",
    limit: String(COMMENT_LIMIT)
  });
  try {
    const rows = await fetchCommentsForTarget(config, params);
    const blockedUserIds = await readBlockedUserIds(config, access.userId);
    const blocked = new Set(blockedUserIds);
    const comments = (Array.isArray(rows) ? rows : [])
      .filter((row) => !blocked.has(String(row.user_id || "")));
    const [profiles, reactions, targetReaction] = await Promise.all([
      fetchProfiles(config, comments.map((row) => row.user_id), access),
      fetchReactionSummary(config, comments.map((row) => row.id), access.userId),
      targetLikeSummary(config, access, targetType, targetKey)
    ]);
    sendJson(req, res, 200, {
      ok: true,
      enabled: true,
      targetType,
      targetKey,
      reactionsEnabled: reactions.enabled,
      targetReaction,
      viewer: viewerContext(access, blockedUserIds),
      comments: comments.map((row) => serializeComment(row, profiles, reactions.summary, access.userId))
    }, ["GET", "POST", "PATCH", "DELETE", "OPTIONS"]);
  } catch (error) {
    sendJson(req, res, setupNeededFromError(error.message) ? 200 : 500, {
      ok: false,
      enabled: true,
      setupNeeded: setupNeededFromError(error.message),
      viewer: viewerContext(access),
      error: "comments_load_failed",
      detail: error.message,
      comments: []
    }, ["GET", "POST", "PATCH", "DELETE", "OPTIONS"]);
  }
}

async function insertActivity(config, access, comment = {}, metadata = {}) {
  if (!access.userId || !comment?.id) return;
  try {
    await supabaseRest(config, "activity_feed", {
      method: "POST",
      prefer: "return=minimal",
      body: [{
        user_id: access.userId,
        activity_type: "commented",
        target_type: comment.target_type,
        target_key: comment.target_key,
        artist: trimText(metadata.artist || "", 160) || null,
        song: trimText(metadata.song || "", 220) || null,
        style: trimText(metadata.style || "", 80) || null,
        metadata: {
          commentId: comment.id,
          bodyPreview: trimText(comment.body || "", 160),
          displayName: metadata.displayName || "",
          username: metadata.username || ""
        }
      }]
    });
  } catch (_error) {
    // Activity is supportive, not required for the user action to succeed.
  }
}

async function createComment(req, res, config, access, body) {
  if (!access.authenticated || !access.userId) {
    sendJson(req, res, 401, { ok: false, error: "login_required" }, ["GET", "POST", "PATCH", "DELETE", "OPTIONS"]);
    return;
  }
  const targetType = normalizeTargetType(body.targetType || body.target_type);
  const targetKey = normalizeTargetKey(body.targetKey || body.target_key);
  const text = trimText(body.body || body.comment || "", MAX_COMMENT_LENGTH);
  if (!targetType || !targetKey) {
    sendJson(req, res, 400, { ok: false, error: "missing_target" }, ["GET", "POST", "PATCH", "DELETE", "OPTIONS"]);
    return;
  }
  if (!text) {
    sendJson(req, res, 400, { ok: false, error: "missing_comment" }, ["GET", "POST", "PATCH", "DELETE", "OPTIONS"]);
    return;
  }
  const moderation = assessUserGeneratedText(text);
  if (!moderation.allowed) {
    sendJson(req, res, 422, {
      ok: false,
      error: "content_not_allowed",
      reason: moderation.code
    }, ["GET", "POST", "PATCH", "DELETE", "OPTIONS"]);
    return;
  }

  const metadata = body.metadata && typeof body.metadata === "object" ? body.metadata : {};
  const requestId = body.clientRequestId;
  if (requestId !== undefined && (typeof requestId !== "string" || !/^[a-f\d]{8}-(?:[a-f\d]{4}-){3}[a-f\d]{12}$/i.test(requestId))) {
    sendJson(req, res, 400, { ok: false, error: "invalid_request_id" }, ["GET", "POST", "PATCH", "DELETE", "OPTIONS"]);
    return;
  }
  const baseRow = {
    user_id: access.userId,
    target_type: targetType,
    target_key: targetKey,
    body: text,
    ...(requestId ? { client_request_id: requestId } : {})
  };
  const richRow = {
    ...baseRow,
    metadata: {
      artist: trimText(metadata.artist || body.artist || "", 160),
      song: trimText(metadata.song || body.song || "", 220),
      style: trimText(metadata.style || body.style || "", 80),
      targetLabel: trimText(metadata.targetLabel || "", 240)
    }
  };

  try {
    const rows = await supabaseRest(config, requestId ? "comments?on_conflict=user_id,client_request_id" : "comments", {
      method: "POST", prefer: requestId ? "resolution=ignore-duplicates,return=representation" : "return=representation", body: [{ ...richRow, status: "visible" }]
    });
    let comment = Array.isArray(rows) ? rows[0] : null;
    const inserted = Boolean(comment);
    if (!comment && requestId) {
      const params = new URLSearchParams({ user_id: `eq.${access.userId}`, client_request_id: `eq.${requestId}`, select: "*", limit: "1" });
      comment = (await supabaseRest(config, `comments?${params}`))?.[0];
      if (!comment || comment.status !== "visible" || comment.body !== text || comment.target_type !== targetType || comment.target_key !== targetKey) {
        sendJson(req, res, 409, { ok: false, error: "comment_request_conflict" }, ["GET", "POST", "PATCH", "DELETE", "OPTIONS"]);
        return;
      }
    }
    if (!comment?.id) throw new Error("comment_not_saved");
    const profiles = await fetchProfiles(config, [access.userId], access);
    const profile = profiles.get(access.userId) || publicProfile({ id: access.userId });
    const publicActor = (await fetchProfiles(config, [access.userId])).get(access.userId) || publicProfile({ id: access.userId });
    if (inserted) await insertActivity(config, access, comment, { ...metadata, ...publicActor });
    if (inserted && comment?.id) {
      await notifyCommunityActivity({
        id: comment.id,
        kind: "comment",
        actor: publicActor,
        body: comment.body || text,
        targetType,
        targetLabel: richRow.metadata.targetLabel,
        artist: richRow.metadata.artist,
        song: richRow.metadata.song,
        style: richRow.metadata.style,
        createdAt: comment.created_at || new Date().toISOString()
      });
    }
    sendJson(req, res, 200, {
      ok: true,
      enabled: true,
      viewer: viewerContext(access),
      comment: serializeComment(comment, new Map([[access.userId, profile]]), new Map(), access.userId)
    }, ["GET", "POST", "PATCH", "DELETE", "OPTIONS"]);
  } catch (error) {
    sendJson(req, res, setupNeededFromError(error.message) ? 200 : 500, {
      ok: false,
      enabled: true,
      setupNeeded: setupNeededFromError(error.message),
      viewer: viewerContext(access),
      error: "comment_create_failed",
      detail: error.message
    }, ["GET", "POST", "PATCH", "DELETE", "OPTIONS"]);
  }
}

async function updateComment(req, res, config, access, body) {
  if (!access.authenticated || !access.userId) {
    sendJson(req, res, 401, { ok: false, error: "login_required" }, ["GET", "POST", "PATCH", "DELETE", "OPTIONS"]);
    return;
  }
  const commentId = normalizeCommentId(body.id || body.commentId || body.comment_id);
  const text = trimText(body.body || body.comment || "", MAX_COMMENT_LENGTH);
  if (!commentId || !text) {
    sendJson(req, res, 400, { ok: false, error: "missing_comment" }, ["GET", "POST", "PATCH", "DELETE", "OPTIONS"]);
    return;
  }
  const moderation = assessUserGeneratedText(text);
  if (!moderation.allowed) {
    sendJson(req, res, 422, {
      ok: false,
      error: "content_not_allowed",
      reason: moderation.code
    }, ["GET", "POST", "PATCH", "DELETE", "OPTIONS"]);
    return;
  }
  try {
    const params = new URLSearchParams({
      id: `eq.${commentId}`,
      user_id: `eq.${access.userId}`,
      status: "eq.visible"
    });
    const rows = await supabaseRest(config, `comments?${params.toString()}`, {
      method: "PATCH",
      prefer: "return=representation",
      body: { body: text, updated_at: new Date().toISOString() }
    });
    if (!Array.isArray(rows) || !rows.length) {
      sendJson(req, res, 404, { ok: false, error: "comment_not_found" }, ["GET", "POST", "PATCH", "DELETE", "OPTIONS"]);
      return;
    }
    sendJson(req, res, 200, {
      ok: true,
      viewer: viewerContext(access),
      comment: Array.isArray(rows) ? rows[0] : null
    }, ["GET", "POST", "PATCH", "DELETE", "OPTIONS"]);
  } catch (error) {
    sendJson(req, res, 500, {
      ok: false,
      viewer: viewerContext(access),
      error: "comment_update_failed",
      detail: error.message
    }, ["GET", "POST", "PATCH", "DELETE", "OPTIONS"]);
  }
}

async function deleteCommentFromSupabase(config, access, commentId) {
  const canModerate = Boolean(access.canModerate || access.owner || access.moderator);
  const params = new URLSearchParams({ id: `eq.${commentId}` });
  if (!canModerate) params.set("user_id", `eq.${access.userId}`);
  const rows = await supabaseRest(config, `comments?${params.toString()}`, {
    method: "PATCH", prefer: "return=representation",
    body: { status: "deleted", body: "[deleted]", metadata: {}, deleted_at: new Date().toISOString(), updated_at: new Date().toISOString() }
  });
  return Array.isArray(rows) ? rows : [];
}

async function deleteComment(req, res, config, access, body) {
  if (!access.authenticated || !access.userId) {
    sendJson(req, res, 401, { ok: false, error: "login_required" }, ["GET", "POST", "PATCH", "DELETE", "OPTIONS"]);
    return;
  }
  const commentId = normalizeCommentId(body.id || body.commentId || req.query?.id);
  if (!commentId) {
    sendJson(req, res, 400, { ok: false, error: "missing_comment_id" }, ["GET", "POST", "PATCH", "DELETE", "OPTIONS"]);
    return;
  }
  try {
    const rows = await deleteCommentFromSupabase(config, access, commentId);
    if (!rows.length) {
      sendJson(req, res, 404, {
        ok: false,
        viewer: viewerContext(access),
        error: "comment_not_found"
      }, ["GET", "POST", "PATCH", "DELETE", "OPTIONS"]);
      return;
    }
    sendJson(req, res, 200, {
      ok: true,
      viewer: viewerContext(access)
    }, ["GET", "POST", "PATCH", "DELETE", "OPTIONS"]);
  } catch (error) {
    sendJson(req, res, 500, {
      ok: false,
      viewer: viewerContext(access),
      error: "comment_delete_failed",
      detail: error.message
    }, ["GET", "POST", "PATCH", "DELETE", "OPTIONS"]);
  }
}

async function reactToComment(req, res, config, access, body) {
  if (!access.authenticated || !access.userId) {
    sendJson(req, res, 401, { ok: false, error: "login_required" }, ["GET", "POST", "PATCH", "DELETE", "OPTIONS"]);
    return;
  }
  const commentId = normalizeCommentId(body.commentId || body.comment_id || body.id);
  const value = Number(body.value) > 0 ? 1 : Number(body.value) < 0 ? -1 : 0;
  if (!commentId) {
    sendJson(req, res, 400, { ok: false, error: "missing_comment_id" }, ["GET", "POST", "PATCH", "DELETE", "OPTIONS"]);
    return;
  }
  try {
    const { targetType, targetKey } = requestTargetFromBodyOrQuery(req, body);
    const check = new URLSearchParams({ id: `eq.${commentId}`, status: "eq.visible", select: "id,user_id", limit: "1" });
    if (!targetType || !targetKey) throw new Error("missing_target");
    check.set("target_type", `eq.${targetType}`);
    check.set("target_key", `eq.${targetKey}`);
    const rows = await supabaseRest(config, `comments?${check}`);
    const blocked = await readBlockedUserIds(config, access.userId);
    if (!rows?.[0] || blocked.includes(rows[0].user_id)) {
      sendJson(req, res, 404, { ok: false, error: "comment_not_found" }, ["GET", "POST", "PATCH", "DELETE", "OPTIONS"]);
      return;
    }
    const params = new URLSearchParams({
      comment_id: `eq.${commentId}`,
      user_id: `eq.${access.userId}`
    });
    if (!value) {
      await supabaseRest(config, `comment_reactions?${params.toString()}`, {
        method: "DELETE",
        prefer: "return=minimal"
      });
    } else {
      await supabaseRest(config, "comment_reactions?on_conflict=comment_id,user_id", {
        method: "POST",
        prefer: "resolution=merge-duplicates,return=minimal",
        body: [{
          comment_id: commentId,
          user_id: access.userId,
          value
        }]
      });
    }
    sendJson(req, res, 200, {
      ok: true,
      viewer: viewerContext(access)
    }, ["GET", "POST", "PATCH", "DELETE", "OPTIONS"]);
  } catch (error) {
    sendJson(req, res, setupNeededFromError(error.message) ? 200 : 500, {
      ok: false,
      setupNeeded: setupNeededFromError(error.message),
      error: "comment_reaction_failed",
      detail: error.message
    }, ["GET", "POST", "PATCH", "DELETE", "OPTIONS"]);
  }
}

async function commentForModerationReport(req, config, body, commentId) {
  try {
    const params = new URLSearchParams({
      id: `eq.${commentId}`,
      select: "id,user_id,target_type,target_key,body",
      status: "eq.visible",
      limit: "1"
    });
    const rows = await supabaseRest(config, `comments?${params.toString()}`);
    const row = Array.isArray(rows) ? rows[0] : null;
    if (row) {
      return {
        id: row.id,
        userId: row.user_id,
        targetType: row.target_type,
        targetKey: row.target_key,
        body: row.body || ""
      };
    }
  } catch (error) {
    if (!setupNeededFromError(error.message)) throw error;
  }

  return null;
}

async function reportComment(req, res, config, access, body) {
  if (!access.authenticated || !access.userId) {
    sendJson(req, res, 401, { ok: false, error: "login_required" }, ["GET", "POST", "PATCH", "DELETE", "OPTIONS"]);
    return;
  }
  const commentId = normalizeCommentId(body.commentId || body.comment_id || body.id);
  if (!commentId) {
    sendJson(req, res, 400, { ok: false, error: "missing_comment_id" }, ["GET", "POST", "PATCH", "DELETE", "OPTIONS"]);
    return;
  }
  try {
    const comment = await commentForModerationReport(req, config, body, commentId);
    if (!comment || comment.userId === access.userId) {
      sendJson(req, res, 404, { ok: false, error: "comment_not_found" }, ["GET", "POST", "PATCH", "DELETE", "OPTIONS"]);
      return;
    }
    const profiles = await fetchProfiles(config, [access.userId]);
    const reporter = profiles.get(access.userId) || publicProfile({ id: access.userId });
    const report = await createModerationReport(config, {
      reporterUserId: access.userId,
      reporter,
      targetType: "comment",
      targetId: comment.id,
      targetAuthorId: comment.userId,
      parentType: comment.targetType,
      parentKey: comment.targetKey,
      reason: trimText(body.reason || "inappropriate_content", 120),
      excerpt: trimText(comment.body || "", 500)
    });
    await notifyCommunityActivity({
      id: report.id,
      kind: "report",
      actor: reporter,
      body: report.excerpt,
      targetType: "comment",
      targetLabel: `${comment.targetType}:${comment.targetKey}`,
      targetId: comment.id,
      targetAuthorId: comment.userId,
      reason: report.reason,
      createdAt: report.createdAt
    });
    sendJson(req, res, 200, {
      ok: true,
      reported: true,
      viewer: viewerContext(access)
    }, ["GET", "POST", "PATCH", "DELETE", "OPTIONS"]);
  } catch (error) {
    sendJson(req, res, 500, {
      ok: false,
      error: "comment_report_failed",
      detail: error.message
    }, ["GET", "POST", "PATCH", "DELETE", "OPTIONS"]);
  }
}

async function updateBlockedUser(req, res, config, access, body) {
  if (!access.authenticated || !access.userId) {
    sendJson(req, res, 401, { ok: false, error: "login_required" }, ["GET", "POST", "PATCH", "DELETE", "OPTIONS"]);
    return;
  }
  const targetUserId = trimText(body.userId || body.targetUserId || body.authorId || "", 120);
  if (!targetUserId || targetUserId === access.userId) {
    sendJson(req, res, 400, { ok: false, error: "invalid_block_target" }, ["GET", "POST", "PATCH", "DELETE", "OPTIONS"]);
    return;
  }
  try {
    const blockedUserIds = await setBlockedUser(config, access.userId, targetUserId, body.blocked !== false);
    sendJson(req, res, 200, {
      ok: true,
      blocked: body.blocked !== false,
      viewer: viewerContext(access, blockedUserIds)
    }, ["GET", "POST", "PATCH", "DELETE", "OPTIONS"]);
  } catch (error) {
    sendJson(req, res, 500, {
      ok: false,
      error: "comment_block_failed",
      detail: error.message
    }, ["GET", "POST", "PATCH", "DELETE", "OPTIONS"]);
  }
}

async function enforceCommentBudget(config, req, res, userId, methods) {
  if (hasDurableStore() || (!isProductionLike() && !durableRateLimitsRequired())) {
    return enforceDurableMusicDailyLimit(req, res, { feature: "comments", dailyLimitEnv: "SONIC_SOCIAL_COMMENTS_DAILY_LIMIT", defaultDailyLimit: 160, methods });
  }
  const limit = envInt("SONIC_SOCIAL_COMMENTS_DAILY_LIMIT", 160, 1, 10000);
  try {
    const budget = await supabaseRest(config, "rpc/sonic_consume_social_request_budget", {
      method: "POST", body: { p_user_id: userId, p_daily_limit: limit }
    });
    if (!budget || typeof budget.allowed !== "boolean" || !Number.isInteger(budget.remaining) || budget.remaining < 0 || budget.remaining > limit) throw new Error("invalid_budget_response");
    if (!budget.allowed) {
      sendJson(req, res, 429, { ok: false, error: "daily_music_api_limit_reached", feature: "comments", limit }, methods);
      return false;
    }
    res.setHeader("X-Sonic-Music-Durable-Remaining", String(budget.remaining));
    res.setHeader("X-Sonic-Usage-Store", "supabase");
    return true;
  } catch (_) {
    sendJson(req, res, 503, { ok: false, error: "durable_rate_limit_required", feature: "comments" }, methods);
    return false;
  }
}

module.exports = async function handler(req, res) {
  // Keep existing clients and stored threads on their deployed API until staging is validated.
  if (!envFlag("SONIC_TRACK_VIDEO_SOCIAL_V2_ENABLED", false)) return require("./_comments-legacy")(req, res);
  const methods = ["GET", "POST", "PATCH", "DELETE", "OPTIONS"];
  if (!requireMusicApi(req, res, {
    methods: ["GET", "POST", "PATCH", "DELETE"],
    feature: "comments",
    enabledEnv: "SONIC_SOCIAL_COMMENTS_ENABLED",
    defaultEnabled: true,
    allowGlobalFallback: false,
    dailyLimitEnv: "SONIC_SOCIAL_COMMENTS_DAILY_LIMIT",
    defaultDailyLimit: 160,
    budgetOnStart: false,
    // The explicit feature switch and verified account gate this route.
    betaAccess: false
  })) return;

  const config = supabaseConfig();
  if (!config.enabled) {
    sendJson(req, res, 200, { ok: true, enabled: false, comments: [] }, methods);
    return;
  }

  const body = parseBody(req);
  const access = await resolveAccessContext(req, body, { includeProfileIdentity: true });
  res.setHeader("Cache-Control", "private, no-store, max-age=0");
  if (!access.authenticated || !access.userId) {
    sendJson(req, res, 401, { ok: false, error: "login_required" }, methods);
    return;
  }
  if (!await enforceCommentBudget(config, req, res, access.userId, methods)) return;

  if (req.method === "GET") {
    await listComments(req, res, config, access);
    return;
  }
  if (req.method === "POST") {
    const action = String(body.action || req.query?.action || "").trim().toLowerCase();
    if (action === "like-target") {
      await likeTarget(req, res, config, access, body);
      return;
    }
    if (action === "react") {
      await reactToComment(req, res, config, access, body);
      return;
    }
    if (action === "report") {
      await reportComment(req, res, config, access, body);
      return;
    }
    if (action === "block") {
      await updateBlockedUser(req, res, config, access, body);
      return;
    }
    await createComment(req, res, config, access, body);
    return;
  }
  if (req.method === "PATCH") {
    await updateComment(req, res, config, access, body);
    return;
  }
  if (req.method === "DELETE") {
    await deleteComment(req, res, config, access, body);
  }
};
