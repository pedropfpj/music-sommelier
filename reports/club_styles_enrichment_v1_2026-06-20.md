# Club Styles Enrichment V1 - 2026-06-20

## Objetivo

Enriquecer o banco extra do Supabase com um lote controlado para estilos de pista que ainda tinham pouca curadoria externa em relatorios anteriores:

- `techno`
- `tech_house`
- `hard_techno`

O lote foi pequeno de proposito: 8 artistas e 8 faixas por estilo. Assim a gente melhora recomendacoes e metadata sem jogar uma massa grande de dados ainda pouco revisada.

## Resultado do pacote

- 24 artistas/projetos em `catalog_artists`
- 24 faixas em `catalog_tracks`
- 3 estilos cobertos
- links guardados em `metadata.platform_links`, `metadata.profile_links` e `metadata.social_links`
- datas com precisao de ano marcadas em `metadata.release_precision = year`

## Fontes usadas

Base local do projeto:

- `data/verified_track_expansion_v1.csv`
- `data/verified_track_expansion_v2.csv`
- `data/verified_track_expansion_v3.csv`
- `data/artist_expansion_seeds_v1.csv`
- `data/artist_expansion_seeds_v2.csv`
- `data/artist_expansion_seeds_v3.csv`
- `reports/quality-audit-latest.md`
- `reports/catalog_audit_20260311.md`

Fontes externas consultadas para links e duracoes:

- MusicBrainz URL relations para Discogs, Spotify, Resident Advisor, Beatport, Instagram e SoundCloud quando disponiveis.
- Deezer track pages para duracao e link de faixa quando a busca retornou uma correspondencia direta.
- Beatport search/profile pages quando nao havia match direto de faixa no Deezer.

## Techno

Entraram:

- Jeff Mills - The Bells
- Robert Hood - Minus
- Ben Klock - Subzero
- DVS1 - Black Russian
- Charlotte de Witte - Selected
- ANNA - Hidden Beauties
- Len Faki - BX 3
- Oscar Mulero - Electric Storm

Por que esses nomes:

- misturam base Detroit, Berlim, Madrid, Belgica e Brasil;
- reforcam techno classico, minimal, hypnotic e peak time;
- dao ao app artistas com biografia, pais/cidade e links de perfis fortes.

## Tech House

Entraram:

- Jamie Jones - My Paradise
- Hot Since 82 - Buggin
- PAWSA - Room Service
- Michael Bibi - Hanging Tree
- The Martinez Brothers - Kilo
- Dennis Cruz - El Sueno
- ANOTR - Relax My Eyes
- Mochakk - Jealous

Por que esses nomes:

- cobrem Solid Grooves, Hot Creations, No Art, Black Book e Cuttin Headz;
- melhoram o lado grooveado do app com nomes populares e nomes de cena;
- trazem Brasil, Reino Unido, Espanha, Holanda e EUA para diversidade.

## Hard Techno

Entraram:

- 999999999 - X0004000X
- Paula Temple - Gegen
- Shlomo - The Rapture
- Rebekah - Code Black
- Remco Beekwilder - Industrofunk
- Klangkuenstler - Weltschmerz
- Kobosil - Rigid
- I Hate Models - Daydream

Por que esse extra:

- conversa com psycore e estilos de alta energia;
- aumenta variedade de recomendacao para usuarios que gostam de som rapido, industrial e rave;
- aproveita artistas que ja apareciam em seeds locais mas ainda mereciam metadata melhor.

## Notas de qualidade

Alta confianca:

- linhas com `links_status = verified_artist_links` tem perfis externos fortes e fonte de faixa confiavel.

Media confianca:

- `ANNA - Hidden Beauties`: faixa e artist profile entram com confianca media porque os links sociais exatos ainda precisam de revisao final.
- `Shlomo - The Rapture`: faixa validada por Deezer, mas links sociais do artista ficam pendentes.
- `Jamie Jones - My Paradise`, `The Martinez Brothers - Kilo` e `Rebekah - Code Black`: Deezer retornou resultado de remix ou versao relacionada; mantive Beatport/search como `source_url` principal e deixei a nota em `links_status`.
- `Kobosil - Rigid`: artist links fortes, mas duracao da faixa ficou pendente.

## Arquivos gerados

- `data/club_styles_enrichment_v1_20260620.csv`
- `supabase/seeds/club_styles_enrichment_v1_20260620.sql`

Nao foi aplicado automaticamente no banco.

## Proximos lotes sugeridos

Depois deste V1, os proximos pacotes mais uteis seriam:

- `minimal_deep_tech`: melhora a ponte entre tech house e minimal.
- `acid_techno`: conversa bem com hard techno e psycore.
- `breakbeat` ou `uk_garage`: aumenta diversidade para quem nao quer so quatro por quatro.
- `afro_house` e `organic_house`: enriquecem o lado melodico e social do app.
