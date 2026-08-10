#!/usr/bin/env node
import fs from "node:fs";
import path from "node:path";
import { createSign } from "node:crypto";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const rootDir = path.resolve(__dirname, "..");

function loadLocalEnvFile(filename) {
  const envPath = path.join(rootDir, filename);
  if (!fs.existsSync(envPath)) return;
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
}

[".env.local", ".env"].forEach(loadLocalEnvFile);

function envText(...keys) {
  return keys.map((key) => String(process.env[key] || "").trim()).find(Boolean) || "";
}

function base64Url(input) {
  return Buffer.from(input)
    .toString("base64")
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/g, "");
}

function projectRefFromUrl(value = "") {
  try {
    const url = new URL(value);
    const [ref] = url.hostname.split(".");
    return /^[a-z0-9]{20}$/i.test(ref) ? ref : "";
  } catch (_error) {
    return "";
  }
}

function readApplePrivateKey() {
  const inlineKey = envText("APPLE_PRIVATE_KEY", "SUPABASE_APPLE_PRIVATE_KEY");
  if (inlineKey) return inlineKey.replace(/\\n/g, "\n");
  const keyPath = envText("APPLE_PRIVATE_KEY_PATH", "SUPABASE_APPLE_PRIVATE_KEY_PATH");
  if (!keyPath) return "";
  return fs.readFileSync(path.resolve(rootDir, keyPath), "utf8");
}

function createAppleClientSecret({ teamId, keyId, serviceId, privateKey }) {
  const now = Math.floor(Date.now() / 1000);
  const header = {
    alg: "ES256",
    kid: keyId
  };
  const payload = {
    iss: teamId,
    iat: now,
    exp: now + 60 * 60 * 24 * 180,
    aud: "https://appleid.apple.com",
    sub: serviceId
  };
  const signingInput = `${base64Url(JSON.stringify(header))}.${base64Url(JSON.stringify(payload))}`;
  const signature = createSign("SHA256").update(signingInput).sign(privateKey);
  return `${signingInput}.${base64Url(signature)}`;
}

function required(name, value) {
  if (!value) throw new Error(`Missing ${name}`);
  return value;
}

async function main() {
  const accessToken = required("SUPABASE_ACCESS_TOKEN", envText("SUPABASE_ACCESS_TOKEN"));
  const projectRef = required(
    "SUPABASE_PROJECT_REF or SUPABASE_URL",
    envText("SUPABASE_PROJECT_REF", "PROJECT_REF") || projectRefFromUrl(envText("SUPABASE_URL"))
  );
  const serviceId = required(
    "APPLE_SERVICE_ID",
    envText("APPLE_SERVICE_ID", "SUPABASE_APPLE_SERVICE_ID", "EXTERNAL_APPLE_CLIENT_ID")
  );
  const providedSecret = envText("APPLE_CLIENT_SECRET", "SUPABASE_APPLE_CLIENT_SECRET", "EXTERNAL_APPLE_SECRET");
  const clientSecret = providedSecret || createAppleClientSecret({
    teamId: required("APPLE_TEAM_ID", envText("APPLE_TEAM_ID", "SUPABASE_APPLE_TEAM_ID")),
    keyId: required("APPLE_KEY_ID", envText("APPLE_KEY_ID", "SUPABASE_APPLE_KEY_ID")),
    serviceId,
    privateKey: required("APPLE_PRIVATE_KEY or APPLE_PRIVATE_KEY_PATH", readApplePrivateKey())
  });

  const payload = {
    external_apple_enabled: true,
    external_apple_client_id: serviceId,
    external_apple_secret: clientSecret
  };

  const response = await fetch(`https://api.supabase.com/v1/projects/${encodeURIComponent(projectRef)}/config/auth`, {
    method: "PATCH",
    headers: {
      Authorization: `Bearer ${accessToken}`,
      "Content-Type": "application/json"
    },
    body: JSON.stringify(payload)
  });
  const text = await response.text();
  let body = null;
  try {
    body = text ? JSON.parse(text) : null;
  } catch (_error) {
    body = text;
  }
  if (!response.ok) {
    const detail = body?.message || body?.error || body?.msg || response.statusText;
    throw new Error(`Supabase auth config failed (${response.status}): ${detail}`);
  }
  console.log(`Apple provider enabled for Supabase project ${projectRef}.`);
}

main().catch((error) => {
  console.error(error.message);
  process.exit(1);
});
