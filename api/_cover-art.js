const { enforceDurableMusicDailyLimit, envInt, envText, parseBody, requireMusicApi, sendJson, trimText } = require("./_music-apis");
const { persistCatalogEnrichments } = require("./_catalog-enrichment-store");

const DEFAULT_REFERENCE_USER_AGENT = "SonicSearch/1.0 (+https://sonicsearch.app)";
const MUSICBRAINZ_RELEASE_GROUP_URL = "https://musicbrainz.org/ws/2/release-group/";
const MUSICBRAINZ_RELEASE_URL = "https://musicbrainz.org/ws/2/release/";
const COVER_ART_RELEASE_GROUP_URL = "https://coverartarchive.org/release-group";
const COVER_ART_RELEASE_URL = "https://coverartarchive.org/release";
const SOURCE_DETAIL = {
  name: "Cover Art Archive",
  provider: "MusicBrainz / Cover Art Archive",
  url: "https://coverartarchive.org/",
  dataType: "release cover artwork metadata",
  license: "Cover images remain copyrighted by their respective owners",
  attribution: "Cover metadata from Cover Art Archive; images are hosted by Internet Archive/Cover Art Archive.",
  backendOnly: true,
  cached: true
};

const cache = new Map();
let lastMusicBrainzAt = 0;

function normalizeText(value = "") {
  return String(value || "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/&/g, " and ")
    .replace(/[^a-z0-9]+/g, " ")
    .trim();
}

function cacheKey({ artist = "", album = "", song = "" } = {}) {
  return `${normalizeText(artist)}::${normalizeText(album || song)}`;
}

function cacheRead(key) {
  const cached = cache.get(key);
  if (!cached || cached.expiresAt <= Date.now()) {
    cache.delete(key);
    return null;
  }
  return cached.payload;
}

function cacheWrite(key, payload) {
  cache.set(key, {
    payload,
    expiresAt: Date.now() + envInt("SONIC_COVER_ART_CACHE_SECONDS", 86400, 300, 604800) * 1000
  });
  if (cache.size > 300) {
    const firstKey = cache.keys().next().value;
    if (firstKey) cache.delete(firstKey);
  }
}

async function waitMusicBrainzSlot() {
  const spacingMs = envInt("SONIC_MUSICBRAINZ_MIN_INTERVAL_MS", 1100, 1000, 10000);
  const waitMs = Math.max(0, spacingMs - (Date.now() - lastMusicBrainzAt));
  if (waitMs) await new Promise((resolve) => setTimeout(resolve, waitMs));
  lastMusicBrainzAt = Date.now();
}

async function fetchJson(url, { musicBrainz = false } = {}) {
  if (musicBrainz) await waitMusicBrainzSlot();
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), envInt("SONIC_COVER_ART_TIMEOUT_MS", 9000, 1000, 15000));
  try {
    const response = await fetch(url, {
      method: "GET",
      headers: {
        Accept: "application/json",
        "User-Agent": envText("SONIC_REFERENCE_USER_AGENT", DEFAULT_REFERENCE_USER_AGENT)
      },
      signal: controller.signal
    });
    if (!response.ok) return null;
    return await response.json().catch(() => null);
  } catch (_error) {
    return null;
  } finally {
    clearTimeout(timeout);
  }
}

function titleScore(requested = "", candidate = "") {
  const left = normalizeText(requested);
  const right = normalizeText(candidate);
  if (!left || !right) return 0;
  if (left === right) return 1;
  if (left.includes(right) || right.includes(left)) return 0.84;
  const leftTokens = new Set(left.split(" ").filter(Boolean));
  const rightTokens = new Set(right.split(" ").filter(Boolean));
  const matchCount = [...leftTokens].filter((token) => rightTokens.has(token)).length;
  return matchCount / Math.max(1, new Set([...leftTokens, ...rightTokens]).size);
}

function yearFrom(value = "") {
  const match = String(value || "").match(/\b(19|20)\d{2}\b/);
  return match ? Number(match[0]) : 0;
}

function artistCreditText(row = {}) {
  if (typeof row["artist-credit-phrase"] === "string") return row["artist-credit-phrase"];
  if (Array.isArray(row["artist-credit"])) {
    return row["artist-credit"].map((item) => item?.artist?.name || item?.name || "").filter(Boolean).join(" ");
  }
  return "";
}

function rowScore(row = {}, request = {}) {
  const title = row.title || "";
  const artistCredit = artistCreditText(row);
  const score = titleScore(request.album || request.song, title) * 100;
  const artistBoost = normalizeText(artistCredit).includes(normalizeText(request.artist)) ? 22 : 0;
  const primaryTypeBoost = /album|single|ep/i.test(row["primary-type"] || "") ? 6 : 0;
  const releaseYear = yearFrom(row["first-release-date"] || row.date || "");
  const requestedYear = Number(request.releaseYear) || 0;
  const yearBoost = requestedYear && releaseYear
    ? requestedYear === releaseYear
      ? 8
      : Math.abs(requestedYear - releaseYear) === 1
        ? 3
        : -4
    : 0;
  return score + artistBoost + primaryTypeBoost + yearBoost + (Number(row.score) || 0) / 10;
}

async function searchMusicBrainzReleaseGroups(request = {}) {
  const title = trimText(request.album || request.song, 180);
  const artist = trimText(request.artist, 140);
  if (!title || !artist) return [];
  const query = `artist:"${artist.replace(/"/g, "")}" AND release:"${title.replace(/"/g, "")}"`;
  const params = new URLSearchParams({ query, fmt: "json", limit: "6" });
  const payload = await fetchJson(`${MUSICBRAINZ_RELEASE_GROUP_URL}?${params.toString()}`, { musicBrainz: true });
  const rows = Array.isArray(payload?.["release-groups"]) ? payload["release-groups"] : [];
  return rows
    .map((row) => ({ ...row, _score: rowScore(row, request), _type: "release-group" }))
    .filter((row) => row.id && row._score >= 42)
    .sort((a, b) => b._score - a._score)
    .slice(0, 4);
}

async function searchMusicBrainzReleases(request = {}) {
  const title = trimText(request.album || request.song, 180);
  const artist = trimText(request.artist, 140);
  if (!title || !artist) return [];
  const query = `artist:"${artist.replace(/"/g, "")}" AND release:"${title.replace(/"/g, "")}"`;
  const params = new URLSearchParams({ query, fmt: "json", limit: "6" });
  const payload = await fetchJson(`${MUSICBRAINZ_RELEASE_URL}?${params.toString()}`, { musicBrainz: true });
  const rows = Array.isArray(payload?.releases) ? payload.releases : [];
  return rows
    .map((row) => ({ ...row, _score: rowScore(row, request), _type: "release" }))
    .filter((row) => row.id && row._score >= 42)
    .sort((a, b) => b._score - a._score)
    .slice(0, 4);
}

function imageUrlFromCoverPayload(payload = {}) {
  const images = Array.isArray(payload?.images) ? payload.images : [];
  const best = images.find((image) => image.front) || images[0];
  if (!best) return "";
  const thumbnails = best.thumbnails || {};
  return trimText(
    thumbnails["1200"] ||
      thumbnails.large ||
      thumbnails["500"] ||
      thumbnails.small ||
      best.image ||
      "",
    1200
  );
}

async function fetchCoverForCandidate(candidate = {}) {
  const base = candidate._type === "release" ? COVER_ART_RELEASE_URL : COVER_ART_RELEASE_GROUP_URL;
  const payload = await fetchJson(`${base}/${encodeURIComponent(candidate.id)}`);
  const imageUrl = imageUrlFromCoverPayload(payload);
  if (!imageUrl) return null;
  return {
    id: candidate.id,
    type: candidate._type,
    title: trimText(candidate.title, 180),
    imageUrl,
    sourceUrl: candidate._type === "release"
      ? `https://musicbrainz.org/release/${candidate.id}`
      : `https://musicbrainz.org/release-group/${candidate.id}`,
    confidenceScore: Math.min(1, Math.max(0, Number(candidate._score) / 128))
  };
}

async function resolveCoverArt(request = {}) {
  const releaseGroups = await searchMusicBrainzReleaseGroups(request);
  const releases = releaseGroups.length ? [] : await searchMusicBrainzReleases(request);
  const candidates = [...releaseGroups, ...releases];
  for (const candidate of candidates) {
    const cover = await fetchCoverForCandidate(candidate);
    if (cover?.imageUrl) return cover;
  }
  return null;
}

module.exports = async function handler(req, res) {
  if (!requireMusicApi(req, res, {
    methods: ["GET", "POST"],
    feature: "cover-art",
    enabledEnv: "SONIC_COVER_ART_ENABLED",
    defaultEnabled: true,
    allowGlobalFallback: false,
    dailyLimitEnv: "SONIC_COVER_ART_DAILY_LIMIT",
    defaultDailyLimit: 100
  })) return;
  if (!await enforceDurableMusicDailyLimit(req, res, {
    methods: ["GET", "POST"],
    feature: "cover-art",
    dailyLimitEnv: "SONIC_COVER_ART_DAILY_LIMIT",
    defaultDailyLimit: 100
  })) return;

  const body = parseBody(req);
  const request = {
    artist: trimText(body.artist || req.query?.artist || "", 140),
    song: trimText(body.song || body.track || req.query?.song || req.query?.track || "", 180),
    album: trimText(body.album || body.release || req.query?.album || req.query?.release || "", 180),
    releaseYear: yearFrom(body.releaseYear || body.releaseDate || req.query?.releaseYear || req.query?.releaseDate || "")
  };

  if (!request.artist || (!request.album && !request.song)) {
    sendJson(req, res, 400, { error: "missing_artist_or_release" }, ["GET", "POST", "OPTIONS"]);
    return;
  }

  const key = cacheKey(request);
  const cached = cacheRead(key);
  if (cached) {
    sendJson(req, res, 200, { ...cached, cached: true }, ["GET", "POST", "OPTIONS"]);
    return;
  }

  try {
    const cover = await resolveCoverArt(request);
    const payload = {
      ok: true,
      enabled: true,
      source: "cover-art-archive",
      request,
      cover,
      imageUrl: cover?.imageUrl || "",
      sourceDetails: [SOURCE_DETAIL],
      attribution: {
        label: "Cover art metadata",
        sources: [SOURCE_DETAIL]
      }
    };
    cacheWrite(key, payload);
    if (cover?.imageUrl) {
      await persistCatalogEnrichments({
        entityType: "track",
        style: trimText(body.style || req.query?.style || "", 80),
        artist: request.artist,
        song: request.song || request.album,
        source: "cover-art-archive",
        sourceUrl: cover.sourceUrl || "",
        confidence: cover.confidenceScore || null,
        payload: {
          request,
          cover,
          imageUrl: cover.imageUrl,
          attribution: payload.attribution
        }
      });
    }
    sendJson(req, res, 200, payload, ["GET", "POST", "OPTIONS"]);
  } catch (error) {
    sendJson(req, res, 500, {
      ok: false,
      error: "cover_art_failed",
      detail: error.message
    }, ["GET", "POST", "OPTIONS"]);
  }
};
