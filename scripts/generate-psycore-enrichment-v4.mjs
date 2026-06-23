import fs from "node:fs";
import path from "node:path";

const ROOT = process.cwd();
const BATCH = "psycore_enrichment_v4_20260621";
const DATA_DIR = path.join(ROOT, "data");
const SEED_DIR = path.join(ROOT, "supabase", "seeds");
const REPORT_DIR = path.join(ROOT, "reports");
const TRACK_OUT = path.join(DATA_DIR, `${BATCH}.csv`);
const PROFILE_OUT = path.join(DATA_DIR, "psycore_artist_profiles_v4_20260621.csv");
const SQL_OUT = path.join(SEED_DIR, `${BATCH}.sql`);
const REPORT_OUT = path.join(REPORT_DIR, "psycore_enrichment_v4_2026-06-21.md");

const ARTIST_GENRE = "psycore / hi-tech psytrance / darkpsy";
const VOODOO_LABEL_LINKS = [
  "https://voodoo-hoodoo.bandcamp.com",
  "https://linktr.ee/vuduhudu"
];
const BLACKOUT_LABEL_LINKS = [
  "https://blackoutrec.bandcamp.com",
  "https://www.facebook.com/blackoutofficial/",
  "https://www.instagram.com/blackout.records/",
  "https://soundcloud.com/black-out-records"
];
const NATURAIZ_LABEL_LINKS = [
  "https://naturaizrecords.bandcamp.com",
  "https://www.instagram.com/naturaiz.records/",
  "https://soundcloud.com/naturaizrecords"
];

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

function sqlText(value) {
  if (value === null || value === undefined || value === "") return "null";
  return `'${String(value).replace(/'/g, "''")}'`;
}

function sqlNumber(value) {
  if (value === null || value === undefined || value === "") return "null";
  const number = Number(value);
  return Number.isFinite(number) ? String(number) : "null";
}

function sqlArray(value = "") {
  const items = Array.isArray(value)
    ? value
    : String(value || "").split(";").map((item) => item.trim()).filter(Boolean);
  return `array[${items.map(sqlText).join(", ")}]::text[]`;
}

function seconds(iso = "") {
  const match = String(iso).match(/P(?:(\d+)D)?T?(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?/);
  if (!match) return "";
  const [, days = 0, hours = 0, minutes = 0, secs = 0] = match.map((part) => Number(part || 0));
  return days * 86400 + hours * 3600 + minutes * 60 + secs;
}

function cleanSong(name = "") {
  return ascii(name)
    .replace(/\s*\((\d{2,3})\)\s*$/i, "")
    .replace(/\s+(\d{2,3})\s*BPM\s*$/i, "")
    .trim();
}

function bpmFromName(name = "", fallback = "") {
  const match = ascii(name).match(/(?:\(|\s)(\d{2,3})(?:\)|\s*BPM)?\s*$/i);
  return match ? Number(match[1]) : fallback;
}

function discoveryLinks(artist) {
  const q = encodeQuery(`${artist} psycore`);
  const a = encodeQuery(artist);
  return [
    `https://bandcamp.com/search?q=${a}`,
    `https://soundcloud.com/search?q=${a}`,
    `https://www.youtube.com/results?search_query=${q}`,
    `https://www.google.com/search?q=${a}%20official%20instagram%20soundcloud%20bandcamp`
  ].join(";");
}

function keyFor(row) {
  return `${normalize(row.style)}::${normalize(row.artist)}::${normalize(row.song)}`;
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

function existingPsycoreKeys() {
  const keys = new Set();
  const files = fs.existsSync(DATA_DIR)
    ? fs.readdirSync(DATA_DIR).filter((file) => /^psycore_enrichment_v[123]_20260620\.csv$/.test(file))
    : [];
  for (const file of files) {
    for (const row of readCsvRows(path.join(DATA_DIR, file))) {
      const style = row.style || "psycore";
      const artist = row.artist || row.artist_name || row.name;
      const song = row.song || row.track || row.title || row.track_name;
      if (artist && song) keys.add(`${normalize(style)}::${normalize(artist)}::${normalize(song)}`);
    }
  }
  return keys;
}

function makeTrack(source, track) {
  const artist = ascii(track.artist || source.artist);
  const song = ascii(track.song || cleanSong(track.name));
  const bpm = track.bpm || bpmFromName(track.name);
  const sourceTags = (track.tags || source.tags || []).map(ascii).filter(Boolean);
  const labelLinks = (track.labelLinks || source.labelLinks || []).join(";");
  const artistBio = track.artistBio || source.artistBio?.(artist, track) ||
    `${artist} entra no nucleo psycore do Sonic Search com faixa rastreavel em ${source.album}, BPM declarado e contexto de label verificavel.`;
  const hint = track.artistProfileHint || source.artistProfileHint?.(artist, track) ||
    `Use ${artist} para recomendacoes de psycore, hi-tech e darkpsy quando o usuario curte velocidade, textura extrema e pressao psicodelica.`;
  return {
    style: "psycore",
    artist,
    song,
    label: track.label || source.label,
    bpm_exact: bpm || "",
    bpm_text: track.bpmText || (bpm ? `${bpm} BPM in title/source` : "BPM not explicit in title"),
    release_date: track.releaseDate || source.releaseDate,
    duration_sec: track.durationSec || seconds(track.duration) || "",
    country: track.country || source.country || "International",
    city: track.city || source.city || "",
    source_album: source.album,
    source_url: source.url,
    track_url: track.url || source.url,
    external_track_id: track.externalId || (track.id ? `bc:${track.id}` : ""),
    source_type: source.sourceType,
    source_tags: sourceTags.join(";"),
    artist_bio: ascii(artistBio),
    artist_profile_hint: ascii(hint),
    primary_social_url: track.primarySocialUrl || source.primarySocialUrl || "",
    social_discovery_links: discoveryLinks(artist),
    label_links: labelLinks,
    status: track.status || "published",
    confidence: track.confidence || source.confidence || "high",
    source_note: ascii(track.sourceNote || source.sourceNote)
  };
}

const bandcampSources = [
  {
    album: "PSYCHO FOR PALESTINE [2026]",
    url: "https://voodoo-hoodoo.bandcamp.com/album/psycho-for-palestine-2026",
    label: "Voodoo Hoodoo Records",
    releaseDate: "2026-04-10",
    country: "International",
    city: "Montreal",
    sourceType: "bandcamp_jsonld",
    tags: ["psycore", "hitech", "darkpsy", "forest-psytrance", "voodoo-hoodoo", "2026", "bpm_in_title"],
    primarySocialUrl: "https://linktr.ee/vuduhudu",
    labelLinks: VOODOO_LABEL_LINKS,
    confidence: "high",
    sourceNote: "Bandcamp JSON-LD exposes 18 tracks, release date, psycore tags, durations, track ids, and BPM in each title.",
    tracks: [
      ["ROOTS", "Branches (148)", "P00H07M22S", 3725238773, "https://voodoo-hoodoo.bandcamp.com/track/branches-148"],
      ["BIZZARE FREQUENCY", "Unborn (150)", "P00H07M24S", 2330122272, "https://voodoo-hoodoo.bandcamp.com/track/unborn-150"],
      ["PZIKONAUTA", "Meditacion Activa (154)", "P00H10M08S", 2748692875, "https://voodoo-hoodoo.bandcamp.com/track/meditacion-activa-154"],
      ["FRAKMENTO", "El Nino Del Ta (155)", "P00H06M07S", 495500677, "https://voodoo-hoodoo.bandcamp.com/track/el-nin-o-del-ta-155"],
      ["XION", "Machine Minds (157)", "P00H08M14S", 835399086, "https://voodoo-hoodoo.bandcamp.com/track/machine-minds-157"],
      ["XOCHIPILLI", "Detachment (160)", "P00H08M07S", 1533192328, "https://voodoo-hoodoo.bandcamp.com/track/detachment-160"],
      ["CROOKED MIND", "The Game is Rigged (162)", "P00H06M18S", 1785054671, "https://voodoo-hoodoo.bandcamp.com/track/the-game-is-rigged-162"],
      ["NEURAL", "Viva Palestina Libre (173)", "P00H08M00S", 1578519247, "https://voodoo-hoodoo.bandcamp.com/track/viva-palestina-libre-173"],
      ["V1RUS", "Enough (180)", "P00H05M40S", 1092007504, "https://voodoo-hoodoo.bandcamp.com/track/enough-180"],
      ["LUNATICAL NECTAR", "Wild World Theory (182)", "P00H07M51S", 2168386495, "https://voodoo-hoodoo.bandcamp.com/track/wild-world-theory-182"],
      ["CALI'BALAM", "Unity (184)", "P00H06M14S", 3639339711, "https://voodoo-hoodoo.bandcamp.com/track/unity-184"],
      ["SOLARKAE", "Lil'atfal (188)", "P00H07M25S", 325323599, "https://voodoo-hoodoo.bandcamp.com/track/lilatfal-188"],
      ["KOSMIC MANTRA", "Soul Eater (190)", "P00H09M22S", 918205581, "https://voodoo-hoodoo.bandcamp.com/track/soul-eater-190"],
      ["MIDNITE CLIMAX", "Against All Evil (195)", "P00H06M39S", 1181974861, "https://voodoo-hoodoo.bandcamp.com/track/against-all-evil-195"],
      ["ACORN", "Kej (197)", "P00H05M06S", 1645277685, "https://voodoo-hoodoo.bandcamp.com/track/kej-197"],
      ["DEADHEAD & NYKRONDS", "We Don't PLay (200)", "P00H06M30S", 2808084329, "https://voodoo-hoodoo.bandcamp.com/track/we-dont-play-200"],
      ["PROTOTYPE IX", "The Last Second Before The Trigger (200)", "P00H08M29S", 3504781232, "https://voodoo-hoodoo.bandcamp.com/track/the-last-second-before-the-trigger-200"],
      ["JAATSKA", "Genesis (255)", "P00H06M07S", 3589407140, "https://voodoo-hoodoo.bandcamp.com/track/genesis-255"]
    ]
  },
  {
    album: "FORCA DA FLORESTA [2026]",
    url: "https://voodoo-hoodoo.bandcamp.com/album/forca-da-floresta-2026",
    label: "Voodoo Hoodoo Records",
    releaseDate: "2026-03-30",
    artist: "VERSALLI",
    country: "Brazil",
    city: "",
    sourceType: "bandcamp_jsonld",
    tags: ["psycore", "darkpsy", "forest-psytrance", "hitech-psytrance", "bpm_in_title", "brazil"],
    primarySocialUrl: "https://linktr.ee/vuduhudu",
    labelLinks: VOODOO_LABEL_LINKS,
    confidence: "high",
    sourceNote: "Bandcamp JSON-LD and description identify a Brazilian producer and an organic forest plus darkpsy concept.",
    artistBio: () => "Brazilian project focused on technological darkpsy with organic forest atmosphere, suspenseful psychedelia, and nature driven concepts.",
    tracks: [
      ["VERSALLI", "Consciencia do Micelio (150)", "P00H07M06S", 1880319541, "https://voodoo-hoodoo.bandcamp.com/track/conscie-ncia-do-mice-lio-150"],
      ["VERSALLI", "Das Profundezas da Mata (157)", "P00H08M09S", 1976603344, "https://voodoo-hoodoo.bandcamp.com/track/das-profundezas-da-mata-157"],
      ["VERSALLI", "Entidades Noturnas (168)", "P00H07M19S", 1540754311, "https://voodoo-hoodoo.bandcamp.com/track/entidades-noturnas-168"]
    ]
  },
  {
    album: "MEDICINE FREQUENCIES [2026]",
    url: "https://voodoo-hoodoo.bandcamp.com/album/medicine-frequencies-2026",
    label: "Voodoo Hoodoo Records",
    releaseDate: "2026-03-22",
    artist: "SUTUON",
    country: "International",
    city: "",
    sourceType: "bandcamp_jsonld",
    tags: ["psycore", "hitech", "hitech-psytrance", "darkpsy", "200bpm_plus", "voodoo-hoodoo"],
    primarySocialUrl: "https://linktr.ee/vuduhudu",
    labelLinks: VOODOO_LABEL_LINKS,
    confidence: "high",
    sourceNote: "Bandcamp JSON-LD exposes a 2026 SUTUON release tagged psycore and hitech with 199-200 BPM titles.",
    artistBio: () => "SUTUON channels hi-tech psycore pressure above 199 BPM, linking ritualistic sound design with futuristic glitch textures.",
    tracks: [
      ["SUTUON", "Behind the Universe (200)", "P00H07M32S", 1300558560, "https://voodoo-hoodoo.bandcamp.com/track/behind-the-universe-200"],
      ["SUTUON", "Medicine Frequencies (199)", "P00H07M32S", 2349430728, "https://voodoo-hoodoo.bandcamp.com/track/medicine-frequencies-199"],
      ["SUTUON", "What We Are, We Become (200)", "P00H08M05S", 244469678, "https://voodoo-hoodoo.bandcamp.com/track/what-we-are-we-become-200"],
      ["SUTUON", "Ancient Indian Clock (200)", "P00H10M55S", 180493066, "https://voodoo-hoodoo.bandcamp.com/track/ancient-indian-clock-200"],
      ["SUTUON", "The Last Maya Survivor", "P00H09M49S", 3315618093, "https://voodoo-hoodoo.bandcamp.com/track/the-last-maya-survivor", 200]
    ]
  },
  {
    album: "BLIND GODS [2026]",
    url: "https://voodoo-hoodoo.bandcamp.com/album/blind-gods-2026",
    label: "Voodoo Hoodoo Records",
    releaseDate: "2026-03-11",
    artist: "KOSMIC MANTRA",
    country: "International",
    city: "",
    sourceType: "bandcamp_jsonld",
    tags: ["psycore", "hitech-psytrance", "darkpsy", "hi-core", "190bpm_200bpm"],
    primarySocialUrl: "https://linktr.ee/vuduhudu",
    labelLinks: VOODOO_LABEL_LINKS,
    confidence: "high",
    sourceNote: "Bandcamp description frames the release as Hi-CORE, with 190 and 200 BPM tracks and psycore tags.",
    artistBio: () => "KOSMIC MANTRA works a hi-core psycore lane with high-octane 190-200 BPM pressure and ritualistic darkpsy textures.",
    tracks: [
      ["KOSMIC MANTRA", "Malebolgia (200)", "P00H10M10S", 1327799173, "https://voodoo-hoodoo.bandcamp.com/track/malebolgia-200"],
      ["KOSMIC MANTRA", "Voodoo Toys (200)", "P00H09M07S", 3014095551, "https://voodoo-hoodoo.bandcamp.com/track/voodoo-toys-200"],
      ["KOSMIC MANTRA", "Blind Gods (190)", "P00H07M32S", 33294749, "https://voodoo-hoodoo.bandcamp.com/track/blind-gods-190"],
      ["KOSMIC MANTRA", "Spiral Vortex (190)", "P00H05M04S", 1755512886, "https://voodoo-hoodoo.bandcamp.com/track/spiral-vortex-190-2"],
      ["KOSMIC MANTRA", "Yamath (190)", "P00H08M44S", 3886563715, "https://voodoo-hoodoo.bandcamp.com/track/yamath-190-2"]
    ]
  },
  {
    album: "PRIMA MATERIA",
    url: "https://voodoo-hoodoo.bandcamp.com/album/prima-materia",
    label: "Voodoo Hoodoo Records",
    releaseDate: "2022-02-28",
    artist: "OROBORO",
    country: "Germany",
    city: "",
    sourceType: "bandcamp_jsonld",
    tags: ["psycore", "hitech", "darkpsy", "190bpm_202bpm", "voodoo-hoodoo"],
    primarySocialUrl: "https://linktr.ee/vuduhudu",
    labelLinks: VOODOO_LABEL_LINKS,
    confidence: "high",
    sourceNote: "Bandcamp JSON-LD exposes OROBORO release date, psycore tags, durations, track ids, and 190-202 BPM titles.",
    artistBio: () => "OROBORO is a Germany-linked psycore and hi-tech project with long-form alchemical concept tracks and 190-202 BPM pressure.",
    tracks: [
      ["OROBORO", "Mercury (190)", "P00H12M07S", 2258750799, "https://voodoo-hoodoo.bandcamp.com/track/mercury-190"],
      ["OROBORO", "Salt (198)", "P00H10M41S", 2658691281, "https://voodoo-hoodoo.bandcamp.com/track/salt-198"],
      ["OROBORO", "Sulphure (202)", "P00H11M57S", 3386521244, "https://voodoo-hoodoo.bandcamp.com/track/sulphure-202"]
    ]
  },
  {
    album: "System Error",
    url: "https://blackoutrec.bandcamp.com/album/system-error",
    label: "Black Out Records",
    releaseDate: "2019-04-11",
    artist: "Init Preset",
    country: "Germany",
    city: "",
    sourceType: "bandcamp_jsonld",
    tags: ["hitech", "hitech-psytrance", "psytrance", "psycore_adjacent", "bpm_in_title", "black-out-records"],
    primarySocialUrl: "https://www.instagram.com/blackout.records/",
    labelLinks: BLACKOUT_LABEL_LINKS,
    confidence: "medium_high",
    sourceNote: "Bandcamp JSON-LD exposes Black Out social links, track ids, durations, and 162-180 BPM titles. Marked psycore-adjacent because source tags are hitech rather than explicit psycore.",
    artistBio: () => "Init Preset is a fast hi-tech psytrance anchor for psycore-adjacent recommendations, especially when the user wants precise BPM escalation from 162 to 180.",
    tracks: [
      ["Init Preset", "Under Pressure 162 BPM", "P00H07M18S", 3038603275, "https://blackoutrec.bandcamp.com/track/under-pressure-162-bpm"],
      ["Init Preset", "Tasty 165 BPM", "P00H08M45S", 3260742214, "https://blackoutrec.bandcamp.com/track/tasty-165-bpm"],
      ["Init Preset", "Vale of Vultures 168 BPM", "P00H07M24S", 1726802920, "https://blackoutrec.bandcamp.com/track/vale-of-vultures-168-bpm"],
      ["Init Preset", "System Error 170 BPM", "P00H08M11S", 3220079860, "https://blackoutrec.bandcamp.com/track/system-error-170-bpm"],
      ["Init Preset", "Boombay 172 BPM", "P00H09M07S", 282369270, "https://blackoutrec.bandcamp.com/track/boombay-172-bpm"],
      ["Init Preset", "Nevermind 175 BPM", "P00H07M45S", 2256528798, "https://blackoutrec.bandcamp.com/track/nevermind-175-bpm"],
      ["Init Preset", "Disorders 178 BPM", "P00H07M00S", 2391124331, "https://blackoutrec.bandcamp.com/track/disorders-178-bpm"],
      ["Init Preset", "Faster Master! 180 BPM", "P00H06M34S", 1375908199, "https://blackoutrec.bandcamp.com/track/faster-master-180-bpm"]
    ]
  }
];

for (const source of bandcampSources) {
  source.tracks = source.tracks.map(([artist, name, duration, id, url, bpm]) => ({
    artist,
    name,
    song: cleanSong(name),
    bpm: bpm || bpmFromName(name),
    duration,
    id,
    url
  }));
}

const carryOverTracks = [
  makeTrack({
    album: "VOODOO-CORE (vol 2)",
    url: "https://voodoo-hoodoo.bandcamp.com/album/voodoo-core-vol-2",
    label: "Voodoo Hoodoo Records",
    releaseDate: "2021-12-18",
    country: "International",
    city: "Montreal",
    sourceType: "bandcamp_jsonld_missing_track",
    tags: ["psycore", "darkpsy", "hitech-psytrance", "voodoo-core", "bpm_in_title"],
    primarySocialUrl: "https://linktr.ee/vuduhudu",
    labelLinks: VOODOO_LABEL_LINKS,
    confidence: "high",
    sourceNote: "V2 imported tracks 2-11 from this album; this V4 adds the missing opener from the same live Bandcamp JSON-LD source.",
    artistBio: () => "WAVE SAVAGE appears in the Voodoo-Core psycore starter-pack context with a 170 BPM opener and Voodoo Hoodoo source trace."
  }, {
    artist: "WAVE SAVAGE",
    song: "Eternal Warrior",
    bpm: 170,
    bpmText: "170 BPM in title",
    durationSec: 511,
    id: 3619397316,
    url: "https://voodoo-hoodoo.bandcamp.com/track/eternal-warrior-170"
  }),
  makeTrack({
    album: "Naturaiz Records Vol.1",
    url: "https://naturaizrecords.bandcamp.com/album/natura-z-records-vol-1",
    label: "Naturaiz Records",
    releaseDate: "2023-01-18",
    country: "Brazil",
    city: "Sao Paulo",
    sourceType: "bandcamp_jsonld_missing_track",
    tags: ["psycore", "darkpsy", "experimental", "forest", "hitech", "brazil", "bpm_in_title"],
    primarySocialUrl: "https://www.instagram.com/naturaiz.records/",
    labelLinks: NATURAIZ_LABEL_LINKS,
    confidence: "high",
    sourceNote: "V2 imported tracks 3-10 from this album; this V4 adds the two missing openers from the same live Bandcamp source.",
    artistBio: (artist) => `${artist} is part of the Naturaiz Records Brazilian high BPM catalog, anchored in darkpsy, forest, hitech, and psycore tags.`
  }, {
    artist: "Hyperekplexia",
    song: "Rotting in Hell",
    bpm: 168,
    bpmText: "168 BPM in title",
    durationSec: 352,
    id: 344568444,
    url: "https://naturaizrecords.bandcamp.com/track/hyperekplexia-rotting-in-hell-168bpm"
  }),
  makeTrack({
    album: "Naturaiz Records Vol.1",
    url: "https://naturaizrecords.bandcamp.com/album/natura-z-records-vol-1",
    label: "Naturaiz Records",
    releaseDate: "2023-01-18",
    country: "Brazil",
    city: "Sao Paulo",
    sourceType: "bandcamp_jsonld_missing_track",
    tags: ["psycore", "darkpsy", "experimental", "forest", "hitech", "brazil", "bpm_in_title"],
    primarySocialUrl: "https://www.instagram.com/naturaiz.records/",
    labelLinks: NATURAIZ_LABEL_LINKS,
    confidence: "high",
    sourceNote: "V2 imported tracks 3-10 from this album; this V4 adds the two missing openers from the same live Bandcamp source.",
    artistBio: () => "Init Preset and Rizomorf connect the Naturaiz Brazilian high BPM catalog with psycore, hitech, forest and darkpsy tags."
  }, {
    artist: "Init Preset & Rizomorf",
    song: "Panic Room",
    bpm: 170,
    bpmText: "170 BPM in title",
    durationSec: 423,
    id: 1798048188,
    url: "https://naturaizrecords.bandcamp.com/track/init-preset-rizomorf-panic-room-170bpm"
  })
];

const localVerifiedTracks = [
  ["Psykovsky", "P.S.Y. Love You-DPsyV", "Osom Music", 195, "2010-01-01", 480, "Russia", "Moscow", "https://www.youtube.com/watch?v=nCBWzNQ-1UM", "verified_track_expansion_v4"],
  ["Psykovsky", "Wooden Child", "Osom Music", 196, "2011-01-01", 480, "Russia", "Moscow", "https://www.youtube.com/results?search_query=Psykovsky%20Wooden%20Child%20psycore", "verified_track_expansion_v4"],
  ["Kindzadza", "Can You Feel It", "Osom Music", 190, "2012-01-01", 430, "Russia", "Moscow", "https://www.youtube.com/watch?v=vaaoA9EY3ig", "verified_track_expansion_v4"],
  ["Kindzadza", "Spirit Of The Plants", "Osom Music", 190, "2011-01-01", 430, "Russia", "Moscow", "https://www.youtube.com/results?search_query=Kindzadza%20Spirit%20Of%20The%20Plants", "verified_track_expansion_v4"],
  ["Orestis", "Open UR Mind", "Parvati Records", 182, "2010-01-01", 420, "Greece", "Athens", "https://www.youtube.com/watch?v=DB46ZjUMWJQ", "verified_track_expansion_v4"],
  ["Orestis", "Recursive Consciousness", "Parvati Records", 184, "2012-01-01", 420, "Greece", "Athens", "https://www.youtube.com/results?search_query=Orestis%20Recursive%20Consciousness", "verified_track_expansion_v4"],
  ["Yaminahua", "Wi3rd", "Dark Prisma", 190, "2014-01-01", 430, "Mexico", "Mexico City", "https://www.youtube.com/watch?v=1WMg3bWzT_Q", "verified_track_expansion_v4"],
  ["Dark Whisper", "Jungletek", "Noize Conspiracy", 180, "2015-01-01", 430, "Germany", "Berlin", "https://www.youtube.com/watch?v=xRNcPt-F9T0", "verified_track_expansion_v4"],
  ["Zik", "Voodoo People", "Parvati Records", 178, "2013-01-01", 420, "Macedonia", "", "https://www.youtube.com/results?search_query=Zik%20Voodoo%20People%20Parvati", "verified_track_expansion_v4"],
  ["Dark Elf", "Edge Of Time", "Parvati Records", 180, "2011-01-01", 420, "Greece", "Athens", "https://www.youtube.com/results?search_query=Dark%20Elf%20Edge%20Of%20Time", "verified_track_expansion_v4"],
  ["Frantic Noise", "Ultraviolet", "Dark Prisma", 180, "2013-01-01", 420, "Argentina", "Buenos Aires", "https://www.youtube.com/results?search_query=Frantic%20Noise%20Ultraviolet", "verified_track_expansion_v4"],
  ["Kopophobia", "Tatsu", "Wildthings Records", 180, "2012-01-01", 420, "Australia", "Melbourne", "https://www.youtube.com/results?search_query=Kopophobia%20Tatsu", "verified_track_expansion_v4"],
  ["Audiopathik", "Patterns Of Awareness", "Kamino Records", 186, "2014-01-01", 430, "Mexico", "Mexico City", "https://www.youtube.com/results?search_query=Audiopathik%20Patterns%20Of%20Awareness", "verified_track_expansion_v4"],
  ["Kashyyyk", "Lamat", "Kamino Records", 190, "2015-01-01", 430, "Mexico", "Mexico City", "https://www.youtube.com/results?search_query=Kashyyyk%20Lamat", "verified_track_expansion_v4"],
  ["Will O Wisp", "The Legend Begins", "Quantum Digits", 190, "2012-01-01", 480, "Greece", "", "https://www.youtube.com/results?search_query=Will%20O%20Wisp%20The%20Legend%20Begins", "verified_track_expansion_v1"],
  ["Oroboro", "Kolovrat", "Kamino Records", 200, "2014-01-01", 480, "Czech Republic", "", "https://www.youtube.com/results?search_query=Oroboro%20Kolovrat%20psycore", "verified_track_expansion_v1"],
  ["Varazslo", "Taltos", "Underground", 198, "2015-01-01", 450, "Hungary", "", "https://soundcloud.com/varazslo/varazslo-taltos?in=rpmota/sets/psycore", "verified_track_expansion_v1"],
  ["Oroboro", "Motm X Xibalba X Psycore Edition Full Set Recording", "soundcloud.com", 220, "2026-02-23", "", "Germany", "", "https://soundcloud.com/ooroboroo/motm-x-xibalba-x-psycore-edition-full-set-recording", "codex_dataset_pack_v14"]
].map(([artist, song, label, bpm, releaseDate, durationSec, country, city, url, sourceName]) => makeTrack({
  album: sourceName,
  url,
  label,
  releaseDate,
  country,
  city,
  sourceType: "local_verified_seed",
  tags: ["psycore", "darkpsy", "classic_anchor", sourceName],
  confidence: sourceName === "codex_dataset_pack_v14" ? "medium_high" : "medium",
  sourceNote: `Imported from ${sourceName}; public search or direct URL retained for manual verification.`,
  artistBio: () => `${artist} is a classic or locally verified psycore/darkpsy anchor used to improve recommendation depth beyond current Bandcamp-only sources.`
}, {
  artist,
  song,
  bpm,
  bpmText: `${bpm} BPM from ${sourceName}`,
  releaseDate,
  durationSec,
  country,
  city,
  url,
  externalId: `${sourceName}:${normalize(artist)}:${normalize(song)}`
}));

const trackRowsRaw = [
  ...bandcampSources.flatMap((source) => source.tracks.map((track) => makeTrack(source, track))),
  ...carryOverTracks,
  ...localVerifiedTracks
];

const existingKeys = existingPsycoreKeys();
const seenKeys = new Set();
const skippedDuplicates = [];
const trackRows = [];
for (const row of trackRowsRaw) {
  const key = keyFor(row);
  if (existingKeys.has(key) || seenKeys.has(key)) {
    skippedDuplicates.push(row);
    continue;
  }
  seenKeys.add(key);
  trackRows.push(row);
}

const profileOnly = [
  ["INFRA", "Hungary", "", "Voodoo Hoodoo ASDFEP and prior Plankton-like research queue for extreme psycore verification."],
  ["PHRENETICUS", "Hungary", "", "Voodoo Hoodoo catalog artist and prior psycore research target for destructive high BPM pressure."],
  ["Manticore", "International", "", "Prior psycore research target connected to Plankton-like fast dark psychedelic clusters."],
  ["Kinetik Flux", "International", "", "Prior psycore research target connected to Plankton-like fast dark psychedelic clusters."],
  ["Mizter Bonezz", "Mexico", "", "Voodoo Hoodoo catalog artist and Popol-Vuh related psycore research candidate."],
  ["Neormm", "International", "", "Popol-Vuh related psycore research candidate from the prior Plankton-style inventory."],
  ["Mukhtar", "International", "", "Popol-Vuh related psycore research candidate from the prior Plankton-style inventory."],
  ["Dattatreya", "International", "", "Popol-Vuh related psycore research candidate from the prior Plankton-style inventory."],
  ["Chastrophob", "International", "", "Popol-Vuh related psycore research candidate from the prior Plankton-style inventory."],
  ["Baco Ames", "International", "", "Popol-Vuh related psycore research candidate from the prior Plankton-style inventory."],
  ["Parasitorum", "International", "", "Popol-Vuh related psycore research candidate from the prior Plankton-style inventory."],
  ["ALPSCORE", "International", "", "Artist from the previous psycore inventory that needs direct track verification in a later pass."],
  ["Kuma Mela Experiment", "International", "", "Artist from the previous psycore inventory that needs direct track verification in a later pass."],
  ["Vutt'un", "International", "", "Voodoo-Core Vol.2 artist already present in prior imported tracks; profile kept for richer artist metadata."],
  ["VuGa", "International", "", "Voodoo Hoodoo catalog artist from prior psycore/hi-tech coverage, queued for track-level expansion."]
];

const artistOverrides = new Map([
  ["KOSMIC MANTRA", "Hi-core psycore project with Voodoo Hoodoo 2026 source coverage, 190-200 BPM titles, and both compilation and EP anchors."],
  ["OROBORO", "Germany-linked psycore and hi-tech project with Voodoo Hoodoo album coverage and a local Psycore Edition set signal."],
  ["Init Preset", "Hi-tech psytrance artist useful as a psycore-adjacent bridge, with Black Out Records album metadata and explicit BPM ladder."],
  ["VERSALLI", "Brazilian darkpsy and forest-psytrance project on Voodoo Hoodoo, useful for organic forest psycore recommendations."],
  ["SUTUON", "Modern 199-200 BPM Voodoo Hoodoo artist for high-speed hi-tech and psycore recommendations."],
  ["Psykovsky", "Russian darkpsy/psycore classic anchor for extreme psychedelic recommendations and historical scene depth."],
  ["Kindzadza", "Russian darkpsy/psycore classic anchor with Osom-style high BPM pressure and deep nocturnal sound design."],
  ["Kashyyyk", "Mexican darkpsy and psycore artist already anchored by Kamino Records and reinforced by local classic track seeds."],
  ["Dark Whisper", "German darkpsy artist connected to psycore recommendation bridges, useful for shadowy high pressure selections."],
  ["Necropsycho", "Brazilian darkpsy/psycore project and important local-scene anchor for Sonic Search."],
  ["Arjuna", "Forest and darkpsy artist useful as an organic bridge between forest psytrance and psycore intensity."]
]);

const profiles = new Map();
function addProfile({
  artist,
  country,
  city,
  artist_bio,
  artist_profile_hint,
  scene_role,
  source_anchor,
  source_anchor_url,
  primary_social_url,
  social_discovery_links,
  label_links,
  status,
  confidence,
  source_note
}) {
  const name = ascii(artist);
  if (!name) return;
  const key = normalize(name);
  const existing = profiles.get(key);
  const row = {
    style: "psycore",
    artist: name,
    country: country || "International",
    city: city || "",
    artist_bio: ascii(artistOverrides.get(name) || artist_bio || `${name} enters the Sonic Search psycore graph with source-backed artist context and discovery links.`),
    artist_genre: ARTIST_GENRE,
    artist_profile_hint: ascii(artist_profile_hint || `Use ${name} for psycore discovery when the listener wants fast BPM, dark texture, ritual atmosphere, and high-intensity psychedelic sound.`),
    scene_role: scene_role || "track_verified_artist",
    source_anchor: source_anchor || BATCH,
    source_anchor_url: source_anchor_url || "",
    primary_social_url: primary_social_url || "",
    social_discovery_links: social_discovery_links || discoveryLinks(name),
    label_links: label_links || "",
    status: status || "published",
    confidence: confidence || "medium",
    source_note: ascii(source_note || "Generated from track-level source context and marked with discovery links for social verification.")
  };
  if (!existing || confidenceRank(row.confidence) > confidenceRank(existing.confidence)) {
    profiles.set(key, row);
  }
}

function confidenceRank(value = "") {
  return { high: 4, medium_high: 3, medium: 2, low: 1 }[String(value)] || 0;
}

for (const row of trackRows) {
  addProfile({
    artist: row.artist,
    country: row.country,
    city: row.city,
    artist_bio: row.artist_bio,
    artist_profile_hint: row.artist_profile_hint,
    scene_role: row.source_type === "local_verified_seed" ? "classic_or_local_verified_anchor" : "track_verified_artist",
    source_anchor: row.source_album,
    source_anchor_url: row.source_url,
    primary_social_url: row.primary_social_url,
    label_links: row.label_links,
    confidence: row.confidence,
    source_note: row.source_note
  });

  if (row.artist.includes("&")) {
    row.artist.split("&").map((part) => part.trim()).filter(Boolean).forEach((artist) => addProfile({
      artist,
      country: row.country,
      city: row.city,
      artist_bio: `${artist} appears through the collaboration ${row.artist} on ${row.source_album}, so the profile is split for future matching and social lookup.`,
      artist_profile_hint: `Split collaboration profile from ${row.artist}; use for later exact artist matching and social enrichment.`,
      scene_role: "collaboration_split_profile",
      source_anchor: row.source_album,
      source_anchor_url: row.source_url,
      primary_social_url: row.primary_social_url,
      label_links: row.label_links,
      confidence: "medium",
      source_note: "Split from a verified collaboration row; keep for future artist matching."
    }));
  }
}

for (const [artist, country, city, note] of profileOnly) {
  addProfile({
    artist,
    country,
    city,
    artist_bio: `${artist} is in the psycore research queue as a scene-depth candidate; verify direct releases before using as a main recommendation anchor.`,
    artist_profile_hint: `Research queue profile for future psycore track expansion; search Bandcamp, SoundCloud, YouTube and social accounts before publishing track claims.`,
    scene_role: "research_queue_artist",
    source_anchor: "psycore_similar_to_plankton_2026-02-23 / Voodoo Hoodoo catalog",
    source_anchor_url: "reports/psycore_similar_to_plankton_2026-02-23.md",
    confidence: "medium",
    status: "needs_review",
    source_note: note
  });
}

const profileRows = Array.from(profiles.values())
  .sort((a, b) => a.status.localeCompare(b.status) || a.artist.localeCompare(b.artist));
trackRows.sort((a, b) => a.source_album.localeCompare(b.source_album) || a.artist.localeCompare(b.artist) || a.song.localeCompare(b.song));

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
  "status",
  "confidence",
  "source_note"
];

function valuesSql(rows, headers, numericColumns = new Set()) {
  return rows.map((row) => `  (${headers.map((header) => numericColumns.has(header) ? sqlNumber(row[header]) : sqlText(row[header])).join(", ")})`).join(",\n");
}

function buildSql() {
  const trackNumeric = new Set(["bpm_exact", "duration_sec"]);
  return `-- Sonic Search - Psycore enrichment V4
-- Generated 2026-06-21.
-- Adds track-level rows plus deeper artist profiles and social discovery metadata.
-- Run in Supabase SQL Editor only after review.

create temporary table if not exists psycore_enrichment_v4_tracks (
  style text not null,
  artist text not null,
  song text not null,
  label text not null,
  bpm_exact numeric,
  bpm_text text,
  release_date date,
  duration_sec integer,
  country text,
  city text,
  source_album text not null,
  source_url text not null,
  track_url text not null,
  external_track_id text,
  source_type text not null,
  source_tags text not null,
  artist_bio text not null,
  artist_profile_hint text not null,
  primary_social_url text,
  social_discovery_links text,
  label_links text,
  status text not null,
  confidence text not null,
  source_note text not null
) on commit drop;

create temporary table if not exists psycore_artist_profiles_v4 (
  style text not null,
  artist text not null,
  country text,
  city text,
  artist_bio text not null,
  artist_genre text not null,
  artist_profile_hint text not null,
  scene_role text not null,
  source_anchor text not null,
  source_anchor_url text,
  primary_social_url text,
  social_discovery_links text,
  label_links text,
  status text not null,
  confidence text not null,
  source_note text not null
) on commit drop;

truncate table psycore_enrichment_v4_tracks;
truncate table psycore_artist_profiles_v4;

insert into psycore_enrichment_v4_tracks (
  ${trackHeaders.join(",\n  ")}
) values
${valuesSql(trackRows, trackHeaders, trackNumeric)};

insert into psycore_artist_profiles_v4 (
  ${profileHeaders.join(",\n  ")}
) values
${valuesSql(profileRows, profileHeaders)};

with profile_track_rollup as (
  select
    style,
    artist,
    jsonb_agg(
      jsonb_build_object(
        'song', song,
        'bpm_exact', bpm_exact,
        'source_album', source_album,
        'track_url', track_url,
        'external_track_id', external_track_id,
        'confidence', confidence
      )
      order by release_date desc, song
    ) as recommended_tracks,
    jsonb_agg(distinct source_album) as source_albums
  from psycore_enrichment_v4_tracks
  group by style, artist
),
profile_rows as (
  select
    p.*,
    coalesce(r.recommended_tracks, '[]'::jsonb) as recommended_tracks,
    coalesce(r.source_albums, '[]'::jsonb) as source_albums
  from psycore_artist_profiles_v4 p
  left join profile_track_rollup r
    on r.style = p.style and r.artist = p.artist
)
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
  jsonb_build_object(
    'batch', '${BATCH}',
    'profile_depth', 'artist_profile_v4',
    'confidence', confidence,
    'scene_role', scene_role,
    'source_anchor', source_anchor,
    'source_albums', source_albums,
    'recommended_tracks', recommended_tracks,
    'primary_social_url', primary_social_url,
    'social_discovery_links', case
      when coalesce(social_discovery_links, '') = '' then array[]::text[]
      else string_to_array(social_discovery_links, ';')
    end,
    'label_links', case
      when coalesce(label_links, '') = '' then array[]::text[]
      else string_to_array(label_links, ';')
    end,
    'links_status', 'discovery_links_not_all_official',
    'source_note', source_note
  )
from profile_rows
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
  '${ARTIST_GENRE}',
  artist_profile_hint,
  '${BATCH}',
  track_url,
  status,
  jsonb_build_object(
    'batch', '${BATCH}',
    'confidence', confidence,
    'bpm_text', bpm_text,
    'source_album', source_album,
    'source_album_url', source_url,
    'track_url', track_url,
    'external_track_id', external_track_id,
    'source_type', source_type,
    'source_tags', string_to_array(source_tags, ';'),
    'primary_social_url', primary_social_url,
    'social_discovery_links', case
      when coalesce(social_discovery_links, '') = '' then array[]::text[]
      else string_to_array(social_discovery_links, ';')
    end,
    'label_links', case
      when coalesce(label_links, '') = '' then array[]::text[]
      else string_to_array(label_links, ';')
    end,
    'links_status', 'discovery_links_not_all_official',
    'source_note', source_note
  )
from psycore_enrichment_v4_tracks
on conflict (style, track_key) do update set
  label = excluded.label,
  bpm_exact = excluded.bpm_exact,
  preview_url = excluded.preview_url,
  release_date = excluded.release_date,
  duration_sec = excluded.duration_sec,
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

function buildReport() {
  const bySource = trackRows.reduce((acc, row) => {
    acc[row.source_album] = (acc[row.source_album] || 0) + 1;
    return acc;
  }, {});
  const publishedProfiles = profileRows.filter((row) => row.status === "published").length;
  const reviewProfiles = profileRows.length - publishedProfiles;
  return `# Psycore Enrichment V4 - 2026-06-21

## Por que este lote existe

O V3 aumentou o volume, mas ainda parecia cru porque quase tudo era faixa. O V4 melhora a camada editorial: cada faixa entra com BPM, fonte, link, notas de confianca, perfil do artista e links de descoberta para social/search.

## Resultado

- ${trackRows.length} faixas novas em \`catalog_tracks\`;
- ${profileRows.length} perfis em \`catalog_artists\`;
- ${publishedProfiles} perfis publicados;
- ${reviewProfiles} perfis em \`needs_review\` como fila de pesquisa;
- ${skippedDuplicates.length} possiveis duplicatas removidas antes de gerar o seed.

## Fontes principais

${Object.entries(bySource).map(([source, count]) => `- ${source}: ${count} faixas`).join("\n")}

## Fontes vivas verificadas

- Voodoo Hoodoo Records: https://voodoo-hoodoo.bandcamp.com
- PSYCHO FOR PALESTINE [2026]: https://voodoo-hoodoo.bandcamp.com/album/psycho-for-palestine-2026
- FORCA DA FLORESTA [2026]: https://voodoo-hoodoo.bandcamp.com/album/forca-da-floresta-2026
- MEDICINE FREQUENCIES [2026]: https://voodoo-hoodoo.bandcamp.com/album/medicine-frequencies-2026
- BLIND GODS [2026]: https://voodoo-hoodoo.bandcamp.com/album/blind-gods-2026
- PRIMA MATERIA: https://voodoo-hoodoo.bandcamp.com/album/prima-materia
- Black Out Records / Init Preset - System Error: https://blackoutrec.bandcamp.com/album/system-error
- Naturaiz Records Vol.1: https://naturaizrecords.bandcamp.com/album/natura-z-records-vol-1

## Notas de qualidade

- Linhas Bandcamp usam JSON-LD vivo com track id, duracao, release date e tags.
- Linhas locais entram como \`medium\` ou \`medium_high\` quando a fonte principal e seed local ou SoundCloud/Youtube search.
- Links sociais de artista estao marcados como discovery links, nao como oficiais, exceto links de label quando a fonte fornece pagina oficial.
- Perfis \`needs_review\` servem como fila para o proximo lote e nao devem ser tratados como track proof.
- A fonte antiga Psycore Revenge esta fora do ar, entao nao foi usada como fonte direta de faixa.

## Arquivos

- \`data/psycore_enrichment_v4_20260621.csv\`
- \`data/psycore_artist_profiles_v4_20260621.csv\`
- \`supabase/seeds/psycore_enrichment_v4_20260621.sql\`

## Proximo passo sugerido

Depois de aplicar o SQL, o proximo lote deve focar em uma destas frentes:

1. transformar os perfis \`needs_review\` em faixas verificadas;
2. buscar links oficiais de Instagram/SoundCloud/Spotify artista por artista;
3. adicionar campos de origem visual, como capa do album e imagem do artista;
4. criar um fluxo no app para usuarios sugerirem artista/faixa e salvar em \`catalog_submissions\`.
`;
}

fs.mkdirSync(DATA_DIR, { recursive: true });
fs.mkdirSync(SEED_DIR, { recursive: true });
fs.mkdirSync(REPORT_DIR, { recursive: true });

fs.writeFileSync(TRACK_OUT, csvWrite(trackRows, trackHeaders));
fs.writeFileSync(PROFILE_OUT, csvWrite(profileRows, profileHeaders));
fs.writeFileSync(SQL_OUT, buildSql());
fs.writeFileSync(REPORT_OUT, buildReport());

console.log(JSON.stringify({
  batch: BATCH,
  tracks: trackRows.length,
  profiles: profileRows.length,
  publishedProfiles: profileRows.filter((row) => row.status === "published").length,
  needsReviewProfiles: profileRows.filter((row) => row.status === "needs_review").length,
  skippedDuplicates: skippedDuplicates.length,
  files: [TRACK_OUT, PROFILE_OUT, SQL_OUT, REPORT_OUT]
}, null, 2));
