#!/usr/bin/env node
import assert from "node:assert/strict";
import fs from "node:fs/promises";
import { fileURLToPath } from "node:url";
import { startTestPreviewServer } from "./test-preview-server.mjs";
const { chromium } = await import(process.env.SONIC_PLAYWRIGHT_MODULE || "playwright");
const preview = await startTestPreviewServer();
const browser = await chromium.launch({ executablePath: "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome", headless: true,
  args: ["--autoplay-policy=no-user-gesture-required"] });
const root = new URL("../", import.meta.url);
const reports = [];
try {
  const page = await browser.newPage({ viewport: { width: 375, height: 812 }, reducedMotion: "reduce" });
  await page.addInitScript(() => {
    window.__players = [];
    window.YT = { Player: class MockPlayer {
      constructor(mount, options) {
        this.options = options; this.destroyed = false;
        this.iframe = document.createElement("iframe"); mount.replaceWith(this.iframe);
        this.iframe.style.background = "#142a36";
        window.__players.push(this);
        setTimeout(() => options.events.onReady({ target: this }), 40);
      }
      getIframe() { return this.iframe; }
      playVideo() { this.options.events.onStateChange({ data: 1, target: this }); }
      pauseVideo() { this.options.events.onStateChange({ data: 2, target: this }); }
      destroy() { this.destroyed = true; this.iframe.remove(); }
    }};
  });
  await page.goto(`${preview.baseUrl}/listening-preview.html`);
  await page.waitForSelector("#genre-nav button");
  assert.ok(await page.locator("#genre-nav button").count() >= 9);
  assert.equal(await page.locator("#player-host iframe").count(), 0, "No provider player/contact before listener action");
  for (const genre of ["rock", "indie", "rap", "trap", "reggae", "reggaeton", "forro", "samba", "classical", "soul"]) {
    await page.locator(`[data-group="${genre}"]`).click();
    const count = await page.locator(".play-button").count(); assert.ok(count >= 1, `${genre} needs an actually playable example`);
    await page.locator(".play-button").first().click();
    await page.waitForFunction(() => document.getElementById("player-status").textContent.includes("Reproduzindo"));
    assert.equal(await page.locator("#player-host iframe").count(), 1);
    assert.equal(await page.locator("#provider-link").getAttribute("href").then(u => /^https:\/\/www.youtube.com\/watch\?v=/.test(u)), true);
    const rect = await page.locator("#player-host iframe").boundingBox(); assert.ok(rect.width >= 200 && rect.height >= 200);
    await page.locator("#stop-player").click();
    assert.equal(await page.locator("#player-host iframe").count(), 0);
    await page.selectOption("#experience", "expert");
    reports.push({ genre, visibleTracks: count, mockedPlayerLifecycle: "passed" });
  }
  // Sonic expertise in one genre must not carry into the next.
  await page.locator('[data-group="reggaeton"]').click();
  await page.selectOption("#experience", "beginner");
  await page.locator('[data-group="classical"]').click();
  assert.equal(await page.locator("#experience").inputValue(), "expert");
  await page.locator(".play-button").first().click();
  await page.waitForFunction(() => document.getElementById("player-status").textContent.includes("Reproduzindo"));
  await page.evaluate(() => window.__players.at(-1).options.events.onError({ data: 150 }));
  assert.match(await page.locator("#player-status").textContent(), /código 150/);
  await page.locator('[data-group="samba"]').click();
  await page.evaluate(() => window.__players.at(-1).options.events.onStateChange({ data: 1, target: window.__players.at(-1) }));
  assert.equal(await page.locator("#player-section").isVisible(), false, "Stale provider callbacks cannot revive a stopped player");
  for (const size of [{ width: 375, height: 812 }, { width: 852, height: 393 }, { width: 1440, height: 960 }]) {
    await page.setViewportSize(size);
    await page.selectOption("#experience", "expert");
    const metrics = await page.evaluate(() => ({ width: innerWidth, documentWidth: document.documentElement.scrollWidth,
      buttons: [...document.querySelectorAll("button")].filter(e => e.offsetHeight).map(e => e.getBoundingClientRect().height) }));
    assert.ok(metrics.documentWidth <= metrics.width, `Horizontal overflow at ${size.width}`);
    assert.ok(metrics.buttons.every(h => h >= 44));
    await page.screenshot({ path: fileURLToPath(new URL(`reports/ui-listening-${size.width}-latest.png`, root)), fullPage: true });
  }
  await page.setViewportSize({ width: 375, height: 812 });
  await page.addStyleTag({ content: ":root { font-size: 24px; }" });
  assert.ok(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth), "Large text must fit mobile width");
  await page.close();

  const native = await browser.newPage();
  await native.addInitScript(() => {
    window.__nativeCalls = [];
    window.Capacitor = { getPlatform: () => "ios", Plugins: { YouTubePlayer: { open: async data => window.__nativeCalls.push(data) } } };
  });
  await native.goto(`${preview.baseUrl}/listening-preview.html?genre=classical`);
  await native.waitForSelector(".play-button");
  await native.locator(".play-button").first().click();
  await native.waitForFunction(() => window.__nativeCalls.length === 1);
  assert.equal(await native.locator("#player-host iframe").count(), 0, "iPhone must use the existing native player, not the referrer-broken web embed");
  reports.push({ nativeBridge: "mocked iOS dispatch passed; not a physical device playback test" });
  await native.close();

  if (process.argv.includes("--provider-smoke") || process.argv.includes("--all-provider-smoke")) {
    const actual = await browser.newPage({ viewport: { width: 393, height: 852 } });
    await actual.goto(`${preview.baseUrl}/listening-preview.html`);
    await actual.waitForSelector(".play-button");
    for (const genre of ["reggae", "reggaeton", "forro", "samba", "classical"]) {
      await actual.locator(`[data-group="${genre}"]`).click();
      const count = process.argv.includes("--all-provider-smoke") ? await actual.locator(".play-button").count() : 1;
      for (let index = 0; index < count; index += 1) {
        await actual.locator(".play-button").nth(index).click();
        try { await actual.waitForFunction(() => /Reproduzindo|código|Não foi possível/.test(document.getElementById("player-status").textContent), { timeout: 22000 }); }
        catch (_) { /* Report uncertainty rather than treating API metadata as successful playback. */ }
        reports.push({ genre, realProviderStatus: await actual.locator("#player-status").textContent(),
          url: await actual.locator("#provider-link").getAttribute("href"),
          title: await actual.locator("#playing-title").textContent() });
        await actual.screenshot({ path: fileURLToPath(new URL(`reports/ui-listening-provider-${genre}-latest.png`, root)) });
        console.log(JSON.stringify(reports.at(-1)));
        await actual.locator("#stop-player").click();
      }
    }
    await actual.close();
  }
  await fs.writeFile(new URL("reports/universal-listening-ui-latest.json", root), `${JSON.stringify({ checkedAt: new Date().toISOString(), reports }, null, 2)}\n`);
  console.log("Listening preview UI passed: 10 styles with playable examples, explicit playback, cleanup/stale callbacks, per-genre experience, mocked iOS dispatch and mobile/landscape/desktop layout. Real provider results, if requested, are reported separately and can fail.");
} finally { await browser.close(); await preview.stop(); }
