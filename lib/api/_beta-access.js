const crypto = require("node:crypto");
const {
  BETA_COOKIE_NAME,
  codeIsValid,
  configuredCodes,
  createGrantToken,
  envInt: betaEnvInt,
  LOCAL_FALLBACK_CODE,
  normalizeCode
} = require("./_beta-grants");
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
const { deleteKey, incrementCounter } = require("./_usage-store");

const attempts = new Map();

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

function attemptKey(req) {
  return crypto
    .createHash("sha256")
    .update(requestClientId(req))
    .digest("hex")
    .slice(0, 32);
}

function memoryAttemptsAllowed(req, limit, windowMs) {
  const key = attemptKey(req);
  const now = Date.now();
  const entry = attempts.get(key) || { count: 0, resetAt: now + windowMs };
  if (now > entry.resetAt) {
    attempts.set(key, { count: 0, resetAt: now + windowMs });
    return true;
  }
  return entry.count < limit;
}

async function attemptsAllowed(req) {
  const limit = envInt("SONIC_BETA_ACCESS_ATTEMPT_LIMIT", 20, 1, 200);
  const windowMs = envInt("SONIC_BETA_ACCESS_ATTEMPT_WINDOW_SECONDS", 900, 60, 86400) * 1000;
  const key = `sonic:beta-access:attempts:${attemptKey(req)}`;
  const counter = await incrementCounter(key, {
    expiresInSeconds: Math.ceil(windowMs / 1000)
  });
  if (counter.ok) return counter.count <= limit;
  return memoryAttemptsAllowed(req, limit, windowMs);
}

function registerMemoryAttempt(req, valid) {
  const key = attemptKey(req);
  const now = Date.now();
  if (valid) {
    attempts.delete(key);
    return;
  }
  const windowMs = envInt("SONIC_BETA_ACCESS_ATTEMPT_WINDOW_SECONDS", 900, 60, 86400) * 1000;
  const entry = attempts.get(key) || { count: 0, resetAt: now + windowMs };
  if (now > entry.resetAt) {
    attempts.set(key, { count: 1, resetAt: now + windowMs });
    return;
  }
  entry.count += 1;
  attempts.set(key, entry);
}

async function registerAttempt(req, valid) {
  const key = attemptKey(req);
  if (valid) {
    attempts.delete(key);
    await deleteKey(`sonic:beta-access:attempts:${key}`);
    return;
  }
  registerMemoryAttempt(req, valid);
}

function setAccessCookie(res, token = "") {
  if (!token) return;
  const maxAge = betaEnvInt("SONIC_BETA_ACCESS_TTL_DAYS", 30, 1, 365) * 24 * 60 * 60;
  const secure = isProductionLike() ? "; Secure" : "";
  res.setHeader(
    "Set-Cookie",
    `${BETA_COOKIE_NAME}=${encodeURIComponent(token)}; Path=/; Max-Age=${maxAge}; HttpOnly; SameSite=Lax${secure}`
  );
}

function shouldReturnBearerToken(req) {
  if (envFlag("SONIC_BETA_ACCESS_RETURN_TOKEN", false)) return true;
  const origin = String(req?.headers?.origin || "").trim();
  return /^(capacitor|ionic):\/\/localhost(?::\d+)?$/i.test(origin);
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
  if (!await attemptsAllowed(req)) {
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
  await registerAttempt(req, valid);
  if (!valid) {
    sendJson(req, res, 403, { ok: false, error: "invalid_code" }, allowedMethods);
    return;
  }

  const grant = createGrantToken();
  setAccessCookie(res, grant.token);
  sendJson(req, res, 200, {
    ok: true,
    access: "granted",
    betaAccessToken: shouldReturnBearerToken(req) ? grant.token : "",
    expiresAt: grant.expiresAt,
    source: trimText(body.source || "manual", 40)
  }, allowedMethods);
};
