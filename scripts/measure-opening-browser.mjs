import { performance } from 'node:perf_hooks';
// Use disposable Playwright contexts. Reentry deliberately keeps one context
// across new pages. Output contains public recordings, timings and totals.
const playwright = await import(process.env.SONIC_PLAYWRIGHT_MODULE || 'playwright');
const [engine = 'chromium', baseUrl = 'https://sonicsearch.app/', scenarios = 'guest:6,full_on_night:1,reload:1'] = process.argv.slice(2);
const url = new URL(baseUrl);
const compareUrl = process.env.SONIC_BROWSER_COMPARE_URL ? new URL(process.env.SONIC_BROWSER_COMPARE_URL) : null;
const compareControlled = process.env.SONIC_BROWSER_CONTROLLED !== '0';
const audioLimit = Number(process.env.SONIC_BROWSER_AUDIO_LIMIT || 4500);
const searchLimit = Number(process.env.SONIC_BROWSER_SEARCH_LIMIT || 14000);
const systemChrome = process.env.SONIC_CHROMIUM_EXECUTABLE;
const desktop = process.env.SONIC_BROWSER_VIEWPORT === 'desktop';
const authorizedTarget = Number(process.env.SONIC_BROWSER_FULL_ON_NIGHT_AUTHORIZED_TARGET || 0);
const sequenceLength = Number(process.env.SONIC_BROWSER_SEQUENCE_LENGTH || (authorizedTarget ? 20 : 5));
const reentryVisits = Number(process.env.SONIC_BROWSER_REENTRY_VISITS || 3);
const filteredFeedback = authorizedTarget > 0 || process.env.SONIC_BROWSER_FILTERED_FEEDBACK === '1';
const requireNoRepeat = process.env.SONIC_BROWSER_REQUIRE_NO_REPEAT === '1';
const reportFreshOverlap = process.env.SONIC_BROWSER_FRESH_OVERLAP === '1';
if (!Number.isInteger(sequenceLength) || sequenceLength < 1 || sequenceLength > 30) throw new Error('Sequence length must be 1–30');
if (!Number.isInteger(reentryVisits) || reentryVisits < 2 || reentryVisits > 10) throw new Error('Reentry visits must be 2–10');
if (!Number.isInteger(authorizedTarget) || authorizedTarget < 0 || authorizedTarget > 20) throw new Error('Authorized target must be 0–20');
if (authorizedTarget && (sequenceLength !== 20 || compareUrl || !['127.0.0.1', 'localhost'].includes(url.hostname) ||
    !parseScenarios().length || parseScenarios().some(([scenario]) => !['full_on_night_bpm', 'full_on_night_reload'].includes(scenario)))) {
  throw new Error('Authorized playback acceptance requires 20 actions, a loopback preview and a Full-On Night BPM scenario');
}
const browser = await playwright[engine].launch({
  headless: true,
  ...(engine === 'chromium' && systemChrome ? { executablePath: systemChrome } : {})
});
const feedbackButtons = ['#topSwipeSurpriseBtn', '#topSwipeSurpriseBtn', '#topSwipeLikeBtn', '#topSwipePassBtn', '#topSwipeSurpriseBtn'];
const wait = ms => new Promise(resolve => setTimeout(resolve, ms));
const activate = (locator, options) => desktop ? locator.click(options) : locator.tap(options);
function parseScenarios() {
  return scenarios.split(',').flatMap(item => {
    const [name, count] = item.split(':');
    return Array.from({ length: Number(count || 1) }, (_, index) => [name, index + 1]);
  });
}

function isCalibratedScenario(scenario) {
  return scenario === 'calibrated' || scenario === 'calibrated-reload';
}

function isReentryScenario(scenario) {
  return scenario === 'guest-reentry' || scenario === 'visitor-reentry';
}

function hasPriorRecording(recording, priorKeys, priorIds) {
  return priorKeys.has(recording.key) || recording.recordingIds.some(identity => priorIds.has(identity));
}

function summarizeSequence(sequence) {
  const actions = sequence.filter(entry => entry.action);
  const cards = actions.filter(entry => entry.key);
  const seenKeys = new Set();
  const seenIds = new Set();
  const seenArtists = new Set();
  let repeatedRecordings = 0;
  let repeatedArtists = 0;
  for (const card of cards) {
    if (hasPriorRecording(card, seenKeys, seenIds)) repeatedRecordings++;
    seenKeys.add(card.key);
    for (const identity of card.recordingIds) seenIds.add(identity);
    if (card.artistKeys.some(key => seenArtists.has(key))) repeatedArtists++;
    for (const artist of card.artistKeys) seenArtists.add(artist);
  }
  return {
    attempts: actions.length,
    cards: cards.length,
    distinctArtists: new Set(cards.map(card => card.artistKey).filter(Boolean)).size,
    distinctStyles: new Set(cards.map(card => card.style).filter(Boolean)).size,
    distinctFamilies: new Set(cards.map(card => card.family).filter(Boolean)).size,
    distinctLabels: new Set(cards.map(card => card.label).filter(Boolean)).size,
    repeatedRecordings,
    repeatedArtists,
    directAudio: cards.filter(card => card.audioEvidence === 'direct-progress').length,
    authorizedDirectAudio: cards.filter(card => card.source === 'authorized_web_preview' && card.audioEvidence === 'direct-progress').length,
    widgetAudio: cards.filter(card => /^(bandcamp|soundcloud|youtube)-progress$/.test(card.audioEvidence)).length,
    widgetLoadedOnly: cards.filter(card => !card.audioEvidence && /-frame-load$/.test(card.playerEvidence)).length,
    endedWithRecovery: Boolean(actions.at(-1)?.recovered && !actions.at(-1)?.key)
  };
}

function summarizeFreshOverlap(runs) {
  const freshVisits = runs.filter(run => run?.scenario === 'guest')
    .map(run => run.sequence.filter(entry => entry.key));
  const overlap = [];
  for (let index = 0; index < freshVisits.length; index++) {
    const cards = freshVisits[index];
    const keys = new Set(cards.map(card => card.key));
    const ids = new Set(cards.flatMap(card => card.recordingIds));
    for (const other of freshVisits.slice(index + 1)) {
      overlap.push(other.filter(card => hasPriorRecording(card, keys, ids)).length);
    }
  }
  return {
    cleanBrowsers: freshVisits.length,
    firstCardKeys: new Set(freshVisits.map(cards => cards[0]?.key).filter(Boolean)).size,
    cardsPerVisit: freshVisits.map(cards => cards.length),
    comparedPairs: overlap.length,
    meanSharedRecordings: overlap.length ? Number((overlap.reduce((sum, value) => sum + value, 0) / overlap.length).toFixed(2)) : null,
    maximumSharedRecordings: overlap.length ? Math.max(...overlap) : null
  };
}

function snapshot() {
  const visible = selector => {
    const node = document.querySelector(selector);
    return !!node && !node.classList.contains('hidden') && !node.hidden && !!node.getClientRects().length;
  };
  const rec = typeof currentRecommendation === 'object' ? currentRecommendation : null;
  const direct = document.getElementById('trackPreview');
  const key = rec ? recommendationTrackKey(rec) : '';
  const style = styleEl.value;
  const recordingIds = rec ? recordingIdentityKeys(rec) : [];
  if (rec && typeof catalogTrackRecordingIds === 'function') recordingIds.push(...catalogTrackRecordingIds(rec));
  else if (rec && trackAppleRecordingId(rec)) recordingIds.push(`apple_music:${trackAppleRecordingId(rec)}`);
  return {
    t: Math.round(performance.now()),
    gesture: window.sonicOpeningProbeGesture || null,
    build: SONIC_APP_BUILD_ID,
    key,
    recordingIds: [...new Set(recordingIds)],
    artist: rec?.artist || '', artistKey: rec ? artistMatchKey(rec.artist || '') : '',
    artistKeys: rec && typeof artistMatchingKeys === 'function' ? [...artistMatchingKeys(rec.artist || '')] : [],
    song: rec?.song || '', style: rec?.style || '', source: rec?.source || '',
    family: rec?.style && typeof familyOf === 'function' ? familyOf(rec.style) : '',
    label: rec?.label || '',
    preferredStyle: style, context: contextEl.value, energy: energyEl.value,
    bpm: bpmEl.value, trackBpm: rec?.bpmExact || null,
    trackContexts: Array.isArray(rec?.context) ? rec.context : [], trackEnergy: rec?.energy || '',
    styleAffinity: style ? swipeStyleSignal(style) : null,
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
    preferredStyle: state.preferredStyle, context: state.context, energy: state.energy,
    bpm: state.bpm, styleAffinity: state.styleAffinity, slotSource: state.slotSource
  };
}

async function boot(context, scenario, targetUrl) {
  const page = await context.newPage();
  await page.route('**/*', async route => {
    const request = route.request();
    const target = new URL(request.url());
    if (target.origin !== targetUrl.origin) return route.continue();
    if (compareControlled && target.pathname === '/api/soundcloud-search' && request.method() === 'POST') {
      return route.fulfill({ status: 503, json: { ok: false, tracks: [] } });
    }
    if (!['GET','HEAD','OPTIONS'].includes(request.method())) return route.abort();
    if (authorizedTarget && ['/api/authorized-catalog', '/api/authorized-audio'].includes(target.pathname)) return route.continue();
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
  const goalUrl = new URL(targetUrl);
  const calibrated = isCalibratedScenario(scenario);
  if (calibrated || scenario === 'skip-calibration') {
    if (!['127.0.0.1', 'localhost'].includes(goalUrl.hostname)) throw new Error('Initial taste calibration QA is localhost-only');
    goalUrl.searchParams.set('tasteCalibrationQa','1');
  }
  if (scenario === 'visitor' || scenario === 'visitor-reentry') goalUrl.searchParams.set('visitor','1');
  if (authorizedTarget) goalUrl.searchParams.set('authorizedPreview', '1');
  await page.goto(goalUrl.href, { waitUntil: 'domcontentloaded' });
  await waitForEntry(page, scenario);
  return page;
}

async function waitForEntry(page, scenario) {
  const calibrated = isCalibratedScenario(scenario);
  await page.waitForFunction(() => typeof runPrimaryRecommendationAction === 'function');
  if (await page.locator('#privacyEssentialBtn').isVisible()) await activate(page.locator('#privacyEssentialBtn'));
  if (await page.locator('#languageScreen').isVisible()) await activate(page.locator('[data-lang="pt"]'));
  if (await page.locator('#authScreen').isVisible()) await activate(page.locator('#authGuestBtn'));
  if (await page.locator('#usageGuideScreen').isVisible()) await activate(page.locator('#usageGuideContinueBtn'));
  if (calibrated) {
    await activate(page.locator('[data-taste-field="experience"][data-taste-value="beginner"]'));
    await activate(page.locator('[data-taste-field="goal"][data-taste-value="track"]'));
  }
  await page.locator(calibrated ? '#tasteCalibrationScreen' : scenario === 'skip-calibration' ? '#tasteCalibrationSkipBtn' : '#topSwipeSurpriseBtn').waitFor({ state:'visible' });
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
  await activate(page.locator(selector), { timeout: 15000 });
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
    artistKeys: shown ? report.artistKeys : [], source: shown ? report.source : '',
    recordingIds: shown ? report.recordingIds : [],
    song: shown ? report.song : '', style: shown ? report.style : '', filter: report.preferredStyle,
    family: shown ? report.family : '', label: shown ? report.label : '',
    context: report.context, energy: report.energy, styleAffinity: report.styleAffinity,
    trackContexts: shown ? report.trackContexts : [], trackEnergy: shown ? report.trackEnergy : '',
    observedMs: Math.round(performance.now() - tapStart), history: report.history,
    likes: report.likes, passes: report.passes, bpm: report.bpm, trackBpm: shown ? report.trackBpm : null
  };
}
async function selectStyle(page, style, bpm) {
  await activate(page.locator('#discoverFiltersBtn'));
  await activate(page.locator('#precisionFiltersSummary'));
  await page.locator('#style').selectOption(style);
  if (bpm) await page.locator('#bpm').selectOption(bpm);
}

async function returnToDiscover(page) {
  const menu = page.locator('#appMenuBtn');
  if (await menu.isVisible() && await menu.getAttribute('aria-expanded') !== 'true') await activate(menu);
  await activate(page.locator('[data-app-tab-target="discover"]'));
}
async function runScenario([scenario, visitor], targetUrl = url, variant = '') {
  const device = desktop ? { viewport: { width: 1440, height: 960 } } :
    (engine === 'webkit' ? playwright.devices['iPhone 13'] : playwright.devices['Pixel 7']);
  const context = await browser.newContext({ ...device, locale:'pt-BR', timezoneId:'America/Sao_Paulo', reducedMotion:'reduce' });
  try {
    if (isReentryScenario(scenario)) {
      const visits = [];
      const priorKeys = new Set();
      const priorIds = new Set();
      let page;
      for (let visit = 0; visit < reentryVisits; visit++) {
        const entry = visit === 0 ? 'first-open' : visit === 1 ? 'reload' : 'new-page-same-browser';
        if (entry === 'reload') {
          await page.reload({ waitUntil: 'domcontentloaded' });
          await waitForEntry(page, scenario);
        } else {
          if (page) await page.close();
          page = await boot(context, scenario, targetUrl);
        }
        const sequence = [];
        const before = await page.evaluate(snapshot);
        if (before.key) {
          sequence.push({ ...before, action: 'automatic-opening', audioEvidence: '',
            playerEvidence: '', recovered: false });
        }
        for (let index = sequence.length; index < sequenceLength; index++) {
          const action = await runAction(page, '#topSwipeSurpriseBtn');
          sequence.push(action);
          if (!action.key) break;
        }
        const repeatsFromEarlierVisits = sequence.filter(card => card.key && hasPriorRecording(card, priorKeys, priorIds)).length;
        const summary = summarizeSequence(sequence);
        for (const card of sequence.filter(card => card.key)) {
          priorKeys.add(card.key);
          for (const identity of card.recordingIds) priorIds.add(identity);
        }
        visits.push({ entry, before: entryState(before), summary, repeatsFromEarlierVisits, sequence });
        if (requireNoRepeat && (summary.cards !== sequenceLength || repeatsFromEarlierVisits || summary.repeatedRecordings)) process.exitCode = 1;
      }
      const result = { engine, viewport: desktop ? 'desktop' : 'mobile', scenario, visitor, ...(variant ? { variant } : {}), visits };
      console.log(JSON.stringify(result));
      return result;
    }
    const page = await boot(context, scenario, targetUrl);
    if (scenario === 'skip-calibration') await activate(page.locator('#tasteCalibrationSkipBtn'));
    const exhaust = scenario === 'full_on_night_exhaust';
    const fullOnBpm = exhaust || scenario === 'full_on_night_bpm' || scenario === 'full_on_night_reload';
    const bpmOnly = scenario === 'bpm_only' || scenario === 'bpm_only_reload';
    const focusStyle = fullOnBpm ? 'full_on_night' : scenario;
    const focused = ['full_on_night', 'batida', 'french_house', 'bleep_techno', 'house', 'tech_house'].includes(focusStyle);
    if (focused) await selectStyle(page, focusStyle, fullOnBpm ? '145-155' : '');
    if (bpmOnly) {
      await selectStyle(page, '', '145-155');
      await returnToDiscover(page);
    }
    const before = await page.evaluate(snapshot);
    const buttons = Array.from({ length: scenario === 'first' ? 1 : sequenceLength }, (_, index) => feedbackButtons[index % feedbackButtons.length]);
    if (isCalibratedScenario(scenario)) buttons[0] = '[data-taste-field="mood"][data-taste-value="groovy"]';
    if (focused) {
      for (const [index, button] of buttons.entries()) {
        if (!filteredFeedback || button === '#topSwipeSurpriseBtn') buttons[index] = '#recommendBtn';
      }
    }
    if (exhaust) buttons.push('#topSwipeSurpriseBtn');
    const sequence = [];
    for (let index = 0; index < buttons.length; index++) {
      let button = buttons[index];
      if (button === '#recommendBtn' && !(await page.locator(button).isVisible())) {
        button = '#topSwipeSurpriseBtn';
      }
      if ((button === '#topSwipeLikeBtn' || button === '#topSwipePassBtn') && await page.locator(button).isDisabled()) button = '#topSwipeSurpriseBtn';
      const action = await runAction(page, button, index === 0 ? before : null);
      sequence.push(action);
      if (sequenceLength > 5 && !action.key && action.recovered) break;
      if (index === 3 && ['reload', 'full_on_night_reload', 'calibrated-reload', 'bpm_only_reload'].includes(scenario)) {
        if (scenario === 'calibrated-reload') {
          await page.evaluate(() => {
            // The QA entry creates a new synthetic profile on every visit.
            // Resume this test profile through the ordinary returning-user entry.
            if (currentAuthUser?.mode !== 'test') throw new Error('Expected a calibration QA profile');
            persistUserSession(currentAuthUser);
            const returningUrl = new URL(location.href);
            returningUrl.searchParams.delete('tasteCalibrationQa');
            history.replaceState(history.state, '', returningUrl);
          });
        }
        await page.reload({ waitUntil:'domcontentloaded' });
        await page.waitForFunction(() => typeof runPrimaryRecommendationAction === 'function' && !appContent?.classList.contains('hidden'));
        const reloaded = await page.evaluate(snapshot);
        sequence.push({
          reload: entryState(reloaded),
          retainsPrior: sequence.map(result => result.key).filter(Boolean).map(key => reloaded.seen.includes(key))
        });
      }
    }
    const summary = summarizeSequence(sequence);
    const wrongFilter = sequence.some(card => card.key && (
      (focused && card.style !== focusStyle) ||
      ((fullOnBpm || bpmOnly) && !(Number(card.trackBpm) >= 145 && Number(card.trackBpm) <= 155))
    ));
    if (requireNoRepeat && (summary.repeatedRecordings || wrongFilter)) process.exitCode = 1;
    const acceptance = authorizedTarget ? {
      minimumAuthorized: authorizedTarget,
      passed: summary.cards === 20 && summary.distinctArtists === 20 && summary.directAudio === 20 &&
        summary.authorizedDirectAudio >= authorizedTarget && !summary.repeatedRecordings && !summary.repeatedArtists &&
        !wrongFilter && sequence.filter(entry => entry.key).every(card => card.recordingIds.length > 0)
    } : null;
    if (acceptance && !acceptance.passed) process.exitCode = 1;
    const result = { engine, viewport: desktop ? 'desktop' : 'mobile', scenario, visitor, ...(variant ? { variant } : {}), before: entryState(before), summary, wrongFilter, ...(acceptance ? { acceptance } : {}), sequence };
    console.log(JSON.stringify(result));
    return result;
  } catch (error) {
    console.log(JSON.stringify({ engine, scenario, visitor, ...(variant ? { variant } : {}), error: error?.name || 'Error' }));
    process.exitCode = 1;
    return null;
  } finally { await context.close(); }
}
try {
  const all = parseScenarios();
  const results = [];
  if (compareUrl) {
    const variants = [[url, 'base'], [compareUrl, 'comparison']];
    for (const visit of all) {
      for (const [targetUrl, variant] of variants) results.push(await runScenario(visit, targetUrl, variant));
      variants.reverse();
    }
  } else {
    const concurrency = Number(process.env.SONIC_BROWSER_VISITORS_AT_ONCE || 1);
    for (let index = 0; index < all.length; index += concurrency) {
      results.push(...await Promise.all(all.slice(index, index + concurrency).map(visit => runScenario(visit))));
    }
  }
  if (reportFreshOverlap) {
    for (const variant of compareUrl ? ['base', 'comparison'] : ['']) {
      console.log(JSON.stringify({
        engine, type: 'fresh-visit-overlap', ...(variant ? { variant } : {}),
        ...summarizeFreshOverlap(results.filter(result => (result?.variant || '') === variant))
      }));
    }
  }
} finally { await browser.close(); }
