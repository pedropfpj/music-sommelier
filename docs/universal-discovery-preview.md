# Descoberta multigênero — prévia local

## O que foi implementado

A expansão agora tem uma jornada na aba Descobrir do Sonic, não apenas uma
lista de artistas. No servidor local, abra `/?universalPreview=1&lang=pt`.
O parâmetro não habilita a jornada no domínio de produção. A interface
publicada, cobrança e catálogo eletrônico existente permanecem inalterados.

- Escolha de estilo, com conhecimento separado para cada estilo.
- Referências, aprofundamento e descobertas pelo motor compartilhado.
- Afinidade, expansão e surpresa dentro do estilo escolhido. Curtidas guiam
  gêneros para encontrar outros artistas, sem concentrar a fila no artista curtido.
- Cadência de seis entregas por estilo: iniciante reserva duas referências;
  familiar e avançado reservam uma. Isso é política de seleção, não quota paga.
  A proporção só é possível quando há fontes suficientes em cada camada.
- Artistas curtidos ou marcados como conhecidos não entram nas posições de
  descoberta. Referências continuam possíveis em uma posição identificada como tal.
- Rotação dos três últimos artistas quando existem alternativas, uma gravação
  por artista na lista e exclusão de gravações entregues nos últimos sete dias.
- Um perfil avançado não recebe apenas nomes de referência como fallback
  disfarçado de descoberta: se faltar repertório, a prévia informa a limitação.
- Somente fontes cuja identidade e reprodução real foram testadas recebem
  um cartão para ouvir; estilos sem fonte testada ficam em revisão.
- Player YouTube visível no webapp; encaminhamento ao plugin nativo no iPhone.
- Curti, Não combinou, Já conhecia e Ocultar artista.
- Reações editáveis por gravação, sem contar repetidamente o mesmo clique.
- Vídeos alternativos da mesma gravação não repetem curtidas/descartes.
- O mesmo vídeo já entregue não volta durante o cooldown mesmo se uma
  atualização do catálogo mudar o ID da referência de gravação associada.
- Outra recomendação não registra um descarte: salva uma entrega separada.
  Esse histórico é limitado a 500 entregas por perfil e sobrevive à atualização
  da página. Curtidas/descartes/conhecidas continuam excluídos após sete dias.
  Renderizar novamente ou trocar idioma não registra outra entrega.
- Ao esgotar as fontes, mostra a limitação sem trocar de estilo silenciosamente.
- Reprodução antiga é encerrada ao mudar estilo, cartão, perfil ou aba.
- Dados locais separados por perfil; troca de conta não carrega as reações
  da conta anterior. Ainda não há sincronização entre dispositivos.
- Português, inglês e espanhol; controles de 48px, texto quebrável,
  foco visível e respeito a redução de movimento.

## Catálogo versus escuta

O catálogo de referência reúne **206 artistas e 1.185 gravações candidatas**,
a partir de 220 artistas planejados. Trap inclui
gravações de universos hip-hop e brasileiro; indie é separado de rock na
jornada. Os números por universo não são somados novamente por esses grupos.

Isso não significa 1.185 músicas tocáveis. O lote de escuta tem **209 vídeos**:
53 reproduziram no teste de navegador e 156 foram bloqueados. Os 53 vídeos
correspondem a 43 referências de gravação, de 33 artistas. Vídeos
alternativos não são músicas únicas. Há amostras reproduzidas em doze grupos,
mas não profundidade suficiente para um lançamento multigênero amplo.

Exemplos de artistas com fonte reproduzida nesta etapa: Metallica,
Foo Fighters, King Gizzard & The Lizard Wizard, Arctic Monkeys, Alvvays,
Men I Trust, Wednesday, MF DOOM, billy woods, Filipe Ret e SAULT.
Uma fonte que falhou não recebe botão Ouvir por ter apenas um link válido.

A pesquisa de 14/09 adicionou ao catálogo Ulrika Spacek, feeble little horse,
McKinley Dixon, Pachyman, The Frightnrs e Bktherula, com fonte editorial primária
guardada nos metadados. Os níveis e gêneros ainda são candidatos em revisão.
Entre as novas fontes que reproduziram há feeble little horse — Doorway;
McKinley Dixon — Run, Run, Run (feat. Blu); Pachyman — Big Energy;
The Frightnrs — Admiration; Hiatus Kaiyote — Nakamarra;
Magdalena Bay — Image; Kali Malone — Spectacle Of Ritual e
Mestrinho — Sete Meninas. Ulrika Spacek e Bktherula têm referências identificadas,
mas nenhuma fonte reproduzida neste lote; não são anunciadas como tocáveis.

Fontes editoriais: [Ulrika Spacek](https://ulrikaspacek.bandcamp.com/album/modern-english-decoration-2),
[feeble little horse](https://feeblelittlehorse.bandcamp.com/track/tin-man),
[McKinley Dixon](https://mckinleydixon.bandcamp.com/track/run-run-run),
[Pachyman](https://pachyman.bandcamp.com/music),
[The Frightnrs / Daptone](https://daptonerecords.com/artists/the-frightnrs/) e
[Bktherula](https://www.bktherula.com/).

Áudio e capas não foram copiados. Links Apple Music são referências externas,
não previews. Títulos dos vídeos são preservados: não se presume que sejam
o mesmo master da referência Apple Music. Gênero, créditos, nível editorial
e distinção entre versões ainda exigem revisão humana por gravação.

## Ampliação de trap em 16/09/2026

Trap passou de um artista e uma música reproduzida para **sete artistas e
12 músicas distintas**, em 13 vídeos aprovados no teste real do player:
Matuê, Teto, Veigh, Filipe Ret, Yunk Vino, Ryu, the Runner e Sidoka.
O catálogo de referência tem 13 artistas de trap; os demais não são
anunciados como disponíveis no player. Foram testadas 70 fontes novas,
com 12 vídeos reproduzindo e 58 bloqueados.

A busca pode usar um ID Apple Music revisado para evitar resultados de
homônimos e colaborações que escondiam os artistas. Os canais das gravadoras
30PRAUM e SALVE CRAZY REC são aceitos apenas para artistas explicitamente
associados, com nome e URL do canal conferidos no oEmbed.

O contador da interface mostra artistas com reprodução confirmada e músicas
únicas. Referências ainda em revisão ficam no painel de catálogo.
O teste de regressão percorre seis recomendações de trap nos três níveis de
experiência após descartar a fonte antiga, sem repetir gravação ou mudar gênero.

## Verificação e próximos gates

```sh
pnpm release:check
pnpm test:universal-discovery
# SONIC_PLAYWRIGHT_MODULE pode apontar para o Playwright do ambiente.
node scripts/verify-universal-discovery-ui.mjs
node scripts/verify-universal-discovery-ui.mjs --provider-smoke
node scripts/verify-universal-discovery-ui.mjs --discovery-smoke
node scripts/verify-listening-preview.mjs
node scripts/verify-universal-provider-playback.mjs --max=30
# Pesquisa limitada por artista/camada, mantendo todas as fontes já testadas.
node scripts/generate-universal-listening-pilot.mjs --fetch --tiers=discovery --groups=indie,rap,reggae --artists="feeble little horse,McKinley Dixon,Pachyman" --max-requests=6
```

Os testes de interface usam um player simulado para verificar a jornada,
isolamento de perfis e layout, sem gravar dados no backend. Os resultados
de reprodução real são separados e guardados em
`data/universal-listening-playback-checks.json`; incluem player em reprodução
e avanço de tempo. A compilação e chamada simulada do plugin não substituem
um teste num iPhone físico, Safari ou mercados de lançamento.
Também foi observada reprodução real na aba Descobrir em rock (Metallica),
indie (Arctic Monkeys), rap (MF DOOM), trap (Filipe Ret) e reggae
(Burning Spear), além das verificações individuais de avanço de tempo.

Em 14/09, a reprodução real na aba Descobrir com perfil avançado passou em
sete grupos: indie (Men I Trust), rap (billy woods), reggae (The Frightnrs),
soul (Hiatus Kaiyote), pop (Magdalena Bay), ambient (Kali Malone) e
forró (Mestrinho). O verificador de interface também confirmou que entregas
separadas de reações sobrevivem ao recarregamento da página.

Verificação final de 12/09/2026: `pnpm release:check` passou em 52 verificações,
incluindo compilação do iPhone para simulador. Os dois verificadores de
interface passaram, e o teste real dos cinco estilos na aba Descobrir também.
Uma execução anterior encontrou HTTP 500 transitório no catálogo eletrônico;
a consulta de diagnóstico, o teste isolado e a repetição completa passaram.
Isso não é garantia de disponibilidade contínua dos provedores externos.

Verificação final de 14/09/2026: `pnpm release:check` passou novamente em
52 verificações, incluindo compilação iPhone para simulador e cópias idênticas
dos módulos/dados entre web e iPhone. Inclui testes de cadência por experiência,
afinidade por curtidas, rotação de artistas, cooldown persistente, migração
das reações antigas, alteração de referência sem repetir o vídeo e fallback
honesto quando a seleção avançada não tem fontes. O smoke de perfil avançado
nos sete grupos e a interface móvel também passaram. Cobrança e expansão
pública permanecem desligadas.

Para produção ainda falta: ampliar fontes que realmente reproduzam,
revisar individualmente a curadoria/versões/créditos, testar iPhone e regiões,
importar candidatos sem colisões, aprovar apenas gravações revisadas e
conectar a fonte pública ao onboarding, perfil sincronizado, Radar e Premium.
Não foram feitos importação no Supabase, commit, push ou deploy nesta etapa.
