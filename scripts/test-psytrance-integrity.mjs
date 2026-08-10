#!/usr/bin/env node

import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import path from "node:path";
import vm from "node:vm";
import { fileURLToPath } from "node:url";

const rootDir = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const appSource = await readFile(path.join(rootDir, "app.js"), "utf8");
const apiSource = await readFile(path.join(rootDir, "api", "catalog-extra.js"), "utf8");
const bulkGeneratorSource = await readFile(path.join(rootDir, "scripts", "generate-catalog-extra-bulk-import.mjs"), "utf8");
const migrationSource = await readFile(
  path.join(rootDir, "supabase", "migrations", "20260805000100_quarantine_psytrance_homonym_collisions.sql"),
  "utf8"
);

function functionSource(source, name) {
  const marker = `function ${name}`;
  const start = source.indexOf(marker);
  assert.ok(start >= 0, `Missing function: ${name}`);
  const signatureEnd = source.slice(start).match(/\)\s*\{/);
  assert.ok(signatureEnd, `Missing function body: ${name}`);
  const bodyStart = start + signatureEnd.index + signatureEnd[0].lastIndexOf("{");
  let depth = 0;
  let quote = "";
  let escaped = false;
  let lineComment = false;
  let blockComment = false;

  for (let index = bodyStart; index < source.length; index += 1) {
    const character = source[index];
    const next = source[index + 1];
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
    if (character === "\"" || character === "'" || character === "`") {
      quote = character;
      continue;
    }
    if (character === "{") depth += 1;
    if (character === "}") depth -= 1;
    if (depth === 0) return source.slice(start, index + 1);
  }
  throw new Error(`Unclosed function: ${name}`);
}

const apiSandbox = {
  require: () => ({
    enforceDurableMusicDailyLimit: async () => true,
    envFlag: () => false,
    envText: () => "",
    requireMusicApi: () => false,
    sendJson: () => {},
    trimText: (value) => String(value || "")
  }),
  module: { exports: {} },
  exports: {},
  URLSearchParams,
  URL,
  fetch: async () => ({ ok: false, json: async () => null })
};
vm.runInNewContext(
  `${apiSource}\nthis.trackPasses = catalogTrackPassesPsytranceIntegrity;`,
  apiSandbox
);

const trackPasses = apiSandbox.trackPasses;
const wrongFuriousTracks = [
  ["Don't Change Your Style", "Wreck The Hoose Juice"],
  ["Hang Your Head", "Nervous Records"],
  ["Punk Bashin' Boogie", "Cosmo Records"],
  ["Wet", "Wet (feat. Rayven Justice & Jonn Hart) - Single"],
  ["Who to Trust", "Tad's Record Inc."]
];
wrongFuriousTracks.forEach(([song, label]) => {
  assert.equal(
    trackPasses({ style: "dark_psy", artist: "Furious", song, label }),
    false,
    `${song} must be rejected from dark psy`
  );
});
assert.equal(
  trackPasses({
    style: "dark_psy",
    artist: "Furious",
    song: "Something Special",
    label: "Kali Yuga",
    metadata: { album_genres: "Dance;Trance" }
  }),
  true,
  "The verified Furious psytrance recording must remain eligible"
);
assert.equal(
  trackPasses({
    style: "forest_psy",
    artist: "Ambiguous Name",
    song: "Wrong Release",
    metadata: { album_genres: "Alternative;Rock;Rockabilly" }
  }),
  false,
  "A rock-only release must never pass a psytrance-family filter"
);
assert.equal(
  trackPasses({
    style: "forest_psy",
    artist: "Verified Psy Artist",
    song: "Forest Track",
    metadata: { album_genres: "Electronic;Dance;Trance" }
  }),
  true,
  "An electronic trance release must remain eligible"
);

const conflictSandbox = {
  normalize: (value = "") => String(value || "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/&/g, " and ")
    .replace(/[^a-z0-9]+/g, " ")
    .trim()
    .replace(/\s+/g, " "),
  catalogTrackMetadataText: (track = {}, key = "") => String(track?.metadata?.[key] || ""),
  hasReliableBpmForTrack: (track = {}) => Number(track.bpmExact) > 0
};
vm.runInNewContext(
  `${functionSource(appSource, "hasNonElectronicReleaseConflict")}; this.hasConflict = hasNonElectronicReleaseConflict;`,
  conflictSandbox
);
assert.equal(
  conflictSandbox.hasConflict({
    style: "dark_psy",
    artist: "Furious",
    song: "Hang Your Head",
    label: "Nervous Records",
    metadata: { album_genres: "Alternativo;Rock;Rock e Roll/Rockabilly" }
  }),
  true,
  "The catalog gate must quarantine verified rock genre evidence"
);
assert.equal(
  conflictSandbox.hasConflict({
    style: "dark_psy",
    artist: "Furious",
    song: "Something Special",
    label: "Kali Yuga",
    metadata: { album_genres: "Dance;Trance" }
  }),
  false,
  "The catalog gate must preserve verified trance genre evidence"
);

assert.match(
  appSource,
  /source:\s*importedSource\s*\|\|\s*sourceTag/,
  "Catalog Extra imports must retain the original provenance in the runtime source"
);
assert.match(
  appSource,
  /DYNAMIC_CATALOG_CACHE_KEY\s*=\s*"neonpulse:dynamicCatalog:v21"/,
  "The unsafe v20 dynamic catalog cache must be invalidated"
);
assert.match(
  functionSource(appSource, "requiresExactBpmForDynamic"),
  /supabasecatalogextra[\s\S]*isTrustedSourceForFineStyle\(source\)[\s\S]*return false/,
  "A recording-level Catalog Extra gate must not be discarded only because BPM is unavailable"
);
for (const field of ["deezer_album_id", "album_title", "album_genres"]) {
  assert.match(
    bulkGeneratorSource,
    new RegExp(`"${field}"`),
    `Bulk catalog metadata must preserve ${field}`
  );
}
for (const songKey of ["hang_your_head", "punk_bashin_boogie", "wet", "who_to_trust"]) {
  assert.match(migrationSource, new RegExp(`'${songKey}'`), `Migration must quarantine ${songKey}`);
}

console.log("Psytrance catalog integrity regression tests passed.");
