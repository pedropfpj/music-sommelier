# Continuidade e confiabilidade do catálogo

Esta correção trata o acesso ao catálogo adicional como leitura paginada, sem alterar os critérios de gênero, subgênero, artista, gravação ou BPM.

## Problemas reproduzidos

- A API examinava até 200 linhas e depois aplicava os filtros de integridade. O cliente usava o tamanho já filtrado para decidir que o catálogo tinha terminado. Uma primeira página inteira recusada podia esconder gravações verificadas na página seguinte.
- Uma indisponibilidade temporária marcava o estilo como importado. A promessa da leitura também permanecia no cache, impedindo nova tentativa.
- Uma janela de quatro páginas por estilo era tratada como catálogo completo mesmo quando ainda existiam páginas. Uma falha após resultados parciais também não tinha continuação explícita.

## Comportamento corrigido

A API informa se existem mais páginas com base nas linhas examinadas antes dos filtros. As faixas recusadas continuam recusadas. O cliente conserva a janela limitada por chamada e avança a partir do último offset confirmado na próxima hidratação. Uma falha parcial repete somente a página que não foi concluída; uma falha inicial pode ser tentada novamente. Chamadas simultâneas continuam compartilhando a mesma leitura.

O estado completo só é gravado quando a API indica o final real. A fronteira administrativa de offset da API continua limitada e não é apresentada como esgotamento de todo o acervo. Respostas antigas, sem metadados de paginação, continuam compatíveis. Uma resposta inválida do banco é erro, não uma lista vazia definitiva.

Isto permite encontrar gravações que já existiam nas páginas seguintes; não constitui uma importação de novas faixas nem uma promessa de catálogo infinito ou de áudio permanentemente disponível.

## Validação

`node scripts/test-catalog-pagination.mjs` exercita a API real e as funções reais do app com páginas públicas de música fictícias, sem rede externa. Cobre a primeira página toda recusada seguida de uma gravação permitida, preservação dos filtros de integridade, resposta inválida, erro inicial, erro após página parcial, continuação após uma janela, concorrência, fronteira de varredura e compatibilidade com respostas antigas.
