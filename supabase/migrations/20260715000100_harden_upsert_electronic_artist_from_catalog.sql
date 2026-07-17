-- Restrict direct execution of the privileged catalog upsert to the
-- ingestion service role without changing the function implementation.

begin;

revoke execute on function public.upsert_electronic_artist_from_catalog(
  text,
  text,
  text,
  text,
  text,
  text,
  text,
  text,
  text,
  text,
  jsonb,
  boolean
) from public, anon, authenticated;

grant execute on function public.upsert_electronic_artist_from_catalog(
  text,
  text,
  text,
  text,
  text,
  text,
  text,
  text,
  text,
  text,
  jsonb,
  boolean
) to service_role;

commit;
