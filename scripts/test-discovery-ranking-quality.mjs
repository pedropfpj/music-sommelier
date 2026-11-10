#!/usr/bin/env node

import assert from "node:assert/strict";
import { createAppRuntimeTestContext } from "./app-runtime-test-harness.mjs";

const ctx = createAppRuntimeTestContext();
ctx.Math = Object.assign(Object.create(Math), { random: () => 0.5 });
ctx.hashUnit = () => 0.5;
// Isolate the candidate scores from the separate visit/exposure diversification.
ctx.curationDiversityScore = () => 0;
const seed = ctx.catalog.find((track) => track.style === "house" && track.bpmExact === 122);
assert.ok(seed, "The runtime catalog must supply a real house recording for the quality checks");
const failures = [];

function check(name, run) {
  try {
    run();
    console.log(`PASS ${name}`);
  } catch (error) {
    failures.push(`${name}: ${error.message}`);
    console.error(`FAIL ${name}: ${error.message}`);
  }
}

check("Explicit subgenre rejection survives surprise ranking", () => {
  assert.equal(ctx.recommendationScore(seed, { style: "techno" }), -1000000);
  assert.equal(ctx.scoreDiversePoolTrack(seed, { style: "techno" }), -1000000);
  assert.equal(ctx.diverseTrackEntriesForPool([seed], { style: "techno" }).length, 0);
  assert.equal(ctx.pickDiverseTrackFromPool([seed], { style: "techno" }), null);
});

check("Explicit BPM rejection survives surprise ranking", () => {
  const prefs = { style: "house", bpm: "150-174" };
  assert.equal(ctx.recommendationScore(seed, prefs), -1000000);
  assert.equal(ctx.diverseTrackEntriesForPool([seed], prefs).length, 0);
  assert.equal(ctx.pickDiverseTrackFromPool([seed], prefs), null);
});

check("Visit jitter cannot lift a hard rejection into the selection pool", () => {
  const originalHash = ctx.hashUnit;
  const originalRandom = ctx.Math.random;
  try {
    ctx.hashUnit = () => 1;
    ctx.Math.random = () => 0.999999;
    assert.equal(ctx.diverseTrackEntriesForPool([seed], { style: "techno" }).length, 0);
    assert.equal(ctx.pickDiverseTrackFromPool([seed], { style: "techno" }), null);
  } finally {
    ctx.hashUnit = originalHash;
    ctx.Math.random = originalRandom;
  }
});

check("Empty or rejected pools return no candidate", () => {
  assert.equal(ctx.diverseTrackEntriesForPool([]).length, 0);
  assert.equal(ctx.diverseTrackEntriesForPool([null, undefined]).length, 0);
  assert.equal(ctx.pickDiverseTrackFromPool([]), null);
});

check("Actual playback quality remains visible above the old score ceiling", () => {
  const weaker = {
    ...seed,
    song: `${seed.song} (quality fixture)`,
    previewUrl: "",
    deezerTrackId: "",
    previewChecked: true,
    previewMissing: true
  };
  const prefs = { style: "house" };
  const highScore = ctx.recommendationScore(seed, prefs);
  const lowScore = ctx.recommendationScore(weaker, prefs);
  assert.ok(lowScore > 8 && highScore > lowScore + 8, "Both real scores must exceed the former cap with a meaningful quality gap");
  const entries = ctx.diverseTrackEntriesForPool([weaker, seed], prefs);
  const high = entries.find((entry) => entry.track === seed);
  const low = entries.find((entry) => entry.track === weaker);
  assert.ok(Math.abs((high.score - low.score) - (highScore - lowScore)) < 1e-9,
    "Surprise selection must preserve the quality difference calculated by the real scorer");
  assert.equal(ctx.pickDiverseTrackFromPool([weaker, seed], prefs, { scoreBand: 1 }), seed);
});

check("Learned track preferences affect the actual surprise ranking", () => {
  const preferred = { ...seed, song: `${seed.song} (preferred fixture)` };
  const avoided = { ...seed, song: `${seed.song} (avoided fixture)` };
  const prefs = { style: "house" };
  ctx.registerTrackPreferenceSignal(preferred, 4);
  ctx.registerTrackPreferenceSignal(avoided, -4);
  const preferredScore = ctx.recommendationScore(preferred, prefs);
  const avoidedScore = ctx.recommendationScore(avoided, prefs);
  assert.ok(avoidedScore > 8 && preferredScore > avoidedScore + 10,
    "Learned signals must create a meaningful gap while both scores exceed the former cap");
  const entries = ctx.diverseTrackEntriesForPool([avoided, preferred], prefs);
  assert.equal(entries[0].track, preferred);
  assert.ok(entries[0].score > entries[1].score + 10, "Candidate selection must retain learned preference strength");
  assert.equal(ctx.pickDiverseTrackFromPool([avoided, preferred], prefs, { scoreBand: 1 }), preferred);
});

check("Early scoring fallback stays finite without reviving explicit rejections", () => {
  const score = ctx.recommendationScore;
  try {
    for (const invalid of [NaN, Infinity, -Infinity]) {
      ctx.recommendationScore = () => invalid;
      assert.ok(Number.isFinite(ctx.scoreDiversePoolTrack(seed)));
      assert.ok(ctx.diverseTrackEntriesForPool([seed]).every((entry) => Number.isFinite(entry.score)));
    }
    ctx.recommendationScore = () => { throw new Error("Scorer not initialized yet"); };
    assert.ok(Number.isFinite(ctx.scoreDiversePoolTrack(seed)));
    ctx.recommendationScore = () => -1000000;
    assert.equal(ctx.pickDiverseTrackFromPool([seed]), null);
  } finally {
    ctx.recommendationScore = score;
  }
});

assert.equal(failures.length, 0, failures.join("\n"));
console.log("Discovery ranking quality passed: hard constraints, full quality scores, learned preferences and finite early fallback.");
