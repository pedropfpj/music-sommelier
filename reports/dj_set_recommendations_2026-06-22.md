# DJ Set Recommendations - 2026-06-22

Objetivo: criar uma curadoria separada de DJs/selectors para o app, sem tratar esses nomes como produtores do catalogo principal de faixas. Cada entrada precisa ter um set publico tocavel em YouTube ou SoundCloud e uma classificacao de territorio musical baseada no set.

## Criterios

- Entram como `selector_first_set_recommendation`, nao como faixa autoral.
- O player precisa ser embutivel ou pelo menos reconhecido pelo oEmbed do YouTube.
- A classificacao usa o set e a cena, nao somente o nome do flyer.
- MOP e cenas psy/dark ficam separadas de selectors globais de club music.
- Casos rapidos foram classificados com cuidado: Anginha, Booo e Psynonima entram como hi-tech; Maiko entra como dark/forest; Giuseppe entra como forest/dark psy.

## Lote inicial

| DJ | Lane | Subgenero do set | Set tocavel |
| --- | --- | --- | --- |
| Paula | MOP | Dark Psy / Psycore | [Paula @ Master of Puppets 2025](https://www.youtube.com/watch?v=4fXJmW78rns) |
| DJ Booo | MOP | Hi-Tech / Psycore | [DJ BOOO - ReveillOz 2018 / 2019](https://soundcloud.com/booo_cosmic_crew/dj-booo-reveilloz-2018-2019) |
| Anginha | MOP | Hi-Tech | [ANGINHA - Set exclusivo Hitech Connection #001](https://soundcloud.com/hitechconnection/anginha-set-exclusivo-hitech-connection-001) |
| Maiko | MOP | Dark Psy / Forest Psy | [Maiko - Full Set @ Universo Paralello #18](https://www.youtube.com/watch?v=c03EeWES7kQ) |
| Psynonima | MOP | Hi-Tech / 200 BPM | [Pakawalla Hitech DJSET / Psynonima](https://soundcloud.com/psynonima/pakawalla-hitech-djset-psynonima) |
| Giuseppe | Psy global | Forest Psy / Dark Psy | [Giuseppe @ The Hive - MoDem Festival 2024](https://www.youtube.com/watch?v=o7q7SoKsk9Y) |
| Boom Shankar | Psy global | Psytrance / Twilight | [Boom Shankar @ Boom Festival 2022](https://www.youtube.com/watch?v=jaq6dvI5wuM) |
| Ben UFO | Selectors globais | UK Garage / Bass / Techno | [Ben UFO - Boiler Room x Dekmantel 2019](https://www.youtube.com/watch?v=phClx3879HM) |
| Jane Fitz | Selectors globais | Deep House / Acid / Techno | [Jane Fitz - Boiler Room Milan: Apollo](https://www.youtube.com/watch?v=E4v61EdGFI4) |
| Josey Rebelle | Selectors globais | Techno / House / Electro | [Josey Rebelle - Boiler Room x Dekmantel 2022](https://www.youtube.com/watch?v=UpgpCZM97Hg) |
| Jyoty | Selectors globais | House / Global Club / Bass | [Jyoty - Boiler Room: London](https://www.youtube.com/watch?v=2VrztYTNYT8) |

## Verificacao tecnica

Os 11 links retornaram HTTP 200. Os links de YouTube foram reconhecidos pelo endpoint publico de oEmbed e os links de SoundCloud foram escolhidos para melhorar o embed real dentro da aba. O app sempre mostra tambem um link externo de fallback.

## Observacoes de curadoria

- A aba nao afirma que esses DJs nunca produziram; ela afirma que, para este fluxo do app, eles entram pela forca de sets e selecao musical.
- O catalogo principal continua sendo para artistas/produtores com faixas tocaveis.
- A lista pode crescer com mais DJs de SoundCloud usando as mesmas colunas do CSV.
