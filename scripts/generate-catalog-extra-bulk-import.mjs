#!/usr/bin/env node
import fs from "node:fs";
import path from "node:path";

const ROOT = process.cwd();
const APP_PATH = path.join(ROOT, "app.js");
const DATA_DIR = path.join(ROOT, "data");
const SEED_DIR = path.join(ROOT, "supabase", "seeds");
const REPORT_DIR = path.join(ROOT, "reports");
const BATCH = "catalog_extra_bulk_local_20260621";
const SQL_OUT = path.join(SEED_DIR, `${BATCH}.sql`);
const REPORT_OUT = path.join(REPORT_DIR, `${BATCH}.json`);
const ROWS_OUT = path.join(REPORT_DIR, `${BATCH}.rows.json`);
const CHUNK_SIZE = 450;

const STYLE_FIELDS = ["style", "subgenre", "sub_genre", "genre", "primary_genre", "main_style", "suggested_subgenre"];
const ARTIST_FIELDS = ["artist", "artist_name", "name", "project", "dj", "act"];
const SONG_FIELDS = ["song", "track", "track_name", "title", "faixa", "music"];
const COUNTRY_FIELDS = ["country", "origin_country", "artist_country", "pais", "nacionalidade"];
const CITY_FIELDS = ["city", "origin_city", "state", "region", "area", "cidade"];
const BIO_FIELDS = ["artist_bio", "bio", "description", "about", "resumo"];
const GENRE_FIELDS = ["artist_genre", "artist_style", "artist_category"];
const HINT_FIELDS = ["artist_profile_hint", "profile_hint", "notes", "source_note"];
const LABEL_FIELDS = ["label", "record_label", "release_label", "album", "imprint", "source_album"];
const BPM_FIELDS = ["bpm_exact", "bpm", "tempo", "tempo_bpm", "track_bpm", "tempo_profile", "bpm_guide", "bpm_text"];
const PREVIEW_FIELDS = ["preview_url", "preview", "audio_preview", "deezer_preview_url"];
const RELEASE_FIELDS = ["release_date", "date", "released", "year"];
const DURATION_FIELDS = ["duration_sec", "duration_seconds", "duration", "duration_text"];
const SOURCE_FIELDS = ["source", "batch", "source_type"];
const SOURCE_URL_FIELDS = [
  "source_url",
  "source_anchor_url",
  "track_url",
  "bandcamp_track_url",
  "bandcamp_url",
  "youtube_track_url",
  "youtube_url",
  "soundcloud_track_url",
  "soundcloud_url",
  "deezer_track_url",
  "spotify_url",
  "beatport_url"
];

const METADATA_FIELDS = [
  "source_note",
  "source_type",
  "source_tags",
  "source_anchor",
  "source_anchor_url",
  "track_url",
  "external_track_id",
  "bandcamp_track_id",
  "bandcamp_id",
  "bandcamp_embed_id",
  "deezer_track_id",
  "deezer_track_url",
  "deezer_artist_id",
  "spotify_url",
  "youtube_url",
  "youtube_track_url",
  "soundcloud_url",
  "soundcloud_track_url",
  "bandcamp_url",
  "bandcamp_track_url",
  "beatport_url",
  "primary_social_url",
  "social_discovery_links",
  "label_links",
  "cover_art_url",
  "album_keywords",
  "energy_band",
  "catalog_role",
  "scene_role",
  "confidence",
  "links_status",
  "profile_tracks",
  "source_album",
  "source_album_url",
  "release_precision"
];

function readText(filePath) {
  return fs.existsSync(filePath) ? fs.readFileSync(filePath, "utf8") : "";
}

function normalize(value = "") {
  return String(value || "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/&/g, " and ")
    .replace(/[^a-z0-9]+/g, " ")
    .trim()
    .replace(/\s+/g, " ");
}

function compactKey(value = "") {
  return normalize(value).replace(/\s+/g, "");
}

function findLiteralStart(source, name) {
  const declarationIndex = source.indexOf(`const ${name} =`);
  if (declarationIndex < 0) throw new Error(`Bloco ${name} nao encontrado`);
  const afterEquals = source.indexOf("=", declarationIndex);
  const firstValueMatch = source.slice(afterEquals + 1).match(/\S/);
  const start = afterEquals + 1 + firstValueMatch.index;
  if (source[start] !== "{" && source[start] !== "[") throw new Error(`Bloco ${name} nao e literal composto`);
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
      if (escaped) escaped = false;
      else if (char === "\\") escaped = true;
      else if (char === quote) quote = "";
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
    if (depth === 0) return source.slice(start, index + 1);
  }

  throw new Error(`Nao consegui fechar o bloco ${name}`);
}

function evalConst(source, name) {
  return Function(`return (${extractConstLiteral(source, name)});`)();
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
  const delimiter = (firstLine.match(/;/g) || []).length > (firstLine.match(/,/g) || []).length ? ";" : ",";
  const rows = parseDelimitedRows(safeText, delimiter);
  if (rows.length < 2) return [];
  const headers = rows[0].map((header, index) => normalize(header) || `column_${index}`);
  return rows
    .slice(1)
    .map((cells) => Object.fromEntries(headers.map((header, index) => [header, String(cells[index] || "").trim()])))
    .filter((row) => Object.values(row).some((value) => String(value || "").trim()));
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

function jsonRows(payload) {
  if (Array.isArray(payload)) return payload;
  if (!payload || typeof payload !== "object") return [];
  for (const key of ["rows", "artists", "tracks", "items", "data"]) {
    if (Array.isArray(payload[key])) return payload[key];
  }
  return [];
}

function rowValue(row, fields) {
  for (const field of fields) {
    if (row[field] !== undefined && row[field] !== null && String(row[field]).trim()) return String(row[field]).trim();
    const wanted = normalize(field);
    const foundKey = Object.keys(row).find((key) => normalize(key) === wanted);
    if (foundKey && String(row[foundKey] ?? "").trim()) return String(row[foundKey]).trim();
  }
  return "";
}

function normalizeStyle(value, aliases, knownStyles) {
  const raw = String(value || "").trim();
  if (!raw) return "";
  if (knownStyles.has(raw)) return raw;
  const compact = compactKey(raw);
  const spaced = normalize(raw);
  const underscored = spaced.replace(/\s+/g, "_");
  return aliases[compact] || aliases[spaced] || aliases[underscored] || (knownStyles.has(underscored) ? underscored : "");
}

function numericValue(value) {
  const direct = Number(String(value || "").replace(",", ".").trim());
  if (Number.isFinite(direct)) return direct;
  const match = String(value || "").match(/(\d{2,3})(?:\.\d+)?/);
  return match ? Number(match[1]) : null;
}

function bpmValue(value) {
  const bpm = numericValue(value);
  return bpm && bpm >= 30 ? bpm : null;
}

function durationSeconds(value) {
  const text = String(value || "").trim();
  const clock = text.match(/^(\d{1,2}):(\d{2})(?::(\d{2}))?$/);
  if (clock) {
    const hours = clock[3] ? Number(clock[1]) : 0;
    const minutes = clock[3] ? Number(clock[2]) : Number(clock[1]);
    const seconds = Number(clock[3] || clock[2]);
    return (hours * 3600) + (minutes * 60) + seconds;
  }
  const duration = numericValue(text);
  return duration && duration > 0 ? duration : null;
}

function dateValue(value) {
  const text = String(value || "").trim();
  if (!text) return "";
  const year = text.match(/^\d{4}$/);
  if (year) return `${year[0]}-01-01`;
  const iso = text.match(/^(\d{4})-(\d{2})-(\d{2})/);
  return iso ? iso[0] : "";
}

function statusValue(value) {
  const status = String(value || "").trim();
  return ["published", "draft", "needs_review", "hidden"].includes(status) ? status : "published";
}

function sourceName(row, relativeFile) {
  return rowValue(row, SOURCE_FIELDS) || path.basename(relativeFile, path.extname(relativeFile));
}

function parseUrl(value = "") {
  const raw = String(value || "").trim();
  if (!raw) return null;
  try {
    return new URL(/^https?:\/\//i.test(raw) ? raw : `https://${raw}`);
  } catch (_error) {
    return null;
  }
}

function isSearchLikeUrl(value = "") {
  const parsed = parseUrl(value);
  if (!parsed) return /\b(search|results)\b|search_query=|\bq=/.test(String(value || "").toLowerCase());
  const path = String(parsed.pathname || "").toLowerCase();
  const search = String(parsed.search || "").toLowerCase();
  return path.includes("/search") || path.includes("/results") || search.includes("search_query=") || search.includes("q=");
}

function isDirectYouTubeUrl(value = "") {
  if (!value || isSearchLikeUrl(value)) return false;
  const parsed = parseUrl(value);
  if (!parsed) return false;
  const host = parsed.hostname.replace(/^www\./, "").toLowerCase();
  if (!/(^|\.)youtube\.com$|youtu\.be$/.test(host)) return false;
  const path = String(parsed.pathname || "").toLowerCase();
  return Boolean(parsed.searchParams.get("v") || host === "youtu.be" || /\/(embed|shorts|live)\//.test(path));
}

function isDirectSoundCloudTrackUrl(value = "") {
  if (!value || isSearchLikeUrl(value)) return false;
  const parsed = parseUrl(value);
  if (!parsed) return false;
  const host = parsed.hostname.replace(/^www\./, "").toLowerCase();
  if (!host.endsWith("soundcloud.com")) return false;
  const parts = String(parsed.pathname || "").split("/").map((part) => part.trim()).filter(Boolean);
  if (parts.length < 2) return false;
  return !["search", "discover", "you", "stream", "charts", "upload", "sets"].includes(parts[0]) && parts[1] !== "sets";
}

function metadataText(metadata = {}, key = "") {
  const value = metadata?.[key];
  if (Array.isArray(value)) return value.map((item) => String(item || "").trim()).filter(Boolean).join(";");
  if (value && typeof value === "object") return "";
  return String(value ?? "").trim();
}

function playableUrlCandidates(trackRow = {}) {
  const metadata = trackRow.metadata || {};
  return [
    trackRow.source_url,
    metadataText(metadata, "track_url"),
    metadataText(metadata, "source_anchor_url"),
    metadataText(metadata, "source_album_url"),
    metadataText(metadata, "youtube_track_url"),
    metadataText(metadata, "youtube_url"),
    metadataText(metadata, "soundcloud_track_url"),
    metadataText(metadata, "soundcloud_url"),
    metadataText(metadata, "bandcamp_track_url"),
    metadataText(metadata, "bandcamp_url")
  ].map((url) => String(url || "").trim()).filter(Boolean);
}

function bandcampTrackIdFromMetadata(metadata = {}) {
  return String(
    metadataText(metadata, "bandcamp_track_id") ||
    metadataText(metadata, "bandcamp_id") ||
    metadataText(metadata, "bandcamp_embed_id") ||
    ""
  ).replace(/[^\d]/g, "").trim();
}

function playableSourcesForTrackRow(trackRow = {}) {
  const sources = new Set();
  const metadata = trackRow.metadata || {};
  const urls = playableUrlCandidates(trackRow);
  if (String(trackRow.preview_url || "").trim()) sources.add("audio_preview");
  if (urls.some((url) => isDirectYouTubeUrl(url))) sources.add("youtube_embed");
  if (urls.some((url) => isDirectSoundCloudTrackUrl(url))) sources.add("soundcloud_embed");
  if (bandcampTrackIdFromMetadata(metadata)) sources.add("bandcamp_embed");
  return [...sources];
}

function metadataFor(row, relativeFile) {
  const metadata = { batch: BATCH, source_file: relativeFile };
  METADATA_FIELDS.forEach((field) => {
    const value = rowValue(row, [field]);
    if (value) metadata[field] = value;
  });
  return metadata;
}

function sqlLiteral(value) {
  if (value === null || value === undefined || value === "") return "null";
  if (typeof value === "number" && Number.isFinite(value)) return String(value);
  return `'${String(value).replace(/'/g, "''")}'`;
}

function sqlJson(value) {
  return `${sqlLiteral(JSON.stringify(value))}::jsonb`;
}

function sqlValues(row, fields) {
  return `(${fields.map((field) => field === "metadata" ? sqlJson(row[field]) : sqlLiteral(row[field])).join(", ")})`;
}

function chunks(items, size) {
  const result = [];
  for (let index = 0; index < items.length; index += size) result.push(items.slice(index, index + size));
  return result;
}

function collectDataFiles(configuredFiles) {
  const files = new Set(configuredFiles.filter((file) => /\.(csv|json|jsonl)$/i.test(file)));
  if (fs.existsSync(DATA_DIR)) {
    fs.readdirSync(DATA_DIR)
      .filter((file) => /\.(csv|json|jsonl)$/i.test(file))
      .forEach((file) => files.add(path.join("data", file)));
  }
  const packDir = path.join(DATA_DIR, "codex_dataset_pack_v14");
  if (fs.existsSync(packDir)) {
    fs.readdirSync(packDir)
      .filter((file) => /\.(csv|json|jsonl)$/i.test(file))
      .forEach((file) => files.add(path.join("data", "codex_dataset_pack_v14", file)));
  }
  const packDataDir = path.join(packDir, "data");
  if (fs.existsSync(packDataDir)) {
    fs.readdirSync(packDataDir)
      .filter((file) => /\.(csv|json|jsonl)$/i.test(file))
      .forEach((file) => files.add(path.join("data", "codex_dataset_pack_v14", "data", file)));
  }
  return [...files].sort();
}

function readRows(relativeFile) {
  const filePath = path.join(ROOT, relativeFile);
  if (!fs.existsSync(filePath)) return [];
  const lower = relativeFile.toLowerCase();
  const content = readText(filePath);
  if (lower.endsWith(".csv")) return parseCsvRecords(content);
  if (lower.endsWith(".jsonl")) return parseJsonlRecords(content);
  if (lower.endsWith(".json")) {
    try {
      return jsonRows(JSON.parse(content));
    } catch (_error) {
      return [];
    }
  }
  return [];
}

function toArtistRow(row, relativeFile, style, artist, trackRow = null) {
  const country = rowValue(row, COUNTRY_FIELDS);
  const city = rowValue(row, CITY_FIELDS);
  const artistBio = rowValue(row, BIO_FIELDS) || trackRow?.artist_bio || "";
  const artistGenre = rowValue(row, GENRE_FIELDS) || trackRow?.artist_genre || style.replace(/_/g, " ");
  const artistProfileHint = rowValue(row, HINT_FIELDS) || trackRow?.artist_profile_hint || "";
  return {
    style,
    artist,
    country,
    city,
    artist_bio: artistBio,
    artist_genre: artistGenre,
    artist_profile_hint: artistProfileHint,
    source: sourceName(row, relativeFile),
    source_url: rowValue(row, SOURCE_URL_FIELDS),
    status: statusValue(rowValue(row, ["status"])),
    metadata: metadataFor(row, relativeFile)
  };
}

function toTrackRow(row, relativeFile, style, artist, song) {
  const bpm = bpmValue(rowValue(row, BPM_FIELDS));
  return {
    style,
    artist,
    song,
    label: rowValue(row, LABEL_FIELDS),
    bpm_exact: bpm,
    preview_url: rowValue(row, PREVIEW_FIELDS),
    release_date: dateValue(rowValue(row, RELEASE_FIELDS)),
    duration_sec: durationSeconds(rowValue(row, DURATION_FIELDS)),
    country: rowValue(row, COUNTRY_FIELDS),
    city: rowValue(row, CITY_FIELDS),
    artist_bio: rowValue(row, BIO_FIELDS),
    artist_genre: rowValue(row, GENRE_FIELDS) || style.replace(/_/g, " "),
    artist_profile_hint: rowValue(row, HINT_FIELDS),
    source: sourceName(row, relativeFile),
    source_url: rowValue(row, SOURCE_URL_FIELDS),
    status: statusValue(rowValue(row, ["status"])),
    metadata: metadataFor(row, relativeFile)
  };
}

function applyTrackValidation(trackRow, styleRules) {
  const rule = styleRules[trackRow.style];
  const playableSources = playableSourcesForTrackRow(trackRow);
  trackRow.metadata = {
    ...(trackRow.metadata || {}),
    playback_policy: "published_requires_in_app_playback",
    playable_sources: playableSources
  };

  const addValidationIssue = (code, extra = {}) => {
    const currentIssues = Array.isArray(trackRow.metadata.validation_issues)
      ? trackRow.metadata.validation_issues.map((item) => String(item || "").trim()).filter(Boolean)
      : [];
    const issues = [...new Set([...currentIssues, code])];
    trackRow.metadata = {
      ...(trackRow.metadata || {}),
      ...extra,
      validation_status: issues.length === 1 ? issues[0] : "multiple_issues",
      validation_issues: issues
    };
    if (trackRow.status !== "hidden") trackRow.status = "needs_review";
  };

  if (!playableSources.length) {
    addValidationIssue("missing_in_app_playback_path", {
      playback_requirement: "preview_url_or_direct_youtube_soundcloud_bandcamp_embed"
    });
  }

  if (trackRow.bpm_exact === null || trackRow.bpm_exact === undefined || trackRow.bpm_exact === "") return trackRow;
  const bpm = Number(trackRow.bpm_exact);
  if (!rule || !Number.isFinite(bpm)) return trackRow;
  if (bpm < rule.min || bpm > rule.max) {
    addValidationIssue("bpm_out_of_style_range", {
      expected_bpm_range: `${rule.min}-${rule.max}`,
      observed_bpm: bpm
    });
  }
  return trackRow;
}

function upsertMap(map, key, next) {
  const current = map.get(key);
  if (!current) {
    map.set(key, next);
    return;
  }
  Object.keys(next).forEach((field) => {
    if ((current[field] === "" || current[field] === null || current[field] === undefined) && next[field]) {
      current[field] = next[field];
    }
  });
  current.metadata = { ...(current.metadata || {}), ...(next.metadata || {}) };
  if (current.status !== "published" && next.status === "published") current.status = "published";
}

function buildInsert({ table, columns, rows, conflict, updateSql }) {
  return chunks(rows, CHUNK_SIZE).map((chunk, index) => `-- ${table} chunk ${index + 1}/${Math.ceil(rows.length / CHUNK_SIZE)}
insert into public.${table} as ${table} (
  ${columns.join(",\n  ")}
) values
${chunk.map((row) => sqlValues(row, columns)).join(",\n")}
on conflict ${conflict} do update set
${updateSql};
`).join("\n");
}

function main() {
  const appSource = readText(APP_PATH);
  const configuredFiles = evalConst(appSource, "EXTERNAL_DATASET_FILES");
  const aliases = evalConst(appSource, "DATASET_STYLE_ALIASES");
  const styleRules = evalConst(appSource, "STYLE_BPM_RULES");
  const knownStyles = new Set(Object.keys(styleRules));
  const files = collectDataFiles(configuredFiles);
  const artists = new Map();
  const tracks = new Map();
  const skipped = { noArtist: 0, noStyle: 0, noSongForTrack: 0 };

  files.forEach((relativeFile) => {
    readRows(relativeFile).forEach((row) => {
      const artist = rowValue(row, ARTIST_FIELDS);
      if (!artist) {
        skipped.noArtist += 1;
        return;
      }
      const style = normalizeStyle(rowValue(row, STYLE_FIELDS), aliases, knownStyles);
      if (!style) {
        skipped.noStyle += 1;
        return;
      }
      const song = rowValue(row, SONG_FIELDS);
      const trackRow = song ? toTrackRow(row, relativeFile, style, artist, song) : null;
      const artistRow = toArtistRow(row, relativeFile, style, artist, trackRow);
      upsertMap(artists, `${style}::${normalize(artist)}`, artistRow);
      if (!song) {
        skipped.noSongForTrack += 1;
        return;
      }
      upsertMap(tracks, `${style}::${normalize(artist)}::${normalize(song)}`, trackRow);
    });
  });

  const artistRows = [...artists.values()].sort((a, b) => `${a.style} ${a.artist}`.localeCompare(`${b.style} ${b.artist}`));
  const trackRows = [...tracks.values()]
    .map((row) => applyTrackValidation(row, styleRules))
    .sort((a, b) => `${a.style} ${a.artist} ${a.song}`.localeCompare(`${b.style} ${b.artist} ${b.song}`));
  const artistColumns = ["style", "artist", "country", "city", "artist_bio", "artist_genre", "artist_profile_hint", "source", "source_url", "status", "metadata"];
  const trackColumns = ["style", "artist", "song", "label", "bpm_exact", "preview_url", "release_date", "duration_sec", "country", "city", "artist_bio", "artist_genre", "artist_profile_hint", "source", "source_url", "status", "metadata"];
  const sql = [
    `-- Sonic Search catalog extra bulk import.\n-- Generated from local data files.\n-- Batch: ${BATCH}\n-- Run after supabase/migrations/20260619024500_catalog_extra.sql.\n`,
    buildInsert({
      table: "catalog_artists",
      columns: artistColumns,
      rows: artistRows,
      conflict: "(style, artist_key)",
      updateSql: [
        "  country = coalesce(excluded.country, catalog_artists.country)",
        "  city = coalesce(excluded.city, catalog_artists.city)",
        "  artist_bio = coalesce(excluded.artist_bio, catalog_artists.artist_bio)",
        "  artist_genre = coalesce(excluded.artist_genre, catalog_artists.artist_genre)",
        "  artist_profile_hint = coalesce(excluded.artist_profile_hint, catalog_artists.artist_profile_hint)",
        "  source = excluded.source",
        "  source_url = coalesce(excluded.source_url, catalog_artists.source_url)",
        "  status = case when catalog_artists.status = 'published' and excluded.status <> 'hidden' then catalog_artists.status else excluded.status end",
        "  metadata = coalesce(catalog_artists.metadata, '{}'::jsonb) || excluded.metadata",
        "  updated_at = now()"
      ].join(",\n")
    }),
    buildInsert({
      table: "catalog_tracks",
      columns: trackColumns,
      rows: trackRows,
      conflict: "(style, track_key)",
      updateSql: [
        "  label = coalesce(excluded.label, catalog_tracks.label)",
        "  bpm_exact = coalesce(excluded.bpm_exact, catalog_tracks.bpm_exact)",
        "  preview_url = coalesce(excluded.preview_url, catalog_tracks.preview_url)",
        "  release_date = coalesce(excluded.release_date, catalog_tracks.release_date)",
        "  duration_sec = coalesce(excluded.duration_sec, catalog_tracks.duration_sec)",
        "  country = coalesce(excluded.country, catalog_tracks.country)",
        "  city = coalesce(excluded.city, catalog_tracks.city)",
        "  artist_bio = coalesce(excluded.artist_bio, catalog_tracks.artist_bio)",
        "  artist_genre = coalesce(excluded.artist_genre, catalog_tracks.artist_genre)",
        "  artist_profile_hint = coalesce(excluded.artist_profile_hint, catalog_tracks.artist_profile_hint)",
        "  source = excluded.source",
        "  source_url = coalesce(excluded.source_url, catalog_tracks.source_url)",
        "  status = case when catalog_tracks.status = 'hidden' then catalog_tracks.status else excluded.status end",
        "  metadata = coalesce(catalog_tracks.metadata, '{}'::jsonb) || excluded.metadata",
        "  updated_at = now()"
      ].join(",\n")
    })
  ].join("\n");

  const byStyle = trackRows.reduce((acc, row) => {
    acc[row.style] = acc[row.style] || { tracks: 0, artists: 0 };
    acc[row.style].tracks += 1;
    return acc;
  }, {});
  artistRows.forEach((row) => {
    byStyle[row.style] = byStyle[row.style] || { tracks: 0, artists: 0 };
    byStyle[row.style].artists += 1;
  });
  const playback = trackRows.reduce((acc, row) => {
    const sources = Array.isArray(row.metadata?.playable_sources) ? row.metadata.playable_sources : [];
    if (!sources.length) acc.missingPlayback += 1;
    if (row.status === "published" && sources.length) acc.publishedPlayable += 1;
    if (row.status === "published" && !sources.length) acc.publishedWithoutPlayback += 1;
    sources.forEach((source) => {
      acc.bySource[source] = (acc.bySource[source] || 0) + 1;
    });
    return acc;
  }, {
    publishedPlayable: 0,
    publishedWithoutPlayback: 0,
    missingPlayback: 0,
    bySource: {}
  });

  fs.mkdirSync(SEED_DIR, { recursive: true });
  fs.mkdirSync(REPORT_DIR, { recursive: true });
  fs.writeFileSync(SQL_OUT, sql, "utf8");
  fs.writeFileSync(REPORT_OUT, `${JSON.stringify({
    batch: BATCH,
    generatedAt: new Date().toISOString(),
    files,
    outputSql: path.relative(ROOT, SQL_OUT),
    artists: artistRows.length,
    tracks: trackRows.length,
    publishedTracks: trackRows.filter((row) => row.status === "published").length,
    reviewTracks: trackRows.filter((row) => row.status === "needs_review").length,
    playback,
    styles: Object.keys(byStyle).length,
    byStyle,
    skipped
  }, null, 2)}\n`, "utf8");
  fs.writeFileSync(ROWS_OUT, `${JSON.stringify({
    batch: BATCH,
    generatedAt: new Date().toISOString(),
    artists: artistRows,
    tracks: trackRows
  }, null, 2)}\n`, "utf8");

  console.log(`Generated ${path.relative(ROOT, SQL_OUT)}`);
  console.log(`Generated ${path.relative(ROOT, ROWS_OUT)}`);
  console.log(`${trackRows.length} tracks, ${artistRows.length} artists, ${Object.keys(byStyle).length} styles.`);
}

main();
