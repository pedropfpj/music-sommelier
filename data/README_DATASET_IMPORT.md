# Importacao do banco externo (codex_dataset_pack_v14)

Coloque sua pasta exatamente aqui:

`/Users/pedrofreire/Documents/New project/data/codex_dataset_pack_v14`

O app tenta importar automaticamente estes arquivos (se existirem):

- `tracks.json`
- `tracks.csv`
- `artists.json`
- `artists.csv`
- `data/psytrance_db_v14.jsonl`
- `data/psycore_db_v14.jsonl`
- `psytrance_artist_enriched_bios.csv`
- `psytrance_artist_seed_subset.csv`

## Formatos suportados

- `CSV`
- `JSON`
- `JSONL` (um JSON por linha)

`XLSX` nao e carregado direto no navegador. Exporte para `CSV` ou `JSON`.

## Colunas recomendadas (tracks)

- `artist` (ou `artist_name`)
- `song` (ou `track`, `title`, `track_name`)
- `style` (ou `subgenre`, `genre`, `main_style`)
- `bpm_exact` (ou `bpm`, `tempo`)
- `label`
- `preview_url`
- `release_date`
- `duration_sec`
- `country` / `city`
- `artist_bio`

## Colunas recomendadas (artists)

- `artist` (ou `name`)
- `style` (ou `subgenre`)
- `country` / `city`
- `artist_bio`

## Observacoes

- O app mapeia aliases de subgenero (ex.: `hitech`, `full-on night`, `psycore`, `slambient`).
- O import adiciona artistas em seeds/descoberta e tenta adicionar tracks ao catalogo.
- Para estilos estritos, o BPM e validado pela regra do subgenero.
