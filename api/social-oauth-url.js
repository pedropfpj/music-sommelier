const { envFlag, envText, requireMusicApi, sendJson } = require("../lib/api/_music-apis");

function requestOrigin(req) {
  const host = String(req.headers?.host || "").trim();
  if (!host) return "https://sonicsearch.app";
  const forwardedProto = String(req.headers?.["x-forwarded-proto"] || "").split(",")[0].trim();
  const localHost = host.startsWith("localhost") || host.startsWith("127.0.0.1");
  const protocol = forwardedProto || (localHost ? "http" : "https");
  return `${protocol}://${host}`;
}

function queryValue(req, key) {
  const value = req.query?.[key];
  if (Array.isArray(value)) return String(value[0] || "").trim();
  return String(value || "").trim();
}

function cleanBaseUrl(value = "", fallback = "") {
  const raw = String(value || fallback || "").trim().replace(/\/+$/, "");
  if (!raw) return "";
  try {
    const url = new URL(raw);
    if (!["http:", "https:"].includes(url.protocol)) return "";
    return url.origin;
  } catch (_err) {
    return "";
  }
}

function configuredNativeRedirects() {
  return new Set(
    [
      "sonicsearch://auth/callback",
      ...envText("SONIC_SOCIAL_ALLOWED_REDIRECTS")
        .split(",")
        .map((entry) => entry.trim())
        .filter(Boolean)
    ].map((entry) => entry.replace(/\/+$/, ""))
  );
}

function safeRedirectTo(req) {
  const fallback = requestOrigin(req);
  const requested = queryValue(req, "redirect_to") || fallback;
  const normalizedRequested = requested.replace(/\/+$/, "");
  if (configuredNativeRedirects().has(normalizedRequested)) {
    return normalizedRequested;
  }
  try {
    const url = new URL(requested);
    const requestHost = String(req.headers?.host || "").trim();
    const allowedHosts = new Set([
      requestHost,
      "sonicsearch.app",
      "www.sonicsearch.app",
      "localhost",
      "127.0.0.1"
    ].filter(Boolean));
    if (!["http:", "https:"].includes(url.protocol)) return fallback;
    if (!allowedHosts.has(url.host) && !allowedHosts.has(url.hostname)) return fallback;
    return url.toString();
  } catch (_err) {
    return fallback;
  }
}

function decodeHtmlUrl(value = "") {
  return String(value || "")
    .replace(/&amp;/g, "&")
    .replace(/&#x2F;/g, "/")
    .replace(/&quot;/g, "\"");
}

function parseGoogleUrlFromBody(body = "") {
  const match = String(body || "").match(/href=["']([^"']+)["']/i);
  return match ? decodeHtmlUrl(match[1]) : "";
}

function isGoogleOAuthUrl(value = "") {
  try {
    const url = new URL(value);
    return url.protocol === "https:" && url.hostname === "accounts.google.com";
  } catch (_err) {
    return false;
  }
}

module.exports = async function handler(req, res) {
  const methods = ["GET", "OPTIONS"];
  if (!requireMusicApi(req, res, {
    methods: ["GET"],
    feature: "social-oauth-url",
    enabledEnv: "SONIC_SOCIAL_OAUTH_ROUTE_ENABLED",
    defaultEnabled: true,
    allowGlobalFallback: false
  })) return;

  const provider = queryValue(req, "provider") || "google";
  if (provider !== "google") {
    sendJson(req, res, 400, { ok: false, error: "unsupported_provider" }, methods);
    return;
  }

  const supabaseUrl = cleanBaseUrl(envText("SUPABASE_URL"));
  const supabaseAuthUrl = cleanBaseUrl(envText("SUPABASE_AUTH_URL"), supabaseUrl);
  const supabaseAnonKey = envText("SUPABASE_ANON_KEY") || envText("NEXT_PUBLIC_SUPABASE_ANON_KEY");
  const enabled = envFlag("SONIC_SOCIAL_ENABLED", false) && Boolean(supabaseUrl && supabaseAuthUrl && supabaseAnonKey);
  if (!enabled) {
    sendJson(req, res, 503, { ok: false, error: "social_auth_not_configured" }, methods);
    return;
  }

  const params = new URLSearchParams({
    provider,
    redirect_to: safeRedirectTo(req)
  });
  const authorizeUrl = `${supabaseAuthUrl}/auth/v1/authorize?${params.toString()}`;

  try {
    const response = await fetch(authorizeUrl, {
      method: "GET",
      redirect: "manual",
      headers: {
        Accept: "text/plain, text/html;q=0.9, */*;q=0.8"
      }
    });
    const body = await response.text().catch(() => "");
    const location = response.headers.get("location") || parseGoogleUrlFromBody(body);
    if (!isGoogleOAuthUrl(location)) {
      sendJson(req, res, 502, {
        ok: false,
        error: "missing_google_redirect",
        status: response.status
      }, methods);
      return;
    }
    res.setHeader("Cache-Control", "no-store");
    if (queryValue(req, "redirect") === "1" || queryValue(req, "mode") === "redirect") {
      res.statusCode = 302;
      res.setHeader("Location", location);
      res.end();
      return;
    }
    sendJson(req, res, 200, { ok: true, provider, url: location }, methods);
  } catch (error) {
    sendJson(req, res, 502, {
      ok: false,
      error: "oauth_url_failed",
      message: error?.message || "Could not create Google OAuth URL"
    }, methods);
  }
};
