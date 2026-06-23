#!/usr/bin/env node
import fs from "node:fs";
import path from "node:path";

const ROOT = process.cwd();
const DATA_DIR = path.join(ROOT, "data");
const REPORT_DIR = path.join(ROOT, "reports");
const SEED_FILE = path.join(ROOT, "supabase", "seeds", "catalog_extra_bulk_local_20260621.sql");
const BATCH = process.env.SONIC_PLAYABLE_BATCH || "catalog_playable_depth_v16_20260622";
const TRACK_OUT = path.join(DATA_DIR, `${BATCH}.csv`);
const REPORT_OUT = path.join(REPORT_DIR, `${BATCH}.json`);

const TARGET_TRACKS_PER_ARTIST = Number(process.env.SONIC_PLAYABLE_TARGET_TRACKS_PER_ARTIST || 10);
const MAX_ARTISTS_TO_QUERY = Number(process.env.SONIC_PLAYABLE_MAX_ARTISTS || 220);
const MAX_NEW_ROWS = Number(process.env.SONIC_PLAYABLE_MAX_ROWS || 650);
const DEEZER_TOP_LIMIT = Number(process.env.SONIC_PLAYABLE_DEEZER_TOP_LIMIT || 50);
const REQUEST_PAUSE_MS = Number(process.env.SONIC_PLAYABLE_REQUEST_PAUSE_MS || 180);
const FOCUS_STYLES = new Set(
  String(process.env.SONIC_PLAYABLE_FOCUS_STYLES || "")
    .split(",")
    .map((style) => style.trim())
    .filter(Boolean)
);

const headers = [
  "style",
  "artist",
  "song",
  "label",
  "bpm_exact",
  "preview_url",
  "release_date",
  "duration_sec",
  "country",
  "city",
  "artist_bio",
  "artist_genre",
  "artist_profile_hint",
  "source",
  "source_url",
  "track_url",
  "deezer_track_id",
  "deezer_track_url",
  "cover_art_url",
  "youtube_track_url",
  "source_type",
  "source_tags",
  "energy_band",
  "catalog_role",
  "status",
  "confidence",
  "source_note"
];

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

function csvCell(value = "") {
  return `"${String(value ?? "").replace(/"/g, "\"\"")}"`;
}

function csvWrite(rows) {
  return [
    headers.map(csvCell).join(","),
    ...rows.map((row) => headers.map((header) => csvCell(row[header] ?? "")).join(","))
  ].join("\n") + "\n";
}

function decodeSqlStringToken(token) {
  let output = "";
  for (let index = 1; index < token.length; index += 1) {
    const char = token[index];
    const next = token[index + 1];
    if (char === "'") {
      if (next === "'") {
        output += "'";
        index += 1;
        continue;
      }
      break;
    }
    output += char;
  }
  return output;
}

function parseSqlToken(token) {
  const value = token.trim();
  if (!value || /^null$/i.test(value)) return "";
  if (value.startsWith("'")) return decodeSqlStringToken(value);
  return value;
}

function parseTupleList(valuesText) {
  const rows = [];
  let inQuote = false;
  let token = "";
  let fields = null;

  for (let index = 0; index < valuesText.length; index += 1) {
    const char = valuesText[index];
    const next = valuesText[index + 1];
    if (!fields) {
      if (char === "(") {
        fields = [];
        token = "";
      }
      continue;
    }
    if (char === "'") {
      token += char;
      if (inQuote && next === "'") {
        token += next;
        index += 1;
        continue;
      }
      inQuote = !inQuote;
      continue;
    }
    if (!inQuote && char === ",") {
      fields.push(parseSqlToken(token));
      token = "";
      continue;
    }
    if (!inQuote && char === ")") {
      fields.push(parseSqlToken(token));
      rows.push(fields);
      fields = null;
      token = "";
      continue;
    }
    token += char;
  }

  return rows;
}

function readSeedTrackRows() {
  if (!fs.existsSync(SEED_FILE)) return [];
  const sql = fs.readFileSync(SEED_FILE, "utf8");
  const rows = [];
  const blockPattern = /insert into public\.catalog_tracks as catalog_tracks \([\s\S]*?\) values\n([\s\S]*?)\non conflict \(style, track_key\)/g;
  let match;
  while ((match = blockPattern.exec(sql))) {
    for (const fields of parseTupleList(match[1])) {
      if (fields.length < 17) continue;
      let metadata = {};
      try {
        metadata = fields[16] ? JSON.parse(fields[16]) : {};
      } catch (_error) {
        metadata = {};
      }
      rows.push({
        style: fields[0],
        artist: fields[1],
        song: fields[2],
        label: fields[3],
        bpm_exact: fields[4],
        preview_url: fields[5],
        release_date: fields[6],
        duration_sec: fields[7],
        country: fields[8],
        city: fields[9],
        artist_bio: fields[10],
        artist_genre: fields[11],
        artist_profile_hint: fields[12],
        source: fields[13],
        source_url: fields[14],
        status: fields[15],
        metadata
      });
    }
  }
  return rows;
}

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function fetchJson(url, retries = 3) {
  for (let attempt = 0; attempt <= retries; attempt += 1) {
    try {
      const response = await fetch(url, {
        headers: { "User-Agent": "SonicSearchPlayableDepthV16/1.0" }
      });
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      return await response.json();
    } catch (_error) {
      if (attempt === retries) return null;
      await sleep(650 + attempt * 950);
    }
  }
  return null;
}

function deezerArtistSearchUrl(artist) {
  const url = new URL("https://api.deezer.com/search/artist");
  url.searchParams.set("q", artist);
  url.searchParams.set("limit", "8");
  return String(url);
}

function deezerArtistTopUrl(id) {
  return `https://api.deezer.com/artist/${encodeURIComponent(id)}/top?limit=${DEEZER_TOP_LIMIT}`;
}

function strictArtistNameMatch(expected, candidate) {
  const expectedKey = normalize(expected);
  const candidateKey = normalize(candidate);
  return Boolean(expectedKey && candidateKey && (expectedKey === candidateKey || compactKey(expectedKey) === compactKey(candidateKey)));
}

function likelyUsableTopTrack(item) {
  const title = String(item?.title_short || item?.title || "").trim();
  const preview = String(item?.preview || "").trim();
  const duration = Number(item?.duration || 0);
  if (!title || !preview.startsWith("http")) return false;
  if (duration && (duration < 45 || duration > 1200)) return false;
  const titleKey = normalize(title);
  const blockedTerms = [
    "interview",
    "commentary",
    "karaoke",
    "tribute",
    "cover version",
    "continuous mix",
    "full album",
    "podcast",
    "skit"
  ];
  return !blockedTerms.some((term) => titleKey.includes(term));
}

function groupKey(row) {
  return `${row.style}::${normalize(row.artist)}`;
}

function trackKey(row) {
  return `${row.style}::${normalize(row.artist)}::${normalize(row.song)}`;
}

function existingGroups(rows) {
  const groups = new Map();
  const seenTracks = new Set();
  for (const row of rows) {
    if (!row.style || !row.artist || !row.song) continue;
    seenTracks.add(trackKey(row));
    const key = groupKey(row);
    if (!groups.has(key)) {
      groups.set(key, {
        style: row.style,
        artist: row.artist,
        country: row.country,
        city: row.city,
        artist_bio: row.artist_bio,
        artist_genre: row.artist_genre,
        artist_profile_hint: row.artist_profile_hint,
        catalog_role: row.metadata?.catalog_role || row.metadata?.energy_band || "",
        tracks: new Set(),
        playable: 0
      });
    }
    const group = groups.get(key);
    group.tracks.add(normalize(row.song));
    if (String(row.preview_url || "").startsWith("http")) group.playable += 1;
  }
  return { groups, seenTracks };
}

function candidateGroups(groups) {
  return [...groups.values()]
    .filter((group) => {
      if (group.tracks.size >= TARGET_TRACKS_PER_ARTIST) return false;
      if (FOCUS_STYLES.size) return FOCUS_STYLES.has(group.style);
      return group.playable > 0;
    })
    .sort((a, b) =>
      a.playable - b.playable ||
      a.tracks.size - b.tracks.size ||
      a.style.localeCompare(b.style) ||
      a.artist.localeCompare(b.artist)
    )
    .slice(0, MAX_ARTISTS_TO_QUERY);
}

async function resolveDeezerArtist(artist) {
  const payload = await fetchJson(deezerArtistSearchUrl(artist));
  const candidates = Array.isArray(payload?.data) ? payload.data : [];
  return candidates.find((candidate) => strictArtistNameMatch(artist, candidate?.name || "")) || null;
}

function rowFromTopTrack(group, item) {
  const title = String(item?.title_short || item?.title || "").trim();
  const deezerUrl = String(item?.link || "").trim();
  const coverArt = String(item?.album?.cover_xl || item?.album?.cover_big || item?.album?.cover_medium || "").trim();
  return {
    style: group.style,
    artist: group.artist,
    song: title,
    label: String(item?.album?.title || "").trim(),
    bpm_exact: "",
    preview_url: String(item?.preview || "").trim(),
    release_date: "",
    duration_sec: String(item?.duration || "").trim(),
    country: group.country || "",
    city: group.city || "",
    artist_bio: group.artist_bio || "",
    artist_genre: group.artist_genre || group.style.replace(/_/g, " "),
    artist_profile_hint: group.artist_profile_hint || `Use ${group.artist} for ${group.style.replace(/_/g, " ")} recommendations with playable previews.`,
    source: BATCH,
    source_url: deezerUrl,
    track_url: deezerUrl,
    deezer_track_id: String(item?.id || "").trim(),
    deezer_track_url: deezerUrl,
    cover_art_url: coverArt,
    youtube_track_url: `https://www.youtube.com/results?search_query=${encodeURIComponent(`${group.artist} ${title}`)}`,
    source_type: "deezer_existing_artist_playable_depth",
    source_tags: [group.style, group.artist_genre || group.style, "playable_depth", BATCH].filter(Boolean).join(";"),
    energy_band: group.catalog_role || "",
    catalog_role: group.catalog_role || "",
    status: "published",
    confidence: "medium_high",
    source_note: FOCUS_STYLES.size
      ? `Playable depth focused batch: Deezer artist top result added for ${[...FOCUS_STYLES].join(", ")} after exact artist-name resolution and preview availability.`
      : "Playable depth v16: Deezer artist top result added only after exact artist-name resolution and preview availability."
  };
}

async function main() {
  const seedRows = readSeedTrackRows();
  const { groups, seenTracks } = existingGroups(seedRows);
  const candidates = candidateGroups(groups);
  const outputRows = [];
  const stats = {
    seedTracks: seedRows.length,
    candidateArtists: candidates.length,
    queriedArtists: 0,
    resolvedArtists: 0,
    addedRows: 0,
    skippedDuplicateTracks: 0,
    skippedWithoutResolution: 0
  };

  for (const group of candidates) {
    if (outputRows.length >= MAX_NEW_ROWS) break;
    stats.queriedArtists += 1;
    const resolved = await resolveDeezerArtist(group.artist);
    await sleep(REQUEST_PAUSE_MS);
    if (!resolved?.id) {
      stats.skippedWithoutResolution += 1;
      continue;
    }
    stats.resolvedArtists += 1;
    const payload = await fetchJson(deezerArtistTopUrl(resolved.id));
    await sleep(REQUEST_PAUSE_MS);
    const topTracks = (Array.isArray(payload?.data) ? payload.data : []).filter(likelyUsableTopTrack);
    for (const item of topTracks) {
      if (outputRows.length >= MAX_NEW_ROWS) break;
      const candidate = rowFromTopTrack(group, item);
      const key = trackKey(candidate);
      if (seenTracks.has(key)) {
        stats.skippedDuplicateTracks += 1;
        continue;
      }
      if (group.tracks.size >= TARGET_TRACKS_PER_ARTIST) break;
      seenTracks.add(key);
      group.tracks.add(normalize(candidate.song));
      group.playable += 1;
      outputRows.push(candidate);
      stats.addedRows += 1;
    }
  }

  outputRows.sort((a, b) =>
    a.style.localeCompare(b.style) ||
    a.artist.localeCompare(b.artist) ||
    a.song.localeCompare(b.song)
  );

  fs.mkdirSync(DATA_DIR, { recursive: true });
  fs.mkdirSync(REPORT_DIR, { recursive: true });
  fs.writeFileSync(TRACK_OUT, csvWrite(outputRows), "utf8");
  fs.writeFileSync(REPORT_OUT, `${JSON.stringify({
    batch: BATCH,
    generatedAt: new Date().toISOString(),
    targetTracksPerArtist: TARGET_TRACKS_PER_ARTIST,
    focusStyles: [...FOCUS_STYLES],
    maxArtistsToQuery: MAX_ARTISTS_TO_QUERY,
    maxNewRows: MAX_NEW_ROWS,
    output: path.relative(ROOT, TRACK_OUT),
    stats,
    byStyle: outputRows.reduce((acc, row) => {
      acc[row.style] = (acc[row.style] || 0) + 1;
      return acc;
    }, {})
  }, null, 2)}\n`, "utf8");

  console.log(`Generated ${path.relative(ROOT, TRACK_OUT)}`);
  console.log(`${outputRows.length} playable rows, ${stats.resolvedArtists}/${stats.queriedArtists} artists resolved.`);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
