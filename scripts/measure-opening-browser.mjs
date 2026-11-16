import { performance } from 'node:perf_hooks';
// Use a disposable Playwright context for each visit. Output contains only
// playback timings, recording titles and aggregate state. No network tracing.
const playwright = await import(process.env.SONIC_PLAYWRIGHT_MODULE || 'playwright');
const [engine = 'chromium', baseUrl = 'https://sonicsearch.app/', scenarios = 'guest:6,full_on_night:1,reload:1'] = process.argv.slice(2);
const url = new URL(baseUrl);
const local = ['127.0.0.1','localhost'].includes(url.hostname);
const compareControlled = process.env.SONIC_BROWSER_CONTROLLED !== '0';
const audioLimit = Number(process.env.SONIC_BROWSER_AUDIO_LIMIT || 4500);
const searchLimit = Number(process.env.SONIC_BROWSER_SEARCH_LIMIT || 14000);
const systemChrome = process.env.SONIC_CHROMIUM_EXECUTABLE;
const browser = await playwright[engine].launch({
  headless: true,
  ...(engine === 'chromium' && systemChrome ? { executablePath: systemChrome } : {})
});
const feedbackButtons = ['#topSwipeSurpriseBtn', '#topSwipeSurpriseBtn', '#topSwipeLikeBtn', '#topSwipePassBtn', '#topSwipeSurpriseBtn'];
const wait = ms => new Promise(resolve => setTimeout(resolve, ms));
function parseScenarios() {
  return scenarios.split(',').flatMap(item => {
    const [name, count] = item.split(':');
    return Array.from({ length: Number(count || 1) }, (_, index) => [name, index + 1]);
  });
}

function snapshot() {
  const visible = selector => {
    const node = document.querySelector(selector);
    return !!node && !node.classList.contains('hidden') && !node.hidden && !!node.getClientRects().length;
  };
  const rec = typeof currentRecommendation === 'object' ? currentRecommendation : null;
  const direct = document.getElementById('trackPreview');
  const key = rec ? recommendationTrackKey(rec) : '';
  return {
    t: Math.round(performance.now()),
    gesture: window.sonicOpeningProbeGesture || null,
    build: SONIC_APP_BUILD_ID,
    key,
    artist: rec?.artist || '', artistKey: rec ? artistMatchKey(rec.artist || '') : '', song: rec?.song || '', style: rec?.style || '',
    preferredStyle: styleEl.value, bpm: bpmEl.value, trackBpm: rec?.bpmExact || null,
    session: currentAuthUser?.mode || '', language: currentLanguage, slotSource: openingRotationSlotSource,
    catalog: catalog.length, history: seenTrackKeysMemory.size,
    likes: likedTrackHistory.length, passes: dislikedTrackHistory.length,
    seen: [...seenTrackKeysMemory].slice(-12),
    busy: Boolean(recommendationRunBusy || firstRecommendationBusy),
    recovery: visible('#recommendationRecovery'),
    frameLoads: window.sonicOpeningFrameLoads || {},
    media: {
      directHasSource: Boolean(ownedTrackPreviewSource(rec, direct)),
      currentTime: direct.currentTime,
      playTime: direct.played.length ? direct.played.end(direct.played.length - 1) - direct.played.start(0) : 0,
      readyState: direct.readyState,
      directMatches: Boolean(rec && trackPreviewElementMatchesTrack(rec)),
      directAudible: !direct.muted && direct.volume > 0,
      status: visible('#previewStatus') ? document.querySelector('#previewStatus').textContent.trim() : '',
      embed: ['bandcamp', 'soundcloud', 'youtube'].find(provider => visible(`#${provider}PreviewWrap`) && document.querySelector(`#${provider}PreviewFrame`).getAttribute('src')) || ''
    }
  };
}
function entryState(state) {
  return {
    build: state.build, mode: state.session, lang: state.language,
    catalog: state.catalog, seen: state.history, likes: state.likes, passes: state.passes,
    preferredStyle: state.preferredStyle, bpm: state.bpm, slotSource: state.slotSource
  };
}

async function boot(context, scenario) {
  const page = await context.newPage();
  await page.route('**/*', async route => {
    const request = route.request();
    const target = new URL(request.url());
    if (target.origin !== url.origin) return route.continue();
    if (!['GET','HEAD','OPTIONS'].includes(request.method())) return route.abort();
    if (compareControlled && target.pathname.startsWith('/api/')) return route.fulfill({ json: { ok: true, enabled: false, items: [], tracks: [], count: 0 } });
    return route.continue();
  });
  await page.addInitScript(() => {
    const loadedFrames = window.sonicOpeningFrameLoads = {};
    document.addEventListener('load', event => {
      const frame = event.target;
      if (frame?.matches?.('#previewPanel iframe') && frame.getAttribute('src')) {
        loadedFrames[frame.id] = Math.round(performance.now());
      }
    }, true);
    document.addEventListener('click', event => {
      const actual = event.target?.closest?.('button');
      if (!actual?.id && !actual?.dataset.tasteField) return;
      window.sonicOpeningProbeGesture = { t: Math.round(performance.now()), id: actual.id || actual.dataset.tasteField };
    }, true);
  });
  const goalUrl = new URL(url);
  if (scenario === 'calibrated' || scenario === 'skip-calibration') {
    if (!local) throw new Error('Initial taste calibration QA is localhost-only');
    goalUrl.searchParams.set('tasteCalibrationQa','1');
  }
  if (scenario === 'visitor') goalUrl.searchParams.set('visitor','1');
  await page.goto(goalUrl.href, { waitUntil: 'domcontentloaded' });
  await page.waitForFunction(() => typeof runPrimaryRecommendationAction === 'function');
  if (await page.locator('#privacyEssentialBtn').isVisible()) await page.locator('#privacyEssentialBtn').tap();
  if (await page.locator('#languageScreen').isVisible()) await page.locator('[data-lang="pt"]').tap();
  if (await page.locator('#authScreen').isVisible()) await page.locator('#authGuestBtn').tap();
  if (await page.locator('#usageGuideScreen').isVisible()) await page.locator('#usageGuideContinueBtn').tap();
  if (scenario === 'calibrated') {
    await page.locator('[data-taste-field="experience"][data-taste-value="beginner"]').tap();
    await page.locator('[data-taste-field="goal"][data-taste-value="track"]').tap();
  }
  await page.locator(scenario === 'calibrated' ? '#tasteCalibrationScreen' : scenario === 'skip-calibration' ? '#tasteCalibrationSkipBtn' : '#topSwipeSurpriseBtn').waitFor({ state:'visible' });
  return page;
}
async function getEmbedPlayback(page, state) {
  if (!state.media.embed) return null;
  const id = `#${state.media.embed}PreviewFrame`;
  const frame = await page.$(id).then(el => el?.contentFrame()).catch(() => null);
  if (!frame) return null;
  return Promise.race([
    frame.evaluate(() => [...document.querySelectorAll('audio,video')].some(media =>
      media.currentTime > 0.15 && !media.muted && media.volume > 0 && media.played.length > 0
    )).catch(() => false),
    wait(200).then(() => false)
  ]);
}
async function runAction(page, selector, before = null) {
  const previous = before || await page.evaluate(snapshot);
  const tapStart = performance.now();
  await page.locator(selector).tap({ timeout: 15000 });
  const deadline = performance.now() + searchLimit;
  let cardAt = null, configuredAt = null, loadedAt = null, heardAt = null;
  let loadedVia = '', heardVia = '', report = previous;
  let localDeadline = deadline;
  while (performance.now() < localDeadline) {
    report = await page.evaluate(snapshot);
    const startAt = report.gesture?.t ?? previous.t;
    const clockAt = Math.max(0, report.t - startAt);
    if (report.key && report.key !== previous.key) {
      if (cardAt === null) {
        cardAt = clockAt;
        localDeadline = Math.min(deadline, performance.now() + audioLimit);
      }
      const frameLoadedAt = report.frameLoads[`${report.media.embed}PreviewFrame`];
      if (configuredAt === null && (report.media.embed || report.media.directHasSource)) configuredAt = clockAt;
      if (loadedAt === null && report.media.directMatches && report.media.readyState >= 2) {
        loadedAt = clockAt;
        loadedVia = 'direct-loadeddata';
      } else if (loadedAt === null && report.media.embed && frameLoadedAt >= startAt) {
        loadedAt = frameLoadedAt - startAt;
        loadedVia = `${report.media.embed}-frame-load`;
      }
      if (report.media.directMatches && report.media.currentTime > 0.15 && report.media.playTime > 0.1 && report.media.directAudible) {
        heardAt = clockAt; heardVia = 'direct-progress'; break;
      }
      if (await getEmbedPlayback(page, report)) {
        heardAt = clockAt; heardVia = `${report.media.embed}-progress`; break;
      }
      if (!report.busy && !report.media.embed && /indisponível|sem preview|não encontrei|sem áudio/i.test(report.media.status)) break;
    }
    if (!report.busy && report.recovery && (!report.key || report.key === previous.key)) break;
    await wait(90);
  }
  const shown = cardAt !== null && report.key && report.key !== previous.key;
  return {
    action: selector, tapToCardMs: shown ? cardAt : null, tapToConfiguredMs: shown ? configuredAt : null,
    tapToPlayerMs: shown ? loadedAt : null, playerEvidence: shown ? loadedVia : '',
    tapToAudioProgressMs: shown ? heardAt : null, audioEvidence: shown ? heardVia : '',
    status: report.media.status, recovered: report.recovery, retainedPrior: Boolean(previous.key && report.key === previous.key),
    key: shown ? report.key : '', artist: shown ? report.artist : '', artistKey: shown ? report.artistKey : '',
    song: shown ? report.song : '', style: shown ? report.style : '', filter: report.preferredStyle,
    observedMs: Math.round(performance.now() - tapStart), history: report.history,
    likes: report.likes, passes: report.passes, bpm: report.bpm, trackBpm: shown ? report.trackBpm : null
  };
}
async function selectStyle(page, style, bpm) {
  await page.locator('#discoverFiltersBtn').tap();
  await page.locator('#precisionFiltersSummary').tap();
  await page.locator('#style').selectOption(style);
  if (bpm) await page.locator('#bpm').selectOption(bpm);
}
async function runScenario([scenario, visitor]) {
  const context = await browser.newContext({ ...(engine === 'webkit' ? playwright.devices['iPhone 13'] : playwright.devices['Pixel 7']), locale:'pt-BR', timezoneId:'America/Sao_Paulo', reducedMotion:'reduce' });
  try {
    const page = await boot(context, scenario);
    if (scenario === 'skip-calibration') await page.locator('#tasteCalibrationSkipBtn').tap();
    const exhaust = scenario === 'full_on_night_exhaust';
    const fullOnBpm = exhaust || scenario === 'full_on_night_bpm' || scenario === 'full_on_night_reload';
    const focusStyle = fullOnBpm ? 'full_on_night' : scenario;
    const focused = focusStyle === 'full_on_night' || focusStyle === 'batida';
    if (focused) await selectStyle(page, focusStyle, fullOnBpm ? '145-155' : '');
    const before = await page.evaluate(snapshot);
    const buttons = scenario === 'first' ? feedbackButtons.slice(0, 1) : [...feedbackButtons];
    if (scenario === 'calibrated') buttons[0] = '[data-taste-field="mood"][data-taste-value="groovy"]';
    if (focused) buttons.fill('#recommendBtn');
    if (exhaust) buttons.push('#topSwipeSurpriseBtn');
    const sequence = [];
    for (let index = 0; index < buttons.length; index++) {
      let button = buttons[index];
      if (button === '#recommendBtn' && !(await page.locator(button).isVisible())) {
        button = '#topSwipeSurpriseBtn';
      }
      if ((button === '#topSwipeLikeBtn' || button === '#topSwipePassBtn') && await page.locator(button).isDisabled()) button = '#topSwipeSurpriseBtn';
      sequence.push(await runAction(page, button, index === 0 ? before : null));
      if (index === 3 && (scenario === 'reload' || scenario === 'full_on_night_reload')) {
        await page.reload({ waitUntil:'domcontentloaded' });
        await page.waitForFunction(() => typeof runPrimaryRecommendationAction === 'function' && !appContent?.classList.contains('hidden'));
        const reloaded = await page.evaluate(snapshot);
        sequence.push({
          reload: entryState(reloaded),
          retainsPrior: sequence.map(result => result.key).filter(Boolean).map(key => reloaded.seen.includes(key))
        });
      }
    }
    const result = { engine, scenario, visitor, before: entryState(before), sequence };
    console.log(JSON.stringify(result));
    return result;
  } catch (error) {
    console.log(JSON.stringify({ engine, scenario, visitor, error: error?.name || 'Error' }));
    process.exitCode = 1;
    return null;
  } finally { await context.close(); }
}
try {
  const all = parseScenarios();
  const concurrency = Number(process.env.SONIC_BROWSER_VISITORS_AT_ONCE || 1);
  for (let index = 0; index < all.length; index += concurrency) await Promise.all(all.slice(index, index + concurrency).map(runScenario));
} finally { await browser.close(); }
