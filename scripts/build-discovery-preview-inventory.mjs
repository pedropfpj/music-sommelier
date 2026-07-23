#!/usr/bin/env node

import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const rootDir = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const dataDir = path.join(rootDir, "data");
const outputPath = path.join(dataDir, "discovery_playable_inventory_v1.json");
const targetPerStyle = Math.max(
  1,
  Number.parseInt(process.argv.find((value) => value.startsWith("--target="))?.split("=")[1] || "24", 10)
);
const styleTargets = [
  "tech_house",
  "house",
  "techno",
  "deep_house",
  "progressive_psy",
  "dubstep",
  "liquid_dnb",
  "drum_and_bass",
  "neurofunk",
  "jungle",
  "uk_garage",
  "future_garage"
];
const curatedSeedArtists = {
  deep_house: [
    "Jimpster", "Move D", "Motor City Drum Ensemble", "Hunee", "Nora En Pure",
    "Ben Böhmer", "YokoO", "Black Loops", "Dusky", "Session Victim",
    "Kerri Chandler", "Moodymann", "Theo Parrish", "Larry Heard", "Maya Jane Coles",
    "Fort Romeau", "Chaos In The CBD", "DJ Koze", "Fred P", "Patrice Scott",
    "Axel Boman", "Henrik Schwarz", "Âme", "Osunlade", "Atjazz", "Jullian Gomes"
  ],
  progressive_psy: [
    "Astrix", "Ace Ventura", "Captain Hook", "Liquid Soul", "Neelix", "Ritmo",
    "Symbolic", "Protonica", "Zyce", "E-Clip", "Morten Granau", "Phaxe",
    "Querox", "Interactive Noise", "Ghost Rider", "Ranji", "Berg", "Freedom Fighters",
    "Dekel", "Outsiders", "Vertical Mode", "Animato", "Perfect Stranger", "Suntree"
  ],
  dubstep: [
    "Skream", "Benga", "Coki", "Digital Mystikz", "Mala", "Loefah", "Kode9",
    "Caspa", "Rusko", "J:Kenzo", "Kryptic Minds", "Commodo", "Pinch",
    "Peverelist", "Distance", "Kahn", "Goth-Trad", "Silkie", "Quest", "Truth",
    "Ternion Sound", "Kromestar", "Kaiju", "Biome", "Youngsta", "Plastician",
    "Skrillex", "Ganja White Night", "Doctor P", "Flux Pavilion", "Zeds Dead",
    "Subtronics", "Excision", "Virtual Riot", "Badklaat", "Infekt"
  ],
  liquid_dnb: [
    "Calibre", "High Contrast", "LSB", "Logistics", "London Elektricity", "Nu:Tone",
    "Etherwood", "Hybrid Minds", "SpectraSoul", "Technimatic", "BCee", "Netsky",
    "Makoto", "Tokyo Prose", "Dawn Wall", "Monrroe", "GLXY", "Pola & Bryson",
    "Lenzman", "Alix Perez", "Redeyes", "Satl", "Seba", "LTJ Bukem", "Marcus Intalex"
  ],
  drum_and_bass: [
    "Sub Focus", "Chase & Status", "Pendulum", "Andy C", "Dimension", "Culture Shock",
    "Metrik", "Wilkinson", "Shy FX", "DJ Marky", "Roni Size", "Goldie",
    "Camo & Krooked", "Netsky", "The Prototypes", "Delta Heavy", "1991", "Friction",
    "Kanine", "Bou", "Break", "S.P.Y", "dBridge", "DJ Zinc", "K Motionz"
  ],
  neurofunk: [
    "Noisia", "Mefjus", "Black Sun Empire", "Ed Rush", "Optical", "The Upbeats",
    "Burr Oak", "Pythius", "The Clamps", "Neonlight", "Agressor Bunx",
    "Teddy Killerz", "State of Mind", "Phace", "Misanthrop", "Spor",
    "Current Value", "Prolix", "Emperor", "Audio", "Jade", "Gridlok", "Gydra",
    "Magnetude", "Merikan", "Joe Ford"
  ],
  jungle: [
    "Shy FX", "Congo Natty", "General Levy", "Remarc", "Dillinja", "Source Direct",
    "Photek", "LTJ Bukem", "Goldie", "4hero", "Roni Size", "DJ Hype", "Aphrodite",
    "Nia Archives", "Tim Reaper", "Sully", "Coco Bryce", "Special Request",
    "Breakage", "Digital", "Doc Scott", "Omni Trio", "Peshay", "Lemon D"
  ],
  uk_garage: [
    "MJ Cole", "Artful Dodger", "Wookie", "Zed Bias", "El-B", "Groove Chronicles",
    "Todd Edwards", "DJ EZ", "Conducta", "Sammy Virji", "Oppidan",
    "Interplanetary Criminal", "Bakey", "Soul Mass Transit System", "Main Phase",
    "Silva Bumpa", "MPH", "Higgo", "Notion", "Champion", "Scott Garcia",
    "Dem 2", "Bump & Flex", "Sunship"
  ],
  future_garage: [
    "Burial", "Vacant", "Sorrow", "Synkro", "Phaeleh", "Clubroot", "Ghostek",
    "Submerse", "Zomby", "Volor Flex", "Kiasmos", "Lapalux", "Koreless", "Shigeto",
    "FaltyDL", "Kode9", "Four Tet", "Mount Kimbie", "James Blake", "Jamie xx",
    "Overmono", "Joy Orbison", "SBTRKT", "Sepalcure", "Holy Other", "Djrum",
    "Pangaea", "Pearson Sound", "Jacques Greene", "Scuba", "Kastle", "Direct"
  ]
};

function normalizeBpmForStyle(style, value) {
  let bpm = Number(value) || 0;
  if (!bpm) return 0;
  if (["liquid_dnb", "drum_and_bass", "neurofunk", "jungle"].includes(style) && bpm >= 80 && bpm <= 95) {
    bpm *= 2;
  } else if (["dubstep", "uk_garage", "future_garage", "progressive_psy"].includes(style) && bpm >= 65 && bpm <= 75) {
    bpm *= 2;
  }
  return Math.round(bpm * 10) / 10;
}

function parseCsv(text = "") {
  const rows = [];
  let row = [];
  let field = "";
  let quoted = false;
  for (let index = 0; index < text.length; index += 1) {
    const char = text[index];
    if (quoted) {
      if (char === '"' && text[index + 1] === '"') {
        field += '"';
        index += 1;
      } else if (char === '"') {
        quoted = false;
      } else {
        field += char;
      }
      continue;
    }
    if (char === '"') {
      quoted = true;
    } else if (char === ",") {
      row.push(field);
      field = "";
    } else if (char === "\n") {
      row.push(field.replace(/\r$/, ""));
      rows.push(row);
      row = [];
      field = "";
    } else {
      field += char;
    }
  }
  if (field || row.length) {
    row.push(field.replace(/\r$/, ""));
    rows.push(row);
  }
  const headers = rows.shift()?.map((value) => value.trim()) || [];
  return rows
    .filter((values) => values.some(Boolean))
    .map((values) => Object.fromEntries(headers.map((header, index) => [header, values[index] || ""])));
}

function comparable(value = "") {
  return String(value || "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/\b(feat|featuring|ft)\.?\b.*$/g, "")
    .replace(/\b(and|vs)\b/g, " ")
    .replace(/&/g, " ")
    .replace(/[^a-z0-9]+/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function titleComparable(value = "") {
  return comparable(
    String(value || "")
      .replace(/\((?:[^)]*(?:remix|mix|edit|version|radio|live|remaster)[^)]*)\)/gi, "")
      .replace(/\[(?:[^\]]*(?:remix|mix|edit|version|radio|live|remaster)[^\]]*)\]/gi, "")
      .replace(/\s+-\s+(?:original|extended|radio|club|remaster).*$/gi, "")
  );
}

function tokenSimilarity(left = "", right = "") {
  const leftTokens = new Set(comparable(left).split(" ").filter(Boolean));
  const rightTokens = new Set(comparable(right).split(" ").filter(Boolean));
  if (!leftTokens.size || !rightTokens.size) return 0;
  let overlap = 0;
  leftTokens.forEach((token) => {
    if (rightTokens.has(token)) overlap += 1;
  });
  return overlap / Math.max(leftTokens.size, rightTokens.size);
}

function artistMatch(expected = "", actual = "") {
  const left = comparable(expected);
  const right = comparable(actual);
  if (!left || !right) return false;
  if (left === right) return true;
  const leftTokens = left.split(" ").filter(Boolean);
  const rightTokens = right.split(" ").filter(Boolean);
  const leftContained = leftTokens.every((token) => rightTokens.includes(token));
  const rightContained = rightTokens.every((token) => leftTokens.includes(token));
  return leftContained || rightContained || tokenSimilarity(left, right) >= 0.72;
}

function titleScore(expected = "", actual = "") {
  const left = titleComparable(expected);
  const right = titleComparable(actual);
  if (!left || !right) return 0;
  if (left === right) return 1;
  if (left.includes(right) || right.includes(left)) return 0.94;
  return tokenSimilarity(left, right);
}

function rowScore(row = {}) {
  let score = 0;
  const confidence = comparable(row.confidence || row.catalog_confidence);
  const status = comparable(row.status);
  const sourceType = comparable(row.source_type);
  if (status === "published") score += 5;
  if (confidence === "high" || confidence === "very high") score += 7;
  else if (confidence.includes("medium high")) score += 4;
  if (sourceType.includes("curated")) score += 4;
  if (row.deezer_track_id) score += 3;
  if (Number(row.bpm_exact) > 0) score += 3;
  if (row.preview_url) score += 1;
  return score;
}

async function fetchJson(url, timeoutMs = 9000) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  try {
    const response = await fetch(url, {
      headers: { Accept: "application/json" },
      signal: controller.signal
    });
    if (!response.ok) return null;
    return await response.json();
  } catch {
    return null;
  } finally {
    clearTimeout(timer);
  }
}

async function verifyAudio(url = "") {
  if (!/^https:\/\//i.test(url)) return false;
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 8000);
  try {
    const response = await fetch(url, {
      headers: { Range: "bytes=0-2047" },
      signal: controller.signal
    });
    const type = String(response.headers.get("content-type") || "").toLowerCase();
    return response.ok && (type.startsWith("audio/") || type.includes("octet-stream"));
  } catch {
    return false;
  } finally {
    clearTimeout(timer);
  }
}

async function resolveAppleTrack(row) {
  const term = encodeURIComponent(`${row.artist} ${row.song}`);
  const payload = await fetchJson(`https://itunes.apple.com/search?term=${term}&entity=song&limit=50&country=US`);
  const candidates = Array.isArray(payload?.results)
    ? payload.results
        .filter((item) => item?.previewUrl && artistMatch(row.artist, item.artistName))
        .map((item) => ({
          item,
          score: titleScore(row.song, item.trackName)
        }))
        .filter((entry) => entry.score >= 0.9)
        .sort((left, right) => right.score - left.score)
    : [];
  const best = candidates[0]?.item;
  if (!best || !await verifyAudio(best.previewUrl)) return null;
  return best;
}

async function resolveDeezerTrack(row) {
  const id = String(row.deezer_track_id || "").trim();
  if (!/^\d+$/.test(id)) return null;
  const payload = await fetchJson(`https://api.deezer.com/track/${id}`);
  const contributorNames = Array.isArray(payload?.contributors)
    ? payload.contributors.map((item) => item?.name).filter(Boolean)
    : [];
  const matchedArtist =
    artistMatch(row.artist, payload?.artist?.name || "") ||
    contributorNames.some((name) => artistMatch(row.artist, name) || artistMatch(name, row.artist));
  if (
    !payload?.readable ||
    !payload?.preview ||
    !matchedArtist ||
    titleScore(row.song, payload.title || payload.title_short || "") < 0.9 ||
    !await verifyAudio(payload.preview)
  ) return null;
  return payload;
}

async function resolveDeezerArtistTrack(row, rejectedTrackKeys = new Set()) {
  const query = encodeURIComponent(`artist:"${row.artist}"`);
  const search = await fetchJson(`https://api.deezer.com/search/artist?q=${query}&limit=25`);
  const artist = (Array.isArray(search?.data) ? search.data : [])
    .filter((item) => comparable(row.artist) === comparable(item?.name || ""))
    .sort((left, right) => Number(right?.nb_fan || 0) - Number(left?.nb_fan || 0))[0];
  if (!artist?.id) return null;
  const top = await fetchJson(`https://api.deezer.com/artist/${artist.id}/top?limit=25`);
  const tracks = Array.isArray(top?.data) ? top.data : [];
  for (const track of tracks) {
    const trackKey = `${comparable(track?.artist?.name || row.artist)}::${titleComparable(track?.title || "")}`;
    if (
      !track?.id ||
      !track?.readable ||
      !track?.preview ||
      rejectedTrackKeys.has(trackKey) ||
      !artistMatch(row.artist, track?.artist?.name || "")
    ) continue;
    const detail = await fetchJson(`https://api.deezer.com/track/${track.id}`);
    if (!detail?.readable || !detail?.preview || !await verifyAudio(detail.preview)) continue;
    return detail;
  }
  return null;
}

async function mapLimit(items, limit, mapper) {
  const results = new Array(items.length);
  let cursor = 0;
  const workers = Array.from({ length: Math.min(limit, items.length) }, async () => {
    while (cursor < items.length) {
      const index = cursor;
      cursor += 1;
      results[index] = await mapper(items[index], index);
    }
  });
  await Promise.all(workers);
  return results;
}

async function sourceRows() {
  const files = (await fs.readdir(dataDir))
    .filter((name) => name.endsWith(".csv"))
    .sort();
  const rows = [];
  for (const name of files) {
    const text = await fs.readFile(path.join(dataDir, name), "utf8");
    parseCsv(text).forEach((row) => {
      if (!styleTargets.includes(row.style)) return;
      const artist = String(row.artist || row.artist_name || "").trim();
      const song = String(row.song || row.track || row.track_name || row.title || "").trim();
      if (!artist) return;
      rows.push({
        ...row,
        artist,
        song,
        artist_seed: song ? "" : "yes",
        source_file: name
      });
    });
  }
  return rows;
}

const rows = await sourceRows();
const inventory = [];

for (const style of styleTargets) {
  const seenTracks = new Set();
  const rankedTracks = rows
    .filter((row) => row.style === style && row.song)
    .sort((left, right) => rowScore(right) - rowScore(left))
    .filter((row) => {
      const trackKey = `${comparable(row.artist)}::${titleComparable(row.song)}`;
      if (seenTracks.has(trackKey)) return false;
      seenTracks.add(trackKey);
      return true;
    });
  const primaryArtistKeys = new Set();
  const primaryArtistRows = rankedTracks.filter((row) => {
    const artistKey = comparable(row.artist);
    if (!artistKey || primaryArtistKeys.has(artistKey)) return false;
    primaryArtistKeys.add(artistKey);
    return true;
  });
  const candidates = [
    ...primaryArtistRows,
    ...rankedTracks.filter((row) => !primaryArtistRows.includes(row))
  ].slice(0, Math.max(targetPerStyle * 5, 80));

  const accepted = [];
  for (let offset = 0; offset < candidates.length && accepted.length < targetPerStyle; offset += 12) {
    const batch = candidates.slice(offset, offset + 12);
    const resolved = await mapLimit(batch, 6, async (row) => {
      const apple = await resolveAppleTrack(row);
      const deezer = await resolveDeezerTrack(row);
      if (!apple && !deezer) return null;
      const bpm = normalizeBpmForStyle(style, Number(row.bpm_exact) || Number(deezer?.bpm) || 0);
      const previewUrl = apple
        ? String(apple.previewUrl || "").replace(/^http:/, "https:")
        : "";
      return {
        style,
        artist: String(apple?.artistName || row.artist).trim(),
        song: String(apple?.trackName || row.song).trim(),
        label: String(apple?.collectionName || deezer?.album?.title || row.label || "Catálogo verificado").trim(),
        bpmExact: bpm,
        durationSec: apple
          ? Math.round((Number(apple.trackTimeMillis) || Number(row.duration_sec) * 1000 || 0) / 1000)
          : Math.round(Number(deezer?.duration) || Number(row.duration_sec) || 0),
        previewUrl,
        previewCandidates: previewUrl ? [previewUrl] : [],
        previewProvider: apple ? "apple" : "deezer",
        appleTrackId: String(apple?.trackId || ""),
        appleTrackUrl: String(apple?.trackViewUrl || ""),
        deezerTrackId: String(row.deezer_track_id || ""),
        source: "curated_discovery_playable_inventory_v1",
        sourceFile: row.source_file,
        catalogConfidence: "1"
      };
    });
    resolved.filter(Boolean).forEach((entry) => {
      const key = `${comparable(entry.artist)}::${titleComparable(entry.song)}`;
      if (accepted.some((item) => `${comparable(item.artist)}::${titleComparable(item.song)}` === key)) return;
      accepted.push(entry);
    });
  }

  if (accepted.length < targetPerStyle) {
    const usedTrackKeys = new Set(
      accepted.map((item) => `${comparable(item.artist)}::${titleComparable(item.song)}`)
    );
    const seenSeedArtists = new Set();
    const artistSeeds = rows
      .filter((row) => row.style === style && !row.song)
      .filter((row) => {
        const allowlist = curatedSeedArtists[style];
        if (!allowlist?.length) return true;
        return allowlist.some((artist) => comparable(artist) === comparable(row.artist));
      })
      .sort((left, right) => {
        const priority = (row) => {
          if (/artist_expansion_seeds_v(?:5|6|10)\.csv$/i.test(row.source_file)) return 0;
          if (/artist_expansion_seeds_v(?:7|8|9)\.csv$/i.test(row.source_file)) return 1;
          return 2;
        };
        return priority(left) - priority(right);
      })
      .filter((row) => {
        const key = comparable(row.artist);
        if (!key || seenSeedArtists.has(key)) return false;
        seenSeedArtists.add(key);
        return true;
      })
      .slice(0, Math.max(targetPerStyle * 4, 80));

    for (let offset = 0; offset < artistSeeds.length && accepted.length < targetPerStyle; offset += 8) {
      const batch = artistSeeds.slice(offset, offset + 8);
      const resolved = await mapLimit(batch, 4, async (row) => {
        const deezer = await resolveDeezerArtistTrack(row, usedTrackKeys);
        if (!deezer) return null;
        const bpmValue = normalizeBpmForStyle(style, deezer.bpm);
        return {
          style,
          artist: String(deezer.artist?.name || row.artist).trim(),
          song: String(deezer.title || "").trim(),
          label: String(deezer.album?.title || "Catálogo verificado").trim(),
          bpmExact: bpmValue,
          durationSec: Math.round(Number(deezer.duration) || 0),
          previewUrl: "",
          previewCandidates: [],
          previewProvider: "deezer",
          appleTrackId: "",
          appleTrackUrl: "",
          deezerTrackId: String(deezer.id || ""),
          source: "curated_discovery_playable_inventory_v1",
          sourceFile: row.source_file,
          catalogConfidence: "1"
        };
      });
      resolved.filter(Boolean).forEach((entry) => {
        const key = `${comparable(entry.artist)}::${titleComparable(entry.song)}`;
        if (usedTrackKeys.has(key)) return;
        usedTrackKeys.add(key);
        accepted.push(entry);
      });
    }
  }
  inventory.push(...accepted.slice(0, targetPerStyle));
  console.log(`${style}: ${Math.min(accepted.length, targetPerStyle)}/${targetPerStyle}`);
}

const groupedCounts = Object.fromEntries(
  styleTargets.map((style) => [style, inventory.filter((item) => item.style === style).length])
);
const output = {
  version: 1,
  generatedAt: new Date().toISOString(),
  targetPerStyle,
  counts: groupedCounts,
  tracks: inventory
};
await fs.writeFile(outputPath, `${JSON.stringify(output, null, 2)}\n`);
console.log(`Wrote ${inventory.length} verified previews to ${path.relative(rootDir, outputPath)}`);
