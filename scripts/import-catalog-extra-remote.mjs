#!/usr/bin/env node
import fs from "node:fs";
import path from "node:path";
import { spawnSync } from "node:child_process";

const ROOT = process.cwd();
const BATCH = "catalog_extra_bulk_local_20260621";
const DEFAULT_ROWS = path.join(ROOT, "reports", `${BATCH}.rows.json`);
const DEFAULT_SQL = path.join(ROOT, "supabase", "seeds", `${BATCH}.sql`);
const DEFAULT_STATUS_REPORT = path.join(ROOT, "reports", "supabase-remote-import-status-latest.json");
const DEFAULT_CHUNK_SIZE = 250;

function readText(filePath) {
  try {
    return fs.readFileSync(filePath, "utf8");
  } catch (_error) {
    return "";
  }
}

function parseEnvText(text = "") {
  const env = {};
  String(text || "").split(/\r?\n/).forEach((line) => {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#") || !trimmed.includes("=")) return;
    const index = trimmed.indexOf("=");
    const key = trimmed.slice(0, index).trim();
    const value = trimmed.slice(index + 1).trim().replace(/^['"]|['"]$/g, "");
    if (key) env[key] = value;
  });
  return env;
}

function loadEnv() {
  return {
    ...parseEnvText(readText(path.join(ROOT, ".env"))),
    ...parseEnvText(readText(path.join(ROOT, ".env.local"))),
    ...process.env
  };
}

function parseArgs(argv) {
  const args = {
    dryRun: false,
    requireElectronicGate: false,
    rowsFile: DEFAULT_ROWS,
    sqlFile: DEFAULT_SQL,
    chunkSize: DEFAULT_CHUNK_SIZE
  };

  for (let index = 0; index < argv.length; index += 1) {
    const arg = argv[index];
    if (arg === "--dry-run") args.dryRun = true;
    else if (arg === "--require-electronic-gate") args.requireElectronicGate = true;
    else if (arg === "--rows") args.rowsFile = path.resolve(ROOT, argv[++index] || "");
    else if (arg.startsWith("--rows=")) args.rowsFile = path.resolve(ROOT, arg.slice("--rows=".length));
    else if (arg === "--sql") args.sqlFile = path.resolve(ROOT, argv[++index] || "");
    else if (arg.startsWith("--sql=")) args.sqlFile = path.resolve(ROOT, arg.slice("--sql=".length));
    else if (arg === "--chunk-size") args.chunkSize = Number(argv[++index] || DEFAULT_CHUNK_SIZE);
    else if (arg.startsWith("--chunk-size=")) args.chunkSize = Number(arg.slice("--chunk-size=".length));
  }

  if (!Number.isFinite(args.chunkSize) || args.chunkSize < 1) args.chunkSize = DEFAULT_CHUNK_SIZE;
  return args;
}

function getDatabaseUrl(env) {
  return env.DATABASE_URL ||
    env.POSTGRES_URL ||
    env.POSTGRES_PRISMA_URL ||
    env.POSTGRES_URL_NON_POOLING ||
    "";
}

function getSupabaseUrl(env) {
  return env.SUPABASE_URL || env.VITE_SUPABASE_URL || "";
}

function getServiceRoleKey(env) {
  return env.SUPABASE_SERVICE_ROLE_KEY ||
    env.SUPABASE_SERVICE_KEY ||
    env.SUPABASE_SERVICE_ROLE ||
    "";
}

function getPublicKey(env) {
  return env.SUPABASE_ANON_KEY || env.VITE_SUPABASE_ANON_KEY || "";
}

function relative(filePath) {
  return path.relative(ROOT, filePath) || ".";
}

function loadRows(rowsFile) {
  if (!fs.existsSync(rowsFile)) {
    throw new Error(`Arquivo de linhas nao encontrado: ${relative(rowsFile)}. Rode scripts/generate-catalog-extra-bulk-import.mjs primeiro.`);
  }
  const payload = JSON.parse(readText(rowsFile));
  const artists = Array.isArray(payload.artists) ? payload.artists : [];
  const tracks = Array.isArray(payload.tracks) ? payload.tracks : [];
  return {
    artists,
    tracks,
    batch: String(payload.batch || "").trim(),
    gateVersion: String(payload.gateVersion || "").trim(),
    summary: payload.summary && typeof payload.summary === "object" ? payload.summary : {}
  };
}

function validateElectronicGate(rows, rowsFile) {
  const publishedArtistsWithoutGate = rows.artists.filter(
    (row) => row.status === "published" && row.metadata?.electronic_gate !== "passed"
  );
  const publishedTracksWithoutGate = rows.tracks.filter(
    (row) => row.status === "published" && row.metadata?.electronic_gate !== "passed"
  );
  if (!rows.gateVersion) {
    throw new Error(`Lote ${relative(rowsFile)} nao declara gateVersion.`);
  }
  if (publishedArtistsWithoutGate.length || publishedTracksWithoutGate.length) {
    throw new Error(
      `Lote eletronico invalido: ${publishedArtistsWithoutGate.length} artistas e ` +
      `${publishedTracksWithoutGate.length} faixas publicadas sem electronic_gate=passed.`
    );
  }
}

function writeStatusReport(report) {
  fs.mkdirSync(path.dirname(DEFAULT_STATUS_REPORT), { recursive: true });
  fs.writeFileSync(DEFAULT_STATUS_REPORT, `${JSON.stringify(report, null, 2)}\n`, "utf8");
  console.log(`Relatorio: ${relative(DEFAULT_STATUS_REPORT)}`);
}

function normalizeRestValue(value) {
  if (value === "") return null;
  if (Array.isArray(value)) return value.map(normalizeRestValue);
  if (value && typeof value === "object") {
    return Object.fromEntries(Object.entries(value).map(([key, nested]) => [key, normalizeRestValue(nested)]));
  }
  return value;
}

function normalizeRestRow(row) {
  return Object.fromEntries(Object.entries(row).map(([key, value]) => [key, normalizeRestValue(value)]));
}

function chunks(items, size) {
  const result = [];
  for (let index = 0; index < items.length; index += size) result.push(items.slice(index, index + size));
  return result;
}

function psqlExists() {
  const result = spawnSync("psql", ["--version"], { encoding: "utf8" });
  return result.status === 0;
}

function importViaPsql(databaseUrl, sqlFile, dryRun) {
  if (!databaseUrl || !psqlExists()) return false;
  if (!fs.existsSync(sqlFile)) throw new Error(`SQL nao encontrado: ${relative(sqlFile)}`);
  if (dryRun) {
    console.log(`[dry-run] DATABASE_URL encontrada e psql disponivel. SQL pronto: ${relative(sqlFile)}`);
    return true;
  }
  console.log(`Importando via psql: ${relative(sqlFile)}`);
  const result = spawnSync("psql", [databaseUrl, "-v", "ON_ERROR_STOP=1", "-f", sqlFile], {
    cwd: ROOT,
    stdio: "inherit"
  });
  if (result.status !== 0) throw new Error(`psql falhou com codigo ${result.status ?? "desconhecido"}.`);
  return true;
}

async function countTable(supabaseUrl, key, table) {
  if (!supabaseUrl || !key) return { table, count: null, error: "sem credencial de leitura" };
  const url = `${supabaseUrl.replace(/\/$/, "")}/rest/v1/${table}?select=id`;
  try {
    const response = await fetch(url, {
      method: "HEAD",
      headers: {
        apikey: key,
        Authorization: `Bearer ${key}`,
        Prefer: "count=exact",
        "Range-Unit": "items",
        Range: "0-0"
      }
    });
    if (!response.ok) {
      return { table, count: null, error: `${response.status} ${response.statusText}` };
    }
    const range = response.headers.get("content-range") || "";
    const count = Number(range.split("/").pop());
    return { table, count: Number.isFinite(count) ? count : null, error: "" };
  } catch (error) {
    return { table, count: null, error: error.message };
  }
}

async function printCounts(label, supabaseUrl, key) {
  if (!supabaseUrl || !key) {
    console.log(`${label}: nao consegui contar tabelas sem SUPABASE_URL e chave.`);
    return [];
  }
  const tables = ["catalog_artists", "catalog_tracks", "profiles", "activity_feed"];
  const counts = await Promise.all(tables.map((table) => countTable(supabaseUrl, key, table)));
  console.log(label);
  counts.forEach(({ table, count, error }) => {
    const value = count === null ? `erro (${error})` : count;
    console.log(`- ${table}: ${value}`);
  });
  return counts;
}

async function upsertRows({ supabaseUrl, serviceKey, table, rows, conflict, chunkSize }) {
  const baseUrl = supabaseUrl.replace(/\/$/, "");
  const url = `${baseUrl}/rest/v1/${table}?on_conflict=${encodeURIComponent(conflict)}`;
  const rowChunks = chunks(rows.map(normalizeRestRow), chunkSize);

  for (let index = 0; index < rowChunks.length; index += 1) {
    const response = await fetch(url, {
      method: "POST",
      headers: {
        apikey: serviceKey,
        Authorization: `Bearer ${serviceKey}`,
        "Content-Type": "application/json",
        Prefer: "resolution=merge-duplicates,return=minimal"
      },
      body: JSON.stringify(rowChunks[index])
    });
    if (!response.ok) {
      const text = await response.text();
      throw new Error(`${table} bloco ${index + 1}/${rowChunks.length} falhou: ${response.status} ${response.statusText} ${text.slice(0, 400)}`);
    }
    console.log(`${table}: bloco ${index + 1}/${rowChunks.length} ok`);
  }
}

async function importViaRest({ supabaseUrl, serviceKey, rowsFile, chunkSize, dryRun, requireElectronicGate }) {
  if (!supabaseUrl || !serviceKey) return false;
  const rows = loadRows(rowsFile);
  if (requireElectronicGate) validateElectronicGate(rows, rowsFile);
  const { artists, tracks } = rows;
  console.log(`Linhas prontas: ${artists.length} artistas, ${tracks.length} faixas.`);
  if (dryRun) {
    console.log(`[dry-run] SUPABASE_SERVICE_ROLE_KEY encontrada. Nenhum dado foi gravado.`);
    return true;
  }
  await upsertRows({
    supabaseUrl,
    serviceKey,
    table: "catalog_artists",
    rows: artists,
    conflict: "style,artist_key",
    chunkSize
  });
  await upsertRows({
    supabaseUrl,
    serviceKey,
    table: "catalog_tracks",
    rows: tracks,
    conflict: "style,track_key",
    chunkSize
  });
  const summary = rows.summary || {};
  await upsertRows({
    supabaseUrl,
    serviceKey,
    table: "electronic_ingestion_runs",
    rows: [{
      source: "catalog_extra_remote_import",
      batch_key: rows.batch || path.basename(rowsFile).replace(/\.rows\.json$/i, ""),
      run_status: Number(summary.reviewArtistRows || 0) + Number(summary.reviewTrackRows || 0) > 0
        ? "completed_with_review"
        : "completed",
      artists_seen: Number(summary.artistRows || artists.length),
      artists_published: Number(summary.publishedArtistRows || artists.filter((row) => row.status === "published").length),
      recordings_seen: Number(summary.trackRows || tracks.length),
      recordings_published: Number(summary.publishedTrackRows || tracks.filter((row) => row.status === "published").length),
      quarantined: Number(summary.reviewArtistRows || 0) + Number(summary.reviewTrackRows || 0),
      finished_at: new Date().toISOString(),
      metadata: {
        gate_version: rows.gateVersion || "",
        rows_file: relative(rowsFile),
        summary
      }
    }],
    conflict: "batch_key",
    chunkSize: 1
  });
  return true;
}

async function main() {
  const args = parseArgs(process.argv.slice(2));
  const env = loadEnv();
  const databaseUrl = getDatabaseUrl(env);
  const supabaseUrl = getSupabaseUrl(env);
  const serviceKey = getServiceRoleKey(env);
  const publicKey = getPublicKey(env);
  const readKey = publicKey || serviceKey;

  console.log("Sonic Search remote catalog import");
  console.log(`- SQL: ${relative(args.sqlFile)}`);
  console.log(`- Rows: ${relative(args.rowsFile)}`);
  console.log(`- DATABASE_URL: ${databaseUrl ? "encontrada" : "ausente"}`);
  console.log(`- SUPABASE_SERVICE_ROLE_KEY: ${serviceKey ? "encontrada" : "ausente"}`);
  console.log(`- Modo: ${args.dryRun ? "dry-run" : "importacao real se houver permissao"}`);

  const localRows = loadRows(args.rowsFile);
  if (args.requireElectronicGate) validateElectronicGate(localRows, args.rowsFile);
  const batch = localRows.batch || path.basename(args.rowsFile).replace(/\.rows\.json$/i, "");
  const report = {
    batch,
    generatedAt: new Date().toISOString(),
    files: {
      sql: relative(args.sqlFile),
      rows: relative(args.rowsFile)
    },
    local: {
      artists: localRows.artists.length,
      tracks: localRows.tracks.length
    },
    credentials: {
      supabaseUrl: Boolean(supabaseUrl),
      databaseUrl: Boolean(databaseUrl),
      serviceRoleKey: Boolean(serviceKey),
      publicKey: Boolean(publicKey)
    },
    remoteBefore: [],
    remoteAfter: [],
    electronicGate: {
      required: args.requireElectronicGate,
      version: localRows.gateVersion || "",
      summary: localRows.summary
    },
    status: "started"
  };

  report.remoteBefore = await printCounts("Antes", supabaseUrl, readKey);

  if (supabaseUrl && serviceKey) {
    const serviceProbe = await countTable(supabaseUrl, serviceKey, "catalog_artists");
    if (serviceProbe.error) {
      console.log("");
      console.log(`Bloqueio: a credencial administrativa foi recusada (${serviceProbe.error}).`);
      console.log("Renove SUPABASE_SERVICE_ROLE_KEY ou forneca DATABASE_URL/POSTGRES_URL antes de importar.");
      report.status = "blocked_invalid_admin_credential";
      report.remoteAfter = report.remoteBefore;
      report.adminCredentialProbe = serviceProbe;
      writeStatusReport(report);
      process.exitCode = args.dryRun ? 0 : 2;
      return;
    }
    if (args.requireElectronicGate) {
      const migrationProbe = await countTable(supabaseUrl, serviceKey, "electronic_artists");
      if (migrationProbe.error) {
        console.log("");
        console.log(`Bloqueio: a migracao do catalogo eletronico v2 ainda nao esta acessivel (${migrationProbe.error}).`);
        console.log("Aplique supabase/migrations/20260713000200_electronic_catalog_v2.sql antes do lote filtrado.");
        report.status = "blocked_missing_electronic_v2_migration";
        report.remoteAfter = report.remoteBefore;
        report.migrationProbe = migrationProbe;
        writeStatusReport(report);
        process.exitCode = args.dryRun ? 0 : 2;
        return;
      }
    }
  }

  if (!args.requireElectronicGate && importViaPsql(databaseUrl, args.sqlFile, args.dryRun)) {
    report.remoteAfter = await printCounts("Depois", supabaseUrl, readKey);
    report.status = args.dryRun ? "dry_run_ready_psql" : "imported_via_psql";
    writeStatusReport(report);
    return;
  }

  if (await importViaRest({
    supabaseUrl,
    serviceKey,
    rowsFile: args.rowsFile,
    chunkSize: args.chunkSize,
    dryRun: args.dryRun,
    requireElectronicGate: args.requireElectronicGate
  })) {
    report.remoteAfter = await printCounts("Depois", supabaseUrl, readKey);
    report.status = args.dryRun ? "dry_run_ready_rest" : "imported_via_rest";
    writeStatusReport(report);
    return;
  }

  console.log("");
  console.log("Bloqueio: falta uma credencial administrativa para gravar no Supabase remoto.");
  console.log("Adicione SUPABASE_SERVICE_ROLE_KEY em .env.local ou DATABASE_URL/POSTGRES_URL no ambiente e rode este script de novo.");
  report.status = args.dryRun ? "dry_run_blocked_missing_admin_credential" : "blocked_missing_admin_credential";
  report.remoteAfter = report.remoteBefore;
  writeStatusReport(report);
  process.exitCode = args.dryRun ? 0 : 2;
}

main().catch((error) => {
  console.error(error.message);
  process.exitCode = 1;
});
