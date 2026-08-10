-- Quarantine style assertions exposed by the 10x10 Psy/Techno stress test.
-- Recordings are not globally blocked here: several are valid electronic tracks,
-- but they do not belong to the fine subgenre assigned by the legacy catalog.

update public.catalog_tracks as track
set
  status = 'needs_review',
  metadata = coalesce(track.metadata, '{}'::jsonb) || jsonb_build_object(
    'electronic_gate', 'quarantined',
    'electronic_gate_version', '20260805_subgenre_stress_v1',
    'electronic_gate_reason', 'fine_subgenre_identity_collision',
    'electronic_gate_detail', 'Artist homonym or recording identity conflicts with the assigned fine subgenre.',
    'electronic_gate_checked_at', '2026-08-05'
  )
where
  (
    track.style in (
      'psytrance', 'forest_psy', 'dark_psy', 'twilight_psy', 'dark_experimental',
      'psycore', 'psybreaks', 'psybient', 'freeform', 'full_on', 'full_on_night',
      'full_on_morning', 'progressive_psy', 'hi_tech', 'dark_progressive',
      'goa_trance', 'psy_comercial', 'slambient'
    )
    and (public.catalog_key(track.artist), public.catalog_key(track.song)) in (
      ('silent_horror', '17_kills'),
      ('silent_horror', 'murder_castle'),
      ('silent_horror', 'silver_screen'),
      ('silent_horror', 'the_cabinet_of_dr_caligari'),
      ('cosmo', 'alle_meine_nachbarn'),
      ('cosmo', 'den_sommer_berleben'),
      ('cosmo', 'du_machst_mich_high'),
      ('cosmo', 'tanzschein'),
      ('n_o_m', 'i_can_t_wait'),
      ('n_o_m', 'look'),
      ('n_o_m', 'mega_punch'),
      ('parus', 'high_voltage'),
      ('parus', 'laboom'),
      ('parus', 'legend'),
      ('quasar', 'be_my_lover_techno'),
      ('quasar', 'drenagem'),
      ('quasar', 'em_seu_lugar'),
      ('quasar', 'termo'),
      ('loke', 'plata_ou_nada_feat_dogga_dogga')
    )
  )
  or (track.style = 'acid_techno' and public.catalog_key(track.artist) in ('jeff_mills', 'robert_hood'))
  or (
    track.style = 'dub_techno'
    and public.catalog_key(track.artist) in (
      'anna', 'charlotte_de_witte', 'enrico_sangiuliano', 'maceo_plex', 'pole', 'robert_hood'
    )
  );

with declared_bpm as (
  select
    track.id,
    track.style,
    (substring(lower(track.song) from '([0-9]{2,3})[[:space:]]*bpm'))::numeric as bpm
  from public.catalog_tracks as track
  where track.status = 'published'
    and track.style in (
      'full_on_night', 'forest_psy', 'dark_psy', 'hi_tech', 'psycore',
      'techno', 'hard_techno', 'industrial_techno', 'acid_techno', 'dub_techno'
    )
    and lower(track.song) ~ '[0-9]{2,3}[[:space:]]*bpm'
), out_of_range as (
  select id
  from declared_bpm
  where
    (style = 'full_on_night' and bpm not between 146 and 154)
    or (style = 'forest_psy' and bpm not between 145 and 154)
    or (style = 'dark_psy' and bpm not between 154 and 175)
    or (style = 'hi_tech' and bpm not between 176 and 230)
    or (style = 'psycore' and bpm not between 175 and 300)
    or (style = 'techno' and bpm not between 128 and 136)
    or (style = 'hard_techno' and bpm not between 145 and 160)
    or (style = 'industrial_techno' and bpm not between 130 and 150)
    or (style = 'acid_techno' and bpm not between 124 and 145)
    or (style = 'dub_techno' and bpm not between 118 and 128)
)
update public.catalog_tracks as track
set
  status = 'needs_review',
  metadata = coalesce(track.metadata, '{}'::jsonb) || jsonb_build_object(
    'electronic_gate', 'quarantined',
    'electronic_gate_version', '20260805_subgenre_stress_v1',
    'electronic_gate_reason', 'title_bpm_out_of_style_range',
    'electronic_gate_detail', 'The BPM declared in the title conflicts with the assigned subgenre range.',
    'electronic_gate_checked_at', '2026-08-05'
  )
from out_of_range
where track.id = out_of_range.id;

update public.electronic_recording_genres as recording_genre
set
  assertion_status = 'rejected',
  reviewed_at = now(),
  metadata = coalesce(recording_genre.metadata, '{}'::jsonb) || jsonb_build_object(
    'rejection_reason', 'fine_subgenre_identity_collision',
    'stress_suite', '20260805_subgenre_stress_v1',
    'reviewed_at', '2026-08-05'
  ),
  updated_at = now()
from public.electronic_recordings as recording,
     public.electronic_artists as artist
where recording.id = recording_genre.recording_id
  and artist.id = recording.primary_artist_id
  and (
    (
      recording_genre.genre_slug = 'acid_techno'
      and artist.canonical_key in ('jeff_mills', 'robert_hood')
    )
    or (
      recording_genre.genre_slug = 'dub_techno'
      and artist.canonical_key in (
        'anna', 'charlotte_de_witte', 'enrico_sangiuliano', 'maceo_plex', 'pole', 'robert_hood'
      )
    )
    or (
      recording_genre.genre_slug in (
        'psytrance', 'forest_psy', 'dark_psy', 'twilight_psy', 'dark_experimental',
        'psycore', 'psybreaks', 'psybient', 'freeform', 'full_on', 'full_on_night',
        'full_on_morning', 'progressive_psy', 'hi_tech', 'dark_progressive',
        'goa_trance', 'psy_comercial', 'slambient'
      )
      and (artist.canonical_key, public.catalog_key(recording.title)) in (
        ('silent_horror', '17_kills'),
        ('silent_horror', 'murder_castle'),
        ('silent_horror', 'silver_screen'),
        ('silent_horror', 'the_cabinet_of_dr_caligari'),
        ('cosmo', 'alle_meine_nachbarn'),
        ('cosmo', 'den_sommer_berleben'),
        ('cosmo', 'du_machst_mich_high'),
        ('cosmo', 'tanzschein'),
        ('n_o_m', 'i_can_t_wait'),
        ('n_o_m', 'look'),
        ('n_o_m', 'mega_punch'),
        ('parus', 'high_voltage'),
        ('parus', 'laboom'),
        ('parus', 'legend'),
        ('quasar', 'be_my_lover_techno'),
        ('quasar', 'drenagem'),
        ('quasar', 'em_seu_lugar'),
        ('quasar', 'termo'),
        ('loke', 'plata_ou_nada_feat_dogga_dogga')
      )
    )
  );
