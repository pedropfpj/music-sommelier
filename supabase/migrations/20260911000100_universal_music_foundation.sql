-- Sonic Search universal music foundation.
-- Adds a genre-agnostic catalog and a private Sonic DNA v2 while preserving
-- the verified electronic catalog as the first fully recommendable universe.

begin;

create extension if not exists pgcrypto;

create table if not exists public.music_universes (
  slug text primary key check (slug ~ '^[a-z0-9_]{2,60}$'),
  display_name text not null,
  display_names jsonb not null default '{}'::jsonb check (jsonb_typeof(display_names) = 'object'),
  description text not null default '',
  status text not null default 'active' check (status in ('active', 'hidden', 'deprecated')),
  sort_order integer not null default 0,
  metadata jsonb not null default '{}'::jsonb check (jsonb_typeof(metadata) = 'object'),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.music_genres (
  slug text primary key check (slug ~ '^[a-z0-9_]{2,100}$'),
  universe_slug text not null references public.music_universes(slug) on update cascade on delete restrict,
  parent_slug text references public.music_genres(slug) on update cascade on delete set null,
  display_name text not null,
  display_names jsonb not null default '{}'::jsonb check (jsonb_typeof(display_names) = 'object'),
  genre_kind text not null default 'genre' check (genre_kind in ('genre', 'subgenre', 'form', 'tradition')),
  status text not null default 'active' check (status in ('active', 'needs_review', 'deprecated', 'blocked')),
  metadata jsonb not null default '{}'::jsonb check (jsonb_typeof(metadata) = 'object'),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.music_genre_aliases (
  id uuid primary key default gen_random_uuid(),
  genre_slug text not null references public.music_genres(slug) on update cascade on delete cascade,
  alias text not null check (char_length(trim(alias)) > 0),
  alias_key text generated always as (public.catalog_key(alias)) stored,
  locale text,
  source text not null default 'sonic_taxonomy_v1',
  created_at timestamptz not null default now(),
  unique (genre_slug, alias_key)
);

create table if not exists public.music_artists (
  id uuid primary key default gen_random_uuid(),
  canonical_name text not null check (char_length(trim(canonical_name)) > 0),
  canonical_key text generated always as (public.catalog_key(canonical_name)) stored,
  sort_name text,
  artist_type text not null default 'person_or_group'
    check (artist_type in ('person', 'group', 'orchestra', 'choir', 'ensemble', 'character', 'person_or_group', 'other')),
  country text,
  city text,
  begin_date date,
  end_date date,
  disambiguation text,
  status text not null default 'candidate'
    check (status in ('candidate', 'verified', 'recommendable', 'needs_review', 'blocked')),
  verification_confidence numeric not null default 0.5
    check (verification_confidence >= 0 and verification_confidence <= 1),
  metadata jsonb not null default '{}'::jsonb check (jsonb_typeof(metadata) = 'object'),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (canonical_key)
);

create table if not exists public.music_artist_aliases (
  id uuid primary key default gen_random_uuid(),
  artist_id uuid not null references public.music_artists(id) on delete cascade,
  alias text not null check (char_length(trim(alias)) > 0),
  alias_key text generated always as (public.catalog_key(alias)) stored,
  locale text,
  alias_type text not null default 'search',
  is_primary boolean not null default false,
  source text,
  created_at timestamptz not null default now(),
  unique (artist_id, alias_key)
);

create table if not exists public.music_artist_external_ids (
  id uuid primary key default gen_random_uuid(),
  artist_id uuid not null references public.music_artists(id) on delete cascade,
  provider text not null check (char_length(trim(provider)) > 0),
  external_id text not null check (char_length(trim(external_id)) > 0),
  external_url text,
  source text,
  metadata jsonb not null default '{}'::jsonb check (jsonb_typeof(metadata) = 'object'),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (artist_id, provider),
  unique (provider, external_id)
);

create table if not exists public.music_works (
  id uuid primary key default gen_random_uuid(),
  title text not null check (char_length(trim(title)) > 0),
  identity_key text not null unique,
  composer_artist_id uuid references public.music_artists(id) on delete set null,
  work_type text,
  catalog_number text,
  composition_start_year integer check (composition_start_year is null or composition_start_year between 1 and 3000),
  composition_end_year integer check (composition_end_year is null or composition_end_year between 1 and 3000),
  metadata jsonb not null default '{}'::jsonb check (jsonb_typeof(metadata) = 'object'),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.music_recordings (
  id uuid primary key default gen_random_uuid(),
  title text not null check (char_length(trim(title)) > 0),
  identity_key text not null unique,
  work_id uuid references public.music_works(id) on delete set null,
  isrc text,
  release_title text,
  label text,
  release_date date,
  duration_sec integer check (duration_sec is null or duration_sec >= 0),
  explicit boolean not null default false,
  status text not null default 'candidate'
    check (status in ('candidate', 'verified', 'recommendable', 'needs_review', 'blocked')),
  verification_confidence numeric not null default 0.5
    check (verification_confidence >= 0 and verification_confidence <= 1),
  audio_descriptors jsonb not null default '{}'::jsonb check (jsonb_typeof(audio_descriptors) = 'object'),
  metadata jsonb not null default '{}'::jsonb check (jsonb_typeof(metadata) = 'object'),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.music_recording_artists (
  recording_id uuid not null references public.music_recordings(id) on delete cascade,
  artist_id uuid not null references public.music_artists(id) on delete cascade,
  role text not null default 'primary'
    check (role in ('primary', 'featured', 'composer', 'conductor', 'performer', 'orchestra', 'choir', 'producer', 'remixer', 'dj', 'other')),
  position integer not null default 0,
  metadata jsonb not null default '{}'::jsonb check (jsonb_typeof(metadata) = 'object'),
  created_at timestamptz not null default now(),
  primary key (recording_id, artist_id, role)
);

create table if not exists public.music_recording_genres (
  recording_id uuid not null references public.music_recordings(id) on delete cascade,
  genre_slug text not null references public.music_genres(slug) on update cascade on delete restrict,
  confidence numeric not null default 0.5 check (confidence >= 0 and confidence <= 1),
  assertion_status text not null default 'candidate' check (assertion_status in ('candidate', 'verified', 'rejected')),
  source text not null default 'unknown',
  source_url text,
  metadata jsonb not null default '{}'::jsonb check (jsonb_typeof(metadata) = 'object'),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  primary key (recording_id, genre_slug, source)
);

create table if not exists public.music_provider_links (
  id uuid primary key default gen_random_uuid(),
  recording_id uuid not null references public.music_recordings(id) on delete cascade,
  provider text not null check (char_length(trim(provider)) > 0),
  external_id text,
  url text not null check (url ~ '^https://'),
  link_type text not null default 'external'
    check (link_type in ('external', 'embed', 'preview', 'subscription_playback', 'refreshable_preview')),
  capabilities jsonb not null default '[]'::jsonb check (jsonb_typeof(capabilities) = 'array'),
  territories text[] not null default '{}',
  is_active boolean not null default true,
  expires_at timestamptz,
  rights_note text,
  metadata jsonb not null default '{}'::jsonb check (jsonb_typeof(metadata) = 'object'),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (recording_id, provider, url)
);

create table if not exists public.music_source_assertions (
  id uuid primary key default gen_random_uuid(),
  assertion_key text not null unique,
  entity_type text not null check (entity_type in ('artist', 'work', 'recording', 'genre', 'release')),
  entity_id uuid not null,
  field_name text not null,
  asserted_value jsonb not null default '{}'::jsonb,
  source text not null,
  source_url text,
  source_license text,
  confidence numeric not null default 0.5 check (confidence >= 0 and confidence <= 1),
  retrieved_at timestamptz not null default now(),
  metadata jsonb not null default '{}'::jsonb check (jsonb_typeof(metadata) = 'object'),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.music_catalog_quarantine (
  id uuid primary key default gen_random_uuid(),
  entity_type text not null check (entity_type in ('artist', 'work', 'recording', 'genre')),
  entity_key text not null,
  reason_code text not null,
  reason_detail text,
  source text,
  payload jsonb not null default '{}'::jsonb,
  review_status text not null default 'pending' check (review_status in ('pending', 'approved', 'rejected', 'resolved')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (entity_type, entity_key, reason_code)
);

create table if not exists public.user_music_preferences (
  user_id uuid primary key references auth.users(id) on delete cascade,
  schema_version integer not null default 2 check (schema_version >= 2),
  primary_universe_slug text not null default 'electronic' references public.music_universes(slug) on update cascade on delete restrict,
  selected_universes text[] not null default array['electronic']::text[],
  universe_weights jsonb not null default '{"electronic": 1}'::jsonb check (jsonb_typeof(universe_weights) = 'object'),
  genre_weights jsonb not null default '{}'::jsonb check (jsonb_typeof(genre_weights) = 'object'),
  artist_weights jsonb not null default '{}'::jsonb check (jsonb_typeof(artist_weights) = 'object'),
  mood_weights jsonb not null default '{}'::jsonb check (jsonb_typeof(mood_weights) = 'object'),
  context_weights jsonb not null default '{}'::jsonb check (jsonb_typeof(context_weights) = 'object'),
  novelty numeric not null default 0.5 check (novelty >= 0 and novelty <= 1),
  onboarding_completed_at timestamptz,
  client_updated_at timestamptz,
  metadata jsonb not null default '{}'::jsonb check (jsonb_typeof(metadata) = 'object'),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  check (cardinality(selected_universes) between 1 and 5)
);

create table if not exists public.user_music_taste_signals (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  signal_type text not null
    check (signal_type in ('like', 'dislike', 'skip', 'known', 'play', 'complete', 'repeat', 'search', 'open')),
  target_type text not null check (target_type in ('artist', 'work', 'recording', 'genre', 'universe')),
  target_key text not null,
  universe_slug text references public.music_universes(slug) on update cascade on delete set null,
  genre_slug text references public.music_genres(slug) on update cascade on delete set null,
  positive_weight numeric not null default 0 check (positive_weight >= 0 and positive_weight <= 100),
  negative_weight numeric not null default 0 check (negative_weight >= 0 and negative_weight <= 100),
  occurred_at timestamptz not null default now(),
  metadata jsonb not null default '{}'::jsonb check (jsonb_typeof(metadata) = 'object'),
  created_at timestamptz not null default now(),
  check (char_length(trim(target_key)) > 0),
  check (positive_weight > 0 or negative_weight > 0)
);

insert into public.music_universes (slug, display_name, display_names, description, sort_order)
values
  ('electronic', 'Eletrônica', '{"pt":"Eletrônica","en":"Electronic","es":"Electrónica"}', 'Dance music, club culture, ambient electronics and experimental electronic forms.', 10),
  ('pop', 'Pop', '{"pt":"Pop","en":"Pop","es":"Pop"}', 'Popular music across contemporary, independent and regional scenes.', 20),
  ('rock_metal', 'Rock e metal', '{"pt":"Rock e metal","en":"Rock & metal","es":"Rock y metal"}', 'Rock, punk, metal and their adjacent forms.', 30),
  ('hip_hop_rap', 'Hip-hop e rap', '{"pt":"Hip-hop e rap","en":"Hip-hop & rap","es":"Hip-hop y rap"}', 'Hip-hop, rap and related beat cultures.', 40),
  ('rnb_soul_funk', 'R&B, soul e funk', '{"pt":"R&B, soul e funk","en":"R&B, soul & funk","es":"R&B, soul y funk"}', 'R&B, soul, funk and gospel traditions.', 50),
  ('brazilian', 'Música brasileira', '{"pt":"Música brasileira","en":"Brazilian music","es":"Música brasileña"}', 'Brazilian popular, regional and urban music.', 60),
  ('latin_caribbean', 'Latina e caribenha', '{"pt":"Latina e caribenha","en":"Latin & Caribbean","es":"Latina y caribeña"}', 'Music from Latin American and Caribbean traditions and contemporary scenes.', 70),
  ('classical', 'Erudita e ópera', '{"pt":"Erudita e ópera","en":"Classical & opera","es":"Clásica y ópera"}', 'Classical works, opera, chamber, choral and contemporary concert music.', 80),
  ('jazz_blues', 'Jazz e blues', '{"pt":"Jazz e blues","en":"Jazz & blues","es":"Jazz y blues"}', 'Jazz, blues and improvisational traditions.', 90),
  ('reggae_dub', 'Reggae e dub', '{"pt":"Reggae e dub","en":"Reggae & dub","es":"Reggae y dub"}', 'Reggae, dub, dancehall, ska and adjacent Jamaican forms.', 100),
  ('african_global', 'Africana e global', '{"pt":"Africana e global","en":"African & global","es":"Africana y global"}', 'African and cross-regional contemporary music scenes.', 110),
  ('folk_country_traditional', 'Folk, country e regional', '{"pt":"Folk, country e regional","en":"Folk, country & traditional","es":"Folk, country y tradicional"}', 'Folk, country, singer-songwriter and regional traditions.', 120),
  ('ambient_experimental_soundtracks', 'Ambient, experimental e trilhas', '{"pt":"Ambient, experimental e trilhas","en":"Ambient, experimental & scores","es":"Ambient, experimental y bandas sonoras"}', 'Ambient, experimental, electroacoustic and soundtrack music.', 130)
on conflict (slug) do update set
  display_name = excluded.display_name,
  display_names = excluded.display_names,
  description = excluded.description,
  sort_order = excluded.sort_order,
  updated_at = now();

insert into public.music_genres (slug, universe_slug, display_name)
values
  ('electronic', 'electronic', 'Electronic'), ('house', 'electronic', 'House'), ('techno', 'electronic', 'Techno'),
  ('trance', 'electronic', 'Trance'), ('psytrance', 'electronic', 'Psytrance'), ('drum_and_bass', 'electronic', 'Drum and Bass'),
  ('bass_music', 'electronic', 'Bass Music'), ('hard_dance', 'electronic', 'Hard Dance'),
  ('pop', 'pop', 'Pop'), ('contemporary_pop', 'pop', 'Contemporary Pop'), ('art_pop', 'pop', 'Art Pop'),
  ('indie_pop', 'pop', 'Indie Pop'), ('synth_pop', 'pop', 'Synth-pop'), ('k_pop', 'pop', 'K-pop'), ('j_pop', 'pop', 'J-pop'),
  ('rock', 'rock_metal', 'Rock'), ('indie_rock', 'rock_metal', 'Indie Rock'), ('alternative_rock', 'rock_metal', 'Alternative Rock'),
  ('punk', 'rock_metal', 'Punk'), ('post_punk', 'rock_metal', 'Post-punk'), ('metal', 'rock_metal', 'Metal'),
  ('progressive_metal', 'rock_metal', 'Progressive Metal'), ('hardcore_punk', 'rock_metal', 'Hardcore Punk'),
  ('hip_hop', 'hip_hop_rap', 'Hip-hop'), ('rap', 'hip_hop_rap', 'Rap'), ('boom_bap', 'hip_hop_rap', 'Boom Bap'),
  ('trap_rap', 'hip_hop_rap', 'Trap Rap'), ('drill', 'hip_hop_rap', 'Drill'), ('grime', 'hip_hop_rap', 'Grime'),
  ('experimental_hip_hop', 'hip_hop_rap', 'Experimental Hip-hop'),
  ('rnb', 'rnb_soul_funk', 'R&B'), ('soul', 'rnb_soul_funk', 'Soul'), ('neo_soul', 'rnb_soul_funk', 'Neo Soul'),
  ('funk_soul', 'rnb_soul_funk', 'Funk'), ('p_funk', 'rnb_soul_funk', 'P-Funk'), ('disco', 'rnb_soul_funk', 'Disco'),
  ('gospel', 'rnb_soul_funk', 'Gospel'),
  ('mpb', 'brazilian', 'MPB'), ('samba', 'brazilian', 'Samba'), ('pagode', 'brazilian', 'Pagode'),
  ('bossa_nova', 'brazilian', 'Bossa Nova'), ('forro', 'brazilian', 'Forró'), ('sertanejo', 'brazilian', 'Sertanejo'),
  ('funk_brasileiro', 'brazilian', 'Funk brasileiro'), ('trap_brasileiro', 'brazilian', 'Trap brasileiro'),
  ('manguebeat', 'brazilian', 'Manguebeat'),
  ('latin_pop', 'latin_caribbean', 'Latin Pop'), ('reggaeton', 'latin_caribbean', 'Reggaeton'),
  ('salsa', 'latin_caribbean', 'Salsa'), ('cumbia', 'latin_caribbean', 'Cumbia'), ('bachata', 'latin_caribbean', 'Bachata'),
  ('merengue', 'latin_caribbean', 'Merengue'), ('son_cubano', 'latin_caribbean', 'Son Cubano'),
  ('classical', 'classical', 'Classical'), ('baroque', 'classical', 'Baroque'), ('classical_period', 'classical', 'Classical Period'),
  ('romantic_classical', 'classical', 'Romantic'), ('modern_classical', 'classical', 'Modern Classical'),
  ('contemporary_classical', 'classical', 'Contemporary Classical'), ('opera', 'classical', 'Opera'),
  ('choral', 'classical', 'Choral'), ('chamber_music', 'classical', 'Chamber Music'),
  ('jazz', 'jazz_blues', 'Jazz'), ('blues', 'jazz_blues', 'Blues'), ('bebop', 'jazz_blues', 'Bebop'),
  ('cool_jazz', 'jazz_blues', 'Cool Jazz'), ('jazz_fusion', 'jazz_blues', 'Jazz Fusion'),
  ('spiritual_jazz', 'jazz_blues', 'Spiritual Jazz'), ('free_jazz', 'jazz_blues', 'Free Jazz'),
  ('electric_blues', 'jazz_blues', 'Electric Blues'),
  ('reggae', 'reggae_dub', 'Reggae'), ('roots_reggae', 'reggae_dub', 'Roots Reggae'), ('dub', 'reggae_dub', 'Dub'),
  ('dancehall', 'reggae_dub', 'Dancehall'), ('ska', 'reggae_dub', 'Ska'), ('rocksteady', 'reggae_dub', 'Rocksteady'),
  ('afrobeat', 'african_global', 'Afrobeat'), ('afrobeats', 'african_global', 'Afrobeats'),
  ('amapiano', 'african_global', 'Amapiano'), ('highlife', 'african_global', 'Highlife'),
  ('soukous', 'african_global', 'Soukous'), ('gnawa', 'african_global', 'Gnawa'), ('rai', 'african_global', 'Raï'),
  ('global_bass', 'african_global', 'Global Bass'),
  ('folk', 'folk_country_traditional', 'Folk'), ('country', 'folk_country_traditional', 'Country'),
  ('bluegrass', 'folk_country_traditional', 'Bluegrass'), ('americana', 'folk_country_traditional', 'Americana'),
  ('flamenco', 'folk_country_traditional', 'Flamenco'), ('fado', 'folk_country_traditional', 'Fado'),
  ('traditional_music', 'folk_country_traditional', 'Traditional Music'),
  ('singer_songwriter', 'folk_country_traditional', 'Singer-Songwriter'),
  ('ambient', 'ambient_experimental_soundtracks', 'Ambient'), ('experimental', 'ambient_experimental_soundtracks', 'Experimental'),
  ('drone', 'ambient_experimental_soundtracks', 'Drone'), ('electroacoustic', 'ambient_experimental_soundtracks', 'Electroacoustic'),
  ('new_age', 'ambient_experimental_soundtracks', 'New Age'), ('soundtrack', 'ambient_experimental_soundtracks', 'Soundtrack'),
  ('film_score', 'ambient_experimental_soundtracks', 'Film Score'), ('game_music', 'ambient_experimental_soundtracks', 'Video Game Music')
on conflict (slug) do update set
  universe_slug = excluded.universe_slug,
  display_name = excluded.display_name,
  updated_at = now();

-- Aliases are locale-aware on purpose: a bare "funk" can describe the
-- American groove tradition or Brazilian baile funk depending on context.
insert into public.music_genre_aliases (genre_slug, alias, locale, source)
values
  ('classical', 'música erudita', 'pt', 'sonic_taxonomy_v1'),
  ('classical', 'música clássica', 'pt', 'sonic_taxonomy_v1'),
  ('classical', 'classical music', 'en', 'sonic_taxonomy_v1'),
  ('funk_soul', 'funk', 'en', 'sonic_taxonomy_v1'),
  ('funk_soul', 'funk soul', 'pt', 'sonic_taxonomy_v1'),
  ('funk_brasileiro', 'funk', 'pt-BR', 'sonic_taxonomy_v1'),
  ('funk_brasileiro', 'funk carioca', 'pt-BR', 'sonic_taxonomy_v1'),
  ('funk_brasileiro', 'baile funk', 'pt-BR', 'sonic_taxonomy_v1'),
  ('mpb', 'música popular brasileira', 'pt-BR', 'sonic_taxonomy_v1'),
  ('hip_hop', 'hip hop', null, 'sonic_taxonomy_v1'),
  ('rnb', 'rhythm and blues', 'en', 'sonic_taxonomy_v1'),
  ('drum_and_bass', 'dnb', null, 'sonic_taxonomy_v1'),
  ('afrobeats', 'afro beats', null, 'sonic_taxonomy_v1'),
  ('singer_songwriter', 'cantautor', 'pt', 'sonic_taxonomy_v1')
on conflict (genre_slug, alias_key) do update set
  locale = excluded.locale,
  source = excluded.source;

-- Bring the full verified electronic taxonomy into the universal hierarchy.
insert into public.music_genres (slug, universe_slug, display_name, status, metadata)
select
  genre.slug,
  'electronic',
  genre.display_name,
  case when genre.status = 'active' then 'active' else 'needs_review' end,
  genre.metadata || jsonb_build_object('migrated_from', 'electronic_genres')
from public.electronic_genres genre
on conflict (slug) do update set
  display_name = excluded.display_name,
  metadata = public.music_genres.metadata || excluded.metadata,
  updated_at = now();

-- Compatibility fields let the current app write universal context without
-- breaking older clients that only know `style`.
alter table public.catalog_artists
  add column if not exists universe_slug text not null default 'electronic',
  add column if not exists genre_slug text;
alter table public.catalog_tracks
  add column if not exists universe_slug text not null default 'electronic',
  add column if not exists genre_slug text;
alter table public.track_feedback
  add column if not exists universe_slug text,
  add column if not exists genre_slug text;
alter table public.feedback_events
  add column if not exists universe_slug text,
  add column if not exists genre_slug text;
alter table public.likes
  add column if not exists universe_slug text,
  add column if not exists genre_slug text;

update public.catalog_artists set universe_slug = 'electronic', genre_slug = coalesce(genre_slug, style);
update public.catalog_tracks set universe_slug = 'electronic', genre_slug = coalesce(genre_slug, style);
update public.track_feedback set universe_slug = coalesce(universe_slug, 'electronic'), genre_slug = coalesce(genre_slug, style);
update public.feedback_events set universe_slug = coalesce(universe_slug, 'electronic'), genre_slug = coalesce(genre_slug, style);
update public.likes set universe_slug = coalesce(universe_slug, 'electronic'), genre_slug = coalesce(genre_slug, style);

-- Mirror the existing verified electronic catalog into the new universal
-- entities. The original tables remain authoritative during the transition.
insert into public.music_artists (
  id, canonical_name, sort_name, artist_type, country, city, begin_date, end_date,
  disambiguation, status, verification_confidence, metadata, created_at, updated_at
)
select
  artist.id,
  artist.canonical_name,
  artist.sort_name,
  case when artist.artist_type in ('person', 'group', 'orchestra', 'choir') then artist.artist_type else 'person_or_group' end,
  artist.country,
  artist.city,
  artist.begin_date,
  artist.end_date,
  artist.disambiguation,
  artist.electronic_status,
  artist.verification_confidence,
  artist.metadata || jsonb_build_object('primary_universe', 'electronic', 'migrated_from', 'electronic_artists'),
  artist.created_at,
  artist.updated_at
from public.electronic_artists artist
on conflict (id) do update set
  canonical_name = excluded.canonical_name,
  status = excluded.status,
  verification_confidence = greatest(public.music_artists.verification_confidence, excluded.verification_confidence),
  metadata = public.music_artists.metadata || excluded.metadata,
  updated_at = greatest(public.music_artists.updated_at, excluded.updated_at);

insert into public.music_artist_aliases (artist_id, alias, locale, alias_type, is_primary, source, created_at)
select artist_id, alias, locale, alias_type, is_primary, source, created_at
from public.electronic_artist_aliases
on conflict (artist_id, alias_key) do update set
  locale = coalesce(excluded.locale, public.music_artist_aliases.locale),
  is_primary = public.music_artist_aliases.is_primary or excluded.is_primary,
  source = coalesce(excluded.source, public.music_artist_aliases.source);

insert into public.music_artist_external_ids (artist_id, provider, external_id, external_url, source, metadata, created_at, updated_at)
select artist_id, provider, external_id, external_url, source, metadata, created_at, updated_at
from public.electronic_artist_external_ids
on conflict (artist_id, provider) do update set
  external_id = excluded.external_id,
  external_url = coalesce(excluded.external_url, public.music_artist_external_ids.external_url),
  metadata = public.music_artist_external_ids.metadata || excluded.metadata,
  updated_at = greatest(public.music_artist_external_ids.updated_at, excluded.updated_at);

insert into public.music_recordings (
  id, title, identity_key, isrc, release_title, label, release_date, duration_sec,
  status, verification_confidence, audio_descriptors, metadata, created_at, updated_at
)
select
  recording.id,
  recording.title,
  recording.identity_key,
  recording.isrc,
  recording.release_title,
  recording.label,
  recording.release_date,
  recording.duration_sec,
  recording.recording_status,
  recording.verification_confidence,
  jsonb_strip_nulls(jsonb_build_object('bpm', recording.bpm_exact)),
  recording.metadata || jsonb_build_object('primary_universe', 'electronic', 'migrated_from', 'electronic_recordings'),
  recording.created_at,
  recording.updated_at
from public.electronic_recordings recording
on conflict (id) do update set
  title = excluded.title,
  isrc = coalesce(excluded.isrc, public.music_recordings.isrc),
  status = excluded.status,
  verification_confidence = greatest(public.music_recordings.verification_confidence, excluded.verification_confidence),
  audio_descriptors = public.music_recordings.audio_descriptors || excluded.audio_descriptors,
  metadata = public.music_recordings.metadata || excluded.metadata,
  updated_at = greatest(public.music_recordings.updated_at, excluded.updated_at);

insert into public.music_recording_artists (recording_id, artist_id, role, position, metadata)
select recording.id, recording.primary_artist_id, 'primary', 0, '{"migrated_from":"electronic_recordings"}'::jsonb
from public.electronic_recordings recording
on conflict (recording_id, artist_id, role) do nothing;

insert into public.music_recording_genres (recording_id, genre_slug, confidence, assertion_status, source, source_url, metadata, created_at, updated_at)
select recording_id, genre_slug, confidence, assertion_status, source, source_url, metadata, created_at, updated_at
from public.electronic_recording_genres
on conflict (recording_id, genre_slug, source) do update set
  confidence = greatest(public.music_recording_genres.confidence, excluded.confidence),
  assertion_status = case when excluded.assertion_status = 'verified' then 'verified' else public.music_recording_genres.assertion_status end,
  source_url = coalesce(excluded.source_url, public.music_recording_genres.source_url),
  metadata = public.music_recording_genres.metadata || excluded.metadata,
  updated_at = greatest(public.music_recording_genres.updated_at, excluded.updated_at);

insert into public.music_provider_links (
  recording_id, provider, external_id, url, link_type, capabilities, is_active,
  expires_at, rights_note, metadata, created_at, updated_at
)
select
  link.recording_id,
  link.provider,
  null,
  link.url,
  case link.link_type
    when 'embed' then 'embed'
    when 'preview' then 'preview'
    when 'refreshable_preview' then 'refreshable_preview'
    else 'external'
  end,
  case link.link_type
    when 'embed' then '["embed"]'::jsonb
    when 'preview' then '["preview"]'::jsonb
    when 'refreshable_preview' then '["preview","refresh"]'::jsonb
    else '["external"]'::jsonb
  end,
  link.is_active,
  link.expires_at,
  link.rights_note,
  link.metadata || jsonb_build_object('migrated_from', 'electronic_playback_links'),
  link.created_at,
  link.updated_at
from public.electronic_playback_links link
where link.url ~ '^https://'
on conflict (recording_id, provider, url) do update set
  is_active = excluded.is_active,
  expires_at = excluded.expires_at,
  rights_note = coalesce(excluded.rights_note, public.music_provider_links.rights_note),
  metadata = public.music_provider_links.metadata || excluded.metadata,
  updated_at = greatest(public.music_provider_links.updated_at, excluded.updated_at);

create index if not exists music_genres_universe_status_idx on public.music_genres (universe_slug, status, display_name);
create index if not exists music_genre_aliases_key_idx on public.music_genre_aliases (alias_key);
create index if not exists music_artists_status_name_idx on public.music_artists (status, canonical_name);
create index if not exists music_recordings_status_release_idx on public.music_recordings (status, release_date desc);
create index if not exists music_recordings_isrc_idx on public.music_recordings (isrc) where isrc is not null;
create index if not exists music_recording_artists_artist_idx on public.music_recording_artists (artist_id, role, recording_id);
create index if not exists music_recording_genres_lookup_idx on public.music_recording_genres (genre_slug, assertion_status, recording_id);
create index if not exists music_provider_links_active_idx on public.music_provider_links (recording_id, is_active, provider);
create index if not exists user_music_taste_signals_user_time_idx on public.user_music_taste_signals (user_id, occurred_at desc);
create index if not exists user_music_taste_signals_target_idx on public.user_music_taste_signals (target_type, target_key);

drop trigger if exists set_music_universes_updated_at on public.music_universes;
create trigger set_music_universes_updated_at before update on public.music_universes
  for each row execute function public.set_updated_at();
drop trigger if exists set_music_genres_updated_at on public.music_genres;
create trigger set_music_genres_updated_at before update on public.music_genres
  for each row execute function public.set_updated_at();
drop trigger if exists set_music_artists_updated_at on public.music_artists;
create trigger set_music_artists_updated_at before update on public.music_artists
  for each row execute function public.set_updated_at();
drop trigger if exists set_music_artist_external_ids_updated_at on public.music_artist_external_ids;
create trigger set_music_artist_external_ids_updated_at before update on public.music_artist_external_ids
  for each row execute function public.set_updated_at();
drop trigger if exists set_music_works_updated_at on public.music_works;
create trigger set_music_works_updated_at before update on public.music_works
  for each row execute function public.set_updated_at();
drop trigger if exists set_music_recordings_updated_at on public.music_recordings;
create trigger set_music_recordings_updated_at before update on public.music_recordings
  for each row execute function public.set_updated_at();
drop trigger if exists set_music_recording_genres_updated_at on public.music_recording_genres;
create trigger set_music_recording_genres_updated_at before update on public.music_recording_genres
  for each row execute function public.set_updated_at();
drop trigger if exists set_music_provider_links_updated_at on public.music_provider_links;
create trigger set_music_provider_links_updated_at before update on public.music_provider_links
  for each row execute function public.set_updated_at();
drop trigger if exists set_music_source_assertions_updated_at on public.music_source_assertions;
create trigger set_music_source_assertions_updated_at before update on public.music_source_assertions
  for each row execute function public.set_updated_at();
drop trigger if exists set_music_catalog_quarantine_updated_at on public.music_catalog_quarantine;
create trigger set_music_catalog_quarantine_updated_at before update on public.music_catalog_quarantine
  for each row execute function public.set_updated_at();
drop trigger if exists set_user_music_preferences_updated_at on public.user_music_preferences;
create trigger set_user_music_preferences_updated_at before update on public.user_music_preferences
  for each row execute function public.set_updated_at();

alter table public.music_universes enable row level security;
alter table public.music_genres enable row level security;
alter table public.music_genre_aliases enable row level security;
alter table public.music_artists enable row level security;
alter table public.music_artist_aliases enable row level security;
alter table public.music_artist_external_ids enable row level security;
alter table public.music_works enable row level security;
alter table public.music_recordings enable row level security;
alter table public.music_recording_artists enable row level security;
alter table public.music_recording_genres enable row level security;
alter table public.music_provider_links enable row level security;
alter table public.music_source_assertions enable row level security;
alter table public.music_catalog_quarantine enable row level security;
alter table public.user_music_preferences enable row level security;
alter table public.user_music_taste_signals enable row level security;

drop policy if exists "Active music universes are public" on public.music_universes;
drop policy if exists "Active music genres are public" on public.music_genres;
drop policy if exists "Genre aliases follow active genres" on public.music_genre_aliases;
drop policy if exists "Recommendable music artists are public" on public.music_artists;
drop policy if exists "Artist aliases follow public artists" on public.music_artist_aliases;
drop policy if exists "Artist IDs follow public artists" on public.music_artist_external_ids;
drop policy if exists "Verified works are public" on public.music_works;
drop policy if exists "Recommendable music recordings are public" on public.music_recordings;
drop policy if exists "Recording artists follow public recordings" on public.music_recording_artists;
drop policy if exists "Verified recording genres are public" on public.music_recording_genres;
drop policy if exists "Active provider links follow public recordings" on public.music_provider_links;
drop policy if exists "Users manage own universal preferences" on public.user_music_preferences;
drop policy if exists "Users read own universal taste signals" on public.user_music_taste_signals;
drop policy if exists "Users create own universal taste signals" on public.user_music_taste_signals;

create policy "Active music universes are public" on public.music_universes for select using (status = 'active');
create policy "Active music genres are public" on public.music_genres for select using (status = 'active');
create policy "Genre aliases follow active genres" on public.music_genre_aliases for select using (
  exists (select 1 from public.music_genres genre where genre.slug = genre_slug and genre.status = 'active')
);
create policy "Recommendable music artists are public" on public.music_artists for select using (status = 'recommendable');
create policy "Artist aliases follow public artists" on public.music_artist_aliases for select using (
  exists (select 1 from public.music_artists artist where artist.id = artist_id and artist.status = 'recommendable')
);
create policy "Artist IDs follow public artists" on public.music_artist_external_ids for select using (
  exists (select 1 from public.music_artists artist where artist.id = artist_id and artist.status = 'recommendable')
);
create policy "Verified works are public" on public.music_works for select using (
  exists (select 1 from public.music_recordings recording where recording.work_id = id and recording.status = 'recommendable')
);
create policy "Recommendable music recordings are public" on public.music_recordings for select using (status = 'recommendable');
create policy "Recording artists follow public recordings" on public.music_recording_artists for select using (
  exists (select 1 from public.music_recordings recording where recording.id = recording_id and recording.status = 'recommendable')
);
create policy "Verified recording genres are public" on public.music_recording_genres for select using (
  assertion_status = 'verified' and exists (
    select 1 from public.music_recordings recording where recording.id = recording_id and recording.status = 'recommendable'
  )
);
create policy "Active provider links follow public recordings" on public.music_provider_links for select using (
  is_active = true and (expires_at is null or expires_at > now()) and exists (
    select 1 from public.music_recordings recording where recording.id = recording_id and recording.status = 'recommendable'
  )
);
create policy "Users manage own universal preferences" on public.user_music_preferences for all
  using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "Users read own universal taste signals" on public.user_music_taste_signals for select
  using (auth.uid() = user_id);
create policy "Users create own universal taste signals" on public.user_music_taste_signals for insert
  with check (auth.uid() = user_id);

create or replace view public.music_catalog_public_v1
with (security_invoker = true)
as
select
  recording.id,
  recording.title as song,
  primary_artist.canonical_name as artist,
  primary_artist.id as artist_id,
  genre.genre_slug,
  genre.universe_slug,
  recording.release_title,
  recording.label,
  recording.release_date,
  recording.duration_sec,
  recording.explicit,
  recording.verification_confidence,
  recording.audio_descriptors,
  recording.metadata,
  coalesce(links.provider_links, '[]'::jsonb) as provider_links
from public.music_recordings recording
left join lateral (
  select artist.id, artist.canonical_name
  from public.music_recording_artists relation
  join public.music_artists artist on artist.id = relation.artist_id
  where relation.recording_id = recording.id
  order by case relation.role when 'primary' then 0 when 'composer' then 1 else 2 end, relation.position, artist.canonical_name
  limit 1
) primary_artist on true
left join lateral (
  select relation.genre_slug, taxonomy.universe_slug
  from public.music_recording_genres relation
  join public.music_genres taxonomy on taxonomy.slug = relation.genre_slug
  where relation.recording_id = recording.id and relation.assertion_status = 'verified' and taxonomy.status = 'active'
  order by relation.confidence desc, relation.genre_slug
  limit 1
) genre on true
left join lateral (
  select jsonb_agg(jsonb_build_object(
    'provider', link.provider,
    'externalId', link.external_id,
    'url', link.url,
    'linkType', link.link_type,
    'capabilities', link.capabilities,
    'territories', link.territories
  ) order by link.provider) as provider_links
  from public.music_provider_links link
  where link.recording_id = recording.id
    and link.is_active = true
    and (link.expires_at is null or link.expires_at > now())
) links on true
where recording.status = 'recommendable'
  and primary_artist.id is not null
  and genre.genre_slug is not null
  and jsonb_array_length(coalesce(links.provider_links, '[]'::jsonb)) > 0;

revoke all on public.music_universes from anon, authenticated;
revoke all on public.music_genres from anon, authenticated;
revoke all on public.music_genre_aliases from anon, authenticated;
revoke all on public.music_artists from anon, authenticated;
revoke all on public.music_artist_aliases from anon, authenticated;
revoke all on public.music_artist_external_ids from anon, authenticated;
revoke all on public.music_works from anon, authenticated;
revoke all on public.music_recordings from anon, authenticated;
revoke all on public.music_recording_artists from anon, authenticated;
revoke all on public.music_recording_genres from anon, authenticated;
revoke all on public.music_provider_links from anon, authenticated;
revoke all on public.music_source_assertions from anon, authenticated;
revoke all on public.music_catalog_quarantine from anon, authenticated;
revoke all on public.user_music_preferences from anon, authenticated;
revoke all on public.user_music_taste_signals from anon, authenticated;

grant select on public.music_universes to anon, authenticated;
grant select on public.music_genres to anon, authenticated;
grant select on public.music_genre_aliases to anon, authenticated;
grant select on public.music_artists to anon, authenticated;
grant select on public.music_artist_aliases to anon, authenticated;
grant select on public.music_artist_external_ids to anon, authenticated;
grant select on public.music_works to anon, authenticated;
grant select on public.music_recordings to anon, authenticated;
grant select on public.music_recording_artists to anon, authenticated;
grant select on public.music_recording_genres to anon, authenticated;
grant select on public.music_provider_links to anon, authenticated;
grant select on public.music_catalog_public_v1 to anon, authenticated;
grant select, insert, update, delete on public.user_music_preferences to authenticated;
grant select, insert on public.user_music_taste_signals to authenticated;

grant all on public.music_universes to service_role;
grant all on public.music_genres to service_role;
grant all on public.music_genre_aliases to service_role;
grant all on public.music_artists to service_role;
grant all on public.music_artist_aliases to service_role;
grant all on public.music_artist_external_ids to service_role;
grant all on public.music_works to service_role;
grant all on public.music_recordings to service_role;
grant all on public.music_recording_artists to service_role;
grant all on public.music_recording_genres to service_role;
grant all on public.music_provider_links to service_role;
grant all on public.music_source_assertions to service_role;
grant all on public.music_catalog_quarantine to service_role;
grant all on public.user_music_preferences to service_role;
grant all on public.user_music_taste_signals to service_role;
grant select on public.music_catalog_public_v1 to service_role;

notify pgrst, 'reload schema';

commit;
