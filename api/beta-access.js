const crypto = require("node:crypto");
const {
  allowedOrigin,
  isProductionLike,
  requestBodyTooLarge,
  setCorsHeaders
} = require("./_request-security");
const {
  envFlag,
  envInt,
  envText,
  parseBody,
  requestClientId,
  trimText
} = require("./_music-apis");

const attempts = new Map();
const LOCAL_FALLBACK_CODE = "SONIC-BETA";

function setBetaCors(req, res, methods = ["POST", "OPTIONS"]) {
  setCorsHeaders(req, res, {
    originEnvNames: [
      "SONIC_BETA_ALLOWED_ORIGINS",
      "SONIC_MUSIC_ALLOWED_ORIGINS",
      "SONIC_AI_ALLOWED_ORIGINS"
    ],
    methods,
    allowedHeaders: "Content-Type, Authorization"
  });
}

function sendJson(req, res, statusCode, payload, methods) {
  setBetaCors(req, res, methods);
  res.statusCode = statusCode;
  res.setHeader("Content-Type", "application/json; charset=utf-8");
  res.end(JSON.stringify(payload));
}

function handleOptions(req, res, methods) {
  if (req.method !== "OPTIONS") return false;
  setBetaCors(req, res, methods);
  res.statusCode = 204;
  res.end();
  return true;
}

function normalizeCode(value = "") {
  return String(value || "")
    .trim()
    .replace(/\s+/g, "")
    .toUpperCase();
}

function configuredCodes() {
  const envCodes = envText("SONIC_BETA_ACCESS_CODES")
    .split(",")
    .map(normalizeCode)
    .filter(Boolean);
  if (envCodes.length) return envCodes;
  if (!isProductionLike() && envFlag("SONIC_BETA_LOCAL_FALLBACK_ENABLED", true)) {
    return [LOCAL_FALLBACK_CODE];
  }
  return [];
}

function timingSafeCodeMatch(candidate = "", code = "") {
  const candidateHash = crypto
    .createHash("sha256")
    .update(normalizeCode(candidate))
    .digest();
  const codeHash = crypto
    .createHash("sha256")
    .update(normalizeCode(code))
    .digest();
  return crypto.timingSafeEqual(candidateHash, codeHash);
}

function codeIsValid(candidate = "") {
  const code = normalizeCode(candidate);
  if (!code) return false;
  return configuredCodes().some((allowedCode) => timingSafeCodeMatch(code, allowedCode));
}

function attemptKey(req) {
  return crypto
    .createHash("sha256")
    .update(requestClientId(req))
    .digest("hex")
    .slice(0, 32);
}

function attemptsAllowed(req) {
  const limit = envInt("SONIC_BETA_ACCESS_ATTEMPT_LIMIT", 20, 1, 200);
  const windowMs = envInt("SONIC_BETA_ACCESS_ATTEMPT_WINDOW_SECONDS", 900, 60, 86400) * 1000;
  const key = attemptKey(req);
  const now = Date.now();
  const entry = attempts.get(key) || { count: 0, resetAt: now + windowMs };
  if (now > entry.resetAt) {
    attempts.set(key, { count: 0, resetAt: now + windowMs });
    return true;
  }
  return entry.count < limit;
}

function registerAttempt(req, valid) {
  const key = attemptKey(req);
  if (valid) {
    attempts.delete(key);
    return;
  }
  const windowMs = envInt("SONIC_BETA_ACCESS_ATTEMPT_WINDOW_SECONDS", 900, 60, 86400) * 1000;
  const now = Date.now();
  const entry = attempts.get(key) || { count: 0, resetAt: now + windowMs };
  if (now > entry.resetAt) {
    attempts.set(key, { count: 1, resetAt: now + windowMs });
    return;
  }
  entry.count += 1;
  attempts.set(key, entry);
}

function betaAccessSecret() {
  const explicit = envText("SONIC_BETA_ACCESS_SECRET");
  if (explicit) return explicit;
  if (isProductionLike()) return "";
  return crypto
    .createHash("sha256")
    .update(configuredCodes().join("|") || LOCAL_FALLBACK_CODE)
    .digest("hex");
}

function base64urlJson(payload) {
  return Buffer.from(JSON.stringify(payload)).toString("base64url");
}

function createGrantToken() {
  const ttlDays = envInt("SONIC_BETA_ACCESS_TTL_DAYS", 30, 1, 365);
  const now = Math.floor(Date.now() / 1000);
  const expiresAt = now + ttlDays * 24 * 60 * 60;
  const payload = {
    aud: "sonic-search-beta",
    iat: now,
    exp: expiresAt,
    grant: crypto.randomBytes(12).toString("hex")
  };
  const body = base64urlJson(payload);
  const secret = betaAccessSecret();
  if (!secret) {
    return { token: "", expiresAt: new Date(expiresAt * 1000).toISOString() };
  }
  const signature = crypto.createHmac("sha256", secret).update(body).digest("base64url");
  return {
    token: `${body}.${signature}`,
    expiresAt: new Date(expiresAt * 1000).toISOString()
  };
}

function setAccessCookie(res, token = "") {
  if (!token) return;
  const maxAge = envInt("SONIC_BETA_ACCESS_TTL_DAYS", 30, 1, 365) * 24 * 60 * 60;
  const secure = isProductionLike() ? "; Secure" : "";
  res.setHeader(
    "Set-Cookie",
    `sonic_beta_access=${encodeURIComponent(token)}; Path=/; Max-Age=${maxAge}; HttpOnly; SameSite=Lax${secure}`
  );
}

module.exports = async function handler(req, res) {
  const allowedMethods = ["POST", "OPTIONS"];
  if (handleOptions(req, res, allowedMethods)) return;
  if (req.method !== "POST") {
    sendJson(req, res, 405, { ok: false, error: "method_not_allowed" }, allowedMethods);
    return;
  }
  if (requestBodyTooLarge(req, envInt("SONIC_API_MAX_BODY_BYTES", 1048576, 1024, 5242880))) {
    sendJson(req, res, 413, { ok: false, error: "request_body_too_large" }, allowedMethods);
    return;
  }
  if (!allowedOrigin(req, ["SONIC_BETA_ALLOWED_ORIGINS", "SONIC_MUSIC_ALLOWED_ORIGINS", "SONIC_AI_ALLOWED_ORIGINS"])) {
    sendJson(req, res, 403, { ok: false, error: "origin_not_allowed" }, allowedMethods);
    return;
  }
  if (!attemptsAllowed(req)) {
    sendJson(req, res, 429, { ok: false, error: "too_many_attempts" }, allowedMethods);
    return;
  }

  const codes = configuredCodes();
  if (!codes.length) {
    sendJson(req, res, 503, {
      ok: false,
      error: "beta_access_not_configured"
    }, allowedMethods);
    return;
  }

  const body = parseBody(req);
  const code = normalizeCode(body.code || body.beta || body.access || "");
  const valid = codeIsValid(code);
  registerAttempt(req, valid);
  if (!valid) {
    sendJson(req, res, 403, { ok: false, error: "invalid_code" }, allowedMethods);
    return;
  }

  const grant = createGrantToken();
  setAccessCookie(res, grant.token);
  sendJson(req, res, 200, {
    ok: true,
    access: "granted",
    expiresAt: grant.expiresAt,
    source: trimText(body.source || "manual", 40)
  }, allowedMethods);
};
