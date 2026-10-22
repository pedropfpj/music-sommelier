#!/usr/bin/env node
import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { validateSeeds, searchUrl, sanitizeProviderTrack, resolveSeed, expandArtistRepertoire, pilotCoverage, stableUuid, textKey } from "./universal-catalog-pilot-utils.mjs";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const manifest = JSON.parse(await fs.readFile(path.join(root, "data/universal-catalog-seeds.json"), "utf8"));
const seeds = validateSeeds(manifest);
const args = process.argv.slice(2);
const fetchEnabled = args.includes("--fetch");
const requestedArtists = args.find(arg => arg.startsWith("--artists="))?.slice(10).split(",").map(textKey) || [];
if (requestedArtists.some(artist => !seeds.some(seed => textKey(seed.artist) === artist))) throw new Error("Unknown research artist");
const country = String(args.find(arg => arg.startsWith("--country="))?.split("=")[1] || "BR").toUpperCase();
if (!/^[A-Z]{2}$/.test(country)) throw new Error("Country must be an ISO two-letter storefront code");
const snapshotPath = path.join(root, `reports/universal-catalog-provider-snapshot-${country.toLowerCase()}.json`);
let snapshot = { schemaVersion: 1, country, searches: {} };
try { snapshot = JSON.parse(await fs.readFile(snapshotPath, "utf8")); } catch (error) { if (error.code !== "ENOENT") throw error; }
if (snapshot.country !== country || snapshot.schemaVersion !== 1 || !snapshot.searches) throw new Error("Incompatible provider snapshot");
let previousRequestAt = 0;
const wait = ms => new Promise(resolve => setTimeout(resolve, ms));

async function fetchSearch(url) {
  for (let attempt = 0; attempt < 3; attempt += 1) {
    // Apple documents approximately 20 calls/minute. All calls, including retries, share this limiter.
    await wait(Math.max(0, 3300 - (Date.now() - previousRequestAt)));
    previousRequestAt = Date.now();
    let response;
    try {
      response = await fetch(url, { signal: AbortSignal.timeout(15000), headers: { Accept: "application/json" } });
      if (response.ok) {
        const payload = await response.json();
        if (!Array.isArray(payload.results)) throw new Error("Invalid provider response");
        return { retrievedAt: new Date().toISOString(), sourceUrl: url, results: payload.results.map(sanitizeProviderTrack) };
      }
      if (response.status !== 429 && response.status < 500) throw new Error(`Provider HTTP ${response.status}`);
    } catch (error) {
      if (attempt === 2 || (response && response.status >= 400 && response.status !== 429 && response.status < 500)) throw error;
    }
    if (attempt === 2) throw new Error(`Provider HTTP ${response?.status || "unavailable"}`);
    await wait(5000 * (attempt + 1));
  }
}

const tracks = [];
const issues = [];
for (const [index, seed] of seeds.entries()) {
  const fetchArtist = fetchEnabled && (!requestedArtists.length || requestedArtists.includes(textKey(seed.artist)));
  const url = searchUrl(seed, country);
  let search = snapshot.searches[url];
  if (fetchArtist && (!search || args.includes("--refresh"))) {
    try {
      search = await fetchSearch(url);
      snapshot.searches[url] = search;
      await fs.writeFile(snapshotPath, `${JSON.stringify(snapshot, null, 2)}\n`);
    } catch (error) {
      issues.push({ artist: seed.artist, universe: seed.universe, reason: "provider_search_failed", detail: error.message });
      console.log(`[${index + 1}/${seeds.length}] ${seed.artist}: provider unavailable`);
      continue;
    }
  }
  if (!search) {
    issues.push({ artist: seed.artist, universe: seed.universe, reason: "provider_snapshot_missing" });
    continue;
  }
  const resolved = resolveSeed(seed, search.results, { country, retrievedAt: search.retrievedAt, sourceUrl: url, batch: manifest.batch });
  for (const issue of [...resolved.issues]) {
    if (issue.reason !== "no_exact_provider_match") continue;
    const fallbackSeed = { ...seed, songs: [issue.song], searchTerm: `${seed.artist} ${issue.song}` };
    const fallbackUrl = searchUrl(fallbackSeed, country);
    let fallbackSearch = snapshot.searches[fallbackUrl];
    if (!fallbackSearch && fetchArtist && args.includes("--resolve-missing")) {
      try {
        fallbackSearch = await fetchSearch(fallbackUrl);
        snapshot.searches[fallbackUrl] = fallbackSearch;
        await fs.writeFile(snapshotPath, `${JSON.stringify(snapshot, null, 2)}\n`);
      } catch (error) {
        issue.detail = error.message;
      }
    }
    if (!fallbackSearch) continue;
    const fallback = resolveSeed(fallbackSeed, fallbackSearch.results, { country, retrievedAt: fallbackSearch.retrievedAt, sourceUrl: fallbackUrl, batch: manifest.batch });
    if (fallback.tracks.length) {
      resolved.tracks.push(...fallback.tracks);
      resolved.issues.splice(resolved.issues.indexOf(issue), 1);
    }
  }
  expandArtistRepertoire(seed, search.results, resolved, { country, retrievedAt: search.retrievedAt, sourceUrl: url, batch: manifest.batch }, manifest.recordingsPerArtist);
  tracks.push(...resolved.tracks);
  issues.push(...resolved.issues);
  console.log(`[${index + 1}/${seeds.length}] ${seed.artist}: ${resolved.tracks.length} provider recordings; ${resolved.issues.length} unresolved targets`);
}
const seen = new Set();
const artistIdentities = new Map();
for (const track of tracks) {
  const identities = artistIdentities.get(track.artistKey) || new Set();
  identities.add(track.providerLinks[0].artistExternalId);
  artistIdentities.set(track.artistKey, identities);
}
const uniqueTracks = tracks.filter(track => {
  if (artistIdentities.get(track.artistKey).size > 1) {
    issues.push({ artist: track.artist, song: track.song, universe: track.universe, reason: "ambiguous_provider_artist_across_searches" });
    return false;
  }
  if (!seen.has(track.key)) { seen.add(track.key); return true; }
  issues.push({ artist: track.artist, song: track.song, universe: track.universe, reason: "duplicate_provider_recording" });
  return false;
});
if (!uniqueTracks.length) throw new Error("No exact provider matches. Existing pilot files are preserved; run with --fetch to create a provider snapshot.");
const artistCatalog = new Map();
for (const track of uniqueTracks) {
  const artist = artistCatalog.get(track.artistKey) || { key: track.artistKey, name: track.metadata.editorial_artist,
    status: "needs_review", editorialTier: track.discoveryTier, providerNames: [], universes: [], genres: [], trackKeys: [],
    providerIds: { apple_music: track.providerLinks[0].artistExternalId } };
  for (const [field, value] of [["providerNames", track.metadata.provider_artist_credit], ["universes", track.universe], ["genres", track.genre], ["trackKeys", track.key]]) {
    if (!artist[field].includes(value)) artist[field].push(value);
  }
  artistCatalog.set(track.artistKey, artist);
}
const dataset = { schemaVersion: 1, batch: manifest.batch, country, releaseReady: false,
  rightsMode: "external_provider_links_only", artists: [...artistCatalog.values()], tracks: uniqueTracks, issues,
  deferredTargets: seeds.flatMap(seed => (seed.deferredSongs || []).map(song => ({ artist: seed.artist, song, universe: seed.universe, reason: "further_provider_or_credit_review" }))),
  coverage: pilotCoverage(seeds, uniqueTracks, issues) };
await fs.writeFile(path.join(root, "data/universal-catalog-pilot.json"), `${JSON.stringify(dataset, null, 2)}\n`);

function sqlLiteral(value) { return `'${String(value).replace(/'/g, "''")}'`; }
function jsonLiteral(value) { return `${sqlLiteral(JSON.stringify(value))}::jsonb`; }

// No public promotion, deletes, or updates to existing catalog rows. This is an inspectable candidate seed.
const sqlRows = uniqueTracks.map(track => ({
  ...track, recordingId: stableUuid(track.key),
  work: track.work ? { ...track.work, id: stableUuid(track.work.identityKey) } : null
}));
const sql = `-- Generated by scripts/generate-universal-catalog-pilot.mjs.
-- CANDIDATES ONLY: all new artists/recordings need review, genre assertions remain candidates.
-- Does not enable the universal UI or billing. Existing rows are never overwritten.
begin;
create temporary table sonic_universal_pilot on commit drop as
select value as payload from jsonb_array_elements(${jsonLiteral(sqlRows)});

-- Refuse ambiguous legacy provider identities rather than silently connecting the wrong artist.
do $$ begin
  if exists (
    select 1 from sonic_universal_pilot s
    join public.music_artist_external_ids e on e.provider = 'apple_music' and e.external_id = s.payload #>> '{providerLinks,0,artistExternalId}'
    join public.music_artists a on a.id = e.artist_id
    where a.canonical_key <> public.catalog_key(s.payload ->> 'artist')
  ) then raise exception 'Pilot Apple artist identity collision: review aliases before import'; end if;
  if exists (
    select 1 from sonic_universal_pilot s left join public.music_genres g on g.slug = s.payload ->> 'genre'
    where g.slug is null or g.universe_slug <> s.payload ->> 'universe'
  ) then raise exception 'Pilot genre/universe mismatch'; end if;
end $$;

-- Existing provider recordings are preserved, not duplicated or placed back into review.
delete from sonic_universal_pilot s where exists (
  select 1 from public.music_provider_links p
  where p.provider = 'apple_music' and p.external_id = s.payload #>> '{providerLinks,0,externalId}'
);

insert into public.music_artists (canonical_name, status, verification_confidence, metadata)
select distinct payload ->> 'artist', 'needs_review', 0.7, jsonb_build_object('pilot_batch', ${sqlLiteral(manifest.batch)}) from sonic_universal_pilot
on conflict (canonical_key) do nothing;
insert into public.music_artists (canonical_name, status, verification_confidence, metadata)
select distinct credit ->> 'artist', 'needs_review', 0.5, jsonb_build_object('pilot_batch', ${sqlLiteral(manifest.batch)})
from sonic_universal_pilot s cross join lateral jsonb_array_elements(s.payload -> 'credits') credit
on conflict (canonical_key) do nothing;

insert into public.music_artist_aliases (artist_id, alias, alias_type, source)
select distinct a.id, s.payload #>> '{metadata,editorial_artist}', 'search', 'sonic_editorial_pilot'
from sonic_universal_pilot s join public.music_artists a on a.canonical_key = public.catalog_key(s.payload ->> 'artist')
where a.canonical_key <> public.catalog_key(s.payload #>> '{metadata,editorial_artist}')
on conflict do nothing;

insert into public.music_artist_external_ids (artist_id, provider, external_id, source, metadata)
select distinct a.id, 'apple_music', s.payload #>> '{providerLinks,0,artistExternalId}', 'itunes_search_api', jsonb_build_object('pilot_batch', ${sqlLiteral(manifest.batch)})
from sonic_universal_pilot s join public.music_artists a on a.canonical_key = public.catalog_key(s.payload ->> 'artist')
on conflict do nothing;

insert into public.music_works (id, title, identity_key, composer_artist_id, catalog_number, metadata)
select distinct (s.payload #>> '{work,id}')::uuid, s.payload #>> '{work,title}', s.payload #>> '{work,identityKey}', a.id,
  s.payload #>> '{work,catalogNumber}', jsonb_build_object('pilot_batch', ${sqlLiteral(manifest.batch)}, 'quality_gate', 'pending_review')
from sonic_universal_pilot s join public.music_artists a on a.canonical_key = public.catalog_key(s.payload #>> '{work,composer}')
where jsonb_typeof(s.payload -> 'work') = 'object'
on conflict (identity_key) do nothing;

insert into public.music_recordings (id, title, identity_key, work_id, release_title, release_date, duration_sec, explicit, status, verification_confidence, metadata)
select (s.payload ->> 'recordingId')::uuid, s.payload ->> 'song', s.payload ->> 'key', w.id, s.payload ->> 'releaseTitle',
  (s.payload ->> 'releaseDate')::date, (s.payload ->> 'durationSec')::integer, (s.payload ->> 'explicit')::boolean,
  'needs_review', 0.7, s.payload -> 'metadata'
from sonic_universal_pilot s left join public.music_works w on w.identity_key = s.payload #>> '{work,identityKey}'
on conflict (identity_key) do nothing;

insert into public.music_recording_artists (recording_id, artist_id, role, position)
select r.id, a.id, credit ->> 'role', case when credit ->> 'role' = 'primary' then 0 else 1 end
from sonic_universal_pilot s cross join lateral jsonb_array_elements(s.payload -> 'credits') credit
join public.music_artists a on a.canonical_key = public.catalog_key(credit ->> 'artist')
join public.music_recordings r on r.identity_key = s.payload ->> 'key'
on conflict do nothing;

insert into public.music_recording_genres (recording_id, genre_slug, confidence, assertion_status, source, source_url, metadata)
select r.id, s.payload ->> 'genre', 0.5, 'candidate', 'sonic_editorial_pilot', s.payload #>> '{source,url}', s.payload -> 'metadata'
from sonic_universal_pilot s join public.music_recordings r on r.identity_key = s.payload ->> 'key'
on conflict do nothing;

insert into public.music_provider_links (recording_id, provider, external_id, url, link_type, capabilities, territories, rights_note, metadata)
select r.id, 'apple_music', s.payload #>> '{providerLinks,0,externalId}', s.payload #>> '{providerLinks,0,url}', 'external',
  '["open_provider"]'::jsonb, array[${sqlLiteral(country)}], s.payload #>> '{providerLinks,0,rightsNote}', jsonb_build_object('pilot_batch', ${sqlLiteral(manifest.batch)})
from sonic_universal_pilot s join public.music_recordings r on r.identity_key = s.payload ->> 'key'
on conflict do nothing;

insert into public.music_source_assertions (assertion_key, entity_type, entity_id, field_name, asserted_value, source, source_url, source_license, confidence, retrieved_at, metadata)
select ${sqlLiteral(manifest.batch)} || ':' || (s.payload ->> 'key'), 'recording', r.id, 'provider_identity',
  jsonb_build_object('artist', s.payload ->> 'artist', 'song', s.payload ->> 'song', 'provider_genre', s.payload #>> '{metadata,provider_genre}'),
  'itunes_search_api', s.payload #>> '{source,url}', 'Apple Search API terms; external metadata and link only; commercial use review pending',
  0.7, (s.payload #>> '{source,retrievedAt}')::timestamptz, s.payload -> 'metadata'
from sonic_universal_pilot s join public.music_recordings r on r.identity_key = s.payload ->> 'key'
on conflict (assertion_key) do nothing;

insert into public.music_catalog_quarantine (entity_type, entity_key, reason_code, reason_detail, source, payload)
select 'recording', payload ->> 'key', 'pilot_curatorial_review_required',
  'Provider identity matched. Genre, editorial tier, credits and commercial/territorial presentation still require review.',
  ${sqlLiteral(manifest.batch)}, payload from sonic_universal_pilot
on conflict (entity_type, entity_key, reason_code) do nothing;
commit;
`;
await fs.writeFile(path.join(root, "supabase/seeds/universal_catalog_pilot_candidates.sql"), sql);
const table = dataset.coverage.map(row => `| ${row.label} | ${row.matchedArtists}/${row.plannedArtists} | ${row.matchedTracks} | ${row.tiers.reference}/${row.tiers.deep_cut}/${row.tiers.discovery} | ${row.issues} |`).join("\n");
const markdownLabel = value => String(value).replace(/\s+/g, " ").replace(/([\[\]\\*_`])/g, "\\$1");
const tierLabels = { reference: "Referência", deep_cut: "Aprofundamento", discovery: "Descoberta" };
const editorialListing = dataset.coverage.map(row => `### ${row.label}\n\n${dataset.artists.filter(artist => artist.universes.includes(row.universe)).map(artist => {
  const songs = dataset.tracks.filter(track => artist.trackKeys.includes(track.key))
    .map(track => `[${markdownLabel(track.song)}](<${track.providerLinks[0].url}>)`).join(", ");
  return `- ${markdownLabel(artist.name)} (${tierLabels[artist.editorialTier]}) — ${songs}`;
}).join("\n")}`).join("\n\n");
const report = `# Universal catalog pilot\n\nBatch: ${manifest.batch}. Storefront: ${country}.\n\n${uniqueTracks.length} provider-identified recordings from ${new Set(uniqueTracks.map(track => track.artistKey)).size} artists. All are candidates, not a public listening catalog.\n\nThe repertoire expands only after an exact artist + editorial recording match anchors the provider artist ID. Additional recordings preserve provider titles and require individual genre, credit and tier review. Classical works are not automatically expanded.\n\n| Universe | Matched/planned artists | Tracks | Reference/deep/discovery tracks | Unmatched targets |\n| --- | --- | --- | --- | --- |\n${table}\n\n## Release state\n\n- External provider links only; no previews, artwork or audio files copied.\n- Genre and artist tiers are editorial candidates, not provider-verified classifications.\n- The SQL seed does not enable billing, the catalog API or multi-universe onboarding.\n- No claim of complete coverage of the 262 genres: uncovered genres are listed in the JSON.\n- The existing electronic catalog is unchanged.\n\n## Unmatched targets\n\n${issues.map(issue => `- ${issue.artist}${issue.song ? ` — ${issue.song}` : ""}: ${issue.reason}`).join("\n") || "None."}\n\n## Deferred research targets\n\n${dataset.deferredTargets.map(issue => `- ${issue.artist} — ${issue.song}`).join("\n") || "None."}\n`;
await fs.writeFile(path.join(root, "reports/universal-catalog-pilot.md"), report);
await fs.appendFile(path.join(root, "reports/universal-catalog-pilot.md"), `\n## Curadoria do piloto — artistas e músicas\n\nCamadas editoriais iniciais, sujeitas à revisão. Os links abrem o provedor; estas músicas ainda não estão liberadas no app.\n\n${editorialListing}\n`);
console.log(`Pilot generated: ${uniqueTracks.length} provider-matched tracks; ${issues.length} review/missing issues; public release disabled.`);
