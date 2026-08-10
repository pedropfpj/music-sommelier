#!/usr/bin/env node

import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const rootDir = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const [appSource, indexSource, manifestSource] = await Promise.all([
  readFile(path.join(rootDir, "app.js"), "utf8"),
  readFile(path.join(rootDir, "index.html"), "utf8"),
  readFile(path.join(rootDir, "android", "app", "src", "main", "AndroidManifest.xml"), "utf8")
]);

const relativeApiFunction = appSource.match(/function canUseRelativeApiEndpoint\(\) \{[\s\S]*?\n\}/)?.[0] || "";
assert.match(
  relativeApiFunction,
  /isNativeAppRuntime\(\) \|\| isAppStoreRuntimeMode\(\)/,
  "Native shells must use the configured production API base instead of https://localhost/api"
);
assert.doesNotMatch(
  appSource,
  /fetch\(DISCOVERY_EXPOSURE_ENDPOINT/,
  "Android discovery exposure requests must resolve the production API endpoint"
);
assert.doesNotMatch(
  indexSource,
  /<span class="auth-provider-mark apple-mark"[^>]*>\s*\s*<\/span>/,
  "Apple sign-in must use a portable vector icon on Android"
);
assert.match(manifestSource, /android:scheme="sonicsearch"/, "Android must register the OAuth callback scheme");
assert.match(manifestSource, /android:host="auth"/, "Android OAuth callback must target the auth host");
assert.match(manifestSource, /android:pathPrefix="\/callback"/, "Android OAuth callback must target the callback path");
assert.match(manifestSource, /android:allowBackup="false"/, "Android backups must not copy WebView session data");

console.log("Android native runtime contract passed.");
