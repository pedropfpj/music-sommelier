# HIVE Festival 2026 artist subgenre research

Generated: 2026-06-21

## Scope

- Official HIVE lineup bookings parsed: 267
- Unique artists after splitting B2B/F2F/feat./ampersand bookings: 322
- Added warm-up screenshot bookings: 12

## Outputs

- `data/hive_festival_2026_artist_profiles.csv`: import-compatible artist profile CSV.
- `data/hive_festival_2026_artist_subgenres.csv`: audit CSV with stage, booking, confidence, evidence tags and source URLs.
- `reports/hive_festival_2026_musicbrainz_cache.json`: MusicBrainz tag/disambiguation cache when refreshed.

## Method

1. Parsed artist bookings from the official HIVE Festival site.
2. Added the warm-up party artists visible in the provided screenshot.
3. Split B2B, F2F, feat., vs. and explicit ampersand collaborations into individual artist rows.
4. Reused existing local catalog profiles when available.
5. Used curated overrides for well-known scene artists and MusicBrainz tags/disambiguation where available.
6. Fell back to the official HIVE stage family only when no stronger artist-level evidence was found; these rows are marked lower confidence or `needs_review`.

## Status

- needs_review: 121
- published: 201

## Confidence

- high: 92
- low: 13
- medium: 49
- medium_high: 60
- medium_low: 108

## Styles

- hard_techno: 82
- hard_trance: 71
- acid_techno: 38
- techno: 31
- disco_house: 20
- hardcore: 13
- progressive_psy: 10
- psytrance: 7
- psy_comercial: 6
- full_on: 5
- industrial_techno: 5
- dark_progressive: 5
- rawstyle: 5
- tech_trance: 5
- gabber: 3
- schranz: 3
- hypnotic_techno: 3
- hardgroove_techno: 2
- full_on_night: 2
- hardstyle: 2
- electro: 1
- frenchcore: 1
- full_on_morning: 1
- ebm: 1

## Needs Review Sample

- 2HOT2PLAY: neo-rave / hard trance / eurodance trance (GROOVE BEACH)
- 3LEEZA: bounce / hard trance / eurodance rave (BOUNCE TEMPLE)
- 6EURONEUNZIG: neo-rave / hard trance / eurodance trance (GROOVE BEACH)
- ACHIM FEUERVOGEL: bounce / hard trance / eurodance rave (BOUNCE TEMPLE)
- ADRIÁN MILLS: neo-rave / hard trance / eurodance trance (GROOVE BEACH; WARM-UP PARTY)
- AEREA: neo-rave / hard trance / eurodance trance (GROOVE BEACH)
- AISHA: queer techno / club rave / hard groove (LIBIDOH LAB)
- AKA NINA: free tekno / acidcore / psytek / tribe (PIRATE BAY)
- AL ASLAN: free tekno / acidcore / psytek / tribe (PIRATE BAY)
- ALLSTARS: disco house / house / electro (DISCO FOREST)
- ALYOSHA: free tekno / acidcore / psytek / tribe (PIRATE BAY)
- AMO: queer techno / club rave / hard groove (LIBIDOH LAB)
- ANAÏS-LIN: free tekno / acidcore / psytek / tribe (PIRATE BAY)
- ANUUK: bounce / hard trance / eurodance rave (BOUNCE TEMPLE)
- ARMAN JOHN: bounce / hard trance / eurodance rave (BOUNCE TEMPLE)
- ASH ROY: free tekno / acidcore / psytek / tribe (PIRATE BAY)
- BABXI: disco house / house / electro (DISCO FOREST)
- BASS-T73: free tekno / acidcore / psytek / tribe (PIRATE BAY)
- BECKSHAM: disco house / house / electro (DISCO FOREST)
- BOOGIE DAN: disco house / house / electro (DISCO FOREST)
- BRATANOVA: free tekno / acidcore / psytek / tribe (PIRATE BAY)
- CADILLAC CARL: disco house / house / electro (DISCO FOREST)
- CARA ELIZABETH: bounce / hard trance / eurodance rave (BOUNCE TEMPLE)
- CARGO: bounce / hard trance / eurodance rave (BOUNCE TEMPLE)
- CASCALHO AKA D_SIGUAL: free tekno / acidcore / psytek / tribe (PIRATE BAY)
- CIAO 3LLA: disco house / house / electro (DISCO FOREST)
- CLEOPARD2000: neo-rave / hard trance / eurodance trance (GROOVE BEACH)
- DALI: neo-rave / hard trance / eurodance trance (GROOVE BEACH)
- DAVYBOI: neo-rave / hard trance / eurodance trance (GROOVE BEACH)
- DEATH OF MARS: queer techno / club rave / hard groove (LIBIDOH LAB)
- DETOXX: bounce / hard trance / eurodance rave (BOUNCE TEMPLE)
- DICE: bounce / hard trance / eurodance rave (BOUNCE TEMPLE)
- DJ ANGEL: free tekno / acidcore / psytek / tribe (PIRATE BAY)
- DJ DRECKISCH: neo-rave / hard trance / eurodance trance (GROOVE BEACH; WARM-UP PARTY)
- DJ GUESTLIST: bounce / hard trance / eurodance rave (BOUNCE TEMPLE)
- DJ SIDEQUEST: free tekno / acidcore / psytek / tribe (PIRATE BAY)
- DJ SONNENBRAND: bounce / hard trance / eurodance rave (BOUNCE TEMPLE)
- DJ WASSERFALL: bounce / hard trance / eurodance rave (BOUNCE TEMPLE)
- DON ANDRES: disco house / house / electro (DISCO FOREST)
- DONCHOPPA: bounce / hard trance / eurodance rave (BOUNCE TEMPLE)
- DVAID: bounce / hard trance / eurodance rave (BOUNCE TEMPLE; WARM-UP PARTY)
- ELOISA: queer techno / club rave / hard groove (LIBIDOH LAB)
- EPHY PINKMAN: free tekno / acidcore / psytek / tribe (PIRATE BAY)
- EREBOS: queer techno / club rave / hard groove (LIBIDOH LAB)
- FABIENNE GEHTHARDT: free tekno / acidcore / psytek / tribe (PIRATE BAY)
- FARSEER: free tekno / acidcore / psytek / tribe (PIRATE BAY)
- FASTER HORSES: bounce / hard trance / eurodance rave (BOUNCE TEMPLE)
- FRANCIS FF: disco house / house / electro (DISCO FOREST)
- FRONS: bounce / hard trance / eurodance rave (BOUNCE TEMPLE)
- FUMI: neo-rave / hard trance / eurodance trance (GROOVE BEACH; WARM-UP PARTY)
- GEHLEKTEK: free tekno / acidcore / psytek / tribe (PIRATE BAY)
- GI.O: free tekno / acidcore / psytek / tribe (PIRATE BAY)
- GIØ: bounce / hard trance / eurodance rave (BOUNCE TEMPLE; WARM-UP PARTY)
- GOLANSKI: free tekno / acidcore / psytek / tribe (PIRATE BAY)
- GRUBER: free tekno / acidcore / psytek / tribe (PIRATE BAY)
- HANÀ: bounce / hard trance / eurodance rave (BOUNCE TEMPLE)
- HOCKI: queer techno / club rave / hard groove (LIBIDOH LAB)
- HU: bounce / hard trance / eurodance rave (BOUNCE TEMPLE)
- HUMAN ERROR: bounce / hard trance / eurodance rave (BOUNCE TEMPLE; WARM-UP PARTY)
- INSANE TEKNOLOGY: free tekno / acidcore / psytek / tribe (PIRATE BAY)
- INTHELINBO: free tekno / acidcore / psytek / tribe (PIRATE BAY)
- JOKESONYOU: bounce / hard trance / eurodance rave (BOUNCE TEMPLE)
- JUICY: queer techno / club rave / hard groove (LIBIDOH LAB)
- JUSTIN TINDERDATE: bounce / hard trance / eurodance rave (BOUNCE TEMPLE)
- KAMÄLEON: bounce / hard trance / eurodance rave (BOUNCE TEMPLE)
- KARISH: bounce / hard trance / eurodance rave (BOUNCE TEMPLE)
- KIM SWIM: neo-rave / hard trance / eurodance trance (GROOVE BEACH)
- KLING&KLANG: bounce / hard trance / eurodance rave (BOUNCE TEMPLE)
- KYOSHI: free tekno / acidcore / psytek / tribe (PIRATE BAY)
- L.ZWO: neo-rave / hard trance / eurodance trance (GROOVE BEACH)
- LAWYA: disco house / house / electro (DISCO FOREST)
- LE BARD: free tekno / acidcore / psytek / tribe (PIRATE BAY)
- LOVI: bounce / hard trance / eurodance rave (BOUNCE TEMPLE)
- M.O.E.: disco house / house / electro (DISCO FOREST)
- MACON: bounce / hard trance / eurodance rave (BOUNCE TEMPLE)
- MAEDCHENBALLERN: queer techno / club rave / hard groove (LIBIDOH LAB)
- MAIKE DEPAS: bounce / hard trance / eurodance rave (BOUNCE TEMPLE)
- MAKITA: disco house / house / electro (DISCO FOREST)
- MARRE: queer techno / club rave / hard groove (LIBIDOH LAB)
- MARTIN MEYER: disco house / house / electro (DISCO FOREST)

## Sources

- Official HIVE Festival lineup: https://www.hive-festival.de/
- MusicBrainz artist API/search cache for public tags and disambiguation.
- User-provided warm-up screenshot paths from the current Codex thread.
