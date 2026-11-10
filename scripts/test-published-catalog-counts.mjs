import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
const root = new URL('../', import.meta.url);
const manifest = JSON.parse(await readFile(new URL('data/runtime-catalog-v1/manifest.json', root), 'utf8'));
const titleKeys = new Set();
const token = value => String(value || '').normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase().replace(/[^a-z0-9]+/g, '_').replace(/^_+|_+$/g, '');
let rows = 0;
for (const [style, relative] of Object.entries(manifest.styles)) {
  const tracks = JSON.parse(await readFile(new URL('data/runtime-catalog-v1/' + relative, root), 'utf8'));
  assert.equal(tracks.length, manifest.counts[style]); rows += tracks.length;
  for (const track of tracks) titleKeys.add(`${token(track.artist)}::${token(track.song)}`);
}
assert.equal(manifest.catalogSummary.titleCount, titleKeys.size);
assert.equal(manifest.catalogSummary.styleCount, Object.keys(manifest.styles).length);
assert.ok(titleKeys.size < rows, 'Cross-style duplicates cannot inflate the displayed track count');
assert.equal(manifest.catalogSummary.scope, 'bundled_catalog_metadata_not_audio_availability');
const html = await readFile(new URL('index.html', root), 'utf8');
const metrics = html.slice(html.indexOf('id="betaGateMetrics"'), html.indexOf('id="betaProofGrid"'));
assert.ok(!/98k\+|16\.484|5\.179|auditadas|buscáveis|indexados/.test(metrics), 'The entry page cannot present historical targets as current verified coverage');
for (const [id, expected] of [['betaCatalogTitlesCount', titleKeys.size], ['betaCatalogStylesCount', Object.keys(manifest.styles).length]]) {
  const match = metrics.match(new RegExp(`<strong id="${id}" data-catalog-count="(\\d+)">([^<]+)</strong>`));
  assert.ok(match, id); assert.equal(Number(match[1]), expected);
  assert.equal(match[2], expected.toLocaleString('pt-BR'));
}
assert.match(metrics, /confirmação de estilo e áudio varia por faixa/);
console.log(`Published catalog counts passed: ${titleKeys.size} distinct artist/title pairs, ${Object.keys(manifest.styles).length} styles; generated entry counts, no estimated floors or audio guarantee.`);
