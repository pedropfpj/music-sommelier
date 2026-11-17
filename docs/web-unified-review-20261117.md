# Sonic Search Web — candidata única de 17/11/2026

A versão para avaliação é `20261117unified1`, código `28315b2b`, branch `codex/web-unified-review-20261117`. A prévia exige autenticação da Vercel e está em https://music-sommelier1-pbuhnedx0-cbklabs.vercel.app/.

Este pacote reúne a descoberta contínua e as correções editoriais do Jornal. O player e a recuperação ficam na área de escuta, a busca atende os 169 subgêneros, a Biblioteca e o link mantêm a edição da gravação, o histórico anônimo acompanha recarga e outras abas e as reações orientam a próxima escolha. Foram preservados os catálogos revisados de Batida, French House e Bleep Techno. A revisão do Jornal omite datas de evento ausentes ou inválidas e conserva a data de publicação e os links.

A rodada corrigiu também o estado do descarte. A interface indica preparação enquanto procura a substituta. O aquecimento automático do catálogo preserva a mensagem resultante da ação. O detector de títulos deixou de tratar o nome do remixer PsychoSocial como um marcador genérico de psytrance. Os testes mantêm a rejeição de títulos genéricos e a validação exata da edição.

As trinta candidatas de Full-On Night foram revalidadas. Vinte e nove edições Apple foram encontradas no lookup oficial e tocaram em Chromium. Vinte e oito entraram na fonte persistente do compilador e nas provas exatas do app, com BPM editorial entre 146 e 154. Drip Drop permaneceu pendente porque a evidência anterior de Full-On Night apontava para outro artista. Axiomod permaneceu pendente porque o widget respondeu, mas seu avanço de áudio não foi confirmado. A lista individual e as fontes estão em [full-on-night-revalidation-20261117.md](full-on-night-revalidation-20261117.md).

O teste de integração comprova que as 28 gravações e 28 créditos de artista chegam ao filtro normal de Full-On Night entre 145 e 155 BPM. Também rejeita a alteração do BPM da edição e a classificação dessa prova em Dark Psy. O build regenerou o shard, o núcleo e o manifesto a partir do CSV revisado. A entrada não depende de ativar o piloto opcional de hospedagem de trechos.

| Percurso no pacote final | Resultado |
| --- | --- |
| Full-On Night, Chromium móvel, vinte ações com recarga após a quarta | 20 gravações, 20 artistas, 20 áudios diretos, zero repetição, todos entre 145 e 155 BPM |
| Full-On Night, WebKit móvel, primeira repetição no pacote final | 20 gravações e artistas, 19 áudios diretos dentro do prazo, zero repetição e filtro preservado |
| Full-On Night, WebKit móvel, nova sequência no mesmo pacote | 20 gravações, 20 artistas, 20 áudios diretos, zero repetição, todos entre 145 e 155 BPM |
| Jornada de escuta, reação, Biblioteca, recarga, replay, link, busca, filtros e navegação | 13 verificações passaram em cada uma das três combinações Chromium móvel, WebKit móvel e Chromium desktop, com zero exceção JavaScript |
| Gravação exata, link com atraso de 2,5 s, históricos legados e sincronização simulada | Passaram em Chromium e WebKit, móvel e desktop |
| Cancelamento ao navegar, recuperação após nova falha, busca e teclado | Seis cenários passaram entre Chromium desktop e WebKit móvel |
| Jornal, capa, leitor, links, datas ausentes e eventos válidos | Passou em Chromium desktop e WebKit móvel |
| Regressões focadas | 25 scripts passaram, mais o novo teste de Full-On Night |
| Catálogos revisados preservados | Replay de 101 gravações Batida, 105 French House e 103 Bleep Techno passou |
| Verificação do produto e capturas | `product-verify.mjs --screenshots --strict-screenshots` passou |

A ocorrência de WebKit foi Spookyhertz — Computer Musik. A carta apareceu, mas a mídia continuou em “Iniciando prévia…” após cerca de 7,2 s. A mesma gravação tocou em teste isolado pelo controle nativo, com progresso confirmado em cerca de 2 s e respostas HTTP 206. A nova sequência de vinte também passou. A causa da ocorrência intermitente não foi isolada. Os resultados preservam tanto a falha quanto a repetição e não demonstram ausência de falhas em todas as redes.

O hash SHA-256 do `app.min.js` final é `03f916a4316d26f44db304754b02310e147b4c7b167fccfa8d841331587726c7`. As sequências de vinte no pacote final mantiveram esse hash antes e depois. A edição exata em WebKit móvel e a busca pelo teclado em Chromium desktop foram repetidas nesse mesmo pacote após a integração dos dados. O percurso de três perfis também usou esse pacote. Os três fixtures reparados receberam dependências do app atual sem reduzir as asserções.

A implantação `dpl_4331UupWek4ZXPSD6UDpuDEydmhr` concluiu em ambiente de prévia. O acesso sem sessão respondeu HTTP 302 para autenticação. JavaScript, CSS, carregador de catálogo, manifesto e shard Full-On Night hospedados coincidiram por SHA-256 com os arquivos testados. No endereço hospedado, Chromium móvel confirmou áudio de Losing It, de FISHER, e depois Talking Trees, de Pzyshow, com filtro Full-On Night e 154 BPM. Esse smoke usou as respostas reais das APIs de leitura da prévia e registrou zero exceção JavaScript. As requisições POST ficaram interceptadas no navegador descartável do teste. O acesso de automação usou a configuração de proteção existente.

A mídia das sequências veio dos provedores reais. Os testes locais controlaram APIs opcionais, e a jornada do Jornal usou o feed público. A conta e a sincronização foram simuladas. Os perfis móveis rodaram em macOS. Login real e iPhone físico continuam fora desta validação. Os BPMs foram corroborados nas fontes editoriais e de lançamento, sem nova análise acústica dos arquivos.

Os registros completos desta execução estão em `.vercel/unified-qa/`, no diretório local de avaliação. As capturas e o resultado da jornada estão em `/Users/pedrofreire/.codex/visualizations/2026/11/17/01a1ea4f-6285-7760-9707-6b7d2ad9f125/sonic-unified/`. Os arquivos de teste contêm apenas gravações públicas, contagens e tempos. Credenciais e acesso à prévia ficaram fora dos relatórios.

Para repetir a verificação de dados e as regressões principais com Node e Playwright disponíveis no ambiente, use os comandos abaixo. O simulador registra os resultados de áudio por ação. Para a meta de vinte, confirme `cards`, `distinctArtists` e `directAudio` iguais a 20 e `repeatedRecordings`, `repeatedArtists` e `wrongFilter` iguais a zero.

```sh
node scripts/test-full-on-night-revalidated.mjs
node scripts/test-swipe-learning.mjs
node scripts/test-reviewed-style-catalog.mjs
node scripts/test-newsroom-event-ui.mjs
node scripts/verify-recording-continuity-ui.mjs webkit mobile
node scripts/product-verify.mjs --screenshots --strict-screenshots
```

Com `node scripts/local-preview-server.mjs --port=8876` em outro terminal, execute uma vez por motor.

```sh
SONIC_BROWSER_SEQUENCE_LENGTH=20 SONIC_BROWSER_FILTERED_FEEDBACK=1 \
SONIC_BROWSER_REQUIRE_NO_REPEAT=1 SONIC_BROWSER_AUDIO_LIMIT=6500 \
  node scripts/measure-opening-browser.mjs webkit http://127.0.0.1:8876/ full_on_night_reload:1
```
