# Sonic Search — correções e pendências de conformidade

Atualizado em 22/09/2026. Complementa a [auditoria original](legal-compliance-audit-2026-09-22.md), que preserva o retrato anterior às correções.

**Resultado: problemas técnicos relevantes foram corrigidos e verificados localmente. Isso não equivale a regularidade integral nem a correção já publicada.** Nenhuma alteração foi aplicada ao site, banco remoto, lojas, faturamento ou contas reais durante esta etapa.

## Identificação recebida

Responsável informado pelo titular: **Pedro Jorge Porto Freire de Paula**. Esse nome foi incluído nos documentos públicos locais. “CBK Labs” foi descrito como marca, sem afirmar a existência de pessoa jurídica.

O identificador fiscal foi fornecido privadamente, não foi validado em cadastro oficial e não foi incluído no repositório nem nas páginas públicas. Município/UF, endereço aplicável ao fornecedor, países de oferta e eventual enquadramento empresarial continuam pendentes. Definir com o responsável e assessoria os dados que devem constar da oferta; evitar publicar endereço residencial ou documento por simples suposição.

## O que mudou

| Achado | Implementação local | Limite / próximo aceite |
|---|---|---|
| C01 — métricas após recusa | Módulo único de consentimento impede criar identificadores/enviar métricas internas sem aceite. Recusa/revogação limpa identificadores, aborta requisições em curso e recarrega documento caso Insights já tenha carregado. Mudanças entre abas são observadas. | Publicar frontend e backend juntos; verificar novamente o ambiente público. Dados já recebidos não foram apagados. |
| C01 — aceites antigos | A escolha ganhou versão `2026-09-22`. Aceite antigo, referente ao Insights, exige nova escolha; recusa antiga permanece válida. Banner/políticas explicam sessões e descobertas. | Validar retenção e inventário dos eventos existentes. |
| C01 — versões antigas e apps | Backend descarta sem gravar eventos sem marcador explícito de consentimento vigente e plataforma web. Métricas opcionais permanecem desligadas nos runtimes nativos. Novos eventos de sessão não incluem ID da conta, inclusive no servidor. | O marcador declara consentimento do cliente; não é autenticação nem prova criptográfica de uma pessoa. |
| C02 — Deezer | Rota exige integração e rota explicitamente ativadas; ambas desligadas por padrão. Diagnóstico inclui estado efetivo da rota. Redirect sem cache para evitar reaproveitamento após desativação. | Obter/revisar autorização antes de ativar. Não foi concedida licença. |
| C04/C07 — canal de atendimento | Perfil ganhou solicitação autenticada de exclusão, acesso, correção e cancelamento/reembolso, com confirmação de exclusão, protocolo persistente e consulta dos próprios protocolos. Página web de exclusão e canal alternativo por e-mail. | Migrar banco, atribuir operador, testar atendimento e exclusão integral de conta sintética. Não há execução automática de exclusão/estorno, prazo operacional aprovado ou comprovação de aceite das lojas. |
| C04 — segurança do protocolo | Identidade obtida no servidor; ID enviado no corpo não escolhe a conta. Tabela privada, RPC apenas service role, isolamento, chave de repetição e limite atômico de 10 novos pedidos por conta/24h. Erros não geram confirmação fictícia. | Não disponibilizar o serviço sem rotina de atendimento. O e-mail alternativo continua disponível em falha/limite. |
| C06 — fornecedor | Nome completo recebido aplicado a Termos, Privacidade, Cookies e página de exclusão. | Identificação/endereço fiscal e modelo da operação ainda precisam ser concluídos. |
| C07 — cobrança | Novas vendas dependem de `SONIC_BILLING_ENABLED` **e** `SONIC_COMMERCIAL_RELEASE_APPROVED`. Portal Stripe, restauração e reconciliação de compras Apple permanecem disponíveis quando novas vendas estão desligadas. | Flags não certificam regularidade. Oferta, prova de contratação, aceite/cópia dos termos, estornos e obrigações fiscais continuam pendentes. |
| C11 — MusicBrainz | Uso de tags suplementares desligado por padrão em perfil/biografia; caches distinguem a configuração. Importador exige aprovação explícita e deixa de rotular lote com tags como integralmente CC0. | Revisar lotes já importados e todas as fontes derivadas; não foram removidos dados históricos nem obtida autorização comercial. Last.fm continua pendente de comprovação contratual. |
| C14 — coerência | Políticas locais atualizadas em 22/09, scripts adicionados ao empacotamento, identificadores de versão alterados e bundle web regenerado. Transformações iOS verificadas. | Não foi gerado/submetido binário de loja nem sincronizada produção. Empacotamento Android ainda herda substituições textuais que precisam de revisão própria. |

## Arquivos centrais

- Consentimento: `privacy-controls.js`, `index.html`, guardas em `app.js`, `_beta-events.js`, `_discovery-exposure.js`.
- Atendimento: `privacy-requests.js`, `privacy-requests.css`, `account-deletion.html`, `lib/api/_privacy-requests.js`.
- Banco: `supabase/migrations/20260922120000_privacy_requests.sql`.
- Operação: [procedimentos e inventário](privacy-operations.md).
- Evidências locais: `reports/legal-audit-2026-09-22/remediation/`.

## Ativação e aceite

1. Concluir revisão deste conjunto e configurar operador de atendimento com acesso restrito ao banco. Ler a fila em cada dia útil; monitorar falhas e pedidos atrasados. Prazo interno sugerido de triagem: próximo dia útil. Prazos legais aplicáveis prevalecem e precisam ser incorporados ao atendimento.
2. Aplicar a migração em ambiente de homologação; confirmar bloqueio a `anon`/`authenticated` e disponibilidade ao servidor. Não enviar service-role key ao frontend.
3. Testar uma conta descartável: registrar pedido, consultar protocolo, verificar que outra conta não o enxerga, atender e confirmar por e-mail. Registrar evidência da remoção/inacessibilidade de cada armazenamento pertinente. Incluir revogação Apple, quando aplicável.
4. Publicar migração, backend e frontend de maneira coordenada. Sem migração/configuração, a UI informa falha e oferece contato; isso não é atendimento online operacional.
5. Verificar com navegador novo: ausência de escolha, recusa, aceite e revogação. Confirmar recusa também em versão antiga do cliente. Não enviar eventos reais com pessoas/dados de teste identificáveis.
6. Confirmar Deezer desligado e manter novas cobranças bloqueadas até documentação comercial/fiscal/licenças e fluxo de consumidor concluídos.
7. Gerar os pacotes nativos completos e executar testes reais de conta/assinatura em sandbox. Conferir formulários de privacidade e exclusão no App Store Connect/Google Play; não copiar declarações de uma loja para outra.

## Verificação realizada

Oito suítes passaram: controles de conformidade; migração da fila em PostgreSQL/PGlite; sessões de analytics; exposição de descobertas; segurança de requisições; privacidade das superfícies de perfil; filtro de conteúdo; interface em Chromium. O navegador usou respostas sintéticas: não houve envio de pedidos reais, criação de contas ou tráfego a serviços de terceiros. A interface foi inspecionada em 390 px, e o bootstrap/banner real foi exercitado em recusa, ausência de escolha, aceite antigo, aceite novo, revogação com recarga e runtime nativo. Transformações das páginas/código iOS também passaram.

O teste completo preexistente `test-billing-foundation.mjs` **não concluiu** após mais de 3min46s e foi interrompido; na auditoria inicial já havia duas tentativas com timeout de 120s. Há dependências locais marcadas como arquivos sem conteúdo materializado (`dataless`). Os novos casos de trava comercial e portal passaram com SDKs de pagamento simulados; isso não valida compras reais, callbacks Apple/Stripe ou o binário nativo.

`app.min.js` foi regenerado com Terser 5.49.0 e as opções do build existente. Para contornar leitura travada de dependências locais, foi usado o bundle oficial dessa mesma versão em diretório temporário, conferindo o SHA-512 contra o registro npm. Não houve alteração das dependências do projeto por essa operação. Sintaxe dos scripts alterados e espaços em branco do diff foram verificados.

Resultados completos: [test-results.json](../reports/legal-audit-2026-09-22/remediation/test-results.json). Capturas: [celular](../reports/legal-audit-2026-09-22/remediation/requests-mobile.png) e [desktop](../reports/legal-audit-2026-09-22/remediation/requests-desktop.png).

Referência adicional confirmada nesta etapa: a [MetaBrainz diferencia CC0 para dados centrais e CC BY-NC-SA 3.0 para dados suplementares](https://metabrainz.org/datasets/postgres-dumps). Por isso o importador não deve declarar todo lote com tags como CC0.

## Pendências que código não resolveu

| Prioridade | Evidência necessária | Responsável sugerido |
|---|---|---|
| Antes de vender | Fornecedor/endereço, enquadramento tributário, emissão de documento fiscal, países atendidos, tributos e identificação nos processadores | Pedro + contador + jurídico |
| Antes de liberar uso comercial das fontes | Termos/contratos de iTunes, Last.fm, Deezer e demais fontes; limites de uso, prévias, atribuições, links/selo e documentação dos ativos próprios | Pedro + jurídico/produto |
| Antes de aceitar a exclusão como resolvida | Ensaio ponta a ponta, operador, prazo comunicado, Apple token revogado se aplicável, dados legados tratados e prova de resposta | Operação + engenharia |
| Antes de expandir o público | Avaliação de menores/acesso provável, perfilamento, conteúdo explícito, comunidade e proteções proporcionais | Produto + jurídico/privacidade |
| Antes de aprovar governança | Inventário real, bases por finalidade, cronograma de retenção, contratos de tratamento e transferências internacionais | Privacidade + jurídico |
| Antes de declarar lojas acessíveis/conformes | Declarações reais, testes de cobrança/cancelamento, moderação operacional e auditoria de acessibilidade | Produto + engenharia |

As fontes oficiais e a fundamentação de cada obrigação estão na auditoria original. Este acompanhamento separa correção técnica, implantação e validação jurídica; nenhum status deve ser interpretado como certificação.
