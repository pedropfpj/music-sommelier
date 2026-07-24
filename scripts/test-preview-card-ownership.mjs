#!/usr/bin/env node

import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import path from "node:path";
import vm from "node:vm";
import { fileURLToPath } from "node:url";

const rootDir = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const appSource = await readFile(path.join(rootDir, "app.js"), "utf8");

function functionSource(name) {
  const marker = `function ${name}`;
  const markerIndex = appSource.indexOf(marker);
  assert.ok(markerIndex >= 0, `Missing function: ${name}`);
  const signatureEnd = appSource.indexOf(") {", markerIndex);
  assert.ok(signatureEnd >= 0, `Missing function body: ${name}`);
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
    if (depth === 0) return appSource.slice(markerIndex, index + 1);
  }
  throw new Error(`Unclosed function: ${name}`);
}

function fakeAudio() {
  return {
    dataset: {},
    src: "",
    currentSrc: "",
    currentTime: 0,
    paused: false,
    loadCount: 0,
    pause() {
      this.paused = true;
    },
    removeAttribute(name) {
      if (name === "src") {
        this.src = "";
        this.currentSrc = "";
      }
    },
    load() {
      this.loadCount += 1;
      this.currentSrc = this.src;
    }
  };
}

const trackA = { artist: "Artist A", song: "Track A" };
const trackB = { artist: "Artist B", song: "Track B" };
const player = fakeAudio();
const context = {
  trackPreview: player,
  currentRecommendation: trackB,
  recommendationPreviewRenderToken: 2
};

vm.runInNewContext(
  [
    "normalize",
    "recommendationTrackKey",
    "resetTrackPreviewElement",
    "commitTrackPreviewSource",
    "trackPreviewElementMatchesTrack"
  ].map(functionSource).join("\n") +
    "; this.commit = commitTrackPreviewSource;" +
    " this.matches = trackPreviewElementMatchesTrack;" +
    " this.reset = resetTrackPreviewElement;",
  context
);

assert.equal(
  context.commit(trackA, "https://audio.example/track-a.mp3", 1),
  false,
  "A stale render must not assign its URL to the visible player"
);
assert.equal(player.src, "", "The stale URL must leave the visible player untouched");

assert.equal(
  context.commit(trackB, "https://audio.example/track-b.mp3", 2),
  true,
  "The current render must be allowed to commit its own preview"
);
assert.equal(player.currentSrc, "https://audio.example/track-b.mp3");
assert.equal(context.matches(trackB), true, "The committed player must belong to the visible card");
assert.equal(context.matches(trackA), false, "A different card must never inherit the committed player");

context.currentRecommendation = trackA;
context.recommendationPreviewRenderToken = 3;
assert.equal(
  context.commit(trackB, "https://audio.example/stale-track-b.mp3", 2),
  false,
  "A late completion from the previous card must be ignored"
);
assert.equal(
  player.currentSrc,
  "https://audio.example/track-b.mp3",
  "Ignoring a stale completion must not overwrite the player"
);

context.reset(player);
assert.equal(player.dataset.previewTrackKey, undefined);
assert.equal(player.dataset.previewRenderToken, undefined);

console.log("Preview ownership contract passed: stale async results cannot cross-wire card audio.");
