# Psycore Enrichment V2 - 2026-06-20

## Objetivo

Segundo lote para enriquecer `psycore` no banco extra do Supabase com mais faixas publicaveis e fontes verificaveis.

Este lote amplia o V1 com:

- mais 30 faixas rastreadas no Bandcamp;
- artistas novos e recorrentes para melhorar diversidade;
- foco em BPM alto, labels independentes e tags/descricoes diretamente ligadas a `psycore`, `darkpsy`, `hitech` ou `experimental`.

## Criterio usado

Para entrar neste lote, a faixa precisava cumprir pelo menos dois pontos:

- pagina publica com tracklist e artista;
- album ou pagina com tag/keyword `Psycore` ou descricao explicitamente psycore;
- BPM declarado no titulo ou metadata da pagina;
- duracao e track id extraidos do JSON-LD do Bandcamp.

Faixas abaixo de 175 BPM foram deixadas fora deste pacote para manter o recorte mais estrito.

## Fontes usadas

### Voodoo Hoodoo Records - VOODOO-CORE (vol 2)

URL: https://voodoo-hoodoo.bandcamp.com/album/voodoo-core-vol-2

Motivo:

- a pagina descreve o release como `PSYCORE Starter Pack`;
- o JSON-LD lista tags como `Psycore`, `darkpsy`, `experimental-psytrance`, `forest-psytrance` e `hitech-psytrance`;
- as faixas trazem BPM no titulo.

Faixas usadas: 10.

### Voodoo Hoodoo Records - VITAL PROGNOSIS

URL: https://voodoo-hoodoo.bandcamp.com/album/vital-prognosis

Motivo:

- a pagina traz tags `psycore`, `darkpsy`, `experimental-psytrance`, `forest-psytrance` e `hitech-psytrance`;
- a descricao fala de som agressivo e recorte darkpsy/angry hitech;
- foram usadas apenas faixas acima de 175 BPM.

Faixas usadas: 9.

### Naturaiz Records - Naturaiz Records Vol.1

URL: https://naturaizrecords.bandcamp.com/album/natura-z-records-vol-1

Motivo:

- fonte de selo brasileiro com tags `Psycore`, `Darkpsy`, `Hitech`, `Psytrance` e `Experimental`;
- boa para aumentar diversidade de fontes brasileiras/latam no catalogo;
- foram usadas faixas acima de 175 BPM.

Faixas usadas: 8.

### Naturaiz Records - Vutt'un - Voluptas In Anima

URL: https://naturaizrecords.bandcamp.com/album/vuttun-voluptas-in-anima

Motivo:

- release em selo brasileiro com tags `Psycore`, `Darkpsy`, `Hitech`, `Psytrance` e `Experimental`;
- tres faixas com BPM declarado: 180, 198 e 210.

Faixas usadas: 3.

## Resultado do pacote

- `30` faixas novas em `catalog_tracks`;
- `31` artistas/projetos derivados em `catalog_artists`;
- todos com `status = published`, porque as fontes possuem tags/descricoes publicas e tracklist rastreavel.

## Arquivos gerados

- `data/psycore_enrichment_v2_20260620.csv`
- `supabase/seeds/psycore_enrichment_v2_20260620.sql`

Nao foi aplicado automaticamente no banco.
