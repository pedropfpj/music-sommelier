begin;

create table if not exists public.sonic_privacy_requests (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete set null,
  request_key uuid not null,
  kind text not null check (kind in ('delete_account', 'export', 'correction', 'refund')),
  status text not null default 'open' check (status in ('open', 'processing', 'completed', 'awaiting_user', 'closed_with_reason')),
  contact_email text not null check (length(contact_email) <= 320),
  message text not null default '' check (length(message) <= 2000),
  resolution_note text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique(user_id, request_key)
);
create index if not exists sonic_privacy_requests_queue on public.sonic_privacy_requests(status, created_at);
alter table public.sonic_privacy_requests enable row level security;
revoke all on public.sonic_privacy_requests from public, anon, authenticated;
grant select, insert, update, delete on public.sonic_privacy_requests to service_role;

create or replace function public.sonic_create_privacy_request(
  p_user_id uuid, p_request_key uuid, p_kind text, p_message text, p_contact_email text
) returns jsonb
language plpgsql security definer set search_path = pg_catalog, public
as $$
declare
  v_row public.sonic_privacy_requests;
begin
  if p_user_id is null or p_request_key is null then raise exception 'invalid_request'; end if;
  -- Serialize creation for this verified account; retries do not consume quota.
  perform pg_advisory_xact_lock(hashtextextended(p_user_id::text, 73419));
  select * into v_row from public.sonic_privacy_requests
    where user_id = p_user_id and request_key = p_request_key;
  if not found then
    if (select count(*) from public.sonic_privacy_requests
        where user_id = p_user_id and created_at > now() - interval '24 hours') >= 10 then
      raise exception 'privacy_request_daily_limit';
    end if;
    insert into public.sonic_privacy_requests(user_id, request_key, kind, message, contact_email)
      values(p_user_id, p_request_key, p_kind, p_message, p_contact_email) returning * into v_row;
  end if;
  return jsonb_build_object('id', v_row.id, 'kind', v_row.kind, 'status', v_row.status,
    'created_at', v_row.created_at, 'updated_at', v_row.updated_at);
end;
$$;
revoke all on function public.sonic_create_privacy_request(uuid, uuid, text, text, text) from public, anon, authenticated;
grant execute on function public.sonic_create_privacy_request(uuid, uuid, text, text, text) to service_role;
comment on table public.sonic_privacy_requests is 'Restricted rights/support queue. Receipt is not completion. Operator must process, notify, document retention and erase expired records.';
commit;
