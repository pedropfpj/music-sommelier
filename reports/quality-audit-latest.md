# Quality Audit - Sonic Search

Gerado em: 04/06/2026, 09:50:02
Status: REVISAR

## Resumo

- Faixas auditadas: 264
- Artistas unicos: 1479
- Gravadoras/labels unicas: 146
- Estilos com faixas: 48
- Artistas vindos de datasets externos: 1330
- Problemas criticos: 0
- Avisos: 390

## Leitura rapida

- Nao ha itens criticos. Os avisos ajudam a enriquecer bio, links, bandeiras e cobertura.
- Depois use a tabela de cobertura para escolher quais subgeneros precisam de mais musicas, artistas ou labels.
- Quando os criticos zerarem, rode `node scripts/quality-audit.mjs --strict` antes de publicar.

## Cobertura por subgenero

| Status | Subgenero | Faixas | Artistas | Labels | Observacao |
| --- | --- | --- | --- | --- | --- |
| Revisar | acid_techno | 4/20 | 11/8 | 4/6 | faltam 16 faixas, 0 artistas, 2 labels |
| Revisar | afro_house | 3/20 | 12/8 | 3/6 | faltam 17 faixas, 0 artistas, 3 labels |
| Revisar | ambient | 7/24 | 95/12 | 6/6 | faltam 17 faixas, 0 artistas, 0 labels |
| Revisar | bass_house | 3/20 | 10/8 | 2/6 | faltam 17 faixas, 0 artistas, 4 labels |
| Revisar | brazilian_funk | 5/20 | 12/10 | 4/4 | faltam 15 faixas, 0 artistas, 0 labels |
| Revisar | breakbeat | 3/20 | 10/8 | 3/6 | faltam 17 faixas, 0 artistas, 3 labels |
| Revisar | chillout | 6/20 | 12/10 | 6/4 | faltam 14 faixas, 0 artistas, 0 labels |
| Revisar | dark_experimental | 8/24 | 35/12 | 1/10 | faltam 16 faixas, 0 artistas, 9 labels |
| Revisar | dark_progressive | 7/24 | 75/8 | 2/6 | faltam 17 faixas, 0 artistas, 4 labels |
| Revisar | dark_psy | 11/20 | 129/8 | 11/6 | faltam 9 faixas, 0 artistas, 0 labels |
| Revisar | deep_house | 4/20 | 12/8 | 4/6 | faltam 16 faixas, 0 artistas, 2 labels |
| Revisar | downtempo | 7/24 | 37/12 | 6/6 | faltam 17 faixas, 0 artistas, 0 labels |
| Revisar | drum_and_bass | 5/20 | 13/8 | 4/6 | faltam 15 faixas, 0 artistas, 2 labels |
| Revisar | dubstep | 3/20 | 12/8 | 2/6 | faltam 17 faixas, 0 artistas, 4 labels |
| Revisar | electro | 3/20 | 11/8 | 3/6 | faltam 17 faixas, 0 artistas, 3 labels |
| Revisar | electro_house | 3/20 | 10/8 | 3/6 | faltam 17 faixas, 0 artistas, 3 labels |
| Revisar | forest_psy | 6/20 | 185/8 | 3/6 | faltam 14 faixas, 0 artistas, 3 labels |
| Revisar | freeform | 11/12 | 16/4 | 6/0 | faltam 1 faixas, 0 artistas, 0 labels |
| Revisar | full_on | 6/28 | 32/12 | 2/8 | faltam 22 faixas, 0 artistas, 6 labels |
| Revisar | full_on_morning | 4/24 | 35/10 | 2/8 | faltam 20 faixas, 0 artistas, 6 labels |
| Revisar | full_on_night | 3/24 | 12/10 | 2/8 | faltam 21 faixas, 0 artistas, 6 labels |
| Revisar | future_garage | 3/20 | 11/8 | 2/6 | faltam 17 faixas, 0 artistas, 4 labels |
| Revisar | gabber | 3/16 | 23/10 | 2/0 | faltam 13 faixas, 0 artistas, 0 labels |
| Revisar | goa_trance | 4/20 | 13/8 | 4/6 | faltam 16 faixas, 0 artistas, 2 labels |
| Revisar | hard_techno | 5/20 | 16/8 | 4/6 | faltam 15 faixas, 0 artistas, 2 labels |
| Revisar | hardstyle | 3/20 | 10/8 | 2/6 | faltam 17 faixas, 0 artistas, 4 labels |
| Revisar | hi_tech | 8/28 | 137/15 | 5/10 | faltam 20 faixas, 0 artistas, 5 labels |
| Revisar | house | 6/20 | 13/8 | 2/6 | faltam 14 faixas, 0 artistas, 4 labels |
| Revisar | idm | 5/20 | 12/8 | 4/6 | faltam 15 faixas, 0 artistas, 2 labels |
| Revisar | industrial_techno | 3/20 | 11/8 | 2/6 | faltam 17 faixas, 0 artistas, 4 labels |
| Revisar | jump_up | 3/20 | 13/8 | 2/6 | faltam 17 faixas, 0 artistas, 4 labels |
| Revisar | jungle | 3/20 | 12/8 | 3/6 | faltam 17 faixas, 0 artistas, 3 labels |
| Revisar | liquid_dnb | 5/20 | 13/8 | 4/6 | faltam 15 faixas, 0 artistas, 2 labels |
| Revisar | melodic_techno | 5/20 | 13/8 | 4/6 | faltam 15 faixas, 0 artistas, 2 labels |
| Revisar | minimal_techno | 5/20 | 13/8 | 5/6 | faltam 15 faixas, 0 artistas, 1 labels |
| Revisar | neurofunk | 5/20 | 12/8 | 5/6 | faltam 15 faixas, 0 artistas, 1 labels |
| Revisar | organic_house | 3/20 | 12/8 | 3/6 | faltam 17 faixas, 0 artistas, 3 labels |
| Revisar | peak_time_techno | 3/20 | 10/8 | 3/6 | faltam 17 faixas, 0 artistas, 3 labels |
| Revisar | progressive_house | 3/20 | 13/8 | 3/6 | faltam 17 faixas, 0 artistas, 3 labels |
| Revisar | progressive_psy | 5/24 | 70/8 | 1/8 | faltam 19 faixas, 0 artistas, 7 labels |
| Revisar | psy_comercial | 5/20 | 13/8 | 4/6 | faltam 15 faixas, 0 artistas, 2 labels |
| Revisar | psycore | 9/10 | 121/8 | 3/0 | faltam 1 faixas, 0 artistas, 0 labels |
| Revisar | psytrance | 6/20 | 19/8 | 6/6 | faltam 14 faixas, 0 artistas, 0 labels |
| OK | slambient | 29/14 | 135/8 | 2/1 | Completo |
| Revisar | tech_house | 9/20 | 20/8 | 6/6 | faltam 11 faixas, 0 artistas, 0 labels |
| Revisar | techno | 7/20 | 21/8 | 5/6 | faltam 13 faixas, 0 artistas, 1 labels |
| Revisar | trance_uplifting | 4/20 | 13/8 | 3/6 | faltam 16 faixas, 0 artistas, 3 labels |
| Revisar | uk_garage | 3/20 | 11/8 | 2/6 | faltam 17 faixas, 0 artistas, 4 labels |

## Problemas principais

| Severidade | Escopo | Problema | Detalhe |
| --- | --- | --- | --- |
| Aviso | 999999999 - X0004000X [hard_techno] | Sem link externo verificavel. | LOCAL_TRACK_SEED_BOOST |
| Aviso | Ace Ventura | Faixa duplicada no catalogo. | catalog:psytrance, LOCAL_TRACK_SEED_BOOST:progressive_psy |
| Aviso | Ace Ventura - Presence [progressive_psy] | Sem link externo verificavel. | LOCAL_TRACK_SEED_BOOST |
| Aviso | acid_techno | Cobertura abaixo do alvo. | faltam 16 faixas, 0 artistas, 2 labels |
| Aviso | Adam Beyer - Your Mind [techno] | Sem link externo verificavel. | LOCAL_TRACK_SEED_BOOST |
| Aviso | afro_house | Cobertura abaixo do alvo. | faltam 17 faixas, 0 artistas, 3 labels |
| Aviso | Agodark | Artista sem origem/bandeira confiavel. | Adicionar artistCountry ou origem canonica. |
| Aviso | Air - La femme d'argent [chillout] | BPM ausente ou ilegivel. | LOCAL_TRACK_SEED_BOOST |
| Aviso | Air - La femme d'argent [chillout] | Sem link externo verificavel. | LOCAL_TRACK_SEED_BOOST |
| Aviso | AIRI | Artista sem origem/bandeira confiavel. | Adicionar artistCountry ou origem canonica. |
| Aviso | AIRI - Starship [dark_progressive] | Sem link externo verificavel. | LOCAL_TRACK_SEED_BOOST |
| Aviso | Akephalos | Artista sem origem/bandeira confiavel. | Adicionar artistCountry ou origem canonica. |
| Aviso | Akuma | Artista sem origem/bandeira confiavel. | Adicionar artistCountry ou origem canonica. |
| Aviso | Alumbra | Artista sem origem/bandeira confiavel. | Adicionar artistCountry ou origem canonica. |
| Aviso | Aly & Fila - We Control The Sunlight [trance_uplifting] | Sem link externo verificavel. | LOCAL_TRACK_SEED_BOOST |
| Aviso | ambient | Cobertura abaixo do alvo. | faltam 17 faixas, 0 artistas, 0 labels |
| Aviso | Amelie Lens - Hypnotized [techno] | Sem link externo verificavel. | LOCAL_TRACK_SEED_BOOST |
| Aviso | Andy C - Heartbeat Loud [drum_and_bass] | Sem link externo verificavel. | LOCAL_TRACK_SEED_BOOST |
| Aviso | Angerfist | Faixa duplicada no catalogo. | catalog:gabber, LOCAL_TRACK_SEED_BOOST:gabber |
| Aviso | Angerfist - Raise Your Fist [gabber] | Sem link externo verificavel. | LOCAL_TRACK_SEED_BOOST |
| Aviso | AnkouDead | Artista sem origem/bandeira confiavel. | Adicionar artistCountry ou origem canonica. |
| Aviso | AnkouDead - Daydream [dark_experimental] | BPM ausente ou ilegivel. | LOCAL_TRACK_SEED_BOOST |
| Aviso | AnkouDead - Poeira de Estrela [dark_experimental] | BPM ausente ou ilegivel. | LOCAL_TRACK_SEED_BOOST |
| Aviso | ANNA - Hidden Beauties [techno] | Sem bio ou pista editorial do artista. | LOCAL_TRACK_SEED_BOOST |
| Aviso | ANNA - Hidden Beauties [techno] | Sem link externo verificavel. | LOCAL_TRACK_SEED_BOOST |
| Aviso | Anyma - Explore Your Future [melodic_techno] | Sem bio ou pista editorial do artista. | LOCAL_TRACK_SEED_BOOST |
| Aviso | Anyma - Explore Your Future [melodic_techno] | Sem link externo verificavel. | LOCAL_TRACK_SEED_BOOST |
| Aviso | Aphex Twin - #3 [ambient] | Sem link externo verificavel. | LOCAL_TRACK_SEED_BOOST |
| Aviso | Arcek - Tribal Core 210 230 Bpm [hi_tech] | BPM ausente ou ilegivel. | data/codex_dataset_pack_v14/tracks.csv |
| Aviso | Arcek - Tribal Core 210 230 Bpm [hi_tech] | Sem link externo verificavel. | data/codex_dataset_pack_v14/tracks.csv |
| Aviso | Arjuna - Primal Contact [forest_psy] | Sem link externo verificavel. | LOCAL_TRACK_SEED_BOOST |
| Aviso | Astrix - He.art [psytrance] | Sem bio ou pista editorial do artista. | LOCAL_TRACK_SEED_BOOST |
| Aviso | Astrix - He.art [psytrance] | Sem link externo verificavel. | LOCAL_TRACK_SEED_BOOST |
| Aviso | At Work | Artista sem origem/bandeira confiavel. | Adicionar artistCountry ou origem canonica. |
| Aviso | At Work - Lunar Odyssey [freeform] | BPM ausente ou ilegivel. | LOCAL_TRACK_SEED_BOOST |
| Aviso | Atmik Shastra - Destruction OF Nightmares FT Atmik Shastra X Prozektor 241bpm [slambient] | BPM ausente ou ilegivel. | data/codex_dataset_pack_v14/tracks.csv |
| Aviso | Atmik Shastra - Destruction OF Nightmares FT Atmik Shastra X Prozektor 241bpm [slambient] | Sem link externo verificavel. | data/codex_dataset_pack_v14/tracks.csv |
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
| Aviso | bass_house | Cobertura abaixo do alvo. | faltam 17 faixas, 0 artistas, 4 labels |
| Aviso | Biosphere - Poa Alpina [ambient] | Sem bio ou pista editorial do artista. | LOCAL_TRACK_SEED_BOOST |
| Aviso | Biosphere - Poa Alpina [ambient] | Sem link externo verificavel. | LOCAL_TRACK_SEED_BOOST |
| Aviso | Black Coffee - Turn Me On [afro_house] | Sem link externo verificavel. | LOCAL_TRACK_SEED_BOOST |
| Aviso | Black Sun Empire - Arrakis [neurofunk] | Sem link externo verificavel. | LOCAL_TRACK_SEED_BOOST |
| Aviso | Bonobo | Faixa duplicada no catalogo. | catalog:downtempo, LOCAL_TRACK_SEED_BOOST:downtempo |
| Aviso | Bonobo - Kiara [downtempo] | BPM ausente ou ilegivel. | LOCAL_TRACK_SEED_BOOST |
| Aviso | Bonobo - Kiara [downtempo] | Sem link externo verificavel. | LOCAL_TRACK_SEED_BOOST |
| Aviso | brazilian_funk | Cobertura abaixo do alvo. | faltam 15 faixas, 0 artistas, 0 labels |
| Aviso | breakbeat | Cobertura abaixo do alvo. | faltam 17 faixas, 0 artistas, 3 labels |
| Aviso | Brian Eno | Faixa duplicada no catalogo. | catalog:ambient, LOCAL_TRACK_SEED_BOOST:ambient |
| Aviso | Brian Eno - An Ending (Ascent) [ambient] | Sem link externo verificavel. | LOCAL_TRACK_SEED_BOOST |
| Aviso | Burial | Faixa duplicada no catalogo. | catalog:future_garage, LOCAL_TRACK_SEED_BOOST:future_garage |
| Aviso | Burial - Archangel [future_garage] | Sem link externo verificavel. | LOCAL_TRACK_SEED_BOOST |
| Aviso | Burn In Noise | Faixa duplicada no catalogo. | catalog:full_on, catalog:full_on_night |
| Aviso | Burn In Noise - Transparent [full_on] | Sem link externo verificavel. | LOCAL_TRACK_SEED_BOOST |
| Aviso | Calibre - Even If [liquid_dnb] | Sem bio ou pista editorial do artista. | LOCAL_TRACK_SEED_BOOST |
| Aviso | Calibre - Even If [liquid_dnb] | Sem link externo verificavel. | LOCAL_TRACK_SEED_BOOST |
| Aviso | Captain Hook - Bungee Jump [progressive_psy] | Sem bio ou pista editorial do artista. | LOCAL_TRACK_SEED_BOOST |
| Aviso | Captain Hook - Bungee Jump [progressive_psy] | Sem link externo verificavel. | LOCAL_TRACK_SEED_BOOST |
| Aviso | Carbon Based Lifeforms - Photosynthesis [ambient] | BPM ausente ou ilegivel. | LOCAL_TRACK_SEED_BOOST |
| Aviso | Carbon Based Lifeforms - Photosynthesis [ambient] | Sem link externo verificavel. | LOCAL_TRACK_SEED_BOOST |
| Aviso | Chaosophy - Ch4osophy [slambient] | BPM ausente ou ilegivel. | data/codex_dataset_pack_v14/tracks.csv |
| Aviso | Chaosophy - Ch4osophy [slambient] | Sem link externo verificavel. | data/codex_dataset_pack_v14/tracks.csv |
| Aviso | Charlotte de Witte - Selected [techno] | Sem link externo verificavel. | LOCAL_TRACK_SEED_BOOST |
| Aviso | chillout | Cobertura abaixo do alvo. | faltam 14 faixas, 0 artistas, 0 labels |
| Aviso | Cindervomit | Artista sem origem/bandeira confiavel. | Adicionar artistCountry ou origem canonica. |
| Aviso | Claudinho Brasil | Artista sem origem/bandeira confiavel. | Adicionar artistCountry ou origem canonica. |

## Como usar

- Rode `node scripts/quality-audit.mjs` para gerar este relatorio sem bloquear o fluxo.
- Rode `node scripts/quality-audit.mjs --strict` quando quiser falhar o processo se houver problema critico.
- Use este relatorio antes de commit/push para evitar recomendacao errada, falta de bandeira e catalogo fraco.
