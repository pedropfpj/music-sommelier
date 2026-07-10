const { normalizeEmail, resolveAccessContext } = require("./_access-control");
const {
  enforceDurableMusicDailyLimit,
  envText,
  parseBody,
  requireMusicApi,
  sendJson,
  trimText
} = require("./_music-apis");
const crypto = require("node:crypto");

const ALLOWED_TARGET_TYPES = new Set(["track", "artist", "dj", "event", "festival", "news", "playlist", "post"]);
const MAX_COMMENT_LENGTH = 800;
const COMMENT_LIMIT = 40;
const STORAGE_COMMENTS_BUCKET = "sonic-social-comments";
const STORAGE_COMMENTS_PREFIX = "comments/v1";

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
    avatarUrl: trimText(row.avatar_url || metadata.avatarUrl || "", 500)
  };
}

function viewerContext(access = {}) {
  return {
    authenticated: Boolean(access.authenticated),
    role: access.role || "anonymous",
    canModerate: Boolean(access.canModerate || access.owner || access.moderator)
  };
}

function storageHeaders(config, extra = {}) {
  return {
    apikey: config.serviceKey,
    Authorization: `Bearer ${config.serviceKey}`,
    Accept: "application/json",
    ...extra
  };
}

async function storageFetch(config, path, options = {}) {
  const response = await fetch(`${config.supabaseUrl}/storage/v1/${path.replace(/^\/+/, "")}`, {
    method: options.method || "GET",
    headers: storageHeaders(config, options.headers || {}),
    body: options.body
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
  return { response, payload, text };
}

async function ensureStorageCommentsBucket(config) {
  const read = await storageFetch(config, `bucket/${STORAGE_COMMENTS_BUCKET}`);
  if (read.response.ok) return true;
  if (![400, 404].includes(read.response.status)) {
    const detail = read.payload?.message || read.payload?.error || read.response.statusText;
    throw new Error(String(detail || "storage_bucket_lookup_failed"));
  }
  const create = await storageFetch(config, "bucket", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      id: STORAGE_COMMENTS_BUCKET,
      name: STORAGE_COMMENTS_BUCKET,
      public: false,
      file_size_limit: 5242880
    })
  });
  if (create.response.ok || create.response.status === 409) return true;
  const detail = create.payload?.message || create.payload?.error || create.response.statusText;
  throw new Error(String(detail || "storage_bucket_create_failed"));
}

function storageCommentPath(targetType = "", targetKey = "") {
  const key = Buffer.from(`${targetType}:${targetKey}`, "utf8").toString("base64url");
  return `${STORAGE_COMMENTS_PREFIX}/${targetType}/${key}.json`;
}

function emptyStorageThread(targetType = "", targetKey = "") {
  return {
    version: 1,
    targetType,
    targetKey,
    comments: []
  };
}

async function readStorageThread(config, targetType = "", targetKey = "") {
  await ensureStorageCommentsBucket(config);
  const objectPath = storageCommentPath(targetType, targetKey);
  const result = await storageFetch(config, `object/${STORAGE_COMMENTS_BUCKET}/${objectPath}`, {
    headers: { Accept: "application/json" }
  });
  if (result.response.status === 404 || result.response.status === 400) {
    return emptyStorageThread(targetType, targetKey);
  }
  if (!result.response.ok) {
    const detail = result.payload?.message || result.payload?.error || result.response.statusText;
    throw new Error(String(detail || "storage_thread_read_failed"));
  }
  const doc = result.payload && typeof result.payload === "object"
    ? result.payload
    : {};
  return {
    ...emptyStorageThread(targetType, targetKey),
    ...doc,
    comments: Array.isArray(doc.comments) ? doc.comments : []
  };
}

async function writeStorageThread(config, thread = {}) {
  await ensureStorageCommentsBucket(config);
  const targetType = normalizeTargetType(thread.targetType);
  const targetKey = normalizeTargetKey(thread.targetKey);
  if (!targetType || !targetKey) throw new Error("storage_thread_target_missing");
  const objectPath = storageCommentPath(targetType, targetKey);
  const result = await storageFetch(config, `object/${STORAGE_COMMENTS_BUCKET}/${objectPath}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-upsert": "true"
    },
    body: JSON.stringify({
      version: 1,
      targetType,
      targetKey,
      updatedAt: new Date().toISOString(),
      comments: Array.isArray(thread.comments) ? thread.comments.slice(0, 200) : []
    })
  });
  if (result.response.ok) return true;
  const detail = result.payload?.message || result.payload?.error || result.response.statusText;
  throw new Error(String(detail || "storage_thread_write_failed"));
}

function serializeStorageComment(row = {}, currentUserId = "") {
  const reactionsByUser = row.reactionsByUser && typeof row.reactionsByUser === "object" ? row.reactionsByUser : {};
  const reactionValues = Object.values(reactionsByUser).map((value) => Number(value) || 0);
  const likes = reactionValues.filter((value) => value > 0).length;
  const dislikes = reactionValues.filter((value) => value < 0).length;
  const myReaction = currentUserId ? Number(reactionsByUser[currentUserId]) || 0 : 0;
  return {
    id: row.id || "",
    targetType: row.targetType || "",
    targetKey: row.targetKey || "",
    body: row.body || "",
    createdAt: row.createdAt || "",
    updatedAt: row.updatedAt || "",
    mine: Boolean(currentUserId && row.userId === currentUserId),
    author: publicProfile({
      id: row.userId || "",
      username: row.author?.username || "",
      display_name: row.author?.displayName || row.author?.display_name || "Sonic listener",
      avatar_url: row.author?.avatarUrl || row.author?.avatar_url || ""
    }),
    reactions: {
      likes,
      dislikes,
      myReaction: myReaction > 0 ? 1 : myReaction < 0 ? -1 : 0
    }
  };
}

function storageAuthorFromMetadata(access, metadata = {}) {
  const username = trimText(metadata.username || "", 60);
  const displayName = trimText(
    metadata.displayName ||
      metadata.display_name ||
      access.email ||
      normalizeEmail(access.email) ||
      username ||
      "Sonic listener",
    80
  );
  return {
    username,
    displayName,
    avatarUrl: trimText(metadata.avatarUrl || metadata.avatar_url || "", 500)
  };
}

async function listCommentsFromStorage(req, res, config, access, targetType, targetKey) {
  try {
    const thread = await readStorageThread(config, targetType, targetKey);
    const comments = thread.comments
      .filter((row) => !row.deletedAt)
      .sort((a, b) => String(b.createdAt || "").localeCompare(String(a.createdAt || "")))
      .slice(0, COMMENT_LIMIT)
      .map((row) => serializeStorageComment(row, access.userId));
    sendJson(req, res, 200, {
      ok: true,
      enabled: true,
      storageFallback: true,
      targetType,
      targetKey,
      reactionsEnabled: true,
      viewer: viewerContext(access),
      comments
    }, ["GET", "POST", "PATCH", "DELETE", "OPTIONS"]);
    return true;
  } catch (error) {
    sendJson(req, res, 200, {
      ok: false,
      enabled: true,
      setupNeeded: true,
      storageFallback: true,
      viewer: viewerContext(access),
      error: "comments_storage_unavailable",
      detail: error.message,
      comments: []
    }, ["GET", "POST", "PATCH", "DELETE", "OPTIONS"]);
    return false;
  }
}

async function createCommentInStorage(req, res, config, access, body, targetType, targetKey, text, metadata = {}) {
  try {
    const thread = await readStorageThread(config, targetType, targetKey);
    const now = new Date().toISOString();
    const comment = {
      id: crypto.randomUUID(),
      userId: access.userId,
      targetType,
      targetKey,
      body: text,
      author: storageAuthorFromMetadata(access, metadata),
      metadata: {
        artist: trimText(metadata.artist || body.artist || "", 160),
        song: trimText(metadata.song || body.song || "", 220),
        style: trimText(metadata.style || body.style || "", 80),
        targetLabel: trimText(metadata.targetLabel || "", 240)
      },
      reactionsByUser: {},
      createdAt: now,
      updatedAt: now
    };
    thread.comments = [comment, ...thread.comments.filter((row) => row.id !== comment.id)].slice(0, 200);
    await writeStorageThread(config, thread);
    sendJson(req, res, 200, {
      ok: true,
      enabled: true,
      storageFallback: true,
      viewer: viewerContext(access),
      comment: serializeStorageComment(comment, access.userId)
    }, ["GET", "POST", "PATCH", "DELETE", "OPTIONS"]);
    return true;
  } catch (error) {
    sendJson(req, res, 200, {
      ok: false,
      enabled: true,
      setupNeeded: true,
      storageFallback: true,
      viewer: viewerContext(access),
      error: "comment_storage_create_failed",
      detail: error.message
    }, ["GET", "POST", "PATCH", "DELETE", "OPTIONS"]);
    return false;
  }
}

async function updateCommentInStorage(req, res, config, access, targetType, targetKey, commentId, text) {
  try {
    if (!targetType || !targetKey) throw new Error("missing_target");
    const thread = await readStorageThread(config, targetType, targetKey);
    const comment = thread.comments.find((row) => row.id === commentId && row.userId === access.userId);
    if (!comment) throw new Error("comment_not_found");
    comment.body = text;
    comment.updatedAt = new Date().toISOString();
    await writeStorageThread(config, thread);
    sendJson(req, res, 200, {
      ok: true,
      storageFallback: true,
      viewer: viewerContext(access),
      comment: serializeStorageComment(comment, access.userId)
    }, ["GET", "POST", "PATCH", "DELETE", "OPTIONS"]);
    return true;
  } catch (error) {
    sendJson(req, res, 200, {
      ok: false,
      setupNeeded: true,
      storageFallback: true,
      viewer: viewerContext(access),
      error: "comment_storage_update_failed",
      detail: error.message
    }, ["GET", "POST", "PATCH", "DELETE", "OPTIONS"]);
    return false;
  }
}

async function deleteCommentInStorage(req, res, config, access, targetType, targetKey, commentId) {
  try {
    if (!targetType || !targetKey) throw new Error("missing_target");
    const thread = await readStorageThread(config, targetType, targetKey);
    const canModerate = Boolean(access.canModerate || access.owner || access.moderator);
    const comment = thread.comments.find((row) => row.id === commentId && (canModerate || row.userId === access.userId));
    if (!comment) throw new Error("comment_not_found");
    comment.deletedAt = new Date().toISOString();
    comment.deletedBy = access.userId;
    comment.moderated = Boolean(canModerate && comment.userId !== access.userId);
    comment.updatedAt = comment.deletedAt;
    await writeStorageThread(config, thread);
    sendJson(req, res, 200, {
      ok: true,
      storageFallback: true,
      viewer: viewerContext(access)
    }, ["GET", "POST", "PATCH", "DELETE", "OPTIONS"]);
    return true;
  } catch (error) {
    sendJson(req, res, 200, {
      ok: false,
      setupNeeded: true,
      storageFallback: true,
      viewer: viewerContext(access),
      error: "comment_storage_delete_failed",
      detail: error.message
    }, ["GET", "POST", "PATCH", "DELETE", "OPTIONS"]);
    return false;
  }
}

async function reactToCommentInStorage(req, res, config, access, targetType, targetKey, commentId, value) {
  try {
    if (!targetType || !targetKey) throw new Error("missing_target");
    const thread = await readStorageThread(config, targetType, targetKey);
    const comment = thread.comments.find((row) => row.id === commentId && !row.deletedAt);
    if (!comment) throw new Error("comment_not_found");
    const reactionsByUser = comment.reactionsByUser && typeof comment.reactionsByUser === "object"
      ? comment.reactionsByUser
      : {};
    if (!value) delete reactionsByUser[access.userId];
    else reactionsByUser[access.userId] = value > 0 ? 1 : -1;
    comment.reactionsByUser = reactionsByUser;
    comment.updatedAt = new Date().toISOString();
    await writeStorageThread(config, thread);
    sendJson(req, res, 200, {
      ok: true,
      storageFallback: true,
      viewer: viewerContext(access)
    }, ["GET", "POST", "PATCH", "DELETE", "OPTIONS"]);
    return true;
  } catch (error) {
    sendJson(req, res, 200, {
      ok: false,
      setupNeeded: true,
      storageFallback: true,
      viewer: viewerContext(access),
      error: "comment_storage_reaction_failed",
      detail: error.message
    }, ["GET", "POST", "PATCH", "DELETE", "OPTIONS"]);
    return false;
  }
}

function requestTargetFromBodyOrQuery(req, body = {}) {
  return {
    targetType: normalizeTargetType(body.targetType || body.target_type || req.query?.targetType || req.query?.target_type),
    targetKey: normalizeTargetKey(body.targetKey || body.target_key || req.query?.targetKey || req.query?.target_key)
  };
}

async function fetchProfiles(config, userIds = []) {
  const ids = Array.from(new Set(userIds.map((id) => String(id || "").trim()).filter(Boolean)));
  if (!ids.length) return new Map();
  try {
    const params = new URLSearchParams({
      id: `in.(${urlList(ids)})`,
      select: "id,username,display_name,avatar_url",
      limit: String(Math.min(ids.length, COMMENT_LIMIT))
    });
    const rows = await supabaseRest(config, `profiles?${params.toString()}`);
    return new Map((Array.isArray(rows) ? rows : []).map((row) => [row.id, publicProfile(row)]));
  } catch (_error) {
    return new Map();
  }
}

async function fetchReactionSummary(config, commentIds = [], currentUserId = "") {
  const ids = Array.from(new Set(commentIds.map((id) => String(id || "").trim()).filter(Boolean)));
  const summary = new Map(ids.map((id) => [id, { likes: 0, dislikes: 0, myReaction: 0 }]));
  if (!ids.length) return { enabled: true, summary };
  try {
    const params = new URLSearchParams({
      comment_id: `in.(${urlList(ids)})`,
      select: "comment_id,user_id,value",
      limit: "1000"
    });
    const rows = await supabaseRest(config, `comment_reactions?${params.toString()}`);
    (Array.isArray(rows) ? rows : []).forEach((row) => {
      const item = summary.get(row.comment_id);
      if (!item) return;
      const value = Number(row.value) || 0;
      if (value > 0) item.likes += 1;
      if (value < 0) item.dislikes += 1;
      if (currentUserId && row.user_id === currentUserId) item.myReaction = value > 0 ? 1 : value < 0 ? -1 : 0;
    });
    return { enabled: true, summary };
  } catch (error) {
    if (setupNeededFromError(error.message)) return { enabled: false, summary };
    throw error;
  }
}

async function fetchCommentsForTarget(config, params) {
  const withVisibleStatus = new URLSearchParams(params);
  withVisibleStatus.set("status", "eq.visible");
  try {
    return await supabaseRest(config, `comments?${withVisibleStatus.toString()}`);
  } catch (error) {
    if (!/status|column/i.test(String(error.message || ""))) throw error;
    return supabaseRest(config, `comments?${params.toString()}`);
  }
}

function serializeComment(row = {}, profiles = new Map(), reactions = new Map(), currentUserId = "") {
  const profile = profiles.get(row.user_id) || publicProfile(row);
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
    const comments = Array.isArray(rows) ? rows : [];
    const [profiles, reactions] = await Promise.all([
      fetchProfiles(config, comments.map((row) => row.user_id)),
      fetchReactionSummary(config, comments.map((row) => row.id), access.userId)
    ]);
    sendJson(req, res, 200, {
      ok: true,
      enabled: true,
      targetType,
      targetKey,
      reactionsEnabled: reactions.enabled,
      viewer: viewerContext(access),
      comments: comments.map((row) => serializeComment(row, profiles, reactions.summary, access.userId))
    }, ["GET", "POST", "PATCH", "DELETE", "OPTIONS"]);
  } catch (error) {
    if (setupNeededFromError(error.message)) {
      await listCommentsFromStorage(req, res, config, access, targetType, targetKey);
      return;
    }
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

  const metadata = body.metadata && typeof body.metadata === "object" ? body.metadata : {};
  const baseRow = {
    user_id: access.userId,
    target_type: targetType,
    target_key: targetKey,
    body: text
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
    let rows;
    try {
      rows = await supabaseRest(config, "comments", {
        method: "POST",
        prefer: "return=representation",
        body: [richRow]
      });
    } catch (error) {
      if (!/metadata|schema cache|column/i.test(String(error.message || ""))) throw error;
      rows = await supabaseRest(config, "comments", {
        method: "POST",
        prefer: "return=representation",
        body: [baseRow]
      });
    }
    const comment = Array.isArray(rows) ? rows[0] : null;
    const profile = publicProfile({
      id: access.userId,
      username: metadata.username || "",
      display_name: metadata.displayName || access.email || normalizeEmail(access.email) || "Sonic listener"
    });
    await insertActivity(config, access, comment, metadata);
    sendJson(req, res, 200, {
      ok: true,
      enabled: true,
      viewer: viewerContext(access),
      comment: serializeComment(comment, new Map([[access.userId, profile]]), new Map(), access.userId)
    }, ["GET", "POST", "PATCH", "DELETE", "OPTIONS"]);
  } catch (error) {
    if (setupNeededFromError(error.message)) {
      await createCommentInStorage(req, res, config, access, body, targetType, targetKey, text, metadata);
      return;
    }
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
  try {
    const params = new URLSearchParams({
      id: `eq.${commentId}`,
      user_id: `eq.${access.userId}`
    });
    const rows = await supabaseRest(config, `comments?${params.toString()}`, {
      method: "PATCH",
      prefer: "return=representation",
      body: { body: text, updated_at: new Date().toISOString() }
    });
    sendJson(req, res, 200, {
      ok: true,
      viewer: viewerContext(access),
      comment: Array.isArray(rows) ? rows[0] : null
    }, ["GET", "POST", "PATCH", "DELETE", "OPTIONS"]);
  } catch (error) {
    if (setupNeededFromError(error.message)) {
      const { targetType, targetKey } = requestTargetFromBodyOrQuery(req, body);
      await updateCommentInStorage(req, res, config, access, targetType, targetKey, commentId, text);
      return;
    }
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
  try {
    const rows = await supabaseRest(config, `comments?${params.toString()}`, {
      method: "PATCH",
      prefer: "return=representation",
      body: {
        status: "deleted",
        deleted_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }
    });
    return Array.isArray(rows) ? rows : [];
  } catch (error) {
    if (!/status|deleted_at|updated_at|schema cache|column/i.test(String(error.message || ""))) throw error;
    const deleted = await supabaseRest(config, `comments?${params.toString()}`, {
      method: "DELETE",
      prefer: "return=representation"
    });
    return Array.isArray(deleted) ? deleted : [];
  }
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
    if (setupNeededFromError(error.message)) {
      const { targetType, targetKey } = requestTargetFromBodyOrQuery(req, body);
      await deleteCommentInStorage(req, res, config, access, targetType, targetKey, commentId);
      return;
    }
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
    if (setupNeededFromError(error.message)) {
      const { targetType, targetKey } = requestTargetFromBodyOrQuery(req, body);
      await reactToCommentInStorage(req, res, config, access, targetType, targetKey, commentId, value);
      return;
    }
    sendJson(req, res, setupNeededFromError(error.message) ? 200 : 500, {
      ok: false,
      setupNeeded: setupNeededFromError(error.message),
      error: "comment_reaction_failed",
      detail: error.message
    }, ["GET", "POST", "PATCH", "DELETE", "OPTIONS"]);
  }
}

module.exports = async function handler(req, res) {
  const methods = ["GET", "POST", "PATCH", "DELETE", "OPTIONS"];
  if (!requireMusicApi(req, res, {
    methods: ["GET", "POST", "PATCH", "DELETE"],
    feature: "comments",
    enabledEnv: "SONIC_SOCIAL_COMMENTS_ENABLED",
    defaultEnabled: true,
    allowGlobalFallback: false,
    dailyLimitEnv: "SONIC_SOCIAL_COMMENTS_DAILY_LIMIT",
    defaultDailyLimit: 160,
    budgetOnStart: false
  })) return;

  if (!await enforceDurableMusicDailyLimit(req, res, {
    feature: "comments",
    dailyLimitEnv: "SONIC_SOCIAL_COMMENTS_DAILY_LIMIT",
    defaultDailyLimit: 160,
    methods
  })) return;

  const config = supabaseConfig();
  if (!config.enabled) {
    sendJson(req, res, 200, { ok: true, enabled: false, comments: [] }, methods);
    return;
  }

  const body = parseBody(req);
  const access = await resolveAccessContext(req, body);

  if (req.method === "GET") {
    await listComments(req, res, config, access);
    return;
  }
  if (req.method === "POST") {
    const action = String(body.action || req.query?.action || "").trim().toLowerCase();
    if (action === "react") {
      await reactToComment(req, res, config, access, body);
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
