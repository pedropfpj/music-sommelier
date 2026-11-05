import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {createAppRuntimeTestContext} from './app-runtime-test-harness.mjs';
const root=new URL('../',import.meta.url);
const selection=JSON.parse(await readFile(new URL('data/discovery-expansion-selection-v23.json',root),'utf8'));
const ctx=createAppRuntimeTestContext();
const styles=[...new Set(selection.tracks.map(row=>row.style))];
for(const style of styles){
 const rows=JSON.parse(await readFile(new URL(`data/runtime-catalog-v1/styles/${style}.json`,root),'utf8'));
 ctx.mergeExternalDatasetRows(rows,'dataset_local_runtime');
 for(const expected of selection.tracks.filter(row=>row.style===style)){
  const track=ctx.catalog.find(t=>ctx.recommendationTrackKey(t)===ctx.recommendationTrackKey(expected));
  assert.ok(track,`${expected.artist} — ${expected.song} must survive actual app import`);
  assert.equal(ctx.isTrackEligibleForRecommendation(track),true,`${expected.artist} — ${expected.song} is eligible`);
  assert.equal(ctx.trackMatchesRequestedSubgenreEvidence(track,{style}),true,`${expected.artist} — ${expected.song} passes fine-subgenre evidence`);
 }
}
let discoveries=0;
for(let round=0;round<100;round++)for(const style of styles){
 for(const name of ['seenTrackKeysMemory','seenRecordingIdsMemory','knownTrackTitlesMemory','seenArtistsMemory','discoveredArtistsInApp','knownArtistsMemory','rejectedArtists','blockedArtistsMemory'])ctx[name]=new Set();
 ctx.recentPresentedArtists=[];ctx.currentRecommendation=null;ctx.suggestionQueueTracks=[];
 const heard=[];let track=null;
 for(let count=0;count<15;count++){
  const candidate=ctx.pickInstantPrimaryNextTrack(track,style);
  if(!candidate)break;
  assert.equal(candidate.style,style,'Exhaustion must not silently widen the requested style');
  assert.ok(!heard.some(old=>ctx.recommendationTrackKey(old)===ctx.recommendationTrackKey(candidate)),'No recording repetition within a round');
  assert.ok(!heard.some(old=>ctx.artistsShareIdentity(old.artist,candidate.artist)),'No artist repetition within a round');
  heard.push(candidate);ctx.markRecommendationPresented(candidate);track=candidate;discoveries++;
 }
 assert.ok(heard.length>=3,`${style}: at least three newly verified artists must be immediately discoverable`);
 assert.equal(ctx.pickInstantPrimaryNextTrack(track,style),null,'An exhausted style must not recycle old tracks');
}
console.log(`Actual app import and selection passed: 21 eligible curated recordings; ${discoveries} discoveries across 100 rounds per style, without recording/artist repetition or style changes within a round.`);

// Real progress serialization/hydration, with only storage keys and UI rendering adapted for the test.
const persistence=createAppRuntimeTestContext();
const storage=new Map();let profile='one';
persistence.localStorage={getItem:key=>storage.get(key)||null,setItem:(key,value)=>storage.set(key,value)};
persistence.storageKeyForSession=base=>`${base}:${profile}`;
persistence.storageFallbackKeys=base=>[`${base}:${profile}`];
persistence.updateStats=()=>{};
persistence.progressStorageReady=true;
const eclipse={artist:'Apoptygma Berzerk',song:'Eclipse',style:'futurepop',isrc:'GBABC2400001'};
persistence.markRecommendationPresented(eclipse);
persistence.knownTrackTitlesMemory.add('explicit title');
persistence.saveProgress();
assert.equal(storage.size,1,'Progress must actually be serialized');
assert.equal(persistence.seenTrackKeysMemory.size,1,'One recording must count as one presented track, even with an ISRC');
persistence.loadProgress();
assert.equal(persistence.trackBlockedByKnownSignals(eclipse),true);
assert.equal(persistence.trackBlockedByKnownSignals({artist:'Hardwell',song:'Eclipse'}),false);
assert.equal(persistence.knownTrackTitlesMemory.has('explicit title'),true);
assert.equal(persistence.trackBlockedByKnownSignals({...eclipse,song:'Reissue'}),true);
profile='two';persistence.loadProgress();
assert.equal(persistence.seenTrackKeysMemory.size,0);
assert.equal(persistence.seenRecordingIdsMemory.size,0);
assert.equal(persistence.knownTrackTitlesMemory.size,0);
profile='one';persistence.loadProgress();
assert.equal(persistence.trackBlockedByKnownSignals(eclipse),true);
persistence.resetSessionStateInMemory();
assert.equal(persistence.seenTrackKeysMemory.size,0,'Reset must clear the previous session recording keys');
assert.equal(persistence.seenRecordingIdsMemory.size,0,'Reset must clear the previous session recording IDs');
console.log('Real progress save/load passed: recording IDs, explicit titles and account isolation survive reloads.');
