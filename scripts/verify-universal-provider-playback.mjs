#!/usr/bin/env node
// Real visible provider player checks. Never download media or infer playback
// from search metadata, oEmbed, iframe load, or merely a valid URL.
import fs from "node:fs/promises";
import { createRequire } from "node:module";
import { startTestPreviewServer } from "./test-preview-server.mjs";
const require = createRequire(import.meta.url), listening = require("../universal-listening.js");
const { chromium } = await import(process.env.SONIC_PLAYWRIGHT_MODULE || "playwright");
const dataset = JSON.parse(await fs.readFile(new URL("../data/universal-listening-pilot.json", import.meta.url), "utf8"));
const maximum = Math.max(1, Math.min(90, Number(process.argv.find(a => a.startsWith("--max="))?.split("=")[1]) || 60));
const requested = (process.argv.find(a => a.startsWith("--groups="))?.split("=")[1] || "").split(",").filter(Boolean);
const targets = dataset.tracks.filter(t => listening.previewEligible(t) && listening.playbackResult(t) === "unconfirmed"
  && (!requested.length || requested.includes(t.group))).slice(0, maximum);
const preview = await startTestPreviewServer(), checks = [];
const browser = await chromium.launch({ executablePath: "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome", headless: true,
  args: ["--autoplay-policy=no-user-gesture-required"] });
let cursor = 0;
try {
  await Promise.all(Array.from({ length: Math.min(3, targets.length) }, async () => {
    const page = await browser.newPage({ viewport: { width: 393, height: 852 } });
    await page.goto(`${preview.baseUrl}/listening-preview.html`);
    await page.evaluate(() => new Promise((resolve, reject) => {
      if (window.YT?.Player) { resolve(); return; }
      const timeout = setTimeout(() => reject(new Error("youtube_api_timeout")), 15000);
      window.onYouTubeIframeAPIReady = () => { clearTimeout(timeout); resolve(); };
      const script = document.createElement("script"); script.src = "https://www.youtube.com/iframe_api"; document.head.append(script);
    }));
    while (cursor < targets.length) {
      const track = targets[cursor++], startedAt = new Date().toISOString();
      const result = await page.evaluate(videoId => new Promise(resolve => {
        const section = document.createElement("section"), mount = document.createElement("div"); section.append(mount);
        document.body.prepend(section); let player = null, settled = false, timer, probe;
        const done = output => { if (settled) return; settled = true; clearTimeout(timer); clearInterval(probe);
          try { player?.destroy(); } catch (_) {} section.remove(); resolve(output); };
        timer = setTimeout(() => done({ result: "unconfirmed", detail: "no_playback_confirmation_within_22s" }), 22000);
        player = new window.YT.Player(mount, { host: "https://www.youtube-nocookie.com", videoId,
          playerVars: { origin: location.origin, playsinline: 1, controls: 1, rel: 0 }, events: {
            onReady(e) { e.target.getIframe().referrerPolicy = "strict-origin-when-cross-origin"; e.target.playVideo(); },
            onStateChange(e) { if (e.data !== 1 || probe) return;
              probe = setInterval(() => { const time = e.target.getCurrentTime();
                if (e.target.getPlayerState() === 1 && time >= 1) done({ result: "played", observedTimeSec: time }); }, 300); },
            onError(e) { done({ result: [100, 101, 150].includes(e.data) ? "blocked" : "unconfirmed", errorCode: e.data }); }
          } });
      }), track.evidence.videoId);
      const check = { url: track.evidence.url, artist: track.artist, song: track.song, group: track.group,
        checkedAt: startedAt, ...result, environment: "headless Google Chrome; real YouTube player; browser test only, not physical iPhone or all territories" };
      checks.push(check); console.log(JSON.stringify(check));
      await fs.writeFile(new URL("../reports/universal-provider-playback-latest.json", import.meta.url), `${JSON.stringify({ checkedAt: new Date().toISOString(), checks }, null, 2)}\n`);
    }
    await page.close();
  }));
  console.log(JSON.stringify({ tested: checks.length, played: checks.filter(c => c.result === "played").length,
    blocked: checks.filter(c => c.result === "blocked").length, unconfirmed: checks.filter(c => c.result === "unconfirmed").length }));
} finally { await browser.close(); await preview.stop(); }
