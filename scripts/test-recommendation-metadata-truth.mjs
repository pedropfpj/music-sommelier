import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import { startTestPreviewServer } from './test-preview-server.mjs';
import { compactRow } from './build-runtime-catalog.mjs';

const { chromium } = await import(process.env.SONIC_PLAYWRIGHT_MODULE || 'playwright');
const source = await fs.readFile(process.env.SONIC_METADATA_TRUTH_APP_PATH || new URL('../app.js', import.meta.url), 'utf8');
const popRows = JSON.parse(await fs.readFile(new URL('../data/runtime-catalog-v1/styles/electronic_dance_pop.json', import.meta.url)));
const houseRows = JSON.parse(await fs.readFile(new URL('../data/runtime-catalog-v1/styles/french_house.json', import.meta.url)));
const acidRows = JSON.parse(await fs.readFile(new URL('../data/runtime-catalog-v1/styles/acid_trance.json', import.meta.url)));
const actual = [popRows.find(r => r.artist === 'Calvin Harris' && r.song === 'Feel So Close'), houseRows.find(r => r.artist === 'Daft Punk' && r.song === 'One More Time'), acidRows.find(r => r.artist === 'Art of Trance' && r.song === 'Stealth')];
assert.ok(actual.every(Boolean), 'Keep real affected recordings in this regression');
const explicit = compactRow({ style: 'house', artist: 'Editorial Fixture', song: 'Explicit vocals and contexts', deezer_track_id: '900001', vocal_profile: 'light_vocals', listening_contexts: ['foco', 'warmup'] }, 'fixture.csv');
assert.equal(explicit.vocals, 'light_vocals', 'The real runtime builder preserves editorial vocal provenance');
assert.equal(explicit.context, 'foco|warmup', 'The real runtime builder preserves editorial contexts');
const preview = await startTestPreviewServer();
const browser = await chromium.launch({ headless: true, executablePath: process.env.SONIC_CHROMIUM_EXECUTABLE || '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome' });
try {
  const page = await browser.newPage();
  const errors = [];
  page.on('pageerror', e => errors.push(e.message));
  await page.route('**/*', route => {
    const url = new URL(route.request().url());
    if (url.origin !== preview.baseUrl) return route.abort();
    if (url.pathname.startsWith('/api/')) return route.fulfill({ json: { ok: true, enabled: false, tracks: [], count: 0 } });
    if (url.pathname === '/app.min.js') return route.fulfill({ contentType: 'application/javascript', body: source });
    return route.continue();
  });
  await page.addInitScript(() => localStorage.setItem('sonic_search:privacy:analytics:v1', 'no'));
  await page.goto(`${preview.baseUrl}/?qa=1&lang=pt&screenshot=1&recommendation=0`, { waitUntil: 'domcontentloaded' });
  await page.waitForFunction(() => typeof mergeExternalDatasetRows === 'function');
  const result = await page.evaluate(({ actual, explicit }) => {
    catalog.length = 0;
    const curated = { style: 'house', artist: 'Local Editorial Fixture', song: 'Local instrumental', label: 'Fixture imprint', source: 'local_editorial', vocals: 'instrumental', context: ['warmup'] };
    catalog.push(curated);
    mergeExternalDatasetRows([...actual, explicit], 'dataset_local_runtime_metadata_regression');
    const vocal = catalog.find(t => t.artist === 'Calvin Harris' && t.song === 'Feel So Close');
    const daft = catalog.find(t => t.artist === 'Daft Punk' && t.song === 'One More Time');
    const art = catalog.find(t => t.artist === 'Art of Trance' && t.song === 'Stealth');
    const editorial = catalog.find(t => t.artist === explicit.artist);
    const vocalsScore = value => recommendationPrecisionScore(vocal, { style: vocal.style, vocals: value });
    const scoreWithoutInventedMatch = { instrumental: vocalsScore('instrumental'), vocal: vocalsScore('vocal') };
    const bios = {};
    for (const language of ['pt', 'en', 'es']) {
      currentLanguage = language;
      renderArtistHub(daft, { hydrate: false });
      bios[language] = { artist: artistBio.textContent, label: labelBio.textContent, art: detailedArtistBio(art) };
    }
    currentLanguage = 'pt';
    const knownBio = detailedArtistBio({ artist: '1200 Micrograms', song: 'LSD', style: 'full_on' });
    const knownLabel = detailedLabelBio({ label: 'Parvati Records', artist: 'Derango', song: 'Fixture', style: 'forest_psy' });
    const unverifiedBio = detailedArtistBio({ ...vocal, artistBio: 'This project was founded in Atlantis in 1973 and headlined every major festival before the artist had recorded a single song.' });
    mergeCatalogExtraPayload({ tracks: [{ style: 'house', artist: 'Cloud Editorial Fixture', song: 'Cloud explicit evidence', label: 'Fixture', preview_url: 'https://metadata.fixture.test/cloud.mp3', metadata: { vocals: 'vocal', contexts: ['social'] } }] });
    const cloud = catalog.find(t => t.artist === 'Cloud Editorial Fixture');
    const malformed = typeof normalizeImportedListeningMetadata === 'function'
      ? normalizeImportedListeningMetadata({ vocal: true }, '["invalid_context",42,null]')
      : {};
    const legacy = { ...vocal, song: 'Legacy cached recording', vocals: 'instrumental', context: ['peak', 'treino', 'estrada', 'after', 'foco', 'trabalho', 'warmup'] };
    delete legacy.listeningMetadataVersion;
    legacy.labelBio = 'Legacy album ajuda a dar contexto para essa faixa em House. Se a música bater, use a gravadora como uma trilha para achar artistas próximos, releases parecidos e um pouco da cena em volta.';
    const stored = [legacy, editorial];
    localStorage.setItem(DYNAMIC_CATALOG_CACHE_KEY, JSON.stringify(stored));
    catalog.length = 0;
    loadDynamicCatalogCache();
    const restored = catalog.find(t => t.song === legacy.song);
    const restoredEditorial = catalog.find(t => t.song === editorial.song);
    const legacyLabelBio = detailedLabelBio({ ...restored, label: 'Legacy album' });
    // Re-saving and re-reading must preserve explicit evidence and the repaired unknowns.
    saveDynamicCatalogCache(); catalog.length = 0; loadDynamicCatalogCache();
    const twiceRestored = catalog.find(t => t.song === legacy.song);
    const unknownAfterReload = { vocals: twiceRestored.vocals, context: twiceRestored.context };
    const countBeforeEnrichment = catalog.length;
    mergeExternalDatasetRows([{ ...actual[0], song: legacy.song, vocals: 'vocal', context: 'social' }], 'dataset_local_runtime_fresh_editorial');
    const enriched = { vocals: twiceRestored.vocals, context: twiceRestored.context, sameCount: catalog.length === countBeforeEnrichment };
    catalog.length = 0; loadDynamicCatalogCache();
    const enrichedAfterReload = catalog.find(t => t.song === legacy.song);
    return { vocal: { vocals: vocal.vocals, context: vocal.context, deezerTrackId: vocal.deezerTrackId, eligible: isTrackEligibleForRecommendation(vocal) }, editorial: { vocals: editorial.vocals, context: editorial.context }, curated, scoreWithoutInventedMatch, bios, knownBio, knownLabel, unverifiedBio, cloud: { vocals: cloud.vocals, context: cloud.context }, malformed, restored: { vocals: restored.vocals, context: restored.context, deezerTrackId: restored.deezerTrackId }, restoredEditorial: { vocals: restoredEditorial.vocals, context: restoredEditorial.context }, twiceRestored: unknownAfterReload, legacyLabelBio, enriched, enrichedAfterReload: { vocals: enrichedAfterReload.vocals, context: enrichedAfterReload.context } };
  }, { actual, explicit });
  assert.equal(result.vocal.vocals, 'unknown', 'Missing vocal evidence cannot turn a credited vocal recording into an instrumental');
  assert.deepEqual(result.vocal.context, [], 'Missing context evidence cannot make every imported recording fit seven contexts');
  assert.equal(result.vocal.deezerTrackId, actual[0].deezer_track_id, 'Keep the exact recording refresh route');
  assert.equal(result.vocal.eligible, true, 'Missing optional metadata must not remove a genre-eligible recording');
  assert.equal(result.scoreWithoutInventedMatch.instrumental, result.scoreWithoutInventedMatch.vocal, 'An unknown vocal field cannot earn a fabricated instrumental match');
  assert.deepEqual(result.editorial, { vocals: 'light_vocals', context: ['foco', 'warmup'] });
  assert.deepEqual(result.cloud, { vocals: 'vocal', context: ['social'] }, 'Catalog Extra explicit metadata uses the same validated contract');
  assert.equal(result.malformed.vocals, 'unknown'); assert.deepEqual(result.malformed.context, []);
  assert.equal(result.curated.vocals, 'instrumental', 'Existing curated instrumental metadata stays intact');
  assert.deepEqual(result.curated.context, ['warmup']);
  assert.equal(result.restored.vocals, 'unknown'); assert.deepEqual(result.restored.context, []);
  assert.equal(result.restored.deezerTrackId, actual[0].deezer_track_id, 'Repair only metadata in the old cache, retaining recordings and audio IDs');
  assert.deepEqual(result.restoredEditorial, result.editorial);
  assert.deepEqual(result.twiceRestored, { vocals: 'unknown', context: [] });
  assert.deepEqual(result.enriched, { vocals: 'vocal', context: ['social'], sameCount: true }, 'Fresh editorial evidence repairs a cached unknown without duplicating a recording');
  assert.deepEqual(result.enrichedAfterReload, { vocals: 'vocal', context: ['social'] });
  for (const language of ['pt', 'en', 'es']) {
    const { artist, label, art } = result.bios[language];
    assert.match(artist, /contexto musical|musical context/i);
    assert.ok(artist.includes('Daft Punk') && artist.includes('One More Time'));
    assert.doesNotMatch(artist, /gravadora Discovery|record label Discovery|sello Discovery/i, 'A release title cannot become a record-label attribution');
    assert.doesNotMatch(art, /curado para ampliar|top track deezer|priorizar quando|official preview/i, 'Operational curation notes cannot become a biography');
    assert.doesNotMatch(label, /use a gravadora|use the label as a path/i);
  }
  assert.match(result.knownBio, /Raja Ram|Riktam/, 'Preserve existing editorial artist profiles');
  assert.doesNotMatch(result.unverifiedBio, /Atlantis|1973|headlined/i, 'Unverified imported prose cannot become biographical facts');
  assert.match(result.knownLabel, /Parvati/, 'Preserve existing known label profiles');
  assert.doesNotMatch(result.legacyLabelBio, /use a gravadora como uma trilha/i, 'Cached generated label prose cannot restore a false role');
  assert.deepEqual(errors, []);
  console.log('Recommendation metadata truth passed: real runtime builder/import, editorial fields, missing evidence, score, cached reloads and PT/EN/ES rendered biographies. No external providers or accounts.');
} finally { await browser.close(); await preview.stop(); }
