# Revisão web — 5 de novembro de 2026

Esta rodada prioriza ouvir, guardar e voltar à música no navegador, preservando a identidade visual e o catálogo exclusivamente eletrônico. Complementa a [revisão anterior de descoberta](discovery-quality-review-20261105.md).

## Mudanças perceptíveis

- A primeira visita web entra diretamente na descoberta, mantendo as preferências de privacidade. Não é necessário criar conta para ouvir e salvar localmente.
- A biblioteca aparece antes das promoções e explica onde as faixas estão guardadas e como levar uma cópia a outro aparelho. Busca e ordenação continuam disponíveis.
- “Ouvir aqui” muda para a aba Descobrir antes de reabrir o player. A consulta de uma faixa ausente espera no máximo oito segundos pelo catálogo; respostas antigas não atravessam perfis nem substituem uma música mais recente.
- “Copiar link da faixa” identifica artista, gravação e estilo no catálogo. O destinatário recebe aquela faixa, sem importar curtidas ou dados do remetente. O link não aceita URLs de mídia externas, não toca sozinho e mostra uma saída clara quando a faixa está indisponível. Se a área de transferência não funcionar, apresenta um campo selecionável para cópia manual.
- No celular, uma faixa recebida por link traz o cartão e o player para a área de escuta. A entrada geral não disputa mais o posicionamento dessa tela.
- Convites de Premium e interfaces sociais ainda em preparação ficam ocultos nesta versão web. Nenhuma cobrança foi ativada.
- A medição distingue reprodução iniciada de tentativa de play, primeira reprodução, abertura da biblioteca, reabertura de faixas, cópia de link e abertura de link. O painel administrativo mostra reaberturas e links. Cópias não são tratadas como prova de envio a terceiros. A coleta continua condicionada ao consentimento existente; não foi habilitada por padrão.
- O HTML principal solicita revalidação de cache e os recursos alterados têm versão nova. A configuração ainda precisa ser conferida no ambiente publicado.

## Compatibilidade da publicação

`release-flags.js` mantém `socialV2`, `publicProfiles` e `premiumPromotion` desligados. O código de comentários novo fica atrás de `SONIC_TRACK_VIDEO_SOCIAL_V2_ENABLED=true`; o editor de perfis exige `SONIC_PUBLIC_PROFILES_ENABLED=true`. A interface social permanece desativada também no próximo pacote nativo enquanto a ativação não for validada.

Sem a flag de comentários v2, a rota continua usando `_comments-legacy.js`, uma cópia byte a byte do arquivo no commit `3dccbca`. Isso preserva a API e os dados antigos enquanto o [plano de migração social](track-video-social-activation.md) não for concluído. Esta rodada não executou migração, não reconciliou dados remotos nem ativou essas flags. O novo código v2 e seus testes foram preservados.

Um erro encontrado na integração foi corrigido: um controller desativado era armazenado como `false`, interrompendo a atualização da tela. Agora permanece `null`, e a descoberta funciona com o módulo desligado.

## Verificação

- **26 suítes passaram**, incluindo descoberta, deduplicação, orçamento de espera, histórico, áudio, isolamento de perfis, privacidade, APIs sociais em modo opt-in e fluxos de links. [Resultados](../reports/web-audience-20261105/regression-results.json).
- Build web concluído; IDs HTML únicos; scripts referenciados presentes; API legada idêntica à versão anterior; `git diff --check` sem erros.
- No navegador de teste: Umama/Satori tocou, foi curtida, persistiu após recarregar e foi encontrada por busca. “Ouvir aqui” exibiu o player e apresentou áudio em reprodução (`paused=false`, `readyState=4`).
- O link copiado abriu Umama/Satori em outra origem local, com armazenamento separado e zero curtidas. O player permaneceu pausado até a interação. Um link inexistente exibiu a mensagem de indisponibilidade e manteve “Ouvir uma faixa” disponível.
- No Safari do macOS: link abriu a gravação correta, player iniciou pausado e avançou a reprodução após clicar em Reproduzir; a cópia do link confirmou sucesso.
- Larguras efetivas de conteúdo de **360, 753, 829 e 1265 px** ficaram sem transbordamento horizontal nas telas examinadas. O teste de teclado levou da busca à ordenação. Isso não equivale a uma auditoria integral de acessibilidade nem a testes físicos de todos os aparelhos.
- [Biblioteca no computador](../reports/web-audience-20261105/library-desktop.png) e [faixa compartilhada no celular](../reports/web-audience-20261105/shared-mobile.png).

## Estado de entrega

- **Local:** código e build web prontos para revisão em `http://127.0.0.1:8799/` enquanto o servidor local estiver ativo.
- **GitHub:** destino de revisão `codex/web-audience-20261105`, com deploy automático desabilitado explicitamente no `vercel.json`.
- **Vercel:** nenhuma nova implantação de preview ou promoção de produção nesta rodada.
- **Apple:** nenhum upload ou submissão. O archive local **1.1.0 (26)** documentado na rodada anterior não contém estas últimas mudanças web. O script de empacotamento foi preparado para incluir as flags; o próximo pacote nativo precisa ser reconstruído, testado no iPhone e reconciliado com textos e capturas antes da submissão. Não foi aceito nenhum contrato da conta Apple.

O próximo passo web é revisar e publicar esta versão, conferir os cabeçalhos e assets no domínio real e acompanhar os eventos com consentimento. Os testes locais não demonstram aumento de audiência ou conversão; essa avaliação depende de uso após a publicação.
