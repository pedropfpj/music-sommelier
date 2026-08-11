#!/usr/bin/env node

import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const rootDir = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");

async function read(relativePath) {
  return readFile(path.join(rootDir, relativePath), "utf8");
}

const [
  buildScript,
  webIndex,
  nativeIndex,
  webApp,
  nativeApp
] = await Promise.all([
  read("scripts/build-ios-web.mjs"),
  read("www/index.html"),
  read("ios/App/App/public/index.html"),
  read("www/app.min.js"),
  read("ios/App/App/public/app.min.js")
]);

assert.equal(nativeIndex, webIndex, "The Xcode index must match the freshly built iOS index");
assert.equal(nativeApp, webApp, "The Xcode JavaScript must match the freshly built iOS bundle");

const buildId = buildScript.match(/const appStoreBuildId = "([^"]+)";/)?.[1] || "";
assert.ok(buildId, "The iOS build must declare an App Store build id");
assert.ok(nativeApp.includes(buildId), "The copied App Store JavaScript must contain the current build id");

const assetVersions = [...nativeIndex.matchAll(/(?:styles\.min\.css|sonic-ios-runtime\.js|app\.min\.js)\?v=([^"]+)/g)]
  .map((match) => match[1]);
assert.ok(assetVersions.length >= 4, "The iOS index must version every shipped runtime asset");
assert.deepEqual(
  [...new Set(assetVersions)],
  [buildId],
  "Every iOS runtime asset must use the current build id so WebKit cannot reuse the previous bundle"
);

for (const marker of ["swipe_like", "swipe_pass", "previewTrackKey", "about:blank"]) {
  assert.ok(
    nativeApp.includes(marker),
    `The copied App Store bundle is missing the playback transition marker: ${marker}`
  );
}

console.log(`iOS playback bundle passed: ${buildId} is copied, cache-busted, and transition-safe.`);
