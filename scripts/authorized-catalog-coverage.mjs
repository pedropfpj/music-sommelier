import { readFile } from "node:fs/promises";
import { resolve } from "node:path";
import { pathToFileURL } from "node:url";
import { parseArgs } from "node:util";
import authorizedMedia from "../lib/api/_authorized-media.js";

const settings = [
  { style: "full_on_night", bpm: [145, 155], observedCards: 5, chromiumDirect: 5, webkitDirect: 5 },
  { style: "bleep_techno", reviewed: "bleep-techno", observedCards: 20, chromiumDirect: 12, webkitDirect: 13 },
  { style: "french_house", reviewed: "french-house", observedCards: 20, chromiumDirect: 18, webkitDirect: 18 }
];
const target = 20;
const defaultManifest = new URL("../api/_authorized-catalog.json", import.meta.url);
const readJson = async path => JSON.parse(await readFile(path, "utf8"));

function artistCredits(rows) {
  return new Set(rows.map(row => row.artist.normalize("NFKC").trim().replace(/\s+/g, " ").toLowerCase())).size;
}

function numericBpm(value) {
  return /^\d+(?:\.\d+)?$/.test(String(value ?? "").trim()) && Number.isFinite(Number(value)) && Number(value) > 0;
}

function matchesBpm(value, bpm) {
  return !bpm || (numericBpm(value) && Number(value) >= bpm[0] && Number(value) <= bpm[1]);
}

function routeKind(track) {
  const preview = track.preview_url || "";
  if (/\/api\/deezer-preview(?:[?#]|$)/i.test(preview)) return "lookupOrRedirect";
  if (/^https:\/\//i.test(preview)) return "httpsPreviewUrl";
  if (track.bandcamp_track_id || track.bandcamp_track_url ||
      track.soundcloud_track_url || track.youtube_track_url) return "providerPlayerCandidate";
  if (track.deezer_track_id || track.apple_track_id) return "lookupOrRedirect";
  return "noKnownRoute";
}

function summarizeShard(rows) {
  const routes = { httpsPreviewUrl: 0, providerPlayerCandidate: 0, lookupOrRedirect: 0, noKnownRoute: 0 };
  for (const row of rows) routes[routeKind(row)]++;
  const taggedWithBrowserCheck = rows.filter(row => String(row.source_tags || "").split(";").includes("audio_browser_verified"));

  return {
    rows: rows.length,
    artistCredits: artistCredits(rows),
    exactRecordingIds: new Set(rows.map(row => row.recording_id).filter(Boolean)).size,
    numericBpmRows: rows.filter(row => numericBpm(row.bpm)).length,
    routes,
    rowsTaggedWithBrowserCheck: taggedWithBrowserCheck.length
  };
}

function summarizeReview(review, bpm) {
  if (!review) return null;
  const rows = review.records.filter(({ proof }) => matchesBpm(proof.bpmExact, bpm));
  const providers = {};
  for (const { proof } of rows) providers[proof.provider] = (providers[proof.provider] || 0) + 1;
  return {
    rows: rows.length,
    artistCredits: artistCredits(rows.map(({ row }) => row)),
    exactBpmRows: rows.filter(({ proof }) => numericBpm(proof.bpmExact)).length,
    providers
  };
}

function parseManifest(manifest, time) {
  if (!manifest || manifest.version !== 1 || manifest.mode !== authorizedMedia.mode ||
      !Array.isArray(manifest.recordings)) throw new Error("Use um manifesto gerado pelo importador de prévias autorizadas.");

  return authorizedMedia.activeRecordings(manifest, time);
}

async function auditSlice(config, authorized) {
  const { style, bpm, reviewed, observedCards, chromiumDirect, webkitDirect } = config;
  const shard = await readJson(new URL(`../data/runtime-catalog-v1/styles/${style}.json`, import.meta.url));
  const review = reviewed ? await readJson(new URL(`../data/${reviewed}-reviewed-recordings.json`, import.meta.url)) : null;
  const scopedRows = shard.filter(row => matchesBpm(row.bpm, bpm));
  const approvedRows = authorized?.filter(row => row.style === style && matchesBpm(row.bpm, bpm));

  return {
    style,
    bpm: bpm || null,
    runtimeShard: summarizeShard(shard),
    shardWithinRequestedRange: bpm ? summarizeShard(scopedRows) : null,
    reviewedOverlay: summarizeReview(review, bpm),
    historicalBrowserSample: { observedCards, chromiumDirect, webkitDirect },
    gapsInHistoricalSample: {
      cards: Math.max(0, target - observedCards),
      directAudio: Math.max(0, target - Math.min(chromiumDirect, webkitDirect))
    },
    activeApprovedPreviews: approvedRows ? {
      exactRecordingIds: new Set(approvedRows.map(row => row.id)).size,
      artistCredits: artistCredits(approvedRows)
    } : null
  };
}

export async function auditAuthorizedCatalog(manifest, at) {
  const time = Date.parse(at);
  if (!Number.isFinite(time)) throw new Error("Informe uma data válida em --as-of.");
  const authorized = manifest == null ? null : parseManifest(manifest, time);
  const slices = await Promise.all(settings.map(config => auditSlice(config, authorized)));
  return {
    asOf: new Date(time).toISOString(),
    targetSessionLength: target,
    historicalBrowserReport: "docs/web-discovery-next-20261116.md",
    auditedApprovedManifest: manifest != null,
    slices
  };
}

if (process.argv[1] && import.meta.url === pathToFileURL(resolve(process.argv[1])).href) {
  const { values } = parseArgs({
    options: { "as-of": { type: "string" }, manifest: { type: "string" } }
  });
  const manifest = await readJson(values.manifest || defaultManifest);
  const report = await auditAuthorizedCatalog(manifest, values["as-of"] || new Date().toISOString());
  console.log(JSON.stringify(report, null, 2));
}
