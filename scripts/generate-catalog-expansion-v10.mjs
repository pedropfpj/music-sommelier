import fs from "node:fs";
import path from "node:path";

const ROOT = process.cwd();
const DATA_DIR = path.join(ROOT, "data");
const ARTIST_OUT = path.join(DATA_DIR, "artist_expansion_seeds_v10.csv");
const TRACK_OUT = path.join(DATA_DIR, "verified_track_expansion_v8.csv");
const ARTIST_SOURCE_TAG = "artist_expansion_v10_scene_depth";
const TRACK_SOURCE_TAG = "verified_deezer_expansion_v8_scene_depth";

const CURATED_STYLE_ARTISTS = {
  minimal_techno: [
    "Robert Hood", "Daniel Bell", "Plastikman", "Ricardo Villalobos", "Zip",
    "Dimbiman", "Baby Ford", "Margaret Dygas", "Mike Ink", "Sutekh",
    "Mathew Jonson", "Jan Jelinek", "Steve Bug", "Cabanne", "Ion Ludwig",
    "Fumiya Tanaka", "Rhadoo", "Petre Inspirescu", "Priku", "Barac"
  ],
  melodic_techno: [
    "Stephan Bodzin", "Tale Of Us", "Mind Against", "Adriatique", "ARTBAT",
    "Agents Of Time", "Colyn", "Innellea", "Fideles", "Massano",
    "Mathame", "Recondite", "Patrice Baumel", "Rodriguez Jr.", "KAS:ST",
    "Kevin de Vries", "Yotto", "Joris Voorn", "Hunter/Game", "8Kays"
  ],
  industrial_techno: [
    "Ancient Methods", "Surgeon", "British Murder Boys", "Orphx", "Perc",
    "Paula Temple", "SNTS", "Vatican Shadow", "Blawan", "Ansome",
    "Headless Horseman", "Phase Fatale", "Tommy Four Seven", "I Hate Models", "UVB",
    "Scalameriya", "Ontal", "Schwefelgelb", "Codex Empire", "JK Flesh"
  ],
  dub_techno: [
    "Basic Channel", "Maurizio", "Rhythm & Sound", "Deepchord", "Echospace",
    "Rod Modell", "Fluxion", "Yagya", "Quantec", "Deadbeat",
    "Vladislav Delay", "Pole", "Monolake", "Porter Ricks", "bvdub",
    "cv313", "Intrusion", "STL", "Swayzak", "Andy Stott"
  ],
  psybient: [
    "Shpongle", "Carbon Based Lifeforms", "Solar Fields", "Bluetech", "Entheogenic",
    "Ott", "Younger Brother", "Kalya Scintilla", "Desert Dwellers", "Globular",
    "Kuba", "Asura", "Aes Dana", "H.U.V.A. Network", "Koan",
    "Kaya Project", "Dhamika", "Suduaya", "E-Mantra", "Androcell"
  ],
  trip_hop: [
    "Massive Attack", "Portishead", "Tricky", "DJ Shadow", "UNKLE",
    "Morcheeba", "Bonobo", "Thievery Corporation", "Nightmares On Wax", "Hooverphonic",
    "Lamb", "Sneaker Pimps", "Archive", "DJ Krush", "Emancipator",
    "Blockhead", "RJD2", "Wax Tailor", "Quantic", "Chinese Man"
  ],
  synthwave: [
    "Kavinsky", "Perturbator", "Carpenter Brut", "The Midnight", "Gunship",
    "Timecop1983", "FM-84", "Com Truise", "Mitch Murder", "Miami Nights 1984",
    "Dance With The Dead", "Lazerhawk", "Power Glove", "Waveshaper", "Droid Bishop",
    "Le Matos", "Robert Parker", "Scandroid", "Electric Youth", "College"
  ],
  frenchcore: [
    "Dr. Peacock", "Sefa", "Billx", "Maissouille", "The Sickest Squad",
    "Radium", "Psiko", "The Braindrillerz", "Pattern J", "Hyrule War",
    "Le Bask", "Floxytek", "Harry Potar", "JKLL", "Adrenokrome",
    "The Speed Freak", "Deathroar", "Alryk", "Remzcore", "Rooler"
  ],
  hardstyle: [
    "Headhunterz", "Wildstylez", "Noisecontrollers", "D-Block & S-te-Fan", "Brennan Heart",
    "Coone", "Atmozfears", "Frontliner", "Phuture Noize", "Sub Zero Project",
    "Ran-D", "B-Front", "Da Tweekaz", "Adaro", "Rebelion",
    "Warface", "D-Sturb", "Radical Redemption", "Frequencerz", "Keltek"
  ],
  breakcore: [
    "Venetian Snares", "Igorrr", "Ruby My Dear", "Bong-Ra", "Enduser",
    "Shitmat", "Doormouse", "Xanopticon", "Aaron Spectre", "The Flashbulb",
    "Squarepusher", "Aphex Twin", "Machine Girl", "goreshit", "Drumcorps",
    "FFF", "Alec Empire", "DJ Scotch Egg", "Otto von Schirach", "Christoph de Babalon"
  ],
  future_garage: [
    "Burial", "Joy Orbison", "Mount Kimbie", "Clubroot", "Pangaea",
    "Synkro", "Volor Flex", "Sorrow", "Vacant", "Phaeleh",
    "Submerse", "Bucky", "Direct", "Ghostek", "Zomby",
    "FaltyDL", "Sepalcure", "Scuba", "Koreless", "Jacques Greene"
  ],
  electro: [
    "Drexciya", "Aux 88", "Dopplereffekt", "The Hacker", "Anthony Rother",
    "Helena Hauff", "Umwelt", "DMX Krew", "Jensen Interceptor", "Sync 24",
    "Carl Finlow", "Morphology", "Plant43", "Silicon Scally", "Cignol",
    "Versalife", "E.R.P.", "Cygnus", "DJ Stingray", "Exzakt"
  ],
  goa_trance: [
    "Filteria", "E-Mantra", "Man With No Name", "Astral Projection", "Hallucinogen",
    "Pleiadians", "Khetzal", "Mindsphere", "Artifact303", "Goasia",
    "Crossing Mind", "Ephedra", "RA", "MFG", "Transwave",
    "Dimension 5", "Chi-A.D.", "Prana", "California Sunshine", "Juno Reactor"
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
  const files = fs.readdirSync(DATA_DIR).filter((file) => /^(artist_expansion_seeds|verified_track_expansion)_v\d+\.csv$/.test(file));
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
        headers: { "User-Agent": "MusicSommelierSceneDepthExpansion/1.0" }
      });
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      return await response.json();
    } catch (error) {
      if (attempt === retries) {
        console.warn(`Failed ${url}: ${error.message}`);
        return null;
      }
      await new Promise((resolve) => setTimeout(resolve, 300 + attempt * 350));
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

function likelyUsableTrack(item) {
  const title = String(item?.title_short || item?.title || "").trim();
  const preview = String(item?.preview || "").trim();
  const duration = Number(item?.duration || 0);
  if (!title || !preview.startsWith("http")) return false;
  if (duration && (duration < 75 || duration > 1200)) return false;
  const titleKey = normalize(title);
  if (["interview", "podcast", "continuous mix", "karaoke", "commentary"].some((term) => titleKey.includes(term))) return false;
  return true;
}

function makeArtistRow(style, artist) {
  const label = styleLabel(style);
  return {
    style,
    artist,
    country: "International",
    city: "",
    artist_bio: `${artist} entra na expansao v10 para aprofundar ${label} com artista real de cena e reduzir repeticao em onboarding, swipe e recomendacao.`,
    artist_genre: label,
    artist_profile_hint: `Seed v10 de profundidade para ${label}; usado como ancora de busca por top tracks tocaveis e descoberta cross-scene.`,
    source: ARTIST_SOURCE_TAG
  };
}

function makeTrackRow(style, artist, item) {
  const song = String(item?.title_short || item?.title || "").trim();
  const album = String(item?.album?.title || "").trim() || "Deezer";
  const query = encodeURIComponent(`${artist} ${song}`);
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
    artist_bio: `${artist} reforca ${label} na expansao v8 com faixa validada por artista no Deezer e preview tocavel.`,
    artist_genre: label,
    artist_profile_hint: `Top track Deezer com preview oficial; melhora busca tocavel e diversidade em ${label}.`,
    source: TRACK_SOURCE_TAG,
    youtube_track_url: `https://www.youtube.com/results?search_query=${query}`,
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
  const payload = await fetchJson(`https://api.deezer.com/artist/${resolved.id}/top?limit=10`);
  const items = Array.isArray(payload?.data) ? payload.data : [];
  const rows = [];
  for (const item of items) {
    if (!likelyUsableTrack(item)) continue;
    const song = String(item?.title_short || item?.title || "").trim();
    const key = `${normalize(artist)}::${normalize(song)}`;
    if (seenTrackKeys.has(key)) continue;
    seenTrackKeys.add(key);
    rows.push(makeTrackRow(style, artist, item));
    if (rows.length >= 4) break;
  }
  return rows;
}

async function main() {
  const { artistKeys, trackKeys } = existingKeys();
  const artistRows = [];
  const trackRows = [];
  const seenArtistKeys = new Set(artistKeys);
  const seenTrackKeys = new Set(trackKeys);

  for (const [style, artists] of Object.entries(CURATED_STYLE_ARTISTS)) {
    let styleArtistCount = 0;
    let styleTrackCount = 0;
    const styleArtists = Array.from(new Set(artists.map((artist) => String(artist || "").trim()).filter(Boolean)));
    for (const artist of styleArtists) {
      const artistKey = `${normalize(style)}::${normalize(artist)}`;
      if (!seenArtistKeys.has(artistKey)) {
        seenArtistKeys.add(artistKey);
        artistRows.push(makeArtistRow(style, artist));
        styleArtistCount += 1;
      }
      const rows = await collectArtistTracks(style, artist, seenTrackKeys);
      trackRows.push(...rows);
      styleTrackCount += rows.length;
      await new Promise((resolve) => setTimeout(resolve, 110));
    }
    console.log(`${style.padEnd(18)} artists +${String(styleArtistCount).padStart(2)} tracks +${String(styleTrackCount).padStart(3)}`);
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
