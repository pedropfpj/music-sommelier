# Prévias da edição semanal — 9 de novembro de 2026

A sessão anterior escolhia as três primeiras linhas da edição e anunciava escuta antes de verificar o áudio. Na edição de 04/11/2026, as duas primeiras linhas falharam. A ausência de erros JavaScript não comprovava uma sessão reproduzível.

## Diagnóstico

- `openWeeklyEditionTrack` recebia o primeiro `false` da tentativa rápida de `renderPreview`, mas não acompanhava a nova tentativa agendada 520 ms depois. O resultado da sessão podia ficar incorreto.
- O cache do cliente preservava respostas nulas de metadados, inclusive após falhas transitórias. Uma nova tentativa não necessariamente consultava o provedor. Links assinados expirados também precisavam ser renovados.
- Havia URLs Deezer vencidas desde junho no catálogo. A fotografia editorial v1 continua imutável; a resolução de reprodução precisa obter URLs atuais.
- A sessão registrava a apresentação antes de confirmar que a mídia carregara.

## Comportamento corrigido

A página primeiro oferece conferir as prévias da própria edição. Até seis linhas são verificadas com dois pedidos simultâneos e limite total de 18 segundos. A conferência não toca áudio, troca o cartão, registra exposição ou grava feedback pessoal.

Somente áudio que o elemento de mídia realmente carregou entra na fila, na ordem editorial, até três itens. O botão informa a quantidade verificada e usa o termo prévia. URLs de busca e a mera existência de um embed não contam como áudio carregado. As seis linhas, contextos e fontes continuam acessíveis; uma prévia não confirmada não significa que a música inexista.

O segundo toque inicia a escuta. A ponte aguarda a mídia do player principal e registra apresentação apenas depois dessa confirmação. Não permite uma substituição por outra música ou versão. Falhas não são contadas como entrega bem-sucedida. Troca de conta ou edição invalida resultados antigos.

## Evidência externa da amostra

As consultas foram pequenas, sem usar dados pessoais. Quatro prévias Apple retornaram áudio válido: Dark Whisper — Rhythm of The Infinite, 2 Unlimited — Get Ready, Dynamix II — Feel the Groove e Rooler — DISCOTEK. O Deezer também retornou áudio atual para a primeira; seu link antigo respondia 403. Respostas de áudio foram confirmadas por HTTP 206 e cabeçalhos/bytes do formato de mídia, não apenas por uma URL presente.

Convextion — Miranda não foi encontrada pelos metadados Apple/Deezer consultados, mas tem uma [fonte oficial da Mojuba no Bandcamp](https://mojubarecords.bandcamp.com/track/miranda). Folamour — Against the Clock continuou sem prévia confirmada na amostra. A disponibilidade dos provedores pode mudar.

## Verificação

`npm run test:weekly-previews` cobre o cache transitório, links vencidos, identidade de versão, preparação limitada, cancelamento e mídia de áudio decodificada pelo navegador, incluindo avanço real de `currentTime`. Os testes controlados de mídia distinguem um arquivo válido de uma resposta 404. `npm run test:weekly-listening` mantém as regressões de navegação, contexto, fontes e telas pequenas. A verificação pública final deve exercer o áudio real das faixas da edição, além dos testes controlados.

O escopo desta entrega é o web app.
