#!/usr/bin/env node
import assert from "node:assert/strict";
import fs from "node:fs/promises";
import { createRequire } from "node:module";
const require = createRequire(import.meta.url);
const listening = require("../universal-listening.js");
const universal = require("../universal-music.js");
const read = name => fs.readFile(new URL(`../${name}`, import.meta.url), "utf8");
const dataset = JSON.parse(await read("data/universal-listening-pilot.json"));
assert.equal(dataset.schemaVersion, 1);
assert.equal(dataset.publicReady, false);
assert.ok(dataset.tracks.length >= 20);
assert.equal(new Set(dataset.tracks.map(t => t.key)).size, dataset.tracks.length);
const now = Date.parse(dataset.generatedAt);
for (const track of dataset.tracks) {
  assert.equal(track.status, "needs_review");
  assert.equal(track.publicReady, false);
  assert.ok(listening.previewEligible(track, now), `${track.artist}: invalid listening evidence`);
  assert.equal(listening.videoId(track.evidence.url), track.evidence.videoId);
  if (track.universe === "classical") assert.ok(track.credits.some(c => c.role === "composer"));
}
for (const group of listening.groups.filter(g => ["reggae", "reggaeton", "forro", "samba", "classical"].includes(g.slug))) {
  const coverage = listening.coverage(dataset.tracks, group.slug, now);
  assert.ok(coverage.previewReady, `${group.label} lacks a diverse preview`);
  assert.ok(coverage.artists >= 3);
  assert.ok(coverage.testedPlayableTracks >= 1, `${group.label} needs a real playback sample, not only provider search metadata`);
}
assert.equal(universal.rankCandidates(dataset.tracks, {}).length, 0, "Unreviewed listening candidates cannot enter public recommendations");
for (const slug of ["rock", "indie", "rap", "trap", "soul"]) assert.ok(listening.coverage(dataset.tracks, slug, now).testedPlayableTracks >= 1, `${slug} needs playback, not a search link`);
for (const url of ["http://www.youtube.com/watch?v=doWWHQDWe2k", "https://www.youtube.com.evil.test/watch?v=doWWHQDWe2k", "https://user@www.youtube.com/watch?v=doWWHQDWe2k", "https://www.youtube.com/results?search_query=reggae"]) assert.equal(listening.videoId(url), "");
const original = dataset.tracks[0];
const altered = change => ({ ...original, ...change });
assert.equal(listening.previewEligible(altered({ providerLinks: [{ provider: "apple_music", linkType: "external", url: "https://music.apple.com/" }] }), now), false, "An external catalog link is not in-app playback");
assert.equal(listening.previewEligible(altered({ evidence: { ...original.evidence, officialChannelMatch: false } }), now), false);
assert.equal(listening.previewEligible(altered({ evidence: { ...original.evidence, videoId: "aaaaaaaaaaa" } }), now), false);
assert.equal(listening.previewEligible(original, now + 31 * 86400000), false, "Stored YouTube metadata needs refresh within 30 days");
assert.equal(listening.fresh("invalid", now), false);
assert.equal(listening.previewEligible(null), false);
assert.equal(listening.previewEligible({ providerLinks: "invalid" }), false);
assert.equal(listening.playbackResult(null), "unconfirmed");
assert.equal(listening.playbackResult(original, now), original.playbackCheck?.result || "unconfirmed");
const playable = dataset.tracks.find(t => listening.playbackResult(t, now) === "played");
const sameRecording = { ...playable, key: "youtube:aaaaaaaaaaa", evidence: { ...playable.evidence, videoId: "aaaaaaaaaaa", url: "https://www.youtube.com/watch?v=aaaaaaaaaaa" },
  providerLinks: [{ ...playable.providerLinks[0], externalId: "aaaaaaaaaaa", url: "https://www.youtube.com/watch?v=aaaaaaaaaaa" }],
  playbackCheck: { ...playable.playbackCheck, url: "https://www.youtube.com/watch?v=aaaaaaaaaaa" } };
const alternativeCoverage = listening.coverage([playable, sameRecording], playable.group, now);
assert.equal(alternativeCoverage.testedPlayableTracks, 2);
assert.equal(alternativeCoverage.testedPlayableRecordings, 1, "Alternative videos of the same song must not inflate the listening counter");
assert.equal(listening.playbackResult({ ...original, playbackCheck: { url: "https://www.youtube.com/watch?v=aaaaaaaaaaa", result: "played", checkedAt: dataset.generatedAt } }, now), "unconfirmed");
assert.equal(listening.fresh(new Date(now + 86400000).toISOString(), now), false);
const page = await read("listening-preview.html");
const controller = await read("listening-preview.js");
assert.match(page, /name="robots" content="noindex, nofollow"/);
assert.match(controller, /YouTubePlayer/);
assert.match(controller, /player\?\.destroy/);
assert.match(controller, /visibilitychange/);
assert.match(controller, /generation !== playerGeneration/);
assert.doesNotMatch(controller, /localStorage|upsert|\/api\/billing|\.innerHTML\s*=/);
assert.doesNotMatch(JSON.stringify(dataset), /thumbnail_url|preview_url|artworkUrl|audio\.m4a/);
for (const asset of ["listening-preview.html", "listening-preview.css", "listening-preview.js", "universal-listening.js", "universal-discovery.js", "universal-discovery-ui.js", "universal-discovery.css", "data/universal-listening-pilot.json", "data/universal-catalog-pilot.json"]) {
  assert.equal(await read(asset), await read(`ios/App/App/public/${asset}`), `iPhone copy differs: ${asset}`);
}
console.log(`Universal listening passed: ${dataset.tracks.length} preview-only provider embeds, 5 diverse original styles and playable samples in rock/indie/rap/trap/soul, fresh identity evidence and matching iPhone assets.`);
