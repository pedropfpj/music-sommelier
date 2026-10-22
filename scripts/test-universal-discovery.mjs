#!/usr/bin/env node
import assert from "node:assert/strict";
import fs from "node:fs/promises";
import { createRequire } from "node:module";
const require = createRequire(import.meta.url);
const model = require("../universal-discovery.js"), listening = require("../universal-listening.js");
const dataset = JSON.parse(await fs.readFile(new URL("../data/universal-listening-pilot.json", import.meta.url), "utf8"));
const catalog = JSON.parse(await fs.readFile(new URL("../data/universal-catalog-pilot.json", import.meta.url), "utf8"));
assert.equal(model.previewEnabled({ hostname: "sonicsearch.app", search: "?universalPreview=1" }), false);
assert.equal(model.previewEnabled({ hostname: "127.0.0.1", search: "?universalPreview=1" }), true);
assert.equal(model.previewEnabled({ hostname: "127.0.0.1", search: "" }), false);
assert.equal(model.previewEnabled({ hostname: "sonicsearch.app", search: "" }, true), true);
const played = dataset.tracks.find(t => listening.playbackResult(t) === "played"); assert.ok(played);
const state = { group: played.group, experienceByGroup: { [played.group]: "beginner" } };
assert.ok(model.ranked(dataset.tracks, state).length > 0);
assert.ok(model.ranked(dataset.tracks, state).every(r => r.candidate.group === played.group && listening.playbackResult(r.candidate) === "played"));
for (const action of ["like", "pass", "known", "block"]) {
  const reacted = model.react(state, played, action);
  assert.equal(reacted.history.length, 1);
  assert.equal(model.ranked(dataset.tracks, reacted).some(r => r.candidate.key === played.key), false);
  if (action === "block") assert.ok(model.ranked(dataset.tracks, reacted).every(r => r.candidate.artistKey !== played.artistKey));
  assert.equal(model.react(reacted, played, action).history.length, 1);
}
assert.equal(model.ranked(dataset.tracks, { ...state, history: dataset.tracks.filter(t => t.group === played.group).map(t => ({ key: t.key, artistKey: t.artistKey, group: t.group, action: "pass" })) }).length, 0, "No wrong-genre fallback or rejected repeats");
assert.ok(model.ranked(dataset.tracks, state, { includeExplicit: false }).every(r => !r.candidate.explicit));
assert.ok(model.catalogCoverage(catalog.tracks, dataset.tracks).every(g => g.launchReady === false));
assert.equal(model.normalizeState({ experienceByGroup: { rock: "expert", reggae: "invalid" } }).experienceByGroup.reggae, undefined);
assert.equal(model.normalizeState({ experienceByGroup: { rock: "expert" } }).experienceByGroup.classical, undefined);
for (const slug of ["rock", "indie", "rap", "trap", "reggae"]) assert.ok(listening.groups.some(g => g.slug === slug));
assert.equal(listening.groups.length, 17);
for (const group of ["rock", "indie", "rap", "trap", "reggae", "soul"]) assert.ok(model.ranked(dataset.tracks, { group }).length > 0, `${group} needs a real played source`);
// Regression: the old Trap preview exhausted after its only playable artist.
const trapCoverage = listening.coverage(dataset.tracks, "trap");
assert.ok(trapCoverage.testedPlayableArtists >= 7, "Trap needs several playable artists, not just catalog references");
assert.ok(trapCoverage.testedPlayableRecordings >= 12, "Alternative videos must not substitute for musical variety");
const originalTrap = dataset.tracks.find(t => t.group === "trap" && t.artist === "Filipe Ret" && listening.playbackResult(t) === "played");
for (const experience of ["beginner", "familiar", "expert"]) {
  let trapState = model.react({ group: "trap", experienceByGroup: { trap: experience } }, originalTrap, "pass");
  const selected = [];
  for (let index = 0; index < 6; index += 1) {
    const result = model.ranked(dataset.tracks, trapState, { limit: 1 })[0];
    assert.ok(result, `${experience}: Trap must continue after the original source is discarded`);
    assert.equal(result.candidate.group, "trap");
    selected.push(result.candidate);
    trapState = model.recordDelivery(trapState, result.candidate, new Date().toISOString(), result.selectionLane);
    trapState = model.normalizeState(JSON.parse(JSON.stringify(trapState)));
  }
  assert.equal(new Set(selected.map(model.recordingKey)).size, 6, "Do not replay alternate videos of a delivered song");
  assert.ok(new Set(selected.map(t => t.artistKey)).size >= 5, "Trap should explore artists instead of repeating one catalog");
}
const variants = dataset.tracks.filter(t => t.artist === "MF DOOM" && listening.playbackResult(t) === "played");
assert.ok(variants.length >= 2);
const distinctRap = model.ranked(dataset.tracks, { group: "rap" });
assert.equal(new Set(distinctRap.map(r => model.recordingKey(r.candidate))).size, distinctRap.length);
assert.equal(model.ranked(dataset.tracks, model.react({ group: "rap" }, variants[0], "pass")).some(r => model.recordingKey(r.candidate) === model.recordingKey(variants[0])), false, "A different video of the same recording must not repeat a discard");
assert.equal(model.react(model.react({ group: "rap" }, variants[0], "like"), variants[1], "known").history.length, 1, "Feedback for a recording is editable across provider variants");
// Synthetic provider fixtures test selection policy only, not real playback.
const now = Date.now();
const fixtures = Array.from({ length: 24 }, (_, index) => {
  const id = `test${String(index).padStart(7, "0")}`, url = `https://www.youtube.com/watch?v=${id}`;
  return { ...structuredClone(played), key: `youtube:${id}`, referenceKey: `fixture:${index}`,
    artist: `Fixture artist ${index}`, artistKey: `fixture_artist_${index}`, song: `Fixture song ${index}`,
    group: "rock", universe: "rock_metal", genre: index % 2 ? "metal" : "alternative_rock", explicit: false,
    discoveryTier: index < 6 ? "reference" : index < 12 ? "deep_cut" : "discovery",
    evidence: { ...played.evidence, videoId: id, url, checkedAt: new Date(now).toISOString() },
    providerLinks: [{ provider: "youtube", externalId: id, url, linkType: "embed", capabilities: ["embed_playback"] }],
    playbackCheck: { url, result: "played", checkedAt: new Date(now).toISOString() } };
});
assert.equal(model.normalizeState({ version: 1, history: model.react(state, played, "like").history }).history.length, 1, "Migrate old local reactions without loss");
assert.equal(model.normalizeState({ deliveryCounts: { rock: -1, indie: Infinity } }).deliveryCounts.rock, 0);
for (const [experience, expected] of [["beginner", 2], ["familiar", 1], ["expert", 1]]) {
  let sequence = model.normalizeState({ group: "rock", experienceByGroup: { rock: experience } });
  const selections = [];
  for (let index = 0; index < 6; index += 1) {
    const result = model.ranked(fixtures, sequence, { now, limit: 1 })[0]; assert.ok(result);
    selections.push(result);
    sequence = model.recordDelivery(sequence, result.candidate, new Date(now).toISOString(), result.selectionLane);
    sequence = model.normalizeState(JSON.parse(JSON.stringify(sequence))); // Page reload.
    assert.ok(!model.ranked(fixtures, sequence, { now }).some(r => r.candidate.key === result.candidate.key));
  }
  assert.equal(selections.filter(s => s.selectionLane === "reference").length, expected, `${experience}: bounded reference slots`);
  assert.equal(new Set(selections.map(s => s.candidate.artistKey)).size, 6, "Rotate artists, not just their songs");
  assert.equal(sequence.history.length, 0, "Neutral next is exposure, never a dislike");
  assert.equal(sequence.deliveryCounts.rock, 6);
  assert.equal(sequence.deliveryCounts.indie, 0, "Independent discovery cadence per style");
}
const discovery = fixtures[12], alternateSong = { ...fixtures[13], artist: discovery.artist, artistKey: discovery.artistKey };
for (const action of ["like", "known"]) {
  const learned = model.react({ group: "rock", experienceByGroup: { rock: "expert" } }, discovery, action, new Date(now).toISOString());
  assert.equal(model.ranked([alternateSong, ...fixtures], learned, { now }).some(r => r.candidate.artistKey === discovery.artistKey), false,
    "An artist already liked/known must not be sold as new discovery through another song");
}
const referenceOnly = fixtures.filter(t => t.discoveryTier === "reference");
assert.equal(model.ranked(referenceOnly, { group: "rock", experienceByGroup: { rock: "expert" } }, { now }).length, 0,
  "Do not fill an expert discovery slot with famous-only fallback");
assert.ok(model.ranked(referenceOnly, { group: "rock", experienceByGroup: { rock: "familiar" } }, { now }).every(r => r.selectionLane === "reference"));
const delivered = model.recordDelivery({ group: "rock" }, fixtures[0], new Date(now).toISOString(), "reference");
assert.equal(model.recordDelivery(delivered, fixtures[0], new Date(now).toISOString()).deliveryCounts.rock, 1, "Rerender cannot double count delivery");
assert.equal(model.ranked([fixtures[0]], delivered, { now }).length, 0, "Persisted exposure survives reload");
const remapped = { ...fixtures[0], referenceKey: "fixture:remapped_master" };
assert.equal(model.ranked([remapped], delivered, { now }).length, 0, "Provider video cannot repeat when its recording reference changes during catalog refresh");
assert.equal(model.recordDelivery(delivered, remapped, new Date(now).toISOString()).deliveryCounts.rock, 1);
assert.equal(model.ranked([fixtures[0]], delivered, { now: now + 8 * 86400000 }).length, 1, "Unreacted recording can return after cooldown");
assert.equal(model.recordDelivery(delivered, { ...fixtures[1], playbackCheck: null }, new Date(now).toISOString()).deliveryCounts.rock, 1);
assert.equal(model.recordDelivery(delivered, fixtures[1], "invalid date").deliveryCounts.rock, 1);
assert.equal(model.ranked(fixtures.map(t => ({ ...t, playbackCheck: null })), { group: "rock" }, { now }).length, 0);
const affinityState = model.react({ group: "rock", experienceByGroup: { rock: "familiar" } }, fixtures[6], "like", new Date(now).toISOString());
const affinity = model.ranked(fixtures, affinityState, { now })[0];
assert.equal(affinity.selectionLane, "affinity"); assert.ok(affinity.feedbackAffinity);
assert.equal(affinity.candidate.genre, fixtures[6].genre);
assert.notEqual(affinity.candidate.artistKey, fixtures[6].artistKey);
const expandedState = model.recordDelivery(affinityState, affinity.candidate, new Date(now).toISOString(), affinity.selectionLane);
const expansion = model.ranked(fixtures, expandedState, { now })[0];
assert.equal(expansion.selectionLane, "expansion"); assert.notEqual(expansion.candidate.genre, affinity.candidate.genre);
for (const language of ["pt", "en", "es"]) assert.ok(model.explanation(affinity.candidate, affinityState, language, affinity).length > 20);
const ui = await fs.readFile(new URL("../universal-discovery-ui.js", import.meta.url), "utf8");
assert.match(ui, /sonic_search:universalDiscoveryPreview:v1/);
assert.match(ui, /sonic:profile-changed/);
assert.match(ui, /sonic:stop-universal-playback/);
assert.doesNotMatch(ui, /\.innerHTML\s*=|upsert|\/api\/billing|\/api\/daily-radar/);
const app = await fs.readFile(new URL("../app.js", import.meta.url), "utf8");
assert.match(app, /SonicUniversalDiscoveryUi\?\.mount/);
const ios = await fs.readFile(new URL("../scripts/build-ios-web.mjs", import.meta.url), "utf8");
for (const asset of ["universal-discovery.js", "universal-discovery-ui.js", "universal-discovery.css"]) assert.ok(ios.includes(`copyPath("${asset}")`));
console.log("Universal discovery passed: experience-specific reference budgets, affinity/expansion/surprise, new-artist learning, artist diversity, reload-safe seven-day delivery history, strict style, tested sources only, profile-local reactions and iPhone assets.");
