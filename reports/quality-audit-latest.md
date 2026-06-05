# Quality Audit - Sonic Search

Gerado em: 05/06/2026, 15:24:30
Status: REVISAR

## Resumo

- Faixas auditadas: 577
- Artistas unicos: 1991
- Artistas indexados exibidos no app: 2450
- Musicas buscaveis estimadas no app: 14700
- Media buscavel por artista indexado: 6.0x
- Cobertura auditada versus buscavel: 3.9%
- Gravadoras/labels unicas: 282
- Estilos com faixas: 48
- Artistas vindos de datasets externos: 1926
- Problemas criticos: 0
- Avisos: 422

## Leitura rapida

- Nao ha itens criticos. Os avisos ajudam a enriquecer bio, links, bandeiras e cobertura.
- Depois use a tabela de cobertura para escolher quais subgeneros precisam de mais musicas verificadas, artistas ou labels.
- A métrica de musicas buscaveis mede a capacidade de descoberta do app; faixas auditadas mede o quanto já está verificável no banco local.
- Quando os criticos zerarem, rode `node scripts/quality-audit.mjs --strict` antes de publicar.

## Cobertura por subgenero

| Status | Subgenero | Faixas | Artistas | Labels | Observacao |
| --- | --- | --- | --- | --- | --- |
| Revisar | acid_techno | 10/20 | 24/8 | 7/6 | faltam 10 faixas, 0 artistas, 0 labels |
| Revisar | afro_house | 9/20 | 22/8 | 9/6 | faltam 11 faixas, 0 artistas, 0 labels |
| Revisar | ambient | 13/24 | 106/12 | 7/6 | faltam 11 faixas, 0 artistas, 0 labels |
| Revisar | bass_house | 9/20 | 19/8 | 7/6 | faltam 11 faixas, 0 artistas, 0 labels |
| Revisar | brazilian_funk | 11/20 | 26/10 | 6/4 | faltam 9 faixas, 0 artistas, 0 labels |
| Revisar | breakbeat | 9/20 | 22/8 | 6/6 | faltam 11 faixas, 0 artistas, 0 labels |
| Revisar | chillout | 12/20 | 22/10 | 7/4 | faltam 8 faixas, 0 artistas, 0 labels |
| Revisar | dark_experimental | 11/24 | 49/12 | 4/10 | faltam 13 faixas, 0 artistas, 6 labels |
| Revisar | dark_progressive | 17/24 | 86/8 | 5/6 | faltam 7 faixas, 0 artistas, 1 labels |
| Revisar | dark_psy | 15/20 | 140/8 | 13/6 | faltam 5 faixas, 0 artistas, 0 labels |
| Revisar | deep_house | 10/20 | 21/8 | 9/6 | faltam 10 faixas, 0 artistas, 0 labels |
| Revisar | downtempo | 13/24 | 45/12 | 8/6 | faltam 11 faixas, 0 artistas, 0 labels |
| Revisar | drum_and_bass | 11/20 | 24/8 | 6/6 | faltam 9 faixas, 0 artistas, 0 labels |
| Revisar | dubstep | 12/20 | 22/8 | 7/6 | faltam 8 faixas, 0 artistas, 0 labels |
| Revisar | electro | 9/20 | 24/8 | 6/6 | faltam 11 faixas, 0 artistas, 0 labels |
| Revisar | electro_house | 9/20 | 22/8 | 6/6 | faltam 11 faixas, 0 artistas, 0 labels |
| Revisar | forest_psy | 13/20 | 191/8 | 5/6 | faltam 7 faixas, 0 artistas, 1 labels |
| OK | freeform | 14/12 | 29/4 | 8/0 | Completo |
| Revisar | full_on | 17/28 | 48/12 | 3/8 | faltam 11 faixas, 0 artistas, 5 labels |
| Revisar | full_on_morning | 14/24 | 47/10 | 5/8 | faltam 10 faixas, 0 artistas, 3 labels |
| Revisar | full_on_night | 13/24 | 31/10 | 7/8 | faltam 11 faixas, 0 artistas, 1 labels |
| Revisar | future_garage | 11/20 | 23/8 | 8/6 | faltam 9 faixas, 0 artistas, 0 labels |
| Revisar | gabber | 9/16 | 28/10 | 4/0 | faltam 7 faixas, 0 artistas, 0 labels |
| Revisar | goa_trance | 10/20 | 30/8 | 8/6 | faltam 10 faixas, 0 artistas, 0 labels |
| Revisar | hard_techno | 11/20 | 29/8 | 9/6 | faltam 9 faixas, 0 artistas, 0 labels |
| Revisar | hardstyle | 9/20 | 21/8 | 6/6 | faltam 11 faixas, 0 artistas, 0 labels |
| Revisar | hi_tech | 17/28 | 143/15 | 9/10 | faltam 11 faixas, 0 artistas, 1 labels |
| Revisar | house | 14/20 | 28/8 | 7/6 | faltam 6 faixas, 0 artistas, 0 labels |
| Revisar | idm | 11/20 | 20/8 | 5/6 | faltam 9 faixas, 0 artistas, 1 labels |
| Revisar | industrial_techno | 9/20 | 20/8 | 7/6 | faltam 11 faixas, 0 artistas, 0 labels |
| Revisar | jump_up | 9/20 | 23/8 | 5/6 | faltam 11 faixas, 0 artistas, 1 labels |
| Revisar | jungle | 9/20 | 26/8 | 8/6 | faltam 11 faixas, 0 artistas, 0 labels |
| Revisar | liquid_dnb | 11/20 | 26/8 | 5/6 | faltam 9 faixas, 0 artistas, 1 labels |
| Revisar | melodic_techno | 11/20 | 26/8 | 7/6 | faltam 9 faixas, 0 artistas, 0 labels |
| Revisar | minimal_techno | 11/20 | 30/8 | 7/6 | faltam 9 faixas, 0 artistas, 0 labels |
| Revisar | neurofunk | 11/20 | 22/8 | 8/6 | faltam 9 faixas, 0 artistas, 0 labels |
| Revisar | organic_house | 9/20 | 26/8 | 8/6 | faltam 11 faixas, 0 artistas, 0 labels |
| Revisar | peak_time_techno | 9/20 | 25/8 | 5/6 | faltam 11 faixas, 0 artistas, 1 labels |
| Revisar | progressive_house | 9/20 | 24/8 | 7/6 | faltam 11 faixas, 0 artistas, 0 labels |
| Revisar | progressive_psy | 15/24 | 80/8 | 5/8 | faltam 9 faixas, 0 artistas, 3 labels |
| Revisar | psy_comercial | 11/20 | 25/8 | 8/6 | faltam 9 faixas, 0 artistas, 0 labels |
| OK | psycore | 12/10 | 129/8 | 7/0 | Completo |
| Revisar | psytrance | 13/20 | 38/8 | 7/6 | faltam 7 faixas, 0 artistas, 0 labels |
| OK | slambient | 32/14 | 136/8 | 4/1 | Completo |
| Revisar | tech_house | 17/20 | 29/8 | 10/6 | faltam 3 faixas, 0 artistas, 0 labels |
| Revisar | techno | 15/20 | 37/8 | 12/6 | faltam 5 faixas, 0 artistas, 0 labels |
| Revisar | trance_uplifting | 10/20 | 35/8 | 8/6 | faltam 10 faixas, 0 artistas, 0 labels |
| Revisar | uk_garage | 11/20 | 22/8 | 9/6 | faltam 9 faixas, 0 artistas, 0 labels |

## Problemas principais

| Severidade | Escopo | Problema | Detalhe |
| --- | --- | --- | --- |
| Aviso | 999999999 | Faixa duplicada no catalogo. | LOCAL_TRACK_SEED_BOOST:hard_techno, data/verified_track_expansion_v1.csv:hard_techno |
| Aviso | 999999999 - X0004000X [hard_techno] | Sem link externo verificavel. | LOCAL_TRACK_SEED_BOOST |
| Aviso | Ace Ventura | Faixa duplicada no catalogo. | catalog:psytrance, LOCAL_TRACK_SEED_BOOST:progressive_psy |
| Aviso | Ace Ventura - Presence [progressive_psy] | Sem link externo verificavel. | LOCAL_TRACK_SEED_BOOST |
| Aviso | acid_techno | Cobertura abaixo do alvo. | faltam 10 faixas, 0 artistas, 0 labels |
| Aviso | Adam Beyer - Your Mind [techno] | Sem link externo verificavel. | LOCAL_TRACK_SEED_BOOST |
| Aviso | afro_house | Cobertura abaixo do alvo. | faltam 11 faixas, 0 artistas, 0 labels |
| Aviso | Agodark | Artista sem origem/bandeira confiavel. | Adicionar artistCountry ou origem canonica. |
| Aviso | Air | Faixa duplicada no catalogo. | LOCAL_TRACK_SEED_BOOST:chillout, data/verified_track_expansion_v1.csv:chillout |
| Aviso | Air - La femme d'argent [chillout] | BPM ausente ou ilegivel. | LOCAL_TRACK_SEED_BOOST |
| Aviso | Air - La femme d'argent [chillout] | Sem link externo verificavel. | LOCAL_TRACK_SEED_BOOST |
| Aviso | AIRI | Artista sem origem/bandeira confiavel. | Adicionar artistCountry ou origem canonica. |
| Aviso | AIRI - Starship [dark_progressive] | Sem link externo verificavel. | LOCAL_TRACK_SEED_BOOST |
| Aviso | Akephalos | Artista sem origem/bandeira confiavel. | Adicionar artistCountry ou origem canonica. |
| Aviso | Akuma | Artista sem origem/bandeira confiavel. | Adicionar artistCountry ou origem canonica. |
| Aviso | Alumbra | Artista sem origem/bandeira confiavel. | Adicionar artistCountry ou origem canonica. |
| Aviso | Aly & Fila | Faixa duplicada no catalogo. | LOCAL_TRACK_SEED_BOOST:trance_uplifting, data/verified_track_expansion_v1.csv:trance_uplifting |
| Aviso | Aly & Fila - We Control The Sunlight [trance_uplifting] | Sem link externo verificavel. | LOCAL_TRACK_SEED_BOOST |
| Aviso | ambient | Cobertura abaixo do alvo. | faltam 11 faixas, 0 artistas, 0 labels |
| Aviso | Amelie Lens | Faixa duplicada no catalogo. | LOCAL_TRACK_SEED_BOOST:techno, data/verified_track_expansion_v1.csv:peak_time_techno |
| Aviso | Amelie Lens - Hypnotized [techno] | Sem link externo verificavel. | LOCAL_TRACK_SEED_BOOST |
| Aviso | Andy C | Faixa duplicada no catalogo. | LOCAL_TRACK_SEED_BOOST:drum_and_bass, data/verified_track_expansion_v1.csv:drum_and_bass |
| Aviso | Andy C - Heartbeat Loud [drum_and_bass] | Sem link externo verificavel. | LOCAL_TRACK_SEED_BOOST |
| Aviso | Angerfist | Faixa duplicada no catalogo. | catalog:gabber, LOCAL_TRACK_SEED_BOOST:gabber, data/verified_track_expansion_v1.csv:gabber |
| Aviso | Angerfist - Raise Your Fist [gabber] | Sem link externo verificavel. | LOCAL_TRACK_SEED_BOOST |
| Aviso | AnkouDead | Artista sem origem/bandeira confiavel. | Adicionar artistCountry ou origem canonica. |
| Aviso | AnkouDead - Daydream [dark_experimental] | BPM ausente ou ilegivel. | LOCAL_TRACK_SEED_BOOST |
| Aviso | AnkouDead - Poeira de Estrela [dark_experimental] | BPM ausente ou ilegivel. | LOCAL_TRACK_SEED_BOOST |
| Aviso | ANNA - Hidden Beauties [techno] | Sem bio ou pista editorial do artista. | LOCAL_TRACK_SEED_BOOST |
| Aviso | ANNA - Hidden Beauties [techno] | Sem link externo verificavel. | LOCAL_TRACK_SEED_BOOST |
| Aviso | Anyma - Explore Your Future [melodic_techno] | Sem bio ou pista editorial do artista. | LOCAL_TRACK_SEED_BOOST |
| Aviso | Anyma - Explore Your Future [melodic_techno] | Sem link externo verificavel. | LOCAL_TRACK_SEED_BOOST |
| Aviso | Aphex Twin | Faixa duplicada no catalogo. | catalog:idm, data/verified_track_expansion_v3.csv:idm |
| Aviso | Aphex Twin | Faixa duplicada no catalogo. | catalog:idm, data/verified_track_expansion_v1.csv:ambient |
| Aviso | Aphex Twin - #3 [ambient] | Sem link externo verificavel. | LOCAL_TRACK_SEED_BOOST |
| Aviso | Arcek | Faixa duplicada no catalogo. | data/verified_track_expansion_v1.csv:hi_tech, data/codex_dataset_pack_v14/tracks.csv:hi_tech |
| Aviso | Arjuna | Faixa duplicada no catalogo. | LOCAL_TRACK_SEED_BOOST:forest_psy, data/verified_track_expansion_v1.csv:forest_psy |
| Aviso | Arjuna - Primal Contact [forest_psy] | Sem link externo verificavel. | LOCAL_TRACK_SEED_BOOST |
| Aviso | Astral Projection | Faixa duplicada no catalogo. | catalog:goa_trance, data/verified_track_expansion_v1.csv:goa_trance |
| Aviso | Astrix | Faixa duplicada no catalogo. | catalog:psytrance, data/verified_track_expansion_v3.csv:psy_comercial |
| Aviso | Astrix - He.art [psytrance] | Sem bio ou pista editorial do artista. | LOCAL_TRACK_SEED_BOOST |
| Aviso | Astrix - He.art [psytrance] | Sem link externo verificavel. | LOCAL_TRACK_SEED_BOOST |
| Aviso | At Work | Artista sem origem/bandeira confiavel. | Adicionar artistCountry ou origem canonica. |
| Aviso | At Work - Lunar Odyssey [freeform] | BPM ausente ou ilegivel. | LOCAL_TRACK_SEED_BOOST |
| Aviso | Atriohm - Takums [forest_psy] | Sem bio ou pista editorial do artista. | LOCAL_TRACK_SEED_BOOST |
| Aviso | Atriohm - Takums [forest_psy] | Sem link externo verificavel. | LOCAL_TRACK_SEED_BOOST |
| Aviso | Audio Syntax | Artista sem origem/bandeira confiavel. | Adicionar artistCountry ou origem canonica. |
| Aviso | Audionimus | Artista sem origem/bandeira confiavel. | Adicionar artistCountry ou origem canonica. |
| Aviso | Audiophatik | Artista sem origem/bandeira confiavel. | Adicionar artistCountry ou origem canonica. |
| Aviso | Audiosyntax | Artista sem origem/bandeira confiavel. | Adicionar artistCountry ou origem canonica. |
| Aviso | Audiosyntax - Shadow Protocol [dark_psy] | Sem bio ou pista editorial do artista. | LOCAL_TRACK_SEED_BOOST |
| Aviso | Audiosyntax - Shadow Protocol [dark_psy] | Sem link externo verificavel. | LOCAL_TRACK_SEED_BOOST |
| Aviso | Autechre | Faixa duplicada no catalogo. | catalog:idm, LOCAL_TRACK_SEED_BOOST:idm |
| Aviso | Autechre - Bike [idm] | Sem link externo verificavel. | LOCAL_TRACK_SEED_BOOST |
| Aviso | Avalon | Faixa duplicada no catalogo. | catalog:full_on, catalog:full_on_morning |
| Aviso | Avalon - The Journey [full_on_morning] | Sem bio ou pista editorial do artista. | LOCAL_TRACK_SEED_BOOST |
| Aviso | Avalon - The Journey [full_on_morning] | Sem link externo verificavel. | LOCAL_TRACK_SEED_BOOST |
| Aviso | Bardo | Artista sem origem/bandeira confiavel. | Adicionar artistCountry ou origem canonica. |
| Aviso | Bardo - Recitativos [dark_experimental] | BPM ausente ou ilegivel. | LOCAL_TRACK_SEED_BOOST |
| Aviso | bass_house | Cobertura abaixo do alvo. | faltam 11 faixas, 0 artistas, 0 labels |
| Aviso | Biosphere | Faixa duplicada no catalogo. | LOCAL_TRACK_SEED_BOOST:ambient, data/verified_track_expansion_v1.csv:ambient |
| Aviso | Biosphere - Poa Alpina [ambient] | Sem bio ou pista editorial do artista. | LOCAL_TRACK_SEED_BOOST |
| Aviso | Biosphere - Poa Alpina [ambient] | Sem link externo verificavel. | LOCAL_TRACK_SEED_BOOST |
| Aviso | Black Coffee - Turn Me On [afro_house] | Sem link externo verificavel. | LOCAL_TRACK_SEED_BOOST |
| Aviso | Black Sun Empire | Faixa duplicada no catalogo. | LOCAL_TRACK_SEED_BOOST:neurofunk, data/verified_track_expansion_v1.csv:neurofunk |
| Aviso | Black Sun Empire - Arrakis [neurofunk] | Sem link externo verificavel. | LOCAL_TRACK_SEED_BOOST |
| Aviso | Bonobo | Faixa duplicada no catalogo. | catalog:downtempo, LOCAL_TRACK_SEED_BOOST:downtempo, data/verified_track_expansion_v1.csv:downtempo |
| Aviso | Bonobo - Kiara [downtempo] | BPM ausente ou ilegivel. | LOCAL_TRACK_SEED_BOOST |
| Aviso | Bonobo - Kiara [downtempo] | Sem link externo verificavel. | LOCAL_TRACK_SEED_BOOST |
| Aviso | brazilian_funk | Cobertura abaixo do alvo. | faltam 9 faixas, 0 artistas, 0 labels |
| Aviso | breakbeat | Cobertura abaixo do alvo. | faltam 11 faixas, 0 artistas, 0 labels |
| Aviso | Brennan Heart | Faixa duplicada no catalogo. | catalog:hardstyle, data/verified_track_expansion_v3.csv:hardstyle |
| Aviso | Brian Eno | Faixa duplicada no catalogo. | catalog:ambient, LOCAL_TRACK_SEED_BOOST:ambient, data/verified_track_expansion_v1.csv:ambient |
| Aviso | Brian Eno - An Ending (Ascent) [ambient] | Sem link externo verificavel. | LOCAL_TRACK_SEED_BOOST |
| Aviso | Burial | Faixa duplicada no catalogo. | catalog:future_garage, LOCAL_TRACK_SEED_BOOST:future_garage, data/verified_track_expansion_v1.csv:future_garage |
| Aviso | Burial - Archangel [future_garage] | Sem link externo verificavel. | LOCAL_TRACK_SEED_BOOST |
| Aviso | Burn In Noise | Faixa duplicada no catalogo. | catalog:full_on, catalog:full_on_night |
| Aviso | Burn In Noise | Faixa duplicada no catalogo. | LOCAL_TRACK_SEED_BOOST:full_on, data/verified_track_expansion_v1.csv:full_on_night |
| Aviso | Burn In Noise - Transparent [full_on] | Sem link externo verificavel. | LOCAL_TRACK_SEED_BOOST |
| Aviso | Calibre | Faixa duplicada no catalogo. | LOCAL_TRACK_SEED_BOOST:liquid_dnb, data/verified_track_expansion_v1.csv:liquid_dnb |

## Como usar

- Rode `node scripts/quality-audit.mjs` para gerar este relatorio sem bloquear o fluxo.
- Rode `node scripts/quality-audit.mjs --strict` quando quiser falhar o processo se houver problema critico.
- Use este relatorio antes de commit/push para evitar recomendacao errada, falta de bandeira e catalogo fraco.
