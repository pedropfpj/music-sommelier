# Quarentena de uma gravação em estilos psy

Revisão de 10/11/2026. O CSV original e o snapshot do catálogo permanecem preservados; nenhum registro remoto foi alterado.

O shard `full_on_night` contém `Braincell — Hanging Out Under The Trees`, Deezer `3603698542`, data `2025-10-24`, duração `379` segundos, com um link genérico para `/music` da Nano. Esse link não fundamenta a classificação específica da gravação.

A [página oficial da gravação no catálogo Nano/Undercover Babas](https://undercoverbabas-nano.bandcamp.com/track/undercover-babas-hanging-out-under-the-trees) identifica a faixa, o lançamento em 24/10/2025, os compositores Angus Young e Ralph K. Freund, e as tags **ambient** e **chill**. A [página oficial do álbum](https://undercoverbabas-nano.bandcamp.com/album/the-story-of-us-a-collection) confirma faixa 13, duração 06:19, e que Undercover Babas é o projeto de Mandala e Braincell. As tags gerais de psytrance do artista/álbum não anulam as tags específicas de ambient/chill da faixa.

A [distribuição Apple Music](https://music.apple.com/us/album/hanging-out-under-the-trees/1846331614?i=1846331779) confirma título, créditos Undercover Babas/Mandala/Braincell, data e duração. A [ficha Beatport da mesma gravação](https://www.beatport.com/track/hanging-out-under-the-trees/22180225) informa Electronica e 100 BPM no índice público consultado; a abertura direta retornou 403. O bloqueio é sustentado pela página primária exata da Nano, sem depender desse índice nem inferir BPM pelo artista.

O ajuste nega **esta identidade de gravação somente na família psytrance**, sem banir Braincell ou determinar um novo subgênero. IDs documentados Deezer/Apple têm prioridade. Sem ID, o fallback exige o título exato conhecido e créditos compostos exclusivamente de Braincell, Mandala e/ou Undercover Babas, incluindo Braincell ou Undercover Babas. Não há comparação por substring. Um ID numérico diferente, um remix não documentado ou um artista homônimo não recebe o bloqueio por semelhança textual.

`node scripts/test-recording-quarantine.mjs` verifica os gates reais do app e da API, importação de shard e cache antigo, a manutenção do dado bruto, o escopo por família, aliases confirmados, IDs e controles negativos para outras faixas/artistas/versões. A consulta não testa áudio remoto nem modifica o catálogo original.
