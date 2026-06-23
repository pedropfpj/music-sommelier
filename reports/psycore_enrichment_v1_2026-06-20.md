# Psycore Enrichment V1 - 2026-06-20

## Objetivo

Primeiro lote pequeno para enriquecer o subgenero `psycore` sem quebrar o app:

- adicionar artistas reais ligados a uma compilacao com tag `psycore`;
- adicionar faixas individuais com BPM, duracao, label e fonte;
- manter tudo rastreavel para revisao antes de publicar no Supabase.

## Diagnostico local

- O catalogo local ja tem muitos artistas/seeds de `psycore`, mas poucos registros publicaveis com `artist + song`.
- O endpoint de catalogo extra em producao ainda esta pequeno para `psycore`, entao este lote deve melhorar a descoberta com baixo risco.
- A abordagem recomendada e publicar por lotes de 15 a 25 faixas, validar no app, depois repetir.

## Fonte principal escolhida

Fonte: Popol-Vuh Records - `V/A "Xa Xa Namaxitacor" Compiled by Mita`

Motivo:

- A pagina lista faixas, artistas, BPM e duracao.
- A pagina do album inclui tags como `psycore`, `darkpsy` e `forest psytrance`.
- O lancamento e uma boa ancora para expandir `psycore` com coerencia, sem misturar nomes soltos de baixa confianca.

URL:
https://popol-vuh.bandcamp.com/album/v-a-xa-xa-namaxitacor-compiled-by-mita

## Faixas prontas para seed

| # | Artist | Track | BPM | Duration |
| --- | --- | --- | --- | --- |
| 1 | Anacamptis Morio | Wobbashaket | 160 | 07:36 |
| 2 | Mukhtar | Organism | 160 | 07:24 |
| 3 | Romeodark & Sadhana | Aurora Borealis | 186.7 | 08:03 |
| 4 | Dattatreya | Colori Nell Ombra | 196 | 10:37 |
| 5 | Indacoruna | Propolisergica | 198 | 08:55 |
| 6 | Eodem Tempore | Basking Birds | 200 | 10:55 |
| 7 | Whrikk | Voidsurf | 200 | 06:45 |
| 8 | Baco Ames | Dirty Garlic | 200 | 05:36 |
| 9 | Parasitorum | State Of Confusion | 200 | 06:48 |
| 10 | Cinder Vomit | Creating Energy | 200 | 12:20 |
| 11 | Chastrophob | Inoportuno | 210 | 06:14 |
| 12 | Neormm | The Scam Of The Embodied Soul | 220 | 06:58 |
| 13 | Setu Ketu | Koh Chang | 220 | 08:34 |
| 14 | Bolon Yokte Meets Lumnia | Kambo Icarongo | 222 | 09:09 |
| 15 | Mother Of Datura | Between The Layers | 232 | 09:39 |
| 16 | Der Sandmann | La Riata Del Chahuistle | 232 | 10:13 |
| 17 | Chellolive & Ocram | Emozioni | 240 | 11:24 |
| 18 | Mirror Me | Abyssal Tuning | 240 | 07:00 |
| 19 | Nephilim | Automato | 300-384 | 08:08 |
| 20 | Luuli | Form Follows Function | 373 | 08:37 |

## Artistas para catalog_artists

Anacamptis Morio, Mukhtar, Romeodark, Sadhana, Dattatreya, Indacoruna, Eodem Tempore, Whrikk, Baco Ames, Parasitorum, Cinder Vomit, Chastrophob, Neormm, Setu Ketu, Bolon Yokte, Lumnia, Mother Of Datura, Der Sandmann, Chellolive, Ocram, Mirror Me, Nephilim, Luuli.

## Proximo lote sugerido

Depois de aplicar e testar este lote, o proximo caminho natural e validar:

- `V/A Psycore Revenge` da Popol-Vuh Records, que ja aparece nos inventarios locais como ancora de Plankton/Xochipilli;
- roster da Psyko Records para Tzu-Jan, PHRENETICUS e Boris & Olaf & Olga;
- artistas brasileiros/latam do seu lineup local, mas somente depois de achar faixa e fonte por artista.

## Arquivo SQL gerado

Seed pronto para revisao:

`supabase/seeds/psycore_enrichment_v1_20260620.sql`

Nao foi aplicado automaticamente no banco.
