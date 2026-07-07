const fs = require("fs");
const path = require("path");
const { envFlag, envInt, trimText } = require("./_music-apis");

const GOABASE_PARTY_LIST_URL = "https://www.goabase.net/api/party/json/";
const GOABASE_SNAPSHOT_PATH = path.join(__dirname, "..", "..", "data", "event_radar_goabase_upcoming_latest.json");

let goabaseSnapshotCache = null;

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

function textContainsNormalizedTerm(text = "", term = "") {
  const haystack = ` ${normalizeForMatch(text)} `;
  const needle = normalizeForMatch(term);
  return Boolean(needle && haystack.includes(` ${needle} `));
}

function uniqueByKey(items = [], keyFn) {
  const seen = new Set();
  const out = [];
  items.forEach((item) => {
    const key = keyFn(item);
    if (!key || seen.has(key)) return;
    seen.add(key);
    out.push(item);
  });
  return out;
}

function eventTimeValue(event) {
  const value = event?.datetime || event?.startAt || event?.dateStart || "";
  if (!value) return 0;
  const time = new Date(value).getTime();
  return Number.isFinite(time) ? time : 0;
}

function futureEventsOnly(events = []) {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return events.filter((event) => eventTimeValue(event) >= today.getTime());
}

function inferGoabaseStyles(text = "") {
  const normalized = normalizeForMatch(text);
  const styles = [];
  const add = (style) => {
    if (style && !styles.includes(style)) styles.push(style);
  };

  if (/\bhi\s*tech\b|\bhitech\b/.test(normalized)) add("hi_tech");
  if (/\bdark\s*psy\b|\bdarkpsy\b|\bpsycore\b/.test(normalized)) add("dark_psy");
  if (/\bforest\b/.test(normalized)) add("forest_psy");
  if (/\bnight\s*psy\b|\bnightpsy\b|\btwilight\b/.test(normalized)) add("twilight_psy");
  if (/\bfull\s*on\b|\bfullon\b/.test(normalized)) add("full_on");
  if (/\bprogressive\b|\bproggy\b|\bprog\b/.test(normalized)) add("progressive_psy");
  if (/\bgoa\b/.test(normalized)) add("goa_trance");
  if (/\bpsytrance\b|\bpsy trance\b|\bpsychedelic trance\b/.test(normalized)) add("psytrance");
  if (/\btechno\b/.test(normalized)) add("techno");
  if (/\bhouse\b/.test(normalized)) add("house");
  return styles;
}

function stripFlagEmoji(value = "") {
  return String(value || "").replace(/[\u{1F1E6}-\u{1F1FF}]/gu, " ");
}

function cleanArtistCandidate(value = "") {
  return stripFlagEmoji(value)
    .replace(/https?:\/\/\S+/gi, " ")
    .replace(/[@#]\S+/g, " ")
    .replace(/\([^)]*(?:live|dj set|set)[^)]*\)/gi, " ")
    .replace(/\s*[\[(][^\])]{1,80}[\])]\s*$/g, " ")
    .replace(/\s*\([A-Z]{2,3}\)\s*$/g, " ")
    .replace(/\b(?:live act|live set|dj set|set)\b/gi, " ")
    .replace(/\s+-\s+.*$/g, " ")
    .replace(/^[^\p{L}\p{N}]+/gu, " ")
    .replace(/[|/]+$/g, " ")
    .replace(/[:;]+$/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function shouldSkipLineupCandidate(value = "") {
  const clean = cleanArtistCandidate(value);
  const key = normalizeForMatch(clean);
  if (!key || clean.length < 2 || clean.length > 80) return true;
  if (/^(line\s*up|timetable|timeline|pause|fim|end|doors|opening|abertura|portaria)$/i.test(key)) return true;
  if (/\b(ticket|tickets|entrada|presale|workshop|bar|camping|location|venue|organizer|support|instagram|facebook|whatsapp|premium|gazebo|motor\s*home|caravan|glamping|tent|hookup|tba|lineup|stage|accommodation|infrastructure|options|status|updates|book|stay|exclusive|shared)\b/.test(key)) return true;
  if (/[a-z0-9]\.(?:com|net|org|cz|br|de|live|tickets)\b/i.test(clean)) return true;
  if (clean.split(/\s+/).length > 7 && !/\b(b2b|vs|live)\b/i.test(clean)) return true;
  return false;
}

function addLineupArtist(map, rawName, { timeSlot = "", source = "lineup" } = {}) {
  const role = /\blive\b/i.test(rawName) ? "live" : "dj";
  const cleaned = cleanArtistCandidate(rawName).replace(/\blive\b/gi, " ").replace(/\s+/g, " ").trim();
  if (shouldSkipLineupCandidate(cleaned)) return;

  const candidates = [cleaned];
  if (/\b(?:b2b|vs\.?|versus)\b/i.test(cleaned)) {
    cleaned.split(/\s+(?:b2b|vs\.?|versus)\s+/i).forEach((part) => candidates.push(part));
  }

  candidates.forEach((candidate) => {
    const name = cleanArtistCandidate(candidate);
    if (shouldSkipLineupCandidate(name)) return;
    const key = normalizeForMatch(name);
    if (!key || map.has(key)) return;
    map.set(key, {
      name: trimText(name, 120),
      role,
      timeSlot: trimText(timeSlot, 60),
      source
    });
  });
}

function extractLineupArtists({ textLineUp = "", textMore = "" } = {}) {
  const artists = new Map();
  String(textLineUp || "")
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean)
    .forEach((line) => {
      addLineupArtist(artists, line, { source: "lineup" });
    });

  String(textMore || "")
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean)
    .forEach((line) => {
      const match = line.match(/^((?:\d{1,2}(?::\d{2})?)\s*(?:-|--|to|bis)\s*(?:\d{1,2}(?::\d{2})?)?)\s+(.+)$/i);
      if (!match) return;
      addLineupArtist(artists, match[2], { timeSlot: match[1], source: "timetable" });
    });

  return Array.from(artists.values()).sort((a, b) => a.name.localeCompare(b.name));
}

function goabasePartyText(party = {}) {
  return [
    party.nameParty,
    party.nameType,
    party.nameCountry,
    party.nameTown,
    party.nameOrganizer,
    party.textLineUp,
    party.textMore,
    party.textLocation
  ].filter(Boolean).join(" ");
}

function goabasePartyUrl(party = {}) {
  return trimText(party.urlPartyHtml || party.urlParty || `https://www.goabase.net/party/${party.id || ""}`, 500);
}

function normalizeGoabasePartyEvent(party = {}, { artist = "", matchedArtist = "" } = {}) {
  const text = goabasePartyText(party);
  const artists = extractLineupArtists(party);
  const sourceUrl = goabasePartyUrl(party);
  return {
    id: `goabase-${party.id || sourceUrl || party.dateStart}`,
    name: trimText(party.nameParty || "Goabase event", 180),
    artist: trimText(matchedArtist || artist || "", 120),
    datetime: trimText(party.dateStart || "", 80),
    dateEnd: trimText(party.dateEnd || "", 80),
    dateOnly: false,
    venue: trimText(party.nameLocation || party.nameVenue || party.nameParty || "Venue a confirmar", 140),
    city: trimText(party.nameTown || "Cidade a confirmar", 90),
    country: trimText(party.isoCountry || party.nameCountry || "", 40),
    countryName: trimText(party.nameCountry || "", 80),
    timezone: trimText(party.timezone || "", 80),
    url: sourceUrl,
    sourceName: "Goabase",
    sourceUrl,
    sourceEventId: String(party.id || ""),
    eventType: trimText(party.nameType || "", 80),
    organizer: trimText(party.nameOrganizer || "", 140),
    imageUrl: trimText(party.urlImageLarge || party.urlImageFull || party.urlImageMedium || party.urlImageSmall || "", 500),
    styles: inferGoabaseStyles(text),
    lineupArtists: artists.map((item) => item.name)
  };
}

function goabasePartyMatchesArtist(party = {}, query = "") {
  const queryKey = normalizeForMatch(query);
  if (!queryKey) return null;
  const artists = Array.isArray(party.artists) && party.artists.length
    ? party.artists
    : extractLineupArtists(party);
  const matched = artists.find((item) => {
    const name = typeof item === "string" ? item : item?.name;
    const key = normalizeForMatch(name);
    return key && (key === queryKey || textContainsNormalizedTerm(name, query) || textContainsNormalizedTerm(query, name));
  });
  if (matched) return typeof matched === "string" ? matched : matched.name;

  const text = goabasePartyText(party);
  return textContainsNormalizedTerm(text, query) ? query : null;
}

async function fetchJson(url) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), envInt("SONIC_GOABASE_TIMEOUT_MS", 8000, 1000, 20000));
  try {
    const response = await fetch(url, {
      headers: {
        Accept: "application/json",
        "User-Agent": "SonicSearch/1.0 (+https://sonicsearch.app)"
      },
      signal: controller.signal
    });
    const payload = await response.json().catch(() => ({}));
    if (!response.ok) {
      const error = new Error("goabase_events_failed");
      error.statusCode = response.status || 502;
      error.detail = payload?.message || response.statusText;
      throw error;
    }
    return payload;
  } finally {
    clearTimeout(timer);
  }
}

async function fetchGoabasePartyList({ query = "", countryCode = "", limit = 50 } = {}) {
  const params = new URLSearchParams({
    limit: String(Math.max(1, Math.min(50, Number(limit) || 50)))
  });
  if (query) params.set("search", query);
  if (countryCode) params.set("country", String(countryCode || "").trim().slice(0, 2).toUpperCase());
  const payload = await fetchJson(`${GOABASE_PARTY_LIST_URL}?${params.toString()}`);
  return Array.isArray(payload?.partylist) ? payload.partylist : [];
}

async function fetchGoabasePartyDetails(id) {
  if (!id) return null;
  const payload = await fetchJson(`${GOABASE_PARTY_LIST_URL}${encodeURIComponent(String(id))}`);
  return payload?.party || null;
}

async function fetchGoabaseEventsForQuery({ query = "", countryCode = "", size = 10 } = {}) {
  if (!envFlag("SONIC_GOABASE_ENABLED", true)) return [];
  const safeQuery = trimText(query, 120);
  if (!safeQuery) return [];
  const listLimit = envInt("SONIC_GOABASE_LIST_LIMIT", Math.max(12, Math.min(50, size * 4)), 1, 50);
  const detailLimit = envInt("SONIC_GOABASE_DETAIL_LIMIT", Math.max(6, Math.min(20, size * 2)), 1, 50);
  const list = await fetchGoabasePartyList({ query: safeQuery, countryCode, limit: listLimit });
  const events = [];

  for (const item of list.slice(0, detailLimit)) {
    let party = item;
    try {
      party = await fetchGoabasePartyDetails(item.id) || item;
    } catch (_error) {
      party = item;
    }
    const matchedArtist = goabasePartyMatchesArtist(party, safeQuery);
    if (!matchedArtist) continue;
    events.push(normalizeGoabasePartyEvent(party, { artist: query, matchedArtist }));
  }

  return futureEventsOnly(uniqueByKey(events, (event) => event.sourceUrl || event.id))
    .sort((a, b) => eventTimeValue(a) - eventTimeValue(b))
    .slice(0, size);
}

function loadGoabaseSnapshot() {
  if (goabaseSnapshotCache) return goabaseSnapshotCache;
  try {
    const payload = JSON.parse(fs.readFileSync(GOABASE_SNAPSHOT_PATH, "utf8"));
    goabaseSnapshotCache = {
      ...payload,
      events: Array.isArray(payload?.events) ? payload.events : []
    };
  } catch (_error) {
    goabaseSnapshotCache = { events: [] };
  }
  return goabaseSnapshotCache;
}

function snapshotEventToAgendaEvent(event = {}, artist = "") {
  return {
    id: `goabase-${event.sourceEventId || event.id || event.sourceUrl}`,
    name: trimText(event.name || "Goabase event", 180),
    artist: trimText(artist || "", 120),
    datetime: trimText(event.startAt || event.datetime || "", 80),
    dateEnd: trimText(event.endAt || event.dateEnd || "", 80),
    dateOnly: false,
    venue: trimText(event.venue || event.name || "Venue a confirmar", 140),
    city: trimText(event.city || "Cidade a confirmar", 90),
    country: trimText(event.countryCode || event.country || "", 40),
    countryName: trimText(event.country || event.countryName || "", 80),
    timezone: trimText(event.timezone || "", 80),
    url: trimText(event.sourceUrl || event.url || "", 500),
    sourceName: "Goabase snapshot",
    sourceUrl: trimText(event.sourceUrl || event.url || "", 500),
    sourceEventId: String(event.sourceEventId || event.id || ""),
    eventType: trimText(event.eventType || "", 80),
    organizer: trimText(event.organizer || "", 140),
    imageUrl: trimText(event.imageUrl || "", 500),
    styles: Array.isArray(event.styles) ? event.styles : [],
    lineupArtists: Array.isArray(event.artists) ? event.artists.map((item) => item.name || item).filter(Boolean) : []
  };
}

function goabaseSnapshotEventsForQuery({ query = "", countryCode = "", size = 10 } = {}) {
  const safeQuery = trimText(query, 120);
  if (!safeQuery) return [];
  const snapshot = loadGoabaseSnapshot();
  const countryKey = String(countryCode || "").trim().slice(0, 2).toUpperCase();
  const events = snapshot.events
    .filter((event) => !countryKey || String(event.countryCode || "").toUpperCase() === countryKey)
    .filter((event) => {
      const matchedArtist = goabasePartyMatchesArtist({
        nameParty: event.name,
        nameCountry: event.country,
        nameTown: event.city,
        textLineUp: "",
        textMore: "",
        artists: event.artists || []
      }, safeQuery);
      return Boolean(matchedArtist);
    })
    .map((event) => snapshotEventToAgendaEvent(event, safeQuery));

  return futureEventsOnly(uniqueByKey(events, (event) => event.sourceUrl || event.id))
    .sort((a, b) => eventTimeValue(a) - eventTimeValue(b))
    .slice(0, size);
}

function listGoabaseSnapshotEvents({ countryCode = "", style = "", artist = "", size = 50 } = {}) {
  const snapshot = loadGoabaseSnapshot();
  const countryKey = String(countryCode || "").trim().slice(0, 2).toUpperCase();
  const styleKey = normalizeForMatch(style).replace(/\s+/g, "_");
  const artistKey = normalizeForMatch(artist);
  const events = snapshot.events
    .filter((event) => !countryKey || String(event.countryCode || "").toUpperCase() === countryKey)
    .filter((event) => !styleKey || (Array.isArray(event.styles) && event.styles.some((item) => normalizeForMatch(item).replace(/\s+/g, "_") === styleKey)))
    .filter((event) => {
      if (!artistKey) return true;
      return Boolean(goabasePartyMatchesArtist({
        nameParty: event.name,
        nameCountry: event.country,
        nameTown: event.city,
        artists: event.artists || []
      }, artist));
    })
    .map((event) => snapshotEventToAgendaEvent(event, artist));

  return futureEventsOnly(uniqueByKey(events, (event) => event.sourceUrl || event.id))
    .sort((a, b) => eventTimeValue(a) - eventTimeValue(b))
    .slice(0, Math.max(1, Math.min(100, Number(size) || 50)));
}

module.exports = {
  GOABASE_PARTY_LIST_URL,
  GOABASE_SNAPSHOT_PATH,
  extractLineupArtists,
  fetchGoabaseEventsForQuery,
  fetchGoabasePartyDetails,
  fetchGoabasePartyList,
  futureEventsOnly,
  goabaseSnapshotEventsForQuery,
  inferGoabaseStyles,
  listGoabaseSnapshotEvents,
  normalizeForMatch,
  normalizeGoabasePartyEvent
};
