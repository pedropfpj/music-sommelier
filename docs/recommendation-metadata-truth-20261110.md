# Evidência dos metadados de recomendação — 10/11/2026

Revisão das funções reais e do catálogo local no código-base `4a6aa8d`, com APIs e provedores externos bloqueados no navegador de teste. Foram corrigidos dois casos de falta de dados que o cliente transformava em afirmações.

1. **Vocais e contextos inventados na importação.** A linha existente de Calvin Harris — “Feel So Close” não informa presença vocal nem contexto. O importador atribuía `instrumental` e sete contextos a ela, e o score premiava a correspondência instrumental. Os [créditos de distribuição da Qobuz](https://www.qobuz.com/us-en/album/feel-so-close-calvin-harris/0886443135505) identificam Calvin Harris como vocalista na gravação e distinguem a versão instrumental. Agora os valores ausentes são `unknown` e `[]`; um campo vocal desconhecido recebe o mesmo tratamento para pedidos vocais e instrumentais. Valores editoriais explícitos continuam passando pelo builder, importação e cache. O cache antigo é reparado sem remover gravações ou IDs de áudio, e evidência explícita posterior pode completar uma entrada desconhecida.
2. **Notas operacionais e álbuns apresentados como biografia/gravadora.** `artistProfileHint` podia virar identidade do artista, incluindo textos como “Top track Deezer” e “foi curado para ampliar...”. Daft Punk — “One More Time” recebia a atribuição “gravadora Discovery”, embora a [discografia oficial do Daft Punk](https://daftpunk.com/discovery/) identifique Discovery como álbum e inclua essa faixa. O fallback agora apresenta contexto musical geral, respeita a certeza do estilo e declara a ausência de biografia verificada. Descrições dinâmicas sem referência biográfica deixam de ser publicadas como fatos. Os perfis editoriais já existentes e a hidratação por APIs com atribuição são preservados. Um campo `label` de papel incerto aparece como referência do lançamento, sem convertê-lo automaticamente em gravadora.

Não foi demonstrada uma classificação musical incorreta que justificasse alterar os gates de gênero, os artist anchors ou os pesos do ranking nesta revisão. `estimated` indica evidência incompleta; não prova que uma faixa pertença a outro gênero. A correção não adiciona nacionalidades, datas, estatísticas, fontes de gênero ou análise de áudio.

## Validação

- `scripts/test-recommendation-metadata-truth.mjs`: executa o app real em Chromium, o builder real e linhas reais afetadas. Cobre ausência de dados, score sem falsa correspondência, metadados editoriais locais e Catalog Extra, entrada inválida, cache antigo, duas recargas, enriquecimento posterior sem duplicação, rotas de áudio e os textos renderizados em português, inglês e espanhol.
- No código anterior, o teste falha com `instrumental !== unknown`; com a correção, passa.
- Passaram também segurança das recomendações, ranking, isolamento de conta, auditoria eletrônica, prioridade de players/proveniência e variedade: sete estilos reais, 21 entregas sem repetir artista ou faixa, com encerramento por esgotamento.
- O rebuild isolado manteve **9.605 linhas, 169 estilos e 2.028 entradas core**, sem alterar os JSONs gerados. As fontes atuais não trazem campos explícitos `vocals`/`context`; os aliases novos permitem preservá-los quando forem fornecidos.

## Limites

Metadados desconhecidos oferecem menos evidência de compatibilidade com pedidos vocais ou de contexto. A solução mantém esse limite visível em vez de preencher o catálogo com respostas inventadas. Prévia, gravação exata, histórico, avaliações pessoais, scoring e filtros de gênero não foram reescritos. Disponibilidade de áudio externo e a veracidade integral dos perfis editoriais anteriores não são comprovadas por este teste offline.
