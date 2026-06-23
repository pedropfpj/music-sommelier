import fs from "node:fs";
import path from "node:path";

const ROOT = process.cwd();
const DATA_DIR = path.join(ROOT, "data");
const ARTIST_OUT = path.join(DATA_DIR, "artist_expansion_seeds_v13.csv");
const TRACK_OUT = path.join(DATA_DIR, "verified_track_expansion_v10.csv");
const ARTIST_SOURCE_TAG = "artist_expansion_v13_playable_depth";
const TRACK_SOURCE_TAG = "verified_deezer_expansion_v10_playable_depth";
const MAX_TRACKS_PER_ARTIST = 4;

const CURATED_STYLE_ARTISTS = {
  ambient_techno: [
    "The Orb", "The Future Sound of London", "Global Communication", "B12", "The Black Dog",
    "Speedy J", "Higher Intelligence Agency", "Ultramarine", "Orbital", "Biosphere",
    "Deepchord", "Monolake", "GAS", "Plaid", "Autechre"
  ],
  hardgroove_techno: [
    "Ben Sims", "Mark Broom", "The Advent", "Paul Mac", "Oliver Ho",
    "Player", "Hertz", "Cave", "Marco Bailey", "Samuel L Session",
    "DJ Rush", "DJ Shufflemaster", "Deetron", "Stanny Franssen", "Bryan Zentz"
  ],
  bleep_techno: [
    "LFO", "Sweet Exorcist", "Nightmares On Wax", "Unique 3", "Forgemasters",
    "Tricky Disco", "Ability II", "Ital Rockers", "A Guy Called Gerald", "Nexus 21",
    "808 State", "The Black Dog"
  ],
  tribal_techno: [
    "Ben Sims", "Surgeon", "Oliver Ho", "Reeko", "Oscar Mulero",
    "Exium", "Christian Wunsch", "Umek", "Valentino Kanzyani", "Hertz",
    "The Advent", "Mark Williams"
  ],
  broken_techno: [
    "Blawan", "Pangaea", "Objekt", "Batu", "Skee Mask",
    "Tessela", "Randomer", "Bruce", "Lurka", "Laksa",
    "Hodge", "Pearson Sound"
  ],
  deep_techno: [
    "Claudio PRC", "Luigi Tozzi", "Ness", "Edit Select", "Voices From The Lake",
    "Donato Dozzy", "Dino Sabatini", "Svreca", "Shifted", "Reeko",
    "Abdulla Rashim", "Acronym", "Polar Inertia", "Deepbass"
  ],
  hard_techno: [
    "Paula Temple", "Perc", "I Hate Models", "999999999", "Dax J",
    "Klangkuenstler", "Rebekah", "Anetha", "Charlie Sparks", "Shlomo",
    "Regal", "Viper Diva", "Airod", "Alignment"
  ],
  peak_time_techno: [
    "Adam Beyer", "Charlotte de Witte", "Amelie Lens", "Enrico Sangiuliano", "ANNA",
    "UMEK", "Layton Giordani", "Bart Skils", "Space 92", "Maddix",
    "Wehbba", "Joyhauser", "Spektre", "Drunken Kong"
  ],
  detroit_techno: [
    "Model 500", "Underground Resistance", "Drexciya", "Jeff Mills", "Robert Hood",
    "Carl Craig", "Juan Atkins", "Kevin Saunderson", "Kenny Larkin", "Octave One",
    "Stacey Pullen", "Claude Young", "Mike Banks", "Los Hermanos"
  ],
  garage_house: [
    "Todd Edwards", "Kerri Chandler", "Masters At Work", "MK", "Armand Van Helden",
    "Tuff Jam", "Grant Nelson", "MJ Cole", "Dem 2", "Mood II Swing",
    "Roger Sanchez", "Barbara Tucker", "Dennis Ferrer", "Blaze"
  ],
  jackin_house: [
    "DJ Sneak", "Derrick Carter", "Mark Farina", "Gene Farris", "Paul Johnson",
    "Green Velvet", "Cajmere", "Inland Knights", "Hector Moralez", "Phil Weeks",
    "Jesse Rose", "Sonny Fodera", "Low Steppa", "Riva Starr"
  ],
  soulful_house: [
    "Louie Vega", "Kerri Chandler", "Dennis Ferrer", "Osunlade", "Karizma",
    "Atjazz", "Jimpster", "Miguel Migs", "Sandy Rivera", "Blaze",
    "Terry Hunter", "Monique Bingham", "Ananda Project", "Ralf GUM"
  ],
  afro_house: [
    "Black Coffee", "Culoe De Song", "Shimza", "Da Capo", "Enoo Napa",
    "Caiiro", "Sun-El Musician", "Kususa", "Lemon & Herb", "Karyendasoul",
    "Boddhi Satva", "Pablo Fierro", "Hyenah", "Aero Manyelo"
  ],
  organic_house: [
    "Bedouin", "Satori", "Be Svendsen", "Mira", "Nicolas Jaar",
    "Acid Pauli", "Rampue", "Monolink", "Viken Arman", "Oceanvs Orientalis",
    "Nhii", "YokoO", "Roy Rosenfeld", "Zone+"
  ],
  drum_and_bass: [
    "Sub Focus", "Dimension", "Culture Shock", "Metrik", "Camo & Krooked",
    "Noisia", "Andy C", "Netsky", "Sigma", "Wilkinson",
    "High Contrast", "London Elektricity", "Chase & Status", "Pendulum"
  ],
  liquid_dnb: [
    "Calibre", "LSB", "Technimatic", "GLXY", "Pola & Bryson",
    "Monrroe", "Hybrid Minds", "Etherwood", "Keeno", "Seba",
    "Logistics", "Nu:Tone", "BCee", "Makoto"
  ],
  neurofunk: [
    "Noisia", "Black Sun Empire", "Mefjus", "Phace", "Ed Rush",
    "Optical", "Audio", "The Upbeats", "Emperor", "State of Mind",
    "Current Value", "Agressor Bunx", "Prolix", "Teddy Killerz"
  ],
  jungle: [
    "Goldie", "Roni Size", "LTJ Bukem", "Shy FX", "Remarc",
    "Source Direct", "Photek", "DJ Hype", "Omni Trio", "Dillinja",
    "4hero", "Congo Natty", "Ray Keith", "Aphrodite"
  ],
  uk_garage: [
    "MJ Cole", "Wookie", "Zed Bias", "El-B", "Artful Dodger",
    "Tuff Jam", "Todd Edwards", "DJ Q", "Conducta", "Sammy Virji",
    "Interplanetary Criminal", "Y U QT", "Bakey", "Flava D"
  ],
  halftime_bass: [
    "Ivy Lab", "Alix Perez", "EPROM", "G Jones", "Noisia",
    "Shades", "Tsuruda", "Chee", "The Glitch Mob", "Machinedrum",
    "Om Unit", "Itoa", "Fixate", "Subp Yao"
  ],
  dubstep: [
    "Skream", "Benga", "Digital Mystikz", "Coki", "Mala",
    "Loefah", "Kromestar", "Distance", "Caspa", "Rusko",
    "Truth", "J:Kenzo", "Commodo", "Kahn"
  ],
  footwork_juke: [
    "DJ Rashad", "DJ Spinn", "RP Boo", "Traxman", "DJ Earl",
    "DJ Taye", "Jlin", "DJ Manny", "DJ Clent", "DJ Paypal",
    "DJ Tre", "Heavee", "DJ Nate", "DJ Roc"
  ],
  brazilian_funk: [
    "DJ Marlboro", "Deize Tigrona", "MC Fioti", "MC Carol", "Tati Quebra Barraco",
    "Bonde do Role", "Joao Brasil", "Leo Justi", "Omulu", "Tropkillaz",
    "Dennis DJ", "Ludmilla", "Anitta", "MC Bin Laden"
  ],
  darkwave: [
    "Boy Harsher", "Lebanon Hanover", "She Past Away", "Cold Cave", "Drab Majesty",
    "Clan of Xymox", "The Soft Moon", "TR/ST", "Linea Aspera", "Minuit Machine",
    "Kontravoid", "Tempers", "Riki", "Selofan"
  ],
  coldwave: [
    "Kas Product", "Martin Dupont", "Asylum Party", "Little Nemo", "Trisomie 21",
    "Opera Multi Steel", "Charles De Goal", "Ruth", "Deux", "Norma Loy",
    "Xeno & Oaklander", "Automelodi", "Keluar", "Led Er Est"
  ],
  witch_house: [
    "Salem", "Crystal Castles", "oOoOO", "White Ring", "Pictureplane",
    "Balam Acab", "Holy Other", "Sidewalks and Skeletons", "Crim3s", "Mater Suspiria Vision",
    "Clams Casino", "Ritualz", "Fraunhofer Diffraction", "Axius Link"
  ],
  gabber: [
    "Angerfist", "Neophyte", "Rotterdam Terror Corps", "The Prophet", "DJ Paul Elstak",
    "Drokz", "Nosferatu", "Promo", "Tha Playah", "Evil Activities",
    "Ophidian", "Mad Dog", "Endymion", "Art of Fighters"
  ],
  hardcore: [
    "Angerfist", "Miss K8", "Mad Dog", "AniMe", "Nosferatu",
    "Ophidian", "Tha Playah", "Neophyte", "Evil Activities", "Promo",
    "Korsakoff", "Endymion", "Art of Fighters", "D-Fence"
  ],
  frenchcore: [
    "Dr. Peacock", "Sefa", "Billx", "Maissouille", "The Sickest Squad",
    "Radium", "Psiko", "Pattern J", "Le Bask", "Floxytek",
    "JKLL", "Remzcore", "Rooler", "Deathroar"
  ],
  speedcore: [
    "Noisekick", "Komprex", "The Destroyer", "Passenger of Shit", "m1dy",
    "Annoying Ringtone", "Kobaryo", "DJ Skinhead", "Hellfish", "The Speed Freak",
    "Gabba Front Berlin", "Qualkommando", "Imil", "Loffciamcore"
  ],
  rawstyle: [
    "Radical Redemption", "Warface", "Delete", "E-Force", "Rebelion",
    "D-Sturb", "Malice", "Rooler", "Delete", "Regain",
    "Crypsis", "Act of Rage", "Rejecta", "Mutilator"
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

function csvWrite(rows, headers) {
  return [
    headers.map(csvCell).join(","),
    ...rows.map((row) => headers.map((header) => csvCell(row[header] || "")).join(","))
  ].join("\n") + "\n";
}

function styleLabel(style = "") {
  return String(style || "").replace(/_/g, " ");
}

function existingKeys() {
  const artistKeys = new Set();
  const trackKeys = new Set();
  const files = fs.existsSync(DATA_DIR)
    ? fs.readdirSync(DATA_DIR).filter((file) => /^(artist_expansion_seeds|verified_track_expansion)_v\d+\.csv$/.test(file))
    : [];
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

async function fetchJson(url, retries = 2) {
  for (let attempt = 0; attempt <= retries; attempt += 1) {
    try {
      const response = await fetch(url, {
        headers: { "User-Agent": "SonicSearchPlayableCatalogExpansion/1.0" }
      });
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      return await response.json();
    } catch (error) {
      if (attempt === retries) {
        console.warn(`Failed ${url}: ${error.message}`);
        return null;
      }
      await new Promise((resolve) => setTimeout(resolve, 350 + attempt * 450));
    }
  }
  return null;
}

function artistSearchUrl(artist) {
  const url = new URL("https://api.deezer.com/search/artist");
  url.searchParams.set("q", artist);
  url.searchParams.set("limit", "8");
  return url;
}

function exactArtistMatch(expected, candidate) {
  const expectedKey = normalize(expected);
  const candidateKey = normalize(candidate);
  return expectedKey && candidateKey && (
    expectedKey === candidateKey ||
    candidateKey.includes(expectedKey) ||
    expectedKey.includes(candidateKey)
  );
}

function itemHasArtist(item, artist) {
  if (exactArtistMatch(artist, item?.artist?.name || "")) return true;
  const contributors = Array.isArray(item?.contributors) ? item.contributors : [];
  return contributors.some((contributor) => exactArtistMatch(artist, contributor?.name || ""));
}

function likelyUsableTrack(item, artist) {
  const title = String(item?.title_short || item?.title || "").trim();
  const preview = String(item?.preview || "").trim();
  const duration = Number(item?.duration || 0);
  if (!title || !preview.startsWith("http")) return false;
  if (!itemHasArtist(item, artist)) return false;
  if (duration && (duration < 60 || duration > 1200)) return false;
  const titleKey = normalize(title);
  const blocked = ["interview", "podcast", "continuous mix", "full album", "karaoke", "commentary", "skit"];
  if (blocked.some((term) => titleKey.includes(term))) return false;
  return true;
}

function makeArtistRow(style, artist) {
  const label = styleLabel(style);
  return {
    style,
    artist,
    country: "International",
    city: "",
    artist_bio: `${artist} entra na expansao v13 para aumentar faixas tocaveis em ${label} com artista real de cena e preview validavel.`,
    artist_genre: label,
    artist_profile_hint: `Seed v13 para ${label}; usado para gerar recomendacoes com preview_url real e reduzir faixas sem player.`,
    source: ARTIST_SOURCE_TAG
  };
}

function makeTrackRow(style, artist, item) {
  const song = String(item?.title_short || item?.title || "").trim();
  const album = String(item?.album?.title || "").trim() || "Deezer";
  const label = styleLabel(style);
  return {
    style,
    artist,
    song,
    label: album,
    bpm_exact: "",
    preview_url: String(item?.preview || "").trim(),
    release_date: String(item?.release_date || item?.album?.release_date || "").trim(),
    duration_sec: String(item?.duration || "").trim(),
    country: "International",
    city: "",
    artist_bio: `${artist} reforca ${label} na expansao v10 com faixa encontrada no Deezer e preview tocavel no site.`,
    artist_genre: label,
    artist_profile_hint: `Preview oficial Deezer com artista exato; priorizar quando o usuario pedir recomendacao tocavel em ${label}.`,
    source: TRACK_SOURCE_TAG,
    deezer_track_id: String(item?.id || ""),
    deezer_track_url: String(item?.link || ""),
    cover_art_url: String(item?.album?.cover_big || item?.album?.cover_medium || ""),
    youtube_track_url: `https://www.youtube.com/results?search_query=${encodeURIComponent(`${artist} ${song}`)}`,
    soundcloud_track_url: "",
    bandcamp_track_url: "",
    bandcamp_track_id: ""
  };
}

async function resolveDeezerArtist(artist) {
  const payload = await fetchJson(artistSearchUrl(artist));
  const candidates = Array.isArray(payload?.data) ? payload.data : [];
  return candidates.find((candidate) => exactArtistMatch(artist, candidate?.name || "")) || null;
}

async function collectArtistTracks(style, artist, seenTrackKeys) {
  const resolved = await resolveDeezerArtist(artist);
  if (!resolved?.id) return [];
  const payload = await fetchJson(`https://api.deezer.com/artist/${resolved.id}/top?limit=16`);
  const items = Array.isArray(payload?.data) ? payload.data : [];
  const rows = [];
  for (const item of items) {
    if (!likelyUsableTrack(item, artist)) continue;
    const song = String(item?.title_short || item?.title || "").trim();
    const key = `${normalize(artist)}::${normalize(song)}`;
    if (seenTrackKeys.has(key)) continue;
    seenTrackKeys.add(key);
    rows.push(makeTrackRow(style, artist, item));
    if (rows.length >= MAX_TRACKS_PER_ARTIST) break;
  }
  return rows;
}

async function main() {
  fs.mkdirSync(DATA_DIR, { recursive: true });
  const { artistKeys, trackKeys } = existingKeys();
  const artistRows = [];
  const trackRows = [];
  const seenArtistKeys = new Set(artistKeys);
  const seenTrackKeys = new Set(trackKeys);

  for (const [style, artists] of Object.entries(CURATED_STYLE_ARTISTS)) {
    let styleArtistCount = 0;
    let styleTrackCount = 0;
    const uniqueArtists = Array.from(new Set(artists.map((artist) => String(artist || "").trim()).filter(Boolean)));
    for (const artist of uniqueArtists) {
      const artistKey = `${normalize(style)}::${normalize(artist)}`;
      if (!seenArtistKeys.has(artistKey)) {
        seenArtistKeys.add(artistKey);
        artistRows.push(makeArtistRow(style, artist));
        styleArtistCount += 1;
      }
      const rows = await collectArtistTracks(style, artist, seenTrackKeys);
      trackRows.push(...rows);
      styleTrackCount += rows.length;
      await new Promise((resolve) => setTimeout(resolve, 90));
    }
    console.log(`${style.padEnd(20)} artists +${String(styleArtistCount).padStart(2)} tracks +${String(styleTrackCount).padStart(3)}`);
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
    "source"
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
    "deezer_track_id",
    "deezer_track_url",
    "cover_art_url",
    "youtube_track_url",
    "soundcloud_track_url",
    "bandcamp_track_url",
    "bandcamp_track_id"
  ]));

  console.log(`Wrote ${artistRows.length} artist rows to ${path.relative(ROOT, ARTIST_OUT)}`);
  console.log(`Wrote ${trackRows.length} track rows to ${path.relative(ROOT, TRACK_OUT)}`);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
