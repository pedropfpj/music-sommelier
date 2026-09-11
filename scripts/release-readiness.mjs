#!/usr/bin/env node

import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { spawnSync } from "node:child_process";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const withIosCompile = process.argv.includes("--ios");
const withPublicSmoke = process.argv.includes("--public");
const publicUrl = String(process.env.SONIC_APPSTORE_SMOKE_BASE_URL || "https://sonicsearch.app").replace(/\/+$/, "");
const excludedTests = new Set([
  "test-preview-server.mjs",
  // This intentionally probes many third-party audio URLs and is kept as an
  // explicit deep test so provider throttling cannot create false releases.
  "test-niche-subgenre-stress.mjs"
]);

let checks = 0;

function run(label, command, args, options = {}) {
  checks += 1;
  console.log(`\n[${checks}] ${label}`);
  const result = spawnSync(command, args, {
    cwd: root,
    env: { ...process.env, ...(options.env || {}) },
    stdio: "inherit",
    timeout: options.timeout || 10 * 60 * 1000
  });
  if (result.error) throw result.error;
  if (result.status !== 0) {
    throw new Error(`${label} failed with exit code ${result.status ?? "unknown"}`);
  }
}

function runNode(label, relativePath, args = [], options = {}) {
  run(label, process.execPath, [path.join(root, relativePath), ...args], options);
}

try {
  runNode("Build optimized web assets", "scripts/build-web-assets.mjs");
  runNode("Build iPhone web bundle", "scripts/build-ios-web.mjs");
  runNode("Copy iPhone bundle", "scripts/copy-ios-native.mjs");

  const tests = fs.readdirSync(path.join(root, "scripts"))
    .filter((name) => /^test-.*\.mjs$/.test(name) && !excludedTests.has(name))
    .sort();
  for (const test of tests) runNode(test, path.join("scripts", test));

  runNode("Product and responsive screenshot verification", "scripts/product-verify.mjs", ["--screenshots", "--strict-screenshots"]);

  if (withIosCompile) {
    const derivedData = fs.mkdtempSync(path.join(os.tmpdir(), "sonic-release-xcode-"));
    try {
      run("Compile iPhone app", "xcodebuild", [
        "-quiet",
        "-project", path.join(root, "ios", "App", "App.xcodeproj"),
        "-scheme", "App",
        "-configuration", "Debug",
        "-sdk", "iphonesimulator",
        "-derivedDataPath", derivedData,
        "CODE_SIGNING_ALLOWED=NO",
        "build"
      ]);
    } finally {
      fs.rmSync(derivedData, { recursive: true, force: true });
    }
  }

  if (withPublicSmoke) {
    runNode(`Public App Store smoke (${publicUrl})`, "scripts/appstore-public-smoke.mjs", [publicUrl]);
  }

  console.log(`\nRelease readiness passed: ${checks} checks${withIosCompile ? ", iPhone compiled" : ""}${withPublicSmoke ? ", public smoke passed" : ""}.`);
} catch (error) {
  console.error(`\nRelease readiness failed: ${error.message}`);
  process.exitCode = 1;
}
