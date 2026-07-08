const { envFlag, envText, requireMusicApi, sendJson } = require("../lib/api/_music-apis");

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

function configuredSocialProviders() {
  const raw = envText("SONIC_SOCIAL_PROVIDERS") || "google,apple";
  const providers = raw
    .split(",")
    .map((entry) => entry.trim().toLowerCase())
    .filter((entry) => ["google", "apple"].includes(entry));
  return Array.from(new Set(providers.length ? providers : ["google", "apple"]));
}

function requestOrigin(req) {
  const host = String(req.headers?.host || "").trim();
  if (!host) return "https://sonicsearch.app";
  const forwardedProto = String(req.headers?.["x-forwarded-proto"] || "").split(",")[0].trim();
  const localHost = host.startsWith("localhost") || host.startsWith("127.0.0.1");
  const protocol = forwardedProto || (localHost ? "http" : "https");
  return `${protocol}://${host}`;
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

async function providerAvailable({ provider, supabaseAuthUrl, redirectTo }) {
  const params = new URLSearchParams({
    provider,
    redirect_to: redirectTo
  });
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 3500);
  try {
    const response = await fetch(`${supabaseAuthUrl}/auth/v1/authorize?${params.toString()}`, {
      method: "GET",
      redirect: "manual",
      signal: controller.signal,
      headers: {
        Accept: "text/plain, text/html;q=0.9, */*;q=0.8"
      }
    });
    const body = await response.text().catch(() => "");
    const location = response.headers.get("location") || parseOAuthUrlFromBody(body);
    return isExpectedProviderOAuthUrl(location, provider);
  } catch (_err) {
    return true;
  } finally {
    clearTimeout(timeout);
  }
}

async function availableSocialProviders({ providers, supabaseAuthUrl, redirectTo }) {
  if (!envFlag("SONIC_SOCIAL_VALIDATE_PROVIDERS", true)) return providers;
  const checks = await Promise.all(
    providers.map(async (provider) => ({
      provider,
      available: await providerAvailable({ provider, supabaseAuthUrl, redirectTo })
    }))
  );
  return checks
    .filter((check) => check.available)
    .map((check) => check.provider);
}

module.exports = async function handler(req, res) {
  const methods = ["GET", "OPTIONS"];
  if (!requireMusicApi(req, res, {
    methods: ["GET"],
    feature: "social-config",
    enabledEnv: "SONIC_SOCIAL_CONFIG_ROUTE_ENABLED",
    defaultEnabled: true,
    allowGlobalFallback: false
  })) return;

  const supabaseUrl = cleanBaseUrl(envText("SUPABASE_URL"));
  const supabaseAuthUrl = cleanSupabaseAuthUrl(envText("SUPABASE_AUTH_URL"), supabaseUrl);
  const supabaseAnonKey = envText("SUPABASE_ANON_KEY") || envText("NEXT_PUBLIC_SUPABASE_ANON_KEY");
  const enabled = envFlag("SONIC_SOCIAL_ENABLED", false) && Boolean(supabaseUrl && supabaseAuthUrl && supabaseAnonKey);
  const providers = enabled
    ? await availableSocialProviders({
      providers: configuredSocialProviders(),
      supabaseAuthUrl,
      redirectTo: requestOrigin(req)
    })
    : [];

  sendJson(req, res, 200, {
    ok: true,
    enabled,
    provider: "supabase",
    providers,
    supabaseUrl: enabled ? supabaseUrl : "",
    supabaseAuthUrl: enabled ? supabaseAuthUrl : "",
    supabaseAnonKey: enabled ? supabaseAnonKey : ""
  }, methods);
};
