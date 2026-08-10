#!/usr/bin/env node

import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import vm from "node:vm";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const rootDir = path.resolve(__dirname, "..");
const appSource = fs.readFileSync(path.join(rootDir, "app.js"), "utf8");

function extractFunction(name) {
  const marker = `function ${name}`;
  const markerIndex = appSource.indexOf(marker);
  if (markerIndex < 0) throw new Error(`Missing function: ${name}`);
  const asyncIndex = appSource.lastIndexOf("async ", markerIndex);
  const start = asyncIndex >= markerIndex - 8 ? asyncIndex : markerIndex;
  const signatureEnd = appSource.indexOf(") {", markerIndex);
  if (signatureEnd < 0) throw new Error(`Missing function body: ${name}`);
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
    if (depth === 0) return appSource.slice(start, index + 1);
  }
  throw new Error(`Unclosed function: ${name}`);
}

function storageFixture() {
  const values = new Map();
  return {
    getItem(key) {
      return values.has(String(key)) ? values.get(String(key)) : null;
    },
    setItem(key, value) {
      values.set(String(key), String(value));
    },
    removeItem(key) {
      values.delete(String(key));
    }
  };
}

const context = vm.createContext({
  console,
  Error,
  Number,
  String,
  Math,
  localStorage: storageFixture()
});

vm.runInContext(`
  var currentAuthUser = null;
  var ephemeralProfileMode = false;
  var recommendationSessionGeneration = 0;
  var activeRecommendationSessionIdentity = "";
  var firstRecommendationPromise = { pending: true };
  var firstRecommendationCompleted = true;
  var firstRecommendationRetryAvailable = true;
  var firstRecommendationBusy = true;
  var recommendationRunBusy = true;
  var fastFeedbackSwapToken = 0;
  var fastSuggestionQueueRefreshToken = 0;
  var previewRecoveryToken = 0;
  var recommendationDetailRenderToken = 0;
  var recommendationPreviewRenderToken = 0;
  var curationUserSeed = "shared-seed";
  var curationUserSeedStorageKey = "legacy";
  var curationVisitId = "7";
  var curationVisitStorageKey = "legacy";
  var openingRotationSlot = 44;
  var openingRotationSlotPromise = Promise.resolve(44);
  var openingRotationSlotSource = "global_durable";
  var openingRotationGeneration = 0;
  var openingRotationSessionIdentity = "";
  var runtimeSeedCounter = 0;
  const CURATION_SEED_STORAGE_KEY = "neonpulse:curationSeed:v1";
  const CURATION_VISIT_STORAGE_KEY = "neonpulse:curationVisitCounter:v1";

  function normalize(value = "") {
    return String(value || "").trim().toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "");
  }
  function createRuntimeCurationSeed() {
    runtimeSeedCounter += 1;
    return "runtime-seed-" + runtimeSeedCounter;
  }

  ${extractFunction("normalizeAuthMode")}
  ${extractFunction("normalizeUserSession")}
  ${extractFunction("isEphemeralSession")}
  ${extractFunction("sessionProfileKey")}
  ${extractFunction("recommendationSessionIdentityKey")}
  ${extractFunction("storageKeyForSession")}
  ${extractFunction("uniqueStorageKeys")}
  ${extractFunction("storageFallbackKeys")}
  ${extractFunction("curationStorageKey")}
  ${extractFunction("resetOpeningRotationForIdentity")}
  ${extractFunction("beginRecommendationSession")}
  ${extractFunction("currentCurationUserSeed")}
  ${extractFunction("currentCurationVisitId")}
`, context);

const googleA = {
  mode: "google",
  providerId: "user-a",
  email: "a@example.com",
  username: "User A"
};
const googleB = {
  mode: "google",
  providerId: "user-b",
  email: "b@example.com",
  username: "User B"
};

const accountKeys = Array.from(context.storageFallbackKeys("profile:data", googleA));
assert.deepEqual(accountKeys, ["profile:data:google:user-a"]);
assert.equal(accountKeys.includes("profile:data"), false, "Signed-in accounts must not read legacy anonymous data");
assert.equal(accountKeys.some((key) => key.includes("guest:default")), false, "Signed-in accounts must not inherit guest data");

assert.deepEqual(
  Array.from(context.storageFallbackKeys("profile:data", { mode: "guest", username: "" })),
  ["profile:data:guest:default", "profile:data"]
);
assert.deepEqual(
  Array.from(context.storageFallbackKeys("profile:data", { mode: "visitor", providerId: "visit-1" })),
  []
);
assert.notEqual(
  context.curationStorageKey("curation", googleA),
  context.curationStorageKey("curation", googleB),
  "Each account needs an independent curation seed key"
);

context.beginRecommendationSession(googleA);
const firstGeneration = context.recommendationSessionGeneration;
const firstOpeningGeneration = context.openingRotationGeneration;
assert.equal(context.activeRecommendationSessionIdentity, "google:user-a");
assert.equal(context.openingRotationSlot, null);
assert.equal(context.firstRecommendationPromise, null);
assert.equal(context.firstRecommendationCompleted, false);
assert.equal(context.recommendationRunBusy, false);

context.openingRotationSlot = 91;
context.curationUserSeed = "account-a-cache";
context.curationUserSeedStorageKey = context.curationStorageKey("curation", googleA);
context.beginRecommendationSession(googleA);
assert.equal(context.recommendationSessionGeneration, firstGeneration + 1, "Reactivation must invalidate pending work");
assert.equal(context.openingRotationGeneration, firstOpeningGeneration, "The same identity may keep its rotation slot");
assert.equal(context.openingRotationSlot, 91);

context.beginRecommendationSession(googleB);
assert.equal(context.activeRecommendationSessionIdentity, "google:user-b");
assert.equal(context.openingRotationGeneration, firstOpeningGeneration + 1);
assert.equal(context.openingRotationSlot, null, "Changing accounts must request a fresh opening slot");
assert.equal(context.curationUserSeed, "", "Changing accounts must drop the previous seed cache");

context.currentAuthUser = context.normalizeUserSession(googleA);
const seedA = context.currentCurationUserSeed();
const visitA = context.currentCurationVisitId();
context.currentAuthUser = context.normalizeUserSession(googleB);
const seedB = context.currentCurationUserSeed();
const visitB = context.currentCurationVisitId();
assert.notEqual(seedA, seedB);
assert.equal(visitA, "1");
assert.equal(visitB, "1", "Visit counters must start independently per account");
context.currentAuthUser = context.normalizeUserSession(googleA);
assert.equal(context.currentCurationUserSeed(), seedA, "Returning to an account must restore its own seed");

assert.match(
  appSource,
  /function runInitialRecommendation[\s\S]*assertRecommendationSessionCurrent\(sessionGeneration\)[\s\S]*isRecommendationSessionChangedError/,
  "The initial recommendation must discard work from an obsolete session"
);
assert.match(
  appSource,
  /async function runSurpriseRecommendation[\s\S]*assertRecommendationSessionCurrent\(sessionGeneration\)[\s\S]*recommendationSessionIsCurrent\(sessionGeneration\)/,
  "The surprise flow must not commit or restore cards across account switches"
);

console.log("Auth recommendation isolation contract passed.");
