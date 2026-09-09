#!/usr/bin/env node
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const rootDir = path.resolve(__dirname, "..");
const runtimeDir = path.join(rootDir, "data", "runtime-catalog-v1");
const reportPath = path.join(rootDir, "reports", "underrepresented_subgenre_expansion_v18_20260820.json");
const manifest = JSON.parse(fs.readFileSync(path.join(runtimeDir, "manifest.json"), "utf8"));
const report = JSON.parse(fs.readFileSync(reportPath, "utf8"));
const runtimeSource = fs.readFileSync(path.join(rootDir, "catalog-runtime.js"), "utf8");
const sourceList = fs.readFileSync(path.join(rootDir, "scripts", "catalog-runtime-sources.mjs"), "utf8");

assert.ok(sourceList.includes("data/underrepresented_subgenre_expansion_v18_20260820.csv"), "Expansion source must feed the runtime build");
assert.ok(runtimeSource.includes('VERSION = "20260820-catalog-v21"'), "Catalog loader cache version must expose v21");
assert.equal(report.stylesExpanded, 24, "Expansion must keep all 24 priority subgenres");
assert.ok(report.tracksAdded >= 450, "Expansion must keep at least 450 verified playable rows");
assert.ok(report.artistsAdded >= 120, "Expansion must diversify every style with at least five curated artists");
assert.ok(report.diversityIncrementalTracks >= 180, "This diversity pass must add at least 180 verified tracks");
assert.ok(report.diversityIncrementalArtists >= 48, "This diversity pass must add at least 48 style-artist pairs");
assert.deepEqual(report.missingArtists, [], "Expansion must not leave unresolved artists");

let totalTracks = 0;
const runtimeKeys = new Set();
const focusRows = [];

for (const [style, relativePath] of Object.entries(manifest.styles || {})) {
  const tracks = JSON.parse(fs.readFileSync(path.join(runtimeDir, relativePath), "utf8"));
  totalTracks += tracks.length;
  for (const track of tracks) {
    const key = `${style}::${String(track.artist || "").toLowerCase()}::${String(track.song || "").toLowerCase()}`;
    assert.ok(!runtimeKeys.has(key), `Duplicate runtime track: ${key}`);
    assert.doesNotMatch(
      String(track.preview_url || ""),
      /\/itunes-assets\/Music\d+\//i,
      `${key} contains a legacy Apple preview route that returns metadata instead of audio`
    );
    runtimeKeys.add(key);
  }
  if (!report.perStyle?.[style]) continue;
  const artists = new Set(tracks.map((track) => String(track.artist || "").trim().toLowerCase()).filter(Boolean));
  const direct = tracks.filter((track) => (
    track.preview_url ||
    track.deezer_track_id ||
    track.bandcamp_track_id ||
    track.bandcamp_track_url ||
    track.soundcloud_track_url
  ));
  focusRows.push({ style, tracks, artists, direct });
}

assert.ok(totalTracks >= 8_480, `Runtime catalog unexpectedly shrank to ${totalTracks} tracks`);
assert.equal(focusRows.length, 24, "Every expanded style must have a runtime shard");

for (const row of focusRows) {
  const projected = Number(report.perStyle[row.style].projectedTracks || 0);
  assert.ok(row.tracks.length >= projected - 1, `${row.style} has ${row.tracks.length}/${projected} projected tracks after canonical deduplication`);
  assert.ok(row.artists.size >= 7, `${row.style} still lacks the requested depth of more than four artists`);
  assert.ok(row.direct.length >= 10, `${row.style} has fewer than 10 direct playback routes`);
}

const blocked = [
  ["big_beat", "Fatboy Slim", /eat sleep rave repeat|future rave remix/i],
  ["extratone", "DJ Skull Vomit", /drumstep/i],
  ["crossbreed", "DJ Hidden", /amor encarcelado|mi barrio|ardiendo por ti|million gang|te encontre/i],
  ["french_house", "Modjo", /acoustic/i],
  ["makina", "DJ Konik", /techno 2024/i],
  ["makina", "DJ Skudero", /rkt lgante/i],
  ["makina", "Sistema 3", /this is techno/i],
  ["makina", "DJ Nau", /i still love you|ofa taengata|ofa taongata|^quack$/i]
];

for (const [style, artist, pattern] of blocked) {
  const row = focusRows.find((entry) => entry.style === style);
  const invalid = row?.tracks.find((track) => track.artist === artist && pattern.test(String(track.song || "")));
  assert.equal(invalid, undefined, `${style} contains a blocked cross-genre title for ${artist}`);
}

const minimumArtistDepth = Math.min(...focusRows.map((row) => row.artists.size));
console.log(`Underrepresented catalog expansion passed: ${totalTracks} tracks, ${focusRows.length} expanded styles, ${report.artistsAdded} diversified style-artist pairs, minimum depth ${minimumArtistDepth} artists/style.`);
