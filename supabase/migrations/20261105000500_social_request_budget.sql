-- Account-bound durable limits using the existing database, without Redis.
begin;
create table if not exists public.social_request_usage (
  user_id uuid not null references auth.users(id) on delete cascade,
  usage_day date not null,
  request_count integer not null check (request_count > 0),
  primary key (user_id, usage_day)
);
alter table public.social_request_usage enable row level security;
revoke all on public.social_request_usage from public, anon, authenticated;
grant select, insert, update, delete on public.social_request_usage to service_role;
create or replace function public.sonic_consume_social_request_budget(p_user_id uuid, p_daily_limit integer)
returns jsonb language plpgsql security definer set search_path = pg_catalog, public as $$
declare
  v_day date := (clock_timestamp() at time zone 'UTC')::date;
  v_count integer;
begin
  if p_user_id is null or p_daily_limit is null or p_daily_limit < 1 or p_daily_limit > 10000 then
    raise exception 'invalid_social_budget';
  end if;
  delete from public.social_request_usage where user_id = p_user_id and usage_day < v_day - 30;
  insert into public.social_request_usage as usage (user_id, usage_day, request_count)
    values (p_user_id, v_day, 1)
  on conflict (user_id, usage_day) do update set request_count = usage.request_count + 1
    where usage.request_count < p_daily_limit returning request_count into v_count;
  return jsonb_build_object('allowed',v_count is not null,'remaining',
    case when v_count is null then 0 else greatest(0,p_daily_limit-v_count) end);
end;
$$;
revoke all on function public.sonic_consume_social_request_budget(uuid,integer) from public,anon,authenticated;
grant execute on function public.sonic_consume_social_request_budget(uuid,integer) to service_role;
notify pgrst, 'reload schema';
commit;
