#!/usr/bin/env node

import assert from "node:assert/strict";
import { createAppRuntimeTestContext } from "./app-runtime-test-harness.mjs";

const failures = [];

function fixture() {
  const ctx = createAppRuntimeTestContext();
  ctx.Math = Object.assign(Object.create(Math), { random: () => 0.5 });
  const house = ctx.catalog.filter((track) => track.style === "house" && ctx.trackHasReliableAudioPreview(track));
  assert.ok(house.length >= 2, "Queue regressions need two real playable house recordings");
  ctx.catalog = house;
  return { ctx, first: house[0], second: house[1] };
}

async function check(name, run) {
  try {
    await run();
    console.log(`PASS ${name}`);
  } catch (error) {
    failures.push(`${name}: ${error.message}`);
    console.error(`FAIL ${name}: ${error.message}`);
  }
}

function activationFixture(selectedTrack, ctx, currentTrack, prefs = { style: "house" }) {
  const deliveries = [];
  const renders = [];
  ctx.lastPrefs = prefs;
  ctx.currentRecommendation = currentTrack;
  ctx.suggestionQueueTracks = [selectedTrack];
  ctx.suggestionQueueContextKey = ctx.recommendationContextKey(prefs);
  ctx.canUseMusicDiscovery = () => true;
  ctx.refreshSuggestionQueue = () => {};
  ctx.captureRecommendationSurfaceSnapshot = () => ({ track: currentTrack });
  ctx.discoveryModeEl = { checked: false };
  ctx.setRecommendationRunBusy = () => {};
  ctx.renderRecommendation = (track) => renders.push(track);
  ctx.renderDiscovery = () => {};
  ctx.renderPreview = async () => true;
  ctx.registerRecommendationDelivery = (track) => deliveries.push(track);
  ctx.scrollResultPanelIntoView = () => {};
  ctx.playUiSfx = () => {};
  ctx.savePreferences = () => {};
  return { deliveries, renders };
}

await check("A scarce queue keeps its anchor without recycling heard recordings", () => {
  const { ctx, first, second } = fixture();
  ctx.seenTrackKeysMemory.add(ctx.recommendationTrackKey(first));
  ctx.seenTrackKeysMemory.add(ctx.recommendationTrackKey(second));
  const queue = ctx.buildSuggestionQueueFromPrefs({ style: "house" }, first);
  assert.equal(queue.length, 1, "Only the current anchor should remain when other recordings were already heard");
  assert.equal(queue[0], first);
});

await check("A scarce queue cannot recycle another recording by a heard artist", () => {
  const { ctx, first, second } = fixture();
  ctx.registerSeenArtist(second.artist);
  const unseenSong = { ...second, song: `${second.song} (unheard recording)` };
  ctx.catalog = [first, unseenSong];
  const queue = ctx.buildSuggestionQueueFromPrefs({ style: "house" }, first);
  assert.equal(queue.length, 1, "Another song cannot bypass the already-heard artist exclusion");
});

await check("Upcoming queue cards do not share collaborators with the anchor", () => {
  const { ctx, first, second } = fixture();
  const collaboration = { ...second, artist: `${first.artist} & ${second.artist}`, song: "Queue collaboration fixture" };
  ctx.catalog = [first, collaboration, second];
  const queue = ctx.buildSuggestionQueueFromPrefs({ style: "house" }, first);
  assert.ok(!queue.includes(collaboration), "An artist credit containing the anchor artist cannot repeat them in the queue");
  assert.ok(queue.includes(second), "The independent unfamiliar artist should remain available");
});

await check("Alternate credits for the same recording cannot occupy two queue cards", () => {
  const { ctx, first, second } = fixture();
  const original = { ...first, isrc: "USABC2600001" };
  const alternate = { ...second, isrc: original.isrc };
  ctx.catalog = [original, alternate];
  const queue = ctx.buildSuggestionQueueFromPrefs({ style: "house" }, original);
  assert.equal(queue.length, 1, "The same recording identity must appear only once in the queue");
});

await check("A stale queue cannot activate a recording heard after queue creation", async () => {
  const { ctx, first, second } = fixture();
  const { deliveries, renders } = activationFixture(first, ctx, second);
  ctx.seenTrackKeysMemory.add(ctx.recommendationTrackKey(first));
  assert.equal(await ctx.activateSuggestionQueueIndex(0), false);
  assert.equal(deliveries.length, 0);
  assert.equal(renders.length, 0, "An already-heard queue card must be rejected before playback/rendering");
});

await check("Artist history still blocks a stale queue after the short recent window", async () => {
  const { ctx, first, second } = fixture();
  const unseenSong = { ...first, song: `${first.song} (unheard stale queue fixture)` };
  const { deliveries } = activationFixture(unseenSong, ctx, second);
  ctx.registerSeenArtist(first.artist);
  ctx.recentPresentedArtists = [];
  assert.equal(await ctx.activateSuggestionQueueIndex(0), false);
  assert.equal(deliveries.length, 0);
});

await check("A stale queue cannot activate another credit for a heard recording", async () => {
  const { ctx, first, second } = fixture();
  const selected = { ...first, isrc: "USABC2600002" };
  const { deliveries } = activationFixture(selected, ctx, second);
  ctx.rememberRecordingIdentity({ ...second, isrc: selected.isrc });
  assert.equal(await ctx.activateSuggestionQueueIndex(0), false);
  assert.equal(deliveries.length, 0);
});

await check("Queue activation enforces the current BPM filter", async () => {
  const { ctx, first, second } = fixture();
  const { deliveries } = activationFixture(first, ctx, second, { style: "house", bpm: "132-144" });
  assert.equal(await ctx.activateSuggestionQueueIndex(0), false);
  assert.equal(deliveries.length, 0);
});

await check("A fresh eligible queue card still activates normally", async () => {
  const { ctx, first, second } = fixture();
  const { deliveries, renders } = activationFixture(first, ctx, second);
  assert.equal(await ctx.activateSuggestionQueueIndex(0), true);
  assert.equal(deliveries[0], first);
  assert.equal(renders[0], first);
});

assert.equal(failures.length, 0, failures.join("\n"));
console.log("Suggestion queue passed: no automatic track/artist recycling, collaborator and recording deduplication, stale-card safety, fresh activation.");
