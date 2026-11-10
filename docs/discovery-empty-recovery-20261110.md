# Recuperação de uma descoberta sem resultado — web

Quando a busca não entrega uma nova gravação, Descobrir mantém um aviso junto da carta atual. O usuário pode tentar novamente ou abrir a aba de filtros. Abrir os filtros não escolhe outro estilo, não limpa preferências e não reinicia o histórico. A disponibilidade de áudio não vira uma afirmação de gênero incorreto.

O aviso usa a linguagem atual em português, inglês e espanhol, mostra o estilo escolhido quando houver e mantém uma única ação principal. O retry acompanha a operação em andamento e bloqueia cliques duplicados. Uma entrega posterior confirmada remove o aviso; a troca de sessão também o remove, e uma resposta da sessão anterior não pode recuperá-lo. Os caminhos de primeira faixa, busca manual, surpresa, fila e reação reutilizam a mesma apresentação. O caminho de artista já conhecido conserva a carta anterior quando não encontra outra opção, mantendo o feedback já registrado.

As funções puras `recommendationFailureMessage` e `noVerifiedTrackMessage` continuam sem efeitos de apresentação. O helper de apresentação recebe a geração capturada no início da ação assíncrona. Não houve mudança de scoring, gates de gênero/BPM, fontes do catálogo, importações ou APIs.

## Validação

`scripts/test-recommendation-recovery-ui.mjs` carrega o HTML, o app e os estilos reais em Chromium, com os fornecedores externos bloqueados. Mantém uma gravação do catálogo local e esvazia o catálogo do navegador de teste para executar a busca manual real sem candidatos. Confere igualdade da carta, filtros e histórico antes/depois; navegação explícita para filtros; retry real com clique duplo; remoção do aviso no registro de uma apresentação posterior; respostas antigas após troca de sessão; PT/EN/ES e controles de pelo menos 44 px em 375 e 1440 px. As capturas aguardam a saída do overlay de busca. O caso de resposta antiga usa uma promessa controlada no teste, e o caso de sucesso exerce o hook real de registro de apresentação; não afirma validação de áudio de fornecedor.

Também foram executados os contratos de primeira recomendação, calibração/resultado, segurança dos filtros e rotação de abertura com catálogo real offline. A fixture isolada da calibração recebeu o novo adapter de apresentação de falha para manter seu escopo de teste. Nenhum arquivo minificado ou bundle nativo foi gerado nesta entrega.
