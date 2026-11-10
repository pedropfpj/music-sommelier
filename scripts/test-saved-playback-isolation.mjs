import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import vm from "node:vm";

const source = await readFile(process.env.SONIC_SAVED_PLAYBACK_APP_PATH || new URL("../app.js", import.meta.url), "utf8");
const from = source.indexOf("async function openSavedLibraryTrack(");
const to = source.indexOf("function renderLikedTrackHistory(", from);
assert.ok(from >= 0 && to > from);
const runtime = source.slice(from, to);
const target = { artist: "Saved artist", song: "Saved recording", style: "house" };
const key = track => track ? `${track.artist}::${track.song}`.toLowerCase() : "";

function harness({ available = false } = {}) {
  const state = { profile: "profile-a", calls: [], release: null, reject: null };
  const button = { disabled: false, textContent: "Listen here" };
  const context = vm.createContext({
    recommendationRunBusy: false,
    swipeFeedbackBusy: false,
    firstRecommendationBusy: false,
    recommendationSessionGeneration: 0,
    recommendationSessionIsCurrent: generation => generation === context.recommendationSessionGeneration,
    sessionProfileKey: () => state.profile,
    currentRecommendation: null,
    catalog: available ? [target] : [],
    CURATED_FRIENDLY_OPENING_TRACKS: [],
    lastPrefs: null,
    recommendationTrackKey: key,
    normalize: value => value.toLowerCase(),
    isTrackEligibleForRecommendation: track => track?.eligible !== false,
    hydrateExternalDatasetPackInBackground: () => new Promise((resolve, reject) => { state.release = resolve; state.reject = reject; }),
    waitForPromiseWithTimeout: promise => promise,
    prepareExplicitPreviewAudio: () => state.calls.push("prepare-audio"),
    stopAllActivePlayback: () => state.calls.push("stop"),
    setActiveAppTab: tab => state.calls.push(`tab:${tab}`),
    restoreRecommendationSurfaceSnapshot: snapshot => { context.currentRecommendation = snapshot.track; state.calls.push("restore"); },
    trackRecommendationEvent: event => state.calls.push(event),
    document: { getElementById: () => ({ scrollIntoView: () => state.calls.push("scroll") }) },
    discoveryExperienceCopy: () => ({ opening: "Opening…", play: "Listen here", unavailable: "Saved recording unavailable" }),
    showToast: message => state.calls.push(message)
  });
  vm.runInContext(runtime, context);
  return { context, state, button, open: () => context.openSavedLibraryTrack({ key: key(target), style: target.style }, button) };
}

{
  const { context: c, state, button, open } = harness({ available: true });
  const pending = open();
  assert.equal(state.calls[0], "prepare-audio", "A cached replay must preserve the explicit playback gesture before any await");
  await pending;
  assert.equal(c.currentRecommendation, target);
  assert.ok(state.calls.includes("saved_track_replayed"));
  assert.equal(c.recommendationRunBusy, false);
  assert.equal(button.disabled, false);
  assert.equal(button.textContent, "Listen here");
}
for (const mode of ["account-switch", "same-account-new-session", "late-error"]) {
  const { context: c, state, button, open } = harness();
  const pending = open();
  assert.equal(c.recommendationRunBusy, true);
  assert.equal(button.disabled, true);
  c.recommendationSessionGeneration++;
  if (mode === "account-switch") state.profile = "profile-b";
  // The newly activated session has started its own independent request.
  c.recommendationRunBusy = true;
  c.catalog = [target];
  if (mode === "late-error") state.reject(new Error("Old provider request failed"));
  else state.release();
  await pending;
  assert.equal(c.recommendationRunBusy, true, `${mode}: an old replay must not release the new session's request lock`);
  assert.equal(c.currentRecommendation, null, `${mode}: an old replay must not paint a card in the activated session`);
  assert.ok(!state.calls.includes("restore"));
  assert.ok(!state.calls.includes("Saved recording unavailable"), "A late failure must not show an error for the new session");
  assert.equal(button.disabled, false, "Only the captured old library button is cleaned up locally");
}
{
  const { context: c, state, button, open } = harness();
  const pending = open();
  state.release();
  await pending;
  assert.equal(c.currentRecommendation, null);
  assert.ok(state.calls.includes("Saved recording unavailable"));
  assert.equal(c.recommendationRunBusy, false);
  assert.equal(button.disabled, false);
}
{
  const { context: c, state, open } = harness();
  const pending = open();
  const newerTrack = { artist: "Another artist", song: "Newer choice", style: "techno" };
  c.currentRecommendation = newerTrack;
  c.catalog = [target];
  state.release();
  await pending;
  assert.equal(c.currentRecommendation, newerTrack, "A delayed saved replay must not replace a newer explicit choice");
  assert.ok(!state.calls.includes("restore"));
}
console.log("Saved playback isolation passed: explicit cached replay, unavailable recovery, late account/reconnect/error callbacks preserve the active session lock and newer track.");
