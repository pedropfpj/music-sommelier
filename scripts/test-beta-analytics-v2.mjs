#!/usr/bin/env node

import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import vm from "node:vm";
import { createRequire } from "node:module";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const rootDir = path.resolve(__dirname, "..");
const appSource = fs.readFileSync(path.join(rootDir, "app.js"), "utf8");
const migrationSource = fs.readFileSync(
  path.join(rootDir, "supabase/migrations/20260719000100_beta_events_analytics_v2.sql"),
  "utf8"
);
const require = createRequire(import.meta.url);

function extractFunction(name) {
  const marker = `function ${name}`;
  const markerIndex = appSource.indexOf(marker);
  if (markerIndex < 0) throw new Error(`Missing function: ${name}`);
  const asyncIndex = appSource.lastIndexOf("async ", markerIndex);
  const start = asyncIndex >= markerIndex - 8 ? asyncIndex : markerIndex;
  const signatureEnd = appSource.indexOf(") {", markerIndex);
  if (signatureEnd < 0) throw new Error(`Missing function body: ${name}`);
  const bodyStart = signatureEnd + 2;
  let depth = 0;
  let quote = "";
  let escaped = false;
  let lineComment = false;
  let blockComment = false;

  for (let index = bodyStart; index < appSource.length; index += 1) {
    const character = appSource[index];
    const next = appSource[index + 1];
    if (lineComment) {
      if (character === "\n") lineComment = false;
      continue;
    }
    if (blockComment) {
      if (character === "*" && next === "/") {
        blockComment = false;
        index += 1;
      }
      continue;
    }
    if (quote) {
      if (escaped) escaped = false;
      else if (character === "\\") escaped = true;
      else if (character === quote) quote = "";
      continue;
    }
    if (character === "/" && next === "/") {
      lineComment = true;
      index += 1;
      continue;
    }
    if (character === "/" && next === "*") {
      blockComment = true;
      index += 1;
      continue;
    }
    if (character === '"' || character === "'" || character === "`") {
      quote = character;
      continue;
    }
    if (character === "{") depth += 1;
    if (character === "}") depth -= 1;
    if (depth === 0) return appSource.slice(start, index + 1);
  }
  throw new Error(`Unclosed function: ${name}`);
}

class MemoryStorage {
  constructor() {
    this.values = new Map();
  }

  getItem(key) {
    return this.values.has(key) ? this.values.get(key) : null;
  }

  setItem(key, value) {
    this.values.set(key, String(value));
  }

  removeItem(key) {
    this.values.delete(key);
  }

  clear() {
    this.values.clear();
  }
}

class SerialLocks {
  constructor() {
    this.pending = Promise.resolve();
  }

  request(_name, _options, callback) {
    const result = this.pending.then(callback);
    this.pending = result.catch(() => {});
    return result;
  }
}

let uuidCounter = 1;
function nextUuid() {
  const suffix = String(uuidCounter).padStart(12, "0");
  uuidCounter += 1;
  return `00000000-0000-4000-8000-${suffix}`;
}

const analyticsFunctionNames = [
  "isBetaAnalyticsUuid",
  "createBetaAnalyticsUuid",
  "sanitizeBetaAnalyticsPathname",
  "betaAnalyticsAnonymousId",
  "normalizeBetaAnalyticsSessionState",
  "readBetaAnalyticsSessionState",
  "writeBetaAnalyticsSessionState",
  "legacyBetaPreviousSessionAt",
  "resolveBetaAnalyticsSession",
  "betaAnalyticsAuthenticatedUserId",
  "betaAnalyticsEnvironment",
  "buildBetaAppSessionEvent",
  "sendBetaAppSessionEvent",
  "acknowledgeBetaAnalyticsSession",
  "withBetaAnalyticsSessionLock",
  "trackBetaAppSession"
];

function createClientHarness({
  storage = new MemoryStorage(),
  fetchImpl = null,
  href = "https://sonic.example/",
  locks = null
} = {}) {
  const parsedUrl = new URL(href);
  const requests = [];
  const context = vm.createContext({
    Array,
    Boolean,
    Date,
    JSON,
    Math,
    Number,
    Promise,
    String,
    URL,
    Uint8Array,
    decodeURIComponent,
    localStorage: storage,
    crypto: { randomUUID: nextUuid },
    navigator: locks ? { locks } : {},
    window: {
      location: {
        href,
        pathname: parsedUrl.pathname,
        hostname: parsedUrl.hostname
      }
    },
    fetch: async (...args) => {
      requests.push(args);
      if (fetchImpl) return fetchImpl(...args);
      return { ok: true, json: async () => ({ stored: true, duplicate: false }) };
    },
    betaEventsEndpoint: () => "/api/beta-events",
    betaRuntimePlatform: () => "web"
  });

  vm.runInContext(`
    const BETA_ANALYTICS_ANONYMOUS_STORAGE_KEY = "sonic_search:analytics_anonymous:v2";
    const BETA_ANALYTICS_SESSION_STORAGE_KEY = "sonic_search:analytics_session:v2";
    const BETA_ANALYTICS_SESSION_LOCK_NAME = "sonic_search:analytics_session:v2";
    const BETA_ANALYTICS_SESSION_TIMEOUT_MS = 30 * 60 * 1000;
    const BETA_VISIT_STORAGE_KEY = "sonic_search:beta_visit:v1";
    const SOCIAL_SESSION_STORAGE_KEY = "neonpulse:socialSession:v1";
    const SONIC_APP_BUILD_ID = "test-build";
    var betaAppSessionTracked = false;
    var socialState = { session: null };
    function readBetaJsonStorage(key, fallback) {
      try { return JSON.parse(localStorage.getItem(key) || "") || fallback; }
      catch (_error) { return fallback; }
    }
    function writeBetaJsonStorage(key, value) {
      try { localStorage.setItem(key, JSON.stringify(value)); return true; }
      catch (_error) { return false; }
    }
    ${analyticsFunctionNames.map(extractFunction).join("\n")}
  `, context);

  return { context, requests, storage };
}

function storedSession(storage) {
  return JSON.parse(storage.getItem("sonic_search:analytics_session:v2") || "null");
}

async function testClientIdentityAndSession() {
  const storage = new MemoryStorage();
  const firstHarness = createClientHarness({ storage });
  const firstAnonymousId = firstHarness.context.betaAnalyticsAnonymousId();
  assert.match(firstAnonymousId, /^[0-9a-f-]{36}$/i);
  assert.equal(firstHarness.context.betaAnalyticsAnonymousId(), firstAnonymousId);
  assert.doesNotMatch(firstAnonymousId, /ip|agent|email|token|@/i);

  storage.removeItem("sonic_search:analytics_anonymous:v2");
  const regeneratedAnonymousId = firstHarness.context.betaAnalyticsAnonymousId();
  assert.notEqual(regeneratedAnonymousId, firstAnonymousId);

  const start = Date.parse("2026-07-19T12:00:00.000Z");
  const firstSession = firstHarness.context.resolveBetaAnalyticsSession(start);
  assert.match(firstSession.session_id, /^[0-9a-f-]{36}$/i);
  assert.equal(firstSession.previous_session_at, null);
  assert.equal(firstSession.session_start_acknowledged, false);

  const refreshSession = firstHarness.context.resolveBetaAnalyticsSession(start + 10 * 60 * 1000);
  assert.equal(refreshSession.session_id, firstSession.session_id);
  assert.equal(refreshSession.session_start_event_id, firstSession.session_start_event_id);

  const secondTabHarness = createClientHarness({ storage });
  const secondTabSession = secondTabHarness.context.resolveBetaAnalyticsSession(start + 20 * 60 * 1000);
  assert.equal(secondTabSession.session_id, firstSession.session_id);

  const nextSession = secondTabHarness.context.resolveBetaAnalyticsSession(start + 51 * 60 * 1000);
  assert.notEqual(nextSession.session_id, firstSession.session_id);
  assert.notEqual(nextSession.session_start_event_id, firstSession.session_start_event_id);
  assert.equal(nextSession.previous_session_at, firstSession.session_started_at);

  const firstEvent = firstHarness.context.buildBetaAppSessionEvent(firstSession);
  const nextEvent = secondTabHarness.context.buildBetaAppSessionEvent(nextSession);
  assert.equal(firstEvent.is_first_session, true);
  assert.equal(firstEvent.previous_session_at, null);
  assert.equal(nextEvent.is_first_session, false);
  assert.equal(nextEvent.previous_session_at, firstSession.session_started_at);
}

async function testClientAuthenticationPrivacyAndRetry() {
  const storage = new MemoryStorage();
  const userId = "11111111-1111-4111-8111-111111111111";
  storage.setItem("neonpulse:socialSession:v1", JSON.stringify({
    access_token: "stored-access-secret",
    refresh_token: "stored-refresh-secret",
    user: {
      id: userId,
      email: "person@example.com",
      user_metadata: { name: "Private Person" }
    }
  }));
  const harness = createClientHarness({
    storage,
    href: "https://sonic.example/callback?access_token=query-secret&beta=invite#refresh_token=fragment-secret"
  });
  const state = harness.context.resolveBetaAnalyticsSession(Date.parse("2026-07-19T14:00:00.000Z"));
  const event = harness.context.buildBetaAppSessionEvent(state);
  assert.equal(event.user_id, userId);
  assert.equal(event.anonymous_id, harness.context.betaAnalyticsAnonymousId());
  assert.equal(event.pathname, "/callback");
  assert.deepEqual(Object.keys(event).sort(), [
    "anonymous_id",
    "app_version",
    "environment",
    "event_id",
    "event_name",
    "is_first_session",
    "occurred_at",
    "pathname",
    "platform",
    "previous_session_at",
    "schema_version",
    "session_id",
    "user_id"
  ]);
  const serialized = JSON.stringify(event);
  ["query-secret", "fragment-secret", "invite", "stored-access-secret", "stored-refresh-secret", "person@example.com", "Private Person"]
    .forEach((secret) => assert.doesNotMatch(serialized, new RegExp(secret, "i")));

  const anonymousStorage = new MemoryStorage();
  const anonymousHarness = createClientHarness({ storage: anonymousStorage });
  const anonymousState = anonymousHarness.context.resolveBetaAnalyticsSession();
  assert.equal(anonymousHarness.context.buildBetaAppSessionEvent(anonymousState).user_id, null);

  const retryStorage = new MemoryStorage();
  const failedHarness = createClientHarness({
    storage: retryStorage,
    fetchImpl: async () => ({ ok: false, json: async () => ({ stored: false, duplicate: false }) })
  });
  assert.equal(await failedHarness.context.trackBetaAppSession(), false);
  const pending = storedSession(retryStorage);
  assert.equal(pending.session_start_acknowledged, false);
  const pendingEventId = pending.session_start_event_id;

  const retryHarness = createClientHarness({
    storage: retryStorage,
    fetchImpl: async () => ({ ok: true, json: async () => ({ stored: false, duplicate: true }) })
  });
  assert.equal(await retryHarness.context.trackBetaAppSession(), true);
  assert.equal(retryHarness.requests.length, 1);
  const retriedBody = JSON.parse(retryHarness.requests[0][1].body);
  assert.equal(retriedBody.event_id, pendingEventId);
  assert.equal(storedSession(retryStorage).session_start_acknowledged, true);

  const refreshHarness = createClientHarness({ storage: retryStorage });
  assert.equal(await refreshHarness.context.trackBetaAppSession(), true);
  assert.equal(refreshHarness.requests.length, 0);
  assert.equal(await refreshHarness.context.trackBetaAppSession(), false);
  assert.equal(refreshHarness.requests.length, 0);

  const concurrentStorage = new MemoryStorage();
  const locks = new SerialLocks();
  const firstTab = createClientHarness({ storage: concurrentStorage, locks });
  const secondTab = createClientHarness({ storage: concurrentStorage, locks });
  const concurrentResults = await Promise.all([
    firstTab.context.trackBetaAppSession(),
    secondTab.context.trackBetaAppSession()
  ]);
  assert.deepEqual(concurrentResults, [true, true]);
  assert.equal(firstTab.requests.length + secondTab.requests.length, 1);
  assert.equal(storedSession(concurrentStorage).session_start_acknowledged, true);
}

const ENV_KEYS = [
  "NODE_ENV",
  "VERCEL_ENV",
  "SONIC_ENV",
  "SUPABASE_URL",
  "SUPABASE_SERVICE_ROLE_KEY",
  "SONIC_BETA_EVENTS_ENABLED",
  "SONIC_BETA_EVENTS_DAILY_LIMIT"
];
const originalEnv = Object.fromEntries(ENV_KEYS.map((key) => [key, process.env[key]]));

function setTestEnv({ configured = true } = {}) {
  ENV_KEYS.forEach((key) => delete process.env[key]);
  process.env.NODE_ENV = "development";
  process.env.SONIC_BETA_EVENTS_ENABLED = "true";
  process.env.SONIC_BETA_EVENTS_DAILY_LIMIT = "0";
  if (configured) {
    process.env.SUPABASE_URL = "https://supabase.test";
    process.env.SUPABASE_SERVICE_ROLE_KEY = "test-service-key";
  }
}

function restoreEnv() {
  ENV_KEYS.forEach((key) => {
    delete process.env[key];
    if (originalEnv[key] !== undefined) process.env[key] = originalEnv[key];
  });
}

function validV2Body(overrides = {}) {
  return {
    event_name: "app_session_started",
    schema_version: 2,
    event_id: "20000000-0000-4000-8000-000000000001",
    anonymous_id: "20000000-0000-4000-8000-000000000002",
    user_id: null,
    session_id: "20000000-0000-4000-8000-000000000003",
    occurred_at: "2026-07-19T12:00:00.000Z",
    platform: "web",
    app_version: "test-build",
    environment: "test",
    is_first_session: true,
    previous_session_at: null,
    pathname: "/callback?access_token=server-secret&beta=server-invite#refresh_token=fragment-secret",
    payload: {
      access_token: "ignored-payload-secret",
      email: "ignored@example.com"
    },
    ...overrides
  };
}

function responseHarness() {
  const headers = {};
  let body = null;
  return {
    headers,
    get body() { return body; },
    statusCode: 0,
    setHeader(name, value) { headers[name] = value; },
    end(value = "") { body = value ? JSON.parse(value) : null; }
  };
}

async function callHandler(handler, body) {
  const req = {
    method: "POST",
    body,
    headers: {
      host: "localhost:3000",
      "sec-fetch-site": "same-origin",
      "user-agent": "Analytics Test Agent",
      "x-forwarded-for": "203.0.113.8"
    }
  };
  const res = responseHarness();
  await handler(req, res);
  return res;
}

async function testBackendContract() {
  setTestEnv();
  const handler = require("../lib/api/_beta-events.js");
  const fetchCalls = [];
  const originalFetch = global.fetch;
  try {
    global.fetch = async (...args) => {
      fetchCalls.push(args);
      return { ok: true, json: async () => ({}), statusText: "OK" };
    };
    const stored = await callHandler(handler, validV2Body());
    assert.equal(stored.statusCode, 200);
    assert.deepEqual(stored.body, { ok: true, stored: true, duplicate: false });
    assert.equal(fetchCalls.length, 1);
    const row = JSON.parse(fetchCalls[0][1].body)[0];
    assert.equal(row.schema_version, 2);
    assert.equal(row.event_name, "app_session_started");
    assert.equal(row.page_url, "/callback");
    assert.equal(Object.hasOwn(row, "client_hash"), false);
    assert.equal(Object.hasOwn(row, "user_agent"), false);
    assert.equal(Object.hasOwn(row, "source"), false);
    assert.deepEqual(row.payload, { is_first_session: true, previous_session_at: null });
    const serializedRow = JSON.stringify(row);
    ["server-secret", "server-invite", "fragment-secret", "ignored-payload-secret", "ignored@example.com", "203.0.113.8", "Analytics Test Agent"]
      .forEach((secret) => assert.doesNotMatch(serializedRow, new RegExp(secret, "i")));

    global.fetch = async (...args) => {
      fetchCalls.push(args);
      return { ok: true, json: async () => ({}), statusText: "OK" };
    };
    const authenticatedUserId = "22222222-2222-4222-8222-222222222222";
    const authenticated = await callHandler(handler, validV2Body({
      event_id: "20000000-0000-4000-8000-000000000011",
      session_id: "20000000-0000-4000-8000-000000000013",
      user_id: authenticatedUserId
    }));
    assert.equal(authenticated.statusCode, 200);
    assert.equal(JSON.parse(fetchCalls.at(-1)[1].body)[0].user_id, authenticatedUserId);

    global.fetch = async () => ({
      ok: false,
      statusText: "Conflict",
      json: async () => ({ code: "23505", message: "duplicate key" })
    });
    const duplicate = await callHandler(handler, validV2Body());
    assert.equal(duplicate.statusCode, 200);
    assert.deepEqual(duplicate.body, { ok: true, stored: false, duplicate: true });

    global.fetch = async () => {
      throw new Error("fetch should not be called for invalid payloads");
    };
    const invalidUuid = await callHandler(handler, validV2Body({ event_id: "not-a-uuid" }));
    assert.equal(invalidUuid.statusCode, 400);
    assert.equal(invalidUuid.body.error, "invalid_event_id");

    const invalidUser = await callHandler(handler, validV2Body({ user_id: "person@example.com" }));
    assert.equal(invalidUser.statusCode, 400);
    assert.equal(invalidUser.body.error, "invalid_user_id");

    const missingField = validV2Body();
    delete missingField.anonymous_id;
    const missing = await callHandler(handler, missingField);
    assert.equal(missing.statusCode, 400);
    assert.equal(missing.body.error, "invalid_anonymous_id");

    const unknownSchema = await callHandler(handler, validV2Body({ schema_version: 3 }));
    assert.equal(unknownSchema.statusCode, 400);
    assert.equal(unknownSchema.body.error, "unsupported_schema_version");

    const unsupportedEvent = await callHandler(handler, validV2Body({ event_name: "audio_started" }));
    assert.equal(unsupportedEvent.statusCode, 400);
    assert.equal(unsupportedEvent.body.error, "unsupported_v2_event");

    global.fetch = async (...args) => {
      fetchCalls.push(args);
      return { ok: true, json: async () => ({}), statusText: "OK" };
    };
    const legacy = await callHandler(handler, {
      event: "legacy_event",
      sessionId: "legacy-session",
      pageUrl: "https://sonic.example/login?access_token=legacy-secret#refresh_token=legacy-fragment",
      payload: { compatible: true }
    });
    assert.equal(legacy.statusCode, 200);
    assert.equal(legacy.body.stored, true);
    const legacyRow = JSON.parse(fetchCalls.at(-1)[1].body)[0];
    assert.equal(legacyRow.page_url, "/login");
    assert.deepEqual(legacyRow.payload, { compatible: true });
    assert.equal(Object.hasOwn(legacyRow, "schema_version"), false);

    global.fetch = async () => ({
      ok: false,
      statusText: "Bad Gateway",
      json: async () => ({ message: "storage unavailable" })
    });
    const failed = await callHandler(handler, validV2Body());
    assert.equal(failed.statusCode, 502);
    assert.deepEqual(failed.body, {
      ok: false,
      stored: false,
      duplicate: false,
      error: "beta_event_storage_failed"
    });

    setTestEnv({ configured: false });
    const unconfigured = await callHandler(handler, validV2Body());
    assert.equal(unconfigured.statusCode, 503);
    assert.equal(unconfigured.body.stored, false);
    assert.equal(unconfigured.body.duplicate, false);
  } finally {
    global.fetch = originalFetch;
    restoreEnv();
  }
}

function testSourceAndMigrationPolicy() {
  const sessionSource = extractFunction("trackBetaAppSession");
  const bootSource = extractFunction("bootSonicSearch");
  assert.match(sessionSource, /buildBetaAppSessionEvent/);
  assert.match(sessionSource, /session_start_acknowledged/);
  assert.doesNotMatch(sessionSource, /returning_user|trackBetaEvent\(/);
  assert.match(bootSource, /void trackBetaAppSession\(\)/);
  assert.doesNotMatch(appSource, /event_name:\s*"(?:recommendation_shown|listen_intent|audio_started|audio_failed|feedback_submitted|qualified_discovery_completed|activation_three_discoveries_completed)"/);

  assert.match(migrationSource, /add column if not exists event_id uuid/i);
  assert.match(migrationSource, /add column if not exists anonymous_id uuid/i);
  assert.match(migrationSource, /add column if not exists user_id uuid/i);
  assert.match(migrationSource, /where event_id is not null/i);
  assert.match(migrationSource, /event_name = 'app_session_started'[\s\S]*schema_version = 2/i);
  assert.doesNotMatch(migrationSource, /\b(backfill|delete|drop|truncate|update)\b/i);
  assert.doesNotMatch(migrationSource, /add\s+column[^\n]*\bnot\s+null\b/i);
  assert.doesNotMatch(migrationSource, /grant[\s\S]*(?:anon|authenticated)/i);
  assert.doesNotMatch(migrationSource, /recommendation_id|track_id|artist_id|audio_provider/i);
}

await testClientIdentityAndSession();
await testClientAuthenticationPrivacyAndRetry();
await testBackendContract();
testSourceAndMigrationPolicy();

console.log("PASS beta analytics v2 foundation tests");
