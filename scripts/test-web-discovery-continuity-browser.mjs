import assert from 'node:assert/strict';
const playwright = await import(process.env.SONIC_PLAYWRIGHT_MODULE || 'playwright');
const [engine = 'chromium', base = 'http://127.0.0.1:8889/', scenario = 'tab', profile = 'desktop'] = process.argv.slice(2);
const appUrl = new URL(base);
assert.ok(['localhost', '127.0.0.1'].includes(appUrl.hostname), 'Run the browser fixtures against a local build');
assert.ok(['tab', 'recovery', 'keyboard'].includes(scenario), 'Choose tab, recovery, or keyboard');
const browser = await playwright[engine].launch({ headless: true });
const device = profile === 'mobile' ? playwright.devices[engine === 'webkit' ? 'iPhone 13' : 'Pixel 7'] : { viewport: { width: 1440, height: 960 } };
const context = await browser.newContext({ ...device, locale: 'pt-BR', reducedMotion: 'reduce' });
const page = await context.newPage();
page.setDefaultTimeout(15000);
const result = { engine, profile, scenario };
const click = (selector) => profile === 'mobile'
  ? page.locator(selector).tap({ noWaitAfter: true })
  : page.locator(selector).click({ noWaitAfter: true });
const press = selector => page.locator(selector).press('Enter');
const wait = (predicate, argument, timeout = 15000) =>
  page.waitForFunction(predicate, argument, { timeout, polling: 80 });
const source = process.env.SONIC_BROWSER_APP_SOURCE;
await page.route('**/*', route => {
  const request = route.request();
  const url = new URL(request.url());
  if (url.hostname === 'fonts.googleapis.com' || url.hostname === 'fonts.gstatic.com') return route.abort();
  if (url.origin !== appUrl.origin) return route.continue();
  if (source && url.pathname === '/app.min.js') {
    return route.fulfill({ path: source, contentType: 'text/javascript' });
  }
  if (['/api/soundcloud-search', '/api/track-metadata'].includes(url.pathname)) {
    return route.fulfill({ status: 503, json: { ok: false, tracks: [] } });
  }
  if (url.pathname.startsWith('/api/')) {
    return route.fulfill({ json: { ok: true, enabled: false, items: [], tracks: [], count: 0 } });
  }
  return route.continue();
});
async function navigateTab(tab) {
  const target = `[data-app-tab-target="${tab}"]`;
  const menu = page.locator('#appMenuBtn');
  if (await menu.isVisible() && await menu.getAttribute('aria-expanded') === 'false') await press('#appMenuBtn');
  await press(target);
  await wait(targetTab => currentActiveAppTabName() === targetTab, tab);
}
async function boot() {
  const response = await page.goto(appUrl.href, { waitUntil: 'commit', timeout: 30000 });
  assert.equal(response.status(), 200);
  await wait(() => typeof runPrimaryRecommendationAction === 'function');
  for (const selector of ['#privacyEssentialBtn', '#languageScreen [data-lang=pt]', '#authGuestBtn', '#usageGuideContinueBtn', '#startBtn', '#tasteCalibrationSkipBtn']) {
    if (await page.locator(selector).isVisible()) await click(selector);
  }
  await page.locator('#topSwipeSurpriseBtn').waitFor({ state: 'visible' });
}
async function checkKeyboardAndFilters() {
  const search = page.locator('#swipeStyleSearch');
  const results = page.locator('#swipeStyleRail [data-swipe-style]');
  const pressedStyle = page.locator('#swipeStyleRail [aria-pressed="true"]');
  await click('#topSwipeSurpriseBtn');
  await waitForSound();
  await press('#discoverFiltersBtn');
  assert.equal(await page.locator('#style').inputValue(), '');
  const compactCount = await results.count();
  await press('#swipeStyleToggle');
  result.availableStyles = await results.count();
  assert.ok(result.availableStyles >= 169 && result.availableStyles > compactCount);
  await page.locator('#swipeStyleToggle').press('Escape');
  assert.ok(await search.evaluate(input => input === document.activeElement));
  assert.equal(await results.count(), compactCount);

  await search.fill('zzyyxx');
  assert.equal(await results.count(), 0);
  await wait(() => /Nenhum subgênero encontrado/.test(document.getElementById('swipeStyleSearchStatus').textContent));
  await search.fill('fúll on níght');
  assert.equal(await results.count(), 1);
  await search.press('ArrowDown');
  assert.equal(await page.evaluate(() => document.activeElement.dataset.swipeStyle), 'full_on_night');
  await search.press('Enter');
  await wait(() => document.activeElement.id === 'topSwipeCard' && currentRecommendation?.style === 'full_on_night');
  await waitForSound();
  await page.reload({ waitUntil: 'commit' });
  await page.locator('#topSwipeSurpriseBtn').waitFor({ state: 'visible' });
  await press('#discoverFiltersBtn');
  assert.equal(await pressedStyle.getAttribute('data-swipe-style'), 'full_on_night');
  await press('#swipeStyleClear');
  assert.equal(await pressedStyle.count(), 0);
  assert.ok(await search.evaluate(input => input === document.activeElement));
  result.keyboard = { accentSearch: true, missingResult: true, focus: true, reload: true, cleared: true };
}
function waitForSound() {
  return wait(() => trackPreviewElementMatchesTrack(currentRecommendation) &&
    !trackPreview.paused && !trackPreview.muted && trackPreview.volume > 0 && trackPreview.currentTime > 0.15);
}
function state() {
  return {
    tab: currentActiveAppTabName(),
    key: recommendationTrackKey(currentRecommendation),
    status: previewStatus.textContent,
    time: Math.round(trackPreview.currentTime * 100),
    ownedSource: Boolean(ownedTrackPreviewSource(currentRecommendation, trackPreview)),
    playing: activePlayback.state === 'playing',
    paused: trackPreview.paused,
    token: recommendationPreviewRenderToken,
    recoveryToken: previewRecoveryToken,
    recoveryBusy: previewRecoveryBusy,
    delayedProbe: Boolean(window.sonicRecoveryTest?.pending),
    probeFinished: Boolean(window.sonicRecoveryTest?.finished),
  };
}
// Hold the real media probe for the next card so the user can change tabs
// before its response. All audio requests still reach their original providers.
async function installSlowAudioProbe() {
  await page.evaluate(() => {
    const originalProbe = pickPlayablePreviewSource;
    const originalHasFastPreview = trackHasVerifiedImmediateAudioPreview;
    const originalRender = renderPreview;
    const test = window.sonicRecoveryTest = { pending: false, finished: false, arm: true };
    renderPreview = (track, options) => {
      if (test.arm) {
        test.arm = false;
        test.track = track;
        prewarmedSwipeTrackKeys.delete(recommendationTrackKey(track));
      }
      return originalRender(track, options);
    };
    trackHasVerifiedImmediateAudioPreview = (track) => track !== test.track && originalHasFastPreview(track);
    pickPlayablePreviewSource = async (audio, candidates, options) => {
      if (test.track === currentRecommendation && !test.pending && !test.finished) {
        test.pending = true;
        await new Promise(resolve => { test.release = resolve; });
        try {
          return await originalProbe(audio, candidates, { ...options, timeoutMs: 5000 });
        } finally {
          test.pending = false;
          test.finished = true;
        }
      }
      return originalProbe(audio, candidates, options);
    };
  });
}
try {
  await boot();
  result.build = await page.evaluate(() => SONIC_APP_BUILD_ID);
  if (scenario === 'keyboard') {
    await checkKeyboardAndFilters();
  } else {
    await press('#discoverFiltersBtn');
    const search = page.locator('#swipeStyleSearch');
    await search.fill('Full-On Night');
    await search.press('Enter');
    await waitForSound();
    assert.equal(await page.evaluate(() => currentRecommendation.style), 'full_on_night');
    result.initial = await page.evaluate(state);
  }
  if (scenario === 'tab') {
    await installSlowAudioProbe();
    if (profile === 'mobile') await click('#topSwipeSurpriseBtn');
    else await press('#topSwipeSurpriseBtn');
    await wait(() => window.sonicRecoveryTest.pending);
    result.before = await page.evaluate(state);
    await navigateTab('news');
    result.left = await page.evaluate(state);
    await page.evaluate(() => window.sonicRecoveryTest.release());
    await wait(() => window.sonicRecoveryTest.finished);
    await page.waitForTimeout(850);
    result.after = await page.evaluate(state);
    assert.equal(result.after.tab, 'news');
    assert.equal(result.after.paused, true, 'An in-flight discovery preview must not start after leaving Discover');
    assert.equal(result.after.time, 0, 'The hidden preview clock must remain stopped');
    assert.notEqual(result.after.status, 'Tocando prévia.');
    await navigateTab('discover');
    await wait(() => ownedTrackPreviewSource(currentRecommendation, trackPreview));
    result.returned = await page.evaluate(state);
    assert.equal(result.returned.key, result.before.key);
    assert.ok(result.returned.paused && !result.returned.playing);
    await page.locator('#trackPreview').evaluate(audio => audio.play());
    await waitForSound();
    result.resumed = await page.evaluate(state);
  } else if (scenario === 'recovery') {
    const failedSource = await page.evaluate(() => ownedTrackPreviewSource(currentRecommendation, trackPreview));
    await page.evaluate(() => {
      const originalRender = renderPreview;
      const firstTrack = currentRecommendation;
      const test = window.sonicRecoveryTest = { pending: false, finished: false };
      renderPreview = async (track, options) => {
        const task = originalRender(track, options);
        if (track === firstTrack && previewRecoveryBusy && !test.pending && !test.finished) {
          test.pending = true;
          try {
            await new Promise(resolve => { test.release = resolve; });
          } finally {
            test.pending = false;
            test.finished = true;
          }
        }
        return task;
      };
    });
    // A real HTMLMediaElement error starts recovery after the player reloads.
    await page.route(url => url.href === failedSource, route => route.fulfill({ status: 404 }));
    await page.evaluate(() => trackPreview.load());
    await wait(() => window.sonicRecoveryTest.pending && previewRecoveryBusy);
    result.before = await page.evaluate(state);
    if (profile === 'mobile') await click('#topSwipePassBtn');
    else await press('#topSwipePassBtn');
    await wait(key => recommendationTrackKey(currentRecommendation) !== key, result.before.key);
    result.swapped = await page.evaluate(state);
    assert.notEqual(result.swapped.recoveryToken, result.before.recoveryToken);
    await page.evaluate(() => window.sonicRecoveryTest.release());
    await wait(() => window.sonicRecoveryTest.finished);
    await page.waitForTimeout(700);
    result.after = await page.evaluate(state);
    assert.equal(result.after.recoveryBusy, false, 'Passing a track must release its canceled preview recovery');
    await waitForSound();
    const nextSource = await page.evaluate(() => ownedTrackPreviewSource(currentRecommendation, trackPreview));
    await page.route(url => url.href === nextSource, route => route.fulfill({ status: 404 }));
    await page.evaluate(() => trackPreview.load());
    await wait(token => previewRecoveryToken > token, result.after.recoveryToken);
    result.secondRecovery = await page.evaluate(state);
  }
} catch (error) {
  result.error = `${error.name}: ${error.message}`.split('\n').slice(0, 3).join('\n');
  result.last = await page.evaluate(state).catch(() => null);
  process.exitCode = 1;
} finally {
  console.log(JSON.stringify(result));
  await browser.close();
}
