import assert from 'node:assert/strict';
import { createRequire } from 'node:module';
import { createAppRuntimeTestContext } from './app-runtime-test-harness.mjs';
const require = createRequire(import.meta.url);
const experience = require('../discovery-experience.js');
const clone = value => JSON.parse(JSON.stringify(value));
const track = (key, style = 'house') => ({ key, artist: `Artist ${key}`, song: `Track ${key}`, style,
  recordingId: `apple_music:${key === 'one' ? '1348713422' : '1575546142'}`, likedAt: '2026-11-01T12:00:00.000Z' });

function harness() {
  const c = createAppRuntimeTestContext();
  const status = { textContent: '', hidden: true, dataset: {} };
  Object.assign(c, {
    profile: 'profile-a', recommendationSessionGeneration: 1, libraryRemovalUndoState: null,
    likedTrackHistory: [track('one'), track('two', 'techno')], dislikedTrackHistory: [track('three', 'techno')], libraryRemovedTrackHistory: [],
    saved: 0, synced: [], confirmation: true, prompts: [],
    sessionProfileKey: () => c.profile, likedTrackKeyFromEntry: entry => entry?.key || '',
    normalize: value => String(value).toLowerCase(), sonicTinyCopy: pt => pt, t: key => key,
    sanitizeLikedTrackHistory: entries => entries.slice(0, 80),
    document: { getElementById: id => id === 'libraryReplayStatus' ? status : null },
    window: { confirm: message => { c.prompts.push(message); return c.confirmation; }, SonicDiscoveryExperience: experience },
    renderLikedTrackHistory() {}, renderDislikedTrackHistory() {}, renderWeeklyHighlights() {},
    saveProgress() { c.saved++; }, queueSocialSync(reason) { c.synced.push(reason); }, showToast(message) { c.toast = message; },
    LIKED_TRACK_HISTORY_LIMIT: 80,
    recommendationRunBusy: false, swipeFeedbackBusy: false, firstRecommendationBusy: false,
    adaptiveModel: { likedStyles: new Map(), dislikedStyles: new Map() },
    normalizeDatasetStyle: value => value, styleHistoryEntryStyle: entry => entry.style, familyOf: value => value,
    trackPreferenceSignals: new Map([['existing', 0.7]])
  });
  return { c, status };
}

{
  const { c } = harness();
  const before = clone(c.likedTrackHistory[0]);
  assert.equal(c.removeLikedTrackFromHistory('one'), true);
  const removal = clone(c.libraryRemovedTrackHistory[0]);
  assert.equal(c.likedTrackHistory.some(item => item.key === 'one'), false);
  assert.equal(c.undoLastLibraryRemoval(), true);
  const restored = c.likedTrackHistory.find(item => item.key === 'one');
  assert.equal(restored.recordingId, before.recordingId, 'Undo restores the exact recording identity');
  assert.ok(Date.parse(restored.likedAt) > Date.parse(removal.likedAt), 'Undo is a newer action than its cloud removal');
  c.mergeCloudLibraryEntries([removal], 'removed');
  assert.equal(c.likedTrackHistory.some(item => item.key === 'one'), true, 'A stale removal from another device cannot erase the undo');
  assert.equal(c.libraryRemovedTrackHistory.some(item => item.key === 'one'), false);
  assert.ok(c.synced.includes('library_undo'));
  assert.deepEqual([...c.trackPreferenceSignals], [['existing', 0.7]], 'Undo does not manufacture musical feedback');
}
for (const change of ['profile', 'generation']) {
  const { c } = harness();
  c.removeLikedTrackFromHistory('one');
  if (change === 'profile') c.profile = 'profile-b';
  else c.recommendationSessionGeneration++;
  c.likedTrackHistory = [track('new-account')];
  c.libraryRemovedTrackHistory = [];
  const saves = c.saved, syncs = c.synced.length;
  assert.equal(c.undoLastLibraryRemoval(), false);
  assert.deepEqual(clone(c.likedTrackHistory).map(item => item.key), ['new-account']);
  assert.equal(c.saved, saves); assert.equal(c.synced.length, syncs, 'A stale undo never writes to a new session');
}
for (const source of ['unheard_pass', 'preview_issue', 'preview_issue_button']) {
  const { c } = harness();
  c.dislikedTrackHistory = [{ ...track('neutral', 'techno'), source }];
  const before = c.styleTasteSignal('techno').net;
  assert.equal(c.isTasteDislike(c.dislikedTrackHistory[0]), false);
  assert.equal(c.removeDislikedTrackFromHistory('neutral'), true);
  assert.equal(c.undoLastLibraryRemoval(), true);
  const restored = c.dislikedTrackHistory.find(item => item.key === 'neutral');
  assert.equal(restored.source, source, 'Undo preserves the original meaning of a neutral skip or audio issue');
  assert.equal(c.isTasteDislike(restored), false);
  assert.equal(c.styleTasteSignal('techno').net, before, 'Undo of neutral history cannot become a negative style preference');
}
{
  const { c } = harness();
  c.removeLikedTrackFromHistory('one');
  c.libraryRemovedTrackHistory = [];
  c.dislikedTrackHistory = [{ ...track('one'), likedAt: new Date().toISOString() }];
  assert.equal(c.undoLastLibraryRemoval(), false, 'Undo cannot overwrite a later intentional dislike');
  assert.equal(c.dislikedTrackHistory[0].key, 'one');
}
{
  const { c } = harness();
  const before = clone(c.likedTrackHistory);
  c.confirmation = false;
  assert.equal(c.clearLikedTrackHistory(), false);
  assert.deepEqual(clone(c.likedTrackHistory), before);
  assert.equal(c.libraryRemovedTrackHistory.length, 0);
  c.confirmation = true;
  assert.equal(c.clearLikedTrackHistory(), true);
  assert.equal(c.likedTrackHistory.length, 0);
  assert.equal(c.libraryRemovedTrackHistory.length, 2);
  assert.equal(c.undoLastLibraryRemoval(), true);
  assert.deepEqual(clone(c.likedTrackHistory).map(item => [item.key, item.recordingId]).sort(), before.map(item => [item.key, item.recordingId]).sort());
  assert.ok(c.prompts.every(message => message.includes('2')));
}
{
  const { c } = harness();
  assert.equal(c.removeDislikedTrackFromHistory('three'), true);
  assert.equal(c.undoLastLibraryRemoval(), true);
  assert.equal(c.dislikedTrackHistory[0].key, 'three');
  assert.equal(c.likedTrackHistory.some(item => item.key === 'three'), false);
  c.removeLikedTrackFromHistory('one', { save: false, render: false, silent: true });
  assert.equal(c.libraryRemovalUndoState, null, 'Internal movement between likes and dislikes does not offer a removal undo');
}
{
  const { c } = harness();
  c.likedTrackHistory = Array.from({ length: 80 }, (_, index) => track(`saved-${index}`));
  c.clearLikedTrackHistory();
  c.likedTrackHistory = [track('newer-choice')];
  assert.equal(c.undoLastLibraryRemoval(), true);
  assert.equal(c.likedTrackHistory.length, 80);
  assert.ok(c.likedTrackHistory.some(item => item.key === 'newer-choice'), 'Restoring a full shelf never evicts a newer explicit save');
  assert.match(c.toast, /79 faixas restauradas/);
}
{
  const rows = [track('one'), track('two', 'techno')];
  const before = clone(rows);
  assert.deepEqual(experience.selectTracks(rows, 'artist', 'artist', 'pt', value => value, 'techno').map(item => item.key), ['two']);
  assert.equal(experience.selectTracks(rows, 'one', 'recent', 'pt', value => value, 'techno').length, 0, 'Search and explicit style combine');
  assert.deepEqual(rows, before, 'Library filtering never mutates saved rows');
}
{
  const { c, status } = harness();
  c.recommendationRunBusy = true;
  const button = { disabled: false, textContent: 'Ouvir aqui' };
  await c.openSavedLibraryTrack(track('one'), button);
  assert.match(status.textContent, /Aguarde/);
  assert.equal(status.hidden, false, 'A busy click receives inline recovery guidance');
  assert.equal(button.disabled, false);
  assert.equal(c.saved, 0);
}
console.log('Library upgrade passed: scoped undo, exact recording identity, cloud tombstones, later-choice protection, confirmed bulk clear, combined search/style and honest busy replay.');
