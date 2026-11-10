import assert from "node:assert/strict";
import fs from "node:fs/promises";
import http from "node:http";
import path from "node:path";
import { createRequire } from "node:module";
import { fileURLToPath } from "node:url";
const require = createRequire(import.meta.url);
const weekly = require("../weekly-recommends.js");
const root = fileURLToPath(new URL("../", import.meta.url));
const { chromium } = await import(process.env.SONIC_PLAYWRIGHT_MODULE || "playwright");
const data = JSON.parse(await fs.readFile(path.join(root, "data/weekly-catalog-v1.json"), "utf8"));
const expected = weekly.selection(data, weekly.parseEdition("2026-11-04", weekly.weekIndex()), "all");
assert.equal(expected.length, 6);
// A real, locally served audio resource exercises browser decode/play/time
// progression. It is a test tone, not evidence about an external music provider.
const rate = 8000, samples = rate * 4, wav = Buffer.alloc(44 + samples * 2);
wav.write("RIFF"); wav.writeUInt32LE(wav.length - 8, 4); wav.write("WAVEfmt ", 8);
wav.writeUInt32LE(16, 16); wav.writeUInt16LE(1, 20); wav.writeUInt16LE(1, 22);
wav.writeUInt32LE(rate, 24); wav.writeUInt32LE(rate * 2, 28); wav.writeUInt16LE(2, 32); wav.writeUInt16LE(16, 34);
wav.write("data", 36); wav.writeUInt32LE(samples * 2, 40);
for (let i = 0; i < samples; i++) wav.writeInt16LE(Math.round(Math.sin(2 * Math.PI * 440 * i / rate) * 500), 44 + i * 2);
const files = new Map(await Promise.all([
  ["/weekly-recommends.js", "weekly-recommends.js", "text/javascript"],
  ["/weekly-recommends.css", "weekly-recommends.css", "text/css"],
  ["/data/weekly-catalog-v1.json", "data/weekly-catalog-v1.json", "application/json"]
].map(async ([url, file, type]) => [url, { type, body: await fs.readFile(path.join(root, file)) }])));
const server = http.createServer((request, response) => {
  const url = new URL(request.url, "http://localhost");
  const file = files.get(url.pathname);
  if (file) { response.writeHead(200, { "Content-Type": file.type }); response.end(file.body); return; }
  if (url.pathname === "/fixture.wav") { response.writeHead(200, { "Content-Type": "audio/wav", "Content-Length": wav.length }); response.end(wav); return; }
  response.writeHead(200, { "Content-Type": "text/html" });
  response.end('<!doctype html><html lang="pt"><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><link rel="stylesheet" href="/weekly-recommends.css"><style>body{margin:0;padding:12px;background:#08131f;color:#e8f5ef;font-family:Arial,sans-serif}button,a,select{font:inherit}#swipeStartPanel[hidden],#weeklyRecommendsPanel[hidden]{display:none!important}</style><section id="weeklyRecommendsPanel"></section><section id="swipeStartPanel" hidden></section><script src="/weekly-recommends.js"></script></html>');
});
await new Promise(resolve => server.listen(0, "127.0.0.1", resolve));
const origin = `http://127.0.0.1:${server.address().port}`;
const browser = await chromium.launch({ executablePath: "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome", headless: true });
const output = path.join(root, ".vercel/weekly-preview-controller");
await fs.mkdir(output, { recursive: true });
const page = await browser.newPage({ viewport: { width: 393, height: 852 }, reducedMotion: "reduce" });
const errors = []; page.on("pageerror", error => errors.push(error.message));

async function mount(statuses = ["unavailable", "unavailable", "playable", "playable", "unconfirmed", "unavailable"]) {
  await page.goto(`${origin}/?edition=2026-11-04`, { waitUntil: "load" });
  await page.evaluate(async statuses => {
    window.fixtureStatuses = statuses;
    window.fixtureLanguage = "pt";
    window.fixtureCalls = []; window.fixturePrepared = []; window.fixturePlaying = [];
    const root = document.getElementById("weeklyRecommendsPanel"), player = document.getElementById("swipeStartPanel");
    window.fixtureController = window.SonicWeeklyRecommends.mount(root, {
      getLanguage: () => window.fixtureLanguage,
      navigate: tab => { root.hidden = tab !== "recommends"; player.hidden = tab !== "discover"; },
      beforeListen: () => window.fixtureAudio?.pause(),
      prepareEditionTracks: async (items, context) => {
        window.fixturePrepared.push(items);
        if (window.fixtureDeferred) await new Promise(resolve => { window.releaseFixture = resolve; });
        if (!context.isCurrent()) return { ok: false, results: [] };
        if (window.fixtureAlien) return { ok: true, results: items.map(item => ({ item: { ...item }, status: "playable" })) };
        if (window.fixtureDuplicates) return { ok: true, results: [{ item: items[0], status: "playable" }, { item: items[0], status: "unavailable" }] };
        return { ok: true, results: items.map((item, i) => ({ item, status: window.fixtureStatuses[i] || "unconfirmed" })) };
      },
      listenToTrack: async (item, context) => {
        window.fixtureCalls.push(item);
        if (!context.isCurrent()) return { ok: false, reason: "canceled" };
        if (window.fixturePlaybackFailure) return { ok: false, reason: "unavailable" };
        window.fixtureAudio = new Audio("/fixture.wav");
        window.fixtureAudio.addEventListener("playing", () => window.fixturePlaying.push(item.id), { once: true });
        await window.fixtureAudio.play();
        return { ok: window.fixtureAudio.readyState >= 2 && !window.fixtureAudio.paused };
      }
    });
    await window.fixtureController.open();
  }, statuses);
}
async function checkPreviews() {
  await page.locator("#weeklySessionStart").click();
  await page.waitForFunction(() => document.querySelector(".weekly-session-entry")?.getAttribute("aria-busy") === "false");
}
async function assertAudioPlaying() {
  await page.waitForFunction(() => window.fixtureAudio && !window.fixtureAudio.paused && window.fixtureAudio.currentTime > 0.15);
  assert.ok(await page.evaluate(() => window.fixturePlaying.length > 0));
}
function identity(item) { return `${item.artist} — ${item.title}`; }

try {
  await mount();
  const sourcesBefore = await page.locator(".weekly-track .weekly-listen").evaluateAll(links => links.map(link => link.href));
  assert.equal(await page.locator("#weeklySessionStart").textContent(), "Conferir prévias da edição");
  assert.equal(await page.locator(".weekly-track").count(), 6);
  await checkPreviews();
  assert.equal(await page.locator("#weeklySessionStart").textContent(), "Ouvir 2 prévias da edição");
  assert.match(await page.locator("#weeklyPreviewSummary").textContent(), /2 de 6.*Nesta escuta: 2.*1 ainda sem confirmação/);
  assert.equal(await page.locator('[data-weekly-preview="playable"]').count(), 2);
  assert.equal(await page.locator('[data-weekly-preview="unavailable"]').count(), 3);
  assert.equal(await page.locator('[data-weekly-preview="unconfirmed"]').count(), 1);
  assert.deepEqual(await page.locator(".weekly-track .weekly-listen").evaluateAll(links => links.map(link => link.href)), sourcesBefore);
  const miranda = page.locator('[data-weekly-track="ambient_techno:convextion|miranda"]');
  assert.equal(await miranda.locator(".weekly-label-source").getAttribute("href"), "https://mojubarecords.bandcamp.com/track/miranda");
  assert.equal(await miranda.locator(".weekly-label-source").textContent(), "Fonte da gravadora: Mojuba ↗");
  assert.notEqual(await miranda.locator("[data-weekly-preview]").getAttribute("data-weekly-preview"), "playable", "A verified source URL does not prove an in-app preview");
  await page.screenshot({ path: path.join(output, "preview-verified-ready-393.png"), fullPage: true });
  assert.equal(await page.evaluate(() => window.fixtureCalls.length), 0, "Checking must not open the player or count as listening");
  await page.locator("#weeklySessionStart").click();
  await assertAudioPlaying();
  assert.equal(await page.locator(".weekly-listening-track").textContent(), identity(expected[2]));
  await page.locator("#weeklyListeningNext").click();
  await assertAudioPlaying();
  assert.equal(await page.locator(".weekly-listening-track").textContent(), identity(expected[3]));
  assert.deepEqual(await page.evaluate(() => window.fixtureCalls.map(item => item.id)), [expected[2].id, expected[3].id]);
  await page.locator("#weeklyListeningBack").click();
  assert.equal(await page.locator("#weeklySessionStart").textContent(), "Retomar a escuta");
  await page.locator("#weeklyPrev").click();
  await page.locator("#weeklyNext").click();
  assert.equal(await page.locator("#weeklySessionStart").textContent(), "Conferir prévias da edição");
  await checkPreviews();
  assert.equal(await page.locator("#weeklySessionStart").textContent(), "Retomar a escuta", "Returning to an edition rechecks availability before resuming");
  await page.locator("#weeklySessionStart").click();
  await assertAudioPlaying();
  await page.locator("#weeklyListeningNext").click();
  assert.ok(await page.locator("#weeklyRecommendsPanel").isVisible());
  console.log("PASS 2-stage same-edition filtering, all six sources preserved, real audio playing/time progression, next/resume/end");

  await mount(["playable", "playable", "playable", "playable", "unavailable", "unconfirmed"]);
  await checkPreviews();
  assert.equal(await page.locator("#weeklySessionStart").textContent(), "Ouvir 3 prévias da edição");
  assert.match(await page.locator("#weeklyPreviewSummary").textContent(), /4 de 6.*Nesta escuta: 3/);
  await page.locator("#weeklySessionStart").click();
  for (let i = 0; i < 3; i++) {
    await assertAudioPlaying();
    assert.equal(await page.locator(".weekly-listening-track").textContent(), identity(expected[i]));
    await page.locator("#weeklyListeningNext").click();
  }
  assert.equal(await page.evaluate(() => window.fixtureCalls.length), 3);
  console.log("PASS queue cap of three is separate from four confirmed previews");

  await mount(["unavailable", "unconfirmed"]);
  await checkPreviews();
  assert.equal(await page.locator("#weeklySessionStart").count(), 0);
  assert.ok(await page.locator("#weeklySessionRecheck").isVisible());
  assert.match(await page.locator("#weeklyPreviewSummary").textContent(), /Nenhuma prévia foi confirmada/);
  await page.evaluate(() => { window.fixtureStatuses = ["playable"]; });
  await page.locator("#weeklySessionRecheck").click();
  await page.getByRole("button", { name: "Ouvir 1 prévia da edição", exact: true }).waitFor();
  for (const [language, label] of [["en", "Listen to 1 edition preview"], ["es", "Escuchar 1 previa de la edición"]]) {
    await page.evaluate(language => { window.fixtureLanguage = language; window.fixtureController.refresh(); }, language);
    assert.equal(await page.locator("#weeklySessionStart").textContent(), label);
  }
  console.log("PASS zero-ready source fallback, recheck, honest singular count and EN/ES");

  for (const invalid of ["fixtureAlien", "fixtureDuplicates"]) {
    await mount(["playable"]);
    await page.evaluate(key => { window[key] = true; }, invalid);
    await checkPreviews();
    assert.equal(await page.locator('[data-weekly-preview="playable"]').count(), 0);
    assert.equal(await page.locator("#weeklySessionStart").count(), 0);
  }
  console.log("PASS alien copied items and ambiguous duplicate results cannot enter a session");

  for (const change of ["edition", "profile"]) {
    await mount(["playable", "playable", "playable"]);
    await page.evaluate(() => { window.fixtureDeferred = true; });
    await page.locator("#weeklySessionStart").click();
    assert.ok(await page.locator("#weeklySessionStart").isDisabled());
    assert.equal(await page.evaluate(() => window.fixtureCalls.length), 0);
    if (change === "edition") await page.locator("#weeklyPrev").click();
    else await page.evaluate(() => window.dispatchEvent(new CustomEvent("sonic:profile-changed")));
    await page.evaluate(() => window.releaseFixture());
    await page.waitForTimeout(50);
    assert.equal(await page.locator("#weeklySessionStart").textContent(), "Conferir prévias da edição");
    assert.equal(await page.locator('[data-weekly-preview="playable"]').count(), 0);
  }
  console.log("PASS delayed preparation cannot cross edition/profile changes and preserves source browsing");

  await mount(["playable", "playable"]);
  await checkPreviews();
  await page.evaluate(() => { window.fixturePlaybackFailure = true; });
  await page.locator("#weeklySessionStart").click();
  await page.locator("#weeklyListeningStatus").getByText(/não abriu agora/).waitFor();
  assert.equal(await page.locator(".weekly-listening-position").textContent(), "Esta prévia não abriu");
  await page.locator("#weeklyListeningBack").click();
  assert.match(await page.locator("#weeklyPreviewSummary").textContent(), /1 de 6.*Nesta escuta: 1/);
  assert.equal(await page.locator("#weeklySessionStart").textContent(), "Ouvir 1 prévia da edição");
  for (const width of [320, 393, 852, 1440]) {
    await page.setViewportSize({ width, height: width === 852 ? 393 : 852 });
    const metrics = await page.locator("#weeklyRecommendsPanel").evaluate(root => ({ width: root.clientWidth, scrollWidth: root.scrollWidth,
      buttons: [...root.querySelectorAll(".weekly-session-entry button")].map(button => button.getBoundingClientRect().height) }));
    assert.ok(metrics.scrollWidth <= metrics.width + 1, `No overflow at ${width}px`);
    assert.ok(metrics.buttons.every(height => height >= 44));
    await page.screenshot({ path: path.join(output, `preview-availability-${width}.png`), fullPage: false });
  }
  console.log("PASS playback failure demotes availability/count and accessible 320/393/852/1440 layouts");
  assert.deepEqual(errors, []);
  console.log("Weekly preview controller passed. Browser audio genuinely played a local test tone; external provider verification belongs to the app bridge acceptance checks.");
} finally {
  await browser.close();
  await new Promise(resolve => server.close(resolve));
}
