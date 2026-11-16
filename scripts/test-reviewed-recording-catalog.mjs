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
    { artist: track.artist + ' (Tribute)' },
    { artist: track.artist + ' aka Totally Different Artist' },
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
duplicate.catalog.push({ ...oldCard, previewUrl: 'https://old.fixture.test/other-master.mp3', existenceVerified: true, spotifyVerified: true, youtubeVerified: true });
duplicate.dedupeCatalogByTrackKey();
assert.equal(duplicate.catalog.length, 1);
assert.ok(duplicate.reviewedRecordingStyleProof(duplicate.catalog[0]), 'Dedupe must choose reviewed identity over a higher-scoring legacy master');
assert.ok(!Array.from(duplicate.previewCandidatesForTrack(duplicate.catalog[0])).includes('https://old.fixture.test/other-master.mp3'), 'A legacy duplicate must not inject another recording audio into the reviewed snapshot');

// Evidence and exact IDs survive the normal dynamic cache path.
ctx.saveDynamicCatalogCache(); ctx.catalog.length = 0; ctx.loadDynamicCatalogCache();
for (const original of tracks) {
  const restored = ctx.catalog.find(t => t.artist === original.artist && t.song === original.song);
  assert.ok(restored && ctx.reviewedRecordingStyleProof(restored), original.song);
  assert.equal(restored.catalogMetadata.recording_id, original.catalogMetadata.recording_id);
}
assert.equal(ctx.artistAllowedForStyle('big_beat', 'The Wiseguys'), false);

// The app refreshes the same Apple ID and cannot fall through to a text search.
const apple = { ...tracks[0], previewUrl: '', previewCandidates: [] };
const calls = [];
let best = null;
ctx.resolveMusicApiEndpoint = () => '/api/track-metadata';
ctx.fetchWithTimeout = async (_url, options) => {
  calls.push(JSON.parse(options.body));
  return { ok: true, json: async () => ({ best }) };
};
ctx.COMPLIANCE_CONFIG.clientDeezerEnabled = true;
ctx.itunesJsonp = ctx.deezerJsonp = ctx.fetchDeezerTrackDetails = ctx.refreshSoundCloudPreviewForTrack = () => { throw Error('An exact recording must not use fallback search'); };
assert.equal(ctx.trackAppleRecordingId(apple), row.recording_id.split(':')[1]);
assert.equal(ctx.trackHasRefreshablePreview(apple), true);
await ctx.resolvePreviewForTrack(apple, { forceLookup: true });
assert.equal(apple.previewMissing, true);
assert.equal(calls[0].itunesTrackId, ctx.trackAppleRecordingId(apple));
assert.equal(calls[0].album, ''); assert.equal(calls[0].deezerTrackId, '');
best = { source: 'itunes', id: '999999', artist: apple.artist, song: apple.song, previewUrl: 'https://audio.fixture.test/wrong-master.m4a', confidenceScore: 1 };
assert.equal(await ctx.fetchTrackMetadataFromApi(apple, { forceLookup: true }), null, 'Reject wrong recording IDs at the client boundary too');
best = { ...best, id: ctx.trackAppleRecordingId(apple), previewUrl: 'https://audio.fixture.test/correct-master.m4a' };
await ctx.resolvePreviewForTrack(apple, { forceLookup: true });
assert.equal(apple.previewUrl, best.previewUrl); assert.equal(apple.previewMissing, false);
assert.notEqual(ctx.trackMetadataApiCacheKey(apple), ctx.trackMetadataApiCacheKey({ ...apple, catalogMetadata: { ...apple.catalogMetadata, recording_id: 'apple_music:999999' } }));

// The publisher proofs cover the exact Apple editions and independently credited acts.
const fullNightSelections = await Promise.all([
  json('../data/full_on_night_nightfusion_v70_20261111.selection.json'),
  json('../data/full_on_night_sectar_v73_20261111.selection.json')
]);
const published = fullNightSelections.flatMap(selection => selection.tracks);
assert.equal(published.length, 7);
const distinct = values => new Set(values).size === values.length;
assert.ok(distinct(published.flatMap(row => row.independentArtistGroup.componentKeys)));
assert.ok(distinct(published.flatMap(row => row.independentArtistGroup.appleArtistIds)));
assert.ok(distinct(published.map(row => row.audioVerification.sha256)));
const fullNightRows = fullNight.filter(row => published.some(edition => edition.recordingId === row.recording_id));
assert.equal(fullNightRows.length, 7);
const fullNightContext = createAppRuntimeTestContext();
fullNightContext.catalog.length = 0;
const nightSeeds = JSON.stringify(fullNightContext.STYLE_ARTIST_SEEDS);
const nightOverrides = JSON.stringify(fullNightContext.ARTIST_STYLE_OVERRIDES);
fullNightContext.mergeExternalDatasetRows(fullNightRows, 'dataset_local_runtime_full_on_night');
assert.equal(JSON.stringify(fullNightContext.STYLE_ARTIST_SEEDS), nightSeeds);
assert.equal(JSON.stringify(fullNightContext.ARTIST_STYLE_OVERRIDES), nightOverrides);
fullNightContext.finalizeExternalDatasetRuntimeMerge({ tracksImported: 7 });
assert.equal(fullNightContext.catalog.length, 7);
const rejected = createAppRuntimeTestContext();
rejected.catalog.length = 0;
const wrongMaster = 'https://audio-ssl.itunes.apple.com/itunes-assets/other/mzaf_99.plus.aac.p.m4a';
fullNightContext.trackPreview = { dataset: {}, load() {} };
fullNightContext.resetTrackPreviewElement = () => {};

for (const edition of published) {
  const row = fullNightRows.find(candidate => candidate.recording_id === edition.recordingId);
  const track = fullNightContext.catalog.find(candidate => candidate.catalogMetadata.recording_id === edition.recordingId);
  const proof = fullNightContext.reviewedRecordingStyleProof(track);
  assert.ok(proof?.applePreviewAsset, edition.song);
  assert.equal(proof.recordingUrl, edition.sourceUrl);
  assert.equal(row.preview_url, edition.audioVerification.previewUrl);
  assert.equal(row.preview_url, edition.lookupObservation.previewUrl);
  assert.ok(edition.audioVerification.currentTimeAfter > 0 && !edition.audioVerification.pausedAfter);
  assert.ok(core.some(candidate => candidate.recording_id === edition.recordingId), 'Ready Apple routes ship in the core before remote enrichment');
  assert.equal(fullNightContext.isTrackEligibleForRecommendation(track), true);
  assert.equal(fullNightContext.trackStyleCertainty(track), 'confirmed');
  assert.equal(fullNightContext.trackMatchesRequestedSubgenreEvidence(track, { style: 'full_on_night' }), true);
  assert.equal(fullNightContext.trackMatchesRequestedSubgenreEvidence(track, { style: 'full_on' }), false);
  assert.equal(fullNightContext.trackMatchesBpmPreference(track, '146-154'), Boolean(edition.bpm));
  assert.equal(fullNightContext.trackMatchesBpmPreference(track, '155-160'), false);
  assert.equal(track.bpmExact ?? null, edition.bpm);
  assert.equal(track.energy, 'unknown');
  assert.equal(fullNightContext.trackHasInstantPlaybackRoute(track), true);
  assert.equal(fullNightContext.recommendationEvidenceSource(track).label, row.label === 'Sectar Records' ? 'Sectar Records' : 'Arrábida Records Psytrance');
  assert.equal(fullNightContext.reviewedRecordingStyleProof({ ...track, song: track.song + ' (Radio Edit)' }), null);
  assert.equal(fullNightContext.reviewedRecordingStyleProof({ ...track, bpmExact: 149 }), null);
  track.previewCandidates.push(wrongMaster);
  assert.deepEqual(Array.from(fullNightContext.previewCandidatesForTrack(track)), [row.preview_url]);
  fullNightContext.currentRecommendation = track;
  assert.equal(fullNightContext.commitTrackPreviewSource(track, wrongMaster, fullNightContext.recommendationPreviewRenderToken), false);
  assert.equal(fullNightContext.commitTrackPreviewSource(track, row.preview_url, fullNightContext.recommendationPreviewRenderToken), true);
  const replaced = { ...row, preview_url: wrongMaster };
  rejected.mergeExternalDatasetRows([replaced], 'dataset_local_runtime_full_on_night');
  assert.equal(rejected.catalog.length, 0, 'Never import another preview asset under a reviewed Apple ID');
}
const houseSelection = await json('../data/house_opening_editorial_v31_20261110.selection.json');
const houseShard = await json('../data/runtime-catalog-v1/styles/house.json');
assert.equal(houseSelection.editorialPlaylist.author, 'Apple Music Dance');
assert.equal(houseSelection.curator.id, '976439535');
assert.equal(houseSelection.tracks.length, 5);
assert.ok(distinct(houseSelection.tracks.flatMap(edition => edition.editorialMembership.artists.map(artist => artist.id))));
const houseRows = houseShard.filter(row => row.source === 'house_opening_editorial_v31_20261110');
assert.equal(houseRows.length, houseSelection.tracks.length);
const houseContext = createAppRuntimeTestContext();
houseContext.catalog.length = 0;
const houseSeeds = JSON.stringify(houseContext.STYLE_ARTIST_SEEDS);
houseContext.mergeExternalDatasetRows(houseRows, 'dataset_local_runtime_house');
assert.equal(houseContext.catalog.length, 5);
assert.equal(JSON.stringify(houseContext.STYLE_ARTIST_SEEDS), houseSeeds);
for (const edition of houseSelection.tracks) {
  const recordingId = `apple_music:${edition.appleTrackId}`;
  const row = houseRows.find(candidate => candidate.recording_id === recordingId);
  const track = houseContext.catalog.find(candidate => candidate.catalogMetadata.recording_id === recordingId);
  const proof = houseContext.reviewedExactAppleProof(track);
  assert.equal(proof?.recordingUrl, edition.recordingUrl);
  assert.equal(proof?.evidenceUrl, houseSelection.editorialPlaylist.url);
  assert.equal(row.preview_url, edition.audioVerification.previewUrl);
  assert.equal(row.preview_url, edition.lookupObservation.previewUrl);
  assert.ok(edition.audioVerification.currentTimeAfter > 0.25 && !edition.audioVerification.pausedAfter);
  assert.ok(core.some(candidate => candidate.recording_id === recordingId));
  assert.equal(houseContext.isTrackEligibleForRecommendation(track), true);
  assert.equal(houseContext.trackStyleCertainty(track), 'confirmed');
  assert.equal(houseContext.trackHasVerifiedImmediateAudioPreview(track), true);
  assert.equal(houseContext.trackMatchesRequestedSubgenreEvidence(track, { style: 'house' }), true);
  assert.equal(houseContext.trackMatchesRequestedSubgenreEvidence(track, { style: 'deep_house' }), false);
  assert.equal(houseContext.trackMatchesBpmPreference(track, '110-132'), false);
  assert.equal(houseContext.reviewedExactAppleProof({ ...track, song: track.song + ' (Edit)' }), null);
  assert.deepEqual(Array.from(houseContext.previewCandidatesForTrack({ ...track, previewCandidates: [wrongMaster] })), [row.preview_url]);
  assert.deepEqual(mergeRows(row, legacy), row);
  rejected.mergeExternalDatasetRows([{ ...row, preview_url: wrongMaster }], 'dataset_local_runtime_house');
  assert.equal(rejected.catalog.length, 0);
}
console.log('Reviewed recording catalog passed: cold core and shards, seven new exact Full-on Night previews, five exact House previews, strict recording/style/BPM/history gates, cache reload, and atomic master replacement without artist-wide permission.');
