# SONIC SEARCH — auditoria de conformidade

> Registro do diagnóstico inicial. As correções locais posteriores, testes e pendências de implantação estão no [acompanhamento de 22/09/2026](compliance-remediation-2026-09-22.md). Os achados abaixo preservam a situação observada antes das correções.

Data: **22 de setembro de 2026**. Escopo: projeto local, site público, backend observável e documentação de iOS/Android. Brasil como jurisdição inicial; venda internacional examinada condicionalmente. A identificação do projeto foi inferida do workspace e não recebeu confirmação adicional do solicitante.

**Resultado: não há base para declarar o Sonic Search totalmente regular. Há divergências comprovadas e obrigações cuja execução não foi demonstrada. Recomendo manter a cobrança desativada e tratar os problemas atuais de privacidade e integrações.**

Esta é uma auditoria técnica e documental de conformidade, com consulta a fontes oficiais. Não é certificação jurídica, parecer profissional nem auditoria contábil. “Não comprovado” significa que a evidência não estava disponível, e não que uma infração foi demonstrada. A validação dos enquadramentos jurídicos e fiscais depende de advogado e contador com acesso à operação.

## 1. O que foi efetivamente verificado

- Leitura de Termos, Privacidade, Cookies, auditoria de 02/09, registro de APIs, documentação das lojas e trechos relevantes do frontend, backend e configuração nativa.
- Consulta pública a sete URLs: página inicial, três páginas legais, planos de cobrança, saúde das integrações e contexto de acesso. Respostas, horário e hashes estão no [registro público](../reports/legal-audit-2026-09-22/public-checks.json).
- Navegador Chromium novo acessando o site publicado com a preferência de analytics definida como `no`. Requisições a APIs, terceiros e todos os POSTs foram interceptados e abortados, sem enviar eventos de teste ao backend. [Observações](../reports/legal-audit-2026-09-22/browser-observations.json).
- Teste local isolado da rota Deezer, com resposta externa simulada, e uma consulta pública GET à rota, sem seguir o redirecionamento de áudio. [Teste local](../reports/legal-audit-2026-09-22/deezer-gate-observation.json) e [consulta pública](../reports/legal-audit-2026-09-22/deezer-public-check.json).
- Execução de seis testes existentes ligados a segurança, cobrança, moderação e privacidade. O resultado detalhado e suas limitações constam abaixo.
- Busca limitada de quatro padrões de segredo em `app.js`, `app.min.js` e `index.html`: nenhum resultado. Isso não substitui varredura completa de segredos, histórico Git ou produção.
- Consulta a legislação brasileira, ANPD, Receita Federal, STF, Comissão Europeia e termos oficiais de plataformas em 22/09/2026.

O checkout tinha alterações anteriores à auditoria. O HEAD era `db67b727664676d372382bce7bfef3563f749bba`, mas os achados locais se referem ao conteúdo examinado, inclusive alterações não commitadas. O [manifesto de evidências](../reports/legal-audit-2026-09-22/scope-manifest.json) registra hashes de 14 arquivos centrais. Nenhuma alteração funcional, publicação, cobrança, exclusão de conta ou mensagem a terceiros foi feita.

**Não inspecionados:** contratos particulares, CNPJ/CPF cadastral, município da operação, escrituração, NFS-e emitidas, certidões, contratos de trabalho/prestação, concessões do INPI, contas administrativas de Stripe/Apple/Google, DPAs assinados, configurações internas do banco e históricos de atendimento. Também não houve pentest, compra real, exclusão de usuário real ou revisão de cada item do catálogo. Essas limitações impedem uma conclusão de regularidade integral da empresa.

## 2. Resultado por frente

| ID | Frente | Resultado | Prioridade |
| --- | --- | --- | --- |
| C01 | Analytics e escolha de privacidade | Divergência reproduzida no site público | Alta, corrigir agora |
| C02 | Desativação do Deezer | Rota de preview ativa apesar do indicador de metadados desativado | Alta, corrigir agora |
| C03 | Uso de previews iTunes | Requisitos promocionais não demonstrados no fluxo examinado | Alta, revisar uso atual |
| C04 | Exclusão de conta | Encontrada limpeza local; não localizado fluxo completo de exclusão remota | Alta, antes de nova submissão às lojas |
| C05 | Crianças e adolescentes | Proteções/enquadramento do ECA Digital não demonstrados | Alta, avaliar agora |
| C06 | Identificação do fornecedor | Identificação pública incompleta | Bloqueia liberação comercial |
| C07 | Contratação e direitos do consumidor | Fluxo de arrependimento e prova contratual incompletos | Bloqueia liberação comercial |
| C08 | Fiscal e contabilidade | Regularidade não comprovada | Bloqueia liberação comercial |
| C09 | Governança de dados e incidentes | Documentação e execução não comprovadas | Alta |
| C10 | Transferências internacionais | Mecanismo por fornecedor não comprovado | Alta |
| C11 | Licenças de APIs e bases | Registro interno insuficiente, especialmente Last.fm e tags MusicBrainz | Alta, antes de exploração comercial |
| C12 | App Store e Google Play | Controles parciais; declarações e compras não certificadas | Alta, condicionada à distribuição/cobrança |
| C13 | Operação internacional | Países, GDPR e IVA não definidos | Alta, antes de direcionamento/venda internacional |
| C14 | Versões e publicação | Política pública diferente da versão local | Média, coordenar próxima publicação |
| C15 | Direitos sobre ativos e conteúdo editorial | Cadeia de direitos não comprovada | Alta para conteúdo sem licença demonstrável |
| C16 | Acessibilidade | Conformidade integral não testada | Pendente de auditoria específica |

As prioridades são de remediação, não uma classificação judicial de ilegalidade. Não foi atribuído percentual de conformidade: documentos existentes e testes aprovados não permitem esse cálculo.

## 3. Achados e critérios de encerramento

### C01 — A recusa de analytics não controla toda a coleta

**Confirmado em produção.** Com `sonic_search:privacy:analytics:v1=no`, o navegador criou as chaves `sonic_search:analytics_anonymous:v2` e `sonic_search:analytics_session:v2` e tentou um POST a `/api/beta-events` com `app_session_started`. A tentativa foi bloqueada pela instrumentação; este teste não prova que o backend armazenou esse evento.

No código local, `trackBetaEvent`, em `app.js:28722`, envia identificador persistente, sessão, versão, plataforma e eventos sem consultar a escolha de analytics. A inicialização também chama `trackBetaAppSession`. O banner/rodapé promete que analytics do site só carrega após aceite; a política detalha principalmente Vercel Insights. Um identificador chamado “anonymous” não é, por esse nome, dado irreversivelmente anonimizado.

**Correção:** separar eventos estritamente necessários dos eventos de medição de produto. Para estes, aplicar a escolha de privacidade antes de criar identificadores/enviar eventos, ou documentar outra base legal realmente aplicável e ajustar a comunicação de forma transparente. Não reclassificar automaticamente métricas de engajamento como segurança. Rever também a revogação: `index.html:3294` grava a recusa, mas não contém desligamento explícito de um script de analytics já carregado.

**Responsáveis:** engenharia e privacidade. **Aceite:** testes com escolha ausente, recusa, aceite e revogação, no site e nos dois apps; inventário de cada evento, finalidade, base, retenção e destinatário. Base: transparência, necessidade e responsabilização na [LGPD](https://www.planalto.gov.br/ccivil_03/_ato2015-2018/2018/lei/l13709compilado.htm).

### C02 — A desativação documentada do Deezer não cobre a rota de previews

**Confirmado localmente e em produção.** O diagnóstico público retornou `trackMetadata.providers.deezer=false`. Entretanto, `/api/deezer-preview?id=1600909272` retornou HTTP 302 para `cdnt-preview.dzcdn.net`. O áudio não foi baixado.

`lib/api/_deezer-preview.js:5` usa `SONIC_DEEZER_PREVIEW_ROUTE_ENABLED`, ligada por padrão, e não consulta `SONIC_DEEZER_ENABLED`. O teste isolado confirmou uma consulta ao provedor e um 302 mesmo com esta última flag falsa. `app.js:7274` monta URLs dessa rota para faixas curadas. O registro de aprovações informa que Deezer permanece desligado e pendente; isso não descreve todo o comportamento atual.

**Correção:** unificar os controles de permissão por provedor, fazer o diagnóstico refletir todas as rotas e conferir as permissões contratuais antes de manter a integração. Na ausência de aprovação comprovada, desabilitar o caminho pendente. Não concluo, só pelo 302, que inexiste autorização particular.

**Responsável:** engenharia/proprietário da integração. **Aceite:** flags negativas impedem qualquer consulta ao Deezer em todos os caminhos; aprovação registra conta, termos, finalidade e restrições, quando existente.

### C03 — API pública de iTunes não equivale a licença irrestrita de entretenimento

O frontend contém previews iTunes e o registro interno os trata como aprovados por padrão. A API retorna `trackViewUrl`, mas não localizei na interface examinada a implementação do selo de compra exigido nem a atribuição específica dos previews. A atribuição em `_track-metadata.js:15` se limita a metadados; isso não demonstra atendimento à condição aplicável ao áudio. A amostra no navegador tentou pré-carregar vários previews antes de interação.

Os [termos oficiais da Search API](https://developer.apple.com/library/archive/documentation/AudioVideo/Conceptual/iTuneSearchAPI/index.html) condicionam o conteúdo promocional à promoção da própria obra, link/selo pertinente, crédito para previews e streaming; também restringem usos como entretenimento independente. A avaliação deve abranger swipe, reprodução sucessiva, pré-carregamento e benefícios Premium. A consulta a essa documentação arquivada deve ser complementada pelo contrato efetivamente aplicável à conta/produto.

**Correção:** documentar a compatibilidade do caso de uso, implementar os elementos exigidos, ou usar outro modelo autorizado. **Responsáveis:** jurídico/produto/engenharia. **Aceite:** licença ou enquadramento documentado e teste visual de cada superfície que usa áudio promocional. Não afirmar que qualquer preview curto é automaticamente livre de direitos.

### C04 — Limpar o aparelho não apaga a conta

`app.js:34979` executa `clearAllSonicLocalData()` e recarrega a página. A política oferece contato por e-mail para direitos. As buscas nas rotas de API, frontend e código Swift examinado não localizaram um fluxo de exclusão da identidade de autenticação e dos dados vinculados. Não foi realizado teste destrutivo com conta real.

A [Apple exige iniciar exclusão dentro do app](https://developer.apple.com/support/offering-account-deletion-in-your-app); em apps comuns, exigir e-mail ou chamada não é substituto suficiente. O [Google Play exige os caminhos e declarações aplicáveis à exclusão](https://support.google.com/googleplay/android-developer/answer/13327111?hl=en), inclusive recurso web para apps abrangidos.

**Correção:** fluxo autenticado com confirmação, exclusão/agendamento verificável de Auth, perfil, fotos, Radar, preferências sincronizadas e conteúdo elegível; tratar storage legado, bloqueios, backups e registros que tenham fundamento de retenção. Revogar credenciais Apple quando aplicável e explicar separadamente assinaturas ainda vigentes.

**Responsável:** engenharia/privacidade. **Aceite:** conta de teste excluída ponta a ponta, sessões invalidadas, dados inacessíveis e retenções justificadas, com confirmação ao titular. Apagar tudo indiscriminadamente também seria incorreto.

### C05 — ECA Digital precisa entrar na avaliação atual

`privacy.html:213` afirma que o produto não se dirige a crianças e orienta menores a obter autorização. A documentação de submissão sugere classificação 12+. Não localizei mecanismo de faixa etária, supervisão parental ou avaliação de acesso provável nas superfícies examinadas. O produto oferece recomendações, comunidade, perfis e conteúdo externo.

O [ECA Digital, Lei 15.211/2025](https://planalto.gov.br/ccivil_03/_ato2023-2026/2025/lei/l15211.htm), inclui serviços de acesso provável por crianças/adolescentes. A [ANPD confirma sua vigência desde 17/03/2026](https://www.gov.br/anpd/pt-br/assuntos/noticias/eca-digital-completa-um-ano-e-e-marco-na-protecao-de-criancas-e-adolescentes-na-internet). O cronograma regulatório de implementação não permite presumir dispensa geral das obrigações.

**Correção:** avaliar público real, acesso provável, riscos de conteúdo explícito, exposição social, perfilamento e mecanismos proporcionais de proteção. Definir tratamento por faixa etária e requisitos de supervisão aplicáveis. Um aviso “18+” ou coleta indiscriminada de documentos não resolve sozinho a questão.

**Responsáveis:** jurídico/produto/privacidade. **Aceite:** avaliação documentada, configurações protetivas, declarações coerentes nas lojas e testes das proteções selecionadas.

### C06 — Identidade do fornecedor incompleta

Os termos públicos se identificam como “Pedro Freire / CBK Labs”, sem CPF/CNPJ aplicável, nome empresarial completo nem endereço comercial. Não se deve inferir destes nomes a existência de uma sociedade ou sua regularidade.

O [Decreto 7.962/2013, art. 2º](https://planalto.gov.br/ccivil_03/_ato2011-2014/2013/decreto/d7962.htm), exige informações claras do fornecedor na oferta eletrônica. O e-mail pessoal não é ilegal por si; o problema demonstrável é a identificação incompleta e a falta de evidência de operação do atendimento.

**Responsável:** titular da operação/jurídico/contador. **Aceite:** identidade e endereço válidos, coerentes nos documentos públicos, checkout, lojas, faturamento e contratos. Não inventar CNPJ ou publicar endereço pessoal sem definir o fornecedor correto.

### C07 — Assinaturas: arrependimento, reembolso e prova de contratação

Há informação de renovação, trial e gestão de assinatura. Porém, a rota de cobrança só expõe planos, checkout, portal e transação Apple (`api/billing.js`); o checkout em `_billing-store.js:351` não registra versão/hash dos termos nem traz configuração explícita de coleta de aceite. Não foi comprovado um procedimento operacional equivalente fora do código. Os termos remetem genericamente ao processador para reembolsos.

É necessário distinguir cancelamento de renovação, arrependimento e reembolso por problema. O [CDC, art. 49](https://www.planalto.gov.br/ccivil_03/leis/l8078compilado.htm), prevê prazo de sete dias nas hipóteses de contratação fora do estabelecimento; trial comercial não substitui esse direito. Os arts. 4º e 5º do [Decreto 7.962/2013](https://planalto.gov.br/ccivil_03/_ato2011-2014/2013/decreto/d7962.htm) tratam de confirmação, contrato conservável, atendimento e arrependimento.

**Correção:** desenhar e testar o fluxo por canal; apresentar oferta completa; registrar a versão contratual aplicável e disponibilizar cópia; confirmar pedidos de atendimento; executar cancelamento/estorno quando devido. Revisar também cláusulas amplas de alteração sem aviso e limitação de responsabilidade frente ao plano pago.

**Aceite:** compra e atendimento em sandbox com documentos e trilha verificável. **Responsáveis:** produto/engenharia/suporte/jurídico. Manter cobrança desativada até a conclusão.

### C08 — Regularidade fiscal não pode ser verificada pelo repositório

Não foram apresentados entidade vendedora, município, regime, enquadramento da atividade, inscrição municipal, amostras de NFS-e ou conciliação. A auditoria de 02/09 já registrava essa pendência. Não há base para concluir que tributos estão pagos ou em atraso, nem para escolher MEI, CNAE ou alíquota.

**Correção:** contador deve validar entidade, atividade real, emissão fiscal, tratamento de receitas de assinatura/apoio, estornos e conciliação Stripe/Apple/Google. Recibo de pagamento não comprova por si o cumprimento fiscal.

Atualização relevante: a [Receita Federal informa NFS-e nacional obrigatória para ME/EPP do Simples a partir de 01/11/2026, com regras de CBS/IBS para esse grupo a partir de 2027](https://www.gov.br/receitafederal/pt-br/assuntos/noticias/2026/agosto/simples-nacional-nfs-e-nacional-sera-obrigatoria-para-me-e-epp-a-partir-de-1o-de-novembro-de-2026). A aplicabilidade depende do enquadramento; não transportar automaticamente exigências de outro regime para o Sonic.

**Aceite:** validação contábil identificada, cadastros e emissão/conciliação de teste aprovados, além de conferência da operação passada se já houve receita.

### C09 — Governança de dados, atendimento e incidentes não comprovados

A política lista várias bases legais em bloco (`privacy.html:150`) e usa retenções abertas, como duração do relacionamento (`:187`). Não localizei no conjunto documental analisado inventário final de tratamentos, teste de legítimo interesse quando pertinente, tabela de retenção, procedimento de direitos ou plano de incidentes em operação. O código e a existência da política não substituem esses registros. A [LGPD](https://www.planalto.gov.br/ccivil_03/_ato2015-2018/2018/lei/l13709compilado.htm) fundamenta esta necessidade de governança e demonstração.

**Correção:** mapear dado → finalidade → base → fornecedor → retenção → acesso → exclusão; definir responsável e canal; preparar resposta a incidentes e testar uma solicitação de titular. Avaliar guarda de registros de acesso quando a operação se enquadrar no [Marco Civil, art. 15](https://www.planalto.gov.br/ccivil_03/_ato2011-2014/2014/lei/l12965.htm), sem confundir esses registros com analytics de engajamento.

A comunicação de incidentes com risco/dano relevante tem regra geral de [três dias úteis](https://www.gov.br/anpd/pt-br/canais_atendimento/agente-de-tratamento/comunicado-de-incidente-de-seguranca-cis). Há tratamento diferenciado para [pequenos agentes efetivamente enquadrados](https://www.gov.br/anpd/pt-br/acesso-a-informacao/institucional/atos-normativos/regulamentacoes_anpd/resolucao-cd-anpd-no-2-de-27-de-janeiro-de-2022); não presumir automaticamente prazo em dobro ou dispensa de encarregado.

**Responsáveis:** operação/privacidade/segurança. **Aceite:** documentos aprovados, responsáveis definidos e simulação registrada de incidente e pedido de acesso/exclusão.

### C10 — Transferências internacionais sem comprovação do mecanismo

A política menciona provedores globais (`privacy.html:220`), mas não identifica países, cadeia de operadores e fundamento por transferência. DPAs, regiões contratadas e suboperadores não foram disponibilizados.

**Correção:** reunir contratos aplicáveis de Supabase, Vercel, Stripe, Apple, Google, IA e demais destinatários; separar papéis de controlador/operador; mapear transferências subsequentes e medidas de transparência. As cláusulas-padrão são uma das alternativas, não a única. A [ANPD informa o regulamento de transferências e o reconhecimento de adequação da União Europeia pela Resolução 32/2026](https://www.gov.br/anpd/pt-br/assuntos/assuntos-internacionais/transferencia-internacional-de-dados). Adequação da UE não regulariza automaticamente processamento em qualquer outro país.

**Responsáveis:** jurídico/privacidade/compras. **Aceite:** mecanismo aplicável comprovado para cada fluxo, contratos arquivados e política consistente com a operação.

### C11 — Registro de APIs não demonstra licenças comerciais

O diagnóstico público declarou Last.fm, SoundCloud, Spotify, YouTube, MusicBrainz, Discogs e outras integrações habilitadas. Isso é declaração de configuração, não confirmação de funcionamento ponta a ponta ou licença. O registro `docs/api-approvals.md` associa várias aprovações à existência de credenciais e cuidados técnicos, sem evidência contratual específica.

Dois pontos concretos:

- **Last.fm:** seus [termos de API](https://www.last.fm/api/tos) pedem contato prévio para uso comercial. A documentação local só exige chave própria. Solicitar evidência do acordo ou delimitação de uso autorizada; não inferir autorização pela chave.
- **MusicBrainz:** `_artist-profile.js:239` usa tags para inferir gênero e `:260` solicita `tags+aliases`. A [licença](https://musicbrainz.org/doc/About/Data_License) distingue dados centrais CC0 de suplementares. A [classificação oficial](https://musicbrainz.org/doc/MusicBrainz_Database) inclui tags e associações de gênero nos dados suplementares sujeitos a CC BY-NC-SA. Revisar licença comercial ou retirar esse subconjunto quando incompatível com a exploração pretendida.

Para os demais, registrar finalidade, monetização, cache, atribuição, obras/imagens, uso por IA e limites. Os [termos SoundCloud](https://developers.soundcloud.com/docs/api/terms-of-use) condicionam os usos permitidos. Para YouTube, validar fonte, tamanho/visibilidade do player, tratamento de anúncios e ausência de cobrança pelo vídeo embutido conforme as [políticas oficiais](https://developers.google.com/youtube/terms/developer-policies). Não foi demonstrada nesta auditoria uma violação de player oculto.

**Responsável:** proprietário de cada integração/jurídico. **Aceite:** matriz assinada ou validada com evidência por provedor e testes dos requisitos aplicáveis, incluindo C02/C03.

### C12 — As declarações das lojas e o fluxo de pagamento ainda precisam de prova

Há implementação de compra/restauração Apple, documentação de login Apple/Google e código de assinatura verificada. O backend público retornou `enabled=false`, `webConfigured=false` e `appleConfigured=false`. Isso não determina se existem produtos ou vendas históricas nos painéis das lojas.

`PrivacyInfo.xcprivacy` declara arrays vazios de dados coletados/APIs e `Tracking=false`; o produto tem recursos remotos. O manifesto agregado, as respostas App Privacy/Data safety e a política devem ser reconciliados com o binário final. Analytics interno não equivale automaticamente a tracking na definição da Apple; não concluir necessidade de ATT apenas por C01.

O build Android (`scripts/build-android-web.mjs`) reutiliza o bundle iOS com substituições textuais. Isso não demonstra integração Google Play Billing nem garante termos de assinatura corretos para Android.

**Correção/aceite:** validar binários reais, login, exclusão, privacidade, faixa etária e moderação; testar compra/restauração/expiração/reembolso em sandbox. Aplicar as [regras Apple](https://developer.apple.com/app-store/review/guidelines/) e a [política de pagamentos Google Play](https://support.google.com/googleplay/android-developer/answer/10281818?hl=en), incluindo exceções regionais efetivamente disponíveis. Não presumir uma proibição global idêntica de links externos em todas as vitrines. Sem integração/autorização aplicável, manter compra digital inativa nesse canal.

### C13 — A expansão internacional precisa de decisão formal

Os planos públicos de demonstração contêm BRL, EUR e USD; os termos reconhecem outras jurisdições. Isso sugere intenção internacional, mas não prova vendas em outro país. O checkout local não contém restrição de país nem configuração explícita de tributação automática; configurações externas não foram inspecionadas.

**Correção:** definir territórios reais de marketing, usuários e venda; regularizar obrigações ou restringir a oferta. Para serviços B2C na UE, avaliar IVA e [Non-Union OSS](https://europa.eu/youreurope/business/finance-and-tax/vat/one-stop-shop/index_en.htm). O [GDPR pode alcançar empresa fora da UE que ofereça serviços, inclusive gratuitos, ou monitore comportamento de pessoas na UE](https://commission.europa.eu/law/law-topic/data-protection/reform/rules-business-and-organisations/application-regulation/who-does-data-protection-law-apply_en). A mera acessibilidade global do site não basta, isoladamente, para todas essas conclusões.

**Responsáveis:** direção/jurídico/contador. **Aceite:** matriz por território, preços/impostos e contratos coerentes; prova do papel de eventual merchant of record. Stripe comum não deve ser presumida substituta de todas as obrigações do vendedor.

### C14 — Versão local e versão publicada divergem

A política pública de privacidade está datada de **11/09**; a local, **14/09**, acrescenta editor de perfil, fotos e controles de visibilidade. Os hashes das páginas iniciais também diferem. Termos e Cookies coincidiram byte a byte. Não foi comprovado que o editor novo já esteja ativo em produção; portanto, a divergência não demonstra, sozinha, coleta não informada desse recurso.

**Correção:** vincular release a versão contratual, política, migrations, flags, bundle e declarações das lojas. **Responsável:** engenharia/produto. **Aceite:** captura de cada ambiente e canal confirmando correspondência entre funções habilitadas e documentos. Publicar a política coordenadamente com o recurso, sem presumir que editar um arquivo local atualiza o site.

### C15 — Conteúdo, autoria e moderação precisam de evidência operacional

O catálogo usa capas, previews, notícias, resumos/traduções e dados externos. `assets/image-bank/README.md` é um guia técnico, não uma cadeia de titularidade. Não foram apresentados contratos de cessão/licença dos ativos, inventário completo de componentes/fontes, pesquisa de marca ou permissões de conteúdo editorial. A ausência destes arquivos não prova que os direitos inexistam.

A [Lei de Direitos Autorais](https://www.planalto.gov.br/ccivil_03/leis/l9610.htm) disciplina autorização e exceções; atribuição de fonte, RSS público ou transformação por IA não demonstram automaticamente licença de republicação. Para cada conteúdo, preservar origem, autor/licença, condições, transformações e fundamento do uso. Não se conclui automaticamente necessidade ou dispensa de ECAD sem qualificar a reprodução/comunicação musical efetiva.

Existem filtro textual, denúncias e bloqueio; o teste UGC passou. `_ugc-safety.js` grava denúncias em storage privado, mas não comprova triagem humana, responsável, prazo ou solução. Implementar fila/rotina auditável de atendimento, retirada e contestação. Rever o procedimento conforme a tese atual do [STF no Tema 987](https://portal.stf.jus.br/processos/detalhe.asp?incidente=5160549), sem pressupor que toda remoção depende de ordem judicial.

**Responsáveis:** editorial/moderação/jurídico. **Aceite:** amostra rastreável de licenças, processo de denúncias testado, responsabilidades contratuais e titularidade de código/marca documentadas. Auditoria de toda a base exige inventário específico adicional.

### C16 — Acessibilidade não certificada

Foram observados rótulos ARIA e botões na marcação, mas isso não comprova navegação por leitor de tela, foco, contraste, zoom, movimento reduzido ou acesso a formulários/contratação. Não foi executada auditoria WCAG nem teste assistivo completo.

**Correção/aceite:** revisão manual e automatizada dos fluxos de descoberta, conta, consentimento, suporte e cobrança, em web/iOS/Android, com correção e registro. A [Lei Brasileira de Inclusão, art. 63](https://legis.senado.leg.br/norma/584958/publicacao/34619049), prevê acessibilidade de sites nas hipóteses legais. **Responsável:** produto/engenharia. Tratar como evidência pendente, não como falha específica comprovada.

## 4. Controles positivos e limites da validação

| Controle observado | Evidência | Limite |
| --- | --- | --- |
| Cobrança desligada no backend público | GET `/api/billing`, HTTP 200, `enabled=false` | Não verifica receitas históricas ou painéis das lojas |
| Documentos legais acessíveis | Três páginas retornaram HTTP 200 | Existência não significa suficiência jurídica |
| Contexto de conta exige login | GET sem credencial retornou 401 | Uma rota não prova segurança de todas as APIs |
| Headers de proteção | Headers capturados e `vercel.json` | Não substituem pentest; CSP inclui permissões amplas |
| Restrições de origem e token beta | Teste de segurança aprovado | CORS não é autorização de usuário |
| Filtro UGC, armazenamento de denúncias e bloqueio | Teste UGC aprovado | Não comprova cobertura de abuso nem atendimento |
| Proteção contra replay de foto pública/OAuth | Teste de superfícies de perfil aprovado | Não comprova configuração de produção |
| Isolamento de perfis e bucket privado na migration | Teste SQL em PostgreSQL local aprovado na repetição | Não prova que a migration esteja aplicada em produção |
| Segredos conhecidos não localizados na amostra frontend | Manifesto da busca limitada | Não abrange histórico, todas as credenciais ou configuração remota |

## 5. Testes executados

Os testes foram executados com ambiente reduzido, sem carregar `.env.local`. As integrações dos testes selecionados são simuladas ou locais; não houve compra nem gravação deliberada em conta de produção.

| Teste existente | Primeira execução |
| --- | --- |
| `scripts/test-request-security.mjs` | Aprovado |
| `scripts/test-ugc-safety.mjs` | Aprovado |
| `scripts/test-user-profile-privacy-surfaces.mjs` | Aprovado |
| `scripts/test-billing-foundation.mjs` | Não concluído em 120 segundos |
| `scripts/test-user-profile.mjs` | Não concluído em 120 segundos |
| `scripts/test-user-profile-sql.mjs` | Não concluído em 120 segundos |

Timeout não é aprovação nem, isoladamente, evidência de defeito no produto. Ver [saída integral da primeira execução](../reports/legal-audit-2026-09-22/local-tests.json). Na [repetição dos três testes inconclusivos](../reports/legal-audit-2026-09-22/local-tests-retry.json), o teste SQL de privacidade de perfil passou; cobrança e perfil continuaram sem concluir em 120 segundos, sem saída diagnóstica. Resultado final: **quatro testes aprovados e dois inconclusivos**. A causa dos timeouts não foi estabelecida; estes dois controles permanecem sem validação completa.

Além desses testes: a recusa de analytics foi reproduzida no navegador com a versão publicada; o desvio de flag Deezer foi reproduzido com mock local e a rota pública respondeu 302. Esses dois achados não dependem de os testes inconclusivos passarem.

## 6. Plano de regularização

| Ordem | Entrega | Responsável sugerido | Evidência para encerrar |
| --- | --- | --- | --- |
| Imediata | Corrigir governança de analytics e flags Deezer; revisar autorização dos previews | Engenharia + privacidade + jurídico | Casos negativos de consentimento/flags e matriz de uso autorizado |
| Antes de nova submissão | Exclusão remota, declarações das lojas, avaliação de menores | Engenharia + produto + jurídico | Testes com conta fictícia, binários revisados e documentação coerente |
| Antes da primeira cobrança | Fornecedor, fiscal, contratos, arrependimento e licenças comerciais | Titular + contador + jurídico | Identificação pública, emissão fiscal e jornada sandbox aprovadas |
| Antes de direcionar/vender fora do Brasil | Países, tributos e privacidade internacional | Direção + especialistas competentes | Matriz territorial e controles de oferta |
| Antes de declarar conformidade integral | DPAs, retenção, incidentes, moderação, direitos de ativos, acessibilidade e segurança remota | Operação + áreas responsáveis | Dossiê de evidências e verificação das correções |

Para fechar as pendências documentais, reunir: dados do fornecedor e município; lista de países/público-alvo; confirmação de receitas já recebidas; cadastros/relatórios fiscais; contratos de fornecedores e licenças; exports das declarações das lojas; procedimentos e registros de suporte, direitos de titulares e moderação; documentos de titularidade e contratações da equipe. Tratar esses documentos em ambiente restrito, sem inserir segredos no repositório.

**Decisão recomendada nesta data:** manter a cobrança desativada; corrigir C01/C02 e revisar C03 no serviço existente; concluir exclusão, proteção de menores e evidências contratuais antes de ampliar a operação. Gratuidade, API funcionando ou aprovação de loja não constituem prova geral de legalidade.
