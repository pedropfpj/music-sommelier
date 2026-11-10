import assert from "node:assert/strict";
import { mkdir } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import { startTestPreviewServer } from "./test-preview-server.mjs";

const { chromium, webkit } = await import(process.env.SONIC_PLAYWRIGHT_MODULE || "playwright");
const iosBundle = process.argv.includes("--ios");
const engine = process.env.SONIC_UI_ENGINE === "webkit" ? webkit : chromium;
const preview = await startTestPreviewServer({ staticRoot: iosBundle ? "www" : "" });
const browser = await engine.launch({ headless: true, ...(engine === chromium ? { executablePath: "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome" } : {}) });
const appPath = fileURLToPath(new URL("../app.js", import.meta.url));
const cssPath = fileURLToPath(new URL("../styles.css", import.meta.url));
const tinyPng = "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAusB9Wl2nLkAAAAASUVORK5CYII=";
await mkdir(new URL("../reports/ux-five-points/", import.meta.url), { recursive: true });
try {
  for (const width of [393, 1440]) {
    const page = await browser.newPage({ viewport: { width, height: width < 500 ? 852 : 960 }, reducedMotion: "reduce" });
    const errors = [];
    page.on("pageerror", error => errors.push(error.message));
    let imageCalls = 0;
    let finishImage;
    let imageOutcome = "error";
    await page.route("**/*", async route => {
      const url = new URL(route.request().url());
      if (!iosBundle && url.pathname.endsWith("/app.min.js")) return route.fulfill({ path: appPath, contentType: "application/javascript" });
      if (!iosBundle && url.pathname.endsWith("/styles.min.css")) return route.fulfill({ path: cssPath, contentType: "text/css" });
      if (url.pathname === "/api/social-config") return route.fulfill({ json: { ok: true, enabled: true, supabaseUrl: "https://auth.example.test", supabaseAnonKey: "public-test-config", providers: ["google", "apple"], features: { socialV2: true, publicProfiles: false } } });
      if (url.pathname === "/api/spirit-image") {
        imageCalls++;
        if (imageCalls === 1) await new Promise(resolve => { finishImage = resolve; });
        return route.fulfill(imageOutcome === "error"
          ? { status: 404, json: { error: "openai_image_failed", detail: "INTERNAL_PROVIDER_PAYLOAD model_does_not_exist" } }
          : { json: { imageBase64: tinyPng, model: "gpt-image-2.5-flare", reused: false } });
      }
      if (url.pathname.startsWith("/api/")) return route.fulfill({ json: { ok: true, enabled: false, tracks: [], count: 0 } });
      if (url.origin !== preview.baseUrl && !["data:", "blob:"].includes(url.protocol)) return route.abort();
      return route.continue();
    });
    await page.goto(`${preview.baseUrl}/?qa=1&lang=pt&recommendation=0`, { waitUntil: "domcontentloaded" });
    await page.waitForFunction(() => typeof updateSwipeFeedbackCard === "function");
    const safeErrors = await page.evaluate(() => ({
      unknown: spiritCollectibleApiFailureText("openai_image_failed", "INTERNAL_PROVIDER_PAYLOAD", 404),
      providerLimit: spiritCollectibleApiFailureText("openai_image_failed", "INTERNAL_PROVIDER_PAYLOAD", 429),
      dailyLimit: spiritCollectibleApiFailureText("daily_ai_limit_reached", "INTERNAL_PROVIDER_PAYLOAD", 429),
      timeout: spiritCollectibleApiFailureText("openai_image_timeout", "INTERNAL_PROVIDER_PAYLOAD", 504)
    }));
    assert.doesNotMatch(Object.values(safeErrors).join(" "), /INTERNAL|OpenAI|HTTP|API/);
    assert.notEqual(safeErrors.providerLimit, safeErrors.dailyLimit, "Provider throttling must not promise a daily reset");
    const privacy = page.getByRole("button", { name: "Só essenciais", exact: true });
    if (await privacy.isVisible()) await privacy.click();
    await page.evaluate(() => {
      document.body.classList.remove("sonic-first-value-window");
      currentLanguage = "pt";
      currentRecommendation = null;
      updateSwipeFeedbackCard(null);
      setActiveAppTab("discover");
    });
    assert.equal(await page.locator("#trackDiscussionEntry").isVisible(), false);
    assert.equal(await page.locator("#topSwipeSurpriseBtn").isVisible(), true);
    await page.locator("#swipeStartPanel").screenshot({ path: fileURLToPath(new URL(`../reports/ux-five-points/first-listen-${width}.png`, import.meta.url)) });
    await page.evaluate(() => {
      const track = CURATED_FRIENDLY_OPENING_TRACKS[0];
      restoreRecommendationSurfaceSnapshot({ track, prefs: { style: track.style }, discovery: null }, { restartPreview: false });
      renderSocialDiscussionEntry(track);
    });
    await page.locator("#trackDiscussionEntry").waitFor({ state: "visible", timeout: 3000 });
    await page.locator('#trackDiscussionEntry [data-open-discussion="track"]').click();
    await page.waitForFunction(() => document.getElementById("socialDiscussionDialog").open);
    assert.match(await page.locator("#socialCommentsLoginText").textContent(), /Depois do login.*conversa desta faixa/);
    await page.locator("#socialDiscussionDialog").screenshot({ path: fileURLToPath(new URL(`../reports/ux-five-points/comments-${width}.png`, import.meta.url)) });
    await page.evaluate(() => {
      socialDiscussionDialog.close();
      totalLikedSongs = () => 82;
      canRequestAiImage = supportsAiCollectibleApi = aiImageAccessUnlockedForRequest = aiImageEnabled = () => true;
      aiImagePremiumRequiredForCurrentUser = aiImageLimitReachedForProfile = () => false;
      currentApiAccessToken = async () => "";
      recordAiImageCall = () => {};
      scheduleStorySharePrewarm = () => {};
      currentSpiritId = "engenheiro_groove";
      resolveMusicalSpirit = () => spiritById("engenheiro_groove");
      window.NEONPULSE_IMAGE_API_URL = `${location.origin}/api/spirit-image`;
      setActiveAppTab("profile");
      const spirit = spiritById(currentSpiritId);
      window.__artPromise = ensureSpiritCollectible(spirit, localizedSpiritCopy(spirit), { autoGenerate: true });
    });
    await page.waitForFunction(() => document.getElementById("spiritCollectiblePanel").getAttribute("aria-busy") === "true");
    assert.equal(await page.locator("#spiritCollectibleRegenerateBtn").isDisabled(), true);
    assert.doesNotMatch(await page.locator("#spiritCollectibleGenerationPanel").textContent(), /\d+%/);
    assert.match(await page.locator("#spiritCollectibleGenerationLabel").textContent(), /até 2 minutos/);
    await page.locator("#spiritCollectiblePanel").screenshot({ path: fileURLToPath(new URL(`../reports/ux-five-points/art-wait-${width}.png`, import.meta.url)) });
    await page.waitForFunction(() => spiritCollectibleBusy);
    while (!finishImage) await new Promise(resolve => setTimeout(resolve, 20));
    finishImage();
    await page.evaluate(() => window.__artPromise);
    assert.doesNotMatch(await page.locator("#spiritCollectibleHint").textContent(), /INTERNAL|model_does_not_exist|API|HTTP|OpenAI/);
    assert.equal(await page.locator("#spiritCollectibleRegenerateBtn").textContent(), "Tentar novamente");
    assert.equal(await page.locator("#spiritCollectibleRegenerateBtn").isEnabled(), true);
    await page.locator("#spiritCollectiblePanel").screenshot({ path: fileURLToPath(new URL(`../reports/ux-five-points/art-error-${width}.png`, import.meta.url)) });
    imageOutcome = "success";
    await page.locator("#spiritCollectibleRegenerateBtn").click();
    await page.waitForFunction(() => !spiritCollectibleBusy && document.getElementById("spiritCollectibleImage").dataset.assetReady === "true");
    assert.equal(imageCalls, 2, "One failure and one explicit retry only");
    assert.equal(await page.locator("#spiritCollectibleDownload").isVisible(), true);
    assert.equal(await page.locator("#spiritCollectibleRegenerateBtn").isVisible(), false, "No extra generation offered when regeneration is disabled");
    await page.evaluate(async () => { const spirit = spiritById(currentSpiritId); await ensureSpiritCollectible(spirit, localizedSpiritCopy(spirit)); });
    assert.equal(imageCalls, 2, "Opening cached artwork must not generate it again");
    assert.match(await page.locator("#spiritCollectibleHint").textContent(), /Arte pronta/);
    await page.evaluate(async () => {
      const originalFlag = aiConfigFlag;
      aiConfigFlag = (key, fallback) => key === "allowImageRegeneration" ? true : originalFlag(key, fallback);
      generateSpiritCollectibleAsset = async () => { throw new Error("INTERNAL_CONVERSION_FAILURE"); };
      const spirit = spiritById(currentSpiritId);
      await ensureSpiritCollectible(spirit, localizedSpiritCopy(spirit), { forceRegenerate: true });
    });
    assert.match(await page.locator("#spiritCollectibleHint").textContent(), /arte anterior continua disponível/);
    assert.doesNotMatch(await page.locator("#spiritCollectibleHint").textContent(), /INTERNAL/);
    assert.equal(await page.locator("#spiritCollectibleDownload").isVisible(), true);
    assert.equal(await page.locator("#spiritCollectibleRegenerateBtn").textContent(), "Tentar novamente");
    assert.equal(imageCalls, 2, "A conversion error must preserve the prior image without a silent extra call");
    await page.evaluate(() => {
      window.__testArtProfile = "test-art-profile-A";
      spiritCollectibleStoreKey = () => window.__testArtProfile;
      generateSpiritCollectibleAsset = () => new Promise(resolve => { window.__finishOldArt = resolve; });
      const spirit = spiritById(currentSpiritId);
      window.__oldArtPromise = ensureSpiritCollectible(spirit, localizedSpiritCopy(spirit), { autoGenerate: true });
    });
    await page.waitForFunction(() => typeof window.__finishOldArt === "function");
    await page.evaluate(async tinyPng => {
      window.__testArtProfile = "test-art-profile-B";
      spiritCollectibleGenerationToken++;
      spiritCollectibleBusy = true; // B may already have started another attempt.
      document.getElementById("spiritCollectibleHint").textContent = "Conta B";
      window.__finishOldArt({ imageUrl: `data:image/png;base64,${tinyPng}`, source: "api", createdAt: new Date().toISOString() });
      await window.__oldArtPromise;
    }, tinyPng);
    const isolation = await page.evaluate(() => ({
      savedA: Boolean(localStorage.getItem("test-art-profile-A")),
      savedB: Boolean(localStorage.getItem("test-art-profile-B")),
      busyB: spiritCollectibleBusy,
      hint: document.getElementById("spiritCollectibleHint").textContent
    }));
    assert.deepEqual(isolation, { savedA: true, savedB: false, busyB: true, hint: "Conta B" }, "A late response may only update the original profile's cache");
    assert.equal(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 1), true);
    assert.deepEqual(errors, []);
    await page.close();
    console.log(`${engine.name()} ${iosBundle ? "iOS bundle " : "web "}${width}px: first listen, contextual comments, honest wait, safe error, retry, success, cache and profile isolation passed.`);
  }
} finally { await browser.close(); await preview.stop(); }
