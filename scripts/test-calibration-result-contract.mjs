import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import vm from "node:vm";

const source = await readFile(process.env.SONIC_CALIBRATION_APP_PATH || new URL("../app.js", import.meta.url), "utf8");
function between(start, end) {
  const from = source.indexOf(start), to = source.indexOf(end, from);
  assert.ok(from >= 0 && to > from, `Missing function block: ${start}`);
  return source.slice(from, to);
}
const runtime = [
  between("function initialTasteCalibrationCopy(", "function renderInitialTasteCalibrationUi("),
  between("function initialTasteCalibrationPreferences(", "async function loadInitialTasteCalibrationFromCloud("),
  between("function continueAfterInitialTasteCalibration(", "function skipOrCancelInitialTasteCalibration("),
  between("function recommendationContextKey(", "function styleScopedEligibleTracks("),
  between("function prefsFromManualControls(", "async function runSurpriseRecommendation(")
].join("\n");
const filters = { style: "tech_house", context: "social", energy: "mid", bpm: "122-128", vocals: "instrumental" };
const calibration = { experience: "familiar", goal: "track", mood: "groovy", exploration: "balanced" };
const oldTrack = { artist: "Earlier artist", song: "Earlier recording", style: "tech_house" };
const nextTrack = { artist: "Next artist", song: "Next recording", style: "tech_house" };

function harness() {
  const state = { fast: null, generate: null, primary: null, dj: null, calls: [], timers: [], saved: 0, enters: [] };
  const noop = () => {};
  const context = vm.createContext({
    console, Date, Promise,
    currentLanguage: "pt",
    currentRecommendation: oldTrack,
    currentDjRecommendation: null,
    recommendationSessionGeneration: 0,
    recommendationRunBusy: false,
    recommendationSessionIsCurrent: generation => generation === context.recommendationSessionGeneration,
    recommendationTrackKey: track => track ? `${track.artist}::${track.song}` : "",
    isTrackEligibleForRecommendation: track => Boolean(track?.artist && track?.song && track.eligible !== false),
    normalizeRecommendationPrefs: prefs => ({ ...prefs }),
    selectedPreferenceCount: prefs => Object.values(prefs).filter(Boolean).length,
    discoveryModeEl: { checked: true },
    styleEl: { value: filters.style }, contextEl: { value: filters.context }, energyEl: { value: filters.energy },
    bpmEl: { value: filters.bpm }, vocalsEl: { value: filters.vocals },
    lastPrefs: null,
    swipeUserAnchoredStyle: "",
    discoveryInteractionNow: () => 0,
    tryPresentInteractionBudgetRecommendation: request => {
      state.calls.push({ kind: "fast", prefs: { ...request.prefs } });
      return state.fast ? state.fast(request) : false;
    },
    generateRecommendationWithOverlay: async (prefs, options) => {
      state.calls.push({ kind: "generate", prefs: { ...prefs }, options });
      return state.generate ? state.generate(prefs) : false;
    },
    t: key => key,
    styleLabelByValue: style => style,
    playUiSfx: name => state.calls.push({ kind: "sfx", name }),
    recommendationFailureMessage: () => "No verified track; try again.",
    presentRecommendationFailure: ({ generation }) => {
      if (generation !== context.recommendationSessionGeneration) return false;
      context.feedbackMessage.textContent = context.recommendationFailureMessage();
      context.showToast(context.feedbackMessage.textContent);
      return false;
    },
    feedbackMessage: { textContent: "" },
    showToast: text => state.calls.push({ kind: "toast", text }),
    rerollBtn: { disabled: true },
    eventsPanel: null, eventsIntro: null, eventsCalendar: null, eventsList: null, detailsPanel: null, resultPanel: null,
    scrollResultPanelIntoView: noop,
    applyStyleFallbackMessage: () => "",
    applyBpmFallbackMessage: () => "",
    savePreferences: () => { state.saved++; },
    normalizeInitialTasteCalibration: value => ({ ...value }),
    initialTasteCalibrationContinuation: { targetTab: "profile" },
    safeAppTabName: tab => tab || "discover",
    beginSonicFirstValueWindow: noop,
    hideInitialTasteCalibrationScreen: noop,
    markUsageGuideAcknowledged: noop,
    enterAppFromWelcome: options => state.enters.push(options),
    window: { setTimeout: (callback, ms) => { state.timers.push({ callback, ms }); return state.timers.length; } },
    activateDjIntent: async () => state.dj ? state.dj() : false,
    djSeedHasPlayablePreview: seed => seed?.playable === true,
    runPrimaryRecommendationAction: async () => state.primary ? state.primary() : context.runManualFilterSurprise(),
    initialTasteCalibrationState: { ...calibration },
    initialTasteCalibrationBusy: false,
    initialTasteCalibrationMode: "initial",
    tasteCalibrationStatus: { textContent: "" },
    renderInitialTasteCalibrationStep: noop,
    writeInitialTasteCalibrationLocal: value => { context.initialTasteCalibrationState = { ...value }; return context.initialTasteCalibrationState; },
    updateControlValue: (control, value) => { control.value = value; },
    updateBpmOptionsForSelectedStyle: noop,
    renderStyleInfoBubble: noop,
    applyGenreVibeTheme: noop,
    styleInfoDismissed: true,
    trackBetaEvent: noop,
    socialState: { session: null },
    socialConfigReady: () => false,
    renderInitialTasteCalibrationProfileCard: noop
  });
  vm.runInContext(runtime, context);
  return {
    context, state,
    async timer(ms) {
      const index = state.timers.findIndex(timer => timer.ms === ms);
      assert.ok(index >= 0, `Missing scheduled ${ms}ms transition`);
      const [timer] = state.timers.splice(index, 1);
      timer.callback();
      await new Promise(resolve => setImmediate(resolve));
    }
  };
}
const readyToasts = state => state.calls.filter(call => call.kind === "toast" && /Seu primeiro resultado|Your first result|Tu primer resultado/.test(call.text));

for (const mode of ["false", "missing", "same", "invalid", "throw"]) {
  const { context: c, state } = harness();
  state.generate = () => {
    if (mode === "throw") throw new Error("fixture-provider-detail-must-not-appear");
    if (mode === "missing") c.currentRecommendation = null;
    if (mode === "invalid") c.currentRecommendation = { ...nextTrack, eligible: false };
    return mode !== "false";
  };
  assert.equal(await c.runManualFilterSurprise(), false, `${mode} must never report an uncommitted filtered recommendation as success`);
  assert.equal(c.feedbackMessage.textContent, "No verified track; try again.");
  assert.equal(state.saved, 0);
}
{
  const { context: c, state } = harness();
  state.generate = () => { c.currentRecommendation = nextTrack; return true; };
  assert.equal(await c.runManualFilterSurprise(), true);
  assert.deepEqual(state.calls.find(call => call.kind === "generate").prefs, filters);
  assert.equal(state.calls.find(call => call.kind === "generate").options.allowKnownFallback, false);
  assert.deepEqual(JSON.parse(JSON.stringify(c.lastPrefs)), filters);
  assert.equal(c.bpmEl.value, filters.bpm);
  assert.equal(c.vocalsEl.value, filters.vocals);
  assert.equal(state.saved, 1);
}
{
  const { context: c, state } = harness();
  state.fast = () => { c.currentRecommendation = nextTrack; return true; };
  assert.equal(await c.runManualFilterSurprise(), true);
  assert.equal(state.calls.filter(call => call.kind === "generate").length, 0, "An actual instant commit must retain its synchronous fast path");
}
{
  const { context: c, state } = harness();
  c.styleEl.value = "";
  state.fast = () => { c.currentRecommendation = nextTrack; c.styleEl.value = nextTrack.style; return true; };
  assert.equal(await c.runManualFilterSurprise(), true, "Filling an unspecified style from a committed instant card is not a user filter change");
  assert.equal(state.calls.filter(call => call.kind === "generate").length, 0);
  assert.equal(c.bpmEl.value, filters.bpm);
}
{
  const { context: c, state } = harness();
  state.fast = () => true;
  state.generate = () => { c.currentRecommendation = nextTrack; return true; };
  assert.equal(await c.runManualFilterSurprise(), true, "A false-positive instant result should still allow ordinary generation recovery");
  assert.equal(state.calls.filter(call => call.kind === "generate").length, 1);
}
for (const change of ["profile", "filters"]) {
  const { context: c, state } = harness();
  let release;
  state.generate = () => new Promise(resolve => { release = resolve; });
  const pending = c.runManualFilterSurprise();
  if (change === "profile") c.recommendationSessionGeneration++;
  c.styleEl.value = "house";
  c.feedbackMessage.textContent = "New context feedback";
  c.currentRecommendation = { ...nextTrack, artist: "New profile artist" };
  release(true);
  assert.equal(await pending, false, `${change} must invalidate late success`);
  assert.equal(c.feedbackMessage.textContent, "New context feedback");
  assert.equal(c.styleEl.value, "house");
  assert.equal(state.saved, 0);
}
{
  const { context: c, state } = harness();
  c.recommendationRunBusy = true;
  assert.equal(await c.runManualFilterSurprise(), false);
  assert.equal(state.calls.length, 0);
  c.recommendationRunBusy = false;
  for (const control of [c.styleEl, c.contextEl, c.energyEl, c.bpmEl, c.vocalsEl]) control.value = "";
  assert.equal(await c.runManualFilterSurprise(), false);
  assert.equal(state.calls.length, 0);
}

for (const mode of ["false", "missing", "same", "invalid", "success", "throw"]) {
  const h = harness(), { context: c, state } = h;
  state.generate = () => {
    if (mode === "throw") throw new Error("fixture");
    if (mode === "missing") c.currentRecommendation = null;
    if (mode === "invalid") c.currentRecommendation = { ...nextTrack, eligible: false };
    if (mode === "success") c.currentRecommendation = nextTrack;
    return mode !== "false";
  };
  c.continueAfterInitialTasteCalibration(calibration, { personalized: true });
  await h.timer(180);
  assert.equal(readyToasts(state).length, mode === "success" ? 1 : 0, `${mode} calibration must announce only a valid committed track`);
}
for (const timing of ["before-start", "in-flight"]) {
  const h = harness(), { context: c, state } = h;
  let release;
  state.primary = () => new Promise(resolve => { release = resolve; });
  c.continueAfterInitialTasteCalibration(calibration, { personalized: true });
  if (timing === "in-flight") await h.timer(180);
  c.recommendationSessionGeneration++;
  c.feedbackMessage.textContent = "Other profile";
  if (timing === "before-start") await h.timer(180);
  else { c.currentRecommendation = nextTrack; release(true); await new Promise(resolve => setImmediate(resolve)); }
  assert.equal(readyToasts(state).length, 0);
  assert.equal(c.feedbackMessage.textContent, "Other profile");
  if (timing === "before-start") assert.equal(release, undefined, "A delayed calibration must not start a request in the new profile");
}
for (const mode of ["false-positive", "success", "undefined"]) {
  const h = harness(), { context: c, state } = h;
  state.dj = () => { if (mode === "success") c.currentDjRecommendation = { name: "Fixture DJ", playable: true }; return mode === "undefined" ? undefined : true; };
  c.continueAfterInitialTasteCalibration({ ...calibration, goal: "dj" }, { personalized: true });
  await h.timer(180);
  assert.equal(readyToasts(state).length, mode === "success" ? 1 : 0, "DJ calibration also needs an actual playable result");
}
for (const change of ["profile", "new-calibration", "none"]) {
  const h = harness(), { context: c, state } = h;
  const pending = c.completeInitialTasteCalibration();
  assert.equal(c.initialTasteCalibrationState.status, "completed", "Preferences may be saved even when music delivery later fails");
  assert.equal(c.styleEl.value, "tech_house");
  assert.equal(c.contextEl.value, "social");
  if (change === "profile") c.recommendationSessionGeneration++;
  if (change === "new-calibration") c.initialTasteCalibrationState = { ...calibration, mood: "intense" };
  await h.timer(360);
  assert.equal(await pending, change === "none");
  assert.equal(state.enters.length, change === "none" ? 1 : 0, "The save transition must not reopen an older calibration after its context changes");
}
console.log("Calibration result contract passed: actual manual success/failure/instant recovery, intact filters, profile/filter cancellation and honest track/DJ readiness across delayed calibration transitions.");
