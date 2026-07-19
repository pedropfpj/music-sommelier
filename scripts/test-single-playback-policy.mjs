#!/usr/bin/env node

import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import vm from "node:vm";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const rootDir = path.resolve(__dirname, "..");
const appSource = fs.readFileSync(path.join(rootDir, "app.js"), "utf8");

function extractFunction(name) {
  const marker = `function ${name}`;
  const markerIndex = appSource.indexOf(marker);
  if (markerIndex < 0) throw new Error(`Missing function: ${name}`);
  const asyncIndex = appSource.lastIndexOf("async ", markerIndex);
  const start = asyncIndex >= markerIndex - 8 ? asyncIndex : markerIndex;
  const signatureEnd = appSource.indexOf(") {", markerIndex);
  if (signatureEnd < 0) throw new Error(`Missing function body: ${name}`);
  const bodyStart = signatureEnd + 2;
  let depth = 0;
  let quote = "";
  let escaped = false;
  let lineComment = false;
  let blockComment = false;

  for (let index = bodyStart; index < appSource.length; index += 1) {
    const character = appSource[index];
    const next = appSource[index + 1];
    if (lineComment) {
      if (character === "\n") lineComment = false;
      continue;
    }
    if (blockComment) {
      if (character === "*" && next === "/") {
        blockComment = false;
        index += 1;
      }
      continue;
    }
    if (quote) {
      if (escaped) escaped = false;
      else if (character === "\\") escaped = true;
      else if (character === quote) quote = "";
      continue;
    }
    if (character === "/" && next === "/") {
      lineComment = true;
      index += 1;
      continue;
    }
    if (character === "/" && next === "*") {
      blockComment = true;
      index += 1;
      continue;
    }
    if (character === '"' || character === "'" || character === "`") {
      quote = character;
      continue;
    }
    if (character === "{") depth += 1;
    if (character === "}") depth -= 1;
    if (depth === 0) return appSource.slice(start, index + 1);
  }
  throw new Error(`Unclosed function: ${name}`);
}

function assertSourcePolicy() {
  const renderPreviewSource = extractFunction("renderPreview");
  const bootstrapAudioSource = extractFunction("bootstrapAudio");
  const previewAutoplaySource = extractFunction("previewAutoplayRequested");
  const startPreviewSource = extractFunction("startTrackPreviewPlayback");
  const soundCloudSyncSource = extractFunction("syncSoundCloudWidgetPlayback");
  const soundCloudResetSource = extractFunction("resetSoundCloudPreviewEmbed");
  const soundCloudBindingSource = extractFunction("scheduleSoundCloudWidgetPlaybackBinding");
  const preferredEmbedSource = extractFunction("preferredEmbeddedAutoplaySource");
  const resumeCurrentPreviewSource = extractFunction("resumeCurrentPreviewFromUserGesture");
  const youtubeShowSource = extractFunction("showYouTubePreviewEmbed");
  const bandcampShowSource = extractFunction("showBandcampPreviewEmbed");
  const bandcampUrlSource = extractFunction("buildBandcampEmbedUrl");
  const soundcloudShowSource = extractFunction("showSoundCloudPreviewEmbed");
  const continueFromUsageGuideSource = extractFunction("continueFromUsageGuide");
  const enterAppFromWelcomeSource = extractFunction("enterAppFromWelcome");

  assert.match(appSource, /const AUTOMATIC_TRACK_PLAYBACK_ENABLED = true;/);
  assert.match(
    continueFromUsageGuideSource,
    /enterAppFromWelcome\(\{ surprise: false, autoRecommendation: false \}\)/
  );
  assert.doesNotMatch(continueFromUsageGuideSource, /autoRecommendation:\s*true/);
  assert.match(enterAppFromWelcomeSource, /stopAllActivePlayback\(\{ reason: "app_entry" \}\)/);
  assert.match(bootstrapAudioSource, /registerAudioUnlockGestures\(\)/);
  assert.match(previewAutoplaySource, /AUTOMATIC_TRACK_PLAYBACK_ENABLED/);
  assert.match(previewAutoplaySource, /audioEnabled/);
  assert.match(renderPreviewSource, /stopAllActivePlayback\(\{ reason: "render_preview" \}\)/);
  assert.match(renderPreviewSource, /attemptRenderedPreviewAutoplay/);
  assert.ok(
    renderPreviewSource.indexOf("startPreferredEmbeddedPreviewAutoplay(track)") <
      renderPreviewSource.indexOf("await waitForPromiseWithTimeout(resolvePreviewForTrack"),
    "external autoplay should be created before the first asynchronous lookup"
  );
  assert.match(renderPreviewSource, /setPreviewPrimaryPlaybackState\("ready"\)/);
  assert.match(startPreviewSource, /!userInitiated && !automatic/);
  assert.equal((startPreviewSource.match(/\.play\s*\(/g) || []).length, 1);
  assert.doesNotMatch(startPreviewSource, /mutedFallback|setTimeout|audioEl\.muted\s*=\s*true/);

  [youtubeShowSource, bandcampShowSource, soundcloudShowSource].forEach((source) => {
    assert.match(source, /userInitiated/);
    assert.match(source, /playbackToken === playbackGeneration/);
  });
  assert.doesNotMatch(bandcampUrlSource, /autoplay=true/);
  assert.match(appSource, /const requiresExplicitPlayerTap = source === "bandcamp"/);
  assert.match(soundCloudSyncSource, /widgetGeneration !== soundcloudWidgetGeneration/);
  assert.match(soundCloudSyncSource, /userInitiated/);
  assert.match(soundCloudSyncSource, /activePlaybackMatches/);
  assert.match(soundCloudResetSource, /soundcloudWidgetGeneration \+= 1/);
  assert.match(soundCloudResetSource, /removeAttribute\("src"\)/);
  assert.match(soundCloudResetSource, /soundcloudWidgetController = null/);
  assert.match(soundCloudResetSource, /\.unbind/);
  assert.match(soundCloudBindingSource, /SOUNDCLOUD_WIDGET_BIND_TIMEOUT_MS/);
  assert.match(soundCloudBindingSource, /SOUNDCLOUD_WIDGET_BIND_RETRY_MS/);
  assert.match(soundCloudBindingSource, /bindSoundCloudWidgetPlaybackEvents/);
  assert.match(soundCloudBindingSource, /syncSoundCloudWidgetPlayback/);
  assert.ok(
    preferredEmbedSource.indexOf("trackHasDirectSoundCloudTrack") <
      preferredEmbedSource.indexOf("trackHasEmbeddableBandcampTrack"),
    "SoundCloud should be the first automatic embedded source"
  );
  assert.match(resumeCurrentPreviewSource, /startPreferredEmbeddedPreviewAutoplay/);
  assert.match(resumeCurrentPreviewSource, /attemptRenderedPreviewAutoplay/);

  assert.match(appSource, /btnPreviewPlay: "Ouvir faixa"/);
  assert.match(appSource, /btnPreviewPlay: "Listen to track"/);
  assert.match(appSource, /btnPreviewPlay: "Escuchar tema"/);
  assert.match(appSource, /trackRecommendationEvent\("preview_play_attempted"/);
  assert.match(appSource, /trackRecommendationEvent\("preview_played"/);
  assert.match(appSource, /trackPlaybackLifecycleEvent\("preview_play_failed"/);
  assert.match(appSource, /trackPlaybackLifecycleEvent\("preview_stopped"/);
}

function createStopHarness({ throwSource = "" } = {}) {
  const stopped = [];
  const fixture = (name, implementation = null) => (...args) => {
    stopped.push(name);
    if (throwSource === name) throw new Error(`${name}_fixture`);
    return implementation?.(...args);
  };
  const context = vm.createContext({
    JSON,
    String,
    Number,
    document: { documentElement: { dataset: {} } },
    window: { clearTimeout: fixture("dj_timer") },
    trackPreview: {},
    voicePlayback: { pause: fixture("voice_recording"), currentTime: 7 },
    djPreviewFrameLoadTimer: 9,
    djPreviewFrame: {
      contentWindow: { postMessage: fixture("dj_message") },
      removeAttribute: fixture("dj_frame")
    },
    currentRecommendation: { artist: "Fixture", song: "Track" },
    lastPrefs: {},
    resetTrackPreviewElement: fixture("preview"),
    resetSoundCloudPreviewEmbed: fixture("soundcloud"),
    resetYouTubePreviewEmbed: fixture("youtube"),
    resetBandcampPreviewEmbed: fixture("bandcamp"),
    stopRadioBrowserPlayer: fixture("radio"),
    stopActiveVoicePlayback: fixture("voice_effect"),
    stopVoiceMiniTrack: fixture("voice_mini"),
    clearIntroAmbientArp: fixture("ambient_timer"),
    setIntroAmbientActive: fixture("ambient"),
    stopSearchAudioPulse: fixture("search_audio"),
    trackRecommendationEvent: fixture("analytics")
  });

  vm.runInContext(`
    var playbackGeneration = 0;
    var activePlayback = { type: "none", trackKey: "", generation: 0, player: null, state: "stopped" };
    ${extractFunction("setActivePlayback")}
    ${extractFunction("activePlaybackMatches")}
    ${extractFunction("clearActivePlayback")}
    ${extractFunction("trackPlaybackLifecycleEvent")}
    ${extractFunction("stopAllActivePlayback")}
  `, context);
  return { context, stopped };
}

function activePlaybackCount(context) {
  return context.activePlayback?.type && context.activePlayback.type !== "none" ? 1 : 0;
}

function testStopAllIsIdempotentAndIsolated() {
  const harness = createStopHarness({ throwSource: "soundcloud" });
  harness.context.setActivePlayback({
    type: "soundcloud",
    trackKey: "fixture::one",
    generation: 1,
    player: {},
    state: "playing"
  });
  harness.context.stopAllActivePlayback({ reason: "transition" });
  assert.equal(activePlaybackCount(harness.context), 0);
  ["preview", "soundcloud", "youtube", "bandcamp", "radio", "voice_recording", "voice_effect", "voice_mini", "dj_frame", "ambient", "search_audio"]
    .forEach((source) => assert(harness.stopped.includes(source), `${source} was not stopped`));

  assert.doesNotThrow(() => harness.context.stopAllActivePlayback({ reason: "idempotent" }));
  assert.equal(activePlaybackCount(harness.context), 0);
}

function testEveryTransitionKeepsOneAuthority() {
  const harness = createStopHarness();
  const sources = ["preview", "soundcloud", "youtube", "bandcamp", "radio", "voice-effect", "voice-mini"];
  for (let index = 0; index < sources.length; index += 1) {
    const generation = harness.context.stopAllActivePlayback({ reason: `to_${sources[index]}` });
    harness.context.setActivePlayback({
      type: sources[index],
      trackKey: `fixture::${index}`,
      generation,
      player: { source: sources[index] },
      state: "playing"
    });
    assert(activePlaybackCount(harness.context) <= 1);
  }
  harness.context.stopAllActivePlayback({ reason: "done" });
  assert.equal(activePlaybackCount(harness.context), 0);
}

function createPreviewHarness() {
  const playResolvers = [];
  const audio = {
    currentSrc: "https://audio.example/fixture.m4a",
    src: "https://audio.example/fixture.m4a",
    currentTime: 8,
    playCalls: 0,
    pauseCalls: 0,
    getAttribute() { return this.src; },
    load() {},
    pause() { this.pauseCalls += 1; },
    play() {
      this.playCalls += 1;
      return new Promise((resolve, reject) => playResolvers.push({ resolve, reject }));
    }
  };
  const context = vm.createContext({
    Promise,
    String,
    currentRecommendation: { artist: "Fixture", song: "Track", previewUrl: audio.src },
    recommendationTrackKey: () => "fixture::track",
    syncPreviewAudioState() {},
    trackPreview: audio
  });
  vm.runInContext(`
    var playbackGeneration = 0;
    var activePlayback = { type: "none", trackKey: "", generation: 0, player: null, state: "stopped" };
    ${extractFunction("setActivePlayback")}
    ${extractFunction("activePlaybackMatches")}
    ${extractFunction("clearActivePlayback")}
    function stopAllActivePlayback() {
      playbackGeneration += 1;
      setActivePlayback({ type: "none", generation: playbackGeneration, state: "stopped" });
      return playbackGeneration;
    }
    ${extractFunction("startTrackPreviewPlayback")}
  `, context);
  return { context, audio, playResolvers };
}

async function testAutomaticPlaybackAndRapidRequests() {
  const harness = createPreviewHarness();
  const blocked = await harness.context.startTrackPreviewPlayback(harness.audio);
  assert.equal(blocked.ok, false);
  assert.equal(blocked.reason, "playback_not_requested");
  assert.equal(harness.audio.playCalls, 0);
  assert.equal(activePlaybackCount(harness.context), 0);

  const automatic = harness.context.startTrackPreviewPlayback(harness.audio, { automatic: true });
  assert.equal(harness.audio.playCalls, 1);
  harness.playResolvers[0].resolve();
  const automaticResult = await automatic;
  assert.equal(automaticResult.ok, true);
  assert.equal(activePlaybackCount(harness.context), 1);

  const first = harness.context.startTrackPreviewPlayback(harness.audio, { userInitiated: true });
  const second = harness.context.startTrackPreviewPlayback(harness.audio, { userInitiated: true });
  assert.equal(harness.audio.playCalls, 3);
  harness.playResolvers[1].resolve();
  harness.playResolvers[2].resolve();
  const [firstResult, secondResult] = await Promise.all([first, second]);
  assert.equal(firstResult.ok, false);
  assert.equal(firstResult.reason, "stale_playback");
  assert.equal(secondResult.ok, true);
  assert.equal(activePlaybackCount(harness.context), 1);
  assert.equal(harness.context.activePlayback.generation, 3);
}

function testStaleSoundCloudReadyCannotPlay() {
  const calls = { play: 0, volume: 0 };
  const widget = {
    setVolume() { calls.volume += 1; },
    play() { calls.play += 1; }
  };
  const context = vm.createContext({
    Math,
    audioVolume: 0.8,
    soundcloudWidgetGeneration: 4,
    playbackGeneration: 9,
    activePlaybackMatches({ type, generation, player }) {
      return type === "soundcloud" && generation === 9 && player === widget;
    }
  });
  vm.runInContext(extractFunction("syncSoundCloudWidgetPlayback"), context);
  context.syncSoundCloudWidgetPlayback(widget, {
    autoplay: true,
    userInitiated: true,
    playbackToken: 8,
    widgetGeneration: 3
  });
  assert.equal(calls.play, 0);
  context.syncSoundCloudWidgetPlayback(widget, {
    autoplay: true,
    userInitiated: true,
    playbackToken: 9,
    widgetGeneration: 4
  });
  assert.equal(calls.play, 1);
}

const tests = [
  ["source policy enables safe recommendation autoplay", assertSourcePolicy],
  ["central stop is idempotent and isolates failures", testStopAllIsIdempotentAndIsolated],
  ["all source transitions keep one active authority", testEveryTransitionKeepsOneAuthority],
  ["automatic playback works and rapid requests stay singular", testAutomaticPlaybackAndRapidRequests],
  ["stale SoundCloud READY callback cannot restart playback", testStaleSoundCloudReadyCannotPlay]
];

for (const [name, test] of tests) {
  await test();
  console.log(`✓ ${name}`);
}

console.log("Single playback policy tests passed.");
