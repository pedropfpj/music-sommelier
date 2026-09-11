#!/usr/bin/env node

import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const rootDir = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const appSource = await readFile(path.join(rootDir, "app.js"), "utf8");

assert.match(
  appSource,
  /const INITIAL_ENTRY_COMPLETED_STORAGE_KEY = "neonpulse:initialEntryCompleted:v1";/,
  "Returning-entry state needs an explicit, versioned storage key"
);

const completionSource = appSource.slice(
  appSource.indexOf("function hasCompletedInitialEntry"),
  appSource.indexOf("function markInitialEntryCompleted")
);
assert.match(
  completionSource,
  /localStorage\.getItem\(INITIAL_ENTRY_COMPLETED_STORAGE_KEY\) === "yes"/,
  "Returning visits must read the completed-entry marker"
);
assert.match(
  completionSource,
  /return hasUsageGuideAcknowledged\(\)/,
  "Existing users need a backward-compatible fast path"
);

const entrySource = appSource.slice(
  appSource.indexOf("function enterAppFromWelcome"),
  appSource.indexOf("function applySharedSpiritPayload")
);
assert.match(
  entrySource,
  /ensureLocalProfileSession\(\{ preferStored: true \}\);\s*markInitialEntryCompleted\(\);/,
  "The marker must only be written after the user actually enters the app"
);

const returningSource = appSource.slice(
  appSource.indexOf("async function resumeReturningUserExperience"),
  appSource.indexOf("function applySharedSpiritPayload")
);
assert.match(
  returningSource,
  /storedUser && storedUser\.mode !== "guest"[\s\S]*?await resumeStoredUserSession\(\)/,
  "Signed-in users must restore their stored session instead of becoming guests"
);
assert.match(
  returningSource,
  /startLocalProfileFlow\(\{ preferStored: true, showGuide: false \}\)/,
  "Returning local users must enter without repeating the guide"
);

const bootSource = appSource.slice(appSource.indexOf("async function bootSonicSearch"));
assert.match(
  bootSource,
  /else if \(hasCompletedInitialEntry\(\)\) await resumeReturningUserExperience\(\);\s*else if \(shouldShowAuthOnBootForAppStore\(\)\) await showAuthScreen\(\);\s*else showIntroScreen\(\);/,
  "Normal returning visits must bypass intro, language and auth screens"
);
assert.ok(
  bootSource.indexOf("else if (qaPreviewMode) enterQaPreviewMode();") <
    bootSource.indexOf("else if (hasCompletedInitialEntry()) await resumeReturningUserExperience();"),
  "QA previews must keep their deterministic entry path"
);
assert.ok(
  bootSource.indexOf("else if (hasCompletedInitialEntry()) await resumeReturningUserExperience();") <
    bootSource.indexOf("else if (shouldShowAuthOnBootForAppStore()) await showAuthScreen();"),
  "Returning iOS users must resume before the App Store first-access gate"
);

console.log("Smart returning-entry contract passed: first visit stays guided and returning users enter directly.");
