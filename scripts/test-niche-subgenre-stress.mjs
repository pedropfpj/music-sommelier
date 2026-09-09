#!/usr/bin/env node

import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import vm from "node:vm";
import { performance } from "node:perf_hooks";
import { fileURLToPath } from "node:url";

const rootDir = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const baseUrl = String(process.env.SONIC_STRESS_BASE_URL || "http://127.0.0.1:4174").replace(/\/+$/, "");
const httpRounds = Math.max(1, Number(process.env.SONIC_STRESS_HTTP_ROUNDS) || 20);
const recommendationRounds = Math.max(25, Number(process.env.SONIC_STRESS_RECOMMENDATION_ROUNDS) || 250);
const minimumPlayableArtists = Math.max(1, Number(process.env.SONIC_STRESS_MIN_PLAYABLE_ARTISTS) || 5);
const audioArtistsPerStyle = Math.max(1, Number(process.env.SONIC_STRESS_AUDIO_ARTISTS) || minimumPlayableArtists);
const audioProbeConcurrency = Math.max(1, Math.min(8, Number(process.env.SONIC_STRESS_AUDIO_CONCURRENCY) || 3));
const targetReportRelative = process.env.SONIC_STRESS_TARGET_REPORT || "reports/underrepresented_subgenre_expansion_v18_20260820.json";
const outputReportRelative = process.env.SONIC_STRESS_OUTPUT_REPORT || "reports/niche_subgenre_stress_20260820.json";
const reportPath = path.join(rootDir, outputReportRelative);
const expansionReport = JSON.parse(fs.readFileSync(path.join(rootDir, targetReportRelative), "utf8"));
const appSource = fs.readFileSync(path.join(rootDir, "app.js"), "utf8");
const styles = Object.keys(expansionReport.perStyle || {});

assert.ok(styles.length > 0, "Stress test target report must contain at least one subgenre");
if (Number(process.env.SONIC_STRESS_EXPECTED_STYLES) > 0) {
  assert.equal(styles.length, Number(process.env.SONIC_STRESS_EXPECTED_STYLES), "Stress test target count changed unexpectedly");
}

function normalize(value = "") {
  return String(value || "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, " ")
    .trim();
}

function trackKey(track = {}) {
  if (!track) return "";
  return normalize(`${track.artist || ""}::${track.song || ""}`);
}

function hydrateTrack(track = {}) {
  return {
    ...track,
    previewUrl: String(track.preview_url || track.previewUrl || "").trim(),
    deezerTrackId: String(track.deezer_track_id || track.deezerTrackId || "").trim(),
    bandcampTrackId: String(track.bandcamp_track_id || track.bandcampTrackId || "").trim(),
    bandcampTrackUrl: String(track.bandcamp_track_url || track.bandcampTrackUrl || "").trim(),
    soundcloudTrackUrl: String(track.soundcloud_track_url || track.soundcloudTrackUrl || "").trim()
  };
}

function hasInstantRoute(track = {}) {
  return Boolean(
    track.previewUrl ||
    track.deezerTrackId ||
    track.bandcampTrackId ||
    track.bandcampTrackUrl ||
    track.soundcloudTrackUrl
  );
}

function percentile(values, ratio) {
  const sorted = [...values].sort((a, b) => a - b);
  if (!sorted.length) return 0;
  return sorted[Math.min(sorted.length - 1, Math.max(0, Math.ceil(sorted.length * ratio) - 1))];
}

async function fetchWithTimeout(url, options = {}, timeoutMs = 8_000) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  try {
    return await fetch(url, { ...options, signal: controller.signal });
  } finally {
    clearTimeout(timer);
  }
}

async function mapConcurrent(items, concurrency, worker) {
  const results = new Array(items.length);
  let cursor = 0;
  const runners = Array.from({ length: Math.min(concurrency, items.length) }, async () => {
    while (cursor < items.length) {
      const index = cursor;
      cursor += 1;
      results[index] = await worker(items[index], index);
    }
  });
  await Promise.all(runners);
  return results;
}

function extractFunction(name) {
  const marker = `function ${name}`;
  const start = appSource.indexOf(marker);
  assert.ok(start >= 0, `Missing app function: ${name}`);
  const signatureEnd = appSource.indexOf(") {", start);
  assert.ok(signatureEnd > start, `Missing app function body: ${name}`);
  const bodyStart = signatureEnd + 2;
  let depth = 0;
  let quote = "";
  let escaped = false;
  let lineComment = false;
  let blockComment = false;
  for (let index = bodyStart; index < appSource.length; index += 1) {
    const char = appSource[index];
    const next = appSource[index + 1];
    if (lineComment) {
      if (char === "\n") lineComment = false;
      continue;
    }
    if (blockComment) {
      if (char === "*" && next === "/") {
        blockComment = false;
        index += 1;
      }
      continue;
    }
    if (quote) {
      if (escaped) escaped = false;
      else if (char === "\\") escaped = true;
      else if (char === quote) quote = "";
      continue;
    }
    if (char === "/" && next === "/") {
      lineComment = true;
      index += 1;
      continue;
    }
    if (char === "/" && next === "*") {
      blockComment = true;
      index += 1;
      continue;
    }
    if (char === '"' || char === "'" || char === "`") {
      quote = char;
      continue;
    }
    if (char === "{") depth += 1;
    if (char === "}") depth -= 1;
    if (depth === 0) return appSource.slice(start, index + 1);
  }
  throw new Error(`Unclosed app function: ${name}`);
}

function createInstantPickerHarness(style, tracks) {
  const recentTrackKeys = new Set();
  const recentArtists = [];
  const context = vm.createContext({
    currentRecommendation: null,
    suggestionQueueTracks: [],
    prewarmedSwipeTrackKeys: new Set(),
    catalog: tracks,
    recommendationTrackKey: trackKey,
    selectableSwipeStyle: (value) => String(value || "").trim(),
    buildGlobalArtistExclusionSet: (extraArtist = "") => new Set(
      [...recentArtists, extraArtist].map(normalize).filter(Boolean)
    ),
    artistSetHasMatch: (setRef, artist = "") => setRef.has(normalize(artist)),
    isTrackEligibleForRecommendation: (track) => Boolean(track?.artist && track?.song && track?.style === style),
    trackMatchesRequestedSubgenreEvidence: (track, prefs) => track?.style === prefs?.style,
    trackHasInstantPlaybackRoute: hasInstantRoute,
    anonymousTrackWasRecentlyExposed: (key) => recentTrackKeys.has(key),
    trackBlockedByKnownSignals: (track) => recentTrackKeys.has(trackKey(track)),
    anonymousExposurePenalty: () => 0,
    trackHasReliableAudioPreview: (track) => Boolean(track?.previewUrl),
    getAllSelectableStyles: () => [style],
    shouldDeferStyleForTasteMaturity: () => false,
    openingDiscoveryRampScore: () => 0,
    catalogTracksForStyle: (requestedStyle) => tracks.filter((track) => track.style === requestedStyle)
  });
  vm.runInContext(`${extractFunction("pickInstantPrimaryNextTrack")}; this.pick = pickInstantPrimaryNextTrack;`, context);
  return {
    pick(sourceTrack) {
      return context.pick(sourceTrack, style) || null;
    },
    remember(track) {
      const key = trackKey(track);
      if (key) recentTrackKeys.add(key);
      recentArtists.push(normalize(track.artist));
      while (recentArtists.length > 4) recentArtists.shift();
    },
    recycle() {
      recentTrackKeys.clear();
      recentArtists.splice(0, recentArtists.length);
    }
  };
}

async function probeAudio(url) {
  let lastError = "";
  for (let attempt = 0; attempt < 2; attempt += 1) {
    const startedAt = performance.now();
    try {
      const response = await fetchWithTimeout(url, {
        redirect: "follow",
        headers: { Accept: "audio/*,*/*;q=0.8", Range: "bytes=0-2047" }
      });
      const contentType = String(response.headers.get("content-type") || "").toLowerCase();
      const ok = response.ok && (!contentType || /audio|octet-stream|mp4/.test(contentType));
      await response.body?.cancel().catch(() => {});
      if (ok) return { ok: true, latencyMs: performance.now() - startedAt, contentType };
      lastError = `HTTP ${response.status} ${contentType || "unknown-content-type"}`;
    } catch (error) {
      lastError = String(error?.name || error?.message || error);
    }
  }
  return { ok: false, latencyMs: 0, error: lastError };
}

function previewIsExpired(url = "") {
  const match = String(url || "").match(/(?:^|[~&?])exp=(\d{9,12})(?:$|[~&])/i);
  return Boolean(match && Number(match[1]) <= Math.floor(Date.now() / 1000) + 30);
}

function titleKey(value = "") {
  return normalize(String(value || "").replace(/\s*[([].*?[)\]]\s*/g, " "));
}

async function refreshedDeezerPreview(track) {
  if (!track.deezerTrackId) return "";
  try {
    const response = await fetchWithTimeout(`https://api.deezer.com/track/${encodeURIComponent(track.deezerTrackId)}`, {
      headers: { Accept: "application/json" }
    });
    if (!response.ok) return "";
    const details = await response.json();
    const expectedArtist = normalize(track.artist);
    const actualArtist = normalize(details?.artist?.name || "");
    const expectedTitle = titleKey(track.song);
    const actualTitle = titleKey(details?.title || details?.title_short || "");
    const artistMatches = actualArtist === expectedArtist || actualArtist.includes(expectedArtist) || expectedArtist.includes(actualArtist);
    const titleMatches = actualTitle === expectedTitle || actualTitle.includes(expectedTitle) || expectedTitle.includes(actualTitle);
    return artistMatches && titleMatches ? String(details.preview || "").trim() : "";
  } catch (_error) {
    return "";
  }
}

async function refreshedItunesPreview(track) {
  try {
    const term = encodeURIComponent(`${track.artist} ${track.song}`);
    const response = await fetchWithTimeout(`https://itunes.apple.com/search?term=${term}&entity=song&limit=30`, {
      headers: { Accept: "application/json" }
    });
    if (!response.ok) return "";
    const payload = await response.json();
    const expectedArtist = normalize(track.artist);
    const expectedTitle = titleKey(track.song);
    const match = (payload.results || []).find((row) => {
      const actualArtist = normalize(row.artistName || "");
      const actualTitle = titleKey(row.trackName || "");
      const artistMatches = actualArtist === expectedArtist || actualArtist.includes(expectedArtist) || expectedArtist.includes(actualArtist);
      const titleMatches = actualTitle === expectedTitle || actualTitle.includes(expectedTitle) || expectedTitle.includes(actualTitle);
      return artistMatches && titleMatches && row.previewUrl;
    });
    return String(match?.previewUrl || "").trim();
  } catch (_error) {
    return "";
  }
}

async function probeArtistTracks(job) {
  const attemptedUrls = new Set();
  let lastError = "no_preview_candidate";
  let totalLatencyMs = 0;
  for (const track of job.tracks.slice(0, 5)) {
    const candidates = [];
    if (track.previewUrl && !previewIsExpired(track.previewUrl)) candidates.push({ url: track.previewUrl, route: "catalog" });
    const deezerPreview = await refreshedDeezerPreview(track);
    if (deezerPreview) candidates.push({ url: deezerPreview, route: "deezer_refresh" });
    for (const candidate of candidates) {
      if (!candidate.url || attemptedUrls.has(candidate.url)) continue;
      attemptedUrls.add(candidate.url);
      const result = await probeAudio(candidate.url);
      totalLatencyMs += result.latencyMs;
      if (result.ok) return { ...job, ...result, latencyMs: totalLatencyMs, route: candidate.route, song: track.song };
      lastError = result.error || lastError;
    }
  }
  for (const track of job.tracks.slice(0, 5)) {
    const itunesPreview = await refreshedItunesPreview(track);
    if (!itunesPreview || attemptedUrls.has(itunesPreview)) continue;
    attemptedUrls.add(itunesPreview);
    const result = await probeAudio(itunesPreview);
    totalLatencyMs += result.latencyMs;
    if (result.ok) return { ...job, ...result, latencyMs: totalLatencyMs, route: "itunes_refresh", song: track.song };
    lastError = result.error || lastError;
  }
  return { ...job, ok: false, latencyMs: totalLatencyMs, error: lastError, route: "none", song: job.tracks[0]?.song || "" };
}

const manifestResponse = await fetchWithTimeout(`${baseUrl}/data/runtime-catalog-v1/manifest.json`);
assert.equal(manifestResponse.status, 200, `Runtime manifest returned HTTP ${manifestResponse.status}`);
const manifest = await manifestResponse.json();
const tracksByStyle = new Map();

for (const style of styles) {
  const shard = manifest.styles?.[style];
  assert.ok(shard, `${style}: missing runtime shard`);
  const response = await fetchWithTimeout(`${baseUrl}/data/runtime-catalog-v1/${shard}`);
  assert.equal(response.status, 200, `${style}: initial shard returned HTTP ${response.status}`);
  tracksByStyle.set(style, (await response.json()).map(hydrateTrack));
}

const httpJobs = [];
for (let round = 0; round < httpRounds; round += 1) {
  for (const style of styles) httpJobs.push({ round, style, shard: manifest.styles[style] });
}
const httpResults = await mapConcurrent(httpJobs, 24, async ({ style, shard }) => {
  const startedAt = performance.now();
  const response = await fetchWithTimeout(`${baseUrl}/data/runtime-catalog-v1/${shard}`, { cache: "no-store" }, 4_000);
  const body = response.ok ? await response.json() : null;
  return {
    style,
    ok: response.status === 200 && Array.isArray(body) && body.every((track) => track.style === style),
    status: response.status,
    latencyMs: performance.now() - startedAt
  };
});

const failedHttp = httpResults.filter((result) => !result.ok);
const httpLatencies = httpResults.map((result) => result.latencyMs);
assert.deepEqual(failedHttp, [], `Concurrent shard loading failed ${failedHttp.length} times`);
assert.ok(percentile(httpLatencies, 0.95) < 250, `Shard HTTP p95 is too high: ${percentile(httpLatencies, 0.95).toFixed(1)}ms`);
assert.ok(Math.max(...httpLatencies) < 1_500, `Shard HTTP max latency is too high: ${Math.max(...httpLatencies).toFixed(1)}ms`);

const perStyle = [];
const audioJobs = [];
let totalRecommendations = 0;
let totalRecycles = 0;
let immediateArtistRepeats = 0;
let immediateTrackRepeats = 0;

for (const style of styles) {
  const tracks = tracksByStyle.get(style) || [];
  const playableTracks = tracks.filter(hasInstantRoute);
  const playableArtists = new Set(playableTracks.map((track) => normalize(track.artist)).filter(Boolean));
  assert.ok(playableArtists.size >= minimumPlayableArtists, `${style}: fewer than ${minimumPlayableArtists} playable artists under stress`);

  const harness = createInstantPickerHarness(style, tracks);
  let current = null;
  let recycles = 0;
  const servedArtists = new Set();
  const servedTracks = new Set();
  const startedAt = performance.now();

  for (let round = 0; round < recommendationRounds; round += 1) {
    let next = harness.pick(current);
    if (!next) {
      recycles += 1;
      harness.recycle();
      next = harness.pick(current);
    }
    assert.ok(next, `${style}: recommendation pool deadlocked at round ${round + 1}`);
    assert.equal(next.style, style, `${style}: cross-subgenre recommendation leaked at round ${round + 1}`);
    assert.ok(hasInstantRoute(next), `${style}: recommendation without an instant playback route`);
    if (current && normalize(current.artist) === normalize(next.artist)) immediateArtistRepeats += 1;
    if (current && trackKey(current) === trackKey(next)) immediateTrackRepeats += 1;
    servedArtists.add(normalize(next.artist));
    servedTracks.add(trackKey(next));
    harness.remember(next);
    current = next;
  }

  const recommendationLatencyMs = performance.now() - startedAt;
  assert.ok(servedArtists.size >= minimumPlayableArtists, `${style}: stress run reached only ${servedArtists.size} artists`);
  assert.ok(recommendationLatencyMs < 1_500, `${style}: ${recommendationRounds} selections took ${recommendationLatencyMs.toFixed(1)}ms`);

  const tracksByArtist = new Map();
  for (const track of playableTracks) {
    const artist = normalize(track.artist);
    if (!artist || !(track.previewUrl || track.deezerTrackId)) continue;
    if (!tracksByArtist.has(artist)) tracksByArtist.set(artist, []);
    tracksByArtist.get(artist).push(track);
  }
  const selectedAudioGroups = [...tracksByArtist.entries()].slice(0, audioArtistsPerStyle);
  selectedAudioGroups.forEach(([, artistTracks]) => {
    audioJobs.push({ style, artist: artistTracks[0].artist, tracks: artistTracks });
  });
  assert.ok(selectedAudioGroups.length >= audioArtistsPerStyle, `${style}: insufficient direct artist-distinct audio probes`);

  totalRecommendations += recommendationRounds;
  totalRecycles += recycles;
  perStyle.push({
    style,
    catalogTracks: tracks.length,
    playableTracks: playableTracks.length,
    playableArtists: playableArtists.size,
    recommendationRounds,
    servedArtists: servedArtists.size,
    servedTracks: servedTracks.size,
    recycles,
    recommendationLatencyMs: Number(recommendationLatencyMs.toFixed(2)),
    audioPassed: 0,
    audioFailed: 0,
    audioRefreshed: 0
  });
}

assert.equal(immediateArtistRepeats, 0, "Immediate artist repetition occurred during stress recommendations");
assert.equal(immediateTrackRepeats, 0, "Immediate track repetition occurred during stress recommendations");

// External preview providers throttle burst traffic far below the local shard
// capacity. Keep catalog stress high while probing audio at a user-realistic rate.
const audioResults = await mapConcurrent(audioJobs, audioProbeConcurrency, probeArtistTracks);
for (const result of audioResults) {
  const row = perStyle.find((entry) => entry.style === result.style);
  if (result.ok) {
    row.audioPassed += 1;
    if (result.route !== "catalog") row.audioRefreshed += 1;
  }
  else row.audioFailed += 1;
}
const failedAudio = audioResults.filter((result) => !result.ok);
assert.deepEqual(
  failedAudio.map(({ style, artist, song, error }) => ({ style, artist, song, error })),
  [],
  `${failedAudio.length}/${audioResults.length} artist-distinct audio probes failed`
);

const summary = {
  styles: styles.length,
  totalRecommendations,
  httpRequests: httpResults.length,
  httpFailures: failedHttp.length,
  httpP50Ms: Number(percentile(httpLatencies, 0.5).toFixed(2)),
  httpP95Ms: Number(percentile(httpLatencies, 0.95).toFixed(2)),
  httpMaxMs: Number(Math.max(...httpLatencies).toFixed(2)),
  audioProbes: audioResults.length,
  audioFailures: failedAudio.length,
  audioRefreshed: audioResults.filter((result) => result.ok && result.route !== "catalog").length,
  audioP95Ms: Number(percentile(audioResults.map((result) => result.latencyMs), 0.95).toFixed(2)),
  immediateArtistRepeats,
  immediateTrackRepeats,
  totalRecycles
};

fs.writeFileSync(reportPath, `${JSON.stringify({
  generatedAt: new Date().toISOString(),
  baseUrl,
  targetReport: targetReportRelative,
  parameters: { httpRounds, recommendationRounds, minimumPlayableArtists, audioArtistsPerStyle, audioProbeConcurrency },
  summary,
  perStyle
}, null, 2)}\n`, "utf8");

console.table(perStyle.map((row) => ({
  style: row.style,
  tracks: row.catalogTracks,
  playable: row.playableTracks,
  artists: row.playableArtists,
  served: row.servedArtists,
  recycles: row.recycles,
  audio: `${row.audioPassed}/${row.audioPassed + row.audioFailed}`,
  refreshed: row.audioRefreshed
})));
console.log(
  `Subgenre stress passed: ${summary.totalRecommendations} recommendations, ${summary.httpRequests} concurrent shard requests (p95 ${summary.httpP95Ms}ms), ${summary.audioProbes} artist-distinct audio probes, zero immediate repeats or style leaks.`
);
console.log(`Report: ${path.relative(rootDir, reportPath)}`);
