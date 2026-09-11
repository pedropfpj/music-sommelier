#!/usr/bin/env node
import fs from "node:fs";
import http from "node:http";
import os from "node:os";
import path from "node:path";
import vm from "node:vm";
import { spawn, spawnSync } from "node:child_process";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const rootDir = path.resolve(__dirname, "..");
const appPath = path.join(rootDir, "app.js");
const indexPath = path.join(rootDir, "index.html");
const styleBiblePath = path.join(rootDir, "docs/style-bible-2026-06-17.md");
const baselinePath = path.join(rootDir, "docs/product-baseline-2026-06-17.md");
const layersPath = path.join(rootDir, "docs/improvement-layers-2026-06-17.md");
const electronicRecommendationAuditPath = path.join(rootDir, "scripts", "audit-electronic-recommendations.mjs");
const reportsDir = path.join(rootDir, "reports");
const screenshotMode = process.argv.includes("--screenshots");
const strictScreenshots = process.argv.includes("--strict-screenshots");
const SCREENSHOT_TIMEOUT_MS = Math.max(
  30000,
  Number.parseInt(process.env.SONIC_SCREENSHOT_TIMEOUT_MS || "90000", 10) || 90000
);
const SCREENSHOT_VIRTUAL_TIME_BUDGET_MS = Math.max(
  1000,
  Number.parseInt(process.env.SONIC_SCREENSHOT_VIRTUAL_TIME_BUDGET_MS || "3500", 10) || 3500
);

const CRITICAL_STYLES = [
  "psycore",
  "slambient",
  "hi_tech",
  "dark_experimental",
  "dark_psy",
  "hard_techno",
  "neurofunk",
  "breakcore",
  "gabber",
  "hardcore",
  "frenchcore",
  "speedcore"
];

const REQUIRED_STYLE_COPY = [
  "psycore",
  "slambient",
  "hi_tech",
  "dark_experimental",
  "dark_psy"
];

const FORBIDDEN_TERMS = [
  "sem pressa",
  "devagar",
  "calmo",
  "calma",
  "lento",
  "lenta",
  "leve",
  "relax",
  "slow journey",
  "slow ritual",
  "slowly",
  "slow psychedelic",
  "calm",
  "soft journey",
  "paisagem tranquila",
  "respiro suave",
  "camadas que mudam sem pressa"
];

const OLD_BAD_STRINGS = [
  "Seu esp\u00edrito busca viagem, ritual e camadas que mudam sem pressa.",
  "Seu espirito busca viagem, ritual e camadas que mudam sem pressa.",
  "Your spirit looks for journey, ritual, and layers that shift slowly.",
  "Tu espiritu busca viaje, ritual y capas que cambian sin prisa.",
  "Psicodelia ritual lenta",
  "slow psychedelic presence",
  "slow waveform halos",
  "release calculado",
  "releases calculados",
  "calculated release",
  "calculated releases",
  "timed release"
];

const EXPECTED_BPM = {
  psycore: { minAtLeast: 175, maxAtLeast: 220 },
  hi_tech: { minAtLeast: 176, maxAtLeast: 220 },
  dark_experimental: { minAtLeast: 175, maxAtLeast: 200 },
  slambient: { minAtLeast: 155, maxAtLeast: 200 },
  dark_psy: { minAtLeast: 150, maxAtLeast: 170 },
  hard_techno: { minAtLeast: 145, maxAtLeast: 155 },
  neurofunk: { minAtLeast: 170, maxAtLeast: 176 }
};

const results = [];
const warnings = [];

const CHROME_PATHS = [
  "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome",
  "/Applications/Chromium.app/Contents/MacOS/Chromium",
  "/Applications/Google Chrome Canary.app/Contents/MacOS/Google Chrome Canary"
];

const MIME_BY_EXT = {
  ".html": "text/html; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".svg": "image/svg+xml",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".webp": "image/webp"
};

function readFile(filePath) {
  if (!fs.existsSync(filePath)) {
    throw new Error(`Missing file: ${path.relative(rootDir, filePath)}`);
  }
  return fs.readFileSync(filePath, "utf8");
}

function pass(name) {
  results.push({ name, ok: true });
}

function fail(name, detail) {
  results.push({ name, ok: false, detail });
}

function warn(message) {
  warnings.push(message);
}

function normalize(value = "") {
  return String(value)
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase();
}

function escapeRegExp(value = "") {
  return String(value).replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function normalizedIncludesTerm(normalizedText = "", rawTerm = "") {
  const term = normalize(rawTerm).trim();
  if (!term) return false;
  if (term.includes(" ")) return normalizedText.includes(term);
  return new RegExp(`(^|[^a-z0-9])${escapeRegExp(term)}([^a-z0-9]|$)`).test(normalizedText);
}

function lineNumberAt(source, index) {
  return source.slice(0, Math.max(0, index)).split("\n").length;
}

function scanBalanced(source, start, opener, closer) {
  let depth = 0;
  let quote = "";
  let escaped = false;
  let lineComment = false;
  let blockComment = false;

  for (let index = start; index < source.length; index += 1) {
    const char = source[index];
    const next = source[index + 1];

    if (lineComment) {
      if (char === "\n") lineComment = false;
      continue;
    }
    if (blockComment) {
      if (char === "*" && next === "/") {
        blockComment = false;
        index += 1;
      }
      continue;
    }
    if (quote) {
      if (escaped) {
        escaped = false;
      } else if (char === "\\") {
        escaped = true;
      } else if (char === quote) {
        quote = "";
      }
      continue;
    }
    if (char === "/" && next === "/") {
      lineComment = true;
      index += 1;
      continue;
    }
    if (char === "/" && next === "*") {
      blockComment = true;
      index += 1;
      continue;
    }
    if (char === "\"" || char === "'" || char === "`") {
      quote = char;
      continue;
    }
    if (char === opener) depth += 1;
    if (char === closer) depth -= 1;
    if (depth === 0) return { end: index + 1, text: source.slice(start, index + 1) };
  }

  throw new Error(`Unclosed ${opener}${closer} block`);
}

function extractFunction(source, name) {
  const marker = `function ${name}`;
  const markerIndex = source.indexOf(marker);
  if (markerIndex < 0) throw new Error(`Function not found: ${name}`);
  const signatureEnd = source.indexOf(")", markerIndex);
  if (signatureEnd < 0) throw new Error(`Function signature not found: ${name}`);
  const start = source.indexOf("{", signatureEnd);
  if (start < 0) throw new Error(`Function body not found: ${name}`);
  return scanBalanced(source, start, "{", "}").text;
}

function extractConstLiteral(source, name) {
  const marker = `const ${name} =`;
  const markerIndex = source.indexOf(marker);
  if (markerIndex < 0) throw new Error(`Const not found: ${name}`);
  const afterEquals = source.indexOf("=", markerIndex) + 1;
  const tail = source.slice(afterEquals);
  const valueMatch = tail.match(/\S/);
  if (!valueMatch) throw new Error(`Const has no value: ${name}`);
  const start = afterEquals + valueMatch.index;
  const opener = source[start];
  const closer = opener === "{" ? "}" : opener === "[" ? "]" : "";
  if (!closer) throw new Error(`Const is not an object or array literal: ${name}`);
  return scanBalanced(source, start, opener, closer).text;
}

function evalLiteral(source, name) {
  const literal = extractConstLiteral(source, name);
  return vm.runInNewContext(`(${literal})`, Object.freeze({}), {
    timeout: 1000,
    displayErrors: true
  });
}

function getConstString(source, name) {
  const regex = new RegExp(`const\\s+${name}\\s*=\\s*([\"'])(.*?)\\1;`);
  const match = source.match(regex);
  return match ? match[2] : "";
}

function runNodeCheck() {
  const result = spawnSync(process.execPath, ["--check", appPath], {
    cwd: rootDir,
    encoding: "utf8"
  });
  if (result.status === 0) {
    pass("app.js syntax");
    return;
  }
  fail("app.js syntax", (result.stderr || result.stdout || "").trim() || "node --check failed");
}

function runElectronicRecommendationAudit() {
  const result = spawnSync(process.execPath, [electronicRecommendationAuditPath], {
    cwd: rootDir,
    encoding: "utf8"
  });
  if (result.status === 0) {
    pass("electronic-only recommendation gate");
    return;
  }
  fail(
    "electronic-only recommendation gate",
    String(result.stderr || result.stdout || "Electronic recommendation audit failed.").trim()
  );
}

function verifyDocs() {
  const missing = [styleBiblePath, baselinePath, layersPath]
    .filter((filePath) => !fs.existsSync(filePath))
    .map((filePath) => path.relative(rootDir, filePath));
  if (missing.length) {
    fail("verification docs present", `Missing: ${missing.join(", ")}`);
    return;
  }
  const layers = readFile(layersPath);
  if (!layers.includes("docs/style-bible-2026-06-17.md")) {
    fail("style bible linked from layers plan", "improvement layers doc does not reference the style bible");
    return;
  }
  pass("verification docs present");
  pass("style bible linked from layers plan");
}

function verifyOldBadStringsAbsent(appSource) {
  const hits = OLD_BAD_STRINGS
    .map((needle) => ({ needle, index: appSource.indexOf(needle) }))
    .filter((item) => item.index >= 0)
    .map((item) => `${item.needle} @ app.js:${lineNumberAt(appSource, item.index)}`);
  if (hits.length) {
    fail("old bad copy absent", hits.join("\n"));
    return;
  }
  pass("old bad copy absent");
}

function verifyFunctionCopy(source, functionName) {
  const body = extractFunction(source, functionName);
  const normalized = normalize(body);
  const missing = REQUIRED_STYLE_COPY.filter((style) => !body.includes(`${style}:`));
  const forbidden = FORBIDDEN_TERMS.filter((term) => normalizedIncludesTerm(normalized, term));

  if (missing.length || forbidden.length) {
    fail(`${functionName} style-specific copy`, [
      missing.length ? `Missing style keys: ${missing.join(", ")}` : "",
      forbidden.length ? `Forbidden terms: ${forbidden.join(", ")}` : ""
    ].filter(Boolean).join("\n"));
    return;
  }

  pass(`${functionName} style-specific copy`);
}

function verifyStyleFirstFallback(source) {
  const checks = [
    {
      name: "spiritMascotQuote",
      body: extractFunction(source, "spiritMascotQuote"),
      pattern: /languageCopies\[profile\.dominantStyleKey \|\| ""\].*languageCopies\[family\]/s
    },
    {
      name: "spiritCollectibleMicroQuote",
      body: extractFunction(source, "spiritCollectibleMicroQuote"),
      pattern: /languageCopy\[profile\.dominantStyleKey \|\| ""\].*languageCopy\[family\]/s
    },
    {
      name: "spiritPersonalityText",
      body: extractFunction(source, "spiritPersonalityText"),
      pattern: /languageCopy\[profile\.dominantStyleKey \|\| ""\].*languageCopy\[family\]/s
    },
    {
      name: "spiritStyleAppealText",
      body: extractFunction(source, "spiritStyleAppealText"),
      pattern: /languageStyleCopy\[styleKey\].*languageFamilyCopy\[family\]/s
    }
  ];
  const failed = checks.filter((check) => !check.pattern.test(check.body)).map((check) => check.name);
  if (failed.length) {
    fail("style-specific copy before family fallback", `Failed helpers: ${failed.join(", ")}`);
    return;
  }
  pass("style-specific copy before family fallback");
}

function verifyCriticalStyleLines(source) {
  const lines = source.split("\n");
  const hits = [];
  lines.forEach((line, index) => {
    const normalizedLine = normalize(line);
    const mentionsCritical = CRITICAL_STYLES.some((style) => normalizedLine.includes(style));
    if (!mentionsCritical) return;
    const forbidden = FORBIDDEN_TERMS.filter((term) => normalizedIncludesTerm(normalizedLine, term));
    if (forbidden.length) {
      hits.push(`app.js:${index + 1} ${forbidden.join(", ")} :: ${line.trim()}`);
    }
  });

  if (hits.length) {
    fail("critical style lines avoid banned copy", hits.join("\n"));
    return;
  }
  pass("critical style lines avoid banned copy");
}

function verifySpiritObjects(source) {
  const literal = extractConstLiteral(source, "MUSICAL_SPIRITS");
  const criticalSpiritIds = ["cirurgiao_psycore", "oraculo_nevoa", "feiticeiro_darkpsy", "alquimista_sombrio"];
  const hits = [];

  for (const id of criticalSpiritIds) {
    const idIndex = literal.indexOf(`id: "${id}"`);
    if (idIndex < 0) {
      hits.push(`Missing critical spirit: ${id}`);
      continue;
    }
    const nextObjectIndex = literal.indexOf("\n  {\n", idIndex + 1);
    const chunk = literal.slice(idIndex, nextObjectIndex > 0 ? nextObjectIndex : undefined);
    const normalizedChunk = normalize(chunk);
    const forbidden = FORBIDDEN_TERMS.filter((term) => normalizedIncludesTerm(normalizedChunk, term));
    if (forbidden.length) hits.push(`${id}: ${forbidden.join(", ")}`);
  }

  if (hits.length) {
    fail("critical spirit copy avoids banned terms", hits.join("\n"));
    return;
  }
  pass("critical spirit copy avoids banned terms");
}

function verifyHumanDirections(source) {
  const literal = extractConstLiteral(source, "SPIRIT_HUMAN_ENTITY_DIRECTIONS");
  const criticalDirectionIds = ["cirurgiao_psycore", "oraculo_nevoa", "feiticeiro_darkpsy"];
  const hits = [];
  for (const id of criticalDirectionIds) {
    const idIndex = literal.indexOf(`${id}:`);
    if (idIndex < 0) {
      hits.push(`Missing critical visual direction: ${id}`);
      continue;
    }
    const nextEntry = literal.slice(idIndex + id.length + 1).search(/\n  [a-z0-9_]+: \{/);
    const chunk = literal.slice(idIndex, nextEntry >= 0 ? idIndex + id.length + 1 + nextEntry : undefined);
    const normalizedChunk = normalize(chunk);
    const forbidden = FORBIDDEN_TERMS.filter((term) => normalizedIncludesTerm(normalizedChunk, term));
    if (forbidden.length) hits.push(`${id}: ${forbidden.join(", ")}`);
  }

  if (hits.length) {
    fail("critical visual directions avoid banned terms", hits.join("\n"));
    return;
  }
  pass("critical visual directions avoid banned terms");
}

function verifyBpmRules(source) {
  let rules = {};
  try {
    rules = evalLiteral(source, "STYLE_BPM_RULES");
  } catch (error) {
    fail("STYLE_BPM_RULES parse", error.message);
    return;
  }

  const hits = [];
  for (const [style, expected] of Object.entries(EXPECTED_BPM)) {
    const rule = rules[style];
    if (!rule) {
      hits.push(`${style}: missing BPM rule`);
      continue;
    }
    if (Number(rule.min) < expected.minAtLeast || Number(rule.max) < expected.maxAtLeast) {
      hits.push(`${style}: expected min>=${expected.minAtLeast}, max>=${expected.maxAtLeast}; got ${rule.min}-${rule.max}`);
    }
  }

  if (hits.length) {
    fail("critical BPM rules", hits.join("\n"));
    return;
  }
  pass("critical BPM rules");
}

function verifyCacheAndScriptVersion(appSource, indexSource) {
  const storageKey = getConstString(appSource, "SPIRIT_COLLECTIBLE_STORAGE_KEY");
  const localVersion = getConstString(appSource, "SPIRIT_LOCAL_COLLECTIBLE_VERSION");
  const scriptVersionMatch = indexSource.match(/app(?:\.min)?\.js\?v=([^"']+)/);
  const hits = [];

  if (!storageKey || !/spiritCollectible:v\d+/.test(storageKey)) {
    hits.push("SPIRIT_COLLECTIBLE_STORAGE_KEY is missing a versioned key");
  }
  if (storageKey.includes(":v36")) {
    hits.push("SPIRIT_COLLECTIBLE_STORAGE_KEY still uses v36, which can reuse bad cards");
  }
  if (!localVersion || !localVersion.includes("copy")) {
    hits.push("SPIRIT_LOCAL_COLLECTIBLE_VERSION should mark the copy-sensitive card generation");
  }
  if (!scriptVersionMatch) {
    hits.push("index.html script tag must cache-bust app.js or app.min.js with ?v=");
  } else if (scriptVersionMatch[1] === "20260616share1") {
    hits.push("index.html still references the old app.js cache token");
  }

  if (hits.length) {
    fail("cache busting for card/copy fixes", hits.join("\n"));
    return;
  }
  pass("cache busting for card/copy fixes");
}

function verifyLegalNotices(indexSource, appSource) {
  const normalizedIndex = normalize(indexSource);
  const normalizedApp = normalize(appSource);
  const requiredIndexTerms = [
    "https://sonicsearch.app/",
    "legalhub",
    "direitos autorais",
    "pedro freire",
    "cbk labs",
    "todos os direitos reservados",
    "conteudo musical e terceiros",
    "spotify",
    "youtube",
    "deezer",
    "soundcloud",
    "nao substitui contrato"
  ];
  const requiredAppKeys = [
    "legalhubtitle",
    "legalcopyrighttext",
    "legalthirdpartytext",
    "legaldisclaimer"
  ];
  const missingIndex = requiredIndexTerms.filter((term) => !normalizedIndex.includes(term));
  const missingApp = requiredAppKeys.filter((term) => !normalizedApp.includes(term));

  if (missingIndex.length || missingApp.length) {
    fail("legal notices and official domain", [
      missingIndex.length ? `Missing index terms: ${missingIndex.join(", ")}` : "",
      missingApp.length ? `Missing app translation keys: ${missingApp.join(", ")}` : ""
    ].filter(Boolean).join("\n"));
    return;
  }

  pass("legal notices and official domain");
}

function verifyStyleBible(styleBibleSource) {
  const normalized = normalize(styleBibleSource);
  const missingStyles = REQUIRED_STYLE_COPY.filter((style) => !styleBibleSource.includes(`\`${style}\``));
  const missingNoGo = FORBIDDEN_TERMS
    .filter((term) => ["sem pressa", "devagar", "calmo", "slow ritual", "camadas que mudam sem pressa"].includes(term))
    .filter((term) => !normalizedIncludesTerm(normalized, term));

  if (missingStyles.length || missingNoGo.length) {
    fail("style bible covers critical copy rules", [
      missingStyles.length ? `Missing styles: ${missingStyles.join(", ")}` : "",
      missingNoGo.length ? `Missing no-go terms: ${missingNoGo.join(", ")}` : ""
    ].filter(Boolean).join("\n"));
    return;
  }
  pass("style bible covers critical copy rules");
}

function findChromeExecutable() {
  return CHROME_PATHS.find((candidate) => fs.existsSync(candidate)) || "";
}

function serveStaticFile(req, res) {
  try {
    const requestUrl = new URL(req.url || "/", "http://127.0.0.1");
    const rawPath = decodeURIComponent(requestUrl.pathname === "/" ? "/index.html" : requestUrl.pathname);
    const relativePath = rawPath.replace(/^\/+/, "");
    const filePath = path.resolve(rootDir, relativePath);
    if (!filePath.startsWith(rootDir)) {
      res.writeHead(403);
      res.end("Forbidden");
      return;
    }
    if (!fs.existsSync(filePath) || fs.statSync(filePath).isDirectory()) {
      res.writeHead(404);
      res.end("Not found");
      return;
    }
    res.writeHead(200, {
      "Content-Type": MIME_BY_EXT[path.extname(filePath).toLowerCase()] || "application/octet-stream",
      "Cache-Control": "no-store"
    });
    fs.createReadStream(filePath).pipe(res);
  } catch (error) {
    res.writeHead(500);
    res.end(error.message);
  }
}

function startStaticServer() {
  return new Promise((resolve, reject) => {
    const server = http.createServer(serveStaticFile);
    server.once("error", reject);
    server.listen(0, "127.0.0.1", () => {
      const address = server.address();
      if (!address || typeof address === "string") {
        server.close();
        reject(new Error("Could not start local screenshot server"));
        return;
      }
      const params = new URLSearchParams({
        verify: String(Date.now()),
        qa: "1",
        autoRecommendation: "0",
        screenshot: "1",
        lang: "en"
      });
      resolve({ server, url: `http://127.0.0.1:${address.port}/index.html?${params.toString()}` });
    });
  });
}

function stopChromeProcess(child) {
  try {
    if (child.pid) process.kill(-child.pid, "SIGKILL");
    return;
  } catch (_error) {
    // Fall through to direct child kill; process groups can fail on some macOS launches.
  }
  try {
    child.kill("SIGKILL");
  } catch (_killError) {
    // Ignore kill failures; the process may already be gone.
  }
}

function wait(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function createCdpClient(wsUrl) {
  const socket = new WebSocket(wsUrl);
  const pending = new Map();
  const eventWaiters = new Map();
  let nextId = 1;

  socket.addEventListener("message", (event) => {
    const message = JSON.parse(event.data);
    if (message.id && pending.has(message.id)) {
      const { resolve, reject } = pending.get(message.id);
      pending.delete(message.id);
      if (message.error) reject(new Error(message.error.message || "Chrome DevTools command failed"));
      else resolve(message.result || {});
      return;
    }
    if (!message.method || !eventWaiters.has(message.method)) return;
    const waiters = eventWaiters.get(message.method);
    eventWaiters.delete(message.method);
    waiters.forEach((resolve) => resolve(message.params || {}));
  });

  const open = new Promise((resolve, reject) => {
    socket.addEventListener("open", resolve, { once: true });
    socket.addEventListener("error", reject, { once: true });
  });

  return {
    open,
    send(method, params = {}) {
      const id = nextId;
      nextId += 1;
      return new Promise((resolve, reject) => {
        pending.set(id, { resolve, reject });
        socket.send(JSON.stringify({ id, method, params }));
      });
    },
    waitForEvent(method, timeoutMs = 12000) {
      return new Promise((resolve, reject) => {
        const waiters = eventWaiters.get(method) || [];
        waiters.push(resolve);
        eventWaiters.set(method, waiters);
        const timer = setTimeout(() => {
          const active = eventWaiters.get(method) || [];
          const index = active.indexOf(resolve);
          if (index >= 0) active.splice(index, 1);
          if (active.length) eventWaiters.set(method, active);
          else eventWaiters.delete(method);
          reject(new Error(`Timed out waiting for ${method}`));
        }, timeoutMs);
        timer.unref?.();
      });
    },
    close() {
      socket.close();
    }
  };
}

async function captureChromeScreenshot(chromePath, url, outputPath, width, height) {
  const profileDir = fs.mkdtempSync(path.join(os.tmpdir(), "sonic-product-verify-"));
  fs.rmSync(outputPath, { force: true });
  const child = spawn(chromePath, [
    "--headless=new",
    "--disable-gpu",
    "--no-sandbox",
    "--hide-scrollbars",
    "--disable-background-networking",
    "--disable-breakpad",
    "--disable-component-update",
    "--disable-crash-reporter",
    "--disable-default-apps",
    "--disable-dev-shm-usage",
    "--disable-extensions",
    "--disable-sync",
    "--no-first-run",
    "--no-default-browser-check",
    "--run-all-compositor-stages-before-draw",
    "--disable-features=Translate,OptimizationHints,MediaRouter",
    "--remote-debugging-port=0",
    `--user-data-dir=${profileDir}`,
    "about:blank"
  ], {
    cwd: rootDir,
    detached: true,
    stdio: ["ignore", "ignore", "pipe"]
  });
  let stderr = "";
  child.stderr.on("data", (chunk) => {
    stderr = `${stderr}${chunk}`.slice(-6000);
  });

  let client;
  try {
    const activePortPath = path.join(profileDir, "DevToolsActivePort");
    const deadline = Date.now() + SCREENSHOT_TIMEOUT_MS;
    while (!fs.existsSync(activePortPath) && Date.now() < deadline) await wait(100);
    if (!fs.existsSync(activePortPath)) {
      throw new Error(`Chrome DevTools did not start: ${stderr || "timeout"}`);
    }
    const [port] = fs.readFileSync(activePortPath, "utf8").trim().split("\n");
    const targetResponse = await fetch(`http://127.0.0.1:${port}/json/new?${encodeURIComponent("about:blank")}`, {
      method: "PUT"
    });
    if (!targetResponse.ok) throw new Error(`Could not create Chrome target: ${targetResponse.status}`);
    const target = await targetResponse.json();
    if (!target.webSocketDebuggerUrl) throw new Error("Chrome target did not expose a debugger websocket URL");

    client = createCdpClient(target.webSocketDebuggerUrl);
    await client.open;
    await client.send("Page.enable");
    await client.send("Runtime.enable");
    await client.send("Emulation.setDeviceMetricsOverride", {
      width,
      height,
      deviceScaleFactor: 1,
      mobile: width <= 780,
      screenWidth: width,
      screenHeight: height,
      positionX: 0,
      positionY: 0
    });
    if (width <= 780) {
      await client.send("Emulation.setTouchEmulationEnabled", { enabled: true, maxTouchPoints: 5 });
    }
    const loaded = client.waitForEvent("Page.loadEventFired").catch(() => null);
    await client.send("Page.navigate", { url });
    await loaded;
    await wait(SCREENSHOT_VIRTUAL_TIME_BUDGET_MS);

    const metrics = await client.send("Runtime.evaluate", {
      expression: `(() => {
        const card = document.querySelector('.taste-calibration-screen:not(.hidden) .taste-calibration-card');
        const rect = card?.getBoundingClientRect();
        return {
          innerWidth,
          scrollWidth: document.documentElement.scrollWidth,
          card: rect ? { left: rect.left, right: rect.right, width: rect.width } : null
        };
      })()`,
      returnByValue: true
    });
    const layout = metrics.result?.value || {};
    if (layout.innerWidth !== width || layout.scrollWidth > width + 1) {
      throw new Error(`Viewport overflow at ${width}px: ${JSON.stringify(layout)}`);
    }
    if (layout.card && (layout.card.left < -1 || layout.card.right > width + 1)) {
      throw new Error(`Sonic Start card is clipped at ${width}px: ${JSON.stringify(layout.card)}`);
    }

    const result = await client.send("Page.captureScreenshot", {
      format: "png",
      fromSurface: true,
      captureBeyondViewport: false
    });
    fs.writeFileSync(outputPath, Buffer.from(result.data, "base64"));
  } finally {
    client?.close();
    stopChromeProcess(child);
    fs.rmSync(profileDir, { recursive: true, force: true });
  }
}

async function captureUiScreenshots() {
  const chromePath = findChromeExecutable();
  if (!chromePath) {
    const message = "Chrome/Chromium executable not found for screenshot capture";
    if (strictScreenshots) fail("UI screenshots", message);
    else warn(message);
    return;
  }
  fs.mkdirSync(reportsDir, { recursive: true });
  const { server, url } = await startStaticServer();
  try {
    const sonicStartUrl = new URL(url);
    sonicStartUrl.searchParams.set("tasteCalibrationQa", "1");
    await captureChromeScreenshot(chromePath, url, path.join(reportsDir, "ui-desktop-latest.png"), 1440, 960);
    await captureChromeScreenshot(chromePath, url, path.join(reportsDir, "ui-mobile-latest.png"), 393, 852);
    await captureChromeScreenshot(chromePath, url, path.join(reportsDir, "ui-mobile-375-latest.png"), 375, 812);
    await captureChromeScreenshot(chromePath, url, path.join(reportsDir, "ui-landscape-latest.png"), 852, 393);
    await captureChromeScreenshot(chromePath, sonicStartUrl.toString(), path.join(reportsDir, "ui-sonic-start-latest.png"), 393, 852);
    pass("UI screenshots captured for desktop, iPhone, small phone, landscape, and Sonic Start");
  } catch (error) {
    const message = `UI screenshots unavailable: ${error.message}`;
    if (strictScreenshots) fail("UI screenshots", message);
    else warn(message);
  } finally {
    await new Promise((resolve) => server.close(resolve));
  }
}

async function verifyUiScreenshotReminder() {
  if (screenshotMode) {
    await captureUiScreenshots();
    return;
  }
  const result = spawnSync("git", ["diff", "--name-only", "--", "index.html", "styles.css"], {
    cwd: rootDir,
    encoding: "utf8"
  });
  if (result.status !== 0) return;
  const changed = result.stdout.split("\n").map((item) => item.trim()).filter(Boolean);
  if (changed.length) {
    warn(`UI files changed (${changed.join(", ")}). Run node scripts/product-verify.mjs --screenshots before publishing.`);
  }
}

async function main() {
  let appSource = "";
  let indexSource = "";
  let styleBibleSource = "";

  try {
    appSource = readFile(appPath);
    indexSource = readFile(indexPath);
    styleBibleSource = readFile(styleBiblePath);
  } catch (error) {
    fail("required files readable", error.message);
    printAndExit();
    return;
  }

  pass("required files readable");
  runNodeCheck();
  runElectronicRecommendationAudit();
  verifyDocs();
  verifyStyleBible(styleBibleSource);
  verifyOldBadStringsAbsent(appSource);
  verifyFunctionCopy(appSource, "spiritMascotQuote");
  verifyFunctionCopy(appSource, "spiritCollectibleMicroQuote");
  verifyFunctionCopy(appSource, "spiritPersonalityText");
  verifyStyleFirstFallback(appSource);
  verifyCriticalStyleLines(appSource);
  verifySpiritObjects(appSource);
  verifyHumanDirections(appSource);
  verifyBpmRules(appSource);
  verifyCacheAndScriptVersion(appSource, indexSource);
  verifyLegalNotices(indexSource, appSource);
  await verifyUiScreenshotReminder();
  printAndExit();
}

function printAndExit() {
  const failed = results.filter((result) => !result.ok);
  for (const result of results) {
    const prefix = result.ok ? "PASS" : "FAIL";
    console.log(`${prefix} ${result.name}`);
    if (!result.ok && result.detail) {
      console.log(result.detail.split("\n").map((line) => `  ${line}`).join("\n"));
    }
  }
  for (const message of warnings) {
    console.log(`WARN ${message}`);
  }

  if (failed.length) {
    console.error(`\nProduct verification failed: ${failed.length} check(s).`);
    process.exit(1);
  }
  console.log("\nProduct verification passed.");
}

main().catch((error) => {
  fail("product verification runtime", error.stack || error.message);
  printAndExit();
});
