-- Sonic Search - global electronic events database v1.
-- Separates permanent brands, dated editions and sourced measurements.

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

create table if not exists public.electronic_event_brands (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  name text not null,
  event_type text not null
    check (event_type in (
      'festival',
      'festival_series',
      'party_series',
      'citywide_program',
      'cruise_festival',
      'mixed_genre_festival'
    )),
  electronic_focus text not null
    check (electronic_focus in ('exclusive', 'primary', 'significant')),
  market_tier text not null
    check (market_tier in ('global_mega', 'global_major', 'regional_major', 'specialist_major')),
  franchise_name text,
  home_city text,
  home_country_code text,
  continent text
    check (continent is null or continent in (
      'Africa', 'Asia', 'Europe', 'North America', 'South America', 'Oceania', 'Global'
    )),
  founding_year smallint,
  official_url text,
  primary_genres text[] not null default '{}',
  selection_basis text not null,
  lifecycle_status text not null default 'active'
    check (lifecycle_status in ('active', 'paused', 'inactive', 'unknown')),
  publication_status text not null default 'draft'
    check (publication_status in ('published', 'draft', 'needs_review', 'hidden')),
  data_quality text not null default 'curated'
    check (data_quality in ('verified', 'curated', 'needs_review')),
  description text,
  notes text,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  check (slug ~ '^[a-z0-9]+(?:-[a-z0-9]+)*$'),
  check (char_length(trim(name)) > 0),
  check (home_country_code is null or home_country_code ~ '^[A-Z]{2}$'),
  check (founding_year is null or founding_year between 1900 and 2100),
  check (official_url is null or official_url ~* '^https?://')
);

create table if not exists public.electronic_event_venues (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  name text not null,
  city text not null,
  region text,
  country_code text not null,
  continent text not null
    check (continent in ('Africa', 'Asia', 'Europe', 'North America', 'South America', 'Oceania')),
  latitude numeric(9, 6),
  longitude numeric(9, 6),
  timezone text,
  capacity integer,
  official_url text,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  check (slug ~ '^[a-z0-9]+(?:-[a-z0-9]+)*$'),
  check (country_code ~ '^[A-Z]{2}$'),
  check (latitude is null or latitude between -90 and 90),
  check (longitude is null or longitude between -180 and 180),
  check (capacity is null or capacity >= 0),
  check (official_url is null or official_url ~* '^https?://')
);

create table if not exists public.electronic_event_editions (
  id uuid primary key default gen_random_uuid(),
  event_brand_id uuid not null references public.electronic_event_brands(id) on delete cascade,
  venue_id uuid references public.electronic_event_venues(id) on delete set null,
  edition_key text not null unique,
  edition_year smallint not null,
  name text not null,
  starts_on date,
  ends_on date,
  edition_status text not null default 'announced'
    check (edition_status in ('announced', 'scheduled', 'completed', 'cancelled', 'postponed', 'unknown')),
  city text,
  region text,
  country_code text,
  timezone text,
  minimum_age smallint,
  ticket_url text,
  lineup_url text,
  publication_status text not null default 'draft'
    check (publication_status in ('published', 'draft', 'needs_review', 'hidden')),
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  check (edition_key ~ '^[a-z0-9]+(?:-[a-z0-9]+)*$'),
  check (edition_year between 1900 and 2100),
  check (ends_on is null or starts_on is null or ends_on >= starts_on),
  check (country_code is null or country_code ~ '^[A-Z]{2}$'),
  check (minimum_age is null or minimum_age between 0 and 99),
  check (ticket_url is null or ticket_url ~* '^https?://'),
  check (lineup_url is null or lineup_url ~* '^https?://')
);

create table if not exists public.electronic_event_organizers (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  name text not null,
  country_code text,
  official_url text,
  parent_organization text,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  check (slug ~ '^[a-z0-9]+(?:-[a-z0-9]+)*$'),
  check (country_code is null or country_code ~ '^[A-Z]{2}$'),
  check (official_url is null or official_url ~* '^https?://')
);

create table if not exists public.electronic_event_brand_organizers (
  event_brand_id uuid not null references public.electronic_event_brands(id) on delete cascade,
  organizer_id uuid not null references public.electronic_event_organizers(id) on delete cascade,
  relationship_type text not null default 'organizer'
    check (relationship_type in ('organizer', 'promoter', 'owner', 'producer', 'partner')),
  starts_on date,
  ends_on date,
  is_current boolean not null default true,
  primary key (event_brand_id, organizer_id, relationship_type),
  check (ends_on is null or starts_on is null or ends_on >= starts_on)
);

create table if not exists public.electronic_event_genres (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  name text not null,
  family text,
  description text,
  created_at timestamptz not null default now(),
  check (slug ~ '^[a-z0-9]+(?:_[a-z0-9]+)*$')
);

create table if not exists public.electronic_event_brand_genres (
  event_brand_id uuid not null references public.electronic_event_brands(id) on delete cascade,
  genre_id uuid not null references public.electronic_event_genres(id) on delete cascade,
  is_primary boolean not null default false,
  weight numeric(4, 3),
  primary key (event_brand_id, genre_id),
  check (weight is null or weight between 0 and 1)
);

create table if not exists public.electronic_event_sources (
  id uuid primary key default gen_random_uuid(),
  source_type text not null
    check (source_type in (
      'official_event', 'organizer', 'authority', 'ticketing', 'ranking',
      'press', 'database', 'social', 'other'
    )),
  publisher text not null,
  title text not null,
  url text not null unique,
  published_on date,
  retrieved_at timestamptz not null default now(),
  is_primary boolean not null default false,
  reliability_grade text not null default 'C'
    check (reliability_grade in ('A', 'B', 'C', 'D')),
  notes text,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  check (url ~* '^https?://')
);

create table if not exists public.electronic_event_source_links (
  source_id uuid not null references public.electronic_event_sources(id) on delete cascade,
  event_brand_id uuid not null references public.electronic_event_brands(id) on delete cascade,
  edition_id uuid references public.electronic_event_editions(id) on delete cascade,
  fact_scope text not null,
  notes text,
  primary key (source_id, event_brand_id, fact_scope)
);

create table if not exists public.electronic_event_artists (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  name text not null,
  musicbrainz_id uuid,
  wikidata_id text,
  country_code text,
  catalog_artist_id uuid references public.catalog_artists(id) on delete set null,
  aliases text[] not null default '{}',
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  check (slug ~ '^[a-z0-9]+(?:-[a-z0-9]+)*$'),
  check (country_code is null or country_code ~ '^[A-Z]{2}$'),
  check (wikidata_id is null or wikidata_id ~ '^Q[0-9]+$')
);

create table if not exists public.electronic_event_lineups (
  id uuid primary key default gen_random_uuid(),
  lineup_key text not null unique,
  edition_id uuid not null references public.electronic_event_editions(id) on delete cascade,
  artist_id uuid not null references public.electronic_event_artists(id) on delete cascade,
  source_id uuid references public.electronic_event_sources(id) on delete set null,
  performance_date date,
  stage_name text,
  billing_order integer,
  is_headliner boolean not null default false,
  set_starts_at timestamptz,
  set_ends_at timestamptz,
  billing_text text,
  status text not null default 'announced'
    check (status in ('rumored', 'announced', 'confirmed', 'cancelled', 'performed')),
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  check (lineup_key ~ '^[a-z0-9]+(?:-[a-z0-9]+)*$'),
  check (billing_order is null or billing_order > 0),
  check (set_ends_at is null or set_starts_at is null or set_ends_at >= set_starts_at)
);

create table if not exists public.electronic_event_attendance_metrics (
  id uuid primary key default gen_random_uuid(),
  metric_key text not null unique,
  event_brand_id uuid not null references public.electronic_event_brands(id) on delete cascade,
  edition_id uuid references public.electronic_event_editions(id) on delete cascade,
  source_id uuid not null references public.electronic_event_sources(id) on delete restrict,
  metric_type text not null
    check (metric_type in (
      'unique_attendees', 'cumulative_entries', 'daily_average',
      'daily_peak', 'licensed_capacity', 'tickets_sold'
    )),
  metric_value numeric not null,
  metric_unit text not null default 'people',
  comparison_operator text not null default 'exact'
    check (comparison_operator in ('exact', 'at_least', 'at_most', 'approximate')),
  reference_year smallint,
  period_days integer,
  period_start date,
  period_end date,
  is_estimate boolean not null default false,
  confidence numeric(4, 3),
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  check (metric_key ~ '^[a-z0-9]+(?:-[a-z0-9]+)*$'),
  check (metric_value >= 0),
  check (reference_year is null or reference_year between 1900 and 2100),
  check (period_days is null or period_days > 0),
  check (period_end is null or period_start is null or period_end >= period_start),
  check (confidence is null or confidence between 0 and 1)
);

create table if not exists public.electronic_event_rankings (
  id uuid primary key default gen_random_uuid(),
  ranking_key text not null unique,
  event_brand_id uuid not null references public.electronic_event_brands(id) on delete cascade,
  edition_id uuid references public.electronic_event_editions(id) on delete cascade,
  source_id uuid not null references public.electronic_event_sources(id) on delete restrict,
  ranking_name text not null,
  ranking_year smallint not null,
  category text not null default 'overall',
  rank_position integer not null,
  score numeric,
  vote_count integer,
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  check (ranking_key ~ '^[a-z0-9]+(?:-[a-z0-9]+)*$'),
  check (ranking_year between 1900 and 2100),
  check (rank_position > 0),
  check (vote_count is null or vote_count >= 0),
  unique (event_brand_id, ranking_name, ranking_year, category)
);

create table if not exists public.electronic_event_ticket_prices (
  id uuid primary key default gen_random_uuid(),
  price_key text not null unique,
  event_brand_id uuid not null references public.electronic_event_brands(id) on delete cascade,
  edition_id uuid not null references public.electronic_event_editions(id) on delete cascade,
  source_id uuid not null references public.electronic_event_sources(id) on delete restrict,
  ticket_tier text not null,
  sale_phase text,
  currency_code text not null,
  face_value numeric not null,
  fee_value numeric,
  captured_on date not null default current_date,
  availability text
    check (availability is null or availability in ('announced', 'on_sale', 'sold_out', 'closed', 'unknown')),
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  check (price_key ~ '^[a-z0-9]+(?:-[a-z0-9]+)*$'),
  check (currency_code ~ '^[A-Z]{3}$'),
  check (face_value >= 0),
  check (fee_value is null or fee_value >= 0)
);

create table if not exists public.electronic_event_social_snapshots (
  id uuid primary key default gen_random_uuid(),
  snapshot_key text not null unique,
  event_brand_id uuid not null references public.electronic_event_brands(id) on delete cascade,
  source_id uuid references public.electronic_event_sources(id) on delete set null,
  platform text not null
    check (platform in ('instagram', 'tiktok', 'youtube', 'facebook', 'x', 'spotify', 'other')),
  account_handle text,
  follower_count bigint,
  subscriber_count bigint,
  view_count bigint,
  captured_on date not null,
  notes text,
  created_at timestamptz not null default now(),
  check (snapshot_key ~ '^[a-z0-9]+(?:-[a-z0-9]+)*$'),
  check (follower_count is null or follower_count >= 0),
  check (subscriber_count is null or subscriber_count >= 0),
  check (view_count is null or view_count >= 0)
);

create index if not exists electronic_event_brands_country_idx
  on public.electronic_event_brands (home_country_code, publication_status, lifecycle_status);
create index if not exists electronic_event_brands_tier_idx
  on public.electronic_event_brands (market_tier, electronic_focus);
create index if not exists electronic_event_editions_date_idx
  on public.electronic_event_editions (starts_on, ends_on);
create index if not exists electronic_event_editions_brand_year_idx
  on public.electronic_event_editions (event_brand_id, edition_year desc);
create index if not exists electronic_event_lineups_edition_idx
  on public.electronic_event_lineups (edition_id, billing_order, artist_id);
create index if not exists electronic_event_metrics_brand_idx
  on public.electronic_event_attendance_metrics (event_brand_id, reference_year desc, metric_type);
create index if not exists electronic_event_rankings_brand_idx
  on public.electronic_event_rankings (event_brand_id, ranking_year desc, rank_position);
create index if not exists electronic_event_ticket_prices_edition_idx
  on public.electronic_event_ticket_prices (edition_id, captured_on desc);
create index if not exists electronic_event_social_brand_idx
  on public.electronic_event_social_snapshots (event_brand_id, platform, captured_on desc);
create index if not exists electronic_event_source_links_brand_idx
  on public.electronic_event_source_links (event_brand_id, fact_scope);

drop trigger if exists set_electronic_event_brands_updated_at on public.electronic_event_brands;
create trigger set_electronic_event_brands_updated_at
  before update on public.electronic_event_brands
  for each row execute function public.set_updated_at();

drop trigger if exists set_electronic_event_venues_updated_at on public.electronic_event_venues;
create trigger set_electronic_event_venues_updated_at
  before update on public.electronic_event_venues
  for each row execute function public.set_updated_at();

drop trigger if exists set_electronic_event_editions_updated_at on public.electronic_event_editions;
create trigger set_electronic_event_editions_updated_at
  before update on public.electronic_event_editions
  for each row execute function public.set_updated_at();

drop trigger if exists set_electronic_event_organizers_updated_at on public.electronic_event_organizers;
create trigger set_electronic_event_organizers_updated_at
  before update on public.electronic_event_organizers
  for each row execute function public.set_updated_at();

drop trigger if exists set_electronic_event_sources_updated_at on public.electronic_event_sources;
create trigger set_electronic_event_sources_updated_at
  before update on public.electronic_event_sources
  for each row execute function public.set_updated_at();

drop trigger if exists set_electronic_event_artists_updated_at on public.electronic_event_artists;
create trigger set_electronic_event_artists_updated_at
  before update on public.electronic_event_artists
  for each row execute function public.set_updated_at();

drop trigger if exists set_electronic_event_lineups_updated_at on public.electronic_event_lineups;
create trigger set_electronic_event_lineups_updated_at
  before update on public.electronic_event_lineups
  for each row execute function public.set_updated_at();

drop trigger if exists set_electronic_event_attendance_metrics_updated_at on public.electronic_event_attendance_metrics;
create trigger set_electronic_event_attendance_metrics_updated_at
  before update on public.electronic_event_attendance_metrics
  for each row execute function public.set_updated_at();

drop trigger if exists set_electronic_event_rankings_updated_at on public.electronic_event_rankings;
create trigger set_electronic_event_rankings_updated_at
  before update on public.electronic_event_rankings
  for each row execute function public.set_updated_at();

drop trigger if exists set_electronic_event_ticket_prices_updated_at on public.electronic_event_ticket_prices;
create trigger set_electronic_event_ticket_prices_updated_at
  before update on public.electronic_event_ticket_prices
  for each row execute function public.set_updated_at();

alter table public.electronic_event_brands enable row level security;
alter table public.electronic_event_venues enable row level security;
alter table public.electronic_event_editions enable row level security;
alter table public.electronic_event_organizers enable row level security;
alter table public.electronic_event_brand_organizers enable row level security;
alter table public.electronic_event_genres enable row level security;
alter table public.electronic_event_brand_genres enable row level security;
alter table public.electronic_event_sources enable row level security;
alter table public.electronic_event_source_links enable row level security;
alter table public.electronic_event_artists enable row level security;
alter table public.electronic_event_lineups enable row level security;
alter table public.electronic_event_attendance_metrics enable row level security;
alter table public.electronic_event_rankings enable row level security;
alter table public.electronic_event_ticket_prices enable row level security;
alter table public.electronic_event_social_snapshots enable row level security;

drop policy if exists "Published electronic event brands are public" on public.electronic_event_brands;
create policy "Published electronic event brands are public" on public.electronic_event_brands
  for select using (publication_status = 'published');

drop policy if exists "Electronic event venues are public" on public.electronic_event_venues;
create policy "Electronic event venues are public" on public.electronic_event_venues
  for select using (true);

drop policy if exists "Published electronic event editions are public" on public.electronic_event_editions;
create policy "Published electronic event editions are public" on public.electronic_event_editions
  for select using (
    publication_status = 'published'
    and exists (
      select 1 from public.electronic_event_brands b
      where b.id = event_brand_id and b.publication_status = 'published'
    )
  );

drop policy if exists "Electronic event organizers are public" on public.electronic_event_organizers;
create policy "Electronic event organizers are public" on public.electronic_event_organizers
  for select using (true);

drop policy if exists "Published electronic event organizer links are public" on public.electronic_event_brand_organizers;
create policy "Published electronic event organizer links are public" on public.electronic_event_brand_organizers
  for select using (
    exists (
      select 1 from public.electronic_event_brands b
      where b.id = event_brand_id and b.publication_status = 'published'
    )
  );

drop policy if exists "Electronic event genres are public" on public.electronic_event_genres;
create policy "Electronic event genres are public" on public.electronic_event_genres
  for select using (true);

drop policy if exists "Published electronic event genre links are public" on public.electronic_event_brand_genres;
create policy "Published electronic event genre links are public" on public.electronic_event_brand_genres
  for select using (
    exists (
      select 1 from public.electronic_event_brands b
      where b.id = event_brand_id and b.publication_status = 'published'
    )
  );

drop policy if exists "Electronic event sources are public" on public.electronic_event_sources;
create policy "Electronic event sources are public" on public.electronic_event_sources
  for select using (true);

drop policy if exists "Published electronic event source links are public" on public.electronic_event_source_links;
create policy "Published electronic event source links are public" on public.electronic_event_source_links
  for select using (
    exists (
      select 1 from public.electronic_event_brands b
      where b.id = event_brand_id and b.publication_status = 'published'
    )
  );

drop policy if exists "Electronic event artists are public" on public.electronic_event_artists;
create policy "Electronic event artists are public" on public.electronic_event_artists
  for select using (true);

drop policy if exists "Published electronic event lineups are public" on public.electronic_event_lineups;
create policy "Published electronic event lineups are public" on public.electronic_event_lineups
  for select using (
    exists (
      select 1 from public.electronic_event_editions e
      join public.electronic_event_brands b on b.id = e.event_brand_id
      where e.id = edition_id
        and e.publication_status = 'published'
        and b.publication_status = 'published'
    )
  );

drop policy if exists "Published electronic event attendance is public" on public.electronic_event_attendance_metrics;
create policy "Published electronic event attendance is public" on public.electronic_event_attendance_metrics
  for select using (
    exists (
      select 1 from public.electronic_event_brands b
      where b.id = event_brand_id and b.publication_status = 'published'
    )
  );

drop policy if exists "Published electronic event rankings are public" on public.electronic_event_rankings;
create policy "Published electronic event rankings are public" on public.electronic_event_rankings
  for select using (
    exists (
      select 1 from public.electronic_event_brands b
      where b.id = event_brand_id and b.publication_status = 'published'
    )
  );

drop policy if exists "Published electronic event ticket prices are public" on public.electronic_event_ticket_prices;
create policy "Published electronic event ticket prices are public" on public.electronic_event_ticket_prices
  for select using (
    exists (
      select 1 from public.electronic_event_brands b
      where b.id = event_brand_id and b.publication_status = 'published'
    )
  );

drop policy if exists "Published electronic event social snapshots are public" on public.electronic_event_social_snapshots;
create policy "Published electronic event social snapshots are public" on public.electronic_event_social_snapshots
  for select using (
    exists (
      select 1 from public.electronic_event_brands b
      where b.id = event_brand_id and b.publication_status = 'published'
    )
  );

create or replace view public.electronic_events_directory
with (security_invoker = true)
as
select
  b.id,
  b.slug,
  b.name,
  b.event_type,
  b.electronic_focus,
  b.market_tier,
  b.franchise_name,
  b.home_city,
  b.home_country_code,
  b.continent,
  b.founding_year,
  b.official_url,
  b.selection_basis,
  b.lifecycle_status,
  coalesce(
    (
      select array_agg(g.slug order by bg.is_primary desc, g.slug)
      from public.electronic_event_brand_genres bg
      join public.electronic_event_genres g on g.id = bg.genre_id
      where bg.event_brand_id = b.id
    ),
    b.primary_genres
  ) as genres,
  (
    select r.rank_position
    from public.electronic_event_rankings r
    where r.event_brand_id = b.id
      and r.ranking_name = 'DJ Mag Top 100 Festivals'
    order by r.ranking_year desc
    limit 1
  ) as latest_djmag_rank,
  (
    select r.ranking_year
    from public.electronic_event_rankings r
    where r.event_brand_id = b.id
      and r.ranking_name = 'DJ Mag Top 100 Festivals'
    order by r.ranking_year desc
    limit 1
  ) as latest_djmag_year,
  b.data_quality,
  b.updated_at
from public.electronic_event_brands b;

comment on table public.electronic_event_brands is
  'Permanent festival, party or event-series identities. Dated occurrences belong in electronic_event_editions.';
comment on table public.electronic_event_attendance_metrics is
  'Sourced attendance facts. metric_type prevents cumulative entries from being confused with unique attendees.';
comment on table public.electronic_event_rankings is
  'External rankings such as reader polls. Rankings are not attendance measurements.';
comment on column public.electronic_event_attendance_metrics.comparison_operator is
  'Qualifies whether the stored value is exact, minimum, maximum or approximate.';

grant usage on schema public to anon, authenticated;
grant select on public.electronic_event_brands to anon, authenticated;
grant select on public.electronic_event_venues to anon, authenticated;
grant select on public.electronic_event_editions to anon, authenticated;
grant select on public.electronic_event_organizers to anon, authenticated;
grant select on public.electronic_event_brand_organizers to anon, authenticated;
grant select on public.electronic_event_genres to anon, authenticated;
grant select on public.electronic_event_brand_genres to anon, authenticated;
grant select on public.electronic_event_sources to anon, authenticated;
grant select on public.electronic_event_source_links to anon, authenticated;
grant select on public.electronic_event_artists to anon, authenticated;
grant select on public.electronic_event_lineups to anon, authenticated;
grant select on public.electronic_event_attendance_metrics to anon, authenticated;
grant select on public.electronic_event_rankings to anon, authenticated;
grant select on public.electronic_event_ticket_prices to anon, authenticated;
grant select on public.electronic_event_social_snapshots to anon, authenticated;
grant select on public.electronic_events_directory to anon, authenticated;
