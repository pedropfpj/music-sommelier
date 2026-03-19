# Dataset de artistas (fonte de verdade)

Você está trabalhando em um app "Sommelier de Música Eletrônica" (psytrance).

## Arquivos
- Banco principal: data/psytrance_db_v14.jsonl
- Psycore auditado: data/psycore_db_v14.jsonl

## Regras
- NÃO invente artistas, subgêneros, bios, origens, faixas ou releases que não estejam nos arquivos.
- Use `subgenre` como gênero principal (campo final), e mantenha `suggestedSubgenre` / `userSubgenre` apenas como apoio.
- Para busca: match case-insensitive em `name` e `id`. Aceite busca parcial.
- Se algum campo estiver vazio, mantenha vazio. Para enriquecer depois, use `lookup` e `bio.primarySources` (já vêm preenchidos).
- Se precisar reclassificar gêneros (ex.: Psycore vs HiTech vs Dark Psy), registre em `notes` e mantenha evidência em `source`.

## Campos mais usados
- name, subgenre
- bio.pt, bio.origin, bio.notableTracks, bio.recentReleases
- lookup (links de busca), bio.primarySources (fontes)

## Formato
JSONL: 1 objeto JSON por linha.
