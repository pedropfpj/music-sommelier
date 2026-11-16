import assert from 'node:assert/strict';
import { startTestPreviewServer } from './test-preview-server.mjs';

const playwright = await import(process.env.SONIC_PLAYWRIGHT_MODULE || 'playwright');
const [engine = 'chromium', viewport = 'mobile'] = process.argv.slice(2);
assert.ok(['chromium', 'webkit'].includes(engine));
assert.ok(['mobile', 'desktop'].includes(viewport));
const preview = await startTestPreviewServer({ envName: 'SONIC_CONTINUITY_URL' });
const browser = await playwright[engine].launch();
const freshDevice = viewport === 'mobile' ? playwright.devices[engine === 'webkit' ? 'iPhone 13' : 'Pixel 7'] : { viewport: { width: 1440, height: 960 } };
const reviewed = 'a30b908f-7893-75ba-06ea-257cfa6a9442';
const earlier = '356a93a8-758f-4ca9-c240-eff62d87773e';
const appOrigin = new URL(preview.baseUrl).origin;
const syncOrigin = 'https://sonic-continuity.test';
const title = /Alma do Meu Pai/i;
const expected = { reload: reviewed, secondDevice: reviewed, shared: reviewed };
const report = { engine, viewport };

function recordingIsReady() {
  const media = document.getElementById('trackPreview');
  return /alma do meu pai/i.test(currentRecommendation?.song || '') &&
    media?.currentSrc && media.readyState >= 2 && trackPreviewElementMatchesTrack(currentRecommendation);
}

function heardRecording() {
  const media = document.getElementById('trackPreview');
  return !media.paused && media.currentTime > 0.18 && media.played.length > 0 && !media.muted && media.volume > 0;
}

async function newDevice(cloud = { likes: [], track_feedback: [] }, { delayReviewed = false } = {}) {
  const context = await browser.newContext({ ...freshDevice, locale: 'pt-BR', reducedMotion: 'reduce' });
  const page = await context.newPage();
  await page.route('**/*', async route => {
    const request = route.request();
    const url = new URL(request.url());
    if (url.origin === syncOrigin) {
      const table = url.pathname.split('/').at(-1);
      if (request.method() === 'POST' && cloud[table]) {
        for (const row of request.postDataJSON()) {
          const found = cloud[table].findIndex(item => item.target_key === row.target_key);
          if (found < 0) cloud[table].push(row);
          else cloud[table][found] = row;
        }
        return route.fulfill({ status: 201, json: [] });
      }
      return route.fulfill({ json: cloud[table] || [] });
    }
    if (url.origin === appOrigin && url.pathname === '/api/social-config') {
      return route.fulfill({ json: { enabled: true, supabaseUrl: syncOrigin, supabaseAnonKey: 'fixture' } });
    }
    if (url.origin === appOrigin && url.pathname.startsWith('/api/')) {
      return route.fulfill({ json: { ok: true, enabled: false, items: [], tracks: [], count: 0 } });
    }
    if (delayReviewed && url.origin === appOrigin && url.pathname === '/data/batida-reviewed-recordings.json') {
      // Slower than the discovery-only fetch budget, but inside the explicit
      // shared-link budget. Keep using the actual published proof and media.
      await new Promise(resolve => setTimeout(resolve, 2500));
    }
    return ['GET', 'HEAD', 'OPTIONS'].includes(request.method()) ? route.continue() : route.abort();
  });
  await page.addInitScript(() => {
    localStorage.setItem('sonic_search:privacy:analytics:v1', 'no');
    Object.defineProperty(navigator, 'clipboard', { configurable: true, value: undefined });
  });
  return { context, page };
}

async function enter(page, url = `${preview.baseUrl}/?qa=1&lang=pt&recommendation=0`) {
  await page.goto(url, { waitUntil: 'domcontentloaded' });
  await page.waitForFunction(() => typeof runPrimaryRecommendationAction === 'function');
  for (const selector of ['#privacyEssentialBtn', '#languageScreen [data-lang="pt"]', '#authGuestBtn', '#usageGuideContinueBtn', '#tasteCalibrationSkipBtn']) {
    if (await page.locator(selector).isVisible()) await page.locator(selector).click();
  }
  await page.locator('#topSwipeSurpriseBtn').waitFor({ state: 'visible' });
}

async function connectFixture(page) {
  await page.evaluate(origin => {
    socialState.ready = true;
    socialState.enabled = true;
    socialState.config = { supabaseUrl: origin, supabaseAnonKey: 'fixture' };
    const user = { id: '11111111-1111-4111-8111-111111111111', email: 'listener@example.test', app_metadata: { provider: 'google' } };
    socialStoreSession({ access_token: 'fixture', expires_at: Math.floor(Date.now() / 1000) + 3600, user });
    const account = onlineSocialUserSession();
    activateUserSession(account);
    persistUserSession(account);
    const url = new URL(location.href);
    for (const key of ['qa', 'screenshot', 'recommendation']) url.searchParams.delete(key);
    history.replaceState(history.state, '', url);
    updateStats();
    renderSocialUi({ preserveStatus: true });
  }, syncOrigin);
}

async function presentReviewedCatalogTrack(page) {
  // Pin only the starting recommendation so the test does not depend on random
  // Batida ranking; the row, player, like, sync, reload and share are the real app.
  await page.evaluate(async id => {
    await hydrateExternalDatasetPackInBackground({ style: 'batida' });
    const track = catalog.find(candidate => trackAppleRecordingId(candidate) === id);
    if (!track) throw new Error('Expected reviewed DJ Firmeza catalog row');
    setActiveAppTab('discover');
    restoreRecommendationSurfaceSnapshot({ track, prefs: { style: 'batida' }, discovery: null }, { restartPreview: false });
    await renderPreview(track, { fast: true, autoplay: false });
  }, '1348713422');
  await page.waitForFunction(recordingIsReady, undefined, { timeout: 15000 });
}

function libraryItem(page) {
  return page.locator('.liked-track-item').filter({ hasText: title });
}

async function openLibrary(page, { warmCore = false } = {}) {
  if (warmCore) {
    // Model a fresh device on which idle core loading has finished and the user
    // has never opened Batida. The competing edition is already in memory.
    await page.evaluate(() => hydrateExternalDatasetPackInBackground());
  }
  const entry = page.locator('#topSwipeSurpriseBtn, #tasteCalibrationSkipBtn').filter({ visible: true }).first();
  await entry.waitFor({ state: 'visible', timeout: 15000 });
  if (await page.locator('#tasteCalibrationSkipBtn').isVisible()) await page.locator('#tasteCalibrationSkipBtn').click();
  const menu = page.locator('#appMenuBtn');
  if (await menu.isVisible() && await menu.getAttribute('aria-expanded') !== 'true') await menu.click();
  await page.locator('[data-app-tab-target="profile"]').click();
  await libraryItem(page).waitFor({ state: 'visible', timeout: 15000 });
}

async function identifyPlayback(page, { auto = true } = {}) {
  try {
    await page.waitForFunction(recordingIsReady, undefined, { timeout: 15000 });
  } catch {
    const state = await page.evaluate(() => ({
      title: currentRecommendation?.song,
      status: document.querySelector('#previewStatus')?.textContent,
      share: document.querySelector('#sharedTrackStatus:not([hidden])')?.textContent,
      hasSource: Boolean(trackPreview.currentSrc),
      ready: trackPreview.readyState
    }));
    throw new Error(`The expected recording did not load: ${JSON.stringify(state)}`);
  }
  if (!auto) assert.equal(await page.locator('#trackPreview').evaluate(media => media.currentTime), 0, 'Opening a link must not start audio');
  if (!await page.evaluate(heardRecording)) {
    const play = page.locator('#previewPlayBtn');
    if (await play.isVisible() && await page.locator('#trackPreview').evaluate(media => media.paused)) {
      await play.click();
    } else if (await page.locator('#trackPreview').evaluate(media => media.paused)) {
      const audio = page.locator('#trackPreview');
      // With direct audio the Web app presents the browser's built-in controls.
      // The leading play button is inside its closed user-agent shadow tree.
      const { width, height } = await audio.boundingBox();
      for (const x of [19, Math.max(19, Math.round((width - 300) / 2) + 19), Math.round(width / 2)]) {
        if (!await audio.evaluate(media => media.paused)) break;
        await audio.click({ position: { x, y: Math.round(height / 2) } });
      }
      if (await audio.evaluate(media => media.paused)) await audio.press('Space');
    }
  }
  try {
    await page.waitForFunction(heardRecording, undefined, { timeout: 8000 });
  } catch {
    const state = await page.evaluate(() => ({
      title: currentRecommendation?.song,
      paused: trackPreview.paused,
      muted: trackPreview.muted,
      seconds: trackPreview.currentTime,
      ready: trackPreview.readyState,
      status: document.querySelector('#previewStatus')?.textContent,
      playButton: document.querySelector('#previewPlayBtn')?.dataset.playbackState
    }));
    throw new Error(`The direct audio did not advance: ${JSON.stringify(state)}`);
  }
  return (await page.locator('#trackPreview').evaluate(media => media.currentSrc)).match(/\b[0-9a-f]{8}(?:-[0-9a-f]{4}){3}-[0-9a-f]{12}\b/i)?.[0];
}

try {
  const cloud = { likes: [], track_feedback: [] };
  const original = await newDevice(cloud);
  const p = original.page;
  await enter(p);
  report.build = await p.evaluate(() => SONIC_APP_BUILD_ID);
  await connectFixture(p);
  await presentReviewedCatalogTrack(p);
  report.discovery = await identifyPlayback(p, { auto: false });
  await p.locator('#shareTrackBtn').click();
  const share = await p.locator('#shareLinkText').inputValue();
  assert.ok(new URL(share).searchParams.has('track'));
  report.shareRecording = new URL(share).searchParams.get('recording') || null;
  await p.locator('#shareLinkClose').click();
  await p.locator('#topSwipeLikeBtn').click();
  await openLibrary(p);
  await p.waitForFunction(() => document.querySelector('#librarySyncStatus')?.dataset.state === 'synced', undefined, { timeout: 15000 });
  const likes = cloud.likes.filter(row => title.test(row.song));
  assert.equal(likes.length, 1, 'A real like click must reach the simulated cloud');
  report.cloudRecording = likes[0].metadata.recordingId || null;

  await p.reload({ waitUntil: 'domcontentloaded' });
  await p.waitForFunction(() => Boolean(weeklyRecommendsController));
  await connectFixture(p);
  await openLibrary(p, { warmCore: true });
  await libraryItem(p).locator('.library-play').click();
  report.reload = await identifyPlayback(p);
  await original.context.close();

  const second = await newDevice(cloud);
  await enter(second.page);
  assert.equal(await second.page.evaluate(() => likedTrackHistory.length), 0, 'A second device starts with an empty Library');
  await connectFixture(second.page);
  assert.equal(await second.page.evaluate(() => syncSocialLikedTracks({ activity: false })), true);
  await openLibrary(second.page, { warmCore: true });
  await libraryItem(second.page).locator('.library-play').click();
  report.secondDevice = await identifyPlayback(second.page);
  await second.context.close();

  const linkDevice = await newDevice(undefined, { delayReviewed: !process.env.SONIC_CONTINUITY_BASELINE });
  await enter(linkDevice.page, share);
  await linkDevice.page.locator('#sharedTrackStatus').waitFor({ state: 'visible' });
  try {
    report.shared = await identifyPlayback(linkDevice.page, { auto: false });
  } catch (error) {
    if (!process.env.SONIC_CONTINUITY_BASELINE) throw error;
    report.shared = error.message;
  }
  await linkDevice.context.close();

  if (!process.env.SONIC_CONTINUITY_BASELINE) {
    // Old cloud rows came with a label but no recording ID. An explicit older
    // label is distinct from the Príncipe label saved from the reviewed result.
    for (const [name, label, version] of [['legacyReviewed', 'Príncipe', reviewed], ['legacyEarlier', 'Alma do Meu Pai - EP', earlier]]) {
      const cloudLegacy = structuredClone(cloud);
      for (const row of [...cloudLegacy.likes, ...cloudLegacy.track_feedback]) {
        delete row.metadata.recordingId;
        delete row.metadata.appleMusicUrl;
        row.metadata.label = label;
      }
      const device = await newDevice(cloudLegacy);
      await enter(device.page);
      await connectFixture(device.page);
      assert.equal(await device.page.evaluate(() => syncSocialLikedTracks({ activity: false })), true);
      assert.deepEqual(await device.page.evaluate(() => likedTrackHistory
        .filter(entry => /alma do meu pai/i.test(entry.song)).map(entry => [entry.label, entry.recordingId || ''])), [[label, '']]);
      await openLibrary(device.page, { warmCore: true });
      await libraryItem(device.page).locator('.library-play').click();
      report[name] = await identifyPlayback(device.page);
      expected[name] = version;
      await device.context.close();
    }
  }
  assert.equal(report.discovery, reviewed);
  if (process.env.SONIC_CONTINUITY_BASELINE) {
    assert.equal(report.secondDevice, earlier, 'Expected baseline to reopen the earlier recording on another device');
  } else {
    assert.equal(report.cloudRecording, 'apple_music:1348713422');
    assert.equal(report.shareRecording, 'apple_music:1348713422');
    for (const [path, version] of Object.entries(expected)) assert.equal(report[path], version, path);
  }
} finally {
  console.log(JSON.stringify(report));
  await browser.close();
  await preview.stop();
}
