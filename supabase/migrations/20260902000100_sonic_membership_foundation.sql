-- Sonic Search SaaS membership foundation.
-- Billing providers must write through a trusted backend using service_role.

create table if not exists public.sonic_plans (
  code text primary key check (code ~ '^[a-z0-9_]{2,40}$'),
  name text not null,
  description text not null default '',
  features jsonb not null default '[]'::jsonb check (jsonb_typeof(features) = 'array'),
  active boolean not null default true,
  sort_order integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.sonic_memberships (
  user_id uuid primary key references auth.users(id) on delete cascade,
  plan_code text not null default 'free' references public.sonic_plans(code),
  status text not null default 'free'
    check (status in ('free', 'trialing', 'active', 'past_due', 'paused', 'canceled', 'expired', 'incomplete')),
  provider text not null default 'manual'
    check (provider in ('manual', 'stripe', 'apple', 'google')),
  provider_customer_ref text,
  provider_subscription_ref text,
  current_period_start timestamptz,
  current_period_end timestamptz,
  trial_end timestamptz,
  cancel_at_period_end boolean not null default false,
  metadata jsonb not null default '{}'::jsonb check (jsonb_typeof(metadata) = 'object'),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  check (plan_code = 'free' or status <> 'free')
);

-- Stores only the minimum event envelope required for idempotent webhook processing.
-- Raw payment payloads should remain in the billing provider, not in this table.
create table if not exists public.sonic_billing_events (
  id uuid primary key default gen_random_uuid(),
  provider text not null check (provider in ('stripe', 'apple', 'google', 'manual')),
  provider_event_id text not null,
  event_type text not null,
  payload_hash text,
  processed boolean not null default false,
  processing_error text,
  processing_started_at timestamptz,
  processing_attempts integer not null default 0 check (processing_attempts >= 0),
  received_at timestamptz not null default now(),
  processed_at timestamptz,
  unique (provider, provider_event_id)
);

-- Atomically claims new events and safely retries failed/stale deliveries. This
-- prevents two serverless instances from processing the same payment event.
create or replace function public.claim_sonic_billing_event(
  event_provider text,
  event_id text,
  event_kind text,
  event_payload_hash text
)
returns boolean
language plpgsql
security definer
set search_path = public
as $$
declare
  claimed boolean := false;
begin
  insert into public.sonic_billing_events (
    provider,
    provider_event_id,
    event_type,
    payload_hash,
    processing_started_at,
    processing_attempts
  ) values (
    event_provider,
    event_id,
    event_kind,
    event_payload_hash,
    now(),
    1
  )
  on conflict (provider, provider_event_id) do nothing;

  if found then
    return true;
  end if;

  update public.sonic_billing_events
  set
    event_type = event_kind,
    payload_hash = event_payload_hash,
    processing_error = null,
    processed_at = null,
    processing_started_at = now(),
    processing_attempts = processing_attempts + 1
  where provider = event_provider
    and provider_event_id = event_id
    and processed = false
    and (
      processing_started_at is null
      or processing_started_at < now() - interval '2 minutes'
    )
  returning true into claimed;

  return coalesce(claimed, false);
end;
$$;

insert into public.sonic_plans (code, name, description, features, sort_order)
values
  (
    'free',
    'Sonic Free',
    'Descoberta eletrônica essencial, com curtidas ilimitadas.',
    '["discovery_core", "likes_unlimited", "local_profile", "recent_history", "share_cards"]'::jsonb,
    10
  ),
  (
    'premium',
    'Sonic Premium',
    'Memória contínua, radar diário e ferramentas avançadas de descoberta.',
    '["discovery_core", "likes_unlimited", "local_profile", "recent_history", "share_cards", "cloud_profile", "cross_device_sync", "full_history", "daily_radar", "smart_collections", "advanced_discovery", "taste_reports"]'::jsonb,
    20
  )
on conflict (code) do update set
  name = excluded.name,
  description = excluded.description,
  features = excluded.features,
  sort_order = excluded.sort_order,
  updated_at = now();

drop trigger if exists set_sonic_plans_updated_at on public.sonic_plans;
create trigger set_sonic_plans_updated_at
  before update on public.sonic_plans
  for each row execute function public.set_updated_at();

drop trigger if exists set_sonic_memberships_updated_at on public.sonic_memberships;
create trigger set_sonic_memberships_updated_at
  before update on public.sonic_memberships
  for each row execute function public.set_updated_at();

create unique index if not exists sonic_memberships_provider_subscription_uidx
  on public.sonic_memberships (provider, provider_subscription_ref)
  where provider_subscription_ref is not null;

create index if not exists sonic_memberships_status_period_idx
  on public.sonic_memberships (status, current_period_end);

alter table public.sonic_plans enable row level security;
alter table public.sonic_memberships enable row level security;
alter table public.sonic_billing_events enable row level security;

drop policy if exists "Active Sonic plans are public" on public.sonic_plans;
create policy "Active Sonic plans are public" on public.sonic_plans
  for select using (active = true);

drop policy if exists "Users read own Sonic membership" on public.sonic_memberships;
create policy "Users read own Sonic membership" on public.sonic_memberships
  for select using (auth.uid() = user_id);

-- The broad v1 default grants predate billing. Revoke all client-side writes
-- explicitly so plans and memberships can only change through trusted webhooks/admin.
revoke all on public.sonic_plans from anon, authenticated;
revoke all on public.sonic_memberships from anon, authenticated;
revoke all on public.sonic_billing_events from anon, authenticated;

grant select on public.sonic_plans to anon, authenticated;
grant select on public.sonic_memberships to authenticated;
grant all on public.sonic_plans to service_role;
grant all on public.sonic_memberships to service_role;
grant all on public.sonic_billing_events to service_role;
revoke all on function public.claim_sonic_billing_event(text, text, text, text) from public, anon, authenticated;
grant execute on function public.claim_sonic_billing_event(text, text, text, text) to service_role;

notify pgrst, 'reload schema';
