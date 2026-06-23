# SONIC SEARCH

App web estiloso e funcional para curadoria de musica eletronica.

## O que ele faz

- tela inicial com logo + botao `Iniciar experiencia`
- foco em subgeneros eletronicos (psy, techno, house, dnb e derivados)
- pergunta contexto, energia, BPM e preferencia de vocal (todos opcionais)
- recebe lista de artistas que o usuario ja conhece
- gera recomendacao principal + artista novo para descoberta
- interface simplificada: ouvir com 2 botoes diretos (`Ouvir no Spotify` e `Ouvir no YouTube`)
- protecao anti-link errado: Spotify e aberto com busca estrita por faixa+artista; faixas nao verificadas ficam bloqueadas
- recomenda com filtros parciais (ex.: so BPM, so energia, so contexto)
- quando o usuario escolhe um estilo, o motor respeita esse estilo de forma estrita (sem cruzar opostos como dark psy x chill)
- inclui tambem os estilos `psycore` e `slambient`
- inclui tambem os subgeneros `FULL ON NIGHT` e `FULL ON MORNING`
- inclui sessao dedicada `Psy Comercial / Chacotas` (Skazi, Paranormal Attack, Sesto Sento, Mandragora, Claudinho Brasil e similares)
- tech house reforcado com mais nomes de referencia (Michael Bibi e artistas similares)
- exibe BPM com foco em valor unico da faixa (quando disponivel) para leitura mais precisa
- ao marcar `Nao, novidade para mim`, pergunta se gostou e dispara celebracao visual quando a resposta for positiva
- pacote de imagens inclui SVG + PNG para compartilhar com amigos
- sliders de prioridade por filtro (estilo, contexto, energia, BPM e vocal)
- salva automaticamente preferencias no navegador (retoma na proxima abertura)
- botao `Surpreender` para preset random inteligente e botao `Limpar filtros`
- evita repetir artistas conhecidos quando possivel
- toca preview automaticamente apos gerar recomendacao
- pergunta no proprio player: `Esta gostando do que esta escutando?` com resposta `Sim`/`Nao`
- ao clicar `Nao`, o app faz nova pesquisa automatica no mesmo perfil e troca faixa/artista
- algoritmo adaptativo aprende com likes/dislikes (estilo, artista e energia) para refinar proximas sugestoes
- algoritmo adaptativo + estatisticas de feedback agora persistem entre sessoes (nao zera ao recarregar)
- pergunta "ja conhecia este artista?" e, se sim, troca na hora por outro parecido e menos conhecido
- links clicaveis para Spotify e YouTube
- links clicaveis para Spotify, YouTube e SoundCloud
- mostra metadados da faixa: lancamento, duracao, key e referencia de catalogo/gravadora
- coleta feedback para ajustar o perfil
- mostra detalhes de artista e gravadora
- mostra redes sociais do artista (Instagram, TikTok, X e YouTube) na secao de detalhes
- ao curtir faixa/artista/descoberta, carrega proximos eventos com calendario e lista de datas
- busca eventos reais via backend Ticketmaster/Bandsintown com fallback local quando nao houver resposta
- amplia automaticamente o catalogo por subgenero usando seeds de artistas e enriquecimento opcional via backend
- recupera previews/metadados por rota server-side quando Deezer/iTunes forem habilitados apos revisao
- busca atingir no minimo 20 faixas e 20 artistas no estilo selecionado quando ha dados disponiveis
- faz warmup em background para tentar elevar cobertura de todos os subgeneros (20+ faixas/artistas por estilo quando as APIs retornam dados)
- tenta enriquecer faixa com preview e BPM real (quando a fonte fornece)
- pode usar IA via backend serverless da Vercel para leitura da faixa, bio honesta de artista e arte personalizada do Arquetipo Musical

## IA opcional

O app funciona sem IA, mas em deploy Vercel pode usar endpoints em `/api` para melhorar a experiencia sem expor chave no frontend.

Configure as variaveis de ambiente:

- `OPENAI_API_KEY`: chave da API no backend
- `OPENAI_TEXT_MODEL`: modelo de texto opcional, padrao `gpt-5-mini`
- `OPENAI_IMAGE_MODEL`: modelo de imagem opcional, padrao `gpt-image-1-mini`
- `SONIC_AI_IMAGE_ENABLED`: libera a rota de imagem por IA
- `SONIC_AI_IMAGE_REQUIRE_PREMIUM`: exige premium antes de gerar imagem
- `SONIC_AI_IMAGE_STORE_REQUIRED`: exige KV/Redis para garantir uma imagem IA por usuario em producao
- `KV_REST_API_URL` / `KV_REST_API_TOKEN`: armazenamento duravel para travas por usuario e limites diarios de API em producao
- `SONIC_AI_ALLOWED_ORIGINS` e `SONIC_MUSIC_ALLOWED_ORIGINS`: dominios autorizados a chamar as rotas serverless
- `SONIC_REQUIRE_DURABLE_RATE_LIMITS=true`: em producao, bloqueia rotas caras se KV/Upstash nao estiver configurado

Endpoints incluidos:

- `/api/track-insight`: gera leitura curta da faixa em JSON
- `/api/artist-bio`: refina a bio com base nos metadados e fontes conhecidas, com MusicBrainz no backend e Discogs em opt-in
- `/api/spirit-image`: gera arte personalizada para o Arquetipo Musical

## APIs de musica e eventos

As integracoes serverless ficam em `/api` para proteger chaves e controlar uso diario.

- `/api/integration-health`: mostra quais provedores estao configurados/ligados, limites diarios e cuidados de compliance ativos
- `/api/youtube-search`: busca videos usando YouTube Data API, escolhe melhor resultado por artista/faixa, evita playlist/set quando possivel e retorna fonte/atribuicao
- `/api/soundcloud-search`: busca faixas no SoundCloud com token server-side e retorna fonte/atribuicao
- `/api/track-metadata`: recupera previews e metadados por iTunes no backend, com detalhes de fonte/licenca; Deezer fica opt-in apos aceite dos termos
- `/api/cover-art`: recupera capas por MusicBrainz + Cover Art Archive no backend, com cache, User-Agent e limite diario
- `/api/artist-profile`: recupera origem, genero e resumo de artista por MusicBrainz/Wikipedia/iTunes no backend, com cache, limite, detalhes de fonte/licenca e atribuicao visivel
- `/api/lastfm-artist`: enriquecimento opt-in de tags, similares e top tracks por Last.fm com API key propria
- `/api/radio-browser`: busca radios publicas por estilo/tag no backend, sem chave, com cache e limite diario
- `catalog_enrichments` no Supabase: guarda enriquecimentos bons retornados por APIs server-side para reduzir dependencia de chamadas externas ao longo do tempo
- `/api/artist-bio`: gera bio curta por IA no backend, com fontes estruturadas; Discogs so e chamado quando `SONIC_DISCOGS_ENABLED=true` e ha token proprio
- `/api/ticketmaster-events`: agrega proximos eventos por artista via Ticketmaster e Bandsintown, com suporte a lote de artistas para auditoria
- `/api/news-feed`: busca RSS no backend com cache, User-Agent proprio, limite diario e fontes estruturadas; desativado por padrao

Variaveis principais:

- `SONIC_MUSIC_APIS_ENABLED`: fallback global legado; APIs sensiveis usam flags proprias e nao herdam esse valor
- `SONIC_YOUTUBE_ENABLED=true` + `YOUTUBE_API_KEY` ou `YOUTUBE_DATA_API_KEY`: liga YouTube Data API no backend
- `SONIC_SOUNDCLOUD_ENABLED=true` + `SOUNDCLOUD_CLIENT_ID` + `SOUNDCLOUD_CLIENT_SECRET`: liga SoundCloud API no backend
- `SONIC_ARTIST_EVENTS_ENABLED`: liga/desliga a rota `/api/ticketmaster-events` (por padrao ela responde tambem com eventos locais curados)
- `SONIC_TICKETMASTER_ENABLED` + `TICKETMASTER_CONSUMER_KEY` (ou `TICKETMASTER_API_KEY`): liga busca ao vivo de eventos no Ticketmaster. O `TICKETMASTER_CONSUMER_SECRET` pode ficar configurado no servidor, mas a Discovery API usa a consumer key como `apikey`.
- `SONIC_BANDSINTOWN_ENABLED=true` + `BANDSINTOWN_APP_ID`: mantem Bandsintown como reforco de cobertura de eventos somente com app ID proprio no backend
- `SONIC_TRACK_METADATA_ENABLED` + `SONIC_ITUNES_ENABLED`: recupera previews/metadados por rota server-side usando iTunes Search e exibe a fonte dos dados. `SONIC_DEEZER_ENABLED` permanece opt-in.
- `SONIC_COVER_ART_ENABLED`: recupera capas por MusicBrainz/Cover Art Archive no backend sem chave, usando `SONIC_REFERENCE_USER_AGENT`, `SONIC_COVER_ART_DAILY_LIMIT` e `SONIC_COVER_ART_CACHE_SECONDS`.
- `SONIC_ARTIST_PROFILE_ENABLED` + `SONIC_MUSICBRAINZ_ENABLED`, `SONIC_WIKIPEDIA_ENABLED` e/ou `SONIC_ITUNES_ENABLED`: recupera contexto de artista por rota server-side com User-Agent, rate limit e fontes exibidas.
- `SONIC_LASTFM_ENABLED=true` + `LASTFM_API_KEY`: liga tags/similares/top tracks por Last.fm. Sem chave, o health mostra `needs_credentials`.
- `SONIC_RADIO_BROWSER_ENABLED`: liga busca de radios publicas por estilo/tag sem chave, com `SONIC_RADIO_BROWSER_DAILY_LIMIT` e `SONIC_RADIO_BROWSER_CACHE_SECONDS`.
- `SONIC_CATALOG_EXTRA_ENABLED=true` + `SUPABASE_URL` + `SUPABASE_ANON_KEY`: liga leitura do catalogo proprio publicado em `catalog_artists` e `catalog_tracks`.
- `SONIC_CATALOG_ENRICHMENT_ENABLED=true` + `SUPABASE_SERVICE_ROLE_KEY`: permite que rotas server-side persistam respostas uteis em `catalog_enrichments`. Use somente em ambiente backend; nunca exponha service role no navegador.
- `SONIC_AI_TEXT_ENABLED=true` + `OPENAI_API_KEY`: liga leitura de faixa, traducao de noticias e bio curta por IA. `SONIC_DISCOGS_ENABLED=true` + `DISCOGS_USER_TOKEN` adiciona Discogs como enriquecimento backend quando houver token.
- `SONIC_AI_IMAGE_ENABLED=true` + `OPENAI_API_KEY`: liga a rota de imagem do arquetipo musical, com limite diario e trava por usuario.
- `SONIC_NEWS_FEED_ENABLED`: liga a rota server-side de noticias com cache, User-Agent e limite diario.
- `SONIC_NEWS_FEED_DAILY_LIMIT`: limita chamadas diarias por cliente; usa `KV_REST_API_URL`/`KV_REST_API_TOKEN` quando configurado, com fallback em memoria local.
- `SONIC_YOUTUBE_SEARCH_DAILY_LIMIT`, `SONIC_TICKETMASTER_EVENTS_DAILY_LIMIT`, `SONIC_SOUNDCLOUD_SEARCH_DAILY_LIMIT`: travas contra gasto/uso inesperado
- `SONIC_API_MAX_BODY_BYTES`: limite maximo do corpo das requisicoes POST para reduzir abuso de payload

## Importacao remota do catalogo

Para consolidar os CSVs/JSONs locais em um pacote importavel:

```bash
node scripts/generate-catalog-extra-bulk-import.mjs
```

Isso gera `supabase/seeds/catalog_extra_bulk_local_20260621.sql`, `reports/catalog_extra_bulk_local_20260621.json` e `reports/catalog_extra_bulk_local_20260621.rows.json`.

Para diagnosticar o Supabase remoto sem gravar:

```bash
node scripts/import-catalog-extra-remote.mjs --dry-run
```

Para importar de verdade, configure no ambiente backend/local uma destas credenciais administrativas:

- `DATABASE_URL` ou `POSTGRES_URL`, quando quiser aplicar o SQL via `psql`
- `SUPABASE_SERVICE_ROLE_KEY`, quando quiser importar via API REST do Supabase

Depois rode:

```bash
node scripts/import-catalog-extra-remote.mjs
```

Nunca exponha `SUPABASE_SERVICE_ROLE_KEY` no navegador, no `index.html` ou em variaveis `VITE_`. Ela deve existir apenas em ambiente backend/local seguro.

## Modo compliance

O app nasce em modo balanceado: iTunes Search pode rodar no cliente porque a Apple documenta uso em websites/JSONP; MusicBrainz/Wikipedia/Cover Art Archive ficam no backend para respeitar User-Agent, rate limit e atribuicao; Radio Browser fica backend-only por organizacao, cache e limite. SoundCloud, YouTube Data API, Bandsintown, Last.fm, Discogs, IA e memoria Supabase ficam prontos no backend, mas so ficam `active` quando as credenciais oficiais existem no ambiente da Vercel. Deezer segue pendente ate haver app/termos disponiveis. Para ligar qualquer fonte externa sensivel no navegador, ajuste `window.SONIC_SEARCH_COMPLIANCE_CONFIG` no `index.html` somente depois de confirmar termos, atribuicao, limite de uso e credenciais do provedor. O caminho recomendado e preferir rotas em `/api/*` com cache, rate limit e User-Agent, como `/api/track-metadata`, `/api/cover-art`, `/api/artist-profile`, `/api/radio-browser` e `/api/news-feed`.

O registro de decisoes por provedor fica em `docs/api-approvals.md`.

## Qualidade do catalogo

Antes de publicar qualquer mudanca de produto/copy/UI, rode:

```bash
node scripts/product-verify.mjs
```

Esse gate roda `node --check app.js`, confere a biblia de estilos, bloqueia frases proibidas em subgeneros criticos, testa invariantes de BPM/cache e avisa quando houver arquivo de UI alterado exigindo screenshots mobile/desktop.

Quando mexer em UI, use:

```bash
node scripts/product-verify.mjs --screenshots
```

Esse modo salva `reports/ui-desktop-latest.png` e `reports/ui-mobile-latest.png`.
Se quiser que falha de screenshot bloqueie o processo, rode com `--strict-screenshots`.

Antes de publicar mudancas grandes no catalogo, rode:

```bash
node scripts/quality-audit.mjs
```

O script verifica cobertura por subgenero, BPM fora da faixa, duplicatas, artistas sem origem/bandeira, links ausentes e possiveis placeholders. O relatorio atualizado fica em `reports/quality-audit-latest.md`.

Para aumentar o catalogo em lote, adicione novos arquivos CSV em `data/` e inclua o caminho em `EXTERNAL_DATASET_FILES` no `app.js`. O primeiro lote proprio esta em `data/artist_expansion_seeds_v1.csv` e usa as colunas `style`, `artist`, `country`, `city`, `artist_bio` e `source`.

O pacote `data/electronic_subgenre_expansion_v15_20260621.csv` aprofunda 81 subgeneros eletronicos novos com 1.183 faixas, 163 artistas e 1.127 previews tocaveis. O alvo conservador e manter ate 8 faixas por artista/subgenero quando ha previews confiaveis.

O pacote `data/catalog_playable_depth_v16_20260622.csv` adiciona 650 faixas tocaveis a artistas ja existentes no banco, usando somente top tracks com artista resolvido por nome exato e preview direto.

Para validar as rotas de API sem depender de rede real, rode:

```bash
node scripts/smoke-music-apis.mjs
```

Para auditar o dominio publicado depois do deploy/envs de producao, rode:

```bash
node scripts/check-api-activation.mjs https://sonicsearch.app
```

O health deve mostrar `active` para todos os provedores. `needs_credentials` significa que a rota esta pronta, mas falta uma chave no backend da Vercel.

Quando os problemas criticos estiverem zerados, use o modo estrito antes de commit/push:

```bash
node scripts/quality-audit.mjs --strict
```

## Subgeneros incluidos

O app tem 168 subgeneros selecionaveis no motor de curadoria.

- Psytrance / Trance: psytrance, forest psy, dark psy, twilight psy, dark experimental, psycore, psybreaks, psybient/psychill, freeform psy, full-on, full-on night, full-on morning, psy comercial/chacotas, progressive psy, slambient, hi-tech, dark progressive (PROG DARK / zenonesque), goa trance, uplifting trance, tech trance, hard trance, progressive trance, acid trance, balearic trance, dream trance, vocal trance
- Techno: techno, acid techno, hard techno, dub techno, hypnotic techno, raw techno, detroit techno, schranz, EBM / industrial body music, minimal techno, melodic techno, industrial techno, peak time techno, deep techno, ambient techno, bleep techno, tribal techno, hardgroove techno, broken techno, gabber
- EDM / Festival: EDM, progressive EDM, big room house, future house, slap house, tropical house, complextro, electronic dance-pop, eurodance, EDM trap, melodic dubstep, brostep, big room techno, mainstage techno
- House: house, deep house, tech house, progressive house, afro house, organic house, bass house, electro house, minimal/deep tech, jackin house, soulful house, disco house, garage house, chicago house, french/filter house, funky house, tribal house, latin house, piano house, melodic house, microhouse, ghetto house
- DnB/Bass/Club: drum and bass, liquid dnb, neurofunk, jump up, jungle, darkstep, techstep, hardstep, atmospheric jungle, ragga jungle, sambass, drumfunk, breakbeat, brazilian funk, uk garage, future garage, dubstep, chillstep, post-dubstep, drumstep, halftime bass, footwork/juke, trap, future bass, riddim, experimental bass, wave, hardwave, breakcore, nu skool breaks, florida breaks, bassline, UK bass, wonky, glitch hop, neurohop, jersey club, baltimore club, ballroom/vogue beats, kuduro eletronico, batida, singeli, shangaan electro, ghettotech
- Hard Dance: hardstyle, hardcore, frenchcore, speedcore, rawstyle, crossbreed, euphoric hardstyle, reverse bass, hard dance, UK hardcore, terrorcore, extratone, makina
- Outros: downtempo, ambient, chillout, trip hop, darkwave, coldwave, synthwave, witch house, idm, electro, dark ambient, space ambient, ambient house, ambient dub, lowercase, microsound, electroacoustic, musique concrete, berlin school, kosmische musik, italo disco, hi-NRG, retrowave, outrun, darksynth, minimal wave, futurepop, industrial dance, deconstructed club

## Como executar

Abra diretamente:

- `/Users/pedrofreire/Documents/New project/index.html`

Ou via servidor local:

```bash
python3 -m http.server 8080
```

Depois acesse `http://localhost:8080`.

Para testar o app completo com as rotas `/api/*` locais, use o preview Node:

```bash
node scripts/local-preview-server.mjs --port=8793
```

Para ligar Ticketmaster localmente, copie `.env.example` para `.env.local` e preencha `TICKETMASTER_CONSUMER_KEY` e `TICKETMASTER_CONSUMER_SECRET`. Nunca coloque essas credenciais no frontend.

Depois acesse `http://127.0.0.1:8793/?qa=1&surprise=1`. O parametro `qa=1` pula idioma/intro e entra direto em uma sessao de teste.
