import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { startTestPreviewServer } from './test-preview-server.mjs';
const { chromium } = await import(process.env.SONIC_PLAYWRIGHT_MODULE || 'playwright');
const app = await fs.readFile(new URL('../app.js', import.meta.url), 'utf8');
const css = await fs.readFile(new URL('../styles.css', import.meta.url), 'utf8');
const preview = await startTestPreviewServer();
const browser = await chromium.launch({ headless: true, executablePath: process.env.SONIC_CHROMIUM_EXECUTABLE || '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome' });
const output = fileURLToPath(new URL('../.vercel/style-selection-coverage/', import.meta.url));
await fs.mkdir(output, { recursive: true });
const holds = new Map(), seen = new Set(), requests = [];
async function waitForRequest(style) {
  const deadline = Date.now() + 10000;
  while (!seen.has(style)) {
    if (Date.now() > deadline) throw new Error(`Selected style request did not start: ${style}`);
    await new Promise(resolve => setTimeout(resolve, 20));
  }
}
for (const style of ['full_on_night', 'freeform']) { const hold = {}; hold.promise = new Promise(resolve => { hold.release = resolve; }); holds.set(style, hold); }
try {
  const page = await browser.newPage({ viewport: { width: 375, height: 812 }, reducedMotion: 'reduce' });
  page.setDefaultTimeout(10000);
  const errors = []; page.on('pageerror', error => errors.push(error.message));
  await page.route('**/*', async route => {
    const url = new URL(route.request().url());
    if (url.origin !== preview.baseUrl) return route.abort();
    if (url.pathname.startsWith('/api/')) return route.fulfill({ json: { ok: true, enabled: false, tracks: [], items: [], count: 0 } });
    if (url.pathname === '/app.min.js') return route.fulfill({ contentType: 'application/javascript', body: app });
    if (url.pathname === '/styles.min.css') return route.fulfill({ contentType: 'text/css', body: css });
    const style = url.pathname.match(/\/runtime-catalog-v1\/styles\/([^/]+)\.json$/)?.[1];
    if (style) {
      requests.push(style); seen.add(style);
      if (holds.has(style)) await holds.get(style).promise;
      if (['full_on_morning', 'freeform'].includes(style)) return route.fulfill({ json: [] });
      if (style === 'slambient') return route.fulfill({ status: 503, json: { error: 'fixture_unavailable' } });
    }
    return route.continue();
  });
  await page.addInitScript(() => localStorage.setItem('sonic_search:privacy:analytics:v1', 'no'));
  await page.goto(`${preview.baseUrl}/?qa=1&lang=pt&recommendation=0`, { waitUntil: 'domcontentloaded' });
  await page.waitForFunction(() => typeof styleSelectionCoverageSnapshot === 'function');
  await page.locator('#discoverFiltersBtn').click();
  await page.locator('#precisionFiltersSummary').click();
  const style = page.locator('#style'), hint = page.locator('#styleSelectionCoverageHint');
  const historyBefore = await page.evaluate(() => {
    seenTrackKeysMemory.add('coverage-history-fixture::already-heard');
    knownArtistsMemory.add('coverage history fixture artist');
    return JSON.stringify({ seen: [...seenTrackKeysMemory], known: [...knownArtistsMemory], liked: likedTrackHistory, disliked: dislikedTrackHistory });
  });
  await style.selectOption('full_on_night');
  await waitForRequest('full_on_night');
  assert.deepEqual(await page.evaluate(() => styleSelectionCoverageSnapshot('full_on_night')), { status: 'unloaded' });
  assert.equal(await hint.isVisible(), false, 'A partial core or pending shard is not zero reviewed coverage');
  assert.equal(await hint.textContent(), '');
  await style.focus(); holds.get('full_on_night').release();
  await hint.waitFor({ state: 'visible' });
  const fullNight = await page.evaluate(() => styleSelectionCoverageSnapshot('full_on_night'));
  assert.deepEqual(fullNight, { status: 'loaded', artists: 1 }, 'The actual Full-on Night shard has one distinct strictly confirmed eligible artist credit');
  assert.ok((await hint.innerText()).includes('Seleção curta: 1 artista'));
  assert.equal(await style.inputValue(), 'full_on_night');
  assert.equal(await page.evaluate(() => document.activeElement === document.getElementById('style')), true, 'An asynchronous count update preserves keyboard focus');
  assert.ok((await style.getAttribute('aria-describedby')).split(/\s+/).includes('styleSelectionCoverageHint'));
  assert.equal(await hint.getAttribute('role'), 'status');
  console.log('CHECK cold Full-on Night shard pending/loaded with one confirmed artist');
  await style.selectOption('big_beat');
  await page.waitForFunction(() => styleSelectionCoverageSnapshot('big_beat').status === 'loaded');
  const bigBeat = await page.evaluate(() => styleSelectionCoverageSnapshot('big_beat'));
  assert.equal(bigBeat.artists, 6, 'The actual reviewed Big Beat recordings contribute six distinct confirmed eligible artists');
  assert.equal(await hint.isVisible(), false, 'Six confirmed artists do not receive the short-selection warning');
  console.log('CHECK actual Big Beat six confirmed artists, no short warning');
  await page.evaluate(() => { for (let i = catalog.length - 1; i >= 0; i--) if (catalog[i].style === 'full_on_morning') catalog.splice(i, 1); rebuildCatalogStyleIndex(); });
  await style.selectOption('full_on_morning');
  await hint.waitFor({ state: 'visible' });
  assert.deepEqual(await page.evaluate(() => styleSelectionCoverageSnapshot('full_on_morning')), { status: 'loaded', artists: 0 });
  assert.ok((await hint.innerText()).includes('Outras opções podem existir no catálogo'), 'A completed empty fixture does not claim the whole catalog is empty');
  await style.selectOption('slambient');
  await waitForRequest('slambient');
  await page.waitForFunction(() => !externalDatasetStylePromises.has('slambient'));
  assert.equal(await hint.isVisible(), false, 'A failed shard cannot become a misleading zero classification count');
  assert.equal(await page.evaluate(() => styleSelectionCoverageSnapshot('slambient').status), 'unloaded');
  await style.selectOption('freeform');
  await waitForRequest('freeform');
  await style.selectOption('big_beat'); holds.get('freeform').release();
  await page.waitForFunction(() => externalDatasetImportedStyles.has('freeform'));
  assert.equal(await style.inputValue(), 'big_beat');
  assert.equal(await hint.isVisible(), false, 'An older style response cannot overwrite the newly selected style with its empty/short warning');
  await style.selectOption('full_on_night'); await hint.waitFor({ state: 'visible' });
  await page.locator('#styleInfoCloseBtn').click();
  assert.equal(await hint.isVisible(), true, 'Coverage is persistent field help, not a dismissible tooltip');
  for (const [language, phrase] of [['en', 'Short selection: 1 artist'], ['es', 'Selección corta: 1 artista'], ['pt', 'Seleção curta: 1 artista']]) {
    await page.evaluate(language => setLanguage(language, { persist: false }), language);
    assert.ok((await hint.innerText()).includes(phrase), 'The hint stays localized even with the genre information bubble closed');
  }
  for (const width of [375, 1440]) {
    await page.setViewportSize({ width, height: width === 375 ? 812 : 1000 });
    const field = style.locator('..'); await field.scrollIntoViewIfNeeded();
    const metrics = await field.evaluate(el => ({ width: el.getBoundingClientRect().width, scroll: el.scrollWidth }));
    assert.ok(metrics.scroll <= Math.ceil(metrics.width) + 1);
    await field.screenshot({ path: `${output}/style-selection-${width}.png` });
  }
  assert.equal(await page.evaluate(() => JSON.stringify({ seen: [...seenTrackKeysMemory], known: [...knownArtistsMemory], liked: likedTrackHistory, disliked: dislikedTrackHistory })), historyBefore, 'Inspecting style breadth does not reset or modify listening history');
  await page.evaluate(() => { window.savedCoverageRuntime = window.SonicCatalogRuntime; window.SonicCatalogRuntime = undefined; renderStyleSelectionCoverage(styleEl.value); });
  assert.equal(await hint.isVisible(), false, 'A missing runtime loader cannot turn an ambiguous legacy completion flag into reviewed coverage');
  assert.equal(await page.evaluate(() => styleSelectionCoverageSnapshot(styleEl.value).status), 'unloaded');
  await page.evaluate(() => { window.SonicCatalogRuntime = savedCoverageRuntime; renderStyleSelectionCoverage(styleEl.value); });
  assert.equal(requests.filter(style => style === 'full_on_night').length, 1, 'Input/change and language updates share one existing shard request');
  assert.deepEqual(errors, []);
  await fs.writeFile(`${output}/report.json`, JSON.stringify({ passed: true, network: 'providers and optional APIs offline; actual local runtime shards plus bounded empty/error fixtures', fullNight, bigBeat, threshold: '<6 distinct artists with confirmed and eligible recordings', viewports: [375, 1440], languages: ['pt', 'en', 'es'], lateStyleIsolation: true, unhydratedNeverZero: true, noAudioAvailabilityClaim: true, requests, errors }, null, 2) + '\n');
  console.log('PASS actual cold Full-on Night1/Big Beat6, post-hydration update, no premature/error zero, empty recut, late style cancellation, keyboard help, PT/EN/ES,375/1440 and unchanged history. Providers offline.');
} finally { for (const hold of holds.values()) hold.release(); await browser.close(); await preview.stop(); }
