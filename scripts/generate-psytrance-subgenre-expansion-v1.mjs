import fs from "node:fs";
import path from "node:path";

const ROOT = process.cwd();
const DATA_DIR = path.join(ROOT, "data");
const REPORT_DIR = path.join(ROOT, "reports");
const ARTIST_OUT = path.join(DATA_DIR, "artist_expansion_seeds_v11.csv");
const TRACK_OUT = path.join(DATA_DIR, "verified_track_expansion_v9.csv");
const REPORT_OUT = path.join(REPORT_DIR, "psytrance_subgenre_expansion_v1_2026-06-21.md");

const ARTIST_SOURCE_TAG = "artist_expansion_v11_psytrance_subgenres_research";
const TRACK_SOURCE_TAG = "verified_deezer_expansion_v9_psytrance_subgenres";

const STYLE_INFO = {
  psytrance: {
    label: "psytrance",
    country: "International",
    sourceAnchor: "TIP Records / broad psytrance catalog",
    sourceUrl: "https://tiprecords.bandcamp.com/music",
    sceneNote: "broad psychedelic trance and classic festival psytrance"
  },
  forest_psy: {
    label: "forest psytrance",
    country: "International",
    sourceAnchor: "Forestdelic / Sangoma forest and twilight catalog",
    sourceUrl: "https://forestdelic.bandcamp.com/music",
    sceneNote: "organic, wooded, nocturnal psytrance with layered percussion"
  },
  dark_psy: {
    label: "dark psytrance",
    country: "International",
    sourceAnchor: "Sangoma / darkpsy and night psytrance catalog",
    sourceUrl: "https://sangomarecs.bandcamp.com/music",
    sceneNote: "night-time darkpsy pressure and dense psychedelic sound design"
  },
  twilight_psy: {
    label: "twilight psytrance",
    country: "International",
    sourceAnchor: "Sangoma / twilight full-on bridge",
    sourceUrl: "https://sangomarecs.bandcamp.com/music",
    sceneNote: "bridge between full-on drive, forest detail and night-time psytrance"
  },
  dark_experimental: {
    label: "dark experimental psytrance",
    country: "International",
    sourceAnchor: "Naturaiz / Voodoo Hoodoo experimental high-BPM catalog",
    sourceUrl: "https://naturaizrecords.bandcamp.com/music",
    sceneNote: "experimental darkpsy, abstract structure and extreme texture"
  },
  psycore: {
    label: "psycore",
    country: "International",
    sourceAnchor: "Voodoo Hoodoo / Black Out high-BPM catalog",
    sourceUrl: "https://voodoo-hoodoo.bandcamp.com/music",
    sceneNote: "extreme high-BPM psycore and hitech-adjacent pressure"
  },
  psybreaks: {
    label: "psybreaks",
    country: "International",
    sourceAnchor: "Digital Diamonds / psychedelic breaks and techno-adjacent catalog",
    sourceUrl: "https://digitaldiamonds.bandcamp.com/music",
    sceneNote: "psychedelic breaks, progressive breaks and broken psy basslines"
  },
  psybient: {
    label: "psybient / psychill",
    country: "International",
    sourceAnchor: "Ultimae / psychill and psychedelic ambient catalog",
    sourceUrl: "https://ultimae.bandcamp.com/music",
    sceneNote: "psychedelic ambient, psychill, psydub and downtempo sound journeys"
  },
  freeform: {
    label: "freeform psytrance / suomisaundi",
    country: "Finland",
    sourceAnchor: "Suomisaundi artist lineage and freeform psytrance research",
    sourceUrl: "https://en.wikipedia.org/wiki/Suomisaundi",
    sceneNote: "Finnish freeform psytrance, suomisaundi, humor, funk and oddball structure"
  },
  full_on: {
    label: "full-on psytrance",
    country: "International",
    sourceAnchor: "Nano Records full-on catalog",
    sourceUrl: "https://nanorecords.bandcamp.com/music",
    sceneNote: "modern full-on psytrance, festival drive and clean psychedelic production"
  },
  full_on_night: {
    label: "full-on night",
    country: "International",
    sourceAnchor: "Nano / TIP night full-on catalog",
    sourceUrl: "https://nanorecords.bandcamp.com/music",
    sceneNote: "heavier night full-on with darker basslines and peak-time pressure"
  },
  full_on_morning: {
    label: "full-on morning",
    country: "International",
    sourceAnchor: "Nano Records morning full-on catalog",
    sourceUrl: "https://nanorecords.bandcamp.com/music",
    sceneNote: "sunrise full-on, melodic lift and bright festival psytrance"
  },
  progressive_psy: {
    label: "progressive psytrance",
    country: "International",
    sourceAnchor: "Iboga / IONO progressive psytrance catalog",
    sourceUrl: "https://ibogarecords.bandcamp.com/music",
    sceneNote: "progressive psytrance, prog psy and rolling melodic club pressure"
  },
  hi_tech: {
    label: "hi-tech psytrance",
    country: "International",
    sourceAnchor: "Black Out / Voodoo Hoodoo high-BPM catalog",
    sourceUrl: "https://blackoutrec.bandcamp.com/music",
    sceneNote: "hi-tech psytrance, fast sound design and high-velocity psychedelic rhythm"
  },
  dark_progressive: {
    label: "dark progressive / zenonesque",
    country: "International",
    sourceAnchor: "Zenon Records dark progressive catalog",
    sourceUrl: "https://zenonrecords.bandcamp.com/music",
    sceneNote: "zenonesque, dark progressive psytrance and deep-dancefloor electronica"
  },
  goa_trance: {
    label: "goa trance",
    country: "International",
    sourceAnchor: "Suntrip Records goa trance catalog",
    sourceUrl: "https://suntriprecords.bandcamp.com/music",
    sceneNote: "melodic goa trance, acid trance and classic psychedelic trance lineage"
  },
  psy_comercial: {
    label: "commercial psytrance",
    country: "International",
    sourceAnchor: "Iboga / TIP mainstream psytrance catalog",
    sourceUrl: "https://ibogarecords.bandcamp.com/music",
    sceneNote: "mainstage psytrance, melodic drops and festival-accessible production"
  }
};

const STYLE_ARTISTS = {
  psytrance: [
    "Astrix", "Ace Ventura", "Infected Mushroom", "1200 Micrograms", "GMS", "Electric Universe",
    "Talamasca", "Space Tribe", "Man With No Name", "Cosmosis", "Mad Tribe", "Koxbox",
    "Outsiders", "Loud", "Hilight Tribe", "Raja Ram", "Menog", "Iridian"
  ],
  forest_psy: [
    "Arjuna", "Atriohm", "Derango", "Yudhisthira", "Tengri", "Kabayun", "Kala",
    "Farebi Jalebi", "Drip Drop", "Whrikk", "Nobot", "Krapul", "Southwild",
    "Confo", "Procs", "Hutti Heita", "Jahbo", "Thelios", "Fantazma", "Shadow Shaman"
  ],
  dark_psy: [
    "Kindzadza", "Psykovsky", "Furious", "Cosmo", "Dark Whisper", "Orestis",
    "Kashyyyk", "Mubali", "Parus", "Penta", "Polyphonia", "Silent Horror",
    "Highko", "Electrypnose", "Alien Mental", "Bodhisattva 13:20", "Zik", "Psychoz"
  ],
  twilight_psy: [
    "Fungus Funk", "Kabayun", "Southwild", "Chromatone", "Synthetik Chaos", "Virtual Light",
    "Earthling", "Braincell", "Ital", "Dust", "Daksinamurti", "Module Virus",
    "Ingrained Instincts", "Yebah", "Nektarios", "Endeavour", "Sequoya", "Lemurians"
  ],
  dark_experimental: [
    "Sectio Aurea", "Audiosyntax", "Necropsycho", "IndacoRuna", "Ogoun", "Nyctophungi",
    "Hans Dunkelkammer", "Enigmachina", "Nala", "AnkouDead", "Bardo", "Jiazihu",
    "Saadhuk", "The Anti Priest", "Undermorph", "Mirror Me", "Nallun", "Hyperekplexia"
  ],
  psycore: [
    "Kashyyyk", "Necropsycho", "Baphomet Engine", "Psykovsky", "Cosmo", "Oroboro",
    "Varazslo", "Dark Whisper", "Highko", "Alien Chaos", "Popek", "Horcrux",
    "Paralocks", "Maramba", "Will O Wisp", "Plankton", "Depuratus", "Oxomo"
  ],
  psybreaks: [
    "Hedflux", "Bad Tango", "Mood Deluxe", "Neurodriver", "Far Too Loud", "MartOpetEr",
    "Monk3ylogic", "Quadrat Beat", "EurythmY", "Neuroplasm", "LuQas", "Specimen A",
    "Colombo", "Kiwa", "Digitalis", "Kiwa & ManMadeMan"
  ],
  psybient: [
    "Shpongle", "Carbon Based Lifeforms", "Solar Fields", "Aes Dana", "Asura", "Entheogenic",
    "Bluetech", "Ott", "Younger Brother", "Kalya Scintilla", "Desert Dwellers", "Globular",
    "Kuba", "Kaya Project", "Dhamika", "Suduaya", "Androcell", "Cell", "Tripswitch",
    "H.U.V.A. Network", "Martin Nonstatic", "Miktek"
  ],
  freeform: [
    "Texas Faggott", "Squaremeat", "Haltya", "Salakavala", "Luomuhappo",
    "Omituisten Otusten Kerho", "Pelinpala", "Mandalavandalz", "Puoskari", "Outolintu",
    "Kiwa", "Eraser vs Yojalka", "Kirna", "Troll Scientists", "Tea Chairs", "Flying Scorpions"
  ],
  full_on: [
    "Tristan", "Avalon", "Sonic Species", "Dickster", "Laughing Buddha", "Burn In Noise",
    "Earthspace", "Ajja", "Lucas", "Magik", "Outsiders", "Volcano", "Imagine Mars",
    "Mad Maxx", "Faders", "Champa", "Hypnocoustics", "Mandala", "Altruism", "Menog"
  ],
  full_on_night: [
    "Burn In Noise", "Dickster", "Earthling", "Mad Tribe", "Virtual Light", "Nukleall",
    "Braincell", "Psymmetrix", "Circuit Breakers", "Ital", "Regan", "Module Virus",
    "Ingrained Instincts", "Technology", "Menog", "Materia", "Hypnocoustics", "Iridian"
  ],
  full_on_morning: [
    "Avalon", "Sonic Species", "Digicult", "U-Recken", "Electric Universe", "Sinerider",
    "Polaris", "Melicia", "Sesto Sento", "Inner State", "Outsiders", "A-Tech",
    "Mad Maxx", "Talamasca", "Tropical Bleyage", "Relativ", "Spirit Architect", "Djantrix"
  ],
  progressive_psy: [
    "Ace Ventura", "Liquid Soul", "Captain Hook", "Protonica", "Ritmo", "Ticon",
    "Phaxe", "Morten Granau", "Neelix", "Zyce", "Flegma", "E-Clip", "Egorythmia",
    "Static Movement", "Sideform", "Animato", "Symbolic", "Gaudium", "Lyktum", "Ovnimoon"
  ],
  hi_tech: [
    "Technical Hitch", "Crazy Astronaut", "Oxidaksi", "Kashyyyk", "Will O Wisp", "Maramba",
    "Paralocks", "Selective Mood", "Mimic Vat", "Killatk", "Yatzee", "Arcek",
    "Mentalecho", "Cosinus", "Fright Rate", "Alien Chaos", "Popek", "Horcrux"
  ],
  dark_progressive: [
    "Sensient", "Tetrameth", "Shadow FX", "Grouch", "Merkaba", "Hypogeo", "Kromagon",
    "Sumiruna", "Evil Oil Man", "Ryanosaurus", "One Tasty Morsel", "Slip Hypnotic",
    "Pspiralife", "Electrypnose", "Fractal Joke", "Ambler", "Eartheogen", "Molecc"
  ],
  goa_trance: [
    "Filteria", "E-Mantra", "Khetzal", "Artifact303", "Goasia", "Mindsphere",
    "Astral Projection", "Pleiadians", "MFG", "Transwave", "Dimension 5", "Chi-A.D.",
    "Prana", "California Sunshine", "Juno Reactor", "Ra", "Ephedra", "Crossing Mind",
    "Median Project", "Hypnoxock"
  ],
  psy_comercial: [
    "Vini Vici", "Mandragora", "Skazi", "Vegas", "Blastoyz", "Reality Test",
    "Ranji", "Berg", "Astrix", "Neelix", "Phaxe", "Morten Granau", "Ghost Rider",
    "Omiki", "Upgrade", "Mystical Complex", "Sajanka", "Interactive Noise"
  ]
};

const COUNTRY_OVERRIDES = {
  "1200 micrograms": "UK",
  "aes dana": "France",
  "ace ventura": "Israel",
  "ajja": "Switzerland",
  "andromeda": "International",
  "astral projection": "Israel",
  astrix: "Israel",
  "avalon": "UK",
  "burn in noise": "Brazil",
  "captain hook": "Israel",
  "carbon based lifeforms": "Sweden",
  "cosmosis": "UK",
  "crazy astronaut": "Russia",
  "dark whisper": "Germany",
  "desert dwellers": "USA",
  "e-mantra": "Romania",
  "electric universe": "Germany",
  "filteria": "Sweden",
  "fungus funk": "Russia",
  "goasia": "Serbia",
  "grouch": "New Zealand",
  "injected mushroom": "Israel",
  "infected mushroom": "Israel",
  "juno reactor": "UK",
  "kaya project": "UK",
  "khetzal": "France",
  "liquid soul": "Switzerland",
  "mandragora": "Mexico",
  "mindsphere": "Turkey",
  "ott": "UK",
  "psykovsky": "Russia",
  "shpongle": "UK",
  "solar fields": "Sweden",
  "sonic species": "UK",
  "suduaya": "France",
  "talamasca": "France",
  "texas faggott": "Finland",
  "tristan": "UK",
  "vini vici": "Israel"
};

const EXACT_ARTIST_ALIASES = {
  "E-Mantra": ["E Mantra"],
  "H.U.V.A. Network": ["H.U.V.A Network", "HUVA Network"],
  "Kiwa & ManMadeMan": ["Kiwa", "ManMadeMan"],
  "Eraser vs Yojalka": ["Eraser vs. Yojalka", "Eraser & Yojalka"],
  "Omituisten Otusten Kerho": ["Omituisten Otusten Kerho"],
  "Bodhisattva 13:20": ["Bodhisattva 13:20"],
  "1200 Micrograms": ["1200 Mics", "1200 Micrograms"],
  "Man With No Name": ["Man With No Name"],
  "The Anti Priest": ["The Anti-Priest"]
};

const MAX_TRACKS_PER_ARTIST = 4;
const MAX_TOP_TRACKS = 12;
const REQUEST_PAUSE_MS = 120;

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

function walkFiles(dir) {
  if (!fs.existsSync(dir)) return [];
  return fs.readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) return walkFiles(full);
    return [full];
  });
}

function normalizeDatasetStyle(value = "") {
  const key = normalize(value).replace(/\s+/g, "");
  const aliases = {
    darkpsy: "dark_psy",
    darkpsytrance: "dark_psy",
    forestpsy: "forest_psy",
    hitech: "hi_tech",
    hitechpsy: "hi_tech",
    hitechpsytrance: "hi_tech",
    fullon: "full_on",
    fullonnight: "full_on_night",
    fullonmorning: "full_on_morning",
    progressivepsy: "progressive_psy",
    progresspsy: "progressive_psy",
    psychill: "psybient",
    suomi: "freeform",
    suomisaundi: "freeform",
    goatrance: "goa_trance",
    psycommercial: "psy_comercial",
    commercialpsytrance: "psy_comercial",
    darkprogressive: "dark_progressive",
    zenonesque: "dark_progressive"
  };
  return aliases[key] || value;
}

function existingKeys() {
  const artistKeys = new Set();
  const trackKeys = new Set();
  for (const file of walkFiles(DATA_DIR)) {
    if (!file.endsWith(".csv")) continue;
    if (file === ARTIST_OUT || file === TRACK_OUT) continue;
    for (const row of readCsvRows(file)) {
      const style = normalizeDatasetStyle(row.style || row.subgenre || row.genre || row.main_style || "");
      const artist = row.artist || row.artist_name || row.name || row.project || "";
      const song = row.song || row.track || row.title || row.track_name || "";
      if (style && artist) artistKeys.add(`${normalize(style)}::${normalize(artist)}`);
      if (artist && song) trackKeys.add(`${normalize(artist)}::${normalize(song)}`);
    }
  }
  return { artistKeys, trackKeys };
}

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function fetchJson(url, retries = 2) {
  for (let attempt = 0; attempt <= retries; attempt += 1) {
    try {
      const response = await fetch(url, {
        headers: { "User-Agent": "SonicSearchPsytranceExpansion/1.0" }
      });
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      return await response.json();
    } catch (error) {
      if (attempt === retries) {
        console.warn(`Failed ${url}: ${error.message}`);
        return null;
      }
      await sleep(350 + attempt * 450);
    }
  }
  return null;
}

function deezerSearchArtistUrl(artist) {
  const url = new URL("https://api.deezer.com/search/artist");
  url.searchParams.set("q", artist);
  url.searchParams.set("limit", "10");
  return url;
}

function deezerTopUrl(id) {
  return `https://api.deezer.com/artist/${id}/top?limit=${MAX_TOP_TRACKS}`;
}

function deezerAlbumUrl(id) {
  return `https://api.deezer.com/album/${id}`;
}

function exactArtistNames(artist) {
  return [artist, ...(EXACT_ARTIST_ALIASES[artist] || [])].map(normalize).filter(Boolean);
}

function exactArtistMatch(expected, candidate) {
  const candidateKey = normalize(candidate);
  return exactArtistNames(expected).includes(candidateKey);
}

function contributorMatchesArtist(item, artist) {
  if (exactArtistMatch(artist, item?.artist?.name || "")) return true;
  return (item?.contributors || []).some((contributor) => exactArtistMatch(artist, contributor?.name || ""));
}

async function resolveDeezerArtist(artist) {
  const payload = await fetchJson(deezerSearchArtistUrl(artist));
  const candidates = Array.isArray(payload?.data) ? payload.data : [];
  return candidates.find((candidate) => exactArtistMatch(artist, candidate?.name || "")) || null;
}

function likelyUsableTrack(item, artist) {
  const title = ascii(item?.title_short || item?.title || "");
  const preview = String(item?.preview || "").trim();
  const duration = Number(item?.duration || 0);
  if (!title || !preview.startsWith("http")) return false;
  if (duration && (duration < 70 || duration > 1200)) return false;
  if (!contributorMatchesArtist(item, artist)) return false;
  const text = normalize([title, item?.album?.title, item?.title_version].filter(Boolean).join(" "));
  const reject = [
    "interview",
    "podcast",
    "karaoke",
    "commentary",
    "continuous mix",
    "dj mix",
    "full set",
    "live set",
    "album preview"
  ];
  return !reject.some((term) => text.includes(normalize(term)));
}

function youtubeSearchUrl(artist, song) {
  return `https://www.youtube.com/results?search_query=${encodeURIComponent(`${artist} ${song}`)}`;
}

function artistCountry(artist, style) {
  return COUNTRY_OVERRIDES[normalize(artist)] || STYLE_INFO[style]?.country || "International";
}

function styleBio(style, artist) {
  const info = STYLE_INFO[style];
  return `${artist} entra na expansao V11 para aprofundar ${info.label} no Sonic Search, com ancora editorial em ${info.sourceAnchor} e validacao complementar por busca publica de catalogo.`;
}

function styleHint(style, artist) {
  const info = STYLE_INFO[style];
  return `Use ${artist} quando o usuario pedir ${info.label}; recorte: ${info.sceneNote}. Fonte de cena: ${info.sourceAnchor}.`;
}

function makeArtistRow(style, artist) {
  const info = STYLE_INFO[style];
  return {
    style,
    artist,
    country: artistCountry(artist, style),
    city: "",
    artist_bio: ascii(styleBio(style, artist)),
    artist_genre: info.label,
    artist_profile_hint: ascii(styleHint(style, artist)),
    source: ARTIST_SOURCE_TAG,
    source_anchor: info.sourceAnchor,
    source_anchor_url: info.sourceUrl,
    source_note: ascii(`Curated psytrance subgenre research batch; source anchor: ${info.sourceAnchor}.`)
  };
}

function albumGenres(albumDetails) {
  return (albumDetails?.genres?.data || []).map((entry) => ascii(entry.name)).filter(Boolean).join(";");
}

function makeTrackRow(style, artist, item, albumDetails) {
  const info = STYLE_INFO[style];
  const song = ascii(item?.title_short || item?.title || "");
  const label = ascii(albumDetails?.label || item?.album?.title || "Deezer");
  const albumTitle = ascii(albumDetails?.title || item?.album?.title || "");
  return {
    style,
    artist,
    song,
    label,
    bpm_exact: "",
    preview_url: String(item?.preview || "").trim(),
    release_date: ascii(albumDetails?.release_date || ""),
    duration_sec: String(item?.duration || "").trim(),
    country: artistCountry(artist, style),
    city: "",
    artist_bio: ascii(`${artist} reforca ${info.label} com faixa tocavel encontrada no Deezer e contexto editorial de ${info.sourceAnchor}.`),
    artist_genre: info.label,
    artist_profile_hint: ascii(`Preview oficial Deezer + curadoria ${info.label}; BPM exato nao inferido, usar a faixa de BPM do subgenero no app.`),
    source: TRACK_SOURCE_TAG,
    youtube_track_url: youtubeSearchUrl(artist, song),
    soundcloud_track_url: "",
    bandcamp_track_url: info.sourceUrl,
    bandcamp_track_id: "",
    deezer_artist_id: String(item?.artist?.id || ""),
    deezer_track_id: String(item?.id || ""),
    deezer_track_url: String(item?.link || ""),
    deezer_album_id: String(item?.album?.id || ""),
    album_title: albumTitle,
    album_genres: albumGenres(albumDetails),
    source_anchor_url: info.sourceUrl,
    source_note: ascii(`Artist exact-match via Deezer search/top endpoint; style assignment anchored to ${info.sourceAnchor}.`)
  };
}

async function collectArtistTracks(style, artist, seenTrackKeys, albumCache) {
  const resolved = await resolveDeezerArtist(artist);
  if (!resolved?.id) return { rows: [], resolved: null, reason: "no_exact_artist_match" };
  await sleep(REQUEST_PAUSE_MS);
  const payload = await fetchJson(deezerTopUrl(resolved.id));
  const items = Array.isArray(payload?.data) ? payload.data : [];
  const rows = [];
  for (const item of items) {
    if (!likelyUsableTrack(item, artist)) continue;
    const song = ascii(item?.title_short || item?.title || "");
    const key = `${normalize(artist)}::${normalize(song)}`;
    if (!song || seenTrackKeys.has(key)) continue;
    const albumId = item?.album?.id ? String(item.album.id) : "";
    let albumDetails = {};
    if (albumId) {
      if (!albumCache.has(albumId)) {
        await sleep(REQUEST_PAUSE_MS);
        albumCache.set(albumId, await fetchJson(deezerAlbumUrl(albumId)) || {});
      }
      albumDetails = albumCache.get(albumId) || {};
    }
    seenTrackKeys.add(key);
    rows.push(makeTrackRow(style, artist, item, albumDetails));
    if (rows.length >= MAX_TRACKS_PER_ARTIST) break;
  }
  return { rows, resolved, reason: rows.length ? "" : "no_usable_preview_tracks" };
}

function buildReport({ artistRows, trackRows, styleSummaries, misses, sourceUrls }) {
  const lines = [];
  lines.push("# Psytrance subgenre expansion V1");
  lines.push("");
  lines.push(`Generated: 2026-06-21`);
  lines.push("");
  lines.push("## Outputs");
  lines.push("");
  lines.push(`- ${path.relative(ROOT, ARTIST_OUT)}: ${artistRows.length} new artist seed rows`);
  lines.push(`- ${path.relative(ROOT, TRACK_OUT)}: ${trackRows.length} Deezer-preview track rows`);
  lines.push("");
  lines.push("## Coverage by style");
  lines.push("");
  lines.push("| style | artist seeds | preview tracks | source anchor |");
  lines.push("| --- | ---: | ---: | --- |");
  for (const summary of styleSummaries) {
    lines.push(`| ${summary.style} | ${summary.artists} | ${summary.tracks} | ${summary.sourceAnchor} |`);
  }
  lines.push("");
  lines.push("## Source anchors");
  lines.push("");
  for (const url of sourceUrls) lines.push(`- ${url}`);
  lines.push("- https://api.deezer.com/ (artist search, artist top tracks and album metadata endpoints)");
  lines.push("");
  lines.push("## Notes");
  lines.push("");
  lines.push("- Deezer rows use exact artist-name matches and require a playable preview URL.");
  lines.push("- `bpm_exact` is intentionally blank for Deezer rows because the API does not expose verified BPM; the app can use its subgenre BPM range fallback.");
  lines.push("- Artist seeds cover scene depth even when a given artist has no exact Deezer preview match.");
  if (misses.length) {
    lines.push("");
    lines.push("## Deezer misses");
    lines.push("");
    misses.slice(0, 120).forEach((miss) => {
      lines.push(`- ${miss.style}: ${miss.artist} (${miss.reason})`);
    });
    if (misses.length > 120) lines.push(`- ...${misses.length - 120} more`);
  }
  return lines.join("\n") + "\n";
}

async function main() {
  fs.mkdirSync(DATA_DIR, { recursive: true });
  fs.mkdirSync(REPORT_DIR, { recursive: true });

  const { artistKeys, trackKeys } = existingKeys();
  const seenArtistKeys = new Set(artistKeys);
  const seenTrackKeys = new Set(trackKeys);
  const artistRows = [];
  const trackRows = [];
  const styleSummaries = [];
  const misses = [];
  const albumCache = new Map();

  for (const [style, artists] of Object.entries(STYLE_ARTISTS)) {
    let styleArtistCount = 0;
    let styleTrackCount = 0;
    const uniqueArtists = Array.from(new Set(artists.map(ascii).filter(Boolean)));
    for (const artist of uniqueArtists) {
      const artistKey = `${normalize(style)}::${normalize(artist)}`;
      if (!seenArtistKeys.has(artistKey)) {
        seenArtistKeys.add(artistKey);
        artistRows.push(makeArtistRow(style, artist));
        styleArtistCount += 1;
      }
      const result = await collectArtistTracks(style, artist, seenTrackKeys, albumCache);
      trackRows.push(...result.rows);
      styleTrackCount += result.rows.length;
      if (!result.rows.length) misses.push({ style, artist, reason: result.reason });
      await sleep(REQUEST_PAUSE_MS);
    }
    styleSummaries.push({
      style,
      artists: styleArtistCount,
      tracks: styleTrackCount,
      sourceAnchor: STYLE_INFO[style].sourceAnchor
    });
    console.log(`${style.padEnd(18)} artists +${String(styleArtistCount).padStart(3)} tracks +${String(styleTrackCount).padStart(3)}`);
  }

  artistRows.sort((a, b) => a.style.localeCompare(b.style) || a.artist.localeCompare(b.artist));
  trackRows.sort((a, b) => a.style.localeCompare(b.style) || a.artist.localeCompare(b.artist) || a.song.localeCompare(b.song));

  fs.writeFileSync(ARTIST_OUT, csvWrite(artistRows, [
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
  ]));

  fs.writeFileSync(TRACK_OUT, csvWrite(trackRows, [
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
    "youtube_track_url",
    "soundcloud_track_url",
    "bandcamp_track_url",
    "bandcamp_track_id",
    "deezer_artist_id",
    "deezer_track_id",
    "deezer_track_url",
    "deezer_album_id",
    "album_title",
    "album_genres",
    "source_anchor_url",
    "source_note"
  ]));

  const sourceUrls = Array.from(new Set(Object.values(STYLE_INFO).map((info) => info.sourceUrl))).sort();
  fs.writeFileSync(REPORT_OUT, buildReport({ artistRows, trackRows, styleSummaries, misses, sourceUrls }));

  console.log(`Wrote ${artistRows.length} artist rows to ${path.relative(ROOT, ARTIST_OUT)}`);
  console.log(`Wrote ${trackRows.length} track rows to ${path.relative(ROOT, TRACK_OUT)}`);
  console.log(`Wrote report to ${path.relative(ROOT, REPORT_OUT)}`);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
