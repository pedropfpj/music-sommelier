#!/usr/bin/env node
import fs from "node:fs";
import path from "node:path";
import vm from "node:vm";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const rootDir = path.resolve(__dirname, "..");
const appPath = path.join(rootDir, "app.js");
const dataDir = path.join(rootDir, "data");
const catalogV2RowsPath = path.join(rootDir, "reports", "catalog_extra_electronic_v2.rows.json");
const catalogV2MigrationPath = path.join(rootDir, "supabase", "migrations", "20260713000200_electronic_catalog_v2.sql");
const catalogGateConsistencyPath = path.join(rootDir, "supabase", "migrations", "20260713000300_electronic_gate_consistency.sql");
const legacyCatalogGatePath = path.join(rootDir, "supabase", "migrations", "20260713000400_legacy_catalog_gate_rls.sql");
const bigBeatMigrationPath = path.join(rootDir, "supabase", "migrations", "20260713000500_big_beat_chemical_brothers.sql");
const appSource = fs.readFileSync(appPath, "utf8");
const catalogExtraApiSource = fs.readFileSync(path.join(rootDir, "api", "catalog-extra.js"), "utf8");
const bigBeatMigration = fs.readFileSync(bigBeatMigrationPath, "utf8");

function assert(condition, message) {
  if (!condition) throw new Error(message);
}

function functionSource(source, name) {
  const marker = `function ${name}`;
  const start = source.indexOf(marker);
  if (start < 0) throw new Error(`Function not found: ${name}`);
  const signatureEnd = source.slice(start).match(/\)\s*\{/);
  if (!signatureEnd) throw new Error(`Function body not found: ${name}`);
  const bodyStart = start + signatureEnd.index + signatureEnd[0].lastIndexOf("{");
  let depth = 0;
  let quote = "";
  let escaped = false;
  let lineComment = false;
  let blockComment = false;
  for (let index = bodyStart; index < source.length; index += 1) {
    const char = source[index];
    const next = source[index + 1];
    if (lineComment) {
      if (char === "\n") lineComment = false;
      continue;
    }
    if (blockComment) {
      if (char === "*" && next === "/") {
        blockComment = false;
        index += 1;
      }
      continue;
    }
    if (quote) {
      if (escaped) escaped = false;
      else if (char === "\\") escaped = true;
      else if (char === quote) quote = "";
      continue;
    }
    if (char === "/" && next === "/") {
      lineComment = true;
      index += 1;
      continue;
    }
    if (char === "/" && next === "*") {
      blockComment = true;
      index += 1;
      continue;
    }
    if (char === "\"" || char === "'" || char === "`") {
      quote = char;
      continue;
    }
    if (char === "{") depth += 1;
    if (char === "}") depth -= 1;
    if (depth === 0) return source.slice(start, index + 1);
  }
  throw new Error(`Unclosed function: ${name}`);
}

function normalize(text = "") {
  return String(text)
    .toLowerCase()
    .normalize("NFD")
    .replace(/[^\w\s]/g, "")
    .trim();
}

function identityNormalize(text = "") {
  return String(text || "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/&/g, " and ")
    .replace(/[^a-z0-9]+/g, " ")
    .trim()
    .replace(/\s+/g, " ");
}

function catalogTrackMetadataText(track = {}, key = "") {
  const metadata = track.catalogMetadata || track.metadata || {};
  const direct = track[key];
  const value = direct != null && direct !== "" ? direct : metadata[key];
  if (Array.isArray(value)) return value.join(" ");
  if (value && typeof value === "object") return "";
  return String(value ?? "").trim();
}

const sandbox = {
  normalize,
  catalogTrackMetadataText,
  hasReliableBpmForTrack: (track = {}) => Number(track.bpmExact) > 0
};
vm.createContext(sandbox);
vm.runInContext(`${functionSource(appSource, "hasNonElectronicReleaseConflict")}; this.trackConflict = hasNonElectronicReleaseConflict;`, sandbox);
vm.runInContext(`${functionSource(appSource, "djSeedHasNonElectronicConflict")}; this.djConflict = djSeedHasNonElectronicConflict;`, sandbox);

const trackFixtures = [
  {
    expected: true,
    name: "homonym indie-rock release",
    track: { artist: "Once Upon a Time", song: "Grad", label: "The Best of Indie Rock Made in Croatia", sourceType: "deezer_existing_artist_playable_depth" }
  },
  {
    expected: true,
    name: "homonym hip-hop/pop box set",
    track: { artist: "Blaze", song: "Shout", label: "The Mighty Death Pop! Box Set", sourceType: "deezer_existing_artist_playable_depth" }
  },
  {
    expected: true,
    name: "R&B compilation",
    track: { artist: "CeCe Rogers", song: "Don't Run Away Girl", label: "Retro R&B 90s Classics", sourceType: "deezer_existing_artist_playable_depth" }
  },
  {
    expected: true,
    name: "acoustic version",
    track: { artist: "Above & Beyond", song: "Miracle", label: "Acoustic", sourceType: "deezer_artist_top_track_depth" }
  },
  {
    expected: false,
    name: "verified electronic remix",
    track: { artist: "Oliver Heldens", song: "I Was Made For Lovin' You", label: "DubDogz, Bhaskar Remix", sourceType: "deezer_artist_top_track_depth" }
  },
  {
    expected: false,
    name: "curated electronic anchor",
    track: { artist: "Astrix", song: "Deep Jungle Walk", label: "He.Art", sourceType: "curated_electronic_subgenre_anchor" }
  }
];

trackFixtures.forEach(({ expected, name, track }) => {
  assert(sandbox.trackConflict(track) === expected, `Track fixture failed: ${name}`);
});

const djFixtures = [
  { expected: true, name: "explicit hip-hop set", seed: { setTitle: "DJ Set - WIU, Matue, Teto, BK" , reason: "Hip Hop set" } },
  { expected: true, name: "explicit R&B/soul set", seed: { setTitle: "Dancehall, R&B, Soul Mix" } },
  { expected: true, name: "mixed electronic and hip-hop set", seed: { setTitle: "Gqom, Amapiano, Baile Funk, Hiphop" } },
  { expected: false, name: "electronic club set", seed: { setTitle: "DJ Nobu at RADAR | Dekmantel Festival" } }
];

djFixtures.forEach(({ expected, name, seed }) => {
  assert(sandbox.djConflict(seed) === expected, `DJ fixture failed: ${name}`);
});

assert(appSource.includes("source_type: sourceType"), "External source_type is not preserved in catalog metadata");
assert(appSource.includes("sourceType: String(sourceType || safeCatalogMetadata.source_type"), "Hydrated tracks lose source_type");
assert(
  /function renderRecommendation\(track, prefs\)[\s\S]{0,180}!isTrackEligibleForRecommendation\(track\)/.test(appSource),
  "The final recommendation renderer has no electronic-integrity gate"
);
assert(
  /function presentInstantSwipeRecommendation[\s\S]{0,220}!isTrackEligibleForRecommendation\(track\)/.test(appSource),
  "Instant recommendations can bypass the eligibility gate"
);
const recommendationFunction = functionSource(appSource, "generateRecommendationFromPrefs");
assert(
  recommendationFunction.includes("let stylePool = strictStylePool;"),
  "Emergency recommendation fallback can bypass strict eligibility"
);
assert(
  recommendationFunction.includes("if (!isTrackEligibleForRecommendation(currentRecommendation))"),
  "Recommendation delivery has no final eligibility assertion"
);
assert(
  catalogExtraApiSource.includes('params.set("metadata->>electronic_gate", "eq.passed")'),
  "Catalog API can expose legacy rows that did not pass the electronic gate"
);
assert(appSource.includes('big_beat: ["The Chemical Brothers"'), "Big Beat artist seeds are missing The Chemical Brothers");
assert(
  appSource.includes('"the chemical brothers": ["big_beat", "breakbeat"]'),
  "The Chemical Brothers artist-style override is missing"
);
assert(
  bigBeatMigration.includes("create trigger enforce_catalog_track_style_lock") &&
    bigBeatMigration.includes("'the_chemical_brothers'") &&
    bigBeatMigration.includes("array['big_beat', 'breakbeat']::text[]"),
  "The database has no persistent style lock for The Chemical Brothers"
);
assert(
  (bigBeatMigration.match(/'source_type','curated_electronic_subgenre_anchor'/g) || []).length === 6,
  "The Chemical Brothers Big Beat seed must contain exactly six verified tracks"
);

function parseCsv(text = "") {
  const rows = [];
  let row = [];
  let cell = "";
  let quoted = false;
  for (let index = 0; index < text.length; index += 1) {
    const char = text[index];
    const next = text[index + 1];
    if (quoted) {
      if (char === '"' && next === '"') {
        cell += '"';
        index += 1;
      } else if (char === '"') quoted = false;
      else cell += char;
      continue;
    }
    if (char === '"') quoted = true;
    else if (char === ",") {
      row.push(cell);
      cell = "";
    } else if (char === "\n") {
      row.push(cell.replace(/\r$/, ""));
      rows.push(row);
      row = [];
      cell = "";
    } else cell += char;
  }
  if (cell || row.length) {
    row.push(cell.replace(/\r$/, ""));
    rows.push(row);
  }
  if (!rows.length) return [];
  const headers = rows.shift().map((header) => header.trim());
  return rows
    .filter((values) => values.some((value) => String(value || "").trim()))
    .map((values) => Object.fromEntries(headers.map((header, index) => [header, values[index] || ""])));
}

const csvFiles = fs.readdirSync(dataDir).filter((name) => name.endsWith(".csv"));
let trackRows = 0;
let artistDepthRows = 0;
let quarantinedDepthRows = 0;
let hardConflicts = 0;
const foundFixtures = new Set();
const catalogRowsByStyle = new Map();
const electronicRowsByStyle = new Map();

for (const fileName of csvFiles) {
  const rows = parseCsv(fs.readFileSync(path.join(dataDir, fileName), "utf8"));
  for (const row of rows) {
    if (!row.artist || !row.song) continue;
    trackRows += 1;
    const track = {
      artist: row.artist,
      song: row.song,
      label: row.label,
      albumKeywords: row.album_keywords,
      sourceType: row.source_type || (/deezer.*playable[_\s-]*depth/i.test(row.source || "") ? row.source : ""),
      bpmExact: row.bpm_exact
    };
    const conflict = sandbox.trackConflict(track);
    const style = String(row.style || "").trim();
    if (style) {
      catalogRowsByStyle.set(style, Number(catalogRowsByStyle.get(style) || 0) + 1);
      if (!conflict) electronicRowsByStyle.set(style, Number(electronicRowsByStyle.get(style) || 0) + 1);
    }
    if (String(track.sourceType || "").includes("depth")) {
      artistDepthRows += 1;
      if (conflict) quarantinedDepthRows += 1;
    }
    if (conflict && !String(track.sourceType || "").includes("depth")) hardConflicts += 1;
    const fixtureKey = `${normalize(row.artist)}::${normalize(row.song)}`;
    if (["once upon a time::grad", "blaze::shout", "cece rogers::dont run away girl", "above  beyond::miracle"].includes(fixtureKey)) {
      assert(conflict, `Known catalog contamination escaped the gate: ${row.artist} - ${row.song}`);
      foundFixtures.add(fixtureKey);
    }
  }
}

assert(foundFixtures.size === 4, `Expected 4 known contaminated catalog fixtures, found ${foundFixtures.size}`);
const stylesEmptiedByGate = [...catalogRowsByStyle.keys()].filter((style) => !electronicRowsByStyle.get(style));
assert(!stylesEmptiedByGate.length, `Electronic gate emptied styles: ${stylesEmptiedByGate.join(", ")}`);

assert(fs.existsSync(catalogV2MigrationPath), "Electronic catalog v2 migration is missing");
const catalogV2Migration = fs.readFileSync(catalogV2MigrationPath, "utf8");
assert(fs.existsSync(catalogGateConsistencyPath), "Electronic gate consistency migration is missing");
const catalogGateConsistency = fs.readFileSync(catalogGateConsistencyPath, "utf8");
assert(fs.existsSync(legacyCatalogGatePath), "Legacy catalog gate migration is missing");
const legacyCatalogGate = fs.readFileSync(legacyCatalogGatePath, "utf8");
[
  "electronic_artists",
  "electronic_artist_aliases",
  "electronic_artist_external_ids",
  "electronic_genres",
  "electronic_artist_genres",
  "electronic_recordings",
  "electronic_recording_external_ids",
  "electronic_recording_genres",
  "electronic_playback_links",
  "electronic_source_assertions",
  "electronic_ingestion_runs",
  "electronic_catalog_quarantine"
].forEach((table) => {
  assert(catalogV2Migration.includes(`public.${table}`), `Catalog v2 migration is missing ${table}`);
});
assert(
  catalogV2Migration.includes("sync_catalog_track_to_electronic_v2"),
  "Catalog v1 tracks are not synchronized into catalog v2"
);
assert(
  catalogV2Migration.includes("recording_status = 'recommendable'"),
  "Catalog v2 public policy does not require recommendable recordings"
);
assert(
  catalogV2Migration.includes("electronic_gate', '')) = 'passed'"),
  "Catalog v2 synchronization does not require the electronic gate"
);
assert(
  catalogV2Migration.includes("grant select, insert, update, delete on public.catalog_artists to service_role") &&
    catalogV2Migration.includes("grant select, insert, update, delete on public.catalog_tracks to service_role"),
  "Catalog migration does not restore service_role privileges required by the remote importer"
);
assert(
  catalogGateConsistency.includes("electronic_recordings_recommendable_gate_check") &&
    catalogGateConsistency.includes("lower(coalesce(metadata->>'electronic_gate', '')) = 'passed'"),
  "Normalized recommendations do not enforce electronic_gate=passed at the database boundary"
);
assert(
  legacyCatalogGate.includes("catalog_tracks_published_electronic_gate_check") &&
    legacyCatalogGate.includes("catalog_artists_published_electronic_gate_check") &&
    legacyCatalogGate.includes("lower(coalesce(metadata->>'electronic_gate', '')) = 'passed'"),
  "Legacy catalog tables do not enforce electronic_gate=passed at the database boundary"
);

let catalogV2PublishedArtists = 0;
let catalogV2PublishedTracks = 0;
let catalogV2ReviewTracks = 0;
if (fs.existsSync(catalogV2RowsPath)) {
  const payload = JSON.parse(fs.readFileSync(catalogV2RowsPath, "utf8"));
  const artists = Array.isArray(payload.artists) ? payload.artists : [];
  const tracks = Array.isArray(payload.tracks) ? payload.tracks : [];
  assert(payload.gateVersion, "Catalog v2 rows do not declare a gate version");
  assert(artists.length > 0 && tracks.length > 0, "Catalog v2 rows are empty");

  const publishedArtistStyleKeys = new Set();
  const eligibleTrackArtistStyleKeys = new Set();
  tracks.forEach((row) => {
    const isPublished = row.status === "published";
    if (isPublished) {
      catalogV2PublishedTracks += 1;
      assert(row.metadata?.electronic_gate === "passed", `Published v2 track missed gate: ${row.artist} - ${row.song}`);
      const track = {
        artist: row.artist,
        song: row.song,
        label: row.label,
        albumKeywords: row.metadata?.album_keywords,
        sourceType: row.metadata?.source_type,
        bpmExact: row.bpm_exact,
        catalogMetadata: row.metadata
      };
      assert(!sandbox.trackConflict(track), `Published v2 track has non-electronic conflict: ${row.artist} - ${row.song}`);
      eligibleTrackArtistStyleKeys.add(`${row.style}::${identityNormalize(row.artist)}`);
    } else {
      catalogV2ReviewTracks += 1;
    }
  });
  artists.forEach((row) => {
    if (row.status !== "published") return;
    catalogV2PublishedArtists += 1;
    assert(row.metadata?.electronic_gate === "passed", `Published v2 artist missed gate: ${row.artist}`);
    const key = `${row.style}::${identityNormalize(row.artist)}`;
    publishedArtistStyleKeys.add(key);
    assert(eligibleTrackArtistStyleKeys.has(key), `Published v2 artist has no eligible track: ${row.style} / ${row.artist}`);
  });
  const effectiveStyles = new Set(tracks.map((row) => row.style).filter(Boolean));
  effectiveStyles.add("big_beat");
  assert(effectiveStyles.size === 169, "Catalog plus targeted migrations do not cover all 169 styles");
}

console.log("Electronic recommendation audit passed.");
console.log(`Catalog rows inspected: ${trackRows}`);
console.log(`Electronic styles left with eligible catalog rows: ${electronicRowsByStyle.size}`);
console.log(`Artist-depth rows inspected: ${artistDepthRows}`);
console.log(`Artist-depth rows quarantined without recording-level proof: ${quarantinedDepthRows}`);
console.log(`Other explicit non-electronic release conflicts quarantined: ${hardConflicts}`);
console.log(`Behavior fixtures passed: ${trackFixtures.length + djFixtures.length}`);
if (fs.existsSync(catalogV2RowsPath)) {
  console.log(`Catalog v2 published artists: ${catalogV2PublishedArtists}`);
  console.log(`Catalog v2 published tracks: ${catalogV2PublishedTracks}`);
  console.log(`Catalog v2 tracks kept in review: ${catalogV2ReviewTracks}`);
}
