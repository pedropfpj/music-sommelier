import assert from "node:assert/strict";
import { startTestPreviewServer } from "./test-preview-server.mjs";

const { chromium, webkit, devices } = await import(process.env.SONIC_PLAYWRIGHT_MODULE || "playwright");

// Public news-editor snapshots. The body is shortened for these UI fixtures.
const listeningLink = {
  url: "https://tresorberlin.bandcamp.com/album/neptunes-lair",
  label: "Ouvir: Drexciya — Neptune's Lair"
};
const editorial = {
  id: "d8461e4a-a167-46e0-b6d8-19a9f87559b2",
  slug: "sonic-search-recomenda-2026-11-12",
  title: "Sonic Search Recomenda · 2026-11-12",
  authorName: "Sonic Search",
  category: "Sonic Search Recomenda",
  excerpt: "Três recomendações de catálogo e três lançamentos.",
  body: "Nesta quinta, três recomendações de catálogo para explorar electro, eletrônica e ambient.",
  publishedAt: "2026-11-12T12:05:50.958+00:00",
  eventStartsAt: null,
  eventEndsAt: null,
  venueName: "",
  city: "",
  state: "",
  serviceInfo: { relatedLinks: [listeningLink] }
};
const afterCosmic = {
  id: "7d100441-7aa2-4fd9-aa99-9031a5c8884d",
  slug: "guarulhos-croacia-after-cosmic-modem-2026",
  title: "After Cosmic em Guarulhos e Mo:Dem na Croácia: dois destinos do psytrance",
  authorName: "Redação Sonic Search",
  eyebrow: "ROTA SONORA · SP ↔ CROÁCIA",
  category: "Radar internacional",
  body: "A festa acontece na Nekropolis, em Guarulhos.",
  publishedAt: "2026-08-07T18:37:30.709+00:00",
  eventStartsAt: "2026-08-09T02:30:00+00:00",
  eventEndsAt: "2026-08-09T19:00:00+00:00",
  venueName: "Nekropolis",
  city: "Guarulhos",
  state: "SP",
  ticketUrl: "https://www.instagram.com/cosmic.crew/p/DbtxZRbxa65/",
  ctaLabel: "Ver o serviço do After",
  serviceInfo: { address: "Rua Ema Meo Steola, 27 · Vila Rosa Minelia · Guarulhos, SP" }
};
const invalid = {
  id: "invalid-event-date-fixture",
  title: "Registro editorial com data inválida de evento",
  category: "Radar",
  body: "A data de publicação está disponível.",
  publishedAt: "2026-11-13T12:30:00.000Z",
  eventStartsAt: "2026-11-31T03:00:00.000Z",
  eventEndsAt: "2026-12-02T18:30:00.000Z"
};
const realLocation = "Nekropolis · Guarulhos · SP";

async function openNews(browser, baseUrl, { device, direct = true, articles, now }) {
  const context = await browser.newContext({
    ...device,
    locale: "pt-BR",
    timezoneId: "America/Sao_Paulo",
    reducedMotion: "reduce",
    serviceWorkers: "block"
  });
  const page = await context.newPage();
  try {
    page.setDefaultTimeout(20_000);
    await page.clock.setFixedTime(new Date(now));
    await context.route("**/*", async (route) => {
      const request = route.request();
      const url = new URL(request.url());
      if (url.pathname === "/api/news-editor" && request.method() === "GET") {
        return route.fulfill({ json: { ok: true, articles, pagination: { hasMore: false } } });
      }
      if (url.pathname.startsWith("/api/")) {
        return route.fulfill({ json: { ok: true, enabled: false, items: [] } });
      }
      if (url.origin !== new URL(baseUrl).origin) return route.abort();
      return route.continue();
    });
    const url = new URL("/?visitor=1&lang=pt", baseUrl);
    if (direct) url.searchParams.set("tab", "news");
    await page.goto(url.href, { waitUntil: "domcontentloaded", timeout: 30_000 });
    const consent = page.locator("#privacyEssentialBtn");
    if (await consent.isVisible()) await consent.click();
    const tab = page.locator('[data-app-tab-target="news"]');
    if (!direct) await tab.click();
    const cover = page.locator("#sonicEditorialLatest .sonic-editorial-card");
    await cover.waitFor();
    assert.equal(await tab.getAttribute("aria-pressed"), "true");
    return { context, page, cover };
  } catch (error) {
    await context.close();
    throw error;
  }
}

async function openReader(page, card, article) {
  assert.equal(await card.getAttribute("data-sonic-article-id"), article.id);
  await card.click();
  const reader = page.locator("#sonicNewsReader[open]");
  await reader.waitFor();
  assert.equal(await reader.locator("#sonicNewsReaderTitle").innerText(), article.title);
  return reader;
}

async function assertEditorial(reader, publishedDate) {
  const facts = reader.locator("#sonicNewsReaderFacts > div");
  assert.deepEqual(await facts.locator("span").allTextContents(), ["PUBLICADO"]);
  assert.match(await facts.locator("strong").innerText(), publishedDate);
  assert.equal(await reader.locator("#sonicNewsReaderService").isVisible(), false);
  assert.equal(await reader.locator("#sonicNewsReaderServiceList > *").count(), 0);
  assert.doesNotMatch(await reader.innerText(), /1969|Local não informado|Evento encerrado/i);
}

async function assertEvent(reader, serviceTitle) {
  const facts = reader.locator("#sonicNewsReaderFacts > div");
  assert.deepEqual(await facts.locator("span").allTextContents(), ["PUBLICADO", "EVENTO", "LOCAL"]);
  const [publication, event, location] = await facts.locator("strong").allTextContents();
  assert.match(publication, /7 de agosto de 2026.*15:37/);
  assert.match(event, /8 de ago\. de 2026.*23:30.*9 de ago\. de 2026.*16:00/);
  assert.equal(location, realLocation);
  assert.equal(await reader.locator("#sonicNewsReaderServiceTitle").innerText(), serviceTitle);
  assert.ok((await reader.locator("#sonicNewsReaderServiceList").innerText()).includes(afterCosmic.serviceInfo.address));
  assert.equal(await reader.getByRole("link", { name: afterCosmic.ctaLabel }).getAttribute("href"), afterCosmic.ticketUrl);
}

async function verify(browser, baseUrl, { device, direct }) {
  const entry = await openNews(browser, baseUrl, {
    device, direct, articles: [editorial, afterCosmic], now: "2026-11-16T15:00:00Z"
  });
  try {
    const { page, cover } = entry;
    assert.equal(await cover.getAttribute("data-event-state"), "news");
    assert.match(await cover.locator(".sonic-editorial-publication").innerText(), /12 de nov\. de 2026.*09:05/);
    assert.equal(await cover.locator(".sonic-editorial-event").count(), 0);
    const reader = await openReader(page, cover, editorial);
    await assertEditorial(reader, /12 de novembro de 2026.*09:05/);
    assert.equal(await reader.locator("#sonicNewsReaderBody").innerText(), editorial.body);
    assert.equal(await reader.getByRole("link", { name: listeningLink.label }).getAttribute("href"), listeningLink.url);
    await reader.getByRole("button", { name: "Fechar matéria" }).click();
    await page.locator("#sonicEditorialArchive > summary").click();
    const archivedEvent = page.locator(".sonic-editorial-archive-card");
    assert.equal(await archivedEvent.getAttribute("data-event-state"), "ended");
    assert.match(await archivedEvent.innerText(), /Evento encerrado/);
    await assertEvent(await openReader(page, archivedEvent, afterCosmic), "Informações do evento");
  } finally {
    await entry.context.close();
  }

  for (const { now, status, coverLabel, serviceTitle } of [
    { now: "2026-08-08T21:00:00Z", status: "upcoming", coverLabel: "Próximo evento", serviceTitle: "Programe-se" },
    { now: "2026-08-09T14:00:00Z", status: "ongoing", coverLabel: "Em andamento", serviceTitle: "Acontecendo agora" },
    { now: "2026-11-16T15:00:00Z", status: "ended", coverLabel: "Evento encerrado", serviceTitle: "Informações do evento" }
  ]) {
    const event = await openNews(browser, baseUrl, { device, articles: [afterCosmic], now });
    try {
      assert.equal(await event.cover.getAttribute("data-event-state"), status);
      const eventBlock = event.cover.locator(".sonic-editorial-event");
      assert.equal(await eventBlock.locator("strong").textContent(), coverLabel);
      const details = await eventBlock.innerText();
      assert.match(details, /Quando.*8 de ago.*9 de ago/is);
      assert.ok(details.includes(realLocation));
      await assertEvent(await openReader(event.page, event.cover, afterCosmic), serviceTitle);
    } finally {
      await event.context.close();
    }
  }

  const malformed = await openNews(browser, baseUrl, { device, articles: [invalid], now: "2026-11-16T15:00:00Z" });
  try {
    assert.equal(await malformed.cover.getAttribute("data-event-state"), "news");
    assert.match(await malformed.cover.locator(".sonic-editorial-publication").innerText(), /13 de nov\. de 2026.*09:30/);
    assert.equal(await malformed.cover.locator(".sonic-editorial-event").count(), 0);
    await assertEditorial(await openReader(malformed.page, malformed.cover, invalid), /13 de novembro de 2026.*09:30/);
  } finally {
    await malformed.context.close();
  }
}

const preview = await startTestPreviewServer({ envName: "SONIC_NEWSROOM_TEST_URL" });
try {
  for (const { engine, label, device, direct, executablePath } of [
    { engine: chromium, label: "Chromium desktop", device: { viewport: { width: 1440, height: 960 } }, direct: false, executablePath: process.env.SONIC_CHROMIUM_EXECUTABLE },
    { engine: webkit, label: "WebKit mobile", device: devices["iPhone 13"], direct: true }
  ]) {
    const browser = await engine.launch({ headless: true, executablePath });
    try {
      await verify(browser, preview.baseUrl, { device, direct });
      console.log(`${label}: capa, arquivo e leitura preservam publicação, links e serviço de eventos válidos.`);
    } finally {
      await browser.close();
    }
  }
} finally {
  await preview.stop();
}
