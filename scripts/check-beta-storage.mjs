#!/usr/bin/env node
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const rootDir = path.resolve(__dirname, "..");
const reportPath = path.join(rootDir, "reports", "beta-storage-check-latest.json");

function loadLocalEnvFile(filename) {
  const envPath = path.join(rootDir, filename);
  if (!fs.existsSync(envPath)) return false;
  const rows = fs.readFileSync(envPath, "utf8").split(/\r?\n/);
  rows.forEach((row) => {
    const clean = row.trim();
    if (!clean || clean.startsWith("#")) return;
    const match = clean.match(/^(?:export\s+)?([A-Za-z_][A-Za-z0-9_]*)\s*=\s*(.*)$/);
    if (!match) return;
    const [, key, rawValue] = match;
    if (process.env[key]) return;
    process.env[key] = rawValue.trim().replace(/^['"]|['"]$/g, "");
  });
  return true;
}

[".env.local", ".env"].forEach(loadLocalEnvFile);

const args = process.argv.slice(2);
const writeMode = args.includes("--write");
const strictMode = args.includes("--strict");
const jsonOnly = args.includes("--json");
const apiArg = args.find((arg) => arg.startsWith("--api="));
const apiBase = String(apiArg ? apiArg.slice("--api=".length) : "").replace(/\/+$/, "");

function envText(name, fallback = "") {
  const value = String(process.env[name] || "").trim();
  return value || fallback;
}

function envFlag(name, fallback = false) {
  const raw = envText(name).toLowerCase();
  if (!raw) return Boolean(fallback);
  return ["1", "true", "yes", "on", "enabled"].includes(raw);
}

function serviceRoleKey() {
  return (
    envText("SUPABASE_SERVICE_ROLE_KEY") ||
    envText("SUPABASE_SERVICE_KEY") ||
    envText("SUPABASE_SERVICE_ROLE")
  );
}

function safeDetail(value = "") {
  const detail = String(value || "");
  const key = serviceRoleKey();
  return (key ? detail.replaceAll(key, "[redacted]") : detail).slice(0, 600);
}

const checks = [];

function addCheck(status, name, detail = "") {
  checks.push({ status, name, detail: safeDetail(detail) });
}

async function supabaseGet(pathname) {
  const supabaseUrl = envText("SUPABASE_URL").replace(/\/+$/, "");
  const key = serviceRoleKey();
  const response = await fetch(`${supabaseUrl}/rest/v1/${pathname.replace(/^\/+/, "")}`, {
    headers: {
      apikey: key,
      Authorization: `Bearer ${key}`,
      Accept: "application/json"
    }
  });
  const text = await response.text();
  return { response, text };
}

async function checkSupabaseTable(tableName) {
  try {
    const { response, text } = await supabaseGet(`${tableName}?select=id&limit=1`);
    if (response.ok) {
      addCheck("pass", `Supabase table: ${tableName}`, "REST read with service role succeeded.");
      return true;
    }
    addCheck("fail", `Supabase table: ${tableName}`, `${response.status} ${response.statusText}: ${text}`);
    return false;
  } catch (error) {
    addCheck("fail", `Supabase table: ${tableName}`, error.message);
    return false;
  }
}

async function postJson(url, body) {
  const response = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body)
  });
  const payload = await response.json().catch(() => ({}));
  return { response, payload };
}

async function checkApiWrites() {
  if (!writeMode) {
    addCheck("warn", "API write smoke", "Skipped. Run with --write --api=http://127.0.0.1:8794 to test route inserts.");
    return;
  }
  if (!apiBase) {
    addCheck("warn", "API write smoke", "Skipped because --api was not provided.");
    return;
  }

  const timestamp = new Date().toISOString();
  const sessionId = `diagnostic-${Date.now().toString(36)}`;

  try {
    const { response, payload } = await postJson(`${apiBase}/api/beta-events`, {
      event: "diagnostic_beta_event",
      sessionId,
      source: "diagnostic",
      pageUrl: apiBase,
      payload: {
        diagnostic: true,
        timestamp
      }
    });
    if (response.ok && payload?.stored) {
      addCheck("pass", "API write: beta_events", "Diagnostic event stored.");
    } else if (response.ok && payload?.ok) {
      addCheck("warn", "API write: beta_events", payload.reason || "Route responded but did not store.");
    } else {
      addCheck("fail", "API write: beta_events", `${response.status} ${response.statusText}: ${JSON.stringify(payload)}`);
    }
  } catch (error) {
    addCheck("fail", "API write: beta_events", error.message);
  }

  try {
    const uniqueEmail = `beta-check+${Date.now()}@sonicsearch.local`;
    const { response, payload } = await postJson(`${apiBase}/api/waitlist`, {
      email: uniqueEmail,
      name: "Beta Storage Check",
      role: "investor",
      note: `diagnostic ${timestamp}`,
      source: apiBase
    });
    if (response.ok && payload?.stored) {
      addCheck("pass", "API write: waitlist_signups", "Diagnostic waitlist row stored.");
    } else if (response.ok && payload?.ok) {
      addCheck("warn", "API write: waitlist_signups", payload.reason || "Route responded but did not store.");
    } else {
      addCheck("fail", "API write: waitlist_signups", `${response.status} ${response.statusText}: ${JSON.stringify(payload)}`);
    }
  } catch (error) {
    addCheck("fail", "API write: waitlist_signups", error.message);
  }
}

async function main() {
  const supabaseUrl = envText("SUPABASE_URL").replace(/\/+$/, "");
  const serviceKey = serviceRoleKey();
  const waitlistEnabled = envFlag("SONIC_WAITLIST_ENABLED", true);
  const betaEventsEnabled = envFlag("SONIC_BETA_EVENTS_ENABLED", true);

  addCheck(supabaseUrl ? "pass" : "warn", "SUPABASE_URL", supabaseUrl ? "Configured." : "Missing.");
  addCheck(serviceKey ? "pass" : "warn", "SUPABASE_SERVICE_ROLE_KEY", serviceKey ? "Configured server-side." : "Missing. Backend routes cannot store private beta rows without it.");
  addCheck(waitlistEnabled ? "pass" : "warn", "SONIC_WAITLIST_ENABLED", waitlistEnabled ? "Enabled." : "Disabled.");
  addCheck(betaEventsEnabled ? "pass" : "warn", "SONIC_BETA_EVENTS_ENABLED", betaEventsEnabled ? "Enabled." : "Disabled.");

  if (supabaseUrl && serviceKey) {
    await checkSupabaseTable("waitlist_signups");
    await checkSupabaseTable("beta_events");
  } else {
    addCheck("warn", "Supabase table checks", "Skipped until SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY are both configured.");
  }

  await checkApiWrites();

  const statusCounts = checks.reduce((acc, check) => {
    acc[check.status] = (acc[check.status] || 0) + 1;
    return acc;
  }, {});
  const ready = !statusCounts.fail && !checks.some((check) => check.status === "warn");
  const report = {
    ok: !statusCounts.fail,
    ready,
    generatedAt: new Date().toISOString(),
    apiBase: apiBase || null,
    writeMode,
    checks
  };

  fs.mkdirSync(path.dirname(reportPath), { recursive: true });
  fs.writeFileSync(reportPath, `${JSON.stringify(report, null, 2)}\n`);

  if (jsonOnly) {
    console.log(JSON.stringify(report, null, 2));
  } else {
    console.log("Beta storage check");
    checks.forEach((check) => {
      const label = check.status.toUpperCase().padEnd(4);
      console.log(`${label} ${check.name}${check.detail ? ` - ${check.detail}` : ""}`);
    });
    console.log(`Report: ${path.relative(rootDir, reportPath)}`);
  }

  if (statusCounts.fail || (strictMode && !ready)) process.exitCode = 1;
}

main().catch((error) => {
  console.error(`Beta storage check failed: ${safeDetail(error.message)}`);
  process.exitCode = 1;
});
