const STYLE_TO_FAMILY = {
  psytrance: "psytrance",
  forest_psy: "psytrance",
  dark_psy: "psytrance",
  dark_experimental: "psytrance",
  psycore: "psytrance",
  full_on: "psytrance",
  full_on_night: "psytrance",
  full_on_morning: "psytrance",
  progressive_psy: "psytrance",
  hi_tech: "psytrance",
  dark_progressive: "psytrance",
  goa_trance: "psytrance",
  psy_comercial: "psytrance",
  trance_uplifting: "trance",
  techno: "techno",
  acid_techno: "techno",
  hard_techno: "techno",
  minimal_techno: "techno",
  melodic_techno: "techno",
  industrial_techno: "techno",
  peak_time_techno: "techno",
  house: "house",
  deep_house: "house",
  tech_house: "house",
  progressive_house: "house",
  afro_house: "house",
  organic_house: "house",
  bass_house: "house",
  electro_house: "house",
  drum_and_bass: "dnb",
  liquid_dnb: "dnb",
  neurofunk: "dnb",
  jump_up: "dnb",
  jungle: "dnb",
  breakbeat: "bass_music",
  uk_garage: "bass_music",
  future_garage: "bass_music",
  dubstep: "bass_music",
  downtempo: "leftfield",
  ambient: "leftfield",
  slambient: "psytrance",
  idm: "leftfield",
  electro: "leftfield",
  hardstyle: "hard_dance"
};

const STYLE_SEARCH_TERMS = {
  forest_psy: "forest psytrance",
  dark_psy: "dark psy psytrance",
  dark_progressive: "prog dark dark progressive zenonesque psy",
  psycore: "psycore darkpsy hitech psytrance",
  tech_house: "tech house",
  full_on: "full on psytrance",
  full_on_night: "full on night psytrance",
  full_on_morning: "full on morning psytrance",
  hi_tech: "hi tech psytrance",
  dark_experimental: "dark experimental psytrance",
  slambient: "slambient psytrance",
  psy_comercial: "commercial psytrance",
  acid_techno: "acid techno",
  hard_techno: "hard techno",
  industrial_techno: "industrial techno",
  peak_time_techno: "peak time techno",
  minimal_techno: "minimal techno",
  melodic_techno: "melodic techno"
};

const STYLE_TO_VIBE_THEME = {
  dark_psy: "dark",
  dark_experimental: "dark",
  dark_progressive: "dark",
  psycore: "dark",
  full_on_night: "dark",
  slambient: "dark",
  techno: "techno",
  acid_techno: "techno",
  hard_techno: "techno",
  minimal_techno: "techno",
  melodic_techno: "techno",
  industrial_techno: "techno",
  peak_time_techno: "techno",
  drum_and_bass: "dnb",
  liquid_dnb: "dnb",
  neurofunk: "dnb",
  jump_up: "dnb",
  jungle: "dnb",
  psytrance: "psy",
  forest_psy: "psy",
  full_on: "psy",
  full_on_morning: "psy",
  progressive_psy: "psy",
  hi_tech: "psy",
  goa_trance: "psy",
  psy_comercial: "psy",
  house: "house",
  deep_house: "house",
  tech_house: "house",
  progressive_house: "house",
  afro_house: "house",
  organic_house: "house",
  bass_house: "house",
  electro_house: "house",
  breakbeat: "bass",
  uk_garage: "bass",
  future_garage: "bass",
  dubstep: "bass",
  ambient: "ambient",
  downtempo: "ambient",
  idm: "leftfield",
  electro: "leftfield",
  trance_uplifting: "trance",
  hardstyle: "hard"
};

const VIBE_THEME_TOKENS = {
  default: ["♪", "♫", "♬", "☠", "🔊", "🎚", "🎛", "▁▃▅▇", "█▆▃▁", "✦", "✧", "◉", "◈", "◌", "⟡", "☄", "⚡", "⬢"],
  dark: ["☠", "☣", "🦇", "⛓", "🕯", "🕷", "🔊", "🎚", "▁▅█▆", "✶", "💊", "⚚", "◬", "⚙"],
  techno: ["🤖", "🎧", "⚙", "🎚", "🎛", "🔊", "▁▃▆█", "▣", "◉", "⌁", "◈", "◬", "⧉", "◫", "⚡"],
  dnb: ["🥁", "🔊", "🔉", "⚡", "🌀", "◢", "◣", "🎚", "🎛", "◤", "◥", "⨳", "▁▅█▆"],
  psy: ["👽", "💊", "🧿", "🌀", "✺", "☄", "🔮", "✶", "◉", "⬡", "☠", "🎚", "▁▃▆█"],
  house: ["🪩", "🎵", "🕺", "✨", "💿", "🎚", "🔊", "◈", "◍", "◐", "✧", "▁▃▆█"],
  bass: ["🔊", "🔉", "⚡", "💥", "🎛", "🎚", "☠", "◤", "◥", "⬣", "▰", "▱", "◉", "▁▃▆█"],
  ambient: ["☁", "🌙", "✧", "◌", "⬡", "⟡", "🫧", "◎", "◍", "⋆", "🎚"],
  leftfield: ["🧬", "◇", "∞", "🔮", "✶", "◉", "🜁", "⟐", "▣", "◍", "🎛"],
  trance: ["✨", "⟡", "☄", "🔔", "🜂", "◍", "✧", "✶", "◌", "◉", "🔊"],
  hard: ["🔥", "⚡", "⛓", "💣", "☠", "⛧", "▛", "🛡", "🎚", "◣", "◤", "⚑"]
};

const VIBE_THEME_CONFIG = {
  default: { density: 40, minSize: 0.96, maxSize: 1.66, minDuration: 9.8, maxDuration: 18.5 },
  dark: { density: 44, minSize: 1.04, maxSize: 1.84, minDuration: 8.8, maxDuration: 16.8 },
  psy: { density: 42, minSize: 1.02, maxSize: 1.8, minDuration: 8.6, maxDuration: 16.2 },
  techno: { density: 40, minSize: 1, maxSize: 1.74, minDuration: 8.9, maxDuration: 15.8 },
  dnb: { density: 42, minSize: 0.98, maxSize: 1.72, minDuration: 7.8, maxDuration: 14.5 },
  house: { density: 38, minSize: 0.96, maxSize: 1.68, minDuration: 9.2, maxDuration: 17.2 },
  bass: { density: 42, minSize: 0.98, maxSize: 1.72, minDuration: 8.2, maxDuration: 15.2 },
  ambient: { density: 30, minSize: 0.94, maxSize: 1.58, minDuration: 11.8, maxDuration: 20.5 },
  leftfield: { density: 32, minSize: 0.98, maxSize: 1.74, minDuration: 10.6, maxDuration: 19.1 },
  trance: { density: 38, minSize: 1, maxSize: 1.76, minDuration: 9.2, maxDuration: 16.8 },
  hard: { density: 42, minSize: 1.04, maxSize: 1.84, minDuration: 7.8, maxDuration: 14.2 }
};

const EXTERNAL_DATASET_FILES = [
  "data/codex_dataset_pack_v14/tracks.json",
  "data/codex_dataset_pack_v14/tracks.csv",
  "data/codex_dataset_pack_v14/prog_dark_tracks.csv",
  "data/codex_dataset_pack_v14/artists.json",
  "data/codex_dataset_pack_v14/artists.csv",
  "data/codex_dataset_pack_v14/recent_artist_signals.json",
  "data/codex_dataset_pack_v14/data/psytrance_db_v14.jsonl",
  "data/codex_dataset_pack_v14/data/psycore_db_v14.jsonl",
  "data/codex_dataset_pack_v14/psytrance_artist_enriched_bios.csv",
  "data/codex_dataset_pack_v14/psytrance_artist_seed_subset.csv"
];

const LOCAL_TRACK_SEED_BOOST = [
  { style: "psytrance", artist: "Astrix", song: "He.art", label: "Shamanic Tales", bpmExact: 145 },
  { style: "forest_psy", artist: "Atriohm", song: "Takums", label: "Parvati Records", bpmExact: 149 },
  { style: "dark_psy", artist: "Kindzadza", song: "Narcotic Influence", label: "Parvati Records", bpmExact: 158 },
  { style: "full_on", artist: "Sonic Species", song: "Rush", label: "Nano Records", bpmExact: 146 },
  { style: "full_on_morning", artist: "Avalon", song: "The Journey", label: "Nano Records", bpmExact: 144 },
  { style: "progressive_psy", artist: "Captain Hook", song: "Bungee Jump", label: "Iboga Records", bpmExact: 138 },
  { style: "dark_experimental", artist: "Audiosyntax", song: "Shadow Protocol", label: "Catálogo curado", bpmExact: 160 },
  { style: "hi_tech", artist: "Technical Hitch", song: "Mama India", label: "Sangoma Records", bpmExact: 178 },
  { style: "techno", artist: "ANNA", song: "Hidden Beauties", label: "Drumcode", bpmExact: 131 },
  { style: "hard_techno", artist: "DYEN", song: "Pacemaker", label: "KNTXT", bpmExact: 147 },
  { style: "minimal_techno", artist: "Rene Wise", song: "Cave", label: "Mote Evolver", bpmExact: 128 },
  { style: "melodic_techno", artist: "Anyma", song: "Explore Your Future", label: "Afterlife", bpmExact: 126 },
  { style: "house", artist: "Frankie Knuckles", song: "Baby Wants To Ride", label: "Trax Records", bpmExact: 122 },
  { style: "tech_house", artist: "PAWSA", song: "Dirty Cash", label: "Solid Grooves", bpmExact: 128 },
  { style: "drum_and_bass", artist: "Sub Focus", song: "Tidal Wave", label: "RAM Records", bpmExact: 174 },
  { style: "liquid_dnb", artist: "Calibre", song: "Even If", label: "Signature", bpmExact: 172 },
  { style: "neurofunk", artist: "Noisia", song: "Collider", label: "Vision", bpmExact: 174 },
  { style: "ambient", artist: "Biosphere", song: "Poa Alpina", label: "Apollo", bpmExact: 90 },
  { style: "idm", artist: "Floating Points", song: "Anasickmodular", label: "Ninja Tune", bpmExact: 123 },
  {
    style: "dark_progressive",
    artist: "Dividuum",
    song: "Cold Fusion",
    label: "Zenon Records",
    bpmExact: 136,
    releaseDate: "2026-01-29",
    artistGenre: "Prog Dark / Zenonesque",
    artistProfileHint: "Projeto associado ao eixo prog dark da Zenon, com assinatura hipnótica e sombria."
  },
  {
    style: "dark_progressive",
    artist: "Evil Oil Man",
    song: "Cable Guy",
    label: "Zenon Records",
    bpmExact: 136,
    releaseDate: "2025-12-12",
    artistGenre: "Prog Dark / Zenonesque",
    artistProfileHint: "Nome de referência no eixo dark prog com narrativas psicodélicas de longo curso."
  },
  {
    style: "dark_progressive",
    artist: "AIRI",
    song: "Starship",
    label: "Zenon Records",
    bpmExact: 136,
    releaseDate: "2026-02-19",
    artistGenre: "Prog Dark / Zenonesque",
    artistProfileHint: "Artista em destaque recente na curadoria dark progressive da Zenon."
  },
  {
    style: "dark_progressive",
    artist: "Molecc",
    song: "Bizarradique",
    label: "Zenon Records",
    bpmExact: 136,
    releaseDate: "2025-10-03",
    artistGenre: "Prog Dark / Zenonesque",
    artistProfileHint: "Projeto com groove quebrado e atmosfera obscura dentro do recorte prog dark."
  },
  {
    style: "dark_progressive",
    artist: "Elberg",
    song: "Flamencore",
    label: "Zenon Records",
    bpmExact: 137,
    releaseDate: "2025-11-14",
    artistGenre: "Prog Dark / Zenonesque",
    artistProfileHint: "Projeto dark progressive com texturas orgânicas e assinatura zenonesque."
  },
  {
    style: "slambient",
    artist: "VallaK",
    song: "Inferis",
    label: "The Endless Knot",
    bpmExact: 178,
    releaseDate: "2025-07-09",
    artistCountry: "Brazil",
    artistGenre: "Dark experimental / Slambient",
    artistProfileHint: "Projeto brasileiro associado ao eixo slambient com colaborações recentes."
  },
  {
    style: "slambient",
    artist: "Vutt'un",
    song: "Flawed Design",
    label: "The Endless Knot",
    bpmExact: 174,
    releaseDate: "2025-01-18",
    artistCountry: "Brazil",
    artistGenre: "Slambient / Dark experimental",
    artistProfileHint: "Projeto recente com presença em plataformas abertas e estética sombria."
  },
  {
    style: "dark_experimental",
    artist: "Vuga",
    song: "M72",
    label: "The Endless Knot",
    bpmExact: 170,
    releaseDate: "2026-01-15",
    artistCountry: "Brazil",
    artistGenre: "Dark experimental / Slambient hybrid",
    artistProfileHint: "Projeto emergente com recorte dark e desenho sonoro de alta intensidade."
  },
  {
    style: "dark_experimental",
    artist: "VvV",
    song: "VvV",
    label: "The Endless Knot",
    bpmExact: 166,
    releaseDate: "2025-09-08",
    artistCountry: "Brazil",
    artistGenre: "Dark experimental / Slambient project",
    artistProfileHint: "Projeto colaborativo voltado para experimentação de pista."
  },
  {
    style: "psytrance",
    artist: "Critical Frequency",
    song: "Synapse Reconstruction",
    label: "Curated catalog",
    bpmExact: 145,
    releaseDate: "2025-10-28",
    artistCountry: "Brazil",
    artistGenre: "Psytrance",
    artistProfileHint: "Projeto brasileiro emergente com releases recentes em plataformas abertas."
  }
];

const ARTIST_GENRE_HINT_OVERRIDES = {
  "evil oil man": {
    pt: "Prog Dark / zenonesque",
    en: "Prog Dark / zenonesque",
    es: "Prog Dark / zenonesque"
  },
  dividuum: {
    pt: "Prog Dark / zenonesque",
    en: "Prog Dark / zenonesque",
    es: "Prog Dark / zenonesque"
  },
  airi: {
    pt: "Prog Dark / zenonesque",
    en: "Prog Dark / zenonesque",
    es: "Prog Dark / zenonesque"
  },
  molecc: {
    pt: "Prog Dark / zenonesque",
    en: "Prog Dark / zenonesque",
    es: "Prog Dark / zenonesque"
  },
  elberg: {
    pt: "Prog Dark / zenonesque",
    en: "Prog Dark / zenonesque",
    es: "Prog Dark / zenonesque"
  },
  "vermont br": {
    pt: "Progressive Psy",
    en: "Progressive Psy",
    es: "Progressive Psy"
  },
  vallak: {
    pt: "Dark experimental / slambient",
    en: "Dark experimental / slambient",
    es: "Dark experimental / slambient"
  },
  vuttun: {
    pt: "Slambient / dark experimental",
    en: "Slambient / dark experimental",
    es: "Slambient / dark experimental"
  },
  vuga: {
    pt: "Dark experimental / slambient híbrido",
    en: "Dark experimental / slambient hybrid",
    es: "Dark experimental / slambient híbrido"
  },
  vvv: {
    pt: "Projeto dark experimental / slambient",
    en: "Dark experimental / slambient project",
    es: "Proyecto dark experimental / slambient"
  },
  "critical frequency": {
    pt: "Psytrance",
    en: "Psytrance",
    es: "Psytrance"
  },
  "critical frequency live": {
    pt: "Psytrance (live)",
    en: "Psytrance (live)",
    es: "Psytrance (live)"
  }
};

const DATASET_STYLE_ALIASES = {
  psytrance: "psytrance",
  psy: "psytrance",
  progressive: "progressive_psy",
  forest: "forest_psy",
  forestpsy: "forest_psy",
  darkpsy: "dark_psy",
  darkpsytrance: "dark_psy",
  progdark: "dark_progressive",
  darkprog: "dark_progressive",
  prog_dark: "dark_progressive",
  dark_prog: "dark_progressive",
  progressivedark: "dark_progressive",
  zenonesque: "dark_progressive",
  progdarkzenonesque: "dark_progressive",
  darkexperimental: "dark_experimental",
  experimentaldark: "dark_experimental",
  psycore: "psycore",
  psy_core: "psycore",
  fullon: "full_on",
  fullonnight: "full_on_night",
  fullonmorning: "full_on_morning",
  progresspsy: "progressive_psy",
  progressivepsy: "progressive_psy",
  darkprogressive: "dark_progressive",
  hitech: "hi_tech",
  hitechpsy: "hi_tech",
  hitechpsytrance: "hi_tech",
  slambient: "slambient",
  psychill: "ambient",
  psybient: "ambient",
  psychillpsybient: "ambient",
  chillout: "downtempo",
  chilloutdowntempo: "downtempo",
  psycomercial: "psy_comercial",
  psycommercial: "psy_comercial",
  chacota: "psy_comercial",
  chacotas: "psy_comercial",
  acidtechno: "acid_techno",
  hardtechno: "hard_techno",
  minimaltechno: "minimal_techno",
  melodictechno: "melodic_techno",
  industrialtechno: "industrial_techno",
  peaktimetechno: "peak_time_techno",
  deephouse: "deep_house",
  techhouse: "tech_house",
  progressivehouse: "progressive_house",
  afrohouse: "afro_house",
  organichouse: "organic_house",
  basshouse: "bass_house",
  electrohouse: "electro_house",
  drumandbass: "drum_and_bass",
  liquiddnb: "liquid_dnb",
  neurofunk: "neurofunk",
  jumpup: "jump_up",
  ukgarage: "uk_garage",
  futuregarage: "future_garage",
  goatrance: "goa_trance",
  upliftingtrance: "trance_uplifting"
};

const catalog = [
  {
    style: "psytrance",
    song: "Deep Jungle Walk",
    artist: "Astrix",
    label: "HOMmega",
    bpm: "145-155",
    energy: "high",
    vocals: "instrumental",
    context: ["peak", "estrada"],
    vibe: "Psytrance hipnotico com drive forte para manter pista acesa.",
    spotifyUrl: "https://open.spotify.com/search/Deep%20Jungle%20Walk%20Astrix",
    youtubeUrl: "https://www.youtube.com/results?search_query=Deep+Jungle+Walk+Astrix",
    beatportUrl: "https://www.beatport.com/search?q=Astrix%20Deep%20Jungle%20Walk",
    artistBio: "Astrix e um dos nomes centrais do psytrance global, combinando linhas melodicas e energia de festival.",
    labelBio: "HOMmega ajudou a consolidar o psytrance israelense no circuito internacional."
  },
  {
    style: "forest_psy",
    song: "The Forest Calls",
    artist: "Atriohm",
    label: "Parvati Records",
    bpm: "145-155",
    energy: "high",
    vocals: "instrumental",
    context: ["peak", "after"],
    vibe: "Textura organica, atmosfera escura e groove tribal tipico do forest.",
    spotifyUrl: "https://open.spotify.com/search/Atriohm%20The%20Forest%20Calls",
    youtubeUrl: "https://www.youtube.com/results?search_query=Atriohm+Forest+Psy",
    beatportUrl: "https://www.beatport.com/search?q=Atriohm",
    artistBio: "Atriohm e referencia em forest psy por criar paisagens sonoras imersivas e densas.",
    labelBio: "Parvati Records e cultuada por seu catalogo psicodelico experimental."
  },
  {
    style: "dark_psy",
    song: "Shadow Ritual",
    artist: "Kindzadza",
    label: "Alice-D Records",
    bpm: "155-175",
    energy: "extreme",
    vocals: "instrumental",
    context: ["peak"],
    vibe: "Dark psy acelerado, denso e com desenho sonoro sombrio.",
    spotifyUrl: "https://open.spotify.com/search/Kindzadza%20Dark%20Psy",
    youtubeUrl: "https://www.youtube.com/results?search_query=Kindzadza+Dark+Psy",
    beatportUrl: "https://www.beatport.com/search?q=Kindzadza",
    artistBio: "Kindzadza e conhecido por sets intensos e assinatura classica do dark psy.",
    labelBio: "Alice-D apoia artistas de vertentes extremas da psicodelia."
  },
  {
    style: "dark_psy",
    song: "Hallucinogenic Lyrical",
    artist: "Necropsycho",
    label: "Dark Valley Records",
    bpm: "155-175",
    bpmExact: 162,
    energy: "high",
    vocals: "instrumental",
    context: ["peak", "after", "foco"],
    vibe: "Dark psy com assinatura brasileira, linhas agressivas e clima obscuro.",
    spotifyUrl: "https://open.spotify.com/search/Necropsycho%20Hallucinogenic%20Lyrical",
    youtubeUrl: "https://www.youtube.com/results?search_query=Necropsycho+Hallucinogenic+Lyrical",
    beatportUrl: "https://www.beatport.com/search?q=Necropsycho%20Hallucinogenic%20Lyrical",
    artistBio: "Necropsycho e um projeto brasileiro ligado ao eixo dark psy com forte identidade experimental.",
    labelBio: "Dark Valley Records e uma label brasileira voltada para dark psychedelic."
  },
  {
    style: "hi_tech",
    song: "We Will Prevail",
    artist: "Paralocks",
    label: "Kamino Records",
    bpm: "175+",
    bpmExact: 186,
    energy: "extreme",
    vocals: "instrumental",
    context: ["peak"],
    vibe: "Hi-tech de alta velocidade com pressão contínua para pico de pista.",
    spotifyUrl: "https://open.spotify.com/search/Paralocks%20We%20Will%20Prevail",
    youtubeUrl: "https://www.youtube.com/results?search_query=Paralocks+We+Will+Prevail+hitech",
    beatportUrl: "https://www.beatport.com/search?q=Paralocks%20We%20Will%20Prevail",
    artistBio: "Paralocks é associado ao eixo psytrance/hi-tech em catálogos atuais, com foco em alta intensidade.",
    labelBio: "Kamino também publica vertentes psicodélicas de alta energia."
  },
  {
    style: "full_on",
    song: "I Wish",
    artist: "Avalon",
    label: "Nano Records",
    bpm: "145-155",
    energy: "high",
    vocals: "light_vocals",
    context: ["peak", "treino"],
    vibe: "Full-On explosivo com hooks claros e energia de main floor.",
    spotifyUrl: "https://open.spotify.com/search/Avalon%20I%20Wish",
    youtubeUrl: "https://www.youtube.com/results?search_query=Avalon+I+Wish",
    beatportUrl: "https://www.beatport.com/search?q=Avalon%20I%20Wish",
    artistBio: "Avalon ficou conhecido por um full-on moderno e extremamente funcional em pista.",
    labelBio: "Nano Records e casa de nomes grandes do psytrance contemporaneo."
  },
  {
    style: "full_on",
    song: "The Last Radio",
    artist: "Earthspace",
    label: "HOMmega",
    bpm: "145-155",
    bpmExact: 146,
    energy: "high",
    vocals: "instrumental",
    context: ["peak", "estrada", "treino"],
    vibe: "Full-on de pista com narrativa melódica e drive psicodelico.",
    spotifyUrl: "https://open.spotify.com/search/Earthspace%20The%20Last%20Radio",
    youtubeUrl: "https://www.youtube.com/results?search_query=Earthspace+The+Last+Radio",
    beatportUrl: "https://www.beatport.com/search?q=Earthspace%20The%20Last%20Radio",
    artistBio: "Earthspace e reconhecido no full-on por pressão de pista e musicalidade moderna.",
    labelBio: "HOMmega tem um catalogo historico de psytrance de festival."
  },
  {
    style: "full_on",
    song: "Enlightenment",
    artist: "Tristan",
    label: "Nano Records",
    bpm: "145-155",
    bpmExact: 145,
    energy: "high",
    vocals: "instrumental",
    context: ["peak", "estrada"],
    vibe: "Full-on classico com construção hipnotica e explosao de groove.",
    spotifyUrl: "https://open.spotify.com/search/Tristan%20Enlightenment",
    youtubeUrl: "https://www.youtube.com/results?search_query=Tristan+Enlightenment+psytrance",
    beatportUrl: "https://www.beatport.com/search?q=Tristan%20Enlightenment",
    artistBio: "Tristan e um dos pilares do full-on psicodelico contemporaneo.",
    labelBio: "Nano Records e referencia global para full-on moderno."
  },
  {
    style: "full_on",
    song: "Multiverse",
    artist: "Burn In Noise",
    label: "Nano Records",
    bpm: "145-155",
    bpmExact: 148,
    energy: "high",
    vocals: "instrumental",
    context: ["peak", "treino"],
    vibe: "Full-on brasileiro com linhas claras e energia para main floor.",
    spotifyUrl: "https://open.spotify.com/search/Burn%20In%20Noise%20Multiverse",
    youtubeUrl: "https://www.youtube.com/results?search_query=Burn+In+Noise+Multiverse",
    beatportUrl: "https://www.beatport.com/search?q=Burn%20In%20Noise%20Multiverse",
    artistBio: "Burn In Noise e destaque brasileiro no full-on com identidade de pista.",
    labelBio: "Nano Records abriga diversos projetos centrais do full-on."
  },
  {
    style: "full_on_night",
    song: "Multiverse",
    artist: "Burn In Noise",
    label: "Nano Records",
    bpm: "145-155",
    bpmExact: 148,
    energy: "high",
    vocals: "instrumental",
    context: ["peak", "after"],
    vibe: "Full-On Night mais denso e noturno, mantendo pressão constante na madrugada.",
    spotifyUrl: "https://open.spotify.com/search/Burn%20In%20Noise%20Multiverse",
    youtubeUrl: "https://www.youtube.com/results?search_query=Burn+In+Noise+Multiverse",
    beatportUrl: "https://www.beatport.com/search?q=Burn%20In%20Noise%20Multiverse",
    artistBio: "Burn In Noise e destaque brasileiro no full-on com identidade de pista.",
    labelBio: "Nano Records abriga diversos projetos centrais do full-on."
  },
  {
    style: "full_on_morning",
    song: "Enlightenment",
    artist: "Tristan",
    label: "Nano Records",
    bpm: "145-155",
    bpmExact: 145,
    energy: "high",
    vocals: "instrumental",
    context: ["warmup", "estrada", "peak"],
    vibe: "Full-On Morning com abordagem mais aberta e melódica para início de dia na pista.",
    spotifyUrl: "https://open.spotify.com/search/Tristan%20Enlightenment",
    youtubeUrl: "https://www.youtube.com/results?search_query=Tristan+Enlightenment+psytrance",
    beatportUrl: "https://www.beatport.com/search?q=Tristan%20Enlightenment",
    artistBio: "Tristan e um dos pilares do full-on psicodelico contemporaneo.",
    labelBio: "Nano Records e referencia global para full-on moderno."
  },
  {
    style: "full_on_morning",
    song: "I Wish",
    artist: "Avalon",
    label: "Nano Records",
    bpm: "145-155",
    energy: "high",
    vocals: "light_vocals",
    context: ["warmup", "estrada", "peak"],
    vibe: "Full-On Morning com hooks claros e energia positiva para sunrise set.",
    spotifyUrl: "https://open.spotify.com/search/Avalon%20I%20Wish",
    youtubeUrl: "https://www.youtube.com/results?search_query=Avalon+I+Wish",
    beatportUrl: "https://www.beatport.com/search?q=Avalon%20I%20Wish",
    artistBio: "Avalon ficou conhecido por um full-on moderno e extremamente funcional em pista.",
    labelBio: "Nano Records e casa de nomes grandes do psytrance contemporaneo."
  },
  {
    style: "progressive_psy",
    song: "Awake the Snake",
    artist: "Ace Ventura",
    label: "Iboga Records",
    bpm: "132-145",
    energy: "mid",
    vocals: "instrumental",
    context: ["warmup", "estrada"],
    vibe: "Progressive psy com narrativa longa e groove limpo.",
    spotifyUrl: "https://open.spotify.com/search/Ace%20Ventura%20Awake%20the%20Snake",
    youtubeUrl: "https://www.youtube.com/results?search_query=Ace+Ventura+Awake+the+Snake",
    beatportUrl: "https://www.beatport.com/search?q=Ace%20Ventura",
    artistBio: "Ace Ventura e pilar do progressive psy por equilibrio entre tecnica e musicalidade.",
    labelBio: "Iboga Records e referencia em progressive trance sofisticado."
  },
  {
    style: "hi_tech",
    song: "Neuro Engine",
    artist: "Cosmo",
    label: "Kamino Records",
    bpm: "175+",
    energy: "extreme",
    vocals: "instrumental",
    context: ["peak"],
    vibe: "Hi-tech hiperacelerado, glitches e pressao sonora continua.",
    spotifyUrl: "https://open.spotify.com/search/Cosmo%20Hi-Tech",
    youtubeUrl: "https://www.youtube.com/results?search_query=Cosmo+Hi+Tech+Psy",
    beatportUrl: "https://www.beatport.com/search?q=Hi-Tech%20Psy",
    artistBio: "Cosmo representa a escola hi-tech com alta complexidade ritmica.",
    labelBio: "Kamino impulsiona projetos de psy acelerado para nichos especializados."
  },
  {
    style: "dark_experimental",
    song: "Syntaxxxers",
    artist: "Audiosyntax",
    label: "Quintessence Records",
    bpm: "155-175",
    bpmExact: 158,
    energy: "high",
    vocals: "instrumental",
    context: ["peak", "after", "foco"],
    vibe: "Dark experimental com recortes psicoativos e arquitetura sonora não linear.",
    spotifyUrl: "https://open.spotify.com/search/Audiosyntax%20Syntaxxxers",
    youtubeUrl: "https://www.youtube.com/results?search_query=Audiosyntax+Syntaxxxers",
    beatportUrl: "https://www.beatport.com/search?q=Audiosyntax%20Syntaxxxers",
    artistBio: "Audiosyntax aparece com estética dark experimental em construções densas e imprevisíveis.",
    labelBio: "Quintessence Records publica material psicodélico avançado de linha mais experimental."
  },
  {
    style: "dark_experimental",
    song: "Axiom Mutation",
    artist: "Sectio Aurea",
    label: "Dark Prisma",
    bpm: "155-175",
    bpmExact: 162,
    energy: "high",
    vocals: "instrumental",
    context: ["peak", "after", "foco"],
    vibe: "Dark experimental com narrativa fragmentada e texturas de alta complexidade.",
    spotifyUrl: "https://open.spotify.com/search/Sectio%20Aurea%20dark%20experimental",
    youtubeUrl: "https://www.youtube.com/results?search_query=Sectio+Aurea+dark+experimental",
    beatportUrl: "https://www.beatport.com/search?q=Sectio%20Aurea%20dark%20experimental",
    artistBio: "Sectio Aurea e associado a um dark experimental detalhista e atmosférico.",
    labelBio: "Dark Prisma foca em curadoria de propostas obscuras e experimentais para pista."
  },
  {
    style: "hi_tech",
    song: "Phase Distortion",
    artist: "Audiophatik",
    label: "Hi-Tech Dynamics",
    bpm: "175+",
    bpmExact: 190,
    energy: "extreme",
    vocals: "instrumental",
    context: ["peak", "treino"],
    vibe: "Hi-tech de alta rotação com camadas metálicas e drive contínuo.",
    spotifyUrl: "https://open.spotify.com/search/Audiophatik%20hitech",
    youtubeUrl: "https://www.youtube.com/results?search_query=Audiophatik+hitech",
    beatportUrl: "https://www.beatport.com/search?q=Audiophatik%20hitech",
    artistBio: "Audiophatik aparece em sets hi-tech com linhas rápidas e estética pesada.",
    labelBio: "Catálogo voltado a hi-tech extremo e performance de pista."
  },
  {
    style: "dark_progressive",
    song: "Rain",
    artist: "Vermont",
    label: "Zenon Records",
    bpm: "132-145",
    energy: "high",
    vocals: "instrumental",
    context: ["after", "foco"],
    vibe: "Progressivo sombrio, seco e hipnotico para viagens profundas.",
    spotifyUrl: "https://open.spotify.com/search/Vermont%20Rain%20Zenon",
    youtubeUrl: "https://www.youtube.com/results?search_query=Vermont+Zenon+Rain",
    beatportUrl: "https://www.beatport.com/search?q=Vermont%20Zenon",
    artistBio: "Vermont e ligado ao eixo dark prog com construcoes lentas e profundas.",
    labelBio: "Zenon Records e uma das labels mais respeitadas do psy progressivo escuro."
  },
  {
    style: "goa_trance",
    song: "Mahadeva",
    artist: "Astrix",
    label: "TIP Records",
    bpm: "132-145",
    energy: "high",
    vocals: "light_vocals",
    context: ["warmup", "peak"],
    vibe: "Lead melodico classico com DNA goa e clima espiritual.",
    spotifyUrl: "https://open.spotify.com/search/Astrix%20Mahadeva",
    youtubeUrl: "https://www.youtube.com/results?search_query=Astrix+Mahadeva",
    beatportUrl: "https://www.beatport.com/search?q=Astrix%20Mahadeva",
    artistBio: "No espectro goa/prog, Astrix uniu melodias memoraveis com impacto moderno.",
    labelBio: "TIP Records foi importante no desenvolvimento da cultura goa/trance."
  },
  {
    style: "psy_comercial",
    song: "Hit N Run",
    artist: "Skazi",
    label: "Chemical Crew",
    bpm: "145-155",
    bpmExact: 146,
    energy: "high",
    vocals: "vocal",
    context: ["peak", "estrada", "treino"],
    vibe: "Psytrance comercial/chacota com pegada rock e lead direto de festival.",
    spotifyUrl: "https://open.spotify.com/search/Skazi%20Hit%20N%20Run",
    youtubeUrl: "https://www.youtube.com/results?search_query=Skazi+Hit+N+Run",
    beatportUrl: "https://www.beatport.com/search?q=Skazi%20Hit%20N%20Run",
    artistBio: "Skazi e um nome associado ao psytrance comercial de alto impacto.",
    labelBio: "Chemical Crew ficou conhecida por lançamentos de psy de grande alcance popular."
  },
  {
    style: "psy_comercial",
    song: "The Pill",
    artist: "Paranormal Attack",
    label: "Mainstage",
    bpm: "145-155",
    bpmExact: 145,
    energy: "high",
    vocals: "vocal",
    context: ["peak", "treino"],
    vibe: "Psytrance comercial com vocal memoravel e estrutura de impacto imediato.",
    spotifyUrl: "https://open.spotify.com/search/Paranormal%20Attack%20The%20Pill",
    youtubeUrl: "https://www.youtube.com/results?search_query=Paranormal+Attack+The+Pill",
    beatportUrl: "https://www.beatport.com/search?q=Paranormal%20Attack%20The%20Pill",
    artistBio: "Paranormal Attack ficou popular em faixas de psy mais comerciais e crossover.",
    labelBio: "Releases de viés comercial de psytrance tendem a circular em labels de alcance amplo."
  },
  {
    style: "psy_comercial",
    song: "Mambos from Outerspace",
    artist: "Sesto Sento",
    label: "Mainstage",
    bpm: "145-155",
    bpmExact: 145,
    energy: "high",
    vocals: "light_vocals",
    context: ["peak", "estrada"],
    vibe: "Full-on comercial com timbres limpos e dinâmica de main floor.",
    spotifyUrl: "https://open.spotify.com/search/Sesto%20Sento%20Mambos%20from%20Outerspace",
    youtubeUrl: "https://www.youtube.com/results?search_query=Sesto+Sento+Mambos+from+Outerspace",
    beatportUrl: "https://www.beatport.com/search?q=Sesto%20Sento%20Mambos%20from%20Outerspace",
    artistBio: "Sesto Sento ajudou a popularizar um psy/festival de linguagem mais comercial.",
    labelBio: "Esse eixo de releases circula forte em pistas de psytrance mainstream."
  },
  {
    style: "psy_comercial",
    song: "Sem Chao",
    artist: "Mandragora",
    label: "Discovalley",
    bpm: "145-155",
    bpmExact: 148,
    energy: "high",
    vocals: "vocal",
    context: ["peak", "estrada", "treino"],
    vibe: "Psytrance comercial com assinatura latina e forte apelo de publico.",
    spotifyUrl: "https://open.spotify.com/search/Mandragora%20Sem%20Chao",
    youtubeUrl: "https://www.youtube.com/results?search_query=Mandragora+Sem+Chao",
    beatportUrl: "https://www.beatport.com/search?q=Mandragora%20Sem%20Chao",
    artistBio: "Mandragora e um dos nomes mais populares do psytrance comercial contemporaneo.",
    labelBio: "Discovalley e associada a faixas de psy com alcance de publico amplo."
  },
  {
    style: "psy_comercial",
    song: "Conexoes de Mafia",
    artist: "Claudinho Brasil",
    label: "Commercial Psy",
    bpm: "145-155",
    bpmExact: 146,
    energy: "high",
    vocals: "vocal",
    context: ["peak", "estrada"],
    vibe: "Psy comercial/chacota com brasilidade e vocal de grande apelo.",
    spotifyUrl: "https://open.spotify.com/search/Claudinho%20Brasil%20psytrance",
    youtubeUrl: "https://www.youtube.com/results?search_query=Claudinho+Brasil+psytrance",
    beatportUrl: "https://www.beatport.com/search?q=Claudinho%20Brasil%20psytrance",
    artistBio: "Claudinho Brasil e citado na cena brasileira como referência de psy mais comercial.",
    labelBio: "O segmento comercial/chacota prioriza refrões e reconhecimento imediato."
  },
  {
    style: "techno",
    song: "Phobos",
    artist: "ANNA",
    label: "Drumcode",
    bpm: "132-145",
    energy: "high",
    vocals: "instrumental",
    context: ["peak", "treino"],
    vibe: "Techno de pista com kicks firmes e tensao crescente.",
    spotifyUrl: "https://open.spotify.com/search/ANNA%20Phobos",
    youtubeUrl: "https://www.youtube.com/results?search_query=ANNA+Phobos",
    beatportUrl: "https://www.beatport.com/search?q=ANNA%20Phobos",
    artistBio: "ANNA e DJ/produtora brasileira consolidada no techno mundial.",
    labelBio: "Drumcode e sinonimo de techno robusto para grandes pistas."
  },
  {
    style: "acid_techno",
    song: "Acid Phase",
    artist: "Emmanuel Top",
    label: "NovaMute",
    bpm: "132-145",
    energy: "high",
    vocals: "instrumental",
    context: ["peak", "after"],
    vibe: "Linha 303 acida e repeticao hipnotica classica.",
    spotifyUrl: "https://open.spotify.com/search/Emmanuel%20Top%20Acid%20Phase",
    youtubeUrl: "https://www.youtube.com/results?search_query=Emmanuel+Top+Acid+Phase",
    beatportUrl: "https://www.beatport.com/search?q=Acid%20Phase",
    artistBio: "Emmanuel Top ajudou a definir a sonoridade acid techno dos anos 90.",
    labelBio: "NovaMute marcou a historia da musica eletronica com releases influentes."
  },
  {
    style: "hard_techno",
    song: "Breathe",
    artist: "Alignment",
    label: "KNTXT",
    bpm: "145-155",
    energy: "extreme",
    vocals: "light_vocals",
    context: ["peak", "treino"],
    vibe: "Hard techno veloz e distorcido para energia maxima.",
    spotifyUrl: "https://open.spotify.com/search/Alignment%20Breathe",
    youtubeUrl: "https://www.youtube.com/results?search_query=Alignment+Breathe+KNTXT",
    beatportUrl: "https://www.beatport.com/search?q=Alignment%20Breathe",
    artistBio: "Alignment e destaque da nova escola hard techno europeia.",
    labelBio: "KNTXT ficou famosa por impulsionar techno rapido e intenso."
  },
  {
    style: "minimal_techno",
    song: "Domina",
    artist: "Luciano",
    label: "Cadenza",
    bpm: "124-132",
    energy: "mid",
    vocals: "instrumental",
    context: ["warmup", "foco"],
    vibe: "Minimal preciso, espaco sonoro e groove sutil.",
    spotifyUrl: "https://open.spotify.com/search/Luciano%20Domina",
    youtubeUrl: "https://www.youtube.com/results?search_query=Luciano+Domina+Cadenza",
    beatportUrl: "https://www.beatport.com/search?q=Luciano%20Domina",
    artistBio: "Luciano e nome essencial na evolucao do minimal latino-europeu.",
    labelBio: "Cadenza representa um minimal refinado e de longa duracao em set."
  },
  {
    style: "melodic_techno",
    song: "Consciousness",
    artist: "Anyma",
    label: "Afterlife",
    bpm: "124-132",
    energy: "mid",
    vocals: "light_vocals",
    context: ["warmup", "peak"],
    vibe: "Melodic techno emocional com synths cinematograficos.",
    spotifyUrl: "https://open.spotify.com/search/Anyma%20Consciousness",
    youtubeUrl: "https://www.youtube.com/results?search_query=Anyma+Consciousness",
    beatportUrl: "https://www.beatport.com/search?q=Anyma%20Consciousness",
    artistBio: "Anyma popularizou o lado audiovisual do melodic techno recente.",
    labelBio: "Afterlife e referencia em techno melodico e identidade imersiva."
  },
  {
    style: "house",
    song: "Your Love",
    artist: "Frankie Knuckles",
    label: "Trax Records",
    bpm: "124-132",
    energy: "mid",
    vocals: "vocal",
    context: ["warmup", "after"],
    vibe: "House classico soulful, ideal para abrir pista com elegancia.",
    spotifyUrl: "https://open.spotify.com/search/Frankie%20Knuckles%20Your%20Love",
    youtubeUrl: "https://www.youtube.com/results?search_query=Frankie+Knuckles+Your+Love",
    beatportUrl: "https://www.beatport.com/search?q=Your%20Love%20Frankie%20Knuckles",
    artistBio: "Frankie Knuckles e considerado um dos pais do house.",
    labelBio: "Trax Records foi fundamental na historia do house de Chicago."
  },
  {
    style: "deep_house",
    song: "The Whistle Song",
    artist: "Frankie Knuckles",
    label: "Virgin",
    bpm: "110-124",
    energy: "low",
    vocals: "light_vocals",
    context: ["after", "foco"],
    vibe: "Deep house quente e envolvente para sessions longas.",
    spotifyUrl: "https://open.spotify.com/search/Frankie%20Knuckles%20The%20Whistle%20Song",
    youtubeUrl: "https://www.youtube.com/results?search_query=The+Whistle+Song+Frankie+Knuckles",
    beatportUrl: "https://www.beatport.com/search?q=deep%20house%20classic",
    artistBio: "O legado de Knuckles tambem influenciou profundamente o deep house.",
    labelBio: "Virgin levou house para publicos maiores no periodo de expansao global."
  },
  {
    style: "tech_house",
    song: "Losing It",
    artist: "FISHER",
    label: "Catch & Release",
    bpm: "124-132",
    energy: "high",
    vocals: "light_vocals",
    context: ["peak", "treino"],
    vibe: "Tech house direto, baixo marcante e impacto imediato na pista.",
    spotifyUrl: "https://open.spotify.com/search/Fisher%20Losing%20It",
    youtubeUrl: "https://www.youtube.com/results?search_query=Fisher+Losing+It",
    beatportUrl: "https://www.beatport.com/search?q=Fisher%20Losing%20It",
    artistBio: "FISHER se tornou um nome popular do tech house de grandes festivais.",
    labelBio: "Catch & Release destacou releases de alto alcance no circuito clubber."
  },
  {
    style: "tech_house",
    song: "Different Side",
    artist: "Michael Bibi",
    label: "Solid Grooves",
    bpm: "124-132",
    bpmExact: 128,
    energy: "high",
    vocals: "light_vocals",
    context: ["peak", "warmup", "treino"],
    vibe: "Tech house com groove hipnotico e pressão de pista no estilo Solid Grooves.",
    spotifyUrl: "https://open.spotify.com/search/Michael%20Bibi%20Different%20Side",
    youtubeUrl: "https://www.youtube.com/results?search_query=Michael+Bibi+Different+Side",
    beatportUrl: "https://www.beatport.com/search?q=Michael%20Bibi%20Different%20Side",
    artistBio: "Michael Bibi e um dos principais nomes do tech house moderno.",
    labelBio: "Solid Grooves consolidou uma identidade forte no tech house global."
  },
  {
    style: "tech_house",
    song: "Turn Off The Lights",
    artist: "Chris Lake",
    label: "Black Book Records",
    bpm: "124-132",
    bpmExact: 126,
    energy: "high",
    vocals: "light_vocals",
    context: ["peak", "estrada"],
    vibe: "Tech house de impacto imediato com baixo forte e vocal de pista.",
    spotifyUrl: "https://open.spotify.com/search/Chris%20Lake%20Turn%20Off%20The%20Lights",
    youtubeUrl: "https://www.youtube.com/results?search_query=Chris+Lake+Turn+Off+The+Lights",
    beatportUrl: "https://www.beatport.com/search?q=Chris%20Lake%20Turn%20Off%20The%20Lights",
    artistBio: "Chris Lake e referencia em tracks de tech house voltadas para clubs e festivais.",
    labelBio: "Black Book Records e um selo central no tech house contemporaneo."
  },
  {
    style: "tech_house",
    song: "Fine Night",
    artist: "Cloonee",
    label: "Hellbent",
    bpm: "124-132",
    bpmExact: 128,
    energy: "high",
    vocals: "vocal",
    context: ["peak", "treino"],
    vibe: "Tech house de pressão constante com vocal marcante e groove seco.",
    spotifyUrl: "https://open.spotify.com/search/Cloonee%20Fine%20Night",
    youtubeUrl: "https://www.youtube.com/results?search_query=Cloonee+Fine+Night",
    beatportUrl: "https://www.beatport.com/search?q=Cloonee%20Fine%20Night",
    artistBio: "Cloonee se destaca no tech house por grooves diretos e alta efetividade em pista.",
    labelBio: "Hellbent publica releases focados em performance de pista."
  },
  {
    style: "tech_house",
    song: "The Groovy Cat",
    artist: "PAWSA",
    label: "Solid Grooves",
    bpm: "124-132",
    bpmExact: 127,
    energy: "high",
    vocals: "instrumental",
    context: ["peak", "warmup"],
    vibe: "Tech house minimal-groovy com assinatura de pista e baixos pulsantes.",
    spotifyUrl: "https://open.spotify.com/search/PAWSA%20The%20Groovy%20Cat",
    youtubeUrl: "https://www.youtube.com/results?search_query=PAWSA+The+Groovy+Cat",
    beatportUrl: "https://www.beatport.com/search?q=PAWSA%20The%20Groovy%20Cat",
    artistBio: "PAWSA e nome forte da escola tech house groove orientada por club.",
    labelBio: "Solid Grooves e base para parte da sonoridade tech house atual."
  },
  {
    style: "tech_house",
    song: "Mi Amor",
    artist: "Wade",
    label: "Muse",
    bpm: "124-132",
    bpmExact: 126,
    energy: "high",
    vocals: "vocal",
    context: ["peak", "estrada"],
    vibe: "Tech house latino com energia de festival e vocal chiclete.",
    spotifyUrl: "https://open.spotify.com/search/Wade%20Mi%20Amor",
    youtubeUrl: "https://www.youtube.com/results?search_query=Wade+Mi+Amor",
    beatportUrl: "https://www.beatport.com/search?q=Wade%20Mi%20Amor",
    artistBio: "Wade e conhecido por tracks de tech house com forte impacto em pista.",
    labelBio: "Muse e selo ligado a releases populares de house e tech house."
  },
  {
    style: "progressive_house",
    song: "Opus",
    artist: "Eric Prydz",
    label: "Pryda",
    bpm: "124-132",
    energy: "mid",
    vocals: "instrumental",
    context: ["warmup", "peak"],
    vibe: "Progressive house de construcao lenta e recompensa poderosa.",
    spotifyUrl: "https://open.spotify.com/search/Eric%20Prydz%20Opus",
    youtubeUrl: "https://www.youtube.com/results?search_query=Eric+Prydz+Opus",
    beatportUrl: "https://www.beatport.com/search?q=Eric%20Prydz%20Opus",
    artistBio: "Eric Prydz e referencia em progressao harmonica e design de set.",
    labelBio: "Pryda e selo autoral com foco em progressive de alta qualidade."
  },
  {
    style: "afro_house",
    song: "Your Voice",
    artist: "Black Coffee",
    label: "Soulistic",
    bpm: "110-124",
    energy: "mid",
    vocals: "light_vocals",
    context: ["warmup", "after"],
    vibe: "Afro house percussivo, elegante e groove profundo.",
    spotifyUrl: "https://open.spotify.com/search/Black%20Coffee%20Your%20Voice",
    youtubeUrl: "https://www.youtube.com/results?search_query=Black+Coffee+Your+Voice",
    beatportUrl: "https://www.beatport.com/search?q=Black%20Coffee%20Your%20Voice",
    artistBio: "Black Coffee levou o afro house para o mainstream internacional.",
    labelBio: "Soulistic impulsionou um catalogo refinado de house africano."
  },
  {
    style: "drum_and_bass",
    song: "Solar System",
    artist: "Sub Focus",
    label: "RAM Records",
    bpm: "155-175",
    energy: "high",
    vocals: "light_vocals",
    context: ["peak", "treino"],
    vibe: "DnB energetico com design moderno para set explosivo.",
    spotifyUrl: "https://open.spotify.com/search/Sub%20Focus%20Solar%20System",
    youtubeUrl: "https://www.youtube.com/results?search_query=Sub+Focus+Solar+System",
    beatportUrl: "https://www.beatport.com/search?q=Sub%20Focus%20Solar%20System",
    artistBio: "Sub Focus e um dos artistas mais consistentes da cena drum and bass.",
    labelBio: "RAM Records e pilar historico do dnb britanico."
  },
  {
    style: "liquid_dnb",
    song: "Time",
    artist: "Chase & Status",
    label: "EMI",
    bpm: "155-175",
    energy: "mid",
    vocals: "vocal",
    context: ["estrada", "after"],
    vibe: "Liquid dnb melodico com atmosfera emotiva e linhas fluidas.",
    spotifyUrl: "https://open.spotify.com/search/Chase%20and%20Status%20Time",
    youtubeUrl: "https://www.youtube.com/results?search_query=Chase+and+Status+Time",
    beatportUrl: "https://www.beatport.com/search?q=liquid%20dnb%20time",
    artistBio: "Chase & Status transitam entre liquid, dancefloor e bass music.",
    labelBio: "EMI ampliou o alcance comercial de projetos eletronicos britanicos."
  },
  {
    style: "neurofunk",
    song: "Alien Girl",
    artist: "Ed Rush & Optical",
    label: "Virus",
    bpm: "155-175",
    energy: "extreme",
    vocals: "instrumental",
    context: ["peak"],
    vibe: "Neurofunk pesado, linhas agressivas e precisao cirurgica.",
    spotifyUrl: "https://open.spotify.com/search/Ed%20Rush%20Optical%20Alien%20Girl",
    youtubeUrl: "https://www.youtube.com/results?search_query=Ed+Rush+Optical+Alien+Girl",
    beatportUrl: "https://www.beatport.com/search?q=Alien%20Girl%20neurofunk",
    artistBio: "Ed Rush & Optical moldaram o neurofunk com producao tecnica avancada.",
    labelBio: "Virus e label-chave no desenvolvimento do dnb futurista."
  },
  {
    style: "jungle",
    song: "Original Nuttah",
    artist: "UK Apache & Shy FX",
    label: "Soundboy",
    bpm: "155-175",
    energy: "high",
    vocals: "vocal",
    context: ["peak", "estrada"],
    vibe: "Jungle classico com breaks quebrados e pressao old school.",
    spotifyUrl: "https://open.spotify.com/search/Original%20Nuttah",
    youtubeUrl: "https://www.youtube.com/results?search_query=Original+Nuttah",
    beatportUrl: "https://www.beatport.com/search?q=Original%20Nuttah",
    artistBio: "Shy FX e pioneiro na ponte entre jungle e drum and bass moderno.",
    labelBio: "Soundboy representa o legado roots da cultura soundsystem."
  },
  {
    style: "uk_garage",
    song: "Flowers",
    artist: "Sweet Female Attitude",
    label: "Relentless",
    bpm: "132-145",
    energy: "mid",
    vocals: "vocal",
    context: ["warmup", "after"],
    vibe: "UK garage com swing quebrado e vocal marcante.",
    spotifyUrl: "https://open.spotify.com/search/Sweet%20Female%20Attitude%20Flowers",
    youtubeUrl: "https://www.youtube.com/results?search_query=Sweet+Female+Attitude+Flowers",
    beatportUrl: "https://www.beatport.com/search?q=uk%20garage%20flowers",
    artistBio: "Faixa iconica que ajudou a popularizar o UK garage fora do Reino Unido.",
    labelBio: "Relentless distribuiu varios hits eletronic-pop do periodo."
  },
  {
    style: "dubstep",
    song: "Scary Monsters and Nice Sprites",
    artist: "Skrillex",
    label: "OWSLA",
    bpm: "132-145",
    energy: "extreme",
    vocals: "light_vocals",
    context: ["peak", "treino"],
    vibe: "Dubstep agressivo com drops iconicos e muita intensidade.",
    spotifyUrl: "https://open.spotify.com/search/Skrillex%20Scary%20Monsters%20and%20Nice%20Sprites",
    youtubeUrl: "https://www.youtube.com/results?search_query=Skrillex+Scary+Monsters+and+Nice+Sprites",
    beatportUrl: "https://www.beatport.com/search?q=Skrillex%20Scary%20Monsters",
    artistBio: "Skrillex redefiniu a linguagem do bass music no mainstream.",
    labelBio: "OWSLA inovou ao promover musica eletronica de vanguarda."
  },
  {
    style: "downtempo",
    song: "Lebanese Blonde",
    artist: "Thievery Corporation",
    label: "ESL Music",
    bpm: "110-124",
    energy: "low",
    vocals: "light_vocals",
    context: ["after", "foco"],
    vibe: "Downtempo sofisticado para desacelerar sem perder atmosfera.",
    spotifyUrl: "https://open.spotify.com/search/Thievery%20Corporation%20Lebanese%20Blonde",
    youtubeUrl: "https://www.youtube.com/results?search_query=Thievery+Corporation+Lebanese+Blonde",
    beatportUrl: "https://www.beatport.com/search?q=downtempo%20Thievery",
    artistBio: "Thievery mistura eletronica, dub e world music com identidade unica.",
    labelBio: "ESL Music e selo ligado a projetos eletronicos refinados."
  },
  {
    style: "ambient",
    song: "An Ending (Ascent)",
    artist: "Brian Eno",
    label: "EG",
    bpm: "110-124",
    energy: "low",
    vocals: "instrumental",
    context: ["after", "foco"],
    vibe: "Ambient etereo para concentracao e descompressao mental.",
    spotifyUrl: "https://open.spotify.com/search/Brian%20Eno%20An%20Ending",
    youtubeUrl: "https://www.youtube.com/results?search_query=Brian+Eno+An+Ending+Ascent",
    beatportUrl: "https://www.beatport.com/search?q=ambient%20brian%20eno",
    artistBio: "Brian Eno e referencia maxima em composicao ambient.",
    labelBio: "EG publicou trabalhos influentes da era experimental eletronica."
  },
  {
    style: "ambient",
    song: "Invisible Landscape",
    artist: "Solar Fields",
    label: "Sidereal",
    bpm: "60-110",
    bpmExact: 90,
    energy: "low",
    vocals: "instrumental",
    context: ["after", "foco"],
    vibe: "Ambient profundo, textural e desacelerado para reset mental.",
    spotifyUrl: "https://open.spotify.com/search/Solar%20Fields%20Invisible%20Landscape",
    youtubeUrl: "https://www.youtube.com/results?search_query=Solar+Fields+ambient",
    beatportUrl: "https://www.beatport.com/search?q=Solar%20Fields%20ambient",
    artistBio: "Solar Fields produz ambient com camadas cinematograficas detalhadas.",
    labelBio: "Sidereal e associada a catalogos experimentais de escuta profunda."
  },
  {
    style: "slambient",
    song: "Ash Chamber",
    artist: "Cindervomit",
    label: "The Endless Knot",
    bpm: "155-175",
    bpmExact: 168,
    energy: "high",
    vocals: "instrumental",
    context: ["peak", "foco", "after"],
    vibe: "Slambient acelerado, sombrio e textural para transicoes intensas.",
    spotifyUrl: "https://open.spotify.com/search/Cindervomit%20Ash%20Chamber",
    youtubeUrl: "https://www.youtube.com/results?search_query=Cindervomit+Ash+Chamber",
    spotifyVerified: false,
    beatportUrl: "https://www.beatport.com/search?q=Cindervomit%20Ash%20Chamber",
    artistBio: "Cindervomit e um projeto de textura densa, explorando fronteiras entre ambient escuro e psicodelia extrema.",
    labelBio: "The Endless Knot e uma curadoria voltada para sonoridades psicodelicas experimentais e extremas."
  },
  {
    style: "slambient",
    song: "Knotted Horizons",
    artist: "Endless Knot Collective",
    label: "The Endless Knot",
    bpm: "155-175",
    bpmExact: 160,
    energy: "high",
    vocals: "instrumental",
    context: ["after", "foco", "estrada"],
    vibe: "Camadas atmosfericas longas com drive ritmico moderado.",
    spotifyUrl: "https://open.spotify.com/search/Endless%20Knot%20Collective%20Knotted%20Horizons",
    youtubeUrl: "https://www.youtube.com/results?search_query=Endless+Knot+Collective+Knotted+Horizons",
    spotifyVerified: false,
    beatportUrl: "https://www.beatport.com/search?q=Endless%20Knot%20Collective%20Knotted%20Horizons",
    artistBio: "Endless Knot Collective representa faixas curatoriais com foco em paisagens sonoras profundas.",
    labelBio: "The Endless Knot conecta artistas de propostas hibridas entre dark ambient, psy e experimentacao."
  },
  {
    style: "slambient",
    song: "Ritual Coil",
    artist: "Phyllorum",
    label: "The Endless Knot",
    bpm: "155-175",
    bpmExact: 172,
    energy: "high",
    vocals: "instrumental",
    context: ["peak", "foco", "estrada"],
    vibe: "Slambient de ataque ritmico com textura escura e progressao hipnotica.",
    spotifyUrl: "https://open.spotify.com/search/Phyllorum%20Ritual%20Coil",
    youtubeUrl: "https://www.youtube.com/results?search_query=Phyllorum+Ritual+Coil",
    spotifyVerified: false,
    beatportUrl: "https://www.beatport.com/search?q=Phyllorum%20Ritual%20Coil",
    artistBio: "Phyllorum explora slambient acelerado com recortes ritmicos e atmosfera densa.",
    labelBio: "The Endless Knot foca em narrativas psicodelicas extremas dentro do espectro slambient."
  },
  {
    style: "slambient",
    song: "Nocturnal Resin",
    artist: "Indaco Runa",
    label: "The Endless Knot",
    bpm: "155-175",
    bpmExact: 170,
    energy: "high",
    vocals: "instrumental",
    context: ["after", "foco", "estrada"],
    vibe: "Camadas viscosas e sombrias com pulsacao contínua de pista.",
    spotifyUrl: "https://open.spotify.com/search/Indaco%20Runa%20Nocturnal%20Resin",
    youtubeUrl: "https://www.youtube.com/results?search_query=Indaco+Runa+Nocturnal+Resin",
    spotifyVerified: false,
    beatportUrl: "https://www.beatport.com/search?q=Indaco%20Runa%20Nocturnal%20Resin",
    artistBio: "Indaco Runa trabalha com texturas ritualisticas e engenharia sonora de alta densidade.",
    labelBio: "The Endless Knot conecta catalogos de psy experimental e slambient extremo."
  },
  {
    style: "slambient",
    song: "Tar Vortex",
    artist: "Agodark",
    label: "The Endless Knot",
    bpm: "175+",
    bpmExact: 178,
    energy: "extreme",
    vocals: "instrumental",
    context: ["peak", "treino", "estrada"],
    vibe: "Slambient corrosivo, rapido e agressivo para momentos de maior intensidade.",
    spotifyUrl: "https://open.spotify.com/search/Agodark%20Tar%20Vortex",
    youtubeUrl: "https://www.youtube.com/results?search_query=Agodark+Tar+Vortex",
    spotifyVerified: false,
    beatportUrl: "https://www.beatport.com/search?q=Agodark%20Tar%20Vortex",
    artistBio: "Agodark imprime peso e velocidade no slambient de assinatura sombria.",
    labelBio: "The Endless Knot abriga projetos extremos focados em pista e experimentacao."
  },
  {
    style: "slambient",
    song: "Oxide Bloom",
    artist: "Audionimus",
    label: "The Endless Knot",
    bpm: "155-175",
    bpmExact: 169,
    energy: "high",
    vocals: "instrumental",
    context: ["peak", "foco", "after"],
    vibe: "Ataques granulados e arquitetura sonora industrial em drive acelerado.",
    spotifyUrl: "https://open.spotify.com/search/Audionimus%20Oxide%20Bloom",
    youtubeUrl: "https://www.youtube.com/results?search_query=Audionimus+Oxide+Bloom",
    spotifyVerified: false,
    beatportUrl: "https://www.beatport.com/search?q=Audionimus%20Oxide%20Bloom",
    artistBio: "Audionimus combina slambient escuro com cortes mecanicos e movimentacao intensa.",
    labelBio: "The Endless Knot mantem curadoria de faixas hibridas entre dark ambient e psy acelerado."
  },
  {
    style: "slambient",
    song: "Obsidian Blink",
    artist: "Akuma",
    label: "The Endless Knot",
    bpm: "175+",
    bpmExact: 182,
    energy: "extreme",
    vocals: "instrumental",
    context: ["peak", "treino", "estrada"],
    vibe: "Slambient rapido com cortes secos e tensão contínua.",
    spotifyUrl: "https://open.spotify.com/search/Akuma%20Obsidian%20Blink",
    youtubeUrl: "https://www.youtube.com/results?search_query=Akuma+Obsidian+Blink",
    spotifyVerified: false,
    beatportUrl: "https://www.beatport.com/search?q=Akuma%20Obsidian%20Blink",
    artistBio: "Akuma traz abordagem extrema no slambient com narrativa ritmica agressiva.",
    labelBio: "The Endless Knot impulsiona artistas de linguagem avançada no eixo psy experimental."
  },
  {
    style: "slambient",
    song: "Anvil Dream",
    artist: "Akephalos",
    label: "The Endless Knot",
    bpm: "155-175",
    bpmExact: 167,
    energy: "high",
    vocals: "instrumental",
    context: ["after", "foco", "peak"],
    vibe: "Texturas densas com arranjo hipnotico e pulsacao de alta velocidade.",
    spotifyUrl: "https://open.spotify.com/search/Akephalos%20Anvil%20Dream",
    youtubeUrl: "https://www.youtube.com/results?search_query=Akephalos+Anvil+Dream",
    spotifyVerified: false,
    beatportUrl: "https://www.beatport.com/search?q=Akephalos%20Anvil%20Dream",
    artistBio: "Akephalos trabalha nuances texturais e assinatura sombria no slambient acelerado.",
    labelBio: "The Endless Knot estrutura catalogos focados em imersao, velocidade e experimentacao."
  },
  {
    style: "slambient",
    song: "Spiraling Dimensions",
    artist: "Cindervomit",
    label: "The Endless Knot",
    bpm: "155-175",
    energy: "high",
    vocals: "instrumental",
    context: ["peak", "foco", "after"],
    vibe: "Slambient imersivo com espirais texturais e narrativa psicodélica densa.",
    spotifyUrl: "https://open.spotify.com/search/Cindervomit%20Spiraling%20Dimensions",
    youtubeUrl: "https://www.youtube.com/results?search_query=Cindervomit+Spiraling+Dimensions",
    spotifyVerified: false,
    beatportUrl: "https://www.beatport.com/search?q=Cindervomit%20Spiraling%20Dimensions",
    artistBio: "Cindervomit assina paisagens slambient de alta pressão e desenho sonoro ritualístico.",
    labelBio: "The Endless Knot conecta projetos slambient com foco em densidade e progressão hipnótica."
  },
  {
    style: "slambient",
    song: "Dimensions of Consciousness",
    artist: "Cindervomit",
    label: "The Endless Knot",
    bpm: "155-175",
    energy: "high",
    vocals: "instrumental",
    context: ["after", "foco", "estrada"],
    vibe: "Camadas abstratas e tensão contínua para momentos de viagem mental profunda.",
    spotifyUrl: "https://open.spotify.com/search/Cindervomit%20Dimensions%20of%20Consciousness",
    youtubeUrl: "https://www.youtube.com/results?search_query=Cindervomit+Dimensions+of+Consciousness",
    spotifyVerified: false,
    beatportUrl: "https://www.beatport.com/search?q=Cindervomit%20Dimensions%20of%20Consciousness",
    artistBio: "Cindervomit trabalha slambient acelerado com foco em textura e expansão atmosférica.",
    labelBio: "The Endless Knot prioriza lançamentos de linguagem extrema e proposta cinematográfica."
  },
  {
    style: "slambient",
    song: "The Tale of Titans",
    artist: "Cindervomit",
    label: "The Endless Knot",
    bpm: "175+",
    energy: "extreme",
    vocals: "instrumental",
    context: ["peak", "treino", "estrada"],
    vibe: "Pico de pista com drive agressivo e assinatura obscura.",
    spotifyUrl: "https://open.spotify.com/search/Cindervomit%20The%20Tale%20of%20Titans",
    youtubeUrl: "https://www.youtube.com/results?search_query=Cindervomit+The+Tale+of+Titans",
    spotifyVerified: false,
    beatportUrl: "https://www.beatport.com/search?q=Cindervomit%20The%20Tale%20of%20Titans",
    artistBio: "Cindervomit combina energia extrema e ambiência escura em cortes de pista intensos.",
    labelBio: "The Endless Knot sustenta catálogos focados em slambient e psicodelia experimental."
  },
  {
    style: "slambient",
    song: "Inferis",
    artist: "Cindervomit",
    label: "The Endless Knot",
    bpm: "155-175",
    energy: "high",
    vocals: "instrumental",
    context: ["peak", "foco", "after"],
    vibe: "Atmosfera densa e recortes rítmicos para transições de alta intensidade.",
    spotifyUrl: "https://open.spotify.com/search/Cindervomit%20Inferis",
    youtubeUrl: "https://www.youtube.com/results?search_query=Cindervomit+Inferis",
    spotifyVerified: false,
    beatportUrl: "https://www.beatport.com/search?q=Cindervomit%20Inferis",
    artistBio: "Cindervomit transita entre slambient e vertentes extremas com assinatura sombria.",
    labelBio: "The Endless Knot impulsiona collabs e lançamentos experimentais de alta rotação."
  },
  {
    style: "slambient",
    song: "Schite on Poison",
    artist: "Phyllorum",
    label: "The Endless Knot",
    bpm: "155-175",
    energy: "high",
    vocals: "instrumental",
    context: ["peak", "foco", "after"],
    vibe: "Textura corrosiva e narrativa ritual para pista fechada.",
    spotifyUrl: "https://open.spotify.com/search/Phyllorum%20Schite%20on%20Poison",
    youtubeUrl: "https://www.youtube.com/results?search_query=Phyllorum+Schite+on+Poison",
    spotifyVerified: false,
    beatportUrl: "https://www.beatport.com/search?q=Phyllorum%20Schite%20on%20Poison",
    artistBio: "Phyllorum constrói faixas slambient com cortes secos e ambiência de alta tensão.",
    labelBio: "The Endless Knot reúne artistas com linguagem híbrida entre dark e experimental."
  },
  {
    style: "slambient",
    song: "Fighting Floor",
    artist: "Phyllorum",
    label: "The Endless Knot",
    bpm: "175+",
    energy: "extreme",
    vocals: "instrumental",
    context: ["peak", "treino", "estrada"],
    vibe: "Ataque rítmico rápido para momentos de pressão máxima.",
    spotifyUrl: "https://open.spotify.com/search/Phyllorum%20Fighting%20Floor",
    youtubeUrl: "https://www.youtube.com/results?search_query=Phyllorum+Fighting+Floor",
    spotifyVerified: false,
    beatportUrl: "https://www.beatport.com/search?q=Phyllorum%20Fighting%20Floor",
    artistBio: "Phyllorum é reconhecido por estética slambient agressiva e progressões hipnóticas.",
    labelBio: "The Endless Knot reforça a curadoria de faixas para alto impacto de pista."
  },
  {
    style: "slambient",
    song: "Suffer or Fear",
    artist: "Phyllorum",
    label: "The Endless Knot",
    bpm: "155-175",
    energy: "high",
    vocals: "instrumental",
    context: ["after", "foco", "estrada"],
    vibe: "Slambient narrativo com ambiência escura e movimentação intensa.",
    spotifyUrl: "https://open.spotify.com/search/Phyllorum%20Suffer%20or%20Fear",
    youtubeUrl: "https://www.youtube.com/results?search_query=Phyllorum+Suffer+or+Fear",
    spotifyVerified: false,
    beatportUrl: "https://www.beatport.com/search?q=Phyllorum%20Suffer%20or%20Fear",
    artistBio: "Phyllorum explora paisagens sonoras densas com assinatura ritualística.",
    labelBio: "The Endless Knot integra narrativas experimentais e pulsação psicodélica extrema."
  },
  {
    style: "slambient",
    song: "The Elvia Orc Fight",
    artist: "Phyllorum",
    label: "The Endless Knot",
    bpm: "175+",
    energy: "extreme",
    vocals: "instrumental",
    context: ["peak", "treino", "foco"],
    vibe: "Faixa de combate sonoro com pulsação rápida e textura obscura.",
    spotifyUrl: "https://open.spotify.com/search/Phyllorum%20The%20Elvia%20Orc%20Fight",
    youtubeUrl: "https://www.youtube.com/results?search_query=Phyllorum+The+Elvia+Orc+Fight",
    spotifyVerified: false,
    beatportUrl: "https://www.beatport.com/search?q=Phyllorum%20The%20Elvia%20Orc%20Fight",
    artistBio: "Phyllorum trabalha narrativas conceituais em slambient com foco em intensidade.",
    labelBio: "The Endless Knot mantém catálogo de psicodelia extrema com identidade autoral."
  },
  {
    style: "idm",
    song: "Windowlicker",
    artist: "Aphex Twin",
    label: "Warp",
    bpm: "132-145",
    energy: "mid",
    vocals: "instrumental",
    context: ["foco", "after"],
    vibe: "IDM com ritmo quebrado e texturas inusitadas.",
    spotifyUrl: "https://open.spotify.com/search/Aphex%20Twin%20Windowlicker",
    youtubeUrl: "https://www.youtube.com/results?search_query=Aphex+Twin+Windowlicker",
    beatportUrl: "https://www.beatport.com/search?q=Aphex%20Twin%20Windowlicker",
    artistBio: "Aphex Twin e um dos produtores mais influentes da eletronica experimental.",
    labelBio: "Warp e pilar historico para artistas de vanguarda sonora."
  },
  {
    style: "hardstyle",
    song: "Imaginary",
    artist: "Brennan Heart",
    label: "I AM HARDSTYLE",
    bpm: "145-155",
    energy: "extreme",
    vocals: "vocal",
    context: ["peak", "treino"],
    vibe: "Hardstyle euforico com kicks intensos e melodia grande.",
    spotifyUrl: "https://open.spotify.com/search/Brennan%20Heart%20Imaginary",
    youtubeUrl: "https://www.youtube.com/results?search_query=Brennan+Heart+Imaginary",
    beatportUrl: "https://www.beatport.com/search?q=Brennan%20Heart%20Imaginary",
    artistBio: "Brennan Heart e um nome de referencia no hardstyle melodico.",
    labelBio: "I AM HARDSTYLE fortaleceu a cena hard dance internacional."
  }
];

const discoveryCatalog = [
  { name: "Ajja", style: "forest_psy", bio: "Forest psy detalhista e psicodelico.", spotifyUrl: "https://open.spotify.com/search/Ajja", youtubeUrl: "https://www.youtube.com/results?search_query=Ajja" },
  { name: "Southwild", style: "dark_psy", bio: "Dark psy com atmosferas mais obscuras.", spotifyUrl: "https://open.spotify.com/search/Southwild", youtubeUrl: "https://www.youtube.com/results?search_query=Southwild+dark+psy" },
  { name: "Necropsycho", style: "dark_psy", bio: "Projeto brasileiro de dark psy com identidade intensa e sombria.", spotifyUrl: "https://open.spotify.com/search/Necropsycho+dark+psy", youtubeUrl: "https://www.youtube.com/results?search_query=Necropsycho+dark+psy" },
  { name: "Necropsyco", style: "dark_psy", bio: "Variacao de grafia usada em algumas buscas para Necropsycho.", spotifyUrl: "https://open.spotify.com/search/Necropsyco+dark+psy", youtubeUrl: "https://www.youtube.com/results?search_query=Necropsyco+dark+psy" },
  { name: "Dark Notes", style: "dark_psy", bio: "Dark psy brasileiro com proposta densa e noturna.", spotifyUrl: "https://open.spotify.com/search/Dark+Notes+dark+psy", youtubeUrl: "https://www.youtube.com/results?search_query=Dark+Notes+dark+psy" },
  { name: "Kernel Panic", style: "dark_psy", bio: "Projeto dark psy citado em catálogos dedicados à vertente obscura.", spotifyUrl: "https://open.spotify.com/search/Kernel+Panic+dark+psy", youtubeUrl: "https://www.youtube.com/results?search_query=Kernel+Panic+dark+psy" },
  { name: "Maramba", style: "hi_tech", bio: "Hi-tech de alta rotação com assinatura brasileira.", spotifyUrl: "https://open.spotify.com/search/Maramba%20hitech", youtubeUrl: "https://www.youtube.com/results?search_query=Maramba+hitech" },
  { name: "Sonic Species", style: "full_on", bio: "Full-on moderno com design limpo.", spotifyUrl: "https://open.spotify.com/search/Sonic%20Species", youtubeUrl: "https://www.youtube.com/results?search_query=Sonic+Species" },
  { name: "Earthspace", style: "full_on", bio: "Full-on de alto impacto com foco de pista.", spotifyUrl: "https://open.spotify.com/search/Earthspace+full+on", youtubeUrl: "https://www.youtube.com/results?search_query=Earthspace+full+on" },
  { name: "Tristan", style: "full_on", bio: "Um dos nomes mais respeitados do full-on psicodelico.", spotifyUrl: "https://open.spotify.com/search/Tristan+psytrance", youtubeUrl: "https://www.youtube.com/results?search_query=Tristan+full+on+psytrance" },
  { name: "Burn In Noise", style: "full_on_night", bio: "Full-On Night com energia mais densa para horários de madrugada.", spotifyUrl: "https://open.spotify.com/search/Burn+In+Noise+full+on+night", youtubeUrl: "https://www.youtube.com/results?search_query=Burn+In+Noise+full+on+night" },
  { name: "Avalon", style: "full_on_morning", bio: "Full-On Morning com drive melódico e vibe de sunrise.", spotifyUrl: "https://open.spotify.com/search/Avalon+full+on+morning", youtubeUrl: "https://www.youtube.com/results?search_query=Avalon+full+on+morning" },
  { name: "Tristan", style: "full_on_morning", bio: "Linhas mais abertas e psicodelia clara para manhã de festival.", spotifyUrl: "https://open.spotify.com/search/Tristan+full+on+morning", youtubeUrl: "https://www.youtube.com/results?search_query=Tristan+full+on+morning" },
  { name: "Burn In Noise", style: "full_on", bio: "Full-on brasileiro moderno com assinatura tecnica.", spotifyUrl: "https://open.spotify.com/search/Burn+In+Noise", youtubeUrl: "https://www.youtube.com/results?search_query=Burn+In+Noise+full+on" },
  { name: "Dickster", style: "full_on", bio: "Groove classico do full-on com drive psicodelico.", spotifyUrl: "https://open.spotify.com/search/Dickster+full+on", youtubeUrl: "https://www.youtube.com/results?search_query=Dickster+full+on+psytrance" },
  { name: "Volcano", style: "full_on", bio: "Full-on de festival com energia consistente.", spotifyUrl: "https://open.spotify.com/search/Volcano+psytrance", youtubeUrl: "https://www.youtube.com/results?search_query=Volcano+full+on+psytrance" },
  { name: "Captain Hook", style: "progressive_psy", bio: "Progressivo melodico com assinatura forte.", spotifyUrl: "https://open.spotify.com/search/Captain%20Hook", youtubeUrl: "https://www.youtube.com/results?search_query=Captain+Hook" },
  { name: "Audiosyntax", style: "dark_experimental", bio: "Dark experimental com foco em texturas psicoativas e arranjo não linear.", spotifyUrl: "https://open.spotify.com/search/Audiosyntax+dark+experimental", youtubeUrl: "https://www.youtube.com/results?search_query=Audiosyntax+dark+experimental+psytrance" },
  { name: "Audio Syntax", style: "dark_experimental", bio: "Alias usado em algumas plataformas para o projeto Audiosyntax dentro do dark experimental.", spotifyUrl: "https://open.spotify.com/search/Audio%20Syntax%20dark%20experimental", youtubeUrl: "https://www.youtube.com/results?search_query=Audio+Syntax+dark+experimental+psytrance" },
  { name: "Sectio Aurea", style: "dark_experimental", bio: "Assinatura obscura e experimental com construções quebradas.", spotifyUrl: "https://open.spotify.com/search/Sectio%20Aurea", youtubeUrl: "https://www.youtube.com/results?search_query=Sectio+Aurea+dark+psy" },
  { name: "Necropsycho", style: "dark_experimental", bio: "Explora dark experimental com design sonoro agressivo e abstrato.", spotifyUrl: "https://open.spotify.com/search/Necropsycho", youtubeUrl: "https://www.youtube.com/results?search_query=Necropsycho+dark+experimental" },
  { name: "IndacoRuna", style: "dark_experimental", bio: "Vertente experimental com atmosfera ritualística e transições densas.", spotifyUrl: "https://open.spotify.com/search/IndacoRuna", youtubeUrl: "https://www.youtube.com/results?search_query=IndacoRuna+dark+psy" },
  { name: "Ogoun", style: "dark_experimental", bio: "Dark experimental com direção hipnótica e linguagem não convencional.", spotifyUrl: "https://open.spotify.com/search/Ogoun+psy", youtubeUrl: "https://www.youtube.com/results?search_query=Ogoun+dark+experimental+psy" },
  { name: "Nyctophungi", style: "dark_experimental", bio: "Camadas orgânicas e mutações rítmicas típicas do dark experimental.", spotifyUrl: "https://open.spotify.com/search/Nyctophungi", youtubeUrl: "https://www.youtube.com/results?search_query=Nyctophungi+dark+experimental" },
  { name: "Hans Dunkelkammer", style: "dark_experimental", bio: "Groove sombrio e narrativa experimental de longa progressão.", spotifyUrl: "https://open.spotify.com/search/Hans%20Dunkelkammer", youtubeUrl: "https://www.youtube.com/results?search_query=Hans+Dunkelkammer+dark+psy" },
  { name: "Menterama", style: "dark_experimental", bio: "Subcamadas experimentais com foco em textura e espaço sonoro.", spotifyUrl: "https://open.spotify.com/search/Menterama", youtubeUrl: "https://www.youtube.com/results?search_query=Menterama+experimental+psy" },
  { name: "Eliah", style: "dark_experimental", bio: "Dark experimental técnico com desenho sonoro detalhado.", spotifyUrl: "https://open.spotify.com/search/Eliah+dark+psy", youtubeUrl: "https://www.youtube.com/results?search_query=Eliah+dark+experimental" },
  { name: "Saturnin", style: "dark_experimental", bio: "Paisagens obscuras e abordagem experimental voltada para pista.", spotifyUrl: "https://open.spotify.com/search/Saturnin+psy", youtubeUrl: "https://www.youtube.com/results?search_query=Saturnin+dark+psy" },
  { name: "Xcursion", style: "dark_experimental", bio: "Dark experimental com acento cerebral e estrutura mutante.", spotifyUrl: "https://open.spotify.com/search/Xcursion+psy", youtubeUrl: "https://www.youtube.com/results?search_query=Xcursion+dark+experimental" },
  { name: "Fagin's Reject", style: "hi_tech", bio: "Hi-tech de alta densidade ritmica.", spotifyUrl: "https://open.spotify.com/search/Fagins%20Reject", youtubeUrl: "https://www.youtube.com/results?search_query=Fagins+Reject" },
  { name: "Audiophatik", style: "hi_tech", bio: "Hi-tech de alta rotação com design sonoro intenso.", spotifyUrl: "https://open.spotify.com/search/Audiophatik+hitech", youtubeUrl: "https://www.youtube.com/results?search_query=Audiophatik+hitech+psy" },
  { name: "Technical Hitch", style: "hi_tech", bio: "Nome forte do hi-tech psicodélico de festival.", spotifyUrl: "https://open.spotify.com/search/Technical+Hitch", youtubeUrl: "https://www.youtube.com/results?search_query=Technical+Hitch+hitech" },
  { name: "Crazy Astronaut", style: "hi_tech", bio: "Hi-tech com abordagem caótica e extrema.", spotifyUrl: "https://open.spotify.com/search/Crazy+Astronaut+hitech", youtubeUrl: "https://www.youtube.com/results?search_query=Crazy+Astronaut+hitech+psy" },
  { name: "D-Nox", style: "dark_progressive", bio: "Grooves progressivos mais escuros.", spotifyUrl: "https://open.spotify.com/search/D-Nox", youtubeUrl: "https://www.youtube.com/results?search_query=D-Nox" },
  { name: "Vermont", style: "dark_progressive", bio: "Prog dark hipnótico com assinatura zenonesque e narrativa profunda.", spotifyUrl: "https://open.spotify.com/search/Vermont+dark+progressive", youtubeUrl: "https://www.youtube.com/results?search_query=Vermont+dark+progressive+zenonesque" },
  { name: "Sensient", style: "dark_progressive", bio: "Referência no eixo zenonesque com design sonoro detalhado.", spotifyUrl: "https://open.spotify.com/search/Sensient+dark+progressive", youtubeUrl: "https://www.youtube.com/results?search_query=Sensient+dark+progressive+zenonesque" },
  { name: "Hypogeo", style: "dark_progressive", bio: "Dark progressive de atmosfera ritualística e progressão contínua.", spotifyUrl: "https://open.spotify.com/search/Hypogeo+dark+progressive", youtubeUrl: "https://www.youtube.com/results?search_query=Hypogeo+dark+progressive" },
  { name: "Grouch", style: "dark_progressive", bio: "Groove psicodélico profundo no recorte prog dark.", spotifyUrl: "https://open.spotify.com/search/Grouch+dark+progressive", youtubeUrl: "https://www.youtube.com/results?search_query=Grouch+dark+progressive+zenonesque" },
  { name: "Merkaba", style: "dark_progressive", bio: "Projeto conhecido pela interseção entre psychedelic e dark progressive.", spotifyUrl: "https://open.spotify.com/search/Merkaba+dark+progressive", youtubeUrl: "https://www.youtube.com/results?search_query=Merkaba+dark+progressive" },
  { name: "Evil Oil Man", style: "dark_progressive", bio: "Artista com lançamentos recentes e estética psy-tech de perfil sombrio.", spotifyUrl: "https://open.spotify.com/search/Evil+Oil+Man+dark+progressive", youtubeUrl: "https://www.youtube.com/results?search_query=Evil+Oil+Man+zenon+dark+progressive" },
  { name: "Dividuum", style: "dark_progressive", bio: "Projeto recente no eixo prog dark com timbres tensos e foco em pista.", spotifyUrl: "https://open.spotify.com/search/Dividuum+dark+progressive", youtubeUrl: "https://www.youtube.com/results?search_query=Dividuum+dark+progressive+zenon" },
  { name: "AIRI", style: "dark_progressive", bio: "Nome novo com material recente na linha PROG DARK / Zenonesque.", spotifyUrl: "https://open.spotify.com/search/AIRI+dark+progressive", youtubeUrl: "https://www.youtube.com/results?search_query=AIRI+dark+progressive+zenon" },
  { name: "Molecc", style: "dark_progressive", bio: "Projeto de dark progressive com pegada groove seca e psicodélica.", spotifyUrl: "https://open.spotify.com/search/Molecc+dark+progressive", youtubeUrl: "https://www.youtube.com/results?search_query=Molecc+dark+progressive+zenonesque" },
  { name: "Elberg", style: "dark_progressive", bio: "Dark prog de recorte orgânico, associado ao eixo Zenon.", spotifyUrl: "https://open.spotify.com/search/Elberg+dark+progressive", youtubeUrl: "https://www.youtube.com/results?search_query=Elberg+dark+progressive+zenon" },
  { name: "Doonz", style: "dark_progressive", bio: "Projeto com direcionamento dark progressive e lançamentos recentes.", spotifyUrl: "https://open.spotify.com/search/Doonz+dark+progressive", youtubeUrl: "https://www.youtube.com/results?search_query=Doonz+dark+progressive+zenon" },
  { name: "Sumiruna", style: "dark_progressive", bio: "Projeto ligado ao eixo zenonesque com progressões longas e design sonoro cerebral.", spotifyUrl: "https://open.spotify.com/search/Sumiruna+dark+progressive", youtubeUrl: "https://www.youtube.com/results?search_query=Sumiruna+Zenon+Records" },
  { name: "Kromagon", style: "dark_progressive", bio: "Dark progressive com foco em groove hipnótico e texturas psicodélicas profundas.", spotifyUrl: "https://open.spotify.com/search/Kromagon+dark+progressive", youtubeUrl: "https://www.youtube.com/results?search_query=Kromagon+Zenon+Records" },
  { name: "Tetrameth", style: "dark_progressive", bio: "Referência no lado mais profundo do zenonesque, com viagens longas e atmosfera noturna.", spotifyUrl: "https://open.spotify.com/search/Tetrameth+dark+progressive", youtubeUrl: "https://www.youtube.com/results?search_query=Tetrameth+Zenon+Records" },
  { name: "Kliment", style: "dark_progressive", bio: "Projeto de progressive psy escuro e detalhista, recorrente em curadorias zenonesque.", spotifyUrl: "https://open.spotify.com/search/Kliment+dark+progressive", youtubeUrl: "https://www.youtube.com/results?search_query=Kliment+Zenon+Records" },
  { name: "Hybrid", style: "dark_progressive", bio: "Assinatura dark progressive com construção de tensão lenta e narrativa de pista.", spotifyUrl: "https://open.spotify.com/search/Hybrid+dark+progressive+zenonesque", youtubeUrl: "https://www.youtube.com/results?search_query=Hybrid+Zenon+Records+dark+progressive" },
  { name: "Sourone", style: "dark_progressive", bio: "Groove sombrio e progressivo com orientação de pista no recorte prog dark.", spotifyUrl: "https://open.spotify.com/search/Sourone+dark+progressive", youtubeUrl: "https://www.youtube.com/results?search_query=Sourone+Zenon+Records" },
  { name: "Gumnut", style: "dark_progressive", bio: "Camadas orgânicas e condução hipnótica dentro da linguagem dark progressive/zenonesque.", spotifyUrl: "https://open.spotify.com/search/Gumnut+dark+progressive", youtubeUrl: "https://www.youtube.com/results?search_query=Gumnut+Zenon+Records" },
  { name: "Ryanosaurus", style: "dark_progressive", bio: "Projeto australiano associado ao ecossistema zenonesque, com psy progressivo de recorte obscuro.", spotifyUrl: "https://open.spotify.com/search/Ryanosaurus+dark+progressive", youtubeUrl: "https://www.youtube.com/results?search_query=Ryanosaurus+Zenon+Records" },
  { name: "Shadow Shaman", style: "dark_progressive", bio: "Nome recorrente em seleções zenonesque com estética escura e narrativa psicodélica lenta.", spotifyUrl: "https://open.spotify.com/search/Shadow+Shaman+dark+progressive", youtubeUrl: "https://www.youtube.com/results?search_query=Shadow+Shaman+Zenon+Records" },
  { name: "Via Axis", style: "goa_trance", bio: "Projeto associado ao Goa Trance com linhas melódicas clássicas e progressão psicodélica.", spotifyUrl: "https://open.spotify.com/search/Via+Axis+goa+trance", youtubeUrl: "https://www.youtube.com/results?search_query=Via+Axis+goa+trance" },
  { name: "Maceo Plex", style: "techno", bio: "Techno e house com forte identidade autoral.", spotifyUrl: "https://open.spotify.com/search/Maceo%20Plex", youtubeUrl: "https://www.youtube.com/results?search_query=Maceo+Plex" },
  { name: "999999999", style: "acid_techno", bio: "Acid techno cru, rapido e intenso.", spotifyUrl: "https://open.spotify.com/search/999999999", youtubeUrl: "https://www.youtube.com/results?search_query=999999999+acid+techno" },
  { name: "DYEN", style: "hard_techno", bio: "Hard techno sombrio para peak time.", spotifyUrl: "https://open.spotify.com/search/DYEN", youtubeUrl: "https://www.youtube.com/results?search_query=DYEN" },
  { name: "Rene Wise", style: "minimal_techno", bio: "Minimal/loop techno preciso e hipnotico.", spotifyUrl: "https://open.spotify.com/search/Rene%20Wise", youtubeUrl: "https://www.youtube.com/results?search_query=Rene+Wise" },
  { name: "Mind Against", style: "melodic_techno", bio: "Melodic techno emotivo e elegante.", spotifyUrl: "https://open.spotify.com/search/Mind%20Against", youtubeUrl: "https://www.youtube.com/results?search_query=Mind+Against" },
  { name: "Chris Stussy", style: "house", bio: "House/tech house com groove moderno.", spotifyUrl: "https://open.spotify.com/search/Chris%20Stussy", youtubeUrl: "https://www.youtube.com/results?search_query=Chris+Stussy" },
  { name: "Michael Bibi", style: "tech_house", bio: "Tech house de pista com assinatura Solid Grooves.", spotifyUrl: "https://open.spotify.com/search/Michael%20Bibi", youtubeUrl: "https://www.youtube.com/results?search_query=Michael+Bibi+tech+house" },
  { name: "PAWSA", style: "tech_house", bio: "Groove tech house minimal e focado em club.", spotifyUrl: "https://open.spotify.com/search/PAWSA", youtubeUrl: "https://www.youtube.com/results?search_query=PAWSA+tech+house" },
  { name: "Cloonee", style: "tech_house", bio: "Tech house de impacto rápido e vocal forte.", spotifyUrl: "https://open.spotify.com/search/Cloonee", youtubeUrl: "https://www.youtube.com/results?search_query=Cloonee+tech+house" },
  { name: "Wade", style: "tech_house", bio: "Tech house latino com energia de festival.", spotifyUrl: "https://open.spotify.com/search/Wade+tech+house", youtubeUrl: "https://www.youtube.com/results?search_query=Wade+tech+house" },
  { name: "Dennis Cruz", style: "tech_house", bio: "Tech house groove orientado e assinatura de club.", spotifyUrl: "https://open.spotify.com/search/Dennis+Cruz", youtubeUrl: "https://www.youtube.com/results?search_query=Dennis+Cruz+tech+house" },
  { name: "Jamie Jones", style: "tech_house", bio: "Pioneiro da escola moderna de tech house.", spotifyUrl: "https://open.spotify.com/search/Jamie+Jones", youtubeUrl: "https://www.youtube.com/results?search_query=Jamie+Jones+tech+house" },
  { name: "The Martinez Brothers", style: "tech_house", bio: "House e tech house com pegada de pista de Ibiza.", spotifyUrl: "https://open.spotify.com/search/The%20Martinez%20Brothers", youtubeUrl: "https://www.youtube.com/results?search_query=The+Martinez+Brothers+tech+house" },
  { name: "Skazi", style: "psy_comercial", bio: "Nome clássico do psy comercial/chacota.", spotifyUrl: "https://open.spotify.com/search/Skazi+psytrance", youtubeUrl: "https://www.youtube.com/results?search_query=Skazi+psytrance" },
  { name: "Paranormal Attack", style: "psy_comercial", bio: "Psytrance comercial com grande alcance de público.", spotifyUrl: "https://open.spotify.com/search/Paranormal%20Attack", youtubeUrl: "https://www.youtube.com/results?search_query=Paranormal+Attack+psytrance" },
  { name: "Mandragora", style: "psy_comercial", bio: "Referência atual de psy comercial para grandes públicos.", spotifyUrl: "https://open.spotify.com/search/Mandragora", youtubeUrl: "https://www.youtube.com/results?search_query=Mandragora+psytrance" },
  { name: "Claudinho Brasil", style: "psy_comercial", bio: "Figura conhecida no psy comercial/chacota no Brasil.", spotifyUrl: "https://open.spotify.com/search/Claudinho%20Brasil", youtubeUrl: "https://www.youtube.com/results?search_query=Claudinho+Brasil+psytrance" },
  { name: "Tinlicker", style: "progressive_house", bio: "Progressive house atmosferico.", spotifyUrl: "https://open.spotify.com/search/Tinlicker", youtubeUrl: "https://www.youtube.com/results?search_query=Tinlicker" },
  { name: "Sparrow & Barbossa", style: "afro_house", bio: "Afro house com percussao sofisticada.", spotifyUrl: "https://open.spotify.com/search/Sparrow%20and%20Barbossa", youtubeUrl: "https://www.youtube.com/results?search_query=Sparrow+and+Barbossa" },
  { name: "Bicep", style: "breakbeat", bio: "Breakbeat/UK sonoro e emocional.", spotifyUrl: "https://open.spotify.com/search/Bicep", youtubeUrl: "https://www.youtube.com/results?search_query=Bicep" },
  { name: "Interplanetary Criminal", style: "uk_garage", bio: "Nova escola UK garage com muito swing.", spotifyUrl: "https://open.spotify.com/search/Interplanetary%20Criminal", youtubeUrl: "https://www.youtube.com/results?search_query=Interplanetary+Criminal" },
  { name: "Bou", style: "jump_up", bio: "Jump up moderno para energia imediata.", spotifyUrl: "https://open.spotify.com/search/Bou", youtubeUrl: "https://www.youtube.com/results?search_query=Bou+dnb" },
  { name: "Calibre", style: "liquid_dnb", bio: "Liquid dnb profundo e musical.", spotifyUrl: "https://open.spotify.com/search/Calibre", youtubeUrl: "https://www.youtube.com/results?search_query=Calibre+liquid+dnb" },
  { name: "Noisia", style: "neurofunk", bio: "Design sonoro pesado e neurofunk tecnico.", spotifyUrl: "https://open.spotify.com/search/Noisia", youtubeUrl: "https://www.youtube.com/results?search_query=Noisia" },
  { name: "Saka", style: "dubstep", bio: "Bass moderno com drops cinematicos.", spotifyUrl: "https://open.spotify.com/search/Saka", youtubeUrl: "https://www.youtube.com/results?search_query=Saka+dubstep" },
  { name: "Floating Points", style: "idm", bio: "IDM/jazz eletronico para escuta de detalhe.", spotifyUrl: "https://open.spotify.com/search/Floating%20Points", youtubeUrl: "https://www.youtube.com/results?search_query=Floating+Points" },
  { name: "Biosphere", style: "ambient", bio: "Ambient gelido e contemplativo.", spotifyUrl: "https://open.spotify.com/search/Biosphere", youtubeUrl: "https://www.youtube.com/results?search_query=Biosphere+ambient" },
  { name: "Carbon Based Lifeforms", style: "ambient", bio: "Ambient/downtempo com paisagens espaciais e progressao lenta.", spotifyUrl: "https://open.spotify.com/search/Carbon%20Based%20Lifeforms", youtubeUrl: "https://www.youtube.com/results?search_query=Carbon+Based+Lifeforms+ambient" },
  { name: "Cindervomit", style: "slambient", bio: "Projeto associado a The Endless Knot, com slambient escuro e acelerado.", spotifyUrl: "https://open.spotify.com/search/Cindervomit", youtubeUrl: "https://www.youtube.com/results?search_query=Cindervomit+the+endless+knot" },
  { name: "Endless Knot Collective", style: "slambient", bio: "Curadoria de sonoridades hibridas do nucleo The Endless Knot.", spotifyUrl: "https://open.spotify.com/search/The%20Endless%20Knot", youtubeUrl: "https://www.youtube.com/results?search_query=The+Endless+Knot+collective" },
  { name: "Phyllorum", style: "slambient", bio: "Projeto do selo The Endless Knot com slambient acelerado e sombrio.", spotifyUrl: "https://open.spotify.com/search/Phyllorum%20Endless%20Knot", youtubeUrl: "https://www.youtube.com/results?search_query=Phyllorum+Endless+Knot" },
  { name: "Indaco Runa", style: "slambient", bio: "Texturas densas e rituais dentro da linha slambient do selo.", spotifyUrl: "https://open.spotify.com/search/Indaco%20Runa%20Endless%20Knot", youtubeUrl: "https://www.youtube.com/results?search_query=Indaco+Runa+Endless+Knot" },
  { name: "Agodark", style: "slambient", bio: "Grooves corrosivos com pegada de psy acelerado e clima sombrio.", spotifyUrl: "https://open.spotify.com/search/Agodark%20Endless%20Knot", youtubeUrl: "https://www.youtube.com/results?search_query=Agodark+Endless+Knot" },
  { name: "Audionimus", style: "slambient", bio: "Slambient agressivo com cortes rítmicos e atmosfera industrial.", spotifyUrl: "https://open.spotify.com/search/Audionimus%20Endless%20Knot", youtubeUrl: "https://www.youtube.com/results?search_query=Audionimus+Endless+Knot" },
  { name: "Akuma", style: "slambient", bio: "Projeto experimental do selo com narrativa sombria e acelerada.", spotifyUrl: "https://open.spotify.com/search/Akuma%20Endless%20Knot", youtubeUrl: "https://www.youtube.com/results?search_query=Akuma+Endless+Knot" },
  { name: "Akephalos", style: "slambient", bio: "Slambient textural com ritmo acelerado e foco em densidade.", spotifyUrl: "https://open.spotify.com/search/Akephalos%20Endless%20Knot", youtubeUrl: "https://www.youtube.com/results?search_query=Akephalos+Endless+Knot" }
];

const TRACK_METADATA = {
  "Deep Jungle Walk|Astrix": { releaseDate: "2016-10-28", duration: "07:18", musicalKey: "F# minor", catalogRef: "HMG-112" },
  "The Forest Calls|Atriohm": { releaseDate: "2019-06-14", duration: "08:02", musicalKey: "G minor", catalogRef: "PARV-067" },
  "We Will Prevail|Paralocks": { releaseDate: "2012-08-06", duration: "06:18", musicalKey: "N/A", catalogRef: "DEE-ZA312637" },
  "Phobos|ANNA": { releaseDate: "2019-11-15", duration: "06:19", musicalKey: "D minor", catalogRef: "DC-229" },
  "Acid Phase|Emmanuel Top": { releaseDate: "1994-05-03", duration: "05:32", musicalKey: "A minor", catalogRef: "NM-032" },
  "Breathe|Alignment": { releaseDate: "2023-03-17", duration: "05:41", musicalKey: "E minor", catalogRef: "KNTXT-019" },
  "Consciousness|Anyma": { releaseDate: "2023-08-11", duration: "03:52", musicalKey: "C minor", catalogRef: "AFTL-073" },
  "Losing It|FISHER": { releaseDate: "2018-07-13", duration: "04:08", musicalKey: "D minor", catalogRef: "CATR-024" },
  "Opus|Eric Prydz": { releaseDate: "2015-07-27", duration: "09:03", musicalKey: "E minor", catalogRef: "PRYDA-032" },
  "Your Voice|Black Coffee": { releaseDate: "2019-11-29", duration: "07:06", musicalKey: "A minor", catalogRef: "SLST-088" },
  "Solar System|Sub Focus": { releaseDate: "2023-05-12", duration: "03:39", musicalKey: "F minor", catalogRef: "RAM-412" },
  "Original Nuttah|UK Apache & Shy FX": { releaseDate: "1994-10-17", duration: "05:39", musicalKey: "F minor", catalogRef: "SB-004" },
  "Windowlicker|Aphex Twin": { releaseDate: "1999-03-22", duration: "06:07", musicalKey: "D# minor", catalogRef: "WAP-105" }
};

const FALLBACK_EVENTS = {
  astrix: [
    { datetime: "2026-04-11T23:30:00", venue: "Universo Paralello Warmup", city: "Sao Paulo", country: "BR", url: "https://www.songkick.com/search?query=Astrix" },
    { datetime: "2026-05-30T22:00:00", venue: "Psy Valley Open Air", city: "Lisbon", country: "PT", url: "https://www.songkick.com/search?query=Astrix" }
  ],
  anna: [
    { datetime: "2026-03-21T23:00:00", venue: "Warehouse Session", city: "Berlin", country: "DE", url: "https://www.songkick.com/search?query=ANNA" },
    { datetime: "2026-06-12T22:00:00", venue: "Drumcode Night", city: "Madrid", country: "ES", url: "https://www.songkick.com/search?query=ANNA" }
  ],
  "black coffee": [
    { datetime: "2026-03-28T21:30:00", venue: "Afro House Experience", city: "London", country: "UK", url: "https://www.songkick.com/search?query=Black+Coffee" },
    { datetime: "2026-07-10T22:30:00", venue: "Summer Terrace", city: "Barcelona", country: "ES", url: "https://www.songkick.com/search?query=Black+Coffee" }
  ],
  "sub focus": [
    { datetime: "2026-04-03T23:00:00", venue: "DNB Allstars", city: "Bristol", country: "UK", url: "https://www.songkick.com/search?query=Sub+Focus" },
    { datetime: "2026-08-14T22:00:00", venue: "Bassline Festival", city: "Prague", country: "CZ", url: "https://www.songkick.com/search?query=Sub+Focus" }
  ],
  skrillex: [
    { datetime: "2026-05-01T23:30:00", venue: "Bass Arena", city: "Los Angeles", country: "US", url: "https://www.songkick.com/search?query=Skrillex" },
    { datetime: "2026-09-19T21:00:00", venue: "Neon Circuit", city: "Tokyo", country: "JP", url: "https://www.songkick.com/search?query=Skrillex" }
  ]
};

const startBtn = document.getElementById("startBtn");
const startSurpriseBtn = document.getElementById("startSurpriseBtn");
const introScreen = document.getElementById("introScreen");
const introKicker = document.getElementById("introKicker");
const introTitle = document.getElementById("introTitle");
const introDesc = document.getElementById("introDesc");
const introQuote = document.getElementById("introQuote");
const introContinueBtn = document.getElementById("introContinueBtn");
const audioToggleBtn = document.getElementById("audioToggleBtn");
const audioToggleLabel = document.getElementById("audioToggleLabel");
const languageScreen = document.getElementById("languageScreen");
const languageButtons = document.querySelectorAll(".lang-btn");
const authScreen = document.getElementById("authScreen");
const authKicker = document.getElementById("authKicker");
const authTitle = document.getElementById("authTitle");
const authDesc = document.getElementById("authDesc");
const authUsernameLabel = document.getElementById("authUsernameLabel");
const authPasswordLabel = document.getElementById("authPasswordLabel");
const authUsername = document.getElementById("authUsername");
const authPassword = document.getElementById("authPassword");
const authLoginBtn = document.getElementById("authLoginBtn");
const authGuestBtn = document.getElementById("authGuestBtn");
const authFeedback = document.getElementById("authFeedback");
const welcomeScreen = document.getElementById("welcomeScreen");
const appContent = document.getElementById("appContent");
const quickSurprisePanel = document.getElementById("quickSurprisePanel");
const quickSurpriseTitle = document.getElementById("quickSurpriseTitle");
const quickSurpriseHint = document.getElementById("quickSurpriseHint");
const quickSurpriseStyleLabel = document.getElementById("quickSurpriseStyleLabel");
const quickSurpriseStyleEl = document.getElementById("quickSurpriseStyle");
const quickSurpriseKnownLabel = document.getElementById("quickSurpriseKnownLabel");
const quickSurpriseKnownArtistsEl = document.getElementById("quickSurpriseKnownArtists");
const quickSurpriseKnownTracksLabel = document.getElementById("quickSurpriseKnownTracksLabel");
const quickSurpriseKnownTracksEl = document.getElementById("quickSurpriseKnownTracks");
const quickSurpriseRunBtn = document.getElementById("quickSurpriseRunBtn");
const quickSurpriseCancelBtn = document.getElementById("quickSurpriseCancelBtn");
const toastEl = document.getElementById("toast");
const searchOverlay = document.getElementById("searchOverlay");
const searchTitle = document.getElementById("searchTitle");
const searchStatusText = document.getElementById("searchStatusText");
const searchProgressFill = document.getElementById("searchProgressFill");
const quizChallengeBubble = document.getElementById("quizChallengeBubble");
const quizBubbleText = document.getElementById("quizBubbleText");
const quizStartBtn = document.getElementById("quizStartBtn");
const quizLaterBtn = document.getElementById("quizLaterBtn");
const quizOverlay = document.getElementById("quizOverlay");
const quizKicker = document.getElementById("quizKicker");
const quizTitle = document.getElementById("quizTitle");
const quizMeta = document.getElementById("quizMeta");
const quizProgressFill = document.getElementById("quizProgressFill");
const quizQuestionText = document.getElementById("quizQuestionText");
const quizOptions = document.getElementById("quizOptions");
const quizFeedbackText = document.getElementById("quizFeedbackText");
const quizSubmitBtn = document.getElementById("quizSubmitBtn");
const quizNextBtn = document.getElementById("quizNextBtn");
const quizRetryBtn = document.getElementById("quizRetryBtn");
const quizCloseBtn = document.getElementById("quizCloseBtn");
const genreFxLayer = document.getElementById("genreFxLayer");

const styleEl = document.getElementById("style");
const contextEl = document.getElementById("context");
const energyEl = document.getElementById("energy");
const bpmEl = document.getElementById("bpm");
const vocalsEl = document.getElementById("vocals");
const styleInfoBubble = document.getElementById("styleInfoBubble");
const styleInfoCloseBtn = document.getElementById("styleInfoCloseBtn");
const styleInfoTitle = document.getElementById("styleInfoTitle");
const styleInfoBpm = document.getElementById("styleInfoBpm");
const styleInfoSummary = document.getElementById("styleInfoSummary");
const styleInfoTip = document.getElementById("styleInfoTip");
const knownArtistsEl = document.getElementById("knownArtists");
const discoveryModeEl = document.getElementById("discoveryMode");
const recommendBtn = document.getElementById("recommendBtn");
const rerollBtn = document.getElementById("rerollBtn");
const newArtistsBtn = document.getElementById("newArtistsBtn");
const surpriseBtn = document.getElementById("surpriseBtn");
const clearFiltersBtn = document.getElementById("clearFiltersBtn");
const resetAppBtn = document.getElementById("resetAppBtn");

const weightStyleEl = document.getElementById("weightStyle");
const weightContextEl = document.getElementById("weightContext");
const weightEnergyEl = document.getElementById("weightEnergy");
const weightBpmEl = document.getElementById("weightBpm");
const weightVocalsEl = document.getElementById("weightVocals");

const weightStyleValueEl = document.getElementById("weightStyleValue");
const weightContextValueEl = document.getElementById("weightContextValue");
const weightEnergyValueEl = document.getElementById("weightEnergyValue");
const weightBpmValueEl = document.getElementById("weightBpmValue");
const weightVocalsValueEl = document.getElementById("weightVocalsValue");

const resultPanel = document.getElementById("resultPanel");
const detailsPanel = document.getElementById("detailsPanel");
const artistDetailsCard = document.getElementById("artistDetailsCard");
const labelDetailsCard = document.getElementById("labelDetailsCard");
const discoveryCard = document.getElementById("discoveryCard");

const matchReason = document.getElementById("matchReason");
const songTitle = document.getElementById("songTitle");
const artistLine = document.getElementById("artistLine");
const bpmLine = document.getElementById("bpmLine");
const artistName = document.getElementById("artistName");
const labelName = document.getElementById("labelName");
const styleName = document.getElementById("styleName");
const bpmInfo = document.getElementById("bpmInfo");
const energyInfo = document.getElementById("energyInfo");
const releaseInfo = document.getElementById("releaseInfo");
const durationInfo = document.getElementById("durationInfo");
const keyInfo = document.getElementById("keyInfo");
const catalogInfo = document.getElementById("catalogInfo");
const songVibe = document.getElementById("songVibe");
const listeningNarrative = document.getElementById("listeningNarrative");
const spotifyLink = document.getElementById("spotifyLink");
const youtubeLink = document.getElementById("youtubeLink");
const soundcloudLink = document.getElementById("soundcloudLink");
const primaryTrackCard = document.getElementById("primaryTrackCard");
const generatedBadge = document.getElementById("generatedBadge");
const knownArtistPrompt = document.getElementById("knownArtistPrompt");
const knownYesBtn = document.getElementById("knownYesBtn");
const knownNoBtn = document.getElementById("knownNoBtn");
const noveltyEnjoyPrompt = document.getElementById("noveltyEnjoyPrompt");
const noveltyLikedBtn = document.getElementById("noveltyLikedBtn");
const noveltyNotYetBtn = document.getElementById("noveltyNotYetBtn");
const blockArtistBtn = document.getElementById("blockArtistBtn");
const previewPanel = document.getElementById("previewPanel");
const previewStatus = document.getElementById("previewStatus");
const trackPreview = document.getElementById("trackPreview");
const youtubePreviewWrap = document.getElementById("youtubePreviewWrap");
const youtubePreviewFrame = document.getElementById("youtubePreviewFrame");
const youtubePreviewActions = document.getElementById("youtubePreviewActions");
const youtubePreviewToggleBtn = document.getElementById("youtubePreviewToggleBtn");
const youtubePreviewRetryBtn = document.getElementById("youtubePreviewRetryBtn");
const listeningPrompt = document.getElementById("listeningPrompt");
const previewLikeBtn = document.getElementById("previewLikeBtn");
const previewDislikeBtn = document.getElementById("previewDislikeBtn");
const recentListenersPanel = document.getElementById("recentListenersPanel");
const listenersSubtitle = document.getElementById("listenersSubtitle");
const recentListenersList = document.getElementById("recentListenersList");
const topListenersPanel = document.getElementById("topListenersPanel");
const topListenersTitle = document.getElementById("topListenersTitle");
const topListenersSubtitle = document.getElementById("topListenersSubtitle");
const topListenersList = document.getElementById("topListenersList");
const trackAiPanel = document.getElementById("trackAiPanel");
const trackAiTitle = document.getElementById("trackAiTitle");
const trackAiRefreshBtn = document.getElementById("trackAiRefreshBtn");
const trackAiText = document.getElementById("trackAiText");
const trackAiMeta = document.getElementById("trackAiMeta");
const suggestionQueueCard = document.getElementById("suggestionQueueCard");
const suggestionQueueTitle = document.getElementById("suggestionQueueTitle");
const suggestionQueueHint = document.getElementById("suggestionQueueHint");
const suggestionQueueList = document.getElementById("suggestionQueueList");

const discoveryArtistName = document.getElementById("discoveryArtistName");
const discoveryMeta = document.getElementById("discoveryMeta");
const discoveryBio = document.getElementById("discoveryBio");
const discoverySpotifyLink = document.getElementById("discoverySpotifyLink");
const discoveryYoutubeLink = document.getElementById("discoveryYoutubeLink");
const discoverySoundcloudLink = document.getElementById("discoverySoundcloudLink");

const feedbackMessage = document.getElementById("feedbackMessage");
const artistBio = document.getElementById("artistBio");
const labelBio = document.getElementById("labelBio");
const artistSocialsPanel = document.getElementById("artistSocialsPanel");
const artistSocialsTitle = document.getElementById("artistSocialsTitle");
const artistSocialsHint = document.getElementById("artistSocialsHint");
const artistSocialLinks = document.getElementById("artistSocialLinks");
const statsLine = document.getElementById("statsLine");
const summaryProfileStatus = document.getElementById("summaryProfileStatus");
const summaryKnownCount = document.getElementById("summaryKnownCount");
const summaryDiscoveredCount = document.getElementById("summaryDiscoveredCount");
const summaryLikedArtistsCount = document.getElementById("summaryLikedArtistsCount");
const summaryDislikedArtistsCount = document.getElementById("summaryDislikedArtistsCount");
const summaryFavoriteStyle = document.getElementById("summaryFavoriteStyle");
const summaryAchievementText = document.getElementById("summaryAchievementText");
const summaryFiveStarTracks = document.getElementById("summaryFiveStarTracks");
const summaryKnownArtists = document.getElementById("summaryKnownArtists");
const summaryLikedArtists = document.getElementById("summaryLikedArtists");
const summaryDislikedArtists = document.getElementById("summaryDislikedArtists");
const eventsPanel = document.getElementById("eventsPanel");
const eventsIntro = document.getElementById("eventsIntro");
const eventsCalendar = document.getElementById("eventsCalendar");
const eventsList = document.getElementById("eventsList");
const newArtistsPanel = document.getElementById("newArtistsPanel");
const newArtistsTitle = document.getElementById("newArtistsTitle");
const newArtistsStatus = document.getElementById("newArtistsStatus");
const newArtistsList = document.getElementById("newArtistsList");
const spiritPanel = document.getElementById("spiritPanel");
const spiritCard = document.getElementById("spiritCard");
const spiritPanelTitle = document.getElementById("spiritPanelTitle");
const spiritIntro = document.getElementById("spiritIntro");
const spiritBadge = document.getElementById("spiritBadge");
const spiritImage = document.getElementById("spiritImage");
const spiritName = document.getElementById("spiritName");
const spiritArchetype = document.getElementById("spiritArchetype");
const spiritDescription = document.getElementById("spiritDescription");
const spiritProgress = document.getElementById("spiritProgress");
const spiritVisualPanel = document.getElementById("spiritVisualPanel");
const spiritVisualTitle = document.getElementById("spiritVisualTitle");
const spiritVisualHint = document.getElementById("spiritVisualHint");
const spiritVisualFrame = document.getElementById("spiritVisualFrame");
const spiritAmbientVisual = document.getElementById("spiritAmbientVisual");
const spiritVisualPresetName = document.getElementById("spiritVisualPresetName");
const spiritVisualYoutubeLink = document.getElementById("spiritVisualYoutubeLink");
const spiritSpotlightPanel = document.getElementById("spiritSpotlightPanel");
const spiritSpotlightTitle = document.getElementById("spiritSpotlightTitle");
const spiritSpotlightHint = document.getElementById("spiritSpotlightHint");
const spiritSpotlightTrack = document.getElementById("spiritSpotlightTrack");
const spiritSpotlightMeta = document.getElementById("spiritSpotlightMeta");
const spiritSpotlightSpotify = document.getElementById("spiritSpotlightSpotify");
const spiritSpotlightYoutube = document.getElementById("spiritSpotlightYoutube");
const spiritSpotlightSoundcloud = document.getElementById("spiritSpotlightSoundcloud");
const spiritCollectiblePanel = document.getElementById("spiritCollectiblePanel");
const spiritCollectibleTitle = document.getElementById("spiritCollectibleTitle");
const spiritCollectibleHint = document.getElementById("spiritCollectibleHint");
const spiritCollectibleImage = document.getElementById("spiritCollectibleImage");
const spiritCollectibleMilestone = document.getElementById("spiritCollectibleMilestone");
const spiritCollectibleProgress = document.getElementById("spiritCollectibleProgress");
const spiritCollectibleDetails = document.getElementById("spiritCollectibleDetails");
const spiritCollectibleDownload = document.getElementById("spiritCollectibleDownload");
const spiritCollectibleShareInstagramBtn = document.getElementById("spiritCollectibleShareInstagramBtn");
const spiritRankBadge = document.getElementById("spiritRankBadge");

const likeSongBtn = document.getElementById("likeSongBtn");
const likeArtistBtn = document.getElementById("likeArtistBtn");
const likeDiscoveryBtn = document.getElementById("likeDiscoveryBtn");
const knewDiscoveryBtn = document.getElementById("knewDiscoveryBtn");
const skipBtn = document.getElementById("skipBtn");
const adaptiveSurpriseBtn = document.getElementById("adaptiveSurpriseBtn");
const moreInfoBtn = document.getElementById("moreInfoBtn");
const ratingTitle = document.getElementById("ratingTitle");
const ratingHint = document.getElementById("ratingHint");
const ratingCelebration = document.getElementById("ratingCelebration");
const starRating = document.getElementById("starRating");
const starButtons = starRating ? Array.from(starRating.querySelectorAll(".star-btn")) : [];

const userStats = {
  likedSongs: 0,
  likedArtists: 0,
  likedDiscoveries: 0,
  alreadyKnew: 0,
  skipped: 0,
  ratingCount: 0,
  ratingSum: 0
};

let lastPrefs = null;
let currentRecommendation = null;
let currentDiscovery = null;
let knownArtistsMemory = new Set();
let knownTrackTitlesMemory = new Set();
let discoveredArtistsInApp = new Set();
let seenArtistsMemory = new Set();
let blockedArtistsMemory = new Set();
let rejectedArtists = new Set();
let dynamicCatalogByStyle = new Map();
let recommendationMemory = new Set();
let recentTrackHistoryByStyle = new Map();
let recommendationMemoryQueue = [];
let servedTrackCycleByStyle = new Map();
let servedArtistCycleByStyle = new Map();
let lastRejectedTrackKey = "";
let catalogWarmupRunning = false;
let searchOverlayLocks = 0;
let searchProgressTimer = 0;
let searchProgressValue = 0;
let youtubePreviewSearchAttempt = 0;
let youtubePreviewTrackKey = "";
let bioAnimationToken = 0;
let listeningNarrativeToken = 0;
let spiritAnimationToken = 0;
let currentSpiritId = "";
let spiritLastReviewedSongLikes = 0;
let currentSpiritVisualQuery = "";
let spiritUnlocked = false;
let spiritSignalsByStyle = new Map();
let spiritCollectibleBusy = false;
let trackRatings = new Map();
let trackRatingSignals = new Map();
let trackPreferenceSignals = new Map();
let trackPreviewIssueSignals = new Map();
let previewReliabilityByStyle = new Map();
let suggestionQueueTracks = [];
let suggestionQueueContextKey = "";
let trackInsightCache = new Map();
let currentTrackInsightTrackKey = "";
let styleInfoDismissed = false;
let recommendationBlockedByKnown = false;
let recommendationRunBusy = false;
let recommendationStyleFallbackInfo = null;
let activeVibeTheme = "";
let currentAuthUser = null;
let externalDatasetImportStarted = false;
let externalDatasetImportDone = false;
let externalDatasetImportPromise = null;
let introQuoteTimer = 0;
let introQuoteIndex = 0;
let introAutoAdvanceTimer = 0;
let introDismissed = false;
let audioContext = null;
let audioMasterGain = null;
let audioMusicGain = null;
let audioFxGain = null;
let audioLimiter = null;
let introAmbientNodes = null;
let introAmbientArpTimer = 0;
let audioUnavailable = false;
let audioUnlocked = false;
let audioEnabled = true;
let openingStingPlayed = false;
let openingStingPending = false;
let searchAudioPulseTimer = 0;
let quizOfferTimer = 0;
let quizPendingChallenge = null;
let quizSession = null;
let quizSelectedOption = -1;
let quizCurrentAnswered = false;
let quizAttemptsByStyle = new Map();
let quizBestScoreByStyle = new Map();
let quizNextOfferCountByStyle = new Map();
const REMOTE_ARTIST_BIO_MIN_LENGTH = 120;

const adaptiveModel = {
  likedStyles: new Map(),
  dislikedStyles: new Map(),
  likedArtists: new Map(),
  dislikedArtists: new Map(),
  likedEnergies: new Map(),
  dislikedEnergies: new Map()
};

const STORAGE_KEY = "neonpulse:preferences:v2";
const DYNAMIC_CATALOG_CACHE_KEY = "neonpulse:dynamicCatalog:v10";
const PROGRESS_STORAGE_KEY = "neonpulse:progress:v2";
const SPIRIT_COLLECTIBLE_STORAGE_KEY = "neonpulse:spiritCollectible:v11";
const USER_SESSION_STORAGE_KEY = "neonpulse:user:v1";
const AUDIO_STORAGE_KEY = "neonpulse:audio:v2";
const AUDIO_GAIN_PROFILE = {
  masterTarget: 1.68,
  fxBusGain: 1.18,
  introBusTarget: 1.42,
  introRootGain: 0.132,
  introPadGain: 0.088,
  introShimmerGain: 0.036,
  introNoiseGain: 0.027,
  introPulseGain: 0.036,
  uiToneBoost: 2.18,
  uiToneMax: 0.42
};
const PROGRESS_MAP_LIMIT = 240;
const DEFAULT_LANGUAGE = "en";
const NEW_ARTIST_LOOKBACK_YEARS = 2;
const QUIZ_TRIGGER_MIN_KNOWN = 6;
const QUIZ_REOFFER_STEP = 4;
const QUIZ_BASE_QUESTION_COUNT = 5;
const QUIZ_MAX_QUESTION_COUNT = 7;
const YOUTUBE_SEARCH_RESULTS_PER_QUERY = 3;
const SPIRIT_AVATAR_FALLBACK = "assets/image-bank/png/logos/neonpulse-logo-mark.png?v=20260223a";
const SPIRIT_COLLECTIBLE_FALLBACK = "assets/image-bank/png/social/share_card_1.png?v=20260223a";
let currentLanguage = DEFAULT_LANGUAGE;
let progressStorageReady = false;

const INTRO_QUOTE_CLASSES = [
  "intro-quote-flare",
  "intro-quote-wave",
  "intro-quote-glitch",
  "intro-quote-drift",
  "intro-quote-laser"
];

const INTRO_QUOTES = {
  pt: [
    { text: "Batida no peito, mente em expansao.", style: "intro-quote-flare" },
    { text: "No escuro da pista, cada kick abre um portal.", style: "intro-quote-glitch" },
    { text: "Sinta o grave respirando junto com voce.", style: "intro-quote-wave" },
    { text: "Psicodelia e foco: caos bonito, curadoria precisa.", style: "intro-quote-drift" },
    { text: "Luz, ritmo e descoberta em tempo real.", style: "intro-quote-laser" }
  ],
  en: [
    { text: "Bass on your chest, mind wide open.", style: "intro-quote-flare" },
    { text: "In the dark, every kick opens a portal.", style: "intro-quote-glitch" },
    { text: "Feel the low end breathing with you.", style: "intro-quote-wave" },
    { text: "Psy mood plus precision curation.", style: "intro-quote-drift" },
    { text: "Light, rhythm, and real discovery.", style: "intro-quote-laser" }
  ],
  es: [
    { text: "Bajo en el pecho, mente en expansion.", style: "intro-quote-flare" },
    { text: "En la oscuridad, cada kick abre un portal.", style: "intro-quote-glitch" },
    { text: "Siente el grave respirando contigo.", style: "intro-quote-wave" },
    { text: "Psicodelia y precision en la curaduria.", style: "intro-quote-drift" },
    { text: "Luz, ritmo y descubrimiento real.", style: "intro-quote-laser" }
  ]
};

const DEFAULT_WEIGHTS = {
  style: 3,
  context: 2,
  energy: 2,
  bpm: 1,
  vocals: 1
};
const artistApiProfileCache = new Map();
const recentArtistSignals = new Map();

const MIN_TRACKS_PER_STYLE = 20;
const MIN_ARTISTS_PER_STYLE = 8;
const MIN_LABELS_PER_STYLE = 6;
const STYLE_COVERAGE_OVERRIDES = {
  // Nichos ultra específicos: mantém rigor sem bloquear toda a experiência.
  dark_progressive: { artists: 8, labels: 6, tracks: 24 },
  full_on: { artists: 12, labels: 8, tracks: 28 },
  full_on_night: { artists: 10, labels: 8, tracks: 24 },
  full_on_morning: { artists: 10, labels: 8, tracks: 24 },
  progressive_psy: { artists: 8, labels: 8, tracks: 24 },
  psy_comercial: { artists: 8, labels: 6, tracks: 20 },
  hi_tech: { artists: 15, labels: 10, tracks: 28 },
  slambient: { artists: 8, labels: 1, tracks: 14 },
  dark_experimental: { artists: 12, labels: 10, tracks: 24 },
  // Psycore depende fortemente de hidratação por artistas seed; não exige muitos labels para destravar recomendação.
  psycore: { artists: 8, labels: 0, tracks: 10 }
};
const COVERAGE_MAX_PASSES = 5;
const FAST_COVERAGE_MAX_PASSES = 2;
const FAST_COVERAGE_TIMEOUT_MS = 12000;
const DEFAULT_COVERAGE_TIMEOUT_MS = 26000;
const RECENT_LISTENERS_TARGET = 6;
const RECENT_LISTENER_NAMES = [
  "ravepilot_77",
  "techno.nina",
  "psysonic.br",
  "clubrunner",
  "bpm_hunter",
  "hitechdrive",
  "nightshift.dj",
  "forestsignal",
  "loopvoyager",
  "acidframe",
  "deepgrid",
  "dropalchemy"
];
const RECENT_LISTENER_CITIES = [
  "Sao Paulo",
  "Goiania",
  "Belo Horizonte",
  "Curitiba",
  "Berlin",
  "Lisboa",
  "Mexico City",
  "Tel Aviv",
  "London",
  "Buenos Aires"
];
const RECENT_LISTENER_REACTIONS = [
  { pt: "curtiu o groove", en: "liked the groove", es: "le gusto el groove" },
  { pt: "salvou na playlist", en: "saved to playlist", es: "lo guardo en su playlist" },
  { pt: "curtiu no preview", en: "liked in preview", es: "le gusto en el preview" },
  { pt: "marcou como descoberta", en: "marked as discovery", es: "la marco como descubrimiento" },
  { pt: "ouviu ate o drop", en: "listened until the drop", es: "la escucho hasta el drop" },
  { pt: "quer ouvir de novo", en: "wants to replay it", es: "quiere escucharla de nuevo" }
];

const STYLE_BPM_RULES = {
  psytrance: { min: 138, max: 148 },
  forest_psy: { min: 145, max: 154 },
  dark_psy: { min: 154, max: 175 },
  dark_experimental: { min: 152, max: 172 },
  psycore: { min: 175, max: 220 },
  full_on: { min: 142, max: 150 },
  full_on_night: { min: 146, max: 154 },
  full_on_morning: { min: 142, max: 149 },
  progressive_psy: { min: 132, max: 140 },
  hi_tech: { min: 176, max: 230 },
  dark_progressive: { min: 132, max: 140 },
  goa_trance: { min: 135, max: 145 },
  psy_comercial: { min: 142, max: 152 },
  trance_uplifting: { min: 136, max: 142 },
  techno: { min: 128, max: 136 },
  acid_techno: { min: 130, max: 142 },
  hard_techno: { min: 145, max: 160 },
  minimal_techno: { min: 126, max: 132 },
  melodic_techno: { min: 122, max: 130 },
  industrial_techno: { min: 138, max: 150 },
  peak_time_techno: { min: 132, max: 140 },
  house: { min: 122, max: 128 },
  deep_house: { min: 110, max: 124 },
  tech_house: { min: 124, max: 128 },
  progressive_house: { min: 124, max: 130 },
  afro_house: { min: 118, max: 126 },
  organic_house: { min: 112, max: 122 },
  bass_house: { min: 126, max: 132 },
  electro_house: { min: 126, max: 132 },
  drum_and_bass: { min: 170, max: 176 },
  liquid_dnb: { min: 170, max: 176 },
  neurofunk: { min: 172, max: 178 },
  jump_up: { min: 172, max: 178 },
  jungle: { min: 160, max: 174 },
  breakbeat: { min: 125, max: 140 },
  uk_garage: { min: 128, max: 136 },
  future_garage: { min: 130, max: 140 },
  dubstep: { min: 138, max: 150 },
  downtempo: { min: 90, max: 115 },
  ambient: { min: 60, max: 110 },
  slambient: { min: 155, max: 185 },
  idm: { min: 95, max: 145 },
  electro: { min: 120, max: 132 },
  hardstyle: { min: 148, max: 160 }
};

const STYLE_INFO_PT = {
  psytrance: "Psytrance de pista com progressao hipnotica, synths acidos e foco em trance psicodelico.",
  forest_psy: "Vertente mais organica e tribal do psy, com atmosferas densas e camadas de floresta.",
  dark_psy: "Sonoridade mais sombria e agressiva, com design de som cortante e narrativa noturna.",
  dark_experimental: "Cruza dark psy com texturas experimentais, arranjos menos previsiveis e timbres abstratos.",
  psycore: "Subestilo extremo do psy, com muita densidade ritmica, recortes secos e altissima intensidade.",
  full_on: "Full-On classico de pista: groove reto, drops claros e leads melodicos para energia constante.",
  full_on_night: "Leitura mais noturna do Full-On, geralmente mais pesada, seca e focada em impacto de madrugada.",
  full_on_morning: "Leitura mais melodica e aberta do Full-On, com harmonias luminosas e clima de amanhecer.",
  progressive_psy: "Psy progressivo com groove linear, poucas quebras e evolucao gradual para longos sets.",
  hi_tech: "Psy de altissima velocidade, glitchs rapidos e muita pressao ritmica, comum em picos de energia.",
  dark_progressive: "PROG DARK (dark progressive/zenonesque): groove psicodelico hipnotico, timbres sombrios e progressao de longa duração.",
  goa_trance: "Raiz melodica do psy/trance, com linhas acidas, arpejos classicos e pegada psicodelica vintage.",
  psy_comercial: "Psy com formula mais radio/festival mainstream, hooks mais simples e refrões diretos.",
  trance_uplifting: "Trance melodico com breakdown emocional e retornos energeticos, foco em euforia.",
  techno: "Techno de groove repetitivo e direcao de pista, com foco em textura e consistencia de pulso.",
  acid_techno: "Techno conduzido por linhas acidas (estetica 303), com drive e variacao timbrica.",
  hard_techno: "Techno mais rapido e agressivo, kicks pesados e ataque forte para momentos de pico.",
  minimal_techno: "Menos elementos, mais microdetalhes: espaco, repeticao e transicoes sutis.",
  melodic_techno: "Techno com protagonismo harmonico, atmosferas emotivas e arranjos cinematograficos.",
  industrial_techno: "Texturas metalicas e estetica mecanica, com impacto bruto e clima sombrio.",
  peak_time_techno: "Techno pensado para horario de pico, com energia alta e estrutura orientada a drop.",
  house: "House classico de groove dançante, balanço 4x4 e sensacao calorosa de pista.",
  deep_house: "House mais profundo e envolvente, com timbres suaves e vibe sofisticada.",
  tech_house: "Hibrido de house com design techno: percussao seca, bassline direta e foco no groove.",
  progressive_house: "House progressivo com construcao gradual e atmosfera ampla para jornadas longas.",
  afro_house: "House com matriz percussiva afro, polirritmia e clima organico de pista.",
  organic_house: "House de textura natural e percussao leve, geralmente mais emocional e cinematico.",
  bass_house: "House com bassline pesada e linguagem de bass music aplicada ao pulso 4x4.",
  electro_house: "House de impacto, synths marcados e drops energicos com identidade eletrica.",
  drum_and_bass: "Breaks acelerados e bassline profunda; foco em energia alta e precisao ritmica.",
  liquid_dnb: "Leitura melodica do DnB, com harmonias suaves e ambiente mais emotivo.",
  neurofunk: "DnB tecnico e sombrio, com bass design complexo e muita tensao ritmica.",
  jump_up: "DnB mais direto e divertido, com basslines saltadas e resposta imediata de pista.",
  jungle: "Raiz breakbeat do DnB, com breaks picotados, subgrave forte e heranca soundsystem.",
  breakbeat: "Batida quebrada (nao 4x4), groove sincopado e pegada hibrida entre club e bass.",
  uk_garage: "Groove quebrado com swing britanico, linhas de baixo elasticas e vocal chops.",
  future_garage: "Vertente atmosferica do garage, com espacamento, texturas etereas e clima introspectivo.",
  dubstep: "Ritmo quebrado com half-time e bass de grande impacto, comum em drops dramaticos.",
  downtempo: "Andamento mais baixo para escuta focada em textura, ambiencia e fluidez.",
  ambient: "Musica de espaco sonoro, pouca percussao e foco em paisagem e atmosfera.",
  slambient: "Intersecao de ambient com psy escuro: drones, textura ritualistica e andamento hipnotico.",
  idm: "Eletronica experimental orientada a detalhe ritmico, estrutura complexa e escuta ativa.",
  electro: "Batidas secas e sintese retro-futurista com influencia de electro-funk e robotica.",
  hardstyle: "Kick distorcido, leads antemicos e energia de hard dance para momentos de explosao."
};

const STYLE_FAMILY_INFO = {
  pt: {
    psytrance: "Linha psicodelica orientada a trance, com foco em progressao hipnotica e narrativa de pista.",
    trance: "Trance melodico com tensao e liberacao, geralmente orientado a climas euforicos.",
    techno: "Musica de repeticao e textura, com evolucao gradual e foco no pulso 4x4.",
    house: "Groove caloroso e dançante, com swing e direcao ritmica para pista.",
    dnb: "Breakbeats rapidos e baixo profundo, com alta densidade ritmica.",
    bass_music: "Vertentes de batida quebrada focadas em impacto de grave e design sonoro.",
    leftfield: "Eletronica mais atmosferica/experimental, com menos formula de drop tradicional.",
    hard_dance: "Energia extrema de pista, kicks agressivos e impacto frontal.",
    outros: "Subgenero eletronico com fronteiras flexiveis entre timbre, groove e contexto de pista."
  },
  en: {
    psytrance: "Psychedelic trance-focused sound, built on hypnotic progression and dancefloor storytelling.",
    trance: "Melodic trance driven by tension-and-release and euphoric peaks.",
    techno: "Repetition and texture-first music with gradual evolution and steady 4x4 pulse.",
    house: "Warm dance groove with swing-forward rhythm and club flow.",
    dnb: "Fast breakbeats with deep bass and high rhythmic density.",
    bass_music: "Broken-beat styles centered on low-end impact and sound design.",
    leftfield: "More atmospheric/experimental electronic lane with less traditional drop formula.",
    hard_dance: "Extreme dancefloor energy with aggressive kick design and direct impact.",
    outros: "Electronic subgenre with flexible boundaries across timbre, groove, and context."
  },
  es: {
    psytrance: "Sonido psicodélico orientado al trance, con progresión hipnótica y narrativa de pista.",
    trance: "Trance melódico con tensión/liberación y picos eufóricos.",
    techno: "Música de repetición y textura, con evolución gradual y pulso 4x4 constante.",
    house: "Groove cálido y bailable, con swing y flujo de club.",
    dnb: "Breakbeats rápidos con bajo profundo y alta densidad rítmica.",
    bass_music: "Estilos de ritmo quebrado centrados en grave potente y diseño sonoro.",
    leftfield: "Electrónica más atmosférica/experimental y menos fórmula de drop tradicional.",
    hard_dance: "Energía extrema de pista con kicks agresivos e impacto frontal.",
    outros: "Subgénero electrónico con fronteras flexibles entre timbre, groove y contexto."
  }
};

const PSYCORE_ARTIST_ROSTER = [
  "90-db (Dawood)",
  "Acceleraptor",
  "Adrian",
  "Affectum Infernum",
  "Akeno",
  "Aliendigena",
  "Aloa",
  "Analua aka Maga",
  "Arkhos",
  "Aspa Syava",
  "Astral Labyrinth",
  "Asun",
  "AuDiOInVadEr",
  "Audiologist",
  "Bardo",
  "Begotech",
  "Bizzare Frequency",
  "Black Phillip",
  "Blind-Ox",
  "Bolon Yokte",
  "Cali Balam",
  "Cambioharmonia",
  "Chaostrophob",
  "Cindervomit",
  "Daash",
  "Daemon",
  "Dajjal",
  "Dama de Oro",
  "Darktech A2",
  "Daydara",
  "Deadhead",
  "Delah",
  "Demokore",
  "Doctor X",
  "Ekphrasys",
  "El Mago",
  "Elephant",
  "Elick",
  "Elvenfolk",
  "Epinoia",
  "Espiritus",
  "Evilporks",
  "Fringe",
  "Galileo",
  "Glitchy Jungle",
  "Grimble Gromble",
  "Groovality",
  "Gukumatz",
  "Gunjunde",
  "Haemogoblin",
  "Holymania",
  "Hon'ne",
  "Jergowitch",
  "Kasatka",
  "Kambarang",
  "Keith",
  "KerPlunX",
  "Kickoma",
  "KillJoy",
  "Kosmic Mantra",
  "Kozmofreak",
  "Kreadivart",
  "K-Owl",
  "Kuiper",
  "Leoncore",
  "Lesky",
  "LuuLi",
  "Machen",
  "Magic Shaman",
  "Maleficaros",
  "Malfurion",
  "Manik Buluk",
  "Marss",
  "Mizter Bonezz",
  "Mohina",
  "Mohinia",
  "Mukhtar",
  "Mythorlogic",
  "Nala",
  "Narcolepsy",
  "Nazrael",
  "Necronomicon",
  "Neormm",
  "Nephilim",
  "Osciloptix",
  "Otkun",
  "Ozocore",
  "PILL MURRAY",
  "Plankton",
  "Poltergeist",
  "Potowatoma",
  "Psynetyk",
  "Psychechini",
  "PsyCore25",
  "Rockyyellowsnake",
  "SashaPasha",
  "Sepehraka",
  "Setu Ketu",
  "Shadowform",
  "Silverdaze",
  "Simbal Karma",
  "Solanacea",
  "Toxic Twins",
  "Toadstool",
  "Traumaticoma",
  "Tyamat",
  "UgRA",
  "Varazslo",
  "Versalli",
  "Vogel Licht",
  "Vuga",
  "Wave Savage",
  "Xenolalia",
  "Xochipilli",
  "Yakawrath",
  "YamavooDoom",
  "Yaminahua",
  "YMBX",
  "Zamurah"
];

const HITECH_ARTIST_ROSTER = [
  "Gotalien",
  "Arcek",
  "Kokobloko",
  "OxiDaksi",
  "Sonic System",
  "Dysfunction",
  "Muckypuh",
  "Ultreia",
  "Grey Aathma",
  "Stranger Æons",
  "PsyToHigh",
  "Kingo",
  "Dambs",
  "Curutech",
  "Stamina Potion",
  "Overgunz",
  "ToadstoolMIND",
  "Zaaki",
  "Ergolaboos",
  "Geist",
  "Wordsalad",
  "Arwium",
  "Wallace Deliruk",
  "Faster Fugo",
  "Digital Mantra",
  "Glattech",
  "Quichua",
  "Wubcy",
  "Kenzai",
  "Plasmorh",
  "Zohmbie",
  "Naga Morich",
  "Phragma",
  "Chemical Biosphere",
  "Universum Psy",
  "AstriDakini",
  "Cosmic Spirit",
  "Inraxx",
  "Aeon",
  "Quake",
  "Stereoskopia",
  "Samuralien",
  "Shumium Project",
  "Psynamik",
  "Squaric",
  "Magic No Logic",
  "Onirix Keyden",
  "Antiimatter",
  "Neuroattack",
  "Introspectrip",
  "Jedi and his Padawan",
  "Nqr",
  "Acajou",
  "Jopplin",
  "Synaptic Madness",
  "Dadda",
  "Nordtex",
  "Dystopic Space",
  "Artificial Organism",
  "Dark Whisper",
  "Inner Coma",
  "Kunan Tripper",
  "Kaikkialla",
  "Arhitech",
  "Select Project",
  "Popek",
  "Kashyyyk",
  "Xenrox",
  "Mentalecho",
  "Alien Chaos",
  "Fractaly Noise",
  "Spiral",
  "Noise Therapy",
  "Dr. Bops",
  "Organoise",
  "Yatzee",
  "Paralocks",
  "Fright Rate",
  "Pastor John",
  "Highko",
  "Virtuanoise",
  "Zigurat",
  "Xandoz",
  "Milowatt",
  "Mongust",
  "Rawar",
  "Angry Luna",
  "Revolted",
  "Wikileadz",
  "Zombie Scream",
  "Zer",
  "Neokontrol",
  "N.Gin",
  "Insector",
  "Akes",
  "Acid Combo",
  "Alien Hardware",
  "Alien Techno",
  "Alien Thugz",
  "Aliensynthesis",
  "Alpscore",
  "Antagon",
  "Anticeptik",
  "Anubis",
  "Apollyon",
  "Assioma",
  "Astrologic",
  "Ataro",
  "Atim",
  "Audio Syntax",
  "Audiopathik",
  "Audiordinance",
  "Axcidus",
  "Aesop",
  "Behind Language",
  "Benjek",
  "BioChronic",
  "Biomekanik Bruno",
  "Bioronin",
  "Bombax",
  "Briskerz",
  "Btoxik",
  "Cosmo",
  "Crazy Astronaut",
  "Critical Freak",
  "Dakar",
  "Dark Jochen",
  "Dark Septum",
  "Dev",
  "Dirty Phreak",
  "Doctra",
  "Dont Panic",
  "Dustvoxx",
  "Erebor",
  "Extraterrestrial Sadhu",
  "Fele",
  "Flowrest",
  "Fobi",
  "Frenesi Hertz",
  "Fungus Funk",
  "Furious",
  "Fx23",
  "Gen Ohm",
  "Hi-Tech Nation",
  "Highcosmos",
  "Horcrux",
  "Humans on Acid",
  "Hyper Aliens",
  "Hyperactive 25",
  "Hyperpanic",
  "I Logic",
  "Iguana",
  "Ixotul",
  "Jesus Raves",
  "Karmazon",
  "Kerosene Club",
  "Ketek",
  "Killatk",
  "Kindzadza",
  "Kneether",
  "Koktavy",
  "Kopophobia",
  "Laur",
  "Lifeburst",
  "LogicUfo",
  "Loose Connection",
  "Lucid",
  "Maramba",
  "Mental Noize",
  "Mental Trauma",
  "Metaform",
  "MetaHuman",
  "Mimic Vat",
  "MinDelve",
  "Nable",
  "Narxz",
  "Neonglo",
  "Neuro Twister",
  "Neutron Star",
  "Noein",
  "Nyama",
  "Nyotech",
  "Orestis",
  "Orvytal",
  "Osiris",
  "Parabax",
  "Parandroid",
  "Pawan",
  "Psykovsky",
  "Psylocida",
  "Psynetyk",
  "Quantiko",
  "Quantum Mechanica",
  "Quantum Partickles",
  "Scalaris",
  "Selective Mood",
  "Sick Noise",
  "Sinister Realms",
  "Slaser",
  "Spagume",
  "Stranger Aeons",
  "Survival Mechanism",
  "Synthien",
  "Synthex",
  "Tazmanics",
  "Temperamental",
  "Tzolkin Project",
  "Vasco",
  "Vector",
  "Veridion Rising",
  "Voidscream",
  "Voyd Realm",
  "Wave Odyssey",
  "Will o' Wisp",
  "XYDOX",
  "Yantra",
  "Yuxibu",
  "Zip-Zap",
  "Technical Hitch",
  "Audiophatik",
  "Fagin's Reject",
  "Psynonima",
  "Psychoz",
  "Alienn",
  "Neuromotor",
  "Blasted Bindi",
  "AM",
  "Abstract Machine",
  "Alter Vu",
  "Alyshka",
  "Armienz",
  "Arnio",
  "Bernz",
  "Brainiac",
  "Buster",
  "Candy Cartel",
  "Convert-X",
  "DJ Timefly",
  "DJane MI-BOU",
  "Dr Bops",
  "Erthran",
  "Formantz",
  "Fowlowl",
  "Frostbite",
  "G-RM",
  "GENOS",
  "Gigi",
  "Gozonji",
  "Heavonoise",
  "Helber Gun",
  "Highwar",
  "Hisa",
  "Imaia",
  "Jhesha",
  "Jo Batta",
  "Khaos Sektor",
  "Klangmassaker",
  "Labrat",
  "Last Drop",
  "M-Theory",
  "Massive Noise",
  "Maze of Madness",
  "Mezcalito",
  "Misaki",
  "Mystic Pulse",
  "Neosapiens",
  "Nukleall",
  "Offlabel",
  "Parasect",
  "Philoso",
  "Pollyfonika",
  "Pyrokine",
  "STROIK",
  "Sascha",
  "Sekorsky",
  "Shred'er",
  "Sid Jenkins",
  "Spatial Plants",
  "Sun69",
  "Twisted Psychology",
  "Ugly Ducky",
  "Vibe Control",
  "Woobler",
];

const DARK_PSY_ARTIST_ROSTER = [
  "Necropsycho",
  "Dark Septum",
  "Kindzadza",
  "Psykovsky",
  "Xenomorph",
  "Para Halu",
  "The Nommos",
  "Dark Nebula",
  "Ocelot",
  "Sectio Aurea",
  "Kaos",
  "Banjhaks",
  "Muscaria",
  "Umber Sonus",
  "Propagul",
  "Makumba",
  "Antonymous",
  "Sarruma",
  "Drury Nevil",
  "Madianbrains",
  "ChromArepo",
  "Wave Riders",
  "SpectralViewer",
  "Shiibashunsuke",
  "Silent Horror",
  "Roof Raiser",
  "Digital Abstract",
  "Paul Karma",
  "OpenMind",
  "Tursiopsis",
  "Metaphyz",
  "Dohm",
  "Kerosene Club",
  "Chromatec",
  "Ectogasmics",
  "Samadhi",
  "Haunted Spectre",
  "Orestis",
  "Yaminahua",
  "Drip Drop",
  "Mikhal",
  "Zik",
  "Arjuna",
  "Yudhishthira",
  "Dark Elf",
  "Dark Whisper",
  "Alpscore",
  "Cosinus",
  "Rawar",
  "Tijah",
  "Frantic Noise",
  "Fungus Funk",
  "Derango",
  "Atriohm",
  "Audiokidnapping",
  "Mubali",
  "Penta",
  "Dark Notes",
  "Kernel Panic",
  "Penumbra",
  "Woruban",
  "Psydewise",
  "Digitalist",
  "Psysex",
  "Kasatka"
];

const SLAMBIENT_ARTIST_ROSTER = [
  "Cindervomit",
  "Braio",
  "Orcoro",
  "Groovality",
  "Phyllorum",
  "Akuma",
  "Clostridium Tetani",
  "Yamantaka",
  "MetaPsycho",
  "Paranoiac",
  "Imaraka",
  "Toadstool",
  "Dennis Antipriest",
  "Bahaael",
  "Vuttun",
  "Vutt'un",
  "VallaK",
  "Vuga",
  "VvV",
  "Peaking Gods",
  "Saucera",
  "Karaja",
  "Leonomalia",
  "Underworld Architects",
  "Dazkulleghyrth",
  "Through Dimensions",
  "Labreska",
  "NeuralKill",
  "Arundo",
  "Silesian Core Miner",
  "Walicho Digital",
  "Pumkinhead",
  "Endless Knot Collective",
  "Indaco Runa",
  "Agodark",
  "Audionimus",
  "Akephalos"
];

const STYLE_ARTIST_SEEDS = {
  psytrance: ["Astrix", "Avalon", "Vini Vici", "Blastoyz", "Electric Universe", "Tristan", "Mad Maxx", "Outsiders"],
  forest_psy: ["Atriohm", "Derango", "Arjuna", "Farebi Jalebi", "Mubali", "Ajja", "Krapul", "Psykovsky"],
  dark_psy: [...DARK_PSY_ARTIST_ROSTER],
  dark_experimental: [
    "Audiosyntax",
    "Audio Syntax",
    "Sectio Aurea",
    "Necropsycho",
    "IndacoRuna",
    "Ogoun",
    "Nyctophungi",
    "Hans Dunkelkammer",
    "Menterama",
    "Eliah",
    "Saturnin",
    "Xcursion",
    "Dark Whisper",
    "VallaK",
    "Vutt'un",
    "Vuga",
    "VvV"
  ],
  psycore: [...PSYCORE_ARTIST_ROSTER],
  full_on: [
    "Avalon",
    "Tristan",
    "Earthspace",
    "Sonic Species",
    "Burn In Noise",
    "Raja Ram",
    "Sesto Sento",
    "1200 Micrograms",
    "Faders",
    "GMS",
    "Dickster",
    "Volcano"
  ],
  full_on_night: [
    "Burn In Noise",
    "Dickster",
    "Sonic Species",
    "GMS",
    "Faders",
    "Volcano",
    "Mad Maxx"
  ],
  full_on_morning: [
    "Avalon",
    "Tristan",
    "Electric Universe",
    "Raja Ram",
    "1200 Micrograms",
    "Mad Maxx",
    "Faders"
  ],
  psy_comercial: ["Skazi", "Paranormal Attack", "Sesto Sento", "Mandragora", "Claudinho Brasil", "Vini Vici", "Blastoyz", "Vegas"],
  progressive_psy: ["Ace Ventura", "Captain Hook", "Liquid Soul", "Symbolic", "Astrix", "Perfect Stranger", "Nerso", "Morten Granau", "Vermont (BR)"],
  hi_tech: [...HITECH_ARTIST_ROSTER],
  dark_progressive: [
    "Vermont",
    "D-Nox",
    "Sensient",
    "E-Clip",
    "Kromagon",
    "Hypogeo",
    "Unseen Dimensions",
    "Slip Hypnotic",
    "Grouch",
    "Merkaba",
    "Sumiruna",
    "Evil Oil Man",
    "Molecc",
    "Dividuum",
    "Doonz",
    "AIRI",
    "Elberg",
    "Ambler",
    "Sourone",
    "Hybrid",
    "Gumnut",
    "Tetrameth",
    "Kliment",
    "Ryanosaurus",
    "Shadow Shaman",
    "ETN",
    "Hellquist",
    "Paracozm"
  ],
  goa_trance: ["Astrix", "Hallucinogen", "Goasia", "Man With No Name", "Filteria", "Khetzal", "Electric Universe", "X-Dream", "Via Axis"],
  trance_uplifting: ["Armin van Buuren", "Aly & Fila", "Above & Beyond", "Giuseppe Ottaviani", "Craig Connelly", "Ferry Corsten", "Paul van Dyk", "John O'Callaghan"],
  techno: ["ANNA", "Charlotte de Witte", "Amelie Lens", "Enrico Sangiuliano", "Adam Beyer", "Maceo Plex", "Sama Abdulhadi", "FJAAK"],
  acid_techno: ["999999999", "Emmanuel Top", "Regal", "Dax J", "Parfait", "A*S*Y*S", "Perc", "Airod"],
  hard_techno: [
    "Alignment",
    "DYEN",
    "Sara Landry",
    "I Hate Models",
    "Kobosil",
    "SPFDJ",
    "Shlomo",
    "Charlie Sparks",
    "Nico Moreno",
    "Airod",
    "Trym",
    "Fantasm",
    "6EJOU",
    "Onlynumbers",
    "CLTX",
    "Basswell",
    "Klangkuenstler",
    "Brutalismus 3000"
  ],
  minimal_techno: ["Luciano", "Rene Wise", "Richie Hawtin", "Raresh", "Priku", "Sonja Moonear", "Petre Inspirescu", "Ricardo Villalobos"],
  melodic_techno: ["Anyma", "Mind Against", "Tale Of Us", "Stephan Bodzin", "ARTBAT", "Massano", "Kevin de Vries", "Innellea"],
  industrial_techno: ["Perc", "Paula Temple", "Ancient Methods", "Rebekah", "Scalameriya", "SNTS", "AnD", "Blawan"],
  peak_time_techno: ["Adam Beyer", "Space 92", "Layton Giordani", "Mha Iri", "HI-LO", "Wehbba", "Bart Skils", "UMEK"],
  house: ["Frankie Knuckles", "Kerri Chandler", "Folamour", "Honey Dijon", "Chris Stussy", "The Martinez Brothers", "Peggy Gou", "Dennis Ferrer"],
  deep_house: ["Larry Heard", "Nora En Pure", "Ben Bohmer", "Kink", "YokoO", "Black Loops", "Atjazz", "Jimpster"],
  tech_house: [
    "Michael Bibi",
    "FISHER",
    "Chris Lake",
    "PAWSA",
    "Cloonee",
    "Wade",
    "Dennis Cruz",
    "Jamie Jones",
    "Solardo",
    "Mochakk",
    "The Martinez Brothers",
    "Marco Carola"
  ],
  progressive_house: ["Eric Prydz", "Tinlicker", "Yotto", "Nox Vahn", "Jeremy Olander", "Lane 8", "Cristoph", "Sasha"],
  afro_house: ["Black Coffee", "Caiiro", "Shimza", "Sparrow & Barbossa", "Da Capo", "Kususa", "Rampa", "Major League DJz"],
  organic_house: ["Lee Burridge", "Satori", "Monaq", "Sebastian Leger", "Pambouk", "M.O.S.", "Volen Sentir", "Hraach"],
  bass_house: ["JOYRYDE", "Habstrakt", "Jauz", "AC Slater", "Knock2", "Curbi", "Malaa", "Dr. Fresch"],
  electro_house: ["deadmau5", "Wolfgang Gartner", "Feed Me", "Knife Party", "Porter Robinson", "Boys Noize", "Zedd", "Justice"],
  drum_and_bass: ["Sub Focus", "Dimension", "Culture Shock", "Camo & Krooked", "Netsky", "Metrik", "Wilkinson", "Andy C"],
  liquid_dnb: ["Calibre", "LSB", "Etherwood", "Makoto", "Logistics", "Hybrid Minds", "Keeno", "Technimatic"],
  neurofunk: ["Noisia", "Ed Rush & Optical", "Black Sun Empire", "Mefjus", "Phace", "Spor", "Neonlight", "Agressor Bunx"],
  jump_up: ["Bou", "Serum", "Hedex", "Turno", "Profile", "Sota", "Captain Bass", "Taxman"],
  jungle: ["Shy FX", "Congo Natty", "Nia Archives", "Tim Reaper", "DJ Hype", "DJ Zinc", "Krust", "Aphrodite"],
  breakbeat: ["Bicep", "Plump DJs", "Leftfield", "Stanton Warriors", "Freestylers", "Aquasky", "Sasha Carassi", "The Crystal Method"],
  uk_garage: ["Interplanetary Criminal", "Conducta", "MJ Cole", "El-B", "DJ EZ", "Disclosure", "Oppidan", "Y U QT"],
  future_garage: ["Burial", "Synkro", "Phaeleh", "Sorrow", "Clubroot", "Vacant", "Kiasmos", "Direct"],
  dubstep: ["Skrillex", "Benga", "Skream", "Digital Mystikz", "Saka", "Ganja White Night", "Mala", "Caspa"],
  downtempo: ["Thievery Corporation", "Bonobo", "Tycho", "Emancipator", "Nightmares on Wax", "Blockhead", "Kruder & Dorfmeister", "Zero 7"],
  ambient: ["Brian Eno", "Biosphere", "Loscil", "Rival Consoles", "Nils Frahm", "Aphex Twin", "A Winged Victory for the Sullen", "Stars of the Lid"],
  slambient: [...SLAMBIENT_ARTIST_ROSTER],
  idm: ["Aphex Twin", "Autechre", "Boards of Canada", "Squarepusher", "Floating Points", "Plaid", "Clark", "Mike Paradinas"],
  electro: ["Drexciya", "Aux 88", "DJ Stingray", "The Hacker", "Jensen Interceptor", "Kraftwerk", "Helena Hauff", "Cybotron"],
  hardstyle: ["Brennan Heart", "Headhunterz", "Wildstylez", "Sub Zero Project", "D-Block & S-te-Fan", "Coone", "Da Tweekaz", "Ran-D"]
};

const SLAMBIENT_CORE_ARTISTS = [...SLAMBIENT_ARTIST_ROSTER];

const STYLE_STRICT_WHITELISTS = {
  slambient: SLAMBIENT_CORE_ARTISTS
};

const ARTIST_STYLE_OVERRIDES = {
  "kindzadza": ["dark_psy", "psycore"],
  "psykovsky": ["dark_psy", "psycore"],
  "orestis": ["dark_psy", "psycore", "hi_tech"],
  "yaminahua": ["dark_psy", "psycore"],
  "dark whisper": ["dark_psy", "psycore"],
  "dark elf": ["dark_psy", "psycore"],
  "arjuna": ["forest_psy", "dark_psy", "psycore"],
  "zik": ["psycore", "dark_psy"],
  "technical hitch": ["hi_tech"],
  "maramba": ["hi_tech"],
  "audiophatik": ["hi_tech"],
  "crazy astronaut": ["hi_tech"],
  "fagins reject": ["hi_tech"],
  "faginsreject": ["hi_tech"],
  "oxidaksi": ["hi_tech"],
  "gms": ["full_on", "full_on_night", "full_on_morning"],
  "avalon": ["full_on", "full_on_night", "full_on_morning"],
  "tristan": ["full_on", "full_on_night", "full_on_morning"],
  "earthspace": ["full_on"],
  "space tribe": ["full_on"],
  "spacetribe": ["full_on"],
  "paralocks": ["hi_tech"],
  "ace ventura": ["progressive_psy"],
  "captain hook": ["progressive_psy"],
  "liquid soul": ["progressive_psy"],
  "perfect stranger": ["progressive_psy"],
  "vermont br": ["progressive_psy"],
  "via axis": ["goa_trance"],
  "vermont": ["dark_progressive"],
  "d-nox": ["dark_progressive"],
  "sensient": ["dark_progressive"],
  "e-clip": ["dark_progressive"],
  "kromagon": ["dark_progressive"],
  "hypogeo": ["dark_progressive"],
  "unseen dimensions": ["dark_progressive"],
  "slip hypnotic": ["dark_progressive"],
  "grouch": ["dark_progressive"],
  "merkaba": ["dark_progressive"],
  "sumiruna": ["dark_progressive"],
  "evil oil man": ["dark_progressive"],
  "molecc": ["dark_progressive"],
  "dividuum": ["dark_progressive"],
  "doonz": ["dark_progressive"],
  "airi": ["dark_progressive"],
  "elberg": ["dark_progressive"],
  "ambler": ["dark_progressive"],
  "sourone": ["dark_progressive"],
  "hybrid": ["dark_progressive"],
  "gumnut": ["dark_progressive"],
  "tetrameth": ["dark_progressive"],
  "kliment": ["dark_progressive"],
  "ryanosaurus": ["dark_progressive"],
  "shadow shaman": ["dark_progressive"],
  "dubdogz": ["tech_house", "house"],
  "audio syntax": ["dark_experimental"],
  "audiosyntax": ["dark_experimental"],
  "sectio aurea": ["dark_experimental"],
  "cindervomit": ["slambient", "psycore"],
  "endless knot collective": ["slambient"],
  "phyllorum": ["slambient"],
  "indaco runa": ["slambient"],
  "agodark": ["slambient"],
  "audionimus": ["slambient"],
  "akuma": ["slambient"],
  "akephalos": ["slambient"],
  "vallak": ["slambient", "dark_experimental", "psycore"],
  "vuttun": ["slambient", "dark_experimental"],
  "vuga": ["slambient", "dark_experimental", "psycore"],
  "vvv": ["slambient", "dark_experimental"],
  "critical frequency": ["psytrance"],
  "critical frequency live": ["psytrance"],
  "solar fields": ["ambient"],
  "carbon based lifeforms": ["ambient", "downtempo"]
};

const ARTIST_CANONICAL_ORIGINS = {
  "gms": {
    country: "Israel",
    area: "",
    disambiguation: "Growling Mad Scientists (GMS) e um duo de psytrance de Israel."
  },
  "growling mad scientists": {
    country: "Israel",
    area: "",
    disambiguation: "Growling Mad Scientists (GMS) e um duo de psytrance de Israel."
  },
  "paranormal attack": {
    country: "Portugal",
    area: "Lisboa",
    disambiguation: "Paranormal Attack e um projeto portugues de psytrance ligado ao eixo full-on/comercial."
  }
};

const STYLE_ARTIST_BLOCKLIST = {
  full_on: ["kindzadza", "psykovsky", "orestis", "yaminahua", "dark whisper", "dark elf", "arjuna", "zik", "audiosyntax", "audio syntax", "sectio aurea", "necropsycho", "technical hitch", "audiophatik", "crazy astronaut", "maramba", "paralocks", "xenrox", "alienn", "insector", "virtuanoise", "arcek", "psynonima"],
  full_on_night: ["kindzadza", "psykovsky", "orestis", "yaminahua", "dark whisper", "dark elf", "arjuna", "zik", "audiosyntax", "audio syntax", "sectio aurea", "necropsycho", "technical hitch", "audiophatik", "crazy astronaut", "maramba", "paralocks", "xenrox", "alienn", "insector", "virtuanoise", "arcek", "psynonima"],
  full_on_morning: ["kindzadza", "psykovsky", "orestis", "yaminahua", "dark whisper", "dark elf", "arjuna", "zik", "audiosyntax", "audio syntax", "sectio aurea", "necropsycho", "technical hitch", "audiophatik", "crazy astronaut", "maramba", "paralocks", "xenrox", "alienn", "insector", "virtuanoise", "arcek", "psynonima"],
  hi_tech: ["kindzadza", "psykovsky", "orestis", "yaminahua", "dark whisper", "dark elf", "arjuna", "zik", "audiosyntax", "audio syntax", "sectio aurea", "necropsycho", "indacoruna", "ogoun"],
  dark_psy: ["technical hitch", "audiosyntax", "audio syntax", "audiophatik", "crazy astronaut", "oxidaksi", "fagins reject", "alienn", "xenrox"],
  psycore: ["maramba", "paralocks"],
  dark_experimental: ["technical hitch", "crazy astronaut", "audiophatik", "fagins reject", "xenrox", "alienn", "dyen", "charlotte de witte", "tristan", "earthspace"],
  hard_techno: [
    "astrix",
    "avalon",
    "tristan",
    "earthspace",
    "burn in noise",
    "sonic species",
    "gms",
    "faders",
    "raja ram",
    "1200 micrograms",
    "vini vici",
    "blastoyz",
    "mandragora",
    "skazi",
    "kindzadza",
    "psykovsky",
    "orestis",
    "technical hitch",
    "audiophatik",
    "crazy astronaut",
    "paralocks",
    "xenrox",
    "alienn",
    "insector",
    "virtuanoise",
    "arcek",
    "psynonima"
  ],
  industrial_techno: ["front 242", "nitzer ebb", "depeche mode", "front line assembly", "skinny puppy"],
  dark_progressive: [
    "gms",
    "avalon",
    "tristan",
    "earthspace",
    "sonic species",
    "burn in noise",
    "raja ram",
    "1200 micrograms",
    "faders",
    "volcano",
    "vini vici",
    "blastoyz",
    "mandragora",
    "skazi",
    "vermont br"
  ],
  slambient: [
    "astrix",
    "avalon",
    "tristan",
    "earthspace",
    "burn in noise",
    "ace ventura",
    "captain hook",
    "liquid soul",
    "perfect stranger",
    "vini vici",
    "blastoyz",
    "gms",
    "solar fields",
    "carbon based lifeforms",
    "aes dana",
    "connectohm",
    "connect ohm",
    "bluetech",
    "technical hitch",
    "maramba",
    "audiophatik",
    "crazy astronaut"
  ]
};

const STRICT_DYNAMIC_BPM_STYLES = new Set([
  "psycore",
  "hi_tech",
  "dark_experimental",
  "slambient",
  "minimal_techno",
  "acid_techno",
  "hard_techno",
  "dark_psy",
  "full_on",
  "full_on_night",
  "full_on_morning"
]);
const STRICT_FAMILY_SEED_STYLES = new Set(["dark_progressive", "dark_psy", "dark_experimental", "psycore", "hi_tech", "slambient", "acid_techno", "hard_techno", "industrial_techno", "full_on", "full_on_night", "full_on_morning"]);
const STRICT_ARTIST_MATCH_STYLES = new Set(["dark_progressive", "dark_psy", "dark_experimental", "psycore", "hi_tech", "slambient", "acid_techno", "hard_techno", "full_on", "full_on_night", "full_on_morning", "progressive_psy", "psy_comercial", "industrial_techno"]);
const LOCK_SEED_FROM_CATALOG_STYLES = new Set(["dark_progressive", "dark_psy", "dark_experimental", "psycore", "hi_tech", "slambient", "acid_techno", "hard_techno", "full_on", "full_on_night", "full_on_morning", "progressive_psy", "psy_comercial", "industrial_techno"]);
const NO_CROSS_STYLE_FALLBACK_STYLES = new Set(["psycore"]);
const NO_BROAD_STYLE_HYDRATION_STYLES = new Set(["ambient", "downtempo"]);
const TECHNO_CROSSOVER_FORBIDDEN_TERMS = [
  "trap",
  "hip hop",
  "hip-hop",
  "moombahton",
  "reggaeton",
  "dancehall",
  "drill",
  "future bass",
  "big room",
  "brostep",
  "dubstep",
  "edm trap",
  "waka flocka",
  "yellow claw"
];
const TECHNO_REQUIRED_SIGNAL_TERMS = {
  techno: ["techno", "detroit techno", "berlin techno", "warehouse techno", "raw techno"],
  acid_techno: ["acid techno", "acid", "303", "techno"],
  hard_techno: ["hard techno", "schranz", "hard industrial", "techno"],
  minimal_techno: ["minimal techno", "minimal", "microhouse", "techno"],
  melodic_techno: ["melodic techno", "melodic", "afterlife", "techno"],
  industrial_techno: ["industrial techno", "industrial", "ebm techno", "techno"],
  peak_time_techno: ["peak time techno", "driving techno", "peak time", "techno"]
};
const BASS_REQUIRED_SIGNAL_TERMS = {
  dubstep: ["dubstep", "brostep", "riddim", "drumstep", "tearout", "wobble", "bass music"],
  drum_and_bass: ["drum and bass", "dnb"],
  liquid_dnb: ["liquid dnb", "liquid drum and bass", "drum and bass", "dnb"],
  neurofunk: ["neurofunk", "drum and bass", "dnb"],
  jump_up: ["jump up", "drum and bass", "dnb"],
  jungle: ["jungle", "drum and bass", "dnb", "amen"],
  breakbeat: ["breakbeat", "breaks"],
  uk_garage: ["uk garage", "garage", "2 step", "2step"],
  future_garage: ["future garage", "garage"]
};
const PSYTRANCE_REQUIRED_SIGNAL_TERMS = [
  "psytrance",
  "psy trance",
  "psy",
  "goa",
  "forest psy",
  "dark psy",
  "full on",
  "fullon",
  "hitech",
  "hi tech",
  "progressive psy"
];
const STYLE_FORBIDDEN_SIGNAL_TERMS = {
  techno: [...TECHNO_CROSSOVER_FORBIDDEN_TERMS],
  minimal_techno: [...TECHNO_CROSSOVER_FORBIDDEN_TERMS],
  melodic_techno: [...TECHNO_CROSSOVER_FORBIDDEN_TERMS],
  peak_time_techno: [...TECHNO_CROSSOVER_FORBIDDEN_TERMS],
  acid_techno: [...TECHNO_CROSSOVER_FORBIDDEN_TERMS],
  industrial_techno: [...TECHNO_CROSSOVER_FORBIDDEN_TERMS],
  hard_techno: [
    ...TECHNO_CROSSOVER_FORBIDDEN_TERMS,
    "psytrance",
    "full on",
    "fullon",
    "dark psy",
    "darkpsy",
    "forest psy",
    "forestpsy",
    "hitech",
    "hi tech",
    "goa",
    "psycore",
    "slambient",
    "progressive psy",
    "psy comercial",
    "psy commercial",
    "chacota",
    "chacotas"
  ]
};
const STYLE_REQUIRED_LABEL_TERMS = {
  slambient: ["endless knot"]
};
const SPIRIT_UNLOCK_TARGET = 10;
const SPIRIT_RANK_TIERS = [
  { likes: 10, key: "spiritRankUnlocked" },
  { likes: 50, key: "spiritRankNovice" },
  { likes: 120, key: "spiritRankResident" },
  { likes: 250, key: "spiritRankMaster" }
];
const MUSICAL_SPIRITS = [
  {
    id: "ritual_cosmico",
    image: "assets/spirits/ritual_cosmico.svg",
    styleWeights: {
      psytrance: 2.4,
      forest_psy: 2.6,
      full_on: 2.9,
      progressive_psy: 2.3,
      psy_comercial: 2,
      goa_trance: 2.8,
      trance_uplifting: 1.8
    },
    copy: {
      pt: {
        name: "Xamã Cósmico",
        archetype: "Ritual harmônico",
        description: "Personalidade expansiva e visionária. Você organiza camadas melódicas, conduz tensão emocional e cria momentos de catarse psicodélica com clareza e intenção.",
        cardDescription: "Ritual harmônico: progressão melódica, tensão emocional e catarse psicodélica."
      },
      en: {
        name: "Cosmic Shaman",
        archetype: "Dancefloor ritual",
        description: "You connect melodic psy, full-on, and goa like someone leading a dancefloor ceremony: clean builds, perfectly timed euphoria, and hooks that lock the crowd together. Your ear favors harmonic progression, emotional lifts, and memorable turns. When tension rises, you know the exact moment to open the portal."
      },
      es: {
        name: "Chamán Cósmico",
        archetype: "Ritual de pista",
        description: "Conectas psy melódico, full-on y goa como quien guía un ritual de pista: builds limpios, euforia en el punto exacto y ganchos que unen a la crowd. Tu oído prioriza progresión armónica, lifts emocionales y giros memorables. Cuando sube la tensión, sabes exactamente cuándo abrir el portal."
      }
    }
  },
  {
    id: "alquimista_sombrio",
    image: "assets/spirits/alquimista_sombrio.svg",
    styleWeights: {
      dark_psy: 3,
      dark_experimental: 3.2,
      dark_progressive: 2.6,
      slambient: 3.4
    },
    copy: {
      pt: {
        name: "Alquimista Sombrio",
        archetype: "Arquitetura noturna",
        description: "Personalidade densa e imersiva. Você trabalha com drones obscuros, subgrave contínuo e texturas profundas, construindo transe hipnótico em camadas.",
        cardDescription: "Arquitetura noturna: drones densos, pressão contínua e transe hipnótico."
      },
      en: {
        name: "Shadow Alchemist",
        archetype: "Shadow architecture",
        description: "You dive into dark psy and slambient in search of hypnotic layers, dense low end, and sustained ritual tension. You catch micro-textures, shadow details, and long-form psychedelic storytelling without losing pressure. Your edge is turning sonic depth into controlled trance."
      },
      es: {
        name: "Alquimista Sombrio",
        archetype: "Arquitectura de sombra",
        description: "Te sumerges en dark psy y slambient buscando capas hipnóticas, graves densos y atmósferas de tensión continua. Detectas microtexturas, detalles oscuros y narrativas psicodélicas largas sin perder presión. Tu diferencial es convertir profundidad sonora en trance controlado."
      }
    }
  },
  {
    id: "acelerador_quantico",
    image: "assets/spirits/acelerador_quantico.svg",
    styleWeights: {
      hi_tech: 3.6,
      psycore: 3.8
    },
    copy: {
      pt: {
        name: "Acelerador Quântico",
        archetype: "Precisão extrema",
        description: "Personalidade intensa e analítica. Você prefere estruturas de alta velocidade, recortes microscópicos e impacto seco, mantendo definição mesmo em máxima complexidade.",
        cardDescription: "Precisão extrema: velocidade alta, recortes cirúrgicos e impacto seco."
      },
      en: {
        name: "Quantum Accelerator",
        archetype: "Extreme speed",
        description: "You thrive in the extreme hi-tech and psycore zone, where ultra-fast BPM, surgical edits, and hard impact must stay crystal clear. Your ear catches tight kick control, hyperactive lines, and pattern switches in milliseconds. This is technical precision under pure dancefloor aggression."
      },
      es: {
        name: "Acelerador Cuántico",
        archetype: "Velocidad extrema",
        description: "Te mueves en la zona extrema de hi-tech y psycore, donde BPM acelerado, cortes quirúrgicos e impacto agresivo deben convivir con claridad total. Tu oído detecta kick firme, líneas nerviosas y cambios de patrón en milisegundos. Es precisión técnica en pleno caos de pista."
      }
    }
  },
  {
    id: "engenheiro_groove",
    image: "assets/spirits/engenheiro_groove.svg",
    styleWeights: {
      tech_house: 3.3,
      house: 2.8,
      bass_house: 2.5,
      progressive_house: 2.1,
      electro_house: 1.9
    },
    copy: {
      pt: {
        name: "Engenheiro do Groove",
        archetype: "Pulso refinado",
        description: "Personalidade rítmica e minimalista. Você valoriza groove constante, swing limpo e grave controlado, com foco em fluidez, equilíbrio e elegância sonora.",
        cardDescription: "Pulso refinado: groove redondo, swing limpo e grave controlado."
      },
      en: {
        name: "Groove Engineer",
        archetype: "Dancefloor control",
        description: "You read house and tech house through movement: rounded groove, calibrated swing, and low-end that can hold a floor for hours. You value clean timbre, call-and-response phrasing, and transitions that never break flow. Your strength is elegant rhythmic control."
      },
      es: {
        name: "Ingeniero del Groove",
        archetype: "Control de pista",
        description: "Lees house y tech house con el cuerpo: groove redondo, swing calibrado y low-end que sostiene la pista durante horas. Valoras timbre limpio, dinámica de respuesta y transiciones que no rompen el flujo. Tu poder es control rítmico con elegancia."
      }
    }
  },
  {
    id: "arquiteto_hipnotico",
    image: "assets/spirits/arquiteto_hipnotico.svg",
    styleWeights: {
      techno: 2.9,
      minimal_techno: 2.6,
      melodic_techno: 2.3,
      hard_techno: 3,
      acid_techno: 2.8,
      industrial_techno: 3.1,
      peak_time_techno: 2.7
    },
    copy: {
      pt: {
        name: "Arquiteto Hipnótico",
        archetype: "Tensão hipnótica",
        description: "Personalidade estratégica e imersiva. Você constrói narrativa por repetição inteligente, variação tímbrica e liberações calculadas, mantendo foco contínuo de escuta.",
        cardDescription: "Tensão hipnótica: repetição inteligente, camadas evolutivas e release calculado."
      },
      en: {
        name: "Hypnotic Architect",
        archetype: "Trance engineering",
        description: "You build modern trance energy from hypnotic, acid, and hard techno by stacking tension through intelligent repetition and releasing it at the exact peak. You notice percussion nuance, filter automation, and large-room stereo design. Your profile is emotional engineering with technical precision."
      },
      es: {
        name: "Arquitecto Hipnótico",
        archetype: "Ingeniería de trance",
        description: "Construyes trance moderno desde techno hipnótico, acid y hard, acumulando tensión con repetición inteligente y resolviendo en el pico exacto. Detectas matices de percusión, automatizaciones de filtro y diseño estéreo de gran pista. Tu perfil es ingeniería emocional con precisión técnica."
      }
    }
  },
  {
    id: "cacador_bass",
    image: "assets/spirits/cacador_bass.svg",
    styleWeights: {
      drum_and_bass: 3.2,
      liquid_dnb: 2.4,
      neurofunk: 3.4,
      jump_up: 3.1,
      jungle: 2.7,
      dubstep: 2.8,
      breakbeat: 2.1
    },
    copy: {
      pt: {
        name: "Caçador de Bass",
        archetype: "Impacto de baixa frequência",
        description: "Personalidade física e cirúrgica. Você prioriza subgrave com definição, transientes firmes e contraste dinâmico, buscando impacto sem mascarar os detalhes.",
        cardDescription: "Impacto de baixa frequência: subgrave físico, transientes firmes e contraste dinâmico."
      },
      en: {
        name: "Bass Hunter",
        archetype: "Rhythmic impact",
        description: "You hunt impact in dnb, neurofunk, and bass music through physical sub-bass, broken groove, and signature drop architecture. You notice drum design, silence-to-impact contrast, and mix weight at the exact threshold. Your instinct is making the sound system breathe pressure."
      },
      es: {
        name: "Cazador de Bass",
        archetype: "Impacto rítmico",
        description: "Buscas impacto en dnb, neurofunk y bass music con subgrave físico, groove quebrado y drops con firma. Percibes diseño de batería, contraste entre silencio y golpe, y peso de mezcla en el punto justo. Tu instinto es hacer que el sound system respire presión."
      }
    }
  },
  {
    id: "viajante_organico",
    image: "assets/spirits/viajante_organico.svg",
    styleWeights: {
      ambient: 2.8,
      downtempo: 2.7,
      organic_house: 3.1,
      deep_house: 2.6,
      afro_house: 2.8
    },
    copy: {
      pt: {
        name: "Viajante Orgânico",
        archetype: "Fluxo contemplativo",
        description: "Personalidade sensorial e atmosférica. Você prefere texturas orgânicas, calor analógico e evolução lenta, valorizando profundidade emocional e espaço de respiração.",
        cardDescription: "Fluxo contemplativo: textura orgânica, calor analógico e profundidade emocional."
      },
      en: {
        name: "Organic Voyager",
        archetype: "Sensory flow",
        description: "You gravitate toward ambient, downtempo, and organic house journeys with analog warmth, breathing space, and gradual emotional movement. You notice natural textures, subtle percussion, and melodies that open mental landscapes. Your signature is emotional depth with refined timbral sensitivity."
      },
      es: {
        name: "Viajero Orgánico",
        archetype: "Flujo sensorial",
        description: "Prefieres viajes de ambient, downtempo y house orgánico con calidez analógica, espacios de respiro y evolución emocional. Detectas texturas naturales, percusiones sutiles y melodías que abren paisaje mental. Tu rasgo es profundidad emocional con sensibilidad tímbrica refinada."
      }
    }
  },
  {
    id: "explorador_fractal",
    image: "assets/spirits/explorador_fractal.svg",
    styleWeights: {
      idm: 3.4,
      electro: 2.9,
      uk_garage: 2.4,
      future_garage: 2.7,
      progressive_house: 1.6
    },
    copy: {
      pt: {
        name: "Explorador Fractal",
        archetype: "Inovação fractal",
        description: "Personalidade curiosa e experimental. Você busca assimetria, microdetalhe e linguagem híbrida, favorecendo obras que surpreendem sem perder coerência estética.",
        cardDescription: "Inovação fractal: assimetria rítmica, microdetalhe e ousadia estrutural."
      },
      en: {
        name: "Fractal Explorer",
        archetype: "Frontier curation",
        description: "You live on the frontier between IDM, electro, and experimental hybrids, searching for unlikely cuts, asymmetry, and microscopic sound-design detail. You value tracks that surprise without losing structural coherence. Your edge is high-risk curation with a real ear for innovation."
      },
      es: {
        name: "Explorador Fractal",
        archetype: "Curaduría de frontera",
        description: "Habitas la frontera entre IDM, electro e híbridos experimentales, buscando cortes improbables, asimetrías y microdetalle de diseño sonoro. Disfrutas cuando una pista sorprende sin perder coherencia estructural. Tu diferencial es curaduría de riesgo con oído para innovación real."
      }
    }
  }
];

const SPIRIT_VISUAL_QUERIES = {
  ritual_cosmico: "psytrance festival visualizer 4k",
  alquimista_sombrio: "dark psy atmospheric visualizer",
  acelerador_quantico: "hitech psytrance visualizer",
  engenheiro_groove: "tech house club visualizer",
  arquiteto_hipnotico: "hypnotic techno visualizer",
  cacador_bass: "drum and bass neurofunk visualizer",
  viajante_organico: "organic downtempo visualizer",
  explorador_fractal: "idm electronic abstract visualizer"
};

const SPIRIT_VISUAL_THEMES = {
  ritual_cosmico: { a: "#6effdc", b: "#61bfff", c: "#9f7bff", d: "#0b1a34" },
  alquimista_sombrio: { a: "#6affde", b: "#4d95ff", c: "#7f4cff", d: "#080d24" },
  acelerador_quantico: { a: "#72fff4", b: "#4fc0ff", c: "#ffd778", d: "#07122a" },
  engenheiro_groove: { a: "#84ffcf", b: "#66e0ff", c: "#4a7fff", d: "#061829" },
  arquiteto_hipnotico: { a: "#6cecff", b: "#4f9dff", c: "#8ea9ff", d: "#08152f" },
  cacador_bass: { a: "#86f2ff", b: "#6895ff", c: "#ff8df8", d: "#0a1430" },
  viajante_organico: { a: "#8bf7d8", b: "#77b9ff", c: "#9debb3", d: "#082036" },
  explorador_fractal: { a: "#9be7ff", b: "#6e8fff", c: "#8d79ff", d: "#0a1638" }
};

const STYLE_SEED_BACKFILL = {
  dark_psy: [...DARK_PSY_ARTIST_ROSTER],
  dark_experimental: ["Necropsycho", "Ogoun", "Nyctophungi", "Menterama", "Eliah", "Saturnin", "Xcursion"],
  slambient: [...SLAMBIENT_ARTIST_ROSTER],
  psycore: [...PSYCORE_ARTIST_ROSTER],
  hi_tech: [...HITECH_ARTIST_ROSTER],
  full_on: ["Mad Maxx", "Space Tribe", "Avalon", "Tristan", "Earthspace", "Sonic Species", "GMS", "Faders", "Raja Ram"],
  full_on_night: ["Burn In Noise", "Dickster", "Sonic Species", "GMS", "Volcano", "Mad Maxx", "Faders"],
  full_on_morning: ["Avalon", "Tristan", "Electric Universe", "Raja Ram", "1200 Micrograms", "Mad Maxx", "Faders"],
  hard_techno: ["Alignment", "DYEN", "Sara Landry", "I Hate Models", "Kobosil", "SPFDJ", "Shlomo", "Charlie Sparks", "Nico Moreno", "Airod", "Trym", "Fantasm", "6EJOU", "Onlynumbers", "CLTX", "Basswell", "Klangkuenstler", "Brutalismus 3000"],
  tech_house: ["Mochakk", "Marco Carola", "Hot Since 82", "Green Velvet", "Mason Collective", "Loco Dice", "Dom Dolla"],
  techno: ["ANNA", "Charlotte de Witte", "Amelie Lens", "Adam Beyer", "Enrico Sangiuliano", "Maceo Plex", "Sama Abdulhadi"]
};

const FAMILY_SEED_FALLBACK = {
  psytrance: [
    "Astrix",
    "Avalon",
    "Tristan",
    "Earthspace",
    "Burn In Noise",
    "Vini Vici",
    "Blastoyz",
    "Captain Hook",
    "Ace Ventura",
    "Liquid Soul",
    "Perfect Stranger",
    "Outsiders",
    "Sonic Species",
    "GMS",
    "Faders",
    "Mad Maxx",
    "Psykovsky",
    "Kindzadza",
    "Orestis",
    "Dark Whisper",
    "Necropsycho",
    "Sectio Aurea",
    "Audiophatik",
    "Technical Hitch",
    "Cosmo",
    "Mandragora",
    "Skazi"
  ],
  techno: ["ANNA", "Charlotte de Witte", "Amelie Lens", "Adam Beyer", "Enrico Sangiuliano", "Maceo Plex", "Sama Abdulhadi", "FJAAK", "Dax J", "Perc", "Kobosil", "Space 92", "Layton Giordani", "Anyma", "ARTBAT", "Mind Against", "Luciano", "Richie Hawtin", "Paula Temple", "SNTS"],
  house: ["Frankie Knuckles", "Kerri Chandler", "Honey Dijon", "Chris Stussy", "Michael Bibi", "FISHER", "Chris Lake", "PAWSA", "Cloonee", "Wade", "Dennis Cruz", "Jamie Jones", "Marco Carola", "The Martinez Brothers", "Black Coffee", "Caiiro", "Lee Burridge", "Satori", "Nora En Pure", "Lane 8"],
  dnb: ["Sub Focus", "Dimension", "Culture Shock", "Camo & Krooked", "Netsky", "Metrik", "Wilkinson", "Calibre", "LSB", "Hybrid Minds", "Noisia", "Ed Rush & Optical", "Black Sun Empire", "Mefjus", "Phace", "Spor", "Bou", "Serum", "Hedex", "Shy FX"],
  bass_music: ["Skrillex", "Benga", "Skream", "Digital Mystikz", "Mala", "Ganja White Night", "Bicep", "Plump DJs", "Stanton Warriors", "Interplanetary Criminal", "Conducta", "MJ Cole", "Disclosure", "Burial", "Phaeleh", "Sorrow", "Clubroot", "Vacant", "DJ EZ", "Oppidan"],
  leftfield: ["Brian Eno", "Biosphere", "Loscil", "Rival Consoles", "Nils Frahm", "Aphex Twin", "Autechre", "Boards of Canada", "Squarepusher", "Floating Points", "Solar Fields", "Carbon Based Lifeforms", "Aes Dana", "Connect.Ohm", "Bluetech", "Thievery Corporation", "Bonobo", "Tycho", "Emancipator", "Nightmares on Wax"],
  hard_dance: ["Brennan Heart", "Headhunterz", "Wildstylez", "Sub Zero Project", "D-Block & S-te-Fan", "Coone", "Da Tweekaz", "Noisecontrollers", "Code Black", "Atmozfears", "Adaro", "Phuture Noize", "Frontliner", "Ran-D", "Warface", "Delete", "Frequencerz", "B-Front", "TNT", "Darren Styles"]
};

const ARTIST_EXTENDED_PROFILES = {
  cindervomit: {
    pt: "Origem: Brasil, circuito underground psicodélico. Background: Cindervomit desenvolve slambient acelerado com desenho sonoro sombrio, foco em textura e pressão de pista. Projetos e colaborações: atua em lançamentos ligados ao núcleo The Endless Knot e costuma aparecer em curadorias híbridas entre dark ambient, psycore e experimentação ritual.",
    en: "Origin: Brazil, underground psychedelic circuit. Background: Cindervomit develops high-speed slambient with dark sound design, textured layers, and dancefloor pressure. Projects and collaborations: appears in releases connected to The Endless Knot nucleus and in hybrid curation between dark ambient, psycore, and ritual experimentation.",
    es: "Origen: Brasil, circuito psicodélico underground. Background: Cindervomit desarrolla slambient acelerado con diseño sonoro oscuro, capas texturales y presión de pista. Proyectos y colaboraciones: aparece en lanzamientos del núcleo The Endless Knot y en curadurías híbridas entre dark ambient, psycore y experimentación ritual."
  },
  phyllorum: {
    pt: "Origem: núcleo The Endless Knot (cena psy experimental). Background: Phyllorum trabalha slambient com recortes rítmicos, ambiência densa e transições de alta intensidade. Projetos e colaborações: participa de faixas curatoriais do coletivo e de colaborações voltadas para cruzamentos entre dark psy e arquitetura sonora textural.",
    en: "Origin: The Endless Knot nucleus (experimental psy scene). Background: Phyllorum builds slambient with rhythmic cuts, dense ambience, and high-intensity transitions. Projects and collaborations: appears in collective curated cuts and collaborations crossing dark psy with textural sound architecture.",
    es: "Origen: núcleo The Endless Knot (escena psy experimental). Background: Phyllorum construye slambient con cortes rítmicos, atmósfera densa y transiciones de alta intensidad. Proyectos y colaboraciones: participa en tracks curatoriales del colectivo y colaboraciones entre dark psy y arquitectura sonora textural."
  },
  "endless knot collective": {
    pt: "Origem: coletivo internacional com base em curadoria psicodélica extrema. Background: Endless Knot Collective atua como frente artística de lançamentos slambient e dark experimental, priorizando faixas de narrativa longa e identidade ritual. Projetos e colaborações: reúne diferentes produtores da label em compilações, collabs e sessões especiais de pesquisa sonora.",
    en: "Origin: international collective focused on extreme psychedelic curation. Background: Endless Knot Collective acts as an artistic front for slambient and dark-experimental releases, prioritizing long-form narrative tracks and ritual identity. Projects and collaborations: brings label producers together in compilations, collabs, and special sound-research sessions.",
    es: "Origen: colectivo internacional enfocado en curaduría psicodélica extrema. Background: Endless Knot Collective funciona como frente artística de lanzamientos slambient y dark experimental, priorizando tracks de narrativa larga e identidad ritual. Proyectos y colaboraciones: reúne productores del sello en compilaciones, collabs y sesiones especiales de investigación sonora."
  },
  "indaco runa": {
    pt: "Origem: circuito experimental ligado à The Endless Knot. Background: Indaco Runa combina atmosfera obscura, texturas viscosas e pulsação acelerada para momentos de imersão profunda. Projetos e colaborações: aparece em faixas de catálogo slambient e em colaborações de linguagem híbrida entre ambient sombrio e psy de pista.",
    en: "Origin: experimental circuit linked to The Endless Knot. Background: Indaco Runa blends dark atmosphere, viscous textures, and fast pulse for deep immersion moments. Projects and collaborations: appears in slambient catalog tracks and hybrid collaborations between dark ambient and dancefloor psy.",
    es: "Origen: circuito experimental vinculado a The Endless Knot. Background: Indaco Runa mezcla atmósfera oscura, texturas viscosas y pulso acelerado para momentos de inmersión profunda. Proyectos y colaboraciones: aparece en tracks del catálogo slambient y colaboraciones híbridas entre ambient oscuro y psy de pista."
  },
  agodark: {
    pt: "Origem: cena psy extrema com vínculo ao eixo The Endless Knot. Background: Agodark assina slambient corrosivo, rápido e agressivo, com foco em tensão contínua de pista. Projetos e colaborações: participa de lançamentos coletivos da label e de collabs orientadas para faixas de transição entre dark e psycore.",
    en: "Origin: extreme psy scene tied to The Endless Knot axis. Background: Agodark delivers corrosive, fast, and aggressive slambient with continuous dancefloor tension. Projects and collaborations: appears in collective label releases and collabs designed for transitions between dark and psycore.",
    es: "Origen: escena psy extrema vinculada al eje The Endless Knot. Background: Agodark ofrece slambient corrosivo, rápido y agresivo, con tensión continua de pista. Proyectos y colaboraciones: participa en lanzamientos colectivos del sello y collabs orientadas a transiciones entre dark y psycore."
  },
  audionimus: {
    pt: "Origem: circuito slambient underground associado à The Endless Knot. Background: Audionimus trabalha cortes mecânicos, texturas industriais e groove acelerado em arranjos de alta densidade. Projetos e colaborações: presente em compilações da label e em projetos experimentais que exploram o limite entre ambiência escura e impacto rítmico.",
    en: "Origin: underground slambient circuit associated with The Endless Knot. Background: Audionimus explores mechanical cuts, industrial textures, and fast groove in high-density arrangements. Projects and collaborations: appears in label compilations and experimental projects exploring the boundary between dark ambience and rhythmic impact.",
    es: "Origen: circuito slambient underground asociado a The Endless Knot. Background: Audionimus explora cortes mecánicos, texturas industriales y groove acelerado en arreglos de alta densidad. Proyectos y colaboraciones: participa en compilaciones del sello y proyectos experimentales que exploran el límite entre ambient oscuro e impacto rítmico."
  },
  akuma: {
    pt: "Origem: cena psy extrema com presença em curadorias The Endless Knot. Background: Akuma segue linha slambient de alta velocidade com recortes secos, tensão prolongada e assinatura sombria. Projetos e colaborações: participa de catálogos coletivos e colaborações voltadas a momentos de pico dentro da vertente experimental.",
    en: "Origin: extreme psy scene with presence in The Endless Knot curation. Background: Akuma follows a high-speed slambient line with dry cuts, prolonged tension, and dark signature. Projects and collaborations: appears in collective catalogs and collabs aimed at peak moments in the experimental branch.",
    es: "Origen: escena psy extrema con presencia en curadurías de The Endless Knot. Background: Akuma sigue una línea slambient de alta velocidad con cortes secos, tensión prolongada y firma oscura. Proyectos y colaboraciones: participa en catálogos colectivos y collabs para momentos de pico en la vertiente experimental."
  },
  akephalos: {
    pt: "Origem: circuito experimental psicodélico ligado à The Endless Knot. Background: Akephalos desenvolve slambient textural com foco em construção hipnótica e andamento acelerado. Projetos e colaborações: integra lançamentos do selo e trabalhos colaborativos com artistas da mesma vertente de pesquisa sonora extrema.",
    en: "Origin: experimental psychedelic circuit linked to The Endless Knot. Background: Akephalos develops textured slambient focused on hypnotic construction and fast pacing. Projects and collaborations: appears in label releases and collaborative works with artists from the same extreme sound-research branch.",
    es: "Origen: circuito psicodélico experimental vinculado a The Endless Knot. Background: Akephalos desarrolla slambient textural enfocado en construcción hipnótica y tempo acelerado. Proyectos y colaboraciones: participa en lanzamientos del sello y trabajos colaborativos con artistas de la misma vertiente extrema."
  },
  vallak: {
    pt: "Origem: Brasil (SP). Background: VallaK atua no eixo dark/slambient com desenho rítmico denso e recorte experimental, transitando entre darkpsy e psycore em diferentes colaborações. Projetos e colaborações: aparece em releases ligados ao núcleo The Endless Knot e em collabs recentes com artistas da nova geração underground.",
    en: "Origin: Brazil (Sao Paulo). Background: VallaK works in the dark/slambient axis with dense rhythmic design and experimental cuts, moving between darkpsy and psycore in different collaborations. Projects and collaborations: appears in releases connected to The Endless Knot nucleus and in recent collabs with the new underground generation.",
    es: "Origen: Brasil (Sao Paulo). Background: VallaK trabaja en el eje dark/slambient con diseño rítmico denso y recorte experimental, moviéndose entre darkpsy y psycore en distintas colaboraciones. Proyectos y colaboraciones: aparece en lanzamientos vinculados al núcleo The Endless Knot y en collabs recientes con la nueva generación underground."
  },
  vuttun: {
    pt: "Origem: Brasil. Background: Vutt'un combina slambient acelerado com estética dark experimental e texturas de alta pressão para pista. Projetos e colaborações: vem aparecendo em material recente com foco em narrativa sombria e construção híbrida entre ambiência ritual e impacto rítmico.",
    en: "Origin: Brazil. Background: Vutt'un combines high-speed slambient with dark-experimental aesthetics and high-pressure textures for dancefloors. Projects and collaborations: has appeared in recent material focused on dark narrative and hybrid construction between ritual ambience and rhythmic impact.",
    es: "Origen: Brasil. Background: Vutt'un combina slambient acelerado con estética dark experimental y texturas de alta presión para pista. Proyectos y colaboraciones: viene apareciendo en material reciente con foco en narrativa oscura y construcción híbrida entre ambient ritual e impacto rítmico."
  },
  vuga: {
    pt: "Origem: Brasil. Background: Vuga aparece em recortes slambient/dark experimental com assinatura agressiva e foco em transições de alta energia. Projetos e colaborações: participa de projetos colaborativos recentes no mesmo núcleo estético, com lançamentos em plataformas abertas.",
    en: "Origin: Brazil. Background: Vuga appears in slambient/dark-experimental cuts with aggressive signature and focus on high-energy transitions. Projects and collaborations: participates in recent collaborative projects in the same aesthetic nucleus, with releases on open platforms.",
    es: "Origen: Brasil. Background: Vuga aparece en cortes slambient/dark experimental con firma agresiva y foco en transiciones de alta energía. Proyectos y colaboraciones: participa en proyectos colaborativos recientes del mismo núcleo estético, con lanzamientos en plataformas abiertas."
  },
  vvv: {
    pt: "Origem: projeto colaborativo brasileiro. Background: VvV funciona como plataforma criativa entre artistas do eixo dark/slambient, reunindo abordagem experimental e alta intensidade de pista. Projetos e colaborações: os lançamentos recentes reforçam o caráter coletivo e a linguagem híbrida entre dark experimental e slambient.",
    en: "Origin: Brazilian collaborative project. Background: VvV operates as a creative platform among dark/slambient artists, joining experimental approach with high dancefloor intensity. Projects and collaborations: recent releases reinforce the collective character and hybrid language between dark experimental and slambient.",
    es: "Origen: proyecto colaborativo brasileño. Background: VvV funciona como plataforma creativa entre artistas del eje dark/slambient, uniendo enfoque experimental y alta intensidad de pista. Proyectos y colaboraciones: los lanzamientos recientes refuerzan el carácter colectivo y el lenguaje híbrido entre dark experimental y slambient."
  },
  "critical frequency": {
    pt: "Origem: Brasil (projeto emergente). Background: Critical Frequency atua no eixo psytrance com foco em linhas hipnóticas e pressão de pista, com material recente em plataformas abertas. Projetos e colaborações: segue em fase de crescimento de catálogo, com sinais de lançamentos novos no ciclo mais recente.",
    en: "Origin: Brazil (emerging project). Background: Critical Frequency operates in the psytrance axis focused on hypnotic lines and dancefloor pressure, with recent material on open platforms. Projects and collaborations: still in a catalog-growth phase, with signals of new releases in the latest cycle.",
    es: "Origen: Brasil (proyecto emergente). Background: Critical Frequency opera en el eje psytrance con foco en líneas hipnóticas y presión de pista, con material reciente en plataformas abiertas. Proyectos y colaboraciones: sigue en fase de crecimiento de catálogo, con señales de lanzamientos nuevos en el ciclo más reciente."
  },
  "chris stussy": {
    pt: "Origem: Países Baixos. Background: Chris Stussy ganhou projeção na cena house/tech-house com groove seco, linhas minimalistas e leitura refinada de pista. Projetos e colaborações: além dos lançamentos autorais, circula em labels e showcases do circuito europeu e colabora com artistas da escola groove-oriented de clube.",
    en: "Origin: Netherlands. Background: Chris Stussy rose in the house/tech-house scene with dry groove, minimalist lines, and refined dancefloor reading. Projects and collaborations: beyond solo releases, he appears in key European labels/showcases and collaborates with groove-oriented club artists.",
    es: "Origen: Países Bajos. Background: Chris Stussy creció en la escena house/tech-house con groove seco, líneas minimalistas y lectura refinada de pista. Proyectos y colaboraciones: además de lanzamientos propios, participa en sellos/showcases europeos y colabora con artistas orientados al groove de club."
  },
  "amelie lens": {
    pt: "Origem: Bélgica (Limburgo). Background: Amelie Lens se consolidou como um dos maiores nomes do techno contemporâneo com sets de alta energia, estética hipnótica e seleção voltada para pista grande. Projetos e colaborações: além da carreira como DJ/produtora, desenvolve curadoria própria pela EXHALE (label, eventos e rádio), impulsionando novos artistas e colaborações com nomes centrais do techno europeu.",
    en: "Origin: Belgium (Limburg). Background: Amelie Lens became one of the leading names in contemporary techno through high-energy sets, hypnotic aesthetics, and dancefloor-focused selection. Projects and collaborations: beyond her DJ/producer career, she runs the EXHALE ecosystem (label, events, and radio), pushing new artists and collaborations with key names in European techno.",
    es: "Origen: Bélgica (Limburgo). Background: Amelie Lens se consolidó como uno de los grandes nombres del techno contemporáneo con sets de alta energía, estética hipnótica y selección orientada a pista. Proyectos y colaboraciones: además de su carrera como DJ/productora, lidera el ecosistema EXHALE (sello, eventos y radio), impulsando artistas nuevos y colaboraciones con nombres clave del techno europeo."
  },
  "charlotte de witte": {
    pt: "Origem: Bélgica (Ghent). Background: Charlotte de Witte é referência global em techno e acid techno, reconhecida por construção de tensão contínua, timbres ácidos e presença forte em festivais e clubes. Projetos e colaborações: comanda o selo KNTXT e colabora em diferentes formatos de lançamento e performance, conectando artistas da escola peak-time e vertentes mais ácidas do techno.",
    en: "Origin: Belgium (Ghent). Background: Charlotte de Witte is a global reference in techno and acid techno, known for sustained tension, acidic timbres, and strong festival/club presence. Projects and collaborations: she leads KNTXT and collaborates across release/performance formats, connecting peak-time artists with the more acid-driven side of techno.",
    es: "Origen: Bélgica (Gante). Background: Charlotte de Witte es referencia global en techno y acid techno, reconocida por su tensión sostenida, timbres ácidos y fuerte presencia en festivales y clubes. Proyectos y colaboraciones: lidera KNTXT y colabora en distintos formatos de lanzamiento y performance, conectando artistas peak-time con la vertiente más ácida del techno."
  },
  "adam beyer": {
    pt: "Origem: Suécia (Estocolmo). Background: Adam Beyer é um dos pilares do techno moderno, com carreira de décadas e assinatura de groove sólido para pista. Projetos e colaborações: fundador da Drumcode, atua como curador de catálogo, eventos e rádio, além de colaborações com produtores da linha peak-time e techno melódico.",
    en: "Origin: Sweden (Stockholm). Background: Adam Beyer is one of modern techno's pillars, with a decades-long career and a signature solid groove for dancefloors. Projects and collaborations: as Drumcode founder, he curates releases, events, and radio while collaborating with peak-time and melodic-techno producers.",
    es: "Origen: Suecia (Estocolmo). Background: Adam Beyer es uno de los pilares del techno moderno, con una carrera de décadas y firma de groove sólido para pista. Proyectos y colaboraciones: fundador de Drumcode, curador de lanzamientos, eventos y radio, además de colaboraciones con productores de peak-time y techno melódico."
  },
  anna: {
    pt: "Origem: Brasil (Amparo, SP). Background: ANNA é DJ/produtora brasileira com forte presença internacional no techno, conhecida por faixas de impacto, linhas de baixo robustas e construção progressiva de energia. Projetos e colaborações: transita entre labels centrais do techno e colaborações com artistas do circuito europeu, mantendo também projetos autorais voltados para pista e live performance.",
    en: "Origin: Brazil (Amparo, Sao Paulo). Background: ANNA is a Brazilian DJ/producer with strong international techno presence, known for impact-driven tracks, robust low-end, and progressive energy building. Projects and collaborations: she moves through core techno labels and collaborations across the European circuit, while keeping authorial projects for dancefloor and live performance.",
    es: "Origen: Brasil (Amparo, Sao Paulo). Background: ANNA es DJ/productora brasileña con fuerte presencia internacional en techno, conocida por pistas de impacto, graves sólidos y construcción progresiva de energía. Proyectos y colaboraciones: participa en sellos clave del techno y colaboraciones del circuito europeo, manteniendo proyectos autorales orientados a pista y live performance."
  },
  skrillex: {
    pt: "Origem: Estados Unidos (Los Angeles). Background: Skrillex foi decisivo para levar o bass music ao mainstream global, combinando design sonoro agressivo, drops marcantes e produção híbrida entre dubstep, house e pop eletrônico. Projetos e colaborações: além da carreira solo, atua em projetos paralelos e colaborações com artistas de múltiplos gêneros, mantendo relevância em festivais, clubes e lançamentos de grande alcance.",
    en: "Origin: United States (Los Angeles). Background: Skrillex played a major role in pushing bass music into global mainstream culture, combining aggressive sound design, signature drops, and hybrid production between dubstep, house, and electronic pop. Projects and collaborations: beyond solo work, he runs parallel projects and cross-genre collaborations, keeping strong relevance in festivals, clubs, and high-impact releases.",
    es: "Origen: Estados Unidos (Los Angeles). Background: Skrillex fue clave para llevar el bass music al mainstream global, combinando diseño sonoro agresivo, drops característicos y producción híbrida entre dubstep, house y pop electrónico. Proyectos y colaboraciones: además de su carrera solista, participa en proyectos paralelos y colaboraciones multigénero, manteniendo relevancia en festivales, clubes y lanzamientos de alto alcance."
  }
};

const LABEL_EXTENDED_PROFILES = {
  "the endless knot": {
    pt: "A The Endless Knot é uma curadoria/label voltada para vertentes de psy experimental, slambient e linguagens extremas de pista. O catálogo costuma priorizar texturas densas, narrativa sombria e colaborações entre artistas do núcleo, com foco em transições de alta intensidade.",
    en: "The Endless Knot is a curation/label focused on experimental psy, slambient, and extreme dancefloor languages. Its catalog prioritizes dense textures, dark narrative, and collaborations across the label nucleus with high-intensity transitions.",
    es: "The Endless Knot es una curaduría/sello enfocado en psy experimental, slambient y lenguajes extremos de pista. Su catálogo prioriza texturas densas, narrativa oscura y colaboraciones entre artistas del núcleo con transiciones de alta intensidad."
  },
  "nano records": {
    pt: "Nano Records é referência em psytrance moderno, com catálogo focado em qualidade de produção, impacto de pista e artistas consolidados do circuito internacional.",
    en: "Nano Records is a modern psytrance reference, with a catalog focused on production quality, dancefloor impact, and established international artists.",
    es: "Nano Records es una referencia del psytrance moderno, con catálogo enfocado en calidad de producción, impacto de pista y artistas consolidados del circuito internacional."
  },
  "zenon records": {
    pt: "Zenon Records é uma das labels mais influentes do eixo dark progressive/zenonesque, com curadoria consistente de grooves hipnóticos, psicodelia profunda e narrativas de longa evolução. O catálogo conecta artistas de perfil autoral e exploração sonora, mantendo identidade forte entre progressive psy sombrio, minimalismo psicodélico e recortes experimentais de pista.",
    en: "Zenon Records is one of the most influential labels in the dark-progressive/zenonesque axis, known for consistent curation of hypnotic grooves, deep psychedelia, and long-form narrative flow. Its catalog connects highly authorial artists while maintaining a strong identity across shadowy progressive psy, psychedelic minimalism, and experimental dancefloor cuts.",
    es: "Zenon Records es uno de los sellos más influyentes del eje dark progressive/zenonesque, con una curaduría consistente de grooves hipnóticos, psicodelia profunda y narrativa de largo desarrollo. Su catálogo conecta artistas de perfil autoral y exploración sonora, manteniendo una identidad fuerte entre progressive psy oscuro, minimalismo psicodélico y cortes experimentales de pista."
  },
  "iboga records": {
    pt: "Iboga Records é um selo central para progressive psy/trance, reconhecido por estética limpa, musicalidade de longo curso e artistas de assinatura técnica.",
    en: "Iboga Records is a key progressive psy/trance label, recognized for clean aesthetics, long-form musicality, and technically distinctive artists.",
    es: "Iboga Records es un sello clave de progressive psy/trance, reconocido por estética limpia, musicalidad de largo recorrido y artistas de firma técnica."
  },
  "solid grooves": {
    pt: "Solid Grooves consolidou uma identidade forte no tech house contemporâneo, com foco em groove de clube, baixa latência de pista e seleção artística consistente.",
    en: "Solid Grooves built a strong identity in contemporary tech house, focused on club groove, immediate dancefloor response, and consistent artist curation.",
    es: "Solid Grooves consolidó una identidad fuerte en el tech house contemporáneo, enfocada en groove de club, respuesta inmediata de pista y curaduría artística consistente."
  }
};

function normalize(text) {
  return text
    .toLowerCase()
    .normalize("NFD")
    .replace(/[^\w\s]/g, "")
    .trim();
}

function localizedArtistGenreHint(artistName = "", styleHint = "") {
  const key = artistMatchKey(artistName || "");
  const direct = key ? ARTIST_GENRE_HINT_OVERRIDES[key] : null;
  if (direct && typeof direct === "object") {
    return String(direct[currentLanguage] || direct.pt || direct.en || direct.es || "").trim();
  }
  if (typeof direct === "string") return String(direct).trim();
  if (!styleHint) return "";
  return styleLabelByValue(styleHint);
}

function artistSeedAllowedForStyle(style, artistName) {
  if (textHasForbiddenSignalsForStyle(style, artistName)) return false;
  const strictWhitelist = STYLE_STRICT_WHITELISTS[style] || [];
  if (strictWhitelist.length && !strictWhitelist.some((seed) => isArtistMatch(artistName, seed))) {
    return false;
  }
  const blocked = (STYLE_ARTIST_BLOCKLIST[style] || []).some((name) => isArtistMatch(artistName, name));
  if (blocked) return false;
  const styleOverride = allowedStylesForArtist(artistName);
  if (styleOverride.length && !styleOverride.includes(style)) return false;
  return true;
}

function ensureMinimumArtistSeedsPerStyle(minArtists = 20) {
  Object.keys(STYLE_ARTIST_SEEDS).forEach((style) => {
    const pool = new Set((STYLE_ARTIST_SEEDS[style] || []).map((name) => String(name).trim()).filter(Boolean));
    const addMany = (names = []) => names.forEach((name) => name && pool.add(String(name).trim()));

    addMany(STYLE_SEED_BACKFILL[style] || []);
    if (!LOCK_SEED_FROM_CATALOG_STYLES.has(style)) {
      addMany(discoveryCatalog.filter((item) => item.style === style).map((item) => item.name));
      addMany(catalog.filter((track) => track.style === style).map((track) => track.artist));
    }

    if (pool.size < minArtists && !STRICT_FAMILY_SEED_STYLES.has(style)) {
      const family = familyOf(style);
      addMany(FAMILY_SEED_FALLBACK[family] || []);
    }

    const filteredPool = Array.from(pool).filter((artist) => artistSeedAllowedForStyle(style, artist));
    const finalPool = filteredPool.length ? filteredPool : Array.from(pool);
    STYLE_ARTIST_SEEDS[style] = finalPool.slice(0, Math.max(minArtists, finalPool.length));
  });
}

function mapBpmToRange(exactBpm) {
  if (!Number.isFinite(exactBpm) || exactBpm <= 0) return "";
  if (exactBpm >= 175) return "175+";
  if (exactBpm >= 155) return "155-175";
  if (exactBpm >= 145) return "145-155";
  if (exactBpm >= 132) return "132-145";
  if (exactBpm >= 124) return "124-132";
  return "110-124";
}

function parseBpmRangeValue(value) {
  const raw = String(value || "").trim();
  if (!raw) return null;
  if (/^\d{2,3}\+$/.test(raw)) {
    const min = Number(raw.replace("+", ""));
    return Number.isFinite(min) ? { min, max: 999 } : null;
  }
  const rangeMatch = raw.match(/^(\d{2,3})\s*-\s*(\d{2,3})$/);
  if (rangeMatch) {
    const min = Number(rangeMatch[1]);
    const max = Number(rangeMatch[2]);
    if (!Number.isFinite(min) || !Number.isFinite(max)) return null;
    return { min: Math.min(min, max), max: Math.max(min, max) };
  }
  if (/^\d{2,3}(?:\.\d+)?$/.test(raw)) {
    const valueNum = Number(raw);
    if (!Number.isFinite(valueNum)) return null;
    const rounded = Math.round(valueNum);
    return { min: rounded, max: rounded };
  }
  return null;
}

function bpmRangesOverlap(a, b) {
  if (!a || !b) return false;
  return a.min <= b.max && b.min <= a.max;
}

function normalizeDatasetStyle(rawStyle = "") {
  const input = String(rawStyle || "").trim();
  if (!input) return "";
  if (STYLE_BPM_RULES[input]) return input;

  const normalized = normalize(input).replace(/\s+/g, " ").trim();
  if (!normalized) return "";
  if (STYLE_BPM_RULES[normalized]) return normalized;

  const underscored = normalized.replace(/\s+/g, "_");
  if (STYLE_BPM_RULES[underscored]) return underscored;

  const compact = normalized.replace(/\s+/g, "");
  if (DATASET_STYLE_ALIASES[compact]) return DATASET_STYLE_ALIASES[compact];
  if (DATASET_STYLE_ALIASES[normalized]) return DATASET_STYLE_ALIASES[normalized];

  if (compact.includes("fullon") && compact.includes("night")) return "full_on_night";
  if (compact.includes("fullon") && compact.includes("morning")) return "full_on_morning";
  if (compact.includes("fullon")) return "full_on";
  if (compact.includes("hitech")) return "hi_tech";
  if (compact.includes("psycore")) return "psycore";
  if (compact.includes("slambient")) return "slambient";
  if (compact.includes("darkexperimental")) return "dark_experimental";
  if (compact.includes("darkprogressive")) return "dark_progressive";
  if (compact.includes("darkpsy")) return "dark_psy";
  if (compact.includes("forest")) return "forest_psy";
  if (compact.includes("progressivepsy")) return "progressive_psy";
  if (compact.includes("psycomercial") || compact.includes("psycommercial") || compact.includes("chacota")) {
    return "psy_comercial";
  }
  if (compact.includes("acidtechno")) return "acid_techno";
  if (compact.includes("hardtechno")) return "hard_techno";
  if (compact.includes("minimaltechno")) return "minimal_techno";
  if (compact.includes("melodictechno")) return "melodic_techno";
  if (compact.includes("industrialtechno")) return "industrial_techno";
  if (compact.includes("peaktimetechno")) return "peak_time_techno";
  if (compact.includes("drumandbass")) return "drum_and_bass";
  if (compact.includes("liquiddnb")) return "liquid_dnb";
  if (compact.includes("jumpup")) return "jump_up";
  if (compact.includes("ukgarage")) return "uk_garage";
  if (compact.includes("futuregarage")) return "future_garage";
  if (compact.includes("goatrance")) return "goa_trance";
  if (compact.includes("upliftingtrance")) return "trance_uplifting";
  if (compact.includes("psytrance")) return "psytrance";
  if (compact === "psy") return "psytrance";
  return "";
}

function parseDatasetDelimitedRows(text, delimiter = ",") {
  const rows = [];
  let row = [];
  let value = "";
  let inQuotes = false;

  for (let index = 0; index < text.length; index += 1) {
    const char = text[index];

    if (char === "\"") {
      if (inQuotes && text[index + 1] === "\"") {
        value += "\"";
        index += 1;
      } else {
        inQuotes = !inQuotes;
      }
      continue;
    }

    if (!inQuotes && char === delimiter) {
      row.push(value);
      value = "";
      continue;
    }

    if (!inQuotes && (char === "\n" || char === "\r")) {
      if (char === "\r" && text[index + 1] === "\n") index += 1;
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
  return rows;
}

function parseDatasetCsvRecords(text) {
  const safeText = String(text || "").replace(/^\uFEFF/, "");
  if (!safeText.trim()) return [];

  const firstLine = safeText.split(/\r?\n/).find((line) => String(line || "").trim()) || "";
  const commaCount = (firstLine.match(/,/g) || []).length;
  const semicolonCount = (firstLine.match(/;/g) || []).length;
  const delimiter = semicolonCount > commaCount ? ";" : ",";

  const rows = parseDatasetDelimitedRows(safeText, delimiter);
  if (rows.length < 2) return [];

  const headers = rows[0].map((header, headerIndex) => {
    const value = String(header || "").trim();
    return value || `column_${headerIndex}`;
  });

  return rows
    .slice(1)
    .map((cells) => {
      const row = {};
      headers.forEach((header, idx) => {
        row[header] = String(cells[idx] || "").trim();
      });
      return row;
    })
    .filter((row) => Object.values(row).some((value) => String(value || "").trim()));
}

function parseDatasetJsonlRecords(text) {
  const safeText = String(text || "").replace(/^\uFEFF/, "");
  if (!safeText.trim()) return [];
  const rows = [];

  safeText.split(/\r?\n/).forEach((line) => {
    const raw = String(line || "").trim();
    if (!raw) return;
    try {
      const parsed = JSON.parse(raw);
      if (parsed && typeof parsed === "object") rows.push(parsed);
    } catch (_err) {
      // ignora linhas inválidas
    }
  });

  return rows;
}

function datasetRowsFromJsonPayload(payload) {
  if (Array.isArray(payload)) return payload;
  if (!payload || typeof payload !== "object") return [];

  const buckets = ["tracks", "songs", "items", "rows", "artists", "data"];
  for (const bucket of buckets) {
    if (Array.isArray(payload[bucket])) return payload[bucket];
  }
  return [payload];
}

function normalizeDatasetFieldKey(key) {
  return normalize(String(key || "")).replace(/\s+/g, "_");
}

function datasetFieldMap(row) {
  const map = new Map();
  Object.entries(row || {}).forEach(([key, value]) => {
    const normalizedKey = normalizeDatasetFieldKey(key);
    if (!normalizedKey || map.has(normalizedKey)) return;
    map.set(normalizedKey, value);
  });
  return map;
}

function pickDatasetValue(fieldMap, keys = []) {
  for (const key of keys) {
    const normalizedKey = normalizeDatasetFieldKey(key);
    const value = fieldMap.get(normalizedKey);
    const text = String(value == null ? "" : value).trim();
    if (text) return text;
  }
  return "";
}

function parseDatasetBpm(value = "") {
  const raw = String(value || "").trim().replace(",", ".");
  if (!raw) return 0;
  const compact = raw.replace(/[–—]/g, "-");
  if (/^\d{2,3}(?:\.\d+)?$/.test(compact)) return Math.round(Number(compact));
  const rangeMatch = compact.match(/(\d{2,3})(?:\.\d+)?\s*-\s*(\d{2,3})(?:\.\d+)?/);
  if (rangeMatch) {
    const min = Number(rangeMatch[1]);
    const max = Number(rangeMatch[2]);
    if (Number.isFinite(min) && Number.isFinite(max)) return Math.round((min + max) / 2);
  }
  const candidates = Array.from(compact.matchAll(/(\d{2,3})(?:\.\d+)?/g))
    .map((match) => Number(match[1]))
    .filter((num) => Number.isFinite(num) && num >= 60 && num <= 280);
  if (candidates.length === 1) return Math.round(candidates[0]);
  if (candidates.length >= 2) {
    const min = Math.min(...candidates);
    const max = Math.max(...candidates);
    return Math.round((min + max) / 2);
  }
  return 0;
}

function parseDatasetDurationSeconds(value = "") {
  const raw = String(value || "").trim();
  if (!raw) return 0;

  if (/^\d+(?:\.\d+)?$/.test(raw)) {
    const numeric = Number(raw);
    if (!Number.isFinite(numeric) || numeric <= 0) return 0;
    if (numeric > 10000) return Math.round(numeric / 1000);
    return Math.round(numeric);
  }

  const parts = raw.split(":").map((part) => Number(part.trim()));
  if (parts.some((part) => !Number.isFinite(part))) return 0;
  if (parts.length === 2) return parts[0] * 60 + parts[1];
  if (parts.length === 3) return parts[0] * 3600 + parts[1] * 60 + parts[2];
  return 0;
}

function normalizeDatasetReleaseDate(value = "") {
  const raw = String(value || "").trim();
  if (!raw) return "Catálogo dinâmico";
  // Ano sem mês/dia: assume fim do ano para não excluir lançamentos recentes por falta de granularidade.
  if (/^\d{4}$/.test(raw)) return `${raw}-12-31`;
  const parsed = new Date(raw);
  if (Number.isNaN(parsed.getTime())) return raw;
  return parsed.toISOString().slice(0, 10);
}

function extractUrlsFromLooseText(value = "") {
  const raw = String(value || "");
  if (!raw) return [];
  const matches = raw.match(/https?:\/\/[^\s<>()]+/gi) || [];
  return matches
    .map((url) => url.replace(/[),.;]+$/, "").trim())
    .filter(Boolean);
}

function normalizeDatasetSlugToTitle(slug = "", artistName = "") {
  let decoded = String(slug || "").trim();
  if (!decoded) return "";
  try {
    decoded = decodeURIComponent(decoded);
  } catch (_err) {
    // segue com o valor bruto
  }
  let clean = decoded
    .replace(/\.(mp3|wav|flac|aiff|m4a|ogg)$/i, "")
    .replace(/[._]+/g, " ")
    .replace(/-/g, " ")
    .replace(/\s+/g, " ")
    .trim();
  if (!clean) return "";

  const artistRaw = String(artistName || "").trim();
  if (artistRaw && clean.toLowerCase().startsWith(`${artistRaw.toLowerCase()} `)) {
    clean = clean.slice(artistRaw.length).trim();
  }
  if (!clean) return "";

  const titled = clean
    .split(" ")
    .map((part) => {
      if (!part) return part;
      if (/^[a-z]{1,2}$/i.test(part)) return part.toUpperCase();
      return `${part.charAt(0).toUpperCase()}${part.slice(1)}`;
    })
    .join(" ")
    .trim();
  if (!titled || titled.length < 2 || titled.length > 96) return "";
  const compactNumeric = titled.replace(/\s+/g, "");
  if (/^\d+$/.test(compactNumeric)) return "";
  const digitCount = (titled.match(/\d/g) || []).length;
  if (digitCount >= Math.max(4, Math.floor(titled.length * 0.5))) return "";
  if (hasSuspiciousDynamicText(titled) || isLikelyGeneratedTrackTitle(titled)) return "";
  return titled;
}

function extractTrackTitleFromDatasetUrl(rawUrl = "", artistName = "") {
  const value = String(rawUrl || "").trim();
  if (!value) return "";
  try {
    const parsed = new URL(value);
    const host = normalize(parsed.hostname || "");
    const hostAllowed = host.includes("soundcloud") || host.includes("bandcamp");
    if (!hostAllowed) return "";
    const segments = String(parsed.pathname || "")
      .split("/")
      .map((segment) => String(segment || "").trim())
      .filter(Boolean);
    if (!segments.length) return "";

    const normalizedSegments = segments.map((segment) => normalize(segment));
    let slug = "";

    if (host.includes("soundcloud")) {
      // Formato comum: /artist/track; ignora rotas de sets/playlists.
      if (normalizedSegments.includes("sets")) return "";
      slug = segments[segments.length - 1] || "";
    } else if (host.includes("bandcamp")) {
      const idx = normalizedSegments.findIndex((segment) => segment === "track");
      if (idx >= 0 && segments[idx + 1]) slug = segments[idx + 1];
    } else if (host.includes("spotify")) {
      return "";
    } else if (host.includes("youtube") || host.includes("youtu.be")) {
      return "";
    } else {
      const tail = normalizedSegments[normalizedSegments.length - 2] || "";
      if (["track", "faixa", "song", "musica", "release"].includes(tail)) {
        slug = segments[segments.length - 1] || "";
      } else {
        slug = segments[segments.length - 1] || "";
      }
    }

    const slugKey = normalize(slug);
    if (!slug || !slugKey) return "";
    if (
      /\b(artist|artists|search|set|sets|playlist|playlists|album|albums|channel|channels|mix|full|recording|session|live)\b/.test(
        slugKey
      )
    ) {
      return "";
    }

    return normalizeDatasetSlugToTitle(slug, artistName);
  } catch (_err) {
    return "";
  }
}

function deriveDatasetSongCandidate(rawRow = {}, fieldMap = new Map(), artistName = "") {
  const directCandidate = pickDatasetValue(fieldMap, [
    "song",
    "track",
    "track_name",
    "title",
    "faixa",
    "music",
    "featured_track",
    "notable_track",
    "single"
  ]);
  const safeDirect = String(directCandidate || "").trim();
  if (safeDirect && !hasSuspiciousDynamicText(safeDirect) && !isLikelyGeneratedTrackTitle(safeDirect)) {
    return safeDirect;
  }

  const bio = rawRow?.bio && typeof rawRow.bio === "object" ? rawRow.bio : {};
  const urlHints = [
    pickDatasetValue(fieldMap, ["source", "url", "link", "track_url", "reference", "lookup"]),
    String(rawRow?.source || ""),
    String(rawRow?.lookup || ""),
    String(rawRow?.url || ""),
    String(rawRow?.link || ""),
    String(rawRow?.reference || ""),
    String(rawRow?.references || ""),
    String(bio?.primarySources || "")
  ]
    .filter(Boolean)
    .join(" ");

  const urls = extractUrlsFromLooseText(urlHints);
  for (const url of urls) {
    const title = extractTrackTitleFromDatasetUrl(url, artistName);
    if (title) return title;
  }
  return "";
}

function extractDateFromLooseText(value = "") {
  const raw = String(value || "").trim();
  if (!raw) return "";

  const dateMatches = raw.match(/\b(20\d{2}|19\d{2})[-/.](0[1-9]|1[0-2])[-/.](0[1-9]|[12]\d|3[01])\b/g) || [];
  if (dateMatches.length) {
    const normalized = dateMatches
      .map((item) => item.replace(/[/.]/g, "-"))
      .map((item) => {
        const parsed = parseReleaseDateSafe(item);
        return parsed ? parsed.toISOString().slice(0, 10) : "";
      })
      .filter(Boolean)
      .sort();
    if (normalized.length) return normalized[normalized.length - 1];
  }

  const namedDateMatches = raw.match(/\b([0-3]?\d\s+[A-Za-z]{3,9}\s+(20\d{2}|19\d{2}))\b/g) || [];
  if (namedDateMatches.length) {
    const normalized = namedDateMatches
      .map((item) => parseReleaseDateSafe(item))
      .filter(Boolean)
      .map((date) => date.toISOString().slice(0, 10))
      .sort();
    if (normalized.length) return normalized[normalized.length - 1];
  }

  const yearMatches = raw.match(/\b(20\d{2}|19\d{2})\b/g) || [];
  if (yearMatches.length) {
    const latestYear = Math.max(...yearMatches.map((year) => Number(year)));
    if (Number.isFinite(latestYear)) return `${latestYear}-12-31`;
  }

  const parsed = parseReleaseDateSafe(raw);
  if (parsed) return parsed.toISOString().slice(0, 10);
  return "";
}

function extractRecentReleaseDateFromDatasetRow(rawRow = {}, fieldMap = new Map()) {
  const pick = (keys = []) => pickDatasetValue(fieldMap, keys);
  const bio = rawRow?.bio && typeof rawRow.bio === "object" ? rawRow.bio : {};
  const verification = rawRow?.verification && typeof rawRow.verification === "object" ? rawRow.verification : {};
  const bioVerification = bio?.verification && typeof bio.verification === "object" ? bio.verification : {};

  const candidates = [
    pick(["release_date", "released", "date", "year", "ano", "latest_release", "last_release", "recent_release", "recent_releases"]),
    String(rawRow?.recentReleases || ""),
    String(rawRow?.recentRelease || ""),
    String(rawRow?.recent_releases || ""),
    String(rawRow?.latestRelease || ""),
    String(rawRow?.latest_release || ""),
    String(rawRow?.lastRelease || ""),
    String(rawRow?.last_release || ""),
    String(rawRow?.verifiedOn || ""),
    String(verification?.verifiedOn || ""),
    String(bio?.recentReleases || ""),
    String(bio?.recentRelease || ""),
    String(bio?.recent_releases || ""),
    String(bioVerification?.verifiedOn || "")
  ].filter((value) => String(value || "").trim());

  let bestDate = "";
  let bestTimestamp = 0;
  const maxFutureSlackMs = 3 * 24 * 60 * 60 * 1000;
  const now = Date.now();

  candidates.forEach((candidate) => {
    const extracted = extractDateFromLooseText(candidate);
    if (!extracted) return;
    const parsed = parseReleaseDateSafe(extracted);
    if (!parsed) return;
    const timestamp = parsed.getTime();
    if (timestamp > now + maxFutureSlackMs) return;
    if (timestamp > bestTimestamp) {
      bestTimestamp = timestamp;
      bestDate = extracted;
    }
  });

  return bestDate;
}

function registerRecentArtistSignal(style, artistName, releaseDate, source = "dataset") {
  const styleKey = String(style || "").trim();
  const artist = String(artistName || "").trim();
  if (!styleKey || !artist) return;
  if (!STYLE_BPM_RULES[styleKey]) return;

  const parsed = parseReleaseDateSafe(releaseDate);
  if (!parsed) return;
  const normalizedDate = parsed.toISOString().slice(0, 10);

  const key = `${styleKey}::${normalize(artist)}`;
  const existing = recentArtistSignals.get(key);
  if (!existing) {
    recentArtistSignals.set(key, {
      style: styleKey,
      artist,
      releaseDate: normalizedDate,
      source
    });
    return;
  }

  const existingDate = parseReleaseDateSafe(existing.releaseDate);
  if (!existingDate || parsed > existingDate) {
    recentArtistSignals.set(key, {
      style: styleKey,
      artist,
      releaseDate: normalizedDate,
      source
    });
  }
}

function seedStyleArtistFromDataset(style, artistName) {
  const artist = String(artistName || "").trim();
  if (!style || !artist) return false;
  if (!artistSeedAllowedForStyle(style, artist)) return false;

  if (!Array.isArray(STYLE_ARTIST_SEEDS[style])) STYLE_ARTIST_SEEDS[style] = [];
  const exists = STYLE_ARTIST_SEEDS[style].some((seed) => isArtistMatch(artist, seed) || isArtistMatch(seed, artist));
  if (exists) return false;
  STYLE_ARTIST_SEEDS[style].push(artist);
  return true;
}

function upsertArtistOverridesFromDataset(style, artistName) {
  const artistKey = normalize(artistName || "");
  if (!style || !artistKey) return;
  if (!Array.isArray(ARTIST_STYLE_OVERRIDES[artistKey])) ARTIST_STYLE_OVERRIDES[artistKey] = [];
  if (!ARTIST_STYLE_OVERRIDES[artistKey].includes(style)) ARTIST_STYLE_OVERRIDES[artistKey].push(style);
}

function upsertArtistOriginFromDataset(artistName, country = "", area = "") {
  const artistKey = normalize(artistName || "");
  if (!artistKey) return;
  const safeCountry = String(country || "").trim();
  const safeArea = String(area || "").trim();
  if (!safeCountry && !safeArea) return;

  const current = ARTIST_CANONICAL_ORIGINS[artistKey] || {};
  ARTIST_CANONICAL_ORIGINS[artistKey] = {
    country: current.country || safeCountry || "",
    area: current.area || safeArea || "",
    disambiguation: current.disambiguation || ""
  };
}

function upsertDiscoveryFromDataset(style, artistName, bio = "") {
  const artist = String(artistName || "").trim();
  if (!style || !artist) return false;

  const artistKey = normalize(artist);
  const existing = discoveryCatalog.find(
    (item) => normalize(item.name) === artistKey && item.style === style
  );
  if (existing) {
    if (bio && String(bio).trim().length > String(existing.bio || "").trim().length) {
      existing.bio = String(bio).trim();
    }
    return false;
  }

  const styleLabel = styleLabelByValue(style);
  discoveryCatalog.push({
    name: artist,
    style,
    bio: String(bio || "").trim() || `${artist} aparece em base externa para ${styleLabel}.`,
    spotifyUrl: `https://open.spotify.com/search/${encodeURIComponent(artist)}`,
    youtubeUrl: `https://www.youtube.com/results?search_query=${encodeURIComponent(`${artist} ${styleLabel}`)}`
  });
  return true;
}

function mergeExternalDatasetRows(rows = [], sourceTag = "dataset_external") {
  const existingKeys = new Set(catalog.map((track) => normalize(`${track.artist}::${track.song}`)));
  const seededArtistKeys = new Set();
  const importedArtistKeys = new Set();
  let tracksImported = 0;

  rows.forEach((rawRow) => {
    if (!rawRow || typeof rawRow !== "object") return;
    const fields = datasetFieldMap(rawRow);
    const style = normalizeDatasetStyle(
      pickDatasetValue(fields, ["style", "subgenre", "sub_genre", "genre", "primary_genre", "main_style"])
    );
    if (!style || !STYLE_BPM_RULES[style]) return;

    const artist = pickDatasetValue(fields, ["artist", "artist_name", "name", "project", "dj", "act"]);
    const song = pickDatasetValue(fields, ["song", "track", "track_name", "title", "faixa", "music"]);
    const resolvedSong = song || deriveDatasetSongCandidate(rawRow, fields, artist);
    const label = pickDatasetValue(fields, ["label", "record_label", "release_label", "album", "imprint"]);
    const country = pickDatasetValue(fields, ["country", "origin_country", "artist_country", "pais", "nacionalidade"]);
    const area = pickDatasetValue(fields, ["city", "origin_city", "state", "region", "area", "cidade"]);
    const bio = pickDatasetValue(fields, ["artist_bio", "bio", "description", "about", "resumo"]);

    if (artist) {
      const recentSignalDate = extractRecentReleaseDateFromDatasetRow(rawRow, fields);
      if (seedStyleArtistFromDataset(style, artist)) {
        seededArtistKeys.add(`${style}::${normalize(artist)}`);
      }
      upsertArtistOverridesFromDataset(style, artist);
      upsertArtistOriginFromDataset(artist, country, area);
      if (recentSignalDate) {
        registerRecentArtistSignal(style, artist, recentSignalDate, sourceTag);
      }
      if (upsertDiscoveryFromDataset(style, artist, bio)) {
        importedArtistKeys.add(normalize(artist));
      }
    }

    if (!artist || !resolvedSong) return;

    const bpmExact = parseDatasetBpm(
      pickDatasetValue(fields, ["bpm_exact", "bpm", "tempo", "tempo_bpm", "track_bpm", "tempo_profile", "bpm_guide"])
    );
    const previewUrl = pickDatasetValue(fields, ["preview_url", "preview", "sample_url", "audio_preview"]);
    const releaseDate = normalizeDatasetReleaseDate(
      pickDatasetValue(fields, ["release_date", "released", "date", "year", "ano"])
    );
    const durationSec = parseDatasetDurationSeconds(
      pickDatasetValue(fields, ["duration_sec", "duration", "duration_seconds", "track_time", "length", "duracao"])
    );
    const artistGenre = pickDatasetValue(fields, ["artist_genre", "genre_signal", "genre_tags", "tags"]);
    const artistProfileHint = pickDatasetValue(fields, ["artist_profile_hint", "profile_hint", "source_note"]);

    const added = addDynamicTrackToCatalog(
      {
        style,
        song: resolvedSong,
        artist,
        label: label || "Catálogo dinâmico",
        bpmExact,
        previewUrl,
        releaseDate,
        durationSec,
        source: sourceTag.includes("dynamic") ? sourceTag : `dynamic_${sourceTag}`,
        artistCountry: country,
        artistGenre,
        artistProfileHint
      },
      existingKeys
    );
    if (!added) return;

    tracksImported += 1;
    importedArtistKeys.add(normalize(artist));
    if (releaseDate && releaseDate !== "Catálogo dinâmico") {
      registerRecentArtistSignal(style, artist, releaseDate, sourceTag);
    }
    if (bio) {
      const trackKey = normalize(`${artist}::${resolvedSong}`);
      const importedTrack = catalog.find((track) => recommendationTrackKey(track) === trackKey);
      if (importedTrack) importedTrack.artistBio = bio;
    }
  });

  return {
    tracksImported,
    artistsImported: importedArtistKeys.size,
    artistSeedsAdded: seededArtistKeys.size
  };
}

async function readExternalDatasetRowsFromPath(path) {
  try {
    const response = await fetch(`${path}?v=${Date.now()}`, { cache: "no-store" });
    if (!response.ok) return [];
    const lowerPath = String(path || "").toLowerCase();
    if (lowerPath.endsWith(".json")) {
      const payload = await response.json();
      return datasetRowsFromJsonPayload(payload);
    }
    if (lowerPath.endsWith(".csv")) {
      const text = await response.text();
      return parseDatasetCsvRecords(text);
    }
    if (lowerPath.endsWith(".jsonl")) {
      const text = await response.text();
      return parseDatasetJsonlRecords(text);
    }
    return [];
  } catch (_err) {
    return [];
  }
}

function externalDatasetImportedMessage(tracksImported, artistsImported) {
  if (currentLanguage === "en") {
    return `External dataset loaded: ${tracksImported} tracks and ${artistsImported} artists were merged.`;
  }
  if (currentLanguage === "es") {
    return `Base externa cargada: ${tracksImported} pistas y ${artistsImported} artistas se integraron.`;
  }
  return `Base externa carregada: ${tracksImported} faixas e ${artistsImported} artistas foram integrados.`;
}

async function hydrateExternalDatasetPackInBackground() {
  if (externalDatasetImportPromise) return externalDatasetImportPromise;

  externalDatasetImportPromise = (async () => {
    externalDatasetImportStarted = true;

    let tracksImported = 0;
    let artistsImported = 0;
    let seedsAdded = 0;

    for (const path of EXTERNAL_DATASET_FILES) {
      const rows = await readExternalDatasetRowsFromPath(path);
      if (!rows.length) continue;
      const merged = mergeExternalDatasetRows(rows, `dataset_v14_${path.split("/").pop()}`);
      tracksImported += merged.tracksImported;
      artistsImported += merged.artistsImported;
      seedsAdded += merged.artistSeedsAdded;
    }

    if (tracksImported > 0 || artistsImported > 0 || seedsAdded > 0) {
      dedupeCatalogByTrackKey();
      syncDiscoveryFromSeeds();
      ensureMinimumArtistSeedsPerStyle(MIN_ARTISTS_PER_STYLE);
      normalizeTrustedSlambientCatalog();
      sanitizeCatalogByStyleRules();
      Object.keys(STYLE_BPM_RULES).forEach((style) => purgeDynamicMismatches(style));
      saveDynamicCatalogCache();
      externalDatasetImportDone = true;

      const message = externalDatasetImportedMessage(tracksImported, artistsImported);
      if (feedbackMessage && appContent && !appContent.classList.contains("hidden")) {
        feedbackMessage.textContent = message;
      }
      showToast(message);
      return;
    }

    externalDatasetImportDone = true;
  })();

  return externalDatasetImportPromise;
}

function trackMatchesBpmPreference(track, selectedBpm = "") {
  const selectedRange = parseBpmRangeValue(selectedBpm);
  if (!selectedRange) return true;
  if (!track) return false;

  const exact = Number(track.bpmExact);
  if (Number.isFinite(exact) && exact > 0) {
    return exact >= selectedRange.min && exact <= selectedRange.max;
  }
  // Com filtro de BPM ativo, só aceita faixa com BPM exato confirmado.
  return false;
}

function energyFromBpm(bpm) {
  if (!Number.isFinite(bpm) || bpm <= 0) return "mid";
  if (bpm >= 175) return "extreme";
  if (bpm >= 145) return "high";
  if (bpm >= 124) return "mid";
  return "low";
}

function bpmFitsStyle(style, bpm) {
  if (!Number.isFinite(bpm) || bpm <= 0) return true;
  const rule = STYLE_BPM_RULES[style];
  if (!rule) return true;
  return bpm >= rule.min && bpm <= rule.max;
}

function requiresExactBpmForDynamic(style, source = "") {
  // Psycore em APIs abertas quase nunca vem com BPM exato; mantemos filtro por artista seed/estilo e liberamos fallback de BPM.
  if (style === "psycore") return false;
  if (isDynamicSource(source) && normalize(source || "").includes("dataset")) return false;
  return STRICT_DYNAMIC_BPM_STYLES.has(style);
}

function targetCatalogSizeForStyle(style) {
  if (style === "tech_house") return 60;
  if (style === "full_on") return 52;
  if (style === "full_on_night" || style === "full_on_morning") return 46;
  if (style === "psy_comercial") return 48;
  if (style === "hi_tech") return 44;
  if (style === "dark_psy") return 44;
  if (style === "dark_experimental") return 40;
  if (style === "psycore") return 18;
  if (style === "slambient") return 24;
  if (style === "psytrance" || style === "progressive_psy") return 40;
  return 30;
}

function getRecentTrackHistory(style) {
  if (!style) return [];
  if (!recentTrackHistoryByStyle.has(style)) recentTrackHistoryByStyle.set(style, []);
  return recentTrackHistoryByStyle.get(style);
}

function registerRecentTrack(style, trackKey, maxSize) {
  if (!style || !trackKey) return;
  const history = getRecentTrackHistory(style);
  const key = normalize(trackKey);
  if (history.includes(key)) return;
  history.push(key);
  while (history.length > Math.max(1, maxSize - 1)) history.shift();
}

function getServedCycle(style) {
  if (!style) return [];
  if (!servedTrackCycleByStyle.has(style)) servedTrackCycleByStyle.set(style, []);
  return servedTrackCycleByStyle.get(style);
}

function registerServedTrack(style, trackKey, maxSize) {
  if (!style || !trackKey) return;
  const cycle = getServedCycle(style);
  const key = normalize(trackKey);
  if (cycle.includes(key)) return;
  cycle.push(key);
  while (cycle.length > Math.max(2, maxSize)) cycle.shift();
}

function getServedArtistCycle(style) {
  if (!style) return [];
  if (!servedArtistCycleByStyle.has(style)) servedArtistCycleByStyle.set(style, []);
  return servedArtistCycleByStyle.get(style);
}

function registerServedArtist(style, artistName, maxSize) {
  if (!style || !artistName) return;
  const cycle = getServedArtistCycle(style);
  const key = artistMatchKey(artistName);
  if (!key || cycle.includes(key)) return;
  cycle.push(key);
  while (cycle.length > Math.max(2, maxSize)) cycle.shift();
}

function resetServedCycleIfExhausted(style) {
  if (!style) return;
  const pool = catalog
    .filter((track) => track.style === style)
    .map((track) => normalize(`${track.artist}::${track.song}`));
  const uniquePool = new Set(pool);
  const cycle = getServedCycle(style);
  if (!uniquePool.size) return;
  if (cycle.length >= uniquePool.size) servedTrackCycleByStyle.set(style, []);
}

function resetServedArtistCycleIfExhausted(style) {
  if (!style) return;
  const pool = new Set(
    catalog
      .filter((track) => track.style === style && isTrackEligibleForRecommendation(track))
      .map((track) => artistMatchKey(track.artist))
      .filter(Boolean)
  );
  const cycle = getServedArtistCycle(style);
  if (!pool.size) return;
  if (new Set(cycle).size >= pool.size) servedArtistCycleByStyle.set(style, []);
}

function registerGlobalRecommendation(trackKey) {
  const key = normalize(trackKey || "");
  if (!key || recommendationMemory.has(key)) return;
  recommendationMemory.add(key);
  recommendationMemoryQueue.push(key);
  const maxGlobalMemory = 220;
  while (recommendationMemoryQueue.length > maxGlobalMemory) {
    const oldest = recommendationMemoryQueue.shift();
    recommendationMemory.delete(oldest);
  }
}

function clearRecentHistoryIfExhausted(style) {
  if (!style) return;
  const stylePoolKeys = catalog
    .filter((track) => track.style === style)
    .map((track) => normalize(`${track.artist}::${track.song}`));
  const uniquePool = new Set(stylePoolKeys);
  const history = getRecentTrackHistory(style);
  if (!uniquePool.size) return;
  if (history.length >= uniquePool.size) {
    recentTrackHistoryByStyle.set(style, []);
  }
}

function escapeRegex(value) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function normalizeTitle(value) {
  return normalize(value || "")
    .replace(/\b(feat|ft|featuring)\b.*$/g, "")
    .replace(/\s+/g, " ")
    .trim();
}

const SUSPECT_DYNAMIC_PATTERNS = [
  /\btop\s*\d{2,4}\b/,
  /\bbest\s+of\b/,
  /\bplaylist\b/,
  /\bcompilation\b/,
  /\bmix\b/,
  /\bdj\s*mix\b/,
  /\bmega\s*mix\b/,
  /\bmegamix\b/,
  /\blive\s*set\b/,
  /\bfull\s*set\b/,
  /\bradio\s*show\b/,
  /\bpodcast\b/,
  /\bworkout\b/,
  /\bfitness\b/,
  /\bgym\b/,
  /\bmotivation\b/,
  /\bmotivacion\b/,
  /\bmotivacao\b/,
  /\bmusica\s+para\b/,
  /\bmusic\s+for\b/,
  /\brave\s+party\b/,
  /\brave\s+dj\b/,
  /\bedm\s+club\b/,
  /\belectronic\s+dance\s+music\b/,
  /\bfestival\s+hits\b/,
  /\bparty\s+music\b/,
  /\bchill\s*out\b/,
  /\bchillout\b/,
  /\bnightlife\b/,
  /\bmusic\s+zone\b/,
  /\bgood\s+energy\s+club\b/,
  /\bsleep\s+music\b/,
  /\brelax(?:ing)?\s+music\b/,
  /\bstudy\s+music\b/,
  /\bmeditation\s+music\b/,
  /\bbass\s+boosted\b/,
  /\bslowed\s*\+\s*reverb\b/,
  /\bno\s+copyright\b/,
  /\bpara\s+(treinar|entrenar|estudiar|focar|concentrar|concentracion|dormir|relajar|trabajar|gym)\b/,
  /\bsuperar\s+tus?\s+limites?\b/,
  /\bsin\s+anuncios\b/,
  /\btop\s+hits\b/,
  /\b\d+\s*(hr|hour)\b/
];

function hasSuspiciousDynamicText(value) {
  const normalized = normalize(value || "");
  if (!normalized) return false;
  return SUSPECT_DYNAMIC_PATTERNS.some((pattern) => pattern.test(normalized));
}

function hasGenreKeywordEntity(value) {
  const normalized = normalize(value || "").replace(/\s+/g, " ").trim();
  if (!normalized) return false;
  return /\b(psytrance|psy|trance|techno|tecno|house|electro|eletronica|electronica|electronic|bass|dnb|dubstep|forest|dark|hitech|psycore|edm|ambient|downtempo|chill\s*out|chillout)\b/.test(normalized);
}

function hasAllowedMixTerm(title) {
  const normalized = normalize(title || "");
  return /\b(original mix|extended mix|club mix|dub mix|radio edit|remix|vip mix|original version)\b/.test(normalized);
}

function isLikelyGenreDescriptorEntity(value) {
  const normalized = normalize(value || "").replace(/\s+/g, " ").trim();
  if (!normalized) return true;
  const tokens = normalized.split(" ").filter(Boolean);
  if (!tokens.length) return true;

  const genreTokens = new Set([
    "psy",
    "psytrance",
    "trance",
    "techno",
    "house",
    "electro",
    "bass",
    "dnb",
    "dubstep",
    "forest",
    "dark",
    "full",
    "fullon",
    "hitech",
    "psycore",
    "goa",
    "uplifting",
    "progressive",
    "minimal",
    "melodic",
    "industrial",
    "acid",
    "hard"
  ]);
  const neutralTokens = new Set([
    "and",
    "of",
    "the",
    "de",
    "da",
    "do",
    "del",
    "la",
    "el",
    "music",
    "records",
    "recordings",
    "label",
    "official",
    "collective",
    "project",
    "crew",
    "sounds"
  ]);

  let genreCount = 0;
  let informativeCount = 0;
  tokens.forEach((token) => {
    if (genreTokens.has(token)) {
      genreCount += 1;
      return;
    }
    if (neutralTokens.has(token)) return;
    informativeCount += 1;
  });

  if (genreCount >= 2 && informativeCount === 0) return true;
  if (genreCount >= 3 && informativeCount <= 1) return true;
  return false;
}

function isGenericAutoEntityName(value) {
  const normalized = normalize(value || "").replace(/\s+/g, " ").trim();
  const rawLower = String(value || "").toLowerCase();
  if (!normalized) return true;
  const wordCount = normalized.split(" ").filter(Boolean).length;
  const hasGenreTerm = /(psy|trance|techno|tecno|house|electro|eletronica|electronica|electronic|bass|dnb|dubstep|forest|dark|hitech|psycore|ambient|downtempo|chill\s*out|chillout)/.test(normalized);
  const hasChannelTerm = /(music|mix|playlist|radio|channel|official|sets?)/.test(normalized);
  const pureGenreName = /^(psy trance|psytrance|darkpsy|forest psy|dark psy|techno|tecno|house|electro|bass music)$/.test(normalized);
  if (/\[\s*(psy|psytrance|trance|techno|house|electro|bass|dnb|dubstep|hitech|psycore|edm)\s*\]/.test(rawLower)) return true;
  if (pureGenreName) return true;
  if (hasGenreTerm && hasChannelTerm) return true;
  if (wordCount <= 3 && hasGenreTerm && /(music|records|label|official)/.test(normalized)) return true;
  if (wordCount <= 6 && hasGenreTerm && /\b(dj|musica|electronica|eletronica|baile|dance)\b/.test(normalized)) return true;
  if (normalized === "psy trance music") return true;
  return false;
}

function isGenreAliasArtistName(value) {
  const normalized = normalize(value || "").replace(/\s+/g, " ").trim();
  if (!normalized) return true;
  const tokens = normalized.split(" ").filter(Boolean);
  if (!tokens.length) return true;
  const genrePrefixes = new Set([
    "psy",
    "psytrance",
    "trance",
    "techno",
    "house",
    "electro",
    "bass",
    "dnb",
    "dubstep",
    "ambient",
    "forest",
    "dark",
    "fullon",
    "full",
    "minimal",
    "melodic",
    "hardstyle",
    "drum"
  ]);
  const firstToken = tokens[0];
  if (!genrePrefixes.has(firstToken)) return false;
  if (tokens.length <= 3) return true;
  return false;
}

function isLikelyChannelStyleArtistName(value) {
  const raw = String(value || "").toLowerCase();
  const normalized = normalize(value || "").replace(/\s+/g, " ").trim();
  if (!normalized) return true;
  const words = normalized.split(" ").filter(Boolean);
  const hasGenre = hasGenreKeywordEntity(normalized);
  const hasChannelTone = /\b(rave|party|club|music|musica|beats|vibes|mix|playlist|radio|channel|official|zone|nightlife|chill|relax|sleep|meditation|dj|electronica|eletronica|baile|dance)\b/.test(normalized);
  const hasCommaList = /[,;|]/.test(raw);
  const hasYear = /\b(19|20)\d{2}\b/.test(raw);
  if (hasCommaList && hasChannelTone) return true;
  if (hasYear && hasChannelTone && words.length >= 4) return true;
  if (hasGenre && hasChannelTone) return true;
  if (words.length >= 4 && hasGenre) return true;
  if (words.length >= 6 && hasChannelTone && !hasGenre) return true;
  return false;
}

function isLikelyGeneratedTrackTitle(value) {
  const normalized = normalize(value || "").replace(/\s+/g, " ").trim();
  const rawLower = String(value || "")
    .toLowerCase()
    .normalize("NFD")
    .trim();
  const raw = String(value || "")
    .toLowerCase()
    .normalize("NFD")
    .replace(/[^\w\s()]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
  if (!normalized) return true;
  const tokenCount = normalized.split(" ").filter(Boolean).length;
  const genreTermCount = genreKeywordCount(normalized);
  const promoTermCount = [
    "festival",
    "hits",
    "radio",
    "version",
    "rave",
    "dj",
    "electronic dance music",
    "party",
    "music",
    "chill out",
    "chillout",
    "nightlife",
    "zone",
    "relax",
    "sleep",
    "meditation"
  ].reduce((count, term) => (normalized.includes(term) ? count + 1 : count), 0);
  const tokens = normalized.split(" ").filter(Boolean);
  if (tokens.length >= 2) {
    const genreRepeatRoots = new Set(["techno", "tecno", "trance", "house", "electro", "psy", "goa", "hitech"]);
    const root = tokens[0];
    if (genreRepeatRoots.has(root) && tokens.every((token) => token === root)) return true;
  }

  if (/^(psy|psytrance|psy trance|trance|techno|house|electro|electronic|edm|dnb|drum and bass|dubstep|forest psy|dark psy|hitech|hi tech|psycore|goa trance|progressive psy)$/.test(normalized)) return true;
  if (/^(ambient|ambient electronic|electronic ambient|chill out|chillout|ambient chill|ambient relax|sleep ambient|meditation ambient)$/.test(normalized)) return true;
  if (/^(psy|psytrance|psy trance|trance|techno|house|electro|electronic|edm|dnb|dubstep|hitech|hi tech|psycore)\s+(single|ep|album)$/.test(normalized)) return true;
  if (/\[\s*(psy|psytrance|trance|techno|house|electro|bass|dnb|dubstep|hitech|psycore|edm)\s*\]/.test(rawLower)) return true;
  if (/\((psy|psytrance|trance|techno|house|edm|fullon|full on|rave|club).*\)/.test(raw)) return true;
  if (/\(([^)]*(festival|hits|radio|rave dj|electronic dance music)[^)]*)\)/.test(raw)) return true;
  if (/\b(psy|techno|house)\s*(music|mix)\b/.test(normalized)) return true;
  if (/\b(chill\s*out|chillout|nightlife|music zone|good energy club)\b/.test(normalized) && tokenCount >= 3) return true;
  if (tokenCount >= 10 && promoTermCount >= 3 && genreTermCount >= 1) return true;
  if (tokenCount >= 12 && promoTermCount >= 2) return true;
  if (normalized.length >= 86 && promoTermCount >= 2) return true;
  if (normalized.includes("radio version") && (promoTermCount >= 2 || genreTermCount >= 1)) return true;
  if (/\b(para|for)\b/.test(normalized) && hasSuspiciousDynamicText(normalized)) return true;
  if (/^(techno|tecno|house|trance|electro|eletronica|electronica)\s*\(([^)]*(musica|music|electronic|electronica|eletronica|baile|dance)[^)]*)\)$/.test(normalized)) return true;
  if (/^(techno|tecno|house|trance|electro|eletronica|electronica)\b/.test(normalized) && /\b(musica|music|electronic|electronica|eletronica|baile|dance)\b/.test(normalized) && tokenCount >= 3) return true;
  return false;
}

function genreKeywordCount(text) {
  const normalized = normalize(text || "");
  const terms = [
    "psy",
    "darkpsy",
    "forest",
    "techno",
    "house",
    "electro",
    "bass",
    "trance",
    "dubstep",
    "drum and bass",
    "dnb"
  ];
  return terms.reduce((count, term) => (normalized.includes(term) ? count + 1 : count), 0);
}

function parseDurationTextToSeconds(value) {
  if (!value) return 0;
  const match = String(value).trim().match(/^(\d{1,3}):([0-5]\d)$/);
  if (!match) return 0;
  const minutes = Number(match[1]) || 0;
  const seconds = Number(match[2]) || 0;
  return (minutes * 60) + seconds;
}

function normalizePreviewUrl(value = "") {
  const raw = String(value || "").trim();
  if (!raw) return "";
  if (!/^https?:\/\//i.test(raw)) return "";
  try {
    const parsed = new URL(raw);
    if (parsed.protocol === "http:") parsed.protocol = "https:";
    return parsed.toString();
  } catch (_err) {
    return "";
  }
}

function registerPreviewCandidate(track, previewUrl = "") {
  if (!track) return;
  const normalized = normalizePreviewUrl(previewUrl);
  if (!normalized) return;
  if (!Array.isArray(track.previewCandidates)) track.previewCandidates = [];
  const exists = track.previewCandidates.some((url) => normalizePreviewUrl(url) === normalized);
  if (!exists) track.previewCandidates.push(normalized);
  if (!normalizePreviewUrl(track.previewUrl)) track.previewUrl = normalized;
}

function promotePreviewCandidate(track, previewUrl = "") {
  if (!track) return;
  const normalized = normalizePreviewUrl(previewUrl);
  if (!normalized) return;
  if (!Array.isArray(track.previewCandidates)) track.previewCandidates = [];
  track.previewCandidates = [
    normalized,
    ...track.previewCandidates.filter((url) => normalizePreviewUrl(url) !== normalized)
  ];
  track.previewUrl = normalized;
}

function previewCandidatesForTrack(track) {
  if (!track) return [];
  const ordered = [];
  const seen = new Set();
  const add = (value = "") => {
    const url = normalizePreviewUrl(value);
    if (!url || seen.has(url)) return;
    seen.add(url);
    ordered.push(url);
  };
  add(track.previewUrl);
  if (Array.isArray(track.previewCandidates)) {
    track.previewCandidates.forEach((url) => add(url));
  }
  return ordered;
}

function resetTrackPreviewElement(audioEl) {
  if (!audioEl) return;
  try {
    audioEl.pause();
    audioEl.removeAttribute("src");
    audioEl.load();
  } catch (_err) {
    // ignore preview reset failures
  }
}

function probeAudioSource(audioEl, previewUrl, timeoutMs = 6500) {
  return new Promise((resolve) => {
    let settled = false;
    let timeoutId = 0;
    const hasPlayableBuffer = () => {
      const duration = Number(audioEl.duration);
      const readyState = Number(audioEl.readyState) || 0;
      return Number.isFinite(duration) && duration > 0 && readyState >= 2 && !audioEl.error;
    };

    const finish = (ok, reason = "") => {
      if (settled) return;
      settled = true;
      cleanup();
      resolve({ ok, reason });
    };

    const onCanPlay = () => finish(true, "canplay");
    const onCanPlayThrough = () => finish(true, "canplaythrough");
    const onLoadedMeta = () => {
      if (hasPlayableBuffer()) finish(true, "metadata");
    };
    const onLoadedData = () => {
      if (hasPlayableBuffer()) finish(true, "loadeddata");
    };
    const onError = () => finish(false, "error");
    const onStalled = () => finish(false, "stalled");
    const onAbort = () => finish(false, "abort");

    const cleanup = () => {
      if (timeoutId) window.clearTimeout(timeoutId);
      audioEl.removeEventListener("canplay", onCanPlay);
      audioEl.removeEventListener("canplaythrough", onCanPlayThrough);
      audioEl.removeEventListener("loadedmetadata", onLoadedMeta);
      audioEl.removeEventListener("loadeddata", onLoadedData);
      audioEl.removeEventListener("error", onError);
      audioEl.removeEventListener("stalled", onStalled);
      audioEl.removeEventListener("abort", onAbort);
    };

    audioEl.addEventListener("canplay", onCanPlay);
    audioEl.addEventListener("canplaythrough", onCanPlayThrough);
    audioEl.addEventListener("loadedmetadata", onLoadedMeta);
    audioEl.addEventListener("loadeddata", onLoadedData);
    audioEl.addEventListener("error", onError);
    audioEl.addEventListener("stalled", onStalled);
    audioEl.addEventListener("abort", onAbort);

    timeoutId = window.setTimeout(() => finish(false, "timeout"), timeoutMs);

    try {
      resetTrackPreviewElement(audioEl);
      audioEl.src = previewUrl;
      audioEl.load();
    } catch (_err) {
      finish(false, "exception");
    }
  });
}

async function pickPlayablePreviewSource(audioEl, candidates = []) {
  if (!audioEl) return "";
  const uniqueCandidates = [];
  const seen = new Set();
  (Array.isArray(candidates) ? candidates : []).forEach((value) => {
    const normalized = normalizePreviewUrl(value);
    if (!normalized || seen.has(normalized)) return;
    seen.add(normalized);
    uniqueCandidates.push(normalized);
  });

  for (const candidate of uniqueCandidates) {
    const probe = await probeAudioSource(audioEl, candidate);
    if (probe.ok) return candidate;
  }
  resetTrackPreviewElement(audioEl);
  return "";
}

function isLikelyCompilationEntry({ song = "", artist = "", label = "", durationSec = 0 } = {}) {
  const songRaw = String(song || "").trim();
  const artistRaw = String(artist || "").trim();
  const labelRaw = String(label || "").trim();
  if (!songRaw || !artistRaw) return true;
  if (songRaw.length > 92 || artistRaw.length > 72) return true;
  if (isGenericAutoEntityName(artistRaw)) return true;
  if (isLikelyGenreDescriptorEntity(artistRaw)) return true;
  if (isGenreAliasArtistName(artistRaw)) return true;
  if (isLikelyChannelStyleArtistName(artistRaw)) return true;
  if (isLikelyGeneratedTrackTitle(songRaw)) return true;
  if (labelRaw && isGenericAutoEntityName(labelRaw)) return true;
  if (labelRaw && isLikelyGenreDescriptorEntity(labelRaw)) return true;

  if (Number(durationSec) >= 900) return true;

  const songSuspicious = hasSuspiciousDynamicText(songRaw);
  if (songSuspicious && !hasAllowedMixTerm(songRaw)) return true;
  if (/\bmix\b/.test(normalize(songRaw)) && !hasAllowedMixTerm(songRaw) && genreKeywordCount(songRaw) >= 2) return true;
  if (hasSuspiciousDynamicText(artistRaw)) return true;
  if (hasSuspiciousDynamicText(labelRaw)) return true;
  if (genreKeywordCount(songRaw) >= 3) return true;

  return false;
}

function sanitizeLabel(label, artistName, songName) {
  const raw = String(label || "").trim();
  if (!raw) return "Catálogo dinâmico";
  const clean = normalize(raw);
  if (!clean) return "Catálogo dinâmico";
  if (/^(psy|psytrance|psy trance|trance|techno|house|electro|electronic|edm|dnb|dubstep|hitech|hi tech|psycore)\s+(single|ep|album)$/.test(clean)) return "Catálogo dinâmico";
  if (clean === normalize(songName) || clean === normalize(artistName)) return "Catálogo dinâmico";
  if (isGenericAutoEntityName(raw)) return "Catálogo dinâmico";
  if (isLikelyGenreDescriptorEntity(raw)) return "Catálogo dinâmico";
  if (raw.length > 84) return "Catálogo dinâmico";
  if (hasSuspiciousDynamicText(raw)) return "Catálogo dinâmico";
  return raw;
}

function labelAllowedForStyle(style, labelName) {
  const requiredTerms = STYLE_REQUIRED_LABEL_TERMS[style] || [];
  if (!requiredTerms.length) return true;
  const normalizedLabel = normalize(labelName || "");
  if (!normalizedLabel) return false;
  return requiredTerms.some((term) => normalizedLabel.includes(normalize(term)));
}

function textHasForbiddenSignalsForStyle(style, rawText = "") {
  const forbiddenTerms = STYLE_FORBIDDEN_SIGNAL_TERMS[style] || [];
  if (!forbiddenTerms.length) return false;
  const text = normalize(rawText || "");
  if (!text) return false;
  return forbiddenTerms.some((term) => text.includes(normalize(term)));
}

function textHasTechnoRequiredSignalsForStyle(style, rawText = "") {
  if (!style || familyOf(style) !== "techno") return false;
  const terms = TECHNO_REQUIRED_SIGNAL_TERMS[style] || TECHNO_REQUIRED_SIGNAL_TERMS.techno;
  if (!terms.length) return false;
  const text = normalize(rawText || "");
  if (!text) return false;
  return terms.some((term) => text.includes(normalize(term)));
}

function textHasBassRequiredSignalsForStyle(style, rawText = "") {
  if (!style || familyOf(style) !== "bass_music" && familyOf(style) !== "dnb") return false;
  const terms = BASS_REQUIRED_SIGNAL_TERMS[style] || [];
  if (!terms.length) return false;
  const text = normalize(rawText || "");
  if (!text) return false;
  return terms.some((term) => text.includes(normalize(term)));
}

function textHasPsytranceRequiredSignal(rawText = "") {
  const text = normalize(rawText || "");
  if (!text) return false;
  return PSYTRANCE_REQUIRED_SIGNAL_TERMS.some((term) => text.includes(normalize(term)));
}

function hasTechnoFamilyIntegrityConflict(style, trackLike = {}) {
  if (!style || !trackLike) return false;
  if (familyOf(style) !== "techno") return false;

  const sourceRaw = String(trackLike.source || "").trim();
  const sourceNormalized = normalize(sourceRaw);
  const sourceCompact = sourceNormalized.replace(/[\s_]+/g, "");
  if (!isDynamicSource(sourceRaw)) return false;

  // Dataset import ja vem com rotulagem curada e não deve ser bloqueado por falta de sinal textual.
  if (sourceCompact.includes("dataset")) return false;

  const artistName = String(trackLike.artist || "").trim();
  if (artistSeedAnchoredForStyle(style, artistName)) return false;

  const genreHasSignal = textHasTechnoRequiredSignalsForStyle(style, trackLike.artistGenre || "");
  if (genreHasSignal) return false;

  const labelHasSignal = textHasTechnoRequiredSignalsForStyle(style, trackLike.label || "");
  if (labelHasSignal) return false;

  // Não aceitar apenas "sinal no título" para techno; isso gera falso positivo
  // como "Techno Techno" em faixas fora do gênero.
  return true;
}

function hasBassFamilyIntegrityConflict(style, trackLike = {}) {
  if (!style || !trackLike) return false;
  const family = familyOf(style);
  if (family !== "bass_music" && family !== "dnb") return false;

  const sourceRaw = String(trackLike.source || "").trim();
  const sourceNormalized = normalize(sourceRaw);
  const sourceCompact = sourceNormalized.replace(/[\s_]+/g, "");
  if (!isDynamicSource(sourceRaw)) return false;

  // Dataset import já vem curado e não deve ser bloqueado por ausência de sinal textual.
  if (sourceCompact.includes("dataset")) return false;

  const artistName = String(trackLike.artist || "").trim();
  if (artistSeedAnchoredForStyle(style, artistName)) return false;

  const genreHasSignal = textHasBassRequiredSignalsForStyle(style, trackLike.artistGenre || "");
  if (genreHasSignal) return false;

  const labelHasSignal = textHasBassRequiredSignalsForStyle(style, trackLike.label || "");
  if (labelHasSignal) return false;

  const songHasSignal = textHasBassRequiredSignalsForStyle(style, trackLike.song || "");
  if (songHasSignal) return false;

  return true;
}

function hasPsytranceIntegrityConflict(style, trackLike = {}) {
  if (style !== "psytrance" || !trackLike) return false;

  const sourceRaw = String(trackLike.source || "").trim();
  const sourceCompact = normalize(sourceRaw).replace(/[\s_]+/g, "");
  if (!isDynamicSource(sourceRaw)) return false;
  if (sourceCompact.includes("dataset")) return false;

  const bpmValue = Number(trackLike.bpmExact || 0);
  if (Number.isFinite(bpmValue) && bpmValue > 0 && bpmFitsStyle(style, bpmValue)) return false;

  const signalText = [
    trackLike.artistGenre,
    trackLike.label,
    trackLike.song,
    trackLike.artistProfileHint,
    trackLike.vibe
  ]
    .filter(Boolean)
    .join(" ");
  if (textHasPsytranceRequiredSignal(signalText)) return false;

  const artistName = String(trackLike.artist || "").trim();
  const styleOverride = allowedStylesForArtist(artistName);
  if (styleOverride.includes("psytrance")) return false;

  return true;
}

function hasTrackStyleSignalConflict(style, trackLike = {}) {
  if (!style || !trackLike) return false;
  const merged = [
    trackLike.artist,
    trackLike.song,
    trackLike.label,
    trackLike.artistGenre,
    trackLike.vibe
  ]
    .filter(Boolean)
    .join(" ");
  if (textHasForbiddenSignalsForStyle(style, merged)) return true;
  if (hasTechnoFamilyIntegrityConflict(style, trackLike)) return true;
  if (hasBassFamilyIntegrityConflict(style, trackLike)) return true;
  if (hasPsytranceIntegrityConflict(style, trackLike)) return true;
  return false;
}

function titleConfidence(baseTitle, candidateTitle) {
  const a = normalizeTitle(baseTitle);
  const b = normalizeTitle(candidateTitle);
  if (!a || !b) return 0;
  if (a === b) return 1;
  if (a.startsWith(b) || b.startsWith(a)) return 0.9;

  const aTokens = new Set(a.split(" ").filter(Boolean));
  const bTokens = new Set(b.split(" ").filter(Boolean));
  let overlap = 0;
  aTokens.forEach((token) => {
    if (bTokens.has(token)) overlap += 1;
  });
  const denom = Math.max(aTokens.size, bTokens.size, 1);
  return overlap / denom;
}

function strictTitleMatch(baseTitle, candidateTitle) {
  const a = normalizeTitle(baseTitle);
  const b = normalizeTitle(candidateTitle);
  if (!a || !b) return false;
  if (a === b) return true;
  const shortest = Math.min(a.length, b.length);
  const longest = Math.max(a.length, b.length);
  if (longest === 0) return false;
  const ratio = shortest / longest;
  if (ratio < 0.78) return false;
  return a.startsWith(b) || b.startsWith(a);
}

function canonicalArtistIdentity(nameLike = "") {
  const raw = String(nameLike || "");
  const noParentheses = raw.replace(/\([^)]*\)/g, " ");
  const noAliasTail = noParentheses.replace(/\baka\b.*$/i, " ");
  return normalize(noAliasTail).replace(/\s+/g, " ").trim();
}

function artistMatchKey(nameLike = "") {
  const canonical = canonicalArtistIdentity(nameLike || "");
  const compact = canonical
    .replace(/\b(feat|ft|featuring|x|vs|and|with)\b/g, " ")
    .replace(/\s+/g, " ")
    .trim();
  if (compact) return compact;
  return normalize(nameLike || "").replace(/\s+/g, " ").trim();
}

function artistMatchingKeys(nameLike = "") {
  const keys = new Set();
  const normalized = normalize(nameLike || "").replace(/\s+/g, " ").trim();
  const canonical = canonicalArtistIdentity(nameLike || "");
  const compact = artistMatchKey(nameLike || "");
  if (normalized) keys.add(normalized);
  if (canonical) keys.add(canonical);
  if (compact) keys.add(compact);
  return keys;
}

function addArtistKeysToSet(setRef, nameLike = "") {
  if (!setRef) return;
  artistMatchingKeys(nameLike).forEach((key) => setRef.add(key));
}

function addArtistIdentityToSet(setRef, nameLike = "") {
  if (!setRef) return;
  const key = artistMatchKey(nameLike || "");
  if (key) setRef.add(key);
}

function removeArtistIdentityFromSet(setRef, nameLike = "") {
  if (!setRef?.size) return;
  artistMatchingKeys(nameLike).forEach((key) => {
    if (setRef.has(key)) setRef.delete(key);
  });
}

function artistSetHasMatch(setRef, nameLike = "") {
  if (!setRef?.size) return false;
  for (const key of artistMatchingKeys(nameLike)) {
    if (setRef.has(key)) return true;
  }
  return false;
}

function compactArtistIdentitySet(setRef) {
  if (!setRef?.size) return;
  const compacted = new Set();
  Array.from(setRef.values()).forEach((value) => addArtistIdentityToSet(compacted, value));
  setRef.clear();
  compacted.forEach((value) => setRef.add(value));
}

function isArtistMatch(candidateName, seedName) {
  const candidate = normalize(candidateName || "");
  const seed = normalize(seedName || "");
  const candidateCanonical = canonicalArtistIdentity(candidateName || "");
  const seedCanonical = canonicalArtistIdentity(seedName || "");
  if (!candidate || !seed) return false;
  if (candidate === seed || candidateCanonical === seedCanonical) return true;

  const seedEscaped = escapeRegex(seed);
  const seedCanonicalEscaped = seedCanonical ? escapeRegex(seedCanonical) : "";
  // Regra rígida: seed deve ser o artista principal (inicio do nome), opcionalmente com collab/feat.
  const mainArtistPattern = new RegExp(`^${seedEscaped}(?:\\s*(?:&|feat|ft|x)\\s+.+)?$`);
  if (!seedCanonicalEscaped) return mainArtistPattern.test(candidate);
  const mainArtistCanonicalPattern = new RegExp(`^${seedCanonicalEscaped}(?:\\s*(?:&|feat|ft|x)\\s+.+)?$`);
  return mainArtistPattern.test(candidate) || mainArtistCanonicalPattern.test(candidateCanonical);
}

function allowedStylesForArtist(artistName) {
  const normalizedArtist = normalize(artistName || "");
  if (!normalizedArtist) return [];
  const exact = ARTIST_STYLE_OVERRIDES[normalizedArtist];
  if (exact?.length) return exact;
  const aliasKey = Object.keys(ARTIST_STYLE_OVERRIDES).find((key) => isArtistMatch(normalizedArtist, key));
  return aliasKey ? ARTIST_STYLE_OVERRIDES[aliasKey] : [];
}

function hasStrictWhitelist(style) {
  return Array.isArray(STYLE_STRICT_WHITELISTS[style]) && STYLE_STRICT_WHITELISTS[style].length > 0;
}

function artistAllowedForStyle(style, artistName) {
  const strictWhitelist = STYLE_STRICT_WHITELISTS[style] || [];
  if (strictWhitelist.length && !strictWhitelist.some((seed) => isArtistMatch(artistName, seed))) {
    return false;
  }
  if (textHasForbiddenSignalsForStyle(style, artistName)) return false;

  const styleOverride = allowedStylesForArtist(artistName);
  if (styleOverride.length && !styleOverride.includes(style)) return false;

  const seeds = STYLE_ARTIST_SEEDS[style] || [];
  const blocked = (STYLE_ARTIST_BLOCKLIST[style] || []).some((name) => isArtistMatch(artistName, name));
  if (blocked) return false;
  if (!seeds.length) return true;
  if (!STRICT_ARTIST_MATCH_STYLES.has(style)) return true;
  return seeds.some((seed) => isArtistMatch(artistName, seed));
}

function requiresSeedAnchorForDynamicStyle(style) {
  return style === "forest_psy";
}

function artistSeedAnchoredForStyle(style, artistName) {
  if (!style) return false;
  const strictWhitelist = STYLE_STRICT_WHITELISTS[style] || [];
  if (strictWhitelist.length) return strictWhitelist.some((seed) => isArtistMatch(artistName, seed));
  const styleOverride = allowedStylesForArtist(artistName);
  if (styleOverride.length) return styleOverride.includes(style);
  const seeds = STYLE_ARTIST_SEEDS[style] || [];
  if (!seeds.length) return false;
  return seeds.some((seed) => isArtistMatch(artistName, seed));
}

function isDynamicSource(source) {
  const normalizedSource = normalize(source || "");
  const compactSource = normalizedSource.replace(/[\s_]+/g, "");
  return (
    normalizedSource.includes("dynamic") ||
    compactSource.includes("itunesstyle") ||
    compactSource.includes("deezerstyle") ||
    compactSource.includes("dataset")
  );
}

function isTrustedSlambientCatalogTrack(track) {
  if (!track || track.style !== "slambient") return false;
  if (isDynamicSource(track.source)) return false;
  if (!artistAllowedForStyle("slambient", track.artist)) return false;
  if (!labelAllowedForStyle("slambient", track.label)) return false;
  return true;
}

function normalizeTrustedSlambientCatalog() {
  catalog.forEach((track) => {
    if (!isTrustedSlambientCatalogTrack(track)) return;

    // Mantém o catálogo curado da Endless Knot elegível mesmo sem preview oficial.
    track.existenceVerified = true;
    track.previewChecked = Boolean(track.previewUrl);
    track.previewMissing = !track.previewUrl;
    track.spotifyVerified = true;
    track.youtubeVerified = true;
    if (track.soundcloudVerified === undefined) track.soundcloudVerified = true;
    if (!track.spotifyTrackUrl) track.spotifyTrackUrl = buildSpotifyTrackLink(track);
    if (!track.youtubeTrackUrl) track.youtubeTrackUrl = buildYouTubeTrackLink(track);
    if (!track.soundcloudTrackUrl && !track.soundcloudUrl) {
      track.soundcloudTrackUrl = buildSoundCloudTrackLink(track);
    }
  });
}

function purgeDynamicMismatches(style) {
  for (let i = catalog.length - 1; i >= 0; i -= 1) {
    const track = catalog[i];
    const styleToCheck = style || track.style;
    if (style && track.style !== style) continue;
    if (styleToCheck && track.style === styleToCheck && hasStrictWhitelist(styleToCheck) && !artistAllowedForStyle(styleToCheck, track.artist)) {
      catalog.splice(i, 1);
      delete TRACK_METADATA[`${track.song}|${track.artist}`];
      continue;
    }
    if (!isDynamicSource(track.source)) continue;
    const dynamicMeta = TRACK_METADATA[`${track.song}|${track.artist}`] || {};
    const dynamicDurationSec = parseDurationTextToSeconds(dynamicMeta.duration);
    const isInvalidDynamic = isLikelyCompilationEntry({
      song: track.song,
      artist: track.artist,
      label: track.label,
      durationSec: dynamicDurationSec
    });
    const artistOk = artistAllowedForStyle(styleToCheck, track.artist);
    const anchoredArtistOk =
      !requiresSeedAnchorForDynamicStyle(styleToCheck) ||
      artistSeedAnchoredForStyle(styleToCheck, track.artist);
    const bpmValue = Number(track.bpmExact);
    const bpmPresent = Number.isFinite(bpmValue) && bpmValue > 0;
    const bpmOk =
      (!requiresExactBpmForDynamic(styleToCheck, track.source) || bpmPresent) &&
      (!bpmPresent || bpmFitsStyle(styleToCheck, bpmValue));
    const labelOk = labelAllowedForStyle(styleToCheck, track.label);
    const styleSignalConflict = hasTrackStyleSignalConflict(styleToCheck, track);
    const generatedArtist = isLikelyChannelStyleArtistName(track.artist);
    const generatedTitle = isLikelyGeneratedTrackTitle(track.song);
    if (!artistOk || !anchoredArtistOk || !bpmOk || !labelOk || isInvalidDynamic || styleSignalConflict || generatedArtist || generatedTitle) {
      catalog.splice(i, 1);
      delete TRACK_METADATA[`${track.song}|${track.artist}`];
    }
  }
}

function sanitizeCatalogByStyleRules() {
  for (let i = catalog.length - 1; i >= 0; i -= 1) {
    const track = catalog[i];
    const meta = TRACK_METADATA[`${track.song}|${track.artist}`] || {};
    const durationSec = parseDurationTextToSeconds(meta.duration);
    const invalidDynamic = isDynamicSource(track.source) && isLikelyCompilationEntry({
      song: track.song,
      artist: track.artist,
      label: track.label,
      durationSec
    });
    const generatedDynamic =
      isDynamicSource(track.source) &&
      (isLikelyGeneratedTrackTitle(track.song) || isLikelyChannelStyleArtistName(track.artist));
    const styleSignalConflict = hasTrackStyleSignalConflict(track.style, track);
    if (!artistAllowedForStyle(track.style, track.artist) || !labelAllowedForStyle(track.style, track.label) || styleSignalConflict) {
      catalog.splice(i, 1);
      delete TRACK_METADATA[`${track.song}|${track.artist}`];
      continue;
    }
    if (invalidDynamic || generatedDynamic) {
      catalog.splice(i, 1);
      delete TRACK_METADATA[`${track.song}|${track.artist}`];
    }
  }
}

function dedupeCatalogByTrackKey() {
  const scoreTrack = (track) => {
    let score = 0;
    if (track?.previewUrl) score += 4;
    if (track?.existenceVerified === true) score += 3;
    if (track?.spotifyVerified === true) score += 2;
    if (track?.youtubeVerified === true) score += 1.5;
    if (Number.isFinite(Number(track?.bpmExact)) && Number(track?.bpmExact) > 0) score += 1.2;
    if (String(track?.source || "").includes("dataset")) score += 0.5;
    return score;
  };

  const bestByKey = new Map();
  catalog.forEach((track) => {
    const key = recommendationTrackKey(track);
    if (!key) return;
    const currentBest = bestByKey.get(key);
    if (!currentBest || scoreTrack(track) > scoreTrack(currentBest)) {
      bestByKey.set(key, track);
    }
  });
  if (bestByKey.size >= catalog.length) return;

  const deduped = [];
  const seen = new Set();
  catalog.forEach((track) => {
    const key = recommendationTrackKey(track);
    if (!key) {
      deduped.push(track);
      return;
    }
    if (seen.has(key)) return;
    seen.add(key);
    deduped.push(bestByKey.get(key) || track);
  });

  catalog.length = 0;
  deduped.forEach((track) => catalog.push(track));
}

function boost(mapRef, key, amount = 1) {
  const cleanKey = normalize(key || "");
  if (!cleanKey) return;
  mapRef.set(cleanKey, (mapRef.get(cleanKey) || 0) + amount);
}

function getAdaptiveScore(track) {
  const styleKey = normalize(track.style);
  const artistKey = normalize(track.artist);
  const energyKey = normalize(track.energy);
  const like =
    (adaptiveModel.likedStyles.get(styleKey) || 0) * 1.2 +
    (adaptiveModel.likedArtists.get(artistKey) || 0) * 1.6 +
    (adaptiveModel.likedEnergies.get(energyKey) || 0) * 0.8;
  const dislike =
    (adaptiveModel.dislikedStyles.get(styleKey) || 0) * 1.4 +
    (adaptiveModel.dislikedArtists.get(artistKey) || 0) * 2 +
    (adaptiveModel.dislikedEnergies.get(energyKey) || 0) * 0.9;

  return like - dislike;
}

function registerTrackPreferenceSignal(track, delta = 0) {
  if (!track || !Number.isFinite(delta) || delta === 0) return;
  const key = recommendationTrackKey(track);
  if (!key) return;
  const next = (trackPreferenceSignals.get(key) || 0) + delta;
  if (Math.abs(next) < 0.04) {
    trackPreferenceSignals.delete(key);
    return;
  }
  const clamped = Math.max(-8, Math.min(8, next));
  trackPreferenceSignals.set(key, clamped);
}

function adjustPreviewReliabilitySignal(style = "", delta = 0) {
  const styleKey = normalize(style || "");
  if (!styleKey || !Number.isFinite(delta) || delta === 0) return;
  const next = (previewReliabilityByStyle.get(styleKey) || 0) + delta;
  if (Math.abs(next) < 0.04) {
    previewReliabilityByStyle.delete(styleKey);
    return;
  }
  previewReliabilityByStyle.set(styleKey, Math.max(-8, Math.min(8, next)));
}

function adjustTrackPreviewIssueSignal(track, delta = 0) {
  if (!track || !Number.isFinite(delta) || delta === 0) return;
  const trackKey = recommendationTrackKey(track);
  if (!trackKey) return;
  const next = (trackPreviewIssueSignals.get(trackKey) || 0) + delta;
  if (next <= 0.04) {
    trackPreviewIssueSignals.delete(trackKey);
    return;
  }
  trackPreviewIssueSignals.set(trackKey, Math.max(0.05, Math.min(8, next)));
}

function trackHasReliableAudioPreview(track) {
  if (!track) return false;
  if (normalizePreviewUrl(track.previewUrl)) return true;
  return previewCandidatesForTrack(track).some((candidate) => Boolean(normalizePreviewUrl(candidate)));
}

function inferNegativeFeedbackReason(track, { source = "skip" } = {}) {
  if (!track) return "taste_mismatch";
  const noReliableAudio =
    !trackHasReliableAudioPreview(track) ||
    Boolean(track.previewChecked && track.previewMissing);
  const youtubeFallbackVisible =
    Boolean(trackPreview?.classList.contains("hidden")) &&
    Boolean(youtubePreviewWrap && !youtubePreviewWrap.classList.contains("hidden"));

  if (source === "preview_dislike" && (noReliableAudio || youtubeFallbackVisible)) {
    return "preview_issue";
  }
  if ((source === "novelty_not_yet" || source === "skip") && noReliableAudio && youtubeFallbackVisible) {
    return "preview_issue";
  }
  return "taste_mismatch";
}

function previewPenaltyForTrack(track) {
  if (!track) return 0;
  let penalty = 0;
  const trackKey = recommendationTrackKey(track);
  const issueSignal = Number(trackPreviewIssueSignals.get(trackKey) || 0);
  if (issueSignal > 0) {
    penalty += Math.min(3.1, issueSignal * 0.72);
  }

  const styleSignal = Number(previewReliabilityByStyle.get(normalize(track.style || "")) || 0);
  if (!trackHasReliableAudioPreview(track) && styleSignal < 0) {
    penalty += Math.min(1.7, Math.abs(styleSignal) * 0.34);
  }
  return penalty;
}

function registerTrackFeedback(track, liked, options = {}) {
  if (!track) return;
  const delta = liked ? 1 : 1.2;
  if (liked) {
    boost(adaptiveModel.likedStyles, track.style, delta);
    boost(adaptiveModel.likedArtists, track.artist, delta);
    boost(adaptiveModel.likedEnergies, track.energy, 0.6);
    registerTrackPreferenceSignal(track, 1.15);
    removeArtistIdentityFromSet(rejectedArtists, track.artist);
    adjustTrackPreviewIssueSignal(track, options?.rewardPreview ? -0.95 : -0.45);
    adjustPreviewReliabilitySignal(track.style, options?.rewardPreview ? 0.16 : 0.07);
    saveProgress();
    return "liked";
  }
  const reason = options?.reason || inferNegativeFeedbackReason(track, { source: options?.source || "skip" });
  if (reason === "preview_issue") {
    // Quando falha no preview, aprendemos a priorizar faixas com player melhor sem punir forte o gosto musical.
    boost(adaptiveModel.dislikedStyles, track.style, 0.18);
    boost(adaptiveModel.dislikedArtists, track.artist, 0.38);
    boost(adaptiveModel.dislikedEnergies, track.energy, 0.12);
    registerTrackPreferenceSignal(track, -0.38);
    if (options?.avoidRepeatArtist !== false) {
      addArtistIdentityToSet(rejectedArtists, track.artist);
    }
    adjustTrackPreviewIssueSignal(track, 1);
    adjustPreviewReliabilitySignal(track.style, -0.65);
    saveProgress();
    return reason;
  }

  boost(adaptiveModel.dislikedStyles, track.style, 1.35);
  boost(adaptiveModel.dislikedArtists, track.artist, 1.72);
  boost(adaptiveModel.dislikedEnergies, track.energy, 0.86);
  registerTrackPreferenceSignal(track, -1.02);
  if (options?.avoidRepeatArtist !== false) {
    addArtistIdentityToSet(rejectedArtists, track.artist);
  }
  adjustTrackPreviewIssueSignal(track, -0.65);
  adjustPreviewReliabilitySignal(track.style, 0.08);
  saveProgress();
  return reason;
}

function collectSuppressedArtistsFromAdaptiveModel() {
  const suppressed = new Set();
  const MIN_DISLIKE_SCORE = 1.6; // bloqueia mais cedo artistas rejeitados repetidamente e reduz repetição na sessão.
  const LIKE_RECOVERY_MARGIN = 0.35;

  adaptiveModel.dislikedArtists.forEach((dislikeValue, artistKey) => {
    const dislikeScore = Number(dislikeValue) || 0;
    if (dislikeScore < MIN_DISLIKE_SCORE) return;
    const likedScore = Number(adaptiveModel.likedArtists.get(artistKey) || 0);
    if (likedScore + LIKE_RECOVERY_MARGIN >= dislikeScore) return;
    addArtistIdentityToSet(suppressed, artistKey);
  });

  return suppressed;
}

function recommendationTrackKey(track) {
  if (!track) return "";
  return normalize(`${track.artist}::${track.song}`);
}

function starAriaLabel(stars) {
  const count = Math.max(1, Number(stars) || 1);
  if (currentLanguage === "en") return `${count} ${count === 1 ? "star" : "stars"}`;
  if (currentLanguage === "es") return `${count} ${count === 1 ? "estrella" : "estrellas"}`;
  return `${count} ${count === 1 ? "estrela" : "estrelas"}`;
}

function ratingSignalFromStars(stars) {
  const value = Math.max(1, Math.min(5, Math.round(Number(stars) || 0)));
  if (value <= 1) return -1.6;
  if (value === 2) return -0.8;
  if (value === 3) return 0;
  if (value === 4) return 0.8;
  return 1.6;
}

function applyRatingSignal(track, signalDelta = 0) {
  if (!track || !Number.isFinite(signalDelta) || signalDelta === 0) return;
  const amount = Math.abs(signalDelta);
  registerTrackPreferenceSignal(track, signalDelta * 0.72);
  if (signalDelta > 0) {
    boost(adaptiveModel.likedStyles, track.style, amount * 1.05);
    boost(adaptiveModel.likedArtists, track.artist, amount * 1.2);
    boost(adaptiveModel.likedEnergies, track.energy, amount * 0.7);
    registerSpiritSignal(track.style, amount * 0.85);
    return;
  }

  boost(adaptiveModel.dislikedStyles, track.style, amount * 1.05);
  boost(adaptiveModel.dislikedArtists, track.artist, amount * 1.2);
  boost(adaptiveModel.dislikedEnergies, track.energy, amount * 0.75);
  registerSpiritSignal(track.style, -amount * 0.65);
}

function recalculateRatingStats() {
  let count = 0;
  let sum = 0;
  const invalidKeys = [];
  trackRatings.forEach((value, key) => {
    const stars = Math.round(Number(value) || 0);
    if (stars < 1 || stars > 5) {
      invalidKeys.push(key);
      return;
    }
    if (Number(value) !== stars) {
      trackRatings.set(key, stars);
    }
    count += 1;
    sum += stars;
  });
  invalidKeys.forEach((key) => trackRatings.delete(key));
  userStats.ratingCount = count;
  userStats.ratingSum = sum;
}

function ratingAverageText() {
  if (!userStats.ratingCount) return "0.0";
  return (userStats.ratingSum / userStats.ratingCount).toFixed(1);
}

function setRatingStars(stars) {
  const selected = Math.max(0, Math.min(5, Math.round(Number(stars) || 0)));
  if (starRating) starRating.dataset.stars = String(selected);
  starButtons.forEach((button, index) => {
    const value = index + 1;
    const active = value <= selected;
    button.classList.toggle("active", active);
    button.setAttribute("aria-checked", value === selected ? "true" : "false");
  });
}

function renderTrackRating(track = currentRecommendation) {
  const key = recommendationTrackKey(track);
  const hasTrack = Boolean(track && key);
  starButtons.forEach((button, index) => {
    button.disabled = !hasTrack;
    button.setAttribute("aria-label", starAriaLabel(index + 1));
  });

  if (starRating) starRating.setAttribute("aria-label", t("ratingAriaGroup"));
  if (!hasTrack) {
    setRatingStars(0);
    if (ratingHint) ratingHint.textContent = t("ratingHint");
    if (ratingCelebration) ratingCelebration.textContent = t("ratingCelebration");
    return;
  }

  const selected = Math.max(0, Math.min(5, Number(trackRatings.get(key)) || 0));
  setRatingStars(selected);
  if (ratingHint) {
    ratingHint.textContent = selected
      ? t("ratingSavedHint", { stars: selected })
      : t("ratingHint");
  }
  if (ratingCelebration) ratingCelebration.textContent = t("ratingCelebration");
}

async function rateCurrentRecommendation(stars, triggerEl = null) {
  if (!currentRecommendation) return;
  const value = Math.max(1, Math.min(5, Math.round(Number(stars) || 0)));
  const key = recommendationTrackKey(currentRecommendation);
  if (!key) return;

  const previousSignal = Number(trackRatingSignals.get(key)) || 0;
  const nextSignal = ratingSignalFromStars(value);
  const signalDelta = nextSignal - previousSignal;
  if (signalDelta !== 0) applyRatingSignal(currentRecommendation, signalDelta);

  trackRatings.set(key, value);
  if (nextSignal === 0) trackRatingSignals.delete(key);
  else trackRatingSignals.set(key, nextSignal);

  recalculateRatingStats();
  renderTrackRating(currentRecommendation);
  updateStats();

  if (feedbackMessage) {
    feedbackMessage.textContent = t("ratingSavedFeedback", {
      stars: value,
      song: currentRecommendation.song
    });
  }

  if (value >= 4) {
    burstConfetti(triggerEl || starRating, ["#ffd77d", "#ffb48b", "#f8b5ff", "#7de0ff"]);
  }
  showToast(t("ratingSavedToast", { stars: value }));

  await renderMusicalSpirit({
    celebrate: false,
    triggerEl: triggerEl || starRating || spiritBadge,
    forceAnimation: value >= 4
  });
}

function deezerJsonp(url) {
  return new Promise((resolve, reject) => {
    const callbackName = `dzcb_${Date.now()}_${Math.floor(Math.random() * 100000)}`;
    const script = document.createElement("script");
    const timeout = setTimeout(() => {
      cleanup();
      reject(new Error("Timeout na consulta Deezer"));
    }, 4500);

    function cleanup() {
      clearTimeout(timeout);
      delete window[callbackName];
      if (script.parentNode) script.parentNode.removeChild(script);
    }

    window[callbackName] = (data) => {
      cleanup();
      resolve(data);
    };

    script.onerror = () => {
      cleanup();
      reject(new Error("Falha ao carregar Deezer JSONP"));
    };

    const separator = url.includes("?") ? "&" : "?";
    script.src = `${url}${separator}output=jsonp&callback=${callbackName}`;
    document.body.appendChild(script);
  });
}

function itunesJsonp(url) {
  return new Promise((resolve, reject) => {
    const callbackName = `itcb_${Date.now()}_${Math.floor(Math.random() * 100000)}`;
    const script = document.createElement("script");
    const timeout = setTimeout(() => {
      cleanup();
      reject(new Error("Timeout na consulta iTunes"));
    }, 4500);

    function cleanup() {
      clearTimeout(timeout);
      delete window[callbackName];
      if (script.parentNode) script.parentNode.removeChild(script);
    }

    window[callbackName] = (data) => {
      cleanup();
      resolve(data);
    };

    script.onerror = () => {
      cleanup();
      reject(new Error("Falha ao carregar iTunes JSONP"));
    };

    const separator = url.includes("?") ? "&" : "?";
    script.src = `${url}${separator}callback=${callbackName}`;
    document.body.appendChild(script);
  });
}

function collectStyleKnowledgeArtists(style) {
  if (!style) return [];
  const ordered = [];
  const seen = new Set();
  const addArtist = (artistLike = "") => {
    const artist = String(artistLike || "").trim();
    if (!artist) return;
    if (!artistAllowedForStyle(style, artist)) return;
    const key = artistMatchKey(artist);
    if (!key || seen.has(key)) return;
    seen.add(key);
    ordered.push(artist);
  };

  Array.from(recentArtistSignals.values())
    .filter((entry) => entry?.style === style)
    .sort((a, b) => {
      const dateA = parseReleaseDateSafe(a?.releaseDate)?.getTime() || 0;
      const dateB = parseReleaseDateSafe(b?.releaseDate)?.getTime() || 0;
      return dateB - dateA;
    })
    .forEach((entry) => addArtist(entry.artist));

  discoveryCatalog
    .filter((entry) => entry?.style === style)
    .forEach((entry) => addArtist(entry.name));

  (STYLE_ARTIST_SEEDS[style] || []).forEach((artist) => addArtist(artist));
  catalog
    .filter((track) => track?.style === style)
    .forEach((track) => addArtist(track.artist));

  return ordered;
}

function styleLocalArtistKnowledgeCount(style) {
  if (!style) return 0;
  const artists = new Set();
  const addArtist = (artistLike = "") => {
    const artist = String(artistLike || "").trim();
    if (!artist || !artistAllowedForStyle(style, artist)) return;
    const key = artistMatchKey(artist);
    if (!key) return;
    artists.add(key);
  };
  (STYLE_ARTIST_SEEDS[style] || []).forEach((artist) => addArtist(artist));
  discoveryCatalog.forEach((entry) => {
    if (entry?.style === style) addArtist(entry.name);
  });
  recentArtistSignals.forEach((entry) => {
    if (entry?.style === style) addArtist(entry.artist);
  });
  catalog.forEach((track) => {
    if (track?.style === style) addArtist(track.artist);
  });
  return artists.size;
}

function selectHydrationArtists(style, artists = [], cap = 24) {
  const normalizedPool = [];
  const seen = new Set();
  (artists || []).forEach((artistLike) => {
    const artist = String(artistLike || "").trim();
    const key = artistMatchKey(artist);
    if (!artist || !key || seen.has(key)) return;
    seen.add(key);
    normalizedPool.push(artist);
  });
  if (!normalizedPool.length) return [];
  if (normalizedPool.length <= cap) return normalizedPool;

  const guaranteedCount = Math.min(12, cap);
  const guaranteed = normalizedPool.slice(0, guaranteedCount);
  const remainder = normalizedPool.slice(guaranteedCount);
  if (!remainder.length) return guaranteed;

  const styleEntropy = String(style || "")
    .split("")
    .reduce((acc, char) => acc + char.charCodeAt(0), 0);
  const cursorSeed = styleEntropy + catalog.length + (Number(dynamicCatalogByStyle.get(style)) || 0);
  const offset = Math.abs(cursorSeed) % remainder.length;
  const rotated = remainder.slice(offset).concat(remainder.slice(0, offset));
  return [...guaranteed, ...rotated.slice(0, Math.max(0, cap - guaranteed.length))];
}

function stylePoolStats(style) {
  const tracks = catalog.filter((track) => track.style === style);
  return {
    trackCount: tracks.length,
    artistCount: new Set(tracks.map((track) => artistMatchKey(track.artist)).filter(Boolean)).size
  };
}

function styleCoverageTarget(style) {
  const base = {
    tracks: MIN_TRACKS_PER_STYLE,
    artists: MIN_ARTISTS_PER_STYLE,
    labels: MIN_LABELS_PER_STYLE
  };
  const override = STYLE_COVERAGE_OVERRIDES[style] || {};
  return {
    tracks: Number(override.tracks) || base.tracks,
    artists: Number(override.artists) || base.artists,
    labels: Number(override.labels) || base.labels
  };
}

function styleCoverageStats(style) {
  const styleTracks = catalog.filter((track) => track.style === style);
  const validatedTracks = styleTracks.filter((track) => {
    if (!isTrackEligibleForRecommendation(track)) return false;
    return track.style === style;
  });
  const artistsByIdentity = new Set(validatedTracks.map((track) => artistMatchKey(track.artist)).filter(Boolean));
  const labels = new Set(
    validatedTracks
      .map((track) => sanitizeLabel(track.label, track.artist, track.song))
      .map((label) => normalize(label))
      .filter((label) => label && label !== normalize("Catálogo dinâmico"))
  );

  return {
    tracks: validatedTracks.length,
    artists: artistsByIdentity.size,
    labels: labels.size,
    localArtists: styleLocalArtistKnowledgeCount(style)
  };
}

function isStyleCoverageHealthy(style, stats = styleCoverageStats(style), target = styleCoverageTarget(style)) {
  return stats.tracks >= target.tracks && stats.artists >= target.artists && stats.labels >= target.labels;
}

function coveragePassLimit(style, maxPasses = COVERAGE_MAX_PASSES) {
  if (!style) return maxPasses;
  if (style === "psycore") return Math.max(4, Math.min(maxPasses, 6));
  if (STRICT_DYNAMIC_BPM_STYLES.has(style)) return Math.min(maxPasses, FAST_COVERAGE_MAX_PASSES);
  return maxPasses;
}

function coverageTimeoutForStyle(style) {
  if (style === "psycore") return Math.max(DEFAULT_COVERAGE_TIMEOUT_MS, 42000);
  return STRICT_DYNAMIC_BPM_STYLES.has(style) ? FAST_COVERAGE_TIMEOUT_MS : DEFAULT_COVERAGE_TIMEOUT_MS;
}

async function ensureStyleCoverageWithTimeout(style, maxPasses = COVERAGE_MAX_PASSES) {
  if (!style) return { ok: true, stats: null, target: null };
  const effectivePasses = coveragePassLimit(style, maxPasses);
  const timeoutMs = coverageTimeoutForStyle(style);

  let timeoutId = 0;
  const timeoutPromise = new Promise((resolve) => {
    timeoutId = window.setTimeout(() => {
      resolve({
        ok: false,
        timedOut: true,
        stats: styleCoverageStats(style),
        target: styleCoverageTarget(style)
      });
    }, timeoutMs);
  });

  const coveragePromise = ensureStyleCoverage(style, effectivePasses);
  const result = await Promise.race([coveragePromise, timeoutPromise]);
  window.clearTimeout(timeoutId);
  return result;
}

function buildCoverageReport() {
  return Object.keys(STYLE_BPM_RULES)
    .map((style) => {
      const target = styleCoverageTarget(style);
      const stats = styleCoverageStats(style);
      return {
        style,
        tracks: stats.tracks,
        artists: stats.artists,
        labels: stats.labels,
        localArtists: stats.localArtists,
        targetTracks: target.tracks,
        targetArtists: target.artists,
        targetLabels: target.labels,
        healthy: isStyleCoverageHealthy(style, stats, target)
      };
    })
    .sort((a, b) => a.style.localeCompare(b.style));
}

function buildCatalogGenreAudit({ sampleLimit = 80 } = {}) {
  const issues = [];
  const issueTypeCounts = new Map();
  const styleIssueCounts = new Map();
  const problematicTrackKeys = new Set();

  const registerIssue = (track, issue, detail = "") => {
    const safeTrack = track || {};
    const style = String(safeTrack.style || "");
    const trackKey = recommendationTrackKey(safeTrack) || normalize(`${safeTrack.artist || ""}::${safeTrack.song || ""}`);
    if (trackKey) problematicTrackKeys.add(trackKey);
    issueTypeCounts.set(issue, (issueTypeCounts.get(issue) || 0) + 1);
    if (style) styleIssueCounts.set(style, (styleIssueCounts.get(style) || 0) + 1);
    issues.push({
      issue,
      detail,
      style,
      artist: String(safeTrack.artist || "").trim(),
      song: String(safeTrack.song || "").trim(),
      source: String(safeTrack.source || "").trim()
    });
  };

  catalog.forEach((track) => {
    if (!track || typeof track !== "object") return;
    const style = String(track.style || "").trim();
    if (!style || !STYLE_BPM_RULES[style]) {
      registerIssue(track, "invalid_style", "Style not found in STYLE_BPM_RULES.");
      return;
    }

    if (!artistAllowedForStyle(style, track.artist)) {
      registerIssue(track, "artist_not_allowed_for_style", "Artist/override/whitelist rule rejected this style.");
    }
    if (!labelAllowedForStyle(style, track.label)) {
      registerIssue(track, "label_not_allowed_for_style", "Label rule rejected this style.");
    }

    const bpmValue = Number(track.bpmExact);
    if (Number.isFinite(bpmValue) && bpmValue > 0 && !bpmFitsStyle(style, bpmValue)) {
      registerIssue(track, "bpm_out_of_style_range", `BPM ${Math.round(bpmValue)} outside ${style}.`);
    }

    if (hasTrackStyleSignalConflict(style, track)) {
      registerIssue(track, "style_signal_conflict", "Artist/label/genre text signals conflict with selected style.");
    }

    const hasAudioPreview = Boolean(normalizePreviewUrl(track.previewUrl));
    const hasYoutubePath = Boolean(buildYouTubeEmbedUrl(track, { autoplay: false }));
    const hasExternalPath = Boolean(buildSpotifyTrackLink(track) || buildYouTubeTrackLink(track) || buildSoundCloudTrackLink(track));
    if (!hasAudioPreview && !hasYoutubePath && !hasExternalPath) {
      registerIssue(track, "no_preview_or_external_path", "No audio preview, no YouTube embed, and no external fallback link.");
    }
  });

  const styleCoverageGaps = buildCoverageReport().filter((row) => !row.healthy);
  const byType = Object.fromEntries(
    Array.from(issueTypeCounts.entries()).sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]))
  );
  const byStyle = Object.fromEntries(
    Array.from(styleIssueCounts.entries()).sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]))
  );

  return {
    totalCatalogTracks: catalog.length,
    issueCount: issues.length,
    problematicTracks: problematicTrackKeys.size,
    stylesWithCoverageGap: styleCoverageGaps.length,
    byType,
    byStyle,
    sample: Number(sampleLimit) > 0 ? issues.slice(0, sampleLimit) : [],
    coverageGaps: styleCoverageGaps
  };
}

async function ensureStyleCoverage(style, maxPasses = COVERAGE_MAX_PASSES) {
  if (!style) return { ok: true, stats: null, target: null };

  const target = styleCoverageTarget(style);
  for (let pass = 0; pass < maxPasses; pass += 1) {
    sanitizeCatalogByStyleRules();
    purgeDynamicMismatches(style);
    const statsBefore = styleCoverageStats(style);
    if (isStyleCoverageHealthy(style, statsBefore, target)) {
      return { ok: true, stats: statsBefore, target };
    }

    await hydrateCatalogForStyle(style);
    sanitizeCatalogByStyleRules();
    purgeDynamicMismatches(style);

    const statsAfter = styleCoverageStats(style);
    if (isStyleCoverageHealthy(style, statsAfter, target)) {
      return { ok: true, stats: statsAfter, target };
    }

    const noProgress =
      statsAfter.tracks <= statsBefore.tracks &&
      statsAfter.artists <= statsBefore.artists &&
      statsAfter.labels <= statsBefore.labels;
    const localArtists = Number(statsAfter.localArtists) || styleLocalArtistKnowledgeCount(style);
    if (noProgress && pass >= 1 && localArtists <= 0) break;
  }

  const finalStats = styleCoverageStats(style);
  return { ok: isStyleCoverageHealthy(style, finalStats, target), stats: finalStats, target };
}

function canFallbackToPartialCoverage(coverage) {
  const tracks = Number(coverage?.stats?.tracks) || 0;
  const artists = Number(coverage?.stats?.artists) || 0;
  const localArtists = Number(coverage?.stats?.localArtists) || 0;
  return (tracks > 0 && artists > 0) || localArtists >= 4;
}

function resolveTrackDurationSeconds(track) {
  if (!track) return 0;
  const meta = TRACK_METADATA[`${track.song}|${track.artist}`] || {};
  return parseDurationTextToSeconds(meta.duration);
}

function isTrackEligibleForRecommendation(track) {
  if (!track) return false;
  if (!track.style || !track.artist || !track.song) return false;
  if (isLikelyChannelStyleArtistName(track.artist)) return false;
  if (isLikelyGeneratedTrackTitle(track.song)) return false;
  const trustedSlambient = isTrustedSlambientCatalogTrack(track);
  if (track.existenceVerified === false && !trustedSlambient) return false;
  if (!artistAllowedForStyle(track.style, track.artist)) return false;
  if (!labelAllowedForStyle(track.style, track.label)) return false;
  if (hasTrackStyleSignalConflict(track.style, track)) return false;
  const bpmValue = Number(track.bpmExact);
  if (Number.isFinite(bpmValue) && bpmValue > 0 && !bpmFitsStyle(track.style, bpmValue)) return false;
  if (isDynamicSource(track.source)) {
    if (requiresSeedAnchorForDynamicStyle(track.style) && !artistSeedAnchoredForStyle(track.style, track.artist)) {
      return false;
    }
    const invalidDynamic = isLikelyCompilationEntry({
      song: track.song,
      artist: track.artist,
      label: track.label,
      durationSec: resolveTrackDurationSeconds(track)
    });
    if (invalidDynamic) return false;
  }
  return true;
}

async function fetchDeezerTrackDetails(trackId) {
  if (!trackId) return null;
  try {
    const details = await deezerJsonp(`https://api.deezer.com/track/${trackId}`);
    return details && !details.error ? details : null;
  } catch (_err) {
    return null;
  }
}

async function fetchTracksByArtistAndStyle(artist, style) {
  const styleTerm = STYLE_SEARCH_TERMS[style] || styleLabelByValue(style);
  const styleTokens = String(styleTerm || "")
    .split(/\s+/)
    .map((token) => String(token || "").trim())
    .filter(Boolean);
  const compactStyleTerm = styleTokens.slice(0, 2).join(" ") || styleLabelByValue(style);
  const broadStyleToken = styleTokens[0] || styleLabelByValue(style);
  const familyHint = familyOf(style) === "psytrance" ? "psytrance" : "electronic";
  const fastMode = STRICT_DYNAMIC_BPM_STYLES.has(style) && style !== "psycore";
  const queries = Array.from(
    new Set(
      [
        `artist:"${artist}" ${compactStyleTerm}`,
        `artist:"${artist}" ${broadStyleToken}`,
        `artist:"${artist}"`,
        ...(fastMode ? [] : [`${artist} ${compactStyleTerm} ${familyHint}`])
      ]
        .map((query) => query.replace(/\s+/g, " ").trim())
        .filter(Boolean)
    )
  );
  const collected = new Map();

  for (const rawQuery of queries) {
    for (const index of (fastMode ? [0] : [0, 25])) {
      try {
        const query = encodeURIComponent(rawQuery);
        const data = await deezerJsonp(`https://api.deezer.com/search?q=${query}&limit=25&index=${index}`);
        if (!data || !Array.isArray(data.data)) continue;
        data.data
          .filter((row) => row?.id && row?.title && row?.artist?.name)
          .filter((row) => isArtistMatch(row.artist.name, artist))
          .forEach((row) => collected.set(String(row.id), row));
      } catch (_err) {
        // ignora e tenta proxima consulta
      }
    }
  }

  return Array.from(collected.values()).slice(0, 18);
}

async function fetchDeezerTracksByStyle(style) {
  const styleTerm = STYLE_SEARCH_TERMS[style] || styleLabelByValue(style);
  const styleTokens = String(styleTerm || "")
    .split(/\s+/)
    .map((token) => String(token || "").trim())
    .filter(Boolean);
  const compactStyleTerm = styleTokens.slice(0, 2).join(" ") || styleLabelByValue(style);
  const broadStyleToken = styleTokens[0] || styleLabelByValue(style);
  const fastMode = STRICT_DYNAMIC_BPM_STYLES.has(style) && style !== "psycore";
  const family = familyOf(style);
  const queries = Array.from(
    new Set(
      [
        `${compactStyleTerm} electronic`,
        `${broadStyleToken} electronic`,
        ...(family === "psytrance" ? [`${broadStyleToken} psytrance`] : []),
        ...(family === "techno" ? [`${broadStyleToken} techno`] : []),
        ...(family === "house" ? [`${broadStyleToken} house`] : []),
        ...(family === "dnb" ? [`${broadStyleToken} drum and bass`] : []),
        ...(fastMode ? [] : [`${compactStyleTerm} official`])
      ]
        .map((query) => query.replace(/\s+/g, " ").trim())
        .filter(Boolean)
    )
  );
  const collected = new Map();

  for (const rawQuery of queries) {
    for (const index of (fastMode ? [0, 25] : [0, 25, 50])) {
      try {
        const query = encodeURIComponent(rawQuery);
        const data = await deezerJsonp(`https://api.deezer.com/search?q=${query}&limit=25&index=${index}`);
        if (!data || !Array.isArray(data.data)) continue;
        data.data
          .filter((row) => row?.id && row?.title && row?.artist?.name)
          .forEach((row) => collected.set(String(row.id), row));
      } catch (_err) {
        // ignora erro de lote e continua com outros
      }
    }
  }

  return Array.from(collected.values()).slice(0, 90);
}

async function fetchItunesTracksByStyle(style, artist = "") {
  const styleTerm = STYLE_SEARCH_TERMS[style] || styleLabelByValue(style);
  const styleTokens = String(styleTerm || "")
    .split(/\s+/)
    .map((token) => String(token || "").trim())
    .filter(Boolean);
  const compactStyleTerm = styleTokens.slice(0, 2).join(" ") || styleLabelByValue(style);
  const family = familyOf(style);
  const genericScope = family === "techno"
    ? "techno"
    : family === "psytrance"
      ? "psytrance"
      : family === "house"
        ? "house"
        : family === "dnb"
          ? "drum and bass"
          : "electronic";
  const rawTerm = artist ? `${artist} ${compactStyleTerm}` : `${compactStyleTerm} ${genericScope}`;
  const term = encodeURIComponent(rawTerm);
  const collected = new Map();
  const fastMode = STRICT_DYNAMIC_BPM_STYLES.has(style) && style !== "psycore";
  const offsets = artist
    ? (fastMode ? [0] : [0, 60, 120])
    : (fastMode ? [0, 60] : [0, 60, 120]);

  for (const offset of offsets) {
    try {
      const data = await itunesJsonp(`https://itunes.apple.com/search?term=${term}&entity=song&limit=60&offset=${offset}`);
      const rows = data?.results || [];
      rows
        .filter((row) => row?.trackName && row?.artistName)
        .filter((row) => !artist || isArtistMatch(row.artistName, artist))
        .filter(
          (row) =>
            !hasTrackStyleSignalConflict(style, {
              artist: row.artistName,
              song: row.trackName,
              label: row.collectionName || "",
              artistGenre: row.primaryGenreName || "",
              source: artist ? "itunes_dynamic" : "itunes_style"
            })
        )
        .forEach((row) => collected.set(String(row.trackId || `${row.artistName}::${row.trackName}`), row));
    } catch (_err) {
      // segue fluxo com outros lotes/fontes
    }
  }

  return Array.from(collected.values()).slice(0, 80);
}

async function fetchItunesTracksByArtist(artist, style = "") {
  const artistName = String(artist || "").trim();
  if (!artistName) return [];
  const term = encodeURIComponent(artistName);
  const fastMode = STRICT_DYNAMIC_BPM_STYLES.has(style) && style !== "psycore";
  const offsets = fastMode ? [0] : [0, 60];
  const collected = new Map();

  for (const offset of offsets) {
    try {
      const data = await itunesJsonp(`https://itunes.apple.com/search?term=${term}&entity=song&limit=60&offset=${offset}`);
      const rows = data?.results || [];
      rows
        .filter((row) => row?.trackName && row?.artistName)
        .filter((row) => isArtistMatch(row.artistName, artistName))
        .filter(
          (row) =>
            !style ||
            !hasTrackStyleSignalConflict(style, {
              artist: row.artistName,
              song: row.trackName,
              label: row.collectionName || "",
              artistGenre: row.primaryGenreName || "",
              source: "itunes_artist"
            })
        )
        .forEach((row) => collected.set(String(row.trackId || `${row.artistName}::${row.trackName}`), row));
    } catch (_err) {
      // ignora lote com falha e continua
    }
  }

  return Array.from(collected.values()).slice(0, 80);
}

function addDynamicTrackToCatalog({
  style,
  song,
  artist,
  label = "Catálogo dinâmico",
  bpmExact = 0,
  previewUrl = "",
  releaseDate = "Catálogo dinâmico",
  durationSec = 0,
  source = "dynamic",
  artistCountry = "",
  artistGenre = "",
  artistProfileHint = ""
}, existingKeys) {
  const artistName = (artist || "").trim();
  const songName = (song || "").trim();
  if (!artistName || !songName) return false;
  if (hasTrackStyleSignalConflict(style, { artist: artistName, song: songName, label, artistGenre: artistGenre || "", source })) return false;
  if (isLikelyChannelStyleArtistName(artistName)) return false;
  if (isLikelyGeneratedTrackTitle(songName)) return false;
  if (!artistAllowedForStyle(style, artistName)) return false;
  if (isDynamicSource(source) && requiresSeedAnchorForDynamicStyle(style) && !artistSeedAnchoredForStyle(style, artistName)) return false;

  const rawLabel = String(label || "").trim();
  const labelLooksGenreDescriptor = isLikelyGenreDescriptorEntity(rawLabel);
  if (isDynamicSource(source) && familyOf(style) === "psytrance" && labelLooksGenreDescriptor) return false;

  const cleanLabel = sanitizeLabel(rawLabel, artistName, songName);
  if (!labelAllowedForStyle(style, cleanLabel)) return false;

  const key = normalize(`${artistName}::${songName}`);
  if (existingKeys.has(key)) return false;

  const bpmNumber = Number(bpmExact) || 0;
  if (requiresExactBpmForDynamic(style, source) && !bpmNumber) return false;
  if (bpmNumber && !bpmFitsStyle(style, bpmNumber)) return false;

  const fallbackBpm = Math.round((STYLE_BPM_RULES[style]?.min + STYLE_BPM_RULES[style]?.max || 130) / 2);
  const duration = Number(durationSec) || 0;
  const normalizedPreview = normalizePreviewUrl(previewUrl);
  if (isLikelyCompilationEntry({ song: songName, artist: artistName, label: cleanLabel, durationSec: duration })) return false;
  const durationText = duration > 0
    ? `${String(Math.floor(duration / 60)).padStart(2, "0")}:${String(duration % 60).padStart(2, "0")}`
    : "06:00";

  const hydratedTrack = {
    style,
    song: songName,
    artist: artistName,
    label: cleanLabel,
    bpm: mapBpmToRange(bpmNumber || fallbackBpm),
    bpmExact: bpmNumber || undefined,
    energy: energyFromBpm(bpmNumber || fallbackBpm),
    vocals: "instrumental",
    context: ["peak", "treino", "estrada", "after", "foco", "warmup"],
    vibe: `Faixa descoberta automaticamente para ${styleLabelByValue(style)}.`,
    spotifyUrl: `https://open.spotify.com/search/${encodeURIComponent(`track:"${songName}" artist:"${artistName}"`)}`,
    youtubeUrl: `https://www.youtube.com/results?search_query=${encodeURIComponent(`${artistName} ${songName}`)}`,
    soundcloudTrackUrl: `https://soundcloud.com/search?q=${encodeURIComponent(`"${artistName}" "${songName}"`)}`,
    beatportUrl: `https://www.beatport.com/search?q=${encodeURIComponent(`${artistName} ${songName}`)}`,
    youtubeTrackUrl: `https://www.youtube.com/results?search_query=${encodeURIComponent(`"${songName}" "${artistName}"`)}`,
    previewUrl: normalizedPreview,
    previewCandidates: normalizedPreview ? [normalizedPreview] : [],
    spotifyVerified: false,
    existenceVerified: normalizedPreview ? true : undefined,
    previewChecked: Boolean(normalizedPreview),
    previewMissing: !normalizedPreview,
    artistCountry: String(artistCountry || "").trim(),
    artistGenre: String(artistGenre || "").trim(),
    artistProfileHint: String(artistProfileHint || "").trim(),
    artistBio: `${artistName} apareceu na busca dinamica para ampliar sua descoberta no subgênero ${styleLabelByValue(style)}.`,
    labelBio: buildDynamicLabelSummary(style, cleanLabel),
    source
  };

  catalog.push(hydratedTrack);
  existingKeys.add(key);
  TRACK_METADATA[`${songName}|${artistName}`] = {
    releaseDate,
    duration: durationText,
    musicalKey: "N/A",
    catalogRef: `${source.toUpperCase().slice(0, 4)}-${style.toUpperCase().slice(0, 5)}`
  };

  return true;
}

function injectLocalTrackSeedBoost() {
  const existingKeys = new Set(catalog.map((track) => recommendationTrackKey(track)));
  let added = 0;
  LOCAL_TRACK_SEED_BOOST.forEach((seed) => {
    const releaseDate = normalizeDatasetReleaseDate(seed.releaseDate || "Catálogo local");
    const inserted = addDynamicTrackToCatalog(
      {
        style: seed.style,
        song: seed.song,
        artist: seed.artist,
        label: seed.label || "Catálogo curado",
        bpmExact: Number(seed.bpmExact) || 0,
        previewUrl: "",
        releaseDate,
        durationSec: Number(seed.durationSec) || 0,
        source: "dataset_local_seed_boost",
        artistCountry: String(seed.artistCountry || "").trim(),
        artistGenre: String(seed.artistGenre || "").trim(),
        artistProfileHint: String(seed.artistProfileHint || "").trim() || "Seed local curado para ampliar cobertura e rotação de artistas."
      },
      existingKeys
    );
    if (inserted) {
      added += 1;
      if (releaseDate && releaseDate !== "Catálogo dinâmico" && releaseDate !== "Catálogo local") {
        registerRecentArtistSignal(seed.style, seed.artist, releaseDate, "local_seed_boost");
      }
    }
  });
  return added;
}

async function hydrateCatalogForStyle(style) {
  if (!style) return;
  purgeDynamicMismatches(style);
  const knowledgeArtists = collectStyleKnowledgeArtists(style);
  const seeds = knowledgeArtists.length ? knowledgeArtists : (STYLE_ARTIST_SEEDS[style] || []);
  if (!seeds.length) return;

  const targetSize = targetCatalogSizeForStyle(style);
  const coverageTarget = styleCoverageTarget(style);
  const currentStats = styleCoverageStats(style);
  if (
    currentStats.tracks >= Math.max(targetSize, coverageTarget.tracks) &&
    currentStats.artists >= coverageTarget.artists &&
    currentStats.labels >= coverageTarget.labels
  ) return;

  const existingKeys = new Set(catalog.map((t) => normalize(`${t.artist}::${t.song}`)));
  const seedCap = style === "psycore" ? 48 : STRICT_DYNAMIC_BPM_STYLES.has(style) ? 12 : 24;
  const skipBroadStyleHydration = NO_BROAD_STYLE_HYDRATION_STYLES.has(style);
  const selectedSeeds = selectHydrationArtists(style, seeds, Math.min(seedCap, seeds.length));

  for (const artist of selectedSeeds) {
    const results = await fetchTracksByArtistAndStyle(artist, style);
    for (const row of results) {
      const details = await fetchDeezerTrackDetails(row.id);
      addDynamicTrackToCatalog({
        style,
        song: row.title,
        artist: row.artist.name,
        label: details?.label || row.album?.title || "Catálogo dinâmico",
        bpmExact: Number(details?.bpm) || 0,
        previewUrl: row.preview || details?.preview || "",
        releaseDate: details?.release_date || "Catálogo dinâmico",
        durationSec: Number(details?.duration) || Number(row.duration) || 0,
        artistProfileHint: row.album?.title || "",
        source: "deezer_dynamic"
      }, existingKeys);

      const stats = stylePoolStats(style);
      if (stats.trackCount >= targetSize) break;
    }

    const stats = stylePoolStats(style);
    if (stats.trackCount >= targetSize) break;
  }

  // Segunda fonte: iTunes Search para aumentar variedade e preview.
  for (const artist of selectedSeeds) {
    const rows = await fetchItunesTracksByStyle(style, artist);
    for (const row of rows) {
      addDynamicTrackToCatalog({
        style,
        song: row.trackName,
        artist: row.artistName,
        label: row.collectionName || row.artistName || "Catálogo dinâmico",
        bpmExact: 0,
        previewUrl: row.previewUrl || "",
        releaseDate: row.releaseDate ? String(row.releaseDate).slice(0, 10) : "Catálogo dinâmico",
        durationSec: Math.round((Number(row.trackTimeMillis) || 0) / 1000),
        artistCountry: "",
        artistGenre: row.primaryGenreName || "",
        artistProfileHint: row.collectionName || "",
        source: "itunes_dynamic"
      }, existingKeys);

      const stats = stylePoolStats(style);
      if (stats.trackCount >= targetSize) break;
    }
    const stats = stylePoolStats(style);
    if (stats.trackCount >= targetSize) break;
  }

  let stats = stylePoolStats(style);

  // Fallback por artista puro: usa base local de artistas quando o termo de estilo falha.
  if (stats.trackCount < targetSize) {
    for (const artist of selectedSeeds) {
      const rows = await fetchItunesTracksByArtist(artist, style);
      for (const row of rows) {
        addDynamicTrackToCatalog({
          style,
          song: row.trackName,
          artist: row.artistName,
          label: row.collectionName || row.artistName || "Catálogo dinâmico",
          bpmExact: 0,
          previewUrl: row.previewUrl || "",
          releaseDate: row.releaseDate ? String(row.releaseDate).slice(0, 10) : "Catálogo dinâmico",
          durationSec: Math.round((Number(row.trackTimeMillis) || 0) / 1000),
          artistCountry: "",
          artistGenre: row.primaryGenreName || "",
          artistProfileHint: row.collectionName || "",
          source: "itunes_artist"
        }, existingKeys);

        stats = stylePoolStats(style);
        if (stats.trackCount >= targetSize) break;
      }
      if (stats.trackCount >= targetSize) break;
    }
  }

  // Busca genérica por estilo para atingir cobertura mínima (20 artistas + 20 faixas).
  if (
    !skipBroadStyleHydration &&
    (stats.trackCount < MIN_TRACKS_PER_STYLE || stats.artistCount < MIN_ARTISTS_PER_STYLE) &&
    familyOf(style) !== "techno"
  ) {
    const genericRows = await fetchItunesTracksByStyle(style);
    for (const row of genericRows) {
      addDynamicTrackToCatalog({
        style,
        song: row.trackName,
        artist: row.artistName,
        label: row.collectionName || row.artistName || "Catálogo dinâmico",
        bpmExact: 0,
        previewUrl: row.previewUrl || "",
        releaseDate: row.releaseDate ? String(row.releaseDate).slice(0, 10) : "Catálogo dinâmico",
        durationSec: Math.round((Number(row.trackTimeMillis) || 0) / 1000),
        artistCountry: "",
        artistGenre: row.primaryGenreName || "",
        artistProfileHint: row.collectionName || "",
        source: "itunes_style"
      }, existingKeys);

      stats = stylePoolStats(style);
      if (stats.trackCount >= targetSize && stats.artistCount >= MIN_ARTISTS_PER_STYLE) break;
    }
  }

  // Terceira fonte real: Deezer por termo de subgênero (sem depender apenas de seeds).
  stats = stylePoolStats(style);
  if (!skipBroadStyleHydration && (stats.trackCount < MIN_TRACKS_PER_STYLE || stats.artistCount < MIN_ARTISTS_PER_STYLE)) {
    const deezerStyleRows = await fetchDeezerTracksByStyle(style);
    for (const row of deezerStyleRows) {
      const details = await fetchDeezerTrackDetails(row.id);
      addDynamicTrackToCatalog({
        style,
        song: row.title,
        artist: row.artist?.name || "",
        label: details?.label || row.album?.title || "Catálogo dinâmico",
        bpmExact: Number(details?.bpm) || 0,
        previewUrl: row.preview || details?.preview || "",
        releaseDate: details?.release_date || "Catálogo dinâmico",
        durationSec: Number(details?.duration) || Number(row.duration) || 0,
        artistProfileHint: row.album?.title || "",
        source: "deezer_style"
      }, existingKeys);

      stats = stylePoolStats(style);
      if (stats.trackCount >= targetSize && stats.artistCount >= MIN_ARTISTS_PER_STYLE) break;
    }
  }

  dynamicCatalogByStyle.set(style, Date.now());
  saveDynamicCatalogCache();
}

function getAllSelectableStyles() {
  if (!styleEl) return [];
  return Array.from(styleEl.options)
    .map((option) => option.value)
    .filter(Boolean);
}

async function hydrateCatalogUntilCoverage(style, maxPasses = COVERAGE_MAX_PASSES) {
  const coverage = await ensureStyleCoverageWithTimeout(style, maxPasses);
  return coverage.stats || styleCoverageStats(style);
}

async function warmupCatalogInBackground() {
  if (catalogWarmupRunning) return;
  catalogWarmupRunning = true;
  const styles = getAllSelectableStyles();

  for (const style of styles) {
    const stats = await hydrateCatalogUntilCoverage(style, 2);
    if (feedbackMessage && style === (styleEl?.value || "")) {
      feedbackMessage.textContent = t("catalogUpdateProgress", {
        style: styleLabelByValue(style),
        tracks: stats.tracks,
        artists: stats.artists
      });
    }
  }

  catalogWarmupRunning = false;
  showToast(t("warmupCatalogToast"));
}

async function resolvePreviewForTrack(track, { forceLookup = false } = {}) {
  if (!track) return;
  const trustedSlambient = isTrustedSlambientCatalogTrack(track);
  if (trustedSlambient) normalizeTrustedSlambientCatalog();
  const currentPreview = normalizePreviewUrl(track.previewUrl);
  if (currentPreview) {
    track.previewUrl = currentPreview;
    registerPreviewCandidate(track, currentPreview);
  }
  if (currentPreview && track.existenceVerified !== false && !forceLookup && (trustedSlambient || track.previewLookupAttempted)) {
    track.existenceVerified = true;
    track.previewChecked = true;
    track.previewMissing = false;
    return;
  }
  if (track.previewChecked && track.existenceVerified !== undefined && !forceLookup && (trustedSlambient || track.previewLookupAttempted)) return;

  let foundEvidence = Boolean(currentPreview);
  const strictStyle = hasStrictWhitelist(track.style) || STRICT_ARTIST_MATCH_STYLES.has(track.style);
  const minConfidence = track.style === "slambient" ? 0.97 : strictStyle ? 0.94 : 0.9;
  const ensureTrackMetadata = (releaseDate = "", durationSec = 0, catalogRef = "") => {
    const current = TRACK_METADATA[`${track.song}|${track.artist}`] || {};
    const duration =
      durationSec > 0
        ? `${String(Math.floor(durationSec / 60)).padStart(2, "0")}:${String(durationSec % 60).padStart(2, "0")}`
        : current.duration || "06:00";
    TRACK_METADATA[`${track.song}|${track.artist}`] = {
      releaseDate: releaseDate || current.releaseDate || "Catálogo local",
      duration,
      musicalKey: current.musicalKey || "N/A",
      catalogRef: catalogRef || current.catalogRef || "CATALOGO"
    };
  };

  try {
    const query = encodeURIComponent(`artist:"${track.artist}" track:"${track.song}"`);
    const data = await deezerJsonp(`https://api.deezer.com/search?q=${query}`);
    const ranked = (data?.data || [])
      .filter((item) => isArtistMatch(item?.artist?.name || "", track.artist))
      .map((item) => ({
        item,
        score: titleConfidence(track.song, item?.title || "")
      }))
      .sort((a, b) => b.score - a.score);

    const best = ranked[0];
    const candidateTitle = best?.item?.title || "";
    const deezerMatch =
      best &&
      best.score >= minConfidence &&
      strictTitleMatch(track.song, candidateTitle)
        ? best.item
        : null;

    if (deezerMatch) {
      foundEvidence = true;
      track.existenceVerified = true;
      track.spotifyVerified = true;
      track.youtubeVerified = true;
      track.previewConfidence = best.score;
      track.artistProfileHint = track.artistProfileHint || deezerMatch?.album?.title || "";
      promotePreviewCandidate(track, deezerMatch.preview || "");
      track.spotifyTrackUrl = buildSpotifyTrackLink(track);
      track.youtubeTrackUrl = buildYouTubeTrackLink(track);

      const details = await fetchDeezerTrackDetails(deezerMatch.id);
      if (details?.bpm && !bpmFitsStyle(track.style, Number(details.bpm))) {
        track.existenceVerified = false;
        track.previewUrl = "";
        track.previewCandidates = [];
        track.previewChecked = true;
        track.previewMissing = true;
        track.previewLookupAttempted = true;
        return;
      }
      if (details?.bpm && bpmFitsStyle(track.style, Number(details.bpm))) {
        track.bpmExact = Number(details.bpm);
        track.bpm = mapBpmToRange(track.bpmExact);
        track.energy = energyFromBpm(track.bpmExact);
      }
      ensureTrackMetadata(details?.release_date || "", Number(details?.duration) || Number(deezerMatch?.duration) || 0, details?.isrc || "DEEZER");
    }
  } catch (_err) {
    // tenta iTunes abaixo
  }

  try {
    const term = encodeURIComponent(`${track.artist} ${track.song}`);
    const data = await itunesJsonp(`https://itunes.apple.com/search?term=${term}&entity=song&limit=40`);
    const ranked = (data?.results || [])
      .filter((row) => isArtistMatch(row?.artistName || "", track.artist))
      .map((row) => ({
        row,
        score: titleConfidence(track.song, row?.trackName || "")
      }))
      .sort((a, b) => b.score - a.score);

    const best = ranked[0];
    const candidateTitle = best?.row?.trackName || "";
    const itunesMatch =
      best &&
      best.score >= (strictStyle ? 0.94 : 0.91) &&
      strictTitleMatch(track.song, candidateTitle)
        ? best.row
        : null;

    if (itunesMatch) {
      foundEvidence = true;
      track.existenceVerified = true;
      track.spotifyVerified = true;
      track.youtubeVerified = true;
      track.artistGenre = track.artistGenre || String(itunesMatch.primaryGenreName || "").trim();
      track.artistProfileHint = track.artistProfileHint || String(itunesMatch.collectionName || "").trim();
      promotePreviewCandidate(track, itunesMatch.previewUrl || "");
      track.previewConfidence = Math.max(Number(track.previewConfidence) || 0, best.score);
      if (!track.spotifyTrackUrl) {
        track.spotifyTrackUrl = buildSpotifyTrackLink(track);
      }
      if (!track.youtubeTrackUrl) {
        track.youtubeTrackUrl = buildYouTubeTrackLink(track);
      }
      ensureTrackMetadata(
        itunesMatch.releaseDate ? String(itunesMatch.releaseDate).slice(0, 10) : "",
        Math.round((Number(itunesMatch.trackTimeMillis) || 0) / 1000),
        String(itunesMatch.trackId || "ITUNES")
      );
    }
  } catch (_err) {
    // sem fallback adicional
  }

  if (!foundEvidence && !trustedSlambient) {
    track.existenceVerified = false;
  }
  if (track.existenceVerified === undefined) {
    track.existenceVerified = trustedSlambient ? true : foundEvidence;
  }
  const previewCandidates = previewCandidatesForTrack(track);
  track.previewUrl = previewCandidates[0] || "";
  track.previewChecked = true;
  track.previewMissing = previewCandidates.length === 0;
  track.previewLookupAttempted = true;
}

const I18N = {
  pt: {
    introKicker: "Pre-show sensorial",
    introTitle: "Entre na frequencia da pista",
    introDesc: "Antes de escolher o idioma, viva uma abertura animada com frases psicodelicas em movimento.",
    introImpact: "Seu ouvido comeca a ser lido no primeiro pulso.",
    introContinueBtn: "Comecar agora",
    audioOn: "Som ligado",
    audioOff: "Som desligado",
    audioActivateHint: "Toque na tela para liberar audio no navegador.",
    langKicker: "Escolha seu idioma",
    langTitle: "Selecione o idioma",
    langDesc: "Escolha o idioma para toda a experiência do app.",
    appSlogan: "Nós amamos música",
    appMission: "Nossa missão: achar tracks memoráveis para você que você não acharia sem o Sonic Search.",
    authKicker: "Carregar usuário",
    authTitle: "Entre para carregar seu perfil",
    authDesc: "Faça login para continuar com seu perfil salvo ou continue sem login.",
    authUsernameLabel: "Usuário",
    authPasswordLabel: "Senha",
    authUsernamePlaceholder: "Digite seu usuário",
    authPasswordPlaceholder: "Digite sua senha",
    authLoginBtn: "Entrar",
    authGuestBtn: "Continuar sem login",
    authRequired: "Preencha usuário e senha para entrar, ou continue sem login.",
    authLoggedAs: "Perfil carregado para {user}.",
    authGuestReady: "Modo visitante ativado. Você pode usar o app sem login.",
    welcomeKicker: "Curadoria de música eletrônica",
    welcomeTitle: "SONIC SEARCH",
    welcomeDesc: "Seu sommelier de música eletrônica para rave, treino, foco ou viagem. Escolha seu estilo e receba faixa + artista novo para descobrir.",
    startBtn: "Iniciar experiência",
    startSurpriseBtn: "Surpreenda-me",
    quickSurpriseTitle: "Surpreenda-me com novidade real",
    quickSurpriseHint: "Me diga o subgênero que você mais ouve, artistas e músicas que já conhece para eu buscar algo realmente novo.",
    quickSurpriseStyleLabel: "Subgênero que você mais ouve",
    quickSurpriseStylePlaceholder: "Escolha o subgênero",
    quickSurpriseKnownLabel: "Artistas que você já conhece",
    quickSurpriseKnownPlaceholder: "Ex.: Astrix, Charlotte de Witte, Alok",
    quickSurpriseKnownTracksLabel: "Músicas que você já conhece",
    quickSurpriseKnownTracksPlaceholder: "Ex.: Poison Turtle, Hit N Run",
    quickSurpriseRunBtn: "Gerar surpresa focada",
    quickSurpriseCancelBtn: "Cancelar",
    quickSurpriseNeedStyle: "Escolha primeiro o subgênero que você mais ouve para eu surpreender melhor.",
    quickSurpriseGenerated: "Surpresa gerada com foco em faixa nova dentro de {style}.",
    heroTitle: "Curadoria de eletrônica, com descoberta real",
    heroDesc: "Inclui psytrance (forest/dark/dark experimental/full-on/prog/hitech), techno (acid/hard/minimal), house, drum and bass e outros subgêneros importantes para não deixar nada de fora.",
    recommendBtn: "Gerar recomendação",
    rerollBtn: "Nova sugestão no mesmo perfil",
    surpriseBtn: "Surpreender",
    adaptiveSurpriseBtn: "Surpreenda por perfil",
    clearFiltersBtn: "Limpar filtros",
    resetAppBtn: "Novo usuário (reset total)",
    resetAppConfirm: "Isso vai apagar todo o seu histórico local e reiniciar o app como novo usuário. Deseja continuar?",
    generatedNow: "Gerada agora",
    freeStyle: "estilo livre",
    freeContext: "contexto livre",
    freeEnergy: "energia livre",
    match: "Match",
    bpm: "BPM",
    bpmRangeLabel: "faixa",
    bpmVerifiedLabel: "validado",
    bpmApiMetadataLabel: "metadado de API",
    bpmCatalogReferenceLabel: "referência de catálogo",
    bpmUnverifiedLabel: "BPM não verificado",
    bpmEstimatedRange: "estimativa {range}",
    energyPrefix: "Energia",
    releasePrefix: "Lançamento",
    durationPrefix: "Duração",
    keyPrefix: "Key",
    catalogPrefix: "Catálogo",
    labelPrefix: "Gravadora",
    suggestedSubgenre: "Subgênero sugerido",
    styleInfoTitle: "Leitura rápida do subgênero",
    styleInfoBpmLabel: "Faixa típica",
    styleInfoTip: "Use como referência: BPM e estética variam entre artistas, labels e época.",
    styleInfoSource: "Referências: guias de gênero (Wikipedia e Beatportal) + curadoria Sonic Search.",
    styleInfoFallback: "Subgênero com fronteiras flexíveis. A curadoria cruza estética, contexto e BPM para reduzir recomendações fora do estilo.",
    styleInfoCloseAria: "Fechar balão do subgênero",
    defaultStats: "Nenhum feedback ainda.",
    stats: "Likes faixa: {likedSongs} | Likes artista: {likedArtists} | Descobertas curtidas: {likedDiscoveries} | Já conhecia: {alreadyKnew} | Não combinou: {skipped} | Conheceu no app: {discoveredInApp} | Avaliações: {ratingCount} | Média: {ratingAvg}",
    ratingTitle: "Avalie esta recomendação",
    ratingHint: "1 estrela = gostei pouco • 5 estrelas = gostei muito",
    ratingCelebration: "Celebração ativa",
    ratingAriaGroup: "Avaliação em estrelas",
    ratingSavedHint: "Você avaliou com {stars} estrelas.",
    ratingSavedFeedback: "Avaliação registrada: {stars} estrelas para {song}.",
    ratingSavedToast: "Avaliação salva: {stars} estrelas.",
    suggestionQueueTitle: "Fila inteligente: 3 sugestões",
    suggestionQueueHint: "Troque na hora sem mudar seus filtros.",
    queueNow: "Agora",
    queueNext: "Próxima",
    queueUse: "Tocar esta",
    queueActivated: "Fila ativa: agora tocando {song}.",
    trackAiTitle: "Radar IA da faixa",
    trackAiRefreshBtn: "Atualizar leitura",
    trackAiLoading: "Analisando sua faixa atual e preparando uma leitura rápida...",
    trackAiApiSource: "Leitura gerada por IA em tempo real.",
    trackAiLocalSource: "Leitura local baseada em subgênero, BPM, energia e contexto.",
    trackAiFallback: "Essa faixa está alinhada ao seu perfil: combine o groove com seu momento e avalie em estrelas para refinar ainda mais.",
    trackAiUpdatedToast: "Leitura IA atualizada.",
    summaryPanelTitle: "7) Resumo de perfil",
    summaryStatusLabel: "Status do perfil",
    summaryKnownCountLabel: "Artistas conhecidos",
    summaryDiscoveredCountLabel: "Artistas conhecidos no app",
    summaryLikedCountLabel: "Artistas que curte",
    summaryDislikedCountLabel: "Artistas que não curte",
    summaryFavoriteStyleLabel: "Gênero favorito",
    summaryAchievementLabel: "Conquista 5 estrelas",
    summaryAchievementPending: "Avalie faixas com 5 estrelas para desbloquear esta conquista.",
    summaryAchievementFiveStarOne: "Você avaliou {count} música com 5 estrelas.",
    summaryAchievementFiveStarMany: "Você avaliou {count} músicas com 5 estrelas.",
    summaryAchievementTierA: "Ritual inicial",
    summaryAchievementTierB: "Curador de ouro",
    summaryAchievementTierC: "Sommelier magnético",
    summaryAchievementTierD: "Lenda do espectro",
    summaryAchievementTierProgress: "Nível atual: {tier}. Faltam {remaining} faixas 5★ para {nextTier} ({nextAt}).",
    summaryAchievementTierMax: "Nível máximo alcançado: {tier}.",
    summaryFiveStarTracksTitle: "Faixas que você marcou com 5 estrelas",
    summaryEmptyFiveStarTracks: "Avalie faixas com 5 estrelas para montar seu mapa de gosto.",
    summaryKnownArtistsTitle: "Artistas que você conhece",
    summaryLikedArtistsTitle: "Artistas que você curte",
    summaryDislikedArtistsTitle: "Artistas que você não curte",
    summaryNoData: "Sem dados",
    summaryStatusNew: "Novo",
    summaryStatusExploring: "Explorando",
    summaryStatusActive: "Ativo",
    summaryStatusAdvanced: "Curadoria avançada",
    summaryEmptyKnown: "Nenhum artista marcado como conhecido ainda.",
    summaryEmptyLiked: "Ainda sem artistas curtidos.",
    summaryEmptyDisliked: "Ainda sem artistas marcados como não curtidos.",
    listenersSubtitle: "{count} ouvintes da comunidade nas últimas horas (feed local).",
    topListenersTitle: "Top listeners da comunidade",
    topListenersSubtitle: "Ranking do eixo {style} nas últimas 24h (sinal local).",
    topListenerRank: "TOP {rank}",
    topListenerScore: "{score} pontos",
    topListenerPlays: "{plays} plays",
    previewSearching: "Buscando preview da faixa...",
    previewValidated: "Preview validado com alta confiança. Está gostando do que está escutando?",
    previewLoaded: "Preview carregado com boa confiança. Está gostando do que está escutando?",
    previewReady: "Preview pronto. Clique play para ouvir e avaliar.",
    previewYoutubeInlineHint: "Player do YouTube disponível abaixo para assistir direto no app.",
    previewYoutubeOptionalHint: "Se quiser assistir no app, abra o player do YouTube abaixo.",
    previewYoutubeOpenInlineBtn: "Abrir player no app",
    previewYoutubeCloseInlineBtn: "Ocultar player",
    previewYoutubeRetryBtn: "Tentar outro vídeo",
    previewYoutubeFallback: "Preview em áudio indisponível. Carreguei player do YouTube para você avaliar sem sair da tela.",
    previewUnavailable: "Preview indisponível para esta faixa. Use Spotify/YouTube/SoundCloud e me diga se gostou.",
    previewUnavailableWithLinks: "Preview indisponível para esta faixa. Use {platforms} e me diga se gostou.",
    spotifyUnverified: "Link do Spotify não verificado: abrindo busca aproximada para esta faixa.",
    youtubeUnverified: "Link do YouTube ainda não verificado para evitar abrir faixa errada.",
    soundcloudUnverified: "Link do SoundCloud ainda não verificado para evitar abrir faixa errada.",
    toastError: "Ops, deu um erro nesta ação. Já vou melhorar isso.",
    feedbackError: "Ocorreu um erro ao processar a ação. Tente novamente.",
    toastButtonFallback: "Ação registrada. Esse botão já está clicável.",
    eventNotFound: "Não encontrei eventos futuros para {artist} agora.",
    eventRealLoaded: "Agenda real de {artist} carregada.",
    eventFallbackLoaded: "Agenda de {artist} carregada em modo catálogo local.",
    openEvent: "Abrir evento",
    genericVibe: "Faixa recomendada para o perfil {style}.",
    genericArtistBio: "{artist} aparece com destaque no subgênero {style}.",
    genericLabelBio: "{label} participa de lançamentos relevantes no subgênero {style}.",
    artistSocialsTitle: "Redes do artista",
    artistSocialsHint: "Links por busca do nome do artista nas plataformas.",
    warmupCatalogToast: "Catálogo ampliado em background para todos os subgêneros.",
    eventsPrompt: "Curta um artista para carregar agenda de shows.",
    eventsLoading: "Buscando próximos eventos de {artist}...",
    searchingCatalog: "Pesquisando catálogo e montando sugestão...",
    catalogGenerating: "Catálogo {style}: {tracks} faixas / {artists} artistas. Gerando recomendação...",
    recommendationGenerated: "Recomendação gerada com base nas preferências que você selecionou.",
    exploratoryGenerated: "Sem filtros definidos: gerei uma recomendação exploratória.",
    styleExhaustedFallback: "Não encontrei artistas novos em {from} agora. Troquei para {to} para manter descoberta sem repetição.",
    surpriseCrossGenreGenerated: "Surpresa ativa: saí de {from} e trouxe um artista de {to}.",
    surpriseAdaptiveGenerated: "Surpresa por perfil: usando seus likes e dislikes, saí de {from} e trouxe uma faixa nova de {to}.",
    surpriseAdaptiveNeedSignals: "Faça alguns likes/dislikes primeiro para eu aprender seu perfil e surpreender melhor.",
    rerollNoOption: "Não há outra faixa no catálogo para esse estilo específico no momento.",
    rerollGenerated: "Nova sugestão gerada com rotação de artista e faixa no mesmo perfil.",
    clearFiltersFeedback: "Filtros limpos. Você pode gerar uma busca exploratória.",
    noUnknownOption: "Não achei outra opção desconhecida com esse perfil no catálogo local agora.",
    swappedUnknown: "Beleza. Troquei para outra sugestão parecida que você provavelmente ainda não conhece.",
    toastFoundNewArtist: "Perfeito. Busquei outro artista para você descobrir.",
    newArtistDetected: "Top. Artista novo identificado. Avalie no preview logo abaixo para eu aprender seu gosto.",
    toastNewDiscovery: "Que bom! Descoberta nova desbloqueada.",
    prioritizeSimilar: "Perfeito. Vou priorizar sons parecidos e abrir agenda do artista.",
    toastShowMoreLikeThis: "Que bom que gostou! Vou te mostrar mais nessa linha.",
    swappedNow: "Troquei agora com nova pesquisa no mesmo perfil e sem repetir artista/faixa.",
    toastSwapped: "Sem problema. Troquei para outra faixa agora.",
    celebrationActivated: "Celebração ativada. {song} entrou nas suas descobertas favoritas.",
    toastFavoritedDiscovery: "Excelente escolha! Descoberta favoritada.",
    refinedAfterNo: "Troquei a faixa com base no seu feedback para refinar sua curadoria.",
    toastTryBetter: "Entendi, vou tentar uma recomendação melhor.",
    songAddedProfile: "Boa. A faixa {song} entrou no seu perfil.",
    toastSongLiked: "Boa! Faixa curtida.",
    artistFavorited: "Perfeito. O artista {artist} foi marcado como favorito.",
    toastArtistSaved: "Artista salvo como favorito.",
    artistBlockedFromRecommendations: "Perfeito. O artista {artist} não será mais recomendado para você.",
    toastArtistBlocked: "Artista bloqueado das recomendações.",
    enableDiscoveryMode: "Ative o modo descoberta para receber artista novo.",
    likedDiscovery: "Ótimo, você curtiu conhecer {artist}.",
    toastDiscoveryLiked: "Top! Descoberta curtida.",
    discoveryKnown: "Anotado. Vou buscar nomes ainda menos óbvios na próxima.",
    toastDiscoveryKnown: "Anotado. Vou aprofundar as próximas descobertas.",
    previewIssueLearned: "Entendi. Parece falha de preview/reprodução. Vou priorizar próximas faixas com player mais confiável.",
    toastPreviewIssueLearned: "Perfeito. Ajustei para evitar faixas com preview ruim.",
    skipAdjusted: "Recebido. Refiz a pesquisa e ajustei o próximo match com base no seu não.",
    toastSkipAdjusted: "Fechado. Ajustei sua recomendação com base no seu feedback.",
    catalogUpdateProgress: "Atualizando catálogo {style}: {tracks} faixas / {artists} artistas.",
    searchOverlayTitle: "Buscando recomendação",
    searchOverlayPreparing: "Analisando filtros e preparando busca...",
    searchOverlayCatalog: "Buscando e validando músicas do catálogo...",
    searchOverlayGenerating: "Gerando melhor match para seu perfil...",
    searchOverlayFinishing: "Finalizando recomendação...",
    newArtistsBtn: "Buscar artistas novos (< 2 anos)",
    newArtistsTitle: "Artistas novos no subgênero",
    newArtistsSelectStyle: "Escolha um subgênero para buscar artistas novos.",
    newArtistsSearching: "Buscando artistas com lançamentos recentes neste subgênero...",
    newArtistsFound: "Encontrei {count} artista(s) com lançamento em até 2 anos em {style}.",
    newArtistsNone: "Não foi encontrado nenhum artista novo neste subgênero nos últimos 24 meses.",
    newArtistsReleaseLabel: "Último lançamento",
    newArtistsGenreLabel: "Eixo de gênero",
    catalogInsufficient: "Catálogo insuficiente para {style}. Atual: {tracks}/{targetTracks} faixas, {artists}/{targetArtists} artistas, {labels}/{targetLabels} gravadoras.",
    catalogInsufficientToast: "Catálogo ainda insuficiente para recomendação confiável deste subgênero.",
    catalogFallbackToast: "Cobertura parcial neste subgênero. Vou recomendar com o catálogo local disponível.",
    catalogFallbackUsingLocal: "Cobertura parcial em {style} ({tracks} faixas / {artists} artistas). Recomendação gerada com o catálogo local enquanto continuo expandindo.",
    catalogFallbackSearching: "Cobertura parcial em {style}. Buscando artistas novos com o catálogo disponível...",
    spiritPanelTitle: "6) Seu espírito musical",
    spiritIntro: "A cada 10 músicas curtidas, seu espírito musical é revisado.",
    spiritBadge: "Espírito desbloqueado",
    spiritAvatarAlt: "Avatar do espírito {name}",
    spiritProgressLocked: "Músicas curtidas: {current}/{target}. Faltam {remaining} para revelar seu espírito.",
    spiritProgressUnlocked: "Perfil consolidado com {current} músicas curtidas.",
    spiritUnlockedToast: "Espírito revelado: {name}",
    spiritUnlockedFeedback: "Seu espírito musical foi revelado: {name}.",
    spiritShiftedFeedback: "Seu espírito musical evoluiu para: {name}.",
    spiritReviewStayedFeedback: "Revisão concluída: seu espírito permanece {name}.",
    spiritReviewStayedToast: "Revisão concluída: espírito mantido em {name}.",
    spiritReviewShiftedToast: "Revisão concluída: espírito atualizado para {name}.",
    spiritVisualTitle: "Modo visual do espírito",
    spiritVisualHint: "Loop de ambientação audiovisual alinhado ao seu perfil atual.",
    spiritSpotlightTitle: "Faixa do espírito",
    spiritSpotlightHintFavorite: "Encontrei sua favorita com base no histórico de feedback.",
    spiritSpotlightHintPredicted: "Aposta de alta afinidade para seu perfil atual.",
    spiritSpotlightHintFallback: "Faixa escolhida para representar seu espírito neste momento.",
    spiritSpotlightNone: "Ainda sem faixa candidata. Gere uma nova recomendação para calibrar melhor.",
    spiritSpotlightFeedback: "Faixa do espírito: {song} • {artist}.",
    spiritVisualOpenYoutube: "Abrir no YouTube",
    spiritVideoTitle: "Visual do espírito musical",
    spiritVisualPreset: "Preset visual: {preset}",
    spiritCollectibleTitle: "Colecionável do espírito",
    spiritCollectibleHintLocal: "Ao alcançar marcos de likes, você desbloqueia uma arte personalizada.",
    spiritCollectibleHintApi: "API de imagem conectada: arte personalizada com IA habilitada.",
    spiritCollectibleMilestone: "Marco atual: {likes} likes",
    spiritCollectibleNext: "Faltam {remaining} likes para {rank} ({current}/{nextLikes}).",
    spiritCollectibleMaxRank: "Nível máximo atual: {rank} com {likes} likes.",
    spiritCollectibleAlt: "Colecionável de {spirit} no marco de {milestone} likes",
    spiritCollectibleDownload: "Baixar imagem",
    spiritCollectibleShareInstagram: "Compartilhar no Story",
    spiritCollectibleSharePreparing: "Preparando Story...",
    spiritCollectibleShareNoAsset: "Gere uma arte do espírito antes de compartilhar.",
    spiritCollectibleShareNativeDone: "Compartilhamento aberto. Escolha Instagram Stories na lista de apps.",
    spiritCollectibleShareFallback: "Baixei a imagem. Abra o Instagram e publique no Story.",
    spiritCollectibleShareCanceled: "Compartilhamento cancelado.",
    spiritCollectibleShareCaption: "Meu espírito musical no Sonic Search: {spirit}. #SonicSearch #MusicSommelier",
    spiritCollectibleShareStatusLine: "Status {status} | Curte {liked} artistas | Conheceu no app {discovered} | Já conhecia {known}",
    spiritCollectibleShareStoryTitle: "Meu status musical",
    spiritCollectibleGenerating: "Gerando arte do seu espírito...",
    spiritCollectibleGeneratedLocal: "Arte desbloqueada com render procedural local.",
    spiritCollectibleGeneratedApi: "Arte desbloqueada com geração por IA.",
    spiritCollectibleError: "Não consegui gerar com API agora. Usei render local para não travar.",
    spiritRankUnlocked: "Espírito desbloqueado",
    spiritRankNovice: "Sommelier iniciante",
    spiritRankResident: "Sommelier residente",
    spiritRankMaster: "Sommelier mestre"
  },
  en: {
    introKicker: "Sensory pre-show",
    introTitle: "Enter the frequency",
    introDesc: "Before choosing language, enjoy an animated opening with psychedelic phrases in motion.",
    introImpact: "Your ear starts getting mapped on the very first pulse.",
    introContinueBtn: "Start now",
    audioOn: "Sound on",
    audioOff: "Sound off",
    audioActivateHint: "Tap the screen once to unlock browser audio.",
    langKicker: "Choose your language",
    langTitle: "Select your language",
    langDesc: "Choose the language for the full app experience.",
    appSlogan: "We love music",
    appMission: "Our mission: find memorable tracks for you that you likely would not find without Sonic Search.",
    authKicker: "Load user",
    authTitle: "Sign in to load your profile",
    authDesc: "Log in to continue with your saved profile or continue without login.",
    authUsernameLabel: "Username",
    authPasswordLabel: "Password",
    authUsernamePlaceholder: "Enter your username",
    authPasswordPlaceholder: "Enter your password",
    authLoginBtn: "Sign in",
    authGuestBtn: "Continue without login",
    authRequired: "Fill username and password to sign in, or continue without login.",
    authLoggedAs: "Profile loaded for {user}.",
    authGuestReady: "Guest mode enabled. You can use the app without login.",
    welcomeKicker: "Electronic music curation",
    welcomeTitle: "SONIC SEARCH",
    welcomeDesc: "Your electronic music sommelier for rave, workout, focus, or travel. Pick your style and get a track + a new artist to discover.",
    startBtn: "Start experience",
    startSurpriseBtn: "Surprise me now",
    quickSurpriseTitle: "Surprise me with real discovery",
    quickSurpriseHint: "Tell me your main subgenre, artists, and tracks you already know so I can target something truly new.",
    quickSurpriseStyleLabel: "Subgenre you listen to most",
    quickSurpriseStylePlaceholder: "Choose subgenre",
    quickSurpriseKnownLabel: "Artists you already know",
    quickSurpriseKnownPlaceholder: "Ex.: Astrix, Charlotte de Witte, Alok",
    quickSurpriseKnownTracksLabel: "Tracks you already know",
    quickSurpriseKnownTracksPlaceholder: "Ex.: Poison Turtle, Hit N Run",
    quickSurpriseRunBtn: "Generate focused surprise",
    quickSurpriseCancelBtn: "Cancel",
    quickSurpriseNeedStyle: "Choose the subgenre you listen to most so I can surprise you better.",
    quickSurpriseGenerated: "Surprise generated with a new-track focus inside {style}.",
    heroTitle: "Electronic curation with real discovery",
    heroDesc: "Includes psytrance (forest/dark/dark experimental/full-on/prog/hitech), techno (acid/hard/minimal), house, drum and bass, and other key subgenres.",
    recommendBtn: "Generate recommendation",
    rerollBtn: "New suggestion with same profile",
    surpriseBtn: "Surprise me",
    adaptiveSurpriseBtn: "Profile surprise",
    clearFiltersBtn: "Clear filters",
    resetAppBtn: "New user (full reset)",
    resetAppConfirm: "This will erase your local history and restart the app as a new user. Do you want to continue?",
    generatedNow: "Generated now",
    freeStyle: "free style",
    freeContext: "free context",
    freeEnergy: "free energy",
    match: "Match",
    bpm: "BPM",
    bpmRangeLabel: "range",
    bpmVerifiedLabel: "verified",
    bpmApiMetadataLabel: "API metadata",
    bpmCatalogReferenceLabel: "catalog reference",
    bpmUnverifiedLabel: "BPM unverified",
    bpmEstimatedRange: "estimate {range}",
    energyPrefix: "Energy",
    releasePrefix: "Release",
    durationPrefix: "Duration",
    keyPrefix: "Key",
    catalogPrefix: "Catalog",
    labelPrefix: "Label",
    suggestedSubgenre: "Suggested subgenre",
    styleInfoTitle: "Subgenre quick guide",
    styleInfoBpmLabel: "Typical range",
    styleInfoTip: "Use as reference: BPM and aesthetics vary across artists, labels, and eras.",
    styleInfoSource: "References: genre guides (Wikipedia and Beatportal) + Sonic Search curation.",
    styleInfoFallback: "Subgenre with flexible boundaries. Curation combines aesthetics, context, and BPM to reduce mismatched recommendations.",
    styleInfoCloseAria: "Close subgenre bubble",
    defaultStats: "No feedback yet.",
    stats: "Song likes: {likedSongs} | Artist likes: {likedArtists} | Discovery likes: {likedDiscoveries} | Already knew: {alreadyKnew} | Skipped: {skipped} | Discovered in app: {discoveredInApp} | Ratings: {ratingCount} | Avg: {ratingAvg}",
    ratingTitle: "Rate this recommendation",
    ratingHint: "1 star = liked a little • 5 stars = loved it",
    ratingCelebration: "Celebration active",
    ratingAriaGroup: "Star rating",
    ratingSavedHint: "You rated this track with {stars} stars.",
    ratingSavedFeedback: "Rating saved: {stars} stars for {song}.",
    ratingSavedToast: "Rating saved: {stars} stars.",
    suggestionQueueTitle: "Smart queue: 3 suggestions",
    suggestionQueueHint: "Switch instantly without changing your filters.",
    queueNow: "Now",
    queueNext: "Next",
    queueUse: "Play this",
    queueActivated: "Queue active: now playing {song}.",
    trackAiTitle: "Track AI radar",
    trackAiRefreshBtn: "Refresh insight",
    trackAiLoading: "Analyzing your current track and preparing a quick read...",
    trackAiApiSource: "Insight generated by real-time AI.",
    trackAiLocalSource: "Local insight based on subgenre, BPM, energy, and context.",
    trackAiFallback: "This track matches your profile. Pair the groove with your current moment and rate it to refine curation.",
    trackAiUpdatedToast: "AI insight updated.",
    summaryPanelTitle: "7) Profile summary",
    summaryStatusLabel: "Profile status",
    summaryKnownCountLabel: "Known artists",
    summaryDiscoveredCountLabel: "Artists discovered in app",
    summaryLikedCountLabel: "Artists you like",
    summaryDislikedCountLabel: "Artists you don't like",
    summaryFavoriteStyleLabel: "Favorite genre",
    summaryAchievementLabel: "5-star achievement",
    summaryAchievementPending: "Rate tracks with 5 stars to unlock this achievement.",
    summaryAchievementFiveStarOne: "You rated {count} track with 5 stars.",
    summaryAchievementFiveStarMany: "You rated {count} tracks with 5 stars.",
    summaryAchievementTierA: "First signal",
    summaryAchievementTierB: "Gold curator",
    summaryAchievementTierC: "Magnetic sommelier",
    summaryAchievementTierD: "Spectrum legend",
    summaryAchievementTierProgress: "Current tier: {tier}. {remaining} more 5★ tracks to reach {nextTier} ({nextAt}).",
    summaryAchievementTierMax: "Max tier reached: {tier}.",
    summaryFiveStarTracksTitle: "Tracks you rated 5 stars",
    summaryEmptyFiveStarTracks: "Rate tracks with 5 stars to build your taste map.",
    summaryKnownArtistsTitle: "Artists you already know",
    summaryLikedArtistsTitle: "Artists you like",
    summaryDislikedArtistsTitle: "Artists you don't like",
    summaryNoData: "No data",
    summaryStatusNew: "New",
    summaryStatusExploring: "Exploring",
    summaryStatusActive: "Active",
    summaryStatusAdvanced: "Advanced curation",
    summaryEmptyKnown: "No known artists added yet.",
    summaryEmptyLiked: "No liked artists yet.",
    summaryEmptyDisliked: "No disliked artists yet.",
    listenersSubtitle: "{count} community listeners in the last hours (local feed).",
    topListenersTitle: "Top community listeners",
    topListenersSubtitle: "{style} ranking in the last 24h (local signal).",
    topListenerRank: "TOP {rank}",
    topListenerScore: "{score} points",
    topListenerPlays: "{plays} plays",
    previewSearching: "Searching track preview...",
    previewValidated: "Preview validated with high confidence. Are you enjoying what you're listening to?",
    previewLoaded: "Preview loaded with good confidence. Are you enjoying what you're listening to?",
    previewReady: "Preview ready. Press play to listen and rate.",
    previewYoutubeInlineHint: "YouTube player is available below to watch directly in the app.",
    previewYoutubeOptionalHint: "If you want to watch inside the app, open the YouTube player below.",
    previewYoutubeOpenInlineBtn: "Open player in app",
    previewYoutubeCloseInlineBtn: "Hide player",
    previewYoutubeRetryBtn: "Try another video",
    previewYoutubeFallback: "Audio preview is unavailable. I loaded a YouTube player so you can evaluate without leaving this screen.",
    previewUnavailable: "Preview unavailable for this track. Use Spotify/YouTube/SoundCloud and tell me if you liked it.",
    previewUnavailableWithLinks: "Preview unavailable for this track. Use {platforms} and tell me if you liked it.",
    spotifyUnverified: "Spotify link is not fully verified yet: opening an approximate search for this track.",
    youtubeUnverified: "YouTube link not verified yet to avoid opening the wrong track.",
    soundcloudUnverified: "SoundCloud link not verified yet to avoid opening the wrong track.",
    toastError: "Something went wrong in this action. I will improve this.",
    feedbackError: "An error happened while processing this action. Please try again.",
    toastButtonFallback: "Action recorded. This button is clickable.",
    eventNotFound: "No upcoming events found for {artist} right now.",
    eventRealLoaded: "Live event schedule for {artist} loaded.",
    eventFallbackLoaded: "Local fallback event schedule for {artist} loaded.",
    openEvent: "Open event",
    genericVibe: "Track recommended for the {style} profile.",
    genericArtistBio: "{artist} is highlighted in the {style} subgenre.",
    genericLabelBio: "{label} appears in relevant releases for {style}.",
    artistSocialsTitle: "Artist social links",
    artistSocialsHint: "Links open platform search by artist name.",
    warmupCatalogToast: "Catalog expanded in the background for all subgenres.",
    eventsPrompt: "Like an artist to load upcoming events.",
    eventsLoading: "Searching upcoming events for {artist}...",
    searchingCatalog: "Searching catalog and building recommendation...",
    catalogGenerating: "Catalog {style}: {tracks} tracks / {artists} artists. Generating recommendation...",
    recommendationGenerated: "Recommendation generated from your selected preferences.",
    exploratoryGenerated: "No filters selected: generated an exploratory recommendation.",
    styleExhaustedFallback: "I did not find new artists in {from} right now. I switched to {to} to keep discovery without repeats.",
    surpriseCrossGenreGenerated: "Surprise mode on: moved from {from} and brought you an artist from {to}.",
    surpriseAdaptiveGenerated: "Profile surprise: based on your likes/dislikes, I moved from {from} and brought a new track from {to}.",
    surpriseAdaptiveNeedSignals: "Give me a few likes/dislikes first so I can learn your profile and surprise you better.",
    rerollNoOption: "No other track found for this exact style at the moment.",
    rerollGenerated: "New suggestion generated with artist/track rotation in the same profile.",
    clearFiltersFeedback: "Filters cleared. You can run a new exploratory search.",
    noUnknownOption: "I could not find another unknown option for this profile right now.",
    swappedUnknown: "Done. Switched to a similar suggestion you probably do not know yet.",
    toastFoundNewArtist: "Great. I searched another artist for you to discover.",
    newArtistDetected: "Nice. New artist detected. Rate the preview below so I can learn your taste.",
    toastNewDiscovery: "Great! New discovery unlocked.",
    prioritizeSimilar: "Perfect. I will prioritize similar sounds and load artist events.",
    toastShowMoreLikeThis: "Great that you liked it. I will show more in this direction.",
    swappedNow: "Swapped now with a new search in the same profile, without repeating track/artist.",
    toastSwapped: "No problem. I switched to another track now.",
    celebrationActivated: "Celebration on. {song} is now in your favorite discoveries.",
    toastFavoritedDiscovery: "Excellent pick! Discovery favorited.",
    refinedAfterNo: "I switched the track based on your feedback to refine curation.",
    toastTryBetter: "Got it, I will try a better recommendation.",
    songAddedProfile: "Nice. Track {song} was added to your profile.",
    toastSongLiked: "Nice! Track liked.",
    artistFavorited: "Perfect. Artist {artist} was marked as favorite.",
    toastArtistSaved: "Artist saved as favorite.",
    artistBlockedFromRecommendations: "Done. Artist {artist} will no longer be recommended to you.",
    toastArtistBlocked: "Artist blocked from recommendations.",
    enableDiscoveryMode: "Enable discovery mode to receive a new artist.",
    likedDiscovery: "Great, you liked discovering {artist}.",
    toastDiscoveryLiked: "Great! Discovery liked.",
    discoveryKnown: "Noted. I will search for even less obvious names next.",
    toastDiscoveryKnown: "Noted. I will deepen upcoming discoveries.",
    previewIssueLearned: "Understood. This looks like a preview/playback issue. I will prioritize next tracks with more reliable players.",
    toastPreviewIssueLearned: "Adjusted. I will avoid weak preview candidates.",
    skipAdjusted: "Received. I rebuilt the search and adjusted your next match from your feedback.",
    toastSkipAdjusted: "Done. Recommendation adjusted from your feedback.",
    catalogUpdateProgress: "Updating catalog {style}: {tracks} tracks / {artists} artists.",
    searchOverlayTitle: "Searching recommendation",
    searchOverlayPreparing: "Analyzing filters and preparing search...",
    searchOverlayCatalog: "Searching and validating tracks in catalog...",
    searchOverlayGenerating: "Generating the best match for your profile...",
    searchOverlayFinishing: "Finalizing recommendation...",
    newArtistsBtn: "Find new artists (< 2 years)",
    newArtistsTitle: "New artists in this subgenre",
    newArtistsSelectStyle: "Choose a subgenre to search for new artists.",
    newArtistsSearching: "Searching artists with recent releases in this subgenre...",
    newArtistsFound: "Found {count} artist(s) with releases in the last 2 years in {style}.",
    newArtistsNone: "No new artist was found in this subgenre in the last 24 months.",
    newArtistsReleaseLabel: "Latest release",
    newArtistsGenreLabel: "Genre axis",
    catalogInsufficient: "Insufficient catalog for {style}. Current: {tracks}/{targetTracks} tracks, {artists}/{targetArtists} artists, {labels}/{targetLabels} labels.",
    catalogInsufficientToast: "Catalog still insufficient for a reliable recommendation in this subgenre.",
    catalogFallbackToast: "Partial coverage in this subgenre. I will recommend using the available local catalog.",
    catalogFallbackUsingLocal: "Partial coverage in {style} ({tracks} tracks / {artists} artists). Recommendation generated from the local catalog while expansion continues.",
    catalogFallbackSearching: "Partial coverage in {style}. Searching new artists with the available catalog...",
    spiritPanelTitle: "6) Your musical spirit",
    spiritIntro: "Every 10 liked songs, your musical spirit is reviewed.",
    spiritBadge: "Spirit unlocked",
    spiritAvatarAlt: "Spirit avatar {name}",
    spiritProgressLocked: "Liked songs: {current}/{target}. {remaining} to reveal your spirit.",
    spiritProgressUnlocked: "Profile consolidated with {current} liked songs.",
    spiritUnlockedToast: "Spirit revealed: {name}",
    spiritUnlockedFeedback: "Your musical spirit has been revealed: {name}.",
    spiritShiftedFeedback: "Your musical spirit evolved to: {name}.",
    spiritReviewStayedFeedback: "Review complete: your spirit remains {name}.",
    spiritReviewStayedToast: "Review complete: spirit stays as {name}.",
    spiritReviewShiftedToast: "Review complete: spirit updated to {name}.",
    spiritVisualTitle: "Spirit visual mode",
    spiritVisualHint: "Audiovisual ambience loop aligned with your current profile.",
    spiritSpotlightTitle: "Spirit track",
    spiritSpotlightHintFavorite: "Picked from your favorite history and feedback signals.",
    spiritSpotlightHintPredicted: "High-affinity pick for your current profile.",
    spiritSpotlightHintFallback: "Track selected to represent your spirit right now.",
    spiritSpotlightNone: "No track candidate yet. Generate a new recommendation to refine matching.",
    spiritSpotlightFeedback: "Spirit track: {song} • {artist}.",
    spiritVisualOpenYoutube: "Open on YouTube",
    spiritVideoTitle: "Musical spirit visual",
    spiritVisualPreset: "Visual preset: {preset}",
    spiritCollectibleTitle: "Spirit collectible",
    spiritCollectibleHintLocal: "Each like milestone unlocks a personalized artwork.",
    spiritCollectibleHintApi: "Image API connected: AI-generated personalized artwork enabled.",
    spiritCollectibleMilestone: "Current milestone: {likes} likes",
    spiritCollectibleNext: "{remaining} likes left to reach {rank} ({current}/{nextLikes}).",
    spiritCollectibleMaxRank: "Current max rank: {rank} with {likes} likes.",
    spiritCollectibleAlt: "{spirit} collectible at {milestone} likes milestone",
    spiritCollectibleDownload: "Download image",
    spiritCollectibleShareInstagram: "Share to Story",
    spiritCollectibleSharePreparing: "Preparing Story...",
    spiritCollectibleShareNoAsset: "Generate spirit artwork before sharing.",
    spiritCollectibleShareNativeDone: "Share sheet opened. Choose Instagram Stories in the app list.",
    spiritCollectibleShareFallback: "Image downloaded. Open Instagram and post it to your Story.",
    spiritCollectibleShareCanceled: "Share canceled.",
    spiritCollectibleShareCaption: "My musical spirit on Sonic Search: {spirit}. #SonicSearch #MusicSommelier",
    spiritCollectibleShareStatusLine: "Status {status} | Likes {liked} artists | Discovered in app {discovered} | Already knew {known}",
    spiritCollectibleShareStoryTitle: "My music status",
    spiritCollectibleGenerating: "Generating your spirit artwork...",
    spiritCollectibleGeneratedLocal: "Artwork unlocked with local procedural render.",
    spiritCollectibleGeneratedApi: "Artwork unlocked with AI generation.",
    spiritCollectibleError: "Could not generate via API right now. Local render was used.",
    spiritRankUnlocked: "Spirit unlocked",
    spiritRankNovice: "Novice music sommelier",
    spiritRankResident: "Resident music sommelier",
    spiritRankMaster: "Master music sommelier"
  },
  es: {
    introKicker: "Pre-show sensorial",
    introTitle: "Entra en la frecuencia",
    introDesc: "Antes de elegir idioma, vive una apertura animada con frases psicodelicas en movimiento.",
    introImpact: "Tu oido empieza a leerse desde el primer pulso.",
    introContinueBtn: "Comenzar ahora",
    audioOn: "Sonido activo",
    audioOff: "Sonido inactivo",
    audioActivateHint: "Toca la pantalla una vez para habilitar audio en el navegador.",
    langKicker: "Elige tu idioma",
    langTitle: "Selecciona tu idioma",
    langDesc: "Elige el idioma para toda la experiencia de la app.",
    appSlogan: "Amamos la música",
    appMission: "Nuestra misión: encontrar tracks memorables para ti que probablemente no encontrarías sin Sonic Search.",
    authKicker: "Cargar usuario",
    authTitle: "Inicia sesión para cargar tu perfil",
    authDesc: "Inicia sesión para continuar con tu perfil guardado o continúa sin login.",
    authUsernameLabel: "Usuario",
    authPasswordLabel: "Contraseña",
    authUsernamePlaceholder: "Escribe tu usuario",
    authPasswordPlaceholder: "Escribe tu contraseña",
    authLoginBtn: "Entrar",
    authGuestBtn: "Continuar sin login",
    authRequired: "Completa usuario y contraseña para entrar, o continúa sin login.",
    authLoggedAs: "Perfil cargado para {user}.",
    authGuestReady: "Modo invitado activado. Puedes usar la app sin login.",
    welcomeKicker: "Curaduría de música electrónica",
    welcomeTitle: "SONIC SEARCH",
    welcomeDesc: "Tu sommelier de música electrónica para rave, entrenamiento, foco o viaje. Elige tu estilo y recibe una pista + artista nuevo.",
    startBtn: "Iniciar experiencia",
    startSurpriseBtn: "Sorpréndeme",
    quickSurpriseTitle: "Sorpréndeme con novedad real",
    quickSurpriseHint: "Dime el subgénero que más escuchas, artistas y canciones que ya conoces para buscar algo realmente nuevo.",
    quickSurpriseStyleLabel: "Subgénero que más escuchas",
    quickSurpriseStylePlaceholder: "Elige subgénero",
    quickSurpriseKnownLabel: "Artistas que ya conoces",
    quickSurpriseKnownPlaceholder: "Ej.: Astrix, Charlotte de Witte, Alok",
    quickSurpriseKnownTracksLabel: "Canciones que ya conoces",
    quickSurpriseKnownTracksPlaceholder: "Ej.: Poison Turtle, Hit N Run",
    quickSurpriseRunBtn: "Generar sorpresa enfocada",
    quickSurpriseCancelBtn: "Cancelar",
    quickSurpriseNeedStyle: "Primero elige el subgénero que más escuchas para sorprenderte mejor.",
    quickSurpriseGenerated: "Sorpresa generada con foco en pista nueva dentro de {style}.",
    heroTitle: "Curaduría electrónica con descubrimiento real",
    heroDesc: "Incluye psytrance (forest/dark/dark experimental/full-on/prog/hitech), techno (acid/hard/minimal), house, drum and bass y otros subgéneros clave.",
    recommendBtn: "Generar recomendación",
    rerollBtn: "Nueva sugerencia en el mismo perfil",
    surpriseBtn: "Sorprenderme",
    adaptiveSurpriseBtn: "Sorpresa por perfil",
    clearFiltersBtn: "Limpiar filtros",
    resetAppBtn: "Nuevo usuario (reinicio total)",
    resetAppConfirm: "Esto borrará tu historial local y reiniciará la app como nuevo usuario. ¿Deseas continuar?",
    generatedNow: "Generada ahora",
    freeStyle: "estilo libre",
    freeContext: "contexto libre",
    freeEnergy: "energía libre",
    match: "Match",
    bpm: "BPM",
    bpmRangeLabel: "rango",
    bpmVerifiedLabel: "verificado",
    bpmApiMetadataLabel: "metadato de API",
    bpmCatalogReferenceLabel: "referencia de catálogo",
    bpmUnverifiedLabel: "BPM no verificado",
    bpmEstimatedRange: "estimado {range}",
    energyPrefix: "Energía",
    releasePrefix: "Lanzamiento",
    durationPrefix: "Duración",
    keyPrefix: "Key",
    catalogPrefix: "Catálogo",
    labelPrefix: "Sello",
    suggestedSubgenre: "Subgénero sugerido",
    styleInfoTitle: "Guía rápida del subgénero",
    styleInfoBpmLabel: "Rango típico",
    styleInfoTip: "Úsalo como referencia: BPM y estética varían entre artistas, sellos y épocas.",
    styleInfoSource: "Referencias: guías de género (Wikipedia y Beatportal) + curaduría Sonic Search.",
    styleInfoFallback: "Subgénero con fronteras flexibles. La curaduría cruza estética, contexto y BPM para reducir recomendaciones fuera de estilo.",
    styleInfoCloseAria: "Cerrar burbuja del subgénero",
    defaultStats: "Sin feedback todavía.",
    stats: "Likes de pista: {likedSongs} | Likes de artista: {likedArtists} | Descubrimientos: {likedDiscoveries} | Ya conocía: {alreadyKnew} | No encajó: {skipped} | Conocidos en la app: {discoveredInApp} | Valoraciones: {ratingCount} | Promedio: {ratingAvg}",
    ratingTitle: "Evalúa esta recomendación",
    ratingHint: "1 estrella = me gustó poco • 5 estrellas = me encantó",
    ratingCelebration: "Celebración activa",
    ratingAriaGroup: "Valoración por estrellas",
    ratingSavedHint: "Has valorado esta pista con {stars} estrellas.",
    ratingSavedFeedback: "Valoración guardada: {stars} estrellas para {song}.",
    ratingSavedToast: "Valoración guardada: {stars} estrellas.",
    suggestionQueueTitle: "Fila inteligente: 3 sugerencias",
    suggestionQueueHint: "Cambia al instante sin modificar tus filtros.",
    queueNow: "Ahora",
    queueNext: "Siguiente",
    queueUse: "Reproducir esta",
    queueActivated: "Fila activa: ahora suena {song}.",
    trackAiTitle: "Radar IA de la pista",
    trackAiRefreshBtn: "Actualizar lectura",
    trackAiLoading: "Analizando tu pista actual y preparando una lectura rápida...",
    trackAiApiSource: "Lectura generada por IA en tiempo real.",
    trackAiLocalSource: "Lectura local basada en subgénero, BPM, energía y contexto.",
    trackAiFallback: "Esta pista encaja con tu perfil. Combina el groove con tu momento y valórala para refinar la curaduría.",
    trackAiUpdatedToast: "Lectura IA actualizada.",
    summaryPanelTitle: "7) Resumen de perfil",
    summaryStatusLabel: "Estado del perfil",
    summaryKnownCountLabel: "Artistas conocidos",
    summaryDiscoveredCountLabel: "Artistas conocidos en la app",
    summaryLikedCountLabel: "Artistas que te gustan",
    summaryDislikedCountLabel: "Artistas que no te gustan",
    summaryFavoriteStyleLabel: "Género favorito",
    summaryAchievementLabel: "Logro de 5 estrellas",
    summaryAchievementPending: "Valora pistas con 5 estrellas para desbloquear este logro.",
    summaryAchievementFiveStarOne: "Has valorado {count} pista con 5 estrellas.",
    summaryAchievementFiveStarMany: "Has valorado {count} pistas con 5 estrellas.",
    summaryAchievementTierA: "Señal inicial",
    summaryAchievementTierB: "Curador de oro",
    summaryAchievementTierC: "Sommelier magnético",
    summaryAchievementTierD: "Leyenda del espectro",
    summaryAchievementTierProgress: "Nivel actual: {tier}. Faltan {remaining} pistas 5★ para {nextTier} ({nextAt}).",
    summaryAchievementTierMax: "Nivel máximo alcanzado: {tier}.",
    summaryFiveStarTracksTitle: "Pistas valoradas con 5 estrellas",
    summaryEmptyFiveStarTracks: "Valora pistas con 5 estrellas para construir tu mapa de gusto.",
    summaryKnownArtistsTitle: "Artistas que ya conoces",
    summaryLikedArtistsTitle: "Artistas que te gustan",
    summaryDislikedArtistsTitle: "Artistas que no te gustan",
    summaryNoData: "Sin datos",
    summaryStatusNew: "Nuevo",
    summaryStatusExploring: "Explorando",
    summaryStatusActive: "Activo",
    summaryStatusAdvanced: "Curaduría avanzada",
    summaryEmptyKnown: "Aún no hay artistas marcados como conocidos.",
    summaryEmptyLiked: "Aún no hay artistas con like.",
    summaryEmptyDisliked: "Aún no hay artistas marcados como no gustados.",
    listenersSubtitle: "{count} oyentes de la comunidad en las últimas horas (feed local).",
    topListenersTitle: "Top listeners de la comunidad",
    topListenersSubtitle: "Ranking del eje {style} en las últimas 24h (señal local).",
    topListenerRank: "TOP {rank}",
    topListenerScore: "{score} puntos",
    topListenerPlays: "{plays} reproducciones",
    previewSearching: "Buscando preview de la pista...",
    previewValidated: "Preview validado con alta confianza. ¿Te gusta lo que escuchas?",
    previewLoaded: "Preview cargado con buena confianza. ¿Te gusta lo que escuchas?",
    previewReady: "Preview listo. Dale play para escuchar y evaluar.",
    previewYoutubeInlineHint: "El player de YouTube está disponible abajo para ver directamente en la app.",
    previewYoutubeOptionalHint: "Si quieres ver dentro de la app, abre el player de YouTube abajo.",
    previewYoutubeOpenInlineBtn: "Abrir player en app",
    previewYoutubeCloseInlineBtn: "Ocultar player",
    previewYoutubeRetryBtn: "Probar otro video",
    previewYoutubeFallback: "Preview en audio no disponible. Cargué un player de YouTube para que evalúes sin salir de esta pantalla.",
    previewUnavailable: "Preview no disponible para esta pista. Usa Spotify/YouTube/SoundCloud y dime si te gustó.",
    previewUnavailableWithLinks: "Preview no disponible para esta pista. Usa {platforms} y dime si te gustó.",
    spotifyUnverified: "Enlace de Spotify no verificado: se abrirá una búsqueda aproximada para esta pista.",
    youtubeUnverified: "Enlace de YouTube aún no verificado para evitar abrir la pista equivocada.",
    soundcloudUnverified: "Enlace de SoundCloud aún no verificado para evitar abrir la pista equivocada.",
    toastError: "Ocurrió un error en esta acción. Ya lo voy a mejorar.",
    feedbackError: "Ocurrió un error al procesar esta acción. Intenta nuevamente.",
    toastButtonFallback: "Acción registrada. Este botón ya es clicable.",
    eventNotFound: "No encontré eventos próximos para {artist} ahora.",
    eventRealLoaded: "Agenda real de {artist} cargada.",
    eventFallbackLoaded: "Agenda local de {artist} cargada en modo catálogo.",
    openEvent: "Abrir evento",
    genericVibe: "Pista recomendada para el perfil {style}.",
    genericArtistBio: "{artist} aparece como destacado en el subgénero {style}.",
    genericLabelBio: "{label} participa de lanzamientos relevantes en {style}.",
    artistSocialsTitle: "Redes del artista",
    artistSocialsHint: "Los links abren búsqueda por nombre del artista en cada plataforma.",
    warmupCatalogToast: "Catálogo ampliado en segundo plano para todos los subgéneros.",
    eventsPrompt: "Dale like a un artista para cargar eventos próximos.",
    eventsLoading: "Buscando próximos eventos de {artist}...",
    searchingCatalog: "Buscando catálogo y preparando recomendación...",
    catalogGenerating: "Catálogo {style}: {tracks} pistas / {artists} artistas. Generando recomendación...",
    recommendationGenerated: "Recomendación generada según tus preferencias seleccionadas.",
    exploratoryGenerated: "Sin filtros definidos: generé una recomendación exploratoria.",
    styleExhaustedFallback: "No encontré artistas nuevos en {from} por ahora. Cambié a {to} para mantener descubrimiento sin repeticiones.",
    surpriseCrossGenreGenerated: "Sorpresa activa: salí de {from} y traje un artista de {to}.",
    surpriseAdaptiveGenerated: "Sorpresa por perfil: usando tus likes/dislikes, salí de {from} y traje una pista nueva de {to}.",
    surpriseAdaptiveNeedSignals: "Dame algunos likes/dislikes primero para aprender tu perfil y sorprenderte mejor.",
    rerollNoOption: "No hay otra pista en el catálogo para este estilo específico ahora.",
    rerollGenerated: "Nueva sugerencia generada con rotación de artista y pista en el mismo perfil.",
    clearFiltersFeedback: "Filtros limpiados. Puedes generar una búsqueda exploratoria.",
    noUnknownOption: "No encontré otra opción desconocida para este perfil por ahora.",
    swappedUnknown: "Listo. Cambié a otra sugerencia similar que probablemente no conocías.",
    toastFoundNewArtist: "Perfecto. Busqué otro artista para que descubras.",
    newArtistDetected: "Excelente. Artista nuevo detectado. Evalúa el preview para aprender tu gusto.",
    toastNewDiscovery: "Qué bueno. Nuevo descubrimiento desbloqueado.",
    prioritizeSimilar: "Perfecto. Priorizaré sonidos parecidos y abriré eventos del artista.",
    toastShowMoreLikeThis: "Qué bueno que te gustó. Te mostraré más en esa línea.",
    swappedNow: "Cambié ahora con nueva búsqueda en el mismo perfil, sin repetir artista/pista.",
    toastSwapped: "Sin problema. Cambié a otra pista ahora.",
    celebrationActivated: "Celebración activada. {song} entró en tus descubrimientos favoritos.",
    toastFavoritedDiscovery: "Excelente elección. Descubrimiento favorito.",
    refinedAfterNo: "Cambié la pista según tu feedback para refinar la curaduría.",
    toastTryBetter: "Entendido, intentaré una recomendación mejor.",
    songAddedProfile: "Bien. La pista {song} entró en tu perfil.",
    toastSongLiked: "Bien. Pista con like.",
    artistFavorited: "Perfecto. El artista {artist} fue marcado como favorito.",
    toastArtistSaved: "Artista guardado como favorito.",
    artistBlockedFromRecommendations: "Perfecto. El artista {artist} ya no se recomendará para ti.",
    toastArtistBlocked: "Artista bloqueado de las recomendaciones.",
    enableDiscoveryMode: "Activa el modo descubrimiento para recibir un artista nuevo.",
    likedDiscovery: "Excelente, te gustó conocer a {artist}.",
    toastDiscoveryLiked: "Top. Descubrimiento con like.",
    discoveryKnown: "Anotado. Voy a buscar nombres aún menos obvios en la próxima.",
    toastDiscoveryKnown: "Anotado. Voy a profundizar los próximos descubrimientos.",
    previewIssueLearned: "Entendido. Parece una falla de preview/reproducción. Voy a priorizar próximas pistas con player más confiable.",
    toastPreviewIssueLearned: "Ajustado. Evitaré candidatos con preview débil.",
    skipAdjusted: "Recibido. Rehice la búsqueda y ajusté el próximo match según tu no.",
    toastSkipAdjusted: "Perfecto. Ajusté tu recomendación según tu feedback.",
    catalogUpdateProgress: "Actualizando catálogo {style}: {tracks} pistas / {artists} artistas.",
    searchOverlayTitle: "Buscando recomendación",
    searchOverlayPreparing: "Analizando filtros y preparando búsqueda...",
    searchOverlayCatalog: "Buscando y validando pistas del catálogo...",
    searchOverlayGenerating: "Generando el mejor match para tu perfil...",
    searchOverlayFinishing: "Finalizando recomendación...",
    newArtistsBtn: "Buscar artistas nuevos (< 2 años)",
    newArtistsTitle: "Artistas nuevos en el subgénero",
    newArtistsSelectStyle: "Elige un subgénero para buscar artistas nuevos.",
    newArtistsSearching: "Buscando artistas con lanzamientos recientes en este subgénero...",
    newArtistsFound: "Encontré {count} artista(s) con lanzamientos en los últimos 2 años en {style}.",
    newArtistsNone: "No se encontró ningún artista nuevo en este subgénero en los últimos 24 meses.",
    newArtistsReleaseLabel: "Último lanzamiento",
    newArtistsGenreLabel: "Eje de género",
    catalogInsufficient: "Catálogo insuficiente para {style}. Actual: {tracks}/{targetTracks} pistas, {artists}/{targetArtists} artistas, {labels}/{targetLabels} sellos.",
    catalogInsufficientToast: "Catálogo aún insuficiente para una recomendación confiable en este subgénero.",
    catalogFallbackToast: "Cobertura parcial en este subgénero. Recomendaré usando el catálogo local disponible.",
    catalogFallbackUsingLocal: "Cobertura parcial en {style} ({tracks} pistas / {artists} artistas). Recomendación generada con el catálogo local mientras sigo ampliándolo.",
    catalogFallbackSearching: "Cobertura parcial en {style}. Buscando artistas nuevos con el catálogo disponible...",
    spiritPanelTitle: "6) Tu espíritu musical",
    spiritIntro: "Cada 10 canciones con like, tu espíritu musical se revisa.",
    spiritBadge: "Espíritu desbloqueado",
    spiritAvatarAlt: "Avatar del espíritu {name}",
    spiritProgressLocked: "Canciones con like: {current}/{target}. Faltan {remaining} para revelar tu espíritu.",
    spiritProgressUnlocked: "Perfil consolidado con {current} canciones con like.",
    spiritUnlockedToast: "Espíritu revelado: {name}",
    spiritUnlockedFeedback: "Tu espíritu musical fue revelado: {name}.",
    spiritShiftedFeedback: "Tu espíritu musical evolucionó a: {name}.",
    spiritReviewStayedFeedback: "Revisión completa: tu espíritu permanece {name}.",
    spiritReviewStayedToast: "Revisión completa: el espíritu se mantiene en {name}.",
    spiritReviewShiftedToast: "Revisión completa: espíritu actualizado a {name}.",
    spiritVisualTitle: "Modo visual del espíritu",
    spiritVisualHint: "Loop de ambientación audiovisual alineado con tu perfil actual.",
    spiritSpotlightTitle: "Pista del espíritu",
    spiritSpotlightHintFavorite: "Elegida de tu historial favorito y señales de feedback.",
    spiritSpotlightHintPredicted: "Apuesta de alta afinidad para tu perfil actual.",
    spiritSpotlightHintFallback: "Pista seleccionada para representar tu espíritu ahora.",
    spiritSpotlightNone: "Aún no hay pista candidata. Genera una nueva recomendación para ajustar mejor.",
    spiritSpotlightFeedback: "Pista del espíritu: {song} • {artist}.",
    spiritVisualOpenYoutube: "Abrir en YouTube",
    spiritVideoTitle: "Visual del espíritu musical",
    spiritVisualPreset: "Preset visual: {preset}",
    spiritCollectibleTitle: "Coleccionable del espíritu",
    spiritCollectibleHintLocal: "Al alcanzar hitos de likes, desbloqueas una obra personalizada.",
    spiritCollectibleHintApi: "API de imagen conectada: generación personalizada con IA habilitada.",
    spiritCollectibleMilestone: "Hito actual: {likes} likes",
    spiritCollectibleNext: "Faltan {remaining} likes para {rank} ({current}/{nextLikes}).",
    spiritCollectibleMaxRank: "Rango máximo actual: {rank} con {likes} likes.",
    spiritCollectibleAlt: "Coleccionable de {spirit} en el hito de {milestone} likes",
    spiritCollectibleDownload: "Descargar imagen",
    spiritCollectibleShareInstagram: "Compartir en Story",
    spiritCollectibleSharePreparing: "Preparando Story...",
    spiritCollectibleShareNoAsset: "Genera una obra del espíritu antes de compartir.",
    spiritCollectibleShareNativeDone: "Compartir abierto. Elige Instagram Stories en la lista de apps.",
    spiritCollectibleShareFallback: "Imagen descargada. Abre Instagram y publícala en tu Story.",
    spiritCollectibleShareCanceled: "Compartir cancelado.",
    spiritCollectibleShareCaption: "Mi espíritu musical en Sonic Search: {spirit}. #SonicSearch #MusicSommelier",
    spiritCollectibleShareStatusLine: "Estado {status} | Te gustan {liked} artistas | Conociste en la app {discovered} | Ya conocías {known}",
    spiritCollectibleShareStoryTitle: "Mi estado musical",
    spiritCollectibleGenerating: "Generando arte de tu espíritu...",
    spiritCollectibleGeneratedLocal: "Obra desbloqueada con render procedural local.",
    spiritCollectibleGeneratedApi: "Obra desbloqueada con generación IA.",
    spiritCollectibleError: "No pude generar por API ahora. Usé render local para no bloquear.",
    spiritRankUnlocked: "Espíritu desbloqueado",
    spiritRankNovice: "Sommelier musical inicial",
    spiritRankResident: "Sommelier musical residente",
    spiritRankMaster: "Sommelier musical maestro"
  }
};

function t(key, vars = {}) {
  const table = I18N[currentLanguage] || I18N[DEFAULT_LANGUAGE];
  const fallback = I18N[DEFAULT_LANGUAGE];
  let text = table?.[key] ?? fallback?.[key] ?? key;
  Object.entries(vars).forEach(([name, value]) => {
    text = text.replace(new RegExp(`\\{${name}\\}`, "g"), String(value));
  });
  return text;
}

const QUIZ_TEXT = {
  pt: {
    overlayKicker: "Sonic Quiz IA",
    overlayTitle: "Desafio de {style}",
    overlayMetaProgress: "Pergunta {current}/{total}",
    overlayMetaResult: "Resultado: {score}/{total} ({percent}%)",
    overlayPreparing: "Preparando desafio...",
    bubblePrompt: "Você já conhece {count} artistas de {style}. Topa um desafio rápido?",
    startBtn: "Aceitar desafio",
    laterBtn: "Depois",
    submitBtn: "Confirmar resposta",
    nextBtn: "Próxima",
    finishBtn: "Finalizar",
    retryBtn: "Novo quiz",
    closeBtn: "Fechar",
    selectOption: "Selecione uma opção para confirmar.",
    correctPrefix: "Correto.",
    wrongPrefix: "Não foi dessa vez. Resposta certa: {answer}.",
    unavailableToast: "Ainda não tenho fatos suficientes desse subgênero para abrir o quiz.",
    laterToast: "Desafio adiado. Vou chamar de novo quando seu repertório crescer.",
    resultExcellent: "Você está voando em {style}. Curadoria pesada no radar.",
    resultGood: "Bom nível em {style}. Mais algumas faixas e vira especialista.",
    resultStudy: "Base montada em {style}. Continue ouvindo para afiar o ouvido.",
    resultFooter: "Melhor marca em {style}: {best}% • Tentativas: {attempts}.",
    questionArtistInStyle: "Qual artista pertence ao subgênero {style} no catálogo Sonic Search?",
    questionTrackByArtist: "Qual faixa do catálogo é assinada por {artist}?",
    questionArtistOfTrack: "Quem assina a faixa \"{song}\" no catálogo?",
    questionLabelByTrack: "Em \"{song}\" de {artist}, qual gravadora aparece no catálogo?",
    questionBpmByStyle: "Qual faixa típica de BPM usamos como referência para {style}?",
    questionOrigin: "De onde é o projeto {artist}, segundo nossa base curada?",
    questionStyleForArtist: "No Sonic Search, qual subgênero inclui {artist} neste eixo?",
    expArtistInStyle: "{artist} está no eixo {style} na curadoria Sonic Search.",
    expTrackByArtist: "\"{song}\" aparece no catálogo associado a {artist}.",
    expArtistOfTrack: "\"{song}\" está associado a {artist} no catálogo atual.",
    expLabelByTrack: "No catálogo, \"{song}\" de {artist} está ligado a {label}.",
    expBpmByStyle: "A referência de BPM para {style} foi calibrada para preservar identidade de pista.",
    expOrigin: "Nosso sinal de origem para {artist} aponta {origin}.",
    expStyleForArtist: "{artist} está classificado em {style} neste catálogo."
  },
  en: {
    overlayKicker: "Sonic Quiz AI",
    overlayTitle: "{style} challenge",
    overlayMetaProgress: "Question {current}/{total}",
    overlayMetaResult: "Result: {score}/{total} ({percent}%)",
    overlayPreparing: "Preparing challenge...",
    bubblePrompt: "You already know {count} artists in {style}. Ready for a quick challenge?",
    startBtn: "Accept challenge",
    laterBtn: "Later",
    submitBtn: "Submit answer",
    nextBtn: "Next",
    finishBtn: "Finish",
    retryBtn: "New quiz",
    closeBtn: "Close",
    selectOption: "Select one option before submitting.",
    correctPrefix: "Correct.",
    wrongPrefix: "Not this time. Right answer: {answer}.",
    unavailableToast: "I still don't have enough trusted facts for this subgenre quiz.",
    laterToast: "Challenge snoozed. I will bring it back when your repertoire grows.",
    resultExcellent: "You are flying in {style}. Strong curation radar.",
    resultGood: "Solid level in {style}. A few more tracks and you become specialist.",
    resultStudy: "Good base in {style}. Keep listening to sharpen your ear.",
    resultFooter: "Best score in {style}: {best}% • Attempts: {attempts}.",
    questionArtistInStyle: "Which artist belongs to {style} in the Sonic Search catalog?",
    questionTrackByArtist: "Which catalog track is by {artist}?",
    questionArtistOfTrack: "Who produced the track \"{song}\" in the catalog?",
    questionLabelByTrack: "For \"{song}\" by {artist}, which label appears in the catalog?",
    questionBpmByStyle: "Which typical BPM range do we use as reference for {style}?",
    questionOrigin: "Where is {artist} from, according to our curated data?",
    questionStyleForArtist: "In Sonic Search, which subgenre includes {artist} on this axis?",
    expArtistInStyle: "{artist} is listed in the {style} axis of Sonic Search curation.",
    expTrackByArtist: "\"{song}\" appears in the catalog linked to {artist}.",
    expArtistOfTrack: "\"{song}\" is linked to {artist} in the current catalog.",
    expLabelByTrack: "In catalog records, \"{song}\" by {artist} is tied to {label}.",
    expBpmByStyle: "The BPM reference for {style} is calibrated to preserve dancefloor identity.",
    expOrigin: "Our origin signal for {artist} points to {origin}.",
    expStyleForArtist: "{artist} is classified under {style} in this catalog."
  },
  es: {
    overlayKicker: "Sonic Quiz IA",
    overlayTitle: "Desafío de {style}",
    overlayMetaProgress: "Pregunta {current}/{total}",
    overlayMetaResult: "Resultado: {score}/{total} ({percent}%)",
    overlayPreparing: "Preparando desafío...",
    bubblePrompt: "Ya conoces {count} artistas de {style}. ¿Aceptas un desafío rápido?",
    startBtn: "Aceptar desafío",
    laterBtn: "Después",
    submitBtn: "Confirmar respuesta",
    nextBtn: "Siguiente",
    finishBtn: "Finalizar",
    retryBtn: "Nuevo quiz",
    closeBtn: "Cerrar",
    selectOption: "Selecciona una opción antes de confirmar.",
    correctPrefix: "Correcto.",
    wrongPrefix: "No fue esta vez. Respuesta correcta: {answer}.",
    unavailableToast: "Todavía no tengo datos confiables suficientes para este quiz de subgénero.",
    laterToast: "Desafío pospuesto. Lo mostraré de nuevo cuando crezca tu repertorio.",
    resultExcellent: "Vas muy fuerte en {style}. Curaduría de alto nivel.",
    resultGood: "Buen nivel en {style}. Con algunas pistas más, serás especialista.",
    resultStudy: "Base sólida en {style}. Sigue escuchando para afinar el oído.",
    resultFooter: "Mejor marca en {style}: {best}% • Intentos: {attempts}.",
    questionArtistInStyle: "¿Qué artista pertenece a {style} en el catálogo Sonic Search?",
    questionTrackByArtist: "¿Qué pista del catálogo es de {artist}?",
    questionArtistOfTrack: "¿Quién firma la pista \"{song}\" en el catálogo?",
    questionLabelByTrack: "En \"{song}\" de {artist}, ¿qué sello aparece en el catálogo?",
    questionBpmByStyle: "¿Qué rango típico de BPM usamos como referencia para {style}?",
    questionOrigin: "¿De dónde es el proyecto {artist}, según nuestra base curada?",
    questionStyleForArtist: "En Sonic Search, ¿qué subgénero incluye a {artist} en este eje?",
    expArtistInStyle: "{artist} aparece en el eje {style} de la curaduría Sonic Search.",
    expTrackByArtist: "\"{song}\" aparece en el catálogo asociado a {artist}.",
    expArtistOfTrack: "\"{song}\" está asociada a {artist} en el catálogo actual.",
    expLabelByTrack: "En el catálogo, \"{song}\" de {artist} está vinculada a {label}.",
    expBpmByStyle: "La referencia de BPM para {style} está calibrada para preservar identidad de pista.",
    expOrigin: "Nuestra señal de origen para {artist} apunta a {origin}.",
    expStyleForArtist: "{artist} está clasificado en {style} dentro de este catálogo."
  }
};

function q(key, vars = {}) {
  const table =
    QUIZ_TEXT[currentLanguage] ||
    QUIZ_TEXT[DEFAULT_LANGUAGE] ||
    QUIZ_TEXT.pt;
  const fallback = QUIZ_TEXT[DEFAULT_LANGUAGE] || QUIZ_TEXT.pt;
  let text = table?.[key] ?? fallback?.[key] ?? key;
  Object.entries(vars).forEach(([name, value]) => {
    text = text.replace(new RegExp(`\\{${name}\\}`, "g"), String(value));
  });
  return text;
}

function noVerifiedTrackMessage() {
  if (currentLanguage === "en") {
    return "I could not verify a real track for this profile yet. Try a different style or click Suggest again.";
  }
  if (currentLanguage === "es") {
    return "No pude verificar una pista real para este perfil todavía. Prueba otro subgénero o pulsa sugerir de nuevo.";
  }
  return "Ainda não consegui validar uma faixa real para este perfil. Tente outro subgênero ou gere nova sugestão.";
}

function recommendationFailureMessage() {
  if (recommendationBlockedByKnown) return t("noUnknownOption");
  return noVerifiedTrackMessage();
}

function styleLabel() {
  if (!styleEl) return t("freeStyle");
  return styleEl.options[styleEl.selectedIndex]?.text || t("freeStyle");
}

function styleLabelByValue(styleValue) {
  if (!styleEl || !styleValue) return t("freeStyle");
  const option = Array.from(styleEl.options).find((item) => item.value === styleValue);
  return option?.text || styleValue.replace(/_/g, " ");
}

function styleInfoSummaryByLanguage(style) {
  if (!style) return "";
  if (currentLanguage === "pt" && STYLE_INFO_PT[style]) return STYLE_INFO_PT[style];

  const family = familyOf(style);
  const languageFallback = STYLE_FAMILY_INFO[currentLanguage] || STYLE_FAMILY_INFO.pt;
  const ptFallback = STYLE_FAMILY_INFO.pt;
  return languageFallback[family] || ptFallback[family] || t("styleInfoFallback");
}

function styleBpmInfoText(style) {
  const bpm = STYLE_BPM_RULES[style];
  if (!bpm || !Number.isFinite(bpm.min) || !Number.isFinite(bpm.max)) {
    return `${t("styleInfoBpmLabel")}: -`;
  }
  if (bpm.min === bpm.max) return `${t("styleInfoBpmLabel")}: ${bpm.min} BPM`;
  return `${t("styleInfoBpmLabel")}: ${bpm.min}-${bpm.max} BPM`;
}

function renderStyleInfoBubble(style, { reveal = false } = {}) {
  if (!styleInfoBubble || !styleInfoTitle || !styleInfoBpm || !styleInfoSummary || !styleInfoTip) return;

  if (!style || !STYLE_BPM_RULES[style]) {
    styleInfoBubble.classList.add("hidden");
    return;
  }

  styleInfoTitle.textContent = `${t("styleInfoTitle")}: ${styleLabelByValue(style)}`;
  styleInfoBpm.textContent = styleBpmInfoText(style);
  styleInfoSummary.textContent = styleInfoSummaryByLanguage(style);
  styleInfoTip.textContent = `${t("styleInfoTip")} ${t("styleInfoSource")}`;

  if (styleInfoCloseBtn) styleInfoCloseBtn.setAttribute("aria-label", t("styleInfoCloseAria"));

  if (reveal || !styleInfoBubble.classList.contains("hidden")) {
    styleInfoBubble.classList.remove("hidden");
  }
}

function energyLabelByValue(energyValue) {
  const labels = {
    pt: { low: "baixa", mid: "media", high: "alta", extreme: "extrema" },
    en: { low: "low", mid: "mid", high: "high", extreme: "extreme" },
    es: { low: "baja", mid: "media", high: "alta", extreme: "extrema" }
  };
  return (labels[currentLanguage] || labels.pt)[energyValue] || energyValue || t("freeEnergy");
}

function contextLabelByValue(contextValue) {
  const labels = {
    pt: { warmup: "warmup", peak: "peak", after: "after", foco: "foco", treino: "treino", estrada: "estrada" },
    en: { warmup: "warm-up", peak: "peak time", after: "after", foco: "focus", treino: "workout", estrada: "road trip" },
    es: { warmup: "calentamiento", peak: "hora pico", after: "after", foco: "foco", treino: "entrenamiento", estrada: "viaje" }
  };
  return (labels[currentLanguage] || labels.pt)[contextValue] || contextValue || t("freeContext");
}

function localizeOptionLabels() {
  if (!styleEl || !contextEl || !energyEl || !vocalsEl || !bpmEl) return;

  const ui = {
    pt: {
      styleFirst: "Escolha o subgênero",
      contextFirst: "Escolha o contexto",
      energyFirst: "Escolha a energia",
      bpmFirst: "Sem preferência",
      vocalsFirst: "Livre",
      styleGroups: ["Psytrance / Trance", "Techno", "House", "Drum and Bass / Bass Music", "Outros eletrônicos relevantes"],
      styleSpecial: {
        psy_comercial: "Psy Comercial / Chacotas",
        dark_progressive: "PROG DARK / Dark Progressive",
        dark_experimental: "Dark Experimental",
        full_on_night: "Full-On Night",
        full_on_morning: "Full-On Morning"
      },
      context: { warmup: "Warm-up", peak: "Peak time", after: "After / downshift", foco: "Foco / trabalho", treino: "Treino", estrada: "Estrada / viagem" },
      energy: { low: "Baixa", mid: "Média", high: "Alta", extreme: "Extrema" },
      vocals: { instrumental: "Instrumental", light_vocals: "Vocais leves", vocal: "Vocal forte" }
    },
    en: {
      styleFirst: "Choose subgenre",
      contextFirst: "Choose context",
      energyFirst: "Choose energy",
      bpmFirst: "No preference",
      vocalsFirst: "Any",
      styleGroups: ["Psytrance / Trance", "Techno", "House", "Drum and Bass / Bass Music", "Other relevant electronic styles"],
      styleSpecial: {
        psy_comercial: "Commercial Psy / Chacotas",
        dark_progressive: "PROG DARK / Dark Progressive",
        dark_experimental: "Dark Experimental",
        full_on_night: "Full-On Night",
        full_on_morning: "Full-On Morning"
      },
      context: { warmup: "Warm-up", peak: "Peak time", after: "After / downshift", foco: "Focus / work", treino: "Workout", estrada: "Road / travel" },
      energy: { low: "Low", mid: "Mid", high: "High", extreme: "Extreme" },
      vocals: { instrumental: "Instrumental", light_vocals: "Light vocals", vocal: "Strong vocals" }
    },
    es: {
      styleFirst: "Elige subgénero",
      contextFirst: "Elige contexto",
      energyFirst: "Elige energía",
      bpmFirst: "Sin preferencia",
      vocalsFirst: "Libre",
      styleGroups: ["Psytrance / Trance", "Techno", "House", "Drum and Bass / Bass Music", "Otros estilos electrónicos relevantes"],
      styleSpecial: {
        psy_comercial: "Psy Comercial / Chacotas",
        dark_progressive: "PROG DARK / Dark Progressive",
        dark_experimental: "Dark Experimental",
        full_on_night: "Full-On Night",
        full_on_morning: "Full-On Morning"
      },
      context: { warmup: "Calentamiento", peak: "Hora pico", after: "After / bajada", foco: "Foco / trabajo", treino: "Entrenamiento", estrada: "Ruta / viaje" },
      energy: { low: "Baja", mid: "Media", high: "Alta", extreme: "Extrema" },
      vocals: { instrumental: "Instrumental", light_vocals: "Voces ligeras", vocal: "Vocal fuerte" }
    }
  };
  const labels = ui[currentLanguage] || ui.pt;

  const setOption = (select, value, text) => {
    const option = Array.from(select.options).find((item) => item.value === value);
    if (option) option.textContent = text;
  };
  setOption(styleEl, "", labels.styleFirst);
  setOption(contextEl, "", labels.contextFirst);
  setOption(energyEl, "", labels.energyFirst);
  setOption(bpmEl, "", labels.bpmFirst);
  setOption(vocalsEl, "", labels.vocalsFirst);

  Object.entries(labels.context).forEach(([value, text]) => setOption(contextEl, value, text));
  Object.entries(labels.energy).forEach(([value, text]) => setOption(energyEl, value, text));
  Object.entries(labels.vocals).forEach(([value, text]) => setOption(vocalsEl, value, text));
  Object.entries(labels.styleSpecial || {}).forEach(([value, text]) => setOption(styleEl, value, text));
  Array.from(styleEl.querySelectorAll("optgroup")).forEach((group, index) => {
    if (labels.styleGroups?.[index]) group.label = labels.styleGroups[index];
  });
}

function setText(selector, text) {
  const el = document.querySelector(selector);
  if (el) el.textContent = text;
}

function syncLanguageButtons() {
  languageButtons.forEach((button) => {
    const isActive = button.dataset.lang === currentLanguage;
    button.classList.toggle("active", isActive);
    button.setAttribute("aria-pressed", isActive ? "true" : "false");
  });
}

function syncQuickSurpriseStyleOptions() {
  if (!quickSurpriseStyleEl || !styleEl) return;
  const previousValue = String(quickSurpriseStyleEl.value || "");
  quickSurpriseStyleEl.innerHTML = styleEl.innerHTML;
  const firstOption = quickSurpriseStyleEl.querySelector("option[value='']");
  if (firstOption) firstOption.textContent = t("quickSurpriseStylePlaceholder");
  const hasPrevious = Array.from(quickSurpriseStyleEl.options).some((option) => option.value === previousValue);
  quickSurpriseStyleEl.value = hasPrevious ? previousValue : "";
}

function applyLanguage() {
  document.documentElement.lang = currentLanguage === "pt" ? "pt-BR" : currentLanguage;
  const labels = {
    pt: {
      profileTitle: "1) Monte seu perfil sonoro",
      subgenre: "Subgênero principal",
      context: "Contexto",
      energy: "Energia",
      bpmRange: "Faixa de BPM",
      vocals: "Preferência de vocal",
      discoveryMode: "Modo descoberta",
      discoveryToggle: "Quero artista novo fora do meu radar",
      knownArtists: "Artistas que você já conhece (separe por vírgula)",
      knownArtistsPlaceholder: "Ex.: Astrix, Charlotte de Witte, Alok",
      weightsTitle: "Prioridade dos filtros",
      resultTitle: "2) Faixa principal",
      listenersTitle: "Quem ouviu essa música recentemente",
      feedbackTitle: "3) Feedback",
      detailsTitle: "4) Detalhes de artista e gravadora",
      artistTitle: "Artista",
      labelTitle: "Gravadora",
      eventsTitle: "5) Próximos eventos do artista curtido",
      summaryTitle: "7) Resumo de perfil",
      defaultStats: "Nenhum feedback ainda.",
      knownPrompt: "Você já conhecia este artista?",
      previewPrompt: "Está gostando do que está escutando?",
      noveltyPrompt: "Legal, novidade desbloqueada. Você gostou dessa faixa?",
      btnKnownYes: "Sim, já conhecia",
      btnKnownNo: "Não, novidade para mim",
      btnNoveltyYes: "Gostei sim",
      btnNoveltyNo: "Ainda não",
      btnPreviewYes: "Sim, curti",
      btnPreviewNo: "Não, troca agora",
      btnLikeSong: "Gostei da faixa",
      btnLikeArtist: "Gostei do artista",
      btnBlockArtist: "Não recomendar este artista",
      btnLikeDiscovery: "Curti a descoberta",
      btnKnewDiscovery: "Já conhecia",
      btnSkip: "Não combinou",
      btnMoreInfo: "Mais sobre artista/label"
    },
    en: {
      profileTitle: "1) Build your sound profile",
      subgenre: "Main subgenre",
      context: "Context",
      energy: "Energy",
      bpmRange: "BPM range",
      vocals: "Vocal preference",
      discoveryMode: "Discovery mode",
      discoveryToggle: "I want a new artist outside my radar",
      knownArtists: "Artists you already know (comma-separated)",
      knownArtistsPlaceholder: "Ex.: Astrix, Charlotte de Witte, Alok",
      weightsTitle: "Filter priority",
      resultTitle: "2) Main track",
      listenersTitle: "Who listened to this track recently",
      feedbackTitle: "3) Feedback",
      detailsTitle: "4) Artist and label details",
      artistTitle: "Artist",
      labelTitle: "Label",
      eventsTitle: "5) Upcoming events for liked artist",
      summaryTitle: "7) Profile summary",
      defaultStats: "No feedback yet.",
      knownPrompt: "Did you already know this artist?",
      previewPrompt: "Are you enjoying what you are listening to?",
      noveltyPrompt: "Nice, new discovery unlocked. Did you enjoy this track?",
      btnKnownYes: "Yes, I knew",
      btnKnownNo: "No, new to me",
      btnNoveltyYes: "Yes, I liked it",
      btnNoveltyNo: "Not yet",
      btnPreviewYes: "Yes, liked it",
      btnPreviewNo: "No, switch now",
      btnLikeSong: "Liked the track",
      btnLikeArtist: "Liked the artist",
      btnBlockArtist: "Never recommend this artist",
      btnLikeDiscovery: "Liked discovery",
      btnKnewDiscovery: "Already knew",
      btnSkip: "Did not match",
      btnMoreInfo: "More about artist/label"
    },
    es: {
      profileTitle: "1) Crea tu perfil sonoro",
      subgenre: "Subgénero principal",
      context: "Contexto",
      energy: "Energía",
      bpmRange: "Rango de BPM",
      vocals: "Preferencia de voz",
      discoveryMode: "Modo descubrimiento",
      discoveryToggle: "Quiero artista nuevo fuera de mi radar",
      knownArtists: "Artistas que ya conoces (separados por coma)",
      knownArtistsPlaceholder: "Ej.: Astrix, Charlotte de Witte, Alok",
      weightsTitle: "Prioridad de filtros",
      resultTitle: "2) Pista principal",
      listenersTitle: "Quién escuchó esta pista recientemente",
      feedbackTitle: "3) Feedback",
      detailsTitle: "4) Detalles de artista y sello",
      artistTitle: "Artista",
      labelTitle: "Sello",
      eventsTitle: "5) Próximos eventos del artista que te gustó",
      summaryTitle: "7) Resumen de perfil",
      defaultStats: "Sin feedback todavía.",
      knownPrompt: "¿Ya conocías este artista?",
      previewPrompt: "¿Te está gustando lo que escuchas?",
      noveltyPrompt: "Bien, novedad desbloqueada. ¿Te gustó esta pista?",
      btnKnownYes: "Sí, ya conocía",
      btnKnownNo: "No, novedad para mí",
      btnNoveltyYes: "Sí, me gustó",
      btnNoveltyNo: "Aún no",
      btnPreviewYes: "Sí, me gustó",
      btnPreviewNo: "No, cambia ahora",
      btnLikeSong: "Me gustó la pista",
      btnLikeArtist: "Me gustó el artista",
      btnBlockArtist: "No recomendar este artista",
      btnLikeDiscovery: "Me gustó el descubrimiento",
      btnKnewDiscovery: "Ya conocía",
      btnSkip: "No combinó",
      btnMoreInfo: "Más sobre artista/sello"
    }
  }[currentLanguage] || {};

  setText("#introKicker", t("introKicker"));
  setText("#introTitle", t("introTitle"));
  setText("#introDesc", t("introDesc"));
  setText("#introImpact", t("introImpact"));
  setText("#introContinueBtn", t("introContinueBtn"));
  updateAudioToggleUi();
  setText("#langKicker", t("langKicker"));
  setText("#langTitle", t("langTitle"));
  setText("#langDesc", t("langDesc"));
  setText("#langSlogan", t("appSlogan"));
  setText("#authKicker", t("authKicker"));
  setText("#authTitle", t("authTitle"));
  setText("#authDesc", t("authDesc"));
  setText("#authUsernameLabel", t("authUsernameLabel"));
  setText("#authPasswordLabel", t("authPasswordLabel"));
  setText("#authLoginBtn", t("authLoginBtn"));
  setText("#authGuestBtn", t("authGuestBtn"));
  if (authUsername) authUsername.placeholder = t("authUsernamePlaceholder");
  if (authPassword) authPassword.placeholder = t("authPasswordPlaceholder");
  setText("#welcomeKicker", t("welcomeKicker"));
  setText("#welcomeTitle", t("welcomeTitle"));
  setText("#welcomeDesc", t("welcomeDesc"));
  setText("#welcomeSlogan", t("appSlogan"));
  setText("#welcomeMission", t("appMission"));
  setText("#startBtn", t("startBtn"));
  setText("#startSurpriseBtn", t("startSurpriseBtn"));
  setText("#quickSurpriseTitle", t("quickSurpriseTitle"));
  setText("#quickSurpriseHint", t("quickSurpriseHint"));
  setText("#quickSurpriseStyleLabel", t("quickSurpriseStyleLabel"));
  setText("#quickSurpriseKnownLabel", t("quickSurpriseKnownLabel"));
  setText("#quickSurpriseKnownTracksLabel", t("quickSurpriseKnownTracksLabel"));
  setText("#quickSurpriseRunBtn", t("quickSurpriseRunBtn"));
  setText("#quickSurpriseCancelBtn", t("quickSurpriseCancelBtn"));
  if (quickSurpriseKnownArtistsEl) quickSurpriseKnownArtistsEl.placeholder = t("quickSurpriseKnownPlaceholder");
  if (quickSurpriseKnownTracksEl) quickSurpriseKnownTracksEl.placeholder = t("quickSurpriseKnownTracksPlaceholder");
  setText("#heroTitle", t("heroTitle"));
  setText("#heroDesc", t("heroDesc"));
  setText("#heroSlogan", t("appSlogan"));
  setText("#heroMission", t("appMission"));
  setText("#recommendBtn", t("recommendBtn"));
  setText("#rerollBtn", t("rerollBtn"));
  setText("#newArtistsBtn", t("newArtistsBtn"));
  setText("#surpriseBtn", t("surpriseBtn"));
  setText("#adaptiveSurpriseBtn", t("adaptiveSurpriseBtn"));
  setText("#clearFiltersBtn", t("clearFiltersBtn"));
  setText("#resetAppBtn", t("resetAppBtn"));
  setText("#newArtistsTitle", t("newArtistsTitle"));
  setText("#spiritPanelTitle", t("spiritPanelTitle"));
  setText("#spiritIntro", t("spiritIntro"));
  setText("#spiritBadge", t("spiritBadge"));
  setText("#spiritVisualTitle", t("spiritVisualTitle"));
  setText("#spiritVisualHint", t("spiritVisualHint"));
  setText("#spiritSpotlightTitle", t("spiritSpotlightTitle"));
  setText("#spiritSpotlightHint", t("spiritSpotlightHintPredicted"));
  setText("#spiritVisualPresetName", t("spiritVisualPreset", { preset: "Neon Pulse" }));
  setText("#spiritVisualYoutubeLink", t("spiritVisualOpenYoutube"));
  if (spiritVisualFrame) spiritVisualFrame.title = t("spiritVideoTitle");
  setText("#spiritSpotlightSpotify", currentLanguage === "en" ? "Listen on Spotify" : currentLanguage === "es" ? "Escuchar en Spotify" : "Ouvir no Spotify");
  setText("#spiritSpotlightYoutube", currentLanguage === "en" ? "Listen on YouTube" : currentLanguage === "es" ? "Escuchar en YouTube" : "Ouvir no YouTube");
  setText("#spiritSpotlightSoundcloud", currentLanguage === "en" ? "Listen on SoundCloud" : currentLanguage === "es" ? "Escuchar en SoundCloud" : "Ouvir no SoundCloud");
  setText("#spiritCollectibleTitle", t("spiritCollectibleTitle"));
  setText("#spiritCollectibleHint", supportsAiCollectibleApi() ? t("spiritCollectibleHintApi") : t("spiritCollectibleHintLocal"));
  setText("#spiritCollectibleDownload", t("spiritCollectibleDownload"));
  setText("#spiritCollectibleShareInstagramBtn", t("spiritCollectibleShareInstagram"));
  setText("#spiritRankBadge", t("spiritRankUnlocked"));
  setText("#searchTitle", t("searchOverlayTitle"));
  setText("#searchStatusText", t("searchOverlayPreparing"));
  setText("#quizKicker", q("overlayKicker"));
  setText("#quizStartBtn", q("startBtn"));
  setText("#quizLaterBtn", q("laterBtn"));
  setText("#quizSubmitBtn", q("submitBtn"));
  setText("#quizNextBtn", q("nextBtn"));
  setText("#quizRetryBtn", q("retryBtn"));
  setText("#quizCloseBtn", q("closeBtn"));
  setText("#spotifyLink", currentLanguage === "en" ? "Listen on Spotify" : currentLanguage === "es" ? "Escuchar en Spotify" : "Ouvir no Spotify");
  setText("#youtubeLink", currentLanguage === "en" ? "Listen on YouTube" : currentLanguage === "es" ? "Escuchar en YouTube" : "Ouvir no YouTube");
  setText("#soundcloudLink", currentLanguage === "en" ? "Listen on SoundCloud" : currentLanguage === "es" ? "Escuchar en SoundCloud" : "Ouvir no SoundCloud");
  if (youtubePreviewFrame) {
    youtubePreviewFrame.title = currentLanguage === "en" ? "YouTube preview player" : currentLanguage === "es" ? "Player de preview YouTube" : "Player de preview YouTube";
  }
  setYouTubePreviewActionState({
    visible: Boolean(youtubePreviewActions && !youtubePreviewActions.classList.contains("hidden")),
    canToggle: Boolean(youtubePreviewToggleBtn && !youtubePreviewToggleBtn.classList.contains("hidden") && !youtubePreviewToggleBtn.disabled),
    canRetry: Boolean(youtubePreviewRetryBtn && !youtubePreviewRetryBtn.classList.contains("hidden") && !youtubePreviewRetryBtn.disabled),
    expanded: Boolean(youtubePreviewWrap && !youtubePreviewWrap.classList.contains("hidden"))
  });
  setText("#discoverySpotifyLink", currentLanguage === "en" ? "Listen on Spotify" : currentLanguage === "es" ? "Escuchar en Spotify" : "Ouvir no Spotify");
  setText("#discoveryYoutubeLink", currentLanguage === "en" ? "Listen on YouTube" : currentLanguage === "es" ? "Escuchar en YouTube" : "Ouvir no YouTube");
  setText("#discoverySoundcloudLink", currentLanguage === "en" ? "Listen on SoundCloud" : currentLanguage === "es" ? "Escuchar en SoundCloud" : "Ouvir no SoundCloud");
  setText("#discoveryCard .chip.alt", currentLanguage === "en" ? "Suggested discovery" : currentLanguage === "es" ? "Descubrimiento sugerido" : "Descoberta sugerida");
  setText("#preferencias-title", labels.profileTitle || "");
  setText("label[for='style']", labels.subgenre || "");
  setText("label[for='context']", labels.context || "");
  setText("label[for='energy']", labels.energy || "");
  setText("label[for='bpm']", labels.bpmRange || "");
  setText("label[for='vocals']", labels.vocals || "");
  setText("label[for='discoveryMode']", labels.discoveryMode || "");
  setText(".checkline span", labels.discoveryToggle || "");
  setText("label[for='knownArtists']", labels.knownArtists || "");
  if (knownArtistsEl) knownArtistsEl.placeholder = labels.knownArtistsPlaceholder || "";
  setText(".weights-panel h4", labels.weightsTitle || "");
  setText("#resultPanel > h3", labels.resultTitle || "");
  setText(".listeners-title", labels.listenersTitle || "");
  setText("#topListenersTitle", t("topListenersTitle"));
  setText(".feedback-grid > h3", labels.feedbackTitle || "");
  setText("#detailsPanel > h3", labels.detailsTitle || "");
  setText("#detailsPanel article:first-child h4", labels.artistTitle || "");
  setText("#detailsPanel article:last-child h4", labels.labelTitle || "");
  setText("#artistSocialsTitle", t("artistSocialsTitle"));
  setText("#artistSocialsHint", t("artistSocialsHint"));
  setText("#eventsPanel > h3", labels.eventsTitle || "");
  setText("#summaryPanelTitle", t("summaryPanelTitle"));
  setText("#summaryStatusLabel", t("summaryStatusLabel"));
  setText("#summaryKnownCountLabel", t("summaryKnownCountLabel"));
  setText("#summaryDiscoveredCountLabel", t("summaryDiscoveredCountLabel"));
  setText("#summaryLikedCountLabel", t("summaryLikedCountLabel"));
  setText("#summaryDislikedCountLabel", t("summaryDislikedCountLabel"));
  setText("#summaryFavoriteStyleLabel", t("summaryFavoriteStyleLabel"));
  setText("#summaryAchievementLabel", t("summaryAchievementLabel"));
  setText("#summaryFiveStarTracksTitle", t("summaryFiveStarTracksTitle"));
  setText("#summaryKnownArtistsTitle", t("summaryKnownArtistsTitle"));
  setText("#summaryLikedArtistsTitle", t("summaryLikedArtistsTitle"));
  setText("#summaryDislikedArtistsTitle", t("summaryDislikedArtistsTitle"));
  setText("#suggestionQueueTitle", t("suggestionQueueTitle"));
  setText("#suggestionQueueHint", t("suggestionQueueHint"));
  setText("#ratingTitle", t("ratingTitle"));
  setText("#ratingCelebration", t("ratingCelebration"));
  setText("#trackAiTitle", t("trackAiTitle"));
  setText("#trackAiRefreshBtn", t("trackAiRefreshBtn"));
  if (starRating) starRating.setAttribute("aria-label", t("ratingAriaGroup"));
  starButtons.forEach((button, index) => {
    button.setAttribute("aria-label", starAriaLabel(index + 1));
  });
  if (statsLine && (!lastPrefs || !currentRecommendation) && userStats.likedSongs === 0 && userStats.likedArtists === 0 && userStats.likedDiscoveries === 0 && userStats.alreadyKnew === 0 && userStats.skipped === 0 && userStats.ratingCount === 0) {
    statsLine.textContent = labels.defaultStats || "";
  }
  setText("#knownArtistPrompt > p", labels.knownPrompt || "");
  setText("#listeningPrompt > p", labels.previewPrompt || "");
  setText("#noveltyEnjoyPrompt > p", labels.noveltyPrompt || "");
  setText("#knownYesBtn", labels.btnKnownYes || "");
  setText("#knownNoBtn", labels.btnKnownNo || "");
  setText("#noveltyLikedBtn", labels.btnNoveltyYes || "");
  setText("#noveltyNotYetBtn", labels.btnNoveltyNo || "");
  setText("#previewLikeBtn", labels.btnPreviewYes || "");
  setText("#previewDislikeBtn", labels.btnPreviewNo || "");
  setText("#likeSongBtn", labels.btnLikeSong || "");
  setText("#likeArtistBtn", labels.btnLikeArtist || "");
  setText("#blockArtistBtn", labels.btnBlockArtist || "");
  setText("#likeDiscoveryBtn", labels.btnLikeDiscovery || "");
  setText("#knewDiscoveryBtn", labels.btnKnewDiscovery || "");
  setText("#skipBtn", labels.btnSkip || "");
  setText("#moreInfoBtn", labels.btnMoreInfo || "");
  if (generatedBadge) generatedBadge.textContent = t("generatedNow");
  if (eventsIntro && (!currentRecommendation || eventsPanel?.classList.contains("hidden"))) eventsIntro.textContent = t("eventsPrompt");
  if (topListenersSubtitle && (!currentRecommendation || topListenersPanel?.classList.contains("hidden"))) {
    topListenersSubtitle.textContent = t("topListenersSubtitle", { style: styleLabelByValue(styleEl?.value || "") });
  }
  updateSpiritProgressText();
  void renderMusicalSpirit({ celebrate: false, forceAnimation: false });
  renderTrackRating(currentRecommendation);
  renderRecentListeners(currentRecommendation);
  renderTopListeners(currentRecommendation);
  renderSuggestionQueue(lastPrefs);
  renderTrackInsightPanel(currentRecommendation, { deferHydrate: true });
  localizeOptionLabels();
  syncQuickSurpriseStyleOptions();
  if (styleInfoCloseBtn) styleInfoCloseBtn.setAttribute("aria-label", t("styleInfoCloseAria"));
  if (!styleEl?.value) {
    if (styleInfoBubble) styleInfoBubble.classList.add("hidden");
  } else if (!styleInfoDismissed) {
    renderStyleInfoBubble(styleEl.value, { reveal: !styleInfoBubble?.classList.contains("hidden") });
  }
  syncLanguageButtons();
  if (introScreen && !introScreen.classList.contains("hidden")) {
    introQuoteIndex = 0;
    startIntroQuoteLoop();
  }
  if (quizSession?.completed) renderQuizResultState();
  else if (quizSession) renderQuizQuestionState();
  else renderQuizIdleState();
  if (quizPendingChallenge && quizOfferStateReady()) renderQuizChallengeBubble(quizPendingChallenge);
  else hideQuizChallengeBubble({ clearPending: false });
  updateStats();
}

function setLanguage(lang) {
  if (!["pt", "en", "es"].includes(lang)) return;
  currentLanguage = lang;
  applyLanguage();
}

function loadLanguage() {
  currentLanguage = DEFAULT_LANGUAGE;
  applyLanguage();
}

function normalizeUserSession(session) {
  const mode = session?.mode === "login" ? "login" : "guest";
  const username = String(session?.username || "").trim();
  return { mode, username };
}

function sessionProfileKey(session = currentAuthUser) {
  const normalizedSession = normalizeUserSession(session);
  if (normalizedSession.mode === "login") {
    const usernameKey = normalize(normalizedSession.username);
    return usernameKey ? `login:${usernameKey}` : "";
  }
  return "guest:default";
}

function storageKeyForSession(baseKey, session = currentAuthUser) {
  const profileKey = sessionProfileKey(session);
  if (!profileKey) return "";
  return `${baseKey}:${profileKey}`;
}

function clearSessionProfileData(session) {
  const preferenceKey = storageKeyForSession(STORAGE_KEY, session);
  const progressKey = storageKeyForSession(PROGRESS_STORAGE_KEY, session);
  const collectibleKey = storageKeyForSession(SPIRIT_COLLECTIBLE_STORAGE_KEY, session);
  try {
    if (preferenceKey) localStorage.removeItem(preferenceKey);
    if (progressKey) localStorage.removeItem(progressKey);
    if (collectibleKey) localStorage.removeItem(collectibleKey);
  } catch (_err) {
    // ignore storage failures
  }
}

function resetSessionStateInMemory() {
  userStats.likedSongs = 0;
  userStats.likedArtists = 0;
  userStats.likedDiscoveries = 0;
  userStats.alreadyKnew = 0;
  userStats.skipped = 0;
  userStats.ratingCount = 0;
  userStats.ratingSum = 0;

  knownArtistsMemory = new Set();
  knownTrackTitlesMemory = new Set();
  discoveredArtistsInApp = new Set();
  seenArtistsMemory = new Set();
  blockedArtistsMemory = new Set();
  rejectedArtists = new Set();
  recommendationMemory = new Set();
  recommendationMemoryQueue = [];
  recentTrackHistoryByStyle = new Map();
  servedTrackCycleByStyle = new Map();
  servedArtistCycleByStyle = new Map();
  lastRejectedTrackKey = "";
  recommendationBlockedByKnown = false;
  recommendationStyleFallbackInfo = null;
  lastPrefs = null;
  currentRecommendation = null;
  currentDiscovery = null;

  adaptiveModel.likedStyles.clear();
  adaptiveModel.dislikedStyles.clear();
  adaptiveModel.likedArtists.clear();
  adaptiveModel.dislikedArtists.clear();
  adaptiveModel.likedEnergies.clear();
  adaptiveModel.dislikedEnergies.clear();
  spiritSignalsByStyle = new Map();
  spiritUnlocked = false;
  currentSpiritId = "";
  spiritLastReviewedSongLikes = 0;
  currentSpiritVisualQuery = "";
  spiritCollectibleBusy = false;
  trackRatings = new Map();
  trackRatingSignals = new Map();
  trackPreferenceSignals = new Map();
  trackPreviewIssueSignals = new Map();
  previewReliabilityByStyle = new Map();
  listeningNarrativeToken = 0;
  youtubePreviewSearchAttempt = 0;
  youtubePreviewTrackKey = "";
  if (quizOfferTimer) window.clearTimeout(quizOfferTimer);
  quizOfferTimer = 0;
  quizPendingChallenge = null;
  quizSession = null;
  quizSelectedOption = -1;
  quizCurrentAnswered = false;
  quizAttemptsByStyle = new Map();
  quizBestScoreByStyle = new Map();
  quizNextOfferCountByStyle = new Map();
  suggestionQueueTracks = [];
  suggestionQueueContextKey = "";
  trackInsightCache = new Map();
  currentTrackInsightTrackKey = "";
  styleInfoDismissed = false;
}

function resetPreferenceInputsToDefault() {
  if (styleEl) styleEl.value = "";
  if (contextEl) contextEl.value = "";
  if (energyEl) energyEl.value = "";
  if (bpmEl) bpmEl.value = "";
  if (vocalsEl) vocalsEl.value = "";
  if (knownArtistsEl) knownArtistsEl.value = "";
  if (discoveryModeEl) discoveryModeEl.checked = true;
  if (weightStyleEl) weightStyleEl.value = String(DEFAULT_WEIGHTS.style);
  if (weightContextEl) weightContextEl.value = String(DEFAULT_WEIGHTS.context);
  if (weightEnergyEl) weightEnergyEl.value = String(DEFAULT_WEIGHTS.energy);
  if (weightBpmEl) weightBpmEl.value = String(DEFAULT_WEIGHTS.bpm);
  if (weightVocalsEl) weightVocalsEl.value = String(DEFAULT_WEIGHTS.vocals);
}

function resetSessionUiState() {
  if (resultPanel) resultPanel.classList.add("hidden");
  if (detailsPanel) detailsPanel.classList.add("hidden");
  if (eventsPanel) eventsPanel.classList.add("hidden");
  if (discoveryCard) discoveryCard.classList.add("hidden");
  if (previewPanel) previewPanel.classList.add("hidden");
  if (knownArtistPrompt) knownArtistPrompt.classList.add("hidden");
  if (noveltyEnjoyPrompt) noveltyEnjoyPrompt.classList.add("hidden");
  if (listeningPrompt) listeningPrompt.classList.add("hidden");
  if (recentListenersPanel) recentListenersPanel.classList.add("hidden");
  if (topListenersPanel) topListenersPanel.classList.add("hidden");
  if (newArtistsPanel) newArtistsPanel.classList.add("hidden");
  if (suggestionQueueCard) suggestionQueueCard.classList.add("hidden");
  if (suggestionQueueList) suggestionQueueList.innerHTML = "";
  if (trackAiPanel) trackAiPanel.classList.add("hidden");
  if (trackAiText) trackAiText.textContent = "";
  if (trackAiMeta) trackAiMeta.textContent = "";
  if (listeningNarrative) {
    listeningNarrativeToken += 1;
    listeningNarrative.classList.add("hidden");
    listeningNarrative.classList.remove("typing");
    listeningNarrative.textContent = "";
  }
  hideQuizChallengeBubble({ clearPending: true });
  closeQuizOverlay({ skipSnooze: true });
  if (feedbackMessage) feedbackMessage.textContent = "";
  if (statsLine) statsLine.textContent = t("defaultStats");
  if (previewStatus) previewStatus.textContent = t("previewSearching");
  if (eventsIntro) eventsIntro.textContent = t("eventsPrompt");
  if (eventsCalendar) eventsCalendar.innerHTML = "";
  if (eventsList) eventsList.innerHTML = "";
  if (recentListenersList) recentListenersList.innerHTML = "";
  if (listenersSubtitle) listenersSubtitle.textContent = "";
  if (topListenersList) topListenersList.innerHTML = "";
  if (topListenersSubtitle) topListenersSubtitle.textContent = "";
  if (newArtistsStatus) newArtistsStatus.textContent = "";
  if (newArtistsList) newArtistsList.innerHTML = "";
  if (artistBio) artistBio.textContent = "";
  if (labelBio) labelBio.textContent = "";
  if (artistSocialsPanel) artistSocialsPanel.classList.add("hidden");
  if (artistSocialLinks) artistSocialLinks.innerHTML = "";
  if (spiritPanel) spiritPanel.classList.add("hidden");
  if (spiritSpotlightPanel) spiritSpotlightPanel.classList.add("hidden");
  if (spiritSpotlightHint) spiritSpotlightHint.textContent = t("spiritSpotlightHintPredicted");
  if (spiritSpotlightTrack) spiritSpotlightTrack.textContent = "";
  if (spiritSpotlightMeta) spiritSpotlightMeta.textContent = "";
  setListenLinkState(spiritSpotlightSpotify, { href: "#", enabled: false, title: t("previewUnavailable") });
  setListenLinkState(spiritSpotlightYoutube, { href: "#", enabled: false, title: t("previewUnavailable") });
  setListenLinkState(spiritSpotlightSoundcloud, { href: "#", enabled: false, title: t("previewUnavailable") });
  if (spiritCollectiblePanel) spiritCollectiblePanel.classList.add("hidden");
  if (spiritCollectibleImage) spiritCollectibleImage.removeAttribute("src");
  if (spiritCollectibleDetails) spiritCollectibleDetails.textContent = "";
  if (spiritCollectibleDownload) spiritCollectibleDownload.setAttribute("href", "#");
  if (spiritCollectibleShareInstagramBtn) {
    spiritCollectibleShareInstagramBtn.disabled = true;
    spiritCollectibleShareInstagramBtn.textContent = t("spiritCollectibleShareInstagram");
    spiritCollectibleShareInstagramBtn.removeAttribute("data-image-url");
    spiritCollectibleShareInstagramBtn.removeAttribute("data-filename");
  }
  if (spiritVisualPresetName) spiritVisualPresetName.textContent = "";
  if (styleInfoBubble) styleInfoBubble.classList.add("hidden");
  renderTrackRating(null);
  applyGenreVibeTheme("", { force: true });
  if (trackPreview) {
    try {
      trackPreview.pause();
      trackPreview.removeAttribute("src");
      trackPreview.load();
    } catch (_err) {
      // ignore playback reset failures
    }
  }
  resetYouTubePreviewEmbed();
}

function activateUserSession(session) {
  currentAuthUser = normalizeUserSession(session);
  resetSessionStateInMemory();
  resetSessionUiState();
  progressStorageReady = false;
  resetPreferenceInputsToDefault();
  loadPreferences();
  loadProgress();
  updateWeightLabels();
  styleInfoDismissed = false;
  renderStyleInfoBubble(styleEl?.value || "", { reveal: Boolean(styleEl?.value) });
}

function setAuthFeedback(message = "", isError = false) {
  if (!authFeedback) return;
  authFeedback.textContent = message;
  authFeedback.style.color = isError ? "#ffc5d1" : "";
}

function readStoredUserSession() {
  try {
    const raw = localStorage.getItem(USER_SESSION_STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    const mode = parsed?.mode === "login" ? "login" : "guest";
    const username = String(parsed?.username || "").trim();
    return { mode, username };
  } catch (_err) {
    return null;
  }
}

function persistUserSession(session) {
  try {
    localStorage.setItem(USER_SESSION_STORAGE_KEY, JSON.stringify({
      mode: session?.mode === "login" ? "login" : "guest",
      username: String(session?.username || "").trim()
    }));
  } catch (_err) {
    // ignore storage failures
  }
}

function readStoredAudioPreference() {
  try {
    const stored = localStorage.getItem(AUDIO_STORAGE_KEY);
    if (stored === "off") return false;
    if (stored === "on") return true;
  } catch (_err) {
    // ignore storage failures
  }
  return true;
}

function persistAudioPreference(enabled) {
  try {
    localStorage.setItem(AUDIO_STORAGE_KEY, enabled ? "on" : "off");
  } catch (_err) {
    // ignore storage failures
  }
}

function updateAudioToggleUi() {
  const active = Boolean(audioEnabled && !audioUnavailable);
  if (audioToggleBtn) {
    audioToggleBtn.classList.toggle("muted", !active);
    audioToggleBtn.setAttribute("aria-pressed", active ? "true" : "false");
    audioToggleBtn.title = active ? t("audioOn") : t("audioOff");
  }
  if (audioToggleLabel) {
    audioToggleLabel.textContent = active ? t("audioOn") : t("audioOff");
  }
}

function preAppScreensVisible() {
  const introVisible = introScreen && !introScreen.classList.contains("hidden");
  const languageVisible = languageScreen && !languageScreen.classList.contains("hidden");
  const authVisible = authScreen && !authScreen.classList.contains("hidden");
  const welcomeVisible = welcomeScreen && !welcomeScreen.classList.contains("hidden");
  return Boolean(introVisible || languageVisible || authVisible || welcomeVisible);
}

function createAudioNoiseBuffer(ctx, duration = 1.8) {
  const size = Math.max(1, Math.floor(ctx.sampleRate * duration));
  const buffer = ctx.createBuffer(1, size, ctx.sampleRate);
  const channel = buffer.getChannelData(0);
  for (let i = 0; i < size; i += 1) {
    channel[i] = (Math.random() * 2 - 1) * 0.32;
  }
  return buffer;
}

function initAudioEngine() {
  if (audioUnavailable) return false;
  if (audioContext && audioMasterGain && audioMusicGain && audioFxGain && audioLimiter) return true;
  const ContextCtor = window.AudioContext || window.webkitAudioContext;
  if (!ContextCtor) {
    audioUnavailable = true;
    updateAudioToggleUi();
    return false;
  }

  try {
    audioContext = new ContextCtor();
    audioMasterGain = audioContext.createGain();
    audioMusicGain = audioContext.createGain();
    audioFxGain = audioContext.createGain();
    audioLimiter = audioContext.createDynamicsCompressor();

    audioMasterGain.gain.value = 0.0001;
    audioMusicGain.gain.value = 0.0001;
    audioFxGain.gain.value = AUDIO_GAIN_PROFILE.fxBusGain;
    audioLimiter.threshold.value = -16;
    audioLimiter.knee.value = 20;
    audioLimiter.ratio.value = 5.2;
    audioLimiter.attack.value = 0.003;
    audioLimiter.release.value = 0.16;

    audioMusicGain.connect(audioMasterGain);
    audioFxGain.connect(audioMasterGain);
    audioMasterGain.connect(audioLimiter);
    audioLimiter.connect(audioContext.destination);
    return true;
  } catch (_err) {
    audioUnavailable = true;
    audioContext = null;
    audioMasterGain = null;
    audioMusicGain = null;
    audioFxGain = null;
    audioLimiter = null;
    updateAudioToggleUi();
    return false;
  }
}

function ensureAudioReady() {
  if (!audioEnabled || !audioUnlocked || audioUnavailable) return false;
  if (!initAudioEngine()) return false;

  try {
    const now = audioContext.currentTime;
    audioMasterGain.gain.cancelScheduledValues(now);
    audioMasterGain.gain.setTargetAtTime(AUDIO_GAIN_PROFILE.masterTarget, now, 0.08);
    if (audioContext.state === "suspended") {
      void audioContext.resume().catch(() => {});
    }
    return true;
  } catch (_err) {
    return false;
  }
}

function ensureIntroAmbientGraph() {
  if (!ensureAudioReady() || !audioContext || !audioMusicGain) return false;
  if (introAmbientNodes?.bus) return true;

  const ctx = audioContext;
  const bus = ctx.createGain();
  bus.gain.value = 0.0001;
  bus.connect(audioMusicGain);

  const toneBus = ctx.createGain();
  toneBus.gain.value = 0.9;
  const lowpass = ctx.createBiquadFilter();
  lowpass.type = "lowpass";
  lowpass.frequency.value = 920;
  lowpass.Q.value = 0.5;
  toneBus.connect(lowpass);
  lowpass.connect(bus);

  const rootOsc = ctx.createOscillator();
  rootOsc.type = "triangle";
  rootOsc.frequency.value = 55;
  const rootGain = ctx.createGain();
  rootGain.gain.value = AUDIO_GAIN_PROFILE.introRootGain;
  rootOsc.connect(rootGain);
  rootGain.connect(toneBus);

  const padOsc = ctx.createOscillator();
  padOsc.type = "sine";
  padOsc.frequency.value = 110;
  const padGain = ctx.createGain();
  padGain.gain.value = AUDIO_GAIN_PROFILE.introPadGain;
  padOsc.connect(padGain);
  padGain.connect(toneBus);

  const shimmerOsc = ctx.createOscillator();
  shimmerOsc.type = "sine";
  shimmerOsc.frequency.value = 220;
  const shimmerGain = ctx.createGain();
  shimmerGain.gain.value = AUDIO_GAIN_PROFILE.introShimmerGain;
  shimmerOsc.connect(shimmerGain);
  shimmerGain.connect(toneBus);

  const driftLfo = ctx.createOscillator();
  driftLfo.type = "sine";
  driftLfo.frequency.value = 0.062;
  const driftLfoGain = ctx.createGain();
  driftLfoGain.gain.value = 18;
  driftLfo.connect(driftLfoGain);
  driftLfoGain.connect(padOsc.frequency);

  const shimmerLfo = ctx.createOscillator();
  shimmerLfo.type = "triangle";
  shimmerLfo.frequency.value = 0.24;
  const shimmerLfoGain = ctx.createGain();
  shimmerLfoGain.gain.value = 0.008;
  shimmerLfo.connect(shimmerLfoGain);
  shimmerLfoGain.connect(shimmerGain.gain);

  const noiseSource = ctx.createBufferSource();
  noiseSource.buffer = createAudioNoiseBuffer(ctx, 2.2);
  noiseSource.loop = true;
  const noiseFilter = ctx.createBiquadFilter();
  noiseFilter.type = "bandpass";
  noiseFilter.frequency.value = 880;
  noiseFilter.Q.value = 0.4;
  const noiseGain = ctx.createGain();
  noiseGain.gain.value = AUDIO_GAIN_PROFILE.introNoiseGain;
  noiseSource.connect(noiseFilter);
  noiseFilter.connect(noiseGain);
  noiseGain.connect(toneBus);

  const now = ctx.currentTime + 0.02;
  rootOsc.start(now);
  padOsc.start(now);
  shimmerOsc.start(now);
  driftLfo.start(now);
  shimmerLfo.start(now);
  noiseSource.start(now);

  introAmbientNodes = {
    bus,
    toneBus,
    rootOsc,
    rootGain,
    padOsc,
    padGain,
    shimmerOsc,
    shimmerGain,
    driftLfo,
    driftLfoGain,
    shimmerLfo,
    shimmerLfoGain,
    noiseSource,
    noiseFilter,
    noiseGain
  };
  return true;
}

function clearIntroAmbientArp() {
  if (!introAmbientArpTimer) return;
  window.clearInterval(introAmbientArpTimer);
  introAmbientArpTimer = 0;
}

function triggerIntroAmbientPulse(frequency = 440) {
  if (!ensureAudioReady() || !audioContext || !introAmbientNodes?.bus) return;
  const ctx = audioContext;
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();
  const filter = ctx.createBiquadFilter();
  filter.type = "bandpass";
  filter.frequency.value = Math.min(2800, Math.max(380, frequency * 2.4));
  filter.Q.value = 0.52;

  osc.type = "triangle";
  const start = ctx.currentTime + 0.01;
  const end = start + 0.34;
  osc.frequency.setValueAtTime(Math.max(120, frequency), start);
  osc.frequency.exponentialRampToValueAtTime(Math.max(90, frequency * 0.64), end);

  gain.gain.setValueAtTime(0.0001, start);
  gain.gain.exponentialRampToValueAtTime(AUDIO_GAIN_PROFILE.introPulseGain, start + 0.035);
  gain.gain.exponentialRampToValueAtTime(0.0001, end);

  osc.connect(filter);
  filter.connect(gain);
  gain.connect(introAmbientNodes.bus);
  osc.start(start);
  osc.stop(end + 0.03);
}

function startIntroAmbientArp() {
  if (introAmbientArpTimer) return;
  const pattern = [220, 246.94, 293.66, 329.63, 392];
  let index = Math.floor(Math.random() * pattern.length);
  introAmbientArpTimer = window.setInterval(() => {
    if (!preAppScreensVisible() || !audioEnabled || !audioUnlocked) return;
    index = (index + 1) % pattern.length;
    triggerIntroAmbientPulse(pattern[index]);
  }, 960);
}

function setIntroAmbientActive(active, { immediate = false } = {}) {
  if (!introAmbientNodes?.bus && !active) {
    clearIntroAmbientArp();
    return;
  }
  if (active && !ensureIntroAmbientGraph()) return;
  const bus = introAmbientNodes?.bus;
  if (!bus || !audioContext) return;

  const now = audioContext.currentTime;
  const targetGain = active && audioEnabled ? AUDIO_GAIN_PROFILE.introBusTarget : 0.0001;
  bus.gain.cancelScheduledValues(now);
  if (immediate) {
    bus.gain.setValueAtTime(targetGain, now);
  } else {
    bus.gain.setTargetAtTime(targetGain, now, active ? 0.28 : 0.18);
  }

  if (active && audioEnabled) startIntroAmbientArp();
  else clearIntroAmbientArp();
}

function refreshAmbientForUiState({ immediate = false } = {}) {
  const shouldPlay = preAppScreensVisible() && audioEnabled && audioUnlocked;
  setIntroAmbientActive(shouldPlay, { immediate });
}

function playOpeningSting() {
  if (!audioEnabled || audioUnavailable || openingStingPlayed) return false;
  if (!ensureAudioReady()) return false;
  openingStingPlayed = true;
  openingStingPending = false;

  // Intro music theme (6-7s) played once when the user enters pre-app screens.
  spawnUiTone({ frequency: 82.41, slideTo: 92.5, duration: 1.2, volume: 0.12, type: "sine", pan: -0.06, filterFrequency: 220 });
  spawnUiTone({ frequency: 123.47, slideTo: 130.81, duration: 1.1, volume: 0.092, type: "triangle", pan: 0.08, filterFrequency: 430, when: 0.04 });
  spawnUiTone({ frequency: 196, slideTo: 220, duration: 0.88, volume: 0.084, type: "sine", pan: -0.02, filterFrequency: 980, when: 0.12 });
  spawnUiTransient({ duration: 0.22, volume: 0.05, when: 0.08, pan: 0, highpass: 640, lowpass: 4600 });

  const leadPhrase = [
    392, 440, 493.88, 523.25,
    587.33, 659.25, 587.33, 523.25,
    493.88, 440, 392, 349.23,
    392, 440, 523.25, 587.33
  ];
  const leadStep = 0.34;
  leadPhrase.forEach((frequency, index) => {
    const when = 0.24 + (index * leadStep);
    const isAccent = index % 4 === 0;
    spawnUiTone({
      frequency,
      slideTo: frequency * (isAccent ? 1.035 : 1.018),
      duration: isAccent ? 0.34 : 0.27,
      volume: isAccent ? 0.108 : 0.086,
      type: isAccent ? "triangle" : "sine",
      when,
      pan: index % 2 === 0 ? -0.18 : 0.16,
      filterFrequency: 1180 + (index * 36)
    });
    if (index % 2 === 0) {
      spawnUiTransient({
        duration: 0.075,
        volume: 0.019,
        when: when + 0.02,
        pan: index % 4 === 0 ? -0.12 : 0.12,
        highpass: 1180,
        lowpass: 5200
      });
    }
  });

  const bassPattern = [98, 98, 110, 123.47, 98, 92.5, 82.41, 92.5];
  bassPattern.concat(bassPattern).forEach((frequency, index) => {
    spawnUiTone({
      frequency,
      slideTo: frequency * 0.96,
      duration: 0.56,
      volume: 0.118,
      type: "sine",
      when: 0.18 + (index * 0.42),
      pan: -0.03,
      filterFrequency: 350
    });
  });

  [0, 1.68, 3.36, 5.04].forEach((when, index) => {
    const chordRoots = [261.63, 293.66, 329.63, 392][index % 4];
    spawnUiTone({
      frequency: chordRoots,
      slideTo: chordRoots * 1.12,
      duration: 1.48,
      volume: 0.062,
      type: "triangle",
      when,
      pan: -0.16,
      filterFrequency: 980
    });
    spawnUiTone({
      frequency: chordRoots * 1.5,
      slideTo: chordRoots * 1.68,
      duration: 1.36,
      volume: 0.056,
      type: "sine",
      when: when + 0.05,
      pan: 0.2,
      filterFrequency: 1620
    });
  });

  spawnUiTone({ frequency: 659.25, slideTo: 987.77, duration: 0.62, volume: 0.094, type: "triangle", when: 5.72, pan: 0.12, filterFrequency: 2600 });
  spawnUiTone({ frequency: 880, slideTo: 1174.66, duration: 0.74, volume: 0.082, type: "sine", when: 5.88, pan: -0.04, filterFrequency: 2850 });
  spawnUiTransient({ duration: 0.16, volume: 0.042, when: 6.02, pan: 0.08, highpass: 840, lowpass: 4800 });
  return true;
}

function requestOpeningSting() {
  if (openingStingPlayed || !preAppScreensVisible()) return;
  if (!playOpeningSting()) {
    openingStingPending = true;
  }
}

function startSearchAudioPulse() {
  if (searchAudioPulseTimer) return;
  let pulseStep = 0;
  searchAudioPulseTimer = window.setInterval(() => {
    if (!audioEnabled || audioUnavailable || !audioUnlocked) return;
    if (!searchOverlay || searchOverlay.classList.contains("hidden")) return;
    const base = pulseStep % 2 === 0 ? 176 : 196;
    spawnUiTone({ frequency: base * 0.5, slideTo: base * 0.42, duration: 0.28, volume: 0.072, type: "sine", pan: -0.1, filterFrequency: 380 });
    spawnUiTone({ frequency: base, slideTo: base - 18, duration: 0.28, volume: 0.09, type: "triangle", pan: -0.16, filterFrequency: 820 });
    spawnUiTone({ frequency: base * 1.5, slideTo: base * 1.32, duration: 0.26, volume: 0.078, type: "sine", when: 0.08, pan: 0.12, filterFrequency: 1200 });
    if (pulseStep % 2 === 0) {
      spawnUiTransient({ duration: 0.1, volume: 0.024, when: 0.02, pan: 0.05, highpass: 620, lowpass: 3200 });
    }
    pulseStep += 1;
  }, 700);
}

function stopSearchAudioPulse() {
  if (!searchAudioPulseTimer) return;
  window.clearInterval(searchAudioPulseTimer);
  searchAudioPulseTimer = 0;
}

function spawnUiTone({
  frequency = 440,
  duration = 0.12,
  volume = 0.09,
  type = "sine",
  when = 0,
  slideTo = 0,
  pan = 0,
  filterFrequency = 2200
} = {}) {
  if (!ensureAudioReady() || !audioContext || !audioFxGain) return;

  const ctx = audioContext;
  const start = ctx.currentTime + Math.max(0, when);
  const end = start + Math.max(0.04, duration);

  const osc = ctx.createOscillator();
  const filter = ctx.createBiquadFilter();
  const gain = ctx.createGain();
  filter.type = "bandpass";
  filter.frequency.value = Math.max(120, filterFrequency);
  filter.Q.value = 0.65;

  osc.type = type;
  osc.frequency.setValueAtTime(Math.max(50, frequency), start);
  if (slideTo && slideTo > 0) {
    osc.frequency.exponentialRampToValueAtTime(Math.max(50, slideTo), end);
  }

  const scaledVolume = Math.min(
    AUDIO_GAIN_PROFILE.uiToneMax,
    Math.max(0.0002, volume * AUDIO_GAIN_PROFILE.uiToneBoost)
  );
  gain.gain.setValueAtTime(0.0001, start);
  gain.gain.exponentialRampToValueAtTime(scaledVolume, start + 0.014);
  gain.gain.exponentialRampToValueAtTime(0.0001, end);

  osc.connect(filter);
  filter.connect(gain);

  if (typeof ctx.createStereoPanner === "function") {
    const panner = ctx.createStereoPanner();
    panner.pan.value = Math.max(-1, Math.min(1, pan));
    gain.connect(panner);
    panner.connect(audioFxGain);
  } else {
    gain.connect(audioFxGain);
  }

  osc.start(start);
  osc.stop(end + 0.02);
}

function spawnUiTransient({
  duration = 0.11,
  volume = 0.04,
  when = 0,
  pan = 0,
  lowpass = 3200,
  highpass = 540
} = {}) {
  if (!ensureAudioReady() || !audioContext || !audioFxGain) return;

  const ctx = audioContext;
  const safeDuration = Math.max(0.04, duration);
  const start = ctx.currentTime + Math.max(0, when);
  const end = start + safeDuration;

  const source = ctx.createBufferSource();
  source.buffer = createAudioNoiseBuffer(ctx, safeDuration + 0.08);

  const hp = ctx.createBiquadFilter();
  hp.type = "highpass";
  hp.frequency.value = Math.max(120, highpass);
  hp.Q.value = 0.72;

  const lp = ctx.createBiquadFilter();
  lp.type = "lowpass";
  lp.frequency.value = Math.max(hp.frequency.value + 120, lowpass);
  lp.Q.value = 0.42;

  const gain = ctx.createGain();
  const scaledVolume = Math.min(
    AUDIO_GAIN_PROFILE.uiToneMax,
    Math.max(0.0002, volume * AUDIO_GAIN_PROFILE.uiToneBoost)
  );
  gain.gain.setValueAtTime(0.0001, start);
  gain.gain.exponentialRampToValueAtTime(scaledVolume, start + 0.009);
  gain.gain.exponentialRampToValueAtTime(0.0001, end);

  source.connect(hp);
  hp.connect(lp);
  lp.connect(gain);

  if (typeof ctx.createStereoPanner === "function") {
    const panner = ctx.createStereoPanner();
    panner.pan.value = Math.max(-1, Math.min(1, pan));
    gain.connect(panner);
    panner.connect(audioFxGain);
  } else {
    gain.connect(audioFxGain);
  }

  source.start(start, 0, safeDuration + 0.03);
  source.stop(end + 0.05);
}

function duckIntroAmbientForFx(amount = 0.66, hold = 0.16) {
  if (!audioContext || !audioEnabled || !introAmbientNodes?.bus || !preAppScreensVisible()) return;
  const bus = introAmbientNodes.bus;
  const now = audioContext.currentTime;
  const normal = Math.max(0.0001, AUDIO_GAIN_PROFILE.introBusTarget);
  const ducked = Math.max(0.06, normal * Math.max(0.2, Math.min(0.95, amount)));
  const releaseAt = now + Math.max(0.06, hold);

  bus.gain.cancelScheduledValues(now);
  bus.gain.setTargetAtTime(ducked, now, 0.018);
  bus.gain.setTargetAtTime(normal, releaseAt, 0.09);
}

function playUiSfx(type = "tap") {
  if (!audioEnabled || !audioUnlocked || audioUnavailable) return;

  if (type === "tap") {
    spawnUiTone({ frequency: 560, slideTo: 450, duration: 0.09, volume: 0.07, type: "triangle", pan: -0.08, filterFrequency: 2200 });
    spawnUiTransient({ duration: 0.055, volume: 0.016, pan: 0.04, highpass: 1300, lowpass: 5200 });
    return;
  }

  if (type === "confirm") {
    duckIntroAmbientForFx(0.62, 0.15);
    spawnUiTone({ frequency: 245, slideTo: 310, duration: 0.16, volume: 0.086, type: "sine", pan: -0.04, filterFrequency: 980 });
    spawnUiTone({ frequency: 490, slideTo: 620, duration: 0.14, volume: 0.1, type: "triangle", pan: -0.14, filterFrequency: 2300 });
    spawnUiTone({ frequency: 730, slideTo: 920, duration: 0.16, volume: 0.088, type: "sine", when: 0.05, pan: 0.14, filterFrequency: 2600 });
    spawnUiTransient({ duration: 0.09, volume: 0.026, when: 0.02, pan: 0.1, highpass: 900, lowpass: 4400 });
    return;
  }

  if (type === "search-start") {
    duckIntroAmbientForFx(0.58, 0.18);
    spawnUiTone({ frequency: 152, slideTo: 102, duration: 0.24, volume: 0.106, type: "sine", pan: -0.06, filterFrequency: 540 });
    spawnUiTone({ frequency: 250, slideTo: 210, duration: 0.24, volume: 0.11, type: "triangle", pan: -0.18, filterFrequency: 820 });
    spawnUiTone({ frequency: 310, slideTo: 270, duration: 0.26, volume: 0.098, type: "triangle", when: 0.06, pan: 0.2, filterFrequency: 880 });
    spawnUiTransient({ duration: 0.12, volume: 0.038, when: 0.01, pan: 0.08, highpass: 720, lowpass: 4200 });
    return;
  }

  if (type === "search-done") {
    duckIntroAmbientForFx(0.56, 0.2);
    spawnUiTone({ frequency: 261.63, slideTo: 392, duration: 0.18, volume: 0.108, type: "triangle", pan: -0.08, filterFrequency: 1280 });
    spawnUiTone({ frequency: 392, slideTo: 524, duration: 0.18, volume: 0.116, type: "triangle", pan: -0.2, filterFrequency: 1700 });
    spawnUiTone({ frequency: 523.25, slideTo: 659.25, duration: 0.2, volume: 0.11, type: "sine", when: 0.04, pan: 0.16, filterFrequency: 2100 });
    spawnUiTone({ frequency: 783.99, slideTo: 987.77, duration: 0.22, volume: 0.086, type: "sine", when: 0.09, pan: 0.26, filterFrequency: 2800 });
    spawnUiTransient({ duration: 0.14, volume: 0.036, when: 0.05, pan: 0.14, highpass: 820, lowpass: 4600 });
    return;
  }

  if (type === "swap") {
    spawnUiTone({ frequency: 680, slideTo: 430, duration: 0.16, volume: 0.088, type: "triangle", pan: 0.1, filterFrequency: 1650 });
    spawnUiTone({ frequency: 520, slideTo: 350, duration: 0.18, volume: 0.078, type: "triangle", when: 0.04, pan: -0.1, filterFrequency: 1400 });
    spawnUiTransient({ duration: 0.09, volume: 0.024, when: 0.02, pan: -0.08, highpass: 980, lowpass: 3600 });
    return;
  }

  if (type === "like") {
    duckIntroAmbientForFx(0.52, 0.22);
    spawnUiTone({ frequency: 220, slideTo: 330, duration: 0.18, volume: 0.102, type: "sine", pan: -0.12, filterFrequency: 920 });
    spawnUiTone({ frequency: 440, slideTo: 660, duration: 0.16, volume: 0.122, type: "triangle", pan: -0.1, filterFrequency: 1800 });
    spawnUiTone({ frequency: 659.25, slideTo: 988, duration: 0.2, volume: 0.114, type: "sine", when: 0.06, pan: 0.16, filterFrequency: 2400 });
    spawnUiTone({ frequency: 880, slideTo: 1174.66, duration: 0.18, volume: 0.082, type: "sine", when: 0.12, pan: 0.24, filterFrequency: 3000 });
    spawnUiTransient({ duration: 0.14, volume: 0.044, when: 0.03, pan: 0.18, highpass: 700, lowpass: 4800 });
    return;
  }

  if (type === "dislike") {
    duckIntroAmbientForFx(0.5, 0.22);
    spawnUiTone({ frequency: 176, slideTo: 98, duration: 0.24, volume: 0.102, type: "sine", pan: 0.08, filterFrequency: 520 });
    spawnUiTone({ frequency: 320, slideTo: 228, duration: 0.24, volume: 0.112, type: "sawtooth", pan: 0.1, filterFrequency: 760 });
    spawnUiTone({ frequency: 246.94, slideTo: 174.61, duration: 0.28, volume: 0.102, type: "triangle", when: 0.05, pan: -0.12, filterFrequency: 690 });
    spawnUiTone({ frequency: 196, slideTo: 138.59, duration: 0.3, volume: 0.086, type: "triangle", when: 0.11, pan: -0.18, filterFrequency: 620 });
    spawnUiTransient({ duration: 0.15, volume: 0.042, when: 0.04, pan: -0.14, highpass: 420, lowpass: 2100 });
    return;
  }

  if (type === "error") {
    duckIntroAmbientForFx(0.48, 0.24);
    spawnUiTone({ frequency: 184, slideTo: 128, duration: 0.24, volume: 0.114, type: "sawtooth", pan: -0.04, filterFrequency: 560 });
    spawnUiTone({ frequency: 160, slideTo: 110, duration: 0.24, volume: 0.11, type: "square", when: 0.04, pan: 0.04, filterFrequency: 520 });
    spawnUiTransient({ duration: 0.18, volume: 0.048, when: 0.03, pan: -0.02, highpass: 360, lowpass: 1700 });
    return;
  }
}

function setAudioEnabled(nextEnabled, { persist = true, fromUser = false } = {}) {
  audioEnabled = Boolean(nextEnabled) && !audioUnavailable;
  if (persist) persistAudioPreference(audioEnabled);
  if (audioEnabled) {
    if (fromUser) audioUnlocked = true;
    ensureAudioReady();
    if (searchOverlay && !searchOverlay.classList.contains("hidden")) {
      startSearchAudioPulse();
    }
  } else {
    clearIntroAmbientArp();
    stopSearchAudioPulse();
    if (audioMasterGain && audioContext) {
      const now = audioContext.currentTime;
      audioMasterGain.gain.cancelScheduledValues(now);
      audioMasterGain.gain.setTargetAtTime(0.0001, now, 0.05);
    }
  }
  updateAudioToggleUi();
  refreshAmbientForUiState({ immediate: false });
  if (fromUser) {
    playUiSfx(audioEnabled ? "confirm" : "swap");
  }
  if (audioEnabled && preAppScreensVisible()) {
    requestOpeningSting();
  }
}

function unlockAudioFromGesture(event) {
  if (audioUnlocked) return;
  if (event?.type === "keydown") {
    const key = String(event?.key || "");
    if (!key) return;
  }
  audioUnlocked = true;
  if (audioEnabled) {
    ensureAudioReady();
    refreshAmbientForUiState({ immediate: false });
    if (openingStingPending || preAppScreensVisible()) requestOpeningSting();
  }
  window.removeEventListener("pointerdown", unlockAudioFromGesture, true);
  window.removeEventListener("keydown", unlockAudioFromGesture, true);
  window.removeEventListener("touchstart", unlockAudioFromGesture, true);
}

function registerAudioUnlockGestures() {
  window.addEventListener("pointerdown", unlockAudioFromGesture, { capture: true, passive: true });
  window.addEventListener("keydown", unlockAudioFromGesture, { capture: true });
  window.addEventListener("touchstart", unlockAudioFromGesture, { capture: true, passive: true });
}

function bootstrapAudio() {
  audioEnabled = readStoredAudioPreference();
  updateAudioToggleUi();
  registerAudioUnlockGestures();
  if (audioEnabled && initAudioEngine() && audioContext) {
    if (audioContext.state === "running") {
      audioUnlocked = true;
      refreshAmbientForUiState({ immediate: true });
      requestOpeningSting();
    } else {
      void audioContext.resume()
        .then(() => {
          audioUnlocked = true;
          refreshAmbientForUiState({ immediate: true });
          requestOpeningSting();
        })
        .catch(() => {
          // browser denied autoplay without gesture
        });
    }
  }
  refreshAmbientForUiState({ immediate: true });
}

function enforceVisualIntroOnly() {
  if (!introScreen) return;
  const legacyCopy = introScreen.querySelector(".intro-copy");
  if (legacyCopy) legacyCopy.remove();
}

function introQuotesForLanguage() {
  return INTRO_QUOTES[currentLanguage] || INTRO_QUOTES[DEFAULT_LANGUAGE] || INTRO_QUOTES.pt;
}

function renderIntroQuote(quote, { animate = true } = {}) {
  if (!introQuote) return;
  const text = String(quote?.text || "");
  const quoteClass = INTRO_QUOTE_CLASSES.includes(quote?.style) ? quote.style : INTRO_QUOTE_CLASSES[0];

  introQuote.classList.remove("intro-quote-enter", ...INTRO_QUOTE_CLASSES);
  introQuote.textContent = text;
  introQuote.classList.add(quoteClass);

  if (animate) {
    void introQuote.offsetWidth;
    introQuote.classList.add("intro-quote-enter");
  }
}

function stopIntroQuoteLoop() {
  if (introQuoteTimer) {
    window.clearInterval(introQuoteTimer);
    introQuoteTimer = 0;
  }
}

function clearIntroAutoAdvance() {
  if (introAutoAdvanceTimer) {
    window.clearTimeout(introAutoAdvanceTimer);
    introAutoAdvanceTimer = 0;
  }
}

function startIntroQuoteLoop() {
  const quotes = introQuotesForLanguage();
  if (!introQuote || !quotes.length) return;
  stopIntroQuoteLoop();

  const total = quotes.length;
  introQuoteIndex = ((introQuoteIndex % total) + total) % total;
  renderIntroQuote(quotes[introQuoteIndex], { animate: false });

  introQuoteTimer = window.setInterval(() => {
    const list = introQuotesForLanguage();
    if (!list.length) return;
    introQuoteIndex = (introQuoteIndex + 1) % list.length;
    renderIntroQuote(list[introQuoteIndex], { animate: true });
  }, 2600);
}

function showLanguageScreen() {
  introDismissed = true;
  clearIntroAutoAdvance();
  stopIntroQuoteLoop();
  hideQuizChallengeBubble({ clearPending: false });
  closeQuizOverlay({ skipSnooze: true });

  if (introScreen) introScreen.classList.add("hidden");
  if (welcomeScreen) welcomeScreen.classList.add("hidden");
  if (authScreen) authScreen.classList.add("hidden");
  if (appContent) appContent.classList.add("hidden");
  if (languageScreen) languageScreen.classList.remove("hidden");

  const preferredButton = Array.from(languageButtons).find((button) => button.dataset.lang === currentLanguage) || languageButtons[0];
  if (preferredButton) preferredButton.focus();
  refreshAmbientForUiState();
  playUiSfx("confirm");
}

function showIntroScreen() {
  introDismissed = false;
  introQuoteIndex = 0;
  enforceVisualIntroOnly();
  hideQuizChallengeBubble({ clearPending: false });
  closeQuizOverlay({ skipSnooze: true });

  if (introScreen) introScreen.classList.remove("hidden");
  if (languageScreen) languageScreen.classList.add("hidden");
  if (authScreen) authScreen.classList.add("hidden");
  if (welcomeScreen) welcomeScreen.classList.add("hidden");
  if (appContent) appContent.classList.add("hidden");
  if (introScreen) introScreen.focus();

  startIntroQuoteLoop();
  clearIntroAutoAdvance();
  introAutoAdvanceTimer = window.setTimeout(() => {
    if (!introDismissed) showLanguageScreen();
  }, 5200);
  refreshAmbientForUiState({ immediate: true });
  requestOpeningSting();
}

function showAuthScreen() {
  clearIntroAutoAdvance();
  stopIntroQuoteLoop();
  hideQuizChallengeBubble({ clearPending: false });
  closeQuizOverlay({ skipSnooze: true });
  if (introScreen) introScreen.classList.add("hidden");
  if (languageScreen) languageScreen.classList.add("hidden");
  if (welcomeScreen) welcomeScreen.classList.add("hidden");
  if (appContent) appContent.classList.add("hidden");
  if (authScreen) authScreen.classList.remove("hidden");

  const storedUser = readStoredUserSession();
  if (authUsername) authUsername.value = storedUser?.username || "";
  if (authPassword) authPassword.value = "";
  setAuthFeedback("");
  if (authUsername) authUsername.focus();
  refreshAmbientForUiState();
  playUiSfx("confirm");
}

function continueFromAuthToWelcome() {
  if (authScreen) authScreen.classList.add("hidden");
  if (welcomeScreen) welcomeScreen.classList.remove("hidden");
  hideQuizChallengeBubble({ clearPending: false });
  closeQuizOverlay({ skipSnooze: true });
  if (quickSurprisePanel) quickSurprisePanel.classList.add("hidden");
  if (quickSurpriseStyleEl) quickSurpriseStyleEl.value = "";
  if (quickSurpriseKnownArtistsEl) {
    quickSurpriseKnownArtistsEl.value = String(knownArtistsEl?.value || "").trim();
  }
  if (quickSurpriseKnownTracksEl) {
    quickSurpriseKnownTracksEl.value = "";
  }
  syncQuickSurpriseStyleOptions();
  refreshAmbientForUiState();
  playUiSfx("confirm");
}

function openQuickSurprisePanel() {
  if (!quickSurprisePanel) return;
  syncQuickSurpriseStyleOptions();
  if (quickSurpriseKnownArtistsEl && !quickSurpriseKnownArtistsEl.value.trim()) {
    quickSurpriseKnownArtistsEl.value = String(knownArtistsEl?.value || "").trim();
  }
  quickSurprisePanel.classList.remove("hidden");
  if (quickSurpriseStyleEl) quickSurpriseStyleEl.focus();
}

function closeQuickSurprisePanel() {
  if (!quickSurprisePanel) return;
  quickSurprisePanel.classList.add("hidden");
}

async function runFocusedOnboardingSurprise({ style = "", knownArtists = "", knownTracks = "" } = {}) {
  const selectedStyle = String(style || "").trim();
  if (!selectedStyle) return false;
  const knownTracksText = String(knownTracks || "").trim();

  if (styleEl) styleEl.value = selectedStyle;
  if (contextEl) contextEl.value = "";
  if (energyEl) energyEl.value = "";
  if (bpmEl) bpmEl.value = "";
  if (vocalsEl) vocalsEl.value = "";
  if (knownArtistsEl) knownArtistsEl.value = String(knownArtists || "").trim();
  if (quickSurpriseKnownTracksEl) quickSurpriseKnownTracksEl.value = knownTracksText;
  if (discoveryModeEl) discoveryModeEl.checked = true;

  const typedKnown = parseKnownArtists(knownArtistsEl ? knownArtistsEl.value : "");
  typedKnown.forEach((artist) => knownArtistsMemory.add(artist));
  const typedKnownTracks = parseKnownTrackTitles(knownTracksText);
  typedKnownTracks.forEach((trackTitle) => knownTrackTitlesMemory.add(trackTitle));
  saveProgress();

  styleInfoDismissed = false;
  renderStyleInfoBubble(styleEl?.value || "", { reveal: Boolean(styleEl?.value) });
  applyGenreVibeTheme(styleEl?.value || "", { force: true });

  const prefs = {
    style: selectedStyle,
    context: "",
    energy: "",
    bpm: "",
    vocals: ""
  };

  const generated = await generateRecommendationWithOverlay(prefs, {
    resetRejected: false,
    allowKnownFallback: false,
    avoidTrackTitles: Array.from(typedKnownTracks)
  });

  if (!generated) return false;

  lastPrefs = prefs;
  if (rerollBtn) rerollBtn.disabled = false;
  if (eventsPanel) eventsPanel.classList.add("hidden");
  if (eventsIntro) eventsIntro.textContent = t("eventsPrompt");
  if (eventsCalendar) eventsCalendar.innerHTML = "";
  if (eventsList) eventsList.innerHTML = "";
  if (detailsPanel) detailsPanel.classList.add("hidden");
  if (resultPanel) resultPanel.classList.remove("hidden");

  const focusMessage = t("quickSurpriseGenerated", {
    style: styleLabelByValue(selectedStyle)
  });
  if (feedbackMessage) feedbackMessage.textContent = focusMessage;
  showToast(focusMessage);
  savePreferences();
  return true;
}

function enterAppFromWelcome({ surprise = false, surprisePreset = null } = {}) {
  clearIntroAutoAdvance();
  stopIntroQuoteLoop();
  if (welcomeScreen) welcomeScreen.classList.add("hidden");
  closeQuickSurprisePanel();
  hideQuizChallengeBubble({ clearPending: true });
  closeQuizOverlay({ skipSnooze: true });
  if (appContent) appContent.classList.remove("hidden");
  if (styleEl) styleEl.focus();
  refreshAmbientForUiState();
  playUiSfx("confirm");

  window.setTimeout(() => {
    warmupCatalogInBackground();
  }, 250);
  scheduleQuizChallengeEvaluation(220);

  if (!surprise) return;
  window.setTimeout(() => {
    const selectedStyle = String(surprisePreset?.style || "").trim();
    const knownArtists = String(surprisePreset?.knownArtists || "").trim();
    const knownTracks = String(surprisePreset?.knownTracks || "").trim();
    if (selectedStyle) {
      runFocusedOnboardingSurprise({ style: selectedStyle, knownArtists, knownTracks })
        .then((ok) => {
          if (ok) return;
          return runSurpriseRecommendation();
        })
        .catch(() => {
          runSurpriseRecommendation().catch(() => {
            showToast(recommendationFailureMessage());
          });
        });
      return;
    }
    runSurpriseRecommendation().catch(() => {
      showToast(recommendationFailureMessage());
    });
  }, 320);
}

function loginWithCredentials() {
  const username = String(authUsername?.value || "").trim();
  const password = String(authPassword?.value || "").trim();
  if (!username || !password) {
    setAuthFeedback(t("authRequired"), true);
    playUiSfx("error");
    return;
  }

  const session = { mode: "login", username };
  activateUserSession(session);
  persistUserSession(session);
  setAuthFeedback(t("authLoggedAs", { user: username }));
  continueFromAuthToWelcome();
}

function continueWithoutLogin() {
  const session = { mode: "guest", username: "" };
  clearSessionProfileData(session);
  activateUserSession(session);
  persistUserSession(session);
  setAuthFeedback(t("authGuestReady"));
  continueFromAuthToWelcome();
}

function syncDiscoveryFromSeeds() {
  const known = new Set(discoveryCatalog.map((item) => normalize(item.name)));
  Object.entries(STYLE_ARTIST_SEEDS).forEach(([style, artists]) => {
    artists.slice(0, 5).forEach((artist) => {
      const key = normalize(artist);
      if (known.has(key)) return;
      discoveryCatalog.push({
        name: artist,
        style,
        bio: `${artist} - ${styleLabelByValue(style)}`,
        spotifyUrl: `https://open.spotify.com/search/${encodeURIComponent(artist)}`,
        youtubeUrl: `https://www.youtube.com/results?search_query=${encodeURIComponent(`${artist} ${styleLabelByValue(style)}`)}`
      });
      known.add(key);
    });
  });
}

function hasDedicatedClickSfxControl(el) {
  if (!el) return false;
  const controls = [
    introContinueBtn,
    recommendBtn,
    rerollBtn,
    surpriseBtn,
    knownYesBtn,
    knownNoBtn,
    previewLikeBtn,
    previewDislikeBtn,
    noveltyLikedBtn,
    noveltyNotYetBtn,
    likeSongBtn,
    likeArtistBtn,
    blockArtistBtn,
    likeDiscoveryBtn,
    skipBtn,
    adaptiveSurpriseBtn,
    quizStartBtn,
    quizLaterBtn,
    quizSubmitBtn,
    quizNextBtn,
    quizRetryBtn,
    quizCloseBtn
  ];
  return controls.includes(el);
}

function bind(el, eventName, handler) {
  if (!el) return;
  if (eventName === "click") el.dataset.bound = "1";
  el.addEventListener(eventName, async (event) => {
    try {
      if (eventName === "click" && el !== audioToggleBtn && !hasDedicatedClickSfxControl(el)) {
        playUiSfx("tap");
      }
      await handler(event);
    } catch (error) {
      console.error(error);
      playUiSfx("error");
      showToast(t("toastError"));
      if (feedbackMessage) feedbackMessage.textContent = t("feedbackError");
    }
  });
}

function ensureAllButtonsHaveAction() {
  document.querySelectorAll("button").forEach((button) => {
    if (button.dataset.bound === "1") return;
    button.dataset.bound = "1";
    button.addEventListener("click", () => {
      showToast(t("toastButtonFallback"));
    });
  });
}

function showToast(message) {
  if (!toastEl) return;
  toastEl.textContent = message;
  toastEl.classList.remove("hidden", "show");
  void toastEl.offsetWidth;
  toastEl.classList.add("show");

  window.clearTimeout(showToast.timer);
  showToast.timer = window.setTimeout(() => {
    toastEl.classList.remove("show");
    toastEl.classList.add("hidden");
  }, 2700);
}
showToast.timer = 0;

function setSearchProgress(percent) {
  if (!searchProgressFill) return;
  const clamped = Math.max(4, Math.min(100, Number(percent) || 4));
  searchProgressValue = Math.max(searchProgressValue, clamped);
  searchProgressFill.style.width = `${searchProgressValue}%`;
}

function setSearchMessage(message) {
  if (searchStatusText) searchStatusText.textContent = message;
}

function beginSearchOverlay(message = "") {
  searchOverlayLocks += 1;
  if (searchOverlayLocks > 1) {
    if (message) setSearchMessage(message);
    return;
  }

  if (searchOverlay) searchOverlay.classList.remove("hidden");
  if (searchTitle) searchTitle.textContent = t("searchOverlayTitle");
  searchProgressValue = 7;
  setSearchProgress(searchProgressValue);
  if (message) setSearchMessage(message);

  window.clearInterval(searchProgressTimer);
  searchProgressTimer = window.setInterval(() => {
    if (searchProgressValue >= 90) return;
    const step = Math.random() * 5 + 1.5;
    setSearchProgress(searchProgressValue + step);
  }, 240);
  startSearchAudioPulse();
}

function finishSearchOverlay() {
  searchOverlayLocks = Math.max(0, searchOverlayLocks - 1);
  if (searchOverlayLocks > 0) return;

  window.clearInterval(searchProgressTimer);
  stopSearchAudioPulse();
  setSearchProgress(100);
  window.setTimeout(() => {
    if (searchOverlay) searchOverlay.classList.add("hidden");
    searchProgressValue = 0;
    if (searchProgressFill) searchProgressFill.style.width = "4%";
  }, 180);
}

async function withSearchOverlay(initialMessage, worker) {
  beginSearchOverlay(initialMessage);
  try {
    return await worker((progress, message = "") => {
      if (message) setSearchMessage(message);
      if (typeof progress === "number") setSearchProgress(progress);
    });
  } finally {
    finishSearchOverlay();
  }
}

function recommendationTriggerButtons() {
  return [recommendBtn, rerollBtn, surpriseBtn, adaptiveSurpriseBtn, knownYesBtn, previewDislikeBtn, noveltyNotYetBtn, blockArtistBtn, skipBtn];
}

function setRecommendationRunBusy(isBusy) {
  recommendationTriggerButtons().forEach((button) => {
    if (!button) return;
    button.disabled = Boolean(isBusy);
  });
  if (trackAiRefreshBtn) {
    trackAiRefreshBtn.disabled = Boolean(isBusy) || !currentRecommendation;
  }
  if (suggestionQueueList) {
    suggestionQueueList.querySelectorAll("button[data-queue-index]").forEach((button) => {
      const index = Number(button.dataset.queueIndex || -1);
      const track = suggestionQueueTracks[index];
      const isActive = recommendationTrackKey(track) === recommendationTrackKey(currentRecommendation);
      button.disabled = Boolean(isBusy) || !track || isActive;
    });
  }
  if (!isBusy && rerollBtn && !lastPrefs) rerollBtn.disabled = true;
}

function burstConfetti(originEl, colors = ["#6effdc", "#7de0ff", "#ffc778", "#ff8de6"]) {
  if (!originEl) return;
  const rect = originEl.getBoundingClientRect();
  const originX = rect.left + rect.width / 2;
  const originY = rect.top + rect.height / 2;

  for (let i = 0; i < 16; i += 1) {
    const particle = document.createElement("span");
    particle.className = "confetti";
    particle.style.left = `${originX}px`;
    particle.style.top = `${originY}px`;
    particle.style.background = colors[i % colors.length];
    particle.style.setProperty("--dx", `${(Math.random() - 0.5) * 190}px`);
    particle.style.setProperty("--dy", `${-Math.random() * 160 - 20}px`);
    document.body.appendChild(particle);
    window.setTimeout(() => particle.remove(), 900);
  }
}

function getWeights() {
  return {
    style: Number(weightStyleEl?.value || DEFAULT_WEIGHTS.style),
    context: Number(weightContextEl?.value || DEFAULT_WEIGHTS.context),
    energy: Number(weightEnergyEl?.value || DEFAULT_WEIGHTS.energy),
    bpm: Number(weightBpmEl?.value || DEFAULT_WEIGHTS.bpm),
    vocals: Number(weightVocalsEl?.value || DEFAULT_WEIGHTS.vocals)
  };
}

function updateWeightLabels() {
  if (weightStyleValueEl && weightStyleEl) weightStyleValueEl.textContent = weightStyleEl.value;
  if (weightContextValueEl && weightContextEl) weightContextValueEl.textContent = weightContextEl.value;
  if (weightEnergyValueEl && weightEnergyEl) weightEnergyValueEl.textContent = weightEnergyEl.value;
  if (weightBpmValueEl && weightBpmEl) weightBpmValueEl.textContent = weightBpmEl.value;
  if (weightVocalsValueEl && weightVocalsEl) weightVocalsValueEl.textContent = weightVocalsEl.value;
}

function mapEntriesForStorage(mapRef, maxEntries = PROGRESS_MAP_LIMIT) {
  return [...mapRef.entries()]
    .filter(([key, value]) => key && Number.isFinite(value) && value !== 0)
    .sort((a, b) => Math.abs(b[1]) - Math.abs(a[1]))
    .slice(0, maxEntries);
}

function hydrateMapFromStorage(mapRef, entries, maxEntries = PROGRESS_MAP_LIMIT) {
  mapRef.clear();
  if (!Array.isArray(entries)) return;
  entries.slice(0, maxEntries).forEach((entry) => {
    if (!Array.isArray(entry) || entry.length < 2) return;
    const key = normalize(entry[0]);
    const value = Number(entry[1]);
    if (!key || !Number.isFinite(value) || value === 0) return;
    mapRef.set(key, value);
  });
}

function setValuesForStorage(setRef, maxEntries = PROGRESS_MAP_LIMIT) {
  return [...setRef.values()]
    .map((value) => normalize(value))
    .filter(Boolean)
    .slice(0, maxEntries);
}

function hydrateSetFromStorage(setRef, values, maxEntries = PROGRESS_MAP_LIMIT) {
  setRef.clear();
  if (!Array.isArray(values)) return;
  values.slice(0, maxEntries).forEach((value) => {
    const key = normalize(value);
    if (key) setRef.add(key);
  });
}

function registerDiscoveredArtist(artistName) {
  const key = artistMatchKey(artistName || "");
  if (!key) return;
  discoveredArtistsInApp.add(key);
  seenArtistsMemory.add(key);
}

function registerSeenArtist(artistName) {
  addArtistIdentityToSet(seenArtistsMemory, artistName);
}

function saveProgress() {
  if (!progressStorageReady) return;
  const progressKey = storageKeyForSession(PROGRESS_STORAGE_KEY);
  if (!progressKey) return;
  try {
    recalculateRatingStats();
    const payload = {
      stats: {
        likedSongs: Number(userStats.likedSongs) || 0,
        likedArtists: Number(userStats.likedArtists) || 0,
        likedDiscoveries: Number(userStats.likedDiscoveries) || 0,
        alreadyKnew: Number(userStats.alreadyKnew) || 0,
        skipped: Number(userStats.skipped) || 0,
        ratingCount: Number(userStats.ratingCount) || 0,
        ratingSum: Number(userStats.ratingSum) || 0
      },
      adaptiveModel: {
        likedStyles: mapEntriesForStorage(adaptiveModel.likedStyles),
        dislikedStyles: mapEntriesForStorage(adaptiveModel.dislikedStyles),
        likedArtists: mapEntriesForStorage(adaptiveModel.likedArtists),
        dislikedArtists: mapEntriesForStorage(adaptiveModel.dislikedArtists),
        likedEnergies: mapEntriesForStorage(adaptiveModel.likedEnergies),
        dislikedEnergies: mapEntriesForStorage(adaptiveModel.dislikedEnergies)
      },
      spiritSignals: mapEntriesForStorage(spiritSignalsByStyle),
      spiritState: {
        currentSpiritId: typeof currentSpiritId === "string" ? currentSpiritId : "",
        lastReviewedSongLikes: Math.max(0, Number(spiritLastReviewedSongLikes) || 0)
      },
      blockedArtists: setValuesForStorage(blockedArtistsMemory),
      discoveredArtistsInApp: setValuesForStorage(discoveredArtistsInApp),
      seenArtistsMemory: setValuesForStorage(seenArtistsMemory),
      knownTrackTitlesMemory: setValuesForStorage(knownTrackTitlesMemory),
      trackRatings: mapEntriesForStorage(trackRatings),
      trackRatingSignals: mapEntriesForStorage(trackRatingSignals),
      trackPreferenceSignals: mapEntriesForStorage(trackPreferenceSignals),
      trackPreviewIssueSignals: mapEntriesForStorage(trackPreviewIssueSignals),
      previewReliabilityByStyle: mapEntriesForStorage(previewReliabilityByStyle),
      quiz: {
        attemptsByStyle: mapEntriesForStorage(quizAttemptsByStyle, 120),
        bestScoreByStyle: mapEntriesForStorage(quizBestScoreByStyle, 120),
        nextOfferCountByStyle: mapEntriesForStorage(quizNextOfferCountByStyle, 120)
      }
    };
    localStorage.setItem(progressKey, JSON.stringify(payload));
  } catch (_e) {
    // ignore storage failures
  }
}

function loadProgress() {
  userStats.likedSongs = 0;
  userStats.likedArtists = 0;
  userStats.likedDiscoveries = 0;
  userStats.alreadyKnew = 0;
  userStats.skipped = 0;
  userStats.ratingCount = 0;
  userStats.ratingSum = 0;
  adaptiveModel.likedStyles.clear();
  adaptiveModel.dislikedStyles.clear();
  adaptiveModel.likedArtists.clear();
  adaptiveModel.dislikedArtists.clear();
  adaptiveModel.likedEnergies.clear();
  adaptiveModel.dislikedEnergies.clear();
  spiritSignalsByStyle = new Map();
  currentSpiritId = "";
  spiritLastReviewedSongLikes = 0;
  spiritUnlocked = false;
  blockedArtistsMemory = new Set();
  discoveredArtistsInApp = new Set();
  seenArtistsMemory = new Set();
  knownTrackTitlesMemory = new Set();
  trackRatings = new Map();
  trackRatingSignals = new Map();
  trackPreferenceSignals = new Map();
  trackPreviewIssueSignals = new Map();
  previewReliabilityByStyle = new Map();
  listeningNarrativeToken = 0;

  progressStorageReady = false;
  const progressKey = storageKeyForSession(PROGRESS_STORAGE_KEY);
  try {
    if (progressKey) {
      const raw = localStorage.getItem(progressKey);
      if (raw) {
        const parsed = JSON.parse(raw);

        if (parsed?.stats && typeof parsed.stats === "object") {
          userStats.likedSongs = Math.max(0, Number(parsed.stats.likedSongs) || 0);
          userStats.likedArtists = Math.max(0, Number(parsed.stats.likedArtists) || 0);
          userStats.likedDiscoveries = Math.max(0, Number(parsed.stats.likedDiscoveries) || 0);
          userStats.alreadyKnew = Math.max(0, Number(parsed.stats.alreadyKnew) || 0);
          userStats.skipped = Math.max(0, Number(parsed.stats.skipped) || 0);
          userStats.ratingCount = Math.max(0, Number(parsed.stats.ratingCount) || 0);
          userStats.ratingSum = Math.max(0, Number(parsed.stats.ratingSum) || 0);
        }

        const storedModel = parsed?.adaptiveModel || {};
        hydrateMapFromStorage(adaptiveModel.likedStyles, storedModel.likedStyles);
        hydrateMapFromStorage(adaptiveModel.dislikedStyles, storedModel.dislikedStyles);
        hydrateMapFromStorage(adaptiveModel.likedArtists, storedModel.likedArtists);
        hydrateMapFromStorage(adaptiveModel.dislikedArtists, storedModel.dislikedArtists);
        hydrateMapFromStorage(adaptiveModel.likedEnergies, storedModel.likedEnergies);
        hydrateMapFromStorage(adaptiveModel.dislikedEnergies, storedModel.dislikedEnergies);
        hydrateMapFromStorage(spiritSignalsByStyle, parsed?.spiritSignals);
        const storedSpiritState = parsed?.spiritState || {};
        const storedSpiritId = String(storedSpiritState.currentSpiritId || "").trim();
        currentSpiritId = spiritById(storedSpiritId) ? storedSpiritId : "";
        spiritLastReviewedSongLikes = Math.max(0, Number(storedSpiritState.lastReviewedSongLikes) || 0);
        const currentReviewCheckpoint = spiritReviewCheckpointFromSongLikes(userStats.likedSongs);
        spiritLastReviewedSongLikes = Math.min(spiritLastReviewedSongLikes, currentReviewCheckpoint);
        if (!currentSpiritId) spiritLastReviewedSongLikes = 0;
        hydrateSetFromStorage(blockedArtistsMemory, parsed?.blockedArtists);
        hydrateSetFromStorage(discoveredArtistsInApp, parsed?.discoveredArtistsInApp);
        hydrateSetFromStorage(seenArtistsMemory, parsed?.seenArtistsMemory);
        hydrateSetFromStorage(knownTrackTitlesMemory, parsed?.knownTrackTitlesMemory);
        compactArtistIdentitySet(blockedArtistsMemory);
        compactArtistIdentitySet(discoveredArtistsInApp);
        compactArtistIdentitySet(seenArtistsMemory);
        discoveredArtistsInApp.forEach((artist) => seenArtistsMemory.add(artist));
        compactArtistIdentitySet(seenArtistsMemory);
        hydrateMapFromStorage(trackRatings, parsed?.trackRatings);
        hydrateMapFromStorage(trackRatingSignals, parsed?.trackRatingSignals);
        hydrateMapFromStorage(trackPreferenceSignals, parsed?.trackPreferenceSignals);
        hydrateMapFromStorage(trackPreviewIssueSignals, parsed?.trackPreviewIssueSignals);
        hydrateMapFromStorage(previewReliabilityByStyle, parsed?.previewReliabilityByStyle);
        const quizProgress = parsed?.quiz || {};
        hydrateMapFromStorage(quizAttemptsByStyle, quizProgress.attemptsByStyle, 120);
        hydrateMapFromStorage(quizBestScoreByStyle, quizProgress.bestScoreByStyle, 120);
        hydrateMapFromStorage(quizNextOfferCountByStyle, quizProgress.nextOfferCountByStyle, 120);
      }
    }
  } catch (_e) {
    // ignore parsing failures
  } finally {
    progressStorageReady = true;
  }

  recalculateRatingStats();
  updateStats();
  renderTrackRating(currentRecommendation);
  void renderMusicalSpirit({ celebrate: false, forceAnimation: false });
}

function saveDynamicCatalogCache() {
  try {
    const dynamicTracks = catalog
      .filter((track) => isDynamicSource(track.source))
      .slice(-2400);
    localStorage.setItem(DYNAMIC_CATALOG_CACHE_KEY, JSON.stringify(dynamicTracks));
  } catch (_err) {
    // ignore storage/cache failures
  }
}

function loadDynamicCatalogCache() {
  try {
    const raw = localStorage.getItem(DYNAMIC_CATALOG_CACHE_KEY);
    if (!raw) return;
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return;

    const existingKeys = new Set(catalog.map((track) => normalize(`${track.artist}::${track.song}`)));
    parsed.forEach((track) => {
      if (!track || !track.style || !track.artist || !track.song) return;
      if (!STYLE_BPM_RULES[track.style]) return;
      if (!artistAllowedForStyle(track.style, track.artist)) return;
      if (!labelAllowedForStyle(track.style, track.label)) return;
      const trackMeta = TRACK_METADATA[`${track.song}|${track.artist}`] || {};
      const durationSec = parseDurationTextToSeconds(trackMeta.duration);
      if (
        isLikelyCompilationEntry({
          song: track.song,
          artist: track.artist,
          label: track.label,
          durationSec
        })
      ) return;
      if (isLikelyGeneratedTrackTitle(track.song)) return;
      if (isLikelyChannelStyleArtistName(track.artist)) return;
      const bpmValue = Number(track.bpmExact);
      if (Number.isFinite(bpmValue) && bpmValue > 0 && !bpmFitsStyle(track.style, bpmValue)) return;
      const key = normalize(`${track.artist}::${track.song}`);
      if (existingKeys.has(key)) return;
      existingKeys.add(key);
      catalog.push(track);
    });
    dedupeCatalogByTrackKey();
  } catch (_err) {
    // ignore broken cache
  }
}

function savePreferences() {
  const preferencesKey = storageKeyForSession(STORAGE_KEY);
  if (!preferencesKey) return;
  try {
    const payload = {
      style: styleEl?.value || "",
      context: contextEl?.value || "",
      energy: energyEl?.value || "",
      bpm: bpmEl?.value || "",
      vocals: vocalsEl?.value || "",
      discoveryMode: Boolean(discoveryModeEl?.checked),
      knownArtists: knownArtistsEl?.value || "",
      weights: getWeights()
    };
    localStorage.setItem(preferencesKey, JSON.stringify(payload));
  } catch (_e) {
    // ignore storage failures
  }
}

function loadPreferences() {
  resetPreferenceInputsToDefault();
  const preferencesKey = storageKeyForSession(STORAGE_KEY);
  try {
    if (preferencesKey) {
      const raw = localStorage.getItem(preferencesKey);
      if (raw) {
        const parsed = JSON.parse(raw);

        if (styleEl) styleEl.value = parsed.style || "";
        if (contextEl) contextEl.value = parsed.context || "";
        if (energyEl) energyEl.value = parsed.energy || "";
        if (bpmEl) bpmEl.value = parsed.bpm || "";
        if (vocalsEl) vocalsEl.value = parsed.vocals || "";
        if (discoveryModeEl) discoveryModeEl.checked = parsed.discoveryMode !== false;
        if (knownArtistsEl) knownArtistsEl.value = parsed.knownArtists || "";

        if (parsed.weights) {
          if (weightStyleEl && Number.isFinite(parsed.weights.style)) weightStyleEl.value = String(parsed.weights.style);
          if (weightContextEl && Number.isFinite(parsed.weights.context)) weightContextEl.value = String(parsed.weights.context);
          if (weightEnergyEl && Number.isFinite(parsed.weights.energy)) weightEnergyEl.value = String(parsed.weights.energy);
          if (weightBpmEl && Number.isFinite(parsed.weights.bpm)) weightBpmEl.value = String(parsed.weights.bpm);
          if (weightVocalsEl && Number.isFinite(parsed.weights.vocals)) weightVocalsEl.value = String(parsed.weights.vocals);
        }
      }
    }
  } catch (_e) {
    // ignore parsing failures
  }
}

function clearFilters() {
  if (styleEl) styleEl.value = "";
  if (contextEl) contextEl.value = "";
  if (energyEl) energyEl.value = "";
  if (bpmEl) bpmEl.value = "";
  if (vocalsEl) vocalsEl.value = "";
  if (knownArtistsEl) knownArtistsEl.value = "";
  if (quickSurpriseKnownTracksEl) quickSurpriseKnownTracksEl.value = "";
  if (discoveryModeEl) discoveryModeEl.checked = true;

  if (weightStyleEl) weightStyleEl.value = String(DEFAULT_WEIGHTS.style);
  if (weightContextEl) weightContextEl.value = String(DEFAULT_WEIGHTS.context);
  if (weightEnergyEl) weightEnergyEl.value = String(DEFAULT_WEIGHTS.energy);
  if (weightBpmEl) weightBpmEl.value = String(DEFAULT_WEIGHTS.bpm);
  if (weightVocalsEl) weightVocalsEl.value = String(DEFAULT_WEIGHTS.vocals);

  knownArtistsMemory = new Set();
  knownTrackTitlesMemory = new Set();
  rejectedArtists = new Set();
  recommendationMemory = new Set();
  recommendationMemoryQueue = [];
  recentTrackHistoryByStyle = new Map();
  servedTrackCycleByStyle = new Map();
  servedArtistCycleByStyle = new Map();
  recommendationStyleFallbackInfo = null;
  suggestionQueueTracks = [];
  suggestionQueueContextKey = "";
  trackInsightCache = new Map();
  currentTrackInsightTrackKey = "";
  trackPreviewIssueSignals = new Map();
  previewReliabilityByStyle = new Map();
  listeningNarrativeToken = 0;
  styleInfoDismissed = false;
  if (styleInfoBubble) styleInfoBubble.classList.add("hidden");
  renderSuggestionQueue(null);
  renderTrackInsightPanel(null);
  updateWeightLabels();
  savePreferences();
}

function resetAppAsNewUser() {
  if (!window.confirm(t("resetAppConfirm"))) return;
  try {
    const keys = [];
    for (let i = 0; i < localStorage.length; i += 1) {
      const key = localStorage.key(i);
      if (key) keys.push(key);
    }
    keys
      .filter((key) => key.startsWith("neonpulse:"))
      .forEach((key) => localStorage.removeItem(key));
  } catch (_err) {
    // ignore storage failures
  }
  try {
    sessionStorage.clear();
  } catch (_err) {
    // ignore session failures
  }
  window.location.reload();
}

function pickRandomTrack(pool = []) {
  if (!Array.isArray(pool) || pool.length === 0) return null;
  return pool[Math.floor(Math.random() * pool.length)];
}

function hasReliableBpmForTrack(track) {
  const exactBpm = resolveExactBpm(track);
  if (!Number.isFinite(exactBpm) || exactBpm <= 0) return false;
  return bpmFitsStyle(track?.style, exactBpm);
}

function surpriseTrackHasExactBpmAndPreview(track) {
  if (!track) return false;
  if (track.existenceVerified === false) return false;
  if (!hasReliableBpmForTrack(track)) return false;
  return Boolean(track.previewUrl);
}

function stylePreferenceSignal(style = "") {
  const styleKey = normalize(style || "");
  if (!styleKey) return 0;
  const likeScore = Number(adaptiveModel.likedStyles.get(styleKey) || 0);
  const dislikeScore = Number(adaptiveModel.dislikedStyles.get(styleKey) || 0);
  const previewSignal = Number(previewReliabilityByStyle.get(styleKey) || 0);
  return likeScore * 1.22 - dislikeScore * 1.35 + previewSignal * 0.12;
}

function styleStronglyDisliked(style = "") {
  const styleKey = normalize(style || "");
  if (!styleKey) return false;
  const likeScore = Number(adaptiveModel.likedStyles.get(styleKey) || 0);
  const dislikeScore = Number(adaptiveModel.dislikedStyles.get(styleKey) || 0);
  return dislikeScore >= 1.6 && dislikeScore >= likeScore + 1.1;
}

function rankAdaptiveSurpriseStyles(baseTrack = currentRecommendation) {
  const baseStyle = normalize(baseTrack?.style || styleEl?.value || lastPrefs?.style || "");
  const baseFamily = familyOf(baseStyle);
  const excludedArtists = buildGlobalArtistExclusionSet(baseTrack?.artist || "");
  const knownTrackSignals = buildGlobalTrackExclusionSet(
    baseTrack ? [recommendationTrackKey(baseTrack)] : [],
    baseTrack?.song ? [baseTrack.song] : []
  );

  return getAllSelectableStyles()
    .filter((style) => style && normalize(style) !== baseStyle)
    .map((style) => {
      const surpriseScope = {
        style,
        context: "",
        energy: "",
        bpm: "",
        vocals: ""
      };
      const freshUnknown = unseenTrackCandidatesForStyle(
        style,
        surpriseScope,
        excludedArtists,
        knownTrackSignals.keys,
        knownTrackSignals.titles
      );
      const availablePool = freshUnknown.length
        ? freshUnknown
        : catalog.filter((track) => {
            if (!track || track.style !== style) return false;
            if (!isTrackEligibleForRecommendation(track)) return false;
            if (artistSetHasMatch(excludedArtists, track.artist)) return false;
            return !trackBlockedByKnownSignals(track, knownTrackSignals.keys, knownTrackSignals.titles);
          });
      if (!availablePool.length) return null;

      const uniqueArtists = new Set(
        availablePool.map((track) => artistMatchKey(track.artist)).filter(Boolean)
      ).size;
      const adaptiveSignal = stylePreferenceSignal(style);
      const crossFamily = !baseFamily || familyOf(style) !== baseFamily;
      const likeScore = Number(adaptiveModel.likedStyles.get(normalize(style)) || 0);
      const dislikeScore = Number(adaptiveModel.dislikedStyles.get(normalize(style)) || 0);
      const dislikePenalty = Math.max(0, dislikeScore - likeScore - 0.2);

      const score =
        adaptiveSignal * 3.6 +
        Math.min(availablePool.length, 22) * 0.26 +
        Math.min(uniqueArtists, 16) * 0.32 +
        (crossFamily ? 2.8 : 0.55) -
        dislikePenalty * 2.4;

      return {
        style,
        score,
        crossFamily,
        stronglyDisliked: styleStronglyDisliked(style),
        availableTracks: availablePool.length,
        uniqueArtists
      };
    })
    .filter(Boolean)
    .sort(
      (a, b) =>
        b.score - a.score ||
        Number(b.crossFamily) - Number(a.crossFamily) ||
        b.uniqueArtists - a.uniqueArtists ||
        b.availableTracks - a.availableTracks
    );
}

function pickAdaptiveSurpriseStyle(baseTrack = currentRecommendation) {
  const ranked = rankAdaptiveSurpriseStyles(baseTrack);
  if (!ranked.length) return "";

  const crossFamilyPreferred = ranked.filter((entry) => entry.crossFamily && !entry.stronglyDisliked);
  if (crossFamilyPreferred.length) return crossFamilyPreferred[0].style;

  const nonBlocked = ranked.filter((entry) => !entry.stronglyDisliked);
  if (nonBlocked.length) return nonBlocked[0].style;

  return ranked[0].style;
}

function pickSurpriseTrackFromAnotherGenre(
  baseTrack = currentRecommendation,
  {
    triedTrackKeys = new Set(),
    requireCrossGenre = true,
    preferUnknownArtists = true,
    requireDifferentStyle = true,
    blockedTrackKeys = new Set(),
    blockedTrackTitles = new Set()
  } = {}
) {
  const baseTrackKey = recommendationTrackKey(baseTrack);
  const baseArtistKey = artistMatchKey(baseTrack?.artist || "");
  const baseStyleKey = normalize(baseTrack?.style || "");
  const baseFamily = familyOf(baseTrack?.style || "");
  const styleIsDifferent = (track) =>
    !requireDifferentStyle || !baseStyleKey || normalize(track?.style || "") !== baseStyleKey;

  const trackAllowed = (track) => !trackBlockedByKnownSignals(track, blockedTrackKeys, blockedTrackTitles);
  const eligible = catalog.filter(
    (track) => isTrackEligibleForRecommendation(track) && styleIsDifferent(track) && trackAllowed(track)
  );
  const emergencyPool = catalog.filter(
    (track) => track?.style && track?.artist && track?.song && styleIsDifferent(track) && trackAllowed(track)
  );
  if (!eligible.length) return pickRandomTrack(emergencyPool);

  const blockedArtists = buildGlobalArtistExclusionSet(baseTrack?.artist || "");

  // Regra principal: com faixa atual tocando, surpresa deve sair para outro gênero/família.
  const crossGenrePool =
    requireCrossGenre && baseFamily
      ? eligible.filter((track) => familyOf(track.style) !== baseFamily)
      : eligible;
  const scopedPool = crossGenrePool.length ? crossGenrePool : eligible;

  const notTried = (track) => !triedTrackKeys.has(recommendationTrackKey(track));
  const notCurrentTrack = (track) => recommendationTrackKey(track) !== baseTrackKey;
  const notCurrentArtist = (track) => artistMatchKey(track.artist) !== baseArtistKey;
  const unknownArtist = (track) => !preferUnknownArtists || !artistSetHasMatch(blockedArtists, track.artist);
  const differentStyle = (track) => styleIsDifferent(track);
  const verifiedTrack = (track) => track.existenceVerified !== false;
  const withPreview = (track) => Boolean(track.previewUrl);
  const withReliableBpm = (track) => hasReliableBpmForTrack(track);

  const rankedPools = [
    scopedPool.filter((track) => notTried(track) && notCurrentTrack(track) && notCurrentArtist(track) && differentStyle(track) && unknownArtist(track) && verifiedTrack(track) && withReliableBpm(track) && withPreview(track)),
    scopedPool.filter((track) => notTried(track) && notCurrentTrack(track) && notCurrentArtist(track) && differentStyle(track) && verifiedTrack(track) && withReliableBpm(track) && withPreview(track)),
    scopedPool.filter((track) => notTried(track) && notCurrentTrack(track) && notCurrentArtist(track) && differentStyle(track) && unknownArtist(track) && verifiedTrack(track) && withReliableBpm(track)),
    scopedPool.filter((track) => notTried(track) && notCurrentTrack(track) && notCurrentArtist(track) && differentStyle(track) && verifiedTrack(track) && withReliableBpm(track)),
    scopedPool.filter((track) => notTried(track) && notCurrentTrack(track) && notCurrentArtist(track) && differentStyle(track) && unknownArtist(track) && verifiedTrack(track) && withPreview(track)),
    scopedPool.filter((track) => notTried(track) && notCurrentTrack(track) && notCurrentArtist(track) && differentStyle(track) && unknownArtist(track) && verifiedTrack(track)),
    scopedPool.filter((track) => notTried(track) && notCurrentTrack(track) && notCurrentArtist(track) && differentStyle(track) && verifiedTrack(track)),
    scopedPool.filter((track) => notTried(track) && notCurrentTrack(track) && notCurrentArtist(track) && differentStyle(track)),
    scopedPool.filter((track) => notTried(track) && notCurrentTrack(track) && differentStyle(track)),
    scopedPool.filter((track) => notTried(track)),
    scopedPool
  ];

  for (const pool of rankedPools) {
    const chosen = pickRandomTrack(pool);
    if (chosen) return chosen;
  }

  return pickRandomTrack(eligible) || pickRandomTrack(emergencyPool);
}

async function pickValidatedSurpriseTrack(baseTrack = currentRecommendation, reportProgress = null) {
  const update = (percent, message = "") => {
    if (typeof reportProgress !== "function") return;
    reportProgress(percent, message);
  };
  const trackKeyOf = (track) => recommendationTrackKey(track);
  const triedTrackKeys = new Set();
  const baseStyleKey = normalize(baseTrack?.style || "");
  const baseTrackKey = trackKeyOf(baseTrack);
  const baseFamily = familyOf(baseTrack?.style || "");
  const knownTrackSignals = buildGlobalTrackExclusionSet();
  const trackAllowed = (track) => !trackBlockedByKnownSignals(track, knownTrackSignals.keys, knownTrackSignals.titles);
  let exactBpmFallbackTrack = null;

  const validateCandidate = async (track) => {
    if (!track) return null;
    const key = trackKeyOf(track);
    if (!key || triedTrackKeys.has(key)) return null;
    if (baseTrackKey && key === baseTrackKey) return null;
    if (baseStyleKey && normalize(track.style || "") === baseStyleKey) return null;
    if (!trackAllowed(track)) return null;
    triedTrackKeys.add(key);
    await resolvePreviewForTrack(track);
    if (surpriseTrackHasExactBpmAndPreview(track)) return track;
    if (!exactBpmFallbackTrack && track.existenceVerified !== false && hasReliableBpmForTrack(track)) {
      exactBpmFallbackTrack = track;
    }
    return null;
  };

  update(24, t("searchOverlayGenerating"));
  const fastAttempts = Math.min(56, Math.max(18, Math.floor(catalog.length * 0.22)));
  for (let attempt = 0; attempt < fastAttempts; attempt += 1) {
    const candidate = pickSurpriseTrackFromAnotherGenre(baseTrack, {
      triedTrackKeys,
      requireCrossGenre: true,
      preferUnknownArtists: true,
      requireDifferentStyle: true,
      blockedTrackKeys: knownTrackSignals.keys,
      blockedTrackTitles: knownTrackSignals.titles
    });
    const validated = await validateCandidate(candidate);
    if (validated) return validated;
    if (attempt % 8 === 0) {
      update(Math.min(58, 28 + attempt), t("searchOverlayCatalog"));
    }
  }

  const selectableStyles = getAllSelectableStyles().filter(
    (style) => style && normalize(style) !== baseStyleKey
  );
  const crossGenreStyles = selectableStyles.filter(
    (style) => !baseFamily || familyOf(style) !== baseFamily
  );
  const hydrationStyles = [
    ...crossGenreStyles,
    ...selectableStyles.filter((style) => !crossGenreStyles.includes(style))
  ].slice(0, 6);
  for (let index = 0; index < hydrationStyles.length; index += 1) {
    const style = hydrationStyles[index];
    update(60 + index * 6, t("searchOverlayCatalog"));
    await ensureStyleCoverageWithTimeout(style, 2);
    const candidate = pickSurpriseTrackFromAnotherGenre(baseTrack, {
      triedTrackKeys,
      requireCrossGenre: true,
      preferUnknownArtists: false,
      requireDifferentStyle: true,
      blockedTrackKeys: knownTrackSignals.keys,
      blockedTrackTitles: knownTrackSignals.titles
    });
    const validated = await validateCandidate(candidate);
    if (validated) return validated;
  }

  update(86, t("searchOverlayFinishing"));
  const strictCrossGenrePool = catalog.filter((track) => {
    if (!isTrackEligibleForRecommendation(track)) return false;
    if (trackKeyOf(track) === trackKeyOf(baseTrack)) return false;
    if (baseStyleKey && normalize(track.style || "") === baseStyleKey) return false;
    if (baseFamily && familyOf(track.style) === baseFamily) return false;
    if (!trackAllowed(track)) return false;
    return surpriseTrackHasExactBpmAndPreview(track);
  });
  if (strictCrossGenrePool.length) return pickRandomTrack(strictCrossGenrePool);

  const strictDifferentStylePool = catalog.filter((track) => {
    if (!isTrackEligibleForRecommendation(track)) return false;
    if (trackKeyOf(track) === trackKeyOf(baseTrack)) return false;
    if (baseStyleKey && normalize(track.style || "") === baseStyleKey) return false;
    if (!trackAllowed(track)) return false;
    return surpriseTrackHasExactBpmAndPreview(track);
  });
  if (strictDifferentStylePool.length) return pickRandomTrack(strictDifferentStylePool);

  if (exactBpmFallbackTrack) {
    await resolvePreviewForTrack(exactBpmFallbackTrack);
    if (surpriseTrackHasExactBpmAndPreview(exactBpmFallbackTrack)) return exactBpmFallbackTrack;
  }

  return null;
}

async function resolveEmergencySurpriseTrack(baseTrack = currentRecommendation, reportProgress = null) {
  const update = (percent, message = "") => {
    if (typeof reportProgress !== "function") return;
    reportProgress(percent, message);
  };
  const baseTrackKey = recommendationTrackKey(baseTrack);
  const baseArtistKey = artistMatchKey(baseTrack?.artist || "");
  const baseStyleKey = normalize(baseTrack?.style || "");
  const baseFamily = familyOf(baseTrack?.style || "");
  const blockedArtists = buildGlobalArtistExclusionSet(baseTrack?.artist || "");
  const knownTrackSignals = buildGlobalTrackExclusionSet();
  const trackAllowed = (track) => !trackBlockedByKnownSignals(track, knownTrackSignals.keys, knownTrackSignals.titles);
  const triedTrackKeys = new Set();

  const differentStyle = (track) =>
    !baseStyleKey || normalize(track?.style || "") !== baseStyleKey;

  const validatePool = async (pool = [], maxAttempts = 72) => {
    if (!Array.isArray(pool) || !pool.length) return null;
    const candidates = pool.slice();
    let attempts = 0;
    while (candidates.length && attempts < maxAttempts) {
      const idx = Math.floor(Math.random() * candidates.length);
      const candidate = candidates.splice(idx, 1)[0];
      const key = recommendationTrackKey(candidate);
      attempts += 1;
      if (!key || triedTrackKeys.has(key)) continue;
      if (baseTrackKey && key === baseTrackKey) continue;
      if (!differentStyle(candidate)) continue;
      if (baseArtistKey && artistMatchKey(candidate.artist) === baseArtistKey) continue;
      if (artistSetHasMatch(blockedArtists, candidate.artist)) continue;
      if (!trackAllowed(candidate)) continue;
      triedTrackKeys.add(key);
      await resolvePreviewForTrack(candidate);
      if (surpriseTrackHasExactBpmAndPreview(candidate)) return candidate;
    }
    return null;
  };

  update(90, t("searchOverlayCatalog"));
  const strictCrossFamilyPool = catalog.filter((track) => {
    if (!isTrackEligibleForRecommendation(track)) return false;
    if (!differentStyle(track)) return false;
    if (baseFamily && familyOf(track.style) === baseFamily) return false;
    if (artistSetHasMatch(blockedArtists, track.artist)) return false;
    if (!trackAllowed(track)) return false;
    return true;
  });
  let candidate = await validatePool(strictCrossFamilyPool);
  if (candidate) return candidate;

  update(93, t("searchOverlayCatalog"));
  const strictDifferentStylePool = catalog.filter((track) => {
    if (!isTrackEligibleForRecommendation(track)) return false;
    if (!differentStyle(track)) return false;
    if (artistSetHasMatch(blockedArtists, track.artist)) return false;
    if (!trackAllowed(track)) return false;
    return true;
  });
  candidate = await validatePool(strictDifferentStylePool);
  if (candidate) return candidate;

  const selectableStyles = getAllSelectableStyles().filter(
    (style) => style && normalize(style) !== baseStyleKey
  );
  const hydrationStyles = selectableStyles
    .slice()
    .sort((a, b) => {
      const aCross = baseFamily && familyOf(a) !== baseFamily ? 0 : 1;
      const bCross = baseFamily && familyOf(b) !== baseFamily ? 0 : 1;
      return aCross - bCross;
    })
    .slice(0, 10);

  for (let index = 0; index < hydrationStyles.length; index += 1) {
    const style = hydrationStyles[index];
    update(Math.min(97, 94 + index), t("searchOverlayCatalog"));
    await ensureStyleCoverageWithTimeout(style, 2);
    sanitizeCatalogByStyleRules();
    purgeDynamicMismatches(style);
    const stylePool = catalog.filter(
      (track) =>
        track.style === style &&
        isTrackEligibleForRecommendation(track) &&
        differentStyle(track) &&
        !artistSetHasMatch(blockedArtists, track.artist) &&
        trackAllowed(track)
    );
    candidate = await validatePool(stylePool, 54);
    if (candidate) return candidate;
  }

  const lastChancePool = catalog.filter((track) => {
    if (!isTrackEligibleForRecommendation(track)) return false;
    if (!differentStyle(track)) return false;
    if (baseTrackKey && recommendationTrackKey(track) === baseTrackKey) return false;
    if (!trackAllowed(track)) return false;
    return surpriseTrackHasExactBpmAndPreview(track);
  });
  if (lastChancePool.length) return pickRandomTrack(lastChancePool);

  return null;
}

function parseKnownArtists(value) {
  const known = new Set();
  String(value || "")
    .split(",")
    .map((name) => String(name || "").trim())
    .filter(Boolean)
    .forEach((name) => addArtistIdentityToSet(known, name));
  return known;
}

function parseKnownTrackTitles(value) {
  const titles = new Set();
  String(value || "")
    .split(/[\n,;]+/)
    .map((entry) => String(entry || "").trim())
    .filter(Boolean)
    .forEach((entry) => {
      const direct = normalizeTitle(entry);
      if (direct.length >= 2) titles.add(direct);
      const splitParts = entry
        .split(/\s(?:-|–|—|\|)\s/g)
        .map((part) => normalizeTitle(part))
        .filter((part) => part.length >= 2);
      if (splitParts.length > 1) {
        const likelyTrackName = splitParts[splitParts.length - 1];
        if (likelyTrackName) titles.add(likelyTrackName);
      }
    });
  return titles;
}

function trackMatchesKnownTitle(track, knownTrackTitles = new Set()) {
  if (!track || !knownTrackTitles || !knownTrackTitles.size) return false;
  const title = normalizeTitle(track.song || "");
  if (!title) return false;
  if (knownTrackTitles.has(title)) return true;
  for (const knownTitle of knownTrackTitles) {
    if (!knownTitle) continue;
    if (strictTitleMatch(title, knownTitle) || strictTitleMatch(knownTitle, title)) return true;
  }
  return false;
}

function collectTrackKeysByKnownTitles(knownTrackTitles = new Set()) {
  const keys = new Set();
  if (!knownTrackTitles || !knownTrackTitles.size) return keys;
  catalog.forEach((track) => {
    if (!trackMatchesKnownTitle(track, knownTrackTitles)) return;
    const trackKey = recommendationTrackKey(track);
    if (trackKey) keys.add(trackKey);
  });
  return keys;
}

function buildGlobalTrackExclusionSet(extraTrackKeys = [], extraTrackTitles = []) {
  const typedKnownTrackTitles = parseKnownTrackTitles(quickSurpriseKnownTracksEl ? quickSurpriseKnownTracksEl.value : "");
  const knownTitles = new Set([...knownTrackTitlesMemory, ...typedKnownTrackTitles]);
  (Array.isArray(extraTrackTitles) ? extraTrackTitles : [extraTrackTitles]).forEach((trackTitleLike) => {
    parseKnownTrackTitles(String(trackTitleLike || "")).forEach((trackTitle) => knownTitles.add(trackTitle));
  });
  const keySet = collectTrackKeysByKnownTitles(knownTitles);
  (Array.isArray(extraTrackKeys) ? extraTrackKeys : [extraTrackKeys])
    .map((trackKey) => normalize(trackKey || ""))
    .filter(Boolean)
    .forEach((trackKey) => keySet.add(trackKey));
  return { titles: knownTitles, keys: keySet };
}

function trackBlockedByKnownSignals(track, excludedTrackKeys = new Set(), excludedTrackTitles = new Set()) {
  if (!track) return true;
  const trackKey = recommendationTrackKey(track);
  if (trackKey && excludedTrackKeys.has(trackKey)) return true;
  return trackMatchesKnownTitle(track, excludedTrackTitles);
}

function buildGlobalArtistExclusionSet(extraArtists = []) {
  const typedKnown = parseKnownArtists(knownArtistsEl ? knownArtistsEl.value : "");
  const union = new Set();
  const addAll = (collection) => {
    (collection || []).forEach((artistLike) => addArtistKeysToSet(union, artistLike));
  };
  addAll(typedKnown);
  addAll(knownArtistsMemory);
  addAll(blockedArtistsMemory);
  addAll(rejectedArtists);
  addAll(collectSuppressedArtistsFromAdaptiveModel());
  addAll(discoveredArtistsInApp);
  addAll(seenArtistsMemory);
  addAll(Array.isArray(extraArtists) ? extraArtists : [extraArtists]);
  return union;
}

function recommendationStyleFallbackMessage() {
  if (!recommendationStyleFallbackInfo?.from || !recommendationStyleFallbackInfo?.to) return "";
  return t("styleExhaustedFallback", {
    from: styleLabelByValue(recommendationStyleFallbackInfo.from),
    to: styleLabelByValue(recommendationStyleFallbackInfo.to)
  });
}

function applyStyleFallbackMessage({ setFeedback = true } = {}) {
  const message = recommendationStyleFallbackMessage();
  if (!message) return "";
  if (setFeedback && feedbackMessage) feedbackMessage.textContent = message;
  showToast(message);
  return message;
}

function unseenTrackCandidatesForStyle(
  style,
  prefs = {},
  blockedArtists = new Set(),
  blockedTrackKeys = new Set(),
  blockedTrackTitles = new Set()
) {
  if (!style) return [];
  return catalog.filter((track) => {
    if (!track || track.style !== style) return false;
    if (!isTrackEligibleForRecommendation(track)) return false;
    if (prefs.bpm && !trackMatchesBpmPreference(track, prefs.bpm)) return false;
    const artistKey = artistMatchKey(track.artist);
    if (!artistKey || artistSetHasMatch(blockedArtists, track.artist)) return false;
    const trackKey = recommendationTrackKey(track);
    if (!trackKey || blockedTrackKeys.has(trackKey)) return false;
    if (trackMatchesKnownTitle(track, blockedTrackTitles)) return false;
    return true;
  });
}

function pickFallbackStyleForFreshRecommendation(
  prefs = {},
  blockedArtists = new Set(),
  blockedTrackKeys = new Set(),
  blockedTrackTitles = new Set()
) {
  if (!prefs.style) return "";
  const currentStyle = prefs.style;
  if (NO_CROSS_STYLE_FALLBACK_STYLES.has(currentStyle)) return "";
  const currentFamily = familyOf(currentStyle);
  const selectedBpm = parseBpmRangeValue(prefs.bpm || "");

  const ranked = getAllSelectableStyles()
    .filter((style) => style && style !== currentStyle)
    .map((style) => {
      const candidates = unseenTrackCandidatesForStyle(style, prefs, blockedArtists, blockedTrackKeys, blockedTrackTitles);
      if (!candidates.length) return null;
      const uniqueArtists = new Set(candidates.map((track) => artistMatchKey(track.artist)).filter(Boolean));
      if (!uniqueArtists.size) return null;

      let score = uniqueArtists.size * 6 + Math.min(candidates.length, 24);
      if (familyOf(style) === currentFamily) score += 32;
      if (selectedBpm && STYLE_BPM_RULES[style]) {
        const styleRule = STYLE_BPM_RULES[style];
        const styleRange = { min: styleRule.min, max: styleRule.max };
        score += bpmRangesOverlap(selectedBpm, styleRange) ? 14 : -18;
      }
      if (prefs.energy) {
        const energyMatches = candidates.filter((track) => track.energy === prefs.energy).length;
        score += energyMatches > 0 ? Math.min(energyMatches, 8) * 0.9 : -2.2;
      }

      const coverage = styleCoverageStats(style);
      score += Math.min(coverage.artists, 20) * 0.35;
      return {
        style,
        score,
        tracks: candidates.length,
        artists: uniqueArtists.size
      };
    })
    .filter(Boolean)
    .sort((a, b) => b.score - a.score || b.artists - a.artists || b.tracks - a.tracks);

  return ranked[0]?.style || "";
}

function parseReleaseDateSafe(value) {
  if (!value) return null;
  const parsed = new Date(String(value));
  if (Number.isNaN(parsed.getTime())) return null;
  return parsed;
}

function isWithinLastYear(releaseDate) {
  const parsed = parseReleaseDateSafe(releaseDate);
  if (!parsed) return false;
  const now = new Date();
  const cutoff = new Date(now);
  cutoff.setFullYear(cutoff.getFullYear() - NEW_ARTIST_LOOKBACK_YEARS);
  return parsed.getTime() >= cutoff.getTime() && parsed.getTime() <= now.getTime();
}

function formatReleaseDateForLanguage(releaseDate) {
  const parsed = parseReleaseDateSafe(releaseDate);
  if (!parsed) return String(releaseDate || "N/A");
  const locale = currentLanguage === "pt" ? "pt-BR" : currentLanguage === "es" ? "es-ES" : "en-US";
  return parsed.toLocaleDateString(locale, { year: "numeric", month: "2-digit", day: "2-digit" });
}

function recentArtistSourcePriority(source = "") {
  const normalizedSource = normalize(source || "");
  if (!normalizedSource) return 0;
  if (normalizedSource.includes("curated_recent_signal")) return 6;
  if (normalizedSource.includes("dataset")) return 5;
  if (normalizedSource.includes("local_seed")) return 4;
  if (normalizedSource.includes("catalog")) return 3;
  if (normalizedSource.includes("itunes")) return 2;
  return 1;
}

function buildNewArtistCandidate({ artist = "", releaseDate = "", style = "", source = "", genreHint = "" } = {}) {
  const safeArtist = String(artist || "").trim();
  if (!safeArtist) return null;
  const safeStyle = String(style || "").trim();
  const genre = String(genreHint || localizedArtistGenreHint(safeArtist, safeStyle) || styleLabelByValue(safeStyle) || "").trim();
  return {
    artist: safeArtist,
    releaseDate: String(releaseDate || "").trim(),
    style: safeStyle,
    source: String(source || "").trim(),
    genreHint: genre,
    spotifyUrl: `https://open.spotify.com/search/${encodeURIComponent(safeArtist)}`,
    youtubeUrl: `https://www.youtube.com/results?search_query=${encodeURIComponent(`${safeArtist} ${styleLabelByValue(safeStyle)}`)}`
  };
}

function mergeNewArtistCandidate(targetMap, candidate) {
  if (!targetMap || !candidate?.artist) return;
  const key = artistMatchKey(candidate.artist);
  if (!key) return;
  const existing = targetMap.get(key);
  if (!existing) {
    targetMap.set(key, candidate);
    return;
  }

  const existingDate = parseReleaseDateSafe(existing.releaseDate);
  const candidateDate = parseReleaseDateSafe(candidate.releaseDate);
  const existingPriority = recentArtistSourcePriority(existing.source);
  const candidatePriority = recentArtistSourcePriority(candidate.source);
  const sameDate = existingDate && candidateDate && existingDate.getTime() === candidateDate.getTime();

  const shouldReplace =
    (candidateDate && (!existingDate || candidateDate > existingDate)) ||
    (!existingDate && candidateDate) ||
    (sameDate && candidatePriority > existingPriority) ||
    (!existing.genreHint && Boolean(candidate.genreHint));

  if (shouldReplace) targetMap.set(key, candidate);
}

function collectNewArtistsFromCatalog(style, knownSet) {
  const byArtist = new Map();
  const styleTracks = catalog.filter((track) => track.style === style);

  styleTracks.forEach((track) => {
    const artist = String(track.artist || "").trim();
    if (!artist) return;
    if (!artistAllowedForStyle(style, artist)) return;
    if (artistSetHasMatch(knownSet, artist)) return;
    const meta = TRACK_METADATA[`${track.song}|${track.artist}`] || {};
    const releaseDate = meta.releaseDate || "";
    if (!isWithinLastYear(releaseDate)) return;
    registerRecentArtistSignal(style, artist, releaseDate, "catalog");
    const candidate = buildNewArtistCandidate({
      artist,
      releaseDate,
      style,
      source: "catalog",
      genreHint: String(track.artistGenre || "").trim()
    });
    if (!candidate) return;
    mergeNewArtistCandidate(byArtist, candidate);
  });

  return Array.from(byArtist.values());
}

async function collectNewArtistsFromItunes(style, knownSet) {
  const rows = await fetchItunesTracksByStyle(style);
  const byArtist = new Map();

  rows.forEach((row) => {
    const artist = String(row.artistName || "").trim();
    if (!artist) return;
    if (!artistAllowedForStyle(style, artist)) return;
    if (artistSetHasMatch(knownSet, artist)) return;
    const releaseDate = row.releaseDate ? String(row.releaseDate).slice(0, 10) : "";
    if (!isWithinLastYear(releaseDate)) return;
    registerRecentArtistSignal(style, artist, releaseDate, "itunes");

    const candidate = buildNewArtistCandidate({
      artist,
      releaseDate,
      style,
      source: "itunes",
      genreHint: String(row.primaryGenreName || "").trim()
    });
    if (!candidate) return;
    mergeNewArtistCandidate(byArtist, candidate);
  });

  return Array.from(byArtist.values());
}

function collectNewArtistsFromSignals(style, knownSet) {
  const byArtist = new Map();
  recentArtistSignals.forEach((entry) => {
    if (!entry || entry.style !== style) return;
    const artist = String(entry.artist || "").trim();
    if (!artist) return;
    if (artistSetHasMatch(knownSet, artist)) return;
    if (!artistAllowedForStyle(style, artist)) return;
    if (!isWithinLastYear(entry.releaseDate)) return;
    const candidate = buildNewArtistCandidate({
      artist,
      releaseDate: entry.releaseDate,
      style,
      source: entry.source || "signal",
      genreHint: localizedArtistGenreHint(artist, style)
    });
    if (!candidate) return;
    mergeNewArtistCandidate(byArtist, candidate);
  });

  return Array.from(byArtist.values());
}

function collectRelatedFamilyNewArtistsFromSignals(style, knownSet, existingArtistKeys = new Set()) {
  const byArtist = new Map();
  const selectedFamily = familyOf(style);
  if (!selectedFamily) return [];

  recentArtistSignals.forEach((entry) => {
    if (!entry || !entry.style || entry.style === style) return;
    if (familyOf(entry.style) !== selectedFamily) return;
    const artist = String(entry.artist || "").trim();
    if (!artist) return;
    if (artistSetHasMatch(knownSet, artist)) return;
    if (!isWithinLastYear(entry.releaseDate)) return;
    const artistKey = artistMatchKey(artist);
    if (!artistKey || existingArtistKeys.has(artistKey)) return;
    if (!(artistAllowedForStyle(style, artist) || artistAllowedForStyle(entry.style, artist))) return;

    const candidate = buildNewArtistCandidate({
      artist,
      releaseDate: entry.releaseDate,
      style: entry.style,
      source: entry.source || "signal_related",
      genreHint: localizedArtistGenreHint(artist, entry.style)
    });
    if (!candidate) return;
    mergeNewArtistCandidate(byArtist, candidate);
  });

  return Array.from(byArtist.values());
}

function renderNewArtistsResults(style, artists) {
  if (!newArtistsPanel || !newArtistsStatus || !newArtistsList) return;
  newArtistsPanel.classList.remove("hidden");
  newArtistsList.innerHTML = "";

  if (!artists.length) {
    newArtistsStatus.textContent = t("newArtistsNone");
    return;
  }

  newArtistsStatus.textContent = t("newArtistsFound", {
    count: artists.length,
    style: styleLabelByValue(style)
  });

  artists.slice(0, 10).forEach((item) => {
    const li = document.createElement("li");
    const releaseText = `${t("newArtistsReleaseLabel")}: ${formatReleaseDateForLanguage(item.releaseDate)}`;
    const genreText = `${t("newArtistsGenreLabel")}: ${item.genreHint || styleLabelByValue(item.style || style)}`;
    const strong = document.createElement("strong");
    strong.textContent = item.artist;
    const spotifyAnchor = document.createElement("a");
    spotifyAnchor.href = item.spotifyUrl;
    spotifyAnchor.target = "_blank";
    spotifyAnchor.rel = "noopener noreferrer";
    spotifyAnchor.textContent = "Spotify";
    const youtubeAnchor = document.createElement("a");
    youtubeAnchor.href = item.youtubeUrl;
    youtubeAnchor.target = "_blank";
    youtubeAnchor.rel = "noopener noreferrer";
    youtubeAnchor.textContent = "YouTube";
    const soundcloudAnchor = document.createElement("a");
    soundcloudAnchor.href = `https://soundcloud.com/search?q=${encodeURIComponent(item.artist)}`;
    soundcloudAnchor.target = "_blank";
    soundcloudAnchor.rel = "noopener noreferrer";
    soundcloudAnchor.textContent = "SoundCloud";
    li.appendChild(strong);
    li.append(` • ${releaseText} • ${genreText} • `);
    li.appendChild(spotifyAnchor);
    li.append(" • ");
    li.appendChild(youtubeAnchor);
    li.append(" • ");
    li.appendChild(soundcloudAnchor);
    newArtistsList.appendChild(li);
  });
}

async function searchNewArtistsByStyle() {
  if (!styleEl?.value) {
    if (newArtistsPanel) newArtistsPanel.classList.remove("hidden");
    if (newArtistsList) newArtistsList.innerHTML = "";
    if (newArtistsStatus) newArtistsStatus.textContent = t("newArtistsSelectStyle");
    if (feedbackMessage) feedbackMessage.textContent = t("newArtistsSelectStyle");
    return;
  }

  const style = styleEl.value;
  const knownSet = buildGlobalArtistExclusionSet();
  if (newArtistsPanel) newArtistsPanel.classList.remove("hidden");
  if (newArtistsList) newArtistsList.innerHTML = "";
  if (feedbackMessage) feedbackMessage.textContent = t("newArtistsSearching");

  const artists = await withSearchOverlay(t("newArtistsSearching"), async (update) => {
    update(15, t("searchOverlayCatalog"));
    const coverage = await ensureStyleCoverageWithTimeout(style, COVERAGE_MAX_PASSES);
    if (!coverage.ok) {
      const fallbackAllowed = canFallbackToPartialCoverage(coverage);
      if (newArtistsStatus) {
        newArtistsStatus.textContent = fallbackAllowed
          ? t("catalogFallbackSearching", { style: styleLabelByValue(style) })
          : t("catalogInsufficient", {
              style: styleLabelByValue(style),
              tracks: coverage.stats?.tracks || 0,
              targetTracks: coverage.target?.tracks || MIN_TRACKS_PER_STYLE,
              artists: coverage.stats?.artists || 0,
              targetArtists: coverage.target?.artists || MIN_ARTISTS_PER_STYLE,
              labels: coverage.stats?.labels || 0,
              targetLabels: coverage.target?.labels || MIN_LABELS_PER_STYLE
            });
      }
      if (!fallbackAllowed) {
        showToast(t("catalogInsufficientToast"));
        return null;
      }
      showToast(t("catalogFallbackToast"));
    }

    if (!externalDatasetImportDone) {
      update(38, t("searchOverlayCatalog"));
      await hydrateExternalDatasetPackInBackground();
    }

    update(48, t("newArtistsSearching"));
    const fromCatalog = collectNewArtistsFromCatalog(style, knownSet);
    update(72, t("newArtistsSearching"));
    const fromItunes = await collectNewArtistsFromItunes(style, knownSet);
    const fromSignals = collectNewArtistsFromSignals(style, knownSet);
    const combined = new Map();
    [...fromCatalog, ...fromItunes, ...fromSignals].forEach((item) => {
      mergeNewArtistCandidate(combined, item);
    });

    if (combined.size < 8) {
      const alreadyIncluded = new Set(Array.from(combined.keys()));
      const fromRelatedSignals = collectRelatedFamilyNewArtistsFromSignals(style, knownSet, alreadyIncluded);
      fromRelatedSignals.forEach((item) => {
        mergeNewArtistCandidate(combined, item);
      });
    }

    update(94, t("searchOverlayFinishing"));
    return Array.from(combined.values())
      .sort((a, b) => {
        const dateDiff =
          (parseReleaseDateSafe(b.releaseDate)?.getTime() || 0) -
          (parseReleaseDateSafe(a.releaseDate)?.getTime() || 0);
        if (dateDiff !== 0) return dateDiff;
        return recentArtistSourcePriority(b.source) - recentArtistSourcePriority(a.source);
      })
      .filter((item) => {
        const artist = String(item?.artist || "").trim();
        return artist && !artistSetHasMatch(knownSet, artist);
      })
      .slice(0, 80);
  });

  if (artists === null) {
    if (feedbackMessage && newArtistsStatus?.textContent) feedbackMessage.textContent = newArtistsStatus.textContent;
    return;
  }

  renderNewArtistsResults(style, artists);
  if (feedbackMessage) {
    feedbackMessage.textContent = artists.length
      ? t("newArtistsFound", { count: artists.length, style: styleLabelByValue(style) })
      : t("newArtistsNone");
  }
}

function syncKnownArtistsTextarea(artistName) {
  const current = knownArtistsEl.value
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);

  const currentKeys = new Set();
  current.forEach((item) => addArtistKeysToSet(currentKeys, item));
  const hasArtist = artistSetHasMatch(currentKeys, artistName);
  if (!hasArtist) current.push(artistName);
  knownArtistsEl.value = current.join(", ");
  updateStats();
}

function resolveExactBpm(track) {
  if (!track) return 0;
  if (Number.isFinite(track.bpmExact) && Number(track.bpmExact) > 0) {
    return Math.round(Number(track.bpmExact));
  }
  if (!track.bpm) return 0;
  const raw = String(track.bpm).trim();
  if (/^\d{2,3}(?:\.\d+)?$/.test(raw)) return Math.round(Number(raw));
  return 0;
}

function bpmSourceLabel(track) {
  const source = normalize(track?.source || "");
  if (!source) return t("bpmCatalogReferenceLabel");
  if (source.includes("deezer") || source.includes("itunes") || source.includes("dynamic")) {
    return t("bpmApiMetadataLabel");
  }
  return t("bpmCatalogReferenceLabel");
}

function styleBpmRangeCompact(style) {
  const rule = STYLE_BPM_RULES[style];
  if (!rule || !Number.isFinite(rule.min) || !Number.isFinite(rule.max)) return "";
  if (rule.min === rule.max) return String(rule.min);
  return `${rule.min}-${rule.max}`;
}

function resolveBpmDisplay(track) {
  const exactBpm = resolveExactBpm(track);
  const rawRangeText = String(track?.bpm || "").trim();
  const rangeText = rawRangeText || styleBpmRangeCompact(track?.style);
  if (exactBpm > 0) {
    const sourceLabel = bpmSourceLabel(track);
    return {
      exact: exactBpm,
      range: rangeText || mapBpmToRange(exactBpm),
      sourceLabel,
      statusText: sourceLabel,
      lineText: `${t("bpm")} ${exactBpm} (${sourceLabel})`,
      aiText: `${exactBpm} BPM (${sourceLabel})`
    };
  }
  const estimateText = rangeText ? t("bpmEstimatedRange", { range: rangeText }) : "";
  const lineText = estimateText
    ? `${t("bpmUnverifiedLabel")} • ${estimateText}`
    : t("bpmUnverifiedLabel");
  return {
    exact: 0,
    range: rangeText,
    sourceLabel: t("bpmUnverifiedLabel"),
    statusText: t("bpmUnverifiedLabel"),
    lineText,
    aiText: estimateText ? `${t("bpmUnverifiedLabel")} - ${estimateText}` : t("bpmUnverifiedLabel")
  };
}

function formatBpmLine(track) {
  return resolveBpmDisplay(track).lineText;
}

function buildSpotifyTrackLink(track) {
  const hasSpotifyHost = (rawUrl = "") => {
    const value = String(rawUrl || "").trim();
    if (!value) return false;
    try {
      const parsed = new URL(value);
      const host = normalize(parsed.hostname || "");
      return host.includes("spotify.com") || host.includes("spotify.link");
    } catch (_err) {
      return false;
    }
  };

  const strictQuery = `track:\"${track?.song || ""}\" artist:\"${track?.artist || ""}\"`.trim();
  const artistQuery = String(track?.artist || "").trim();
  const fallbackQuery = strictQuery || artistQuery || "electronic music";
  const fallbackSearchUrl = `https://open.spotify.com/search/${encodeURIComponent(fallbackQuery)}`;

  if (hasSpotifyHost(track?.spotifyTrackUrl)) return String(track.spotifyTrackUrl).trim();
  if (hasSpotifyHost(track?.spotifyUrl)) return String(track.spotifyUrl).trim();
  return fallbackSearchUrl;
}

function buildYouTubeTrackLink(track) {
  if (track.youtubeTrackUrl) return track.youtubeTrackUrl;
  if (isDirectYouTubeUrl(track.youtubeUrl)) return track.youtubeUrl;

  const styleTerm = STYLE_SEARCH_TERMS[track.style] || styleLabelByValue(track.style);
  const strictQuery = `"${track.artist}" "${track.song}" "${track.label || ""}" ${styleTerm} -mix -set -playlist`;
  return `https://www.youtube.com/results?search_query=${encodeURIComponent(strictQuery)}&sp=EgIQAQ%253D%253D`;
}

function buildSoundCloudTrackLink(track) {
  if (track.soundcloudTrackUrl) return track.soundcloudTrackUrl;
  if (track.soundcloudUrl) return track.soundcloudUrl;
  const styleTerm = STYLE_SEARCH_TERMS[track.style] || styleLabelByValue(track.style);
  const strictQuery = `"${track.artist}" "${track.song}" "${track.label || ""}" ${styleTerm}`;
  return `https://soundcloud.com/search?q=${encodeURIComponent(strictQuery)}`;
}

function buildArtistSocialProfiles(artistName) {
  const artist = String(artistName || "").trim();
  if (!artist) return [];
  const query = encodeURIComponent(artist);
  const youtubeQuery = encodeURIComponent(`${artist} official`);
  return [
    {
      platform: "Instagram",
      url: `https://www.instagram.com/explore/search/keyword/?q=${query}`
    },
    {
      platform: "TikTok",
      url: `https://www.tiktok.com/search?q=${query}`
    },
    {
      platform: "X",
      url: `https://x.com/search?q=${query}&src=typed_query`
    },
    {
      platform: "YouTube",
      url: `https://www.youtube.com/results?search_query=${youtubeQuery}`
    },
    {
      platform: "Beatport",
      url: `https://www.beatport.com/search/artists?q=${query}`
    },
    {
      platform: "Bandcamp",
      url: `https://bandcamp.com/search?q=${query}`
    }
  ];
}

function renderArtistSocialLinks(track) {
  if (!artistSocialsPanel || !artistSocialLinks) return;
  const artist = String(track?.artist || "").trim();
  if (!artist) {
    artistSocialsPanel.classList.add("hidden");
    artistSocialLinks.innerHTML = "";
    return;
  }

  const profiles = buildArtistSocialProfiles(artist);
  if (!profiles.length) {
    artistSocialsPanel.classList.add("hidden");
    artistSocialLinks.innerHTML = "";
    return;
  }

  artistSocialLinks.innerHTML = "";
  profiles.forEach((profile) => {
    const link = document.createElement("a");
    link.className = "social-link";
    link.href = profile.url;
    link.target = "_blank";
    link.rel = "noopener noreferrer";
    link.textContent = profile.platform;
    link.title = `${profile.platform} - ${artist}`;
    artistSocialLinks.appendChild(link);
  });
  artistSocialsPanel.classList.remove("hidden");
}

function isStrictLinkStyle(style) {
  return hasStrictWhitelist(style) || STRICT_ARTIST_MATCH_STYLES.has(style);
}

function isDirectYouTubeUrl(url) {
  const value = String(url || "").trim();
  if (!value) return false;
  return /^(https?:\/\/)?(www\.)?(youtube\.com\/watch\?v=|youtu\.be\/)[\w-]{6,}/i.test(value);
}

function extractYouTubeVideoId(url = "") {
  const value = String(url || "").trim();
  if (!value) return "";
  try {
    const normalized = /^https?:\/\//i.test(value) ? value : `https://${value}`;
    const parsed = new URL(normalized);
    const host = normalize(parsed.hostname || "");
    if (host.includes("youtu.be")) {
      const directId = String(parsed.pathname || "").replace(/^\/+/, "").split("/")[0] || "";
      return /^[\w-]{6,}$/.test(directId) ? directId : "";
    }
    if (host.includes("youtube.com")) {
      const watchId = parsed.searchParams.get("v") || "";
      if (/^[\w-]{6,}$/.test(watchId)) return watchId;
      const pathParts = String(parsed.pathname || "")
        .split("/")
        .map((part) => String(part || "").trim())
        .filter(Boolean);
      const embedIndex = pathParts.findIndex((part) => part === "embed" || part === "shorts" || part === "live");
      if (embedIndex >= 0 && pathParts[embedIndex + 1] && /^[\w-]{6,}$/.test(pathParts[embedIndex + 1])) {
        return pathParts[embedIndex + 1];
      }
    }
    return "";
  } catch (_err) {
    return "";
  }
}

function trackHasDirectYouTubeVideo(track) {
  if (!track) return false;
  return Boolean(
    extractYouTubeVideoId(track.youtubeTrackUrl) ||
    extractYouTubeVideoId(track.youtubeUrl)
  );
}

function youtubeSearchQueryVariants(track) {
  const artist = String(track?.artist || "").trim();
  const song = String(track?.song || "").trim();
  const styleTerm = String(STYLE_SEARCH_TERMS[track?.style] || styleLabelByValue(track?.style || "") || "").trim();
  const baseVariants = [
    `${artist} ${song} official audio`,
    `${artist} ${song} topic`,
    `"${artist}" "${song}" audio`,
    `${artist} ${song} ${styleTerm} audio`
  ]
    .map((item) => String(item || "").replace(/\s+/g, " ").trim())
    .filter(Boolean);
  const unique = [];
  const seen = new Set();
  baseVariants.forEach((entry) => {
    const key = normalize(entry);
    if (!key || seen.has(key)) return;
    seen.add(key);
    unique.push(entry);
  });
  if (unique.length) return unique;

  const fallback = `${artist} ${song}`.replace(/\s+/g, " ").trim() || `${song} ${styleTerm}`.replace(/\s+/g, " ").trim();
  if (!fallback) return [];
  return [fallback];
}

function youtubePreviewStateTrackKey(track) {
  return recommendationTrackKey(track) || normalize(`${track?.artist || ""}::${track?.song || ""}`);
}

function syncYouTubePreviewAttemptForTrack(track) {
  const trackKey = youtubePreviewStateTrackKey(track);
  if (!trackKey) return;
  if (youtubePreviewTrackKey !== trackKey) {
    youtubePreviewTrackKey = trackKey;
    youtubePreviewSearchAttempt = 0;
  }
}

function youtubePreviewCanRetry(track) {
  return youtubePreviewSearchAttemptCount(track) > 1;
}

function youtubePreviewSearchAttemptCount(track) {
  if (!track || trackHasDirectYouTubeVideo(track)) return 1;
  const variants = youtubeSearchQueryVariants(track);
  if (!variants.length) return 0;
  return variants.length * YOUTUBE_SEARCH_RESULTS_PER_QUERY;
}

function youtubeSearchPlanForAttempt(track, attempt = 0) {
  const variants = youtubeSearchQueryVariants(track);
  if (!variants.length) return null;

  const totalAttempts = Math.max(1, variants.length * YOUTUBE_SEARCH_RESULTS_PER_QUERY);
  const safeAttempt = Math.max(0, Number(attempt) || 0) % totalAttempts;
  const variantIndex = Math.floor(safeAttempt / YOUTUBE_SEARCH_RESULTS_PER_QUERY);
  const resultIndex = (safeAttempt % YOUTUBE_SEARCH_RESULTS_PER_QUERY) + 1;

  return {
    query: variants[variantIndex] || variants[0],
    resultIndex,
    totalAttempts
  };
}

function setYouTubePreviewActionState({ visible = false, canToggle = false, canRetry = false, expanded = false } = {}) {
  if (youtubePreviewActions) {
    youtubePreviewActions.classList.toggle("hidden", !visible);
  }
  if (youtubePreviewToggleBtn) {
    youtubePreviewToggleBtn.classList.toggle("hidden", !visible || !canToggle);
    youtubePreviewToggleBtn.disabled = !canToggle;
    youtubePreviewToggleBtn.textContent = expanded
      ? t("previewYoutubeCloseInlineBtn")
      : t("previewYoutubeOpenInlineBtn");
  }
  if (youtubePreviewRetryBtn) {
    youtubePreviewRetryBtn.classList.toggle("hidden", !visible || !canRetry);
    youtubePreviewRetryBtn.disabled = !canRetry;
    youtubePreviewRetryBtn.textContent = t("previewYoutubeRetryBtn");
  }
}

function buildYouTubeEmbedUrl(track, { autoplay = false, attempt = 0 } = {}) {
  if (!track) return "";
  const autoplayParam = autoplay ? "&autoplay=1&mute=1" : "";
  const commonParams = `rel=0&modestbranding=1&playsinline=1${autoplayParam}`;
  const directVideoId =
    extractYouTubeVideoId(track.youtubeTrackUrl) ||
    extractYouTubeVideoId(track.youtubeUrl);
  const safeAttempt = Math.max(0, Number(attempt) || 0);
  if (directVideoId) {
    return `https://www.youtube-nocookie.com/embed/${directVideoId}?${commonParams}&retry=${safeAttempt}`;
  }
  const plan = youtubeSearchPlanForAttempt(track, safeAttempt);
  if (!plan?.query) return "";
  return `https://www.youtube-nocookie.com/embed?listType=search&list=${encodeURIComponent(plan.query)}&index=${plan.resultIndex}&${commonParams}&retry=${safeAttempt}`;
}

function resetYouTubePreviewEmbed() {
  if (!youtubePreviewWrap || !youtubePreviewFrame) return;
  youtubePreviewWrap.classList.add("hidden");
  if (youtubePreviewFrame.getAttribute("src")) {
    youtubePreviewFrame.removeAttribute("src");
  }
  setYouTubePreviewActionState({ visible: false, canToggle: false, canRetry: false, expanded: false });
}

function showYouTubePreviewEmbed(track, { autoplay = false, attempt = 0 } = {}) {
  if (!youtubePreviewWrap || !youtubePreviewFrame || !track) return false;
  const embedUrl = buildYouTubeEmbedUrl(track, { autoplay, attempt });
  if (!embedUrl) return false;
  if (youtubePreviewFrame.getAttribute("src") !== embedUrl) {
    youtubePreviewFrame.setAttribute("src", embedUrl);
  }
  youtubePreviewWrap.classList.remove("hidden");
  return true;
}

function canonicalOriginForArtist(artistName) {
  const key = normalize(artistName || "");
  if (!key) return null;
  return ARTIST_CANONICAL_ORIGINS[key] || null;
}

function applyCanonicalOriginToProfile(artistName, profile) {
  const canonical = canonicalOriginForArtist(artistName);
  if (!canonical) return profile;
  const merged = {
    ...(profile || {}),
    country: canonical.country || profile?.country || "",
    area: canonical.area || profile?.area || "",
    disambiguation: canonical.disambiguation || profile?.disambiguation || ""
  };
  const sources = Array.isArray(merged.sources) ? [...merged.sources] : [];
  if (!sources.includes("CuratedOrigin")) sources.push("CuratedOrigin");
  merged.sources = sources;
  return merged;
}

function youtubeLinkTrusted(track) {
  if (!track) return false;
  if (track.youtubeVerified === true) return true;
  if (isDirectYouTubeUrl(track.youtubeTrackUrl)) return true;
  if (isDirectYouTubeUrl(track.youtubeUrl)) return true;
  return Boolean(buildYouTubeTrackLink(track));
}

function soundCloudLinkTrusted(track) {
  if (!track) return false;
  if (track.soundcloudVerified === true) return true;
  if (track.soundcloudTrackUrl || track.soundcloudUrl) return true;
  return Boolean(buildSoundCloudTrackLink(track));
}

function localizedArtistNarrativeFallback(track) {
  const safeTrack = {
    song: track?.song || "Track",
    artist: track?.artist || "Artist",
    label: track?.label || "Catalogo",
    style: track?.style || "house"
  };
  const style = styleLabelByValue(safeTrack.style);
  const label = sanitizeLabel(safeTrack.label, safeTrack.artist, safeTrack.song);
  const meta = getTrackMetadata(safeTrack);
  const releaseDate = formatReleaseDateForLanguage(meta.releaseDate);
  const bpmData = resolveBpmDisplay(safeTrack);
  const bpmCue = bpmData.exact > 0 ? `${bpmData.exact} BPM` : bpmData.range ? `${t("bpmEstimatedRange", { range: bpmData.range })}` : t("bpmUnverifiedLabel");
  const sourceLabel = String(track?.source || "catalogo_local")
    .replace(/_/g, " ")
    .toUpperCase();
  const canonicalOrigin = canonicalOriginForArtist(safeTrack.artist);
  const trackSource = normalize(track?.source || "");
  const allowTrackCountrySignal = !trackSource.includes("itunes");
  const countryRaw = String(canonicalOrigin?.country || (allowTrackCountrySignal ? track?.artistCountry : "") || "").trim();
  const areaRaw = String(canonicalOrigin?.area || "").trim();
  const countrySignal = areaRaw && countryRaw ? `${areaRaw} (${countryRaw})` : areaRaw || countryRaw;
  const genre = String(track?.artistGenre || localizedArtistGenreHint(safeTrack.artist, safeTrack.style) || "").trim();
  const hint = String(track?.artistProfileHint || "").trim();
  if (currentLanguage === "en") {
    const originCopy = countrySignal ? `Origin cue: ${countrySignal}. ` : "";
    const genreCopy = genre ? `Genre cue: ${genre}. ` : "";
    const hintCopy = hint ? `Catalog clue: ${hint}. ` : "";
    return `${safeTrack.artist} moves inside ${style} with "${safeTrack.song}" (${releaseDate}) linked to ${label}. ${originCopy}${genreCopy}Tempo cue: ${bpmCue}. Source: ${sourceLabel}. ${hintCopy}`.trim();
  }
  if (currentLanguage === "es") {
    const originCopy = countrySignal ? `Señal de origen: ${countrySignal}. ` : "";
    const genreCopy = genre ? `Señal de género: ${genre}. ` : "";
    const hintCopy = hint ? `Pista de catálogo: ${hint}. ` : "";
    return `${safeTrack.artist} se mueve en ${style} con "${safeTrack.song}" (${releaseDate}) vinculada a ${label}. ${originCopy}${genreCopy}Pulso: ${bpmCue}. Fuente: ${sourceLabel}. ${hintCopy}`.trim();
  }
  const countryCopy = countrySignal ? `Sinal de origem: ${countrySignal}. ` : "";
  const genreCopy = genre ? `Sinal de gênero: ${genre}. ` : "";
  const hintCopy = hint ? `Pista de catálogo: ${hint}. ` : "";
  return `${safeTrack.artist} navega pelo ${style} com "${safeTrack.song}" (${releaseDate}) ligado ao selo ${label}. ${countryCopy}${genreCopy}Pulso: ${bpmCue}. Fonte: ${sourceLabel}. ${hintCopy}`.trim();
}

function detailedArtistBio(track) {
  const key = normalize(track?.artist || "");
  const profile = ARTIST_EXTENDED_PROFILES[key];
  if (profile) return profile[currentLanguage] || profile.pt || localizedArtistNarrativeFallback(track);

  const sourceBio = String(track?.artistBio || "").trim();
  const normalizedSourceBio = normalize(sourceBio);
  const isGenericDynamicBio = normalizedSourceBio.includes("apareceu na busca dinamica") ||
    normalizedSourceBio.includes("appears in the") ||
    normalizedSourceBio.includes("aparece como destacado");
  if (sourceBio && sourceBio.length > 80 && !isGenericDynamicBio) {
    return `${sourceBio} ${localizedArtistNarrativeFallback(track)}`;
  }
  return localizedArtistNarrativeFallback(track);
}

function sanitizeArtistLookupName(artistName) {
  return String(artistName || "")
    .replace(/\([^)]*\)/g, " ")
    .replace(/\b(ft|feat|featuring|vs)\b.*$/i, " ")
    .replace(/\s+/g, " ")
    .trim();
}

const BIO_LANGUAGE_SIGNAL_WORDS = {
  pt: new Set(["de", "do", "da", "dos", "das", "com", "para", "uma", "um", "foi", "desde", "origem", "contexto", "fontes"]),
  en: new Set(["the", "and", "from", "is", "was", "with", "for", "project", "group", "formed", "sources", "origin", "context"]),
  es: new Set(["de", "del", "la", "el", "con", "para", "una", "un", "fue", "desde", "origen", "contexto", "fuentes"])
};

function detectBioTextLanguage(text) {
  const normalized = normalize(text || "");
  if (!normalized) return "";
  const tokens = normalized.split(/[^a-z0-9]+/).filter(Boolean);
  if (!tokens.length) return "";

  const scores = {
    pt: 0,
    en: 0,
    es: 0
  };
  tokens.forEach((token) => {
    if (BIO_LANGUAGE_SIGNAL_WORDS.pt.has(token)) scores.pt += 1;
    if (BIO_LANGUAGE_SIGNAL_WORDS.en.has(token)) scores.en += 1;
    if (BIO_LANGUAGE_SIGNAL_WORDS.es.has(token)) scores.es += 1;
  });

  const ranked = Object.entries(scores).sort((a, b) => b[1] - a[1]);
  const [topLang, topScore] = ranked[0];
  const secondScore = ranked[1]?.[1] || 0;
  if (topScore < 2) return "";
  if (topScore <= secondScore) return "";
  return topLang;
}

function textMatchesCurrentBioLanguage(text) {
  if (!text) return true;
  if (currentLanguage === "en") return true;
  const detected = detectBioTextLanguage(text);
  if (!detected) return true;
  return detected === currentLanguage;
}

function wikipediaLanguagePriority(preferredLanguage = currentLanguage) {
  if (preferredLanguage === "pt") return ["pt", "en"];
  if (preferredLanguage === "es") return ["es", "en"];
  return ["en"];
}

async function fetchJsonWithTimeout(endpoint, timeoutMs = 4200) {
  const controller = typeof AbortController !== "undefined" ? new AbortController() : null;
  let timeoutId = 0;
  try {
    if (controller) timeoutId = window.setTimeout(() => controller.abort(), timeoutMs);
    const response = await fetch(endpoint, {
      method: "GET",
      headers: { Accept: "application/json" },
      signal: controller?.signal
    });
    if (!response.ok) return null;
    return await response.json();
  } catch (_err) {
    return null;
  } finally {
    if (timeoutId) window.clearTimeout(timeoutId);
  }
}

async function fetchArtistBioFromWikipedia(artistName, preferredLanguage = currentLanguage) {
  const baseName = sanitizeArtistLookupName(artistName);
  if (!baseName) return null;
  const candidates = Array.from(new Set([baseName, `${baseName} (musician)`, `${baseName} (DJ)`]));
  const languages = wikipediaLanguagePriority(preferredLanguage);

  for (const lang of languages) {
    for (const candidate of candidates) {
      const endpoint = `https://${lang}.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(candidate)}`;
      const payload = await fetchJsonWithTimeout(endpoint);
      if (!payload) continue;
      const type = normalize(payload?.type || "");
      const extract = String(payload?.extract || "").replace(/\s+/g, " ").trim();
      if (!extract || extract.length < REMOTE_ARTIST_BIO_MIN_LENGTH) continue;
      if (type.includes("disambiguation")) continue;
      return {
        text: extract,
        source: lang === "en" ? "Wikipedia" : `Wikipedia-${lang.toUpperCase()}`
      };
    }
  }

  return null;
}

async function fetchArtistProfileFromMusicBrainz(artistName) {
  const baseName = sanitizeArtistLookupName(artistName);
  if (!baseName) return null;
  const query = encodeURIComponent(`artist:"${baseName}"`);
  const endpoint = `https://musicbrainz.org/ws/2/artist/?query=${query}&fmt=json&limit=6`;
  const payload = await fetchJsonWithTimeout(endpoint);
  const rows = Array.isArray(payload?.artists) ? payload.artists : [];
  if (!rows.length) return null;

  const sorted = [...rows].sort((a, b) => (Number(b?.score) || 0) - (Number(a?.score) || 0));
  const bestExact = sorted.find((item) => normalize(item?.name || "") === normalize(baseName));
  const best = bestExact || sorted[0];
  if (!best) return null;
  if ((Number(best?.score) || 0) < 70) return null;

  return {
    source: "MusicBrainz",
    country: String(best?.country || "").trim(),
    area: String(best?.area?.name || "").trim(),
    disambiguation: String(best?.disambiguation || "").trim(),
    lifeStartYear: String(best?.["life-span"]?.begin || "").slice(0, 4)
  };
}

async function fetchArtistProfileFromItunes(artistName) {
  const baseName = sanitizeArtistLookupName(artistName);
  if (!baseName) return null;
  try {
    const term = encodeURIComponent(baseName);
    const data = await itunesJsonp(`https://itunes.apple.com/search?term=${term}&entity=song&limit=35`);
    const rows = Array.isArray(data?.results) ? data.results : [];
    const matches = rows.filter((row) => isArtistMatch(row?.artistName || "", baseName));
    const best = matches[0];
    if (!best) return null;
    return {
      source: "iTunes",
      genre: String(best?.primaryGenreName || "").trim(),
      collectionName: String(best?.collectionName || "").trim()
    };
  } catch (_err) {
    return null;
  }
}

function mergeArtistProfile(...chunks) {
  const profile = {
    country: "",
    area: "",
    disambiguation: "",
    genre: "",
    lifeStartYear: "",
    wikiSummary: "",
    sources: []
  };
  let countrySource = "";
  let areaSource = "";
  chunks.forEach((chunk) => {
    if (!chunk) return;
    const sourceName = String(chunk.source || "");
    if (chunk.area && !profile.area) {
      profile.area = chunk.area;
      areaSource = sourceName;
    }
    if (chunk.country && !profile.country) {
      // Evita combinar cidade/região de uma fonte com país de outra fonte,
      // cenário que gerava casos incoerentes como "Lisboa, USA".
      const canAttachCountryToArea = !profile.area || !areaSource || areaSource === sourceName;
      if (canAttachCountryToArea) {
        profile.country = chunk.country;
        countrySource = sourceName;
      }
    }
    if (chunk.disambiguation && !profile.disambiguation) profile.disambiguation = chunk.disambiguation;
    if (chunk.genre && !profile.genre) profile.genre = chunk.genre;
    if (chunk.lifeStartYear && !profile.lifeStartYear) profile.lifeStartYear = chunk.lifeStartYear;
    if (chunk.wikiSummary && !profile.wikiSummary) profile.wikiSummary = chunk.wikiSummary;
    if (chunk.source && !profile.sources.includes(chunk.source)) profile.sources.push(chunk.source);
  });
  if (profile.area && profile.country && areaSource && countrySource && areaSource !== countrySource) {
    profile.country = "";
  }
  return profile;
}

function hasMeaningfulArtistProfile(profile) {
  if (!profile) return false;
  return Boolean(
    profile.country ||
    profile.area ||
    profile.disambiguation ||
    profile.genre ||
    profile.wikiSummary
  );
}

function buildArtistBioFromApiProfile(track, profile) {
  if (!hasMeaningfulArtistProfile(profile)) return "";
  const artist = String(track?.artist || "").trim() || "Artista";
  const style = styleLabelByValue(track?.style || "house");
  const song = String(track?.song || "").trim();
  const origin =
    profile.area && profile.country
      ? `${profile.area}, ${profile.country}`
      : profile.area || profile.country;
  const bpmData = resolveBpmDisplay(track || {});
  const bpmCue = bpmData.exact > 0 ? `${bpmData.exact} BPM` : bpmData.range ? `${t("bpmEstimatedRange", { range: bpmData.range })}` : t("bpmUnverifiedLabel");
  const sources = (profile.sources || []).join(", ");
  const summaryRaw = String(profile.wikiSummary || "").replace(/\s+/g, " ").trim();
  const disambiguationRaw = String(profile.disambiguation || "").trim();
  const summary = textMatchesCurrentBioLanguage(summaryRaw) ? summaryRaw : "";
  const disambiguation = textMatchesCurrentBioLanguage(disambiguationRaw) ? disambiguationRaw : "";
  const genreSignal = String(profile.genre || track?.artistGenre || localizedArtistGenreHint(artist, track?.style || "") || "").trim();

  if (currentLanguage === "en") {
    const leadLine = song ? `${artist} is featured in ${style} with "${song}". ` : `${artist} is featured in ${style}. `;
    const originLine = origin ? `Origin: ${origin}. ` : "";
    const genreLine = genreSignal ? `Genre signal: ${genreSignal}. ` : "";
    const contextLine = disambiguation ? `Context: ${disambiguation}. ` : "";
    const lifeLine = profile.lifeStartYear ? `Active since around ${profile.lifeStartYear}. ` : "";
    const bpmLine = `Pulse reference: ${bpmCue}. `;
    const summaryLine = summary ? `${summary} ` : "";
    const sourceLine = sources ? `Sources: ${sources}.` : "";
    return `${leadLine}${originLine}${genreLine}${contextLine}${lifeLine}${bpmLine}${summaryLine}${sourceLine}`.trim();
  }
  if (currentLanguage === "es") {
    const leadLine = song ? `${artist} aparece en el eje ${style} con "${song}". ` : `${artist} aparece en el eje ${style}. `;
    const originLine = origin ? `Origen: ${origin}. ` : "";
    const genreLine = genreSignal ? `Señal de género: ${genreSignal}. ` : "";
    const contextLine = disambiguation ? `Contexto: ${disambiguation}. ` : "";
    const lifeLine = profile.lifeStartYear ? `Activo desde alrededor de ${profile.lifeStartYear}. ` : "";
    const bpmLine = `Pulso de referencia: ${bpmCue}. `;
    const summaryLine = summary ? `${summary} ` : "";
    const sourceLine = sources ? `Fuentes: ${sources}.` : "";
    return `${leadLine}${originLine}${genreLine}${contextLine}${lifeLine}${bpmLine}${summaryLine}${sourceLine}`.trim();
  }
  const leadLine = song ? `${artist} aparece no eixo ${style} com "${song}". ` : `${artist} aparece no eixo ${style}. `;
  const originLine = origin ? `Origem: ${origin}. ` : "";
  const genreLine = genreSignal ? `Sinal de gênero: ${genreSignal}. ` : "";
  const contextLine = disambiguation ? `Contexto: ${disambiguation}. ` : "";
  const lifeLine = profile.lifeStartYear ? `Ativo desde aproximadamente ${profile.lifeStartYear}. ` : "";
  const bpmLine = `Pulso de referência: ${bpmCue}. `;
  const summaryLine = summary ? `${summary} ` : "";
  const sourceLine = sources ? `Fontes: ${sources}.` : "";
  return `${leadLine}${originLine}${genreLine}${contextLine}${lifeLine}${bpmLine}${summaryLine}${sourceLine}`.trim();
}

async function fetchArtistApiProfile(artistName, preferredLanguage = currentLanguage) {
  const key = normalize(artistName || "");
  if (!key) return null;
  const locale = ["pt", "en", "es"].includes(preferredLanguage) ? preferredLanguage : DEFAULT_LANGUAGE;
  const cacheKey = `${key}::${locale}`;
  if (artistApiProfileCache.has(cacheKey)) return artistApiProfileCache.get(cacheKey);

  const [wiki, musicBrainz, itunes] = await Promise.all([
    fetchArtistBioFromWikipedia(artistName, locale),
    fetchArtistProfileFromMusicBrainz(artistName),
    fetchArtistProfileFromItunes(artistName)
  ]);
  const merged = mergeArtistProfile(
    musicBrainz,
    itunes,
    wiki ? { wikiSummary: wiki.text, source: wiki.source } : null
  );
  const canonicalMerged = applyCanonicalOriginToProfile(artistName, merged);
  const result = hasMeaningfulArtistProfile(canonicalMerged) ? canonicalMerged : null;
  artistApiProfileCache.set(cacheKey, result);
  return result;
}

async function hydrateArtistBioFromApis(track) {
  if (!track || !artistBio) return;
  const trackKey = normalize(`${track.artist}::${track.song}`);
  const profile = await fetchArtistApiProfile(track.artist);
  if (!profile) return;

  const activeTrackKey = normalize(`${currentRecommendation?.artist || ""}::${currentRecommendation?.song || ""}`);
  if (!activeTrackKey || activeTrackKey !== trackKey) return;

  if (profile.country) track.artistCountry = profile.country;
  if (profile.genre && !track.artistGenre) track.artistGenre = profile.genre;
  if (profile.disambiguation && !track.artistProfileHint) track.artistProfileHint = profile.disambiguation;
  if (!track.artistGenre) {
    track.artistGenre = localizedArtistGenreHint(track.artist, track.style) || "";
  }

  const enriched = buildArtistBioFromApiProfile(track, profile);
  if (enriched) artistBio.textContent = enriched;
}

function shouldRejectPsycoreByApi(profile) {
  if (!profile) return false;
  const evidence = normalize(
    `${profile.disambiguation || ""} ${profile.genre || ""} ${profile.wikiSummary || ""}`
  );
  if (!evidence) return false;
  if (evidence.includes("psycore")) return false;
  if (evidence.includes("psytrance") || evidence.includes("hitech") || evidence.includes("hi tech")) return true;
  return false;
}

function isUnknownLabel(labelName) {
  const normalizedLabel = normalize(labelName || "");
  if (!normalizedLabel) return true;
  return [
    "catalogo dinamico",
    "dynamic catalog"
  ].includes(normalizedLabel);
}

function localizedUnknownLabelName() {
  if (currentLanguage === "en") return "Dynamic catalog";
  if (currentLanguage === "es") return "Catalogo dinamico";
  return "Catálogo dinâmico";
}

function isLegacyGenericLabelBio(text) {
  const normalizedText = normalize(text || "");
  if (!normalizedText) return false;
  return normalizedText.includes("faixa puxada por pesquisa automatica") ||
    normalizedText.includes("track pulled by automatic search") ||
    normalizedText.includes("track extraido por busqueda automatica");
}

function buildDynamicLabelSummary(styleValue, labelName) {
  const style = styleLabelByValue(styleValue);
  const cleanLabel = sanitizeLabel(labelName, "", "");
  if (isUnknownLabel(cleanLabel)) {
    return `Selo ainda não confirmado para esta faixa. Curadoria aplicada no eixo ${style}, com checagem de subgênero, BPM e consistência entre artista/título para reduzir cruzamentos incorretos.`;
  }
  return `${cleanLabel} aparece nesta recomendação do eixo ${style}. A seleção considera coerência de subgênero, faixa de BPM e metadados de artista/faixa antes de liberar a sugestão.`;
}

function localizedLabelNarrativeFallback(track) {
  const rawLabel = sanitizeLabel(track.label, track.artist, track.song);
  const label = isUnknownLabel(rawLabel) ? localizedUnknownLabelName() : rawLabel;
  const style = styleLabelByValue(track.style);
  if (currentLanguage === "en") {
    if (isUnknownLabel(rawLabel)) {
      return `Label profile: not confirmed for this track yet. Curation for the ${style} axis was validated by subgenre fit, BPM range, and artist/title consistency before recommendation.`;
    }
    return `Label profile: ${label} appears in the ${style} axis with dancefloor-oriented releases. This recommendation is filtered by subgenre fit, BPM range, and artist/title metadata consistency to avoid mismatched suggestions.`;
  }
  if (currentLanguage === "es") {
    if (isUnknownLabel(rawLabel)) {
      return `Perfil del sello: aún no confirmado para este track. La curaduría del eje ${style} fue validada por ajuste de subgénero, rango de BPM y coherencia entre artista/título antes de recomendar.`;
    }
    return `Perfil del sello: ${label} aparece en el eje ${style} con lanzamientos orientados a pista. Esta recomendación se filtra por ajuste de subgénero, rango de BPM y coherencia de metadatos artista/título para evitar cruces incorrectos.`;
  }
  if (isUnknownLabel(rawLabel)) {
    return `Perfil da gravadora: ainda não confirmada para esta faixa. A curadoria no eixo ${style} foi validada por encaixe de subgênero, faixa de BPM e consistência entre artista/título antes da recomendação.`;
  }
  return `Perfil da gravadora: ${label} aparece no eixo ${style} com lançamentos voltados para pista. Esta recomendação passa por filtro de subgênero, faixa de BPM e consistência de metadados artista/faixa para reduzir sugestões fora do estilo.`;
}

function detailedLabelBio(track) {
  const label = sanitizeLabel(track.label, track.artist, track.song);
  const key = normalize(label);
  const profile = LABEL_EXTENDED_PROFILES[key];
  if (profile) return profile[currentLanguage] || profile.pt || localizedLabelNarrativeFallback(track);

  const sourceBio = String(track?.labelBio || "").trim();
  if (sourceBio && sourceBio.length >= 110 && !isLegacyGenericLabelBio(sourceBio) && currentLanguage === "pt") {
    return sourceBio;
  }
  return localizedLabelNarrativeFallback(track);
}

function availableExternalPlatforms() {
  const platforms = [];
  if (spotifyLink?.getAttribute("aria-disabled") !== "true") platforms.push("Spotify");
  if (youtubeLink?.getAttribute("aria-disabled") !== "true") platforms.push("YouTube");
  if (soundcloudLink?.getAttribute("aria-disabled") !== "true") platforms.push("SoundCloud");
  return platforms;
}

function pulseLine(lineEl) {
  if (!lineEl) return;
  lineEl.classList.remove("flash");
  void lineEl.offsetWidth;
  lineEl.classList.add("flash");
}

function waitMs(ms) {
  return new Promise((resolve) => window.setTimeout(resolve, ms));
}

function totalPositiveLikes() {
  return userStats.likedSongs + userStats.likedArtists + userStats.likedDiscoveries;
}

function totalLikedSongs() {
  return Math.max(0, Number(userStats.likedSongs) || 0);
}

function spiritReviewCheckpointFromSongLikes(songLikes = totalLikedSongs()) {
  const value = Math.max(0, Number(songLikes) || 0);
  if (value < SPIRIT_UNLOCK_TARGET) return 0;
  return Math.floor(value / SPIRIT_UNLOCK_TARGET) * SPIRIT_UNLOCK_TARGET;
}

function shouldCelebrateSpiritUnlockOnSongs() {
  return totalLikedSongs() === SPIRIT_UNLOCK_TARGET;
}

function registerSpiritSignal(style, amount = 1) {
  const key = normalize(style || "");
  if (!key) return;
  spiritSignalsByStyle.set(key, (spiritSignalsByStyle.get(key) || 0) + amount);
}

function spiritSignalForStyle(style) {
  const key = normalize(style || "");
  if (!key) return 0;
  return (spiritSignalsByStyle.get(key) || 0) + (adaptiveModel.likedStyles.get(key) || 0);
}

function spiritById(spiritId) {
  return MUSICAL_SPIRITS.find((item) => item.id === spiritId) || null;
}

function localizedSpiritCopy(spirit) {
  if (!spirit) return null;
  return spirit.copy[currentLanguage] || spirit.copy[DEFAULT_LANGUAGE] || spirit.copy.pt || null;
}

function spiritTopStyles(spirit, limit = 2) {
  return Object.entries(spirit?.styleWeights || {})
    .sort((a, b) => b[1] - a[1])
    .slice(0, limit)
    .map(([style]) => styleLabelByValue(style))
    .filter(Boolean);
}

function trackFromRecommendationKey(trackKey = "") {
  const key = normalize(trackKey || "");
  if (!key) return null;
  for (let i = 0; i < catalog.length; i += 1) {
    const track = catalog[i];
    if (recommendationTrackKey(track) === key) return track;
  }
  return null;
}

function spiritStyleScoreForTrack(spirit, track) {
  if (!spirit || !track) return 0;
  const direct = Number(spirit?.styleWeights?.[track.style] || 0);
  if (direct > 0) return direct;
  const spiritStyleKeys = Object.keys(spirit?.styleWeights || {});
  const spiritFamilies = new Set(spiritStyleKeys.map((style) => familyOf(style)));
  return spiritFamilies.has(familyOf(track.style)) ? 0.42 : 0;
}

function resolveFavoriteSpiritTrack(spirit) {
  const candidateKeys = new Set([
    ...trackPreferenceSignals.keys(),
    ...trackRatings.keys(),
    ...trackRatingSignals.keys()
  ]);
  if (!candidateKeys.size) return null;

  let bestTrack = null;
  let bestScore = Number.NEGATIVE_INFINITY;
  let scanIndex = 0;

  candidateKeys.forEach((trackKey) => {
    scanIndex += 1;
    const track = trackFromRecommendationKey(trackKey);
    if (!track || !isTrackEligibleForRecommendation(track)) return;

    const stars = Math.max(0, Math.min(5, Math.round(Number(trackRatings.get(trackKey)) || 0)));
    const ratingSignal = Number(trackRatingSignals.get(trackKey)) || 0;
    const preferenceSignal = Number(trackPreferenceSignals.get(trackKey)) || 0;
    const styleScore = spiritStyleScoreForTrack(spirit, track);
    const strongPositive = preferenceSignal >= 0.45 || stars >= 4 || ratingSignal >= 0.55;
    if (!strongPositive) return;

    const score =
      preferenceSignal * 4.8 +
      stars * 1.85 +
      ratingSignal * 2.25 +
      getAdaptiveScore(track) * 1.42 +
      styleScore * 2.65 +
      (track.previewUrl ? 0.74 : 0) +
      (track.existenceVerified === true ? 0.66 : 0) +
      scanIndex * 0.0001;

    if (score > bestScore) {
      bestScore = score;
      bestTrack = track;
    }
  });

  return bestTrack;
}

function resolvePredictedSpiritTrack(spirit) {
  const preferredStyles = spiritTopStyleKeys(spirit, 4);
  const styleSet = new Set(preferredStyles);
  const basePool = catalog.filter((track) => isTrackEligibleForRecommendation(track));
  if (!basePool.length) return null;

  let candidatePool = basePool;
  if (styleSet.size) {
    const styleLocked = basePool.filter((track) => styleSet.has(track.style));
    if (styleLocked.length) candidatePool = styleLocked;
  }

  const currentKey = recommendationTrackKey(currentRecommendation);
  const prefs = lastPrefs || {
    style: preferredStyles[0] || "",
    context: "",
    energy: "",
    bpm: "",
    vocals: ""
  };

  const scored = candidatePool
    .map((track) => {
      const key = recommendationTrackKey(track);
      const stars = Math.max(0, Math.min(5, Math.round(Number(trackRatings.get(key)) || 0)));
      const ratingSignal = Number(trackRatingSignals.get(key)) || 0;
      const preferenceSignal = Number(trackPreferenceSignals.get(key)) || 0;
      const styleScore = spiritStyleScoreForTrack(spirit, track);
      let score = 0;

      score += getAdaptiveScore(track) * 2.1;
      score += styleScore * 3.2;
      score += preferenceSignal * 1.9;
      score += ratingSignal * 1.3;
      score += (stars - 3) * 1.15;
      if (prefs.style && track.style === prefs.style) score += 0.95;
      if (prefs.context && track.context.includes(prefs.context)) score += 0.52;
      if (prefs.energy && track.energy === prefs.energy) score += 0.66;
      if (prefs.vocals && track.vocals === prefs.vocals) score += 0.42;
      if (prefs.bpm && trackMatchesBpmPreference(track, prefs.bpm)) score += 0.58;
      if (track.previewUrl) score += 1.05;
      if (track.existenceVerified === true) score += 0.62;
      if (track.existenceVerified === false) score -= 4.8;
      if (currentKey && currentKey === key) score -= 1.3;

      return { track, score };
    })
    .sort((a, b) => b.score - a.score);

  return scored[0]?.track || null;
}

function resolveSpiritSpotlightTrack(spirit) {
  const favorite = resolveFavoriteSpiritTrack(spirit);
  if (favorite) return { track: favorite, source: "favorite" };

  const predicted = resolvePredictedSpiritTrack(spirit);
  if (predicted) return { track: predicted, source: "predicted" };

  const fallback = currentRecommendation && isTrackEligibleForRecommendation(currentRecommendation)
    ? currentRecommendation
    : null;
  if (!fallback) return null;
  return { track: fallback, source: "fallback" };
}

function clearSpiritSpotlight() {
  if (spiritSpotlightPanel) spiritSpotlightPanel.classList.add("hidden");
  if (spiritSpotlightHint) spiritSpotlightHint.textContent = t("spiritSpotlightNone");
  if (spiritSpotlightTrack) spiritSpotlightTrack.textContent = "";
  if (spiritSpotlightMeta) spiritSpotlightMeta.textContent = "";
  setListenLinkState(spiritSpotlightSpotify, { href: "#", enabled: false, title: t("previewUnavailable") });
  setListenLinkState(spiritSpotlightYoutube, { href: "#", enabled: false, title: t("previewUnavailable") });
  setListenLinkState(spiritSpotlightSoundcloud, { href: "#", enabled: false, title: t("previewUnavailable") });
}

function renderSpiritSpotlight(payload) {
  if (!spiritSpotlightPanel || !spiritSpotlightTrack || !spiritSpotlightMeta || !spiritSpotlightHint) return;
  const track = payload?.track || null;
  if (!track) {
    clearSpiritSpotlight();
    return null;
  }

  spiritSpotlightPanel.classList.remove("hidden");
  if (spiritSpotlightTitle) spiritSpotlightTitle.textContent = t("spiritSpotlightTitle");
  if (payload?.source === "favorite") spiritSpotlightHint.textContent = t("spiritSpotlightHintFavorite");
  else if (payload?.source === "predicted") spiritSpotlightHint.textContent = t("spiritSpotlightHintPredicted");
  else spiritSpotlightHint.textContent = t("spiritSpotlightHintFallback");

  const spotlightSong = String(track.song || "").trim() || (currentLanguage === "en" ? "Unknown track" : currentLanguage === "es" ? "Pista desconocida" : "Faixa desconhecida");
  const spotlightArtist = String(track.artist || "").trim() || (currentLanguage === "en" ? "Unknown artist" : currentLanguage === "es" ? "Artista desconocido" : "Artista desconhecido");
  spiritSpotlightTrack.textContent = `${spotlightSong} • ${spotlightArtist}`;
  spiritSpotlightMeta.textContent = recommendationMetaLine(track);

  const spiritSpotifyHref = buildSpotifyTrackLink(track);
  const spiritSpotifyEnabled = Boolean(spiritSpotifyHref && spiritSpotifyHref !== "#");
  setListenLinkState(spiritSpotlightSpotify, {
    href: spiritSpotifyHref,
    enabled: spiritSpotifyEnabled,
    title: track.spotifyVerified === false ? t("spotifyUnverified") : ""
  });
  if (spiritSpotlightSpotify) {
    spiritSpotlightSpotify.classList.toggle("unverified-link", track.spotifyVerified === false && spiritSpotifyEnabled);
  }
  const spotlightYouTubeEnabled = youtubeLinkTrusted(track);
  setListenLinkState(spiritSpotlightYoutube, {
    href: buildYouTubeTrackLink(track),
    enabled: spotlightYouTubeEnabled,
    title: spotlightYouTubeEnabled ? "" : t("youtubeUnverified")
  });
  const spotlightSoundcloudHref = track.soundcloudTrackUrl || track.soundcloudUrl || buildSoundCloudTrackLink(track);
  const spotlightSoundcloudEnabled = soundCloudLinkTrusted(track);
  setListenLinkState(spiritSpotlightSoundcloud, {
    href: spotlightSoundcloudHref,
    enabled: spotlightSoundcloudEnabled,
    title: spotlightSoundcloudEnabled ? "" : t("soundcloudUnverified")
  });

  return track;
}

function resolveSpiritVisualQuery(spirit) {
  if (!spirit) return "";
  const mapped = SPIRIT_VISUAL_QUERIES[spirit.id];
  if (mapped) return mapped;
  const topStyles = spiritTopStyles(spirit, 2);
  if (!topStyles.length) return "electronic music visualizer";
  return `${topStyles.join(" ")} visualizer`;
}

function buildYouTubeSearchUrl(query) {
  return `https://www.youtube.com/results?search_query=${encodeURIComponent(query)}`;
}

function spiritVisualTheme(spirit) {
  return SPIRIT_VISUAL_THEMES[spirit?.id] || {
    a: "#6effdc",
    b: "#61bfff",
    c: "#9f7bff",
    d: "#0b1a34"
  };
}

function hexToRgba(hex, alpha = 1) {
  const value = String(hex || "").trim().replace("#", "");
  const full = value.length === 3
    ? value.split("").map((ch) => `${ch}${ch}`).join("")
    : value.length === 6
      ? value
      : "6effdc";
  const red = parseInt(full.slice(0, 2), 16);
  const green = parseInt(full.slice(2, 4), 16);
  const blue = parseInt(full.slice(4, 6), 16);
  return `rgba(${red}, ${green}, ${blue}, ${alpha})`;
}

function applySpiritAmbientTheme(spirit) {
  if (!spiritAmbientVisual) return;
  const theme = spiritVisualTheme(spirit);
  spiritAmbientVisual.style.background = [
    `radial-gradient(circle at 20% 18%, ${hexToRgba(theme.a, 0.24)}, transparent 35%)`,
    `radial-gradient(circle at 85% 78%, ${hexToRgba(theme.c, 0.2)}, transparent 36%)`,
    `linear-gradient(150deg, #020914, ${hexToRgba(theme.b, 0.2)} 56%, ${theme.d})`
  ].join(", ");

  const glow = spiritAmbientVisual.querySelector(".spirit-ambient-glow");
  if (glow) {
    glow.style.background = `radial-gradient(circle, ${hexToRgba(theme.a, 0.38)}, transparent 68%)`;
  }

  const rings = spiritAmbientVisual.querySelectorAll(".spirit-ambient-ring");
  rings.forEach((ring, index) => {
    const color = index === 0 ? theme.b : index === 1 ? theme.a : theme.c;
    ring.style.borderColor = hexToRgba(color, index === 0 ? 0.35 : 0.28);
  });
}

function resolveSpiritRank(likes = totalPositiveLikes()) {
  let current = SPIRIT_RANK_TIERS[0];
  SPIRIT_RANK_TIERS.forEach((tier) => {
    if (likes >= tier.likes) current = tier;
  });
  const next = SPIRIT_RANK_TIERS.find((tier) => tier.likes > likes) || null;
  return { current, next };
}

function collectibleMilestoneForLikes(likes = totalPositiveLikes()) {
  const unlocked = SPIRIT_RANK_TIERS.filter((tier) => likes >= tier.likes);
  return unlocked[unlocked.length - 1] || SPIRIT_RANK_TIERS[0];
}

function spiritCollectibleStoreKey() {
  return storageKeyForSession(SPIRIT_COLLECTIBLE_STORAGE_KEY);
}

function readSpiritCollectibleStore() {
  const key = spiritCollectibleStoreKey();
  if (!key) return {};
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return {};
    const parsed = JSON.parse(raw);
    return parsed && typeof parsed === "object" ? parsed : {};
  } catch (_err) {
    return {};
  }
}

function saveSpiritCollectibleStore(store) {
  const key = spiritCollectibleStoreKey();
  if (!key) return;
  try {
    localStorage.setItem(key, JSON.stringify(store || {}));
  } catch (_err) {
    // ignore storage failures
  }
}

function collectibleImageMeta(imageUrl = "") {
  const value = String(imageUrl || "").trim();
  let mime = "image/png";

  if (/^data:image\//i.test(value)) {
    const dataMatch = value.match(/^data:(image\/[a-z0-9.+-]+)(?:;|,)/i);
    if (dataMatch?.[1]) mime = dataMatch[1].toLowerCase();
  } else {
    const cleanUrl = value.split("#")[0].split("?")[0];
    const ext = (cleanUrl.match(/\.([a-z0-9]+)$/i)?.[1] || "").toLowerCase();
    if (ext === "svg") mime = "image/svg+xml";
    else if (ext === "jpg" || ext === "jpeg") mime = "image/jpeg";
    else if (ext === "webp") mime = "image/webp";
    else if (ext === "gif") mime = "image/gif";
    else if (ext === "png") mime = "image/png";
  }

  let extension = "png";
  if (mime.includes("svg")) extension = "svg";
  else if (mime.includes("jpeg")) extension = "jpg";
  else if (mime.includes("webp")) extension = "webp";
  else if (mime.includes("gif")) extension = "gif";

  return { mime, extension };
}

function spiritCollectibleFilename(spiritId, milestoneLikes, imageUrl = "") {
  const { extension } = collectibleImageMeta(imageUrl);
  const normalizedSpirit = normalize(spiritId || "spirit")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "") || "spirit";
  return `sonic-search-${normalizedSpirit}-${milestoneLikes}.${extension}`;
}

function spiritStoryFilename(baseFilename = "") {
  const baseNameWithoutExt = String(baseFilename || "")
    .trim()
    .replace(/\.[a-z0-9]+$/i, "") || "sonic-search-spirit";
  return `${baseNameWithoutExt}-story-1080x1920.png`;
}

function triggerSpiritCollectibleDownload(imageUrl, filename = "") {
  const safeUrl = String(imageUrl || "").trim();
  if (!safeUrl || safeUrl === "#") return false;

  if (spiritCollectibleDownload) {
    spiritCollectibleDownload.href = safeUrl;
    if (filename) spiritCollectibleDownload.setAttribute("download", filename);
  }

  // Use a temporary anchor to avoid recursively firing the download button handler.
  const link = document.createElement("a");
  link.href = safeUrl;
  link.download = filename || "sonic-search-spirit.png";
  link.rel = "noopener";
  link.style.display = "none";
  document.body.appendChild(link);
  link.click();
  link.remove();
  return true;
}

async function spiritCollectibleBlobFromUrl(imageUrl, mimeHint = "") {
  const source = String(imageUrl || "").trim();
  if (!source) throw new Error("collectible-empty-url");

  if (/^data:image\//i.test(source)) {
    const commaIndex = source.indexOf(",");
    if (commaIndex < 0) throw new Error("collectible-invalid-data-url");
    const meta = source.slice(5, commaIndex);
    const body = source.slice(commaIndex + 1);
    const mime = String(meta.split(";")[0] || mimeHint || "image/png").toLowerCase();
    if (/;base64/i.test(meta)) {
      const raw = atob(body);
      const bytes = new Uint8Array(raw.length);
      for (let i = 0; i < raw.length; i += 1) {
        bytes[i] = raw.charCodeAt(i);
      }
      return new Blob([bytes], { type: mime });
    }
    return new Blob([decodeURIComponent(body)], { type: mime });
  }

  const response = await fetch(source, { mode: "cors" });
  if (!response.ok) throw new Error("collectible-fetch-failed");
  const blob = await response.blob();
  if (!blob || !blob.size) throw new Error("collectible-empty-blob");
  return blob;
}

function collectibleBlobToDataUrl(blob) {
  return new Promise((resolve) => {
    if (!blob) {
      resolve("");
      return;
    }
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result || ""));
    reader.onerror = () => resolve("");
    reader.readAsDataURL(blob);
  });
}

async function collectibleImageAsDataUrl(imageUrl, mimeHint = "") {
  const source = String(imageUrl || "").trim();
  if (!source) return "";
  if (/^data:image\//i.test(source)) return source;
  try {
    const blob = await spiritCollectibleBlobFromUrl(source, mimeHint);
    return await collectibleBlobToDataUrl(blob);
  } catch (_err) {
    return "";
  }
}

function spiritShareProfileSnapshot() {
  const typedKnown = parseKnownArtists(knownArtistsEl ? knownArtistsEl.value : "");
  const knownUnion = new Set([...typedKnown, ...knownArtistsMemory]);
  return {
    status: resolveProfileStatusLabel(),
    likedArtists: Math.max(0, Number(adaptiveModel?.likedArtists?.size) || 0),
    discoveredInApp: Math.max(0, Number(discoveredArtistsInApp?.size) || 0),
    knownArtists: Math.max(0, Number(knownUnion.size) || 0)
  };
}

function buildSpiritShareStatusLine(snapshot) {
  return t("spiritCollectibleShareStatusLine", {
    status: snapshot?.status || t("summaryStatusNew"),
    liked: Math.max(0, Number(snapshot?.likedArtists) || 0),
    discovered: Math.max(0, Number(snapshot?.discoveredInApp) || 0),
    known: Math.max(0, Number(snapshot?.knownArtists) || 0)
  });
}

function buildSpiritCollectibleStatusCompact(snapshot) {
  const liked = Math.max(0, Number(snapshot?.likedArtists) || 0);
  const discovered = Math.max(0, Number(snapshot?.discoveredInApp) || 0);
  const known = Math.max(0, Number(snapshot?.knownArtists) || 0);
  if (currentLanguage === "en") return `In app ${discovered} • Known ${known} • Liked ${liked}`;
  if (currentLanguage === "es") return `En app ${discovered} • Conocidos ${known} • Likes ${liked}`;
  return `No app ${discovered} • Conhecidos ${known} • Curtidos ${liked}`;
}

const STORY_SHARE_WIDTH = 1080;
const STORY_SHARE_HEIGHT = 1920;

async function renderImageDataUrlToPng(sourceImageUrl = "", width = STORY_SHARE_WIDTH, height = STORY_SHARE_HEIGHT) {
  const safeSource = String(sourceImageUrl || "").trim();
  if (!safeSource) return "";
  try {
    const image = await loadImageElementFromSource(safeSource);
    if (
      typeof document === "undefined" ||
      typeof HTMLCanvasElement === "undefined"
    ) return "";
    const canvas = document.createElement("canvas");
    canvas.width = Math.max(1, Number(width) || STORY_SHARE_WIDTH);
    canvas.height = Math.max(1, Number(height) || STORY_SHARE_HEIGHT);
    const ctx = canvas.getContext("2d");
    if (!ctx) return "";
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.drawImage(image, 0, 0, canvas.width, canvas.height);
    return canvas.toDataURL("image/png");
  } catch (_err) {
    return "";
  }
}

function spiritTopStyleKeys(spirit, limit = 2) {
  return Object.entries(spirit?.styleWeights || {})
    .sort((a, b) => b[1] - a[1])
    .slice(0, limit)
    .map(([style]) => style)
    .filter(Boolean);
}

function storyBpmCompactText(styleKey = "") {
  const bpm = STYLE_BPM_RULES[styleKey];
  if (bpm && Number.isFinite(bpm.min) && Number.isFinite(bpm.max)) {
    return `${bpm.min}-${bpm.max} BPM`;
  }
  if (currentLanguage === "en") return "Flexible BPM";
  if (currentLanguage === "es") return "BPM flexible";
  return "BPM flexível";
}

function storyGenreNarrativeByStyle(styleKey = "") {
  const style = String(styleKey || "").trim();
  const family = familyOf(style);

  if (currentLanguage === "en") {
    const direct = {
      psycore: "Dense low-end, fast BPM, and dry edits create relentless dancefloor pressure.",
      hi_tech: "Extreme speed, surgical kicks, and constant micro-variation keep the tension on edge.",
      dark_psy: "Heavy sub-bass, dark layers, and nocturnal progression with high-impact drive.",
      dark_experimental: "Shadowy textures, dense ambience, and unpredictable cuts with strong low-end weight.",
      slambient: "Ritual dark atmosphere, dense drones, and hypnotic pulse with deep bass pressure."
    };
    if (direct[style]) return direct[style];
    const byFamily = {
      psytrance: "Thick bass, hypnotic progression, and psychedelic atmosphere built for immersive danceflow.",
      techno: "Steady pressure, repetitive pulse, and controlled low-end architecture for sustained tension.",
      dnb: "Fast breakbeats, weighty sub-bass, and aggressive rhythmic movement.",
      bass_music: "Low-end impact first, broken rhythms, and high-contrast texture.",
      house: "Groove-led low-end, steady pulse, and warm dancefloor momentum.",
      leftfield: "Experimental textures, evolving ambience, and non-linear rhythmic identity.",
      hard_dance: "Hard kick focus, aggressive transients, and peak-time intensity."
    };
    return byFamily[family] || "Electronic profile focused on texture, low-end impact, and dancefloor tension.";
  }

  if (currentLanguage === "es") {
    const direct = {
      psycore: "Subgrave denso, BPM acelerado y recortes secos para una presión constante de pista.",
      hi_tech: "Velocidad extrema, kick quirúrgico y microvariaciones para tensión continua.",
      dark_psy: "Subgrave pesado, capas oscuras y progresión nocturna de alta intensidad.",
      dark_experimental: "Texturas sombrías, atmósfera densa y cambios imprevisibles con peso de graves.",
      slambient: "Atmósfera ritual oscura, drones densos y pulso hipnótico con grave profundo."
    };
    if (direct[style]) return direct[style];
    const byFamily = {
      psytrance: "Grave encorpado, progresión hipnótica y atmósfera psicodélica orientada a pista.",
      techno: "Presión constante, pulso repetitivo y arquitectura de grave controlada.",
      dnb: "Breakbeats rápidos, subgrave potente y alta densidad rítmica.",
      bass_music: "Impacto de grave en primer plano, ritmo quebrado y textura contrastada.",
      house: "Grave con groove, pulso estable y energía cálida de club.",
      leftfield: "Texturas experimentales, ambiencia evolutiva y ritmo menos lineal.",
      hard_dance: "Kick agresivo, transientes duros y energía de pico."
    };
    return byFamily[family] || "Perfil electrónico centrado en textura, grave e intensidad de pista.";
  }

  const direct = {
    psycore: "Graves densos, BPM acelerado e recortes secos criam pressão contínua para pista extrema.",
    hi_tech: "Velocidade alta, kick cirúrgico e microvariações mantêm a tensão no limite.",
    dark_psy: "Subgrave pesado, camadas sombrias e progressão noturna de alta intensidade.",
    dark_experimental: "Texturas obscuras, atmosfera densa e viradas imprevisíveis com peso de grave.",
    slambient: "Atmosfera ritual escura, drones densos e pulso hipnótico com baixa frequência marcada."
  };
  if (direct[style]) return direct[style];
  const byFamily = {
    psytrance: "Baixo encorpado, progressão hipnótica e atmosfera psicodélica orientada à pista.",
    techno: "Pressão contínua, pulso repetitivo e arquitetura de grave controlada.",
    dnb: "Breaks acelerados, subgrave forte e alta densidade rítmica.",
    bass_music: "Impacto de grave em primeiro plano, ritmo quebrado e textura contrastada.",
    house: "Groove de baixo marcado, pulso estável e calor de pista.",
    leftfield: "Texturas experimentais, ambiência evolutiva e ritmo menos linear.",
    hard_dance: "Kick agressivo, transientes secos e energia de pico."
  };
  return byFamily[family] || "Perfil eletrônico com foco em textura, grave e tensão de pista.";
}

function buildSpiritStoryGenreSummary(spirit) {
  const dominantStyleKey = spiritTopStyleKeys(spirit, 1)[0] || "";
  const dominantStyleLabel = dominantStyleKey ? styleLabelByValue(dominantStyleKey) : t("freeStyle");
  const bpmText = storyBpmCompactText(dominantStyleKey);
  return {
    style: dominantStyleKey,
    headline: normalizeInlineText([dominantStyleLabel, bpmText].filter(Boolean).join(" • ")),
    narrative: storyGenreNarrativeByStyle(dominantStyleKey)
  };
}

function resolveSpiritNarrativeProfile(spirit) {
  const dominantStyleKey = spiritTopStyleKeys(spirit, 1)[0] || "";
  const dominantStyle = dominantStyleKey ? styleLabelByValue(dominantStyleKey) : t("freeStyle");
  const bpmText = storyBpmCompactText(dominantStyleKey);
  const topStyles = spiritTopStyles(spirit, 3);
  const styleSignature = normalizeInlineText([dominantStyle, bpmText].filter(Boolean).join(" "));
  return {
    dominantStyleKey,
    dominantStyle,
    bpmText,
    topStyles,
    styleSignature,
    genreNarrative: storyGenreNarrativeByStyle(dominantStyleKey)
  };
}

function buildSpiritPanelNarrative(spirit, spiritText = {}) {
  const baseDescription = normalizeInlineText(spiritText?.description || "");
  if (baseDescription) return baseDescription;

  const profile = resolveSpiritNarrativeProfile(spirit);
  if (currentLanguage === "en") {
    return normalizeInlineText(
      [
        `Your profile is anchored in ${profile.styleSignature || "electronic curation"}.`,
        profile.genreNarrative
      ]
        .filter(Boolean)
        .join(" ")
    );
  }
  if (currentLanguage === "es") {
    return normalizeInlineText(
      [
        `Tu perfil se apoya en ${profile.styleSignature || "curaduría electrónica"}.`,
        profile.genreNarrative
      ]
        .filter(Boolean)
        .join(" ")
    );
  }
  return normalizeInlineText(
    [
      `Seu perfil se apoia em ${profile.styleSignature || "curadoria eletrônica"}.`,
      profile.genreNarrative
    ]
      .filter(Boolean)
      .join(" ")
  );
}

function buildSpiritCollectibleCopy(spirit, spiritText = {}) {
  const shortCopy = normalizeInlineText(spiritText?.cardDescription || spiritText?.collectibleDescription || "");
  if (shortCopy) return shortCopy;

  const profile = resolveSpiritNarrativeProfile(spirit);
  const topStylesLine = profile.topStyles.join(" • ");

  if (currentLanguage === "en") {
    return normalizeInlineText(
      [
        spiritText?.archetype || "",
        topStylesLine || "",
        profile.styleSignature || ""
      ]
        .filter(Boolean)
        .join(" • ")
    );
  }

  if (currentLanguage === "es") {
    return normalizeInlineText(
      [
        spiritText?.archetype || "",
        topStylesLine || "",
        profile.styleSignature || ""
      ]
        .filter(Boolean)
        .join(" • ")
    );
  }

  return normalizeInlineText(
    [
      spiritText?.archetype || "",
      topStylesLine || "",
      profile.styleSignature || ""
    ]
      .filter(Boolean)
      .join(" • ")
  );
}

function buildSpiritCollectibleDetailsText(spirit, spiritText, likes, milestoneLikes) {
  const profile = resolveSpiritNarrativeProfile(spirit);
  const rankLabel = t(resolveSpiritRank(likes).current.key);
  const topStylesLine = profile.topStyles.join(" • ");
  const snapshot = spiritShareProfileSnapshot();
  const liked = Math.max(0, Number(snapshot?.likedArtists) || 0);
  const discovered = Math.max(0, Number(snapshot?.discoveredInApp) || 0);
  const known = Math.max(0, Number(snapshot?.knownArtists) || 0);
  if (currentLanguage === "pt") {
    return normalizeInlineText(
      [
        spiritText?.name || "",
        spiritText?.archetype ? `Personalidade musical: ${spiritText.archetype}` : "",
        topStylesLine ? `Assinatura sonora: ${topStylesLine}` : "",
        profile.bpmText ? `Faixa de BPM: ${profile.bpmText}` : "",
        `Status: conheceu no app ${discovered} • conhece ${known} no total • curte ${liked}`,
        `${rankLabel} • ${milestoneLikes} likes | ${likes} total`
      ]
        .filter(Boolean)
        .join(" • ")
    );
  }
  if (currentLanguage === "en") {
    return normalizeInlineText(
      [
        spiritText?.name || "",
        spiritText?.archetype || "",
        topStylesLine || "",
        profile.bpmText || "",
        `Status: discovered in app ${discovered} • known total ${known} • liked ${liked}`,
        `${rankLabel} • ${milestoneLikes} likes | ${likes} total`
      ]
        .filter(Boolean)
        .join(" • ")
    );
  }
  if (currentLanguage === "es") {
    return normalizeInlineText(
      [
        spiritText?.name || "",
        spiritText?.archetype || "",
        topStylesLine || "",
        profile.bpmText || "",
        `Estado: descubrió en app ${discovered} • conoce ${known} total • likes ${liked}`,
        `${rankLabel} • ${milestoneLikes} likes | ${likes} total`
      ]
        .filter(Boolean)
        .join(" • ")
    );
  }
  return normalizeInlineText(
    [
      spiritText?.name || "",
      spiritText?.archetype || "",
      topStylesLine,
      profile.bpmText || "",
      `Status: app ${discovered} • known ${known} • liked ${liked}`,
      `${rankLabel} • ${milestoneLikes} likes | ${likes} total`
    ]
      .filter(Boolean)
      .join(" • ")
  );
}

function buildSpiritShareDetailsLine(spirit, spiritText, likes, milestoneLikes) {
  const rankLabel = t(resolveSpiritRank(likes).current.key);
  const dominantStyleKey = spiritTopStyleKeys(spirit, 1)[0] || "";
  const dominantStyle = dominantStyleKey ? styleLabelByValue(dominantStyleKey) : "";
  const bpmText = storyBpmCompactText(dominantStyleKey);
  return normalizeInlineText([
    spiritText?.archetype || spiritText?.name || "",
    dominantStyle ? `${dominantStyle} ${bpmText}` : bpmText,
    rankLabel,
    `${milestoneLikes} likes`
  ].filter(Boolean).join(" • "));
}

function resolveRuntimeAssetUrl(source = "") {
  const value = String(source || "").trim();
  if (!value) return "";
  if (/^(data:|blob:|https?:|file:)/i.test(value)) return value;
  try {
    return new URL(value, window.location.href).href;
  } catch (_err) {
    return value;
  }
}

function loadImageElementFromSource(source = "") {
  return new Promise((resolve, reject) => {
    const safeSource = String(source || "").trim();
    if (!safeSource) {
      reject(new Error("image-empty-source"));
      return;
    }
    const image = new Image();
    image.decoding = "async";
    image.onload = () => resolve(image);
    image.onerror = () => reject(new Error("image-load-failed"));
    image.src = safeSource;
  });
}

function setImageSourceWithFallback(imageEl, source = "", fallback = "", { onFallback = null } = {}) {
  if (!imageEl) return false;
  const primarySrc = resolveRuntimeAssetUrl(source);
  const fallbackSrc = resolveRuntimeAssetUrl(fallback);
  if (!primarySrc && !fallbackSrc) {
    imageEl.removeAttribute("src");
    return false;
  }

  const fallbackClass = "asset-fallback";
  imageEl.dataset.fallbackApplied = "0";
  imageEl.onerror = () => {
    if (imageEl.dataset.fallbackApplied === "1") return;
    imageEl.dataset.fallbackApplied = "1";
    imageEl.classList.add(fallbackClass);
    if (fallbackSrc && imageEl.src !== fallbackSrc) {
      imageEl.src = fallbackSrc;
    }
    if (typeof onFallback === "function") onFallback();
  };
  imageEl.onload = () => {
    if (imageEl.dataset.fallbackApplied !== "1") {
      imageEl.classList.remove(fallbackClass);
    }
  };
  imageEl.src = primarySrc || fallbackSrc;
  return true;
}

function canvasRoundedRectPath(ctx, x, y, width, height, radius) {
  const safeRadius = Math.max(0, Math.min(Number(radius) || 0, width / 2, height / 2));
  ctx.beginPath();
  ctx.moveTo(x + safeRadius, y);
  ctx.lineTo(x + width - safeRadius, y);
  ctx.quadraticCurveTo(x + width, y, x + width, y + safeRadius);
  ctx.lineTo(x + width, y + height - safeRadius);
  ctx.quadraticCurveTo(x + width, y + height, x + width - safeRadius, y + height);
  ctx.lineTo(x + safeRadius, y + height);
  ctx.quadraticCurveTo(x, y + height, x, y + height - safeRadius);
  ctx.lineTo(x, y + safeRadius);
  ctx.quadraticCurveTo(x, y, x + safeRadius, y);
  ctx.closePath();
}

function drawImageCover(ctx, image, x, y, width, height) {
  const safeWidth = Math.max(1, Number(width) || 1);
  const safeHeight = Math.max(1, Number(height) || 1);
  const imageWidth = Math.max(1, Number(image?.naturalWidth || image?.width) || 1);
  const imageHeight = Math.max(1, Number(image?.naturalHeight || image?.height) || 1);
  const scale = Math.max(safeWidth / imageWidth, safeHeight / imageHeight);
  const drawWidth = imageWidth * scale;
  const drawHeight = imageHeight * scale;
  const drawX = x + (safeWidth - drawWidth) / 2;
  const drawY = y + (safeHeight - drawHeight) / 2;
  ctx.drawImage(image, drawX, drawY, drawWidth, drawHeight);
}

function drawImageContain(ctx, image, x, y, width, height, padding = 0) {
  const safeWidth = Math.max(1, Number(width) || 1);
  const safeHeight = Math.max(1, Number(height) || 1);
  const safePadding = Math.max(0, Number(padding) || 0);
  const innerWidth = Math.max(1, safeWidth - safePadding * 2);
  const innerHeight = Math.max(1, safeHeight - safePadding * 2);
  const imageWidth = Math.max(1, Number(image?.naturalWidth || image?.width) || 1);
  const imageHeight = Math.max(1, Number(image?.naturalHeight || image?.height) || 1);
  const scale = Math.min(innerWidth / imageWidth, innerHeight / imageHeight);
  const drawWidth = imageWidth * scale;
  const drawHeight = imageHeight * scale;
  const drawX = x + safePadding + (innerWidth - drawWidth) / 2;
  const drawY = y + safePadding + (innerHeight - drawHeight) / 2;
  ctx.drawImage(image, drawX, drawY, drawWidth, drawHeight);
}

function buildSpiritStoryShareImage(baseImageDataUrl, spiritImageDataUrl, spiritText, snapshot, likes, milestoneLikes, detailsLine = "", genreSummary = null) {
  const safeBaseImage = String(baseImageDataUrl || "").trim();
  const hasBaseImage = /^data:image\//i.test(safeBaseImage);
  const safeSpiritImage = String(spiritImageDataUrl || "").trim();
  const hasSpiritImage = /^data:image\//i.test(safeSpiritImage);
  if (!hasBaseImage && !hasSpiritImage) return "";

  const rankLabel = t(resolveSpiritRank(likes).current.key);
  const spiritTitle = spiritText?.name || "Sonic Spirit";
  const spiritSub = spiritText?.archetype || "";
  const spiritTitleLines = splitIntoSvgLines(spiritTitle, 20, 2);
  const spiritSubLines = splitIntoSvgLines(spiritSub, 34, 2);
  const statusLine = buildSpiritShareStatusLine(snapshot);
  const statusLines = splitIntoSvgLines(statusLine, 48, 2);
  const cleanDetailsLine = normalizeInlineText(detailsLine);
  const detailLines = splitIntoSvgLines(cleanDetailsLine, 48, 2);
  const genreHeadline = normalizeInlineText(genreSummary?.headline || "");
  const genreNarrative = normalizeInlineText(genreSummary?.narrative || "");
  const genreHeadlineLine = splitIntoSvgLines(genreHeadline, 48, 1);
  const genreNarrativeLines = splitIntoSvgLines(genreNarrative, 48, 2);
  const storyTitle = t("spiritCollectibleShareStoryTitle");
  const heroImage = hasSpiritImage ? safeSpiritImage : safeBaseImage;
  const heroPreserve = hasSpiritImage ? "xMidYMid meet" : "xMidYMid slice";

  const svg = `
<svg xmlns="http://www.w3.org/2000/svg" width="${STORY_SHARE_WIDTH}" height="${STORY_SHARE_HEIGHT}" viewBox="0 0 1080 1920">
  <defs>
    <linearGradient id="storyBg" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#050a1e" />
      <stop offset="48%" stop-color="#0b2145" />
      <stop offset="100%" stop-color="#27124a" />
    </linearGradient>
    <linearGradient id="storyPanel" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="rgba(7, 18, 40, 0.94)" />
      <stop offset="100%" stop-color="rgba(9, 28, 56, 0.84)" />
    </linearGradient>
    <linearGradient id="storyHeroPanel" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="rgba(5, 16, 38, 0.9)" />
      <stop offset="100%" stop-color="rgba(10, 34, 74, 0.64)" />
    </linearGradient>
    <linearGradient id="storyStroke" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#73ffe2" stop-opacity="0.7" />
      <stop offset="100%" stop-color="#7bc4ff" stop-opacity="0.42" />
    </linearGradient>
    <radialGradient id="storyGlow" cx="20%" cy="10%" r="55%">
      <stop offset="0%" stop-color="#69ffe0" stop-opacity="0.4" />
      <stop offset="100%" stop-color="#69ffe0" stop-opacity="0" />
    </radialGradient>
    <clipPath id="storyHeroClip">
      <rect x="122" y="214" width="836" height="836" rx="42" />
    </clipPath>
    <filter id="storyDropShadow" x="-20%" y="-20%" width="140%" height="140%">
      <feDropShadow dx="0" dy="7" stdDeviation="8" flood-color="#020814" flood-opacity="0.56" />
    </filter>
  </defs>
  <rect width="${STORY_SHARE_WIDTH}" height="${STORY_SHARE_HEIGHT}" fill="url(#storyBg)" />
  <rect width="${STORY_SHARE_WIDTH}" height="${STORY_SHARE_HEIGHT}" fill="url(#storyGlow)" />
  <rect x="64" y="116" width="952" height="1028" rx="46" fill="url(#storyHeroPanel)" stroke="url(#storyStroke)" stroke-width="3" />
  ${hasBaseImage ? `<image href="${escapeSvgText(safeBaseImage)}" x="64" y="116" width="952" height="1028" preserveAspectRatio="xMidYMid slice" opacity="0.16" />` : ""}
  <circle cx="540" cy="616" r="386" fill="url(#storyGlow)" opacity="0.88" />
  <rect x="122" y="214" width="836" height="836" rx="42" fill="#07142f" fill-opacity="0.74" stroke="url(#storyStroke)" stroke-opacity="0.7" stroke-width="2.4" />
  <g transform-origin="540 632">
    <animateTransform attributeName="transform" type="translate" values="0 0;0 -14;0 0" dur="2.6s" repeatCount="indefinite" />
    <animateTransform attributeName="transform" additive="sum" type="scale" values="1;1.02;1" dur="1.8s" repeatCount="indefinite" />
    <image href="${escapeSvgText(heroImage)}" x="122" y="214" width="836" height="836" preserveAspectRatio="${heroPreserve}" clip-path="url(#storyHeroClip)" filter="url(#storyDropShadow)" />
  </g>
  <circle cx="540" cy="632" r="350" fill="none" stroke="#6effe0" stroke-opacity="0.34" stroke-width="4" />
  <circle cx="540" cy="632" r="272" fill="none" stroke="#6a9dff" stroke-opacity="0.36" stroke-width="3" />
  <circle cx="540" cy="632" r="196" fill="none" stroke="#854eff" stroke-opacity="0.28" stroke-width="2.4" />
  <g fill="#7df6ff">
    <rect x="318" y="1032" width="34" height="26" rx="10"><animate attributeName="height" values="26;88;40;76;26" dur="1.6s" repeatCount="indefinite" /><animate attributeName="y" values="1032;970;1018;982;1032" dur="1.6s" repeatCount="indefinite" /></rect>
    <rect x="368" y="1032" width="34" height="26" rx="10"><animate attributeName="height" values="26;76;34;92;26" dur="1.9s" repeatCount="indefinite" /><animate attributeName="y" values="1032;982;1024;966;1032" dur="1.9s" repeatCount="indefinite" /></rect>
    <rect x="418" y="1032" width="34" height="26" rx="10"><animate attributeName="height" values="26;104;46;82;26" dur="1.45s" repeatCount="indefinite" /><animate attributeName="y" values="1032;954;1012;974;1032" dur="1.45s" repeatCount="indefinite" /></rect>
    <rect x="468" y="1032" width="34" height="26" rx="10"><animate attributeName="height" values="26;82;34;98;26" dur="1.7s" repeatCount="indefinite" /><animate attributeName="y" values="1032;974;1024;958;1032" dur="1.7s" repeatCount="indefinite" /></rect>
    <rect x="518" y="1032" width="34" height="26" rx="10"><animate attributeName="height" values="26;96;38;88;26" dur="2.05s" repeatCount="indefinite" /><animate attributeName="y" values="1032;960;1020;968;1032" dur="2.05s" repeatCount="indefinite" /></rect>
    <rect x="568" y="1032" width="34" height="26" rx="10"><animate attributeName="height" values="26;78;32;90;26" dur="1.52s" repeatCount="indefinite" /><animate attributeName="y" values="1032;978;1026;966;1032" dur="1.52s" repeatCount="indefinite" /></rect>
    <rect x="618" y="1032" width="34" height="26" rx="10"><animate attributeName="height" values="26;92;36;80;26" dur="1.85s" repeatCount="indefinite" /><animate attributeName="y" values="1032;964;1022;978;1032" dur="1.85s" repeatCount="indefinite" /></rect>
    <rect x="668" y="1032" width="34" height="26" rx="10"><animate attributeName="height" values="26;74;34;86;26" dur="1.66s" repeatCount="indefinite" /><animate attributeName="y" values="1032;982;1024;972;1032" dur="1.66s" repeatCount="indefinite" /></rect>
  </g>
  <text x="104" y="1098" fill="#7adfff" font-size="30" font-family="Chakra Petch, Arial, sans-serif" font-weight="700">${escapeSvgText(rankLabel)} • ${escapeSvgText(`${milestoneLikes} likes`)}</text>

  <rect x="64" y="1148" width="952" height="708" rx="42" fill="url(#storyPanel)" stroke="url(#storyStroke)" stroke-width="2" />
  <text x="104" y="1236" fill="#9fd8ff" font-size="40" font-family="Chakra Petch, Arial, sans-serif" font-weight="700">${escapeSvgText(storyTitle)}</text>
  <text x="104" y="1308" fill="#f1fbff" font-size="64" font-family="Syne, Arial, sans-serif" font-weight="700">${escapeSvgText(spiritTitleLines[0] || "")}</text>
  <text x="104" y="1370" fill="#f1fbff" font-size="64" font-family="Syne, Arial, sans-serif" font-weight="700">${escapeSvgText(spiritTitleLines[1] || "")}</text>
  <text x="104" y="1426" fill="#bfe9ff" font-size="34" font-family="Chakra Petch, Arial, sans-serif" font-weight="600">${escapeSvgText(spiritSubLines[0] || "")}</text>
  <text x="104" y="1468" fill="#bfe9ff" font-size="34" font-family="Chakra Petch, Arial, sans-serif" font-weight="600">${escapeSvgText(spiritSubLines[1] || "")}</text>
  <text x="104" y="1524" fill="#d2ecff" font-size="29" font-family="Chakra Petch, Arial, sans-serif">${escapeSvgText(`${milestoneLikes} likes | ${likes} total`)}</text>
  <text x="104" y="1576" fill="#d4ebff" font-size="25" font-family="Chakra Petch, Arial, sans-serif">${escapeSvgText(detailLines[0] || "")}</text>
  <text x="104" y="1614" fill="#d4ebff" font-size="25" font-family="Chakra Petch, Arial, sans-serif">${escapeSvgText(detailLines[1] || "")}</text>
  <text x="104" y="1662" fill="#9ee8ff" font-size="25" font-family="Chakra Petch, Arial, sans-serif">${escapeSvgText(genreHeadlineLine[0] || "")}</text>
  <text x="104" y="1704" fill="#d6ecff" font-size="24" font-family="Chakra Petch, Arial, sans-serif">${escapeSvgText(genreNarrativeLines[0] || "")}</text>
  <text x="104" y="1740" fill="#d6ecff" font-size="24" font-family="Chakra Petch, Arial, sans-serif">${escapeSvgText(genreNarrativeLines[1] || "")}</text>
  <text x="104" y="1792" fill="#d7eaff" font-size="25" font-family="Chakra Petch, Arial, sans-serif">${escapeSvgText(statusLines[0] || "")}</text>
  <text x="104" y="1828" fill="#d7eaff" font-size="25" font-family="Chakra Petch, Arial, sans-serif">${escapeSvgText(statusLines[1] || "")}</text>
  <text x="104" y="1848" fill="#82d8ff" font-size="24" font-family="Chakra Petch, Arial, sans-serif">Sonic Search • Music Sommelier</text>
</svg>`;

  return `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(svg)}`;
}

async function buildSpiritStoryShareVideo({
  baseImageDataUrl = "",
  spiritImageDataUrl = "",
  spiritText = {},
  snapshot = {},
  likes = 0,
  milestoneLikes = 0,
  detailsLine = "",
  genreSummary = null
} = {}) {
  const safeBaseImage = String(baseImageDataUrl || "").trim();
  const safeSpiritImage = String(spiritImageDataUrl || "").trim();
  if (!safeBaseImage && !safeSpiritImage) return null;
  if (
    typeof window === "undefined" ||
    typeof document === "undefined" ||
    typeof window.MediaRecorder !== "function" ||
    typeof HTMLCanvasElement === "undefined" ||
    typeof HTMLCanvasElement.prototype.captureStream !== "function"
  ) {
    return null;
  }

  let baseImage = null;
  if (safeBaseImage) {
    try {
      baseImage = await loadImageElementFromSource(safeBaseImage);
    } catch (_err) {
      baseImage = null;
    }
  }

  let spiritImage = null;
  if (safeSpiritImage) {
    try {
      spiritImage = await loadImageElementFromSource(safeSpiritImage);
    } catch (_err) {
      spiritImage = null;
    }
  }
  const heroImage = spiritImage || baseImage;
  if (!heroImage) return null;

  const mimeCandidates = [
    "video/webm;codecs=vp9",
    "video/webm;codecs=vp8",
    "video/webm",
    "video/mp4"
  ];
  let selectedMime = "";
  if (typeof window.MediaRecorder.isTypeSupported === "function") {
    selectedMime = mimeCandidates.find((candidate) => {
      try {
        return window.MediaRecorder.isTypeSupported(candidate);
      } catch (_err) {
        return false;
      }
    }) || "";
  }

  const canvas = document.createElement("canvas");
  canvas.width = STORY_SHARE_WIDTH;
  canvas.height = STORY_SHARE_HEIGHT;
  const ctx = canvas.getContext("2d");
  if (!ctx) return null;

  const stream = canvas.captureStream(30);
  const chunks = [];
  const stopPromise = new Promise((resolve) => {
    let recorder;
    try {
      recorder = selectedMime
        ? new window.MediaRecorder(stream, { mimeType: selectedMime, videoBitsPerSecond: 7000000 })
        : new window.MediaRecorder(stream, { videoBitsPerSecond: 7000000 });
    } catch (_err) {
      resolve(null);
      return;
    }

    recorder.ondataavailable = (event) => {
      if (event?.data?.size) chunks.push(event.data);
    };
    recorder.onerror = () => resolve(null);
    recorder.onstop = () => resolve(recorder.mimeType || selectedMime || "video/webm");

    try {
      recorder.start(220);
    } catch (_err) {
      resolve(null);
      return;
    }

    const rankLabel = t(resolveSpiritRank(likes).current.key);
    const storyTitle = t("spiritCollectibleShareStoryTitle");
    const spiritTitle = spiritText?.name || "Sonic Spirit";
    const spiritSub = spiritText?.archetype || "";
    const spiritTitleLines = splitIntoSvgLines(spiritTitle, 20, 2);
    const spiritSubLines = splitIntoSvgLines(spiritSub, 34, 2);
    const statusLine = buildSpiritShareStatusLine(snapshot);
    const statusLines = splitIntoSvgLines(statusLine, 48, 2);
    const detailText = normalizeInlineText(detailsLine);
    const detailLines = splitIntoSvgLines(detailText, 48, 2);
    const genreHeadline = normalizeInlineText(genreSummary?.headline || "");
    const genreNarrative = normalizeInlineText(genreSummary?.narrative || "");
    const genreHeadlineLine = splitIntoSvgLines(genreHeadline, 48, 1);
    const genreNarrativeLines = splitIntoSvgLines(genreNarrative, 48, 2);
    const symbols = ["☠", "⚡", "🔊", "🎛", "▁▃▆█", "▂▄▇"];
    const startedAt = (typeof performance !== "undefined" && typeof performance.now === "function")
      ? performance.now()
      : Date.now();
    const durationMs = 5000;

    const drawFrame = (elapsedMs) => {
      const elapsed = Math.max(0, elapsedMs) / 1000;
      const pulse = 0.5 + 0.5 * Math.sin(elapsed * 3.2);
      const floatY = Math.sin(elapsed * 2.4) * 13;
      const tilt = Math.sin(elapsed * 1.9) * 0.033;

      const bg = ctx.createLinearGradient(0, 0, STORY_SHARE_WIDTH, STORY_SHARE_HEIGHT);
      bg.addColorStop(0, "#050a1e");
      bg.addColorStop(0.5, "#0b2145");
      bg.addColorStop(1, "#27124a");
      ctx.fillStyle = bg;
      ctx.fillRect(0, 0, STORY_SHARE_WIDTH, STORY_SHARE_HEIGHT);

      const glow = ctx.createRadialGradient(200, 180, 90, 260, 230, 760);
      glow.addColorStop(0, "rgba(105, 255, 224, 0.42)");
      glow.addColorStop(1, "rgba(105, 255, 224, 0)");
      ctx.fillStyle = glow;
      ctx.fillRect(0, 0, STORY_SHARE_WIDTH, STORY_SHARE_HEIGHT);

      const heroPanel = ctx.createLinearGradient(64, 116, 1016, 1144);
      heroPanel.addColorStop(0, "rgba(5, 16, 38, 0.9)");
      heroPanel.addColorStop(1, "rgba(10, 34, 74, 0.64)");
      ctx.fillStyle = heroPanel;
      canvasRoundedRectPath(ctx, 64, 116, 952, 1028, 46);
      ctx.fill();
      ctx.strokeStyle = "rgba(122, 226, 255, 0.62)";
      ctx.lineWidth = 3;
      canvasRoundedRectPath(ctx, 64, 116, 952, 1028, 46);
      ctx.stroke();

      if (baseImage) {
        ctx.save();
        canvasRoundedRectPath(ctx, 64, 116, 952, 1028, 46);
        ctx.clip();
        ctx.globalAlpha = 0.16;
        drawImageCover(ctx, baseImage, 64, 116, 952, 1028);
        ctx.globalAlpha = 1;
        ctx.restore();
      }

      const halo = ctx.createRadialGradient(540, 616, 80, 540, 616, 408);
      halo.addColorStop(0, "rgba(111, 255, 226, 0.34)");
      halo.addColorStop(1, "rgba(111, 255, 226, 0)");
      ctx.fillStyle = halo;
      ctx.beginPath();
      ctx.arc(540, 616, 388, 0, Math.PI * 2);
      ctx.fill();

      ctx.save();
      canvasRoundedRectPath(ctx, 122, 214, 836, 836, 42);
      ctx.clip();
      ctx.fillStyle = "rgba(7, 20, 47, 0.74)";
      ctx.fillRect(122, 214, 836, 836);
      ctx.restore();
      const heroStroke = ctx.createLinearGradient(122, 214, 958, 1050);
      heroStroke.addColorStop(0, "rgba(115,255,226,0.72)");
      heroStroke.addColorStop(1, "rgba(123,196,255,0.45)");
      ctx.strokeStyle = heroStroke;
      ctx.lineWidth = 2.4;
      canvasRoundedRectPath(ctx, 122, 214, 836, 836, 42);
      ctx.stroke();

      const skullBaseX = 540;
      const skullBaseY = 632 + floatY;
      const skullSize = 812 + pulse * 10;
      ctx.save();
      ctx.translate(skullBaseX, skullBaseY);
      ctx.rotate(tilt);
      const skullGlow = ctx.createRadialGradient(0, 0, 20, 0, 0, 360 + pulse * 30);
      skullGlow.addColorStop(0, "rgba(126, 255, 231, 0.48)");
      skullGlow.addColorStop(1, "rgba(126, 255, 231, 0)");
      ctx.fillStyle = skullGlow;
      ctx.beginPath();
      ctx.arc(0, 0, 356 + pulse * 24, 0, Math.PI * 2);
      ctx.fill();
      const skullX = -skullSize / 2;
      const skullY = -skullSize / 2;
      canvasRoundedRectPath(ctx, skullX, skullY, skullSize, skullSize, 40);
      ctx.clip();
      if (spiritImage) {
        drawImageContain(ctx, spiritImage, skullX, skullY, skullSize, skullSize, 26);
      } else if (baseImage) {
        drawImageCover(ctx, baseImage, skullX, skullY, skullSize, skullSize);
      } else {
        ctx.fillStyle = "#0a1730";
        ctx.fillRect(skullX, skullY, skullSize, skullSize);
        ctx.fillStyle = "#dcf8ff";
        ctx.font = "700 220px Chakra Petch, Arial, sans-serif";
        ctx.textAlign = "center";
        ctx.fillText("☠", 0, 76);
      }
      ctx.restore();

      ctx.strokeStyle = "rgba(112, 255, 228, 0.34)";
      ctx.lineWidth = 4;
      ctx.beginPath();
      ctx.arc(540, 632, 350, 0, Math.PI * 2);
      ctx.stroke();
      ctx.strokeStyle = "rgba(106, 157, 255, 0.34)";
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.arc(540, 632, 272, 0, Math.PI * 2);
      ctx.stroke();
      ctx.strokeStyle = "rgba(133, 78, 255, 0.26)";
      ctx.lineWidth = 2.4;
      ctx.beginPath();
      ctx.arc(540, 632, 196, 0, Math.PI * 2);
      ctx.stroke();

      for (let i = 0; i < 8; i += 1) {
        const barHeight = 26 + Math.abs(Math.sin(elapsed * 4 + i * 0.86)) * 82;
        const x = 318 + i * 50;
        const y = 1058 - barHeight;
        const barGradient = ctx.createLinearGradient(x, y, x, 1058);
        barGradient.addColorStop(0, "rgba(125, 246, 255, 0.95)");
        barGradient.addColorStop(1, "rgba(125, 246, 255, 0.42)");
        ctx.fillStyle = barGradient;
        canvasRoundedRectPath(ctx, x, y, 34, barHeight, 10);
        ctx.fill();
      }

      ctx.fillStyle = "#7adfff";
      ctx.font = "700 30px Chakra Petch, Arial, sans-serif";
      ctx.textAlign = "left";
      ctx.fillText(`${rankLabel} • ${milestoneLikes} likes`, 104, 1098);

      symbols.forEach((symbol, index) => {
        const x = 754 + Math.sin(elapsed * 0.9 + index * 0.82) * 146;
        const y = 272 + index * 118 + Math.cos(elapsed * 1.2 + index) * 24;
        const alpha = 0.18 + 0.24 * (0.5 + 0.5 * Math.sin(elapsed * 1.4 + index));
        ctx.globalAlpha = alpha;
        ctx.fillStyle = "#95dfff";
        ctx.font = `${38 - index * 3}px Chakra Petch, Arial, sans-serif`;
        ctx.fillText(symbol, x, y);
      });
      ctx.globalAlpha = 1;

      const panel = ctx.createLinearGradient(64, 1188, 1016, 1816);
      panel.addColorStop(0, "rgba(7, 18, 40, 0.94)");
      panel.addColorStop(1, "rgba(9, 28, 56, 0.84)");
      ctx.fillStyle = panel;
      canvasRoundedRectPath(ctx, 64, 1148, 952, 708, 42);
      ctx.fill();
      ctx.strokeStyle = "rgba(122, 222, 255, 0.56)";
      ctx.lineWidth = 2;
      canvasRoundedRectPath(ctx, 64, 1148, 952, 708, 42);
      ctx.stroke();

      ctx.fillStyle = "#9fd8ff";
      ctx.font = "700 40px Chakra Petch, Arial, sans-serif";
      ctx.fillText(storyTitle, 104, 1236);
      ctx.fillStyle = "#f1fbff";
      ctx.font = "700 64px Syne, Arial, sans-serif";
      ctx.fillText(spiritTitleLines[0] || "", 104, 1308);
      ctx.fillText(spiritTitleLines[1] || "", 104, 1370);
      ctx.fillStyle = "#bfe9ff";
      ctx.font = "600 34px Chakra Petch, Arial, sans-serif";
      ctx.fillText(spiritSubLines[0] || "", 104, 1426);
      ctx.fillText(spiritSubLines[1] || "", 104, 1468);
      ctx.fillStyle = "#d2ecff";
      ctx.font = "29px Chakra Petch, Arial, sans-serif";
      ctx.fillText(`${milestoneLikes} likes | ${likes} total`, 104, 1524);
      ctx.fillStyle = "#d4ebff";
      ctx.font = "25px Chakra Petch, Arial, sans-serif";
      ctx.fillText(detailLines[0] || "", 104, 1576);
      ctx.fillText(detailLines[1] || "", 104, 1614);
      ctx.fillStyle = "#9ee8ff";
      ctx.font = "25px Chakra Petch, Arial, sans-serif";
      ctx.fillText(genreHeadlineLine[0] || "", 104, 1662);
      ctx.fillStyle = "#d6ecff";
      ctx.font = "24px Chakra Petch, Arial, sans-serif";
      ctx.fillText(genreNarrativeLines[0] || "", 104, 1704);
      ctx.fillText(genreNarrativeLines[1] || "", 104, 1740);
      ctx.fillStyle = "#d7eaff";
      ctx.font = "25px Chakra Petch, Arial, sans-serif";
      ctx.fillText(statusLines[0] || "", 104, 1792);
      ctx.fillText(statusLines[1] || "", 104, 1828);
      ctx.fillStyle = "#82d8ff";
      ctx.font = "24px Chakra Petch, Arial, sans-serif";
      ctx.fillText("Sonic Search • Music Sommelier", 104, 1848);
    };

    const renderLoop = (timestamp) => {
      const elapsed = Number(timestamp || 0) - startedAt;
      drawFrame(elapsed);
      if (elapsed >= durationMs) {
        if (recorder.state !== "inactive") recorder.stop();
        return;
      }
      if (typeof window.requestAnimationFrame === "function") {
        window.requestAnimationFrame(renderLoop);
      } else {
        window.setTimeout(() => renderLoop(Date.now()), 34);
      }
    };

    if (typeof window.requestAnimationFrame === "function") {
      window.requestAnimationFrame(renderLoop);
    } else {
      renderLoop(Date.now());
    }
  });

  const mimeType = await stopPromise;
  stream.getTracks().forEach((track) => track.stop());
  if (!mimeType || !chunks.length) return null;

  const normalizedMime = String(mimeType || "video/webm").split(";")[0] || "video/webm";
  const blob = new Blob(chunks, { type: normalizedMime });
  if (!blob.size) return null;

  return {
    url: URL.createObjectURL(blob),
    mime: normalizedMime,
    extension: normalizedMime.includes("mp4") ? "mp4" : "webm"
  };
}

async function prepareSpiritStoryAsset({ imageUrl = "", baseFilename = "" } = {}) {
  const safeImageUrl = String(imageUrl || "").trim();
  if (!safeImageUrl || safeImageUrl === "#") return null;

  const likes = totalPositiveLikes();
  const milestone = collectibleMilestoneForLikes(likes);
  const spirit = spiritById(currentSpiritId || "");
  const spiritText = localizedSpiritCopy(spirit) || {};
  const genreSummary = buildSpiritStoryGenreSummary(spirit);
  const fallbackDetailsLine = buildSpiritShareDetailsLine(spirit, spiritText, likes, milestone.likes);
  const detailsLine = normalizeInlineText(
    spiritCollectibleDetails?.textContent || fallbackDetailsLine
  );
  const snapshot = spiritShareProfileSnapshot();
  const statusLine = buildSpiritShareStatusLine(snapshot);
  const spiritImageSource = resolveRuntimeAssetUrl(spirit?.image || "");
  const { mime: spiritMime } = collectibleImageMeta(spiritImageSource);
  const spiritImageDataUrl = await collectibleImageAsDataUrl(spiritImageSource, spiritMime);
  const { mime } = collectibleImageMeta(safeImageUrl);
  const sourceImageDataUrl = await collectibleImageAsDataUrl(safeImageUrl, mime);
  const storyImageUrl =
    buildSpiritStoryShareImage(
      sourceImageDataUrl || safeImageUrl,
      spiritImageDataUrl,
      spiritText,
      snapshot,
      likes,
      milestone.likes,
      detailsLine,
      genreSummary
    ) ||
    sourceImageDataUrl ||
    safeImageUrl;

  const storyImagePng = await renderImageDataUrlToPng(
    storyImageUrl,
    STORY_SHARE_WIDTH,
    STORY_SHARE_HEIGHT
  );
  const fallbackPng = storyImagePng
    ? ""
    : await renderImageDataUrlToPng(
      sourceImageDataUrl || safeImageUrl,
      STORY_SHARE_WIDTH,
      STORY_SHARE_HEIGHT
    );
  const storyAssetUrl = storyImagePng || fallbackPng || storyImageUrl;
  const filename = spiritStoryFilename(baseFilename);
  const shareCaption = t("spiritCollectibleShareCaption", {
    spirit: spiritText?.name || t("spiritBadge")
  });
  const shareText = [shareCaption, detailsLine, genreSummary?.headline, genreSummary?.narrative, statusLine]
    .filter(Boolean)
    .join("\n");

  return {
    storyAssetUrl,
    storyAssetMime: "image/png",
    filename,
    shareText
  };
}

async function shareSpiritCollectibleToInstagram() {
  if (spiritCollectibleBusy) {
    showToast(t("spiritCollectibleGenerating"));
    return;
  }

  const imageUrl = String(
    spiritCollectibleShareInstagramBtn?.dataset.imageUrl ||
      spiritCollectibleImage?.getAttribute("src") ||
      spiritCollectibleDownload?.getAttribute("href") ||
      ""
  ).trim();

  if (!imageUrl || imageUrl === "#") {
    showToast(t("spiritCollectibleShareNoAsset"));
    return;
  }

  const baseFilename = String(
    spiritCollectibleDownload?.getAttribute("download") ||
      spiritCollectibleShareInstagramBtn?.dataset.filename ||
      spiritCollectibleFilename(currentSpiritId || "spirit", collectibleMilestoneForLikes(totalPositiveLikes()).likes, imageUrl)
  );
  const storyAsset = await prepareSpiritStoryAsset({ imageUrl, baseFilename });
  if (!storyAsset?.storyAssetUrl) {
    showToast(t("spiritCollectibleShareNoAsset"));
    return;
  }

  if (spiritCollectibleShareInstagramBtn) {
    spiritCollectibleShareInstagramBtn.disabled = true;
    spiritCollectibleShareInstagramBtn.textContent = t("spiritCollectibleSharePreparing");
  }

  try {
    let shared = false;
    const canUseNativeShare =
      typeof navigator !== "undefined" &&
      typeof navigator.share === "function" &&
      typeof window.File === "function";

    if (canUseNativeShare) {
      const blob = await spiritCollectibleBlobFromUrl(storyAsset.storyAssetUrl, storyAsset.storyAssetMime);
      const fileType = blob.type || storyAsset.storyAssetMime || "image/png";
      const file = new File([blob], storyAsset.filename, { type: fileType });
      const canShareFiles =
        typeof navigator.canShare !== "function" || navigator.canShare({ files: [file] });

      if (canShareFiles) {
        await navigator.share({
          title: "Sonic Search",
          text: storyAsset.shareText,
          files: [file]
        });
        shared = true;
      }
    }

    if (shared) {
      showToast(t("spiritCollectibleShareNativeDone"));
      return;
    }

    triggerSpiritCollectibleDownload(storyAsset.storyAssetUrl, storyAsset.filename);
    showToast(t("spiritCollectibleShareFallback"));
  } catch (error) {
    const canceled = error && error.name === "AbortError";
    if (canceled) {
      showToast(t("spiritCollectibleShareCanceled"));
      return;
    }
    triggerSpiritCollectibleDownload(storyAsset.storyAssetUrl, storyAsset.filename);
    showToast(t("spiritCollectibleShareFallback"));
  } finally {
    if (spiritCollectibleShareInstagramBtn) {
      spiritCollectibleShareInstagramBtn.disabled = false;
      spiritCollectibleShareInstagramBtn.textContent = t("spiritCollectibleShareInstagram");
    }
  }
}

function supportsAiCollectibleApi() {
  return Boolean(String(window?.NEONPULSE_IMAGE_API_URL || "").trim());
}

function escapeSvgText(value) {
  return String(value || "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function normalizeInlineText(value = "") {
  return String(value || "")
    .replace(/\s+/g, " ")
    .trim();
}

function truncateByWordBoundary(text = "", maxChars = 150) {
  const normalized = normalizeInlineText(text);
  if (normalized.length <= maxChars) return normalized;
  const sliced = normalized.slice(0, maxChars);
  const cutAt = sliced.lastIndexOf(" ");
  const safe = cutAt > 24 ? sliced.slice(0, cutAt) : sliced;
  return `${safe.trim()}...`;
}

function splitIntoSvgLines(text = "", maxCharsPerLine = 56, maxLines = 2) {
  const normalized = normalizeInlineText(text);
  if (!normalized || maxLines <= 0 || maxCharsPerLine <= 0) return [];

  const expandedTokens = [];
  normalized.split(" ").filter(Boolean).forEach((word) => {
    if (word.length <= maxCharsPerLine) {
      expandedTokens.push(word);
      return;
    }
    let cursor = 0;
    while (cursor < word.length) {
      const remaining = word.length - cursor;
      if (remaining <= maxCharsPerLine) {
        expandedTokens.push(word.slice(cursor));
        break;
      }
      const chunkSize = Math.max(1, maxCharsPerLine - 1);
      expandedTokens.push(`${word.slice(cursor, cursor + chunkSize)}-`);
      cursor += chunkSize;
    }
  });

  const lines = [];
  let current = "";
  let consumed = 0;

  for (let i = 0; i < expandedTokens.length; i += 1) {
    const token = expandedTokens[i];
    const candidate = current ? `${current} ${token}` : token;
    if (candidate.length <= maxCharsPerLine) {
      current = candidate;
      consumed = i + 1;
      continue;
    }

    if (current) {
      lines.push(current);
      if (lines.length >= maxLines) break;
      current = token;
      consumed = i + 1;
    } else {
      lines.push(token.slice(0, maxCharsPerLine));
      consumed = i + 1;
      if (lines.length >= maxLines) break;
      current = "";
    }
  }

  if (lines.length < maxLines && current) {
    lines.push(current);
  }

  const hasOverflow = consumed < expandedTokens.length;
  if (hasOverflow && lines.length) {
    const lastIndex = Math.min(maxLines, lines.length) - 1;
    let last = lines[lastIndex];
    if (last.length > maxCharsPerLine - 3) {
      last = last.slice(0, Math.max(1, maxCharsPerLine - 3)).trimEnd();
    }
    lines[lastIndex] = `${last.replace(/[.\-…\s]+$/g, "")}...`;
  }

  return lines.slice(0, maxLines);
}

function buildSpiritCollectiblePrompt(spirit, spiritText, likes, milestoneLikes) {
  const styleSignals = spiritTopStyles(spirit, 3).join(", ");
  if (currentLanguage === "en") {
    return `Create a cinematic abstract portrait card for the musical archetype "${spiritText.name}" (${spiritText.archetype}). Neon electronic style, layered gradients, geometric sigils, premium collectible card look, no real people, no logos, high detail. Milestone: ${milestoneLikes} likes reached out of ${likes}. Dominant styles: ${styleSignals}.`;
  }
  if (currentLanguage === "es") {
    return `Crea una tarjeta retrato abstracta y cinematográfica para el arquetipo musical "${spiritText.name}" (${spiritText.archetype}). Estilo electrónico neón, gradientes en capas, sigilos geométricos, look de carta coleccionable premium, sin personas reales, sin logos, alto detalle. Hito: ${milestoneLikes} likes alcanzados de ${likes}. Estilos dominantes: ${styleSignals}.`;
  }
  return `Crie uma carta retrato abstrata e cinematográfica para o arquétipo musical "${spiritText.name}" (${spiritText.archetype}). Estilo eletrônico neon, gradientes em camadas, sigilos geométricos, visual premium de card colecionável, sem pessoas reais, sem logos, alto detalhamento. Marco: ${milestoneLikes} likes atingidos de ${likes}. Estilos dominantes: ${styleSignals}.`;
}

function collectibleVariationToken() {
  return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 9)}`;
}

async function requestSpiritCollectibleFromApi(payload) {
  const endpoint = String(window?.NEONPULSE_IMAGE_API_URL || "").trim();
  if (!endpoint) return "";
  const token = String(window?.NEONPULSE_IMAGE_API_TOKEN || "").trim();

  const headers = {
    "Content-Type": "application/json",
    Accept: "application/json"
  };
  if (token) headers.Authorization = `Bearer ${token}`;

  const controller = typeof AbortController !== "undefined" ? new AbortController() : null;
  let timeoutId = 0;
  try {
    if (controller) timeoutId = window.setTimeout(() => controller.abort(), 9000);
    const response = await fetch(endpoint, {
      method: "POST",
      headers,
      body: JSON.stringify(payload),
      signal: controller?.signal
    });
    if (!response.ok) return "";

    const body = await response.json();
    const directUrl = String(body?.imageUrl || body?.url || body?.data?.[0]?.url || "").trim();
    if (directUrl) return directUrl;

    const b64 = String(body?.b64_json || body?.imageBase64 || body?.data?.[0]?.b64_json || "").trim();
    if (b64) return `data:image/png;base64,${b64}`;
    return "";
  } catch (_err) {
    return "";
  } finally {
    if (timeoutId) window.clearTimeout(timeoutId);
  }
}

function buildLocalSpiritCollectibleImage(
  spirit,
  spiritText,
  likes,
  milestoneLikes,
  variationToken = "",
  backgroundImageUrl = "",
  spiritImageDataUrl = "",
  snapshot = null
) {
  const theme = spiritVisualTheme(spirit);
  const rank = t(resolveSpiritRank(likes).current.key);
  const titleLines = splitIntoSvgLines(spiritText?.name || "Sonic Spirit", 24, 2);
  const topStyles = spiritTopStyles(spirit, 2).join(" • ");
  const topStyleLines = splitIntoSvgLines(topStyles, 46, 1);
  const subtitle = spiritText?.archetype || "";
  const subtitleLines = splitIntoSvgLines(subtitle, 34, 2);
  const conciseDescription = truncateByWordBoundary(buildSpiritCollectibleCopy(spirit, spiritText), 210);
  const descriptionLines = splitIntoSvgLines(conciseDescription, 56, 2);
  const statusSnapshot = snapshot || spiritShareProfileSnapshot();
  const statusLine = splitIntoSvgLines(buildSpiritCollectibleStatusCompact(statusSnapshot), 58, 1);
  const safeBackgroundImage = String(backgroundImageUrl || "").trim();
  const hasBackgroundImage = /^data:image\//i.test(safeBackgroundImage);
  const safeSpiritImage = String(spiritImageDataUrl || "").trim();
  const hasSpiritImage = /^data:image\//i.test(safeSpiritImage);
  const seed = hashString(`${spirit?.id || "spirit"}::${milestoneLikes}::${likes}::${variationToken}`);
  const accentX = 24 + (seed % 52);
  const accentY = 18 + ((seed >> 3) % 58);
  const accent2X = 54 + ((seed >> 7) % 38);
  const accent2Y = 42 + ((seed >> 11) % 42);
  const decoRotation = seed % 360;

  const svg = `
<svg xmlns="http://www.w3.org/2000/svg" width="1080" height="1080" viewBox="0 0 1080 1080">
  <defs>
    <linearGradient id="bg" x1="${accentX}%" y1="${accentY}%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="${escapeSvgText(theme.d)}" />
      <stop offset="50%" stop-color="${escapeSvgText(theme.b)}" stop-opacity="0.36" />
      <stop offset="100%" stop-color="${escapeSvgText(theme.c)}" stop-opacity="0.26" />
    </linearGradient>
    <radialGradient id="halo" cx="${accent2X}%" cy="${accent2Y}%" r="55%">
      <stop offset="0%" stop-color="${escapeSvgText(theme.a)}" stop-opacity="0.58" />
      <stop offset="100%" stop-color="${escapeSvgText(theme.a)}" stop-opacity="0" />
    </radialGradient>
    <linearGradient id="readabilityScrim" x1="0%" y1="0%" x2="0%" y2="100%">
      <stop offset="0%" stop-color="#010813" stop-opacity="0" />
      <stop offset="54%" stop-color="#010813" stop-opacity="0.16" />
      <stop offset="100%" stop-color="#010813" stop-opacity="0.78" />
    </linearGradient>
    <linearGradient id="textPanel" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#06172f" stop-opacity="0.78" />
      <stop offset="100%" stop-color="#0b2348" stop-opacity="0.62" />
    </linearGradient>
    <linearGradient id="spiritPanel" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#071833" stop-opacity="0.9" />
      <stop offset="100%" stop-color="#1f1140" stop-opacity="0.75" />
    </linearGradient>
    <linearGradient id="spiritPanelStroke" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="${escapeSvgText(theme.a)}" stop-opacity="0.72" />
      <stop offset="100%" stop-color="${escapeSvgText(theme.c)}" stop-opacity="0.54" />
    </linearGradient>
    <filter id="textShadow" x="-20%" y="-20%" width="140%" height="140%">
      <feDropShadow dx="0" dy="2" stdDeviation="3" flood-color="#010712" flood-opacity="0.72" />
    </filter>
    <filter id="spiritGlow" x="-25%" y="-25%" width="150%" height="150%">
      <feDropShadow dx="0" dy="0" stdDeviation="10" flood-color="${escapeSvgText(theme.a)}" flood-opacity="0.42" />
    </filter>
    <clipPath id="spiritClip">
      <rect x="236" y="136" width="608" height="448" rx="36" />
    </clipPath>
    <clipPath id="spiritTextClip">
      <rect x="120" y="620" width="840" height="364" rx="24" />
    </clipPath>
  </defs>
  ${hasBackgroundImage ? `<image href="${escapeSvgText(safeBackgroundImage)}" x="0" y="0" width="1080" height="1080" preserveAspectRatio="xMidYMid slice" opacity="0.22" />` : ""}
  <rect width="1080" height="1080" fill="url(#bg)" />
  ${hasBackgroundImage ? `<rect width="1080" height="1080" fill="${escapeSvgText(theme.d)}" fill-opacity="0.56" />` : ""}
  <rect width="1080" height="1080" fill="url(#readabilityScrim)" />
  <rect x="48" y="48" width="984" height="984" rx="46" fill="none" stroke="${escapeSvgText(theme.a)}" stroke-opacity="0.4" stroke-width="4" />
  <circle cx="540" cy="390" r="268" fill="url(#halo)" />
  <rect x="236" y="136" width="608" height="448" rx="36" fill="url(#spiritPanel)" stroke="url(#spiritPanelStroke)" stroke-width="3" />
  <g transform="rotate(${decoRotation} 540 360)">
    <path d="M540 176 L614 262 L540 348 L466 262 Z" fill="none" stroke="${escapeSvgText(theme.a)}" stroke-opacity="0.34" stroke-width="3" />
    <path d="M540 432 L596 492 L540 552 L484 492 Z" fill="none" stroke="${escapeSvgText(theme.b)}" stroke-opacity="0.24" stroke-width="3" />
  </g>
  <circle cx="540" cy="360" r="182" fill="none" stroke="${escapeSvgText(theme.a)}" stroke-opacity="0.46" stroke-width="4" />
  <circle cx="540" cy="360" r="126" fill="none" stroke="${escapeSvgText(theme.c)}" stroke-opacity="0.34" stroke-width="3" />
  ${
    hasSpiritImage
      ? `<image href="${escapeSvgText(safeSpiritImage)}" x="236" y="136" width="608" height="448" preserveAspectRatio="xMidYMid meet" clip-path="url(#spiritClip)" filter="url(#spiritGlow)" />`
      : `<text x="540" y="390" fill="#dff7ff" font-size="180" font-family="Chakra Petch, Arial, sans-serif" text-anchor="middle">☠</text>`
  }
  <rect x="116" y="612" width="848" height="368" rx="34" fill="url(#textPanel)" stroke="${escapeSvgText(theme.a)}" stroke-opacity="0.34" stroke-width="2.6" />
  <g clip-path="url(#spiritTextClip)">
    <text x="540" y="690" fill="#f7fcff" font-size="62" font-weight="700" font-family="Syne, Arial, sans-serif" text-anchor="middle" filter="url(#textShadow)">${escapeSvgText(titleLines[0] || "")}</text>
    <text x="540" y="736" fill="#f7fcff" font-size="62" font-weight="700" font-family="Syne, Arial, sans-serif" text-anchor="middle" filter="url(#textShadow)">${escapeSvgText(titleLines[1] || "")}</text>
    <text x="540" y="776" fill="#d5edff" font-size="32" font-weight="600" font-family="Chakra Petch, Arial, sans-serif" text-anchor="middle" filter="url(#textShadow)">${escapeSvgText(subtitleLines[0] || "")}</text>
    <text x="540" y="810" fill="#d5edff" font-size="32" font-weight="600" font-family="Chakra Petch, Arial, sans-serif" text-anchor="middle" filter="url(#textShadow)">${escapeSvgText(subtitleLines[1] || "")}</text>
    <text x="540" y="842" fill="#b7dbff" font-size="24" font-family="Chakra Petch, Arial, sans-serif" text-anchor="middle" filter="url(#textShadow)">${escapeSvgText(topStyleLines[0] || "")}</text>
    <text x="540" y="878" fill="#b2ffe4" font-size="30" font-weight="700" font-family="Chakra Petch, Arial, sans-serif" text-anchor="middle" filter="url(#textShadow)">${escapeSvgText(rank)}</text>
    <text x="540" y="914" fill="#e2f1ff" font-size="27" font-family="Chakra Petch, Arial, sans-serif" text-anchor="middle" filter="url(#textShadow)">${escapeSvgText(`${milestoneLikes} likes | ${likes} total`)}</text>
    <text x="540" y="938" fill="#cbe2ff" font-size="18" font-family="Chakra Petch, Arial, sans-serif" text-anchor="middle" filter="url(#textShadow)">${escapeSvgText(statusLine[0] || "")}</text>
    <text x="540" y="960" fill="#d8e8ff" font-size="19" font-family="Chakra Petch, Arial, sans-serif" text-anchor="middle" filter="url(#textShadow)">${escapeSvgText(descriptionLines[0] || "")}</text>
    <text x="540" y="978" fill="#d8e8ff" font-size="19" font-family="Chakra Petch, Arial, sans-serif" text-anchor="middle" filter="url(#textShadow)">${escapeSvgText(descriptionLines[1] || "")}</text>
  </g>
</svg>`;

  return `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(svg)}`;
}

async function generateSpiritCollectibleAsset(spirit, spiritText, likes, milestoneLikes, { variationToken = "" } = {}) {
  const prompt = `${buildSpiritCollectiblePrompt(spirit, spiritText, likes, milestoneLikes)} Variation seed: ${variationToken || "base"}.`;
  const spiritAssetUrl = resolveRuntimeAssetUrl(spirit?.image || "");
  const { mime: spiritMime } = collectibleImageMeta(spiritAssetUrl);
  const spiritImageDataUrl = await collectibleImageAsDataUrl(spiritAssetUrl, spiritMime);
  const snapshot = spiritShareProfileSnapshot();
  const apiImage = await requestSpiritCollectibleFromApi({
    prompt,
    spiritId: spirit.id,
    spiritName: spiritText?.name || spirit.id,
    archetype: spiritText?.archetype || "",
    likes,
    milestoneLikes,
    variation: variationToken || "base",
    language: currentLanguage
  });
  if (apiImage) {
    const { mime } = collectibleImageMeta(apiImage);
    const apiImageAsDataUrl = await collectibleImageAsDataUrl(apiImage, mime);
    return {
      imageUrl: buildLocalSpiritCollectibleImage(
        spirit,
        spiritText,
        likes,
        milestoneLikes,
        variationToken,
        apiImageAsDataUrl,
        spiritImageDataUrl,
        snapshot
      ),
      source: "api",
      createdAt: new Date().toISOString(),
      prompt
    };
  }
  return {
    imageUrl: buildLocalSpiritCollectibleImage(
      spirit,
      spiritText,
      likes,
      milestoneLikes,
      variationToken,
      "",
      spiritImageDataUrl,
      snapshot
    ),
    source: "local",
    createdAt: new Date().toISOString(),
    prompt
  };
}

async function ensureSpiritCollectible(spirit, spiritText, { forceRegenerate = false } = {}) {
  if (!spiritCollectiblePanel || !spiritCollectibleImage || !spiritCollectibleMilestone || !spiritCollectibleProgress || !spiritRankBadge) return;
  const likes = totalPositiveLikes();
  if (likes < SPIRIT_UNLOCK_TARGET) {
    spiritCollectiblePanel.classList.add("hidden");
    if (spiritCollectibleDetails) spiritCollectibleDetails.textContent = "";
    if (spiritCollectibleShareInstagramBtn) spiritCollectibleShareInstagramBtn.disabled = true;
    return;
  }

  const milestone = collectibleMilestoneForLikes(likes);
  const rank = resolveSpiritRank(likes);
  const slotKey = `${spirit.id}::${milestone.likes}`;
  const store = readSpiritCollectibleStore();
  let collectible = store[slotKey] || null;

  if ((forceRegenerate || !collectible?.imageUrl) && !spiritCollectibleBusy) {
    spiritCollectibleBusy = true;
    const variation = forceRegenerate ? collectibleVariationToken() : "";
    if (spiritCollectibleShareInstagramBtn) spiritCollectibleShareInstagramBtn.disabled = true;
    if (spiritCollectibleHint) spiritCollectibleHint.textContent = t("spiritCollectibleGenerating");
    try {
      collectible = await generateSpiritCollectibleAsset(spirit, spiritText, likes, milestone.likes, { variationToken: variation });
      if (collectible?.imageUrl) {
        store[slotKey] = collectible;
        saveSpiritCollectibleStore(store);
      }
      if (forceRegenerate && collectible?.imageUrl) {
        showToast(collectible.source === "api" ? t("spiritCollectibleGeneratedApi") : t("spiritCollectibleGeneratedLocal"));
      }
    } finally {
      spiritCollectibleBusy = false;
    }
  }

  if (!collectible?.imageUrl) {
    spiritCollectiblePanel.classList.add("hidden");
    if (spiritCollectibleDetails) spiritCollectibleDetails.textContent = "";
    if (spiritCollectibleShareInstagramBtn) spiritCollectibleShareInstagramBtn.disabled = true;
    return;
  }

  spiritCollectiblePanel.classList.remove("hidden");
  if (spiritCollectibleTitle) spiritCollectibleTitle.textContent = t("spiritCollectibleTitle");
  if (spiritCollectibleHint) {
    if (collectible.source === "api") {
      spiritCollectibleHint.textContent = t("spiritCollectibleHintApi");
    } else {
      spiritCollectibleHint.textContent = supportsAiCollectibleApi() ? t("spiritCollectibleError") : t("spiritCollectibleHintLocal");
    }
  }
  setImageSourceWithFallback(
    spiritCollectibleImage,
    collectible.imageUrl,
    SPIRIT_COLLECTIBLE_FALLBACK,
    {
      onFallback: () => {
        if (spiritCollectibleHint) spiritCollectibleHint.textContent = t("spiritCollectibleError");
      }
    }
  );
  spiritCollectibleImage.alt = t("spiritCollectibleAlt", { spirit: spiritText?.name || spirit.id, milestone: milestone.likes });
  spiritCollectibleMilestone.textContent = t("spiritCollectibleMilestone", { likes: milestone.likes });
  spiritRankBadge.textContent = t(rank.current.key);

  if (rank.next) {
    spiritCollectibleProgress.textContent = t("spiritCollectibleNext", {
      remaining: Math.max(0, rank.next.likes - likes),
      rank: t(rank.next.key),
      current: likes,
      nextLikes: rank.next.likes
    });
  } else {
    spiritCollectibleProgress.textContent = t("spiritCollectibleMaxRank", {
      rank: t(rank.current.key),
      likes
    });
  }

  if (spiritCollectibleDetails) {
    spiritCollectibleDetails.textContent = buildSpiritCollectibleDetailsText(spirit, spiritText, likes, milestone.likes);
  }

  const baseFilename = spiritCollectibleFilename(spirit.id, milestone.likes, collectible.imageUrl);
  const downloadFilename = baseFilename;
  const shareFilename = spiritStoryFilename(baseFilename);
  if (spiritCollectibleDownload) {
    spiritCollectibleDownload.textContent = t("spiritCollectibleDownload");
    spiritCollectibleDownload.href = collectible.imageUrl;
    spiritCollectibleDownload.setAttribute("download", downloadFilename);
  }
  if (spiritCollectibleShareInstagramBtn) {
    spiritCollectibleShareInstagramBtn.textContent = t("spiritCollectibleShareInstagram");
    spiritCollectibleShareInstagramBtn.disabled = false;
    spiritCollectibleShareInstagramBtn.dataset.imageUrl = collectible.imageUrl;
    spiritCollectibleShareInstagramBtn.dataset.filename = shareFilename;
  }
}

function clearSpiritVisual() {
  if (spiritVisualPanel) spiritVisualPanel.classList.add("hidden");
  if (spiritVisualFrame) spiritVisualFrame.src = "";
  if (spiritVisualPresetName) spiritVisualPresetName.textContent = "";
  currentSpiritVisualQuery = "";
}

function renderSpiritVisual(spirit, { autoplay = true, forceReload = false } = {}) {
  if (!spiritVisualPanel || !spiritVisualYoutubeLink) return;
  const query = resolveSpiritVisualQuery(spirit);
  if (!query) {
    clearSpiritVisual();
    return;
  }

  spiritVisualPanel.classList.remove("hidden");
  spiritVisualYoutubeLink.href = buildYouTubeSearchUrl(query);

  const topStyles = spiritTopStyles(spirit, 2);
  if (spiritVisualPresetName) {
    spiritVisualPresetName.textContent = t("spiritVisualPreset", {
      preset: topStyles.length ? topStyles.join(" • ") : "Neon Pulse"
    });
  }

  if (forceReload || currentSpiritVisualQuery !== query || autoplay) {
    applySpiritAmbientTheme(spirit);
    currentSpiritVisualQuery = query;
  }
}

function triggerSpiritUnlockPulse() {
  if (!spiritPanel) return;
  spiritPanel.classList.remove("unlock-pulse");
  void spiritPanel.offsetWidth;
  spiritPanel.classList.add("unlock-pulse");
  window.clearTimeout(triggerSpiritUnlockPulse.timer);
  triggerSpiritUnlockPulse.timer = window.setTimeout(() => {
    spiritPanel.classList.remove("unlock-pulse");
  }, 1120);
}
triggerSpiritUnlockPulse.timer = 0;

function resolveMusicalSpirit() {
  const selectedStyle = styleEl?.value || lastPrefs?.style || currentRecommendation?.style || "";
  const fallbackSpirit = MUSICAL_SPIRITS[0];
  let best = fallbackSpirit;
  let bestScore = Number.NEGATIVE_INFINITY;

  MUSICAL_SPIRITS.forEach((spirit) => {
    let score = 0;
    Object.entries(spirit.styleWeights).forEach(([style, weight]) => {
      score += spiritSignalForStyle(style) * weight;
    });
    if (selectedStyle && spirit.styleWeights[selectedStyle]) score += spirit.styleWeights[selectedStyle] * 1.5;
    if (currentRecommendation?.style && spirit.styleWeights[currentRecommendation.style]) score += spirit.styleWeights[currentRecommendation.style] * 1.2;
    if (currentDiscovery?.style && spirit.styleWeights[currentDiscovery.style]) score += spirit.styleWeights[currentDiscovery.style] * 0.9;

    if (score > bestScore) {
      bestScore = score;
      best = spirit;
    }
  });

  return best || fallbackSpirit;
}

function updateSpiritProgressText() {
  if (!spiritProgress) return;
  const likedSongs = totalLikedSongs();
  if (likedSongs < SPIRIT_UNLOCK_TARGET) {
    spiritProgress.textContent = t("spiritProgressLocked", {
      current: likedSongs,
      target: SPIRIT_UNLOCK_TARGET,
      remaining: Math.max(0, SPIRIT_UNLOCK_TARGET - likedSongs)
    });
    return;
  }
  spiritProgress.textContent = t("spiritProgressUnlocked", { current: likedSongs });
}

async function animateSpiritDescription(text) {
  if (!spiritDescription) return;
  const fullText = String(text || "").trim();
  if (!fullText) {
    spiritDescription.textContent = "";
    spiritDescription.classList.remove("typing");
    return;
  }

  spiritAnimationToken += 1;
  const token = spiritAnimationToken;
  spiritDescription.classList.add("typing");
  spiritDescription.textContent = "";
  const step = Math.max(1, Math.ceil(fullText.length / 120));

  for (let i = 0; i <= fullText.length; i += step) {
    if (token !== spiritAnimationToken) {
      spiritDescription.classList.remove("typing");
      return;
    }
    spiritDescription.textContent = fullText.slice(0, i);
    await waitMs(24);
  }

  if (token !== spiritAnimationToken) {
    spiritDescription.classList.remove("typing");
    return;
  }
  spiritDescription.textContent = fullText;
  spiritDescription.classList.remove("typing");
}

async function renderMusicalSpirit({ celebrate = false, triggerEl = null, forceAnimation = false } = {}) {
  if (!spiritPanel || !spiritCard || !spiritImage || !spiritName || !spiritArchetype || !spiritDescription) return;
  const likedSongs = totalLikedSongs();
  if (likedSongs < SPIRIT_UNLOCK_TARGET) {
    spiritPanel.classList.add("hidden");
    spiritPanel.classList.remove("unlock-pulse");
    currentSpiritId = "";
    spiritLastReviewedSongLikes = 0;
    spiritUnlocked = false;
    spiritAnimationToken += 1;
    clearSpiritSpotlight();
    clearSpiritVisual();
    if (spiritCollectiblePanel) spiritCollectiblePanel.classList.add("hidden");
    if (spiritCollectibleImage) spiritCollectibleImage.removeAttribute("src");
    return;
  }

  const reviewCheckpoint = spiritReviewCheckpointFromSongLikes(likedSongs);
  let reviewedAtCheckpoint = false;
  let selectedSpirit = spiritById(currentSpiritId || "");
  if (!selectedSpirit || reviewCheckpoint > spiritLastReviewedSongLikes) {
    selectedSpirit = resolveMusicalSpirit();
    reviewedAtCheckpoint = true;
    spiritLastReviewedSongLikes = reviewCheckpoint;
  }
  if (!selectedSpirit) return;
  const localizedCopy = localizedSpiritCopy(selectedSpirit) || {};
  const spiritText = {
    ...localizedCopy,
    name: String(localizedCopy.name || selectedSpirit.id || "Sonic Spirit").trim(),
    archetype: String(localizedCopy.archetype || "").trim(),
    description: String(localizedCopy.description || "").trim(),
    cardDescription: String(localizedCopy.cardDescription || "").trim(),
    collectibleDescription: String(localizedCopy.collectibleDescription || "").trim()
  };

  const wasHidden = spiritPanel.classList.contains("hidden");
  const changedSpirit = currentSpiritId && currentSpiritId !== selectedSpirit.id;
  currentSpiritId = selectedSpirit.id;
  spiritUnlocked = true;

  spiritPanel.classList.remove("hidden");
  spiritCard.classList.remove("hidden");
  spiritCard.classList.remove("reveal");
  void spiritCard.offsetWidth;
  spiritCard.classList.add("reveal");

  setImageSourceWithFallback(spiritImage, selectedSpirit.image, SPIRIT_AVATAR_FALLBACK);
  spiritImage.alt = t("spiritAvatarAlt", { name: spiritText.name });
  spiritName.textContent = spiritText.name;
  spiritArchetype.textContent =
    spiritText.archetype ||
    (currentLanguage === "en"
      ? "Archetype calibrating"
      : currentLanguage === "es"
        ? "Arquetipo calibrando"
        : "Arquétipo em calibração");
  updateSpiritProgressText();
  renderSpiritVisual(selectedSpirit, {
    autoplay: wasHidden || changedSpirit || forceAnimation,
    forceReload: wasHidden || changedSpirit
  });
  const spiritSpotlightPayload = resolveSpiritSpotlightTrack(selectedSpirit);
  const spotlightTrack = renderSpiritSpotlight(spiritSpotlightPayload);
  await ensureSpiritCollectible(selectedSpirit, spiritText, { forceRegenerate: false });
  const spiritNarrative = buildSpiritPanelNarrative(selectedSpirit, spiritText);

  const mustAnimate = forceAnimation || wasHidden || changedSpirit || !spiritDescription.textContent.trim();
  if (mustAnimate) {
    await animateSpiritDescription(spiritNarrative);
  } else {
    spiritDescription.textContent = spiritNarrative;
    spiritDescription.classList.remove("typing");
  }

  if (wasHidden && celebrate) {
    if (feedbackMessage) {
      const unlockLine = t("spiritUnlockedFeedback", { name: spiritText.name });
      const spotlightLine = spotlightTrack
        ? t("spiritSpotlightFeedback", { song: spotlightTrack.song, artist: spotlightTrack.artist })
        : "";
      feedbackMessage.textContent = [unlockLine, spotlightLine].filter(Boolean).join(" ");
    }
    triggerSpiritUnlockPulse();
    if (triggerEl) burstConfetti(triggerEl, ["#6effdc", "#7de0ff", "#ffd07d", "#ff9be9"]);
    showToast(t("spiritUnlockedToast", { name: spiritText.name }));
    return;
  }

  if (changedSpirit) triggerSpiritUnlockPulse();
  if (!wasHidden && reviewedAtCheckpoint && triggerEl) {
    if (changedSpirit) {
      if (feedbackMessage) feedbackMessage.textContent = t("spiritShiftedFeedback", { name: spiritText.name });
      showToast(t("spiritReviewShiftedToast", { name: spiritText.name }));
      return;
    }
    if (feedbackMessage) feedbackMessage.textContent = t("spiritReviewStayedFeedback", { name: spiritText.name });
    showToast(t("spiritReviewStayedToast", { name: spiritText.name }));
  }
}

async function revealArtistBioWithAnimation() {
  if (!detailsPanel || !artistBio || !currentRecommendation) return;
  const fullText = String(artistBio.textContent || "").trim();
  if (!fullText) return;

  bioAnimationToken += 1;
  const token = bioAnimationToken;

  detailsPanel.classList.remove("hidden");
  detailsPanel.classList.remove("details-panel-reveal");
  void detailsPanel.offsetWidth;
  detailsPanel.classList.add("details-panel-reveal");

  if (artistDetailsCard) {
    artistDetailsCard.classList.add("artist-focus");
    window.clearTimeout(revealArtistBioWithAnimation.focusTimer);
    revealArtistBioWithAnimation.focusTimer = window.setTimeout(() => {
      if (bioAnimationToken !== token) return;
      artistDetailsCard.classList.remove("artist-focus");
    }, 2200);
  }
  if (labelDetailsCard) labelDetailsCard.classList.remove("artist-focus");

  detailsPanel.scrollIntoView({ behavior: "smooth", block: "start" });

  artistBio.classList.add("bio-typing");
  artistBio.textContent = "";
  const steps =
    fullText.length >= 520 ? 3 :
    fullText.length >= 320 ? 2 : 1;
  const frameDelay =
    fullText.length >= 520 ? 14 :
    fullText.length >= 320 ? 18 : 22;
  for (let idx = 0; idx <= fullText.length; idx += steps) {
    if (bioAnimationToken !== token) {
      artistBio.classList.remove("bio-typing");
      return;
    }
    artistBio.textContent = fullText.slice(0, idx);
    await waitMs(frameDelay);
  }
  if (bioAnimationToken !== token) {
    artistBio.classList.remove("bio-typing");
    return;
  }
  artistBio.textContent = fullText;
  artistBio.classList.remove("bio-typing");
}
revealArtistBioWithAnimation.focusTimer = 0;

function hashString(value) {
  let hash = 0;
  const text = String(value || "");
  for (let i = 0; i < text.length; i += 1) {
    hash = (hash << 5) - hash + text.charCodeAt(i);
    hash |= 0;
  }
  return Math.abs(hash);
}

function generateRecentListeners(track, target = RECENT_LISTENERS_TARGET) {
  if (!track) return [];
  const seed = hashString(`${track.artist}::${track.song}::${track.style}::${track.bpm}`);
  const used = new Set();
  const listeners = [];

  for (let i = 0; i < target; i += 1) {
    const nameIndex = (seed + i * 7) % RECENT_LISTENER_NAMES.length;
    const cityIndex = (seed + i * 11) % RECENT_LISTENER_CITIES.length;
    const reactionIndex = (seed + i * 13) % RECENT_LISTENER_REACTIONS.length;
    const name = RECENT_LISTENER_NAMES[nameIndex];
    if (used.has(name)) continue;
    used.add(name);

    const minutesAgo = ((seed + i * 17) % 58) + 2;
    listeners.push({
      name,
      city: RECENT_LISTENER_CITIES[cityIndex],
      reaction: RECENT_LISTENER_REACTIONS[reactionIndex][currentLanguage] || RECENT_LISTENER_REACTIONS[reactionIndex].pt,
      minutesAgo
    });
  }

  return listeners;
}

function generateTopListeners(track, target = 5) {
  if (!track) return [];
  const styleKey = normalize(track.style || "");
  const styleSeed = hashString(`${styleKey}::${track.bpm}::${track.energy}`);

  const ranked = RECENT_LISTENER_NAMES.map((name, index) => {
    const nameSeed = hashString(`${name}::${styleKey}`);
    const songSeed = hashString(`${track.song}::${name}`);
    const score = 90 + ((nameSeed + styleSeed + index * 17) % 180);
    const plays = 8 + ((songSeed + index * 3) % 42);
    const cityIndex = (styleSeed + index * 9) % RECENT_LISTENER_CITIES.length;
    return {
      name,
      score,
      plays,
      city: RECENT_LISTENER_CITIES[cityIndex]
    };
  });

  return ranked
    .sort((a, b) => (b.score - a.score) || (b.plays - a.plays))
    .slice(0, Math.max(1, target))
    .map((item, index) => ({
      ...item,
      rank: index + 1
    }));
}

function renderRecentListeners(track) {
  if (!recentListenersPanel || !recentListenersList || !listenersSubtitle) return;
  if (!track) {
    recentListenersPanel.classList.add("hidden");
    return;
  }

  const listeners = generateRecentListeners(track, RECENT_LISTENERS_TARGET);
  if (!listeners.length) {
    recentListenersPanel.classList.add("hidden");
    return;
  }

  recentListenersPanel.classList.remove("hidden");
  listenersSubtitle.textContent = t("listenersSubtitle", { count: listeners.length });
  recentListenersList.innerHTML = "";

  listeners.forEach((listener, index) => {
    const item = document.createElement("li");
    item.className = "listener-item";
    item.style.animationDelay = `${index * 45}ms`;

    const nameEl = document.createElement("p");
    nameEl.className = "listener-name";
    nameEl.textContent = listener.name;

    const metaEl = document.createElement("p");
    metaEl.className = "listener-meta";
    metaEl.textContent =
      currentLanguage === "en"
        ? `${listener.reaction} - ${listener.minutesAgo} min ago - ${listener.city}`
        : currentLanguage === "es"
          ? `${listener.reaction} - hace ${listener.minutesAgo} min - ${listener.city}`
          : `${listener.reaction} - ha ${listener.minutesAgo} min - ${listener.city}`;

    item.appendChild(nameEl);
    item.appendChild(metaEl);
    recentListenersList.appendChild(item);
  });
}

function renderTopListeners(track) {
  if (!topListenersPanel || !topListenersList || !topListenersSubtitle) return;
  if (!track) {
    topListenersPanel.classList.add("hidden");
    return;
  }

  const ranking = generateTopListeners(track, 5);
  if (!ranking.length) {
    topListenersPanel.classList.add("hidden");
    return;
  }

  topListenersPanel.classList.remove("hidden");
  if (topListenersTitle) topListenersTitle.textContent = t("topListenersTitle");
  topListenersSubtitle.textContent = t("topListenersSubtitle", {
    style: styleLabelByValue(track.style)
  });
  topListenersList.innerHTML = "";

  ranking.forEach((listener, index) => {
    const item = document.createElement("li");
    item.className = "top-listener-item";
    item.style.animationDelay = `${index * 45}ms`;

    const rankEl = document.createElement("span");
    rankEl.className = "top-listener-rank";
    rankEl.textContent = t("topListenerRank", { rank: listener.rank });

    const main = document.createElement("div");
    main.className = "top-listener-main";

    const nameEl = document.createElement("p");
    nameEl.className = "top-listener-name";
    nameEl.textContent = listener.name;

    const metaEl = document.createElement("p");
    metaEl.className = "top-listener-meta";
    metaEl.textContent = `${t("topListenerScore", { score: listener.score })} • ${t("topListenerPlays", { plays: listener.plays })} • ${listener.city}`;

    main.append(nameEl, metaEl);
    item.append(rankEl, main);
    topListenersList.appendChild(item);
  });
}

function setListenLinkState(linkEl, { href, enabled = true, title = "" }) {
  if (!linkEl) return;
  linkEl.classList.remove("unverified-link");
  if (enabled) {
    linkEl.href = href;
    linkEl.removeAttribute("aria-disabled");
    linkEl.classList.remove("disabled-link");
    linkEl.title = title || "";
    return;
  }

  linkEl.href = "#";
  linkEl.setAttribute("aria-disabled", "true");
  linkEl.classList.add("disabled-link");
  linkEl.title = title || "Link indisponivel";
}

function familyOf(style) {
  return STYLE_TO_FAMILY[style] || "outros";
}

function strongestLikedStyle() {
  const ranked = [...adaptiveModel.likedStyles.entries()]
    .filter(([, score]) => Number(score) > 0)
    .sort((a, b) => b[1] - a[1]);
  return ranked[0]?.[0] || "";
}

function resolveVibeTheme(style) {
  const cleanStyle = normalize(style || "");
  if (!cleanStyle) return "default";
  if (STYLE_TO_VIBE_THEME[cleanStyle]) return STYLE_TO_VIBE_THEME[cleanStyle];
  const family = familyOf(cleanStyle);
  if (family === "psytrance") return "psy";
  if (family === "techno") return "techno";
  if (family === "house") return "house";
  if (family === "dnb") return "dnb";
  if (family === "bass_music") return "bass";
  if (family === "leftfield") return "leftfield";
  if (family === "trance") return "trance";
  if (family === "hard_dance") return "hard";
  return "default";
}

function resolveVibeStyle(styleHint = "") {
  const explicit = normalize(styleHint || "");
  if (explicit) return explicit;
  const currentStyle = normalize(currentRecommendation?.style || "");
  if (currentStyle) return currentStyle;
  const selectedStyle = normalize(styleEl?.value || "");
  if (selectedStyle) return selectedStyle;
  const dominantLiked = normalize(strongestLikedStyle());
  if (dominantLiked) return dominantLiked;
  return "";
}

function vibeStrengthForStyle(style = "") {
  const cleanStyle = normalize(style || "");
  const totalLikes = totalPositiveLikes();
  const styleSignal = cleanStyle ? Math.max(0, Number(adaptiveModel.likedStyles.get(cleanStyle) || 0)) : 0;
  const base = Math.min(0.66, 0.32 + totalLikes * 0.013);
  const boost = Math.min(0.34, styleSignal * 0.08);
  return Math.max(0.3, Math.min(1, base + boost));
}

function renderGenreFxTokens(themeId = "default", { force = false } = {}) {
  if (!genreFxLayer) return;
  const theme = VIBE_THEME_TOKENS[themeId] ? themeId : "default";
  const config = VIBE_THEME_CONFIG[theme] || VIBE_THEME_CONFIG.default;
  const tokens = VIBE_THEME_TOKENS[theme] || VIBE_THEME_TOKENS.default;
  const isCompact = window.matchMedia ? window.matchMedia("(max-width: 780px)").matches : false;
  const density = isCompact ? Math.max(16, Math.round(config.density * 0.68)) : config.density;

  if (!force && genreFxLayer.dataset.theme === theme && Number(genreFxLayer.dataset.density || 0) === density) {
    return;
  }

  genreFxLayer.dataset.theme = theme;
  genreFxLayer.dataset.density = String(density);
  genreFxLayer.innerHTML = "";

  for (let i = 0; i < density; i += 1) {
    const token = document.createElement("span");
    token.className = "genre-fx-token";
    if (i % 3 === 1) token.classList.add("alt");
    if (Math.random() > 0.66) token.classList.add("pulse");
    if (Math.random() > 0.48) token.classList.add("wide");
    if (Math.random() > 0.7) token.classList.add("dense");
    if (Math.random() > 0.76) token.classList.add("spin");

    token.textContent = tokens[Math.floor(Math.random() * tokens.length)];
    token.style.left = `${(3 + Math.random() * 94).toFixed(2)}%`;
    token.style.top = `${(4 + Math.random() * 92).toFixed(2)}%`;
    token.style.fontSize = `${(config.minSize + Math.random() * (config.maxSize - config.minSize)).toFixed(2)}rem`;
    token.style.animationDuration = `${(config.minDuration + Math.random() * (config.maxDuration - config.minDuration)).toFixed(2)}s, ${(1.9 + Math.random() * 3.4).toFixed(2)}s`;
    token.style.animationDelay = `${(-Math.random() * config.maxDuration).toFixed(2)}s, ${(-Math.random() * 3.2).toFixed(2)}s`;
    token.style.setProperty("--fx-dx", `${(-90 + Math.random() * 180).toFixed(2)}px`);
    token.style.setProperty("--fx-dy", `${(-90 - Math.random() * 260).toFixed(2)}px`);
    token.style.setProperty("--fx-rot-start", `${(-12 + Math.random() * 16).toFixed(2)}deg`);
    token.style.setProperty("--fx-rot-mid", `${(-7 + Math.random() * 22).toFixed(2)}deg`);
    token.style.setProperty("--fx-rot-end", `${(-14 + Math.random() * 20).toFixed(2)}deg`);
    token.style.setProperty("--fx-scale-start", (0.72 + Math.random() * 0.34).toFixed(2));
    token.style.setProperty("--fx-scale-mid", (0.94 + Math.random() * 0.28).toFixed(2));
    token.style.setProperty("--fx-scale-end", (1.02 + Math.random() * 0.36).toFixed(2));
    token.style.opacity = (0.22 + Math.random() * 0.62).toFixed(2);
    genreFxLayer.appendChild(token);
  }
}

function applyGenreVibeTheme(styleHint = "", { force = false } = {}) {
  const style = resolveVibeStyle(styleHint);
  const theme = resolveVibeTheme(style);
  const strength = vibeStrengthForStyle(style);
  document.documentElement.style.setProperty("--vibe-strength", strength.toFixed(2));
  if (document.body) {
    document.body.dataset.vibeTheme = theme;
    if (style) {
      document.body.dataset.vibeStyle = style;
    } else {
      delete document.body.dataset.vibeStyle;
    }
  }
  renderGenreFxTokens(theme, { force: force || theme !== activeVibeTheme });
  activeVibeTheme = theme;
}

function getTrackMetadata(track) {
  const lookupKey = `${track.song}|${track.artist}`;
  const details = TRACK_METADATA[lookupKey] || {};

  return {
    releaseDate: details.releaseDate || "Catálogo local",
    duration: details.duration || "06:00",
    musicalKey: details.musicalKey || "N/A",
    catalogRef: details.catalogRef || `${track.label.toUpperCase().slice(0, 6)}-${track.style.toUpperCase().slice(0, 4)}`
  };
}

function formatEventDate(isoDate) {
  const locale = currentLanguage === "pt" ? "pt-BR" : currentLanguage === "es" ? "es-ES" : "en-US";
  return new Date(isoDate).toLocaleString(locale, {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit"
  });
}

function getFallbackEvents(artist) {
  return FALLBACK_EVENTS[normalize(artist)] || [];
}

async function fetchUpcomingEvents(artist) {
  const endpoint = `https://rest.bandsintown.com/artists/${encodeURIComponent(artist)}/events?app_id=neonpulse_selector`;

  try {
    const response = await fetch(endpoint);
    if (!response.ok) throw new Error("Falha ao consultar eventos");

    const rawEvents = await response.json();
    if (!Array.isArray(rawEvents)) throw new Error("Resposta invalida");

    const now = new Date();
    const events = rawEvents
      .filter((item) => item.datetime && new Date(item.datetime) >= now)
      .map((item) => ({
        datetime: item.datetime,
        venue: item.venue?.name || "Venue a confirmar",
        city: item.venue?.city || "Cidade a confirmar",
        country: item.venue?.country || "",
        url: item.url || ""
      }))
      .sort((a, b) => new Date(a.datetime) - new Date(b.datetime))
      .slice(0, 10);

    if (events.length > 0) return { events, source: "bandsintown" };

    const fallback = getFallbackEvents(artist);
    return { events: fallback, source: "fallback" };
  } catch (_error) {
    return { events: getFallbackEvents(artist), source: "fallback" };
  }
}

function renderEventsPanel(artist, events, source) {
  if (!eventsPanel || !eventsCalendar || !eventsList || !eventsIntro) return;
  eventsPanel.classList.remove("hidden");
  eventsCalendar.innerHTML = "";
  eventsList.innerHTML = "";

  if (!events.length) {
    eventsIntro.textContent = t("eventNotFound", { artist });
    return;
  }

  eventsIntro.textContent =
    source === "bandsintown"
      ? t("eventRealLoaded", { artist })
      : t("eventFallbackLoaded", { artist });

  events.slice(0, 4).forEach((event) => {
    const card = document.createElement("article");
    card.className = "event-date-card";

    const title = document.createElement("strong");
    title.textContent = formatEventDate(event.datetime);
    const place = document.createElement("span");
    place.textContent = `${event.city}${event.country ? `, ${event.country}` : ""}`;
    const venue = document.createElement("span");
    venue.textContent = event.venue;

    card.append(title, place, venue);
    eventsCalendar.appendChild(card);
  });

  events.forEach((event) => {
    const item = document.createElement("li");
    item.className = "event-item";

    const date = document.createElement("strong");
    date.textContent = formatEventDate(event.datetime);
    const details = document.createElement("span");
    details.textContent = `${event.venue} - ${event.city}${event.country ? `, ${event.country}` : ""}`;
    item.append(date, details);

    if (event.url) {
      const link = document.createElement("a");
      link.href = event.url;
      link.target = "_blank";
      link.rel = "noopener noreferrer";
      link.textContent = t("openEvent");
      item.appendChild(link);
    }

    eventsList.appendChild(item);
  });
}

function bpmIntentStyleBoost(track, prefs = {}) {
  if (!prefs?.bpm || prefs?.style) return 0;
  const selectedRange = parseBpmRangeValue(prefs.bpm);
  if (!selectedRange) return 0;

  const hasOtherSignals = Boolean(prefs.context || prefs.energy || prefs.vocals);
  const style = String(track?.style || "");
  const energy = String(track?.energy || "");

  if (selectedRange.max <= 124) {
    const chillStyles = new Set([
      "ambient",
      "downtempo",
      "organic_house",
      "deep_house",
      "future_garage",
      "liquid_dnb",
      "house"
    ]);
    const aggressiveStyles = new Set([
      "hi_tech",
      "psycore",
      "dark_psy",
      "dark_experimental",
      "hard_techno",
      "industrial_techno",
      "hardstyle"
    ]);

    let boost = 0;
    if (chillStyles.has(style)) boost += hasOtherSignals ? 1.2 : 2.6;
    if (energy === "low") boost += 1.1;
    if (energy === "extreme") boost -= 2.9;
    if (aggressiveStyles.has(style)) boost -= hasOtherSignals ? 0.9 : 2.1;
    return boost;
  }

  return 0;
}

function recommendationScore(track, prefs) {
  const weights = getWeights();
  let score = 0;

  if (prefs.bpm && !trackMatchesBpmPreference(track, prefs.bpm)) return -1000000;
  if (prefs.style) {
    // Guard rail: com estilo selecionado, faixas fora do estilo nunca devem vencer.
    if (track.style !== prefs.style) return -1000000;
    if (track.style === prefs.style) score += 3 * weights.style;
  }
  if (prefs.context && track.context.includes(prefs.context)) score += 1.5 * weights.context;
  if (prefs.energy && track.energy === prefs.energy) score += 1.7 * weights.energy;
  if (prefs.bpm && track.bpm === prefs.bpm) score += 1.3 * weights.bpm;
  if (prefs.vocals && track.vocals === prefs.vocals) score += 1.2 * weights.vocals;
  if (track.previewUrl) score += 1.1;
  if (track.previewChecked && !track.previewUrl) score -= 0.95;
  score -= previewPenaltyForTrack(track);
  if (track.existenceVerified === false) score -= 1000;
  if (track.existenceVerified === true) score += 0.8;
  score += bpmIntentStyleBoost(track, prefs);
  if (track.style === "minimal_techno" && track.energy === "low") score -= 2.5;
  if (track.style === "minimal_techno" && track.bpm === "110-124") score -= 3.5;
  score += getAdaptiveScore(track);
  score += Math.random() * 0.35;

  return score;
}

function recommendationContextKey(prefs = {}) {
  return JSON.stringify({
    style: prefs.style || "",
    context: prefs.context || "",
    energy: prefs.energy || "",
    bpm: prefs.bpm || "",
    vocals: prefs.vocals || "",
    discovery: Boolean(discoveryModeEl?.checked)
  });
}

function styleScopedEligibleTracks(prefs = {}) {
  return catalog.filter((track) => {
    if (!isTrackEligibleForRecommendation(track)) return false;
    if (prefs.style && track.style !== prefs.style) return false;
    if (prefs.bpm && !trackMatchesBpmPreference(track, prefs.bpm)) return false;
    if (prefs.style && !artistAllowedForStyle(prefs.style, track.artist)) return false;
    if (prefs.style && !labelAllowedForStyle(prefs.style, track.label)) return false;
    const bpmValue = Number(track.bpmExact);
    if (prefs.style && Number.isFinite(bpmValue) && bpmValue > 0 && !bpmFitsStyle(prefs.style, bpmValue)) return false;
    return true;
  });
}

function buildSuggestionQueueFromPrefs(prefs = {}, anchorTrack = null) {
  const knownUnion = buildGlobalArtistExclusionSet();
  const knownTrackSignals = buildGlobalTrackExclusionSet();
  const seenKeys = new Set();
  const seenArtistKeys = new Set();
  const queue = [];

  const maybeAdd = (track, { ignoreKnown = false } = {}) => {
    if (!track) return false;
    if (prefs.style && track.style !== prefs.style) return false;
    if (prefs.bpm && !trackMatchesBpmPreference(track, prefs.bpm)) return false;
    if (!isTrackEligibleForRecommendation(track)) return false;
    const artistKey = artistMatchKey(track.artist);
    const trackKey = recommendationTrackKey(track);
    if (!artistKey || !trackKey) return false;
    if (!ignoreKnown && artistSetHasMatch(knownUnion, track.artist)) return false;
    if (!ignoreKnown && trackBlockedByKnownSignals(track, knownTrackSignals.keys, knownTrackSignals.titles)) return false;
    if (seenKeys.has(trackKey)) return false;
    if (seenArtistKeys.has(artistKey)) return false;
    seenKeys.add(trackKey);
    seenArtistKeys.add(artistKey);
    queue.push(track);
    return true;
  };

  if (anchorTrack) maybeAdd(anchorTrack, { ignoreKnown: true });

  const eligible = styleScopedEligibleTracks(prefs);
  const scoredUnknown = eligible
    .filter((track) => !artistSetHasMatch(knownUnion, track.artist))
    .map((track) => ({ track, score: recommendationScore(track, prefs) }))
    .sort((a, b) => b.score - a.score);

  const anchorArtistKey = normalize(anchorTrack?.artist || "");
  const fillFromScored = (entries, { diversify = false } = {}) => {
    entries.forEach((entry) => {
      if (queue.length >= 3) return;
      if (!entry?.track) return;
      if (diversify && anchorArtistKey && normalize(entry.track.artist) === anchorArtistKey && queue.length === 1) {
        return;
      }
      maybeAdd(entry.track);
    });
  };

  fillFromScored(scoredUnknown, { diversify: true });
  if (queue.length < 3) fillFromScored(scoredUnknown);

  if (queue.length < 3) {
    const scoredFallback = eligible
      .map((track) => ({ track, score: recommendationScore(track, prefs) }))
      .sort((a, b) => b.score - a.score);
    scoredFallback.forEach((entry) => {
      if (queue.length >= 3) return;
      maybeAdd(entry.track);
    });
  }

  return queue.slice(0, 3);
}

function recommendationMetaLine(track) {
  const bpmData = resolveBpmDisplay(track);
  const bpmText = bpmData.exact > 0 ? `${t("bpm")} ${bpmData.exact}` : bpmData.lineText;
  return `${styleLabelByValue(track.style)} • ${bpmText} • ${energyLabelByValue(track.energy)}`;
}

function renderSuggestionQueue(prefs = lastPrefs) {
  if (!suggestionQueueCard || !suggestionQueueList) return;
  if (!suggestionQueueTracks.length || !prefs) {
    suggestionQueueCard.classList.add("hidden");
    suggestionQueueList.innerHTML = "";
    return;
  }

  suggestionQueueCard.classList.remove("hidden");
  suggestionQueueList.innerHTML = "";
  const activeKey = recommendationTrackKey(currentRecommendation);

  suggestionQueueTracks.forEach((track, index) => {
    const card = document.createElement("article");
    card.className = "queue-item";
    const trackKey = recommendationTrackKey(track);
    const isActive = trackKey && trackKey === activeKey;
    if (isActive) card.classList.add("active");

    const top = document.createElement("div");
    top.className = "queue-item-top";
    const slotChip = document.createElement("span");
    slotChip.className = "queue-chip";
    slotChip.textContent = index === 0 ? t("queueNow") : `${t("queueNext")} ${index}`;
    const styleChip = document.createElement("span");
    styleChip.className = "queue-chip alt";
    styleChip.textContent = styleLabelByValue(track.style);
    top.append(slotChip, styleChip);

    const trackLine = document.createElement("p");
    trackLine.className = "queue-track";
    trackLine.textContent = `${track.song} • ${track.artist}`;

    const meta = document.createElement("p");
    meta.className = "queue-meta";
    meta.textContent = recommendationMetaLine(track);

    const action = document.createElement("button");
    action.className = "queue-action";
    action.type = "button";
    action.dataset.queueIndex = String(index);
    action.textContent = isActive ? t("queueNow") : t("queueUse");
    action.disabled = isActive || recommendationRunBusy;

    card.append(top, trackLine, meta, action);
    suggestionQueueList.appendChild(card);
  });
}

function refreshSuggestionQueue(prefs = lastPrefs, anchorTrack = currentRecommendation) {
  if (!prefs || !anchorTrack) {
    suggestionQueueTracks = [];
    suggestionQueueContextKey = "";
    renderSuggestionQueue(prefs);
    return;
  }
  suggestionQueueTracks = buildSuggestionQueueFromPrefs(prefs, anchorTrack);
  suggestionQueueContextKey = recommendationContextKey(prefs);
  renderSuggestionQueue(prefs);
}

function registerRecommendationDelivery(track, prefs) {
  if (!track || !prefs) return;
  registerSeenArtist(track.artist);
  const trackKey = `${track.artist}::${track.song}`;
  registerGlobalRecommendation(trackKey);
  if (prefs.style && track?.style === prefs.style) {
    const styleTracks = catalog.filter((item) => item.style === prefs.style);
    const stylePoolSize = styleTracks.length;
    const styleArtistPoolSize = new Set(styleTracks.map((item) => artistMatchKey(item.artist)).filter(Boolean)).size;
    registerServedTrack(prefs.style, trackKey, stylePoolSize);
    registerRecentTrack(prefs.style, trackKey, stylePoolSize);
    registerServedArtist(prefs.style, track.artist, styleArtistPoolSize || stylePoolSize);
  }
}

function supportsTrackInsightApi() {
  return Boolean(String(window?.NEONPULSE_TRACK_AI_URL || "").trim());
}

function trackInsightCacheKey(track, prefs = lastPrefs) {
  const trackKey = recommendationTrackKey(track);
  if (!trackKey) return "";
  return `${currentLanguage}|${trackKey}|${recommendationContextKey(prefs || {})}`;
}

function buildTrackInsightPrompt(track, prefs = {}) {
  const style = styleLabelByValue(track.style);
  const bpmData = resolveBpmDisplay(track);
  const bpmDescriptor = bpmData.aiText;
  const context = prefs.context ? contextLabelByValue(prefs.context) : t("freeContext");
  const energy = energyLabelByValue(track.energy);
  const vibe = String(track.vibe || "").trim();
  if (currentLanguage === "en") {
    return `Give a short DJ-style insight (2 sentences max) about this track for the listener. Track: "${track.song}" by ${track.artist}. Subgenre: ${style}. BPM status: ${bpmDescriptor}. Energy: ${energy}. Context: ${context}. Vibe: ${vibe}. Keep practical and immersive.`;
  }
  if (currentLanguage === "es") {
    return `Da una lectura corta estilo DJ (máximo 2 frases) sobre esta pista para el oyente. Pista: "${track.song}" de ${track.artist}. Subgénero: ${style}. Estado de BPM: ${bpmDescriptor}. Energía: ${energy}. Contexto: ${context}. Vibe: ${vibe}. Mantén un tono práctico e inmersivo.`;
  }
  return `Faça uma leitura curta estilo DJ (máximo 2 frases) sobre esta faixa para o ouvinte. Faixa: "${track.song}" de ${track.artist}. Subgênero: ${style}. Estado de BPM: ${bpmDescriptor}. Energia: ${energy}. Contexto: ${context}. Vibe: ${vibe}. Seja prático e imersivo.`;
}

function localTrackInsight(track, prefs = {}) {
  const style = styleLabelByValue(track.style);
  const bpmData = resolveBpmDisplay(track);
  const bpmValue = bpmData.aiText;
  const energy = energyLabelByValue(track.energy);
  const context = prefs.context ? contextLabelByValue(prefs.context) : t("freeContext");
  const vibe = String(track.vibe || t("trackAiFallback"));
  if (currentLanguage === "en") {
    return `${track.song} keeps your profile in ${style} with ${energy.toLowerCase()} pressure around ${bpmValue}. Use it for ${context.toLowerCase()} and rate in stars so I can tune the next transitions with higher precision.`;
  }
  if (currentLanguage === "es") {
    return `${track.song} mantiene tu perfil en ${style} con presión ${energy.toLowerCase()} cerca de ${bpmValue}. Úsala para ${context.toLowerCase()} y valórala con estrellas para ajustar las próximas transiciones con más precisión.`;
  }
  return `${track.song} mantém seu perfil em ${style} com pressão ${energy.toLowerCase()} perto de ${bpmValue}. Use no contexto ${context.toLowerCase()} e avalie em estrelas para eu ajustar as próximas transições com mais precisão. ${vibe}`;
}

function buildListeningNarrative(track, prefs = {}) {
  if (!track) return "";
  const style = styleLabelByValue(track.style);
  const energy = energyLabelByValue(track.energy);
  const bpmData = resolveBpmDisplay(track);
  const context = prefs.context ? contextLabelByValue(prefs.context) : t("freeContext");
  const genreSignal = String(track.artistGenre || localizedArtistGenreHint(track.artist, track.style) || "").trim();
  const cue = genreSignal ? `${genreSignal} • ${style}` : style;

  if (currentLanguage === "en") {
    return `Now playing: ${track.song} by ${track.artist}. Genre axis ${cue}, ${energy.toLowerCase()} energy around ${bpmData.aiText}, shaped for ${context.toLowerCase()}.`;
  }
  if (currentLanguage === "es") {
    return `Ahora suena ${track.song} de ${track.artist}. Eje de género ${cue}, energía ${energy.toLowerCase()} cerca de ${bpmData.aiText}, pensado para ${context.toLowerCase()}.`;
  }
  return `Tocando agora: ${track.song}, de ${track.artist}. Eixo de gênero ${cue}, energia ${energy.toLowerCase()} perto de ${bpmData.aiText}, pensado para ${context.toLowerCase()}.`;
}

async function revealListeningNarrative(track, prefs = {}) {
  if (!listeningNarrative || !track) return;
  const fullText = String(buildListeningNarrative(track, prefs) || "").trim();
  if (!fullText) {
    listeningNarrative.classList.add("hidden");
    listeningNarrative.classList.remove("typing");
    listeningNarrative.textContent = "";
    return;
  }

  listeningNarrativeToken += 1;
  const token = listeningNarrativeToken;
  listeningNarrative.classList.remove("hidden");
  listeningNarrative.classList.add("typing");
  listeningNarrative.textContent = "";

  const steps = fullText.length >= 260 ? 3 : fullText.length >= 180 ? 2 : 1;
  const frameDelay = fullText.length >= 260 ? 12 : fullText.length >= 180 ? 14 : 16;
  for (let idx = 0; idx <= fullText.length; idx += steps) {
    if (listeningNarrativeToken !== token) {
      listeningNarrative.classList.remove("typing");
      return;
    }
    listeningNarrative.textContent = fullText.slice(0, idx);
    await waitMs(frameDelay);
  }

  if (listeningNarrativeToken !== token) {
    listeningNarrative.classList.remove("typing");
    return;
  }
  listeningNarrative.textContent = fullText;
  listeningNarrative.classList.remove("typing");
}

async function requestTrackInsightFromApi(track, prefs = {}) {
  const endpoint = String(window?.NEONPULSE_TRACK_AI_URL || "").trim();
  if (!endpoint) return "";
  const token = String(window?.NEONPULSE_TRACK_AI_TOKEN || "").trim();
  const headers = {
    "Content-Type": "application/json",
    Accept: "application/json"
  };
  if (token) headers.Authorization = `Bearer ${token}`;

  const controller = typeof AbortController !== "undefined" ? new AbortController() : null;
  let timeoutId = 0;
  try {
    const bpmData = resolveBpmDisplay(track);
    if (controller) timeoutId = window.setTimeout(() => controller.abort(), 8500);
    const response = await fetch(endpoint, {
      method: "POST",
      headers,
      body: JSON.stringify({
        prompt: buildTrackInsightPrompt(track, prefs),
        language: currentLanguage,
        track: {
          song: track.song,
          artist: track.artist,
          style: track.style,
          bpm: bpmData.exact || bpmData.range || "",
          bpmExact: bpmData.exact || null,
          bpmRange: bpmData.range || "",
          bpmStatus: bpmData.statusText,
          energy: track.energy
        },
        context: prefs.context || "",
        userIntent: "music_discovery_commentary"
      }),
      signal: controller?.signal
    });
    if (!response.ok) return "";
    const payload = await response.json();
    const message =
      String(payload?.message || payload?.text || payload?.insight || payload?.output_text || "").trim();
    if (!message) return "";
    return message.slice(0, 420);
  } catch (_err) {
    return "";
  } finally {
    if (timeoutId) window.clearTimeout(timeoutId);
  }
}

async function hydrateTrackInsightForCurrent(track = currentRecommendation, prefs = lastPrefs, { force = false } = {}) {
  if (!trackAiPanel || !trackAiText || !track) return;
  const cacheKey = trackInsightCacheKey(track, prefs);
  if (!cacheKey) return;
  const trackKey = recommendationTrackKey(track);
  currentTrackInsightTrackKey = trackKey;

  if (!force && trackInsightCache.has(cacheKey)) {
    const cached = trackInsightCache.get(cacheKey);
    if (trackKey !== currentTrackInsightTrackKey) return;
    trackAiText.textContent = cached.text || t("trackAiFallback");
    if (trackAiMeta) {
      trackAiMeta.textContent = cached.source === "api" ? t("trackAiApiSource") : t("trackAiLocalSource");
    }
    return;
  }

  trackAiText.textContent = t("trackAiLoading");
  if (trackAiMeta) trackAiMeta.textContent = "";

  const apiText = await requestTrackInsightFromApi(track, prefs || {});
  const source = apiText ? "api" : "local";
  const insightText = apiText || localTrackInsight(track, prefs || {});
  trackInsightCache.set(cacheKey, {
    text: insightText,
    source,
    createdAt: Date.now()
  });

  if (trackKey !== currentTrackInsightTrackKey) return;
  trackAiText.textContent = insightText || t("trackAiFallback");
  if (trackAiMeta) trackAiMeta.textContent = source === "api" ? t("trackAiApiSource") : t("trackAiLocalSource");
}

function renderTrackInsightPanel(track = currentRecommendation, prefs = lastPrefs, { deferHydrate = false, force = false } = {}) {
  if (!trackAiPanel || !trackAiText || !trackAiMeta) return;
  if (!track) {
    trackAiPanel.classList.add("hidden");
    trackAiText.textContent = "";
    trackAiMeta.textContent = "";
    currentTrackInsightTrackKey = "";
    return;
  }
  trackAiPanel.classList.remove("hidden");
  if (trackAiTitle) trackAiTitle.textContent = t("trackAiTitle");
  if (trackAiRefreshBtn) trackAiRefreshBtn.textContent = t("trackAiRefreshBtn");
  if (deferHydrate) return;
  void hydrateTrackInsightForCurrent(track, prefs, { force });
}

function pickRecommendation(
  prefs,
  knownArtists,
  excludedArtists = new Set(),
  excludedTrackKeys = new Set(),
  excludedTrackTitles = new Set()
) {
  const eligibleCatalog = catalog.filter((track) => {
    if (!isTrackEligibleForRecommendation(track)) return false;
    if (prefs.bpm && !trackMatchesBpmPreference(track, prefs.bpm)) return false;
    return true;
  });
  const recentHistory = prefs.style ? new Set(getRecentTrackHistory(prefs.style)) : new Set();
  const servedCycle = prefs.style ? new Set(getServedCycle(prefs.style)) : new Set();
  const servedArtistCycle = prefs.style ? new Set(getServedArtistCycle(prefs.style)) : new Set();
  const previousArtistKey = artistMatchKey(currentRecommendation?.artist || "");
  const artistAllowed = (track) => {
    const artistKey = artistMatchKey(track.artist);
    return Boolean(artistKey) && !artistSetHasMatch(excludedArtists, track.artist) && !artistSetHasMatch(knownArtists, track.artist);
  };
  const trackAllowed = (track) => !trackBlockedByKnownSignals(track, excludedTrackKeys, excludedTrackTitles);
  const styleLockedPool = prefs.style ? eligibleCatalog.filter((track) => track.style === prefs.style) : eligibleCatalog;
  const familyScopedPool = prefs.style
    ? eligibleCatalog.filter((track) => familyOf(track.style) === familyOf(prefs.style))
    : eligibleCatalog;
  const styleLockedAllowedPool = styleLockedPool.filter((track) => artistAllowed(track));
  const familyScopedAllowedPool = familyScopedPool.filter((track) => artistAllowed(track));
  const eligibleAllowedCatalog = eligibleCatalog.filter((track) => artistAllowed(track));
  const trackKeyOf = (track) => normalize(`${track.artist}::${track.song}`);
  const strictFresh = (track) =>
    artistAllowed(track) &&
    trackAllowed(track) &&
    !recommendationMemory.has(trackKeyOf(track)) &&
    !recentHistory.has(trackKeyOf(track)) &&
    !servedCycle.has(trackKeyOf(track)) &&
    !servedArtistCycle.has(artistMatchKey(track.artist));
  const mediumFresh = (track) =>
    artistAllowed(track) &&
    trackAllowed(track) &&
    !recentHistory.has(trackKeyOf(track)) &&
    !servedArtistCycle.has(artistMatchKey(track.artist));
  const looseFresh = (track) =>
    artistAllowed(track) &&
    trackAllowed(track);
  const isUnknown = (track) => artistAllowed(track);

  // Regra crítica: estilo selecionado é estrito; nunca cruzar para outro estilo.
  const candidatesInOrder = prefs.style
    ? [
        styleLockedAllowedPool.filter((track) => isUnknown(track) && strictFresh(track)),
        styleLockedAllowedPool.filter((track) => strictFresh(track)),
        styleLockedAllowedPool.filter((track) => isUnknown(track) && mediumFresh(track)),
        styleLockedAllowedPool.filter((track) => mediumFresh(track)),
        styleLockedAllowedPool.filter((track) => isUnknown(track) && looseFresh(track)),
        styleLockedAllowedPool.filter((track) => looseFresh(track)),
        styleLockedAllowedPool
      ]
    : [
        familyScopedAllowedPool.filter((track) => isUnknown(track) && strictFresh(track)),
        familyScopedAllowedPool.filter((track) => strictFresh(track)),
        familyScopedAllowedPool.filter((track) => isUnknown(track) && mediumFresh(track)),
        familyScopedAllowedPool.filter((track) => mediumFresh(track)),
        eligibleAllowedCatalog.filter((track) => isUnknown(track)),
        eligibleAllowedCatalog
      ];

  let finalPool = candidatesInOrder.find((pool) => pool.length > 0) || [];
  if (!finalPool.length && prefs.style) {
    resetServedCycleIfExhausted(prefs.style);
    resetServedArtistCycleIfExhausted(prefs.style);
    clearRecentHistoryIfExhausted(prefs.style);
    const refreshedRecent = new Set(getRecentTrackHistory(prefs.style));
    const refreshedServed = new Set(getServedCycle(prefs.style));
    const refreshedArtistCycle = new Set(getServedArtistCycle(prefs.style));
    finalPool = styleLockedAllowedPool.filter(
      (track) =>
        !refreshedRecent.has(trackKeyOf(track)) &&
        !refreshedServed.has(trackKeyOf(track)) &&
        !refreshedArtistCycle.has(artistMatchKey(track.artist))
    );
    if (!finalPool.length && refreshedArtistCycle.size) {
      servedArtistCycleByStyle.set(prefs.style, []);
      finalPool = styleLockedAllowedPool.filter(
        (track) => !refreshedRecent.has(trackKeyOf(track)) && !refreshedServed.has(trackKeyOf(track))
      );
    }
  }
  if (!finalPool.length && prefs.style) finalPool = styleLockedAllowedPool;
  // Regra rígida: com subgênero selecionado, nunca faz fallback para outro estilo.
  if (!finalPool.length && prefs.style) return null;
  if (!finalPool.length) finalPool = eligibleAllowedCatalog;
  if (prefs.style && finalPool.length) {
    finalPool = finalPool.filter((track) => track.style === prefs.style);
  }
  if (finalPool.length) {
    finalPool = finalPool.filter((track) => trackAllowed(track));
  }
  if (!finalPool.length) return null;

  const scored = finalPool
    .map((track) => ({ track, score: recommendationScore(track, prefs) }))
    .sort((a, b) => b.score - a.score);

  if (!scored.length) return null;
  const topWindow = scored.slice(0, Math.min(14, scored.length));
  const artistVaried = previousArtistKey
    ? topWindow.filter((entry) => artistMatchKey(entry.track.artist) !== previousArtistKey)
    : topWindow;
  const selectionPool = artistVaried.length ? artistVaried : topWindow;
  const minScore = Math.min(...selectionPool.map((entry) => entry.score));
  const weightedPool = selectionPool.map((entry) => ({
    track: entry.track,
    weight: Math.max(0.06, entry.score - minScore + 0.08)
  }));
  const totalWeight = weightedPool.reduce((sum, entry) => sum + entry.weight, 0);
  let randomCursor = Math.random() * totalWeight;
  for (const item of weightedPool) {
    randomCursor -= item.weight;
    if (randomCursor <= 0) return item.track;
  }
  return weightedPool[0]?.track || null;
}

function pickDiscovery(prefs, knownArtists, mainArtist, excludedDiscoveryNames = new Set()) {
  const weights = getWeights();
  const styleScoped = prefs.style
    ? (() => {
        const strictPool = discoveryCatalog.filter((artist) => artist.style === prefs.style);
        if (strictPool.length) return strictPool;
        return discoveryCatalog.filter((artist) => familyOf(artist.style) === familyOf(prefs.style));
      })()
    : discoveryCatalog;

  const filtered = styleScoped.filter((artist) => {
    const isKnown = artistSetHasMatch(knownArtists, artist.name);
    const isMain = normalize(artist.name) === normalize(mainArtist);
    const isExcluded = excludedDiscoveryNames.has(normalize(artist.name));
    return !isKnown && !isMain && !isExcluded;
  });

  const pool = filtered.length ? filtered : styleScoped.filter((artist) => !excludedDiscoveryNames.has(normalize(artist.name)));
  const finalPool = pool.length ? pool : styleScoped;

  const scored = finalPool
    .map((artist) => {
      let score = 0;
      if (prefs.style && artist.style === prefs.style) score += 2.5 * weights.style;
      if (prefs.style && familyOf(artist.style) === familyOf(prefs.style)) score += 1.1 * weights.style;
      return { artist, score };
    })
    .sort((a, b) => b.score - a.score);

  const bestScore = scored[0].score;
  const top = scored.filter((entry) => entry.score === bestScore).map((entry) => entry.artist);
  return top[Math.floor(Math.random() * top.length)];
}

function renderRecommendation(track, prefs) {
  const meta = getTrackMetadata(track);
  const displayLabel = sanitizeLabel(track.label, track.artist, track.song);

  if (songTitle) songTitle.textContent = track.song;
  if (artistName) artistName.textContent = track.artist;
  if (labelName) labelName.textContent = displayLabel;
  if (styleName) styleName.textContent = styleLabelByValue(track.style);
  if (bpmInfo) bpmInfo.textContent = formatBpmLine(track);
  if (energyInfo) energyInfo.textContent = `${t("energyPrefix")} ${energyLabelByValue(track.energy)}`;
  if (releaseInfo) releaseInfo.textContent = `${t("releasePrefix")}: ${meta.releaseDate}`;
  if (durationInfo) durationInfo.textContent = `${t("durationPrefix")}: ${meta.duration}`;
  if (keyInfo) keyInfo.textContent = `${t("keyPrefix")}: ${meta.musicalKey}`;
  if (catalogInfo) catalogInfo.textContent = `${t("catalogPrefix")}: ${meta.catalogRef} | ${t("labelPrefix")}: ${displayLabel}`;
  if (songVibe) songVibe.textContent = currentLanguage === "pt" ? track.vibe : t("genericVibe", { style: styleLabelByValue(track.style) });
  void revealListeningNarrative(track, prefs);

  if (matchReason) {
    const selectedStyle = prefs.style ? styleLabelByValue(prefs.style) : t("freeStyle");
    const context = prefs.context ? contextLabelByValue(prefs.context) : t("freeContext");
    const energy = prefs.energy ? energyLabelByValue(prefs.energy) : t("freeEnergy");
    matchReason.textContent = `${t("match")}: ${selectedStyle} | ${context} | ${energy}`;
  }

  applyGenreVibeTheme(track.style);

  const spotifyHref = buildSpotifyTrackLink(track);
  const spotifyEnabled = Boolean(spotifyHref && spotifyHref !== "#");
  setListenLinkState(spotifyLink, {
    href: spotifyHref,
    enabled: spotifyEnabled,
    title: track.spotifyVerified === false ? t("spotifyUnverified") : ""
  });
  if (spotifyLink) {
    spotifyLink.classList.toggle("unverified-link", track.spotifyVerified === false && spotifyEnabled);
  }
  const youtubeHref = buildYouTubeTrackLink(track);
  const youtubeEnabled = youtubeLinkTrusted(track);
  setListenLinkState(youtubeLink, {
    href: youtubeHref,
    enabled: youtubeEnabled,
    title: youtubeEnabled ? "" : t("youtubeUnverified")
  });
  const soundcloudHref = track.soundcloudTrackUrl || track.soundcloudUrl || buildSoundCloudTrackLink(track);
  const soundcloudEnabled = soundCloudLinkTrusted(track);
  setListenLinkState(soundcloudLink, {
    href: soundcloudHref,
    enabled: soundcloudEnabled,
    title: soundcloudEnabled ? "" : t("soundcloudUnverified")
  });
  if (knownArtistPrompt) knownArtistPrompt.classList.remove("hidden");
  if (noveltyEnjoyPrompt) noveltyEnjoyPrompt.classList.add("hidden");
  renderTrackRating(track);
  if (generatedBadge) generatedBadge.textContent = t("generatedNow");
  if (primaryTrackCard) {
    primaryTrackCard.classList.remove("fresh");
    void primaryTrackCard.offsetWidth;
    primaryTrackCard.classList.add("fresh");
    primaryTrackCard.scrollIntoView({ behavior: "smooth", block: "center" });
  }

  if (artistBio) {
    artistBio.textContent = detailedArtistBio(track);
    void hydrateArtistBioFromApis(track);
  }
  renderArtistSocialLinks(track);
  if (labelBio) {
    labelBio.textContent = detailedLabelBio(track);
  }
  pulseLine(artistLine);
  pulseLine(bpmLine);
  renderRecentListeners(track);
  renderTopListeners(track);
  renderTrackInsightPanel(track, prefs);
}

async function renderPreview(track) {
  if (!previewPanel || !previewStatus || !trackPreview || !listeningPrompt) return;
  previewPanel.classList.remove("hidden");
  listeningPrompt.classList.add("hidden");
  previewStatus.textContent = t("previewSearching");
  resetTrackPreviewElement(trackPreview);
  resetYouTubePreviewEmbed();
  syncYouTubePreviewAttemptForTrack(track);

  await resolvePreviewForTrack(track);

  const resolvePlayablePreview = async (forceLookup = false) => {
    if (forceLookup) {
      await resolvePreviewForTrack(track, { forceLookup: true });
    }
    const candidates = previewCandidatesForTrack(track);
    if (!candidates.length) return "";
    const playable = await pickPlayablePreviewSource(trackPreview, candidates);
    if (!playable) return "";
    track.previewUrl = playable;
    registerPreviewCandidate(track, playable);
    track.previewChecked = true;
    track.previewMissing = false;
    return playable;
  };

  const refreshedMeta = getTrackMetadata(track);
  const displayLabel = sanitizeLabel(track.label, track.artist, track.song);
  if (bpmInfo) bpmInfo.textContent = formatBpmLine(track);
  if (energyInfo) energyInfo.textContent = `${t("energyPrefix")} ${energyLabelByValue(track.energy)}`;
  if (releaseInfo) releaseInfo.textContent = `${t("releasePrefix")}: ${refreshedMeta.releaseDate}`;
  if (durationInfo) durationInfo.textContent = `${t("durationPrefix")}: ${refreshedMeta.duration}`;
  if (catalogInfo) catalogInfo.textContent = `${t("catalogPrefix")}: ${refreshedMeta.catalogRef} | ${t("labelPrefix")}: ${displayLabel}`;
  const hasDirectYoutube = trackHasDirectYouTubeVideo(track);
  const canRetryYoutube = youtubePreviewCanRetry(track);
  const youtubeAttempt = hasDirectYoutube ? 0 : youtubePreviewSearchAttempt;

  let playablePreview = await resolvePlayablePreview(false);
  if (!playablePreview) {
    playablePreview = await resolvePlayablePreview(true);
  }

  if (playablePreview) {
    trackPreview.classList.remove("hidden");
    const shouldAutoOpenYoutube = hasDirectYoutube;
    const youtubeInlineReady = shouldAutoOpenYoutube
      ? showYouTubePreviewEmbed(track, { autoplay: false, attempt: youtubeAttempt })
      : false;
    setYouTubePreviewActionState({
      visible: true,
      canToggle: true,
      canRetry: canRetryYoutube,
      expanded: youtubeInlineReady
    });

    try {
      trackPreview.muted = false;
      if (!Number.isFinite(trackPreview.volume) || trackPreview.volume <= 0.05) {
        trackPreview.volume = 1;
      }
      trackPreview.currentTime = 0;
      await trackPreview.play();
      const previewLoadedMessage =
        track.previewConfidence && track.previewConfidence >= 0.9
          ? t("previewValidated")
          : t("previewLoaded");
      if (youtubeInlineReady) {
        previewStatus.textContent = `${previewLoadedMessage} ${t("previewYoutubeInlineHint")}`;
      } else if (canRetryYoutube || !hasDirectYoutube) {
        previewStatus.textContent = `${previewLoadedMessage} ${t("previewYoutubeOptionalHint")}`;
      } else {
        previewStatus.textContent = previewLoadedMessage;
      }
      listeningPrompt.classList.remove("hidden");
    } catch (_err) {
      const readyMessage = t("previewReady");
      if (youtubeInlineReady) {
        previewStatus.textContent = `${readyMessage} ${t("previewYoutubeInlineHint")}`;
      } else if (canRetryYoutube || !hasDirectYoutube) {
        previewStatus.textContent = `${readyMessage} ${t("previewYoutubeOptionalHint")}`;
      } else {
        previewStatus.textContent = readyMessage;
      }
      listeningPrompt.classList.remove("hidden");
    }
  } else {
    trackPreview.classList.add("hidden");
    track.previewUrl = "";
    track.previewMissing = true;
    const youtubeFallbackReady = showYouTubePreviewEmbed(track, { autoplay: true, attempt: youtubeAttempt });
    if (youtubeFallbackReady) {
      setYouTubePreviewActionState({
        visible: true,
        canToggle: true,
        canRetry: canRetryYoutube,
        expanded: true
      });
      previewStatus.textContent = t("previewYoutubeFallback");
    } else {
      setYouTubePreviewActionState({ visible: false, canToggle: false, canRetry: false, expanded: false });
      const platforms = availableExternalPlatforms();
      previewStatus.textContent = platforms.length
        ? t("previewUnavailableWithLinks", { platforms: platforms.join("/") })
        : t("previewUnavailable");
    }
    listeningPrompt.classList.remove("hidden");
  }
}

function renderDiscovery(discovery) {
  if (!discoveryCard) return;
  if (!discovery) {
    discoveryCard.classList.add("hidden");
    return;
  }
  registerSeenArtist(discovery.name);

  discoveryCard.classList.remove("hidden");
  if (discoveryArtistName) discoveryArtistName.textContent = discovery.name;
  if (discoveryMeta) discoveryMeta.textContent = `${t("suggestedSubgenre")}: ${styleLabelByValue(discovery.style)}`;
  if (discoveryBio) {
    discoveryBio.textContent =
      currentLanguage === "pt"
        ? discovery.bio
        : t("genericArtistBio", { artist: discovery.name, style: styleLabelByValue(discovery.style) });
  }
  if (discoverySpotifyLink) discoverySpotifyLink.href = discovery.spotifyUrl;
  if (discoveryYoutubeLink) discoveryYoutubeLink.href = discovery.youtubeUrl;
  if (discoverySoundcloudLink) {
    const query = `${discovery.name} ${styleLabelByValue(discovery.style)}`;
    discoverySoundcloudLink.href = `https://soundcloud.com/search?q=${encodeURIComponent(query)}`;
  }
}

function formatSummaryArtistName(value) {
  const raw = String(value || "").trim();
  if (!raw) return "";
  if (/[A-Z]/.test(raw) && /[a-z]/.test(raw)) return raw;
  return raw
    .split(/\s+/)
    .map((part) => {
      if (!part) return part;
      if (/^[a-z]{1,2}$/.test(part)) return part.toUpperCase();
      return `${part.charAt(0).toUpperCase()}${part.slice(1)}`;
    })
    .join(" ");
}

function topArtistsFromMap(mapRef, limit = 10) {
  return [...mapRef.entries()]
    .sort((a, b) => b[1] - a[1])
    .slice(0, limit)
    .map(([artist]) => formatSummaryArtistName(artist));
}

function knownArtistsForSummary(limit = 12) {
  const typedRaw = (knownArtistsEl?.value || "")
    .split(",")
    .map((name) => name.trim())
    .filter(Boolean);
  const byKey = new Map();
  typedRaw.forEach((name) => {
    byKey.set(normalize(name), name);
  });
  knownArtistsMemory.forEach((key) => {
    if (!byKey.has(key)) byKey.set(key, key);
  });
  return Array.from(byKey.values())
    .filter(Boolean)
    .slice(0, limit)
    .map((name) => formatSummaryArtistName(name));
}

function quizBpmRangeLabel(style = "") {
  const rule = STYLE_BPM_RULES[String(style || "").trim()];
  if (!rule || !Number.isFinite(rule.min) || !Number.isFinite(rule.max)) return "";
  if (rule.min === rule.max) return `${rule.min} BPM`;
  return `${rule.min}-${rule.max} BPM`;
}

function quizShuffle(values = []) {
  const cloned = Array.isArray(values) ? values.slice() : [];
  for (let i = cloned.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [cloned[i], cloned[j]] = [cloned[j], cloned[i]];
  }
  return cloned;
}

function quizBuildOptions(correct, decoyPool = [], optionCount = 4) {
  const safeCorrect = String(correct || "").trim();
  if (!safeCorrect) return null;

  const pickedDecoys = [];
  const seen = new Set([normalize(safeCorrect)]);
  const shuffledDecoys = quizShuffle(decoyPool);
  shuffledDecoys.forEach((entry) => {
    const value = String(entry || "").trim();
    const key = normalize(value);
    if (!value || !key || seen.has(key)) return;
    seen.add(key);
    pickedDecoys.push(value);
  });

  if (pickedDecoys.length < optionCount - 1) return null;
  const options = quizShuffle([safeCorrect, ...pickedDecoys.slice(0, optionCount - 1)]);
  const correctIndex = options.findIndex((option) => normalize(option) === normalize(safeCorrect));
  if (correctIndex < 0) return null;
  return { options, correctIndex };
}

function quizBuildOptionsWithPriority(correct, primaryDecoys = [], secondaryDecoys = [], optionCount = 4) {
  const safeCorrect = String(correct || "").trim();
  if (!safeCorrect) return null;

  const seen = new Set([normalize(safeCorrect)]);
  const pickedDecoys = [];
  const takeFrom = (pool = []) => {
    quizShuffle(pool).forEach((entry) => {
      if (pickedDecoys.length >= optionCount - 1) return;
      const value = String(entry || "").trim();
      const key = normalize(value);
      if (!value || !key || seen.has(key)) return;
      seen.add(key);
      pickedDecoys.push(value);
    });
  };

  takeFrom(primaryDecoys);
  if (pickedDecoys.length < optionCount - 1) takeFrom(secondaryDecoys);
  if (pickedDecoys.length < optionCount - 1) return null;

  const options = quizShuffle([safeCorrect, ...pickedDecoys.slice(0, optionCount - 1)]);
  const correctIndex = options.findIndex((option) => normalize(option) === normalize(safeCorrect));
  if (correctIndex < 0) return null;
  return { options, correctIndex };
}

function buildArtistDisplayIndex() {
  const map = new Map();
  const addArtist = (artistLike = "") => {
    const raw = String(artistLike || "").trim();
    const key = normalize(raw);
    if (!key) return;
    if (!map.has(key)) map.set(key, raw);
  };

  catalog.forEach((track) => addArtist(track?.artist));
  discoveryCatalog.forEach((entry) => addArtist(entry?.name));
  Object.values(STYLE_ARTIST_SEEDS).forEach((artists) => {
    (artists || []).forEach((artist) => addArtist(artist));
  });
  Object.keys(ARTIST_CANONICAL_ORIGINS || {}).forEach((artistKey) => addArtist(artistKey));
  return map;
}

function quizCollectKnownArtists() {
  const knownByKey = new Map();
  const displayIndex = buildArtistDisplayIndex();

  const addRaw = (artistLike = "") => {
    const raw = String(artistLike || "").trim();
    const key = normalize(raw);
    if (!key) return;
    if (!knownByKey.has(key)) {
      knownByKey.set(key, raw || displayIndex.get(key) || formatSummaryArtistName(key));
    }
  };

  const addNormalized = (artistLike = "") => {
    const key = normalize(artistLike);
    if (!key || knownByKey.has(key)) return;
    knownByKey.set(key, displayIndex.get(key) || formatSummaryArtistName(key));
  };

  String(knownArtistsEl?.value || "")
    .split(",")
    .map((entry) => String(entry || "").trim())
    .filter(Boolean)
    .forEach((artist) => addRaw(artist));

  knownArtistsMemory.forEach((artistKey) => addNormalized(artistKey));
  adaptiveModel.likedArtists.forEach((_score, artistKey) => addNormalized(artistKey));
  adaptiveModel.dislikedArtists.forEach((_score, artistKey) => addNormalized(artistKey));
  discoveredArtistsInApp.forEach((artistKey) => addNormalized(artistKey));
  return { knownByKey, displayIndex };
}

function quizStylesForArtist(artistName = "", artistKey = "", cache = null) {
  const raw = String(artistName || artistKey || "").trim();
  const key = normalize(artistKey || raw);
  if (!key) return [];
  if (cache instanceof Map && cache.has(key)) return cache.get(key);

  const styles = new Set();
  const probeName = raw || key;

  (allowedStylesForArtist(probeName) || []).forEach((style) => {
    if (STYLE_BPM_RULES[style]) styles.add(style);
  });

  Object.entries(STYLE_ARTIST_SEEDS).forEach(([style, artists]) => {
    if (!STYLE_BPM_RULES[style] || !Array.isArray(artists)) return;
    const matches = artists.some((seed) => {
      const normalizedSeed = normalize(seed);
      if (normalizedSeed === key) return true;
      return isArtistMatch(probeName, seed) || isArtistMatch(seed, probeName);
    });
    if (matches) styles.add(style);
  });

  catalog.forEach((track) => {
    if (!track?.style || !STYLE_BPM_RULES[track.style]) return;
    const trackArtist = String(track.artist || "").trim();
    if (!trackArtist) return;
    const trackArtistKey = normalize(trackArtist);
    if (
      trackArtistKey === key ||
      isArtistMatch(trackArtist, probeName) ||
      isArtistMatch(probeName, trackArtist)
    ) {
      styles.add(track.style);
    }
  });

  discoveryCatalog.forEach((entry) => {
    if (!entry?.style || !STYLE_BPM_RULES[entry.style]) return;
    const discoveryName = String(entry.name || "").trim();
    if (!discoveryName) return;
    const discoveryKey = normalize(discoveryName);
    if (
      discoveryKey === key ||
      isArtistMatch(discoveryName, probeName) ||
      isArtistMatch(probeName, discoveryName)
    ) {
      styles.add(entry.style);
    }
  });

  const resolvedStyles = Array.from(styles).filter(Boolean);
  if (cache instanceof Map) cache.set(key, resolvedStyles);
  return resolvedStyles;
}

function quizKnownArtistsByStyle() {
  const { knownByKey, displayIndex } = quizCollectKnownArtists();
  const byStyle = new Map();
  const styleCache = new Map();

  knownByKey.forEach((displayName, artistKey) => {
    const styles = quizStylesForArtist(displayName, artistKey, styleCache);
    styles.forEach((style) => {
      if (!STYLE_BPM_RULES[style]) return;
      if (!byStyle.has(style)) byStyle.set(style, new Map());
      byStyle.get(style).set(artistKey, displayName);
    });
  });

  return { byStyle, knownByKey, displayIndex, styleCache };
}

function quizKnownCountForStyle(style = "") {
  const safeStyle = String(style || "").trim();
  if (!safeStyle) return 0;
  const state = quizKnownArtistsByStyle();
  return state.byStyle.get(safeStyle)?.size || 0;
}

function quizOriginSignalForArtist(artistName = "") {
  const raw = String(artistName || "").trim();
  const key = normalize(raw);
  if (!key) return null;
  const canonical = canonicalOriginForArtist(raw);
  if (canonical?.country) {
    return {
      country: String(canonical.country || "").trim(),
      area: String(canonical.area || "").trim()
    };
  }

  const countries = new Set();
  const areas = new Set();
  catalog.forEach((track) => {
    const trackArtist = String(track?.artist || "").trim();
    if (!trackArtist) return;
    const trackKey = normalize(trackArtist);
    const matches = trackKey === key || isArtistMatch(trackArtist, raw) || isArtistMatch(raw, trackArtist);
    if (!matches) return;
    const country = String(track?.artistCountry || "").trim();
    const area = String(track?.artistArea || "").trim();
    if (country) countries.add(country);
    if (area) areas.add(area);
  });
  if (countries.size !== 1) return null;
  return {
    country: Array.from(countries)[0] || "",
    area: areas.size === 1 ? Array.from(areas)[0] : ""
  };
}

function quizCollectStyleFacts(style, displayIndex = null) {
  const safeStyle = String(style || "").trim();
  if (!safeStyle || !STYLE_BPM_RULES[safeStyle]) {
    return {
      style: "",
      tracks: [],
      artists: [],
      artistMap: new Map(),
      tracksByArtist: new Map(),
      labels: []
    };
  }

  const artistDisplayIndex = displayIndex instanceof Map ? displayIndex : buildArtistDisplayIndex();
  const trackSeen = new Set();
  const tracks = [];
  catalog.forEach((track) => {
    if (!track || track.style !== safeStyle) return;
    const artist = String(track.artist || "").trim();
    const song = String(track.song || "").trim();
    if (!artist || !song) return;
    if (!artistAllowedForStyle(safeStyle, artist)) return;
    const trackKey = recommendationTrackKey(track) || normalize(`${artist}::${song}`);
    if (!trackKey || trackSeen.has(trackKey)) return;
    trackSeen.add(trackKey);
    tracks.push(track);
  });

  const artistMap = new Map();
  const addArtist = (artistLike = "") => {
    const raw = String(artistLike || "").trim();
    const key = normalize(raw);
    if (!key || !artistAllowedForStyle(safeStyle, raw || key)) return;
    if (!artistMap.has(key)) {
      artistMap.set(key, artistDisplayIndex.get(key) || raw || formatSummaryArtistName(key));
    }
  };

  tracks.forEach((track) => addArtist(track.artist));
  (STYLE_ARTIST_SEEDS[safeStyle] || []).forEach((artist) => addArtist(artist));
  discoveryCatalog
    .filter((entry) => entry?.style === safeStyle)
    .forEach((entry) => addArtist(entry.name));

  const tracksByArtist = new Map();
  const labelsByKey = new Map();

  tracks.forEach((track) => {
    const artistKey = normalize(track.artist);
    addArtist(track.artist);
    if (!artistMap.has(artistKey)) return;
    if (!tracksByArtist.has(artistKey)) tracksByArtist.set(artistKey, []);

    const currentTracks = tracksByArtist.get(artistKey);
    const songKey = normalizeTitle(track.song);
    if (!currentTracks.some((item) => normalizeTitle(item.song) === songKey)) {
      currentTracks.push(track);
    }

    const safeLabel = sanitizeLabel(track.label, track.artist, track.song);
    const labelKey = normalize(safeLabel);
    if (safeLabel && labelKey && labelKey !== normalize("Catálogo dinâmico") && !labelsByKey.has(labelKey)) {
      labelsByKey.set(labelKey, safeLabel);
    }
  });

  return {
    style: safeStyle,
    tracks,
    artists: Array.from(artistMap.values()),
    artistMap,
    tracksByArtist,
    labels: Array.from(labelsByKey.values())
  };
}

function quizCollectGlobalArtistPool(style, styleCache, displayIndex, blockedKeys = new Set()) {
  const safeStyle = String(style || "").trim();
  const artistsByKey = new Map();
  const addArtist = (artistLike = "") => {
    const raw = String(artistLike || "").trim();
    const key = normalize(raw);
    if (!key || blockedKeys.has(key)) return;
    if (!artistsByKey.has(key)) artistsByKey.set(key, displayIndex.get(key) || raw || formatSummaryArtistName(key));
  };

  catalog.forEach((track) => addArtist(track?.artist));
  discoveryCatalog.forEach((entry) => addArtist(entry?.name));
  Object.values(STYLE_ARTIST_SEEDS).forEach((artists) => {
    (artists || []).forEach((artist) => addArtist(artist));
  });

  return Array.from(artistsByKey.entries())
    .filter(([artistKey, artistName]) => {
      const styles = quizStylesForArtist(artistName, artistKey, styleCache);
      return !styles.includes(safeStyle);
    })
    .map(([, artistName]) => artistName);
}

function quizCollectStyleArtistPool(style, displayIndex, blockedKeys = new Set()) {
  const safeStyle = String(style || "").trim();
  if (!safeStyle || !STYLE_BPM_RULES[safeStyle]) return [];
  const artistDisplayIndex = displayIndex instanceof Map ? displayIndex : buildArtistDisplayIndex();
  const artistsByKey = new Map();
  const addArtist = (artistLike = "") => {
    const raw = String(artistLike || "").trim();
    const key = normalize(raw);
    if (!key || blockedKeys.has(key)) return;
    if (!artistAllowedForStyle(safeStyle, raw || key)) return;
    if (!artistsByKey.has(key)) artistsByKey.set(key, artistDisplayIndex.get(key) || raw || formatSummaryArtistName(key));
  };

  catalog.forEach((track) => {
    if (track?.style !== safeStyle) return;
    addArtist(track?.artist);
  });
  discoveryCatalog.forEach((entry) => {
    if (entry?.style !== safeStyle) return;
    addArtist(entry?.name);
  });
  (STYLE_ARTIST_SEEDS[safeStyle] || []).forEach((artist) => addArtist(artist));
  return Array.from(artistsByKey.values());
}

function quizCollectGlobalTrackTitles(excludedArtistKey = "") {
  const blockedArtist = normalize(excludedArtistKey);
  const titlesByKey = new Map();
  catalog.forEach((track) => {
    if (!track?.song) return;
    if (blockedArtist && normalize(track.artist) === blockedArtist) return;
    const title = String(track.song || "").trim();
    const key = normalizeTitle(title);
    if (!key || titlesByKey.has(key)) return;
    titlesByKey.set(key, title);
  });
  return Array.from(titlesByKey.values());
}

function quizCollectGlobalLabels() {
  const labelsByKey = new Map();
  catalog.forEach((track) => {
    const safeLabel = sanitizeLabel(track?.label, track?.artist, track?.song);
    const key = normalize(safeLabel);
    if (!safeLabel || !key || key === normalize("Catálogo dinâmico")) return;
    if (!labelsByKey.has(key)) labelsByKey.set(key, safeLabel);
  });
  return Array.from(labelsByKey.values());
}

function quizCollectCountryPool() {
  const countriesByKey = new Map();
  const addCountry = (countryLike = "") => {
    const country = String(countryLike || "").trim();
    const key = normalize(country);
    if (!country || !key || countriesByKey.has(key)) return;
    countriesByKey.set(key, country);
  };
  Object.values(ARTIST_CANONICAL_ORIGINS || {}).forEach((origin) => {
    addCountry(origin?.country);
  });
  catalog.forEach((track) => addCountry(track?.artistCountry));
  ["Brazil", "Portugal", "Israel", "Germany", "Russia", "Mexico", "Japan", "France"].forEach((country) =>
    addCountry(country)
  );
  return Array.from(countriesByKey.values());
}

function buildQuizQuestionArtistInStyle(style, facts, context) {
  if (!facts.artists.length) return null;
  const correctArtist = pickRandomTrack(facts.artists);
  const blocked = new Set(facts.artistMap.keys());
  const decoyPool = quizCollectGlobalArtistPool(style, context.styleCache, context.displayIndex, blocked);
  const optionsPayload = quizBuildOptions(correctArtist, decoyPool, 4);
  if (!optionsPayload) return null;
  const styleName = styleLabelByValue(style);
  return {
    signature: `artist-in-style::${style}::${normalize(correctArtist)}`,
    prompt: q("questionArtistInStyle", { style: styleName }),
    options: optionsPayload.options,
    correctIndex: optionsPayload.correctIndex,
    explanation: q("expArtistInStyle", { artist: correctArtist, style: styleName })
  };
}

function buildQuizQuestionTrackByArtist(style, facts) {
  const candidates = Array.from(facts.tracksByArtist.entries()).filter(([, tracks]) => Array.isArray(tracks) && tracks.length);
  if (!candidates.length) return null;
  const [artistKey, tracks] = pickRandomTrack(candidates);
  const artistName = facts.artistMap.get(artistKey) || tracks[0]?.artist || formatSummaryArtistName(artistKey);
  const correctTrack = pickRandomTrack(tracks);
  if (!correctTrack?.song) return null;

  const localDecoys = facts.tracks
    .filter((track) => normalize(track.artist) !== artistKey)
    .map((track) => String(track.song || "").trim());
  const globalDecoys = quizCollectGlobalTrackTitles(artistKey);
  const optionsPayload = quizBuildOptionsWithPriority(correctTrack.song, localDecoys, globalDecoys, 4);
  if (!optionsPayload) return null;

  return {
    signature: `track-by-artist::${style}::${normalize(artistName)}::${normalizeTitle(correctTrack.song)}`,
    prompt: q("questionTrackByArtist", { artist: artistName }),
    options: optionsPayload.options,
    correctIndex: optionsPayload.correctIndex,
    explanation: q("expTrackByArtist", { song: correctTrack.song, artist: artistName })
  };
}

function buildQuizQuestionArtistOfTrack(style, facts, context) {
  if (!facts.tracks.length) return null;
  const targetTrack = pickRandomTrack(facts.tracks);
  const correctArtist = String(targetTrack.artist || "").trim();
  if (!correctArtist || !targetTrack.song) return null;

  const localDecoys = facts.artists.filter((artist) => normalize(artist) !== normalize(correctArtist));
  const blocked = new Set([normalize(correctArtist)]);
  localDecoys.forEach((artist) => blocked.add(normalize(artist)));
  const styleDecoys = quizCollectStyleArtistPool(style, context.displayIndex, blocked);
  const primaryDecoys = [...localDecoys, ...styleDecoys];
  const globalDecoys = quizCollectGlobalArtistPool(style, context.styleCache, context.displayIndex, blocked);
  const optionsPayload = quizBuildOptionsWithPriority(correctArtist, primaryDecoys, globalDecoys, 4);
  if (!optionsPayload) return null;

  return {
    signature: `artist-of-track::${style}::${normalizeTitle(targetTrack.song)}`,
    prompt: q("questionArtistOfTrack", { song: targetTrack.song }),
    options: optionsPayload.options,
    correctIndex: optionsPayload.correctIndex,
    explanation: q("expArtistOfTrack", { song: targetTrack.song, artist: correctArtist })
  };
}

function buildQuizQuestionLabelByTrack(style, facts) {
  const labelTracks = facts.tracks
    .map((track) => {
      const safeLabel = sanitizeLabel(track.label, track.artist, track.song);
      return {
        track,
        label: safeLabel
      };
    })
    .filter((entry) => {
      const labelKey = normalize(entry.label);
      return entry.label && labelKey && labelKey !== normalize("Catálogo dinâmico");
    });
  if (!labelTracks.length) return null;

  const selected = pickRandomTrack(labelTracks);
  const track = selected.track;
  const correctLabel = selected.label;
  const localDecoys = facts.labels.filter((label) => normalize(label) !== normalize(correctLabel));
  const globalDecoys = quizCollectGlobalLabels().filter((label) => normalize(label) !== normalize(correctLabel));
  const optionsPayload = quizBuildOptionsWithPriority(correctLabel, localDecoys, globalDecoys, 4);
  if (!optionsPayload) return null;

  return {
    signature: `label-by-track::${style}::${normalizeTitle(track.song)}::${normalize(correctLabel)}`,
    prompt: q("questionLabelByTrack", { song: track.song, artist: track.artist }),
    options: optionsPayload.options,
    correctIndex: optionsPayload.correctIndex,
    explanation: q("expLabelByTrack", { song: track.song, artist: track.artist, label: correctLabel })
  };
}

function buildQuizQuestionBpmByStyle(style) {
  const correctRange = quizBpmRangeLabel(style);
  if (!correctRange) return null;
  const decoyPool = Object.keys(STYLE_BPM_RULES)
    .filter((styleKey) => styleKey !== style)
    .map((styleKey) => quizBpmRangeLabel(styleKey))
    .filter(Boolean)
    .filter((range) => normalize(range) !== normalize(correctRange));
  const optionsPayload = quizBuildOptions(correctRange, decoyPool, 4);
  if (!optionsPayload) return null;
  const styleName = styleLabelByValue(style);
  return {
    signature: `bpm-style::${style}`,
    prompt: q("questionBpmByStyle", { style: styleName }),
    options: optionsPayload.options,
    correctIndex: optionsPayload.correctIndex,
    explanation: q("expBpmByStyle", { style: styleName })
  };
}

function buildQuizQuestionOrigin(style, facts) {
  const candidates = facts.artists
    .map((artist) => ({
      artist,
      origin: quizOriginSignalForArtist(artist)
    }))
    .filter((item) => item.origin?.country);
  if (!candidates.length) return null;
  const picked = pickRandomTrack(candidates);
  const correctCountry = String(picked.origin.country || "").trim();
  if (!correctCountry) return null;
  const decoyPool = quizCollectCountryPool().filter((country) => normalize(country) !== normalize(correctCountry));
  const optionsPayload = quizBuildOptions(correctCountry, decoyPool, 4);
  if (!optionsPayload) return null;
  const originSummary = picked.origin.area ? `${picked.origin.area}, ${correctCountry}` : correctCountry;
  return {
    signature: `origin::${style}::${normalize(picked.artist)}`,
    prompt: q("questionOrigin", { artist: picked.artist }),
    options: optionsPayload.options,
    correctIndex: optionsPayload.correctIndex,
    explanation: q("expOrigin", { artist: picked.artist, origin: originSummary })
  };
}

function buildQuizQuestionStyleForArtist(style, facts, context) {
  if (!facts.artists.length) return null;
  const candidates = facts.artists
    .map((artist) => {
      const styles = quizStylesForArtist(artist, normalize(artist), context.styleCache);
      return { artist, styles };
    })
    .filter((item) => item.styles.includes(style));
  if (!candidates.length) return null;

  const picked = pickRandomTrack(candidates);
  const membership = new Set(picked.styles);
  const decoyStyles = getAllSelectableStyles().filter((styleKey) => !membership.has(styleKey) && styleKey !== style);
  if (decoyStyles.length < 3) return null;
  const optionStyleValues = quizShuffle([style, ...quizShuffle(decoyStyles).slice(0, 3)]);
  const options = optionStyleValues.map((styleValue) => styleLabelByValue(styleValue));
  const correctIndex = optionStyleValues.indexOf(style);
  if (correctIndex < 0) return null;
  return {
    signature: `style-for-artist::${style}::${normalize(picked.artist)}`,
    prompt: q("questionStyleForArtist", { artist: picked.artist }),
    options,
    correctIndex,
    explanation: q("expStyleForArtist", { artist: picked.artist, style: styleLabelByValue(style) })
  };
}

function quizQuestionCountForKnown(knownCount = 0) {
  const safeCount = Math.max(0, Number(knownCount) || 0);
  const bonus = Math.floor(Math.max(0, safeCount - QUIZ_TRIGGER_MIN_KNOWN) / 4);
  return Math.max(3, Math.min(QUIZ_MAX_QUESTION_COUNT, QUIZ_BASE_QUESTION_COUNT + bonus));
}

function buildQuizQuestions(style, knownCount = 0, displayIndex = null) {
  const safeStyle = String(style || "").trim();
  if (!safeStyle || !STYLE_BPM_RULES[safeStyle]) return [];
  const resolvedDisplayIndex = displayIndex instanceof Map ? displayIndex : buildArtistDisplayIndex();
  const styleCache = new Map();
  const facts = quizCollectStyleFacts(safeStyle, resolvedDisplayIndex);
  if (!facts.artists.length) return [];

  const targetCount = quizQuestionCountForKnown(knownCount);
  const primaryBuilders = quizShuffle([
    (ctx) => buildQuizQuestionTrackByArtist(ctx.style, ctx.facts, ctx),
    (ctx) => buildQuizQuestionArtistOfTrack(ctx.style, ctx.facts, ctx),
    (ctx) => buildQuizQuestionLabelByTrack(ctx.style, ctx.facts, ctx),
    (ctx) => buildQuizQuestionOrigin(ctx.style, ctx.facts, ctx),
    (ctx) => buildQuizQuestionBpmByStyle(ctx.style, ctx.facts, ctx)
  ]);
  const fallbackBuilders = quizShuffle([(ctx) => buildQuizQuestionArtistInStyle(ctx.style, ctx.facts, ctx)]);
  const context = {
    style: safeStyle,
    facts,
    styleCache,
    displayIndex: resolvedDisplayIndex
  };

  const questions = [];
  const usedSignatures = new Set();
  const pushQuestion = (question) => {
    if (!question?.signature || usedSignatures.has(question.signature)) return false;
    if (!Array.isArray(question.options) || question.options.length < 4) return false;
    if (!Number.isFinite(question.correctIndex) || question.correctIndex < 0) return false;
    usedSignatures.add(question.signature);
    questions.push(question);
    return true;
  };
  const fillFromBuilders = (builders = [], guardLimit = 140) => {
    if (!Array.isArray(builders) || !builders.length) return;
    let guard = 0;
    while (questions.length < targetCount && guard < guardLimit) {
      const builder = builders[guard % builders.length];
      guard += 1;
      if (typeof builder !== "function") continue;
      const question = builder(context);
      pushQuestion(question);
    }
  };

  fillFromBuilders(primaryBuilders, 180);
  if (questions.length < Math.min(3, targetCount)) {
    fillFromBuilders(fallbackBuilders, 80);
  }

  return questions.length >= 3 ? questions : [];
}

function quizOfferStateReady() {
  if (preAppScreensVisible()) return false;
  if (appContent?.classList.contains("hidden")) return false;
  if (searchOverlay && !searchOverlay.classList.contains("hidden")) return false;
  if (recommendationRunBusy) return false;
  return true;
}

function hideQuizChallengeBubble({ clearPending = false } = {}) {
  if (quizChallengeBubble) quizChallengeBubble.classList.add("hidden");
  if (clearPending) quizPendingChallenge = null;
}

function renderQuizChallengeBubble(challenge = quizPendingChallenge) {
  if (!quizChallengeBubble || !quizBubbleText || !challenge) return;
  quizPendingChallenge = challenge;
  const styleName = styleLabelByValue(challenge.style) || challenge.style || t("freeStyle");
  quizBubbleText.textContent = q("bubblePrompt", {
    count: challenge.knownCount,
    style: styleName
  });
  if (quizStartBtn) quizStartBtn.textContent = q("startBtn");
  if (quizLaterBtn) quizLaterBtn.textContent = q("laterBtn");
  quizChallengeBubble.classList.remove("hidden");
}

function resolveQuizChallengeCandidate() {
  const { byStyle } = quizKnownArtistsByStyle();
  const selectedStyle = String(styleEl?.value || "").trim();
  const candidates = [];

  byStyle.forEach((artistsByKey, style) => {
    const knownCount = artistsByKey.size;
    const thresholdRaw = Number(quizNextOfferCountByStyle.get(style));
    const threshold = Number.isFinite(thresholdRaw) && thresholdRaw > 0
      ? Math.max(QUIZ_TRIGGER_MIN_KNOWN, Math.round(thresholdRaw))
      : QUIZ_TRIGGER_MIN_KNOWN;
    if (knownCount < QUIZ_TRIGGER_MIN_KNOWN) return;
    if (knownCount < threshold) return;
    candidates.push({ style, knownCount, threshold });
  });

  if (!candidates.length) return null;
  candidates.sort((a, b) => {
    const selectedA = a.style === selectedStyle ? 1 : 0;
    const selectedB = b.style === selectedStyle ? 1 : 0;
    if (selectedA !== selectedB) return selectedB - selectedA;
    if (b.knownCount !== a.knownCount) return b.knownCount - a.knownCount;
    return a.style.localeCompare(b.style);
  });
  return candidates[0];
}

function evaluateQuizChallengeNow() {
  if (!quizOfferStateReady()) {
    hideQuizChallengeBubble({ clearPending: false });
    return;
  }

  const candidate = resolveQuizChallengeCandidate();
  if (!candidate) {
    hideQuizChallengeBubble({ clearPending: true });
    return;
  }

  if ((quizOverlay && !quizOverlay.classList.contains("hidden")) || quizSession) {
    quizPendingChallenge = candidate;
    hideQuizChallengeBubble({ clearPending: false });
    return;
  }

  renderQuizChallengeBubble(candidate);
}

function scheduleQuizChallengeEvaluation(delayMs = 260) {
  if (quizOfferTimer) window.clearTimeout(quizOfferTimer);
  quizOfferTimer = window.setTimeout(() => {
    quizOfferTimer = 0;
    evaluateQuizChallengeNow();
  }, Math.max(0, Number(delayMs) || 0));
}

function snoozeQuizChallenge() {
  const challenge = quizPendingChallenge || resolveQuizChallengeCandidate();
  if (!challenge) {
    hideQuizChallengeBubble({ clearPending: true });
    return;
  }
  const nextThreshold = Math.max(
    QUIZ_TRIGGER_MIN_KNOWN,
    challenge.knownCount + QUIZ_REOFFER_STEP
  );
  quizNextOfferCountByStyle.set(challenge.style, nextThreshold);
  hideQuizChallengeBubble({ clearPending: true });
  saveProgress();
  showToast(q("laterToast"));
  playUiSfx("swap");
}

function renderQuizIdleState() {
  if (quizKicker) quizKicker.textContent = q("overlayKicker");
  if (quizTitle) quizTitle.textContent = q("overlayTitle", { style: styleLabelByValue(styleEl?.value || "") || t("freeStyle") });
  if (quizMeta) quizMeta.textContent = q("overlayMetaProgress", { current: 1, total: QUIZ_BASE_QUESTION_COUNT });
  if (quizQuestionText) quizQuestionText.textContent = q("overlayPreparing");
  if (quizProgressFill) quizProgressFill.style.width = "0%";
  if (quizOptions) quizOptions.innerHTML = "";
  if (quizFeedbackText) {
    quizFeedbackText.textContent = "";
    quizFeedbackText.classList.remove("correct", "wrong");
    quizFeedbackText.classList.add("muted");
  }
  if (quizSubmitBtn) {
    quizSubmitBtn.textContent = q("submitBtn");
    quizSubmitBtn.classList.remove("hidden");
  }
  if (quizNextBtn) {
    quizNextBtn.textContent = q("nextBtn");
    quizNextBtn.classList.add("hidden");
  }
  if (quizRetryBtn) {
    quizRetryBtn.textContent = q("retryBtn");
    quizRetryBtn.classList.add("hidden");
  }
  if (quizCloseBtn) quizCloseBtn.textContent = q("closeBtn");
}

function renderQuizQuestionState() {
  if (!quizSession || quizSession.completed) return;
  const total = quizSession.questions.length;
  const index = Math.max(0, Math.min(total - 1, Number(quizSession.index) || 0));
  const question = quizSession.questions[index];
  if (!question) return;

  if (quizKicker) quizKicker.textContent = q("overlayKicker");
  if (quizTitle) quizTitle.textContent = q("overlayTitle", { style: styleLabelByValue(quizSession.style) || quizSession.style });
  if (quizMeta) quizMeta.textContent = q("overlayMetaProgress", { current: index + 1, total });
  if (quizQuestionText) quizQuestionText.textContent = question.prompt;
  if (quizProgressFill) {
    const completed = quizCurrentAnswered ? index + 1 : index;
    const width = (completed / Math.max(1, total)) * 100;
    quizProgressFill.style.width = `${Math.max(0, Math.min(100, width)).toFixed(1)}%`;
  }

  if (quizOptions) {
    quizOptions.innerHTML = "";
    question.options.forEach((optionText, optionIndex) => {
      const optionBtn = document.createElement("button");
      optionBtn.type = "button";
      optionBtn.className = "quiz-option";
      optionBtn.dataset.optionIndex = String(optionIndex);
      optionBtn.textContent = optionText;

      if (optionIndex === quizSelectedOption) optionBtn.classList.add("active");
      if (quizCurrentAnswered) {
        optionBtn.disabled = true;
        if (optionIndex === question.correctIndex) optionBtn.classList.add("correct");
        if (optionIndex === quizSelectedOption && optionIndex !== question.correctIndex) optionBtn.classList.add("wrong");
      }
      quizOptions.appendChild(optionBtn);
    });
  }

  if (quizFeedbackText) {
    quizFeedbackText.classList.remove("correct", "wrong");
    if (!quizCurrentAnswered) {
      quizFeedbackText.textContent = "";
      quizFeedbackText.classList.add("muted");
    } else {
      const isCorrect = quizSelectedOption === question.correctIndex;
      const correctAnswer = question.options[question.correctIndex] || "";
      const prefix = isCorrect ? q("correctPrefix") : q("wrongPrefix", { answer: correctAnswer });
      quizFeedbackText.textContent = `${prefix} ${question.explanation || ""}`.trim();
      quizFeedbackText.classList.remove("muted");
      quizFeedbackText.classList.add(isCorrect ? "correct" : "wrong");
    }
  }

  if (quizSubmitBtn) {
    quizSubmitBtn.textContent = q("submitBtn");
    quizSubmitBtn.classList.toggle("hidden", quizCurrentAnswered);
    quizSubmitBtn.disabled = Boolean(quizCurrentAnswered);
  }
  if (quizNextBtn) {
    const isLastQuestion = index >= total - 1;
    quizNextBtn.textContent = isLastQuestion ? q("finishBtn") : q("nextBtn");
    quizNextBtn.classList.toggle("hidden", !quizCurrentAnswered);
    quizNextBtn.disabled = !quizCurrentAnswered;
  }
  if (quizRetryBtn) {
    quizRetryBtn.textContent = q("retryBtn");
    quizRetryBtn.classList.add("hidden");
  }
  if (quizCloseBtn) quizCloseBtn.textContent = q("closeBtn");
}

function quizResultHeadline(percent = 0, styleName = "") {
  const value = Math.max(0, Number(percent) || 0);
  if (value >= 84) return q("resultExcellent", { style: styleName });
  if (value >= 60) return q("resultGood", { style: styleName });
  return q("resultStudy", { style: styleName });
}

function renderQuizResultState() {
  if (!quizSession) return;
  const total = quizSession.questions.length;
  const score = Math.max(0, Number(quizSession.score) || 0);
  const percent = Math.round((score / Math.max(1, total)) * 100);
  const styleName = styleLabelByValue(quizSession.style) || quizSession.style;
  const attempts = Math.max(0, Number(quizAttemptsByStyle.get(quizSession.style)) || 0);
  const best = Math.max(0, Number(quizBestScoreByStyle.get(quizSession.style)) || percent);

  if (quizKicker) quizKicker.textContent = q("overlayKicker");
  if (quizTitle) quizTitle.textContent = q("overlayTitle", { style: styleName });
  if (quizMeta) quizMeta.textContent = q("overlayMetaResult", { score, total, percent });
  if (quizQuestionText) quizQuestionText.textContent = quizResultHeadline(percent, styleName);
  if (quizProgressFill) quizProgressFill.style.width = "100%";
  if (quizOptions) quizOptions.innerHTML = "";
  if (quizFeedbackText) {
    quizFeedbackText.textContent = q("resultFooter", {
      style: styleName,
      best,
      attempts
    });
    quizFeedbackText.classList.remove("correct", "wrong");
    quizFeedbackText.classList.add("muted");
  }
  if (quizSubmitBtn) quizSubmitBtn.classList.add("hidden");
  if (quizNextBtn) quizNextBtn.classList.add("hidden");
  if (quizRetryBtn) {
    quizRetryBtn.textContent = q("retryBtn");
    quizRetryBtn.classList.remove("hidden");
  }
  if (quizCloseBtn) quizCloseBtn.textContent = q("closeBtn");
}

function startQuizSession(style, knownCount = 0) {
  const safeStyle = String(style || "").trim();
  if (!safeStyle || !STYLE_BPM_RULES[safeStyle]) return false;

  const { displayIndex } = quizCollectKnownArtists();
  const questions = buildQuizQuestions(safeStyle, knownCount, displayIndex);
  if (!questions.length) return false;

  quizSession = {
    style: safeStyle,
    knownCount: Math.max(0, Number(knownCount) || 0),
    questions,
    index: 0,
    score: 0,
    completed: false,
    startedAt: Date.now()
  };
  quizSelectedOption = -1;
  quizCurrentAnswered = false;

  hideQuizChallengeBubble({ clearPending: true });
  if (quizOverlay) quizOverlay.classList.remove("hidden");
  renderQuizQuestionState();
  return true;
}

function startQuizFromChallenge() {
  const challenge = quizPendingChallenge || resolveQuizChallengeCandidate();
  if (!challenge) return;
  const started = startQuizSession(challenge.style, challenge.knownCount);
  if (!started) {
    quizNextOfferCountByStyle.set(
      challenge.style,
      Math.max(QUIZ_TRIGGER_MIN_KNOWN, challenge.knownCount + QUIZ_REOFFER_STEP)
    );
    saveProgress();
    hideQuizChallengeBubble({ clearPending: true });
    showToast(q("unavailableToast"));
    return;
  }
  playUiSfx("confirm");
}

function submitQuizAnswer() {
  if (!quizSession || quizSession.completed || quizCurrentAnswered) return;
  const question = quizSession.questions[quizSession.index];
  if (!question) return;

  if (!Number.isFinite(quizSelectedOption) || quizSelectedOption < 0 || quizSelectedOption >= question.options.length) {
    if (quizFeedbackText) {
      quizFeedbackText.textContent = q("selectOption");
      quizFeedbackText.classList.remove("correct");
      quizFeedbackText.classList.add("wrong");
    }
    playUiSfx("error");
    return;
  }

  const isCorrect = quizSelectedOption === question.correctIndex;
  if (isCorrect) quizSession.score += 1;
  quizCurrentAnswered = true;
  renderQuizQuestionState();
  playUiSfx(isCorrect ? "like" : "dislike");
}

function advanceQuizQuestion() {
  if (!quizSession || quizSession.completed || !quizCurrentAnswered) return;
  const total = quizSession.questions.length;
  const isLast = quizSession.index >= total - 1;

  if (isLast) {
    const style = quizSession.style;
    const scorePercent = Math.round((quizSession.score / Math.max(1, total)) * 100);
    const attempts = (Number(quizAttemptsByStyle.get(style)) || 0) + 1;
    const best = Math.max(Number(quizBestScoreByStyle.get(style)) || 0, scorePercent);
    const knownCount = quizKnownCountForStyle(style);
    const nextThreshold = Math.max(QUIZ_TRIGGER_MIN_KNOWN, knownCount + QUIZ_REOFFER_STEP);

    quizAttemptsByStyle.set(style, attempts);
    quizBestScoreByStyle.set(style, best);
    quizNextOfferCountByStyle.set(style, nextThreshold);
    quizSession.completed = true;
    saveProgress();
    renderQuizResultState();
    playUiSfx(scorePercent >= 70 ? "confirm" : "swap");
    return;
  }

  quizSession.index += 1;
  quizSelectedOption = -1;
  quizCurrentAnswered = false;
  renderQuizQuestionState();
}

function retryQuizSession() {
  const preferredStyle = String(quizSession?.style || quizPendingChallenge?.style || styleEl?.value || "").trim();
  if (!preferredStyle) return;
  const knownCount = quizKnownCountForStyle(preferredStyle);
  const started = startQuizSession(preferredStyle, knownCount);
  if (!started) {
    showToast(q("unavailableToast"));
    return;
  }
  playUiSfx("confirm");
}

function closeQuizOverlay({ skipSnooze = false, playSound = false } = {}) {
  const previousSession = quizSession;
  if (quizOverlay) quizOverlay.classList.add("hidden");

  if (previousSession && !previousSession.completed && !skipSnooze) {
    const knownCount = quizKnownCountForStyle(previousSession.style);
    const currentThreshold = Number(quizNextOfferCountByStyle.get(previousSession.style)) || QUIZ_TRIGGER_MIN_KNOWN;
    const suggestedThreshold = Math.max(
      QUIZ_TRIGGER_MIN_KNOWN,
      knownCount + Math.ceil(QUIZ_REOFFER_STEP / 2)
    );
    if (suggestedThreshold > currentThreshold) {
      quizNextOfferCountByStyle.set(previousSession.style, suggestedThreshold);
      saveProgress();
    }
  }

  quizSession = null;
  quizSelectedOption = -1;
  quizCurrentAnswered = false;
  renderQuizIdleState();
  if (playSound) playUiSfx("swap");
  if (!skipSnooze) scheduleQuizChallengeEvaluation(280);
}

function selectQuizOption(optionIndex) {
  if (!quizSession || quizSession.completed || quizCurrentAnswered) return;
  const question = quizSession.questions[quizSession.index];
  if (!question) return;
  const index = Number(optionIndex);
  if (!Number.isFinite(index) || index < 0 || index >= question.options.length) return;
  quizSelectedOption = index;
  renderQuizQuestionState();
}

function resolveFavoriteStyleLabel() {
  const topLikedStyle = [...adaptiveModel.likedStyles.entries()]
    .sort((a, b) => b[1] - a[1])
    .find(([, score]) => score > 0);
  if (!topLikedStyle) return t("summaryNoData");
  return styleLabelByValue(topLikedStyle[0]);
}

const FIVE_STAR_ACHIEVEMENT_TIERS = [
  { min: 1, key: "summaryAchievementTierA" },
  { min: 5, key: "summaryAchievementTierB" },
  { min: 10, key: "summaryAchievementTierC" },
  { min: 20, key: "summaryAchievementTierD" }
];

function countFiveStarRatings() {
  let count = 0;
  trackRatings.forEach((stars) => {
    const value = Math.round(Number(stars) || 0);
    if (value === 5) count += 1;
  });
  return count;
}

function resolveFiveStarAchievementTier(count = 0) {
  let current = null;
  FIVE_STAR_ACHIEVEMENT_TIERS.forEach((tier) => {
    if (count >= tier.min) current = tier;
  });
  const next = FIVE_STAR_ACHIEVEMENT_TIERS.find((tier) => tier.min > count) || null;
  return { current, next };
}

function resolveFiveStarAchievementText() {
  const count = countFiveStarRatings();
  if (count <= 0) return t("summaryAchievementPending");
  const baseText = count === 1
    ? t("summaryAchievementFiveStarOne", { count })
    : t("summaryAchievementFiveStarMany", { count });
  const tier = resolveFiveStarAchievementTier(count);
  if (!tier.current) return baseText;
  if (!tier.next) {
    return `${baseText} ${t("summaryAchievementTierMax", {
      tier: t(tier.current.key)
    })}`;
  }
  return `${baseText} ${t("summaryAchievementTierProgress", {
    tier: t(tier.current.key),
    remaining: Math.max(0, tier.next.min - count),
    nextTier: t(tier.next.key),
    nextAt: tier.next.min
  })}`;
}

function resolveProfileStatusLabel() {
  const totalSignals =
    userStats.likedSongs +
    userStats.likedArtists +
    userStats.likedDiscoveries +
    userStats.alreadyKnew +
    userStats.skipped;
  if (totalSignals <= 0) return t("summaryStatusNew");
  if (totalSignals < 8) return t("summaryStatusExploring");
  if (totalSignals < 25) return t("summaryStatusActive");
  return t("summaryStatusAdvanced");
}

function renderSummaryTags(container, items, emptyLabel) {
  if (!container) return;
  container.innerHTML = "";
  if (!items.length) {
    const emptyTag = document.createElement("span");
    emptyTag.className = "summary-tag empty";
    emptyTag.textContent = emptyLabel;
    container.appendChild(emptyTag);
    return;
  }
  items.forEach((item) => {
    const tag = document.createElement("span");
    tag.className = "summary-tag";
    tag.textContent = item;
    container.appendChild(tag);
  });
}

function formatSummaryTrackName(value) {
  const raw = String(value || "").trim();
  if (!raw) return "";
  if (/[A-Z]/.test(raw) && /[a-z]/.test(raw)) return raw;
  return raw
    .split(/\s+/)
    .map((part) => {
      if (!part) return part;
      if (/^\d+$/.test(part)) return part;
      if (/^[ivxlcdm]{1,5}$/i.test(part)) return part.toUpperCase();
      if (/^(dj|mc|vs|vip|id)$/i.test(part)) return part.toUpperCase();
      return `${part.charAt(0).toUpperCase()}${part.slice(1)}`;
    })
    .join(" ");
}

function fiveStarTrackDisplayLabel(trackKey = "") {
  const track = trackFromRecommendationKey(trackKey);
  if (track) {
    const song = formatSummaryTrackName(track.song);
    const artist = formatSummaryArtistName(track.artist);
    return [song, artist].filter(Boolean).join(" • ");
  }
  const fallback = formatSummaryTrackName(trackKey);
  return fallback || "";
}

function fiveStarTracksForSummary(limit = 12) {
  const ranked = [];
  trackRatings.forEach((stars, key) => {
    const value = Math.round(Number(stars) || 0);
    if (value !== 5) return;
    const normalizedKey = normalize(key || "");
    if (!normalizedKey) return;
    const ratingSignal = Number(trackRatingSignals.get(normalizedKey)) || 0;
    const preferenceSignal = Number(trackPreferenceSignals.get(normalizedKey)) || 0;
    const track = trackFromRecommendationKey(normalizedKey);
    const styleSignal = Number(adaptiveModel.likedStyles.get(normalize(track?.style || ""))) || 0;
    const score = (ratingSignal * 2.2) + (preferenceSignal * 1.45) + (styleSignal * 0.12);
    ranked.push({ key: normalizedKey, score });
  });

  ranked.sort((a, b) => b.score - a.score);
  const result = [];
  const seen = new Set();
  for (let i = 0; i < ranked.length; i += 1) {
    const label = fiveStarTrackDisplayLabel(ranked[i].key);
    const normalizedLabel = normalize(label || "");
    if (!normalizedLabel || seen.has(normalizedLabel)) continue;
    seen.add(normalizedLabel);
    result.push(`★ ${label}`);
    if (result.length >= limit) break;
  }
  return result;
}

function updateStats() {
  recalculateRatingStats();
  const typedKnown = parseKnownArtists(knownArtistsEl ? knownArtistsEl.value : "");
  const knownUnion = new Set([...typedKnown, ...knownArtistsMemory]);
  const likedArtistsTop = topArtistsFromMap(adaptiveModel.likedArtists);
  const dislikedArtistsTop = topArtistsFromMap(adaptiveModel.dislikedArtists);
  const knownArtistsTop = knownArtistsForSummary();
  const fiveStarTracks = fiveStarTracksForSummary();

  if (statsLine) {
    statsLine.textContent = t("stats", {
      likedSongs: userStats.likedSongs,
      likedArtists: userStats.likedArtists,
      likedDiscoveries: userStats.likedDiscoveries,
      alreadyKnew: userStats.alreadyKnew,
      skipped: userStats.skipped,
      discoveredInApp: discoveredArtistsInApp.size,
      ratingCount: userStats.ratingCount,
      ratingAvg: ratingAverageText()
    });
  }
  if (summaryProfileStatus) summaryProfileStatus.textContent = resolveProfileStatusLabel();
  if (summaryKnownCount) summaryKnownCount.textContent = String(knownUnion.size);
  if (summaryDiscoveredCount) summaryDiscoveredCount.textContent = String(discoveredArtistsInApp.size);
  if (summaryLikedArtistsCount) summaryLikedArtistsCount.textContent = String(adaptiveModel.likedArtists.size);
  if (summaryDislikedArtistsCount) summaryDislikedArtistsCount.textContent = String(adaptiveModel.dislikedArtists.size);
  if (summaryFavoriteStyle) summaryFavoriteStyle.textContent = resolveFavoriteStyleLabel();
  if (summaryAchievementText) summaryAchievementText.textContent = resolveFiveStarAchievementText();
  renderSummaryTags(summaryFiveStarTracks, fiveStarTracks, t("summaryEmptyFiveStarTracks"));
  renderSummaryTags(summaryKnownArtists, knownArtistsTop, t("summaryEmptyKnown"));
  renderSummaryTags(summaryLikedArtists, likedArtistsTop, t("summaryEmptyLiked"));
  renderSummaryTags(summaryDislikedArtists, dislikedArtistsTop, t("summaryEmptyDisliked"));
  updateSpiritProgressText();
  applyGenreVibeTheme();
  scheduleQuizChallengeEvaluation();
  saveProgress();
}

async function generateRecommendationFromPrefs(
  prefs,
  {
    resetRejected = false,
    avoidTrackKey = "",
    avoidTrackKeys = [],
    avoidTrackTitles = [],
    knownTracksText = "",
    avoidDiscoveryName = "",
    avoidArtistName = "",
    allowKnownFallback = false
  } = {}
) {
  recommendationBlockedByKnown = false;
  recommendationStyleFallbackInfo = null;
  let usedKnownFallback = false;
  if (resetRejected) rejectedArtists = new Set();
  if (!externalDatasetImportDone) {
    await hydrateExternalDatasetPackInBackground();
  }
  if (prefs?.style === "slambient" || !prefs?.style) normalizeTrustedSlambientCatalog();
  sanitizeCatalogByStyleRules();
  if (prefs?.style) purgeDynamicMismatches(prefs.style);

  const typedKnown = parseKnownArtists(knownArtistsEl ? knownArtistsEl.value : "");
  typedKnown.forEach((artist) => knownArtistsMemory.add(artist));
  const typedKnownTrackTitles = parseKnownTrackTitles(knownTracksText || (quickSurpriseKnownTracksEl ? quickSurpriseKnownTracksEl.value : ""));
  typedKnownTrackTitles.forEach((trackTitle) => knownTrackTitlesMemory.add(trackTitle));

  const excludedTrackKeys = new Set();
  const excludedTrackTitles = new Set([...knownTrackTitlesMemory]);
  (Array.isArray(avoidTrackTitles) ? avoidTrackTitles : [avoidTrackTitles]).forEach((trackTitleLike) => {
    parseKnownTrackTitles(String(trackTitleLike || "")).forEach((trackTitle) => excludedTrackTitles.add(trackTitle));
  });
  const excludedDiscoveryNames = new Set();
  if (avoidTrackKey) excludedTrackKeys.add(normalize(avoidTrackKey));
  if (Array.isArray(avoidTrackKeys)) {
    avoidTrackKeys
      .map((trackKey) => normalize(trackKey))
      .filter(Boolean)
      .forEach((trackKey) => excludedTrackKeys.add(trackKey));
  }
  const globalTrackExclusions = buildGlobalTrackExclusionSet(
    Array.from(excludedTrackKeys),
    Array.from(excludedTrackTitles)
  );
  globalTrackExclusions.keys.forEach((trackKey) => excludedTrackKeys.add(trackKey));
  globalTrackExclusions.titles.forEach((trackTitle) => excludedTrackTitles.add(trackTitle));
  if (avoidDiscoveryName) excludedDiscoveryNames.add(normalize(avoidDiscoveryName));
  const sessionExcludedArtists = buildGlobalArtistExclusionSet();
  if (avoidArtistName) addArtistKeysToSet(sessionExcludedArtists, avoidArtistName);
  const trackAllowedInSession = (track) => !trackBlockedByKnownSignals(track, excludedTrackKeys, excludedTrackTitles);
  const isStyleFallbackLocked = () => NO_CROSS_STYLE_FALLBACK_STYLES.has(String(prefs?.style || ""));

  const hasEligibleInCurrentScope = () =>
    catalog.some(
      (track) =>
        isTrackEligibleForRecommendation(track) &&
        (!prefs.bpm || trackMatchesBpmPreference(track, prefs.bpm)) &&
        (!prefs.style || track.style === prefs.style)
    );
  const hasEligibleUnknownInCurrentScope = () =>
    catalog.some(
      (track) =>
        isTrackEligibleForRecommendation(track) &&
        (!prefs.bpm || trackMatchesBpmPreference(track, prefs.bpm)) &&
        (!prefs.style || track.style === prefs.style) &&
        !artistSetHasMatch(sessionExcludedArtists, track.artist) &&
        trackAllowedInSession(track)
    );
  const markRecommendationBlockedByKnown = () => {
    recommendationBlockedByKnown = hasEligibleInCurrentScope() && !hasEligibleUnknownInCurrentScope();
  };

  const applyStyleSwitch = (nextStyle) => {
    if (isStyleFallbackLocked()) return false;
    if (!prefs?.style || !nextStyle || nextStyle === prefs.style) return false;
    const previousStyle = prefs.style;
    prefs.style = nextStyle;
    recommendationStyleFallbackInfo = { from: previousStyle, to: nextStyle };
    if (styleEl && styleEl.value !== nextStyle) {
      styleEl.value = nextStyle;
      styleInfoDismissed = false;
      renderStyleInfoBubble(nextStyle, { reveal: true });
    }
    return true;
  };

  const ensureFreshStyleOrSwitch = async () => {
    if (!prefs?.style) return;
    let freshCandidates = unseenTrackCandidatesForStyle(
      prefs.style,
      prefs,
      sessionExcludedArtists,
      excludedTrackKeys,
      excludedTrackTitles
    );
    if (freshCandidates.length) return;

    await ensureStyleCoverageWithTimeout(prefs.style, 2);
    freshCandidates = unseenTrackCandidatesForStyle(
      prefs.style,
      prefs,
      sessionExcludedArtists,
      excludedTrackKeys,
      excludedTrackTitles
    );
    if (freshCandidates.length) return;
    if (isStyleFallbackLocked()) return;

    const fallbackStyle = pickFallbackStyleForFreshRecommendation(
      prefs,
      sessionExcludedArtists,
      excludedTrackKeys,
      excludedTrackTitles
    );
    if (!fallbackStyle) return;
    applyStyleSwitch(fallbackStyle);
    await ensureStyleCoverageWithTimeout(fallbackStyle, 2);
    sanitizeCatalogByStyleRules();
    purgeDynamicMismatches(fallbackStyle);
  };

  await ensureFreshStyleOrSwitch();

  const tryCrossStyleFallbackRecommendation = async () => {
    if (!prefs?.style) return false;
    if (isStyleFallbackLocked()) return false;
    const fallbackStyle = pickFallbackStyleForFreshRecommendation(
      prefs,
      sessionExcludedArtists,
      excludedTrackKeys,
      excludedTrackTitles
    );
    if (!fallbackStyle) return false;
    if (!applyStyleSwitch(fallbackStyle)) return false;
    await ensureStyleCoverageWithTimeout(fallbackStyle, 2);
    sanitizeCatalogByStyleRules();
    purgeDynamicMismatches(fallbackStyle);
    currentRecommendation = pickRecommendation(
      prefs,
      sessionExcludedArtists,
      sessionExcludedArtists,
      excludedTrackKeys,
      excludedTrackTitles
    );
    return Boolean(currentRecommendation);
  };

  const tryKnownFallbackRecommendation = () => {
    if (!allowKnownFallback) return false;
    const relaxedExcludedArtists = new Set([...rejectedArtists]);
    if (avoidArtistName) addArtistKeysToSet(relaxedExcludedArtists, avoidArtistName);
    const candidate = pickRecommendation(prefs, new Set(), relaxedExcludedArtists, excludedTrackKeys, excludedTrackTitles);
    if (!candidate || !isTrackEligibleForRecommendation(candidate)) return false;
    currentRecommendation = candidate;
    usedKnownFallback = true;
    recommendationBlockedByKnown = false;
    return true;
  };

  const tryEmergencyStyleRecommendation = () => {
    if (!prefs?.style) return false;
    if (prefs.style === "slambient") normalizeTrustedSlambientCatalog();

    const strictStylePool = catalog.filter(
      (track) =>
        track.style === prefs.style &&
        isTrackEligibleForRecommendation(track) &&
        (!prefs.bpm || trackMatchesBpmPreference(track, prefs.bpm)) &&
        !artistSetHasMatch(sessionExcludedArtists, track.artist) &&
        trackAllowedInSession(track)
    );

    let stylePool = strictStylePool.length
      ? strictStylePool
      : catalog.filter((track) => {
          if (!track || track.style !== prefs.style) return false;
          if (!track.artist || !track.song) return false;
          if (prefs.bpm && !trackMatchesBpmPreference(track, prefs.bpm)) return false;
          if (!artistAllowedForStyle(prefs.style, track.artist)) return false;
          if (!labelAllowedForStyle(prefs.style, track.label)) return false;
          const bpmValue = Number(track.bpmExact);
          if (Number.isFinite(bpmValue) && bpmValue > 0 && !bpmFitsStyle(prefs.style, bpmValue)) return false;
          if (artistSetHasMatch(sessionExcludedArtists, track.artist)) return false;
          if (!trackAllowedInSession(track)) return false;
          return true;
        });
    if (!stylePool.length && allowKnownFallback) {
      stylePool = catalog.filter((track) => {
        if (!track || track.style !== prefs.style) return false;
        if (!isTrackEligibleForRecommendation(track)) return false;
        if (prefs.bpm && !trackMatchesBpmPreference(track, prefs.bpm)) return false;
        if (!trackAllowedInSession(track)) return false;
        return true;
      });
    }
    if (!stylePool.length) return false;

    const keyOf = (track) => recommendationTrackKey(track);
    const pickPool = (pool) => pickRandomTrack(pool.filter((track) => trackAllowedInSession(track) && !excludedTrackKeys.has(keyOf(track))));

    const withPreview = stylePool.filter((track) => track.existenceVerified !== false && Boolean(track.previewUrl));
    const verified = stylePool.filter((track) => track.existenceVerified !== false);
    const candidate = pickPool(withPreview) || pickPool(verified) || pickPool(stylePool);
    if (!candidate) return false;

    currentRecommendation = candidate;
    usedKnownFallback = true;
    recommendationBlockedByKnown = false;
    return true;
  };

  currentRecommendation = pickRecommendation(
    prefs,
    sessionExcludedArtists,
    sessionExcludedArtists,
    excludedTrackKeys,
    excludedTrackTitles
  );
  if (prefs.style && currentRecommendation && currentRecommendation.style !== prefs.style) {
    currentRecommendation = null;
  }
  if (!currentRecommendation || !isTrackEligibleForRecommendation(currentRecommendation)) {
    const styleFallback = prefs.style
      ? unseenTrackCandidatesForStyle(prefs.style, prefs, sessionExcludedArtists, excludedTrackKeys, excludedTrackTitles)
      : [];
    const globalFallback = prefs.style
      ? []
      : catalog.filter(
          (track) =>
            isTrackEligibleForRecommendation(track) &&
            (!prefs.bpm || trackMatchesBpmPreference(track, prefs.bpm)) &&
            !artistSetHasMatch(sessionExcludedArtists, track.artist) &&
            !excludedTrackKeys.has(recommendationTrackKey(track)) &&
            trackAllowedInSession(track)
        );
    currentRecommendation = pickRandomTrack(styleFallback) || pickRandomTrack(globalFallback) || null;
  }
  if (!currentRecommendation) {
    if (!(await tryCrossStyleFallbackRecommendation()) && !tryKnownFallbackRecommendation() && !tryEmergencyStyleRecommendation()) {
      markRecommendationBlockedByKnown();
      currentDiscovery = null;
      return false;
    }
  }

  // Anti-repetição reforçado: tenta várias rotações antes de aceitar a mesma faixa.
  const normalizedAvoidTrack = normalize(avoidTrackKey);
  if (normalizedAvoidTrack && currentRecommendation) {
    let attempts = 0;
    let currentKey = normalize(`${currentRecommendation.artist}::${currentRecommendation.song}`);
    const stylePool = prefs.style
      ? catalog.filter((track) => track.style === prefs.style && isTrackEligibleForRecommendation(track) && (!prefs.bpm || trackMatchesBpmPreference(track, prefs.bpm)) && trackAllowedInSession(track))
      : catalog.filter((track) => isTrackEligibleForRecommendation(track) && (!prefs.bpm || trackMatchesBpmPreference(track, prefs.bpm)) && trackAllowedInSession(track));
    const maxAttempts = Math.min(14, Math.max(4, stylePool.length));
    while (currentRecommendation && currentKey === normalizedAvoidTrack && attempts < maxAttempts) {
      excludedTrackKeys.add(currentKey);
      addArtistKeysToSet(sessionExcludedArtists, currentRecommendation.artist);
      currentRecommendation = pickRecommendation(
        prefs,
        sessionExcludedArtists,
        sessionExcludedArtists,
        excludedTrackKeys,
        excludedTrackTitles
      );
      if (prefs.style && currentRecommendation && currentRecommendation.style !== prefs.style) {
        currentRecommendation = null;
      }
      currentKey = currentRecommendation ? normalize(`${currentRecommendation.artist}::${currentRecommendation.song}`) : "";
      attempts += 1;
    }

    if (currentRecommendation && currentKey === normalizedAvoidTrack) {
      const fallbackPool = stylePool.filter(
        (track) =>
          normalize(`${track.artist}::${track.song}`) !== normalizedAvoidTrack &&
          !artistSetHasMatch(sessionExcludedArtists, track.artist) &&
          trackAllowedInSession(track)
      );
      if (fallbackPool.length) {
        currentRecommendation = fallbackPool[Math.floor(Math.random() * fallbackPool.length)];
      }
    }
    if (currentRecommendation && normalize(`${currentRecommendation.artist}::${currentRecommendation.song}`) === normalizedAvoidTrack) {
      currentRecommendation = null;
      await tryCrossStyleFallbackRecommendation();
    }
  }

  // Proteção final: se algum bug externo tentar cruzar estilo, força faixa correta do estilo escolhido.
  if (prefs.style && currentRecommendation && currentRecommendation.style !== prefs.style) {
    const strictPool = catalog.filter(
      (track) =>
        track.style === prefs.style &&
        isTrackEligibleForRecommendation(track) &&
        (!prefs.bpm || trackMatchesBpmPreference(track, prefs.bpm)) &&
          !artistSetHasMatch(sessionExcludedArtists, track.artist) &&
          trackAllowedInSession(track)
    );
    if (strictPool.length > 0) {
      currentRecommendation = strictPool[Math.floor(Math.random() * strictPool.length)];
    } else {
      if (!(await tryCrossStyleFallbackRecommendation()) && !tryKnownFallbackRecommendation() && !tryEmergencyStyleRecommendation()) {
        markRecommendationBlockedByKnown();
        currentDiscovery = null;
        return false;
      }
    }
  }

  // Gate por API para psycore: evita artistas com sinal de psytrance genérico.
  if (prefs.style === "psycore" && currentRecommendation) {
    let apiValidationAttempts = 0;
    while (currentRecommendation && apiValidationAttempts < 6) {
      if (artistSeedAnchoredForStyle("psycore", currentRecommendation.artist)) break;
      const profile = await fetchArtistApiProfile(currentRecommendation.artist);
      if (!shouldRejectPsycoreByApi(profile)) break;
      const rejectedTrackKey = normalize(`${currentRecommendation.artist}::${currentRecommendation.song}`);
      excludedTrackKeys.add(rejectedTrackKey);
      addArtistKeysToSet(sessionExcludedArtists, currentRecommendation.artist);
      currentRecommendation = pickRecommendation(
        prefs,
        sessionExcludedArtists,
        sessionExcludedArtists,
        excludedTrackKeys,
        excludedTrackTitles
      );
      apiValidationAttempts += 1;
    }
    if (!currentRecommendation) {
      if (!(await tryCrossStyleFallbackRecommendation()) && !tryEmergencyStyleRecommendation()) {
        markRecommendationBlockedByKnown();
        currentDiscovery = null;
        return false;
      }
    }
  }
  // Segurança final de consistência: não renderiza faixa de estilo diferente.
  if (prefs.style && currentRecommendation && currentRecommendation.style !== prefs.style) {
    currentRecommendation = null;
    if (!(await tryCrossStyleFallbackRecommendation()) && !tryEmergencyStyleRecommendation()) {
      markRecommendationBlockedByKnown();
      currentDiscovery = null;
      return false;
    }
  }

  // Verifica existência real da faixa e tenta priorizar opções com preview.
  let fallbackVerifiedTrack = null;
  let integrityAttempts = 0;
  const maxIntegrityAttempts = prefs.style ? 10 : 6;
  while (currentRecommendation && integrityAttempts < maxIntegrityAttempts) {
    await resolvePreviewForTrack(currentRecommendation);
    const currentKey = normalize(`${currentRecommendation.artist}::${currentRecommendation.song}`);
    const exists = currentRecommendation.existenceVerified !== false;
    const hasPreview = Boolean(currentRecommendation.previewUrl);

    if (exists && !fallbackVerifiedTrack) fallbackVerifiedTrack = currentRecommendation;
    if (exists && hasPreview) break;

    excludedTrackKeys.add(currentKey);
    // Evita bloquear o artista quando o único problema é falta de preview.
    // Isso impedia estilos de nicho (ex.: slambient) de retornar faixa válida.
    if (!exists) {
      addArtistKeysToSet(sessionExcludedArtists, currentRecommendation.artist);
    }
    const nextTrack = pickRecommendation(
      prefs,
      sessionExcludedArtists,
      sessionExcludedArtists,
      excludedTrackKeys,
      excludedTrackTitles
    );
    if (prefs.style && nextTrack && nextTrack.style !== prefs.style) {
      currentRecommendation = null;
      break;
    }
    const nextKey = normalize(`${nextTrack?.artist || ""}::${nextTrack?.song || ""}`);
    if (!nextTrack || !nextKey || nextKey === currentKey) break;
    currentRecommendation = nextTrack;
    integrityAttempts += 1;
  }

  if (currentRecommendation?.existenceVerified === false && fallbackVerifiedTrack) {
    currentRecommendation = fallbackVerifiedTrack;
  }
  if (currentRecommendation && currentRecommendation.existenceVerified === false) {
    currentRecommendation = null;
  }
  if (!currentRecommendation) {
    if (!(await tryCrossStyleFallbackRecommendation()) && !tryEmergencyStyleRecommendation()) {
      recommendationBlockedByKnown = false;
      currentDiscovery = null;
      return false;
    }
  }
  if (
    prefs.style &&
    (
      currentRecommendation.style !== prefs.style ||
      !artistAllowedForStyle(prefs.style, currentRecommendation.artist) ||
      !labelAllowedForStyle(prefs.style, currentRecommendation.label) ||
      (() => {
        const bpmValue = Number(currentRecommendation.bpmExact);
        return Number.isFinite(bpmValue) && bpmValue > 0 && !bpmFitsStyle(prefs.style, bpmValue);
      })()
    )
  ) {
    currentRecommendation = null;
    if (!(await tryCrossStyleFallbackRecommendation()) && !tryEmergencyStyleRecommendation()) {
      markRecommendationBlockedByKnown();
      currentDiscovery = null;
      return false;
    }
  }
  if (prefs.bpm && currentRecommendation && !trackMatchesBpmPreference(currentRecommendation, prefs.bpm)) {
    currentRecommendation = null;
    if (!(await tryCrossStyleFallbackRecommendation()) && !tryEmergencyStyleRecommendation()) {
      markRecommendationBlockedByKnown();
      currentDiscovery = null;
      return false;
    }
  }
  const finalArtistKey = artistMatchKey(currentRecommendation.artist);
  if (
    !finalArtistKey ||
    (!usedKnownFallback && artistSetHasMatch(sessionExcludedArtists, currentRecommendation.artist))
  ) {
    if (!(await tryCrossStyleFallbackRecommendation()) && !tryEmergencyStyleRecommendation()) {
      markRecommendationBlockedByKnown();
      currentRecommendation = null;
      currentDiscovery = null;
      return false;
    }
  }
  if (currentRecommendation && !trackAllowedInSession(currentRecommendation)) {
    currentRecommendation = null;
    if (!(await tryCrossStyleFallbackRecommendation()) && !tryEmergencyStyleRecommendation()) {
      markRecommendationBlockedByKnown();
      currentDiscovery = null;
      return false;
    }
  }

  const recommendationSnapshot = currentRecommendation;
  let discoverySnapshot = discoveryModeEl.checked
    ? pickDiscovery(prefs, sessionExcludedArtists, currentRecommendation.artist, excludedDiscoveryNames)
    : null;

  if (
    avoidDiscoveryName &&
    discoverySnapshot &&
    normalize(discoverySnapshot.name) === normalize(avoidDiscoveryName)
  ) {
    excludedDiscoveryNames.add(normalize(avoidDiscoveryName));
    let attempts = 0;
    while (
      discoveryModeEl.checked &&
      discoverySnapshot &&
      normalize(discoverySnapshot.name) === normalize(avoidDiscoveryName) &&
      attempts < 8
    ) {
      discoverySnapshot = pickDiscovery(prefs, sessionExcludedArtists, currentRecommendation.artist, excludedDiscoveryNames);
      attempts += 1;
    }
    if (!discoveryModeEl.checked) discoverySnapshot = null;
  }

  if (
    prefs.style &&
    (
      recommendationSnapshot.style !== prefs.style ||
      !artistAllowedForStyle(prefs.style, recommendationSnapshot.artist) ||
      !labelAllowedForStyle(prefs.style, recommendationSnapshot.label) ||
      (() => {
        const bpmValue = Number(recommendationSnapshot.bpmExact);
        return Number.isFinite(bpmValue) && bpmValue > 0 && !bpmFitsStyle(prefs.style, bpmValue);
      })()
    )
  ) {
    markRecommendationBlockedByKnown();
    currentRecommendation = null;
    currentDiscovery = null;
    return false;
  }
  if (prefs.bpm && !trackMatchesBpmPreference(recommendationSnapshot, prefs.bpm)) {
    markRecommendationBlockedByKnown();
    currentRecommendation = null;
    currentDiscovery = null;
    return false;
  }
  if (!trackAllowedInSession(recommendationSnapshot)) {
    markRecommendationBlockedByKnown();
    currentRecommendation = null;
    currentDiscovery = null;
    return false;
  }

  currentRecommendation = recommendationSnapshot;
  currentDiscovery = discoverySnapshot;
  renderRecommendation(recommendationSnapshot, prefs);
  renderDiscovery(discoverySnapshot);
  await renderPreview(recommendationSnapshot);
  if (
    prefs.style &&
    (
      recommendationSnapshot.style !== prefs.style ||
      !artistAllowedForStyle(prefs.style, recommendationSnapshot.artist)
    )
  ) {
    markRecommendationBlockedByKnown();
    currentRecommendation = null;
    currentDiscovery = null;
    return false;
  }
  if (prefs.bpm && !trackMatchesBpmPreference(recommendationSnapshot, prefs.bpm)) {
    markRecommendationBlockedByKnown();
    currentRecommendation = null;
    currentDiscovery = null;
    return false;
  }
  if (!trackAllowedInSession(recommendationSnapshot)) {
    markRecommendationBlockedByKnown();
    currentRecommendation = null;
    currentDiscovery = null;
    return false;
  }
  registerRecommendationDelivery(recommendationSnapshot, prefs);
  refreshSuggestionQueue(prefs, recommendationSnapshot);
  return true;
}

async function generateRecommendationWithOverlay(prefs, options = {}, mode = "default") {
  if (recommendationRunBusy) return false;
  playUiSfx("search-start");
  recommendationRunBusy = true;
  setRecommendationRunBusy(true);
  try {
    const generated = await withSearchOverlay(t("searchOverlayPreparing"), async (update) => {
      if (mode === "catalog") update(18, t("searchOverlayCatalog"));
      else update(24, t("searchOverlayGenerating"));
      const generatedResult = await generateRecommendationFromPrefs(prefs, options);
      update(92, t("searchOverlayFinishing"));
      return generatedResult;
    });
    playUiSfx(generated ? "search-done" : "error");
    return generated;
  } finally {
    recommendationRunBusy = false;
    setRecommendationRunBusy(false);
  }
}

async function activateSuggestionQueueIndex(index) {
  if (recommendationRunBusy || !lastPrefs) return false;
  if (suggestionQueueContextKey !== recommendationContextKey(lastPrefs)) {
    refreshSuggestionQueue(lastPrefs, currentRecommendation);
  }
  const safeIndex = Number(index);
  if (!Number.isFinite(safeIndex) || safeIndex < 0 || safeIndex > 2) return false;
  const selectedTrack = suggestionQueueTracks[safeIndex];
  if (!selectedTrack) return false;

  const selectedKey = recommendationTrackKey(selectedTrack);
  if (!selectedKey || selectedKey === recommendationTrackKey(currentRecommendation)) return false;

  recommendationRunBusy = true;
  setRecommendationRunBusy(true);
  try {
    currentRecommendation = selectedTrack;
    currentDiscovery = discoveryModeEl.checked
      ? pickDiscovery(lastPrefs, buildGlobalArtistExclusionSet(), selectedTrack.artist)
      : null;

    renderRecommendation(selectedTrack, lastPrefs);
    renderDiscovery(currentDiscovery);
    await renderPreview(selectedTrack);
    registerRecommendationDelivery(selectedTrack, lastPrefs);
    refreshSuggestionQueue(lastPrefs, selectedTrack);

    if (eventsPanel) eventsPanel.classList.add("hidden");
    if (eventsIntro) eventsIntro.textContent = t("eventsPrompt");
    if (eventsCalendar) eventsCalendar.innerHTML = "";
    if (eventsList) eventsList.innerHTML = "";
    if (detailsPanel) detailsPanel.classList.add("hidden");
    if (resultPanel) resultPanel.classList.remove("hidden");
    if (feedbackMessage) feedbackMessage.textContent = t("queueActivated", { song: selectedTrack.song });
    playUiSfx("swap");
    savePreferences();
    return true;
  } finally {
    recommendationRunBusy = false;
    setRecommendationRunBusy(false);
  }
}

async function loadEventsForArtist(artist) {
  if (!eventsPanel || !eventsIntro || !eventsCalendar || !eventsList) return;
  eventsPanel.classList.remove("hidden");
  eventsIntro.textContent = t("eventsLoading", { artist });
  eventsCalendar.innerHTML = "";
  eventsList.innerHTML = "";

  const { events, source } = await fetchUpcomingEvents(artist);
  renderEventsPanel(artist, events, source);
}

async function runRecommendation() {
  if (recommendationRunBusy) return;
  playUiSfx("search-start");
  recommendationRunBusy = true;
  setRecommendationRunBusy(true);
  try {
    const prefs = {
      style: styleEl.value,
      context: contextEl.value,
      energy: energyEl.value,
      bpm: bpmEl.value,
      vocals: vocalsEl.value
    };

    if (feedbackMessage) feedbackMessage.textContent = t("searchingCatalog");
    let blockedByCoverage = false;
    let usedCoverageFallback = false;
    let fallbackSnapshot = null;
    let recommendationGenerated = false;
    await withSearchOverlay(t("searchOverlayPreparing"), async (update) => {
      update(14, t("searchOverlayPreparing"));
      if (prefs.style) {
        update(32, t("searchOverlayCatalog"));
        const coverage = await ensureStyleCoverageWithTimeout(prefs.style, COVERAGE_MAX_PASSES);
        const stats = coverage.stats || styleCoverageStats(prefs.style);
        const target = coverage.target || styleCoverageTarget(prefs.style);
        if (feedbackMessage) {
          feedbackMessage.textContent = t("catalogGenerating", {
            style: styleLabelByValue(prefs.style),
            tracks: stats.tracks,
            artists: stats.artists
          });
        }
        if (!coverage.ok) {
          const fallbackAllowed = canFallbackToPartialCoverage(coverage);
          if (!fallbackAllowed) {
            const message = t("catalogInsufficient", {
              style: styleLabelByValue(prefs.style),
              tracks: stats.tracks,
              targetTracks: target.tracks,
              artists: stats.artists,
              targetArtists: target.artists,
              labels: stats.labels,
              targetLabels: target.labels
            });
            if (feedbackMessage) feedbackMessage.textContent = message;
            showToast(t("catalogInsufficientToast"));
            blockedByCoverage = true;
            return;
          }
          usedCoverageFallback = true;
          fallbackSnapshot = {
            style: styleLabelByValue(prefs.style),
            tracks: stats.tracks,
            artists: stats.artists
          };
          if (feedbackMessage) {
            feedbackMessage.textContent = t("catalogFallbackUsingLocal", {
              style: fallbackSnapshot.style,
              tracks: fallbackSnapshot.tracks,
              artists: fallbackSnapshot.artists
            });
          }
          showToast(t("catalogFallbackToast"));
        }
      }
      if (blockedByCoverage) return;
      update(74, t("searchOverlayGenerating"));
      recommendationGenerated = await generateRecommendationFromPrefs(prefs, { resetRejected: false });
      update(94, t("searchOverlayFinishing"));
    });
    if (blockedByCoverage) {
      playUiSfx("error");
      if (resultPanel) resultPanel.classList.add("hidden");
      suggestionQueueTracks = [];
      suggestionQueueContextKey = "";
      renderSuggestionQueue(prefs);
      renderTrackInsightPanel(null);
      return;
    }
    if (!recommendationGenerated) {
      playUiSfx("error");
      if (feedbackMessage) feedbackMessage.textContent = recommendationFailureMessage();
      showToast(recommendationFailureMessage());
      if (resultPanel) resultPanel.classList.add("hidden");
      suggestionQueueTracks = [];
      suggestionQueueContextKey = "";
      renderSuggestionQueue(prefs);
      renderTrackInsightPanel(null);
      return;
    }
    savePreferences();

    lastPrefs = prefs;
    if (rerollBtn) rerollBtn.disabled = false;
    const styleFallbackMessage = applyStyleFallbackMessage({ setFeedback: false });
    if (feedbackMessage) {
      const hasAnyPreference = Object.values(prefs).some(Boolean);
      if (styleFallbackMessage) {
        feedbackMessage.textContent = styleFallbackMessage;
      } else if (usedCoverageFallback && fallbackSnapshot) {
        feedbackMessage.textContent = t("catalogFallbackUsingLocal", {
          style: fallbackSnapshot.style,
          tracks: fallbackSnapshot.tracks,
          artists: fallbackSnapshot.artists
        });
      } else {
        feedbackMessage.textContent = hasAnyPreference
          ? t("recommendationGenerated")
          : t("exploratoryGenerated");
      }
    }
    if (eventsPanel) eventsPanel.classList.add("hidden");
    if (eventsIntro) eventsIntro.textContent = t("eventsPrompt");
    if (eventsCalendar) eventsCalendar.innerHTML = "";
    if (eventsList) eventsList.innerHTML = "";
    if (detailsPanel) detailsPanel.classList.add("hidden");
    if (resultPanel) resultPanel.classList.remove("hidden");
    playUiSfx("search-done");
  } finally {
    recommendationRunBusy = false;
    setRecommendationRunBusy(false);
  }
}

async function runSurpriseRecommendation() {
  if (recommendationRunBusy) return false;
  playUiSfx("search-start");
  recommendationRunBusy = true;
  setRecommendationRunBusy(true);
  try {
    const knownTyped = parseKnownArtists(knownArtistsEl ? knownArtistsEl.value : "");
    knownTyped.forEach((artist) => knownArtistsMemory.add(artist));
    const knownTracksTyped = parseKnownTrackTitles(quickSurpriseKnownTracksEl ? quickSurpriseKnownTracksEl.value : "");
    knownTracksTyped.forEach((trackTitle) => knownTrackTitlesMemory.add(trackTitle));
    saveProgress();

    const previousTrack = currentRecommendation;
    let surpriseTrack = null;
    await withSearchOverlay(t("searchOverlayPreparing"), async (update) => {
      surpriseTrack = await pickValidatedSurpriseTrack(previousTrack, update);
      if (!surpriseTrack) {
        surpriseTrack = await resolveEmergencySurpriseTrack(previousTrack, update);
      }
      if (
        surpriseTrack &&
        previousTrack &&
        normalize(surpriseTrack.style || "") === normalize(previousTrack.style || "")
      ) {
        surpriseTrack = await resolveEmergencySurpriseTrack(previousTrack, update);
      }
      update(96, t("searchOverlayFinishing"));
    });
    if (!surpriseTrack) {
      playUiSfx("error");
      if (feedbackMessage) feedbackMessage.textContent = recommendationFailureMessage();
      showToast(recommendationFailureMessage());
      if (resultPanel) resultPanel.classList.add("hidden");
      return false;
    }

    const surprisePrefs = {
      style: surpriseTrack.style,
      context: "",
      energy: "",
      bpm: "",
      vocals: ""
    };

    if (styleEl) styleEl.value = surprisePrefs.style;
    if (contextEl) contextEl.value = surprisePrefs.context;
    if (energyEl) energyEl.value = surprisePrefs.energy;
    if (bpmEl) bpmEl.value = surprisePrefs.bpm;
    if (vocalsEl) vocalsEl.value = surprisePrefs.vocals;
    styleInfoDismissed = false;
    renderStyleInfoBubble(styleEl?.value || "", { reveal: Boolean(styleEl?.value) });

    currentRecommendation = surpriseTrack;
    currentDiscovery = discoveryModeEl.checked
      ? pickDiscovery(surprisePrefs, buildGlobalArtistExclusionSet(), surpriseTrack.artist)
      : null;

    renderRecommendation(surpriseTrack, surprisePrefs);
    renderDiscovery(currentDiscovery);
    await renderPreview(surpriseTrack);

    registerRecommendationDelivery(surpriseTrack, surprisePrefs);
    refreshSuggestionQueue(surprisePrefs, surpriseTrack);

    lastPrefs = surprisePrefs;
    if (rerollBtn) rerollBtn.disabled = false;
    if (eventsPanel) eventsPanel.classList.add("hidden");
    if (eventsIntro) eventsIntro.textContent = t("eventsPrompt");
    if (eventsCalendar) eventsCalendar.innerHTML = "";
    if (eventsList) eventsList.innerHTML = "";
    if (detailsPanel) detailsPanel.classList.add("hidden");
    if (resultPanel) resultPanel.classList.remove("hidden");

    const fromStyle = previousTrack ? styleLabelByValue(previousTrack.style) : t("freeStyle");
    const toStyle = styleLabelByValue(surpriseTrack.style);
    const surpriseMessage = t("surpriseCrossGenreGenerated", { from: fromStyle, to: toStyle });
    if (feedbackMessage) feedbackMessage.textContent = surpriseMessage;
    showToast(surpriseMessage);
    playUiSfx("search-done");

    savePreferences();
    return true;
  } finally {
    recommendationRunBusy = false;
    setRecommendationRunBusy(false);
  }
}

async function runAdaptiveSurpriseRecommendation() {
  const hasAdaptiveSignals =
    adaptiveModel.likedStyles.size > 0 ||
    adaptiveModel.dislikedStyles.size > 0 ||
    adaptiveModel.likedArtists.size > 0 ||
    adaptiveModel.dislikedArtists.size > 0 ||
    totalPositiveLikes() > 0 ||
    userStats.skipped > 0;

  if (!hasAdaptiveSignals) {
    const needSignalsMessage = t("surpriseAdaptiveNeedSignals");
    if (feedbackMessage) feedbackMessage.textContent = needSignalsMessage;
    showToast(needSignalsMessage);
    return runSurpriseRecommendation();
  }

  const previousTrack = currentRecommendation;
  const knownTyped = parseKnownArtists(knownArtistsEl ? knownArtistsEl.value : "");
  knownTyped.forEach((artist) => knownArtistsMemory.add(artist));
  const knownTracksTyped = parseKnownTrackTitles(quickSurpriseKnownTracksEl ? quickSurpriseKnownTracksEl.value : "");
  knownTracksTyped.forEach((trackTitle) => knownTrackTitlesMemory.add(trackTitle));
  saveProgress();

  const selectedStyle = pickAdaptiveSurpriseStyle(previousTrack);
  if (!selectedStyle) return runSurpriseRecommendation();

  const adaptivePrefs = {
    style: selectedStyle,
    context: "",
    energy: "",
    bpm: "",
    vocals: ""
  };

  if (styleEl) styleEl.value = adaptivePrefs.style;
  if (contextEl) contextEl.value = adaptivePrefs.context;
  if (energyEl) energyEl.value = adaptivePrefs.energy;
  if (bpmEl) bpmEl.value = adaptivePrefs.bpm;
  if (vocalsEl) vocalsEl.value = adaptivePrefs.vocals;
  styleInfoDismissed = false;
  renderStyleInfoBubble(styleEl?.value || "", { reveal: Boolean(styleEl?.value) });

  const generated = await generateRecommendationWithOverlay(
    adaptivePrefs,
    {
      resetRejected: false,
      avoidTrackKey: previousTrack ? `${previousTrack.artist}::${previousTrack.song}` : "",
      avoidTrackTitles: previousTrack?.song ? [previousTrack.song] : [],
      avoidArtistName: previousTrack?.artist || "",
      allowKnownFallback: false
    },
    "catalog"
  );
  if (!generated || !currentRecommendation) return runSurpriseRecommendation();

  if (
    previousTrack &&
    normalize(currentRecommendation.style || "") === normalize(previousTrack.style || "")
  ) {
    return runSurpriseRecommendation();
  }

  const finalStyle = currentRecommendation?.style || adaptivePrefs.style;
  const finalPrefs = {
    ...adaptivePrefs,
    style: finalStyle
  };

  if (styleEl) styleEl.value = finalStyle;
  if (contextEl) contextEl.value = "";
  if (energyEl) energyEl.value = "";
  if (bpmEl) bpmEl.value = "";
  if (vocalsEl) vocalsEl.value = "";
  styleInfoDismissed = false;
  renderStyleInfoBubble(styleEl?.value || "", { reveal: Boolean(styleEl?.value) });

  lastPrefs = finalPrefs;
  if (rerollBtn) rerollBtn.disabled = false;
  if (eventsPanel) eventsPanel.classList.add("hidden");
  if (eventsIntro) eventsIntro.textContent = t("eventsPrompt");
  if (eventsCalendar) eventsCalendar.innerHTML = "";
  if (eventsList) eventsList.innerHTML = "";
  if (detailsPanel) detailsPanel.classList.add("hidden");
  if (resultPanel) resultPanel.classList.remove("hidden");

  const fromStyle = previousTrack ? styleLabelByValue(previousTrack.style) : t("freeStyle");
  const toStyle = styleLabelByValue(finalStyle);
  const adaptiveMessage = t("surpriseAdaptiveGenerated", { from: fromStyle, to: toStyle });
  if (feedbackMessage) feedbackMessage.textContent = adaptiveMessage;
  showToast(adaptiveMessage);
  savePreferences();
  return true;
}

function bindPreferenceAutosave() {
  const controls = [
    styleEl,
    contextEl,
    energyEl,
    bpmEl,
    vocalsEl,
    knownArtistsEl,
    discoveryModeEl,
    weightStyleEl,
    weightContextEl,
    weightEnergyEl,
    weightBpmEl,
    weightVocalsEl
  ];

  controls.forEach((control) => {
    bind(control, "change", () => {
      updateWeightLabels();
      savePreferences();
      suggestionQueueTracks = [];
      suggestionQueueContextKey = "";
      renderSuggestionQueue(null);
      if (control === knownArtistsEl) updateStats();
      if (control === styleEl) {
        styleInfoDismissed = false;
        renderStyleInfoBubble(styleEl?.value || "", { reveal: Boolean(styleEl?.value) });
        applyGenreVibeTheme(styleEl?.value || "", { force: true });
      }
    });
    bind(control, "input", () => {
      updateWeightLabels();
      savePreferences();
      suggestionQueueTracks = [];
      suggestionQueueContextKey = "";
      renderSuggestionQueue(null);
      if (control === knownArtistsEl) updateStats();
      if (control === styleEl) {
        styleInfoDismissed = false;
        renderStyleInfoBubble(styleEl?.value || "", { reveal: Boolean(styleEl?.value) });
        applyGenreVibeTheme(styleEl?.value || "", { force: true });
      }
    });
  });
}

bind(audioToggleBtn, "click", () => {
  setAudioEnabled(!audioEnabled, { persist: true, fromUser: true });
});

bind(introContinueBtn, "click", () => {
  showLanguageScreen();
});

bind(startBtn, "click", () => {
  enterAppFromWelcome({ surprise: false });
});

bind(startSurpriseBtn, "click", () => {
  openQuickSurprisePanel();
});

bind(quickSurpriseCancelBtn, "click", () => {
  closeQuickSurprisePanel();
});

bind(quickSurpriseRunBtn, "click", () => {
  const selectedStyle = String(quickSurpriseStyleEl?.value || "").trim();
  if (!selectedStyle) {
    showToast(t("quickSurpriseNeedStyle"));
    if (quickSurpriseStyleEl) quickSurpriseStyleEl.focus();
    return;
  }
  const knownArtists = String(quickSurpriseKnownArtistsEl?.value || "").trim();
  const knownTracks = String(quickSurpriseKnownTracksEl?.value || "").trim();
  enterAppFromWelcome({
    surprise: true,
    surprisePreset: {
      style: selectedStyle,
      knownArtists,
      knownTracks
    }
  });
});

languageButtons.forEach((button) => {
  bind(button, "click", () => {
    const lang = button.dataset.lang || DEFAULT_LANGUAGE;
    setLanguage(lang);
    showAuthScreen();
  });
});

bind(authLoginBtn, "click", loginWithCredentials);
bind(authGuestBtn, "click", continueWithoutLogin);
bind(styleInfoCloseBtn, "click", () => {
  styleInfoDismissed = true;
  if (styleInfoBubble) styleInfoBubble.classList.add("hidden");
});
bind(authPassword, "keydown", (event) => {
  if (event.key !== "Enter") return;
  event.preventDefault();
  loginWithCredentials();
});
bind(spiritCollectibleDownload, "click", (event) => {
  event.preventDefault();
  const imageUrl = String(
    spiritCollectibleShareInstagramBtn?.dataset.imageUrl ||
      spiritCollectibleImage?.getAttribute("src") ||
      spiritCollectibleDownload?.getAttribute("href") ||
      ""
  ).trim();
  if (!imageUrl || imageUrl === "#") {
    showToast(t("spiritCollectibleShareNoAsset"));
    return;
  }
  const baseFilename = String(
    spiritCollectibleShareInstagramBtn?.dataset.filename ||
      spiritCollectibleDownload?.getAttribute("download") ||
      spiritCollectibleFilename(currentSpiritId || "spirit", collectibleMilestoneForLikes(totalPositiveLikes()).likes, imageUrl)
  );
  const downloaded = triggerSpiritCollectibleDownload(imageUrl, baseFilename);
  if (!downloaded) {
    showToast(t("spiritCollectibleShareNoAsset"));
  }
});
bind(spiritCollectibleShareInstagramBtn, "click", async () => {
  await shareSpiritCollectibleToInstagram();
});
bind(trackAiRefreshBtn, "click", async () => {
  if (!currentRecommendation) return;
  renderTrackInsightPanel(currentRecommendation, lastPrefs, { force: true });
  showToast(t("trackAiUpdatedToast"));
});
bind(suggestionQueueList, "click", async (event) => {
  const target = event.target instanceof Element ? event.target.closest("button[data-queue-index]") : null;
  if (!target) return;
  const index = Number(target.dataset.queueIndex || -1);
  await activateSuggestionQueueIndex(index);
});
bind(quizStartBtn, "click", () => {
  startQuizFromChallenge();
});
bind(quizLaterBtn, "click", () => {
  snoozeQuizChallenge();
});
bind(quizOptions, "click", (event) => {
  const target = event.target instanceof Element ? event.target.closest("button[data-option-index]") : null;
  if (!target) return;
  const optionIndex = Number(target.dataset.optionIndex || -1);
  selectQuizOption(optionIndex);
});
bind(quizSubmitBtn, "click", () => {
  submitQuizAnswer();
});
bind(quizNextBtn, "click", () => {
  advanceQuizQuestion();
});
bind(quizRetryBtn, "click", () => {
  retryQuizSession();
});
bind(quizCloseBtn, "click", () => {
  closeQuizOverlay({ playSound: true });
});

bind(youtubePreviewToggleBtn, "click", () => {
  if (!currentRecommendation) return;
  syncYouTubePreviewAttemptForTrack(currentRecommendation);
  const canRetry = youtubePreviewCanRetry(currentRecommendation);
  const expanded = Boolean(youtubePreviewWrap && !youtubePreviewWrap.classList.contains("hidden"));
  if (expanded) {
    resetYouTubePreviewEmbed();
    setYouTubePreviewActionState({
      visible: true,
      canToggle: true,
      canRetry,
      expanded: false
    });
    return;
  }

  const hasAudioPreview = Boolean(trackPreview && !trackPreview.classList.contains("hidden"));
  const attempt = trackHasDirectYouTubeVideo(currentRecommendation) ? 0 : youtubePreviewSearchAttempt;
  const opened = showYouTubePreviewEmbed(currentRecommendation, { autoplay: !hasAudioPreview, attempt });
  setYouTubePreviewActionState({
    visible: true,
    canToggle: true,
    canRetry,
    expanded: opened
  });
  if (!opened && previewStatus) {
    const platforms = availableExternalPlatforms();
    previewStatus.textContent = platforms.length
      ? t("previewUnavailableWithLinks", { platforms: platforms.join("/") })
      : t("previewUnavailable");
  }
});

bind(youtubePreviewRetryBtn, "click", () => {
  if (!currentRecommendation) return;
  syncYouTubePreviewAttemptForTrack(currentRecommendation);
  if (trackHasDirectYouTubeVideo(currentRecommendation)) return;

  const attemptCount = youtubePreviewSearchAttemptCount(currentRecommendation);
  if (attemptCount < 2) return;
  youtubePreviewSearchAttempt = (youtubePreviewSearchAttempt + 1) % attemptCount;

  const hasAudioPreview = Boolean(trackPreview && !trackPreview.classList.contains("hidden"));
  const opened = showYouTubePreviewEmbed(currentRecommendation, {
    autoplay: !hasAudioPreview,
    attempt: youtubePreviewSearchAttempt
  });
  setYouTubePreviewActionState({
    visible: true,
    canToggle: true,
    canRetry: attemptCount > 1,
    expanded: opened
  });
  if (!opened && previewStatus) {
    const platforms = availableExternalPlatforms();
    previewStatus.textContent = platforms.length
      ? t("previewUnavailableWithLinks", { platforms: platforms.join("/") })
      : t("previewUnavailable");
    return;
  }
  if (previewStatus) {
    previewStatus.textContent = hasAudioPreview
      ? `${t("previewReady")} ${t("previewYoutubeInlineHint")}`
      : t("previewYoutubeFallback");
  }
});

bind(recommendBtn, "click", runRecommendation);

bind(rerollBtn, "click", async () => {
  if (!lastPrefs) return;
  const previousTrackKey = currentRecommendation
    ? normalize(`${currentRecommendation.artist}::${currentRecommendation.song}`)
    : "";
  const queueTrackKeys = suggestionQueueTracks
    .map((track) => recommendationTrackKey(track))
    .filter(Boolean);
  const avoidTrackKey = currentRecommendation
    ? `${currentRecommendation.artist}::${currentRecommendation.song}`
    : "";
  const avoidDiscoveryName = currentDiscovery?.name || "";

  if (currentRecommendation) {
    addArtistIdentityToSet(rejectedArtists, currentRecommendation.artist);
  }

  const generated = await generateRecommendationWithOverlay(lastPrefs, {
    resetRejected: false,
    avoidTrackKey,
    avoidTrackKeys: queueTrackKeys,
    avoidDiscoveryName,
    avoidArtistName: currentRecommendation?.artist || ""
  });
  if (!generated) {
    if (feedbackMessage) feedbackMessage.textContent = recommendationFailureMessage();
    showToast(recommendationFailureMessage());
    return;
  }

  if (eventsPanel) eventsPanel.classList.add("hidden");
  if (eventsIntro) eventsIntro.textContent = t("eventsPrompt");
  if (eventsCalendar) eventsCalendar.innerHTML = "";
  if (eventsList) eventsList.innerHTML = "";
  if (detailsPanel) detailsPanel.classList.add("hidden");
  if (resultPanel) resultPanel.classList.remove("hidden");

  if (feedbackMessage) {
    const newTrackKey = currentRecommendation
      ? normalize(`${currentRecommendation.artist}::${currentRecommendation.song}`)
      : "";
    const fallbackMessage = applyStyleFallbackMessage({ setFeedback: false });
    if (fallbackMessage) {
      feedbackMessage.textContent = fallbackMessage;
    } else {
      feedbackMessage.textContent =
        previousTrackKey && newTrackKey && previousTrackKey === newTrackKey
          ? t("rerollNoOption")
          : t("rerollGenerated");
    }
  }
  playUiSfx("swap");
  savePreferences();
});

bind(surpriseBtn, "click", async () => {
  await runSurpriseRecommendation();
});

bind(adaptiveSurpriseBtn, "click", async () => {
  await runAdaptiveSurpriseRecommendation();
});

bind(clearFiltersBtn, "click", () => {
  clearFilters();
  if (feedbackMessage) feedbackMessage.textContent = t("clearFiltersFeedback");
  if (newArtistsPanel) newArtistsPanel.classList.add("hidden");
  if (newArtistsList) newArtistsList.innerHTML = "";
  if (newArtistsStatus) newArtistsStatus.textContent = "";
});

bind(resetAppBtn, "click", resetAppAsNewUser);

bind(newArtistsBtn, "click", searchNewArtistsByStyle);

bind(knownYesBtn, "click", async () => {
  if (!currentRecommendation || !lastPrefs) return;

  const artistKey = artistMatchKey(currentRecommendation.artist);
  const trackKey = `${currentRecommendation.artist}::${currentRecommendation.song}`;
  const knownTrackTitle = normalizeTitle(currentRecommendation.song);
  addArtistIdentityToSet(knownArtistsMemory, currentRecommendation.artist);
  if (knownTrackTitle) knownTrackTitlesMemory.add(knownTrackTitle);
  addArtistIdentityToSet(rejectedArtists, currentRecommendation.artist);
  syncKnownArtistsTextarea(currentRecommendation.artist);
  saveProgress();

  let generated = await generateRecommendationWithOverlay(lastPrefs, {
    resetRejected: false,
    avoidTrackKey: trackKey,
    avoidTrackTitles: knownTrackTitle ? [knownTrackTitle] : [],
    avoidArtistName: currentRecommendation?.artist || "",
    allowKnownFallback: false
  });
  if (!generated) {
    currentRecommendation = null;
    currentDiscovery = null;
    if (resultPanel) resultPanel.classList.add("hidden");
    if (knownArtistPrompt) knownArtistPrompt.classList.add("hidden");
    if (noveltyEnjoyPrompt) noveltyEnjoyPrompt.classList.add("hidden");
    if (feedbackMessage) feedbackMessage.textContent = recommendationFailureMessage();
    showToast(recommendationFailureMessage());
    return;
  }

  if (currentRecommendation && normalize(`${currentRecommendation.artist}::${currentRecommendation.song}`) === normalize(trackKey)) {
    addArtistIdentityToSet(rejectedArtists, currentRecommendation.artist);
    generated = await generateRecommendationWithOverlay(lastPrefs, {
      resetRejected: false,
      avoidTrackKey: trackKey,
      avoidTrackTitles: knownTrackTitle ? [knownTrackTitle] : [],
      avoidArtistName: currentRecommendation?.artist || "",
      allowKnownFallback: false
    });
    if (!generated) {
      currentRecommendation = null;
      currentDiscovery = null;
      if (resultPanel) resultPanel.classList.add("hidden");
      if (knownArtistPrompt) knownArtistPrompt.classList.add("hidden");
      if (noveltyEnjoyPrompt) noveltyEnjoyPrompt.classList.add("hidden");
      if (feedbackMessage) feedbackMessage.textContent = recommendationFailureMessage();
      showToast(recommendationFailureMessage());
      return;
    }
  }

  if (artistMatchKey(currentRecommendation.artist) === artistKey) {
    currentRecommendation = null;
    currentDiscovery = null;
    if (resultPanel) resultPanel.classList.add("hidden");
    if (knownArtistPrompt) knownArtistPrompt.classList.add("hidden");
    if (noveltyEnjoyPrompt) noveltyEnjoyPrompt.classList.add("hidden");
    if (feedbackMessage) {
      feedbackMessage.textContent = t("noUnknownOption");
    }
    playUiSfx("error");
    return;
  }

  const knownSwapFallback = applyStyleFallbackMessage({ setFeedback: false });
  if (feedbackMessage) {
    feedbackMessage.textContent = knownSwapFallback || t("swappedUnknown");
  }
  playUiSfx("swap");
  if (!knownSwapFallback) showToast(t("toastFoundNewArtist"));
  savePreferences();
});

bind(knownNoBtn, "click", () => {
  if (!currentRecommendation) return;
  registerDiscoveredArtist(currentRecommendation.artist);
  if (noveltyEnjoyPrompt) noveltyEnjoyPrompt.classList.remove("hidden");
  burstConfetti(knownNoBtn, ["#9bffb7", "#6effdc", "#7de0ff"]);
  if (feedbackMessage) {
    feedbackMessage.textContent = t("newArtistDetected");
  }
  playUiSfx("like");
  updateStats();
  showToast(t("toastNewDiscovery"));
});

starButtons.forEach((button) => {
  bind(button, "click", async () => {
    if (!currentRecommendation) return;
    const stars = Number(button.dataset.stars || 0);
    if (!Number.isFinite(stars) || stars < 1 || stars > 5) return;
    await rateCurrentRecommendation(stars, button);
  });
});

bind(previewLikeBtn, "click", async () => {
  if (!currentRecommendation) return;
  userStats.likedSongs += 1;
  registerTrackFeedback(currentRecommendation, true, { rewardPreview: true, source: "preview_like" });
  registerSpiritSignal(currentRecommendation.style, 1.2);
  updateStats();
  burstConfetti(previewLikeBtn);
  if (listeningPrompt) {
    listeningPrompt.classList.remove("celebrate");
    void listeningPrompt.offsetWidth;
    listeningPrompt.classList.add("celebrate");
  }
  if (feedbackMessage) feedbackMessage.textContent = t("prioritizeSimilar");
  playUiSfx("like");
  showToast(t("toastShowMoreLikeThis"));
  await renderMusicalSpirit({
    celebrate: shouldCelebrateSpiritUnlockOnSongs(),
    triggerEl: previewLikeBtn,
    forceAnimation: true
  });
  await revealArtistBioWithAnimation();
  await loadEventsForArtist(currentRecommendation.artist);
});

bind(previewDislikeBtn, "click", async () => {
  if (!currentRecommendation || !lastPrefs) return;
  userStats.skipped += 1;
  const feedbackReason = registerTrackFeedback(currentRecommendation, false, {
    source: "preview_dislike",
    avoidRepeatArtist: true
  });
  lastRejectedTrackKey = `${currentRecommendation.artist}::${currentRecommendation.song}`;
  const generated = await generateRecommendationWithOverlay(lastPrefs, {
    resetRejected: false,
    avoidTrackKey: lastRejectedTrackKey,
    avoidArtistName: currentRecommendation?.artist || ""
  });
  if (!generated) {
    if (feedbackMessage) feedbackMessage.textContent = recommendationFailureMessage();
    showToast(recommendationFailureMessage());
    return;
  }
  const previewDislikeFallback = applyStyleFallbackMessage({ setFeedback: false });
  const reasonMessage = feedbackReason === "preview_issue" ? t("previewIssueLearned") : t("swappedNow");
  if (feedbackMessage) feedbackMessage.textContent = previewDislikeFallback || reasonMessage;
  playUiSfx("dislike");
  if (!previewDislikeFallback) {
    showToast(feedbackReason === "preview_issue" ? t("toastPreviewIssueLearned") : t("toastSwapped"));
  }
  updateStats();
});

bind(noveltyLikedBtn, "click", async () => {
  if (!currentRecommendation) return;
  userStats.likedSongs += 1;
  registerTrackFeedback(currentRecommendation, true);
  registerSpiritSignal(currentRecommendation.style, 1.1);
  updateStats();
  if (knownArtistPrompt) {
    knownArtistPrompt.classList.remove("celebrate");
    void knownArtistPrompt.offsetWidth;
    knownArtistPrompt.classList.add("celebrate");
  }
  if (feedbackMessage) {
    feedbackMessage.textContent = t("celebrationActivated", { song: currentRecommendation.song });
  }
  playUiSfx("like");
  burstConfetti(noveltyLikedBtn);
  showToast(t("toastFavoritedDiscovery"));
  await renderMusicalSpirit({
    celebrate: shouldCelebrateSpiritUnlockOnSongs(),
    triggerEl: noveltyLikedBtn,
    forceAnimation: true
  });
  await revealArtistBioWithAnimation();
  await loadEventsForArtist(currentRecommendation.artist);
});

bind(noveltyNotYetBtn, "click", async () => {
  if (!currentRecommendation || !lastPrefs) return;
  const feedbackReason = registerTrackFeedback(currentRecommendation, false, {
    source: "novelty_not_yet",
    avoidRepeatArtist: true
  });
  lastRejectedTrackKey = `${currentRecommendation.artist}::${currentRecommendation.song}`;
  const generated = await generateRecommendationWithOverlay(lastPrefs, {
    resetRejected: false,
    avoidTrackKey: lastRejectedTrackKey,
    avoidArtistName: currentRecommendation?.artist || ""
  });
  if (!generated) {
    if (feedbackMessage) feedbackMessage.textContent = recommendationFailureMessage();
    showToast(recommendationFailureMessage());
    return;
  }
  const noveltyNotYetFallback = applyStyleFallbackMessage({ setFeedback: false });
  if (feedbackMessage) {
    feedbackMessage.textContent = noveltyNotYetFallback || (feedbackReason === "preview_issue" ? t("previewIssueLearned") : t("refinedAfterNo"));
  }
  playUiSfx("dislike");
  if (!noveltyNotYetFallback) {
    showToast(feedbackReason === "preview_issue" ? t("toastPreviewIssueLearned") : t("toastTryBetter"));
  }
});

bind(likeSongBtn, "click", async () => {
  if (!currentRecommendation) return;
  userStats.likedSongs += 1;
  registerTrackFeedback(currentRecommendation, true);
  registerSpiritSignal(currentRecommendation.style, 1.25);
  if (feedbackMessage) feedbackMessage.textContent = t("songAddedProfile", { song: currentRecommendation.song });
  playUiSfx("like");
  burstConfetti(likeSongBtn, ["#6effdc", "#7de0ff", "#ffd07d"]);
  showToast(t("toastSongLiked"));
  updateStats();
  await renderMusicalSpirit({
    celebrate: shouldCelebrateSpiritUnlockOnSongs(),
    triggerEl: likeSongBtn,
    forceAnimation: true
  });
  await revealArtistBioWithAnimation();
  await loadEventsForArtist(currentRecommendation.artist);
});

bind(likeArtistBtn, "click", async () => {
  if (!currentRecommendation) return;
  userStats.likedArtists += 1;
  boost(adaptiveModel.likedArtists, currentRecommendation.artist, 1.4);
  registerTrackPreferenceSignal(currentRecommendation, 0.56);
  registerSpiritSignal(currentRecommendation.style, 1);
  if (feedbackMessage) feedbackMessage.textContent = t("artistFavorited", { artist: currentRecommendation.artist });
  playUiSfx("like");
  showToast(t("toastArtistSaved"));
  updateStats();
  await renderMusicalSpirit({
    celebrate: shouldCelebrateSpiritUnlockOnSongs(),
    triggerEl: likeArtistBtn,
    forceAnimation: true
  });
  await revealArtistBioWithAnimation();
  await loadEventsForArtist(currentRecommendation.artist);
});

bind(blockArtistBtn, "click", async () => {
  if (!currentRecommendation) return;
  const blockedArtistName = String(currentRecommendation.artist || "").trim();
  const blockedArtistKey = artistMatchKey(blockedArtistName);
  if (!blockedArtistKey) return;

  addArtistIdentityToSet(blockedArtistsMemory, blockedArtistName);
  addArtistIdentityToSet(rejectedArtists, blockedArtistName);
  boost(adaptiveModel.dislikedArtists, blockedArtistName, 1.35);

  const blockedMessage = t("artistBlockedFromRecommendations", { artist: blockedArtistName });
  if (feedbackMessage) feedbackMessage.textContent = blockedMessage;
  playUiSfx("dislike");
  showToast(t("toastArtistBlocked"));
  updateStats();

  if (!lastPrefs) return;
  const blockedTrackKey = `${currentRecommendation.artist}::${currentRecommendation.song}`;
  const generated = await generateRecommendationWithOverlay(lastPrefs, {
    resetRejected: false,
    avoidTrackKey: blockedTrackKey,
    avoidArtistName: blockedArtistName
  });
  if (!generated) {
    if (feedbackMessage) feedbackMessage.textContent = recommendationFailureMessage();
    showToast(recommendationFailureMessage());
    return;
  }
  const blockArtistFallback = applyStyleFallbackMessage({ setFeedback: false });
  if (feedbackMessage) feedbackMessage.textContent = blockArtistFallback || `${blockedMessage} ${t("swappedNow")}`;
});

bind(likeDiscoveryBtn, "click", async () => {
  if (!currentDiscovery) {
    if (feedbackMessage) feedbackMessage.textContent = t("enableDiscoveryMode");
    return;
  }
  userStats.likedDiscoveries += 1;
  registerDiscoveredArtist(currentDiscovery.name);
  registerSpiritSignal(currentDiscovery.style, 0.95);
  if (feedbackMessage) feedbackMessage.textContent = t("likedDiscovery", { artist: currentDiscovery.name });
  playUiSfx("like");
  burstConfetti(likeDiscoveryBtn, ["#9bffb7", "#6effdc", "#7de0ff"]);
  showToast(t("toastDiscoveryLiked"));
  updateStats();
  await renderMusicalSpirit({
    celebrate: shouldCelebrateSpiritUnlockOnSongs(),
    triggerEl: likeDiscoveryBtn,
    forceAnimation: true
  });
  await loadEventsForArtist(currentDiscovery.name);
});

bind(knewDiscoveryBtn, "click", () => {
  if (!currentDiscovery) return;
  userStats.alreadyKnew += 1;
  if (feedbackMessage) feedbackMessage.textContent = t("discoveryKnown");
  showToast(t("toastDiscoveryKnown"));
  updateStats();
});

bind(skipBtn, "click", async () => {
  if (!currentRecommendation || !lastPrefs) return;
  userStats.skipped += 1;
  const feedbackReason = registerTrackFeedback(currentRecommendation, false, {
    source: "skip",
    avoidRepeatArtist: true
  });
  lastRejectedTrackKey = `${currentRecommendation.artist}::${currentRecommendation.song}`;
  const generated = await generateRecommendationWithOverlay(lastPrefs, {
    resetRejected: false,
    avoidTrackKey: lastRejectedTrackKey,
    avoidArtistName: currentRecommendation?.artist || ""
  });
  if (!generated) {
    if (feedbackMessage) feedbackMessage.textContent = recommendationFailureMessage();
    showToast(recommendationFailureMessage());
    return;
  }
  const skipFallback = applyStyleFallbackMessage({ setFeedback: false });
  if (feedbackMessage) {
    feedbackMessage.textContent = skipFallback || (feedbackReason === "preview_issue" ? t("previewIssueLearned") : t("skipAdjusted"));
  }
  playUiSfx("dislike");
  if (!skipFallback) {
    showToast(feedbackReason === "preview_issue" ? t("toastPreviewIssueLearned") : t("toastSkipAdjusted"));
  }
  updateStats();
});

bind(moreInfoBtn, "click", () => {
  if (!currentRecommendation) return;
  if (detailsPanel) {
    detailsPanel.classList.remove("hidden");
    detailsPanel.scrollIntoView({ behavior: "smooth", block: "start" });
  }
});

syncDiscoveryFromSeeds();
loadDynamicCatalogCache();
injectLocalTrackSeedBoost();
ensureMinimumArtistSeedsPerStyle(MIN_ARTISTS_PER_STYLE);
normalizeTrustedSlambientCatalog();
sanitizeCatalogByStyleRules();
Object.keys(STYLE_BPM_RULES).forEach((style) => purgeDynamicMismatches(style));
dedupeCatalogByTrackKey();
saveDynamicCatalogCache();
void hydrateExternalDatasetPackInBackground();
window.neonpulseCoverageReport = buildCoverageReport;
window.neonpulseCoverageGaps = () => buildCoverageReport().filter((row) => !row.healthy);
window.neonpulseGenreAudit = buildCatalogGenreAudit;
window.neonpulseGenreAuditSummary = () => {
  const report = buildCatalogGenreAudit({ sampleLimit: 0 });
  const { sample, ...summary } = report;
  return summary;
};
loadLanguage();
bootstrapAudio();
showIntroScreen();
updateWeightLabels();
bindPreferenceAutosave();
ensureAllButtonsHaveAction();
applyGenreVibeTheme("", { force: true });
