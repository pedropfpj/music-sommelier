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

const curatedBandcamp = section(
  "const CURATED_BANDCAMP_TRACK_EXPANSION = [",
  "const CURATED_TECHNO_SUBGENRE_EXPANSION"
);
const verifiedRoute = section(
  "function isExactBandcampTrackUrl",
  "let openingPreviewPrewarmPromise"
);
const primaryPicker = section(
  "function pickInstantPrimaryNextTrack",
  "function tryRunInstantPrimaryRecommendation"
);
const interactionFallback = section(
  "function interactionFallbackTrackAllowed",
  "function tryPresentInteractionBudgetRecommendation"
);
const instantPresenter = section(
  "function presentInstantSwipeRecommendation",
  "function pickInstantOpeningTrack"
);
const previewRenderer = section(
  "async function renderPreview",
  "function visiblePreviewFrameHasSource"
);
const anchoredFeedback = section(
  "async function advanceAfterSwipeFeedback",
  "async function likeCurrentTrackFromSwipe"
);
const styleDeckRunner = section(
  "async function runSwipeStyleRecommendation",
  "async function runRecommendation"
);

const slambientTrackCount = (curatedBandcamp.match(/style:\s*"slambient"/g) || []).length;
const bandcampIdCount = (curatedBandcamp.match(/bandcampTrackId:\s*"\d+"/g) || []).length;
const exactTrackUrlCount = (curatedBandcamp.match(/bandcampTrackUrl:\s*"https:\/\/[^"\s]+\.bandcamp\.com\/track\/[^"\s]+"/g) || []).length;

assert.ok(slambientTrackCount >= 18, "Slambient needs a deep curated playable catalog for stress testing.");
assert.ok(bandcampIdCount >= slambientTrackCount, "Every curated slambient entry needs an embeddable Bandcamp track id.");
assert.ok(exactTrackUrlCount >= slambientTrackCount, "Every curated slambient entry needs an exact Bandcamp track URL.");
assert.match(curatedBandcamp, /existenceVerified:\s*true/);
assert.match(curatedBandcamp, /source:\s*"verified_bandcamp_curated"/);

assert.match(verifiedRoute, /host\.endsWith\("\.bandcamp\.com"\)/);
assert.match(verifiedRoute, /\^\\\/track\\\/\[\^\/\]\+/);
assert.match(verifiedRoute, /isTrustedCuratedCatalogTrack\(track\)/);
assert.match(verifiedRoute, /trackHasEmbeddableBandcampTrack\(track\)/);
assert.match(verifiedRoute, /trackHasVerifiedPlayablePreview\(track\)\s*\|\|\s*trackHasVerifiedEmbeddedPreview\(track\)/);

assert.match(primaryPicker, /allowSeenArtist:\s*true/);
assert.match(primaryPicker, /allowSeenTrack:\s*true/);
assert.match(primaryPicker, /locked-style-artist-recycle/);
assert.match(primaryPicker, /locked-style-track-recycle/);
assert.match(interactionFallback, /!allowSeen\s*&&\s*artistSetHasMatch\(seenArtistsMemory/);
assert.match(instantPresenter, /trackHasVerifiedPlaybackRoute\(track\)/);
assert.match(anchoredFeedback, /pickInstantPrimaryNextTrack\(likedTrack, anchoredStyle\)/);
assert.match(anchoredFeedback, /presentInstantSwipeRecommendation/);
assert.ok(
  anchoredFeedback.indexOf("pickInstantPrimaryNextTrack(likedTrack, anchoredStyle)") < anchoredFeedback.indexOf("tryAdvanceNegativeFeedbackInstantly"),
  "A locked niche style must use the proven instant route before slower feedback fallbacks."
);
assert.match(styleDeckRunner, /tryPresentInteractionBudgetRecommendation/);
assert.match(styleDeckRunner, /action:\s*"style_deck"/);
assert.ok(
  styleDeckRunner.indexOf("tryPresentInteractionBudgetRecommendation") < styleDeckRunner.indexOf("generateRecommendationWithOverlay"),
  "Selecting Slambient must try the synchronous curated player before the catalog overlay."
);

assert.match(previewRenderer, /preferredEmbeddedAutoplaySource\(track\)/);
assert.match(previewRenderer, /startPreferredEmbeddedPreviewAutoplay\(track\)/);
assert.ok(
  previewRenderer.indexOf("startPreferredEmbeddedPreviewAutoplay(track)") < previewRenderer.indexOf("await waitForPromiseWithTimeout"),
  "The exact Bandcamp player must be created before an async boundary so the initiating tap is preserved."
);

console.log(`Slambient playable route tests passed: ${slambientTrackCount} curated tracks can use exact Bandcamp embeds and the locked style never empties.`);
