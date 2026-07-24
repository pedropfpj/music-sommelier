#!/usr/bin/env node
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { minifyJavaScript } from "./web-build-utils.mjs";

const rootDir = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const [appSource, indexSource, shippedBundle] = await Promise.all([
  readFile(path.join(rootDir, "app.js"), "utf8"),
  readFile(path.join(rootDir, "index.html"), "utf8"),
  readFile(path.join(rootDir, "app.min.js"), "utf8")
]);

const targetMatch = appSource.match(/const DISCOVERY_INTERACTION_TARGET_MS = (\d+);/);
assert.ok(targetMatch, "discovery interaction target is missing");
assert.ok(Number(targetMatch[1]) < 2000, "internal discovery target must leave headroom below 2 seconds");

assert.match(
  appSource,
  /function advanceAfterSwipeFeedback[\s\S]*?tryPresentInteractionBudgetRecommendation[\s\S]*?generateAdaptiveSwipeNext/,
  "swipe feedback must use the local deadline-safe path before asynchronous catalog work"
);
assert.match(
  appSource,
  /async function runRecommendation[\s\S]*?tryPresentInteractionBudgetRecommendation[\s\S]*?withSearchOverlay/,
  "manual track search must use the local deadline-safe path before the network overlay"
);
assert.match(
  appSource,
  /bind\(rerollBtn,[\s\S]*?tryPresentInteractionBudgetRecommendation[\s\S]*?generateRecommendationWithOverlay/,
  "reroll must consume the prepared local queue before full generation"
);
assert.match(
  appSource,
  /async function likeCurrentTrackFromSwipe[\s\S]*?await advanceAfterSwipeFeedback[\s\S]*?schedulePostBootIdleTask[\s\S]*?registerTrackFeedback/,
  "like must present the next track before profile persistence and enrichment"
);
assert.match(
  appSource,
  /async function passCurrentTrackFromSwipe[\s\S]*?await advanceAfterSwipeFeedback[\s\S]*?schedulePostBootIdleTask[\s\S]*?registerTrackFeedback/,
  "dislike must present the next track before profile persistence and enrichment"
);
assert.match(
  appSource,
  /function pickInteractionBudgetTrack[\s\S]*?const relaxedPrefs[\s\S]*?for \(const track of catalog\)/,
  "interaction fallback must widen to the trusted local catalog before a provider lookup"
);
assert.match(
  appSource,
  /function interactionFallbackTrackAllowed[\s\S]*?trackHasReadyPlaybackRoute\(track\)/,
  "deadline-safe cards must already have an audio or embeddable playback route"
);
assert.match(
  appSource,
  /async function bootSonicSearch[\s\S]*?loadDynamicCatalogCache\(\);[\s\S]*?injectSoundCloudSupplementalSeeds\(\);[\s\S]*?scheduleLocalBootCatalogHydration\(\);/,
  "cold anonymous sessions must preload the small embeddable fallback set before full hydration"
);
const renderPreviewSource = appSource.slice(
  appSource.indexOf("async function renderPreview"),
  appSource.indexOf("function visiblePreviewFrameHasSource")
);
assert.ok(
  renderPreviewSource.indexOf("startPreferredEmbeddedPreviewAutoplay(track)") <
    renderPreviewSource.indexOf("await waitForPromiseWithTimeout(resolvePreviewForTrack"),
  "SoundCloud/Bandcamp autoplay must start before asynchronous preview discovery"
);
assert.match(
  appSource,
  /function preferredEmbeddedAutoplaySource[\s\S]*?trackHasDirectSoundCloudTrack[\s\S]*?trackHasEmbeddableBandcampTrack/,
  "automatic embeds must prefer SoundCloud and then use verified Bandcamp"
);
assert.match(
  appSource,
  /function pickInstantPrimaryNextTrack[\s\S]*?const globalReadyCandidate = catalog\.find\(candidateAllowed\)/,
  "other-track must keep a global playable fallback after starter styles are exhausted"
);
assert.match(
  appSource,
  /async function runPrimaryRecommendationAction[\s\S]*?!firstRecommendationCompleted && !currentRecommendation[\s\S]*?tryRunInstantPrimaryRecommendation\(\)[\s\S]*?catalogState: "instant_local"/,
  "the first anonymous card must use the playable local fast path before full catalog hydration"
);
assert.match(
  appSource,
  /function pickInstantSwipeTrack[\s\S]*?buildFastSwipeStylePlan[\s\S]*?rotatedFastFeedbackPool\(basePool, FAST_NEGATIVE_FEEDBACK_STARTER_SCAN_LIMIT\)/,
  "like and dislike must use the bounded hierarchical plan before any full-catalog scoring"
);
const instantPresentationSource = appSource.slice(
  appSource.indexOf("function presentInstantSwipeRecommendation"),
  appSource.indexOf("function pickInstantOpeningTrack")
);
assert.ok(
  instantPresentationSource.indexOf("renderPreview(track, { fast: true })") <
    instantPresentationSource.indexOf("registerRecommendationDelivery(track, finalPrefs)"),
  "instant cards must start playback before history, analytics, and queue preparation"
);
assert.match(
  appSource,
  /bind\(audioToggleBtn,[\s\S]*?resumeCurrentPreviewFromUserGesture\(\)/,
  "the explicit sound-unlock tap must immediately retry the current player"
);
assert.match(indexSource, /rel="preconnect" href="https:\/\/w\.soundcloud\.com"/, "SoundCloud must be preconnected");
assert.match(indexSource, /rel="preconnect" href="https:\/\/bandcamp\.com"/, "Bandcamp must be preconnected");
assert.match(indexSource, /id="soundcloudPreviewFrame"[\s\S]*?loading="eager"/, "SoundCloud iframe must load eagerly once a card assigns its URL");
assert.match(indexSource, /id="bandcampPreviewFrame"[\s\S]*?loading="eager"/, "Bandcamp iframe must load eagerly once a card assigns its URL");
assert.match(indexSource, /app\.min\.js\?v=20260724hybrid4/, "HTML must cache-bust the optimized bundle");

const rebuiltBundle = await minifyJavaScript(appSource, "app.js");
assert.equal(shippedBundle, rebuiltBundle, "app.min.js is stale; run npm run web:build");

console.log("Discovery performance contract passed: local-first interactions target < 2s and shipped bundle is current.");
