#!/usr/bin/env node
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { createRequire } from "node:module";
import { validateSeeds, resolveSeed, expandArtistRepertoire, safeAppleTrackUrl, sanitizeProviderTrack, stableUuid, searchUrl } from "./universal-catalog-pilot-utils.mjs";

const require = createRequire(import.meta.url);
const universal = require("../universal-music.js");
const manifest = JSON.parse(await readFile(new URL("../data/universal-catalog-seeds.json", import.meta.url), "utf8"));
const seeds = validateSeeds(manifest);
assert.ok(seeds.length >= 84, "Preserve the initial editorial artist coverage");
for (const universe of universal.universes.filter(item => item.slug !== "electronic")) {
  const rows = seeds.filter(seed => seed.universe === universe.slug);
  assert.ok(rows.length >= 6, `${universe.slug}: needs artist diversity`);
  for (const tier of ["reference", "deep_cut", "discovery"]) assert.ok(rows.filter(row => row.tier === tier).length >= 2, `${universe.slug}: missing ${tier}`);
}
assert.ok(seeds.some(seed => seed.genre === "funk_brasileiro"));
assert.ok(seeds.some(seed => seed.genre === "p_funk"));
assert.throws(() => validateSeeds({ ...manifest, artists: [{ ...seeds[0], genre: "funk_brasileiro" }] }), /Invalid genre/);

const seed = { artist: "SAULT", universe: "rnb_soul_funk", genre: "soul", tier: "discovery", songs: ["Wildfires"] };
const row = { kind: "song", wrapperType: "track", trackId: 123, artistId: 456, artistName: "Sault", trackName: "Wildfires",
  trackViewUrl: "https://music.apple.com/br/album/example/789?i=123", collectionName: "Untitled", previewUrl: "https://example.com/audio.m4a",
  artworkUrl100: "https://example.com/art.jpg", trackExplicitness: "explicit" };
const options = { batch: manifest.batch, country: "BR", retrievedAt: "2026-09-12T12:00:00Z", sourceUrl: "https://itunes.apple.com/search?term=sault" };
const result = resolveSeed(seed, [row], options);
const lookupSeed = { ...seed, providerArtistId: 456, providerLookup: true };
assert.equal(new URL(searchUrl(lookupSeed)).pathname, "/lookup");
assert.equal(new URL(searchUrl(lookupSeed)).searchParams.get("id"), "456");
assert.equal(new URL(searchUrl({ ...lookupSeed, searchTerm: "SAULT Wildfires" })).pathname, "/search", "A title fallback remains a search");
assert.equal(resolveSeed(lookupSeed, [{ ...row, artistId: 999 }], options).tracks.length, 0, "Lookup must still reject a homonym with a different artist ID");
assert.throws(() => validateSeeds({ ...manifest, artists: [{ ...seed, providerLookup: true }] }), /Unanchored provider lookup/);
assert.equal(result.tracks.length, 1);
assert.equal(result.tracks[0].status, "needs_review");
assert.equal(result.tracks[0].playable, false);
assert.equal(result.tracks[0].explicit, true);
assert.deepEqual(result.tracks[0].providerLinks[0].capabilities, ["open_provider"]);
assert.equal(JSON.stringify(result).includes("audio.m4a"), false);
assert.equal(JSON.stringify(sanitizeProviderTrack(row)).includes("art.jpg"), false);
assert.equal(resolveSeed(seed, [{ ...row, artistName: "Sault Tribute Band" }], options).tracks.length, 0);
assert.equal(resolveSeed(seed, [{ ...row, trackName: "Wildfires (Live)" }], options).tracks.length, 0);
assert.equal(resolveSeed(seed, [{ ...row, trackName: "Wildfires (feat. Test)" }], options).tracks.length, 1);
assert.equal(resolveSeed(seed, [{ ...row, collectionName: "Karaoke Tribute" }], options).tracks.length, 0);
const repertoire = expandArtistRepertoire(seed, [row, { ...row, trackId: 124, trackName: "Other recording", trackViewUrl: "https://music.apple.com/br/album/example/789?i=124" },
  { ...row, trackId: 125, artistId: 999, trackName: "Homonym", trackViewUrl: "https://music.apple.com/br/album/example/789?i=125" }], resolveSeed(seed, [row], options), options);
assert.equal(repertoire.tracks.length, 2);
assert.equal(repertoire.tracks[1].metadata.recording_tier_requires_review, true);
assert.equal(expandArtistRepertoire(seed, [{ ...row, trackName: "Different artist target" }], { tracks: [], issues: [] }, options).tracks.length, 0, "Artist name alone cannot anchor a homonym");
assert.equal(expandArtistRepertoire({ ...seed, universe: "classical" }, [row], { tracks: [], issues: [] }, options).tracks.length, 0, "Never assign one work/composer to unrelated repertoire");
assert.equal(resolveSeed(seed, [row, { ...row, artistId: 987 }], options).issues[0].reason, "ambiguous_provider_artist");
const collaborationSeed = { ...seed, providerArtistId: "456", collaborations: [{ name: "SAULT & Guest", credits: [{ artist: "Guest", role: "featured" }] }] };
const collaboration = resolveSeed(collaborationSeed, [{ ...row, artistName: "SAULT & Guest" }], options).tracks[0];
assert.equal(collaboration.artist, "SAULT");
assert.ok(collaboration.credits.some(credit => credit.artist === "Guest"));
assert.equal(resolveSeed(collaborationSeed, [{ ...row, artistId: 999, artistName: "SAULT & Guest" }], options).tracks.length, 0);
for (const value of ["http://music.apple.com/br/album/example/789?i=123", "https://music.apple.com.evil.test/123", "https://user:password@music.apple.com/123",
  "https://music.apple.com/123?i=999", "https://music.apple.com:8443/123", "javascript:alert(1)"]) assert.equal(safeAppleTrackUrl(value, 123), "");
assert.match(stableUuid("apple_music:123"), /^[a-f0-9]{8}-[a-f0-9]{4}-8[a-f0-9]{3}-a[a-f0-9]{3}-[a-f0-9]{12}$/);

const common = { genre: "soul", universe: "rnb_soul_funk", confidence: 0.9, providerLinks: [{ provider: "test" }] };
const candidates = [
  { ...common, key: "reference", artist: "Known artist", song: "Reference", discoveryTier: "reference" },
  { ...common, key: "deep", artist: "Deep artist", song: "Deep", discoveryTier: "deep_cut" },
  { ...common, key: "discovery", artist: "New artist", song: "Discovery", metadata: { discovery_tier: "discovery" } }
];
const beginner = { primaryUniverse: "rnb_soul_funk", experience: "beginner" };
const expert = { primaryUniverse: "rnb_soul_funk", experience: "expert" };
assert.equal(universal.rankCandidates(candidates, beginner)[0].candidate.key, "reference");
assert.equal(universal.rankCandidates(candidates, expert)[0].candidate.key, "discovery");
assert.equal(universal.rankCandidates(candidates, { primaryUniverse: "electronic", universes: ["electronic", "rnb_soul_funk"], experience: "expert" })[0].candidate.key, "deep", "Electronic expertise must not imply expertise in soul");
assert.equal(universal.rankCandidates(candidates, expert, { knownKeys: ["discovery"] })[0].candidate.key, "deep");
assert.equal(universal.rankCandidates(candidates, expert, { knownArtistKeys: ["New artist"], discoverNewArtists: true }).some(entry => entry.candidate.key === "discovery"), false);
assert.equal(universal.rankCandidates(candidates, expert, { rejectedArtistKeys: new Set(["New artist"]) }).some(entry => entry.candidate.key === "discovery"), false);
assert.equal(universal.rankCandidates(result.tracks, expert).length, 0, "Pending pilot must never be recommended");
assert.equal(universal.normalizeTasteProfile({ novelty: 0 }).novelty, 0);
assert.equal(universal.normalizeTasteProfile({ novelty: "invalid" }).novelty, 0.5);
assert.equal(universal.canonicalCandidate({ confidence: 0 }).confidence, 0);
let profileReads = 0;
const countedProfile = { primaryUniverse: "rnb_soul_funk", get experience() { profileReads += 1; return "expert"; } };
universal.rankCandidates(Array.from({ length: 1000 }, (_, index) => ({ ...candidates[index % 3], key: `large_${index}` })), countedProfile);
assert.ok(profileReads <= 2, "Large catalog must normalize taste once, not per recording");
assert.deepEqual(universal.normalizeTasteProfile({ primaryUniverse: "electronic", experience: "expert" }).experienceByUniverse, { electronic: "expert" });
assert.equal(universal.normalizeTasteProfile({ primaryUniverse: "electronic", experience: "expert", experienceByUniverse: { classical: "beginner" } }).experienceByUniverse.classical, "beginner");

const dataset = JSON.parse(await readFile(new URL("../data/universal-catalog-pilot.json", import.meta.url), "utf8"));
assert.equal(dataset.releaseReady, false);
assert.equal(dataset.coverage.length, 12);
assert.ok(dataset.artists.length >= 92, "Preserve the initial matched artist coverage");
assert.ok(dataset.artists.length <= seeds.length);
for (const target of seeds) {
  assert.ok(dataset.artists.some(a => a.key === universal.normalizeKey(target.artist)) || dataset.issues.some(i => i.artist === target.artist), `Missing target must be reported: ${target.artist}`);
}
for (const artist of dataset.artists) {
  assert.equal(artist.status, "needs_review");
  assert.ok(artist.trackKeys.length > 0);
  for (const key of artist.trackKeys) assert.ok(dataset.tracks.some(track => track.key === key && track.artistKey === artist.key));
}
assert.equal(dataset.tracks.length >= 150, true, "Pilot unexpectedly lost researched recordings");
assert.equal(new Set(dataset.tracks.map(track => track.artistKey)).size, dataset.artists.length, "Every matched artist needs a recording");
assert.equal(new Set(dataset.tracks.map(track => track.key)).size, dataset.tracks.length);
for (const track of dataset.tracks) {
  assert.equal(track.status, "needs_review");
  assert.equal(track.playable, false);
  assert.equal(track.source.documentation, "https://performance-partners.apple.com/search-api");
  assert.ok(!Number.isNaN(Date.parse(track.source.retrievedAt)));
  assert.equal(track.metadata.genre_assertion_status, "candidate");
  assert.ok(safeAppleTrackUrl(track.providerLinks[0].url, track.providerLinks[0].externalId));
  assert.ok(seeds.some(seed => seed.universe === track.universe && seed.genre === track.genre));
  if (track.universe === "classical") assert.ok(track.credits.some(credit => credit.role === "composer"));
  const editorialSource = seeds.find(seed => seed.artist === track.metadata.editorial_artist)?.editorialSourceUrl;
  if (editorialSource) assert.equal(track.metadata.editorial_source_url, editorialSource, "Preserve artist/label provenance for new discovery targets");
}
assert.doesNotMatch(JSON.stringify(dataset), /previewUrl|artworkUrl|audio\.m4a/);
const sql = await readFile(new URL("../supabase/seeds/universal_catalog_pilot_candidates.sql", import.meta.url), "utf8");
assert.match(sql, /begin;/);
assert.match(sql, /commit;/);
assert.match(sql, /'needs_review'/);
assert.match(sql, /'candidate', 'sonic_editorial_pilot'/);
assert.match(sql, /identity collision/);
assert.doesNotMatch(sql, /delete from public\.|update public\.|'recommendable'|'subscription_playback'/i);
console.log(`Universal pilot passed: ${seeds.length} editorial artist targets, ${dataset.tracks.length} provider-identified recording candidates, experience-aware ranking, no pending catalog exposure.`);
