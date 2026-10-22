# Catálogo universal — piloto editorial

## Proposta

O catálogo não deve ser uma lista de hits nem uma lista de nomes obscuros.
Cada universo precisa de referências acessíveis, caminhos de aprofundamento
e descobertas. O lote começou com 84 artistas, passou por 92 e agora pesquisa
220 artistas: 206 foram identificados, com 1.185 gravações candidatas nos
12 universos novos. A eletrônica mantém o catálogo existente.

As camadas `reference`, `deep_cut` e `discovery` são escolhas editoriais
relativas a esse piloto. Não são classificações objetivas de fama e não
significam que uma música será novidade para todos.

A descoberta local agora usa reações e entregas anteriores, não apenas o
nível editorial. Combina afinidade, expansão e surpresa, reduz referências
para perfis experientes e guarda o que foi entregue sem inventar descartes.
Detalhes e limitações em `universal-discovery-preview.md`.

## Personalização preparada

O ranker compartilhado web/iPhone agora considera experiência por universo:

- `beginner`: favorece referências e entradas acessíveis;
- `familiar`: dá mais espaço ao aprofundamento;
- `expert`: favorece descobertas sem ignorar afinidade musical;
- músicas marcadas como conhecidas e rejeitadas ficam fora da seleção;
- artistas já conhecidos recebem menos peso quando a exploração aumenta;
- `discoverNewArtists=true` exclui artistas conhecidos explicitamente;
- experiência avançada em eletrônica não é aplicada automaticamente à erudita;
- diversidade por artista continua limitada para evitar listas repetitivas.

Esse comportamento está no motor universal. Não é uma afirmação de que os
novos universos já estão conectados ao fluxo público de descoberta: a interface
multi-universo pública e o catálogo público continuam desligados. A prévia
local já está ligada à aba Descobrir; consulte `universal-discovery-preview.md`.

## Pesquisa, identidade e direitos

`data/universal-catalog-seeds.json` contém alvos editoriais de pesquisa.
`data/universal-catalog-pilot.json` contém os alvos encontrados com
correspondência de artista, título, ID do provedor e link HTTPS para esse ID.
Depois dessa âncora exata, ampliamos até seis gravações por artista do mesmo
ID confirmado. Não usamos apenas igualdade de nomes para aprovar homônimos.
O repertório adicional recebe `recording_tier_requires_review`: o nível e
gênero de cada gravação exigem revisão, não são herdados como fatos. Essa
expansão automática não se aplica a obras eruditas.
Inclui um catálogo separado dos artistas principais, com IDs do provedor,
universos, gêneros e referências às gravações; participantes e compositores
adicionais são preservados nos créditos de cada gravação.
O título retornado pelo provedor é preservado; não inventamos títulos, ISRC,
BPM, popularidade ou biografias. Homônimos, tributos e correspondências
ambíguas não são aprovados automaticamente.

O piloto usa links externos Apple Music/iTunes. Não baixa nem salva áudio,
previews ou capas. A [documentação da Apple](https://performance-partners.apple.com/search-api)
impõe restrições ao uso de conteúdo promocional; o encontro de um registro
na API não concede licença de streaming. Previews e capas exigiriam um fluxo
separado de apresentação e revisão dos termos. A disponibilidade territorial
dos links também precisa ser testada antes da liberação.

O gênero informado pelo provedor é preservado separadamente. O gênero Sonic
e o nível editorial continuam como assertions candidatas, sujeitos à revisão.
Na erudita, compositor, intérprete e obra são separados quando os alvos de
pesquisa permitem identificar a obra; não tratamos um compositor como o
intérprete de toda gravação.

## Operação

```sh
# Busca explícita, até cerca de 18 chamadas/minuto, sem copiar arquivos de mídia.
pnpm catalog:universal:pilot --fetch

# Pesquisa artista + título para os alvos que a busca geral não encontrou.
pnpm catalog:universal:pilot --fetch --resolve-missing

# Reproduz o lote offline a partir do snapshot local.
pnpm catalog:universal:pilot

# Atualiza a pesquisa explicitamente.
pnpm catalog:universal:pilot --fetch --refresh

pnpm test:universal-pilot
pnpm test:universal-pilot-sql
pnpm test:universal-music
```

O gerador cria um relatório de cobertura e o seed inspecionável
`supabase/seeds/universal_catalog_pilot_candidates.sql`. O seed é transacional,
preserva registros existentes e recusa colisões de identidade. Novos artistas
e gravações ficam `needs_review`; gêneros ficam `candidate`. Não torna as
gravações recomendáveis, não habilita a interface e não ativa cobrança.

## Próximos gates

1. Revisar nomes, créditos, gênero de cada gravação e diversidade editorial.
2. Resolver os alvos não encontrados; não inserir títulos presumidos.
3. Ampliar os gêneros ainda sem cobertura. 206 artistas não cobrem 262 gêneros.
4. Importar o lote candidato e conferir contagens/colisões no banco.
5. Testar abertura dos links nos mercados alvo; decidir provedores adicionais.
6. Aprovar registros individualmente, resolver a quarentena e validar o gate público.
7. Promover a jornada local de estilos, conhecimento e reações para o perfil
   sincronizado, onboarding, Radar e fonte pública de candidatos revisados.
8. Habilitar primeiro em Preview. Produção somente depois do teste ponta a ponta.

## Profundidade para lançamento

Este lote é uma prova editorial e de importação, não o tamanho final do catálogo.
Priorizar gêneros ainda sem cobertura e aumentar a variedade de artistas,
épocas, territórios e gravações. Artistas com faixas populares também devem
receber lados B e outras fases da carreira; artistas de descoberta não devem
ficar presos a uma única faixa. A liberação deve ocorrer por gênero revisado,
sem anunciar todos os 262 gêneros como prontos.
