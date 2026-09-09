#!/usr/bin/env node

import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { createRequire } from "node:module";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const rootDir = path.resolve(__dirname, "..");
const require = createRequire(import.meta.url);
const billing = require("../lib/api/_billing-store.js");
const trackedEnv = ["SONIC_BILLING_ENABLED", "SONIC_STRIPE_WEBHOOKS_ENABLED", "SONIC_PREMIUM_TRIAL_DAYS", "APPLE_APP_ID", "VERCEL_ENV", "SONIC_APP_ORIGIN"];
const originalEnv = Object.fromEntries(trackedEnv.map((key) => [key, process.env[key]]));

try {
  process.env.SONIC_BILLING_ENABLED = "false";
  process.env.SONIC_STRIPE_WEBHOOKS_ENABLED = "false";
  process.env.SONIC_PREMIUM_TRIAL_DAYS = "14";
  const previewPlans = billing.launchPreviewPlans();
  assert.equal(previewPlans.length, 2);
  assert.deepEqual(previewPlans.map((plan) => plan.cadence), ["monthly", "yearly"]);
  assert.equal(previewPlans[0].regionalPrices.BRL, "R$ 9,90");
  assert.equal(previewPlans[1].regionalPrices.EUR, "€ 24,99");
  assert.equal(previewPlans.every((plan) => plan.preview && plan.trialDays === 14), true);
  const disabledPublicPlans = await billing.publicPlans();
  assert.equal(disabledPublicPlans.enabled, false);
  assert.equal(disabledPublicPlans.plans.length, 0);
  assert.equal(disabledPublicPlans.previewPlans.length, 2);
  assert.equal(billing.stripeWebhooksEnabled(), false);

  process.env.SONIC_STRIPE_WEBHOOKS_ENABLED = "true";
  assert.equal(billing.stripeWebhooksEnabled(), true);

  process.env.SONIC_BILLING_ENABLED = "true";
  process.env.SONIC_PREMIUM_TRIAL_DAYS = "14";
  assert.equal(billing.premiumTrialDays(), 14);
  process.env.SONIC_PREMIUM_TRIAL_DAYS = "90";
  assert.equal(billing.premiumTrialDays(), 31);
  process.env.SONIC_PREMIUM_TRIAL_DAYS = "14";
  assert.equal(billing.billingAvailability().appleSandbox, true);
  assert.equal(billing.billingAvailability().appleProduction, false);
  process.env.APPLE_APP_ID = "1234567890";
  assert.equal(billing.billingAvailability().appleProduction, true);

  assert.equal(billing.sonicStripeStatus("trialing"), "trialing");
  assert.equal(billing.sonicStripeStatus("unpaid"), "past_due");
  assert.equal(billing.sonicStripeStatus("incomplete_expired"), "incomplete");
  assert.deepEqual(
    billing.stripePeriod({ items: { data: [{ current_period_start: 10, current_period_end: 20 }] } }),
    { start: "1970-01-01T00:00:10.000Z", end: "1970-01-01T00:00:20.000Z" }
  );
  assert.equal(billing.originUrl("https://evil.invalid/checkout"), "https://sonicsearch.app");
  assert.equal(billing.originUrl("http://localhost:8080/test"), "http://localhost:8080");

  const activeApple = billing.appleMembershipRow({
    productId: billing.APPLE_MONTHLY_PRODUCT_ID,
    transactionId: "100",
    originalTransactionId: "90",
    appAccountToken: "1d90b377-0fdd-4e0e-8cad-11feaf4db145",
    purchaseDate: Date.now() - 1000,
    expiresDate: Date.now() + 86400000,
    environment: "Sandbox"
  });
  assert.equal(activeApple.status, "active");
  assert.equal(activeApple.provider, "apple");
  assert.equal(activeApple.plan_code, "premium");
  assert.throws(() => billing.appleMembershipRow({ ...activeApple, productId: "invalid" }), /apple_product_not_allowed/);

  const migration = fs.readFileSync(path.join(rootDir, "supabase/migrations/20260902000100_sonic_membership_foundation.sql"), "utf8");
  const app = fs.readFileSync(path.join(rootDir, "app.js"), "utf8");
  const native = fs.readFileSync(path.join(rootDir, "ios/App/App/SonicBridgeViewController.swift"), "utf8");
  assert.match(migration, /function public\.claim_sonic_billing_event/);
  assert.match(migration, /grant execute on function public\.claim_sonic_billing_event/);
  assert.match(app, /SonicSubscriptions/);
  assert.match(app, /data-premium-cadence/);
  assert.match(app, /premiumOfferDisplayPrice/);
  assert.match(app, /function openPremiumFromDailyRadar\(\)[\s\S]{0,400}void openPremiumDialog\(\)/);
  const index = fs.readFileSync(path.join(rootDir, "index.html"), "utf8");
  assert.ok(index.indexOf('id="premiumDialog"') > index.indexOf("</main>"), "Premium dialog must stay outside hidden tab panels");
  assert.match(index, /id="premiumProfilePreview"/);
  assert.match(index, /id="premiumProfileSignals"/);
  assert.match(app, /Indicações moldadas pelo seu perfil/);
  assert.match(app, /function premiumProfileSnapshot/);
  assert.match(app, /classList\.add\("premium-dialog-open"\)/);
  assert.match(app, /bind\(premiumDialog, "close", \(\) => \{[\s\S]{0,160}classList\.remove\("premium-dialog-open"\)/);
  const styles = fs.readFileSync(path.join(rootDir, "styles.css"), "utf8");
  assert.match(styles, /html\.premium-dialog-open[\s\S]{0,120}overflow:\s*hidden/);
  assert.match(styles, /\.premium-dialog\s*\{[\s\S]{0,300}overflow:\s*hidden/);
  assert.match(styles, /\.premium-dialog-shell::\-webkit-scrollbar/);
  assert.match(app, /https:\/\/apps\.apple\.com\/account\/subscriptions/);
  assert.match(fs.readFileSync(path.join(rootDir, "lib/api/_billing-store.js"), "utf8"), /stripeTrialAvailable/);
  assert.match(native, /verification\.jwsRepresentation/);
  assert.match(native, /AppStore\.showManageSubscriptions/);
  console.log("Billing foundation: ok");
} finally {
  trackedEnv.forEach((key) => {
    delete process.env[key];
    if (originalEnv[key] !== undefined) process.env[key] = originalEnv[key];
  });
}
