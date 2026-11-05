-- Community-only consent is not permission for anonymous publication.
begin;
alter table public.profiles add column if not exists profile_link_public boolean not null default false;
do $$ begin
  if not exists(select 1 from pg_constraint where conname='profile_public_link_visibility' and conrelid='public.profiles'::regclass) then
    alter table public.profiles add constraint profile_public_link_visibility check(not profile_link_public or profile_public);
  end if;
end $$;
-- Deliberately no backfill: existing community profiles keep their old audience.
notify pgrst, 'reload schema';
commit;
