# Indicação de seleção curta por estilo — web

O seletor de subgênero recebe uma indicação discreta quando o recorte carregado tem menos de seis artistas distintos com gravações elegíveis e classificação de estilo `confirmed`. A contagem usa as funções atuais de elegibilidade e certeza do estilo, sem mudar os critérios musicais. Artistas são deduplicados pela identidade normalizada já usada pelo app.

A indicação só é calculada depois de a leitura do shard daquele estilo concluir e sua importação normal finalizar. Uma amostra do core, uma leitura pendente ou uma falha de rede não significam zero opções confirmadas. Se o loader de runtime não estiver disponível, o indicador também fica oculto: os flags legados não distinguem com segurança uma leitura vazia de uma falha. Um recorte completo sem entradas confirmadas recebe um texto próprio, que não declara ausência de opções no catálogo inteiro. O número descreve apenas o recorte carregado, sem prometer disponibilidade de áudio, correspondência com outros filtros ou cobertura total.

O texto fica associado ao seletor por `aria-describedby`, com atualização `role=status`, fora do balão descartável de descrição do gênero. Uma resposta atrasada não pode substituir a indicação de outro estilo selecionado. A leitura é da seleção explícita atual, usa o loader existente e não escolhe outro estilo, inicia reprodução, limpa histórico, cria notificações ou abre popups. O app mantém PT/EN/ES.

## Validação

`scripts/test-style-selection-coverage-ui.mjs` usa HTML/app/estilos reais e os shards reais de Full-on Night e Big Beat, com APIs opcionais e fornecedores de mídia bloqueados. Confere uma leitura fria pendente sem falso zero; depois um artista confirmado em Full-on Night e seis em Big Beat (sem aviso de seleção curta). Fixtures limitadas cobrem recorte vazio, falha e resposta antiga após troca de estilo. O teste cobre atualização após hidratação, foco no teclado, ajuda persistente mesmo ao fechar o balão, idiomas, layouts de 375/1440 px, ausência de requests duplicados do shard e histórico intacto.

Os testes de gravações revisadas e de abertura a frio também passam. A entrega não adiciona gravações nem altera classificações, scoring, gates de BPM, fontes, APIs, arquivo minificado ou bundle nativo.
