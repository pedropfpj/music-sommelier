#!/usr/bin/env node
import assert from "node:assert/strict";
import { createRequire } from "node:module";

const require = createRequire(import.meta.url);
const {
  allowedOrigin,
  isProductionLike,
  requestBodyTooLarge,
  setCorsHeaders
} = require("../api/_request-security.js");

const ENV_KEYS = [
  "NODE_ENV",
  "VERCEL_ENV",
  "SONIC_ENV",
  "SONIC_AI_ALLOWED_ORIGINS",
  "SONIC_MUSIC_ALLOWED_ORIGINS",
  "SONIC_ALLOW_ORIGINLESS_REQUESTS"
];
const originalEnv = Object.fromEntries(ENV_KEYS.map((key) => [key, process.env[key]]));

function resetEnv(next = {}) {
  ENV_KEYS.forEach((key) => {
    delete process.env[key];
  });
  Object.entries(next).forEach(([key, value]) => {
    process.env[key] = value;
  });
}

function restoreEnv() {
  ENV_KEYS.forEach((key) => {
    delete process.env[key];
    if (originalEnv[key] !== undefined) process.env[key] = originalEnv[key];
  });
}

function req(headers = {}) {
  return { headers };
}

function res() {
  const headers = {};
  return {
    headers,
    setHeader(name, value) {
      headers[name] = value;
    }
  };
}

try {
  resetEnv({ NODE_ENV: "production" });
  assert.equal(isProductionLike(), true, "NODE_ENV=production should be production-like");

  resetEnv({
    NODE_ENV: "production",
    SONIC_AI_ALLOWED_ORIGINS: "https://sonicsearch.app,https://www.sonicsearch.app"
  });
  assert.equal(
    allowedOrigin(req({ origin: "https://sonicsearch.app", host: "api.sonicsearch.app" }), ["SONIC_AI_ALLOWED_ORIGINS"]),
    true,
    "configured production origin should be allowed"
  );
  assert.equal(
    allowedOrigin(req({ origin: "https://evil.example", host: "api.sonicsearch.app" }), ["SONIC_AI_ALLOWED_ORIGINS"]),
    false,
    "unconfigured production origin should be blocked"
  );
  assert.equal(
    allowedOrigin(req({ origin: "https://preview.example", host: "preview.example" }), ["SONIC_AI_ALLOWED_ORIGINS"]),
    true,
    "same-host preview origin should be allowed"
  );
  assert.equal(
    allowedOrigin(req({ host: "api.sonicsearch.app" }), ["SONIC_AI_ALLOWED_ORIGINS"]),
    false,
    "originless production request should be blocked by default"
  );
  assert.equal(
    allowedOrigin(req({ host: "api.sonicsearch.app", "sec-fetch-site": "same-origin" }), ["SONIC_AI_ALLOWED_ORIGINS"]),
    true,
    "same-origin browser request without Origin should be allowed"
  );

  resetEnv({ NODE_ENV: "development" });
  assert.equal(
    allowedOrigin(req({ host: "127.0.0.1:8794" }), ["SONIC_AI_ALLOWED_ORIGINS"]),
    true,
    "local development host should be allowed"
  );

  assert.equal(requestBodyTooLarge(req({ "content-length": "100" }), 99), true);
  assert.equal(requestBodyTooLarge(req({ "content-length": "100" }), 100), false);
  assert.equal(requestBodyTooLarge(req({}), 100), false);

  resetEnv({ NODE_ENV: "production", SONIC_AI_ALLOWED_ORIGINS: "https://sonicsearch.app" });
  const corsRes = res();
  setCorsHeaders(req({ origin: "https://sonicsearch.app", host: "api.sonicsearch.app" }), corsRes, {
    originEnvNames: ["SONIC_AI_ALLOWED_ORIGINS"],
    methods: ["POST", "OPTIONS"],
    allowedHeaders: "Content-Type"
  });
  assert.equal(corsRes.headers["Access-Control-Allow-Origin"], "https://sonicsearch.app");
  assert.equal(corsRes.headers["Access-Control-Allow-Methods"], "POST, OPTIONS");
  assert.equal(corsRes.headers["Access-Control-Allow-Headers"], "Content-Type");
  assert.equal(corsRes.headers.Vary, "Origin");

  console.log("PASS request security tests");
} finally {
  restoreEnv();
}
