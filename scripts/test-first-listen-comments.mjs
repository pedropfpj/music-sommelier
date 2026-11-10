import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import vm from "node:vm";

const source = readFileSync(new URL("../app.js", import.meta.url), "utf8");
const values = new Map();
const classes = new Set(["hidden"]);
const entry = {
  hidden: true,
  classList: { toggle(name, enabled) { enabled ? classes.add(name) : classes.delete(name); } },
  querySelector: () => ({ replaceChildren(node) { entry.label = node; } })
};
const label = { textContent: "" };
const storage = {
  getItem: key => values.get(key) || null,
  setItem: (key, value) => values.set(key, value),
  removeItem: key => values.delete(key)
};
const track = { artist: "Test artist", song: "Test recording", style: "house", previewUrl: "https://audio.example.test/preview.mp3" };
const context = vm.createContext({
  console, Date, Object, JSON, Number,
  document: { getElementById: id => id === "trackDiscussionEntry" ? entry : label, createTextNode: value => value },
  sessionStorage: storage,
  pendingSocialDiscussionReturn: null,
  socialDiscussionReadinessRequested: false,
  socialState: { ready: false },
  shouldHideSocialLoginForAppStore: () => false,
  ensureSocialMvpReady: async () => { context.socialState.ready = true; context.readinessCalls++; },
  readinessCalls: 0,
  currentRecommendation: null,
  catalog: [track], STYLE_BPM_RULES: { house: {} },
  socialCommentsState: { targetType: "track" },
  socialDiscussionDialog: { open: false, showModal() { this.open = true; } },
  disabled: false, signed: false, loaded: "", stopped: false,
  socialCommentsTrackTarget: value => value ? { targetType: "track", targetKey: `${value.artist}:${value.song}` } : null,
  shouldDisableSocialCommentsForAppStore() { return this.disabled; },
  sonicTinyCopy: pt => pt,
  socialDiscussionCopy: () => "Comentários e curtidas",
  currentSocialCommentTarget() { return { targetType: context.socialCommentsState.targetType, targetKey: context.socialCommentsState.targetType === "video" ? "youtube:abcdefghijk" : "track" }; },
  authHasOnlineSession: () => context.signed,
  recommendationTrackKey: value => `${value.artist}:${value.song}`,
  isTrackEligibleForRecommendation: value => value.style === "house",
  stopAllActivePlayback: () => { context.stopped = true; },
  restoreRecommendationSurfaceSnapshot: ({ track: value }) => { context.currentRecommendation = value; },
  renderPreview: async (_, options) => { assert.equal(options.autoplay, false); },
  setActiveAppTab: tab => { assert.equal(tab, "discover"); },
  loadSocialComments: async ({ targetType }) => { context.loaded = targetType; }
});
// Run the actual transition helpers; fixtures replace only browser/player boundaries.
vm.runInContext(source.slice(source.indexOf("function renderSocialDiscussionEntry"), source.indexOf("function openSocialDiscussion")), context);
context.shouldDisableSocialCommentsForAppStore = () => context.disabled;
context.renderSocialDiscussionEntry();
assert.equal(entry.hidden, true, "No comments dead end before the first track");
context.currentRecommendation = track;
context.renderSocialDiscussionEntry();
assert.equal(entry.hidden, false);
await Promise.resolve(); await Promise.resolve();
assert.equal(context.readinessCalls, 1, "A shown track requests the existing configuration promptly and only once");
assert.ok(label.textContent.includes(track.song));
context.disabled = true;
context.renderSocialDiscussionEntry();
assert.equal(entry.hidden, true, "Release controls still govern comments");
context.disabled = false;
context.rememberSocialDiscussionReturn();
assert.equal(await context.resumeSocialDiscussionAfterLogin(), false, "Never open an authenticated discussion without a session");
// A full OAuth navigation discards globals but retains this tab's session storage.
context.pendingSocialDiscussionReturn = null;
context.currentRecommendation = null;
context.signed = true;
assert.equal(await context.resumeSocialDiscussionAfterLogin(), true);
assert.equal(context.currentRecommendation.song, track.song);
assert.equal(context.loaded, "track");
assert.equal(context.socialDiscussionDialog.open, true);
assert.equal(context.stopped, true);
assert.equal(values.size, 0, "Return context is consumed once");
assert.equal(await context.resumeSocialDiscussionAfterLogin(), false);
context.socialCommentsState.targetType = "artist";
context.rememberSocialDiscussionReturn();
assert.equal(await context.resumeSocialDiscussionAfterLogin(), true);
assert.equal(context.loaded, "artist");
context.socialCommentsState.targetType = "video";
context.rememberSocialDiscussionReturn();
assert.equal(await context.resumeSocialDiscussionAfterLogin(), true);
assert.equal(context.loaded, "video");
assert.equal(context.socialCommentsState.sharedVideoId, "abcdefghijk");
values.set("sonic:discussion-return:v1", JSON.stringify({ createdAt: Date.now() - 31 * 60 * 1000, targetType: "track", track }));
assert.equal(context.readSocialDiscussionReturn(), null, "Expired return context must not hijack a later login");
values.set("sonic:discussion-return:v1", "invalid JSON");
assert.equal(context.readSocialDiscussionReturn(), null);
console.log("First listening/comments passed: contextual entry, OAuth return to exact track/artist/video, no autoplay, release gate and expiry.");
