# Sonic Search — operação de privacidade e atendimento

Documento interno preparado em 22/09/2026. **Procedimento proposto, ainda não implantado nem aprovado como política de retenção.** Não contém credenciais ou documento fiscal pessoal. Responsável informado: Pedro Jorge Porto Freire de Paula. Contato já usado no produto: pedropfpj@gmail.com.

## Inventário inicial para validar

| Dados / local | Finalidade | Enquadramento a validar | Retenção / controle pendente |
|---|---|---|---|
| Idioma, curtidas e preferências no dispositivo | Funcionar e personalizar localmente | Necessidade para o recurso solicitado; transparência | Até limpeza pelo titular; explicar que cada dispositivo é independente |
| Supabase Auth e sessão local | Autenticar e permitir sincronização | Execução do serviço e segurança | Encerrar conta/revogar sessões; verificar tokens de provedores |
| `profiles`, fotos em `sonic-profile-avatars` | Perfil escolhido pelo titular | Serviço solicitado; opções de visibilidade | Remover fotos antigas e objetos órfãos; perfil privado por padrão conforme migrações existentes |
| Radar, likes, histórico e coleções sincronizados | Continuidade da conta | Serviço solicitado | Mapear todas as tabelas efetivas antes de apagar; conferir FKs e backups |
| Comunidade/comentários e reações | Publicação/interação solicitada | Serviço e regras de comunidade | Parte usa documentos JSON em storage legado; não supor que cascata SQL elimina tudo |
| Denúncias/bloqueios | Segurança e moderação | Base adequada por finalidade/necessidade | Acesso restrito; justificar conservação após exclusão; remover dados excessivos |
| `beta_events`, contadores Redis/memória e Insights | Medição opcional de produto | Consentimento para novos eventos web | Proposta: avaliar janela de até 90 dias para eventos detalhados, menor se suficiente; só ativar expurgo após inventário, confirmação das obrigações e ensaio. Dados históricos não foram eliminados |
| Logs de infraestrutura/limites de abuso | Disponibilidade e segurança | Segurança, interesse legítimo ou obrigação aplicável conforme análise | Levantar logs, regiões, retenção e acesso em cada fornecedor; não aplicar 90 dias indistintamente a logs sujeitos a dever específico |
| `sonic_privacy_requests` | Receber, comprovar e responder pedidos | Atendimento de direitos, serviço e obrigações aplicáveis | Contato e mensagem restritos; definir prazo mínimo necessário de prova, reduzir conteúdo após conclusão e eliminar ao vencer. Sem expurgo automático nesta entrega |
| Stripe/Apple e registros de assinatura | Cobrar, cancelar, reembolsar e contabilizar | Contrato e obrigações legais/fiscais | Contador/jurídico devem definir prazos por documento; preservar somente o que tiver fundamento |
| Contato, lista de interesse e IA | Responder ou executar recurso acionado | Mapear cada fluxo e finalidade | Conferir conteúdo enviado, DPA, região, suboperadores, treino/retenção e transferências |

Inventário não exaustivo: confrontar com schema e configuração reais. Não enviar bases completas para terceiros para preencher essa tabela. Aprovar separadamente regiões, DPAs e mecanismos de transferência; disponibilidade de uma API não é autorização para qualquer finalidade.

## Fila de solicitações

A migração cria tabela sem acesso direto de clientes. O endpoint autentica com Supabase e limita consultas ao próprio usuário. `request_key` deduplica tentativas de envio; o protocolo exibido é `id`. Recebimento não executa exclusão, exportação nem estorno.

Consulta de triagem no SQL Editor administrativo, apenas por pessoa autorizada:

```sql
select id, kind, status, created_at, updated_at
from public.sonic_privacy_requests
where status in ('open', 'processing', 'awaiting_user')
order by created_at asc;
```

Consultar contato/mensagem somente para o protocolo sob atendimento. Não exportar a fila com dados pessoais para repositórios, chats, planilhas públicas ou logs. Não preencher `resolution_note` com senha, token ou documento completo.

Estados: `open` recebido; `processing` em atendimento; `awaiting_user` exige resposta do titular; `completed` execução efetivamente comprovada; `closed_with_reason` encerramento fundamentado e comunicado. Atualizar `updated_at` em toda transição. Antes de `completed`, registrar uma referência restrita à evidência, tipo de ação, data e responsável. Não usar `completed` apenas porque um e-mail foi enviado.

## Atendimento de exclusão

1. Localizar protocolo, conta autenticada e e-mail. Confirmar identidade por meio proporcional; não pedir CPF ou senha por padrão. Quem perdeu acesso pode usar e-mail alternativo e verificação adequada.
2. Comunicar o recebimento, prazo concreto do caso e eventuais verificações. O prazo não pode afastar prazo legal aplicável. Informar separadamente cancelamento de renovação, encerramento da conta e eventual reembolso.
3. Levantar dados reais pelo ID verificado: Auth, perfil, fotos, Radar/histórico/likes, coleções, atividade, comunidade, comentários e reações em SQL e documentos de storage, denúncias, bloqueios e dados vinculados a autenticação externa. Registros opcionais antigos podem ter IDs diferentes; obter somente o necessário para localizá-los, sem nova identificação excessiva.
4. Separar conservação obrigatória e sua justificativa. Não eliminar prova fiscal, registros com obrigação aplicável ou evidência necessária sem avaliação. Também não conservar tudo genericamente por “segurança”. Registrar prazo e restrição de acesso de cada exceção.
5. Preparar e revisar uma lista dos objetos/linhas a remover. Ensaiar em conta sintética. Em storage legado compartilhado, preservar registros de outras pessoas e impedir sobrescrita concorrente/perda de atualizações. A exclusão de Auth sozinha não resolve esse armazenamento.
6. Remover objetos privados e desvincular/anonimizar o que for devido antes de excluir Auth; o [Supabase documenta restrições de exclusão de usuário com objetos de storage](https://supabase.com/docs/reference/javascript/auth-admin-deleteuser). Invalidar sessões e revogar credenciais Apple conforme o fluxo utilizado. A [Apple exige iniciar exclusão no app](https://developer.apple.com/support/offering-account-deletion-in-your-app/).
7. Verificar inacessibilidade com a sessão antiga, URLs antigas de foto após sua expiração e outra conta. Testar que dados de terceiros continuam íntegros. Backups precisam de ciclo documentado e mecanismo que impeça restaurar dados excluídos como conta ativa.
8. Enviar confirmação final ao contato validado, incluindo exceções justificadas e prazo. Só então marcar conclusão. A FK da fila mantém o protocolo com `user_id` nulo após exclusão; contato/mensagem também precisam seguir a retenção aprovada.

**Não executar esta lista em conta real como teste.** Esta entrega não realiza exclusão automática justamente porque há armazenamentos legados e obrigações que precisam ser reconciliados antes.

## Acesso, correção e cobrança

- Acesso/exportação: autenticar destinatário, gerar apenas seus dados, excluir segredos/tokens e dados de terceiros, entregar por canal seguro com expiração. A cópia local do app não substitui dados online.
- Correção: registrar campos e confirmação; conservar somente a prova necessária. Separar correção de perfil de contestação de dados externos.
- Cancelamento/reembolso: identificar canal, compra e datas. Avaliar direito de arrependimento e outras hipóteses; trial não substitui direitos legais. Usar mecanismos do processador/loja, registrar retorno e acompanhar a liquidação. Não exigir dados completos de cartão. Desligar novas vendas não deve bloquear cancelamento/restauração.
- Menores: prioridade de análise de exposição/segurança; avaliação própria do ECA Digital, público real e configurações protetivas. Um texto “não destinado a crianças” não resolve sozinho o risco.

## Modelo de resposta inicial

> Recebemos sua solicitação [tipo], protocolo [id], em [data]. Ela está em análise e ainda não foi concluída. [Informar prazo concreto aplicável e eventual etapa de verificação estritamente necessária.] Você pode acompanhar o protocolo em Perfil → Conta, dados e atendimento ou responder a este contato. Não envie senha ou dados completos de cartão.

## Modelo de conclusão

> Concluímos [ações efetivamente realizadas] em [data], referente ao protocolo [id]. [Listar dados conservados, fundamento e prazo, se houver.] [Explicar situação de assinatura/reembolso quando aplicável.] Dados locais em outros dispositivos precisam ser apagados nesses dispositivos. Para dúvidas ou contestação, responda a este contato.

Modelos não foram enviados a ninguém. Preencher somente depois de confirmar os fatos e o prazo aplicável.

## Incidentes

Registrar descoberta, sistemas, dados afetados, alcance confirmado e responsável. Conter acesso indevido, preservar evidências restritas e avaliar impacto aos titulares. Consultar imediatamente os critérios e prazos vigentes de comunicação à ANPD/titulares e outros destinatários aplicáveis; não presumir que todo incidente exige a mesma comunicação nem que logs incompletos provam ausência de exposição. Validar o procedimento antes de um incidente real e manter contato de plantão.

## Registro de licenças e liberação comercial

Para cada fonte/ativo: fornecedor e conta; finalidade; dados/áudio/imagens; território; uso comercial permitido; cópia/versionamento do contrato; atribuição/link exigido; cache/reprodução; expiração/rescisão; prova e responsável. Pendentes de comprovação nesta auditoria: iTunes (inclusive modelo de uso das prévias), Deezer, Last.fm, tags suplementares MusicBrainz e direitos de ativos/conteúdos de terceiros.

`SONIC_COMMERCIAL_RELEASE_APPROVED` e `SONIC_MUSICBRAINZ_SUPPLEMENTARY_APPROVED` ficam falsos até decisões documentadas. Ligá-los não concede direitos nem substitui análise. Não alterar produção simplesmente para fazer um teste passar.
