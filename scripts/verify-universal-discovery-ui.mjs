#!/usr/bin/env node
import assert from "node:assert/strict";
import fs from "node:fs/promises";
import { fileURLToPath } from "node:url";
import { startTestPreviewServer } from "./test-preview-server.mjs";
const { chromium } = await import(process.env.SONIC_PLAYWRIGHT_MODULE || "playwright");
const preview = await startTestPreviewServer();
const browser = await chromium.launch({ executablePath: "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome", headless: true,
  args: ["--autoplay-policy=no-user-gesture-required"] });
try {
  const page = await browser.newPage({ viewport: { width: 375, height: 812 }, reducedMotion: "reduce" });
  const errors = []; page.on("pageerror", e => errors.push(e.message));
  await page.route("**/api/**", r => r.fulfill({ json: { ok: true, enabled: false, tracks: [], count: 0 } }));
  await page.addInitScript(() => {
    localStorage.setItem("neonpulse_privacy_consent_v1", "essential");
    window.YT = { Player: class MockPlayer {
      constructor(mount, options) { this.options = options; this.iframe = document.createElement("iframe"); mount.replaceWith(this.iframe); window.__uPlayer = this; setTimeout(() => options.events.onReady({ target: this }), 30); }
      getIframe() { return this.iframe; } playVideo() { this.options.events.onStateChange({ target: this, data: 1 }); }
      pauseVideo() { this.options.events.onStateChange({ target: this, data: 2 }); } destroy() { this.iframe.remove(); }
    } };
  });
  await page.goto(`${preview.baseUrl}/?qa=1&lang=pt&screenshot=1&recommendation=0&universalPreview=1`, { waitUntil: "domcontentloaded" });
  await page.waitForSelector("#universalGenreSelect");
  // Consent still follows the existing essential-only action if its banner is present.
  const essential = page.getByRole("button", { name: "Só essenciais", exact: true });
  if (await essential.isVisible()) await essential.click();
  const root = page.locator("#universalDiscoveryPanel");
  assert.ok(await root.isVisible());
  assert.ok(await page.locator("#universalGenreSelect option").count() >= 14);
  assert.equal(await root.locator("iframe").count(), 0);
  await page.selectOption("#universalGenreSelect", "reggae");
  await root.getByRole("button", { name: "Ouvir no player", exact: true }).click();
  await root.getByText("Reproduzindo no YouTube.", { exact: true }).waitFor();
  assert.equal(await root.locator("iframe").count(), 1);
  const key = await root.locator(".universal-track-card").getAttribute("data-track-key");
  await root.getByRole("button", { name: "Curti", exact: true }).click();
  assert.notEqual(await root.locator(".universal-track-card").getAttribute("data-track-key"), key);
  assert.equal(await root.locator("iframe").count(), 0);
  await root.locator("summary").first().click();
  assert.ok(await root.locator("details").first().locator("li").count() === 1);
  await page.selectOption("#universalExperienceSelect", "expert");
  await page.selectOption("#universalGenreSelect", "classical");
  assert.equal(await page.locator("#universalExperienceSelect").inputValue(), "beginner");
  await page.selectOption("#universalGenreSelect", "reggae");
  assert.equal(await page.locator("#universalExperienceSelect").inputValue(), "expert");
  const saved = await page.evaluate(() => Object.keys(localStorage).filter(k => k.startsWith("sonic_search:universalDiscoveryPreview:v1:")));
  assert.equal(saved.length, 1, "Preview reactions have their own profile-scoped storage");
  const persisted = await page.evaluate(storageKey => JSON.parse(localStorage.getItem(storageKey)), saved[0]);
  assert.equal(persisted.version, 2);
  assert.ok(persisted.deliveries.length >= 3, "Rendered deliveries are stored separately from feedback");
  assert.equal(persisted.history.length, 1, "Next/style changes cannot invent dislikes");
  await page.evaluate(() => activateUserSession({ mode: "login", username: "Independent preview profile" }));
  assert.equal(await root.locator("details").first().locator("li").count(), 0, "Do not leak another profile's reactions");
  await page.selectOption("#universalGenreSelect", "reggae");
  await page.locator("#universalGenreSelect").focus();
  for (const viewport of [{ width: 375, height: 812 }, { width: 852, height: 393 }, { width: 1440, height: 960 }]) {
    await page.setViewportSize(viewport);
    await root.scrollIntoViewIfNeeded();
    const metrics = await root.evaluate(r => ({ width: r.getBoundingClientRect().width, scrollWidth: r.scrollWidth,
      controls: [...r.querySelectorAll("button,select,summary")].filter(e => e.getBoundingClientRect().height).map(e => e.getBoundingClientRect().height) }));
    assert.ok(metrics.scrollWidth <= Math.ceil(metrics.width) + 1, "No component horizontal overflow");
    assert.ok(metrics.controls.every(h => h >= 44));
    await root.screenshot({ path: fileURLToPath(new URL(`../reports/ui-universal-discovery-${viewport.width}-latest.png`, import.meta.url)) });
  }
  await page.setViewportSize({ width: 375, height: 812 }); await page.addStyleTag({ content: "#universalDiscoveryPanel { font-size: 24px; }" });
  assert.ok(await root.evaluate(r => r.scrollWidth <= Math.ceil(r.getBoundingClientRect().width) + 1));
  // Native bridge dispatch is separate from actual device playback validation.
  await page.evaluate(() => { window.__nativePreview = []; window.Capacitor = { getPlatform: () => "ios", Plugins: { YouTubePlayer: { open: async data => window.__nativePreview.push(data) } } }; });
  await root.getByRole("button", { name: "Ouvir no player", exact: true }).click();
  await page.waitForFunction(() => window.__nativePreview.length === 1);
  assert.equal(await root.locator("iframe").count(), 0);
  assert.deepEqual(errors, []);
  const normal = await browser.newPage(); await normal.route("**/api/**", r => r.fulfill({ json: { ok: true, enabled: false } }));
  await normal.goto(`${preview.baseUrl}/?qa=1&lang=pt&screenshot=1&recommendation=0`, { waitUntil: "domcontentloaded" });
  await normal.waitForFunction(() => typeof window.stopAllActivePlayback === "function");
  assert.equal(await normal.locator("#universalGenreSelect").count(), 0, "Default app cannot enable unreviewed genres");
  // Reload in a separate profile/page must retain exposure, not render the
  // previous recording again. Stubs check policy; actual provider checks differ.
  const beforeReload = await root.locator(".universal-track-card").getAttribute("data-track-key");
  await page.reload({ waitUntil: "domcontentloaded" });
  await page.waitForSelector("#universalGenreSelect");
  assert.notEqual(await root.locator(".universal-track-card").getAttribute("data-track-key"), beforeReload);
  assert.deepEqual(errors, []);
  if (process.argv.includes("--provider-smoke") || process.argv.includes("--discovery-smoke")) {
    const discoverySmoke = process.argv.includes("--discovery-smoke");
    const actual = await browser.newPage({ viewport: { width: 393, height: 852 } });
    await actual.route("**/api/**", r => r.fulfill({ json: { ok: true, enabled: false, tracks: [], count: 0 } }));
    await actual.goto(`${preview.baseUrl}/?qa=1&lang=pt&screenshot=1&recommendation=0&universalPreview=1`, { waitUntil: "domcontentloaded" });
    await actual.waitForSelector("#universalGenreSelect");
    const panel = actual.locator("#universalDiscoveryPanel"), results = [];
    for (const group of discoverySmoke ? ["indie", "rap", "reggae", "soul", "pop", "ambient", "forro"] : ["rock", "indie", "rap", "trap", "reggae"]) {
      await actual.selectOption("#universalGenreSelect", group);
      if (discoverySmoke) await actual.selectOption("#universalExperienceSelect", "expert");
      const artist = await panel.locator(".universal-track-card").getAttribute("data-artist");
      await panel.getByRole("button", { name: "Ouvir no player", exact: true }).click();
      let played = false;
      try { await panel.getByText("Reproduzindo no YouTube.", { exact: true }).waitFor({ timeout: 22000 }); played = true; }
      catch (_) { /* A provider failure is not treated as a successful UI/metadata check. */ }
      const result = { group, artist, experience: discoverySmoke ? "expert" : "beginner", playedStateObserved: played,
        status: await panel.locator(".universal-player [role=status]").textContent(),
        environment: "real provider in main webapp; not physical iPhone/all territories" };
      results.push(result); console.log(JSON.stringify(result));
      await panel.getByRole("button", { name: "Fechar player", exact: true }).click();
    }
    await fs.writeFile(new URL(discoverySmoke ? "../reports/universal-discovery-expert-provider-ui-latest.json" : "../reports/universal-discovery-provider-ui-latest.json", import.meta.url), `${JSON.stringify({ checkedAt: new Date().toISOString(), results }, null, 2)}\n`);
    await actual.close();
    assert.ok(results.every(r => r.playedStateObserved), "Every requested style must reach real provider playback in the main webapp");
  }
  console.log("Universal main app UI passed: main Discover entry, source gating, editable reactions/next card, per-group experience, profile isolation, mobile/landscape/desktop layout, reduced motion, large text, mocked iOS dispatch and default-disabled rollout.");
} finally { await browser.close(); await preview.stop(); }
