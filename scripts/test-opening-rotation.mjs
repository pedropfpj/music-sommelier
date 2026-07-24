#!/usr/bin/env node

import assert from "node:assert/strict";
import { createRequire } from "node:module";

const require = createRequire(import.meta.url);

const ENV_KEYS = [
  "NODE_ENV",
  "VERCEL_ENV",
  "SONIC_ENV",
  "SONIC_OPENING_ROTATION_ENABLED",
  "KV_REST_API_URL",
  "KV_REST_API_TOKEN",
  "UPSTASH_REDIS_REST_URL",
  "UPSTASH_REDIS_REST_TOKEN",
  "SUPABASE_URL",
  "SUPABASE_SERVICE_ROLE_KEY",
  "SUPABASE_SERVICE_KEY",
  "SUPABASE_SERVICE_ROLE"
];
const originalEnv = Object.fromEntries(ENV_KEYS.map((key) => [key, process.env[key]]));

function restoreEnv() {
  ENV_KEYS.forEach((key) => {
    delete process.env[key];
    if (originalEnv[key] !== undefined) process.env[key] = originalEnv[key];
  });
}

function responseFixture() {
  return {
    statusCode: 0,
    headers: {},
    body: "",
    setHeader(name, value) {
      this.headers[name] = value;
    },
    end(body = "") {
      this.body = String(body || "");
    }
  };
}

function requestFixture() {
  return {
    method: "GET",
    query: { route: "opening-slot" },
    url: "/api/music?route=opening-slot",
    headers: {
      host: "localhost:3000",
      "sec-fetch-site": "same-origin",
      "user-agent": "opening-rotation-test"
    }
  };
}

try {
  process.env.NODE_ENV = "development";
  process.env.SONIC_OPENING_ROTATION_ENABLED = "true";
  process.env.KV_REST_API_URL = "";
  process.env.KV_REST_API_TOKEN = "";
  process.env.UPSTASH_REDIS_REST_URL = "";
  process.env.UPSTASH_REDIS_REST_TOKEN = "";
  process.env.SUPABASE_URL = "";
  process.env.SUPABASE_SERVICE_ROLE_KEY = "";
  process.env.SUPABASE_SERVICE_KEY = "";
  process.env.SUPABASE_SERVICE_ROLE = "";

  const handler = require("../api/music.js");
  const firstResponse = responseFixture();
  const secondResponse = responseFixture();

  await handler(requestFixture(), firstResponse);
  await handler(requestFixture(), secondResponse);

  assert.equal(firstResponse.statusCode, 200);
  assert.equal(secondResponse.statusCode, 200);
  assert.equal(firstResponse.headers["Cache-Control"], "no-store, max-age=0");

  const first = JSON.parse(firstResponse.body);
  const second = JSON.parse(secondResponse.body);
  assert.equal(first.ok, true);
  assert.equal(second.ok, true);
  assert.equal(first.rotationVersion, 3);
  assert.equal(second.slot, first.slot + 1, "Consecutive visitors must receive consecutive global slots");
  assert.equal(first.durable, false, "The isolated test must use the in-memory fallback store");

  console.log(`PASS opening rotation route: slots ${first.slot} -> ${second.slot}`);
} finally {
  restoreEnv();
}
