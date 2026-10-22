# SonicSearch Recomenda

Public weekly discovery area, reachable from the Discover teaser and More. There is no Premium gate. Existing daily recommendations and the personal weekly recap are unchanged.

- General selection: up to six recordings from distinct genre groups.
- Style filter: all 169 active options from the main app selector, kept strictly within the selected style.
- Editions start September 16, 2026 and change at midnight every Wednesday in `America/Sao_Paulo`. Previous editions can be browsed; future/pre-launch editions cannot be requested.
- The selection is automatic and deterministic, using `data/weekly-catalog-v1.json`. It does not call ChatGPT, schedule a Codex task, send notifications, or discover new releases on the internet. This is stated as a catalog selection in the UI. The snapshot contains 3,417 entries (including recordings categorized in multiple styles), not necessarily that many unique recordings.
- A standalone Psytrance Radar #1 special contains the six user-suggested recordings, with label Bandcamp track links verified September 16, 2026. Context comes from the labels' release descriptions; no listening analysis is claimed.
- Listening opens the named provider. If the existing catalog lacks a direct recording URL, the action explicitly says **Search YouTube**. No expired catalog preview URLs are shipped in this dataset.
- Sharing uses the OS share sheet, with clipboard and selectable text fallbacks. Shared links preserve edition and style.
- PT/EN/ES copy follows the app language. Content loads on entering the section, with error/retry handling. The snapshot and UI files are included in iOS/Android web bundles.

## Stable archives

`scripts/build-weekly-catalog.mjs` created the initial snapshot from the current app selector and runtime catalog. **Do not overwrite v1 after release**: the content and algorithm version define past selections. A later catalog update should use a new version with an effective Wednesday and keep previous snapshots and algorithm versions available. The ordinary web/native builds do not regenerate this snapshot.

For more variety the source catalog must eventually be expanded; a finite catalog will repeat recordings. Sparse styles can have fewer than six recordings. The weekly change is calculated on opening, returning to, or leaving the section open across Wednesday; no server cron is necessary.

## Checks

`node scripts/test-weekly-recommends.mjs`

`node scripts/verify-weekly-recommends-ui.mjs` (requires Playwright, or `SONIC_PLAYWRIGHT_MODULE` pointing to its module)

## Special edition sources

- [N3XU5 — Scanner Darkly](https://moonkoradjirecords.bandcamp.com/track/n3xu5-scanner-darkly)
- [Piazer & Creepy Deep — Not A Lullaby](https://sangomarecs.bandcamp.com/track/not-a-lullaby)
- [Arcek & Hyperactive 25 — Wicked Wicked Some People Saying Saying Saying Wicked](https://multidimensionalmusic.bandcamp.com/track/arcek-hyperactive-25-wicked-wicked-some-people-saying-saying-saying-wicked)
- [Komfuzius — Rotor Symphony](https://osom-music.bandcamp.com/track/rotor-symphony-212bpm)
- [Tengri — Ritual of Dust](https://beatspace-parvati.bandcamp.com/track/ritual-of-dust)
- [Dylalien — Portal Party Mix 5000](https://moonkoradjirecords.bandcamp.com/track/dylalien-portal-party-mix-5000)
