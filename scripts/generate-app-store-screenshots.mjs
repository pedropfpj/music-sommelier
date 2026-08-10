#!/usr/bin/env node
import fs from "node:fs";
import http from "node:http";
import os from "node:os";
import path from "node:path";
import { spawn } from "node:child_process";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const rootDir = path.resolve(__dirname, "..");
const chromePath = process.env.CHROME_PATH || "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome";
const nodePath = process.execPath;
const previewPort = Number(process.env.SONIC_SCREENSHOT_PREVIEW_PORT || 8796);
const chromePort = Number(process.env.SONIC_SCREENSHOT_CHROME_PORT || 9336);
const outputRoot = path.join(rootDir, "reports", "app-store-screenshots");
const screenshotLanguage = String(process.env.SONIC_SCREENSHOT_LANG || "pt").trim().toLowerCase() === "en" ? "en" : "pt";
const screenshotSet = process.env.SONIC_SCREENSHOT_SET || `v103-${screenshotLanguage}-20260721`;
const deviceFilter = String(process.env.SONIC_SCREENSHOT_DEVICE_FILTER || "").trim();
const shotFilter = String(process.env.SONIC_SCREENSHOT_SHOT_FILTER || "").trim();
const shotFilterTerms = shotFilter.split(",").map((item) => item.trim()).filter(Boolean);

const devices = {
  [`iphone-6.5-${screenshotSet}`]: {
    cssWidth: 414,
    cssHeight: 896,
    scale: 3
  },
  [`iphone-6.9-${screenshotSet}`]: {
    cssWidth: 440,
    cssHeight: 956,
    scale: 3
  },
  [`ipad-13-${screenshotSet}`]: {
    cssWidth: 1032,
    cssHeight: 1376,
    scale: 2
  }
};

const shots = [
  ["01-descobrir", "discover"],
  ["02-noticias", "news"],
  ["03-perfil", "profile"],
  ["04-comunidade", "community"],
  ["05-djs", "djs"]
];

const newsScreenshotItems = screenshotLanguage === "en"
  ? [
      {
        source: "EDM.com",
        market: "GLOBAL",
        title: "Explore the latest electronic music news",
        summary: "Releases, festivals, technology, and stories from electronic music culture."
      },
      {
        source: "MIXMAG",
        market: "GLOBAL",
        title: "Follow club culture around the world",
        summary: "Artists, scenes, dancefloors, and new sounds from trusted sources."
      },
      {
        source: "DANCING ASTRONAUT",
        market: "GLOBAL",
        title: "Discover releases and artist stories",
        summary: "A quick route to fresh music news and the original articles."
      }
    ]
  : [
      {
        source: "ALATAJ",
        market: "BRASIL",
        title: "Acompanhe as últimas notícias do Alataj",
        summary: "Música eletrônica, clubes, artistas, lançamentos e cultura de pista."
      },
      {
        source: "HOUSE MAG",
        market: "BRASIL",
        title: "Descubra novidades da House Mag",
        summary: "DJs, festas, festivais e movimentos da cena eletrônica brasileira."
      },
      {
        source: "MIXMAG BRASIL",
        market: "BRASIL",
        title: "Explore notícias da Mixmag Brasil",
        summary: "Entrevistas, lançamentos e histórias da música eletrônica em um só radar."
      }
    ];

const communityScreenshotPosts = screenshotLanguage === "en"
  ? [
      {
        topic: "Tracks",
        title: "Which track opens the set best?",
        meta: "Hypnotic techno - 132 BPM",
        author: "Pedro - now",
        body: "Testing an opener with a steady groove, rounded bass, and a short synth line to warm up the floor."
      },
      {
        topic: "Events",
        title: "This weekend's lineup",
        meta: "Brazil - clubs and festivals",
        author: "Sonic Search - 12 min",
        body: "Organize ideas by energy, time, and style before saving your next discoveries."
      },
      {
        topic: "Questions",
        title: "Track ID?",
        meta: "Collaborative community",
        author: "Guest DJ - 24 min",
        body: "Share a reference from the dance floor and follow community replies in one place."
      }
    ]
  : [
      {
        topic: "Faixas",
        title: "Que faixa abre melhor o set?",
        meta: "Techno hipnótico - 132 BPM",
        author: "Pedro - agora",
        body: "Testando uma entrada com groove firme, baixo redondo e synth curto para aquecer a pista."
      },
      {
        topic: "Festas",
        title: "Line-up do fim de semana",
        meta: "Brasil - clubs e festivais",
        author: "Sonic Search - 12 min",
        body: "Separe ideias por energia, horário e estilo antes de salvar seus próximos achados."
      },
      {
        topic: "Perguntas",
        title: "ID da faixa?",
        meta: "Comunidade colaborativa",
        author: "DJ convidado - 24 min",
        body: "Publique uma referência da pista e acompanhe as respostas da comunidade em um só lugar."
      }
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
      env: {
        ...process.env,
        SONIC_PREVIEW_STATIC_ROOT: "ios/App/App/public"
      },
      stdio: ["ignore", "pipe", "pipe"]
    });

    let output = "";
    const onData = (chunk) => {
      output += String(chunk);
      if (output.includes("Sonic Search local preview")) {
        resolve(child);
      }
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
  const profileDir = fs.mkdtempSync(path.join(os.tmpdir(), "sonic-store-shot-chrome-"));
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

  return { child, profileDir };
}

function communityScreenshotStatements() {
  return `
    const status = document.getElementById("communityStatus");
    const list = document.getElementById("communityFeedList");
    const composerCard = document.querySelector(".community-composer-card");
    const posts = ${JSON.stringify(communityScreenshotPosts)};
    if (composerCard) composerCard.hidden = true;
    if (status) {
      status.textContent = ${JSON.stringify(screenshotLanguage === "en" ? "3 active conversations from the scene." : "3 conversas ativas na pista.")};
      status.classList.remove("error");
      status.classList.add("ok");
    }
    if (list) {
      list.innerHTML = "";
      posts.forEach((post) => {
        const card = document.createElement("article");
        card.className = "community-post-card";
        const head = document.createElement("div");
        head.className = "community-post-head";
        const main = document.createElement("div");
        const topic = document.createElement("span");
        topic.className = "community-post-topic";
        topic.textContent = post.topic;
        const title = document.createElement("h4");
        title.className = "community-post-title";
        title.textContent = post.title;
        const meta = document.createElement("div");
        meta.className = "community-post-meta";
        meta.textContent = post.meta;
        const author = document.createElement("div");
        author.className = "community-post-author";
        author.textContent = post.author;
        const body = document.createElement("p");
        body.className = "community-post-body";
        body.textContent = post.body;
        main.append(topic, title, meta);
        head.append(main, author);
        card.append(head, body);
        list.appendChild(card);
      });
    }
  `;
}

function newsScreenshotStatements() {
  return `
    const status = document.getElementById("dailyNewsStatus");
    const progress = document.getElementById("dailyNewsProgress");
    const list = document.getElementById("dailyNewsList");
    const items = ${JSON.stringify(newsScreenshotItems)};
    if (status) {
      status.textContent = ${JSON.stringify(screenshotLanguage === "en" ? "Updated now · verified sources" : "Atualizado agora · fontes verificadas")};
      status.classList.remove("is-loading");
    }
    if (progress) progress.hidden = true;
    if (list) {
      list.innerHTML = "";
      items.forEach((item) => {
        const card = document.createElement("article");
        card.className = "daily-news-card";
        const meta = document.createElement("p");
        meta.className = "daily-news-meta";
        const source = document.createElement("span");
        source.className = "daily-news-source-link";
        source.textContent = item.source;
        const date = document.createElement("span");
        date.textContent = ${JSON.stringify(screenshotLanguage === "en" ? " · TODAY" : " · HOJE")};
        const market = document.createElement("span");
        market.className = "daily-news-market " + (item.market === "BRASIL" ? "br" : "global");
        market.textContent = item.market;
        meta.append(source, date, market);
        const title = document.createElement("div");
        title.className = "daily-news-link";
        title.textContent = item.title;
        const summary = document.createElement("p");
        summary.className = "daily-news-summary muted";
        summary.textContent = item.summary;
        card.append(meta, title, summary);
        list.appendChild(card);
      });
    }
  `;
}

async function waitForChrome() {
  const endpoint = `http://127.0.0.1:${chromePort}/json/version`;
  for (let attempt = 0; attempt < 300; attempt += 1) {
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
  if (!response.ok) {
    throw new Error(`Could not create Chrome target: ${response.status}`);
  }
  const target = await response.json();
  if (!target.webSocketDebuggerUrl) {
    throw new Error("Chrome target did not expose a debugger websocket URL");
  }
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
    const payload = JSON.stringify({ id, method, params });
    return new Promise((resolve, reject) => {
      pending.set(id, { resolve, reject });
      socket.send(payload);
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

async function captureShot(deviceName, device, name, tab) {
  const params = new URLSearchParams({
    qa: "1",
    storeScreenshot: "1",
    screenshot: "1",
    lang: screenshotLanguage,
    tab,
    autoRecommendation: tab === "discover" ? "1" : "0",
    surprise: tab === "discover" ? "1" : "0",
    iosApp: "1"
  });
  if (tab === "discover") {
    params.set("style", "tech_house");
    params.set("artists", "ANNA, Charlotte de Witte, Bad Tango");
  }
  const url = `http://127.0.0.1:${previewPort}/index.html?${params.toString()}`;
  const outputDir = path.join(outputRoot, deviceName);
  const outputPath = path.join(outputDir, `${name}.png`);
  fs.mkdirSync(outputDir, { recursive: true });

  const wsUrl = await createTarget(url);
  const client = createCdpClient(wsUrl);
  await client.open;
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
  await client.send("Page.navigate", { url });
  try {
    await client.waitForEvent("Page.loadEventFired", 15000);
  } catch (_error) {
    // Some API-backed panels keep network work alive; a fixed render wait follows.
  }
  await wait(
    tab === "discover"
      ? 8000
      : tab === "news" || tab === "community"
        ? 5200
        : 2400
  );
  if (tab === "discover") {
    await client.send("Runtime.evaluate", {
      expression: `
        (() => {
          const title = document.getElementById("topSwipeTitle")?.textContent?.trim() || "";
          const emptyTitles = new Set([
            "Preparando sua primeira faixa",
            "Preparing your first track",
            "Preparando tu primera pista"
          ]);
          if (!emptyTitles.has(title)) return { title, fallback: false };
          const prefs = { style: "tech_house", context: "", energy: "", bpm: "", vocals: "" };
          const track = catalogTracksForStyle("tech_house").find((item) =>
            item?.artist && item?.song && trackHasPlayablePreviewExperience(item)
          ) || catalogTracksForStyle("tech_house").find((item) => item?.artist && item?.song);
          if (!track) return { title, fallback: false, missingTrack: true };
          currentRecommendation = track;
          currentDiscovery = null;
          lastPrefs = prefs;
          updateSwipeFeedbackCard(track, prefs);
          renderTrackInsightPanel(track, prefs);
          if (resultPanel) resultPanel.classList.remove("hidden");
          if (previewPanel) previewPanel.classList.remove("hidden");
          return { title: track.song, artist: track.artist, fallback: true };
        })()
      `,
      awaitPromise: true
    });
    await wait(1100);
  }
  await client.send("Runtime.evaluate", {
    expression: `
      (() => {
        document.documentElement.classList.add("sonic-ios-app", "app-store-mode");
        document.documentElement.dataset.sonicNativeApp = "true";
        if (typeof window.setActiveAppTab === "function") window.setActiveAppTab(${JSON.stringify(tab)});
        if (${JSON.stringify(tab)} === "community") {
          ${communityScreenshotStatements()}
        }
        if (${JSON.stringify(tab)} === "news") {
          ${newsScreenshotStatements()}
        }
        window.scrollTo(0, 0);
        return { tab: ${JSON.stringify(tab)}, width: innerWidth, height: innerHeight, dpr: devicePixelRatio };
      })()
    `,
    awaitPromise: true
  });
  await wait(700);
  if (tab === "community") {
    await client.send("Runtime.evaluate", {
      expression: `
        (() => {
          ${communityScreenshotStatements()}
          window.scrollTo(0, 0);
          return document.getElementById("communityFeedList")?.children.length || 0;
        })()
      `,
      awaitPromise: true
    });
    await wait(40);
  }
  if (tab === "news") {
    await client.send("Runtime.evaluate", {
      expression: `
        (() => {
          ${newsScreenshotStatements()}
          window.scrollTo(0, 0);
          return document.getElementById("dailyNewsList")?.children.length || 0;
        })()
      `,
      awaitPromise: true
    });
    await wait(40);
  }
  const debugState = await client.send("Runtime.evaluate", {
    expression: `
      (() => {
        const app = document.getElementById("appContent");
        const activePanels = Array.from(document.querySelectorAll(".app-tab-panel.active, .panel.active"));
        const rectOf = (element) => {
          if (!element) return null;
          const rect = element.getBoundingClientRect();
          const style = getComputedStyle(element);
          return {
            id: element.id || "",
            className: element.className || "",
            display: style.display,
            visibility: style.visibility,
            opacity: style.opacity,
            transform: style.transform,
            x: Math.round(rect.x),
            y: Math.round(rect.y),
            width: Math.round(rect.width),
            height: Math.round(rect.height)
          };
        };
        return {
          viewport: { width: innerWidth, height: innerHeight, dpr: devicePixelRatio },
          htmlClass: document.documentElement.className,
          htmlDataset: { ...document.documentElement.dataset },
          bodyClass: document.body.className,
          bodyHeight: Math.round(document.body.getBoundingClientRect().height),
          app: rectOf(app),
          tabBar: rectOf(document.querySelector(".app-tab-bar")),
          activePanels: activePanels.map(rectOf),
          activeTab: document.querySelector(".app-tab-btn.active")?.textContent?.trim() || ""
        };
      })()
    `,
    returnByValue: true
  });
  const renderedState = debugState?.result?.value || {};
  const firstVisiblePanel = (renderedState.activePanels || []).find((panel) => panel?.display !== "none");
  if (
    !firstVisiblePanel ||
    firstVisiblePanel.y >= Number(renderedState.viewport?.height || 0) * 0.8 ||
    Number(renderedState.tabBar?.height || 0) >= Number(renderedState.viewport?.height || 0) * 0.8
  ) {
    throw new Error(`Invalid App Store screenshot layout for ${deviceName}/${tab}: ${JSON.stringify(renderedState)}`);
  }
  if (tab === "community" || tab === "news") {
    await client.send("Runtime.evaluate", {
      expression: `
        (() => {
          if (${JSON.stringify(tab)} === "community") {
            ${communityScreenshotStatements()}
          }
          if (${JSON.stringify(tab)} === "news") {
            ${newsScreenshotStatements()}
          }
          window.scrollTo(0, 0);
          return true;
        })()
      `,
      awaitPromise: true
    });
  }
  const result = await client.send("Page.captureScreenshot", {
    format: "png",
    fromSurface: true,
    captureBeyondViewport: false
  });
  fs.writeFileSync(outputPath, Buffer.from(result.data, "base64"));
  client.close();
  return outputPath;
}

async function main() {
  ensureChrome();
  const preview = await startPreviewServer();
  const { child: chrome, profileDir } = startChrome();
  try {
    await waitForChrome();
    for (const [deviceName, device] of Object.entries(devices)) {
      if (deviceFilter && !deviceName.includes(deviceFilter)) continue;
      if (!shotFilterTerms.length) {
        fs.rmSync(path.join(outputRoot, deviceName), { recursive: true, force: true });
      }
      for (const [name, tab] of shots) {
        if (shotFilterTerms.length && !shotFilterTerms.some((term) => name.includes(term) || tab.includes(term))) continue;
        const outputPath = await captureShot(deviceName, device, name, tab);
        console.log(path.relative(rootDir, outputPath));
      }
    }
  } finally {
    chrome.kill("SIGKILL");
    preview.kill("SIGTERM");
    await wait(250);
    fs.rmSync(profileDir, { recursive: true, force: true, maxRetries: 5, retryDelay: 100 });
  }
}

main().catch((error) => {
  console.error(error.stack || error.message);
  process.exitCode = 1;
});
