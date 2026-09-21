# Sonic Search — atualização da App Store (rascunho para a próxima versão)

Data da auditoria: 21/09/2026. **Não publicado no App Store Connect.**

## Situação confirmada

- A ficha pública é a versão 1.0.9, com subtítulo **“Música eletrônica e DJs”**, cinco capturas e descrição concentrada em eletrônica.
- O projeto iOS está preparado para 1.1.0 (build 25), mas isso **não** significa que essa versão foi enviada ou publicada. O build 24 foi um candidato anterior; o site também evoluiu depois do pacote iOS.
- A ficha pública tem duas avaliações. Essa amostra é pequena demais para concluir que existe um problema de nota; o maior descompasso observável é entre o posicionamento novo e a vitrine antiga.
- Nenhuma promessa de gênero, preview, perfil ou recurso Premium deve entrar na página antes de ser verificada na **build iOS que será enviada**.

## Proposta de posicionamento, após validar a nova build

Promessa principal: **encontrar a próxima faixa fora do óbvio, com recomendações que aprendem com as escolhas da pessoa**. Eletrônica continua forte, mas deixa de ser o limite do produto.

| Idioma | Subtítulo proposto | Texto promocional proposto |
| --- | --- | --- |
| Português (Brasil) | Descubra música fora da bolha | Explore novos artistas e estilos. Ouça prévias disponíveis, curta ou passe e deixe suas escolhas guiarem a próxima descoberta. |
| Inglês (EUA) | Music beyond the obvious | Explore artists and styles beyond your usual picks. Listen to available previews, like or pass, and shape your next discovery. |
| Espanhol | Música fuera de lo obvio | Explora artistas y estilos fuera de lo habitual. Escucha las muestras disponibles, elige lo que te gusta y descubre más. |

### Descrição PT-BR proposta

O Sonic Search ajuda você a descobrir músicas e artistas que combinam com seu gosto — e outros que talvez você ainda não procurasse. De eletrônica e indie a rock, rap, reggae, samba e música clássica, explore estilos diferentes em uma experiência guiada por afinidade e surpresa.

Encontre uma faixa, ouça a prévia quando disponível e diga se conectou ou não. Suas escolhas ajustam as próximas recomendações, sem exigir que você conheça nomes de gêneros ou DJs para começar.

Você pode explorar por estilo e momento, conhecer artistas menos óbvios, guardar descobertas e encontrar sets de DJs. A disponibilidade de áudio e links varia conforme o artista e a plataforma de origem.

O Sonic Search é um serviço de descoberta musical; não oferece streaming integral próprio. As prévias, os sets e os links pertencem às respectivas plataformas e titulares.

### Descrição EN-US proposta

Sonic Search helps you discover music and artists that fit your taste — and others you might never have searched for. From electronic and indie to rock, rap, reggae, samba, and classical, explore more styles through a mix of affinity and surprise.

Find a track, listen to an available preview, then like or pass. Your choices shape future recommendations, even if you don't know genre names or DJs yet.

Explore by style and mood, meet less-obvious artists, save discoveries, and find DJ sets. Audio and link availability varies by artist and source platform.

Sonic Search is a music-discovery service, not a full-track streaming service. Previews, sets, and links belong to their respective platforms and rights holders.

### Campos para revisão no App Store Connect

- Palavras-chave: pesquisar termos por país e selecionar até 100 **bytes** por localização; evitar repetir nome, subtítulo e categoria, além de marcas de terceiros. Não copiar automaticamente listas antigas.
- Categoria principal: confirmar **Música**; manter secundária só se refletir o uso real.
- URL de suporte: substituir a homepage por uma página de ajuda/contato direta **após** verificar que o canal recebe mensagens.
- “Novidades”: descrever apenas mudanças presentes no binário enviado, sem números de catálogo ou recursos Premium não validados.
- Dados de privacidade: revalidar após qualquer mudança em login, perfil, recomendações ou diagnóstico.

## Capturas da próxima build

Usar capturas do **app iOS real**, sem posts ou avaliações fictícios e sem prometer que toda faixa tem áudio. Preparar os tamanhos exigidos pelo App Store Connect em PT-BR e EN-US; validar iPhone e iPad.

1. **Descubra sua próxima faixa** — faixa real com botão de prévia disponível e escolha de curtir/passar.
2. **Seu gosto guia a descoberta** — escolha de estilos ou perfil, com uma recomendação coerente.
3. **Vá além do óbvio** — recomendação de artista de outro estilo com contexto, apenas se a build demonstrar isso.
4. **Guarde o que conectou** — histórico/coleção real.
5. **Explore DJs e sets** — player ou link funcional, sem representar streaming próprio.

As três primeiras são prioritárias porque podem aparecer nos resultados de busca. Antes do upload, testar cada caminho no dispositivo e confirmar que a tela capturada existe na build enviada.

## Qualidade e medição

1. Validar em iPhone físico: primeira faixa, áudio, curtir/passar, recuperação de preview indisponível, login opcional, restauração de compra, suporte e exclusão de dados.
2. Validar VoiceOver, texto ampliado, alvos de toque e iPad. Resolver falhas antes de pedir mais avaliações.
3. O pedido de avaliação nativo deve ocorrer só após uso neutro e repetido, em uma sessão posterior e após retorno ao app. StoreKit decide se mostra o aviso; TestFlight não o exibe.
4. Medir por origem: impressões únicas, visualizações da página, downloads, conversão, retenção e falhas. Só então testar até três variantes de capturas com Product Page Optimization.
5. Responder avaliações negativas com solução ou prazo realista, sem solicitar dados pessoais publicamente.

Fontes Apple: [página do produto](https://developer.apple.com/app-store/product-page/), [descoberta na App Store](https://developer.apple.com/app-store/discoverability/), [pedidos de avaliação](https://developer.apple.com/documentation/storekit/requesting-app-store-reviews), [diretrizes de revisão](https://developer.apple.com/app-store/review/guidelines/).
