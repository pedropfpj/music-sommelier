-- Sonic social staging only. Refuses existing app data or Auth users.
begin;
do $$ begin
  if to_regclass('public.profiles') is not null or exists(select 1 from auth.users) then
    raise exception 'STAGING_NOT_EMPTY: use a new empty project; never run this on Sonic Search production';
  end if;
end $$;

-- 20260619010700_sonic_search_core.sql
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


-- 20260914160000_community_profile_privacy.sql
-- Public identity is opt-in. Musical history/DNA never belong in public profiles.

alter table public.profiles
  add column if not exists profile_public boolean not null default false,
  add column if not exists show_avatar boolean not null default false,
  add column if not exists show_bio boolean not null default false,
  add column if not exists show_styles boolean not null default false,
  add column if not exists avatar_path text,
  add column if not exists avatar_customized boolean not null default false;

-- Handles are case-insensitive. Legacy collisions must be resolved before activation.
create unique index if not exists profiles_username_casefold_unique
  on public.profiles (lower(username));

alter table public.profiles enable row level security;
drop policy if exists "Profiles are public" on public.profiles;
-- Preserve owner access even on installations where the old public SELECT was
-- the only permissive read policy. RESTRICTIVE policies alone grant no access.
drop policy if exists "Private profile owner access" on public.profiles;
create policy "Private profile owner access" on public.profiles
  for all to authenticated
  using ((select auth.uid()) = id) with check ((select auth.uid()) = id);
-- RESTRICTIVE also closes any legacy permissive SELECT/ALL policy for other users.
drop policy if exists "Private profile owner boundary" on public.profiles;
create policy "Private profile owner boundary" on public.profiles
  as restrictive for all to anon, authenticated
  using ((select auth.uid()) = id) with check ((select auth.uid()) = id);
revoke all on public.profiles from anon;
grant select, insert, update, delete on public.profiles to authenticated;

-- This projection deliberately has no history, email, counts, DNA, or photo path.
-- It is service-only; the authenticated API applies public visibility and signs photos.
create or replace view public.community_public_profiles with (security_barrier = true) as
select id, username, display_name,
  case when show_bio then coalesce(bio, '') else '' end as bio,
  case when show_styles then coalesce(favorite_styles, '{}'::text[]) else '{}'::text[] end as favorite_styles,
  show_avatar
from public.profiles where profile_public = true;
revoke all on public.community_public_profiles from anon, authenticated;
grant select on public.community_public_profiles to service_role;

-- Automatic sync is private; explicit community posts are a separate feature.
alter table public.activity_feed enable row level security;
drop policy if exists "Activity feed is public" on public.activity_feed;
drop policy if exists "Users read own activity" on public.activity_feed;
create policy "Users read own activity" on public.activity_feed
  for select to authenticated using ((select auth.uid()) = user_id);
drop policy if exists "Private activity owner boundary" on public.activity_feed;
create policy "Private activity owner boundary" on public.activity_feed
  as restrictive for all to anon, authenticated
  using ((select auth.uid()) = user_id) with check ((select auth.uid()) = user_id);
revoke all on public.activity_feed from anon;
grant select, insert on public.activity_feed to authenticated;
drop policy if exists "Private activity owner insert" on public.activity_feed;
create policy "Private activity owner insert" on public.activity_feed
  for insert to authenticated with check ((select auth.uid()) = user_id);

-- Close older social-MVP installations that made synced likes publicly readable.
alter table public.likes enable row level security;
drop policy if exists "Likes are public" on public.likes;
drop policy if exists "Private likes owner access" on public.likes;
create policy "Private likes owner access" on public.likes
  for all to authenticated
  using ((select auth.uid()) = user_id) with check ((select auth.uid()) = user_id);
drop policy if exists "Private likes owner boundary" on public.likes;
create policy "Private likes owner boundary" on public.likes
  as restrictive for all to anon, authenticated
  using ((select auth.uid()) = user_id) with check ((select auth.uid()) = user_id);
revoke all on public.likes from anon;
grant select, insert, update, delete on public.likes to authenticated;

-- No public URLs or browser write grants: only the server processes/uploads photos.
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('sonic-profile-avatars', 'sonic-profile-avatars', false, 524288, array['image/jpeg'])
on conflict (id) do update set public = false, file_size_limit = 524288,
  allowed_mime_types = array['image/jpeg'];
drop policy if exists "Profile avatar server boundary" on storage.objects;
create policy "Profile avatar server boundary" on storage.objects
  as restrictive for all to anon, authenticated
  using (bucket_id <> 'sonic-profile-avatars')
  with check (bucket_id <> 'sonic-profile-avatars');




-- 20260914170000_profile_edit_budget.sql
-- Durable profile limits without an additional Redis subscription.
-- Called only by the authenticated backend, never directly by a browser.

create table if not exists public.profile_edit_usage (
  user_id uuid not null references auth.users(id) on delete cascade,
  usage_day date not null,
  edit_count integer not null check (edit_count > 0),
  primary key (user_id, usage_day)
);
alter table public.profile_edit_usage enable row level security;
revoke all on public.profile_edit_usage from public, anon, authenticated;
grant select, insert, update, delete on public.profile_edit_usage to service_role;

create or replace function public.sonic_consume_profile_edit_budget(
  p_user_id uuid, p_daily_limit integer
) returns jsonb
language plpgsql security definer
set search_path = pg_catalog, public
as $$
declare
  v_day date := (clock_timestamp() at time zone 'UTC')::date;
  v_count integer;
begin
  if p_user_id is null or p_daily_limit is null or p_daily_limit < 1 or p_daily_limit > 10000 then
    raise exception 'invalid_profile_budget';
  end if;

  -- Retain at most a month of counters for this account; no listening data here.
  delete from public.profile_edit_usage where user_id = p_user_id and usage_day < v_day - 30;
  insert into public.profile_edit_usage as usage (user_id, usage_day, edit_count)
    values (p_user_id, v_day, 1)
  on conflict (user_id, usage_day) do update
    set edit_count = usage.edit_count + 1
    where usage.edit_count < p_daily_limit
  returning edit_count into v_count;

  return jsonb_build_object('allowed', v_count is not null,
    'remaining', case when v_count is null then 0 else greatest(0, p_daily_limit - v_count) end);
end;
$$;
revoke all on function public.sonic_consume_profile_edit_budget(uuid, integer) from public, anon, authenticated;
grant execute on function public.sonic_consume_profile_edit_budget(uuid, integer) to service_role;




-- 20261104000100_track_video_social.sql
-- Canonical social storage. Apply after the profile privacy migrations.
-- Never apply the historical migration in deferred-migrations.

alter table public.comments
  add column if not exists status text not null default 'visible',
  add column if not exists metadata jsonb not null default '{}'::jsonb,
  add column if not exists deleted_at timestamptz;
alter table public.comments drop constraint if exists comments_target_type_check;
alter table public.comments add constraint comments_target_type_check
  check (target_type in ('track','video','artist','dj','event','festival','news','playlist','post'));
alter table public.comments drop constraint if exists comments_status_check;
alter table public.comments add constraint comments_status_check
  check (status in ('visible','hidden','reported','deleted'));
create index if not exists comments_target_visible_idx
  on public.comments(target_type, target_key, created_at desc) where status = 'visible';

create table if not exists public.comment_reactions (
  comment_id uuid not null references public.comments(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  value smallint not null check (value in (-1,1)),
  created_at timestamptz not null default now(),
  primary key (comment_id,user_id)
);

-- Explicit community likes are separate from the private library/taste sync.
create table if not exists public.social_target_likes (
  target_type text not null check (target_type in ('track','video')),
  target_key text not null check (char_length(target_key) between 1 and 240),
  user_id uuid not null references auth.users(id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (target_type,target_key,user_id)
);
create index if not exists social_target_likes_user_idx on public.social_target_likes(user_id);

-- All social access goes through the authenticated, moderated backend.
-- Restrictive policies also defeat forgotten permissive legacy policies.
alter table public.comments enable row level security;
alter table public.comment_reactions enable row level security;
alter table public.social_target_likes enable row level security;
revoke all on public.comments, public.comment_reactions, public.social_target_likes from public, anon, authenticated;
grant all on public.comments, public.comment_reactions, public.social_target_likes to service_role;
drop policy if exists comments_backend_only on public.comments;
create policy comments_backend_only on public.comments as restrictive
  for all to anon, authenticated using(false) with check(false);
drop policy if exists reactions_backend_only on public.comment_reactions;
create policy reactions_backend_only on public.comment_reactions as restrictive
  for all to anon, authenticated using(false) with check(false);
drop policy if exists target_likes_backend_only on public.social_target_likes;
create policy target_likes_backend_only on public.social_target_likes as restrictive
  for all to anon, authenticated using(false) with check(false);

-- Idempotent writes: retries cannot toggle a like twice or duplicate a vote.
create or replace function public.sonic_target_like(
  p_user_id uuid, p_target_type text, p_target_key text, p_liked boolean default null
) returns jsonb language plpgsql set search_path = public, pg_temp as $$
begin
  if p_user_id is null or p_target_type not in ('track','video')
    or p_target_type is null or p_target_key is null
    or char_length(trim(p_target_key)) not between 1 and 240 then
    raise exception 'invalid_social_target';
  end if;
  if p_liked is true then
    insert into public.social_target_likes(target_type,target_key,user_id)
      values(p_target_type,p_target_key,p_user_id) on conflict do nothing;
  elsif p_liked is false then
    delete from public.social_target_likes where target_type=p_target_type
      and target_key=p_target_key and user_id=p_user_id;
  end if;
  return jsonb_build_object('likes', (select count(*) from public.social_target_likes
      where target_type=p_target_type and target_key=p_target_key),
    'liked', exists(select 1 from public.social_target_likes
      where target_type=p_target_type and target_key=p_target_key and user_id=p_user_id));
end;
$$;
revoke all on function public.sonic_target_like(uuid,text,text,boolean) from public, anon, authenticated;
grant execute on function public.sonic_target_like(uuid,text,text,boolean) to service_role;

create or replace function public.sonic_comment_reaction_summary(p_comment_ids uuid[], p_user_id uuid)
returns table(comment_id uuid, likes bigint, dislikes bigint, my_reaction smallint)
language sql stable set search_path = public, pg_temp as $$
  select c.id,
    count(r.user_id) filter (where r.value = 1),
    count(r.user_id) filter (where r.value = -1),
    coalesce(max(r.value) filter (where r.user_id = p_user_id),0)::smallint
  from public.comments c left join public.comment_reactions r on r.comment_id = c.id
  where c.id = any(p_comment_ids) and c.status = 'visible'
  group by c.id;
$$;
revoke all on function public.sonic_comment_reaction_summary(uuid[],uuid) from public, anon, authenticated;
grant execute on function public.sonic_comment_reaction_summary(uuid[],uuid) to service_role;



-- 20261105000200_explicit_musical_preferences.sql
-- Explicit choices belong to the profile; inferred listening taste stays private.

alter table public.profiles
  add column if not exists musical_preferences text[] not null default '{}'::text[];
do $$ begin
  if not exists (select 1 from pg_constraint where conname='profiles_preferences_limit' and conrelid='public.profiles'::regclass) then
    alter table public.profiles add constraint profiles_preferences_limit
      check (cardinality(musical_preferences) <= 12 and array_position(musical_preferences, null) is null);
  end if;
end $$;

-- Normalize new/changed handles server-side without rewriting legacy identities.
create or replace function public.sonic_normalize_profile_username()
returns trigger language plpgsql set search_path = public, pg_temp as $$
begin
  new.username := lower(trim(new.username));
  if new.username is null or new.username !~ '^[a-z0-9][a-z0-9_]{2,29}$' then
    raise exception 'invalid_username' using errcode = '23514';
  end if;
  return new;
end;
$$;
drop trigger if exists sonic_profile_username on public.profiles;
create trigger sonic_profile_username before insert or update of username on public.profiles
  for each row execute function public.sonic_normalize_profile_username();

-- No backfill from favorite_styles: existing users did not choose to publish them.
create or replace view public.community_public_profiles with (security_barrier = true) as
select id, username, display_name,
  case when show_bio then coalesce(bio, '') else '' end as bio,
  case when show_styles then musical_preferences else '{}'::text[] end as favorite_styles,
  show_avatar
from public.profiles where profile_public = true;
revoke all on public.community_public_profiles from public, anon, authenticated;
grant select on public.community_public_profiles to service_role;



-- 20261105000300_comment_request_idempotency.sql
-- A retry after a lost HTTP response must not post the same comment twice.

alter table public.comments add column if not exists client_request_id uuid;
create unique index if not exists comments_client_request_unique
  on public.comments(user_id, client_request_id);



-- 20261105000400_public_profile_links.sql
-- Community-only consent is not permission for anonymous publication.

alter table public.profiles add column if not exists profile_link_public boolean not null default false;
do $$ begin
  if not exists(select 1 from pg_constraint where conname='profile_public_link_visibility' and conrelid='public.profiles'::regclass) then
    alter table public.profiles add constraint profile_public_link_visibility check(not profile_link_public or profile_public);
  end if;
end $$;
-- Deliberately no backfill: existing community profiles keep their old audience.



-- 20261105000500_social_request_budget.sql
-- Account-bound durable limits using the existing database, without Redis.

create table if not exists public.social_request_usage (
  user_id uuid not null references auth.users(id) on delete cascade,
  usage_day date not null,
  request_count integer not null check (request_count > 0),
  primary key (user_id, usage_day)
);
alter table public.social_request_usage enable row level security;
revoke all on public.social_request_usage from public, anon, authenticated;
grant select, insert, update, delete on public.social_request_usage to service_role;
create or replace function public.sonic_consume_social_request_budget(p_user_id uuid, p_daily_limit integer)
returns jsonb language plpgsql security definer set search_path = pg_catalog, public as $$
declare
  v_day date := (clock_timestamp() at time zone 'UTC')::date;
  v_count integer;
begin
  if p_user_id is null or p_daily_limit is null or p_daily_limit < 1 or p_daily_limit > 10000 then
    raise exception 'invalid_social_budget';
  end if;
  delete from public.social_request_usage where user_id = p_user_id and usage_day < v_day - 30;
  insert into public.social_request_usage as usage (user_id, usage_day, request_count)
    values (p_user_id, v_day, 1)
  on conflict (user_id, usage_day) do update set request_count = usage.request_count + 1
    where usage.request_count < p_daily_limit returning request_count into v_count;
  return jsonb_build_object('allowed',v_count is not null,'remaining',
    case when v_count is null then 0 else greatest(0,p_daily_limit-v_count) end);
end;
$$;
revoke all on function public.sonic_consume_social_request_budget(uuid,integer) from public,anon,authenticated;
grant execute on function public.sonic_consume_social_request_budget(uuid,integer) to service_role;



-- The new project disables automatic grants. Grant only the existing private
-- browser-sync tables; their owner-only RLS is installed by the core schema.
grant usage on schema public to anon, authenticated, service_role;
grant all on all tables in schema public to service_role;
grant select,insert,update,delete on public.track_feedback,public.feedback_events,public.taste_snapshots,public.spirit_profiles,public.spirit_cards to authenticated;
notify pgrst, 'reload schema';
commit;
