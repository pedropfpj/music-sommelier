import fs from "node:fs";
import path from "node:path";

const ROOT = process.cwd();
const DATA_DIR = path.join(ROOT, "data");
const REPORT_DIR = path.join(ROOT, "reports");
const BATCH = "electronic_subgenre_expansion_v15_20260621";
const TRACK_OUT = path.join(DATA_DIR, `${BATCH}.csv`);
const PROFILE_OUT = path.join(DATA_DIR, "electronic_subgenre_artist_profiles_v15_20260621.csv");
const REPORT_OUT = path.join(REPORT_DIR, "electronic_subgenre_expansion_v15_2026-06-21.md");
const REQUEST_PAUSE_MS = 220;
const TARGET_TRACKS_PER_ARTIST = 8;
const DEEZER_TOP_LIMIT = 50;

const STYLE_CONFIG = {
  edm: ["EDM / festival electronic", "house", 124, 132],
  progressive_edm: ["Progressive EDM", "house", 126, 130],
  big_room_house: ["Big Room House", "house", 126, 132],
  future_house: ["Future House", "house", 122, 128],
  slap_house: ["Slap House", "house", 118, 126],
  tropical_house: ["Tropical House", "house", 100, 124],
  complextro: ["Complextro", "house", 126, 132],
  electronic_dance_pop: ["Electronic Dance-Pop", "house", 118, 132],
  chicago_house: ["Chicago House", "house", 118, 126],
  french_house: ["French House / Filter House", "house", 120, 128],
  funky_house: ["Funky House", "house", 122, 128],
  tribal_house: ["Tribal House", "house", 122, 130],
  latin_house: ["Latin House", "house", 122, 130],
  piano_house: ["Piano House", "house", 118, 126],
  melodic_house: ["Melodic House", "house", 118, 126],
  microhouse: ["Microhouse", "house", 120, 128],
  progressive_trance: ["Progressive Trance", "trance", 128, 138],
  acid_trance: ["Acid Trance", "trance", 132, 145],
  balearic_trance: ["Balearic Trance", "trance", 120, 136],
  dream_trance: ["Dream Trance", "trance", 132, 140],
  vocal_trance: ["Vocal Trance", "trance", 132, 140],
  brostep: ["Brostep", "bass_music", 138, 150],
  melodic_dubstep: ["Melodic Dubstep", "bass_music", 138, 150],
  chillstep: ["Chillstep", "bass_music", 130, 145],
  post_dubstep: ["Post-Dubstep", "bass_music", 124, 140],
  drumstep: ["Drumstep", "bass_music", 160, 175],
  nu_skool_breaks: ["Nu Skool Breaks", "bass_music", 128, 140],
  florida_breaks: ["Florida Breaks", "bass_music", 125, 135],
  bassline: ["Bassline", "bass_music", 132, 142],
  uk_bass: ["UK Bass", "bass_music", 126, 138],
  wonky: ["Wonky", "bass_music", 80, 150],
  glitch_hop: ["Glitch Hop", "bass_music", 90, 115],
  neurohop: ["Neurohop", "bass_music", 90, 115],
  edm_trap: ["EDM Trap", "bass_music", 130, 150],
  hardwave: ["Hardwave", "bass_music", 130, 150],
  darkstep: ["Darkstep", "dnb", 170, 180],
  techstep: ["Techstep", "dnb", 168, 176],
  hardstep: ["Hardstep", "dnb", 168, 176],
  atmospheric_jungle: ["Atmospheric Jungle", "dnb", 160, 170],
  ragga_jungle: ["Ragga Jungle", "dnb", 160, 174],
  sambass: ["Sambass", "dnb", 170, 176],
  drumfunk: ["Drumfunk", "dnb", 165, 175],
  crossbreed: ["Crossbreed", "hard_dance", 170, 190],
  euphoric_hardstyle: ["Euphoric Hardstyle", "hard_dance", 150, 160],
  reverse_bass: ["Reverse Bass", "hard_dance", 145, 155],
  hard_dance: ["Hard Dance", "hard_dance", 140, 155],
  uk_hardcore: ["UK Hardcore", "hard_dance", 160, 180],
  terrorcore: ["Terrorcore", "hard_dance", 190, 280],
  extratone: ["Extratone", "hard_dance", 300, 1200],
  makina: ["Makina", "hard_dance", 160, 180],
  dark_ambient: ["Dark Ambient", "leftfield", 40, 110],
  space_ambient: ["Space Ambient", "leftfield", 40, 110],
  ambient_house: ["Ambient House", "leftfield", 100, 125],
  ambient_dub: ["Ambient Dub", "leftfield", 70, 115],
  lowercase: ["Lowercase", "leftfield", 40, 90],
  microsound: ["Microsound", "leftfield", 40, 140],
  electroacoustic: ["Electroacoustic", "leftfield", 40, 140],
  musique_concrete: ["Musique Concrete", "leftfield", 40, 140],
  berlin_school: ["Berlin School", "leftfield", 70, 130],
  kosmische_musik: ["Kosmische Musik", "leftfield", 60, 130],
  italo_disco: ["Italo Disco", "leftfield", 110, 125],
  hi_nrg: ["Hi-NRG", "leftfield", 120, 140],
  eurodance: ["Eurodance", "house", 124, 145],
  retrowave: ["Retrowave", "leftfield", 80, 120],
  outrun: ["Outrun", "leftfield", 90, 125],
  darksynth: ["Darksynth", "leftfield", 90, 130],
  minimal_wave: ["Minimal Wave", "leftfield", 80, 125],
  futurepop: ["Futurepop", "leftfield", 120, 140],
  industrial_dance: ["Industrial Dance", "leftfield", 115, 140],
  jersey_club: ["Jersey Club", "bass_music", 130, 145],
  baltimore_club: ["Baltimore Club", "bass_music", 125, 135],
  ballroom_vogue_beats: ["Ballroom / Vogue Beats", "bass_music", 120, 130],
  kuduro_eletronico: ["Kuduro Eletronico", "bass_music", 130, 145],
  batida: ["Batida", "bass_music", 125, 145],
  singeli: ["Singeli", "bass_music", 180, 240],
  shangaan_electro: ["Shangaan Electro", "bass_music", 170, 190],
  ghetto_house: ["Ghetto House", "house", 130, 150],
  ghettotech: ["Ghettotech", "bass_music", 140, 160],
  deconstructed_club: ["Deconstructed Club", "leftfield", 70, 150],
  big_room_techno: ["Big Room Techno", "house", 130, 140],
  mainstage_techno: ["Mainstage Techno", "house", 130, 140]
};

const TRACKS = [
  t("edm", "Martin Garrix", "Animals", "Spinnin' Records", 128, "Netherlands", "Amstelveen", "festival_edm_anchor"),
  t("edm", "Avicii", "Levels", "Universal Music", 126, "Sweden", "Stockholm", "festival_edm_melodic_anchor"),
  t("progressive_edm", "Swedish House Mafia", "Greyhound", "Virgin", 128, "Sweden", "Stockholm", "progressive_edm_peak"),
  t("progressive_edm", "Alesso", "Years", "Refune", 128, "Sweden", "Stockholm", "progressive_edm_melodic"),
  t("progressive_edm", "Alesso", "Calling (Lose My Mind)", "Refune", 128, "Sweden", "Stockholm", "progressive_edm_hook"),
  t("progressive_edm", "Nicky Romero", "I Could Be The One", "Protocol", 128, "Netherlands", "Amerongen", "progressive_edm_crossover"),
  t("big_room_house", "Hardwell", "Spaceman", "Revealed Recordings", 128, "Netherlands", "Breda", "big_room_anchor"),
  t("big_room_house", "Dimitri Vegas & Like Mike", "Mammoth", "Spinnin' Records", 128, "Belgium", "Willebroek", "big_room_mainstage"),
  t("future_house", "Oliver Heldens", "Gecko", "Spinnin' Records", 125, "Netherlands", "Rotterdam", "future_house_anchor"),
  t("future_house", "Tchami", "Promesses", "Ministry of Sound", 124, "France", "Paris", "future_house_bassline"),
  t("slap_house", "Imanbek", "Roses - Imanbek Remix", "Effective Records", 122, "Kazakhstan", "Aksu", "slap_house_global"),
  t("slap_house", "Dynoro", "In My Mind", "B1 Recordings", 126, "Lithuania", "Vilnius", "slap_house_pop_bridge"),
  t("tropical_house", "Kygo", "Firestone", "Sony Music", 114, "Norway", "Bergen", "tropical_house_anchor"),
  t("tropical_house", "Klingande", "Jubel", "Klingande Music", 124, "France", "Croix", "tropical_house_sax"),
  t("complextro", "Porter Robinson", "Say My Name", "Ministry of Sound", 128, "United States", "Chapel Hill", "complextro_glitch_pop"),
  t("complextro", "Wolfgang Gartner", "Illmerica", "Ultra Records", 128, "United States", "Los Angeles", "complextro_electro_anchor"),
  t("electronic_dance_pop", "Zedd", "Clarity", "Interscope", 128, "Germany", "Kaiserslautern", "edm_pop_vocal"),
  t("electronic_dance_pop", "Calvin Harris", "Feel So Close", "Columbia", 128, "United Kingdom", "Dumfries", "edm_pop_crossover"),

  t("chicago_house", "Frankie Knuckles", "Your Love", "Trax", 120, "United States", "Chicago", "chicago_house_origin"),
  t("chicago_house", "Marshall Jefferson", "Move Your Body", "Trax", 122, "United States", "Chicago", "chicago_house_piano_origin"),
  t("french_house", "Daft Punk", "Around the World", "Virgin", 121, "France", "Paris", "french_house_filter_anchor"),
  t("french_house", "Stardust", "Music Sounds Better With You", "Roule", 124, "France", "Paris", "filter_house_classic"),
  t("funky_house", "Armand Van Helden", "You Don't Know Me", "FFRR", 128, "United States", "Boston", "funky_house_vocal"),
  t("funky_house", "Junior Jack", "Stupidisco", "PIAS", 125, "Belgium", "Brussels", "funky_house_disco"),
  t("tribal_house", "Danny Tenaglia", "Elements", "Twisted America", 124, "United States", "New York", "tribal_house_anchor"),
  t("tribal_house", "Chus & Ceballos", "Iberican Sound", "Stereo Productions", 126, "Spain", "Madrid", "tribal_house_iberican"),
  t("latin_house", "Mambana", "Libre", "Soulfuric Trax", 126, "Netherlands", "Amsterdam", "latin_house_vocal"),
  t("latin_house", "Afro Medusa", "Pasilda", "Rulin Records", 128, "United Kingdom", "London", "latin_house_percussion"),
  t("piano_house", "CeCe Rogers", "Someday", "Atlantic", 120, "United States", "New York", "piano_house_soul"),
  t("piano_house", "Alison Limerick", "Where Love Lives", "Arista", 122, "United Kingdom", "London", "piano_house_vocal"),
  t("melodic_house", "Ben Bohmer", "Beyond Beliefs", "Anjunadeep", 122, "Germany", "Berlin", "melodic_house_deep"),
  t("melodic_house", "Lane 8", "Atlas", "Anjunadeep", 122, "United States", "Denver", "melodic_house_progressive"),
  t("microhouse", "Isolee", "Beau Mot Plage", "Playhouse", 124, "Germany", "Frankfurt", "microhouse_anchor"),
  t("microhouse", "Akufen", "Deck The House", "Perlon", 126, "Canada", "Montreal", "microhouse_cutup"),

  t("progressive_trance", "Sasha", "Xpander", "Deconstruction", 132, "United Kingdom", "Bangor", "progressive_trance_anchor"),
  t("progressive_trance", "Paul van Dyk", "For An Angel", "MFS", 138, "Germany", "Berlin", "progressive_trance_classic"),
  t("acid_trance", "Union Jack", "Two Full Moons and a Trout", "Platipus", 138, "United Kingdom", "London", "acid_trance_anchor"),
  t("acid_trance", "Emmanuel Top", "Acid Phase", "Attack Records", 135, "France", "Lille", "acid_trance_303"),
  t("balearic_trance", "Chicane", "Offshore", "Xtravaganza", 128, "United Kingdom", "United Kingdom", "balearic_trance_anchor"),
  t("balearic_trance", "Energy 52", "Cafe Del Mar", "Eye Q", 132, "Germany", "Frankfurt", "balearic_trance_classic"),
  t("dream_trance", "Robert Miles", "Children", "DBX", 137, "Italy", "Fagagna", "dream_trance_anchor"),
  t("dream_trance", "BBE", "Seven Days and One Week", "Triangle", 137, "France", "Paris", "dream_trance_euro"),
  t("vocal_trance", "Above & Beyond", "Sun & Moon", "Anjunabeats", 132, "United Kingdom", "London", "vocal_trance_anchor"),
  t("vocal_trance", "OceanLab", "Satellite", "Anjunabeats", 138, "United Kingdom", "London", "vocal_trance_classic"),

  t("brostep", "Skrillex", "Scary Monsters and Nice Sprites", "Mau5trap", 140, "United States", "Los Angeles", "brostep_anchor"),
  t("brostep", "Zomboy", "Nuclear", "Never Say Die", 140, "United Kingdom", "Guildford", "brostep_heavy"),
  t("melodic_dubstep", "Seven Lions", "Days To Come", "OWSLA", 140, "United States", "Santa Barbara", "melodic_dubstep_anchor"),
  t("melodic_dubstep", "Illenium", "Fractures", "Seeking Blue", 150, "United States", "Denver", "melodic_dubstep_emotional"),
  t("chillstep", "Blackmill", "Miracle", "Blackmill", 140, "United Kingdom", "Highlands", "chillstep_anchor"),
  t("chillstep", "CMA", "You're Free", "CMA", 140, "United Kingdom", "International", "chillstep_melodic"),
  t("post_dubstep", "James Blake", "CMYK", "R&S Records", 140, "United Kingdom", "London", "post_dubstep_anchor"),
  t("post_dubstep", "Mount Kimbie", "Carbonated", "Hotflush", 130, "United Kingdom", "London", "post_dubstep_band"),
  t("drumstep", "Pendulum", "The Island - Pt. II (Dusk)", "Warner Music", 174, "Australia", "Perth", "drumstep_dnb_bridge"),
  t("drumstep", "Knife Party", "Bonfire", "EarStorm", 174, "Australia", "Perth", "drumstep_edm"),
  t("nu_skool_breaks", "Plump DJs", "Scram", "Finger Lickin'", 135, "United Kingdom", "London", "nu_skool_breaks_anchor"),
  t("nu_skool_breaks", "Stanton Warriors", "Da Antidote", "Punks", 135, "United Kingdom", "Bristol", "nu_skool_breaks_bass"),
  t("florida_breaks", "DJ Icey", "Escape", "Zone Records", 132, "United States", "Orlando", "florida_breaks_anchor"),
  t("florida_breaks", "Baby Anne", "Probe", "System Recordings", 130, "United States", "Orlando", "florida_breaks_orlando"),
  t("bassline", "T2", "Heartbroken", "2NV", 140, "United Kingdom", "Leeds", "bassline_anchor"),
  t("bassline", "DJ Q", "You Wot!", "Local Action", 135, "United Kingdom", "Huddersfield", "bassline_uk"),
  t("uk_bass", "Joy Orbison", "Hyph Mngo", "Hotflush", 130, "United Kingdom", "London", "uk_bass_anchor"),
  t("uk_bass", "Pearson Sound", "Alien Mode", "Hessle Audio", 130, "United Kingdom", "London", "uk_bass_hessle"),
  t("wonky", "Hudson Mohawke", "Chimes", "Warp", 140, "United Kingdom", "Glasgow", "wonky_anchor"),
  t("wonky", "Rustie", "After Light", "Warp", 140, "United Kingdom", "Glasgow", "wonky_maximal"),
  t("glitch_hop", "The Glitch Mob", "We Can Make The World Stop", "Glass Air", 110, "United States", "Los Angeles", "glitch_hop_anchor"),
  t("glitch_hop", "Opiuo", "Snorkle", "Addictech", 100, "New Zealand", "Nelson", "glitch_hop_funk"),
  t("neurohop", "KOAN Sound", "Sly Fox", "Inspected", 100, "United Kingdom", "Bristol", "neurohop_anchor"),
  t("neurohop", "Kursa", "Micro", "Slug Wife", 100, "United Kingdom", "Bristol", "neurohop_sound_design"),
  t("edm_trap", "RL Grime", "Core", "WeDidIt", 150, "United States", "Los Angeles", "edm_trap_anchor"),
  t("edm_trap", "Baauer", "Harlem Shake", "Mad Decent", 140, "United States", "Philadelphia", "edm_trap_viral"),
  t("hardwave", "Skeler", "Tel Aviv", "Skeler", 140, "Australia", "Perth", "hardwave_anchor"),
  t("hardwave", "Ytho", "Remnant", "Liquid Ritual", 140, "United Kingdom", "International", "hardwave_dark"),

  t("darkstep", "Technical Itch", "The Rukus", "Tech Itch Recordings", 174, "United Kingdom", "Bristol", "darkstep_anchor"),
  t("darkstep", "Limewax", "One of Them", "Tech Itch Recordings", 174, "Netherlands", "Utrecht", "darkstep_heavy"),
  t("techstep", "Ed Rush & Optical", "Bacteria", "Virus Recordings", 174, "United Kingdom", "London", "techstep_anchor"),
  t("techstep", "Trace", "Sonar", "No U-Turn", 170, "United Kingdom", "London", "techstep_no_u_turn"),
  t("hardstep", "DJ Hype", "Ready Or Not", "Ganja Records", 170, "United Kingdom", "London", "hardstep_anchor"),
  t("hardstep", "Dillinja", "Hard Noize", "Valve Recordings", 174, "United Kingdom", "London", "hardstep_bass"),
  t("atmospheric_jungle", "LTJ Bukem", "Atlantis", "Good Looking Records", 164, "United Kingdom", "London", "atmospheric_jungle_anchor"),
  t("atmospheric_jungle", "PFM", "The Western", "Good Looking Records", 164, "United Kingdom", "London", "atmospheric_jungle_liquid"),
  t("ragga_jungle", "Shy FX", "Original Nuttah", "SOUR", 170, "United Kingdom", "London", "ragga_jungle_anchor"),
  t("ragga_jungle", "Congo Natty", "Junglist", "Big Cat", 170, "United Kingdom", "London", "ragga_jungle_soundsystem"),
  t("sambass", "DJ Marky", "LK", "V Recordings", 174, "Brazil", "Sao Paulo", "sambass_anchor"),
  t("sambass", "Patife", "Sambassim", "V Recordings", 174, "Brazil", "Sao Paulo", "sambass_brazil"),
  t("drumfunk", "Paradox", "A Certain Sound", "Paradox Music", 170, "United Kingdom", "Devizes", "drumfunk_anchor"),
  t("drumfunk", "Equinox", "Acid Rain", "Scientific Wax", 170, "United Kingdom", "London", "drumfunk_amen"),
  t("crossbreed", "The Outside Agency", "The Machinery of Death", "Genosha Recordings", 175, "Netherlands", "International", "crossbreed_anchor"),
  t("crossbreed", "Counterstrike", "Timewarp", "Algorythm Recordings", 175, "South Africa", "Cape Town", "crossbreed_dnb_hardcore"),

  t("euphoric_hardstyle", "Headhunterz", "Dragonborn", "Scantraxx", 150, "Netherlands", "Veenendaal", "euphoric_hardstyle_anchor"),
  t("euphoric_hardstyle", "Wildstylez", "Timeless", "Q-Dance", 150, "Netherlands", "Veenendaal", "euphoric_hardstyle_melodic"),
  t("reverse_bass", "TNT", "First Match", "Titanic Records", 150, "Italy", "International", "reverse_bass_anchor"),
  t("reverse_bass", "Tuneboy", "Housenation", "Dance Pollution", 150, "Italy", "Bologna", "reverse_bass_classic"),
  t("hard_dance", "BK", "Revolution", "Nukleuz", 145, "United Kingdom", "London", "hard_dance_anchor"),
  t("hard_dance", "Lisa Lashes", "Unbelievable", "Tidy Trax", 145, "United Kingdom", "Coventry", "hard_dance_uk"),
  t("uk_hardcore", "Darren Styles", "Save Me", "All Around The World", 170, "United Kingdom", "Colchester", "uk_hardcore_anchor"),
  t("uk_hardcore", "Hixxy", "More and More", "Raver Baby", 170, "United Kingdom", "Portsmouth", "uk_hardcore_rave"),
  t("terrorcore", "Drokz", "I Accept The Word Hardcore", "Drokz", 220, "Netherlands", "Rotterdam", "terrorcore_anchor"),
  t("terrorcore", "Noisekick", "Reaching for the Sky", "Noisekick Records", 250, "Netherlands", "International", "terrorcore_speed"),
  t("extratone", "Diabarha", "Uranoid", "Diabarha", 1000, "Ukraine", "Kyiv", "extratone_anchor"),
  t("extratone", "Annoying Ringtone", "Extratone Pirates", "Annoying Ringtone", 600, "Australia", "International", "extratone_extreme"),
  t("makina", "Pastis & Buenri", "Pildozer", "Bit Music", 170, "Spain", "Barcelona", "makina_anchor"),
  t("makina", "Xavi Metralla", "Metramorphosis", "Bit Music", 170, "Spain", "Barcelona", "makina_catalunya"),

  t("dark_ambient", "Lustmord", "Heresy", "Soleilmoon", "", "United Kingdom", "North Wales", "dark_ambient_anchor"),
  t("dark_ambient", "Raison d'etre", "The Wasteland", "Cold Meat Industry", "", "Sweden", "Linkoping", "dark_ambient_ritual"),
  t("space_ambient", "Jonn Serrie", "And the Stars Go With You", "Miramar", "", "United States", "Atlanta", "space_ambient_anchor"),
  t("space_ambient", "Steve Roach", "Structures from Silence", "Fortuna", "", "United States", "Tucson", "space_ambient_classic"),
  t("ambient_house", "The Orb", "Little Fluffy Clouds", "Big Life", 112, "United Kingdom", "London", "ambient_house_anchor"),
  t("ambient_house", "The KLF", "What Time Is Love?", "KLF Communications", 120, "United Kingdom", "London", "ambient_house_rave"),
  t("ambient_dub", "The Orb", "Blue Room", "Big Life", 110, "United Kingdom", "London", "ambient_dub_anchor"),
  t("ambient_dub", "Sounds From The Ground", "Triangle", "Waveform", 90, "United Kingdom", "London", "ambient_dub_deep"),
  t("lowercase", "Steve Roden", "Forms of Paper", "Line", "", "United States", "Los Angeles", "lowercase_anchor"),
  t("lowercase", "Bernhard Gunter", "Un Peu de Neige Salie", "Selektion", "", "Germany", "International", "lowercase_quiet"),
  t("microsound", "Ryoji Ikeda", "data.matrix", "Raster-Noton", "", "Japan", "Paris", "microsound_anchor"),
  t("microsound", "Alva Noto", "Xerrox Monophaser", "Raster-Noton", "", "Germany", "Chemnitz", "microsound_digital"),
  t("electroacoustic", "Bernard Parmegiani", "De Natura Sonorum", "INA-GRM", "", "France", "Paris", "electroacoustic_anchor"),
  t("electroacoustic", "Eliane Radigue", "Adnos I", "Important Records", "", "France", "Paris", "electroacoustic_drone"),
  t("musique_concrete", "Pierre Schaeffer", "Etude aux chemins de fer", "INA-GRM", "", "France", "Paris", "musique_concrete_origin"),
  t("musique_concrete", "Pierre Henry", "Variations pour une porte et un soupir", "Philips", "", "France", "Paris", "musique_concrete_classic"),
  t("berlin_school", "Tangerine Dream", "Phaedra", "Virgin", "", "Germany", "Berlin", "berlin_school_anchor"),
  t("berlin_school", "Klaus Schulze", "Floating", "Brain", "", "Germany", "Berlin", "berlin_school_sequencer"),
  t("kosmische_musik", "Cluster", "Hollywood", "Brain", "", "Germany", "Forst", "kosmische_anchor"),
  t("kosmische_musik", "Harmonia", "Deluxe (Immer Wieder)", "Brain", "", "Germany", "Forst", "kosmische_band"),

  t("italo_disco", "Klein & M.B.O.", "Dirty Talk", "Zanza Records", 120, "Italy", "Milan", "italo_disco_anchor"),
  t("italo_disco", "Kano", "Another Life", "Full Time Records", 120, "Italy", "Milan", "italo_disco_synth"),
  t("hi_nrg", "Patrick Cowley", "Menergy", "Megatone", 130, "United States", "San Francisco", "hi_nrg_anchor"),
  t("hi_nrg", "Sylvester", "Do You Wanna Funk", "Megatone", 132, "United States", "San Francisco", "hi_nrg_vocal"),
  t("eurodance", "2 Unlimited", "No Limit", "Byte Records", 141, "Belgium", "Antwerp", "eurodance_anchor"),
  t("eurodance", "Snap!", "Rhythm Is a Dancer", "Logic Records", 124, "Germany", "Frankfurt", "eurodance_classic"),
  t("retrowave", "Kavinsky", "Nightcall", "Record Makers", 91, "France", "Paris", "retrowave_anchor"),
  t("retrowave", "College", "A Real Hero", "Valerie", 90, "France", "Nantes", "retrowave_cinematic"),
  t("outrun", "Mitch Murder", "After Hours", "Mad Decent", 100, "Sweden", "Stockholm", "outrun_anchor"),
  t("outrun", "Miami Nights 1984", "Ocean Drive", "Rosso Corsa", 100, "Canada", "Victoria", "outrun_drive"),
  t("darksynth", "Perturbator", "Future Club", "Blood Music", 110, "France", "Paris", "darksynth_anchor"),
  t("darksynth", "Carpenter Brut", "Turbo Killer", "No Quarter", 125, "France", "Poitiers", "darksynth_heavy"),
  t("minimal_wave", "Deux", "Game and Performance", "Minimal Wave", 110, "France", "Lyon", "minimal_wave_anchor"),
  t("minimal_wave", "Linear Movement", "Way Out of Living", "Minimal Wave", 105, "Belgium", "Antwerp", "minimal_wave_synth"),
  t("futurepop", "VNV Nation", "Chrome", "Anachron Sounds", 130, "Ireland", "Hamburg", "futurepop_anchor"),
  t("futurepop", "Apoptygma Berzerk", "Until the End of the World", "Tatra", 130, "Norway", "Sarpsborg", "futurepop_synthpop"),
  t("industrial_dance", "Front 242", "Headhunter", "Wax Trax!", 125, "Belgium", "Brussels", "industrial_dance_anchor"),
  t("industrial_dance", "Nitzer Ebb", "Join in the Chant", "Mute", 128, "United Kingdom", "Chelmsford", "industrial_dance_ebm"),

  t("jersey_club", "DJ Sliink", "Vibrate", "Jersey Club", 135, "United States", "Newark", "jersey_club_anchor"),
  t("jersey_club", "UNIIQU3", "Microdosing", "Local Action", 135, "United States", "Newark", "jersey_club_modern"),
  t("baltimore_club", "Rod Lee", "Dance My Pain Away", "Club Kingz", 130, "United States", "Baltimore", "baltimore_club_anchor"),
  t("baltimore_club", "KW Griff", "Bring in the Katz", "Club Kingz", 130, "United States", "Baltimore", "baltimore_club_classic"),
  t("ballroom_vogue_beats", "Masters At Work", "The Ha Dance", "Cutting Records", 124, "United States", "New York", "ballroom_ha_anchor"),
  t("ballroom_vogue_beats", "MikeQ", "The Ha Dub Rewerk'd", "Qween Beat", 124, "United States", "New Jersey", "ballroom_modern"),
  t("kuduro_eletronico", "Buraka Som Sistema", "Kalemba (Wegue Wegue)", "Enchufada", 135, "Portugal", "Lisbon", "kuduro_electronic_anchor"),
  t("kuduro_eletronico", "DJ Znobia", "Puxa", "Enchufada", 140, "Angola", "Luanda", "kuduro_luanda"),
  t("batida", "DJ Marfox", "Eu Sei Quem Sou", "Principe", 135, "Portugal", "Lisbon", "batida_anchor"),
  t("batida", "DJ Nigga Fox", "Lento Violento", "Principe", 135, "Portugal", "Lisbon", "batida_lisbon"),
  t("singeli", "Sisso", "Biti No. 1", "Nyege Nyege Tapes", 200, "Tanzania", "Dar es Salaam", "singeli_anchor"),
  t("singeli", "Jay Mitta", "Tatizo Pesa", "Nyege Nyege Tapes", 200, "Tanzania", "Dar es Salaam", "singeli_dar"),
  t("shangaan_electro", "Nozinja", "Tsekeleke", "Warp", 180, "South Africa", "Limpopo", "shangaan_electro_anchor"),
  t("shangaan_electro", "Tshetsha Boys", "Nwa Gezani My Love", "Honest Jon's", 180, "South Africa", "Limpopo", "shangaan_electro_dance"),
  t("ghetto_house", "DJ Deeon", "Let Me Bang", "Dance Mania", 140, "United States", "Chicago", "ghetto_house_anchor"),
  t("ghetto_house", "DJ Funk", "Run", "Dance Mania", 140, "United States", "Chicago", "ghetto_house_dance_mania"),
  t("ghettotech", "DJ Assault", "Ass-N-Titties", "Electrofunk", 150, "United States", "Detroit", "ghettotech_anchor"),
  t("ghettotech", "DJ Godfather", "Player Haters in This House", "Databass", 150, "United States", "Detroit", "ghettotech_detroit"),
  t("deconstructed_club", "Lotic", "Heterocetera", "Tri Angle", 110, "United States", "Berlin", "deconstructed_club_anchor"),
  t("deconstructed_club", "Rabit", "Snow Leopard", "Tri Angle", 130, "United States", "Houston", "deconstructed_club_weight"),
  t("big_room_techno", "Maddix", "Heute Nacht", "Revealed Recordings", 135, "Netherlands", "Eindhoven", "big_room_techno_anchor"),
  t("big_room_techno", "HI-LO", "Kronos", "Drumcode", 134, "Netherlands", "Rotterdam", "big_room_techno_peak"),
  t("mainstage_techno", "Space 92", "The Door", "Filth on Acid", 135, "France", "Toulouse", "mainstage_techno_anchor"),
  t("mainstage_techno", "Eli Brown", "Be The One", "Arcane", 134, "United Kingdom", "Bristol", "mainstage_techno_crossover")
];

const ARTIST_DEPTH_FALLBACK_TRACKS = [
  t("french_house", "Stardust", "Music Sounds Better With You - Radio Edit", "Roule", 124, "France", "Paris", "artist_depth_fallback"),
  t("french_house", "Stardust", "Music Sounds Better With You - Bibi & Dim's Anthem From Paris", "Roule", 124, "France", "Paris", "artist_depth_fallback"),
  t("french_house", "Stardust", "Music Sounds Better With You - DJ Sneak Remix", "Roule", 124, "France", "Paris", "artist_depth_fallback"),
  t("florida_breaks", "Baby Anne", "Bass Queen", "Zone Records", 130, "United States", "Orlando", "artist_depth_fallback"),
  t("florida_breaks", "Baby Anne", "Turn It Up", "Zone Records", 130, "United States", "Orlando", "artist_depth_fallback"),
  t("florida_breaks", "Baby Anne", "Mixtress", "Zone Records", 130, "United States", "Orlando", "artist_depth_fallback"),
  t("extratone", "Diabarha", "The Last Farewell", "Diabarha", 1000, "Ukraine", "Kyiv", "artist_depth_fallback"),
  t("extratone", "Diabarha", "Murder", "Diabarha", 800, "Ukraine", "Kyiv", "artist_depth_fallback"),
  t("extratone", "Diabarha", "Genocide", "Diabarha", 800, "Ukraine", "Kyiv", "artist_depth_fallback"),
  t("extratone", "Annoying Ringtone", "This Is What You Call Speedcore", "Annoying Ringtone", 600, "Australia", "International", "artist_depth_fallback"),
  t("extratone", "Annoying Ringtone", "Extratone in a Perfect World", "Annoying Ringtone", 600, "Australia", "International", "artist_depth_fallback"),
  t("extratone", "Annoying Ringtone", "The Happiest Ringtone", "Annoying Ringtone", 600, "Australia", "International", "artist_depth_fallback"),
  t("lowercase", "Steve Roden", "Bell Is a Cup", "Line", "", "United States", "Los Angeles", "artist_depth_fallback"),
  t("lowercase", "Steve Roden", "Airria (Hanging Garden)", "Line", "", "United States", "Los Angeles", "artist_depth_fallback"),
  t("lowercase", "Steve Roden", "Stars of Ice", "Line", "", "United States", "Los Angeles", "artist_depth_fallback"),
  t("lowercase", "Bernhard Gunter", "Details Agrandis", "Selektion", "", "Germany", "International", "artist_depth_fallback"),
  t("lowercase", "Bernhard Gunter", "Brown, Blue, Brown on Blue", "Selektion", "", "Germany", "International", "artist_depth_fallback"),
  t("lowercase", "Bernhard Gunter", "Time, Dreaming Itself", "Selektion", "", "Germany", "International", "artist_depth_fallback"),
  t("electroacoustic", "Eliane Radigue", "Trilogie de la Mort", "Important Records", "", "France", "Paris", "artist_depth_fallback"),
  t("electroacoustic", "Eliane Radigue", "Koume", "Important Records", "", "France", "Paris", "artist_depth_fallback"),
  t("electroacoustic", "Eliane Radigue", "Jetsun Mila", "Lovely Music", "", "France", "Paris", "artist_depth_fallback"),
  t("musique_concrete", "Pierre Schaeffer", "Etude aux objets", "INA-GRM", "", "France", "Paris", "artist_depth_fallback"),
  t("musique_concrete", "Pierre Schaeffer", "Etude violette", "INA-GRM", "", "France", "Paris", "artist_depth_fallback"),
  t("musique_concrete", "Pierre Schaeffer", "Etude noire", "INA-GRM", "", "France", "Paris", "artist_depth_fallback"),
  t("italo_disco", "Klein & M.B.O.", "The MBO Theme", "Zanza Records", 120, "Italy", "Milan", "artist_depth_fallback"),
  t("italo_disco", "Klein & M.B.O.", "Wonderful", "Zanza Records", 120, "Italy", "Milan", "artist_depth_fallback"),
  t("italo_disco", "Klein & M.B.O.", "Dirty Talk - European Connection", "Zanza Records", 120, "Italy", "Milan", "artist_depth_fallback"),
  t("baltimore_club", "KW Griff", "Tony Says Go", "Club Kingz", 130, "United States", "Baltimore", "artist_depth_fallback"),
  t("baltimore_club", "KW Griff", "Real Street Shit", "Club Kingz", 130, "United States", "Baltimore", "artist_depth_fallback"),
  t("baltimore_club", "KW Griff", "Bring in the Katz - Remix", "Club Kingz", 130, "United States", "Baltimore", "artist_depth_fallback"),
  t("shangaan_electro", "Nozinja", "Xihukwani", "Warp", 180, "South Africa", "Limpopo", "artist_depth_fallback"),
  t("shangaan_electro", "Nozinja", "Nwa Baloyi", "Warp", 180, "South Africa", "Limpopo", "artist_depth_fallback"),
  t("shangaan_electro", "Nozinja", "Tsekeleke - Nyege Nyege", "Warp", 180, "South Africa", "Limpopo", "artist_depth_fallback"),
  t("dream_trance", "BBE", "Flash", "Triangle", 137, "France", "Paris", "artist_depth_fallback"),
  t("dream_trance", "BBE", "Desire", "Triangle", 137, "France", "Paris", "artist_depth_fallback"),
  t("microhouse", "Akufen", "Skidoos", "Perlon", 126, "Canada", "Montreal", "artist_depth_fallback"),
  t("microhouse", "Akufen", "My Way", "Force Inc.", 126, "Canada", "Montreal", "artist_depth_fallback"),
  t("neurohop", "Kursa", "Ten Toes", "Slug Wife", 100, "United Kingdom", "Bristol", "artist_depth_fallback"),
  t("neurohop", "Kursa", "Losing Ground", "Slug Wife", 100, "United Kingdom", "Bristol", "artist_depth_fallback"),
  t("sambass", "Patife", "Made In Bahia", "V Recordings", 174, "Brazil", "Sao Paulo", "artist_depth_fallback"),
  t("sambass", "Patife", "Na Estrada", "V Recordings", 174, "Brazil", "Sao Paulo", "artist_depth_fallback"),
  t("shangaan_electro", "Tshetsha Boys", "Nwa Gezani", "Honest Jon's", 180, "South Africa", "Limpopo", "artist_depth_fallback"),
  t("shangaan_electro", "Tshetsha Boys", "Nwampfundla - Extended", "Honest Jon's", 180, "South Africa", "Limpopo", "artist_depth_fallback"),
  t("singeli", "Sisso", "Mateso", "Nyege Nyege Tapes", 200, "Tanzania", "Dar es Salaam", "artist_depth_fallback"),
  t("singeli", "Sisso", "Kazi Ipo Ipo", "Nyege Nyege Tapes", 200, "Tanzania", "Dar es Salaam", "artist_depth_fallback"),
  t("dark_ambient", "Raison d'etre", "Metamorphyses", "Cold Meat Industry", "", "Sweden", "Linkoping", "artist_depth_fallback"),
  t("electroacoustic", "Bernard Parmegiani", "Violostries", "INA-GRM", "", "France", "Paris", "artist_depth_fallback"),
  t("latin_house", "Mambana", "Libre - Axwell Vocal Mix", "Soulfuric Trax", 126, "Netherlands", "Amsterdam", "artist_depth_fallback"),
  t("techstep", "Ed Rush & Optical", "Watermelon", "Virus Recordings", 174, "United Kingdom", "London", "artist_depth_fallback")
];

const TRACK_INPUTS = [...TRACKS, ...ARTIST_DEPTH_FALLBACK_TRACKS];

const trackHeaders = [
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
  "source_type",
  "source_tags",
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

function t(style, artist, song, label, bpm, country, city, role) {
  return { style, artist, song, label, bpm, country, city, role };
}

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

function csvWrite(rows, headers) {
  return [
    headers.map(csvCell).join(","),
    ...rows.map((row) => headers.map((header) => csvCell(row[header] ?? "")).join(","))
  ].join("\n") + "\n";
}

function csvParse(text) {
  const rows = [];
  let row = [];
  let value = "";
  let quoted = false;

  for (let index = 0; index < text.length; index += 1) {
    const char = text[index];
    const next = text[index + 1];
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
      if (row.some((cell) => cell.trim())) rows.push(row);
      row = [];
      value = "";
      continue;
    }
    value += char;
  }

  row.push(value);
  if (row.some((cell) => cell.trim())) rows.push(row);
  const headers = rows.shift() || [];
  return rows.map((cells) => Object.fromEntries(headers.map((header, index) => [header, cells[index] || ""])));
}

function readExistingTrackRows() {
  if (!fs.existsSync(TRACK_OUT)) return [];
  return csvParse(fs.readFileSync(TRACK_OUT, "utf8"));
}

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function fetchJson(url, retries = 3) {
  for (let attempt = 0; attempt <= retries; attempt += 1) {
    try {
      const response = await fetch(url, {
        headers: { "User-Agent": "SonicSearchElectronicSubgenreExpansion/1.0" }
      });
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      return await response.json();
    } catch (error) {
      if (attempt === retries) return null;
      await sleep(500 + attempt * 900);
    }
  }
  return null;
}

function deezerSearchUrl(artist, song) {
  const url = new URL("https://api.deezer.com/search");
  url.searchParams.set("q", `artist:"${artist}" track:"${song}"`);
  url.searchParams.set("limit", "8");
  return url;
}

function deezerArtistSearchUrl(artist) {
  const url = new URL("https://api.deezer.com/search/artist");
  url.searchParams.set("q", artist);
  url.searchParams.set("limit", "8");
  return url;
}

function deezerArtistTopUrl(id) {
  return `https://api.deezer.com/artist/${encodeURIComponent(id)}/top?limit=${DEEZER_TOP_LIMIT}`;
}

function exactish(expected, candidate) {
  const expectedKey = normalize(expected);
  const candidateKey = normalize(candidate);
  if (!expectedKey || !candidateKey) return false;
  return expectedKey === candidateKey || candidateKey.includes(expectedKey) || expectedKey.includes(candidateKey);
}

function compactKey(value = "") {
  return normalize(value).replace(/\s+/g, "");
}

function strictArtistNameMatch(expected, candidate) {
  const expectedKey = normalize(expected);
  const candidateKey = normalize(candidate);
  return Boolean(expectedKey && candidateKey && (expectedKey === candidateKey || compactKey(expectedKey) === compactKey(candidateKey)));
}

function titleMatch(expected, candidate) {
  const expectedKey = normalize(expected).replace(/\b(original mix|extended mix|radio edit|remix)\b/g, "").trim();
  const candidateKey = normalize(candidate).replace(/\b(original mix|extended mix|radio edit|remix)\b/g, "").trim();
  return expectedKey && candidateKey && (candidateKey === expectedKey || candidateKey.includes(expectedKey) || expectedKey.includes(candidateKey));
}

function itemHasArtist(item, artist) {
  if (exactish(artist, item?.artist?.name || "")) return true;
  const contributors = Array.isArray(item?.contributors) ? item.contributors : [];
  return contributors.some((contributor) => exactish(artist, contributor?.name || ""));
}

async function deezerMatch(anchor) {
  const payload = await fetchJson(deezerSearchUrl(anchor.artist, anchor.song));
  const items = Array.isArray(payload?.data) ? payload.data : [];
  return items.find((item) => itemHasArtist(item, anchor.artist) && titleMatch(anchor.song, item?.title_short || item?.title || "")) || null;
}

const artistResolutionCache = new Map();
const topTracksCache = new Map();

async function resolveDeezerArtist(anchor, matchedTrack = null) {
  const key = compactKey(anchor.artist);
  if (artistResolutionCache.has(key)) return artistResolutionCache.get(key);
  if (matchedTrack?.artist?.id && strictArtistNameMatch(anchor.artist, matchedTrack?.artist?.name || "")) {
    const resolved = { id: matchedTrack.artist.id, name: matchedTrack.artist.name };
    artistResolutionCache.set(key, resolved);
    return resolved;
  }
  const payload = await fetchJson(deezerArtistSearchUrl(anchor.artist));
  const candidates = Array.isArray(payload?.data) ? payload.data : [];
  const resolved = candidates.find((candidate) => strictArtistNameMatch(anchor.artist, candidate?.name || "")) || null;
  artistResolutionCache.set(key, resolved);
  return resolved;
}

function likelyUsableTopTrack(item) {
  const title = String(item?.title_short || item?.title || "").trim();
  const preview = String(item?.preview || "").trim();
  const duration = Number(item?.duration || 0);
  if (!title || !preview.startsWith("http")) return false;
  if (duration && (duration < 45 || duration > 1200)) return false;
  const titleKey = normalize(title);
  const blockedTerms = [
    "interview",
    "commentary",
    "karaoke",
    "tribute",
    "cover version",
    "continuous mix",
    "full album",
    "podcast",
    "skit"
  ];
  return !blockedTerms.some((term) => titleKey.includes(term));
}

async function deezerTopTracks(anchor, matchedTrack = null) {
  const resolved = await resolveDeezerArtist(anchor, matchedTrack);
  if (!resolved?.id) return [];
  const cacheKey = String(resolved.id);
  if (topTracksCache.has(cacheKey)) return topTracksCache.get(cacheKey);
  const payload = await fetchJson(deezerArtistTopUrl(resolved.id));
  const rows = (Array.isArray(payload?.data) ? payload.data : []).filter(likelyUsableTopTrack);
  topTracksCache.set(cacheKey, rows);
  return rows;
}

function youtubeSearchUrl(anchor) {
  return `https://www.youtube.com/results?search_query=${encodeURIComponent(`${anchor.artist} ${anchor.song}`)}`;
}

function beatportSearchUrl(anchor) {
  return `https://www.beatport.com/search?q=${encodeURIComponent(`${anchor.artist} ${anchor.song}`)}`;
}

function discogsSearchUrl(anchor) {
  return `https://www.discogs.com/search/?q=${encodeURIComponent(`${anchor.artist} ${anchor.song}`)}&type=all`;
}

function styleLabel(style) {
  return STYLE_CONFIG[style]?.[0] || style.replace(/_/g, " ");
}

function rowFromAnchor(anchor, match, { role = anchor.role, sourceType = "curated_electronic_subgenre_anchor", status = "", confidence = "", note = "" } = {}) {
  const label = styleLabel(anchor.style);
  const song = String(match?.title_short || match?.title || anchor.song || "").trim();
  const deezerUrl = match?.link || "";
  const sourceUrl = deezerUrl || beatportSearchUrl(anchor);
  const rowStatus = status || (match?.preview ? "published" : "needs_review");
  const rowConfidence = confidence || (match?.preview ? "high" : "medium");
  return {
    style: anchor.style,
    artist: anchor.artist,
    song,
    label: String(match?.album?.title || anchor.label || "").trim(),
    bpm_exact: sourceType === "curated_electronic_subgenre_anchor" ? anchor.bpm : "",
    preview_url: String(match?.preview || "").trim(),
    release_date: String(match?.release_date || match?.album?.release_date || "").trim(),
    duration_sec: String(match?.duration || "").trim(),
    country: anchor.country,
    city: anchor.city,
    artist_bio: `${anchor.artist} anchors ${label} in the conservative electronic subgenre expansion v15.`,
    artist_genre: label,
    artist_profile_hint: `Use ${anchor.artist} - ${song} for ${label} discovery and adjacent electronic recommendations.`,
    source: BATCH,
    source_url: sourceUrl,
    track_url: deezerUrl || youtubeSearchUrl({ ...anchor, song }),
    deezer_track_id: String(match?.id || ""),
    deezer_track_url: deezerUrl,
    cover_art_url: String(match?.album?.cover_big || match?.album?.cover_medium || ""),
    youtube_track_url: youtubeSearchUrl({ ...anchor, song }),
    source_type: sourceType,
    source_tags: [anchor.style, label, role, BATCH].filter(Boolean).join(";"),
    energy_band: role,
    catalog_role: role,
    status: rowStatus,
    confidence: rowConfidence,
    source_note: note || (match?.preview
      ? "Curated v15 row with Deezer preview matched by artist/title or artist-top search."
      : "Curated v15 anchor without exact preview match; kept as reviewable discovery link.")
  };
}

async function buildTrackRows() {
  const rows = [];
  let anchorMatches = 0;
  let extraMatches = 0;
  const countsByStyleArtist = new Map();
  const seenByStyleArtist = new Map();

  const addRow = (anchor, row) => {
    const artistKey = `${anchor.style}::${compactKey(anchor.artist)}`;
    const trackKey = compactKey(row.song);
    if (!trackKey) return false;
    if (!seenByStyleArtist.has(artistKey)) seenByStyleArtist.set(artistKey, new Set());
    const seen = seenByStyleArtist.get(artistKey);
    if (seen.has(trackKey)) return false;
    seen.add(trackKey);
    countsByStyleArtist.set(artistKey, (countsByStyleArtist.get(artistKey) || 0) + 1);
    rows.push(row);
    return true;
  };

  for (const anchor of TRACK_INPUTS) {
    const match = await deezerMatch(anchor);
    if (match?.preview) anchorMatches += 1;
    const anchorNote = match?.preview
      ? "Curated v15 anchor with Deezer preview matched by artist/title search."
      : "Curated v15 anchor without exact preview match; kept as reviewable discovery link.";
    addRow(anchor, rowFromAnchor(anchor, match, { note: anchorNote }));
    const topTracks = await deezerTopTracks(anchor, match);
    for (const item of topTracks) {
      const artistKey = `${anchor.style}::${compactKey(anchor.artist)}`;
      if ((countsByStyleArtist.get(artistKey) || 0) >= TARGET_TRACKS_PER_ARTIST) break;
      const added = addRow(anchor, rowFromAnchor(
        { ...anchor, song: String(item?.title_short || item?.title || "").trim(), label: String(item?.album?.title || anchor.label || "").trim() },
        item,
        {
          role: `${anchor.role}_artist_depth`,
          sourceType: "deezer_artist_top_track_depth",
          status: "published",
          confidence: "medium_high",
          note: "Additional v15 artist-depth track from Deezer artist top results with exact artist resolution and playable preview."
        }
      ));
      if (added) extraMatches += 1;
    }
    await sleep(REQUEST_PAUSE_MS);
  }
  return { rows, anchorMatches, extraMatches };
}

function rowArtistKey(row) {
  return `${String(row.style || "").trim()}::${normalize(row.artist)}`;
}

function rowTrackKey(row) {
  return `${rowArtistKey(row)}::${normalize(row.song)}`;
}

function rowPriority(row) {
  let score = 0;
  if (String(row.preview_url || "").startsWith("http")) score += 1000;
  if (String(row.status || "") === "published") score += 80;
  if (String(row.deezer_track_id || "").trim()) score += 40;
  if (String(row.cover_art_url || "").trim()) score += 20;
  if (String(row.source_type || "").includes("deezer")) score += 10;
  if (String(row.confidence || "").includes("high")) score += 8;
  return score;
}

function mergeTrackRows(generatedRows, existingRows) {
  const byTrack = new Map();
  for (const row of [...existingRows, ...generatedRows]) {
    const key = rowTrackKey(row);
    if (!key || key.endsWith("::")) continue;
    const current = byTrack.get(key);
    if (!current || rowPriority(row) >= rowPriority(current)) {
      byTrack.set(key, row);
    }
  }

  const byArtist = new Map();
  for (const row of byTrack.values()) {
    const key = rowArtistKey(row);
    if (!byArtist.has(key)) byArtist.set(key, []);
    byArtist.get(key).push(row);
  }

  const merged = [];
  for (const rows of byArtist.values()) {
    rows.sort((a, b) => rowPriority(b) - rowPriority(a) || String(a.song || "").localeCompare(String(b.song || "")));
    merged.push(...rows.slice(0, TARGET_TRACKS_PER_ARTIST));
  }

  return merged.sort((a, b) =>
    String(a.style || "").localeCompare(String(b.style || "")) ||
    String(a.artist || "").localeCompare(String(b.artist || "")) ||
    String(a.song || "").localeCompare(String(b.song || ""))
  );
}

function buildProfileRows(trackRows) {
  const byArtist = new Map();
  for (const row of trackRows) {
    const key = `${row.style}::${normalize(row.artist)}`;
    if (!byArtist.has(key)) {
      byArtist.set(key, {
        style: row.style,
        artist: row.artist,
        country: row.country,
        city: row.city,
        artist_bio: `${row.artist} is included as a ${styleLabel(row.style)} reference artist in ${BATCH}.`,
        artist_genre: styleLabel(row.style),
        artist_profile_hint: `Recommend ${row.artist} when the user asks for ${styleLabel(row.style)} or adjacent electronic club music.`,
        scene_role: row.catalog_role,
        source_anchor: row.label,
        source_anchor_url: row.source_url,
        primary_social_url: `https://www.google.com/search?q=${encodeURIComponent(`${row.artist} official`)}`,
        social_discovery_links: [
          `https://open.spotify.com/search/${encodeURIComponent(row.artist)}`,
          `https://soundcloud.com/search?q=${encodeURIComponent(row.artist)}`,
          `https://www.youtube.com/results?search_query=${encodeURIComponent(`${row.artist} official`)}`
        ].join(";"),
        label_links: [beatportSearchUrl(row), discogsSearchUrl(row)].join(";"),
        cover_art_url: row.cover_art_url,
        profile_tracks: "",
        status: row.status,
        confidence: row.confidence,
        source_note: `Artist profile generated from ${BATCH}.`
      });
    }
    const current = byArtist.get(key);
    const trackList = current.profile_tracks ? current.profile_tracks.split("; ") : [];
    trackList.push(`${row.song}${row.bpm_exact ? ` (${row.bpm_exact})` : ""}`);
    current.profile_tracks = trackList.join("; ");
    if (current.status !== "published" && row.status === "published") current.status = "published";
    if (current.confidence !== "high" && row.confidence === "high") current.confidence = "high";
    if (!current.cover_art_url && row.cover_art_url) current.cover_art_url = row.cover_art_url;
  }
  return [...byArtist.values()].sort((a, b) => `${a.style} ${a.artist}`.localeCompare(`${b.style} ${b.artist}`));
}

async function main() {
  fs.mkdirSync(DATA_DIR, { recursive: true });
  fs.mkdirSync(REPORT_DIR, { recursive: true });
  const existingRows = readExistingTrackRows();
  const { rows: generatedRows, anchorMatches, extraMatches } = await buildTrackRows();
  const trackRows = mergeTrackRows(generatedRows, existingRows);
  const profileRows = buildProfileRows(trackRows);

  fs.writeFileSync(TRACK_OUT, csvWrite(trackRows, trackHeaders), "utf8");
  fs.writeFileSync(PROFILE_OUT, csvWrite(profileRows, profileHeaders), "utf8");

  const byStyle = trackRows.reduce((acc, row) => {
    acc[row.style] = acc[row.style] || { tracks: 0, artists: new Set(), playable: 0 };
    acc[row.style].tracks += 1;
    acc[row.style].artists.add(row.artist);
    if (row.preview_url) acc[row.style].playable += 1;
    return acc;
  }, {});
  const styleLines = Object.entries(byStyle)
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([style, stats]) => `- ${style}: ${stats.tracks} tracks, ${stats.artists.size} artists, ${stats.playable} playable previews`)
    .join("\n");

  fs.writeFileSync(REPORT_OUT, [
    `# ${BATCH}`,
    "",
    `Generated ${trackRows.length} merged track rows and ${profileRows.length} artist profiles across ${Object.keys(byStyle).length} new electronic subgenres.`,
    "",
    `Artist depth target: ${TARGET_TRACKS_PER_ARTIST} tracks per style/artist when Deezer has enough usable playable top tracks.`,
    "",
    `Existing rows preserved before generation: ${existingRows.length}. Fresh generated rows: ${generatedRows.length}. Curated anchor preview matches: ${anchorMatches}/${TRACK_INPUTS.length}. Extra artist-depth preview tracks: ${extraMatches}. Rows without previews remain as needs_review discovery anchors.`,
    "",
    styleLines,
    ""
  ].join("\n"), "utf8");

  console.log(`Generated ${path.relative(ROOT, TRACK_OUT)}`);
  console.log(`Generated ${path.relative(ROOT, PROFILE_OUT)}`);
  console.log(`${trackRows.length} merged tracks, ${profileRows.length} artists, ${Object.keys(byStyle).length} styles, ${existingRows.length} existing rows preserved, ${generatedRows.length} fresh rows, ${anchorMatches} anchor preview matches, ${extraMatches} extra preview tracks.`);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
