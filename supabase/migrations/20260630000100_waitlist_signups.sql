-- Sonic Search private beta waitlist.
-- Used by /api/waitlist with the server-side Supabase service role.

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

create table if not exists public.waitlist_signups (
  id uuid primary key default gen_random_uuid(),
  email text not null unique,
  name text,
  role text not null default 'listener',
  note text,
  source text,
  status text not null default 'requested',
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint waitlist_signups_email_check
    check (email ~* '^[^@\s]+@[^@\s]+\.[^@\s]+$'),
  constraint waitlist_signups_role_check
    check (role in ('listener', 'dj', 'producer', 'event', 'investor')),
  constraint waitlist_signups_status_check
    check (status in ('requested', 'invited', 'approved', 'rejected', 'archived')),
  constraint waitlist_signups_name_check
    check (name is null or char_length(name) <= 80),
  constraint waitlist_signups_note_check
    check (note is null or char_length(note) <= 500)
);

create index if not exists waitlist_signups_status_created_idx
  on public.waitlist_signups (status, created_at desc);
create index if not exists waitlist_signups_role_created_idx
  on public.waitlist_signups (role, created_at desc);

drop trigger if exists set_waitlist_signups_updated_at on public.waitlist_signups;
create trigger set_waitlist_signups_updated_at
  before update on public.waitlist_signups
  for each row execute function public.set_updated_at();

alter table public.waitlist_signups enable row level security;

-- No public policies on purpose: waitlist data is private.
-- The server-side service role used by /api/waitlist bypasses RLS.
grant usage on schema public to service_role;
grant select, insert, update on public.waitlist_signups to service_role;
