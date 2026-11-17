import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { createAppRuntimeTestContext } from "./app-runtime-test-harness.mjs";
import discovery from "../discovery-experience.js";

const rows = JSON.parse(await readFile(new URL("../data/runtime-catalog-v1/styles/full_on_night.json", import.meta.url), "utf8"));
const revalidated = rows.filter(row => row.source === "full_on_night_revalidated_20261117");
assert.equal(revalidated.length, 28, "A rebuilt catalog must retain every approved recording from the thirty-candidate review");

const app = createAppRuntimeTestContext();
app.window.SonicDiscoveryExperience = discovery;
assert.equal(app.isLikelyGeneratedTrackTitle("Virtual Combat (PsychoSocial RMX)"), false);
assert.equal(app.isLikelyGeneratedTrackTitle("Generic Track (Psytrance Music Mix)"), true);
app.catalog = [];
app.mergeExternalDatasetRows(revalidated, "dataset_local_runtime_full_on_night");
const eligible = app.styleScopedEligibleTracks({ style: "full_on_night", bpm: "145-155" });
assert.equal(eligible.length, 28, "Reviewed rows must reach the normal filtered discovery flow");
assert.equal(new Set(eligible.map(track => app.artistMatchKey(track.artist))).size, 28);
assert.equal(new Set(eligible.map(track => app.catalogTrackRecordingIds(track)[0])).size, 28);

for (const track of eligible) {
  const proof = app.reviewedExactAppleProof(track);
  assert.ok(proof, `${track.artist} must keep its exact-recording evidence`);
  assert.ok(app.reviewedPublisherApplePreviewMatches(proof, track.previewUrl));
  assert.equal(app.trackMatchesRequestedSubgenreEvidence(track, { style: "full_on_night" }), true);
  assert.equal(app.trackMatchesRequestedSubgenreEvidence(track, { style: "dark_psy" }), false);
  assert.equal(app.trackMatchesBpmPreference(track, "145-155"), true);
  assert.equal(app.reviewedExactAppleProof({ ...track, bpmExact: track.bpmExact + 1 }), null,
    "Changing the BPM must invalidate the edition's reviewed proof");
}

assert.equal(revalidated.some(row => row.artist === "Drip Drop"), false,
  "A candidate with unresolved style evidence cannot enter the approved batch");
console.log("Full-On Night revalidation passed: 28 exact recordings and artists survive rebuild, proof validation and the normal 145–155 BPM filter.");
