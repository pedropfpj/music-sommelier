# Sonic Search - OpenAI com limite de custo

Este app nunca deve colocar `OPENAI_API_KEY` no `index.html` ou no `app.js`.
A chave fica somente no backend da Vercel, nas variáveis de ambiente do projeto.

## Variáveis principais

- `OPENAI_API_KEY`: chave da OpenAI. Obrigatória para qualquer chamada real.
- `OPENAI_TEXT_MODEL`: modelo de texto. Sugestão inicial: um modelo mini/barato.
- `OPENAI_IMAGE_MODEL`: modelo de imagem. Use somente quando o premium estiver pronto.
- `OPENAI_IMAGE_QUALITY`: qualidade da imagem. Para testes, use `medium`.
- `SONIC_AI_TEXT_ENABLED`: `true` para liberar textos por IA.
- `SONIC_AI_IMAGE_ENABLED`: `true` para liberar imagem por IA. Deixe `false` até testar premium.
- `SONIC_AI_TRACK_DAILY_LIMIT`: limite diário leve para `/api/track-insight`.
- `SONIC_AI_BIO_DAILY_LIMIT`: limite diário leve para `/api/artist-bio`.
- `SONIC_AI_NEWS_DAILY_LIMIT`: limite diário leve para `/api/news-translate`.
- `SONIC_AI_IMAGE_DAILY_LIMIT`: limite diário leve para `/api/spirit-image`.
- `SONIC_AI_IMAGE_REQUIRE_PREMIUM`: `true` para exigir premium antes de gerar imagem. Mantenha `true` em produção.
- `SONIC_AI_IMAGE_STORE_REQUIRED`: `true` para exigir banco/Redis antes de gerar imagem. Use em produção para garantir uma imagem IA por usuário.
- `SONIC_AI_ALLOWED_ORIGINS`: domínios permitidos, separados por vírgula. Exemplo: `https://music-sommelier1.vercel.app`.
- `SONIC_AI_TEXT_MAX_OUTPUT_TOKENS`: teto de resposta de texto. Sugestão inicial: `650`.
- `KV_REST_API_URL` e `KV_REST_API_TOKEN`: armazenamento durável da Vercel KV/Upstash para travar uma imagem IA por usuário.
- `UPSTASH_REDIS_REST_URL` e `UPSTASH_REDIS_REST_TOKEN`: alternativa equivalente se usar Upstash direto.

## Configuração do front

No `index.html`, `window.SONIC_SEARCH_AI_CONFIG` controla o comportamento do app:

- `textEnabled: true`: permite textos por IA quando a rota existe.
- `dailyTextLimit: 10`: evita várias chamadas por usuário no mesmo dia.
- `imageEnabled: false`: imagem IA fica desligada no front por padrão.
- `premiumUnlocked: false`: imagem IA só deve ligar para usuário premium.
- `imageLimitPerProfile: 1`: uma imagem IA por perfil.
- `allowImageRegeneration: false`: impede gastar outra imagem ao clicar em variação.

## Ordem segura para testar

1. Ligue apenas texto:
   - `SONIC_AI_TEXT_ENABLED=true`
   - `SONIC_AI_IMAGE_ENABLED=false`
   - Defina `OPENAI_API_KEY` e `OPENAI_TEXT_MODEL`.

2. Teste bios e leitura da faixa:
   - O app usa cache local para não repetir chamada da mesma faixa.
   - Se a API falhar, o texto local continua funcionando.

3. Só depois teste imagem:
   - Defina `SONIC_AI_IMAGE_ENABLED=true`.
   - Defina `SONIC_AI_IMAGE_DAILY_LIMIT=1` ou `3` durante testes.
   - Configure `KV_REST_API_URL` e `KV_REST_API_TOKEN` se quiser garantir a trava mesmo após redeploy.
   - No front, libere `imageEnabled` e `premiumUnlocked` apenas em ambiente controlado.
   - Mantenha `imageLimitPerProfile: 1`.

4. Antes de liberar premium real:
   - Implementar login/banco/subscription no servidor.
   - Validar premium no backend, não só no navegador.
   - Definir `SONIC_AI_IMAGE_STORE_REQUIRED=true`.
   - Definir `SONIC_AI_IMAGE_REQUIRE_PREMIUM=true`.
   - Configurar orçamento mensal no painel da OpenAI.

## Como funciona a imagem unica por usuario

A rota `/api/spirit-image` usa a assinatura do perfil (`userSignature`) para criar uma chave anonima no servidor.
Quando o usuario gera a primeira arte IA, o app salva um recibo dessa imagem. Nas proximas chamadas do mesmo perfil, a rota devolve a imagem ja criada e nao chama a OpenAI de novo.

Para teste local ou preview, sem KV configurado, a trava fica em memoria e ajuda durante a mesma execucao da funcao. Para lancamento, use KV/Upstash ou um banco real, porque serverless pode reiniciar e perder memoria.

Nunca coloque `OPENAI_API_KEY`, `KV_REST_API_TOKEN` ou qualquer segredo no `app.js`, `index.html` ou app mobile.
