const {
  enforceDurableMusicDailyLimit,
  envFlag,
  envText,
  requireMusicApi,
  sendJson,
  trimText
} = require("./_music-apis");
const universalMusic = require("../../universal-music");

const METHODS = ["GET", "OPTIONS"];
const MAX_LIMIT = 60;

function config() {
  const supabaseUrl = envText("SUPABASE_URL").replace(/\/+$/, "");
  const supabaseKey = envText("SUPABASE_ANON_KEY") || envText("NEXT_PUBLIC_SUPABASE_ANON_KEY");
  return {
    enabled: envFlag("SONIC_UNIVERSAL_CATALOG_ENABLED", false) && Boolean(supabaseUrl && supabaseKey),
    supabaseUrl,
    supabaseKey
  };
}

function safeQueryValue(value = "") {
  return trimText(value, 100).replace(/[*,()]/g, " ").replace(/\s+/g, " ").trim();
}

function boundedInteger(value, fallback, max) {
  const parsed = Number.parseInt(String(value || ""), 10);
  if (!Number.isFinite(parsed)) return fallback;
  return Math.max(0, Math.min(max, parsed));
}

async function fetchUniversalCatalog(settings, { universe, genre, q, limit, offset }) {
  const params = new URLSearchParams({
    select: "id,song,artist,artist_id,genre_slug,universe_slug,release_title,label,release_date,duration_sec,explicit,verification_confidence,audio_descriptors,metadata,provider_links",
    limit: String(limit),
    offset: String(offset),
    order: "verification_confidence.desc,release_date.desc.nullslast"
  });
  if (universe) params.set("universe_slug", `eq.${universe}`);
  if (genre) params.set("genre_slug", `eq.${genre}`);
  if (q) params.set("or", `(artist.ilike.*${q}*,song.ilike.*${q}*)`);
  const response = await fetch(`${settings.supabaseUrl}/rest/v1/music_catalog_public_v1?${params}`, {
    headers: {
      apikey: settings.supabaseKey,
      Authorization: `Bearer ${settings.supabaseKey}`,
      Accept: "application/json"
    }
  });
  const payload = await response.json().catch(() => null);
  if (!response.ok) throw new Error(payload?.message || payload?.error || `universal_catalog_${response.status}`);
  return Array.isArray(payload) ? payload : [];
}

module.exports = async function handler(req, res) {
  if (!requireMusicApi(req, res, {
    methods: ["GET"],
    feature: "universal-catalog",
    enabledEnv: "SONIC_UNIVERSAL_CATALOG_ROUTE_ENABLED",
    defaultEnabled: true,
    allowGlobalFallback: false,
    dailyLimitEnv: "SONIC_UNIVERSAL_CATALOG_DAILY_LIMIT",
    defaultDailyLimit: 240,
    budgetOnStart: false
  })) return;

  if (!await enforceDurableMusicDailyLimit(req, res, {
    feature: "universal-catalog",
    dailyLimitEnv: "SONIC_UNIVERSAL_CATALOG_DAILY_LIMIT",
    defaultDailyLimit: 240,
    methods: METHODS
  })) return;

  const settings = config();
  const requestedUniverse = safeQueryValue(req.query?.universe || "");
  if (requestedUniverse && !universalMusic.isKnownUniverse(requestedUniverse)) {
    sendJson(req, res, 400, {
      ok: false,
      error: "invalid_music_universe",
      allowedUniverses: universalMusic.listUniverses("pt").map((item) => item.slug)
    }, METHODS);
    return;
  }
  const universe = requestedUniverse ? universalMusic.normalizeUniverse(requestedUniverse) : "";
  const genre = universalMusic.normalizeKey(safeQueryValue(req.query?.genre || ""));
  const q = safeQueryValue(req.query?.q || "");
  const limit = Math.max(1, boundedInteger(req.query?.limit, 24, MAX_LIMIT));
  const offset = boundedInteger(req.query?.offset, 0, 10000);

  if (!settings.enabled) {
    sendJson(req, res, 200, {
      ok: true,
      enabled: false,
      setupNeeded: false,
      schemaVersion: universalMusic.schemaVersion,
      universe,
      genre,
      q,
      count: 0,
      tracks: []
    }, METHODS);
    return;
  }

  try {
    const rows = await fetchUniversalCatalog(settings, { universe, genre, q, limit, offset });
    const tracks = rows
      .map((row) => universalMusic.canonicalCandidate({
        ...row,
        key: row.id,
        universe: row.universe_slug,
        genre: row.genre_slug,
        providerLinks: Array.isArray(row.provider_links) ? row.provider_links : [],
        playable: Array.isArray(row.provider_links) && row.provider_links.length > 0,
        confidence: row.verification_confidence
      }))
      .filter((track) => track.playable);
    res.setHeader("Cache-Control", q ? "private, no-store" : "public, max-age=60, s-maxage=300, stale-while-revalidate=1800");
    sendJson(req, res, 200, {
      ok: true,
      enabled: true,
      schemaVersion: universalMusic.schemaVersion,
      universe,
      genre,
      q,
      offset,
      count: tracks.length,
      tracks
    }, METHODS);
  } catch (error) {
    const setupNeeded = /music_catalog_public_v1|schema cache|does not exist|could not find/i.test(String(error.message || ""));
    sendJson(req, res, setupNeeded ? 200 : 500, {
      ok: false,
      enabled: true,
      setupNeeded,
      error: "universal_catalog_failed",
      detail: error.message,
      universe,
      genre,
      q,
      count: 0,
      tracks: []
    }, METHODS);
  }
};
