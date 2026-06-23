# Psytrance subgenre expansion V1

Generated: 2026-06-21

## Outputs

- data/artist_expansion_seeds_v11.csv: 91 new artist seed rows
- data/verified_track_expansion_v9.csv: 1029 Deezer-preview track rows

## Coverage by style

| style | artist seeds | preview tracks | source anchor |
| --- | ---: | ---: | --- |
| psytrance | 7 | 71 | TIP Records / broad psytrance catalog |
| forest_psy | 1 | 78 | Forestdelic / Sangoma forest and twilight catalog |
| dark_psy | 4 | 55 | Sangoma / darkpsy and night psytrance catalog |
| twilight_psy | 8 | 72 | Sangoma / twilight full-on bridge |
| dark_experimental | 18 | 37 | Naturaiz / Voodoo Hoodoo experimental high-BPM catalog |
| psycore | 6 | 56 | Voodoo Hoodoo / Black Out high-BPM catalog |
| psybreaks | 7 | 22 | Digital Diamonds / psychedelic breaks and techno-adjacent catalog |
| psybient | 1 | 84 | Ultimae / psychill and psychedelic ambient catalog |
| freeform | 2 | 20 | Suomisaundi artist lineage and freeform psytrance research |
| full_on | 5 | 75 | Nano Records full-on catalog |
| full_on_night | 11 | 65 | Nano / TIP night full-on catalog |
| full_on_morning | 6 | 69 | Nano Records morning full-on catalog |
| progressive_psy | 2 | 77 | Iboga / IONO progressive psytrance catalog |
| hi_tech | 5 | 59 | Black Out / Voodoo Hoodoo high-BPM catalog |
| dark_progressive | 1 | 66 | Zenon Records dark progressive catalog |
| goa_trance | 2 | 57 | Suntrip Records goa trance catalog |
| psy_comercial | 5 | 66 | Iboga / TIP mainstream psytrance catalog |

## Source anchors

- https://blackoutrec.bandcamp.com/music
- https://digitaldiamonds.bandcamp.com/music
- https://en.wikipedia.org/wiki/Suomisaundi
- https://forestdelic.bandcamp.com/music
- https://ibogarecords.bandcamp.com/music
- https://nanorecords.bandcamp.com/music
- https://naturaizrecords.bandcamp.com/music
- https://sangomarecs.bandcamp.com/music
- https://suntriprecords.bandcamp.com/music
- https://tiprecords.bandcamp.com/music
- https://ultimae.bandcamp.com/music
- https://voodoo-hoodoo.bandcamp.com/music
- https://zenonrecords.bandcamp.com/music
- https://api.deezer.com/ (artist search, artist top tracks and album metadata endpoints)

## Notes

- Deezer rows use exact artist-name matches and require a playable preview URL.
- `bpm_exact` is intentionally blank for Deezer rows because the API does not expose verified BPM; the app can use its subgenre BPM range fallback.
- Artist seeds cover scene depth even when a given artist has no exact Deezer preview match.

## Deezer misses

- dark_psy: Polyphonia (no_usable_preview_tracks)
- dark_psy: Alien Mental (no_usable_preview_tracks)
- dark_experimental: Hans Dunkelkammer (no_usable_preview_tracks)
- dark_experimental: Enigmachina (no_usable_preview_tracks)
- dark_experimental: Jiazihu (no_exact_artist_match)
- dark_experimental: Saadhuk (no_exact_artist_match)
- dark_experimental: The Anti Priest (no_usable_preview_tracks)
- dark_experimental: Undermorph (no_usable_preview_tracks)
- dark_experimental: Nallun (no_exact_artist_match)
- psycore: Cosmo (no_usable_preview_tracks)
- psycore: Horcrux (no_usable_preview_tracks)
- psycore: Will O Wisp (no_usable_preview_tracks)
- psycore: Oxomo (no_usable_preview_tracks)
- psybreaks: Hedflux (no_usable_preview_tracks)
- psybreaks: Mood Deluxe (no_usable_preview_tracks)
- psybreaks: MartOpetEr (no_usable_preview_tracks)
- psybreaks: Monk3ylogic (no_usable_preview_tracks)
- psybreaks: Quadrat Beat (no_usable_preview_tracks)
- psybreaks: LuQas (no_exact_artist_match)
- psybreaks: Digitalis (no_usable_preview_tracks)
- psybreaks: Kiwa & ManMadeMan (no_exact_artist_match)
- psybient: Dhamika (no_exact_artist_match)
- freeform: Squaremeat (no_usable_preview_tracks)
- freeform: Luomuhappo (no_usable_preview_tracks)
- freeform: Omituisten Otusten Kerho (no_exact_artist_match)
- freeform: Pelinpala (no_usable_preview_tracks)
- freeform: Mandalavandalz (no_usable_preview_tracks)
- freeform: Outolintu (no_usable_preview_tracks)
- freeform: Eraser vs Yojalka (no_usable_preview_tracks)
- freeform: Troll Scientists (no_usable_preview_tracks)
- freeform: Flying Scorpions (no_usable_preview_tracks)
- full_on: Lucas (no_usable_preview_tracks)
- hi_tech: Kashyyyk (no_usable_preview_tracks)
- hi_tech: Will O Wisp (no_usable_preview_tracks)
- hi_tech: Horcrux (no_usable_preview_tracks)
- goa_trance: Goasia (no_usable_preview_tracks)
- goa_trance: Ra (no_exact_artist_match)
- goa_trance: Hypnoxock (no_usable_preview_tracks)
- psy_comercial: Astrix (no_usable_preview_tracks)
