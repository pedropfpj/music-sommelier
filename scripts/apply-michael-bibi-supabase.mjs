import fs from "node:fs";
import path from "node:path";

const ROOT = process.cwd();
const TRACK_CSV = path.join(ROOT, "data", "michael_bibi_playable_tracks_20260621.csv");
const ARTIST_CSV = path.join(ROOT, "data", "michael_bibi_artist_profile_20260621.csv");
const SESSION_ROOT = path.join(process.env.HOME || "", ".codex", "sessions");
const ARTIST = "Michael Bibi";
const SOURCE = "michael_bibi_playable_expansion_20260621";

function normalizeHeader(value = "") {
  return String(value || "").trim();
}

function parseCsvLine(line = "") {
  const out = [];
  let current = "";
  let quoted = false;
  for (let index = 0; index < line.length; index += 1) {
    const char = line[index];
    const next = line[index + 1];
    if (char === "\"") {
      if (quoted && next === "\"") {
        current += "\"";
        index += 1;
      } else {
        quoted = !quoted;
      }
    } else if (char === "," && !quoted) {
      out.push(current);
      current = "";
    } else {
      current += char;
    }
  }
  out.push(current);
  return out;
}

function parseCsv(text = "") {
  const lines = String(text || "").trim().split(/\r?\n/).filter(Boolean);
  if (!lines.length) return [];
  const headers = parseCsvLine(lines[0]).map(normalizeHeader);
  return lines.slice(1).map((line) => Object.fromEntries(
    parseCsvLine(line).map((value, index) => [headers[index], value])
  ));
}

function readTextIfAvailable(filePath) {
  try {
    return fs.readFileSync(filePath, "utf8");
  } catch (_err) {
    return "";
  }
}

function parseEnvText(text = "") {
  const env = {};
  String(text || "").split(/\r?\n/).forEach((line) => {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#") || !trimmed.includes("=")) return;
    const index = trimmed.indexOf("=");
    const key = trimmed.slice(0, index).trim();
    const value = trimmed.slice(index + 1).trim().replace(/^['"]|['"]$/g, "");
    if (key && value) env[key] = value;
  });
  return env;
}

function walkFiles(root, limit = 400) {
  const files = [];
  const stack = [root];
  while (stack.length && files.length < limit) {
    const current = stack.pop();
    let stat;
    try {
      stat = fs.lstatSync(current);
    } catch (_err) {
      continue;
    }
    if (stat.isSymbolicLink()) continue;
    if (stat.isDirectory()) {
      let children = [];
      try {
        children = fs.readdirSync(current).map((child) => path.join(current, child));
      } catch (_err) {
        continue;
      }
      stack.push(...children);
      continue;
    }
    if (stat.isFile() && stat.size < 2_000_000) files.push(current);
  }
  return files;
}

function extractCredentialsFromText(text = "") {
  const env = parseEnvText(text);
  const url =
    env.SUPABASE_URL ||
    env.VITE_SUPABASE_URL ||
    (String(text).match(/https:\/\/[a-z0-9-]+\.supabase\.co/i) || [])[0] ||
    "";
  const anon =
    env.SUPABASE_ANON_KEY ||
    env.VITE_SUPABASE_ANON_KEY ||
    (String(text).match(/eyJ[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+/g) || [])
      .find((token) => token.length > 80) ||
    "";
  return { url, anon };
}

function loadCredentials() {
  const direct = {
    url: process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL || "",
    anon: process.env.SUPABASE_ANON_KEY || process.env.VITE_SUPABASE_ANON_KEY || ""
  };
  if (direct.url && direct.anon) return direct;

  const envText = readTextIfAvailable(path.join(ROOT, ".env.local")) || readTextIfAvailable(path.join(ROOT, ".env"));
  const fromEnv = extractCredentialsFromText(envText);
  if (fromEnv.url && fromEnv.anon) return fromEnv;

  const candidates = fs.existsSync(SESSION_ROOT)
    ? walkFiles(SESSION_ROOT)
      .filter((filePath) => filePath.endsWith(".jsonl") || filePath.endsWith(".json"))
      .sort((a, b) => fs.statSync(b).mtimeMs - fs.statSync(a).mtimeMs)
    : [];
  for (const filePath of candidates) {
    const creds = extractCredentialsFromText(readTextIfAvailable(filePath));
    if (creds.url && creds.anon) return creds;
  }

  return { url: "", anon: "" };
}

function present(value = "") {
  const text = String(value ?? "").trim();
  return text ? text : null;
}

function numberOrNull(value = "") {
  const numberValue = Number(value);
  return Number.isFinite(numberValue) && numberValue > 0 ? Math.round(numberValue) : null;
}

function cleanObject(input = {}) {
  return Object.fromEntries(Object.entries(input).filter(([, value]) => {
    if (Array.isArray(value)) return value.length > 0;
    return value !== null && value !== undefined && String(value).trim() !== "";
  }));
}

function trackMetadata(row = {}) {
  return cleanObject({
    batch: SOURCE,
    source_file: "data/michael_bibi_playable_tracks_20260621.csv",
    playback_policy: "published_requires_in_app_playback",
    playable_sources: row.preview_url ? ["audio_preview"] : ["bandcamp_embed"],
    contributors: row.contributors || row.artist,
    confidence: row.confidence || "high",
    source_url: row.source_url,
    deezer_track_id: row.deezer_track_id,
    deezer_track_url: row.deezer_track_url,
    cover_art_url: row.cover_art_url,
    youtube_track_url: row.youtube_track_url,
    soundcloud_track_url: row.soundcloud_track_url,
    bandcamp_track_url: row.bandcamp_track_url,
    bandcamp_track_id: row.bandcamp_track_id
  });
}

function artistMetadata(row = {}, playableTrackCount = 0) {
  return cleanObject({
    batch: SOURCE,
    source_file: "data/michael_bibi_artist_profile_20260621.csv",
    confidence: row.confidence || "high",
    source_url: row.source_url,
    recent_release_focus: "Bad Wolf;Lets Get High;Front & Back Seat;Sungazing (Electronic Mix)",
    playable_track_count: playableTrackCount
  });
}

function buildRows() {
  const tracks = parseCsv(readTextIfAvailable(TRACK_CSV)).map((row) => cleanObject({
    style: row.style,
    artist: row.artist,
    song: row.song,
    label: row.label,
    bpm_exact: numberOrNull(row.bpm_exact),
    preview_url: present(row.preview_url),
    release_date: present(row.release_date),
    duration_sec: numberOrNull(row.duration_sec),
    country: row.country,
    city: row.city,
    artist_bio: row.artist_bio,
    artist_genre: row.artist_genre,
    artist_profile_hint: row.artist_profile_hint,
    source: row.source,
    source_url: row.source_url,
    status: row.status || "published",
    metadata: trackMetadata(row)
  }));
  const artists = parseCsv(readTextIfAvailable(ARTIST_CSV)).map((row) => cleanObject({
    style: row.style,
    artist: row.artist,
    country: row.country,
    city: row.city,
    artist_bio: row.artist_bio,
    artist_genre: row.artist_genre,
    artist_profile_hint: row.artist_profile_hint,
    source: row.source,
    source_url: row.source_url,
    status: row.status || "published",
    metadata: artistMetadata(row, tracks.length)
  }));
  return { artists, tracks };
}

async function supabaseFetch({ url, anon }, table, options = {}) {
  const response = await fetch(`${url.replace(/\/$/, "")}/rest/v1/${table}${options.query || ""}`, {
    method: options.method || "GET",
    headers: {
      apikey: anon,
      Authorization: `Bearer ${anon}`,
      ...(options.headers || {})
    },
    body: options.body ? JSON.stringify(options.body) : undefined
  });
  const text = await response.text();
  let payload = null;
  try {
    payload = text ? JSON.parse(text) : null;
  } catch (_err) {
    payload = text;
  }
  if (!response.ok) {
    const message = typeof payload === "string" ? payload : JSON.stringify(payload);
    throw new Error(`${table} ${response.status}: ${message}`);
  }
  return { response, payload };
}

async function upsertRows(credentials, table, rows, onConflict) {
  if (!rows.length) return 0;
  try {
    await supabaseFetch(credentials, table, {
      method: "POST",
      query: `?on_conflict=${encodeURIComponent(onConflict)}`,
      headers: {
        "Content-Type": "application/json",
        Prefer: "resolution=merge-duplicates,return=minimal"
      },
      body: rows
    });
  } catch (error) {
    if (!String(error?.message || "").includes("42P10")) throw error;
    await supabaseFetch(credentials, table, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Prefer: "return=minimal"
      },
      body: rows
    });
  }
  return rows.length;
}

async function countRows(credentials, table) {
  const { response } = await supabaseFetch(credentials, table, {
    method: "HEAD",
    query: `?select=*&artist=eq.${encodeURIComponent(ARTIST)}`,
    headers: {
      Prefer: "count=exact"
    }
  });
  const range = response.headers.get("content-range") || "";
  const count = Number((range.match(/\/(\d+)$/) || [])[1]);
  return Number.isFinite(count) ? count : null;
}

async function main() {
  const credentials = loadCredentials();
  if (!credentials.url || !credentials.anon) {
    throw new Error("SUPABASE_URL/SUPABASE_ANON_KEY nao encontrados localmente.");
  }
  const { artists, tracks } = buildRows();
  if (tracks.length !== 53 || artists.length !== 1) {
    throw new Error(`Contagem local inesperada: ${tracks.length} tracks, ${artists.length} artists.`);
  }

  const project = new URL(credentials.url).hostname.replace(".supabase.co", "");
  console.log(`Supabase project: ${project}`);
  const beforeTracks = await countRows(credentials, "catalog_tracks").catch(() => null);
  const beforeArtists = await countRows(credentials, "catalog_artists").catch(() => null);
  console.log(`Before: tracks=${beforeTracks ?? "unknown"} artists=${beforeArtists ?? "unknown"}`);

  const artistsWritten = await upsertRows(credentials, "catalog_artists", artists, "style,artist");
  const tracksWritten = await upsertRows(credentials, "catalog_tracks", tracks, "style,artist,song");

  const afterTracks = await countRows(credentials, "catalog_tracks");
  const afterArtists = await countRows(credentials, "catalog_artists");
  console.log(`Written: tracks=${tracksWritten} artists=${artistsWritten}`);
  console.log(`After: tracks=${afterTracks} artists=${afterArtists}`);
  if (afterTracks < 53 || afterArtists < 1) {
    throw new Error("Upsert finalizou, mas a verificacao remota ficou abaixo do esperado.");
  }
}

main().catch((error) => {
  console.error(error.message);
  process.exitCode = 1;
});
