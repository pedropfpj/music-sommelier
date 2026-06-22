# Importacao do banco externo (codex_dataset_pack_v14)

Coloque sua pasta exatamente aqui:

`/Users/pedrofreire/Documents/New project/data/codex_dataset_pack_v14`

O app tenta importar automaticamente estes arquivos (se existirem):

- `../artist_expansion_seeds_v1.csv`
- `../artist_expansion_seeds_v2.csv`
- `../artist_expansion_seeds_v3.csv`
- `../artist_expansion_seeds_v4.csv`
- `../artist_expansion_seeds_v5.csv`
- `../artist_expansion_seeds_v6.csv`
- `../artist_expansion_seeds_v7.csv`
- `../artist_expansion_seeds_v8.csv`
- `../artist_expansion_seeds_v9.csv`
- `../artist_expansion_seeds_v10.csv`
- `../artist_expansion_seeds_v11.csv`
- `../artist_expansion_seeds_v12.csv`
- `../verified_track_expansion_v1.csv`
- `../verified_track_expansion_v2.csv`
- `../verified_track_expansion_v3.csv`
- `../verified_track_expansion_v4.csv`
- `../verified_track_expansion_v5.csv`
- `../verified_track_expansion_v6.csv`
- `../verified_track_expansion_v7.csv`
- `../verified_track_expansion_v8.csv`
- `../verified_track_expansion_v9.csv`
- `../techno_enrichment_v3_20260621.csv`
- `../techno_enrichment_v4_20260621.csv`
- `../techno_enrichment_v5_20260621.csv`
- `../techno_artist_profiles_v4_20260621.csv`
- `../electronic_subgenre_expansion_v15_20260621.csv`
- `../electronic_subgenre_artist_profiles_v15_20260621.csv`
- `../catalog_playable_depth_v16_20260622.csv`
- `../hive_festival_2026_artist_profiles.csv`
- `../cosmic_crew_2026_artist_profiles.csv`
- `../cosmic_crew_2026_playable_tracks.csv`
- `../mop_brasil_2026_rage_artist_profiles.csv`
- `../mop_brasil_2026_rage_playable_tracks.csv`
- `../pachamama_2026_artist_profiles.csv`
- `../pachamama_2026_playable_tracks.csv`
- `tracks.json`
- `tracks.csv`
- `prog_dark_tracks.csv`
- `artists.json`
- `artists.csv`
- `data/psytrance_db_v14.jsonl`
- `data/psycore_db_v14.jsonl`
- `psytrance_artist_enriched_bios.csv`
- `psytrance_artist_seed_subset.csv`

## Formatos suportados

Observacao: o pacote `electronic_subgenre_expansion_v15_20260621.csv` foi aprofundado para 1.183 linhas, com 1.127 previews tocaveis e alvo de ate 8 faixas por artista/subgenero.

Observacao: o pacote `catalog_playable_depth_v16_20260622.csv` adiciona 650 faixas tocaveis a artistas ja publicados, com resolucao exata de artista no Deezer.

Observacao: `../dj_set_recommendations_20260622.csv` e um dataset de DJs/selectors por set tocavel. Ele nao deve ser importado como tracks/produtores; a aba `DJs` usa esse recorte separado para previews de set.

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
- `artist_genre`
- `artist_profile_hint`
- `source_url` / `track_url`
- `spotify_url` / `youtube_url` / `soundcloud_url` / `bandcamp_url` / `beatport_url`
- `source_tags`
- `album_keywords`
- `energy_band`
- `catalog_role`
- `label_links`
- `social_discovery_links`
- `source_note`

Aliases como `freeform`, `freeform psy`, `freeform psytrance`, `suomi` e `suomisaundi` sao normalizados para o subgenero `freeform` dentro de psytrance.
Aliases como `gabber`, `gabba` e `hardcore techno` sao normalizados para o subgenero `gabber` dentro de techno.

## Colunas recomendadas (artists)

- `artist` (ou `name`)
- `style` (ou `subgenre`)
- `country` / `city`
- `artist_bio`

## Observacoes

- O app mapeia aliases de subgenero (ex.: `hitech`, `full-on night`, `psycore`, `slambient`).
- O import adiciona artistas em seeds/descoberta e tenta adicionar tracks ao catalogo.
- Para estilos estritos, o BPM e validado pela regra do subgenero.
