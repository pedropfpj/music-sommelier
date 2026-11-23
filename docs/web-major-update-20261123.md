# Sonic Search Web — descoberta, Biblioteca e reprodução

Candidata `20261123major2`, branch `codex/web-major-update-20261123`, a partir de `a21bc74d`. O foco pedido foi recomendações mais inteligentes e variadas.

## Descoberta e aprendizado

Pular sem ouvir já era uma reação neutra no handler, mas três leitores do histórico ainda contavam essa entrada como rejeição ao estilo e à família. Na base, uma única entrada `unheard_pass` de House mudava o sinal de gosto de zero para −1,159 e o sinal da família para −0,4416. `styleTasteSignal`, `styleFamilyTasteSignal` e as recomendações de artistas do Perfil agora ignoram os marcadores neutros e de falha de áudio. Rejeições musicais reais e dados históricos sem marcador continuam válidos.

O motor também passou a considerar o **BPM exato das curtidas recentes do mesmo subgênero**. Exige pelo menos duas curtidas com BPM válido e considera até oito. A afinidade tem peso limitado a dois pontos; não substitui qualidade, elegibilidade ou filtros. Intervalos estimados, números fora das regras do estilo e pulsos ambíguos não viram BPM exato. O campo opcional é preservado nas cópias locais e na sincronização, com revalidação ao receber dados. Histórico antigo sem esse dado continua funcionando.

No teste da fila real pronta, duas curtidas em 124/125 BPM fizeram o próximo picker trocar um candidato em 128 BPM por outro em 124, mantendo House e o intervalo selecionado. Esse é um teste controlado da mecânica, sem afirmar ganho de satisfação de ouvintes. Quando essa afinidade é suficiente, a explicação da faixa menciona o pulso próximo das curtidas recentes.

Uma segunda prova usou exclusivamente gravações reais do catálogo, sem consultar áudio: curtidas simuladas em Khaline — Sinchronicity (184 BPM) e Necropsycho — Vanaprastam (182 BPM). A fila aquecida tinha Astral Labyrinth Vs Zamurah — Undercore (200 BPM) e Orestis — Open UR Mind (182 BPM), ambos elegíveis em Psycore/175+. A base continuou escolhendo 200 BPM depois das curtidas; a candidata passou a escolher 182 BPM. Mesmas exposições e mesma fila, sem substituir o score ou a elegibilidade. A afinidade acrescentou 0,84848 ponto ao candidato próximo, mantendo o peso limitado. É uma demonstração específica, não uma medição de satisfação ou superioridade em todos os estilos. Evidência: `.vercel/major-intelligence/tempo-probe.json`; script `scripts/measure-tempo-affinity-catalog.mjs`.

Uma janela local de seis exposições a selos dá preferência leve a outro selo entre candidatos comparáveis. A janela fica limitada e separada por perfil. Não exclui um selo, não esgota uma fila válida e não vence grande diferença de qualidade. Artistas, colaborações e gravações continuam sujeitos às proteções existentes contra repetição.

## Filtros, Biblioteca e player

- Descobrir mostra os cinco filtros da próxima faixa. Remover um chip ou limpar os filtros mantém a música atual e os filtros restantes, sem iniciar áudio. O próximo feedback usa as escolhas atualizadas. `clearFilters()` preserva as memórias de artistas e faixas conhecidos.
- Biblioteca tem destino próprio no Web, com Curtidas/Descartadas, busca, ordenação e filtro de estilo. A navegação Web mantém cinco destinos; Amigos continua no Perfil. O nativo conserva a Biblioteca no Perfil.
- Remoção oferece Desfazer; Limpar pede confirmação. Desfazer respeita perfil, sessão, ações posteriores e remoções sincronizadas. Mantém a gravação e o tipo original de feedback, inclusive um pulo neutro. Quando a biblioteca chega ao limite de 80, escolhas novas têm prioridade e uma restauração parcial informa a contagem.
- Descartadas diferencia “Pulou sem ouvir”, “Problema no áudio” e “Não curti”. Abrir uma faixa mostra progresso/status; tocar durante outra preparação recebe uma explicação. Os selects nativos da Biblioteca têm 48 px também no WebKit.
- Uma interrupção **depois de começar a tocar** mostra espera por áudio. Se o buffer volta antes de oito segundos, a mesma reprodução continua. Se não volta, aparece retry da mesma gravação. Navegação, pausa e troca de faixa cancelam o prazo anterior. Isso se soma à proteção de início pendente já entregue.

As novas mensagens têm português, inglês e espanhol. O catálogo revisado e as regras estritas de subgênero/BPM foram preservados.

## Evidência e limites

O primeiro benchmark pareado usou uma seed, cinco estilos, faixas reais do catálogo e nenhuma consulta de mídia. Antes e depois da correção neutra e da janela de selos, foram 35 entregas por versão, sem repetir artista/faixa nem violar estilo/BPM. Não houve ganho mensurável de quantidade de selos ou da maior sequência de um selo nessa amostra. Essa comparação precede a afinidade de BPM e não demonstra superioridade geral do motor. Os resultados ficam em `.vercel/major-intelligence/results.json`; o script preserva falhas da rota rápida e o fallback antes de registrar indisponibilidade.

Na primeira sequência de vinte músicas reais do pacote `major1`, ambos os motores apresentaram vinte gravações de vinte artistas, sem repetir após recarregar e mantendo 145–155 BPM. Houve áudio direto confirmado em **19/20 no Chromium e 16/20 no WebKit**. Os quatro casos de WebKit tocaram normalmente quando isolados. Atech também passou por timeout imposto à requisição real e retry explícito da mesma fonte. A causa da variação original não foi isolada; os isolados não são somados para transformar a sequência em 20/20. Registros em `.vercel/major-update-qa/`.

Recuperação de início e buffer foi testada com áudio gerado e streaming controlado em Chromium/WebKit, incluindo resposta tardia, outra faixa, navegação, recuperação curta, timeout e idiomas. Esses testes não contam como repertório musical real.

Conta e sincronização dos testes são simuladas; os perfis móveis rodam em macOS. Login real e iPhone físico continuam pendentes. A atualização não demonstra aumento de retenção, satisfação ou velocidade em produção.

## Verificações reproduzíveis

```sh
node scripts/test-recommendation-intelligence.mjs
node scripts/test-library-bpm-roundtrip.mjs
node scripts/test-library-upgrade.mjs
node scripts/test-saved-tracks-sync.mjs
node scripts/test-discovery-filter-summary.mjs webkit --bundle
SONIC_LIBRARY_APP_SOURCE="$PWD/app.min.js" node scripts/test-library-upgrade-ui.mjs webkit
node scripts/test-preview-buffer-recovery.mjs webkit
node scripts/test-preview-start-recovery.mjs webkit mobile
node scripts/product-verify.mjs --screenshots --strict-screenshots
```

Também passaram nesta rodada os testes de ranking, história entre sessões, fila sem repetição, fallbacks sem repetição, variedade em sete estilos, aprendizado por swipe, navegação e reprodução salva. As verificações finais do pacote e da hospedagem são registradas abaixo.

## Pacote final

No bundle `20261123major2` (`app.min.js` SHA-256 `84f92448b21ccea26072c4a0db84b3cf376061dfd7cec02d44ca62ed7fb92e4f`):

- WebKit móvel: vinte músicas reais de vinte artistas, vinte áudios diretos, treze selos, zero repetição de gravação/artista e filtro 145–155 BPM preservado após recarga. Esta é uma nova sequência, não uma substituição dos resultados incompletos de `major1`.
- Chromium móvel: smoke de cinco músicas reais/cinco artistas, cinco áudios diretos, zero repetição e filtro preservado.
- Biblioteca em Chromium/WebKit: oito cenários de organização, remoção/undo, navegação, perfis e idiomas, sem exceções JavaScript. Capturas em 393/1440 px revisadas; controles testados também em 320 px.
- Filtros da próxima faixa em WebKit: remoção individual, cinco filtros, aprendizado preservado, áudio de teste sem reinício, recarga, perfis, idiomas e alvos de toque passaram.
- Inteligência por tempo, rejeição de BPM estimado/ambíguo, sincronização do campo exato e aprendizado por swipe passaram. O gate final `product-verify.mjs --screenshots --strict-screenshots` passou e capturou desktop, iPhone simulado, telefone pequeno, paisagem e abertura.

A recuperação de início e de buffer passou nos dois motores no primeiro bundle integrado; o código desse monitor não mudou na revisão que acrescentou afinidade de BPM. O pacote final também confirmou áudio real, preservação de identidade e navegação nas jornadas acima.

Capturas da atualização: [Biblioteca móvel](/Users/pedrofreire/.codex/visualizations/2026/11/23/01a20931-0a89-78e2-a6a5-ac6147c9a858/sonic-major/library-mobile.png) e [filtros](/Users/pedrofreire/.codex/visualizations/2026/11/23/01a20931-0a89-78e2-a6a5-ac6147c9a858/sonic-major/discovery-filters.png).

## Prévia para avaliação

[Abrir a atualização protegida](https://music-sommelier1-g1iv0qvha-cbklabs.vercel.app/), commit de código `84ea3005`. A Vercel concluiu a implantação como prévia, sem destino de produção. O acesso anônimo respondeu HTTP 302; a proteção existente foi mantida. O bundle, `discovery-experience.js` e `discovery-experience.css` hospedados coincidiram por SHA-256 com os arquivos testados. O HTML hospedado confirmou o build `20261123major2`, a Biblioteca, o resumo dos filtros e as versões novas de JS/CSS.

O domínio `sonicsearch.app` continuou servindo `20261115batida101` na conferência final. Não houve um novo teste de conta real na hospedagem. A pasta principal e as candidatas anteriores foram preservadas.
