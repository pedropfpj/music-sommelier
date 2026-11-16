#!/usr/bin/env node

import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { createAppRuntimeTestContext } from "./app-runtime-test-harness.mjs";

// Selection, eligibility, affinity, and catalog data remain the actual app code.
// Only network and the final player/DOM delivery are replaced at their boundaries.
const html = await readFile(new URL("../index.html", import.meta.url), "utf8");
const selector = html.match(/<select id="style"[^>]*>([\s\S]*?)<\/select>/)?.[1];
assert.ok(selector, "Use the shipped style choices rather than the harness's missing-DOM fallback");
const options = [...selector.matchAll(/<option[^>]*value="([^"]*)"/g)].map(match => ({ value: match[1] }));
const recording = track => track ? `${track.artist} — ${track.song}` : null;
const flush = async () => { for (let turn = 0; turn < 8; turn += 1) await Promise.resolve(); };

function storageFixture() {
  const values = new Map();
  return {
    values,
    getItem: key => values.get(key) ?? null,
    setItem: (key, value) => values.set(key, String(value)),
    removeItem: key => values.delete(key)
  };
}

function fresh(identity = "offline-listener", slot = null) {
  const ctx = createAppRuntimeTestContext();
  ctx.styleEl = { value: "", options };
  ctx.localStorage = storageFixture();
  ctx.sessionStorage = storageFixture();
  ctx.currentAuthUser = { mode: "login", username: identity };
  ctx.activeRecommendationSessionIdentity = ctx.recommendationSessionIdentityKey();
  ctx.openingRotationSessionIdentity = ctx.activeRecommendationSessionIdentity;
  ctx.openingRotationSlot = slot;
  ctx.openingRotationSlotSource = Number.isFinite(slot) ? "global_durable" : "";
  ctx.currentCurationUserSeed = () => `offline-install-${identity}`;
  ctx.currentCurationVisitId = () => "1";
  ctx.curationOpenSeed = `offline-open-${identity}`;
  ctx.canUseMusicDiscovery = () => true;
  ctx.playUiSfx = () => {};
  ctx.reportDiscoveryInteractionLatency = () => {};
  ctx.trackFirstRecommendationEvent = () => {};
  ctx.setInitialRecommendationBusy = () => {};
  ctx.restoreInitialRecommendationUiSafely = () => {};
  ctx.deliveries = [];
  ctx.presentInstantSwipeRecommendation = ({ track, prefs }) => {
    ctx.currentRecommendation = track;
    ctx.lastPrefs = prefs;
    ctx.deliveries.push(track);
    return true;
  };
  return ctx;
}

function observeCohort(ctx) {
  const select = ctx.openingRotationCandidateCohort;
  const state = { tracks: [], entries: [], personalized: false };
  ctx.openingRotationCandidateCohort = (entries, personalized) => {
    state.entries = entries;
    state.personalized = personalized;
    state.tracks = select(entries, personalized);
    return state.tracks;
  };
  return state;
}

function sequenceVisitor(identity, { local = storageFixture(), session = storageFixture(), slot = 0 } = {}) {
  const ctx = fresh(identity, slot);
  ctx.localStorage = local;
  ctx.sessionStorage = session;
  ctx.currentAuthUser = { mode: "visitor", username: "Visitante", providerId: identity };
  ctx.activeRecommendationSessionIdentity = ctx.recommendationSessionIdentityKey();
  ctx.openingRotationSessionIdentity = ctx.activeRecommendationSessionIdentity;
  ctx.discoveryModeEl = { checked: true };
  ctx.injectSoundCloudSupplementalSeeds();
  ctx.seedAnonymousOpeningExclusions();
  ctx.runSurpriseRecommendation = async () => false;
  ctx.presentInstantSwipeRecommendation = ctx.presentFastNegativeFeedbackRecommendation = ({ track, prefs }) => {
    assert.equal(ctx.trackBlockedByKnownSignals(track), false, "A delivered recording cannot already be known");
    assert.equal(ctx.recommendationArtistBlockedForPresentation(track), false, "A delivery cannot repeat a recent artist");
    assert.ok(ctx.trackHasInstantPlaybackRoute(track), "An instant card needs an existing playback route");
    ctx.currentRecommendation = track;
    ctx.lastPrefs = ctx.normalizeRecommendationPrefs({ ...prefs, style: prefs.style || track.style });
    ctx.deliveries.push(track);
    ctx.markRecommendationPresented(track);
    ctx.rememberAnonymousExposure(track);
    ctx.rememberAnonymousOpeningTrack(track);
    ctx.registerSwipeStyleExposure(track.style);
    ctx.suggestionQueueTracks = ctx.suggestionQueueTracks.filter(candidate => candidate !== track);
    return true;
  };
  return ctx;
}

function queueNextCards(ctx) {
  ctx.suggestionQueueTracks = ctx.buildSuggestionQueueFromPrefs(ctx.lastPrefs, ctx.currentRecommendation);
  ctx.suggestionQueueContextKey = ctx.recommendationContextKey(ctx.lastPrefs);
  for (const track of ctx.suggestionQueueTracks.filter(ctx.trackHasVerifiedImmediateAudioPreview)) {
    ctx.prewarmedSwipeTrackKeys.add(ctx.recommendationTrackKey(track));
  }
}

function meanSequenceOverlap(sequences, keyFor) {
  const sets = sequences.map(sequence => new Set(sequence.map(keyFor)));
  let shared = 0;
  let pairs = 0;
  for (const [index, entries] of sets.entries()) {
    for (const other of sets.slice(index + 1)) {
      shared += [...entries].filter(key => other.has(key)).length;
      pairs += 1;
    }
  }
  return Number((shared / pairs).toFixed(2));
}

function deferredNetwork(ctx) {
  const requests = [];
  ctx.resolveAppApiEndpoint = () => "/mock-opening-slot";
  ctx.fetch = () => { throw new Error("No external requests are permitted by this test"); };
  ctx.fetchWithTimeout = (_endpoint, options, timeoutMs) => new Promise((resolve, reject) => {
    requests.push({ options, timeoutMs, resolve, reject });
  });
  return requests;
}

function serverResponse(slot, durable = true) {
  return { ok: true, json: async () => ({ ok: true, durable, slot }) };
}

const checks = [];
async function check(name, run) {
  await run();
  checks.push(name);
  console.log(`PASS ${name}`);
}

await check("ready recordings form the rotation deck before slot selection", () => {
  const ctx = fresh("new-listener", 0);
  const cohort = observeCohort(ctx);
  ctx.pickInstantOpeningTrack();
  const expected = new Set(cohort.tracks.map(ctx.recommendationTrackKey));
  assert.ok(expected.size >= 14, "The shipped catalog must offer a meaningful ready opening cohort");
  assert.equal(cohort.personalized, false);
  assert.ok(cohort.tracks.every(track => ctx.trackHasInstantPlaybackRoute(track)));
  const selected = new Set();
  const selectedFamilies = [];
  const selectedBySlot = new Map();
  for (let slot = 0; slot < expected.size; slot += 1) {
    ctx.openingRotationSlot = slot;
    const result = ctx.pickInstantOpeningTrack();
    assert.ok(result?.track);
    selected.add(ctx.recommendationTrackKey(result.track));
    selectedFamilies.push(ctx.familyOf(result.track.style) || result.track.style);
    selectedBySlot.set(slot, recording(result.track));
  }
  assert.deepEqual(selected, expected, "Each eligible ready recording gets a slot without an ordered .find fallback");
  const independentVisitors = Math.min(5, new Set(selectedFamilies).size);
  assert.equal(new Set(selectedFamilies.slice(0, independentVisitors)).size, independentVisitors, "Consecutive clean slots open on different musical families when there are enough");
  assert.notEqual(selectedBySlot.get(8), selectedBySlot.get(11), "The reported bad slots must not collapse to the same fallback");
  console.log(JSON.stringify({ readyRecordings: expected.size, styles: new Set(cohort.tracks.map(track => track.style)).size,
    slot8: selectedBySlot.get(8), slot11: selectedBySlot.get(11) }));

  const blocked = cohort.tracks[0];
  ctx.recommendationMemory.add(ctx.recommendationTrackKey(blocked));
  ctx.pickInstantOpeningTrack();
  assert.ok(!cohort.tracks.some(track => ctx.recommendationTrackKey(track) === ctx.recommendationTrackKey(blocked)), "Known recordings remain excluded before rotation");
});

await check("opposing real taste signals constrain rotation to comparable affinity and quality", () => {
  const evidence = [];
  for (const preferredStyle of ["liquid_dnb", "house"]) {
    const ctx = fresh(`profile-${preferredStyle}`, 0);
    ctx.adaptiveModel.likedStyles.set(preferredStyle, 30);
    ctx.adaptiveModel.dislikedStyles.set(preferredStyle === "house" ? "liquid_dnb" : "house", 30);
    const cohort = observeCohort(ctx);
    ctx.pickInstantOpeningTrack();
    assert.equal(cohort.personalized, true);
    assert.ok(cohort.tracks.length > 0);
    assert.ok(cohort.tracks.every(track => track.style === preferredStyle));
    const quality = new Map(cohort.entries.map(entry => [entry.style, entry.qualityScore]));
    const qualityValues = cohort.tracks.map(track => quality.get(track.style));
    assert.ok(Math.max(...qualityValues) - Math.min(...qualityValues) <= 11);
    const selections = new Set();
    for (let slot = 0; slot < 34; slot += 1) {
      ctx.openingRotationSlot = slot;
      const { track } = ctx.pickInstantOpeningTrack();
      assert.equal(track.style, preferredStyle, "The global slot is a tie-break inside the learned cohort");
      selections.add(recording(track));
    }
    evidence.push({ signal: `${preferredStyle} +30; opposite style -30`, cohortSize: cohort.tracks.length, selections: [...selections] });
  }
  console.log(JSON.stringify({ offlineCatalogAffinityEvidence: evidence }));
});

await check("an identity-ready server prefetch supplies the primary tap without delaying player delivery", async () => {
  const ctx = fresh("server-ready");
  const requests = deferredNetwork(ctx);
  ctx.resetOpeningRotationForIdentity(ctx.activeRecommendationSessionIdentity);
  await flush();
  assert.equal(requests.length, 1, "Activation starts the current identity's prefetch before the tap");
  assert.equal(requests[0].options.credentials, "omit");
  const pending = ctx.openingRotationSlotPromise;
  requests[0].resolve(serverResponse(11));
  await pending;
  assert.equal(ctx.openingRotationSlotSource, "global_durable");
  const expected = recording(ctx.pickInstantOpeningTrack().track);
  const action = ctx.runPrimaryRecommendationAction();
  assert.equal(ctx.deliveries.length, 1, "Player delivery must occur in the original tap stack");
  assert.equal(recording(ctx.currentRecommendation), expected);
  assert.equal(await action, true);
  assert.equal(ctx.openingRotationSlotFrozen, true);
});

await check("an exceptionally early tap stays synchronous and a late slot cannot change the shown opening", async () => {
  const ctx = fresh("early-tap");
  ctx.localOpeningRotationSlot = () => 11;
  const requests = deferredNetwork(ctx);
  const action = ctx.runPrimaryRecommendationAction();
  assert.equal(ctx.deliveries.length, 1, "Do not await a pending server in the mobile audio gesture");
  assert.equal(ctx.openingRotationSlot, 11);
  assert.equal(ctx.openingRotationSlotSource, "local_crypto");
  const delivered = recording(ctx.currentRecommendation);
  assert.equal(await action, true);
  await flush();
  const pending = ctx.openingRotationSlotPromise;
  assert.equal(requests.length, 1);
  requests[0].resolve(serverResponse(0));
  await pending;
  assert.equal(ctx.openingRotationSlot, 11);
  assert.equal(ctx.openingRotationSlotSource, "local_crypto", "Diagnostics must identify the slot that actually chose the card");
  assert.equal(recording(ctx.currentRecommendation), delivered);
  assert.equal(ctx.deliveries.length, 1);
});

await check("the asynchronous initial route waits for the bounded server slot", async () => {
  const ctx = fresh("async-initial");
  const requests = deferredNetwork(ctx);
  const action = ctx.runInitialRecommendation();
  await flush();
  assert.equal(requests.length, 1);
  assert.equal(requests[0].timeoutMs, 950);
  assert.equal(ctx.deliveries.length, 0, "An asynchronous caller can use the pending server rotation");
  requests[0].resolve(serverResponse(11));
  assert.equal(await action, true);
  assert.equal(ctx.openingRotationSlot, 11);
  assert.equal(ctx.openingRotationSlotSource, "global_durable");
  assert.equal(ctx.deliveries.length, 1);
  assert.equal(recording(ctx.currentRecommendation), recording(fresh("expected", 11).pickInstantOpeningTrack().track));
});

await check("failed or nondurable responses retain a usable local opening", async () => {
  for (const failure of ["offline", "nondurable"]) {
    const ctx = fresh(failure);
    ctx.localOpeningRotationSlot = () => 8;
    const requests = deferredNetwork(ctx);
    const pending = ctx.ensureOpeningRotationSlot();
    await flush();
    if (failure === "offline") requests[0].reject(new Error("offline"));
    else requests[0].resolve(serverResponse(11, false));
    assert.equal(await pending, 8);
    assert.equal(ctx.openingRotationSlotSource, "local_crypto");
    assert.equal(await ctx.runPrimaryRecommendationAction(), true);
    assert.equal(ctx.deliveries.length, 1);
  }
});

await check("a real abort timeout bounds an unresponsive slot request", async () => {
  const ctx = fresh("timeout");
  ctx.AbortController = AbortController;
  ctx.window.setTimeout = setTimeout;
  ctx.window.clearTimeout = clearTimeout;
  ctx.resolveAppApiEndpoint = () => "/mock-opening-slot";
  ctx.localOpeningRotationSlot = () => 8;
  ctx.fetch = (_endpoint, { signal }) => new Promise((_resolve, reject) => {
    signal.addEventListener("abort", () => reject(new Error("AbortError")), { once: true });
  });
  const start = performance.now();
  assert.equal(await ctx.ensureOpeningRotationSlot({ timeoutMs: 250 }), 8);
  const elapsed = performance.now() - start;
  assert.ok(elapsed >= 200 && elapsed < 2000, `Expected a bounded 250ms abort, received ${Math.round(elapsed)}ms`);
  assert.equal(ctx.openingRotationSlotSource, "local_crypto");
});

await check("switching identity discards an old reply and starts the new profile prefetch", async () => {
  const ctx = fresh("account-a");
  const requests = deferredNetwork(ctx);
  ctx.resetOpeningRotationForIdentity(ctx.activeRecommendationSessionIdentity);
  await flush();
  const oldRequest = ctx.openingRotationSlotPromise;
  ctx.currentAuthUser = { mode: "login", username: "account-b" };
  ctx.beginRecommendationSession(ctx.currentAuthUser);
  await flush();
  assert.equal(requests.length, 2);
  const currentRequest = ctx.openingRotationSlotPromise;
  requests[0].resolve(serverResponse(0));
  assert.equal(await oldRequest, null);
  assert.equal(ctx.openingRotationSlot, null);
  requests[1].resolve(serverResponse(11));
  await currentRequest;
  assert.equal(ctx.openingRotationSlot, 11);
  assert.equal(ctx.openingRotationSlotSource, "global_durable");
  assert.equal(await ctx.runPrimaryRecommendationAction(), true);
  assert.equal(ctx.deliveries.length, 1);
});

await check("a profile switch cancels an asynchronous initial delivery", async () => {
  const ctx = fresh("initial-account-a");
  const requests = deferredNetwork(ctx);
  const attempt = ctx.runInitialRecommendation();
  await flush();
  ctx.currentAuthUser = { mode: "login", username: "initial-account-b" };
  ctx.beginRecommendationSession(ctx.currentAuthUser);
  await flush();
  requests[0].resolve(serverResponse(0));
  assert.equal(await attempt, false);
  assert.equal(ctx.deliveries.length, 0);
  requests[1].resolve(serverResponse(11));
  await ctx.openingRotationSlotPromise;
  assert.equal(ctx.firstRecommendationCompleted, false);
});

await check("fresh web visitors with the same opening slot diversify cards two through five", async () => {
  const sequences = [];
  let reference;
  for (let index = 0; index < 8; index += 1) {
    const ctx = sequenceVisitor(`cohort-${index}`);
    reference = ctx;
    for (const action of ["open", "other", "like", "pass", "other"]) {
      const sourceTrack = ctx.currentRecommendation;
      if (action === "like" || action === "pass") {
        const positive = action === "like";
        if (!positive) ctx.lastRejectedTrackKey = ctx.recommendationTrackKey(sourceTrack);
        assert.equal(await ctx.advanceAfterSwipeFeedback({
          likedTrack: sourceTrack,
          positive,
          avoidArtistName: positive ? "" : sourceTrack.artist
        }), true);
      } else {
        assert.equal(await ctx.runPrimaryRecommendationAction(), true);
      }
      if (index % 2 === 0) queueNextCards(ctx);
    }
    assert.equal(ctx.deliveries.length, 5);
    assert.equal(new Set(ctx.deliveries.map(ctx.recommendationTrackKey)).size, 5);
    ctx.deliveries.forEach((track, i) => {
      assert.ok(ctx.deliveries.slice(i + 1).every(next => !ctx.artistsShareIdentity(track.artist, next.artist)));
    });
    sequences.push(ctx.deliveries);
  }

  const trackKey = reference.recommendationTrackKey;
  const artistKey = track => reference.artistMatchKey(track.artist);
  assert.equal(new Set(sequences.map(sequence => trackKey(sequence[0]))).size, 1, "Hold opening rotation constant");
  const slots = [1, 2, 3, 4];
  const uniqueTracks = slots.map(slot => new Set(sequences.map(sequence => trackKey(sequence[slot]))).size);
  const uniqueArtists = slots.map(slot => new Set(sequences.map(sequence => artistKey(sequence[slot]))).size);
  assert.ok(uniqueTracks.every(count => count >= 3), `Distinct recordings in slots 2–5: ${uniqueTracks}`);
  assert.ok(uniqueArtists.every(count => count >= 3), `Distinct artists in slots 2–5: ${uniqueArtists}`);
  const trackOverlap = meanSequenceOverlap(sequences, trackKey);
  const artistOverlap = meanSequenceOverlap(sequences, artistKey);
  assert.ok(trackOverlap <= 3, `Mean five-card recording overlap: ${trackOverlap}`);
  assert.ok(artistOverlap <= 3, `Mean five-card artist overlap: ${artistOverlap}`);
  console.log(JSON.stringify({ sameOpeningSlot: 0, visitors: sequences.length, uniqueTracks, uniqueArtists, trackOverlap, artistOverlap }));
});

await check("the same Groovado calibration gives fresh web visitors different five-track House sequences", async () => {
  const houseRows = JSON.parse(await readFile(new URL("../data/runtime-catalog-v1/styles/house.json", import.meta.url), "utf8"));
  const sequences = [];
  const visitors = ["cedar", "ash-grove", "small-river", "reeds", "bamboo-garden", "fern", "maple-lane", "stone-bridge"];
  let reference;
  const recordingKey = track => track.catalogMetadata?.recording_id || reference.recommendationTrackKey(track);
  const artistKey = track => reference.artistMatchKey(track.artist);
  for (const [index, identity] of visitors.entries()) {
    const ctx = sequenceVisitor(identity);
    reference ??= ctx;
    ctx.mergeExternalDatasetRows(houseRows, "dataset_local_runtime_house");
    ctx.contextEl = { value: "" };
    ctx.energyEl = { value: "" };
    ctx.bpmEl = { value: "" };
    ctx.vocalsEl = { value: "" };
    ctx.updateControlValue = (control, value) => { control.value = value; };
    ctx.updateBpmOptionsForSelectedStyle = () => {};
    ctx.renderStyleInfoBubble = () => {};
    ctx.applyGenreVibeTheme = () => {};
    ctx.initialTasteCalibrationState = { status: "completed", experience: "beginner", goal: "track", mood: "groovy" };
    ctx.applyInitialTasteCalibrationPreferences();

    assert.equal(await ctx.runPrimaryRecommendationAction({ source: "initial_calibration" }), true);
    assert.equal(ctx.explicitSwipeAnchorStyle(), "", "Calibration guides the opening without setting an explicit anchor");
    assert.equal(ctx.styleEl.value, "", "The Groovado seed is not an explicit subgenre selection");
    for (const action of ["other", "like", "pass", "other"]) {
      if (index % 2 === 0) queueNextCards(ctx);
      if (action === "other") {
        assert.equal(await ctx.runPrimaryRecommendationAction(), true);
      } else {
        const sourceTrack = ctx.currentRecommendation;
        const positive = action === "like";
        if (!positive) ctx.lastRejectedTrackKey = ctx.recommendationTrackKey(sourceTrack);
        assert.equal(await ctx.advanceAfterSwipeFeedback({
          likedTrack: sourceTrack,
          positive,
          avoidArtistName: positive ? "" : sourceTrack.artist
        }), true);
      }
      assert.equal(ctx.lastPrefs.style, "house");
      assert.equal(ctx.lastPrefs.context, "social");
      assert.equal(ctx.lastPrefs.energy, "mid");
    }

    assert.equal(ctx.deliveries.length, 5);
    assert.equal(new Set(ctx.deliveries.map(recordingKey)).size, 5);
    ctx.deliveries.forEach((track, i) => {
      assert.equal(track.style, "house");
      assert.ok(ctx.trackHasVerifiedImmediateAudioPreview(track));
      assert.ok(ctx.deliveries.slice(i + 1).every(next => !ctx.artistsShareIdentity(track.artist, next.artist)));
    });
    sequences.push(ctx.deliveries);
  }

  const uniqueFirst = new Set(sequences.map(sequence => artistKey(sequence[0]))).size;
  const uniqueSecond = new Set(sequences.map(sequence => artistKey(sequence[1]))).size;
  const trackOverlap = meanSequenceOverlap(sequences, recordingKey);
  const artistOverlap = meanSequenceOverlap(sequences, artistKey);
  console.log(JSON.stringify({ calibratedVisitors: visitors.length, uniqueFirst, uniqueSecond, trackOverlap, artistOverlap }));
  assert.ok(uniqueFirst >= 3 && uniqueSecond >= 3, `Distinct House artists in slots 1 and 2: ${uniqueFirst}, ${uniqueSecond}`);
  assert.ok(trackOverlap < 2.5, `Mean calibrated House recording overlap: ${trackOverlap}`);
  assert.ok(artistOverlap < 2.5, `Mean calibrated House artist overlap: ${artistOverlap}`);
});

await check("a returning anonymous web visitor's opening and next card exclude the prior session", async () => {
  const local = storageFixture();
  const session = storageFixture();
  const first = sequenceVisitor("before-reload", { local, session });
  assert.equal(await first.runPrimaryRecommendationAction(), true);
  assert.equal(await first.runPrimaryRecommendationAction(), true);
  const reloaded = sequenceVisitor("after-reload", { local, session });
  assert.equal(reloaded.readAnonymousOpeningHistory().length, 2);
  assert.ok(first.deliveries.every(reloaded.trackBlockedByKnownSignals));
  assert.equal(await reloaded.runPrimaryRecommendationAction(), true);
  assert.equal(await reloaded.runPrimaryRecommendationAction(), true);
  assert.ok(reloaded.deliveries.every(track => first.deliveries.every(
    previous => !reloaded.artistsShareIdentity(track.artist, previous.artist)
  )));
});

await check("a reload keeps a manually selected style and ignores the style printed by open discovery", () => {
  const ctx = fresh("reload-preferences", 0);
  const track = ctx.pickInstantOpeningTrack().track;
  ctx.currentRecommendation = track;
  ctx.syncInferredStyleControl(track.style);
  const key = ctx.storageKeyForSession(ctx.STORAGE_KEY);

  ctx.savePreferences();
  assert.equal(JSON.parse(ctx.localStorage.getItem(key)).style, "");

  ctx.styleEl.value = track.style;
  ctx.savePreferences();
  assert.equal(JSON.parse(ctx.localStorage.getItem(key)).style, track.style);
  ctx.loadPreferences();
  assert.equal(ctx.styleEl.value, track.style);
  assert.equal(ctx.explicitSwipeAnchorStyle(), track.style);
});

await check("anchored feedback preserves an explicit BPM choice when the ready pool is exhausted", async () => {
  const ctx = sequenceVisitor("anchored-filter");
  const prefs = { style: "house", bpm: "110-124" };
  const eligible = ctx.pickWebOpeningSequenceTrack(prefs);
  assert.ok(eligible);
  assert.equal(eligible.style, prefs.style);
  assert.equal(ctx.trackMatchesBpmPreference(eligible, prefs.bpm), true);
  assert.equal(ctx.presentInstantSwipeRecommendation({ track: eligible, prefs }), true);
  ctx.swipeUserAnchoredStyle = prefs.style;
  // A warmed recording in the correct style is available outside the chosen range.
  const wrongBpm = ctx.catalogTracksForStyle(prefs.style).find(track =>
    ctx.trackHasVerifiedImmediateAudioPreview(track) && !ctx.trackMatchesBpmPreference(track, prefs.bpm)
  );
  assert.ok(wrongBpm);
  ctx.suggestionQueueTracks = [wrongBpm];
  ctx.prewarmedSwipeTrackKeys.add(ctx.recommendationTrackKey(wrongBpm));
  ctx.generateRecommendationWithOverlay = async fallbackPrefs => {
    assert.equal(fallbackPrefs.style, prefs.style);
    assert.equal(fallbackPrefs.bpm, prefs.bpm);
    return false;
  };
  ctx.presentRecommendationFailure = () => {};
  assert.equal(ctx.pickInstantPrimaryNextTrack(eligible, prefs.style), null);
  assert.equal(await ctx.advanceAfterSwipeFeedback({ likedTrack: eligible, positive: true }), false);
  assert.equal(await ctx.advanceAfterSwipeFeedback({ likedTrack: eligible, positive: false }), false);
  assert.equal(ctx.currentRecommendation, eligible);
  assert.equal(ctx.deliveries.length, 1);
});

await check("the primary action keeps a BPM-only filter through widening and exhaustion", async () => {
  const ctx = sequenceVisitor("bpm-only");
  const bpm = "110-124";
  const ready = ctx.catalogTracksForStyle("house").filter(track =>
    ctx.isTrackEligibleForRecommendation(track) && ctx.trackHasVerifiedImmediateAudioPreview(track)
  );
  const wrong = ready.find(track => Number(track.bpmExact) > 124);
  const correct = ready.find(track => ctx.trackMatchesBpmPreference(track, bpm));
  assert.ok(wrong && correct, "The shipped deck contains ready previews on both sides of the BPM boundary");
  ctx.bpmEl = { value: bpm };
  ctx.pickWebOpeningSequenceTrack = () => null; // Focus the shared fallback independently of the opening deck.
  ctx.catalog.splice(0, ctx.catalog.length, wrong);
  ctx.suggestionQueueTracks = [wrong];
  ctx.generateRecommendationWithOverlay = async fallbackPrefs => {
    assert.equal(fallbackPrefs.style, "");
    assert.equal(fallbackPrefs.bpm, bpm);
    return false;
  };
  let recoveries = 0;
  ctx.presentRecommendationFailure = () => { recoveries += 1; };

  assert.equal(ctx.pickInteractionBudgetTrack({ prefs: { bpm } }), null);
  assert.equal(await ctx.runPrimaryRecommendationAction(), false);
  assert.equal(ctx.deliveries.length, 0);
  assert.equal(recoveries, 1);
  assert.equal(ctx.bpmEl.value, bpm);
  assert.equal(ctx.styleEl.value, "");

  ctx.catalog.push(correct);
  assert.equal(await ctx.runPrimaryRecommendationAction(), true);
  assert.equal(ctx.currentRecommendation, correct);
  assert.equal(ctx.lastPrefs.bpm, bpm);
  assert.equal(ctx.explicitSwipeAnchorStyle(), "");
});

await check("selecting BPM without a subgenre starts the local catalog before the recommendation gesture", () => {
  const ctx = sequenceVisitor("bpm-core-prefetch");
  ctx.bpmEl = { value: "" };
  const changes = new Map();
  ctx.bind = (control, event, callback) => {
    if (control && event === "change") changes.set(control, callback);
  };
  ctx.updateWeightLabels = ctx.savePreferences = ctx.renderSuggestionQueue = () => {};
  ctx.updateBpmOptionsForSelectedStyle = () => false;
  ctx.renderStyleInfoBubble = ctx.applyGenreVibeTheme = ctx.renderSwipeStyleRail = () => {};
  let coreRequests = 0;
  ctx.hydrateExternalDatasetPackInBackground = async () => { coreRequests += 1; };
  ctx.bindPreferenceAutosave();
  changes.get(ctx.bpmEl)();
  assert.equal(coreRequests, 0, "An unrestricted opening continues to rely on idle warmup");
  ctx.bpmEl.value = "145-155";
  ctx.styleEl.value = "full_on_night";
  changes.get(ctx.bpmEl)();
  assert.equal(coreRequests, 0, "A subgenre selection keeps its style-scoped loader");
  ctx.styleEl.value = "";
  changes.get(ctx.styleEl)();
  assert.equal(coreRequests, 1, "Removing the style while BPM is set warms the cross-style catalog");
  ctx.bpmEl.value = "124-132";
  changes.get(ctx.bpmEl)();
  assert.equal(coreRequests, 2, "Selecting a tempo also warms the catalog before a swipe");
});

await check("explicit manual filters and calibration runners precede generic opening rotation", async () => {
  const filtered = fresh("manual", 0);
  filtered.styleEl.value = "liquid_dnb";
  filtered.runManualFilterSurprise = async () => "manual-filter-route";
  assert.equal(await filtered.runPrimaryRecommendationAction(), "manual-filter-route");
  assert.equal(filtered.deliveries.length, 0);

  const calibrated = fresh("calibrated", 0);
  calibrated.waitForMinimumCatalogReady = async () => ({ ready: true, status: "already_ready" });
  let selectedRunnerCalls = 0;
  const initialRunner = async () => { selectedRunnerCalls += 1; return true; };
  assert.equal(await calibrated.runPrimaryRecommendationAction({ initialRunner }), true);
  assert.equal(selectedRunnerCalls, 1);
  assert.equal(calibrated.deliveries.length, 0, "A generic instant card must not bypass the calibrated runner");
});

await check("opening history reads the current session fallback when persistent storage fails", () => {
  const ctx = fresh("storage-fallback", 0);
  const track = ctx.pickInstantOpeningTrack().track;
  ctx.localStorage = { getItem() { throw new Error("blocked"); }, setItem() { throw new Error("blocked"); } };
  ctx.rememberAnonymousOpeningTrack(track);
  const history = ctx.readAnonymousOpeningHistory();
  assert.equal(history.length, 1);
  assert.equal(history[0].trackKey, ctx.recommendationTrackKey(track));
  assert.ok(ctx.sessionStorage.getItem(ctx.openingHistoryStorageKey()));
});

await check("history merges current storage copies by latest timestamp without crossing accounts", () => {
  const ctx = fresh("history-a", 0);
  const keyA = ctx.openingHistoryStorageKey();
  ctx.localStorage.setItem(keyA, JSON.stringify([{ trackKey: "shared", at: 1 }, { trackKey: "local", at: 2 }]));
  ctx.sessionStorage.setItem(keyA, JSON.stringify([{ trackKey: "shared", at: 3 }, { trackKey: "session", at: 4 }]));
  const merged = ctx.readAnonymousOpeningHistory();
  assert.deepEqual(Array.from(merged, entry => entry.trackKey), ["session", "shared", "local"]);
  assert.equal(merged.find(entry => entry.trackKey === "shared").at, 3);
  ctx.currentAuthUser = { mode: "login", username: "history-b" };
  assert.equal(ctx.readAnonymousOpeningHistory().length, 0);
  ctx.sessionStorage.setItem(ctx.LEGACY_ANONYMOUS_OPENING_HISTORY_KEY, JSON.stringify(["legacy-guest"]));
  assert.equal(ctx.readAnonymousOpeningHistory().length, 0, "A signed profile must not absorb old guest history");
  ctx.currentAuthUser = { mode: "guest" };
  assert.deepEqual(Array.from(ctx.readAnonymousOpeningHistory(), entry => entry.trackKey), ["legacy-guest"]);
  ctx.currentAuthUser = { mode: "login", username: "history-a" };
  assert.equal(ctx.readAnonymousOpeningHistory().length, 3);
  ctx.sessionStorage.setItem(keyA, "invalid json");
  assert.equal(ctx.readAnonymousOpeningHistory().length, 2, "Malformed session data must not hide valid persistent history");
});

console.log(`${checks.length} cold-start runtime checks passed with the shipped catalog and no external requests.`);
