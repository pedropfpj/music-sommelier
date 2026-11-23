import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import { startTestPreviewServer } from './test-preview-server.mjs';

// This deliberately withholds media responses, then serves a generated WAV.
// It verifies recovery mechanics, not catalog coverage or real music playback.
const pw = await import(process.env.SONIC_PLAYWRIGHT_MODULE || 'playwright');
const [engine = 'chromium', viewport = 'mobile'] = process.argv.slice(2);
assert.ok(['chromium', 'webkit'].includes(engine));
assert.ok(['mobile', 'desktop'].includes(viewport));
const app = await fs.readFile(process.env.SONIC_PREVIEW_START_SOURCE || process.env.SONIC_PREVIEW_RECOVERY_SOURCE || new URL('../app.min.js', import.meta.url), 'utf8');
const css = await fs.readFile(new URL('../styles.min.css', import.meta.url), 'utf8');
const discoveryCss = await fs.readFile(new URL('../discovery-experience.css', import.meta.url), 'utf8');
const output = new URL(`../.vercel/preview-start-recovery/${engine}-${viewport}/`, import.meta.url);
await fs.mkdir(output, { recursive: true });
const rate = 24000, samples = rate * 8;
const wav = Buffer.alloc(44 + samples * 2);
wav.write('RIFF'); wav.writeUInt32LE(wav.length - 8, 4); wav.write('WAVEfmt ', 8);
wav.writeUInt32LE(16, 16); wav.writeUInt16LE(1, 20); wav.writeUInt16LE(1, 22);
wav.writeUInt32LE(rate, 24); wav.writeUInt32LE(rate * 2, 28); wav.writeUInt16LE(2, 32);
wav.writeUInt16LE(16, 34); wav.write('data', 36); wav.writeUInt32LE(samples * 2, 40);
for (let i = 0; i < samples; i++) wav.writeInt16LE(Math.round(Math.sin(i * Math.PI * 2 * 330 / rate) * 1800), 44 + i * 2);
const preview = await startTestPreviewServer();
const browser = await pw[engine].launch();
const profile = viewport === 'mobile' ? pw.devices[engine === 'webkit' ? 'iPhone 13' : 'Pixel 7'] : { viewport: { width: 1440, height: 960 } };
const report = { engine, viewport, fixture: 'generated WAV; actual media play() and response timing', scenarios: [] };

function snapshot() {
  return {
    key: recommendationTrackKey(currentRecommendation),
    source: trackPreview.getAttribute('src'),
    style: styleEl.value, bpm: bpmEl.value,
    likes: likedTrackHistory, dislikes: dislikedTrackHistory,
    taste: [...trackPreferenceSignals],
    skipped: userStats.skipped, training: userStats.swipeTrainingSignals
  };
}

async function fixture() {
  let ready = false, closed = false, mediaRequests = 0;
  const held = [];
  const context = await browser.newContext({ ...profile, locale: 'pt-BR', reducedMotion: 'reduce', serviceWorkers: 'block' });
  const page = await context.newPage();
  const errors = [];
  page.on('pageerror', error => errors.push(error.message));
  await page.route('**/*', async route => {
    const url = new URL(route.request().url());
    if (closed) return route.abort().catch(() => {});
    if (url.pathname.includes('/AudioPreview')) {
      mediaRequests++;
      if (!ready) await new Promise(resolve => held.push(resolve));
      return route.fulfill({ body: wav, contentType: 'audio/wav', headers: { 'Access-Control-Allow-Origin': '*', 'Cache-Control': 'no-store' } }).catch(() => {});
    }
    if (url.origin !== preview.baseUrl) return route.abort();
    if (url.pathname.startsWith('/api/')) return route.fulfill({ json: { ok: true, enabled: false, items: [], tracks: [], count: 0 } });
    if (url.pathname === '/app.min.js') return route.fulfill({ contentType: 'text/javascript', body: app });
    if (url.pathname === '/styles.min.css') return route.fulfill({ contentType: 'text/css', body: css });
    if (url.pathname === '/discovery-experience.css') return route.fulfill({ contentType: 'text/css', body: discoveryCss });
    return route.continue();
  });
  await page.addInitScript(() => localStorage.setItem('sonic_search:privacy:analytics:v1', 'no'));
  await page.goto(`${preview.baseUrl}/?qa=1&lang=pt&recommendation=0`, { waitUntil: 'domcontentloaded' });
  await page.waitForFunction(() => typeof runPrimaryRecommendationAction === 'function');
  for (const selector of ['#privacyEssentialBtn', '#languageScreen [data-lang="pt"]', '#authGuestBtn', '#usageGuideContinueBtn', '#tasteCalibrationSkipBtn']) {
    if (await page.locator(selector).isVisible()) await page.locator(selector).click();
  }
  await page.locator('#topSwipeSurpriseBtn').waitFor({ state: 'visible' });
  await page.evaluate(async () => {
    await hydrateExternalDatasetPackInBackground({ style: 'full_on_night' });
    window.previewStartFixtures = catalog.filter(track => track.style === 'full_on_night' && previewCandidatesForTrack(track).some(url => url.includes('/AudioPreview')) && trackMatchesBpmPreference(track, '145-155')).slice(0, 2);
    if (previewStartFixtures.length !== 2) throw new Error('Expected two actual reviewed catalog recordings');
    styleEl.value = 'full_on_night'; bpmEl.value = '145-155';
    contextEl.value = ''; energyEl.value = ''; vocalsEl.value = '';
    const track = previewStartFixtures[0];
    setActiveAppTab('discover');
    restoreRecommendationSurfaceSnapshot({ track, prefs: prefsFromManualControls(), discovery: null }, { restartPreview: false });
    prewarmedSwipeTrackKeys.add(recommendationTrackKey(track));
    await renderPreview(track, { fast: true, autoplay: false });
  });
  return {
    page, errors,
    mediaRequests: () => mediaRequests,
    allowNewMedia() { ready = true; },
    releaseOldMedia() { for (const release of held.splice(0)) release(); },
    async close() { closed = true; ready = true; for (const release of held.splice(0)) release(); await context.close(); }
  };
}

try {
  {
    const f = await fixture(), { page } = f;
    try {
      const before = await page.evaluate(snapshot);
      // Dispatch the app's existing direct-play handler; media.play itself is real.
      await page.evaluate(() => document.getElementById('previewPlayBtn').click());
      await page.waitForFunction(() => document.getElementById('previewPlayBtn').dataset.playbackState === 'loading');
      try {
        await page.waitForFunction(() => document.getElementById('previewPlayBtn').dataset.playbackState === 'retry', undefined, { timeout: 11500 });
      } catch {
        const stuck = await page.evaluate(() => ({ state: previewPlayBtn.dataset.playbackState, disabled: previewPlayBtn.disabled, status: previewStatus.textContent, time: trackPreview.currentTime, ready: trackPreview.readyState }));
        throw new Error(`Pending media did not expose recovery: ${JSON.stringify(stuck)}`);
      }
      assert.ok(f.mediaRequests() > 0, 'The actual media request was withheld');
      assert.equal(await page.locator('#previewPlayBtn').isVisible(), true, 'Retry must be visible with direct audio');
      assert.equal(await page.locator('#previewPlayBtn').isEnabled(), true);
      assert.match(await page.locator('#previewStatus').innerText(), /demorou.*Tente novamente/);
      assert.deepEqual(await page.evaluate(snapshot), before, 'Timeout preserves recording, filters and musical feedback');
      for (const [language, label, message] of [
        ['en', 'Try again', /preview took too long/],
        ['es', 'Intentar de nuevo', /vista previa tardó/],
        ['pt', 'Tentar novamente', /prévia demorou/]
      ]) {
        await page.evaluate(language => setLanguage(language, { persist: false }), language);
        assert.equal(await page.locator('#previewPlayBtn').innerText(), label);
        assert.match(await page.locator('#previewStatus').innerText(), message);
        assert.equal(await page.locator('#previewPlayBtn').isEnabled(), true);
      }
      // Chromium supplies the visual proof. WebKit's blocked-font readiness
      // may prevent element screenshots while responses are deliberately held.
      for (const width of engine === 'chromium' ? (viewport === 'mobile' ? [390, 1440] : [1440]) : []) {
        await page.setViewportSize({ width, height: width < 600 ? 844 : 960 });
        await page.locator('#previewPanel').scrollIntoViewIfNeeded();
        await page.locator('#previewPanel').screenshot({ path: new URL(`timeout-${width}.png`, output).pathname });
      }
      f.allowNewMedia();
      await page.locator('#previewPlayBtn').click();
      await page.waitForFunction(() => !trackPreview.paused && trackPreview.currentTime > 0.2, undefined, { timeout: 8000 });
      assert.deepEqual(await page.evaluate(snapshot), before, 'Explicit retry plays the same source without musical feedback');
      f.releaseOldMedia();
      await page.waitForTimeout(450);
      assert.equal(await page.evaluate(() => !trackPreview.paused && trackPreview.currentTime > 0.3), true, 'A late response cannot interrupt the newer attempt');
      assert.deepEqual(f.errors, []);
      report.scenarios.push('pending media -> timeout -> visible retry -> same recording plays; late response harmless');
    } finally { await f.close(); }
  }
  {
    const f = await fixture(), { page } = f;
    try {
      const before = await page.evaluate(snapshot);
      await page.evaluate(() => { prepareExplicitPreviewAudio(); void trackPreview.play().catch(() => {}); });
      await page.waitForFunction(() => document.getElementById('previewPlayBtn').dataset.playbackState === 'loading');
      await page.waitForFunction(() => document.getElementById('previewPlayBtn').dataset.playbackState === 'retry', undefined, { timeout: 11500 });
      assert.equal(await page.locator('#previewPlayBtn').isVisible(), true, 'Native play receives the same visible timeout recovery');
      assert.equal(await page.locator('#previewPlayBtn').isEnabled(), true);
      assert.deepEqual(await page.evaluate(snapshot), before, 'Native start timeout also preserves the source and musical feedback');
      report.scenarios.push('native play without app start wrapper -> same timeout and visible retry');
      await page.evaluate(() => { void trackPreview.play().catch(() => {}); });
      await page.waitForFunction(() => document.getElementById('previewPlayBtn').dataset.playbackState === 'loading');
      await page.evaluate(() => setActiveAppTab('news'));
      f.allowNewMedia(); f.releaseOldMedia();
      await page.waitForTimeout(8500);
      assert.equal(await page.evaluate(() => trackPreview.paused && activePlayback.type === 'none'), true, 'Leaving the tab cancels native play and its deadline');
      assert.equal(await page.evaluate(() => document.getElementById('previewPlayBtn').dataset.playbackState === 'retry'), false, 'An old deadline cannot revive recovery after navigation');
      assert.deepEqual(f.errors, []);
      report.scenarios.push('native play with pending media -> leave tab -> late media/deadline cannot restart audio');
    } finally { await f.close(); }
  }
  {
    const f = await fixture(), { page } = f;
    try {
      await page.evaluate(() => document.getElementById('previewPlayBtn').click());
      await page.waitForFunction(() => document.getElementById('previewPlayBtn').dataset.playbackState === 'loading');
      f.allowNewMedia();
      const newer = await page.evaluate(async () => {
        const track = previewStartFixtures[1];
        restoreRecommendationSurfaceSnapshot({ track, prefs: prefsFromManualControls(), discovery: null }, { restartPreview: false });
        prewarmedSwipeTrackKeys.add(recommendationTrackKey(track));
        await renderPreview(track, { fast: true, autoplay: false });
        return recommendationTrackKey(track);
      });
      await page.evaluate(() => document.getElementById('previewPlayBtn').click());
      await page.waitForFunction(() => !trackPreview.paused && trackPreview.currentTime > 0.2, undefined, { timeout: 8000 });
      f.releaseOldMedia();
      await page.waitForTimeout(8500);
      assert.equal(await page.evaluate(() => recommendationTrackKey(currentRecommendation)), newer);
      assert.equal(await page.evaluate(() => trackPreviewElementMatchesTrack(currentRecommendation)), true);
      assert.notEqual(await page.locator('#previewPlayBtn').getAttribute('data-playback-state'), 'retry');
      assert.deepEqual(f.errors, []);
      report.scenarios.push('new recording during pending start -> old response/deadline cannot overwrite newer card');
    } finally { await f.close(); }
  }
  await fs.writeFile(new URL('results.json', output), JSON.stringify(report, null, 2));
  console.log(JSON.stringify(report));
} finally {
  await browser.close();
  await preview.stop();
}
