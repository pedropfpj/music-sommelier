# Psycore Enrichment V4 - 2026-06-21

## Por que este lote existe

O V3 aumentou o volume, mas ainda parecia cru porque quase tudo era faixa. O V4 melhora a camada editorial: cada faixa entra com BPM, fonte, link, notas de confianca, perfil do artista e links de descoberta para social/search.

## Resultado

- 63 faixas novas em `catalog_tracks`;
- 56 perfis em `catalog_artists`;
- 41 perfis publicados;
- 15 perfis em `needs_review` como fila de pesquisa;
- 0 possiveis duplicatas removidas antes de gerar o seed.

## Fontes principais

- BLIND GODS [2026]: 5 faixas
- codex_dataset_pack_v14: 1 faixas
- FORCA DA FLORESTA [2026]: 3 faixas
- MEDICINE FREQUENCIES [2026]: 5 faixas
- Naturaiz Records Vol.1: 2 faixas
- PRIMA MATERIA: 3 faixas
- PSYCHO FOR PALESTINE [2026]: 18 faixas
- System Error: 8 faixas
- verified_track_expansion_v1: 3 faixas
- verified_track_expansion_v4: 14 faixas
- VOODOO-CORE (vol 2): 1 faixas

## Fontes vivas verificadas

- Voodoo Hoodoo Records: https://voodoo-hoodoo.bandcamp.com
- PSYCHO FOR PALESTINE [2026]: https://voodoo-hoodoo.bandcamp.com/album/psycho-for-palestine-2026
- FORCA DA FLORESTA [2026]: https://voodoo-hoodoo.bandcamp.com/album/forca-da-floresta-2026
- MEDICINE FREQUENCIES [2026]: https://voodoo-hoodoo.bandcamp.com/album/medicine-frequencies-2026
- BLIND GODS [2026]: https://voodoo-hoodoo.bandcamp.com/album/blind-gods-2026
- PRIMA MATERIA: https://voodoo-hoodoo.bandcamp.com/album/prima-materia
- Black Out Records / Init Preset - System Error: https://blackoutrec.bandcamp.com/album/system-error
- Naturaiz Records Vol.1: https://naturaizrecords.bandcamp.com/album/natura-z-records-vol-1

## Notas de qualidade

- Linhas Bandcamp usam JSON-LD vivo com track id, duracao, release date e tags.
- Linhas locais entram como `medium` ou `medium_high` quando a fonte principal e seed local ou SoundCloud/Youtube search.
- Links sociais de artista estao marcados como discovery links, nao como oficiais, exceto links de label quando a fonte fornece pagina oficial.
- Perfis `needs_review` servem como fila para o proximo lote e nao devem ser tratados como track proof.
- A fonte antiga Psycore Revenge esta fora do ar, entao nao foi usada como fonte direta de faixa.

## Arquivos

- `data/psycore_enrichment_v4_20260621.csv`
- `data/psycore_artist_profiles_v4_20260621.csv`
- `supabase/seeds/psycore_enrichment_v4_20260621.sql`

## Proximo passo sugerido

Depois de aplicar o SQL, o proximo lote deve focar em uma destas frentes:

1. transformar os perfis `needs_review` em faixas verificadas;
2. buscar links oficiais de Instagram/SoundCloud/Spotify artista por artista;
3. adicionar campos de origem visual, como capa do album e imagem do artista;
4. criar um fluxo no app para usuarios sugerirem artista/faixa e salvar em `catalog_submissions`.
