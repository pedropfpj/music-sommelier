-- Optional sample rows for testing the catalog extra tables.
-- Run after supabase/migrations/20260619024500_catalog_extra.sql.

insert into public.catalog_artists (
  style,
  artist,
  country,
  city,
  artist_bio,
  artist_genre,
  artist_profile_hint,
  source
) values
  (
    'breakcore',
    'Aaron Spectre',
    'International',
    null,
    'Aaron Spectre aprofunda a camada breakcore do catálogo extra para reduzir repetição em onboarding, swipe e recomendação.',
    'breakcore',
    'Seed de profundidade para breakcore; bom para descoberta cross-scene.',
    'manual_catalog_extra_sample'
  ),
  (
    'ambient',
    'Aes Dana',
    null,
    null,
    'Aes Dana entra como referência psychill/psyambient para ampliar a descoberta em estados contemplativos.',
    'psychill',
    'Boa âncora para perfis que puxam ambient, psybient e downtempo psicodélico.',
    'manual_catalog_extra_sample'
  ),
  (
    'slambient',
    'Chaosophy',
    null,
    null,
    'Chaosophy aparece como referência slambient/core-adjacent para perfis de densidade ritual e atmosfera escura.',
    'slambient',
    'Útil para conectar psycore, slambient e texturas densas sem cair em downtempo.',
    'manual_catalog_extra_sample'
  )
on conflict (style, artist_key) do update set
  country = excluded.country,
  city = excluded.city,
  artist_bio = excluded.artist_bio,
  artist_genre = excluded.artist_genre,
  artist_profile_hint = excluded.artist_profile_hint,
  source = excluded.source,
  status = 'published',
  updated_at = now();

insert into public.catalog_tracks (
  style,
  artist,
  song,
  label,
  bpm_exact,
  country,
  city,
  artist_bio,
  artist_genre,
  artist_profile_hint,
  source
) values
  (
    'psycore',
    'Varazslo',
    'Taltos',
    'soundcloud.com',
    220,
    null,
    null,
    'Varazslo entra no catálogo extra como referência psycore de alta densidade.',
    'psycore',
    'Bom teste para perfis que desbloqueiam arquétipos sombrios e rápidos.',
    'manual_catalog_extra_sample'
  ),
  (
    'slambient',
    'Chaosophy',
    'Ch4osophy',
    'theendlessknot.bandcamp.com',
    220,
    null,
    null,
    'Chaosophy aparece em compilações e releases ligados ao ecossistema slambient.',
    'slambient',
    'Exemplo de faixa extra para validar import incremental por estilo.',
    'manual_catalog_extra_sample'
  )
on conflict (style, track_key) do update set
  label = excluded.label,
  bpm_exact = excluded.bpm_exact,
  artist_bio = excluded.artist_bio,
  artist_genre = excluded.artist_genre,
  artist_profile_hint = excluded.artist_profile_hint,
  source = excluded.source,
  status = 'published',
  updated_at = now();
