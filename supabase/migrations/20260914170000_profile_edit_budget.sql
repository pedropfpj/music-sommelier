-- Durable profile limits without an additional Redis subscription.
-- Called only by the authenticated backend, never directly by a browser.
begin;

create table if not exists public.profile_edit_usage (
  user_id uuid not null references auth.users(id) on delete cascade,
  usage_day date not null,
  edit_count integer not null check (edit_count > 0),
  primary key (user_id, usage_day)
);
alter table public.profile_edit_usage enable row level security;
revoke all on public.profile_edit_usage from public, anon, authenticated;
grant select, insert, update, delete on public.profile_edit_usage to service_role;

create or replace function public.sonic_consume_profile_edit_budget(
  p_user_id uuid, p_daily_limit integer
) returns jsonb
language plpgsql security definer
set search_path = pg_catalog, public
as $$
declare
  v_day date := (clock_timestamp() at time zone 'UTC')::date;
  v_count integer;
begin
  if p_user_id is null or p_daily_limit is null or p_daily_limit < 1 or p_daily_limit > 10000 then
    raise exception 'invalid_profile_budget';
  end if;

  -- Retain at most a month of counters for this account; no listening data here.
  delete from public.profile_edit_usage where user_id = p_user_id and usage_day < v_day - 30;
  insert into public.profile_edit_usage as usage (user_id, usage_day, edit_count)
    values (p_user_id, v_day, 1)
  on conflict (user_id, usage_day) do update
    set edit_count = usage.edit_count + 1
    where usage.edit_count < p_daily_limit
  returning edit_count into v_count;

  return jsonb_build_object('allowed', v_count is not null,
    'remaining', case when v_count is null then 0 else greatest(0, p_daily_limit - v_count) end);
end;
$$;
revoke all on function public.sonic_consume_profile_edit_budget(uuid, integer) from public, anon, authenticated;
grant execute on function public.sonic_consume_profile_edit_budget(uuid, integer) to service_role;

notify pgrst, 'reload schema';
commit;
