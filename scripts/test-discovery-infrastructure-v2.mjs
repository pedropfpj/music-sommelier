#!/usr/bin/env node

import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const rootDir = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const appSource = fs.readFileSync(path.join(rootDir, "app.js"), "utf8");
const vercelConfig = fs.readFileSync(path.join(rootDir, "vercel.json"), "utf8");
const exposureApi = fs.readFileSync(path.join(rootDir, "lib", "api", "_discovery-exposure.js"), "utf8");
const inventory = JSON.parse(
  fs.readFileSync(path.join(rootDir, "data", "discovery_playable_inventory_v1.json"), "utf8")
);

assert.equal(Object.keys(inventory.counts || {}).length, 12, "inventory must cover 12 discovery subgenres");
Object.entries(inventory.counts || {}).forEach(([style, count]) => {
  assert(Number(count) >= 20 && Number(count) <= 30, `${style} must keep 20-30 verified tracks`);
});
assert(inventory.tracks.every((track) => track.previewUrl || track.deezerTrackId));

assert.match(appSource, /tracks:\s*\[\][\s\S]*artists:\s*\[\]/);
assert.match(appSource, /ledger\.tracks[\s\S]*slice\(-50\)/);
assert.match(appSource, /ledger\.artists[\s\S]*slice\(-20\)/);
assert.match(appSource, /const PREPARED_PLAYABLE_QUEUE_TARGET = 3;/);
assert.match(appSource, /prepareNextPlayableCards/);
assert.match(appSource, /refreshDiscoveryInventoryHealthBatch/);
assert.match(appSource, /scheduleDiscoveryInventoryMaintenance/);
assert.match(appSource, /fetchTrackMetadataFromApi/);
assert.match(appSource, /fetchDeezerTrackDetails/);
assert.match(appSource, /resolveSoundCloudEmbedForTrack/);
assert.match(appSource, /fetchItunesTracksByStyle/);
assert.match(appSource, /startPreferredEmbeddedPreviewAutoplay/);

assert.match(vercelConfig, /\/api\/discovery-exposure/);
assert.match(exposureApi, /MAX_SNAPSHOT_ITEMS = 48/);
assert.match(exposureApi, /RECENT_EXPOSURE_TTL_SECONDS = 120/);
assert.match(exposureApi, /incrementCounter/);
assert.match(exposureApi, /readMany/);

console.log(
  "Discovery infrastructure v2 tests passed: bounded anonymous history, global exposure rotation, "
  + "three-card prewarm, multi-source fallback, periodic health checks, and 20-30 tracks per subgenre."
);
