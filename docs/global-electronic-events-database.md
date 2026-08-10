# Banco global de festas e festivais eletronicos

## Resultado do MVP

O banco foi desenhado para o Supabase/PostgreSQL que o Sonic Search ja utiliza. A primeira carga contem:

- 60 marcas de eventos;
- 50 festivais ou franquias de festivais;
- 10 series de festas e ecossistemas globais;
- 22 generos normalizados;
- 46 posicoes verificadas no DJ Mag Top 100 Festivals 2026;
- uma fonte oficial por marca;
- um benchmark oficial de publico do EDC Las Vegas para demonstrar a classificacao correta da metrica.

Arquivos principais:

- `supabase/migrations/20260713000100_global_electronic_events.sql`: estrutura do banco;
- `data/global_electronic_events_seed_20260713.csv`: fonte editavel da carga inicial;
- `supabase/seeds/global_electronic_events_seed_20260713.sql`: carga SQL gerada;
- `scripts/generate-global-electronic-events-seed.mjs`: validacao e geracao do SQL.

## Principio do modelo

Uma marca e uma edicao nao sao a mesma entidade:

- `Tomorrowland Belgium` e a marca permanente;
- `Tomorrowland Belgium 2026 - Weekend 1` seria uma edicao;
- datas, local, lineup e precos pertencem a edicao;
- ranking, publico e seguidores sao fatos historicos com data e fonte.

O modelo tambem separa `unique_attendees`, `cumulative_entries`, `daily_average`, `daily_peak`, `licensed_capacity` e `tickets_sold`. Esses valores nao devem ser somados ou comparados como se fossem a mesma medida.

## Dicionario das tabelas

| Tabela | Finalidade |
| --- | --- |
| `electronic_event_brands` | Cadastro permanente de festivais, franquias, festas e programas urbanos. |
| `electronic_event_editions` | Ocorrencias datadas da marca. Uma marca pode ter mais de uma edicao no mesmo ano. |
| `electronic_event_venues` | Locais fisicos, coordenadas, fuso e capacidade declarada. |
| `electronic_event_organizers` | Organizadores, produtores, promotores e proprietarios. |
| `electronic_event_brand_organizers` | Relacao historica entre marcas e organizadores. |
| `electronic_event_genres` | Vocabulário controlado de generos e familias. |
| `electronic_event_brand_genres` | Generos associados a cada marca. |
| `electronic_event_artists` | Identidade de artistas com suporte a MusicBrainz e Wikidata. |
| `electronic_event_lineups` | Artista, palco, horario e status dentro de uma edicao. |
| `electronic_event_sources` | Paginas oficiais, autoridades, rankings, imprensa e bases externas. |
| `electronic_event_source_links` | Quais fatos de cada evento uma fonte sustenta. |
| `electronic_event_attendance_metrics` | Publico, entradas, capacidade ou ingressos vendidos com semantica explicita. |
| `electronic_event_rankings` | Rankings externos por ano e categoria. |
| `electronic_event_ticket_prices` | Preco nominal, taxa, moeda, lote e data de captura. |
| `electronic_event_social_snapshots` | Fotografias historicas de seguidores, inscritos e visualizacoes. |
| `electronic_events_directory` | View publica simplificada para API, busca e painel. |

## Campos centrais da marca

| Campo | Significado |
| --- | --- |
| `slug` | Identificador estavel para URL e integracoes. |
| `event_type` | Festival, serie de festivais, serie de festas, programa urbano ou festival multigenero. |
| `electronic_focus` | `exclusive`, `primary` ou `significant`. |
| `market_tier` | Megaevento global, grande global, grande regional ou referencia especializada. |
| `franchise_name` | Agrupa edicoes como EDC, ULTRA, Tomorrowland e Creamfields. |
| `selection_basis` | Explica por que a marca entrou na primeira curadoria. |
| `lifecycle_status` | Estado permanente da marca. Cancelamento de uma edicao nao inativa automaticamente a marca. |
| `publication_status` | Controla a exposicao publica pelo RLS do Supabase. |
| `data_quality` | `verified`, `curated` ou `needs_review`. |

## Como interpretar as fontes

| Grau | Uso recomendado |
| --- | --- |
| A | Site oficial, organizador, autoridade publica ou documento original. |
| B | Ranking original ou veiculo especializado com metodologia identificavel. |
| C | Imprensa secundaria ou base colaborativa ainda nao confirmada. |
| D | Rede social, estimativa ou informacao ainda sem verificacao independente. |

O ranking da DJ Mag foi guardado como uma votacao de leitores. Ele serve como indicador de popularidade e influencia; nao como medida de publico ou capacidade.

## Instalacao

No SQL Editor do Supabase, execute nesta ordem:

1. `supabase/migrations/20260713000100_global_electronic_events.sql`;
2. `supabase/seeds/global_electronic_events_seed_20260713.sql`.

Com acesso direto ao PostgreSQL:

```bash
psql "$DATABASE_URL" -v ON_ERROR_STOP=1 -f supabase/migrations/20260713000100_global_electronic_events.sql
psql "$DATABASE_URL" -v ON_ERROR_STOP=1 -f supabase/seeds/global_electronic_events_seed_20260713.sql
```

As duas operacoes sao idempotentes para a carga inicial: marcas, generos, fontes, rankings e o benchmark demonstrativo sao atualizados por chaves estaveis.

## Validacao e regeneracao

Depois de alterar o CSV, valide sem escrever o SQL:

```bash
node scripts/generate-global-electronic-events-seed.mjs --check
```

Para validar e regenerar a carga SQL:

```bash
node scripts/generate-global-electronic-events-seed.mjs
```

O script bloqueia slugs, nomes, URLs, paises e posicoes de ranking duplicados. Ele tambem exige pelo menos 50 marcas e valida os vocabularios fechados usados pela migration.

## Consultas iniciais

Maiores por popularidade no ranking de 2026:

```sql
select name, home_country_code, latest_djmag_rank
from public.electronic_events_directory
where latest_djmag_year = 2026
order by latest_djmag_rank;
```

Festivais da America do Sul:

```sql
select name, home_city, home_country_code, genres
from public.electronic_events_directory
where continent = 'South America'
order by market_tier, name;
```

Comparar apenas a mesma definicao de publico:

```sql
select
  b.name,
  m.reference_year,
  m.metric_type,
  m.metric_value,
  m.metric_unit,
  m.comparison_operator,
  s.url as source_url
from public.electronic_event_attendance_metrics m
join public.electronic_event_brands b on b.id = m.event_brand_id
join public.electronic_event_sources s on s.id = m.source_id
where m.metric_type = 'cumulative_entries'
order by m.metric_value desc;
```

Encontrar todas as edicoes de uma franquia:

```sql
select b.franchise_name, b.name, e.name as edition, e.starts_on, e.country_code
from public.electronic_event_brands b
join public.electronic_event_editions e on e.event_brand_id = b.id
where b.franchise_name = 'ULTRA Worldwide'
order by e.starts_on;
```

## Politica de manutencao

- Marcas e URLs oficiais: revisar a cada trimestre.
- Edicoes anunciadas: revisar semanalmente durante a temporada de vendas.
- Lineups e precos: guardar cada captura com fonte e data.
- Publico: registrar apenas depois de identificar a definicao usada pela fonte.
- Rankings: importar uma nova linha por ano sem apagar o historico.
- Redes sociais: usar snapshots mensais em vez de sobrescrever o numero anterior.

Um indice composto de “maior festival” deve ser criado somente depois de existir cobertura suficiente de publico comparavel. Ate la, use rankings separados para popularidade, publico diario, entradas acumuladas, capacidade, alcance geografico e preco.
