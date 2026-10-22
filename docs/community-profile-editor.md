# Perfil pessoal e privacidade — primeira etapa

Implementado localmente em 14/09/2026. Não publicado, não aplicado ao Supabase de produção.

## Entrega

- Editor na aba Perfil: nome, @usuário, bio de até 280 caracteres, foto e remoção da foto.
- Perfil privado por padrão. Publicação é opcional; foto, bio e estilos têm escolhas separadas.
- Prévia ao vivo usa texto, não HTML. O indicador de publicação reflete o estado salvo.
- Sem nova conta: usa a sessão online existente, com autenticação verificada pelo servidor.
- Mesmos módulos HTML/CSS/JS no site e no pacote Capacitor iPhone; português, inglês e espanhol.
- Salvar e descartar explícitos; não envia fotos durante a seleção. Falhas preservam o rascunho na tela.
- Trocar de conta ou sair limpa imediatamente o rascunho, a foto e os dados de outra sessão.
- A sincronização automática atualiza somente os sinais musicais; não reverte foto, bio, nome ou @usuário editados.

## Segurança

`/api/user-profile` é roteado pelo agregador de API existente, sem nova função Vercel.
GET próprio e POST exigem sessão Supabase verificada. Identidade vem da sessão; o corpo não escolhe outro usuário.
O POST aceita campos específicos, valida texto e limita edições pela conta verificada. Em produção usa Redis quando configurado; sem Redis usa um contador atômico no próprio Supabase, acessível somente ao backend. Não é necessário contratar outro serviço para os limites de edição de perfil; outras APIs continuam com seus requisitos existentes de armazenamento durável.
Fotos: entrada base64 limitada a 512 KiB após preparação no navegador; servidor decodifica JPEG/PNG/WebP, limita pixels, rejeita SVG/animações, orienta/recorta para 512×512 e recomprime JPEG sem metadados usando Sharp.
O bucket `sonic-profile-avatars` é privado. O navegador não tem leitura/escrita direta. URLs assinadas duram 60 segundos; o proprietário as renova quando a tela está visível.
Arquivos novos são removidos se a gravação do perfil falhar. Substituição/remoção tenta excluir o arquivo antigo depois da gravação. Uma rotina operacional de limpeza de órfãos e o atendimento de exclusão da conta continuam necessários antes do lançamento público da comunidade.
Uma foto já visualizada, copiada ou em cache não pode ser apagada retroativamente; o controle de visibilidade evita novas emissões e não revoga um link ainda válido por até 60 segundos.

## Banco

Aplicar **somente após testar em staging e conferir as políticas existentes**:

`supabase/migrations/20260914160000_community_profile_privacy.sql`

Depois, aplicar `supabase/migrations/20260914170000_profile_edit_budget.sql` para o limite persistente sem Redis. A tabela de contadores não é legível pelo navegador; a função só pode ser chamada pela chave de serviço. O dia é definido no banco (UTC), nunca pelo cliente. Os incrementos são atômicos, com padrão de 40 edições por conta por dia. Os contadores antigos da própria conta são limpos após 30 dias e a exclusão da conta remove seus contadores por cascade.

A inspeção prévia está em `supabase/profile-activation-preflight.sql`: somente leitura, sem nome, email, bio ou conteúdo de contas. Verificar colisões de @usuário e políticas/grants antes de alterar produção.

A migração é transacional e idempotente. Preserva os perfis, acrescenta campos com visibilidade false, remove acesso anônimo e impõe uma política RESTRICTIVE de proprietário mesmo se existir uma política pública antiga esquecida.
Um índice único sem distinção de maiúsculas evita @usuários ambíguos. Se existirem colisões antigas por capitalização, a migração falha e reverte integralmente: resolver os nomes com os titulares antes de ativar; não apagar ou renomear contas automaticamente.
O histórico automático `activity_feed` também se torna privado, e curtidas sincronizadas recebem a mesma barreira de proprietário para instalações antigas que as deixavam públicas. Isso não apaga ou oculta publicações explícitas da API de Comunidade; são recursos distintos.
`community_public_profiles` é uma projeção limitada, concedida apenas ao serviço do backend. Nenhum cliente recebe SELECT nesse view.
Consultas por @usuário exigem login, devolvem apenas identidade opt-in e nunca retornam ID privado, email, DNA, contagens ou caminho da foto.
Elas respeitam as listas de bloqueio existentes nos dois sentidos, sem informar se o perfil está privado, ausente ou bloqueado.
Comentários e publicações deixam de exibir URLs de avatar vindas de metadados do cliente ou snapshots antigos. A foto desta etapa aparece no editor/perfil; retratos nos comentários precisam da consulta de perfil verificado e visibilidade na próxima etapa. Nomes de publicações explícitas continuam visíveis.
Não aceitar uma implementação que apenas esconda campos na tela, deixando SELECT público na tabela original.

## Ativação e verificação

1. Instalar dependências com o lockfile atualizado (Sharp é necessário no backend).
2. Aplicar a migração em staging; inspecionar políticas/grants de `profiles`, `activity_feed`, `storage.objects` e o bucket privado.
3. Configurar `SONIC_SOCIAL_ENABLED`, `SUPABASE_URL`, `SUPABASE_ANON_KEY` e `SUPABASE_SERVICE_ROLE_KEY`. Manter a chave de serviço somente no servidor e `SONIC_REQUIRE_DURABLE_RATE_LIMITS=true`. Redis é opcional para esta rota após aplicar a migração do contador Supabase. `SONIC_PROFILE_EDIT_DAILY_LIMIT` tem padrão 40.
4. Rodar os testes de API e PostgreSQL, a verificação responsiva e a compilação iPhone.
5. Fazer teste ponta a ponta real com duas contas em staging: salvar/reabrir no site e no iPhone; imagem real; segunda conta vê só o que foi permitido; desativar visibilidade; expiração da foto; saída/troca de conta; sessão expirada.
6. Publicar o site e o backend juntos, depois distribuir pelo TestFlight. Não ativar a comunidade inteira antes dos testes de privacidade e da preparação operacional de moderação/denúncia/exclusão.

7. Rodar `node scripts/profile-readiness.mjs https://sonicsearch.app` para verificar sem gravações os campos novos, negação anônima, bucket privado, RPC persistente, provedores de login e publicação da rota/tela. O relatório não contém credenciais ou linhas de perfil e não substitui o teste ponta a ponta com duas contas.

Quando falta configuração ou migração, o editor informa que nada foi salvo/publicado. Não ativa Premium, Stripe ou mensagens privadas.

## Prévia sem backend

Em um servidor localhost, usar `?qa=1&lang=pt&screenshot=1&recommendation=0&tab=profile&profilePreview=1`.
Mostra aviso explícito de prévia local, sem autenticação real, envio de foto ou publicação. Mudanças ficam apenas na memória e desaparecem ao recarregar; não altera dados reais.

## Próximas etapas, fora desta entrega

- Perfil público navegável/diretório e seguir pessoas.
- Compartilhar descobertas com identidade verificada, não dados de autor escolhidos pelo cliente.
- Moderação de perfis e fotos, denúncia/bloqueio em todas as superfícies, contato de suporte e exclusão da conta com limpeza de fotos. O filtro textual existente não substitui operação de moderação.
- Mensagens privadas com pedido/aceite, tabelas de participantes, RLS por conversa e proteção contra abuso. Não usar o JSON do feed público para mensagens privadas.

## Referências técnicas verificadas

- [Supabase: RLS, grants e views](https://supabase.com/docs/guides/database/postgres/row-level-security)
- [Supabase: controle de acesso a Storage](https://supabase.com/docs/guides/storage/security/access-control)
- [Sharp: saída e remoção de metadados](https://sharp.pixelplumbing.com/api-output/)

## Verificação local

- API: sessão inválida, identidade forjada no corpo, perfil privado, campos públicos, imagem inválida/SVG, EXIF removido, falha de gravação com limpeza do novo arquivo, remoção, limite por conta e configuração durável obrigatória.
- PostgreSQL em memória: migração aplicada duas vezes; dados preservados; anonimato bloqueado; conta vê apenas suas linhas; outra conta não pode alterar/criar perfil; projeção pública limitada; bucket privado prevalece sobre política antiga permissiva.
- Navegador: estados visitante/conta, prévia opt-in sem afirmar publicação antes de salvar, bio tratada como texto, validação, falha sem perder rascunho, descarte, preparação/remoção de foto, três idiomas, 375 px/paisagem/desktop e texto ampliado; limpar imediatamente na troca/saída da conta. Autenticação e API desse teste são simuladas, não equivalem a teste real em staging.
- Resultado: verificação geral com 55 checagens passou e o aplicativo iPhone compilou em 14/09/2026. Os assets web foram recompilados, empacotados e copiados para iPhone. API, contador durável Supabase, PostgreSQL, superfícies de privacidade e UI do site/pacote iPhone foram verificados. O último reforço das políticas de proprietário foi testado novamente em PostgreSQL, inclusive removendo as permissões antigas para provar que a migração preserva o acesso próprio sem depender delas. Os módulos de perfil são idênticos nos três diretórios (fonte, www, pacote nativo).
- Prévia local verificada: criar/salvar no modo demonstrativo não faz chamadas à API de perfil, não publica nada e desaparece ao recarregar. Sem erros JavaScript nos testes de tela.

## Situação online verificada em 14/09/2026

- Sessão administrativa da Vercel renovada e projeto correto conferido.
- Supabase ligado ao projeto Sonic Search; Google e Apple habilitados.
- Campos novos, bucket privado, contador e editor/rota ainda ausentes online. Não liberar teste real até a ativação e a checagem das políticas.
- A checagem de leitura com `limit=0` não extrai dados de ninguém; HTTP 200 anônimo confirma a permissão de consulta, mas não prova sozinho que a RLS deixa visualizar linhas. A inspeção SQL é necessária.
- Publicação não foi promovida; Stripe/cobrança não foram alterados.
- A consulta administrativa SQL pelo CLI não respondeu e foi interrompida. Em seguida, o acesso ao Safari foi recuperado e a inspeção SQL somente leitura foi executada no projeto correto.
- Inspeção online: zero colisões de @usuário; os campos existentes são compatíveis, incluindo `favorite_styles` como `text[]`. Há 15 perfis, 110 atividades e 118 curtidas; nenhum nome, email, bio, foto ou conteúdo dessas linhas foi extraído.
- As políticas antigas `Profiles are public` e `Activity feed is public` são SELECT permissivo com `using (true)` para PUBLIC. Curtidas têm política de proprietário. As três tabelas têm RLS habilitada e permissão de SELECT anônimo; a política pública torna necessária a atualização de privacidade dos perfis/atividades. Não foi necessário ler dados pessoais para confirmar isso.
- O painel mostra produção, sem branches e sem backups disponíveis. O bucket privado e os novos objetos de perfil ainda não existem. Nenhuma migração foi aplicada e nenhuma versão foi publicada nesta inspeção. Antes de alterar produção, preparar ambiente separado, testar com duas contas e garantir recuperação do banco atual.
- O Safari solicitou autorização para downloads ao exportar metadados; a solicitação foi cancelada, preservando as permissões do navegador. A inspeção foi concluída pela própria tela com consultas curtas.
