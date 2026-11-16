# Sonic Search Web · continuidade de escuta · 16/11/2026

A candidata do Web App deriva de `fc503262` e mantém o layout de Descobrir e os catálogos da prévia anterior. A Vercel está servindo o código `a09970c9`, bundle `20261116continuity2`. A prévia exige autenticação e uma visita anônima respondeu com redirecionamento (HTTP 302). O domínio de produção segue no bundle de Batida `20261115batida101`. [Prévia protegida](https://music-sommelier1-nqf9mk2bh-cbklabs.vercel.app/) · [Branch de revisão](https://github.com/pedropfpj/music-sommelier/tree/codex/web-continuity-20261116)

O link de “Alma do Meu Pai” na prévia serviu o HTML com as versões esperadas dos scripts e folhas de estilo. Os arquivos JavaScript, CSS, manifesto do catálogo e os catálogos de Batida, French House e Bleep Techno coincidiram com os arquivos locais por SHA-256. As rotas editoriais e de feed do Jornal retornaram HTTP 200 com contexto da própria aplicação. O feed devolveu três itens no ensaio. [Link da gravação revisada](https://music-sommelier1-nqf9mk2bh-cbklabs.vercel.app/?track=dj+firmezaalma+do+meu+pai&style=batida&lang=pt&recording=apple_music%3A1348713422)

Em “Alma do Meu Pai”, o teste usou a edição revisada de DJ Firmeza, da Príncipe (Apple Music `1348713422`). A produção de Batida (`3e4e9bee`) e a prévia anterior (`fc503262`) tocaram a prévia dessa edição em Descobrir. Após curtir, recarregar e tocar pela Biblioteca, ambas trocaram para a edição `1596163657`. O mesmo ocorreu em outro contexto de navegador com a Biblioteca restaurada pelo serviço simulado. A chave gravava artista e título, e a busca aceitava a primeira faixa com esse nome antes de consultar o catálogo revisado.

A Biblioteca agora sincroniza o identificador da gravação quando o catálogo o fornece. O link público leva o mesmo identificador e abre a faixa em silêncio até o comando de reprodução. Antes de consultar outra fonte de áudio, o player verifica se ela pertence à gravação escolhida. O histórico que ainda tem uma fonte exata ou edição reconhecível conserva essa escolha. Em registros e links sem evidência suficiente, o catálogo revisado tem prioridade. Esse último caso não permite recuperar com certeza qual edição foi ouvida originalmente. Clientes antigos que regravarem os dados podem descartar o novo campo.

Com o mesmo atraso de rede de 2,5 s no catálogo revisado, o primeiro candidato de continuidade abortava pelo limite de 2,2 s da busca rápida. A abertura explícita passou a usar seu próprio prazo e pode refazer uma requisição compartilhada abortada dentro dele. O orçamento da descoberta não mudou. Esse ensaio verifica tolerância à demora, sem inferir ganho de velocidade.

No bundle entregue, Chromium e WebKit em celular e desktop tocaram a edição `1348713422` depois de recarregar, restaurar a Biblioteca em outro navegador e abrir o link com o atraso controlado. As quatro combinações também tocaram a versão correta nos dois históricos sem ID. O histórico com o lançamento Príncipe abriu a edição revisada, e o histórico com o lançamento Alma do Meu Pai - EP abriu a edição `1596163657`. Uma tentativa anterior no WebKit móvel estourou o prazo do teste com um arquivo de áudio selecionado e ainda sem dados prontos para tocar. A repetição passou com o mesmo bundle. No desktop WebKit, foi preciso ajustar o teste para clicar em Play depois do controle nativo de voltar 15 s.

Dois defeitos de áudio também foram reproduzidos na candidata anterior. Com a resposta de uma prévia de Full-On Night retida, abrir o Jornal e depois liberar a resposta iniciava áudio fora de Descobrir (1,25 s de avanço em Chromium). A candidata cancela o início ao sair e permite tocar a mesma gravação ao voltar. Separadamente, avançar enquanto uma recuperação estava em curso mantinha o bloqueio depois que a resposta antiga chegava. Na nova versão, uma segunda falha de mídia inicia uma nova recuperação. O teste força falhas HTTP 404 na mídia e verifica o avanço de áudio entre as falhas.

O feed do Jornal registra edições de SonicSearch Recomenda em 22/10, 29/10, 05/11 e 12/11, todas quintas-feiras, com horários diferentes. A chamada em Descobrir, o cartão em Mais opções e a página da seleção agora usam frequência semanal em português, inglês e espanhol. O seletor da página semanal passou de 26 para 48 px de altura no WebKit. As mudanças foram feitas no texto e no controle da interface. [Feed público do Jornal](https://sonicsearch.app/api/news-editor?limit=20)

O teste de primeira experiência esperava a antiga aba Mais na navegação primária. Agora verifica o acesso via Perfil → Mais opções e a distinção da aba nativa. A verificação de carga por estilo ainda exige o catálogo do estilo escolhido e aceita o parâmetro de prazo acrescentado ao carregador. Os testes de preparação e renovação semanal não incluíam dependências que o aplicativo real já carregava para validar fontes revisadas e isolar o player. A simulação foi atualizada e verifica identidade, URL vencida, avanço de mídia, ordem e cancelamento da fila. O teste separado `test-weekly-highlights` já falhava nesta linhagem porque exige o mesmo identificador para o Web e o pacote iOS.

Os testes de navegador usam perfis isolados. A conta e a sincronização da Biblioteca são simuladas. O teste de “Alma do Meu Pai” usa o catálogo e os arquivos de áudio reais do provedor e verifica o relógio da mídia, volume positivo e a identidade da fonte que tocou. Os testes semanais controlados usam mídia decodificada de teste e também exercitam a integração com o app. O ensaio na edição pública de 11/11 confirmou 2 de 6 prévias em cada motor e reproduziu áudio em ambos. A disponibilidade observada variou por gravação e motor. O login real e o Safari em iPhone físico não foram validados.

Nas sequências móveis com o código de continuidade, Descobrir anônimo, Groovado, Full-On Night com 145–155 BPM, Full-On Night após recarga, French House e Bleep Techno tocaram 5 de 5 prévias diretas por cenário em cada motor (30 por motor). Cada sequência mostrou cinco créditos de artista distintos. Batida mostrou cinco gravações de cinco créditos em cada motor. Em ensaios separados, o relógio avançou no SoundCloud em Chromium e no Bandcamp em WebKit após tocar o controle do widget, conforme a indicação da interface. Os testes dos catálogos revisados também percorreram 101 gravações de Batida, 105 de French House e 103 de Bleep Techno.

Para repetir, com Playwright e os motores instalados:

```sh
node scripts/verify-recording-continuity-ui.mjs chromium desktop
node scripts/verify-recording-continuity-ui.mjs webkit mobile
node scripts/test-reviewed-style-catalog.mjs
node scripts/test-first-experience.mjs
SONIC_BROWSER_ENGINE=webkit pnpm run test:weekly-previews
SONIC_BROWSER_ENGINE=webkit node scripts/verify-weekly-recommends-ui.mjs
```

Com uma cópia local da base ou da prévia anterior em execução, use `SONIC_CONTINUITY_URL` para apontar para a versão em teste e `SONIC_CONTINUITY_BASELINE=1` para reproduzir a troca observada da gravação. O script de continuidade de Descobrir aceita o endereço de um servidor local e permite separar navegação, recuperação e teclado:

```sh
node scripts/test-web-discovery-continuity-browser.mjs chromium http://127.0.0.1:8853/ tab desktop
node scripts/test-web-discovery-continuity-browser.mjs webkit http://127.0.0.1:8853/ recovery mobile
node scripts/test-web-discovery-continuity-browser.mjs webkit http://127.0.0.1:8853/ keyboard mobile
```
