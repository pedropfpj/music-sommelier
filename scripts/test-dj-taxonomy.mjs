import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import vm from "node:vm";
import { fileURLToPath } from "node:url";

const rootDir = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const appSource = fs.readFileSync(path.join(rootDir, "app.js"), "utf8");
const indexSource = fs.readFileSync(path.join(rootDir, "index.html"), "utf8");

function normalize(text = "") {
  return String(text)
    .toLowerCase()
    .normalize("NFD")
    .replace(/[^\w\s]/g, "")
    .trim();
}

function sourceBetween(startMarker, endMarker) {
  const start = appSource.indexOf(startMarker);
  const end = appSource.indexOf(endMarker, start + startMarker.length);
  assert.ok(start >= 0, `Missing start marker: ${startMarker}`);
  assert.ok(end > start, `Missing end marker: ${endMarker}`);
  return appSource.slice(start, end);
}

const sandbox = vm.createContext({ normalize });
vm.runInContext(
  sourceBetween("const DJ_PSY_SET_LANES", "function djIntentFamilyCopy"),
  sandbox
);
vm.runInContext(
  sourceBetween("function djSeedMatchesLane", "function djMetaLine"),
  sandbox
);

const correctedFungus = sandbox.normalizeDjRecommendationTaxonomy({
  id: "artist-set-hitech_psycore-test",
  lane: "hitech_psycore",
  style: "hi_tech",
  name: "Fungus Funk hitech",
  subgenre: "Hi-Tech / Psycore",
  setTitle: "Fungus Funk full set recording at Psy-Fi 2017"
});
assert.equal(correctedFungus.name, "Fungus Funk");
assert.equal(correctedFungus.style, "full_on_night");
assert.equal(correctedFungus.subgenre, "Full-On Night");
assert.equal(correctedFungus.lane, "global_psy");
assert.equal(sandbox.djSeedMatchesLane(correctedFungus, "psy_full_on_night"), true);
assert.equal(sandbox.djSeedMatchesLane(correctedFungus, "psy_hi_tech"), false);
assert.equal(sandbox.djSeedMatchesLane(correctedFungus, "psy_psycore"), false);

const mislabeledFestivalSet = sandbox.normalizeDjRecommendationTaxonomy({
  id: "multi-hitech_psycore-ace",
  lane: "hitech_psycore",
  style: "hi_tech",
  name: "Ace Ventura",
  subgenre: "Hi-Tech / Psycore",
  setTitle: "Ace Ventura @ Ozora Festival 2025"
});
assert.equal(mislabeledFestivalSet, null);

const explicitHiTech = sandbox.normalizeDjRecommendationTaxonomy({
  id: "multi-hitech_psycore-explicit",
  lane: "hitech_psycore",
  style: "hi_tech",
  name: "Example",
  subgenre: "Hi-Tech / Psycore",
  setTitle: "Example Hi-Tech Psytrance Set 190 BPM"
});
assert.equal(explicitHiTech.style, "hi_tech");
assert.equal(explicitHiTech.subgenre, "Hi-Tech");
assert.equal(sandbox.djSeedMatchesLane(explicitHiTech, "psy_hi_tech"), true);
assert.equal(sandbox.djSeedMatchesLane(explicitHiTech, "psy_psycore"), false);

const explicitPsycore = sandbox.normalizeDjRecommendationTaxonomy({
  id: "multi-hitech_psycore-core",
  lane: "hitech_psycore",
  style: "hi_tech",
  name: "Example Core",
  subgenre: "Hi-Tech / Psycore",
  setTitle: "Example Darkpsy / Psycore Set"
});
assert.equal(explicitPsycore.style, "psycore");
assert.equal(explicitPsycore.subgenre, "Psycore");
assert.equal(sandbox.djSeedMatchesLane(explicitPsycore, "psy_psycore"), true);
assert.equal(sandbox.djSeedMatchesLane(explicitPsycore, "psy_hi_tech"), false);

const curatedHiTech = sandbox.normalizeDjRecommendationTaxonomy({
  id: "lineup-hitech",
  lane: "psy_festival_lineups",
  style: "hi_tech",
  name: "Curated Artist",
  subgenre: "Hi-Tech / Psycore",
  setTitle: "Curated Artist live"
});
assert.equal(curatedHiTech.subgenre, "Hi-Tech");
assert.equal(sandbox.djSeedMatchesLane(curatedHiTech, "psy_hi_tech"), true);
assert.equal(sandbox.djSeedMatchesLane(curatedHiTech, "psy_psycore"), false);

assert.equal(
  sandbox.djSeedMatchesLane({ lane: "house_selectors", style: "house" }, "techno_live_dj"),
  true
);
assert.equal(
  sandbox.djSeedMatchesLane({ lane: "house_selectors", style: "house" }, "house_deep_minimal"),
  true
);
assert.equal(
  sandbox.djSeedMatchesLane({ lane: "house_selectors", style: "house" }, "other_all"),
  false
);

const familyOrder = Array.from(indexSource.matchAll(/data-dj-intent-family="([^"]+)"/g), (match) => match[1]);
assert.deepEqual(familyOrder.slice(0, 3), ["psy", "techno", "other"]);
assert.match(indexSource, />Techno \/ House</);
assert.match(indexSource, /value="psy_hi_tech">Hi-Tech</);
assert.match(indexSource, /value="psy_psycore">Psycore</);
assert.doesNotMatch(indexSource, /value="hitech_psycore"/);

const seedV2 = fs.readFileSync(path.join(rootDir, "data/artist_expansion_seeds_v2.csv"), "utf8");
const seedV3 = fs.readFileSync(path.join(rootDir, "data/artist_expansion_seeds_v3.csv"), "utf8");
assert.match(seedV2, /^full_on_night,Fungus Funk,/m);
assert.doesNotMatch(seedV2, /^hi_tech,Fungus Funk,/m);
assert.match(seedV3, /^"full_on_night","Fungus Funk",/m);
assert.doesNotMatch(seedV3, /^"hi_tech","Fungus Funk",/m);

console.log("DJ taxonomy tests passed: families, strict subgenres, and Fungus Funk correction.");
