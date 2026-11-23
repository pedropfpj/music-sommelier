import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { createAppRuntimeTestContext } from './app-runtime-test-harness.mjs';

const source = process.env.SONIC_TEST_APP_SOURCE ? await readFile(process.env.SONIC_TEST_APP_SOURCE, 'utf8') : undefined;
const storage = new Map();
function session(username = 'intelligence-A') {
  const c = createAppRuntimeTestContext(source);
  c.currentAuthUser = { mode: 'login', username };
  c.localStorage = { getItem: key => storage.get(key) ?? null, setItem: (key, value) => storage.set(key, String(value)), removeItem: key => storage.delete(key) };
  c.updateStats = c.updateSwipeFeedbackCard = c.renderTrackRating = () => {};
  c.renderMusicalSpirit = async () => {};
  c.loadProgress();
  return c;
}
function taste(c) {
  return JSON.parse(JSON.stringify({ style: c.styleTasteSignal('house'), family: c.styleFamilyTasteSignal(c.familyOf('house')), artistStyles: c.profileArtistRecommendationStyleEntries() }));
}
{
  const c = session();
  c.adaptiveModel.likedStyles.set('house', 2);
  const before = taste(c);
  for (const marker of ['unheard_pass', 'preview_issue', 'preview_issue_button']) {
    c.dislikedTrackHistory = [{ artist: 'Unheard fixture', song: 'Not heard', style: 'house', source: marker }];
    assert.deepEqual(taste(c), before, `${marker} must not change genre, family or profile-artist taste`);
  }
  c.dislikedTrackHistory = [{ artist: 'Heard fixture', song: 'Heard and rejected', style: 'house', source: 'swipe_pass' }];
  assert.ok(c.styleTasteSignal('house').net < before.style.net, 'An actual musical dislike still changes taste');
  assert.ok(c.styleFamilyTasteSignal(c.familyOf('house')) < before.family);
  c.dislikedTrackHistory[0].source = '';
  assert.ok(c.styleTasteSignal('house').dislike > 0, 'Historical unmarked musical dislikes retain their meaning');
}

const example = (artist, song, label) => ({ artist, song, label, style: 'house', bpmExact: 124, energy: 'high', vocals: 'no', previewUrl: 'https://example.test/audio.wav' });
const prior = example('Frankie Knuckles', 'Label exposure fixture', 'Strictly Rhythm');
const sameLabel = example('Kerri Chandler', 'Candidate A', 'Strictly Rhythm');
const differentLabel = example('Larry Heard', 'Candidate B', 'Trax Records');
{
  const c = session('label-ranking');
  c.hashUnit = () => 0.5;
  c.Math = Object.assign(Object.create(Math), { random: () => 0 });
  c.rememberRecentlyPresentedLabel(prior);
  const comparable = [{ track: sameLabel, score: 30 }, { track: differentLabel, score: 30 }];
  assert.equal(c.pickFromScoredRecommendations(comparable, { style: 'house' }, { scoreBand: 1 }), differentLabel,
    'A different label wins between otherwise comparable candidates after recent exposure');
  assert.equal(c.pickFromScoredRecommendations([{ track: sameLabel, score: 30 }], { style: 'house' }), sameLabel,
    'The label preference cannot empty an otherwise valid pool');
  assert.equal(c.pickFromScoredRecommendations([{ track: sameLabel, score: 70 }, { track: differentLabel, score: 30 }], { style: 'house' }), sameLabel,
    'A material quality advantage takes priority over label diversity');
  for (let i = 0; i < 10; i++) c.rememberRecentlyPresentedLabel({ ...prior, song: `Exposure ${i}` });
  assert.ok(c.recentLabelDiversityPenalty(sameLabel, { style: 'house' }) <= 3.6);
  assert.equal(c.recentLabelDiversityPenalty({ ...sameLabel, label: 'Catálogo dinâmico' }), 0, 'Unknown labels cannot create fictitious diversity');
  assert.equal(c.recentLabelDiversityPenalty(sameLabel, { style: 'techno' }), 0, 'Label exposure respects an explicit other style');
}
{
  const c = session('label-history');
  for (let i = 0; i < 10; i++) c.rememberRecentlyPresentedLabel({ ...prior, song: `History ${i}` });
  assert.equal(c.recentPresentedLabels.length, 6, 'Only six label exposures are retained');
  c.rememberRecentlyPresentedLabel({ ...prior, song: 'History 9' });
  assert.equal(c.recentPresentedLabels.length, 6, 'Re-rendering the same recording cannot add artificial exposure');
  c.saveProgress();
  const reopened = session('label-history');
  assert.equal(reopened.recentPresentedLabels.length, 6, 'The recent label window survives reload');
  assert.ok(reopened.recentLabelDiversityPenalty(sameLabel, { style: 'house' }) > 0);
  assert.equal(session('other-account').recentPresentedLabels.length, 0, 'Another profile cannot inherit label history');
}
{
  const c = session('tempo-learning');
  const anchor = example('Frankie Knuckles', 'Tempo anchor', 'Strictly Rhythm');
  const far = { ...example('Kerri Chandler', 'Atmosphere', 'Strictly Rhythm'), bpmExact: 128 };
  const near = { ...example('Larry Heard', 'Can You Feel It', 'Trax Records'), bpmExact: 124 };
  c.catalog = [anchor, far, near];
  c.currentRecommendation = anchor;
  c.lastPrefs = { style: 'house', bpm: '120-130' };
  c.styleEl = { value: 'house', options: [{ value: 'house' }] };
  c.swipeUserAnchoredStyle = 'house';
  c.suggestionQueueTracks = [far, near];
  c.prewarmedSwipeTrackKeys = new Set([far, near].map(c.recommendationTrackKey));
  assert.equal(c.pickInstantSwipeTrack({ sourceTrack: anchor }).track, far, 'Without feedback both warmed candidates retain their queue order');
  c.likedTrackHistory = [anchor, { ...anchor, artist: 'Mike Dunn', song: 'Another explicit like', bpmExact: 125 }];
  assert.equal(c.pickInstantSwipeTrack({ sourceTrack: anchor }).track, near, 'Recent exact tempo likes rerank the actual ready queue within the selected genre and BPM');
  assert.ok(c.recentTempoAffinityScore(near) > c.recentTempoAffinityScore(far));
  assert.equal(c.recentTempoAffinityScore({ ...near, bpmExact: undefined, bpm: '120-130' }), 0, 'An estimated range cannot become a learned exact tempo');
  assert.equal(c.recentTempoAffinityScore({ ...near, style: 'techno' }), 0, 'House likes cannot impose a tempo on another subgenre');
  assert.equal(c.recentTempoAffinityScore({ ...near, bpmExact: 999 }), 0, 'Invalid tempo cannot influence ranking');
  c.likedTrackHistory = [anchor];
  assert.equal(c.recentTempoAffinityScore(near), 0, 'One like alone cannot establish tempo affinity');
  c.likedTrackHistory = Array.from({ length: 30 }, (_, i) => ({ ...anchor, song: `Explicit like ${i}` }));
  assert.ok(c.recentTempoAffinityScore(near) <= 2, 'Learning remains bounded instead of overwhelming quality and variety');
}
console.log('Recommendation intelligence passed: neutral feedback, actual tempo-driven queue adaptation, exact-data guards, bounded label variety and profile isolation.');
