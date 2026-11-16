import assert from "node:assert/strict";
import { createRequire } from "node:module";
import { createAppRuntimeTestContext } from "./app-runtime-test-harness.mjs";
const require = createRequire(import.meta.url);
const { selectTracks } = require("../discovery-experience.js");
const rows = [
  { key: "a", song: "Água", artist: "Zélia", style: "house", likedAt: "2026-01-02" },
  { key: "b", song: "Brisa", artist: "Ana", style: "techno", likedAt: "2026-01-04" }
];
const before = JSON.stringify(rows);
assert.equal(selectTracks(rows, "agua zelia")[0].key, "a");
assert.equal(selectTracks(rows, "melódico", "recent", "pt", style => style === "house" ? "House melódico" : style)[0].key, "a");
assert.equal(selectTracks(rows, "inexistente").length, 0);
assert.equal(selectTracks(rows)[0].key, "b");
assert.equal(selectTracks(rows, "", "title")[0].key, "a");
assert.equal(selectTracks(rows, "", "artist")[0].key, "b");
assert.equal(JSON.stringify(rows), before, "Search and sort must not mutate saved history");
const makeContext = () => {
  const played = [];
  const good = { key: "a", artist: "Zélia", song: "Água", style: "house", eligible: true };
  const state = createAppRuntimeTestContext();
  Object.assign(state, {
    recommendationRunBusy: false, swipeFeedbackBusy: false, firstRecommendationBusy: false,
    currentRecommendation: null, currentLocale: () => "pt", currentLanguage: "pt", profile: "one",
    recommendationSessionGeneration: 1,
    recommendationSessionIsCurrent: generation => state.recommendationSessionGeneration === generation,
    sessionProfileKey: () => state.profile, discoveryExperienceCopy: () => ({ opening: "Opening", play: "Play", unavailable: "Unavailable" }),
    prepareExplicitPreviewAudio() { state.audioPrepared = true; }, normalize: value => value, CURATED_FRIENDLY_OPENING_TRACKS: [good],
    catalog: [{ ...good, eligible: false }], recommendationTrackKey: track => track.key,
    isTrackEligibleForRecommendation: track => track.eligible, hydrateExternalDatasetPackInBackground: async () => {},
    activeTab: "profile", currentActiveAppTabName: () => state.activeTab,
    waitForPromiseWithTimeout: promise => promise, setActiveAppTab(tab) { state.activeTab = tab; },
    stopAllActivePlayback() {}, restoreRecommendationSurfaceSnapshot: value => played.push(value.track),
    trackRecommendationEvent() {}, likedTrackHistory: [], lastPrefs: {}, showToast() {}, document: { getElementById: () => null }
  });
  return { state, played };
};
let { state, played } = makeContext();
await state.openSavedLibraryTrack({ key: "a" }, {});
assert.equal(state.audioPrepared, true, "A library play request must prepare audible playback");
assert.equal(state.activeTab, "discover", "Library replay must reveal the player in its own tab");
assert.equal(played.length, 1, "Saved opening-deck tracks must replay even if missing or rejected in the main catalog");
assert.equal(state.recommendationRunBusy, false);
({ state, played } = makeContext());
state.CURATED_FRIENDLY_OPENING_TRACKS = [];
state.catalog = [];
state.hydrateExternalDatasetPackInBackground = async () => { state.profile = "two"; state.catalog.push({ key: "a", eligible: true }); };
await state.openSavedLibraryTrack({ key: "a" }, {});
assert.equal(played.length, 0, "A delayed library lookup must not cross signed-in profiles");
assert.equal(state.recommendationRunBusy, false);
state.CURATED_FRIENDLY_OPENING_TRACKS = [];
state.catalog = [];
state.hydrateExternalDatasetPackInBackground = async () => { state.activeTab = "recommends"; state.catalog.push({ key: "a", eligible: true }); };
await state.openSavedLibraryTrack({ key: "a" }, {});
assert.equal(played.length, 0, "A delayed library lookup must leave the newer tab open");
assert.equal(state.activeTab, "recommends");
console.log("Discovery experience passed: accented search, multi-term match, localized style search, stable saved data, replay, profile isolation and tab isolation.");
