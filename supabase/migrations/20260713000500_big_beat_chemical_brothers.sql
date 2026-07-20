-- Adds Big Beat to the selectable electronic taxonomy and locks The Chemical
-- Brothers to compatible styles. MusicBrainz provides artist identity and
-- genre evidence; Apple Search provides exact recording and playback metadata.

create table if not exists public.electronic_artist_style_locks (
  artist_key text primary key,
  canonical_name text not null,
  primary_genre text not null references public.electronic_genres(slug) on delete restrict,
  allowed_genres text[] not null,
  reason text not null,
  source text not null,
  source_url text,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  check (char_length(trim(artist_key)) > 0),
  check (coalesce(array_length(allowed_genres, 1), 0) > 0),
  check (primary_genre = any(allowed_genres))
);

insert into public.electronic_genres (
  slug, display_name, parent_slug, is_electronic, status, metadata
)
values (
  'big_beat',
  'Big Beat',
  'breakbeat',
  true,
  'active',
  jsonb_build_object(
    'family', 'bass_music',
    'bpm_min', 100,
    'bpm_max', 140,
    'description', 'Breakbeats pesados, samples de rock/funk, linhas acidas e energia de rave.'
  )
)
on conflict (slug) do update
  set display_name = excluded.display_name,
      parent_slug = excluded.parent_slug,
      is_electronic = true,
      status = 'active',
      metadata = public.electronic_genres.metadata || excluded.metadata;

insert into public.electronic_artist_style_locks (
  artist_key, canonical_name, primary_genre, allowed_genres, reason, source, source_url, metadata
)
values
  (
    'the_chemical_brothers',
    'The Chemical Brothers',
    'big_beat',
    array['big_beat', 'breakbeat']::text[],
    'Primary identity is Big Beat; Breakbeat is the compatible parent style.',
    'musicbrainz_artist_tags',
    'https://musicbrainz.org/artist/1946a82a-f927-40c2-8235-38d64f50d043',
    jsonb_build_object('musicbrainz_artist_id', '1946a82a-f927-40c2-8235-38d64f50d043')
  ),
  (
    'chemical_brothers',
    'The Chemical Brothers',
    'big_beat',
    array['big_beat', 'breakbeat']::text[],
    'Provider alias of The Chemical Brothers; keep the same locked classification.',
    'editorial_alias_lock',
    'https://musicbrainz.org/artist/1946a82a-f927-40c2-8235-38d64f50d043',
    jsonb_build_object('canonical_artist_key', 'the_chemical_brothers')
  )
on conflict (artist_key) do update
  set canonical_name = excluded.canonical_name,
      primary_genre = excluded.primary_genre,
      allowed_genres = excluded.allowed_genres,
      reason = excluded.reason,
      source = excluded.source,
      source_url = excluded.source_url,
      metadata = public.electronic_artist_style_locks.metadata || excluded.metadata,
      updated_at = now();

create or replace function public.enforce_catalog_artist_style_lock()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  v_lock public.electronic_artist_style_locks%rowtype;
begin
  select * into v_lock
  from public.electronic_artist_style_locks
  where artist_key = public.catalog_key(new.artist);

  if found and not (new.style = any(v_lock.allowed_genres)) then
    raise exception using
      errcode = '23514',
      message = format(
        'Artist style lock rejected %s as %s; allowed styles: %s',
        new.artist,
        new.style,
        array_to_string(v_lock.allowed_genres, ', ')
      ),
      hint = format('Use the primary genre %s.', v_lock.primary_genre);
  end if;
  return new;
end;
$$;

-- Remove incompatible legacy rows before enabling the lock. Compatible
-- Breakbeat rows, if any, are retained as parent-style evidence.
delete from public.catalog_tracks
where public.catalog_key(artist) in ('the_chemical_brothers', 'chemical_brothers')
  and style not in ('big_beat', 'breakbeat');

delete from public.catalog_artists
where public.catalog_key(artist) in ('the_chemical_brothers', 'chemical_brothers')
  and style not in ('big_beat', 'breakbeat');

update public.electronic_artist_genres ag
set assertion_status = 'rejected',
    metadata = ag.metadata || jsonb_build_object('rejected_by', 'artist_style_lock_20260713'),
    updated_at = now()
from public.electronic_artists a
where ag.artist_id = a.id
  and a.canonical_key = 'the_chemical_brothers'
  and ag.genre_slug not in ('big_beat', 'breakbeat');

update public.electronic_recording_genres rg
set assertion_status = 'rejected',
    metadata = rg.metadata || jsonb_build_object('rejected_by', 'artist_style_lock_20260713'),
    updated_at = now()
from public.electronic_recordings r
join public.electronic_artists a on a.id = r.primary_artist_id
where rg.recording_id = r.id
  and a.canonical_key = 'the_chemical_brothers'
  and rg.genre_slug not in ('big_beat', 'breakbeat');

drop trigger if exists enforce_catalog_artist_style_lock on public.catalog_artists;
create trigger enforce_catalog_artist_style_lock
  before insert or update of artist, style on public.catalog_artists
  for each row execute function public.enforce_catalog_artist_style_lock();

drop trigger if exists enforce_catalog_track_style_lock on public.catalog_tracks;
create trigger enforce_catalog_track_style_lock
  before insert or update of artist, style on public.catalog_tracks
  for each row execute function public.enforce_catalog_artist_style_lock();

insert into public.catalog_artists (
  style, artist, country, city, artist_bio, artist_genre,
  artist_profile_hint, source, source_url, status, metadata
)
values (
  'big_beat',
  'The Chemical Brothers',
  'United Kingdom',
  'Manchester',
  'British electronic duo whose primary catalog identity is Big Beat, with Breakbeat and Electronica crossover.',
  'Big Beat / Breakbeat / Electronic',
  'Locked primary style: Big Beat. Provider results may not reclassify the artist outside Big Beat or Breakbeat.',
  'musicbrainz_itunes_big_beat_v1',
  'https://musicbrainz.org/artist/1946a82a-f927-40c2-8235-38d64f50d043',
  'published',
  jsonb_build_object(
    'electronic_gate', 'passed',
    'electronic_gate_reason', 'musicbrainz_big_beat_tag_and_verified_recordings',
    'confidence', 'very_high',
    'artist_type', 'Group',
    'musicbrainz_artist_id', '1946a82a-f927-40c2-8235-38d64f50d043',
    'musicbrainz_artist_url', 'https://musicbrainz.org/artist/1946a82a-f927-40c2-8235-38d64f50d043',
    'apple_music_artist_id', '3726283',
    'apple_music_artist_url', 'https://music.apple.com/us/artist/the-chemical-brothers/3726283?uo=4',
    'source_tags', jsonb_build_array('electronic', 'big beat', 'breakbeat'),
    'primary_style', 'big_beat',
    'allowed_styles', jsonb_build_array('big_beat', 'breakbeat')
  )
)
on conflict (style, artist_key) do update
  set country = excluded.country,
      city = excluded.city,
      artist_bio = excluded.artist_bio,
      artist_genre = excluded.artist_genre,
      artist_profile_hint = excluded.artist_profile_hint,
      source = excluded.source,
      source_url = excluded.source_url,
      status = excluded.status,
      metadata = public.catalog_artists.metadata || excluded.metadata,
      updated_at = now();

insert into public.catalog_tracks (
  style, artist, song, label, bpm_exact, preview_url,
  release_date, duration_sec, country, city, artist_bio, artist_genre,
  artist_profile_hint, source, source_url, status, metadata
)
values
  (
    'big_beat', 'The Chemical Brothers', 'Block Rockin'' Beats', null, null,
    'https://audio-ssl.itunes.apple.com/itunes-assets/AudioPreview115/v4/8b/d4/61/8bd46156-08d5-adb0-370d-6408cbaee1de/mzaf_15531948554362197854.plus.aac.p.m4a',
    '1997-04-07', 314, 'United Kingdom', 'Manchester',
    'British electronic duo whose primary catalog identity is Big Beat.', 'Big Beat / Breakbeat / Electronic', 'Canonical Big Beat anchor.',
    'musicbrainz_itunes_big_beat_v1', 'https://music.apple.com/us/album/block-rockin-beats/714366008?i=714366406&uo=4', 'published',
    jsonb_build_object('electronic_gate','passed','confidence','very_high','source_type','curated_electronic_subgenre_anchor','album','Dig Your Own Hole','release_title','Dig Your Own Hole','itunes_track_id','714366406','apple_music_track_url','https://music.apple.com/us/album/block-rockin-beats/714366008?i=714366406&uo=4','musicbrainz_artist_id','1946a82a-f927-40c2-8235-38d64f50d043','source_tags',jsonb_build_array('big beat','breakbeat','electronic'))
  ),
  (
    'big_beat', 'The Chemical Brothers', 'Galvanize', null, null,
    'https://audio-ssl.itunes.apple.com/itunes-assets/AudioPreview115/v4/ad/bb/2d/adbb2dd5-7bb1-7d8e-2888-a6a4dd69df6c/mzaf_13719235247685376410.plus.aac.p.m4a',
    '2004-11-22', 269, 'United Kingdom', 'Manchester',
    'British electronic duo whose primary catalog identity is Big Beat.', 'Big Beat / Breakbeat / Electronic', 'Canonical Big Beat anchor.',
    'musicbrainz_itunes_big_beat_v1', 'https://music.apple.com/us/album/galvanize/721250234?i=721250697&uo=4', 'published',
    jsonb_build_object('electronic_gate','passed','confidence','very_high','source_type','curated_electronic_subgenre_anchor','album','Brotherhood (Deluxe Version)','release_title','Brotherhood (Deluxe Version)','itunes_track_id','721250697','apple_music_track_url','https://music.apple.com/us/album/galvanize/721250234?i=721250697&uo=4','musicbrainz_artist_id','1946a82a-f927-40c2-8235-38d64f50d043','source_tags',jsonb_build_array('big beat','breakbeat','electronic'))
  ),
  (
    'big_beat', 'The Chemical Brothers', 'Hey Boy Hey Girl', null, null,
    'https://audio-ssl.itunes.apple.com/itunes-assets/AudioPreview125/v4/6c/3f/69/6c3f691b-b341-6c02-7c48-c8e7adb094c4/mzaf_7667070743965729140.plus.aac.p.m4a',
    '1999-06-21', 290, 'United Kingdom', 'Manchester',
    'British electronic duo whose primary catalog identity is Big Beat.', 'Big Beat / Breakbeat / Electronic', 'Canonical Big Beat anchor.',
    'musicbrainz_itunes_big_beat_v1', 'https://music.apple.com/us/album/hey-boy-hey-girl/714172597?i=714174441&uo=4', 'published',
    jsonb_build_object('electronic_gate','passed','confidence','very_high','source_type','curated_electronic_subgenre_anchor','album','Surrender','release_title','Surrender','itunes_track_id','714174441','apple_music_track_url','https://music.apple.com/us/album/hey-boy-hey-girl/714172597?i=714174441&uo=4','musicbrainz_artist_id','1946a82a-f927-40c2-8235-38d64f50d043','source_tags',jsonb_build_array('big beat','breakbeat','electronic'))
  ),
  (
    'big_beat', 'The Chemical Brothers', 'Setting Sun', null, null,
    'https://audio-ssl.itunes.apple.com/itunes-assets/AudioPreview115/v4/d6/22/5f/d6225f43-c325-d316-0cef-0ea595c183e4/mzaf_1355570659969552362.plus.aac.p.m4a',
    '1996-09-30', 329, 'United Kingdom', 'Manchester',
    'British electronic duo whose primary catalog identity is Big Beat.', 'Big Beat / Breakbeat / Electronic', 'Canonical Big Beat anchor.',
    'musicbrainz_itunes_big_beat_v1', 'https://music.apple.com/us/album/setting-sun/714366008?i=714366703&uo=4', 'published',
    jsonb_build_object('electronic_gate','passed','confidence','very_high','source_type','curated_electronic_subgenre_anchor','album','Dig Your Own Hole','release_title','Dig Your Own Hole','itunes_track_id','714366703','apple_music_track_url','https://music.apple.com/us/album/setting-sun/714366008?i=714366703&uo=4','musicbrainz_artist_id','1946a82a-f927-40c2-8235-38d64f50d043','source_tags',jsonb_build_array('big beat','breakbeat','electronic'))
  ),
  (
    'big_beat', 'The Chemical Brothers', 'Star Guitar', null, null,
    'https://audio-ssl.itunes.apple.com/itunes-assets/AudioPreview115/v4/a6/be/39/a6be395d-c074-bbb7-1787-dd4b742c6d96/mzaf_13818212132644945945.plus.aac.p.m4a',
    '2002-01-01', 387, 'United Kingdom', 'Manchester',
    'British electronic duo whose primary catalog identity is Big Beat.', 'Big Beat / Breakbeat / Electronic', 'Canonical Big Beat anchor.',
    'musicbrainz_itunes_big_beat_v1', 'https://music.apple.com/us/album/star-guitar/721206816?i=721206868&uo=4', 'published',
    jsonb_build_object('electronic_gate','passed','confidence','very_high','source_type','curated_electronic_subgenre_anchor','album','Come With Us','release_title','Come With Us','itunes_track_id','721206868','apple_music_track_url','https://music.apple.com/us/album/star-guitar/721206816?i=721206868&uo=4','musicbrainz_artist_id','1946a82a-f927-40c2-8235-38d64f50d043','source_tags',jsonb_build_array('big beat','breakbeat','electronic'))
  ),
  (
    'big_beat', 'The Chemical Brothers', 'Go (feat. Q-Tip)', null, null,
    'https://audio-ssl.itunes.apple.com/itunes-assets/AudioPreview126/v4/6b/d6/70/6bd670ec-2989-780d-5547-c14c018a8dc6/mzaf_4784615660835955135.plus.aac.p.m4a',
    '2015-05-04', 261, 'United Kingdom', 'Manchester',
    'British electronic duo whose primary catalog identity is Big Beat.', 'Big Beat / Breakbeat / Electronic', 'Canonical Big Beat anchor.',
    'musicbrainz_itunes_big_beat_v1', 'https://music.apple.com/us/album/go-feat-q-tip/1472658344?i=1472658547&uo=4', 'published',
    jsonb_build_object('electronic_gate','passed','confidence','very_high','source_type','curated_electronic_subgenre_anchor','album','Go (feat. Q-Tip)','release_title','Go (feat. Q-Tip)','itunes_track_id','1472658547','apple_music_track_url','https://music.apple.com/us/album/go-feat-q-tip/1472658344?i=1472658547&uo=4','musicbrainz_artist_id','1946a82a-f927-40c2-8235-38d64f50d043','source_tags',jsonb_build_array('big beat','breakbeat','electronic'))
  )
on conflict (style, track_key) do update
  set artist = excluded.artist,
      song = excluded.song,
      label = excluded.label,
      bpm_exact = excluded.bpm_exact,
      preview_url = excluded.preview_url,
      release_date = excluded.release_date,
      duration_sec = excluded.duration_sec,
      country = excluded.country,
      city = excluded.city,
      artist_bio = excluded.artist_bio,
      artist_genre = excluded.artist_genre,
      artist_profile_hint = excluded.artist_profile_hint,
      source = excluded.source,
      source_url = excluded.source_url,
      status = excluded.status,
      metadata = public.catalog_tracks.metadata || excluded.metadata,
      updated_at = now();

insert into public.electronic_artist_external_ids (
  artist_id, provider, external_id, external_url, source, metadata
)
select
  a.id,
  'apple_music',
  '3726283',
  'https://music.apple.com/us/artist/the-chemical-brothers/3726283?uo=4',
  'musicbrainz_itunes_big_beat_v1',
  jsonb_build_object('verified_at', now())
from public.electronic_artists a
where a.canonical_key = 'the_chemical_brothers'
on conflict (artist_id, provider) do update
  set external_id = excluded.external_id,
      external_url = excluded.external_url,
      source = excluded.source,
      metadata = public.electronic_artist_external_ids.metadata || excluded.metadata,
      updated_at = now();

insert into public.electronic_recording_external_ids (
  recording_id, provider, external_id, external_url, source, metadata
)
select
  r.id,
  'apple_music',
  t.metadata->>'itunes_track_id',
  t.metadata->>'apple_music_track_url',
  'musicbrainz_itunes_big_beat_v1',
  jsonb_build_object('verified_at', now())
from public.catalog_tracks t
join public.electronic_recordings r
  on r.identity_key = public.catalog_key(t.artist || '__' || t.song)
where t.style = 'big_beat'
  and t.artist_key = 'the_chemical_brothers'
  and nullif(t.metadata->>'itunes_track_id', '') is not null
on conflict (recording_id, provider) do update
  set external_id = excluded.external_id,
      external_url = excluded.external_url,
      source = excluded.source,
      metadata = public.electronic_recording_external_ids.metadata || excluded.metadata,
      updated_at = now();

alter table public.electronic_artist_style_locks enable row level security;
grant select, insert, update, delete on public.electronic_artist_style_locks to service_role;
grant execute on function public.enforce_catalog_artist_style_lock() to service_role;
