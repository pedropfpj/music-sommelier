-- Sonic Search - Psycore enrichment V2
-- Generated 2026-06-20.
-- Sources:
--   Voodoo Hoodoo Records - VOODOO-CORE (vol 2)
--   Voodoo Hoodoo Records - VITAL PROGNOSIS
--   Naturaiz Records - Naturaiz Records Vol.1
--   Naturaiz Records - Vutt'un - Voluptas In Anima
-- Run in Supabase SQL Editor only after review.

create temporary table if not exists psycore_enrichment_v2_tracks (
  style text not null,
  artist text not null,
  artist_names text[] not null,
  song text not null,
  label text not null,
  bpm_exact numeric,
  bpm_text text,
  release_date date,
  duration_sec integer,
  country text,
  city text,
  source_album text not null,
  source text not null,
  source_url text not null,
  bandcamp_track_url text not null,
  bandcamp_track_id text not null,
  source_tags text[] not null
) on commit drop;

truncate table psycore_enrichment_v2_tracks;

insert into psycore_enrichment_v2_tracks (
  style,
  artist,
  artist_names,
  song,
  label,
  bpm_exact,
  bpm_text,
  release_date,
  duration_sec,
  country,
  city,
  source_album,
  source,
  source_url,
  bandcamp_track_url,
  bandcamp_track_id,
  source_tags
) values
  ('psycore', 'Astral Labyrinth Vs Zamurah', array['Astral Labyrinth', 'Zamurah'], 'Undercore', 'Voodoo Hoodoo Records', 200, '200 BPM', '2021-12-18', 500, null, null, 'VOODOO-CORE (vol 2)', 'voodoo_hoodoo_bandcamp_voodoo_core_vol2_2021', 'https://voodoo-hoodoo.bandcamp.com/album/voodoo-core-vol-2', 'https://voodoo-hoodoo.bandcamp.com/track/undercore-200-2', '1532207338', array['psycore', 'darkpsy', 'experimental-psytrance', 'forest-psytrance', 'hitech-psytrance']),
  ('psycore', 'Affectum Infernum', array['Affectum Infernum'], 'Flowing Thru', 'Voodoo Hoodoo Records', 211, '211 BPM', '2021-12-18', 509, null, null, 'VOODOO-CORE (vol 2)', 'voodoo_hoodoo_bandcamp_voodoo_core_vol2_2021', 'https://voodoo-hoodoo.bandcamp.com/album/voodoo-core-vol-2', 'https://voodoo-hoodoo.bandcamp.com/track/flowing-thru-211', '2949734058', array['psycore', 'darkpsy', 'experimental-psytrance', 'forest-psytrance', 'hitech-psytrance']),
  ('psycore', 'Narcolepsy', array['Narcolepsy'], 'Mystery', 'Voodoo Hoodoo Records', 210, '210 BPM', '2021-12-18', 592, null, null, 'VOODOO-CORE (vol 2)', 'voodoo_hoodoo_bandcamp_voodoo_core_vol2_2021', 'https://voodoo-hoodoo.bandcamp.com/album/voodoo-core-vol-2', 'https://voodoo-hoodoo.bandcamp.com/track/mystery-210-2', '2667146970', array['psycore', 'darkpsy', 'experimental-psytrance', 'forest-psytrance', 'hitech-psytrance']),
  ('psycore', 'Silverdaze', array['Silverdaze'], 'Tzoumerka Horizons', 'Voodoo Hoodoo Records', 215, '215 BPM', '2021-12-18', 535, null, null, 'VOODOO-CORE (vol 2)', 'voodoo_hoodoo_bandcamp_voodoo_core_vol2_2021', 'https://voodoo-hoodoo.bandcamp.com/album/voodoo-core-vol-2', 'https://voodoo-hoodoo.bandcamp.com/track/tzoumerka-horizons-215', '3777830821', array['psycore', 'darkpsy', 'experimental-psytrance', 'forest-psytrance', 'hitech-psytrance']),
  ('psycore', 'Glitchy Jungle', array['Glitchy Jungle'], 'The Language of Trees', 'Voodoo Hoodoo Records', 220, '220 BPM', '2021-12-18', 471, null, null, 'VOODOO-CORE (vol 2)', 'voodoo_hoodoo_bandcamp_voodoo_core_vol2_2021', 'https://voodoo-hoodoo.bandcamp.com/album/voodoo-core-vol-2', 'https://voodoo-hoodoo.bandcamp.com/track/the-language-of-trees-220', '1512483230', array['psycore', 'darkpsy', 'experimental-psytrance', 'forest-psytrance', 'hitech-psytrance']),
  ('psycore', 'Espiritus', array['Espiritus'], 'Suenos Profeticos', 'Voodoo Hoodoo Records', 222, '222 BPM', '2021-12-18', 562, null, null, 'VOODOO-CORE (vol 2)', 'voodoo_hoodoo_bandcamp_voodoo_core_vol2_2021', 'https://voodoo-hoodoo.bandcamp.com/album/voodoo-core-vol-2', 'https://voodoo-hoodoo.bandcamp.com/track/suen-os-profe-ticos-222', '2716800402', array['psycore', 'darkpsy', 'experimental-psytrance', 'forest-psytrance', 'hitech-psytrance']),
  ('psycore', 'Blind-Ox', array['Blind-Ox'], 'Harmony Of Dissonance', 'Voodoo Hoodoo Records', 240, '240 BPM', '2021-12-18', 424, null, null, 'VOODOO-CORE (vol 2)', 'voodoo_hoodoo_bandcamp_voodoo_core_vol2_2021', 'https://voodoo-hoodoo.bandcamp.com/album/voodoo-core-vol-2', 'https://voodoo-hoodoo.bandcamp.com/track/harmony-of-dissonance-240-2', '4204723413', array['psycore', 'darkpsy', 'experimental-psytrance', 'forest-psytrance', 'hitech-psytrance']),
  ('psycore', 'Kozmofreak', array['Kozmofreak'], 'Legion Of Ragnar', 'Voodoo Hoodoo Records', 250, '250 BPM', '2021-12-18', 396, null, null, 'VOODOO-CORE (vol 2)', 'voodoo_hoodoo_bandcamp_voodoo_core_vol2_2021', 'https://voodoo-hoodoo.bandcamp.com/album/voodoo-core-vol-2', 'https://voodoo-hoodoo.bandcamp.com/track/legion-of-ragnar-250', '2428358205', array['psycore', 'darkpsy', 'experimental-psytrance', 'forest-psytrance', 'hitech-psytrance']),
  ('psycore', 'Vuga', array['Vuga'], 'Noli Numeris', 'Voodoo Hoodoo Records', 273, '273 BPM', '2021-12-18', 380, null, null, 'VOODOO-CORE (vol 2)', 'voodoo_hoodoo_bandcamp_voodoo_core_vol2_2021', 'https://voodoo-hoodoo.bandcamp.com/album/voodoo-core-vol-2', 'https://voodoo-hoodoo.bandcamp.com/track/noli-numeris-273', '932853074', array['psycore', 'darkpsy', 'experimental-psytrance', 'forest-psytrance', 'hitech-psytrance']),
  ('psycore', 'Nala', array['Nala'], 'Nolloodoo', 'Voodoo Hoodoo Records', 290, '280-300 BPM', '2021-12-18', 304, null, null, 'VOODOO-CORE (vol 2)', 'voodoo_hoodoo_bandcamp_voodoo_core_vol2_2021', 'https://voodoo-hoodoo.bandcamp.com/album/voodoo-core-vol-2', 'https://voodoo-hoodoo.bandcamp.com/track/nolloodoo-280-300', '400041976', array['psycore', 'darkpsy', 'experimental-psytrance', 'forest-psytrance', 'hitech-psytrance']),
  ('psycore', 'ZER vs Sadhu', array['ZER', 'Sadhu'], 'Desertechs', 'Voodoo Hoodoo Records', 193, '193 BPM', '2022-12-10', 480, null, null, 'VITAL PROGNOSIS', 'voodoo_hoodoo_bandcamp_vital_prognosis_2022', 'https://voodoo-hoodoo.bandcamp.com/album/vital-prognosis', 'https://voodoo-hoodoo.bandcamp.com/track/desertechs-193', '2486717148', array['psycore', 'darkpsy', 'experimental-psytrance', 'forest-psytrance', 'hitech-psytrance']),
  ('psycore', 'Nibiru', array['Nibiru'], 'Complex Reaction', 'Voodoo Hoodoo Records', 194, '194 BPM', '2022-12-10', 345, null, null, 'VITAL PROGNOSIS', 'voodoo_hoodoo_bandcamp_vital_prognosis_2022', 'https://voodoo-hoodoo.bandcamp.com/album/vital-prognosis', 'https://voodoo-hoodoo.bandcamp.com/track/complex-reaction-194', '2370214117', array['psycore', 'darkpsy', 'experimental-psytrance', 'forest-psytrance', 'hitech-psytrance']),
  ('psycore', 'Alpscore & INFRA', array['Alpscore', 'INFRA'], 'Contra Naturam', 'Voodoo Hoodoo Records', 210, '210 BPM', '2022-12-10', 342, null, null, 'VITAL PROGNOSIS', 'voodoo_hoodoo_bandcamp_vital_prognosis_2022', 'https://voodoo-hoodoo.bandcamp.com/album/vital-prognosis', 'https://voodoo-hoodoo.bandcamp.com/track/contra-naturam-210', '961878808', array['psycore', 'darkpsy', 'experimental-psytrance', 'forest-psytrance', 'hitech-psytrance']),
  ('psycore', 'Spakum Hupakum', array['Spakum Hupakum'], 'Cassino Narancsbor', 'Voodoo Hoodoo Records', 200, '200 BPM', '2022-12-10', 489, null, null, 'VITAL PROGNOSIS', 'voodoo_hoodoo_bandcamp_vital_prognosis_2022', 'https://voodoo-hoodoo.bandcamp.com/album/vital-prognosis', 'https://voodoo-hoodoo.bandcamp.com/track/cassino-narancsbor-200', '135823321', array['psycore', 'darkpsy', 'experimental-psytrance', 'forest-psytrance', 'hitech-psytrance']),
  ('psycore', 'Psykotrip', array['Psykotrip'], 'Parlatrochka Karkovana', 'Voodoo Hoodoo Records', 180, '180 BPM', '2022-12-10', 480, null, null, 'VITAL PROGNOSIS', 'voodoo_hoodoo_bandcamp_vital_prognosis_2022', 'https://voodoo-hoodoo.bandcamp.com/album/vital-prognosis', 'https://voodoo-hoodoo.bandcamp.com/track/parlatrochka-karkovana-180', '615149031', array['psycore', 'darkpsy', 'experimental-psytrance', 'forest-psytrance', 'hitech-psytrance']),
  ('psycore', 'Perpetuum', array['Perpetuum'], 'What The Fuck is This', 'Voodoo Hoodoo Records', 178, '178 BPM', '2022-12-10', 377, null, null, 'VITAL PROGNOSIS', 'voodoo_hoodoo_bandcamp_vital_prognosis_2022', 'https://voodoo-hoodoo.bandcamp.com/album/vital-prognosis', 'https://voodoo-hoodoo.bandcamp.com/track/what-the-fuck-is-this-178', '2493770285', array['psycore', 'darkpsy', 'experimental-psytrance', 'forest-psytrance', 'hitech-psytrance']),
  ('psycore', 'Varazsomborius', array['Varazsomborius'], 'Uprising', 'Voodoo Hoodoo Records', 188, '188 BPM', '2022-12-10', 727, null, null, 'VITAL PROGNOSIS', 'voodoo_hoodoo_bandcamp_vital_prognosis_2022', 'https://voodoo-hoodoo.bandcamp.com/album/vital-prognosis', 'https://voodoo-hoodoo.bandcamp.com/track/uprising-188', '3474863624', array['psycore', 'darkpsy', 'experimental-psytrance', 'forest-psytrance', 'hitech-psytrance']),
  ('psycore', 'Kinetik Flux', array['Kinetik Flux'], 'Last Sleep', 'Voodoo Hoodoo Records', 190, '190 BPM', '2022-12-10', 511, null, null, 'VITAL PROGNOSIS', 'voodoo_hoodoo_bandcamp_vital_prognosis_2022', 'https://voodoo-hoodoo.bandcamp.com/album/vital-prognosis', 'https://voodoo-hoodoo.bandcamp.com/track/last-sleep-190', '713337330', array['psycore', 'darkpsy', 'experimental-psytrance', 'forest-psytrance', 'hitech-psytrance']),
  ('psycore', 'Synthetic Forest', array['Synthetic Forest'], 'Feinmechanische Selektion', 'Voodoo Hoodoo Records', 182, '182 BPM', '2022-12-10', 365, null, null, 'VITAL PROGNOSIS', 'voodoo_hoodoo_bandcamp_vital_prognosis_2022', 'https://voodoo-hoodoo.bandcamp.com/album/vital-prognosis', 'https://voodoo-hoodoo.bandcamp.com/track/feinmechanische-selektion-182', '1706896725', array['psycore', 'darkpsy', 'experimental-psytrance', 'forest-psytrance', 'hitech-psytrance']),
  ('psycore', 'Sectio Aurea', array['Sectio Aurea'], 'Gato Murr', 'Naturaiz Records', 200, '200 BPM', '2023-01-18', 609, null, null, 'Naturaiz Records Vol.1', 'naturaiz_bandcamp_vol1_2023', 'https://naturaizrecords.bandcamp.com/album/natura-z-records-vol-1', 'https://naturaizrecords.bandcamp.com/track/sectio-aurea-gato-murr-200bpm', '3390849483', array['psycore', 'darkpsy', 'hitech', 'psytrance', 'experimental']),
  ('psycore', 'Arkhos', array['Arkhos'], 'Stranger World', 'Naturaiz Records', 190, '190 BPM', '2023-01-18', 358, null, null, 'Naturaiz Records Vol.1', 'naturaiz_bandcamp_vol1_2023', 'https://naturaizrecords.bandcamp.com/album/natura-z-records-vol-1', 'https://naturaizrecords.bandcamp.com/track/arkhos-stranger-world-190bpm', '1005210882', array['psycore', 'darkpsy', 'hitech', 'psytrance', 'experimental']),
  ('psycore', 'Alpscore & Crone', array['Alpscore', 'Crone'], 'Vitamin AlpsCrone', 'Naturaiz Records', 200, '200 BPM', '2023-01-18', 532, null, null, 'Naturaiz Records Vol.1', 'naturaiz_bandcamp_vol1_2023', 'https://naturaizrecords.bandcamp.com/album/natura-z-records-vol-1', 'https://naturaizrecords.bandcamp.com/track/alpscore-crone-vitamin-alpscrone-200bpm', '2359630510', array['psycore', 'darkpsy', 'hitech', 'psytrance', 'experimental']),
  ('psycore', 'Oblium', array['Oblium'], 'Be Happy', 'Naturaiz Records', 200, '200 BPM', '2023-01-18', 708, null, null, 'Naturaiz Records Vol.1', 'naturaiz_bandcamp_vol1_2023', 'https://naturaizrecords.bandcamp.com/album/natura-z-records-vol-1', 'https://naturaizrecords.bandcamp.com/track/oblium-be-happy-200bpm', '3186965052', array['psycore', 'darkpsy', 'hitech', 'psytrance', 'experimental']),
  ('psycore', 'Anikulapo', array['Anikulapo'], 'Alem do Que Seus Olhos Podem Ver', 'Naturaiz Records', 202, '202 BPM', '2023-01-18', 503, null, null, 'Naturaiz Records Vol.1', 'naturaiz_bandcamp_vol1_2023', 'https://naturaizrecords.bandcamp.com/album/natura-z-records-vol-1', 'https://naturaizrecords.bandcamp.com/track/anikulapo-al-m-do-que-seus-olhos-podem-ver-202bpm', '2798466625', array['psycore', 'darkpsy', 'hitech', 'psytrance', 'experimental']),
  ('psycore', 'Rasztec', array['Rasztec'], 'Constante', 'Naturaiz Records', 235, '235 BPM', '2023-01-18', 377, null, null, 'Naturaiz Records Vol.1', 'naturaiz_bandcamp_vol1_2023', 'https://naturaizrecords.bandcamp.com/album/natura-z-records-vol-1', 'https://naturaizrecords.bandcamp.com/track/rasztec-constante-235bpm', '3334721433', array['psycore', 'darkpsy', 'hitech', 'psytrance', 'experimental']),
  ('psycore', 'Der Sandmann', array['Der Sandmann'], 'Encefalopodo Al Ajillo', 'Naturaiz Records', 239, '239 BPM', '2023-01-18', 579, null, null, 'Naturaiz Records Vol.1', 'naturaiz_bandcamp_vol1_2023', 'https://naturaizrecords.bandcamp.com/album/natura-z-records-vol-1', 'https://naturaizrecords.bandcamp.com/track/der-sandmann-encefal-podo-al-ajillo-239bpm', '212091223', array['psycore', 'darkpsy', 'hitech', 'psytrance', 'experimental']),
  ('psycore', 'Neormm', array['Neormm'], 'A Floresta Tem Escalas', 'Naturaiz Records', 250, '250 BPM', '2023-01-18', 430, null, null, 'Naturaiz Records Vol.1', 'naturaiz_bandcamp_vol1_2023', 'https://naturaizrecords.bandcamp.com/album/natura-z-records-vol-1', 'https://naturaizrecords.bandcamp.com/track/neormm-a-floresta-tem-escalas-250bpm', '4165748246', array['psycore', 'darkpsy', 'hitech', 'psytrance', 'experimental']),
  ('psycore', 'Vutt''un', array['Vutt''un'], 'Confundentur', 'Naturaiz Records', 180, '180 BPM', '2024-09-06', 973, null, null, 'Vutt''un - Voluptas In Anima', 'naturaiz_bandcamp_vuttun_voluptas_2024', 'https://naturaizrecords.bandcamp.com/album/vuttun-voluptas-in-anima', 'https://naturaizrecords.bandcamp.com/track/vuttun-confundentur-180', '4238619365', array['psycore', 'darkpsy', 'hitech', 'psytrance', 'experimental']),
  ('psycore', 'Vutt''un', array['Vutt''un'], 'Fabula', 'Naturaiz Records', 198, '198 BPM', '2024-09-06', 800, null, null, 'Vutt''un - Voluptas In Anima', 'naturaiz_bandcamp_vuttun_voluptas_2024', 'https://naturaizrecords.bandcamp.com/album/vuttun-voluptas-in-anima', 'https://naturaizrecords.bandcamp.com/track/vuttun-f-bula-198', '1973699986', array['psycore', 'darkpsy', 'hitech', 'psytrance', 'experimental']),
  ('psycore', 'Vutt''un', array['Vutt''un'], 'In Anima', 'Naturaiz Records', 210, '210 BPM', '2024-09-06', 832, null, null, 'Vutt''un - Voluptas In Anima', 'naturaiz_bandcamp_vuttun_voluptas_2024', 'https://naturaizrecords.bandcamp.com/album/vuttun-voluptas-in-anima', 'https://naturaizrecords.bandcamp.com/track/vuttun-in-anima-210', '887950680', array['psycore', 'darkpsy', 'hitech', 'psytrance', 'experimental']);

with artist_rows as (
  select
    t.style,
    expanded_artist.artist_name as artist,
    max(t.country) as country,
    max(t.city) as city,
    string_agg(distinct t.source_album, ', ' order by t.source_album) as albums,
    min(t.source) as source,
    min(t.source_url) as source_url,
    jsonb_agg(distinct t.source_album) as source_albums,
    jsonb_agg(distinct t.source) as source_keys
  from psycore_enrichment_v2_tracks t
  cross join lateral unnest(t.artist_names) as expanded_artist(artist_name)
  group by t.style, expanded_artist.artist_name
)
insert into public.catalog_artists as catalog_artists (
  style,
  artist,
  country,
  city,
  artist_bio,
  artist_genre,
  artist_profile_hint,
  source,
  source_url,
  status,
  metadata
)
select
  style,
  artist,
  country,
  city,
  artist || ' entra no pacote psycore V2 a partir de fontes Bandcamp com tag, descricao ou tracklist ligada a psycore.',
  'psycore',
  'Reforco psycore V2 com faixa rastreavel e BPM alto; bom para aumentar diversidade sem depender de busca generica.',
  source,
  source_url,
  'published',
  jsonb_build_object(
    'confidence', 'high',
    'batch', 'psycore_enrichment_v2_20260620',
    'source_albums', source_albums,
    'source_keys', source_keys,
    'albums_text', albums
  )
from artist_rows
on conflict (style, artist_key) do update set
  artist_bio = excluded.artist_bio,
  artist_genre = excluded.artist_genre,
  artist_profile_hint = excluded.artist_profile_hint,
  source = excluded.source,
  source_url = excluded.source_url,
  status = excluded.status,
  metadata = coalesce(catalog_artists.metadata, '{}'::jsonb) || excluded.metadata,
  updated_at = now();

insert into public.catalog_tracks as catalog_tracks (
  style,
  artist,
  song,
  label,
  bpm_exact,
  preview_url,
  release_date,
  duration_sec,
  country,
  city,
  artist_bio,
  artist_genre,
  artist_profile_hint,
  source,
  source_url,
  status,
  metadata
)
select
  style,
  artist,
  song,
  label,
  bpm_exact,
  null,
  release_date,
  duration_sec,
  country,
  city,
  'Faixa incluida no pacote psycore V2 a partir de ' || source_album || '.',
  'psycore',
  'Faixa com BPM declarado e fonte Bandcamp rastreavel; amplia o recorte extremo do catalogo.',
  source,
  bandcamp_track_url,
  'published',
  jsonb_build_object(
    'confidence', 'high',
    'batch', 'psycore_enrichment_v2_20260620',
    'bpm_text', bpm_text,
    'source_album', source_album,
    'source_album_url', source_url,
    'bandcamp_track_url', bandcamp_track_url,
    'bandcamp_track_id', bandcamp_track_id,
    'source_tags', source_tags
  )
from psycore_enrichment_v2_tracks
on conflict (style, track_key) do update set
  label = excluded.label,
  bpm_exact = excluded.bpm_exact,
  preview_url = excluded.preview_url,
  release_date = excluded.release_date,
  duration_sec = excluded.duration_sec,
  artist_bio = excluded.artist_bio,
  artist_genre = excluded.artist_genre,
  artist_profile_hint = excluded.artist_profile_hint,
  source = excluded.source,
  source_url = excluded.source_url,
  status = excluded.status,
  metadata = coalesce(catalog_tracks.metadata, '{}'::jsonb) || excluded.metadata,
  updated_at = now();
