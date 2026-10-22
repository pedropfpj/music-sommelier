-- Public identity is opt-in. Musical history/DNA never belong in public profiles.
begin;

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

notify pgrst, 'reload schema';
commit;
