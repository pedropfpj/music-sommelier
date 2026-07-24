#!/usr/bin/env node

import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const rootDir = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const source = fs.readFileSync(path.join(rootDir, "app.js"), "utf8");

function section(startMarker, endMarker) {
  const start = source.indexOf(startMarker);
  const end = source.indexOf(endMarker, start + startMarker.length);
  assert.ok(start >= 0, `Missing start marker: ${startMarker}`);
  assert.ok(end > start, `Missing end marker: ${endMarker}`);
  return source.slice(start, end);
}

const curatedBandcamp = section(
  "const CURATED_BANDCAMP_TRACK_EXPANSION = [",
  "const CURATED_TECHNO_SUBGENRE_EXPANSION"
);
const styleRunner = section(
  "async function runSwipeStyleRecommendation",
  "async function runRecommendation"
);
const feedbackAdvance = section(
  "async function advanceAfterSwipeFeedback",
  "async function likeCurrentTrackFromSwipe"
);
const primaryPicker = section(
  "function pickInstantPrimaryNextTrack",
  "function tryRunInstantPrimaryRecommendation"
);
const instantPresenter = section(
  "function presentInstantSwipeRecommendation",
  "function pickInstantOpeningTrack"
);

const slambientTrackCount = (curatedBandcamp.match(/style:\s*"slambient"/g) || []).length;
const slambientTrackIds = (curatedBandcamp.match(/bandcampTrackId:\s*"\d+"/g) || []).length;
assert.ok(slambientTrackCount >= 18, "Slambient needs a deep local catalog for stress tests.");
assert.ok(slambientTrackIds >= slambientTrackCount, "Every Slambient track needs an embeddable Bandcamp id.");

assert.match(styleRunner, /tryPresentInteractionBudgetRecommendation/);
assert.match(styleRunner, /action:\s*"style_deck"/);
assert.ok(
  styleRunner.indexOf("tryPresentInteractionBudgetRecommendation") < styleRunner.indexOf("generateRecommendationWithOverlay"),
  "Opera must get a synchronous playable card before the slow overlay route."
);
assert.match(feedbackAdvance, /pickInstantPrimaryNextTrack\(likedTrack, anchoredStyle\)/);
assert.ok(
  feedbackAdvance.indexOf("pickInstantPrimaryNextTrack(likedTrack, anchoredStyle)") < feedbackAdvance.indexOf("tryAdvanceNegativeFeedbackInstantly"),
  "Locked Slambient feedback must stay on the fast local route."
);
assert.doesNotMatch(
  primaryPicker,
  /allowSeenArtist:\s*true/,
  "Opera fast fallback must not recycle the previous artist."
);
assert.doesNotMatch(
  primaryPicker,
  /allowSeenTrack:\s*true/,
  "Opera fast fallback must not recycle a previously presented track."
);
assert.match(primaryPicker, /buildGlobalArtistExclusionSet/);
assert.match(primaryPicker, /artistSetHasMatch\(blockedArtists,\s*track\.artist\)/);
assert.match(primaryPicker, /trackHasReadyPlaybackRoute/);
assert.ok(
  instantPresenter.indexOf("renderRecommendation(track, finalPrefs)") < instantPresenter.indexOf("pickDiscovery(finalPrefs"),
  "Opera must paint the replacement card before calculating secondary discovery content."
);
assert.match(instantPresenter, /window\.setTimeout\(\(\) =>/);

console.log(`Opera Slambient fast-path tests passed: ${slambientTrackCount} curated Bandcamp tracks and no overlay on the ready route.`);
