# Deferred Supabase migrations

Os arquivos deste diretório nunca foram aplicados em produção. Eles são preservados somente como referência histórica e não devem ser executados nem marcados como aplicados.

Eles foram retirados de `supabase/migrations` para não bloquear nem entrar acidentalmente no caminho de aplicação da Fundação Analítica V2.

## Decisões

- `20260621212000_catalog_enrichments.sql` foi adiada porque a implementação atual somente grava enriquecimentos: não existe caminho de leitura nem valor comprovado para o usuário.
- `20260627154500_social_comments_reactions.sql` precisa ser redesenhada por conflitos entre banco e Storage, incompatibilidade dos tipos `post` e `festival`, e lacunas de moderação e segurança.

Qualquer implementação futura dessas funcionalidades deve usar novos timestamps e novas migrations. Os números destes arquivos não devem ser reutilizados.

## Integridade histórica

- `20260621212000_catalog_enrichments.sql`
  - SHA-256: `e29f7ab3add2db8f6c89ed316a2c2560d5ec2631d11f386f9ed9e26cc493deed`
- `20260627154500_social_comments_reactions.sql`
  - SHA-256: `5446b445defff1861959539853e31f82cdd604dbae26454c735ad9a7d04ec8c9`
