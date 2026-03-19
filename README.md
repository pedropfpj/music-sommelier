# SONIC SEARCH

App web estiloso e funcional para curadoria de musica eletronica.

## O que ele faz

- tela inicial com logo + botao `Iniciar experiencia`
- foco em subgeneros eletronicos (psy, techno, house, dnb e derivados)
- pergunta contexto, energia, BPM e preferencia de vocal (todos opcionais)
- recebe lista de artistas que o usuario ja conhece
- gera recomendacao principal + artista novo para descoberta
- interface simplificada: ouvir com 2 botoes diretos (`Ouvir no Spotify` e `Ouvir no YouTube`)
- protecao anti-link errado: Spotify e aberto com busca estrita por faixa+artista; faixas nao verificadas ficam bloqueadas
- recomenda com filtros parciais (ex.: so BPM, so energia, so contexto)
- quando o usuario escolhe um estilo, o motor respeita esse estilo de forma estrita (sem cruzar opostos como dark psy x chill)
- inclui tambem os estilos `psycore` e `slambient`
- inclui tambem os subgeneros `FULL ON NIGHT` e `FULL ON MORNING`
- inclui sessao dedicada `Psy Comercial / Chacotas` (Skazi, Paranormal Attack, Sesto Sento, Mandragora, Claudinho Brasil e similares)
- tech house reforcado com mais nomes de referencia (Michael Bibi e artistas similares)
- exibe BPM com foco em valor unico da faixa (quando disponivel) para leitura mais precisa
- ao marcar `Nao, novidade para mim`, pergunta se gostou e dispara celebracao visual quando a resposta for positiva
- pacote de imagens inclui SVG + PNG para compartilhar com amigos
- sliders de prioridade por filtro (estilo, contexto, energia, BPM e vocal)
- salva automaticamente preferencias no navegador (retoma na proxima abertura)
- botao `Surpreender` para preset random inteligente e botao `Limpar filtros`
- evita repetir artistas conhecidos quando possivel
- toca preview automaticamente apos gerar recomendacao
- pergunta no proprio player: `Esta gostando do que esta escutando?` com resposta `Sim`/`Nao`
- ao clicar `Nao`, o app faz nova pesquisa automatica no mesmo perfil e troca faixa/artista
- algoritmo adaptativo aprende com likes/dislikes (estilo, artista e energia) para refinar proximas sugestoes
- algoritmo adaptativo + estatisticas de feedback agora persistem entre sessoes (nao zera ao recarregar)
- pergunta "ja conhecia este artista?" e, se sim, troca na hora por outro parecido e menos conhecido
- links clicaveis para Spotify e YouTube
- links clicaveis para Spotify, YouTube e SoundCloud
- mostra metadados da faixa: lancamento, duracao, key e referencia de catalogo/gravadora
- coleta feedback para ajustar o perfil
- mostra detalhes de artista e gravadora
- mostra redes sociais do artista (Instagram, TikTok, X e YouTube) na secao de detalhes
- ao curtir faixa/artista/descoberta, carrega proximos eventos com calendario e lista de datas
- busca eventos reais via Bandsintown com fallback local quando nao houver resposta
- amplia automaticamente o catalogo por subgenero usando seeds de artistas + pesquisa dinamica (Deezer JSONP)
- amplia automaticamente o catalogo por subgenero usando multi-API (Deezer + iTunes Search JSONP)
- busca atingir no minimo 20 faixas e 20 artistas no estilo selecionado quando ha dados disponiveis
- faz warmup em background para tentar elevar cobertura de todos os subgeneros (20+ faixas/artistas por estilo quando as APIs retornam dados)
- tenta enriquecer faixa com preview e BPM real (quando a fonte fornece)

## Subgeneros incluidos

- Psytrance: psytrance, forest, dark, full-on, full on night, full on morning, progressive psy, hi-tech, dark progressive (PROG DARK / zenonesque), goa
- Techno: techno, acid techno, hard techno, minimal techno, melodic techno, industrial, peak time
- House: house, deep house, tech house, progressive house, afro house, organic house, bass house, electro house
- DnB/Bass: drum and bass, liquid dnb, neurofunk, jump up, jungle, breakbeat, uk garage, future garage, dubstep
- Outros: downtempo, ambient, idm, electro, hardstyle, uplifting trance

## Como executar

Abra diretamente:

- `/Users/pedrofreire/Documents/New project/index.html`

Ou via servidor local:

```bash
python3 -m http.server 8080
```

Depois acesse `http://localhost:8080`.
