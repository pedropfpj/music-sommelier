# Sonic Search Web — recuperação do início de áudio, 23/11/2026

Base: candidata unificada de 17/11 (`160d4368`). Build desta rodada: `20261123listening1`, branch `codex/web-listening-reliability-20261123`.

## Mudança

O início da prévia direta agora tem um prazo de oito segundos. Se a resposta de mídia fica pendente, o app cancela a tentativa, mantém a gravação e os filtros e apresenta **Tentar novamente**. O botão tenta a mesma fonte mediante toque; **Outra faixa** continua disponível na área principal. O prazo também acompanha o início pelo controle nativo do navegador.

O monitor pertence à geração de reprodução e à apresentação da gravação. Tocar outra faixa, pausar ou sair da aba cancela o monitor e a tentativa antiga. A conclusão atrasada de um `play()` anterior não pode interromper a tentativa mais recente. Timeout não registra curtida, descarte nem mudança de preferência musical. A mensagem e a ação existem em português, inglês e espanhol.

Foram alterados `app.js`, seu bundle gerado, `index.html` e a regra pontual de visibilidade do botão em `discovery-experience.css`. Não houve mudança intencional no ranking, nos filtros, nas fontes de catálogo ou na navegação. Os testes de reprodução foram atualizados para incluir os novos listeners e seu cancelamento.

## Evidência antes/depois

Com a resposta HTTP de mídia retida, a versão de 17/11 no WebKit continuou em `loading`, botão desabilitado, “Iniciando prévia…”, tempo zero e `readyState=0` após 11,5 segundos. Nenhuma substituição de `HTMLMediaElement.play()` foi usada nessa reprodução.

Na candidata, esse cenário termina com retry visível e habilitado. O teste libera um WAV gerado para confirmar a mecânica do toque, o avanço do relógio e a preservação da identidade. Esses sons de teste não entram na contagem de músicas reais.

## Validação

- `test-preview-start-recovery.mjs`, bundle final em Chromium e WebKit móveis: quatro cenários passaram — início pendente com retry, início nativo com timeout, navegação com resposta pendente e troca de gravação com resposta antiga. Português/inglês/espanhol passaram. Zero exceções JavaScript. O fixture usa mídia retida e WAV gerado.
- Full-On Night no bundle final, Chromium e WebKit móveis: cinco músicas reais de cinco artistas em cada motor, cinco áudios diretos, zero gravações/artistas repetidos; recarga após a quarta ação preservou o histórico e o filtro de 145–155 BPM.
- `test-single-playback-policy.mjs`: sete grupos passaram, incluindo reprodução posterior preservada quando o primeiro `play()` termina com atraso e limpeza dos listeners.
- Passaram `test-full-on-night-revalidated.mjs`, `test-first-experience.mjs`, `test-swipe-learning.mjs`, `test-weekly-preview-session.mjs` e `test-discovery-experience.mjs`.
- `product-verify.mjs --screenshots --strict-screenshots` passou. Foram inspecionadas as capturas da recuperação em 390/1440 px e a tela móvel normal.

Dois scripts legados adicionais falharam igualmente na base limpa de 17/11 e nesta candidata: `test-explicit-preview-context.mjs` não declara `authorizedPreviewExpiryTimer` no fixture que extrai `renderPreview`; `test-web-audience.mjs` espera resolução da linha sintética “Água — Zélia” que a resolução atual não aceita. As asserções não foram enfraquecidas e esses scripts não são contados como aprovados.

## Limites

O prazo cobre **início pendente**. A causa da ocorrência intermitente de Spookyhertz em 17/11 não foi isolada; este resultado não prova que aquela ocorrência específica foi corrigida. Interrupções depois de o áudio já estar tocando continuam fora do novo monitor. Os testes móveis usam navegadores em macOS; login real e iPhone físico permanecem fora da validação.

Resultados locais do novo teste: `.vercel/preview-start-recovery/chromium-mobile/results.json` e `.vercel/preview-start-recovery/webkit-mobile/results.json`. Capturas revisadas: [celular](/Users/pedrofreire/.codex/visualizations/2026/11/23/01a20931-0a89-78e2-a6a5-ac6147c9a858/sonic-listening/retry-mobile.png) e [desktop](/Users/pedrofreire/.codex/visualizations/2026/11/23/01a20931-0a89-78e2-a6a5-ac6147c9a858/sonic-listening/retry-desktop.png).
