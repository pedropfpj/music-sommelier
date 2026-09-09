#!/usr/bin/env node

import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const rootDir = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const runtimeDir = path.join(rootDir, "data", "runtime-catalog-v1");
const outputPath = path.join(rootDir, "reports", "low_coverage_subgenre_audit_v21_20260820.json");
const manifest = JSON.parse(fs.readFileSync(path.join(runtimeDir, "manifest.json"), "utf8"));
const treatedReport = JSON.parse(fs.readFileSync(path.join(rootDir, "reports", "underrepresented_subgenre_expansion_v18_20260820.json"), "utf8"));
const treatedStyles = new Set(Object.keys(treatedReport.perStyle || {}));
const maximumPlayableTracks = Math.max(1, Number(process.env.SONIC_AUDIT_MAX_PLAYABLE_TRACKS) || 19);
const minimumPlayableArtists = Math.max(2, Number(process.env.SONIC_AUDIT_MIN_PLAYABLE_ARTISTS) || 5);

function directPlayback(track = {}) {
  return Boolean(
    track.preview_url ||
    track.deezer_track_id ||
    track.bandcamp_track_id ||
    track.bandcamp_track_url ||
    track.soundcloud_track_url
  );
}

const perStyle = {};
for (const [style, relativePath] of Object.entries(manifest.styles || {})) {
  if (treatedStyles.has(style)) continue;
  const tracks = JSON.parse(fs.readFileSync(path.join(runtimeDir, relativePath), "utf8"));
  const playable = tracks.filter(directPlayback);
  const artists = new Set(tracks.map((track) => String(track.artist || "").trim().toLowerCase()).filter(Boolean));
  const playableArtists = new Set(playable.map((track) => String(track.artist || "").trim().toLowerCase()).filter(Boolean));
  if (playable.length > maximumPlayableTracks || playableArtists.size >= minimumPlayableArtists) continue;
  perStyle[style] = {
    beforeTracks: tracks.length,
    beforeArtists: artists.size,
    beforePlayableTracks: playable.length,
    beforePlayableArtists: playableArtists.size,
    needsRepair: true
  };
}

const ranked = Object.entries(perStyle).sort(([, a], [, b]) => (
  a.beforePlayableArtists - b.beforePlayableArtists ||
  a.beforePlayableTracks - b.beforePlayableTracks
));
const report = {
  generatedAt: new Date().toISOString(),
  selectionRule: `not in the previous 24-style expansion, at most ${maximumPlayableTracks} direct tracks, and fewer than ${minimumPlayableArtists} playable artists`,
  maximumPlayableTracks,
  minimumPlayableArtists,
  stylesAudited: Object.keys(manifest.styles || {}).length - treatedStyles.size,
  stylesNeedingRepair: ranked.length,
  perStyle: Object.fromEntries(ranked)
};

fs.writeFileSync(outputPath, `${JSON.stringify(report, null, 2)}\n`, "utf8");
console.log(`Low-coverage audit: ${report.stylesNeedingRepair}/${report.stylesAudited} other subgenres need repair.`);
console.log(`Report: ${path.relative(rootDir, outputPath)}`);
