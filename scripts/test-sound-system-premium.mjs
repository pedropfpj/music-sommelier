#!/usr/bin/env node

import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import path from "node:path";
import { createRequire } from "node:module";
import { fileURLToPath } from "node:url";

const rootDir = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const require = createRequire(import.meta.url);
const [indexSource, appSource, stylesSource, apiSource, envSource, readmeSource] = await Promise.all([
  readFile(path.join(rootDir, "index.html"), "utf8"),
  readFile(path.join(rootDir, "app.js"), "utf8"),
  readFile(path.join(rootDir, "styles.css"), "utf8"),
  readFile(path.join(rootDir, "api/spirit-image.js"), "utf8"),
  readFile(path.join(rootDir, ".env.example"), "utf8"),
  readFile(path.join(rootDir, "README.md"), "utf8")
]);

assert.match(indexSource, /id="spiritPremiumGate"[^>]*aria-labelledby="spiritPremiumGateTitle"/, "Sound System needs an accessible Premium gate");
assert.match(indexSource, /id="spiritPremiumCta"/, "Premium gate needs one clear upgrade action");
assert.match(indexSource, /imageGenerationRequiresTrustedUser:\s*true/, "Published client config must require verified access for AI artwork");
assert.match(indexSource, /imageLimitPerProfile:\s*1/, "Client generation limit must be one artwork per milestone");
assert.match(indexSource, /allowImageRegeneration:\s*false/, "Paid artwork must not silently regenerate and increase cost");

assert.match(appSource, /const PREMIUM_ART_PROMPT_MIN_LIKES = 10;/, "The first paid artwork milestone must start at ten likes");
assert.match(appSource, /function aiImagePremiumRequiredForCurrentUser\(\)/, "Client needs an explicit Premium gate");
assert.match(appSource, /return `\$\{spiritCollectibleUserSignature\(\)\}::\$\{milestoneLikes\}`;/, "Usage accounting must reset at each milestone");
assert.match(appSource, /Number\(item\.milestoneLikes\) === Number\(milestoneLikes\)/, "Existing artwork detection must be milestone-specific");
assert.match(appSource, /classList\.toggle\("is-premium-locked", premiumLocked\)/, "Sound System must render its locked state");
assert.match(appSource, /classList\.toggle\("hidden", premiumLocked\)/, "The generation button must be hidden while Premium is locked");
assert.match(appSource, /!aiImagePremiumRequiredForCurrentUser\(\)[\s\S]{0,120}\) \{/, "Automatic generation must not run for free users");
assert.match(appSource, /bind\(spiritPremiumCta, "click"[\s\S]{0,500}openPremiumDialog\(\)/, "The Sound System CTA must open the existing Premium offer");
assert.match(appSource, /Arte exclusiva do seu Sound System criada por IA/, "Premium offer must state the AI artwork benefit");
assert.match(appSource, /milestoneLikes,\n\s+artParams/, "Saved artwork must retain its milestone for future access checks");

assert.match(apiSource, /const requirePremium = envFlag\("SONIC_AI_IMAGE_REQUIRE_PREMIUM", false\);/, "Server Premium enforcement must be independent from free milestones");
assert.doesNotMatch(apiSource, /const requirePremium[^;]*freeSoundSystemUnlocked/, "Ten free likes must never bypass a required Premium subscription");
const ownerKeySource = apiSource.slice(apiSource.indexOf("function spiritImageOwnerKey"), apiSource.indexOf("function soundSystemFreeUnlock"));
assert.match(ownerKeySource, /"milestone",\n\s+milestoneLikes/, "Server quota must be scoped by user and milestone");
assert.doesNotMatch(ownerKeySource, /spiritId|profileSignature/, "Changing a style or visual profile must not bypass the milestone quota");

assert.match(stylesSource, /\.spirit-premium-gate\s*\{/, "Premium gate needs a dedicated visual treatment");
assert.match(stylesSource, /\.spirit-premium-cta:focus-visible/, "Premium CTA needs a visible keyboard focus state");
assert.match(stylesSource, /@media \(max-width: 700px\)[\s\S]{0,2200}\.spirit-premium-benefits/, "Premium gate must adapt to phones");

assert.match(envSource, /^SONIC_AI_IMAGE_REQUIRE_PREMIUM=true$/m, "Recommended server configuration must require Premium");
assert.match(envSource, /^SONIC_SPIRIT_IMAGE_REQUIRE_TRUSTED_USER=true$/m, "Recommended server configuration must require verified access");
assert.match(envSource, /^SONIC_AI_IMAGE_MAX_PER_USER=1$/m, "Recommended server configuration must control AI cost per milestone");
assert.match(envSource, /^SONIC_BILLING_ENABLED=false$/m, "Billing must remain disabled during safe preview testing");
assert.match(readmeSource, /perfil e a evolucao por curtidas continuam gratuitos/, "Product documentation must preserve the free Sound System profile");

const trackedEnv = [
  "SONIC_AI_IMAGE_ENABLED",
  "SONIC_AI_IMAGE_REQUIRE_PREMIUM",
  "SONIC_AI_ALLOWED_ORIGINS",
  "SONIC_REQUIRE_DURABLE_RATE_LIMITS"
];
const originalEnv = Object.fromEntries(trackedEnv.map((key) => [key, process.env[key]]));
try {
  process.env.SONIC_AI_IMAGE_ENABLED = "true";
  process.env.SONIC_AI_IMAGE_REQUIRE_PREMIUM = "true";
  process.env.SONIC_AI_ALLOWED_ORIGINS = "http://localhost:4173";
  process.env.SONIC_REQUIRE_DURABLE_RATE_LIMITS = "false";
  const handler = require("../api/spirit-image.js");
  const request = {
    method: "POST",
    headers: { origin: "http://localhost:4173", "user-agent": "sound-system-premium-test" },
    body: { likes: 10, milestoneLikes: 10, userSignature: "free-test-user" }
  };
  let responseBody = "";
  const response = {
    headers: {},
    setHeader(key, value) { this.headers[key] = value; },
    end(value = "") { responseBody += value; this.finished = true; }
  };
  await handler(request, response);
  assert.equal(response.statusCode, 402, "A free user with ten likes must still be blocked by the server");
  assert.equal(JSON.parse(responseBody).error, "premium_required", "Server must return an explicit Premium requirement");
} finally {
  trackedEnv.forEach((key) => {
    delete process.env[key];
    if (originalEnv[key] !== undefined) process.env[key] = originalEnv[key];
  });
}

console.log("Sound System Premium contract passed: free evolution, verified AI gate, milestone quota and safe billing state are wired.");
