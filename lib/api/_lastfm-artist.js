const { enforceDurableMusicDailyLimit, envInt, envText, parseBody, requireMusicApi, sendJson, trimText } = require("./_music-apis");
const { persistCatalogEnrichments } = require("./_catalog-enrichment-store");

const LASTFM_API_URL = "https://ws.audioscrobbler.com/2.0/";
const LASTFM_SOURCE_DETAIL = {
  name: "Last.fm",
  provider: "Last.fm API",
  dataType: "artist tags, similar artists, top tracks and short biography",
  url: "https://www.last.fm/api",
  license: "Last.fm API terms",
  attribution: "Artist metadata from Last.fm.",
  backendOnly: true,
  cached: true
};

const cache = new Map();

function normalizeText(value = "") {
  return String(value || "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/&/g, " and ")
    .replace(/[^a-z0-9]+/g, " ")
    .trim();
}

function cacheKey({ artist = "", language = "en" } = {}) {
  return `${normalizeText(artist)}::${normalizeText(language).slice(0, 2) || "en"}`;
}

function cacheRead(key) {
  const entry = cache.get(key);
  if (!entry || entry.expiresAt <= Date.now()) {
    cache.delete(key);
    return null;
  }
  return entry.payload;
}

function cacheWrite(key, payload) {
  cache.set(key, {
    payload,
    expiresAt: Date.now() + envInt("SONIC_LASTFM_CACHE_SECONDS", 86400, 300, 604800) * 1000
  });
  if (cache.size > 300) {
    const firstKey = cache.keys().next().value;
    if (firstKey) cache.delete(firstKey);
  }
}

function lastfmApiKey() {
  return envText("LASTFM_API_KEY") || envText("SONIC_LASTFM_API_KEY");
}

function safeLanguage(value = "en") {
  const clean = normalizeText(value).slice(0, 2);
  return ["en", "pt", "es", "fr", "de", "it", "ja", "pl", "ru", "sv", "tr", "zh"].includes(clean) ? clean : "en";
}

function stripHtml(value = "") {
  return String(value || "")
    .replace(/<script\b[\s\S]*?<\/script>/gi, " ")
    .replace(/<style\b[\s\S]*?<\/style>/gi, " ")
    .replace(/<[^>]+>/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&quot;/g, "\"")
    .replace(/&#39;/g, "'")
    .replace(/\s+/g, " ")
    .replace(/\s*read more on last\.fm\.?\s*$/i, "")
    .trim();
}

function lastfmImage(images = []) {
  if (!Array.isArray(images)) return "";
  const preferred = [...images].reverse().find((image) => trimText(image?.["#text"] || "", 1200));
  return trimText(preferred?.["#text"] || "", 1200);
}

async function fetchLastfm(params = {}) {
  const apiKey = lastfmApiKey();
  if (!apiKey) {
    const error = new Error("missing_lastfm_api_key");
    error.statusCode = 503;
    throw error;
  }

  const query = new URLSearchParams({
    api_key: apiKey,
    format: "json",
    ...params
  });
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), envInt("SONIC_LASTFM_TIMEOUT_MS", 5200, 1000, 15000));
  try {
    const response = await fetch(`${LASTFM_API_URL}?${query.toString()}`, {
      method: "GET",
      headers: { Accept: "application/json" },
      signal: controller.signal
    });
    const payload = await response.json().catch(() => null);
    if (!response.ok || payload?.error) return null;
    return payload;
  } catch (_error) {
    return null;
  } finally {
    clearTimeout(timeout);
  }
}

function normalizeTags(info = {}) {
  const tags = Array.isArray(info?.tags?.tag) ? info.tags.tag : [];
  return tags
    .map((tag) => ({
      name: trimText(tag?.name || "", 80),
      url: trimText(tag?.url || "", 500)
    }))
    .filter((tag) => tag.name)
    .slice(0, 12);
}

function normalizeSimilar(payload = {}) {
  const rows = Array.isArray(payload?.similarartists?.artist) ? payload.similarartists.artist : [];
  return rows
    .map((artist) => ({
      name: trimText(artist?.name || "", 140),
      url: trimText(artist?.url || "", 500),
      match: Number(artist?.match) || 0,
      imageUrl: lastfmImage(artist?.image)
    }))
    .filter((artist) => artist.name)
    .slice(0, 12);
}

function normalizeTopTracks(payload = {}) {
  const rows = Array.isArray(payload?.toptracks?.track) ? payload.toptracks.track : [];
  return rows
    .map((track) => ({
      name: trimText(track?.name || "", 180),
      artist: trimText(track?.artist?.name || "", 140),
      url: trimText(track?.url || "", 500),
      playcount: Math.max(0, Number(track?.playcount) || 0),
      listeners: Math.max(0, Number(track?.listeners) || 0),
      imageUrl: lastfmImage(track?.image)
    }))
    .filter((track) => track.name)
    .slice(0, 12);
}

function normalizeArtistProfile({ artist = "", language = "en", info = {}, similar = {}, topTracks = {} } = {}) {
  const row = info?.artist || {};
  if (!row?.name && !artist) return null;
  const url = trimText(row?.url || "", 500);
  const sourceDetails = [{
    ...LASTFM_SOURCE_DETAIL,
    url: url || LASTFM_SOURCE_DETAIL.url
  }];
  return {
    name: trimText(row?.name || artist, 140),
    url,
    listeners: Math.max(0, Number(row?.stats?.listeners) || 0),
    playcount: Math.max(0, Number(row?.stats?.playcount) || 0),
    tags: normalizeTags(row),
    bioSummary: trimText(stripHtml(row?.bio?.summary || ""), 700),
    bioContent: trimText(stripHtml(row?.bio?.content || ""), 1600),
    imageUrl: lastfmImage(row?.image),
    similarArtists: normalizeSimilar(similar),
    topTracks: normalizeTopTracks(topTracks),
    language,
    sourceDetails,
    attribution: {
      providers: ["Last.fm"],
      line: "Artist data: Last.fm.",
      details: sourceDetails
    }
  };
}

module.exports = async function handler(req, res) {
  if (!requireMusicApi(req, res, {
    methods: ["GET", "POST"],
    feature: "lastfm-artist",
    enabledEnv: "SONIC_LASTFM_ENABLED",
    defaultEnabled: true,
    allowGlobalFallback: false,
    dailyLimitEnv: "SONIC_LASTFM_DAILY_LIMIT",
    defaultDailyLimit: 80
  })) return;
  if (!await enforceDurableMusicDailyLimit(req, res, {
    methods: ["GET", "POST"],
    feature: "lastfm-artist",
    dailyLimitEnv: "SONIC_LASTFM_DAILY_LIMIT",
    defaultDailyLimit: 80
  })) return;

  const body = parseBody(req);
  const artist = trimText(body.artist || req.query?.artist || "", 140);
  const language = safeLanguage(body.language || body.lang || req.query?.language || req.query?.lang || "en");

  if (!artist) {
    sendJson(req, res, 400, { error: "missing_artist" }, ["GET", "POST", "OPTIONS"]);
    return;
  }

  if (!lastfmApiKey()) {
    sendJson(req, res, 503, { error: "missing_lastfm_api_key" }, ["GET", "POST", "OPTIONS"]);
    return;
  }

  const key = cacheKey({ artist, language });
  const cached = cacheRead(key);
  if (cached) {
    sendJson(req, res, 200, { ...cached, cached: true }, ["GET", "POST", "OPTIONS"]);
    return;
  }

  try {
    const [info, similar, topTracks] = await Promise.all([
      fetchLastfm({ method: "artist.getinfo", artist, autocorrect: "1", lang: language }),
      fetchLastfm({ method: "artist.getsimilar", artist, autocorrect: "1", limit: "12" }),
      fetchLastfm({ method: "artist.gettoptracks", artist, autocorrect: "1", limit: "12" })
    ]);
    const profile = normalizeArtistProfile({ artist, language, info, similar, topTracks });
    const payload = {
      ok: true,
      enabled: true,
      source: "lastfm",
      artist,
      language,
      profile,
      sourceDetails: [LASTFM_SOURCE_DETAIL],
      attribution: profile?.attribution || {
        providers: ["Last.fm"],
        line: "Artist data: Last.fm.",
        details: [LASTFM_SOURCE_DETAIL]
      }
    };
    cacheWrite(key, payload);
    if (profile) {
      await persistCatalogEnrichments({
        entityType: "artist",
        artist,
        source: "lastfm",
        sourceUrl: profile.url || LASTFM_SOURCE_DETAIL.url,
        confidence: 0.78,
        payload: {
          artist,
          language,
          listeners: profile.listeners,
          playcount: profile.playcount,
          tags: profile.tags,
          similarArtists: profile.similarArtists,
          topTracks: profile.topTracks,
          bioSummary: profile.bioSummary,
          imageUrl: profile.imageUrl,
          attribution: payload.attribution
        }
      });
    }
    sendJson(req, res, 200, payload, ["GET", "POST", "OPTIONS"]);
  } catch (error) {
    sendJson(req, res, error.statusCode || 500, {
      ok: false,
      error: error.message || "lastfm_artist_failed"
    }, ["GET", "POST", "OPTIONS"]);
  }
};
