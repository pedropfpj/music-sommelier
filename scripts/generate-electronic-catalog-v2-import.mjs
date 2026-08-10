#!/usr/bin/env node
import fs from "node:fs";
import path from "node:path";
import vm from "node:vm";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, "..");
const DEFAULT_INPUT = path.join(ROOT, "reports", "catalog_extra_bulk_local_20260621.rows.json");
const DEFAULT_OUTPUT = path.join(ROOT, "reports", "catalog_extra_electronic_v2.rows.json");
const DEFAULT_REPORT = path.join(ROOT, "reports", "catalog-extra-electronic-v2-latest.md");
const GATE_VERSION = "20260805_electronic_v3";
const BATCH_KEY = "catalog_extra_electronic_v2";

function parseArgs(argv) {
  const args = {
    input: DEFAULT_INPUT,
    output: DEFAULT_OUTPUT,
    report: DEFAULT_REPORT
  };
  for (let index = 0; index < argv.length; index += 1) {
    const arg = argv[index];
    if (arg === "--input") args.input = path.resolve(ROOT, argv[++index] || "");
    else if (arg.startsWith("--input=")) args.input = path.resolve(ROOT, arg.slice("--input=".length));
    else if (arg === "--output") args.output = path.resolve(ROOT, argv[++index] || "");
    else if (arg.startsWith("--output=")) args.output = path.resolve(ROOT, arg.slice("--output=".length));
    else if (arg === "--report") args.report = path.resolve(ROOT, argv[++index] || "");
    else if (arg.startsWith("--report=")) args.report = path.resolve(ROOT, arg.slice("--report=".length));
  }
  return args;
}

function assert(condition, message) {
  if (!condition) throw new Error(message);
}

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

function metadataObject(row = {}) {
  if (row.metadata && typeof row.metadata === "object" && !Array.isArray(row.metadata)) {
    return { ...row.metadata };
  }
  if (typeof row.metadata === "string" && row.metadata.trim()) {
    try {
      const parsed = JSON.parse(row.metadata);
      if (parsed && typeof parsed === "object" && !Array.isArray(parsed)) return parsed;
    } catch (_error) {
      return {};
    }
  }
  return {};
}

function catalogTrackMetadataText(track = {}, key = "") {
  const metadata = track.catalogMetadata || track.metadata || {};
  const direct = track[key];
  const value = direct != null && direct !== "" ? direct : metadata[key];
  if (Array.isArray(value)) return value.join(" ");
  if (value && typeof value === "object") return "";
  return String(value ?? "").trim();
}

function gateTrack(row, conflictCheck) {
  const metadata = metadataObject(row);
  const sourceType = String(
    row.source_type ||
    metadata.source_type ||
    (/deezer.*(?:artist.*depth|playable[_\s-]*depth)/i.test(String(row.source || "")) ? row.source : "") ||
    ""
  ).trim();
  const track = {
    style: row.style,
    artist: row.artist,
    song: row.song,
    label: row.label,
    album: metadata.album,
    albumGenres: metadata.album_genres,
    releaseGenres: metadata.release_genres,
    collectionName: metadata.collection,
    albumKeywords: metadata.album_keywords,
    sourceType,
    bpmExact: row.bpm_exact,
    metadata,
    catalogMetadata: metadata
  };

  const missingIdentity = !String(row.style || "").trim() ||
    !String(row.artist || "").trim() ||
    !String(row.song || "").trim();
  const conflict = !missingIdentity && conflictCheck(track);
  let status = row.status || "needs_review";
  let gate = "passed";
  let reason = "recording_level_electronic_proof";
  let detail = "Recording passed the electronic release conflict gate.";

  if (missingIdentity) {
    status = status === "hidden" ? "hidden" : "needs_review";
    gate = "quarantined";
    reason = "missing_recording_identity";
    detail = "Style, artist or recording title is missing.";
  } else if (conflict) {
    status = status === "hidden" ? "hidden" : "needs_review";
    gate = "quarantined";
    reason = "non_electronic_release_conflict";
    detail = "Release-level evidence conflicts with the electronic catalog scope.";
  } else if (status !== "published") {
    gate = "candidate";
    reason = "source_requires_review";
    detail = "The source row was already marked for review and remains outside recommendations.";
  }

  const nextMetadata = {
    ...metadata,
    source_type: sourceType || metadata.source_type || "",
    catalog_scope: "electronic_music",
    normalized_catalog_version: 2,
    electronic_gate: gate,
    electronic_gate_version: GATE_VERSION,
    electronic_gate_reason: reason,
    electronic_gate_detail: detail,
    electronic_gate_checked_at: "2026-08-05"
  };

  return {
    row: {
      ...row,
      status,
      metadata: nextMetadata
    },
    conflict,
    gate,
    reason
  };
}

function styleArtistKey(style, artist) {
  return `${String(style || "").trim()}::${normalize(artist)}`;
}

function trackKey(row = {}) {
  return `${normalize(row.artist)}::${normalize(row.song)}`;
}

function gateArtist(row, eligibleArtistStyles) {
  const metadata = metadataObject(row);
  const key = styleArtistKey(row.style, row.artist);
  const hasEligibleRecording = eligibleArtistStyles.has(key);
  let status = row.status || "needs_review";
  let gate = "candidate";
  let reason = "no_eligible_recording";
  let detail = "Artist is stored as a candidate until recording-level electronic proof is available.";

  if (!String(row.style || "").trim() || !String(row.artist || "").trim()) {
    status = status === "hidden" ? "hidden" : "needs_review";
    gate = "quarantined";
    reason = "missing_artist_identity";
    detail = "Style or artist name is missing.";
  } else if (status === "hidden") {
    gate = "quarantined";
    reason = "artist_hidden_by_source";
    detail = "The source row explicitly hides this artist.";
  } else if (hasEligibleRecording) {
    status = "published";
    gate = "passed";
    reason = "eligible_recording_attached";
    detail = "At least one recording in this subgenre passed the electronic gate.";
  } else {
    status = "needs_review";
  }

  return {
    ...row,
    status,
    metadata: {
      ...metadata,
      catalog_scope: "electronic_music",
      normalized_catalog_version: 2,
      electronic_gate: gate,
      electronic_gate_version: GATE_VERSION,
      electronic_gate_reason: reason,
      electronic_gate_detail: detail,
      electronic_gate_checked_at: "2026-08-05"
    }
  };
}

function countBy(rows, callback) {
  const counts = new Map();
  rows.forEach((row) => {
    const key = callback(row) || "unknown";
    counts.set(key, Number(counts.get(key) || 0) + 1);
  });
  return Object.fromEntries([...counts.entries()].sort((a, b) => a[0].localeCompare(b[0])));
}

function formatNumber(value) {
  return Number(value || 0).toLocaleString("pt-BR");
}

function buildMarkdown(summary, styleRows, inputPath, outputPath) {
  const rows = styleRows.map((row) => [
    row.style,
    formatNumber(row.storedArtists),
    formatNumber(row.publishedArtists),
    formatNumber(row.storedTracks),
    formatNumber(row.publishedTracks),
    formatNumber(row.reviewTracks)
  ]);
  return [
    "# Catálogo eletrônico v2 — lote filtrado",
    "",
    `Gerado em ${summary.generatedAt}.`,
    "",
    "## Resumo",
    "",
    `- Artistas armazenados: **${formatNumber(summary.artistRows)}**`,
    `- Artistas únicos: **${formatNumber(summary.uniqueArtists)}**`,
    `- Artistas publicados com gravação elegível: **${formatNumber(summary.publishedArtistRows)}**`,
    `- Artistas mantidos para revisão: **${formatNumber(summary.reviewArtistRows)}**`,
    `- Faixas armazenadas: **${formatNumber(summary.trackRows)}**`,
    `- Faixas únicas: **${formatNumber(summary.uniqueTracks)}**`,
    `- Faixas publicáveis: **${formatNumber(summary.publishedTrackRows)}**`,
    `- Faixas em revisão/quarentena: **${formatNumber(summary.reviewTrackRows)}**`,
    `- Conflitos não eletrônicos explícitos: **${formatNumber(summary.nonElectronicConflicts)}**`,
    "",
    "## Arquivos",
    "",
    `- Entrada: \`${path.relative(ROOT, inputPath)}\``,
    `- Lote filtrado: \`${path.relative(ROOT, outputPath)}\``,
    `- Gate: \`${GATE_VERSION}\``,
    "",
    "## Cobertura por subgênero",
    "",
    "| Subgênero | Artistas armazenados | Artistas publicáveis | Faixas armazenadas | Faixas publicáveis | Faixas em revisão |",
    "| --- | ---: | ---: | ---: | ---: | ---: |",
    ...rows.map((row) => `| ${row.join(" | ")} |`),
    "",
    "Candidatos e conflitos continuam armazenados, mas apenas linhas com `electronic_gate=passed` recebem status `published`.",
    ""
  ].join("\n");
}

function main() {
  const args = parseArgs(process.argv.slice(2));
  assert(fs.existsSync(args.input), `Input not found: ${path.relative(ROOT, args.input)}`);
  const sourcePayload = JSON.parse(fs.readFileSync(args.input, "utf8"));
  const sourceArtists = Array.isArray(sourcePayload.artists) ? sourcePayload.artists : [];
  const sourceTracks = Array.isArray(sourcePayload.tracks) ? sourcePayload.tracks : [];
  assert(sourceArtists.length > 0, "No artist rows found in input");
  assert(sourceTracks.length > 0, "No track rows found in input");

  const appSource = fs.readFileSync(path.join(ROOT, "app.js"), "utf8");
  const sandbox = {
    normalize: (text = "") => String(text)
      .toLowerCase()
      .normalize("NFD")
      .replace(/[^\w\s]/g, "")
      .trim(),
    catalogTrackMetadataText,
    hasReliableBpmForTrack: (track = {}) => Number(track.bpmExact) > 0
  };
  vm.createContext(sandbox);
  vm.runInContext(
    `${functionSource(appSource, "hasNonElectronicReleaseConflict")}; this.trackConflict = hasNonElectronicReleaseConflict;`,
    sandbox
  );

  let nonElectronicConflicts = 0;
  const gatedTracks = sourceTracks.map((row) => {
    const result = gateTrack(row, sandbox.trackConflict);
    if (result.conflict) nonElectronicConflicts += 1;
    return result.row;
  });
  const eligibleArtistStyles = new Set(
    gatedTracks
      .filter((row) => row.status === "published" && row.metadata?.electronic_gate === "passed")
      .map((row) => styleArtistKey(row.style, row.artist))
  );
  const gatedArtists = sourceArtists.map((row) => gateArtist(row, eligibleArtistStyles));

  gatedTracks.forEach((row) => {
    if (row.status !== "published") return;
    assert(row.metadata?.electronic_gate === "passed", `Published track missed gate metadata: ${row.artist} - ${row.song}`);
    const result = gateTrack(row, sandbox.trackConflict);
    assert(!result.conflict, `Non-electronic conflict remained published: ${row.artist} - ${row.song}`);
  });
  gatedArtists.forEach((row) => {
    if (row.status !== "published") return;
    assert(row.metadata?.electronic_gate === "passed", `Published artist missed gate metadata: ${row.artist}`);
    assert(
      eligibleArtistStyles.has(styleArtistKey(row.style, row.artist)),
      `Published artist has no eligible recording in style: ${row.style} / ${row.artist}`
    );
  });

  const styles = [...new Set([...gatedArtists, ...gatedTracks].map((row) => String(row.style || "").trim()).filter(Boolean))]
    .sort((a, b) => a.localeCompare(b));
  const styleRows = styles.map((style) => {
    const artists = gatedArtists.filter((row) => row.style === style);
    const tracks = gatedTracks.filter((row) => row.style === style);
    return {
      style,
      storedArtists: artists.length,
      publishedArtists: artists.filter((row) => row.status === "published").length,
      storedTracks: tracks.length,
      publishedTracks: tracks.filter((row) => row.status === "published").length,
      reviewTracks: tracks.filter((row) => row.status !== "published").length
    };
  });

  const generatedAt = new Date().toISOString();
  const summary = {
    generatedAt,
    gateVersion: GATE_VERSION,
    artistRows: gatedArtists.length,
    uniqueArtists: new Set(gatedArtists.map((row) => normalize(row.artist)).filter(Boolean)).size,
    publishedArtistRows: gatedArtists.filter((row) => row.status === "published").length,
    reviewArtistRows: gatedArtists.filter((row) => row.status !== "published").length,
    trackRows: gatedTracks.length,
    uniqueTracks: new Set(gatedTracks.map(trackKey).filter((key) => key !== "::")).size,
    publishedTrackRows: gatedTracks.filter((row) => row.status === "published").length,
    reviewTrackRows: gatedTracks.filter((row) => row.status !== "published").length,
    nonElectronicConflicts,
    artistStatusCounts: countBy(gatedArtists, (row) => row.status),
    trackStatusCounts: countBy(gatedTracks, (row) => row.status),
    styles: styles.length
  };

  const outputPayload = {
    batch: BATCH_KEY,
    generatedAt,
    gateVersion: GATE_VERSION,
    sourceFile: path.relative(ROOT, args.input),
    summary,
    artists: gatedArtists,
    tracks: gatedTracks
  };

  fs.mkdirSync(path.dirname(args.output), { recursive: true });
  fs.mkdirSync(path.dirname(args.report), { recursive: true });
  fs.writeFileSync(args.output, `${JSON.stringify(outputPayload, null, 2)}\n`, "utf8");
  fs.writeFileSync(args.report, buildMarkdown(summary, styleRows, args.input, args.output), "utf8");

  console.log("Electronic catalog v2 batch generated.");
  console.log(`Artists: ${summary.artistRows} stored, ${summary.publishedArtistRows} published, ${summary.reviewArtistRows} review`);
  console.log(`Tracks: ${summary.trackRows} stored, ${summary.publishedTrackRows} published, ${summary.reviewTrackRows} review`);
  console.log(`Explicit non-electronic conflicts quarantined: ${summary.nonElectronicConflicts}`);
  console.log(`Styles: ${summary.styles}`);
  console.log(`Rows: ${path.relative(ROOT, args.output)}`);
  console.log(`Report: ${path.relative(ROOT, args.report)}`);
}

main();
