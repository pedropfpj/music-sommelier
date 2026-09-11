import assert from "node:assert/strict";
import { createRequire } from "node:module";
import fs from "node:fs";
import vm from "node:vm";
const require = createRequire(import.meta.url);
const core = require("../daily-djs.js");
const app = fs.readFileSync(new URL("../app.js", import.meta.url), "utf8");
const index = fs.readFileSync(new URL("../index.html", import.meta.url), "utf8");
const iosBuild = fs.readFileSync(new URL("./build-ios-web.mjs", import.meta.url), "utf8");
const native = fs.readFileSync(new URL("../ios/App/App/SonicBridgeViewController.swift", import.meta.url), "utf8");
let checks = 0;
function test(name, fn) { fn(); checks += 1; console.log(`✓ ${name}`); }
const day = (offset = 0) => new Date(2026, 7, 28 + offset, 12);
const catalog = Array.from({ length: 120 }, (_, index) => ({
  key: `dj-${index}`, artist: `DJ ${index}`, title: `Live set ${index}`,
  url: `https://www.youtube.com/watch?v=${String(index).padStart(11, "0")}`,
  style: index < 45 ? "techno" : index < 90 ? "house" : "psy",
  styleLabel: index < 45 ? "Techno" : index < 90 ? "House" : "Psytrance",
  family: index < 90 ? "techno-house" : "psy", platform: "YouTube"
}));
const initial = core.createState(null, "user-a");
initial.preferences = ["techno"];
const choose = (state = initial, offset = 0, extra = {}) => core.selectDaily({ catalog, state, now: day(offset), ...extra });
const first = choose();

test("three unique DJs: two taste matches and an exploration", () => {
  assert.equal(first.selection.items.length, 3);
  assert.equal(new Set(first.selection.items.map((item) => item.artistKey)).size, 3);
  assert.ok(first.selection.items.slice(0, 2).every((item) => item.style === "techno" && item.reason === "preference"));
  assert.notEqual(first.selection.items[2].style, "techno");
  assert.equal(first.selection.items[2].kind, "explore");
});
test("deterministic for the same day, seed and catalog, regardless of input order", () => {
  assert.deepEqual(choose().selection, first.selection);
  assert.deepEqual(choose(initial, 0, { catalog: [...catalog].reverse() }).selection, first.selection);
});
test("refresh, likes and preference edits do not replace today's published selection", () => {
  const changed = core.recordFeedback(first.state, first.selection.items[0], "pass");
  changed.preferences = ["psy"];
  const result = choose(changed);
  assert.equal(result.cached, true);
  assert.deepEqual(result.selection, first.selection);
});
test("next local day rotates and excludes recently shown artists", () => {
  const second = choose(first.state, 1);
  const seen = new Set(first.selection.items.map((item) => item.artistKey));
  assert.ok(second.selection.items.every((item) => !seen.has(item.artistKey)));
  assert.equal(second.state.history.length, 2);
  assert.equal(second.selection.date, "2026-08-29");
});
test("day keys follow the local calendar, including month boundaries", () => {
  assert.equal(core.dayKey(new Date(2026, 7, 31, 23, 59)), "2026-08-31");
  assert.equal(core.dayKey(new Date(2026, 8, 1, 0, 0)), "2026-09-01");
  assert.throws(() => core.dayKey("bad-date"));
});
test("each profile has an independent selection seed and history", () => {
  const other = core.createState(null, "user-b");
  other.preferences = ["psy"];
  assert.equal(other.history.length, 0);
  assert.notDeepEqual(choose(other).selection, first.selection);
  assert.equal(initial.history.length, 0, "selection must not mutate its input");
});
test("known and rejected artists stay out, including aliases with accents/case", () => {
  const blocked = catalog.slice(0, 100).map((item) => item.artist.toUpperCase());
  const result = choose(initial, 0, { signals: { blockedArtists: blocked.slice(0, 50), knownArtists: blocked.slice(50) } });
  assert.ok(result.selection.items.every((item) => Number(item.key.slice(3)) >= 100));
});
test("likes and explicit feedback personalize future days", () => {
  const cold = core.createState(null, "cold");
  const liked = choose(cold, 0, { signals: { likedStyles: ["house", "house", "house"] } });
  assert.ok(liked.selection.items.slice(0, 2).every((item) => item.style === "house" && item.reason === "likes"));
  const state = core.recordFeedback(cold, catalog[110], "like");
  const result = choose(state);
  assert.ok(result.selection.items.slice(0, 2).every((item) => item.style === "psy"));
  assert.ok(result.selection.items.every((item) => item.artist !== catalog[110].artist));
});
test("feedback changes are reversible and mutually exclusive per DJ", () => {
  let state = core.recordFeedback(initial, catalog[0], "like");
  state = core.recordFeedback(state, catalog[0], "known");
  assert.equal(state.feedback.length, 1);
  assert.equal(state.feedback[0].action, "known");
  state = core.recordFeedback(state, catalog[0], "known");
  assert.equal(state.feedback.length, 0);
});
test("sets are deduplicated by both artist and URL", () => {
  const duplicates = [catalog[0], { ...catalog[0], key: "another-set", url: catalog[1].url }, { ...catalog[0], key: "mirror", artist: "Another name" }];
  assert.equal(choose(initial, 0, { catalog: duplicates }).selection.items.length, 1);
});
test("unsafe URLs and search links never become recommendations", () => {
  for (const url of ["javascript:alert(1)", "http://soundcloud.com/a/b", "https://youtube.com.evil.test/watch?v=abcdefghijk", "https://youtube.com/results?search_query=dj", "https://soundcloud.com/search/sounds", "https://evil.test/set", "https://user:pass@soundcloud.com/a/b", "https://soundcloud.com:8443/a/b"]) assert.equal(core.safeSetUrl(url), "");
  assert.equal(core.safeSetUrl("https://youtu.be/abcdefghijk?t=3"), "https://www.youtube.com/watch?v=abcdefghijk");
  assert.equal(core.safeSetUrl("https://soundcloud.com/artist/set?utm_source=x"), "https://soundcloud.com/artist/set");
});
test("video headlines and full albums do not masquerade as DJ recommendations", () => {
  const invalid = [
    { ...catalog[0], artist: "HiTech Mix ● A name" },
    { ...catalog[1], artist: "Techno DJ Set" },
    { ...catalog[2], title: "Producer - Full Album" }
  ];
  assert.equal(choose(initial, 0, { catalog: invalid }).selection.items.length, 0);
});
test("empty and small catalogs degrade without inventing DJs or filling duplicates", () => {
  const empty = choose(initial, 0, { catalog: [] });
  assert.equal(empty.selection.items.length, 0);
  assert.equal(empty.state.history.length, 0);
  assert.equal(choose(empty.state).selection.items.length, 3, "catalog recovery must work");
  assert.equal(choose(initial, 0, { catalog: catalog.slice(0, 2) }).selection.items.length, 2);
  const small = choose(initial, 0, { catalog: catalog.slice(0, 3) });
  assert.ok(choose(small.state, 1, { catalog: catalog.slice(0, 3) }).selection.items.every((item) => item.reason === "refresh"));
});
test("history is bounded to 30 actual selections and feedback to 600 artists", () => {
  let state = initial;
  for (let index = 0; index < 45; index += 1) state = choose(state, index).state;
  assert.equal(state.history.length, 30);
  for (let index = 0; index < 650; index += 1) state = core.recordFeedback(state, { ...catalog[0], artist: `Test ${index}` }, "pass");
  assert.equal(state.feedback.length, 600);
});
test("invalid saved state, dates, links and duplicate days are sanitized", () => {
  assert.equal(core.createState({ version: 2, history: [first.selection] }).history.length, 0);
  const state = core.createState({ version: 1, history: [first.selection, first.selection, { date: "2026-02-31", items: first.selection.items }, { date: "2026-08-27", items: [{ ...first.selection.items[0], url: "javascript:alert(1)" }] } ] });
  assert.equal(state.history.length, 1);
  assert.deepEqual(core.createState(JSON.parse(JSON.stringify(first.state))), first.state);
});
test("existing manual DJ discovery and free controls remain present", () => {
  for (const id of ["djIntentPanel", "djDiscoveryShuffleBtn", "djSwipeLikeBtn", "djSwipePassBtn"]) assert.ok(index.includes(`id="${id}"`));
  assert.ok(
    app.includes('DAILY_DJ_STORAGE_KEY,\n  DAILY_RADAR_STORAGE_KEY,\n  DAILY_LIKE_STORAGE_KEY,\n  STORAGE_KEY'),
    "profile deletion must include DJ, radar and like daily data"
  );
  for (const name of ["daily-djs.js", "daily-djs-ui.js", "daily-djs.css"]) assert.ok(index.includes(name) && iosBuild.includes(`copyPath("${name}")`));
});

const accessStart = app.indexOf("async function dailyDjPreviewAccess()");
const accessEnd = app.indexOf("function ensureDailyDjRecommendationReady()", accessStart);
async function access(overrides = {}) {
  const sandbox = vm.createContext({
    isNativeAppRuntime: () => false, isAppStoreRuntimeMode: () => false, isLocalDevelopmentHost: () => false,
    isNativeIosRuntime: () => false, capacitorPlugin: () => null,
    authHasOnlineSession: () => false, adminAccessState: { verified: false },
    refreshAdminAccess: async () => false, hasPremiumAccess: () => false,
    window: { location: { protocol: "https:" }, SONIC_SEARCH_AI_CONFIG: { premiumUnlocked: true } }, ...overrides
  });
  vm.runInContext(app.slice(accessStart, accessEnd), sandbox);
  return sandbox.dailyDjPreviewAccess();
}
assert.equal(await access(), "unavailable");
assert.equal(await access({ authHasOnlineSession: () => true, adminAccessState: { verified: true }, hasPremiumAccess: () => true }), "premium");
assert.equal(await access({ isLocalDevelopmentHost: () => true }), "preview");
assert.equal(await access({ isLocalDevelopmentHost: () => true, isAppStoreRuntimeMode: () => true }), "unavailable");
assert.equal(await access({ isNativeAppRuntime: () => true, isNativeIosRuntime: () => true, capacitorPlugin: () => ({ status: async () => ({ developmentPreview: true }) }) }), "preview");
assert.equal(await access({ isNativeAppRuntime: () => true, isNativeIosRuntime: () => true, capacitorPlugin: () => ({ status: async () => ({ developmentPreview: false }) }) }), "unavailable");
assert.equal(await access({ isNativeAppRuntime: () => true, isNativeIosRuntime: () => true, capacitorPlugin: () => ({ status: async () => { throw new Error("offline"); } }) }), "unavailable");
console.log("✓ access accepts verified memberships, fails closed in production, and ignores old premium flags");
assert.match(native, /#if DEBUG\s+return true\s+#else\s+return false/);
assert.doesNotMatch(native, /guard developmentPreview else/);
assert.match(native, /CAPPluginMethod\(name: "configureWeekly"/);
assert.match(native, /"available": true/);
assert.match(native, /UNCalendarNotificationTrigger\(dateMatching: components, repeats: true\)/);
assert.match(native, /removePendingNotificationRequests\(withIdentifiers: \[self.dailyReminderID\]\)/);
assert.match(native, /removePendingNotificationRequests\(withIdentifiers: \[self.weeklyReminderID\]\)/);
console.log("✓ native curation reminders are opt-in, cancellable, and release-ready");

const recoveryStart = app.indexOf("async function recoverDjPreviewAfterYoutubeError(");
const recoveryEnd = app.indexOf("function handleDjYoutubePlayerError(", recoveryStart);
assert.ok(recoveryStart > 0 && recoveryEnd > recoveryStart);
async function recover(source, code = 100, duringWait = null) {
  const replacement = { id: "replacement", name: "Another DJ" };
  const sandbox = vm.createContext({
    currentDjRecommendation: { id: "chosen", name: "Chosen DJ", setUrl: catalog[0].url },
    currentDjRecommendationSource: source, djYoutubeRecoveryBusy: false,
    djRecommendationKey: (seed) => seed.id, youtubeVideoIdFromUrl: () => "00000000000",
    unavailableDjPreviewKeys: new Set(), djPreviewMeta: {}, djSwipeStatus: {}, recovery: null,
    sonicTinyCopy: (pt) => pt, djPreviewBlockedCopy: () => "Video unavailable",
    pickDjRecommendation: () => replacement, showToast: () => {}
  });
  sandbox.setDjPreviewRecovery = (value) => { sandbox.recovery = value; };
  sandbox.waitMs = async () => { if (duringWait) duringWait(sandbox); };
  sandbox.selectDjRecommendation = (seed) => { sandbox.currentDjRecommendation = seed; };
  vm.runInContext(app.slice(recoveryStart, recoveryEnd), sandbox);
  const replaced = await sandbox.recoverDjPreviewAfterYoutubeError(code, "00000000000");
  return { sandbox, replaced };
}
for (const code of [2, 5, 100, 101, 150, 153]) {
  const { sandbox, replaced } = await recover("daily", code);
  assert.equal(replaced, false);
  assert.equal(sandbox.currentDjRecommendation.name, "Chosen DJ");
  assert.equal(sandbox.recovery.tone, "blocked");
  assert.match(sandbox.djSwipeStatus.textContent, /Mantivemos o DJ escolhido/);
}
const manualRecovery = await recover("manual");
assert.equal(manualRecovery.replaced, true);
assert.equal(manualRecovery.sandbox.currentDjRecommendation.name, "Another DJ");
const switchedToDaily = await recover("manual", 100, (sandbox) => { sandbox.currentDjRecommendationSource = "daily"; });
assert.equal(switchedToDaily.replaced, false, "an old manual recovery must not replace a newly selected daily DJ");
assert.equal(switchedToDaily.sandbox.currentDjRecommendation.name, "Chosen DJ");
assert.match(app, /selectDjRecommendation\(seed, \{ source: "daily" \}\)/);
console.log("✓ blocked daily videos keep the chosen DJ; manual recovery still works, including an in-flight switch");
console.log(`Daily DJ tests passed (${checks + 3} groups).`);
