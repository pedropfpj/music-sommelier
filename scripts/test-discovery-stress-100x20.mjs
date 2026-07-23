#!/usr/bin/env node

import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const rootDir = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const inventory = JSON.parse(
  fs.readFileSync(path.join(rootDir, "data", "discovery_playable_inventory_v1.json"), "utf8")
);
const tracks = Array.isArray(inventory.tracks) ? inventory.tracks : [];
const opening = ["tech_house", "house", "techno", "deep_house"];
const psyBridge = ["progressive_psy", "uk_garage", "future_garage"];
const dnbBridge = ["dubstep", "liquid_dnb", "drum_and_bass", "jungle"];
const wide = ["neurofunk", ...opening, ...psyBridge, ...dnbBridge];

Object.entries(inventory.counts || {}).forEach(([style, count]) => {
  assert(
    Number(count) >= 20 && Number(count) <= 30,
    `${style} must keep 20-30 verified inventory tracks, got ${count}`
  );
});
assert.equal(new Set(tracks.map((track) => `${track.style}::${trackKey(track)}`)).size, tracks.length);
assert(!tracks.some((track) => track.style === "neurofunk" && normalize(track.artist).includes("audioslave")));
assert(!tracks.some((track) => track.style === "future_garage" && normalize(track.artist).includes("bucky pizzarelli")));

function normalize(value = "") {
  return String(value || "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function trackKey(track) {
  return `${normalize(track.artist)}::${normalize(track.song)}`;
}

function artistKey(track) {
  return normalize(track.artist);
}

function hashUnit(value = "") {
  let hash = 2166136261;
  for (const char of String(value || "")) {
    hash ^= char.charCodeAt(0);
    hash = Math.imul(hash, 16777619);
  }
  return (hash >>> 0) / 4294967296;
}

function family(style = "") {
  if (["tech_house", "house", "deep_house"].includes(style)) return "house";
  if (style === "techno") return "techno";
  if (style === "progressive_psy") return "psytrance";
  if (["liquid_dnb", "drum_and_bass", "jungle", "neurofunk"].includes(style)) return "dnb";
  return "bass";
}

function stageStyles(cardIndex) {
  if (cardIndex < 4) return opening;
  if (cardIndex < 7) return [...psyBridge, ...opening];
  if (cardIndex < 10) return [...dnbBridge, ...psyBridge, ...opening];
  return wide;
}

function rotationScore(userSeed, track) {
  const cohortCount = 6;
  const targetBucket = Math.floor(hashUnit(`${userSeed}::anonymous-cohort`) * cohortCount) % cohortCount;
  const candidateBucket = Math.floor(hashUnit(`track-cohort::${trackKey(track)}`) * cohortCount) % cohortCount;
  const distance = Math.min(
    Math.abs(candidateBucket - targetBucket),
    cohortCount - Math.abs(candidateBucket - targetBucket)
  );
  if (distance === 0) return 11;
  if (distance === 1) return 3.2;
  return -2.4;
}

const globalTrackCounts = new Map();
const globalArtistCounts = new Map();
const globalRecentTrackSession = new Map();
const sessions = [];

for (let sessionIndex = 0; sessionIndex < 100; sessionIndex += 1) {
  const userSeed = `anonymous-${sessionIndex}-${hashUnit(`seed-${sessionIndex}`)}`;
  const delivered = [];
  const deliveredTracks = new Set();
  const deliveredArtists = new Set();
  const styleCounts = new Map();

  for (let cardIndex = 0; cardIndex < 20; cardIndex += 1) {
    const styles = stageStyles(cardIndex);
    const recentStyles = delivered.slice(-2).map((track) => track.style);
    const recentFamilies = delivered.slice(-4).map((track) => family(track.style));
    const candidates = tracks
      .filter((track) => styles.includes(track.style))
      .filter((track) => track.previewUrl || track.deezerTrackId)
      .filter((track) => !deliveredTracks.has(trackKey(track)))
      .filter((track) => !deliveredArtists.has(artistKey(track)))
      .filter((track) => !(recentStyles.length === 2 && recentStyles.every((style) => style === track.style)))
      .filter((track) => !(recentFamilies.length === 4 && recentFamilies.every((item) => item === family(track.style))))
      .map((track) => {
        const key = trackKey(track);
        const artist = artistKey(track);
        const trackExposure = Number(globalTrackCounts.get(key) || 0);
        const artistExposure = Number(globalArtistCounts.get(artist) || 0);
        const recentlyServed = sessionIndex - Number(globalRecentTrackSession.get(key) ?? -1000) <= 1;
        const currentStageRank = styles.indexOf(track.style);
        const styleExposure = Number(styleCounts.get(track.style) || 0);
        const score =
          rotationScore(userSeed, track) +
          hashUnit(`${userSeed}::${cardIndex}::${key}`) * 9.4 -
          Math.log2(trackExposure + 1) * 13 -
          Math.log2(artistExposure + 1) * 4.5 -
          (recentlyServed ? 36 : 0) -
          styleExposure * 4.8 -
          currentStageRank * 0.08;
        return { track, score };
      })
      .sort((left, right) => right.score - left.score);

    const selected = candidates[0]?.track;
    assert(selected, `session ${sessionIndex + 1}, card ${cardIndex + 1} must have a candidate`);
    delivered.push(selected);
    deliveredTracks.add(trackKey(selected));
    deliveredArtists.add(artistKey(selected));
    styleCounts.set(selected.style, Number(styleCounts.get(selected.style) || 0) + 1);
    globalTrackCounts.set(trackKey(selected), Number(globalTrackCounts.get(trackKey(selected)) || 0) + 1);
    globalArtistCounts.set(artistKey(selected), Number(globalArtistCounts.get(artistKey(selected)) || 0) + 1);
    globalRecentTrackSession.set(trackKey(selected), sessionIndex);
  }
  sessions.push(delivered);
}

const overlaps = [];
for (let index = 1; index < sessions.length; index += 1) {
  const previous = new Set(sessions[index - 1].map(trackKey));
  overlaps.push(sessions[index].filter((track) => previous.has(trackKey(track))).length);
}

sessions.forEach((session, index) => {
  assert.equal(new Set(session.map(trackKey)).size, 20, `session ${index + 1} track uniqueness`);
  assert.equal(new Set(session.map(artistKey)).size, 20, `session ${index + 1} artist uniqueness`);
  assert(
    new Set(session.slice(0, 15).map((track) => track.style)).size >= 8,
    `session ${index + 1} must expose at least eight styles by card 15`
  );
  assert(session.every((track) => track.previewUrl || track.deezerTrackId));
});

const sortedOverlaps = overlaps.slice().sort((left, right) => left - right);
const p95Overlap = sortedOverlaps[Math.floor((sortedOverlaps.length - 1) * 0.95)] || 0;
const maxOverlap = Math.max(...overlaps);
const averageOverlap = overlaps.reduce((sum, value) => sum + value, 0) / overlaps.length;
assert(p95Overlap <= 4, `p95 adjacent overlap must stay below 25%, got ${p95Overlap}/20`);
assert(averageOverlap < 5, `average adjacent overlap must stay below 25%, got ${averageOverlap}/20`);
assert(maxOverlap <= 4, `every adjacent session pair must stay below 25%, got ${maxOverlap}/20`);

console.log(JSON.stringify({
  sessions: sessions.length,
  cardsPerSession: 20,
  inventoryTracks: tracks.length,
  inventoryCounts: inventory.counts,
  duplicateTracksWithinSession: 0,
  duplicateArtistsWithinSession: 0,
  minimumStylesByCard15: Math.min(...sessions.map((session) => new Set(session.slice(0, 15).map((track) => track.style)).size)),
  adjacentOverlap: {
    averageTracks: Number(averageOverlap.toFixed(2)),
    p95Tracks: p95Overlap,
    maxTracks: maxOverlap,
    p95Percent: Math.round((p95Overlap / 20) * 100)
  },
  playableRoutes: `${tracks.filter((track) => track.previewUrl || track.deezerTrackId).length}/${tracks.length}`
}, null, 2));
