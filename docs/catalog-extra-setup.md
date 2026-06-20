# Sonic Search Catalog Extra

Objetivo: adicionar artistas e faixas no Supabase sem quebrar o catálogo local atual.

## Decisao

O catálogo principal continua local por enquanto. O Supabase entra como uma camada extra:

1. `catalog_artists`: artistas extras por estilo;
2. `catalog_tracks`: faixas extras por estilo;
3. `catalog_submissions`: sugestões de usuários para moderação futura.

Assim o app pode evoluir para ler `catálogo local + catálogo extra do banco`.

## Rodar no Supabase

No SQL Editor, rode primeiro:

```sql
-- conteudo de supabase/migrations/20260619024500_catalog_extra.sql
```

Para testar com poucos dados, rode depois:

```sql
-- conteudo de supabase/seeds/catalog_extra_sample.sql
```

Depois confira no Table Editor se apareceram:

- `catalog_artists`
- `catalog_tracks`
- `catalog_submissions`

## Importar CSVs existentes

Os CSVs em `data/` já combinam com boa parte das colunas:

- `data/artist_expansion_seeds_v10.csv` -> `catalog_artists`
- `data/codex_dataset_pack_v14/artists.csv` -> `catalog_artists`
- `data/codex_dataset_pack_v14/tracks.csv` -> `catalog_tracks`
- `data/verified_track_expansion_v*.csv` -> `catalog_tracks`

No Supabase Table Editor:

1. abra a tabela desejada;
2. use Import data from CSV;
3. mapeie as colunas com o mesmo nome;
4. deixe `id`, `artist_key`, `track_key`, `created_at` e `updated_at` vazios, porque o banco preenche.

## Segurança

`catalog_artists` e `catalog_tracks` têm leitura pública apenas para linhas com:

```text
status = published
```

Usuários autenticados podem criar sugestões em `catalog_submissions`, mas não podem editar diretamente o catálogo publicado.

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
```

Se `SONIC_CATALOG_EXTRA_ENABLED` nao existir, o endpoint usa `SONIC_SOCIAL_ENABLED` como fallback.
