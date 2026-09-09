#!/usr/bin/env node

import assert from "node:assert/strict";
import { readFile, stat } from "node:fs/promises";
import path from "node:path";
import { gzipSync } from "node:zlib";
import { fileURLToPath } from "node:url";

const rootDir = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const [indexSource, stylesSource, appSource, runtimeSource, manifestSource, coreSource] = await Promise.all([
  readFile(path.join(rootDir, "index.html"), "utf8"),
  readFile(path.join(rootDir, "styles.css"), "utf8"),
  readFile(path.join(rootDir, "app.js"), "utf8"),
  readFile(path.join(rootDir, "catalog-runtime.js"), "utf8"),
  readFile(path.join(rootDir, "data/runtime-catalog-v1/manifest.json"), "utf8"),
  readFile(path.join(rootDir, "data/runtime-catalog-v1/core.json"), "utf8")
]);

assert.match(indexSource, /<a class="skip-link" href="#appContent">/, "App needs a keyboard skip link");
assert.match(indexSource, /<main id="appContent"[^>]*tabindex="-1"/, "Main content must be a focus target");
assert.match(indexSource, /<h1 id="heroTitle">/, "Visible app hero must be the main heading");
assert.match(indexSource, /app-tab-btn-secondary-start[^>]*data-app-tab-target="about"/, "Institutional navigation must start a secondary group");
assert.match(indexSource, /<details id="resultMoreDetails"[\s\S]*?<summary id="resultMoreSummary">/, "Secondary track tools must use progressive disclosure");

const finalExperienceCss = stylesSource.slice(stylesSource.lastIndexOf("/* First-experience pass:"));
assert.ok(finalExperienceCss.length > 0, "First-experience CSS layer is missing");
assert.match(finalExperienceCss, /\.privacy-consent-actions button[\s\S]*?white-space:\s*normal/, "Privacy actions must wrap text");
assert.match(finalExperienceCss, /@media \(max-width: 430px\)[\s\S]*?\.privacy-consent-actions[\s\S]*?grid-template-columns:\s*minmax\(0, 1fr\)/, "Privacy actions must stack on narrow phones");
assert.match(finalExperienceCss, /grid-template-areas:[\s\S]*?"surprise surprise"[\s\S]*?"pass like"/, "Mobile listening CTA must appear before reactions");
assert.match(finalExperienceCss, /#topSwipeCard\.is-empty \+ \.swipe-hero-actions[\s\S]*?#topSwipePassBtn[\s\S]*?display:\s*none !important/, "Disabled reactions must stay hidden before the first track");
assert.match(finalExperienceCss, /#audioVolumeSlider,[\s\S]*?\.social-comments-tab,[\s\S]*?min-height:\s*44px/, "Previously undersized controls need 44px targets");

const catalogScriptIndex = indexSource.indexOf("catalog-runtime.min.js");
const appScriptIndex = indexSource.indexOf("app.min.js");
assert.ok(catalogScriptIndex >= 0 && catalogScriptIndex < appScriptIndex, "Catalog runtime module must load before the app bundle");
assert.match(runtimeSource, /function loadCore\(\)[\s\S]*?function loadStyle\(style/, "Catalog runtime must expose core and style-scoped loading");

const hydrationSource = appSource.slice(
  appSource.indexOf("async function hydrateExternalDatasetPackInBackground"),
  appSource.indexOf("function scheduleExternalDatasetWarmup")
);
assert.doesNotMatch(hydrationSource, /EXTERNAL_DATASET_FILES|for \(let index = 0;/, "Runtime hydration must not scan the raw source pack");
assert.match(hydrationSource, /loadExternalDatasetRuntimeRows\(cleanStyle\)/, "Manual styles must load only their runtime shard");

const firstRecommendationSource = appSource.slice(
  appSource.indexOf("function runInitialRecommendation"),
  appSource.indexOf("async function runPrimaryRecommendationAction")
);
assert.ok(
  firstRecommendationSource.indexOf("tryRunInstantPrimaryRecommendation()") <
    firstRecommendationSource.indexOf("await waitForMinimumCatalogReady()"),
  "First recommendation must try the shipped curated deck before waiting for catalog readiness"
);

const manifest = JSON.parse(manifestSource);
const core = JSON.parse(coreSource);
assert.equal(manifest.version, 1, "Runtime catalog manifest must be versioned");
assert.ok(Object.keys(manifest.styles || {}).length >= 100, "Runtime catalog needs broad style coverage");
assert.ok(core.length >= 1000, "Runtime core needs enough tracks for broad anonymous discovery");
assert.ok(gzipSync(coreSource).byteLength < 450_000, "Compressed runtime core must stay below 450 KB");
assert.ok((await stat(path.join(rootDir, "catalog-runtime.min.js"))).size < 4_000, "Catalog loader must remain a small module");

console.log(
  `First-experience contract passed: ${core.length} core tracks, ` +
  `${Object.keys(manifest.styles).length} on-demand style shards, ${gzipSync(coreSource).byteLength} gzip bytes.`
);
