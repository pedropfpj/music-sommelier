const crypto = require("node:crypto");

const MODERATION_BUCKET = "sonic-social-comments";
const MODERATION_REPORTS_PREFIX = "moderation/v1/reports";
const MODERATION_BLOCKS_PREFIX = "moderation/v1/blocks";
const MAX_BLOCKED_USERS = 500;

const OBJECTIONABLE_PATTERNS = [
  {
    code: "sexual_content_involving_minors",
    pattern: /\b(?:child|children|minor|underage|crianca|criancas|menor|menores|nino|nina|menor de idade)\b.{0,36}\b(?:porn|porno|nude|nudes|nudez|sex|sexo|sexual)\b/i
  },
  {
    code: "credible_violent_threat",
    pattern: /\b(?:i\s*(?:will|'ll)|im going to|vou|vamos|eu vou|voy a|te voy a)\s+(?:te\s+|you\s+|lo\s+|la\s+)?(?:kill|murder|matar|assassinar|asesinar)\b/i
  },
  {
    code: "sexual_violence",
    pattern: /\b(?:rape|raping|estuprar|estupro|violacion sexual|violar sexualmente)\b/i
  },
  {
    code: "hateful_harassment",
    pattern: /\b(?:heil\s+hitler|white\s+power|gas\s+the\s+jews|exterminate\s+(?:all\s+)?(?:jews|blacks|gays)|exterminar\s+(?:todos\s+os\s+)?(?:judeus|negros|gays))\b/i
  }
];

function normalizedModerationText(values = []) {
  return (Array.isArray(values) ? values : [values])
    .map((value) => String(value ?? ""))
    .join("\n")
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[\u200B-\u200D\uFEFF]/g, "")
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, 5000);
}

function assessUserGeneratedText(values = []) {
  const text = normalizedModerationText(values);
  if (!text) return { allowed: true, code: "clean" };

  const urls = text.match(/https?:\/\/|www\./gi) || [];
  if (urls.length > 3) return { allowed: false, code: "link_spam" };
  if (/(.)\1{29,}/i.test(text)) return { allowed: false, code: "character_spam" };

  const matched = OBJECTIONABLE_PATTERNS.find((entry) => entry.pattern.test(text));
  if (matched) return { allowed: false, code: matched.code };
  return { allowed: true, code: "clean" };
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
  const raw = await response.text();
  let payload = null;
  if (raw) {
    try {
      payload = JSON.parse(raw);
    } catch {
      payload = raw;
    }
  }
  return { response, payload };
}

async function ensureModerationBucket(config) {
  const read = await storageFetch(config, `bucket/${MODERATION_BUCKET}`);
  if (read.response.ok) return true;
  if (![400, 404].includes(read.response.status)) {
    throw new Error(String(read.payload?.message || read.payload?.error || "moderation_bucket_lookup_failed"));
  }
  const create = await storageFetch(config, "bucket", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      id: MODERATION_BUCKET,
      name: MODERATION_BUCKET,
      public: false,
      file_size_limit: 5242880
    })
  });
  if (create.response.ok || create.response.status === 409) return true;
  throw new Error(String(create.payload?.message || create.payload?.error || "moderation_bucket_create_failed"));
}

function privateUserKey(userId = "") {
  return crypto.createHash("sha256").update(String(userId || "")).digest("hex").slice(0, 48);
}

async function readPrivateJson(config, objectPath) {
  await ensureModerationBucket(config);
  const result = await storageFetch(config, `object/${MODERATION_BUCKET}/${objectPath}`, {
    headers: { Accept: "application/json" }
  });
  if ([400, 404].includes(result.response.status)) return null;
  if (!result.response.ok) {
    throw new Error(String(result.payload?.message || result.payload?.error || "moderation_object_read_failed"));
  }
  return result.payload && typeof result.payload === "object" ? result.payload : null;
}

async function writePrivateJson(config, objectPath, payload, { upsert = true } = {}) {
  await ensureModerationBucket(config);
  const result = await storageFetch(config, `object/${MODERATION_BUCKET}/${objectPath}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-upsert": upsert ? "true" : "false"
    },
    body: JSON.stringify(payload)
  });
  if (result.response.ok) return true;
  throw new Error(String(result.payload?.message || result.payload?.error || "moderation_object_write_failed"));
}

async function readBlockedUserIds(config, viewerUserId = "") {
  const userId = String(viewerUserId || "").trim();
  if (!userId) return [];
  const objectPath = `${MODERATION_BLOCKS_PREFIX}/${privateUserKey(userId)}.json`;
  const record = await readPrivateJson(config, objectPath);
  return Array.from(new Set(
    (Array.isArray(record?.blockedUserIds) ? record.blockedUserIds : [])
      .map((value) => String(value || "").trim())
      .filter((value) => value && value !== userId)
  )).slice(0, MAX_BLOCKED_USERS);
}

async function setBlockedUser(config, viewerUserId = "", targetUserId = "", blocked = true) {
  const userId = String(viewerUserId || "").trim();
  const targetId = String(targetUserId || "").trim();
  if (!userId || !targetId || userId === targetId) throw new Error("invalid_block_target");
  const current = new Set(await readBlockedUserIds(config, userId));
  if (blocked) current.add(targetId);
  else current.delete(targetId);
  const blockedUserIds = Array.from(current).slice(0, MAX_BLOCKED_USERS);
  const objectPath = `${MODERATION_BLOCKS_PREFIX}/${privateUserKey(userId)}.json`;
  await writePrivateJson(config, objectPath, {
    version: 1,
    userId,
    blockedUserIds,
    updatedAt: new Date().toISOString()
  });
  return blockedUserIds;
}

async function createModerationReport(config, input = {}) {
  const reporterUserId = String(input.reporterUserId || "").trim();
  const targetType = String(input.targetType || "").trim().toLowerCase().slice(0, 40);
  const targetId = String(input.targetId || "").trim().slice(0, 120);
  if (!reporterUserId || !targetType || !targetId) throw new Error("invalid_report_target");

  const id = crypto.randomUUID();
  const createdAt = new Date().toISOString();
  const report = {
    version: 1,
    id,
    status: "open",
    reporterUserId,
    reporter: input.reporter && typeof input.reporter === "object" ? input.reporter : {},
    targetType,
    targetId,
    targetAuthorId: String(input.targetAuthorId || "").trim().slice(0, 120),
    parentType: String(input.parentType || "").trim().slice(0, 40),
    parentKey: String(input.parentKey || "").trim().slice(0, 240),
    reason: String(input.reason || "inappropriate_content").trim().slice(0, 120),
    excerpt: String(input.excerpt || "").trim().slice(0, 500),
    createdAt
  };
  const day = createdAt.slice(0, 10);
  await writePrivateJson(config, `${MODERATION_REPORTS_PREFIX}/${day}/${id}.json`, report, { upsert: false });
  return report;
}

module.exports = {
  assessUserGeneratedText,
  createModerationReport,
  normalizedModerationText,
  readBlockedUserIds,
  setBlockedUser
};
