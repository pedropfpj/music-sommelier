import assert from 'node:assert/strict';
import { createRequire } from 'node:module';
import { createAppRuntimeTestContext } from './app-runtime-test-harness.mjs';
const require = createRequire(import.meta.url);
for (const key of Object.keys(process.env)) if (/^(SUPABASE_|SONIC_|KV_|UPSTASH_)/.test(key)) delete process.env[key];
Object.assign(process.env, { NODE_ENV: 'test', SUPABASE_URL: 'https://catalog.fixture.test', SUPABASE_ANON_KEY: 'fixture-anon', SONIC_CATALOG_EXTRA_ENABLED: 'true', SONIC_REQUIRE_DURABLE_RATE_LIMITS: 'false', SONIC_REQUIRE_BETA_ACCESS_FOR_APIS: 'false' });
const handler = require('../api/catalog-extra.js'), originalFetch = global.fetch;
const rejected = Array.from({ length: 200 }, (_, i) => ({ id: `rejected-${i}`, style: 'hard_techno', artist: 'Unverified Fixture Artist', song: `Fixture ${i}`, metadata: { electronic_gate: 'passed' } }));
const accepted = { id: 'verified-later-recording', style: 'hard_techno', artist: 'Sara Landry', song: 'Catalog Pagination Fixture', bpm_exact: 150, metadata: { electronic_gate: 'passed' } };
let malformed = false, rawRequests = [];
global.fetch = async input => {
  const url = new URL(input); assert.equal(url.origin, 'https://catalog.fixture.test', 'Tests must never contact a real service');
  assert.equal(url.pathname, '/rest/v1/catalog_tracks');
  const offset = Number(url.searchParams.get('offset')); rawRequests.push(offset);
  return new Response(JSON.stringify(malformed ? { unexpected: 'not a catalog page' } : offset === 0 ? rejected : offset === 200 ? [accepted] : []), { status: 200, headers: { 'Content-Type': 'application/json' } });
};
async function endpoint(offset = 0) {
  const req = { method: 'GET', headers: { host: 'localhost' }, query: { type: 'tracks', style: 'hard_techno', limit: '200', offset: String(offset) } };
  const res = { headers: {}, setHeader(k, v) { this.headers[k] = v; }, end(body) { this.body = JSON.parse(body); } };
  await handler(req, res); return res;
}
try {
  const first = await endpoint();
  assert.equal(first.statusCode, 200); assert.equal(first.body.tracks.length, 0, 'Unverified artists must remain filtered');
  assert.deepEqual(first.body.pagination, { scanned: { artists: 0, tracks: 200 }, hasMore: true }, 'Pagination is based on scanned records before safety filtering');
  const ctx = createAppRuntimeTestContext(); const requested = [];
  ctx.fetchCatalogExtraPage = async (_style, offset) => { requested.push(offset); const res = await endpoint(offset); return res.statusCode === 200 ? res.body : null; };
  const page = await ctx.fetchCatalogExtraPayload('hard_techno');
  assert.deepEqual(requested, [0, 200]); assert.equal(page.tracks.length, 1); assert.equal(page.tracks[0].id, accepted.id);
  assert.equal(page.complete, true); assert.equal(page.count.tracks, 1); assert.equal(page.nextOffset, 400);
  malformed = true;
  const broken = await endpoint(); assert.equal(broken.statusCode, 500); assert.equal(broken.body.ok, false, 'A malformed upstream page is a failure, not an exhausted catalog');
  malformed = false;
} finally { global.fetch = originalFetch; }
function hydrationFixture() {
  const ctx = createAppRuntimeTestContext(), merged = [];
  ctx.mergeCatalogExtraPayload = payload => { merged.push(payload); return { tracksImported: 0, artistsImported: 0, artistSeedsAdded: 0 }; };
  return { ctx, merged };
}
{
  const { ctx, merged } = hydrationFixture(); let attempts = 0;
  ctx.fetchCatalogExtraPage = async () => ++attempts === 1 ? null : { artists: [], tracks: [accepted], pagination: { hasMore: false } };
  await ctx.hydrateCatalogExtraFromSupabase('hard_techno');
  assert.equal(ctx.catalogExtraImportedStyles.has('hard_techno'), false);
  assert.equal(ctx.catalogExtraImportPromises.size, 0);
  await ctx.hydrateCatalogExtraFromSupabase('hard_techno');
  assert.equal(attempts, 2); assert.equal(merged.length, 1); assert.equal(ctx.catalogExtraImportedStyles.has('hard_techno'), true, 'An explicit next hydration retries after temporary failure');
}
{
  const { ctx, merged } = hydrationFixture(); const offsets = [];
  ctx.fetchCatalogExtraPage = async (_style, offset) => { offsets.push(offset); return { artists: [], tracks: [{ ...accepted, id: `recording-${offset}` }], pagination: { hasMore: offset < 800 } }; };
  await ctx.hydrateCatalogExtraFromSupabase('hard_techno');
  assert.deepEqual(offsets, [0, 200, 400, 600], 'Each hydration remains bounded');
  assert.equal(ctx.catalogExtraImportedStyles.has('hard_techno'), false, 'A page window is not the whole catalog');
  assert.equal(ctx.catalogExtraImportOffsets.get('hard_techno'), 800);
  await ctx.hydrateCatalogExtraFromSupabase('hard_techno');
  assert.deepEqual(offsets, [0, 200, 400, 600, 800], 'The next hydration resumes instead of rescanning or dropping later artists');
  assert.equal(merged[1].tracks[0].id, 'recording-800');
  assert.equal(ctx.catalogExtraImportedStyles.has('hard_techno'), true); assert.equal(ctx.catalogExtraImportOffsets.has('hard_techno'), false);
}
{
  const { ctx, merged } = hydrationFixture(); let fail = true; const offsets = [];
  ctx.fetchCatalogExtraPage = async (_style, offset) => { offsets.push(offset); return offset === 200 && fail ? null : { artists: [], tracks: [{ ...accepted, id: `recording-${offset}` }], pagination: { hasMore: offset === 0 } }; };
  await ctx.hydrateCatalogExtraFromSupabase('hard_techno');
  assert.equal(merged[0].count.tracks, 1); assert.equal(merged[0].complete, false); assert.equal(ctx.catalogExtraImportOffsets.get('hard_techno'), 200);
  fail = false; await ctx.hydrateCatalogExtraFromSupabase('hard_techno');
  assert.deepEqual(offsets, [0, 200, 200], 'A partial read resumes at the failed page');
  assert.equal(ctx.catalogExtraImportedStyles.has('hard_techno'), true);
}
{
  const { ctx } = hydrationFixture(); let release, calls = 0;
  ctx.fetchCatalogExtraPage = () => { calls++; return new Promise(resolve => { release = resolve; }); };
  const first = ctx.hydrateCatalogExtraFromSupabase('hard_techno'), second = ctx.hydrateCatalogExtraFromSupabase('hard_techno');
  assert.equal(calls, 1, 'Concurrent callers share one public catalog hydration');
  release({ artists: [], tracks: [], pagination: { hasMore: false } }); await Promise.all([first, second]);
  assert.equal(ctx.catalogExtraImportedStyles.has('hard_techno'), true); assert.equal(ctx.catalogExtraImportPromises.size, 0);
}
{
  const ctx = createAppRuntimeTestContext(); let requests = 0;
  ctx.fetchCatalogExtraPage = async () => { requests++; return { artists: [], tracks: [], pagination: { hasMore: true } }; };
  const page = await ctx.fetchCatalogExtraPayload('', { offset: 20000 });
  assert.equal(requests, 1); assert.equal(page.complete, false); assert.equal(page.nextOffset, 20200, 'The configured scan boundary cannot be mistaken for catalog exhaustion');
}
{
  const ctx = createAppRuntimeTestContext(); let calls = 0;
  ctx.fetchCatalogExtraPage = async () => { calls++; return { artists: [], tracks: [] }; };
  const page = await ctx.fetchCatalogExtraPayload('house'); assert.equal(calls, 1); assert.equal(page.complete, true, 'Existing older API responses remain supported');
}
console.log('Catalog pagination passed: filtered pages cannot hide later verified music; bounded continuation, retries, partial failures, deduped concurrent loading, honest completion and unchanged integrity gates. Public music fixtures only.');
