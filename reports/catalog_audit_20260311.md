# Catalog Audit - 2026-03-11

## Snapshot
- Static in-app catalog tracks: 66
- Static styles represented: 33 (of 44 configured styles)
- Low static coverage styles (<=2 tracks): many styles depend on dynamic hydration/API fallback.

## External dataset pack (loaded by app)
- Total parsed rows across dataset files: 1782
- Styles mapped after normalization: 14
- External pack is heavily concentrated in psytrance families.
- Styles with no external rows after normalization: 30 (mostly techno/house/dnb/bass families).

## Recent artists (<2 years)
- Curated recent-signal rows: 15
- Styles covered in recent signals: 3 (psytrance, slambient, dark_experimental)
- Includes requested examples: VallaK, Vutt'un, Vuga, VvV, Critical Frequency.

## Runtime audit hooks added
- `window.neonpulseCoverageReport()`
- `window.neonpulseCoverageGaps()`
- `window.neonpulseGenreAudit()`
- `window.neonpulseGenreAuditSummary()`

## Preview behavior
- YouTube inline player is now always made available in the preview card.
- If audio preview fails, YouTube embed is forced with autoplay+mute fallback.
- External links (Spotify/YouTube/SoundCloud) remain available when inline preview is missing.

## Priority improvements to schedule
1. Add external dataset packs for techno/house/dnb/bass families to reduce dependence on API hydration.
2. Expand curated `recent_artist_signals.json` for non-psy styles.
3. Add a periodic data refresh job to keep recent-artist signals fresh.
