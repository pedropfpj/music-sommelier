import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {createAppRuntimeTestContext} from './app-runtime-test-harness.mjs';

const ctx = createAppRuntimeTestContext();
const rows = JSON.parse(await readFile(new URL('../data/runtime-catalog-v1/styles/disco_house.json', import.meta.url), 'utf8'));
ctx.mergeExternalDatasetRows(rows, 'dataset_local_runtime');
let now = 0;
let lookups = 0;
const pendingTimers = new Set();
const epoch = Date.now();
ctx.Date = class extends Date { static now() { return epoch + now; } };
ctx.window.setTimeout = (callback, ms) => {
  const timer = setImmediate(() => {
    pendingTimers.delete(timer);
    now += ms;
    callback();
  });
  pendingTimers.add(timer);
  return timer;
};
ctx.window.clearTimeout = timer => {
  clearImmediate(timer);
  pendingTimers.delete(timer);
};
const hung = () => { lookups++; return new Promise(() => {}); };
ctx.prepareCatalogForFastRecommendation = hung;
ctx.ensureStyleCoverageFast = hung;
ctx.resolvePreviewForTrack = hung;
ctx.expandCatalogForArtistDepth = hung;
ctx.trackHasPlayablePreviewExperience = () => false;
ctx.captureRecommendationSurfaceSnapshot = () => ({track: ctx.currentRecommendation});
ctx.restoreRecommendationSurfaceSnapshot = snapshot => { ctx.currentRecommendation = snapshot.track; };
ctx.currentRecommendation = {artist: 'Previously heard', song: 'Keep this card', style: 'disco_house'};
const previous = ctx.currentRecommendation;
const result = await ctx.generateRecommendationFromPrefs({style: 'disco_house'}, {avoidArtistName: previous.artist});
assert.equal(result, false, 'Hung preview providers must finish without presenting an unverified track');
assert.ok(now <= 8000, `Filtered selection exceeded the shared budget: ${now}ms`);
assert.ok(lookups > 1, 'Exercise multiple provider attempts rather than an empty catalog');
assert.equal(pendingTimers.size, 0, 'Timeout timers must be cleared');
assert.equal(ctx.currentRecommendation, previous, 'Exhaustion must preserve the previous card');
console.log(`Filtered search passed: ${lookups} hung provider attempts share ${now}ms; previous card retained.`);
