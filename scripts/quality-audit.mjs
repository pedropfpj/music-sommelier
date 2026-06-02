#!/usr/bin/env node
import fs from "node:fs";
import path from "node:path";
import vm from "node:vm";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const rootDir = path.resolve(__dirname, "..");
const appPath = path.join(rootDir, "app.js");
const reportsDir = path.join(rootDir, "reports");
const reportPath = path.join(reportsDir, "quality-audit-latest.md");
const strictMode = process.argv.includes("--strict");

const BLOCKS = [
  "SOUNDCLOUD_SUPPLEMENTAL_DJ_SEEDS",
  "LOCAL_TRACK_SEED_BOOST",
  "catalog",
  "discoveryCatalog",
  "STYLE_COVERAGE_OVERRIDES",
  "STYLE_BPM_RULES",
  "ARTIST_CANONICAL_ORIGINS",
  "COUNTRY_CODE_BY_NAME",
  "COUNTRY_BY_ORIGIN_AREA"
];

const GENERIC_SOURCE_PATTERNS = [
  /catalogo dinamico/i,
  /cat[aá]logo din[aâ]mico/i,
  /dynamic catalog/i,
  /global electronik/i,
  /various artists/i,
  /unknown artist/i,
  /sem artista/i
];

const REQUIRED_MINIMUMS = {
  tracks: 20,
  artists: 8,
  labels: 6
};

const LINK_FIELDS = [
  "spotifyUrl",
  "spotifyTrackUrl",
  "youtubeUrl",
  "youtubeTrackUrl",
  "soundcloudUrl",
  "soundcloudTrackUrl",
  "bandcampUrl",
  "bandcampTrackUrl",
  "beatportUrl"
];

function readAppSource() {
  if (!fs.existsSync(appPath)) {
    throw new Error(`app.js nao encontrado em ${appPath}`);
  }
  return fs.readFileSync(appPath, "utf8");
}

function normalize(value) {
  return String(value || "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/&/g, " and ")
    .replace(/[^a-z0-9]+/g, " ")
    .trim()
    .replace(/\s+/g, " ");
}

function findLiteralStart(source, name) {
  const declarationIndex = source.indexOf(`const ${name} =`);
  if (declarationIndex < 0) {
    throw new Error(`Bloco ${name} nao encontrado`);
  }

  const afterEquals = source.indexOf("=", declarationIndex);
  const objectStart = source.indexOf("{", afterEquals);
  const arrayStart = source.indexOf("[", afterEquals);
  const starts = [objectStart, arrayStart].filter((index) => index >= 0);
  return Math.min(...starts);
}

function extractConstLiteral(source, name) {
  const start = findLiteralStart(source, name);
  const opener = source[start];
  const closer = opener === "{" ? "}" : "]";
  let depth = 0;
  let quote = "";
  let escaped = false;
  let lineComment = false;
  let blockComment = false;

  for (let index = start; index < source.length; index += 1) {
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
      if (escaped) {
        escaped = false;
      } else if (char === "\\") {
        escaped = true;
      } else if (char === quote) {
        quote = "";
      }
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
    if (char === opener) depth += 1;
    if (char === closer) depth -= 1;
    if (depth === 0) {
      return source.slice(start, index + 1);
    }
  }

  throw new Error(`Nao consegui fechar o bloco ${name}`);
}

function evalLiteral(literal, name) {
  try {
    return vm.runInNewContext(`(${literal})`, Object.freeze({}), {
      timeout: 1000,
      displayErrors: true
    });
  } catch (error) {
    throw new Error(`Falha ao avaliar ${name}: ${error.message}`);
  }
}

function loadBlocks(source) {
  return Object.fromEntries(
    BLOCKS.map((name) => [name, evalLiteral(extractConstLiteral(source, name), name)])
  );
}

function trackId(track) {
  return `${normalize(track.artist)}::${normalize(track.song || track.title)}`;
}

function artistId(track) {
  return normalize(track.artist);
}

function labelId(track) {
  return normalize(track.label || track.recordLabel || track.album?.label);
}

function sourceName(track) {
  return track.sourceName || track.source || track.origin || "catalogo local";
}

function getTrackBpmInfo(track) {
  if (Number.isFinite(Number(track.bpmExact))) {
    const value = Number(track.bpmExact);
    return { min: value, max: value, label: String(value), exact: true };
  }
  if (Number.isFinite(Number(track.bpm))) {
    const value = Number(track.bpm);
    return { min: value, max: value, label: String(value), exact: true };
  }
  if (Number.isFinite(Number(track.tempo))) {
    const value = Number(track.tempo);
    return { min: value, max: value, label: String(value), exact: true };
  }

  const text = String(track.bpm || track.bpmText || track.tempo || "");
  const range = text.match(/(\d{2,3})\s*[-–]\s*(\d{2,3})/);
  if (range) {
    return {
      min: Number(range[1]),
      max: Number(range[2]),
      label: `${range[1]}-${range[2]}`,
      exact: false
    };
  }

  const plus = text.match(/(\d{2,3})\s*\+/);
  if (plus) {
    return { min: Number(plus[1]), max: Infinity, label: `${plus[1]}+`, exact: false };
  }

  const single = text.match(/(\d{2,3})/);
  if (single) {
    const value = Number(single[1]);
    return { min: value, max: value, label: String(value), exact: true };
  }

  return null;
}

function bpmFitsStyle(style, bpmInfo, rules) {
  const rule = rules[style];
  if (!rule || !bpmInfo || !Number.isFinite(bpmInfo.min)) return null;
  return bpmInfo.max >= rule.min && bpmInfo.min <= rule.max;
}

function targetForStyle(style, overrides) {
  return {
    tracks: overrides[style]?.tracks ?? REQUIRED_MINIMUMS.tracks,
    artists: overrides[style]?.artists ?? REQUIRED_MINIMUMS.artists,
    labels: overrides[style]?.labels ?? REQUIRED_MINIMUMS.labels
  };
}

function hasAnyLink(track) {
  return LINK_FIELDS.some((field) => Boolean(track[field]));
}

function looksGeneric(value) {
  return GENERIC_SOURCE_PATTERNS.some((pattern) => pattern.test(String(value || "")));
}

function findCountryForArtist(track, canonicalOrigins, countryByArea) {
  const artistKey = normalize(track.artist);
  const canonical = canonicalOrigins[artistKey] || canonicalOrigins[track.artist] || null;
  const direct =
    canonical?.country ||
    track.artistCountry ||
    track.country ||
    track.originCountry ||
    track.nationality ||
    null;
  if (direct) return direct;

  const area = canonical?.area || track.artistArea || track.area || track.origin || null;
  if (!area) return "";
  const normalizedArea = normalize(area);
  return countryByArea[area] || countryByArea[normalizedArea] || "";
}

function flagForCountry(country, countryCodes) {
  const raw = String(country || "").trim();
  if (!raw) return "";
  const code = raw.length === 2 ? raw.toUpperCase() : countryCodes[raw] || countryCodes[normalize(raw)] || "";
  if (!/^[A-Z]{2}$/.test(code)) return "";
  return code
    .split("")
    .map((letter) => String.fromCodePoint(127397 + letter.charCodeAt(0)))
    .join("");
}

function addIssue(issues, severity, scope, message, detail = "") {
  issues.push({ severity, scope, message, detail });
}

function groupBy(items, callback) {
  const groups = new Map();
  for (const item of items) {
    const key = callback(item);
    if (!groups.has(key)) groups.set(key, []);
    groups.get(key).push(item);
  }
  return groups;
}

function uniqueCount(items, callback) {
  return new Set(items.map(callback).filter(Boolean)).size;
}

function makeTrackLabel(track) {
  const artist = track.artist || "Artista sem nome";
  const song = track.song || track.title || "Faixa sem titulo";
  const style = track.style || "sem estilo";
  return `${artist} - ${song} [${style}]`;
}

function makeArtistSeedLabel(seed) {
  const artist = seed.artist || seed.name || "Artista sem nome";
  const style = seed.style || "sem estilo";
  return `${artist} [${style}]`;
}

function auditCatalog(blocks) {
  const {
    SOUNDCLOUD_SUPPLEMENTAL_DJ_SEEDS,
    LOCAL_TRACK_SEED_BOOST,
    catalog,
    discoveryCatalog,
    STYLE_COVERAGE_OVERRIDES,
    STYLE_BPM_RULES,
    ARTIST_CANONICAL_ORIGINS,
    COUNTRY_CODE_BY_NAME,
    COUNTRY_BY_ORIGIN_AREA
  } = blocks;

  const discoveryRecords = discoveryCatalog.map((seed) => ({
    ...seed,
    artist: seed.artist || seed.name,
    artistBio: seed.artistBio || seed.bio,
    auditSource: "discoveryCatalog",
    auditType: seed.song || seed.title ? "track" : "artistSeed"
  }));
  const allRecords = [
    ...catalog.map((track) => ({ ...track, auditSource: "catalog", auditType: "track" })),
    ...discoveryRecords,
    ...LOCAL_TRACK_SEED_BOOST.map((track) => ({ ...track, auditSource: "LOCAL_TRACK_SEED_BOOST" })),
    ...SOUNDCLOUD_SUPPLEMENTAL_DJ_SEEDS.map((track) => ({
      ...track,
      auditSource: "SOUNDCLOUD_SUPPLEMENTAL_DJ_SEEDS"
    }))
  ];
  const allTracks = allRecords.filter((record) => record.auditType !== "artistSeed");
  const artistSignals = allRecords.filter((record) => record.artist || record.name);

  const issues = [];
  const styleGroups = groupBy(allTracks.filter((track) => track.style), (track) => track.style);
  const artistStyleGroups = groupBy(artistSignals.filter((record) => record.style), (record) => record.style);
  const knownStyles = new Set(Object.keys(STYLE_BPM_RULES));

  allRecords.forEach((track) => {
    if (track.auditType === "artistSeed") {
      const label = makeArtistSeedLabel(track);
      if (!track.artist) {
        addIssue(issues, "critical", label, "Seed sem nome de artista.", track.auditSource);
      }
      if (!track.style || !knownStyles.has(track.style)) {
        addIssue(issues, "critical", label, "Estilo nao existe em STYLE_BPM_RULES.", track.auditSource);
      }
      if (looksGeneric(track.artist)) {
        addIssue(issues, "critical", label, "Artista parece generico ou placeholder.", track.auditSource);
      }
      if (!track.artistBio && !track.artistProfileHint) {
        addIssue(issues, "warning", label, "Seed sem bio ou pista editorial do artista.", track.auditSource);
      }
      if (!hasAnyLink(track)) {
        addIssue(issues, "warning", label, "Seed sem link externo verificavel.", track.auditSource);
      }
      return;
    }

    const label = makeTrackLabel(track);
    if (!track.artist || !track.song) {
      addIssue(issues, "critical", label, "Faixa sem artista ou titulo.", track.auditSource);
    }

    if (!track.style || !knownStyles.has(track.style)) {
      addIssue(issues, "critical", label, "Estilo nao existe em STYLE_BPM_RULES.", track.auditSource);
    }

    const bpmInfo = getTrackBpmInfo(track);
    if (!bpmInfo) {
      addIssue(issues, "warning", label, "BPM ausente ou ilegivel.", track.auditSource);
    } else {
      const fits = bpmFitsStyle(track.style, bpmInfo, STYLE_BPM_RULES);
      if (fits === false) {
        const rule = STYLE_BPM_RULES[track.style];
        addIssue(
          issues,
          "critical",
          label,
          `BPM ${bpmInfo.label} fora da faixa esperada (${rule.min}-${rule.max}).`,
          track.auditSource
        );
      }
    }

    if (looksGeneric(track.artist)) {
      addIssue(issues, "critical", label, "Artista parece generico ou placeholder.", track.auditSource);
    }

    if (looksGeneric(track.label)) {
      addIssue(issues, "warning", label, "Gravadora parece generica ou placeholder.", track.auditSource);
    }

    if (!track.artistBio && !track.artistProfileHint) {
      addIssue(issues, "warning", label, "Sem bio ou pista editorial do artista.", track.auditSource);
    }

    if (!hasAnyLink(track)) {
      addIssue(issues, "warning", label, "Sem link externo verificavel.", track.auditSource);
    }
  });

  for (const [key, tracks] of groupBy(allTracks, trackId)) {
    if (!key.includes("::") || tracks.length <= 1) continue;
    addIssue(
      issues,
      "warning",
      tracks[0].artist || key,
      "Faixa duplicada no catalogo.",
      tracks.map((track) => `${track.auditSource}:${track.style}`).join(", ")
    );
  }

  const artistGroups = groupBy(artistSignals.filter((track) => track.artist), artistId);
  for (const [key, tracks] of artistGroups) {
    const sample = tracks[0];
    const country = findCountryForArtist(sample, ARTIST_CANONICAL_ORIGINS, COUNTRY_BY_ORIGIN_AREA);
    const flag = flagForCountry(country, COUNTRY_CODE_BY_NAME);
    if (!flag) {
      addIssue(
        issues,
        "warning",
        sample.artist || key,
        "Artista sem origem/bandeira confiavel.",
        "Adicionar artistCountry ou origem canonica."
      );
    }
  }

  const coverageRows = [...styleGroups.entries()]
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([style, tracks]) => {
      const target = targetForStyle(style, STYLE_COVERAGE_OVERRIDES);
      const artistSignalsForStyle = artistStyleGroups.get(style) || tracks;
      const actual = {
        tracks: tracks.length,
        artists: uniqueCount(artistSignalsForStyle, artistId),
        labels: uniqueCount(tracks, labelId)
      };
      const missing = {
        tracks: Math.max(0, target.tracks - actual.tracks),
        artists: Math.max(0, target.artists - actual.artists),
        labels: Math.max(0, target.labels - actual.labels)
      };
      const ok = !missing.tracks && !missing.artists && !missing.labels;
      if (!ok) {
        addIssue(
          issues,
          "warning",
          style,
          "Cobertura abaixo do alvo.",
          `faltam ${missing.tracks} faixas, ${missing.artists} artistas, ${missing.labels} labels`
        );
      }
      return { style, actual, target, missing, ok };
    });

  const stylesWithoutTracks = [...knownStyles]
    .filter((style) => !styleGroups.has(style))
    .sort();
  stylesWithoutTracks.forEach((style) => {
    addIssue(issues, "critical", style, "Estilo sem nenhuma faixa auditavel.", "Adicionar seeds.");
  });

  const counts = {
    tracks: allTracks.length,
    artists: uniqueCount(artistSignals, artistId),
    labels: uniqueCount(allTracks, labelId),
    styles: styleGroups.size,
    sources: uniqueCount(allRecords, (track) => sourceName(track))
  };

  return {
    counts,
    issues,
    coverageRows,
    stylesWithoutTracks,
    criticalCount: issues.filter((issue) => issue.severity === "critical").length,
    warningCount: issues.filter((issue) => issue.severity === "warning").length
  };
}

function formatTable(rows, headers) {
  const head = `| ${headers.join(" | ")} |`;
  const separator = `| ${headers.map(() => "---").join(" | ")} |`;
  const body = rows.map((row) => `| ${row.map((cell) => String(cell).replace(/\n/g, " ")).join(" | ")} |`);
  return [head, separator, ...body].join("\n");
}

function formatReport(result) {
  const status = result.criticalCount ? "ATENCAO" : result.warningCount ? "REVISAR" : "OK";
  const now = new Date();
  const sortedIssues = [...result.issues].sort((a, b) => {
    const severityRank = { critical: 0, warning: 1 };
    return (
      severityRank[a.severity] - severityRank[b.severity] ||
      a.scope.localeCompare(b.scope) ||
      a.message.localeCompare(b.message)
    );
  });
  const coverageRows = result.coverageRows.map((row) => [
    row.ok ? "OK" : "Revisar",
    row.style,
    `${row.actual.tracks}/${row.target.tracks}`,
    `${row.actual.artists}/${row.target.artists}`,
    `${row.actual.labels}/${row.target.labels}`,
    row.ok
      ? "Completo"
      : `faltam ${row.missing.tracks} faixas, ${row.missing.artists} artistas, ${row.missing.labels} labels`
  ]);
  const issueRows = sortedIssues.slice(0, 80).map((issue) => [
    issue.severity === "critical" ? "Critico" : "Aviso",
    issue.scope,
    issue.message,
    issue.detail
  ]);

  return [
    "# Quality Audit - Sonic Search",
    "",
    `Gerado em: ${now.toLocaleString("pt-BR", { timeZone: "America/Sao_Paulo" })}`,
    `Status: ${status}`,
    "",
    "## Resumo",
    "",
    `- Faixas auditadas: ${result.counts.tracks}`,
    `- Artistas unicos: ${result.counts.artists}`,
    `- Gravadoras/labels unicas: ${result.counts.labels}`,
    `- Estilos com faixas: ${result.counts.styles}`,
    `- Problemas criticos: ${result.criticalCount}`,
    `- Avisos: ${result.warningCount}`,
    "",
    "## Leitura rapida",
    "",
    result.criticalCount
      ? "- Primeiro resolva os itens criticos da tabela de problemas. Eles indicam erro que pode gerar recomendacao incorreta."
      : "- Nao ha itens criticos. Os avisos ajudam a enriquecer bio, links, bandeiras e cobertura.",
    "- Depois use a tabela de cobertura para escolher quais subgeneros precisam de mais musicas, artistas ou labels.",
    "- Quando os criticos zerarem, rode `node scripts/quality-audit.mjs --strict` antes de publicar.",
    "",
    "## Cobertura por subgenero",
    "",
    formatTable(coverageRows, ["Status", "Subgenero", "Faixas", "Artistas", "Labels", "Observacao"]),
    "",
    "## Problemas principais",
    "",
    issueRows.length
      ? formatTable(issueRows, ["Severidade", "Escopo", "Problema", "Detalhe"])
      : "Nenhum problema encontrado.",
    "",
    "## Como usar",
    "",
    "- Rode `node scripts/quality-audit.mjs` para gerar este relatorio sem bloquear o fluxo.",
    "- Rode `node scripts/quality-audit.mjs --strict` quando quiser falhar o processo se houver problema critico.",
    "- Use este relatorio antes de commit/push para evitar recomendacao errada, falta de bandeira e catalogo fraco.",
    ""
  ].join("\n");
}

function main() {
  const source = readAppSource();
  const blocks = loadBlocks(source);
  const result = auditCatalog(blocks);
  const report = formatReport(result);
  fs.mkdirSync(reportsDir, { recursive: true });
  fs.writeFileSync(reportPath, report, "utf8");

  const status = result.criticalCount ? "ATENCAO" : result.warningCount ? "REVISAR" : "OK";
  console.log(`Quality Audit: ${status}`);
  console.log(
    `${result.counts.tracks} faixas, ${result.counts.artists} artistas, ${result.counts.styles} estilos.`
  );
  console.log(`${result.criticalCount} criticos, ${result.warningCount} avisos.`);
  console.log(`Relatorio: ${path.relative(rootDir, reportPath)}`);

  if (strictMode && result.criticalCount > 0) {
    process.exitCode = 1;
  }
}

main();
