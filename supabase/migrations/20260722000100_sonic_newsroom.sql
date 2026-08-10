-- Sonic Search newsroom: remotely managed editorial articles and public cover media.
-- Articles are written through the server-side admin API. Public clients can only
-- read articles whose publication time has arrived.

create extension if not exists pgcrypto;

create table if not exists public.news_articles (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  status text not null default 'draft'
    check (status in ('draft', 'scheduled', 'published', 'archived')),
  category text not null default 'Agenda',
  eyebrow text not null default 'Jornal Sonic',
  title text not null,
  excerpt text not null default '',
  body text not null default '',
  cover_image_url text not null default '',
  cover_image_alt text not null default '',
  image_credit text not null default '',
  author_name text not null default 'Redacao Sonic Search',
  venue_name text not null default '',
  city text not null default '',
  state text not null default '',
  event_starts_at timestamptz,
  event_ends_at timestamptz,
  lineup jsonb not null default '[]'::jsonb,
  service_info jsonb not null default '{}'::jsonb,
  ticket_url text not null default '',
  instagram_url text not null default '',
  cta_label text not null default 'Ver evento',
  is_sponsored boolean not null default false,
  disclosure text not null default '',
  published_at timestamptz,
  created_by uuid references auth.users(id) on delete set null,
  updated_by uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint news_articles_lineup_array check (jsonb_typeof(lineup) = 'array'),
  constraint news_articles_service_info_object check (jsonb_typeof(service_info) = 'object')
);

create index if not exists news_articles_publication_idx
  on public.news_articles (status, published_at desc);

create index if not exists news_articles_updated_idx
  on public.news_articles (updated_at desc);

create or replace function public.touch_news_article_updated_at()
returns trigger
language plpgsql
security invoker
set search_path = public
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists news_articles_touch_updated_at on public.news_articles;
create trigger news_articles_touch_updated_at
before update on public.news_articles
for each row execute function public.touch_news_article_updated_at();

alter table public.news_articles enable row level security;

drop policy if exists "Published Sonic news is public" on public.news_articles;
create policy "Published Sonic news is public"
on public.news_articles
for select
to anon, authenticated
using (
  status in ('published', 'scheduled')
  and published_at is not null
  and published_at <= now()
);

revoke all on public.news_articles from anon, authenticated;
grant select on public.news_articles to anon, authenticated;
grant all on public.news_articles to service_role;

-- The bucket is public for reading. Uploads still go exclusively through the
-- authenticated admin API with the Supabase service role.
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'news-media',
  'news-media',
  true,
  1572864,
  array['image/jpeg', 'image/png', 'image/webp']
)
on conflict (id) do update set
  public = excluded.public,
  file_size_limit = excluded.file_size_limit,
  allowed_mime_types = excluded.allowed_mime_types;
