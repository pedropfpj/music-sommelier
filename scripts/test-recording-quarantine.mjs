import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import vm from 'node:vm';
import { createAppRuntimeTestContext } from './app-runtime-test-harness.mjs';

const ctx = createAppRuntimeTestContext();
const apiSource = await fs.readFile(new URL('../api/catalog-extra.js', import.meta.url), 'utf8');
const api = { require: () => ({}), module: { exports: {} }, URL, URLSearchParams };
vm.runInNewContext(apiSource + '\nthis.passes=catalogTrackPassesPsytranceIntegrity; this.psyStyles=[...PSYTRANCE_CATALOG_STYLES];', api);
const rawBytes = await fs.readFile(new URL('../data/runtime-catalog-v1/styles/full_on_night.json', import.meta.url), 'utf8');
const rows = JSON.parse(rawBytes);
const row = rows.find(t => t.artist === 'Braincell' && t.song === 'Hanging Out Under The Trees');
assert.equal(row.deezer_track_id, '3603698542'); assert.equal(row.release_date, '2025-10-24'); assert.equal(row.duration_sec, '379');
const track = { artist: row.artist, song: row.song, style: row.style, deezerTrackId: row.deezer_track_id, previewUrl: 'https://audio.example.test/quarantined.m4a', source: 'dynamic_dataset_local_runtime_full_on_night', artistGenre: row.artist_genre };
for (const style of api.psyStyles) {
  assert.equal(ctx.trackBlockedForStyle(style, { ...track, style }), true, style);
  assert.equal(api.passes({ ...row, style }), false, style);
}
for (const style of ['ambient', 'downtempo', 'house', 'techno', 'drum_and_bass']) {
  assert.equal(ctx.trackBlockedForStyle(style, { ...track, style }), false, 'No new block outside psy: ' + style);
  assert.equal(api.passes({ ...row, style }), true);
}
assert.equal(ctx.isTrackEligibleForRecommendation(track), false);
assert.equal(api.passes({ style: 'full_on_night', artist: 'Different credit', song: 'Different metadata', metadata: JSON.stringify({ deezer_track_id: '3603698542' }) }), false, 'Known provider ID identifies the same audio despite a truncated/wrong credit');
assert.equal(ctx.trackBlockedForStyle('full_on_night', { artist: 'Different credit', song: 'Different metadata', itunesTrackId: '1846331779' }), true);
for (const artist of ['Braincell', 'Undercover Babas', 'Braincell & Mandala (UK) & Undercover Babas', 'Mandala (UK), Braincell']) {
  const noId = { artist, song: row.song, style: 'full_on_night' };
  assert.equal(ctx.trackBlockedForStyle(noId.style, noId), true, artist);
  assert.equal(api.passes(noId), false, artist);
}
for (const unaffected of [
  { artist: 'Braincell', song: 'Signal 404', deezerTrackId: '3399309651' },
  { artist: 'Other Braincell', song: row.song },
  { artist: 'Braincell & Another Artist', song: row.song },
  { artist: 'Mandala', song: row.song },
  { artist: 'Braincell', song: row.song + ' (Unverified Remix)' },
  { artist: 'Braincell', song: row.song, deezerTrackId: '123456789' }
]) {
  const t = { ...unaffected, style: 'full_on_night' };
  assert.equal(ctx.trackBlockedForStyle(t.style, t), false, JSON.stringify(t));
  assert.equal(api.passes(t), true, JSON.stringify(t));
}
const before = ctx.catalog.filter(t => t.artist === row.artist && t.song === row.song).length;
ctx.mergeExternalDatasetRows([row], 'dataset_local_runtime_full_on_night');
assert.equal(ctx.catalog.filter(t => t.artist === row.artist && t.song === row.song).length, before, 'The original source row is refused on import');
ctx.catalog.push({ ...track });
ctx.sanitizeCatalogByStyleRules();
assert.equal(ctx.catalog.some(t => t.artist === row.artist && t.song === row.song), false, 'A cached old classification is quarantined too');
assert.equal(await fs.readFile(new URL('../data/runtime-catalog-v1/styles/full_on_night.json', import.meta.url), 'utf8'), rawBytes, 'Original provenance/snapshot stays intact');
console.log('Recording quarantine passed: exact provider/confirmed-credit identity, psy-only scope, original shard/cache/API gates, and no artist/global/remix ban.');
