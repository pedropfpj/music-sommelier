#!/usr/bin/env node

import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const [html, app, css] = await Promise.all([
  readFile(path.join(root, "index.html"), "utf8"),
  readFile(path.join(root, "app.js"), "utf8"),
  readFile(path.join(root, "styles.css"), "utf8")
]);

assert.match(html, /id="networkStatusBanner"[^>]+role="status"[^>]+aria-live="polite"[^>]+aria-atomic="true"/);
assert.match(html, /id="networkStatusTitle"/);
assert.match(html, /id="networkStatusText"/);
assert.match(app, /navigator\.onLine !== false/);
assert.match(app, /window\.addEventListener\("offline", \(\) => renderNetworkStatus\(\)\)/);
assert.match(app, /window\.addEventListener\("online", \(\) => renderNetworkStatus\(\{ recovered: true \}\)\)/);
assert.match(app, /Curtidas e seu perfil continuam salvos neste aparelho/);
assert.match(app, /setupNetworkStatusAwareness\(\)/);
assert.match(css, /\.network-status-banner\s*\{[\s\S]{0,700}pointer-events:\s*none/);
assert.match(css, /bottom:\s*calc\(env\(safe-area-inset-bottom/);
assert.match(css, /@media \(prefers-reduced-motion: no-preference\)[\s\S]{0,200}network-status-enter/);
assert.match(css, /orientation:\s*landscape[\s\S]{0,900}grid-template-columns:\s*minmax\(130px, 1\.15fr\) repeat\(5/);

console.log("Network resilience UI checks passed.");
