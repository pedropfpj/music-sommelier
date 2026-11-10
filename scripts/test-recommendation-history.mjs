#!/usr/bin/env node

import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { createAppRuntimeTestContext } from "./app-runtime-test-harness.mjs";

const appSource = process.env.SONIC_TEST_APP_SOURCE
  ? await readFile(process.env.SONIC_TEST_APP_SOURCE, "utf8")
  : undefined;
const storage = new Map();

function openSession(session) {
  const context = createAppRuntimeTestContext(appSource);
  context.currentAuthUser = session;
  context.localStorage = {
    getItem: (key) => storage.get(key) ?? null,
    setItem: (key, value) => storage.set(key, String(value)),
    removeItem: (key) => storage.delete(key)
  };
  // loadProgress updates the page after restoring the actual account state.
  // Keep those presentation effects outside this storage regression test.
  context.updateStats = () => {};
  context.updateSwipeFeedbackCard = () => {};
  context.renderTrackRating = () => {};
  context.renderMusicalSpirit = async () => {};
  context.loadProgress();
  return context;
}

function savedProgress(context) {
  const key = context.storageKeyForSession(context.PROGRESS_STORAGE_KEY);
  assert.ok(storage.has(key), "Recommendation progress must be saved for this account");
  return JSON.parse(storage.get(key));
}

const sessions = [
  { mode: "login", username: "quality-login" },
  { mode: "google", providerId: "quality-google", email: "google@example.test" },
  { mode: "apple", providerId: "quality-apple", email: "apple@example.test" }
];

for (const session of sessions) {
  const first = openSession(session);
  for (let index = 0; index < 260; index += 1) {
    first.markRecommendationPresented({ artist: `History Artist ${index}`, song: `History Song ${index}` });
  }
  const latest = { artist: "Amelie Lens x Farrago", song: "History Collaboration" };
  first.markRecommendationPresented(latest);
  const progress = savedProgress(first);
  assert.ok(
    progress.seenTrackKeysMemory.includes(first.recommendationTrackKey(latest)),
    `${session.mode}: saving more than 240 recommendations must retain the latest track`
  );

  const reopened = openSession(session);
  assert.equal(reopened.trackBlockedByKnownSignals(latest), true, `${session.mode}: reload must exclude the latest recording`);
  assert.equal(
    reopened.trackBlockedByKnownSignals({ artist: "History Artist 259", song: "History Song 259" }),
    true,
    `${session.mode}: reload must retain the part of history beyond the previous 240-entry limit`
  );
  const blockedArtists = reopened.buildGlobalArtistExclusionSet();
  for (const artist of ["Amelie Lens", "Farrago", "History Artist 259"]) {
    assert.equal(reopened.artistSetHasMatch(blockedArtists, artist), true, `${session.mode}: ${artist} must remain excluded after reload`);
  }
  assert.equal(reopened.artistSetHasMatch(blockedArtists, "A Different Artist"), false, "An unheard artist must remain available");
}

const untouched = openSession({ mode: "google", providerId: "unrelated-account", email: "other@example.test" });
assert.equal(
  untouched.trackBlockedByKnownSignals({ artist: "Amelie Lens x Farrago", song: "History Collaboration" }),
  false,
  "Another account must not inherit the previous accounts' exclusions"
);
assert.equal(untouched.seenArtistsMemory.size, 0, "Account history must remain isolated");

const boundedSession = { mode: "login", username: "bounded-history" };
const bounded = openSession(boundedSession);
const limit = bounded.RECOMMENDATION_HISTORY_LIMIT;
assert.ok(Number.isInteger(limit) && limit > 240, "Recommendation exposure history needs a dedicated limit beyond learning-map storage");

const overflow = 24;
const recordings = [];
for (let index = 0; index < limit + overflow; index += 1) {
  const track = {
    artist: `Bounded Artist ${index}`,
    song: `Bounded Song ${index}`,
    isrc: `USQTY${String(index).padStart(7, "0")}`
  };
  recordings.push(track);
  bounded.seenTrackKeysMemory.add(bounded.recommendationTrackKey(track));
  bounded.seenArtistsMemory.add(bounded.artistMatchKey(track.artist));
  bounded.rememberRecordingIdentity(track);
}
bounded.knownTrackTitlesMemory.add(bounded.normalizeTitle("A Song Explicitly Excluded"));
bounded.saveProgress();

const boundedProgress = savedProgress(bounded);
for (const field of ["seenTrackKeysMemory", "seenArtistsMemory", "seenRecordingIdsMemory"]) {
  assert.equal(boundedProgress[field].length, limit, `${field} must stay bounded`);
}
const afterOverflow = openSession(boundedSession);
const newest = recordings.at(-1);
assert.equal(afterOverflow.trackBlockedByKnownSignals(newest), true, "Overflow must retain the latest heard track across reload");
assert.equal(
  afterOverflow.trackBlockedByKnownSignals({ artist: "Different Credit", song: "Different Title", isrc: newest.isrc }),
  true,
  "The latest recording identity must survive overflow and different credits"
);
assert.equal(
  afterOverflow.artistSetHasMatch(afterOverflow.buildGlobalArtistExclusionSet(), newest.artist),
  true,
  "Overflow must retain the latest heard artist"
);
assert.equal(afterOverflow.trackBlockedByKnownSignals(recordings[0]), false, "Bounded history must retire the oldest exposure first");
assert.equal(
  afterOverflow.trackBlockedByKnownSignals({ artist: "Different Artist", song: "A Song Explicitly Excluded" }),
  true,
  "Exposure-history trimming must preserve explicit title exclusions"
);

console.log(`Recommendation history passed: login/Google/Apple reload after 261 deliveries, collaboration identities, account isolation, and newest ${limit} tracks/artists/recording IDs after overflow.`);
