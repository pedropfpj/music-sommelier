# Sonic Search Database v1

Objetivo: colocar o app em banco real sem mexer no catalogo musical local neste primeiro passo.

## Decisao de arquitetura

Comecamos com Supabase/Postgres para dados de usuario:

1. perfil online;
2. likes, dislikes, skips, notas e correcoes;
3. snapshot do perfil local completo;
4. arquetipo musical e cards gerados;
5. feed social basico para uma fase futura.

O catalogo musical continua em `app.js` + `data/` por enquanto. Isso evita uma migracao grande antes de validar login, sync e recuperacao de perfil.

## Arquivos preparados

- `supabase/migrations/20260619010700_sonic_search_core.sql`: schema v1 com RLS.
- `supabase/migrations/20260619022000_grant_data_api_roles.sql`: grants para o Supabase Data API acessar as tabelas com RLS.
- `supabase/migrations/20260619024500_catalog_extra.sql`: catálogo extra de artistas/faixas no Supabase.
- `supabase/seeds/catalog_extra_sample.sql`: dados mínimos para testar o catálogo extra.
- `api/social-config.js`: endpoint ja existente que expoe URL/chave anonima somente quando o social estiver ligado.
- `app.js`: ja tem funcoes de signup, login, sync de curtidas e feed. O card social fica ligado quando o ambiente Supabase esta configurado.
- `.env.example`: lista as variaveis que precisam existir localmente/Vercel.

## Passo 1 - Criar o projeto Supabase

1. Crie um projeto Supabase.
2. Guarde:
   - Project URL;
   - anon public key.
3. Em Authentication, deixe email/password habilitado para o beta inicial.
4. Se quiser evitar confirmacao por email no beta local, ajuste isso no painel do Supabase antes de testar.

## Passo 2 - Rodar a migration

No SQL Editor do Supabase, rode:

```sql
-- conteudo de supabase/migrations/20260619010700_sonic_search_core.sql
```

Em seguida, rode tambem:

```sql
-- conteudo de supabase/migrations/20260619022000_grant_data_api_roles.sql
```

Esse segundo arquivo libera os papeis `anon` e `authenticated` para usar a Data API. As politicas de RLS continuam limitando quais linhas cada usuario pode ler ou escrever.

Depois confira se estas tabelas existem:

- `profiles`
- `track_feedback`
- `feedback_events`
- `taste_snapshots`
- `spirit_profiles`
- `spirit_cards`
- `likes`
- `activity_feed`

## Passo 3 - Configurar variaveis

Local (`.env.local`) e Vercel:

```bash
SUPABASE_URL=https://SEU-PROJETO.supabase.co
SUPABASE_ANON_KEY=SUA_ANON_KEY
SONIC_SOCIAL_ENABLED=true
```

Nao coloque service role key no frontend. Para este v1, o app usa a anon key com RLS e usuario autenticado.

## Passo 4 - Testar configuracao

Com o preview local/serverless rodando, abra:

```text
/api/social-config
```

Esperado:

```json
{
  "ok": true,
  "enabled": true,
  "provider": "supabase",
  "supabaseUrl": "https://...",
  "supabaseAnonKey": "..."
}
```

Se `enabled` vier `false`, o app ainda deve continuar em modo local.

## Passo 5 - Ativar no app em pacote separado

So depois do endpoint responder certo:

1. manter login inicial local e liberar o card social opcional no `app.js`;
2. ajustar textos do card social para o ambiente local/Vercel;
3. testar cadastro;
4. curtir uma faixa;
5. confirmar linhas em `profiles`, `likes` e `activity_feed`;
6. adicionar sync de `track_feedback`, `taste_snapshots` e `spirit_profiles`.

## Primeiro teste de sucesso

Um teste v1 esta pronto quando:

1. usuario cria conta;
2. app sincroniza perfil;
3. uma curtida aparece em `likes`;
4. uma atividade aparece no feed;
5. recarregar o navegador nao quebra o modo local;
6. desativar `SONIC_SOCIAL_ENABLED` volta para local sem erro.

## Proximos incrementos

1. Sincronizar dislikes/skips em `track_feedback`.
2. Salvar backup completo em `taste_snapshots`.
3. Salvar arquetipo atual em `spirit_profiles`.
4. Guardar recibo/metadados de card em `spirit_cards`.
5. Rodar `supabase/migrations/20260619024500_catalog_extra.sql` para adicionar artistas/faixas extras em Postgres sem migrar o catalogo local inteiro.
