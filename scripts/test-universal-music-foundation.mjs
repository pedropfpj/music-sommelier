#!/usr/bin/env node

import assert from "node:assert/strict";
import { createRequire } from "node:module";
import { readFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const require = createRequire(import.meta.url);
const universal = require(path.join(root, "universal-music.js"));

assert.equal(universal.schemaVersion, 2);
assert.equal(universal.defaultUniverse, "electronic");
assert.equal(universal.universes.length, 13);
assert.equal(new Set(universal.universes.map((item) => item.slug)).size, 13);
for (const slug of ["electronic", "brazilian", "classical", "jazz_blues", "hip_hop_rap", "ambient_experimental_soundtracks"]) {
  assert.equal(universal.isKnownUniverse(slug), true, `missing universe ${slug}`);
}
assert.equal(universal.universeForGenre("funk_soul"), "rnb_soul_funk");
assert.equal(universal.universeForGenre("funk_brasileiro"), "brazilian");
assert.equal(universal.universeForGenre("opera"), "classical");
assert.equal(universal.universeForGenre("MPB"), "brazilian");

const normalizedProfile = universal.normalizeTasteProfile({
  primaryUniverse: "Música brasileira",
  universes: ["brazilian", "electronic", "brazilian"],
  universeWeights: { brazilian: 4, electronic: 1 },
  novelty: 0.7
});
assert.equal(normalizedProfile.schemaVersion, 2);
assert.deepEqual(normalizedProfile.universes, ["brazilian", "electronic"]);
assert.equal(normalizedProfile.primaryUniverse, "brazilian");

const ranked = universal.rankCandidates([
  { key: "samba_1", artist: "Artist A", song: "Samba 1", genre: "samba", providerLinks: [{ provider: "test" }], confidence: 0.9 },
  { key: "samba_2", artist: "Artist A", song: "Samba 2", genre: "samba", providerLinks: [{ provider: "test" }], confidence: 0.9 },
  { key: "samba_3", artist: "Artist A", song: "Samba 3", genre: "samba", providerLinks: [{ provider: "test" }], confidence: 0.9 },
  { key: "techno_1", artist: "Artist B", song: "Techno 1", genre: "techno", providerLinks: [{ provider: "test" }], confidence: 0.9 },
  { key: "blocked", artist: "Artist C", song: "Blocked", genre: "samba", providerLinks: [{ provider: "test" }] },
  { key: "no_audio", artist: "Artist D", song: "No Audio", genre: "samba" }
], normalizedProfile, { limit: 10, perArtistLimit: 2, rejectedKeys: new Set(["blocked"]) });
assert.equal(ranked[0].candidate.universe, "brazilian");
assert.equal(ranked.filter((entry) => entry.candidate.artistKey === "artist_a").length, 2);
assert.equal(ranked.some((entry) => entry.candidate.key === "blocked"), false);
assert.equal(ranked.some((entry) => entry.candidate.key === "no_audio"), false);

const [migration, index, app, iosBuild, runtimeBuild, catalogApi, universesApi, apiRouter, vercelConfig, envExample] = await Promise.all([
  readFile(path.join(root, "supabase/migrations/20260911000100_universal_music_foundation.sql"), "utf8"),
  readFile(path.join(root, "index.html"), "utf8"),
  readFile(path.join(root, "app.js"), "utf8"),
  readFile(path.join(root, "scripts/build-ios-web.mjs"), "utf8"),
  readFile(path.join(root, "scripts/build-runtime-catalog.mjs"), "utf8"),
  readFile(path.join(root, "lib/api/_universal-catalog.js"), "utf8"),
  readFile(path.join(root, "lib/api/_music-universes.js"), "utf8"),
  readFile(path.join(root, "api/music.js"), "utf8"),
  readFile(path.join(root, "vercel.json"), "utf8"),
  readFile(path.join(root, ".env.example"), "utf8")
]);

for (const table of [
  "music_universes", "music_genres", "music_genre_aliases", "music_artists", "music_works",
  "music_recordings", "music_recording_artists", "music_recording_genres", "music_provider_links",
  "music_source_assertions", "music_catalog_quarantine", "user_music_preferences", "user_music_taste_signals"
]) {
  assert.match(migration, new RegExp(`create table if not exists public\\.${table}\\b`), `missing table ${table}`);
}
assert.match(migration, /with \(security_invoker = true\)/);
assert.match(migration, /enable row level security/g);
assert.match(migration, /auth\.uid\(\) = user_id/);
assert.match(migration, /jsonb_array_length\(coalesce\(links\.provider_links/);
assert.match(migration, /'funk_soul', 'funk', 'en'/);
assert.match(migration, /'funk_brasileiro', 'funk', 'pt-BR'/);
assert.match(migration, /add column if not exists universe_slug/);

const universalScriptIndex = index.indexOf("universal-music.js");
const appScriptIndex = index.indexOf("app.min.js");
assert.ok(universalScriptIndex > 0 && universalScriptIndex < appScriptIndex, "universal runtime must load before app");
assert.match(iosBuild, /"universal-music\.js"/);
assert.match(iosBuild, /copyPath\("universal-music\.js"\)/);
assert.match(runtimeBuild, /universe: \["universe", "universe_slug", "music_universe"\]/);
assert.match(app, /const INITIAL_TASTE_CALIBRATION_VERSION = 2;/);
assert.match(app, /schemaVersion: 2,[\s\S]*primaryUniverse,[\s\S]*universeWeights/);
assert.match(app, /SONIC_MULTI_UNIVERSE_UI_ENABLED/);
assert.match(catalogApi, /SONIC_UNIVERSAL_CATALOG_ENABLED/);
assert.doesNotMatch(catalogApi, /require-electronic-gate|electronic_gate/i);
assert.match(universesApi, /bundled_taxonomy/);
assert.match(apiRouter, /"music-universes": require\("\.\.\/lib\/api\/_music-universes"\)/);
assert.match(apiRouter, /"universal-catalog": require\("\.\.\/lib\/api\/_universal-catalog"\)/);
assert.match(vercelConfig, /"\/api\/music-universes"/);
assert.match(vercelConfig, /"\/api\/universal-catalog"/);
assert.match(envExample, /SONIC_UNIVERSAL_CATALOG_ENABLED=false/);
assert.match(envExample, /SONIC_BILLING_ENABLED=false/);

function mockResponse() {
  return {
    statusCode: 200,
    headers: {},
    body: "",
    setHeader(name, value) { this.headers[String(name).toLowerCase()] = String(value); },
    end(value = "") { this.body = String(value || ""); }
  };
}

async function invoke(handler, query = {}) {
  const req = { method: "GET", headers: { host: "localhost", "user-agent": "universal-test" }, query };
  const res = mockResponse();
  await handler(req, res);
  return { status: res.statusCode, payload: JSON.parse(res.body || "{}") };
}

process.env.NODE_ENV = "test";
process.env.SONIC_REQUIRE_BETA_ACCESS_FOR_APIS = "false";
process.env.SONIC_REQUIRE_DURABLE_RATE_LIMITS = "false";
process.env.SONIC_MUSIC_UNIVERSES_ROUTE_ENABLED = "true";
process.env.SONIC_UNIVERSAL_CATALOG_ROUTE_ENABLED = "true";
process.env.SONIC_UNIVERSAL_CATALOG_ENABLED = "false";
const universesHandler = require(path.join(root, "lib/api/_music-universes.js"));
const catalogHandler = require(path.join(root, "lib/api/_universal-catalog.js"));
const taxonomyResponse = await invoke(universesHandler, { language: "pt" });
assert.equal(taxonomyResponse.status, 200);
assert.equal(taxonomyResponse.payload.source, "bundled_taxonomy");
assert.equal(taxonomyResponse.payload.universes.length, 13);
const disabledCatalogResponse = await invoke(catalogHandler, { universe: "brazilian" });
assert.equal(disabledCatalogResponse.status, 200);
assert.equal(disabledCatalogResponse.payload.enabled, false);
assert.deepEqual(disabledCatalogResponse.payload.tracks, []);
const invalidCatalogResponse = await invoke(catalogHandler, { universe: "not-a-real-universe" });
assert.equal(invalidCatalogResponse.status, 400);
assert.equal(invalidCatalogResponse.payload.error, "invalid_music_universe");

console.log("Universal music foundation test passed: 13 universes, Sonic DNA v2, secure catalog gate, and web/iPhone parity.");
