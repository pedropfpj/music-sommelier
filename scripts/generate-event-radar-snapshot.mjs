import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { createRequire } from "node:module";

const require = createRequire(import.meta.url);
const {
  extractLineupArtists,
  fetchGoabasePartyDetails,
  fetchGoabasePartyList,
  inferGoabaseStyles,
  normalizeGoabasePartyEvent
} = require("../lib/api/_event-sources");

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const repoRoot = path.resolve(__dirname, "..");
const dataDir = path.join(repoRoot, "data");
const latestJsonPath = path.join(dataDir, "event_radar_goabase_upcoming_latest.json");
const latestCsvPath = path.join(dataDir, "artist_events_goabase_upcoming_latest.csv");
const datedStamp = new Date().toISOString().slice(0, 10).replace(/-/g, "");
const datedJsonPath = path.join(dataDir, `event_radar_goabase_upcoming_${datedStamp}.json`);
const datedCsvPath = path.join(dataDir, `artist_events_goabase_upcoming_${datedStamp}.csv`);

const GOABASE_COUNTRIES_URL = "https://www.goabase.net/api/party/json/?country=list-all";
const SOURCE_DOC_URL = "https://www.goabase.net/api/party/";

function parseArgs(argv = process.argv.slice(2)) {
  const options = {
    countries: "",
    limit: 50,
    detailDelayMs: 90
  };
  argv.forEach((arg) => {
    const [key, value = ""] = arg.replace(/^--/, "").split("=");
    if (key === "countries") options.countries = value;
    if (key === "limit") options.limit = Math.max(1, Math.min(50, Number.parseInt(value, 10) || 50));
    if (key === "detail-delay-ms") options.detailDelayMs = Math.max(0, Math.min(1000, Number.parseInt(value, 10) || 0));
  });
  return options;
}

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function fetchJson(url) {
  const response = await fetch(url, {
    headers: {
      Accept: "application/json",
      "User-Agent": "SonicSearch/1.0 (+https://sonicsearch.app)"
    }
  });
  const payload = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw new Error(`${response.status} ${response.statusText} from ${url}`);
  }
  return payload;
}

async function fetchCountryCodes(countriesArg = "") {
  if (countriesArg && countriesArg !== "all") {
    return countriesArg
      .split(",")
      .map((item) => item.trim().toUpperCase())
      .filter(Boolean);
  }
  const payload = await fetchJson(GOABASE_COUNTRIES_URL);
  return (Array.isArray(payload?.countrylist) ? payload.countrylist : [])
    .map((country) => String(country.isoCountry || "").trim().toUpperCase())
    .filter(Boolean);
}

function goabasePartyToSnapshotEvent(party = {}) {
  const agenda = normalizeGoabasePartyEvent(party);
  const text = [
    party.textLineUp,
    party.textMore,
    party.nameParty,
    party.nameType
  ].filter(Boolean).join(" ");
  const artists = extractLineupArtists(party);
  return {
    source: "goabase",
    sourceEventId: String(party.id || ""),
    name: agenda.name,
    startAt: agenda.datetime,
    endAt: agenda.dateEnd,
    timezone: agenda.timezone,
    eventType: agenda.eventType,
    countryCode: String(party.isoCountry || "").trim().toUpperCase(),
    country: String(party.nameCountry || "").trim(),
    city: agenda.city,
    venue: agenda.venue,
    lat: Number.isFinite(Number(party.geoLat)) ? Number(party.geoLat) : null,
    lon: Number.isFinite(Number(party.geoLon)) ? Number(party.geoLon) : null,
    organizer: agenda.organizer,
    imageUrl: agenda.imageUrl,
    sourceUrl: agenda.sourceUrl,
    styles: inferGoabaseStyles(text),
    artists
  };
}

function csvCell(value = "") {
  const text = Array.isArray(value) ? value.join(";") : String(value ?? "");
  return `"${text.replace(/"/g, '""')}"`;
}

function writeArtistEventsCsv(events = [], filePath) {
  const header = [
    "source",
    "source_event_id",
    "event_name",
    "start_at",
    "end_at",
    "timezone",
    "country_code",
    "country",
    "city",
    "venue",
    "event_type",
    "artist_name",
    "role",
    "time_slot",
    "styles",
    "source_url",
    "image_url"
  ];
  const rows = [header.map(csvCell).join(",")];
  events.forEach((event) => {
    const artists = Array.isArray(event.artists) && event.artists.length
      ? event.artists
      : [{ name: "", role: "", timeSlot: "" }];
    artists.forEach((artist) => {
      rows.push([
        event.source,
        event.sourceEventId,
        event.name,
        event.startAt,
        event.endAt,
        event.timezone,
        event.countryCode,
        event.country,
        event.city,
        event.venue,
        event.eventType,
        artist.name,
        artist.role,
        artist.timeSlot,
        event.styles,
        event.sourceUrl,
        event.imageUrl
      ].map(csvCell).join(","));
    });
  });
  fs.writeFileSync(filePath, `${rows.join("\n")}\n`);
}

async function main() {
  const options = parseArgs();
  fs.mkdirSync(dataDir, { recursive: true });
  const countryCodes = await fetchCountryCodes(options.countries || "all");
  const partyById = new Map();

  for (const countryCode of countryCodes) {
    const list = await fetchGoabasePartyList({ countryCode, limit: options.limit });
    list.forEach((party) => {
      if (party?.id && !partyById.has(String(party.id))) {
        partyById.set(String(party.id), party);
      }
    });
    process.stdout.write(`${countryCode}:${list.length} `);
  }
  process.stdout.write("\n");

  const detailedParties = [];
  let index = 0;
  for (const party of partyById.values()) {
    index += 1;
    try {
      const detail = await fetchGoabasePartyDetails(party.id);
      detailedParties.push(detail || party);
    } catch (_error) {
      detailedParties.push(party);
    }
    if (options.detailDelayMs && index < partyById.size) {
      await sleep(options.detailDelayMs);
    }
  }

  const nowIso = new Date().toISOString();
  const events = detailedParties
    .map(goabasePartyToSnapshotEvent)
    .filter((event) => event.sourceEventId && event.startAt)
    .sort((a, b) => new Date(a.startAt).getTime() - new Date(b.startAt).getTime());

  const payload = {
    generatedAt: nowIso,
    source: "goabase",
    sourceName: "Goabase",
    sourceDocumentationUrl: SOURCE_DOC_URL,
    countries: countryCodes,
    eventCount: events.length,
    artistEventCount: events.reduce((sum, event) => sum + (Array.isArray(event.artists) ? event.artists.length : 0), 0),
    events
  };

  const json = `${JSON.stringify(payload, null, 2)}\n`;
  fs.writeFileSync(latestJsonPath, json);
  fs.writeFileSync(datedJsonPath, json);
  writeArtistEventsCsv(events, latestCsvPath);
  writeArtistEventsCsv(events, datedCsvPath);

  const withLineup = events.filter((event) => event.artists.length > 0).length;
  console.log(JSON.stringify({
    eventCount: events.length,
    artistEventCount: payload.artistEventCount,
    countries: countryCodes.length,
    withLineup,
    latestJsonPath,
    latestCsvPath
  }, null, 2));
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
