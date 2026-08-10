-- Store editor-reviewed Jornal Sonic translations with each article. Portuguese
-- remains in the original columns and is the fallback for legacy editions.

alter table public.news_articles
  add column if not exists translations jsonb not null default '{}'::jsonb;

alter table public.news_articles
  drop constraint if exists news_articles_translations_object;

alter table public.news_articles
  add constraint news_articles_translations_object
  check (jsonb_typeof(translations) = 'object');

comment on column public.news_articles.translations is
  'Reviewed localized article fields keyed by app language (en, es). Portuguese is stored in the base columns.';
