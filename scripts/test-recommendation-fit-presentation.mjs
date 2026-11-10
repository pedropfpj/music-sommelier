import assert from 'node:assert/strict';
import { readFile, mkdir } from 'node:fs/promises';
import { execFileSync } from 'node:child_process';
import { createRequire } from 'node:module';
import { createAppRuntimeTestContext } from './app-runtime-test-harness.mjs';
import { startTestPreviewServer } from './test-preview-server.mjs';

const require = createRequire(import.meta.url);
const { minify } = require('terser');
const CleanCSS = require('clean-css');
const { chromium } = await import(process.env.SONIC_PLAYWRIGHT_MODULE || 'playwright');
const app = await readFile(new URL('../app.js', import.meta.url), 'utf8');
const css = await readFile(new URL('../styles.css', import.meta.url), 'utf8');
const baseline = process.env.SONIC_TRUST_BASELINE_APP
  ? await readFile(process.env.SONIC_TRUST_BASELINE_APP, 'utf8')
  : execFileSync('git', ['show', 'c63d5f5:app.js'], { encoding: 'utf8', maxBuffer: 8_000_000 });
const oldRuntime = createAppRuntimeTestContext(baseline);
const currentRuntime = createAppRuntimeTestContext(app);
const snapshotTime = Date.UTC(2026, 10, 10, 12);
for (const runtime of [oldRuntime, currentRuntime]) {
  runtime.Math = Object.assign(Object.create(Math), { random: () => 0.5 });
  runtime.Date = class extends Date { constructor(...args) { super(...(args.length ? args : [snapshotTime])); } static now() { return snapshotTime; } };
  runtime.hashUnit = () => 0.5;
  runtime.performance = { now: () => 1000 };
}
const baseTrack = oldRuntime.catalog.find(track => track.style === 'house' && track.bpmExact > 0);
let scoreComparisons = 0;
for (const learned of [false, true]) for (const extra of [{}, { bpmExact: undefined }, { previewUrl: '', previewChecked: true, previewMissing: true }, { style: 'big_beat', bpmExact: 150 }]) for (const prefs of [{}, { style: 'house' }, { style: 'house', context: 'foco', energy: 'high', bpm: '124-135' }]) {
  for (const runtime of [oldRuntime, currentRuntime]) {
    runtime.userStats.swipeTrainingSignals = learned ? 20 : 0;
    runtime.adaptiveModel.likedStyles.set(baseTrack.style, learned ? 6 : 0);
  }
  const track = { ...baseTrack, ...extra };
  const oldTrust = oldRuntime.recommendationTrustAnalysis({ ...track }, prefs);
  const newTrust = currentRuntime.recommendationTrustAnalysis({ ...track }, prefs);
  assert.equal(newTrust.score, oldTrust.score, 'Presentation must preserve the actual heuristic score');
  assert.equal(newTrust.level, oldTrust.level);
  assert.equal(currentRuntime.recommendationScore({ ...track }, prefs), oldRuntime.recommendationScore({ ...track }, prefs));
  assert.equal(currentRuntime.recommendationPrecisionScore({ ...track }, prefs), oldRuntime.recommendationPrecisionScore({ ...track }, prefs));
  scoreComparisons++;
}
const rows = JSON.parse(await readFile(new URL('../data/runtime-catalog-v1/styles/big_beat.json', import.meta.url)));
const reviewed = rows.find(row => row.source === 'big_beat_editorial_v26_20261110');
const primary = JSON.parse(await readFile(new URL('../data/runtime-catalog-v1/styles/forest_psy.json', import.meta.url))).find(row => String(row.source_tags).includes('electronic_label_recordings_v25'));
assert.ok(reviewed && primary);
currentRuntime.mergeExternalDatasetRows([primary], 'dataset_local_runtime_fit_evidence');
const primaryTrack = currentRuntime.catalog.find(track => track.artist === primary.artist && track.song === primary.song);
assert.ok(currentRuntime.recommendationEvidenceSource(primaryTrack));
for (const url of ['javascript:alert(1)', 'http://parvati-records.com/release/', 'https://user:password@parvati-records.com/release/', 'https://parvati-records.com/', 'https://unverified.fixture.test/release/']) {
  assert.equal(currentRuntime.recommendationEvidenceSource({ ...primaryTrack, catalogMetadata: { ...primaryTrack.catalogMetadata, genre_evidence_url: url } }), null);
}
// Native media decoding verifies the loaded/unloaded copy without faking media
// events or readyState. This is fixture audio, not a claim about provider uptime.
const pcm = Buffer.alloc(16000); const header = Buffer.alloc(44);
for (let i = 0; i < 8000; i++) pcm.writeInt16LE(Math.round(Math.sin(i * Math.PI * 440 / 8000) * 400), i * 2);
header.write('RIFF'); header.writeUInt32LE(36 + pcm.length, 4); header.write('WAVEfmt ', 8);
header.writeUInt32LE(16, 16); header.writeUInt16LE(1, 20); header.writeUInt16LE(1, 22);
header.writeUInt32LE(8000, 24); header.writeUInt32LE(16000, 28); header.writeUInt16LE(2, 32); header.writeUInt16LE(16, 34); header.write('data', 36); header.writeUInt32LE(pcm.length, 40);
const wav = Buffer.concat([header, pcm]);
const minApp = (await minify(app, { compress: true, mangle: true })).code;
const minCss = new CleanCSS({ level: 1 }).minify(css).styles;
const preview = await startTestPreviewServer();
const browser = await chromium.launch({ headless: true, executablePath: '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome' });
const screenshots = process.env.SONIC_FIT_SCREENSHOTS || '';
if (screenshots) await mkdir(screenshots, { recursive: true });
const copy = {
  pt: { filters: 'Guiada pelos filtros', profile: 'Perto do seu gosto', explore: 'Para explorar', tempo: 'BPM não verificado', summary: 'Fontes e detalhes', loaded: 'Áudio carregado', unknown: 'Fonte específica do subgênero ainda não disponível.' },
  en: { filters: 'Guided by your filters', profile: 'Close to your taste', explore: 'Worth exploring', tempo: 'BPM unverified', summary: 'Sources and details', loaded: 'Audio loaded', unknown: 'A specific subgenre source is not available yet.' },
  es: { filters: 'Guiada por tus filtros', profile: 'Cerca de tu gusto', explore: 'Para explorar', tempo: 'BPM sin verificar', summary: 'Fuentes y detalles', loaded: 'Audio cargado', unknown: 'Aún no hay una fuente específica del subgénero.' }
};
const errors = [];
try {
  for (const minified of [false, true]) for (const width of [375, 1440]) for (const language of ['pt', 'en', 'es']) {
    const page = await browser.newPage({ viewport: { width, height: 1050 }, reducedMotion: 'reduce' });
    page.on('pageerror', error => errors.push(error.message));
    await page.route('**/*', route => {
      const url = new URL(route.request().url());
      if (url.hostname === 'fit-audio.fixture.test') return url.pathname.includes('dead')
        ? route.fulfill({ status: 404, body: 'Fixture recording unavailable' })
        : route.fulfill({ contentType: 'audio/wav', body: wav });
      if (url.origin !== preview.baseUrl) return route.abort();
      if (url.pathname.startsWith('/api/')) return route.fulfill({ json: { ok: true, enabled: false, tracks: [], count: 0 } });
      if (url.pathname === '/app.min.js') return route.fulfill({ contentType: 'application/javascript', body: minified ? minApp : app });
      if (url.pathname === '/styles.min.css') return route.fulfill({ contentType: 'text/css', body: minified ? minCss : css });
      return route.continue();
    });
    await page.addInitScript(() => localStorage.setItem('sonic_search:privacy:analytics:v1', 'no'));
    await page.goto(`${preview.baseUrl}/?qa=1&screenshot=1&recommendation=0&lang=${language}`, { waitUntil: 'domcontentloaded' });
    await page.waitForFunction(() => typeof renderRecommendationWhy === 'function');
    const initial = await page.evaluate(({ reviewed, primary, language }) => {
      setLanguage(language); setActiveAppTab('discover');
      document.getElementById('resultPanel').classList.remove('hidden');
      document.getElementById('discoveryDetailDrawer').open = true;
      mergeExternalDatasetRows([reviewed, primary], 'dataset_local_runtime_fit_ui');
      window.fitReviewed = catalog.find(track => reviewedRecordingStyleProof(track) && track.song === reviewed.song);
      window.fitPrimary = catalog.find(track => track.artist === primary.artist && track.song === primary.song);
      window.fitUnknown = { ...fitReviewed, artist: 'Evidence Fixture', song: 'Unknown evidence', style: 'house', artistGenre: '', source: 'dynamic_dataset_local_unverified', sourceTags: [], catalogMetadata: { genre_evidence_url: 'javascript:alert(1)' }, bpmExact: undefined, bpm: '', previewUrl: '', previewCandidates: [], previewChecked: true, previewMissing: true };
      userStats.swipeTrainingSignals = 0; adaptiveModel.likedStyles.clear(); adaptiveModel.likedArtists.clear();
      currentRecommendation = fitReviewed; lastPrefs = { style: 'big_beat' };
      document.getElementById('songTitle').textContent = fitReviewed.song;
      document.getElementById('artistName').textContent = fitReviewed.artist;
      renderRecommendationWhy(fitReviewed, lastPrefs);
      return { score: recommendationTrustAnalysis(fitReviewed, lastPrefs).score, proof: Boolean(reviewedRecordingStyleProof(fitReviewed)) };
    }, { reviewed, primary, language });
    assert.equal(initial.proof, true);
    assert.equal(await page.locator('#recommendationWhyTitle').textContent(), { pt: 'Por que entrou no radar', en: 'Why it entered the radar', es: 'Por qué entró en el radar' }[language], JSON.stringify(await page.evaluate(() => ({ language: currentLanguage, translated: t('recommendationWhyTitle'), table: I18N[currentLanguage]?.recommendationWhyTitle }))));
    assert.equal(await page.locator('#recommendationTrustLabel').textContent(), { pt: 'Para você', en: 'For you', es: 'Para ti' }[language]);
    assert.equal(await page.locator('#recommendationTrustValue').textContent(), copy[language].filters);
    assert.ok((await page.locator('#recommendationWhyList').textContent()).includes(copy[language].tempo));
    assert.doesNotMatch(await page.locator('#recommendationTrustPanel').textContent(), /\d+%/);
    assert.doesNotMatch(await page.locator('#recommendationWhyPanel').textContent(), /dataset|source_tags|recording_id|1635966361|swipe confirms|swipe para confirmar/i);
    assert.equal(await page.locator('#recommendationEvidenceDetails').getAttribute('open'), null);
    const summary = page.locator('#recommendationEvidenceSummary');
    assert.equal(await summary.textContent(), copy[language].summary);
    await summary.focus(); await page.keyboard.press('Enter');
    assert.equal(await page.locator('#recommendationEvidenceDetails').getAttribute('open'), '');
    const link = page.locator('#recommendationEvidenceBody a');
    assert.equal(await link.getAttribute('href'), 'https://music.apple.com/us/playlist/big-beat-essentials/pl.78e98b7f1ea842dc807bd646ab37083e');
    assert.equal(await link.getAttribute('target'), '_blank');
    assert.equal(await link.getAttribute('rel'), 'noopener noreferrer');
    const geometry = await page.evaluate(() => {
      const panel = document.getElementById('recommendationWhyPanel').getBoundingClientRect();
      const summary = document.getElementById('recommendationEvidenceSummary').getBoundingClientRect();
      return { right: panel.right, left: panel.left, summaryHeight: summary.height, pageOverflow: document.documentElement.scrollWidth > innerWidth + 1, focusStyle: getComputedStyle(document.activeElement).outlineStyle };
    });
    assert.ok(geometry.left >= -1 && geometry.right <= width + 1);
    assert.equal(geometry.pageOverflow, false);
    assert.ok(geometry.summaryHeight >= 44); assert.notEqual(geometry.focusStyle, 'none');
    assert.equal(await page.locator('#recommendationWhyTitle').textContent(), { pt: 'Por que entrou no radar', en: 'Why it entered the radar', es: 'Por qué entró en el radar' }[language]);
    assert.equal(await page.locator('#recommendationTrustLabel').textContent(), { pt: 'Para você', en: 'For you', es: 'Para ti' }[language]);
    if (screenshots && !minified) {
      await page.locator('#recommendationWhyPanel').screenshot({ path: `${screenshots}/fit-${language}-${width}.png` });
      await page.locator('#recommendationTrustPanel').screenshot({ path: `${screenshots}/fit-summary-${language}-${width}.png` });
    }
    await page.evaluate(() => {
      window.fitFocusedSource = document.querySelector('#recommendationEvidenceBody a'); fitFocusedSource.focus();
      fitReviewed.previewUrl = 'https://fit-audio.fixture.test/clip.wav'; fitReviewed.previewCandidates = [fitReviewed.previewUrl];
      trackPreview.dataset.previewTrackKey = recommendationTrackKey(fitReviewed);
      trackPreview.src = fitReviewed.previewUrl; trackPreview.load();
    });
    await page.waitForFunction(() => trackPreview.readyState >= 2);
    assert.ok((await page.locator('#recommendationWhyList').textContent()).includes(copy[language].loaded));
    assert.equal(await page.evaluate(() => document.activeElement === fitFocusedSource && document.getElementById('recommendationEvidenceDetails').open), true, 'Loading audio preserves source focus and expanded details');
    await page.evaluate(() => {
      window.fitOriginalRecovery = recoverCurrentPreviewAfterPlaybackIssue;
      recoverCurrentPreviewAfterPlaybackIssue = async () => false;
      fitReviewed.previewUrl = 'https://fit-audio.fixture.test/dead.wav'; fitReviewed.previewCandidates = [fitReviewed.previewUrl];
      trackPreview.src = fitReviewed.previewUrl; trackPreview.load();
    });
    const unavailable = { pt: 'Áudio não disponível', en: 'Audio unavailable', es: 'Audio no disponible' }[language];
    await page.waitForFunction(text => document.getElementById('recommendationWhyList').textContent.includes(text), unavailable);
    assert.ok(!(await page.locator('#recommendationWhyList').textContent()).includes(copy[language].loaded));
    assert.equal(await page.evaluate(() => document.activeElement === fitFocusedSource && document.getElementById('recommendationEvidenceDetails').open), true, 'Late failure updates only the audio chip, preserving disclosure/focus');
    await page.evaluate(() => { recoverCurrentPreviewAfterPlaybackIssue = fitOriginalRecovery; });
    await page.evaluate(() => { trackPreview.dataset.previewTrackKey = 'another recording'; renderRecommendationWhy(fitReviewed, { style: 'big_beat' }); });
    assert.ok(!(await page.locator('#recommendationWhyList').textContent()).includes(copy[language].loaded), 'Media owned by another recording cannot certify audio readiness');
    await page.evaluate(() => { renderRecommendationWhy(fitPrimary, {}); });
    assert.match(await page.locator('#recommendationEvidenceBody a').getAttribute('href'), /^https:\/\/parvati-records\.com\//);
    assert.equal(await page.locator('#recommendationEvidenceDetails').getAttribute('open'), null, 'A new track collapses old source details');
    const learned = await page.evaluate(() => {
      const before = trackStyleCertainty(fitUnknown);
      userStats.swipeTrainingSignals = 12; adaptiveModel.likedStyles.set(fitUnknown.style, 6);
      renderRecommendationWhy(fitUnknown, {});
      return { before, after: trackStyleCertainty(fitUnknown), mode: recommendationFitPresentation(fitUnknown, {}).mode };
    });
    assert.equal(learned.mode, 'profile'); assert.equal(learned.before, learned.after, 'Taste signals cannot certify musical classification');
    assert.equal(await page.locator('#recommendationTrustValue').textContent(), copy[language].profile);
    assert.equal(await page.locator('#recommendationEvidenceBody a').count(), 0, 'Unverified metadata must not produce a link');
    assert.ok((await page.locator('#recommendationEvidenceBody').textContent()).includes(copy[language].unknown));
    await page.evaluate(() => { userStats.swipeTrainingSignals = 0; adaptiveModel.likedStyles.clear(); renderRecommendationWhy(fitUnknown, {}); });
    assert.equal(await page.locator('#recommendationTrustValue').textContent(), copy[language].explore);
    await page.evaluate(() => renderRecommendationWhy(null, {}));
    assert.equal(await page.locator('#recommendationEvidenceBody a').count(), 0);
    assert.equal(await page.locator('#recommendationTrustPanel').evaluate(element => element.classList.contains('hidden')), true);
    await page.close();
  }
  assert.deepEqual(errors, []);
  console.log(`Recommendation fit presentation passed: ${scoreComparisons} actual score/ranking comparisons with c63d5f5 unchanged; source/min runtime × PT/EN/ES × 375/1440, verified links, unknown evidence and keyboard disclosure. No provider or account traffic.`);
} finally { await browser.close(); await preview.stop(); }
