import assert from "node:assert/strict";
import { startTestPreviewServer } from "./test-preview-server.mjs";

const { chromium } = await import(process.env.SONIC_PLAYWRIGHT_MODULE || "playwright");
const preview = await startTestPreviewServer();
const browser = await chromium.launch({
  executablePath: "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome",
  headless: true
});

try {
  const page = await browser.newPage({
    viewport: { width: 393, height: 852 },
    reducedMotion: "reduce",
    hasTouch: true,
    isMobile: true
  });
  const errors = [];
  page.on("pageerror", (error) => errors.push(error.message));
  await page.route("**/api/**", (route) => route.fulfill({
    status: 200,
    contentType: "application/json",
    body: JSON.stringify({ ok: true, enabled: false, tracks: [], count: 0 })
  }));

  await page.goto(`${preview.baseUrl}/?qa=1&lang=pt&recommendation=0`, {
    waitUntil: "domcontentloaded"
  });
  await page.locator("#showUsageGuideBtn").waitFor({ state: "visible" });
  await page.locator(".daily-radar-upgrade, .daily-radar-toggle").first().waitFor({ state: "visible" });
  await page.locator("#discoverFiltersBtn").waitFor({ state: "visible" });
  await page.locator("#topSwipeSurpriseBtn").waitFor({ state: "visible" });

  for (const viewport of [
    { width: 320, height: 740 },
    { width: 375, height: 812 },
    { width: 393, height: 852 },
    { width: 430, height: 932 },
    { width: 852, height: 393 }
  ]) {
    await page.setViewportSize(viewport);
    const metrics = await page.evaluate(() => {
      const rect = (selector) => {
        const node = document.querySelector(selector);
        const box = node.getBoundingClientRect();
        const style = getComputedStyle(node);
        return {
          x: box.x, y: box.y, width: box.width, height: box.height,
          display: style.display, alignItems: style.alignItems,
          justifyContent: style.justifyContent
        };
      };
      return {
        help: rect("#showUsageGuideBtn"),
        audio: rect("#audioToggleBtn"),
        logo: rect("#heroLogoBtn"),
        heroCopy: rect(".hero-brand > div"),
        hero: rect(".hero"),
        menu: rect("#appMenuBtn"),
        premiumAction: rect(".daily-radar-upgrade, .daily-radar-toggle"),
        discoveryAction: rect("#discoverFiltersBtn"),
        listenAction: rect("#topSwipeSurpriseBtn"),
        bodyWidth: document.body.getBoundingClientRect().width,
        scrollWidth: document.documentElement.scrollWidth
      };
    });
    assert.ok(metrics.help.height >= 44 && metrics.audio.height >= 44, JSON.stringify({ viewport, metrics }));
    if (viewport.width <= 780) {
      assert.equal(metrics.help.display, "flex", JSON.stringify({ viewport, metrics }));
      assert.equal(metrics.audio.display, "flex", JSON.stringify({ viewport, metrics }));
      assert.equal(metrics.help.alignItems, "center", JSON.stringify({ viewport, metrics }));
      assert.equal(metrics.audio.alignItems, "center", JSON.stringify({ viewport, metrics }));
      assert.equal(metrics.help.justifyContent, "center", JSON.stringify({ viewport, metrics }));
      assert.equal(metrics.audio.justifyContent, "center", JSON.stringify({ viewport, metrics }));
      assert.ok(Math.abs(metrics.help.width - metrics.audio.width) <= 1, JSON.stringify({ viewport, metrics }));
      assert.ok(Math.abs(metrics.help.y - metrics.audio.y) <= 1, JSON.stringify({ viewport, metrics }));
      assert.ok(Math.abs(metrics.help.height - metrics.audio.height) <= 1, JSON.stringify({ viewport, metrics }));
      assert.ok(Math.abs((metrics.logo.x + metrics.logo.width / 2) - (metrics.help.x + metrics.help.width / 2)) <= 1, JSON.stringify({ viewport, metrics }));
      assert.ok(Math.abs(metrics.heroCopy.x - metrics.audio.x) <= 1, JSON.stringify({ viewport, metrics }));
      assert.ok(Math.abs((metrics.heroCopy.x + metrics.heroCopy.width) - (metrics.audio.x + metrics.audio.width)) <= 1, JSON.stringify({ viewport, metrics }));
      assert.ok(Math.abs(metrics.hero.x - metrics.menu.x) <= 1, JSON.stringify({ viewport, metrics }));
      assert.ok(Math.abs((metrics.hero.x + metrics.hero.width) - (metrics.menu.x + metrics.menu.width)) <= 1, JSON.stringify({ viewport, metrics }));
      for (const action of [metrics.premiumAction, metrics.discoveryAction, metrics.listenAction]) {
        assert.ok(Math.abs(metrics.help.x - action.x) <= 1, JSON.stringify({ viewport, metrics }));
        assert.ok(Math.abs((metrics.audio.x + metrics.audio.width) - (action.x + action.width)) <= 1, JSON.stringify({ viewport, metrics }));
      }
    }
    assert.ok(metrics.scrollWidth <= Math.ceil(metrics.bodyWidth) + 1, JSON.stringify({ viewport, metrics }));
  }

  await page.setViewportSize({ width: 320, height: 740 });
  for (const language of ["pt", "en", "es"]) {
    await page.evaluate((nextLanguage) => {
      localStorage.setItem("neonpulse:language:v1", nextLanguage);
    }, language);
    await page.reload({ waitUntil: "domcontentloaded" });
    await page.locator("#showUsageGuideBtn").waitFor({ state: "visible" });
    const localized = await page.evaluate(() => {
      const help = document.querySelector("#showUsageGuideBtn").getBoundingClientRect();
      const audio = document.querySelector("#audioToggleBtn").getBoundingClientRect();
      return {
        helpWidth: help.width,
        audioWidth: audio.width,
        helpHeight: help.height,
        audioHeight: audio.height,
        scrollWidth: document.documentElement.scrollWidth,
        viewportWidth: document.documentElement.clientWidth
      };
    });
    assert.ok(Math.abs(localized.helpWidth - localized.audioWidth) <= 1, JSON.stringify({ language, localized }));
    assert.ok(Math.abs(localized.helpHeight - localized.audioHeight) <= 1, JSON.stringify({ language, localized }));
    assert.ok(localized.helpHeight >= 44 && localized.scrollWidth <= localized.viewportWidth + 1, JSON.stringify({ language, localized }));
  }

  await page.setViewportSize({ width: 375, height: 812 });
  await page.evaluate(() => localStorage.setItem("neonpulse:language:v1", "pt"));
  await page.reload({ waitUntil: "domcontentloaded" });
  await page.locator(".daily-radar-visibility").waitFor({ state: "visible" });
  const expanded = await page.evaluate(() => {
    const audio = document.querySelector("#audioToggleBtn").getBoundingClientRect();
    const button = document.querySelector(".daily-radar-visibility");
    const control = button.getBoundingClientRect();
    const icon = button.querySelector(".daily-radar-visibility-icon").getBoundingClientRect();
    return {
      railRight: audio.right,
      controlHeight: control.height,
      iconRight: icon.right,
      controlCenterY: control.top + control.height / 2,
      iconCenterY: icon.top + icon.height / 2
    };
  });
  await page.evaluate(() => localStorage.setItem("sonic:dailyRadarCollapsed:v1", "collapsed"));
  await page.reload({ waitUntil: "domcontentloaded" });
  await page.locator(".daily-radar-visibility").waitFor({ state: "visible" });
  const collapsed = await page.evaluate(() => {
    const audio = document.querySelector("#audioToggleBtn").getBoundingClientRect();
    const panel = document.querySelector("#dailyRadarPanel").getBoundingClientRect();
    const button = document.querySelector(".daily-radar-visibility");
    const control = button.getBoundingClientRect();
    const icon = button.querySelector(".daily-radar-visibility-icon").getBoundingClientRect();
    const label = button.querySelector("span:not(.daily-radar-visibility-icon)").getBoundingClientRect();
    return {
      railRight: audio.right,
      panelRight: panel.right,
      controlRight: control.right,
      controlHeight: control.height,
      controlCenterY: control.top + control.height / 2,
      iconCenterY: icon.top + icon.height / 2,
      iconLeft: icon.left,
      iconRight: icon.right,
      labelRight: label.right,
      paddingRight: parseFloat(getComputedStyle(button).paddingRight)
    };
  });
  assert.ok(Math.abs(expanded.iconRight - expanded.railRight) <= 1, JSON.stringify(expanded));
  assert.ok(Math.abs(collapsed.iconRight - collapsed.railRight) <= 1, JSON.stringify(collapsed));
  assert.ok(Math.abs(collapsed.controlCenterY - collapsed.iconCenterY) <= 1, JSON.stringify(collapsed));
  assert.ok(Math.abs(expanded.controlCenterY - expanded.iconCenterY) <= 1, JSON.stringify(expanded));
  assert.ok(Math.abs(expanded.iconRight - collapsed.iconRight) <= 1, JSON.stringify({ expanded, collapsed }));
  assert.ok(collapsed.labelRight < collapsed.iconLeft, JSON.stringify(collapsed));
  assert.ok(expanded.controlHeight >= 44 && collapsed.controlHeight >= 44 && collapsed.paddingRight >= 7, JSON.stringify({ expanded, collapsed }));
  assert.deepEqual(errors, []);
  console.log("Mobile controls aligned: equal hero actions, centered content, 44px touch targets and a stable Premium toggle.");
} finally {
  await browser.close();
  await preview.stop();
}
