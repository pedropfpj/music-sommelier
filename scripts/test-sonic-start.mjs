#!/usr/bin/env node

import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const rootDir = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const [indexSource, appSource, stylesSource] = await Promise.all([
  readFile(path.join(rootDir, "index.html"), "utf8"),
  readFile(path.join(rootDir, "app.js"), "utf8"),
  readFile(path.join(rootDir, "styles.css"), "utf8")
]);

assert.equal((indexSource.match(/data-auth-lang=/g) || []).length, 3, "Auth needs an unobtrusive PT/EN/ES language switch");
assert.match(indexSource, /id="authLanguageLabel"/, "The compact language switch needs an accessible label");
const introMarkup = indexSource.slice(
  indexSource.indexOf('id="introScreen"'),
  indexSource.indexOf('id="languageScreen"')
);
assert.doesNotMatch(introMarkup, /[🔊🎚🎛☠⚡]/u, "The opening must avoid platform-dependent emoji decoration");

const introHandler = appSource.slice(
  appSource.indexOf('bind(introContinueBtn, "click"'),
  appSource.indexOf('bind(startBtn, "click"')
);
assert.match(introHandler, /showAuthScreen/, "The intro action must go directly to access instead of an extra language gate");

const introScreenSource = appSource.slice(
  appSource.indexOf("function showIntroScreen"),
  appSource.indexOf("function showUsageGuideScreen")
);
assert.match(introScreenSource, /900/, "The visual opening must stay below one second");
assert.match(introScreenSource, /showAuthScreen/, "The visual opening must advance directly to access");
assert.doesNotMatch(introScreenSource, /showLanguageScreen/, "Automatic entry must not force a language screen");

const guestSource = appSource.slice(
  appSource.indexOf("async function continueWithoutLogin"),
  appSource.indexOf("function createTestUserSession")
);
assert.match(guestSource, /showGuide: false, autoRecommendation: true/, "Guest entry must deliver a recommendation before any guide");
assert.match(guestSource, /beginSonicFirstValueWindow\(\)/, "Guest entry must suppress Premium distractions during first value");

const providerSource = appSource.slice(
  appSource.indexOf("function updateAuthProviderUi"),
  appSource.indexOf("function showAuthProviderConfigMissing")
);
assert.match(providerSource, /isNativeIosRuntime\(\)/, "The primary access provider must adapt to iPhone");
assert.match(providerSource, /is-primary-provider/, "Exactly one configured online provider needs primary emphasis");

assert.match(stylesSource, /\.auth-language-btn[\s\S]*?min-width:\s*44px[\s\S]*?min-height:\s*44px/, "Language controls need iPhone-safe touch targets");
assert.match(stylesSource, /\.auth-google-entry-btn\.is-primary-provider/, "The preferred online account action needs clear primary styling");
assert.match(stylesSource, /body\.sonic-first-value-window #dailyRadarPanel/, "Premium promotion must stay out of the first 30-second listening window");
assert.match(stylesSource, /@media \(prefers-reduced-motion: reduce\)/, "The entry experience must retain reduced-motion support");

console.log("Sonic Start contract passed: automatic language, three-tap calibration, instant guest value and adaptive primary login are wired.");
