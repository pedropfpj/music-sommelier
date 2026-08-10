-- Make the backwards-compatible catalog surface electronic-only at the
-- database boundary, even if a future client bypasses the API route.

drop policy if exists "Published catalog artists are public" on public.catalog_artists;
create policy "Published catalog artists are public" on public.catalog_artists
  for select using (
    status = 'published'
    and lower(coalesce(metadata->>'electronic_gate', '')) = 'passed'
  );

drop policy if exists "Published catalog tracks are public" on public.catalog_tracks;
create policy "Published catalog tracks are public" on public.catalog_tracks
  for select using (
    status = 'published'
    and lower(coalesce(metadata->>'electronic_gate', '')) = 'passed'
  );

do $$
begin
  if not exists (
    select 1
    from pg_constraint
    where conname = 'catalog_artists_published_electronic_gate_check'
      and conrelid = 'public.catalog_artists'::regclass
  ) then
    alter table public.catalog_artists
      add constraint catalog_artists_published_electronic_gate_check
      check (
        status <> 'published'
        or lower(coalesce(metadata->>'electronic_gate', '')) = 'passed'
      );
  end if;

  if not exists (
    select 1
    from pg_constraint
    where conname = 'catalog_tracks_published_electronic_gate_check'
      and conrelid = 'public.catalog_tracks'::regclass
  ) then
    alter table public.catalog_tracks
      add constraint catalog_tracks_published_electronic_gate_check
      check (
        status <> 'published'
        or lower(coalesce(metadata->>'electronic_gate', '')) = 'passed'
      );
  end if;
end;
$$;

grant select on public.catalog_artists to anon, authenticated;
grant select on public.catalog_tracks to anon, authenticated;
grant select, insert, update, delete on public.catalog_artists to service_role;
grant select, insert, update, delete on public.catalog_tracks to service_role;
