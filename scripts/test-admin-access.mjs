#!/usr/bin/env node

import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { createRequire } from "node:module";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const rootDir = path.resolve(__dirname, "..");
const require = createRequire(import.meta.url);
const envKeys = [
  "SUPABASE_URL",
  "SUPABASE_ANON_KEY",
  "SUPABASE_SERVICE_ROLE_KEY",
  "SONIC_OWNER_EMAILS",
  "SONIC_ADMIN_EMAILS",
  "SONIC_MODERATOR_EMAILS",
  "SONIC_PAID_USER_EMAILS"
];
const originalEnv = Object.fromEntries(envKeys.map((key) => [key, process.env[key]]));
const originalFetch = global.fetch;

function restoreEnvironment() {
  envKeys.forEach((key) => {
    delete process.env[key];
    if (originalEnv[key] !== undefined) process.env[key] = originalEnv[key];
  });
  global.fetch = originalFetch;
}

function request(token = "", method = "GET") {
  return {
    method,
    body: {},
    headers: token ? { authorization: `Bearer ${token}` } : {}
  };
}

function responseHarness() {
  return {
    statusCode: 0,
    headers: {},
    body: null,
    setHeader(key, value) {
      this.headers[key] = value;
    },
    end(value = "") {
      this.body = value ? JSON.parse(value) : null;
    }
  };
}

async function main() {
  process.env.SUPABASE_URL = "https://supabase.test";
  process.env.SUPABASE_ANON_KEY = "anon-test";
  process.env.SUPABASE_SERVICE_ROLE_KEY = "service-test";
  process.env.SONIC_OWNER_EMAILS = "owner@example.com";
  process.env.SONIC_ADMIN_EMAILS = " ADMIN@example.com ";
  process.env.SONIC_MODERATOR_EMAILS = "moderator@example.com";
  process.env.SONIC_PAID_USER_EMAILS = "paid@example.com";

  const emails = {
    owner: "owner@example.com",
    admin: "admin@example.com",
    moderator: "moderator@example.com",
    free: "free@example.com",
    paid: "paid@example.com"
  };
  global.fetch = async (url, options = {}) => {
    if (String(url).includes("/auth/v1/user")) {
      const token = String(options.headers?.Authorization || "").replace(/^Bearer\s+/i, "");
      const email = emails[token];
      return email
        ? { ok: true, json: async () => ({ id: `${token}-id`, email }) }
        : { ok: false, json: async () => ({ message: "invalid" }) };
    }
    if (String(url).includes("/rest/v1/beta_events")) {
      return { ok: true, statusText: "OK", json: async () => [] };
    }
    if (String(url).includes("/rest/v1/sonic_memberships")) {
      return { ok: true, statusText: "OK", json: async () => [] };
    }
    throw new Error(`Unexpected URL: ${url}`);
  };

  const { resolveAccessContext } = require("../lib/api/_access-control");
  const accessHandler = require("../lib/api/_access-context");
  const analyticsHandler = require("../lib/api/_admin-analytics");
  const analyticsPrivate = analyticsHandler._private;

  const owner = await resolveAccessContext(request("owner"));
  const admin = await resolveAccessContext(request("admin"));
  const moderator = await resolveAccessContext(request("moderator"));
  const free = await resolveAccessContext(request("free"));
  const paid = await resolveAccessContext(request("paid"), {}, { includeMembership: true });
  assert.equal(owner.role, "owner");
  assert.equal(owner.canAccessAdmin, true);
  assert.equal(admin.role, "admin");
  assert.equal(admin.canAccessAdmin, true);
  assert.equal(admin.canModerate, true);
  assert.equal(moderator.role, "moderator");
  assert.equal(moderator.canAccessAdmin, false);
  assert.equal(moderator.canModerate, true);
  assert.equal(free.role, "free");
  assert.equal(free.canAccessAdmin, false);
  assert.equal(paid.role, "premium");
  assert.equal(paid.premium, true);
  assert.equal(paid.membership.provider, "manual");

  const accessResponse = responseHarness();
  await accessHandler(request("admin"), accessResponse);
  assert.equal(accessResponse.statusCode, 200);
  assert.equal(accessResponse.body.viewer.canAccessAdmin, true);
  assert.equal(accessResponse.body.viewer.membership.plan.code, "free");

  const paidAccessResponse = responseHarness();
  await accessHandler(request("paid"), paidAccessResponse);
  assert.equal(paidAccessResponse.statusCode, 200);
  assert.equal(paidAccessResponse.body.viewer.premium, true);

  const deniedResponse = responseHarness();
  await analyticsHandler(request("moderator"), deniedResponse);
  assert.equal(deniedResponse.statusCode, 403);
  assert.equal(deniedResponse.body.error, "admin_required");

  const analyticsResponse = responseHarness();
  await analyticsHandler(request("admin"), analyticsResponse);
  assert.equal(analyticsResponse.statusCode, 200);
  assert.equal(analyticsResponse.body.ok, true);

  const now = Date.parse("2026-07-21T12:00:00.000Z");
  const sessionRows = [
    { event_name: "app_session_started", anonymous_id: "person-a", session_id: "session-a1", occurred_at: "2026-07-21T00:00:00.000Z", platform: "ios", environment: "production" },
    { event_name: "app_session_started", anonymous_id: "person-a", session_id: "session-a2", occurred_at: "2026-07-21T08:00:00.000Z", platform: "ios", environment: "production" },
    { event_name: "app_session_started", anonymous_id: "person-b", session_id: "session-b1", occurred_at: "2026-07-21T09:00:00.000Z", platform: "web", environment: "production" },
    { event_name: "app_session_started", anonymous_id: "preview-person", session_id: "preview-session", occurred_at: "2026-07-21T10:00:00.000Z", platform: "web", environment: "preview" }
  ];
  const activityRows = [
    { event_name: "recommendation_generated", anonymous_id: "person-a", session_id: "session-a2", occurred_at: "2026-07-21T08:10:00.000Z", environment: "production" },
    { event_name: "recommendation_generated", anonymous_id: "person-b", session_id: "session-b1", occurred_at: "2026-07-21T09:10:00.000Z", environment: "production" },
    { event_name: "preview_played", anonymous_id: "person-a", session_id: "session-a2", occurred_at: "2026-07-21T08:12:00.000Z", environment: "production" },
    { event_name: "track_disliked", anonymous_id: "person-a", session_id: "session-a2", occurred_at: "2026-07-21T08:13:00.000Z", environment: "production", payload: { reason: "preview_issue", artist: "Artist A", song: "Track A", style: "Techno" } },
    { event_name: "share_card_clicked", anonymous_id: "person-b", session_id: "session-b1", occurred_at: "2026-07-21T09:15:00.000Z", environment: "production" }
  ];
  const measured = analyticsPrivate.aggregateAnalytics(sessionRows, activityRows, { now });
  assert.deepEqual(measured.periods.day, { days: 1, users: 2, sessions: 3 });
  assert.deepEqual(measured.platforms, { days: 30, android: 0, ios: 1, web: 1 });
  assert.equal(measured.retention.returningUsers, 1);
  assert.equal(measured.retention.rate, 50);
  assert.equal(measured.funnel.stages.opened.users, 2);
  assert.equal(measured.funnel.stages.listened.rate, 50);
  assert.equal(measured.funnel.stages.valued.rate, 50);
  assert.equal(measured.issues.total, 1);
  assert.equal(measured.issues.byReason.preview_issue, 1);
  assert.equal(measured.measurement.preciseRate, 100);

  const appSource = fs.readFileSync(path.join(rootDir, "app.js"), "utf8");
  const indexSource = fs.readFileSync(path.join(rootDir, "index.html"), "utf8");
  const vercelConfig = JSON.parse(fs.readFileSync(path.join(rootDir, "vercel.json"), "utf8"));
  assert.match(appSource, /function hasAdminAccess\(\)/);
  assert.match(appSource, /refreshAdminAccess\(\{ force: true \}\)/);
  assert.match(appSource, /function loadAdminOperations\(options = \{\}\)/);
  assert.doesNotMatch(appSource, /data-admin-delete-post/);
  assert.match(indexSource, /data-app-tab-target="admin"/);
  assert.match(indexSource, /id="adminFunnelList"/);
  assert.match(indexSource, /id="adminHealthGrid"/);
  assert.doesNotMatch(indexSource, /id="adminModerationList"/);
  assert.match(indexSource, /adminAccessEndpoint: "\/api\/access-context"/);
  assert.ok(vercelConfig.rewrites.some((rewrite) => rewrite.source === "/admin/analytics"));
  assert.ok(vercelConfig.rewrites.some((rewrite) => rewrite.source === "/api/access-context"));
  console.log("Admin access and navigation contract: ok");
}

main()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(restoreEnvironment);
