// Real browser controls and local profile persistence; synthetic PCM audio and
// offline API fixtures only. No real account, report, provider or analytics call.
import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { startTestPreviewServer } from './test-preview-server.mjs';
const { chromium } = await import(process.env.SONIC_PLAYWRIGHT_MODULE || 'playwright');
const app = await fs.readFile(new URL('../app.js', import.meta.url), 'utf8');
const css = await fs.readFile(new URL('../styles.css', import.meta.url), 'utf8');
const preview = await startTestPreviewServer();
const browser = await chromium.launch({ headless: true, executablePath: process.env.SONIC_CHROMIUM_EXECUTABLE || '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome', args: ['--autoplay-policy=no-user-gesture-required'] });
const output = fileURLToPath(new URL('../.vercel/track-data-review/', import.meta.url));
await fs.mkdir(output, { recursive: true });
const sampleRate = 8000, samples = sampleRate * 20, wav = Buffer.alloc(44 + samples * 2);
wav.write('RIFF'); wav.writeUInt32LE(wav.length - 8, 4); wav.write('WAVEfmt ', 8); wav.writeUInt32LE(16, 16); wav.writeUInt16LE(1, 20); wav.writeUInt16LE(1, 22); wav.writeUInt32LE(sampleRate, 24); wav.writeUInt32LE(sampleRate * 2, 28); wav.writeUInt16LE(2, 32); wav.writeUInt16LE(16, 34); wav.write('data', 36); wav.writeUInt32LE(samples * 2, 40);
for (let i = 0; i < samples; i++) wav.writeInt16LE(Math.round(Math.sin(i * 2 * Math.PI * 220 / sampleRate) * 400), 44 + i * 2);
const results = [];
async function tasteSnapshot(page) {
  return page.evaluate(() => ({
    model: Object.fromEntries(Object.entries(adaptiveModel).map(([key, map]) => [key, [...map].sort()])),
    prefs: [...trackPreferenceSignals].sort(), previewIssues: [...trackPreviewIssueSignals].sort(), reliability: [...previewReliabilityByStyle].sort(),
    rejected: [...rejectedArtists].sort(), liked: likedTrackHistory, disliked: dislikedTrackHistory, removed: libraryRemovedTrackHistory,
    stats: { ...userStats }, spirit: [...spiritSignalsByStyle].sort(), ratings: [...trackRatings].sort(),
    seenTracks: [...seenTrackKeysMemory].sort(), seenArtists: [...seenArtistsMemory].sort(), known: [...knownArtistsMemory].sort(),
    cardTitle: topSwipeTitle.textContent, cardMeta: topSwipeMeta.textContent, key: recommendationTrackKey(currentRecommendation),
    sameObject: currentRecommendation === window.reviewFixtureTrack
  }));
}
async function paintTrack(page) {
  return page.evaluate(base => {
    const track = { id: 'review-recording-a', artist: 'Frankie Knuckles', song: 'Your Love', style: 'house', label: 'Fixture', energy: 'medium', bpm: '120-130', bpmExact: 122, previewUrl: base + '/review-tone.wav', previewChecked: true, previewMissing: false, source: 'local_editorial', duration: 20 };
    window.reviewFixtureTrack = track;
    currentRecommendation = track; lastPrefs = { style: 'house' };
    renderRecommendation(track, lastPrefs);
    setActiveAppTab('discover');
    return { visible: !trackDataReview.hidden, key: trackDataIssueIdentity(track) };
  }, preview.baseUrl);
}
try {
  for (const width of [375, 1440]) {
    const context = await browser.newContext({ viewport: { width, height: 960 }, serviceWorkers: 'block', reducedMotion: 'reduce' });
    const page = await context.newPage(), errors = [], apiCalls = [];
    page.on('pageerror', e => errors.push(e.message));
    await page.route('**/*', route => {
      const url = new URL(route.request().url());
      if (url.origin !== preview.baseUrl) return route.abort();
      if (url.pathname === '/app.min.js') return route.fulfill({ contentType: 'application/javascript', body: app });
      if (url.pathname === '/styles.min.css') return route.fulfill({ contentType: 'text/css', body: css });
      if (url.pathname === '/review-tone.wav') return route.fulfill({ contentType: 'audio/wav', body: wav, headers: { 'Cache-Control': 'no-store' } });
      if (url.pathname.startsWith('/api/')) {
        apiCalls.push({ path: url.pathname, method: route.request().method() });
        return route.fulfill({ json: { ok: true, enabled: false, tracks: [], candidates: [], count: 0 } });
      }
      return route.continue();
    });
    await page.goto(`${preview.baseUrl}/?qa=1&lang=pt&recommendation=0&tab=discover`, { waitUntil: 'domcontentloaded' });
    await page.waitForFunction(() => typeof recordTrackDataIssue === 'function' && !appContent.classList.contains('hidden'));
    const essentials = page.getByRole('button', { name: 'Só essenciais', exact: true });
    if (await essentials.isVisible()) await essentials.click();
    await page.evaluate(() => {
      ephemeralProfileMode = false;
      activateUserSession({ mode: 'login', username: 'Review Fixture A' });
      adaptiveModel.likedStyles.set('house', 2); adaptiveModel.dislikedArtists.set('unrelated artist', 1.7);
      trackPreferenceSignals.set('unrelated recording', .8); previewReliabilityByStyle.set('house', .4);
      rejectedArtists.add('unrelated artist'); userStats.skipped = 3; userStats.swipeTrainingSignals = 2;
      likedTrackHistory = [likedTrackHistoryEntry({ artist: 'Saved Fixture', song: 'Saved recording', style: 'house' }, 'fixture', '2026-11-01T00:00:00Z')];
      dislikedTrackHistory = [likedTrackHistoryEntry({ artist: 'Passed Fixture', song: 'Passed recording', style: 'house' }, 'fixture', '2026-11-01T00:00:00Z')];
      saveProgress();
    });
    assert.equal((await paintTrack(page)).visible, true);
    assert.equal(await page.locator('#trackDataReviewSummary').count(), 1);
    assert.equal(await page.locator('#styleIssueBtn').count(), 1);
    await page.evaluate(async base => {
      if (!commitTrackPreviewSource(currentRecommendation, base + '/review-tone.wav', recommendationPreviewRenderToken)) throw Error('Fixture audio ownership failed');
      trackPreview.loop = true;
      await trackPreview.play();
    }, preview.baseUrl);
    await page.waitForFunction(() => !trackPreview.paused && trackPreview.currentTime > .1 && trackPreview.readyState >= 2);
    const audioBefore = await page.evaluate(() => ({ src: trackPreview.currentSrc, time: trackPreview.currentTime }));
    const before = await tasteSnapshot(page);
    const callCount = apiCalls.length;
    await page.locator('#trackDataReviewSummary').focus();
    await page.keyboard.press('Enter');
    assert.equal(await page.locator('#trackDataReview').getAttribute('open'), '');
    await page.locator('#styleIssueBtn').dblclick();
    assert.equal(await page.locator('#styleIssueBtn').isDisabled(), true);
    const first = await page.evaluate(() => ({ count: trackDataIssueReports.size, quality: [...trackRecommendationIssueSignals] }));
    assert.equal(first.count, 1); assert.equal(first.quality[0][1], 1.6);
    await page.locator('#bpmIssueBtn').click();
    await page.locator('#imageIssueBtn').click();
    await page.locator('#recordingIssueBtn').focus(); await page.keyboard.press('Enter');
    const after = await tasteSnapshot(page);
    assert.deepEqual(after, before, 'Data corrections preserve every taste/history/stat/card field');
    const audioAfter = await page.evaluate(() => ({ src: trackPreview.currentSrc, time: trackPreview.currentTime, paused: trackPreview.paused, ended: trackPreview.ended }));
    assert.equal(audioAfter.src, audioBefore.src); assert.equal(audioAfter.paused, false); assert.equal(audioAfter.ended, false); assert.ok(audioAfter.time >= audioBefore.time);
    assert.match(await page.locator('#trackDataReviewStatus').innerText(), /Salvo para este perfil neste dispositivo/);
    assert.equal(await page.evaluate(() => trackDataIssueReports.size), 4);
    await page.evaluate(() => {
      styleIssueBtn.dispatchEvent(new MouseEvent('click', { bubbles: true }));
      registerTrackFeedback(currentRecommendation, false, { reason: 'style_issue' });
    });
    await page.evaluate(async () => { await swapAfterPreviewFeedback({ reason: 'recording_issue' }); });
    assert.deepEqual(await tasteSnapshot(page), before, 'Legacy issue callers cannot trigger taste training or a swap either');
    assert.equal(await page.evaluate(() => trackDataIssueReports.size), 4);
    assert.ok(Math.abs((await page.evaluate(() => [...trackRecommendationIssueSignals][0][1])) - 5.65) < .001);
    assert.equal(apiCalls.slice(callCount).some(call => call.method !== 'GET'), false, 'Corrections submit no remote report or cloud taste mutation');
    for (const [lang, title, button, receipt] of [
      ['en', 'Review track data', 'Wrong track or version', 'Saved for this profile on this device.'],
      ['es', 'Revisar datos', 'Pista o versión incorrecta', 'Guardado para este perfil en este dispositivo.'],
      ['pt', 'Revisar dados', 'Faixa ou versão errada', 'Salvo para este perfil neste dispositivo.']
    ]) {
      await page.evaluate(lang => { currentLanguage = lang; renderTrackDataReview(); }, lang);
      assert.equal(await page.locator('#trackDataReviewSummary').innerText(), title);
      assert.ok((await page.locator('#recordingIssueBtn').innerText()).includes(button));
      assert.ok((await page.locator('#trackDataReviewStatus').innerText()).includes(receipt));
    }
    const layout = await page.evaluate(() => ({ overflow: document.documentElement.scrollWidth > innerWidth, controls: [...trackDataReview.querySelectorAll('summary,button')].map(el => ({ width: el.getBoundingClientRect().width, height: el.getBoundingClientRect().height })) }));
    assert.equal(layout.overflow, false); assert.ok(layout.controls.every(rect => rect.height >= 44 && rect.width > 100));
    await page.locator('#trackDataReview').screenshot({ path: output + `review-${width}.png` });
    const stored = await page.evaluate(() => localStorage.getItem(storageKeyForSession(PROGRESS_STORAGE_KEY)));
    await page.reload({ waitUntil: 'domcontentloaded' });
    await page.waitForFunction(() => typeof recordTrackDataIssue === 'function' && !appContent.classList.contains('hidden'));
    await page.evaluate(() => { ephemeralProfileMode = false; activateUserSession({ mode: 'login', username: 'Review Fixture A' }); });
    await paintTrack(page);
    assert.equal(await page.evaluate(() => trackDataIssueReports.size), 4, 'Actual reload restores this profile’s corrections');
    assert.equal(await page.locator('#styleIssueBtn').isDisabled(), true);
    const loadedStored = await page.evaluate(() => localStorage.getItem(storageKeyForSession(PROGRESS_STORAGE_KEY)));
    assert.deepEqual(JSON.parse(loadedStored).trackDataIssueReports, JSON.parse(stored).trackDataIssueReports);
    assert.deepEqual(JSON.parse(loadedStored).trackRecommendationIssueSignals, JSON.parse(stored).trackRecommendationIssueSignals);
    await page.evaluate(() => { markCurrentTrackDataIssue('style_issue'); });
    assert.equal(await page.evaluate(() => localStorage.getItem(storageKeyForSession(PROGRESS_STORAGE_KEY))), loadedStored, 'Duplicate after reload does not rewrite or increase the correction');
    await page.evaluate(() => { activateUserSession({ mode: 'login', username: 'Review Fixture B' }); });
    await paintTrack(page);
    assert.equal(await page.evaluate(() => trackDataIssueReports.size), 0);
    assert.equal(await page.locator('#styleIssueBtn').isDisabled(), false, 'Another profile never inherits correction state');
    await page.locator('#trackDataReviewSummary').click(); await page.locator('#styleIssueBtn').click();
    assert.equal(await page.evaluate(() => trackDataIssueReports.size), 1);
    await page.evaluate(() => { activateUserSession({ mode: 'login', username: 'Review Fixture A' }); });
    assert.equal(await page.evaluate(() => trackDataIssueReports.size), 4);
    // Session-only mode and an actual storage exception must never promise disk persistence.
    await page.evaluate(() => { ephemeralProfileMode = true; activateUserSession({ mode: 'visitor', username: 'Fixture Visitor' }); });
    await paintTrack(page);
    await page.locator('#trackDataReviewSummary').click(); await page.locator('#recordingIssueBtn').click();
    assert.match(await page.locator('#trackDataReviewStatus').innerText(), /Marcado nesta sessão/);
    await page.evaluate(() => {
      ephemeralProfileMode = false; activateUserSession({ mode: 'login', username: 'Review Fixture C' });
      window.fixtureOriginalSetItem = Storage.prototype.setItem;
      Storage.prototype.setItem = function(key, value) { if (String(key).includes('neonpulse:progress')) throw new DOMException('Fixture quota', 'QuotaExceededError'); return window.fixtureOriginalSetItem.call(this, key, value); };
    });
    await paintTrack(page); await page.locator('#trackDataReviewSummary').click(); await page.locator('#bpmIssueBtn').click();
    assert.match(await page.locator('#trackDataReviewStatus').innerText(), /Não foi possível salvar/);
    await page.evaluate(() => { Storage.prototype.setItem = window.fixtureOriginalSetItem; });
    const legacy = await page.evaluate(() => {
      const t = { ...currentRecommendation, song: 'Unplayable fixture' };
      registerTrackFeedback(t, false, { reason: 'preview_issue', source: 'preview_issue_button', avoidRepeatArtist: false });
      const preview = { style: adaptiveModel.dislikedStyles.get('house'), artist: adaptiveModel.dislikedArtists.get(normalize(t.artist)), preference: trackPreferenceSignals.get(recommendationTrackKey(t)), issues: trackPreviewIssueSignals.get(recommendationTrackKey(t)), history: dislikedTrackHistory.length };
      const dislike = { ...t, song: 'Explicit dislike fixture' };
      registerTrackFeedback(dislike, false, { reason: 'taste_mismatch', source: 'preview_dislike' });
      return { preview, dislike: { style: adaptiveModel.dislikedStyles.get('house'), preference: trackPreferenceSignals.get(recommendationTrackKey(dislike)), rejected: rejectedArtists.has(artistMatchKey(dislike.artist)), history: dislikedTrackHistory.length }, correctionCount: trackDataIssueReports.size };
    });
    assert.deepEqual(legacy.preview, { style: .18, artist: .38, preference: -.38, issues: 1, history: 1 }, 'Existing no-playback feedback behavior is preserved');
    assert.equal(legacy.dislike.preference, -1.02); assert.ok(legacy.dislike.style > legacy.preview.style); assert.equal(legacy.dislike.history, 2); assert.equal(legacy.dislike.rejected, true);
    assert.equal(legacy.correctionCount, 1, 'Listening feedback is not converted into a data correction');
    assert.deepEqual(errors, []);
    results.push({ width, preservedTasteCardAudio: true, corrections: 4, duplicateAndReload: true, profileIsolation: true, sessionAndStorageFailureCopy: true, keyboard: true, layout });
    await context.close();
  }
  await fs.writeFile(output + 'report.json', JSON.stringify(results, null, 2) + '\n');
  console.log('Track data review passed: real clicks/keyboard at375/1440, decoded audio/card/taste unchanged, duplicate/reload/account isolation, PT/EN/ES and truthful storage receipts.');
} finally { await browser.close(); await preview.stop(); }
