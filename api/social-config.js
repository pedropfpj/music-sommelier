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
  const supabaseAuthUrl = cleanBaseUrl(envText("SUPABASE_AUTH_URL"), supabaseUrl);
  const supabaseAnonKey = envText("SUPABASE_ANON_KEY") || envText("NEXT_PUBLIC_SUPABASE_ANON_KEY");
  const enabled = envFlag("SONIC_SOCIAL_ENABLED", false) && Boolean(supabaseUrl && supabaseAuthUrl && supabaseAnonKey);

  sendJson(req, res, 200, {
    ok: true,
    enabled,
    provider: "supabase",
    supabaseUrl: enabled ? supabaseUrl : "",
    supabaseAuthUrl: enabled ? supabaseAuthUrl : "",
    supabaseAnonKey: enabled ? supabaseAnonKey : ""
  }, methods);
};
