-- Read-only inspection before applying the two profile migrations.
-- Contains no profile content or personal account fields.
begin read only;
-- One result set: the dashboard otherwise displays only the last statement.
select 'profile_username_collisions' as check_name, to_jsonb(count(*)) as details
from (select lower(username) from public.profiles group by lower(username) having count(*) > 1) names
union all
select 'columns', coalesce(jsonb_agg(to_jsonb(columns)), '[]'::jsonb) from (
  select table_name, column_name, data_type, is_nullable, column_default
  from information_schema.columns where table_schema = 'public'
  and table_name in ('profiles', 'activity_feed', 'likes') order by table_name, ordinal_position
) columns
union all
select 'row_security', coalesce(jsonb_agg(to_jsonb(tables)), '[]'::jsonb) from (
  select schemaname, tablename, rowsecurity from pg_tables
  where (schemaname = 'public' and tablename in ('profiles', 'activity_feed', 'likes', 'profile_edit_usage'))
     or (schemaname = 'storage' and tablename = 'objects')
) tables
union all
select 'policies', coalesce(jsonb_agg(to_jsonb(policies)), '[]'::jsonb) from (
  select schemaname, tablename, policyname, permissive, roles, cmd, qual, with_check
  from pg_policies where (schemaname = 'public' and tablename in ('profiles', 'activity_feed', 'likes', 'profile_edit_usage'))
     or (schemaname = 'storage' and tablename = 'objects')
) policies
union all
select 'grants', coalesce(jsonb_agg(to_jsonb(grants)), '[]'::jsonb) from (
  select table_schema, table_name, grantee, privilege_type
  from information_schema.role_table_grants
  where grantee in ('anon', 'authenticated', 'service_role')
  and table_schema = 'public' and table_name in ('profiles', 'activity_feed', 'likes', 'community_public_profiles', 'profile_edit_usage')
) grants
union all
select 'avatar_bucket', coalesce(jsonb_agg(to_jsonb(buckets)), '[]'::jsonb) from (
  select id, public, file_size_limit, allowed_mime_types from storage.buckets where id = 'sonic-profile-avatars'
) buckets;
commit;
