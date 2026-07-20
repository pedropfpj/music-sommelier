const crypto = require("node:crypto");
const {
  enforceDurableMusicDailyLimit,
  envText,
  parseBody,
  requestClientId,
  requireMusicApi,
  sendJson,
  trimText
} = require("./_music-apis");

const EVENT_NAME_PATTERN = /^[a-z0-9][a-z0-9_.:-]{1,79}$/;
const UUID_PATTERN = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
const APP_SESSION_EVENT_NAME = "app_session_started";
const ANALYTICS_SCHEMA_VERSION = 2;

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

function cleanUuid(value = "") {
  const uuid = trimText(value, 80).toLowerCase();
  return UUID_PATTERN.test(uuid) ? uuid : "";
}

function cleanTimestamp(value = "") {
  const timestamp = Date.parse(String(value || "").trim());
  return Number.isFinite(timestamp) ? new Date(timestamp).toISOString() : "";
}

function sanitizePathname(value = "") {
  const raw = String(value || "").trim();
  if (!raw) return "/";
  let pathname = "/";
  try {
    pathname = new URL(raw, "https://sonic-search.invalid").pathname || "/";
  } catch (_error) {
    pathname = raw.split(/[?#]/, 1)[0] || "/";
  }
  if (!pathname.startsWith("/")) pathname = `/${pathname}`;
  let decodedPathname = pathname;
  try {
    decodedPathname = decodeURIComponent(pathname);
  } catch (_error) {
    // Keep the encoded pathname when malformed escape sequences are present.
  }
  if (/(?:access_token|refresh_token|provider_token|provider_refresh_token|beta_access_token)/i.test(decodedPathname)) {
    return "/";
  }
  return pathname.replace(/[\u0000-\u001f\u007f]/g, "").slice(0, 600) || "/";
}

function requestedSchemaVersion(body = {}) {
  const raw = body.schema_version ?? body.schemaVersion;
  if (raw === undefined || raw === null || raw === "") return 1;
  const version = Number(raw);
  return Number.isInteger(version) ? version : 0;
}

function parseV2AppSession(body = {}, eventName = "") {
  if (eventName !== APP_SESSION_EVENT_NAME) {
    return { ok: false, error: "unsupported_v2_event" };
  }
  const eventId = cleanUuid(body.event_id ?? body.eventId);
  const anonymousId = cleanUuid(body.anonymous_id ?? body.anonymousId);
  const sessionId = cleanUuid(body.session_id ?? body.sessionId ?? body.session);
  const rawUserId = body.user_id ?? body.userId;
  const userId = rawUserId === null || rawUserId === undefined || String(rawUserId).trim() === ""
    ? null
    : cleanUuid(rawUserId);
  const occurredAt = cleanTimestamp(body.occurred_at ?? body.occurredAt);
  const platform = trimText(body.platform, 20).toLowerCase();
  const appVersion = trimText(body.app_version ?? body.appVersion, 80);
  const environment = trimText(body.environment, 20).toLowerCase();
  const isFirstSession = body.is_first_session ?? body.isFirstSession;
  const rawPreviousSessionAt = body.previous_session_at ?? body.previousSessionAt;
  const previousSessionAt = rawPreviousSessionAt === null || rawPreviousSessionAt === undefined || String(rawPreviousSessionAt).trim() === ""
    ? null
    : cleanTimestamp(rawPreviousSessionAt);

  if (!eventId) return { ok: false, error: "invalid_event_id" };
  if (!anonymousId) return { ok: false, error: "invalid_anonymous_id" };
  if (rawUserId !== null && rawUserId !== undefined && String(rawUserId).trim() !== "" && !userId) {
    return { ok: false, error: "invalid_user_id" };
  }
  if (!sessionId) return { ok: false, error: "invalid_session_id" };
  if (!occurredAt) return { ok: false, error: "invalid_occurred_at" };
  if (!/^(web|ios|android|native)$/.test(platform)) return { ok: false, error: "invalid_platform" };
  if (!/^[a-z0-9._:-]{1,80}$/i.test(appVersion)) return { ok: false, error: "invalid_app_version" };
  if (!/^(development|preview|production|test)$/.test(environment)) {
    return { ok: false, error: "invalid_environment" };
  }
  if (typeof isFirstSession !== "boolean") return { ok: false, error: "invalid_is_first_session" };
  if (rawPreviousSessionAt !== null && rawPreviousSessionAt !== undefined && String(rawPreviousSessionAt).trim() !== "" && !previousSessionAt) {
    return { ok: false, error: "invalid_previous_session_at" };
  }
  if (isFirstSession && previousSessionAt) return { ok: false, error: "unexpected_previous_session_at" };
  if (!isFirstSession && !previousSessionAt) return { ok: false, error: "missing_previous_session_at" };

  return {
    ok: true,
    row: {
      event_id: eventId,
      anonymous_id: anonymousId,
      user_id: userId,
      occurred_at: occurredAt,
      schema_version: ANALYTICS_SCHEMA_VERSION,
      platform,
      app_version: appVersion,
      environment,
      event_name: APP_SESSION_EVENT_NAME,
      session_id: sessionId,
      page_url: sanitizePathname(body.pathname ?? body.pageUrl ?? body.url),
      payload: {
        is_first_session: isFirstSession,
        previous_session_at: previousSessionAt
      }
    }
  };
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
    if (String(payload?.code || "") === "23505") {
      return { stored: false, duplicate: true };
    }
    const detail = payload?.message || payload?.error || response.statusText || "beta_event_insert_failed";
    throw new Error(String(detail));
  }
  return { stored: true, duplicate: false };
}

module.exports = async function handler(req, res) {
  const allowedMethods = ["POST", "OPTIONS"];
  if (!requireMusicApi(req, res, {
    methods: ["POST"],
    feature: "beta_events",
    enabledEnv: "SONIC_BETA_EVENTS_ENABLED",
    defaultEnabled: true,
    allowGlobalFallback: false,
    dailyLimitEnv: "SONIC_BETA_EVENTS_DAILY_LIMIT",
    defaultDailyLimit: 300,
    budgetOnStart: false
  })) {
    return;
  }

  if (!await enforceDurableMusicDailyLimit(req, res, {
    feature: "beta_events",
    dailyLimitEnv: "SONIC_BETA_EVENTS_DAILY_LIMIT",
    defaultDailyLimit: 300,
    methods: allowedMethods
  })) return;

  const body = parseBody(req);
  const eventName = cleanEventName(body.event || body.eventName || body.event_name || body.name || "");
  if (!eventName) {
    sendJson(req, res, 400, { ok: false, error: "invalid_event_name" }, allowedMethods);
    return;
  }

  const schemaVersion = requestedSchemaVersion(body);
  if (![1, ANALYTICS_SCHEMA_VERSION].includes(schemaVersion)) {
    sendJson(req, res, 400, { ok: false, error: "unsupported_schema_version" }, allowedMethods);
    return;
  }

  const parsedV2 = schemaVersion === ANALYTICS_SCHEMA_VERSION
    ? parseV2AppSession(body, eventName)
    : null;
  if (parsedV2 && !parsedV2.ok) {
    sendJson(req, res, 400, { ok: false, error: parsedV2.error }, allowedMethods);
    return;
  }

  const config = supabaseConfig();
  if (!config.enabled) {
    if (schemaVersion === ANALYTICS_SCHEMA_VERSION) {
      sendJson(req, res, 503, {
        ok: false,
        stored: false,
        duplicate: false,
        error: "supabase_not_configured"
      }, allowedMethods);
    } else {
      sendJson(req, res, 202, {
        ok: true,
        stored: false,
        reason: "supabase_not_configured"
      }, allowedMethods);
    }
    return;
  }

  const row = parsedV2?.row || {
    event_name: eventName,
    session_id: cleanSessionId(body.sessionId || body.session || ""),
    source: trimText(body.source || "app", 80),
    page_url: body.pageUrl || body.url ? sanitizePathname(body.pageUrl || body.url) : "",
    client_hash: clientHash(req),
    user_agent: trimText(req.headers?.["user-agent"] || "", 180),
    payload: cleanPayload(body.payload)
  };

  try {
    const result = await insertBetaEvent(config, row);
    if (result.duplicate) {
      sendJson(req, res, 200, { ok: true, stored: false, duplicate: true }, allowedMethods);
      return;
    }
    sendJson(
      req,
      res,
      200,
      schemaVersion === ANALYTICS_SCHEMA_VERSION
        ? { ok: true, stored: true, duplicate: false }
        : { ok: true, stored: true },
      allowedMethods
    );
  } catch (error) {
    if (schemaVersion === ANALYTICS_SCHEMA_VERSION) {
      sendJson(req, res, 502, {
        ok: false,
        stored: false,
        duplicate: false,
        error: "beta_event_storage_failed"
      }, allowedMethods);
    } else {
      sendJson(req, res, 202, {
        ok: true,
        stored: false,
        setupNeeded: true,
        reason: "beta_event_storage_failed",
        detail: error.message
      }, allowedMethods);
    }
  }
};
