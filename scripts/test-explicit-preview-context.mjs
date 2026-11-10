import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";

const { chromium } = await import(process.env.SONIC_PLAYWRIGHT_MODULE || "playwright");
const source = await readFile(process.env.SONIC_PREVIEW_CONTEXT_APP_PATH || new URL("../app.js", import.meta.url), "utf8");
function between(start, end) {
  const from = source.indexOf(start);
  const to = source.indexOf(end, from);
  assert.ok(from >= 0 && to > from, `Missing runtime function: ${start}`);
  return source.slice(from, to);
}
const renderSource = between("async function renderPreview(", "function visiblePreviewFrameHasSource(");
const recoverySource = between("async function recoverCurrentPreviewAfterPlaybackIssue(", "function renderDiscovery(");
const browser = await chromium.launch({ headless: true, ...(process.env.SONIC_CHROMIUM_EXECUTABLE ? { executablePath: process.env.SONIC_CHROMIUM_EXECUTABLE } : {}) });

async function fixture({ exact = false } = {}) {
  const page = await browser.newPage();
  // Exercise the actual browser functions against an audio element and DOM.
  // Only provider/player boundaries are replaced; no network or audio is used.
  await page.setContent('<section id="previewPanel"><p id="previewStatus"></p><audio id="trackPreview"></audio><p id="listeningPrompt"></p><button id="previewPlayBtn"></button></section>');
  await page.evaluate(({ exact }) => {
    const noop = () => {};
    const no = () => false;
    const none = async () => null;
    const track = { artist: "Edition Artist", song: "Exact Edition Recording", style: "house", label: "Fixture" };
    window.previewCalls = { renders: [], completed: 0, artistFallbacks: 0, autoplay: 0, replacements: 0, unavailable: 0 };
    Object.assign(window, {
      previewPanel: document.getElementById("previewPanel"),
      previewStatus: document.getElementById("previewStatus"),
      trackPreview: document.getElementById("trackPreview"),
      listeningPrompt: document.getElementById("listeningPrompt"),
      previewPlayBtn: document.getElementById("previewPlayBtn"),
      currentRecommendation: track,
      lastPrefs: { style: "house" },
      currentDiscovery: null,
      recommendationPreviewRenderToken: 0,
      previewRecoveryBusy: false,
      previewRecoveryToken: 0,
      FAST_PREVIEW_PROBE_TIMEOUT_MS: 120,
      PREVIEW_PROBE_TIMEOUT_MS: 120,
      FAST_PREVIEW_PROBE_LIMIT: 1,
      FAST_RECOMMENDATION_PREVIEW_TIMEOUT_MS: 120,
      FAST_OPTIONAL_API_TIMEOUT_MS: 120,
      bpmInfo: null, energyInfo: null, releaseInfo: null, durationInfo: null, catalogInfo: null,
      youtubeLink: null, youtubePreviewSearchAttempt: 0,
      activePlayback: { type: "none" },
      prewarmedSwipeTrackKeys: new Set(),
      discoveryModeEl: { checked: false },
      weeklyRecommendsController: {
        requiresExactRecording: () => exact,
        playbackUnavailable: () => { window.previewCalls.unavailable++; }
      },
      friendsPlaybackMatches: () => false,
      friendsRequiresExactRecording: () => false,
      recommendationTrackKey: item => `${item.artist}::${item.song}`,
      setPreviewPrimaryPlaybackState: noop,
      setTrackPreviewVisualState: noop,
      stopAllActivePlayback: noop,
      syncYouTubePreviewAttemptForTrack: noop,
      preferredEmbeddedAutoplaySource: () => "",
      previewAutoplayRequested: () => true,
      trackHasReliableAudioPreview: no,
      trackHasExternalPlayableFallback: no,
      hasReliableBpmForTrack: no,
      trackHasFastListenRoute: no,
      resolvePreviewForTrack: none,
      waitForPromiseWithTimeout: promise => promise,
      previewCandidatesForTrack: () => [],
      createTrackPreviewProbeElement: () => document.createElement("audio"),
      pickPlayablePreviewSource: async () => "",
      resetTrackPreviewElement: noop,
      registerPreviewCandidate: noop,
      getTrackMetadata: () => ({ releaseDate: "", duration: "" }),
      sanitizeLabel: () => "Fixture",
      formatBpmLine: () => "",
      energyLabelByValue: () => "",
      renderNowPlayingGenre: noop,
      formatCatalogInfo: () => "",
      resolveYouTubeVideoFromApi: none,
      trackHasDirectSoundCloudTrack: no,
      resolveSoundCloudEmbedForTrack: none,
      trackHasDirectYouTubeVideo: no,
      youtubePreviewCanRetry: no,
      normalizePreviewUrl: value => value || "",
      trackHasVerifiedImmediateAudioPreview: no,
      commitTrackPreviewSource: no,
      pickPlayableArtistPreviewFallback: async () => { window.previewCalls.artistFallbacks++; return null; },
      showFixedPreviewPlayers: () => ({ anyAvailable: false, anyReady: false, availableSources: [] }),
      fixedPreviewStatusMessage: () => "",
      setYouTubePreviewActionState: noop,
      syncSoundCloudPreviewActionForTrack: noop,
      syncBandcampPreviewActionForTrack: noop,
      availableExternalPlatforms: () => [],
      buildSoundCloudTrackLink: () => "",
      attemptRenderedPreviewAutoplay: async () => { window.previewCalls.autoplay++; return false; },
      renderedPreviewHasPlaybackRoute: no,
      renderTrackCardSignals: noop,
      renderRecommendationTrust: noop,
      t: key => key,
      captureRecommendationSurfaceSnapshot: () => ({ track, prefs: { style: "house" } }),
      ownedTrackPreviewSource: () => "https://fixture.invalid/failed-preview.mp3",
      weeklyEditionPreviewCache: new Map(),
      trackStillActive: item => item === window.currentRecommendation,
      removePreviewCandidate: noop,
      removeArtistPreviewOption: noop,
      adjustTrackPreviewIssueSignal: noop,
      adjustPreviewReliabilitySignal: noop,
      pickPlayableReplacementForPrefs: async () => { window.previewCalls.replacements++; return null; },
      renderRecommendation: noop,
      renderDiscovery: noop,
      registerRecommendationDelivery: noop,
      refreshSuggestionQueue: noop,
      clearFailedRecommendationSurface: noop
    });
  }, { exact });
  await page.addScriptTag({ content: `${renderSource}\n${recoverySource}\nconst actualRenderPreview = renderPreview; renderPreview = async function(track, options = {}) { window.previewCalls.renders.push({ ...options }); try { return await actualRenderPreview(track, options); } finally { window.previewCalls.completed++; } };` });
  return page;
}

try {
  const exact = await fixture();
  await exact.evaluate(() => renderPreview(currentRecommendation, { fast: true, autoplay: false, exactRecordingOnly: true }));
  await exact.waitForFunction(() => window.previewCalls.completed === 2);
  let calls = await exact.evaluate(() => window.previewCalls);
  assert.equal(Boolean(calls.renders[1].fast), false, "The deferred retry must complete resolution instead of scheduling another fast retry");
  assert.equal(calls.renders[1].autoplay, false, "The delayed retry must preserve a silent comments/OAuth restore");
  assert.equal(calls.renders[1].exactRecordingOnly, true, "The delayed retry must preserve the edition's exact recording");
  assert.equal(calls.artistFallbacks, 0, "An unavailable edition recording must never use another song by the artist");
  assert.equal(calls.autoplay, 0, "Neither the immediate render nor deferred retry may autoplay after a silent restore");
  await exact.close();

  const comments = await fixture();
  await comments.evaluate(() => renderPreview(currentRecommendation, { fast: true, autoplay: false }));
  await comments.waitForFunction(() => window.previewCalls.completed === 2);
  calls = await comments.evaluate(() => window.previewCalls);
  assert.equal(calls.renders[1].autoplay, false);
  assert.equal(calls.autoplay, 0, "Ordinary fallback recovery must still respect autoplay:false");
  await comments.close();

  const ordinary = await fixture();
  await ordinary.evaluate(() => renderPreview(currentRecommendation));
  calls = await ordinary.evaluate(() => window.previewCalls);
  assert.equal(calls.artistFallbacks, 1, "The new edition restriction must preserve ordinary discovery's fallback behavior");
  assert.equal(calls.autoplay, 1, "An ordinary explicit listen retains the existing requested-autoplay path");
  await ordinary.close();

  const recovery = await fixture({ exact: true });
  await recovery.evaluate(() => recoverCurrentPreviewAfterPlaybackIssue("error"));
  calls = await recovery.evaluate(() => window.previewCalls);
  assert.equal(calls.renders.length, 0, "A late weekly media error must require explicit exact preflight, not automatic fuzzy resolution");
  assert.equal(calls.artistFallbacks, 0);
  assert.equal(calls.replacements, 0, "A weekly playback failure must not silently replace the edition recording");
  assert.equal(calls.unavailable, 1, "The edition queue must receive an explicit unavailable result");
  await recovery.evaluate(() => { previewRecoveryBusy = true; return recoverCurrentPreviewAfterPlaybackIssue("error"); });
  assert.equal(await recovery.evaluate(() => previewCalls.unavailable), 2, "Late weekly errors cannot be hidden by another recovery's busy flag");
  await recovery.close();

  const friendRecovery = await fixture();
  await friendRecovery.evaluate(() => { friendsRequiresExactRecording = () => true; });
  await friendRecovery.evaluate(() => recoverCurrentPreviewAfterPlaybackIssue("error"));
  calls = await friendRecovery.evaluate(() => window.previewCalls);
  assert.equal(calls.replacements, 0, "An explicitly chosen friend recording remains exact after its private context is revoked");
  assert.equal(calls.artistFallbacks, 0);
  await friendRecovery.evaluate(() => renderPreview(currentRecommendation, { fast: true, autoplay: false, deferRetry: false }));
  calls = await friendRecovery.evaluate(() => window.previewCalls);
  assert.equal(calls.artistFallbacks, 0, "The renderer must preserve the exact friend recording too");
  await friendRecovery.close();

  const ordinaryRecovery = await fixture();
  await ordinaryRecovery.evaluate(() => recoverCurrentPreviewAfterPlaybackIssue("error"));
  calls = await ordinaryRecovery.evaluate(() => window.previewCalls);
  assert.equal(calls.artistFallbacks, 1);
  assert.equal(calls.replacements, 1, "Ordinary discovery must keep its existing replacement recovery");
  assert.equal(calls.unavailable, 0);
  await ordinaryRecovery.close();
  console.log("Explicit preview context passed: actual deferred browser renders retain silent/exact options, weekly failures never substitute recordings, ordinary discovery fallback and requested playback remain available.");
} finally {
  await browser.close();
}
