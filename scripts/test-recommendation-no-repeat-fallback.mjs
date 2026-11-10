import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { createAppRuntimeTestContext } from "./app-runtime-test-harness.mjs";

const rows = JSON.parse(await readFile(new URL("../data/runtime-catalog-v1/styles/house.json", import.meta.url), "utf8"));

function contextWithOldArtist({ requireBpm = false } = {}) {
  const ctx = createAppRuntimeTestContext();
  ctx.window.setTimeout = setTimeout;
  ctx.window.clearTimeout = clearTimeout;
  ctx.mergeExternalDatasetRows(rows, "dataset_local_runtime");
  const tracks = ctx.catalog.filter(track => track.style === "house" &&
    ctx.isTrackEligibleForRecommendation(track) &&
    ctx.trackMatchesRequestedSubgenreEvidence(track, { style: "house" }) &&
    ctx.trackHasPlayablePreviewExperience(track));
  const heard = tracks.find(track => tracks.some(other => other !== track && ctx.artistsShareIdentity(track.artist, other.artist)));
  const candidate = requireBpm
    ? tracks.find(track => ctx.hasReliableBpmForTrack(track))
    : tracks.find(track => track !== heard && ctx.artistsShareIdentity(track.artist, heard.artist));
  assert.ok(heard && candidate, "Use two real eligible recordings by the same artist");
  ctx.markRecommendationPresented(requireBpm
    ? { artist: candidate.artist, song: "Earlier recording (synthetic history entry)", style: "house" }
    : heard);
  for (let index = 0; index < 12; index++) {
    ctx.markRecommendationPresented({ artist: `Interlude Artist ${index}`, song: `Interlude ${index}`, style: "techno" });
  }
  ctx.currentRecommendation = { artist: "Current Artist", song: "Keep this card", style: "house" };
  ctx.lastPrefs = { style: "house" };
  ctx.catalog = [candidate];
  assert.equal(ctx.artistSetHasMatch(ctx.buildGlobalArtistExclusionSet(), candidate.artist), true);
  assert.equal(ctx.recommendationArtistBlockedForPresentation(candidate), false, "Age the artist beyond the short recent window");
  assert.equal(ctx.trackBlockedByKnownSignals(candidate), false, "The candidate is an unheard recording");
  // Adapt provider calls and browser rendering only; selection, evidence,
  // scoring, exclusion and recording-history functions remain the real app.
  ctx.prepareCatalogForFastRecommendation = async () => {};
  ctx.ensureStyleCoverageFast = async () => {};
  ctx.resolvePreviewForTrack = async () => {};
  ctx.expandCatalogForArtistDepth = async () => {};
  ctx.renderRecommendation = () => {};
  ctx.renderDiscovery = () => {};
  ctx.renderPreview = async () => true;
  ctx.refreshSuggestionQueue = () => {};
  ctx.discoveryModeEl = { checked: false };
  ctx.registerRecommendationDelivery = track => ctx.markRecommendationPresented(track);
  return { ctx, heard, candidate };
}

{
  const { ctx } = contextWithOldArtist();
  assert.equal(await ctx.pickPlayableReplacementForPrefs({ style: "house" }), null,
    "Default playback recovery must not repeat an old artist outside the recent window");
}

{
  const { ctx, candidate } = contextWithOldArtist();
  const unavailable = { ...candidate, artist: "New Unavailable Artist", song: "No playback route", previewUrl: "", previewCandidates: [], deezerTrackId: "", catalogMetadata: {} };
  assert.equal(ctx.trackHasPlayablePreviewExperience(unavailable), false);
  assert.equal(ctx.isTrackEligibleForRecommendation(unavailable), true);
  assert.equal(ctx.trackMatchesRequestedSubgenreEvidence(unavailable, { style: "house" }), true);
  ctx.catalog.push(unavailable);
  let lookups = 0;
  ctx.resolvePreviewForTrack = async () => { lookups++; };
  const excludedArtists = ctx.buildGlobalArtistExclusionSet();
  assert.equal(await ctx.pickPlayableReplacementForPrefs({ style: "house" }, { excludedArtists }), null,
    "Failed fresh candidates must not silently enable known-artist fallback");
  assert.ok(lookups > 0, "Exercise preview lookup exhaustion before rejecting the repeated artist");
}

for (const useBpm of [false, true]) {
  const { ctx, candidate } = contextWithOldArtist({ requireBpm: useBpm });
  const previous = ctx.currentRecommendation;
  const prefs = { style: "house", ...(useBpm ? { bpm: String(ctx.resolveExactBpm(candidate)) } : {}) };
  if (useBpm) assert.equal(ctx.trackMatchesBpmPreference(candidate, prefs.bpm), true);
  assert.equal(await ctx.generateRecommendationFromPrefs(prefs, { allowKnownFallback: false }), false,
    `${useBpm ? "BPM" : "Style"} exhaustion must not recycle known artists`);
  assert.equal(ctx.currentRecommendation, previous, "Exhaustion must preserve the previous card");
}

{
  const { ctx, candidate } = contextWithOldArtist();
  assert.equal(await ctx.pickPlayableReplacementForPrefs({ style: "house" }, { allowKnownFallback: true }), candidate,
    "An explicitly requested familiar-artist mode may select an unheard song by an old artist");
  ctx.markRecommendationPresented(candidate);
  assert.equal(await ctx.pickPlayableReplacementForPrefs({ style: "house" }, { allowKnownFallback: true }), null,
    "Explicit familiar-artist mode must still exclude heard recordings");
}

for (const { familiar, useBpm } of [{ familiar: false }, { familiar: true }, { familiar: false, useBpm: true }]) {
  const { ctx, candidate } = contextWithOldArtist({ requireBpm: useBpm });
  if (!familiar) {
    ctx.seenArtistsMemory = new Set();
    ctx.discoveredArtistsInApp = new Set();
  }
  const prefs = { style: "house", ...(useBpm ? { bpm: String(ctx.resolveExactBpm(candidate)) } : {}) };
  assert.equal(await ctx.generateRecommendationFromPrefs(prefs, { allowKnownFallback: familiar }), true,
    familiar ? "Explicit familiar-artist mode remains usable" : "A fresh eligible artist must still be recommended");
  assert.equal(ctx.currentRecommendation, candidate);
  assert.equal(ctx.trackBlockedByKnownSignals(candidate), true, "A delivered recording must enter the actual history");
}

{
  const { ctx, candidate } = contextWithOldArtist();
  ctx.addArtistKeysToSet(ctx.rejectedArtists, candidate.artist);
  assert.equal(await ctx.generateRecommendationFromPrefs({ style: "house" }, { allowKnownFallback: true, resetRejected: true }), true,
    "An explicit rejection reset must take effect before hard exclusions are built");
}

for (const memoryName of ["knownArtistsMemory", "blockedArtistsMemory", "rejectedArtists"]) {
  const { ctx, candidate } = contextWithOldArtist();
  ctx.addArtistKeysToSet(ctx[memoryName], candidate.artist);
  assert.equal(await ctx.pickPlayableReplacementForPrefs({ style: "house" }, { allowKnownFallback: true }), null,
    `Explicit familiar-artist mode must respect ${memoryName}`);
  const previous = ctx.currentRecommendation;
  assert.equal(await ctx.generateRecommendationFromPrefs({ style: "house" }, { allowKnownFallback: true }), false,
    `The main generator must respect ${memoryName}, including its precision and emergency paths`);
  assert.equal(ctx.currentRecommendation, previous);
}

console.log("No-repeat fallbacks passed: old artists, failed previews, style/BPM exhaustion, previous-card preservation, explicit familiar mode and hard exclusions.");
