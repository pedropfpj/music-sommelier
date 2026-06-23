# Psycore Enrichment V5 - 2026-06-21

## Objetivo

O V5 deixa o psycore menos cru: alem de mais faixas, adiciona capa do album, links oficiais de label, links de descoberta social por artista, papel editorial, faixa de energia e fila de artistas para pesquisa.

## Resultado

- 57 faixas novas em `catalog_tracks`;
- 51 faixas com BPM explicito;
- 6 faixas sem BPM explicito, mas com album/tag psycore verificado;
- 85 perfis em `catalog_artists`;
- 52 perfis publicados;
- 33 perfis em `needs_review`;
- 0 duplicatas puladas antes de gerar o seed.

## Fontes importadas como faixas

- VA Flight of The Hummingbird: 18 faixas
- Naturaiz Records Vol. 2 [FREE DOWNLOAD]: 6 faixas
- RITE OF PASSAGE [2026]: 14 faixas
- CURSED FREQUENCIES (Volume 2) [2026]: 13 faixas
- PLANKTON meets Vuduhudu: 6 faixas

## Fontes verificadas nesta rodada

- PLANKTON meets Vuduhudu: https://voodoo-hoodoo.bandcamp.com/album/plankton-meets-vuduhudu
- RITE OF PASSAGE [2026]: https://voodoo-hoodoo.bandcamp.com/album/rite-of-passage-2026
- CURSED FREQUENCIES (Volume 2) [2026]: https://voodoo-hoodoo.bandcamp.com/album/cursed-frequencies-volume-2-2026
- Naturaiz Records Vol. 2 [FREE DOWNLOAD]: https://naturaizrecords.bandcamp.com/album/naturaiz-records-vol-2-free-download
- VA Flight of The Hummingbird: https://blackoutrec.bandcamp.com/album/va-flight-of-the-hummingbird
- MYSTERIUM CONIUNCTIONS - compiled by Oxomo: https://voodoo-hoodoo.bandcamp.com/album/mysterium-coniunctions-compiled-by-oxomo (fila editorial)
- THE ART OF THE BLACK SPELLS - compiled by Neormm: https://voodoo-hoodoo.bandcamp.com/album/the-art-of-the-black-spells-compiled-by-neormm (fila editorial)
- VARAZSLO meets Vuduhudu: https://voodoo-hoodoo.bandcamp.com/album/varazslo-meets-vuduhudu (fila editorial)
- DEPURATUS meets Vuduhudu: https://voodoo-hoodoo.bandcamp.com/album/depuratus-meets-vuduhudu (fila editorial)

## Notas de qualidade

- Todas as fontes foram lidas de JSON-LD vivo do Bandcamp em 2026-06-21.
- Black Out Records entra como `psycore-adjacent` porque a fonte etiqueta principalmente hitech/hightech, nao psycore puro.
- Naturaiz Vol.2 entra mesmo sem BPM porque o album esta etiquetado como Psycore, Hitech, Forest, Darkpsy e representa cena brasileira.
- Perfis `needs_review` nao publicam faixas; servem para pesquisa manual de BPM, biografia e links oficiais no proximo lote.
- Links sociais de artista ainda sao discovery links; links oficiais confirmados sao principalmente de label/publisher.

## Arquivos

- `data/psycore_enrichment_v5_20260621.csv`
- `data/psycore_artist_profiles_v5_20260621.csv`
- `supabase/seeds/psycore_enrichment_v5_20260621.sql`
