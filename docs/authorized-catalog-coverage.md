# Onde ampliar o catálogo tocável

A fila anterior foi testada com vinte cartões por recorte em dois navegadores. Os números de reprodução registram o avanço do áudio na página. A coluna de metadados descreve os catálogos locais usados naquela candidata. Ela pode incluir prévias promocionais e widgets de terceiros, cuja existência não estabelece autorização para hospedar ou tocar a gravação no novo catálogo.

| Recorte | Cartões e créditos distintos | Áudio direto Chromium e WebKit | Metadados relevantes |
| --- | ---: | ---: | --- |
| Full-On Night, 145–155 BPM | 5 de 20 | 5 e 5 | 95 linhas no catálogo local e cinco com BPM numérico dentro do intervalo |
| Bleep Techno | 20 de 20 | 12 e 13 | 103 gravações revisadas, sendo 17 com prévia da Apple e 86 no Bandcamp |
| French House | 20 de 20 | 18 e 18 | 105 gravações revisadas, sendo 26 com prévia da Apple e 79 no Bandcamp |

O intervalo de Full-On Night tem precedência. As 90 outras linhas têm alguma rota registrada, mas não há BPM numérico no catálogo local para incluí-las no filtro. A diferença observada até uma sessão de vinte faixas é de 15 novas gravações e 15 créditos distintos, desde que as cinco prévias conhecidas continuem elegíveis e tocando. Um piloto feito só com o novo acervo precisa de 20 gravações de pelo menos 20 artistas nesse recorte. A sessão deve voltar a ser medida em Chromium e WebKit quando houver áudio aprovado para o teste. [Percursos já medidos](web-discovery-next-20261116.md)

O commit editorial `5acf79a2` contém 35 gravações com BPM numérico entre 145 e 155 e 35 créditos distintos, incluindo 30 identificadores de edição que faltavam no recorte da prévia. Neurotrance aparece em nove das 30 edições adicionais, Ataxia Corp em quatro e MMD Records em três. Essa lista permite revisar o BPM e localizar possíveis titulares. Os rótulos de selo do catálogo ajudam a encaminhar a revisão. Para cada gravação, a aprovação continua exigindo confirmação de quem controla os direitos e liberação para a modalidade de uso. [Catálogo editorial](https://github.com/pedropfpj/music-sommelier/commit/5acf79a2)

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
