import { mkdir, readFile, stat, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { CATALOG_RUNTIME_SOURCE_FILES } from "./catalog-runtime-sources.mjs";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const rootDir = path.resolve(__dirname, "..");
const outputDir = path.join(rootDir, "data", "runtime-catalog-v1");
const CORE_TRACKS_PER_STYLE = 12;

function token(value = "") {
  return String(value || "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "_")
    .replace(/^_+|_+$/g, "");
}

function normalizeStyle(value = "") {
  const raw = token(value);
  const compact = raw.replace(/_/g, "");
  if (!raw) return "";
  if (compact.includes("fullon") && compact.includes("night")) return "full_on_night";
  if (compact.includes("fullon") && compact.includes("morning")) return "full_on_morning";
  if (compact.includes("fullon")) return "full_on";
  if (compact.includes("hitech")) return "hi_tech";
  if (compact.includes("psycore")) return "psycore";
  if (compact.includes("slambient")) return "slambient";
  if (compact.includes("darkexperimental")) return "dark_experimental";
  if (compact.includes("darkprogressive")) return "dark_progressive";
  if (compact.includes("darkpsy")) return "dark_psy";
  if (compact.includes("forest")) return "forest_psy";
  if (compact.includes("progressivepsy")) return "progressive_psy";
  if (compact.includes("acidtechno")) return "acid_techno";
  if (compact.includes("hardtechno")) return "hard_techno";
  if (compact.includes("minimaltechno")) return "minimal_techno";
  if (compact.includes("melodictechno")) return "melodic_techno";
  if (compact.includes("industrialtechno")) return "industrial_techno";
  if (compact.includes("peaktimetechno")) return "peak_time_techno";
  if (compact.includes("deeptechno")) return "deep_techno";
  if (compact.includes("ambienttechno")) return "ambient_techno";
  if (compact.includes("bleeptechno")) return "bleep_techno";
  if (compact.includes("tribaltechno")) return "tribal_techno";
  if (compact.includes("hardgroove")) return "hardgroove_techno";
  if (compact.includes("brokentechno") || compact.includes("basstechno")) return "broken_techno";
  if (compact.includes("drumandbass")) return "drum_and_bass";
  if (compact.includes("liquiddnb")) return "liquid_dnb";
  if (compact.includes("jumpup")) return "jump_up";
  if (compact.includes("ukgarage")) return "uk_garage";
  if (compact.includes("futuregarage")) return "future_garage";
  if (compact.includes("goatrance")) return "goa_trance";
  if (compact.includes("upliftingtrance")) return "trance_uplifting";
  if (compact.includes("psytrance") || compact === "psy") return "psytrance";
  return raw;
}

function parseDelimited(text, delimiter = ",") {
  const rows = [];
  let row = [];
  let value = "";
  let quoted = false;
  for (let index = 0; index < text.length; index += 1) {
    const char = text[index];
    if (char === '"') {
      if (quoted && text[index + 1] === '"') {
        value += '"';
        index += 1;
      } else {
        quoted = !quoted;
      }
    } else if (!quoted && char === delimiter) {
      row.push(value);
      value = "";
    } else if (!quoted && (char === "\n" || char === "\r")) {
      if (char === "\r" && text[index + 1] === "\n") index += 1;
      row.push(value);
      if (row.some((cell) => String(cell).trim())) rows.push(row);
      row = [];
      value = "";
    } else {
      value += char;
    }
  }
  row.push(value);
  if (row.some((cell) => String(cell).trim())) rows.push(row);
  return rows;
}

function parseCsv(text) {
  const clean = String(text || "").replace(/^\uFEFF/, "");
  const firstLine = clean.split(/\r?\n/).find((line) => line.trim()) || "";
  const delimiter = (firstLine.match(/;/g) || []).length > (firstLine.match(/,/g) || []).length ? ";" : ",";
  const rows = parseDelimited(clean, delimiter);
  if (rows.length < 2) return [];
  const headers = rows[0].map((header, index) => String(header || "").trim() || `column_${index}`);
  return rows.slice(1).map((cells) => Object.fromEntries(headers.map((header, index) => [header, String(cells[index] || "").trim()])));
}

function rowsFromJson(payload) {
  if (Array.isArray(payload)) return payload;
  if (!payload || typeof payload !== "object") return [];
  for (const key of ["tracks", "songs", "items", "rows", "artists", "data"]) {
    if (Array.isArray(payload[key])) return payload[key];
  }
  return [payload];
}

async function readRows(relativePath) {
  const absolutePath = path.join(rootDir, relativePath);
  const text = await readFile(absolutePath, "utf8");
  if (relativePath.endsWith(".csv")) return parseCsv(text);
  if (relativePath.endsWith(".jsonl")) {
    return text.split(/\r?\n/).map((line) => line.trim()).filter(Boolean).flatMap((line) => {
      try { return rowsFromJson(JSON.parse(line)); } catch { return []; }
    });
  }
  return rowsFromJson(JSON.parse(text));
}

function rowFields(row) {
  return new Map(Object.entries(row || {}).map(([key, value]) => [token(key), value]));
}

function valueFrom(fields, aliases) {
  for (const alias of aliases) {
    const value = fields.get(token(alias));
    if (Array.isArray(value)) {
      const joined = value.map((item) => String(item || "").trim()).filter(Boolean).join("|");
      if (joined) return joined;
    }
    if (value && typeof value === "object") continue;
    const clean = String(value ?? "").trim();
    if (clean) return clean;
  }
  return "";
}

const FIELD_ALIASES = {
  style: ["style", "subgenre", "sub_genre", "genre", "primary_genre", "main_style"],
  artist: ["artist", "artist_name", "name", "project", "dj", "act"],
  song: ["song", "track", "track_name", "title", "faixa", "music"],
  label: ["label", "record_label", "release_label", "album", "imprint"],
  bpm: ["bpm_exact", "bpm", "tempo", "tempo_bpm", "track_bpm", "tempo_profile", "bpm_guide"],
  preview_url: ["preview_url", "preview", "sample_url", "audio_preview"],
  spotify_track_url: ["spotify_track_url", "spotify_url", "spotify", "spotify_link"],
  youtube_track_url: ["youtube_track_url", "youtube_watch_url", "youtube_video_url", "youtube_url", "youtube"],
  soundcloud_track_url: ["soundcloud_track_url", "soundcloud_permalink", "soundcloud_url", "soundcloud"],
  bandcamp_track_url: ["bandcamp_track_url", "bandcamp_track", "bandcamp_url", "bandcamp"],
  bandcamp_track_id: ["bandcamp_track_id", "bandcamp_id", "bandcamp_embed_id"],
  deezer_track_id: ["deezer_track_id", "deezer_id", "deezerTrackId"],
  cover_art_url: ["cover_art_url", "cover_url", "artwork_url", "image_url"],
  release_date: ["release_date", "released", "date", "year", "ano"],
  duration_sec: ["duration_sec", "duration", "duration_seconds", "track_time", "length", "duracao"],
  artist_country: ["artist_country", "country", "origin_country", "pais", "nacionalidade"],
  city: ["city", "origin_city", "state", "region", "area", "cidade"],
  artist_genre: ["artist_genre", "genre_signal", "genre_tags", "tags"],
  artist_profile_hint: ["artist_profile_hint", "profile_hint", "description", "bio", "source_note"],
  confidence: ["confidence", "catalog_confidence", "verification_confidence"],
  source_url: ["source_url", "source_link", "reference_url", "track_url", "track_link"],
  source_tags: ["source_tags", "catalog_tags", "tags"],
  energy: ["energy_band", "energy_profile", "energy"],
  source: ["source", "source_name", "catalog_source"]
};

function compactRow(row, sourceFile) {
  const fields = rowFields(row);
  const output = Object.fromEntries(Object.entries(FIELD_ALIASES).map(([key, aliases]) => [key, valueFrom(fields, aliases)]));
  output.style = normalizeStyle(output.style);
  output.source = output.source || path.basename(sourceFile);
  if (!output.style || !output.artist || !output.song) return null;
  if (!(output.preview_url || output.deezer_track_id || output.bandcamp_track_id || output.bandcamp_track_url || output.soundcloud_track_url || output.youtube_track_url)) return null;
  return Object.fromEntries(Object.entries(output).filter(([, value]) => String(value || "").trim()));
}

function playbackScore(row) {
  return Number(Boolean(row.preview_url)) * 10 +
    Number(Boolean(row.bandcamp_track_id || row.bandcamp_track_url)) * 6 +
    Number(Boolean(row.soundcloud_track_url)) * 5 +
    Number(Boolean(row.youtube_track_url)) * 4 +
    Number(Boolean(row.deezer_track_id)) * 3 +
    Number(Boolean(row.bpm)) * 2 +
    Number(Boolean(row.cover_art_url));
}

function mergeRows(current, candidate) {
  const preferred = playbackScore(candidate) > playbackScore(current) ? candidate : current;
  const secondary = preferred === candidate ? current : candidate;
  return Object.fromEntries(
    Array.from(new Set([...Object.keys(preferred), ...Object.keys(secondary)]))
      .map((key) => [key, preferred[key] || secondary[key]])
  );
}

export async function buildRuntimeCatalog() {
  const deduped = new Map();
  let sourceBytes = 0;
  let sourcesRead = 0;
  for (const sourceFile of CATALOG_RUNTIME_SOURCE_FILES) {
    try {
      sourceBytes += (await stat(path.join(rootDir, sourceFile))).size;
      const rows = await readRows(sourceFile);
      sourcesRead += 1;
      for (const row of rows) {
        const compact = compactRow(row, sourceFile);
        if (!compact) continue;
        const key = `${token(compact.style)}::${token(compact.artist)}::${token(compact.song)}`;
        deduped.set(key, deduped.has(key) ? mergeRows(deduped.get(key), compact) : compact);
      }
    } catch (error) {
      if (error?.code !== "ENOENT") throw error;
    }
  }

  const byStyle = new Map();
  for (const row of deduped.values()) {
    if (!byStyle.has(row.style)) byStyle.set(row.style, []);
    byStyle.get(row.style).push(row);
  }
  for (const rows of byStyle.values()) {
    rows.sort((a, b) => playbackScore(b) - playbackScore(a) || a.artist.localeCompare(b.artist) || a.song.localeCompare(b.song));
  }

  await mkdir(path.join(outputDir, "styles"), { recursive: true });
  const manifest = { version: 1, core: "core.json", styles: {}, counts: {} };
  const core = [];
  let runtimeBytes = 0;
  for (const [style, rows] of Array.from(byStyle.entries()).sort(([a], [b]) => a.localeCompare(b))) {
    const fileName = `${token(style)}.json`;
    const payload = `${JSON.stringify(rows)}\n`;
    await writeFile(path.join(outputDir, "styles", fileName), payload);
    runtimeBytes += Buffer.byteLength(payload);
    manifest.styles[style] = `styles/${fileName}`;
    manifest.counts[style] = rows.length;
    core.push(...rows.slice(0, CORE_TRACKS_PER_STYLE));
  }
  const corePayload = `${JSON.stringify(core)}\n`;
  await writeFile(path.join(outputDir, "core.json"), corePayload);
  runtimeBytes += Buffer.byteLength(corePayload);
  await writeFile(path.join(outputDir, "manifest.json"), `${JSON.stringify(manifest, null, 2)}\n`);

  const summary = {
    sourcesRead,
    sourceBytes,
    tracks: deduped.size,
    styles: byStyle.size,
    coreTracks: core.length,
    runtimeBytes
  };
  console.log(`Built runtime catalog: ${summary.tracks} tracks, ${summary.styles} styles, ${summary.coreTracks} core tracks.`);
  return summary;
}

if (path.resolve(process.argv[1] || "") === fileURLToPath(import.meta.url)) {
  await buildRuntimeCatalog();
}
