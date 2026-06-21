const { envFlag, envText, sendJson } = require("./_music-apis");

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

function safeRedirectTo(req) {
  const fallback = requestOrigin(req);
  const requested = queryValue(req, "redirect_to") || fallback;
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
  if (req.method === "OPTIONS") {
    res.setHeader("Access-Control-Allow-Origin", "*");
    res.setHeader("Access-Control-Allow-Methods", "GET, OPTIONS");
    res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");
    res.statusCode = 204;
    res.end();
    return;
  }

  if (req.method !== "GET") {
    sendJson(req, res, 405, { error: "method_not_allowed" }, ["GET", "OPTIONS"]);
    return;
  }

  const provider = queryValue(req, "provider") || "google";
  if (provider !== "google") {
    sendJson(req, res, 400, { ok: false, error: "unsupported_provider" }, ["GET", "OPTIONS"]);
    return;
  }

  const supabaseUrl = envText("SUPABASE_URL").replace(/\/+$/, "");
  const supabaseAnonKey = envText("SUPABASE_ANON_KEY") || envText("NEXT_PUBLIC_SUPABASE_ANON_KEY");
  const enabled = envFlag("SONIC_SOCIAL_ENABLED", false) && Boolean(supabaseUrl && supabaseAnonKey);
  if (!enabled) {
    sendJson(req, res, 503, { ok: false, error: "social_auth_not_configured" }, ["GET", "OPTIONS"]);
    return;
  }

  const params = new URLSearchParams({
    provider,
    redirect_to: safeRedirectTo(req)
  });
  const authorizeUrl = `${supabaseUrl}/auth/v1/authorize?${params.toString()}`;

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
      }, ["GET", "OPTIONS"]);
      return;
    }
    res.setHeader("Cache-Control", "no-store");
    sendJson(req, res, 200, { ok: true, provider, url: location }, ["GET", "OPTIONS"]);
  } catch (error) {
    sendJson(req, res, 502, {
      ok: false,
      error: "oauth_url_failed",
      message: error?.message || "Could not create Google OAuth URL"
    }, ["GET", "OPTIONS"]);
  }
};
