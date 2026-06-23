function envText(name, fallback = "") {
  const raw = String(process.env[name] || "").trim();
  return raw || fallback;
}

function envFlag(name, fallback = false) {
  const raw = envText(name).toLowerCase();
  if (!raw) return Boolean(fallback);
  return ["1", "true", "yes", "on", "enabled"].includes(raw);
}

function envList(names = []) {
  return names
    .flatMap((name) => envText(name).split(","))
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
  if (origin) return origins.includes(origin) || originMatchesRequestHost(req);
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
  if (origin && (origins.includes(origin) || originMatchesRequestHost(req))) {
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
