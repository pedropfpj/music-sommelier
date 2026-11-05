-- Some older projects have explicit table grants that exclude service_role.
-- Grant the existing backend the writes used by the profile/comment handlers.
-- Browser/anonymous policies remain unchanged and private.
begin;
grant select, insert, update, delete on public.profiles, public.activity_feed to service_role;
notify pgrst, 'reload schema';
commit;
