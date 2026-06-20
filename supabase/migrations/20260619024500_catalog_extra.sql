-- Sonic Search catalog extra v1.
-- Adds public read tables for artists/tracks that can extend the local catalog.

create extension if not exists pgcrypto;

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

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

create table if not exists public.catalog_artists (
  id uuid primary key default gen_random_uuid(),
  style text not null,
  artist text not null,
  artist_key text generated always as (public.catalog_key(artist)) stored,
  country text,
  city text,
  artist_bio text,
  artist_genre text,
  artist_profile_hint text,
  source text,
  source_url text,
  status text not null default 'published'
    check (status in ('published', 'draft', 'needs_review', 'hidden')),
  metadata jsonb default '{}'::jsonb,
  created_at timestamptz default now(),
  updated_at timestamptz default now(),
  check (char_length(trim(style)) > 0),
  check (char_length(trim(artist)) > 0),
  unique (style, artist_key)
);

create table if not exists public.catalog_tracks (
  id uuid primary key default gen_random_uuid(),
  style text not null,
  artist text not null,
  artist_key text generated always as (public.catalog_key(artist)) stored,
  song text not null,
  track_key text generated always as (public.catalog_key(artist || '__' || song)) stored,
  label text,
  bpm_exact numeric,
  preview_url text,
  release_date date,
  duration_sec integer,
  country text,
  city text,
  artist_bio text,
  artist_genre text,
  artist_profile_hint text,
  source text,
  source_url text,
  status text not null default 'published'
    check (status in ('published', 'draft', 'needs_review', 'hidden')),
  metadata jsonb default '{}'::jsonb,
  created_at timestamptz default now(),
  updated_at timestamptz default now(),
  check (char_length(trim(style)) > 0),
  check (char_length(trim(artist)) > 0),
  check (char_length(trim(song)) > 0),
  unique (style, track_key)
);

create table if not exists public.catalog_submissions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  submission_type text not null check (submission_type in ('artist', 'track')),
  style text,
  artist text,
  song text,
  payload jsonb default '{}'::jsonb,
  status text not null default 'pending'
    check (status in ('pending', 'approved', 'rejected')),
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create index if not exists catalog_artists_style_status_idx
  on public.catalog_artists (style, status, artist);
create index if not exists catalog_artists_artist_key_idx
  on public.catalog_artists (artist_key);
create index if not exists catalog_tracks_style_status_idx
  on public.catalog_tracks (style, status, artist, song);
create index if not exists catalog_tracks_artist_key_idx
  on public.catalog_tracks (artist_key);
create index if not exists catalog_tracks_track_key_idx
  on public.catalog_tracks (track_key);
create index if not exists catalog_submissions_user_created_idx
  on public.catalog_submissions (user_id, created_at desc);

drop trigger if exists set_catalog_artists_updated_at on public.catalog_artists;
create trigger set_catalog_artists_updated_at
  before update on public.catalog_artists
  for each row execute function public.set_updated_at();

drop trigger if exists set_catalog_tracks_updated_at on public.catalog_tracks;
create trigger set_catalog_tracks_updated_at
  before update on public.catalog_tracks
  for each row execute function public.set_updated_at();

drop trigger if exists set_catalog_submissions_updated_at on public.catalog_submissions;
create trigger set_catalog_submissions_updated_at
  before update on public.catalog_submissions
  for each row execute function public.set_updated_at();

alter table public.catalog_artists enable row level security;
alter table public.catalog_tracks enable row level security;
alter table public.catalog_submissions enable row level security;

drop policy if exists "Published catalog artists are public" on public.catalog_artists;
drop policy if exists "Published catalog tracks are public" on public.catalog_tracks;
drop policy if exists "Users submit catalog suggestions" on public.catalog_submissions;
drop policy if exists "Users read own catalog submissions" on public.catalog_submissions;

create policy "Published catalog artists are public" on public.catalog_artists
  for select using (status = 'published');

create policy "Published catalog tracks are public" on public.catalog_tracks
  for select using (status = 'published');

create policy "Users submit catalog suggestions" on public.catalog_submissions
  for insert with check (auth.uid() = user_id);

create policy "Users read own catalog submissions" on public.catalog_submissions
  for select using (auth.uid() = user_id);

grant usage on schema public to anon, authenticated;
grant select on public.catalog_artists to anon, authenticated;
grant select on public.catalog_tracks to anon, authenticated;
grant select, insert on public.catalog_submissions to authenticated;
