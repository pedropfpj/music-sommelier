import fs from "node:fs";
import path from "node:path";

const ROOT = process.cwd();
const BATCH_DATE = "2026-06-21";
const TRACK_BATCH = "techno_enrichment_v4_20260621";
const ARTIST_BATCH = "artist_expansion_v12_techno_subgenres";
const DATA_DIR = path.join(ROOT, "data");
const SEED_DIR = path.join(ROOT, "supabase", "seeds");
const REPORT_DIR = path.join(ROOT, "reports");
const TRACK_OUT = path.join(DATA_DIR, `${TRACK_BATCH}.csv`);
const PROFILE_OUT = path.join(DATA_DIR, "techno_artist_profiles_v4_20260621.csv");
const ARTIST_OUT = path.join(DATA_DIR, "artist_expansion_seeds_v12.csv");
const SQL_OUT = path.join(SEED_DIR, `${TRACK_BATCH}.sql`);
const ARTIST_SQL_OUT = path.join(SEED_DIR, "techno_artist_expansion_v12_20260621.sql");
const REPORT_OUT = path.join(REPORT_DIR, "techno_enrichment_v4_2026-06-21.md");

const STYLE_INFO = {
  techno: {
    label: "techno",
    country: "International",
    sourceAnchor: "classic and contemporary techno catalog research",
    sceneNote: "functional club techno, machine pressure and label-led underground context"
  },
  acid_techno: {
    label: "acid techno",
    country: "International",
    sourceAnchor: "303 acid techno and Stay Up Forever lineage",
    sceneNote: "acid techno, 303 pressure, warehouse drive and free-party roots"
  },
  tech_house: {
    label: "tech house",
    country: "International",
    sourceAnchor: "modern club tech house and minimal groove catalog research",
    sceneNote: "house swing with dry techno percussion, bassline hooks and club utility"
  },
  deep_techno: {
    label: "deep techno",
    country: "International",
    sourceAnchor: "Hypnus, Prologue, Semantica and deep techno lineage",
    sceneNote: "deep, atmospheric and mental techno with patient movement"
  },
  ambient_techno: {
    label: "ambient techno",
    country: "International",
    sourceAnchor: "Warp, Apollo and ambient techno lineage",
    sceneNote: "ambient techno, IDM-adjacent listening techno and soft machine pulse"
  },
  bleep_techno: {
    label: "bleep techno",
    country: "United Kingdom",
    sourceAnchor: "Sheffield bleep, Warp and UK bass-techno roots",
    sceneNote: "bleeps, sub bass, rave minimalism and early UK techno pressure"
  },
  tribal_techno: {
    label: "tribal techno",
    country: "International",
    sourceAnchor: "percussive techno and Intec-era tribal tools",
    sceneNote: "percussive, loop-driven and body-forward techno tools"
  },
  hardgroove_techno: {
    label: "hardgroove techno",
    country: "International",
    sourceAnchor: "hardgroove, funky techno and loop techno catalog research",
    sceneNote: "fast groove techno with funk, swing and rolling percussion"
  },
  broken_techno: {
    label: "broken techno",
    country: "United Kingdom",
    sourceAnchor: "UK broken techno, Hessle, Timedance and Livity-adjacent research",
    sceneNote: "syncopated techno, UK bass pressure and broken club rhythm"
  },
  dub_techno: {
    label: "dub techno",
    country: "International",
    sourceAnchor: "Basic Channel, Chain Reaction and Echocord lineage",
    sceneNote: "dub delays, reduced pulse, haze and deep low-end movement"
  },
  hypnotic_techno: {
    label: "hypnotic techno",
    country: "International",
    sourceAnchor: "hypnotic, mental and long-form techno research",
    sceneNote: "circular, mental and textural techno for long-form progression"
  },
  raw_techno: {
    label: "raw techno",
    country: "International",
    sourceAnchor: "raw warehouse techno and post-2010 underground research",
    sceneNote: "raw drums, pressure, distortion and warehouse-forward sound"
  },
  detroit_techno: {
    label: "detroit techno",
    country: "United States",
    sourceAnchor: "Detroit techno and electro-techno lineage",
    sceneNote: "Detroit futurism, machine soul, electro roots and hi-tech funk"
  },
  industrial_techno: {
    label: "industrial techno",
    country: "International",
    sourceAnchor: "industrial techno and body-machine catalog research",
    sceneNote: "metallic pressure, noise-informed techno and severe club function"
  },
  peak_time_techno: {
    label: "peak-time techno",
    country: "International",
    sourceAnchor: "modern peak-time techno and Drumcode-adjacent research",
    sceneNote: "direct, high-impact techno for large-room peak moments"
  },
  schranz: {
    label: "schranz",
    country: "International",
    sourceAnchor: "schranz and hard techno lineage",
    sceneNote: "fast, dense, hard techno with relentless percussion"
  },
  ebm: {
    label: "EBM",
    country: "International",
    sourceAnchor: "EBM and industrial body music catalog research",
    sceneNote: "body music, electro-industrial rhythm and techno-compatible machine funk"
  },
  minimal_techno: {
    label: "minimal techno",
    country: "International",
    sourceAnchor: "minimal techno, microhouse and reduced club research",
    sceneNote: "reduced rhythm, negative space and precise groove design"
  }
};

const STYLE_ARTISTS = {
  techno: [
    "Planetary Assault Systems", "Luke Slater", "Function", "James Ruskin", "DVS1",
    "Rodhad", "Freddy K", "Setaoc Mass", "Stef Mendesidis", "Quelza",
    "Altinbas", "Phil Berg", "Marron", "Alarico", "Beste Hira",
    "D.Dan", "Yanamaste", "Temudo", "TWR72", "JakoJako", "Holden Federico"
  ],
  acid_techno: [
    "Chris Liberator", "D.A.V.E. The Drummer", "Lawrie Immersion", "Ant",
    "Rozzer's Dog", "Pounding Grooves", "Miss Djax", "Woody McBride",
    "DJ Misjah", "DJ Tim", "A&E Dept.", "Secret Hero", "Mobile Dogwash",
    "Benji303", "Geezer", "DDR"
  ],
  tech_house: [
    "Bontan", "Max Chapman", "wAFF", "Richy Ahmed", "Lee Foss", "Sosa UK",
    "Ben Sterling", "Wheats", "Iglesias", "AJ Christou", "Fleur Shore",
    "Beltran", "Classmatic", "Viot", "Cour T.", "Manda Moor", "Mene",
    "Ranger Trucco", "Endor", "Martin Ikin", "Hannah Wants", "Josh Butler",
    "Latmun"
  ],
  deep_techno: [
    "Neel", "Natural/Electronic.System.", "Refracted", "Feral", "Svreca",
    "Cio D'Or", "Dorisburg", "Acronym", "Abdulla Rashim", "Varg",
    "Shifted", "Mike Parker", "Edit Select", "Architectural", "Takaaki Itoh",
    "Iori", "Anthony Linell", "Birds ov Paradise", "Primal Code", "Dycide",
    "Hydrangea", "Svarog", "Ntogn"
  ],
  ambient_techno: [
    "Autechre", "Aphex Twin", "Orbital", "The Future Sound of London",
    "Speedy J", "Ultramarine", "Kirk Degiorgio", "As One", "Stasis",
    "Future/Past", "The Irresistible Force", "Move D", "Pete Namlook",
    "System 7", "Seefeel", "Plaid", "Black Dog Productions"
  ],
  bleep_techno: [
    "Ability II", "Tuff Little Unit", "Ital Rockers", "Rhythmatic", "Nexus 21",
    "Cubic 22", "The Step", "Man Machine", "Lords of Afford"
  ],
  tribal_techno: [
    "Renato Cohen", "Christian Smith", "John Selway", "Bryan Zentz", "Deetron",
    "Umek", "Oliver Ho", "Rue East", "Gaetano Parisio", "Rino Cerrone",
    "Lars Klein", "Redhead", "Preach", "Valentino Kanzyani", "Tom Hades"
  ],
  hardgroove_techno: [
    "DJ Rush", "Mark Williams", "Robert Armani", "Deetron", "Bryan Zentz",
    "Paul Mac", "Glenn Wilson", "Oliver Ho", "Gaetano Parisio", "Rino Cerrone",
    "Valentino Kanzyani", "Lars Klein", "DJ Boss", "Stanny Franssen",
    "Ignition Technician", "Cari Lekebusch", "Dejan Milicevic", "Chlar",
    "Alarico", "Beau Didier"
  ],
  broken_techno: [
    "Karenn", "Pearson Sound", "Tessela", "Untold", "Hodge", "Kowton",
    "Ploy", "Lurka", "Mosca", "Happa", "Peverelist", "Pariah",
    "Joe", "Sully", "Pessimist", "Facta", "K-Lone", "Yak"
  ],
  dub_techno: [
    "Rhythm & Sound", "Deadbeat", "Monolake", "Porter Ricks", "Pole",
    "Vladislav Delay", "bvdub", "cv313", "Intrusion", "STL"
  ],
  hypnotic_techno: [
    "Peter Van Hoesen", "Mike Parker", "Shifted", "Acronym", "Svreca",
    "Dasha Rush", "Anthony Linell", "Iori", "Takaaki Itoh", "Edit Select"
  ],
  raw_techno: [
    "Perc", "UVB", "AnD", "Truss", "Karenn", "Ansome", "Tommy Four Seven",
    "Headless Horseman", "Scalameriya", "Ontal", "Sunil Sharpe", "Myler"
  ],
  detroit_techno: [
    "Drexciya", "DJ Rolando", "Kenny Larkin", "Stacey Pullen", "Terrence Dixon",
    "Mike Huckaby", "Scan 7", "Los Hermanos", "Suburban Knight", "Ectomorph",
    "Eddie Fowlkes", "Blake Baxter"
  ],
  industrial_techno: [
    "Ancient Methods", "British Murder Boys", "Orphx", "SNTS", "Ansome",
    "Headless Horseman", "Tommy Four Seven", "Vatican Shadow", "Codex Empire",
    "JK Flesh", "Schwefelgelb", "Phase Fatale"
  ],
  peak_time_techno: [
    "Space 92", "Layton Giordani", "Mha Iri", "HI-LO", "Bart Skils",
    "UMEK", "Wehbba", "Sam Paganini", "Victor Ruiz", "Jay Lumen",
    "Tiger Stripes", "Veerus"
  ],
  schranz: [
    "Chris Liebing", "Sven Wittekind", "Frank Kvitta", "Robert Natus",
    "Felix Krocher", "Pet Duo", "O.B.I.", "Arkus P.", "Viper XXL",
    "Waldhaus", "DJ Amok", "Boris S."
  ],
  ebm: [
    "Front Line Assembly", "The Klinik", "Fixmer/McCarthy", "Schwefelgelb",
    "The Hacker", "Phase Fatale", "Silent Servant", "Sierra", "Qual",
    "Youth Code"
  ],
  minimal_techno: [
    "Zip", "Baby Ford", "Margaret Dygas", "Sutekh", "Fumiya Tanaka",
    "Rhadoo", "Barac", "Ion Ludwig", "Cabanne", "Dimbiman", "Jan Jelinek",
    "Akufen"
  ]
};

const TRACKS = [
  track("techno", "Planetary Assault Systems", "Rip The Cut", "Mote-Evolver", 132, "United Kingdom", "Techno / UK Techno", "uk_machine_drive"),
  track("techno", "Surgeon", "La Real", "Downwards", 132, "United Kingdom", "Techno / Birmingham Techno", "birmingham_pressure"),
  track("techno", "Regis", "Speak To Me", "Downwards", 132, "United Kingdom", "Techno / Birmingham Techno", "downwards_anchor"),
  track("techno", "James Ruskin", "Detached", "Blueprint", 132, "United Kingdom", "Techno / UK Techno", "blueprint_minimal_pressure"),
  track("techno", "DVS1", "Black Russian", "Klockworks", 130, "United States", "Techno / Warehouse Techno", "warehouse_functional_anchor"),
  track("techno", "Function", "Disaffected", "Sandwell District", 130, "United States", "Techno / Minimal Techno", "sandwell_district_anchor"),
  track("techno", "Rodhad", "Kinder der Ringwelt", "Dystopian", 130, "Germany", "Techno / Berlin Techno", "berlin_deep_peak"),

  track("acid_techno", "Thomas P. Heckmann", "Amphetamine", "Trope Recordings", 135, "Germany", "Acid Techno / Acid Trance", "european_acid_classic"),
  track("acid_techno", "DJ Misjah & DJ Tim", "Access", "X-Trax", 135, "Netherlands", "Acid Techno / Rave Techno", "acid_rave_crossover"),
  track("acid_techno", "Chris Liberator & Sterling Moss", "Scum Like Us", "Stay Up Forever", 140, "United Kingdom", "Acid Techno / London Acid Techno", "suf_free_party_anchor"),
  track("acid_techno", "D.A.V.E. The Drummer", "Hydraulix 09", "Hydraulix", 140, "United Kingdom", "Acid Techno / Hard Acid", "hydraulix_anchor"),
  track("acid_techno", "Miss Djax", "Acid Entrance", "Djax-Up-Beats", 136, "Netherlands", "Acid Techno / Rave Techno", "djax_acid_anchor"),
  track("acid_techno", "Woody McBride", "Basketball Heroes", "Communique Records", 130, "United States", "Acid Techno / Midwest Acid", "midwest_acid_depth"),

  track("tech_house", "Bontan", "The First Time", "Circus Recordings", 126, "United Kingdom", "Tech House / Club House", "modern_uk_tech_house"),
  track("tech_house", "Max Chapman", "La Fiesta", "Hot Creations", 126, "United Kingdom", "Tech House / Latin Tech House", "hot_creations_groove"),
  track("tech_house", "wAFF", "Jo Johnson", "Hot Creations", 126, "United Kingdom", "Tech House / Minimal Tech House", "rolling_hot_creations"),
  track("tech_house", "Richy Ahmed", "The Drums", "Hot Creations", 126, "United Kingdom", "Tech House / Club House", "uk_ibiza_bridge"),
  track("tech_house", "Steve Lawler", "House Record", "Hot Creations", 124, "United Kingdom", "Tech House / House", "viva_hot_creations_bridge"),
  track("tech_house", "Nic Fanciulli", "Movin' On", "Saved Records", 126, "United Kingdom", "Tech House / Club House", "saved_records_anchor"),
  track("tech_house", "Sosa UK", "DFCW", "Cuttin' Headz", 128, "United Kingdom", "Tech House / Minimal Tech House", "new_school_uk_groove"),
  track("tech_house", "Beltran", "Smack Yo'", "Solid Grooves Raw", 128, "Brazil", "Tech House / Brazilian Tech House", "brazilian_tech_house_depth"),

  track("deep_techno", "Neel", "Satori", "Spazio Disponibile", 128, "Italy", "Deep Techno / Hypnotic Techno", "italian_deep_hypnosis"),
  track("deep_techno", "Natural/Electronic.System.", "Cuore", "Tikita", 126, "Italy", "Deep Techno / Atmospheric Techno", "italian_deep_system"),
  track("deep_techno", "Refracted", "Expedition 1", "PoleGroup", 130, "Germany", "Deep Techno / Mental Techno", "deep_polegroup_bridge"),
  track("deep_techno", "Feral", "Courtship", "Hypnus Records", 128, "Sweden", "Deep Techno / Organic Techno", "hypnus_organic_depth"),
  track("deep_techno", "Cio D'Or", "Ur", "Semantica", 126, "Germany", "Deep Techno / Minimal Techno", "semantica_deep_anchor"),
  track("deep_techno", "Mike Parker", "Reduction", "Prologue", 128, "United States", "Deep Techno / Hypnotic Techno", "geophone_hypnotic_bridge"),

  track("ambient_techno", "Autechre", "Bike", "Warp Records", 100, "United Kingdom", "Ambient Techno / IDM", "warp_idm_anchor"),
  track("ambient_techno", "Aphex Twin", "Xtal", "Apollo", 114, "United Kingdom", "Ambient Techno / IDM", "apollo_ambient_anchor"),
  track("ambient_techno", "Orbital", "Belfast", "FFRR", 120, "United Kingdom", "Ambient Techno / Rave Ambient", "uk_rave_ambient_anchor"),
  track("ambient_techno", "The Future Sound of London", "Papua New Guinea", "Jumpin' & Pumpin'", 102, "United Kingdom", "Ambient Techno / Ambient House", "uk_ambient_crossover"),
  track("ambient_techno", "Speedy J", "De-Orbit", "Plus 8", 126, "Netherlands", "Ambient Techno / Detroit Techno", "plus8_ambient_techno"),
  track("ambient_techno", "Ultramarine", "Stella", "Brainiak", 112, "United Kingdom", "Ambient Techno / Ambient House", "uk_pastoral_techno"),

  track("bleep_techno", "Ability II", "Pressure Dub", "Outer Rhythm", 122, "United Kingdom", "Bleep Techno / Dub Techno", "bleep_dub_anchor"),
  track("bleep_techno", "Ital Rockers", "Ital's Anthem", "Bassic", 124, "United Kingdom", "Bleep Techno / UK Bass", "uk_bass_bleep_depth"),
  track("bleep_techno", "808 State", "Cubik", "ZTT", 122, "United Kingdom", "Bleep Techno / Rave Techno", "rave_bleep_crossover"),
  track("bleep_techno", "Nexus 21", "Self Hypnosis", "Network", 124, "United Kingdom", "Bleep Techno / UK Techno", "network_bleep_anchor"),
  track("bleep_techno", "Rhythmatic", "Take Me Back", "Network", 124, "United Kingdom", "Bleep Techno / UK Rave", "uk_rave_bleep_depth"),

  track("tribal_techno", "Renato Cohen", "Pontape", "Sino", 136, "Brazil", "Tribal Techno / Brazilian Techno", "brazilian_percussive_anchor"),
  track("tribal_techno", "Christian Smith & John Selway", "Move!", "Intec", 136, "United States", "Tribal Techno / Driving Techno", "intec_tribal_drive"),
  track("tribal_techno", "Samuel L Session", "Merengue", "Cycle", 136, "Sweden", "Tribal Techno / Loop Techno", "swedish_percussive_bridge"),
  track("tribal_techno", "Deetron", "Velocity", "Music Man", 136, "Switzerland", "Tribal Techno / Funky Techno", "percussive_drive_depth"),
  track("tribal_techno", "Bryan Zentz", "D-Clash", "Intec", 136, "United States", "Tribal Techno / US Techno", "us_tribal_tool"),

  track("hardgroove_techno", "DJ Rush", "Motherfucking Bass", "Kne'Deep", 138, "United States", "Hardgroove Techno / Chicago Techno", "chicago_hardgroove_anchor"),
  track("hardgroove_techno", "Mark Williams", "Carnival", "Ingoma", 136, "United Kingdom", "Hardgroove Techno / Tribal Techno", "ingoma_groove_depth"),
  track("hardgroove_techno", "Robert Armani", "Circus Bells", "Djax-Up-Beats", 136, "United States", "Hardgroove Techno / Rave Techno", "classic_loop_pressure"),
  track("hardgroove_techno", "Deetron", "Velocity", "Music Man", 136, "Switzerland", "Hardgroove Techno / Funky Techno", "funky_swiss_tool"),
  track("hardgroove_techno", "Bryan Zentz", "D-Clash", "Intec", 136, "United States", "Hardgroove Techno / Tribal Techno", "us_hardgroove_tool"),
  track("hardgroove_techno", "Paul Mac", "Cards On The Table", "C-Side", 136, "United Kingdom", "Hardgroove Techno / UK Techno", "uk_loop_depth"),

  track("broken_techno", "Karenn", "On Request", "Works The Long Nights", 130, "United Kingdom", "Broken Techno / Raw Techno", "karenn_broken_anchor"),
  track("broken_techno", "Pearson Sound", "XLB", "Pearson Sound", 130, "United Kingdom", "Broken Techno / UK Bass", "uk_bass_syncopation"),
  track("broken_techno", "Tessela", "Hackney Parrot", "Poly Kicks", 130, "United Kingdom", "Broken Techno / Breakbeat Techno", "breakbeat_techno_anchor"),
  track("broken_techno", "Untold", "Motion The Dance", "Hemlock", 130, "United Kingdom", "Broken Techno / UK Techno", "hemlock_broken_depth"),
  track("broken_techno", "Hodge", "Amor Fati", "Berceuse Heroique", 130, "United Kingdom", "Broken Techno / Bristol Techno", "bristol_broken_anchor"),
  track("broken_techno", "Kowton", "Glock & Roll", "Livity Sound", 130, "United Kingdom", "Broken Techno / Bristol Techno", "livity_broken_depth"),

  track("dub_techno", "Rhythm & Sound", "Mango Drive", "Rhythm & Sound", 127, "Germany", "Dub Techno / Dub", "rhythm_sound_anchor"),
  track("dub_techno", "Deepchord", "Vantage Isle", "Soma", 126, "United States", "Dub Techno / Deep Techno", "deepchord_anchor"),
  track("dub_techno", "Echospace", "Spatialdimension", "Modern Love", 126, "United States", "Dub Techno / Ambient Techno", "echospace_haze"),
  track("dub_techno", "Quantec", "Ray Of Hope", "Echocord", 126, "Germany", "Dub Techno / Deep Techno", "echocord_depth"),
  track("dub_techno", "Deadbeat", "Roots And Wire", "Wagon Repair", 125, "Canada", "Dub Techno / Minimal Techno", "canadian_dub_depth"),

  track("hypnotic_techno", "Peter Van Hoesen", "Attribute One", "Time To Express", 128, "Belgium", "Hypnotic Techno / Techno", "time_to_express_anchor"),
  track("hypnotic_techno", "Mike Parker", "Lustrations", "Geophone", 128, "United States", "Hypnotic Techno / Deep Techno", "geophone_hypnosis"),
  track("hypnotic_techno", "Shifted", "Control", "Mote-Evolver", 130, "United Kingdom", "Hypnotic Techno / Raw Techno", "shifted_hypnotic_pressure"),
  track("hypnotic_techno", "Acronym", "16 Cygni", "Northern Electronics", 128, "Sweden", "Hypnotic Techno / Deep Techno", "northern_electronics_anchor"),
  track("hypnotic_techno", "Svreca", "Mountain Splitter", "Semantica", 130, "Spain", "Hypnotic Techno / Spanish Techno", "semantica_hypnotic_depth"),

  track("raw_techno", "Perc", "Look What Your Love Has Done To Me", "Perc Trax", 132, "United Kingdom", "Raw Techno / Industrial Techno", "perc_trax_anchor"),
  track("raw_techno", "UVB", "Mixtion", "Mord", 132, "France", "Raw Techno / Warehouse Techno", "mord_raw_anchor"),
  track("raw_techno", "AnD", "Cosmic Microwave Background", "Electric Deluxe", 133, "United Kingdom", "Raw Techno / Industrial Techno", "raw_industrial_tool"),
  track("raw_techno", "Karenn", "Pace Yourself", "Works The Long Nights", 132, "United Kingdom", "Raw Techno / Live Techno", "live_raw_pressure"),
  track("raw_techno", "Truss", "Beacon", "R&S Records", 132, "United Kingdom", "Raw Techno / UK Techno", "uk_raw_depth"),

  track("detroit_techno", "Jeff Mills", "The Bells", "Purpose Maker", 135, "United States", "Detroit Techno / Minimal Techno", "purpose_maker_anchor"),
  track("detroit_techno", "Robert Hood", "Minus", "M-Plant", 130, "United States", "Detroit Techno / Minimal Techno", "minimal_detroit_anchor"),
  track("detroit_techno", "Carl Craig", "At Les", "Planet E", 126, "United States", "Detroit Techno / Techno", "planet_e_anchor"),
  track("detroit_techno", "DJ Rolando", "Knights Of The Jaguar", "Underground Resistance", 130, "United States", "Detroit Techno / Hi-Tech Soul", "ur_melodic_anchor"),
  track("detroit_techno", "Kenny Larkin", "We Shall Overcome", "Plus 8", 128, "United States", "Detroit Techno / Classic Techno", "detroit_plus8_depth"),

  track("industrial_techno", "Ancient Methods", "Knights & Bishops", "Ancient Methods", 130, "Germany", "Industrial Techno / Techno", "ancient_methods_anchor"),
  track("industrial_techno", "British Murder Boys", "Don't Give Way To Fear", "Counterbalance", 132, "United Kingdom", "Industrial Techno / Birmingham Techno", "bmb_anchor"),
  track("industrial_techno", "Orphx", "Cut Through", "Sonic Groove", 130, "Canada", "Industrial Techno / EBM Techno", "orphx_machine_anchor"),
  track("industrial_techno", "SNTS", "Ancestral Reflection", "SNTS", 130, "Germany", "Industrial Techno / Dark Techno", "masked_industrial_depth"),
  track("industrial_techno", "Ansome", "Tin", "Perc Trax", 134, "United Kingdom", "Industrial Techno / Raw Techno", "perc_trax_industrial_tool"),

  track("peak_time_techno", "UMEK", "Gatex", "Consumer Recreation", 135, "Slovenia", "Peak-time Techno / Driving Techno", "slovenian_peak_anchor"),
  track("peak_time_techno", "Adam Beyer & Bart Skils", "Your Mind", "Drumcode", 132, "Sweden", "Peak-time Techno / Drumcode Techno", "drumcode_crossover_anchor"),
  track("peak_time_techno", "Space 92", "Phobos", "Filth on Acid", 132, "France", "Peak-time Techno / Acid Techno", "modern_peak_acid"),
  track("peak_time_techno", "HI-LO", "Kronos", "Drumcode", 132, "Netherlands", "Peak-time Techno / Big-room Techno", "hilo_peak_anchor"),
  track("peak_time_techno", "Layton Giordani", "Live Again", "Drumcode", 132, "United States", "Peak-time Techno / Drumcode Techno", "drumcode_new_school"),

  track("schranz", "Chris Liebing", "Stigmata 10", "CLR", 145, "Germany", "Schranz / Hard Techno", "schranz_origin_bridge"),
  track("schranz", "Sven Wittekind", "Sunstorm", "Inflicted", 150, "Germany", "Schranz / Hard Techno", "german_schranz_depth"),
  track("schranz", "Frank Kvitta", "Fatality", "Insane Life", 150, "Germany", "Schranz / Hard Techno", "hard_schranz_tool"),
  track("schranz", "Pet Duo", "Techno Is Not For Children", "Cause Records", 150, "Brazil", "Schranz / Hard Techno", "brazil_germany_schranz"),

  track("ebm", "Front Line Assembly", "Mindphaser", "Third Mind", 124, "Canada", "EBM / Electro-industrial", "canadian_ebm_anchor"),
  track("ebm", "The Klinik", "Moving Hands", "Antler-Subway", 120, "Belgium", "EBM / Industrial Body Music", "belgian_body_depth"),
  track("ebm", "Fixmer/McCarthy", "Freefall", "Planete Rouge", 128, "France", "EBM Techno / Industrial Techno", "fixmer_mccarthy_bridge"),
  track("ebm", "Schwefelgelb", "Fokus", "aufnahme + wiedergabe", 128, "Germany", "EBM Techno / Body Techno", "modern_body_techno")
];

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

const artistHeaders = [
  "style",
  "artist",
  "country",
  "city",
  "artist_bio",
  "artist_genre",
  "artist_profile_hint",
  "source",
  "source_anchor",
  "source_anchor_url",
  "source_note"
];

function track(style, artist, song, label, bpmExact, country, artistGenre, catalogRole) {
  return { style, artist, song, label, bpmExact, country, artistGenre, catalogRole };
}

function normalize(value = "") {
  return String(value ?? "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/&/g, " and ")
    .replace(/[^a-z0-9]+/g, " ")
    .trim()
    .replace(/\s+/g, " ");
}

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

function existingKeys() {
  const artistKeys = new Set();
  const trackKeys = new Set();
  const ignored = new Set([
    path.basename(ARTIST_OUT),
    path.basename(TRACK_OUT),
    path.basename(PROFILE_OUT)
  ]);
  const files = fs.readdirSync(DATA_DIR).filter((file) => {
    if (ignored.has(file)) return false;
    return /\.(csv)$/i.test(file);
  });

  for (const file of files) {
    for (const row of readCsvRows(path.join(DATA_DIR, file))) {
      const style = normalize(row.style || row.subgenre || row.genre || row.main_style);
      const artist = normalize(row.artist || row.artist_name || row.name);
      const song = normalize(row.song || row.track || row.title || row.track_name);
      if (style && artist) artistKeys.add(`${style}::${artist}`);
      if (artist && song) trackKeys.add(`${artist}::${song}`);
    }
  }
  return { artistKeys, trackKeys };
}

function styleLabel(style = "") {
  return STYLE_INFO[style]?.label || style.replace(/_/g, " ");
}

function styleSourceUrl(style = "") {
  return `https://www.discogs.com/search/?q=${encodeQuery(styleLabel(style))}&type=all`;
}

function trackLinks(trackRow) {
  const query = encodeQuery(`${trackRow.artist} ${trackRow.song}`);
  return {
    sourceUrl: `https://www.discogs.com/search/?q=${query}&type=all`,
    trackUrl: `https://www.youtube.com/results?search_query=${query}`,
    spotifyUrl: `https://open.spotify.com/search/${query}`,
    youtubeUrl: `https://www.youtube.com/results?search_query=${query}`,
    beatportUrl: `https://www.beatport.com/search?q=${query}`
  };
}

function sourceNote(style = "") {
  const info = STYLE_INFO[style] || {};
  return `Curated techno v4 expansion for ${info.label || styleLabel(style)}; ${info.sceneNote || "editorial discovery anchor"}.`;
}

function trackBio(trackRow) {
  return `${trackRow.artist} entra no lote techno v4 como referencia de ${styleLabel(trackRow.style)}, usando "${trackRow.song}" para ampliar artistas, contexto e rota de descoberta do subgenero.`;
}

function trackHint(trackRow) {
  return `Anchor editorial v4 para ${styleLabel(trackRow.style)}; links sao discovery/search e devem ser revisados antes de marcar qualquer perfil social como oficial.`;
}

function artistBio(row) {
  return `${row.artist} entra na expansao v12 para aprofundar ${styleLabel(row.style)} no Sonic Search e reduzir repeticao de artistas em recomendacoes e descoberta dinamica.`;
}

function artistHint(row) {
  const info = STYLE_INFO[row.style] || {};
  return `Use ${row.artist} como seed de ${styleLabel(row.style)}; recorte: ${info.sceneNote || "techno subgenre discovery"}.`;
}

function csvWrite(rows, headers) {
  return [
    headers.map(csvCell).join(","),
    ...rows.map((row) => headers.map((header) => csvCell(row[header] ?? "")).join(","))
  ].join("\n") + "\n";
}

function uniqueRows(rows, keys) {
  const seen = new Set();
  return rows.filter((row) => {
    const key = keys.map((item) => normalize(row[item] || "")).join("::");
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

const existing = existingKeys();
const seenTrackKeys = new Set(existing.trackKeys);
const trackRows = [];

for (const item of TRACKS) {
  const key = `${normalize(item.artist)}::${normalize(item.song)}`;
  if (seenTrackKeys.has(key)) continue;
  seenTrackKeys.add(key);
  const links = trackLinks(item);
  trackRows.push({
    style: item.style,
    artist: item.artist,
    song: item.song,
    label: item.label,
    bpm_exact: item.bpmExact,
    country: item.country,
    artist_genre: item.artistGenre,
    catalog_role: item.catalogRole,
    source_url: links.sourceUrl,
    track_url: links.trackUrl,
    spotify_url: links.spotifyUrl,
    youtube_url: links.youtubeUrl,
    beatport_url: links.beatportUrl,
    artist_bio: trackBio(item),
    artist_profile_hint: trackHint(item),
    source_note: sourceNote(item.style)
  });
}

const artistRows = [];
const seenArtistKeys = new Set(existing.artistKeys);

for (const [style, artists] of Object.entries(STYLE_ARTISTS)) {
  for (const artist of artists) {
    const cleanArtist = String(artist || "").trim();
    if (!cleanArtist) continue;
    const key = `${normalize(style)}::${normalize(cleanArtist)}`;
    if (seenArtistKeys.has(key)) continue;
    seenArtistKeys.add(key);
    const info = STYLE_INFO[style] || {};
    const row = {
      style,
      artist: cleanArtist,
      country: info.country || "International",
      city: "",
      artist_bio: artistBio({ style, artist: cleanArtist }),
      artist_genre: info.label || styleLabel(style),
      artist_profile_hint: artistHint({ style, artist: cleanArtist }),
      source: ARTIST_BATCH,
      source_anchor: info.sourceAnchor || "techno subgenre editorial research",
      source_anchor_url: styleSourceUrl(style),
      source_note: sourceNote(style)
    };
    artistRows.push(row);
  }
}

const profileRowsFromTracks = trackRows.map((row) => ({
  style: row.style,
  artist: row.artist,
  country: row.country,
  artist_bio: row.artist_bio,
  artist_genre: row.artist_genre,
  artist_profile_hint: row.artist_profile_hint,
  scene_role: row.catalog_role,
  source_anchor_url: row.source_url,
  profile_tracks: `${row.song} (${row.bpm_exact})`,
  source_note: row.source_note
}));

const profileRowsFromArtists = artistRows.map((row) => ({
  style: row.style,
  artist: row.artist,
  country: row.country,
  artist_bio: row.artist_bio,
  artist_genre: row.artist_genre,
  artist_profile_hint: row.artist_profile_hint,
  scene_role: "artist_seed_v12",
  source_anchor_url: row.source_anchor_url,
  profile_tracks: "",
  source_note: row.source_note
}));

const profileRows = uniqueRows([...profileRowsFromTracks, ...profileRowsFromArtists], ["style", "artist"])
  .sort((a, b) => a.style.localeCompare(b.style) || a.artist.localeCompare(b.artist));

trackRows.sort((a, b) => a.style.localeCompare(b.style) || a.artist.localeCompare(b.artist) || a.song.localeCompare(b.song));
artistRows.sort((a, b) => a.style.localeCompare(b.style) || a.artist.localeCompare(b.artist));

function artistValues(row, sourceName) {
  const metadata = {
    batch: sourceName,
    profile_depth: row.scene_role === "artist_seed_v12" ? "techno_artist_seed_v12" : "techno_artist_profile_v4",
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
    sourceName,
    row.source_anchor_url,
    "published"
  ].map(sqlLiteral).join(", ")}, ${sqlJson(metadata)})`;
}

function trackValues(row) {
  const metadata = {
    batch: TRACK_BATCH,
    confidence: "editorial",
    bpm_text: `${row.bpm_exact} BPM editorial guide for ${styleLabel(row.style)}`,
    source_tags: [
      row.style,
      styleLabel(row.style),
      row.catalog_role,
      row.artist_genre,
      row.label,
      "curated_techno_enrichment_v4"
    ].filter(Boolean),
    track_url: row.track_url,
    spotify_url: row.spotify_url,
    youtube_url: row.youtube_url,
    beatport_url: row.beatport_url,
    catalog_role: row.catalog_role,
    energy_band: row.bpm_exact >= 145 ? "hard_peak" : row.bpm_exact >= 136 ? "high_warehouse" : ["ambient_techno", "deep_techno", "dub_techno", "hypnotic_techno"].includes(row.style) ? "deep_hypnotic" : "club_groove",
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
    BATCH_DATE,
    null,
    row.country,
    "",
    row.artist_bio,
    row.artist_genre,
    row.artist_profile_hint,
    TRACK_BATCH,
    row.source_url,
    "published"
  ].map(sqlLiteral).join(", ")}, ${sqlJson(metadata)})`;
}

function artistSql(rows, sourceName, title) {
  return `-- Sonic Search - ${title}
-- Generated ${BATCH_DATE}.
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
${rows.map((row) => artistValues(row, sourceName)).join(",\n")}
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
`;
}

const sql = `${artistSql(profileRows, TRACK_BATCH, "Techno enrichment V4 artists")}

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
${trackRows.map(trackValues).join(",\n")}
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

const artistOnlyProfileRows = profileRowsFromArtists
  .filter((row) => artistRows.some((artistRow) => artistRow.style === row.style && artistRow.artist === row.artist));

const artistSeedSql = artistSql(artistOnlyProfileRows, ARTIST_BATCH, "Techno artist expansion V12");

const trackStyleCounts = trackRows.reduce((acc, row) => {
  acc[row.style] = (acc[row.style] || 0) + 1;
  return acc;
}, {});

const artistStyleCounts = artistRows.reduce((acc, row) => {
  acc[row.style] = (acc[row.style] || 0) + 1;
  return acc;
}, {});

const coveredStyles = new Set([...Object.keys(trackStyleCounts), ...Object.keys(artistStyleCounts)]);

const report = `# Techno Enrichment V4 - ${BATCH_DATE}

## Objetivo

Aumentar artistas e faixas de techno, tech house, acid techno e subgeneros de techno no Sonic Search.

## Resultado

- ${artistRows.length} novos seeds em \`catalog_artists\` via \`artist_expansion_seeds_v12.csv\`;
- ${trackRows.length} faixas em \`catalog_tracks\`;
- ${profileRows.length} perfis em \`catalog_artists\` no seed Supabase v4;
- ${coveredStyles.size} subgeneros cobertos.

## Cobertura de artistas V12

${Object.entries(artistStyleCounts).sort(([a], [b]) => a.localeCompare(b)).map(([style, count]) => `- \`${style}\`: ${count} ${count === 1 ? "artista" : "artistas"}`).join("\n")}

## Cobertura de faixas V4

${Object.entries(trackStyleCounts).sort(([a], [b]) => a.localeCompare(b)).map(([style, count]) => `- \`${style}\`: ${count} ${count === 1 ? "faixa" : "faixas"}`).join("\n")}

## Notas

- Links sao discovery/search links para revisao e descoberta, nao garantia de social oficial.
- O lote usa \`confidence = editorial\` em metadata.
- A expansao prioriza subgeneros que estavam sem seeds dedicados: \`deep_techno\`, \`ambient_techno\`, \`bleep_techno\`, \`tribal_techno\`, \`hardgroove_techno\` e \`broken_techno\`.
- As entradas locais do app usam o mesmo recorte, sem marcar preview oficial como verificado.

## Arquivos

- \`data/artist_expansion_seeds_v12.csv\`
- \`data/${TRACK_BATCH}.csv\`
- \`data/techno_artist_profiles_v4_20260621.csv\`
- \`supabase/seeds/${TRACK_BATCH}.sql\`
- \`supabase/seeds/techno_artist_expansion_v12_20260621.sql\`
`;

fs.mkdirSync(DATA_DIR, { recursive: true });
fs.mkdirSync(SEED_DIR, { recursive: true });
fs.mkdirSync(REPORT_DIR, { recursive: true });
fs.writeFileSync(TRACK_OUT, csvWrite(trackRows, trackHeaders));
fs.writeFileSync(PROFILE_OUT, csvWrite(profileRows, profileHeaders));
fs.writeFileSync(ARTIST_OUT, csvWrite(artistRows, artistHeaders));
fs.writeFileSync(SQL_OUT, sql);
fs.writeFileSync(ARTIST_SQL_OUT, artistSeedSql);
fs.writeFileSync(REPORT_OUT, report);

console.log(`Wrote ${artistRows.length} artist seeds.`);
console.log(`Wrote ${trackRows.length} tracks and ${profileRows.length} profiles.`);
console.log(path.relative(ROOT, ARTIST_OUT));
console.log(path.relative(ROOT, TRACK_OUT));
console.log(path.relative(ROOT, PROFILE_OUT));
console.log(path.relative(ROOT, SQL_OUT));
console.log(path.relative(ROOT, ARTIST_SQL_OUT));
console.log(path.relative(ROOT, REPORT_OUT));
