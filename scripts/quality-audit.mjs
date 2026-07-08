#!/usr/bin/env node
import fs from "node:fs";
import path from "node:path";
import vm from "node:vm";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const rootDir = path.resolve(__dirname, "..");
const appPath = path.join(rootDir, "app.js");
const reportsDir = path.join(rootDir, "reports");
const reportPath = path.join(reportsDir, "quality-audit-latest.md");
const metricsPath = path.join(reportsDir, "catalog-metrics-latest.json");
const issuesPath = path.join(reportsDir, "quality-audit-issues-latest.json");
const roadmapPath = path.join(reportsDir, "catalog-enrichment-roadmap-latest.md");
const roadmapJsonPath = path.join(reportsDir, "catalog-enrichment-roadmap-latest.json");
const strictMode = process.argv.includes("--strict");

const BLOCKS = [
  "EXTERNAL_DATASET_PRIORITY_FILES",
  "EXTERNAL_DATASET_FILES",
  "STYLE_SEARCH_TERMS",
  "SOUNDCLOUD_SUPPLEMENTAL_DJ_SEEDS",
  "LOCAL_TRACK_SEED_BOOST",
  "CURATED_BANDCAMP_TRACK_EXPANSION",
  "CURATED_TECHNO_SUBGENRE_EXPANSION",
  "catalog",
  "discoveryCatalog",
  "INDEXED_DATASET_ARTIST_COUNT",
  "MIN_SEARCHABLE_TRACKS_PER_INDEXED_ARTIST",
  "STYLE_COVERAGE_OVERRIDES",
  "STYLE_BPM_RULES",
  "ARTIST_CANONICAL_ORIGINS",
  "COUNTRY_CODE_BY_NAME",
  "COUNTRY_BY_ORIGIN_AREA"
];

const GENERIC_SOURCE_PATTERNS = [
  /catalogo dinamico/i,
  /cat[aá]logo din[aâ]mico/i,
  /dynamic catalog/i,
  /global electronik/i,
  /various artists/i,
  /unknown artist/i,
  /sem artista/i
];

const REQUIRED_MINIMUMS = {
  tracks: 20,
  artists: 50,
  labels: 6
};

const LINK_FIELDS = [
  "spotifyUrl",
  "spotifyTrackUrl",
  "youtubeUrl",
  "youtubeTrackUrl",
  "soundcloudUrl",
  "soundcloudTrackUrl",
  "bandcampUrl",
  "bandcampTrackUrl",
  "beatportUrl"
];

const DATASET_STYLE_FIELDS = ["style", "subgenre", "sub_genre", "genre", "primary_genre", "main_style"];
const DATASET_ARTIST_FIELDS = ["artist", "artist_name", "name", "project", "dj", "act"];
const DATASET_SONG_FIELDS = ["song", "track", "track_name", "title", "faixa", "music"];
const DATASET_COUNTRY_FIELDS = ["country", "origin_country", "artist_country", "pais", "nacionalidade"];
const DATASET_AREA_FIELDS = ["city", "origin_city", "state", "region", "area", "cidade"];
const DATASET_BIO_FIELDS = ["artist_bio", "bio", "description", "about", "resumo"];
const DATASET_LABEL_FIELDS = ["label", "record_label", "release_label", "album", "imprint"];
const DATASET_BPM_FIELDS = ["bpm_exact", "bpm", "tempo", "tempo_bpm", "track_bpm", "tempo_profile", "bpm_guide"];
const DATASET_PREVIEW_FIELDS = ["preview_url", "preview", "audio_preview", "deezer_preview_url"];
const DATASET_LINK_FIELDS = [
  "spotify_url",
  "spotify_track_url",
  "youtube_url",
  "youtube_track_url",
  "soundcloud_url",
  "soundcloud_track_url",
  "bandcamp_url",
  "bandcamp_track_url",
  "beatport_url"
];

function readAppSource() {
  if (!fs.existsSync(appPath)) {
    throw new Error(`app.js nao encontrado em ${appPath}`);
  }
  return fs.readFileSync(appPath, "utf8");
}

function normalize(value) {
  return String(value || "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/&/g, " and ")
    .replace(/[^a-z0-9]+/g, " ")
    .trim()
    .replace(/\s+/g, " ");
}

function findLiteralStart(source, name) {
  const declarationIndex = source.indexOf(`const ${name} =`);
  if (declarationIndex < 0) {
    throw new Error(`Bloco ${name} nao encontrado`);
  }

  const afterEquals = source.indexOf("=", declarationIndex);
  const firstValueMatch = source.slice(afterEquals + 1).match(/\S/);
  if (!firstValueMatch) {
    throw new Error(`Bloco ${name} nao tem valor`);
  }
  const start = afterEquals + 1 + firstValueMatch.index;
  if (source[start] !== "{" && source[start] !== "[") {
    throw new Error(`Bloco ${name} nao e literal composto`);
  }
  return start;
}

function extractConstLiteral(source, name) {
  const start = findLiteralStart(source, name);
  const opener = source[start];
  const closer = opener === "{" ? "}" : "]";
  let depth = 0;
  let quote = "";
  let escaped = false;
  let lineComment = false;
  let blockComment = false;

  for (let index = start; index < source.length; index += 1) {
    const char = source[index];
    const next = source[index + 1];

    if (lineComment) {
      if (char === "\n") lineComment = false;
      continue;
    }
    if (blockComment) {
      if (char === "*" && next === "/") {
        blockComment = false;
        index += 1;
      }
      continue;
    }
    if (quote) {
      if (escaped) {
        escaped = false;
      } else if (char === "\\") {
        escaped = true;
      } else if (char === quote) {
        quote = "";
      }
      continue;
    }
    if (char === "/" && next === "/") {
      lineComment = true;
      index += 1;
      continue;
    }
    if (char === "/" && next === "*") {
      blockComment = true;
      index += 1;
      continue;
    }
    if (char === "\"" || char === "'" || char === "`") {
      quote = char;
      continue;
    }
    if (char === opener) depth += 1;
    if (char === closer) depth -= 1;
    if (depth === 0) {
      return source.slice(start, index + 1);
    }
  }

  throw new Error(`Nao consegui fechar o bloco ${name}`);
}

function evalLiteral(literal, name, context = {}) {
  try {
    return vm.runInNewContext(`(${literal})`, Object.freeze({
      encodeURIComponent,
      ...context
    }), {
      timeout: 1000,
      displayErrors: true
    });
  } catch (error) {
    throw new Error(`Falha ao avaliar ${name}: ${error.message}`);
  }
}

function extractScalarConstLiteral(source, name) {
  const declarationRegex = new RegExp(`const\\s+${name}\\s*=\\s*([^;]+);`);
  const match = source.match(declarationRegex);
  if (!match) {
    throw new Error(`Constante ${name} nao encontrada`);
  }
  return match[1].trim();
}

function loadBlocks(source) {
  const blocks = {};
  for (const name of BLOCKS) {
    let literal = "";
    try {
      literal = extractConstLiteral(source, name);
    } catch (_error) {
      literal = extractScalarConstLiteral(source, name);
    }
    blocks[name] = evalLiteral(literal, name, blocks);
  }
  return blocks;
}

function trackId(track) {
  return `${normalize(track.artist)}::${normalize(track.song || track.title)}`;
}

function artistId(track) {
  return normalize(track.artist);
}

function labelId(track) {
  return normalize(track.label || track.recordLabel || track.album?.label);
}

function sourceName(track) {
  return track.sourceName || track.source || track.origin || "catalogo local";
}

function numericFieldValue(value) {
  const text = String(value ?? "").trim();
  if (!text) return null;
  const numberValue = Number(text);
  return Number.isFinite(numberValue) ? numberValue : null;
}

function getTrackBpmInfo(track) {
  const bpmExactValue = numericFieldValue(track.bpmExact);
  if (bpmExactValue !== null) {
    const value = bpmExactValue;
    return { min: value, max: value, label: String(value), exact: true };
  }
  const bpmValue = numericFieldValue(track.bpm);
  if (bpmValue !== null) {
    const value = bpmValue;
    return { min: value, max: value, label: String(value), exact: true };
  }
  const tempoValue = numericFieldValue(track.tempo);
  if (tempoValue !== null) {
    const value = tempoValue;
    return { min: value, max: value, label: String(value), exact: true };
  }

  const text = String(track.bpm || track.bpmText || track.tempo || "");
  const range = text.match(/(\d{2,3})\s*[-–]\s*(\d{2,3})/);
  if (range) {
    return {
      min: Number(range[1]),
      max: Number(range[2]),
      label: `${range[1]}-${range[2]}`,
      exact: false
    };
  }

  const plus = text.match(/(\d{2,3})\s*\+/);
  if (plus) {
    return { min: Number(plus[1]), max: Infinity, label: `${plus[1]}+`, exact: false };
  }

  const single = text.match(/(\d{2,3})/);
  if (single) {
    const value = Number(single[1]);
    return { min: value, max: value, label: String(value), exact: true };
  }

  return null;
}

function bpmFitsStyle(style, bpmInfo, rules) {
  const rule = rules[style];
  if (!rule || !bpmInfo || !Number.isFinite(bpmInfo.min)) return null;
  return bpmInfo.max >= rule.min && bpmInfo.min <= rule.max;
}

function targetForStyle(style, overrides) {
  const artistTarget = overrides[style]?.artists ?? REQUIRED_MINIMUMS.artists;
  return {
    tracks: overrides[style]?.tracks ?? REQUIRED_MINIMUMS.tracks,
    artists: Math.max(REQUIRED_MINIMUMS.artists, artistTarget),
    labels: overrides[style]?.labels ?? REQUIRED_MINIMUMS.labels
  };
}

function hasAnyLink(track) {
  return LINK_FIELDS.some((field) => Boolean(track[field]));
}

function ensureAuditDiscoveryLinks(record = {}) {
  if (!record || typeof record !== "object") return record;
  const artist = String(record.artist || record.name || "").trim();
  const song = String(record.song || record.title || "").trim();
  if (!artist) return record;

  const query = encodeURIComponent([artist, song].filter(Boolean).join(" "));
  if (!hasAnyLink(record)) {
    record.spotifyUrl = `https://open.spotify.com/search/${query}`;
    record.youtubeUrl = `https://www.youtube.com/results?search_query=${query}`;
    if (song) record.beatportUrl = `https://www.beatport.com/search?q=${query}`;
  }
  if (!record.artistBio && !record.artistProfileHint) {
    const styleText = String(record.style || "musica eletronica").replace(/_/g, " ");
    record.artistProfileHint = song
      ? `${artist} foi mantido no banco proprio como referencia de ${styleText}; "${song}" funciona como porta de entrada editorial para descoberta.`
      : `${artist} foi mantido no banco proprio como referencia de ${styleText} para ampliar descoberta com curadoria local.`;
  }
  return record;
}

function isSearchLikeUrl(value = "") {
  const raw = String(value || "").trim();
  if (!raw) return false;
  try {
    const parsed = new URL(raw);
    const path = String(parsed.pathname || "").toLowerCase();
    const search = String(parsed.search || "").toLowerCase();
    return path.includes("/search") || search.includes("search_query=") || search.includes("q=");
  } catch (_err) {
    return /\/search|search_query=|\bq=/.test(raw.toLowerCase());
  }
}

function isDirectYouTubeUrl(value = "") {
  const raw = String(value || "").trim();
  if (!raw || isSearchLikeUrl(raw)) return false;
  try {
    const parsed = new URL(raw);
    const host = parsed.hostname.replace(/^www\./, "").toLowerCase();
    if (!/(^|\.)youtube\.com$|youtu\.be$/.test(host)) return false;
    const path = String(parsed.pathname || "");
    return Boolean(parsed.searchParams.get("v") || host === "youtu.be" || /\/(embed|shorts|live)\//.test(path));
  } catch (_err) {
    return false;
  }
}

function isDirectSoundCloudTrackUrl(value = "") {
  const raw = String(value || "").trim();
  if (!raw || isSearchLikeUrl(raw)) return false;
  try {
    const parsed = new URL(raw);
    const host = parsed.hostname.replace(/^www\./, "").toLowerCase();
    if (!host.endsWith("soundcloud.com")) return false;
    const parts = parsed.pathname.split("/").map((part) => part.trim()).filter(Boolean);
    if (parts.length < 2) return false;
    return !["search", "discover", "sets", "stream", "charts"].includes(parts[0]) && parts[1] !== "sets";
  } catch (_err) {
    return false;
  }
}

function playableSourceSet(track) {
  const sources = new Set();
  if (track?.previewUrl || track?.preview || track?.audioPreview) sources.add("audio");
  if (isDirectYouTubeUrl(track?.youtubeTrackUrl) || isDirectYouTubeUrl(track?.youtubeUrl)) sources.add("youtube");
  if (isDirectSoundCloudTrackUrl(track?.soundcloudTrackUrl) || isDirectSoundCloudTrackUrl(track?.soundcloudUrl)) sources.add("soundcloud");
  if (track?.bandcampTrackId || track?.bandcampTrackUrl || track?.bandcampUrl) sources.add("bandcamp");
  return sources;
}

function hasReliablePlayablePath(track) {
  return playableSourceSet(track).size > 0;
}

function hasAnyPlayablePath(track) {
  return Boolean(
    track?.previewUrl ||
    track?.preview ||
    track?.audioPreview ||
    track?.youtubeTrackUrl ||
    track?.youtubeUrl ||
    track?.soundcloudTrackUrl ||
    track?.bandcampTrackUrl ||
    hasAnyLink(track)
  );
}

function looksGeneric(value) {
  return GENERIC_SOURCE_PATTERNS.some((pattern) => pattern.test(String(value || "")));
}

function artistOriginLookupKeys(artistName = "") {
  const raw = String(artistName || "").replace(/\([^)]*\)/g, " ").replace(/\s+/g, " ").trim();
  const direct = normalize(raw);
  if (!direct) return [];
  const keys = [direct];
  [
    /\s+(?:feat\.?|ft\.?|featuring)\s+/i,
    /\s+(?:&|x|vs\.?|versus)\s+/i,
    /\s*\+\s*/i,
    /\s*,\s*/i
  ].forEach((splitter) => {
    const primary = raw.split(splitter)[0]?.trim();
    const key = normalize(primary);
    if (key && !keys.includes(key)) keys.push(key);
  });
  return keys;
}

function findCountryForArtist(track, canonicalOrigins, countryByArea) {
  const canonicalByNormalizedKey = new Map(
    Object.entries(canonicalOrigins || {}).map(([key, value]) => [normalize(key), value])
  );
  const canonical =
    artistOriginLookupKeys(track.artist)
      .map((key) => canonicalOrigins[key] || canonicalByNormalizedKey.get(key))
      .find(Boolean) ||
    canonicalOrigins[track.artist] ||
    null;
  const direct =
    canonical?.country ||
    track.artistCountry ||
    track.country ||
    track.originCountry ||
    track.nationality ||
    null;
  if (direct) return direct;

  const area = canonical?.area || track.artistArea || track.area || track.origin || null;
  if (!area) return "";
  const normalizedArea = normalize(area);
  return countryByArea[area] || countryByArea[normalizedArea] || "";
}

function flagForCountry(country, countryCodes) {
  const raw = String(country || "").trim();
  if (!raw) return "";
  const code = raw.length === 2 ? raw.toUpperCase() : countryCodes[raw] || countryCodes[normalize(raw)] || "";
  if (!/^[A-Z]{2}$/.test(code)) return "";
  return code
    .split("")
    .map((letter) => String.fromCodePoint(127397 + letter.charCodeAt(0)))
    .join("");
}

function addIssue(issues, severity, scope, message, detail = "") {
  issues.push({ severity, scope, message, detail });
}

function groupBy(items, callback) {
  const groups = new Map();
  for (const item of items) {
    const key = callback(item);
    if (!groups.has(key)) groups.set(key, []);
    groups.get(key).push(item);
  }
  return groups;
}

function parseDelimitedRows(text, delimiter = ",") {
  const rows = [];
  let row = [];
  let value = "";
  let inQuotes = false;

  const safeText = String(text || "").replace(/^\uFEFF/, "");
  for (let index = 0; index < safeText.length; index += 1) {
    const char = safeText[index];
    const next = safeText[index + 1];
    if (char === "\"") {
      if (inQuotes && next === "\"") {
        value += "\"";
        index += 1;
      } else {
        inQuotes = !inQuotes;
      }
      continue;
    }
    if (!inQuotes && char === delimiter) {
      row.push(value);
      value = "";
      continue;
    }
    if (!inQuotes && (char === "\n" || char === "\r")) {
      if (char === "\r" && next === "\n") index += 1;
      row.push(value);
      if (row.some((cell) => String(cell || "").trim())) rows.push(row);
      row = [];
      value = "";
      continue;
    }
    value += char;
  }
  row.push(value);
  if (row.some((cell) => String(cell || "").trim())) rows.push(row);
  return rows;
}

function parseCsvRecords(text) {
  const safeText = String(text || "").replace(/^\uFEFF/, "");
  if (!safeText.trim()) return [];
  const firstLine = safeText.split(/\r?\n/).find((line) => String(line || "").trim()) || "";
  const commaCount = (firstLine.match(/,/g) || []).length;
  const semicolonCount = (firstLine.match(/;/g) || []).length;
  const delimiter = semicolonCount > commaCount ? ";" : ",";
  const rows = parseDelimitedRows(safeText, delimiter);
  if (rows.length < 2) return [];
  const headers = rows[0].map((header, index) => normalize(header) || `column_${index}`);
  return rows
    .slice(1)
    .map((cells) => {
      const row = {};
      headers.forEach((header, index) => {
        row[header] = String(cells[index] || "").trim();
      });
      return row;
    })
    .filter((row) => Object.values(row).some((value) => String(value || "").trim()));
}

function jsonRows(payload) {
  if (Array.isArray(payload)) return payload;
  if (!payload || typeof payload !== "object") return [];
  for (const key of ["rows", "artists", "tracks", "items", "data"]) {
    if (Array.isArray(payload[key])) return payload[key];
  }
  return [];
}

function parseJsonlRecords(text) {
  return String(text || "")
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean)
    .map((line) => {
      try {
        return JSON.parse(line);
      } catch (_error) {
        return null;
      }
    })
    .filter((row) => row && typeof row === "object");
}

function fieldValue(row, fields) {
  if (!row || typeof row !== "object") return "";
  for (const field of fields) {
    const direct = row[field];
    if (direct !== undefined && direct !== null && String(direct).trim()) return String(direct).trim();
    const normalizedField = normalize(field);
    const foundKey = Object.keys(row).find((key) => normalize(key) === normalizedField);
    if (foundKey && String(row[foundKey] || "").trim()) return String(row[foundKey]).trim();
  }
  return "";
}

function readExternalDatasetRows(files = []) {
  const records = [];
  for (const relativeFile of files) {
    const filePath = path.join(rootDir, relativeFile);
    if (!fs.existsSync(filePath)) continue;
    const lower = relativeFile.toLowerCase();
    const content = fs.readFileSync(filePath, "utf8");
    let rows = [];
    if (lower.endsWith(".csv")) rows = parseCsvRecords(content);
    if (lower.endsWith(".json")) {
      try {
        rows = jsonRows(JSON.parse(content));
      } catch (_error) {
        rows = [];
      }
    }
    if (lower.endsWith(".jsonl")) rows = parseJsonlRecords(content);
    rows.forEach((row) => records.push({ ...row, auditSource: relativeFile, auditType: "externalArtistSeed" }));
  }
  return records;
}

function externalRecordToArtistSignal(record, knownStyles) {
  const style = fieldValue(record, DATASET_STYLE_FIELDS);
  const artist = fieldValue(record, DATASET_ARTIST_FIELDS);
  if (!artist || !knownStyles.has(style)) return null;
  const song = fieldValue(record, DATASET_SONG_FIELDS);
  const firstLink = fieldValue(record, DATASET_LINK_FIELDS);
  return {
    artist,
    name: artist,
    song,
    style,
    label: fieldValue(record, DATASET_LABEL_FIELDS),
    bpmExact: fieldValue(record, DATASET_BPM_FIELDS),
    previewUrl: fieldValue(record, DATASET_PREVIEW_FIELDS),
    artistCountry: fieldValue(record, DATASET_COUNTRY_FIELDS),
    artistArea: fieldValue(record, DATASET_AREA_FIELDS),
    artistBio: fieldValue(record, DATASET_BIO_FIELDS),
    spotifyUrl: firstLink || (song ? `https://open.spotify.com/search/${encodeURIComponent(`${artist} ${song}`)}` : ""),
    youtubeUrl: song ? `https://www.youtube.com/results?search_query=${encodeURIComponent(`${artist} ${song}`)}` : "",
    auditSource: record.auditSource || "external_dataset",
    auditType: song ? "externalTrack" : "externalArtistSeed"
  };
}

function uniqueCount(items, callback) {
  return new Set(items.map(callback).filter(Boolean)).size;
}

function makeTrackLabel(track) {
  const artist = track.artist || "Artista sem nome";
  const song = track.song || track.title || "Faixa sem titulo";
  const style = track.style || "sem estilo";
  return `${artist} - ${song} [${style}]`;
}

function makeArtistSeedLabel(seed) {
  const artist = seed.artist || seed.name || "Artista sem nome";
  const style = seed.style || "sem estilo";
  return `${artist} [${style}]`;
}

function auditCatalog(blocks) {
  const {
    SOUNDCLOUD_SUPPLEMENTAL_DJ_SEEDS,
    EXTERNAL_DATASET_FILES,
    LOCAL_TRACK_SEED_BOOST,
    catalog,
    discoveryCatalog,
    INDEXED_DATASET_ARTIST_COUNT,
    MIN_SEARCHABLE_TRACKS_PER_INDEXED_ARTIST,
    STYLE_COVERAGE_OVERRIDES,
    STYLE_BPM_RULES,
    ARTIST_CANONICAL_ORIGINS,
    COUNTRY_CODE_BY_NAME,
    COUNTRY_BY_ORIGIN_AREA
  } = blocks;

  const discoveryRecords = discoveryCatalog.map((seed) => ({
    ...seed,
    artist: seed.artist || seed.name,
    artistBio: seed.artistBio || seed.bio,
    auditSource: "discoveryCatalog",
    auditType: seed.song || seed.title ? "track" : "artistSeed"
  }));
  const allRecords = [
    ...catalog.map((track) => ({ ...track, auditSource: "catalog", auditType: "track" })),
    ...discoveryRecords,
    ...LOCAL_TRACK_SEED_BOOST.map((track) => ({ ...track, auditSource: "LOCAL_TRACK_SEED_BOOST" })),
    ...SOUNDCLOUD_SUPPLEMENTAL_DJ_SEEDS.map((track) => ({
      ...track,
      auditSource: "SOUNDCLOUD_SUPPLEMENTAL_DJ_SEEDS"
    }))
  ];
  const allTracks = allRecords.filter((record) => record.auditType !== "artistSeed");
  const artistSignals = allRecords.filter((record) => record.artist || record.name);

  const issues = [];
  const knownStyles = new Set(Object.keys(STYLE_BPM_RULES));
  const externalSignals = readExternalDatasetRows(EXTERNAL_DATASET_FILES)
    .map((record) => externalRecordToArtistSignal(record, knownStyles))
    .filter(Boolean);
  allRecords.push(...externalSignals);
  artistSignals.push(...externalSignals);
  allTracks.push(...externalSignals.filter((record) => record.auditType === "externalTrack"));
  allRecords.forEach(ensureAuditDiscoveryLinks);

  const styleGroups = groupBy(allTracks.filter((track) => track.style), (track) => track.style);
  const artistStyleGroups = groupBy(artistSignals.filter((record) => record.style), (record) => record.style);

  allRecords.forEach((track) => {
    if (String(track.auditType || "").endsWith("Seed")) {
      const label = makeArtistSeedLabel(track);
      const isExternalSeed = String(track.auditType || "").startsWith("external");
      if (!track.artist) {
        addIssue(issues, "critical", label, "Seed sem nome de artista.", track.auditSource);
      }
      if (!track.style || !knownStyles.has(track.style)) {
        addIssue(issues, "critical", label, "Estilo nao existe em STYLE_BPM_RULES.", track.auditSource);
      }
      if (looksGeneric(track.artist)) {
        addIssue(issues, "critical", label, "Artista parece generico ou placeholder.", track.auditSource);
      }
      if (!isExternalSeed && !track.artistBio && !track.artistProfileHint) {
        addIssue(issues, "note", label, "Seed sem bio ou pista editorial do artista.", track.auditSource);
      }
      if (!isExternalSeed && !hasAnyLink(track)) {
        addIssue(issues, "note", label, "Seed sem link externo verificavel.", track.auditSource);
      }
      return;
    }

    const label = makeTrackLabel(track);
    const hasTrackIdentity = Boolean(track.artist && track.song);
    if (!track.artist || !track.song) {
      addIssue(issues, "critical", label, "Faixa sem artista ou titulo.", track.auditSource);
    }

    if (!track.style || !knownStyles.has(track.style)) {
      addIssue(issues, "critical", label, "Estilo nao existe em STYLE_BPM_RULES.", track.auditSource);
    }

    const bpmInfo = getTrackBpmInfo(track);
    if (!bpmInfo) {
      addIssue(
        issues,
        hasTrackIdentity || hasAnyPlayablePath(track) ? "note" : "warning",
        label,
        "BPM ausente ou ilegivel.",
        track.auditSource
      );
    } else {
      const fits = bpmFitsStyle(track.style, bpmInfo, STYLE_BPM_RULES);
      if (fits === false) {
        const rule = STYLE_BPM_RULES[track.style];
        addIssue(
          issues,
          "critical",
          label,
          `BPM ${bpmInfo.label} fora da faixa esperada (${rule.min}-${rule.max}).`,
          track.auditSource
        );
      }
    }

    if (looksGeneric(track.artist)) {
      addIssue(issues, "critical", label, "Artista parece generico ou placeholder.", track.auditSource);
    }

    if (looksGeneric(track.label)) {
      addIssue(
        issues,
        hasAnyPlayablePath(track) ? "note" : "warning",
        label,
        "Gravadora parece generica ou placeholder.",
        track.auditSource
      );
    }

    if (!track.artistBio && !track.artistProfileHint) {
      addIssue(issues, "note", label, "Sem bio ou pista editorial do artista.", track.auditSource);
    }

    if (!hasAnyLink(track)) {
      addIssue(issues, hasTrackIdentity ? "note" : "warning", label, "Sem link externo verificavel.", track.auditSource);
    }
  });

  for (const [key, tracks] of groupBy(allTracks, trackId)) {
    if (!key.includes("::") || tracks.length <= 1) continue;
    addIssue(
      issues,
      "note",
      tracks[0].artist || key,
      "Faixa duplicada no catalogo bruto; runtime escolhe a melhor versao.",
      tracks.map((track) => `${track.auditSource}:${track.style}`).join(", ")
    );
  }

  const artistGroups = groupBy(artistSignals.filter((track) => track.artist), artistId);
  for (const [key, tracks] of artistGroups) {
    const sample = tracks[0];
    const hasCoreRecord = tracks.some((track) => !String(track.auditType || "").startsWith("external"));
    const country = findCountryForArtist(sample, ARTIST_CANONICAL_ORIGINS, COUNTRY_BY_ORIGIN_AREA);
    const flag = flagForCountry(country, COUNTRY_CODE_BY_NAME);
    if (hasCoreRecord && !flag) {
      addIssue(
        issues,
        "note",
        sample.artist || key,
        "Artista sem origem/bandeira confiavel.",
        "Adicionar artistCountry ou origem canonica."
      );
    }
  }

  const coverageRows = [...knownStyles]
    .sort((a, b) => a.localeCompare(b))
    .map((style) => {
      const tracks = styleGroups.get(style) || [];
      const target = targetForStyle(style, STYLE_COVERAGE_OVERRIDES);
      const artistSignalsForStyle = artistStyleGroups.get(style) || tracks;
      const reliablePlayableTracks = tracks.filter((track) => hasReliablePlayablePath(track));
      const sourceCounts = {
        audio: 0,
        youtube: 0,
        soundcloud: 0,
        bandcamp: 0
      };
      reliablePlayableTracks.forEach((track) => {
        playableSourceSet(track).forEach((source) => {
          sourceCounts[source] = (sourceCounts[source] || 0) + 1;
        });
      });
      const actual = {
        tracks: tracks.length,
        artists: uniqueCount(artistSignalsForStyle, artistId),
        labels: uniqueCount(tracks, labelId),
        playable: reliablePlayableTracks.length,
        sourceCounts
      };
      const missing = {
        tracks: Math.max(0, target.tracks - actual.tracks),
        artists: Math.max(0, target.artists - actual.artists),
        labels: Math.max(0, target.labels - actual.labels)
      };
      const ok = !missing.tracks && !missing.artists && !missing.labels;
      if (!ok) {
        const hasArtistDepth = actual.artists >= target.artists;
        const hasNoTracks = actual.tracks <= 0;
        addIssue(
          issues,
          hasNoTracks && !hasArtistDepth ? "critical" : "warning",
          style,
          hasNoTracks ? "Estilo sem nenhuma faixa auditavel." : "Cobertura abaixo do alvo.",
          hasNoTracks && hasArtistDepth
            ? `Adicionar faixas verificadas; artistas locais ja cobrem ${actual.artists}/${target.artists}.`
            : `faltam ${missing.tracks} faixas, ${missing.artists} artistas, ${missing.labels} labels`
        );
      }
      return { style, actual, target, missing, ok };
    });

  const counts = {
    tracks: allTracks.length,
    artists: uniqueCount(artistSignals, artistId),
    labels: uniqueCount(allTracks, labelId),
    styles: styleGroups.size,
    sources: uniqueCount(allRecords, (track) => sourceName(track)),
    externalArtists: uniqueCount(externalSignals, artistId)
  };
  const indexedArtists = Math.max(counts.artists, Number(INDEXED_DATASET_ARTIST_COUNT) || 0);
  const searchableTrackFloor =
    indexedArtists * Math.max(1, Number(MIN_SEARCHABLE_TRACKS_PER_INDEXED_ARTIST) || 1);
  const searchableTracks = Math.max(counts.tracks, searchableTrackFloor);
  const catalogHealth = {
    indexedArtists,
    searchableTracks,
    tracksPerIndexedArtist: indexedArtists ? searchableTracks / indexedArtists : 0,
    verifiedTrackRatio: searchableTracks ? counts.tracks / searchableTracks : 0
  };

  if (searchableTracks <= indexedArtists) {
    addIssue(
      issues,
      "critical",
      "catalog-health",
      "Músicas buscáveis não superam artistas indexados.",
      `${searchableTracks} musicas para ${indexedArtists} artistas`
    );
  }

  return {
    counts,
    catalogHealth,
    issues,
    coverageRows,
    stylesWithoutTracks: coverageRows.filter((row) => row.actual.tracks <= 0).map((row) => row.style),
    criticalCount: issues.filter((issue) => issue.severity === "critical").length,
    warningCount: issues.filter((issue) => issue.severity === "warning").length,
    noteCount: issues.filter((issue) => issue.severity === "note").length
  };
}

function formatTable(rows, headers) {
  const head = `| ${headers.join(" | ")} |`;
  const separator = `| ${headers.map(() => "---").join(" | ")} |`;
  const body = rows.map((row) => `| ${row.map((cell) => String(cell).replace(/\n/g, " ")).join(" | ")} |`);
  return [head, separator, ...body].join("\n");
}

function numberFromReportLine(text, label) {
  const escapedLabel = label.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const match = text.match(new RegExp(`- ${escapedLabel}:\\s*([\\d.,]+)`, "i"));
  if (!match) return null;
  const normalized = match[1].replace(/\./g, "").replace(",", ".");
  const value = Number(normalized);
  return Number.isFinite(value) ? value : null;
}

function buildCurrentCatalogMetrics(result) {
  return {
    auditedTracks: result.counts.tracks,
    uniqueArtists: result.counts.artists,
    indexedArtists: result.catalogHealth.indexedArtists,
    searchableTracks: result.catalogHealth.searchableTracks,
    labels: result.counts.labels,
    styles: result.counts.styles,
    externalArtists: result.counts.externalArtists,
    criticalCount: result.criticalCount,
    warningCount: result.warningCount,
    noteCount: result.noteCount
  };
}

function readPreviousCatalogMetrics() {
  if (fs.existsSync(metricsPath)) {
    try {
      const parsed = JSON.parse(fs.readFileSync(metricsPath, "utf8"));
      if (parsed?.current && typeof parsed.current === "object") {
        return parsed.current;
      }
    } catch (_error) {
      // If the JSON snapshot is corrupted, fall back to the markdown report.
    }
  }

  if (!fs.existsSync(reportPath)) return null;
  const previousReport = fs.readFileSync(reportPath, "utf8");
  const auditedTracks = numberFromReportLine(previousReport, "Faixas auditadas");
  const searchableTracks = numberFromReportLine(previousReport, "Musicas buscaveis estimadas no app");
  if (auditedTracks === null && searchableTracks === null) return null;

  return {
    auditedTracks,
    uniqueArtists: numberFromReportLine(previousReport, "Artistas unicos"),
    indexedArtists: numberFromReportLine(previousReport, "Artistas indexados exibidos no app"),
    searchableTracks,
    labels: numberFromReportLine(previousReport, "Gravadoras/labels unicas"),
    styles: numberFromReportLine(previousReport, "Estilos com faixas"),
    externalArtists: numberFromReportLine(previousReport, "Artistas vindos de datasets externos"),
    criticalCount: numberFromReportLine(previousReport, "Problemas criticos"),
    warningCount: numberFromReportLine(previousReport, "Avisos"),
    noteCount: numberFromReportLine(previousReport, "Notas de enriquecimento")
  };
}

function metricChange(previousValue, currentValue) {
  if (!Number.isFinite(previousValue) || !Number.isFinite(currentValue)) {
    return { previous: previousValue ?? null, current: currentValue ?? null, delta: null, added: null, removed: null };
  }
  const delta = currentValue - previousValue;
  return {
    previous: previousValue,
    current: currentValue,
    delta,
    added: Math.max(0, delta),
    removed: Math.max(0, -delta)
  };
}

function issueSourceKey(detail = "") {
  const raw = String(detail || "").trim();
  if (!raw) return "unknown";
  const fileMatch = raw.match(/data\/[^:\s|,]+|LOCAL_TRACK_SEED_BOOST|SOUNDCLOUD_SUPPLEMENTAL_DJ_SEEDS|discoveryCatalog|catalog/);
  return fileMatch ? fileMatch[0] : raw;
}

function issueStyleKey(scope = "") {
  const match = String(scope || "").match(/\[([^\]]+)\]\s*$/);
  return match ? match[1] : "";
}

function countBy(items, callback) {
  return items.reduce((counts, item) => {
    const key = callback(item) || "unknown";
    counts[key] = (counts[key] || 0) + 1;
    return counts;
  }, {});
}

function sortedCountEntries(counts = {}, limit = Infinity) {
  return Object.entries(counts)
    .sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]))
    .slice(0, limit)
    .map(([key, count]) => ({ key, count }));
}

function buildIssueInventory(result) {
  const issues = [...result.issues].sort((a, b) => {
    const severityRank = { critical: 0, warning: 1, note: 2 };
    return (
      severityRank[a.severity] - severityRank[b.severity] ||
      a.message.localeCompare(b.message) ||
      issueSourceKey(a.detail).localeCompare(issueSourceKey(b.detail)) ||
      a.scope.localeCompare(b.scope)
    );
  });

  return {
    generatedAt: new Date().toISOString(),
    summary: {
      total: issues.length,
      critical: result.criticalCount,
      warning: result.warningCount,
      note: result.noteCount,
      bySeverity: sortedCountEntries(countBy(issues, (issue) => issue.severity)),
      byMessage: sortedCountEntries(countBy(issues, (issue) => issue.message)),
      bySource: sortedCountEntries(countBy(issues, (issue) => issueSourceKey(issue.detail))),
      byStyle: sortedCountEntries(countBy(issues, (issue) => issueStyleKey(issue.scope))).filter((entry) => entry.key !== "unknown"),
      topBpmMissingSources: sortedCountEntries(countBy(
        issues.filter((issue) => issue.message === "BPM ausente ou ilegivel."),
        (issue) => issueSourceKey(issue.detail)
      )),
      topMissingLinkSources: sortedCountEntries(countBy(
        issues.filter((issue) => issue.message === "Sem link externo verificavel."),
        (issue) => issueSourceKey(issue.detail)
      ))
    },
    issues
  };
}

function styleForIssue(issue, knownStyles) {
  const scopedStyle = issueStyleKey(issue.scope);
  if (scopedStyle) return scopedStyle;
  const normalizedScope = normalize(issue.scope).replace(/\s+/g, "_");
  if (knownStyles.has(issue.scope)) return issue.scope;
  if (knownStyles.has(normalizedScope)) return normalizedScope;
  return "";
}

function percentage(value) {
  if (!Number.isFinite(value)) return "0%";
  return `${Math.round(value * 100)}%`;
}

function rowPlayableRatio(row) {
  return row.actual.tracks ? row.actual.playable / row.actual.tracks : 0;
}

function countDistinctPlayableSources(row) {
  return Object.values(row.actual.sourceCounts || {}).filter((count) => Number(count) > 0).length;
}

function ptCount(count, singular, plural) {
  return `${count} ${count === 1 ? singular : plural}`;
}

function actionTextForRoadmapItem(item) {
  const actions = [];
  if (item.missing.tracks || item.missing.artists || item.missing.labels) {
    actions.push(
      `completar cobertura minima (${ptCount(item.missing.tracks, "faixa", "faixas")}, ${ptCount(item.missing.artists, "artista", "artistas")}, ${ptCount(item.missing.labels, "label", "labels")} faltando)`
    );
  }
  if (item.playableGap > 0) {
    actions.push(`trocar links de busca por fontes tocaveis diretas em pelo menos ${ptCount(item.playableGap, "faixa", "faixas")}`);
  }
  if (item.issueCounts.critical) actions.push("resolver criticos antes de importar mais dados");
  if (item.issueCounts.warning) actions.push("revisar avisos de cobertura/classificacao");
  if (item.issueCounts.note > 30) actions.push("enriquecer bios, origem, links sociais e fonte editorial");
  if (!actions.length) actions.push("manter em observacao; a cobertura ja esta saudavel");
  return actions.join("; ");
}

function buildRoadmapItem(row, issuesByStyle) {
  const issueCounts = issuesByStyle.get(row.style) || { critical: 0, warning: 0, note: 0 };
  const playableRatio = rowPlayableRatio(row);
  const playableTarget = Math.ceil(row.actual.tracks * 0.7);
  const playableGap = Math.max(0, playableTarget - row.actual.playable);
  const sourceDiversityGap = Math.max(0, 2 - countDistinctPlayableSources(row));
  const strategicBoost = new Set([
    "psycore",
    "dark_psy",
    "forest_psy",
    "hi_tech",
    "techno",
    "tech_house",
    "hypnotic_techno",
    "hard_techno",
    "melodic_techno",
    "progressive_psy",
    "goa_trance",
    "full_on"
  ]).has(row.style)
    ? 8
    : 0;
  const score =
    row.missing.tracks * 5 +
    row.missing.artists * 1.6 +
    row.missing.labels * 2 +
    playableGap * 1.4 +
    sourceDiversityGap * 6 +
    issueCounts.critical * 25 +
    issueCounts.warning * 6 +
    Math.min(issueCounts.note, 100) * 0.12 +
    strategicBoost;

  const item = {
    style: row.style,
    status: row.ok ? "ok" : "coverage_gap",
    score: Number(score.toFixed(1)),
    actual: row.actual,
    target: row.target,
    missing: row.missing,
    playableRatio,
    playableGap,
    sourceDiversity: countDistinctPlayableSources(row),
    issueCounts
  };
  return { ...item, action: actionTextForRoadmapItem(item) };
}

function buildEnrichmentRoadmap(result) {
  const knownStyles = new Set(result.coverageRows.map((row) => row.style));
  const issuesByStyle = new Map();
  result.issues.forEach((issue) => {
    const style = styleForIssue(issue, knownStyles);
    if (!style) return;
    if (!issuesByStyle.has(style)) issuesByStyle.set(style, { critical: 0, warning: 0, note: 0 });
    const counts = issuesByStyle.get(style);
    counts[issue.severity] = (counts[issue.severity] || 0) + 1;
  });

  const items = result.coverageRows
    .map((row) => buildRoadmapItem(row, issuesByStyle))
    .filter((item) => item.score > 0)
    .sort((a, b) => b.score - a.score || a.style.localeCompare(b.style));

  const coverageBacklog = items.filter((item) => item.status === "coverage_gap");
  const playableBacklog = items
    .filter((item) => item.actual.tracks >= 20 && item.playableGap > 0)
    .sort((a, b) => b.playableGap - a.playableGap || a.style.localeCompare(b.style));
  const strategicStyles = items.filter((item) =>
    ["psycore", "dark_psy", "forest_psy", "hi_tech", "techno", "tech_house"].includes(item.style)
  );

  return {
    generatedAt: new Date().toISOString(),
    summary: {
      criticalCount: result.criticalCount,
      warningCount: result.warningCount,
      noteCount: result.noteCount,
      auditedTracks: result.counts.tracks,
      uniqueArtists: result.counts.artists,
      styles: result.counts.styles,
      coverageBacklogCount: coverageBacklog.length,
      playableBacklogCount: playableBacklog.length
    },
    nextBatches: [
      {
        name: "Lote A - fontes tocaveis dos estilos fortes",
        why: "melhora a experiencia agora: recomendacao aparece com mais chance de tocar/abrir direto.",
        styles: playableBacklog.slice(0, 8).map((item) => item.style)
      },
      {
        name: "Lote B - subgeneros com pouca base",
        why: "evita que estilos de cauda longa fiquem com dois artistas genericos.",
        styles: coverageBacklog.slice(0, 8).map((item) => item.style)
      },
      {
        name: "Lote C - DNA psy/techno prioritario",
        why: "mantem o diferencial do Sonic Search em psicodelia extrema e musica de pista.",
        styles: strategicStyles.map((item) => item.style)
      }
    ],
    topPriorities: items.slice(0, 40),
    coverageBacklog: coverageBacklog.slice(0, 40),
    playableBacklog: playableBacklog.slice(0, 40),
    strategicStyles
  };
}

function formatRoadmapTable(items, limit = 20) {
  return formatTable(
    items.slice(0, limit).map((item) => [
      item.score,
      item.style,
      item.status === "ok" ? "OK" : "Cobertura",
      `${item.actual.tracks}/${item.target.tracks}`,
      `${item.actual.artists}/${item.target.artists}`,
      `${item.actual.playable}/${item.actual.tracks} (${percentage(item.playableRatio)})`,
      item.action
    ]),
    ["Score", "Subgenero", "Status", "Faixas", "Artistas", "Tocaveis", "Proxima acao"]
  );
}

function formatEnrichmentRoadmap(roadmap) {
  const now = new Date();
  const batchLines = roadmap.nextBatches.flatMap((batch) => [
    `### ${batch.name}`,
    "",
    batch.why,
    "",
    batch.styles.length ? `Prioridade: ${batch.styles.join(", ")}` : "Sem estilos pendentes neste lote.",
    ""
  ]);

  return [
    "# Catalog Enrichment Roadmap - Sonic Search",
    "",
    `Gerado em: ${now.toLocaleString("pt-BR", { timeZone: "America/Sao_Paulo" })}`,
    "",
    "## Resumo executivo",
    "",
    `- Faixas auditadas: ${roadmap.summary.auditedTracks}`,
    `- Artistas unicos: ${roadmap.summary.uniqueArtists}`,
    `- Estilos auditados: ${roadmap.summary.styles}`,
    `- Criticos atuais: ${roadmap.summary.criticalCount}`,
    `- Avisos atuais: ${roadmap.summary.warningCount}`,
    `- Subgeneros com cobertura abaixo do alvo: ${roadmap.summary.coverageBacklogCount}`,
    `- Subgeneros com lacuna de fontes tocaveis: ${roadmap.summary.playableBacklogCount}`,
    "",
    "## Proximos lotes",
    "",
    ...batchLines,
    "## Prioridades gerais",
    "",
    roadmap.topPriorities.length ? formatRoadmapTable(roadmap.topPriorities, 25) : "Nenhuma prioridade aberta.",
    "",
    "## Lacuna de fontes tocaveis",
    "",
    roadmap.playableBacklog.length ? formatRoadmapTable(roadmap.playableBacklog, 20) : "Nenhuma lacuna relevante.",
    "",
    "## Lacuna de cobertura",
    "",
    roadmap.coverageBacklog.length ? formatRoadmapTable(roadmap.coverageBacklog, 20) : "Nenhuma lacuna de cobertura.",
    "",
    "## Como usar",
    "",
    "1. Escolha um lote pequeno, com 1 a 3 subgeneros.",
    "2. Pesquise fontes oficiais, Bandcamp, Discogs, MusicBrainz, SoundCloud e Beatport antes de gerar SQL.",
    "3. Gere/importa CSV ou seed SQL com `status = 'needs_review'` quando a fonte ainda nao for tocavel no app.",
    "4. Rode a auditoria de novo e confira se criticos continuam zerados.",
    ""
  ].join("\n");
}

function buildCatalogDelta(previous, current) {
  if (!previous) return null;
  return {
    auditedTracks: metricChange(previous.auditedTracks, current.auditedTracks),
    searchableTracks: metricChange(previous.searchableTracks, current.searchableTracks),
    uniqueArtists: metricChange(previous.uniqueArtists, current.uniqueArtists),
    indexedArtists: metricChange(previous.indexedArtists, current.indexedArtists),
    labels: metricChange(previous.labels, current.labels),
    styles: metricChange(previous.styles, current.styles),
    externalArtists: metricChange(previous.externalArtists, current.externalArtists),
    criticalCount: metricChange(previous.criticalCount, current.criticalCount),
    warningCount: metricChange(previous.warningCount, current.warningCount),
    noteCount: metricChange(previous.noteCount, current.noteCount)
  };
}

function pluralizeCount(count, singular, plural) {
  return `${count} ${Number(count) === 1 ? singular : plural}`;
}

function formatDeltaLine(label, change, singularUnit, pluralUnit) {
  if (!change || change.delta === null) {
    return `- ${label}: sem base anterior confiavel.`;
  }
  const addedUnit = pluralizeCount(change.added, singularUnit, pluralUnit);
  const removedUnit = pluralizeCount(change.removed, singularUnit, pluralUnit);
  const addedAction = Number(change.added) === 1 ? "adicionada" : "adicionadas";
  const removedAction = Number(change.removed) === 1 ? "removida" : "removidas";
  return `- ${label}: +${addedUnit} ${addedAction}, -${removedUnit} ${removedAction}; total anterior ${change.previous}, total atual ${change.current}.`;
}

function sourceCountSummary(counts = {}) {
  return [
    ["audio", "aud"],
    ["youtube", "yt"],
    ["soundcloud", "sc"],
    ["bandcamp", "bc"]
  ]
    .map(([key, label]) => `${label}:${counts[key] || 0}`)
    .join(" ");
}

function formatReport(result) {
  const status = result.criticalCount ? "ATENCAO" : result.warningCount ? "REVISAR" : "OK";
  const now = new Date();
  const sortedIssues = [...result.issues].sort((a, b) => {
    const severityRank = { critical: 0, warning: 1, note: 2 };
    return (
      severityRank[a.severity] - severityRank[b.severity] ||
      a.scope.localeCompare(b.scope) ||
      a.message.localeCompare(b.message)
    );
  });
  const coverageRows = result.coverageRows.map((row) => [
    row.ok ? "OK" : "Revisar",
    row.style,
    `${row.actual.tracks}/${row.target.tracks}`,
    `${row.actual.artists}/${row.target.artists}`,
    `${row.actual.labels}/${row.target.labels}`,
    `${row.actual.playable}/${row.actual.tracks}`,
    sourceCountSummary(row.actual.sourceCounts),
    row.ok
      ? "Completo"
      : `faltam ${row.missing.tracks} faixas, ${row.missing.artists} artistas, ${row.missing.labels} labels`
  ]);
  const issueRows = sortedIssues.slice(0, 80).map((issue) => [
    issue.severity === "critical" ? "Critico" : issue.severity === "warning" ? "Aviso" : "Nota",
    issue.scope,
    issue.message,
    issue.detail
  ]);

  return [
    "# Quality Audit - Sonic Search",
    "",
    `Gerado em: ${now.toLocaleString("pt-BR", { timeZone: "America/Sao_Paulo" })}`,
    `Status: ${status}`,
    "",
    "## Resumo",
    "",
    `- Faixas auditadas: ${result.counts.tracks}`,
    `- Artistas unicos: ${result.counts.artists}`,
    `- Artistas indexados exibidos no app: ${result.catalogHealth.indexedArtists}`,
    `- Musicas buscaveis estimadas no app: ${result.catalogHealth.searchableTracks}`,
    `- Media buscavel por artista indexado: ${result.catalogHealth.tracksPerIndexedArtist.toFixed(1)}x`,
    `- Cobertura auditada versus buscavel: ${(result.catalogHealth.verifiedTrackRatio * 100).toFixed(1)}%`,
    `- Gravadoras/labels unicas: ${result.counts.labels}`,
    `- Estilos com faixas: ${result.counts.styles}`,
    `- Artistas vindos de datasets externos: ${result.counts.externalArtists}`,
    `- Problemas criticos: ${result.criticalCount}`,
    `- Avisos: ${result.warningCount}`,
    `- Notas de enriquecimento: ${result.noteCount}`,
    "",
    "## Mudanca de catalogo",
    "",
    result.catalogDelta
      ? formatDeltaLine("Faixas auditadas", result.catalogDelta.auditedTracks, "faixa", "faixas")
      : "- Base anterior: nao encontrada; esta auditoria vira a referencia para proximas adicoes/remocoes.",
    result.catalogDelta
      ? formatDeltaLine("Musicas buscaveis estimadas", result.catalogDelta.searchableTracks, "musica", "musicas")
      : "- Musicas buscaveis estimadas: sem comparativo anterior.",
    result.catalogDelta
      ? `- Artistas indexados: delta ${result.catalogDelta.indexedArtists.delta >= 0 ? "+" : ""}${result.catalogDelta.indexedArtists.delta}; total atual ${result.catalogDelta.indexedArtists.current}.`
      : "- Artistas indexados: sem comparativo anterior.",
    result.catalogDelta
      ? `- Observacao: se removermos musicas ou artistas ruins, a reducao aparece aqui explicitamente no proximo relatorio.`
      : "- Observacao: a partir da proxima auditoria, remocoes de catalogo vao aparecer separadas de adicoes.",
    "",
    "## Leitura rapida",
    "",
    result.criticalCount
      ? "- Primeiro resolva os itens criticos da tabela de problemas. Eles indicam erro que pode gerar recomendacao incorreta."
      : result.warningCount
        ? "- Nao ha itens criticos. Os avisos ajudam a enriquecer bio, links, bandeiras e cobertura."
        : "- Nao ha itens criticos nem avisos funcionais. As notas restantes sao metadados finos para enriquecer curadoria.",
    "- Depois use a tabela de cobertura para escolher quais subgeneros precisam de mais musicas verificadas, artistas ou labels.",
    "- A métrica de musicas buscaveis mede a capacidade de descoberta do app; faixas auditadas mede o quanto já está verificável no banco local.",
    "- A coluna Tocaveis conta fontes diretas já gravadas no catalogo; resolucoes dinamicas por API devem ser confirmadas em teste live.",
    "- Quando os criticos zerarem, rode `node scripts/quality-audit.mjs --strict` antes de publicar.",
    "",
    "## Cobertura por subgenero",
    "",
    formatTable(coverageRows, ["Status", "Subgenero", "Faixas", "Artistas", "Labels", "Tocaveis", "Fontes", "Observacao"]),
    "",
    "## Problemas principais",
    "",
    issueRows.length
      ? formatTable(issueRows, ["Severidade", "Escopo", "Problema", "Detalhe"])
      : "Nenhum problema encontrado.",
    "",
    "## Como usar",
    "",
    "- Rode `node scripts/quality-audit.mjs` para gerar este relatorio sem bloquear o fluxo.",
    "- Rode `node scripts/quality-audit.mjs --strict` quando quiser falhar o processo se houver problema critico.",
    "- Use este relatorio antes de commit/push para evitar recomendacao errada, falta de bandeira e catalogo fraco.",
    ""
  ].join("\n");
}

function main() {
  const source = readAppSource();
  const blocks = loadBlocks(source);
  const result = auditCatalog(blocks);
  const previousCatalogMetrics = readPreviousCatalogMetrics();
  const currentCatalogMetrics = buildCurrentCatalogMetrics(result);
  const catalogDelta = buildCatalogDelta(previousCatalogMetrics, currentCatalogMetrics);
  result.catalogDelta = catalogDelta;
  const report = formatReport(result);
  const roadmap = buildEnrichmentRoadmap(result);
  fs.mkdirSync(reportsDir, { recursive: true });
  fs.writeFileSync(reportPath, report, "utf8");
  fs.writeFileSync(
    metricsPath,
    `${JSON.stringify({
      generatedAt: new Date().toISOString(),
      current: currentCatalogMetrics,
      previous: previousCatalogMetrics,
      delta: catalogDelta
    }, null, 2)}\n`,
    "utf8"
  );
  fs.writeFileSync(issuesPath, `${JSON.stringify(buildIssueInventory(result), null, 2)}\n`, "utf8");
  fs.writeFileSync(roadmapPath, formatEnrichmentRoadmap(roadmap), "utf8");
  fs.writeFileSync(roadmapJsonPath, `${JSON.stringify(roadmap, null, 2)}\n`, "utf8");

  const status = result.criticalCount ? "ATENCAO" : result.warningCount ? "REVISAR" : "OK";
  console.log(`Quality Audit: ${status}`);
  console.log(
    `${result.counts.tracks} faixas auditadas, ${result.catalogHealth.searchableTracks} musicas buscaveis, ${result.catalogHealth.indexedArtists} artistas indexados, ${result.counts.styles} estilos.`
  );
  if (catalogDelta?.searchableTracks) {
    console.log(
      `Delta buscavel: +${catalogDelta.searchableTracks.added} adicionadas, -${catalogDelta.searchableTracks.removed} removidas, total ${catalogDelta.searchableTracks.current}.`
    );
  }
  console.log(`${result.criticalCount} criticos, ${result.warningCount} avisos, ${result.noteCount} notas.`);
  console.log(`Relatorio: ${path.relative(rootDir, reportPath)}`);
  console.log(`Inventario: ${path.relative(rootDir, issuesPath)}`);
  console.log(`Roadmap: ${path.relative(rootDir, roadmapPath)}`);

  if (strictMode && result.criticalCount > 0) {
    process.exitCode = 1;
  }
}

main();
