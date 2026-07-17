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

function buttonFixture() {
  return {
    disabled: false,
    textContent: "",
    classList: {
      loading: false,
      toggle(_name, value) {
        this.loading = Boolean(value);
      },
      remove() {
        this.loading = false;
      }
    }
  };
}

function createHarness({ analyticsThrows = false, trackingThrows = false, restoreThrows = false, readiness = null } = {}) {
  const state = {
    runnerCount: 0,
    analyticsCalls: 0,
    warnings: 0,
    busyTransitions: []
  };
  const topButton = buttonFixture();
  const heroButton = buttonFixture();
  const context = vm.createContext({
    Promise,
    String,
    console: {
      warn() {
        state.warnings += 1;
      }
    },
    topSwipeSurpriseBtn: topButton,
    swipeHeroSurpriseBtn: heroButton,
    feedbackMessage: { textContent: "" },
    currentRecommendation: null,
    currentLanguage: "pt",
    noVerifiedTrackMessage() {
      return "Não encontrei uma faixa reproduzível agora. Tente novamente.";
    },
    recommendationFailureMessage() {
      return "Não encontrei uma faixa reproduzível agora. Tente novamente.";
    },
    showToast() {},
    primaryRecommendationActionLabel() {
      return context.firstRecommendationRetryAvailable ? "Tentar novamente" : "Ouvir uma faixa";
    },
    safeBetaPayloadValue(value) {
      if (trackingThrows) throw new Error("tracking_fixture");
      return String(value || "");
    },
    trackBetaEvent() {
      state.analyticsCalls += 1;
      if (analyticsThrows) throw new Error("analytics_fixture");
    },
    waitForMinimumCatalogReady: async () => readiness || { ready: true, status: "already_ready" },
    runSurpriseRecommendation: async () => true
  });

  vm.runInContext(`
    var firstRecommendationPromise = null;
    var firstRecommendationCompleted = false;
    var firstRecommendationRetryAvailable = false;
    var firstRecommendationBusy = false;
    ${extractFunction("trackFirstRecommendationEvent")}
    ${extractFunction("safeFirstRecommendationWarning")}
    ${extractFunction("showFirstRecommendationFailureSafely")}
    ${extractFunction("restoreInitialRecommendationUiSafely")}
    ${extractFunction("runInitialRecommendation")}
  `, context);

  context.setInitialRecommendationBusy = (isBusy) => {
    context.firstRecommendationBusy = Boolean(isBusy);
    state.busyTransitions.push(Boolean(isBusy));
    if (!isBusy && restoreThrows) throw new Error("restore_fixture");
    topButton.disabled = Boolean(isBusy);
    heroButton.disabled = Boolean(isBusy);
    topButton.classList.loading = Boolean(isBusy);
    heroButton.classList.loading = Boolean(isBusy);
  };

  return { context, state, topButton, heroButton };
}

async function assertReleased(harness) {
  assert.equal(harness.context.firstRecommendationPromise, null);
  assert.equal(harness.context.firstRecommendationBusy, false);
  assert.equal(harness.topButton.disabled, false);
  assert.equal(harness.heroButton.disabled, false);
  assert.equal(harness.topButton.classList.loading, false);
  assert.equal(harness.heroButton.classList.loading, false);
}

async function retryAfterFailure(harness) {
  const result = await harness.context.runInitialRecommendation({
    source: "manual",
    initialRunner: async () => {
      harness.state.runnerCount += 1;
      return true;
    }
  });
  assert.equal(result, true);
  await assertReleased(harness);
}

async function testAnalyticsFailureIsNonBlocking() {
  const harness = createHarness({ analyticsThrows: true });
  const runner = async () => {
    harness.state.runnerCount += 1;
    return true;
  };
  const result = await harness.context.runInitialRecommendation({
    source: "auto",
    initialRunner: runner
  });
  assert.equal(result, true);
  assert.equal(harness.state.runnerCount, 1);
  assert(harness.state.analyticsCalls > 0);
  await assertReleased(harness);

  const nextResult = await harness.context.runInitialRecommendation({ source: "manual", initialRunner: runner });
  assert.equal(nextResult, true);
  assert.equal(harness.state.runnerCount, 2);
  await assertReleased(harness);
}

async function testTrackingFailureIsNonBlocking() {
  const harness = createHarness({ trackingThrows: true });
  const runner = async () => {
    harness.state.runnerCount += 1;
    return true;
  };
  const result = await harness.context.runInitialRecommendation({
    source: "auto",
    initialRunner: runner
  });
  assert.equal(result, true);
  assert.equal(harness.state.runnerCount, 1);
  await assertReleased(harness);

  const nextResult = await harness.context.runInitialRecommendation({ source: "manual", initialRunner: runner });
  assert.equal(nextResult, true);
  assert.equal(harness.state.runnerCount, 2);
  await assertReleased(harness);
}

async function testRecommendationFailureAllowsRetry() {
  const harness = createHarness();
  const failed = await harness.context.runInitialRecommendation({
    source: "auto",
    initialRunner: async () => {
      harness.state.runnerCount += 1;
      throw new Error("recommendation_fixture");
    }
  });
  assert.equal(failed, false);
  assert.equal(harness.context.firstRecommendationRetryAvailable, true);
  await assertReleased(harness);
  await retryAfterFailure(harness);
}

async function testRestoreFailureUsesDirectFallback() {
  const harness = createHarness({ restoreThrows: true });
  const failed = await harness.context.runInitialRecommendation({
    source: "auto",
    initialRunner: async () => false
  });
  assert.equal(failed, false);
  assert.equal(harness.context.firstRecommendationRetryAvailable, true);
  await assertReleased(harness);
  await retryAfterFailure(harness);
}

async function testTimeoutAllowsFallbackAndRetry() {
  const harness = createHarness({ readiness: { ready: false, status: "timeout" } });
  const failed = await harness.context.runInitialRecommendation({
    source: "auto",
    initialRunner: async ({ readiness }) => {
      harness.state.runnerCount += 1;
      assert.equal(readiness.status, "timeout");
      return false;
    }
  });
  assert.equal(failed, false);
  await assertReleased(harness);
  await retryAfterFailure(harness);
}

async function testConcurrentRequestsShareOneAttempt() {
  const harness = createHarness();
  let releaseRunner;
  const runnerGate = new Promise((resolve) => {
    releaseRunner = resolve;
  });
  const runner = async () => {
    harness.state.runnerCount += 1;
    await runnerGate;
    return true;
  };
  const automatic = harness.context.runInitialRecommendation({ source: "auto", initialRunner: runner });
  const manual = harness.context.runInitialRecommendation({ source: "manual", initialRunner: runner });
  assert.equal(automatic, manual);
  releaseRunner();
  assert.deepEqual(await Promise.all([automatic, manual]), [true, true]);
  assert.equal(harness.state.runnerCount, 1);
  await assertReleased(harness);
}

const tests = [
  ["analytics failure is non-blocking", testAnalyticsFailureIsNonBlocking],
  ["tracking failure is non-blocking", testTrackingFailureIsNonBlocking],
  ["recommendation failure allows retry", testRecommendationFailureAllowsRetry],
  ["CTA restoration failure uses direct fallback", testRestoreFailureUsesDirectFallback],
  ["catalog timeout allows fallback and retry", testTimeoutAllowsFallbackAndRetry],
  ["concurrent requests share one attempt", testConcurrentRequestsShareOneAttempt]
];

for (const [name, test] of tests) {
  await test();
  console.log(`PASS ${name}`);
}

console.log(`${tests.length} first recommendation lock tests passed.`);
