const { envFlag, envInt, envText, parseBody, requireMusicApi, sendJson, trimText } = require("./_music-apis");
const { persistCatalogEnrichments } = require("./_catalog-enrichment-store");

const DEFAULT_REFERENCE_USER_AGENT = "SonicSearch/1.0 (+https://sonicsearch.app)";
const MUSICBRAINZ_ARTIST_URL = "https://musicbrainz.org/ws/2/artist/";
const ITUNES_SEARCH_URL = "https://itunes.apple.com/search";
const WIKIPEDIA_SUMMARY_MIN_LENGTH = 120;
const cache = new Map();

const SOURCE_REGISTRY = {
  MusicBrainz: {
    name: "MusicBrainz",
    homepage: "https://musicbrainz.org/",
    dataType: "artist identity, origin and tags",
    license: "MusicBrainz open data terms",
    attribution: "Artist metadata from MusicBrainz."
  },
  Wikipedia: {
    name: "Wikipedia",
    homepage: "https://www.wikipedia.org/",
    dataType: "artist summary",
    license: "CC BY-SA",
    attribution: "Summary text from Wikipedia; verify page license before long-form reuse."
  },
  iTunes: {
    name: "iTunes",
    homepage: "https://www.apple.com/itunes/",
    dataType: "genre and catalog hints",
    license: "Apple iTunes Search API terms",
    attribution: "Metadata from the Apple iTunes Search API."
  }
};

let lastMusicBrainzAt = 0;

const MUSIC_ARTIST_SIGNALS = [
  "musician",
  "music producer",
  "record producer",
  "disc jockey",
  "dj",
  "producer",
  "singer",
  "songwriter",
  "composer",
  "electronic music",
  "techno",
  "house music",
  "trance",
  "psytrance",
  "psy trance",
  "psychedelic trance",
  "drum and bass",
  "edm",
  "album",
  "single",
  "remix",
  "label",
  "festival",
  "musico",
  "musica",
  "musica eletronica",
  "produtor",
  "produtora",
  "artista",
  "cantor",
  "cantora",
  "productor",
  "productora",
  "cantante"
];

const NON_ARTIST_SIGNALS = [
  "footballer",
  "soccer player",
  "basketball player",
  "athlete",
  "politician",
  "actor",
  "actress",
  "film director",
  "writer",
  "novelist",
  "scientist",
  "mathematician",
  "businessperson",
  "software",
  "video game",
  "fictional",
  "mythical",
  "legendary island",
  "king arthur",
  "arthurian",
  "futebolista",
  "politico",
  "ator",
  "atriz",
  "deportista"
];

function normalizeText(value = "") {
  return String(value || "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/&/g, " and ")
    .replace(/[^a-z0-9]+/g, " ")
    .trim();
}

function sanitizeArtistLookupName(artistName = "") {
  return String(artistName || "")
    .replace(/\([^)]*\)/g, " ")
    .replace(/\b(ft|feat|featuring|vs)\b.*$/i, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function hasSignal(text = "", signals = []) {
  const haystack = normalizeText(text);
  if (!haystack) return false;
  return signals.some((signal) => haystack.includes(normalizeText(signal)));
}

function hasMusicArtistSignal(text = "") {
  return hasSignal(text, MUSIC_ARTIST_SIGNALS);
}

function hasNonArtistSignal(text = "") {
  return hasSignal(text, NON_ARTIST_SIGNALS);
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

function cacheKey({ artist, language }) {
  return `${normalizeText(artist)}::${normalizeText(language || "en").slice(0, 2)}`;
}

function cacheRead(key) {
  const entry = cache.get(key);
  if (!entry || entry.expiresAt < Date.now()) return null;
  return entry.payload;
}

function cacheWrite(key, payload) {
  const ttlSeconds = envInt("SONIC_ARTIST_PROFILE_CACHE_SECONDS", 86400, 300, 604800);
  cache.set(key, {
    expiresAt: Date.now() + ttlSeconds * 1000,
    payload
  });
}

function languagePriority(language = "en") {
  const clean = normalizeText(language).slice(0, 2);
  if (clean === "pt") return ["pt", "en"];
  if (clean === "es") return ["es", "en"];
  return ["en"];
}

function sourceBaseName(source = "") {
  const clean = String(source || "").trim();
  if (/^wikipedia/i.test(clean)) return "Wikipedia";
  if (/^musicbrainz/i.test(clean)) return "MusicBrainz";
  if (/^itunes/i.test(clean)) return "iTunes";
  return clean;
}

function sourceDetail(chunk = {}) {
  const baseName = sourceBaseName(chunk.source);
  const registry = SOURCE_REGISTRY[baseName] || {
    name: baseName,
    homepage: "",
    dataType: "artist metadata",
    license: "",
    attribution: baseName ? `Metadata from ${baseName}.` : ""
  };
  if (!baseName) return null;
  return {
    name: chunk.source || registry.name,
    provider: registry.name,
    dataType: registry.dataType,
    url: trimText(chunk.sourceUrl || chunk.wikiUrl || registry.homepage, 500),
    license: registry.license,
    attribution: registry.attribution
  };
}

async function fetchJson(url) {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), envInt("SONIC_ARTIST_PROFILE_TIMEOUT_MS", 5200, 1000, 15000));
  try {
    const response = await fetch(url, {
      method: "GET",
      headers: {
        Accept: "application/json",
        "User-Agent": envText("SONIC_REFERENCE_USER_AGENT", DEFAULT_REFERENCE_USER_AGENT)
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

async function waitMusicBrainzSlot() {
  const spacingMs = envInt("SONIC_MUSICBRAINZ_MIN_INTERVAL_MS", 1100, 1000, 10000);
  const waitMs = Math.max(0, spacingMs - (Date.now() - lastMusicBrainzAt));
  if (waitMs) await new Promise((resolve) => setTimeout(resolve, waitMs));
  lastMusicBrainzAt = Date.now();
}

function musicBrainzRowScore(item = {}, artist = "") {
  const baseName = normalizeText(artist);
  const rowScore = Number(item?.score) || 0;
  const nameExact = normalizeText(item?.name || "") === baseName ? 28 : 0;
  const tags = Array.isArray(item?.tags) ? item.tags.map((tag) => tag?.name || "").join(" ") : "";
  const aliases = Array.isArray(item?.aliases) ? item.aliases.map((alias) => alias?.name || "").join(" ") : "";
  const evidence = `${item?.name || ""} ${item?.disambiguation || ""} ${item?.type || ""} ${tags} ${aliases}`;
  const musicSignal = hasMusicArtistSignal(evidence) ? 26 : 0;
  const nonArtistPenalty = hasNonArtistSignal(evidence) ? -40 : 0;
  return rowScore + nameExact + musicSignal + nonArtistPenalty;
}

function musicBrainzGenre(item = {}) {
  const tags = Array.isArray(item?.tags) ? item.tags : [];
  const ranked = tags
    .map((tag) => ({
      name: trimText(tag?.name || "", 80),
      count: Number(tag?.count) || 0
    }))
    .filter((tag) => tag.name && !/seen live|favorites?/i.test(tag.name))
    .sort((a, b) => b.count - a.count);
  return ranked[0]?.name || "";
}

async function fetchMusicBrainzArtist(artist) {
  if (!envFlag("SONIC_MUSICBRAINZ_ENABLED", true)) return null;
  const baseName = sanitizeArtistLookupName(artist);
  if (!baseName) return null;

  const params = new URLSearchParams({
    query: `artist:"${baseName}"`,
    fmt: "json",
    limit: "6",
    inc: "tags+aliases"
  });
  await waitMusicBrainzSlot();
  const payload = await fetchJson(`${MUSICBRAINZ_ARTIST_URL}?${params.toString()}`);
  const rows = Array.isArray(payload?.artists) ? payload.artists : [];
  if (!rows.length) return null;

  const sorted = [...rows].sort((a, b) => musicBrainzRowScore(b, baseName) - musicBrainzRowScore(a, baseName));
  const best = sorted[0];
  if (!best || (Number(best?.score) || 0) < 70) return null;

  return {
    source: "MusicBrainz",
    sourceUrl: best?.id ? `https://musicbrainz.org/artist/${encodeURIComponent(best.id)}` : SOURCE_REGISTRY.MusicBrainz.homepage,
    country: trimText(best?.country || "", 40),
    area: trimText(best?.area?.name || "", 120),
    disambiguation: trimText(best?.disambiguation || "", 180),
    genre: trimText(musicBrainzGenre(best), 120),
    lifeStartYear: trimText(String(best?.["life-span"]?.begin || "").slice(0, 4), 10)
  };
}

function wikipediaSummaryLooksLikeArtist(payload = {}, artistName = "", candidate = "") {
  const title = trimText(payload?.title || "", 180);
  const description = trimText(payload?.description || "", 240);
  const extract = trimText(payload?.extract || "", 1400);
  const haystack = `${title} ${description} ${extract}`;
  if (!extract || !hasMusicArtistSignal(haystack)) return false;
  if (hasNonArtistSignal(haystack) && !hasMusicArtistSignal(`${title} ${description}`)) return false;

  const baseKey = normalizeText(sanitizeArtistLookupName(artistName));
  const titleKey = normalizeText(title.replace(/\([^)]*\)/g, " "));
  const candidateIsQualified = /\((musician|dj|singer|producer|artist|musico|artista)\)/i.test(candidate);
  return Boolean(baseKey && (titleKey === baseKey || titleKey.startsWith(`${baseKey} `))) ||
    candidateIsQualified ||
    hasMusicArtistSignal(`${title} ${description}`);
}

async function fetchWikipediaSummary(artist, language) {
  if (!envFlag("SONIC_WIKIPEDIA_ENABLED", true)) return null;
  const baseName = sanitizeArtistLookupName(artist);
  if (!baseName) return null;

  const candidates = Array.from(new Set([
    `${baseName} (musician)`,
    `${baseName} (DJ)`,
    `${baseName} (producer)`,
    baseName
  ]));

  for (const lang of languagePriority(language)) {
    for (const candidate of candidates) {
      const page = encodeURIComponent(candidate.replace(/\s+/g, "_"));
      const payload = await fetchJson(`https://${lang}.wikipedia.org/api/rest_v1/page/summary/${page}`);
      if (!payload) continue;
      const type = normalizeText(payload?.type || "");
      const extract = trimText(payload?.extract || "", 1400);
      if (!extract || extract.length < WIKIPEDIA_SUMMARY_MIN_LENGTH) continue;
      if (type.includes("disambiguation")) continue;
      if (!wikipediaSummaryLooksLikeArtist(payload, baseName, candidate)) continue;
      return {
        source: lang === "en" ? "Wikipedia" : `Wikipedia-${lang.toUpperCase()}`,
        wikiSummary: extract,
        wikiUrl: trimText(payload?.content_urls?.desktop?.page || "", 500),
        sourceUrl: trimText(payload?.content_urls?.desktop?.page || "", 500)
      };
    }
  }

  return null;
}

async function fetchItunesArtistGenre(artist) {
  if (!envFlag("SONIC_ITUNES_ENABLED", true)) return null;
  const baseName = sanitizeArtistLookupName(artist);
  if (!baseName) return null;

  const params = new URLSearchParams({
    term: baseName,
    entity: "song",
    limit: "35"
  });
  const payload = await fetchJson(`${ITUNES_SEARCH_URL}?${params.toString()}`);
  const rows = Array.isArray(payload?.results) ? payload.results : [];
  const best = rows.find((row) => artistMatches(row?.artistName || "", baseName));
  if (!best) return null;
  return {
    source: "iTunes",
    sourceUrl: trimText(best?.artistViewUrl || best?.trackViewUrl || SOURCE_REGISTRY.iTunes.homepage, 500),
    genre: trimText(best?.primaryGenreName || "", 120),
    collectionName: trimText(best?.collectionName || "", 180)
  };
}

function mergeArtistProfile(...chunks) {
  const profile = {
    country: "",
    area: "",
    disambiguation: "",
    genre: "",
    lifeStartYear: "",
    wikiSummary: "",
    wikiUrl: "",
    sources: [],
    sourceDetails: []
  };
  let countrySource = "";
  let areaSource = "";

  chunks.forEach((chunk) => {
    if (!chunk) return;
    const sourceName = String(chunk.source || "");
    if (chunk.area && !profile.area) {
      profile.area = chunk.area;
      areaSource = sourceName;
    }
    if (chunk.country && !profile.country) {
      const canAttachCountryToArea = !profile.area || !areaSource || areaSource === sourceName;
      if (canAttachCountryToArea) {
        profile.country = chunk.country;
        countrySource = sourceName;
      }
    }
    if (chunk.disambiguation && !profile.disambiguation) profile.disambiguation = chunk.disambiguation;
    if (chunk.genre && !profile.genre) profile.genre = chunk.genre;
    if (chunk.lifeStartYear && !profile.lifeStartYear) profile.lifeStartYear = chunk.lifeStartYear;
    if (chunk.wikiSummary && !profile.wikiSummary) profile.wikiSummary = chunk.wikiSummary;
    if (chunk.wikiUrl && !profile.wikiUrl) profile.wikiUrl = chunk.wikiUrl;
    if (chunk.source && !profile.sources.includes(chunk.source)) profile.sources.push(chunk.source);
    const detail = sourceDetail(chunk);
    const detailKey = `${detail?.provider || ""}::${detail?.url || ""}`;
    const hasDetail = profile.sourceDetails.some((item) => `${item.provider || ""}::${item.url || ""}` === detailKey);
    if (detail && !hasDetail) profile.sourceDetails.push(detail);
  });

  if (profile.area && profile.country && areaSource && countrySource && areaSource !== countrySource) {
    profile.country = "";
  }
  return profile;
}

function hasMeaningfulArtistProfile(profile) {
  if (!profile) return false;
  const summary = String(profile.wikiSummary || "").trim();
  const safeSummary = summary && hasMusicArtistSignal(summary) && !hasNonArtistSignal(summary);
  return Boolean(
    profile.country ||
    profile.area ||
    profile.disambiguation ||
    profile.genre ||
    safeSummary
  );
}

function profileAttribution(profile) {
  const details = Array.isArray(profile?.sourceDetails) ? profile.sourceDetails : [];
  const providers = Array.from(new Set(details.map((detail) => detail.provider || detail.name).filter(Boolean)));
  return {
    providers,
    line: providers.length ? `Sources: ${providers.join(", ")}.` : "",
    details
  };
}

module.exports = async function handler(req, res) {
  if (!requireMusicApi(req, res, {
    methods: ["GET", "POST"],
    feature: "artist-profile",
    enabledEnv: "SONIC_ARTIST_PROFILE_ENABLED",
    defaultEnabled: true,
    allowGlobalFallback: false,
    dailyLimitEnv: "SONIC_ARTIST_PROFILE_DAILY_LIMIT",
    defaultDailyLimit: 80
  })) return;

  const body = parseBody(req);
  const artist = trimText(body.artist || req.query?.artist || "", 140);
  const language = trimText(body.language || body.locale || req.query?.language || req.query?.locale || "en", 16);

  if (!artist) {
    sendJson(req, res, 400, { error: "missing_artist" }, ["GET", "POST", "OPTIONS"]);
    return;
  }

  const key = cacheKey({ artist, language });
  const cached = cacheRead(key);
  if (cached) {
    sendJson(req, res, 200, { ...cached, cached: true }, ["GET", "POST", "OPTIONS"]);
    return;
  }

  const providers = {
    musicbrainz: envFlag("SONIC_MUSICBRAINZ_ENABLED", true),
    wikipedia: envFlag("SONIC_WIKIPEDIA_ENABLED", true),
    itunes: envFlag("SONIC_ITUNES_ENABLED", true)
  };

  try {
    const [musicBrainz, wikipedia, itunes] = await Promise.all([
      fetchMusicBrainzArtist(artist),
      fetchWikipediaSummary(artist, language),
      fetchItunesArtistGenre(artist)
    ]);
    const merged = mergeArtistProfile(musicBrainz, itunes, wikipedia);
    const profile = hasMeaningfulArtistProfile(merged) ? merged : null;
    const attribution = profileAttribution(profile);
    const payload = {
      ok: true,
      enabled: true,
      source: "artist-profile",
      providers,
      artist,
      language: languagePriority(language)[0],
      count: profile?.sources?.length || 0,
      attribution,
      profile
    };
    cacheWrite(key, payload);
    if (profile) {
      await persistCatalogEnrichments({
        entityType: "artist",
        artist,
        source: "artist-profile",
        sourceUrl: profile.wikiUrl || profile.sourceDetails?.[0]?.url || "",
        confidence: 0.82,
        payload: {
          artist,
          language: payload.language,
          providers,
          profile,
          attribution
        }
      });
    }
    sendJson(req, res, 200, payload, ["GET", "POST", "OPTIONS"]);
  } catch (error) {
    sendJson(req, res, 500, {
      ok: false,
      error: "artist_profile_failed",
      detail: error.message
    }, ["GET", "POST", "OPTIONS"]);
  }
};
