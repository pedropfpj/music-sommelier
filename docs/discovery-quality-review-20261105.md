# Revisão de descoberta — 5 de novembro de 2026

As correções abaixo estão implementadas no código e no pacote local iOS **1.1.0 (26)**. Esta revisão não envia o aplicativo à Apple nem promove uma implantação de produção. A interface continua somente com eletrônica.

O destino de backup/revisão no GitHub é `codex/discovery-quality-20261105`. O `vercel.json` desabilita deploy automático especificamente para essa branch, usando a [configuração oficial da Vercel](https://vercel.com/docs/project-configuration/git-configuration#git.deploymentenabled), para preservar o trabalho social ainda não ativado sem publicar APIs incompatíveis com o banco atual. A branch remota anterior não recebe este push.

## Correções

- O histórico automático bloqueia a gravação apresentada, sem excluir músicas de outros artistas só por terem o mesmo título. O caso de regressão usa “Eclipse”, de Apoptygma Berzerk e de Hardwell. Exclusões digitadas pelo usuário continuam separadas.
- Identificadores de gravação ISRC e MusicBrainz, quando disponíveis, ajudam a reconhecer reedições. Eles são armazenados separadamente para não aumentar artificialmente o contador de faixas apresentadas. Remixes não são agrupados por adivinhação.
- Colaborações reconhecem variantes com `&`, `and`, entidades HTML e créditos de participação. Nomes conjuntos conhecidos, como Above & Beyond, permanecem uma identidade própria.
- “Outra faixa” mantém o estilo e os filtros explicitamente escolhidos. O caminho rápido não recicla uma faixa já apresentada quando esgota o conjunto disponível.
- A busca filtrada e suas tentativas de substituição compartilham oito segundos de espera por provedores, com até 1,2 segundo por tentativa. O limite não inclui todo processamento, renderização ou carregamento de mídia. Uma falha preserva a faixa anterior e libera os controles.
- Minimal/Deep Tech aceita até 130 BPM: o limite anterior de 128 descartava duas gravações cuja classificação e andamento foram confirmados no distribuidor.
- Os rascunhos da loja deixaram de anunciar assinaturas desativadas e passaram a destacar descoberta, biblioteca e filtros.

## Variedade adicionada

Foram incluídas **21 gravações de 16 créditos de artistas**, priorizando estilos que tinham apenas dois créditos no catálogo. Cada inclusão tem a gravação exata da Apple, prévia HTTP validada e fonte editorial de gênero preservada.

| Subgênero | Faixas antes → depois | Créditos de artistas antes → depois |
| --- | ---: | ---: |
| Disco House | 30 → 34 | 2 → 5 |
| Future Bass | 30 → 34 | 2 → 5 |
| Minimal / Deep Tech | 30 → 35 | 2 → 5 |
| Tech Trance | 30 → 35 | 2 → 6 |
| Trap | 30 → 33 | 2 → 5 |

O catálogo gerado contém 9.253 linhas por subgênero, distribuídas por 169 estilos. Essa contagem não é uma promessa de gravações únicas ou de disponibilidade permanente de áudio. Parte das rotas antigas depende de provedores externos; o teste exige ao menos três artistas imediatamente disponíveis por estilo, sem afirmar que todas as entradas antigas continuam tocáveis.

Fontes, escolhas e justificativas: [seleção v23](../data/discovery-expansion-selection-v23.json). Evidência da verificação de identidade e áudio: [relatório do catálogo](../reports/quality-20261105/catalog-validation.json). A classificação fina é editorial, apoiada por fontes de selos, artistas e distribuidores; não é apresentada como taxonomia fornecida pela Apple.

## Verificação

- **61 suítes passaram**, conforme [resultados](../reports/quality-20261105/regression-results.json). O relatório identifica os cinco scripts não executados nesta rodada, incluindo os testes remotos extensos e duas automações de navegador substituídas por revisão via navegador controlado.
- As funções reais de importação aceitaram as 21 novas faixas. As funções reais de seleção e registro completaram **100 rodadas por estilo: 1.700 descobertas**, sem repetição de gravação ou artista, nem troca de estilo, dentro de cada rodada. Ao esgotar o conjunto, o seletor retorna ausência de candidato.
- A gravação e leitura reais do progresso preservaram IDs, exclusões explícitas e separação entre perfis. O reset de sessão também limpa as duas memórias de gravação.
- Um teste do gerador real com provedores que nunca respondem completou sete tentativas em um orçamento simulado de oito segundos, sem substituir o cartão anterior por uma faixa não verificada.
- Na revisão manual do pacote iOS em navegador: COEO → Art of Tones manteve Disco House; o estado esgotado liberou os controles; a biblioteca preservou a curtida após recarregar e encontrou Jan Jelinek pela busca. A largura de 320 px não apresentou transbordamento horizontal. [Captura da biblioteca](../reports/quality-20261105/library-320.png).
- O arquivo Release do Xcode foi reconstruído e sua assinatura local verificada. Os arquivos JavaScript de `www`, da cópia nativa e do archive têm o mesmo SHA-256. [Verificação do archive](../reports/quality-20261105/archive-verification.json). Não houve exportação de IPA ou upload.

## Limites e próximos requisitos da publicação

1. A alteração paralela de comentários e curtidas de faixas/vídeos foi preservada em um commit separado. Sua ativação ainda depende de staging, inventário/reconciliação de comentários legados e verificação real com duas contas no web app e iPhone. Nenhuma migração remota foi executada. Ver [plano de ativação social](track-video-social-activation.md).
2. A compilação e a revisão do bundle no navegador não substituem teste físico de áudio, login Apple/Google e comportamento autenticado no iPhone. A compilação do simulador foi exercitada; não houve teste manual de dispositivo físico nesta revisão.
3. O estado antigo não distinguia títulos digitados de títulos adicionados automaticamente. A migração arquiva os valores originais e mantém títulos sem correspondência como exclusões explícitas. Quando um título foi digitado e também ouvido, a intenção histórica não pode ser reconstruída com certeza.
4. A deduplicação por ISRC/MusicBrainz só se aplica a faixas que trazem esses identificadores. As demais continuam protegidas por artista e título, sem prometer identificação universal de reedições.
5. URLs de prévia externas foram verificadas em 5 de novembro; podem mudar ou ficar indisponíveis. BPM exato foi incluído somente nos cinco registros de Minimal/Deep Tech com fonte correspondente.
6. Na consulta de 4 de novembro, a Apple exigia que o titular revisasse um contrato atualizado. Nenhum contrato foi aceito. Textos, capturas finais e estado de produção ainda precisam ser reconciliados antes da submissão. Ver [pacote da App Store](appstore-submission-pack.md).

As melhorias de descoberta estão concluídas para revisão; os requisitos de publicação acima permanecem pendentes.
