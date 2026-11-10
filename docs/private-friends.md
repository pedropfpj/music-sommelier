# Amigos e faixas compartilhadas

Implementação separada de seguidores públicos, comentários, curtidas e histórico. A rota fica desativada por padrão (`SONIC_FRIENDS_ENABLED=false`) até aplicar e revisar a migração aditiva `20261110000100_private_friendships.sql` em staging. A configuração não publica perfis nem fotos.

## Identidade e acesso

Todas as operações exigem o usuário UUID verificado pelo Supabase Auth no servidor. O corpo nunca escolhe o autor. `settings` salva um nome explícito para pedidos/amigos; o @ deve ser o identificador atual do próprio perfil ou vazio. O backend não usa nome/foto OAuth, email, foto privada, DNA ou histórico como identidade de amigos. O GET próprio pode sugerir campos do perfil já salvo para a pessoa revisar antes de consentir. As respostas não contêm fotos.

A busca encontra somente perfis com `profile_public=true` e `profile_link_public=true`. Aceitar uma amizade não altera esses campos nem as preferências de foto/bio/estilos. Um perfil privado continua fora da busca. Convites permitem apresentar apenas a identidade mínima que o dono escolheu explicitamente para amigos. Abrir o convite não cria relacionamento. O token vai no corpo de POST, não na query da API.

Uma relação canônica por par guarda quem enviou o pedido. Pedidos cruzados continuam pendentes até aceitação explícita. Publicações exigem amizade atualmente aceita para leitura; seguidores e pedidos pendentes não dão acesso. Remover ou bloquear revoga imediatamente a leitura posterior de publicações antigas. O autor também pode apagar cada publicação.

## Contrato da API

As respostas têm `ok:true` ou `{ok:false,error:"codigo"}`. `person` significa `{id,displayName,username,avatarUrl:""}`.

| Operação | Entrada | Resposta além de `ok` |
| --- | --- | --- |
| GET `action=overview` | — | `me:{enabled,identity:person}`, `friends:[person + relationshipId]`, `incoming/outgoing:[{id,person,createdAt}]`, `invites:[{id,createdAt,expiresAt}]` |
| GET `action=search&q=...` | pelo menos 2 caracteres; até 20 resultados | `people:[person + relationship + relationshipId?]` |
| GET `action=feed` | — | `posts:[post]`, até 40 mais recentes |
| GET `action=post&postId=...` | UUID da publicação | `post`, usando exatamente a mesma autorização do feed |
| POST `settings` | `displayName`, `username` ou `""` | `me:{enabled:true,identity:person}` |
| POST `request` | `userId`, `clientRequestId` UUID, `inviteToken?` | `relationship`, `relationshipId?` |
| POST `cancel` | `userId`, `relationshipId` | `relationship`, `relationshipId?` |
| POST `respond` | `userId`, `relationshipId`, `decision:"accept"/"decline"` | `relationship`, `relationshipId?` |
| POST `remove` | `userId`, `relationshipId` | `relationship`, `relationshipId?` |
| POST `create-invite` | `clientRequestId` UUID | `invite:{id,token,createdAt,expiresAt}` |
| POST `invite-preview` | `token` | `person`, `relationship`, `relationshipId?` |
| POST `revoke-invite` | `inviteId` | — |
| POST `share-track` | `clientRequestId` UUID, `track`, `text?` até 280 caracteres | `post` |
| POST `delete-post` | `postId` | — |
| POST `report` | `postId`, `reason?` | —; só quem pode ler a publicação pode enviar o relato privado |

O corpo de POST contém também `action`. `relationship` é `none`, `incoming`, `outgoing` ou `accepted`.

`post` é `{id,author:person,track,text,createdAt,mine,audience:"friends"}`. `track` aceita somente `{artist,title,style,url?,catalogId?}`; `song` pode ser usado na entrada como alternativa a `title`. Estilo deve existir no manifesto; artista/título têm limites de 160/220 caracteres. URLs devem ser links estáveis HTTPS de gravação (Deezer, Spotify, YouTube, SoundCloud, Bandcamp, Apple Music) ou compartilhamento Sonic. URLs de áudio assinadas, credenciais, hosts arbitrários e parâmetros de contexto são rejeitados. Campos extras, fotos e dados pessoais no DTO são descartados. Não há busca de provedor nem gravação de histórico/curtidas ao compartilhar.

Erros: 401 `login_required`; 400 `invalid_action`, `invalid_settings`, `invalid_track`, `invalid_request_id`; 403 `friends_identity_required`; 404 `person_not_found`, `invite_not_found`, `relationship_not_found`, `post_not_found`; 409 `request_conflict`, `relationship_changed`; 429 `friends_limit_reached` ou `daily_music_api_limit_reached`; 503 `friends_setup_required` ou `friends_unavailable`. Dados indisponíveis/bloqueados usam os mesmos erros de ausência. A interface deve recarregar overview/feed após uma mutação e preservar o rascunho em falhas.

## Banco e concorrência

As tabelas `friend_settings`, `friend_edges`, `friend_invites`, `friend_posts`, `friend_operations`, `friend_block_states` e `friend_request_usage` são acessíveis somente ao serviço do backend. Não há grants nem execução de RPC para `anon`/`authenticated`; políticas restritivas continuam negando acesso mesmo diante de uma política permissiva esquecida. As funções têm `search_path` fixo e rodam com os direitos do chamador de serviço, sem ampliar acesso do navegador. O limite diário de amigos usa contador próprio e não consome a franquia existente de comentários.

Mutações usam locks transacionais por conta/par. Repetir o mesmo pedido ou publicação não duplica itens; reutilizar um ID com conteúdo diferente é conflito. IDs de relacionamento impedem que uma resposta/remoção atrasada altere um relacionamento novo. Publicações apagadas mantêm uma marca para que um retry antigo não as ressuscite.

O MVP limita cada conta a 100 amizades aceitas, 40 pedidos enviados pendentes, 50 recebidos pendentes e cinco convites ativos. Esses limites e o contador diário independente evitam consultas e filas sem limite; não alteram as curtidas ou recomendações existentes.

Os convites expiram em sete dias e têm revogação individual. O token é pseudorrandômico HMAC-SHA256 com separação de domínio/usuário/request-id e a chave de serviço existente, permitindo repetir a mesma solicitação sem armazenar o token em claro; somente o hash é persistido. Trocar a chave de serviço não invalida links já entregues, mas uma repetição antiga poderá exigir um novo request-id.

Bloqueios existentes continuam nos arquivos privados de moderação. A API de amigos lê os dois lados, falha sem devolver feed se o armazenamento não responder, e sincroniza um espelho versionado no banco antes de consultar novamente o acesso. O setter existente revoga relações no banco antes de confirmar um bloqueio. Leituras antigas não substituem versões novas; colisões de versão unem bloqueios e falham de forma conservadora. Desbloquear nunca recria amizade. Convites/search/feed/overview respeitam ambos os lados.

Os relatos de publicações vão apenas ao bucket privado de moderação, com IDs e texto limitado, depois de verificar o acesso atual. Não enviam email/push nem criam comentário público.

## Verificação

`node scripts/test-friends-integration.mjs` usa handlers reais, PGlite persistente, migrações reais e Auth/Storage simulados em loopback. Cobre perfis privados, consentimento, convites/expiração/revogação, requests concorrentes, cancelamento/aceitação, retries, relações e posts após reinício, seguidores sem acesso, leitura direta por terceiro negada, remoção/bloqueio nos dois sentidos, falha de armazenamento, exclusão, relatos e RLS/RPCs restritos. Não usa contas, publicações ou provedores reais.

Antes da ativação, testar o SQL duas vezes em staging e revisar grants/políticas. Aplicar a migração pelo fluxo administrativo existente somente após revisão; depois publicar a rota/config/interface em conjunto e habilitar a flag. O teste local não substitui uma verificação com contas de staging. A chave de serviço continua exclusivamente no backend.
