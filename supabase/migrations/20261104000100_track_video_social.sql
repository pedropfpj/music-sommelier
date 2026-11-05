-- Canonical social storage. Apply after the profile privacy migrations.
-- Never apply the historical migration in deferred-migrations.
begin;

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
notify pgrst, 'reload schema';
commit;
