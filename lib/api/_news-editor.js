const crypto = require("node:crypto");
const { resolveAccessContext } = require("./_access-control");
const { sendJson } = require("./_music-apis");
const { requestBodyTooLarge, setCorsHeaders } = require("./_request-security");

const ALLOWED_METHODS = ["GET", "POST", "PATCH", "OPTIONS"];
const ARTICLE_STATUSES = new Set(["draft", "scheduled", "published", "archived"]);
const NEWS_MEDIA_BUCKET = "news-media";
const MAX_IMAGE_BYTES = 1572864;
const PUBLIC_FIELDS = [
  "id",
  "slug",
  "status",
  "category",
  "eyebrow",
  "title",
  "excerpt",
  "body",
  "cover_image_url",
  "cover_image_alt",
  "image_credit",
  "author_name",
  "venue_name",
  "city",
  "state",
  "event_starts_at",
  "event_ends_at",
  "lineup",
  "service_info",
  "ticket_url",
  "instagram_url",
  "cta_label",
  "is_sponsored",
  "disclosure",
  "published_at",
  "created_at",
  "updated_at"
].join(",");

function envText(name, fallback = "") {
  const value = String(process.env[name] || "").trim();
  return value || fallback;
}

function supabaseConfig() {
  const url = envText("SUPABASE_URL").replace(/\/+$/, "");
  const serviceKey =
    envText("SUPABASE_SERVICE_ROLE_KEY") ||
    envText("SUPABASE_SERVICE_KEY") ||
    envText("SUPABASE_SERVICE_ROLE");
  return { enabled: Boolean(url && serviceKey), url, serviceKey };
}

function parseBody(req) {
  if (req?.body && typeof req.body === "object") return req.body;
  if (typeof req?.body !== "string") return {};
  try {
    return JSON.parse(req.body);
  } catch (_error) {
    return {};
  }
}

function queryValue(req, key) {
  const direct = req?.query?.[key];
  if (Array.isArray(direct)) return String(direct[0] || "").trim();
  if (direct !== undefined) return String(direct || "").trim();
  try {
    const url = new URL(req?.url || "", `https://${req?.headers?.host || "sonicsearch.app"}`);
    return String(url.searchParams.get(key) || "").trim();
  } catch (_error) {
    return "";
  }
}

function trimText(value, maxLength = 400) {
  return String(value || "").replace(/\s+/g, " ").trim().slice(0, maxLength);
}

function longText(value, maxLength = 24000) {
  return String(value || "")
    .replace(/\r\n?/g, "\n")
    .replace(/[ \t]+\n/g, "\n")
    .replace(/\n{4,}/g, "\n\n\n")
    .trim()
    .slice(0, maxLength);
}

function safeUrl(value = "") {
  const raw = String(value || "").trim().slice(0, 1600);
  if (!raw) return "";
  try {
    const parsed = new URL(raw);
    return ["https:", "http:"].includes(parsed.protocol) ? parsed.toString() : "";
  } catch (_error) {
    return "";
  }
}

function isoDate(value = "") {
  const raw = String(value || "").trim();
  if (!raw) return null;
  const date = new Date(raw);
  return Number.isFinite(date.getTime()) ? date.toISOString() : null;
}

function slugify(value = "") {
  return String(value || "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 90);
}

function generatedSlug(title = "") {
  const base = slugify(title) || "materia-sonic";
  const date = new Date().toISOString().replace(/[-:TZ.]/g, "").slice(0, 12);
  return `${base}-${date}-${crypto.randomBytes(3).toString("hex")}`;
}

function normalizeLineup(value) {
  const input = Array.isArray(value) ? value : [];
  return input.slice(0, 80).map((entry) => {
    if (typeof entry === "string") return { name: trimText(entry, 120), time: "", role: "" };
    return {
      name: trimText(entry?.name, 120),
      time: trimText(entry?.time, 40),
      role: trimText(entry?.role, 80)
    };
  }).filter((entry) => entry.name);
}

function normalizeArticleMedia(value) {
  const input = Array.isArray(value) ? value : [];
  return input.slice(0, 8).map((entry) => {
    const afterParagraph = Number.parseInt(entry?.afterParagraph, 10);
    return {
      url: safeUrl(entry?.url),
      alt: trimText(entry?.alt, 240),
      caption: trimText(entry?.caption, 320),
      credit: trimText(entry?.credit, 180),
      afterParagraph: Number.isFinite(afterParagraph) ? Math.max(1, Math.min(100, afterParagraph)) : 1
    };
  }).filter((entry) => entry.url);
}

function normalizeArticleLinks(value) {
  const input = Array.isArray(value) ? value : [];
  return input.slice(0, 8).map((entry) => ({
    label: trimText(entry?.label, 80),
    url: safeUrl(entry?.url)
  })).filter((entry) => entry.label && entry.url);
}

function normalizeServiceInfo(value) {
  const info = value && typeof value === "object" && !Array.isArray(value) ? value : {};
  return {
    address: trimText(info.address, 280),
    price: trimText(info.price, 160),
    ageRating: trimText(info.ageRating, 80),
    doorsTime: trimText(info.doorsTime, 80),
    instagramLabel: trimText(info.instagramLabel, 80),
    notes: longText(info.notes, 1200),
    media: normalizeArticleMedia(info.media),
    relatedLinks: normalizeArticleLinks(info.relatedLinks)
  };
}

function articleInput(body = {}, { partial = false, userId = "" } = {}) {
  const source = body?.article && typeof body.article === "object" ? body.article : body;
  const output = {};
  const assign = (key, value) => {
    if (!partial || Object.prototype.hasOwnProperty.call(source, key)) output[key] = value;
  };

  assign("category", trimText(source.category, 80) || "Agenda");
  assign("eyebrow", trimText(source.eyebrow, 80) || "Jornal Sonic");
  assign("title", trimText(source.title, 180));
  assign("excerpt", longText(source.excerpt, 520));
  assign("body", longText(source.body, 24000));
  assign("cover_image_url", safeUrl(source.coverImageUrl));
  assign("cover_image_alt", trimText(source.coverImageAlt, 240));
  assign("image_credit", trimText(source.imageCredit, 180));
  assign("author_name", trimText(source.authorName, 120) || "Redacao Sonic Search");
  assign("venue_name", trimText(source.venueName, 180));
  assign("city", trimText(source.city, 100));
  assign("state", trimText(source.state, 80));
  assign("event_starts_at", isoDate(source.eventStartsAt));
  assign("event_ends_at", isoDate(source.eventEndsAt));
  assign("lineup", normalizeLineup(source.lineup));
  assign("service_info", normalizeServiceInfo(source.serviceInfo));
  assign("ticket_url", safeUrl(source.ticketUrl));
  assign("instagram_url", safeUrl(source.instagramUrl));
  assign("cta_label", trimText(source.ctaLabel, 60) || "Ver evento");
  assign("is_sponsored", Boolean(source.isSponsored));
  assign("disclosure", longText(source.disclosure, 320));

  if (!partial || Object.prototype.hasOwnProperty.call(source, "status")) {
    const requestedStatus = trimText(source.status, 30).toLowerCase();
    output.status = ARTICLE_STATUSES.has(requestedStatus) ? requestedStatus : "draft";
  }
  if (!partial || Object.prototype.hasOwnProperty.call(source, "publishedAt")) {
    output.published_at = isoDate(source.publishedAt);
  }
  if (!partial || Object.prototype.hasOwnProperty.call(source, "slug")) {
    output.slug = slugify(source.slug) || generatedSlug(source.title);
  }
  if (userId) output[partial ? "updated_by" : "created_by"] = userId;
  if (!partial && userId) output.updated_by = userId;

  if (output.status === "published" && !output.published_at) output.published_at = new Date().toISOString();
  if (output.status === "scheduled" && !output.published_at) output.published_at = new Date().toISOString();
  return output;
}

function validateArticle(article = {}, { partial = false } = {}) {
  if ((!partial || Object.prototype.hasOwnProperty.call(article, "title")) && !article.title) {
    return "title_required";
  }
  const publishing = ["published", "scheduled"].includes(article.status);
  if (publishing && !article.excerpt) return "excerpt_required_for_publication";
  if (publishing && !article.body) return "body_required_for_publication";
  if (article.status === "scheduled" && !article.published_at) return "publication_date_required";
  if (article.event_starts_at && article.event_ends_at) {
    if (new Date(article.event_ends_at) < new Date(article.event_starts_at)) return "event_end_before_start";
  }
  return "";
}

function publicArticle(row = {}) {
  return {
    id: row.id,
    slug: row.slug,
    status: row.status,
    category: row.category,
    eyebrow: row.eyebrow,
    title: row.title,
    excerpt: row.excerpt,
    body: row.body,
    coverImageUrl: row.cover_image_url,
    coverImageAlt: row.cover_image_alt,
    imageCredit: row.image_credit,
    authorName: row.author_name,
    venueName: row.venue_name,
    city: row.city,
    state: row.state,
    eventStartsAt: row.event_starts_at,
    eventEndsAt: row.event_ends_at,
    lineup: Array.isArray(row.lineup) ? row.lineup : [],
    serviceInfo: row.service_info && typeof row.service_info === "object" ? row.service_info : {},
    ticketUrl: row.ticket_url,
    instagramUrl: row.instagram_url,
    ctaLabel: row.cta_label,
    isSponsored: Boolean(row.is_sponsored),
    disclosure: row.disclosure,
    publishedAt: row.published_at,
    createdAt: row.created_at,
    updatedAt: row.updated_at
  };
}

async function supabaseRequest(config, path, options = {}) {
  const response = await fetch(`${config.url}${path}`, {
    ...options,
    headers: {
      apikey: config.serviceKey,
      Authorization: `Bearer ${config.serviceKey}`,
      Accept: "application/json",
      ...(options.headers || {})
    }
  });
  const text = await response.text();
  let payload = null;
  try {
    payload = text ? JSON.parse(text) : null;
  } catch (_error) {
    payload = text;
  }
  if (!response.ok) {
    const error = new Error(String(payload?.message || payload?.error || `supabase_http_${response.status}`));
    error.status = response.status;
    error.code = String(payload?.code || "");
    throw error;
  }
  return payload;
}

async function requireAdmin(req, res, body = {}) {
  const access = await resolveAccessContext(req, body);
  if (!access.authenticated) {
    sendJson(req, res, 401, { ok: false, error: "login_required" }, ALLOWED_METHODS);
    return null;
  }
  if (!access.canAccessAdmin) {
    sendJson(req, res, 403, { ok: false, error: "admin_required" }, ALLOWED_METHODS);
    return null;
  }
  return access;
}

function newsTablePath(params) {
  return `/rest/v1/news_articles?${params.toString()}`;
}

async function listArticles(req, res, config) {
  const adminScope = queryValue(req, "scope") === "admin";
  let access = null;
  if (adminScope) {
    access = await requireAdmin(req, res);
    if (!access) return;
  }
  const params = new URLSearchParams();
  params.set("select", PUBLIC_FIELDS);
  params.set("order", adminScope ? "updated_at.desc" : "published_at.desc");
  params.set("limit", String(Math.max(1, Math.min(100, Number.parseInt(queryValue(req, "limit") || "20", 10) || 20))));
  if (!adminScope) {
    params.set("status", "in.(published,scheduled)");
    params.set("published_at", `lte.${new Date().toISOString()}`);
  }
  const rows = await supabaseRequest(config, newsTablePath(params), { method: "GET" });
  res.setHeader("Cache-Control", adminScope ? "private, no-store" : "public, max-age=60, s-maxage=300, stale-while-revalidate=600");
  sendJson(req, res, 200, {
    ok: true,
    articles: Array.isArray(rows) ? rows.map(publicArticle) : [],
    viewer: adminScope ? { email: access.email, role: access.role } : undefined
  }, ALLOWED_METHODS);
}

async function createArticle(req, res, config, body) {
  const access = await requireAdmin(req, res, body);
  if (!access) return;
  const article = articleInput(body, { userId: access.userId });
  const validationError = validateArticle(article);
  if (validationError) {
    sendJson(req, res, 400, { ok: false, error: validationError }, ALLOWED_METHODS);
    return;
  }
  const params = new URLSearchParams({ select: PUBLIC_FIELDS });
  const rows = await supabaseRequest(config, newsTablePath(params), {
    method: "POST",
    headers: { "Content-Type": "application/json", Prefer: "return=representation" },
    body: JSON.stringify(article)
  });
  sendJson(req, res, 201, { ok: true, article: publicArticle(rows?.[0] || {}) }, ALLOWED_METHODS);
}

async function updateArticle(req, res, config, body) {
  const access = await requireAdmin(req, res, body);
  if (!access) return;
  const id = trimText(body?.id || body?.articleId, 80);
  if (!/^[0-9a-f-]{36}$/i.test(id)) {
    sendJson(req, res, 400, { ok: false, error: "article_id_required" }, ALLOWED_METHODS);
    return;
  }
  const article = articleInput(body, { partial: true, userId: access.userId });
  delete article.slug;
  const validationError = validateArticle(article, { partial: true });
  if (validationError) {
    sendJson(req, res, 400, { ok: false, error: validationError }, ALLOWED_METHODS);
    return;
  }
  const params = new URLSearchParams({ id: `eq.${id}`, select: PUBLIC_FIELDS });
  const rows = await supabaseRequest(config, newsTablePath(params), {
    method: "PATCH",
    headers: { "Content-Type": "application/json", Prefer: "return=representation" },
    body: JSON.stringify(article)
  });
  if (!Array.isArray(rows) || !rows.length) {
    sendJson(req, res, 404, { ok: false, error: "article_not_found" }, ALLOWED_METHODS);
    return;
  }
  sendJson(req, res, 200, { ok: true, article: publicArticle(rows[0]) }, ALLOWED_METHODS);
}

function imagePayload(body = {}) {
  const match = String(body.fileDataUrl || "").match(/^data:(image\/(?:jpeg|png|webp));base64,([a-z0-9+/=\s]+)$/i);
  if (!match) return { error: "invalid_image" };
  const buffer = Buffer.from(match[2].replace(/\s/g, ""), "base64");
  if (!buffer.length || buffer.length > MAX_IMAGE_BYTES) return { error: "image_too_large" };
  const mime = match[1].toLowerCase();
  const extension = mime === "image/png" ? "png" : mime === "image/webp" ? "webp" : "jpg";
  return { buffer, mime, extension };
}

async function uploadCover(req, res, config, body) {
  const access = await requireAdmin(req, res, body);
  if (!access) return;
  const image = imagePayload(body);
  if (image.error) {
    sendJson(req, res, 400, { ok: false, error: image.error, maxBytes: MAX_IMAGE_BYTES }, ALLOWED_METHODS);
    return;
  }
  const safeBase = slugify(String(body.fileName || "capa").replace(/\.[^.]+$/, "")) || "capa";
  const month = new Date().toISOString().slice(0, 7);
  const unique = crypto.randomBytes(6).toString("hex");
  const objectPath = `${month}/${Date.now()}-${unique}-${safeBase}.${image.extension}`;
  const encodedPath = objectPath.split("/").map(encodeURIComponent).join("/");
  await supabaseRequest(config, `/storage/v1/object/${NEWS_MEDIA_BUCKET}/${encodedPath}`, {
    method: "POST",
    headers: {
      "Content-Type": image.mime,
      "x-upsert": "false"
    },
    body: image.buffer
  });
  const publicUrl = `${config.url}/storage/v1/object/public/${NEWS_MEDIA_BUCKET}/${encodedPath}`;
  sendJson(req, res, 201, { ok: true, url: publicUrl, path: objectPath }, ALLOWED_METHODS);
}

function setupError(error) {
  const text = `${error?.code || ""} ${error?.message || ""}`.toLowerCase();
  return error?.status === 404 || text.includes("news_articles") || text.includes("news-media");
}

module.exports = async function handler(req, res) {
  setCorsHeaders(req, res, {
    originEnvNames: ["SONIC_MUSIC_ALLOWED_ORIGINS", "SONIC_AI_ALLOWED_ORIGINS"],
    methods: ALLOWED_METHODS,
    allowedHeaders: "Content-Type, Authorization, X-Sonic-Auth-Token"
  });
  if (req.method === "OPTIONS") {
    res.statusCode = 204;
    res.end();
    return;
  }
  if (!ALLOWED_METHODS.includes(req.method)) {
    sendJson(req, res, 405, { ok: false, error: "method_not_allowed" }, ALLOWED_METHODS);
    return;
  }
  if (requestBodyTooLarge(req, 2300000)) {
    sendJson(req, res, 413, { ok: false, error: "request_body_too_large" }, ALLOWED_METHODS);
    return;
  }
  const config = supabaseConfig();
  if (!config.enabled) {
    sendJson(req, res, 503, { ok: false, error: "newsroom_not_configured" }, ALLOWED_METHODS);
    return;
  }

  const body = parseBody(req);
  try {
    if (req.method === "GET") {
      await listArticles(req, res, config);
      return;
    }
    if (req.method === "POST" && body.action === "upload-cover") {
      await uploadCover(req, res, config, body);
      return;
    }
    if (req.method === "POST") {
      await createArticle(req, res, config, body);
      return;
    }
    await updateArticle(req, res, config, body);
  } catch (error) {
    const status = error?.status === 409 || error?.code === "23505" ? 409 : setupError(error) ? 503 : 502;
    const publicError = status === 409 ? "article_slug_conflict" : status === 503 ? "newsroom_setup_required" : "newsroom_request_failed";
    console.error("Newsroom request failed", error);
    sendJson(req, res, status, { ok: false, error: publicError }, ALLOWED_METHODS);
  }
};
