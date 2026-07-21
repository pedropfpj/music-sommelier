#!/usr/bin/env node

import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const rootDir = path.resolve(__dirname, "..");
const source = fs.readFileSync(path.join(rootDir, "app.js"), "utf8");

function section(startMarker, endMarker) {
  const start = source.indexOf(startMarker);
  const end = source.indexOf(endMarker, start + startMarker.length);
  assert(start >= 0, `Missing start marker: ${startMarker}`);
  assert(end > start, `Missing end marker: ${endMarker}`);
  return source.slice(start, end);
}

const verificationGate = section(
  "function verifiedPreviewUrlForTrack",
  "function isLikelyCompilationEntry"
);
const instantPresenter = section(
  "function presentInstantSwipeRecommendation",
  "function pickInstantOpeningTrack"
);
const primaryPicker = section(
  "function pickInstantPrimaryNextTrack",
  "function tryRunInstantPrimaryRecommendation"
);
const validatedPrimary = section(
  "async function tryRunValidatedPrimaryRecommendation",
  "function catalogHasMinimumRecommendationState"
);
const negativePicker = section(
  "function fastNegativeFeedbackTrackAllowed",
  "function presentFastNegativeFeedbackRecommendation"
);
const replacementPicker = section(
  "async function pickPlayableReplacementForPrefs",
  "async function ensureCurrentRecommendationPlayable"
);
const previewRenderer = section(
  "async function renderPreview",
  "function visiblePreviewFrameHasSource"
);
const suggestionPrewarm = section(
  "function prewarmSuggestionQueue",
  "function scheduleSuggestionQueueRefresh"
);
const previewPlayback = section(
  "async function startTrackPreviewPlayback",
  "function applyAudioMasterVolume"
);
const swipeAdvance = section(
  "async function advanceAfterSwipeFeedback",
  "async function likeCurrentTrackFromSwipe"
);
const swipeLike = section(
  "async function likeCurrentTrackFromSwipe",
  "async function passCurrentTrackFromSwipe"
);

assert.match(verificationGate, /pickPlayablePreviewSource\(audio, candidates/);
assert.match(verificationGate, /markTrackPreviewVerified\(track, playable\)/);
assert.match(verificationGate, /track\.previewMissing = true/);
assert.match(verificationGate, /prewarmedSwipeTrackKeys\.has\(trackKey\)/);
assert.match(verificationGate, /function trackHasVerifiedEmbeddedPreview/);
assert.match(verificationGate, /isExactBandcampTrackUrl\(track\.bandcampTrackUrl\)/);
assert.match(verificationGate, /isTrustedCuratedCatalogTrack\(track\)/);
assert.match(verificationGate, /trackHasEmbeddableBandcampTrack\(track\)/);
assert.match(verificationGate, /function trackHasVerifiedPlaybackRoute/);
assert.match(verificationGate, /async function ensureTrackHasVerifiedPlaybackRoute/);
assert.match(verificationGate, /function prewarmOpeningPreviewGate/);
assert.match(verificationGate, /Promise\.allSettled/);
assert.match(verificationGate, /timeoutMs: 2400/);
assert.doesNotMatch(verificationGate, /track\.previewCandidates = \[\]/);

assert.match(instantPresenter, /!trackHasVerifiedPlaybackRoute\(track\)/);
assert.match(primaryPicker, /trackHasVerifiedPlaybackRoute\(track\)/);
assert.match(primaryPicker, /locked-style-artist-recycle/);
assert.match(primaryPicker, /locked-style-track-recycle/);
assert.doesNotMatch(primaryPicker, /global-local|`local:/);
assert.match(validatedPrimary, /validationCandidates\.slice\(0, 3\)/);
assert.match(validatedPrimary, /timeoutMs: 1450/);
assert.match(validatedPrimary, /maxCandidates: 1/);
assert.match(validatedPrimary, /new Promise\(\(resolve\) =>/);
assert.doesNotMatch(validatedPrimary, /fetch\(|resolvePreviewForTrack/);
assert.match(source, /const FAST_PLAYABLE_STARTERS = \[/);
assert.match(source, /function hydrateFastPlayableStarters\(\)/);
assert.match(source, /hydrateFastPlayableStarters\(\)/);
assert.match(source, /void prewarmOpeningPreviewGate\(\)/);
assert.ok(
  (source.match(/audio-ssl\.itunes\.apple\.com\/itunes-assets\/AudioPreview/g) || []).length >= 25,
  "The compact starter pool must keep enough playable artists for varied no-login sessions."
);
assert.doesNotMatch(source, /hydrateFastPlayableDataset|FAST_PLAYABLE_DATASET_FILES|fastPlayableDatasetPromise/);
assert.match(negativePicker, /trackHasVerifiedPlaybackRoute\(track\)/);
assert.match(negativePicker, /allowSeenArtist/);

assert.match(replacementPicker, /ensureTrackHasVerifiedPlaybackRoute\(candidate/);
assert.doesNotMatch(replacementPicker, /if \(trackHasPlayablePreviewExperience\(candidate\)\) return candidate/);
assert.match(previewRenderer, /markTrackPreviewVerified\(track, playable\)/);
assert.match(previewRenderer, /verifiedPreviewUrlForTrack\(track\)/);
assert.match(previewRenderer, /trackPreview\.src = verifiedPreview/);
assert.match(previewRenderer, /trackPreview\.dataset\.previewTrackKey = renderPreviewTrackKey/);
assert.match(previewRenderer, /normalizePreviewUrl\(playablePreview\)/);
assert.doesNotMatch(previewRenderer, /previewSoundcloudSearchHint/);

assert.match(suggestionPrewarm, /markTrackPreviewVerified\(track, previewUrl\)/);
assert.match(suggestionPrewarm, /\.slice\(0, 3\)/);
assert.doesNotMatch(source, /prewarmGuidedPreviewPool|guidedPreviewPrewarmPromise/);
assert.match(previewPlayback, /preserve: "preview"/);
assert.match(previewPlayback, /loadedSource !== normalizePreviewUrl\(previewSource\)/);
assert.match(previewPlayback, /audioEl\.getAttribute\?\.\("src"\) \|\|\s*audioEl\.src \|\|\s*audioEl\.currentSrc/);
assert.match(source, /if \(trackPreview\?\.dataset\.previewProbing === "true"\) return/);
assert.match(source, /previewTrackKey !== currentTrackKey/);
assert.match(swipeAdvance, /await tryRunValidatedPrimaryRecommendation/);
assert.match(swipeAdvance, /positive \? "like_validated" : "dislike_validated"/);
assert.match(swipeAdvance, /pickInstantPrimaryNextTrack\(likedTrack, anchoredStyle\)/);
assert.ok(
  swipeAdvance.indexOf("pickInstantPrimaryNextTrack(likedTrack, anchoredStyle)") < swipeAdvance.indexOf("tryAdvanceNegativeFeedbackInstantly"),
  "Locked subgenres must reuse the instant verified route before slower feedback fallbacks."
);
assert.ok(
  swipeLike.indexOf("await advanceAfterSwipeFeedback") < swipeLike.indexOf("burstConfetti"),
  "The next playable card must render before non-critical celebration work."
);

console.log("Playable preview gate tests passed: instant cards require verified direct audio or an exact curated Bandcamp embed, and failed previews auto-skip.");
