# Psycore Enrichment V3 - 2026-06-20

## Objetivo

Terceiro lote para enriquecer `psycore` com uma fonte viva de Bandcamp e alguns classicos locais reforcados por link externo.

Este pacote evita duplicar V1/V2 e adiciona:

- mais faixas de alta velocidade rastreaveis;
- mais contexto Kamino Records para a ponte `psycore` / `hi-tech`;
- tracks com duracao, data, track id e fonte publica;
- notas de confianca por origem.

## Resultado do pacote

- 18 faixas novas em `catalog_tracks`;
- 5 artistas/projetos em `catalog_artists`;
- 15 faixas ancoradas em Bandcamp/Kamino;
- 3 faixas classicas vindas do dataset local e reforcadas por Deezer.

## Fontes usadas

### Kamino Records - Kashyyyk - Desert Of The Real

URL: https://kamino-records.bandcamp.com/album/desert-of-the-real

Motivo:

- pagina viva no Bandcamp;
- JSON-LD com tags `dark`, `kamino`, `psychedelic`, `psytrance`;
- descricao do album fala em caminho psicodelico de `200 bpm`;
- `trackinfo` da pagina traz track id e duracao por faixa;
- a faixa `Desert Of The Real (Samples)` ficou fora por ser amostra.

Faixas usadas: 10.

### Kamino Records - Audiordinance - Cyber Slang

URL: https://kamino-records.bandcamp.com/album/audiordinance-cyber-slang

Motivo:

- pagina viva no Bandcamp;
- EP de 2025 com todas as faixas trazendo BPM no titulo;
- faixa em 190, 196, 197 e 200 BPM;
- bom reforco moderno para recomendacoes de psycore/hi-tech.

Faixas usadas: 5.

### Deezer + dataset local verificado

Usado para reforcar tres entradas do `data/verified_track_expansion_v4.csv`:

- Dark Whisper - Realms Of Unseen
- Necropsycho - Vanaprastam
- Arjuna - Stand Alone

Motivo:

- ja existiam como seeds locais de `psycore`;
- tiveram correspondencia publica no Deezer com duracao e link de faixa;
- aumentam diversidade de paises: Alemanha, Brasil e Italia.

## Notas de qualidade

Alta confianca:

- `Kashyyyk` e `Audiordinance`: Bandcamp vivo com trackinfo estruturado.
- `Dark Whisper` e `Arjuna`: seed local verificado mais Deezer match direto.

Media confianca:

- `Necropsycho - Vanaprastam`: entra como publicado, mas com nota porque o contexto de album no Deezer difere do label local anterior.

## Arquivos gerados

- `data/psycore_enrichment_v3_20260620.csv`
- `supabase/seeds/psycore_enrichment_v3_20260620.sql`

Nao foi aplicado automaticamente no banco.

## Proximo lote sugerido

Para o V4 de psycore, o melhor caminho e pesquisar fora da Kamino:

- Psyko Records roster com faixas por artista;
- releases atuais de labels brasileiras e latam;
- Bandcamp/Discogs para Plankton, Xochipilli, Tzu-Jan, PHRENETICUS e INFRA;
- links sociais oficiais dos artistas mais fortes.
