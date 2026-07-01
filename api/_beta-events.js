const crypto = require("node:crypto");
const {
  envText,
  parseBody,
  requestClientId,
  requireMusicApi,
  sendJson,
  trimText
} = require("./_music-apis");

const EVENT_NAME_PATTERN = /^[a-z0-9][a-z0-9_.:-]{1,79}$/;

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

function clientHash(req) {
  return crypto
    .createHash("sha256")
    .update(requestClientId(req))
    .digest("hex")
    .slice(0, 24);
}

function cleanEventName(value = "") {
  const name = trimText(value, 80).toLowerCase();
  return EVENT_NAME_PATTERN.test(name) ? name : "";
}

function cleanSessionId(value = "") {
  return trimText(value, 80).replace(/[^a-zA-Z0-9_.:-]/g, "").slice(0, 80);
}

function cleanPayload(value) {
  if (!value || typeof value !== "object" || Array.isArray(value)) return {};
  const json = JSON.stringify(value);
  if (json.length <= 6000) return value;
  return {
    truncated: true,
    preview: json.slice(0, 1200)
  };
}

async function insertBetaEvent(config, row) {
  const response = await fetch(`${config.supabaseUrl}/rest/v1/beta_events`, {
    method: "POST",
    headers: {
      apikey: config.serviceKey,
      Authorization: `Bearer ${config.serviceKey}`,
      "Content-Type": "application/json",
      Prefer: "return=minimal"
    },
    body: JSON.stringify([row])
  });
  if (!response.ok) {
    const payload = await response.json().catch(() => ({}));
    const detail = payload?.message || payload?.error || response.statusText || "beta_event_insert_failed";
    throw new Error(String(detail));
  }
}

module.exports = async function handler(req, res) {
  const allowedMethods = ["POST", "OPTIONS"];
  if (!requireMusicApi(req, res, {
    methods: ["POST"],
    feature: "beta_events",
    enabledEnv: "SONIC_BETA_EVENTS_ENABLED",
    defaultEnabled: true,
    allowGlobalFallback: false
  })) {
    return;
  }

  const body = parseBody(req);
  const eventName = cleanEventName(body.event || body.eventName || body.name || "");
  if (!eventName) {
    sendJson(req, res, 400, { ok: false, error: "invalid_event_name" }, allowedMethods);
    return;
  }

  const config = supabaseConfig();
  if (!config.enabled) {
    sendJson(req, res, 202, {
      ok: true,
      stored: false,
      reason: "supabase_not_configured"
    }, allowedMethods);
    return;
  }

  const row = {
    event_name: eventName,
    session_id: cleanSessionId(body.sessionId || body.session || ""),
    source: trimText(body.source || "app", 80),
    page_url: trimText(body.pageUrl || body.url || "", 600),
    client_hash: clientHash(req),
    user_agent: trimText(req.headers?.["user-agent"] || "", 180),
    payload: cleanPayload(body.payload)
  };

  try {
    await insertBetaEvent(config, row);
    sendJson(req, res, 200, { ok: true, stored: true }, allowedMethods);
  } catch (error) {
    sendJson(req, res, 202, {
      ok: true,
      stored: false,
      setupNeeded: true,
      reason: "beta_event_storage_failed",
      detail: error.message
    }, allowedMethods);
  }
};
