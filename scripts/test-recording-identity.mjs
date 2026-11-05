#!/usr/bin/env node

import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import path from "node:path";
import vm from "node:vm";
import { fileURLToPath } from "node:url";

const rootDir = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const appSource = await readFile(path.join(rootDir, "app.js"), "utf8");

function functionSource(name) {
  const marker = `function ${name}`;
  const markerIndex = appSource.indexOf(marker);
  assert.ok(markerIndex >= 0, `Missing function: ${name}`);
  const asyncIndex = appSource.lastIndexOf("async ", markerIndex);
  const start = asyncIndex >= markerIndex - 8 ? asyncIndex : markerIndex;
  const signatureEnd = appSource.indexOf(") {", markerIndex);
  assert.ok(signatureEnd >= 0, `Missing function body: ${name}`);
  const bodyStart = signatureEnd + 2;
  let depth = 0;
  let quote = "";
  let escaped = false;
  let lineComment = false;
  let blockComment = false;

  for (let index = bodyStart; index < appSource.length; index += 1) {
    const character = appSource[index];
    const next = appSource[index + 1];
    if (lineComment) {
      if (character === "\n") lineComment = false;
      continue;
    }
    if (blockComment) {
      if (character === "*" && next === "/") {
        blockComment = false;
        index += 1;
      }
      continue;
    }
    if (quote) {
      if (escaped) escaped = false;
      else if (character === "\\") escaped = true;
      else if (character === quote) quote = "";
      continue;
    }
    if (character === "/" && next === "/") {
      lineComment = true;
      index += 1;
      continue;
    }
    if (character === "/" && next === "*") {
      blockComment = true;
      index += 1;
      continue;
    }
    if (character === '"' || character === "'" || character === "`") {
      quote = character;
      continue;
    }
    if (character === "{") depth += 1;
    if (character === "}") depth -= 1;
    if (depth === 0) return appSource.slice(start, index + 1);
  }
  throw new Error(`Unclosed function: ${name}`);
}

const ctx = {
  seenTrackKeysMemory: new Set(), seenRecordingIdsMemory: new Set(), knownTrackTitlesMemory: new Set(), dislikedTrackHistory: [],
  catalog: [], CURATED_FRIENDLY_OPENING_TRACKS: [],
  registerSeenArtist() {}, rememberRecentlyPresentedArtist() {}, saveProgress() {},
  anonymousTrackWasRecentlyExposed: () => false,
  trackFromRecommendationKey: () => null, normalizeInlineText: value => String(value || '').trim(),
  musicUniverseOfTrack: () => 'electronic', firstSafeExternalUrl: () => '',
  buildSpotifyTrackLink: () => '', buildYouTubeTrackLink: () => '', buildSoundCloudTrackLink: () => ''
};
const names = ['normalize', 'normalizeTitle', 'strictTitleMatch', 'recommendationTrackKey',
  'recordingIdentityKeys', 'rememberRecordingIdentity', 'migrateExplicitKnownTrackTitles',
  'trackMatchesKnownTitle', 'trackBlockedByKnownSignals', 'markRecommendationPresented',
  'likedTrackKeyFromEntry', 'likedTrackHistoryEntry', 'canonicalArtistIdentity', 'artistMatchKey',
  'artistCreditComponents', 'artistMatchingKeys', 'addArtistKeysToSet', 'artistSetHasMatch',
  'artistsShareIdentity', 'parseKnownArtists'];
vm.createContext(ctx);
vm.runInContext(names.map(functionSource).join('\n'), ctx);
const heard = {artist: 'Apoptygma Berzerk', song: 'Eclipse', style: 'futurepop'};
const unheard = {artist: 'Hardwell', song: 'Eclipse', style: 'electro_house'};
ctx.markRecommendationPresented(heard);
assert.equal(ctx.trackBlockedByKnownSignals(heard), true);
assert.equal(ctx.trackBlockedByKnownSignals({...heard, style: 'ebm'}), true, 'Changing the category must not recycle a recording');
assert.equal(ctx.trackBlockedByKnownSignals(unheard), false, 'A title shared by unrelated recordings must remain discoverable');
assert.equal(ctx.knownTrackTitlesMemory.size, 0, 'Automatic history must not become a typed-title exclusion');
ctx.knownTrackTitlesMemory.add('eclipse');
assert.equal(ctx.trackBlockedByKnownSignals(unheard), true, 'An explicit typed-title exclusion remains intentional');
ctx.knownTrackTitlesMemory.clear();
ctx.catalog = [heard, unheard];
const legacy = {seenTrackKeysMemory: [...ctx.seenTrackKeysMemory], knownTrackTitlesMemory: ['eclipse', 'my typed exclusion']};
assert.deepEqual(Array.from(ctx.migrateExplicitKnownTrackTitles(legacy)), ['my typed exclusion']);
ctx.catalog = [];
assert.deepEqual(Array.from(ctx.migrateExplicitKnownTrackTitles(legacy)), ['my typed exclusion'], 'Lazy catalog hydration must not preserve automatically heard titles as global exclusions');
assert.deepEqual(legacy.knownTrackTitlesMemory, ['eclipse', 'my typed exclusion'], 'Migration must not mutate the archived legacy data');
assert.deepEqual(Array.from(ctx.migrateExplicitKnownTrackTitles({recordingIdentityVersion: 2, explicitKnownTrackTitles: ['eclipse']})), ['eclipse']);
assert.deepEqual(Array.from(ctx.migrateExplicitKnownTrackTitles({knownTrackTitlesMemory: ['eclipse'], likedTrackHistory: [heard]})), []);

const original = {artist: 'Recording Test', song: 'Original', isrc: 'GB-ABC-24-00001'};
ctx.markRecommendationPresented(original);
assert.equal(ctx.trackBlockedByKnownSignals({...original, song: 'Original (Reissue)', isrc: 'GBABC2400001'}), true);
assert.equal(ctx.trackBlockedByKnownSignals({...original, song: 'Original (Remix)', isrc: 'GBABC2400002'}), false, 'Distinct remixes are not guessed to be the same recording');
const persisted = JSON.parse(JSON.stringify({tracks: [...ctx.seenTrackKeysMemory], recordings: [...ctx.seenRecordingIdsMemory]}));
ctx.seenTrackKeysMemory = new Set(persisted.tracks);
ctx.seenRecordingIdsMemory = new Set(persisted.recordings);
assert.equal(ctx.seenTrackKeysMemory.size, 2, "Supplemental recording IDs must not inflate presented-track counters");
assert.equal(ctx.trackBlockedByKnownSignals({...original, artist: 'Alternate Credit', song: 'Reissued name'}), true, 'Recording identity survives JSON persistence');
assert.equal(ctx.recordingIdentityKeys({isrc: '12345', musicBrainzId: 'album-id'}).length, 0, 'Album and invalid identifiers must not suppress tracks');
assert.equal(ctx.likedTrackHistoryEntry(original).isrc, 'GBABC2400001', 'Saved-track normalization preserves valid recording IDs');
ctx.seenTrackKeysMemory = new Set();
ctx.seenRecordingIdsMemory = new Set();
assert.equal(ctx.trackBlockedByKnownSignals(original), false, 'A separate profile has separate history');
ctx.dislikedTrackHistory = [heard];
assert.equal(ctx.trackBlockedByKnownSignals(heard), true);
assert.equal(ctx.trackBlockedByKnownSignals(unheard), false, 'Dislike sync must not blacklist unrelated titles');

for (const credit of ['Peverelist x Kowton', 'Peverelist & Kowton', 'Peverelist &amp; Kowton', 'Peverelist &#38; Kowton', 'Peverelist and Kowton']) {
  assert.equal(ctx.artistsShareIdentity('Peverelist', credit), true, credit);
  assert.equal(ctx.artistsShareIdentity('Kowton', credit), true, credit);
  assert.equal(ctx.artistsShareIdentity('Kettel', credit), false, credit);
  assert.equal(ctx.artistSetHasMatch(ctx.parseKnownArtists(credit), 'Kowton'), true, 'Typed collaborations retain their members');
}
for (const duo of ['Above & Beyond', 'Camo & Krooked', 'Dom & Roland', 'W&W', 'Sidewalks and Skeletons', 'Shut Up And Dance', 'Prok and Fitch']) {
  assert.equal(ctx.artistCreditComponents(duo).length, 1, duo + ' is a single performer');
  assert.equal(ctx.artistsShareIdentity(duo, duo.replaceAll('&', '&amp;')), true);
  assert.equal(ctx.artistsShareIdentity(duo, duo + ' x Peverelist'), true);
  assert.equal(ctx.artistsShareIdentity('Peverelist', duo + ' & Peverelist'), true);
}
assert.equal(ctx.artistsShareIdentity('Above', 'Above & Beyond'), false);
assert.equal(ctx.artistsShareIdentity('Roland', 'Dom & Roland'), false);
assert.equal(ctx.artistsShareIdentity('Miss Djax', 'Miss Djax & Junk Project'), true);
assert.equal(ctx.artistsShareIdentity('Roderick Porter', 'Habstrakt & Roderick Porter'), true);
assert.doesNotMatch(functionSource('tryRunInstantPrimaryRecommendation'), /allowSeenTrack:\s*true/, 'The caller must not silently relax repeat protection on exhaustion');
console.log('Recording identity passed: title collisions, legacy migration, persistence, distinct mixes, profiles, collaboration credits, joint acts, and exhaustion.');

const route = {firstRecommendationPromise: null, firstRecommendationCompleted: true,
  currentRecommendation: {style: 'minimal_deep_tech'}, lastPrefs: {style: 'minimal_deep_tech'},
  prefsFromManualControls: () => route.lastPrefs, manualPrefsAreActive: () => true,
  normalizeRecommendationPrefs: p => p, recommendationContextKey: p => JSON.stringify(p),
  selectableSwipeStyle: s => s, explicitSwipeAnchorStyle: () => route.anchor,
  anchor: 'minimal_deep_tech', filtered: 0, surprise: 0,
  tryRunInstantPrimaryRecommendation: () => false,
  runManualFilterSurprise: async () => { route.filtered++; return false; },
  runSurpriseRecommendation: async () => { route.surprise++; return true; }
};
vm.createContext(route); vm.runInContext(functionSource('runPrimaryRecommendationAction'), route);
assert.equal(await route.runPrimaryRecommendationAction(), false);
assert.equal(route.filtered, 1, 'An exhausted explicit style must stay in the filtered flow');
assert.equal(route.surprise, 0, 'No cross-genre surprise after the filtered flow reports exhaustion');
route.anchor = '';
await route.runPrimaryRecommendationAction();
assert.equal(route.surprise, 1, 'An automatic opening style must not become a permanent user lock');
route.lastPrefs = {style: 'minimal_deep_tech', bpm: '124-132'};
await route.runPrimaryRecommendationAction();
assert.equal(route.filtered, 2, 'BPM and other manually selected filters must survive Other Track');
console.log('Primary CTA passed: explicit style exhaustion stays filtered; unfiltered discovery stays exploratory.');
