const { envFlag, envInt, envText, requestClientId, requireMusicApi, sendJson, trimText } = require("./_music-apis");
const { enforceDailyUsageLimit, hashStoreKey } = require("./_usage-store");

const DEFAULT_NEWS_USER_AGENT = "SonicSearch/1.0 (+https://sonicsearch.app)";
const NEWS_SOURCES = [
  {
    name: "Radar Brasil",
    homepage: "https://news.google.com/search?q=m%C3%BAsica%20eletr%C3%B4nica%20Brasil",
    feed: "https://news.google.com/rss/search?q=m%C3%BAsica%20eletr%C3%B4nica%20Brasil%20DJ%20festival%20when%3A30d&hl=pt-BR&gl=BR&ceid=BR%3Apt-419",
    region: "br",
    kind: "search"
  },
  {
    name: "Radar Festivais BR",
    homepage: "https://news.google.com/search?q=festival%20m%C3%BAsica%20eletr%C3%B4nica%20Brasil",
    feed: "https://news.google.com/rss/search?q=festival%20m%C3%BAsica%20eletr%C3%B4nica%20Brasil%20club%20DJ%20when%3A30d&hl=pt-BR&gl=BR&ceid=BR%3Apt-419",
    region: "br",
    kind: "search"
  },
  { name: "Alataj", homepage: "https://alataj.com.br/", feed: "https://alataj.com.br/feed/", region: "br" },
  { name: "House Mag", homepage: "https://www.housemag.com.br/", feed: "https://www.housemag.com.br/feed/", region: "br" },
  { name: "Mixmag Brasil", homepage: "https://mixmag.com.br/", feed: "https://mixmag.com.br/feed/", region: "br" },
  { name: "Live Today", homepage: "https://livetoday.com.br/", feed: "https://livetoday.com.br/feed/", region: "br" },
  { name: "EDM.com", homepage: "https://edm.com/", feed: "https://edm.com/.rss/full", region: "global" },
  { name: "Mixmag", homepage: "https://mixmag.net/news", feed: "https://mixmag.net/rss-category/news", region: "global" },
  { name: "Dancing Astronaut", homepage: "https://dancingastronaut.com/", feed: "https://dancingastronaut.com/feed/", region: "global" },
  { name: "EDM Identity", homepage: "https://edmidentity.com/", feed: "https://edmidentity.com/feed/", region: "global" },
  {
    name: "Radar Global",
    homepage: "https://news.google.com/search?q=electronic%20music%20DJ%20festival",
    feed: "https://news.google.com/rss/search?q=electronic%20music%20DJ%20festival%20techno%20house%20when%3A14d&hl=en-US&gl=US&ceid=US%3Aen",
    region: "global",
    kind: "search"
  }
];

let newsCache = {
  expiresAt: 0,
  items: []
};

function requestLimit(req) {
  const raw = req?.query?.limit;
  const parsed = Number.parseInt(Array.isArray(raw) ? raw[0] : String(raw || ""), 10);
  const fallback = envInt("SONIC_NEWS_FEED_LIMIT", 8, 1, 20);
  if (!Number.isFinite(parsed)) return fallback;
  return Math.max(1, Math.min(20, parsed));
}

function decodeXml(value = "") {
  return String(value || "")
    .replace(/<!\[CDATA\[([\s\S]*?)\]\]>/g, "$1")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, "\"")
    .replace(/&#39;/g, "'")
    .replace(/&#x2F;/g, "/")
    .replace(/&#(\d+);/g, (_match, code) => String.fromCharCode(Number(code) || 32))
    .replace(/&#x([0-9a-f]+);/gi, (_match, code) => String.fromCharCode(Number.parseInt(code, 16) || 32));
}

function stripHtml(value = "") {
  return decodeXml(value)
    .replace(/<script\b[\s\S]*?<\/script>/gi, " ")
    .replace(/<style\b[\s\S]*?<\/style>/gi, " ")
    .replace(/<[^>]+>/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function tagText(block = "", tag = "") {
  const match = String(block || "").match(new RegExp(`<${tag}\\b[^>]*>([\\s\\S]*?)<\\/${tag}>`, "i"));
  return stripHtml(match?.[1] || "");
}

function tagAttribute(block = "", tag = "", attribute = "") {
  const match = String(block || "").match(new RegExp(`<${tag}\\b([^>]*)>`, "i"));
  const attrs = match?.[1] || "";
  const attrMatch = attrs.match(new RegExp(`${attribute}=["']([^"']+)["']`, "i"));
  return decodeXml(attrMatch?.[1] || "").trim();
}

function entryLink(block = "") {
  const href = tagAttribute(block, "link", "href");
  if (href) return href;
  return tagText(block, "link");
}

function sourceFromBlock(block = "", fallback = {}) {
  const sourceName = tagText(block, "source") || fallback.name || "Fonte";
  const sourceUrl = tagAttribute(block, "source", "url") || fallback.homepage || entryLink(block) || "";
  return { sourceName, sourceUrl };
}

function sourceDetailsFor(source = {}, item = {}) {
  const sourceName = trimText(item.source || source.name || "Fonte", 80);
  const sourceUrl = trimText(item.sourceUrl || source.homepage || "", 500);
  return {
    name: sourceName,
    provider: sourceName,
    url: sourceUrl,
    dataType: source.kind === "search" ? "news search feed" : "rss feed",
    attribution: sourceUrl ? `${sourceName}: ${sourceUrl}` : sourceName,
    backendOnly: true,
    cached: true
  };
}

function normalizeNewsUrl(url = "") {
  return String(url || "").split("?")[0].replace(/\/$/, "").toLowerCase();
}

function parseFeed(xml = "", source = {}) {
  const blocks = [
    ...String(xml || "").matchAll(/<item\b[\s\S]*?<\/item>/gi),
    ...String(xml || "").matchAll(/<entry\b[\s\S]*?<\/entry>/gi)
  ].map((match) => match[0]).slice(0, 10);

  return blocks.map((block) => {
    const title = tagText(block, "title");
    const url = entryLink(block) || source.homepage || "";
    const publishedAt =
      tagText(block, "pubDate") ||
      tagText(block, "published") ||
      tagText(block, "updated") ||
      "";
    const summary = trimText(
      stripHtml(tagText(block, "description") || tagText(block, "summary") || tagText(block, "content")),
      260
    );
    const { sourceName, sourceUrl } = sourceFromBlock(block, source);
    const item = {
      title: trimText(title, 220),
      source: trimText(sourceName, 80),
      sourceUrl: trimText(sourceUrl, 500),
      url: trimText(url, 500),
      publishedAt: trimText(publishedAt, 80),
      summary: source.kind === "search" ? `Noticia encontrada via ${sourceName}.` : summary,
      region: source.region || "",
      kind: source.kind || "feed"
    };
    return {
      ...item,
      sourceDetails: [sourceDetailsFor(source, item)],
      attribution: {
        label: "Fonte de noticia",
        sources: [sourceDetailsFor(source, item)]
      }
    };
  }).filter((item) => item.title && item.url);
}

async function fetchSource(source) {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), envInt("SONIC_NEWS_FEED_TIMEOUT_MS", 5200, 1000, 15000));
  try {
    const response = await fetch(source.feed, {
      method: "GET",
      headers: {
        "User-Agent": envText("SONIC_NEWS_USER_AGENT", DEFAULT_NEWS_USER_AGENT),
        Accept: "application/rss+xml, application/xml, text/xml, text/plain"
      },
      signal: controller.signal
    });
    if (!response.ok) return [];
    const xml = await response.text();
    return parseFeed(xml, source);
  } catch (_error) {
    return [];
  } finally {
    clearTimeout(timeout);
  }
}

function eventTime(value = "") {
  const time = new Date(value || 0).getTime();
  return Number.isFinite(time) ? time : 0;
}

function compactItems(items = [], limit = 8) {
  const seen = new Set();
  return [...items]
    .filter((item) => item?.title && item?.url)
    .sort((a, b) => eventTime(b.publishedAt) - eventTime(a.publishedAt))
    .filter((item) => {
      const key = normalizeNewsUrl(item.url) || String(item.title || "").toLowerCase();
      if (!key || seen.has(key)) return false;
      seen.add(key);
      return true;
    })
    .slice(0, limit);
}

async function fetchNews(limit) {
  const now = Date.now();
  if (newsCache.items.length && newsCache.expiresAt > now) return compactItems(newsCache.items, limit);
  const priority = NEWS_SOURCES.filter((source) => source.kind === "search");
  const supporting = NEWS_SOURCES.filter((source) => source.kind !== "search");
  const priorityItems = (await Promise.all(priority.map(fetchSource))).flat();
  const supportingItems = (await Promise.all(supporting.map(fetchSource))).flat();
  const items = compactItems([...priorityItems, ...supportingItems], Math.max(limit, 12));
  newsCache = {
    expiresAt: now + envInt("SONIC_NEWS_FEED_CACHE_SECONDS", 900, 60, 86400) * 1000,
    items
  };
  return compactItems(items, limit);
}

function todayKey() {
  return new Date().toISOString().slice(0, 10);
}

function secondsUntilNextUtcDay() {
  const now = Date.now();
  const next = new Date(now);
  next.setUTCHours(24, 0, 0, 0);
  return Math.max(60, Math.ceil((next.getTime() - now) / 1000) + 3600);
}

async function enforceNewsBudget(req, res) {
  const dailyLimit = envInt("SONIC_NEWS_FEED_DAILY_LIMIT", 80, 0, 10000);
  const key = `sonic:usage:news-feed:${todayKey()}:${hashStoreKey(requestClientId(req))}`;
  const budget = await enforceDailyUsageLimit({
    key,
    limit: dailyLimit,
    expiresInSeconds: secondsUntilNextUtcDay()
  });
  if (!budget.ok) {
    sendJson(req, res, 429, {
      ok: false,
      enabled: true,
      error: budget.error || "daily_news_feed_limit_reached",
      feature: "news-feed",
      limit: dailyLimit,
      items: []
    }, ["GET", "OPTIONS"]);
    return false;
  }
  if (budget.remaining !== null) res.setHeader("X-Sonic-News-Remaining", String(budget.remaining));
  res.setHeader("X-Sonic-Usage-Store", budget.store || "memory");
  return true;
}

function responseSourceDetails() {
  return NEWS_SOURCES.map((source) => ({
    name: source.name,
    provider: source.name,
    url: source.homepage,
    dataType: source.kind === "search" ? "news search feed" : "rss feed",
    region: source.region || "",
    backendOnly: true,
    cached: true
  }));
}

module.exports = async function handler(req, res) {
  if (!requireMusicApi(req, res, {
    methods: ["GET"],
    feature: "news-feed-route",
    enabledEnv: "SONIC_NEWS_FEED_ROUTE_ENABLED",
    defaultEnabled: true,
    allowGlobalFallback: false
  })) return;

  if (!envFlag("SONIC_NEWS_FEED_ENABLED", true)) {
    sendJson(req, res, 200, {
      ok: true,
      enabled: false,
      source: "server-rss",
      count: 0,
      items: [],
      sourceDetails: responseSourceDetails(),
      attribution: {
        label: "News feed desativado por configuracao",
        sources: responseSourceDetails()
      }
    }, ["GET", "OPTIONS"]);
    return;
  }

  if (!(await enforceNewsBudget(req, res))) return;

  try {
    const limit = requestLimit(req);
    const items = await fetchNews(limit);
    const sources = responseSourceDetails();
    sendJson(req, res, 200, {
      ok: true,
      enabled: true,
      source: "server-rss",
      count: items.length,
      items,
      sourceDetails: sources,
      attribution: {
        label: "Noticias via feeds buscados no backend",
        sources
      },
      cache: {
        expiresAt: newsCache.expiresAt ? new Date(newsCache.expiresAt).toISOString() : ""
      }
    }, ["GET", "OPTIONS"]);
  } catch (error) {
    sendJson(req, res, 500, {
      ok: false,
      enabled: true,
      error: "news_feed_failed",
      detail: error.message,
      items: []
    }, ["GET", "OPTIONS"]);
  }
};
