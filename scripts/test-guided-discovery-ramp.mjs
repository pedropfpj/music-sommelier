#!/usr/bin/env node

import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import vm from "node:vm";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const rootDir = path.resolve(__dirname, "..");
const appSource = fs.readFileSync(path.join(rootDir, "app.js"), "utf8");
const minifiedSource = fs.readFileSync(path.join(rootDir, "app.min.js"), "utf8");
const indexSource = fs.readFileSync(path.join(rootDir, "index.html"), "utf8");

function extractFunction(name) {
  const marker = `function ${name}`;
  const start = appSource.indexOf(marker);
  if (start < 0) throw new Error(`Missing function: ${name}`);
  const bodyStart = appSource.indexOf("{", start);
  let depth = 0;
  let quote = "";
  let escaped = false;
  for (let index = bodyStart; index < appSource.length; index += 1) {
    const character = appSource[index];
    if (quote) {
      if (escaped) escaped = false;
      else if (character === "\\") escaped = true;
      else if (character === quote) quote = "";
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

function extractConst(name) {
  const marker = `const ${name} = `;
  const start = appSource.indexOf(marker);
  if (start < 0) throw new Error(`Missing constant: ${name}`);
  const end = appSource.indexOf(";", start);
  if (end < 0) throw new Error(`Unclosed constant: ${name}`);
  return appSource.slice(start, end + 1);
}

function extractSection(startName, endName) {
  const start = appSource.indexOf(`function ${startName}`);
  const end = appSource.indexOf(`function ${endName}`, start + 1);
  if (start < 0 || end < 0) throw new Error(`Missing section: ${startName} -> ${endName}`);
  return appSource.slice(start, end);
}

const selectableStyles = [
  "tech_house", "house", "techno", "deep_house", "minimal_techno", "deep_techno",
  "disco_house", "dub_techno", "soulful_house", "hypnotic_techno", "garage_house",
  "detroit_techno", "progressive_psy", "psy_comercial", "goa_trance", "full_on_morning",
  "psybient", "liquid_dnb", "drum_and_bass", "jungle", "uk_garage", "future_garage",
  "neurofunk", "jump_up", "breakbeat", "electro", "trip_hop", "ambient",
  "melodic_techno", "progressive_house", "afro_house", "organic_house",
  "trance_uplifting", "twilight_psy", "full_on", "hard_techno", "psycore", "hi_tech"
];

const context = vm.createContext({ Set, Number, Math });
vm.runInContext(`
  ${extractConst("DISCOVERY_EXTREME_STYLE_SET")}
  ${extractConst("GUIDED_OPENING_STYLE_DECK")}
  ${extractConst("GUIDED_PSY_BRIDGE_STYLE_DECK")}
  ${extractConst("GUIDED_DNB_BRIDGE_STYLE_DECK")}
  ${extractConst("GUIDED_WIDE_STYLE_DECK")}
  ${extractConst("GUIDED_PSY_UNLOCK_REROLLS")}
  ${extractConst("GUIDED_DNB_UNLOCK_REROLLS")}
  ${extractConst("GUIDED_WIDE_UNLOCK_REROLLS")}
  ${extractConst("GUIDED_CATALOG_UNLOCK_REROLLS")}
  var guidedDiscoveryOtherTrackCount = 0;
  var anchoredStyle = "";
  var guidedActive = true;
  function explicitSwipeAnchorStyle() { return anchoredStyle; }
  function guidedDiscoveryRampActive() { return guidedActive; }
  function getAllSelectableStyles() { return ${JSON.stringify(selectableStyles)}; }
  function selectableSwipeStyle(style) { return getAllSelectableStyles().includes(style) ? style : ""; }
  function normalizeDatasetStyle(style) { return String(style || ""); }
  function userHasExtremeTasteIntent() { return false; }
  ${extractFunction("guidedDiscoveryRampStage")}
  ${extractFunction("guidedDiscoveryStyleDeck")}
  ${extractFunction("guidedDiscoveryStyleAllowed")}
  ${extractFunction("registerGuidedDiscoveryOtherTrack")}
`, context);

assert.equal(context.guidedDiscoveryRampStage(), "opening");
let deck = Array.from(context.guidedDiscoveryStyleDeck());
assert(deck.includes("house") && deck.includes("tech_house") && deck.includes("techno"));
assert(deck.every((style) => ["house", "tech_house", "techno", "deep_house", "minimal_techno", "deep_techno", "disco_house", "dub_techno", "soulful_house", "hypnotic_techno", "garage_house", "detroit_techno"].includes(style)));
assert.equal(context.guidedDiscoveryStyleAllowed("psycore"), false);
assert.equal(context.guidedDiscoveryStyleAllowed("neurofunk"), false);

for (let index = 0; index < 4; index += 1) context.registerGuidedDiscoveryOtherTrack();
assert.equal(context.guidedDiscoveryRampStage(), "psy_bridge");
deck = Array.from(context.guidedDiscoveryStyleDeck());
assert(deck.includes("progressive_psy") && deck.includes("goa_trance"));
assert.equal(deck[0], "progressive_psy");
assert.equal(deck.includes("drum_and_bass"), false);
assert.equal(deck.includes("psycore"), false);

for (let index = 0; index < 3; index += 1) context.registerGuidedDiscoveryOtherTrack();
assert.equal(context.guidedDiscoveryRampStage(), "dnb_bridge");
deck = Array.from(context.guidedDiscoveryStyleDeck());
assert(deck.includes("liquid_dnb") && deck.includes("drum_and_bass") && deck.includes("jungle"));
assert.equal(deck[0], "liquid_dnb");
assert.equal(deck.includes("neurofunk"), false);

for (let index = 0; index < 3; index += 1) context.registerGuidedDiscoveryOtherTrack();
assert.equal(context.guidedDiscoveryRampStage(), "wide");
deck = Array.from(context.guidedDiscoveryStyleDeck());
assert(deck.includes("neurofunk") && deck.includes("jump_up"));
assert.equal(deck[0], "neurofunk");
assert.equal(deck.includes("psycore"), false);

context.anchoredStyle = "psycore";
const beforeAnchored = context.guidedDiscoveryOtherTrackCount;
context.registerGuidedDiscoveryOtherTrack();
assert.equal(context.guidedDiscoveryOtherTrackCount, beforeAnchored);

const openingSource = extractFunction("pickInstantOpeningTrack");
const primaryNextSource = extractFunction("pickInstantPrimaryNextTrack");
const instantSwipeSource = extractSection("pickInstantSwipeTrack", "presentInstantSwipeRecommendation");
const negativeSwipeSource = extractSection("pickFastNegativeFeedbackTrack", "presentFastNegativeFeedbackRecommendation");
const prewarmSource = extractFunction("prewarmSuggestionQueue");
const previewResolverSource = extractSection("resolvePreviewForTrack", "renderPreview");
assert.match(openingSource, /GUIDED_OPENING_STYLE_DECK/);
assert.match(openingSource, /curationOpenSeed/);
assert.match(openingSource, /anonymousExposurePenalty\(track\) < 70/);
assert.doesNotMatch(openingSource, /\bawait\b|\bfetch\s*\(|\/api\//);
assert.match(primaryNextSource, /trackHasVerifiedPlaybackRoute/);
assert.doesNotMatch(primaryNextSource, /requireFastRoute: false/);
assert.match(primaryNextSource, /primary-next-variation/);
assert.match(primaryNextSource, /currentCurationUserSeed\(\)/);
assert.doesNotMatch(primaryNextSource, /\bawait\b|\bfetch\s*\(|\/api\//);
assert.match(instantSwipeSource, /trackHasVerifiedPlaybackRoute/);
assert.doesNotMatch(instantSwipeSource, /requireFastRoute: false/);
assert.match(instantSwipeSource, /requireReliableBpm/);
assert.match(negativeSwipeSource, /allowSeenArtist/);
assert.match(prewarmSource, /refreshablePreviewScheduled/);
assert.match(previewResolverSource, /finishWithResolvedPreview\(\)\) return/);
assert.match(appSource, /guidedRamp && !guidedDiscoveryStyleAllowed\(track\.style \|\| ""\)/);
assert.match(appSource, /bind\(topSwipeSurpriseBtn[\s\S]*?registerGuidedDiscoveryOtherTrack\(\)/);
assert.match(appSource, /bind\(swipeHeroSurpriseBtn[\s\S]*?registerGuidedDiscoveryOtherTrack\(\)/);
assert.match(minifiedSource, /guided-opening-choice/);
assert.match(indexSource, /app\.min\.js\?v=20260721slambient1/);

console.log("Guided discovery ramp tests passed: varied safe opening, Psy bridge, DnB bridge, wide catalog, no early Psycore.");
