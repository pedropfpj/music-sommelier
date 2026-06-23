import fs from "node:fs";
import path from "node:path";

const ROOT = process.cwd();
const BATCH = "psycore_enrichment_v5_20260621";
const DATA_DIR = path.join(ROOT, "data");
const SEED_DIR = path.join(ROOT, "supabase", "seeds");
const REPORT_DIR = path.join(ROOT, "reports");
const TRACK_OUT = path.join(DATA_DIR, `${BATCH}.csv`);
const PROFILE_OUT = path.join(DATA_DIR, "psycore_artist_profiles_v5_20260621.csv");
const SQL_OUT = path.join(SEED_DIR, `${BATCH}.sql`);
const REPORT_OUT = path.join(REPORT_DIR, "psycore_enrichment_v5_2026-06-21.md");

const ARTIST_GENRE = "psycore / hi-tech psytrance / darkpsy";

const SOURCES = [
  {
    url: "https://voodoo-hoodoo.bandcamp.com/album/plankton-meets-vuduhudu",
    label: "Voodoo Hoodoo Records",
    sourceType: "bandcamp_jsonld_bpm_explicit",
    catalogRole: "solo_artist_bpm_anchor",
    country: "International",
    city: "Montreal",
    confidence: "high",
    include: "bpm_only",
    sourceNote: "Bandcamp JSON-LD exposes a psycore-tagged solo release with explicit 165-250 BPM titles."
  },
  {
    url: "https://voodoo-hoodoo.bandcamp.com/album/rite-of-passage-2026",
    label: "Voodoo Hoodoo Records",
    sourceType: "bandcamp_jsonld_bpm_explicit",
    catalogRole: "modern_2026_psycore_va",
    country: "International",
    city: "Montreal",
    confidence: "high",
    include: "bpm_only",
    sourceNote: "Bandcamp JSON-LD exposes 2026 psycore, darkpsy, hightech and forest tags with explicit BPM in most track titles."
  },
  {
    url: "https://voodoo-hoodoo.bandcamp.com/album/cursed-frequencies-volume-2-2026",
    label: "Voodoo Hoodoo Records",
    sourceType: "bandcamp_jsonld_bpm_explicit",
    catalogRole: "modern_2026_darkpsy_psycore_va",
    country: "International",
    city: "Montreal",
    confidence: "high",
    include: "bpm_only",
    sourceNote: "Bandcamp JSON-LD exposes 2026 darkpsy, hitech and psycore tags with explicit 160-200 BPM titles."
  },
  {
    url: "https://naturaizrecords.bandcamp.com/album/naturaiz-records-vol-2-free-download",
    label: "Naturaiz Records",
    sourceType: "bandcamp_jsonld_brazilian_psycore",
    catalogRole: "brazilian_scene_depth",
    country: "Brazil",
    city: "Sao Paulo",
    confidence: "high",
    include: "all",
    sourceNote: "Bandcamp JSON-LD exposes a 2026 Brazilian label release tagged Darkpsy, Forest, Hitech, Psycore and Psytrance."
  },
  {
    url: "https://blackoutrec.bandcamp.com/album/va-flight-of-the-hummingbird",
    label: "Black Out Records",
    sourceType: "bandcamp_jsonld_hitech_psycore_adjacent",
    catalogRole: "hitech_psycore_adjacent",
    country: "International",
    city: "",
    confidence: "medium_high",
    include: "all",
    extraTags: ["psycore-adjacent", "hitech-bridge"],
    sourceNote: "Bandcamp JSON-LD exposes a 2026 hightech VA with explicit 160-220 BPM titles; included as psycore-adjacent high BPM bridge material."
  },
  {
    url: "https://voodoo-hoodoo.bandcamp.com/album/mysterium-coniunctions-compiled-by-oxomo",
    label: "Voodoo Hoodoo Records",
    sourceType: "bandcamp_jsonld_profile_queue",
    catalogRole: "archive_profile_queue",
    country: "International",
    city: "Montreal",
    confidence: "medium_high",
    profileOnly: true,
    sourceNote: "Bandcamp JSON-LD exposes an archived psycore-tagged compilation; kept as artist research queue because BPM is not explicit."
  },
  {
    url: "https://voodoo-hoodoo.bandcamp.com/album/the-art-of-the-black-spells-compiled-by-neormm",
    label: "Voodoo Hoodoo Records",
    sourceType: "bandcamp_jsonld_profile_queue",
    catalogRole: "archive_profile_queue",
    country: "International",
    city: "Montreal",
    confidence: "medium_high",
    profileOnly: true,
    sourceNote: "Bandcamp JSON-LD exposes an archived psycore-tagged compilation; kept as artist research queue because BPM is not explicit."
  },
  {
    url: "https://voodoo-hoodoo.bandcamp.com/album/varazslo-meets-vuduhudu",
    label: "Voodoo Hoodoo Records",
    sourceType: "bandcamp_jsonld_profile_queue",
    catalogRole: "solo_archive_profile_queue",
    country: "International",
    city: "Montreal",
    confidence: "medium_high",
    profileOnly: true,
    sourceNote: "Bandcamp JSON-LD exposes a psycore-tagged solo artist release; kept as profile queue because BPM is not explicit."
  },
  {
    url: "https://voodoo-hoodoo.bandcamp.com/album/depuratus-meets-vuduhudu",
    label: "Voodoo Hoodoo Records",
    sourceType: "bandcamp_jsonld_profile_queue",
    catalogRole: "solo_archive_profile_queue",
    country: "International",
    city: "Montreal",
    confidence: "medium_high",
    profileOnly: true,
    sourceNote: "Bandcamp JSON-LD exposes a psycore and ethnocore tagged solo artist release; kept as profile queue because BPM is not explicit."
  }
];

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
  "cover_art_url",
  "album_keywords",
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

const trackNumeric = new Set(["bpm_exact", "duration_sec"]);

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

function existingPsycoreKeys() {
  const keys = new Set();
  const files = fs.existsSync(DATA_DIR)
    ? fs.readdirSync(DATA_DIR).filter((file) => /^psycore_enrichment_v\d+_\d+\.csv$/.test(file) && file !== `${BATCH}.csv`)
    : [];
  for (const file of files) {
    for (const row of readCsvRows(path.join(DATA_DIR, file))) {
      const artist = row.artist || row.artist_name || row.name;
      const song = row.song || row.track || row.title || row.track_name;
      if (artist && song) keys.add(keyFor({ style: row.style || "psycore", artist, song }));
    }
  }
  return keys;
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

function valuesSql(rows, headers, numericHeaders = new Set()) {
  return rows
    .map((row) => `(${headers.map((header) => numericHeaders.has(header) ? sqlNumber(row[header]) : sqlText(row[header])).join(", ")})`)
    .join(",\n");
}

function secondsFromIso(iso = "") {
  const match = String(iso).match(/P(?:(\d+)D)?T?(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?/);
  if (!match) return "";
  const [, days = 0, hours = 0, minutes = 0, seconds = 0] = match.map((part) => Number(part || 0));
  return days * 86400 + hours * 3600 + minutes * 60 + seconds;
}

function dateOnly(dateValue = "") {
  const parsed = new Date(dateValue);
  if (Number.isNaN(parsed.getTime())) return "";
  return parsed.toISOString().slice(0, 10);
}

function bpmFromTitle(title = "") {
  const match = ascii(title).match(/(?:\(|\[|\s)(\d{2,3})(?:\)|\]|\s*BPM)?\s*$/i);
  return match ? Number(match[1]) : "";
}

function cleanSong(title = "") {
  return ascii(title)
    .replace(/\s*(?:\(|\[)\d{2,3}(?:\)|\])\s*$/i, "")
    .replace(/\s+\d{2,3}\s*BPM\s*$/i, "")
    .trim();
}

function splitArtistTitle(title = "", trackArtist = "", releaseArtist = "") {
  const explicitArtist = ascii(trackArtist);
  if (explicitArtist) {
    return { artist: explicitArtist, song: cleanSong(title) };
  }
  const releaseFallback = ascii(releaseArtist);
  const parts = ascii(title).split(/\s+-\s+/).filter(Boolean);
  if (parts.length >= 2) {
    return {
      artist: parts.shift().replace(/\s+-$/, "").trim(),
      song: cleanSong(parts.join(" - "))
    };
  }
  if (releaseFallback && !/^various artists$/i.test(releaseFallback) && !/records$/i.test(releaseFallback)) {
    return { artist: releaseFallback, song: cleanSong(title) };
  }
  return { artist: "", song: cleanSong(title) };
}

function energyBand(bpm) {
  const value = Number(bpm);
  if (!Number.isFinite(value) || value <= 0) return "psycore_tagged_bpm_unknown";
  if (value < 170) return "darkpsy_psycore_entry_speed";
  if (value < 190) return "high_velocity_darkpsy";
  if (value < 210) return "extreme_psycore";
  return "ultra_fast_psycore";
}

function discoveryLinks(artist) {
  const artistQuery = encodeQuery(artist);
  const sceneQuery = encodeQuery(`${artist} psycore`);
  return [
    `https://bandcamp.com/search?q=${artistQuery}`,
    `https://soundcloud.com/search?q=${artistQuery}`,
    `https://www.youtube.com/results?search_query=${sceneQuery}`,
    `https://www.google.com/search?q=${artistQuery}%20official%20instagram%20soundcloud%20bandcamp`
  ].join(";");
}

function keyFor(row) {
  return `${normalize(row.style || "psycore")}::${normalize(row.artist)}::${normalize(row.song)}`;
}

function trackId(recording = {}) {
  return (recording.additionalProperty || []).find((property) => property.name === "track_id")?.value || "";
}

function publisherLinks(data) {
  return [
    data.publisher?.["@id"],
    ...(data.publisher?.mainEntityOfPage || []).map((entry) => entry.url)
  ].filter(Boolean);
}

async function fetchJsonLd(source) {
  const html = await fetch(source.url).then((response) => {
    if (!response.ok) throw new Error(`HTTP ${response.status} for ${source.url}`);
    return response.text();
  });
  const match = html.match(/<script type="application\/ld\+json">\s*([\s\S]*?)\s*<\/script>/);
  if (!match) throw new Error(`No JSON-LD found for ${source.url}`);
  return JSON.parse(match[1]);
}

function albumKeywords(data, source) {
  return [...new Set([...(data.keywords || []), ...(source.extraTags || [])].map(ascii).filter(Boolean))];
}

function sourceLabelLinks(data) {
  return publisherLinks(data).map(ascii).filter(Boolean);
}

function sourcePrimarySocial(data) {
  const links = publisherLinks(data);
  return links.find((link) => !/bandcamp\.com/i.test(link)) || data.publisher?.["@id"] || "";
}

function makeTrack(source, data, item) {
  const recording = item.item || {};
  const parsed = splitArtistTitle(recording.name, recording.byArtist?.name || "", data.byArtist?.name || "");
  const artist = ascii(parsed.artist);
  const song = ascii(parsed.song);
  const bpm = bpmFromTitle(recording.name);
  const keywords = albumKeywords(data, source);
  const labelLinks = sourceLabelLinks(data);
  const bpmText = bpm
    ? `${bpm} BPM in Bandcamp title`
    : `BPM not explicit; album keywords include ${keywords.slice(0, 5).join(", ")}`;
  const sourceAlbum = ascii(data.name);
  const artistBio = `${artist} entrou no catalogo psycore do Sonic Search via ${sourceAlbum}, com faixa rastreavel em ${source.label} e contexto ${source.catalogRole}.`;
  const hint = `Use ${artist} quando o usuario pedir psycore, hi-tech, darkpsy ou velocidade experimental; energia ${energyBand(bpm)}.`;
  return {
    style: "psycore",
    artist,
    song,
    label: ascii(source.label),
    bpm_exact: bpm,
    bpm_text: ascii(bpmText),
    release_date: dateOnly(data.datePublished),
    duration_sec: secondsFromIso(recording.duration),
    country: source.country,
    city: source.city,
    source_album: sourceAlbum,
    source_url: source.url,
    track_url: recording.mainEntityOfPage || recording["@id"] || source.url,
    external_track_id: trackId(recording) ? `bc:${trackId(recording)}` : "",
    source_type: source.sourceType,
    source_tags: keywords.join(";"),
    artist_bio: ascii(artistBio),
    artist_profile_hint: ascii(hint),
    primary_social_url: sourcePrimarySocial(data),
    social_discovery_links: discoveryLinks(artist),
    label_links: labelLinks.join(";"),
    cover_art_url: Array.isArray(data.image) ? data.image[0] : data.image || "",
    album_keywords: keywords.join(";"),
    energy_band: energyBand(bpm),
    catalog_role: source.catalogRole,
    status: "published",
    confidence: source.confidence,
    source_note: ascii(source.sourceNote)
  };
}

function shouldIncludeTrack(source, row) {
  if (!row.artist || !row.song) return false;
  if (source.include === "bpm_only") return Boolean(row.bpm_exact);
  return true;
}

function profileTrackLabel(row) {
  return row.bpm_exact ? `${row.song} (${row.bpm_exact})` : row.song;
}

function profileFromTracks(artist, rows) {
  const sorted = [...rows].sort((a, b) => String(b.release_date).localeCompare(String(a.release_date)));
  const bpms = sorted.map((row) => Number(row.bpm_exact)).filter((value) => Number.isFinite(value) && value > 0);
  const minBpm = bpms.length ? Math.min(...bpms) : "";
  const maxBpm = bpms.length ? Math.max(...bpms) : "";
  const albums = [...new Set(sorted.map((row) => row.source_album))];
  const labels = [...new Set(sorted.map((row) => row.label))];
  const roles = [...new Set(sorted.map((row) => row.catalog_role))];
  const country = sorted.find((row) => row.country)?.country || "";
  const city = sorted.find((row) => row.city)?.city || "";
  const bpmPhrase = bpms.length ? `BPM verificado entre ${minBpm} e ${maxBpm}.` : "BPM ainda nao explicito, mas fonte etiquetada como psycore/hitech.";
  const sceneRole = roles.includes("hitech_psycore_adjacent")
    ? "hitech_psycore_bridge"
    : roles.includes("brazilian_scene_depth")
      ? "brazilian_psycore_scene_depth"
      : "bpm_verified_psycore_artist";
  return {
    style: "psycore",
    artist,
    country,
    city,
    artist_bio: ascii(`${artist} tem ${sorted.length} faixa(s) novas no pacote V5, com fonte em ${labels.join(" / ")}. ${bpmPhrase} Anchors: ${albums.slice(0, 2).join(" / ")}.`),
    artist_genre: ARTIST_GENRE,
    artist_profile_hint: ascii(`Recomende ${artist} para ouvintes de psycore, hi-tech, darkpsy, forest pesado e energia extrema. Melhor uso: ${sceneRole}.`),
    scene_role: sceneRole,
    source_anchor: albums.join(";"),
    source_anchor_url: sorted[0].source_url,
    primary_social_url: sorted[0].primary_social_url,
    social_discovery_links: discoveryLinks(artist),
    label_links: [...new Set(sorted.flatMap((row) => row.label_links.split(";").filter(Boolean)))].join(";"),
    cover_art_url: sorted[0].cover_art_url,
    profile_tracks: sorted.map(profileTrackLabel).join(";"),
    status: "published",
    confidence: sorted.some((row) => row.confidence === "medium_high") ? "medium_high" : "high",
    source_note: ascii(`V5 artist profile generated from ${sorted.length} imported track(s): ${sorted.map(profileTrackLabel).slice(0, 6).join("; ")}.`)
  };
}

function profileQueueFromRecording(source, data, item) {
  const recording = item.item || {};
  const parsed = splitArtistTitle(recording.name, recording.byArtist?.name || "", data.byArtist?.name || "");
  const artist = ascii(parsed.artist);
  if (!artist) return null;
  const keywords = albumKeywords(data, source);
  const sourceAlbum = ascii(data.name);
  return {
    style: "psycore",
    artist,
    country: source.country,
    city: source.city,
    artist_bio: ascii(`${artist} esta na fila editorial psycore por aparecer em ${sourceAlbum}, fonte Bandcamp etiquetada com ${keywords.slice(0, 5).join(", ")}.`),
    artist_genre: ARTIST_GENRE,
    artist_profile_hint: ascii(`Verificar proximas faixas, BPM e links oficiais de ${artist}; candidato para aprofundar psycore/darkpsy/hitech.`),
    scene_role: source.catalogRole,
    source_anchor: sourceAlbum,
    source_anchor_url: source.url,
    primary_social_url: sourcePrimarySocial(data),
    social_discovery_links: discoveryLinks(artist),
    label_links: sourceLabelLinks(data).join(";"),
    cover_art_url: Array.isArray(data.image) ? data.image[0] : data.image || "",
    profile_tracks: ascii(parsed.song),
    status: "needs_review",
    confidence: source.confidence,
    source_note: ascii(source.sourceNote)
  };
}

function buildProfiles(trackRows, queueProfiles) {
  const grouped = new Map();
  for (const row of trackRows) {
    if (!grouped.has(row.artist)) grouped.set(row.artist, []);
    grouped.get(row.artist).push(row);
  }
  const profiles = [...grouped.entries()].map(([artist, rows]) => profileFromTracks(artist, rows));
  const existingArtists = new Set(profiles.map((profile) => normalize(profile.artist)));
  const queuedByArtist = new Map();
  for (const profile of queueProfiles) {
    const key = normalize(profile.artist);
    if (!key || existingArtists.has(key)) continue;
    if (!queuedByArtist.has(key)) {
      queuedByArtist.set(key, profile);
      continue;
    }
    const current = queuedByArtist.get(key);
    queuedByArtist.set(key, {
      ...current,
      source_anchor: [...new Set([current.source_anchor, profile.source_anchor].filter(Boolean))].join(";"),
      profile_tracks: [...new Set([current.profile_tracks, profile.profile_tracks].filter(Boolean))].join(";")
    });
  }
  return [...profiles, ...queuedByArtist.values()].sort((a, b) => a.artist.localeCompare(b.artist));
}

async function collectRows() {
  const existingKeys = existingPsycoreKeys();
  const internalKeys = new Set();
  const trackRows = [];
  const skippedDuplicates = [];
  const queueProfiles = [];
  const sourceSummaries = [];

  for (const source of SOURCES) {
    const data = await fetchJsonLd(source);
    const trackItems = data.track?.itemListElement || [];
    sourceSummaries.push({
      album: ascii(data.name),
      url: source.url,
      tracksFound: trackItems.length,
      keywords: albumKeywords(data, source).join(";"),
      profileOnly: Boolean(source.profileOnly)
    });
    for (const item of trackItems) {
      if (source.profileOnly) {
        const profile = profileQueueFromRecording(source, data, item);
        if (profile) queueProfiles.push(profile);
        continue;
      }
      const row = makeTrack(source, data, item);
      if (!shouldIncludeTrack(source, row)) continue;
      const key = keyFor(row);
      if (existingKeys.has(key) || internalKeys.has(key)) {
        skippedDuplicates.push(`${row.artist} - ${row.song}`);
        continue;
      }
      internalKeys.add(key);
      trackRows.push(row);
    }
  }

  trackRows.sort((a, b) => {
    const dateOrder = String(b.release_date).localeCompare(String(a.release_date));
    if (dateOrder) return dateOrder;
    return `${a.artist} ${a.song}`.localeCompare(`${b.artist} ${b.song}`);
  });

  return {
    trackRows,
    profileRows: buildProfiles(trackRows, queueProfiles),
    skippedDuplicates,
    sourceSummaries
  };
}

function buildSql(trackRows, profileRows) {
  return `-- Sonic Search - Psycore enrichment V5
-- Generated 2026-06-21.
-- Main sources: Bandcamp JSON-LD from Voodoo Hoodoo, Naturaiz Records and Black Out Records.
-- Run in Supabase SQL Editor only after review.

create temporary table if not exists psycore_enrichment_v5_tracks (
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
  cover_art_url text,
  album_keywords text,
  energy_band text,
  catalog_role text,
  status text not null,
  confidence text not null,
  source_note text not null
) on commit drop;

create temporary table if not exists psycore_artist_profiles_v5 (
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
  cover_art_url text,
  profile_tracks text,
  status text not null,
  confidence text not null,
  source_note text not null
) on commit drop;

truncate table psycore_enrichment_v5_tracks;
truncate table psycore_artist_profiles_v5;

insert into psycore_enrichment_v5_tracks (
  ${trackHeaders.join(",\n  ")}
) values
${valuesSql(trackRows, trackHeaders, trackNumeric)};

insert into psycore_artist_profiles_v5 (
  ${profileHeaders.join(",\n  ")}
) values
${valuesSql(profileRows, profileHeaders)};

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
    'profile_depth', 'artist_profile_v5',
    'confidence', confidence,
    'scene_role', scene_role,
    'source_anchor', source_anchor,
    'profile_tracks', case
      when coalesce(profile_tracks, '') = '' then array[]::text[]
      else string_to_array(profile_tracks, ';')
    end,
    'primary_social_url', primary_social_url,
    'social_discovery_links', case
      when coalesce(social_discovery_links, '') = '' then array[]::text[]
      else string_to_array(social_discovery_links, ';')
    end,
    'label_links', case
      when coalesce(label_links, '') = '' then array[]::text[]
      else string_to_array(label_links, ';')
    end,
    'cover_art_url', cover_art_url,
    'links_status', 'label_links_official_artist_links_discovery',
    'source_note', source_note
  )
from psycore_artist_profiles_v5
on conflict (style, artist_key) do update set
  country = coalesce(excluded.country, catalog_artists.country),
  city = coalesce(excluded.city, catalog_artists.city),
  artist_bio = excluded.artist_bio,
  artist_genre = excluded.artist_genre,
  artist_profile_hint = excluded.artist_profile_hint,
  source = excluded.source,
  source_url = excluded.source_url,
  status = case
    when catalog_artists.status = 'published' and excluded.status = 'needs_review' then catalog_artists.status
    else excluded.status
  end,
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
    'cover_art_url', cover_art_url,
    'album_keywords', string_to_array(album_keywords, ';'),
    'energy_band', energy_band,
    'catalog_role', catalog_role,
    'links_status', 'label_links_official_artist_links_discovery',
    'source_note', source_note
  )
from psycore_enrichment_v5_tracks
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

function buildReport({ trackRows, profileRows, skippedDuplicates, sourceSummaries }) {
  const tracksBySource = trackRows.reduce((acc, row) => {
    acc[row.source_album] = (acc[row.source_album] || 0) + 1;
    return acc;
  }, {});
  const publishedProfiles = profileRows.filter((row) => row.status === "published").length;
  const reviewProfiles = profileRows.filter((row) => row.status === "needs_review").length;
  const bpmRows = trackRows.filter((row) => row.bpm_exact).length;
  const noBpmRows = trackRows.length - bpmRows;
  return `# Psycore Enrichment V5 - 2026-06-21

## Objetivo

O V5 deixa o psycore menos cru: alem de mais faixas, adiciona capa do album, links oficiais de label, links de descoberta social por artista, papel editorial, faixa de energia e fila de artistas para pesquisa.

## Resultado

- ${trackRows.length} faixas novas em \`catalog_tracks\`;
- ${bpmRows} faixas com BPM explicito;
- ${noBpmRows} faixas sem BPM explicito, mas com album/tag psycore verificado;
- ${profileRows.length} perfis em \`catalog_artists\`;
- ${publishedProfiles} perfis publicados;
- ${reviewProfiles} perfis em \`needs_review\`;
- ${skippedDuplicates.length} duplicatas puladas antes de gerar o seed.

## Fontes importadas como faixas

${Object.entries(tracksBySource).map(([source, count]) => `- ${source}: ${count} faixas`).join("\n")}

## Fontes verificadas nesta rodada

${sourceSummaries.map((source) => `- ${source.album}: ${source.url}${source.profileOnly ? " (fila editorial)" : ""}`).join("\n")}

## Notas de qualidade

- Todas as fontes foram lidas de JSON-LD vivo do Bandcamp em 2026-06-21.
- Black Out Records entra como \`psycore-adjacent\` porque a fonte etiqueta principalmente hitech/hightech, nao psycore puro.
- Naturaiz Vol.2 entra mesmo sem BPM porque o album esta etiquetado como Psycore, Hitech, Forest, Darkpsy e representa cena brasileira.
- Perfis \`needs_review\` nao publicam faixas; servem para pesquisa manual de BPM, biografia e links oficiais no proximo lote.
- Links sociais de artista ainda sao discovery links; links oficiais confirmados sao principalmente de label/publisher.

## Arquivos

- \`data/psycore_enrichment_v5_20260621.csv\`
- \`data/psycore_artist_profiles_v5_20260621.csv\`
- \`supabase/seeds/psycore_enrichment_v5_20260621.sql\`
`;
}

const result = await collectRows();

fs.mkdirSync(DATA_DIR, { recursive: true });
fs.mkdirSync(SEED_DIR, { recursive: true });
fs.mkdirSync(REPORT_DIR, { recursive: true });
fs.writeFileSync(TRACK_OUT, csvWrite(result.trackRows, trackHeaders));
fs.writeFileSync(PROFILE_OUT, csvWrite(result.profileRows, profileHeaders));
fs.writeFileSync(SQL_OUT, buildSql(result.trackRows, result.profileRows));
fs.writeFileSync(REPORT_OUT, buildReport(result));

console.log(JSON.stringify({
  batch: BATCH,
  tracks: result.trackRows.length,
  profiles: result.profileRows.length,
  publishedProfiles: result.profileRows.filter((row) => row.status === "published").length,
  needsReviewProfiles: result.profileRows.filter((row) => row.status === "needs_review").length,
  skippedDuplicates: result.skippedDuplicates.length,
  files: [TRACK_OUT, PROFILE_OUT, SQL_OUT, REPORT_OUT]
}, null, 2));
