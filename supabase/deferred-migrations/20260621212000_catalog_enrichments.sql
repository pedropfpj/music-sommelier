-- Sonic Search catalog enrichments v1.
-- Stores useful server-side API enrichments so the app depends less on live providers over time.

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

create table if not exists public.catalog_enrichments (
  id uuid primary key default gen_random_uuid(),
  entity_type text not null
    check (entity_type in ('artist', 'track', 'radio_style', 'style')),
  entity_key text not null,
  style text,
  artist text,
  song text,
  source text not null,
  source_url text,
  confidence numeric check (confidence is null or (confidence >= 0 and confidence <= 1)),
  payload jsonb not null default '{}'::jsonb,
  status text not null default 'published'
    check (status in ('published', 'draft', 'needs_review', 'hidden')),
  created_at timestamptz default now(),
  updated_at timestamptz default now(),
  check (char_length(trim(entity_key)) > 0),
  check (char_length(trim(source)) > 0),
  unique (entity_type, entity_key, source)
);

create index if not exists catalog_enrichments_entity_idx
  on public.catalog_enrichments (entity_type, entity_key);
create index if not exists catalog_enrichments_style_idx
  on public.catalog_enrichments (style);
create index if not exists catalog_enrichments_artist_idx
  on public.catalog_enrichments (artist);
create index if not exists catalog_enrichments_source_idx
  on public.catalog_enrichments (source);
create index if not exists catalog_enrichments_status_idx
  on public.catalog_enrichments (status);

drop trigger if exists set_catalog_enrichments_updated_at on public.catalog_enrichments;
create trigger set_catalog_enrichments_updated_at
  before update on public.catalog_enrichments
  for each row execute function public.set_updated_at();

alter table public.catalog_enrichments enable row level security;

drop policy if exists "Published catalog enrichments are public" on public.catalog_enrichments;

create policy "Published catalog enrichments are public" on public.catalog_enrichments
  for select using (status = 'published');

grant usage on schema public to anon, authenticated;
grant select on public.catalog_enrichments to anon, authenticated;
