#!/usr/bin/env node

import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import vm from "node:vm";
import { fileURLToPath } from "node:url";

const rootDir = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const appSource = fs.readFileSync(path.join(rootDir, "app.js"), "utf8");

function extractFunction(name) {
  const marker = `function ${name}`;
  const start = appSource.indexOf(marker);
  if (start < 0) throw new Error(`Missing function: ${name}`);
  const signatureEnd = appSource.indexOf(") {", start);
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

const context = vm.createContext({
  Set,
  currentLanguage: "en",
  safeExternalUrl: (value = "") => String(value || "").trim(),
  normalizeNewsUrl: (value = "") => String(value || "").split("?")[0].replace(/\/$/, "").toLowerCase(),
  sonicArticleMedia: (article = {}) => Array.isArray(article.media) ? article.media : []
});

vm.runInContext(`
  ${extractFunction("sonicLocalizedText")}
  ${extractFunction("mergeSonicLocalizedEntries")}
  ${extractFunction("localizeSonicArticle")}
  ${extractFunction("sonicArticleVisualCandidates")}
  ${extractFunction("pickSonicArticleVisual")}
`, context);

const localizedArticle = context.localizeSonicArticle({
  title: "Título em português",
  body: "Corpo em português",
  city: "Guarulhos",
  lineup: [{ name: "Gaida", time: "15h", role: "fechamento" }],
  serviceInfo: {
    address: "Rua Ema Meo Steola, 27",
    price: "Consulte o lote",
    media: [{ url: "https://images.example/poster.jpg", caption: "Legenda em português" }],
    relatedLinks: [{ url: "https://example.com", label: "Fonte oficial" }]
  },
  translations: {
    en: {
      title: "English title",
      body: "English body",
      lineup: [{ role: "closing set" }],
      serviceInfo: {
        price: "Check the current tier",
        media: [{ caption: "English caption" }],
        relatedLinks: [{ label: "Official source" }]
      }
    }
  }
}, "en");

assert.equal(localizedArticle.title, "English title");
assert.equal(localizedArticle.body, "English body");
assert.equal(localizedArticle.city, "Guarulhos");
assert.equal(localizedArticle.lineup[0].name, "Gaida");
assert.equal(localizedArticle.lineup[0].role, "closing set");
assert.equal(localizedArticle.serviceInfo.address, "Rua Ema Meo Steola, 27");
assert.equal(localizedArticle.serviceInfo.price, "Check the current tier");
assert.equal(localizedArticle.serviceInfo.media[0].url, "https://images.example/poster.jpg");
assert.equal(localizedArticle.serviceInfo.media[0].caption, "English caption");
assert.equal(localizedArticle.serviceInfo.relatedLinks[0].url, "https://example.com");
assert.equal(localizedArticle.serviceInfo.relatedLinks[0].label, "Official source");

const usedImageKeys = new Set();
const sharedCover = "https://images.example/cosmic.jpg?v=1";
const first = context.pickSonicArticleVisual({ coverImageUrl: sharedCover }, usedImageKeys);
const second = context.pickSonicArticleVisual({
  coverImageUrl: "https://images.example/cosmic.jpg?v=2",
  media: [{ url: "https://images.example/cosmic-detail.jpg", alt: "Detalhe da pista" }]
}, usedImageKeys);
const third = context.pickSonicArticleVisual({ coverImageUrl: sharedCover }, usedImageKeys);

assert.equal(first.url, sharedCover);
assert.equal(second.url, "https://images.example/cosmic-detail.jpg");
assert.equal(second.alt, "Detalhe da pista");
assert.equal(third.url, "");
assert.equal(third.deduplicated, true);
assert.match(appSource, /createSonicEditorialCard\(article, 0, \{ usedImageKeys \}\)/);
assert.match(appSource, /createSonicEditorialArchiveCard\(archiveArticle, articleIndex, \{ usedImageKeys \}\)/);
assert.match(appSource, /rerenderSonicEditorialLanguage\(\);/);
assert.match(appSource, /async function loadMoreSonicEditorialArticles\(\)/);
assert.match(appSource, /new URLSearchParams\(\{ limit: "20", offset: String\(offset\) \}\)/);

console.log("Newsroom policy passed: localized stories follow the selected language, archive visuals stay unique, and older editions are paginated.");
