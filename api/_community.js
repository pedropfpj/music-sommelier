const { normalizeEmail, resolveAccessContext } = require("./_access-control");
const { envText, parseBody, sendJson, trimText } = require("./_music-apis");
const crypto = require("node:crypto");

const COMMUNITY_BUCKET = "sonic-social-comments";
const COMMUNITY_FEED_PATH = "community/v1/feed.json";
const COMMUNITY_LIMIT = 60;
const MAX_TITLE_LENGTH = 120;
const MAX_BODY_LENGTH = 1000;
const MAX_META_LENGTH = 160;
const ALLOWED_TOPICS = new Set(["track", "artist", "event", "festival", "question", "id"]);

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

function normalizeTopic(value = "") {
  const topic = String(value || "").trim().toLowerCase();
  return ALLOWED_TOPICS.has(topic) ? topic : "question";
}

function normalizeFilter(value = "") {
  const filter = String(value || "").trim().toLowerCase();
  if (filter === "all") return "all";
  return ALLOWED_TOPICS.has(filter) ? filter : "all";
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

async function ensureCommunityBucket(config) {
  const read = await storageFetch(config, `bucket/${COMMUNITY_BUCKET}`);
  if (read.response.ok) return true;
  if (![400, 404].includes(read.response.status)) {
    const detail = read.payload?.message || read.payload?.error || read.response.statusText;
    throw new Error(String(detail || "community_bucket_lookup_failed"));
  }
  const create = await storageFetch(config, "bucket", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      id: COMMUNITY_BUCKET,
      name: COMMUNITY_BUCKET,
      public: false,
      file_size_limit: 5242880
    })
  });
  if (create.response.ok || create.response.status === 409) return true;
  const detail = create.payload?.message || create.payload?.error || create.response.statusText;
  throw new Error(String(detail || "community_bucket_create_failed"));
}

function emptyFeed() {
  return {
    version: 1,
    posts: []
  };
}

async function readFeed(config) {
  await ensureCommunityBucket(config);
  const result = await storageFetch(config, `object/${COMMUNITY_BUCKET}/${COMMUNITY_FEED_PATH}`, {
    headers: { Accept: "application/json" }
  });
  if (result.response.status === 404 || result.response.status === 400) return emptyFeed();
  if (!result.response.ok) {
    const detail = result.payload?.message || result.payload?.error || result.response.statusText;
    throw new Error(String(detail || "community_feed_read_failed"));
  }
  const doc = result.payload && typeof result.payload === "object" ? result.payload : {};
  return {
    ...emptyFeed(),
    ...doc,
    posts: Array.isArray(doc.posts) ? doc.posts : []
  };
}

async function writeFeed(config, feed = {}) {
  await ensureCommunityBucket(config);
  const result = await storageFetch(config, `object/${COMMUNITY_BUCKET}/${COMMUNITY_FEED_PATH}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-upsert": "true"
    },
    body: JSON.stringify({
      version: 1,
      updatedAt: new Date().toISOString(),
      posts: Array.isArray(feed.posts) ? feed.posts.slice(0, 300) : []
    })
  });
  if (result.response.ok) return true;
  const detail = result.payload?.message || result.payload?.error || result.response.statusText;
  throw new Error(String(detail || "community_feed_write_failed"));
}

function authorFromMetadata(access, metadata = {}) {
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
    id: access.userId || "",
    username,
    displayName,
    avatarUrl: trimText(metadata.avatarUrl || metadata.avatar_url || "", 500)
  };
}

function serializePost(row = {}, currentUserId = "") {
  const reactionsByUser = row.reactionsByUser && typeof row.reactionsByUser === "object" ? row.reactionsByUser : {};
  const values = Object.values(reactionsByUser).map((value) => Number(value) || 0);
  const likes = values.filter((value) => value > 0).length;
  const dislikes = values.filter((value) => value < 0).length;
  const myReaction = currentUserId ? Number(reactionsByUser[currentUserId]) || 0 : 0;
  const author = row.author && typeof row.author === "object" ? row.author : {};
  return {
    id: row.id || "",
    topic: normalizeTopic(row.topic || "question"),
    title: trimText(row.title || "", MAX_TITLE_LENGTH),
    body: trimText(row.body || "", MAX_BODY_LENGTH),
    context: trimText(row.context || "", MAX_META_LENGTH),
    createdAt: row.createdAt || "",
    updatedAt: row.updatedAt || "",
    mine: Boolean(currentUserId && row.userId === currentUserId),
    author: {
      id: author.id || row.userId || "",
      username: trimText(author.username || "", 60),
      displayName: trimText(author.displayName || author.display_name || "Sonic listener", 80),
      avatarUrl: trimText(author.avatarUrl || author.avatar_url || "", 500)
    },
    reactions: {
      likes,
      dislikes,
      myReaction: myReaction > 0 ? 1 : myReaction < 0 ? -1 : 0
    },
    commentsTarget: {
      targetType: "post",
      targetKey: row.id || ""
    }
  };
}

async function listPosts(req, res, config, access) {
  try {
    const filter = normalizeFilter(req.query?.topic || req.query?.filter || "all");
    const feed = await readFeed(config);
    const posts = feed.posts
      .filter((post) => !post.deletedAt)
      .filter((post) => filter === "all" || normalizeTopic(post.topic) === filter)
      .sort((a, b) => String(b.createdAt || "").localeCompare(String(a.createdAt || "")))
      .slice(0, COMMUNITY_LIMIT)
      .map((post) => serializePost(post, access.userId));
    sendJson(req, res, 200, {
      ok: true,
      enabled: true,
      filter,
      posts
    }, ["GET", "POST", "DELETE", "OPTIONS"]);
  } catch (error) {
    sendJson(req, res, 200, {
      ok: false,
      enabled: true,
      setupNeeded: true,
      error: "community_load_failed",
      detail: error.message,
      posts: []
    }, ["GET", "POST", "DELETE", "OPTIONS"]);
  }
}

async function createPost(req, res, config, access, body) {
  if (!access.authenticated || !access.userId) {
    sendJson(req, res, 401, { ok: false, error: "login_required" }, ["GET", "POST", "DELETE", "OPTIONS"]);
    return;
  }
  const topic = normalizeTopic(body.topic || body.type);
  const postBody = trimText(body.body || body.text || "", MAX_BODY_LENGTH);
  const title = trimText(body.title || postBody.split(/\n+/)[0] || "", MAX_TITLE_LENGTH);
  if (!postBody) {
    sendJson(req, res, 400, { ok: false, error: "missing_body" }, ["GET", "POST", "DELETE", "OPTIONS"]);
    return;
  }
  try {
    const feed = await readFeed(config);
    const now = new Date().toISOString();
    const metadata = body.metadata && typeof body.metadata === "object" ? body.metadata : {};
    const post = {
      id: crypto.randomUUID(),
      userId: access.userId,
      topic,
      title: title || "Conversa da comunidade",
      body: postBody,
      context: trimText(body.context || body.meta || "", MAX_META_LENGTH),
      author: authorFromMetadata(access, metadata),
      reactionsByUser: {},
      createdAt: now,
      updatedAt: now
    };
    feed.posts = [post, ...feed.posts.filter((item) => item.id !== post.id)].slice(0, 300);
    await writeFeed(config, feed);
    sendJson(req, res, 200, {
      ok: true,
      enabled: true,
      post: serializePost(post, access.userId)
    }, ["GET", "POST", "DELETE", "OPTIONS"]);
  } catch (error) {
    sendJson(req, res, 200, {
      ok: false,
      setupNeeded: true,
      error: "community_create_failed",
      detail: error.message
    }, ["GET", "POST", "DELETE", "OPTIONS"]);
  }
}

async function reactToPost(req, res, config, access, body) {
  if (!access.authenticated || !access.userId) {
    sendJson(req, res, 401, { ok: false, error: "login_required" }, ["GET", "POST", "DELETE", "OPTIONS"]);
    return;
  }
  const postId = trimText(body.postId || body.id || "", 80);
  const value = Number(body.value) > 0 ? 1 : Number(body.value) < 0 ? -1 : 0;
  if (!postId) {
    sendJson(req, res, 400, { ok: false, error: "missing_post_id" }, ["GET", "POST", "DELETE", "OPTIONS"]);
    return;
  }
  try {
    const feed = await readFeed(config);
    const post = feed.posts.find((item) => item.id === postId && !item.deletedAt);
    if (!post) {
      sendJson(req, res, 404, { ok: false, error: "post_not_found" }, ["GET", "POST", "DELETE", "OPTIONS"]);
      return;
    }
    const reactionsByUser = post.reactionsByUser && typeof post.reactionsByUser === "object"
      ? post.reactionsByUser
      : {};
    if (!value) delete reactionsByUser[access.userId];
    else reactionsByUser[access.userId] = value;
    post.reactionsByUser = reactionsByUser;
    post.updatedAt = new Date().toISOString();
    await writeFeed(config, feed);
    sendJson(req, res, 200, {
      ok: true,
      post: serializePost(post, access.userId)
    }, ["GET", "POST", "DELETE", "OPTIONS"]);
  } catch (error) {
    sendJson(req, res, 200, {
      ok: false,
      setupNeeded: true,
      error: "community_reaction_failed",
      detail: error.message
    }, ["GET", "POST", "DELETE", "OPTIONS"]);
  }
}

async function deletePost(req, res, config, access, body) {
  if (!access.authenticated || !access.userId) {
    sendJson(req, res, 401, { ok: false, error: "login_required" }, ["GET", "POST", "DELETE", "OPTIONS"]);
    return;
  }
  const postId = trimText(body.id || body.postId || req.query?.id || "", 80);
  if (!postId) {
    sendJson(req, res, 400, { ok: false, error: "missing_post_id" }, ["GET", "POST", "DELETE", "OPTIONS"]);
    return;
  }
  try {
    const feed = await readFeed(config);
    const before = feed.posts.length;
    feed.posts = feed.posts.filter((post) => !(post.id === postId && post.userId === access.userId));
    if (feed.posts.length === before) {
      sendJson(req, res, 404, { ok: false, error: "post_not_found" }, ["GET", "POST", "DELETE", "OPTIONS"]);
      return;
    }
    await writeFeed(config, feed);
    sendJson(req, res, 200, { ok: true }, ["GET", "POST", "DELETE", "OPTIONS"]);
  } catch (error) {
    sendJson(req, res, 200, {
      ok: false,
      setupNeeded: true,
      error: "community_delete_failed",
      detail: error.message
    }, ["GET", "POST", "DELETE", "OPTIONS"]);
  }
}

module.exports = async function handler(req, res) {
  const methods = ["GET", "POST", "DELETE", "OPTIONS"];
  if (req.method === "OPTIONS") {
    sendJson(req, res, 204, {}, methods);
    return;
  }
  if (!methods.includes(req.method)) {
    sendJson(req, res, 405, { ok: false, error: "method_not_allowed" }, methods);
    return;
  }
  const config = supabaseConfig();
  if (!config.enabled) {
    sendJson(req, res, 200, { ok: true, enabled: false, posts: [] }, methods);
    return;
  }

  const body = parseBody(req);
  const access = await resolveAccessContext(req, body);
  if (req.method === "GET") {
    await listPosts(req, res, config, access);
    return;
  }
  if (req.method === "POST") {
    const action = String(body.action || req.query?.action || "").trim().toLowerCase();
    if (action === "react") {
      await reactToPost(req, res, config, access, body);
      return;
    }
    await createPost(req, res, config, access, body);
    return;
  }
  if (req.method === "DELETE") {
    await deletePost(req, res, config, access, body);
  }
};
