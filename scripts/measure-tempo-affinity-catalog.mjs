import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import { createHash } from 'node:crypto';
import { execFileSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { createAppRuntimeTestContext } from './app-runtime-test-harness.mjs';

const source = await fs.readFile(new URL('../app.js', import.meta.url), 'utf8');
const manifest = JSON.parse(await fs.readFile(new URL('../data/runtime-catalog-v1/manifest.json', import.meta.url), 'utf8'));
const profiles = [['techno', '124-132'], ['dark_psy', '155-175'], ['psycore', '175+'], ['slambient', '155-175'], ['house', '124-132']];
const c = createAppRuntimeTestContext(source);
let cursor = 2321;
c.Math = Object.assign(Object.create(Math), { random: () => ((cursor = (Math.imul(cursor, 1664525) + 1013904223) >>> 0) / 4294967296) });
c.window.setTimeout = setTimeout; c.window.clearTimeout = clearTimeout;
c.currentAuthUser = { mode: 'login', username: 'real-tempo-probe' };
c.currentCurationUserSeed = () => 'real-tempo-probe'; c.currentCurationVisitId = () => 'real-tempo-probe-visit'; c.curationOpenSeed = 'real-tempo-probe-open';
c.schedulePostBootIdleTask = () => {}; // Skip DOM/cloud effects; immediate learning remains real.
const attempts = [];
let sample = null;
const distinct = tracks => tracks.every((track, i) => tracks.slice(0, i).every(other => !c.artistsShareIdentity(track.artist, other.artist) && c.recommendationTrackKey(track) !== c.recommendationTrackKey(other)));
for (const [style, bpm] of profiles) {
  const rows = JSON.parse(await fs.readFile(new URL(`../data/runtime-catalog-v1/${manifest.styles[style]}`, import.meta.url), 'utf8'));
  c.mergeExternalDatasetRows(rows, `dataset_local_runtime_${style}`);
  c.sanitizeCatalogByStyleRules(); c.purgeDynamicMismatches(style);
  const prefs = { style, bpm, context: '', energy: '', vocals: '' };
  const pool = c.catalog.filter(track => track.style === style && c.isTrackEligibleForRecommendation(track) &&
    c.trackMatchesRequestedSubgenreEvidence(track, prefs) && c.trackMatchesBpmPreference(track, bpm) &&
    c.tempoAffinityExactBpm(track) > 0 && c.hasReliableBpmForTrack(track) && c.trackHasReadyPlaybackRoute(track));
  attempts.push({ style, bpm, eligibleExactReadyTracks: pool.length });
  for (let i = 0; i < pool.length && !sample; i++) for (let j = i + 1; j < pool.length && !sample; j++) {
    const likes = [pool[i], pool[j]];
    if (!distinct(likes) || Math.abs(likes[0].bpmExact - likes[1].bpmExact) > 2) continue;
    const center = (likes[0].bpmExact + likes[1].bpmExact) / 2;
    const near = pool.filter(track => Math.abs(track.bpmExact - center) <= 1 && distinct([...likes, track]));
    const far = pool.filter(track => Math.abs(track.bpmExact - center) >= 4 && distinct([...likes, track]));
    for (const nearby of near) for (const distant of far) {
      if (!sample && distinct([...likes, nearby, distant]) && nearby.energy === distant.energy) sample = { prefs, likes, near: nearby, far: distant };
    }
  }
  if (sample) break;
}

const report = { scope: 'Illustrative warmed queue composed of real catalog rows; no audio fetched; not a population-level quality benchmark', executedAt: new Date().toISOString(), sourceSha256: createHash('sha256').update(source).digest('hex'), attempts, found: Boolean(sample) };
if (sample) {
  const { prefs, likes, near, far } = sample;
  c.styleEl = { value: prefs.style, options: profiles.map(([value]) => ({ value })) };
  c.bpmEl = { value: prefs.bpm }; c.lastPrefs = prefs; c.swipeUserAnchoredStyle = prefs.style;
  likes.forEach(track => c.markRecommendationPresented(track));
  c.currentRecommendation = likes.at(-1);
  c.suggestionQueueTracks = [far, near];
  c.prewarmedSwipeTrackKeys = new Set([far, near].map(c.recommendationTrackKey));
  const describe = track => ({ artist: track.artist, song: track.song, style: track.style, bpmExact: track.bpmExact, energy: track.energy, label: track.label, key: c.recommendationTrackKey(track) });
  const scores = () => [far, near].map(track => ({ ...describe(track), eligible: c.isTrackEligibleForRecommendation(track), matchesStyleEvidence: c.trackMatchesRequestedSubgenreEvidence(track, prefs), matchesBpm: c.trackMatchesBpmPreference(track, prefs.bpm), adaptive: c.getAdaptiveScore(track), tempoAffinity: c.recentTempoAffinityScore(track), labelPenalty: c.recentLabelDiversityPenalty(track, prefs), queueSelectionScore: c.getAdaptiveScore(track) - c.recentLabelDiversityPenalty(track, prefs) * .25 + .75 }));
  const beforeScores = scores();
  const before = c.pickInstantSwipeTrack({ sourceTrack: c.currentRecommendation })?.track;
  likes.forEach(track => c.registerTrackFeedback(track, true, { source: 'catalog_tempo_probe_like', heard: false, deferEffects: true }));
  cursor = 2321;
  const afterScores = scores();
  const after = c.pickInstantSwipeTrack({ sourceTrack: c.currentRecommendation })?.track;
  assert.ok(before && after, 'Both states must supply an actual eligible queued recording');
  assert.ok([far, near].includes(before) && [far, near].includes(after));
  assert.equal(c.trackMatchesBpmPreference(after, prefs.bpm), true);
  assert.equal(c.trackMatchesRequestedSubgenreEvidence(after, prefs), true);
  assert.ok(!likes.some(track => c.artistsShareIdentity(track.artist, after.artist)), 'The next artist must be new');
  Object.assign(report, { prefs, likes: likes.map(describe), likedHistory: c.likedTrackHistory.map(entry => ({ artist: entry.artist, song: entry.song, bpmExact: entry.bpmExact, style: entry.style })), beforeScores, afterScores, before: describe(before), after: describe(after), changedSelection: c.recommendationTrackKey(before) !== c.recommendationTrackKey(after), trainingSignals: c.userStats.swipeTrainingSignals });
  const baselineSource = process.env.SONIC_TEMPO_BASELINE_SOURCE
    ? await fs.readFile(process.env.SONIC_TEMPO_BASELINE_SOURCE, 'utf8')
    : execFileSync('git', ['show', 'a21bc74d:app.js'], { cwd: fileURLToPath(new URL('../', import.meta.url)), encoding: 'utf8' });
  const b = createAppRuntimeTestContext(baselineSource);
  b.currentAuthUser = { mode: 'login', username: 'real-tempo-probe' };
  b.currentCurationUserSeed = () => 'real-tempo-probe'; b.currentCurationVisitId = () => 'real-tempo-probe-visit'; b.curationOpenSeed = 'real-tempo-probe-open';
  b.window.setTimeout = setTimeout; b.window.clearTimeout = clearTimeout; b.schedulePostBootIdleTask = () => {};
  b.mergeExternalDatasetRows(JSON.parse(await fs.readFile(new URL(`../data/runtime-catalog-v1/${manifest.styles[prefs.style]}`, import.meta.url), 'utf8')), `dataset_local_runtime_${prefs.style}`);
  b.sanitizeCatalogByStyleRules(); b.purgeDynamicMismatches(prefs.style);
  const same = track => b.catalog.find(item => b.recommendationTrackKey(item) === c.recommendationTrackKey(track));
  const baselineLikes = likes.map(same), baselineFar = same(far), baselineNear = same(near);
  assert.ok([...baselineLikes, baselineFar, baselineNear].every(Boolean), 'The baseline must resolve the same real recordings');
  b.styleEl = { value: prefs.style, options: profiles.map(([value]) => ({ value })) }; b.bpmEl = { value: prefs.bpm };
  b.lastPrefs = prefs; b.swipeUserAnchoredStyle = prefs.style;
  baselineLikes.forEach(track => b.markRecommendationPresented(track)); b.currentRecommendation = baselineLikes.at(-1);
  b.suggestionQueueTracks = [baselineFar, baselineNear]; b.prewarmedSwipeTrackKeys = new Set([baselineFar, baselineNear].map(b.recommendationTrackKey));
  const baselineBefore = b.pickInstantSwipeTrack({ sourceTrack: b.currentRecommendation })?.track;
  baselineLikes.forEach(track => b.registerTrackFeedback(track, true, { source: 'catalog_tempo_probe_like', heard: false, deferEffects: true }));
  const baselineAfter = b.pickInstantSwipeTrack({ sourceTrack: b.currentRecommendation })?.track;
  assert.ok(baselineBefore && baselineAfter);
  report.baselineControl = { sourceSha256: createHash('sha256').update(baselineSource).digest('hex'), before: describe(baselineBefore), after: describe(baselineAfter), changedSelection: b.recommendationTrackKey(baselineBefore) !== b.recommendationTrackKey(baselineAfter), adaptiveScoresAfterLikes: [baselineFar, baselineNear].map(track => ({ ...describe(track), adaptive: b.getAdaptiveScore(track) })) };
}
const output = new URL('../.vercel/major-intelligence/tempo-probe.json', import.meta.url);
await fs.mkdir(new URL('./', output), { recursive: true });
await fs.writeFile(output, JSON.stringify(report, null, 2));
console.log(JSON.stringify(report));
