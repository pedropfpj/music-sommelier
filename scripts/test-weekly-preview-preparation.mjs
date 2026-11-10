import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";

const { chromium } = await import(process.env.SONIC_PLAYWRIGHT_MODULE || "playwright");
const app = await readFile(process.env.SONIC_WEEKLY_PREPARATION_APP_PATH || new URL("../app.js", import.meta.url), "utf8");
function functionSource(name) {
  const start = app.search(new RegExp(`(?:^|\\n)(?:async )?function ${name}\\(`));
  assert.ok(start >= 0, `Missing actual runtime function ${name}`);
  const end = app.indexOf("\n}", start);
  assert.ok(end > start);
  return app.slice(start, end + 2);
}
const blockStart = app.indexOf("const weeklyEditionPreviewCache = new Map();");
const blockEnd = app.indexOf("async function openSavedLibraryTrack(", blockStart);
assert.ok(blockStart >= 0 && blockEnd > blockStart, "Exact edition playback needs a preparation phase before presentation");
const helpers = ["normalize", "recommendationTrackKey", "previewUrlExpiryEpoch", "previewUrlIsExpired", "normalizePreviewUrl", "registerPreviewCandidate", "promotePreviewCandidate", "previewCandidatesForTrack", "resetTrackPreviewElement", "createTrackPreviewProbeElement", "probeAudioSource", "pickPlayablePreviewSource", "waitForPromiseWithTimeout"].map(functionSource).join("\n");

// These bytes must be decoded by the browser's media element. No canplay event,
// readyState, probe result or availability result is simulated in this fixture.
const pcm = Buffer.alloc(16000);
for (let i = 0; i < 8000; i++) pcm.writeInt16LE(Math.round(Math.sin(i * Math.PI * 2 * 220 / 8000) * 500), i * 2);
const header = Buffer.alloc(44);
header.write("RIFF"); header.writeUInt32LE(36 + pcm.length, 4); header.write("WAVEfmt ", 8);
header.writeUInt32LE(16, 16); header.writeUInt16LE(1, 20); header.writeUInt16LE(1, 22);
header.writeUInt32LE(8000, 24); header.writeUInt32LE(16000, 28); header.writeUInt16LE(2, 32); header.writeUInt16LE(16, 34);
header.write("data", 36); header.writeUInt32LE(pcm.length, 40);
const wav = Buffer.concat([header, pcm]);
const browser = await chromium.launch({ headless: true, ...(process.env.SONIC_CHROMIUM_EXECUTABLE ? { executablePath: process.env.SONIC_CHROMIUM_EXECUTABLE } : {}) });

async function fixture() {
  const page = await browser.newPage();
  await page.route("https://weekly-media.fixture.test/**", route => route.request().url().includes("dead")
    ? route.fulfill({ status: 404, body: "Unavailable recording" })
    : route.fulfill({ contentType: "audio/wav", body: wav, headers: { "Access-Control-Allow-Origin": "*" } }));
  await page.setContent('<audio id="trackPreview"></audio><button id="playFixture" onclick="trackPreview.play()">Play exact recording</button>');
  await page.evaluate(() => {
    window.trace = { metadata: [], presented: 0, stats: 0, events: [], restores: 0, plays: 0, renderOptions: [], activeLookups: 0, peakLookups: 0 };
    window.mode = {};
    window.profile = "profile-a";
    window.allowed = true;
    window.gates = {};
    const originalPlay = HTMLMediaElement.prototype.play;
    HTMLMediaElement.prototype.play = function () { trace.plays++; return originalPlay.call(this); };
    Object.assign(window, {
      catalog: [], CURATED_FRIENDLY_OPENING_TRACKS: [], trackPreview: document.getElementById("trackPreview"),
      currentRecommendation: { artist: "Previous Artist", song: "Previous Recording", style: "house" },
      recommendationRunBusy: false, swipeFeedbackBusy: false, firstRecommendationBusy: false,
      recommendationSessionGeneration: 1, firstRecommendationCompleted: false, lastPrefs: null,
      recommendationSessionIsCurrent: generation => generation === window.recommendationSessionGeneration,
      sessionProfileKey: () => window.profile, currentActiveAppTabName: () => "discover",
      catalogTrackMetadataText: () => "", isTrackEligibleForRecommendation: track => track.eligible !== false,
      hydrateExternalDatasetPackInBackground: async () => {}, prepareExplicitPreviewAudio() {}, stopAllActivePlayback() {},
      markRecommendationPresented: () => { trace.presented++; }, updateStats: () => { trace.stats++; },
      trackRecommendationEvent: event => { trace.events.push(event); },
      restoreRecommendationSurfaceSnapshot: ({ track }) => { window.currentRecommendation = track; trace.restores++; },
      trackPreviewElementMatchesTrack: track => trackPreview.dataset.previewTrackKey === `${track.artist}|${track.song}`,
      fetchTrackMetadataFromApi: async (track, options) => {
        trace.metadata.push({ song: track.song, options });
        trace.activeLookups++; trace.peakLookups = Math.max(trace.peakLookups, trace.activeLookups);
        try {
          const kind = mode[track.song] || "ready";
          if (kind === "throw") throw new Error("Temporary provider outage");
          if (kind === "pending") await new Promise(resolve => { gates[track.song] = resolve; });
          if (kind === "never") await new Promise(() => {});
          await new Promise(resolve => setTimeout(resolve, 20));
          if (kind === "empty") return null;
          return { artist: track.artist, song: kind === "wrong-version" ? `${track.song} (Remix)` : track.song, previewUrl: "https://weekly-media.fixture.test/ready.wav" };
        } finally { trace.activeLookups--; }
      },
      renderPreview: async (track, options) => {
        trace.renderOptions.push(options);
        if (window.renderFails) return false;
        trackPreview.dataset.previewTrackKey = `${track.artist}|${track.song}`;
        trackPreview.src = track.previewUrl;
        trackPreview.load();
        return true;
      }
    });
    window.addItem = (id, extra = {}) => {
      const item = { id, artist: "Edition Artist", title: id, style: "house" };
      catalog.push({ artist: item.artist, song: item.title, style: item.style, ...extra });
      return item;
    };
  });
  await page.addScriptTag({ content: `${helpers}\n${app.slice(blockStart, blockEnd)}` });
  return page;
}

try {
  const media = await fixture();
  let result = await media.evaluate(async () => {
    const ready = addItem("Ready exact audio", { previewUrl: "https://weekly-media.fixture.test/ready.wav" });
    const expired = addItem("Expired signed audio", { previewUrl: "https://weekly-media.fixture.test/dead.wav?hdnea=exp=1700000000~acl=*" });
    const searched = addItem("Only search links", { youtubeTrackUrl: "https://www.youtube.com/results?search_query=exact", soundcloudTrackUrl: "https://soundcloud.com/search?q=exact" });
    const remix = addItem("Original exact title");
    mode[searched.title] = "empty"; mode[remix.title] = "wrong-version";
    const before = currentRecommendation;
    const response = await prepareWeeklyEditionTracks([ready, expired, searched, remix], { isCurrent: () => allowed });
    return { statuses: response.results.map(row => row.status), sameItems: response.results.every((row, i) => row.item === [ready, expired, searched, remix][i]), untouched: currentRecommendation === before, playerSource: trackPreview.getAttribute("src"), trace, mutatedCatalog: catalog.some(track => track.weeklyVerifiedAudio || track.previewChecked) };
  });
  assert.deepEqual(result.statuses, ["playable", "playable", "unconfirmed", "unconfirmed"]);
  assert.equal(result.sameItems, true, "Preparation preserves the edition's original item references and order");
  assert.equal(result.untouched, true);
  assert.equal(result.playerSource, null, "Preflight probes must leave the user's visible player untouched");
  assert.equal(result.mutatedCatalog, false, "Preparation uses copies, keeping ordinary discovery's records untouched");
  assert.equal(result.trace.plays, 0, "Preparation must not play audio");
  assert.equal(result.trace.presented + result.trace.stats + result.trace.restores + result.trace.events.length, 0, "Probing must not present or count discoveries");
  assert.equal(result.trace.metadata.length, 3, "Ready audio skips a provider lookup; expired/search-only rows require exact resolution");
  assert.ok(result.trace.metadata.every(call => call.options.forceLookup && call.options.timeoutMs > 0));

  result = await media.evaluate(async () => {
    const dead = addItem("Dead preview refresh", { previewUrl: "https://weekly-media.fixture.test/dead.wav" });
    const first = await prepareWeeklyEditionTracks([dead]);
    const requests = trace.metadata.length;
    const second = await prepareWeeklyEditionTracks([dead]);
    return { first: first.results[0].status, second: second.results[0].status, reused: trace.metadata.length === requests };
  });
  assert.deepEqual(result, { first: "playable", second: "playable", reused: true }, "A dead URL must refresh and pass a real probe before entering the positive cache");
  result = await media.evaluate(async () => {
    const item = addItem("Retry transient provider"); mode[item.title] = "throw";
    const first = await prepareWeeklyEditionTracks([item]); mode[item.title] = "ready";
    const second = await prepareWeeklyEditionTracks([item]);
    return [first.results[0].status, second.results[0].status];
  });
  assert.deepEqual(result, ["unconfirmed", "playable"], "Transient failures remain retryable");
  await media.close();

  const bounded = await fixture();
  result = await bounded.evaluate(async () => {
    const items = Array.from({ length: 8 }, (_, i) => addItem(`Worker exact recording ${i}`));
    const response = await prepareWeeklyEditionTracks(items);
    return { ok: response.ok, ids: response.results.map(row => row.item.id), statuses: response.results.map(row => row.status), peak: trace.peakLookups };
  });
  assert.equal(result.ok, true);
  assert.deepEqual(result.ids, Array.from({ length: 6 }, (_, i) => `Worker exact recording ${i}`));
  assert.ok(result.statuses.every(status => status === "playable"));
  assert.ok(result.peak <= 2, "At most two provider/media preparation workers may run together");
  await bounded.close();

  const canceled = await fixture();
  await canceled.evaluate(() => {
    const item = addItem("Old account exact recording"); mode[item.title] = "pending";
    window.pendingPreparation = prepareWeeklyEditionTracks([item]);
  });
  await canceled.waitForFunction(() => Boolean(gates["Old account exact recording"]));
  result = await canceled.evaluate(async () => {
    recommendationSessionGeneration++; profile = "profile-b";
    gates["Old account exact recording"]();
    const response = await pendingPreparation;
    return { ok: response.ok, reason: response.reason, results: response.results.length, cached: weeklyEditionPreviewCache.size, presented: trace.presented };
  });
  assert.deepEqual(result, { ok: false, reason: "canceled", results: 0, cached: 0, presented: 0 });
  await canceled.close();

  const timeout = await fixture();
  result = await timeout.evaluate(async () => {
    const item = addItem("Provider missed deadline"); mode[item.title] = "pending";
    const started = performance.now();
    const response = await Promise.race([
      prepareWeeklyEditionTracks([item]),
      new Promise(resolve => setTimeout(() => resolve({ testDeadlineExceeded: true }), 22000))
    ]);
    const elapsed = performance.now() - started;
    gates[item.title]();
    await new Promise(resolve => setTimeout(resolve, 100));
    return { ok: response.ok, status: response.results?.[0]?.status, exceeded: Boolean(response.testDeadlineExceeded), elapsed, cached: weeklyEditionPreviewCache.size, presented: trace.presented };
  });
  assert.equal(result.exceeded, false, "A provider that never settles must not hold edition preparation indefinitely");
  assert.equal(result.ok, true); assert.equal(result.status, "unconfirmed");
  assert.ok(result.elapsed < 21000);
  assert.equal(result.cached + result.presented, 0, "A late provider result after the deadline must not enter the ready cache or presentation history");
  await timeout.close();

  const bridge = await fixture();
  result = await bridge.evaluate(async () => {
    const item = addItem("Bridge exact recording", { previewUrl: "https://weekly-media.fixture.test/ready.wav" });
    const response = await openWeeklyEditionTrack(item, { isCurrent: () => allowed });
    return { response, readyState: trackPreview.readyState, duration: trackPreview.duration, trace, busy: recommendationRunBusy };
  });
  assert.equal(result.response.ok, true);
  assert.ok(result.readyState >= 2 && result.duration > 0, "The bridge must await actual media readiness, beyond a route-shaped success");
  assert.equal(result.trace.presented, 1); assert.equal(result.trace.stats, 1);
  assert.deepEqual(result.trace.events, ["weekly_track_opened"]);
  assert.equal(result.trace.renderOptions[0].exactRecordingOnly, true);
  assert.equal(result.trace.renderOptions[0].deferRetry, false, "A detached 520ms retry cannot be counted as the bridge's playback result");
  assert.equal(result.busy, false);
  await bridge.locator("#playFixture").click();
  await bridge.waitForFunction(() => trackPreview.currentTime > 0.2, null, { timeout: 3000 });
  assert.ok(await bridge.evaluate(() => trackPreview.currentTime > 0.2), "The user-selected exact recording must advance through actual media playback");
  result = await bridge.evaluate(async () => {
    const before = trace.presented;
    renderFails = true;
    const item = addItem("Media render failed", { previewUrl: "https://weekly-media.fixture.test/ready.wav" });
    const response = await openWeeklyEditionTrack(item);
    return { response, presented: trace.presented - before, cached: weeklyEditionPreviewCache.has(weeklyEditionItemKey(item)), busy: recommendationRunBusy };
  });
  assert.deepEqual(result, { response: { ok: false, reason: "unavailable" }, presented: 0, cached: false, busy: false });
  await bridge.close();

  const deferred = await fixture();
  await deferred.setContent('<section id="previewPanel"><p id="previewStatus"></p><audio id="trackPreview"></audio><p id="listeningPrompt"></p><button id="previewPlayBtn"></button></section>');
  await deferred.evaluate(() => {
    const noop = () => {}, no = () => false, none = async () => null;
    Object.assign(window, {
      previewPanel: document.getElementById("previewPanel"), previewStatus: document.getElementById("previewStatus"),
      trackPreview: document.getElementById("trackPreview"), listeningPrompt: document.getElementById("listeningPrompt"),
      previewPlayBtn: document.getElementById("previewPlayBtn"), recommendationPreviewRenderToken: 0,
      FAST_PREVIEW_PROBE_TIMEOUT_MS: 120, PREVIEW_PROBE_TIMEOUT_MS: 120, FAST_PREVIEW_PROBE_LIMIT: 1,
      FAST_RECOMMENDATION_PREVIEW_TIMEOUT_MS: 120, FAST_OPTIONAL_API_TIMEOUT_MS: 120,
      currentRecommendation: { artist: "Edition Artist", song: "Unavailable exact recording", style: "house" },
      weeklyRecommendsController: null, prewarmedSwipeTrackKeys: new Set(), activePlayback: { type: "none" },
      bpmInfo: null, energyInfo: null, releaseInfo: null, durationInfo: null, catalogInfo: null, youtubeLink: null,
      youtubePreviewSearchAttempt: 0, setPreviewPrimaryPlaybackState: noop, setTrackPreviewVisualState: noop,
      syncYouTubePreviewAttemptForTrack: noop, preferredEmbeddedAutoplaySource: () => "", previewAutoplayRequested: () => true,
      trackHasReliableAudioPreview: no, trackHasExternalPlayableFallback: no, hasReliableBpmForTrack: no,
      trackHasFastListenRoute: no, resolvePreviewForTrack: none, getTrackMetadata: () => ({}), sanitizeLabel: () => "",
      renderNowPlayingGenre: noop, resolveYouTubeVideoFromApi: none, trackHasDirectSoundCloudTrack: no,
      resolveSoundCloudEmbedForTrack: none, trackHasDirectYouTubeVideo: no, youtubePreviewCanRetry: no,
      trackHasVerifiedImmediateAudioPreview: no, showFixedPreviewPlayers: () => ({ anyAvailable: false, anyReady: false, availableSources: [] }),
      setYouTubePreviewActionState: noop, syncSoundCloudPreviewActionForTrack: noop, syncBandcampPreviewActionForTrack: noop,
      availableExternalPlatforms: () => [], buildSoundCloudTrackLink: () => "", renderedPreviewHasPlaybackRoute: no,
      renderTrackCardSignals: noop, renderRecommendationTrust: noop, t: key => key, renderCount: 0,
      pickPlayableArtistPreviewFallback: async () => { throw new Error("Exact edition replay attempted artist substitution"); }
    });
  });
  const renderStart = app.indexOf("async function renderPreview(");
  const renderEnd = app.indexOf("function visiblePreviewFrameHasSource(", renderStart);
  await deferred.addScriptTag({ content: `${app.slice(renderStart, renderEnd)}\nconst actualRenderPreviewForPreparation = renderPreview; renderPreview = (...args) => { renderCount++; return actualRenderPreviewForPreparation(...args); };` });
  assert.equal(await deferred.evaluate(() => renderPreview(currentRecommendation, { fast: true, exactRecordingOnly: true, autoplay: false, deferRetry: false })), false);
  await deferred.waitForTimeout(650);
  assert.equal(await deferred.evaluate(() => renderCount), 1, "The actual renderer must honor disabled deferred retries, preventing an unobserved late success or failure");
  await deferred.close();

  console.log("Weekly preview preparation passed: browser-decoded exact audio, expired/dead URL recovery, strict version identity, retry/cache, bounded workers, canceled profiles, and presentation only after media readiness.");
} finally {
  await browser.close();
}
