# Expansão com escuta — etapa de teste

A tela `listening-preview.html` e a prévia local na aba Descobrir permitem
testar rock/metal, indie/post-punk, hip-hop/rap, trap, reggae/dub/ska, reggaeton,
forró, samba, clássica, R&B/soul/funk, pop e ambient. Não substituem a experiência pública
ainda focada em eletrônica. As reações da aba Descobrir ficam separadas do
histórico público, banco de produção e Premium.

## Fontes e limites

- Pesquisa pelo endpoint existente do Sonic que usa a YouTube Data API,
  com filtro de vídeos incorporáveis. Não usamos scraping de resultados.
- Conferência adicional de título, autor, canal e ID pelo oEmbed do YouTube.
- Aceitamos canais do artista/Topic ou gravadora identificada. Isso é evidência
  de identidade e fonte, não uma licença própria de streaming.
- O vídeo do YouTube e a referência Apple Music não são presumidos como a
  mesma gravação/master. O título do vídeo fica preservado em `providerTitle`.
- Nenhum áudio, capa ou thumbnail é copiado. Metadados expiram após 30 dias.
- A reprodução usa o player visível do provedor, seus controles e publicidade;
  não extraímos áudio, não oferecemos download nem reprodução em segundo plano.
- No iPhone usamos o plugin `YouTubePlayer` já existente. A compilação não
  comprova funcionamento num aparelho real: isso precisa de teste físico/TestFlight.
- Um link Apple Music externo não é anunciado como áudio tocável dentro do app.
- As categorias só aparecem na tela de teste avulsa com no mínimo três artistas,
  três vídeos e duas camadas editoriais. Isso não é profundidade para lançamento.
  A jornada local na aba Descobrir aceita uma amostra realmente reproduzida,
  com aviso de escassez; grupos sem nenhuma amostra ficam desabilitados.
- Há 209 fontes pesquisadas: 53 reproduziram em testes reais de navegador.
  As 156 que falharam ficam sem botão `Ouvir`; podem ser abertas fora do Sonic.
  Os doze estilos citados acima têm uma amostra reproduzida; jazz, folk,
  música brasileira genérica, latina genérica e global não têm reprodução
  confirmada neste lote (forró e samba têm grupos separados). Isso não prova
  cobertura ampla, nem reprodução em iPhone/Safari ou nos países de lançamento.
- Trap tem sete artistas e 12 músicas únicas com reprodução confirmada.
  Vídeos alternativos da mesma música não aumentam esse contador.
- `data/universal-listening-playback-checks.json` guarda os resultados reais.
  `Testar fonte` significa que ainda falta confirmação; não é uma promessa de áudio.
  A ordenação coloca fontes que reproduziram antes das bloqueadas, mantendo a
  personalização dentro de cada faixa de disponibilidade.

Fontes: [políticas do YouTube](https://developers.google.com/youtube/terms/developer-policies),
[requisitos do player](https://developers.google.com/youtube/terms/required-minimum-functionality),
[API de vídeos](https://developers.google.com/youtube/v3/docs/videos/list),
[catálogo da Deck para forró](https://deckdisc.com.br/discos/fundamental-forro/),
[vídeos oficiais de Bob Marley](https://www.bobmarley.com/videos/).

## Operação

```sh
pnpm catalog:universal:pilot --fetch --resolve-missing
pnpm catalog:universal:listening --fetch
# Uma etapa menor de expansão, equilibrada por estilo e camada editorial:
pnpm catalog:universal:listening --fetch --groups=rock,indie,rap,trap,reggae --max-requests=20
# Direciona a quota para descobertas em vez de pesquisar de novo só referências:
pnpm catalog:universal:listening --fetch --tiers=discovery --artists="McKinley Dixon,Pachyman,feeble little horse" --max-requests=6
# Pesquisa apenas fontes ausentes/sem correspondência, preservando o cache válido:
pnpm catalog:universal:listening --fetch --retry-missing
pnpm catalog:universal:listening
pnpm release:check
node scripts/local-preview-server.mjs
# Abrir /listening-preview.html; ?genre=samba seleciona o estilo.
# Jornada no app principal local: /?universalPreview=1&lang=pt
```

Cada execução tem teto de 30 pesquisas e para de gastar quota ao receber
erro de limite, chave ou serviço desligado. Pesquisas não encontradas ficam
no relatório; jamais são inventadas ou promovidas ao catálogo público.

## Para lançar no app principal

1. Ouvir e revisar cada vídeo, gênero, créditos e distinção entre versões.
2. Testar reprodução real em Safari/webapp e iPhone, nos países de lançamento.
3. Conferir os status atuais e as restrições regionais em `videos.list`;
   busca incorporável + oEmbed não comprovam todos os contextos de reprodução.
4. Ampliar diversidade e profundidade de cada gênero. Resolver lacunas do lote.
5. Importar as fontes revisadas com seed transacional e conferência de identidade.
6. Promover a jornada local na aba Descobrir para o onboarding, perfil e
   feedback sincronizados e Radar Diário em Preview. Não habilitar universos
   com catálogo vazio.
7. Publicar web e TestFlight apenas após aprovação dessa jornada completa.

Esta etapa não ativa cobrança e não transforma 262 definições em 262 catálogos.
