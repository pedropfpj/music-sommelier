import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import vm from "node:vm";

const source = await readFile(new URL("../app.js", import.meta.url), "utf8");
function extract(name) {
  const match = source.match(new RegExp(`(?:async )?function ${name}\\([\\s\\S]*?\\n}`));
  assert.ok(match, `Missing ${name}`);
  return match[0];
}

function harness(tracks = []) {
  let now = 0, lookups = 0, hydration = 0, pendingIndex = 0;
  const timers = new Map();
  const context = vm.createContext({
    Date: { now: () => now },
    window: {
      setTimeout(fn, ms) {
        const id = setImmediate(() => { timers.delete(id); now += ms; fn(); });
        timers.set(id, true); return id;
      },
      clearTimeout(id) { clearImmediate(id); timers.delete(id); }
    },
    SURPRISE_SEARCH_BUDGET_MS: 8000, SURPRISE_PREVIEW_LOOKUP_MS: 1200,
    SURPRISE_FAST_STYLE_LIMIT: 8, SURPRISE_FAST_TRACKS_PER_STYLE: 12, SURPRISE_FAST_POOL_LIMIT: 96,
    recommendationSessionGeneration: 1,
    recommendationSessionIsCurrent: generation => generation === context.recommendationSessionGeneration,
    currentRecommendation: null, recommendationMemory: [], catalog: tracks,
    normalize: value => value, recommendationTrackKey: track => track?.key || "",
    familyOf: style => style, artistMatchKey: artist => artist,
    buildGlobalArtistExclusionSet: () => new Set(["blocked artist"]),
    buildGlobalTrackExclusionSet: () => ({ keys: new Set(), titles: new Set() }),
    trackBlockedByKnownSignals: track => Boolean(track.seen),
    artistSetHasMatch: (set, artist) => set.has(artist),
    trackAllowedByTasteMaturity: () => true, trackAllowedForFriendlyFirstImpression: () => true,
    isTrackEligibleForRecommendation: () => true, hasReliableBpmForTrack: () => true,
    trackHasInstantPlaybackRoute: track => Boolean(track.ready),
    surpriseTrackHasExactBpmAndPreview: track => Boolean(track.ready),
    getAllSelectableStyles: () => [], catalogTracksForStyle: () => [],
    orderDiverseTracksForPool: pool => [...pool], pickSurpriseDiverseTrack: pool => pool[0],
    pickDiverseTrackFromPool: pool => pool[0],
    pickSurpriseTrackFromAnotherGenre: () => ({ key: `pending-${++pendingIndex}`, artist: "artist", style: "house" }),
    resolvePreviewForTrack: () => { lookups++; return new Promise(() => {}); },
    ensureStyleCoverageFast: async () => { hydration++; },
    waitForMainThreadBreath: async () => {}, t: key => key
  });
  vm.runInContext(["waitForPromiseWithTimeout", "createSurpriseSearchBudget", "pickValidatedSurpriseTrack", "resolveEmergencySurpriseTrack"].map(extract).join("\n"), context);
  return { context, stats: () => ({ now, lookups, hydration, timers: timers.size }) };
}

const base = { key: "previous", artist: "previous artist", style: "techno" };
const slow = harness();
const budget = slow.context.createSurpriseSearchBudget();
assert.equal(await slow.context.pickValidatedSurpriseTrack(base, null, budget), null);
assert.equal(await slow.context.resolveEmergencySurpriseTrack(base, null, budget), null);
assert.deepEqual(slow.stats(), { now: 8000, lookups: 7, hydration: 0, timers: 0 }, "Hung providers must share one total wait limit");

const ready = { key: "ready", artist: "new artist", style: "house", ready: true };
const local = harness([
  { ...ready, key: "seen", seen: true },
  { ...ready, key: "blocked", artist: "blocked artist" },
  ready
]);
assert.equal(await local.context.pickValidatedSurpriseTrack(base), ready, "Ready tracks outside the initial styles must precede network work");
assert.equal(local.stats().lookups, 0);

const emergency = harness([{ key: "slow", artist: "slow artist", style: "house" }, ready]);
assert.equal(await emergency.context.resolveEmergencySurpriseTrack(base), ready, "Emergency selection must prefer ready audio");
assert.equal(emergency.stats().lookups, 0);

const switched = harness();
const oldBudget = switched.context.createSurpriseSearchBudget();
switched.context.recommendationSessionGeneration++;
await oldBudget.wait(() => { throw new Error("Old profile work must not start"); });
assert.equal(switched.stats().timers, 0);

let hide;
const overlay = vm.createContext({
  searchOverlayLocks: 1, searchProgressTimer: 0, searchProgressValue: 90,
  window: { clearInterval() {}, setTimeout: fn => { hide = fn; } },
  stopSearchAudioPulse() {}, setSearchProgress() {}, searchProgressFill: { style: {} },
  searchOverlay: { classList: { add() { throw new Error("New search must remain visible"); } } }
});
vm.runInContext(extract("finishSearchOverlay"), overlay);
overlay.finishSearchOverlay();
overlay.searchOverlayLocks = 1;
hide();
assert.equal(overlay.searchProgressValue, 90);
console.log("Surprise search: bounded provider waits, ready local fallback, exclusions, profile changes and overlay races passed.");
