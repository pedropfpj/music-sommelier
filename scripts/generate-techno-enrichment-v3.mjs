import fs from "node:fs";
import path from "node:path";

const ROOT = process.cwd();
const BATCH = "techno_enrichment_v3_20260621";
const DATA_DIR = path.join(ROOT, "data");
const SEED_DIR = path.join(ROOT, "supabase", "seeds");
const REPORT_DIR = path.join(ROOT, "reports");
const TRACK_OUT = path.join(DATA_DIR, `${BATCH}.csv`);
const PROFILE_OUT = path.join(DATA_DIR, "techno_artist_profiles_v3_20260621.csv");
const SQL_OUT = path.join(SEED_DIR, `${BATCH}.sql`);
const REPORT_OUT = path.join(REPORT_DIR, "techno_enrichment_v3_2026-06-21.md");

const TRACKS = [
  ["deep_techno", "Luigi Tozzi", "Tender Is The Night", "Hypnus Records", 128, "Italy", "Deep Techno / Hypnotic Techno", "deep_atmospheric_anchor"],
  ["deep_techno", "Claudio PRC", "Inner State", "Prologue", 128, "Italy", "Deep Techno / Hypnotic Techno", "deep_mental_anchor"],
  ["deep_techno", "Deepbass", "Parallel to Radius", "Informa Records", 128, "United Kingdom", "Deep Techno / Atmospheric Techno", "uk_deep_techno_depth"],
  ["deep_techno", "Ness", "Trancemigration", "The Gods Planet", 128, "Italy", "Deep Techno / Mental Techno", "italian_deep_techno_depth"],
  ["deep_techno", "Artefakt", "The Fifth Planet", "Delsin", 128, "Netherlands", "Deep Techno / Atmospheric Techno", "delsin_atmospheric_anchor"],
  ["deep_techno", "Polar Inertia", "The Last Vehicle", "Dement3d", 130, "France", "Deep Techno / Atmospheric Techno", "french_atmospheric_anchor"],

  ["ambient_techno", "B12", "Telefone 529", "Warp Records", 125, "United Kingdom", "Ambient Techno / IDM", "warp_ambient_techno_anchor"],
  ["ambient_techno", "The Black Dog", "Virtual", "Warp Records", 126, "United Kingdom", "Ambient Techno / IDM", "uk_intelligent_techno_anchor"],
  ["ambient_techno", "Global Communication", "14:31", "Dedicated", 90, "United Kingdom", "Ambient Techno / Ambient", "ambient_techno_downshift"],
  ["ambient_techno", "Biosphere", "Novelty Waves", "Apollo", 128, "Norway", "Ambient Techno / Arctic Ambient", "arctic_ambient_techno"],
  ["ambient_techno", "Higher Intelligence Agency", "Ketamine Entity", "Beyond", 120, "United Kingdom", "Ambient Techno / Intelligent Techno", "intelligent_techno_depth"],
  ["ambient_techno", "Voices From The Lake", "Velo Di Maya", "Prologue", 126, "Italy", "Ambient Techno / Deep Techno", "ambient_deep_techno_bridge"],

  ["bleep_techno", "LFO", "LFO", "Warp Records", 123, "United Kingdom", "Bleep Techno / Sheffield Techno", "warp_bleep_origin"],
  ["bleep_techno", "Sweet Exorcist", "Testone", "Warp Records", 124, "United Kingdom", "Bleep Techno / UK Techno", "sheffield_bleep_anchor"],
  ["bleep_techno", "Forgemasters", "Track With No Name", "Warp Records", 122, "United Kingdom", "Bleep Techno / Sheffield Techno", "warp_catalog_origin"],
  ["bleep_techno", "Nightmares on Wax", "Dextrous", "Warp Records", 124, "United Kingdom", "Bleep Techno / UK Rave", "bleep_rave_bridge"],
  ["bleep_techno", "Unique 3", "The Theme", "10 Records", 122, "United Kingdom", "Bleep Techno / UK Bass", "uk_bass_bleep_origin"],
  ["bleep_techno", "Tricky Disco", "Tricky Disco", "Warp Records", 123, "United Kingdom", "Bleep Techno / Rave Techno", "rave_bleep_anchor"],

  ["tribal_techno", "Cave", "Street Carnival", "Ingoma", 136, "Norway", "Tribal Techno / Percussive Techno", "tribal_loop_anchor"],
  ["tribal_techno", "Hertz", "Recreate", "Sway", 136, "Sweden", "Tribal Techno / Percussive Techno", "swedish_percussive_tool"],
  ["tribal_techno", "The Advent", "Bad Boy", "Kombination Research", 137, "United Kingdom", "Tribal Techno / Hardgroove", "tribal_hardgroove_bridge"],
  ["tribal_techno", "Marco Bailey", "Sniff", "MB Elektronics", 136, "Belgium", "Tribal Techno / Driving Techno", "belgian_tribal_drive"],
  ["tribal_techno", "Tomaz vs Filterheadz", "Sunshine", "Intec", 136, "Belgium", "Tribal Techno / Percussive Techno", "latin_percussion_bridge"],
  ["tribal_techno", "Cristian Varela", "Your Body Experience", "Pornographic Recordings", 136, "Spain", "Tribal Techno / Spanish Techno", "spanish_tribal_anchor"],

  ["hardgroove_techno", "Ben Sims", "Manipulated", "Theory Recordings", 136, "United Kingdom", "Hardgroove Techno / Funky Techno", "hardgroove_core_anchor"],
  ["hardgroove_techno", "Mark Broom", "Satellite", "Beard Man", 136, "United Kingdom", "Hardgroove Techno / Loop Techno", "uk_loop_techno_anchor"],
  ["hardgroove_techno", "DJ Shufflemaster", "EXP", "Tresor", 136, "Japan", "Hardgroove Techno / Tribal Techno", "tresor_hardgroove_depth"],
  ["hardgroove_techno", "The Advent", "Sketches", "Kombination Research", 137, "United Kingdom", "Hardgroove Techno / Driving Techno", "driving_hardgroove_tool"],
  ["hardgroove_techno", "Player", "Player Eight", "Player", 137, "United Kingdom", "Hardgroove Techno / Funky Techno", "player_series_anchor"],
  ["hardgroove_techno", "Samuel L Session", "Velvet", "New Soil", 136, "Sweden", "Hardgroove Techno / Loop Techno", "swedish_loop_anchor"],

  ["broken_techno", "Objekt", "Theme From Q", "Objekt", 130, "Germany", "Broken Techno / Bass Techno", "broken_bass_techno_anchor"],
  ["broken_techno", "Pangaea", "Hex", "Hessle Audio", 130, "United Kingdom", "Broken Techno / UK Techno", "hessle_broken_anchor"],
  ["broken_techno", "Batu", "Marius", "Timedance", 130, "United Kingdom", "Broken Techno / UK Bass", "timedance_broken_bridge"],
  ["broken_techno", "Bruce", "Steals", "Hessle Audio", 128, "United Kingdom", "Broken Techno / UK Techno", "uk_syncopated_tool"],
  ["broken_techno", "Laksa", "Contrasts", "Timedance", 130, "United Kingdom", "Broken Techno / Bass Techno", "bass_techno_depth"],
  ["broken_techno", "Skee Mask", "Rev8617", "Ilian Tape", 132, "Germany", "Broken Techno / IDM Techno", "ilian_tape_idm_bridge"],

  ["dub_techno", "Basic Channel", "Phylyps Trak II", "Basic Channel", 127, "Germany", "Dub Techno / Minimal Techno", "dub_techno_origin_anchor"],
  ["dub_techno", "Maurizio", "M4.5", "Maurizio", 127, "Germany", "Dub Techno / Minimal Techno", "dub_minimal_origin"],
  ["dub_techno", "Fluxion", "Prospect", "Chain Reaction", 126, "Greece", "Dub Techno / Deep Techno", "chain_reaction_depth"],
  ["dub_techno", "Yagya", "Rigning One", "Sending Orbs", 120, "Iceland", "Dub Techno / Ambient Techno", "dub_ambient_depth"],

  ["hypnotic_techno", "Donato Dozzy", "Cassandra", "Time To Express", 126, "Italy", "Hypnotic Techno / Deep Techno", "hypnotic_deep_anchor"],
  ["hypnotic_techno", "Wata Igarashi", "Question and Answer", "The Bunker New York", 128, "Japan", "Hypnotic Techno / Mental Techno", "japanese_hypnotic_anchor"],
  ["hypnotic_techno", "Rrose", "Waterfall", "Eaux", 128, "United States", "Hypnotic Techno / Experimental Techno", "experimental_hypnotic_tool"],
  ["hypnotic_techno", "Oscar Mulero", "Rotula", "Warm Up", 130, "Spain", "Hypnotic Techno / Spanish Techno", "spanish_hypnotic_anchor"],

  ["raw_techno", "Blawan", "Why They Hide Their Bodies Under My Garage?", "Hinge Finger", 130, "United Kingdom", "Raw Techno / UK Techno", "raw_uk_anchor"],
  ["raw_techno", "Randomer", "Bring", "L.I.E.S.", 132, "United Kingdom", "Raw Techno / Warehouse Techno", "warehouse_raw_tool"],
  ["raw_techno", "Dax J", "Escape The System", "Monnom Black", 138, "United Kingdom", "Raw Techno / Hard Techno", "raw_hard_bridge"],
  ["raw_techno", "Paula Temple", "Gegen", "Noise Manifesto", 142, "Germany", "Raw Techno / Industrial Techno", "raw_industrial_bridge"],

  ["detroit_techno", "Model 500", "No UFOs", "Metroplex", 125, "United States", "Detroit Techno / Electro Techno", "detroit_origin_anchor"],
  ["detroit_techno", "Rhythim Is Rhythim", "Strings of Life", "Transmat", 122, "United States", "Detroit Techno / Classic Techno", "detroit_classic_anchor"],
  ["detroit_techno", "Underground Resistance", "Transition", "Underground Resistance", 132, "United States", "Detroit Techno / Underground Techno", "ur_underground_anchor"],
  ["detroit_techno", "Octave One", "Blackwater", "430 West", 128, "United States", "Detroit Techno / Soul Techno", "detroit_soul_anchor"],

  ["ebm", "Nitzer Ebb", "Join In The Chant", "Mute", 120, "United Kingdom", "EBM / Industrial Body Music", "ebm_body_anchor"],
  ["ebm", "DAF", "Der Mussolini", "Virgin", 126, "Germany", "EBM / Neue Deutsche Welle", "german_ebm_anchor"],
  ["ebm", "Front 242", "Headhunter", "Wax Trax!", 124, "Belgium", "EBM / Industrial Body Music", "belgian_ebm_anchor"],
  ["ebm", "Terence Fixmer", "Aktion Mekanik Theme", "Gigolo", 128, "France", "EBM Techno / Electro Techno", "ebm_techno_bridge"]
].map(([style, artist, song, label, bpmExact, country, artistGenre, catalogRole]) => ({
  style,
  artist,
  song,
  label,
  bpmExact,
  country,
  artistGenre,
  catalogRole
}));

const STYLE_NOTES = {
  deep_techno: "Adiciona techno atmosferico, hipnotico e profundo sem cair automaticamente em deep house.",
  ambient_techno: "Cobre a ponte ambient/IDM/techno para foco, estudo e after mental.",
  bleep_techno: "Inclui a vertente UK/Sheffield com bleeps, subgrave e raiz Warp.",
  tribal_techno: "Reforca techno percussivo e latino para pista fisica.",
  hardgroove_techno: "Aumenta o eixo groove/funk/loop dentro de techno rapido.",
  broken_techno: "Adiciona techno quebrado, UK bass e syncopation sem confundir com breakbeat generico.",
  dub_techno: "Aprofunda dub techno com anchors historicos e ambientais.",
  hypnotic_techno: "Reforca techno mental, circular e de longa progressao.",
  raw_techno: "Aumenta warehouse/raw sem depender apenas de hard techno.",
  detroit_techno: "Traz raiz futurista de Detroit para contextualizar o tronco techno.",
  ebm: "Liga techno industrial ao corpo mecanico do EBM."
};

const trackHeaders = [
  "style",
  "artist",
  "song",
  "label",
  "bpm_exact",
  "country",
  "artist_genre",
  "catalog_role",
  "source_url",
  "track_url",
  "spotify_url",
  "youtube_url",
  "beatport_url",
  "artist_bio",
  "artist_profile_hint",
  "source_note"
];

const profileHeaders = [
  "style",
  "artist",
  "country",
  "artist_bio",
  "artist_genre",
  "artist_profile_hint",
  "scene_role",
  "source_anchor_url",
  "profile_tracks",
  "source_note"
];

function ascii(value = "") {
  return String(value ?? "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^\x00-\x7F]/g, "")
    .replace(/\s+/g, " ")
    .trim();
}

function encodeQuery(value = "") {
  return encodeURIComponent(ascii(value));
}

function csvCell(value = "") {
  return `"${String(value ?? "").replace(/"/g, "\"\"")}"`;
}

function sqlLiteral(value) {
  if (value === null || value === undefined || value === "") return "null";
  if (typeof value === "number" && Number.isFinite(value)) return String(value);
  return `'${String(value).replace(/'/g, "''")}'`;
}

function sqlJson(value) {
  return `${sqlLiteral(JSON.stringify(value))}::jsonb`;
}

function styleLabel(style = "") {
  return style.replace(/_/g, " ");
}

function trackLinks(track) {
  const query = encodeQuery(`${track.artist} ${track.song}`);
  return {
    sourceUrl: `https://www.discogs.com/search/?q=${query}&type=all`,
    trackUrl: `https://www.youtube.com/results?search_query=${query}`,
    spotifyUrl: `https://open.spotify.com/search/${query}`,
    youtubeUrl: `https://www.youtube.com/results?search_query=${query}`,
    beatportUrl: `https://www.beatport.com/search?q=${query}`
  };
}

function trackBio(track) {
  return `${track.artist} entra no lote techno v3 como referencia de ${styleLabel(track.style)}, usando "${track.song}" para ampliar a leitura de pulso, timbre e contexto de pista.`;
}

function trackHint(track) {
  return `Anchor editorial para ${styleLabel(track.style)}; revisar links oficiais quando houver tempo, mas usar como rota de descoberta e contexto.`;
}

function sourceNote(track) {
  return STYLE_NOTES[track.style] || `Expansao techno v3 para ${styleLabel(track.style)}.`;
}

const trackRows = TRACKS.map((track) => {
  const links = trackLinks(track);
  return {
    style: track.style,
    artist: track.artist,
    song: track.song,
    label: track.label,
    bpm_exact: track.bpmExact,
    country: track.country,
    artist_genre: track.artistGenre,
    catalog_role: track.catalogRole,
    source_url: links.sourceUrl,
    track_url: links.trackUrl,
    spotify_url: links.spotifyUrl,
    youtube_url: links.youtubeUrl,
    beatport_url: links.beatportUrl,
    artist_bio: trackBio(track),
    artist_profile_hint: trackHint(track),
    source_note: sourceNote(track)
  };
});

const profileRows = TRACKS.map((track) => {
  const links = trackLinks(track);
  return {
    style: track.style,
    artist: track.artist,
    country: track.country,
    artist_bio: trackBio(track),
    artist_genre: track.artistGenre,
    artist_profile_hint: trackHint(track),
    scene_role: track.catalogRole,
    source_anchor_url: links.sourceUrl,
    profile_tracks: `${track.song} (${track.bpmExact})`,
    source_note: sourceNote(track)
  };
});

function csvWrite(rows, headers) {
  return [
    headers.map(csvCell).join(","),
    ...rows.map((row) => headers.map((header) => csvCell(row[header] ?? "")).join(","))
  ].join("\n") + "\n";
}

function uniqueRows(rows, keys) {
  const seen = new Set();
  return rows.filter((row) => {
    const key = keys.map((item) => `${row[item] || ""}`.toLowerCase()).join("::");
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

const uniqueTrackRows = uniqueRows(trackRows, ["style", "artist", "song"]);
const uniqueProfileRows = uniqueRows(profileRows, ["style", "artist"]);

function artistValues(row) {
  const metadata = {
    batch: BATCH,
    profile_depth: "techno_artist_profile_v3",
    confidence: "editorial",
    scene_role: row.scene_role,
    profile_tracks: row.profile_tracks ? [row.profile_tracks] : [],
    source_anchor_url: row.source_anchor_url,
    links_status: "discovery_links_need_manual_social_review",
    source_note: row.source_note
  };
  return `(${[
    row.style,
    row.artist,
    row.country,
    "",
    row.artist_bio,
    row.artist_genre,
    row.artist_profile_hint,
    BATCH,
    row.source_anchor_url,
    "published"
  ].map(sqlLiteral).join(", ")}, ${sqlJson(metadata)})`;
}

function trackValues(row) {
  const metadata = {
    batch: BATCH,
    confidence: "editorial",
    bpm_text: `${row.bpm_exact} BPM editorial guide for ${styleLabel(row.style)}`,
    source_tags: [
      row.style,
      styleLabel(row.style),
      row.catalog_role,
      row.artist_genre,
      row.label,
      "curated_techno_enrichment_v3"
    ].filter(Boolean),
    track_url: row.track_url,
    spotify_url: row.spotify_url,
    youtube_url: row.youtube_url,
    beatport_url: row.beatport_url,
    catalog_role: row.catalog_role,
    energy_band: row.bpm_exact >= 140 ? "high_warehouse" : row.style.includes("ambient") || row.style.includes("deep") ? "deep_hypnotic" : "club_groove",
    links_status: "discovery_links_need_manual_social_review",
    source_note: row.source_note
  };
  return `(${[
    row.style,
    row.artist,
    row.song,
    row.label,
    Number(row.bpm_exact) || null,
    null,
    "2026-06-21",
    null,
    row.country,
    "",
    row.artist_bio,
    row.artist_genre,
    row.artist_profile_hint,
    BATCH,
    row.source_url,
    "published"
  ].map(sqlLiteral).join(", ")}, ${sqlJson(metadata)})`;
}

const sql = `-- Sonic Search - Techno enrichment V3
-- Generated 2026-06-21.
-- Styles: ${[...new Set(TRACKS.map((track) => track.style))].join(", ")}.
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
${uniqueProfileRows.map(artistValues).join(",\n")}
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
) values
${uniqueTrackRows.map(trackValues).join(",\n")}
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
`;

const styleCounts = uniqueTrackRows.reduce((acc, row) => {
  acc[row.style] = (acc[row.style] || 0) + 1;
  return acc;
}, {});

const report = `# Techno Enrichment V3 - 2026-06-21

## Objetivo

Ampliar o banco do Sonic Search com mais vertentes de techno e reforcar subgeneros ja existentes.

## Resultado

- ${uniqueTrackRows.length} faixas em \`catalog_tracks\`;
- ${uniqueProfileRows.length} perfis em \`catalog_artists\`;
- ${Object.keys(styleCounts).length} subgeneros cobertos;
- 6 novas vertentes no app: \`deep_techno\`, \`ambient_techno\`, \`bleep_techno\`, \`tribal_techno\`, \`hardgroove_techno\`, \`broken_techno\`.

## Cobertura por estilo

${Object.entries(styleCounts).sort(([a], [b]) => a.localeCompare(b)).map(([style, count]) => `- \`${style}\`: ${count} faixas`).join("\n")}

## Notas

- Links sao discovery/search links para revisao e descoberta, nao garantia de social oficial.
- O lote usa \`confidence = editorial\` em metadata.
- As entradas locais do app usam o mesmo recorte, sem marcar preview oficial como verificado.

## Arquivos

- \`data/${BATCH}.csv\`
- \`data/techno_artist_profiles_v3_20260621.csv\`
- \`supabase/seeds/${BATCH}.sql\`
`;

fs.mkdirSync(DATA_DIR, { recursive: true });
fs.mkdirSync(SEED_DIR, { recursive: true });
fs.mkdirSync(REPORT_DIR, { recursive: true });
fs.writeFileSync(TRACK_OUT, csvWrite(uniqueTrackRows, trackHeaders));
fs.writeFileSync(PROFILE_OUT, csvWrite(uniqueProfileRows, profileHeaders));
fs.writeFileSync(SQL_OUT, sql);
fs.writeFileSync(REPORT_OUT, report);

console.log(`Wrote ${uniqueTrackRows.length} tracks, ${uniqueProfileRows.length} profiles.`);
console.log(TRACK_OUT);
console.log(PROFILE_OUT);
console.log(SQL_OUT);
console.log(REPORT_OUT);
