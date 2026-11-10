# Afinidade pessoal e evidência musical — 10/11/2026

A apresentação anterior expunha um score heurístico como percentual de “confiança” e misturava fonte, player, BPM e gosto pessoal. O texto de estilo provável também dizia que o swipe confirmaria a classificação. Nenhum desses números representa uma probabilidade calibrada de o gênero estar correto ou de a pessoa gostar da faixa.

O painel existente agora apresenta **Perto do seu gosto**, **Guiada pelos filtros** ou **Para explorar**. A primeira opção exige sinais pessoais positivos e histórico de aprendizado; fonte ou áudio confiável, sozinhos, não geram uma afirmação de afinidade. A explicação de filtros usa o estilo efetivamente escolhido quando ele corresponde à faixa.

Os três chips do “Por que entrou no radar” distinguem estilo, BPM informado/não verificado e áudio carregado/prévia/player externo/estado desconhecido. Uma URL de prévia no catálogo não recebe o rótulo de áudio carregado. Essa indicação exige estado real do elemento de mídia e propriedade da faixa atual.

“Fontes e detalhes” usa o elemento nativo `details`, recolhido inicialmente e ao mudar a faixa. O link aparece somente para a prova de gravação reconhecida por `reviewedRecordingStyleProof` ou para as provas primárias v24/v25 que atendem às validações de publicação existentes e aos limites de URL. O destino é uma página específica: playlist editorial, faixa ou lançamento; URLs sem HTTPS, com credenciais, domínio alheio ou homepage não ganham link. As âncoras usam `target="_blank"` e `rel="noopener noreferrer"`. O detalhe explica que feedback orienta afinidade pessoal e que classificação musical depende das fontes.

O cálculo numérico de `recommendationTrustAnalysis`, seu `score`/`level`, o ranking, o modelo de gosto, os gates de gênero/BPM e o histórico permanecem inalterados. Nenhum handler de feedback, login, correção de metadados ou player foi modificado. A leitura de mídia serve apenas à apresentação.

O observador de áudio é registrado uma vez e atualiza apenas o chip. Ele exige o elemento atual, a mesma gravação, perfil e geração da recomendação; carregamento e falha preservam o foco no link e os detalhes abertos. Uma falha observada permanece até novo carregamento, mesmo quando o player limpa a origem do áudio.

## Verificação

`scripts/test-recommendation-fit-presentation.mjs` compara 24 cenários reais com o código-base `c63d5f5`: score/nível internos, score de ranking e precisão permanecem idênticos, com relógio e variação de visita controlados. O teste lê esse commit localmente; em checkout sem o objeto Git, `SONIC_TRUST_BASELINE_APP` pode apontar para uma cópia desse `app.js`.

No Chromium, o teste executa fonte e minificação em memória de JS/CSS, em português, inglês e espanhol, nas larguras 375 e 1440. Verifica linguagem sem porcentagem, fontes válidas e ausentes, URLs inválidas, navegação por teclado, foco visível, alvo de 44 px, ausência de overflow e limpeza de links antigos. Áudio WAV de fixture é decodificado pelo navegador para testar o estado carregado; um HTTP 404 real testa a falha posterior, preservando foco e disclosure. `readyState` e eventos não são simulados; a seleção automática de recuperação fica isolada como outra responsabilidade. Mídia pertencente a outra faixa não certifica o áudio atual. Sinais positivos de gosto não alteram a classificação da fixture sem fonte.

APIs e provedores são bloqueados/substituídos por fixtures no teste; não há ações de contas reais nem novas consultas musicais. As prévias externas podem mudar de disponibilidade. O teste verifica apresentação e preservação do modelo, sem comprovar novamente cada metadado do catálogo.
