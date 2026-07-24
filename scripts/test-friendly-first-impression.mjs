#!/usr/bin/env node

import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import path from "node:path";
import vm from "node:vm";
import { fileURLToPath } from "node:url";

const rootDir = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const appSource = await readFile(path.join(rootDir, "app.js"), "utf8");

const openingDeckStart = "const CURATED_FRIENDLY_OPENING_TRACKS = [";
const openingDeckEnd = "\n].map((track) => ({";
const startIndex = appSource.indexOf(openingDeckStart);
const endIndex = appSource.indexOf(openingDeckEnd, startIndex);
assert.ok(startIndex >= 0 && endIndex > startIndex, "Curated friendly opening deck is missing");

const openingDeckBody = appSource.slice(startIndex + openingDeckStart.length, endIndex);
const openingDeck = vm.runInNewContext(`[${openingDeckBody}]`, Object.create(null));
const blockedOpeningStyles = new Set([
  "freeform",
  "forest_psy",
  "dark_psy",
  "psycore",
  "hi_tech",
  "dark_experimental",
  "slambient",
  "hard_techno",
  "industrial_techno",
  "schranz",
  "hardcore",
  "gabber",
  "speedcore"
]);

assert.ok(openingDeck.length >= 20, "The first-impression deck needs at least 20 playable tracks");
assert.ok(new Set(openingDeck.map((track) => track.artist)).size >= 18, "The opening deck must span many artists");
assert.ok(new Set(openingDeck.map((track) => track.style)).size >= 14, "The opening deck must span many approachable styles");
openingDeck.forEach((track) => {
  assert.ok(track.artist && track.song && track.style, "Every opening track needs artist, title, and style");
  assert.ok(Number(track.bpmExact) > 0, `${track.artist} - ${track.song} needs an exact BPM`);
  assert.ok(track.deezerTrackId, `${track.artist} - ${track.song} needs a refreshable preview id`);
  assert.ok(track.coverArtUrl, `${track.artist} - ${track.song} needs cover artwork`);
  assert.ok(!blockedOpeningStyles.has(track.style), `${track.style} is too advanced for an untrained first impression`);
});

const openingTitles = new Set(openingDeck.map((track) => String(track.song).toLowerCase()));
assert.ok(!openingTitles.has("xinforimpola"), "Xinforimpola must not be part of the first-impression deck");
assert.ok(!openingTitles.has("hanging tree"), "Hanging Tree must not be part of the first-impression deck");

assert.match(
  appSource,
  /const PROFILE_OPENING_HISTORY_KEY = "sonic_search:opening_history:v3";[\s\S]*function openingHistoryStorageKey[\s\S]*localStorage\.setItem\(storageKey/,
  "Opening history must persist per anonymous installation and signed-in profile"
);
assert.match(
  appSource,
  /function pickOpeningSurpriseTrack[\s\S]*friendly-opening-v3[\s\S]*openingRotationSlot[\s\S]*recentStyleRank/,
  "The opening picker must use the global rotation slot while avoiding recently used styles"
);
assert.match(
  appSource,
  /function registerRecommendationDelivery[\s\S]*rememberAnonymousOpeningTrack\(track\)/,
  "Every delivered anonymous recommendation must enter the anti-repeat ledger"
);
assert.match(
  appSource,
  /function trackAllowedForFriendlyFirstImpression[\s\S]*FRIENDLY_FIRST_IMPRESSION_STYLE_SET[\s\S]*DISCOVERY_EXTREME_STYLE_SET/,
  "First impressions must pass the friendly-style safety gate"
);
assert.match(
  appSource,
  /async function pickValidatedSurpriseTrack[\s\S]*if \(!baseTrack\)[\s\S]*pickOpeningSurpriseTrack/,
  "A cold recommendation must use the dedicated opening picker before generic fallbacks"
);
assert.match(
  appSource,
  /function runInitialRecommendation[\s\S]*ensureOpeningRotationSlot\(\)[\s\S]*await openingSlotRequest/,
  "Every first recommendation must resolve a global or cryptographic rotation slot"
);

console.log(
  `Friendly first-impression contract passed: ${openingDeck.length} tracks, ` +
  `${new Set(openingDeck.map((track) => track.artist)).size} artists, ` +
  `${new Set(openingDeck.map((track) => track.style)).size} approachable styles.`
);
