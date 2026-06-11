const { envFlag, envText, sendJson } = require("./_music-apis");

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

  const supabaseUrl = envText("SUPABASE_URL");
  const supabaseAnonKey = envText("SUPABASE_ANON_KEY") || envText("NEXT_PUBLIC_SUPABASE_ANON_KEY");
  const enabled = envFlag("SONIC_SOCIAL_ENABLED", false) && Boolean(supabaseUrl && supabaseAnonKey);

  sendJson(req, res, 200, {
    ok: true,
    enabled,
    provider: "supabase",
    supabaseUrl: enabled ? supabaseUrl : "",
    supabaseAnonKey: enabled ? supabaseAnonKey : ""
  }, ["GET", "OPTIONS"]);
};
