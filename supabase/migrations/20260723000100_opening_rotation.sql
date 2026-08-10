-- Durable global rotation for the first music card shown on each app open.
-- Only the backend service role can advance or inspect the counter.

create table if not exists public.sonic_opening_rotation (
  id text primary key,
  counter bigint not null default 0,
  updated_at timestamptz not null default now(),
  constraint sonic_opening_rotation_id_length
    check (char_length(id) between 1 and 80),
  constraint sonic_opening_rotation_counter_nonnegative
    check (counter >= 0)
);

revoke all on table public.sonic_opening_rotation from public, anon, authenticated;
grant select, insert, update on table public.sonic_opening_rotation to service_role;

create or replace function public.next_sonic_opening_slot()
returns bigint
language plpgsql
security definer
set search_path = public
as $$
declare
  assigned_slot bigint;
begin
  insert into public.sonic_opening_rotation (id, counter, updated_at)
  values ('global-v3', 1, now())
  on conflict (id) do update
    set counter = public.sonic_opening_rotation.counter + 1,
        updated_at = now()
  returning counter - 1 into assigned_slot;

  return assigned_slot;
end;
$$;

revoke all on function public.next_sonic_opening_slot() from public, anon, authenticated;
grant execute on function public.next_sonic_opening_slot() to service_role;

notify pgrst, 'reload schema';
