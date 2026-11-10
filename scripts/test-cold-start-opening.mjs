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
  const selectedBySlot = new Map();
  for (let slot = 0; slot < expected.size; slot += 1) {
    ctx.openingRotationSlot = slot;
    const result = ctx.pickInstantOpeningTrack();
    assert.ok(result?.track);
    selected.add(ctx.recommendationTrackKey(result.track));
    selectedBySlot.set(slot, recording(result.track));
  }
  assert.deepEqual(selected, expected, "Each eligible ready recording gets a slot without an ordered .find fallback");
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
