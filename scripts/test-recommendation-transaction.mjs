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
  assert(start >= 0, `Missing start marker: ${startMarker}`);
  assert(end > start, `Missing end marker: ${endMarker}`);
  return source.slice(start, end);
}

const stableSurface = section(
  "function captureRecommendationSurface",
  "function swipeThresholds"
);
const presenter = section(
  "function presentInstantSwipeRecommendation",
  "function pickInstantOpeningTrack"
);
const primaryAction = section(
  "async function runPrimaryRecommendationAction",
  "function negativeFeedbackBasePrefs"
);
const generationTransaction = section(
  "async function generateRecommendationFromPrefs(prefs, options = {})",
  "async function generateRecommendationWithOverlay"
);
const generationCore = section(
  "async function generateRecommendationFromPrefsInternal",
  "async function generateRecommendationFromPrefs(prefs, options = {})"
);
const instantOpening = section(
  "function pickInstantOpeningTrack",
  "function pickInstantPrimaryNextTrack"
);
const initialAutoRoute = section(
  "function enterAppFromWelcome",
  "function applySharedSpiritPayload"
);
const styleRunner = section(
  "async function runSwipeStyleRecommendation",
  "async function runRecommendation"
);
const manualRunner = section(
  "async function runManualFilterSurprise",
  "async function runSurpriseRecommendation"
);
const feedbackAdvance = section(
  "async function advanceAfterSwipeFeedback",
  "async function likeCurrentTrackFromSwipe"
);
const deliveryMemory = section(
  "function registerGlobalRecommendation",
  "function clearRecentHistoryIfExhausted"
);

assert.match(stableSurface, /lastStableRecommendationSurface/);
assert.match(stableSurface, /trackHasReadyPlaybackRoute\(track\)/);
assert.match(stableSurface, /restoreStableRecommendationSurface/);
assert.match(stableSurface, /renderRecommendation\(stable\.track, stablePrefs\)/);
assert.match(stableSurface, /resultPanel\.classList\.remove\("hidden"\)/);
assert.match(stableSurface, /if \(restoreStableRecommendationSurface\(\)\) return true/);
assert.doesNotMatch(
  stableSurface.slice(0, stableSurface.indexOf("function clearFailedRecommendationSurface")),
  /currentRecommendation = null/
);

assert.match(presenter, /\(requestedPrefs\.style && trackStyle !== requestedPrefs\.style\)/);
assert.match(presenter, /\(lockedStyle && trackStyle !== lockedStyle\)/);
assert.match(presenter, /rememberStableRecommendationSurface\(track, finalPrefs, currentDiscovery\)/);
assert.match(presenter, /window\.setTimeout\(\(\) =>/);
assert.match(presenter, /recommendationTrackKey\(currentRecommendation\) !== discoveryTrackKey/);

assert.match(primaryAction, /const lockedStyle = explicitSwipeAnchorStyle\(\)/);
assert.match(primaryAction, /style: lockedStyle/);
assert.match(primaryAction, /allowKnownFallback: true/);
assert.ok(
  primaryAction.indexOf("const lockedStyle = explicitSwipeAnchorStyle()") <
    primaryAction.indexOf("return runSurpriseRecommendation()"),
  "A locked style must be handled before the cross-style surprise fallback."
);

assert.match(generationTransaction, /captureRecommendationSurface\(\)/);
assert.match(generationTransaction, /recommendationSurfaceCommitRevision === surfaceRevisionBeforeRequest/);
assert.match(generationTransaction, /restoreStableRecommendationSurface\(surfaceBeforeRequest\)/);
assert.match(generationTransaction, /generateRecommendationFromPrefsInternal\(prefs, options\)/);
assert.match(generationCore, /const isStyleFallbackLocked = \(\) => Boolean\(prefs\?\.style\)/);
assert.match(generationCore, /if \(isStyleFallbackLocked\(\)\) return false/);
assert.match(instantOpening, /const requestedStyle = selectableSwipeStyle\(options\?\.style \|\| ""\)/);
assert.match(instantOpening, /requestedStyle\s*\?\s*\[requestedStyle\]/);
assert.match(initialAutoRoute, /swipeUserAnchoredStyle = focusedPrefs\.style/);
assert.match(initialAutoRoute, /allowKnownFallback: true/);
assert.doesNotMatch(
  initialAutoRoute,
  /onFallback\("focused_onboarding"\);[\s\S]{0,180}runSurpriseRecommendation/
);

assert.match(styleRunner, /swipeUserAnchoredStyle = safeStyle/);
assert.match(styleRunner, /selectableSwipeStyle\(currentRecommendation\?\.style \|\| ""\) !== safeStyle/);
assert.match(manualRunner, /swipeUserAnchoredStyle = prefs\.style \? selectableSwipeStyle\(prefs\.style\) : ""/);
assert.match(manualRunner, /if \(!generated\)[\s\S]*?return false/);
assert.match(feedbackAdvance, /const anchoredStyle = explicitSwipeAnchorStyle\(\)/);
assert.match(feedbackAdvance, /style: anchoredStyle/);
assert.match(deliveryMemory, /function registerRecentRecommendationDelivery/);
assert.match(deliveryMemory, /recentRecommendationDeliveryQueue = recentRecommendationDeliveryQueue\.filter/);
assert.match(source, /registerRecentRecommendationDelivery\(trackKey\)/);

console.log("Recommendation transaction tests passed: style locks are strict, stale failures cannot overwrite a newer card, and the last playable surface is preserved.");
