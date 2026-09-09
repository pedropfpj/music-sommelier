#!/usr/bin/env node

import fs from "node:fs";
import path from "node:path";
import { LOW_COVERAGE_STYLE_CONFIG, LOW_COVERAGE_TARGET_ARTIST_PAIRS, LOW_COVERAGE_TARGET_STYLE_COUNT } from "./low-coverage-subgenre-config-v21.mjs";

const rootDir = process.cwd();
const batch = "low_coverage_subgenre_expansion_v21_20260820";
const trackOutput = path.join(rootDir, "data", `${batch}.csv`);
const reportOutput = path.join(rootDir, "reports", `${batch}.json`);
const runtimeDir = path.join(rootDir, "data", "runtime-catalog-v1");
const targetTracksPerArtist = 4;
const requestPauseMs = 70;

const blockedTrackPatterns = {
  "kuduro eletronico::pongo": [/lose my mind/i]
};

const headers = [
  "style", "artist", "song", "label", "bpm_exact", "preview_url", "release_date", "duration_sec",
  "country", "city", "artist_bio", "artist_genre", "artist_profile_hint", "source", "genre_evidence_url",
  "source_url", "track_url", "deezer_track_id", "deezer_track_url", "cover_art_url", "youtube_track_url",
  "source_type", "source_tags", "energy_band", "catalog_role", "status", "confidence", "source_note"
];

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
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

function strictArtistMatch(expected = "", actual = "") {
  const left = normalize(expected);
  const right = normalize(actual);
  if (!left || !right) return false;
  return left === right || left.replace(/\band\b/g, "") === right.replace(/\band\b/g, "");
}

function trackKey(style, artist, song) {
  return `${normalize(style)}::${normalize(artist)}::${normalize(song)}`;
}

function trackBlocked(style, artist, song) {
  const patterns = blockedTrackPatterns[`${normalize(style)}::${normalize(artist)}`] || [];
  return patterns.some((pattern) => pattern.test(String(song || "")));
}

function csvCell(value = "") {
  return `"${String(value ?? "").replace(/"/g, '""')}"`;
}

function writeCsv(rows) {
  return `${[
    headers.map(csvCell).join(","),
    ...rows.map((row) => headers.map((header) => csvCell(row[header] ?? "")).join(","))
  ].join("\n")}\n`;
}

function parseCsv(text = "") {
  const rows = [];
  let row = [];
  let cell = "";
  let quoted = false;
  for (let index = 0; index < text.length; index += 1) {
    const char = text[index];
    const next = text[index + 1];
    if (quoted) {
      if (char === '"' && next === '"') {
        cell += '"';
        index += 1;
      } else if (char === '"') quoted = false;
      else cell += char;
      continue;
    }
    if (char === '"') quoted = true;
    else if (char === ",") {
      row.push(cell);
      cell = "";
    } else if (char === "\n") {
      row.push(cell.replace(/\r$/, ""));
      if (row.some((value) => String(value || "").trim())) rows.push(row);
      row = [];
      cell = "";
    } else cell += char;
  }
  if (cell || row.length) {
    row.push(cell.replace(/\r$/, ""));
    rows.push(row);
  }
  if (!rows.length) return [];
  const csvHeaders = rows.shift().map((header) => header.trim());
  return rows.map((values) => Object.fromEntries(csvHeaders.map((header, index) => [header, values[index] || ""])));
}

function readPreviousRows() {
  if (!fs.existsSync(trackOutput)) return [];
  return parseCsv(fs.readFileSync(trackOutput, "utf8"));
}

function readRuntimeCoverage(previousRows) {
  const manifest = JSON.parse(fs.readFileSync(path.join(runtimeDir, "manifest.json"), "utf8"));
  const previousKeys = new Set(previousRows.map((row) => trackKey(row.style, row.artist, row.song)));
  const perStyle = {};
  const existingOtherKeys = new Set();
  for (const style of Object.keys(LOW_COVERAGE_STYLE_CONFIG)) {
    const relativePath = manifest.styles?.[style];
    const tracks = relativePath ? JSON.parse(fs.readFileSync(path.join(runtimeDir, relativePath), "utf8")) : [];
    const otherTracks = tracks.filter((track) => !previousKeys.has(trackKey(style, track.artist, track.song)));
    otherTracks.forEach((track) => existingOtherKeys.add(trackKey(style, track.artist, track.song)));
    const playable = otherTracks.filter((track) => (
      track.preview_url || track.deezer_track_id || track.bandcamp_track_id || track.bandcamp_track_url || track.soundcloud_track_url
    ));
    perStyle[style] = {
      tracks: otherTracks.length,
      artists: new Set(otherTracks.map((track) => normalize(track.artist)).filter(Boolean)).size,
      artistKeys: new Set(otherTracks.map((track) => normalize(track.artist)).filter(Boolean)),
      playableTracks: playable.length,
      playableArtists: new Set(playable.map((track) => normalize(track.artist)).filter(Boolean)).size
    };
  }
  return { perStyle, existingOtherKeys };
}

function usableTitle(value = "") {
  const title = normalize(value);
  if (!title) return false;
  return ![
    "interview", "commentary", "karaoke", "tribute", "continuous mix", "full album", "podcast", "skit",
    "workout mix", "made famous by", "originally performed by"
  ].some((term) => title.includes(term));
}

function validApplePreview(value = "") {
  const preview = String(value || "").trim();
  return preview.startsWith("http") && !/\/itunes-assets\/Music\d+\//i.test(preview);
}

async function fetchJson(url, retries = 2) {
  for (let attempt = 0; attempt <= retries; attempt += 1) {
    try {
      const response = await fetch(url, {
        headers: { Accept: "application/json", "User-Agent": "SonicSearchLowCoverageExpansion/1.0" }
      });
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      return await response.json();
    } catch (_error) {
      if (attempt === retries) return null;
      await sleep(400 + attempt * 650);
    }
  }
  return null;
}

function rowBase(style, artist, config) {
  return {
    style,
    artist,
    bpm_exact: "",
    country: "",
    city: "",
    artist_bio: "",
    artist_genre: config.label,
    artist_profile_hint: `${artist} foi curado para ampliar a diversidade reproduzível de ${config.label}.`,
    source: batch,
    genre_evidence_url: config.evidenceUrl || "",
    youtube_track_url: "",
    source_type: "verified_low_coverage_subgenre_depth",
    source_tags: `${style};${config.label};curated_artist;playable_depth;${batch}`,
    energy_band: "catalog_depth",
    catalog_role: "low_coverage_style_repair",
    status: "published",
    confidence: "high"
  };
}

async function deezerRows(style, artist, config) {
  const artistUrl = new URL("https://api.deezer.com/search/artist");
  artistUrl.searchParams.set("q", artist);
  artistUrl.searchParams.set("limit", "12");
  const artistPayload = await fetchJson(artistUrl);
  const resolved = (artistPayload?.data || []).find((item) => strictArtistMatch(artist, item?.name || ""));
  if (!resolved?.id) return [];
  const payload = await fetchJson(`https://api.deezer.com/artist/${encodeURIComponent(resolved.id)}/top?limit=50`);
  return (payload?.data || [])
    .filter((item) => strictArtistMatch(artist, item?.artist?.name || resolved.name || ""))
    .filter((item) => String(item?.preview || "").startsWith("http"))
    .filter((item) => usableTitle(item?.title_short || item?.title || ""))
    .filter((item) => !item?.duration || (Number(item.duration) >= 45 && Number(item.duration) <= 1200))
    .map((item, index) => ({
      ...rowBase(style, artist, config),
      song: String(item.title_short || item.title || "").trim(),
      label: String(item.album?.title || config.label).trim(),
      preview_url: String(item.preview || "").trim(),
      release_date: String(item.release_date || item.album?.release_date || "").trim(),
      duration_sec: String(item.duration || ""),
      source_url: String(item.link || ""),
      track_url: String(item.link || ""),
      deezer_track_id: String(item.id || ""),
      deezer_track_url: String(item.link || ""),
      cover_art_url: String(item.album?.cover_big || item.album?.cover_medium || ""),
      source_note: `Artista curado para ${config.label}; artista exato, gravação e prévia verificados no Deezer.`,
      provider: "deezer",
      providerRank: index
    }));
}

async function appleRows(style, artist, config) {
  const url = new URL("https://itunes.apple.com/search");
  url.searchParams.set("term", artist);
  url.searchParams.set("entity", "song");
  url.searchParams.set("limit", "100");
  url.searchParams.set("country", "US");
  const payload = await fetchJson(url);
  return (payload?.results || [])
    .filter((item) => item?.kind === "song")
    .filter((item) => strictArtistMatch(artist, item?.artistName || ""))
    .filter((item) => validApplePreview(item?.previewUrl || ""))
    .filter((item) => usableTitle(item?.trackName || ""))
    .filter((item) => !item?.trackTimeMillis || (Number(item.trackTimeMillis) >= 45_000 && Number(item.trackTimeMillis) <= 1_200_000))
    .map((item, index) => ({
      ...rowBase(style, artist, config),
      song: String(item.trackName || "").trim(),
      label: String(item.collectionName || config.label).trim(),
      preview_url: String(item.previewUrl || "").trim(),
      release_date: String(item.releaseDate || "").slice(0, 10),
      duration_sec: item.trackTimeMillis ? String(Math.round(Number(item.trackTimeMillis) / 1000)) : "",
      source_url: String(item.trackViewUrl || item.collectionViewUrl || ""),
      track_url: String(item.trackViewUrl || ""),
      deezer_track_id: "",
      deezer_track_url: "",
      cover_art_url: String(item.artworkUrl100 || "").replace(/100x100bb/g, "600x600bb"),
      source_note: `Artista curado para ${config.label}; artista exato, gravação e prévia verificados no Apple Music.`,
      provider: "apple",
      providerRank: index
    }));
}

function mergeProviderRows(deezer, apple) {
  const merged = new Map();
  for (const row of [...deezer, ...apple]) {
    const key = normalize(row.song);
    if (!key) continue;
    if (!merged.has(key)) {
      merged.set(key, row);
      continue;
    }
    const current = merged.get(key);
    const appleRow = row.provider === "apple" ? row : current.provider === "apple" ? current : null;
    const deezerRow = row.provider === "deezer" ? row : current.provider === "deezer" ? current : null;
    const preferred = appleRow || current;
    const sourceTags = new Set(String(preferred.source_tags || "").split(";").filter(Boolean));
    if (appleRow) sourceTags.add("itunes_verified");
    if (deezerRow) sourceTags.add("deezer_verified");
    merged.set(key, {
      ...preferred,
      deezer_track_id: deezerRow?.deezer_track_id || preferred.deezer_track_id || "",
      deezer_track_url: deezerRow?.deezer_track_url || preferred.deezer_track_url || "",
      source_tags: [...sourceTags].join(";"),
      source_note: `Artista curado para ${preferred.artist_genre}; artista exato, gravação e prévia verificados em ${appleRow && deezerRow ? "Apple Music e Deezer" : appleRow ? "Apple Music" : "Deezer"}.`
    });
  }
  return [...merged.values()].sort((a, b) => {
    const scoreA = Number(Boolean(a.deezer_track_id)) * 100 - Number(a.providerRank || 0);
    const scoreB = Number(Boolean(b.deezer_track_id)) * 100 - Number(b.providerRank || 0);
    return scoreB - scoreA || a.song.localeCompare(b.song);
  });
}

async function main() {
  const previousRows = readPreviousRows();
  const previousTrackKeys = new Set(previousRows.map((row) => trackKey(row.style, row.artist, row.song)));
  const previousArtistKeys = new Set(previousRows.map((row) => `${row.style}::${normalize(row.artist)}`));
  const { perStyle: beforeCoverage, existingOtherKeys } = readRuntimeCoverage(previousRows);
  const generated = [];
  const missingArtists = [];
  const providerCounts = { apple: 0, deezer: 0, both: 0, preserved: 0 };

  for (const [style, config] of Object.entries(LOW_COVERAGE_STYLE_CONFIG)) {
    for (const artist of config.artists) {
      const reusable = previousRows
        .filter((row) => row.style === style && strictArtistMatch(artist, row.artist))
        .filter((row) => !existingOtherKeys.has(trackKey(style, artist, row.song)))
        .filter((row) => validApplePreview(row.preview_url) || row.deezer_track_id)
        .filter((row) => !trackBlocked(style, artist, row.song))
        .slice(0, targetTracksPerArtist);
      if (reusable.length) {
        generated.push(...reusable);
        providerCounts.preserved += reusable.length;
        continue;
      }
      const [deezer, apple] = await Promise.all([
        deezerRows(style, artist, config),
        appleRows(style, artist, config)
      ]);
      const candidates = mergeProviderRows(deezer, apple)
        .filter((row) => !existingOtherKeys.has(trackKey(style, artist, row.song)))
        .filter((row) => !trackBlocked(style, artist, row.song))
        .slice(0, targetTracksPerArtist);
      if (!candidates.length) {
        const preserved = previousRows
          .filter((row) => row.style === style && strictArtistMatch(artist, row.artist))
          .filter((row) => !existingOtherKeys.has(trackKey(style, artist, row.song)))
          .filter((row) => validApplePreview(row.preview_url) || row.deezer_track_id)
          .filter((row) => !trackBlocked(style, artist, row.song))
          .slice(0, targetTracksPerArtist);
        if (preserved.length) {
          generated.push(...preserved);
          providerCounts.preserved += preserved.length;
        } else missingArtists.push({ style, artist });
      }
      for (const row of candidates) {
        if (row.deezer_track_id && row.provider === "apple") providerCounts.both += 1;
        else if (row.provider === "apple") providerCounts.apple += 1;
        else providerCounts.deezer += 1;
        generated.push(Object.fromEntries(headers.map((header) => [header, row[header] ?? ""])));
      }
      await sleep(requestPauseMs);
    }
  }

  generated.sort((a, b) => a.style.localeCompare(b.style) || a.artist.localeCompare(b.artist) || a.song.localeCompare(b.song));
  const artistPairs = new Set(generated.map((row) => `${row.style}::${normalize(row.artist)}`));
  if (generated.length < 300 || artistPairs.size < 140) {
    throw new Error(`Expansion guard failed: only ${generated.length} tracks from ${artistPairs.size} style-artist pairs were generated.`);
  }

  fs.mkdirSync(path.dirname(trackOutput), { recursive: true });
  fs.mkdirSync(path.dirname(reportOutput), { recursive: true });
  fs.writeFileSync(trackOutput, writeCsv(generated), "utf8");

  const perStyle = Object.fromEntries(Object.keys(LOW_COVERAGE_STYLE_CONFIG).map((style) => {
    const rows = generated.filter((row) => row.style === style);
    const batchArtistKeys = new Set(rows.map((row) => normalize(row.artist)));
    const addedArtists = [...batchArtistKeys].filter((artist) => !beforeCoverage[style]?.artistKeys?.has(artist)).length;
    return [style, {
      beforeTracks: beforeCoverage[style]?.tracks || 0,
      beforeArtists: beforeCoverage[style]?.artists || 0,
      beforePlayableTracks: beforeCoverage[style]?.playableTracks || 0,
      beforePlayableArtists: beforeCoverage[style]?.playableArtists || 0,
      addedTracks: rows.length,
      addedArtists,
      batchArtists: batchArtistKeys.size,
      projectedTracks: (beforeCoverage[style]?.tracks || 0) + rows.length,
      projectedArtists: (beforeCoverage[style]?.artists || 0) + addedArtists
    }];
  }));
  const report = {
    generatedAt: new Date().toISOString(),
    batch,
    selectionRule: "other runtime styles with at most 19 directly playable tracks and fewer than 5 playable artists",
    targetTracksPerArtist,
    targetStyleCount: LOW_COVERAGE_TARGET_STYLE_COUNT,
    targetArtistPairs: LOW_COVERAGE_TARGET_ARTIST_PAIRS,
    stylesExpanded: Object.keys(LOW_COVERAGE_STYLE_CONFIG).length,
    tracksAdded: generated.length,
    artistsAdded: artistPairs.size,
    previousTracks: previousRows.length,
    incrementalTracks: generated.filter((row) => !previousTrackKeys.has(trackKey(row.style, row.artist, row.song))).length,
    previousArtists: previousArtistKeys.size,
    incrementalArtists: [...artistPairs].filter((key) => !previousArtistKeys.has(key)).length,
    providerCounts,
    missingArtists,
    perStyle
  };
  fs.writeFileSync(reportOutput, `${JSON.stringify(report, null, 2)}\n`, "utf8");
  console.log(`Expanded ${report.stylesExpanded} low-coverage styles with ${report.tracksAdded} playable tracks from ${report.artistsAdded} style-artist pairs.`);
  console.log(`Missing artist matches: ${missingArtists.length}.`);
  console.log(`Tracks: ${path.relative(rootDir, trackOutput)}`);
  console.log(`Report: ${path.relative(rootDir, reportOutput)}`);
}

await main();
