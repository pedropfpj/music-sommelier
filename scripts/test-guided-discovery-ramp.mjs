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
  "neurofunk", "dubstep", "bass_house", "breakbeat", "electro", "trip_hop", "ambient",
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
  ${extractConst("GUIDED_PSY_UNLOCK_CARDS")}
  ${extractConst("GUIDED_DNB_UNLOCK_CARDS")}
  ${extractConst("GUIDED_WIDE_UNLOCK_CARDS")}
  ${extractConst("GUIDED_CATALOG_UNLOCK_CARDS")}
  ${extractConst("GUIDED_DIVERSITY_WINDOW_CARDS")}
  var guidedDiscoveryOtherTrackCount = 0;
  var recentRecommendationDeliveryMetaQueue = [];
  var swipeStyleExposureCounts = new Map();
  var curationOpenSeed = "test-open";
  var anchoredStyle = "";
  var guidedActive = true;
  function explicitSwipeAnchorStyle() { return anchoredStyle; }
  function guidedDiscoveryRampActive() { return guidedActive; }
  function getAllSelectableStyles() { return ${JSON.stringify(selectableStyles)}; }
  function selectableSwipeStyle(style) { return getAllSelectableStyles().includes(style) ? style : ""; }
  function normalizeDatasetStyle(style) { return String(style || ""); }
  function currentCurationUserSeed() { return "test-user"; }
  function currentCurationVisitId() { return "test-visit"; }
  function hashUnit(value) {
    let hash = 2166136261;
    for (const char of String(value || "")) {
      hash ^= char.charCodeAt(0);
      hash = Math.imul(hash, 16777619);
    }
    return (hash >>> 0) / 4294967296;
  }
  function recommendationTrackKey(track) { return track ? String(track.artist) + "::" + String(track.song) : ""; }
  function artistMatchKey(artist) { return String(artist || "").toLowerCase(); }
  function familyOf(style) {
    if (["house", "deep_house", "tech_house", "bass_house"].includes(style)) return "house";
    if (["techno", "dub_techno", "melodic_techno"].includes(style)) return "techno";
    if (["progressive_psy", "psy_comercial"].includes(style)) return "psytrance";
    if (["liquid_dnb", "drum_and_bass", "neurofunk", "jungle"].includes(style)) return "dnb";
    return "bass_music";
  }
  function userHasExtremeTasteIntent() { return false; }
  ${extractFunction("guidedDiscoveryRampStage")}
  ${extractFunction("guidedDiscoveryCurrentStageStyles")}
  ${extractFunction("guidedDiscoveryPrewarmStyles")}
  ${extractFunction("guidedDiscoveryRecentDeliveries")}
  ${extractFunction("guidedDiscoveryDiversityWindowActive")}
  ${extractFunction("guidedDiscoveryStyleSaturated")}
  ${extractFunction("guidedDiscoveryTrackPreservesDiversity")}
  ${extractFunction("guidedDiscoveryStyleDeck")}
  ${extractFunction("guidedDiscoveryStyleAllowed")}
  function uniqueSwipeStyleList(styles) {
    return [...new Set(styles.map(selectableSwipeStyle).filter(Boolean))];
  }
  ${extractFunction("rankGuidedDiscoveryStyles")}
  ${extractFunction("registerGuidedDiscoveryOtherTrack")}
`, context);

assert.equal(context.guidedDiscoveryRampStage(), "opening");
let deck = Array.from(context.guidedDiscoveryStyleDeck());
assert(deck.includes("house") && deck.includes("tech_house") && deck.includes("techno"));
assert.deepEqual(deck, ["tech_house", "house", "techno", "deep_house"]);
const openingPrewarmStyles = Array.from(context.guidedDiscoveryPrewarmStyles());
assert(openingPrewarmStyles.includes("progressive_psy"));
assert(openingPrewarmStyles.includes("dubstep"));
assert(openingPrewarmStyles.includes("neurofunk"));
assert.deepEqual(openingPrewarmStyles.slice(0, 3), ["progressive_psy", "dubstep", "neurofunk"]);
assert.equal(context.guidedDiscoveryStyleAllowed("psycore"), false);
assert.equal(context.guidedDiscoveryStyleAllowed("neurofunk"), false);

context.recentRecommendationDeliveryMetaQueue = Array.from({ length: 4 }, (_, index) => ({
  trackKey: `opening-${index}`,
  artistKey: `artist-${index}`,
  style: index % 2 ? "techno" : "house",
  family: index % 2 ? "techno" : "house"
}));
assert.equal(context.guidedDiscoveryRampStage(), "psy_bridge");
deck = Array.from(context.guidedDiscoveryStyleDeck());
assert(deck.includes("progressive_psy") && deck.includes("uk_garage") && deck.includes("bass_house"));
assert.equal(deck[0], "progressive_psy");
assert.equal(deck.includes("drum_and_bass"), false);
assert.equal(deck.includes("psycore"), false);

context.recentRecommendationDeliveryMetaQueue.push(
  { trackKey: "bridge-1", artistKey: "bridge-a", style: "progressive_psy", family: "psytrance" },
  { trackKey: "bridge-2", artistKey: "bridge-b", style: "uk_garage", family: "bass_music" },
  { trackKey: "bridge-3", artistKey: "bridge-c", style: "dub_techno", family: "techno" }
);
assert.equal(context.guidedDiscoveryRampStage(), "dnb_bridge");
deck = Array.from(context.guidedDiscoveryStyleDeck());
assert(deck.includes("dubstep") && deck.includes("liquid_dnb") && deck.includes("drum_and_bass"));
assert.equal(deck[0], "dubstep");
assert.equal(deck.includes("neurofunk"), false);

context.recentRecommendationDeliveryMetaQueue.push(
  { trackKey: "bass-1", artistKey: "bass-a", style: "dubstep", family: "bass_music" },
  { trackKey: "bass-2", artistKey: "bass-b", style: "liquid_dnb", family: "dnb" },
  { trackKey: "bass-3", artistKey: "bass-c", style: "drum_and_bass", family: "dnb" }
);
assert.equal(context.guidedDiscoveryRampStage(), "wide");
deck = Array.from(context.guidedDiscoveryStyleDeck());
assert(deck.includes("neurofunk") && deck.includes("goa_trance"));
assert.equal(deck[0], "neurofunk");
assert.equal(deck.includes("psycore"), false);

context.recentRecommendationDeliveryMetaQueue = [
  { trackKey: "one::a", artistKey: "one", style: "house", family: "house" },
  { trackKey: "two::b", artistKey: "two", style: "house", family: "house" }
];
assert.equal(context.guidedDiscoveryStyleSaturated("house"), true);
assert.equal(context.guidedDiscoveryTrackPreservesDiversity({ artist: "One", song: "A", style: "techno" }), false);
assert.equal(context.guidedDiscoveryTrackPreservesDiversity({ artist: "Three", song: "C", style: "techno" }), true);

context.recentRecommendationDeliveryMetaQueue = [];
context.swipeStyleExposureCounts.clear();
const simulatedStyles = [];
for (let index = 0; index < 15; index += 1) {
  const previousStyle = simulatedStyles.at(-1) || "";
  const ranked = Array.from(context.rankGuidedDiscoveryStyles(context.guidedDiscoveryStyleDeck(), previousStyle));
  const selectedStyle = ranked.find((style) => !context.guidedDiscoveryStyleSaturated(style));
  assert(selectedStyle, `expected a style for simulated card ${index + 1}`);
  simulatedStyles.push(selectedStyle);
  context.swipeStyleExposureCounts.set(
    selectedStyle,
    Number(context.swipeStyleExposureCounts.get(selectedStyle) || 0) + 1
  );
  context.recentRecommendationDeliveryMetaQueue.push({
    trackKey: `artist-${index}::track-${index}`,
    artistKey: `artist-${index}`,
    style: selectedStyle,
    family: context.familyOf(selectedStyle)
  });
}
assert(simulatedStyles.slice(0, 4).every((style) => ["tech_house", "house", "techno", "deep_house"].includes(style)));
assert.equal(simulatedStyles[4], "progressive_psy");
assert.equal(simulatedStyles[7], "dubstep");
assert.equal(simulatedStyles[10], "neurofunk");
assert(new Set(simulatedStyles).size >= 10);
for (let index = 2; index < simulatedStyles.length; index += 1) {
  assert.notEqual(
    simulatedStyles[index - 2] === simulatedStyles[index - 1] && simulatedStyles[index - 1] === simulatedStyles[index],
    true,
    "same style must never appear three times in a row"
  );
}
for (let index = 4; index < simulatedStyles.length; index += 1) {
  const familyWindow = simulatedStyles.slice(index - 4, index + 1).map(context.familyOf);
  assert(new Set(familyWindow).size > 1, "same family must never occupy five consecutive cards");
}

context.anchoredStyle = "psycore";
const beforeAnchored = context.guidedDiscoveryOtherTrackCount;
context.registerGuidedDiscoveryOtherTrack();
assert.equal(context.guidedDiscoveryOtherTrackCount, beforeAnchored);

const openingSource = extractFunction("pickInstantOpeningTrack");
const primaryNextSource = extractFunction("pickInstantPrimaryNextTrack");
const instantSwipeSource = extractSection("pickInstantSwipeTrack", "presentInstantSwipeRecommendation");
const negativeSwipeSource = extractSection("pickFastNegativeFeedbackTrack", "presentFastNegativeFeedbackRecommendation");
const prewarmSource = extractFunction("prewarmSuggestionQueue");
const refreshQueueSource = extractFunction("refreshSuggestionQueue");
const guidedWarmQueueSource = extractSection("buildGuidedDiscoveryWarmQueue", "recommendationMetaLine");
const guidedPrewarmStylesSource = extractFunction("guidedDiscoveryPrewarmStyles");
const validatedSource = extractSection("tryRunValidatedPrimaryRecommendation", "runInitialRecommendation");
const advanceSource = extractSection("advanceAfterSwipeFeedback", "likeCurrentTrackFromSwipe");
const previewResolverSource = extractSection("resolvePreviewForTrack", "renderPreview");
assert.match(openingSource, /GUIDED_OPENING_STYLE_DECK/);
assert.match(openingSource, /curationOpenSeed/);
assert.match(openingSource, /anonymousExposurePenalty\(track\) < 70/);
assert.doesNotMatch(openingSource, /\bawait\b|\bfetch\s*\(|\/api\//);
assert.match(primaryNextSource, /trackHasVerifiedPlaybackRoute/);
assert.match(primaryNextSource, /guidedDiscoveryTrackPreservesDiversity/);
assert.doesNotMatch(primaryNextSource, /requireFastRoute: false/);
assert.match(primaryNextSource, /primary-next-variation/);
assert.match(primaryNextSource, /currentCurationUserSeed\(\)/);
assert.doesNotMatch(primaryNextSource, /\bawait\b|\bfetch\s*\(|\/api\//);
assert.match(instantSwipeSource, /trackHasVerifiedPlaybackRoute/);
assert.doesNotMatch(instantSwipeSource, /requireFastRoute: false/);
assert.match(instantSwipeSource, /requireReliableBpm/);
assert.match(negativeSwipeSource, /allowSeenArtist/);
assert.match(prewarmSource, /refreshablePreviewScheduled/);
assert.match(prewarmSource, /trackHasReliableAudioPreview\(track\) && !track\.previewMissing/);
assert.doesNotMatch(prewarmSource, /trackHasReliableAudioPreview\(track\) && track\.previewChecked/);
assert.match(prewarmSource, /prewarmedSwipeAudioByTrack\.delete\(trackKey\)/);
assert.match(prewarmSource, /prewarmedSwipeAudioByTrack\.set\(trackKey, existingAudio\)/);
assert.match(refreshQueueSource, /style:\s*""/);
assert.match(refreshQueueSource, /buildGuidedDiscoveryWarmQueue/);
assert.match(guidedWarmQueueSource, /guidedDiscoveryPrewarmStyles/);
assert.match(guidedWarmQueueSource, /trackHasFastListenRoute/);
assert.match(guidedWarmQueueSource, /trackHasPlayablePreviewExperience/);
assert.match(guidedPrewarmStylesSource, /GUIDED_PSY_BRIDGE_STYLE_DECK\[0\]/);
assert.match(guidedPrewarmStylesSource, /GUIDED_DNB_BRIDGE_STYLE_DECK\[0\]/);
assert.match(guidedPrewarmStylesSource, /GUIDED_WIDE_STYLE_DECK\[0\]/);
assert.doesNotMatch(guidedPrewarmStylesSource, /uniqueSwipeStyleList/);
assert.match(appSource, /style:\s*"dubstep",\s*artist:\s*"Skream"[\s\S]*?previewUrl:/);
assert.match(appSource, /style:\s*"dubstep",\s*artist:\s*"Benga & Coki"[\s\S]*?previewUrl:/);
assert.match(validatedSource, /trackHasVerifiedPlaybackRoute/);
assert.doesNotMatch(validatedSource, /requireVerified:\s*false/);
assert.match(advanceSource, /pickInstantPrimaryNextTrack\(likedTrack,\s*""\)/);
assert.match(previewResolverSource, /finishWithResolvedPreview\(\)\) return/);
assert.match(appSource, /guidedRamp && !guidedDiscoveryStyleAllowed\(track\.style \|\| ""\)/);
assert.match(appSource, /bind\(topSwipeSurpriseBtn[\s\S]*?registerGuidedDiscoveryOtherTrack\(\)/);
assert.match(appSource, /bind\(swipeHeroSurpriseBtn[\s\S]*?registerGuidedDiscoveryOtherTrack\(\)/);
assert.match(minifiedSource, /guided-opening-choice/);
assert.match(indexSource, /app\.min\.js\?v=20260723discovery5/);

console.log("Guided discovery ramp tests passed: card-driven stages, artist/track diversity, playable fast path, no early Psycore.");
