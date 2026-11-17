# Revalidação de Full-On Night em 17/11/2026

Foram revalidadas as 30 candidatas identificadas em `docs/authorized-catalog-coverage.md`, usando as edições do commit editorial `5acf79a2`. As 29 edições Apple retornaram no lookup oficial com o mesmo identificador, artista, título, duração e URL de prévia. Todas responderam HTTP 206 ao pedido dos primeiros bytes e tocaram no Chromium, com `readyState=4` e avanço superior a 0,3 s. A reprodução usou mídia real do provedor, sem gravação de áudio no repositório.

Entraram na fonte persistente `data/full_on_night_revalidated_20261117.csv` 28 dessas edições, com BPM editorial entre 146 e 154. O compilador registra essa fonte em `FULL_ON_NIGHT_PUBLISHER_SOURCES`, preservando o snapshot da gravação ao mesclar o catálogo. A prova exata do aplicativo vincula artista, título, ID Apple, URL de origem, evidência de estilo, prefixo do asset de áudio e BPM. O teste da sequência integrada no app deve confirmar a meta de vinte artistas e vinte gravações. A revalidação isolada de mídia descrita aqui mede disponibilidade e decodificação.

Os BPMs vêm da revisão editorial por edição. Eles não foram estimados do trecho de áudio nesta rodada. Páginas atuais da Neurotrance reconfirmaram explicitamente os valores de Afhgany, Luxbuna & Systematic Audio, Disintegrated Circuits, Zabot, Kontrol Z, Dr3x, Mental Chip, Spookyhertz, Zeazea, Biokinetix, Outer Connection, Roby e Hysteria. A página da Digital Nomads reconfirmou 150 BPM para Dark Spells. As demais edições conservam o valor editorial publicado no lote original, com evidência de gravação e estilo preservada.

A evidência de Atech foi atualizada para o lançamento oficial da Dacru, cuja descrição identifica a faixa como night full on. A de Zeazea foi atualizada para a página exata de Chaos, que informa Full Power a 146 BPM e a classificação Full On Night. A consulta direta ao chart de Noctum na Beatport e ao anúncio anterior de Atech retornou 403. A ligação editorial do chart de Noctum foi preservada, e a identidade de Warriors foi reconfirmada no lançamento da Antu. O PDF da UNESP usado para Axial Tilt respondeu 200. A fonte de Terraformers falhou em uma consulta de rede nesta rodada, e a evidência editorial existente foi preservada.

| Artista | Gravação e edição | BPM editorial | Revalidação de mídia | Decisão |
| --- | --- | ---: | --- | --- |
| Afhgany | Alto Control (U-Rak Remix) — `apple_music:1546030636` | 148 | Lookup e HTTP 206, Chromium 0.35 s | Integrada |
| Atech | The Night of the Wolf — `apple_music:1536932687` | 148 | Lookup e HTTP 206, Chromium 0.35 s | Integrada |
| Axial Tilt | Uaiyoo — `apple_music:1735753652` | 148 | Lookup e HTTP 206, Chromium 0.35 s | Integrada |
| Azax Syndrom | Evil Force — `apple_music:205871222` | 147 | Lookup e HTTP 206, Chromium 0.33 s | Integrada |
| Biokinetix | Virtual Combat (PsychoSocial RMX) — `apple_music:1704239062` | 148 | Lookup e HTTP 206, Chromium 0.31 s | Integrada |
| D-ther | Dark Spells — `apple_music:1673983572` | 150 | Lookup e HTTP 206, Chromium 0.35 s | Integrada |
| Digital Murders | Fall of Murders — `apple_music:1323914825` | 146 | Lookup e HTTP 206, Chromium 0.33 s | Integrada |
| Disintegrated Circuits | Sabotage — `apple_music:1546030641` | 150 | Lookup e HTTP 206, Chromium 0.30 s | Integrada |
| Dr3x | Revolution — `apple_music:1572034611` | 150 | Lookup e HTTP 206, Chromium 0.31 s | Integrada |
| Drip Drop | Musical Neurons (Ingrained Instincts Remix) — `apple_music:1835660838` | 150 | Lookup e HTTP 206, Chromium 0.32 s | Pendente de evidência de Full-On Night |
| Hysteria | Lust — `apple_music:1704658196` | 146 | Lookup e HTTP 206, Chromium 0.31 s | Integrada |
| Jhesha | Sinful Reactions - Our Music (feat. Sinful Reactions) [Jhesha Remix] — `apple_music:1438447689` | 148 | Lookup e HTTP 206, Chromium 0.32 s | Integrada |
| Kontrol Z | Recycle — `apple_music:1572034608` | 147 | Lookup e HTTP 206, Chromium 0.31 s | Integrada |
| Luxbuna & Systematic Audio | Industrial Machinery — `apple_music:1546030635` | 148 | Lookup e HTTP 206, Chromium 0.31 s | Integrada |
| Mega | Hidden Dimension — `apple_music:1575546142` | 147 | Lookup e HTTP 206, Chromium 0.32 s | Integrada |
| Mental Chip | Space Science — `apple_music:1572034814` | 146 | Lookup e HTTP 206, Chromium 0.32 s | Integrada |
| Noctum | Warriors — `apple_music:1674835145` | 147 | Lookup e HTTP 206, Chromium 0.32 s | Integrada |
| Outer Connection | Night of Murder — `apple_music:1704239064` | 149 | Lookup e HTTP 206, Chromium 0.31 s | Integrada |
| Phatmatix | Vertigo — `apple_music:1238337116` | 147 | Lookup e HTTP 206, Chromium 0.31 s | Integrada |
| Pragmatix & -GROOVEBOX- | Game On — `apple_music:1729649951` | 148 | Lookup e HTTP 206, Chromium 0.33 s | Integrada |
| Pzyshow | Talking Trees — `apple_music:1855805461` | 154 | Lookup e HTTP 206, Chromium 0.33 s | Integrada |
| Roby | Comando Armado (feat. Kontrax) — `apple_music:1704239058` | 147 | Lookup e HTTP 206, Chromium 0.31 s | Integrada |
| Sodom | Real Life — `apple_music:1728383704` | 148 | Lookup e HTTP 206, Chromium 0.31 s | Integrada |
| Spookyhertz | Computer Musik — `apple_music:1572034833` | 148 | Lookup e HTTP 206, Chromium 0.33 s | Integrada |
| Terraformers | The Oracle — `apple_music:1732739697` | 146 | Lookup e HTTP 206, Chromium 0.33 s | Integrada |
| Tryambaka | No Mercy — `apple_music:1575546681` | 146 | Lookup e HTTP 206, Chromium 0.32 s | Integrada |
| Zabot | Back To Isness — `apple_music:1546030639` | 146 | Lookup e HTTP 206, Chromium 0.31 s | Integrada |
| Zeazea | Full Power — `apple_music:1546031817` | 146 | Lookup e HTTP 206, Chromium 0.33 s | Integrada |
| Zinx & Demosys | Bunjee Jumping [Zinx vs. Demosys] — `apple_music:577461331` | 148 | Lookup e HTTP 206, Chromium 0.31 s | Integrada |
| Axiomod | Single Dose — `bandcamp:849234009` | 148 | Lançamento e widget HTTP 200, avanço de áudio não confirmado | Pendente de reprodução no widget |

Drip Drop — Musical Neurons (Ingrained Instincts Remix) permaneceu pendente. O vínculo anterior de estilo apontava para a página de outro artista, Yesod. O lançamento oficial da Future Music confirma a gravação e o remix, mas a página consultada apresenta apenas categorias mais amplas. O áudio atual toca, e a edição foi identificada. Falta uma evidência pertinente para a classificação Full-On Night.

Axiomod — Single Dose permaneceu fora deste lote de prévias diretas. O lançamento da Arrábida confirma a gravação, o estilo e 148 BPM. O ID do Bandcamp é `849234009`. O lançamento e o embed responderam HTTP 200, mas as duas tentativas de navegador não confirmaram avanço do áudio. Essa faixa continua identificada como candidata de widget, e não compõe a meta de vinte prévias diretas.

Os resultados são observações de 17/11/2026. A disponibilidade pode variar por provedor, território e rede. A rodada usa as rotas de provedor existentes no aplicativo. O manifesto opcional de hospedagem de trechos próprios continua separado.

[Paranormal Effect](https://www.neurotrance.org/va-paranormal-effect/) · [Night Lines](https://www.neurotrance.org/va-night-lines/) · [Night Of Murder](https://www.neurotrance.org/va-night-of-murder/) · [Deadly Sins](https://www.neurotrance.org/va-deadly-sins/) · [Zeazea — Chaos](https://www.neurotrance.org/zeazea-chaos/) · [D-ther — Dark Spells](https://digitalnomadsrecords.bandcamp.com/album/d-ther-dark-spells) · [Atech — The Night Of The Wolf](https://dacrurecords.bandcamp.com/album/the-night-of-the-wolf) · [Pragmatix & Groovebox — Game On](https://psynopticz.bandcamp.com/album/game-on) · [Drip Drop — Musical Neurons](https://beatspace-futuremusic.bandcamp.com/album/musical-neurons-ingrained-instincts-remix) · [Axiomod — Single Dose](https://arrabida.bandcamp.com/album/single-dose)
