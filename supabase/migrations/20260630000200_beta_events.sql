-- Sonic Search private beta analytics.
-- Stores anonymous product events for beta readiness checks.

create extension if not exists pgcrypto;

create table if not exists public.beta_events (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  event_name text not null,
  session_id text,
  source text,
  page_url text,
  client_hash text,
  user_agent text,
  payload jsonb not null default '{}'::jsonb
);

do $$
begin
  if not exists (
    select 1
    from pg_constraint
    where conname = 'beta_events_event_name_length'
  ) then
    alter table public.beta_events
      add constraint beta_events_event_name_length
      check (char_length(event_name) between 2 and 80);
  end if;
end $$;

create index if not exists beta_events_created_at_idx
  on public.beta_events (created_at desc);

create index if not exists beta_events_event_name_created_at_idx
  on public.beta_events (event_name, created_at desc);

create index if not exists beta_events_session_id_created_at_idx
  on public.beta_events (session_id, created_at desc);

grant usage on schema public to service_role;
grant select, insert on public.beta_events to service_role;

notify pgrst, 'reload schema';
