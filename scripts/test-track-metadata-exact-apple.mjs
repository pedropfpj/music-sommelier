import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import vm from "node:vm";

const source = await readFile(new URL("../lib/api/_track-metadata.js", import.meta.url), "utf8");
const request = {
  artist: "The Chemical Brothers", song: "Block Rockin' Beats", album: "Dig Your Own Hole",
  durationSec: 314, releaseYear: 1997, itunesTrackId: "1635966361"
};
function row(overrides = {}) {
  return {
    wrapperType: "track", kind: "song", trackId: 1635966361,
    artistName: request.artist, trackName: request.song, collectionName: request.album,
    trackTimeMillis: 313500, releaseDate: "1997-03-24T00:00:00Z",
    previewUrl: "https://audio-ssl.itunes.apple.com/exact.m4a",
    trackViewUrl: "https://music.apple.com/us/song/block-rockin-beats/1635966361",
    ...overrides
  };
}
function fixture(outcomes = [], env = {}) {
  const calls = [], enrichments = [];
  const helpers = {
    envFlag: (name, fallback) => name in env ? env[name] : fallback,
    envInt: (_name, fallback) => fallback,
    envText: (_name, fallback) => fallback,
    parseBody: req => req.body || {}, requireMusicApi: () => true,
    sendJson: (_req, res, status, payload) => { res.status = status; res.payload = payload; },
    trimText: (value, limit) => String(value ?? "").trim().slice(0, limit)
  };
  const context = vm.createContext({
    module: { exports: {} }, URLSearchParams, AbortController, setTimeout, clearTimeout,
    require: name => {
      if (name === "./_music-apis") return helpers;
      if (name === "./_catalog-enrichment-store") return { persistCatalogEnrichments: async value => enrichments.push(value) };
      throw Error("Unexpected module: " + name);
    },
    fetch: async (url, options) => {
      calls.push({ url: new URL(url), options });
      const next = outcomes.shift();
      if (next instanceof Error) throw next;
      const payload = typeof next === "function" ? next(new URL(url)) : next;
      return { ok: payload?.status ? payload.status < 400 : true, json: async () => payload?.body ?? payload };
    }
  });
  vm.runInContext(source, context);
  return {
    calls, enrichments, outcomes,
    async call(body = request, query = {}) {
      const res = {};
      await context.module.exports({ method: "POST", body, query }, res);
      return res;
    }
  };
}
function assertOnlyExactLookup(f, id = request.itunesTrackId) {
  assert.equal(f.calls.length, 1, "Exact IDs cause one bounded provider request");
  const { url, options } = f.calls[0];
  assert.equal(url.origin, "https://itunes.apple.com");
  assert.equal(url.pathname, "/lookup");
  assert.equal(url.searchParams.get("id"), id);
  assert.equal(url.searchParams.get("entity"), "song");
  assert.equal(url.searchParams.get("country"), "us");
  assert.equal(options.method, "GET");
}

{
  const f = fixture([{ results: [row()] }], { SONIC_DEEZER_ENABLED: true });
  const result = await f.call();
  assertOnlyExactLookup(f);
  assert.equal(result.status, 200);
  assert.equal(result.payload.best.id, request.itunesTrackId);
  assert.equal(result.payload.best.source, "itunes");
  assert.equal(result.payload.best.durationSec, 314);
  assert.equal(result.payload.best.bpmExact, 0);
  assert.equal(result.payload.itunesTrackId, request.itunesTrackId);
  assert.equal(result.payload.count, 1);
  assert.equal((await f.call()).payload.cached, true);
  assertOnlyExactLookup(f);
}

for (const mismatch of [
  { trackId: 1635966362 }, { kind: "music-video" }, { artistName: "The Chemical Brothers Tribute" },
  { trackName: "Block Rockin' Beats (Live)" }, { collectionName: "Dig Your Own Hole (Remastered)" },
  { trackTimeMillis: 280000 }, { trackTimeMillis: undefined }
]) {
  const f = fixture([{ results: [row(mismatch)] }], { SONIC_DEEZER_ENABLED: true });
  const result = await f.call();
  assertOnlyExactLookup(f);
  assert.equal(result.status, 200);
  assert.equal(result.payload.count, 0, JSON.stringify(mismatch));
  assert.equal(result.payload.best, null);
}

{
  const f = fixture([{ results: [row({ trackTimeMillis: 312000, collectionName: "A compilation containing this exact ID" })] }]);
  const result = await f.call({ ...request, album: "" });
  assertOnlyExactLookup(f);
  assert.equal(result.payload.best.id, request.itunesTrackId, "An unknown album does not invent a conflicting album constraint");
  assert.equal(result.payload.best.durationSec, 312, "Provider rounding may differ by at most two seconds");
}

for (const unavailable of [new Error("provider timeout"), { status: 503, body: {} }, { results: [] }, { results: [row({ previewUrl: "" })] }]) {
  const f = fixture([unavailable, { results: [row()] }], { SONIC_DEEZER_ENABLED: true });
  const first = await f.call();
  assertOnlyExactLookup(f);
  assert.equal(first.status, 200);
  assert.equal(Boolean(first.payload.best?.previewUrl), false);
  const recovered = await f.call();
  assert.equal(recovered.payload.best.id, request.itunesTrackId);
  assert.equal(f.calls.length, 2, "Transient/audio-less exact results must remain retryable");
  assert.ok(f.calls.every(call => call.url.pathname === "/lookup"), "No search or other provider may replace an exact recording");
}

{
  const f = fixture([
    { results: [row()] }, { results: [row({ trackId: 1635966362 })] },
    { results: [row()] }, { results: [row()] }
  ]);
  await f.call();
  assert.equal((await f.call({ ...request, itunesTrackId: "1635966362" })).payload.best.id, "1635966362");
  assert.equal((await f.call({ ...request, durationSec: 400 })).payload.best, null);
  assert.equal((await f.call({ ...request, releaseYear: 2022 })).payload.cached, undefined);
  assert.equal(f.calls.length, 4, "Apple ID, duration and year must distinguish validated cache entries");
  assert.equal((await f.call()).payload.best.id, request.itunesTrackId);
  assert.equal(f.calls.length, 4, "A rejected different-master request cannot replace the original positive cache");
}

for (const id of ["12garbage34", "1,2", "-12", "0", 0, 1.5, Number.MAX_SAFE_INTEGER + 1, "123456789012345678901", true, [1, 2]]) {
  const f = fixture();
  const result = await f.call({ ...request, itunesTrackId: id });
  assert.equal(result.status, 400, JSON.stringify(id));
  assert.equal(result.payload.error, "invalid_itunes_track_id");
  assert.equal(f.calls.length, 0);
  assert.equal(f.enrichments.length, 0);
}

{
  const f = fixture([{ results: [row()] }]);
  const { itunesTrackId, ...withoutId } = request;
  const result = await f.call(withoutId, { itunes_track_id: itunesTrackId });
  assert.equal(result.payload.best.id, itunesTrackId);
  assertOnlyExactLookup(f);
}

{
  const f = fixture([{ results: [row()] }]);
  const { itunesTrackId, ...withoutId } = request;
  assert.equal((await f.call(withoutId)).payload.best.id, itunesTrackId);
  assert.equal(f.calls[0].url.pathname, "/search", "Requests without an exact ID retain existing search behavior");
}

{
  const f = fixture([], { SONIC_ITUNES_ENABLED: false, SONIC_DEEZER_ENABLED: true });
  assert.equal((await f.call()).payload.best, null);
  assert.equal(f.calls.length, 0, "Disabling Apple cannot silently substitute Deezer for an exact Apple ID");
}

console.log("Exact Apple metadata passed: bounded US ID lookup, identity/album/version/duration guards, no provider substitution, transient retry, strict input and cache isolation.");
