import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import vm from "node:vm";
import { startTestPreviewServer } from "./test-preview-server.mjs";

const previewSession = await startTestPreviewServer({ envName: "STRESS_BASE_URL" });
const BASE_URL = previewSession.baseUrl;

try {
const ROUTE_CANDIDATES_PER_STYLE = 10;
const LIVE_PREVIEWS_PER_STYLE = Math.max(0, Number(process.env.STRESS_LIVE_PREVIEWS_PER_STYLE) || 0);
const STYLES = [
  "full_on_night",
  "forest_psy",
  "dark_psy",
  "hi_tech",
  "psycore",
  "techno",
  "hard_techno",
  "industrial_techno",
  "acid_techno",
  "dub_techno"
];

const BPM_RANGES = {
  full_on_night: { min: 146, max: 154 },
  forest_psy: { min: 145, max: 154 },
  dark_psy: { min: 154, max: 175 },
  hi_tech: { min: 176, max: 230 },
  psycore: { min: 175, max: 300 },
  techno: { min: 128, max: 136 },
  hard_techno: { min: 145, max: 160 },
  industrial_techno: { min: 130, max: 150 },
  acid_techno: { min: 124, max: 145 },
  dub_techno: { min: 118, max: 128 }
};

const BLOCKED_TRACKS = new Set([
  "furious::don't change your style",
  "furious::hang your head",
  "furious::punk bashin' boogie",
  "furious::wet",
  "furious::who to trust",
  "silent horror::17 kills",
  "silent horror::murder castle",
  "silent horror::silver screen",
  "silent horror::the cabinet of dr. caligari",
  "cosmo::alle meine nachbarn",
  "cosmo::den sommer uberleben",
  "cosmo::du machst mich high",
  "cosmo::tanzschein",
  "n.o.m::i can't wait",
  "n.o.m::look",
  "n.o.m::mega punch",
  "parus::high voltage",
  "parus::laboom",
  "parus::legend",
  "quasar::be my lover (techno)",
  "quasar::drenagem",
  "quasar::em seu lugar",
  "quasar::termo",
  "loke::plata ou nada (feat. dogga dogga)"
]);

const DUB_TECHNO_CROSSOVERS = new Set([
  "anna",
  "charlotte de witte",
  "enrico sangiuliano",
  "maceo plex",
  "pole",
  "robert hood"
]);
const ACID_TECHNO_CROSSOVERS = new Set(["jeff mills", "robert hood"]);

function normalize(value = "") {
  return String(value || "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/\s+/g, " ")
    .trim();
}

function artistKey(value = "") {
  return normalize(value).replace(/ø/g, "o").replace(/[^a-z0-9]+/g, " ").trim();
}

function trackKey(track = {}) {
  return `${normalize(track.artist)}::${normalize(track.song)}`;
}

function embeddedTitleBpm(value = "") {
  const match = String(value || "").replace(",", ".").match(/(?:^|[\s([_-])(\d{2,3}(?:\.\d+)?)\s*bpm\b/i);
  return match ? Number(match[1]) || 0 : 0;
}

function bpmFits(style, bpm) {
  const range = BPM_RANGES[style];
  return !range || !Number.isFinite(Number(bpm)) || Number(bpm) <= 0 || (Number(bpm) >= range.min && Number(bpm) <= range.max);
}

function extractCuratedStressTracks(source) {
  const start = source.indexOf("const CURATED_STRESS_RESILIENT_TRACKS = [");
  const end = source.indexOf("\n\nconst catalog = [", start);
  assert.ok(start >= 0 && end > start, "CURATED_STRESS_RESILIENT_TRACKS must exist in app.js");
  const context = {
    CURATED_PREVIEW_ORIGIN: BASE_URL,
    STYLE_SEARCH_TERMS: {},
    encodeURIComponent,
    mapBpmToRange: (bpm) => `${bpm} BPM`,
    window: { location: { origin: BASE_URL } },
    result: null
  };
  const snippet = `${source.slice(start, end)}\nresult = CURATED_STRESS_RESILIENT_TRACKS;`;
  vm.runInNewContext(snippet, context, { timeout: 1000 });
  return Array.from(context.result || []);
}

function normalizeApiTrack(row = {}) {
  const metadata = row.metadata && typeof row.metadata === "object" ? row.metadata : {};
  return {
    style: String(row.style || "").trim(),
    artist: String(row.artist || "").trim(),
    song: String(row.song || "").trim(),
    label: String(row.label || "").trim(),
    bpmExact: Number(row.bpm_exact) || 0,
    previewUrl: String(row.preview_url || "").trim(),
    deezerTrackId: String(metadata.deezer_track_id || metadata.deezerTrackId || "").trim(),
    source: String(row.source || "supabase_catalog_extra").trim()
  };
}

async function fetchStyleTracks(style) {
  const response = await fetch(`${BASE_URL}/api/catalog-extra?style=${encodeURIComponent(style)}&type=tracks&limit=200`, {
    headers: { Accept: "application/json" }
  });
  assert.equal(response.status, 200, `${style}: catalog-extra returned HTTP ${response.status}`);
  const payload = await response.json();
  assert.equal(payload.ok, true, `${style}: catalog-extra response was not ok`);
  return (payload.tracks || []).map(normalizeApiTrack);
}

async function fetchWithTimeout(url, options = {}, timeoutMs = 6500) {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), timeoutMs);
  try {
    return await fetch(url, { ...options, signal: controller.signal });
  } finally {
    clearTimeout(timeout);
  }
}

async function probeAudioUrl(url) {
  if (!/^https?:\/\//i.test(String(url || ""))) return false;
  try {
    const response = await fetchWithTimeout(url, {
      headers: {
        Accept: "audio/*,*/*;q=0.8",
        Range: "bytes=0-1023"
      },
      redirect: "follow"
    });
    const contentType = String(response.headers.get("content-type") || "").toLowerCase();
    const ok = response.ok && (!contentType || /audio|octet-stream/.test(contentType));
    await response.body?.cancel().catch(() => {});
    return ok;
  } catch (_error) {
    return false;
  }
}

async function deezerPlayback(track) {
  try {
    let deezerTrackId = track.deezerTrackId;
    if (!deezerTrackId) {
      const query = encodeURIComponent(`artist:"${track.artist}" track:"${track.song}"`);
      const searchResponse = await fetchWithTimeout(`https://api.deezer.com/search?q=${query}&limit=15`, {
        headers: { Accept: "application/json" }
      });
      if (!searchResponse.ok) return null;
      const searchPayload = await searchResponse.json();
      const expectedArtist = artistKey(track.artist);
      const expectedTitle = normalize(track.song).replace(/\s*\([^)]*\)\s*/g, " ").trim();
      const match = (searchPayload.data || []).find((row) => {
        const candidateArtist = artistKey(row.artist?.name);
        const candidateTitle = normalize(row.title || row.title_short).replace(/\s*\([^)]*\)\s*/g, " ").trim();
        return candidateArtist === expectedArtist && (candidateTitle.includes(expectedTitle) || expectedTitle.includes(candidateTitle));
      });
      deezerTrackId = match?.id ? String(match.id) : "";
    }
    if (!deezerTrackId) return null;
    const response = await fetchWithTimeout(`https://api.deezer.com/track/${encodeURIComponent(deezerTrackId)}`, {
      headers: { Accept: "application/json" }
    });
    if (!response.ok) return null;
    const details = await response.json();
    if (details.error || !details.preview) return null;
    if (artistKey(details.artist?.name) !== artistKey(track.artist)) return null;
    const expectedTitle = normalize(track.song).replace(/\s*\([^)]*\)\s*/g, " ").trim();
    const actualTitle = normalize(details.title || details.title_short).replace(/\s*\([^)]*\)\s*/g, " ").trim();
    if (!actualTitle.includes(expectedTitle) && !expectedTitle.includes(actualTitle)) return null;
    if (!bpmFits(track.style, Number(details.bpm) || 0)) return null;
    return details.preview;
  } catch (_error) {
    return null;
  }
}

async function appMetadataPlayback(track) {
  try {
    const params = new URLSearchParams({
      artist: track.artist,
      song: track.song,
      style: track.style
    });
    const response = await fetchWithTimeout(`${BASE_URL}/api/track-metadata?${params.toString()}`, {
      headers: { Accept: "application/json" }
    });
    if (!response.ok) return null;
    const payload = await response.json();
    const best = payload?.best && typeof payload.best === "object" ? payload.best : null;
    if (!best?.previewUrl) return null;
    if (artistKey(best.artist) !== artistKey(track.artist)) return null;
    const expectedTitle = normalize(track.song).replace(/\s*\([^)]*\)\s*/g, " ").trim();
    const actualTitle = normalize(best.song || best.title).replace(/\s*\([^)]*\)\s*/g, " ").trim();
    if (!actualTitle.includes(expectedTitle) && !expectedTitle.includes(actualTitle)) return null;
    if (!bpmFits(track.style, Number(best.bpmExact) || 0)) return null;
    return best.previewUrl;
  } catch (_error) {
    return null;
  }
}

async function verifyPlayable(track) {
  const directOk = track.previewUrl ? await probeAudioUrl(track.previewUrl) : false;
  if (directOk) return { ok: true, route: "catalog_preview" };
  const refreshedPreview = await deezerPlayback(track);
  if (refreshedPreview) {
    const refreshedOk = await probeAudioUrl(refreshedPreview);
    if (refreshedOk) return { ok: true, route: "deezer_refresh" };
  }
  const resolvedPreview = await appMetadataPlayback(track);
  if (!resolvedPreview) return { ok: false, route: "none" };
  const resolvedOk = await probeAudioUrl(resolvedPreview);
  return { ok: resolvedOk, route: resolvedOk ? "track_metadata" : "none" };
}

function staticTrackIsValid(style, track) {
  if (track.style !== style || !track.artist || !track.song) return false;
  if (BLOCKED_TRACKS.has(trackKey(track))) return false;
  if (!bpmFits(style, Number(track.bpmExact) || 0)) return false;
  const titleBpm = embeddedTitleBpm(track.song);
  if (titleBpm && !bpmFits(style, titleBpm)) return false;
  if (style === "dub_techno" && DUB_TECHNO_CROSSOVERS.has(artistKey(track.artist))) return false;
  return Boolean(track.previewUrl || track.deezerTrackId);
}

async function selectLivePreviews(style, tracks) {
  const tracksByArtist = new Map();
  for (const track of tracks) {
    if (!staticTrackIsValid(style, track)) continue;
    const key = artistKey(track.artist);
    if (!key) continue;
    if (!tracksByArtist.has(key)) tracksByArtist.set(key, []);
    tracksByArtist.get(key).push(track);
  }

  const artistGroups = Array.from(tracksByArtist.values());
  const selected = [];
  for (let index = 0; index < artistGroups.length && selected.length < LIVE_PREVIEWS_PER_STYLE; index += 5) {
    const batch = artistGroups.slice(index, index + 5);
    const probed = await Promise.all(batch.map(async (artistTracks) => {
      for (const track of artistTracks.slice(0, 5)) {
        const playback = await verifyPlayable(track);
        if (playback.ok) return { track, playback };
      }
      return null;
    }));
    for (const result of probed) {
      if (result?.playback?.ok && selected.length < LIVE_PREVIEWS_PER_STYLE) selected.push(result);
    }
  }
  return { selected, candidateArtists: artistGroups.length };
}

const appSource = await readFile(new URL("../app.js", import.meta.url), "utf8");
assert.match(appSource, /function explicitTrackTitleBpm\(/, "app.js must reject explicit out-of-range BPM titles");
assert.match(appSource, /titleBpm && !bpmFitsStyle\(track\.style, titleBpm\)/, "recommendation gate must apply title BPM validation");
const curatedTracks = extractCuratedStressTracks(appSource);

const report = [];
for (const style of STYLES) {
  const remoteTracks = await fetchStyleTracks(style);
  const blockedRemoteTracks = remoteTracks.filter((track) => BLOCKED_TRACKS.has(trackKey(track)));
  assert.equal(blockedRemoteTracks.length, 0, `${style}: blocked homonym leaked through catalog-extra`);
  if (style === "acid_techno") {
    const acidCrossovers = remoteTracks.filter((track) => ACID_TECHNO_CROSSOVERS.has(artistKey(track.artist)));
    assert.equal(acidCrossovers.length, 0, "acid_techno: broad techno artist leaked into fine-style results");
  }
  if (style === "dub_techno") {
    const dubCrossovers = remoteTracks.filter((track) => DUB_TECHNO_CROSSOVERS.has(artistKey(track.artist)));
    assert.equal(dubCrossovers.length, 0, "dub_techno: crossover artist leaked into fine-style results");
  }
  const localTracks = curatedTracks.filter((track) => track.style === style);
  const merged = [...localTracks, ...remoteTracks];
  const { selected, candidateArtists } = await selectLivePreviews(style, merged);
  const artists = new Set(selected.map(({ track }) => artistKey(track.artist)));
  const songs = new Set(selected.map(({ track }) => trackKey(track)));

  assert.ok(candidateArtists >= ROUTE_CANDIDATES_PER_STYLE, `${style}: only ${candidateArtists}/${ROUTE_CANDIDATES_PER_STYLE} artist-distinct playback candidates`);
  assert.equal(selected.length, LIVE_PREVIEWS_PER_STYLE, `${style}: only ${selected.length}/${LIVE_PREVIEWS_PER_STYLE} live previews across ${candidateArtists} candidate artists`);
  assert.equal(artists.size, LIVE_PREVIEWS_PER_STYLE, `${style}: artist repetition detected`);
  assert.equal(songs.size, LIVE_PREVIEWS_PER_STYLE, `${style}: track repetition detected`);
  selected.forEach(({ track }) => {
    assert.ok(track.artist, `${style}: recommendation without artist`);
    assert.equal(track.style, style, `${style}: cross-style recommendation ${track.style}`);
  });

  const routeCounts = selected.reduce((counts, { playback }) => {
    counts[playback.route] = (counts[playback.route] || 0) + 1;
    return counts;
  }, {});
  report.push({
    style,
    tests: selected.length,
    artists: artists.size,
    playable: selected.length,
    catalogPreview: routeCounts.catalog_preview || 0,
    deezerRefresh: routeCounts.deezer_refresh || 0,
    candidateArtists
  });
}

const total = report.reduce((sum, row) => sum + row.tests, 0);
assert.equal(total, STYLES.length * LIVE_PREVIEWS_PER_STYLE, "stress test did not execute the live preview sample for every style");

console.table(report);
const liveSummary = LIVE_PREVIEWS_PER_STYLE > 0
  ? ` e ${LIVE_PREVIEWS_PER_STYLE} preview(s) confirmado(s) ao vivo por estilo`
  : "; a prova externa ao vivo é opcional com STRESS_LIVE_PREVIEWS_PER_STYLE=1";
console.log(`PASS: ${STYLES.length} subgêneros; ${ROUTE_CANDIDATES_PER_STYLE} rotas candidatas por estilo${liveSummary}.`);
} finally {
  await previewSession.stop();
}
