-- Legacy social-only schema for Supabase.
-- Prefer the full database v1 migration at:
-- supabase/migrations/20260619010700_sonic_search_core.sql
--
-- Sonic Search social MVP schema for Supabase.
-- Run this in Supabase SQL Editor, then set these Vercel env vars:
-- SUPABASE_URL
-- SUPABASE_ANON_KEY
-- SONIC_SOCIAL_ENABLED=true

create extension if not exists pgcrypto;

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

alter table public.profiles enable row level security;
alter table public.likes enable row level security;
alter table public.follows enable row level security;
alter table public.comments enable row level security;
alter table public.activity_feed enable row level security;
alter table public.event_rsvps enable row level security;
alter table public.user_recommendations enable row level security;

drop policy if exists "Profiles are public" on public.profiles;
drop policy if exists "Users manage own profile" on public.profiles;
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

create policy "Likes are public" on public.likes
  for select using (true);

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
