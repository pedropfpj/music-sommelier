-- Additive foundation for app_session_started analytics schema v2.
-- Historical v1 rows remain unchanged and all new columns stay nullable.

alter table public.beta_events
  add column if not exists event_id uuid,
  add column if not exists anonymous_id uuid,
  add column if not exists user_id uuid,
  add column if not exists occurred_at timestamptz,
  add column if not exists schema_version integer,
  add column if not exists platform text,
  add column if not exists app_version text,
  add column if not exists environment text;

create unique index if not exists beta_events_event_id_v2_uidx
  on public.beta_events (event_id)
  where event_id is not null;

create unique index if not exists beta_events_app_session_v2_session_uidx
  on public.beta_events (session_id)
  where event_name = 'app_session_started'
    and schema_version = 2;

notify pgrst, 'reload schema';
