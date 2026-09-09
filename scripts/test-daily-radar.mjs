#!/usr/bin/env node

import assert from "node:assert/strict";
import { createRequire } from "node:module";

const require = createRequire(import.meta.url);
const radar = require("../daily-radar.js");
const { sanitizeState } = require("../lib/api/_daily-radar.js");

const catalog = [
  ["a1", "Anchor One", "Signal One", "deep_house", "house"],
  ["a2", "Anchor Two", "Signal Two", "deep_house", "house"],
  ["a3", "Anchor Three", "Signal Three", "deep_house", "house"],
  ["b1", "Bridge One", "Current One", "tech_house", "house"],
  ["b2", "Bridge Two", "Current Two", "tech_house", "house"],
  ["b3", "Bridge Three", "Current Three", "tech_house", "house"],
  ["w1", "Wild One", "Pulse One", "hypnotic_techno", "techno"],
  ["w2", "Wild Two", "Pulse Two", "hypnotic_techno", "techno"],
  ["w3", "Wild Three", "Pulse Three", "hypnotic_techno", "techno"]
].map(([key, artist, song, style, family]) => ({ key, artist, song, style, family, styleLabel: style }));

const signals = { preferredStyles: ["deep_house"], likedStyles: ["deep_house"] };
const first = radar.selectDaily({ catalog, state: null, signals, now: new Date("2026-09-02T12:00:00") });
const repeated = radar.selectDaily({ catalog, state: first.state, signals, now: new Date("2026-09-02T21:00:00") });
assert.equal(first.selection.items.length, 3);
assert.deepEqual(first.selection.items.map((item) => item.lane), ["anchor", "bridge", "wildcard"]);
assert.equal(new Set(first.selection.items.map((item) => item.artistKey)).size, 3);
assert.deepEqual(repeated.selection, first.selection);
assert.equal(repeated.cached, true);

const tomorrow = radar.selectDaily({ catalog, state: first.state, signals, now: new Date("2026-09-03T12:00:00") });
assert.equal(tomorrow.selection.items.length, 3);
assert.equal(tomorrow.selection.items.some((item) => first.selection.items.some((old) => old.key === item.key)), false);

const selected = first.selection.items[0];
const liked = radar.recordFeedback(first.state, selected, "like");
assert.equal(liked.feedback.find((entry) => entry.key === selected.key)?.action, "like");
const toggledOff = radar.recordFeedback(liked, selected, "like");
assert.equal(toggledOff.feedback.some((entry) => entry.key === selected.key), false);

const blocked = radar.selectDaily({ catalog, state: null, signals: { ...signals, knownTrackKeys: ["a1", "a2"] }, now: new Date("2026-09-04T12:00:00") });
assert.equal(blocked.selection.items.some((item) => ["a1", "a2"].includes(item.key)), false);

const sanitized = sanitizeState({
  version: 99,
  seed: " user ",
  history: [{ date: "2026-09-02", items: [catalog[0], catalog[0], catalog[1], catalog[2]] }],
  feedback: [{ key: "a1", action: "like" }, { key: "a1", action: "pass" }, { key: "bad", action: "erase" }]
});
assert.equal(sanitized.version, 1);
assert.equal(sanitized.history[0].items.length, 3);
assert.equal(sanitized.feedback.length, 1);
assert.equal(sanitized.feedback[0].action, "like");

console.log("Daily track radar: ok");
