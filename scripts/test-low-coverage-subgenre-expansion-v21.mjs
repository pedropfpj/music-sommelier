#!/usr/bin/env node

import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const rootDir = path.resolve(__dirname, "..");
const runtimeDir = path.join(rootDir, "data", "runtime-catalog-v1");
const reportPath = path.join(rootDir, "reports", "low_coverage_subgenre_expansion_v21_20260820.json");
const manifest = JSON.parse(fs.readFileSync(path.join(runtimeDir, "manifest.json"), "utf8"));
const report = JSON.parse(fs.readFileSync(reportPath, "utf8"));
const runtimeSource = fs.readFileSync(path.join(rootDir, "catalog-runtime.js"), "utf8");
const sourceList = fs.readFileSync(path.join(rootDir, "scripts", "catalog-runtime-sources.mjs"), "utf8");

assert.ok(sourceList.includes("data/low_coverage_subgenre_expansion_v21_20260820.csv"), "Low-coverage expansion must feed the runtime build");
assert.ok(runtimeSource.includes('VERSION = "20260820-catalog-v21"'), "Catalog loader cache version must expose v21");
assert.equal(report.stylesExpanded, 58, "Expansion must retain all 58 low-coverage subgenres");
assert.ok(report.tracksAdded >= 675, "Expansion must retain at least 675 verified playable rows");
assert.ok(report.artistsAdded >= 173, "Expansion must retain all curated style-artist pairs");
assert.deepEqual(report.missingArtists, [], "Expansion must not leave unresolved artists");

const rejectedHomonyms = new Map([
  ["ghettotech", new Set(["dj nasty"])],
  ["atmospheric_jungle", new Set(["blame"])],
  ["deconstructed_club", new Set(["sophie"])],
  ["chillstep", new Set(["sorrow"])],
  ["ghetto_house", new Set(["dj milton"])],
  ["chicago_house", new Set(["adonis"])],
  ["berlin_school", new Set(["redshift"])]
]);

let totalTracks = 0;
const runtimeKeys = new Set();
const focusRows = [];

for (const [style, relativePath] of Object.entries(manifest.styles || {})) {
  const tracks = JSON.parse(fs.readFileSync(path.join(runtimeDir, relativePath), "utf8"));
  totalTracks += tracks.length;
  for (const track of tracks) {
    const artist = String(track.artist || "").trim().toLowerCase();
    const song = String(track.song || "").trim().toLowerCase();
    const key = `${style}::${artist}::${song}`;
    assert.ok(!runtimeKeys.has(key), `Duplicate runtime track: ${key}`);
    assert.doesNotMatch(
      String(track.preview_url || ""),
      /\/itunes-assets\/Music\d+\//i,
      `${key} contains a legacy Apple preview route that returns metadata instead of audio`
    );
    assert.ok(!rejectedHomonyms.get(style)?.has(artist), `${style} retained rejected homonym ${track.artist}`);
    assert.ok(!(style === "kuduro_eletronico" && artist === "pongo" && song === "lose my mind"), "Kuduro retained the blocked cross-genre Pongo title");
    runtimeKeys.add(key);
  }
  if (!report.perStyle?.[style]) continue;
  const direct = tracks.filter((track) => (
    track.preview_url ||
    track.deezer_track_id ||
    track.bandcamp_track_id ||
    track.bandcamp_track_url ||
    track.soundcloud_track_url
  ));
  const directArtists = new Set(direct.map((track) => String(track.artist || "").trim().toLowerCase()).filter(Boolean));
  focusRows.push({ style, tracks, direct, directArtists });
}

assert.ok(totalTracks >= 9_160, `Runtime catalog unexpectedly shrank to ${totalTracks} tracks`);
assert.equal(focusRows.length, 58, "Every expanded low-coverage style must have a runtime shard");

for (const row of focusRows) {
  assert.ok(row.direct.length >= 18, `${row.style} has only ${row.direct.length} direct playback routes`);
  assert.ok(row.directArtists.size >= 5, `${row.style} has only ${row.directArtists.size} playable artists`);
}

const minimumTracks = Math.min(...focusRows.map((row) => row.direct.length));
const minimumArtists = Math.min(...focusRows.map((row) => row.directArtists.size));
console.log(`Low-coverage expansion passed: ${totalTracks} tracks, ${focusRows.length} repaired styles, minimum ${minimumTracks} playable tracks and ${minimumArtists} playable artists/style.`);
