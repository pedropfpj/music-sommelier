import assert from 'node:assert/strict';
import { createRequire } from 'node:module';
import { createAppRuntimeTestContext } from './app-runtime-test-harness.mjs';
const require = createRequire(import.meta.url);
const experience = require('../discovery-experience.js');
const track = { artist: 'Zélia', song: 'Água', style: 'house' };
const base = createAppRuntimeTestContext();
base.window.SonicReleaseFlags = require("../release-flags.js");
base.isAppStoreRuntimeMode = () => true;
assert.equal(base.shouldDisableSocialCommentsForAppStore(), true, "Staged comments stay off in the next native package as well");
const key = base.recommendationTrackKey(track);
const link = experience.buildTrackLink({ key, style: 'house', language: 'pt', baseUrl: 'https://sonicsearch.app/?token=private&visitor=1&likes=100#secret' });
assert.deepEqual(experience.parseTrackLink(link), { key, style: 'house' });
assert.deepEqual([...new URL(link).searchParams.keys()], ['track', 'style', 'lang']);
assert.equal(new URL(link).hash, '');
for (const invalid of ['https://site.test/?track=https://evil.test/audio.mp3&style=house', 'https://site.test/?track=ok&style=../house', 'https://site.test/?track=&style=house']) assert.equal(experience.parseTrackLink(invalid).invalid, true);
assert.equal(experience.parseTrackLink('https://site.test/'), null);
assert.throws(() => experience.buildTrackLink({ key, style: 'house', baseUrl: 'javascript:alert(1)' }));

function context(url = link) {
  const ctx = createAppRuntimeTestContext(), nodes = new Map();
  const node = id => { if (!nodes.has(id)) nodes.set(id, { hidden: true, value: '', focus() {}, select() {}, scrollIntoView() {} }); return nodes.get(id); };
  Object.assign(ctx, {
    window: { SonicDiscoveryExperience: experience, setTimeout, clearTimeout },
    navigator: {}, document: { getElementById: node }, currentLanguage: 'pt',
    currentRecommendation: null, recommendationRunBusy: false, currentAppUrl: () => new URL(url),
    profile: 'recipient', tab: 'discover', sessionProfileKey: () => ctx.profile, currentActiveAppTabName: () => ctx.tab,
    catalog: [{ artist: 'Another artist', song: 'Água', style: 'house' }, track], CURATED_FRIENDLY_OPENING_TRACKS: [],
    STYLE_BPM_RULES: { house: {} }, isTrackEligibleForRecommendation: () => true,
    hydrateExternalDatasetPackInBackground: async () => {}, stopAllActivePlayback() {},
    setActiveAppTab: tab => { ctx.tab = tab; }, markRecommendationPresented() {}, updateStats() {},
    restoreRecommendationSurfaceSnapshot(snapshot, options) { ctx.currentRecommendation = snapshot.track; ctx.restored = options; },
    renderPreview: async (value, options) => { ctx.preview = { value, options }; },
    trackRecommendationEvent: (...args) => { ctx.events.push(args); }, events: [],
    isAppStoreRuntimeMode: () => false, showToast: text => { ctx.toast = text; }
  });
  return { ctx, node };
}
let { ctx, node } = context();
await ctx.openSharedCatalogTrack();
assert.equal(ctx.currentRecommendation, track, 'A shared title must resolve the exact artist and style');
assert.equal(ctx.preview.options.autoplay, false, 'Receiving a link never starts audio');
assert.equal(ctx.restored.restartPreview, false);
assert.equal(ctx.profile, 'recipient');
assert.equal(node('sharedTrackStatus').hidden, false);
assert.equal(ctx.events[0][0], 'shared_track_opened');

for (const change of ['profile', 'currentRecommendation', 'tab', 'recommendationRunBusy']) {
  ({ ctx, node } = context()); ctx.catalog = [];
  ctx.hydrateExternalDatasetPackInBackground = async () => { ctx.catalog = [track]; ctx[change] = change === 'recommendationRunBusy' ? true : 'newer-state'; };
  await ctx.openSharedCatalogTrack();
  assert.equal(ctx.preview, undefined, `Late share lookup must preserve ${change}`);
}
({ ctx, node } = context()); ctx.catalog = [];
ctx.hydrateExternalDatasetPackInBackground = async () => { throw new Error('offline'); };
await ctx.openSharedCatalogTrack();
assert.equal(ctx.currentRecommendation, null);
assert.equal(node('sharedTrackStatus').textContent, experience.webCopy.pt.missing);

({ ctx, node } = context()); ctx.catalog = [];
ctx.hydrateExternalDatasetPackInBackground = () => new Promise(() => {});
ctx.window.setTimeout = (fn, ms) => { ctx.waitBudget = ms; return setTimeout(fn, 0); };
await ctx.openSharedCatalogTrack();
assert.equal(ctx.waitBudget, 8000);
assert.equal(ctx.currentRecommendation, null);
assert.equal(node('sharedTrackStatus').textContent, experience.webCopy.pt.missing);

({ ctx, node } = context()); let copied;
ctx.navigator.clipboard = { writeText: async text => { copied = text; } };
await ctx.shareCatalogTrack(track, {});
assert.deepEqual(experience.parseTrackLink(copied), { key, style: 'house' });
assert.equal(ctx.events[0][0], 'track_link_copied');
({ ctx, node } = context());
ctx.navigator.clipboard = { writeText: async () => { throw new Error('permission denied'); } };
await ctx.shareCatalogTrack(track, {});
assert.equal(node('shareLinkFallback').hidden, false);
assert.equal(experience.parseTrackLink(node('shareLinkText').value).key, key);
assert.equal(ctx.events.length, 0, 'Manual fallback must not claim a completed share');
// Default release cannot invoke staged comment SQL or public-profile storage.
const commentsPath = require.resolve('../lib/api/_comments-legacy.js');
require(commentsPath); const originalLegacy = require.cache[commentsPath].exports;
let legacyCalls = 0;
require.cache[commentsPath].exports = async () => { legacyCalls += 1; };
const previousEnv = { ...process.env }, oldFetch = global.fetch;
try {
  delete process.env.SONIC_TRACK_VIDEO_SOCIAL_V2_ENABLED;
  await require('../lib/api/_comments.js')({}, {});
  assert.equal(legacyCalls, 1);
  process.env.SONIC_SOCIAL_ENABLED = 'true';
  delete process.env.SONIC_PUBLIC_PROFILES_ENABLED;
  global.fetch = async () => { throw new Error('Disabled profile must not contact storage'); };
  const res = { setHeader() {}, end(body) { this.body = body; } };
  await require('../lib/api/_user-profile.js')({ method: 'GET', headers: { host: 'localhost' }, query: {} }, res);
  assert.equal(res.statusCode, 403);
  assert.equal(JSON.parse(res.body).error, "music_api_disabled");
} finally {
  global.fetch = oldFetch; require.cache[commentsPath].exports = originalLegacy; process.env = previousEnv;
}
console.log('Web audience passed: exact shared tracks, no autoplay, isolated profiles, stale lookup guards, offline/clipboard fallback and staged API gates.');

const { funnelMetrics } = require('../lib/api/_admin-analytics.js')._private;
const now = Date.now(), stamp = new Date(now).toISOString();
const session = { created_at: stamp, anonymous_id: 'visitor', session_id: 'session' };
const metrics = funnelMetrics([session], ['track_link_copied','saved_track_replayed','shared_track_opened'].map(event_name => ({ ...session, event_name })), now);
assert.equal(metrics.stages.copied.users, 1);
assert.equal(metrics.stages.sharedOpened.users, 1);
assert.equal(metrics.stages.replayed.users, 1);
assert.equal(metrics.stages.listened.users, 0, 'A link open or replay request is not proof that audio played');
