# Quality Audit - Sonic Search

Gerado em: 02/09/2026, 13:22:52
Status: REVISAR

## Resumo

- Faixas auditadas: 10030
- Artistas unicos: 3841
- Artistas indexados exibidos no app: 5179
- Musicas buscaveis estimadas no app: 98401
- Media buscavel por artista indexado: 19.0x
- Cobertura auditada versus buscavel: 10.2%
- Gravadoras/labels unicas: 6314
- Estilos com faixas: 169
- Artistas vindos de datasets externos: 3815
- Problemas criticos: 0
- Avisos: 82
- Notas de enriquecimento: 9313

## Mudanca de catalogo

- Faixas auditadas: +0 faixas adicionadas, -0 faixas removidas; total anterior 10030, total atual 10030.
- Musicas buscaveis estimadas: +0 musicas adicionadas, -0 musicas removidas; total anterior 98401, total atual 98401.
- Artistas indexados: delta +0; total atual 5179.
- Observacao: se removermos musicas ou artistas ruins, a reducao aparece aqui explicitamente no proximo relatorio.

## Leitura rapida

- Nao ha itens criticos. Os avisos ajudam a enriquecer bio, links, bandeiras e cobertura.
- Depois use a tabela de cobertura para escolher quais subgeneros precisam de mais musicas verificadas, artistas ou labels.
- A métrica de musicas buscaveis mede a capacidade de descoberta do app; faixas auditadas mede o quanto já está verificável no banco local.
- A coluna Tocaveis conta fontes diretas já gravadas no catalogo; resolucoes dinamicas por API devem ser confirmadas em teste live.
- Quando os criticos zerarem, rode `node scripts/quality-audit.mjs --strict` antes de publicar.

## Cobertura por subgenero

| Status | Subgenero | Faixas | Artistas | Labels | Tocaveis | Fontes | Observacao |
| --- | --- | --- | --- | --- | --- | --- | --- |
| OK | acid_techno | 58/20 | 114/50 | 32/6 | 24/58 | aud:24 yt:0 sc:0 bc:0 | Completo |
| Revisar | acid_trance | 28/2 | 5/50 | 23/1 | 28/28 | aud:28 yt:0 sc:0 bc:0 | faltam 0 faixas, 45 artistas, 0 labels |
| OK | afro_house | 63/20 | 62/50 | 54/6 | 45/63 | aud:45 yt:0 sc:0 bc:0 | Completo |
| OK | ambient | 147/24 | 122/50 | 112/6 | 139/147 | aud:139 yt:0 sc:0 bc:0 | Completo |
| Revisar | ambient_dub | 28/2 | 5/50 | 19/1 | 28/28 | aud:28 yt:0 sc:0 bc:0 | faltam 0 faixas, 45 artistas, 0 labels |
| Revisar | ambient_house | 28/2 | 5/50 | 16/1 | 28/28 | aud:28 yt:0 sc:0 bc:0 | faltam 0 faixas, 45 artistas, 0 labels |
| OK | ambient_techno | 96/16 | 52/50 | 69/4 | 55/96 | aud:55 yt:0 sc:0 bc:0 | Completo |
| Revisar | atmospheric_jungle | 28/2 | 5/50 | 17/1 | 28/28 | aud:28 yt:0 sc:0 bc:0 | faltam 0 faixas, 45 artistas, 0 labels |
| Revisar | balearic_trance | 32/2 | 7/50 | 29/1 | 32/32 | aud:32 yt:0 sc:0 bc:0 | faltam 0 faixas, 43 artistas, 0 labels |
| Revisar | ballroom_vogue_beats | 28/2 | 5/50 | 22/1 | 28/28 | aud:28 yt:0 sc:0 bc:0 | faltam 0 faixas, 45 artistas, 0 labels |
| Revisar | baltimore_club | 27/2 | 7/50 | 20/1 | 25/27 | aud:25 yt:0 sc:0 bc:0 | faltam 0 faixas, 43 artistas, 0 labels |
| OK | bass_house | 32/20 | 60/50 | 29/6 | 24/32 | aud:24 yt:0 sc:0 bc:0 | Completo |
| Revisar | bassline | 23/2 | 5/50 | 18/1 | 18/23 | aud:18 yt:0 sc:0 bc:0 | faltam 0 faixas, 45 artistas, 0 labels |
| Revisar | batida | 32/2 | 7/50 | 20/1 | 31/32 | aud:31 yt:0 sc:0 bc:0 | faltam 0 faixas, 43 artistas, 0 labels |
| Revisar | berlin_school | 28/2 | 5/50 | 19/1 | 28/28 | aud:28 yt:0 sc:0 bc:0 | faltam 0 faixas, 45 artistas, 0 labels |
| Revisar | big_beat | 30/20 | 7/50 | 15/6 | 30/30 | aud:30 yt:0 sc:0 bc:0 | faltam 0 faixas, 43 artistas, 0 labels |
| Revisar | big_room_house | 28/2 | 5/50 | 27/1 | 28/28 | aud:28 yt:0 sc:0 bc:0 | faltam 0 faixas, 45 artistas, 0 labels |
| Revisar | big_room_techno | 28/2 | 5/50 | 28/1 | 28/28 | aud:28 yt:0 sc:0 bc:0 | faltam 0 faixas, 45 artistas, 0 labels |
| OK | bleep_techno | 77/14 | 53/50 | 53/4 | 25/77 | aud:25 yt:0 sc:0 bc:0 | Completo |
| OK | brazilian_funk | 39/20 | 65/50 | 27/4 | 31/39 | aud:31 yt:0 sc:0 bc:0 | Completo |
| OK | breakbeat | 34/20 | 61/50 | 24/6 | 24/34 | aud:24 yt:0 sc:0 bc:0 | Completo |
| OK | breakcore | 95/20 | 72/50 | 58/6 | 95/95 | aud:95 yt:0 sc:0 bc:0 | Completo |
| OK | broken_techno | 85/16 | 55/50 | 59/4 | 39/85 | aud:39 yt:0 sc:0 bc:0 | Completo |
| Revisar | brostep | 25/2 | 5/50 | 24/1 | 25/25 | aud:25 yt:0 sc:0 bc:0 | faltam 0 faixas, 45 artistas, 0 labels |
| Revisar | chicago_house | 28/2 | 6/50 | 25/1 | 28/28 | aud:28 yt:0 sc:0 bc:0 | faltam 0 faixas, 44 artistas, 0 labels |
| OK | chillout | 29/20 | 85/50 | 19/4 | 21/29 | aud:21 yt:0 sc:0 bc:0 | Completo |
| Revisar | chillstep | 28/2 | 5/50 | 16/1 | 28/28 | aud:28 yt:0 sc:0 bc:0 | faltam 0 faixas, 45 artistas, 0 labels |
| OK | coldwave | 61/20 | 66/50 | 41/6 | 61/61 | aud:61 yt:0 sc:0 bc:0 | Completo |
| Revisar | complextro | 28/2 | 5/50 | 25/1 | 28/28 | aud:28 yt:0 sc:0 bc:0 | faltam 0 faixas, 45 artistas, 0 labels |
| Revisar | crossbreed | 32/2 | 7/50 | 25/1 | 32/32 | aud:32 yt:0 sc:0 bc:0 | faltam 0 faixas, 43 artistas, 0 labels |
| Revisar | dark_ambient | 29/2 | 7/50 | 18/1 | 28/29 | aud:28 yt:0 sc:0 bc:0 | faltam 0 faixas, 43 artistas, 0 labels |
| OK | dark_experimental | 78/24 | 92/50 | 51/10 | 68/78 | aud:68 yt:0 sc:0 bc:0 | Completo |
| OK | dark_progressive | 198/24 | 102/50 | 108/6 | 187/198 | aud:187 yt:0 sc:0 bc:0 | Completo |
| OK | dark_psy | 258/20 | 171/50 | 166/6 | 230/258 | aud:230 yt:0 sc:0 bc:0 | Completo |
| Revisar | darkstep | 25/2 | 5/50 | 21/1 | 24/25 | aud:24 yt:0 sc:0 bc:0 | faltam 0 faixas, 45 artistas, 0 labels |
| Revisar | darksynth | 28/2 | 5/50 | 19/1 | 28/28 | aud:28 yt:0 sc:0 bc:0 | faltam 0 faixas, 45 artistas, 0 labels |
| OK | darkwave | 38/20 | 62/50 | 16/6 | 38/38 | aud:38 yt:0 sc:0 bc:0 | Completo |
| Revisar | deconstructed_club | 28/2 | 5/50 | 16/1 | 28/28 | aud:28 yt:0 sc:0 bc:0 | faltam 0 faixas, 45 artistas, 0 labels |
| OK | deep_house | 37/20 | 62/50 | 37/6 | 29/37 | aud:29 yt:0 sc:0 bc:0 | Completo |
| OK | deep_techno | 77/20 | 56/50 | 59/4 | 40/77 | aud:40 yt:0 sc:0 bc:0 | Completo |
| OK | detroit_techno | 87/20 | 75/50 | 68/6 | 77/87 | aud:77 yt:0 sc:0 bc:0 | Completo |
| OK | disco_house | 31/20 | 80/50 | 31/6 | 31/31 | aud:31 yt:0 sc:0 bc:0 | Completo |
| OK | downtempo | 29/24 | 67/50 | 24/6 | 21/29 | aud:21 yt:0 sc:0 bc:0 | Completo |
| Revisar | dream_trance | 32/2 | 7/50 | 24/1 | 31/32 | aud:31 yt:0 sc:0 bc:0 | faltam 0 faixas, 43 artistas, 0 labels |
| OK | drum_and_bass | 48/20 | 61/50 | 35/6 | 40/48 | aud:40 yt:0 sc:0 bc:0 | Completo |
| Revisar | drumfunk | 28/2 | 5/50 | 20/1 | 27/28 | aud:27 yt:0 sc:0 bc:0 | faltam 0 faixas, 45 artistas, 0 labels |
| Revisar | drumstep | 28/2 | 5/50 | 23/1 | 28/28 | aud:28 yt:0 sc:0 bc:0 | faltam 0 faixas, 45 artistas, 0 labels |
| OK | dub_techno | 106/20 | 82/50 | 78/6 | 94/106 | aud:94 yt:0 sc:0 bc:0 | Completo |
| OK | dubstep | 39/20 | 62/50 | 25/6 | 28/39 | aud:28 yt:0 sc:0 bc:0 | Completo |
| OK | ebm | 36/20 | 70/50 | 22/6 | 24/36 | aud:24 yt:0 sc:0 bc:0 | Completo |
| Revisar | edm | 29/2 | 5/50 | 25/1 | 29/29 | aud:29 yt:0 sc:0 bc:0 | faltam 0 faixas, 45 artistas, 0 labels |
| Revisar | edm_trap | 28/2 | 5/50 | 24/1 | 28/28 | aud:28 yt:0 sc:0 bc:0 | faltam 0 faixas, 45 artistas, 0 labels |
| OK | electro | 78/20 | 74/50 | 58/6 | 70/78 | aud:70 yt:0 sc:0 bc:0 | Completo |
| OK | electro_house | 33/20 | 60/50 | 30/6 | 25/33 | aud:25 yt:0 sc:0 bc:0 | Completo |
| Revisar | electroacoustic | 29/2 | 7/50 | 18/1 | 26/29 | aud:26 yt:0 sc:0 bc:0 | faltam 0 faixas, 43 artistas, 0 labels |
| Revisar | electronic_dance_pop | 38/2 | 6/50 | 33/1 | 38/38 | aud:38 yt:0 sc:0 bc:0 | faltam 0 faixas, 44 artistas, 0 labels |
| Revisar | euphoric_hardstyle | 28/2 | 5/50 | 28/1 | 28/28 | aud:28 yt:0 sc:0 bc:0 | faltam 0 faixas, 45 artistas, 0 labels |
| Revisar | eurodance | 25/2 | 5/50 | 17/1 | 25/25 | aud:25 yt:0 sc:0 bc:0 | faltam 0 faixas, 45 artistas, 0 labels |
| OK | experimental_bass | 31/20 | 61/50 | 24/6 | 31/31 | aud:31 yt:0 sc:0 bc:0 | Completo |
| Revisar | extratone | 27/2 | 7/50 | 19/1 | 19/27 | aud:19 yt:0 sc:0 bc:0 | faltam 0 faixas, 43 artistas, 0 labels |
| Revisar | florida_breaks | 29/2 | 7/50 | 25/1 | 27/29 | aud:27 yt:0 sc:0 bc:0 | faltam 0 faixas, 43 artistas, 0 labels |
| OK | footwork_juke | 42/20 | 65/50 | 21/6 | 42/42 | aud:42 yt:0 sc:0 bc:0 | Completo |
| OK | forest_psy | 294/20 | 208/50 | 187/6 | 284/294 | aud:284 yt:0 sc:0 bc:0 | Completo |
| OK | freeform | 80/12 | 60/50 | 47/0 | 75/80 | aud:75 yt:0 sc:0 bc:0 | Completo |
| Revisar | french_house | 35/2 | 7/50 | 21/1 | 32/35 | aud:32 yt:0 sc:0 bc:0 | faltam 0 faixas, 43 artistas, 0 labels |
| OK | frenchcore | 132/20 | 68/50 | 113/6 | 132/132 | aud:132 yt:0 sc:0 bc:0 | Completo |
| OK | full_on | 471/28 | 76/50 | 317/8 | 456/471 | aud:456 yt:0 sc:0 bc:0 | Completo |
| OK | full_on_morning | 91/24 | 66/50 | 42/8 | 79/91 | aud:79 yt:0 sc:0 bc:0 | Completo |
| OK | full_on_night | 99/24 | 73/50 | 46/8 | 87/99 | aud:87 yt:0 sc:0 bc:0 | Completo |
| Revisar | funky_house | 28/2 | 5/50 | 22/1 | 28/28 | aud:28 yt:0 sc:0 bc:0 | faltam 0 faixas, 45 artistas, 0 labels |
| OK | future_bass | 30/20 | 60/50 | 24/6 | 30/30 | aud:30 yt:0 sc:0 bc:0 | Completo |
| OK | future_garage | 108/20 | 65/50 | 81/6 | 96/108 | aud:96 yt:0 sc:0 bc:0 | Completo |
| Revisar | future_house | 28/2 | 5/50 | 28/1 | 28/28 | aud:28 yt:0 sc:0 bc:0 | faltam 0 faixas, 45 artistas, 0 labels |
| Revisar | futurepop | 28/2 | 5/50 | 21/1 | 28/28 | aud:28 yt:0 sc:0 bc:0 | faltam 0 faixas, 45 artistas, 0 labels |
| OK | gabber | 89/16 | 62/50 | 74/0 | 81/89 | aud:81 yt:0 sc:0 bc:0 | Completo |
| OK | garage_house | 70/20 | 67/50 | 67/6 | 70/70 | aud:70 yt:0 sc:0 bc:0 | Completo |
| Revisar | ghetto_house | 28/2 | 5/50 | 20/1 | 28/28 | aud:28 yt:0 sc:0 bc:0 | faltam 0 faixas, 45 artistas, 0 labels |
| Revisar | ghettotech | 28/2 | 5/50 | 19/1 | 27/28 | aud:27 yt:0 sc:0 bc:0 | faltam 0 faixas, 45 artistas, 0 labels |
| Revisar | glitch_hop | 28/2 | 5/50 | 22/1 | 28/28 | aud:28 yt:0 sc:0 bc:0 | faltam 0 faixas, 45 artistas, 0 labels |
| OK | goa_trance | 166/20 | 65/50 | 98/6 | 158/166 | aud:158 yt:0 sc:0 bc:0 | Completo |
| OK | halftime_bass | 35/20 | 67/50 | 24/6 | 35/35 | aud:35 yt:0 sc:0 bc:0 | Completo |
| Revisar | hard_dance | 32/2 | 5/50 | 30/1 | 32/32 | aud:32 yt:0 sc:0 bc:0 | faltam 0 faixas, 45 artistas, 0 labels |
| OK | hard_techno | 102/20 | 138/50 | 80/6 | 76/102 | aud:76 yt:0 sc:0 bc:0 | Completo |
| OK | hard_trance | 30/20 | 132/50 | 25/6 | 30/30 | aud:30 yt:0 sc:0 bc:0 | Completo |
| OK | hardcore | 80/20 | 75/50 | 79/6 | 80/80 | aud:80 yt:0 sc:0 bc:0 | Completo |
| OK | hardgroove_techno | 94/20 | 60/50 | 81/4 | 52/94 | aud:52 yt:0 sc:0 bc:0 | Completo |
| Revisar | hardstep | 27/2 | 5/50 | 21/1 | 26/27 | aud:26 yt:0 sc:0 bc:0 | faltam 0 faixas, 45 artistas, 0 labels |
| OK | hardstyle | 106/20 | 64/50 | 92/6 | 98/106 | aud:98 yt:0 sc:0 bc:0 | Completo |
| Revisar | hardwave | 28/2 | 5/50 | 26/1 | 27/28 | aud:27 yt:0 sc:0 bc:0 | faltam 0 faixas, 45 artistas, 0 labels |
| Revisar | hi_nrg | 28/2 | 5/50 | 21/1 | 27/28 | aud:27 yt:0 sc:0 bc:0 | faltam 0 faixas, 45 artistas, 0 labels |
| OK | hi_tech | 123/28 | 157/50 | 54/10 | 78/123 | aud:78 yt:0 sc:0 bc:0 | Completo |
| OK | house | 250/20 | 63/50 | 196/6 | 196/250 | aud:196 yt:0 sc:0 bc:0 | Completo |
| OK | hypnotic_techno | 43/20 | 82/50 | 29/6 | 25/43 | aud:25 yt:0 sc:0 bc:0 | Completo |
| OK | idm | 33/20 | 60/50 | 15/6 | 24/33 | aud:24 yt:0 sc:0 bc:0 | Completo |
| Revisar | industrial_dance | 28/2 | 5/50 | 21/1 | 28/28 | aud:28 yt:0 sc:0 bc:0 | faltam 0 faixas, 45 artistas, 0 labels |
| OK | industrial_techno | 72/20 | 68/50 | 55/6 | 60/72 | aud:60 yt:0 sc:0 bc:0 | Completo |
| Revisar | italo_disco | 31/2 | 8/50 | 29/1 | 30/31 | aud:30 yt:0 sc:0 bc:0 | faltam 0 faixas, 42 artistas, 0 labels |
| OK | jackin_house | 56/20 | 67/50 | 43/6 | 56/56 | aud:56 yt:0 sc:0 bc:0 | Completo |
| Revisar | jersey_club | 25/2 | 5/50 | 21/1 | 25/25 | aud:25 yt:0 sc:0 bc:0 | faltam 0 faixas, 45 artistas, 0 labels |
| OK | jump_up | 31/20 | 61/50 | 24/6 | 23/31 | aud:23 yt:0 sc:0 bc:0 | Completo |
| OK | jungle | 52/20 | 62/50 | 50/6 | 44/52 | aud:44 yt:0 sc:0 bc:0 | Completo |
| Revisar | kosmische_musik | 28/2 | 5/50 | 17/1 | 27/28 | aud:27 yt:0 sc:0 bc:0 | faltam 0 faixas, 45 artistas, 0 labels |
| Revisar | kuduro_eletronico | 27/2 | 5/50 | 20/1 | 26/27 | aud:26 yt:0 sc:0 bc:0 | faltam 0 faixas, 45 artistas, 0 labels |
| Revisar | latin_house | 30/2 | 7/50 | 30/1 | 30/30 | aud:30 yt:0 sc:0 bc:0 | faltam 0 faixas, 43 artistas, 0 labels |
| OK | liquid_dnb | 53/20 | 60/50 | 41/6 | 45/53 | aud:45 yt:0 sc:0 bc:0 | Completo |
| Revisar | lowercase | 28/2 | 7/50 | 11/1 | 22/28 | aud:22 yt:0 sc:0 bc:0 | faltam 0 faixas, 43 artistas, 0 labels |
| Revisar | mainstage_techno | 29/2 | 5/50 | 29/1 | 29/29 | aud:29 yt:0 sc:0 bc:0 | faltam 0 faixas, 45 artistas, 0 labels |
| Revisar | makina | 29/2 | 7/50 | 24/1 | 28/29 | aud:28 yt:0 sc:0 bc:0 | faltam 0 faixas, 43 artistas, 0 labels |
| Revisar | melodic_dubstep | 28/2 | 5/50 | 27/1 | 28/28 | aud:28 yt:0 sc:0 bc:0 | faltam 0 faixas, 45 artistas, 0 labels |
| Revisar | melodic_house | 28/2 | 5/50 | 26/1 | 28/28 | aud:28 yt:0 sc:0 bc:0 | faltam 0 faixas, 45 artistas, 0 labels |
| OK | melodic_techno | 118/20 | 68/50 | 91/6 | 100/118 | aud:100 yt:0 sc:0 bc:0 | Completo |
| Revisar | microhouse | 32/2 | 7/50 | 22/1 | 30/32 | aud:30 yt:0 sc:0 bc:0 | faltam 0 faixas, 43 artistas, 0 labels |
| Revisar | microsound | 24/2 | 5/50 | 18/1 | 24/24 | aud:24 yt:0 sc:0 bc:0 | faltam 0 faixas, 45 artistas, 0 labels |
| OK | minimal_deep_tech | 40/20 | 67/50 | 34/6 | 30/40 | aud:30 yt:0 sc:0 bc:0 | Completo |
| OK | minimal_techno | 74/20 | 70/50 | 57/6 | 56/74 | aud:56 yt:0 sc:0 bc:0 | Completo |
| Revisar | minimal_wave | 32/2 | 7/50 | 15/1 | 32/32 | aud:32 yt:0 sc:0 bc:0 | faltam 0 faixas, 43 artistas, 0 labels |
| Revisar | musique_concrete | 32/2 | 7/50 | 18/1 | 31/32 | aud:31 yt:0 sc:0 bc:0 | faltam 0 faixas, 43 artistas, 0 labels |
| OK | neurofunk | 44/20 | 62/50 | 33/6 | 36/44 | aud:36 yt:0 sc:0 bc:0 | Completo |
| Revisar | neurohop | 32/2 | 7/50 | 25/1 | 29/32 | aud:29 yt:0 sc:0 bc:0 | faltam 0 faixas, 43 artistas, 0 labels |
| Revisar | nu_skool_breaks | 28/2 | 5/50 | 25/1 | 28/28 | aud:28 yt:0 sc:0 bc:0 | faltam 0 faixas, 45 artistas, 0 labels |
| OK | organic_house | 70/20 | 66/50 | 59/6 | 52/70 | aud:52 yt:0 sc:0 bc:0 | Completo |
| Revisar | outrun | 28/2 | 5/50 | 21/1 | 27/28 | aud:27 yt:0 sc:0 bc:0 | faltam 0 faixas, 45 artistas, 0 labels |
| OK | peak_time_techno | 84/20 | 64/50 | 71/6 | 72/84 | aud:72 yt:0 sc:0 bc:0 | Completo |
| Revisar | piano_house | 28/2 | 5/50 | 22/1 | 28/28 | aud:28 yt:0 sc:0 bc:0 | faltam 0 faixas, 45 artistas, 0 labels |
| Revisar | post_dubstep | 28/2 | 5/50 | 22/1 | 28/28 | aud:28 yt:0 sc:0 bc:0 | faltam 0 faixas, 45 artistas, 0 labels |
| Revisar | progressive_edm | 25/2 | 4/50 | 24/1 | 24/25 | aud:24 yt:0 sc:0 bc:0 | faltam 0 faixas, 46 artistas, 0 labels |
| OK | progressive_house | 34/20 | 61/50 | 30/6 | 26/34 | aud:26 yt:0 sc:0 bc:0 | Completo |
| OK | progressive_psy | 333/24 | 95/50 | 227/8 | 321/333 | aud:321 yt:0 sc:0 bc:0 | Completo |
| Revisar | progressive_trance | 28/2 | 5/50 | 26/1 | 28/28 | aud:28 yt:0 sc:0 bc:0 | faltam 0 faixas, 45 artistas, 0 labels |
| OK | psy_comercial | 90/20 | 67/50 | 45/6 | 79/90 | aud:79 yt:0 sc:0 bc:0 | Completo |
| OK | psybient | 182/20 | 116/50 | 91/6 | 182/182 | aud:182 yt:0 sc:0 bc:0 | Completo |
| OK | psybreaks | 52/20 | 67/50 | 27/6 | 52/52 | aud:52 yt:0 sc:0 bc:0 | Completo |
| OK | psycore | 138/22 | 292/50 | 75/0 | 87/138 | aud:77 yt:0 sc:0 bc:10 | Completo |
| OK | psytrance | 103/20 | 82/50 | 44/6 | 94/103 | aud:94 yt:0 sc:0 bc:0 | Completo |
| Revisar | ragga_jungle | 28/2 | 5/50 | 25/1 | 27/28 | aud:27 yt:0 sc:0 bc:0 | faltam 0 faixas, 45 artistas, 0 labels |
| OK | raw_techno | 36/20 | 73/50 | 29/6 | 23/36 | aud:23 yt:0 sc:0 bc:0 | Completo |
| OK | rawstyle | 79/20 | 66/50 | 72/6 | 79/79 | aud:79 yt:0 sc:0 bc:0 | Completo |
| Revisar | retrowave | 28/2 | 5/50 | 19/1 | 28/28 | aud:28 yt:0 sc:0 bc:0 | faltam 0 faixas, 45 artistas, 0 labels |
| Revisar | reverse_bass | 28/2 | 5/50 | 24/1 | 27/28 | aud:27 yt:0 sc:0 bc:0 | faltam 0 faixas, 45 artistas, 0 labels |
| OK | riddim | 31/20 | 60/50 | 25/6 | 31/31 | aud:31 yt:0 sc:0 bc:0 | Completo |
| Revisar | sambass | 32/2 | 7/50 | 28/1 | 31/32 | aud:31 yt:0 sc:0 bc:0 | faltam 0 faixas, 43 artistas, 0 labels |
| OK | schranz | 35/20 | 73/50 | 27/6 | 31/35 | aud:31 yt:0 sc:0 bc:0 | Completo |
| Revisar | shangaan_electro | 20/2 | 7/50 | 6/1 | 16/20 | aud:16 yt:0 sc:0 bc:0 | faltam 0 faixas, 43 artistas, 0 labels |
| Revisar | singeli | 27/2 | 7/50 | 10/1 | 27/27 | aud:27 yt:0 sc:0 bc:0 | faltam 0 faixas, 43 artistas, 0 labels |
| OK | slambient | 64/24 | 151/50 | 6/1 | 28/64 | aud:0 yt:0 sc:0 bc:28 | Completo |
| Revisar | slap_house | 25/2 | 5/50 | 24/1 | 24/25 | aud:24 yt:0 sc:0 bc:0 | faltam 0 faixas, 45 artistas, 0 labels |
| OK | soulful_house | 60/20 | 68/50 | 51/6 | 59/60 | aud:59 yt:0 sc:0 bc:0 | Completo |
| Revisar | space_ambient | 32/2 | 7/50 | 26/1 | 32/32 | aud:32 yt:0 sc:0 bc:0 | faltam 0 faixas, 43 artistas, 0 labels |
| OK | speedcore | 48/20 | 69/50 | 27/6 | 48/48 | aud:48 yt:0 sc:0 bc:0 | Completo |
| OK | synthwave | 102/20 | 73/50 | 76/6 | 102/102 | aud:102 yt:0 sc:0 bc:0 | Completo |
| OK | tech_house | 284/20 | 76/50 | 210/6 | 218/284 | aud:218 yt:0 sc:0 bc:0 | Completo |
| OK | tech_trance | 30/20 | 65/50 | 29/6 | 30/30 | aud:30 yt:0 sc:0 bc:0 | Completo |
| OK | techno | 213/20 | 105/50 | 135/6 | 145/213 | aud:145 yt:0 sc:0 bc:0 | Completo |
| Revisar | techstep | 30/2 | 7/50 | 23/1 | 30/30 | aud:30 yt:0 sc:0 bc:0 | faltam 0 faixas, 43 artistas, 0 labels |
| Revisar | terrorcore | 27/2 | 5/50 | 26/1 | 26/27 | aud:26 yt:0 sc:0 bc:0 | faltam 0 faixas, 45 artistas, 0 labels |
| OK | trance_uplifting | 33/20 | 62/50 | 31/6 | 25/33 | aud:25 yt:0 sc:0 bc:0 | Completo |
| OK | trap | 30/20 | 60/50 | 20/6 | 30/30 | aud:30 yt:0 sc:0 bc:0 | Completo |
| Revisar | tribal_house | 28/2 | 5/50 | 27/1 | 28/28 | aud:28 yt:0 sc:0 bc:0 | faltam 0 faixas, 45 artistas, 0 labels |
| OK | tribal_techno | 76/16 | 56/50 | 58/4 | 33/76 | aud:33 yt:0 sc:0 bc:0 | Completo |
| OK | trip_hop | 102/20 | 66/50 | 69/6 | 102/102 | aud:102 yt:0 sc:0 bc:0 | Completo |
| Revisar | tropical_house | 29/2 | 5/50 | 28/1 | 29/29 | aud:29 yt:0 sc:0 bc:0 | faltam 0 faixas, 45 artistas, 0 labels |
| OK | twilight_psy | 102/20 | 68/50 | 53/6 | 102/102 | aud:102 yt:0 sc:0 bc:0 | Completo |
| Revisar | uk_bass | 28/2 | 5/50 | 27/1 | 28/28 | aud:28 yt:0 sc:0 bc:0 | faltam 0 faixas, 45 artistas, 0 labels |
| OK | uk_garage | 59/20 | 67/50 | 40/6 | 35/59 | aud:35 yt:0 sc:0 bc:0 | Completo |
| Revisar | uk_hardcore | 28/2 | 5/50 | 27/1 | 28/28 | aud:28 yt:0 sc:0 bc:0 | faltam 0 faixas, 45 artistas, 0 labels |
| Revisar | vocal_trance | 28/2 | 5/50 | 27/1 | 28/28 | aud:28 yt:0 sc:0 bc:0 | faltam 0 faixas, 45 artistas, 0 labels |
| OK | wave | 30/20 | 61/50 | 24/6 | 30/30 | aud:30 yt:0 sc:0 bc:0 | Completo |
| OK | witch_house | 70/20 | 74/50 | 52/6 | 70/70 | aud:70 yt:0 sc:0 bc:0 | Completo |
| Revisar | wonky | 28/2 | 5/50 | 23/1 | 27/28 | aud:27 yt:0 sc:0 bc:0 | faltam 0 faixas, 45 artistas, 0 labels |

## Problemas principais

| Severidade | Escopo | Problema | Detalhe |
| --- | --- | --- | --- |
| Aviso | acid_trance | Cobertura abaixo do alvo. | faltam 0 faixas, 45 artistas, 0 labels |
| Aviso | ambient_dub | Cobertura abaixo do alvo. | faltam 0 faixas, 45 artistas, 0 labels |
| Aviso | ambient_house | Cobertura abaixo do alvo. | faltam 0 faixas, 45 artistas, 0 labels |
| Aviso | atmospheric_jungle | Cobertura abaixo do alvo. | faltam 0 faixas, 45 artistas, 0 labels |
| Aviso | balearic_trance | Cobertura abaixo do alvo. | faltam 0 faixas, 43 artistas, 0 labels |
| Aviso | ballroom_vogue_beats | Cobertura abaixo do alvo. | faltam 0 faixas, 45 artistas, 0 labels |
| Aviso | baltimore_club | Cobertura abaixo do alvo. | faltam 0 faixas, 43 artistas, 0 labels |
| Aviso | bassline | Cobertura abaixo do alvo. | faltam 0 faixas, 45 artistas, 0 labels |
| Aviso | batida | Cobertura abaixo do alvo. | faltam 0 faixas, 43 artistas, 0 labels |
| Aviso | berlin_school | Cobertura abaixo do alvo. | faltam 0 faixas, 45 artistas, 0 labels |
| Aviso | big_beat | Cobertura abaixo do alvo. | faltam 0 faixas, 43 artistas, 0 labels |
| Aviso | big_room_house | Cobertura abaixo do alvo. | faltam 0 faixas, 45 artistas, 0 labels |
| Aviso | big_room_techno | Cobertura abaixo do alvo. | faltam 0 faixas, 45 artistas, 0 labels |
| Aviso | brostep | Cobertura abaixo do alvo. | faltam 0 faixas, 45 artistas, 0 labels |
| Aviso | chicago_house | Cobertura abaixo do alvo. | faltam 0 faixas, 44 artistas, 0 labels |
| Aviso | chillstep | Cobertura abaixo do alvo. | faltam 0 faixas, 45 artistas, 0 labels |
| Aviso | complextro | Cobertura abaixo do alvo. | faltam 0 faixas, 45 artistas, 0 labels |
| Aviso | crossbreed | Cobertura abaixo do alvo. | faltam 0 faixas, 43 artistas, 0 labels |
| Aviso | dark_ambient | Cobertura abaixo do alvo. | faltam 0 faixas, 43 artistas, 0 labels |
| Aviso | darkstep | Cobertura abaixo do alvo. | faltam 0 faixas, 45 artistas, 0 labels |
| Aviso | darksynth | Cobertura abaixo do alvo. | faltam 0 faixas, 45 artistas, 0 labels |
| Aviso | deconstructed_club | Cobertura abaixo do alvo. | faltam 0 faixas, 45 artistas, 0 labels |
| Aviso | dream_trance | Cobertura abaixo do alvo. | faltam 0 faixas, 43 artistas, 0 labels |
| Aviso | drumfunk | Cobertura abaixo do alvo. | faltam 0 faixas, 45 artistas, 0 labels |
| Aviso | drumstep | Cobertura abaixo do alvo. | faltam 0 faixas, 45 artistas, 0 labels |
| Aviso | edm | Cobertura abaixo do alvo. | faltam 0 faixas, 45 artistas, 0 labels |
| Aviso | edm_trap | Cobertura abaixo do alvo. | faltam 0 faixas, 45 artistas, 0 labels |
| Aviso | electroacoustic | Cobertura abaixo do alvo. | faltam 0 faixas, 43 artistas, 0 labels |
| Aviso | electronic_dance_pop | Cobertura abaixo do alvo. | faltam 0 faixas, 44 artistas, 0 labels |
| Aviso | euphoric_hardstyle | Cobertura abaixo do alvo. | faltam 0 faixas, 45 artistas, 0 labels |
| Aviso | eurodance | Cobertura abaixo do alvo. | faltam 0 faixas, 45 artistas, 0 labels |
| Aviso | extratone | Cobertura abaixo do alvo. | faltam 0 faixas, 43 artistas, 0 labels |
| Aviso | florida_breaks | Cobertura abaixo do alvo. | faltam 0 faixas, 43 artistas, 0 labels |
| Aviso | french_house | Cobertura abaixo do alvo. | faltam 0 faixas, 43 artistas, 0 labels |
| Aviso | funky_house | Cobertura abaixo do alvo. | faltam 0 faixas, 45 artistas, 0 labels |
| Aviso | future_house | Cobertura abaixo do alvo. | faltam 0 faixas, 45 artistas, 0 labels |
| Aviso | futurepop | Cobertura abaixo do alvo. | faltam 0 faixas, 45 artistas, 0 labels |
| Aviso | ghetto_house | Cobertura abaixo do alvo. | faltam 0 faixas, 45 artistas, 0 labels |
| Aviso | ghettotech | Cobertura abaixo do alvo. | faltam 0 faixas, 45 artistas, 0 labels |
| Aviso | glitch_hop | Cobertura abaixo do alvo. | faltam 0 faixas, 45 artistas, 0 labels |
| Aviso | hard_dance | Cobertura abaixo do alvo. | faltam 0 faixas, 45 artistas, 0 labels |
| Aviso | hardstep | Cobertura abaixo do alvo. | faltam 0 faixas, 45 artistas, 0 labels |
| Aviso | hardwave | Cobertura abaixo do alvo. | faltam 0 faixas, 45 artistas, 0 labels |
| Aviso | hi_nrg | Cobertura abaixo do alvo. | faltam 0 faixas, 45 artistas, 0 labels |
| Aviso | industrial_dance | Cobertura abaixo do alvo. | faltam 0 faixas, 45 artistas, 0 labels |
| Aviso | italo_disco | Cobertura abaixo do alvo. | faltam 0 faixas, 42 artistas, 0 labels |
| Aviso | jersey_club | Cobertura abaixo do alvo. | faltam 0 faixas, 45 artistas, 0 labels |
| Aviso | kosmische_musik | Cobertura abaixo do alvo. | faltam 0 faixas, 45 artistas, 0 labels |
| Aviso | kuduro_eletronico | Cobertura abaixo do alvo. | faltam 0 faixas, 45 artistas, 0 labels |
| Aviso | latin_house | Cobertura abaixo do alvo. | faltam 0 faixas, 43 artistas, 0 labels |
| Aviso | lowercase | Cobertura abaixo do alvo. | faltam 0 faixas, 43 artistas, 0 labels |
| Aviso | mainstage_techno | Cobertura abaixo do alvo. | faltam 0 faixas, 45 artistas, 0 labels |
| Aviso | makina | Cobertura abaixo do alvo. | faltam 0 faixas, 43 artistas, 0 labels |
| Aviso | melodic_dubstep | Cobertura abaixo do alvo. | faltam 0 faixas, 45 artistas, 0 labels |
| Aviso | melodic_house | Cobertura abaixo do alvo. | faltam 0 faixas, 45 artistas, 0 labels |
| Aviso | microhouse | Cobertura abaixo do alvo. | faltam 0 faixas, 43 artistas, 0 labels |
| Aviso | microsound | Cobertura abaixo do alvo. | faltam 0 faixas, 45 artistas, 0 labels |
| Aviso | minimal_wave | Cobertura abaixo do alvo. | faltam 0 faixas, 43 artistas, 0 labels |
| Aviso | musique_concrete | Cobertura abaixo do alvo. | faltam 0 faixas, 43 artistas, 0 labels |
| Aviso | neurohop | Cobertura abaixo do alvo. | faltam 0 faixas, 43 artistas, 0 labels |
| Aviso | nu_skool_breaks | Cobertura abaixo do alvo. | faltam 0 faixas, 45 artistas, 0 labels |
| Aviso | outrun | Cobertura abaixo do alvo. | faltam 0 faixas, 45 artistas, 0 labels |
| Aviso | piano_house | Cobertura abaixo do alvo. | faltam 0 faixas, 45 artistas, 0 labels |
| Aviso | post_dubstep | Cobertura abaixo do alvo. | faltam 0 faixas, 45 artistas, 0 labels |
| Aviso | progressive_edm | Cobertura abaixo do alvo. | faltam 0 faixas, 46 artistas, 0 labels |
| Aviso | progressive_trance | Cobertura abaixo do alvo. | faltam 0 faixas, 45 artistas, 0 labels |
| Aviso | ragga_jungle | Cobertura abaixo do alvo. | faltam 0 faixas, 45 artistas, 0 labels |
| Aviso | retrowave | Cobertura abaixo do alvo. | faltam 0 faixas, 45 artistas, 0 labels |
| Aviso | reverse_bass | Cobertura abaixo do alvo. | faltam 0 faixas, 45 artistas, 0 labels |
| Aviso | sambass | Cobertura abaixo do alvo. | faltam 0 faixas, 43 artistas, 0 labels |
| Aviso | shangaan_electro | Cobertura abaixo do alvo. | faltam 0 faixas, 43 artistas, 0 labels |
| Aviso | singeli | Cobertura abaixo do alvo. | faltam 0 faixas, 43 artistas, 0 labels |
| Aviso | slap_house | Cobertura abaixo do alvo. | faltam 0 faixas, 45 artistas, 0 labels |
| Aviso | space_ambient | Cobertura abaixo do alvo. | faltam 0 faixas, 43 artistas, 0 labels |
| Aviso | techstep | Cobertura abaixo do alvo. | faltam 0 faixas, 43 artistas, 0 labels |
| Aviso | terrorcore | Cobertura abaixo do alvo. | faltam 0 faixas, 45 artistas, 0 labels |
| Aviso | tribal_house | Cobertura abaixo do alvo. | faltam 0 faixas, 45 artistas, 0 labels |
| Aviso | tropical_house | Cobertura abaixo do alvo. | faltam 0 faixas, 45 artistas, 0 labels |
| Aviso | uk_bass | Cobertura abaixo do alvo. | faltam 0 faixas, 45 artistas, 0 labels |
| Aviso | uk_hardcore | Cobertura abaixo do alvo. | faltam 0 faixas, 45 artistas, 0 labels |

## Como usar

- Rode `node scripts/quality-audit.mjs` para gerar este relatorio sem bloquear o fluxo.
- Rode `node scripts/quality-audit.mjs --strict` quando quiser falhar o processo se houver problema critico.
- Use este relatorio antes de commit/push para evitar recomendacao errada, falta de bandeira e catalogo fraco.
