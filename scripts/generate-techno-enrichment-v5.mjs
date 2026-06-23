import fs from "node:fs";
import path from "node:path";

const ROOT = process.cwd();
const DATA_DIR = path.join(ROOT, "data");
const REPORTS_DIR = path.join(ROOT, "reports");
const OUT = path.join(DATA_DIR, "techno_enrichment_v5_20260621.csv");
const REPORT_OUT = path.join(REPORTS_DIR, "techno_enrichment_v5_2026-06-21.md");

const STYLE_CONFIG = {
  ambient_techno: {
    label: "ambient techno",
    artistGenre: "Ambient Techno / Intelligent Techno",
    bpm: "90-128",
    energy: "deep_listening",
    tags: ["ambient techno", "intelligent techno", "atmospheric techno", "local_catalog", "artist_depth"]
  },
  bleep_techno: {
    label: "bleep techno",
    artistGenre: "Bleep Techno / UK Techno",
    bpm: "120-132",
    energy: "raw_rave",
    tags: ["bleep techno", "sheffield", "uk techno", "sub bass", "local_catalog", "artist_depth"]
  },
  broken_techno: {
    label: "broken techno",
    artistGenre: "Broken Techno / Bass Techno",
    bpm: "124-140",
    energy: "syncopated_pressure",
    tags: ["broken techno", "broken beat", "bass techno", "syncopated", "local_catalog", "artist_depth"]
  },
  deep_techno: {
    label: "deep techno",
    artistGenre: "Deep Techno / Atmospheric Techno",
    bpm: "124-132",
    energy: "hypnotic_deep",
    tags: ["deep techno", "atmospheric techno", "hypnotic techno", "local_catalog", "artist_depth"]
  },
  hardgroove_techno: {
    label: "hardgroove techno",
    artistGenre: "Hardgroove Techno / Funky Techno",
    bpm: "132-145",
    energy: "groove_pressure",
    tags: ["hardgroove techno", "groove techno", "funky techno", "warehouse", "local_catalog", "artist_depth"]
  },
  tribal_techno: {
    label: "tribal techno",
    artistGenre: "Tribal Techno / Percussive Techno",
    bpm: "130-140",
    energy: "percussive_drive",
    tags: ["tribal techno", "percussive techno", "latin techno", "drums", "local_catalog", "artist_depth"]
  }
};

const ENTRIES = {
  ambient_techno: [
    ["Link", "Arcadian", "Evolution", 124, "United Kingdom", "London", "early_ambient_techno"],
    ["Reload", "Le Soleil Et La Mer", "Evolution", 124, "United Kingdom", "London", "uk_listening_techno"],
    ["Beaumont Hannant", "Utuba", "GPR", 123, "United Kingdom", "York", "gpr_ambient_anchor"],
    ["Spacetime Continuum", "Fluresence", "Astralwerks", 124, "United States", "San Francisco", "west_coast_space_techno"],
    ["Carl Craig", "At Les", "Planet E", 120, "United States", "Detroit", "detroit_ambient_bridge"],
    ["Kenny Larkin", "Tedra", "Warp Records", 125, "United States", "Detroit", "detroit_machine_soul"],
    ["Psychick Warriors Ov Gaia", "Maenad", "KK Records", 125, "Netherlands", "Utrecht", "ritual_ambient_techno"],
    ["Sun Electric", "O'Locco", "R&S Records", 120, "Germany", "Berlin", "berlin_ambient_rave"],
    ["David Morley", "Stardancer", "R&S Records", 124, "Belgium", "Brussels", "apollo_depth"],
    ["Bedouin Ascent", "Manganese In Deep Violet", "Rising High", 126, "United Kingdom", "London", "idm_ambient_techno"],
    ["A Positive Life", "The Calling", "Beyond", 120, "United Kingdom", "London", "beyond_records_depth"],
    ["Thomas Fehlmann", "Flowing", "R&S Records", 124, "Switzerland", "Zurich", "ambient_machine_pulse"],
    ["Mind Over MIDI", "Ice Acorns", "Beatservice", 124, "Norway", "Tromso", "nordic_ambient_techno"],
    ["The Sabres Of Paradise", "Smokebelch II", "Warp Records", 120, "United Kingdom", "London", "leftfield_techno_bridge"],
    ["Locust", "No-One In The World", "Apollo", 118, "United Kingdom", "London", "apollo_listening_anchor"],
    ["Woob", "On Earth", "em:t", 98, "United Kingdom", "London", "ambient_catalog_depth"],
    ["Pentatonik", "Catalonia", "Deviant", 122, "United Kingdom", "London", "melodic_ambient_techno"],
    ["CiM", "Service Pack", "Delsin", 124, "United Kingdom", "London", "delsin_idm_techno"],
    ["Bola", "Vespers", "Skam", 124, "United Kingdom", "Manchester", "skam_listening_techno"],
    ["Bochum Welt", "La Nuit", "Rephlex", 126, "Italy", "Milan", "rephlex_machine_melody"],
    ["2 Lone Swordsmen", "Rico's Helly", "Warp Records", 126, "United Kingdom", "London", "post_rave_ambient_techno"],
    ["Scanner", "Mass Observation", "Ash International", 120, "United Kingdom", "London", "textural_techno"],
    ["Cabaret Voltaire", "Project80", "Plastex", 122, "United Kingdom", "Sheffield", "sheffield_electronic_roots"],
    ["Manuel Gottsching", "E2-E4", "Inteam", 120, "Germany", "Berlin", "kosmische_techno_blueprint"],
    ["E.R.P.", "Vox Automaton", "Frustrated Funk", 124, "United States", "Dallas", "electro_ambient_bridge"],
    ["Convextion", "Miranda", "Down Low Music", 124, "United States", "Dallas", "deep_machine_ambient"]
  ],
  bleep_techno: [
    ["The Scientist", "The Bee", "Kickin Records", 124, "United Kingdom", "London", "early_bleep_anchor"],
    ["XON", "Dissonance", "Network", 124, "United Kingdom", "Birmingham", "network_bleep_depth"],
    ["T-Coy", "Carino", "Deconstruction", 122, "United Kingdom", "Manchester", "northern_rave_roots"],
    ["Bassheads", "Is There Anybody Out There", "Deconstruction", 125, "United Kingdom", "Liverpool", "uk_sub_pressure"],
    ["The Hypnotist", "The House Is Mine", "Rising High", 128, "United Kingdom", "London", "rising_high_bleep"],
    ["M-D-Emm", "Get Down", "S12", 124, "United Kingdom", "London", "uk_rave_techno"],
    ["Eon", "Spice", "Vinyl Solution", 125, "United Kingdom", "London", "rave_bleep_crossover"],
    ["Altern-8", "Activ 8", "Network", 128, "United Kingdom", "Stafford", "masked_rave_anchor"],
    ["N-Joi", "Anthem", "Deconstruction", 124, "United Kingdom", "Essex", "uk_rave_anchor"],
    ["Xpansions", "Move Your Body", "Arista", 124, "United Kingdom", "London", "bleep_rave_depth"],
    ["The House Crew", "Euphoria", "Production House", 126, "United Kingdom", "London", "hardcore_bleep_bridge"],
    ["2 Bad Mice", "Bombscare", "Moving Shadow", 126, "United Kingdom", "London", "breaks_bleep_bridge"],
    ["Smart Systems", "Tingler", "Jumpin' & Pumpin'", 125, "United Kingdom", "Manchester", "machine_bleep_depth"],
    ["Frequency", "Where Is Your Evidence", "Lower East Side", 124, "Netherlands", "Amsterdam", "european_bleep_signal"],
    ["GTO", "Pure", "React", 126, "United Kingdom", "London", "react_bleep_anchor"],
    ["Bizarre Inc", "Playing With Knives", "Vinyl Solution", 126, "United Kingdom", "Stafford", "uk_rave_crossover"],
    ["T99", "Anasthasia", "Who's That Beat", 128, "Belgium", "Brussels", "belgian_rave_techno"],
    ["Quadrophonia", "Quadrophonia", "ARS", 126, "Belgium", "Antwerp", "belgian_bleep_rave"],
    ["D-Shake", "Yaaah", "Go Bang!", 125, "Netherlands", "Amsterdam", "dutch_bleep_anchor"],
    ["4hero", "Mr Kirk's Nightmare", "Reinforced", 124, "United Kingdom", "London", "reinforced_techno_bridge"],
    ["Lenny De Ice", "We Are I.E.", "Reel 2 Reel", 130, "United Kingdom", "London", "uk_rave_blueprint"],
    ["Tronikhouse", "Uptempo", "Network", 126, "United States", "Detroit", "detroit_bleep_bridge"],
    ["Reese", "Rock To The Beat", "KMS", 124, "United States", "Detroit", "detroit_rave_techno"],
    ["R-Tyme", "R-Theme", "Transmat", 124, "United States", "Detroit", "detroit_uk_bridge"],
    ["The Prodigy", "Android", "XL Recordings", 126, "United Kingdom", "Braintree", "xl_rave_techno"],
    ["Shut Up And Dance", "Derek Went Mad", "Shut Up And Dance", 128, "United Kingdom", "London", "uk_bass_rave"],
    ["Nebula II", "Seance", "Reinforced", 128, "United Kingdom", "London", "bleep_breaks_bridge"],
    ["Messiah", "There Is No Law", "Kickin Records", 128, "United Kingdom", "London", "kickin_rave_techno"],
    ["Praga Khan", "Injected With A Poison", "Profile", 126, "Belgium", "Brussels", "belgian_techno_rave"],
    ["Joey Beltram", "Energy Flash", "R&S Records", 126, "United States", "New York", "rands_techno_blueprint"],
    ["Mental Overdrive", "12000 AD", "R&S Records", 126, "Norway", "Tromso", "nordic_rave_techno"],
    ["DHS", "House Of God", "Hangman", 123, "United States", "Chicago", "us_bleep_pressure"],
    ["Second Phase", "Mentasm", "R&S Records", 127, "United States", "New York", "mentasm_rave_signal"],
    ["Holy Noise", "Get Down Everybody", "Hithouse", 126, "Netherlands", "Rotterdam", "dutch_rave_techno"],
    ["Landlord", "I Like It", "Bigshot", 124, "United States", "New York", "us_sub_bass_techno"]
  ],
  broken_techno: [
    ["Simo Cell", "Piste Jaune", "Livity Sound", 130, "France", "Paris", "livity_france_bridge"],
    ["Forest Drive West", "Persistence Of Memory", "Livity Sound", 130, "United Kingdom", "London", "livity_depth"],
    ["A Made Up Sound", "Rear Window", "A Made Up Sound", 128, "Netherlands", "The Hague", "dutch_broken_techno"],
    ["2562", "Flashback", "Tectonic", 128, "Netherlands", "The Hague", "tectonic_bridge"],
    ["Martyn", "Vancouver", "3024", 130, "Netherlands", "Eindhoven", "3024_broken_anchor"],
    ["Shed", "Boom Room", "Ostgut Ton", 130, "Germany", "Berlin", "berlin_broken_pressure"],
    ["STL", "Silent State", "Smallville", 125, "Germany", "Hamburg", "leftfield_broken_depth"],
    ["DJ Python", "ADMSDP", "Dekmantel", 124, "United States", "New York", "deep_broken_bridge"],
    ["Rhyw", "Loom High", "Avian", 132, "United Kingdom", "London", "avian_syncopation"],
    ["Beneath", "Duty", "Mistry", 130, "United Kingdom", "London", "mistry_bass_techno"],
    ["Livity Sound", "Blue", "Livity Sound", 130, "United Kingdom", "Bristol", "collective_anchor"],
    ["Errorsmith", "Superlative Fatigue", "PAN", 130, "Germany", "Berlin", "experimental_broken_techno"],
    ["Airhead", "Kazzt", "1-800 Dinosaur", 128, "United Kingdom", "London", "uk_syncopated_depth"],
    ["Ramadanman", "Revenue", "Hessle Audio", 128, "United Kingdom", "London", "hessle_bridge"],
    ["Joy Orbison", "Hyph Mngo", "Hotflush", 130, "United Kingdom", "London", "post_dubstep_techno_bridge"],
    ["T++", "Audio1995#8", "Honest Jon's", 130, "Germany", "Berlin", "dubwise_broken_anchor"],
    ["Beatrice Dillon", "Workaround Two", "PAN", 128, "United Kingdom", "London", "minimal_broken_techno"],
    ["Peverelist & Kowton", "Raw Code", "Livity Sound", 130, "United Kingdom", "Bristol", "bristol_broken_anchor"],
    ["Mumdance & Logos", "Dance Energy", "Tectonic", 132, "United Kingdom", "London", "weightless_broken_techno"],
    ["Laurel Halo", "Jelly", "Hyperdub", 130, "United States", "New York", "hyperdub_broken_depth"],
    ["Call Super", "Sulu Sekou", "Houndstooth", 128, "United Kingdom", "London", "off_grid_techno"],
    ["Shackleton", "Blood On My Hands", "Skull Disco", 128, "United Kingdom", "Lancashire", "skull_disco_bridge"],
    ["Parris", "Your Kiss Is Sour", "Hemlock", 130, "United Kingdom", "London", "hemlock_syncopation"],
    ["Asusu", "Velez", "Livity Sound", 130, "United Kingdom", "Bristol", "livity_broken_depth"],
    ["Special Request", "Stairfoot Lane Bunker", "Houndstooth", 132, "United Kingdom", "Leeds", "warehouse_broken_bridge"],
    ["Minor Science", "Volumes", "Whities", 130, "United Kingdom", "London", "leftfield_broken_anchor"],
    ["Zenker Brothers", "Berg 10", "Ilian Tape", 132, "Germany", "Munich", "ilian_tape_broken_depth"],
    ["Batu & Lurka", "Kneqq", "Timedance", 130, "United Kingdom", "Bristol", "timedance_anchor"]
  ],
  deep_techno: [
    ["Wata Igarashi", "Question And Answer", "The Bunker New York", 128, "Japan", "Tokyo", "japanese_deep_hypnosis"],
    ["Rrose", "Waterfall", "Eaux", 128, "United States", "New York", "deep_experimental_anchor"],
    ["Marco Shuttle", "The Vox Attitude", "Eerie", 126, "Italy", "Milan", "eerie_deep_techno"],
    ["Cassegrain", "Tiamat", "Prologue", 128, "Germany", "Berlin", "prologue_depth"],
    ["Evigt Morker", "Hogre", "Northern Electronics", 128, "Sweden", "Stockholm", "northern_electronics_depth"],
    ["Kwartz", "Show Me That Light", "PoleGroup", 130, "Spain", "Madrid", "spanish_deep_pressure"],
    ["Skarn", "Revolver", "Avian", 128, "Sweden", "Stockholm", "avian_deep_signal"],
    ["Saphileaum", "Uninhibited Kingdom", "Oslated", 126, "Georgia", "Tbilisi", "caucasus_deep_techno"],
    ["Fjader", "On The Moon", "Semantica", 126, "Sweden", "Stockholm", "semantica_depth"],
    ["BLNDR", "Mihu", "Annulled Music", 128, "France", "Paris", "french_deep_techno"],
    ["Antonio Ruscito", "Lucid Dream", "Non Series", 128, "Italy", "Naples", "non_series_depth"],
    ["Samuli Kemppi", "Dark Matter", "Mote-Evolver", 128, "Finland", "Helsinki", "finnish_deep_drive"],
    ["Milton Bradley", "The Unheard Voice From Outer Space", "Do Not Resist The Beat", 128, "Germany", "Berlin", "berlin_deep_hypnosis"],
    ["Silent Servant", "A Path Eternal", "Sandwell District", 128, "United States", "Los Angeles", "sandwell_deep_shadow"],
    ["Orphx", "Boundary Conditions", "Sonic Groove", 128, "Canada", "Hamilton", "industrial_deep_bridge"],
    ["Rodhad", "Kinder Der Ringwelt", "Dystopian", 130, "Germany", "Berlin", "dystopian_deep_anchor"],
    ["Etapp Kyle", "Empty Mind", "Klockworks", 128, "Ukraine", "Kyiv", "klockworks_depth"],
    ["Korridor", "Somnolence", "Northern Electronics", 128, "Sweden", "Stockholm", "scandinavian_deep_techno"],
    ["Joachim Spieth", "Meteor", "Affin", 128, "Germany", "Stuttgart", "affin_atmospheric_anchor"],
    ["Toki Fuko", "Esoteric", "Token", 128, "Russia", "Moscow", "deep_hypnotic_depth"],
    ["Tadeo", "Terra Incognita", "Non Series", 128, "Spain", "Madrid", "spanish_deep_hypnosis"],
    ["Zadig", "Dark Nebula", "Construct Re-Form", 130, "France", "Paris", "french_deep_pressure"]
  ],
  hardgroove_techno: [
    ["A.Paul", "Juice", "Naked Lunch", 138, "Portugal", "Lisbon", "portuguese_hardgroove"],
    ["David Moleon", "Kronos", "Moop Up", 138, "Spain", "Granada", "spanish_hardgroove"],
    ["Boriqua Tribez", "Jackin Tek", "Primate", 138, "Austria", "Vienna", "tribal_groove_depth"],
    ["Spiros Kaloumenos", "Omonoia", "Omega Audio", 138, "Greece", "Athens", "greek_groove_pressure"],
    ["Axel Karakasis", "Pull The Trigger", "Remain", 138, "Greece", "Athens", "remain_hardgroove"],
    ["Eric Sneo", "Ciao Bella", "Beatdisaster", 136, "Germany", "Frankfurt", "percussion_live_anchor"],
    ["Pedro Delgardo", "Metropolis", "Yin Yang", 138, "United Kingdom", "London", "uk_hardgroove_depth"],
    ["Fer BR", "Playground", "Kombination Research", 136, "Spain", "Barcelona", "barcelona_groove"],
    ["Marco Carola", "Question 10", "Design Music", 136, "Italy", "Naples", "italian_loop_techno"],
    ["Danilo Vigorito", "Imaginary Boy", "Orion Muzik", 136, "Italy", "Naples", "napoli_groove"],
    ["Technasia", "Evergreen", "Sino", 136, "Hong Kong", "Hong Kong", "sino_groove_anchor"],
    ["Steve Stoll", "Model T", "Proper NYC", 136, "United States", "New York", "nyc_loop_pressure"],
    ["Jamie Bissmire", "Number And Measure", "Ground", 136, "United Kingdom", "London", "uk_loop_techno"],
    ["Mike Humphries", "Tactical Recon", "Mastertraxx", 138, "United Kingdom", "London", "hardgroove_tool_depth"],
    ["Tom Hades", "Caliber", "Rhythm Convert(ed)", 136, "Belgium", "Antwerp", "belgian_groove"],
    ["Umek", "Lanicor", "Consumer Recreation", 136, "Slovenia", "Ljubljana", "slovenian_hardgroove"],
    ["Preach", "No War In The Summer", "Relic", 138, "Canada", "Montreal", "canadian_groove_pressure"],
    ["Redhead", "Sad Homecoming", "MB Elektronics", 136, "Belgium", "Antwerp", "mb_elektronics_depth"],
    ["Elton D", "Disco Revenge", "Patterns", 138, "Brazil", "Sao Paulo", "brazilian_hardgroove"],
    ["Space DJz", "AK47", "Potential", 136, "United Kingdom", "London", "uk_percussion_pressure"],
    ["Patrik Skoog", "Desolation", "Native Diffusion", 138, "Sweden", "Stockholm", "swedish_hardgroove"],
    ["Hardcell", "Ground Effect", "Drumcode", 136, "Sweden", "Stockholm", "drumcode_groove"],
    ["Henrik B", "Manwolf", "Illgorhythm", 136, "Sweden", "Stockholm", "swedish_loop_techno"],
    ["Thomas Krome", "Bitches From Hell", "Corb", 136, "Sweden", "Malmo", "swedish_warehouse_groove"],
    ["Gaetek", "Tonite", "Conform", 136, "Italy", "Naples", "italian_hardgroove"],
    ["Headroom", "Su:real", "Compound", 138, "United Kingdom", "London", "compound_groove_tool"]
  ],
  tribal_techno: [
    ["Filterheadz", "Sunshine", "Intec", 136, "Belgium", "Antwerp", "intec_percussive_anchor"],
    ["Chus & Ceballos", "Iberican Sound", "Stereo Productions", 134, "Spain", "Madrid", "iberican_percussion"],
    ["DJ Vibe", "I'll Take You", "Kaos", 136, "Portugal", "Lisbon", "portuguese_tribal_anchor"],
    ["D-Formation", "Signs And Portents", "BeatFreak", 134, "Spain", "Madrid", "spanish_percussive_depth"],
    ["Kobbe", "The Sound Of Goodbye", "Sondos", 134, "United States", "New York", "tribal_tool_depth"],
    ["Wally Lopez", "Factorizando", "Weekend", 134, "Spain", "Madrid", "spanish_tribal_crossover"],
    ["Dr. Kucho!", "La Isla", "Disc Doctor", 134, "Spain", "Madrid", "latin_percussion_signal"],
    ["Marco Lenzi", "Taboo", "Molecular", 136, "United Kingdom", "London", "molecular_tribal_depth"],
    ["Misstress Barbara", "Barcelona", "Relentless", 136, "Canada", "Montreal", "canadian_percussive_drive"],
    ["Steve Rachmad", "Moog On Acid", "Music Man", 136, "Netherlands", "Amsterdam", "dutch_percussion_bridge"],
    ["Vince Watson", "Mystical Rhythm", "Bio", 134, "United Kingdom", "Glasgow", "rhythmic_techno_depth"],
    ["Dave Angel", "Airborne", "Rotation", 136, "United Kingdom", "London", "uk_percussive_anchor"],
    ["Jel Ford", "Grand Union", "Jericho", 136, "United Kingdom", "London", "jericho_tribal_tool"],
    ["Ben Long", "Potential", "Potential", 136, "United Kingdom", "London", "uk_loop_tool"],
    ["Joris Voorn", "Incident", "Sino", 136, "Netherlands", "Rotterdam", "dutch_percussive_drive"],
    ["Adam Beyer", "Remainings III", "Drumcode", 136, "Sweden", "Stockholm", "swedish_percussive_techno"],
    ["Space DJz", "I Am Machine", "Primate", 136, "United Kingdom", "London", "primate_tribal_pressure"],
    ["Inigo Kennedy", "Cathedral", "Token", 136, "United Kingdom", "London", "uk_driving_percussion"],
    ["Ken Ishii", "Extra", "R&S Records", 136, "Japan", "Tokyo", "japanese_percussive_techno"],
    ["C1", "Rattlesnake", "Intec", 136, "United Kingdom", "London", "intec_tool_depth"],
    ["Felipe Venegas", "Chango", "Cadenza", 130, "Chile", "Santiago", "latin_rhythm_depth"],
    ["Paco Osuna", "Atopisimo", "Plus 8", 132, "Spain", "Barcelona", "spanish_percussion_tool"],
    ["Technasia", "Force", "Sino", 136, "Hong Kong", "Hong Kong", "sino_tribal_drive"],
    ["Advent & Industrialyzer", "Terra Nosa", "Kombination Research", 136, "United Kingdom", "London", "kombination_percussion"],
    ["Danilo Vigorito", "Black Out", "Primate", 136, "Italy", "Naples", "napoli_tribal_tool"],
    ["Marco Carola", "Avalanche", "Design Music", 136, "Italy", "Naples", "italian_tribal_loop"]
  ]
};

function normalize(value = "") {
  return String(value || "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/&/g, " and ")
    .replace(/[^a-z0-9]+/g, " ")
    .trim()
    .replace(/\s+/g, " ");
}

function csvCell(value = "") {
  return `"${String(value ?? "").replace(/"/g, "\"\"")}"`;
}

function parseCsvRows(text = "") {
  const rows = [];
  let row = [];
  let value = "";
  let quoted = false;
  const safeText = String(text || "").replace(/^\uFEFF/, "");

  for (let index = 0; index < safeText.length; index += 1) {
    const char = safeText[index];
    const next = safeText[index + 1];
    if (char === "\"") {
      if (quoted && next === "\"") {
        value += "\"";
        index += 1;
      } else {
        quoted = !quoted;
      }
      continue;
    }
    if (!quoted && char === ",") {
      row.push(value);
      value = "";
      continue;
    }
    if (!quoted && (char === "\n" || char === "\r")) {
      if (char === "\r" && next === "\n") index += 1;
      row.push(value);
      if (row.some((cell) => String(cell || "").trim())) rows.push(row);
      row = [];
      value = "";
      continue;
    }
    value += char;
  }

  row.push(value);
  if (row.some((cell) => String(cell || "").trim())) rows.push(row);
  if (rows.length < 2) return [];

  const headers = rows[0].map((header, index) => normalize(header).replace(/\s+/g, "_") || `column_${index}`);
  return rows.slice(1).map((cells) => {
    const record = {};
    headers.forEach((header, index) => {
      record[header] = String(cells[index] || "").trim();
    });
    return record;
  });
}

function readExistingKeys() {
  const artistStyleKeys = new Set();
  const trackKeys = new Set();
  const ignoredFiles = new Set([path.basename(OUT)]);
  if (!fs.existsSync(DATA_DIR)) return { artistStyleKeys, trackKeys };

  for (const file of fs.readdirSync(DATA_DIR).filter((name) => name.endsWith(".csv") && !ignoredFiles.has(name))) {
    const rows = parseCsvRows(fs.readFileSync(path.join(DATA_DIR, file), "utf8"));
    rows.forEach((row) => {
      const style = normalize(row.style || row.subgenre || row.genre || row.main_style).replace(/\s+/g, "_");
      const artist = row.artist || row.artist_name || row.name;
      const song = row.song || row.track || row.title || row.track_name;
      if (style && artist) artistStyleKeys.add(`${style}::${normalize(artist)}`);
      if (artist && song) trackKeys.add(`${normalize(artist)}::${normalize(song)}`);
    });
  }
  return { artistStyleKeys, trackKeys };
}

function url(base, query) {
  return `${base}${encodeURIComponent(query)}`;
}

function discogsUrl(query) {
  return `https://www.discogs.com/search/?q=${encodeURIComponent(query)}&type=all`;
}

function makeRow(style, entry) {
  const [artist, song, label, bpm, country, city, role] = entry;
  const config = STYLE_CONFIG[style];
  const query = `${artist} ${song}`;
  const artistQuery = `${artist} ${config.label}`;
  const labelQuery = `${label} ${config.label}`;
  const sourceNote = [
    "Curadoria editorial v5 do Sonic Search.",
    "Bio escrita localmente, sem copiar press kit ou plataforma externa.",
    `BPM editorial dentro da faixa ${config.bpm}; revisar antes de marcar como medicao exata.`,
    "Links sao rotas de descoberta/search, nao perfis oficiais reivindicados."
  ].join(" ");

  return {
    style,
    artist,
    song,
    label,
    bpm_exact: bpm,
    bpm_text: `${bpm} BPM editorial`,
    release_date: "",
    duration_sec: "",
    country,
    city,
    source_album: "",
    source_url: discogsUrl(query),
    track_url: url("https://www.youtube.com/results?search_query=", query),
    spotify_url: url("https://open.spotify.com/search/", query),
    youtube_url: url("https://www.youtube.com/results?search_query=", query),
    soundcloud_url: url("https://soundcloud.com/search?q=", query),
    bandcamp_url: url("https://bandcamp.com/search?q=", query),
    beatport_url: url("https://www.beatport.com/search?q=", query),
    artist_bio: `${artist} entra no banco proprio como referencia de ${config.label}; a faixa "${song}" ancora contexto, origem e rota de descoberta sem depender de API fechada.`,
    artist_genre: config.artistGenre,
    artist_profile_hint: `Perfil editorial proprio para ${config.label}. Use os links como descoberta e confirme manualmente antes de promover qualquer URL a oficial.`,
    primary_social_url: url("https://www.google.com/search?q=", `${artist} official`),
    social_discovery_links: [
      url("https://open.spotify.com/search/", artistQuery),
      url("https://soundcloud.com/search?q=", artistQuery),
      url("https://www.youtube.com/results?search_query=", artistQuery),
      url("https://bandcamp.com/search?q=", artistQuery)
    ].join(" | "),
    label_links: [
      discogsUrl(labelQuery),
      url("https://www.beatport.com/search?q=", labelQuery)
    ].join(" | "),
    source_type: "curated_editorial_discovery",
    source_tags: config.tags.join(" | "),
    album_keywords: [config.label, artist, label, role].join(" | "),
    energy_band: config.energy,
    catalog_role: role,
    status: "curated_discovery",
    confidence: "medium_high_editorial",
    source_note: sourceNote
  };
}

function csvWrite(rows, headers) {
  return [
    headers.map(csvCell).join(","),
    ...rows.map((row) => headers.map((header) => csvCell(row[header] || "")).join(","))
  ].join("\n") + "\n";
}

function main() {
  fs.mkdirSync(DATA_DIR, { recursive: true });
  fs.mkdirSync(REPORTS_DIR, { recursive: true });
  const { artistStyleKeys, trackKeys } = readExistingKeys();
  const rows = [];
  const skipped = [];

  Object.entries(ENTRIES).forEach(([style, entries]) => {
    entries.forEach((entry) => {
      const [artist, song] = entry;
      const artistStyleKey = `${style}::${normalize(artist)}`;
      const trackKey = `${normalize(artist)}::${normalize(song)}`;
      if (artistStyleKeys.has(artistStyleKey) || trackKeys.has(trackKey)) {
        skipped.push({ style, artist, song });
        return;
      }
      artistStyleKeys.add(artistStyleKey);
      trackKeys.add(trackKey);
      rows.push(makeRow(style, entry));
    });
  });

  rows.sort((a, b) => a.style.localeCompare(b.style) || a.artist.localeCompare(b.artist) || a.song.localeCompare(b.song));

  const headers = [
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
    "spotify_url",
    "youtube_url",
    "soundcloud_url",
    "bandcamp_url",
    "beatport_url",
    "artist_bio",
    "artist_genre",
    "artist_profile_hint",
    "primary_social_url",
    "social_discovery_links",
    "label_links",
    "source_type",
    "source_tags",
    "album_keywords",
    "energy_band",
    "catalog_role",
    "status",
    "confidence",
    "source_note"
  ];

  fs.writeFileSync(OUT, csvWrite(rows, headers));

  const byStyle = rows.reduce((acc, row) => {
    acc[row.style] = (acc[row.style] || 0) + 1;
    return acc;
  }, {});
  const reportLines = [
    "# Techno enrichment v5",
    "",
    `Gerado em: ${new Date().toISOString()}`,
    "",
    "## Resumo",
    "",
    `- Linhas novas: ${rows.length}`,
    `- Candidatos pulados por duplicidade local: ${skipped.length}`,
    "- Escopo: ambient_techno, bleep_techno, broken_techno, deep_techno, hardgroove_techno, tribal_techno.",
    "- Politica legal: bios editoriais proprias; links de descoberta/search; nenhum scraping e nenhuma API fechada.",
    "",
    "## Por estilo",
    "",
    ...Object.entries(byStyle)
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([style, count]) => `- ${style}: ${count} faixas/artistas`),
    "",
    "## Observacao",
    "",
    "Este pacote melhora profundidade de artistas e rotas de descoberta. Links oficiais diretos devem ser promovidos apenas apos revisao manual ou API com termos aceitos."
  ];
  fs.writeFileSync(REPORT_OUT, `${reportLines.join("\n")}\n`);

  console.log(`Wrote ${rows.length} rows to ${path.relative(ROOT, OUT)}`);
  console.log(`Skipped ${skipped.length} duplicate candidates`);
  Object.entries(byStyle)
    .sort(([a], [b]) => a.localeCompare(b))
    .forEach(([style, count]) => console.log(`${style.padEnd(22)} +${count}`));
  console.log(`Report ${path.relative(ROOT, REPORT_OUT)}`);
}

main();
