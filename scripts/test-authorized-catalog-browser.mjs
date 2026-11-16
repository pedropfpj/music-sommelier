import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { createServer } from "node:http";
import catalogApi from "../api/authorized-catalog.js";
import audioApi from "../api/authorized-audio.js";
import { startTestPreviewServer } from "./test-preview-server.mjs";

const engine = process.argv[2] || "chromium";
assert.ok(["chromium", "webkit"].includes(engine));
const playwright = await import(process.env.SONIC_PLAYWRIGHT_MODULE || "playwright");
const browser = await playwright[engine].launch();

// Each generated PCM fixture has its own immutable content key. No commercial
// recordings are used and the fixtures stay in memory for this process.
function tone(frequency) {
  const rate = 16000;
  const samples = rate * 5;
  const wav = Buffer.alloc(44 + samples * 2);
  wav.write("RIFF", 0);
  wav.writeUInt32LE(wav.length - 8, 4);
  wav.write("WAVEfmt ", 8);
  wav.writeUInt32LE(16, 16);
  wav.writeUInt16LE(1, 20);
  wav.writeUInt16LE(1, 22);
  wav.writeUInt32LE(rate, 24);
  wav.writeUInt32LE(rate * 2, 28);
  wav.writeUInt16LE(2, 32);
  wav.writeUInt16LE(16, 34);
  wav.write("data", 36);
  wav.writeUInt32LE(samples * 2, 40);
  for (let i = 0; i < samples; i++) wav.writeInt16LE(Math.round(1900 * Math.sin(2 * Math.PI * frequency * i / rate)), 44 + 2 * i);
  return wav;
}

const objects = new Map();
const today = Date.now();
function recording(index, overrides = {}) {
  const bytes = tone(220 + index * 3);
  const file = `${createHash("sha256").update(bytes).digest("hex")}.wav`;
  objects.set(file, bytes);
  return {
    id: `isrc:USTST${String(index).padStart(7, "0")}`,
    title: `Fixture Recording ${index}`,
    artist: `Fixture Performer ${index}`,
    style: "full_on_night",
    bpm: 150,
    previewPath: `/api/authorized-audio?file=${file}`,
    availableFrom: new Date(today - 3600000).toISOString(),
    expiresAt: new Date(today + 3600000).toISOString(),
    ...overrides
  };
}

const manifest = { version: 1, mode: "authorized-previews", recordings: [
  ...Array.from({ length: 20 }, (_, index) => recording(index + 1)),
  recording(21, { style: "french_house", bpm: 125 }),
  recording(22, { bpm: 156 }),
  recording(23, { expiresAt: new Date(today - 1).toISOString() }),
  recording(24, { availableFrom: new Date(today + 900000).toISOString() })
] };
manifest.recordings[0].bpm = 145;
manifest.recordings[1].bpm = 155;

const env = { VERCEL_ENV: "preview", SUPABASE_URL: "https://test.supabase.co", SUPABASE_SERVICE_ROLE_KEY: "test-only" };
const storage = async (url, options) => {
  if (url.pathname === "/storage/v1/bucket/authorized-web-previews") {
    return Response.json({ id: "authorized-web-previews", public: false });
  }
  const bytes = objects.get(url.pathname.split("/").at(-1));
  if (!bytes) return new Response(null, { status: 404 });
  return new Response(options.method === "HEAD" ? null : bytes, { headers: { "Content-Length": String(bytes.length) } });
};
const catalogHandler = catalogApi.createHandler({ manifest, env, fetcher: storage });
const audioHandler = audioApi.createHandler({ manifest, env, fetcher: storage });
const server = createServer((req, res) => {
  const handler = req.url.startsWith("/api/authorized-catalog") ? catalogHandler : audioHandler;
  void handler(req, res).catch(() => res.writeHead(500).end());
});
let preview;
let requests = 0;

try {
  await new Promise(resolve => server.listen(0, "127.0.0.1", resolve));
  const apiUrl = `http://127.0.0.1:${server.address().port}`;
  preview = await startTestPreviewServer();
  const context = await browser.newContext({
    ...playwright.devices[engine === "webkit" ? "iPhone 13" : "Pixel 7"],
    locale: "pt-BR", reducedMotion: "reduce"
  });
  await context.route("**/*", async route => {
    const url = new URL(route.request().url());
    if (url.origin !== preview.baseUrl) return route.abort();
    if (url.pathname.startsWith("/api/authorized-")) {
      if (url.pathname === "/api/authorized-catalog") requests++;
      const range = route.request().headers().range;
      const response = await fetch(apiUrl + url.pathname + url.search, {
        method: route.request().method(),
        headers: range ? { range } : {}
      });
      return route.fulfill({
        status: response.status,
        headers: Object.fromEntries(response.headers),
        body: Buffer.from(await response.arrayBuffer())
      });
    }
    if (url.pathname.startsWith("/api/")) {
      return route.fulfill({ json: { ok: true, enabled: false, items: [], tracks: [] } });
    }
    return route.continue();
  });

  const page = await context.newPage();
  const errors = [];
  page.on("pageerror", error => errors.push(error.message));
  const tap = selector => page.locator(selector).tap({ timeout: 15000 });
  async function open(pilot) {
    await page.goto(preview.baseUrl + (pilot ? "/?authorizedPreview=1" : "/"), { waitUntil: "domcontentloaded" });
    for (const selector of ["#privacyEssentialBtn", "#languageScreen [data-lang=pt]", "#authGuestBtn", "#usageGuideContinueBtn", "#startBtn", "#tasteCalibrationSkipBtn"]) {
      if (await page.locator(selector).isVisible()) await tap(selector);
    }
    await page.locator("#topSwipeSurpriseBtn").waitFor();
    if (pilot) {
      await page.waitForFunction(() => authorizedPreviewTracks.length > 0, null, { timeout: 8000 }).catch(async error => {
        throw new Error(`Pilot catalog did not load (${requests} requests): ${errors.join("; ")}`, { cause: error });
      });
    }
  }
  async function setFilters() {
    if (!(await page.locator("#style").isVisible())) {
      if (!(await page.locator("#precisionFiltersSummary").isVisible())) await tap("#discoverFiltersBtn");
      await tap("#precisionFiltersSummary");
    }
    await page.locator("#style").selectOption("full_on_night");
    await page.locator("#bpm").selectOption("145-155");
  }
  async function hear(selector, previousId) {
    await tap(selector);
    await page.waitForFunction(id => currentRecommendation?.source === "authorized_web_preview" &&
      currentRecommendation.recordingId !== id && hasConfirmedRecommendationListening(currentRecommendation), previousId, { timeout: 8000 })
      .catch(async error => {
        const state = await page.evaluate(() => ({ id: currentRecommendation?.recordingId, style: currentRecommendation?.style,
          source: currentRecommendation?.source, src: trackPreview.getAttribute("src"),
          time: trackPreview.currentTime, paused: trackPreview.paused, status: previewStatus.textContent, prefs: lastPrefs,
          manual: prefsFromManualControls(), canUse: canUseMusicDiscovery(), busy: recommendationRunBusy, notice: feedbackMessage.textContent,
          candidates: authorizedPreviewTracks.length, eligible: authorizedPreviewTracks.filter(isTrackEligibleForRecommendation).length,
          pick: pickAuthorizedPreviewTrack(prefsFromManualControls())?.recordingId }));
        throw new Error(`No audible advance for ${selector} after ${previousId}: ${JSON.stringify(state)} ${errors.join("; ")}`, { cause: error });
      });
    return await page.evaluate(() => ({
      id: currentRecommendation.recordingId,
      song: currentRecommendation.song,
      artist: currentRecommendation.artist,
      style: currentRecommendation.style,
      bpm: currentRecommendation.bpmExact
    }));
  }

  await open(false);
  assert.equal(requests, 0, "Ordinary visits must not fetch the pilot catalog");
  await open(true);
  await setFilters();
  const heard = [];
  for (let index = 0; index < 20; index++) {
    if (index === 10) {
      const alreadyHeard = manifest.recordings.find(row => row.id === heard[0].id);
      alreadyHeard.title = "Alternate Title";
      alreadyHeard.artist = "Alternate Credit";
      await open(true);
      await setFilters();
    }
    const selector = index === 0 || index === 10 ? "#recommendBtn" : index === 2 ? "#topSwipeLikeBtn"
      : index === 3 ? "#topSwipePassBtn" : "#topSwipeSurpriseBtn";
    const track = await hear(selector, heard.at(-1)?.id || "");
    assert.equal(track.style, "full_on_night");
    assert.ok(track.bpm >= 145 && track.bpm <= 155);
    heard.push(track);
  }
  assert.equal(new Set(heard.map(track => track.id)).size, 20);
  assert.equal(new Set(heard.map(track => track.artist)).size, 20);
  assert.ok(heard.some(track => track.bpm === 145) && heard.some(track => track.bpm === 155));
  const liked = await page.evaluate(id => likedTrackHistory.find(entry => entry.recordingId === id), heard[1].id);
  assert.equal(liked?.song, heard[1].song, "The existing library must keep the exact recording ID");
  const next = await page.evaluate(() => pickAuthorizedPreviewTrack({ style: "full_on_night", bpm: "145-155" }));
  assert.equal(next, null, "Exhaustion must preserve the range and recording history");

  const failed = recording(25);
  manifest.recordings.push(failed);
  objects.delete(new URL(failed.previewPath, preview.baseUrl).searchParams.get("file"));
  await open(true);
  await setFilters();
  await tap("#recommendBtn");
  await page.waitForFunction(id => currentRecommendation?.recordingId === id && !authorizedPreviewUrl(currentRecommendation) &&
    !trackPreview.getAttribute("src") && previewPlayBtn.disabled, failed.id);
  assert.ok(await page.evaluate(id => !dislikedTrackHistory.some(entry => entry.recordingId === id), failed.id),
    "A missing asset must leave preferences untouched");
  const afterFailure = await page.evaluate(() => pickAuthorizedPreviewTrack({ style: "full_on_night", bpm: "145-155" }));
  assert.equal(afterFailure, null);
  console.log(JSON.stringify({ engine, heard: heard.length, uniqueArtists: 20, uniqueRecordings: 20, visits: 2,
    likedRecordingInLibrary: true, failedAssetExcluded: true, optIn: true }));
} finally {
  await browser.close();
  await preview?.stop();
  server.close();
}
