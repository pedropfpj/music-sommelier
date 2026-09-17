import assert from "node:assert/strict";
import { existsSync } from "node:fs";
import { startTestPreviewServer } from "./test-preview-server.mjs";

const { chromium, webkit } = await import(process.env.SONIC_PLAYWRIGHT_MODULE || "playwright");
const preview = await startTestPreviewServer({
  envName: "SONIC_PREMIUM_ICON_URL",
  staticRoot: process.env.SONIC_PREMIUM_ICON_ROOT || ""
});
const chromePath = "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome";

async function paintedSymbol(page, icon) {
  const png = await icon.screenshot();
  return page.evaluate(async (base64) => {
    const image = new Image();
    image.src = `data:image/png;base64,${base64}`;
    await image.decode();
    const canvas = document.createElement("canvas");
    canvas.width = image.width;
    canvas.height = image.height;
    const context = canvas.getContext("2d");
    context.drawImage(image, 0, 0);
    const { data } = context.getImageData(0, 0, canvas.width, canvas.height);
    let count = 0, xTotal = 0, yTotal = 0;
    let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;
    // Inspect the painted sign, excluding the circle border and its antialiasing.
    for (let y = Math.ceil(canvas.height * .2); y < canvas.height * .8; y++) {
      for (let x = Math.ceil(canvas.width * .2); x < canvas.width * .8; x++) {
        const offset = (y * canvas.width + x) * 4;
        if (data[offset + 1] < 150 || data[offset + 2] < 140) continue;
        count++; xTotal += x + .5; yTotal += y + .5;
        minX = Math.min(minX, x); maxX = Math.max(maxX, x);
        minY = Math.min(minY, y); maxY = Math.max(maxY, y);
      }
    }
    return {
      count, dx: xTotal / count - canvas.width / 2, dy: yTotal / count - canvas.height / 2,
      width: maxX - minX + 1, height: maxY - minY + 1
    };
  }, png.toString("base64"));
}

try {
  for (const engine of [chromium, webkit]) {
    const browser = await engine.launch({
      headless: true,
      ...(engine === chromium && existsSync(chromePath) ? { executablePath: chromePath } : {})
    });
    try {
      const page = await browser.newPage({
        viewport: { width: 393, height: 852 }, deviceScaleFactor: 2,
        isMobile: true, hasTouch: true, reducedMotion: "reduce"
      });
      const errors = [];
      page.on("pageerror", error => errors.push(error.message));
      if (preview.owned) await page.route("**/api/**", route => route.fulfill({
        json: { ok: true, enabled: false, tracks: [], count: 0 }
      }));
      await page.goto(`${preview.baseUrl}/?qa=1&lang=pt&recommendation=0`, { waitUntil: "domcontentloaded" });
      await page.waitForFunction(() => document.querySelector(".daily-radar-visibility"));
      const essential = page.getByRole("button", { name: "Só essenciais", exact: true });
      if (await essential.isVisible()) await essential.click();
      await page.evaluate(() => document.body.classList.remove("sonic-first-value-window"));
      const control = page.locator(".daily-radar-visibility");
      const icon = control.locator(".daily-radar-visibility-icon");
      for (const width of [320, 375, 393, 430, 852, 1280]) {
        await page.setViewportSize({ width, height: 852 });
        if (await control.getAttribute("aria-expanded") === "false") await control.click();
        let expandedRight;
        for (const expanded of [true, false]) {
          if (!expanded) await control.click();
          await control.scrollIntoViewIfNeeded();
          const box = await icon.boundingBox();
          const hit = await control.boundingBox();
          assert.ok(hit.width >= 44 && hit.height >= 44, "Touch target must remain at least 44px");
          if (expanded) expandedRight = box.x + box.width;
          else assert.ok(Math.abs(expandedRight - box.x - box.width) <= 1, "Circle must keep its horizontal alignment");
          const paint = await paintedSymbol(page, icon);
          const context = JSON.stringify({ engine: engine.name(), width, expanded, paint });
          assert.ok(paint.count > 0, context);
          assert.ok(Math.abs(paint.dx) <= 1 && Math.abs(paint.dy) <= 1, `Painted sign must be centered: ${context}`);
          if (expanded) assert.ok(paint.width > paint.height * 3, `Minus must be horizontal: ${context}`);
          else assert.ok(Math.abs(paint.width - paint.height) <= 1, `Plus must have equal arms: ${context}`);
          assert.ok(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 1), "No horizontal overflow");
        }
      }
      await page.reload({ waitUntil: "domcontentloaded" });
      await page.waitForFunction(() => document.querySelector(".daily-radar-visibility"));
      await page.evaluate(() => document.body.classList.remove("sonic-first-value-window"));
      assert.equal(await control.getAttribute("aria-expanded"), "false", "Collapsed preference survives reload");
      await control.focus();
      await page.keyboard.press("Enter");
      assert.equal(await control.getAttribute("aria-expanded"), "true");
      assert.ok(await control.evaluate(node => node === document.activeElement), "Keyboard focus stays on the control");
      assert.deepEqual(errors, []);
      console.log(`${engine.name()}: painted +/− centered, stable alignment at six widths, 44px targets, persistence and keyboard passed.`);
    } finally { await browser.close(); }
  }
} finally { await preview.stop(); }
