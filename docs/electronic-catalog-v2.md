# Catálogo eletrônico v2

O catálogo v2 foi desenhado para crescer sem permitir que um artista apenas “relacionado” à música eletrônica entre automaticamente nas recomendações. A regra central é:

> Todo candidato pode ser armazenado; só uma gravação com `electronic_gate=passed` pode se tornar recomendável.

## Estado preparado em 13/07/2026

| Camada | Artistas/relações | Faixas | Situação |
|---|---:|---:|---|
| Supabase remoto atual (`catalog_*`) | 6.868 relações | 8.621 | Importado e auditado |
| Lote local armazenável | 6.866 | 8.607 | Pronto para importação |
| Publicação remota aprovada pelo gate | 1.157 relações artista–subgênero | 4.886 | Alimenta recomendações |
| Revisão/quarentena | 5.711 relações artista–subgênero | 3.735 | Fica fora das recomendações |
| Conflitos não eletrônicos explícitos | — | 2.715 | Bloqueados pelo gate |

O lote está em `reports/catalog_extra_electronic_v2.rows.json`. O relatório detalhado está em `reports/catalog-extra-electronic-v2-latest.md`.

## O que armazenar

| Entidade | Campos principais | Motivo |
|---|---|---|
| Artista canônico | nome, nome de ordenação, tipo, país, cidade, status e confiança | Evita tratar grafias diferentes como artistas diferentes |
| Aliases | nome alternativo, idioma, tipo e fonte | Melhora busca e deduplicação |
| IDs externos | MusicBrainz, Wikidata, ISNI, Discogs, Spotify e Deezer | Permite reconciliar identidades sem depender do nome |
| Taxonomia | subgênero, nome público, pai, aliases e estado | Permite ampliar e corrigir subgêneros sem quebrar dados antigos |
| Relação artista–subgênero | tipo de evidência, confiança, fonte e revisão | Um artista pode atuar em vários subgêneros |
| Gravação | título, artista, ISRC, lançamento, gravadora, data, duração e BPM | A recomendação é validada no nível da música, não só do artista |
| Relação gravação–subgênero | confiança, fonte e decisão | Impede que toda a discografia herde um único gênero do artista |
| Reprodução | provedor, URL, tipo, disponibilidade e última checagem | Separa identidade musical de disponibilidade de áudio |
| Proveniência | fonte, URL, licença, data, valor declarado e confiança | Torna cada decisão auditável |
| Quarentena | razão, payload, revisão e resolução | Preserva dados duvidosos sem expô-los ao usuário |
| Execução de ingestão | origem, versão, contagens, erros e timestamps | Permite repetir e comparar importações |

Essas entidades são criadas por `supabase/migrations/20260713000200_electronic_catalog_v2.sql`. As tabelas antigas `catalog_artists` e `catalog_tracks` continuam funcionando e sincronizam automaticamente com a camada normalizada.

## Aplicar no Supabase

1. Aplique primeiro a migração:

   ```bash
   psql "$DATABASE_URL" -v ON_ERROR_STOP=1 \
     -f supabase/migrations/20260713000200_electronic_catalog_v2.sql
   ```

   Também é possível usar `supabase db push` ou executar a migração pelo SQL Editor do projeto.

2. Gere novamente o lote, caso os dados de origem tenham mudado:

   ```bash
   npm run catalog:v2:generate
   ```

3. Importe o lote filtrado:

   ```bash
   npm run catalog:v2:import
   ```

O importador rejeita qualquer linha publicada sem `electronic_gate=passed`, testa a credencial administrativa e confirma que a migração v2 existe antes de gravar.

### Importação remota concluída

Em 13/07/2026, a migração v2 e a correção de consistência do gate foram aplicadas no projeto `Sonic Search`. A causa do antigo HTTP 403 era a ausência de privilégios SQL nas tabelas para `service_role`; a própria migração agora restaura esses grants.

O banco remoto contém 6.868 relações de artista e 8.621 relações de faixa. Todas as 1.157 relações de artista e 4.886 relações de faixa publicadas possuem `electronic_gate=passed`. Na camada normalizada existem 3.549 artistas canônicos, 8.204 gravações e 4.833 gravações recomendáveis únicas. A auditoria completa está em `reports/catalog-remote-electronic-audit-latest.md`.

As migrações `20260713000300_electronic_gate_consistency.sql` e `20260713000400_legacy_catalog_gate_rls.sql` adicionam restrições SQL e políticas RLS que impedem tanto uma gravação normalizada quanto uma linha legada de permanecer pública sem o gate. A chave administrativa não deve ser exposta no navegador nem commitada.

## Alimentação em massa pelo MusicBrainz

Para cobertura ampla, use o full export do MusicBrainz em vez de varrer a API pública. O full export e as instruções oficiais ficam em [MusicBrainz Database Download](https://musicbrainz.org/doc/MusicBrainz_Database/Download); a API pública possui política de limitação documentada em [MusicBrainz API Rate Limiting](https://musicbrainz.org/doc/MusicBrainz_API/Rate_Limiting).

1. Baixe `mbdump.tar.bz2` e extraia o arquivo:

   ```bash
   mkdir -p data/musicbrainz
   tar -xjf mbdump.tar.bz2 -C data/musicbrainz
   ```

2. Gere candidatos a partir de `tag`, `artist_tag`, `artist` e, quando disponível, `artist_alias`:

   ```bash
   npm run catalog:musicbrainz:generate -- \
     --dump-dir data/musicbrainz \
     --min-score 1
   ```

3. O resultado fica em `reports/musicbrainz_electronic_candidates.rows.json`, acompanhado do relatório por subgênero.

O gerador faz correspondência exata entre tags do MusicBrainz e os 169 subgêneros do app. Tags amplas como “electronic” entram em `electronic_unclassified`. Todos esses registros recebem `needs_review`; nenhum é publicado sem gravação elegível. Use `--exclude-broad` se quiser omitir as tags amplas.

## Política de promoção

Um candidato só deve mudar para recomendável quando:

1. a identidade do artista estiver reconciliada por ID externo ou revisão;
2. houver uma gravação identificada;
3. a evidência da gravação apontar para um subgênero eletrônico aceito;
4. não houver conflito de lançamento não eletrônico;
5. `electronic_gate` estiver em `passed` e a proveniência estiver registrada.

Essa separação permite armazenar milhões de candidatos no futuro sem degradar a qualidade das recomendações atuais.
