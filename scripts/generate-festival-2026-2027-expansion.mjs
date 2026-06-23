#!/usr/bin/env node
import fs from "node:fs";
import path from "node:path";

const ROOT = process.cwd();
const BATCH = "festival_2026_2027_recommendations_20260622";
const DATA_OUT = path.join(ROOT, "data", `${BATCH}.csv`);
const SQL_OUT = path.join(ROOT, "supabase", "seeds", `${BATCH}.sql`);
const REPORT_OUT = path.join(ROOT, "reports", "festival_2026_2027_research_2026-06-22.md");

const FESTIVALS = {
  tomorrowland_belgium_2026: {
    name: "Tomorrowland Belgium 2026",
    datetime: "2026-07-17",
    dateOnly: true,
    venue: "De Schorre",
    city: "Boom",
    country: "BE",
    sourceUrl: "https://belgium.tomorrowland.com/en/line-up/",
    sourceName: "Tomorrowland"
  },
  ultra_europe_2026: {
    name: "Ultra Europe 2026",
    datetime: "2026-07-10",
    dateOnly: true,
    venue: "Park Mladezi",
    city: "Split",
    country: "HR",
    sourceUrl: "https://ultraeurope.com/lineup/",
    sourceName: "Ultra Europe"
  },
  defqon_1_2026: {
    name: "Defqon.1 2026",
    datetime: "2026-06-25",
    dateOnly: true,
    venue: "Evenemententerrein Biddinghuizen",
    city: "Biddinghuizen",
    country: "NL",
    sourceUrl: "https://www.q-dance.com/l/defqon1-2026-line-up",
    sourceName: "Q-dance"
  },
  dekmantel_2026: {
    name: "Dekmantel Festival 2026",
    datetime: "2026-07-29",
    dateOnly: true,
    venue: "Amsterdamse Bos",
    city: "Amsterdam",
    country: "NL",
    sourceUrl: "https://dekmantelfestival.com/program",
    sourceName: "Dekmantel"
  },
  ozora_2026: {
    name: "O.Z.O.R.A. Festival 2026",
    datetime: "2026-07-24",
    dateOnly: true,
    venue: "Dadpuszta",
    city: "Igar",
    country: "HU",
    sourceUrl: "https://2026.ozorafestival.eu/",
    sourceName: "O.Z.O.R.A."
  },
  palm_tree_napa_2026: {
    name: "Palm Tree Music Festival Napa 2026",
    datetime: "2026-10-02",
    dateOnly: true,
    venue: "The Meritage Resort and Spa",
    city: "Napa",
    country: "US",
    sourceUrl: "https://palmtreemusicfestival.com/napa/",
    sourceName: "Palm Tree Music Festival"
  },
  groove_cruise_2027: {
    name: "Groove Cruise Miami 2027",
    datetime: "2027-01-22",
    dateOnly: true,
    venue: "Festival at sea",
    city: "Miami",
    country: "US",
    sourceUrl: "https://www.groovecruise.com/lineup2027",
    sourceName: "Groove Cruise"
  }
};

const ARTISTS = [
  ["Calvin Harris", "edm", "Scotland", "Dumfries", ["tomorrowland_belgium_2026", "ultra_europe_2026"], "Mainstage EDM / dance-pop"],
  ["Martin Garrix", "progressive_edm", "Netherlands", "Amstelveen", ["tomorrowland_belgium_2026", "ultra_europe_2026"], "Progressive EDM / big-room"],
  ["Hardwell", "mainstage_techno", "Netherlands", "Breda", ["tomorrowland_belgium_2026", "ultra_europe_2026"], "Big-room techno / mainstage EDM"],
  ["Armin van Buuren", "trance_uplifting", "Netherlands", "Leiden", ["tomorrowland_belgium_2026", "ultra_europe_2026"], "Uplifting trance / progressive trance"],
  ["FISHER", "tech_house", "Australia", "Gold Coast", ["tomorrowland_belgium_2026", "ultra_europe_2026"], "Tech house"],
  ["Alok", "slap_house", "Brazil", "Goiania", ["tomorrowland_belgium_2026"], "Brazilian bass / slap house"],
  ["Dom Dolla", "tech_house", "Australia", "Melbourne", ["ultra_europe_2026"], "Tech house"],
  ["John Summit", "tech_house", "United States", "Chicago", ["tomorrowland_belgium_2026", "ultra_europe_2026"], "Tech house"],
  ["Sara Landry", "hard_techno", "United States", "Austin", ["tomorrowland_belgium_2026", "ultra_europe_2026"], "Hard techno"],
  ["I Hate Models", "industrial_techno", "France", "", ["tomorrowland_belgium_2026", "ultra_europe_2026"], "Industrial techno / hard techno"],
  ["Adam Beyer", "peak_time_techno", "Sweden", "Stockholm", ["ultra_europe_2026", "groove_cruise_2027"], "Peak-time techno / Drumcode"],
  ["Nico Moreno", "hard_techno", "France", "Caen", ["tomorrowland_belgium_2026", "ultra_europe_2026"], "Hard techno"],
  ["Subtronics", "riddim", "United States", "Philadelphia", ["ultra_europe_2026"], "Riddim / dubstep"],
  ["Jeff Mills", "detroit_techno", "United States", "Detroit", ["dekmantel_2026"], "Detroit techno"],
  ["Juan Atkins", "detroit_techno", "United States", "Detroit", ["dekmantel_2026"], "Detroit techno"],
  ["DVS1", "hypnotic_techno", "United States", "Minneapolis", ["dekmantel_2026"], "Hypnotic techno"],
  ["Helena Hauff", "electro", "Germany", "Hamburg", ["dekmantel_2026"], "Electro / acid / techno"],
  ["Objekt", "broken_techno", "United Kingdom", "Berlin", ["dekmantel_2026"], "Broken techno / bass-techno"],
  ["SHERELLE", "footwork_juke", "United Kingdom", "London", ["dekmantel_2026"], "Footwork / jungle / juke"],
  ["Shpongle", "psybient", "United Kingdom", "", ["ozora_2026"], "Psybient / psychedelic downtempo"],
  ["Solar Fields", "psybient", "Sweden", "Gothenburg", ["ozora_2026"], "Psybient / ambient trance"],
  ["Hallucinogen", "goa_trance", "United Kingdom", "", ["ozora_2026"], "Goa trance / psychedelic trance"],
  ["Captain Hook", "progressive_psy", "Israel", "", ["ozora_2026"], "Progressive psytrance"],
  ["Sensient", "dark_progressive", "Australia", "", ["ozora_2026"], "Dark progressive psy"],
  ["Tetrameth", "dark_progressive", "Australia", "", ["ozora_2026"], "Dark progressive psy"],
  ["D-Sturb", "rawstyle", "Netherlands", "", ["defqon_1_2026"], "Rawstyle"],
  ["D-Block & S-te-Fan", "hardstyle", "Netherlands", "", ["defqon_1_2026"], "Hardstyle"],
  ["Coone", "hardstyle", "Belgium", "", ["defqon_1_2026"], "Hardstyle"],
  ["DJ Isaac", "hardstyle", "Netherlands", "", ["defqon_1_2026"], "Hardstyle"],
  ["Miss K8", "gabber", "Ukraine", "", ["defqon_1_2026"], "Hardcore / gabber"],
  ["Kygo", "tropical_house", "Norway", "Bergen", ["palm_tree_napa_2026"], "Tropical house / melodic EDM"],
  ["Zedd", "electro_house", "Germany", "Kaiserslautern", ["palm_tree_napa_2026"], "Electro house / dance-pop"],
  ["Disclosure", "garage_house", "United Kingdom", "Reigate", ["palm_tree_napa_2026"], "UK garage / house"],
  ["HUGEL", "latin_house", "France", "Marseille", ["palm_tree_napa_2026"], "Afro Latin house / latin house"],
  ["BUNT.", "electronic_dance_pop", "Germany", "Stuttgart", ["groove_cruise_2027"], "Folk-house / dance-pop"],
  ["Disco Lines", "electronic_dance_pop", "United States", "Boulder", ["groove_cruise_2027"], "Dance-pop / house"],
  ["Eli Brown", "techno", "United Kingdom", "Bristol", ["groove_cruise_2027"], "Techno / tech house"]
].map(([artist, style, country, city, festivals, genre]) => ({ artist, style, country, city, festivals, genre }));

const TRACK_OVERRIDES = {
  Shpongle: "Dorset Perception",
  "Solar Fields": "Sol",
  Hallucinogen: "Shamanix"
};

const columns = [
  "style",
  "artist",
  "song",
  "label",
  "bpm_exact",
  "preview_url",
  "release_date",
  "duration_sec",
  "country",
  "city",
  "artist_bio",
  "artist_genre",
  "artist_profile_hint",
  "source",
  "source_url",
  "track_url",
  "deezer_track_id",
  "deezer_track_url",
  "cover_art_url",
  "youtube_track_url",
  "soundcloud_track_url",
  "bandcamp_track_url",
  "bandcamp_track_id",
  "source_tags",
  "album_keywords",
  "energy_band",
  "catalog_role",
  "confidence",
  "source_note",
  "social_discovery_links",
  "label_links"
];

function normalize(value = "") {
  return String(value || "")
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/&/g, "and")
    .replace(/[^a-z0-9]+/g, " ")
    .trim();
}

function csvEscape(value = "") {
  return `"${String(value ?? "").replace(/"/g, '""')}"`;
}

function sqlEscape(value = "") {
  return String(value ?? "").replace(/'/g, "''");
}

function sqlValue(value) {
  if (value === null || value === undefined || value === "") return "null";
  return `'${sqlEscape(value)}'`;
}

function safeDate(value = "") {
  const text = String(value || "").trim();
  return /^\d{4}-\d{2}-\d{2}$/.test(text) ? text : "";
}

async function deezerJson(url) {
  const response = await fetch(url, { headers: { accept: "application/json" } });
  if (!response.ok) throw new Error(`${response.status} ${response.statusText} from ${url}`);
  return response.json();
}

async function findDeezerArtist(seed) {
  const query = encodeURIComponent(seed.artist);
  const payload = await deezerJson(`https://api.deezer.com/search/artist?q=${query}&limit=10`);
  const candidates = Array.isArray(payload?.data) ? payload.data : [];
  const target = normalize(seed.artist);
  return candidates.find((candidate) => normalize(candidate.name) === target) ||
    candidates.find((candidate) => normalize(candidate.name).replace(/\.$/, "") === target.replace(/\.$/, "")) ||
    null;
}

async function findPlayableTrack(seed) {
  const artist = await findDeezerArtist(seed);
  if (!artist?.id) return { seed, artist: null, track: null };
  const override = TRACK_OVERRIDES[seed.artist];
  if (override) {
    const query = encodeURIComponent(`artist:"${artist.name}" track:"${override}"`);
    const overridePayload = await deezerJson(`https://api.deezer.com/search/track?q=${query}&limit=15`);
    const overrideTracks = Array.isArray(overridePayload?.data) ? overridePayload.data : [];
    const isCleanVersion = (candidate) => !/\b(remix|mix|live|edit|bootleg)\b/i.test(`${candidate?.title || ""} ${candidate?.title_version || ""}`);
    const exactOverride = (candidate) =>
      candidate?.readable &&
      candidate?.preview &&
      normalize(candidate?.artist?.name) === normalize(artist.name) &&
      normalize(candidate?.title_short || candidate?.title) === normalize(override);
    const cleanOverride = overrideTracks.find((candidate) => exactOverride(candidate) && isCleanVersion(candidate)) ||
      overrideTracks.find(exactOverride);
    if (cleanOverride) return { seed, artist, track: cleanOverride };
  }
  const payload = await deezerJson(`https://api.deezer.com/artist/${artist.id}/top?limit=25`);
  const tracks = Array.isArray(payload?.data) ? payload.data : [];
  const track = tracks.find((candidate) =>
    candidate?.readable &&
    candidate?.preview &&
    normalize(candidate?.artist?.name) === normalize(artist.name)
  ) || tracks.find((candidate) => candidate?.readable && candidate?.preview);
  return { seed, artist, track: track || null };
}

function eventText(festivalIds) {
  return festivalIds.map((id) => {
    const event = FESTIVALS[id];
    return `${event.name} (${event.datetime}, ${event.city}, ${event.country})`;
  }).join("; ");
}

function eventSources(festivalIds) {
  return festivalIds.map((id) => FESTIVALS[id].sourceUrl);
}

function rowFromMatch(match) {
  const { seed, track } = match;
  const festivalNames = seed.festivals.map((id) => FESTIVALS[id].name);
  const primaryEvent = FESTIVALS[seed.festivals[0]];
  const album = track.album || {};
  const sourceTags = [
    "festival_2026_2027",
    seed.style,
    ...seed.festivals,
    ...festivalNames.map((name) => normalize(name).replace(/\s+/g, "_"))
  ].join(";");
  const bio = `${seed.artist} entra no recorte de festivais 2026/2027 por line-up confirmado em ${festivalNames.join(", ")}.`;
  const hint = `Recomendar ${seed.artist} em ${seed.style}; evento futuro: ${eventText(seed.festivals)}.`;
  const sourceNote = `Artista anunciado em ${eventText(seed.festivals)}; faixa escolhida via Deezer com artista exato e preview tocavel.`;
  return {
    style: seed.style,
    artist: seed.artist,
    song: track.title,
    label: album.title || "Deezer top track",
    bpm_exact: "",
    preview_url: track.preview || "",
    release_date: safeDate(track.release_date || album.release_date || ""),
    duration_sec: track.duration || "",
    country: seed.country,
    city: seed.city,
    artist_bio: bio,
    artist_genre: seed.genre,
    artist_profile_hint: hint,
    source: BATCH,
    source_url: primaryEvent.sourceUrl,
    track_url: track.link || "",
    deezer_track_id: track.id || "",
    deezer_track_url: track.link || "",
    cover_art_url: album.cover_big || album.cover_medium || "",
    youtube_track_url: `https://www.youtube.com/results?search_query=${encodeURIComponent(`${seed.artist} ${track.title}`)}`,
    soundcloud_track_url: "",
    bandcamp_track_url: "",
    bandcamp_track_id: "",
    source_tags: sourceTags,
    album_keywords: [...festivalNames, seed.genre].join(";"),
    energy_band: "festival_future_anchor",
    catalog_role: "future_festival_recommendation;producer_with_verified_tracks",
    confidence: "high",
    source_note: sourceNote,
    social_discovery_links: eventSources(seed.festivals).join(";"),
    label_links: ""
  };
}

function artistRowsFromRows(rows) {
  const byKey = new Map();
  rows.forEach((row) => {
    const key = `${row.style}::${normalize(row.artist)}`;
    if (byKey.has(key)) return;
    byKey.set(key, {
      style: row.style,
      artist: row.artist,
      country: row.country,
      city: row.city,
      artist_bio: row.artist_bio,
      artist_genre: row.artist_genre,
      artist_profile_hint: row.artist_profile_hint,
      source: row.source,
      source_url: row.source_url,
      status: "published",
      metadata: {
        batch: BATCH,
        source_file: `data/${BATCH}.csv`,
        confidence: row.confidence,
        source_tags: row.source_tags.split(";").filter(Boolean),
        catalog_role: "future_festival_recommendation",
        future_events: ARTISTS.find((seed) => seed.artist === row.artist)?.festivals.map((id) => FESTIVALS[id]) || []
      }
    });
  });
  return [...byKey.values()];
}

function writeCsv(rows) {
  const lines = [columns.map(csvEscape).join(",")];
  rows.forEach((row) => {
    lines.push(columns.map((column) => csvEscape(row[column])).join(","));
  });
  fs.writeFileSync(DATA_OUT, `${lines.join("\n")}\n`, "utf8");
}

function writeSql(rows) {
  const artistRows = artistRowsFromRows(rows);
  const artistValues = artistRows.map((row) => `(
  ${sqlValue(row.style)},
  ${sqlValue(row.artist)},
  ${sqlValue(row.country)},
  ${sqlValue(row.city)},
  ${sqlValue(row.artist_bio)},
  ${sqlValue(row.artist_genre)},
  ${sqlValue(row.artist_profile_hint)},
  ${sqlValue(row.source)},
  ${sqlValue(row.source_url)},
  'published',
  '${sqlEscape(JSON.stringify(row.metadata))}'::jsonb
)`).join(",\n");

  const trackValues = rows.map((row) => {
    const metadata = {
      batch: BATCH,
      source_file: `data/${BATCH}.csv`,
      playback_policy: "published_requires_in_app_playback",
      playable_sources: ["audio_preview", "deezer_preview_refresh"],
      deezer_track_id: String(row.deezer_track_id || ""),
      deezer_track_url: row.deezer_track_url,
      cover_art_url: row.cover_art_url,
      youtube_track_url: row.youtube_track_url,
      source_tags: row.source_tags.split(";").filter(Boolean),
      album_keywords: row.album_keywords.split(";").filter(Boolean),
      energy_band: row.energy_band,
      catalog_role: row.catalog_role,
      confidence: row.confidence,
      future_events: ARTISTS.find((seed) => seed.artist === row.artist)?.festivals.map((id) => FESTIVALS[id]) || []
    };
    return `(
  ${sqlValue(row.style)},
  ${sqlValue(row.artist)},
  ${sqlValue(row.song)},
  ${sqlValue(row.label)},
  null,
  ${sqlValue(row.preview_url)},
  ${sqlValue(row.release_date)},
  ${row.duration_sec ? Number(row.duration_sec) : "null"},
  ${sqlValue(row.country)},
  ${sqlValue(row.city)},
  ${sqlValue(row.artist_bio)},
  ${sqlValue(row.artist_genre)},
  ${sqlValue(row.artist_profile_hint)},
  ${sqlValue(row.source)},
  ${sqlValue(row.source_url)},
  'published',
  '${sqlEscape(JSON.stringify(metadata))}'::jsonb
)`;
  }).join(",\n");

  const sql = `-- Sonic Search - future festival recommendation batch.
-- Generated 2026-06-22.
-- Run after supabase/migrations/20260619024500_catalog_extra.sql.

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
) values
${artistValues}
on conflict (style, artist_key) do update set
  country = coalesce(excluded.country, catalog_artists.country),
  city = coalesce(excluded.city, catalog_artists.city),
  artist_bio = coalesce(excluded.artist_bio, catalog_artists.artist_bio),
  artist_genre = coalesce(excluded.artist_genre, catalog_artists.artist_genre),
  artist_profile_hint = coalesce(excluded.artist_profile_hint, catalog_artists.artist_profile_hint),
  source = excluded.source,
  source_url = coalesce(excluded.source_url, catalog_artists.source_url),
  status = case when catalog_artists.status = 'hidden' then catalog_artists.status else excluded.status end,
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
) values
${trackValues}
on conflict (style, track_key) do update set
  label = coalesce(excluded.label, catalog_tracks.label),
  bpm_exact = coalesce(excluded.bpm_exact, catalog_tracks.bpm_exact),
  preview_url = coalesce(excluded.preview_url, catalog_tracks.preview_url),
  release_date = coalesce(excluded.release_date, catalog_tracks.release_date),
  duration_sec = coalesce(excluded.duration_sec, catalog_tracks.duration_sec),
  country = coalesce(excluded.country, catalog_tracks.country),
  city = coalesce(excluded.city, catalog_tracks.city),
  artist_bio = coalesce(excluded.artist_bio, catalog_tracks.artist_bio),
  artist_genre = coalesce(excluded.artist_genre, catalog_tracks.artist_genre),
  artist_profile_hint = coalesce(excluded.artist_profile_hint, catalog_tracks.artist_profile_hint),
  source = excluded.source,
  source_url = coalesce(excluded.source_url, catalog_tracks.source_url),
  status = case when catalog_tracks.status = 'hidden' then catalog_tracks.status else excluded.status end,
  metadata = coalesce(catalog_tracks.metadata, '{}'::jsonb) || excluded.metadata,
  updated_at = now();
`;
  fs.writeFileSync(SQL_OUT, sql, "utf8");
}

function writeReport(rows, misses) {
  const byFestival = Object.entries(FESTIVALS).map(([id, festival]) => {
    const artists = ARTISTS.filter((seed) => seed.festivals.includes(id)).map((seed) => seed.artist);
    return `| ${festival.name} | ${festival.datetime} | ${festival.city}, ${festival.country} | ${artists.join(", ")} | ${festival.sourceUrl} |`;
  }).join("\n");
  const trackLines = rows.map((row) => `| ${row.artist} | ${row.style} | ${row.song} | ${row.deezer_track_id} | ${eventText(ARTISTS.find((seed) => seed.artist === row.artist)?.festivals || [])} |`).join("\n");
  const missedLines = misses.length
    ? misses.map((miss) => `- ${miss.seed.artist}: ${miss.reason}`).join("\n")
    : "- Nenhum artista descartado no lote final.";
  const report = `# Future Electronic Festival Recommendations

Data: 2026-06-22

## Escopo

Primeiro lote curado de festivais eletronicos futuros em 2026 e 2027. O criterio foi: evento futuro, line-up publicado em fonte oficial ou fonte de festival/ticketing forte, artista/projeto produtor com faixa tocavel via Deezer, e subgenero conservador para evitar confundir techno, EDM, hard dance e psytrance.

Para 2027, so entrou Groove Cruise Miami 2027 porque a pagina de line-up ja esta publicada. Eventos 2027 sem line-up confirmado devem ficar em monitoramento e nao foram usados para gerar recomendacoes.

## Festivais usados

| Festival | Data inicial | Local | Artistas deste lote | Fonte |
| --- | --- | --- | --- | --- |
${byFestival}

## Faixas tocaveis adicionadas

| Artist | Style | Track | Deezer id | Eventos futuros |
| --- | --- | --- | --- | --- |
${trackLines}

## Descartes / cuidado editorial

${missedLines}

## Arquivos

- \`data/${BATCH}.csv\`
- \`supabase/seeds/${BATCH}.sql\`
`;
  fs.writeFileSync(REPORT_OUT, report, "utf8");
}

async function main() {
  fs.mkdirSync(path.dirname(DATA_OUT), { recursive: true });
  fs.mkdirSync(path.dirname(SQL_OUT), { recursive: true });
  fs.mkdirSync(path.dirname(REPORT_OUT), { recursive: true });

  const matches = [];
  const misses = [];
  for (const seed of ARTISTS) {
    try {
      const match = await findPlayableTrack(seed);
      if (!match.artist) {
        misses.push({ seed, reason: "Deezer artist exact match not found." });
        continue;
      }
      if (!match.track) {
        misses.push({ seed, reason: `No playable preview found for Deezer artist ${match.artist.name}.` });
        continue;
      }
      matches.push(match);
      console.log(`${seed.artist}: ${match.track.title}`);
    } catch (error) {
      misses.push({ seed, reason: error.message });
    }
  }

  const rows = matches.map(rowFromMatch);
  writeCsv(rows);
  writeSql(rows);
  writeReport(rows, misses);
  console.log(`Wrote ${rows.length} rows to ${path.relative(ROOT, DATA_OUT)}`);
  if (misses.length) {
    console.log("Misses:");
    misses.forEach((miss) => console.log(`- ${miss.seed.artist}: ${miss.reason}`));
  }
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
