# Sonic Search Web · validação de 16 de novembro de 2026

Prévia protegida pela autenticação da Vercel. O código testado é o commit `3211918b`, com o bundle `20261116discovery1`, na branch `codex/web-discovery-release-20261116`. A candidata deriva da versão pública de Batida, passa pelas prévias de sequência e Groovado e inclui os catálogos revisados de French House e Bleep Techno.

[Abrir prévia](https://music-sommelier1-my8rw5dsr-cbklabs.vercel.app/) · [Branch de revisão](https://github.com/pedropfpj/music-sommelier/tree/codex/web-discovery-release-20261116)

## Descobrir e filtros

A capa, a faixa, o artista e as ações principais precedem o áudio nativo, o progresso e “Não tocou”. Os comentários vêm depois da área de escuta. Na sessão pública em Chromium de 400 × 802 com comentários visíveis e rolagem inicial zero, o controle de áudio começava em y=947. Na candidata testada, começou em y=616. Os controles também couberam na primeira tela em WebKit de 320 × 720 e em desktop de 1440 × 960.

A busca pelos 169 subgêneros foi exercitada com acentos, resultado vazio, teclado e foco após a seleção. A recarga manteve o estilo e BPM escolhidos, a faixa automática deixou o seletor livre e a remoção do filtro devolveu o foco ao campo. Pausa, volume a 43%, retomada e recuperação foram verificados com áudio real. Filtros salvos antes da candidata foram preservados. As versões anteriores não gravavam a origem do estilo salvo, então uma seleção antiga pode precisar ser removida uma vez.

## Sequências

Uma execução conta áudio direto quando o relógio avançou com a mídia em reprodução e volume acima de zero. Para embeds, o frame carregado e o avanço confirmado são observações separadas. Os cenários locais mantiveram a mídia real e usaram respostas controladas para APIs opcionais.

| Percurso | Chromium móvel | WebKit móvel |
| --- | ---: | ---: |
| Descobrir anônimo, três visitas | 15/15 prévias diretas | 15/15 prévias diretas |
| Groovado, cinco visitas | 25/25 | 25/25 |
| Full-On Night, com e sem 145–155 BPM | 10/10 | 10/10 |
| Recarga, descoberta aberta e Full-On Night com BPM | 10/10 | 10/10 |
| French House e Bleep Techno, cinco faixas de cada | 10/10 | 10/10 |

Cada visita da tabela entregou cinco gravações de cinco créditos distintos. Na comparação intercalada com a prévia anterior de Groovado (`92d6774f`), com três visitas de cinco faixas por versão em cada motor, a média de gravações coincidentes por par caiu de 2,00 para 1,33 no Chromium e de 2,00 para 1,67 no WebKit. A mediana do primeiro áudio variou de 1,69 s para 1,56 s no Chromium e de 1,85 s para 2,00 s no WebKit. O tamanho da amostra e os sentidos opostos deixam o efeito sobre a latência inconclusivo.

No ensaio público de Full-On Night do dia, a primeira carta tocou e as quatro novas tentativas esgotaram a busca. Na candidata, as cinco cartas tocaram, com e sem filtro de BPM. A recarga com filtros manteve as quatro faixas vistas e entregou uma quinta inédita.

Em Batida, os dois motores mostraram cinco artistas em cinco cartas. Ensaios separados confirmaram avanço de áudio no SoundCloud e no Bandcamp para as gravações verificadas. No Bandcamp, a reprodução começou após o toque no controle do próprio widget, conforme indicado na tela.

## Verificação

Também passaram os checks de ranking, histórico, recomendações sem repetição, segurança de estilo/BPM, isolamento do áudio e consistência do bundle. Os replays dos catálogos revisados cobriram 101 gravações de Batida, 105 de French House e 103 de Bleep Techno. As verificações com dados controlados passaram nas quatro combinações de Chromium e WebKit em celular e desktop para Biblioteca, persistência, replay de curtida, DJs/sets, Jornal e Perfil. O Jornal público foi verificado separadamente com artigos e feed reais.

A Vercel serviu o JavaScript, o CSS e os catálogos com conteúdo idêntico aos arquivos locais. O manifesto do catálogo e as duas rotas do Jornal responderam HTTP 200 com contexto de navegação. A verificação interativa usou o mesmo bundle servido localmente. O login de conta conectada usou fixture. Os perfis móveis foram simulados em macOS. As verificações legadas de primeira experiência e de preparação/metadados das prévias semanais também falham na base anterior.

Para repetir o percurso, sirva os arquivos com `PORT=8846 node scripts/local-preview-server.mjs` e execute em outro terminal, com Playwright instalado, uma vez por motor. O parâmetro `SONIC_PLAYWRIGHT_MODULE` permite indicar a instalação local.

```sh
node scripts/measure-opening-browser.mjs chromium http://127.0.0.1:8846/ \
  'guest:3,calibrated:5,full_on_night:1,full_on_night_bpm:1,reload:1,full_on_night_reload:1,batida:1,french_house:1,bleep_techno:1'
```
