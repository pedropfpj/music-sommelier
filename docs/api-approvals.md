# Sonic Search API Approval Register

Registro simples para separar integracoes aprovadas, opt-in e pendentes. Atualize este arquivo sempre que um provedor mudar termos, exigir credencial nova ou for habilitado em producao.

## Status atual

| Provedor | Status | Uso no app | Caminho tecnico | Cuidados |
| --- | --- | --- | --- | --- |
| iTunes Search | Aprovado por padrao | previews, genero, metadados basicos | cliente + `/api/track-metadata` | API publica documentada para websites/JSONP; manter cache, limite e atribuicao visivel |
| MusicBrainz | Aprovado via backend | origem, area, ano, tags | `/api/artist-profile` | User-Agent proprio e intervalo minimo de 1s |
| Cover Art Archive | Aprovado via backend | capas de releases/faixas | `/api/cover-art` | usar MusicBrainz no backend com User-Agent/cache/limite; imagens seguem copyright dos titulares |
| Wikipedia/Wikimedia | Aprovado via backend | resumo factual curto | `/api/artist-profile` | User-Agent proprio, cache, atribuicao e trechos curtos |
| Radio Browser | Aprovado via backend | radios publicas por estilo/tag | `/api/radio-browser` | sem chave; manter cache, limite diario e atribuicao do diretorio |
| Last.fm | Opt-in com credencial | tags, similares, top tracks e bio curta | `/api/lastfm-artist` | usar API key propria no backend; manter desligado ate registrar chave e revisar termos |
| Deezer | Pendente | previews/BPM/capas/metadados extras | `/api/track-metadata` | criar app/aceitar termos quando Deezer voltar a aceitar novos apps |
| YouTube Data API | Opt-in com credencial | link/video embutivel de faixa | `/api/youtube-search` | usar chave propria, backend, filtro de qualidade e atribuicao visivel |
| SoundCloud API | Opt-in com credencial | busca underground, links e previews quando disponiveis | `/api/soundcloud-search` | usar OAuth client credentials no backend, token cache e atribuicao visivel |
| Ticketmaster | Opt-in com credencial | agenda de eventos | `/api/ticketmaster-events` | usar API key propria e limites |
| Bandsintown | Pendente/opt-in | reforco de agenda | `/api/ticketmaster-events` | exigir `BANDSINTOWN_APP_ID` proprio |
| RSS/news | Pendente/opt-in | noticias | `/api/news-feed` | backend-only, User-Agent proprio, cache, limite diario duravel quando KV existir e fontes estruturadas |
| QR externo | Desnecessario | nenhum | gerador local SVG | manter local por privacidade |

## Checklist antes de habilitar opt-in

1. Registrar conta/app oficial do projeto.
2. Registrar link dos termos aceitos e data.
3. Confirmar se ha limite de uso, cache minimo, atribuicao ou restricao de exibicao.
4. Manter chaves somente no backend.
5. Confirmar que `/api/integration-health` mostra o provedor correto.
6. Rodar:

```bash
node --check app.js
node scripts/product-verify.mjs
```

## Decisoes atuais

- Deezer continua desligado porque a pagina `My Apps` informou que a Deezer nao esta aceitando novas aplicacoes neste momento.
- MusicBrainz/Wikipedia continuam backend-only para respeitar User-Agent e rate limit.
- Cover Art Archive entra backend-only para recuperar capas sem expor chamadas diretas do navegador.
- Radio Browser entra backend-only como fonte gratuita de descoberta por estilo, sem tocar streams automaticamente.
- Last.fm fica opt-in ate o projeto ter `LASTFM_API_KEY` propria e decisao registrada.
- iTunes Search pode ficar client-side por ser documentado para uso em websites, mas o backend tambem cobre previews/metadados com `sourceDetails` e atribuicao.
