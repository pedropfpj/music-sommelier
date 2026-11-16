# Piloto Web de prévias autorizadas

A prévia protegida aceita `?authorizedPreview=1` para habilitar o catálogo piloto no fluxo existente de Descobrir. A busca, Outra faixa e as reações consultam a seleção aprovada. A Biblioteca mantém o identificador exato da gravação. O catálogo atual continua disponível para os mesmos filtros quando o lote piloto fica sem opções.

O manifesto versionado começa com zero aprovações. A meta para o primeiro lote é obter pelo menos 15 gravações adicionais de 15 artistas de Full-On Night entre 145 e 155 BPM, contando com as cinco prévias que tocaram na amostra anterior. A [auditoria de cobertura](./authorized-catalog-coverage.md) indica onde encontrar as 30 gravações candidatas para revisão. Reavalie a meta depois de escutar o lote real nos dois navegadores.

## Entrada do primeiro lote

1. Revise a edição e escolha um identificador canônico para cada gravação. Use ISRC quando conhecido e verificável ou o MBID da gravação. Se os dois se referirem à mesma edição, use um único identificador no lote. Confira o subgênero e o BPM da edição e registre a evidência.
2. Guarde o arquivo aprovado e a documentação fora do checkout. A autorização do piloto cobre streaming de prévia na Web em todo o mundo, dentro de um período definido, para o fonograma e a composição. Registre o SHA-256 do trecho coberto. As referências da revisão ficam no arquivo privado de entrada. A aprovação documental é feita por uma pessoa responsável.
3. Use o SHA-256 em minúsculas como nome do arquivo, com `.mp3` ou `.wav`, até 4 MiB. O compilador verifica o formato e o hash dos bytes, associa a autorização à edição e à prévia e gera o manifesto sem os dados privados.
4. Guarde os trechos no bucket **privado** `authorized-web-previews`, com o nome do hash e sem sobrescrever objetos existentes. Use a configuração Supabase do ambiente de prévia. Confirme que a URL pública do Storage recusa acesso. Publique somente o manifesto e o código na prévia protegida e teste com os próprios trechos.
5. Para revogar uma faixa, exclua o objeto de áudio do bucket e remova a entrada do próximo manifesto. A exclusão impede novas entregas mesmo em prévias anteriores. Bytes que o navegador já recebeu podem continuar em memória. A API checa a vigência também no momento da entrega e o player do app para quando a autorização expira.

O compilador lê um JSON com `version: 1` e `recordings`. Cada item segue o formato abaixo. Os valores de exemplo são marcadores com dados de teste e precisam ser preenchidos com a revisão real.

```json
{
  "id": "isrc:USTST2600001",
  "title": "Nome da edição",
  "artist": "Artista creditado",
  "style": "full_on_night",
  "styleEvidence": {
    "recordingId": "isrc:USTST2600001",
    "verified": true,
    "evidenceRef": "referência privada da revisão do subgênero"
  },
  "bpm": {
    "recordingId": "isrc:USTST2600001",
    "value": 150,
    "verified": true,
    "evidenceRef": "referência privada da medição de BPM"
  },
  "preview": {
    "file": "<sha256>.mp3",
    "mimeType": "audio/mpeg"
  },
  "rights": {
    "recordingId": "isrc:USTST2600001",
    "decision": "approved",
    "territory": "worldwide",
    "scope": "web-preview-streaming",
    "masterApproved": true,
    "compositionApproved": true,
    "approvedPreviewSha256": "<sha256>",
    "approvalRef": "referência privada da autorização",
    "availableFrom": "2026-12-01T00:00:00Z",
    "expiresAt": "2027-01-01T00:00:00Z"
  }
}
```

```sh
node scripts/build-authorized-catalog.mjs \
  --input "$private_intake" \
  --media-root "$private_media_dir" \
  --output api/_authorized-catalog.json
```

O manifesto e o áudio só são servidos no ambiente padrão de prévia da Vercel. A API confirma que o bucket está privado, verifica os bytes e atende os intervalos de áudio solicitados pelo navegador. Os destinos externos da gravação continuam cumprindo o papel de levar a pessoa ao serviço de origem.

A rota checa a existência do objeto no Storage por `HEAD` após carregar os bytes. Isso evita que a resposta antiga do CDN entregue sozinha um objeto excluído. [Variáveis de ambiente da Vercel](https://vercel.com/docs/environment-variables/system-environment-variables) · [Cache de arquivos do Supabase](https://supabase.com/kb/troubleshooting/storage-file-not-caching)

## Como testar

```sh
node scripts/build-web-assets.mjs
node --test scripts/test-authorized-catalog-{intake,api,coverage}.mjs
node scripts/test-authorized-catalog-browser.mjs chromium
node scripts/test-authorized-catalog-browser.mjs webkit
```

Os ensaios de navegador geram áudio em memória, usam as rotas reais com um substituto local para o Storage e observam o avanço do áudio da faixa ativa. O ensaio valida o caminho de ponta a ponta sem usar uma conta real nem gravar arquivos de áudio no catálogo. A validação do Storage de prévia com um lote musical depende da entrega dos primeiros trechos autorizados.
