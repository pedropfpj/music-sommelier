import assert from "node:assert/strict";
import fs from "node:fs/promises";
import vm from "node:vm";
import { createRequire } from "node:module";
import { fileURLToPath } from "node:url";
import { startTestPreviewServer } from "./test-preview-server.mjs";
const require = createRequire(import.meta.url);
const weekly = require("../weekly-recommends.js");
const app = await fs.readFile(process.env.SONIC_WEEKLY_PREPARATION_APP_PATH || new URL("../app.js", import.meta.url), "utf8");
const bridgeSource = app.slice(app.indexOf("async function openWeeklyEditionTrack("), app.indexOf("async function openSavedLibraryTrack("));
assert.ok(bridgeSource.length > 0);
const track = { artist: "N3XU5", song: "Scanner Darkly", style: "dark_psy" };
const sibling = { ...track, song: "Another recording" };
const calls = [];
const context = vm.createContext({
  recommendationRunBusy: false, swipeFeedbackBusy: false, firstRecommendationBusy: false,
  recommendationSessionGeneration: 1,
  recommendationSessionIsCurrent: generation => generation === context.recommendationSessionGeneration,
  firstRecommendationCompleted: false, currentRecommendation: null, catalog: [sibling, track],
  CURATED_FRIENDLY_OPENING_TRACKS: [], lastPrefs: null,
  sessionProfileKey: () => "profile-a", prepareExplicitPreviewAudio() {},
  currentActiveAppTabName: () => "discover",
  recommendationTrackKey: item => `${item.artist}::${item.song}`,
  isTrackEligibleForRecommendation: item => item.eligible !== false,
  hydrateExternalDatasetPackInBackground: async () => {},
  weeklyEditionPreviewCache: new Map(),
  weeklyEditionItemKey: item => `${item.artist}::${item.title}::${item.style}`,
  prepareWeeklyEditionTracks: async items => ({ ok: true, results: items.map(item => {
    const selected = context.catalog.find(candidate => candidate.artist === item.artist && candidate.song === item.title && candidate.style === item.style);
    if (selected) context.weeklyEditionPreviewCache.set(context.weeklyEditionItemKey(item), { track: selected });
    return { item, status: selected ? "playable" : "unconfirmed" };
  }) }),
  waitForWeeklyPreviewMedia: async () => true,
  waitForPromiseWithTimeout: promise => promise,
  stopAllActivePlayback: () => calls.push("stop"),
  restoreRecommendationSurfaceSnapshot: ({ track: selected }) => { context.currentRecommendation = selected; calls.push(selected.song); },
  markRecommendationPresented: selected => calls.push(`presented:${selected.song}`), updateStats() {},
  renderPreview: async (_, options) => { assert.equal(options.exactRecordingOnly, true); assert.equal(options.deferRetry, false); return true; },
  trackRecommendationEvent: (...args) => calls.push(args[0])
});
vm.runInContext(`${bridgeSource}\nthis.openTrack = openWeeklyEditionTrack;`, context);
let result = await context.openTrack({ artist: track.artist, title: track.song, style: track.style }, { isCurrent: () => true });
assert.equal(result.ok, true);
assert.equal(context.currentRecommendation.song, "Scanner Darkly", "The session must use the edition's exact recording");
assert.ok(calls.includes("weekly_track_opened"));
context.currentRecommendation = null;
result = await context.openTrack({ artist: track.artist, title: "Unavailable recording", style: track.style });
assert.equal(result.ok, false);
assert.equal(result.reason, "unavailable");
assert.equal(context.currentRecommendation, null, "Never replace missing edition music with a different recording");
context.recommendationRunBusy = true;
result = await context.openTrack({ artist: track.artist, title: track.song, style: track.style });
assert.equal(result.reason, "busy");
context.recommendationRunBusy = false;
result = await context.openTrack({ artist: track.artist, title: track.song, style: track.style }, { isCurrent: () => false });
assert.equal(result.reason, "canceled");
assert.equal(context.currentRecommendation, null, "A canceled session must not reopen its track later");
assert.equal(context.recommendationRunBusy, false);

context.currentRecommendation = null;
let finishPreparation;
const originalPrepare = context.prepareWeeklyEditionTracks;
context.prepareWeeklyEditionTracks = () => new Promise(resolve => { finishPreparation = resolve; });
const oldSession = context.openTrack({ artist: track.artist, title: "Old profile pending recording", style: track.style });
await Promise.resolve();
context.recommendationSessionGeneration++;
context.recommendationRunBusy = true;
finishPreparation({ ok: false, results: [] });
assert.equal((await oldSession).reason, "canceled");
assert.equal(context.recommendationRunBusy, true, "A late weekly lookup must not release another profile's discovery lock");
context.recommendationRunBusy = false;
context.prepareWeeklyEditionTracks = originalPrepare;
context.renderPreview = async () => false;
const presentationsBeforeFailure = calls.filter(call => call.startsWith("presented:")).length;
result = await context.openTrack({ artist: track.artist, title: track.song, style: track.style });
assert.equal(result.ok, false);
assert.equal(result.reason, "unavailable");
assert.equal(context.recommendationRunBusy, false);
assert.equal(calls.filter(call => call.startsWith("presented:")).length, presentationsBeforeFailure, "A failed preview must not count as a delivered weekly recording");

const { chromium } = await import(process.env.SONIC_PLAYWRIGHT_MODULE || "playwright");
const preview = await startTestPreviewServer();
const browser = await chromium.launch({ executablePath: "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome", headless: true });
const styles = [
  { id: "dark_psy", label: "Dark Psy", group: "Dark Psy" },
  { id: "hi_tech", label: "Hi-Tech", group: "Hi-Tech" },
  { id: "forest_psy", label: "Forest", group: "Forest" }
];
const audioBytes = Buffer.alloc(44 + 64000);
audioBytes.write("RIFF"); audioBytes.writeUInt32LE(audioBytes.length - 8, 4); audioBytes.write("WAVEfmt ", 8);
audioBytes.writeUInt32LE(16, 16); audioBytes.writeUInt16LE(1, 20); audioBytes.writeUInt16LE(1, 22);
audioBytes.writeUInt32LE(8000, 24); audioBytes.writeUInt32LE(16000, 28); audioBytes.writeUInt16LE(2, 32); audioBytes.writeUInt16LE(16, 34);
audioBytes.write("data", 36); audioBytes.writeUInt32LE(64000, 40);
for (let i = 0; i < 32000; i++) audioBytes.writeInt16LE(Math.round(Math.sin(i * Math.PI * 2 * 220 / 8000) * 500), 44 + i * 2);
try {
  const integration = await browser.newPage({ viewport: { width: 393, height: 852 }, reducedMotion: "reduce" });
  const integrationErrors = []; integration.on("pageerror", error => integrationErrors.push(error.message));
  await integration.route("**/api/**", route => route.fulfill({ json: { ok: true, enabled: false, tracks: [], count: 0 } }));
  await integration.route("**/api/track-metadata*", route => {
    const requested = route.request().postDataJSON();
    return route.fulfill({ json: { best: { artist: requested.artist, song: requested.song, previewUrl: "https://weekly-audio.fixture.test/exact.wav" } } });
  });
  await integration.route("https://weekly-audio.fixture.test/**", route => route.fulfill({ contentType: "audio/wav", body: audioBytes, headers: { "Access-Control-Allow-Origin": "*" } }));
  await integration.route("**/app.min.js*", route => route.fulfill({ contentType: "text/javascript", body: app }));
  let integrationData;
  await integration.route("**/data/weekly-catalog-v1.json*", route => route.fulfill({ json: integrationData }));
  await integration.goto(`${preview.baseUrl}/?qa=1&lang=pt&screenshot=1&recommendation=0`, { waitUntil: "domcontentloaded" });
  await integration.waitForFunction(() => typeof weeklyRecommendsController !== "undefined" && weeklyRecommendsController);
  integrationData = await integration.evaluate(() => {
    const tracks = CURATED_FRIENDLY_OPENING_TRACKS.filter(track => isTrackEligibleForRecommendation(track)).slice(0, 3);
    const keys = new Set(tracks.map(recommendationTrackKey));
    [...CURATED_FRIENDLY_OPENING_TRACKS, ...catalog].filter(track => keys.has(recommendationTrackKey(track))).forEach(track => {
      track.previewUrl = ""; track.previewCandidates = []; track.previewChecked = false; track.previewMissing = false;
    });
    return { version: 1, styles: [...new Set(tracks.map(track => track.style))].map(style => ({ id: style, label: style, group: style })), tracks: tracks.map((track, i) => ({ id: `integration:${i}`, artist: track.artist, title: track.song, style: track.style })) };
  });
  assert.ok(integrationData.tracks.length > 0, "Integration fixture needs actual eligible catalog recordings");
  const essential = integration.getByRole("button", { name: "Só essenciais", exact: true });
  if (await essential.isVisible()) await essential.click();
  await integration.locator("#weeklyTeaserButton").click();
  await integration.locator("#weeklySessionStart").click();
  await integration.getByRole("button", { name: /Ouvir [123] prévia/ }).waitFor();
  assert.equal(await integration.evaluate(() => currentRecommendation), null, "Checking previews must not present a card");
  await integration.locator("#weeklySessionStart").click();
  await integration.locator("#weeklyListeningStatus").getByText(/A prévia está pronta/).waitFor();
  const previewPlay = integration.locator("#previewPlayBtn");
  if (await previewPlay.isVisible()) await previewPlay.click();
  await integration.waitForFunction(() => trackPreview && !trackPreview.paused && trackPreview.currentTime > 0.15, {}, { timeout: 10000 });
  const selectedIdentity = await integration.locator(".weekly-listening-track").textContent();
  assert.equal(await integration.evaluate(() => `${currentRecommendation.artist} — ${currentRecommendation.song}`), selectedIdentity);
  assert.equal(await integration.evaluate(() => currentActiveAppTabName()), "discover");
  assert.deepEqual(integrationErrors, []);
  await integration.close();
  const page = await browser.newPage({ viewport: { width: 393, height: 852 }, reducedMotion: "reduce" });
  const errors = []; page.on("pageerror", error => errors.push(error.message));
  let empty = false;
  await page.route("**/data/weekly-catalog-v1.json*", route => route.fulfill({ json: { version: 1, styles, tracks: empty ? [] : weekly.special } }));
  async function mount() {
    await page.goto(`${preview.baseUrl}/cookies.html`, { waitUntil: "domcontentloaded" });
    await page.setContent('<style>:root{--text:#e8f5ef}body{margin:0;padding:12px;background:#08131f;font-family:Arial,sans-serif}button,a,select{font:inherit}#swipeStartPanel[hidden],#weeklyRecommendsPanel[hidden]{display:none!important}</style><section id="weeklyRecommendsPanel"></section><section id="swipeStartPanel" hidden></section>');
    await page.addStyleTag({ path: fileURLToPath(new URL("../weekly-recommends.css", import.meta.url)) });
    await page.addScriptTag({ path: fileURLToPath(new URL("../weekly-recommends.js", import.meta.url)) });
    await page.evaluate(async () => {
      window.sessionCalls = []; window.mockResult = { ok: true }; window.sessionLanguage = "pt";
      const root = document.getElementById("weeklyRecommendsPanel"), player = document.getElementById("swipeStartPanel");
      window.controller = window.SonicWeeklyRecommends.mount(root, {
        getLanguage: () => window.sessionLanguage,
        navigate: tab => { root.hidden = tab !== "recommends"; player.hidden = tab !== "discover"; },
        beforeListen: () => {},
        prepareEditionTracks: async items => ({ ok: true, results: items.map(item => ({ item, status: "playable" })) }),
        listenToTrack: async (item, context) => { window.sessionCalls.push(item); if (!context.isCurrent()) return { ok: false }; return window.mockResult; }
      });
      await window.controller.open();
    });
  }
  await mount();
  const editionTracks = await page.locator(".weekly-track").evaluateAll(rows => rows.slice(0, 3).map(row => ({ artist: row.querySelector(".weekly-artist").textContent, title: row.querySelector("h5").textContent, reason: row.querySelector(".weekly-reason").textContent, url: row.querySelector("a").href })));
  assert.equal(editionTracks.length, 3);
  await page.locator("#weeklySessionStart").click();
  await page.getByRole("button", { name: "Ouvir 3 prévias da edição", exact: true }).waitFor();
  await page.locator("#weeklySessionStart").click();
  await page.locator("#weeklyListeningStatus").getByText(/A prévia está pronta/).waitFor();
  assert.equal(await page.locator(".weekly-listening-track").textContent(), `${editionTracks[0].artist} — ${editionTracks[0].title}`);
  assert.equal(await page.locator("#weeklyListeningSession .weekly-reason").textContent(), editionTracks[0].reason);
  assert.equal(await page.locator("#weeklyListeningSession a").getAttribute("href"), editionTracks[0].url);
  assert.ok(await page.locator("#weeklyListeningPrevious").isDisabled());
  assert.equal(await page.locator("#weeklyListeningSession").getAttribute("aria-busy"), "false");
  await page.evaluate(() => { window.mockResult = { ok: false }; });
  await page.locator("#weeklyListeningNext").click();
  await page.locator("#weeklyListeningStatus").getByText(/não abriu agora/).waitFor();
  assert.equal(await page.locator(".weekly-listening-track").textContent(), `${editionTracks[1].artist} — ${editionTracks[1].title}`);
  assert.ok(await page.locator("#weeklyListeningRetry").isVisible());
  assert.equal(await page.locator("#weeklyListeningSession a").getAttribute("href"), editionTracks[1].url);
  await page.evaluate(() => { window.mockResult = { ok: true }; });
  await page.locator("#weeklyListeningRetry").click();
  await page.locator("#weeklyListeningStatus").getByText(/A prévia está pronta/).waitFor();
  await page.locator("#weeklyListeningNext").click();
  await page.getByText("Prévia 3 de 3", { exact: true }).waitFor();
  assert.equal(await page.locator("#weeklyListeningNext").textContent(), "Concluir escuta");
  for (const viewport of [{ width: 320, height: 740 }, { width: 393, height: 852 }, { width: 852, height: 393 }, { width: 1440, height: 960 }]) {
    await page.setViewportSize(viewport);
    const metrics = await page.locator("#weeklyListeningSession").evaluate(root => ({ width: root.getBoundingClientRect().width, scrollWidth: root.scrollWidth, controls: [...root.querySelectorAll("button,a")].map(el => el.getBoundingClientRect().height) }));
    assert.ok(metrics.scrollWidth <= Math.ceil(metrics.width) + 1, `Session must not overflow at ${viewport.width}`);
    assert.ok(metrics.controls.every(height => height >= 44), "Session controls need accessible touch targets");
    await page.locator("#weeklyListeningSession").screenshot({ path: fileURLToPath(new URL(`../reports/ui-weekly-session-${viewport.width}-latest.png`, import.meta.url)) });
  }
  await page.locator("#weeklyListeningBack").click();
  assert.equal(await page.locator("#weeklySessionStart").textContent(), "Retomar a escuta");
  await page.evaluate(() => { window.sessionLanguage = "en"; window.controller.refresh(); });
  assert.equal(await page.locator("#weeklySessionStart").textContent(), "Resume listening");
  await page.locator("#weeklySessionStart").click();
  await page.getByText("Preview 3 of 3", { exact: true }).waitFor();
  await page.evaluate(() => window.controller.trackChanged({ artist: "Unrelated", song: "Discovery" }));
  assert.ok(await page.locator("#weeklyListeningSession").isHidden(), "A normal discovery must end the edition context");
  await page.evaluate(() => { document.getElementById("weeklyRecommendsPanel").hidden = false; document.getElementById("swipeStartPanel").hidden = true; window.sessionLanguage = "pt"; window.controller.refresh(); });
  await page.locator("#weeklySessionStart").click();
  await page.locator("#weeklyListeningStatus").getByText(/A prévia está pronta/).waitFor();
  await page.locator("#weeklyListeningEnd").click();
  assert.ok(await page.locator("#weeklyRecommendsPanel").isVisible());
  assert.ok(await page.locator("#weeklyListeningSession").isHidden());
  empty = true;
  await mount();
  await page.getByText("Ainda não há faixas disponíveis para este estilo nesta edição.", { exact: true }).waitFor();
  assert.equal(await page.locator("#weeklySessionStart").count(), 0, "Empty editions must not offer a fake listening session");
  assert.deepEqual(errors, []);
  console.log("Weekly listening passed: exact recording bridge, no substitution, cancel/busy/unplayable states; real edition queue/context/source links, retry, return/resume/end, empty state, translations and 320/393/852/1440 layouts.");
} finally { await browser.close(); await preview.stop(); }
