-- Sonic Search electronic catalog v2.
-- Normalizes artist identities, recordings, genres, provider IDs and provenance
-- while keeping catalog_artists/catalog_tracks as the backwards-compatible
-- ingestion surface used by the current app.

create extension if not exists pgcrypto;

create or replace function public.catalog_key(value text)
returns text
language sql
immutable
as $$
  select nullif(
    trim(both '_' from regexp_replace(lower(coalesce(value, '')), '[^a-z0-9]+', '_', 'g')),
    ''
  );
$$;

create or replace function public.electronic_confidence(value text, fallback numeric default 0.5)
returns numeric
language sql
immutable
as $$
  select least(
    1,
    greatest(
      0,
      coalesce(
        case lower(trim(coalesce(value, '')))
          when 'very_high' then 0.98
          when 'high' then 0.92
          when 'medium_high' then 0.82
          when 'medium' then 0.68
          when 'medium_low' then 0.52
          when 'low' then 0.3
          else null
        end,
        case
          when trim(coalesce(value, '')) ~ '^[0-9]+([.][0-9]+)?$'
            then trim(value)::numeric
          else null
        end,
        fallback
      )
    )
  );
$$;

create or replace function public.merge_electronic_status(current_status text, incoming_status text)
returns text
language sql
immutable
as $$
  select case
    when incoming_status = 'blocked' then 'blocked'
    when current_status = 'blocked' and incoming_status <> 'recommendable' then 'blocked'
    when incoming_status = 'recommendable' or current_status = 'recommendable' then 'recommendable'
    when incoming_status = 'verified' or current_status = 'verified' then 'verified'
    when incoming_status = 'candidate' or current_status = 'candidate' then 'candidate'
    else 'needs_review'
  end;
$$;

create table if not exists public.electronic_artists (
  id uuid primary key default gen_random_uuid(),
  canonical_name text not null,
  canonical_key text generated always as (public.catalog_key(canonical_name)) stored,
  sort_name text,
  artist_type text,
  country text,
  city text,
  begin_date date,
  end_date date,
  disambiguation text,
  electronic_status text not null default 'candidate'
    check (electronic_status in ('candidate', 'verified', 'recommendable', 'needs_review', 'blocked')),
  verification_confidence numeric not null default 0.5
    check (verification_confidence >= 0 and verification_confidence <= 1),
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  check (char_length(trim(canonical_name)) > 0),
  unique (canonical_key)
);

create table if not exists public.electronic_artist_aliases (
  id uuid primary key default gen_random_uuid(),
  artist_id uuid not null references public.electronic_artists(id) on delete cascade,
  alias text not null,
  alias_key text generated always as (public.catalog_key(alias)) stored,
  locale text,
  alias_type text not null default 'search',
  is_primary boolean not null default false,
  source text,
  created_at timestamptz not null default now(),
  check (char_length(trim(alias)) > 0),
  unique (artist_id, alias_key)
);

create table if not exists public.electronic_artist_external_ids (
  id uuid primary key default gen_random_uuid(),
  artist_id uuid not null references public.electronic_artists(id) on delete cascade,
  provider text not null,
  external_id text not null,
  external_url text,
  source text,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  check (char_length(trim(provider)) > 0),
  check (char_length(trim(external_id)) > 0),
  unique (artist_id, provider)
);

create index if not exists electronic_artist_external_ids_lookup_idx
  on public.electronic_artist_external_ids (provider, external_id);

create table if not exists public.electronic_genres (
  slug text primary key,
  display_name text not null,
  parent_slug text references public.electronic_genres(slug) on delete set null,
  is_electronic boolean not null default true,
  status text not null default 'active'
    check (status in ('active', 'alias', 'deprecated', 'needs_review')),
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  check (char_length(trim(slug)) > 0),
  check (char_length(trim(display_name)) > 0)
);

create table if not exists public.electronic_artist_genres (
  id uuid primary key default gen_random_uuid(),
  artist_id uuid not null references public.electronic_artists(id) on delete cascade,
  genre_slug text not null references public.electronic_genres(slug) on delete cascade,
  evidence_type text not null default 'artist'
    check (evidence_type in ('artist', 'recording', 'release', 'label', 'lineup', 'editorial', 'submission')),
  confidence numeric not null default 0.5 check (confidence >= 0 and confidence <= 1),
  assertion_status text not null default 'candidate'
    check (assertion_status in ('candidate', 'verified', 'rejected')),
  source text not null default 'unknown',
  source_key text generated always as (public.catalog_key(source)) stored,
  source_url text,
  reviewed_at timestamptz,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (artist_id, genre_slug, evidence_type, source_key)
);

create table if not exists public.electronic_recordings (
  id uuid primary key default gen_random_uuid(),
  primary_artist_id uuid not null references public.electronic_artists(id) on delete restrict,
  title text not null,
  identity_key text not null,
  isrc text,
  release_title text,
  label text,
  release_date date,
  duration_sec integer,
  bpm_exact numeric,
  recording_status text not null default 'candidate'
    check (recording_status in ('candidate', 'verified', 'recommendable', 'needs_review', 'blocked')),
  verification_confidence numeric not null default 0.5
    check (verification_confidence >= 0 and verification_confidence <= 1),
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  check (char_length(trim(title)) > 0),
  check (char_length(trim(identity_key)) > 0),
  check (duration_sec is null or duration_sec >= 0),
  check (bpm_exact is null or bpm_exact > 0),
  unique (identity_key)
);

create table if not exists public.electronic_recording_external_ids (
  id uuid primary key default gen_random_uuid(),
  recording_id uuid not null references public.electronic_recordings(id) on delete cascade,
  provider text not null,
  external_id text not null,
  external_url text,
  source text,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  check (char_length(trim(provider)) > 0),
  check (char_length(trim(external_id)) > 0),
  unique (recording_id, provider)
);

create index if not exists electronic_recording_external_ids_lookup_idx
  on public.electronic_recording_external_ids (provider, external_id);

create table if not exists public.electronic_recording_genres (
  id uuid primary key default gen_random_uuid(),
  recording_id uuid not null references public.electronic_recordings(id) on delete cascade,
  genre_slug text not null references public.electronic_genres(slug) on delete cascade,
  confidence numeric not null default 0.5 check (confidence >= 0 and confidence <= 1),
  assertion_status text not null default 'candidate'
    check (assertion_status in ('candidate', 'verified', 'rejected')),
  source text not null default 'unknown',
  source_key text generated always as (public.catalog_key(source)) stored,
  source_url text,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (recording_id, genre_slug, source_key)
);

create table if not exists public.electronic_playback_links (
  id uuid primary key default gen_random_uuid(),
  recording_id uuid not null references public.electronic_recordings(id) on delete cascade,
  provider text not null,
  url text not null,
  link_type text not null default 'external'
    check (link_type in ('external', 'embed', 'preview', 'refreshable_preview')),
  is_active boolean not null default true,
  expires_at timestamptz,
  rights_note text,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  check (char_length(trim(provider)) > 0),
  check (char_length(trim(url)) > 0),
  unique (recording_id, provider, url)
);

create table if not exists public.electronic_source_assertions (
  id uuid primary key default gen_random_uuid(),
  assertion_key text not null unique,
  entity_type text not null check (entity_type in ('artist', 'recording', 'genre', 'release')),
  entity_id uuid not null,
  field_name text not null,
  asserted_value jsonb not null default '{}'::jsonb,
  source text not null,
  source_url text,
  source_license text,
  confidence numeric not null default 0.5 check (confidence >= 0 and confidence <= 1),
  retrieved_at timestamptz not null default now(),
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.electronic_ingestion_runs (
  id uuid primary key default gen_random_uuid(),
  source text not null,
  batch_key text not null unique,
  run_status text not null default 'running'
    check (run_status in ('running', 'completed', 'completed_with_review', 'failed')),
  artists_seen integer not null default 0,
  artists_published integer not null default 0,
  recordings_seen integer not null default 0,
  recordings_published integer not null default 0,
  quarantined integer not null default 0,
  started_at timestamptz not null default now(),
  finished_at timestamptz,
  metadata jsonb not null default '{}'::jsonb
);

create table if not exists public.electronic_catalog_quarantine (
  id uuid primary key default gen_random_uuid(),
  entity_type text not null check (entity_type in ('artist', 'recording')),
  entity_key text not null,
  reason_code text not null,
  reason_detail text,
  source text,
  payload jsonb not null default '{}'::jsonb,
  review_status text not null default 'pending'
    check (review_status in ('pending', 'approved', 'rejected', 'resolved')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (entity_type, entity_key, reason_code)
);

create index if not exists electronic_artists_status_name_idx
  on public.electronic_artists (electronic_status, canonical_name);
create index if not exists electronic_artist_aliases_key_idx
  on public.electronic_artist_aliases (alias_key);
create index if not exists electronic_artist_genres_genre_status_idx
  on public.electronic_artist_genres (genre_slug, assertion_status, artist_id);
create index if not exists electronic_recordings_artist_status_idx
  on public.electronic_recordings (primary_artist_id, recording_status, title);
create index if not exists electronic_recordings_isrc_idx
  on public.electronic_recordings (isrc) where isrc is not null;
create index if not exists electronic_recording_genres_genre_status_idx
  on public.electronic_recording_genres (genre_slug, assertion_status, recording_id);
create index if not exists electronic_playback_links_recording_active_idx
  on public.electronic_playback_links (recording_id, is_active, provider);
create index if not exists electronic_source_assertions_entity_idx
  on public.electronic_source_assertions (entity_type, entity_id, field_name);
create index if not exists electronic_quarantine_status_idx
  on public.electronic_catalog_quarantine (review_status, entity_type, reason_code);

drop trigger if exists set_electronic_artists_updated_at on public.electronic_artists;
create trigger set_electronic_artists_updated_at
  before update on public.electronic_artists
  for each row execute function public.set_updated_at();

drop trigger if exists set_electronic_artist_external_ids_updated_at on public.electronic_artist_external_ids;
create trigger set_electronic_artist_external_ids_updated_at
  before update on public.electronic_artist_external_ids
  for each row execute function public.set_updated_at();

drop trigger if exists set_electronic_genres_updated_at on public.electronic_genres;
create trigger set_electronic_genres_updated_at
  before update on public.electronic_genres
  for each row execute function public.set_updated_at();

drop trigger if exists set_electronic_artist_genres_updated_at on public.electronic_artist_genres;
create trigger set_electronic_artist_genres_updated_at
  before update on public.electronic_artist_genres
  for each row execute function public.set_updated_at();

drop trigger if exists set_electronic_recordings_updated_at on public.electronic_recordings;
create trigger set_electronic_recordings_updated_at
  before update on public.electronic_recordings
  for each row execute function public.set_updated_at();

drop trigger if exists set_electronic_recording_external_ids_updated_at on public.electronic_recording_external_ids;
create trigger set_electronic_recording_external_ids_updated_at
  before update on public.electronic_recording_external_ids
  for each row execute function public.set_updated_at();

drop trigger if exists set_electronic_recording_genres_updated_at on public.electronic_recording_genres;
create trigger set_electronic_recording_genres_updated_at
  before update on public.electronic_recording_genres
  for each row execute function public.set_updated_at();

drop trigger if exists set_electronic_playback_links_updated_at on public.electronic_playback_links;
create trigger set_electronic_playback_links_updated_at
  before update on public.electronic_playback_links
  for each row execute function public.set_updated_at();

drop trigger if exists set_electronic_source_assertions_updated_at on public.electronic_source_assertions;
create trigger set_electronic_source_assertions_updated_at
  before update on public.electronic_source_assertions
  for each row execute function public.set_updated_at();

drop trigger if exists set_electronic_quarantine_updated_at on public.electronic_catalog_quarantine;
create trigger set_electronic_quarantine_updated_at
  before update on public.electronic_catalog_quarantine
  for each row execute function public.set_updated_at();

create or replace function public.upsert_electronic_artist_from_catalog(
  p_style text,
  p_artist text,
  p_country text,
  p_city text,
  p_artist_bio text,
  p_artist_genre text,
  p_artist_profile_hint text,
  p_status text,
  p_source text,
  p_source_url text,
  p_metadata jsonb,
  p_has_eligible_recording boolean default false
)
returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
  v_artist_id uuid;
  v_artist_key text := public.catalog_key(p_artist);
  v_genre text := nullif(trim(coalesce(p_style, '')), '');
  v_metadata jsonb := coalesce(p_metadata, '{}'::jsonb);
  v_gate text := lower(coalesce(v_metadata->>'electronic_gate', ''));
  v_status text;
  v_confidence numeric;
  v_source text := coalesce(nullif(trim(coalesce(p_source, '')), ''), 'catalog_v1');
  v_external record;
  v_alias jsonb;
  v_alias_name text;
  v_alias_locale text;
begin
  if v_artist_key is null then
    return null;
  end if;

  v_status := case
    when p_status = 'hidden' then 'blocked'
    when p_status = 'published' and (v_gate = 'passed' or p_has_eligible_recording) then 'recommendable'
    when p_status = 'published' then 'candidate'
    else 'needs_review'
  end;
  v_confidence := public.electronic_confidence(
    v_metadata->>'confidence',
    case
      when v_status = 'recommendable' then 0.95
      when v_status = 'candidate' then 0.55
      else 0.3
    end
  );

  if v_genre is not null then
    insert into public.electronic_genres (slug, display_name, is_electronic, status)
    values (v_genre, initcap(replace(v_genre, '_', ' ')), true, 'active')
    on conflict (slug) do update
      set is_electronic = true,
          status = case when public.electronic_genres.status = 'deprecated' then 'deprecated' else 'active' end;
  end if;

  insert into public.electronic_artists (
    canonical_name,
    sort_name,
    artist_type,
    country,
    city,
    disambiguation,
    electronic_status,
    verification_confidence,
    metadata
  )
  values (
    trim(p_artist),
    nullif(trim(coalesce(v_metadata->>'sort_name', '')), ''),
    nullif(trim(coalesce(v_metadata->>'artist_type', '')), ''),
    nullif(trim(coalesce(p_country, '')), ''),
    nullif(trim(coalesce(p_city, '')), ''),
    nullif(trim(coalesce(p_artist_profile_hint, '')), ''),
    v_status,
    v_confidence,
    v_metadata || jsonb_build_object(
      'artist_bio', coalesce(p_artist_bio, ''),
      'artist_genre', coalesce(p_artist_genre, '')
    )
  )
  on conflict (canonical_key) do update
    set sort_name = coalesce(excluded.sort_name, public.electronic_artists.sort_name),
        artist_type = coalesce(excluded.artist_type, public.electronic_artists.artist_type),
        country = coalesce(excluded.country, public.electronic_artists.country),
        city = coalesce(excluded.city, public.electronic_artists.city),
        disambiguation = coalesce(excluded.disambiguation, public.electronic_artists.disambiguation),
        electronic_status = public.merge_electronic_status(
          public.electronic_artists.electronic_status,
          excluded.electronic_status
        ),
        verification_confidence = greatest(
          public.electronic_artists.verification_confidence,
          excluded.verification_confidence
        ),
        metadata = public.electronic_artists.metadata || excluded.metadata
  returning id into v_artist_id;

  insert into public.electronic_artist_aliases (artist_id, alias, alias_type, is_primary, source)
  values (v_artist_id, trim(p_artist), 'canonical', true, v_source)
  on conflict (artist_id, alias_key) do update
    set is_primary = true,
        source = excluded.source;

  if jsonb_typeof(v_metadata->'aliases') = 'array' then
    for v_alias in
      select value
      from jsonb_array_elements(v_metadata->'aliases') as aliases(value)
    loop
      v_alias_name := case
        when jsonb_typeof(v_alias) = 'object' then v_alias->>'alias'
        when jsonb_typeof(v_alias) = 'string' then v_alias #>> '{}'
        else null
      end;
      v_alias_locale := case
        when jsonb_typeof(v_alias) = 'object' then nullif(trim(coalesce(v_alias->>'locale', '')), '')
        else null
      end;
      if nullif(trim(coalesce(v_alias_name, '')), '') is not null then
        insert into public.electronic_artist_aliases (artist_id, alias, locale, alias_type, is_primary, source)
        values (v_artist_id, trim(v_alias_name), v_alias_locale, 'search', false, v_source)
        on conflict (artist_id, alias_key) do update
          set locale = coalesce(excluded.locale, public.electronic_artist_aliases.locale),
              source = excluded.source;
      end if;
    end loop;
  end if;

  if v_genre is not null then
    insert into public.electronic_artist_genres (
      artist_id,
      genre_slug,
      evidence_type,
      confidence,
      assertion_status,
      source,
      source_url,
      reviewed_at,
      metadata
    )
    values (
      v_artist_id,
      v_genre,
      case when p_has_eligible_recording then 'recording' else 'artist' end,
      v_confidence,
      case when v_status in ('verified', 'recommendable') then 'verified' else 'candidate' end,
      v_source,
      nullif(trim(coalesce(p_source_url, '')), ''),
      case when v_status in ('verified', 'recommendable') then now() else null end,
      v_metadata
    )
    on conflict (artist_id, genre_slug, evidence_type, source_key) do update
      set confidence = greatest(public.electronic_artist_genres.confidence, excluded.confidence),
          assertion_status = case
            when excluded.assertion_status = 'verified' then 'verified'
            else public.electronic_artist_genres.assertion_status
          end,
          source_url = coalesce(excluded.source_url, public.electronic_artist_genres.source_url),
          reviewed_at = coalesce(excluded.reviewed_at, public.electronic_artist_genres.reviewed_at),
          metadata = public.electronic_artist_genres.metadata || excluded.metadata;
  end if;

  for v_external in
    select * from (values
      ('musicbrainz', coalesce(v_metadata->>'musicbrainz_artist_id', v_metadata->>'artist_mbid'), v_metadata->>'musicbrainz_artist_url'),
      ('wikidata', v_metadata->>'wikidata_id', v_metadata->>'wikidata_url'),
      ('isni', v_metadata->>'isni', null),
      ('discogs', v_metadata->>'discogs_artist_id', v_metadata->>'discogs_artist_url'),
      ('spotify', v_metadata->>'spotify_artist_id', v_metadata->>'spotify_artist_url'),
      ('deezer', v_metadata->>'deezer_artist_id', v_metadata->>'deezer_artist_url')
    ) as external_ids(provider, external_id, external_url)
  loop
    if nullif(trim(coalesce(v_external.external_id, '')), '') is not null then
      insert into public.electronic_artist_external_ids (
        artist_id, provider, external_id, external_url, source, metadata
      )
      values (
        v_artist_id,
        v_external.provider,
        trim(v_external.external_id),
        nullif(trim(coalesce(v_external.external_url, '')), ''),
        v_source,
        jsonb_build_object('imported_from', 'catalog_v1')
      )
      on conflict (artist_id, provider) do update
        set external_id = excluded.external_id,
            external_url = coalesce(excluded.external_url, public.electronic_artist_external_ids.external_url),
            source = excluded.source,
            metadata = public.electronic_artist_external_ids.metadata || excluded.metadata;
    end if;
  end loop;

  insert into public.electronic_source_assertions (
    assertion_key,
    entity_type,
    entity_id,
    field_name,
    asserted_value,
    source,
    source_url,
    source_license,
    confidence,
    metadata
  )
  values (
    md5(concat_ws('|', 'artist', v_artist_id::text, v_genre, v_source)),
    'artist',
    v_artist_id,
    'electronic_identity',
    jsonb_build_object('style', v_genre, 'status', v_status),
    v_source,
    nullif(trim(coalesce(p_source_url, '')), ''),
    nullif(trim(coalesce(v_metadata->>'source_license', '')), ''),
    v_confidence,
    v_metadata
  )
  on conflict (assertion_key) do update
    set asserted_value = excluded.asserted_value,
        source_url = coalesce(excluded.source_url, public.electronic_source_assertions.source_url),
        source_license = coalesce(excluded.source_license, public.electronic_source_assertions.source_license),
        confidence = greatest(public.electronic_source_assertions.confidence, excluded.confidence),
        retrieved_at = now(),
        metadata = public.electronic_source_assertions.metadata || excluded.metadata;

  if v_status in ('needs_review', 'blocked') then
    insert into public.electronic_catalog_quarantine (
      entity_type, entity_key, reason_code, reason_detail, source, payload
    )
    values (
      'artist',
      v_artist_key,
      coalesce(nullif(v_metadata->>'electronic_gate_reason', ''), 'no_eligible_recording'),
      coalesce(v_metadata->>'electronic_gate_detail', 'Artist stored as a candidate until recording-level proof exists.'),
      v_source,
      jsonb_build_object('artist', p_artist, 'style', v_genre, 'metadata', v_metadata)
    )
    on conflict (entity_type, entity_key, reason_code) do update
      set reason_detail = excluded.reason_detail,
          source = excluded.source,
          payload = excluded.payload,
          review_status = 'pending';
  end if;

  return v_artist_id;
end;
$$;

create or replace function public.sync_catalog_artist_to_electronic_v2()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  perform public.upsert_electronic_artist_from_catalog(
    new.style,
    new.artist,
    new.country,
    new.city,
    new.artist_bio,
    new.artist_genre,
    new.artist_profile_hint,
    new.status,
    new.source,
    new.source_url,
    coalesce(new.metadata, '{}'::jsonb),
    false
  );
  return new;
end;
$$;

create or replace function public.sync_catalog_track_to_electronic_v2()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  v_metadata jsonb := coalesce(new.metadata, '{}'::jsonb);
  v_gate_passed boolean := new.status = 'published'
    and lower(coalesce(new.metadata->>'electronic_gate', '')) = 'passed';
  v_artist_id uuid;
  v_recording_id uuid;
  v_identity_key text := public.catalog_key(new.artist || '__' || new.song);
  v_recording_status text;
  v_confidence numeric;
  v_source text := coalesce(nullif(trim(coalesce(new.source, '')), ''), 'catalog_v1');
  v_link record;
  v_external record;
begin
  if v_identity_key is null then
    return new;
  end if;

  v_recording_status := case
    when new.status = 'hidden' then 'blocked'
    when v_gate_passed then 'recommendable'
    when new.status = 'published' then 'verified'
    else 'needs_review'
  end;
  v_confidence := public.electronic_confidence(
    v_metadata->>'confidence',
    case
      when v_recording_status = 'recommendable' then 0.95
      when v_recording_status = 'verified' then 0.7
      else 0.3
    end
  );

  v_artist_id := public.upsert_electronic_artist_from_catalog(
    new.style,
    new.artist,
    new.country,
    new.city,
    new.artist_bio,
    new.artist_genre,
    new.artist_profile_hint,
    new.status,
    v_source,
    new.source_url,
    v_metadata,
    v_gate_passed
  );

  insert into public.electronic_recordings (
    primary_artist_id,
    title,
    identity_key,
    isrc,
    release_title,
    label,
    release_date,
    duration_sec,
    bpm_exact,
    recording_status,
    verification_confidence,
    metadata
  )
  values (
    v_artist_id,
    trim(new.song),
    v_identity_key,
    nullif(trim(coalesce(v_metadata->>'isrc', '')), ''),
    nullif(trim(coalesce(v_metadata->>'release_title', v_metadata->>'album', '')), ''),
    nullif(trim(coalesce(new.label, '')), ''),
    new.release_date,
    new.duration_sec,
    case when new.bpm_exact > 0 then new.bpm_exact else null end,
    v_recording_status,
    v_confidence,
    v_metadata || jsonb_build_object('catalog_v1_track_id', new.id, 'catalog_v1_style', new.style)
  )
  on conflict (identity_key) do update
    set primary_artist_id = excluded.primary_artist_id,
        isrc = coalesce(excluded.isrc, public.electronic_recordings.isrc),
        release_title = coalesce(excluded.release_title, public.electronic_recordings.release_title),
        label = coalesce(excluded.label, public.electronic_recordings.label),
        release_date = coalesce(excluded.release_date, public.electronic_recordings.release_date),
        duration_sec = coalesce(excluded.duration_sec, public.electronic_recordings.duration_sec),
        bpm_exact = coalesce(excluded.bpm_exact, public.electronic_recordings.bpm_exact),
        recording_status = public.merge_electronic_status(
          public.electronic_recordings.recording_status,
          excluded.recording_status
        ),
        verification_confidence = greatest(
          public.electronic_recordings.verification_confidence,
          excluded.verification_confidence
        ),
        metadata = public.electronic_recordings.metadata || excluded.metadata
  returning id into v_recording_id;

  insert into public.electronic_recording_genres (
    recording_id,
    genre_slug,
    confidence,
    assertion_status,
    source,
    source_url,
    metadata
  )
  values (
    v_recording_id,
    new.style,
    v_confidence,
    case when v_gate_passed then 'verified' else 'candidate' end,
    v_source,
    new.source_url,
    v_metadata
  )
  on conflict (recording_id, genre_slug, source_key) do update
    set confidence = greatest(public.electronic_recording_genres.confidence, excluded.confidence),
        assertion_status = case
          when excluded.assertion_status = 'verified' then 'verified'
          else public.electronic_recording_genres.assertion_status
        end,
        source_url = coalesce(excluded.source_url, public.electronic_recording_genres.source_url),
        metadata = public.electronic_recording_genres.metadata || excluded.metadata;

  for v_external in
    select * from (values
      ('musicbrainz', coalesce(v_metadata->>'musicbrainz_recording_id', v_metadata->>'recording_mbid'), v_metadata->>'musicbrainz_recording_url'),
      ('isrc', v_metadata->>'isrc', null),
      ('spotify', v_metadata->>'spotify_track_id', v_metadata->>'spotify_track_url'),
      ('deezer', v_metadata->>'deezer_track_id', v_metadata->>'deezer_track_url'),
      ('discogs', v_metadata->>'discogs_release_id', v_metadata->>'discogs_release_url')
    ) as external_ids(provider, external_id, external_url)
  loop
    if nullif(trim(coalesce(v_external.external_id, '')), '') is not null then
      insert into public.electronic_recording_external_ids (
        recording_id, provider, external_id, external_url, source, metadata
      )
      values (
        v_recording_id,
        v_external.provider,
        trim(v_external.external_id),
        nullif(trim(coalesce(v_external.external_url, '')), ''),
        v_source,
        jsonb_build_object('imported_from', 'catalog_v1')
      )
      on conflict (recording_id, provider) do update
        set external_id = excluded.external_id,
            external_url = coalesce(excluded.external_url, public.electronic_recording_external_ids.external_url),
            source = excluded.source,
            metadata = public.electronic_recording_external_ids.metadata || excluded.metadata;
    end if;
  end loop;

  for v_link in
    select * from (values
      ('preview', new.preview_url, 'preview'),
      ('spotify', coalesce(v_metadata->>'spotify_track_url', v_metadata->>'spotify_url'), 'external'),
      ('youtube', coalesce(v_metadata->>'youtube_track_url', v_metadata->>'youtube_url'), 'embed'),
      ('soundcloud', coalesce(v_metadata->>'soundcloud_track_url', v_metadata->>'soundcloud_url'), 'embed'),
      ('bandcamp', coalesce(v_metadata->>'bandcamp_track_url', v_metadata->>'bandcamp_url'), 'embed'),
      ('beatport', v_metadata->>'beatport_url', 'external'),
      ('deezer', v_metadata->>'deezer_track_url', 'refreshable_preview')
    ) as playback(provider, url, link_type)
  loop
    if nullif(trim(coalesce(v_link.url, '')), '') is not null then
      insert into public.electronic_playback_links (
        recording_id, provider, url, link_type, is_active, rights_note, metadata
      )
      values (
        v_recording_id,
        v_link.provider,
        trim(v_link.url),
        v_link.link_type,
        v_gate_passed,
        coalesce(v_metadata->>'rights_note', 'External provider link; provider terms apply.'),
        jsonb_build_object('source', v_source)
      )
      on conflict (recording_id, provider, url) do update
        set link_type = excluded.link_type,
            is_active = excluded.is_active,
            rights_note = excluded.rights_note,
            metadata = public.electronic_playback_links.metadata || excluded.metadata;
    end if;
  end loop;

  insert into public.electronic_source_assertions (
    assertion_key,
    entity_type,
    entity_id,
    field_name,
    asserted_value,
    source,
    source_url,
    source_license,
    confidence,
    metadata
  )
  values (
    md5(concat_ws('|', 'recording', v_recording_id::text, new.style, v_source)),
    'recording',
    v_recording_id,
    'electronic_recording',
    jsonb_build_object(
      'style', new.style,
      'gate', coalesce(v_metadata->>'electronic_gate', 'unreviewed'),
      'status', v_recording_status
    ),
    v_source,
    new.source_url,
    nullif(trim(coalesce(v_metadata->>'source_license', '')), ''),
    v_confidence,
    v_metadata
  )
  on conflict (assertion_key) do update
    set asserted_value = excluded.asserted_value,
        source_url = coalesce(excluded.source_url, public.electronic_source_assertions.source_url),
        source_license = coalesce(excluded.source_license, public.electronic_source_assertions.source_license),
        confidence = greatest(public.electronic_source_assertions.confidence, excluded.confidence),
        retrieved_at = now(),
        metadata = public.electronic_source_assertions.metadata || excluded.metadata;

  if v_gate_passed then
    update public.electronic_catalog_quarantine
      set review_status = 'resolved'
      where entity_type = 'recording'
        and entity_key = v_identity_key
        and review_status = 'pending';
  else
    insert into public.electronic_catalog_quarantine (
      entity_type, entity_key, reason_code, reason_detail, source, payload
    )
    values (
      'recording',
      v_identity_key,
      coalesce(nullif(v_metadata->>'electronic_gate_reason', ''), 'recording_not_recommendable'),
      coalesce(v_metadata->>'electronic_gate_detail', 'Recording is stored but excluded from recommendations.'),
      v_source,
      jsonb_build_object(
        'artist', new.artist,
        'song', new.song,
        'style', new.style,
        'metadata', v_metadata
      )
    )
    on conflict (entity_type, entity_key, reason_code) do update
      set reason_detail = excluded.reason_detail,
          source = excluded.source,
          payload = excluded.payload,
          review_status = 'pending';
  end if;

  return new;
end;
$$;

drop trigger if exists sync_catalog_artist_to_electronic_v2 on public.catalog_artists;
create trigger sync_catalog_artist_to_electronic_v2
  after insert or update on public.catalog_artists
  for each row execute function public.sync_catalog_artist_to_electronic_v2();

drop trigger if exists sync_catalog_track_to_electronic_v2 on public.catalog_tracks;
create trigger sync_catalog_track_to_electronic_v2
  after insert or update on public.catalog_tracks
  for each row execute function public.sync_catalog_track_to_electronic_v2();

-- Backfill rows that existed before this migration. Subsequent writes are kept
-- in sync by the triggers above.
update public.catalog_artists
  set metadata = coalesce(metadata, '{}'::jsonb);
update public.catalog_tracks
  set metadata = coalesce(metadata, '{}'::jsonb);

create or replace view public.electronic_subgenre_catalog_report
with (security_invoker = true)
as
with artist_counts as (
  select
    ag.genre_slug,
    count(distinct ag.artist_id) filter (where ag.assertion_status <> 'rejected') as stored_artists,
    count(distinct ag.artist_id) filter (
      where a.electronic_status in ('verified', 'recommendable')
        and ag.assertion_status = 'verified'
    ) as verified_artists
  from public.electronic_artist_genres ag
  join public.electronic_artists a on a.id = ag.artist_id
  group by ag.genre_slug
), recording_counts as (
  select
    rg.genre_slug,
    count(distinct r.primary_artist_id) filter (
      where r.recording_status = 'recommendable'
        and rg.assertion_status = 'verified'
    ) as recommendable_artists,
    count(distinct rg.recording_id) filter (
      where r.recording_status = 'recommendable'
        and rg.assertion_status = 'verified'
    ) as recommendable_recordings
  from public.electronic_recording_genres rg
  join public.electronic_recordings r on r.id = rg.recording_id
  group by rg.genre_slug
)
select
  g.slug,
  g.display_name,
  coalesce(a.stored_artists, 0) as stored_artists,
  coalesce(a.verified_artists, 0) as verified_artists,
  coalesce(r.recommendable_artists, 0) as recommendable_artists,
  coalesce(r.recommendable_recordings, 0) as recommendable_recordings
from public.electronic_genres g
left join artist_counts a on a.genre_slug = g.slug
left join recording_counts r on r.genre_slug = g.slug
where g.is_electronic = true
  and g.status <> 'deprecated';

alter table public.electronic_artists enable row level security;
alter table public.electronic_artist_aliases enable row level security;
alter table public.electronic_artist_external_ids enable row level security;
alter table public.electronic_genres enable row level security;
alter table public.electronic_artist_genres enable row level security;
alter table public.electronic_recordings enable row level security;
alter table public.electronic_recording_external_ids enable row level security;
alter table public.electronic_recording_genres enable row level security;
alter table public.electronic_playback_links enable row level security;
alter table public.electronic_source_assertions enable row level security;
alter table public.electronic_ingestion_runs enable row level security;
alter table public.electronic_catalog_quarantine enable row level security;

drop policy if exists "Verified electronic artists are public" on public.electronic_artists;
create policy "Verified electronic artists are public" on public.electronic_artists
  for select using (electronic_status in ('verified', 'recommendable'));

drop policy if exists "Public aliases follow artist visibility" on public.electronic_artist_aliases;
create policy "Public aliases follow artist visibility" on public.electronic_artist_aliases
  for select using (exists (
    select 1 from public.electronic_artists a
    where a.id = artist_id
      and a.electronic_status in ('verified', 'recommendable')
  ));

drop policy if exists "Public artist IDs follow artist visibility" on public.electronic_artist_external_ids;
create policy "Public artist IDs follow artist visibility" on public.electronic_artist_external_ids
  for select using (exists (
    select 1 from public.electronic_artists a
    where a.id = artist_id
      and a.electronic_status in ('verified', 'recommendable')
  ));

drop policy if exists "Electronic genre taxonomy is public" on public.electronic_genres;
create policy "Electronic genre taxonomy is public" on public.electronic_genres
  for select using (is_electronic = true and status = 'active');

drop policy if exists "Verified artist genre assertions are public" on public.electronic_artist_genres;
create policy "Verified artist genre assertions are public" on public.electronic_artist_genres
  for select using (
    assertion_status = 'verified'
    and exists (
      select 1 from public.electronic_artists a
      where a.id = artist_id
        and a.electronic_status in ('verified', 'recommendable')
    )
  );

drop policy if exists "Recommendable electronic recordings are public" on public.electronic_recordings;
create policy "Recommendable electronic recordings are public" on public.electronic_recordings
  for select using (recording_status = 'recommendable');

drop policy if exists "Public recording IDs follow recording visibility" on public.electronic_recording_external_ids;
create policy "Public recording IDs follow recording visibility" on public.electronic_recording_external_ids
  for select using (exists (
    select 1 from public.electronic_recordings r
    where r.id = recording_id
      and r.recording_status = 'recommendable'
  ));

drop policy if exists "Verified recording genres are public" on public.electronic_recording_genres;
create policy "Verified recording genres are public" on public.electronic_recording_genres
  for select using (
    assertion_status = 'verified'
    and exists (
      select 1 from public.electronic_recordings r
      where r.id = recording_id
        and r.recording_status = 'recommendable'
    )
  );

drop policy if exists "Active playback links are public" on public.electronic_playback_links;
create policy "Active playback links are public" on public.electronic_playback_links
  for select using (
    is_active = true
    and exists (
      select 1 from public.electronic_recordings r
      where r.id = recording_id
        and r.recording_status = 'recommendable'
    )
  );

grant usage on schema public to anon, authenticated;
grant usage on schema public to service_role;
grant select, insert, update, delete on public.catalog_artists to service_role;
grant select, insert, update, delete on public.catalog_tracks to service_role;
grant select on public.electronic_artists to anon, authenticated;
grant select on public.electronic_artist_aliases to anon, authenticated;
grant select on public.electronic_artist_external_ids to anon, authenticated;
grant select on public.electronic_genres to anon, authenticated;
grant select on public.electronic_artist_genres to anon, authenticated;
grant select on public.electronic_recordings to anon, authenticated;
grant select on public.electronic_recording_external_ids to anon, authenticated;
grant select on public.electronic_recording_genres to anon, authenticated;
grant select on public.electronic_playback_links to anon, authenticated;
grant select on public.electronic_subgenre_catalog_report to authenticated;
grant select, insert, update, delete on public.electronic_artists to service_role;
grant select, insert, update, delete on public.electronic_artist_aliases to service_role;
grant select, insert, update, delete on public.electronic_artist_external_ids to service_role;
grant select, insert, update, delete on public.electronic_genres to service_role;
grant select, insert, update, delete on public.electronic_artist_genres to service_role;
grant select, insert, update, delete on public.electronic_recordings to service_role;
grant select, insert, update, delete on public.electronic_recording_external_ids to service_role;
grant select, insert, update, delete on public.electronic_recording_genres to service_role;
grant select, insert, update, delete on public.electronic_playback_links to service_role;
grant select, insert, update, delete on public.electronic_source_assertions to service_role;
grant select, insert, update, delete on public.electronic_ingestion_runs to service_role;
grant select, insert, update, delete on public.electronic_catalog_quarantine to service_role;
grant select on public.electronic_subgenre_catalog_report to service_role;

comment on table public.electronic_artists is
  'Canonical artist identities. Candidate rows are stored but never publicly recommended.';
comment on table public.electronic_recordings is
  'Canonical recordings. Only rows with recording_status=recommendable pass public RLS.';
comment on table public.electronic_source_assertions is
  'Field-level provenance and licensing metadata; intentionally not exposed to anon clients.';
comment on table public.electronic_catalog_quarantine is
  'Homonyms, non-electronic conflicts and unverified candidates awaiting review.';
