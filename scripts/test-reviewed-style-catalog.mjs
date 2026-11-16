import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { createRequire } from "node:module";
import vm from "node:vm";

const read = (file) => readFile(new URL(`../${file}`, import.meta.url), "utf8");
const require = createRequire(import.meta.url);
const acorn = require(require.resolve("acorn", { paths: [require.resolve("terser")] }));
const runtimePath = "data/runtime-catalog-v1";
const styles = new Map([
  ["batida", { providers: ["apple_music", "bandcamp", "soundcloud"], artistsWithDepth: 0 }],
  ["french_house", { providers: ["apple_music", "bandcamp"], artistsWithDepth: 4 }],
  ["bleep_techno", { providers: ["apple_music", "bandcamp"], artistsWithDepth: 2 }]
]);
const [source, runtime] = await Promise.all([read("app.js"), read("catalog-runtime.js")]);
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
function makeApp({ reviewedPath, bundled }, { failure = "", loadRuntime = true, storage = {} } = {}) {
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

async function verifyReviewedStyle(style, { providers, artistsWithDepth }) {
  const reviewedPath = `data/${style.replaceAll("_", "-")}-reviewed-recordings.json`;
  const bundled = JSON.parse(await read(reviewedPath));
  const fixture = { reviewedPath, bundled };
  const expectedArtists = 101;
  const expectedCount = expectedArtists + artistsWithDepth;
  assert.equal(bundled.records.length, expectedCount);

  const { app, requests } = makeApp(fixture, { failure: "unavailable" });
  assert.ok((await app.loadExternalDatasetRuntimeRows()).length > 0);
  assert.deepEqual(requests, [runtimePath + "/manifest.json", runtimePath + "/core.json"], `Startup does not request the ${style} proof`);
  await assert.rejects(app.hydrateExternalDatasetPackInBackground({ style }));
  assert.equal(app.externalDatasetImportedStyles.has(style), false, "A transient failure must be retryable");
  assert.equal(app.catalog.some((track) => app.reviewedCatalogRecording(track)), false);
  await app.hydrateExternalDatasetPackInBackground({ style });
  assert.equal(requests.filter((file) => file === reviewedPath).length, 2);
  assert.equal(app.externalDatasetImportedStyles.has(style), true);

  const reviewedTracks = app.catalog.filter((track) => app.reviewedCatalogRecording(track));
  assert.equal(reviewedTracks.length, expectedCount);
  const scopedTracks = app.styleScopedEligibleTracks({ style, bpm: "" });
  assert.equal(scopedTracks.length, expectedCount, "All reviewed rows must be eligible in the web discovery pool");
  assert.equal(new Set(reviewedTracks.map((track) => app.reviewedCatalogRecording(track).recordingId)).size, expectedCount);
  const providerCounts = {};
  const identityKeys = new Map();
  const artists = new Map();
  for (const track of reviewedTracks) {
    const proof = app.reviewedCatalogRecording(track);
    providerCounts[proof.provider] = (providerCounts[proof.provider] || 0) + 1;
    assert.equal(app.isTrackEligibleForRecommendation(track), true, proof.recordingId);
    assert.equal(app.trackMatchesRequestedSubgenreEvidence(track, { style }), true, proof.recordingId);
    for (const otherStyle of styles.keys()) {
      if (otherStyle !== style) assert.equal(app.trackMatchesRequestedSubgenreEvidence(track, { style: otherStyle }), false, proof.recordingId);
    }
    assert.equal(app.trackHasPlayablePreviewExperience(track), true, proof.recordingId);
    assert.equal(app.trackMatchesBpmPreference(track, ""), true);
    if (!Number(track.bpmExact)) assert.equal(app.trackMatchesBpmPreference(track, "125-145"), false);
    const keys = [...app.reviewedCatalogArtistKeys(track)];
    assert.ok(keys.length > 0);
    const identity = app.artistMatchKey(track.artist);
    artists.set(identity, (artists.get(identity) || 0) + 1);
    for (const key of keys) {
      const owner = identityKeys.get(key);
      assert.ok(!owner || owner === identity, `Shared performer identity: ${key} (${track.artist} and ${owner})`);
      identityKeys.set(key, identity);
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
  assert.deepEqual(Object.keys(providerCounts).sort(), providers);
  assert.equal(artists.size, expectedArtists);
  assert.equal([...artists.values()].filter(count => count > 1).length, artistsWithDepth);

  const embedded = reviewedTracks.find((track) => app.reviewedCatalogRecording(track).provider === (style === "batida" ? "soundcloud" : "bandcamp"));
  const apple = reviewedTracks.find((track) => app.reviewedCatalogRecording(track).provider === "apple_music");
  for (const wrong of [
    { ...embedded, style: "afro_house" },
    { ...embedded, song: embedded.song + " (Other Version)" },
    { ...embedded, bpmExact: Number(embedded.bpmExact || 0) + 1 },
    style === "batida"
      ? { ...embedded, soundcloudTrackUrl: "https://soundcloud.com/foreign/recording" }
      : { ...embedded, bandcampTrackUrl: "https://foreign.bandcamp.com/track/recording" },
    { ...embedded, catalogMetadata: { ...embedded.catalogMetadata, recording_id: "soundcloud:999" } },
    { ...embedded, catalogMetadata: { ...embedded.catalogMetadata, genre_evidence_url: "https://example.com/foreign" } },
    { ...apple, catalogMetadata: { ...apple.catalogMetadata, preview_url: "https://audio-ssl.itunes.apple.com/itunes-assets/AudioPreview211/foreign.m4a" } }
  ]) {
    assert.equal(app.reviewedCatalogRecording(wrong), null);
    assert.equal(app.trackHasPlayablePreviewExperience(wrong), false);
    assert.equal(app.buildSoundCloudEmbedUrl(wrong), "");
    assert.equal(app.buildBandcampEmbedUrl(wrong), "");
  }
  const foreignPreview = "https://audio-ssl.itunes.apple.com/itunes-assets/AudioPreview211/foreign.m4a";
  const appleWithForeignPreview = { ...apple, previewUrl: foreignPreview };
  const appleProof = app.reviewedCatalogRecording(apple);
  assert.equal(app.reviewedCatalogRecording(appleWithForeignPreview), appleProof);
  assert.equal(app.trackHasConfirmedAudioPreview(appleWithForeignPreview), false);
  assert.deepEqual([...app.previewCandidatesForTrack(appleWithForeignPreview)], [appleProof.previewUrl]);
  assert.equal(app.buildSoundCloudEmbedUrl({ ...apple, soundcloudTrackUrl: "https://soundcloud.com/foreign/recording" }), "");
  assert.equal(app.buildBandcampEmbedUrl({ ...apple, bandcampTrackId: "123456" }), "");
  assert.equal(app.trackHasDirectYouTubeVideo({ ...apple, youtubeTrackUrl: "https://youtu.be/abcdefghijk" }), false);

  const mismatch = makeApp(fixture, { failure: "mismatched", loadRuntime: false });
  await assert.rejects(mismatch.app.hydrateExternalDatasetPackInBackground({ style }));
  assert.equal(mismatch.app.externalDatasetImportedStyles.has(style), false);
  assert.equal(mismatch.app.catalog.some((track) => mismatch.app.reviewedCatalogRecording(track)), false, "Invalid receipt cannot partially import preceding records");
  await mismatch.app.hydrateExternalDatasetPackInBackground({ style });
  assert.equal(mismatch.app.catalog.filter((track) => mismatch.app.reviewedCatalogRecording(track)).length, expectedCount);

  const cached = makeApp(fixture, { storage: { [app.DYNAMIC_CATALOG_CACHE_KEY]: JSON.stringify([embedded]) } }).app;
  cached.markRecommendationPresented(embedded);
  cached.loadDynamicCatalogCache();
  assert.equal(cached.reviewedCatalogRecording(embedded), null, "A matching cached row cannot provide its own authority");
  assert.equal(cached.isTrackEligibleForRecommendation(embedded), false);
  await cached.hydrateExternalDatasetPackInBackground({ style });
  const restored = cached.catalog.find((track) => cached.reviewedCatalogRecording(track)?.recordingId === app.reviewedCatalogRecording(embedded).recordingId);
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
  const canonical = cached.catalog.find((track) => track.artist === alias.canonicalArtist && cached.reviewedCatalogRecording(track));
  assert.ok(canonical);
  const knownAliasKey = cached.artistMatchKey(alias.artist);
  assert.ok([...cached.reviewedCatalogArtistKeys(canonical)].includes(knownAliasKey));
  const participant = (bundled.recordingParticipants || []).find((recording) => recording.participants?.length);
  assert.ok(participant);
  const collaborative = reviewedTracks.find((track) => app.reviewedCatalogRecording(track).recordingId === participant.recordingId);
  assert.ok(collaborative);
  assert.ok(participant.participants.every((name) => [...app.reviewedCatalogArtistKeys(collaborative)].includes(app.artistMatchKey(name))));
  for (const track of cached.catalog.filter((track) => cached.reviewedCatalogRecording(track) && track !== canonical)) {
    cached.markRecommendationPresented(track);
  }
  cached.knownArtistsMemory.add(knownAliasKey);
  selectWithPrefs(cached);
  for (const [name, select] of Object.entries(selectors)) {
    assert.ok(!select(cached, restored), `${name} must not replay a known alias`);
  }

  selectWithPrefs(app, "125-145");
  for (const [name, select] of Object.entries(selectors)) {
    const candidate = select(app, embedded);
    assert.ok(candidate, `${name} should still find a verified known-tempo track`);
    assert.equal(app.trackMatchesBpmPreference(candidate, "125-145"), true, `${name} must keep the BPM filter`);
  }
  const filtered = app.pickRecommendation(app.lastPrefs, new Set());
  assert.ok(filtered);
  assert.equal(app.trackMatchesBpmPreference(filtered, "125-145"), true);

  selectWithPrefs(app);
  const delivered = new Set();
  const deliveredArtists = new Set();
  const routes = Object.keys(selectors);
  let previous = null;
  for (let index = 0; index < expectedCount; index += 1) {
    const name = routes[index % routes.length];
    const candidate = selectors[name](app, previous);
    assert.ok(candidate, `${name} ended the verified sequence after ${index} tracks`);
    const proof = app.reviewedCatalogRecording(candidate);
    assert.ok(proof, `${name} returned an unreviewed recording`);
    if (artistsWithDepth && index < 5) {
      assert.equal(proof.provider, "apple_music", `${name} should choose a direct preview when a fresh artist has one`);
    }
    assert.equal(delivered.has(proof.recordingId), false, `${name} repeated ${proof.recordingId}`);
    delivered.add(proof.recordingId);
    const identity = app.artistMatchKey(candidate.artist);
    if (index < expectedArtists) assert.equal(deliveredArtists.has(identity), false, `${name} repeated ${candidate.artist} before exhausting the available breadth`);
    assert.notEqual(candidate.artist, previous?.artist, `${name} repeated the current artist`);
    assert.equal(app.recommendationArtistBlockedForPresentation(candidate, previous, {
      allowPreviouslyPresented: app.reviewedStyleAllowsTrackDepth(style)
    }), false, `${name} chose a track the card would reject`);
    deliveredArtists.add(identity);
    app.markRecommendationPresented(candidate);
    app.currentRecommendation = candidate;
    previous = candidate;
  }
  assert.equal(delivered.size, expectedCount);
  assert.equal(deliveredArtists.size, expectedArtists);
  for (const [name, select] of Object.entries(selectors)) {
    assert.ok(!select(app, previous), `${name} must keep the current ${style} track at exhaustion`);
  }
  assert.equal(app.pickInstantPrimaryNextTrack(previous, style, { allowSeenTrack: true }), null);
  assert.equal(app.pickRecommendation(app.lastPrefs, new Set()), null);

  console.log(`PASS ${style}: ${expectedCount} exact playable recordings and ${expectedArtists} distinct performer identities through next/like/pass. BPM and history respected and failed or stale evidence rejected.`);
}

const requestedStyles = process.argv.slice(2);
for (const style of requestedStyles.length ? requestedStyles : styles.keys()) {
  assert.ok(styles.has(style), `Unknown reviewed style: ${style}`);
  await verifyReviewedStyle(style, styles.get(style));
}

if (!requestedStyles.length || requestedStyles.includes("batida")) {
  const reviewedPath = "data/batida-reviewed-recordings.json";
  const bundled = JSON.parse(await read(reviewedPath));
  const { app } = makeApp({ reviewedPath, bundled });
  app.window.SonicDiscoveryExperience = require("../discovery-experience.js");
  const row = JSON.parse(await read(`${runtimePath}/styles/batida.json`))
    .find(row => row.artist === "DJ Firmeza" && row.song === "Alma do Meu Pai");
  app.mergeExternalDatasetRows([row], "dataset_local_runtime_core");
  const key = app.recommendationTrackKey(row);
  const olderId = "apple_music:1596163657";
  const reviewedId = "apple_music:1348713422";
  const reviewedUrl = bundled.records.find(({ proof }) => proof.recordingId === reviewedId).proof.previewUrl;
  const legacy = { key, artist: row.artist, song: row.song, style: row.style, likedAt: "2026-11-16T12:00:00.000Z" };
  assert.equal(app.catalogTrackRecordingIds(app.findCatalogReplayTrack(legacy))[0], olderId, "Cold core contains the older edition");

  const reviewed = await app.resolveCatalogReplayTrack(legacy);
  assert.equal(app.catalogTrackRecordingIds(reviewed)[0], reviewedId, "A title-only legacy entry waits for the reviewed style");
  assert.equal(app.catalogTrackRecordingIds(app.findCatalogReplayTrack({ ...legacy, label: row.label }))[0], olderId, "An older entry with a specific release retains that edition");
  const oldEdition = app.findCatalogReplayTrack({ ...legacy, recordingId: olderId });
  assert.ok(oldEdition && oldEdition !== reviewed);
  assert.equal(app.catalog.filter(track => app.recommendationTrackKey(track) === key).length, 1, "Replay alternatives do not enter discovery");

  const exact = app.prepareCatalogReplayTrack(reviewed, reviewedId);
  assert.equal(exact.previewUrl, reviewedUrl);
  assert.equal(app.trackDurationSecondsForApi(exact), 390);
  oldEdition.previewUrl = reviewedUrl;
  oldEdition.previewCandidates = [reviewedUrl];
  const older = app.prepareCatalogReplayTrack(oldEdition, olderId);
  assert.equal(older.previewUrl, row.preview_url, "An exact replay prefers the published asset to cached discovery alternatives");
  assert.equal(older.previewCandidates.length, 1);
  app.currentRecommendation = exact;
  assert.equal(app.trackStillActive(older), false, "A callback from a different edition can't update the current player");

  app.socialState = { session: { user: { id: "recording-fixture" } } };
  app.librarySessionMatchesOnlineAccount = () => true;
  app.likedTrackHistory = [app.likedTrackHistoryEntry(reviewed, "liked", legacy.likedAt)];
  const [cloud] = JSON.parse(JSON.stringify(app.socialTrackRowsForSync()));
  assert.equal(cloud.metadata.recordingId, reviewedId);
  const restored = app.socialLikedTrackFromRow(cloud);
  assert.equal(restored.recordingId, reviewedId);
  assert.equal(app.sanitizeLikedTrackHistory([restored])[0].recordingId, reviewedId);
  app.likedTrackHistory = [legacy];
  app.mergeCloudLibraryEntries([restored]);
  assert.equal(app.likedTrackHistory[0].recordingId, reviewedId, "Same-time sync enriches a legacy row with its exact identity");
  app.mergeCloudLibraryEntries([legacy, { ...legacy, likedAt: "2026-11-15T12:00:00.000Z" }]);
  assert.equal(app.likedTrackHistory[0].recordingId, reviewedId, "Old clients cannot erase exact identity with an older or same-time row");
  console.log("PASS saved Batida editions: cold catalog, reviewed/legacy resolution, exact assets, stale playback isolation and cloud round trip.");
}
