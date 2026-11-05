-- Explicit choices belong to the profile; inferred listening taste stays private.
begin;
alter table public.profiles
  add column if not exists musical_preferences text[] not null default '{}'::text[];
do $$ begin
  if not exists (select 1 from pg_constraint where conname='profiles_preferences_limit' and conrelid='public.profiles'::regclass) then
    alter table public.profiles add constraint profiles_preferences_limit
      check (cardinality(musical_preferences) <= 12 and array_position(musical_preferences, null) is null);
  end if;
end $$;

-- Normalize new/changed handles server-side without rewriting legacy identities.
create or replace function public.sonic_normalize_profile_username()
returns trigger language plpgsql set search_path = public, pg_temp as $$
begin
  new.username := lower(trim(new.username));
  if new.username is null or new.username !~ '^[a-z0-9][a-z0-9_]{2,29}$' then
    raise exception 'invalid_username' using errcode = '23514';
  end if;
  return new;
end;
$$;
drop trigger if exists sonic_profile_username on public.profiles;
create trigger sonic_profile_username before insert or update of username on public.profiles
  for each row execute function public.sonic_normalize_profile_username();

-- No backfill from favorite_styles: existing users did not choose to publish them.
create or replace view public.community_public_profiles with (security_barrier = true) as
select id, username, display_name,
  case when show_bio then coalesce(bio, '') else '' end as bio,
  case when show_styles then musical_preferences else '{}'::text[] end as favorite_styles,
  show_avatar
from public.profiles where profile_public = true;
revoke all on public.community_public_profiles from public, anon, authenticated;
grant select on public.community_public_profiles to service_role;
notify pgrst, 'reload schema';
commit;
