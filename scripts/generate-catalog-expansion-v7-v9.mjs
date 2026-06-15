import fs from "node:fs";
import path from "node:path";

const ROOT = process.cwd();
const DATA_DIR = path.join(ROOT, "data");
const ARTIST_OUT = path.join(DATA_DIR, "artist_expansion_seeds_v9.csv");
const TRACK_OUT = path.join(DATA_DIR, "verified_track_expansion_v7.csv");
const ARTIST_SOURCE_TAG = "artist_expansion_v9_curated_deezer";
const TRACK_SOURCE_TAG = "verified_deezer_expansion_v7_curated";

const CURATED_STYLE_ARTISTS = {
  ambient: [
    "Loscil", "A Winged Victory For The Sullen", "William Basinski", "Steve Roach", "GAS",
    "Fennesz", "Robert Rich", "Jonn Serrie", "Michael Stearns", "Brian Eno", "Biosphere",
    "Stars Of The Lid", "Carbon Based Lifeforms", "Tim Hecker", "Hiroshi Yoshimura",
    "Laraaji", "Kaitlyn Aurelia Smith", "Nils Frahm", "Max Richter", "Eluvium", "Grouper",
    "Ryuichi Sakamoto", "Hammock", "Aphex Twin", "Huerco S.", "bvdub", "Taylor Deupree",
    "Alva Noto", "Julianna Barwick", "Rafael Anton Irisarri", "Lawrence English",
    "Pan American", "Chihei Hatakeyama", "Celer", "Warmth", "KMRU", "Sarah Davachi",
    "Ben Frost", "Oneohtrix Point Never", "The Sight Below"
  ],
  dark_progressive: [
    "Tetrameth", "Sumiruna", "Tijah", "One Tasty Morsel", "Pspiralife", "Minimal Criminal",
    "Breger", "Electrypnose", "Radioactive.Cake", "Merkaba", "Kromagon", "Hypogeo",
    "Flembaz", "Sensient", "Shadow FX", "Hedonix", "Ben Rama", "Daleid", "Reflection",
    "Tomple2oon", "Eartheogen", "Occer", "Ryanosaurus", "Grouch", "Evil Oil Man",
    "Kliment", "Smilk", "SourOne", "Triforce", "Hellquist", "Ben Coda", "Terrafractyl",
    "Fungus Funk", "Sensient", "Perfect Stranger", "Grouch in Dub", "Krumelur", "Quanta"
  ],
  dark_psy: [
    "Derango", "Psykovsky", "Para Halu", "Kashyyyk", "Digital Talk", "Jelly Headz",
    "Blisargon Demogorgon", "Zik", "Megalopsy", "Atriohm", "Orestis", "Yaminahua",
    "Necropsycho", "Quasar", "Baphomet Engine", "N.O.M", "Primordial Ooze", "Gidra",
    "Abrahadabra", "Kerosene Club", "Kindzadza", "Osom", "Furious",
    "Dark Whisper", "Will O Wisp", "Mubali", "Cosmo", "Highko", "Silent Horror",
    "Encephalopaticys", "Alien Mental", "Claw", "Polyphonia", "Farebi Jalebi", "Arjuna"
  ],
  forest_psy: [
    "Arjuna", "Farebi Jalebi", "Southwild", "Onkel Dunkel", "Nargun", "Jangaramongara",
    "Tengri", "Ka-Sol", "Goch", "Trold", "Hutti Heita", "Kabayun", "Gaspard", "Procs",
    "Loke", "Krapul", "Archaic", "Aardvarkk", "Jikkenteki", "Derango", "Atriohm",
    "Jahbo", "Mubali", "Ulvae", "Nobot", "Confo", "Pantomiman",
    "Yggdrasil", "Enichkin", "Ocelot", "Ajja", "Flipknot", "Once Upon a Time",
    "Dohm", "Maramba", "Drury Nevil", "Dsompa"
  ],
  full_on: [
    "GMS", "Astrix", "Avalon", "Tristan", "Dickster", "Volcano", "Space Cat", "Waio",
    "Braincell", "Zyce", "Vertical Mode", "Deedrah", "1200 Micrograms", "Rinkadink",
    "Cosmosis", "Safi Connection", "Indra", "Vibe Tribe", "Audiotec", "Save The Robot",
    "Mad Tribe", "Killerwatts", "Laughing Buddha", "Djantrix", "Imaginarium", "DigiCult",
    "Faders", "Tropical Bleyage", "Relativ", "Materia", "Hypnoise", "X-NoiZe", "Xerox",
    "Earthspace", "Outsiders", "Electric Universe", "U-Recken", "Sonic Species",
    "Burn In Noise", "Earthling", "Symbolic", "Sesto Sento", "Talamasca", "Bizzare Contact",
    "Electro Sun", "Stryker", "Pixel", "Skazi"
  ],
  progressive_psy: [
    "Neelix", "Morten Granau", "Phaxe", "Querox", "Hi Profile", "Static Movement",
    "Ticon", "Vibrasphere", "Liquid Soul", "Zyce", "E-Clip", "Ovnimoon", "Egorythmia",
    "Audiomatic", "Day Din", "Maitika", "Ritmo", "Suntree", "Sideform", "Vertex",
    "Flegma", "Protonica", "Perfect Stranger", "Ace Ventura", "Interactive Noise",
    "Symphonix", "Captain Hook", "Atmos", "Gaudium", "Klopfgeister", "Fabio Fusco",
    "Ranji", "Berg", "Ilai", "Lyctum", "Sonic Entity", "Aerospace", "Motion Drive"
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

function csvWrite(rows, headers) {
  return [
    headers.map(csvCell).join(","),
    ...rows.map((row) => headers.map((header) => csvCell(row[header] || "")).join(","))
  ].join("\n") + "\n";
}

function styleLabel(style = "") {
  return String(style || "").replace(/_/g, " ");
}

async function fetchJson(url, retries = 2) {
  for (let attempt = 0; attempt <= retries; attempt += 1) {
    try {
      const response = await fetch(url, { headers: { "User-Agent": "MusicSommelierCuratedExpansion/1.0" } });
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      return await response.json();
    } catch (error) {
      if (attempt === retries) {
        console.warn(`Failed ${url}: ${error.message}`);
        return null;
      }
      await new Promise((resolve) => setTimeout(resolve, 250 + attempt * 300));
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
  return expectedKey && candidateKey && (expectedKey === candidateKey || candidateKey.includes(expectedKey) || expectedKey.includes(candidateKey));
}

function likelyUsableTrack(item) {
  const title = String(item?.title_short || item?.title || "").trim();
  const preview = String(item?.preview || "").trim();
  const duration = Number(item?.duration || 0);
  if (!title || !preview.startsWith("http")) return false;
  if (duration && (duration < 90 || duration > 1200)) return false;
  const titleKey = normalize(title);
  if (["interview", "podcast", "continuous mix", "full album", "karaoke"].some((term) => titleKey.includes(term))) return false;
  return true;
}

function makeArtistRow(style, artist) {
  const label = styleLabel(style);
  return {
    style,
    artist,
    country: "International",
    city: "",
    artist_bio: `${artist} entra na expansao v9 curada para reforcar descoberta confiavel em ${label}, com seed real ancorado por artista.`,
    artist_genre: label,
    artist_profile_hint: `Seed v9 curado para ${label}; usado em busca por top tracks de artista, Deezer, iTunes, SoundCloud e diversidade por swipe.`,
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
    artist_bio: `${artist} aparece na expansao v7 curada de ${label} com faixa encontrada por artista exato no Deezer e preview tocavel.`,
    artist_genre: label,
    artist_profile_hint: `Faixa Deezer ancorada em artista seed real para ${label}; priorizar quando houver preview oficial.`,
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
  const payload = await fetchJson(`https://api.deezer.com/artist/${resolved.id}/top?limit=8`);
  const items = Array.isArray(payload?.data) ? payload.data : [];
  const rows = [];
  for (const item of items) {
    if (!likelyUsableTrack(item)) continue;
    const song = String(item?.title_short || item?.title || "").trim();
    const key = `${normalize(artist)}::${normalize(song)}`;
    if (seenTrackKeys.has(key)) continue;
    seenTrackKeys.add(key);
    rows.push(makeTrackRow(style, artist, item));
    if (rows.length >= 3) break;
  }
  return rows;
}

async function main() {
  const artistRows = [];
  const trackRows = [];
  const seenArtists = new Set();
  const seenTrackKeys = new Set();

  for (const [style, artists] of Object.entries(CURATED_STYLE_ARTISTS)) {
    const styleArtists = Array.from(new Set(artists.map((artist) => String(artist || "").trim()).filter(Boolean)));
    styleArtists.forEach((artist) => {
      const key = `${style}::${normalize(artist)}`;
      if (seenArtists.has(key)) return;
      seenArtists.add(key);
      artistRows.push(makeArtistRow(style, artist));
    });

    let styleTrackCount = 0;
    for (const artist of styleArtists) {
      const rows = await collectArtistTracks(style, artist, seenTrackKeys);
      trackRows.push(...rows);
      styleTrackCount += rows.length;
      await new Promise((resolve) => setTimeout(resolve, 120));
    }
    console.log(`${style.padEnd(18)} artists ${String(styleArtists.length).padStart(2)} tracks ${String(styleTrackCount).padStart(3)}`);
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
