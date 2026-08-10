# Quality Audit - Sonic Search

Gerado em: 13/07/2026, 18:39:29
Status: REVISAR

## Resumo

- Faixas auditadas: 16533
- Artistas unicos: 3648
- Artistas indexados exibidos no app: 5179
- Musicas buscaveis estimadas no app: 98401
- Media buscavel por artista indexado: 19.0x
- Cobertura auditada versus buscavel: 16.8%
- Gravadoras/labels unicas: 5533
- Estilos com faixas: 169
- Artistas vindos de datasets externos: 3616
- Problemas criticos: 0
- Avisos: 82
- Notas de enriquecimento: 21981

## Mudanca de catalogo

- Faixas auditadas: +6 faixas adicionadas, -0 faixas removidas; total anterior 16527, total atual 16533.
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
| OK | acid_techno | 74/20 | 114/50 | 30/6 | 48/74 | aud:48 yt:0 sc:0 bc:0 | Completo |
| Revisar | acid_trance | 32/2 | 2/50 | 12/1 | 32/32 | aud:32 yt:0 sc:0 bc:0 | faltam 0 faixas, 48 artistas, 0 labels |
| OK | afro_house | 107/20 | 62/50 | 54/6 | 88/107 | aud:88 yt:0 sc:0 bc:0 | Completo |
| OK | ambient | 291/24 | 122/50 | 113/6 | 278/291 | aud:278 yt:0 sc:0 bc:0 | Completo |
| Revisar | ambient_dub | 32/2 | 2/50 | 11/1 | 32/32 | aud:32 yt:0 sc:0 bc:0 | faltam 0 faixas, 48 artistas, 0 labels |
| Revisar | ambient_house | 32/2 | 2/50 | 8/1 | 32/32 | aud:32 yt:0 sc:0 bc:0 | faltam 0 faixas, 48 artistas, 0 labels |
| OK | ambient_techno | 150/16 | 52/50 | 69/4 | 108/150 | aud:108 yt:0 sc:0 bc:0 | Completo |
| Revisar | atmospheric_jungle | 32/2 | 2/50 | 7/1 | 32/32 | aud:32 yt:0 sc:0 bc:0 | faltam 0 faixas, 48 artistas, 0 labels |
| Revisar | balearic_trance | 24/2 | 2/50 | 12/1 | 24/24 | aud:24 yt:0 sc:0 bc:0 | faltam 0 faixas, 48 artistas, 0 labels |
| Revisar | ballroom_vogue_beats | 32/2 | 2/50 | 13/1 | 32/32 | aud:32 yt:0 sc:0 bc:0 | faltam 0 faixas, 48 artistas, 0 labels |
| Revisar | baltimore_club | 20/2 | 2/50 | 8/1 | 16/20 | aud:16 yt:0 sc:0 bc:0 | faltam 0 faixas, 48 artistas, 0 labels |
| OK | bass_house | 57/20 | 60/50 | 29/6 | 48/57 | aud:48 yt:0 sc:0 bc:0 | Completo |
| Revisar | bassline | 36/2 | 4/50 | 15/1 | 30/36 | aud:30 yt:0 sc:0 bc:0 | faltam 0 faixas, 46 artistas, 0 labels |
| Revisar | batida | 24/2 | 2/50 | 10/1 | 22/24 | aud:22 yt:0 sc:0 bc:0 | faltam 0 faixas, 48 artistas, 0 labels |
| Revisar | berlin_school | 32/2 | 2/50 | 12/1 | 32/32 | aud:32 yt:0 sc:0 bc:0 | faltam 0 faixas, 48 artistas, 0 labels |
| Revisar | big_beat | 6/20 | 1/50 | 0/6 | 6/6 | aud:6 yt:0 sc:0 bc:0 | faltam 14 faixas, 49 artistas, 6 labels |
| Revisar | big_room_house | 32/2 | 2/50 | 15/1 | 32/32 | aud:32 yt:0 sc:0 bc:0 | faltam 0 faixas, 48 artistas, 0 labels |
| Revisar | big_room_techno | 32/2 | 2/50 | 16/1 | 32/32 | aud:32 yt:0 sc:0 bc:0 | faltam 0 faixas, 48 artistas, 0 labels |
| OK | bleep_techno | 103/14 | 53/50 | 53/4 | 50/103 | aud:50 yt:0 sc:0 bc:0 | Completo |
| OK | brazilian_funk | 73/20 | 65/50 | 27/4 | 62/73 | aud:62 yt:0 sc:0 bc:0 | Completo |
| OK | breakbeat | 59/20 | 61/50 | 24/6 | 48/59 | aud:48 yt:0 sc:0 bc:0 | Completo |
| OK | breakcore | 190/20 | 72/50 | 58/6 | 190/190 | aud:190 yt:0 sc:0 bc:0 | Completo |
| OK | broken_techno | 125/16 | 55/50 | 59/4 | 78/125 | aud:78 yt:0 sc:0 bc:0 | Completo |
| Revisar | brostep | 32/2 | 2/50 | 15/1 | 32/32 | aud:32 yt:0 sc:0 bc:0 | faltam 0 faixas, 48 artistas, 0 labels |
| Revisar | chicago_house | 32/2 | 3/50 | 15/1 | 32/32 | aud:32 yt:0 sc:0 bc:0 | faltam 0 faixas, 47 artistas, 0 labels |
| OK | chillout | 39/20 | 85/50 | 14/4 | 27/39 | aud:27 yt:0 sc:0 bc:0 | Completo |
| Revisar | chillstep | 32/2 | 2/50 | 7/1 | 32/32 | aud:32 yt:0 sc:0 bc:0 | faltam 0 faixas, 48 artistas, 0 labels |
| OK | coldwave | 122/20 | 66/50 | 41/6 | 122/122 | aud:122 yt:0 sc:0 bc:0 | Completo |
| Revisar | complextro | 32/2 | 2/50 | 15/1 | 32/32 | aud:32 yt:0 sc:0 bc:0 | faltam 0 faixas, 48 artistas, 0 labels |
| Revisar | crossbreed | 24/2 | 2/50 | 9/1 | 24/24 | aud:24 yt:0 sc:0 bc:0 | faltam 0 faixas, 48 artistas, 0 labels |
| Revisar | dark_ambient | 18/2 | 2/50 | 8/1 | 16/18 | aud:16 yt:0 sc:0 bc:0 | faltam 0 faixas, 48 artistas, 0 labels |
| OK | dark_experimental | 140/24 | 92/50 | 51/10 | 130/140 | aud:122 yt:0 sc:0 bc:8 | Completo |
| OK | dark_progressive | 388/24 | 102/50 | 109/6 | 371/388 | aud:371 yt:0 sc:0 bc:0 | Completo |
| OK | dark_psy | 458/20 | 172/50 | 170/6 | 425/458 | aud:423 yt:0 sc:2 bc:1 | Completo |
| Revisar | darkstep | 26/2 | 2/50 | 10/1 | 24/26 | aud:24 yt:0 sc:0 bc:0 | faltam 0 faixas, 48 artistas, 0 labels |
| Revisar | darksynth | 32/2 | 2/50 | 11/1 | 32/32 | aud:32 yt:0 sc:0 bc:0 | faltam 0 faixas, 48 artistas, 0 labels |
| OK | darkwave | 76/20 | 62/50 | 16/6 | 76/76 | aud:76 yt:0 sc:0 bc:0 | Completo |
| Revisar | deconstructed_club | 32/2 | 2/50 | 10/1 | 32/32 | aud:32 yt:0 sc:0 bc:0 | faltam 0 faixas, 48 artistas, 0 labels |
| OK | deep_house | 61/20 | 62/50 | 36/6 | 51/61 | aud:51 yt:0 sc:0 bc:0 | Completo |
| OK | deep_techno | 116/20 | 56/50 | 59/4 | 78/116 | aud:78 yt:0 sc:0 bc:0 | Completo |
| OK | detroit_techno | 164/20 | 75/50 | 68/6 | 154/164 | aud:154 yt:0 sc:0 bc:0 | Completo |
| OK | disco_house | 60/20 | 80/50 | 30/6 | 60/60 | aud:60 yt:0 sc:0 bc:0 | Completo |
| OK | downtempo | 45/24 | 67/50 | 26/6 | 32/45 | aud:32 yt:0 sc:0 bc:0 | Completo |
| Revisar | dream_trance | 24/2 | 2/50 | 11/1 | 22/24 | aud:22 yt:0 sc:0 bc:0 | faltam 0 faixas, 48 artistas, 0 labels |
| OK | drum_and_bass | 91/20 | 61/50 | 37/6 | 80/91 | aud:80 yt:0 sc:0 bc:0 | Completo |
| Revisar | drumfunk | 32/2 | 2/50 | 12/1 | 30/32 | aud:30 yt:0 sc:0 bc:0 | faltam 0 faixas, 48 artistas, 0 labels |
| Revisar | drumstep | 32/2 | 2/50 | 12/1 | 32/32 | aud:32 yt:0 sc:0 bc:0 | faltam 0 faixas, 48 artistas, 0 labels |
| OK | dub_techno | 198/20 | 82/50 | 78/6 | 186/198 | aud:186 yt:0 sc:0 bc:0 | Completo |
| OK | dubstep | 68/20 | 62/50 | 25/6 | 56/68 | aud:56 yt:0 sc:0 bc:0 | Completo |
| OK | ebm | 60/20 | 70/50 | 22/6 | 48/60 | aud:48 yt:0 sc:0 bc:0 | Completo |
| Revisar | edm | 34/2 | 3/50 | 15/1 | 34/34 | aud:34 yt:0 sc:0 bc:0 | faltam 0 faixas, 47 artistas, 0 labels |
| Revisar | edm_trap | 32/2 | 2/50 | 14/1 | 32/32 | aud:32 yt:0 sc:0 bc:0 | faltam 0 faixas, 48 artistas, 0 labels |
| OK | electro | 149/20 | 74/50 | 58/6 | 140/149 | aud:140 yt:0 sc:0 bc:0 | Completo |
| OK | electro_house | 59/20 | 60/50 | 30/6 | 50/59 | aud:50 yt:0 sc:0 bc:0 | Completo |
| Revisar | electroacoustic | 18/2 | 2/50 | 7/1 | 12/18 | aud:12 yt:0 sc:0 bc:0 | faltam 0 faixas, 48 artistas, 0 labels |
| Revisar | electronic_dance_pop | 36/2 | 4/50 | 16/1 | 36/36 | aud:36 yt:0 sc:0 bc:0 | faltam 0 faixas, 46 artistas, 0 labels |
| Revisar | euphoric_hardstyle | 32/2 | 2/50 | 16/1 | 32/32 | aud:32 yt:0 sc:0 bc:0 | faltam 0 faixas, 48 artistas, 0 labels |
| Revisar | eurodance | 32/2 | 2/50 | 10/1 | 32/32 | aud:32 yt:0 sc:0 bc:0 | faltam 0 faixas, 48 artistas, 0 labels |
| OK | experimental_bass | 62/20 | 61/50 | 24/6 | 62/62 | aud:62 yt:0 sc:0 bc:0 | Completo |
| Revisar | extratone | 16/2 | 2/50 | 2/1 | 0/16 | aud:0 yt:0 sc:0 bc:0 | faltam 0 faixas, 48 artistas, 0 labels |
| Revisar | florida_breaks | 24/2 | 2/50 | 10/1 | 20/24 | aud:20 yt:0 sc:0 bc:0 | faltam 0 faixas, 48 artistas, 0 labels |
| OK | footwork_juke | 84/20 | 65/50 | 21/6 | 84/84 | aud:84 yt:0 sc:0 bc:0 | Completo |
| OK | forest_psy | 576/20 | 208/50 | 187/6 | 562/576 | aud:562 yt:0 sc:0 bc:0 | Completo |
| OK | freeform | 153/12 | 61/50 | 51/0 | 146/153 | aud:139 yt:0 sc:4 bc:4 | Completo |
| Revisar | french_house | 22/2 | 2/50 | 6/1 | 16/22 | aud:16 yt:0 sc:0 bc:0 | faltam 0 faixas, 48 artistas, 0 labels |
| OK | frenchcore | 264/20 | 68/50 | 113/6 | 264/264 | aud:264 yt:0 sc:0 bc:0 | Completo |
| OK | full_on | 929/28 | 76/50 | 317/8 | 912/929 | aud:912 yt:0 sc:0 bc:0 | Completo |
| OK | full_on_morning | 172/24 | 66/50 | 42/8 | 158/172 | aud:158 yt:0 sc:0 bc:0 | Completo |
| OK | full_on_night | 187/24 | 73/50 | 46/8 | 174/187 | aud:174 yt:0 sc:0 bc:0 | Completo |
| Revisar | funky_house | 32/2 | 2/50 | 11/1 | 32/32 | aud:32 yt:0 sc:0 bc:0 | faltam 0 faixas, 48 artistas, 0 labels |
| OK | future_bass | 60/20 | 60/50 | 24/6 | 60/60 | aud:60 yt:0 sc:0 bc:0 | Completo |
| OK | future_garage | 204/20 | 65/50 | 81/6 | 191/204 | aud:191 yt:0 sc:0 bc:0 | Completo |
| Revisar | future_house | 32/2 | 2/50 | 16/1 | 32/32 | aud:32 yt:0 sc:0 bc:0 | faltam 0 faixas, 48 artistas, 0 labels |
| Revisar | futurepop | 32/2 | 2/50 | 12/1 | 32/32 | aud:32 yt:0 sc:0 bc:0 | faltam 0 faixas, 48 artistas, 0 labels |
| OK | gabber | 171/16 | 62/50 | 74/0 | 162/171 | aud:162 yt:0 sc:0 bc:0 | Completo |
| OK | garage_house | 138/20 | 67/50 | 66/6 | 138/138 | aud:138 yt:0 sc:0 bc:0 | Completo |
| Revisar | ghetto_house | 32/2 | 2/50 | 12/1 | 32/32 | aud:32 yt:0 sc:0 bc:0 | faltam 0 faixas, 48 artistas, 0 labels |
| Revisar | ghettotech | 32/2 | 2/50 | 11/1 | 30/32 | aud:30 yt:0 sc:0 bc:0 | faltam 0 faixas, 48 artistas, 0 labels |
| Revisar | glitch_hop | 32/2 | 2/50 | 12/1 | 32/32 | aud:32 yt:0 sc:0 bc:0 | faltam 0 faixas, 48 artistas, 0 labels |
| OK | goa_trance | 326/20 | 65/50 | 99/6 | 316/326 | aud:316 yt:0 sc:0 bc:0 | Completo |
| OK | halftime_bass | 70/20 | 67/50 | 24/6 | 70/70 | aud:70 yt:0 sc:0 bc:0 | Completo |
| Revisar | hard_dance | 32/2 | 2/50 | 15/1 | 32/32 | aud:32 yt:0 sc:0 bc:0 | faltam 0 faixas, 48 artistas, 0 labels |
| OK | hard_techno | 171/20 | 137/50 | 71/6 | 152/171 | aud:152 yt:0 sc:0 bc:0 | Completo |
| OK | hard_trance | 60/20 | 132/50 | 25/6 | 60/60 | aud:60 yt:0 sc:0 bc:0 | Completo |
| OK | hardcore | 160/20 | 75/50 | 79/6 | 160/160 | aud:160 yt:0 sc:0 bc:0 | Completo |
| OK | hardgroove_techno | 147/20 | 60/50 | 81/4 | 104/147 | aud:104 yt:0 sc:0 bc:0 | Completo |
| Revisar | hardstep | 32/2 | 2/50 | 11/1 | 30/32 | aud:30 yt:0 sc:0 bc:0 | faltam 0 faixas, 48 artistas, 0 labels |
| OK | hardstyle | 205/20 | 64/50 | 92/6 | 196/205 | aud:196 yt:0 sc:0 bc:0 | Completo |
| Revisar | hardwave | 32/2 | 2/50 | 14/1 | 30/32 | aud:30 yt:0 sc:0 bc:0 | faltam 0 faixas, 48 artistas, 0 labels |
| Revisar | hi_nrg | 32/2 | 2/50 | 12/1 | 30/32 | aud:30 yt:0 sc:0 bc:0 | faltam 0 faixas, 48 artistas, 0 labels |
| OK | hi_tech | 193/28 | 157/50 | 55/10 | 144/193 | aud:144 yt:0 sc:0 bc:0 | Completo |
| OK | house | 445/20 | 63/50 | 196/6 | 388/445 | aud:388 yt:0 sc:0 bc:0 | Completo |
| OK | hypnotic_techno | 68/20 | 82/50 | 29/6 | 50/68 | aud:50 yt:0 sc:0 bc:0 | Completo |
| OK | idm | 59/20 | 60/50 | 16/6 | 48/59 | aud:48 yt:0 sc:0 bc:0 | Completo |
| Revisar | industrial_dance | 32/2 | 2/50 | 9/1 | 32/32 | aud:32 yt:0 sc:0 bc:0 | faltam 0 faixas, 48 artistas, 0 labels |
| OK | industrial_techno | 133/20 | 68/50 | 55/6 | 120/133 | aud:120 yt:0 sc:0 bc:0 | Completo |
| Revisar | italo_disco | 22/2 | 3/50 | 11/1 | 20/22 | aud:20 yt:0 sc:0 bc:0 | faltam 0 faixas, 47 artistas, 0 labels |
| OK | jackin_house | 112/20 | 67/50 | 43/6 | 112/112 | aud:112 yt:0 sc:0 bc:0 | Completo |
| Revisar | jersey_club | 32/2 | 2/50 | 16/1 | 32/32 | aud:32 yt:0 sc:0 bc:0 | faltam 0 faixas, 48 artistas, 0 labels |
| OK | jump_up | 55/20 | 61/50 | 24/6 | 46/55 | aud:46 yt:0 sc:0 bc:0 | Completo |
| OK | jungle | 97/20 | 62/50 | 50/6 | 88/97 | aud:88 yt:0 sc:0 bc:0 | Completo |
| Revisar | kosmische_musik | 32/2 | 2/50 | 8/1 | 30/32 | aud:30 yt:0 sc:0 bc:0 | faltam 0 faixas, 48 artistas, 0 labels |
| Revisar | kuduro_eletronico | 32/2 | 2/50 | 11/1 | 30/32 | aud:30 yt:0 sc:0 bc:0 | faltam 0 faixas, 48 artistas, 0 labels |
| Revisar | latin_house | 20/2 | 3/50 | 10/1 | 20/20 | aud:20 yt:0 sc:0 bc:0 | faltam 0 faixas, 47 artistas, 0 labels |
| OK | liquid_dnb | 99/20 | 60/50 | 41/6 | 88/99 | aud:88 yt:0 sc:0 bc:0 | Completo |
| Revisar | lowercase | 16/2 | 2/50 | 4/1 | 4/16 | aud:4 yt:0 sc:0 bc:0 | faltam 0 faixas, 48 artistas, 0 labels |
| Revisar | mainstage_techno | 34/2 | 3/50 | 17/1 | 34/34 | aud:34 yt:0 sc:0 bc:0 | faltam 0 faixas, 47 artistas, 0 labels |
| Revisar | makina | 24/2 | 2/50 | 9/1 | 22/24 | aud:22 yt:0 sc:0 bc:0 | faltam 0 faixas, 48 artistas, 0 labels |
| Revisar | melodic_dubstep | 32/2 | 2/50 | 16/1 | 32/32 | aud:32 yt:0 sc:0 bc:0 | faltam 0 faixas, 48 artistas, 0 labels |
| Revisar | melodic_house | 32/2 | 2/50 | 15/1 | 32/32 | aud:32 yt:0 sc:0 bc:0 | faltam 0 faixas, 48 artistas, 0 labels |
| OK | melodic_techno | 213/20 | 68/50 | 91/6 | 192/213 | aud:192 yt:0 sc:0 bc:0 | Completo |
| Revisar | microhouse | 24/2 | 2/50 | 7/1 | 20/24 | aud:20 yt:0 sc:0 bc:0 | faltam 0 faixas, 48 artistas, 0 labels |
| Revisar | microsound | 30/2 | 2/50 | 12/1 | 30/30 | aud:30 yt:0 sc:0 bc:0 | faltam 0 faixas, 48 artistas, 0 labels |
| OK | minimal_deep_tech | 70/20 | 67/50 | 34/6 | 60/70 | aud:60 yt:0 sc:0 bc:0 | Completo |
| OK | minimal_techno | 131/20 | 70/50 | 58/6 | 110/131 | aud:110 yt:0 sc:0 bc:0 | Completo |
| Revisar | minimal_wave | 24/2 | 2/50 | 9/1 | 24/24 | aud:24 yt:0 sc:0 bc:0 | faltam 0 faixas, 48 artistas, 0 labels |
| Revisar | musique_concrete | 24/2 | 2/50 | 10/1 | 22/24 | aud:22 yt:0 sc:0 bc:0 | faltam 0 faixas, 48 artistas, 0 labels |
| OK | neurofunk | 83/20 | 62/50 | 34/6 | 72/83 | aud:72 yt:0 sc:0 bc:0 | Completo |
| Revisar | neurohop | 24/2 | 2/50 | 8/1 | 18/24 | aud:18 yt:0 sc:0 bc:0 | faltam 0 faixas, 48 artistas, 0 labels |
| Revisar | nu_skool_breaks | 32/2 | 2/50 | 16/1 | 32/32 | aud:32 yt:0 sc:0 bc:0 | faltam 0 faixas, 48 artistas, 0 labels |
| OK | organic_house | 118/20 | 66/50 | 59/6 | 99/118 | aud:99 yt:0 sc:0 bc:0 | Completo |
| Revisar | outrun | 32/2 | 2/50 | 11/1 | 30/32 | aud:30 yt:0 sc:0 bc:0 | faltam 0 faixas, 48 artistas, 0 labels |
| OK | peak_time_techno | 157/20 | 64/50 | 71/6 | 144/157 | aud:144 yt:0 sc:0 bc:0 | Completo |
| Revisar | piano_house | 32/2 | 2/50 | 12/1 | 32/32 | aud:32 yt:0 sc:0 bc:0 | faltam 0 faixas, 48 artistas, 0 labels |
| Revisar | post_dubstep | 32/2 | 2/50 | 13/1 | 32/32 | aud:32 yt:0 sc:0 bc:0 | faltam 0 faixas, 48 artistas, 0 labels |
| Revisar | progressive_edm | 50/2 | 4/50 | 24/1 | 48/50 | aud:48 yt:0 sc:0 bc:0 | faltam 0 faixas, 46 artistas, 0 labels |
| OK | progressive_house | 57/20 | 60/50 | 29/6 | 48/57 | aud:48 yt:0 sc:0 bc:0 | Completo |
| OK | progressive_psy | 657/24 | 95/50 | 227/8 | 642/657 | aud:642 yt:0 sc:0 bc:0 | Completo |
| Revisar | progressive_trance | 32/2 | 2/50 | 15/1 | 32/32 | aud:32 yt:0 sc:0 bc:0 | faltam 0 faixas, 48 artistas, 0 labels |
| OK | psy_comercial | 169/20 | 67/50 | 45/6 | 158/169 | aud:158 yt:0 sc:0 bc:0 | Completo |
| OK | psybient | 364/20 | 116/50 | 91/6 | 364/364 | aud:364 yt:0 sc:0 bc:0 | Completo |
| OK | psybreaks | 104/20 | 67/50 | 27/6 | 104/104 | aud:104 yt:0 sc:0 bc:0 | Completo |
| OK | psycore | 211/22 | 296/50 | 80/0 | 159/211 | aud:135 yt:0 sc:10 bc:18 | Completo |
| OK | psytrance | 202/20 | 82/50 | 46/6 | 188/202 | aud:188 yt:0 sc:0 bc:0 | Completo |
| Revisar | ragga_jungle | 32/2 | 2/50 | 13/1 | 30/32 | aud:30 yt:0 sc:0 bc:0 | faltam 0 faixas, 48 artistas, 0 labels |
| OK | raw_techno | 60/20 | 73/50 | 29/6 | 46/60 | aud:46 yt:0 sc:0 bc:0 | Completo |
| OK | rawstyle | 158/20 | 66/50 | 72/6 | 158/158 | aud:158 yt:0 sc:0 bc:0 | Completo |
| Revisar | retrowave | 32/2 | 2/50 | 8/1 | 32/32 | aud:32 yt:0 sc:0 bc:0 | faltam 0 faixas, 48 artistas, 0 labels |
| Revisar | reverse_bass | 32/2 | 2/50 | 12/1 | 30/32 | aud:30 yt:0 sc:0 bc:0 | faltam 0 faixas, 48 artistas, 0 labels |
| OK | riddim | 62/20 | 60/50 | 25/6 | 62/62 | aud:62 yt:0 sc:0 bc:0 | Completo |
| Revisar | sambass | 24/2 | 2/50 | 12/1 | 22/24 | aud:22 yt:0 sc:0 bc:0 | faltam 0 faixas, 48 artistas, 0 labels |
| OK | schranz | 66/20 | 73/50 | 27/6 | 62/66 | aud:62 yt:0 sc:0 bc:0 | Completo |
| Revisar | shangaan_electro | 16/2 | 2/50 | 4/1 | 8/16 | aud:8 yt:0 sc:0 bc:0 | faltam 0 faixas, 48 artistas, 0 labels |
| Revisar | singeli | 24/2 | 2/50 | 4/1 | 24/24 | aud:24 yt:0 sc:0 bc:0 | faltam 0 faixas, 48 artistas, 0 labels |
| OK | slambient | 70/24 | 151/50 | 7/1 | 28/70 | aud:0 yt:0 sc:0 bc:28 | Completo |
| Revisar | slap_house | 34/2 | 3/50 | 17/1 | 32/34 | aud:32 yt:0 sc:0 bc:0 | faltam 0 faixas, 47 artistas, 0 labels |
| OK | soulful_house | 118/20 | 68/50 | 50/6 | 118/118 | aud:118 yt:0 sc:0 bc:0 | Completo |
| Revisar | space_ambient | 24/2 | 2/50 | 10/1 | 24/24 | aud:24 yt:0 sc:0 bc:0 | faltam 0 faixas, 48 artistas, 0 labels |
| OK | speedcore | 96/20 | 69/50 | 27/6 | 96/96 | aud:96 yt:0 sc:0 bc:0 | Completo |
| OK | synthwave | 204/20 | 73/50 | 76/6 | 204/204 | aud:204 yt:0 sc:0 bc:0 | Completo |
| OK | tech_house | 504/20 | 76/50 | 210/6 | 434/504 | aud:434 yt:0 sc:0 bc:0 | Completo |
| OK | tech_trance | 60/20 | 65/50 | 29/6 | 60/60 | aud:60 yt:0 sc:0 bc:0 | Completo |
| OK | techno | 353/20 | 104/50 | 133/6 | 290/353 | aud:290 yt:0 sc:0 bc:0 | Completo |
| Revisar | techstep | 24/2 | 2/50 | 10/1 | 24/24 | aud:24 yt:0 sc:0 bc:0 | faltam 0 faixas, 48 artistas, 0 labels |
| Revisar | terrorcore | 32/2 | 2/50 | 16/1 | 30/32 | aud:30 yt:0 sc:0 bc:0 | faltam 0 faixas, 48 artistas, 0 labels |
| OK | trance_uplifting | 60/20 | 63/50 | 32/6 | 50/60 | aud:50 yt:0 sc:0 bc:0 | Completo |
| OK | trap | 60/20 | 60/50 | 20/6 | 60/60 | aud:60 yt:0 sc:0 bc:0 | Completo |
| Revisar | tribal_house | 32/2 | 2/50 | 15/1 | 32/32 | aud:32 yt:0 sc:0 bc:0 | faltam 0 faixas, 48 artistas, 0 labels |
| OK | tribal_techno | 110/16 | 56/50 | 58/4 | 66/110 | aud:66 yt:0 sc:0 bc:0 | Completo |
| OK | trip_hop | 204/20 | 66/50 | 69/6 | 204/204 | aud:204 yt:0 sc:0 bc:0 | Completo |
| Revisar | tropical_house | 34/2 | 2/50 | 16/1 | 34/34 | aud:34 yt:0 sc:0 bc:0 | faltam 0 faixas, 48 artistas, 0 labels |
| OK | twilight_psy | 204/20 | 68/50 | 53/6 | 204/204 | aud:204 yt:0 sc:0 bc:0 | Completo |
| Revisar | uk_bass | 32/2 | 2/50 | 15/1 | 32/32 | aud:32 yt:0 sc:0 bc:0 | faltam 0 faixas, 48 artistas, 0 labels |
| OK | uk_garage | 93/20 | 67/50 | 39/6 | 68/93 | aud:68 yt:0 sc:0 bc:0 | Completo |
| Revisar | uk_hardcore | 32/2 | 2/50 | 15/1 | 32/32 | aud:32 yt:0 sc:0 bc:0 | faltam 0 faixas, 48 artistas, 0 labels |
| Revisar | vocal_trance | 32/2 | 2/50 | 15/1 | 32/32 | aud:32 yt:0 sc:0 bc:0 | faltam 0 faixas, 48 artistas, 0 labels |
| OK | wave | 60/20 | 61/50 | 24/6 | 60/60 | aud:60 yt:0 sc:0 bc:0 | Completo |
| OK | witch_house | 140/20 | 74/50 | 52/6 | 140/140 | aud:140 yt:0 sc:0 bc:0 | Completo |
| Revisar | wonky | 32/2 | 2/50 | 15/1 | 30/32 | aud:30 yt:0 sc:0 bc:0 | faltam 0 faixas, 48 artistas, 0 labels |

## Problemas principais

| Severidade | Escopo | Problema | Detalhe |
| --- | --- | --- | --- |
| Aviso | acid_trance | Cobertura abaixo do alvo. | faltam 0 faixas, 48 artistas, 0 labels |
| Aviso | ambient_dub | Cobertura abaixo do alvo. | faltam 0 faixas, 48 artistas, 0 labels |
| Aviso | ambient_house | Cobertura abaixo do alvo. | faltam 0 faixas, 48 artistas, 0 labels |
| Aviso | atmospheric_jungle | Cobertura abaixo do alvo. | faltam 0 faixas, 48 artistas, 0 labels |
| Aviso | balearic_trance | Cobertura abaixo do alvo. | faltam 0 faixas, 48 artistas, 0 labels |
| Aviso | ballroom_vogue_beats | Cobertura abaixo do alvo. | faltam 0 faixas, 48 artistas, 0 labels |
| Aviso | baltimore_club | Cobertura abaixo do alvo. | faltam 0 faixas, 48 artistas, 0 labels |
| Aviso | bassline | Cobertura abaixo do alvo. | faltam 0 faixas, 46 artistas, 0 labels |
| Aviso | batida | Cobertura abaixo do alvo. | faltam 0 faixas, 48 artistas, 0 labels |
| Aviso | berlin_school | Cobertura abaixo do alvo. | faltam 0 faixas, 48 artistas, 0 labels |
| Aviso | big_beat | Cobertura abaixo do alvo. | faltam 14 faixas, 49 artistas, 6 labels |
| Aviso | big_room_house | Cobertura abaixo do alvo. | faltam 0 faixas, 48 artistas, 0 labels |
| Aviso | big_room_techno | Cobertura abaixo do alvo. | faltam 0 faixas, 48 artistas, 0 labels |
| Aviso | brostep | Cobertura abaixo do alvo. | faltam 0 faixas, 48 artistas, 0 labels |
| Aviso | chicago_house | Cobertura abaixo do alvo. | faltam 0 faixas, 47 artistas, 0 labels |
| Aviso | chillstep | Cobertura abaixo do alvo. | faltam 0 faixas, 48 artistas, 0 labels |
| Aviso | complextro | Cobertura abaixo do alvo. | faltam 0 faixas, 48 artistas, 0 labels |
| Aviso | crossbreed | Cobertura abaixo do alvo. | faltam 0 faixas, 48 artistas, 0 labels |
| Aviso | dark_ambient | Cobertura abaixo do alvo. | faltam 0 faixas, 48 artistas, 0 labels |
| Aviso | darkstep | Cobertura abaixo do alvo. | faltam 0 faixas, 48 artistas, 0 labels |
| Aviso | darksynth | Cobertura abaixo do alvo. | faltam 0 faixas, 48 artistas, 0 labels |
| Aviso | deconstructed_club | Cobertura abaixo do alvo. | faltam 0 faixas, 48 artistas, 0 labels |
| Aviso | dream_trance | Cobertura abaixo do alvo. | faltam 0 faixas, 48 artistas, 0 labels |
| Aviso | drumfunk | Cobertura abaixo do alvo. | faltam 0 faixas, 48 artistas, 0 labels |
| Aviso | drumstep | Cobertura abaixo do alvo. | faltam 0 faixas, 48 artistas, 0 labels |
| Aviso | edm | Cobertura abaixo do alvo. | faltam 0 faixas, 47 artistas, 0 labels |
| Aviso | edm_trap | Cobertura abaixo do alvo. | faltam 0 faixas, 48 artistas, 0 labels |
| Aviso | electroacoustic | Cobertura abaixo do alvo. | faltam 0 faixas, 48 artistas, 0 labels |
| Aviso | electronic_dance_pop | Cobertura abaixo do alvo. | faltam 0 faixas, 46 artistas, 0 labels |
| Aviso | euphoric_hardstyle | Cobertura abaixo do alvo. | faltam 0 faixas, 48 artistas, 0 labels |
| Aviso | eurodance | Cobertura abaixo do alvo. | faltam 0 faixas, 48 artistas, 0 labels |
| Aviso | extratone | Cobertura abaixo do alvo. | faltam 0 faixas, 48 artistas, 0 labels |
| Aviso | florida_breaks | Cobertura abaixo do alvo. | faltam 0 faixas, 48 artistas, 0 labels |
| Aviso | french_house | Cobertura abaixo do alvo. | faltam 0 faixas, 48 artistas, 0 labels |
| Aviso | funky_house | Cobertura abaixo do alvo. | faltam 0 faixas, 48 artistas, 0 labels |
| Aviso | future_house | Cobertura abaixo do alvo. | faltam 0 faixas, 48 artistas, 0 labels |
| Aviso | futurepop | Cobertura abaixo do alvo. | faltam 0 faixas, 48 artistas, 0 labels |
| Aviso | ghetto_house | Cobertura abaixo do alvo. | faltam 0 faixas, 48 artistas, 0 labels |
| Aviso | ghettotech | Cobertura abaixo do alvo. | faltam 0 faixas, 48 artistas, 0 labels |
| Aviso | glitch_hop | Cobertura abaixo do alvo. | faltam 0 faixas, 48 artistas, 0 labels |
| Aviso | hard_dance | Cobertura abaixo do alvo. | faltam 0 faixas, 48 artistas, 0 labels |
| Aviso | hardstep | Cobertura abaixo do alvo. | faltam 0 faixas, 48 artistas, 0 labels |
| Aviso | hardwave | Cobertura abaixo do alvo. | faltam 0 faixas, 48 artistas, 0 labels |
| Aviso | hi_nrg | Cobertura abaixo do alvo. | faltam 0 faixas, 48 artistas, 0 labels |
| Aviso | industrial_dance | Cobertura abaixo do alvo. | faltam 0 faixas, 48 artistas, 0 labels |
| Aviso | italo_disco | Cobertura abaixo do alvo. | faltam 0 faixas, 47 artistas, 0 labels |
| Aviso | jersey_club | Cobertura abaixo do alvo. | faltam 0 faixas, 48 artistas, 0 labels |
| Aviso | kosmische_musik | Cobertura abaixo do alvo. | faltam 0 faixas, 48 artistas, 0 labels |
| Aviso | kuduro_eletronico | Cobertura abaixo do alvo. | faltam 0 faixas, 48 artistas, 0 labels |
| Aviso | latin_house | Cobertura abaixo do alvo. | faltam 0 faixas, 47 artistas, 0 labels |
| Aviso | lowercase | Cobertura abaixo do alvo. | faltam 0 faixas, 48 artistas, 0 labels |
| Aviso | mainstage_techno | Cobertura abaixo do alvo. | faltam 0 faixas, 47 artistas, 0 labels |
| Aviso | makina | Cobertura abaixo do alvo. | faltam 0 faixas, 48 artistas, 0 labels |
| Aviso | melodic_dubstep | Cobertura abaixo do alvo. | faltam 0 faixas, 48 artistas, 0 labels |
| Aviso | melodic_house | Cobertura abaixo do alvo. | faltam 0 faixas, 48 artistas, 0 labels |
| Aviso | microhouse | Cobertura abaixo do alvo. | faltam 0 faixas, 48 artistas, 0 labels |
| Aviso | microsound | Cobertura abaixo do alvo. | faltam 0 faixas, 48 artistas, 0 labels |
| Aviso | minimal_wave | Cobertura abaixo do alvo. | faltam 0 faixas, 48 artistas, 0 labels |
| Aviso | musique_concrete | Cobertura abaixo do alvo. | faltam 0 faixas, 48 artistas, 0 labels |
| Aviso | neurohop | Cobertura abaixo do alvo. | faltam 0 faixas, 48 artistas, 0 labels |
| Aviso | nu_skool_breaks | Cobertura abaixo do alvo. | faltam 0 faixas, 48 artistas, 0 labels |
| Aviso | outrun | Cobertura abaixo do alvo. | faltam 0 faixas, 48 artistas, 0 labels |
| Aviso | piano_house | Cobertura abaixo do alvo. | faltam 0 faixas, 48 artistas, 0 labels |
| Aviso | post_dubstep | Cobertura abaixo do alvo. | faltam 0 faixas, 48 artistas, 0 labels |
| Aviso | progressive_edm | Cobertura abaixo do alvo. | faltam 0 faixas, 46 artistas, 0 labels |
| Aviso | progressive_trance | Cobertura abaixo do alvo. | faltam 0 faixas, 48 artistas, 0 labels |
| Aviso | ragga_jungle | Cobertura abaixo do alvo. | faltam 0 faixas, 48 artistas, 0 labels |
| Aviso | retrowave | Cobertura abaixo do alvo. | faltam 0 faixas, 48 artistas, 0 labels |
| Aviso | reverse_bass | Cobertura abaixo do alvo. | faltam 0 faixas, 48 artistas, 0 labels |
| Aviso | sambass | Cobertura abaixo do alvo. | faltam 0 faixas, 48 artistas, 0 labels |
| Aviso | shangaan_electro | Cobertura abaixo do alvo. | faltam 0 faixas, 48 artistas, 0 labels |
| Aviso | singeli | Cobertura abaixo do alvo. | faltam 0 faixas, 48 artistas, 0 labels |
| Aviso | slap_house | Cobertura abaixo do alvo. | faltam 0 faixas, 47 artistas, 0 labels |
| Aviso | space_ambient | Cobertura abaixo do alvo. | faltam 0 faixas, 48 artistas, 0 labels |
| Aviso | techstep | Cobertura abaixo do alvo. | faltam 0 faixas, 48 artistas, 0 labels |
| Aviso | terrorcore | Cobertura abaixo do alvo. | faltam 0 faixas, 48 artistas, 0 labels |
| Aviso | tribal_house | Cobertura abaixo do alvo. | faltam 0 faixas, 48 artistas, 0 labels |
| Aviso | tropical_house | Cobertura abaixo do alvo. | faltam 0 faixas, 48 artistas, 0 labels |
| Aviso | uk_bass | Cobertura abaixo do alvo. | faltam 0 faixas, 48 artistas, 0 labels |
| Aviso | uk_hardcore | Cobertura abaixo do alvo. | faltam 0 faixas, 48 artistas, 0 labels |

## Como usar

- Rode `node scripts/quality-audit.mjs` para gerar este relatorio sem bloquear o fluxo.
- Rode `node scripts/quality-audit.mjs --strict` quando quiser falhar o processo se houver problema critico.
- Use este relatorio antes de commit/push para evitar recomendacao errada, falta de bandeira e catalogo fraco.
