function envText(name, fallback = "") {
  const raw = String(process.env[name] || "").trim();
  return raw || fallback;
}

function envFlag(name, fallback = false) {
  const raw = envText(name).toLowerCase();
  if (!raw) return Boolean(fallback);
  return ["1", "true", "yes", "on", "enabled"].includes(raw);
}

const DEFAULT_NATIVE_APP_ALLOWED_ORIGINS = [
  "https://localhost",
  "http://localhost",
  "capacitor://localhost",
  "ionic://localhost"
];

function envList(names = []) {
  return Array.from(new Set([...names, "SONIC_NATIVE_APP_ALLOWED_ORIGINS"]))
    .flatMap((name) => envText(name).split(","))
    .concat(DEFAULT_NATIVE_APP_ALLOWED_ORIGINS)
    .map((item) => item.trim())
    .filter(Boolean);
}

function isProductionLike() {
  const runtime = [
    envText("VERCEL_ENV"),
    envText("NODE_ENV"),
    envText("SONIC_ENV")
  ].join(" ").toLowerCase();
  return /\bproduction\b/.test(runtime);
}

function requestOrigin(req) {
  return String(req?.headers?.origin || "").trim();
}

function requestHost(req) {
  return String(req?.headers?.host || "").trim().toLowerCase();
}

function originMatchesRequestHost(req) {
  const origin = requestOrigin(req);
  const host = requestHost(req);
  if (!origin || !host) return false;
  try {
    return new URL(origin).host.toLowerCase() === host;
  } catch (_err) {
    return false;
  }
}

function normalizeOrigin(value = "") {
  const raw = String(value || "").trim();
  if (!raw) return "";
  try {
    const parsed = new URL(raw);
    if (["capacitor:", "ionic:"].includes(parsed.protocol) && parsed.hostname) {
      return `${parsed.protocol}//${parsed.host}`.replace(/\/+$/, "").toLowerCase();
    }
    if (parsed.origin && parsed.origin !== "null") {
      return parsed.origin.replace(/\/+$/, "").toLowerCase();
    }
    return raw.replace(/\/+$/, "").toLowerCase();
  } catch (_err) {
    return raw.replace(/\/+$/, "").toLowerCase();
  }
}

function nativeAppOrigin(origin = requestOrigin()) {
  const value = normalizeOrigin(origin);
  try {
    const parsed = new URL(value);
    return ["capacitor:", "ionic:"].includes(parsed.protocol) && parsed.hostname === "localhost";
  } catch (_err) {
    return /^(capacitor|ionic):\/\/localhost(?::\d+)?$/i.test(value);
  }
}

function nativeAppOriginAllowed(origin = requestOrigin(), origins = []) {
  const normalized = normalizeOrigin(origin);
  if (!nativeAppOrigin(normalized)) return false;
  const allowed = origins.map(normalizeOrigin).filter(Boolean);
  if (allowed.includes(normalized)) return true;
  return !isProductionLike() && ["capacitor://localhost", "ionic://localhost"].includes(normalized);
}

function localDevelopmentHost(req) {
  const host = requestHost(req);
  return /^(localhost|127\.0\.0\.1|\[::1\])(?::\d+)?$/.test(host);
}

function sameSiteBrowserRequest(req) {
  const site = String(req?.headers?.["sec-fetch-site"] || "").trim().toLowerCase();
  return site === "same-origin" || site === "same-site";
}

function allowedOrigin(req, originEnvNames = []) {
  const origins = envList(originEnvNames);
  const origin = requestOrigin(req);
  if (origin) return origins.includes(origin) || originMatchesRequestHost(req) || nativeAppOriginAllowed(origin, origins);
  if (localDevelopmentHost(req)) return true;
  if (sameSiteBrowserRequest(req)) return true;
  return envFlag("SONIC_ALLOW_ORIGINLESS_REQUESTS", !isProductionLike());
}

function setCorsHeaders(req, res, {
  originEnvNames = [],
  methods = ["POST", "OPTIONS"],
  allowedHeaders = "Content-Type, Authorization"
} = {}) {
  const origins = envList(originEnvNames);
  const origin = requestOrigin(req);
  if (origin && (origins.includes(origin) || originMatchesRequestHost(req) || nativeAppOriginAllowed(origin, origins))) {
    res.setHeader("Access-Control-Allow-Origin", origin);
  } else if (!origin && !isProductionLike() && !origins.length) {
    res.setHeader("Access-Control-Allow-Origin", "*");
  }
  res.setHeader("Vary", "Origin");
  res.setHeader("Access-Control-Allow-Methods", methods.join(", "));
  res.setHeader("Access-Control-Allow-Headers", allowedHeaders);
}

function requestBodyTooLarge(req, maxBytes = 0) {
  const safeMax = Math.max(0, Number(maxBytes) || 0);
  if (!safeMax) return false;
  const length = Number.parseInt(String(req?.headers?.["content-length"] || ""), 10);
  return Number.isFinite(length) && length > safeMax;
}

module.exports = {
  allowedOrigin,
  isProductionLike,
  requestBodyTooLarge,
  setCorsHeaders
};
