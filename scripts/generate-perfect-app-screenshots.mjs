#!/usr/bin/env node
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { spawn } from "node:child_process";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const rootDir = path.resolve(__dirname, "..");
const chromePath = process.env.CHROME_PATH || "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome";
const nodePath = process.execPath;
const previewPort = Number(process.env.SONIC_SCREENSHOT_PREVIEW_PORT || 8797);
const chromePort = Number(process.env.SONIC_SCREENSHOT_CHROME_PORT || 9337);
const outputRoot = path.join(rootDir, "reports", "app-store-screenshots");
const runStamp = process.env.SONIC_SCREENSHOT_STAMP || "perfect-20260702";

const devices = {
  [`iphone-6.5-${runStamp}`]: {
    cssWidth: 414,
    cssHeight: 896,
    scale: 3
  },
  [`iphone-6.9-${runStamp}`]: {
    cssWidth: 440,
    cssHeight: 956,
    scale: 3
  },
  [`ipad-13-${runStamp}`]: {
    cssWidth: 1032,
    cssHeight: 1376,
    scale: 2
  }
};

const shots = [
  { name: "00-inicio-logo", type: "splash" },
  { name: "01-recomendacao-swipe", tab: "discover", autoRecommendation: true, waitMs: 6200 },
  { name: "02-djs-por-set", tab: "djs", waitMs: 2600 },
  { name: "03-filtro-manual", tab: "filters", waitMs: 2200 },
  { name: "04-noticias", tab: "news", waitMs: 5600 },
  { name: "05-comunidade", tab: "community", waitMs: 2800, fixture: "community" },
  { name: "06-perfil", tab: "profile", waitMs: 2200 },
  { name: "07-contato", tab: "support", waitMs: 2200 }
];

function wait(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function ensureChrome() {
  if (!fs.existsSync(chromePath)) {
    throw new Error(`Chrome executable not found: ${chromePath}`);
  }
}

function startPreviewServer() {
  return new Promise((resolve, reject) => {
    const child = spawn(nodePath, ["scripts/local-preview-server.mjs", `--port=${previewPort}`], {
      cwd: rootDir,
      stdio: ["ignore", "pipe", "pipe"]
    });

    let output = "";
    const onData = (chunk) => {
      output += String(chunk);
      if (output.includes("Sonic Search local preview")) resolve(child);
    };
    child.stdout.on("data", onData);
    child.stderr.on("data", onData);
    child.once("error", reject);
    child.once("exit", (code) => {
      if (!output.includes("Sonic Search local preview")) {
        reject(new Error(`Preview server exited early with code ${code ?? "unknown"}`));
      }
    });
    setTimeout(() => {
      if (!output.includes("Sonic Search local preview")) {
        reject(new Error(`Preview server did not start on port ${previewPort}`));
      }
    }, 5000);
  });
}

function startChrome() {
  const profileDir = fs.mkdtempSync(path.join(os.tmpdir(), "sonic-perfect-shot-chrome-"));
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
    `--remote-debugging-port=${chromePort}`,
    `--user-data-dir=${profileDir}`,
    "about:blank"
  ], {
    cwd: rootDir,
    stdio: ["ignore", "ignore", "pipe"]
  });

  child.once("exit", () => {
    fs.rmSync(profileDir, { recursive: true, force: true });
  });

  return { child, profileDir };
}

async function waitForChrome() {
  const endpoint = `http://127.0.0.1:${chromePort}/json/version`;
  for (let attempt = 0; attempt < 80; attempt += 1) {
    try {
      const response = await fetch(endpoint);
      if (response.ok) return;
    } catch (_error) {
      // Retry until Chrome opens the DevTools endpoint.
    }
    await wait(100);
  }
  throw new Error(`Chrome DevTools endpoint did not open on port ${chromePort}`);
}

async function createTarget(url) {
  const response = await fetch(`http://127.0.0.1:${chromePort}/json/new?${encodeURIComponent(url)}`, {
    method: "PUT"
  });
  if (!response.ok) throw new Error(`Could not create Chrome target: ${response.status}`);
  const target = await response.json();
  if (!target.webSocketDebuggerUrl) throw new Error("Chrome target did not expose a debugger websocket URL");
  return target.webSocketDebuggerUrl;
}

function createCdpClient(wsUrl) {
  const socket = new WebSocket(wsUrl);
  let nextId = 1;
  const pending = new Map();
  const eventWaiters = new Map();

  socket.addEventListener("message", (event) => {
    const message = JSON.parse(event.data);
    if (message.id && pending.has(message.id)) {
      const { resolve, reject } = pending.get(message.id);
      pending.delete(message.id);
      if (message.error) reject(new Error(message.error.message || "CDP command failed"));
      else resolve(message.result || {});
      return;
    }
    if (message.method && eventWaiters.has(message.method)) {
      const waiters = eventWaiters.get(message.method);
      eventWaiters.delete(message.method);
      waiters.forEach((resolve) => resolve(message.params || {}));
    }
  });

  const open = new Promise((resolve, reject) => {
    socket.addEventListener("open", resolve, { once: true });
    socket.addEventListener("error", reject, { once: true });
  });

  function send(method, params = {}) {
    const id = nextId;
    nextId += 1;
    return new Promise((resolve, reject) => {
      pending.set(id, { resolve, reject });
      socket.send(JSON.stringify({ id, method, params }));
    });
  }

  function waitForEvent(method, timeoutMs = 10000) {
    return new Promise((resolve, reject) => {
      const waiters = eventWaiters.get(method) || [];
      waiters.push(resolve);
      eventWaiters.set(method, waiters);
      setTimeout(() => {
        const active = eventWaiters.get(method) || [];
        const index = active.indexOf(resolve);
        if (index >= 0) active.splice(index, 1);
        if (active.length) eventWaiters.set(method, active);
        else eventWaiters.delete(method);
        reject(new Error(`Timed out waiting for ${method}`));
      }, timeoutMs).unref?.();
    });
  }

  return {
    open,
    send,
    waitForEvent,
    close: () => socket.close()
  };
}

function appUrlForShot(shot) {
  if (shot.type === "splash") {
    return `http://127.0.0.1:${previewPort}/reports/app-store-screenshots/splash-logo.html`;
  }
  const params = new URLSearchParams({
    qa: "1",
    storeScreenshot: "1",
    screenshot: "1",
    lang: "pt",
    tab: shot.tab || "discover",
    autoRecommendation: shot.autoRecommendation ? "1" : "0",
    surprise: shot.autoRecommendation ? "1" : "0",
    iosApp: "1"
  });
  if (shot.tab === "discover") {
    params.set("style", "tech_house");
    params.set("artists", "ANNA, Charlotte de Witte, Bad Tango");
  }
  return `http://127.0.0.1:${previewPort}/ios/App/App/public/index.html?${params.toString()}`;
}

function afterRenderExpression(shot) {
  const tab = shot.tab || "discover";
  const communityFixture = shot.fixture === "community";
  return `
    (() => {
      document.documentElement.classList.add("sonic-ios-app", "app-store-mode");
      document.documentElement.dataset.sonicNativeApp = "true";
      document.documentElement.dataset.sonicStoreScreenshot = "true";
      document.documentElement.dataset.sonicScreenshot = "true";
      if (${JSON.stringify(Boolean(tab))} && typeof window.setActiveAppTab === "function") {
        window.setActiveAppTab(${JSON.stringify(tab)});
      }
      if (${JSON.stringify(communityFixture)}) {
        const panel = document.querySelector("#communityPanel");
        const list = document.querySelector("#communityFeedList");
        const status = document.querySelector("#communityStatus");
        const loginPrompt = document.querySelector("#communityLoginPrompt");
        if (panel && list) {
          panel.hidden = false;
          panel.removeAttribute("aria-hidden");
          if (status) status.textContent = "";
          if (loginPrompt) loginPrompt.classList.add("hidden");
          list.innerHTML = [
            {
              tag: "Faixa",
              title: "Qual faixa abriu sua noite?",
              meta: "nightshift.dj • agora",
              body: "Use a recomendação, curta ou passe, e deixe o radar aprender o clima da pista.",
              reactions: "Curti 24   Comentários"
            },
            {
              tag: "DJs",
              title: "Selectors para ouvir por set",
              meta: "techno.nina • 12 min",
              body: "Salvei um set mais hipnótico e outro mais pesado para comparar energia.",
              reactions: "Curti 18   Comentários"
            }
          ].map((post) => (
            '<article class="community-post-card">' +
              '<div class="community-post-head"><div>' +
                '<span class="community-post-topic">' + post.tag + '</span>' +
                '<h4 class="community-post-title">' + post.title + '</h4>' +
              '</div><div class="community-post-author">' + post.meta + '</div></div>' +
              '<p class="community-post-body">' + post.body + '</p>' +
              '<div class="community-post-actions"><button class="social-comment-action" type="button">' + post.reactions + '</button></div>' +
            '</article>'
          )).join("");
        }
      }
      window.scrollTo(0, 0);
      return {
        tab: ${JSON.stringify(tab)},
        title: document.querySelector("#topSwipeTitle, h1, h2, h3")?.textContent?.trim() || "",
        width: innerWidth,
        height: innerHeight,
        dpr: devicePixelRatio
      };
    })()
  `;
}

function communityFixtureExpression() {
  return `
    (() => {
      const panel = document.querySelector("#communityPanel");
      const list = document.querySelector("#communityFeedList");
      const status = document.querySelector("#communityStatus");
      const loginPrompt = document.querySelector("#communityLoginPrompt");
      if (panel && list) {
        panel.hidden = false;
        panel.removeAttribute("aria-hidden");
        panel.classList.add("active");
        if (status) status.textContent = "";
        if (loginPrompt) loginPrompt.classList.add("hidden");
        list.innerHTML = [
          {
            tag: "Faixa",
            title: "Qual faixa abriu sua noite?",
            meta: "nightshift.dj • agora",
            body: "Use a recomendação, curta ou passe, e deixe o radar aprender o clima da pista.",
            reactions: "Curti 24   Comentários"
          },
          {
            tag: "DJs",
            title: "Selectors para ouvir por set",
            meta: "techno.nina • 12 min",
            body: "Salvei um set mais hipnótico e outro mais pesado para comparar energia.",
            reactions: "Curti 18   Comentários"
          }
        ].map((post) => (
          '<article class="community-post-card">' +
            '<div class="community-post-head"><div>' +
              '<span class="community-post-topic">' + post.tag + '</span>' +
              '<h4 class="community-post-title">' + post.title + '</h4>' +
            '</div><div class="community-post-author">' + post.meta + '</div></div>' +
            '<p class="community-post-body">' + post.body + '</p>' +
            '<div class="community-post-actions"><button class="social-comment-action" type="button">' + post.reactions + '</button></div>' +
          '</article>'
        )).join("");
      }
      window.scrollTo(0, 0);
      return { ok: Boolean(panel && list), posts: list?.children?.length || 0 };
    })()
  `;
}

function discoverPrimeExpression() {
  return `
    (() => {
      const title = document.querySelector("#topSwipeTitle")?.textContent?.trim() || "";
      const shouldClick = !title || /radar pronto/i.test(title);
      if (shouldClick) document.querySelector("#topSwipeSurpriseBtn")?.click();
      window.scrollTo(0, 0);
      return { title, clicked: shouldClick };
    })()
  `;
}

async function captureShot(deviceName, device, shot) {
  const outputDir = path.join(outputRoot, deviceName);
  const outputPath = path.join(outputDir, `${shot.name}.png`);
  fs.mkdirSync(outputDir, { recursive: true });

  if (shot.type === "splash" && !deviceName.startsWith("ipad-13")) {
    const sourceName = deviceName.startsWith("iphone-6.9")
      ? "iphone-6.9-final"
      : "iphone-6.5-final";
    const sourcePath = path.join(outputRoot, sourceName, "00-abertura-logo.png");
    if (!fs.existsSync(sourcePath)) throw new Error(`Missing splash source: ${sourcePath}`);
    fs.copyFileSync(sourcePath, outputPath);
    return outputPath;
  }

  const wsUrl = await createTarget(appUrlForShot(shot));
  const client = createCdpClient(wsUrl);
  await client.open;
  try {
    await client.send("Page.enable");
    await client.send("Runtime.enable");
    await client.send("Emulation.setDeviceMetricsOverride", {
      width: device.cssWidth,
      height: device.cssHeight,
      deviceScaleFactor: device.scale,
      mobile: true,
      screenWidth: device.cssWidth,
      screenHeight: device.cssHeight,
      positionX: 0,
      positionY: 0
    });
    await client.send("Emulation.setTouchEmulationEnabled", { enabled: true, maxTouchPoints: 5 });
    await client.send("Page.navigate", { url: appUrlForShot(shot) });
    try {
      await client.waitForEvent("Page.loadEventFired", 15000);
    } catch (_error) {
      // API-backed panels can keep work alive; the render wait below is deterministic enough.
    }
    await wait(shot.waitMs || 2400);
    await client.send("Runtime.evaluate", {
      expression: afterRenderExpression(shot),
      awaitPromise: true
    });
    await wait(900);
    if (shot.tab === "discover") {
      await client.send("Runtime.evaluate", {
        expression: discoverPrimeExpression(),
        awaitPromise: true
      });
      await wait(10000);
      await client.send("Runtime.evaluate", {
        expression: afterRenderExpression(shot),
        awaitPromise: true
      });
      await wait(600);
    }
    if (shot.fixture === "community") {
      await wait(3600);
      await client.send("Runtime.evaluate", {
        expression: communityFixtureExpression(),
        awaitPromise: true
      });
      await wait(700);
    }
    const result = await client.send("Page.captureScreenshot", {
      format: "png",
      fromSurface: true,
      captureBeyondViewport: false
    });
    fs.writeFileSync(outputPath, Buffer.from(result.data, "base64"));
  } finally {
    client.close();
  }
  return outputPath;
}

async function main() {
  ensureChrome();
  const preview = await startPreviewServer();
  const { child: chrome, profileDir } = startChrome();
  try {
    await waitForChrome();
    for (const [deviceName, device] of Object.entries(devices)) {
      for (const shot of shots) {
        const outputPath = await captureShot(deviceName, device, shot);
        console.log(path.relative(rootDir, outputPath));
      }
    }
  } finally {
    chrome.kill("SIGKILL");
    preview.kill("SIGTERM");
    fs.rmSync(profileDir, { recursive: true, force: true });
  }
}

main().catch((error) => {
  console.error(error.stack || error.message);
  process.exitCode = 1;
});
