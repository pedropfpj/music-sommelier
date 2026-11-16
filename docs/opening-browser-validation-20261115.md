# Validação da sequência inicial do Sonic Search

A comparação usa o bundle web `20261115batida101` e o bundle candidato `20261115opening1`. Foram usados contextos de navegador novos, idioma preferido `pt-BR`, fuso de São Paulo e toque em controles visíveis. O endereço público abriu diretamente em Descobrir para os visitantes anônimos. A calibração inicial foi exercitada pelo endereço de QA em `localhost`, com a interface real, incluindo a opção de pular e as respostas iniciante, faixa e groovado.

O roteiro das cinco faixas foi **Ouvir uma faixa → Outra faixa → Curti → Não curti → Outra faixa**. A sessão de recarregamento repetiu o roteiro com uma recarga depois de Não curti e verificou o histórico antes da quinta faixa. Nos cenários com filtro, foram usados **Ajustar descoberta → Refinar por subgênero e BPM → Encontrar minha faixa → Outra faixa**, com tentativas subsequentes no mesmo estilo. Full-on Night foi verificado sem BPM e também com `145–155`; Batida teve uma sessão de regressão. O pareamento usa Chromium com perfil móvel Pixel 7 e WebKit com perfil móvel iPhone 13, ambos no macOS.

O teste registra a primeira apresentação da faixa, a configuração do player, o carregamento de dados de mídia ou do iframe e o primeiro avanço do relógio de mídia acima de 0,15 s com reprodução registrada, sem silenciamento e com volume positivo. Esta última medida inclui a latência até a confirmação do navegador. O `load` de um iframe por si só confirma somente o carregamento do frame. As APIs opcionais do app recebem a mesma resposta neutra em ambas as versões locais. A janela de observação foi de até 4,5 s após a apresentação da faixa, com orçamento de busca de 14 s. Os arquivos, prévias diretas e widgets externos são reais. O teste não usa contas conectadas.

## Site publicado

Na execução separada no endereço público com APIs opcionais disponíveis, quatro visitantes novos no Chromium receberam quatro primeiras faixas diferentes. Um par de visitantes recebeu as mesmas quatro gravações seguintes, e a interseção média entre pares foi de 2,00 entre cinco. Houve áudio automático em 17 de 20 ações. Em Full-on Night, o único resultado foi **Virtual Light & Module Virus — Extreme Transmission**. O iframe do Bandcamp chegou a carregar, o relógio de mídia não avançou e as quatro novas buscas terminaram com o aviso de recuperação, mantendo o filtro.

## Comparação local

Cada percurso padrão teve seis visitantes independentes por navegador e versão. Todos receberam cinco gravações de cinco créditos distintos dentro da visita. A interseção compara os conjuntos de cinco faixas de cada par de visitantes, independentemente da ordem. As identidades são as chaves normalizadas de gravação e de crédito artístico usadas pelo app.

| Navegador | Gravações distintas no total | Créditos artísticos distintos no total | Faixas em comum por par, média | Áudios iniciados sem novo toque | Mediana do primeiro áudio |
| --- | --- | --- | --- | --- | --- |
| Chromium | 14 → 14 | 14 → 14 | 2,27 → 1,53 | 25/30 → 30/30 | 0,78 → 1,01 s |
| WebKit | 15 → 18 | 15 → 18 | 2,27 → 1,33 | 27/30 → 30/30 | 1,07 → 1,70 s |

A interseção de artistas teve os mesmos valores que a de gravações nesses dois grupos. A maior sobreposição de um par caiu de quatro para três no Chromium e de quatro para duas no WebKit. O primeiro áudio do candidato avançou em todas as 12 visitas padrão, em 0,93–1,19 s no Chromium e 1,30–1,95 s no WebKit. As duas coortes tiveram medianas maiores para o candidato. Uma prova adicional do primeiro toque, alternando a ordem das duas versões no WebKit, mostrou 4/6 → 5/6 inícios de áudio e mediana de 3,57 → 2,18 s entre os inícios observados. A variação entre as duas rodadas impede uma conclusão sobre mudança de latência.

Com a mesma calibração de House, a base iniciou 7/15 prévias no Chromium e 9/15 no WebKit. O candidato iniciou 15/15 em cada navegador, sempre com cinco créditos distintos por visita e nenhuma recuperação. Os visitantes com as mesmas respostas ainda receberam muitos dos mesmos artistas. A interseção média foi de 4,33 faixas no Chromium e 3,67 no WebKit, com ordem variada.

Em Full-on Night, a base local repetiu o resultado do site publicado em ambos os navegadores. O candidato tocou 5/5 prévias diretas de cinco créditos distintos em cada navegador, com primeiro avanço em 1,28 s no Chromium e 1,00 s no WebKit. O filtro de `145–155 BPM` também produziu cinco faixas com BPM verificado entre 148 e 150. A recarga focada no Chromium preservou o estilo, a faixa de BPM e as quatro faixas vistas. A quinta foi inédita na sessão e tocou após a recarga. Uma execução separada no Chromium avançou nas cinco prévias em 0,43–0,56 s por toque. Na sexta tentativa, mostrou a recuperação e preservou a última carta e os dois filtros, sem entregar uma repetição.

No percurso geral, a recarga manteve as quatro faixas vistas e registrou uma curtida e uma passada. Após recarregar, o filtro de estilo ficou livre como no início da visita. A quinta faixa tocou sem repetir as anteriores. Na regressão de Batida pelo Chromium, as cinco cartas tiveram créditos distintos e continuaram em Batida. Houve um início de áudio observado. Quatro cartas abriram widgets do Bandcamp com botão de reprodução próprio.

O endereço da implantação de prévia retornou a tela de login da Vercel em acesso anônimo. As medições do candidato acima usam a prévia local.

## Reprodução

Sirva a base e o candidato em portas diferentes com `PORT=<porta> node scripts/local-preview-server.mjs` nos respectivos checkouts. Execute o comando abaixo na versão candidata para cada URL. Use `SONIC_PLAYWRIGHT_MODULE` para apontar ao módulo Playwright instalado ou deixe o script carregar `playwright` do ambiente. Use `SONIC_CHROMIUM_EXECUTABLE` se quiser selecionar uma instalação do Chrome.

```sh
node scripts/measure-opening-browser.mjs webkit http://127.0.0.1:8824/ \
  'guest:6,full_on_night:1,full_on_night_bpm:1,calibrated:3,reload:1,skip-calibration:1'
node scripts/measure-opening-browser.mjs chromium http://127.0.0.1:8824/ \
  'guest:6,full_on_night:1,calibrated:3,reload:1,full_on_night_bpm:1,full_on_night_reload:1,full_on_night_exhaust:1,batida:1,visitor:1'
```

Para a medição pública com as APIs opcionais disponíveis, use `SONIC_BROWSER_CONTROLLED=0` e `guest:4,full_on_night:1`. Para repetir a comparação intercalada, alterne os dois endereços com `webkit` e `first:1`.
