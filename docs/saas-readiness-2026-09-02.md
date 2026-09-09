# Sonic Search como SaaS — estado de lançamento

Data: 02/09/2026

## Proposta do produto

O Sonic Search continua sendo um radar pessoal de descoberta de música eletrônica, e não um serviço genérico de streaming.

- **Sonic Free:** descoberta essencial, previews e links, perfil local, compartilhamentos e curtidas ilimitadas.
- **Sonic Premium:** três faixas diárias — uma afinidade, uma ponte e uma surpresa —, memória de gosto mais longa e histórico sincronizado entre aparelhos.

O mesmo login identifica a assinatura no site e no iOS. A compra web passa pelo Stripe; a compra iOS passa pela App Store. Ambos os canais atualizam o direito Premium no Supabase.

## Pronto no código

- Radar Diário de faixas determinístico, personalizado e traduzido em português, inglês e espanhol.
- Três papéis curatoriais por dia: afinidade, expansão e fora da bolha.
- Feedback **Curti**, **Já conheço** e **Não combina**, histórico de até 30 dias e memória de até 600 sinais.
- Persistência local e sincronização autenticada no Supabase, com RLS e escrita limitada ao próprio usuário.
- Curtidas ilimitadas no plano Free; o limite antigo continua desligado por chave explícita.
- Planos, assinaturas e eventos idempotentes de cobrança no banco.
- Checkout e portal do cliente Stripe para o site, com assinatura de webhook verificada.
- StoreKit 2 no app iOS para listar produtos, comprar, restaurar e gerenciar assinaturas.
- Verificação de transações e notificações Apple no backend com a biblioteca oficial e certificados raiz empacotados.
- Uma única fronteira de acesso Premium verificada no servidor; o navegador não escolhe o próprio plano.
- Chave geral `SONIC_BILLING_ENABLED=false`: nenhuma cobrança aparece enquanto produtos, preços e credenciais não estiverem prontos.
- Termos e Política de Privacidade atualizados para assinatura web/iOS e dados do Radar Diário.

## Pronto em produção

Aplicado e verificado no projeto Supabase **Sonic Search** em 02/09/2026:

- `sonic_plans`
- `sonic_memberships`
- `sonic_billing_events`
- `sonic_daily_radar_state`
- função atômica `claim_sonic_billing_event`
- planos iniciais `free` e `premium`

As chaves sensíveis permanecem somente no backend.

Publicado e verificado no Vercel em 02/09/2026:

- produção `dpl_CniBQsDmcpABr8P3NxFAJe4KdnH6`, vinculada a `https://sonicsearch.app`;
- Radar Diário, base de assinatura e páginas legais no ar;
- cobrança mantida desligada com `SONIC_BILLING_ENABLED=false`;
- teste introdutório configurado em 14 dias para o próximo gate;
- descoberta gratuita e curtidas ilimitadas sem o limite residual do HTML;
- APIs consolidadas de 15 para 12 funções, preservando rotas e respeitando o limite do plano Hobby;
- smoke test público da App Store aprovado em todas as rotas obrigatórias.

Paridade web preparada antes da próxima atualização do app:

- o CTA do Radar Diário abre diretamente a oferta Premium, inclusive para visitantes sem login;
- benefícios, teste grátis de 14 dias e preços de lançamento em BRL, EUR e USD ficam visíveis antes da criação da conta;
- o site escolhe BRL no Brasil, EUR na zona do euro e USD nas demais regiões;
- enquanto Stripe e produtos não estiverem validados, a oferta aparece como prévia “Em breve” e não inicia cobrança;
- quando o gate de cobrança for ativado, o mesmo modal encaminha usuários autenticados ao checkout Stripe e visitantes ao login.
- o modal foi movido para o nível global da página, permitindo abri-lo diretamente pelo Radar sem depender da aba Perfil.

Enviado ao App Store Connect em 02/09/2026:

- versão **1.1.0**, build **24**;
- upload aceito e encaminhado para processamento pela Apple;
- Apple App ID numérico `6786758494` identificado e configurado no Vercel;
- acordo de apps pagos confirmado como ativo;
- a versão permanece fora de revisão e nenhuma assinatura está à venda nesta etapa.

## O que depende de decisão/configuração

Configuração de lançamento escolhida:

- Brasil: **R$ 9,90/mês** ou **R$ 79,90/ano**.
- Zona do euro: **€ 2,99/mês** ou **€ 24,99/ano**.
- Estados Unidos: **US$ 2,99/mês** ou **US$ 24,99/ano**.
- Teste introdutório: **14 dias grátis**, uma vez por usuário elegível; após o teste, renovação automática no período escolhido.
- Plano anual destacado como melhor escolha, com economia aproximada de 30% a 33% sobre doze mensalidades.

O que falta configurar externamente:

1. No Stripe em modo de teste, criar o produto e os preços recorrentes acima; configurar Customer Portal e o webhook `https://sonicsearch.app/api/webhooks/stripe`.
2. No App Store Connect, criar um grupo de assinaturas e os produtos:
   - `app.sonicsearch.ios.premium.monthly`
   - `app.sonicsearch.ios.premium.yearly`
3. Configurar App Store Server Notifications V2, sandbox e produção, em `https://sonicsearch.app/api/webhooks/apple`; o Apple App ID numérico já está no Vercel.
4. Adicionar ao Vercel as credenciais Stripe e os dois Price IDs; as variáveis não sensíveis e os IDs de produto Apple já estão configurados.
5. Testar no Stripe Test Mode e no sandbox da Apple: início e conversão do trial, compra, renovação, cancelamento, expiração, reembolso, troca de plano, restauração e acesso em outro aparelho.
6. Só depois dos testes, mudar `SONIC_BILLING_ENABLED=true` em Preview; repetir o gate e então ativar em produção.

## Gate de lançamento

O SaaS pode cobrar quando uma conta consegue assinar nos dois canais, recebe o plano correto, abre o Radar em outro aparelho, restaura a compra, cancela e mantém acesso até a data correta, e quando renovação, falha, expiração e reembolso são confirmados por webhook.

Não ativar a chave geral antes de aprovar os testes de compra. A primeira assinatura iOS deve ser enviada para revisão junto com a versão 1.1.0 do app.

## Verificação realizada

- `pnpm test:daily-radar`: aprovado.
- `pnpm test:billing`: aprovado.
- `pnpm test:membership`: aprovado.
- `pnpm test:unlimited-likes`: aprovado.
- `pnpm web:build`: aprovado; catálogo runtime com 9.163 faixas.
- `pnpm ios:build-web` e `pnpm ios:copy`: aprovados.
- `xcodebuild` Debug para iOS Simulator, sem assinatura: **BUILD SUCCEEDED**.
- Radar conferido no navegador em desktop e celular de 390 × 844, sem erro de console, corte ou rolagem horizontal.
- Migrações executadas no Supabase de produção e verificadas por consulta às quatro tabelas, função e dois planos.
- Preview Vercel aprovada antes da promoção; produção publicada e validada em `https://sonicsearch.app`.
- Archive e IPA 1.1.0 (24) gerados; upload aceito pelo App Store Connect.
