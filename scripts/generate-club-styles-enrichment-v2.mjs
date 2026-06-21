import fs from "node:fs";
import path from "node:path";

const ROOT = process.cwd();
const BATCH = "club_styles_enrichment_v2_20260621";
const DATA_DIR = path.join(ROOT, "data");
const SEED_DIR = path.join(ROOT, "supabase", "seeds");
const REPORT_DIR = path.join(ROOT, "reports");
const TRACK_OUT = path.join(DATA_DIR, `${BATCH}.csv`);
const PROFILE_OUT = path.join(DATA_DIR, "club_styles_artist_profiles_v2_20260621.csv");
const SQL_OUT = path.join(SEED_DIR, `${BATCH}.sql`);
const REPORT_OUT = path.join(REPORT_DIR, "club_styles_enrichment_v2_2026-06-21.md");

const STYLE_NOTES = {
  acid_techno: {
    genre: "acid techno / 303 techno",
    purpose: "Reforca linhas 303, rave classica e ponte com hard techno."
  },
  minimal_techno: {
    genre: "minimal techno / hypnotic techno",
    purpose: "Cria base para recomendacoes hipnoticas, secas e funcionais."
  },
  melodic_techno: {
    genre: "melodic techno / progressive techno",
    purpose: "Aumenta repertorio emocional, Afterlife-adjacent e peak melodico."
  },
  minimal_deep_tech: {
    genre: "minimal deep tech / rominimal / deep tech",
    purpose: "Melhora a ponte entre tech house, minimal house e groove underground."
  },
  afro_house: {
    genre: "afro house / afro tech",
    purpose: "Adiciona groove percussivo, cena sul-africana e house organico de pista."
  },
  organic_house: {
    genre: "organic house / downtempo house",
    purpose: "Amplia recomendacoes de textura organica, live feel e melodias globais."
  }
};

const trackHeaders = [
  "style",
  "artist",
  "song",
  "label",
  "bpm_exact",
  "bpm_text",
  "release_date",
  "duration_sec",
  "country",
  "city",
  "source_album",
  "source_url",
  "track_url",
  "external_track_id",
  "source_type",
  "source_tags",
  "artist_bio",
  "artist_profile_hint",
  "primary_social_url",
  "social_discovery_links",
  "label_links",
  "cover_art_url",
  "album_keywords",
  "energy_band",
  "catalog_role",
  "status",
  "confidence",
  "source_note"
];

const profileHeaders = [
  "style",
  "artist",
  "country",
  "city",
  "artist_bio",
  "artist_genre",
  "artist_profile_hint",
  "scene_role",
  "source_anchor",
  "source_anchor_url",
  "primary_social_url",
  "social_discovery_links",
  "label_links",
  "cover_art_url",
  "profile_tracks",
  "status",
  "confidence",
  "source_note"
];

const trackNumeric = new Set(["bpm_exact", "duration_sec"]);

const CURATED_TRACKS = [
  row("acid_techno", "Phuture", "Acid Tracks", "Trax", 124, "1987-01-01", "United States", "Chicago", "acid_origin_anchor", "mid_303_hypnosis", "Chicago project treated as an origin point for acid language and raw 303 pressure."),
  row("acid_techno", "Hardfloor", "Acperience 1", "Harthouse", 130, "1992-01-01", "Germany", "Frankfurt", "classic_303_anchor", "rolling_acid_peak", "German duo known for layered 303 patterns and long-form acid techno hypnosis."),
  row("acid_techno", "Josh Wink", "Higher State Of Consciousness", "Strictly Rhythm", 130, "1995-01-01", "United States", "Philadelphia", "rave_acid_crossover", "peak_time_acid", "US producer bridging acid techno, rave and house with a widely referenced 303 hook."),
  row("acid_techno", "Emmanuel Top", "Turkish Bazar", "Attack Records", 129, "1994-01-01", "France", "Lille", "european_acid_hypnosis", "acid_trance_bridge", "French producer associated with stripped acid lines, trance tension and warehouse repetition."),
  row("acid_techno", "Tin Man", "Nonneo", "Acid Test", 124, "2014-01-01", "United States", "Vienna", "modern_acid_depth", "deep_303_motion", "Acid-focused producer with patient melodic 303 work and a modern leftfield club profile."),
  row("acid_techno", "Boston 168", "Oblivion And Vapor", "Enemy Records", 132, "2016-01-01", "Italy", "Turin", "modern_acid_warehouse", "rolling_acid_peak", "Italian duo connecting hardware acid lines with deep warehouse techno atmosphere."),
  row("acid_techno", "Regal", "Acid Is The Answer", "Involve Records", 133, "2016-01-01", "Spain", "Madrid", "acid_peak_tool", "peak_time_acid", "Spanish artist and Involve figure with direct acid hooks and high-impact techno pressure."),
  row("acid_techno", "KiNK", "Perth", "Running Back", 124, "2012-01-01", "Bulgaria", "Sofia", "live_acid_groove_bridge", "bouncy_303_groove", "Live hardware artist whose acid and house tools help bridge techno with playful groove."),
  row("acid_techno", "Luke Vibert", "I Love Acid", "Planet Mu", 126, "2003-01-01", "United Kingdom", "Cornwall", "leftfield_acid_anchor", "playful_303_breaks", "UK electronic producer with a long acid vocabulary across techno, electro and breakbeat forms."),
  row("acid_techno", "A*S*Y*S", "Acid Nightmare", "Fe Chrome", 145, "2006-01-01", "Germany", "Frankfurt", "hard_acid_bridge", "fast_303_rave", "German artist useful as a bridge between acid techno, hard techno and trance-rave energy."),

  row("minimal_techno", "Plastikman", "Spastik", "Plus 8", 126, "1993-01-01", "Canada", "Windsor", "minimal_machine_anchor", "dry_percussion_hypnosis", "Richie Hawtin alias focused on reduction, repetition and machine-driven minimal techno."),
  row("minimal_techno", "Daniel Bell", "Losing Control", "Peacefrog", 126, "1994-01-01", "United States", "Detroit", "detroit_minimal_anchor", "stripped_hypnotic_loop", "Detroit minimal figure associated with stripped rhythm, negative space and loop control."),
  row("minimal_techno", "Basic Channel", "Phylyps Trak II", "Basic Channel", 127, "1994-01-01", "Germany", "Berlin", "dub_minimal_anchor", "deep_dub_hypnosis", "Berlin project central to dub techno and reduced long-form club hypnosis."),
  row("minimal_techno", "Maurizio", "M4.5", "Maurizio", 127, "1995-01-01", "Germany", "Berlin", "dub_minimal_depth", "deep_dub_hypnosis", "Maurizio connects Basic Channel minimalism with dub pressure and skeletal techno swing."),
  row("minimal_techno", "Ricardo Villalobos", "Dexter", "Playhouse", 126, "2003-01-01", "Chile", "Berlin", "microhouse_minimal_anchor", "long_form_minimal_groove", "Chilean-German artist known for long-form minimal, microhouse detail and elastic groove."),
  row("minimal_techno", "Mathew Jonson", "Marionette", "Wagon Repair", 125, "2005-01-01", "Canada", "Vancouver", "melodic_minimal_bridge", "live_synth_hypnosis", "Canadian live act and producer with melodic minimal techno arrangements and modular motion."),
  row("minimal_techno", "Akufen", "Deck The House", "Perlon", 126, "2002-01-01", "Canada", "Montreal", "microhouse_cutup_anchor", "micro_groove_detail", "Canadian producer associated with micro-sampling, dry swing and detailed minimal house/techno."),
  row("minimal_techno", "Donato Dozzy", "Cassandra", "Time To Express", 126, "2015-01-01", "Italy", "Rome", "hypnotic_minimal_depth", "deep_hypnotic_roll", "Italian producer known for patient hypnotic techno, subtle progression and deep club pressure."),
  row("minimal_techno", "Minilogue", "Animals", "Cocoon", 126, "2008-01-01", "Sweden", "Malmo", "progressive_minimal_bridge", "rolling_minimal_melody", "Swedish duo bridging minimal techno, progressive motion and organic club detail."),
  row("minimal_techno", "Mike Ink", "Paroles", "Profan", 127, "1995-01-01", "Germany", "Cologne", "cologne_minimal_anchor", "dry_minimal_pulse", "Wolfgang Voigt alias tied to Cologne minimal, Profan tools and skeletal rhythmic language."),

  row("melodic_techno", "Stephan Bodzin", "Singularity", "Life And Death", 123, "2015-01-01", "Germany", "Bremen", "synth_melody_anchor", "melodic_peak_builder", "German producer known for expressive synth leads and dramatic melodic techno phrasing."),
  row("melodic_techno", "Tale Of Us", "Another Earth", "Minus", 123, "2013-01-01", "Italy", "Berlin", "afterlife_origin_bridge", "cinematic_melodic_drive", "Italian duo central to cinematic melodic techno and the later Afterlife sound."),
  row("melodic_techno", "Maceo Plex", "Solar Detroit", "Ellum", 124, "2015-01-01", "United States", "Miami", "electro_melodic_bridge", "dark_melodic_groove", "US artist and Ellum founder blending electro tension, dark house and melodic techno momentum."),
  row("melodic_techno", "ARTBAT", "Upperground", "Diynamic", 124, "2021-01-01", "Ukraine", "Kyiv", "modern_peak_melodic_anchor", "peak_melodic_pressure", "Ukrainian duo associated with modern festival-scale melodic techno and strong melodic hooks."),
  row("melodic_techno", "Mind Against", "Walking Away", "Life And Death", 123, "2015-01-01", "Italy", "Berlin", "emotional_melodic_depth", "dark_melodic_flow", "Italian duo known for emotional synth tension, dark melodies and controlled club pressure."),
  row("melodic_techno", "Adriatique", "Home", "Siamese", 124, "2020-01-01", "Switzerland", "Zurich", "siamese_melodic_anchor", "polished_melodic_groove", "Swiss duo behind Siamese with polished melodic techno and progressive house crossover."),
  row("melodic_techno", "Colyn", "Resolve", "Afterlife", 124, "2020-01-01", "Netherlands", "Amsterdam", "afterlife_melodic_depth", "wide_melodic_build", "Dutch producer linked to atmospheric melodic techno and wide cinematic club builds."),
  row("melodic_techno", "Innellea", "Vigilans", "Afterlife", 124, "2021-01-01", "Germany", "Munich", "future_melodic_anchor", "tense_melodic_drive", "German producer with sharp melodic sound design and high tension modern club arrangements."),
  row("melodic_techno", "Massano", "The Feeling", "Afterlife", 126, "2021-01-01", "United Kingdom", "Liverpool", "peak_melodic_tool", "peak_melodic_pressure", "UK producer useful for direct melodic techno pressure, big drops and dark progressive energy."),
  row("melodic_techno", "Anyma", "Consciousness", "Afterlife", 124, "2022-01-01", "Italy", "Milan", "visual_melodic_anchor", "cinematic_melodic_peak", "Italian artist associated with audiovisual melodic techno and dramatic vocal/synth hooks."),

  row("minimal_deep_tech", "Chris Stussy", "All Night Long", "Up The Stuss", 128, "2020-01-01", "Netherlands", "Amsterdam", "modern_deep_tech_anchor", "rolling_low_slung_groove", "Dutch artist central to the modern minimal deep tech wave and stripped rolling grooves."),
  row("minimal_deep_tech", "East End Dubs", "bRave", "Eastenderz", 128, "2016-01-01", "United Kingdom", "London", "uk_minimal_deep_anchor", "dry_bassline_groove", "London producer and Eastenderz figure focused on lean percussion and bass-led deep tech."),
  row("minimal_deep_tech", "Archie Hamilton", "Mind Blank", "Moscow Records", 126, "2017-01-01", "United Kingdom", "London", "uk_underground_bridge", "rolling_minimal_groove", "UK DJ-producer connected to minimal house, deep tech and rolling underground club tools."),
  row("minimal_deep_tech", "Enzo Siragusa", "Desire", "Fuse London", 126, "2018-01-01", "United Kingdom", "London", "fuse_london_anchor", "warm_minimal_bassline", "FUSE London founder associated with deep tech, minimal house and warm low-end pressure."),
  row("minimal_deep_tech", "Sidney Charles", "House 2 Heal", "Heavy House Society", 126, "2020-01-01", "Germany", "Hamburg", "house_to_deep_tech_bridge", "swinging_deep_tech", "German producer bridging classic house swing with modern minimal deep tech drive."),
  row("minimal_deep_tech", "DJOKO", "Hooked", "PIV", 128, "2019-01-01", "Germany", "Cologne", "piv_groove_anchor", "bouncy_deep_tech", "Cologne producer tied to PIV-style groove, crisp drums and modern deep tech energy."),
  row("minimal_deep_tech", "Dimmish", "Brain Tornado", "Solid Grooves Raw", 128, "2018-01-01", "Italy", "Italy", "solid_grooves_raw_bridge", "minimal_bassline_tool", "Italian producer useful for lean bassline tools, dry swing and club-functional minimal deep tech."),
  row("minimal_deep_tech", "Toman", "Feel It", "PIV", 128, "2019-01-01", "Netherlands", "Netherlands", "dutch_deep_tech_depth", "rolling_low_slung_groove", "Dutch artist with clean rolling grooves that connect tech house users to deeper minimal material."),
  row("minimal_deep_tech", "Prunk", "Le Funk", "PIV", 126, "2017-01-01", "Netherlands", "Amsterdam", "piv_label_anchor", "warm_deep_tech_swing", "PIV founder and DJ-producer with warm house roots and minimal deep tech club function."),
  row("minimal_deep_tech", "Rossi.", "Paradise", "Homegrown", 128, "2021-01-01", "United Kingdom", "London", "new_school_uk_deep_tech", "rolling_low_slung_groove", "UK artist representing newer rolling minimal/deep tech language for modern club recommendations."),

  row("afro_house", "Black Coffee", "We Dance Again", "Soulistic Music", 122, "2015-01-01", "South Africa", "Durban", "south_african_afro_house_anchor", "warm_percussive_groove", "South African artist and global reference point for soulful afro house and restrained club emotion."),
  row("afro_house", "Culoe De Song", "Y.O.U.D.", "Innervisions", 122, "2011-01-01", "South Africa", "Eshowe", "deep_afro_house_anchor", "deep_percussive_flow", "South African producer known for deep, spiritual and percussive afro house pressure."),
  row("afro_house", "Da Capo", "Umbovukazi", "Iklwa Brothers", 122, "2017-01-01", "South Africa", "Limpopo", "afro_tech_depth", "melodic_afro_drive", "South African artist with melodic afro tech language, emotional synths and rolling percussion."),
  row("afro_house", "Enoo Napa", "The Cure", "MoBlack Records", 122, "2017-01-01", "South Africa", "Durban", "afro_tech_peak_bridge", "dark_afro_tech", "South African producer associated with darker afro tech and hypnotic percussive club tools."),
  row("afro_house", "Caiiro", "Fefe", "Afrocentric Records", 122, "2019-01-01", "South Africa", "Pretoria", "afro_melodic_scene_depth", "percussive_melodic_afro", "South African artist useful for melodic afro house, steady percussion and wide atmospheric pads."),
  row("afro_house", "Shimza", "Fight To Love", "Shimuzic", 122, "2014-01-01", "South Africa", "Tembisa", "south_african_club_anchor", "uplifting_afro_house", "South African DJ-producer connected to large-room afro house and accessible percussive energy."),
  row("afro_house", "Hyenah", "The Wish", "Rise Music", 122, "2018-01-01", "Germany", "Berlin", "afro_house_bridge", "tribal_deep_groove", "Berlin-linked masked project that bridges afro house, deep house and percussive melodic club moods."),
  row("afro_house", "THEMBA", "Who Is THEMBA", "Herd", 122, "2018-01-01", "South Africa", "Johannesburg", "afro_house_identity_anchor", "percussive_peak_groove", "South African artist bringing modern afro house identity, vocals and club-forward percussion."),
  row("afro_house", "Sparrow & Barbossa", "Morena", "MoBlack Records", 122, "2020-01-01", "Spain", "Madrid", "latin_afro_bridge", "global_percussion_house", "Duo blending afro house, Latin percussion and organic instrumentation for global club flow."),
  row("afro_house", "Djeff", "Elegom Bounsa", "Kazukuta Records", 122, "2014-01-01", "Angola", "Luanda", "lusophone_afro_house_depth", "percussive_afro_depth", "Angolan-Portuguese artist useful for lusophone afro house context and warm percussive depth."),

  row("organic_house", "Satori", "Umama", "Crosstown Rebels", 118, "2016-01-01", "Netherlands", "Amsterdam", "organic_live_anchor", "slow_organic_groove", "Dutch live artist blending organic instrumentation, house pulse and global melodic motifs."),
  row("organic_house", "Be Svendsen", "Andromeda", "Music For Dreams", 116, "2018-01-01", "Denmark", "Copenhagen", "desert_downtempo_anchor", "slow_burn_organic", "Danish artist known for desert-leaning organic house, downtempo swing and live-feeling textures."),
  row("organic_house", "Acid Pauli", "Nana", "Ouie", 118, "2016-01-01", "Germany", "Berlin", "leftfield_organic_anchor", "slow_psychedelic_house", "German producer bridging leftfield electronics, organic house, downtempo and subtle psychedelic detail."),
  row("organic_house", "Nicola Cruz", "Colibria", "Multi Culti", 112, "2015-01-01", "Ecuador", "Quito", "andean_organic_anchor", "global_organic_downtempo", "Ecuadorian producer associated with Andean electronic textures and organic downtempo-house hybrids."),
  row("organic_house", "Kerala Dust", "Maria", "Play It Say It", 118, "2017-01-01", "United Kingdom", "London", "band_organic_bridge", "bluesy_organic_groove", "UK project blending band instrumentation, bluesy vocal mood and electronic house structure."),
  row("organic_house", "Bedouin", "Set The Controls For The Heart Of The Sun", "Crosstown Rebels", 118, "2016-01-01", "United States", "Brooklyn", "desert_house_anchor", "hypnotic_organic_groove", "Brooklyn duo associated with desert house, hypnotic percussion and warm melodic arrangements."),
  row("organic_house", "Pambouk", "Hidden Faces", "Hoomidaas", 120, "2019-01-01", "Armenia", "Yerevan", "armenian_organic_depth", "melodic_organic_flow", "Armenian artist useful for melodic organic house and smooth progressive-organic crossover."),
  row("organic_house", "Armen Miran", "Jojo In The Stars", "Hoomidaas", 120, "2017-01-01", "Armenia", "Yerevan", "organic_melodic_anchor", "warm_organic_melody", "Armenian producer and Hoomidaas founder with warm melodic-organic house identity."),
  row("organic_house", "Valeron", "Misirlou", "Buddha Bar", 118, "2016-01-01", "Greece", "Mykonos", "mediterranean_organic_bridge", "global_organic_groove", "Greek artist connecting Mediterranean instrumentation, downtempo feel and club-friendly organic house."),
  row("organic_house", "Monolink", "Return To Oz", "Embassy One", 122, "2018-01-01", "Germany", "Berlin", "vocal_organic_melodic_bridge", "organic_melodic_peak", "German live act bridging organic house, melodic techno and vocal-led electronic songwriting.")
];

function row(style, artist, song, label, bpm, releaseDate, country, city, role, energy, bio) {
  return { style, artist, song, label, bpm, releaseDate, country, city, role, energy, bio };
}

function ascii(value = "") {
  return String(value ?? "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^\x00-\x7F]/g, "")
    .replace(/\s+/g, " ")
    .trim();
}

function normalize(value = "") {
  return ascii(value)
    .toLowerCase()
    .replace(/&/g, " and ")
    .replace(/[^a-z0-9]+/g, " ")
    .trim()
    .replace(/\s+/g, " ");
}

function encodeQuery(value = "") {
  return encodeURIComponent(ascii(value));
}

function csvCell(value = "") {
  return `"${String(value ?? "").replace(/"/g, "\"\"")}"`;
}

function csvWrite(rows, headers) {
  return [
    headers.map(csvCell).join(","),
    ...rows.map((row) => headers.map((header) => csvCell(row[header] ?? "")).join(","))
  ].join("\n") + "\n";
}

function parseCsvLine(line = "") {
  const cells = [];
  let current = "";
  let quoted = false;
  for (let index = 0; index < line.length; index += 1) {
    const char = line[index];
    if (quoted) {
      if (char === "\"" && line[index + 1] === "\"") {
        current += "\"";
        index += 1;
      } else if (char === "\"") {
        quoted = false;
      } else {
        current += char;
      }
    } else if (char === "\"") {
      quoted = true;
    } else if (char === ",") {
      cells.push(current);
      current = "";
    } else {
      current += char;
    }
  }
  cells.push(current);
  return cells;
}

function readCsvRows(filePath) {
  if (!fs.existsSync(filePath)) return [];
  const lines = fs.readFileSync(filePath, "utf8").split(/\r?\n/).filter(Boolean);
  if (lines.length < 2) return [];
  const headers = parseCsvLine(lines[0]).map((header) => normalize(header));
  return lines.slice(1).map((line) => {
    const cells = parseCsvLine(line);
    return headers.reduce((row, header, index) => {
      row[header] = cells[index] || "";
      return row;
    }, {});
  });
}

function keyFor(row) {
  return `${normalize(row.style)}::${normalize(row.artist)}::${normalize(row.song)}`;
}

function existingEnrichmentKeys() {
  const keys = new Set();
  if (!fs.existsSync(DATA_DIR)) return keys;
  const files = fs.readdirSync(DATA_DIR).filter((file) => /enrichment_v\d+_\d+\.csv$/.test(file) && file !== `${BATCH}.csv`);
  for (const file of files) {
    for (const row of readCsvRows(path.join(DATA_DIR, file))) {
      const artist = row.artist || row.artist_name || row.name;
      const song = row.song || row.track || row.title || row.track_name;
      const style = row.style || "";
      if (style && artist && song) keys.add(keyFor({ style, artist, song }));
    }
  }
  return keys;
}

function sqlText(value) {
  if (value === null || value === undefined || value === "") return "null";
  return `'${String(value).replace(/'/g, "''")}'`;
}

function sqlNumber(value) {
  if (value === null || value === undefined || value === "") return "null";
  const number = Number(value);
  return Number.isFinite(number) ? String(number) : "null";
}

function valuesSql(rows, headers, numericHeaders = new Set()) {
  return rows
    .map((row) => `(${headers.map((header) => numericHeaders.has(header) ? sqlNumber(row[header]) : sqlText(row[header])).join(", ")})`)
    .join(",\n");
}

function styleLabel(style = "") {
  return ascii(style).replace(/_/g, " ");
}

function discoveryLinks(artist, style) {
  const artistQuery = encodeQuery(artist);
  const sceneQuery = encodeQuery(`${artist} ${styleLabel(style)}`);
  return [
    `https://open.spotify.com/search/${artistQuery}`,
    `https://soundcloud.com/search?q=${artistQuery}`,
    `https://www.youtube.com/results?search_query=${encodeQuery(`${artist} ${styleLabel(style)} live official`)}`,
    `https://www.google.com/search?q=${sceneQuery}%20official%20instagram%20soundcloud%20bandcamp`
  ].join(";");
}

function platformTrackUrl(artist, song) {
  return `https://www.youtube.com/results?search_query=${encodeQuery(`${artist} ${song}`)}`;
}

function sourceUrl(artist, song) {
  return `https://www.beatport.com/search?q=${encodeQuery(`${artist} ${song}`)}`;
}

function discogsSearchUrl(artist, song) {
  return `https://www.discogs.com/search/?q=${encodeQuery(`${artist} ${song}`)}&type=all`;
}

function sourceTags(row) {
  return [
    row.style,
    styleLabel(row.style),
    row.role,
    row.energy,
    STYLE_NOTES[row.style]?.genre,
    row.label,
    "curated_club_styles_v2"
  ].filter(Boolean).map(ascii).join(";");
}

function albumKeywords(row) {
  return [
    styleLabel(row.style),
    row.role,
    row.energy,
    row.label,
    "artist_profile",
    "recommendation_anchor"
  ].filter(Boolean).map(ascii).join(";");
}

function trackRow(row) {
  const note = `${STYLE_NOTES[row.style]?.purpose || "Curated club style expansion."} Added as a reviewed catalog anchor with discovery links; official social links still need manual confirmation.`;
  const artistBio = `${row.bio} Included in ${BATCH} as ${row.role} for ${styleLabel(row.style)}.`;
  const hint = `Use ${row.artist} - ${row.song} when the user asks for ${styleLabel(row.style)}, related club energy, or ${row.energy}.`;
  return {
    style: row.style,
    artist: ascii(row.artist),
    song: ascii(row.song),
    label: ascii(row.label),
    bpm_exact: row.bpm,
    bpm_text: `${row.bpm} BPM editorial guide for ${styleLabel(row.style)}`,
    release_date: row.releaseDate,
    duration_sec: "",
    country: ascii(row.country),
    city: ascii(row.city),
    source_album: ascii(`${row.label} / ${row.releaseDate.slice(0, 4)} reference`),
    source_url: sourceUrl(row.artist, row.song),
    track_url: platformTrackUrl(row.artist, row.song),
    external_track_id: "",
    source_type: "curated_public_discography_search",
    source_tags: sourceTags(row),
    artist_bio: ascii(artistBio),
    artist_profile_hint: ascii(hint),
    primary_social_url: `https://www.google.com/search?q=${encodeQuery(`${row.artist} official instagram`)}`,
    social_discovery_links: discoveryLinks(row.artist, row.style),
    label_links: [
      sourceUrl(row.artist, row.song),
      discogsSearchUrl(row.artist, row.song)
    ].join(";"),
    cover_art_url: "",
    album_keywords: albumKeywords(row),
    energy_band: row.energy,
    catalog_role: row.role,
    status: "published",
    confidence: row.role.includes("anchor") ? "high" : "medium_high",
    source_note: ascii(note)
  };
}

function buildProfiles(trackRows) {
  const grouped = new Map();
  for (const row of trackRows) {
    const key = `${row.style}::${normalize(row.artist)}`;
    if (!grouped.has(key)) grouped.set(key, []);
    grouped.get(key).push(row);
  }

  return [...grouped.values()].map((rows) => {
    const first = rows[0];
    const labels = [...new Set(rows.map((row) => row.label).filter(Boolean))];
    const roles = [...new Set(rows.map((row) => row.catalog_role).filter(Boolean))];
    return {
      style: first.style,
      artist: first.artist,
      country: first.country,
      city: first.city,
      artist_bio: ascii(`${first.artist} appears in ${BATCH} for ${styleLabel(first.style)} with ${rows.length} curated reference track(s). Scene use: ${roles.join(" / ")}.`),
      artist_genre: STYLE_NOTES[first.style]?.genre || styleLabel(first.style),
      artist_profile_hint: ascii(`Recommend ${first.artist} for ${styleLabel(first.style)} discovery, especially when the user wants ${first.energy_band || "club"} energy and richer artist context.`),
      scene_role: roles.join(";"),
      source_anchor: labels.join(";"),
      source_anchor_url: first.source_url,
      primary_social_url: first.primary_social_url,
      social_discovery_links: first.social_discovery_links,
      label_links: [...new Set(rows.flatMap((row) => String(row.label_links || "").split(";").filter(Boolean)))].join(";"),
      cover_art_url: "",
      profile_tracks: rows.map((row) => `${row.song} (${row.bpm_exact})`).join(";"),
      status: "published",
      confidence: rows.some((row) => row.confidence === "high") ? "high" : "medium_high",
      source_note: ascii(`Artist profile generated from ${rows.length} ${styleLabel(first.style)} track anchor(s) in ${BATCH}.`)
    };
  }).sort((a, b) => `${a.style} ${a.artist}`.localeCompare(`${b.style} ${b.artist}`));
}

function collectRows() {
  const existing = existingEnrichmentKeys();
  const internal = new Set();
  const skippedDuplicates = [];
  const trackRows = [];
  for (const item of CURATED_TRACKS.map(trackRow)) {
    const key = keyFor(item);
    if (existing.has(key) || internal.has(key)) {
      skippedDuplicates.push(`${item.style}: ${item.artist} - ${item.song}`);
      continue;
    }
    internal.add(key);
    trackRows.push(item);
  }
  return {
    trackRows,
    profileRows: buildProfiles(trackRows),
    skippedDuplicates
  };
}

function buildSql(trackRows, profileRows) {
  return `-- Sonic Search - Club styles enrichment V2
-- Generated 2026-06-21.
-- Styles: acid_techno, minimal_techno, melodic_techno, minimal_deep_tech, afro_house, organic_house.
-- Run in Supabase SQL Editor only after review.

create temporary table if not exists club_styles_enrichment_v2_tracks (
  style text not null,
  artist text not null,
  song text not null,
  label text,
  bpm_exact numeric,
  bpm_text text,
  release_date date,
  duration_sec integer,
  country text,
  city text,
  source_album text,
  source_url text,
  track_url text,
  external_track_id text,
  source_type text,
  source_tags text,
  artist_bio text,
  artist_profile_hint text,
  primary_social_url text,
  social_discovery_links text,
  label_links text,
  cover_art_url text,
  album_keywords text,
  energy_band text,
  catalog_role text,
  status text not null,
  confidence text not null,
  source_note text
) on commit drop;

create temporary table if not exists club_styles_artist_profiles_v2 (
  style text not null,
  artist text not null,
  country text,
  city text,
  artist_bio text,
  artist_genre text,
  artist_profile_hint text,
  scene_role text,
  source_anchor text,
  source_anchor_url text,
  primary_social_url text,
  social_discovery_links text,
  label_links text,
  cover_art_url text,
  profile_tracks text,
  status text not null,
  confidence text not null,
  source_note text
) on commit drop;

truncate table club_styles_enrichment_v2_tracks;
truncate table club_styles_artist_profiles_v2;

insert into club_styles_enrichment_v2_tracks (
  ${trackHeaders.join(",\n  ")}
) values
${valuesSql(trackRows, trackHeaders, trackNumeric)};

insert into club_styles_artist_profiles_v2 (
  ${profileHeaders.join(",\n  ")}
) values
${valuesSql(profileRows, profileHeaders)};

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
  '${BATCH}',
  source_anchor_url,
  status,
  jsonb_strip_nulls(jsonb_build_object(
    'batch', '${BATCH}',
    'profile_depth', 'club_styles_artist_profile_v2',
    'confidence', confidence,
    'scene_role', scene_role,
    'source_anchor', source_anchor,
    'profile_tracks', case
      when coalesce(profile_tracks, '') = '' then array[]::text[]
      else string_to_array(profile_tracks, ';')
    end,
    'primary_social_url', primary_social_url,
    'social_discovery_links', case
      when coalesce(social_discovery_links, '') = '' then array[]::text[]
      else string_to_array(social_discovery_links, ';')
    end,
    'label_links', case
      when coalesce(label_links, '') = '' then array[]::text[]
      else string_to_array(label_links, ';')
    end,
    'cover_art_url', cover_art_url,
    'links_status', 'discovery_links_need_manual_social_review',
    'source_note', source_note
  ))
from club_styles_artist_profiles_v2
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
  style,
  artist_profile_hint,
  '${BATCH}',
  track_url,
  status,
  jsonb_strip_nulls(jsonb_build_object(
    'batch', '${BATCH}',
    'confidence', confidence,
    'bpm_text', bpm_text,
    'source_album', source_album,
    'source_album_url', source_url,
    'track_url', track_url,
    'external_track_id', external_track_id,
    'source_type', source_type,
    'source_tags', case
      when coalesce(source_tags, '') = '' then array[]::text[]
      else string_to_array(source_tags, ';')
    end,
    'primary_social_url', primary_social_url,
    'social_discovery_links', case
      when coalesce(social_discovery_links, '') = '' then array[]::text[]
      else string_to_array(social_discovery_links, ';')
    end,
    'label_links', case
      when coalesce(label_links, '') = '' then array[]::text[]
      else string_to_array(label_links, ';')
    end,
    'cover_art_url', cover_art_url,
    'album_keywords', case
      when coalesce(album_keywords, '') = '' then array[]::text[]
      else string_to_array(album_keywords, ';')
    end,
    'energy_band', energy_band,
    'catalog_role', catalog_role,
    'links_status', 'discovery_links_need_manual_social_review',
    'source_note', source_note
  ))
from club_styles_enrichment_v2_tracks
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
}

function buildReport({ trackRows, profileRows, skippedDuplicates }) {
  const byStyle = trackRows.reduce((acc, row) => {
    acc[row.style] = (acc[row.style] || 0) + 1;
    return acc;
  }, {});
  const profilesByStyle = profileRows.reduce((acc, row) => {
    acc[row.style] = (acc[row.style] || 0) + 1;
    return acc;
  }, {});
  return `# Club Styles Enrichment V2 - 2026-06-21

## Objetivo

Adicionar um lote rico e controlado para estilos que ficaram fracos depois do V1: \`acid_techno\`, \`minimal_techno\`, \`melodic_techno\`, \`minimal_deep_tech\`, \`afro_house\` e \`organic_house\`.

## Resultado

- ${trackRows.length} faixas novas em \`catalog_tracks\`;
- ${profileRows.length} perfis em \`catalog_artists\`;
- ${Object.keys(byStyle).length} subgeneros cobertos;
- ${skippedDuplicates.length} duplicatas puladas antes de gerar o seed.

## Cobertura por estilo

${Object.keys(byStyle).sort().map((style) => `- \`${style}\`: ${byStyle[style]} faixas, ${profilesByStyle[style] || 0} perfis`).join("\n")}

## O que ficou mais rico

- \`catalog_role\` para explicar o papel editorial de cada faixa;
- \`energy_band\` para ajudar recomendacao por energia;
- \`source_tags\` e \`album_keywords\` com sinais do subgenero;
- \`social_discovery_links\` para pesquisa de Instagram, SoundCloud, YouTube e Spotify;
- \`label_links\` com busca de Beatport e Discogs para revisao manual.

## Notas de qualidade

- O lote usa curadoria editorial e links de descoberta, nao promete que todo link social e oficial.
- \`confidence = high\` foi usado para anchors classicos ou muito representativos.
- \`confidence = medium_high\` foi usado para bridges e entradas modernas que ainda merecem revisao final de links oficiais.
- As datas sao marcadas como referencia de ano para catalogo, nao como release metadata completa.

## Arquivos

- \`data/club_styles_enrichment_v2_20260621.csv\`
- \`data/club_styles_artist_profiles_v2_20260621.csv\`
- \`supabase/seeds/club_styles_enrichment_v2_20260621.sql\`
`;
}

const result = collectRows();

fs.mkdirSync(DATA_DIR, { recursive: true });
fs.mkdirSync(SEED_DIR, { recursive: true });
fs.mkdirSync(REPORT_DIR, { recursive: true });
fs.writeFileSync(TRACK_OUT, csvWrite(result.trackRows, trackHeaders));
fs.writeFileSync(PROFILE_OUT, csvWrite(result.profileRows, profileHeaders));
fs.writeFileSync(SQL_OUT, buildSql(result.trackRows, result.profileRows));
fs.writeFileSync(REPORT_OUT, buildReport(result));

console.log(JSON.stringify({
  batch: BATCH,
  tracks: result.trackRows.length,
  profiles: result.profileRows.length,
  skippedDuplicates: result.skippedDuplicates.length,
  files: [TRACK_OUT, PROFILE_OUT, SQL_OUT, REPORT_OUT]
}, null, 2));
