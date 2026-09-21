#!/usr/bin/env node

import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { createContext, runInContext } from "node:vm";

const app = await readFile(new URL("../app.js", import.meta.url), "utf8");
const bridge = await readFile(new URL("../ios/App/App/SonicBridgeViewController.swift", import.meta.url), "utf8");
const start = app.indexOf("// StoreKit review requests are deliberately separate from reaction buttons.");
const end = app.indexOf("function trackRecommendationEvent(", start);
assert.ok(start >= 0 && end > start, "native review milestone block must exist");
assert.match(bridge, /registerPluginInstance\(SonicAppReviewsPlugin\(\)\)/);
assert.match(bridge, /AppStore\.requestReview\(in: scene\)/);
assert.match(bridge, /SKStoreReviewController\.requestReview\(in: scene\)/);
assert.match(app, /recordNativeReviewMilestone\(eventName, track\)/);
assert.match(app, /startNativeReviewMilestones\(\)/);

let now = 1_800_000_000_000;
let requests = 0;
let nextTimer = 0;
let contentHidden = false;
let overlayOpen = false;
const playback = { state: "stopped" };
const timers = new Map();
const listeners = new Map();
const storage = new Map();
const document = {
  hidden: false,
  addEventListener(name, listener) { listeners.set(name, listener); },
  querySelector() { return overlayOpen ? {} : null; }
};
const context = createContext({
  Date: { now: () => now },
  document,
  window: {
    setTimeout(callback) { const id = ++nextTimer; timers.set(id, callback); return id; },
    clearTimeout(id) { timers.delete(id); }
  },
  localStorage: {
    getItem(key) { return storage.get(key) ?? null; },
    setItem(key, value) { storage.set(key, String(value)); }
  },
  appContent: { classList: { contains: () => contentHidden } },
  activePlayback: playback,
  isNativeIosRuntime: () => true,
  recommendationTrackKey: (track) => track.key,
  capacitorPlugin(name) {
    if (name === "SonicAppReviews") return { async request() { requests += 1; return { requested: true }; } };
    return null;
  }
});
runInContext(app.slice(start, end), context);
const execute = (code) => runInContext(code, context);
const record = (event, key) => execute(`recordNativeReviewMilestone(${JSON.stringify(event)}, ${JSON.stringify({ key })})`);
const resume = () => {
  document.hidden = true;
  listeners.get("visibilitychange")();
  document.hidden = false;
  listeners.get("visibilitychange")();
};

execute("startNativeReviewMilestones()");
record("preview_played", "a");
record("preview_played", "a"); // A replay of the same track is one preview in this session.
record("preview_played", "b");
record("track_liked", "a");
record("track_disliked", "b");
assert.ok([...storage.keys()].every((key) => key.startsWith("sonic_search:")), "erase-local-data must cover review milestones");
assert.equal(JSON.parse(storage.values().next().value).previews, 2);
resume();
assert.equal(timers.size, 0, "first session must not ask for a review");

now += 25 * 60 * 60 * 1000;
execute("startNativeReviewMilestones()");
record("preview_played", "c");
record("preview_played", "d");
record("preview_played", "e");
record("track_disliked", "e");
resume();
assert.equal(timers.size, 0, "two sessions must not be enough");

now += 25 * 60 * 60 * 1000;
execute("startNativeReviewMilestones()");
resume();
assert.equal(timers.size, 0, "do not request in the session that qualifies");

now += 5 * 60 * 60 * 1000;
execute("startNativeReviewMilestones()");
assert.equal(requests, 0, "do not request on launch");
resume();
assert.equal(timers.size, 1, "request may be scheduled after returning to the app");
contentHidden = true;
let callback = timers.values().next().value;
timers.clear();
await callback();
assert.equal(requests, 0, "never interrupt onboarding or hidden app content");
contentHidden = false;
resume();
playback.state = "playing";
callback = timers.values().next().value;
timers.clear();
await callback();
assert.equal(requests, 0, "never interrupt audio playback");
playback.state = "stopped";
resume();
overlayOpen = true;
callback = timers.values().next().value;
timers.clear();
await callback();
assert.equal(requests, 0, "never interrupt a modal or recommendation search");
overlayOpen = false;
resume();
callback = timers.values().next().value;
timers.clear();
await callback();
assert.equal(requests, 1);
resume();
assert.equal(timers.size, 0, "cooldown prevents repeated requests");

console.log("Native review prompt: neutral milestone, deferred request and cooldown passed.");
