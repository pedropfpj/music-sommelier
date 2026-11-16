# Sonic Search Web · descoberta contínua

Esta candidata parte da prévia de continuidade `0db6514b`. O escopo é Descobrir no Web App, com Biblioteca, perfil, comentários e links da gravação existentes. A Vercel serve o pacote `20261116discoveryNext3` do commit `00a3fe81` em uma prévia com autenticação. Uma visita anônima retornou HTTP 302. O JavaScript, os estilos, o manifesto e os catálogos revisados de Batida, French House e Bleep Techno conferiram com os arquivos locais por SHA-256. O domínio público segue no release de Batida. [Prévia protegida](https://music-sommelier1-gvivtexpk-cbklabs.vercel.app/) · [Branch de revisão](https://github.com/pedropfpj/music-sommelier/tree/codex/web-discovery-next-20261116)

## O que mudou

- O histórico anônimo guarda até 96 gravações apresentadas no navegador. A exclusão usa a identidade da gravação quando disponível e também funciona com títulos e créditos alternativos. A leitura acompanha alterações feitas em outra aba. A rotação de visitantes novos distribui estilos de diferentes famílias. Um navegador limpo tem sua própria abertura, sem herdar histórico de outro navegador.
- As reações atualizam o gosto antes de escolher a próxima faixa. Candidatas já preparadas podem mudar de ordem conforme o gosto, sem interromper a escuta para consultar outro provedor. O descarte sem escuta confirmada pode ficar na Biblioteca sem virar uma rejeição musical. Uma falha de áudio atualiza a confiança na fonte. A primeira implementação comprova escuta pelo avanço do áudio direto da gravação ativa.
- French House e Bleep Techno continuam priorizando gravações exatas com prévia direta enquanto houver artistas elegíveis. Quando essa seleção acaba, a rota verificada em widget continua disponível com seu próprio controle de Play. Os filtros explícitos continuam valendo no esgotamento.
- Uma URL interna que ainda precisa resolver áudio em outro serviço deixou de contar como prévia pronta. Em um ensaio anterior, cinco faixas legadas de Techno chegaram assim ao player. Uma consulta pontual à mesma rota no site público respondeu HTTP 403. O navegador ainda pode usar uma fonte depois de confirmar que recebe mídia.
- O filtro por BPM continua ativo nas reações e em Outra faixa mesmo quando o seletor de estilo está livre. Escolher apenas o BPM já começa a carregar o catálogo principal em segundo plano. Na calibração, o clima Groovado passa a orientar as primeiras escolhas como sugestão, sem criar um filtro fixo de House.
- Respostas antigas de uma busca, substituição ou reprodução da fila são descartadas ao trocar de perfil. A faixa, o histórico e o estado da busca da nova sessão têm seus próprios testes de isolamento.
- A gravação com um link exato para Apple Music agora pode ser aberta a partir de Ouvir nas plataformas. A edição que abre pela Biblioteca ou por um link do Sonic mantém o mesmo destino. As mudanças reutilizam o acervo e as rotas de escuta existentes.

## Resultados

Os percursos usaram perfis descartáveis em Chromium e WebKit, catálogo do app, mídia real e respostas controladas das APIs opcionais. Os resultados contam como áudio direto somente quando o navegador registrou avanço da mídia audível da gravação em tela.

| Percurso móvel | Cartões e artistas na candidata | Áudio direto antes | Áudio direto na candidata |
| --- | ---: | ---: | ---: |
| Descoberta aberta | 20 e 20 em cada motor | — | 17/20 em cada motor |
| French House | 20 e 20 em cada motor | 6/20 em cada motor | 18/20 em cada motor |
| Bleep Techno | 20 e 20 em cada motor | 6/20 Chromium e 5/20 WebKit | 12/20 Chromium e 13/20 WebKit |
| Full-On Night, 145–155 BPM | 5 e 5 em cada motor | 5/5 em cada motor | 5/5 em cada motor |

A descoberta aberta passou por 17 estilos em seis famílias por motor. Os resultados de WebKit nessa tabela são da compilação anterior ao pré-carregamento de BPM. As faixas encaminhadas ao Bandcamp exibiram o widget ou sua indicação de Play. Em duas verificações pontuais dos widgets o servidor respondeu HTTP 200, mas o teste não confirmou avanço de áudio. Os casos de widget ficam separados dos números de áudio direto. Full-On Night apresentou recuperação depois das cinco gravações do recorte, sem sair do intervalo nem repetir. A preferência por prévia direta reduziu a variedade de selos nessa amostra, embora os 20 créditos de artista tenham continuado distintos.

Com os mesmos 145–155 BPM e sem subgênero selecionado, o bundle entregue apresentou sete faixas distintas e cinco prévias diretas em duas sessões de Chromium desktop. No WebKit móvel apresentou cinco faixas distintas e quatro prévias diretas antes de sinalizar esgotamento. O teste inclui recarga e alterna os botões de próxima faixa e de reação. Nenhuma faixa mostrada saiu do intervalo.

O teste de aprendizado usou os mesmos candidatos prontos antes e depois da curtida e observou uma nova escolha na primeira recomendação seguinte. Áudio mudo ou com volume zero não confirmou escuta. Falha técnica e descarte antes de ouvir mantiveram os sinais de gosto separados. Os testes de sessão exercitaram consultas, recarga e respostas que chegam depois de mudar de perfil.

No mesmo navegador, as duas formas de entrada sem login fizeram três visitas de cinco faixas por motor. Foram 60 cartas com áudio direto confirmado, sem repetir uma gravação entre as visitas de cada contexto. Um teste separado reproduziu na base a mesma gravação reaparecendo com crédito alternativo. A candidata excluiu esse caso, inclusive entre duas abas e depois da recarga. Em seis navegadores limpos por motor houve quatro primeiras faixas diferentes no Chromium e cinco no WebKit. A seleção de cinco compartilhou, em média, duas faixas por par no Chromium e 1,53 no WebKit. Essa amostra mede a sobreposição em contextos independentes e não acompanha pessoas entre navegadores.

O replay de “Alma do Meu Pai” preservou o áudio e o destino da edição correta no Apple Music ao recarregar, abrir pela Biblioteca de outra sessão simulada ou seguir o link. Os testes de salvamento, filas, classificação, primeira experiência e escuta semanal Web passaram. A checagem legada que exige o mesmo identificador de build para iOS e Web já falhava na base. Esta rodada valida o Web App em navegadores simulados, sem login de uma conta real ou teste em aparelho físico.

A prévia usa as fontes do catálogo atual. A ampliação de repertório tocável e a reprodução dentro do app a partir de outros serviços dependem de novas fontes autorizadas. As medições aqui são amostras dos recortes citados.

## Como conferir

O simulador usa o navegador, interage com a interface e registra cartões, estilo, BPM, repetições, artistas, selos e avanço real do áudio. O carregamento de um widget é registrado separadamente. As visitas anônimas em um mesmo navegador incluem primeira abertura, recarga e abertura em nova aba depois de fechar a anterior.

```sh
PORT=8862 node scripts/local-preview-server.mjs
SONIC_BROWSER_SEQUENCE_LENGTH=20 SONIC_BROWSER_REQUIRE_NO_REPEAT=1 \
  node scripts/measure-opening-browser.mjs chromium http://127.0.0.1:8862/ \
  'french_house:1,bleep_techno:1,full_on_night_bpm:1'
SONIC_BROWSER_REQUIRE_NO_REPEAT=1 SONIC_BROWSER_FRESH_OVERLAP=1 \
  node scripts/measure-opening-browser.mjs webkit http://127.0.0.1:8862/ \
  'guest-reentry:1,visitor-reentry:1,guest:6'
SONIC_BROWSER_REQUIRE_NO_REPEAT=1 SONIC_BROWSER_VIEWPORT=desktop \
  node scripts/measure-opening-browser.mjs chromium http://127.0.0.1:8862/ \
  'bpm_only_reload:1,calibrated:1'
```

Os perfis e dados sensíveis ficam fora dos ensaios. O comparador alterna a ordem das versões quando é configurado com `SONIC_BROWSER_COMPARE_URL`. O script aceita de uma a 30 ações, Chromium e WebKit e os perfis móvel e desktop. Os testes controlados exercitam ainda as mudanças de perfil durante esperas e distinguem exibição da faixa, áudio disponível e áudio tocado.
