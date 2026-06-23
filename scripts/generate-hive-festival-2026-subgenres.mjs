#!/usr/bin/env node
import fs from "node:fs";
import path from "node:path";

const ROOT = process.cwd();
const DATA_DIR = path.join(ROOT, "data");
const REPORT_DIR = path.join(ROOT, "reports");
const OFFICIAL_LINEUP_URL = "https://www.hive-festival.de/";
const BATCH = "hive_festival_2026_subgenres";
const PROFILE_OUT = path.join(DATA_DIR, "hive_festival_2026_artist_profiles.csv");
const RESEARCH_OUT = path.join(DATA_DIR, "hive_festival_2026_artist_subgenres.csv");
const REPORT_OUT = path.join(REPORT_DIR, "hive_festival_2026_subgenres_2026-06-21.md");
const MB_CACHE_OUT = path.join(REPORT_DIR, "hive_festival_2026_musicbrainz_cache.json");

const OFFICIAL_STAGE_RANGES = [
  { stage: "TECHNO CASTLE", first: "44 ALL STARS", last: "SOMEWHEN" },
  { stage: "GROOVE BEACH", first: "2HOT2PLAY", last: "TRANCEMASTER KRAUSE" },
  { stage: "RAGE CAGE", first: "ALLY", last: "VENDEX" },
  { stage: "JUNKYARD", first: "ALARICO", last: "ÜBERKIKZ" },
  { stage: "PSY LAGOON", first: "1200 MICS", last: "Z-CAT" },
  { stage: "DISCO FOREST", first: "ALLSTARS B2B2B2B2B", last: "ZEHLENDORFER DISCOSQUAD" },
  { stage: "BOUNCE TEMPLE", first: "3LEEZA B2B HANÀ", last: "ZWILLING. B2B ACHIM FEUERVOGEL FEAT. FRONS" },
  { stage: "LIBIDOH LAB", first: "AISHA", last: "SHABIYOU" },
  { stage: "SLEEPLESS", first: "AFEM SYKO", last: "WILLIAM LUCK" },
  { stage: "PIRATE BAY", first: "AKA NINA B2B BREGER", last: "VILLAR(PT)" }
];

const WARMUP_BOOKINGS = [
  "ROW1 F2F VAGABUND",
  "PARAÇEK F2F DJ DRECKISCH",
  "FUMI F2F ÜBERKIKZ",
  "WILDERÍCH B2B GIØ F2F DVAID B2B HUMAN ERROR",
  "ZWILLING. F2F PRADA2000",
  "ADRIÁN MILLS F2F PEGASSI",
  "CLOUDY F2F SERAFINA",
  "NOTMYTYPE F2F CHARLIE SPARKS",
  "NICOLAS JULIAN F2F NEGITIV",
  "A.N.I. F2F JOVYNN",
  "VIEZE ASBAK F2F NATTE VISSTICK",
  "TOXIC MACHINERY F2F SLVL & USH"
];

const STAGE_DEFAULTS = {
  "TECHNO CASTLE": {
    appStyle: "hard_techno",
    genre: "hard techno / industrial techno / schranz",
    confidence: "medium",
    note: "Official HIVE Techno Castle stage context."
  },
  "GROOVE BEACH": {
    appStyle: "hard_trance",
    genre: "neo-rave / hard trance / eurodance trance",
    confidence: "medium_low",
    note: "Official HIVE Groove Beach stage context; individual artist check recommended."
  },
  "RAGE CAGE": {
    appStyle: "hardcore",
    genre: "hard dance / hardcore / rawstyle",
    confidence: "medium",
    note: "Official HIVE Rage Cage stage context."
  },
  "JUNKYARD": {
    appStyle: "techno",
    genre: "techno / hardgroove techno / electro",
    confidence: "medium",
    note: "Official HIVE Junkyard stage context."
  },
  "PSY LAGOON": {
    appStyle: "psytrance",
    genre: "psytrance",
    confidence: "medium_high",
    note: "Official HIVE Psy Lagoon stage context."
  },
  "DISCO FOREST": {
    appStyle: "disco_house",
    genre: "disco house / house / electro",
    confidence: "medium_low",
    note: "Official HIVE Disco Forest stage context; individual artist check recommended."
  },
  "BOUNCE TEMPLE": {
    appStyle: "hard_trance",
    genre: "bounce / hard trance / eurodance rave",
    confidence: "medium_low",
    note: "Official HIVE Bounce Temple stage context; app has no dedicated bounce style."
  },
  "LIBIDOH LAB": {
    appStyle: "techno",
    genre: "queer techno / club rave / hard groove",
    confidence: "low",
    note: "Official HIVE Libidoh Lab stage context only."
  },
  "SLEEPLESS": {
    appStyle: "hard_techno",
    genre: "hard techno / acid techno / hard trance",
    confidence: "medium",
    note: "Official HIVE Sleepless stage context."
  },
  "PIRATE BAY": {
    appStyle: "acid_techno",
    genre: "free tekno / acidcore / psytek / tribe",
    confidence: "medium_low",
    note: "Official HIVE Pirate Bay stage context; app has no dedicated free-tekno style."
  },
  "WARM-UP PARTY": {
    appStyle: "hard_trance",
    genre: "hard trance / hard techno / bounce",
    confidence: "medium_low",
    note: "Warm-up screenshot context; individual artist check recommended."
  }
};

const ALIASES = {
  "1200 MICS": "1200 Micrograms",
  "1200 MICROGRAMS": "1200 Micrograms",
  AND: "AnD",
  ANIME: "AniMe",
  "D-STURB": "D-Sturb",
  "DR. PEACOCK": "Dr. Peacock",
  "DJ STINGRAY": "DJ Stingray",
  KINK: "KiNK",
  KLANGKUENSTLER: "Klangkuenstler",
  KØLAB: "KØ:LAB",
  "O.B.I.": "O.B.I.",
  "SPFDJ": "SPFDJ",
  "ØTTA": "ØTTA",
  "RUBIØ": "RUBIØ",
  "SANTØS": "SANTØS",
  "ÜBERKIKZ": "Überkikz",
  "VORTEK'S": "Vortek's",
  "VILLAR(PT)": "VILLAR",
  "VILLAR PT": "VILLAR",
  "WILDERÍCH": "WILDERÍCH",
  "ZWILLING.": "ZWILLING."
};

const ARTIST_OVERRIDE_DEFINITIONS = {
  "1200 Micrograms": o("full_on", "full-on psytrance / goa trance / psytrance", "high"),
  "Ace Ventura": o("progressive_psy", "progressive psytrance / psytrance", "high"),
  "Acid Asian": o("hard_trance", "hard trance / eurodance rave / bounce", "medium_high"),
  "Aiden": o("hard_techno", "hard techno / schranz", "medium_high"),
  "Alarico": o("hardgroove_techno", "hardgroove techno / techno", "high"),
  "Alba Franch": o("hard_trance", "hard trance / eurodance rave", "medium_high"),
  "Alignment": o("hard_techno", "hard techno / industrial techno / trance-influenced techno", "high"),
  "Amber Broos": o("techno", "techno / acid techno / Belgian club rave", "medium_high"),
  "Angerfist": o("gabber", "gabber / hardcore techno", "high"),
  "AniMe": o("hardcore", "hardcore / gabber", "high"),
  "Animato": o("progressive_psy", "progressive psytrance / psytrance", "high"),
  "AnD": o("industrial_techno", "industrial techno / hard techno", "high"),
  "Avalon": o("full_on", "full-on psytrance / psytrance", "high"),
  "Azyr": o("hard_techno", "hard techno / hard trance", "high"),
  "Bad Boombox": o("hard_trance", "hard trance / eurodance / rave", "medium_high"),
  "Ben Klock": o("techno", "Berlin techno / techno", "high"),
  "Blastoyz": o("psy_comercial", "festival psytrance / full-on / progressive psytrance", "high"),
  "Bliss": o("full_on", "full-on psytrance / psytrance", "high"),
  "Breger": o("dark_progressive", "dark progressive psytrance / psytech", "medium_high"),
  "Captain Hook": o("progressive_psy", "progressive psytrance / deep psytrance", "high"),
  "Captain Pastek": o("acid_techno", "free tekno / acidcore / tribe", "medium_high"),
  "Charlie Sparks": o("hard_techno", "hard techno / industrial techno", "high"),
  "Chlär": o("hardgroove_techno", "hardgroove techno / techno", "high"),
  "Clara Cuvé": o("techno", "techno / electro / hard techno", "medium_high"),
  "Cloudy": o("hard_techno", "hard techno / rave techno", "medium_high"),
  "D-Sturb": o("rawstyle", "rawstyle / hardstyle", "high"),
  "DJ Hyperdrive": o("hard_trance", "hard trance / eurotrance / rave", "medium_high"),
  "DJ Stingray": o("electro", "Detroit electro / electro / techno", "high"),
  "Dr. Donk": o("hardcore", "uptempo hardcore / hard dance", "medium_high"),
  "Dr. Peacock": o("frenchcore", "frenchcore / hardcore", "high"),
  "Drip Drop": o("progressive_psy", "progressive psytrance / psytrance", "medium_high"),
  "Dual Damage": o("rawstyle", "rawstyle / hardstyle", "high"),
  "DYEN": o("hard_techno", "hard techno / industrial techno", "high"),
  "Ellen Allien": o("techno", "techno / electro / acid techno", "high"),
  "Elli Acula": o("techno", "techno / electro / breakbeat", "medium_high"),
  "Electric Universe": o("full_on_morning", "full-on psytrance / goa trance", "high"),
  "Elotrance": o("hard_trance", "hard trance / trance / eurodance rave", "medium_high"),
  "Fantasm": o("hard_techno", "hard techno / industrial techno", "high"),
  "Fabio Fusco": o("progressive_psy", "progressive psytrance / festival psytrance", "high"),
  "FJAAK": o("techno", "techno / electro / breakbeat", "high"),
  "Freddy K": o("techno", "techno / Berlin techno", "high"),
  "Fungus Funk": o("full_on_night", "night full-on psytrance", "high"),
  "Funk Tribu": o("hard_trance", "trance / hard trance / eurodance rave", "medium_high"),
  "Future.666": o("hard_trance", "hard trance / rave techno", "medium_high"),
  "Ghost Rider": o("progressive_psy", "progressive psytrance / psytrance", "high"),
  "GMS": o("full_on", "full-on psytrance / psytrance", "high"),
  "Gonzi": o("psy_comercial", "festival psytrance / psytrance", "medium_high"),
  "Hatikwa": o("progressive_psy", "progressive psytrance / psytrance", "high"),
  "Henning Baer": o("techno", "techno / industrial techno", "high"),
  "Henrique Camacho": o("progressive_psy", "progressive psytrance / psytrance", "medium_high"),
  "Holy Priest": o("hard_techno", "hard techno / industrial techno", "high"),
  "Hypogeo": o("dark_progressive", "dark progressive psytrance / zenonesque", "high"),
  "I Hate Models": o("industrial_techno", "industrial techno / hard techno / rave techno", "high"),
  "IGDA": o("hard_techno", "hard techno / rave techno", "medium_high"),
  "In Verruf": o("hard_techno", "hard techno / industrial techno", "high"),
  "Jacidorex": o("acid_techno", "acid techno / neoacid / rave techno", "high"),
  "Kalte Liebe": o("ebm", "EBM / industrial techno / darkwave", "high"),
  "Karah": o("hardcore", "hardcore / hard techno", "medium_high"),
  "KiNK": o("acid_techno", "acid techno / house / techno", "high"),
  "Klangkuenstler": o("schranz", "schranz / hard techno", "high"),
  "Klofama": o("hard_techno", "hard techno / rave techno", "medium_high"),
  "Kobosil": o("industrial_techno", "industrial techno / hard techno", "high"),
  "Kruelty": o("rawstyle", "rawstyle / hardcore / hardstyle", "high"),
  "Krumelur": o("dark_progressive", "dark progressive psytrance / psytrance", "high"),
  "Laure Croft": o("techno", "techno / hard techno", "medium_high"),
  "Lee Ann Roberts": o("hard_techno", "hard techno / techno", "high"),
  "LEVT": o("hard_techno", "hard techno / rave techno", "medium_high"),
  "Lil Texas": o("hardcore", "hardcore / uptempo / hard dance", "high"),
  "Liquid Soul": o("progressive_psy", "progressive psytrance / psytrance", "high"),
  "LUCIID": o("hard_techno", "hard techno / acid techno", "medium_high"),
  "Luis M": o("dark_progressive", "dark progressive psytrance / progressive psytrance", "high"),
  "Mad Maxx": o("full_on", "full-on psytrance / psytrance", "high"),
  "MARRØN": o("hypnotic_techno", "hypnotic techno / techno", "high"),
  "Miss K8": o("gabber", "hardcore / gabber", "high"),
  "Mischluft": o("hard_trance", "trance / hard trance / rave", "medium_high"),
  "Nico Moreno": o("hard_techno", "hard techno / industrial techno", "high"),
  "Nicolas Julian": o("hard_trance", "hard trance / hard techno / rave", "medium_high"),
  "Nikolina": o("hard_techno", "hard techno / techno", "medium_high"),
  "NNAMAEL": o("techno", "techno / hardgroove techno", "medium_high"),
  "Noise Mafia": o("hard_trance", "bounce / hard trance / rave", "medium_high"),
  "Novah": o("hard_techno", "hard techno / rave techno", "medium_high"),
  "O.B.I.": o("schranz", "schranz / hard techno", "high"),
  "Obscure Shape": o("techno", "techno / hard techno", "high"),
  "OGUZ": o("hard_techno", "hard techno / rave techno", "high"),
  "Omiki": o("psy_comercial", "festival psytrance / psytrance", "high"),
  "OMAKS": o("hard_techno", "hard techno / industrial techno", "medium_high"),
  "Onlynumbers": o("hard_techno", "hard techno / industrial techno", "high"),
  "ØTTA": o("hard_techno", "hard techno / industrial techno", "medium_high"),
  "Panteros666": o("tech_trance", "tech trance / trance / rave", "medium_high"),
  "Paracek": o("hard_trance", "trance / hard trance / neo-rave", "medium_high"),
  "PARAÇEK": o("hard_trance", "trance / hard trance / neo-rave", "medium_high"),
  "Part Time Killer": o("hard_trance", "hard trance / rave", "medium_high"),
  "Paula Cazenave": o("techno", "techno / hard techno", "high"),
  "Pawlowski": o("tech_trance", "tech trance / techno / rave", "medium_high"),
  "Pegassi": o("tech_trance", "tech trance / trance / eurodance rave", "medium_high"),
  "Philippa Pacho": o("techno", "techno / hardgroove techno", "high"),
  "PRADA2000": o("hard_trance", "hard trance / eurodance rave", "medium_high"),
  "Quelza": o("hypnotic_techno", "hypnotic techno / techno", "high"),
  "Ranji": o("psy_comercial", "progressive psytrance / festival psytrance", "high"),
  "Raxeller": o("rawstyle", "rawstyle / hard dance", "medium_high"),
  "Restricted": o("hard_techno", "hard techno / rave techno", "medium_high"),
  "RITMOX": o("progressive_psy", "progressive psytrance / psytrance", "medium_high"),
  "Sajanka": o("psy_comercial", "festival psytrance / psytrance", "high"),
  "SANTØS": o("hard_techno", "hard techno / rave techno", "medium_high"),
  "Sara Landry": o("hard_techno", "hard techno / industrial techno", "high"),
  "Schrotthagen": o("hard_techno", "hard techno / industrial techno", "high"),
  "Serafina": o("hard_trance", "trance / hard trance / rave", "medium_high"),
  "SLVL": o("hard_techno", "hard techno / hard dance", "medium_high"),
  "Somewhen": o("techno", "techno / industrial techno", "high"),
  "Southstar": o("tech_trance", "trance / techno / eurodance rave", "high"),
  "SPFDJ": o("hard_techno", "hard techno / techno / electro", "high"),
  "Sub Zero Project": o("hardstyle", "hardstyle / rawstyle", "high"),
  "Suburbass": o("acid_techno", "free tekno / acidcore / hardtek", "high"),
  "Supergloss": o("techno", "techno / hardgroove techno", "medium_high"),
  "Svetec": o("schranz", "schranz / hard techno", "high"),
  "The Purge": o("rawstyle", "rawstyle / hardstyle", "high"),
  "Toxic Machinery": o("hard_techno", "hard techno / hard dance", "medium_high"),
  "Trancemaster Krause": o("tech_trance", "tech trance / hard trance / rave", "high"),
  "Triptykh": o("hard_techno", "hard techno / techno", "medium_high"),
  "Trümmer": o("hard_techno", "hard techno / live techno", "medium_high"),
  "UFO95": o("techno", "techno / live techno", "high"),
  "Unicorn On K": o("hardcore", "uptempo hardcore / hard dance", "medium_high"),
  "USH": o("hard_techno", "hard techno / hard dance", "medium_high"),
  "Vagabund": o("hard_trance", "bounce / hard trance / eurodance rave", "medium_high"),
  "Val Vashar": o("dark_progressive", "psytech / dark progressive / psychedelic techno", "medium_high"),
  "VENDEX": o("hard_techno", "hard techno / industrial techno", "medium_high"),
  "Vieze Asbak": o("hardcore", "uptempo hardcore / hard dance / hard techno", "medium_high"),
  "Vini Vici": o("psy_comercial", "festival psytrance / progressive psytrance", "high"),
  "Vortek's": o("hard_techno", "hardtek / hard techno / rave", "medium_high"),
  "Yanamaste": o("hypnotic_techno", "hypnotic techno / techno", "high"),
  "Z-Cat": o("full_on_night", "night full-on psytrance / dark psytrance", "high")
};

const STRONG_STAGE_STATUS = new Set(["TECHNO CASTLE", "RAGE CAGE", "JUNKYARD", "PSY LAGOON", "SLEEPLESS"]);
const SPECIFIC_TAGS = [
  "acid techno", "breakbeat", "darkpsy", "detroit techno", "disco", "electro", "frenchcore",
  "full-on", "gabber", "goa trance", "hard techno", "hard trance", "hardcore", "hardcore techno",
  "hardstyle", "industrial techno", "psychedelic trance", "psytrance", "rawstyle", "schranz",
  "tech trance", "techno", "trance"
];
const COUNTRY_NAMES = new Set([
  "Argentina", "Australia", "Austria", "Belgium", "Brazil", "Bulgaria", "Canada", "Chile",
  "Croatia", "Czech Republic", "Denmark", "France", "Germany", "Greece", "Hungary",
  "Israel", "Italy", "Japan", "Mexico", "Netherlands", "Poland", "Portugal", "Russia",
  "South Africa", "Spain", "Sweden", "Switzerland", "Ukraine", "United Kingdom",
  "United States", "United States of America"
]);

function o(appStyle, genre, confidence, extra = {}) {
  return { appStyle, genre, confidence, ...extra };
}

function normalize(value = "") {
  return String(value || "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/ø/g, "o")
    .replace(/æ/g, "ae")
    .replace(/œ/g, "oe")
    .replace(/&/g, " and ")
    .replace(/[^a-z0-9]+/g, " ")
    .trim()
    .replace(/\s+/g, " ");
}

const ARTIST_OVERRIDES = new Map(Object.entries(ARTIST_OVERRIDE_DEFINITIONS)
  .map(([artist, value]) => [normalize(artist), { ...value, artistName: artist }]));

function aliasFor(name) {
  const trimmed = String(name || "").trim();
  const key = trimmed.toUpperCase().replace(/\s+/g, " ");
  const compact = key.replace(/[^A-Z0-9ØÜÄÖÁÉÍÓÚÇÑ.]+/g, "");
  return ALIASES[key] || ALIASES[compact] || trimmed;
}

function cleanArtistName(value) {
  return aliasFor(String(value || "")
    .replace(/\s*\((?:LIVE|LIVE SET|BOUNCE SET)\)\s*$/i, "")
    .replace(/\s*\((?:PT)\)\s*$/i, "")
    .replace(/\s+/g, " ")
    .trim());
}

function splitBooking(booking) {
  const prepared = String(booking || "")
    .replace(/\s*\((?:LIVE|LIVE SET|BOUNCE SET)\)\s*/ig, " ")
    .replace(/\bB2B2B2B2B\b/ig, "B2B")
    .replace(/\bb2b\b/g, "B2B")
    .replace(/\s+B2B\s*$/i, "")
    .replace(/\s+/g, " ")
    .trim();

  return prepared
    .split(/\s+(?:B2B|F2F|VS\.?|FEAT\.?)\s+/i)
    .flatMap((part) => part.split(/\s+&\s+/))
    .map(cleanArtistName)
    .filter(Boolean);
}

function csvCell(value = "") {
  const stringValue = value === null || value === undefined ? "" : String(value);
  if (/[",\n\r]/.test(stringValue)) return `"${stringValue.replace(/"/g, '""')}"`;
  return stringValue;
}

function writeCsv(filePath, rows, headers) {
  fs.mkdirSync(path.dirname(filePath), { recursive: true });
  fs.writeFileSync(
    filePath,
    `${headers.map(csvCell).join(",")}\n${rows.map((row) => headers.map((field) => csvCell(row[field])).join(",")).join("\n")}\n`,
    "utf8"
  );
}

function parseCsv(text) {
  const rows = [];
  let row = [];
  let value = "";
  let inQuotes = false;
  for (let index = 0; index < text.length; index += 1) {
    const char = text[index];
    const next = text[index + 1];
    if (char === '"') {
      if (inQuotes && next === '"') {
        value += '"';
        index += 1;
      } else {
        inQuotes = !inQuotes;
      }
      continue;
    }
    if (!inQuotes && char === ",") {
      row.push(value);
      value = "";
      continue;
    }
    if (!inQuotes && (char === "\n" || char === "\r")) {
      if (char === "\r" && next === "\n") index += 1;
      row.push(value);
      if (row.some((cell) => cell.trim())) rows.push(row);
      row = [];
      value = "";
      continue;
    }
    value += char;
  }
  row.push(value);
  if (row.some((cell) => cell.trim())) rows.push(row);
  if (rows.length < 2) return [];
  const headers = rows[0].map((header) => normalize(header).replace(/\s+/g, "_"));
  return rows.slice(1).map((cells) => Object.fromEntries(headers.map((header, index) => [header, (cells[index] || "").trim()])));
}

async function fetchOfficialHtml() {
  const response = await fetch(OFFICIAL_LINEUP_URL, {
    headers: { "User-Agent": "SonicSearchResearch/1.0" }
  });
  if (!response.ok) throw new Error(`HIVE official lineup fetch failed: ${response.status}`);
  return response.text();
}

function extractOfficialBookings(html) {
  const items = [];
  const pattern = /<h([125])[^>]*class="[^"]*wixui-rich-text__text[^"]*"[^>]*>(.*?)<\/h\1>/gis;
  let match;
  while ((match = pattern.exec(html))) {
    const text = match[2]
      .replace(/<[^>]+>/g, "")
      .replace(/&amp;/g, "&")
      .replace(/&#x27;/g, "'")
      .replace(/&#39;/g, "'")
      .replace(/&quot;/g, '"')
      .trim();
    if (match[1] === "5" && text) items.push(text);
  }

  const bookings = [];
  OFFICIAL_STAGE_RANGES.forEach(({ stage, first, last }) => {
    const start = items.indexOf(first);
    const end = items.indexOf(last);
    if (start < 0 || end < start) throw new Error(`Could not locate official stage range: ${stage}`);
    items.slice(start, end + 1).forEach((booking) => {
      bookings.push({ stage, booking, source: "official_hive_lineup", sourceUrl: OFFICIAL_LINEUP_URL });
    });
  });
  return bookings;
}

function collectExistingProfiles() {
  const profiles = new Map();
  if (!fs.existsSync(DATA_DIR)) return profiles;
  for (const file of fs.readdirSync(DATA_DIR)) {
    if (!file.endsWith(".csv")) continue;
    if (file.startsWith("hive_festival_2026_")) continue;
    const rows = parseCsv(fs.readFileSync(path.join(DATA_DIR, file), "utf8"));
    for (const row of rows) {
      const artist = row.artist || row.name || row.artist_name;
      const style = row.style || row.subgenre || row.genre;
      if (!artist || !style) continue;
      const key = normalize(artist);
      if (!key || profiles.has(key)) continue;
      profiles.set(key, {
        style,
        artistGenre: row.artist_genre || row.artist_style || row.genre || style,
        country: row.country || "",
        city: row.city || "",
        source: file,
        sourceUrl: row.source_url || row.source_anchor_url || ""
      });
    }
  }
  return profiles;
}

function mergeBookings(bookings) {
  const artists = new Map();
  bookings.forEach((entry) => {
    splitBooking(entry.booking).forEach((artistName) => {
      const artist = aliasFor(artistName);
      const key = normalize(artist);
      if (!key) return;
      if (!artists.has(key)) {
        artists.set(key, {
          artist,
          officialNames: new Set(),
          stages: new Set(),
          bookings: new Set(),
          sources: new Set(),
          sourceUrls: new Set()
        });
      }
      const item = artists.get(key);
      item.officialNames.add(artistName);
      item.stages.add(entry.stage);
      item.bookings.add(entry.booking);
      item.sources.add(entry.source);
      if (entry.sourceUrl) item.sourceUrls.add(entry.sourceUrl);
    });
  });
  return [...artists.values()];
}

function loadMbCache() {
  if (!fs.existsSync(MB_CACHE_OUT)) return {};
  try {
    return JSON.parse(fs.readFileSync(MB_CACHE_OUT, "utf8"));
  } catch (_error) {
    return {};
  }
}

async function refreshMusicBrainzCache(artists, cache) {
  fs.mkdirSync(REPORT_DIR, { recursive: true });
  for (const item of artists) {
    const key = normalize(item.artist);
    if (cache[key]) continue;
    const query = encodeURIComponent(`artist:"${item.artist}"`);
    const url = `https://musicbrainz.org/ws/2/artist?query=${query}&fmt=json&limit=3&inc=tags`;
    try {
      const response = await fetch(url, {
        headers: {
          "User-Agent": "SonicSearchResearch/1.0 (local catalog enrichment)"
        }
      });
      if (!response.ok) throw new Error(String(response.status));
      const data = await response.json();
      const candidates = Array.isArray(data.artists) ? data.artists : [];
      const exact = candidates.find((artist) => normalize(artist.name) === key);
      const selected = exact || candidates.find((artist) => Number(artist.score || 0) >= 95);
      cache[key] = selected ? {
        id: selected.id,
        name: selected.name,
        score: selected.score,
        country: selected.country || selected.area?.name || "",
        city: selected["begin-area"]?.name || "",
        disambiguation: selected.disambiguation || "",
        tags: (selected.tags || []).map((tag) => tag.name).filter(Boolean),
        url: selected.id ? `https://musicbrainz.org/artist/${selected.id}` : ""
      } : { miss: true };
    } catch (error) {
      cache[key] = { error: String(error?.message || error) };
    }
    fs.writeFileSync(MB_CACHE_OUT, `${JSON.stringify(cache, null, 2)}\n`, "utf8");
    console.log(`MusicBrainz checked: ${item.artist}`);
    await new Promise((resolve) => setTimeout(resolve, 1100));
  }
  return cache;
}

function mbSpecificTags(mb) {
  if (!mb || mb.miss || mb.error) return [];
  const values = [...(mb.tags || []), mb.disambiguation || ""]
    .join(" | ")
    .toLowerCase();
  return SPECIFIC_TAGS.filter((tag) => values.includes(tag));
}

function classifyFromMb(mb, fallbackStyle) {
  const text = [...(mb?.tags || []), mb?.disambiguation || ""].join(" | ").toLowerCase();
  if (!text.trim()) return null;
  const has = (...terms) => terms.some((term) => text.includes(term));
  if (has("frenchcore")) return o("frenchcore", "frenchcore / hardcore", "high");
  if (has("speedcore")) return o("speedcore", "speedcore / hardcore", "high");
  if (has("rawstyle")) return o("rawstyle", "rawstyle / hardstyle", "high");
  if (has("hardstyle")) return o("hardstyle", "hardstyle / hard dance", "high");
  if (has("gabber")) return o("gabber", "gabber / hardcore techno", "high");
  if (has("hardcore techno")) return o("gabber", "hardcore techno / gabber", "high");
  if (has("hardcore")) return o("hardcore", "hardcore / hard dance", "medium_high");
  if (has("schranz")) return o("schranz", "schranz / hard techno", "high");
  if (has("industrial techno")) return o("industrial_techno", "industrial techno / hard techno", "high");
  if (has("hard techno")) return o("hard_techno", "hard techno", "high");
  if (has("acid techno")) return o("acid_techno", "acid techno", "high");
  if (has("detroit techno")) return o("detroit_techno", "Detroit techno / techno", "high");
  if (has("progressive psytrance")) return o("progressive_psy", "progressive psytrance / psytrance", "high");
  if (has("full-on", "full on")) return o("full_on", "full-on psytrance / psytrance", "high");
  if (has("goa trance")) return o("goa_trance", "goa trance / psytrance", "high");
  if (has("psychedelic trance", "psytrance")) return o("psytrance", "psytrance", "high");
  if (has("hard trance")) return o("hard_trance", "hard trance / trance", "high");
  if (has("tech trance")) return o("tech_trance", "tech trance / trance", "high");
  if (has("breakbeat")) return o("breakbeat", "breakbeat / rave", "medium_high");
  return null;
}

function compatibleTags(style, tags) {
  const textTags = tags.map((tag) => String(tag || "").toLowerCase());
  const termsByStyle = {
    acid_techno: ["acid techno", "free tekno", "tekno", "hardtek"],
    dark_progressive: ["dark progressive", "psytech", "psytrance", "trance"],
    disco_house: ["disco", "house", "nu-disco"],
    electro: ["electro", "detroit techno"],
    frenchcore: ["frenchcore", "hardcore"],
    full_on: ["full-on", "full on", "psytrance", "psychedelic trance"],
    full_on_morning: ["full-on", "full on", "goa trance", "psytrance", "psychedelic trance"],
    full_on_night: ["full-on", "full on", "darkpsy", "psytrance", "psychedelic trance"],
    gabber: ["gabber", "hardcore techno", "hardcore"],
    hard_techno: ["hard techno", "industrial techno", "schranz", "acid techno"],
    hard_trance: ["hard trance", "tech trance", "trance"],
    hardcore: ["hardcore", "gabber", "uptempo"],
    hardgroove_techno: ["hardgroove", "techno"],
    hardstyle: ["hardstyle", "rawstyle"],
    hypnotic_techno: ["hypnotic techno", "techno"],
    industrial_techno: ["industrial techno", "hard techno"],
    progressive_psy: ["progressive psytrance", "psytrance", "psychedelic trance"],
    psy_comercial: ["psytrance", "psychedelic trance", "trance"],
    psytrance: ["psytrance", "psychedelic trance"],
    rawstyle: ["rawstyle", "hardstyle"],
    schranz: ["schranz", "hard techno"],
    tech_trance: ["tech trance", "hard trance", "trance"],
    techno: ["techno", "electro"]
  };
  const terms = termsByStyle[style] || [style.replace(/_/g, " ")];
  return textTags.filter((tag) => terms.some((term) => tag.includes(term)));
}

function bestStageDefault(item) {
  const stages = [...item.stages];
  const strong = stages.find((stage) => STRONG_STAGE_STATUS.has(stage));
  return STAGE_DEFAULTS[strong || stages[0]] || STAGE_DEFAULTS["TECHNO CASTLE"];
}

function statusFor(confidence, item) {
  if (confidence === "high" || confidence === "medium_high") return "published";
  if (confidence === "medium" && [...item.stages].some((stage) => STRONG_STAGE_STATUS.has(stage))) return "published";
  return "needs_review";
}

function discoveryLinks(artist) {
  const encoded = encodeURIComponent(artist);
  return [
    `https://musicbrainz.org/search?query=${encoded}&type=artist&method=indexed`,
    `https://www.beatport.com/search?q=${encoded}`,
    `https://www.discogs.com/search/?q=${encoded}&type=all`,
    `https://soundcloud.com/search?q=${encoded}`,
    `https://www.youtube.com/results?search_query=${encoded}`
  ].join(";");
}

function cleanMbCountry(value = "") {
  const text = String(value || "").trim();
  if (/^[A-Z]{2}$/.test(text)) return text;
  return COUNTRY_NAMES.has(text) ? text : "";
}

function cleanMbCity(city = "", country = "") {
  const text = String(city || "").trim();
  if (!text || !country) return "";
  if (text.toLowerCase() === String(country || "").toLowerCase()) return "";
  if (/^[A-Z]{2}$/.test(text)) return "";
  if (COUNTRY_NAMES.has(text)) return "";
  return text;
}

function buildRows(artists, existingProfiles, mbCache) {
  return artists.map((item) => {
    const key = normalize(item.artist);
    const stageDefault = bestStageDefault(item);
    const existing = existingProfiles.get(key);
    const mb = mbCache[key];
    const override = ARTIST_OVERRIDES.get(key) || ARTIST_OVERRIDES.get(normalize(aliasFor(item.artist)));
    const mbClass = classifyFromMb(mb, stageDefault.appStyle);
    const classification = override || mbClass || (existing ? o(existing.style, existing.artistGenre, "medium_high") : stageDefault);
    const rawTags = mbSpecificTags(mb);
    const tags = compatibleTags(classification.appStyle, rawTags);
    const confidence = classification.confidence || stageDefault.confidence;
    const sourceBasis = override
      ? "curated_known_artist_or_scene_source"
      : mbClass
        ? "musicbrainz_artist_tags"
        : existing
          ? `local_catalog:${existing.source}`
          : "official_hive_stage_context";
    const useMbEvidence = Boolean(mb?.url && tags.length);
    const sourceUrls = new Set([...item.sourceUrls]);
    if (useMbEvidence) sourceUrls.add(mb.url);
    if (existing?.sourceUrl) sourceUrls.add(existing.sourceUrl);
    const stages = [...item.stages].sort().join("; ");
    const bookings = [...item.bookings].sort().join("; ");
    const status = statusFor(confidence, item);
    const mbCountry = useMbEvidence ? cleanMbCountry(mb?.country) : "";
    const mbCity = useMbEvidence ? cleanMbCity(mb?.city, mbCountry) : "";
    const sourceNote = [
      `${sourceBasis}; stages: ${stages}.`,
      tags.length ? `MusicBrainz tags/disambiguation matched: ${tags.join(", ")}.` : "",
      classification.note || stageDefault.note || ""
    ].filter(Boolean).join(" ");

    const displayArtist = override?.artistName || item.artist;
    return {
      style: classification.appStyle,
      artist: displayArtist,
      country: classification.country || existing?.country || mbCountry || "",
      city: classification.city || existing?.city || mbCity || "",
      artist_bio: `${displayArtist} appears on the HIVE Festival 2026 lineup (${stages}) and is cataloged here as ${classification.genre}. Confidence: ${confidence}.`,
      artist_genre: classification.genre,
      artist_profile_hint: `Use ${displayArtist} for ${classification.genre} discovery. HIVE 2026 booking(s): ${bookings}.`,
      source: BATCH,
      source_url: [...sourceUrls][0] || OFFICIAL_LINEUP_URL,
      status,
      confidence,
      scene_role: "hive_festival_2026_lineup_artist",
      source_note: sourceNote,
      social_discovery_links: discoveryLinks(displayArtist),
      label_links: [...sourceUrls].join(";"),
      stage: stages,
      booking: bookings,
      canonical_subgenres: classification.genre,
      evidence_tags: tags.join("; "),
      source_urls: [...sourceUrls].join(";"),
      official_names: [...item.officialNames].sort().join("; ")
    };
  }).sort((a, b) => a.artist.localeCompare(b.artist));
}

function report(rows, officialBookings) {
  const byStatus = rows.reduce((acc, row) => {
    acc[row.status] = (acc[row.status] || 0) + 1;
    return acc;
  }, {});
  const byConfidence = rows.reduce((acc, row) => {
    acc[row.confidence] = (acc[row.confidence] || 0) + 1;
    return acc;
  }, {});
  const byStyle = rows.reduce((acc, row) => {
    acc[row.style] = (acc[row.style] || 0) + 1;
    return acc;
  }, {});
  const needsReview = rows.filter((row) => row.status === "needs_review").slice(0, 80);
  return `# HIVE Festival 2026 artist subgenre research

Generated: 2026-06-21

## Scope

- Official HIVE lineup bookings parsed: ${officialBookings.length}
- Unique artists after splitting B2B/F2F/feat./ampersand bookings: ${rows.length}
- Added warm-up screenshot bookings: ${WARMUP_BOOKINGS.length}

## Outputs

- \`data/hive_festival_2026_artist_profiles.csv\`: import-compatible artist profile CSV.
- \`data/hive_festival_2026_artist_subgenres.csv\`: audit CSV with stage, booking, confidence, evidence tags and source URLs.
- \`reports/hive_festival_2026_musicbrainz_cache.json\`: MusicBrainz tag/disambiguation cache when refreshed.

## Method

1. Parsed artist bookings from the official HIVE Festival site.
2. Added the warm-up party artists visible in the provided screenshot.
3. Split B2B, F2F, feat., vs. and explicit ampersand collaborations into individual artist rows.
4. Reused existing local catalog profiles when available.
5. Used curated overrides for well-known scene artists and MusicBrainz tags/disambiguation where available.
6. Fell back to the official HIVE stage family only when no stronger artist-level evidence was found; these rows are marked lower confidence or \`needs_review\`.

## Status

${Object.entries(byStatus).sort().map(([key, value]) => `- ${key}: ${value}`).join("\n")}

## Confidence

${Object.entries(byConfidence).sort().map(([key, value]) => `- ${key}: ${value}`).join("\n")}

## Styles

${Object.entries(byStyle).sort((a, b) => b[1] - a[1]).map(([key, value]) => `- ${key}: ${value}`).join("\n")}

## Needs Review Sample

${needsReview.map((row) => `- ${row.artist}: ${row.canonical_subgenres} (${row.stage})`).join("\n")}

## Sources

- Official HIVE Festival lineup: ${OFFICIAL_LINEUP_URL}
- MusicBrainz artist API/search cache for public tags and disambiguation.
- User-provided warm-up screenshot paths from the current Codex thread.
`;
}

async function main() {
  const refreshMb = process.argv.includes("--refresh-musicbrainz");
  const officialHtml = await fetchOfficialHtml();
  const officialBookings = extractOfficialBookings(officialHtml);
  const allBookings = [
    ...officialBookings,
    ...WARMUP_BOOKINGS.map((booking) => ({
      stage: "WARM-UP PARTY",
      booking,
      source: "user_warmup_screenshot",
      sourceUrl: ""
    }))
  ];
  const artists = mergeBookings(allBookings);
  const existingProfiles = collectExistingProfiles();
  const mbCache = loadMbCache();
  const finalMbCache = refreshMb ? await refreshMusicBrainzCache(artists, mbCache) : mbCache;
  const rows = buildRows(artists, existingProfiles, finalMbCache);

  const profileHeaders = [
    "style", "artist", "country", "city", "artist_bio", "artist_genre", "artist_profile_hint",
    "source", "source_url", "status", "confidence", "scene_role", "source_note",
    "social_discovery_links", "label_links"
  ];
  const researchHeaders = [
    "artist", "style", "canonical_subgenres", "confidence", "status", "country", "city",
    "stage", "booking", "official_names", "evidence_tags", "source_note", "source_urls",
    "social_discovery_links"
  ];

  writeCsv(PROFILE_OUT, rows, profileHeaders);
  writeCsv(RESEARCH_OUT, rows, researchHeaders);
  fs.mkdirSync(REPORT_DIR, { recursive: true });
  fs.writeFileSync(REPORT_OUT, report(rows, officialBookings), "utf8");

  console.log(`Generated ${path.relative(ROOT, PROFILE_OUT)}`);
  console.log(`Generated ${path.relative(ROOT, RESEARCH_OUT)}`);
  console.log(`Generated ${path.relative(ROOT, REPORT_OUT)}`);
  console.log(`${rows.length} artists, ${officialBookings.length} official bookings, ${WARMUP_BOOKINGS.length} warm-up bookings.`);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
