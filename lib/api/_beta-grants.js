const crypto = require("node:crypto");

const LOCAL_FALLBACK_CODE = "SONIC-BETA";
const BETA_AUDIENCE = "sonic-search-beta";
const BETA_COOKIE_NAME = "sonic_beta_access";

function envText(name, fallback = "") {
  const raw = String(process.env[name] || "").trim();
  return raw || fallback;
}

function envFlag(name, fallback = false) {
  const raw = envText(name).toLowerCase();
  if (!raw) return Boolean(fallback);
  return ["1", "true", "yes", "on", "enabled"].includes(raw);
}

function envInt(name, fallback, min = 0, max = 100000) {
  const parsed = Number.parseInt(String(process.env[name] || ""), 10);
  if (!Number.isFinite(parsed)) return fallback;
  return Math.max(min, Math.min(max, parsed));
}

function isProductionLike() {
  const runtime = [
    envText("VERCEL_ENV"),
    envText("NODE_ENV"),
    envText("SONIC_ENV")
  ].join(" ").toLowerCase();
  return /\bproduction\b/.test(runtime);
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

function signGrantBody(body = "", secret = betaAccessSecret()) {
  if (!body || !secret) return "";
  return crypto.createHmac("sha256", secret).update(body).digest("base64url");
}

function createGrantToken() {
  const ttlDays = envInt("SONIC_BETA_ACCESS_TTL_DAYS", 30, 1, 365);
  const now = Math.floor(Date.now() / 1000);
  const expiresAt = now + ttlDays * 24 * 60 * 60;
  const payload = {
    aud: BETA_AUDIENCE,
    iat: now,
    exp: expiresAt,
    grant: crypto.randomBytes(12).toString("hex")
  };
  const body = base64urlJson(payload);
  const signature = signGrantBody(body);
  return {
    token: signature ? `${body}.${signature}` : "",
    expiresAt: new Date(expiresAt * 1000).toISOString()
  };
}

function timingSafeStringEqual(left = "", right = "") {
  const leftBuffer = Buffer.from(String(left || ""));
  const rightBuffer = Buffer.from(String(right || ""));
  if (leftBuffer.length !== rightBuffer.length) return false;
  return crypto.timingSafeEqual(leftBuffer, rightBuffer);
}

function parseGrantPayload(body = "") {
  try {
    return JSON.parse(Buffer.from(String(body || ""), "base64url").toString("utf8"));
  } catch (_error) {
    return null;
  }
}

function verifyGrantToken(token = "") {
  const value = String(token || "").trim();
  if (!value) return { ok: false, error: "missing_beta_token" };
  const [body, signature, extra] = value.split(".");
  if (!body || !signature || extra !== undefined) return { ok: false, error: "malformed_beta_token" };

  const secret = betaAccessSecret();
  if (!secret) return { ok: false, error: "beta_access_secret_not_configured" };

  const expected = signGrantBody(body, secret);
  if (!expected || !timingSafeStringEqual(signature, expected)) {
    return { ok: false, error: "invalid_beta_token" };
  }

  const payload = parseGrantPayload(body);
  const now = Math.floor(Date.now() / 1000);
  if (!payload || payload.aud !== BETA_AUDIENCE) return { ok: false, error: "invalid_beta_token" };
  if (Number(payload.exp) <= now) return { ok: false, error: "expired_beta_token" };

  return { ok: true, payload };
}

function parseCookies(header = "") {
  return String(header || "")
    .split(";")
    .map((item) => item.trim())
    .filter(Boolean)
    .reduce((cookies, item) => {
      const separatorIndex = item.indexOf("=");
      if (separatorIndex <= 0) return cookies;
      const name = item.slice(0, separatorIndex).trim();
      const value = item.slice(separatorIndex + 1).trim();
      if (!name) return cookies;
      try {
        cookies[name] = decodeURIComponent(value);
      } catch (_error) {
        cookies[name] = value;
      }
      return cookies;
    }, {});
}

function betaTokenFromRequest(req, body = {}) {
  const headers = req?.headers || {};
  const headerToken = String(
    headers["x-sonic-beta-token"] ||
      headers["x-sonic-beta-access"] ||
      ""
  ).trim();
  if (headerToken) return headerToken.replace(/^Bearer\s+/i, "").trim();

  const bodyToken = String(body?.betaAccessToken || body?.sonicBetaAccessToken || "").trim();
  if (bodyToken) return bodyToken.replace(/^Bearer\s+/i, "").trim();

  const cookies = parseCookies(headers.cookie || "");
  return String(cookies[BETA_COOKIE_NAME] || "").trim();
}

function betaAccessRequired(feature = "", override) {
  if (typeof override === "boolean") return override;
  const publicFeatures = new Set([
    "beta-access",
    "beta_events",
    "social-config",
    "social-oauth-url",
    "waitlist"
  ]);
  if (publicFeatures.has(String(feature || "").trim())) return false;
  return envFlag("SONIC_REQUIRE_BETA_ACCESS_FOR_APIS", isProductionLike());
}

function requestBetaGrant(req, body = {}) {
  const token = betaTokenFromRequest(req, body);
  return verifyGrantToken(token);
}

module.exports = {
  BETA_COOKIE_NAME,
  codeIsValid,
  configuredCodes,
  createGrantToken,
  envInt,
  LOCAL_FALLBACK_CODE,
  normalizeCode,
  requestBetaGrant,
  betaAccessRequired,
  verifyGrantToken
};
