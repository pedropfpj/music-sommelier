#!/usr/bin/env node
import fs from "node:fs";
import path from "node:path";

const ROOT = process.cwd();
const BATCH = "underrepresented_subgenre_expansion_v18_20260820";
const TRACK_OUT = path.join(ROOT, "data", `${BATCH}.csv`);
const REPORT_OUT = path.join(ROOT, "reports", `${BATCH}.json`);
const RUNTIME_DIR = path.join(ROOT, "data", "runtime-catalog-v1");
const TARGET_TRACKS_PER_ARTIST = 4;
const REQUEST_PAUSE_MS = 70;
const DIVERSITY_BASELINE_TRACKS = 276;
const DIVERSITY_BASELINE_ARTISTS = 72;

const BLOCKED_TRACK_PATTERNS = {
  "big beat::fatboy slim": [/future rave remix/i, /eat sleep rave repeat/i],
  "big beat::the prodigy": [/re-?amp/i],
  "extratone::dj skull vomit": [/drumstep/i],
  "crossbreed::dj hidden": [
    /amor encarcelado/i,
    /mi barrio/i,
    /ardiendo por ti/i,
    /million gang/i,
    /te encontre/i,
    /mi combo/i,
    /pa mi raza/i,
    /^rapido$/i,
    /^perdido$/i
  ],
  "dream trance::dj dado": [/broke your heart/i, /ready or not/i],
  "italo disco::gazebo": [/self control/i, /tarzan boy/i, /i like chopin'? 91/i],
  "italo disco::ryan paris": [/masterpiece.*happy children/i, /^la dolce vita/i],
  "french house::modjo": [/acoustic/i],
  "makina::dj konik": [/techno 2024/i],
  "makina::dj skudero": [/rkt lgante/i],
  "makina::sistema 3": [/this is techno/i],
  "makina::dj nau": [/i still love you/i, /ofa taongata/i, /ofa taengata/i, /^quack$/i]
};

const PROVIDER_POLICY = {
  "makina::dj nau": "deezer"
};

const STYLE_CONFIG = {
  big_beat: {
    label: "Big Beat",
    evidenceUrl: "https://ninjatune.net/artist/coldcut",
    artists: ["Fatboy Slim", "The Prodigy", "The Crystal Method", "Propellerheads", "Lo Fidelity Allstars", "Bentley Rhythm Ace"]
  },
  extratone: {
    label: "Extratone",
    evidenceUrl: "https://sunhiausa.bandcamp.com/track/extratone-is-your-destiny-aekhlori-edit",
    artists: ["Kurwastyle Project", "DJ Skull Vomit", "Pressterror", "Aekhloria", "Kobaryo"]
  },
  lowercase: {
    label: "Lowercase / Onkyo",
    artists: ["Richard Chartier", "Taku Sugimoto", "Toshimaru Nakamura", "Sachiko M", "Toshiya Tsunoda"]
  },
  shangaan_electro: {
    label: "Shangaan Electro",
    evidenceUrl: "https://honestjons.com/label/artist/Shangaan_Electro/release/New_Wave_Dance_Music_From_South_Africa",
    artists: ["Tiyiselani Vomaseve", "Nkata Mawewe", "Zinja Hlungwani", "Mancingelani", "Foster Manganyi"]
  },
  dark_ambient: {
    label: "Dark Ambient",
    artists: ["Atrium Carceri", "Kammarheit", "Desiderii Marginis", "Cities Last Broadcast", "Northaunt"]
  },
  electroacoustic: {
    label: "Electroacoustic",
    artists: ["Iannis Xenakis", "Luc Ferrari", "Beatriz Ferreyra", "Hildegard Westerkamp", "Trevor Wishart"]
  },
  baltimore_club: {
    label: "Baltimore Club",
    evidenceUrl: "https://music.apple.com/us/playlist/best-of-baltimore-club/pl.945236b5d6854ea6bd4dd4b8f39a4f9a",
    artists: ["DJ Technics", "Blaqstarr", "Say Wut", "Scottie B", "DJ Class"]
  },
  latin_house: {
    label: "Latin House",
    artists: ["HUGEL", "Andruss", "Jude & Frank", "Harry Romero", "Sllash & Doppe"]
  },
  french_house: {
    label: "French House",
    artists: ["Daft Punk", "Cassius", "Etienne de Crecy", "Alan Braxe", "Modjo", "Fred Falke"]
  },
  italo_disco: {
    label: "Italo Disco",
    artists: ["Gazebo", "Ryan Paris", "P. Lion", "Valerie Dore", "Ken Laszlo"]
  },
  balearic_trance: {
    label: "Balearic Trance",
    artists: ["Humate", "Salt Tank", "Three Drives", "York", "Nalin & Kane"]
  },
  batida: {
    label: "Batida",
    evidenceUrl: "https://principediscos.bandcamp.com/album/dj-nervoso",
    artists: ["Nidia", "DJ Lycox", "DJ Firmeza", "Puto Tito", "DJ Nervoso"]
  },
  crossbreed: {
    label: "Crossbreed",
    artists: ["DJ Hidden", "Switch Technique", "Sinister Souls", "Cooh", "Hallucinator"]
  },
  dream_trance: {
    label: "Dream Trance",
    artists: ["DJ Dado", "Nylon Moon", "Zhi-Vago", "Roland Brant", "Taucher"]
  },
  florida_breaks: {
    label: "Florida Breaks",
    artists: ["Dynamix II", "Huda Hudia", "Friction & Spice", "Sharaz", "Jackal & Hyde"]
  },
  makina: {
    label: "Makina",
    artists: ["Ruboy", "DJ Skudero", "DJ Konik", "Sistema 3", "DJ Nau"]
  },
  microhouse: {
    label: "Microhouse",
    artists: ["Ricardo Villalobos", "Luomo", "Jan Jelinek", "Herbert", "Farben"]
  },
  minimal_wave: {
    label: "Minimal Wave",
    evidenceUrl: "https://www.minimalwave.com/releases/list/",
    artists: ["Oppenheimer Analysis", "Turquoise Days", "Das Ding", "Solid Space", "Martin Dupont"]
  },
  musique_concrete: {
    label: "Musique Concrete",
    artists: ["Bernard Parmegiani", "Francois Bayle", "Michel Chion", "Christian Zanesi", "Beatriz Ferreyra"]
  },
  neurohop: {
    label: "Neurohop",
    artists: ["Culprate", "OPIUO", "Vorso", "Mr. Bill", "Ekcle"]
  },
  sambass: {
    label: "Sambass",
    artists: ["Drumagick", "XRS", "Bungle", "Marcelinho da Lua", "Fernanda Porto"]
  },
  singeli: {
    label: "Singeli",
    evidenceUrl: "https://nyegenyegetapes.bandcamp.com/album/sounds-of-sisso",
    artists: ["Bamba Pana", "DJ Travella", "Dogo Niga", "MC Pilato", "Dogo Kibo"]
  },
  space_ambient: {
    label: "Space Ambient",
    artists: ["Michael Stearns", "Stellardrone", "Max Corbacho", "Carbon Based Lifeforms", "Robert Rich"]
  },
  techstep: {
    label: "Techstep",
    artists: ["Dom & Roland", "Bad Company UK", "Stakka & Skynet", "Konflict", "Kemal & Rob Data"]
  }
};

const HEADERS = [
  "style",
  "artist",
  "song",
  "label",
  "bpm_exact",
  "preview_url",
  "release_date",
  "duration_sec",
  "artist_country",
  "city",
  "artist_genre",
  "artist_profile_hint",
  "source",
  "source_url",
  "track_url",
  "deezer_track_id",
  "deezer_track_url",
  "cover_art_url",
  "genre_evidence_url",
  "source_type",
  "source_tags",
  "energy_band",
  "catalog_role",
  "status",
  "confidence",
  "source_note"
];

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

function compact(value = "") {
  return normalize(value).replace(/\s+/g, "");
}

function canonicalTitle(value = "") {
  const withoutVersionSuffix = String(value || "")
    .replace(/\s*[\[(][^\])]*\b(?:feat(?:uring)?|ft\.?|mix(?:ed)?|remix|edit|version|remaster(?:ed)?|vip|re-?amp)\b[^\])]*[\])]/gi, " ")
    .replace(/\s+-\s+[^-]*\b(?:mix(?:ed)?|remix|edit|version|remaster(?:ed)?|vip|re-?amp)\b.*$/gi, " ");
  return normalize(withoutVersionSuffix)
    .replace(/\b(?:remaster(?:ed)?(?: \d{4})?|radio edit|radio vers|single version|maxi single|album version|original mix|extended mix|mixed|rerecorded|vip)\b/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function trackBlockedForExpansion(style, artist, song) {
  const key = `${normalize(style)}::${normalize(artist)}`;
  return (BLOCKED_TRACK_PATTERNS[key] || []).some((pattern) => pattern.test(String(song || "")));
}

function providerPolicyFor(style, artist) {
  return PROVIDER_POLICY[`${normalize(style)}::${normalize(artist)}`] || "both";
}

function trackKey(style, artist, song) {
  return `${normalize(style)}::${normalize(artist)}::${canonicalTitle(song)}`;
}

function strictArtistMatch(expected, candidate) {
  const expectedKey = compact(expected);
  const candidateKey = compact(candidate);
  return Boolean(expectedKey && candidateKey && expectedKey === candidateKey);
}

function csvCell(value = "") {
  return `"${String(value ?? "").replace(/"/g, '""')}"`;
}

function writeCsv(rows) {
  return [
    HEADERS.map(csvCell).join(","),
    ...rows.map((row) => HEADERS.map((header) => csvCell(row[header] ?? "")).join(","))
  ].join("\n") + "\n";
}

function parseCsv(text = "") {
  const parsed = [];
  let row = [];
  let value = "";
  let quoted = false;
  for (let index = 0; index < text.length; index += 1) {
    const char = text[index];
    const next = text[index + 1];
    if (char === '"') {
      if (quoted && next === '"') {
        value += '"';
        index += 1;
      } else {
        quoted = !quoted;
      }
    } else if (!quoted && char === ",") {
      row.push(value);
      value = "";
    } else if (!quoted && (char === "\n" || char === "\r")) {
      if (char === "\r" && next === "\n") index += 1;
      row.push(value);
      if (row.some((cell) => cell.trim())) parsed.push(row);
      row = [];
      value = "";
    } else {
      value += char;
    }
  }
  row.push(value);
  if (row.some((cell) => cell.trim())) parsed.push(row);
  const headers = parsed.shift() || [];
  return parsed.map((cells) => Object.fromEntries(headers.map((header, index) => [header, cells[index] || ""])));
}

function readPreviousRows() {
  return fs.existsSync(TRACK_OUT) ? parseCsv(fs.readFileSync(TRACK_OUT, "utf8")) : [];
}

function readRuntimeCoverage(previousRows) {
  const counts = {};
  const existingOtherKeys = new Set();
  const previousKeys = new Set(previousRows.map((row) => trackKey(row.style, row.artist, row.song)));
  const manifestPath = path.join(RUNTIME_DIR, "manifest.json");
  if (!fs.existsSync(manifestPath)) return { counts, existingOtherKeys };
  const manifest = JSON.parse(fs.readFileSync(manifestPath, "utf8"));
  for (const [style, relativePath] of Object.entries(manifest.styles || {})) {
    if (!STYLE_CONFIG[style]) continue;
    const rows = JSON.parse(fs.readFileSync(path.join(RUNTIME_DIR, relativePath), "utf8"));
    counts[style] = rows.filter((row) => !previousKeys.has(trackKey(style, row.artist, row.song))).length;
    rows.forEach((row) => {
      const key = trackKey(style, row.artist, row.song);
      if (!previousKeys.has(key)) existingOtherKeys.add(key);
    });
  }
  return { counts, existingOtherKeys };
}

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function fetchJson(url, retries = 2) {
  for (let attempt = 0; attempt <= retries; attempt += 1) {
    try {
      const response = await fetch(url, {
        headers: { "User-Agent": "SonicSearchUnderrepresentedExpansion/1.0" }
      });
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      return await response.json();
    } catch (_error) {
      if (attempt === retries) return null;
      await sleep(350 + attempt * 650);
    }
  }
  return null;
}

function usableTitle(value = "") {
  const title = normalize(value);
  if (!title) return false;
  return ![
    "interview",
    "commentary",
    "karaoke",
    "tribute",
    "continuous mix",
    "full album",
    "podcast",
    "skit"
  ].some((term) => title.includes(term));
}

function rowBase(style, artist, config) {
  return {
    style,
    artist,
    bpm_exact: "",
    artist_country: "",
    city: "",
    artist_genre: config.label,
    artist_profile_hint: `${artist} foi curado para ampliar a profundidade de ${config.label} no catálogo.`,
    source: BATCH,
    genre_evidence_url: config.evidenceUrl || "",
    source_type: "verified_underrepresented_subgenre_depth",
    source_tags: `${style};${config.label};curated_artist;playable_depth;${BATCH}`,
    energy_band: "catalog_depth",
    catalog_role: "underrepresented_style_depth",
    status: "published",
    confidence: "high"
  };
}

function deezerArtistSearchUrl(artist) {
  const url = new URL("https://api.deezer.com/search/artist");
  url.searchParams.set("q", artist);
  url.searchParams.set("limit", "10");
  return url;
}

async function deezerRows(style, artist, config) {
  const artistPayload = await fetchJson(deezerArtistSearchUrl(artist));
  const resolved = (artistPayload?.data || []).find((item) => strictArtistMatch(artist, item?.name || ""));
  if (!resolved?.id) return [];
  const payload = await fetchJson(`https://api.deezer.com/artist/${encodeURIComponent(resolved.id)}/top?limit=50`);
  return (payload?.data || [])
    .filter((item) => strictArtistMatch(artist, item?.artist?.name || resolved.name || ""))
    .filter((item) => String(item?.preview || "").startsWith("http"))
    .filter((item) => usableTitle(item?.title_short || item?.title || ""))
    .filter((item) => !item?.duration || (Number(item.duration) >= 45 && Number(item.duration) <= 1200))
    .map((item, index) => ({
      ...rowBase(style, artist, config),
      song: String(item.title_short || item.title || "").trim(),
      label: String(item.album?.title || config.label).trim(),
      preview_url: String(item.preview || "").trim(),
      release_date: String(item.release_date || item.album?.release_date || "").trim(),
      duration_sec: String(item.duration || ""),
      source_url: String(item.link || ""),
      track_url: String(item.link || ""),
      deezer_track_id: String(item.id || ""),
      deezer_track_url: String(item.link || ""),
      cover_art_url: String(item.album?.cover_big || item.album?.cover_medium || ""),
      source_note: `Artista curado para ${config.label}; artista exato, gravação e prévia verificados no Deezer.`,
      provider: "deezer",
      providerRank: index
    }));
}

function appleSearchUrl(artist) {
  const url = new URL("https://itunes.apple.com/search");
  url.searchParams.set("term", artist);
  url.searchParams.set("entity", "song");
  url.searchParams.set("limit", "100");
  url.searchParams.set("country", "US");
  return url;
}

async function appleRows(style, artist, config) {
  const payload = await fetchJson(appleSearchUrl(artist));
  return (payload?.results || [])
    .filter((item) => item?.kind === "song")
    .filter((item) => strictArtistMatch(artist, item?.artistName || ""))
    .filter((item) => String(item?.previewUrl || "").startsWith("http"))
    .filter((item) => !/\/itunes-assets\/Music\d+\//i.test(String(item?.previewUrl || "")))
    .filter((item) => usableTitle(item?.trackName || ""))
    .filter((item) => !item?.trackTimeMillis || (Number(item.trackTimeMillis) >= 45000 && Number(item.trackTimeMillis) <= 1200000))
    .map((item, index) => ({
      ...rowBase(style, artist, config),
      song: String(item.trackName || "").trim(),
      label: String(item.collectionName || config.label).trim(),
      preview_url: String(item.previewUrl || "").trim(),
      release_date: String(item.releaseDate || "").slice(0, 10),
      duration_sec: item.trackTimeMillis ? String(Math.round(Number(item.trackTimeMillis) / 1000)) : "",
      source_url: String(item.trackViewUrl || item.collectionViewUrl || ""),
      track_url: String(item.trackViewUrl || ""),
      deezer_track_id: "",
      deezer_track_url: "",
      cover_art_url: String(item.artworkUrl100 || "").replace(/100x100bb/, "600x600bb"),
      source_note: `Artista curado para ${config.label}; artista exato, gravação e prévia verificados no Apple Music.`,
      provider: "apple",
      providerRank: index
    }));
}

function mergeProviderRows(deezer, apple) {
  const merged = new Map();
  for (const row of [...deezer, ...apple]) {
    const key = canonicalTitle(row.song);
    if (!key) continue;
    if (!merged.has(key)) {
      merged.set(key, row);
      continue;
    }
    const current = merged.get(key);
    const appleRow = row.provider === "apple" ? row : current.provider === "apple" ? current : null;
    const deezerRow = row.provider === "deezer" ? row : current.provider === "deezer" ? current : null;
    const preferred = appleRow || current;
    const sourceTags = new Set(
      String(preferred.source_tags || "")
        .split(";")
        .map((value) => value.trim())
        .filter(Boolean)
    );
    if (appleRow) sourceTags.add("itunes_verified");
    if (deezerRow) sourceTags.add("deezer_verified");
    merged.set(key, {
      ...preferred,
      deezer_track_id: deezerRow?.deezer_track_id || preferred.deezer_track_id || "",
      deezer_track_url: deezerRow?.deezer_track_url || preferred.deezer_track_url || "",
      source_tags: [...sourceTags].join(";"),
      source_note: `Artista curado para ${preferred.artist_genre}; artista exato, gravação e prévia verificados em ${appleRow && deezerRow ? "Apple Music e Deezer" : appleRow ? "Apple Music" : "Deezer"}.`
    });
  }
  return [...merged.values()].sort((a, b) => {
    const aScore = Number(Boolean(a.deezer_track_id)) * 100 - Number(a.providerRank || 0);
    const bScore = Number(Boolean(b.deezer_track_id)) * 100 - Number(b.providerRank || 0);
    return bScore - aScore || a.song.localeCompare(b.song);
  });
}

async function main() {
  const previousRows = readPreviousRows();
  const previousTrackKeys = new Set(previousRows.map((row) => trackKey(row.style, row.artist, row.song)));
  const previousArtistKeys = new Set(previousRows.map((row) => `${row.style}::${normalize(row.artist)}`));
  const { counts: beforeCounts, existingOtherKeys } = readRuntimeCoverage(previousRows);
  const generated = [];
  const missingArtists = [];
  const providerCounts = { apple: 0, deezer: 0, both: 0, preserved: 0 };

  for (const [style, config] of Object.entries(STYLE_CONFIG)) {
    for (const artist of config.artists) {
      const providerPolicy = providerPolicyFor(style, artist);
      const [deezer, apple] = await Promise.all([
        providerPolicy === "apple" ? Promise.resolve([]) : deezerRows(style, artist, config),
        providerPolicy === "deezer" ? Promise.resolve([]) : appleRows(style, artist, config)
      ]);
      const candidates = mergeProviderRows(deezer, apple)
        .filter((row) => !existingOtherKeys.has(trackKey(style, artist, row.song)))
        .filter((row) => !trackBlockedForExpansion(style, artist, row.song))
        .slice(0, TARGET_TRACKS_PER_ARTIST);
      if (!candidates.length) {
        const preserved = previousRows
          .filter((row) => row.style === style && strictArtistMatch(artist, row.artist))
          .filter((row) => !existingOtherKeys.has(trackKey(style, artist, row.song)))
          .filter((row) => !trackBlockedForExpansion(style, artist, row.song))
          .slice(0, TARGET_TRACKS_PER_ARTIST);
        if (preserved.length) {
          generated.push(...preserved);
          providerCounts.preserved += preserved.length;
        } else {
          missingArtists.push({ style, artist });
        }
      }
      candidates.forEach((row) => {
        if (row.deezer_track_id && row.provider === "apple") providerCounts.both += 1;
        else if (row.provider === "apple") providerCounts.apple += 1;
        else providerCounts.deezer += 1;
        const clean = Object.fromEntries(HEADERS.map((header) => [header, row[header] ?? ""]));
        generated.push(clean);
      });
      await sleep(REQUEST_PAUSE_MS);
    }
  }

  generated.sort((a, b) => a.style.localeCompare(b.style) || a.artist.localeCompare(b.artist) || a.song.localeCompare(b.song));
  if (generated.length < 120) {
    throw new Error("Expansion guard failed: fewer than 120 verified playable tracks were produced; the previous output was preserved.");
  }
  fs.mkdirSync(path.dirname(TRACK_OUT), { recursive: true });
  fs.mkdirSync(path.dirname(REPORT_OUT), { recursive: true });
  fs.writeFileSync(TRACK_OUT, writeCsv(generated), "utf8");

  const perStyle = Object.fromEntries(Object.keys(STYLE_CONFIG).map((style) => {
    const rows = generated.filter((row) => row.style === style);
    return [style, {
      beforeTracks: Number(beforeCounts[style] || 0),
      addedTracks: rows.length,
      projectedTracks: Number(beforeCounts[style] || 0) + rows.length,
      addedArtists: new Set(rows.map((row) => normalize(row.artist))).size
    }];
  }));
  const report = {
    generatedAt: new Date().toISOString(),
    batch: BATCH,
    priorityRule: "runtime styles with fewer than 13 tracks at the start of the expansion",
    targetTracksPerArtist: TARGET_TRACKS_PER_ARTIST,
    stylesExpanded: Object.keys(STYLE_CONFIG).length,
    tracksAdded: generated.length,
    artistsAdded: new Set(generated.map((row) => `${row.style}::${normalize(row.artist)}`)).size,
    diversityBaselineTracks: DIVERSITY_BASELINE_TRACKS,
    diversityIncrementalTracks: generated.length - DIVERSITY_BASELINE_TRACKS,
    diversityBaselineArtists: DIVERSITY_BASELINE_ARTISTS,
    diversityIncrementalArtists: new Set(generated.map((row) => `${row.style}::${normalize(row.artist)}`)).size - DIVERSITY_BASELINE_ARTISTS,
    previousTracks: previousRows.length,
    incrementalTracks: generated.filter((row) => !previousTrackKeys.has(trackKey(row.style, row.artist, row.song))).length,
    previousArtists: previousArtistKeys.size,
    incrementalArtists: new Set(
      generated
        .map((row) => `${row.style}::${normalize(row.artist)}`)
        .filter((key) => !previousArtistKeys.has(key))
    ).size,
    providerCounts,
    missingArtists,
    perStyle
  };
  fs.writeFileSync(REPORT_OUT, `${JSON.stringify(report, null, 2)}\n`, "utf8");

  console.log(`Expanded ${report.stylesExpanded} underrepresented styles with ${report.tracksAdded} playable tracks from ${report.artistsAdded} style-artist pairs.`);
  console.log(`Missing artist matches: ${missingArtists.length}.`);
  console.log(`Tracks: ${path.relative(ROOT, TRACK_OUT)}`);
  console.log(`Report: ${path.relative(ROOT, REPORT_OUT)}`);
}

await main();
