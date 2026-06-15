# Quality Audit - Sonic Search

Gerado em: 15/06/2026, 18:12:50
Status: OK

## Resumo

- Faixas auditadas: 3959
- Artistas unicos: 2657
- Artistas indexados exibidos no app: 4599
- Musicas buscaveis estimadas no app: 87381
- Media buscavel por artista indexado: 19.0x
- Cobertura auditada versus buscavel: 4.5%
- Gravadoras/labels unicas: 2690
- Estilos com faixas: 81
- Artistas vindos de datasets externos: 2600
- Problemas criticos: 0
- Avisos: 0
- Notas de enriquecimento: 3482

## Mudanca de catalogo

- Faixas auditadas: +0 faixas adicionadas, -0 faixas removidas; total anterior 3959, total atual 3959.
- Musicas buscaveis estimadas: +0 musicas adicionadas, -0 musicas removidas; total anterior 87381, total atual 87381.
- Artistas indexados: delta +0; total atual 4599.
- Observacao: se removermos musicas ou artistas ruins, a reducao aparece aqui explicitamente no proximo relatorio.

## Leitura rapida

- Nao ha itens criticos nem avisos funcionais. As notas restantes sao metadados finos para enriquecer curadoria.
- Depois use a tabela de cobertura para escolher quais subgeneros precisam de mais musicas verificadas, artistas ou labels.
- A métrica de musicas buscaveis mede a capacidade de descoberta do app; faixas auditadas mede o quanto já está verificável no banco local.
- Quando os criticos zerarem, rode `node scripts/quality-audit.mjs --strict` antes de publicar.

## Cobertura por subgenero

| Status | Subgenero | Faixas | Artistas | Labels | Observacao |
| --- | --- | --- | --- | --- | --- |
| OK | acid_techno | 34/20 | 61/50 | 18/6 | Completo |
| OK | afro_house | 33/20 | 60/50 | 29/6 | Completo |
| OK | ambient | 128/24 | 122/50 | 101/6 | Completo |
| OK | bass_house | 33/20 | 60/50 | 29/6 | Completo |
| OK | brazilian_funk | 34/20 | 60/50 | 21/4 | Completo |
| OK | breakbeat | 33/20 | 60/50 | 24/6 | Completo |
| OK | breakcore | 95/20 | 72/50 | 58/6 | Completo |
| OK | chillout | 25/20 | 61/50 | 13/4 | Completo |
| OK | coldwave | 24/20 | 60/50 | 14/6 | Completo |
| OK | dark_experimental | 28/24 | 86/50 | 20/10 | Completo |
| OK | dark_progressive | 109/24 | 92/50 | 80/6 | Completo |
| OK | dark_psy | 112/20 | 149/50 | 84/6 | Completo |
| OK | darkwave | 30/20 | 60/50 | 11/6 | Completo |
| OK | deep_house | 34/20 | 59/50 | 33/6 | Completo |
| OK | detroit_techno | 24/20 | 60/50 | 17/6 | Completo |
| OK | disco_house | 30/20 | 60/50 | 30/6 | Completo |
| OK | downtempo | 25/24 | 60/50 | 18/6 | Completo |
| OK | drum_and_bass | 35/20 | 60/50 | 21/6 | Completo |
| OK | dub_techno | 93/20 | 80/50 | 71/6 | Completo |
| OK | dubstep | 32/20 | 60/50 | 17/6 | Completo |
| OK | ebm | 24/20 | 60/50 | 14/6 | Completo |
| OK | electro | 77/20 | 70/50 | 57/6 | Completo |
| OK | electro_house | 33/20 | 60/50 | 29/6 | Completo |
| OK | experimental_bass | 31/20 | 60/50 | 24/6 | Completo |
| OK | footwork_juke | 30/20 | 60/50 | 14/6 | Completo |
| OK | forest_psy | 119/20 | 201/50 | 93/6 | Completo |
| OK | freeform | 40/12 | 57/50 | 26/0 | Completo |
| OK | frenchcore | 89/20 | 68/50 | 77/6 | Completo |
| OK | full_on | 160/28 | 70/50 | 122/8 | Completo |
| OK | full_on_morning | 24/24 | 60/50 | 14/8 | Completo |
| OK | full_on_night | 28/24 | 60/50 | 17/8 | Completo |
| OK | future_bass | 30/20 | 60/50 | 24/6 | Completo |
| OK | future_garage | 106/20 | 65/50 | 81/6 | Completo |
| OK | gabber | 33/16 | 60/50 | 26/0 | Completo |
| OK | garage_house | 26/20 | 60/50 | 24/6 | Completo |
| OK | goa_trance | 108/20 | 63/50 | 75/6 | Completo |
| OK | halftime_bass | 29/20 | 60/50 | 18/6 | Completo |
| OK | hard_techno | 24/20 | 60/50 | 19/6 | Completo |
| OK | hard_trance | 30/20 | 61/50 | 25/6 | Completo |
| OK | hardcore | 24/20 | 61/50 | 24/6 | Completo |
| OK | hardstyle | 104/20 | 63/50 | 91/6 | Completo |
| OK | hi_tech | 46/28 | 147/50 | 14/10 | Completo |
| OK | house | 57/20 | 60/50 | 31/6 | Completo |
| OK | hypnotic_techno | 24/20 | 61/50 | 19/6 | Completo |
| OK | idm | 35/20 | 60/50 | 16/6 | Completo |
| OK | industrial_techno | 68/20 | 65/50 | 53/6 | Completo |
| OK | jackin_house | 30/20 | 61/50 | 21/6 | Completo |
| OK | jump_up | 32/20 | 61/50 | 24/6 | Completo |
| OK | jungle | 33/20 | 62/50 | 32/6 | Completo |
| OK | liquid_dnb | 35/20 | 60/50 | 24/6 | Completo |
| OK | melodic_techno | 104/20 | 67/50 | 86/6 | Completo |
| OK | minimal_deep_tech | 30/20 | 60/50 | 26/6 | Completo |
| OK | minimal_techno | 66/20 | 69/50 | 51/6 | Completo |
| OK | neurofunk | 35/20 | 61/50 | 24/6 | Completo |
| OK | organic_house | 33/20 | 61/50 | 27/6 | Completo |
| OK | peak_time_techno | 24/20 | 61/50 | 15/6 | Completo |
| OK | progressive_house | 33/20 | 60/50 | 29/6 | Completo |
| OK | progressive_psy | 129/24 | 89/50 | 103/8 | Completo |
| OK | psy_comercial | 24/20 | 61/50 | 20/6 | Completo |
| OK | psybient | 96/20 | 60/50 | 62/6 | Completo |
| OK | psybreaks | 30/20 | 60/50 | 12/6 | Completo |
| OK | psycore | 48/22 | 162/50 | 17/0 | Completo |
| OK | psytrance | 37/20 | 68/50 | 24/6 | Completo |
| OK | raw_techno | 24/20 | 60/50 | 21/6 | Completo |
| OK | rawstyle | 30/20 | 60/50 | 28/6 | Completo |
| OK | riddim | 30/20 | 60/50 | 24/6 | Completo |
| OK | schranz | 24/20 | 60/50 | 19/6 | Completo |
| OK | slambient | 65/24 | 149/50 | 5/1 | Completo |
| OK | soulful_house | 30/20 | 60/50 | 27/6 | Completo |
| OK | speedcore | 30/20 | 63/50 | 12/6 | Completo |
| OK | synthwave | 102/20 | 73/50 | 76/6 | Completo |
| OK | tech_house | 52/20 | 60/50 | 21/6 | Completo |
| OK | tech_trance | 30/20 | 60/50 | 29/6 | Completo |
| OK | techno | 50/20 | 60/50 | 30/6 | Completo |
| OK | trance_uplifting | 34/20 | 63/50 | 31/6 | Completo |
| OK | trap | 30/20 | 60/50 | 20/6 | Completo |
| OK | trip_hop | 102/20 | 66/50 | 69/6 | Completo |
| OK | twilight_psy | 30/20 | 60/50 | 30/6 | Completo |
| OK | uk_garage | 33/20 | 61/50 | 26/6 | Completo |
| OK | wave | 30/20 | 61/50 | 24/6 | Completo |
| OK | witch_house | 24/20 | 60/50 | 17/6 | Completo |

## Problemas principais

| Severidade | Escopo | Problema | Detalhe |
| --- | --- | --- | --- |
| Nota | 1200 Micrograms - Full Moon Madness [full_on] | BPM ausente ou ilegivel. | data/verified_track_expansion_v7.csv |
| Nota | 1200 Micrograms - Mescaline [full_on] | BPM ausente ou ilegivel. | data/verified_track_expansion_v7.csv |
| Nota | 1200 Micrograms - Speed Freak [full_on] | BPM ausente ou ilegivel. | data/verified_track_expansion_v7.csv |
| Nota | 8Kays - Euphoria: Euphoria [melodic_techno] | BPM ausente ou ilegivel. | data/verified_track_expansion_v8.csv |
| Nota | 8Kays - Falling Down [melodic_techno] | BPM ausente ou ilegivel. | data/verified_track_expansion_v8.csv |
| Nota | 8Kays - Rainbow [melodic_techno] | BPM ausente ou ilegivel. | data/verified_track_expansion_v8.csv |
| Nota | 8Kays - What's Your Move [melodic_techno] | BPM ausente ou ilegivel. | data/verified_track_expansion_v8.csv |
| Nota | 999999999 | Faixa duplicada no catalogo bruto; runtime escolhe a melhor versao. | LOCAL_TRACK_SEED_BOOST:hard_techno, data/verified_track_expansion_v1.csv:hard_techno |
| Nota | 999999999 - X0004000X [hard_techno] | Sem link externo verificavel. | LOCAL_TRACK_SEED_BOOST |
| Nota | A Winged Victory For The Sullen - Atomos VIII [ambient] | BPM ausente ou ilegivel. | data/verified_track_expansion_v7.csv |
| Nota | A Winged Victory For The Sullen - Only Strings And Their Supports Remain [ambient] | BPM ausente ou ilegivel. | data/verified_track_expansion_v7.csv |
| Nota | A Winged Victory For The Sullen - The Dead Outnumber The Living [ambient] | BPM ausente ou ilegivel. | data/verified_track_expansion_v7.csv |
| Nota | A-Mush - Blood Out [twilight_psy] | BPM ausente ou ilegivel. | data/verified_track_expansion_v6.csv |
| Nota | A-Mush - Cph4 [twilight_psy] | BPM ausente ou ilegivel. | data/verified_track_expansion_v6.csv |
| Nota | A-Mush - Fractal Syndrom [twilight_psy] | BPM ausente ou ilegivel. | data/verified_track_expansion_v6.csv |
| Nota | A-Mush - In Space (Perfect Havoc Remix) [twilight_psy] | BPM ausente ou ilegivel. | data/verified_track_expansion_v6.csv |
| Nota | A-Mush - Psycho Slut [twilight_psy] | BPM ausente ou ilegivel. | data/verified_track_expansion_v6.csv |
| Nota | A-Mush - Quarantine [twilight_psy] | BPM ausente ou ilegivel. | data/verified_track_expansion_v6.csv |
| Nota | A-Mush - Substance [twilight_psy] | BPM ausente ou ilegivel. | data/verified_track_expansion_v6.csv |
| Nota | Aardvarkk | Faixa duplicada no catalogo bruto; runtime escolhe a melhor versao. | data/verified_track_expansion_v6.csv:twilight_psy, data/verified_track_expansion_v7.csv:forest_psy |
| Nota | Aardvarkk - Bada Bing (Original Mix) [twilight_psy] | BPM ausente ou ilegivel. | data/verified_track_expansion_v6.csv |
| Nota | Aardvarkk - Cosmic Radiation [forest_psy] | BPM ausente ou ilegivel. | data/verified_track_expansion_v7.csv |
| Nota | Aardvarkk - Daws of Perception [forest_psy] | BPM ausente ou ilegivel. | data/verified_track_expansion_v7.csv |
| Nota | Aardvarkk - Never Ending (Original Mix) [twilight_psy] | BPM ausente ou ilegivel. | data/verified_track_expansion_v6.csv |
| Nota | Aardvarkk - Never Ending [forest_psy] | BPM ausente ou ilegivel. | data/verified_track_expansion_v7.csv |
| Nota | Aardvarkk - Peyote [twilight_psy] | BPM ausente ou ilegivel. | data/verified_track_expansion_v6.csv |
| Nota | Aaron Spectre - Create the Future [breakcore] | BPM ausente ou ilegivel. | data/verified_track_expansion_v8.csv |
| Nota | Abrahadabra - Kold Kaff' [dark_psy] | BPM ausente ou ilegivel. | data/verified_track_expansion_v7.csv |
| Nota | Abrahadabra - Palombini [dark_psy] | BPM ausente ou ilegivel. | data/verified_track_expansion_v7.csv |
| Nota | Abrahadabra - Rubbermind [dark_psy] | BPM ausente ou ilegivel. | data/verified_track_expansion_v7.csv |
| Nota | Absolute Body Control - A Broken Dream [coldwave] | BPM ausente ou ilegivel. | data/verified_track_expansion_v6.csv |
| Nota | Absolute Body Control - Automatic [coldwave] | BPM ausente ou ilegivel. | data/verified_track_expansion_v6.csv |
| Nota | Absolute Body Control - Figures [coldwave] | BPM ausente ou ilegivel. | data/verified_track_expansion_v6.csv |
| Nota | Absolute Body Control - Is There An Exit? [coldwave] | BPM ausente ou ilegivel. | data/verified_track_expansion_v6.csv |
| Nota | Absolute Body Control - Le train [coldwave] | BPM ausente ou ilegivel. | data/verified_track_expansion_v6.csv |
| Nota | Absolute Body Control - Melting Away [coldwave] | BPM ausente ou ilegivel. | data/verified_track_expansion_v6.csv |
| Nota | Absolute Body Control - Waving Hands [coldwave] | BPM ausente ou ilegivel. | data/verified_track_expansion_v6.csv |
| Nota | Ace Ventura | Faixa duplicada no catalogo bruto; runtime escolhe a melhor versao. | catalog:psytrance, LOCAL_TRACK_SEED_BOOST:progressive_psy |
| Nota | Ace Ventura - E.B.E. [progressive_psy] | BPM ausente ou ilegivel. | data/verified_track_expansion_v7.csv |
| Nota | Ace Ventura - Pranava [progressive_psy] | BPM ausente ou ilegivel. | data/verified_track_expansion_v7.csv |
| Nota | Ace Ventura - Presence [progressive_psy] | Sem link externo verificavel. | LOCAL_TRACK_SEED_BOOST |
| Nota | Ace Ventura - Rebirth [progressive_psy] | BPM ausente ou ilegivel. | data/verified_track_expansion_v7.csv |
| Nota | Actors - Bury Me [coldwave] | BPM ausente ou ilegivel. | data/verified_track_expansion_v6.csv |
| Nota | Actors - L'appel Du Vide [coldwave] | BPM ausente ou ilegivel. | data/verified_track_expansion_v6.csv |
| Nota | Actors - Like Suicide [coldwave] | BPM ausente ou ilegivel. | data/verified_track_expansion_v6.csv |
| Nota | Actors - Object Of Desire [coldwave] | BPM ausente ou ilegivel. | data/verified_track_expansion_v6.csv |
| Nota | Actors - Obsession [coldwave] | BPM ausente ou ilegivel. | data/verified_track_expansion_v6.csv |
| Nota | Actors - Post Traumatic Love [coldwave] | BPM ausente ou ilegivel. | data/verified_track_expansion_v6.csv |
| Nota | Actors - Slaves [coldwave] | BPM ausente ou ilegivel. | data/verified_track_expansion_v6.csv |
| Nota | Actors - Strangers [coldwave] | BPM ausente ou ilegivel. | data/verified_track_expansion_v6.csv |
| Nota | Adam Beyer | Faixa duplicada no catalogo bruto; runtime escolhe a melhor versao. | LOCAL_TRACK_SEED_BOOST:techno, data/verified_track_expansion_v6.csv:detroit_techno |
| Nota | Adam Beyer - Close Your Eyes [detroit_techno] | BPM ausente ou ilegivel. | data/verified_track_expansion_v6.csv |
| Nota | Adam Beyer - DNA [detroit_techno] | BPM ausente ou ilegivel. | data/verified_track_expansion_v6.csv |
| Nota | Adam Beyer - Lift Me Up (feat. Kyozo) [detroit_techno] | BPM ausente ou ilegivel. | data/verified_track_expansion_v6.csv |
| Nota | Adam Beyer - Love Within [detroit_techno] | BPM ausente ou ilegivel. | data/verified_track_expansion_v6.csv |
| Nota | Adam Beyer - Parallels [detroit_techno] | BPM ausente ou ilegivel. | data/verified_track_expansion_v6.csv |
| Nota | Adam Beyer - Your Mind (HNTR Remix) [detroit_techno] | BPM ausente ou ilegivel. | data/verified_track_expansion_v6.csv |
| Nota | Adam Beyer - Your Mind (Massano & Doriann Remix) [detroit_techno] | BPM ausente ou ilegivel. | data/verified_track_expansion_v6.csv |
| Nota | Adam Beyer - Your Mind [detroit_techno] | BPM ausente ou ilegivel. | data/verified_track_expansion_v6.csv |
| Nota | Adam Beyer - Your Mind [techno] | Sem link externo verificavel. | LOCAL_TRACK_SEED_BOOST |
| Nota | Adam X - A Trip into the Past [hypnotic_techno] | BPM ausente ou ilegivel. | data/verified_track_expansion_v6.csv |
| Nota | Adam X - Jack Trippin' [hypnotic_techno] | BPM ausente ou ilegivel. | data/verified_track_expansion_v6.csv |
| Nota | Adam X - Raw Experience [hypnotic_techno] | BPM ausente ou ilegivel. | data/verified_track_expansion_v6.csv |
| Nota | Adam X - Standing the Test of Time [hypnotic_techno] | BPM ausente ou ilegivel. | data/verified_track_expansion_v6.csv |
| Nota | Adaro - Battleborn [hardstyle] | BPM ausente ou ilegivel. | data/verified_track_expansion_v8.csv |
| Nota | Adaro - Flame Up High [hardstyle] | BPM ausente ou ilegivel. | data/verified_track_expansion_v8.csv |
| Nota | Adaro - The Otherside [hardstyle] | BPM ausente ou ilegivel. | data/verified_track_expansion_v8.csv |
| Nota | Adaro - Touch A Star [hardstyle] | BPM ausente ou ilegivel. | data/verified_track_expansion_v8.csv |
| Nota | Adrenokrome - FRENCHCORE S'IL VOUS PLAIT PART 2 [frenchcore] | BPM ausente ou ilegivel. | data/verified_track_expansion_v8.csv |
| Nota | Adrenokrome - Teen Spirit [frenchcore] | BPM ausente ou ilegivel. | data/verified_track_expansion_v8.csv |
| Nota | Adrenokrome - They Don't Care About [frenchcore] | BPM ausente ou ilegivel. | data/verified_track_expansion_v8.csv |
| Nota | Adriatique - Lost In The Woods [melodic_techno] | BPM ausente ou ilegivel. | data/verified_track_expansion_v8.csv |
| Nota | Adriatique - Miracle - RÜFÜS DU SOL Remix [melodic_techno] | BPM ausente ou ilegivel. | data/verified_track_expansion_v8.csv |
| Nota | Adriatique - Miracle [melodic_techno] | BPM ausente ou ilegivel. | data/verified_track_expansion_v8.csv |
| Nota | Adriatique - Moth To A Flame [melodic_techno] | BPM ausente ou ilegivel. | data/verified_track_expansion_v8.csv |
| Nota | ADULT. - Affordable Decorating [coldwave] | BPM ausente ou ilegivel. | data/verified_track_expansion_v6.csv |
| Nota | ADULT. - Kick in the Shin [coldwave] | BPM ausente ou ilegivel. | data/verified_track_expansion_v6.csv |
| Nota | ADULT. - Nausea (Mega-Blend) [coldwave] | BPM ausente ou ilegivel. | data/verified_track_expansion_v6.csv |
| Nota | ADULT. - Nite Life [coldwave] | BPM ausente ou ilegivel. | data/verified_track_expansion_v6.csv |
| Nota | ADULT. - No One is Coming [coldwave] | BPM ausente ou ilegivel. | data/verified_track_expansion_v6.csv |

## Como usar

- Rode `node scripts/quality-audit.mjs` para gerar este relatorio sem bloquear o fluxo.
- Rode `node scripts/quality-audit.mjs --strict` quando quiser falhar o processo se houver problema critico.
- Use este relatorio antes de commit/push para evitar recomendacao errada, falta de bandeira e catalogo fraco.
