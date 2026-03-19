# Psycore Audit (2026-02-23)

## Scope
- Request: verify why psycore is not generating and list all psycore artists/tracks currently available before any implementation changes.
- App files analyzed: `/Users/pedrofreire/Documents/New project/app.js`
- Dataset files analyzed:
  - `/Users/pedrofreire/Documents/New project/data/codex_dataset_pack_v14/data/psycore_db_v14.jsonl`
  - `/Users/pedrofreire/Documents/New project/data/codex_dataset_pack_v14/data/psytrance_db_v14.jsonl`

## Import files declared in app.js
- MISSING: `data/codex_dataset_pack_v14/tracks.json`
- MISSING: `data/codex_dataset_pack_v14/tracks.csv`
- MISSING: `data/codex_dataset_pack_v14/artists.json`
- MISSING: `data/codex_dataset_pack_v14/artists.csv`
- OK: `data/codex_dataset_pack_v14/data/psycore_db_v14.jsonl`
- OK: `data/codex_dataset_pack_v14/data/psytrance_db_v14.jsonl`

## Core findings
- Psycore tracks in static catalog (`app.js`): `0`
- Psycore rows with `artist + song` in JSONL datasets: `0`
- Psycore rows with artist only (no song) in JSONL datasets: `150`
- Unique psycore artists (seed/roster) across JSONL datasets: `75`

## Important implementation behavior confirmed
- In merge path, a dataset row only becomes a recommendable track when both fields exist:
  - `artist` (or aliases)
  - `song` (or aliases)
- Psycore JSONL rows currently act as artist seeds/metadata, not as playable track inventory.

## Psycore style controls in code (app.js)
- STYLE_ARTIST_SEEDS[psycore]:
  - Zik
  - Psykovsky
  - Kashyyyk
  - Yatzee
  - Narcopsy
  - Shift
  - Mimikry
- STYLE_ARTIST_BLOCKLIST[psycore]:
  - maramba
  - paralocks

## Full output files generated
- Track inventory CSV (complete):
  - `/Users/pedrofreire/Documents/New project/reports/psycore_tracks_inventory_2026-02-23.csv`
- Artist seed inventory CSV (complete):
  - `/Users/pedrofreire/Documents/New project/reports/psycore_artist_seed_inventory_2026-02-23.csv`

## Full psycore artist inventory (75 unique)
Varazslo
DEPURATUS
BilyCore
BONGDAN
Psynthesis
Oroboro
Seafloor Control
Kuma Mela Experiment
Kuli
Haemogoblin
Endless Mow
ALPSCORE
Kaya
The Nommos
Sectio Aurea
Noitrik
Fatal Discord
Kasatka
Yaminahua
Freq36
Primitive Sound
Narkotika
Nimba
Obscurum
Will O' Wisp
Sanathana
Calyptratus
CroNe
Rampage
2MINDS
ROTRIX
01-N
ESSEX
SIXSENSE
Poison Art
ELECTRO VISION
DJ Tsuyoshi
SINE6
JAWS UNDERGROUND
BPM
PSYCHO PUNK
SIGMA
BIGABO
Shock Blast
Tzu-Jan
PHRENETICUS
Boris & Olaf & Olga
Deadhead
Xochipilli
Mohina
Gukumatz
Necronomicon
Plankton
90-db
Cali Balam
Bizzare Frequency
Mythorlogic
K-Owl
Imix Jaguar
Mizter Bonezz
Coji
Anacamptis Morio
Mukhtar
Romeodark
Sadhana
Dattatreya
Indacoruna
Eodem Tempore
Baco Ames
Parasitorum
Chastrophob
Neormm
INFRA
Manticore
KinetiK Flux

## Full psycore track inventory
- None found (`0`).
