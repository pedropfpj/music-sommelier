import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import { startTestPreviewServer } from './test-preview-server.mjs';
const pw = await import(process.env.SONIC_PLAYWRIGHT_MODULE || 'playwright');
const [engine = 'chromium'] = process.argv.slice(2);
assert.ok(['chromium', 'webkit'].includes(engine));
const appPath = process.env.SONIC_LIBRARY_APP_SOURCE || new URL('../app.js', import.meta.url);
const [app, css] = await Promise.all([fs.readFile(appPath, 'utf8'), fs.readFile(new URL('../styles.css', import.meta.url), 'utf8')]);
const preview = await startTestPreviewServer();
const browser = await pw[engine].launch();
const context = await browser.newContext({ ...pw.devices[engine === 'webkit' ? 'iPhone 13' : 'Pixel 7'], locale: 'pt-BR', reducedMotion: 'reduce' });
const page = await context.newPage();
const errors = [];
page.on('pageerror', error => errors.push(error.message));
const output = new URL(`../.vercel/library-upgrade/${engine}/`, import.meta.url);
await fs.mkdir(output, { recursive: true });
try {
  await page.route('**/*', route => {
    const url = new URL(route.request().url());
    if (url.origin !== preview.baseUrl) return route.abort();
    if (url.pathname.startsWith('/api/')) return route.fulfill({ json: { ok: true, enabled: false, items: [], tracks: [], count: 0 } });
    if (url.pathname === '/app.min.js') return route.fulfill({ contentType: 'text/javascript', body: app });
    if (url.pathname === '/styles.min.css') return route.fulfill({ contentType: 'text/css', body: css });
    return route.continue();
  });
  await page.addInitScript(() => localStorage.setItem('sonic_search:privacy:analytics:v1', 'no'));
  await page.goto(`${preview.baseUrl}/?qa=1&lang=pt&screenshot=1&recommendation=0&tab=library`, { waitUntil: 'domcontentloaded' });
  await page.waitForFunction(() => typeof renderLikedTrackHistory === 'function');
  for (const selector of ['#privacyEssentialBtn', '#languageScreen [data-lang="pt"]', '#authGuestBtn', '#usageGuideContinueBtn', '#tasteCalibrationSkipBtn']) {
    if (await page.locator(selector).isVisible()) await page.locator(selector).click();
  }
  await page.evaluate(() => {
    likedTrackHistory = [
      likedTrackHistoryEntry({ artist: 'Zélia', song: 'Água', style: 'house', bpm: 124 }, 'liked', '2026-11-01T12:00:00Z'),
      likedTrackHistoryEntry({ artist: 'Outro Artista', song: 'Máquina', style: 'techno', bpm: 132 }, 'liked', '2026-11-02T12:00:00Z')
    ];
    dislikedTrackHistory = [likedTrackHistoryEntry({ artist: 'Terceiro Artista', song: 'Outra Máquina', style: 'techno', bpm: 132 }, 'unheard_pass', '2026-11-03T12:00:00Z')];
    libraryRemovedTrackHistory = []; recommendationRunBusy = false; swipeFeedbackBusy = false; firstRecommendationBusy = false;
    setActiveAppTab('library'); renderLikedTrackHistory(); renderDislikedTrackHistory();
  });
  assert.equal(await page.locator('#libraryPanel').isVisible(), true);
  assert.equal(await page.locator('#summaryPanel .profile-library-section').count(), 0, 'The web library has one home and no duplicated controls');
  assert.equal(await page.locator('#libraryPanel .profile-library-section').count(), 1);
  assert.equal(await page.locator('#appTabBar [data-primary-app-tab]').evaluateAll(buttons => buttons.filter(button => !button.hidden).length), 5);
  assert.equal(await page.locator('#summaryLikedTracksList .liked-track-item').count(), 2);
  assert.equal(await page.locator('[data-library-kind="disliked"]').isVisible(), false);
  await page.locator('#libraryStyle').selectOption('house');
  await page.locator('#librarySearch').fill('agua zelia');
  const row = page.locator('#summaryLikedTracksList .liked-track-item');
  assert.equal(await row.count(), 1);
  assert.match(await row.innerText(), /Água/);
  await row.locator('.liked-track-remove').click();
  await page.locator('#libraryUndoBtn').waitFor({ state: 'visible' });
  assert.equal(await page.locator('#librarySearch').inputValue(), 'agua zelia');
  assert.equal(await page.locator('#libraryStyle').inputValue(), 'house', 'An empty result preserves the explicit style filter');
  await page.locator('#libraryUndoBtn').click();
  assert.equal(await row.count(), 1);
  assert.equal(await page.locator('#libraryUndo').isVisible(), false);
  await page.locator('#libraryFiltersClear').click();
  assert.equal(await page.locator('#librarySearch').inputValue(), '');
  assert.equal(await page.locator('#libraryStyle').inputValue(), '');
  assert.equal(await page.locator('#librarySearch').evaluate(input => input === document.activeElement), true);
  page.once('dialog', dialog => dialog.dismiss());
  await page.locator('#summaryLikedTracksClearBtn').click();
  assert.equal(await row.count(), 2, 'Canceling bulk clear keeps every saved track');
  page.once('dialog', dialog => dialog.accept());
  await page.locator('#summaryLikedTracksClearBtn').click();
  assert.equal(await row.count(), 0);
  await page.locator('#libraryUndoBtn').click();
  assert.equal(await row.count(), 2);
  await page.locator('button[data-library-view="disliked"]').click();
  assert.equal(await page.locator('[data-library-kind="liked"]').isVisible(), false);
  assert.equal(await page.locator('#summaryDislikedTracksList').isVisible(), true);
  assert.equal(await page.locator('#summaryDislikedTracksList .library-dismiss-reason').innerText(), 'Pulou sem ouvir');
  await page.locator('#summaryDislikedTracksList .liked-track-remove').click();
  await page.locator('#libraryUndoBtn').click();
  assert.equal(await page.locator('#summaryDislikedTracksList .liked-track-item').count(), 1);
  assert.equal(await page.evaluate(() => dislikedTrackHistory[0].source), 'unheard_pass');
  for (const [language, label] of [['en', 'Dismissed'], ['es', 'Descartadas'], ['pt', 'Descartadas']]) {
    await page.evaluate(language => setLanguage(language, { persist: false }), language);
    assert.equal(await page.locator('button[data-library-view="disliked"]').innerText(), label);
    assert.equal(await page.locator('button[data-library-view="disliked"]').getAttribute('aria-pressed'), 'true');
  }
  await page.locator('button[data-library-view="liked"]').click();
  await page.evaluate(() => { recommendationRunBusy = true; });
  await row.first().locator('.library-play').click();
  assert.match(await page.locator('#libraryReplayStatus').innerText(), /Aguarde/);
  await page.evaluate(() => { recommendationRunBusy = false; });
  for (const [language, message] of [['en', /Wait a moment/], ['es', /Espera un momento/], ['pt', /Aguarde/]]) {
    await page.evaluate(language => setLanguage(language, { persist: false }), language);
    assert.match(await page.locator('#libraryReplayStatus').innerText(), message);
  }
  await page.evaluate(() => document.activeElement?.blur?.());
  for (const width of [320, 393, 1440]) {
    await page.setViewportSize({ width, height: width < 600 ? 852 : 960 });
    const metrics = await page.locator('.profile-library-section').evaluate(section => ({ width: section.getBoundingClientRect().width, scroll: section.scrollWidth,
      controls: [...section.querySelectorAll('.library-tools input,.library-tools select,.library-views button')].map(control => control.getBoundingClientRect().height) }));
    assert.ok(metrics.scroll <= Math.ceil(metrics.width) + 1 && metrics.controls.every(height => height >= 44), `Library fits and keeps touch targets at ${width}px: ${JSON.stringify(metrics)}`);
    if (engine === 'chromium' && width !== 320) {
      await page.evaluate(() => { document.activeElement?.blur?.(); window.scrollTo({ top: 0, behavior: 'instant' }); });
      if (width < 600) await page.screenshot({ path: new URL(`library-${width}.png`, output).pathname, fullPage: true });
      else await page.locator('#libraryPanel').screenshot({ path: new URL(`library-${width}.png`, output).pathname });
    }
  }
  await page.evaluate(() => {
    window.libraryOriginalNative = isNativeAppRuntime;
    isNativeAppRuntime = () => true;
    setActiveAppTab('library');
  });
  assert.equal(await page.evaluate(() => currentActiveAppTabName()), 'profile');
  assert.equal(await page.locator('#summaryPanel .profile-library-section').count(), 1, 'Native retains the library within Profile');
  await page.evaluate(() => { isNativeAppRuntime = window.libraryOriginalNative; setActiveAppTab('library'); });
  await row.first().locator('.liked-track-remove').click();
  await page.evaluate(() => { activateUserSession({ mode: 'test', username: 'Different Library Session' }); setActiveAppTab('library'); });
  await page.waitForFunction(() => document.getElementById('libraryUndo').hidden);
  assert.equal(await page.evaluate(() => undoLastLibraryRemoval()), false, 'An undo from the old profile cannot affect this session');
  assert.deepEqual(errors, []);
  const report = { engine, passed: true, source: process.env.SONIC_LIBRARY_APP_SOURCE ? 'explicit app source/bundle override; generated local fixtures; all provider writes blocked' : 'current app.js; generated local library fixtures; all provider writes blocked', scenarios: ['dedicated web/native destination', 'combined accented search and style', 'individual and bulk undo', 'bulk cancellation', 'category and language preservation', 'honest busy replay', '320/393/1440 touch layout', 'profile isolation'], errors };
  await fs.writeFile(new URL('results.json', output), JSON.stringify(report, null, 2));
  console.log(JSON.stringify(report));
} finally { await context.close(); await browser.close(); await preview.stop(); }
