const dailyBudget = new Map();
const { enforceDailyUsageLimit, hashStoreKey } = require("./_usage-store");

function envFlag(name, fallback = false) {
  const raw = String(process.env[name] || "").trim().toLowerCase();
  if (!raw) return Boolean(fallback);
  return ["1", "true", "yes", "on", "enabled"].includes(raw);
}

function envPresent(name) {
  return Object.prototype.hasOwnProperty.call(process.env, name) &&
    String(process.env[name] || "").trim() !== "";
}

function featureEnabled(enabledEnv = "SONIC_MUSIC_APIS_ENABLED", fallback = false, { allowGlobalFallback = true } = {}) {
  if (enabledEnv && envPresent(enabledEnv)) return envFlag(enabledEnv, fallback);
  if (allowGlobalFallback && enabledEnv !== "SONIC_MUSIC_APIS_ENABLED" && envPresent("SONIC_MUSIC_APIS_ENABLED")) {
    return envFlag("SONIC_MUSIC_APIS_ENABLED", fallback);
  }
  return envFlag(enabledEnv, fallback);
}

function envInt(name, fallback, min = 0, max = 100000) {
  const parsed = Number.parseInt(String(process.env[name] || ""), 10);
  if (!Number.isFinite(parsed)) return fallback;
  return Math.max(min, Math.min(max, parsed));
}

function envText(name, fallback = "") {
  const raw = String(process.env[name] || "").trim();
  return raw || fallback;
}

function envFirst(names = [], fallback = "") {
  for (const name of names) {
    const value = envText(name);
    if (value) return value;
  }
  return fallback;
}

function trimText(value, maxLength = 1200) {
  return String(value || "")
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, maxLength);
}

function allowedOrigins() {
  return String(process.env.SONIC_MUSIC_ALLOWED_ORIGINS || process.env.SONIC_AI_ALLOWED_ORIGINS || "")
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);
}

function originMatchesRequestHost(req) {
  const origin = String(req?.headers?.origin || "").trim();
  const host = String(req?.headers?.host || "").trim();
  if (!origin || !host) return false;
  try {
    return new URL(origin).host === host;
  } catch (_err) {
    return false;
  }
}

function originAllowed(req) {
  const origins = allowedOrigins();
  if (!origins.length) return true;
  const origin = String(req.headers?.origin || "").trim();
  if (!origin) return true;
  return origins.includes(origin) || originMatchesRequestHost(req);
}

function setCors(req, res, methods = ["POST", "OPTIONS"]) {
  const origins = allowedOrigins();
  const origin = String(req?.headers?.origin || "").trim();
  if (!origins.length) {
    res.setHeader("Access-Control-Allow-Origin", "*");
  } else if (origin && (origins.includes(origin) || originMatchesRequestHost(req))) {
    res.setHeader("Access-Control-Allow-Origin", origin);
  }
  res.setHeader("Access-Control-Allow-Methods", methods.join(", "));
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");
}

function sendJson(req, res, statusCode, payload, methods) {
  setCors(req, res, methods);
  res.statusCode = statusCode;
  res.setHeader("Content-Type", "application/json; charset=utf-8");
  res.end(JSON.stringify(payload));
}

function handleOptions(req, res, methods) {
  if (req.method !== "OPTIONS") return false;
  setCors(req, res, methods);
  res.statusCode = 204;
  res.end();
  return true;
}

function parseBody(req) {
  if (req.body && typeof req.body === "object") return req.body;
  if (typeof req.body === "string") {
    try {
      return JSON.parse(req.body);
    } catch (_err) {
      return {};
    }
  }
  return {};
}

function requestClientId(req) {
  const forwarded = String(req.headers?.["x-forwarded-for"] || "").split(",")[0].trim();
  const realIp = String(req.headers?.["x-real-ip"] || "").trim();
  const userAgent = String(req.headers?.["user-agent"] || "").slice(0, 90);
  return `${forwarded || realIp || "unknown"}:${userAgent}`;
}

function todayKey() {
  return new Date().toISOString().slice(0, 10);
}

function enforceDailyBudget(req, feature, limit) {
  const safeLimit = Math.max(0, Number(limit) || 0);
  if (!safeLimit) return { ok: true, remaining: null };
  const key = `${todayKey()}:${feature}:${requestClientId(req)}`;
  const current = Number(dailyBudget.get(key) || 0);
  if (current >= safeLimit) return { ok: false, remaining: 0 };
  dailyBudget.set(key, current + 1);
  return { ok: true, remaining: safeLimit - current - 1 };
}

function secondsUntilNextUtcDay() {
  const now = Date.now();
  const next = new Date(now);
  next.setUTCHours(24, 0, 0, 0);
  return Math.max(60, Math.ceil((next.getTime() - now) / 1000) + 3600);
}

async function enforceDurableMusicDailyLimit(req, res, {
  feature = "music",
  dailyLimitEnv = "",
  defaultDailyLimit = 0,
  methods = ["POST"]
} = {}) {
  if (!dailyLimitEnv) return true;
  const dailyLimit = envInt(dailyLimitEnv, defaultDailyLimit, 0, 10000);
  const key = `sonic:usage:${feature}:${todayKey()}:${hashStoreKey(requestClientId(req))}`;
  const budget = await enforceDailyUsageLimit({
    key,
    limit: dailyLimit,
    expiresInSeconds: secondsUntilNextUtcDay()
  });
  const allMethods = Array.from(new Set([...methods, "OPTIONS"]));
  if (!budget.ok) {
    sendJson(req, res, 429, {
      ok: false,
      enabled: true,
      error: budget.error || "daily_music_api_limit_reached",
      feature,
      limit: dailyLimit
    }, allMethods);
    return false;
  }
  if (budget.remaining !== null) res.setHeader("X-Sonic-Music-Durable-Remaining", String(budget.remaining));
  res.setHeader("X-Sonic-Usage-Store", budget.store || "memory");
  return true;
}

function requireMusicApi(req, res, {
  methods = ["POST"],
  feature = "music",
  enabledEnv = "SONIC_MUSIC_APIS_ENABLED",
  defaultEnabled = false,
  allowGlobalFallback = true,
  dailyLimitEnv = "",
  defaultDailyLimit = 0
} = {}) {
  const allMethods = Array.from(new Set([...methods, "OPTIONS"]));
  if (handleOptions(req, res, allMethods)) return false;
  if (!methods.includes(req.method)) {
    sendJson(req, res, 405, { error: "method_not_allowed" }, allMethods);
    return false;
  }
  if (!originAllowed(req)) {
    sendJson(req, res, 403, { error: "origin_not_allowed" }, allMethods);
    return false;
  }
  if (!featureEnabled(enabledEnv, defaultEnabled, { allowGlobalFallback })) {
    sendJson(req, res, 403, { error: "music_api_disabled", feature }, allMethods);
    return false;
  }
  if (dailyLimitEnv) {
    const budget = enforceDailyBudget(req, feature, envInt(dailyLimitEnv, defaultDailyLimit, 0, 10000));
    if (!budget.ok) {
      sendJson(req, res, 429, { error: "daily_music_api_limit_reached", feature }, allMethods);
      return false;
    }
    if (budget.remaining !== null) res.setHeader("X-Sonic-Music-Remaining", String(budget.remaining));
  }
  return true;
}

module.exports = {
  envFlag,
  envPresent,
  featureEnabled,
  envInt,
  envText,
  envFirst,
  enforceDurableMusicDailyLimit,
  parseBody,
  requestClientId,
  requireMusicApi,
  sendJson,
  trimText
};
