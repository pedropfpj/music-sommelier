# Club Styles Enrichment V2 - 2026-06-21

## Objetivo

Adicionar um lote rico e controlado para estilos que ficaram fracos depois do V1: `acid_techno`, `minimal_techno`, `melodic_techno`, `minimal_deep_tech`, `afro_house` e `organic_house`.

## Resultado

- 60 faixas novas em `catalog_tracks`;
- 60 perfis em `catalog_artists`;
- 6 subgeneros cobertos;
- 0 duplicatas puladas antes de gerar o seed.

## Cobertura por estilo

- `acid_techno`: 10 faixas, 10 perfis
- `afro_house`: 10 faixas, 10 perfis
- `melodic_techno`: 10 faixas, 10 perfis
- `minimal_deep_tech`: 10 faixas, 10 perfis
- `minimal_techno`: 10 faixas, 10 perfis
- `organic_house`: 10 faixas, 10 perfis

## O que ficou mais rico

- `catalog_role` para explicar o papel editorial de cada faixa;
- `energy_band` para ajudar recomendacao por energia;
- `source_tags` e `album_keywords` com sinais do subgenero;
- `social_discovery_links` para pesquisa de Instagram, SoundCloud, YouTube e Spotify;
- `label_links` com busca de Beatport e Discogs para revisao manual.

## Notas de qualidade

- O lote usa curadoria editorial e links de descoberta, nao promete que todo link social e oficial.
- `confidence = high` foi usado para anchors classicos ou muito representativos.
- `confidence = medium_high` foi usado para bridges e entradas modernas que ainda merecem revisao final de links oficiais.
- As datas sao marcadas como referencia de ano para catalogo, nao como release metadata completa.

## Arquivos

- `data/club_styles_enrichment_v2_20260621.csv`
- `data/club_styles_artist_profiles_v2_20260621.csv`
- `supabase/seeds/club_styles_enrichment_v2_20260621.sql`
