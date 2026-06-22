const { envFlag, envInt, envText, parseBody, requireMusicApi, sendJson, trimText } = require("./_music-apis");
const { persistCatalogEnrichments } = require("./_catalog-enrichment-store");

const DEEZER_SEARCH_URL = "https://api.deezer.com/search";
const DEEZER_TRACK_URL = "https://api.deezer.com/track";
const ITUNES_SEARCH_URL = "https://itunes.apple.com/search";
const DEFAULT_METADATA_USER_AGENT = "SonicSearch/1.0 (+https://sonicsearch.app)";
const SOURCE_REGISTRY = {
  itunes: {
    name: "iTunes",
    provider: "Apple iTunes Search API",
    homepage: "https://www.apple.com/itunes/",
    dataType: "track preview, release date, duration and genre",
    license: "Apple iTunes Search API terms",
    attribution: "Track metadata from the Apple iTunes Search API."
  },
  deezer: {
    name: "Deezer",
    provider: "Deezer API",
    homepage: "https://developers.deezer.com/",
    dataType: "track preview, release date, BPM and cover hints",
    license: "Deezer developer terms",
    attribution: "Track metadata from the Deezer API."
  }
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

function trimLower(value = "") {
  return normalizeText(value).replace(/\b(the|a|an)\b/g, " ").replace(/\s+/g, " ").trim();
}

function artistMatches(candidate = "", artist = "") {
  const left = trimLower(candidate);
  const right = trimLower(artist);
  if (!left || !right) return false;
  if (left === right) return true;
  return left.includes(right) || right.includes(left);
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

function alternateVersionPenalty(requested = "", candidate = "") {
  const request = normalizeText(requested);
  const title = normalizeText(candidate);
  if (!request || !title) return 0;
  if (request === title) return 0;
  return /\b(live|mix|remix|edit|version|instrumental|karaoke|cover|continuous|session)\b/.test(title) ? 0.22 : 0;
}

function yearFrom(value = "") {
  const match = String(value || "").match(/\b(19|20)\d{2}\b/);
  return match ? Number(match[0]) : 0;
}

function durationConfidence(requestedSec = 0, candidateSec = 0) {
  const requested = Number(requestedSec) || 0;
  const candidate = Number(candidateSec) || 0;
  if (!requested || !candidate) return 0;
  const diff = Math.abs(requested - candidate);
  if (diff <= 2) return 1;
  if (diff <= 8) return 0.84;
  if (diff <= 18) return 0.55;
  return 0;
}

function releaseYearConfidence(requestedYear = 0, candidateDate = "") {
  const requested = Number(requestedYear) || 0;
  const candidate = yearFrom(candidateDate);
  if (!requested || !candidate) return 0;
  if (requested === candidate) return 1;
  if (Math.abs(requested - candidate) === 1) return 0.55;
  return 0;
}

function metadataCandidateScore(candidate = {}, request = {}) {
  const title = trimText(candidate.title || candidate.song || "", 180);
  const album = trimText(candidate.album || "", 180);
  const durationSec = Number(candidate.durationSec) || 0;
  const releaseDate = trimText(candidate.releaseDate || "", 40);
  let score = titleConfidence(request.song, title) - alternateVersionPenalty(request.song, title);
  if (candidate.artist && artistMatches(candidate.artist, request.artist)) score += 0.05;
  if (request.album && album) score += titleConfidence(request.album, album) * 0.1;
  if (request.durationSec && durationSec) score += durationConfidence(request.durationSec, durationSec) * 0.06;
  if (request.releaseYear && releaseDate) score += releaseYearConfidence(request.releaseYear, releaseDate) * 0.04;
  return Math.max(0, Math.min(1, score));
}

function cacheKey({ artist, song, album = "" }) {
  return `${normalizeText(artist)}::${normalizeText(song)}::${normalizeText(album)}`;
}

function cacheRead(key) {
  const entry = cache.get(key);
  if (!entry || entry.expiresAt < Date.now()) return null;
  return entry.payload;
}

function cacheWrite(key, payload) {
  const ttlSeconds = envInt("SONIC_TRACK_METADATA_CACHE_SECONDS", 3600, 60, 86400);
  cache.set(key, {
    expiresAt: Date.now() + ttlSeconds * 1000,
    payload
  });
}

async function fetchJson(url) {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), envInt("SONIC_TRACK_METADATA_TIMEOUT_MS", 4500, 1000, 12000));
  try {
    const response = await fetch(url, {
      method: "GET",
      headers: {
        Accept: "application/json",
        "User-Agent": envText("SONIC_TRACK_METADATA_USER_AGENT", envText("SONIC_REFERENCE_USER_AGENT", DEFAULT_METADATA_USER_AGENT))
      },
      signal: controller.signal
    });
    const payload = await response.json().catch(() => null);
    if (!response.ok) return null;
    return payload;
  } catch (_error) {
    return null;
  } finally {
    clearTimeout(timeout);
  }
}

function sourceDetail(source = "", url = "") {
  const key = normalizeText(source);
  const registry = SOURCE_REGISTRY[key] || {
    name: source,
    provider: source,
    homepage: "",
    dataType: "track metadata",
    license: "",
    attribution: source ? `Track metadata from ${source}.` : ""
  };
  return {
    name: registry.name,
    provider: registry.provider,
    dataType: registry.dataType,
    url: trimText(url || registry.homepage, 800),
    license: registry.license,
    attribution: registry.attribution
  };
}

function candidateAttribution(candidate = {}) {
  const sourceDetails = Array.isArray(candidate.sourceDetails)
    ? candidate.sourceDetails
    : (candidate.source ? [sourceDetail(candidate.source, candidate.trackUrl)] : []);
  const providers = Array.from(new Set(sourceDetails.map((detail) => detail.name || detail.provider).filter(Boolean)));
  return {
    providers,
    line: providers.length ? `Track data: ${providers.join(", ")}.` : "",
    details: sourceDetails
  };
}

function metadataAttribution(candidates = []) {
  const details = [];
  candidates.forEach((candidate) => {
    const attribution = candidateAttribution(candidate);
    attribution.details.forEach((detail) => {
      const key = detail.provider || detail.name || detail.url || "";
      const exists = details.some((item) => (item.provider || item.name || item.url || "") === key);
      if (key && !exists) details.push(detail);
    });
  });
  const providers = Array.from(new Set(details.map((detail) => detail.name || detail.provider).filter(Boolean)));
  return {
    providers,
    line: providers.length ? `Track data: ${providers.join(", ")}.` : "",
    details
  };
}

async function fetchDeezerDetails(id) {
  if (!id) return null;
  return fetchJson(`${DEEZER_TRACK_URL}/${encodeURIComponent(id)}`);
}

function normalizeDeezerRow(row = {}, details = null, request = {}) {
  const artist = trimText(row?.artist?.name || "", 140);
  const title = trimText(row?.title || row?.title_short || "", 180);
  const album = trimText(row?.album?.title || details?.album?.title || "", 180);
  const releaseDate = trimText(details?.release_date || "", 40);
  const durationSec = Math.max(0, Number(details?.duration) || Number(row?.duration) || 0);
  const coverArtUrl = trimText(
    details?.album?.cover_xl ||
      details?.album?.cover_big ||
      details?.album?.cover_medium ||
      row?.album?.cover_xl ||
      row?.album?.cover_big ||
      row?.album?.cover_medium ||
      "",
    1200
  );
  return {
    source: "deezer",
    id: String(row?.id || ""),
    artist,
    song: title,
    title,
    album,
    label: trimText(details?.label || row?.album?.title || "Deezer", 140),
    previewUrl: trimText(details?.preview || row?.preview || "", 1200),
    releaseDate,
    durationSec,
    bpmExact: Math.max(0, Number(details?.bpm) || 0),
    catalogRef: trimText(details?.isrc || row?.isrc || row?.id || "DEEZER", 80),
    artistImageUrl: trimText(row?.artist?.picture_xl || row?.artist?.picture_big || row?.artist?.picture_medium || "", 1200),
    coverArtUrl,
    trackUrl: trimText(row?.link || "", 800),
    sourceDetails: [sourceDetail("deezer", row?.link || "")],
    attribution: candidateAttribution({ source: "deezer", trackUrl: row?.link || "" }),
    confidenceScore: metadataCandidateScore({ artist, title, album, durationSec, releaseDate }, request)
  };
}

async function searchDeezer(request = {}) {
  const { artist, song, limit } = request;
  if (!envFlag("SONIC_DEEZER_ENABLED", false)) return [];
  const queries = [
    `artist:"${artist}" track:"${song}"`,
    `${artist} ${song}`
  ];
  const rows = [];
  const seen = new Set();
  for (const query of queries) {
    const params = new URLSearchParams({
      q: query,
      limit: String(limit)
    });
    const payload = await fetchJson(`${DEEZER_SEARCH_URL}?${params.toString()}`);
    const data = Array.isArray(payload?.data) ? payload.data : [];
    for (const row of data) {
      const id = String(row?.id || "");
      if (!id || seen.has(id)) continue;
      seen.add(id);
      if (!artistMatches(row?.artist?.name || "", artist)) continue;
      rows.push(row);
    }
    if (rows.length >= limit) break;
  }

  const ranked = rows
    .map((row) => ({ row, score: titleConfidence(song, row?.title || "") - alternateVersionPenalty(song, row?.title || "") }))
    .sort((a, b) => b.score - a.score)
    .slice(0, Math.min(6, limit));

  const normalized = [];
  for (const item of ranked) {
    const details = await fetchDeezerDetails(item.row.id);
    normalized.push(normalizeDeezerRow(item.row, details, request));
  }
  return normalized;
}

function itunesArtworkUrl(row = {}) {
  const artwork = trimText(row?.artworkUrl100 || row?.artworkUrl60 || row?.artworkUrl30 || "", 1200);
  if (!artwork) return "";
  return artwork.replace(/\/\d+x\d+bb\.(jpg|jpeg|png)$/i, "/1000x1000bb.$1");
}

function normalizeItunesRow(row = {}, request = {}) {
  const artist = trimText(row?.artistName || "", 140);
  const title = trimText(row?.trackName || "", 180);
  const album = trimText(row?.collectionName || "", 180);
  const releaseDate = trimText(row?.releaseDate ? String(row.releaseDate).slice(0, 10) : "", 40);
  const durationSec = Math.max(0, Math.round((Number(row?.trackTimeMillis) || 0) / 1000));
  return {
    source: "itunes",
    id: String(row?.trackId || ""),
    artist,
    song: title,
    title,
    album,
    label: trimText(row?.collectionName || "iTunes", 140),
    previewUrl: trimText(row?.previewUrl || "", 1200),
    releaseDate,
    durationSec,
    bpmExact: 0,
    catalogRef: trimText(row?.trackId || "ITUNES", 80),
    artistGenre: trimText(row?.primaryGenreName || "", 140),
    coverArtUrl: itunesArtworkUrl(row),
    trackUrl: trimText(row?.trackViewUrl || "", 800),
    sourceDetails: [sourceDetail("itunes", row?.trackViewUrl || "")],
    attribution: candidateAttribution({ source: "itunes", trackUrl: row?.trackViewUrl || "" }),
    confidenceScore: metadataCandidateScore({ artist, title, album, durationSec, releaseDate }, request)
  };
}

async function searchItunes(request = {}) {
  const { artist, song, limit } = request;
  if (!envFlag("SONIC_ITUNES_ENABLED", true)) return [];
  const params = new URLSearchParams({
    term: `${artist} ${song}`,
    entity: "song",
    limit: String(limit)
  });
  const payload = await fetchJson(`${ITUNES_SEARCH_URL}?${params.toString()}`);
  const rows = Array.isArray(payload?.results) ? payload.results : [];
  return rows
    .filter((row) => artistMatches(row?.artistName || "", artist))
    .map((row) => normalizeItunesRow(row, request))
    .sort((a, b) => b.confidenceScore - a.confidenceScore)
    .slice(0, limit);
}

function bestCandidate(candidates = []) {
  return candidates
    .filter((item) => item?.artist && item?.song)
    .sort((a, b) => {
      const previewDiff = Number(Boolean(b.previewUrl)) - Number(Boolean(a.previewUrl));
      if (previewDiff) return previewDiff;
      return (Number(b.confidenceScore) || 0) - (Number(a.confidenceScore) || 0);
    })[0] || null;
}

module.exports = async function handler(req, res) {
  if (!requireMusicApi(req, res, {
    methods: ["GET", "POST"],
    feature: "track-metadata",
    enabledEnv: "SONIC_TRACK_METADATA_ENABLED",
    defaultEnabled: true,
    allowGlobalFallback: false,
    dailyLimitEnv: "SONIC_TRACK_METADATA_DAILY_LIMIT",
    defaultDailyLimit: 120
  })) return;

  const body = parseBody(req);
  const artist = trimText(body.artist || req.query?.artist || "", 140);
  const song = trimText(body.song || body.track || req.query?.song || req.query?.track || "", 180);
  const style = trimText(body.style || req.query?.style || "", 80);
  const album = trimText(body.album || body.release || req.query?.album || req.query?.release || "", 180);
  const durationSec = Math.max(0, Number(body.durationSec || body.duration || req.query?.durationSec || req.query?.duration || 0) || 0);
  const releaseYear = yearFrom(body.releaseYear || body.releaseDate || req.query?.releaseYear || req.query?.releaseDate || "");
  const limit = envInt("SONIC_TRACK_METADATA_PROVIDER_LIMIT", 8, 1, 20);

  if (!artist || !song) {
    sendJson(req, res, 400, { error: "missing_artist_or_song" }, ["GET", "POST", "OPTIONS"]);
    return;
  }

  const request = { artist, song, style, album, durationSec, releaseYear };
  const key = cacheKey(request);
  const cached = cacheRead(key);
  if (cached) {
    sendJson(req, res, 200, { ...cached, cached: true }, ["GET", "POST", "OPTIONS"]);
    return;
  }

  try {
    const [deezer, itunes] = await Promise.all([
      searchDeezer({ ...request, limit }),
      searchItunes({ ...request, limit })
    ]);
    const candidates = [...deezer, ...itunes]
      .filter((item) => Number(item.confidenceScore) >= 0.72)
      .sort((a, b) => (Number(b.confidenceScore) || 0) - (Number(a.confidenceScore) || 0));
    const payload = {
      ok: true,
      enabled: true,
      source: "track-metadata",
      providers: {
        deezer: envFlag("SONIC_DEEZER_ENABLED", false),
        itunes: envFlag("SONIC_ITUNES_ENABLED", true)
      },
      artist,
      song,
      style,
      album,
      durationSec,
      releaseYear,
      count: candidates.length,
      attribution: metadataAttribution(candidates),
      best: bestCandidate(candidates),
      candidates
    };
    cacheWrite(key, payload);
    await persistCatalogEnrichments({
      entityType: "track",
      style,
      artist,
      song,
      source: "track-metadata",
      sourceUrl: payload.best?.trackUrl || "",
      confidence: payload.best?.confidenceScore || 0,
      payload: {
        request,
        providers: payload.providers,
        best: payload.best,
        candidates: candidates.slice(0, 6),
        attribution: payload.attribution
      }
    });
    sendJson(req, res, 200, payload, ["GET", "POST", "OPTIONS"]);
  } catch (error) {
    sendJson(req, res, 500, {
      ok: false,
      error: "track_metadata_failed",
      detail: error.message
    }, ["GET", "POST", "OPTIONS"]);
  }
};
