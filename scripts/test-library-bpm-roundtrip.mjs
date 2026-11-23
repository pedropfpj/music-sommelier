import assert from 'node:assert/strict';
import { createAppRuntimeTestContext } from './app-runtime-test-harness.mjs';

const c = createAppRuntimeTestContext();
Object.assign(c, {
  currentLanguage: 'pt', likedTrackHistory: [], dislikedTrackHistory: [],
  catalogRecordingPlayback: new Map(),
  librarySessionMatchesOnlineAccount: () => true,
  socialState: { session: { user: { id: 'library-bpm-fixture' } } },
  portableCatalogRecordingId: value => typeof value === 'string' ? value : '',
  catalogTrackRecordingIds: track => track.recordingId ? [track.recordingId] : [],
  recordingIdentityKeys: () => [],
  buildSpotifyTrackLink: () => '', buildYouTubeTrackLink: () => '', buildSoundCloudTrackLink: () => ''
});
const base = { key: 'exact recording', artist: 'Fixture Artist', song: 'Exact Recording', style: 'full_on_night',
  bpm: '145-155', bpmExact: 148, label: 'Fixture Label', recordingId: 'apple_music:1348713422' };
const at = '2026-11-23T12:00:00.000Z';

for (const bpmExact of [146, 148, 154, '150', 148.5]) {
  const entry = c.likedTrackHistoryEntry({ ...base, bpmExact }, 'liked', at);
  assert.equal(entry.bpmExact, Number(bpmExact));
  assert.equal(entry.bpm, '145-155', 'Display range and exact evidence remain separate fields');
  c.likedTrackHistory = [entry];
  const row = c.socialTrackRowsForSync()[0];
  assert.equal(row.metadata.bpmExact, Number(bpmExact));
  const restored = c.socialLikedTrackFromRow({ ...row, metadata: JSON.stringify(row.metadata) });
  assert.equal(restored.bpmExact, Number(bpmExact));
  assert.equal(restored.recordingId, entry.recordingId);
  assert.equal(restored.source, 'liked');
  assert.equal(restored.likedAt, at);
  assert.equal(c.sanitizeLikedTrackHistory([restored])[0].bpmExact, Number(bpmExact), 'Local restore keeps the same exact evidence');
}
for (const fields of [
  { bpmExact: undefined }, { bpmExact: null }, { bpmExact: '' }, { bpmExact: 0 }, { bpmExact: -148 },
  { bpmExact: NaN }, { bpmExact: Infinity }, { bpmExact: '145-155' }, { bpmExact: 90 }, { bpmExact: 145 }, { bpmExact: 155 },
  { bpmExact: undefined, bpm: '148' },
  { style: 'unknown_style', bpmExact: 148 },
  { style: 'dubstep', bpm: '135-145', bpmExact: 140 }
]) {
  const entry = c.likedTrackHistoryEntry({ ...base, ...fields }, 'liked', at);
  assert.equal(Object.hasOwn(entry, 'bpmExact'), false, `No precise signal is invented from ${JSON.stringify(fields)}`);
  c.likedTrackHistory = [entry];
  const row = c.socialTrackRowsForSync()[0];
  assert.equal(Object.hasOwn(row.metadata, 'bpmExact'), false);
  assert.equal(Object.hasOwn(c.socialLikedTrackFromRow(row), 'bpmExact'), false);
  const injected = c.socialLikedTrackFromRow({ target_key: base.key, artist: base.artist, song: base.song,
    style: fields.style || base.style, metadata: { bpm: fields.bpm || base.bpm, bpmExact: fields.bpmExact, recordingId: base.recordingId } });
  assert.equal(Object.hasOwn(injected, 'bpmExact'), false, 'Cloud metadata is revalidated before entering history');
}
for (const source of ['disliked', 'unheard_pass', 'preview_issue', 'preview_issue_button']) {
  const entry = c.likedTrackHistoryEntry(base, source, at);
  c.dislikedTrackHistory = [entry];
  const row = c.socialDislikedTrackRowsForSync()[0];
  const restored = c.socialDislikedTrackFromRow(row);
  assert.equal(restored.bpmExact, 148);
  assert.equal(restored.recordingId, base.recordingId);
  assert.equal(restored.source, source, 'Tempo metadata cannot change the meaning of history');
  assert.equal(c.isTasteDislike(restored), source === 'disliked');
}
const legacy = c.socialLikedTrackFromRow({ target_key: base.key, artist: base.artist, song: base.song,
  style: base.style, metadata: { bpm: '145-155', recordingId: base.recordingId, likedAt: at } });
assert.equal(Object.hasOwn(legacy, 'bpmExact'), false, 'Older cloud ranges do not become their midpoint');
assert.equal(legacy.recordingId, base.recordingId);
console.log('Library BPM roundtrip passed: explicit valid exact values, local/cloud restore, exact recording/source preservation, legacy ranges, invalid and ambiguous tempo rejection.');
