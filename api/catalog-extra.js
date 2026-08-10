const {
  enforceDurableMusicDailyLimit,
  envFlag,
  envText,
  requireMusicApi,
  sendJson,
  trimText
} = require("../lib/api/_music-apis");

const CATALOG_LIMIT_MAX = 200;
const PSYTRANCE_CATALOG_STYLES = new Set([
  "psytrance", "forest_psy", "dark_psy", "twilight_psy", "dark_experimental",
  "psycore", "psybreaks", "psybient", "freeform", "full_on", "full_on_night",
  "full_on_morning", "progressive_psy", "hi_tech", "dark_progressive", "goa_trance",
  "psy_comercial", "slambient"
]);
const BLOCKED_PSYTRANCE_TRACK_KEYS = new Set([
  "furious::don't change your style",
  "furious::hang your head",
  "furious::punk bashin' boogie",
  "furious::wet",
  "furious::who to trust",
  "silent horror::17 kills",
  "silent horror::murder castle",
  "silent horror::silver screen",
  "silent horror::the cabinet of dr. caligari",
  "cosmo::alle meine nachbarn",
  "cosmo::den sommer uberleben",
  "cosmo::du machst mich high",
  "cosmo::tanzschein",
  "n.o.m::i can't wait",
  "n.o.m::look",
  "n.o.m::mega punch",
  "parus::high voltage",
  "parus::laboom",
  "parus::legend",
  "quasar::be my lover (techno)",
  "quasar::drenagem",
  "quasar::em seu lugar",
  "quasar::termo",
  "loke::plata ou nada (feat. dogga dogga)"
]);

const CATALOG_STYLE_BPM_RANGES = {
  full_on_night: { min: 146, max: 154 },
  forest_psy: { min: 145, max: 154 },
  dark_psy: { min: 154, max: 175 },
  hi_tech: { min: 176, max: 230 },
  psycore: { min: 175, max: 300 },
  techno: { min: 128, max: 136 },
  acid_techno: { min: 124, max: 145 },
  hard_techno: { min: 145, max: 160 },
  industrial_techno: { min: 130, max: 150 },
  dub_techno: { min: 118, max: 128 }
};

const STRICT_TECHNO_STYLE_ARTISTS = Object.fromEntries(Object.entries({
  acid_techno: [
    "Phuture", "Hardfloor", "Josh Wink", "Emmanuel Top", "Tin Man", "Boston 168",
    "Regal", "Kink", "Luke Vibert", "A*S*Y*S", "Thomas P. Heckmann", "DJ Misjah",
    "999999999", "D.A.V.E. The Drummer", "Chris Liberator", "Sterling Moss", "Benji303"
  ],
  hard_techno: [
    "Alignment", "Sara Landry", "I Hate Models", "Klangkuenstler", "Shlomo", "Shlømo",
    "Airod", "Nico Moreno", "Trym", "Charlie Sparks", "Charlie Sparks (UK)", "Kobosil",
    "999999999", "DYEN", "Rebekah", "Paula Temple", "Perc", "Viper Diva", "SPFDJ",
    "Onlynumbers", "CLTX", "Basswell", "Brutalismus 3000", "6EJOU", "Fantasm"
  ],
  dub_techno: [
    "Andy Stott", "Basic Channel", "bvdub", "cv313", "Deadbeat", "Deepchord", "Echospace",
    "Fluxion", "Intrusion", "Maurizio", "Monolake", "Porter Ricks", "Quantec",
    "Rhythm & Sound", "Rod Modell", "STL", "Swayzak", "Vladislav Delay", "Yagya"
  ]
}).map(([style, artists]) => [style, new Set(artists.map(normalizedCatalogIdentity))]));

function normalizedCatalogText(value = "") {
  return String(value || "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/\s+/g, " ")
    .trim();
}

function normalizedCatalogIdentity(value = "") {
  return normalizedCatalogText(value)
    .replace(/ø/g, "o")
    .replace(/[^a-z0-9]+/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function explicitCatalogTitleBpm(value = "") {
  const match = String(value || "")
    .replace(",", ".")
    .match(/(?:^|[\s([_-])(\d{2,3}(?:\.\d+)?)\s*bpm\b/i);
  if (!match) return 0;
  const bpm = Number(match[1]);
  return Number.isFinite(bpm) && bpm >= 40 && bpm <= 400 ? bpm : 0;
}

function catalogBpmFitsStyle(style = "", bpm = 0) {
  const range = CATALOG_STYLE_BPM_RANGES[String(style || "").trim().toLowerCase()];
  if (!range || !Number.isFinite(Number(bpm)) || Number(bpm) <= 0) return true;
  return Number(bpm) >= range.min && Number(bpm) <= range.max;
}

function catalogTrackPassesTechnoIdentity(row = {}) {
  const style = String(row.style || "").trim().toLowerCase();
  const allowedArtists = STRICT_TECHNO_STYLE_ARTISTS[style];
  if (!allowedArtists) return true;
  const artist = normalizedCatalogIdentity(row.artist);
  if (!artist) return false;
  return Array.from(allowedArtists).some((seed) => (
    artist === seed ||
    artist.startsWith(`${seed} feat `) ||
    artist.startsWith(`${seed} ft `) ||
    artist.startsWith(`${seed} x `) ||
    artist.startsWith(`${seed} and `)
  ));
}

function catalogTrackPassesStyleBpm(row = {}) {
  const style = String(row.style || "").trim().toLowerCase();
  const exactBpm = Number(row.bpm_exact) || 0;
  const titleBpm = explicitCatalogTitleBpm(row.song);
  return catalogBpmFitsStyle(style, exactBpm) && catalogBpmFitsStyle(style, titleBpm);
}

function catalogMetadata(row = {}) {
  if (row.metadata && typeof row.metadata === "object" && !Array.isArray(row.metadata)) return row.metadata;
  if (typeof row.metadata !== "string" || !row.metadata.trim()) return {};
  try {
    const parsed = JSON.parse(row.metadata);
    return parsed && typeof parsed === "object" && !Array.isArray(parsed) ? parsed : {};
  } catch (_error) {
    return {};
  }
}

function catalogTrackPassesPsytranceIntegrity(row = {}) {
  const style = String(row.style || "").trim().toLowerCase();
  if (!PSYTRANCE_CATALOG_STYLES.has(style)) return true;
  const trackKey = `${normalizedCatalogText(row.artist)}::${normalizedCatalogText(row.song)}`;
  if (BLOCKED_PSYTRANCE_TRACK_KEYS.has(trackKey)) return false;

  const metadata = catalogMetadata(row);
  const releaseGenres = normalizedCatalogText(metadata.album_genres || metadata.release_genres || "");
  if (!releaseGenres) return true;
  const hardWrongGenre = /\b(?:alternative|alternativo|rock|rockabilly|reggae|hip\s*hop|rap|r\s*and\s*b|rhythm\s+and\s+blues|country|folk|sertanejo|gospel|classical|classico|orchestral)\b/;
  const electronicGenre = /\b(?:psytrance|psy\s+trance|trance|goa|electro|electronic|electronica|dance|techno|ambient)\b/;
  return !hardWrongGenre.test(releaseGenres) || electronicGenre.test(releaseGenres);
}

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

function catalogOffset(value) {
  const parsed = Number.parseInt(String(value || ""), 10);
  if (!Number.isFinite(parsed) || parsed < 0) return 0;
  return Math.min(20000, parsed);
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

function baseParams({ limit, style, offset = 0 }) {
  const params = new URLSearchParams({
    status: "eq.published",
    limit: String(limit),
    offset: String(offset)
  });
  params.set("metadata->>electronic_gate", "eq.passed");
  if (style) params.set("style", `eq.${style}`);
  return params;
}

function safeIlikeValue(value = "") {
  return String(value || "").replace(/[(),]/g, " ").trim();
}

async function fetchArtists(config, { style, q, limit, offset }) {
  const params = baseParams({ style, limit, offset });
  params.set("select", "id,style,artist,country,city,artist_bio,artist_genre,artist_profile_hint,source,source_url,metadata,created_at");
  params.set("order", "style.asc,artist.asc");
  if (q) params.set("artist", `ilike.*${safeIlikeValue(q)}*`);
  return fetchCatalogTable(config, "catalog_artists", params);
}

async function fetchTracks(config, { style, q, limit, offset }) {
  const params = baseParams({ style, limit, offset });
  params.set("select", "id,style,artist,song,label,bpm_exact,preview_url,release_date,duration_sec,country,city,artist_bio,artist_genre,artist_profile_hint,source,source_url,metadata,created_at");
  params.set("order", "style.asc,artist.asc,song.asc");
  if (q) {
    const clean = safeIlikeValue(q);
    params.set("or", `(artist.ilike.*${clean}*,song.ilike.*${clean}*)`);
  }
  const rows = await fetchCatalogTable(config, "catalog_tracks", params);
  return rows.filter((row) => (
    catalogTrackPassesPsytranceIntegrity(row) &&
    catalogTrackPassesTechnoIdentity(row) &&
    catalogTrackPassesStyleBpm(row)
  ));
}

module.exports = async function handler(req, res) {
  const methods = ["GET", "OPTIONS"];
  if (!requireMusicApi(req, res, {
    methods: ["GET"],
    feature: "catalog-extra",
    enabledEnv: "SONIC_CATALOG_EXTRA_ROUTE_ENABLED",
    defaultEnabled: true,
    allowGlobalFallback: false,
    dailyLimitEnv: "SONIC_CATALOG_EXTRA_DAILY_LIMIT",
    defaultDailyLimit: 240,
    budgetOnStart: false
  })) return;

  if (!await enforceDurableMusicDailyLimit(req, res, {
    feature: "catalog-extra",
    dailyLimitEnv: "SONIC_CATALOG_EXTRA_DAILY_LIMIT",
    defaultDailyLimit: 240,
    methods
  })) return;

  const config = supabaseConfig();
  if (!config.enabled) {
    sendJson(req, res, 200, {
      ok: true,
      enabled: false,
      artists: [],
      tracks: []
    }, methods);
    return;
  }

  const style = catalogQuery(req, "style", 80);
  const q = catalogQuery(req, "q", 80);
  const type = catalogQuery(req, "type", 20);
  const limit = catalogLimit(catalogQuery(req, "limit", 12));
  const offset = catalogOffset(catalogQuery(req, "offset", 12));

  try {
    const includeArtists = !type || type === "artists" || type === "all";
    const includeTracks = !type || type === "tracks" || type === "all";
    const [artists, tracks] = await Promise.all([
      includeArtists ? fetchArtists(config, { style, q, limit, offset }) : Promise.resolve([]),
      includeTracks ? fetchTracks(config, { style, q, limit, offset }) : Promise.resolve([])
    ]);
    sendJson(req, res, 200, {
      ok: true,
      enabled: true,
      style,
      q,
      offset,
      count: {
        artists: artists.length,
        tracks: tracks.length
      },
      artists,
      tracks
    }, methods);
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
    }, methods);
  }
};
