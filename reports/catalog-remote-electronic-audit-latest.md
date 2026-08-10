# Auditoria remota do catálogo eletrônico

Auditoria concluída em 13/07/2026 após a migração e a importação no projeto Supabase `Sonic Search`.

## Catálogo de compatibilidade

| Métrica | Total | Publicado com gate | Revisão |
|---|---:|---:|---:|
| Relações artista–subgênero | 6.868 | 1.157 | 5.711 |
| Relações faixa–subgênero | 8.621 | 4.886 | 3.735 |

## Camada normalizada

| Métrica | Quantidade |
|---|---:|
| Artistas canônicos | 3.549 |
| Relações artista–subgênero | 9.487 |
| Gravações canônicas | 8.204 |
| Gravações recomendáveis únicas | 4.833 |
| Relações gravação–subgênero verificadas | 4.886 |
| Subgêneros eletrônicos ativos | 168 |
| Links de reprodução armazenados | 21.160 |
| Evidências de origem armazenadas | 17.791 |
| Itens na quarentena | 8.073 |
| Itens ainda aguardando revisão | 7.829 |

A diferença entre 4.886 relações publicadas e 4.833 gravações recomendáveis ocorre porque uma mesma gravação pode ter mais de um subgênero eletrônico verificado.

## Integridade

| Verificação | Resultado |
|---|---:|
| Artistas publicados sem `electronic_gate=passed` | 0 |
| Faixas publicadas sem `electronic_gate=passed` | 0 |
| Gravações normalizadas recomendáveis sem gate | 0 |
| Gravações recomendáveis sem gênero verificado | 0 |
| Restrição SQL de gate na camada normalizada | Sim |
| Restrições SQL de gate nas tabelas legadas | Sim, artistas e faixas |
| Políticas públicas exigindo gate | Sim, nas três superfícies públicas |
| Execução registrada em `electronic_ingestion_runs` | Sim |
| Endpoint de produção (`psycore`, 182 registros retornados) | 0 registros sem gate |

Resultado final: **PASSOU**.

Os dados estruturados desta auditoria estão em `reports/catalog-remote-electronic-audit-latest.json`.
