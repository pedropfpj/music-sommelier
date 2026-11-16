import assert from "node:assert/strict";
import { fileURLToPath } from "node:url";
import { startTestPreviewServer } from "./test-preview-server.mjs";
const engines = await import(process.env.SONIC_PLAYWRIGHT_MODULE || "playwright");
const engine = process.env.SONIC_BROWSER_ENGINE || "chromium";
const preview = await startTestPreviewServer();
const browser = await engines[engine].launch({ headless: true, ...(engine === "chromium" && process.env.SONIC_CHROMIUM_EXECUTABLE ? { executablePath: process.env.SONIC_CHROMIUM_EXECUTABLE } : {}) });
try {
  const page = await browser.newPage({ viewport: { width: 393, height: 852 }, reducedMotion: "reduce" });
  const errors = []; page.on("pageerror", e => errors.push(e.message));
  await page.route("**/api/**", r => r.fulfill({ json: { ok: true, enabled: false, tracks: [], count: 0 } }));
  await page.clock.setFixedTime(new Date("2026-09-30T18:00:00Z"));
  let loads = 0, failOnce = true;
  await page.route("**/data/weekly-catalog-v1.json*", r => { loads++; return failOnce ? (failOnce = false, r.fulfill({ status: 503, body: "unavailable" })) : r.continue(); });
  await page.goto(`${preview.baseUrl}/?qa=1&lang=pt&screenshot=1&recommendation=0`, { waitUntil: "domcontentloaded" });
  await page.waitForFunction(() => typeof weeklyRecommendsController !== "undefined" && weeklyRecommendsController);
  const essential = page.getByRole("button", { name: "Só essenciais", exact: true });
  if (await essential.isVisible()) await essential.click();
  assert.equal(loads, 0, "Weekly data must not slow down the first discovery");
  assert.equal(await page.locator("#weeklyTeaserKicker").textContent(), "TODA SEMANA");
  await page.locator("#weeklyTeaserButton").click();
  const root = page.locator("#weeklyRecommendsPanel");
  await root.getByText("Não foi possível carregar a seleção. Tente novamente.").waitFor();
  await page.locator("#weeklyRetry").click();
  await page.waitForFunction(() => document.querySelectorAll(".weekly-track").length === 6);
  assert.equal(await root.locator(".weekly-headline").innerText(), "Novos sons.\nToda semana.");
  assert.equal(loads, 2);
  assert.equal(await page.locator("#weeklyStyleSelect option").count(), 171);
  assert.equal(await page.locator("[data-primary-app-tab][aria-current=page]").getAttribute("data-app-tab-target"), "discover");
  const original = await root.locator(".weekly-track").evaluateAll(es => es.map(e => e.dataset.weeklyTrack));
  await page.locator("#weeklyPrev").click();
  assert.notDeepEqual(await root.locator(".weekly-track").evaluateAll(es => es.map(e => e.dataset.weeklyTrack)), original);
  await page.locator("#weeklyNext").click();
  assert.deepEqual(await root.locator(".weekly-track").evaluateAll(es => es.map(e => e.dataset.weeklyTrack)), original);
  assert.ok(await page.locator("#weeklyNext").isDisabled());
  for (const style of ["techno", "deep_house", "psycore", "ambient", "brazilian_funk"]) {
    await page.selectOption("#weeklyStyleSelect", style);
    assert.ok((await root.locator(".weekly-track").evaluateAll(es => es.map(e => e.dataset.weeklyTrack))).every(id => id.startsWith(`${style}:`)));
  }
  await page.selectOption("#weeklyStyleSelect", "psy-radar");
  assert.ok(await page.locator("#weeklyPrev").isDisabled());
  assert.equal(await root.locator('a[href*="bandcamp.com/track/"]').count(), 6);
  await root.getByText("Scanner Darkly", { exact: true }).waitFor();
  for (const viewport of [{ width: 320, height: 740 }, { width: 393, height: 852 }, { width: 852, height: 393 }, { width: 1440, height: 1000 }]) {
    await page.setViewportSize(viewport);
    await root.scrollIntoViewIfNeeded();
    const metrics = await root.evaluate(r => ({ width: r.getBoundingClientRect().width, scrollWidth: r.scrollWidth,
      controls: [...r.querySelectorAll("button,select,a")].filter(e => e.getBoundingClientRect().height).map(e => ({ tag: e.tagName, height: e.getBoundingClientRect().height })) }));
    assert.ok(metrics.scrollWidth <= Math.ceil(metrics.width) + 1, `No overflow at ${viewport.width}: ${JSON.stringify(metrics)}`);
    assert.ok(metrics.controls.every(c => c.height >= 44), JSON.stringify(metrics.controls));
    await root.screenshot({ path: fileURLToPath(new URL(`../reports/ui-weekly-recommends-${viewport.width}-latest.png`, import.meta.url)) });
  }
  await page.evaluate(() => setLanguage("en"));
  assert.equal(await page.locator("#weeklyRecommendsTitle").textContent(), "SonicSearch Recommends");
  assert.equal(await root.locator(".weekly-headline").innerText(), "New sounds.\nEvery week.");
  assert.equal(await page.locator("#weeklyTeaserKicker").textContent(), "EVERY WEEK");
  assert.equal(await page.locator("#weeklyStyleSelect").inputValue(), "psy-radar");
  await page.evaluate(() => setLanguage("es"));
  assert.equal(await page.locator("#weeklyRecommendsTitle").textContent(), "SonicSearch Recomienda");
  assert.equal(await root.locator(".weekly-headline").innerText(), "Nuevos sonidos.\nCada semana.");
  assert.equal(await page.locator("#weeklyTeaserKicker").textContent(), "CADA SEMANA");
  await page.evaluate(() => setLanguage("pt"));
  await page.evaluate(() => {
    Object.defineProperty(navigator, "share", { configurable: true, value: undefined });
    Object.defineProperty(navigator, "clipboard", { configurable: true, value: { writeText: async () => { throw new Error("blocked"); } } });
  });
  await page.locator("#weeklyShare").click();
  assert.ok(await page.locator("#weeklyCopyText").isVisible());
  const shared = await page.locator("#weeklyCopyText").inputValue();
  assert.ok(shared.includes("edition=2026-09-16") && shared.includes("weeklyStyle=psy-radar"));
  const sharedUrl = shared.split("\n").at(-1).replace("https://sonicsearch.app", preview.baseUrl);
  const recipient = await browser.newPage({ viewport: { width: 1440, height: 1000 }, reducedMotion: "reduce" });
  recipient.on("pageerror", e => errors.push(e.message));
  await recipient.route("**/api/**", r => r.fulfill({ json: { ok: true, enabled: false, tracks: [], count: 0 } }));
  await recipient.goto(`${sharedUrl}&qa=1&lang=pt&screenshot=1&recommendation=0`, { waitUntil: "domcontentloaded" });
  await recipient.locator("#weeklyRecommendsPanel").getByText("Scanner Darkly", { exact: true }).waitFor();
  assert.equal(await recipient.locator("#weeklyStyleSelect").inputValue(), "psy-radar");
  await page.locator("#weeklyBack").click();
  assert.ok(await page.locator("#weeklyTeaserButton").isVisible());
  const menu = page.locator("#appMenuBtn");
  if (await menu.isVisible()) await menu.click();
  await page.locator('[data-app-tab-target="profile"]').click();
  await page.locator("#profileMoreBtn").click();
  assert.equal(await page.locator("#moreRecommendsDescription").textContent(), "Uma nova seleção de faixas a cada semana.");
  await page.locator('[data-more-tab-target="recommends"]').click();
  assert.ok(await root.isVisible());
  assert.deepEqual(errors, []);
  console.log(`Weekly UI passed on ${engine}: lazy loading, retry, six tracks, 169 styles, archive, PT/EN/ES cadence, 320/393/852/1440 layouts, touch targets, sharing fallback/deep link, Discover and Profile → More routes.`);
} finally { await browser.close(); await preview.stop(); }
