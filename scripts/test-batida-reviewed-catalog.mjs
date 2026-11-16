import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { createRequire } from "node:module";
import vm from "node:vm";

const read = (file) => readFile(new URL(`../${file}`, import.meta.url), "utf8");
const require = createRequire(import.meta.url);
const acorn = require(require.resolve("acorn", { paths: [require.resolve("terser")] }));
const reviewedPath = "data/batida-reviewed-recordings.json";
const runtimePath = "data/runtime-catalog-v1";
const style = "batida";
const [source, runtime, bundled] = await Promise.all([
  read("app.js"),
  read("catalog-runtime.js"),
  read(reviewedPath).then(JSON.parse)
]);
const expectedCount = bundled.records.length;
assert.ok(expectedCount >= 101, "Batida must have at least 101 reviewed artists");
const declarations = acorn.parse(source, { ecmaVersion: "latest", sourceType: "script" }).body;
const functions = new vm.Script(declarations
  .filter((node) => node.type === "FunctionDeclaration")
  .map((node) => source.slice(node.start, node.end))
  .join("\n"), { filename: "app.js (functions)" });
const initializers = declarations
  .filter((node) => node.type === "VariableDeclaration")
  .flatMap((node) => node.declarations)
  .filter((declaration) => declaration.id.type === "Identifier");

// Load the real app declarations without booting DOM events, analytics, or audio APIs.
function makeApp({ failure = "", loadRuntime = true, storage = {} } = {}) {
  const requests = [];
  const app = vm.createContext({
    AbortController, URL, URLSearchParams, console, performance, setTimeout, clearTimeout, Map, Set,
    document: {
      getElementById: () => null,
      querySelector: () => null,
      querySelectorAll: () => [],
      documentElement: { dataset: {}, classList: { contains: () => false } }
    },
    window: {
      location: { origin: "http://localhost", hostname: "localhost", search: "" },
      matchMedia: () => ({ matches: false }),
      setTimeout, clearTimeout
    },
    navigator: { language: "pt-BR" },
    localStorage: { getItem: (key) => storage[key] || null, setItem() {} },
    async fetch(value) {
      const request = new URL(value, "http://localhost");
      const file = request.pathname.slice(1);
      assert.equal(request.origin, "http://localhost", "The test may only read bundled files");
      assert.ok(file === reviewedPath || file.startsWith(runtimePath + "/"), `Unexpected request: ${file}`);
      requests.push(file);
      if (file === reviewedPath) {
        const mode = failure;
        failure = "";
        if (mode === "unavailable") return { ok: false, status: 503 };
        const payload = JSON.parse(JSON.stringify(bundled));
        if (mode === "mismatched") payload.records.at(-1).row.genre_evidence_url = "https://example.com/not-the-evidence";
        return { ok: true, json: async () => payload };
      }
      return { ok: true, json: async () => JSON.parse(await read(file)) };
    }
  });
  functions.runInContext(app);
  for (const { id, init } of initializers) {
    if (Object.hasOwn(app, id.name)) continue;
    const store = (value) => Object.defineProperty(app, id.name, { value, writable: true, configurable: true });
    Object.defineProperty(app, id.name, {
      configurable: true,
      get() {
        const value = init ? vm.runInContext(`(${source.slice(init.start, init.end)})`, app) : undefined;
        store(value);
        return value;
      },
      set: store
    });
  }
  if (loadRuntime) vm.runInContext(runtime, app, { filename: "catalog-runtime.js" });
  app.catalog.length = 0;
  return { app, requests };
}

const { app, requests } = makeApp({ failure: "unavailable" });
assert.ok((await app.loadExternalDatasetRuntimeRows()).length > 0);
assert.deepEqual(requests, [runtimePath + "/manifest.json", runtimePath + "/core.json"], "Startup does not request the Batida proof");
await assert.rejects(app.hydrateExternalDatasetPackInBackground({ style }));
assert.equal(app.externalDatasetImportedStyles.has(style), false, "A transient failure must be retryable");
assert.equal(app.catalog.some((track) => app.reviewedBatidaRecording(track)), false);
await app.hydrateExternalDatasetPackInBackground({ style });
assert.equal(requests.filter((file) => file === reviewedPath).length, 2);
assert.equal(app.externalDatasetImportedStyles.has(style), true);

const reviewedTracks = app.catalog.filter((track) => app.reviewedBatidaRecording(track));
assert.equal(reviewedTracks.length, expectedCount);
assert.equal(new Set(reviewedTracks.map((track) => app.reviewedBatidaRecording(track).recordingId)).size, expectedCount);
const providerCounts = {};
const identityKeys = new Set();
for (const track of reviewedTracks) {
  const proof = app.reviewedBatidaRecording(track);
  providerCounts[proof.provider] = (providerCounts[proof.provider] || 0) + 1;
  assert.equal(app.isTrackEligibleForRecommendation(track), true, proof.recordingId);
  assert.equal(app.trackMatchesRequestedSubgenreEvidence(track, { style }), true, proof.recordingId);
  assert.equal(app.trackMatchesRequestedSubgenreEvidence(track, { style: "afro_house" }), false, proof.recordingId);
  assert.equal(app.trackHasPlayablePreviewExperience(track), true, proof.recordingId);
  assert.equal(app.trackMatchesBpmPreference(track, ""), true);
  if (!Number(track.bpmExact)) assert.equal(app.trackMatchesBpmPreference(track, "125-145"), false);
  const keys = [...app.reviewedBatidaArtistKeys(track)];
  assert.ok(keys.length > 0);
  for (const key of new Set(keys)) {
    assert.equal(identityKeys.has(key), false, `Repeated performer identity: ${key} (${track.artist})`);
    identityKeys.add(key);
  }
  if (proof.provider === "soundcloud") {
    const widget = new URL(app.buildSoundCloudEmbedUrl(track));
    assert.equal(widget.origin, "https://w.soundcloud.com");
    assert.equal(widget.searchParams.get("url"), `https://api.soundcloud.com/tracks/${proof.soundcloudTrackId}`);
  } else if (proof.provider === "bandcamp") {
    assert.equal(new URL(app.buildBandcampEmbedUrl(track)).origin, "https://bandcamp.com");
    assert.ok(app.buildBandcampEmbedUrl(track).includes(`/track=${proof.bandcampTrackId}/`));
  } else {
    assert.equal(track.previewUrl, proof.previewUrl);
  }
}
assert.deepEqual(Object.keys(providerCounts).sort(), ["apple_music", "bandcamp", "soundcloud"]);

const soundcloud = reviewedTracks.find((track) => app.reviewedBatidaRecording(track).provider === "soundcloud");
const apple = reviewedTracks.find((track) => app.reviewedBatidaRecording(track).provider === "apple_music");
for (const wrong of [
  { ...soundcloud, style: "afro_house" },
  { ...soundcloud, song: soundcloud.song + " (Other Version)" },
  { ...soundcloud, bpmExact: 130 },
  { ...soundcloud, soundcloudTrackUrl: "https://soundcloud.com/foreign/recording" },
  { ...soundcloud, catalogMetadata: { ...soundcloud.catalogMetadata, recording_id: "soundcloud:999" } },
  { ...soundcloud, catalogMetadata: { ...soundcloud.catalogMetadata, genre_evidence_url: "https://example.com/foreign" } },
  { ...apple, catalogMetadata: { ...apple.catalogMetadata, preview_url: "https://audio-ssl.itunes.apple.com/itunes-assets/AudioPreview211/foreign.m4a" } }
]) {
  assert.equal(app.reviewedBatidaRecording(wrong), null);
  assert.equal(app.trackHasPlayablePreviewExperience(wrong), false);
  assert.equal(app.buildSoundCloudEmbedUrl(wrong), "");
  assert.equal(app.buildBandcampEmbedUrl(wrong), "");
}
const foreignPreview = "https://audio-ssl.itunes.apple.com/itunes-assets/AudioPreview211/foreign.m4a";
const appleWithForeignPreview = { ...apple, previewUrl: foreignPreview };
const appleProof = app.reviewedBatidaRecording(apple);
assert.equal(app.reviewedBatidaRecording(appleWithForeignPreview), appleProof);
assert.equal(app.trackHasConfirmedAudioPreview(appleWithForeignPreview), false);
assert.deepEqual([...app.previewCandidatesForTrack(appleWithForeignPreview)], [appleProof.previewUrl]);
assert.equal(app.buildSoundCloudEmbedUrl({ ...apple, soundcloudTrackUrl: soundcloud.soundcloudTrackUrl }), "");
assert.equal(app.buildBandcampEmbedUrl({ ...apple, bandcampTrackId: "123456" }), "");
assert.equal(app.trackHasDirectYouTubeVideo({ ...apple, youtubeTrackUrl: "https://youtu.be/abcdefghijk" }), false);

const mismatch = makeApp({ failure: "mismatched", loadRuntime: false });
await assert.rejects(mismatch.app.hydrateExternalDatasetPackInBackground({ style }));
assert.equal(mismatch.app.externalDatasetImportedStyles.has(style), false);
assert.equal(mismatch.app.catalog.some((track) => mismatch.app.reviewedBatidaRecording(track)), false, "Invalid receipt cannot partially import preceding records");
await mismatch.app.hydrateExternalDatasetPackInBackground({ style });
assert.equal(mismatch.app.catalog.filter((track) => mismatch.app.reviewedBatidaRecording(track)).length, expectedCount);

const cached = makeApp({ storage: { [app.DYNAMIC_CATALOG_CACHE_KEY]: JSON.stringify([soundcloud]) } }).app;
cached.markRecommendationPresented(soundcloud);
cached.loadDynamicCatalogCache();
assert.equal(cached.reviewedBatidaRecording(soundcloud), null, "A matching cached row cannot provide its own authority");
assert.equal(cached.isTrackEligibleForRecommendation(soundcloud), false);
await cached.hydrateExternalDatasetPackInBackground({ style });
const restored = cached.catalog.find((track) => cached.reviewedBatidaRecording(track)?.recordingId === app.reviewedBatidaRecording(soundcloud).recordingId);
assert.ok(restored);
assert.equal(cached.trackBlockedByKnownSignals(restored), true, "Hydration must preserve history");

const selectors = {
  other: (ctx, sourceTrack) => ctx.pickInstantPrimaryNextTrack(sourceTrack, style),
  like: (ctx, sourceTrack) => ctx.pickInstantSwipeTrack({ sourceTrack, positive: true })?.track,
  pass: (ctx, sourceTrack) => ctx.pickFastNegativeFeedbackTrack({ rejectedTrack: sourceTrack, prefs: ctx.lastPrefs })?.track
};
function selectWithPrefs(ctx, bpm = "") {
  ctx.swipeUserAnchoredStyle = style;
  ctx.lastPrefs = ctx.normalizeRecommendationPrefs({ style, bpm });
}

// Mark everyone else heard, then a previously known alias must also bar its recording.
const alias = bundled.identityAliases.find((identity) => reviewedTracks.some((track) => track.artist === identity.canonicalArtist));
assert.ok(alias);
const canonical = cached.catalog.find((track) => track.artist === alias.canonicalArtist && cached.reviewedBatidaRecording(track));
assert.ok(canonical);
const knownAliasKey = cached.artistMatchKey(alias.artist);
assert.ok([...cached.reviewedBatidaArtistKeys(canonical)].includes(knownAliasKey));
const participant = (bundled.recordingParticipants || []).find((recording) => recording.participants?.length);
assert.ok(participant);
const collaborative = reviewedTracks.find((track) => app.reviewedBatidaRecording(track).recordingId === participant.recordingId);
assert.ok(collaborative);
assert.ok(participant.participants.every((name) => [...app.reviewedBatidaArtistKeys(collaborative)].includes(app.artistMatchKey(name))));
for (const track of cached.catalog.filter((track) => cached.reviewedBatidaRecording(track) && track !== canonical)) {
  cached.markRecommendationPresented(track);
}
cached.knownArtistsMemory.add(knownAliasKey);
selectWithPrefs(cached);
for (const [name, select] of Object.entries(selectors)) {
  assert.ok(!select(cached, restored), `${name} must not replay a known alias`);
}

selectWithPrefs(app, "125-145");
for (const [name, select] of Object.entries(selectors)) {
  const candidate = select(app, soundcloud);
  assert.ok(candidate, `${name} should still find a verified known-tempo track`);
  assert.equal(app.trackMatchesBpmPreference(candidate, "125-145"), true, `${name} must keep the BPM filter`);
}
const filtered = app.pickRecommendation(app.lastPrefs, new Set());
assert.ok(filtered);
assert.equal(app.trackMatchesBpmPreference(filtered, "125-145"), true);

selectWithPrefs(app);
const delivered = new Set();
const routes = Object.keys(selectors);
let previous = null;
for (let index = 0; index < expectedCount; index += 1) {
  const name = routes[index % routes.length];
  const candidate = selectors[name](app, previous);
  assert.ok(candidate, `${name} ended the verified sequence after ${index} tracks`);
  const proof = app.reviewedBatidaRecording(candidate);
  assert.ok(proof, `${name} returned an unreviewed recording`);
  assert.equal(delivered.has(proof.recordingId), false, `${name} repeated ${proof.recordingId}`);
  delivered.add(proof.recordingId);
  app.markRecommendationPresented(candidate);
  app.currentRecommendation = candidate;
  previous = candidate;
}
assert.equal(delivered.size, expectedCount);
for (const [name, select] of Object.entries(selectors)) {
  assert.ok(!select(app, previous), `${name} must leave the current Batida playing at exhaustion`);
}
assert.equal(app.pickInstantPrimaryNextTrack(previous, style, { allowSeenTrack: true }), null);
assert.equal(app.pickRecommendation(app.lastPrefs, new Set()), null);

console.log(`PASS Batida: ${expectedCount} exact playable recordings and distinct performer identities through next/like/pass. BPM and history respected and failed or stale evidence rejected.`);
