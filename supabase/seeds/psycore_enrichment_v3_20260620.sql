-- Sonic Search - Psycore enrichment V3
-- Generated 2026-06-20.
-- Main source: Kamino Records Bandcamp pages with trackinfo and JSON-LD.
-- Secondary source: local verified psycore V4 rows reinforced by Deezer exact track matches.
-- Run in Supabase SQL Editor only after review.

create temporary table if not exists psycore_enrichment_v3_tracks (
  style text not null,
  artist text not null,
  song text not null,
  label text not null,
  bpm_exact numeric,
  bpm_text text,
  release_date date,
  duration_sec integer,
  country text,
  city text,
  source_album text not null,
  source_url text not null,
  track_url text not null,
  external_track_id text not null,
  source_type text not null,
  source_tags text[] not null,
  artist_bio text not null,
  artist_profile_hint text not null,
  status text not null,
  confidence text not null,
  source_note text not null
) on commit drop;

truncate table psycore_enrichment_v3_tracks;

insert into psycore_enrichment_v3_tracks (
  style,
  artist,
  song,
  label,
  bpm_exact,
  bpm_text,
  release_date,
  duration_sec,
  country,
  city,
  source_album,
  source_url,
  track_url,
  external_track_id,
  source_type,
  source_tags,
  artist_bio,
  artist_profile_hint,
  status,
  confidence,
  source_note
) values
  ('psycore', 'Kashyyyk', 'The Field', 'Kamino Records', 200, 'album description states 200 BPM', '2020-04-19', 466, 'Mexico', 'Mexico City', 'Desert Of The Real', 'https://kamino-records.bandcamp.com/album/desert-of-the-real', 'https://kamino-records.bandcamp.com/track/kashyyyk-the-field', 'bc:1446742029', 'bandcamp_jsonld', array['dark', 'kamino', 'psychedelic', 'psytrance', '200bpm_album_description'], 'Mexican dark psychedelic producer with fast heavy forest infused psycore pressure', 'Kamino 200 BPM album anchor for dark high speed psycore discovery', 'published', 'high', 'Bandcamp JSON-LD and trackinfo expose album date tags track ids and duration.'),
  ('psycore', 'Kashyyyk', 'Sri Lanka', 'Kamino Records', 200, 'album description states 200 BPM', '2020-04-19', 415, 'Mexico', 'Mexico City', 'Desert Of The Real', 'https://kamino-records.bandcamp.com/album/desert-of-the-real', 'https://kamino-records.bandcamp.com/track/kashyyyk-sri-lanka', 'bc:2475209765', 'bandcamp_jsonld', array['dark', 'kamino', 'psychedelic', 'psytrance', '200bpm_album_description'], 'Mexican dark psychedelic producer with fast heavy forest infused psycore pressure', 'Kamino 200 BPM album anchor for dark high speed psycore discovery', 'published', 'high', 'Bandcamp JSON-LD and trackinfo expose album date tags track ids and duration.'),
  ('psycore', 'Kashyyyk', 'Strange Times', 'Kamino Records', 200, 'album description states 200 BPM', '2020-04-19', 442, 'Mexico', 'Mexico City', 'Desert Of The Real', 'https://kamino-records.bandcamp.com/album/desert-of-the-real', 'https://kamino-records.bandcamp.com/track/kashyyyk-strange-times', 'bc:3857419228', 'bandcamp_jsonld', array['dark', 'kamino', 'psychedelic', 'psytrance', '200bpm_album_description'], 'Mexican dark psychedelic producer with fast heavy forest infused psycore pressure', 'Kamino 200 BPM album anchor for dark high speed psycore discovery', 'published', 'high', 'Bandcamp JSON-LD and trackinfo expose album date tags track ids and duration.'),
  ('psycore', 'Kashyyyk', 'Winter', 'Kamino Records', 200, 'album description states 200 BPM', '2020-04-19', 353, 'Mexico', 'Mexico City', 'Desert Of The Real', 'https://kamino-records.bandcamp.com/album/desert-of-the-real', 'https://kamino-records.bandcamp.com/track/kashyyyk-winter', 'bc:1532548014', 'bandcamp_jsonld', array['dark', 'kamino', 'psychedelic', 'psytrance', '200bpm_album_description'], 'Mexican dark psychedelic producer with fast heavy forest infused psycore pressure', 'Kamino 200 BPM album anchor for dark high speed psycore discovery', 'published', 'high', 'Bandcamp JSON-LD and trackinfo expose album date tags track ids and duration.'),
  ('psycore', 'Kashyyyk', 'Dark Crystal', 'Kamino Records', 200, 'album description states 200 BPM', '2020-04-19', 422, 'Mexico', 'Mexico City', 'Desert Of The Real', 'https://kamino-records.bandcamp.com/album/desert-of-the-real', 'https://kamino-records.bandcamp.com/track/kashyyyk-dark-crystal', 'bc:1193203353', 'bandcamp_jsonld', array['dark', 'kamino', 'psychedelic', 'psytrance', '200bpm_album_description'], 'Mexican dark psychedelic producer with fast heavy forest infused psycore pressure', 'Kamino 200 BPM album anchor for dark high speed psycore discovery', 'published', 'high', 'Bandcamp JSON-LD and trackinfo expose album date tags track ids and duration.'),
  ('psycore', 'Kashyyyk', 'Shattered', 'Kamino Records', 200, 'album description states 200 BPM', '2020-04-19', 437, 'Mexico', 'Mexico City', 'Desert Of The Real', 'https://kamino-records.bandcamp.com/album/desert-of-the-real', 'https://kamino-records.bandcamp.com/track/kashyyyk-shattered', 'bc:2115533421', 'bandcamp_jsonld', array['dark', 'kamino', 'psychedelic', 'psytrance', '200bpm_album_description'], 'Mexican dark psychedelic producer with fast heavy forest infused psycore pressure', 'Kamino 200 BPM album anchor for dark high speed psycore discovery', 'published', 'high', 'Bandcamp JSON-LD and trackinfo expose album date tags track ids and duration.'),
  ('psycore', 'Kashyyyk', 'Ishq', 'Kamino Records', 200, 'album description states 200 BPM', '2020-04-19', 518, 'Mexico', 'Mexico City', 'Desert Of The Real', 'https://kamino-records.bandcamp.com/album/desert-of-the-real', 'https://kamino-records.bandcamp.com/track/kashyyyk-ishq', 'bc:3077383990', 'bandcamp_jsonld', array['dark', 'kamino', 'psychedelic', 'psytrance', '200bpm_album_description'], 'Mexican dark psychedelic producer with fast heavy forest infused psycore pressure', 'Kamino 200 BPM album anchor for dark high speed psycore discovery', 'published', 'high', 'Bandcamp JSON-LD and trackinfo expose album date tags track ids and duration.'),
  ('psycore', 'Kashyyyk', 'Pacific', 'Kamino Records', 200, 'album description states 200 BPM', '2020-04-19', 409, 'Mexico', 'Mexico City', 'Desert Of The Real', 'https://kamino-records.bandcamp.com/album/desert-of-the-real', 'https://kamino-records.bandcamp.com/track/kashyyyk-pacific', 'bc:899968331', 'bandcamp_jsonld', array['dark', 'kamino', 'psychedelic', 'psytrance', '200bpm_album_description'], 'Mexican dark psychedelic producer with fast heavy forest infused psycore pressure', 'Kamino 200 BPM album anchor for dark high speed psycore discovery', 'published', 'high', 'Bandcamp JSON-LD and trackinfo expose album date tags track ids and duration.'),
  ('psycore', 'Kashyyyk', 'Asia', 'Kamino Records', 200, 'album description states 200 BPM', '2020-04-19', 512, 'Mexico', 'Mexico City', 'Desert Of The Real', 'https://kamino-records.bandcamp.com/album/desert-of-the-real', 'https://kamino-records.bandcamp.com/track/kashyyyk-asia', 'bc:2152638285', 'bandcamp_jsonld', array['dark', 'kamino', 'psychedelic', 'psytrance', '200bpm_album_description'], 'Mexican dark psychedelic producer with fast heavy forest infused psycore pressure', 'Kamino 200 BPM album anchor for dark high speed psycore discovery', 'published', 'high', 'Bandcamp JSON-LD and trackinfo expose album date tags track ids and duration.'),
  ('psycore', 'Kashyyyk', 'The Chestnut Tree', 'Kamino Records', 200, 'album description states 200 BPM', '2020-04-19', 470, 'Mexico', 'Mexico City', 'Desert Of The Real', 'https://kamino-records.bandcamp.com/album/desert-of-the-real', 'https://kamino-records.bandcamp.com/track/kashyyyk-the-chestnut-tree', 'bc:1449150093', 'bandcamp_jsonld', array['dark', 'kamino', 'psychedelic', 'psytrance', '200bpm_album_description'], 'Mexican dark psychedelic producer with fast heavy forest infused psycore pressure', 'Kamino 200 BPM album anchor for dark high speed psycore discovery', 'published', 'high', 'Bandcamp JSON-LD and trackinfo expose album date tags track ids and duration.'),
  ('psycore', 'Audiordinance', 'Kick Start', 'Kamino Records', 190, '190 BPM in title', '2025-11-29', 408, 'International', null, 'Cyber Slang', 'https://kamino-records.bandcamp.com/album/audiordinance-cyber-slang', 'https://kamino-records.bandcamp.com/track/audiordinance-kick-start-190-bpm', 'bc:421782120', 'bandcamp_jsonld', array['dark', 'kamino', 'psychedelic', 'psytrance', 'bpm_in_title'], 'Audiordinance is the Ketek and Psykoze collaboration focused on cybernetic high BPM psychedelic pressure', 'Explicit BPM Kamino EP for modern psycore and hi-tech recommendations', 'published', 'high', 'Bandcamp JSON-LD and trackinfo expose album date tags track ids duration and BPM appears in each title.'),
  ('psycore', 'Audiordinance', 'Becoming One', 'Kamino Records', 190, '190 BPM in title', '2025-11-29', 412, 'International', null, 'Cyber Slang', 'https://kamino-records.bandcamp.com/album/audiordinance-cyber-slang', 'https://kamino-records.bandcamp.com/track/audiordinance-becoming-one-190-bpm', 'bc:441886846', 'bandcamp_jsonld', array['dark', 'kamino', 'psychedelic', 'psytrance', 'bpm_in_title'], 'Audiordinance is the Ketek and Psykoze collaboration focused on cybernetic high BPM psychedelic pressure', 'Explicit BPM Kamino EP for modern psycore and hi-tech recommendations', 'published', 'high', 'Bandcamp JSON-LD and trackinfo expose album date tags track ids duration and BPM appears in each title.'),
  ('psycore', 'Audiordinance', 'Our Ends', 'Kamino Records', 196, '196 BPM in title', '2025-11-29', 344, 'International', null, 'Cyber Slang', 'https://kamino-records.bandcamp.com/album/audiordinance-cyber-slang', 'https://kamino-records.bandcamp.com/track/audiordinance-our-ends-196-bpm', 'bc:1107726675', 'bandcamp_jsonld', array['dark', 'kamino', 'psychedelic', 'psytrance', 'bpm_in_title'], 'Audiordinance is the Ketek and Psykoze collaboration focused on cybernetic high BPM psychedelic pressure', 'Explicit BPM Kamino EP for modern psycore and hi-tech recommendations', 'published', 'high', 'Bandcamp JSON-LD and trackinfo expose album date tags track ids duration and BPM appears in each title.'),
  ('psycore', 'Audiordinance', 'Cyberslang', 'Kamino Records', 197, '197 BPM in title', '2025-11-29', 390, 'International', null, 'Cyber Slang', 'https://kamino-records.bandcamp.com/album/audiordinance-cyber-slang', 'https://kamino-records.bandcamp.com/track/audiordinance-cyberslang-197-bpm', 'bc:2217722402', 'bandcamp_jsonld', array['dark', 'kamino', 'psychedelic', 'psytrance', 'bpm_in_title'], 'Audiordinance is the Ketek and Psykoze collaboration focused on cybernetic high BPM psychedelic pressure', 'Explicit BPM Kamino EP for modern psycore and hi-tech recommendations', 'published', 'high', 'Bandcamp JSON-LD and trackinfo expose album date tags track ids duration and BPM appears in each title.'),
  ('psycore', 'Audiordinance', 'Backbone', 'Kamino Records', 200, '200 BPM in title', '2025-11-29', 392, 'International', null, 'Cyber Slang', 'https://kamino-records.bandcamp.com/album/audiordinance-cyber-slang', 'https://kamino-records.bandcamp.com/track/audiordinance-backbone-200-bpm', 'bc:2850181973', 'bandcamp_jsonld', array['dark', 'kamino', 'psychedelic', 'psytrance', 'bpm_in_title'], 'Audiordinance is the Ketek and Psykoze collaboration focused on cybernetic high BPM psychedelic pressure', 'Explicit BPM Kamino EP for modern psycore and hi-tech recommendations', 'published', 'high', 'Bandcamp JSON-LD and trackinfo expose album date tags track ids duration and BPM appears in each title.'),
  ('psycore', 'Dark Whisper', 'Realms Of Unseen', 'Noize Conspiracy', 180, 'local verified BPM plus Deezer match', '2015-01-01', 471, 'Germany', 'Berlin', 'Realms of Unseen', 'https://www.deezer.com/track/130906358', 'https://www.deezer.com/track/130906358', 'dz:130906358', 'deezer_search_match', array['darkpsy', 'psycore', 'local_verified_v4', 'deezer_match'], 'German dark psychedelic project with high pressure nocturnal sound design', 'Classic darkpsy psycore bridge with Deezer track validation', 'published', 'high', 'Local verified v4 seed reinforced by exact Deezer track result.'),
  ('psycore', 'Necropsycho', 'Vanaprastam', 'Urban Antidote Records', 182, 'local verified BPM plus Deezer match', '2016-01-01', 341, 'Brazil', 'Sao Paulo', 'Gods Own Country', 'https://www.deezer.com/track/2938879451', 'https://www.deezer.com/track/2938879451', 'dz:2938879451', 'deezer_search_match', array['darkpsy', 'psycore', 'local_verified_v4', 'deezer_match'], 'Brazilian darkpsy and psycore project with dense low end pressure', 'Brazilian extreme psycore bridge with public Deezer validation', 'published', 'medium', 'Local seed label differs from Deezer album context so keep source note for review.'),
  ('psycore', 'Arjuna', 'Stand Alone', 'Parvati Records', 180, 'local verified BPM plus Deezer match', '2014-01-01', 483, 'Italy', null, 'Parvati Records Primal Contact', 'https://www.deezer.com/track/1343735652', 'https://www.deezer.com/track/1343735652', 'dz:1343735652', 'deezer_search_match', array['forest', 'darkpsy', 'psycore', 'local_verified_v4', 'deezer_match'], 'Italian forest and dark psychedelic artist linked to Parvati style pressure', 'Forest rooted psycore adjacent recommendation with public Deezer validation', 'published', 'high', 'Local verified v4 seed reinforced by exact Deezer track result.');

with artist_rows as (
  select
    style,
    artist,
    max(country) as country,
    max(city) as city,
    max(artist_bio) as artist_bio,
    max(artist_genre) as artist_genre,
    max(artist_profile_hint) as artist_profile_hint,
    min(source_url) as source_url,
    jsonb_agg(
      jsonb_build_object(
        'song', song,
        'source_album', source_album,
        'track_url', track_url,
        'external_track_id', external_track_id,
        'confidence', confidence
      )
      order by release_date, song
    ) as recommended_tracks,
    jsonb_agg(distinct source_album) as source_albums
  from (
    select
      *,
      'psycore / hi-tech psytrance' as artist_genre
    from psycore_enrichment_v3_tracks
  ) t
  group by style, artist
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
  artist_bio,
  artist_genre,
  artist_profile_hint,
  'psycore_enrichment_v3_20260620',
  source_url,
  'published',
  jsonb_build_object(
    'batch', 'psycore_enrichment_v3_20260620',
    'confidence', 'high',
    'source_albums', source_albums,
    'recommended_tracks', recommended_tracks
  )
from artist_rows
on conflict (style, artist_key) do update set
  country = coalesce(excluded.country, catalog_artists.country),
  city = coalesce(excluded.city, catalog_artists.city),
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
  artist_bio,
  'psycore / hi-tech psytrance',
  artist_profile_hint,
  'psycore_enrichment_v3_20260620',
  track_url,
  status,
  jsonb_build_object(
    'batch', 'psycore_enrichment_v3_20260620',
    'confidence', confidence,
    'bpm_text', bpm_text,
    'source_album', source_album,
    'source_album_url', source_url,
    'track_url', track_url,
    'external_track_id', external_track_id,
    'source_type', source_type,
    'source_tags', source_tags,
    'source_note', source_note
  )
from psycore_enrichment_v3_tracks
on conflict (style, track_key) do update set
  label = excluded.label,
  bpm_exact = excluded.bpm_exact,
  preview_url = excluded.preview_url,
  release_date = excluded.release_date,
  duration_sec = excluded.duration_sec,
  country = coalesce(excluded.country, catalog_tracks.country),
  city = coalesce(excluded.city, catalog_tracks.city),
  artist_bio = excluded.artist_bio,
  artist_genre = excluded.artist_genre,
  artist_profile_hint = excluded.artist_profile_hint,
  source = excluded.source,
  source_url = excluded.source_url,
  status = excluded.status,
  metadata = coalesce(catalog_tracks.metadata, '{}'::jsonb) || excluded.metadata,
  updated_at = now();
