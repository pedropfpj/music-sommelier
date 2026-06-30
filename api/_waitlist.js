const crypto = require("node:crypto");
const {
  envText,
  parseBody,
  requestClientId,
  requireMusicApi,
  sendJson,
  trimText
} = require("./_music-apis");

const ALLOWED_ROLES = new Set(["listener", "dj", "producer", "event", "investor"]);

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

function validEmail(value = "") {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(value || "").trim());
}

function normalizeRole(value = "") {
  const role = trimText(value || "listener", 40).toLowerCase();
  return ALLOWED_ROLES.has(role) ? role : "listener";
}

function clientHash(req) {
  return crypto
    .createHash("sha256")
    .update(requestClientId(req))
    .digest("hex")
    .slice(0, 24);
}

function cleanWaitlistBody(body = {}) {
  const email = trimText(body.email || "", 160).toLowerCase();
  return {
    email,
    name: trimText(body.name || "", 80),
    role: normalizeRole(body.role || body.profile),
    note: trimText(body.note || body.message || "", 500),
    source: trimText(body.source || body.url || "", 600)
  };
}

async function upsertWaitlistSignup(config, row) {
  const response = await fetch(`${config.supabaseUrl}/rest/v1/waitlist_signups?on_conflict=email`, {
    method: "POST",
    headers: {
      apikey: config.serviceKey,
      Authorization: `Bearer ${config.serviceKey}`,
      "Content-Type": "application/json",
      Prefer: "resolution=merge-duplicates,return=representation"
    },
    body: JSON.stringify([row])
  });
  const payload = await response.json().catch(() => ({}));
  if (!response.ok) {
    const detail = payload?.message || payload?.error || response.statusText || "waitlist_insert_failed";
    throw new Error(String(detail));
  }
  return Array.isArray(payload) ? payload[0] : payload;
}

module.exports = async function handler(req, res) {
  const allowedMethods = ["POST", "OPTIONS"];
  if (!requireMusicApi(req, res, {
    methods: ["POST"],
    feature: "waitlist",
    enabledEnv: "SONIC_WAITLIST_ENABLED",
    defaultEnabled: true,
    allowGlobalFallback: false,
    dailyLimitEnv: "SONIC_WAITLIST_DAILY_LIMIT",
    defaultDailyLimit: 24
  })) {
    return;
  }

  const body = cleanWaitlistBody(parseBody(req));
  if (!validEmail(body.email)) {
    sendJson(req, res, 400, { ok: false, error: "invalid_email" }, allowedMethods);
    return;
  }

  const config = supabaseConfig();
  if (!config.enabled) {
    sendJson(req, res, 202, {
      ok: true,
      stored: false,
      emailFallback: true,
      reason: "supabase_not_configured"
    }, allowedMethods);
    return;
  }

  const row = {
    email: body.email,
    name: body.name || null,
    role: body.role,
    note: body.note || null,
    source: body.source || null,
    status: "requested",
    metadata: {
      clientHash: clientHash(req),
      userAgent: trimText(req.headers?.["user-agent"] || "", 180),
      referer: trimText(req.headers?.referer || "", 600)
    },
    updated_at: new Date().toISOString()
  };

  try {
    const saved = await upsertWaitlistSignup(config, row);
    sendJson(req, res, 200, {
      ok: true,
      stored: true,
      id: saved?.id || "",
      status: saved?.status || "requested"
    }, allowedMethods);
  } catch (error) {
    sendJson(req, res, 202, {
      ok: true,
      stored: false,
      emailFallback: true,
      setupNeeded: true,
      reason: "waitlist_storage_failed",
      detail: error.message
    }, allowedMethods);
  }
};
