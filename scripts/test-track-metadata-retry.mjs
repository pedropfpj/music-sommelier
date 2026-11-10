import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import vm from "node:vm";

const app = await readFile(process.env.SONIC_METADATA_RETRY_APP_PATH || new URL("../app.js", import.meta.url), "utf8");
function functionSource(name) {
  const start = app.search(new RegExp(`(?:^|\\n)(?:async )?function ${name}\\(`));
  assert.ok(start >= 0, `Missing actual runtime function ${name}`);
  const end = app.indexOf("\n}", start);
  assert.ok(end > start, `Unclosed runtime function ${name}`);
  return app.slice(start, end + 2);
}
const track = { artist: "Dark Whisper", song: "Rhythm of The Infinite", style: "psycore", deezerTrackId: "740834142" };
const fresh = { artist: track.artist, song: track.song, previewUrl: "https://media.example/exact.mp3" };
function fixture(outcomes = []) {
  let now = Date.now();
  const calls = [];
  const context = vm.createContext({
    URL, Date: class extends Date { static now() { return now; } },
    trackMetadataApiCache: new Map(), FAST_OPTIONAL_API_TIMEOUT_MS: 4500,
    resolveMusicApiEndpoint: () => "/api/track-metadata",
    trackMetadataApiCacheKey: item => `${item.artist}|${item.song}|${item.deezerTrackId || ""}`,
    coverArtReleaseName: () => "", trackDurationSecondsForApi: () => 568,
    trackReleaseYearForApi: () => 2019, catalogTrackMetadataText: () => "",
    fetchWithTimeout: async (url, options, timeoutMs) => {
      calls.push({ url, body: JSON.parse(options.body), timeoutMs });
      const outcome = outcomes.shift();
      if (outcome instanceof Error) throw outcome;
      return { ok: outcome?.status ? outcome.status < 400 : true, json: async () => ({ best: outcome?.best ?? null }) };
    }
  });
  vm.runInContext(["previewUrlExpiryEpoch", "previewUrlIsExpired", "normalizePreviewUrl", "trackAppleRecordingId", "fetchTrackMetadataFromApi"].map(functionSource).join("\n"), context);
  return { context, calls, outcomes, advance: ms => { now += ms; } };
}

for (const unavailable of [new Error("transient timeout"), { status: 503 }, { best: null }, { best: { artist: track.artist, song: track.song } }]) {
  const f = fixture([unavailable, { best: fresh }]);
  await f.context.fetchTrackMetadataFromApi(track);
  const recovered = await f.context.fetchTrackMetadataFromApi(track);
  assert.equal(recovered?.previewUrl, fresh.previewUrl, "A failed or audio-less lookup must not poison a later exact-recording retry");
  assert.equal(f.calls.length, 2);
}

{
  const f = fixture([{ best: fresh }, { best: { ...fresh, previewUrl: "https://media.example/refreshed.mp3" } }]);
  assert.equal((await f.context.fetchTrackMetadataFromApi(track)).previewUrl, fresh.previewUrl);
  await f.context.fetchTrackMetadataFromApi(track);
  assert.equal(f.calls.length, 1, "Valid positive cache prevents needless provider requests");
  const forced = await f.context.fetchTrackMetadataFromApi(track, { forceLookup: true, timeoutMs: 730 });
  assert.equal(forced.previewUrl, "https://media.example/refreshed.mp3", "Explicit recovery bypasses a previously positive cache");
  assert.equal(f.calls.length, 2);
  assert.equal(f.calls[1].timeoutMs, 730, "The preparation deadline must reach the actual network helper");
  assert.equal(f.calls[1].body.artist, track.artist);
  assert.equal(f.calls[1].body.song, track.song);
  assert.equal(f.calls[1].body.deezerTrackId, track.deezerTrackId);
}

{
  const expiresAt = Math.floor(Date.now() / 1000) + 120;
  const signed = { ...fresh, previewUrl: `https://media.example/exact.mp3?hdnea=exp=${expiresAt}~acl=*` };
  const f = fixture([{ best: signed }, { best: fresh }]);
  await f.context.fetchTrackMetadataFromApi(track);
  f.advance(180000);
  assert.equal((await f.context.fetchTrackMetadataFromApi(track)).previewUrl, fresh.previewUrl, "A signed cached preview must be refreshed after expiration");
  assert.equal(f.calls.length, 2);
}

{
  const requests = [];
  const context = vm.createContext({
    isTrustedSlambientCatalogTrack: () => false, isTrustedCuratedCatalogTrack: () => false,
    hasReliableBpmForTrack: () => false, normalizePreviewUrl: () => "", previewUrlIsExpired: () => false,
    registerPreviewCandidate() {}, hasStrictWhitelist: () => false, STRICT_ARTIST_MATCH_STYLES: new Set(),
    COMPLIANCE_CONFIG: { clientDeezerEnabled: false }, catalogTrackMetadataText: () => "",
    fetchTrackMetadataFromApi: async (_, options) => { requests.push(options); return null; },
    itunesJsonp: async () => ({ results: [] }), refreshSoundCloudPreviewForTrack: async () => false,
    previewCandidatesForTrack: () => [], trackHasExternalPlayableFallback: () => false
  });
  vm.runInContext(["trackAppleRecordingId", "resolvePreviewForTrack"].map(functionSource).join("\n"), context);
  await context.resolvePreviewForTrack({ ...track }, { forceLookup: true });
  assert.equal(requests[0]?.forceLookup, true, "Full preview recovery must forward its forced lookup to the metadata cache");
}

console.log("Track metadata retry passed: transient/audio-less results retry, healthy cache reuses, forced/expired previews refresh, exact identity and bounded timeout remain intact.");
