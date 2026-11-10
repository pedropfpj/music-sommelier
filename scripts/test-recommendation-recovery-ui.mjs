import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { startTestPreviewServer } from './test-preview-server.mjs';
const { chromium } = await import(process.env.SONIC_PLAYWRIGHT_MODULE || 'playwright');
const app = await fs.readFile(new URL('../app.js', import.meta.url), 'utf8');
const css = await fs.readFile(new URL('../styles.css', import.meta.url), 'utf8');
const preview = await startTestPreviewServer();
const browser = await chromium.launch({ headless: true, executablePath: process.env.SONIC_CHROMIUM_EXECUTABLE || '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome' });
const output = fileURLToPath(new URL('../.vercel/recommendation-recovery/', import.meta.url));
await fs.mkdir(output, { recursive: true });
try {
  const page = await browser.newPage({ viewport: { width: 375, height: 812 }, reducedMotion: 'reduce' });
  const errors = []; page.on('pageerror', error => errors.push(error.message));
  await page.route('**/*', route => {
    const url = new URL(route.request().url());
    if (url.origin !== preview.baseUrl) return route.abort();
    if (url.pathname.startsWith('/api/')) return route.fulfill({ json: { ok: true, enabled: false, items: [], tracks: [], count: 0 } });
    if (url.pathname === '/app.min.js') return route.fulfill({ contentType: 'application/javascript', body: app });
    if (url.pathname === '/styles.min.css') return route.fulfill({ contentType: 'text/css', body: css });
    if (url.pathname.startsWith('/data/runtime-catalog-v1/styles/')) return route.fulfill({ json: [] });
    return route.continue();
  });
  await page.addInitScript(() => localStorage.setItem('sonic_search:privacy:analytics:v1', 'no'));
  await page.goto(`${preview.baseUrl}/?qa=1&lang=pt&recommendation=0`, { waitUntil: 'domcontentloaded' });
  await page.waitForFunction(() => typeof runManualFilterSurprise === 'function' && typeof retryRecommendationRecovery === 'function');
  const panel = page.locator('#recommendationRecovery');
  assert.equal(await panel.isVisible(), false);
  const before = await page.evaluate(() => {
    const track = pickInstantOpeningTrack()?.track;
    if (!track) throw new Error('Need a real local catalog recording for the preserved card');
    window.recoveryFixtureTrack = track;
    restoreRecommendationSurfaceSnapshot({ track, prefs: { style: track.style }, discovery: null }, { restartPreview: false });
    markRecommendationPresented(track); firstRecommendationCompleted = true;
    // Empty the requested pool in this browser fixture, without replacing any
    // scoring, selection, history or generation function.
    catalog.splice(0, catalog.length); catalogTracksByStyle.clear();
    styleEl.value = 'big_beat'; contextEl.value = ''; energyEl.value = ''; bpmEl.value = ''; vocalsEl.value = '';
    return { track: recommendationTrackKey(currentRecommendation), filters: prefsFromManualControls(), seen: [...seenTrackKeysMemory], liked: [...likedTrackHistory], disliked: [...dislikedTrackHistory] };
  });
  assert.equal(await page.evaluate(() => runManualFilterSurprise()), false, 'The real filtered recommendation pipeline finds no candidate in the empty fixture pool');
  await panel.waitFor({ state: 'visible' });
  await page.locator('#searchOverlay').waitFor({ state: 'hidden' });
  const after = await page.evaluate(() => ({ track: recommendationTrackKey(currentRecommendation), filters: prefsFromManualControls(), seen: [...seenTrackKeysMemory], liked: [...likedTrackHistory], disliked: [...dislikedTrackHistory] }));
  assert.deepEqual(after, before, 'Failure preserves the previous recording, selected filters and listening history');
  assert.equal(await page.evaluate(() => currentActiveAppTabName()), 'discover');
  assert.ok((await panel.innerText()).includes('Big Beat'));
  assert.ok(!(await panel.innerText()).match(/gênero errado|wrong genre|género incorrecto|API|pool|gate|catálogo/i));
  await page.locator('#recommendationRecoveryFilters').click();
  assert.equal(await page.evaluate(() => currentActiveAppTabName()), 'filters');
  assert.deepEqual(await page.evaluate(() => prefsFromManualControls()), before.filters, 'The explicit recovery action opens Filters without selecting another style');
  await page.evaluate(() => setActiveAppTab('discover'));
  await page.evaluate(() => {
    const original = runPrimaryRecommendationAction;
    window.recoveryRetryCalls = 0;
    runPrimaryRecommendationAction = options => { recoveryRetryCalls++; return original(options); };
    document.getElementById('recommendationRecoveryRetry').click();
    document.getElementById('recommendationRecoveryRetry').click();
  });
  await page.waitForFunction(() => recommendationRecoveryRetryBusy);
  assert.equal(await page.locator('#recommendationRecoveryRetry').isDisabled(), true);
  assert.equal(await page.locator('#recommendationRecoveryFilters').isDisabled(), true);
  await page.waitForFunction(() => !recommendationRecoveryRetryBusy && !recommendationRunBusy, null, { timeout: 30000 });
  assert.equal(await page.evaluate(() => recoveryRetryCalls), 1, 'A double click starts only one real recommendation retry');
  await page.locator('#searchOverlay').waitFor({ state: 'hidden' });
  assert.equal(await panel.isVisible(), true, 'A second empty result keeps recovery visible');
  assert.deepEqual(await page.evaluate(() => prefsFromManualControls()), before.filters);
  for (const width of [375, 1440]) {
    await page.setViewportSize({ width, height: width === 375 ? 812 : 1000 });
    await panel.scrollIntoViewIfNeeded();
    const metrics = await panel.evaluate(el => ({ width: el.getBoundingClientRect().width, scroll: el.scrollWidth, buttons: [...el.querySelectorAll('button')].map(button => button.getBoundingClientRect().height) }));
    assert.ok(metrics.scroll <= Math.ceil(metrics.width) + 1 && metrics.buttons.every(height => height >= 44));
    await panel.screenshot({ path: `${output}/recovery-${width}.png` });
  }
  for (const [language, retry, filters] of [['en', 'Try again', 'Adjust filters'], ['es', 'Intentar de nuevo', 'Ajustar filtros'], ['pt', 'Tentar novamente', 'Ajustar filtros']]) {
    await page.evaluate(language => setLanguage(language, { persist: false }), language);
    assert.equal(await page.locator('#recommendationRecoveryRetry').textContent(), retry);
    assert.equal(await page.locator('#recommendationRecoveryFilters').textContent(), filters);
  }
  await page.evaluate(() => {
    recommendationBlockedByKnown = false;
    presentRecommendationFailure({ message: noVerifiedTrackMessage() });
  });
  assert.ok(!(await panel.innerText()).match(/estilo errado|gênero errado/i), 'Audio availability does not become a claim of incorrect genre');
  await page.evaluate(() => {
    // Real presentation registration is the shared successful-commit hook used
    // by recommendation, saved-recording and exact-edition delivery paths.
    restoreRecommendationSurfaceSnapshot({ track: recoveryFixtureTrack, prefs: { style: recoveryFixtureTrack.style }, discovery: null }, { restartPreview: false });
    markRecommendationPresented(recoveryFixtureTrack);
  });
  assert.equal(await panel.isVisible(), false, 'A later confirmed card presentation removes the stale recovery panel');
  const knownCard = await page.evaluate(() => recommendationTrackKey(currentRecommendation));
  await page.evaluate(() => handleKnownArtistYes());
  assert.equal(await page.evaluate(() => recommendationTrackKey(currentRecommendation)), knownCard, 'Already-known feedback preserves the visible recording when no replacement exists');
  assert.equal(await page.evaluate(() => artistSetHasMatch(knownArtistsMemory, currentRecommendation.artist)), true, 'The explicit known-artist feedback remains recorded');
  await panel.waitFor({ state: 'visible' });
  await page.evaluate(() => {
    presentRecommendationFailure();
    window.oldRecoveryGeneration = recommendationSessionGeneration;
    runPrimaryRecommendationAction = () => new Promise(resolve => { window.releaseOldRecovery = resolve; });
    document.getElementById('recommendationRecoveryRetry').click();
  });
  await page.waitForFunction(() => typeof releaseOldRecovery === 'function');
  await page.evaluate(() => {
    activateUserSession({ mode: 'test', username: 'Recovery account B' });
    styleEl.value = 'big_beat';
    releaseOldRecovery(false);
    presentRecommendationFailure({ generation: oldRecoveryGeneration });
  });
  await page.evaluate(() => new Promise(resolve => requestAnimationFrame(resolve)));
  assert.equal(await panel.isVisible(), false, 'An old account failure or retry completion cannot show recovery for account B');
  assert.equal(await page.evaluate(() => styleEl.value), 'big_beat');
  await page.evaluate(() => presentRecommendationFailure());
  assert.ok((await page.locator('#recommendationRecoveryText').textContent()).includes('Não encontrei uma faixa disponível'), 'A first-use empty result does not claim there is an existing track to keep');
  assert.deepEqual(errors, []);
  await fs.writeFile(`${output}/report.json`, JSON.stringify({ passed: true, network: 'all music providers offline; local catalog fixtures', viewports: [375, 1440], realEmptyPipeline: true, cardFiltersHistoryPreserved: true, explicitFilterNavigation: true, retryLock: true, languages: ['pt', 'en', 'es'], staleAccountIsolation: true, errors }, null, 2) + '\n');
  console.log('PASS real empty recommendation pipeline, preserved card/history/filters, explicit recovery navigation, retry lock, later presentation cleanup, PT/EN/ES, 375/1440 and stale account cancellation. Providers offline; no production writes.');
} finally { await browser.close(); await preview.stop(); }
