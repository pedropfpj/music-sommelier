const { enforceDurableMusicDailyLimit, envInt, envText, parseBody, requireMusicApi, sendJson, trimText } = require("./_music-apis");
const { persistCatalogEnrichments } = require("./_catalog-enrichment-store");

const DEFAULT_RADIO_BROWSER_BASE_URL = "https://all.api.radio-browser.info/json";
const DEFAULT_RADIO_USER_AGENT = "SonicSearch/1.0 (+https://sonicsearch.app)";
const RADIO_BROWSER_SOURCE_DETAIL = {
  name: "Radio Browser",
  provider: "Community Radio Browser API",
  dataType: "public internet radio station directory metadata",
  url: "https://www.radio-browser.info/",
  license: "Radio Browser public API terms",
  attribution: "Station directory metadata from Radio Browser.",
  backendOnly: true,
  cached: true
};

const STYLE_TAGS = {
  techno: ["techno", "electronic"],
  acid_techno: ["acid techno", "techno"],
  hard_techno: ["hard techno", "techno"],
  dub_techno: ["dub techno", "techno"],
  hypnotic_techno: ["techno", "minimal techno"],
  raw_techno: ["techno", "industrial techno"],
  detroit_techno: ["detroit techno", "techno"],
  minimal_techno: ["minimal techno", "techno"],
  melodic_techno: ["melodic techno", "techno"],
  industrial_techno: ["industrial techno", "techno"],
  peak_time_techno: ["techno", "edm"],
  house: ["house", "dance"],
  deep_house: ["deep house", "house"],
  tech_house: ["tech house", "house"],
  progressive_house: ["progressive house", "house"],
  afro_house: ["afro house", "house"],
  organic_house: ["organic house", "downtempo"],
  bass_house: ["bass house", "house"],
  electro_house: ["electro house", "edm"],
  disco_house: ["disco house", "house"],
  psytrance: ["psytrance", "trance"],
  dark_psy: ["darkpsy", "psytrance"],
  forest_psy: ["forest psytrance", "psytrance"],
  full_on: ["full on", "psytrance"],
  full_on_night: ["full on", "psytrance"],
  full_on_morning: ["full on", "psytrance"],
  progressive_psy: ["progressive psytrance", "psytrance"],
  goa_trance: ["goa trance", "trance"],
  trance_uplifting: ["uplifting trance", "trance"],
  tech_trance: ["tech trance", "trance"],
  hard_trance: ["hard trance", "trance"],
  hi_tech: ["hi-tech", "psytrance"],
  psycore: ["psycore", "psytrance"],
  psybreaks: ["breakbeat", "psytrance"],
  psybient: ["psybient", "ambient"],
  slambient: ["ambient", "experimental"],
  drum_and_bass: ["drum and bass", "dnb"],
  liquid_dnb: ["liquid dnb", "drum and bass"],
  neurofunk: ["neurofunk", "drum and bass"],
  jump_up: ["jump up", "drum and bass"],
  jungle: ["jungle", "drum and bass"],
  breakbeat: ["breakbeat", "breaks"],
  dubstep: ["dubstep", "bass"],
  uk_garage: ["uk garage", "garage"],
  future_garage: ["future garage", "garage"],
  trap: ["trap", "bass"],
  future_bass: ["future bass", "bass"],
  hardstyle: ["hardstyle", "hard dance"],
  hardcore: ["hardcore", "gabber"],
  gabber: ["gabber", "hardcore"],
  frenchcore: ["frenchcore", "hardcore"],
  speedcore: ["speedcore", "hardcore"],
  downtempo: ["downtempo", "chillout"],
  ambient: ["ambient", "electronic"],
  chillout: ["chillout", "downtempo"],
  trip_hop: ["trip hop", "downtempo"],
  darkwave: ["darkwave", "synthwave"],
  synthwave: ["synthwave", "electronic"],
  idm: ["idm", "electronic"],
  electro: ["electro", "electronic"]
};

const STYLE_FAMILY_FALLBACKS = {
  acid_techno: ["techno"],
  hard_techno: ["techno", "industrial techno"],
  dub_techno: ["techno", "minimal techno"],
  hypnotic_techno: ["techno", "minimal techno"],
  raw_techno: ["techno", "industrial techno"],
  detroit_techno: ["techno"],
  minimal_techno: ["techno"],
  melodic_techno: ["techno", "progressive house"],
  industrial_techno: ["techno"],
  peak_time_techno: ["techno", "edm"],
  deep_house: ["house"],
  tech_house: ["house", "techno"],
  progressive_house: ["house", "trance"],
  afro_house: ["house"],
  organic_house: ["house", "downtempo"],
  bass_house: ["house", "bass"],
  electro_house: ["house", "electro"],
  disco_house: ["house", "disco"],
  dark_psy: ["psytrance"],
  forest_psy: ["psytrance"],
  full_on: ["psytrance", "trance"],
  full_on_night: ["psytrance", "trance"],
  full_on_morning: ["psytrance", "trance"],
  progressive_psy: ["psytrance", "trance"],
  goa_trance: ["psytrance", "trance"],
  hi_tech: ["psytrance"],
  psycore: ["psytrance", "hardcore"],
  liquid_dnb: ["drum and bass"],
  neurofunk: ["drum and bass"],
  jump_up: ["drum and bass"],
  jungle: ["drum and bass"],
  future_garage: ["garage"],
  future_bass: ["bass"],
  gabber: ["hardcore"],
  frenchcore: ["hardcore"],
  speedcore: ["hardcore"],
  psybient: ["ambient", "downtempo"],
  slambient: ["ambient", "experimental"],
  trip_hop: ["downtempo"],
  synthwave: ["electronic"],
  darkwave: ["electronic"]
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

function styleKey(value = "") {
  return normalizeText(value).replace(/\s+/g, "_");
}

function cacheKey(request = {}) {
  return [
    styleKey(request.style),
    normalizeText(request.tag),
    normalizeText(request.query),
    normalizeText(request.country),
    normalizeText(request.language),
    Number(request.minBitrate) || 0,
    request.healthyOnly ? "healthy" : "any",
    request.limit
  ].join("::");
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
    expiresAt: Date.now() + envInt("SONIC_RADIO_BROWSER_CACHE_SECONDS", 21600, 300, 604800) * 1000
  });
  if (cache.size > 200) {
    const firstKey = cache.keys().next().value;
    if (firstKey) cache.delete(firstKey);
  }
}

function safeLimit(value, fallback = 8) {
  const parsed = Number.parseInt(String(value || ""), 10);
  if (!Number.isFinite(parsed)) return fallback;
  return Math.max(1, Math.min(20, parsed));
}

function radioBaseUrl() {
  return envText("SONIC_RADIO_BROWSER_BASE_URL", DEFAULT_RADIO_BROWSER_BASE_URL).replace(/\/+$/, "");
}

function requestTags({ style = "", tag = "", query = "" } = {}) {
  const direct = [tag, query].map((item) => trimText(item, 80)).filter(Boolean);
  const key = styleKey(style);
  const mapped = STYLE_TAGS[key] || STYLE_TAGS[normalizeText(style)] || [];
  const related = STYLE_FAMILY_FALLBACKS[key] || [];
  const fallback = style ? [String(style).replace(/_/g, " ")] : [];
  const seen = new Set();
  return [...direct, ...mapped, ...related, ...fallback]
    .map((item) => trimText(item, 80))
    .filter((item) => {
      const clean = normalizeText(item);
      if (!clean || seen.has(clean)) return false;
      seen.add(clean);
      return true;
    })
    .slice(0, 6);
}

function stationScore(station = {}) {
  const votes = Math.min(300, Math.max(0, Number(station.votes) || 0));
  const clicks = Math.min(2000, Math.max(0, Number(station.clickcount) || 0));
  const bitrate = Math.min(320, Math.max(0, Number(station.bitrate) || 0));
  const hasIcon = station.favicon ? 8 : 0;
  const hasHomepage = station.homepage ? 6 : 0;
  const checkOk = Number(station.lastcheckok) ? 20 : 0;
  return checkOk + hasIcon + hasHomepage + votes / 12 + clicks / 90 + bitrate / 16;
}

function normalizeStation(row = {}) {
  const urlResolved = trimText(row?.url_resolved || "", 1200);
  const url = trimText(row?.url || "", 1200);
  const streamUrl = urlResolved || url;
  if (!streamUrl) return null;
  const tags = String(row?.tags || "")
    .split(",")
    .map((tag) => trimText(tag, 60))
    .filter(Boolean)
    .slice(0, 12);
  const sourceDetails = [{
    ...RADIO_BROWSER_SOURCE_DETAIL,
    url: trimText(row?.homepage || RADIO_BROWSER_SOURCE_DETAIL.url, 500)
  }];
  return {
    id: trimText(row?.stationuuid || row?.changeuuid || "", 120),
    name: trimText(row?.name || "", 160),
    url,
    urlResolved,
    streamUrl,
    homepage: trimText(row?.homepage || "", 500),
    favicon: trimText(row?.favicon || "", 1200),
    tags,
    country: trimText(row?.country || "", 80),
    countryCode: trimText(row?.countrycode || "", 8),
    language: trimText(row?.language || "", 80),
    codec: trimText(row?.codec || "", 30),
    bitrate: Math.max(0, Number(row?.bitrate) || 0),
    votes: Math.max(0, Number(row?.votes) || 0),
    clickcount: Math.max(0, Number(row?.clickcount) || 0),
    lastcheckok: Boolean(Number(row?.lastcheckok)),
    source: "radio-browser",
    sourceDetails,
    attribution: {
      providers: ["Radio Browser"],
      line: "Station directory data: Radio Browser.",
      details: sourceDetails
    },
    qualityScore: stationScore(row)
  };
}

function cleanLanguage(value = "") {
  const clean = trimText(value, 40);
  if (!clean) return "";
  return /^[a-z]{2}$/i.test(clean) ? clean.toLowerCase() : clean;
}

function stationMatchesFilters(station = {}, request = {}) {
  const minBitrate = Math.max(0, Number(request.minBitrate) || 0);
  if (minBitrate && (Number(station.bitrate) || 0) < minBitrate) return false;
  if (request.healthyOnly && !station.lastcheckok) return false;
  return true;
}

async function fetchStationsForTag({ tag, country = "", language = "", limit = 8 } = {}) {
  const params = new URLSearchParams({
    tag,
    hidebroken: "true",
    order: "clickcount",
    reverse: "true",
    limit: String(Math.max(limit, 12))
  });
  const cleanCountry = trimText(country, 80);
  if (/^[a-z]{2}$/i.test(cleanCountry)) params.set("countrycode", cleanCountry.toUpperCase());
  else if (cleanCountry) params.set("country", cleanCountry);
  const cleanLang = cleanLanguage(language);
  if (cleanLang) params.set("language", cleanLang);

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), envInt("SONIC_RADIO_BROWSER_TIMEOUT_MS", 5200, 1000, 15000));
  try {
    const response = await fetch(`${radioBaseUrl()}/stations/search?${params.toString()}`, {
      method: "GET",
      headers: {
        Accept: "application/json",
        "User-Agent": envText("SONIC_RADIO_BROWSER_USER_AGENT", envText("SONIC_REFERENCE_USER_AGENT", DEFAULT_RADIO_USER_AGENT))
      },
      signal: controller.signal
    });
    const payload = await response.json().catch(() => null);
    if (!response.ok || !Array.isArray(payload)) return [];
    return payload.map(normalizeStation).filter(Boolean);
  } catch (_error) {
    return [];
  } finally {
    clearTimeout(timeout);
  }
}

async function fetchStations(request = {}) {
  const tags = requestTags(request);
  const batches = await Promise.all(tags.map((tag) => fetchStationsForTag({
    tag,
    country: request.country,
    language: request.language,
    limit: request.limit
  })));
  const seen = new Set();
  const ranked = batches
    .flat()
    .filter((station) => stationMatchesFilters(station, request))
    .filter((station) => {
      const key = station.id || station.streamUrl || station.name;
      if (!key || seen.has(key)) return false;
      seen.add(key);
      return true;
    })
    .sort((a, b) => b.qualityScore - a.qualityScore)
    .slice(0, request.limit);
  if (ranked.length || (!request.country && !request.language && !request.minBitrate && !request.healthyOnly)) return ranked;
  return fetchStations({ ...request, country: "", language: "", minBitrate: 0, healthyOnly: false });
}

function responseAttribution(stations = []) {
  const details = [];
  stations.forEach((station) => {
    const detail = Array.isArray(station?.sourceDetails) ? station.sourceDetails[0] : null;
    if (!detail) return;
    const key = detail.provider || detail.url || detail.name;
    if (key && !details.some((item) => (item.provider || item.url || item.name) === key)) details.push(detail);
  });
  if (!details.length) details.push(RADIO_BROWSER_SOURCE_DETAIL);
  return {
    providers: ["Radio Browser"],
    line: "Station directory data: Radio Browser.",
    details
  };
}

module.exports = async function handler(req, res) {
  if (!requireMusicApi(req, res, {
    methods: ["GET", "POST"],
    feature: "radio-browser",
    enabledEnv: "SONIC_RADIO_BROWSER_ENABLED",
    defaultEnabled: true,
    allowGlobalFallback: false,
    dailyLimitEnv: "SONIC_RADIO_BROWSER_DAILY_LIMIT",
    defaultDailyLimit: 120
  })) return;
  if (!await enforceDurableMusicDailyLimit(req, res, {
    methods: ["GET", "POST"],
    feature: "radio-browser",
    dailyLimitEnv: "SONIC_RADIO_BROWSER_DAILY_LIMIT",
    defaultDailyLimit: 120
  })) return;

  const body = parseBody(req);
  const request = {
    style: trimText(body.style || req.query?.style || "", 80),
    tag: trimText(body.tag || req.query?.tag || "", 80),
    query: trimText(body.query || body.q || req.query?.query || req.query?.q || "", 80),
    country: trimText(body.country || body.countryCode || req.query?.country || req.query?.countryCode || "", 80),
    language: cleanLanguage(body.language || body.lang || req.query?.language || req.query?.lang || ""),
    minBitrate: Math.max(0, Number(body.minBitrate || req.query?.minBitrate || envInt("SONIC_RADIO_BROWSER_MIN_BITRATE", 0, 0, 320)) || 0),
    healthyOnly: String(body.healthyOnly ?? req.query?.healthyOnly ?? "").toLowerCase() === "true",
    limit: safeLimit(body.limit || req.query?.limit, envInt("SONIC_RADIO_BROWSER_LIMIT", 8, 1, 20))
  };

  if (!request.style && !request.tag && !request.query) {
    sendJson(req, res, 400, { error: "missing_style_or_tag" }, ["GET", "POST", "OPTIONS"]);
    return;
  }

  const key = cacheKey(request);
  const cached = cacheRead(key);
  if (cached) {
    sendJson(req, res, 200, { ...cached, cached: true }, ["GET", "POST", "OPTIONS"]);
    return;
  }

  try {
    const stations = await fetchStations(request);
    const payload = {
      ok: true,
      enabled: true,
      source: "radio-browser",
      request,
      tags: requestTags(request),
      count: stations.length,
      attribution: responseAttribution(stations),
      stations
    };
    cacheWrite(key, payload);
    if (stations.length) {
      await persistCatalogEnrichments({
        entityType: "radio_style",
        style: request.style || request.tag || request.query,
        source: "radio-browser",
        sourceUrl: RADIO_BROWSER_SOURCE_DETAIL.url,
        confidence: Math.min(1, Math.max(0.2, stations.length / Math.max(1, request.limit))),
        payload: {
          request,
          tags: payload.tags,
          count: stations.length,
          stations: stations.slice(0, 8).map((station) => ({
            name: station.name,
            homepage: station.homepage,
            favicon: station.favicon,
            country: station.country,
            countryCode: station.countryCode,
            language: station.language,
            tags: station.tags,
            codec: station.codec,
            bitrate: station.bitrate,
            votes: station.votes,
            lastcheckok: station.lastcheckok,
            qualityScore: station.qualityScore
          })),
          attribution: payload.attribution
        }
      });
    }
    sendJson(req, res, 200, payload, ["GET", "POST", "OPTIONS"]);
  } catch (error) {
    sendJson(req, res, 500, {
      ok: false,
      error: "radio_browser_failed",
      detail: error.message
    }, ["GET", "POST", "OPTIONS"]);
  }
};
