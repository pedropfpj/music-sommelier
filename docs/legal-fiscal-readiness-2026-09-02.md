# Sonic Search — revisão jurídica e fiscal de pré-lançamento

Data da revisão: 2 de setembro de 2026
Escopo: Sonic Search web, app iOS, Sonic Premium, Stripe, App Store, Supabase e Vercel
Status: **NÃO LIBERADO PARA COBRANÇA REAL**

## Natureza desta revisão

Este documento é uma auditoria técnica de pré-conformidade. Ele organiza fatos, riscos, controles e perguntas para validação final. Não constitui parecer jurídico, opinião tributária, escrituração contábil ou autorização para operar. Consultoria e assessoria jurídicas são atividades privativas da advocacia no Brasil, e a responsabilidade por enquadramento, apuração e obrigações contábeis deve ser assumida por profissional habilitado.

A liberação comercial exige validação nominal de:

- advogado inscrito na OAB, para consumo, contratos, privacidade e operação internacional;
- contador registrado no CRC, para forma de operação, CNAE, regime tributário, NFS-e, tributos e conciliação;
- especialista em IVA/GDPR ou solução equivalente, caso a venda direta para consumidores da União Europeia seja ativada.

## Conclusão executiva

O produto tem uma base técnica e documental acima do mínimo de um protótipo: cobrança continua desligada, os segredos ficam no servidor, há separação entre Stripe no site e App Store no iOS, existe portal de assinatura, webhooks assinados, política de privacidade, política de cookies e termos com trial, renovação e cancelamento.

Ainda não deve receber pagamentos reais. Faltam quatro decisões estruturais que não podem ser inventadas no código:

1. identificar o fornecedor legal que efetivamente venderá o Sonic Premium;
2. definir e configurar a emissão fiscal e a contabilização da receita;
3. implementar um procedimento formal de arrependimento, reembolso, suporte e confirmação contratual;
4. decidir se a venda web para a União Europeia será bloqueada no lançamento ou regularizada para IVA/GDPR antes de abrir.

## Evidências verificadas no projeto

### Controles já presentes

- `SONIC_BILLING_ENABLED=false` mantém checkout e cobrança fora de produção.
- Stripe e App Store são tratados como canais diferentes, ambos convergindo para o direito Premium no backend.
- O frontend não decide sozinho se uma conta é Premium.
- O backend prevê Checkout, Customer Portal, eventos idempotentes e verificação de assinatura de webhook.
- O trial está definido em 14 dias e a renovação automática é informada na oferta.
- Os Termos informam preço/período antes da confirmação, renovação, cancelamento e processador aplicável.
- A Política de Privacidade informa dados de cobrança, Stripe, Apple, Supabase, Vercel e ausência de armazenamento do número completo do cartão.
- Analytics do site depende de escolha do usuário; o pacote iOS declara não carregar analytics de tracking.
- Curtidas gratuitas estão descritas como ilimitadas.

### Lacunas observadas

- “Pedro Freire / CBK Labs” não identifica de forma suficiente o fornecedor: faltam nome empresarial definitivo, CPF/CNPJ aplicável, endereço comercial para contato e dados fiscais.
- O e-mail pessoal atual não é um canal de suporte comercial/privacidade ideal nem demonstra SLA de atendimento.
- O texto não separa claramente cancelamento da renovação, reembolso por falha, direito legal de arrependimento e fim do trial.
- Não existe, no fluxo verificado, uma ferramenta própria para solicitar arrependimento pelo mesmo meio da contratação e receber confirmação imediata.
- Não foi localizada política operacional de NFS-e, documento fiscal, numeração, retenção contábil, conciliação Stripe/App Store ou tratamento de chargeback.
- A descrição genérica de transferências internacionais não identifica o mecanismo jurídico usado com cada fornecedor global.
- Não foi localizado inventário formal de tratamento de dados, matriz controlador/operador, plano de incidentes ou calendário de retenção por categoria.
- O tratamento de menores está ambíguo: “não direcionado a crianças” e “menor com autorização” não definem idade mínima nem um controle verificável.
- Não foi comprovado o tratamento de IVA para venda B2C de serviço eletrônico na União Europeia.
- A conta Stripe exibida anteriormente continha identidade de projeto antigo e onboarding pendente; isso precisa ser corrigido antes do modo de produção.

## Bloqueadores antes da primeira venda

### LF-01 — Identidade do fornecedor

**Risco: crítico.** O comércio eletrônico brasileiro exige identificação clara do fornecedor, endereço físico e eletrônico, características do serviço, preço total, condições da oferta e restrições.

Antes de publicar a cobrança, preencher e validar em Termos, Privacidade, Cookies, checkout, recibos e suporte:

- razão social ou nome civil do fornecedor;
- nome fantasia, se aplicável;
- CPF ou CNPJ que legalmente realizará a venda;
- endereço comercial válido para localização e contato;
- e-mail próprio de suporte e de privacidade;
- jurisdição e dados de emissão fiscal.

Não publicar endereço residencial sem decisão consciente. Preferir endereço comercial compatível com o cadastro fiscal e com Stripe/App Store.

### LF-02 — Operação fiscal brasileira

**Risco: crítico.** O software não define CNAE, regime tributário nem incidência. Essas decisões dependem da natureza jurídica, município, atividades efetivamente prestadas, contratos e volume de receita.

**Conclusão preliminar sobre MEI:** não usar MEI para o Sonic Search sem parecer escrito do contador confirmando uma ocupação permitida que descreva fielmente a atividade. O produto cobra assinatura por acesso a software e pode envolver desenvolvimento, processamento/disponibilização de dados e licenciamento ou cessão de uso. O Portal do Empreendedor exige que a ocupação do MEI represente exatamente a atividade realizada e limita o enquadramento às ocupações do Anexo XI da Resolução CGSN nº 140/2018. Usar uma ocupação artística, de treinamento ou de suporte apenas para encaixar o SaaS criaria divergência entre cadastro, contrato, nota fiscal e operação real.

O caminho a avaliar primeiro com o contador é uma **sociedade limitada unipessoal ou outra forma de microempresa**, com CNAE e objeto social compatíveis, verificando a opção pelo Simples Nacional. “Microempresa” é porte; “sociedade limitada unipessoal” é forma jurídica; “Simples Nacional” é regime tributário. Nenhum deles deve ser escolhido apenas pelo nome ou pelo menor imposto aparente.

O contador deverá documentar antes do lançamento:

- se a venda será feita por pessoa física ou jurídica e por qual entidade;
- CNAE e objeto social compatíveis com assinatura de software/serviço digital;
- possibilidade e conveniência de Simples Nacional, Lucro Presumido ou outro regime;
- município competente, cadastro mobiliário e emissão de NFS-e;
- tratamento de ISS, PIS/Cofins, IRPJ/CSLL e demais obrigações aplicáveis;
- documento fiscal para pessoa física brasileira e para cliente estrangeiro;
- conciliação entre valor bruto, desconto, imposto, taxa Stripe/App Store, estorno e valor líquido;
- contabilização separada de assinatura, doação/apoio voluntário e eventual receita publicitária/parceria.

Não assumir que recibo do Stripe substitui nota fiscal. Não misturar receitas do Sonic Search com um projeto antigo sem confirmação do contador.

### LF-03 — Arrependimento, cancelamento e reembolso

**Risco: crítico.** O trial gratuito de 14 dias é uma oferta comercial; ele não substitui automaticamente direitos legais do consumidor.

Implementar e validar:

- resumo da contratação antes do pagamento;
- confirmação da aceitação e cópia conservável dos termos vigentes;
- data/hora e versão dos termos aceitos;
- canal eletrônico visível para suporte, cancelamento e arrependimento;
- confirmação automática do recebimento do pedido;
- procedimento Stripe para estorno e procedimento App Store para orientar o usuário;
- diferenciação clara entre cancelar renovação, pedir reembolso e exercer arrependimento;
- regra brasileira de contratação à distância e regra europeia aplicável, sem reduzir direitos obrigatórios.

### LF-04 — União Europeia: IVA e consumo

**Risco: crítico se vendas web em EUR forem ativadas.** Uma empresa fora da UE que fornece serviços a consumidores da UE pode precisar cobrar IVA no país do consumidor e usar o regime Non-Union OSS. A determinação depende da classificação concreta do Sonic Premium e do papel de cada plataforma.

Escolher um dos caminhos antes da cobrança real:

- **lançamento Brasil:** impedir checkout web para clientes fora do Brasil até a validação internacional; demonstrações na Europa permanecem gratuitas/teste sem cobrança real; ou
- **lançamento internacional:** contratar contador/especialista em IVA, definir evidências de localização do consumidor, preços com IVA, faturas, retenção de registros e cadastro Non-Union OSS; ou
- **Merchant of Record:** avaliar fornecedor que assuma contratualmente cobrança e recolhimento de impostos, confirmando alcance, custos e responsabilidade residual.

Stripe Checkout, sem uma contratação específica de Merchant of Record, não deve ser presumido como responsável por todas as obrigações tributárias do vendedor.

### LF-05 — App Store e pagamentos digitais

**Risco: crítico para aprovação iOS.** Recursos digitais usados dentro do app devem seguir a política de In-App Purchase. O app pode reconhecer a mesma assinatura adquirida em outro canal, mas links e chamadas externas de compra dependem da vitrine e das permissões aplicáveis.

Antes do envio final:

- criar e aprovar os produtos mensais/anuais e a oferta introdutória no App Store Connect;
- testar compra, restauração, renovação, falha, cancelamento, expiração e reembolso em sandbox;
- garantir que a versão iOS não direcione para Stripe onde isso não for permitido;
- conferir metadados, preço, termos, política de privacidade e informações de assinatura na tela de compra;
- reconciliar relatórios e documentos fiscais disponibilizados pela Apple com a contabilidade.

### LF-06 — Privacidade e transferências internacionais

**Risco: alto.** A política pública é uma boa base, mas ainda não prova a conformidade operacional.

Preparar:

- inventário das operações de tratamento e respectiva base legal;
- lista de operadores/suboperadores, finalidade, país/região e prazo de retenção;
- contratos/DPA e mecanismo de transferência internacional aplicável;
- procedimento de acesso, correção, exportação e exclusão da conta;
- plano de resposta a incidente, responsáveis e registro de decisões;
- revisão de dados enviados a OpenAI e APIs musicais, com minimização e impedimento de segredos/dados desnecessários;
- avaliação objetiva de necessidade de encarregado e, se a UE for ativamente visada, representante/obrigações GDPR.

## Melhorias importantes, mas posteriores aos bloqueadores

- Criar `support@sonicsearch.app` e `privacy@sonicsearch.app`.
- Publicar uma Política de Reembolso e Cancelamento curta, ligada ao checkout e ao rodapé.
- Criar uma central “Minha assinatura” com canal de compra, próxima cobrança, status, botão de gestão e histórico de pedidos.
- Guardar a versão dos Termos aceita em cada contratação.
- Traduzir documentos legais para inglês antes de vender na Alemanha ou nos Países Baixos; tradução não substitui revisão jurídica local.
- Definir idade mínima consistente no site, app, App Store e política de privacidade.
- Criar rotina mensal de conciliação Stripe, Apple, Supabase, banco e notas fiscais.
- Revisar se apoios por Pix/cripto continuarão disponíveis e qual é o tratamento jurídico/fiscal correto.

## Gate de liberação comercial

Cobrança real só pode ser habilitada quando todos os itens abaixo estiverem comprovados:

- [ ] fornecedor legal e dados públicos aprovados;
- [ ] conta Stripe pertence ao fornecedor correto e onboarding está completo;
- [ ] CNAE, regime, NFS-e e conciliação aprovados por contador/CRC;
- [ ] Termos, Privacidade, Cookies e Política de Reembolso aprovados por advogado/OAB;
- [ ] fluxo de arrependimento, suporte e confirmação contratual testado;
- [ ] decisão documentada para vendas fora do Brasil;
- [ ] IVA/OSS ou Merchant of Record validado se houver venda direta B2C na UE;
- [ ] matriz de dados, contratos de operadores e transferências internacionais revisados;
- [ ] Stripe em modo de teste aprovado ponta a ponta;
- [ ] App Store sandbox e restauração aprovados ponta a ponta;
- [ ] nenhum segredo está em frontend, repositório, documento ou chat;
- [ ] aprovação explícita para mudar `SONIC_BILLING_ENABLED` somente em Preview;
- [ ] teste final em Preview antes de qualquer alteração em Production.

## Pacote para validação profissional

Entregar ao advogado:

- este relatório;
- Termos, Privacidade e Cookies atuais;
- telas da oferta, checkout, trial, cancelamento e suporte;
- lista de fornecedores e países de processamento;
- descrição do público-alvo e países onde haverá venda;
- decisão sobre idade mínima e comunidade/conteúdo de usuários.

Entregar ao contador:

- identificação da entidade vendedora;
- preços por moeda e projeção de receita;
- contratos/relatórios Stripe e App Store;
- descrição funcional do Sonic Premium;
- fluxo de recebimento, estorno, chargeback e apoio voluntário;
- países de clientes esperados e decisão sobre venda UE;
- modelo desejado de NFS-e e relatório de conciliação.

## Fontes oficiais consultadas

- Estatuto da Advocacia, Lei 8.906/1994: https://www.planalto.gov.br/ccivil_03/leis/l8906.htm
- Código de Defesa do Consumidor: https://www.planalto.gov.br/ccivil_03/leis/l8078compilado.htm
- Decreto do comércio eletrônico, Decreto 7.962/2013: https://www.planalto.gov.br/ccivil_03/_ato2011-2014/2013/decreto/d7962.htm
- ANPD, agentes de tratamento de pequeno porte: https://www.gov.br/anpd/pt-br/acesso-a-informacao/institucional/atos-normativos/regulamentacoes_anpd/resolucao-cd-anpd-no-2-de-27-de-janeiro-de-2022
- ANPD, transferência internacional de dados: https://www.gov.br/anpd/pt-br/acesso-a-informacao/institucional/atos-normativos/regulamentacoes_anpd/resolucao-cd-anpd-no-19-de-23-de-agosto-de-2024
- Conselho Federal de Contabilidade, prerrogativas profissionais: https://cfc.org.br/fiscalizacao-etica-e-disciplina/perguntas-frequentes/prerrogativas-de-contadores-e-tecnicos-em-contabilidade/
- Portal do Empreendedor, ocupações permitidas ao MEI: https://www.gov.br/empresas-e-negocios/pt-br/empreendedor/quero-ser-mei/quais-as-ocupacoes-que-podem-ser-mei
- Portal do Empreendedor, atividade ausente da lista do MEI: https://www.gov.br/empresas-e-negocios/pt-br/empreendedor/perguntas-frequentes/pontos-de-atencao-antes-da-formalizacao/quais-atividades-podem-ser-enquadradas-1
- Portal Nacional da NFS-e, serviços de software e conteúdo digital: https://www.gov.br/nfse/pt-br/mei-e-demais-empresas/codigos-de-tributacao-nacional-nbs
- Ministério do Empreendedorismo, teto do MEI: https://www.gov.br/memp/pt-br/teto-do-mei
- Comissão Europeia, direito de retirada: https://europa.eu/youreurope/citizens/consumers/shopping/returns/index_en.htm
- Comissão Europeia, VAT One Stop Shop: https://europa.eu/youreurope/business/finance-and-tax/vat/one-stop-shop/index_en.htm
- Comissão Europeia, aplicação territorial do GDPR: https://commission.europa.eu/law/law-topic/data-protection/reform/rules-business-and-organisations/application-regulation/who-does-data-protection-law-apply_en
- Apple App Review Guidelines: https://developer.apple.com/app-store/review/guidelines/
- Stripe, práticas de segurança de chaves: https://docs.stripe.com/keys-best-practices
