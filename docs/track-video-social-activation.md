# Perfil, comentários e curtidas — web e iPhone

Preparação local em 04/11/2026. Esta entrega não aplica migrações remotas, não publica o site e não envia uma versão ao TestFlight.

## Experiência

- A aba Perfil mantém o editor existente: nome, @usuário, foto, bio e controles individuais de visibilidade. Perfil privado por padrão.
- O player de faixas tem **Comentários e curtidas**. O player do YouTube e os sets de DJ têm acesso à conversa do vídeo.
- A conversa abre em um painel com foco contido e fechamento por botão ou Escape, adaptado ao iPhone e desktop. Há um atalho para **Meu perfil**.
- Faixa, artista e vídeo têm conversas independentes. Vídeos usam a chave `youtube:VIDEO_ID`, igual para URLs curtas e completas, no site e no Capacitor.
- Curtir/descurtir a faixa ou vídeo persiste na conta. É uma curtida na comunidade Sonic, independente dos números do YouTube e da biblioteca privada de recomendações.
- Comentários incluem edição e remoção próprias, reações, denúncia e bloqueio. Leitura e escrita exigem uma sessão online verificada; visitantes recebem o convite para entrar com os provedores existentes.
- Falhas de envio preservam o rascunho. Respostas antigas não podem transferir comentários ou curtidas para outra conversa/conta. Ao sair, o rascunho e os dados da conta são limpos.
- Português, inglês e espanhol. Os mesmos HTML, CSS e JavaScript são empacotados para iPhone.

## Banco e API

Usa `/api/comments`, já roteado por `api/music.js`, sem adicionar função Vercel. POST com `action: "like-target"` aceita `targetType`, `targetKey` e `liked` booleano. A identidade vem da sessão verificada. O GET retorna `targetReaction: { likes, liked }` e os comentários visíveis.

Aplicar em ambiente de teste, na ordem do histórico existente:

1. Fundação original `20260619010700_sonic_search_core.sql` e as demais migrações já adotadas pelo ambiente.
2. `20260914160000_community_profile_privacy.sql` e `20260914170000_profile_edit_budget.sql` para perfil privado, fotos e limite de edição.
3. **`20261104000100_track_video_social.sql`**, que amplia os tipos de conversa, cria reações e curtidas de conteúdo, restringe acesso direto e instala as RPCs de agregação.

Não executar `supabase/deferred-migrations/20260627154500_social_comments_reactions.sql`. A nova migração é transacional e pode ser reaplicada. Preserva os comentários SQL existentes. A tabela `social_target_likes` é separada de `likes`, pois a sincronização antiga pode regravar a biblioteca privada.

Tabelas sociais e RPCs são acessíveis somente pelo backend com `service_role`. Políticas restritivas protegem contra grants/políticas permissivas antigas. Reações são únicas por conta e comentário; curtidas são únicas por conta e alvo. Repetir `liked: true` é idempotente. Contagens são agregadas no banco, sem truncar em mil votos ou retornar a lista de contas.

Nomes de comentários vêm do perfil salvo e só aparecem quando ele está público; perfis privados aparecem como “Sonic listener”. Fotos de metadados enviados pelo cliente não são publicadas. A identidade privada continua disponível ao backend para autoria, denúncia, bloqueio e moderação.

### Instalações que usavam comentários em Storage

O fallback anterior regravava um arquivo JSON inteiro a cada alteração, podendo perder comentários/reações simultâneos. Esta versão utiliza somente Postgres e informa erro se faltar o esquema. Não apaga arquivos existentes.

Antes de ativar numa instalação antiga, inventariar e exportar com acesso administrativo privado os objetos `sonic-social-comments/comments/v1/`. Se houver comentários ali, reconciliar IDs, autores, alvos, datas, exclusões e reações com o banco em staging antes do corte. Não expor o bucket nem copiar snapshots de nome/foto do cliente para perfis públicos. Pausar escritas durante o corte e manter o backup; não ativar enquanto houver histórico pendente de reconciliação. Denúncias e listas de bloqueio continuam no armazenamento privado já usado por `_ugc-safety.js`.

## Configuração de ativação

No servidor: `SONIC_SOCIAL_ENABLED=true`, `SONIC_SOCIAL_COMMENTS_ENABLED=true`, `SUPABASE_URL`, `SUPABASE_ANON_KEY` e `SUPABASE_SERVICE_ROLE_KEY`. A chave de serviço nunca vai para o cliente. Manter os limites duráveis de produção existentes, com KV/Redis para a rota de comentários. Google e Apple devem estar configurados no Supabase. O runtime iPhone já usa `disableSocialComments: false` e o callback `sonicsearch://auth/callback`.

Publicar backend e web compatíveis após a migração validada; depois distribuir o pacote iPhone. Sem essa ativação, o código local não torna os recursos disponíveis no aplicativo instalado ou no site publicado.

## Verificação

```sh
npm run test:user-profile
npm run test:track-video-social
npm run test:ugc-safety
npm run web:build
npm run verify:track-video-social
npm run verify:user-profile
npm run ios:copy
npm run verify:track-video-social -- --ios
npm run verify:user-profile -- --ios
```

Os testes de API e navegador usam autenticação/rede simuladas. O teste SQL executa PostgreSQL em memória (PGlite), inclusive permissões, isolamento, idempotência e exclusão em cascata. As verificações visuais geram imagens em `reports/social/`.

Antes da liberação: testar com duas contas reais em staging, uma no iPhone e outra no navegador; salvar/reabrir perfil; curtir/descurtir o mesmo vídeo; criar/editar/excluir comentários; denunciar/bloquear; encerrar sessão e confirmar isolamento. Conferir expiração de sessão/foto e atendimento operacional das denúncias. A compilação local não substitui esse teste com o backend e login reais.

## Resultado local em 04/11/2026

- API social, PostgreSQL social e de perfis, API de perfil e controles de privacidade passaram.
- Interface social e editor de perfil passaram no webapp e no bundle iPhone, com 375, 852 e 1440 px e três idiomas. Login e rede são simulados nessas verificações.
- Regressões de reprodução única, isolamento de recomendações por conta, descoberta, moderação e controles de consentimento passaram.
- O bundle `20261104social1ios1` foi gerado e copiado para `ios/App/App/public/`; o teste de integridade do pacote passou.
- Compilação Xcode para simulador iOS, Debug, sem assinatura: concluída. Não houve instalação em aparelho físico ou distribuição pelo TestFlight.
