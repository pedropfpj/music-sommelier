#!/usr/bin/env node

import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import vm from "node:vm";

const app = await readFile(new URL("../app.js", import.meta.url), "utf8");
const functions = app.slice(app.indexOf("function soundSystemListeningStyle("), app.indexOf("function renderSpiritInsight("));
const styleAction = app.slice(app.indexOf("async function runSwipeStyleRecommendation("), app.indexOf("async function runRecommendation("));
const labels = { tech_house: "Tech House", techno: "Techno", dark_psy: "Dark Psy" };
const state = { entries: [], allowed: true, calls: [], language: "pt", tab: "profile", generate: null };
const noop = () => {};
const control = () => ({ value: "old-filter" });
const button = { textContent: "", disabled: false, setAttribute: noop };
const context = vm.createContext({
  console,
  spiritProfileStyleEntries: () => state.entries,
  selectableSwipeStyle: (style) => labels[style] ? style : "",
  styleLabelByValue: (style) => labels[style] || style,
  likedTrackHistory: [],
  sonicTinyCopy: (pt, en, es) => ({ pt, en, es }[state.language]),
  soundSystemListenBtn: button,
  soundSystemListenHint: { textContent: "" },
  soundSystemHistoryTitle: { textContent: "" },
  soundSystemHistoryText: { textContent: "" },
  soundSystemListeningBusy: false,
  recommendationRunBusy: false,
  canUseMusicDiscovery: () => state.allowed,
  showPremiumDiscoveryLimit: () => state.calls.push("access-limit"),
  setActiveAppTab: (tab) => { state.tab = tab; },
  swipeHeroSurpriseBtn: { focus: () => state.calls.push("discovery-focus") },
  topSwipeCard: { focus: () => state.calls.push("result-focus") },
  primeAudioForDiscoveryGesture: () => state.calls.push("prime-audio"),
  feedbackMessage: { textContent: "" },
  showToast: (text) => state.calls.push(text),
  t: (key) => key,
  STYLE_BPM_RULES: Object.fromEntries(Object.keys(labels).map((style) => [style, {}])),
  styleEl: control(), contextEl: control(), energyEl: control(), bpmEl: control(), vocalsEl: control(),
  discoveryModeEl: { checked: false },
  styleInfoDismissed: true,
  renderStyleInfoBubble: noop, applyGenreVibeTheme: noop, renderSwipeStyleRail: noop,
  currentRecommendation: { artist: "Earlier Artist", song: "Earlier Track", style: "techno" },
  discoveryInteractionNow: () => 0,
  swipeUserAnchoredStyle: "",
  tryPresentInteractionBudgetRecommendation: () => false,
  generateRecommendationWithOverlay: async (prefs, options) => {
    state.calls.push({ prefs: { ...prefs }, options: { ...options } });
    if (state.generate) return state.generate(prefs);
    context.currentRecommendation = { artist: "New Artist", song: "New Track", style: prefs.style };
    return true;
  },
  recommendationFailureMessage: () => "No matching track available",
  lastPrefs: null,
  rerollBtn: { disabled: true },
  eventsPanel: null, eventsIntro: null, eventsCalendar: null, eventsList: null, detailsPanel: null,
  resultPanel: { classList: { remove: noop } },
  scrollResultPanelIntoView: noop, savePreferences: noop
});
vm.runInContext(`${functions}\n${styleAction}`, context);
const api = vm.runInContext("({ soundSystemListeningStyle, soundSystemHistoryEvidence, soundSystemHistoryCopy, renderSoundSystemListening, startSoundSystemListening })", context);
const requests = () => state.calls.filter((call) => call?.prefs);

state.entries = [{ style: "unsupported", score: 99 }, { style: "tech_house", score: 8 }, { style: "techno", score: 2 }];
assert.equal(api.soundSystemListeningStyle(), "tech_house", "Use the strongest real signal supported by the existing style controls");
api.renderSoundSystemListening();
assert.equal(button.textContent, "Ouvir meu Sound System");
assert.match(context.soundSystemListenHint.textContent, /Tech House/);
assert.equal(await api.startSoundSystemListening(), true);
assert.equal(state.tab, "discover");
assert.equal(requests().length, 1);
assert.deepEqual(requests()[0].prefs, { style: "tech_house", context: "", energy: "", bpm: "", vocals: "" });
assert.equal(context.styleEl.value, "tech_house");
assert.equal(context.bpmEl.value, "", "Unrelated manual constraints must not contradict the profile route");
assert.equal(context.discoveryModeEl.checked, true);
assert.equal(context.lastPrefs.style, "tech_house");
assert.ok(state.calls.indexOf("prime-audio") < state.calls.findIndex((call) => call?.prefs), "Preserve the original user gesture before recommendation work");
assert.ok(state.calls.includes("result-focus"));

state.calls = [];
state.entries = [];
state.tab = "profile";
api.renderSoundSystemListening();
assert.equal(button.textContent, "Começar a descobrir");
assert.equal(await api.startSoundSystemListening(), false);
assert.equal(state.tab, "discover");
assert.equal(requests().length, 0, "No evidence must not invent a style or generate an alleged profile match");
assert.ok(state.calls.includes("discovery-focus"));
state.entries = [{ style: "techno", score: -1 }];
assert.equal(api.soundSystemListeningStyle(), "");

state.calls = [];
state.entries = [{ style: "tech_house", score: 1 }];
state.allowed = false;
state.tab = "profile";
assert.equal(await api.startSoundSystemListening(), false);
assert.equal(state.tab, "profile");
assert.deepEqual(state.calls, ["access-limit"]);
state.allowed = true;
context.recommendationRunBusy = true;
assert.equal(await api.startSoundSystemListening(), false);
assert.equal(requests().length, 0);
context.recommendationRunBusy = false;

let release;
state.generate = () => new Promise((resolve) => { release = resolve; });
state.calls = [];
const pending = api.startSoundSystemListening();
assert.equal(button.disabled, true);
assert.equal(context.soundSystemListeningBusy, true);
assert.equal(await api.startSoundSystemListening(), false);
assert.equal(requests().length, 1, "Repeated clicks must not start parallel discoveries");
release(false);
assert.equal(await pending, false);
assert.equal(button.disabled, false);
assert.equal(context.soundSystemListeningBusy, false);
assert.ok(state.calls.includes("No matching track available"), "Reuse the existing recommendation failure feedback");
state.generate = () => { throw new Error("fixture failure"); };
assert.equal(await api.startSoundSystemListening(), false);
assert.equal(context.feedbackMessage.textContent, "feedbackError");
assert.equal(button.disabled, false);
state.generate = null;

const history = Array.from({ length: 20 }, (_, index) => ({
  key: `track-${index}`,
  style: index < 10 ? (index < 7 ? "tech_house" : "techno") : (index < 12 ? "tech_house" : "techno"),
  likedAt: new Date(Date.UTC(2026, 10, 9, 12) - index * 86400000).toISOString()
}));
assert.equal(api.soundSystemHistoryEvidence(history.slice(0, 19)), null);
assert.equal(api.soundSystemHistoryEvidence(history.map((entry) => ({ ...entry, likedAt: "" }))), null, "Migrated likes without dates cannot support a timeline claim");
const before = JSON.stringify(history);
const evidence = api.soundSystemHistoryEvidence([...history].reverse().concat([
  { style: "dark_psy", likedAt: "invalid" }, { style: "dark_psy", likedAt: "" }
]));
assert.deepEqual(JSON.parse(JSON.stringify(evidence)), { label: "Tech House", recentCount: 7, previousCount: 2, batchSize: 10 });
assert.equal(JSON.stringify(history), before, "Explanations must not rewrite the saved history");
for (const language of ["pt", "en", "es"]) {
  state.language = language;
  const copy = api.soundSystemHistoryCopy(evidence);
  assert.match(copy, /Tech House/);
  assert.match(copy, /7/);
  assert.match(copy, /2/);
  assert.doesNotMatch(copy, /%|caus|evolu|changed your|cambió tu/i, "Counts describe saved evidence without invented causality or confidence");
  assert.match(api.soundSystemHistoryCopy(null), /20/);
  api.renderSoundSystemListening();
  assert.notEqual(button.textContent, "");
}

console.log("Sound System listening passed: real style route, existing filters, empty/access/busy/failure states and dated-history evidence in three languages.");
