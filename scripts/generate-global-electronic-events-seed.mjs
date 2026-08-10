import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const SCRIPT_DIR = path.dirname(fileURLToPath(import.meta.url));
const ROOT_DIR = path.resolve(SCRIPT_DIR, "..");
const INPUT_PATH = path.join(ROOT_DIR, "data", "global_electronic_events_seed_20260713.csv");
const OUTPUT_PATH = path.join(ROOT_DIR, "supabase", "seeds", "global_electronic_events_seed_20260713.sql");
const CHECK_ONLY = process.argv.includes("--check");

const EXPECTED_HEADERS = [
  "slug",
  "name",
  "event_type",
  "electronic_focus",
  "market_tier",
  "franchise_name",
  "home_city",
  "home_country_code",
  "continent",
  "founding_year",
  "official_url",
  "primary_genres",
  "selection_basis",
  "djmag_2026_rank",
  "publication_status",
  "notes",
];

const ALLOWED_EVENT_TYPES = new Set([
  "festival",
  "festival_series",
  "party_series",
  "citywide_program",
  "cruise_festival",
  "mixed_genre_festival",
]);
const ALLOWED_FOCUS = new Set(["exclusive", "primary", "significant"]);
const ALLOWED_TIERS = new Set(["global_mega", "global_major", "regional_major", "specialist_major"]);
const ALLOWED_CONTINENTS = new Set([
  "Africa",
  "Asia",
  "Europe",
  "North America",
  "South America",
  "Oceania",
  "Global",
]);
const ALLOWED_PUBLICATION = new Set(["published", "draft", "needs_review", "hidden"]);

const GENRE_FAMILIES = {
  afro_house: "house",
  ambient: "electronic",
  bass_music: "bass",
  dance_pop: "edm",
  deep_house: "house",
  detroit_techno: "techno",
  drum_and_bass: "bass",
  dubstep: "bass",
  edm: "edm",
  electro: "electronic",
  electronic_live: "electronic",
  experimental_electronic: "electronic",
  goa_trance: "psytrance",
  hardcore: "hard_dance",
  hardstyle: "hard_dance",
  house: "house",
  melodic_techno: "techno",
  progressive_psy: "psytrance",
  psytrance: "psytrance",
  tech_house: "house",
  techno: "techno",
  trance: "trance",
};

function parseCsv(text) {
  const records = [];
  let record = [];
  let field = "";
  let quoted = false;

  for (let index = 0; index < text.length; index += 1) {
    const character = text[index];
    const next = text[index + 1];

    if (character === '"') {
      if (quoted && next === '"') {
        field += '"';
        index += 1;
      } else {
        quoted = !quoted;
      }
      continue;
    }

    if (character === "," && !quoted) {
      record.push(field);
      field = "";
      continue;
    }

    if ((character === "\n" || character === "\r") && !quoted) {
      if (character === "\r" && next === "\n") index += 1;
      record.push(field);
      field = "";
      if (record.some((value) => value.length > 0)) records.push(record);
      record = [];
      continue;
    }

    field += character;
  }

  if (quoted) throw new Error("CSV invalido: campo entre aspas nao foi encerrado.");
  if (field.length > 0 || record.length > 0) {
    record.push(field);
    if (record.some((value) => value.length > 0)) records.push(record);
  }

  return records;
}

function fail(message) {
  throw new Error(`global electronic events seed: ${message}`);
}

function sqlText(value) {
  if (value === undefined || value === null || value === "") return "null";
  return `'${String(value).replaceAll("'", "''")}'`;
}

function sqlInteger(value) {
  return value === undefined || value === null || value === "" ? "null" : String(Number(value));
}

function sqlTextArray(values) {
  if (!values.length) return "'{}'::text[]";
  return `array[${values.map(sqlText).join(", ")}]::text[]`;
}

function genreLabel(slug) {
  const labels = {
    edm: "EDM",
    drum_and_bass: "Drum and bass",
    psytrance: "Psytrance",
  };
  if (labels[slug]) return labels[slug];
  return slug
    .split("_")
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}

const parsed = parseCsv(fs.readFileSync(INPUT_PATH, "utf8"));
if (!parsed.length) fail("o CSV esta vazio");

const headers = parsed[0];
if (headers.join("|") !== EXPECTED_HEADERS.join("|")) {
  fail(`cabecalho inesperado: ${headers.join(",")}`);
}

const rows = parsed.slice(1).map((values, index) => {
  if (values.length !== headers.length) {
    fail(`linha ${index + 2} tem ${values.length} colunas; esperado ${headers.length}`);
  }
  return Object.fromEntries(headers.map((header, headerIndex) => [header, values[headerIndex].trim()]));
});

if (rows.length < 50) fail(`esperava pelo menos 50 marcas; encontrei ${rows.length}`);

const seenSlugs = new Set();
const seenNames = new Set();
const seenRanks = new Set();
const seenUrls = new Set();

for (const [index, row] of rows.entries()) {
  const line = index + 2;
  if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(row.slug)) fail(`slug invalido na linha ${line}: ${row.slug}`);
  if (seenSlugs.has(row.slug)) fail(`slug duplicado: ${row.slug}`);
  seenSlugs.add(row.slug);

  const normalizedName = row.name.toLocaleLowerCase("en");
  if (!row.name) fail(`nome vazio na linha ${line}`);
  if (seenNames.has(normalizedName)) fail(`nome duplicado: ${row.name}`);
  seenNames.add(normalizedName);

  if (!ALLOWED_EVENT_TYPES.has(row.event_type)) fail(`event_type invalido em ${row.slug}`);
  if (!ALLOWED_FOCUS.has(row.electronic_focus)) fail(`electronic_focus invalido em ${row.slug}`);
  if (!ALLOWED_TIERS.has(row.market_tier)) fail(`market_tier invalido em ${row.slug}`);
  if (!ALLOWED_CONTINENTS.has(row.continent)) fail(`continente invalido em ${row.slug}`);
  if (!ALLOWED_PUBLICATION.has(row.publication_status)) fail(`publication_status invalido em ${row.slug}`);
  if (row.continent !== "Global" && !/^[A-Z]{2}$/.test(row.home_country_code)) {
    fail(`codigo de pais invalido em ${row.slug}`);
  }
  if (row.home_country_code && !/^[A-Z]{2}$/.test(row.home_country_code)) {
    fail(`codigo de pais invalido em ${row.slug}`);
  }
  if (row.founding_year && (Number(row.founding_year) < 1900 || Number(row.founding_year) > 2100)) {
    fail(`ano de fundacao invalido em ${row.slug}`);
  }
  try {
    const url = new URL(row.official_url);
    if (!new Set(["http:", "https:"]).has(url.protocol)) throw new Error("protocolo invalido");
  } catch {
    fail(`URL oficial invalida em ${row.slug}: ${row.official_url}`);
  }
  if (seenUrls.has(row.official_url)) fail(`URL oficial duplicada: ${row.official_url}`);
  seenUrls.add(row.official_url);

  const genres = row.primary_genres.split("|").filter(Boolean);
  if (!genres.length) fail(`sem generos em ${row.slug}`);
  for (const genre of genres) {
    if (!/^[a-z0-9]+(?:_[a-z0-9]+)*$/.test(genre)) fail(`genero invalido em ${row.slug}: ${genre}`);
  }

  if (row.djmag_2026_rank) {
    const rank = Number(row.djmag_2026_rank);
    if (!Number.isInteger(rank) || rank < 1 || rank > 100) fail(`ranking DJ Mag invalido em ${row.slug}`);
    if (seenRanks.has(rank)) fail(`posicao DJ Mag duplicada: ${rank}`);
    seenRanks.add(rank);
  }
}

const brandValues = rows.map((row) => {
  const genres = row.primary_genres.split("|").filter(Boolean);
  return `(${[
    sqlText(row.slug),
    sqlText(row.name),
    sqlText(row.event_type),
    sqlText(row.electronic_focus),
    sqlText(row.market_tier),
    sqlText(row.franchise_name),
    sqlText(row.home_city),
    sqlText(row.home_country_code),
    sqlText(row.continent),
    sqlInteger(row.founding_year),
    sqlText(row.official_url),
    sqlTextArray(genres),
    sqlText(row.selection_basis),
    sqlText("active"),
    sqlText(row.publication_status),
    sqlText("curated"),
    sqlText(row.notes),
  ].join(", ")})`;
});

const allGenres = [...new Set(rows.flatMap((row) => row.primary_genres.split("|").filter(Boolean)))].sort();
const genreValues = allGenres.map((genre) =>
  `(${sqlText(genre)}, ${sqlText(genreLabel(genre))}, ${sqlText(GENRE_FAMILIES[genre] || "electronic")})`,
);

const brandGenreValues = rows.flatMap((row) =>
  row.primary_genres.split("|").filter(Boolean).map((genre, genreIndex) =>
    `(${sqlText(row.slug)}, ${sqlText(genre)}, ${genreIndex === 0 ? "true" : "false"})`,
  ),
);

const officialSourceValues = rows.map((row) =>
  `('official_event', ${sqlText(row.name)}, ${sqlText(`${row.name} - site oficial`)}, ${sqlText(row.official_url)}, true, 'A', 'Fonte oficial usada para identidade e URL canonica da marca.')`,
);

const officialSourceLinkValues = rows.map((row) => `(${sqlText(row.slug)}, ${sqlText(row.official_url)})`);

const rankedRows = rows.filter((row) => row.djmag_2026_rank);
const rankingValues = rankedRows.map((row) =>
  `(${sqlText(`djmag-top-100-festivals-2026-${row.slug}`)}, ${sqlText(row.slug)}, ${sqlInteger(row.djmag_2026_rank)})`,
);
const rankingLinkValues = rankedRows.map((row) => `(${sqlText(row.slug)})`);

const sql = `-- GENERATED FILE. Source: data/global_electronic_events_seed_20260713.csv
-- Generated by scripts/generate-global-electronic-events-seed.mjs.
-- Run after supabase/migrations/20260713000100_global_electronic_events.sql.

begin;

insert into public.electronic_event_brands as brands (
  slug,
  name,
  event_type,
  electronic_focus,
  market_tier,
  franchise_name,
  home_city,
  home_country_code,
  continent,
  founding_year,
  official_url,
  primary_genres,
  selection_basis,
  lifecycle_status,
  publication_status,
  data_quality,
  notes
) values
${brandValues.join(",\n")}
on conflict (slug) do update set
  name = excluded.name,
  event_type = excluded.event_type,
  electronic_focus = excluded.electronic_focus,
  market_tier = excluded.market_tier,
  franchise_name = excluded.franchise_name,
  home_city = excluded.home_city,
  home_country_code = excluded.home_country_code,
  continent = excluded.continent,
  founding_year = excluded.founding_year,
  official_url = excluded.official_url,
  primary_genres = excluded.primary_genres,
  selection_basis = excluded.selection_basis,
  lifecycle_status = excluded.lifecycle_status,
  publication_status = excluded.publication_status,
  data_quality = excluded.data_quality,
  notes = excluded.notes;

insert into public.electronic_event_genres as genres (slug, name, family) values
${genreValues.join(",\n")}
on conflict (slug) do update set
  name = excluded.name,
  family = excluded.family;

insert into public.electronic_event_brand_genres as brand_genres (
  event_brand_id,
  genre_id,
  is_primary
)
select
  brands.id,
  genres.id,
  links.is_primary
from (values
  ${brandGenreValues.join(",\n  ")}
) as links (brand_slug, genre_slug, is_primary)
join public.electronic_event_brands brands on brands.slug = links.brand_slug
join public.electronic_event_genres genres on genres.slug = links.genre_slug
on conflict (event_brand_id, genre_id) do update set
  is_primary = excluded.is_primary;

insert into public.electronic_event_sources as sources (
  source_type,
  publisher,
  title,
  url,
  is_primary,
  reliability_grade,
  notes
) values
${officialSourceValues.join(",\n")}
on conflict (url) do update set
  source_type = excluded.source_type,
  publisher = excluded.publisher,
  title = excluded.title,
  retrieved_at = now(),
  is_primary = excluded.is_primary,
  reliability_grade = excluded.reliability_grade,
  notes = excluded.notes;

insert into public.electronic_event_source_links (
  source_id,
  event_brand_id,
  fact_scope
)
select
  sources.id,
  brands.id,
  'identity_and_official_url'
from (values
  ${officialSourceLinkValues.join(",\n  ")}
) as links (brand_slug, source_url)
join public.electronic_event_brands brands on brands.slug = links.brand_slug
join public.electronic_event_sources sources on sources.url = links.source_url
on conflict (source_id, event_brand_id, fact_scope) do nothing;

insert into public.electronic_event_sources as sources (
  source_type,
  publisher,
  title,
  url,
  published_on,
  is_primary,
  reliability_grade,
  notes
) values (
  'ranking',
  'DJ Mag',
  'Top 100 Festivals 2026',
  'https://djmag.com/top100festivals',
  '2026-07-02',
  true,
  'B',
  'Votacao de leitores. Mede popularidade declarada e nao publico ou capacidade.'
)
on conflict (url) do update set
  title = excluded.title,
  published_on = excluded.published_on,
  retrieved_at = now(),
  reliability_grade = excluded.reliability_grade,
  notes = excluded.notes;

insert into public.electronic_event_rankings as rankings (
  ranking_key,
  event_brand_id,
  source_id,
  ranking_name,
  ranking_year,
  category,
  rank_position,
  notes
)
select
  ranking_rows.ranking_key,
  brands.id,
  sources.id,
  'DJ Mag Top 100 Festivals',
  2026,
  'reader_vote_overall',
  ranking_rows.rank_position,
  'Ranking por voto de leitores; nao usar como ranking de publico.'
from (values
  ${rankingValues.join(",\n  ")}
) as ranking_rows (ranking_key, brand_slug, rank_position)
join public.electronic_event_brands brands on brands.slug = ranking_rows.brand_slug
join public.electronic_event_sources sources on sources.url = 'https://djmag.com/top100festivals'
on conflict (ranking_key) do update set
  event_brand_id = excluded.event_brand_id,
  source_id = excluded.source_id,
  ranking_name = excluded.ranking_name,
  ranking_year = excluded.ranking_year,
  category = excluded.category,
  rank_position = excluded.rank_position,
  notes = excluded.notes;

insert into public.electronic_event_source_links (
  source_id,
  event_brand_id,
  fact_scope
)
select
  sources.id,
  brands.id,
  'ranking_djmag_2026'
from (values
  ${rankingLinkValues.join(",\n  ")}
) as links (brand_slug)
join public.electronic_event_brands brands on brands.slug = links.brand_slug
join public.electronic_event_sources sources on sources.url = 'https://djmag.com/top100festivals'
on conflict (source_id, event_brand_id, fact_scope) do nothing;

insert into public.electronic_event_sources as sources (
  source_type,
  publisher,
  title,
  url,
  published_on,
  is_primary,
  reliability_grade,
  notes
) values (
  'organizer',
  'Insomniac / Vibee / Virgin Hotels Las Vegas',
  'Hotel EDC 2025 announcement',
  'https://s3.amazonaws.com/virginhotelslv.com/content/uploads/2024/09/Final_Hotel-EDC-2025-Announcement.pdf',
  '2024-09-10',
  true,
  'A',
  'Comunicado oficial que informa mais de 525 mil fas ao longo de tres dias.'
)
on conflict (url) do update set
  title = excluded.title,
  published_on = excluded.published_on,
  retrieved_at = now(),
  reliability_grade = excluded.reliability_grade,
  notes = excluded.notes;

insert into public.electronic_event_attendance_metrics as metrics (
  metric_key,
  event_brand_id,
  source_id,
  metric_type,
  metric_value,
  metric_unit,
  comparison_operator,
  reference_year,
  period_days,
  is_estimate,
  confidence,
  notes
)
select
  'edc-las-vegas-annual-cumulative-entries-525000',
  brands.id,
  sources.id,
  'cumulative_entries',
  525000,
  'entries',
  'at_least',
  2024,
  3,
  false,
  0.950,
  'Benchmark anual publicado em 2024. Nao representa 525 mil pessoas unicas.'
from public.electronic_event_brands brands
join public.electronic_event_sources sources
  on sources.url = 'https://s3.amazonaws.com/virginhotelslv.com/content/uploads/2024/09/Final_Hotel-EDC-2025-Announcement.pdf'
where brands.slug = 'edc-las-vegas'
on conflict (metric_key) do update set
  event_brand_id = excluded.event_brand_id,
  source_id = excluded.source_id,
  metric_type = excluded.metric_type,
  metric_value = excluded.metric_value,
  metric_unit = excluded.metric_unit,
  comparison_operator = excluded.comparison_operator,
  reference_year = excluded.reference_year,
  period_days = excluded.period_days,
  is_estimate = excluded.is_estimate,
  confidence = excluded.confidence,
  notes = excluded.notes;

insert into public.electronic_event_source_links (
  source_id,
  event_brand_id,
  fact_scope
)
select
  sources.id,
  brands.id,
  'attendance_cumulative_entries'
from public.electronic_event_brands brands
join public.electronic_event_sources sources
  on sources.url = 'https://s3.amazonaws.com/virginhotelslv.com/content/uploads/2024/09/Final_Hotel-EDC-2025-Announcement.pdf'
where brands.slug = 'edc-las-vegas'
on conflict (source_id, event_brand_id, fact_scope) do nothing;

commit;
`;

if (!CHECK_ONLY) {
  fs.writeFileSync(OUTPUT_PATH, sql, "utf8");
}

process.stdout.write(
  `${CHECK_ONLY ? "validated" : "generated"}: ${rows.length} brands, ${allGenres.length} genres, ${rankedRows.length} DJ Mag rankings${CHECK_ONLY ? "" : ` -> ${path.relative(ROOT_DIR, OUTPUT_PATH)}`}\n`,
);
