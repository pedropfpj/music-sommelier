const { envFlag, envText, sendJson, trimText } = require("./_music-apis");

const CATALOG_LIMIT_MAX = 80;

function supabaseConfig() {
  const supabaseUrl = envText("SUPABASE_URL").replace(/\/+$/, "");
  const supabaseAnonKey = envText("SUPABASE_ANON_KEY") || envText("NEXT_PUBLIC_SUPABASE_ANON_KEY");
  const enabled = envFlag("SONIC_CATALOG_EXTRA_ENABLED", envFlag("SONIC_SOCIAL_ENABLED", false)) &&
    Boolean(supabaseUrl && supabaseAnonKey);
  return { enabled, supabaseUrl, supabaseAnonKey };
}

function catalogLimit(value) {
  const parsed = Number.parseInt(String(value || ""), 10);
  if (!Number.isFinite(parsed)) return 24;
  return Math.max(1, Math.min(CATALOG_LIMIT_MAX, parsed));
}

function catalogQuery(req, key, maxLength = 80) {
  return trimText(req.query?.[key] || req.body?.[key] || "", maxLength);
}

function catalogHeaders(config) {
  return {
    apikey: config.supabaseAnonKey,
    Authorization: `Bearer ${config.supabaseAnonKey}`,
    Accept: "application/json"
  };
}

async function fetchCatalogTable(config, table, params) {
  const url = `${config.supabaseUrl}/rest/v1/${table}?${params.toString()}`;
  const response = await fetch(url, { headers: catalogHeaders(config) });
  const payload = await response.json().catch(() => null);
  if (!response.ok) {
    const detail = payload?.message || payload?.error || response.statusText;
    throw new Error(detail || `Could not fetch ${table}`);
  }
  return Array.isArray(payload) ? payload : [];
}

function baseParams({ limit, style }) {
  const params = new URLSearchParams({
    status: "eq.published",
    limit: String(limit)
  });
  if (style) params.set("style", `eq.${style}`);
  return params;
}

function safeIlikeValue(value = "") {
  return String(value || "").replace(/[(),]/g, " ").trim();
}

async function fetchArtists(config, { style, q, limit }) {
  const params = baseParams({ style, limit });
  params.set("select", "id,style,artist,country,city,artist_bio,artist_genre,artist_profile_hint,source,source_url,metadata,created_at");
  params.set("order", "style.asc,artist.asc");
  if (q) params.set("artist", `ilike.*${safeIlikeValue(q)}*`);
  return fetchCatalogTable(config, "catalog_artists", params);
}

async function fetchTracks(config, { style, q, limit }) {
  const params = baseParams({ style, limit });
  params.set("select", "id,style,artist,song,label,bpm_exact,preview_url,release_date,duration_sec,country,city,artist_bio,artist_genre,artist_profile_hint,source,source_url,metadata,created_at");
  params.set("order", "style.asc,artist.asc,song.asc");
  if (q) {
    const clean = safeIlikeValue(q);
    params.set("or", `(artist.ilike.*${clean}*,song.ilike.*${clean}*)`);
  }
  return fetchCatalogTable(config, "catalog_tracks", params);
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

  const config = supabaseConfig();
  if (!config.enabled) {
    sendJson(req, res, 200, {
      ok: true,
      enabled: false,
      artists: [],
      tracks: []
    }, ["GET", "OPTIONS"]);
    return;
  }

  const style = catalogQuery(req, "style", 80);
  const q = catalogQuery(req, "q", 80);
  const type = catalogQuery(req, "type", 20);
  const limit = catalogLimit(catalogQuery(req, "limit", 12));

  try {
    const includeArtists = !type || type === "artists" || type === "all";
    const includeTracks = !type || type === "tracks" || type === "all";
    const [artists, tracks] = await Promise.all([
      includeArtists ? fetchArtists(config, { style, q, limit }) : Promise.resolve([]),
      includeTracks ? fetchTracks(config, { style, q, limit }) : Promise.resolve([])
    ]);
    sendJson(req, res, 200, {
      ok: true,
      enabled: true,
      style,
      q,
      count: {
        artists: artists.length,
        tracks: tracks.length
      },
      artists,
      tracks
    }, ["GET", "OPTIONS"]);
  } catch (error) {
    const setupNeeded = /catalog_(artists|tracks)|schema cache|does not exist|could not find/i.test(String(error.message || ""));
    sendJson(req, res, setupNeeded ? 200 : 500, {
      ok: false,
      enabled: true,
      setupNeeded,
      error: "catalog_extra_failed",
      detail: error.message,
      artists: [],
      tracks: []
    }, ["GET", "OPTIONS"]);
  }
};
