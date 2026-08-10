-- Enforce one invariant across every public normalized recommendation:
-- recommendable recordings must retain recording-level electronic proof.

create or replace function public.preserve_recommendable_electronic_gate()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if new.recording_status = 'recommendable'
    and lower(coalesce(new.metadata->>'electronic_gate', '')) <> 'passed'
  then
    if tg_op = 'UPDATE' then
      if old.recording_status = 'recommendable'
        and lower(coalesce(old.metadata->>'electronic_gate', '')) = 'passed'
      then
        new.metadata := coalesce(new.metadata, '{}'::jsonb) || jsonb_build_object(
          'electronic_gate', 'passed',
          'electronic_gate_version', coalesce(old.metadata->>'electronic_gate_version', '20260713_electronic_v2'),
          'electronic_gate_reason', coalesce(old.metadata->>'electronic_gate_reason', 'previous_recording_proof_preserved'),
          'electronic_gate_detail', coalesce(
            old.metadata->>'electronic_gate_detail',
            'Previously verified recording-level electronic proof was preserved during metadata merge.'
          )
        );
      else
        raise exception 'recommendable recording requires electronic_gate=passed';
      end if;
    else
      raise exception 'recommendable recording requires electronic_gate=passed';
    end if;
  end if;
  return new;
end;
$$;

-- Repair rows where a later candidate relation overwrote metadata after an
-- earlier verified genre assertion had already made the recording eligible.
update public.electronic_recordings r
set metadata = coalesce(r.metadata, '{}'::jsonb) || jsonb_build_object(
  'electronic_gate', 'passed',
  'electronic_gate_version', coalesce(r.metadata->>'electronic_gate_version', '20260713_electronic_v2'),
  'electronic_gate_reason', 'verified_recording_genre_preserved',
  'electronic_gate_detail', 'A verified recording-level genre assertion preserves this recommendation eligibility.'
)
where r.recording_status = 'recommendable'
  and lower(coalesce(r.metadata->>'electronic_gate', '')) <> 'passed'
  and exists (
    select 1
    from public.electronic_recording_genres rg
    where rg.recording_id = r.id
      and rg.assertion_status = 'verified'
  );

-- Any anomalous recommendable row without verified recording evidence is
-- demoted rather than exposed.
update public.electronic_recordings r
set recording_status = 'needs_review',
    metadata = coalesce(r.metadata, '{}'::jsonb) || jsonb_build_object(
      'electronic_gate', 'candidate',
      'electronic_gate_reason', 'missing_verified_recording_genre',
      'electronic_gate_detail', 'Recommendation was demoted because no verified recording-level genre assertion exists.'
    )
where r.recording_status = 'recommendable'
  and lower(coalesce(r.metadata->>'electronic_gate', '')) <> 'passed';

drop trigger if exists preserve_recommendable_electronic_gate on public.electronic_recordings;
create trigger preserve_recommendable_electronic_gate
  before insert or update on public.electronic_recordings
  for each row execute function public.preserve_recommendable_electronic_gate();

do $$
begin
  if not exists (
    select 1
    from pg_constraint
    where conname = 'electronic_recordings_recommendable_gate_check'
      and conrelid = 'public.electronic_recordings'::regclass
  ) then
    alter table public.electronic_recordings
      add constraint electronic_recordings_recommendable_gate_check
      check (
        recording_status <> 'recommendable'
        or lower(coalesce(metadata->>'electronic_gate', '')) = 'passed'
      );
  end if;
end;
$$;

create or replace view public.electronic_subgenre_catalog_report
with (security_invoker = true)
as
with artist_counts as (
  select
    ag.genre_slug,
    count(distinct ag.artist_id) filter (where ag.assertion_status <> 'rejected') as stored_artists,
    count(distinct ag.artist_id) filter (
      where a.electronic_status in ('verified', 'recommendable')
        and ag.assertion_status = 'verified'
    ) as verified_artists
  from public.electronic_artist_genres ag
  join public.electronic_artists a on a.id = ag.artist_id
  group by ag.genre_slug
), recording_counts as (
  select
    rg.genre_slug,
    count(distinct r.primary_artist_id) filter (
      where r.recording_status = 'recommendable'
        and lower(coalesce(r.metadata->>'electronic_gate', '')) = 'passed'
        and rg.assertion_status = 'verified'
    ) as recommendable_artists,
    count(distinct rg.recording_id) filter (
      where r.recording_status = 'recommendable'
        and lower(coalesce(r.metadata->>'electronic_gate', '')) = 'passed'
        and rg.assertion_status = 'verified'
    ) as recommendable_recordings
  from public.electronic_recording_genres rg
  join public.electronic_recordings r on r.id = rg.recording_id
  group by rg.genre_slug
)
select
  g.slug,
  g.display_name,
  coalesce(a.stored_artists, 0) as stored_artists,
  coalesce(a.verified_artists, 0) as verified_artists,
  coalesce(r.recommendable_artists, 0) as recommendable_artists,
  coalesce(r.recommendable_recordings, 0) as recommendable_recordings
from public.electronic_genres g
left join artist_counts a on a.genre_slug = g.slug
left join recording_counts r on r.genre_slug = g.slug
where g.is_electronic = true
  and g.status <> 'deprecated';

drop policy if exists "Recommendable electronic recordings are public" on public.electronic_recordings;
create policy "Recommendable electronic recordings are public" on public.electronic_recordings
  for select using (
    recording_status = 'recommendable'
    and lower(coalesce(metadata->>'electronic_gate', '')) = 'passed'
  );

drop policy if exists "Public recording IDs follow recording visibility" on public.electronic_recording_external_ids;
create policy "Public recording IDs follow recording visibility" on public.electronic_recording_external_ids
  for select using (exists (
    select 1 from public.electronic_recordings r
    where r.id = recording_id
      and r.recording_status = 'recommendable'
      and lower(coalesce(r.metadata->>'electronic_gate', '')) = 'passed'
  ));

drop policy if exists "Verified recording genres are public" on public.electronic_recording_genres;
create policy "Verified recording genres are public" on public.electronic_recording_genres
  for select using (
    assertion_status = 'verified'
    and exists (
      select 1 from public.electronic_recordings r
      where r.id = recording_id
        and r.recording_status = 'recommendable'
        and lower(coalesce(r.metadata->>'electronic_gate', '')) = 'passed'
    )
  );

drop policy if exists "Active playback links are public" on public.electronic_playback_links;
create policy "Active playback links are public" on public.electronic_playback_links
  for select using (
    is_active = true
    and exists (
      select 1 from public.electronic_recordings r
      where r.id = recording_id
        and r.recording_status = 'recommendable'
        and lower(coalesce(r.metadata->>'electronic_gate', '')) = 'passed'
    )
  );

grant execute on function public.preserve_recommendable_electronic_gate() to service_role;
grant select on public.electronic_subgenre_catalog_report to service_role, authenticated;
