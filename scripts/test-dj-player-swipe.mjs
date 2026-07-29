import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import vm from "node:vm";
import { fileURLToPath } from "node:url";

const rootDir = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const appSource = fs.readFileSync(path.join(rootDir, "app.js"), "utf8");
const indexSource = fs.readFileSync(path.join(rootDir, "index.html"), "utf8");
const styleSource = fs.readFileSync(path.join(rootDir, "styles.css"), "utf8");
const vercelConfig = JSON.parse(fs.readFileSync(path.join(rootDir, "vercel.json"), "utf8"));

function sourceBetween(startMarker, endMarker) {
  const start = appSource.indexOf(startMarker);
  const end = appSource.indexOf(endMarker, start + startMarker.length);
  assert.ok(start >= 0, `Missing start marker: ${startMarker}`);
  assert.ok(end > start, `Missing end marker: ${endMarker}`);
  return appSource.slice(start, end);
}

const swipeSandbox = vm.createContext({ Math });
vm.runInContext(sourceBetween("function swipeThresholds", "function setSwipeDragVisual"), swipeSandbox);
vm.runInContext(sourceBetween("function animateSwipeCommit", "async function completeSwipeFeedback"), swipeSandbox);

const styleValues = new Map();
const swipeCard = {
  getBoundingClientRect: () => ({ width: 320 }),
  style: { setProperty: (name, value) => styleValues.set(name, value) }
};

assert.deepEqual(
  { ...swipeSandbox.swipeGestureDecision(swipeCard, 92, 7, 180) },
  { direction: "like", isMostlyHorizontal: true, shouldCommit: true, shouldHardCommit: false, readiness: 1 }
);
assert.equal(swipeSandbox.swipeGestureDecision(swipeCard, -92, 5, 180).direction, "pass");
assert.equal(swipeSandbox.swipeGestureDecision(swipeCard, -92, 5, 180).shouldCommit, true);
assert.equal(swipeSandbox.swipeGestureDecision(swipeCard, 34, 88, 180).shouldCommit, false);
assert.equal(swipeSandbox.shouldCancelSwipeForVerticalGesture(34, 88), true);

swipeSandbox.animateSwipeCommit(swipeCard, "pass");
assert.match(styleValues.get("--swipe-exit-x"), /^-/);
assert.equal(styleValues.get("--swipe-pass-opacity"), "1");
swipeSandbox.animateSwipeCommit(swipeCard, "like");
assert.doesNotMatch(styleValues.get("--swipe-exit-x"), /^-/);
assert.equal(styleValues.get("--swipe-like-opacity"), "1");

const handledYoutubeErrors = [];
const playerSandbox = vm.createContext({
  Number,
  djYoutubePendingVideoId: "pending12345",
  djYoutubePlayerVideoId: () => "active12345",
  recoverDjPreviewAfterYoutubeError: (code, videoId) => handledYoutubeErrors.push({ code, videoId })
});
vm.runInContext(sourceBetween("function handleDjYoutubePlayerError", "async function renderDjYoutubePreview"), playerSandbox);
playerSandbox.handleDjYoutubePlayerError({ data: 150, target: {} });
playerSandbox.handleDjYoutubePlayerError({ data: 42, target: {} });
assert.deepEqual(handledYoutubeErrors, [{ code: 150, videoId: "active12345" }]);

assert.match(appSource, /https:\/\/www\.youtube\.com\/iframe_api/);
assert.match(appSource, /\[2, 5, 100, 101, 150, 153\]/);
assert.match(appSource, /unavailableDjPreviewKeys\.add\(key\)/);
assert.match(appSource, /animateSwipeCommit\(djSwipeCard, direction\)/);
assert.match(indexSource, /id="djPreviewYoutubeMount"/);
assert.match(indexSource, /id="djSwipeGestureHint"/);

const djStyles = styleSource.slice(styleSource.lastIndexOf("/* DJ cinema player"));
assert.match(djStyles, /\.dj-preview-frame-wrap\s*\{[\s\S]*?aspect-ratio:\s*16\s*\/\s*9/);
assert.match(djStyles, /@media \(max-width: 620px\)/);
assert.match(djStyles, /\.dj-swipe-column\s*\{[\s\S]*?order:\s*-2/);
assert.match(djStyles, /\.dj-swipe-actions \.swipe-action-btn\s*\{\s*min-height:\s*52px/);

const cspHeader = vercelConfig.headers
  .flatMap((entry) => entry.headers || [])
  .find((header) => header.key === "Content-Security-Policy");
assert.ok(cspHeader?.value.includes("script-src"));
assert.ok(cspHeader?.value.includes("https://www.youtube.com"));

console.log("DJ player/swipe tests passed: YouTube recovery, gesture direction, and mobile hierarchy.");
