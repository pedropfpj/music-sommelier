# Sonic Search API Compliance Setup

Este projeto usa um modo balanceado por padrao: APIs publicas sem segredo e com uso documentado ficam ligadas com cache/limites; integracoes com credencial ficam prontas no backend e aparecem como `needs_credentials` ate receberem chaves oficiais.

O registro vivo de decisoes fica em `docs/api-approvals.md`.

## Padrao atual

- Bandsintown nao e chamado pelo frontend. Use apenas `/api/ticketmaster-events` com `BANDSINTOWN_APP_ID` oficial.
- QRServer nao e chamado por padrao. O app gera QR local em SVG; se o payload for grande demais, mostra o copia-e-cola.
- iTunes Search pode rodar no navegador e por `/api/track-metadata`, porque a Apple documenta uso em websites/JSONP.
- `/api/track-metadata` retorna detalhes estruturados de fonte/licenca em `best.sourceDetails`, `candidates[].sourceDetails` e `attribution`.
- Deezer no navegador fica bloqueado por `window.SONIC_SEARCH_COMPLIANCE_CONFIG`; pode voltar por `/api/track-metadata` somente apos aceite dos termos.
- `/api/cover-art` usa MusicBrainz + Cover Art Archive apenas no backend, com User-Agent, intervalo minimo, cache, limite diario e aviso de que imagens continuam com copyright dos titulares.
- MusicBrainz/Wikipedia no navegador ficam bloqueados; use `/api/artist-profile` para origem/genero/resumo com User-Agent, rate limit e fontes visiveis.
- `/api/artist-profile` retorna detalhes estruturados de fonte/licenca em `profile.sourceDetails` e `attribution`.
- `/api/lastfm-artist` fica pronto no backend; sem `LASTFM_API_KEY` propria, o health mostra `needs_credentials`.
- `/api/radio-browser` busca diretorio publico de radios por estilo/tag via backend, sem chave, com cache, limite diario e atribuicao.
- `/api/artist-bio` usa OpenAI no backend e pode enriquecer com MusicBrainz; Discogs so chama a API quando `DISCOGS_USER_TOKEN` existir.
- `/api/artist-bio` retorna `sources`, `sourceDetails` e `attribution`, e o estado completo aparece em `/api/integration-health`.
- `/api/youtube-search` e `/api/soundcloud-search` usam credenciais somente no backend e retornam `sourceDetails`/`attribution` por resultado.
- Noticias ao vivo usam `/api/news-feed`; proxies publicos ficam bloqueados por padrao. A rota usa backend, User-Agent, cache, limite diario e fontes estruturadas.

## Para habilitar uma API sensivel

Antes de ativar Deezer, Bandsintown, RSS direto/proxies ou chamadas diretas MusicBrainz/Wikipedia no cliente, registre:

1. conta/app/chave oficial do provedor;
2. link dos termos aceitos;
3. limite de uso e cache minimo;
4. requisitos de atribuicao/link/privacidade;
5. variaveis de ambiente usadas em Vercel/local.

Depois habilite a flag correspondente e rode:

```bash
node --check app.js
node scripts/product-verify.mjs
```

## Flags principais

Padrao recomendado:

- `SONIC_TRACK_METADATA_ENABLED=true`
- `SONIC_ITUNES_ENABLED=true`
- `SONIC_COVER_ART_ENABLED=true`
- `SONIC_COVER_ART_DAILY_LIMIT=100`
- `SONIC_COVER_ART_CACHE_SECONDS=86400`
- `SONIC_ARTIST_PROFILE_ENABLED=true`
- `SONIC_MUSICBRAINZ_ENABLED=true`
- `SONIC_WIKIPEDIA_ENABLED=true`
- `SONIC_ARTIST_BIO_ENABLED=true`
- `SONIC_AI_TEXT_ENABLED=true`
- `SONIC_AI_BIO_DAILY_LIMIT=18`
- `SONIC_AI_TRACK_DAILY_LIMIT=24`
- `SONIC_AI_NEWS_DAILY_LIMIT=24`
- `SONIC_AI_IMAGE_ENABLED=true`
- `SONIC_AI_IMAGE_DAILY_LIMIT=25`
- `SONIC_AI_IMAGE_REQUIRE_PREMIUM=true`
- `SONIC_AI_IMAGE_STORE_REQUIRED=true`
- `SONIC_AI_IMAGE_ALLOW_BETA_REGENERATION=false`
- `SONIC_AI_IMAGE_MAX_PER_USER=1`
- `SONIC_ARTIST_BIO_REFERENCE_CACHE_SECONDS=86400`
- `SONIC_REFERENCE_USER_AGENT=SonicSearch/1.0 (+https://sonicsearch.app)`
- `SONIC_RADIO_BROWSER_ENABLED=true`
- `SONIC_RADIO_BROWSER_DAILY_LIMIT=120`
- `SONIC_RADIO_BROWSER_CACHE_SECONDS=21600`
- `window.SONIC_SEARCH_COMPLIANCE_CONFIG.clientMusicCatalogApisEnabled=true`
- `window.SONIC_SEARCH_COMPLIANCE_CONFIG.clientItunesEnabled=true`

Ativacao completa com credenciais oficiais:

- `SONIC_YOUTUBE_ENABLED=true` + `YOUTUBE_API_KEY=...`
- `SONIC_SOUNDCLOUD_ENABLED=true` + `SOUNDCLOUD_CLIENT_ID=...` + `SOUNDCLOUD_CLIENT_SECRET=...`
- `SONIC_BANDSINTOWN_ENABLED=true` + `BANDSINTOWN_APP_ID=...`
- `SONIC_DEEZER_ENABLED=true` somente depois de termos/app oficial
- `SONIC_LASTFM_ENABLED=true` + `LASTFM_API_KEY=...`
- `SONIC_DISCOGS_ENABLED=true` + `DISCOGS_USER_TOKEN=...`
- `SONIC_NEWS_FEED_ENABLED=true`
- `SONIC_NEWS_FEED_ROUTE_ENABLED=true`
- `SONIC_NEWS_USER_AGENT=SonicSearch/1.0 (+https://sonicsearch.app)`
- `SONIC_NEWS_FEED_DAILY_LIMIT=80`
- `KV_REST_API_URL=...` + `KV_REST_API_TOKEN=...` para limites duraveis em producao
- `SONIC_REQUIRE_DURABLE_RATE_LIMITS=true`
- `SONIC_AI_ALLOWED_ORIGINS=https://sonicsearch.app,https://www.sonicsearch.app`
- `SONIC_MUSIC_ALLOWED_ORIGINS=https://sonicsearch.app,https://www.sonicsearch.app`
- `window.SONIC_SEARCH_COMPLIANCE_CONFIG.clientDeezerEnabled=true`
- `window.SONIC_SEARCH_COMPLIANCE_CONFIG.clientArtistReferenceApisEnabled=true`
- `window.SONIC_SEARCH_COMPLIANCE_CONFIG.directNewsFetchEnabled=true`

Prefira rotas backend para Deezer/MusicBrainz/Wikipedia antes de religar chamadas diretas do cliente. iTunes Search e a excecao de baixo risco documentada para client-side.

## Recuperacao de qualidade por partes

1. Mantenha `/api/track-metadata` ligado com iTunes Search. Isso recupera previews, data de lancamento, duracao, genero, referencias de catalogo e fonte visivel sem credencial.
2. Mantenha `/api/cover-art` ligado. Isso recupera capas quando iTunes/catalogo local nao tiver imagem, sem chave e sem chamada direta do navegador.
3. Mantenha `/api/artist-profile` ligado com `SONIC_MUSICBRAINZ_ENABLED` e `SONIC_WIKIPEDIA_ENABLED`, usando `SONIC_REFERENCE_USER_AGENT`, cache e limite diario. Isso recupera origem, genero e resumo factual de artista.
4. Use `/api/radio-browser` como proxima camada de descoberta ao vivo por estilo, sem misturar stream externo ao player principal ate validar UX e atribuicao.
5. Mantenha `window.SONIC_SEARCH_COMPLIANCE_CONFIG.clientArtistReferenceApisEnabled=false` enquanto o backend cobrir a necessidade. O cliente direto deve ser excecao, nao caminho padrao.
