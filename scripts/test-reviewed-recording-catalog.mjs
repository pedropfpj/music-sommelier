import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { createAppRuntimeTestContext } from './app-runtime-test-harness.mjs';
import { mergeRows } from './build-runtime-catalog.mjs';

const json = async path => JSON.parse(await readFile(new URL(path, import.meta.url), 'utf8'));
const core = await json('../data/runtime-catalog-v1/core.json');
const bigBeat = await json('../data/runtime-catalog-v1/styles/big_beat.json');
const fullNight = await json('../data/runtime-catalog-v1/styles/full_on_night.json');
const reviewed = [...bigBeat, ...fullNight].filter(row => /(?:reviewed_recording_style|full_on_night_recordings)_v26/.test(row.source_tags || ''));
assert.equal(reviewed.length, 7);
const ctx = createAppRuntimeTestContext();
ctx.catalog.length = 0;
const stored = new Map();
ctx.localStorage = { getItem: key => stored.get(key) || null, setItem: (key, value) => stored.set(key, value) };
const bareWiseguysBefore = ctx.artistAllowedForStyle('big_beat', 'The Wiseguys');
const artistOverridesBefore = JSON.stringify(ctx.ARTIST_STYLE_OVERRIDES);
ctx.mergeExternalDatasetRows(core, 'dataset_local_runtime_core');
ctx.mergeExternalDatasetRows(bigBeat, 'dataset_local_runtime_big_beat');
ctx.mergeExternalDatasetRows(fullNight, 'dataset_local_runtime_full_on_night');
ctx.finalizeExternalDatasetRuntimeMerge({ tracksImported: 7 });

const tracks = reviewed.map(row => ctx.catalog.find(track => track.style === row.style && track.artist === row.artist && track.song === row.song));
assert.ok(tracks.every(Boolean), 'All seven exact reviewed recordings survive the real cold core/shard import');
assert.equal(new Set(tracks.filter(t => t.style === 'big_beat').map(t => t.artist)).size, 6);
for (const track of tracks) {
  assert.ok(ctx.reviewedRecordingStyleProof(track), track.song);
  assert.equal(ctx.isTrackEligibleForRecommendation(track), true, track.song);
  assert.equal(ctx.trackStyleCertainty(track), 'confirmed', track.song);
  assert.equal(ctx.trackMatchesRequestedSubgenreEvidence(track, { style: track.style }), true, track.song);
  assert.equal(ctx.hasReliableBpmForTrack(track), false, 'Editorial genre evidence cannot invent BPM');
  assert.equal(ctx.trackMatchesBpmPreference(track, '124-135'), false);
  assert.equal(ctx.trackMatchesRequestedSubgenreEvidence(track, { style: 'techno' }), false);
  assert.equal(track.vocals, 'unknown'); assert.equal(track.energy, 'unknown');
  assert.deepEqual(Array.from(track.context), []);
  assert.equal(track.deezerTrackId, '', 'Never borrow another provider master to increase playback coverage');
  for (const change of [
    { song: track.song + ' (Radio Mix)' },
    { artist: 'Unreviewed Artist' },
    { style: 'techno' },
    { catalogMetadata: { ...track.catalogMetadata, recording_id: 'apple_music:999999' } },
    { catalogMetadata: { ...track.catalogMetadata, source_url: 'https://music.apple.com/us/song/another-master/999999' } },
    { catalogMetadata: { ...track.catalogMetadata, genre_evidence_url: 'https://music.apple.com/us/playlist/community/pl.u-example' } },
    { sourceTags: [], catalogMetadata: { ...track.catalogMetadata, source_tags: [] } }
  ]) assert.equal(ctx.reviewedRecordingStyleProof({ ...track, ...change }), null, JSON.stringify(change));
  const key = ctx.recommendationTrackKey(track);
  ctx.seenTrackKeysMemory.add(key);
  assert.equal(ctx.trackBlockedByKnownSignals(track), true, 'Reviewed evidence must preserve no-repeat memory');
  ctx.seenTrackKeysMemory.delete(key);
  const unrelated = { ...track, song: 'Unreviewed recording by the same artist' };
  assert.equal(ctx.reviewedRecordingStyleProof(unrelated), null);
}
assert.equal(ctx.artistAllowedForStyle('big_beat', 'The Wiseguys'), bareWiseguysBefore, 'A recording cannot rewrite the artist-wide classification');
assert.equal(bareWiseguysBefore, false);
const delivered = [];
for (let index = 0; index < 6; index++) {
  const selected = ctx.pickRecommendation({ style: 'big_beat' }, new Set());
  assert.ok(selected && ctx.reviewedRecordingStyleProof(selected), 'The actual picker must deliver a reviewed Big Beat recording');
  delivered.push(selected.artist);
  ctx.seenTrackKeysMemory.add(ctx.recommendationTrackKey(selected));
}
assert.equal(new Set(delivered).size, 6, 'Six distinct reviewed artists must be reachable after finalization and purge');
assert.equal(ctx.pickRecommendation({ style: 'big_beat' }, new Set()), null, 'Exhaustion cannot replay known tracks or loosen genre evidence');
ctx.seenTrackKeysMemory.clear();
assert.equal(ctx.pickRecommendation({ style: 'big_beat', bpm: '124-135' }, new Set()), null, 'A strict BPM filter cannot use unmeasured recordings');

// Reviewed row ingestion alone must never grant artist-wide overrides or seeds.
const scoped = createAppRuntimeTestContext(); scoped.catalog.length = 0;
const overrides = JSON.stringify(scoped.ARTIST_STYLE_OVERRIDES);
const seeds = JSON.stringify(scoped.STYLE_ARTIST_SEEDS);
scoped.mergeExternalDatasetRows(reviewed, 'dataset_local_runtime_recording_scoped');
assert.equal(JSON.stringify(scoped.ARTIST_STYLE_OVERRIDES), overrides);
assert.equal(JSON.stringify(scoped.STYLE_ARTIST_SEEDS), seeds);
assert.equal(scoped.artistAllowedForStyle('big_beat', 'The Wiseguys'), false);
assert.equal(scoped.artistAllowedForStyle('big_beat', 'The Wiseguys', scoped.catalog.find(t => t.artist === 'The Wiseguys')), true);

// The builder must keep a complete verified master, independent of source order.
const row = reviewed[0];
const legacy = { style: row.style, artist: row.artist, song: row.song, deezer_track_id: '123456', preview_url: 'https://old.fixture.test/other-master.mp3', bpm: '128', country: 'Invented', source_url: 'https://old.fixture.test/' };
for (const result of [mergeRows(legacy, row), mergeRows(row, legacy)]) {
  assert.deepEqual(result, row);
  assert.equal(result.deezer_track_id, undefined); assert.equal(result.bpm, undefined);
}

// A stale cache duplicate is repaired without mutating the currently visible card.
const duplicate = createAppRuntimeTestContext(); duplicate.catalog.length = 0;
const oldCard = { ...tracks[0], source: 'dynamic_dataset_local_legacy', catalogMetadata: {}, sourceTags: [], deezerTrackId: '123456', bpmExact: 128 };
duplicate.catalog.push(oldCard); duplicate.currentRecommendation = oldCard;
const historyBefore = JSON.stringify(duplicate.seenTrackKeysMemory);
const merged = duplicate.mergeExternalDatasetRows([row], 'dataset_local_runtime_reviewed');
assert.equal(merged.tracksImported, 0, 'Repairing an existing recording cannot inflate the catalog count');
assert.equal(duplicate.catalog.length, 1);
assert.notEqual(duplicate.catalog[0], oldCard);
assert.equal(duplicate.currentRecommendation, oldCard, 'Keep the visible card object until a user requests another recommendation');
assert.equal(oldCard.deezerTrackId, '123456');
assert.equal(duplicate.catalog[0].deezerTrackId, '');
assert.ok(duplicate.reviewedRecordingStyleProof(duplicate.catalog[0]));
assert.equal(JSON.stringify(duplicate.seenTrackKeysMemory), historyBefore);

// Evidence and exact IDs survive the normal dynamic cache path.
ctx.saveDynamicCatalogCache(); ctx.catalog.length = 0; ctx.loadDynamicCatalogCache();
for (const original of tracks) {
  const restored = ctx.catalog.find(t => t.artist === original.artist && t.song === original.song);
  assert.ok(restored && ctx.reviewedRecordingStyleProof(restored), original.song);
  assert.equal(restored.catalogMetadata.recording_id, original.catalogMetadata.recording_id);
}
assert.equal(ctx.artistAllowedForStyle('big_beat', 'The Wiseguys'), false);
assert.ok(artistOverridesBefore !== undefined);
console.log('Reviewed recording catalog passed: actual cold core/shards, seven exact recordings, six Big Beat artists, strict genre/BPM/history gates, atomic master replacement and cache reload without artist-wide permission.');
