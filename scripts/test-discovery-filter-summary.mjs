import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import { startTestPreviewServer } from './test-preview-server.mjs';

const playwright = await import(process.env.SONIC_PLAYWRIGHT_MODULE || 'playwright');
const [engine = 'chromium'] = process.argv.slice(2).filter(arg => !arg.startsWith('--'));
const useBundle = process.argv.includes('--bundle');
assert.ok(['chromium', 'webkit'].includes(engine));
const [app, css, discoveryCss] = await Promise.all([
  fs.readFile(new URL(useBundle ? '../app.min.js' : '../app.js', import.meta.url), 'utf8'),
  fs.readFile(new URL(useBundle ? '../styles.min.css' : '../styles.css', import.meta.url), 'utf8'),
  fs.readFile(new URL('../discovery-experience.css', import.meta.url), 'utf8')
]);
const rate = 12000, samples = rate * 30;
const wav = Buffer.alloc(44 + samples * 2);
wav.write('RIFF'); wav.writeUInt32LE(wav.length - 8, 4); wav.write('WAVEfmt ', 8);
wav.writeUInt32LE(16, 16); wav.writeUInt16LE(1, 20); wav.writeUInt16LE(1, 22);
wav.writeUInt32LE(rate, 24); wav.writeUInt32LE(rate * 2, 28); wav.writeUInt16LE(2, 32);
wav.writeUInt16LE(16, 34); wav.write('data', 36); wav.writeUInt32LE(samples * 2, 40);
for (let i = 0; i < samples; i++) wav.writeInt16LE(Math.round(Math.sin(i * 2 * Math.PI * 330 / rate) * 1200), 44 + i * 2);
const preview = await startTestPreviewServer();
const output = new URL(`../.vercel/discovery-filter-summary/${engine}/`, import.meta.url);
await fs.mkdir(output, { recursive: true });
const browser = await playwright[engine].launch();
const context = await browser.newContext({ ...playwright.devices[engine === 'webkit' ? 'iPhone 13' : 'Pixel 7'], reducedMotion: 'reduce', locale: 'pt-BR', serviceWorkers: 'block' });
const page = await context.newPage();
const errors = [];
page.on('pageerror', error => errors.push(error.message));
const mediaUrl = 'https://sonic-filters.test/fixture.wav';
await page.route('**/*', route => {
  const url = new URL(route.request().url());
  if (url.href === mediaUrl) return route.fulfill({ body: wav, contentType: 'audio/wav', headers: { 'Access-Control-Allow-Origin': '*' } });
  if (url.origin !== preview.baseUrl) return route.abort();
  if (url.pathname.startsWith('/api/')) return route.fulfill({ json: { ok: true, enabled: false, items: [], tracks: [], count: 0 } });
  if (url.pathname === '/app.min.js') return route.fulfill({ contentType: 'text/javascript', body: app });
  if (url.pathname === '/styles.min.css') return route.fulfill({ contentType: 'text/css', body: css });
  if (url.pathname === '/discovery-experience.css') return route.fulfill({ contentType: 'text/css', body: discoveryCss });
  return route.continue();
});

async function boot() {
  await page.goto(`${preview.baseUrl}/?qa=1&lang=pt&recommendation=0`, { waitUntil: 'domcontentloaded' });
  await page.waitForFunction(() => typeof removeDiscoveryFilter === 'function');
  for (const selector of ['#privacyEssentialBtn', '#languageScreen [data-lang="pt"]', '#authGuestBtn', '#usageGuideContinueBtn', '#tasteCalibrationSkipBtn']) {
    if (await page.locator(selector).isVisible()) await page.locator(selector).click();
  }
  await page.locator('#topSwipeSurpriseBtn').waitFor({ state: 'visible' });
}

function state() {
  return {
    prefs: prefsFromManualControls(), last: lastPrefs,
    knownArtists: [...knownArtistsMemory], knownTracks: [...knownTrackTitlesMemory], legacyKnownTracks: [...legacyKnownTrackTitlesMemory],
    seen: [...seenTrackKeysMemory], likes: likedTrackHistory, dislikes: dislikedTrackHistory,
    track: recommendationTrackKey(currentRecommendation), source: trackPreview.getAttribute('src'),
    plays: window.filterTestPlayEvents, paused: trackPreview.paused
  };
}

try {
  await boot();
  await page.evaluate(url => {
    ephemeralProfileMode = false;
    activateUserSession({ mode: 'test', username: 'Filter A' });
    setActiveAppTab('discover');
    const values = { style: 'full_on_night', context: 'noite', energy: 'high', bpm: '145-155', vocals: 'instrumental' };
    for (const [key, control] of Object.entries(discoveryFilterControls())) {
      control.value = values[key]; control.dispatchEvent(new Event('change', { bubbles: true }));
    }
    knownArtistsMemory.add('known fixture artist'); knownTrackTitlesMemory.add('known fixture track'); legacyKnownTrackTitlesMemory.add('legacy fixture track');
    seenTrackKeysMemory.add('previously heard fixture'); saveProgress();
    const track = { song: 'Filter test tone', artist: 'Test fixture', style: 'full_on_night', bpmExact: 150, label: 'Test fixture', source: 'filter_test_fixture', previewUrl: url };
    restoreRecommendationSurfaceSnapshot({ track, prefs: prefsFromManualControls(), discovery: null }, { restartPreview: false });
    trackPreview.dataset.previewTrackKey = recommendationTrackKey(track);
    trackPreview.dataset.previewRenderToken = String(recommendationPreviewRenderToken);
    trackPreview.src = url;
    previewPanel.classList.remove('hidden');
    window.filterTestPlayEvents = 0;
    trackPreview.addEventListener('play', () => { window.filterTestPlayEvents++; });
    setPreviewPrimaryPlaybackState('retry'); previewPlayBtn.classList.remove('hidden');
  }, mediaUrl);
  assert.equal(await page.locator('[data-discovery-filter]').count(), 5);
  await page.locator('#previewPlayBtn').click();
  await page.waitForFunction(() => !trackPreview.paused && trackPreview.currentTime > .1);
  const before = await page.evaluate(state);
  await page.locator('[data-discovery-filter="bpm"]').click();
  const after = await page.evaluate(state);
  assert.deepEqual(after.prefs, { ...before.prefs, bpm: '' });
  assert.deepEqual(after.last, after.prefs, 'The next feedback/reroll must not resurrect the removed tempo');
  for (const key of ['knownArtists', 'knownTracks', 'legacyKnownTracks', 'seen', 'likes', 'dislikes', 'track', 'source', 'plays', 'paused']) assert.deepEqual(after[key], before[key], key);
  assert.equal(await page.locator('[data-discovery-filter]').count(), 4);
  assert.match(await page.locator('#discoveryFilterStatus').textContent(), /próxima faixa/);
  const expected = after.prefs;

  // Save/restore uses the real per-profile preference storage across a reload.
  await boot();
  await page.evaluate(() => { ephemeralProfileMode = false; activateUserSession({ mode: 'test', username: 'Filter A' }); setActiveAppTab('discover'); });
  assert.deepEqual(await page.evaluate(() => prefsFromManualControls()), expected);
  assert.equal(await page.locator('[data-discovery-filter]').count(), 4);
  await page.evaluate(() => activateUserSession({ mode: 'test', username: 'Filter B' }));
  assert.equal(await page.locator('[data-discovery-filter]').count(), 0, 'Another profile starts with its own empty filters');
  assert.deepEqual(await page.evaluate(() => prefsFromManualControls()), { style: '', context: '', energy: '', bpm: '', vocals: '' });
  assert.equal(await page.evaluate(() => knownArtistsMemory.has('known fixture artist') || knownTrackTitlesMemory.has('known fixture track')), false, 'Learned knowledge from profile A cannot enter profile B');
  await page.evaluate(() => activateUserSession({ mode: 'test', username: 'Filter A' }));
  assert.deepEqual(await page.evaluate(() => prefsFromManualControls()), expected);
  const learned = await page.evaluate(() => ({ artists: [...knownArtistsMemory], tracks: [...knownTrackTitlesMemory], legacy: [...legacyKnownTrackTitlesMemory], seen: [...seenTrackKeysMemory] }));
  await page.locator('#discoveryFilterClear').click();
  assert.equal(await page.locator('[data-discovery-filter]').count(), 0);
  assert.deepEqual(await page.evaluate(() => ({ artists: [...knownArtistsMemory], tracks: [...knownTrackTitlesMemory], legacy: [...legacyKnownTrackTitlesMemory], seen: [...seenTrackKeysMemory] })), learned);
  assert.match(await page.locator('#discoveryFilterHint').textContent(), /Exploração livre/);
  await page.evaluate(() => { styleEl.value = 'full_on_night'; savePreferences(); clearFilters(); });
  assert.deepEqual(await page.evaluate(() => ({ artists: [...knownArtistsMemory], tracks: [...knownTrackTitlesMemory], legacy: [...legacyKnownTrackTitlesMemory], seen: [...seenTrackKeysMemory] })), learned, 'The original full-form clear also preserves learned knowledge');
  for (const [lang, title] of [['en', 'Next track filters'], ['es', 'Filtros de la próxima pista'], ['pt', 'Filtros da próxima faixa']]) {
    await page.evaluate(language => setLanguage(language, { persist: false }), lang);
    assert.equal(await page.locator('#discoveryFilterTitle').textContent(), title);
  }
  await page.evaluate(() => { styleEl.value = 'full_on_night'; bpmEl.value = '145-155'; savePreferences(); });
  for (const width of [320, 393, 1440]) {
    await page.setViewportSize({ width, height: 900 });
    const metrics = await page.locator('#discoveryFilterSummary').evaluate(el => ({ width: el.clientWidth, scroll: el.scrollWidth, buttons: [...el.querySelectorAll('button:not([hidden])')].map(button => button.getBoundingClientRect().height) }));
    assert.ok(metrics.scroll <= metrics.width + 1 && metrics.buttons.every(height => height >= 44), `Accessible layout at ${width}`);
    if (engine === 'chromium') await page.locator('#discoveryFilterSummary').screenshot({ path: new URL(`filters-${width}.png`, output).pathname });
  }
  assert.deepEqual(errors, []);
  console.log(JSON.stringify({ engine, passed: true, checks: ['five active filters', 'remove only one', 'preserved playing source and learned history', 'next-action preferences aligned', 'reload persistence', 'profile isolation', 'both clear actions preserve learning', 'PT/EN/ES', '320/393/1440 touch targets'], media: 'generated test tone; not catalog coverage' }));
} finally { await browser.close(); await preview.stop(); }
