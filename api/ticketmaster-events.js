const { envInt, envText, parseBody, requireMusicApi, sendJson, trimText } = require("./_music-apis");

const EVENTS_URL = "https://app.ticketmaster.com/discovery/v2/events.json";

function requestParam(req, body, name) {
  return trimText(body?.[name] || req?.query?.[name] || "", 160);
}

function safeSize(value, fallback = 10) {
  const parsed = Number.parseInt(String(value || ""), 10);
  if (!Number.isFinite(parsed)) return fallback;
  return Math.max(1, Math.min(25, parsed));
}

function eventStartDate(event) {
  return event?.dates?.start?.dateTime || event?.dates?.start?.localDate || "";
}

function normalizeTicketmasterEvent(event) {
  const venue = event?._embedded?.venues?.[0] || {};
  const datetime = eventStartDate(event);
  if (!datetime) return null;

  return {
    id: String(event.id || event.url || datetime),
    name: trimText(event.name || "", 160),
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

async function fetchTicketmasterEvents({ artist, countryCode, size }) {
  const apiKey = envText("TICKETMASTER_API_KEY") || envText("TICKETMASTER_CONSUMER_KEY");
  if (!apiKey) {
    const error = new Error("missing_ticketmaster_credentials");
    error.statusCode = 503;
    throw error;
  }

  const params = new URLSearchParams({
    apikey: apiKey,
    keyword: artist,
    classificationName: "music",
    size: String(size),
    sort: "date,asc"
  });
  if (countryCode) params.set("countryCode", countryCode.toUpperCase());

  const response = await fetch(`${EVENTS_URL}?${params.toString()}`, {
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
  const now = new Date();
  return (Array.isArray(rows) ? rows : [])
    .map(normalizeTicketmasterEvent)
    .filter(Boolean)
    .filter((event) => new Date(event.datetime) >= now)
    .sort((a, b) => new Date(a.datetime) - new Date(b.datetime));
}

module.exports = async function handler(req, res) {
  if (!requireMusicApi(req, res, {
    methods: ["GET", "POST"],
    feature: "ticketmaster-events",
    enabledEnv: "SONIC_TICKETMASTER_ENABLED",
    defaultEnabled: false,
    dailyLimitEnv: "SONIC_TICKETMASTER_EVENTS_DAILY_LIMIT",
    defaultDailyLimit: 80
  })) return;

  const body = parseBody(req);
  const artist = requestParam(req, body, "artist");
  const countryCode = requestParam(req, body, "countryCode").slice(0, 2);
  const size = safeSize(body?.size || req?.query?.size, envInt("SONIC_TICKETMASTER_EVENTS_LIMIT", 10, 1, 25));

  if (!artist) {
    sendJson(req, res, 400, { error: "missing_artist" }, ["GET", "POST", "OPTIONS"]);
    return;
  }

  try {
    const events = await fetchTicketmasterEvents({ artist, countryCode, size });
    sendJson(req, res, 200, {
      ok: true,
      source: "ticketmaster",
      artist,
      count: events.length,
      events
    }, ["GET", "POST", "OPTIONS"]);
  } catch (error) {
    sendJson(req, res, error.statusCode || 500, {
      error: error.message || "ticketmaster_events_failed",
      detail: error.detail || ""
    }, ["GET", "POST", "OPTIONS"]);
  }
};
