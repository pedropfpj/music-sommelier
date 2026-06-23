-- Sonic Search - Club styles enrichment V1
-- Generated 2026-06-20.
-- Styles: techno, tech_house, hard_techno.
-- Run in Supabase SQL Editor only after review.

create temporary table if not exists club_styles_enrichment_v1_tracks (
  style text not null,
  artist text not null,
  song text not null,
  label text,
  bpm_exact numeric,
  bpm_note text,
  release_date date,
  release_precision text,
  duration_sec integer,
  country text,
  city text,
  artist_bio text,
  artist_genre text,
  artist_profile_hint text,
  source_url text,
  deezer_url text,
  spotify_url text,
  beatport_url text,
  instagram_url text,
  soundcloud_url text,
  ra_url text,
  discogs_url text,
  status text not null,
  confidence text not null,
  links_status text not null
) on commit drop;

truncate table club_styles_enrichment_v1_tracks;

insert into club_styles_enrichment_v1_tracks (
  style,
  artist,
  song,
  label,
  bpm_exact,
  bpm_note,
  release_date,
  release_precision,
  duration_sec,
  country,
  city,
  artist_bio,
  artist_genre,
  artist_profile_hint,
  source_url,
  deezer_url,
  spotify_url,
  beatport_url,
  instagram_url,
  soundcloud_url,
  ra_url,
  discogs_url,
  status,
  confidence,
  links_status
) values
  ('techno', 'Jeff Mills', 'The Bells', 'Axis', 132, 'local seed plus Deezer duration check', '1996-01-01', 'year', 289, 'United States', 'Detroit', 'Detroit techno architect and Axis founder with futurist machine funk language', 'detroit techno / techno', 'Use for classic Detroit pressure and precise sci fi pulse', 'https://www.deezer.com/track/623893232', 'https://www.deezer.com/track/623893232', 'https://open.spotify.com/artist/2eIDAcLKnWc4D350YyzvgS', 'https://www.beatport.com/artist/jeff-mills/39662', 'https://www.instagram.com/jeff_mills_official/', null, 'https://ra.co/dj/jeffmills', 'https://www.discogs.com/artist/205', 'published', 'high', 'verified_artist_links'),
  ('techno', 'Robert Hood', 'Minus', 'M-Plant', 128, 'local seed plus Deezer duration check', '1994-01-01', 'year', 322, 'United States', 'Detroit', 'Minimal techno pioneer and M-Plant founder focused on stripped rhythmic function', 'minimal techno / detroit techno', 'Use for minimal Detroit repetition and clean hypnotic drive', 'https://www.deezer.com/track/1736628267', 'https://www.deezer.com/track/1736628267', 'https://open.spotify.com/artist/5ipQlfnpRCtyOuhYqvPvQ8', 'https://www.beatport.com/artist/robert-hood/5625', null, null, null, 'https://www.discogs.com/artist/1136', 'published', 'high', 'verified_artist_links'),
  ('techno', 'Ben Klock', 'Subzero', 'Ostgut Ton', 130, 'local verified seed', '2009-01-01', 'year', 383, 'Germany', 'Berlin', 'Berlin techno figure linked to Berghain pressure and Klockworks depth', 'techno / minimal techno', 'Use for dark room hypnosis and clean rolling pressure', 'https://www.deezer.com/track/978183732', 'https://www.deezer.com/track/978183732', 'https://open.spotify.com/artist/1vJHfCreWAS46V8RZ67ojo', 'https://www.beatport.com/artist/ben-klock/39519', 'https://www.instagram.com/ben_klock/', 'https://soundcloud.com/ben-klock', 'https://ra.co/dj/benklock', 'https://www.discogs.com/artist/77025', 'published', 'high', 'verified_artist_links'),
  ('techno', 'DVS1', 'Black Russian', 'Klockworks', 132, 'local verified seed with external profile links', '2011-01-01', 'year', 390, 'United States', 'Minneapolis', 'Sound system focused US techno artist known for deep hypnotic warehouse sets', 'techno / hypnotic techno', 'Use for serious warehouse hypnosis and pressure without festival gloss', 'https://www.beatport.com/search?q=DVS1%20Black%20Russian', null, 'https://open.spotify.com/artist/2xrOogbM0l6NzOSp4zZ3IP', 'https://www.beatport.com/artist/dvs1/114780', null, 'https://soundcloud.com/dvs1', null, 'https://www.discogs.com/artist/1537114', 'published', 'high', 'verified_artist_links'),
  ('techno', 'Charlotte de Witte', 'Selected', 'KNTXT', 132, 'local seed plus Deezer duration check', '2019-01-01', 'year', 482, 'Belgium', 'Ghent', 'Belgian KNTXT founder associated with peak time techno and acid tension', 'peak time techno / techno', 'Use for modern high pressure techno with acid edge', 'https://www.deezer.com/track/2206339647', 'https://www.deezer.com/track/2206339647', 'https://open.spotify.com/artist/1lJhME1ZpzsEa5M0wW6Mso', 'https://www.beatport.com/artist/charlotte-de-witte/519996', 'https://www.instagram.com/charlottedewittemusic/', 'https://soundcloud.com/charlottedewittemusic', 'https://ra.co/dj/charlottedewitte-be', 'https://www.discogs.com/artist/4321662', 'published', 'high', 'verified_artist_links'),
  ('techno', 'ANNA', 'Hidden Beauties', 'Kompakt', 130, 'local seed plus Deezer duration check', '2018-01-01', 'year', 436, 'Brazil', 'Sao Paulo', 'Brazilian techno producer known for hypnotic motion and polished peak time tension', 'techno / peak time techno', 'Use for melodic tension inside a functional techno frame', 'https://www.deezer.com/track/437785492', 'https://www.deezer.com/track/437785492', null, 'https://www.beatport.com/search?q=ANNA%20Hidden%20Beauties', null, null, null, null, 'published', 'medium', 'needs_social_review'),
  ('techno', 'Len Faki', 'BX 3', 'Figure', 132, 'local seed plus Deezer duration check', '2007-01-01', 'year', 554, 'Germany', 'Berlin', 'Berlin DJ producer and Figure founder with direct tools and big room tension', 'techno / peak time techno', 'Use for driving tools and long form club momentum', 'https://www.deezer.com/track/963692492', 'https://www.deezer.com/track/963692492', 'https://open.spotify.com/artist/3fI3Z6NnYoeSQjcqPQDbM4', 'https://www.beatport.com/artist/len-faki/10206', 'https://www.instagram.com/len_faki/', 'https://soundcloud.com/lenfaki', 'https://ra.co/dj/lenfaki', 'https://www.discogs.com/artist/8520', 'published', 'high', 'verified_artist_links'),
  ('techno', 'Oscar Mulero', 'Electric Storm', 'Warm Up', 132, 'local seed plus Deezer duration check', '2012-01-01', 'year', 431, 'Spain', 'Madrid', 'Madrid techno figure behind Warm Up and PoleGroup with dark mental precision', 'techno / hypnotic techno', 'Use for severe Spanish techno and controlled darkness', 'https://www.deezer.com/track/72935726', 'https://www.deezer.com/track/72935726', 'https://open.spotify.com/artist/3jisZjR3TBVb9tIfTbRHTS', 'https://www.beatport.com/artist/oscar-mulero/7367', 'https://www.instagram.com/oscarmulerooficial/', 'https://soundcloud.com/oscarmulero', 'https://ra.co/dj/oscarmulero', 'https://www.discogs.com/artist/5159', 'published', 'high', 'verified_artist_links'),
  ('tech_house', 'Jamie Jones', 'My Paradise', 'Hot Creations', 126, 'local style guide plus platform source review', '2021-01-01', 'year', 170, 'United Kingdom', 'London', 'UK DJ producer linked to Hot Creations and the modern Paradise tech house sound', 'tech house / house', 'Use for warm tech house hooks and rolling Ibiza groove', 'https://www.beatport.com/search?q=Jamie%20Jones%20My%20Paradise', 'https://www.deezer.com/track/3155984551', 'https://open.spotify.com/artist/4admDxmnri5Zco0xYrJ0ji', 'https://www.beatport.com/artist/jamie-jones/27044', null, 'https://soundcloud.com/jamie-jones', 'https://ra.co/dj/jamiejones', 'https://www.discogs.com/artist/434183', 'published', 'medium', 'track_source_is_remix_result'),
  ('tech_house', 'Hot Since 82', 'Buggin', 'Knee Deep In Sound', 126, 'local verified seed plus Deezer duration check', '2019-01-01', 'year', 275, 'United Kingdom', 'Leeds', 'UK artist behind Knee Deep In Sound with deep tech house club focus', 'tech house / deep house', 'Use for muscular late night house with tech house swing', 'https://www.deezer.com/track/683110532', 'https://www.deezer.com/track/683110532', 'https://open.spotify.com/artist/1tRBmMtER4fGrzrt8O9VpS', 'https://www.beatport.com/artist/hot-since-82/212422', null, 'https://soundcloud.com/hotsince-82', null, 'https://www.discogs.com/artist/2413630', 'published', 'high', 'verified_artist_links'),
  ('tech_house', 'PAWSA', 'Room Service', 'Solid Grooves', 126, 'local seed plus Deezer duration check', '2019-01-01', 'year', 284, 'United Kingdom', 'London', 'London producer tied to Solid Grooves and stripped low slung tech house', 'tech house / minimal deep tech', 'Use for dry bassline groove and clean party swing', 'https://www.deezer.com/track/1801331127', 'https://www.deezer.com/track/1801331127', 'https://open.spotify.com/artist/4E0HD2PMY8kQJIjlShrLUS', 'https://www.beatport.com/artist/pawsa/386381', 'https://www.instagram.com/pawsaofficial/', null, null, 'https://www.discogs.com/artist/3750137', 'published', 'high', 'verified_artist_links'),
  ('tech_house', 'Michael Bibi', 'Hanging Tree', 'Solid Grooves', 126, 'local verified seed with external profile links', '2018-01-01', 'year', 390, 'United Kingdom', 'London', 'UK Solid Grooves figure known for dry percussion and bassline driven tech house', 'tech house', 'Use for direct floor friendly modern tech house', 'https://www.beatport.com/search?q=Michael%20Bibi%20Hanging%20Tree', null, 'https://open.spotify.com/artist/4cvdQRyHmkSQSakUrW2oxv', 'https://www.beatport.com/artist/michael-bibi/350292', 'https://www.instagram.com/michael_bibi_/', 'https://soundcloud.com/bibi-87', 'https://ra.co/dj/michaelbibi', 'https://www.discogs.com/artist/6016798', 'published', 'high', 'verified_artist_links'),
  ('tech_house', 'The Martinez Brothers', 'Kilo', 'Cuttin Headz', 126, 'local style guide plus platform source review', '2019-01-01', 'year', 247, 'United States', 'New York', 'Bronx rooted duo connecting house swing with tech house club pressure', 'tech house / house', 'Use for percussive house swing and Cuttin Headz energy', 'https://www.beatport.com/search?q=The%20Martinez%20Brothers%20Kilo', 'https://www.deezer.com/track/2689230132', 'https://open.spotify.com/artist/7B1LLuCQk13H4Mb6CFBftU', 'https://www.beatport.com/artist/the-martinez-brothers/30928', 'https://www.instagram.com/thembros/', 'https://soundcloud.com/themartinezbros', null, 'https://www.discogs.com/artist/715291', 'published', 'medium', 'track_source_is_remix_result'),
  ('tech_house', 'Dennis Cruz', 'El Sueno', 'Stereo Productions', 126, 'local seed plus Deezer duration check', '2017-01-01', 'year', 235, 'Spain', 'Madrid', 'Spanish tech house producer known for Latin percussion and direct rolling groove', 'tech house', 'Use for warm percussion and steady dancefloor momentum', 'https://www.deezer.com/track/566060422', 'https://www.deezer.com/track/566060422', 'https://open.spotify.com/artist/27mWOSZjlpmtoqsRjRwQyu', 'https://www.beatport.com/artist/dennis-cruz/325252', 'https://www.instagram.com/denniscruzdj/', 'https://soundcloud.com/denniscruz', 'https://ra.co/dj/denniscruz', 'https://www.discogs.com/artist/3617305', 'published', 'high', 'verified_artist_links'),
  ('tech_house', 'ANOTR', 'Relax My Eyes', 'No Art', 126, 'Deezer duration check plus style guide BPM', '2023-01-01', 'year', 192, 'Netherlands', 'Amsterdam', 'Amsterdam duo behind No Art with organic house detail and tech house propulsion', 'tech house / house', 'Use for warm vocal groove and polished modern house energy', 'https://www.deezer.com/track/2210691877', 'https://www.deezer.com/track/2210691877', 'https://open.spotify.com/artist/4p5WgeiPSPpqPDs7T6OkWf', 'https://www.beatport.com/artist/anotr/498574', 'https://www.instagram.com/anotr.music/', 'https://soundcloud.com/anotr', null, 'https://www.discogs.com/artist/4555640', 'published', 'high', 'verified_artist_links'),
  ('tech_house', 'Mochakk', 'Jealous', 'Black Book', 126, 'Deezer duration check plus style guide BPM', '2022-01-01', 'year', 256, 'Brazil', 'Sorocaba', 'Brazilian artist with playful high energy house and tech house club identity', 'tech house / house', 'Use for Brazilian club charisma and bouncy modern groove', 'https://www.deezer.com/track/2394757755', 'https://www.deezer.com/track/2394757755', 'https://open.spotify.com/artist/0rTh1tAdrEbdKZBTiiAQSo', 'https://www.beatport.com/artist/mochakk/660408', 'https://www.instagram.com/mochakk/', 'https://soundcloud.com/mochakkmusic', 'https://ra.co/dj/mochakk', 'https://www.discogs.com/artist/7725928', 'published', 'high', 'verified_artist_links'),
  ('hard_techno', '999999999', 'X0004000X', 'NineTimesNine', 150, 'local verified seed with external profile links', '2016-01-01', 'year', 360, 'Italy', null, 'Italian duo known for acid lines and fast hard techno live energy', 'acid techno / hard techno', 'Use for raw acid intensity and rave pressure', 'https://www.beatport.com/search?q=999999999%20X0004000X', null, 'https://open.spotify.com/artist/6uD2LjPHUjxrpax0se17Nc', 'https://www.beatport.com/artist/999999999/678489', 'https://www.instagram.com/999999999_live/', 'https://soundcloud.com/999999999music', null, 'https://www.discogs.com/artist/3693507', 'published', 'high', 'verified_artist_links'),
  ('hard_techno', 'Paula Temple', 'Gegen', 'R And S Records', 150, 'local seed plus Deezer duration check', '2014-01-01', 'year', 302, 'Germany', 'Berlin', 'Berlin based artist with industrial edge and high pressure techno language', 'hard techno / industrial techno', 'Use for physical industrial force and dark rave tension', 'https://www.deezer.com/track/97895276', 'https://www.deezer.com/track/97895276', 'https://open.spotify.com/artist/4iy2RFU8gIpXF5yaK0l8ZT', 'https://www.beatport.com/artist/paula-temple/8064', 'https://www.instagram.com/paulatemple/', 'https://soundcloud.com/paulatemple', 'https://ra.co/dj/paulatemple', 'https://www.discogs.com/artist/65539', 'published', 'high', 'verified_artist_links'),
  ('hard_techno', 'Shlomo', 'The Rapture', 'Taapion Records', 150, 'local seed plus Deezer duration check', '2015-01-01', 'year', 349, 'France', 'Paris', 'French producer connected to Taapion and emotional heavy techno pressure', 'hard techno / techno', 'Use for emotional hard techno with cinematic weight', 'https://www.deezer.com/track/357091041', 'https://www.deezer.com/track/357091041', null, 'https://www.beatport.com/search?q=Shlomo%20The%20Rapture', null, null, null, null, 'published', 'medium', 'needs_social_review'),
  ('hard_techno', 'Rebekah', 'Code Black', 'CLR', 150, 'local verified seed with external profile links', '2013-01-01', 'year', 390, 'United Kingdom', 'Birmingham', 'Birmingham born artist associated with hard industrial techno and direct peak time force', 'hard techno / industrial techno', 'Use for uncompromising industrial pressure and fast club impact', 'https://www.beatport.com/search?q=Rebekah%20Code%20Black', 'https://www.deezer.com/track/363698211', 'https://open.spotify.com/artist/7rmuxvt1D8dIU920lNcR67', 'https://www.beatport.com/artist/rebekah/12837', 'https://www.instagram.com/djrebekah/', 'https://soundcloud.com/rebekah', 'https://ra.co/dj/rebekah', 'https://www.discogs.com/artist/819297', 'published', 'medium', 'track_source_is_remix_result'),
  ('hard_techno', 'Remco Beekwilder', 'Industrofunk', 'EMERALD', 148, 'local seed plus Deezer duration check', '2018-01-01', 'year', 330, 'Netherlands', null, 'Dutch producer connecting rave textures with hard and functional techno', 'hard techno / rave techno', 'Use for ravey drive and heavy warehouse function', 'https://www.deezer.com/track/1969816267', 'https://www.deezer.com/track/1969816267', 'https://open.spotify.com/artist/093To89xljIKjuy5VguaP4', null, 'https://www.instagram.com/remcobeekwilder/', 'https://soundcloud.com/remco-beekwilder', 'https://ra.co/dj/remcobeekwilder', 'https://www.discogs.com/artist/3505847', 'published', 'high', 'verified_artist_links'),
  ('hard_techno', 'Klangkuenstler', 'Weltschmerz', 'Outworld', 150, 'Deezer duration check plus hard techno style guide BPM', '2021-01-01', 'year', 384, 'Germany', 'Berlin', 'Berlin based artist tied to the new hard techno wave with dark physical momentum', 'hard techno', 'Use for fast dark warehouse energy and modern rave pressure', 'https://www.deezer.com/track/1258662732', 'https://www.deezer.com/track/1258662732', 'https://open.spotify.com/artist/6H77vD9YyhyxHBTkRpbMBk', 'https://www.beatport.com/artist/klangkuenstler/188767', 'https://www.instagram.com/klangkuenstler/', 'https://soundcloud.com/klangkuenstler', 'https://ra.co/dj/klangkuenstler', 'https://www.discogs.com/artist/2643553', 'published', 'high', 'verified_artist_links'),
  ('hard_techno', 'Kobosil', 'Rigid', 'RK', 150, 'local artist seed plus external profile links', '2016-01-01', 'year', null, 'Germany', 'Berlin', 'Berlin artist associated with industrial hard techno and severe warehouse sound', 'hard techno / industrial techno', 'Use for stern industrial pressure and dark tunnel energy', 'https://www.beatport.com/search?q=Kobosil%20Rigid', null, 'https://open.spotify.com/artist/2ZvIFwl0BuQgHqWvDE80hC', 'https://www.beatport.com/artist/kobosil/354781', 'https://www.instagram.com/kobosil/', 'https://soundcloud.com/kobosil', 'https://ra.co/dj/kobosil', 'https://www.discogs.com/artist/3123359', 'published', 'medium', 'track_needs_duration_review'),
  ('hard_techno', 'I Hate Models', 'Daydream', 'Arts', 150, 'Deezer duration check plus hard techno style guide BPM', '2016-01-01', 'year', 463, 'France', null, 'French artist blending rave trance emotion with industrial and hard techno energy', 'hard techno / industrial techno', 'Use for emotional rave darkness and fast euphoric pressure', 'https://www.deezer.com/track/357057861', 'https://www.deezer.com/track/357057861', 'https://open.spotify.com/artist/0KqSULB80ft2H3aFg6kJmN', 'https://www.beatport.com/artist/i-hate-models/556508', 'https://www.instagram.com/ihatemodels1/', 'https://soundcloud.com/ihatemodels', 'https://ra.co/dj/ihatemodels', 'https://www.discogs.com/artist/5176527', 'published', 'high', 'verified_artist_links');

insert into public.catalog_artists as catalog_artists (
  style,
  artist,
  country,
  city,
  artist_bio,
  artist_genre,
  artist_profile_hint,
  source,
  source_url,
  status,
  metadata
)
select
  style,
  artist,
  country,
  city,
  artist_bio,
  artist_genre,
  artist_profile_hint,
  'club_styles_enrichment_v1_20260620',
  source_url,
  status,
  jsonb_strip_nulls(jsonb_build_object(
    'batch', 'club_styles_enrichment_v1_20260620',
    'confidence', confidence,
    'links_status', links_status,
    'recommended_track', song,
    'release_precision', release_precision,
    'bpm_note', bpm_note,
    'social_links', jsonb_strip_nulls(jsonb_build_object(
      'instagram', instagram_url,
      'soundcloud', soundcloud_url
    )),
    'profile_links', jsonb_strip_nulls(jsonb_build_object(
      'resident_advisor', ra_url,
      'discogs', discogs_url
    )),
    'platform_links', jsonb_strip_nulls(jsonb_build_object(
      'spotify', spotify_url,
      'deezer', deezer_url,
      'beatport', beatport_url
    ))
  ))
from club_styles_enrichment_v1_tracks
on conflict (style, artist_key) do update set
  country = coalesce(excluded.country, catalog_artists.country),
  city = coalesce(excluded.city, catalog_artists.city),
  artist_bio = excluded.artist_bio,
  artist_genre = excluded.artist_genre,
  artist_profile_hint = excluded.artist_profile_hint,
  source = excluded.source,
  source_url = excluded.source_url,
  status = excluded.status,
  metadata = coalesce(catalog_artists.metadata, '{}'::jsonb) || excluded.metadata,
  updated_at = now();

insert into public.catalog_tracks as catalog_tracks (
  style,
  artist,
  song,
  label,
  bpm_exact,
  preview_url,
  release_date,
  duration_sec,
  country,
  city,
  artist_bio,
  artist_genre,
  artist_profile_hint,
  source,
  source_url,
  status,
  metadata
)
select
  style,
  artist,
  song,
  label,
  bpm_exact,
  null,
  release_date,
  duration_sec,
  country,
  city,
  artist_bio,
  artist_genre,
  artist_profile_hint,
  'club_styles_enrichment_v1_20260620',
  source_url,
  status,
  jsonb_strip_nulls(jsonb_build_object(
    'batch', 'club_styles_enrichment_v1_20260620',
    'confidence', confidence,
    'links_status', links_status,
    'release_precision', release_precision,
    'bpm_note', bpm_note,
    'source_note', 'Curated from local verified seeds plus MusicBrainz URL relations and Deezer or Beatport checks where available.',
    'social_links', jsonb_strip_nulls(jsonb_build_object(
      'instagram', instagram_url,
      'soundcloud', soundcloud_url
    )),
    'profile_links', jsonb_strip_nulls(jsonb_build_object(
      'resident_advisor', ra_url,
      'discogs', discogs_url
    )),
    'platform_links', jsonb_strip_nulls(jsonb_build_object(
      'spotify_artist', spotify_url,
      'deezer_track', deezer_url,
      'beatport', beatport_url
    ))
  ))
from club_styles_enrichment_v1_tracks
on conflict (style, track_key) do update set
  label = excluded.label,
  bpm_exact = excluded.bpm_exact,
  preview_url = excluded.preview_url,
  release_date = excluded.release_date,
  duration_sec = coalesce(excluded.duration_sec, catalog_tracks.duration_sec),
  country = coalesce(excluded.country, catalog_tracks.country),
  city = coalesce(excluded.city, catalog_tracks.city),
  artist_bio = excluded.artist_bio,
  artist_genre = excluded.artist_genre,
  artist_profile_hint = excluded.artist_profile_hint,
  source = excluded.source,
  source_url = excluded.source_url,
  status = excluded.status,
  metadata = coalesce(catalog_tracks.metadata, '{}'::jsonb) || excluded.metadata,
  updated_at = now();
