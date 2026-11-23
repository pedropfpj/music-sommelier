import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import http from 'node:http';
import os from 'node:os';
import path from 'node:path';
import { execFile } from 'node:child_process';
import { promisify } from 'node:util';
import { startTestPreviewServer } from './test-preview-server.mjs';

// The server sends five seconds of a generated tone, then withholds the rest.
// Browser waiting/stalled/playing events and play() are real; this is not music coverage.
const pw = await import(process.env.SONIC_PLAYWRIGHT_MODULE || 'playwright');
const [engine = 'chromium'] = process.argv.slice(2);
assert.ok(['chromium', 'webkit'].includes(engine));
const app = await fs.readFile(process.env.SONIC_PLAYER_APP_SOURCE || new URL('../app.min.js', import.meta.url), 'utf8');
const output = new URL(`../.vercel/preview-buffer-recovery/${engine}/`, import.meta.url);
await fs.mkdir(output, { recursive: true });
const rate = 24000, samples = rate * 30;
const wav = Buffer.alloc(44 + samples * 2);
wav.write('RIFF'); wav.writeUInt32LE(wav.length - 8, 4); wav.write('WAVEfmt ', 8);
wav.writeUInt32LE(16, 16); wav.writeUInt16LE(1, 20); wav.writeUInt16LE(1, 22);
wav.writeUInt32LE(rate, 24); wav.writeUInt32LE(rate * 2, 28); wav.writeUInt16LE(2, 32);
wav.writeUInt16LE(16, 34); wav.write('data', 36); wav.writeUInt32LE(samples * 2, 40);
for (let i = 0; i < samples; i++) wav.writeInt16LE(Math.round(Math.sin(i * Math.PI * 2 * 330 / rate) * 1800), 44 + i * 2);
// The macOS WebKit runner did not start this partial WAV fixture. Native AAC
// ADTS lets that runner exercise the same partial-response starvation scenario.
let media = wav, contentType = 'audio/wav', extension = 'wav';
let convertedDirectory = '';
if (engine === 'webkit' && process.platform === 'darwin') {
  convertedDirectory = await fs.mkdtemp(path.join(os.tmpdir(), 'sonic-buffer-aac-'));
  const input = path.join(convertedDirectory, 'tone.wav'), destination = path.join(convertedDirectory, 'tone.aac');
  await fs.writeFile(input, wav);
  await promisify(execFile)('/usr/bin/afconvert', ['-f', 'adts', '-d', 'aac', '-b', '64000', input, destination]);
  media = await fs.readFile(destination); contentType = 'audio/aac'; extension = 'aac';
}
const initialBytes = extension === 'aac' ? Math.floor(media.length / 6) : 44 + rate * 2 * 5;
const streams = new Map();
const mediaServer = http.createServer((request, response) => {
  const stream = streams.get(new URL(request.url, 'http://local.test').pathname);
  if (!stream) { response.writeHead(404).end(); return; }
  const range = String(request.headers.range || '').match(/bytes=(\d+)-(\d*)/);
  const start = range ? +range[1] : 0;
  const end = range?.[2] ? Math.min(+range[2], media.length - 1) : media.length - 1;
  if (start > end) { response.writeHead(416).end(); return; }
  response.writeHead(range ? 206 : 200, {
    'Content-Type': contentType, 'Content-Length': end - start + 1,
    'Accept-Ranges': 'bytes', 'Access-Control-Allow-Origin': '*', 'Cache-Control': 'no-store',
    ...(range ? { 'Content-Range': `bytes ${start}-${end}/${media.length}` } : {})
  });
  const firstEnd = Math.min(end + 1, initialBytes);
  if (start < firstEnd) response.write(media.subarray(start, firstEnd));
  const rest = Math.max(start, firstEnd);
  if (stream.released || end < firstEnd) response.end(stream.released ? media.subarray(rest, end + 1) : undefined);
  else stream.pending.push({ response, rest, end });
});
await new Promise(resolve => mediaServer.listen(0, '127.0.0.1', resolve));
const mediaOrigin = `http://127.0.0.1:${mediaServer.address().port}`;
const preview = await startTestPreviewServer();
const browser = await pw[engine].launch();
const report = { engine, fixture: `generated streaming ${extension.toUpperCase()}; actual media buffer starvation`, scenarios: [] };
let sequence = 0;
function stream(released = false) {
  const key = `/stream-${++sequence}.${extension}`, state = { released, pending: [] };
  streams.set(key, state);
  return {
    url: mediaOrigin + key,
    release() {
      state.released = true;
      for (const held of state.pending.splice(0)) if (!held.response.destroyed) held.response.end(media.subarray(held.rest, held.end + 1));
    }
  };
}
function musicalSnapshot() {
  return { key: recommendationTrackKey(currentRecommendation), source: trackPreview.getAttribute('src'),
    style: styleEl.value, bpm: bpmEl.value, likes: likedTrackHistory, dislikes: dislikedTrackHistory,
    taste: [...trackPreferenceSignals], training: userStats.swipeTrainingSignals };
}
async function fixture() {
  const context = await browser.newContext({ ...pw.devices[engine === 'webkit' ? 'iPhone 13' : 'Pixel 7'], locale: 'pt-BR', serviceWorkers: 'block', reducedMotion: 'reduce' });
  const page = await context.newPage(), errors = [];
  page.on('pageerror', error => errors.push(error.message));
  await page.route('**/*', route => {
    const url = new URL(route.request().url());
    if (url.origin === mediaOrigin) return route.continue();
    if (url.origin !== preview.baseUrl) return route.abort();
    if (url.pathname === '/app.min.js') return route.fulfill({ contentType: 'text/javascript', body: app });
    if (url.pathname.startsWith('/api/')) return route.fulfill({ json: { ok: true, enabled: false, items: [], tracks: [], count: 0 } });
    return route.continue();
  });
  await page.addInitScript(() => localStorage.setItem('sonic_search:privacy:analytics:v1', 'no'));
  await page.goto(`${preview.baseUrl}/?qa=1&lang=pt&recommendation=0`, { waitUntil: 'domcontentloaded' });
  await page.waitForFunction(() => typeof runPrimaryRecommendationAction === 'function');
  for (const selector of ['#privacyEssentialBtn', '#languageScreen [data-lang="pt"]', '#authGuestBtn', '#usageGuideContinueBtn', '#tasteCalibrationSkipBtn']) {
    if (await page.locator(selector).isVisible()) await page.locator(selector).click();
  }
  await page.locator('#topSwipeSurpriseBtn').waitFor({ state: 'visible' });
  return { page, errors, close: () => context.close() };
}
async function present(page, url, title = 'Buffer fixture') {
  return page.evaluate(({ url, title }) => {
    const track = { ...pickInstantOpeningTrack()?.track, song: title, artist: 'Local streaming fixture', style: 'techno', source: 'fixture_stream', bpm: 130, previewUrl: url };
    styleEl.value = 'techno'; bpmEl.value = '128-132';
    setActiveAppTab('discover');
    restoreRecommendationSurfaceSnapshot({ track, prefs: prefsFromManualControls(), discovery: null }, { restartPreview: false });
    trackPreview.dataset.previewTrackKey = recommendationTrackKey(track);
    trackPreview.dataset.previewRenderToken = String(recommendationPreviewRenderToken);
    trackPreview.src = url; trackPreview.load();
    previewPanel.classList.remove('hidden'); previewPlayBtn.classList.remove('hidden');
    setPreviewPrimaryPlaybackState('ready');
    return recommendationTrackKey(track);
  }, { url, title });
}
async function start(page) {
  await page.evaluate(() => { prepareExplicitPreviewAudio(); void trackPreview.play().catch(() => {}); });
  try {
    await page.waitForFunction(() => !trackPreview.paused && trackPreview.currentTime > 0.2, undefined, { timeout: 12000 });
  } catch {
    const state = await page.evaluate(() => ({
      source: trackPreview.getAttribute('src'), time: trackPreview.currentTime,
      ready: trackPreview.readyState, paused: trackPreview.paused,
      status: previewStatus.textContent, state: activePlayback.state,
      key: recommendationTrackKey(currentRecommendation), owner: trackPreview.dataset.previewTrackKey,
      token: trackPreview.dataset.previewRenderToken, currentToken: recommendationPreviewRenderToken,
      error: trackPreview.error?.code
    }));
    throw new Error(`The generated stream did not start: ${JSON.stringify(state)}`);
  }
}
async function waiting(page) {
  await page.waitForFunction(() => activePlayback.state === 'buffering', undefined, { timeout: 12000 });
  assert.match(await page.locator('#previewStatus').innerText(), /Aguardando áudio/);
  assert.equal(await page.evaluate(() => trackPreview.paused), false, 'Short buffering must leave playback ready to resume');
  return page.evaluate(() => ({ generation: playbackGeneration, time: trackPreview.currentTime }));
}
try {
  {
    const f = await fixture(), held = stream();
    try {
      await present(f.page, held.url);
      const before = await f.page.evaluate(musicalSnapshot);
      await start(f.page); const buffered = await waiting(f.page);
      await f.page.waitForTimeout(500); held.release();
      await f.page.waitForFunction(time => activePlayback.state === 'playing' && trackPreview.currentTime > time + 0.2, buffered.time, { timeout: 5000 });
      assert.equal(await f.page.evaluate(() => playbackGeneration), buffered.generation, 'A short interruption resumes the same playback request');
      assert.equal(await f.page.locator('#previewPlayBtn').getAttribute('data-playback-state'), 'playing');
      assert.deepEqual(await f.page.evaluate(musicalSnapshot), before);
      assert.deepEqual(f.errors, []);
      report.scenarios.push('buffer starvation -> waiting message -> media arrives before timeout -> same playback resumes');
    } finally { held.release(); await f.close(); }
  }
  {
    const f = await fixture(), held = stream();
    try {
      await present(f.page, held.url);
      const before = await f.page.evaluate(musicalSnapshot);
      await start(f.page); await waiting(f.page);
      await f.page.waitForFunction(() => previewPlayBtn.dataset.playbackState === 'retry', undefined, { timeout: 11000 });
      assert.equal(await f.page.locator('#previewPlayBtn').isVisible(), true);
      assert.equal(await f.page.locator('#previewPlayBtn').isEnabled(), true);
      assert.equal(await f.page.evaluate(() => trackPreview.paused), true);
      for (const [language, expected] of [['en', /preview was interrupted/], ['es', /vista previa se interrumpió/], ['pt', /prévia foi interrompida/]]) {
        await f.page.evaluate(language => setLanguage(language, { persist: false }), language);
        assert.match(await f.page.locator('#previewStatus').innerText(), expected);
      }
      assert.deepEqual(await f.page.evaluate(musicalSnapshot), before, 'Long buffering must not modify filters, recording, or musical feedback');
      held.release();
      await f.page.locator('#previewPlayBtn').click();
      await f.page.waitForFunction(() => !trackPreview.paused && trackPreview.currentTime > 0.2, undefined, { timeout: 5000 });
      assert.deepEqual(await f.page.evaluate(musicalSnapshot), before);
      assert.deepEqual(f.errors, []);
      report.scenarios.push('buffer starvation exceeds eight seconds -> visible retry -> same recording/source plays without taste changes');
    } finally { held.release(); await f.close(); }
  }
  {
    const f = await fixture(), held = stream();
    try {
      await present(f.page, held.url); await start(f.page); await waiting(f.page);
      await f.page.evaluate(() => setActiveAppTab('news')); held.release();
      await f.page.waitForTimeout(8500);
      assert.equal(await f.page.evaluate(() => trackPreview.paused && activePlayback.type === 'none' && !directPreviewStartWatch), true);
      assert.notEqual(await f.page.locator('#previewPlayBtn').getAttribute('data-playback-state'), 'retry');
      assert.deepEqual(f.errors, []);
      report.scenarios.push('navigate during buffering -> late media and deadline cannot restart audio or show stale retry');
    } finally { held.release(); await f.close(); }
  }
  {
    const f = await fixture(), held = stream(), healthy = stream(true);
    try {
      await present(f.page, held.url); await start(f.page); await waiting(f.page);
      const next = await present(f.page, healthy.url, 'Newer buffer fixture');
      await start(f.page); held.release();
      await f.page.waitForTimeout(8500);
      assert.equal(await f.page.evaluate(() => recommendationTrackKey(currentRecommendation)), next);
      assert.equal(await f.page.evaluate(() => !trackPreview.paused && trackPreview.currentTime > 8 && trackPreviewElementMatchesTrack(currentRecommendation)), true);
      assert.notEqual(await f.page.locator('#previewPlayBtn').getAttribute('data-playback-state'), 'retry');
      assert.deepEqual(f.errors, []);
      report.scenarios.push('new recording during buffering -> old response/deadline cannot stop or overwrite the newer playback');
    } finally { held.release(); await f.close(); }
  }
  await fs.writeFile(new URL('results.json', output), JSON.stringify(report, null, 2));
  console.log(JSON.stringify(report));
} finally {
  for (const state of streams.values()) for (const held of state.pending) held.response.destroy();
  await browser.close(); await preview.stop(); mediaServer.closeAllConnections();
  await new Promise(resolve => mediaServer.close(resolve));
  if (convertedDirectory) await fs.rm(convertedDirectory, { recursive: true, force: true });
}
