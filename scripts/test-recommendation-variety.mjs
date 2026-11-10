#!/usr/bin/env node

import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { createAppRuntimeTestContext } from "./app-runtime-test-harness.mjs";

const runtimeRoot = new URL("../data/runtime-catalog-v1/", import.meta.url);
const manifest = JSON.parse(await readFile(new URL("manifest.json", runtimeRoot), "utf8"));
const styles = ["psycore", "dark_psy", "hi_tech", "slambient", "techno", "house", "drum_and_bass"];
const pathCounts = { ranked: 0, fast: 0, interaction: 0 };
const results = [];

for (const style of styles) {
  const context = createAppRuntimeTestContext();
  let randomSeed = 2321;
  context.Math = Object.assign(Object.create(Math), {
    random: () => ((randomSeed = (Math.imul(randomSeed, 1664525) + 1013904223) >>> 0) / 4294967296)
  });
  context.currentAuthUser = { mode: "login", username: "variety-benchmark" };
  context.currentCurationUserSeed = () => "variety-account";
  context.currentCurationVisitId = () => "variety-visit";
  context.curationOpenSeed = "variety-open";

  const rows = JSON.parse(await readFile(new URL(manifest.styles[style], runtimeRoot), "utf8"));
  context.mergeExternalDatasetRows(rows, `dataset_local_runtime_${style}`);
  context.sanitizeCatalogByStyleRules();
  context.purgeDynamicMismatches(style);
  // These calls explicitly lock the style. Other style shards cannot be
  // selected, so omit their starter rows to keep the benchmark inexpensive.
  context.catalog = context.catalog.filter((track) => track.style === style);
  const prefs = { style };
  const delivered = [];
  const select = {
    ranked: () => {
      const artists = context.buildGlobalArtistExclusionSet();
      const tracks = context.buildGlobalTrackExclusionSet();
      return context.pickRecommendation(prefs, artists, artists, tracks.keys, tracks.titles);
    },
    fast: () => context.pickInstantPrimaryNextTrack(context.currentRecommendation, style),
    interaction: () => context.pickInteractionBudgetTrack({ prefs, sourceTrack: context.currentRecommendation })
  };

  // Switch between real delivery paths while keeping the same artist and
  // recording ledgers. No eligibility, style-evidence or exclusion guard is
  // replaced by the harness.
  for (const [name, pick] of Object.entries(select)) {
    const track = pick();
    if (!track) continue;
    assert.equal(track.style, style, `${name}: the explicit ${style} lock must hold`);
    assert.equal(context.isTrackEligibleForRecommendation(track), true, `${name}: ${style} recording must be eligible`);
    assert.equal(context.trackMatchesRequestedSubgenreEvidence(track, prefs), true, `${name}: ${style} requires real style evidence`);
    assert.equal(context.trackBlockedByKnownSignals(track), false, `${name}: ${style} cannot return a heard track`);
    assert.ok(
      delivered.every((previous) => context.recommendationTrackKey(previous) !== context.recommendationTrackKey(track)),
      `${name}: ${style} must not repeat a delivered recording`
    );
    assert.ok(
      delivered.every((previous) => !context.artistsShareIdentity(previous.artist, track.artist)),
      `${name}: ${style} must not repeat a delivered artist or collaboration component`
    );
    delivered.push(track);
    context.markRecommendationPresented(track);
    context.currentRecommendation = track;
    pathCounts[name] += 1;
  }
  assert.ok(delivered.length >= 1, `${style}: the actual catalog must support a recommendation`);

  // Continue this same listener's history with the rest of the loaded catalog
  // already heard. Exhaustion must return no candidate on every path, without
  // clearing history or recycling an artist to manufacture more rounds.
  for (const track of context.catalog) context.markRecommendationPresented(track);
  for (const [name, pick] of Object.entries(select)) {
    assert.equal(pick(), null, `${name}: exhausted ${style} must not recycle a recording or artist`);
  }
  results.push({ style, loadedTracks: context.catalog.length, freshDeliveries: delivered.length });
}

for (const [name, count] of Object.entries(pathCounts)) {
  assert.ok(count > 0, `${name}: the benchmark must execute an actual fresh recommendation`);
}
console.table(results);
console.log(`Recommendation variety passed: ${styles.length} real catalog styles, ${Object.values(pathCounts).reduce((sum, count) => sum + count, 0)} fresh deliveries across ranked/fast/interaction paths, no repeated artist or track, and all paths stop on exhaustion. Playback network availability is outside this offline test.`);
