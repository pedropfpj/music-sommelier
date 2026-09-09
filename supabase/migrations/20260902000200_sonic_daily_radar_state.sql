-- Cross-device state for the Premium daily track radar.
-- Clients read/write through the trusted API; service_role remains the only writer.

create table if not exists public.sonic_daily_radar_state (
  user_id uuid primary key references auth.users(id) on delete cascade,
  state jsonb not null default '{"version":1,"history":[],"feedback":[]}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  check (jsonb_typeof(state) = 'object'),
  check (pg_column_size(state) <= 1000000)
);

drop trigger if exists set_sonic_daily_radar_state_updated_at on public.sonic_daily_radar_state;
create trigger set_sonic_daily_radar_state_updated_at
  before update on public.sonic_daily_radar_state
  for each row execute function public.set_updated_at();

alter table public.sonic_daily_radar_state enable row level security;

drop policy if exists "Users read own Sonic daily radar" on public.sonic_daily_radar_state;
create policy "Users read own Sonic daily radar" on public.sonic_daily_radar_state
  for select using (auth.uid() = user_id);

revoke all on public.sonic_daily_radar_state from anon, authenticated;
grant select on public.sonic_daily_radar_state to authenticated;
grant all on public.sonic_daily_radar_state to service_role;

notify pgrst, 'reload schema';
