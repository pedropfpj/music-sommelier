# Sonic Search Catalog Extra

Objetivo: adicionar artistas e faixas no Supabase sem quebrar o catálogo local atual.

## Decisao

O catálogo principal continua local por enquanto. O Supabase entra como uma camada extra:

1. `catalog_artists`: artistas extras por estilo;
2. `catalog_tracks`: faixas extras por estilo;
3. `catalog_submissions`: sugestões de usuários para moderação futura.
4. `catalog_enrichments`: respostas boas de APIs server-side para reaproveitar como memória própria.

Assim o app pode evoluir para ler `catálogo local + catálogo extra do banco`.

## Rodar no Supabase

No SQL Editor, rode primeiro:

```sql
-- conteudo de supabase/migrations/20260619024500_catalog_extra.sql
```

Para habilitar a memória de enriquecimentos por API, rode também:

```sql
-- conteudo de supabase/migrations/20260621212000_catalog_enrichments.sql
```

Para testar com poucos dados, rode depois:

```sql
-- conteudo de supabase/seeds/catalog_extra_sample.sql
```

Depois confira no Table Editor se apareceram:

- `catalog_artists`
- `catalog_tracks`
- `catalog_submissions`
- `catalog_enrichments`

## Importar CSVs existentes

Os CSVs em `data/` já combinam com boa parte das colunas:

- `data/artist_expansion_seeds_v10.csv` -> `catalog_artists`
- `data/artist_expansion_seeds_v12.csv` -> `catalog_artists`
- `data/techno_artist_profiles_v4_20260621.csv` -> `catalog_artists`
- `data/techno_enrichment_v4_20260621.csv` -> `catalog_tracks`
- `data/electronic_subgenre_artist_profiles_v15_20260621.csv` -> `catalog_artists`
- `data/electronic_subgenre_expansion_v15_20260621.csv` -> `catalog_tracks` (1.183 linhas, 1.127 previews tocaveis, ate 8 faixas por artista/subgenero)
- `data/catalog_playable_depth_v16_20260622.csv` -> `catalog_tracks` (650 faixas tocaveis para artistas ja existentes)
- `data/codex_dataset_pack_v14/artists.csv` -> `catalog_artists`
- `data/codex_dataset_pack_v14/tracks.csv` -> `catalog_tracks`
- `data/verified_track_expansion_v*.csv` -> `catalog_tracks`

No Supabase Table Editor:

1. abra a tabela desejada;
2. use Import data from CSV;
3. mapeie as colunas com o mesmo nome;
4. deixe `id`, `artist_key`, `track_key`, `created_at` e `updated_at` vazios, porque o banco preenche.

## Segurança

`catalog_artists`, `catalog_tracks` e `catalog_enrichments` têm leitura pública apenas para linhas com:

```text
status = published
```

Usuários autenticados podem criar sugestões em `catalog_submissions`, mas não podem editar diretamente o catálogo publicado.

A escrita em `catalog_enrichments` deve acontecer somente por rotas backend usando `SUPABASE_SERVICE_ROLE_KEY`; nunca coloque service role no frontend.

## Próximo passo no app

Depois das tabelas terem dados, use o endpoint/API para buscar extras:

```text
/api/catalog-extra?style=psycore
```

E então o app mistura:

```text
catálogo local + extras vindos do Supabase
```

Isso evita depender do banco para o app abrir, mas permite enriquecer recomendações aos poucos.

## Variaveis

Local e Vercel:

```bash
SUPABASE_URL=https://SEU-PROJETO.supabase.co
SUPABASE_ANON_KEY=SUA_PUBLISHABLE_KEY
SONIC_CATALOG_EXTRA_ENABLED=true
SONIC_CATALOG_ENRICHMENT_ENABLED=false
# Somente no backend/Vercel, se quiser persistir respostas boas das APIs:
# SUPABASE_SERVICE_ROLE_KEY=SUA_SERVICE_ROLE_KEY
```

Se `SONIC_CATALOG_EXTRA_ENABLED` nao existir, o endpoint usa `SONIC_SOCIAL_ENABLED` como fallback.

Quando `SONIC_CATALOG_ENRICHMENT_ENABLED=true` e `SUPABASE_SERVICE_ROLE_KEY` estiverem configurados no backend, rotas como `/api/track-metadata`, `/api/cover-art`, `/api/artist-profile`, `/api/lastfm-artist` e `/api/radio-browser` salvam enriquecimentos úteis em `catalog_enrichments`.
