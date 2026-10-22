const { envFlag, requireMusicApi, sendJson, trimText } = require("./_music-apis");

const METHODS = ["GET", "OPTIONS"];

module.exports = async function handler(req, res) {
  if (!requireMusicApi(req, res, {
    methods: ["GET"],
    feature: "deezer-preview",
    enabledEnv: "SONIC_DEEZER_PREVIEW_ROUTE_ENABLED",
    defaultEnabled: false,
    allowGlobalFallback: false,
    budgetOnStart: false
  })) return;

  if (!envFlag("SONIC_DEEZER_ENABLED", false)) {
    sendJson(req, res, 503, { ok: false, error: "deezer_disabled" }, METHODS);
    return;
  }

  const trackId = trimText(req.query?.id || "", 32).replace(/\D/g, "");
  if (!trackId) {
    sendJson(req, res, 400, { ok: false, error: "invalid_track_id" }, METHODS);
    return;
  }

  try {
    const response = await fetch(`https://api.deezer.com/track/${encodeURIComponent(trackId)}`, {
      headers: { Accept: "application/json" }
    });
    const payload = await response.json().catch(() => null);
    const previewUrl = String(payload?.preview || "").trim();
    if (!response.ok || payload?.error || !/^https:\/\//i.test(previewUrl)) {
      sendJson(req, res, 404, { ok: false, error: "preview_unavailable" }, METHODS);
      return;
    }

    res.statusCode = 302;
    res.setHeader("Location", previewUrl);
    res.setHeader("Cache-Control", "no-store");
    res.setHeader("Access-Control-Allow-Origin", "*");
    res.end();
  } catch (_error) {
    sendJson(req, res, 502, { ok: false, error: "preview_lookup_failed" }, METHODS);
  }
};
