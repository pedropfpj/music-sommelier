# Varazslo / Absurdus / Varasurdum playable research

Generated: 2026-06-22

## Outcome

- `data/varazslo_absurdus_playable_tracks_20260622.csv` adds 8 focused rows with playable paths.
- `supabase/seeds/varazslo_absurdus_playable_20260622.sql` upserts the same 3 artists and 8 playable tracks into `catalog_artists` / `catalog_tracks`.
- `app.js` loads this file before older duplicate packs, so these verified previews/embeds win during catalog hydration.
- `app.js` also adds Existance Festival 2026 as a future event fallback for Varazslo, Varazlo, Absurdus, Abusurdus and Varasurdum.

## Classification

- Varazslo: `psycore`, with darkpsy/high-BPM context. The app keeps Varazslo as the canonical spelling and treats Varazlo/Varazslo-with-accent as lineup/search variants.
- Absurdus: `dark_psy`, specifically darkpsy/night psytrance. Do not promote to hitech or psycore without a stronger BPM/release source.
- Varasurdum: `psycore`, as the Varazslo x Absurdus collaborative/live project. It remains separate from both solo projects because `Mechanika` is publicly playable under the collaboration.

## Playable tracks added

- Varazslo - Taltos: SoundCloud direct URL.
- Varazslo - Hall of Purity: Deezer track `1767007297`, readable with preview.
- Varazslo - Information: Deezer track `1597215172`, readable with preview.
- Varazslo - Promised Land: Deezer track `1767007317`, readable with preview.
- Varazslo - Turan: Deezer track `3523326601`, readable with preview.
- Absurdus - Transmutation: Deezer track `3528600411`, readable with preview.
- Absurdus - Zephyrum: Deezer track `3930295991`, readable with preview.
- Varasurdum - Mechanika: YouTube track URL `https://www.youtube.com/watch?v=B6S2o7sCIj8`.

## Future event signal

- Existance Festival 2026 is listed as Thursday 3 September to Sunday 6 September 2026 in Tetbury, UK.
- Skiddle's lineup text includes Varazslo, Varasurdum and Absurdus.
- Access All Areas/Facebook state the original 11-14 June 2026 dates were postponed to 3-6 September 2026.

## Sources

- https://www.skiddle.com/festivals/existance-festival/
- https://accessallareas.org/event/existance-festival-2026/
- https://www.deezer.com/artist/9791434
- https://www.deezer.com/track/1767007297
- https://www.deezer.com/track/1597215172
- https://www.deezer.com/track/1767007317
- https://www.deezer.com/track/3523326601
- https://www.deezer.com/artist/1235794
- https://www.deezer.com/track/3528600411
- https://www.deezer.com/track/3930295991
- https://www.youtube.com/watch?v=B6S2o7sCIj8
