const { envInt, envText, featureEnabled, parseBody, requireMusicApi, sendJson, trimText } = require("./_music-apis");

const TICKETMASTER_EVENTS_URL = "https://app.ticketmaster.com/discovery/v2/events.json";
const BANDSINTOWN_EVENTS_URL = "https://rest.bandsintown.com/artists";

function requestParam(req, body, name) {
  return trimText(body?.[name] || req?.query?.[name] || "", 180);
}

function safeSize(value, fallback = 20) {
  const parsed = Number.parseInt(String(value || ""), 10);
  if (!Number.isFinite(parsed)) return fallback;
  return Math.max(1, Math.min(50, parsed));
}

function normalizeForMatch(value = "") {
  return String(value || "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/&amp;/g, "&")
    .replace(/[^a-z0-9]+/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function uniquePush(list, value) {
  const clean = trimText(value, 120);
  const key = normalizeForMatch(clean);
  if (!key || list.some((item) => normalizeForMatch(item) === key)) return;
  list.push(clean);
}

function artistQueryVariants(artist) {
  const variants = [];
  const clean = trimText(artist, 120).replace(/\s+/g, " ").trim();
  uniquePush(variants, clean);
  uniquePush(variants, clean.replace(/\([^)]*\)/g, " "));
  uniquePush(variants, clean.replace(/\b(?:dj|live|official)\b/gi, " "));
  [
    /\s+(?:feat\.?|ft\.?|featuring)\s+/i,
    /\s+(?:&|x|vs\.?|versus)\s+/i,
    /\s*\+\s*/i,
    /\s*,\s*/i
  ].forEach((splitter) => {
    uniquePush(variants, clean.split(splitter)[0]);
  });
  return variants;
}

function eventStartDate(event) {
  return event?.dates?.start?.dateTime || event?.dates?.start?.localDate || "";
}

function eventTimeValue(event) {
  if (!event?.datetime) return 0;
  const value = event.dateOnly ? `${String(event.datetime).slice(0, 10)}T12:00:00Z` : event.datetime;
  const time = new Date(value).getTime();
  return Number.isFinite(time) ? time : 0;
}

function futureEventsOnly(events) {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return events.filter((event) => eventTimeValue(event) >= today.getTime());
}

function normalizeTicketmasterEvent(event, queryArtist) {
  const venue = event?._embedded?.venues?.[0] || {};
  const datetime = eventStartDate(event);
  if (!datetime) return null;

  return {
    id: String(event.id || event.url || datetime),
    name: trimText(event.name || "", 160),
    artist: trimText(queryArtist || "", 120),
    datetime,
    dateOnly: Boolean(!event?.dates?.start?.dateTime && event?.dates?.start?.localDate),
    venue: trimText(venue.name || "Venue a confirmar", 120),
    city: trimText(venue.city?.name || "Cidade a confirmar", 90),
    country: trimText(venue.country?.countryCode || venue.country?.name || "", 40),
    url: trimText(event.url || "", 500),
    sourceName: "Ticketmaster",
    sourceUrl: trimText(event.url || "", 500)
  };
}

function normalizeBandsintownEvent(event, queryArtist) {
  if (!event?.datetime) return null;
  return {
    id: String(event.id || event.url || event.datetime),
    name: trimText(event.title || event.description || `${queryArtist} live`, 160),
    artist: trimText(queryArtist || "", 120),
    datetime: event.datetime,
    dateOnly: false,
    venue: trimText(event.venue?.name || "Venue a confirmar", 120),
    city: trimText(event.venue?.city || "Cidade a confirmar", 90),
    country: trimText(event.venue?.country || "", 40),
    url: trimText(event.url || "", 500),
    sourceName: "Bandsintown",
    sourceUrl: trimText(event.url || "", 500)
  };
}

function eventDedupeKey(event) {
  return [
    normalizeForMatch(event.name),
    normalizeForMatch(event.venue),
    normalizeForMatch(event.city),
    String(event.datetime || "").slice(0, 10)
  ].join("|");
}

function mergeEvents(...groups) {
  const seen = new Set();
  const merged = [];
  groups.flat().forEach((event) => {
    if (!event) return;
    const key = event.url || eventDedupeKey(event);
    if (!key || seen.has(key)) return;
    seen.add(key);
    merged.push(event);
  });
  return futureEventsOnly(merged).sort((a, b) => eventTimeValue(a) - eventTimeValue(b));
}

async function fetchTicketmasterEventsForQuery({ query, countryCode, size }) {
  const apiKey = envText("TICKETMASTER_API_KEY") || envText("TICKETMASTER_CONSUMER_KEY");
  if (!apiKey) return [];

  const params = new URLSearchParams({
    apikey: apiKey,
    keyword: query,
    classificationName: "music",
    size: String(size),
    sort: "date,asc",
    locale: "*"
  });
  if (countryCode) params.set("countryCode", countryCode.toUpperCase());

  const response = await fetch(`${TICKETMASTER_EVENTS_URL}?${params.toString()}`, {
    headers: { Accept: "application/json" }
  });
  const payload = await response.json().catch(() => ({}));
  if (!response.ok) {
    const error = new Error("ticketmaster_events_failed");
    error.statusCode = response.status || 502;
    error.detail = payload?.fault?.faultstring || payload?.message || response.statusText;
    throw error;
  }

  const rows = payload?._embedded?.events;
  return (Array.isArray(rows) ? rows : [])
    .map((event) => normalizeTicketmasterEvent(event, query))
    .filter(Boolean);
}

async function fetchBandsintownEventsForQuery({ query }) {
  if (!featureEnabled("SONIC_BANDSINTOWN_ENABLED", true)) return [];
  const appId = envText("BANDSINTOWN_APP_ID", "neonpulse_selector");
  const params = new URLSearchParams({ app_id: appId });
  const response = await fetch(`${BANDSINTOWN_EVENTS_URL}/${encodeURIComponent(query)}/events?${params.toString()}`, {
    headers: { Accept: "application/json" }
  });
  const payload = await response.json().catch(() => []);
  if (!response.ok || !Array.isArray(payload)) return [];
  return payload.map((event) => normalizeBandsintownEvent(event, query)).filter(Boolean);
}

async function fetchAggregatedEvents({ artist, countryCode, size }) {
  const variants = artistQueryVariants(artist).slice(0, envInt("SONIC_EVENTS_QUERY_VARIANTS_LIMIT", 4, 1, 8));
  const ticketmasterGroups = [];
  const bandsintownGroups = [];

  for (const query of variants) {
    try {
      ticketmasterGroups.push(await fetchTicketmasterEventsForQuery({ query, countryCode, size }));
    } catch (error) {
      if (error.statusCode && error.statusCode >= 500) throw error;
    }
    try {
      bandsintownGroups.push(await fetchBandsintownEventsForQuery({ query }));
    } catch (_error) {
      // Bandsintown is a coverage booster; Ticketmaster/fallback still keep the endpoint useful.
    }
  }

  const events = mergeEvents(ticketmasterGroups, bandsintownGroups).slice(0, size);
  const providers = Array.from(new Set(events.map((event) => event.sourceName).filter(Boolean)));
  return {
    events,
    providers,
    source: providers.length > 1 ? "aggregated" : normalizeForMatch(providers[0] || "none")
  };
}

function requestArtists(req, body, singleArtist) {
  const rawArtists = Array.isArray(body?.artists)
    ? body.artists
    : String(body?.artists || req?.query?.artists || "")
      .split("|")
      .flatMap((part) => part.split(","));
  const artists = [];
  rawArtists.forEach((artist) => uniquePush(artists, artist));
  uniquePush(artists, singleArtist);
  return artists.slice(0, envInt("SONIC_EVENTS_BATCH_ARTIST_LIMIT", 12, 1, 50));
}

module.exports = async function handler(req, res) {
  if (!requireMusicApi(req, res, {
    methods: ["GET", "POST"],
    feature: "artist-events",
    enabledEnv: "SONIC_TICKETMASTER_ENABLED",
    defaultEnabled: false,
    dailyLimitEnv: "SONIC_TICKETMASTER_EVENTS_DAILY_LIMIT",
    defaultDailyLimit: 80
  })) return;

  const body = parseBody(req);
  const artist = requestParam(req, body, "artist");
  const artists = requestArtists(req, body, artist);
  const countryCode = requestParam(req, body, "countryCode").slice(0, 2);
  const size = safeSize(body?.size || req?.query?.size, envInt("SONIC_TICKETMASTER_EVENTS_LIMIT", 20, 1, 50));

  if (!artists.length) {
    sendJson(req, res, 400, { error: "missing_artist" }, ["GET", "POST", "OPTIONS"]);
    return;
  }

  try {
    const byArtist = [];
    for (const name of artists) {
      const result = await fetchAggregatedEvents({ artist: name, countryCode, size });
      byArtist.push({
        artist: name,
        source: result.source,
        providers: result.providers,
        count: result.events.length,
        events: result.events
      });
    }
    const primary = byArtist[0] || { events: [], providers: [], source: "none" };
    sendJson(req, res, 200, {
      ok: true,
      source: primary.source,
      providers: primary.providers,
      artist: primary.artist,
      count: primary.events.length,
      events: primary.events,
      batchCount: byArtist.length,
      artistsWithEvents: byArtist.filter((item) => item.count > 0).map((item) => item.artist),
      byArtist
    }, ["GET", "POST", "OPTIONS"]);
  } catch (error) {
    sendJson(req, res, error.statusCode || 500, {
      error: error.message || "ticketmaster_events_failed",
      detail: error.detail || ""
    }, ["GET", "POST", "OPTIONS"]);
  }
};
