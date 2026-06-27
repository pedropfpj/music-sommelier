-- Sonic Search social comments v2.
-- Adds durable reactions and moderation-ready fields for track/artist/DJ discussions.

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

alter table public.comments
  drop constraint if exists comments_target_type_check,
  drop constraint if exists comments_body_check,
  drop constraint if exists comments_status_check;

alter table public.comments
  add column if not exists parent_comment_id uuid references public.comments(id) on delete cascade,
  add column if not exists status text not null default 'visible',
  add column if not exists metadata jsonb not null default '{}'::jsonb,
  add column if not exists deleted_at timestamptz;

alter table public.comments
  add constraint comments_target_type_check
    check (target_type in ('track', 'artist', 'dj', 'event', 'news', 'playlist')),
  add constraint comments_body_check
    check (char_length(trim(body)) between 1 and 1200),
  add constraint comments_status_check
    check (status in ('visible', 'hidden', 'reported', 'deleted'));

create table if not exists public.comment_reactions (
  id uuid primary key default gen_random_uuid(),
  comment_id uuid not null references public.comments(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  value smallint not null check (value in (-1, 1)),
  created_at timestamptz default now(),
  updated_at timestamptz default now(),
  unique (comment_id, user_id)
);

create table if not exists public.comment_reports (
  id uuid primary key default gen_random_uuid(),
  comment_id uuid not null references public.comments(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  reason text,
  created_at timestamptz default now(),
  unique (comment_id, user_id)
);

create index if not exists comments_target_created_idx
  on public.comments (target_type, target_key, created_at desc)
  where status = 'visible';
create index if not exists comments_user_created_idx
  on public.comments (user_id, created_at desc);
create index if not exists comment_reactions_comment_idx
  on public.comment_reactions (comment_id);
create index if not exists comment_reactions_user_idx
  on public.comment_reactions (user_id, created_at desc);
create index if not exists comment_reports_comment_idx
  on public.comment_reports (comment_id);

drop trigger if exists set_comment_reactions_updated_at on public.comment_reactions;
create trigger set_comment_reactions_updated_at
  before update on public.comment_reactions
  for each row execute function public.set_updated_at();

alter table public.comment_reactions enable row level security;
alter table public.comment_reports enable row level security;

drop policy if exists "Comment reactions are public" on public.comment_reactions;
drop policy if exists "Users manage own comment reactions" on public.comment_reactions;
drop policy if exists "Users manage own comment reports" on public.comment_reports;
drop policy if exists "Comments are public" on public.comments;

create policy "Comments are public" on public.comments
  for select using (status = 'visible');

create policy "Comment reactions are public" on public.comment_reactions
  for select using (true);

create policy "Users manage own comment reactions" on public.comment_reactions
  for all using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create policy "Users manage own comment reports" on public.comment_reports
  for all using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

grant usage on schema public to anon, authenticated;
grant select on public.comments to anon, authenticated;
grant select on public.comment_reactions to anon, authenticated;
grant insert, update, delete on public.comments to authenticated;
grant insert, update, delete on public.comment_reactions to authenticated;
grant insert on public.comment_reports to authenticated;
