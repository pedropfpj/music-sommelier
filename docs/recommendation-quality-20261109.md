# Qualidade das recomendações — 9 de novembro de 2026

Esta alteração reduz a repetição de artistas e gravações nos fluxos de descoberta. O diagnóstico do motor passa a `hybrid-hierarchical-v3-history-variety`. O identificador do pacote web é definido no build integrado de publicação.

## Correções

- O histórico de exposição deixa de usar o limite de 240 entradas dos mapas de aprendizado. Artistas, faixas e identificadores de gravação preservam suas 12.000 entradas mais recentes por conjunto ao salvar e recarregar o perfil. As exclusões explícitas continuam separadas.
- A fila mantém a gravação atual como âncora, mas não volta a preencher os próximos cartões com músicas ou artistas já apresentados. Colaborações e identificadores da gravação ajudam a evitar duplicatas dentro da própria fila.
- A ativação de um cartão revalida o histórico e o BPM. Uma fila criada antes de o usuário ouvir determinada gravação não pode voltar a entregá-la depois.
- A busca por estilo/BPM e a substituição de áudio indisponível respeitam o bloqueio de artistas apresentados. O esgotamento não habilita automaticamente a opção interna de artistas conhecidos, nem apaga os ciclos de exposição. O cartão anterior é preservado quando não há substituição válida.
- O seletor de descoberta preserva as diferenças reais entre as notas de qualidade e preferência, em vez de empatar todas as notas acima de oito. Rejeições rígidas são descartadas antes da variação aleatória.

A opção interna explícita `allowKnownFallback` continua disponível: permite outra gravação de um artista conhecido, respeitando gravações já ouvidas, artistas recentes e bloqueios explícitos. Os caminhos normais de descoberta e recuperação de áudio não a habilitam automaticamente.

## Primeira sugestão

A rotação instantânea usa diretamente as gravações elegíveis com áudio pronto, sem cair sempre no primeiro item de uma lista fixa. No catálogo desta versão, esse conjunto contém 17 gravações em 16 estilos. Para um perfil com sinais de gosto, a rotação fica restrita a candidatos próximos em afinidade e qualidade; filtros manuais e calibração explícita mantêm prioridade. Sem esses sinais, trata-se de variedade de abertura, sem alegar personalização.

O pedido do índice global começa depois da ativação da identidade. Um toque muito cedo continua iniciando o áudio de forma síncrona com o índice local; a resposta atrasada não altera o cartão nem o índice já usado. O caminho inicial assíncrono aguarda o pedido por um tempo limitado. O histórico alternativo em sessionStorage é lido com a mesma chave do perfil, sem misturar contas. No servidor, falhas do Redis permitem tentar o Supabase; respostas inválidas não são interpretadas como índice zero.

A busca filtrada e a conclusão da calibração só anunciam sucesso após uma faixa elegível ser realmente apresentada. Respostas de um pedido anterior, após troca de perfil ou filtros, são descartadas.

## Validação

`npm run test:recommendation-quality` executa regressões de ranking, gravação e recarga do histórico, recuperação de áudio, esgotamento e fila. Os testes exercitam as funções reais do aplicativo; provedores e efeitos de apresentação são isolados quando necessário.

`npm run test:cold-start-opening`, `node scripts/test-opening-store-recovery.mjs` e `node scripts/test-calibration-result-contract.mjs` verificam a rotação sobre o catálogo real, o efeito de sinais opostos de gosto, o toque antecipado, os retornos atrasados, a recuperação entre armazenamentos e a confirmação de resultado. A rotação distribui um conjunto finito e não garante uma faixa inédita para cada pessoa.

O benchmark usa gravações do catálogo em sete estilos: psycore, dark psy, hi-tech, slambient, techno, house e drum and bass. As três rotas de seleção compartilham o mesmo histórico e entregam 21 recomendações sem repetir artista, colaborador ou faixa. Depois de registrar as demais opções como apresentadas, as três rotas retornam ausência de candidato, sem limpar a memória para fabricar variedade.

As verificações de segurança de recomendações, identidade de gravações, separação de perfis, primeira recomendação e orçamento de busca continuam aplicáveis. `node scripts/product-verify.mjs` executa o gate geral do produto.

## Limites

- A correção não recupera exposições que versões anteriores deixaram de salvar depois do limite de 240 entradas.
- O catálogo é finito. Um estilo com poucos artistas pode esgotar as opções novas; a alteração não amplia o catálogo nem promete áudio permanentemente disponível nos provedores.
- Os testes de persistência usam o armazenamento local por perfil; não comprovam sincronização entre dispositivos.
- Esta alteração prepara o código web. A publicação integrada é uma etapa separada; esta correção não pede distribuição de um novo pacote nativo.
