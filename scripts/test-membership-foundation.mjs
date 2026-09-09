#!/usr/bin/env node

import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { createRequire } from "node:module";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const rootDir = path.resolve(__dirname, "..");
const require = createRequire(import.meta.url);
const originalFetch = global.fetch;
const envKeys = ["SUPABASE_URL", "SUPABASE_SERVICE_ROLE_KEY"];
const originalEnv = Object.fromEntries(envKeys.map((key) => [key, process.env[key]]));

function restoreEnvironment() {
  envKeys.forEach((key) => {
    delete process.env[key];
    if (originalEnv[key] !== undefined) process.env[key] = originalEnv[key];
  });
  global.fetch = originalFetch;
}

async function main() {
  process.env.SUPABASE_URL = "https://supabase.test";
  process.env.SUPABASE_SERVICE_ROLE_KEY = "service-test";
  const access = require("../lib/api/_access-control");

  assert.equal(access.activeMembershipRow({ status: "active" }), true);
  assert.equal(access.activeMembershipRow({ status: "past_due" }), false);
  assert.equal(access.activeMembershipRow({ status: "active", current_period_end: "2020-01-01T00:00:00Z" }), false);
  assert.equal(access.activeMembershipRow({ status: "trialing", trial_end: "2999-01-01T00:00:00Z" }), true);

  global.fetch = async (url) => {
    if (String(url).includes("/rest/v1/sonic_memberships")) {
      return {
        ok: true,
        json: async () => [{
          plan_code: "premium",
          status: "active",
          provider: "stripe",
          current_period_end: "2999-01-01T00:00:00Z",
          cancel_at_period_end: false
        }]
      };
    }
    if (String(url).includes("/rest/v1/sonic_plans")) {
      return {
        ok: true,
        json: async () => [{
          code: "premium",
          name: "Sonic Premium",
          description: "Radar diário",
          features: ["likes_unlimited", "daily_radar"]
        }]
      };
    }
    throw new Error(`Unexpected URL: ${url}`);
  };

  const premium = await access.resolveMembership({ userId: "user-premium" });
  assert.equal(premium.premium, true);
  assert.equal(premium.provider, "stripe");
  assert.equal(premium.plan.code, "premium");
  assert.deepEqual(premium.plan.features, ["likes_unlimited", "daily_radar"]);

  const manual = await access.resolveMembership({ userId: "user-founder", manualPremium: true });
  assert.equal(manual.premium, true);
  assert.equal(manual.source, "environment");
  assert.equal(manual.plan.code, "premium");

  global.fetch = async (url) => {
    if (String(url).includes("/rest/v1/sonic_memberships")) {
      return { ok: false, json: async () => ({ code: "PGRST205" }) };
    }
    throw new Error(`Unexpected URL: ${url}`);
  };
  const beforeMigration = await access.resolveMembership({ userId: "user-free" });
  assert.equal(beforeMigration.premium, false);
  assert.equal(beforeMigration.setupNeeded, true);
  assert.equal(beforeMigration.plan.code, "free");

  const appSource = fs.readFileSync(path.join(rootDir, "app.js"), "utf8");
  const uiSource = fs.readFileSync(path.join(rootDir, "daily-djs-ui.js"), "utf8");
  const indexSource = fs.readFileSync(path.join(rootDir, "index.html"), "utf8");
  const migrationSource = fs.readFileSync(path.join(rootDir, "supabase/migrations/20260902000100_sonic_membership_foundation.sql"), "utf8");

  assert.match(appSource, /return isLocalDevelopmentHost\(\) && aiConfigFlag\("premiumUnlocked", false\)/);
  assert.match(appSource, /if \(hasPremiumAccess\(\)\) return "premium"/);
  assert.match(uiSource, /access === "preview" \|\| access === "premium"/);
  for (const id of ["membershipCard", "membershipTitle", "membershipFeatureList", "membershipPrimaryBtn", "membershipRefreshBtn"]) {
    assert.match(indexSource, new RegExp(`id="${id}"`));
  }
  assert.match(migrationSource, /create table if not exists public\.sonic_plans/);
  assert.match(migrationSource, /create table if not exists public\.sonic_memberships/);
  assert.match(migrationSource, /create table if not exists public\.sonic_billing_events/);
  assert.match(migrationSource, /revoke all on public\.sonic_memberships from anon, authenticated/);
  assert.match(migrationSource, /"likes_unlimited"/);
  console.log("SaaS membership foundation: ok");
}

main()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(restoreEnvironment);
