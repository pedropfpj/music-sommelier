import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
const root = new URL('../', import.meta.url);
const json = async file => JSON.parse(await readFile(new URL(file,root),'utf8'));
const selection = await json('data/discovery-expansion-selection-v23.json');
const validation = await json('reports/quality-20261105/catalog-validation.json');
const core = await json('data/runtime-catalog-v1/core.json');
const norm = value => String(value||'').normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase();
const key = row => `${norm(row.artist)}::${norm(row.song)}`;
assert.equal(validation.failed.length,0);
assert.equal(new Set(selection.tracks.map(key)).size,selection.tracks.length,'The expansion must contain unique recordings');
for(const style of new Set(selection.tracks.map(t=>t.style))){
 const rows = await json(`data/runtime-catalog-v1/styles/${style}.json`);
 assert.ok(new Set(rows.map(row=>norm(row.artist))).size>=5,`${style}: expansion must improve artist diversity, not just track count`);
 const coreRows = core.filter(row=>row.style===style);
 assert.ok(new Set(coreRows.map(row=>norm(row.artist))).size>=5,`${style}: the first loaded catalog must retain the expanded artist diversity`);
 for(const expected of selection.tracks.filter(t=>t.style===style)){
  assert.equal(expected.universe,'electronic');
  const actual = rows.find(row=>key(row)===key(expected));
  assert.ok(actual,`${expected.artist} — ${expected.song} must reach the runtime shard`);
  const proof = validation.passed.find(row=>key(row)===key(expected));
  assert.equal(proof?.identityMatch,true);
  assert.match(actual.preview_url,/^https:\/\/[^/]+\.itunes\.apple\.com\/.*AudioPreview/);
  assert.equal(actual.preview_url,proof.previewUrl);
  assert.equal(actual.genre_evidence_url,expected.genreSource,'Source evidence must survive compaction');
  if(style==='minimal_deep_tech')assert.equal(Number(actual.bpm),expected.bpm,'Fine-subgenre runtime requires the verified tempo');
 }
}
console.log(`Curated electronic expansion passed: ${selection.tracks.length} unique recordings, five improved styles, and diverse starter shards.`);
