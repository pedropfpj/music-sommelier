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

function objectLiteralSource(constName, nextMarker) {
  const marker = `const ${constName} = `;
  const start = appSource.indexOf(marker);
  assert.ok(start >= 0, `Missing constant: ${constName}`);
  const end = appSource.indexOf(nextMarker, start);
  assert.ok(end > start, `Missing end marker for ${constName}`);
  return appSource.slice(start + marker.length, end).trim().replace(/;$/, "");
}

const bridges = vm.runInNewContext(
  `(${objectLiteralSource("STYLE_FAMILY_DISCOVERY_BRIDGES", "\nconst SWIPE_FULL_STYLE_COVERAGE_LIMIT")})`,
  Object.create(null)
);

["house", "techno", "psytrance", "dnb", "bass_music", "leftfield"].forEach((family) => {
  assert.ok(Array.isArray(bridges[family]) && bridges[family].length >= 6, `${family} needs a broad discovery bridge`);
});
assert.ok(bridges.house.includes("dubstep"), "House discovery must be able to bridge into Dubstep");
assert.ok(bridges.house.includes("neurofunk"), "House discovery must be able to bridge into Neurofunk");
assert.ok(bridges.techno.includes("liquid_dnb"), "Techno discovery needs a gentler DnB bridge");
assert.ok(bridges.dnb.includes("deep_house"), "DnB discovery must be able to return to approachable House");

const cadenceContext = {
  signals: 0,
  SWIPE_CROSS_FAMILY_EXPLORATION_MIN_SIGNALS: 6,
  SWIPE_CROSS_FAMILY_EXPLORATION_STEP: 4
};
cadenceContext.swipeTrainingSignalCount = () => cadenceContext.signals;
vm.runInNewContext(`${functionSource("crossFamilyExplorationDue")}; this.check = crossFamilyExplorationDue;`, cadenceContext);
for (const signals of [0, 5, 7, 9, 11, 15]) {
  cadenceContext.signals = signals;
  assert.equal(cadenceContext.check(), false, `Signal ${signals} must preserve the affinity lane`);
}
for (const signals of [6, 10, 14, 18]) {
  cadenceContext.signals = signals;
  assert.equal(cadenceContext.check(), true, `Signal ${signals} must schedule cross-family discovery`);
}

const adaptivePlan = functionSource("buildSwipeAdaptiveStylePlan");
assert.match(
  adaptivePlan,
  /rankCrossFamilyExplorationStyles\(focusStyle,\s*sourceTrack\)/,
  "A learned affinity plan must still generate cross-family candidates"
);
assert.match(
  adaptivePlan,
  /crossFamilyExplorationDue\(\)[\s\S]*ranked\.splice[\s\S]*ranked\.unshift/,
  "Cross-family exploration must periodically become the next recommendation, not remain decorative"
);
assert.match(
  adaptivePlan,
  /if \(explicitAnchor\)[\s\S]*styles:\s*\[explicitAnchor\]/,
  "An explicit user style must remain a hard one-style contract"
);

const scoreSource = functionSource("recommendationScore");
assert.match(
  scoreSource,
  /hierarchicalStyleAffinityScore\(track\.style/,
  "Track ranking must learn from exact style, neighboring styles, and genre family"
);
assert.match(
  scoreSource,
  /artistDiscoveryConfidenceScore\(track/,
  "Track ranking must explicitly reward reliable unseen artists"
);

const artistScore = functionSource("artistDiscoveryConfidenceScore");
assert.match(
  artistScore,
  /seenArtist \? -4\.8 : 4\.4/,
  "Previously unseen artists must receive a measurable ranking advantage"
);
assert.match(
  artistScore,
  /styleConfidence >= 0\.72[\s\S]*trackHasPlayablePreviewExperience/,
  "A new artist boost must depend on style evidence and a playable route"
);

const deliverySource = functionSource("registerRecommendationDelivery");
assert.match(
  deliverySource,
  /recommendationDecisionDiagnostics\(track,\s*prefs\)[\s\S]*markRecommendationPresented\(track\)/,
  "Decision diagnostics must capture novelty before the artist enters seen history"
);
assert.match(
  deliverySource,
  /modelVersion|decisionDiagnostics/,
  "Recommendation events must expose the ranking model version and decision diagnostics"
);

assert.match(
  functionSource("rememberAnonymousExposure"),
  /ledger\.tracks[\s\S]*slice\(-50\)[\s\S]*ledger\.artists[\s\S]*slice\(-20\)[\s\S]*recordGlobalDiscoveryExposure/,
  "Anonymous discovery must retain 50 tracks, 20 artists, and update global exposure"
);
assert.match(
  functionSource("anonymousExposurePenalty"),
  /globalExposurePenalty\(track\)/,
  "Per-visitor anti-repeat scoring must include global exposure pressure"
);

console.log(
  "Hierarchical discovery contract passed: exact-style lock, cross-family cadence, new-artist boost, global exposure, and decision diagnostics."
);
