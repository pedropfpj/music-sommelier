-- Quarantine recordings from artists with the same display name as psytrance projects.
-- These five recordings belong to rockabilly, hip-hop/R&B, or reggae catalogs,
-- not to the dark psy project Furious.

update public.catalog_tracks
set
  status = 'needs_review',
  metadata = coalesce(metadata, '{}'::jsonb) || jsonb_build_object(
    'electronic_gate', 'quarantined',
    'electronic_gate_version', '20260805_psytrance_identity_v1',
    'electronic_gate_reason', 'psytrance_artist_homonym_collision',
    'electronic_gate_detail', 'Recording belongs to a non-psytrance artist with the same display name.',
    'electronic_gate_checked_at', '2026-08-05'
  )
where public.catalog_key(artist) = 'furious'
  and public.catalog_key(song) in (
    'don_t_change_your_style',
    'hang_your_head',
    'punk_bashin_boogie',
    'wet',
    'who_to_trust'
  );

update public.electronic_recording_genres as recording_genre
set
  assertion_status = 'rejected',
  reviewed_at = now(),
  metadata = coalesce(recording_genre.metadata, '{}'::jsonb) || jsonb_build_object(
    'rejection_reason', 'psytrance_artist_homonym_collision',
    'reviewed_at', '2026-08-05'
  ),
  updated_at = now()
where recording_genre.recording_id in (
  select recording.id
  from public.electronic_recordings as recording
  join public.electronic_artists as artist on artist.id = recording.primary_artist_id
  where artist.canonical_key = 'furious'
    and public.catalog_key(recording.title) in (
      'don_t_change_your_style',
      'hang_your_head',
      'punk_bashin_boogie',
      'wet',
      'who_to_trust'
    )
);

update public.electronic_recordings as recording
set
  recording_status = 'blocked',
  verification_confidence = 0,
  metadata = coalesce(recording.metadata, '{}'::jsonb) || jsonb_build_object(
    'electronic_gate', 'quarantined',
    'electronic_gate_version', '20260805_psytrance_identity_v1',
    'electronic_gate_reason', 'psytrance_artist_homonym_collision',
    'electronic_gate_detail', 'Recording belongs to a non-psytrance artist with the same display name.',
    'electronic_gate_checked_at', '2026-08-05'
  ),
  updated_at = now()
from public.electronic_artists as artist
where artist.id = recording.primary_artist_id
  and artist.canonical_key = 'furious'
  and public.catalog_key(recording.title) in (
    'don_t_change_your_style',
    'hang_your_head',
    'punk_bashin_boogie',
    'wet',
    'who_to_trust'
  );
