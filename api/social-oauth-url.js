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

function cleanSupabaseAuthUrl(value = "", fallback = "") {
  const authUrl = cleanBaseUrl(value, fallback);
  if (!authUrl) return "";
  try {
    const url = new URL(authUrl);
    if (url.hostname === "auth.sonicsearch.app") return cleanBaseUrl(fallback);
    return authUrl;
  } catch (_err) {
    return cleanBaseUrl(fallback);
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

function parseOAuthUrlFromBody(body = "") {
  const match = String(body || "").match(/href=["']([^"']+)["']/i);
  return match ? decodeHtmlUrl(match[1]) : "";
}

function parseOAuthErrorFromBody(body = "") {
  try {
    const payload = JSON.parse(String(body || ""));
    return payload?.msg || payload?.message || payload?.error_description || payload?.error || "";
  } catch (_err) {
    return "";
  }
}

function isExpectedProviderOAuthUrl(value = "", provider = "google") {
  try {
    const url = new URL(value);
    if (url.protocol !== "https:") return false;
    if (provider === "apple") return url.hostname === "appleid.apple.com";
    return url.hostname === "accounts.google.com";
  } catch (_err) {
    return false;
  }
}

function safePkceChallenge(value = "") {
  const clean = String(value || "").trim();
  return /^[A-Za-z0-9._~-]{43,128}$/.test(clean) ? clean : "";
}

function safePkceMethod(value = "") {
  const clean = String(value || "").trim().toUpperCase();
  return clean === "PLAIN" ? "plain" : clean === "S256" ? "S256" : "";
}

function safeOauthState(value = "") {
  const clean = String(value || "").trim();
  return /^[A-Za-z0-9._~-]{8,160}$/.test(clean) ? clean : "";
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
  if (!["google", "apple"].includes(provider)) {
    sendJson(req, res, 400, { ok: false, error: "unsupported_provider" }, methods);
    return;
  }

  const supabaseUrl = cleanBaseUrl(envText("SUPABASE_URL"));
  const supabaseAuthUrl = cleanSupabaseAuthUrl(envText("SUPABASE_AUTH_URL"), supabaseUrl);
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
  const codeChallenge = safePkceChallenge(queryValue(req, "code_challenge"));
  const codeChallengeMethod = safePkceMethod(queryValue(req, "code_challenge_method"));
  const state = safeOauthState(queryValue(req, "state"));
  if (codeChallenge) params.set("code_challenge", codeChallenge);
  if (codeChallenge && codeChallengeMethod) params.set("code_challenge_method", codeChallengeMethod);
  if (state) params.set("state", state);
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
    const location = response.headers.get("location") || parseOAuthUrlFromBody(body);
    if (!isExpectedProviderOAuthUrl(location, provider)) {
      const message = parseOAuthErrorFromBody(body);
      sendJson(req, res, 502, {
        ok: false,
        error: `missing_${provider}_redirect`,
        status: response.status,
        message
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
      message: error?.message || `Could not create ${provider} OAuth URL`
    }, methods);
  }
};
