#!/usr/bin/env node

import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { startTestPreviewServer } from "./test-preview-server.mjs";

const rootDir = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const previewSession = await startTestPreviewServer({ envName: "SONIC_TEST_BASE_URL" });
const baseUrl = previewSession.baseUrl;

try {
const report = JSON.parse(fs.readFileSync(path.join(rootDir, "reports", "underrepresented_subgenre_expansion_v18_20260820.json"), "utf8"));
const appSource = fs.readFileSync(path.join(rootDir, "app.js"), "utf8");
const appBuildId = appSource.match(/const SONIC_APP_BUILD_ID = "([^"]+)";/)?.[1] || "";
assert.ok(appBuildId, "The app source must declare a build id");

function directPlayback(track = {}) {
  return Boolean(
    track.preview_url ||
    track.deezer_track_id ||
    track.bandcamp_track_id ||
    track.bandcamp_track_url ||
    track.soundcloud_track_url
  );
}

async function fetchOk(relativePath, expectedType) {
  const response = await fetch(`${baseUrl}/${String(relativePath).replace(/^\/+/, "")}`);
  assert.equal(response.status, 200, `${relativePath} returned HTTP ${response.status}`);
  assert.match(String(response.headers.get("content-type") || ""), expectedType, `${relativePath} has an unexpected content type`);
  return response;
}

const indexResponse = await fetchOk("index.html", /text\/html/i);
const indexHtml = await indexResponse.text();
assert.match(indexHtml, /catalog-runtime\.min\.js\?v=20260820catalog21/, "The served app does not reference the current catalog bundle");
assert.ok(indexHtml.includes(`app.min.js?v=${appBuildId}`), "The served app does not reference the current app bundle");
const runtimeBundle = await (await fetchOk("catalog-runtime.min.js", /text\/javascript|application\/javascript/i)).text();
const appBundle = await (await fetchOk("app.min.js", /text\/javascript|application\/javascript/i)).text();
assert.match(runtimeBundle, /20260820-catalog-v21/, "The served catalog loader is stale");
assert.ok(appBundle.includes(appBuildId), "The served app bundle is stale");

const manifestResponse = await fetchOk("data/runtime-catalog-v1/manifest.json", /application\/json/i);
const manifest = await manifestResponse.json();
const styles = Object.keys(report.perStyle || {});
assert.equal(styles.length, 24, "The live recommendation smoke test must cover every expanded niche style");

let recommendationsChecked = 0;
let minimumArtistDepth = Infinity;
let minimumDirectRoutes = Infinity;

for (const style of styles) {
  const shardPath = manifest.styles?.[style];
  assert.ok(shardPath, `${style} is missing from the served runtime manifest`);
  const response = await fetchOk(`data/runtime-catalog-v1/${shardPath}`, /application\/json/i);
  const tracks = await response.json();
  const playableByArtist = new Map();

  for (const track of tracks) {
    if (track.style !== style || !directPlayback(track)) continue;
    const artist = String(track.artist || "").trim().toLowerCase();
    if (artist && !playableByArtist.has(artist)) playableByArtist.set(artist, track);
  }

  const sample = [...playableByArtist.values()].slice(0, 5);
  assert.ok(sample.length >= 5, `${style} cannot produce recommendations from more than four playable artists`);
  sample.forEach((track) => {
    assert.equal(track.style, style, `${style} recommendation escaped the requested subgenre`);
    assert.ok(track.artist && track.song && directPlayback(track), `${style} produced an incomplete recommendation`);
  });

  recommendationsChecked += sample.length;
  minimumArtistDepth = Math.min(minimumArtistDepth, playableByArtist.size);
  minimumDirectRoutes = Math.min(minimumDirectRoutes, tracks.filter(directPlayback).length);
}

assert.match(appSource, /runtime\.loadStyle\(cleanStyle\)/, "The app is not loading the requested runtime style shard");
assert.match(appSource, /async function runSwipeStyleRecommendation[\s\S]{0,3500}generateRecommendationWithOverlay/, "The style rail is not connected to recommendation generation");
assert.match(appSource, /async function runRecommendation[\s\S]{0,6000}ensureStyleCoverageFast\(prefs\.style, 1\)[\s\S]{0,6000}generateRecommendationFromPrefs/, "The main recommendation flow does not enforce style coverage before selection");

console.log(
  `Niche recommendation runtime passed: HTTP app healthy, ${styles.length} styles, ${recommendationsChecked} playable artist-distinct samples, minimum ${minimumArtistDepth} playable artists and ${minimumDirectRoutes} direct routes/style.`
);
} finally {
  await previewSession.stop();
}
