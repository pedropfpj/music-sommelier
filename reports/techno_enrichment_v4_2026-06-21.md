# Techno Enrichment V4 - 2026-06-21

## Objetivo

Aumentar artistas e faixas de techno, tech house, acid techno e subgeneros de techno no Sonic Search.

## Resultado

- 189 novos seeds em `catalog_artists` via `artist_expansion_seeds_v12.csv`;
- 80 faixas em `catalog_tracks`;
- 222 perfis em `catalog_artists` no seed Supabase v4;
- 17 subgeneros cobertos.

## Cobertura de artistas V12

- `acid_techno`: 12 artistas
- `ambient_techno`: 17 artistas
- `bleep_techno`: 9 artistas
- `broken_techno`: 18 artistas
- `deep_techno`: 23 artistas
- `detroit_techno`: 11 artistas
- `ebm`: 8 artistas
- `hardgroove_techno`: 20 artistas
- `hypnotic_techno`: 9 artistas
- `peak_time_techno`: 1 artista
- `raw_techno`: 8 artistas
- `schranz`: 11 artistas
- `tech_house`: 15 artistas
- `techno`: 12 artistas
- `tribal_techno`: 15 artistas

## Cobertura de faixas V4

- `acid_techno`: 6 faixas
- `ambient_techno`: 4 faixas
- `bleep_techno`: 5 faixas
- `broken_techno`: 6 faixas
- `deep_techno`: 6 faixas
- `detroit_techno`: 2 faixas
- `dub_techno`: 4 faixas
- `ebm`: 4 faixas
- `hardgroove_techno`: 4 faixas
- `hypnotic_techno`: 5 faixas
- `industrial_techno`: 4 faixas
- `peak_time_techno`: 4 faixas
- `raw_techno`: 4 faixas
- `schranz`: 4 faixas
- `tech_house`: 8 faixas
- `techno`: 5 faixas
- `tribal_techno`: 5 faixas

## Notas

- Links sao discovery/search links para revisao e descoberta, nao garantia de social oficial.
- O lote usa `confidence = editorial` em metadata.
- A expansao prioriza subgeneros que estavam sem seeds dedicados: `deep_techno`, `ambient_techno`, `bleep_techno`, `tribal_techno`, `hardgroove_techno` e `broken_techno`.
- As entradas locais do app usam o mesmo recorte, sem marcar preview oficial como verificado.

## Arquivos

- `data/artist_expansion_seeds_v12.csv`
- `data/techno_enrichment_v4_20260621.csv`
- `data/techno_artist_profiles_v4_20260621.csv`
- `supabase/seeds/techno_enrichment_v4_20260621.sql`
- `supabase/seeds/techno_artist_expansion_v12_20260621.sql`
