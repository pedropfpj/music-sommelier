import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { createHash } from 'node:crypto';
import { execFileSync } from 'node:child_process';
import { createAppRuntimeTestContext } from './app-runtime-test-harness.mjs';

const root = fileURLToPath(new URL('../', import.meta.url));
const args = Object.fromEntries(process.argv.slice(2).filter(value => value.startsWith('--') && value.includes('=')).map(value => { const i = value.indexOf('='); return [value.slice(2, i), value.slice(i + 1)]; }));
const baseline = args.baseline ? path.resolve(root, args.baseline) : 'git:a21bc74d';
const candidate = path.resolve(root, args.source || 'app.js');
const steps = Math.max(1, Math.min(20, Number(args.steps) || 10));
const seeds = (args.seeds || '2321').split(',').map(Number).filter(Number.isFinite);
const profiles = [['psycore', '175+'], ['dark_psy', '155-175'], ['techno', '124-132'], ['house', '124-132'], ['slambient', '155-175']];
const manifest = JSON.parse(await fs.readFile(new URL('../data/runtime-catalog-v1/manifest.json', import.meta.url), 'utf8'));
const sources = await Promise.all([['baseline', baseline], ['candidate', candidate]].map(async ([name, file]) => ({ name, file, source: file === 'git:a21bc74d' ? execFileSync('git', ['show', 'a21bc74d:app.js'], { cwd: root, encoding: 'utf8' }) : await fs.readFile(file, 'utf8') })));
const rows = Object.fromEntries(await Promise.all(profiles.map(async ([style]) => [style, JSON.parse(await fs.readFile(new URL(`../data/runtime-catalog-v1/${manifest.styles[style]}`, import.meta.url), 'utf8'))])));

function create(source, style, bpm, seed) {
  const ctx = createAppRuntimeTestContext(source);
  let cursor = seed;
  ctx.Math = Object.assign(Object.create(Math), { random: () => ((cursor = (Math.imul(cursor, 1664525) + 1013904223) >>> 0) / 4294967296) });
  ctx.window.setTimeout = setTimeout; ctx.window.clearTimeout = clearTimeout;
  ctx.currentAuthUser = { mode: 'login', username: `benchmark-${seed}` };
  ctx.currentCurationUserSeed = () => `benchmark-user-${seed}`;
  ctx.currentCurationVisitId = () => `benchmark-visit-${seed}`;
  ctx.curationOpenSeed = `benchmark-open-${seed}`;
  ctx.styleEl = { value: style, options: profiles.map(([value]) => ({ value })) };
  ctx.bpmEl = { value: bpm };
  ctx.lastPrefs = { style, bpm, context: '', energy: '', vocals: '' };
  ctx.swipeUserAnchoredStyle = style;
  ctx.schedulePostBootIdleTask = () => {}; // Defer DOM/cloud effects; immediate learning functions remain real.
  ctx.mergeExternalDatasetRows(rows[style], `dataset_local_runtime_${style}`);
  ctx.sanitizeCatalogByStyleRules(); ctx.purgeDynamicMismatches(style);
  ctx.catalog = ctx.catalog.filter(track => track.style === style);
  return { ctx, prefs: ctx.lastPrefs, resetRandom() { cursor = seed; } };
}

function labelKey(ctx, track) {
  const label = ctx.sanitizeLabel(track.label, track.artist, track.song);
  return ctx.isCountableLabel(label) && !ctx.isUnknownLabel(label) ? ctx.normalize(label).slice(0, 120) : '';
}

function ranked(ctx, prefs) {
  const artists = ctx.buildGlobalArtistExclusionSet();
  const tracks = ctx.buildGlobalTrackExclusionSet();
  return ctx.pickRecommendation(prefs, artists, artists, tracks.keys, tracks.titles);
}

function verify(ctx, track, prefs, delivered) {
  assert.equal(track.style, prefs.style, 'Explicit style must hold');
  assert.equal(ctx.trackMatchesBpmPreference(track, prefs.bpm), true, 'Explicit BPM must hold');
  assert.equal(ctx.isTrackEligibleForRecommendation(track), true, 'Recording must remain eligible');
  assert.equal(ctx.trackMatchesRequestedSubgenreEvidence(track, prefs), true, 'Style evidence must remain valid');
  assert.equal(ctx.trackBlockedByKnownSignals(track), false, 'Heard recordings cannot be returned');
  assert.ok(delivered.every(prior => ctx.recommendationTrackKey(prior) !== ctx.recommendationTrackKey(track)), 'No repeated recording key');
  assert.ok(delivered.every(prior => !ctx.artistsShareIdentity(prior.artist, track.artist)), 'No repeated performer or collaboration component');
}

function describe(ctx, track, extra = {}) {
  return { ...extra, key: ctx.recommendationTrackKey(track), artist: track.artist, song: track.song, style: track.style, bpmExact: track.bpmExact || null, energy: track.energy || '', label: labelKey(ctx, track) };
}

const sessions = [], feedback = [];
for (const entry of sources) for (const [style, bpm] of profiles) for (const seed of seeds) {
  const { ctx, prefs } = create(entry.source, style, bpm, seed);
  const delivered = [], sequence = [], routeMisses = [];
  let exhaustedAt = null;
  for (let i = 0; i < steps; i++) {
    const route = ['ranked', 'queue', 'interaction'][i % 3];
    let track;
    if (route === 'ranked') track = ranked(ctx, prefs);
    else if (route === 'queue') {
      ctx.suggestionQueueTracks = ctx.buildSuggestionQueueFromPrefs(prefs, ctx.currentRecommendation);
      track = ctx.pickInstantSwipeTrack({ sourceTrack: ctx.currentRecommendation })?.track || null;
    } else track = ctx.pickInteractionBudgetTrack({ prefs, sourceTrack: ctx.currentRecommendation });
    let fallback = '';
    if (!track && route !== 'ranked') {
      // The UI falls back to the ordinary recommendation pipeline when an
      // instant/queued route has no candidate. Keep that handoff explicit.
      routeMisses.push({ attempt: i + 1, route });
      track = ranked(ctx, prefs);
      fallback = 'ranked_after_empty_instant_route';
    }
    if (!track) { exhaustedAt = { attempt: i + 1, route, fallback }; break; }
    verify(ctx, track, prefs, delivered);
    sequence.push(describe(ctx, track, { route, ...(fallback ? { fallback } : {}) })); delivered.push(track);
    ctx.markRecommendationPresented(track); ctx.currentRecommendation = track;
  }
  const labels = sequence.map(item => item.label).filter(Boolean);
  let maxRun = 0, run = 0, previous = '', consecutivePairs = 0;
  for (const item of sequence) {
    if (item.label && item.label === previous) { run += 1; consecutivePairs += 1; }
    else run = item.label ? 1 : 0;
    previous = item.label; maxRun = Math.max(maxRun, run);
  }
  sessions.push({ version: entry.name, style, bpm, seed, inventory: ctx.catalog.length, requested: steps, delivered: sequence.length, distinctLabels: new Set(labels).size, unlabeled: sequence.length - labels.length, longestSameLabelRun: maxRun, consecutiveSameLabelPairs: consecutivePairs, repeatedRecordings: 0, repeatedArtists: 0, wrongStyleOrBpm: 0, routeMisses, exhaustedAt, sequence });
  console.log(JSON.stringify({ version: entry.name, style, delivered: sequence.length, labels: new Set(labels).size, maxRun, exhaustedAt }));
}

// Same catalog, same three presented recordings and same RNG on each side of a
// real explicit-like operation; no audio or user satisfaction is inferred.
for (const entry of sources) for (const [style, bpm] of profiles) {
  const fixture = create(entry.source, style, bpm, seeds[0]);
  const { ctx, prefs } = fixture;
  const pool = ctx.catalog.filter(track => ctx.isTrackEligibleForRecommendation(track) && ctx.trackMatchesRequestedSubgenreEvidence(track, prefs) && ctx.trackMatchesBpmPreference(track, bpm)).sort((a, b) => ctx.recommendationTrackKey(a).localeCompare(ctx.recommendationTrackKey(b)));
  const likes = [];
  for (const track of pool) {
    if (likes.some(prior => ctx.artistsShareIdentity(prior.artist, track.artist))) continue;
    likes.push(track); if (likes.length === 3) break;
  }
  likes.forEach(track => ctx.markRecommendationPresented(track));
  fixture.resetRandom(); const before = ranked(ctx, prefs);
  const remaining = pool.filter(track => !likes.includes(track));
  const scoresBefore = new Map(remaining.map(track => [ctx.recommendationTrackKey(track), ctx.recommendationScore(track, prefs)]));
  likes.forEach(track => ctx.registerTrackFeedback(track, true, { source: 'benchmark_explicit_like', heard: false, deferEffects: true }));
  fixture.resetRandom(); const after = ranked(ctx, prefs);
  const changedScores = remaining.filter(track => Math.abs(ctx.recommendationScore(track, prefs) - scoresBefore.get(ctx.recommendationTrackKey(track))) > .1).length;
  feedback.push({ version: entry.name, style, bpm, simulatedExplicitLikesOnRealCatalog: likes.map(track => describe(ctx, track)), before: before ? describe(ctx, before) : null, after: after ? describe(ctx, after) : null, changedSelection: Boolean(before && after && ctx.recommendationTrackKey(before) !== ctx.recommendationTrackKey(after)), candidatesWithScoreChangeOverPointOne: changedScores, evaluatedCandidates: remaining.length, trainingSignals: ctx.userStats.swipeTrainingSignals });
}

const paired = profiles.map(([style]) => {
  const summarize = version => {
    const list = sessions.filter(item => item.version === version && item.style === style);
    return { delivered: list.reduce((sum, item) => sum + item.delivered, 0), meanDistinctLabels: list.reduce((sum, item) => sum + item.distinctLabels, 0) / list.length, longestSameLabelRun: Math.max(...list.map(item => item.longestSameLabelRun)), sameLabelPairs: list.reduce((sum, item) => sum + item.consecutiveSameLabelPairs, 0), exhaustedSessions: list.filter(item => item.exhaustedAt).length };
  };
  const sequenceChangeSessions = sessions.filter(item => item.version === 'baseline' && item.style === style).filter(before => {
    const after = sessions.find(item => item.version === 'candidate' && item.style === style && item.seed === before.seed);
    return after && JSON.stringify(before.sequence.map(item => item.key)) !== JSON.stringify(after.sequence.map(item => item.key));
  }).length;
  return { style, baseline: summarize('baseline'), candidate: summarize('candidate'), sequenceChangeSessions };
});
const report = { scope: 'Offline real catalog selection; media URLs are not fetched and no playback claim is made', executedAt: new Date().toISOString(), seedControl: 'LCG plus fixed user/visit/open seeds, identical between sources', paths: ['ranked', 'queue', 'interaction'], steps, seeds, sourceBuilds: sources.map(entry => ({ version: entry.name, build: entry.source.match(/const SONIC_APP_BUILD_ID = "([^"]+)"/)?.[1] || '', sha256: createHash('sha256').update(entry.source).digest('hex'), file: entry.file })), sessions, feedback, paired };
const output = new URL('../.vercel/major-intelligence/', import.meta.url);
await fs.mkdir(output, { recursive: true });
await fs.writeFile(new URL('results.json', output), JSON.stringify(report, null, 2));
console.log(JSON.stringify({ paired, feedbackSelectionChanges: feedback.filter(item => item.changedSelection).map(item => ({ version: item.version, style: item.style })) }));
