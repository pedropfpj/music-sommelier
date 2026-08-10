# Jornal Sonic — configuração e uso

O Jornal Sonic permite criar e atualizar matérias remotamente. Depois que esta
versão do site/app for publicada uma vez, novas matérias não exigem uma nova
versão na App Store.

## Ativação técnica

1. Aplique a migration
   `supabase/migrations/20260722000100_sonic_newsroom.sql` no projeto Supabase.
   Ela cria a tabela `news_articles`, as regras de leitura pública e o bucket
   `news-media` para as capas.
2. As versões revisadas em inglês e espanhol são armazenadas dentro do JSON
   `service_info` já existente. Não é necessária uma nova migration para
   ativar matérias multilíngues; o português permanece nos campos principais e
   funciona como fallback para matérias antigas.
3. Confirme no ambiente de produção:
   - `SUPABASE_URL`
   - `SUPABASE_ANON_KEY`
   - `SUPABASE_SERVICE_ROLE_KEY`
   - `SONIC_OWNER_EMAILS` ou `SONIC_ADMIN_EMAILS`
4. Publique a versão web. Para os aplicativos nativos, gere uma atualização
   inicial que contenha a nova interface.

Não exponha `SUPABASE_SERVICE_ROLE_KEY` no HTML, no app ou em variáveis com
prefixo público. Ela é usada somente pelas funções do servidor.

## Onde editar

- Atalho: `/admin/noticias`
- Alternativa: entrar no Sonic Search e abrir **Painel administrativo** →
  **Editor de notícias**.

O acesso só aparece para contas presentes em `SONIC_OWNER_EMAILS` ou
`SONIC_ADMIN_EMAILS` e com uma sessão online válida.

## Fluxo editorial

1. Clique em **Nova matéria**.
2. Preencha título, resumo, capa, serviço, line-up e texto.
3. Se a matéria pedir mais contexto visual, adicione até duas imagens internas,
   com texto alternativo, legenda, crédito e o número do parágrafo após o qual
   cada uma deve aparecer.
4. Use **Salvar rascunho** enquanto a apuração estiver em andamento.
5. Para publicar imediatamente, clique em **Publicar agora**.
6. Para agendar, escolha uma data futura no campo **Publicar em** e publique.
7. Use **Arquivar** para retirar uma matéria do site e do aplicativo sem
   apagá-la do histórico.

Conteúdos pagos, permutas e parcerias devem ter a opção de conteúdo em parceria
ativada e uma identificação clara preenchida.

## Idiomas das matérias

O app escolhe a versão da matéria a partir do idioma global (`pt`, `en` ou
`es`). Título, resumo, corpo, texto alternativo, crédito, serviço, legendas e
nomes dos links podem ter versões próprias. Nomes de artistas, locais, URLs e
datas estruturadas permanecem compartilhados.

Na API editorial, as traduções revisadas entram e saem pelo objeto
`translations`, com as chaves `en` e `es`. Internamente, o servidor as guarda
no JSON de serviço para manter compatibilidade com o banco já publicado. Se
uma edição antiga ainda não tiver a versão solicitada, o leitor usa o texto-base
em português sem impedir a abertura da matéria.

## Verificação local

```sh
node scripts/test-newsroom.mjs
node scripts/build-web-assets.mjs
```
