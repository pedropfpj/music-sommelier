-- Sonic Search database v1.
-- Run in Supabase SQL Editor or with Supabase CLI.
-- Scope: user profiles, feedback sync, musical archetype, and social MVP.

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

create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  username text unique not null,
  display_name text not null,
  avatar_url text,
  bio text,
  favorite_styles text[] default '{}',
  sonic_dna jsonb default '{}'::jsonb,
  liked_track_count integer default 0,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

alter table public.profiles
  add column if not exists avatar_url text,
  add column if not exists bio text,
  add column if not exists favorite_styles text[] default '{}',
  add column if not exists sonic_dna jsonb default '{}'::jsonb,
  add column if not exists liked_track_count integer default 0,
  add column if not exists created_at timestamptz default now(),
  add column if not exists updated_at timestamptz default now();

create table if not exists public.track_feedback (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  target_key text not null,
  sentiment text not null check (sentiment in ('liked', 'disliked', 'skipped', 'known', 'rated')),
  artist text,
  song text,
  style text,
  rating integer check (rating between 1 and 5),
  reason text,
  source text,
  metadata jsonb default '{}'::jsonb,
  first_seen_at timestamptz default now(),
  updated_at timestamptz default now(),
  unique (user_id, target_key)
);

create table if not exists public.feedback_events (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  event_type text not null,
  target_type text not null default 'track',
  target_key text,
  artist text,
  song text,
  style text,
  rating integer check (rating between 1 and 5),
  reason text,
  source text,
  metadata jsonb default '{}'::jsonb,
  created_at timestamptz default now()
);

create table if not exists public.taste_snapshots (
  user_id uuid primary key references auth.users(id) on delete cascade,
  profile_key text,
  preferences jsonb default '{}'::jsonb,
  progress jsonb default '{}'::jsonb,
  collectible jsonb default '{}'::jsonb,
  art_seed text,
  schema_version integer not null default 1,
  client_updated_at timestamptz,
  updated_at timestamptz default now()
);

create table if not exists public.spirit_profiles (
  user_id uuid primary key references auth.users(id) on delete cascade,
  spirit_id text,
  spirit_name text,
  archetype text,
  unlocked boolean not null default false,
  liked_track_count integer not null default 0,
  last_reviewed_song_likes integer not null default 0,
  signals jsonb default '{}'::jsonb,
  collectible jsonb default '{}'::jsonb,
  share_slug text unique,
  updated_at timestamptz default now()
);

create table if not exists public.spirit_cards (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  spirit_id text,
  image_url text,
  storage_path text,
  prompt_version text,
  local_version text,
  metadata jsonb default '{}'::jsonb,
  created_at timestamptz default now()
);

create table if not exists public.likes (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  target_type text not null check (target_type in ('track', 'artist', 'event')),
  target_key text not null,
  artist text,
  song text,
  style text,
  source text,
  metadata jsonb default '{}'::jsonb,
  created_at timestamptz default now(),
  unique (user_id, target_type, target_key)
);

create table if not exists public.follows (
  follower_id uuid not null references auth.users(id) on delete cascade,
  following_id uuid not null references auth.users(id) on delete cascade,
  created_at timestamptz default now(),
  primary key (follower_id, following_id),
  check (follower_id <> following_id)
);

create table if not exists public.comments (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  target_type text not null check (target_type in ('track', 'artist', 'event')),
  target_key text not null,
  body text not null check (char_length(body) between 1 and 800),
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create table if not exists public.activity_feed (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  activity_type text not null,
  target_type text,
  target_key text,
  artist text,
  song text,
  style text,
  metadata jsonb default '{}'::jsonb,
  created_at timestamptz default now()
);

create table if not exists public.event_rsvps (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  event_key text not null,
  artist text,
  event_name text,
  event_date timestamptz,
  status text not null check (status in ('interested', 'going')),
  metadata jsonb default '{}'::jsonb,
  created_at timestamptz default now(),
  unique (user_id, event_key)
);

create table if not exists public.user_recommendations (
  id uuid primary key default gen_random_uuid(),
  sender_id uuid not null references auth.users(id) on delete cascade,
  receiver_id uuid not null references auth.users(id) on delete cascade,
  target_type text not null check (target_type in ('track', 'artist', 'event')),
  target_key text not null,
  note text,
  metadata jsonb default '{}'::jsonb,
  created_at timestamptz default now()
);

create index if not exists track_feedback_user_updated_idx
  on public.track_feedback (user_id, updated_at desc);
create index if not exists feedback_events_user_created_idx
  on public.feedback_events (user_id, created_at desc);
create index if not exists activity_feed_created_idx
  on public.activity_feed (created_at desc);
create index if not exists likes_user_created_idx
  on public.likes (user_id, created_at desc);
create index if not exists spirit_cards_user_created_idx
  on public.spirit_cards (user_id, created_at desc);

drop trigger if exists set_profiles_updated_at on public.profiles;
create trigger set_profiles_updated_at
  before update on public.profiles
  for each row execute function public.set_updated_at();

drop trigger if exists set_track_feedback_updated_at on public.track_feedback;
create trigger set_track_feedback_updated_at
  before update on public.track_feedback
  for each row execute function public.set_updated_at();

drop trigger if exists set_taste_snapshots_updated_at on public.taste_snapshots;
create trigger set_taste_snapshots_updated_at
  before update on public.taste_snapshots
  for each row execute function public.set_updated_at();

drop trigger if exists set_spirit_profiles_updated_at on public.spirit_profiles;
create trigger set_spirit_profiles_updated_at
  before update on public.spirit_profiles
  for each row execute function public.set_updated_at();

drop trigger if exists set_comments_updated_at on public.comments;
create trigger set_comments_updated_at
  before update on public.comments
  for each row execute function public.set_updated_at();

alter table public.profiles enable row level security;
alter table public.track_feedback enable row level security;
alter table public.feedback_events enable row level security;
alter table public.taste_snapshots enable row level security;
alter table public.spirit_profiles enable row level security;
alter table public.spirit_cards enable row level security;
alter table public.likes enable row level security;
alter table public.follows enable row level security;
alter table public.comments enable row level security;
alter table public.activity_feed enable row level security;
alter table public.event_rsvps enable row level security;
alter table public.user_recommendations enable row level security;

drop policy if exists "Profiles are public" on public.profiles;
drop policy if exists "Users manage own profile" on public.profiles;
drop policy if exists "Users manage own track feedback" on public.track_feedback;
drop policy if exists "Users manage own feedback events" on public.feedback_events;
drop policy if exists "Users manage own taste snapshot" on public.taste_snapshots;
drop policy if exists "Users manage own spirit profile" on public.spirit_profiles;
drop policy if exists "Users manage own spirit cards" on public.spirit_cards;
drop policy if exists "Likes are public" on public.likes;
drop policy if exists "Users manage own likes" on public.likes;
drop policy if exists "Follows are public" on public.follows;
drop policy if exists "Users manage own follows" on public.follows;
drop policy if exists "Comments are public" on public.comments;
drop policy if exists "Users manage own comments" on public.comments;
drop policy if exists "Activity feed is public" on public.activity_feed;
drop policy if exists "Users create own activity" on public.activity_feed;
drop policy if exists "Event RSVPs are public" on public.event_rsvps;
drop policy if exists "Users manage own event RSVPs" on public.event_rsvps;
drop policy if exists "Users read own recommendations" on public.user_recommendations;
drop policy if exists "Users send recommendations" on public.user_recommendations;

create policy "Profiles are public" on public.profiles
  for select using (true);

create policy "Users manage own profile" on public.profiles
  for all using (auth.uid() = id)
  with check (auth.uid() = id);

create policy "Users manage own track feedback" on public.track_feedback
  for all using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create policy "Users manage own feedback events" on public.feedback_events
  for all using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create policy "Users manage own taste snapshot" on public.taste_snapshots
  for all using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create policy "Users manage own spirit profile" on public.spirit_profiles
  for all using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create policy "Users manage own spirit cards" on public.spirit_cards
  for all using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create policy "Users manage own likes" on public.likes
  for all using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create policy "Follows are public" on public.follows
  for select using (true);

create policy "Users manage own follows" on public.follows
  for all using (auth.uid() = follower_id)
  with check (auth.uid() = follower_id);

create policy "Comments are public" on public.comments
  for select using (true);

create policy "Users manage own comments" on public.comments
  for all using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create policy "Activity feed is public" on public.activity_feed
  for select using (true);

create policy "Users create own activity" on public.activity_feed
  for insert with check (auth.uid() = user_id);

create policy "Event RSVPs are public" on public.event_rsvps
  for select using (true);

create policy "Users manage own event RSVPs" on public.event_rsvps
  for all using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create policy "Users read own recommendations" on public.user_recommendations
  for select using (auth.uid() = sender_id or auth.uid() = receiver_id);

create policy "Users send recommendations" on public.user_recommendations
  for insert with check (auth.uid() = sender_id);
