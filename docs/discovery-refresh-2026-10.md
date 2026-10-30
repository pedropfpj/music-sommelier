# Sonic Search — descoberta, biblioteca e conversão

Estado em 30/10/2026: implementação local validada; esta nota não confirma publicação nem envio à Apple.

## Entrega

- Preview junto da capa e das reações; detalhes e plataformas em áreas expansíveis.
- Descoberta e seleção semanal antes do destaque do Premium.
- Biblioteca com busca sem distinção de acentos, filtros por faixa/artista/estilo, ordenação e reprodução de faixas salvas.
- Resolução de faixas da seleção inicial mesmo quando não constam no catálogo principal; proteção contra troca de perfil durante buscas assíncronas.
- Página `iphone.html`, convite de instalação no web app e Smart App Banner.
- PT/EN/ES declarados no pacote iOS; pedido de avaliação nativo após uso recorrente, sem condicionar à opinião positiva.
- Variante de ícone para avaliação e três layouts de captura em português. São rascunhos a partir do bundle web nativo, não capturas de um iPhone físico. Revalidar no binário final e nos tamanhos exigidos pela App Store antes de enviar.

## Validação

Testes aprovados: biblioteca/busca/reprodução/isolation, rotação de abertura, proteção contra repetição, retorno ao app, stress de subgêneros, exposição de descobertas, resiliência de rede, descoberta universal, reprodução universal, exclusividade de áudio, propriedade do preview, bloqueio da primeira recomendação, isolamento de autenticação, visibilidade do Premium e equivalência dos arquivos enviados ao Xcode.

O teste de catálogo de nichos validou 120 amostras distribuídas entre 24 estilos. Isso não significa que todos os estilos têm cobertura suficiente nem garante disponibilidade futura dos fornecedores.

A revisão encontrou e corrigiu divergência do identificador da build. O teste visual por script requer Playwright não instalado no projeto; a revisão responsiva foi feita no navegador controlado, incluindo largura de 320 px sem transbordamento e ações de pelo menos 48 px. Compilação Debug para iOS Simulator aprovada. Login real, compras e o aviso de avaliação no dispositivo físico não foram exercitados nesta rodada.

## Textos da loja — proposta para a build que contém as melhorias

| Localização | Subtítulo | Texto promocional |
| --- | --- | --- |
| Português (Brasil) | Sua próxima descoberta musical | Encontre faixas, ouça previews disponíveis e guarde seus achados. Busque por artista, faixa ou estilo para voltar ao que conectou. |
| Inglês (EUA) | Find your next favorite track | Discover tracks, listen to available previews and save your finds. Search by artist, track or style to return to what connected. |
| Espanhol | Tu próximo hallazgo musical | Descubre pistas, escucha los previews disponibles y guarda tus favoritos. Busca por artista, pista o estilo para volver a escucharlos. |

Novidades PT: A descoberta ficou mais direta, com o preview junto da faixa. Sua biblioteca agora tem busca, ordenação e um atalho para voltar a ouvir. Também melhoramos os textos e a organização das telas.

Novidades EN: Discovery is more direct, with the preview next to the track. Your library now includes search, sorting and a shortcut to listen again. We also improved screen organization and interface copy.

Novidades ES: El descubrimiento es más directo, con el preview junto a la pista. Tu biblioteca ahora incluye búsqueda, ordenación y un acceso para volver a escuchar. También mejoramos los textos y la organización de las pantallas.

Não substituir os metadados públicos antes de a build correspondente estar pronta. O envio à Apple é separado da publicação web.

## Expansão do catálogo

Executar `node scripts/audit-catalog-coverage.mjs` para classificar todos os 169 estilos, inclusive os já tratados em expansões anteriores. Não confundir URL/ID cadastrado com áudio validado ao vivo.

A auditoria desta rodada encontrou zero duplicatas por artista+título normalizados dentro de cada estilo, mas forte concentração: IDM tem 24 faixas de dois artistas (23 do mesmo artista), Electro House tem 25 de dois artistas (24 do mesmo artista). Diversidade de artistas é a prioridade.

Trabalhar em lotes: confirmar identidade e evidência de subgênero, limitar faixas por artista novo, eliminar versões duplicadas, verificar preview e capa, importar no catálogo e testar repetição/exaustão. Nunca reclassificar músicas apenas para preencher cotas.

## Catálogo e prévia de rock — segunda entrega

A expansão v22 acrescenta 69 gravações de eletrônica em seis estilos prioritários. A fonte é a página pública da gravação no Apple Music, com correspondência de artista/título e resposta HTTP de áudio verificadas. A disponibilidade futura e regional não é garantida. Quatro candidatas foram retiradas por dúvida de classificação: Viper, One Click Headshot, Gassed Up e Pon Di Bill.

O núcleo inicial do catálogo agora intercala artistas antes de preencher outras vagas com gravações do mesmo nome. O histórico continua impedindo repetição involuntária; esgotar uma seleção pede uma nova rodada explícita.

A prévia de rock segue uma seleção editorial por faixa. O padrão prioriza descobertas e outros lados de artistas conhecidos. Hits familiares só entram ao ativar “Incluir clássicos conhecidos”. São categorias editoriais, não medidas de popularidade. Foo Fighters aparece também com Aurora; artistas como feeble little horse, Ulrika Spacek, Drug Church, King Buffalo e Elder abrem novos caminhos. Cada gravação tem uma nota curta de escuta em português, inglês e espanhol. As notas orientam a escuta, sem alegar avaliação humana de áudio feita nesta sessão.

Curtidas, histórico e a preferência por referências são isolados por perfil e incluídos no backup. Trocar a seleção interrompe o áudio; os controles globais de volume e silêncio também valem para rock. Carregar uma faixa não inicia o áudio automaticamente. Os previews continuam no fornecedor; nenhum arquivo de áudio é hospedado no projeto.

A landing page identifica rock como prévia do web app. A versão da App Store exige seu próprio envio e revisão; a publicação na Vercel não atualiza o aplicativo já instalado.

Validação final da curadoria: 45 faixas de rock de 26 artistas; 37 faixas de 19 artistas no padrão e oito referências opcionais. As 114 gravações novas (69 eletrônicas e 45 de rock) passaram na correspondência de identidade e na resposta de áudio. Cem rodadas completas do modelo de rock passaram sem repetir gravações. Revisão móvel em 390 e 320 px sem transbordamento horizontal; controles de áudio com pelo menos 48 px. Reprodução, curtida, troca de faixa e opção de referências verificadas no navegador. Os quinze testes de regressão passaram; o teste de bundle foi repetido após finalizar a compilação, pois a execução concorrente havia lido o arquivo anterior. Pacote web iOS atualizado e teste de equivalência aprovado.

Na checagem pública do desktop, o convite de instalação ocupava uma coluna estreita e deslocava o conteúdo principal para a linha seguinte. A correção o coloca abaixo da descoberta, na largura do conteúdo, a partir de 900 px. Layout conferido em 1280 px; busca/biblioteca, catálogo servido e equivalência do pacote iOS foram revalidados após a correção.
