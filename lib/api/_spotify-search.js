const { enforceDurableMusicDailyLimit, envInt, envText, parseBody, requireMusicApi, sendJson, trimText } = require("./_music-apis");

const TOKEN_URL = "https://accounts.spotify.com/api/token";
const SEARCH_URL = "https://api.spotify.com/v1/search";
const SPOTIFY_SOURCE_DETAIL = {
  name: "Spotify",
  provider: "Spotify Web API",
  dataType: "track search result, public track link and catalog metadata",
  url: "https://developer.spotify.com/documentation/web-api/reference/search",
  license: "Spotify Developer Terms",
  attribution: "Track metadata from the Spotify Web API."
};
let cachedToken = null;

function safeLimit(value, fallback = 8) {
  const parsed = Number.parseInt(String(value || ""), 10);
  if (!Number.isFinite(parsed)) return fallback;
  return Math.max(1, Math.min(20, parsed));
}

function normalizeText(value = "") {
  return String(value || "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/&/g, " and ")
    .replace(/[^a-z0-9]+/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function titleConfidence(requested = "", candidate = "") {
  const left = normalizeText(requested);
  const right = normalizeText(candidate);
  if (!left || !right) return 0;
  if (left === right) return 1;
  if (left.includes(right) || right.includes(left)) {
    return Math.min(left.length, right.length) / Math.max(left.length, right.length);
  }
  const leftTokens = new Set(left.split(" ").filter(Boolean));
  const rightTokens = new Set(right.split(" ").filter(Boolean));
  const intersection = [...leftTokens].filter((token) => rightTokens.has(token)).length;
  const union = new Set([...leftTokens, ...rightTokens]).size || 1;
  return intersection / union;
}

function artistMatches(candidate = "", requested = "") {
  const left = normalizeText(candidate);
  const right = normalizeText(requested);
  if (!left || !right) return false;
  return left === right || left.includes(right) || right.includes(left);
}

function alternateVersionPenalty(requested = "", candidate = "") {
  const request = normalizeText(requested);
  const title = normalizeText(candidate);
  if (!request || !title || request === title) return 0;
  return /\b(live|mix|remix|edit|version|instrumental|karaoke|cover|session|sped up|slowed)\b/.test(title) ? 0.2 : 0;
}

function scoreSpotifyTrack(track = {}, request = {}) {
  const artistText = Array.isArray(track.artists)
    ? track.artists.map((artist) => artist?.name || "").join(" ")
    : "";
  let score = titleConfidence(request.song, track.name) - alternateVersionPenalty(request.song, track.name);
  if (request.artist && artistMatches(artistText, request.artist)) score += 0.1;
  if (request.album && track.album?.name) score += titleConfidence(request.album, track.album.name) * 0.06;
  return Math.max(0, Math.min(1, score));
}

function normalizeSpotifyTrack(row = {}, request = {}) {
  const artists = Array.isArray(row.artists) ? row.artists : [];
  const artist = trimText(artists.map((item) => item?.name || "").filter(Boolean).join(", "), 180);
  const primaryArtist = artists[0] || {};
  const artistUrl = trimText(primaryArtist.external_urls?.spotify || "", 900);
  const title = trimText(row.name || "", 180);
  const url = trimText(row.external_urls?.spotify || "", 900);
  if (!row.id || !title || !artist || !url) return null;
  const album = row.album || {};
  const images = Array.isArray(album.images) ? album.images : [];
  const coverArtUrl = trimText(images[0]?.url || images[1]?.url || images[2]?.url || "", 1200);
  const detail = {
    ...SPOTIFY_SOURCE_DETAIL,
    url
  };
  const confidenceScore = scoreSpotifyTrack(row, request);

  return {
    id: String(row.id),
    title,
    song: title,
    artist,
    album: trimText(album.name || "", 180),
    label: trimText(album.name || "Spotify", 140),
    style: trimText(request.style || "", 80),
    durationSec: Math.max(0, Math.round((Number(row.duration_ms) || 0) / 1000)),
    releaseDate: trimText(album.release_date || "", 40),
    catalogRef: trimText(row.external_ids?.isrc || row.id || "SPOTIFY", 90),
    popularity: Math.max(0, Number(row.popularity) || 0),
    explicit: Boolean(row.explicit),
    previewUrl: trimText(row.preview_url || "", 1200),
    preview: trimText(row.preview_url || "", 1200),
    coverArtUrl,
    trackUrl: url,
    spotifyTrackUrl: url,
    spotifyUrl: url,
    spotifyArtistUrl: artistUrl,
    artistUrl,
    source: "spotify_api",
    sourceDetails: [detail],
    attribution: {
      providers: ["Spotify"],
      line: "Track data: Spotify.",
      details: [detail]
    },
    spotifyVerified: true,
    existenceVerified: true,
    confidenceScore
  };
}

async function getSpotifyToken() {
  const now = Date.now();
  if (cachedToken?.value && cachedToken.expiresAt > now + 30000) return cachedToken.value;

  const clientId = envText("SPOTIFY_CLIENT_ID") || envText("SONIC_SPOTIFY_CLIENT_ID");
  const clientSecret = envText("SPOTIFY_CLIENT_SECRET") || envText("SONIC_SPOTIFY_CLIENT_SECRET");
  if (!clientId || !clientSecret) {
    const error = new Error("missing_spotify_credentials");
    error.statusCode = 503;
    throw error;
  }

  const credentials = Buffer.from(`${clientId}:${clientSecret}`).toString("base64");
  const response = await fetch(TOKEN_URL, {
    method: "POST",
    headers: {
      Authorization: `Basic ${credentials}`,
      "Content-Type": "application/x-www-form-urlencoded",
      Accept: "application/json"
    },
    body: new URLSearchParams({ grant_type: "client_credentials" }).toString()
  });

  const payload = await response.json().catch(() => ({}));
  if (!response.ok || !payload?.access_token) {
    const error = new Error("spotify_auth_failed");
    error.statusCode = response.status || 502;
    error.detail = payload?.error_description || payload?.error || response.statusText;
    throw error;
  }

  const expiresIn = Math.max(60, Number(payload.expires_in) || 3600);
  cachedToken = {
    value: payload.access_token,
    expiresAt: now + (expiresIn * 1000) - 60000
  };
  return cachedToken.value;
}

function queryVariants({ query = "", artist = "", song = "", style = "" } = {}) {
  const direct = trimText(query, 180);
  const exact = artist && song ? `track:"${song}" artist:"${artist}"` : "";
  const plain = [artist, song].filter(Boolean).join(" ");
  const styled = [artist, song, style].filter(Boolean).join(" ");
  const variants = [direct, exact, plain, styled]
    .map((item) => trimText(item, 180))
    .filter(Boolean);
  const seen = new Set();
  return variants.filter((item) => {
    const key = normalizeText(item);
    if (!key || seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

async function fetchSpotifyTracks({ query, artist, song, style, album, limit }) {
  const token = await getSpotifyToken();
  const market = envText("SONIC_SPOTIFY_MARKET") || envText("SPOTIFY_MARKET");
  const rowsById = new Map();
  const variants = queryVariants({ query, artist, song, style });
  const request = { artist, song, style, album };
  const minScore = Math.max(0, Math.min(1, Number(envText("SONIC_SPOTIFY_MIN_CONFIDENCE", "0.72")) || 0.72));

  for (const searchQuery of variants.slice(0, 3)) {
    const params = new URLSearchParams({
      q: searchQuery,
      type: "track",
      limit: String(limit)
    });
    if (market) params.set("market", market);

    const response = await fetch(`${SEARCH_URL}?${params.toString()}`, {
      headers: {
        Authorization: `Bearer ${token}`,
        Accept: "application/json"
      }
    });
    const payload = await response.json().catch(() => ({}));
    if (!response.ok) {
      const error = new Error("spotify_search_failed");
      error.statusCode = response.status || 502;
      error.detail = payload?.error?.message || payload?.error_description || payload?.error || response.statusText;
      throw error;
    }

    const items = Array.isArray(payload?.tracks?.items) ? payload.tracks.items : [];
    items
      .map((row) => normalizeSpotifyTrack(row, request))
      .filter(Boolean)
      .forEach((track) => {
        if (!rowsById.has(track.id)) rowsById.set(track.id, track);
      });
    if (Array.from(rowsById.values()).some((track) => Number(track.confidenceScore) >= 0.94)) break;
  }

  return Array.from(rowsById.values())
    .filter((track) => {
      if (!artist && !song) return true;
      if (artist && !artistMatches(track.artist, artist)) return false;
      if (song && Number(track.confidenceScore) < minScore) return false;
      return true;
    })
    .sort((a, b) => {
      const scoreDiff = (Number(b.confidenceScore) || 0) - (Number(a.confidenceScore) || 0);
      if (scoreDiff) return scoreDiff;
      return (Number(b.popularity) || 0) - (Number(a.popularity) || 0);
    })
    .slice(0, limit);
}

function spotifyAttribution(tracks = []) {
  const details = [];
  tracks.forEach((track) => {
    const detail = Array.isArray(track?.sourceDetails) ? track.sourceDetails[0] : null;
    if (!detail) return;
    if (!details.some((item) => item.provider === detail.provider)) details.push(detail);
  });
  const providers = Array.from(new Set(details.map((detail) => detail.name || detail.provider).filter(Boolean)));
  return {
    providers,
    line: providers.length ? `Track data: ${providers.join(", ")}.` : "",
    details
  };
}

module.exports = async function handler(req, res) {
  if (!requireMusicApi(req, res, {
    methods: ["GET", "POST"],
    feature: "spotify-search",
    enabledEnv: "SONIC_SPOTIFY_ENABLED",
    defaultEnabled: true,
    allowGlobalFallback: false,
    dailyLimitEnv: "SONIC_SPOTIFY_SEARCH_DAILY_LIMIT",
    defaultDailyLimit: 80,
    budgetOnStart: false
  })) return;

  if (!await enforceDurableMusicDailyLimit(req, res, {
    feature: "spotify-search",
    dailyLimitEnv: "SONIC_SPOTIFY_SEARCH_DAILY_LIMIT",
    defaultDailyLimit: 80,
    methods: ["GET", "POST"]
  })) return;

  const body = parseBody(req);
  const query = trimText(body.query || body.q || req.query?.query || req.query?.q || "", 180);
  const artist = trimText(body.artist || req.query?.artist || "", 120);
  const song = trimText(body.song || body.track || req.query?.song || req.query?.track || "", 140);
  const style = trimText(body.style || req.query?.style || "", 80);
  const album = trimText(body.album || body.release || req.query?.album || req.query?.release || "", 160);
  const limit = safeLimit(body.limit || req.query?.limit, envInt("SONIC_SPOTIFY_SEARCH_LIMIT", 8, 1, 20));

  if (!query && !artist && !song) {
    sendJson(req, res, 400, { error: "missing_query" }, ["GET", "POST", "OPTIONS"]);
    return;
  }

  try {
    const tracks = await fetchSpotifyTracks({ query, artist, song, style, album, limit });
    sendJson(req, res, 200, {
      ok: true,
      source: "spotify",
      attribution: spotifyAttribution(tracks),
      query: query || [artist, song].filter(Boolean).join(" "),
      artist,
      song,
      style,
      count: tracks.length,
      bestTrack: tracks[0] || null,
      tracks
    }, ["GET", "POST", "OPTIONS"]);
  } catch (error) {
    sendJson(req, res, error.statusCode || 500, {
      error: error.message || "spotify_search_failed",
      detail: error.detail || ""
    }, ["GET", "POST", "OPTIONS"]);
  }
};
