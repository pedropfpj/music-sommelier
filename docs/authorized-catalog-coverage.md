# Onde ampliar o catálogo tocável

A fila anterior foi testada com vinte cartões por recorte em dois navegadores. Os números de reprodução registram o avanço do áudio na página. A coluna de metadados descreve os catálogos locais usados naquela candidata. Ela pode incluir prévias promocionais e widgets de terceiros, cuja existência não estabelece autorização para hospedar ou tocar a gravação no novo catálogo.

| Recorte | Cartões e créditos distintos | Áudio direto Chromium e WebKit | Metadados relevantes |
| --- | ---: | ---: | --- |
| Full-On Night, 145–155 BPM | 5 de 20 | 5 e 5 | 95 linhas no catálogo local e cinco com BPM numérico dentro do intervalo |
| Bleep Techno | 20 de 20 | 12 e 13 | 103 gravações revisadas, sendo 17 com prévia da Apple e 86 no Bandcamp |
| French House | 20 de 20 | 18 e 18 | 105 gravações revisadas, sendo 26 com prévia da Apple e 79 no Bandcamp |

O intervalo de Full-On Night tem precedência. As 90 outras linhas têm alguma rota registrada, mas não há BPM numérico no catálogo local para incluí-las no filtro. A diferença observada até uma sessão de vinte faixas é de 15 novas gravações e 15 créditos distintos, desde que as cinco prévias conhecidas continuem elegíveis e tocando. Um piloto feito só com o novo acervo precisa de 20 gravações de pelo menos 20 artistas nesse recorte. A sessão deve voltar a ser medida em Chromium e WebKit quando houver áudio aprovado para o teste. [Percursos já medidos](web-discovery-next-20261116.md)

O commit editorial `5acf79a2` contém 35 gravações com BPM numérico entre 145 e 155 e 35 créditos distintos, incluindo 30 identificadores de edição que faltavam no recorte da prévia. Neurotrance aparece em nove das 30 edições adicionais, Ataxia Corp em quatro e MMD Records em três. Essa lista permite revisar o BPM e localizar possíveis titulares. Os rótulos de selo do catálogo ajudam a encaminhar a revisão. Para cada gravação, a aprovação continua exigindo confirmação de quem controla os direitos e liberação para a modalidade de uso. A lista de trabalho está abaixo.

O segundo recorte para ampliar é Bleep Techno. Na amostra, faltaram oito inícios diretos no Chromium e sete no WebKit para atingir vinte. French House ficou a duas prévias desse alvo em cada motor. O total revisado inclui histórico de widgets e prévias que exigem consulta às fontes antes de repetir o teste ao vivo.

## Conferência

```sh
node scripts/authorized-catalog-coverage.mjs --as-of 2026-11-16T00:00:00Z
node scripts/test-authorized-catalog-coverage.mjs
```

A seleção editorial de Full-On Night pode ser listada pelo identificador da edição, pelo selo e pelo BPM consignado naquela revisão.

```sh
git show 5acf79a2:data/runtime-catalog-v1/styles/full_on_night.json |
  jq -r '.[] | select(((.bpm // "") | tonumber? // 0) as $bpm | $bpm >= 145 and $bpm <= 155)
    | [.recording_id, .artist, .song, .label, .bpm] | @tsv'
```

O relatório lê os três arquivos de estilos e as revisões locais de French House e Bleep Techno, sem consultar serviços externos. A contagem das gravações aprovadas usa a mesma verificação de data da API. O manifesto desta candidata tem zero gravações autorizadas. Para revisar um lote diferente, use `--manifest caminho-do-manifesto.json`. Os créditos resultam da normalização dos nomes publicados. O relatório mantém as gravações aprovadas separadas dos resultados históricos, pois uma edição de outro provedor pode representar a mesma gravação.

## Gravações adicionais para revisar

O BPM e o selo são os dados registrados na revisão editorial. O identificador do provedor ajuda a localizar a edição. Para importar um trecho, confirme o ISRC ou MBID correspondente, o BPM e a autorização própria para o áudio.

| Artista | Gravação | Selo indicado | BPM editorial | Edição no provedor |
| --- | --- | --- | ---: | --- |
| Noctum | Warriors | Antu Records | 147 | apple_music:1674835145 |
| Axiomod | Single Dose | Arrábida Records Psytrance | 148 | bandcamp:849234009 |
| Biokinetix | Virtual Combat (PsychoSocial RMX) | Ataxia Corp | 148 | apple_music:1704239062 |
| Hysteria | Lust | Ataxia Corp | 146 | apple_music:1704658196 |
| Outer Connection | Night of Murder | Ataxia Corp | 149 | apple_music:1704239064 |
| Roby | Comando Armado (feat. Kontrax) | Ataxia Corp | 147 | apple_music:1704239058 |
| Atech | The Night of the Wolf | Dacru Records | 148 | apple_music:1536932687 |
| D-ther | Dark Spells | Digital Nomads Records | 150 | apple_music:1673983572 |
| Drip Drop | Musical Neurons (Ingrained Instincts Remix) | Future Music Records | 150 | apple_music:1835660838 |
| Terraformers | The Oracle | GOA Records | 146 | apple_music:1732739697 |
| Azax Syndrom | Evil Force | Inpsyde Media | 147 | apple_music:205871222 |
| Digital Murders | Fall of Murders | Maya Shakti Records | 146 | apple_music:1323914825 |
| Jhesha | Sinful Reactions - Our Music (feat. Sinful Reactions) [Jhesha Remix] | MMD Records | 148 | apple_music:1438447689 |
| Mega | Hidden Dimension | MMD Records | 147 | apple_music:1575546142 |
| Tryambaka | No Mercy | MMD Records | 146 | apple_music:1575546681 |
| Axial Tilt | Uaiyoo | Mosaico Records | 148 | apple_music:1735753652 |
| Afhgany | Alto Control (U-Rak Remix) | Neurotrance | 148 | apple_music:1546030636 |
| Disintegrated Circuits | Sabotage | Neurotrance | 150 | apple_music:1546030641 |
| Dr3x | Revolution | Neurotrance | 150 | apple_music:1572034611 |
| Kontrol Z | Recycle | Neurotrance | 147 | apple_music:1572034608 |
| Luxbuna & Systematic Audio | Industrial Machinery | Neurotrance | 148 | apple_music:1546030635 |
| Mental Chip | Space Science | Neurotrance | 146 | apple_music:1572034814 |
| Spookyhertz | Computer Musik | Neurotrance | 148 | apple_music:1572034833 |
| Zabot | Back To Isness | Neurotrance | 146 | apple_music:1546030639 |
| Zeazea | Full Power | Neurotrance | 146 | apple_music:1546031817 |
| Pragmatix & -GROOVEBOX- | Game On | PsynOpticz Records | 148 | apple_music:1729649951 |
| Zinx & Demosys | Bunjee Jumping [Zinx vs. Demosys] | Replicant Records | 148 | apple_music:577461331 |
| Pzyshow | Talking Trees | Sound Of Nature | 154 | apple_music:1855805461 |
| Sodom | Real Life | SpaceWarp Records | 148 | apple_music:1728383704 |
| Phatmatix | Vertigo | Yabai Records | 147 | apple_music:1238337116 |
