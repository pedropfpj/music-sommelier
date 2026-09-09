/* Daily DJ curation. Pure, deterministic logic shared by the UI and tests.
 * This module is not a payment/entitlement boundary. See docs/premium-daily-djs.md.
 */
(function (root, factory) {
  const api = factory();
  if (typeof module === "object" && module.exports) module.exports = api;
  else root.SonicDailyDjs = api;
})(typeof window === "undefined" ? globalThis : window, function () {
  "use strict";
  const HISTORY_LIMIT = 30;
  const FEEDBACK_LIMIT = 600;
  const text = (value, limit = 240) => typeof value === "string" ? value.trim().slice(0, limit) : "";
  const normalize = (value) => text(value).normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase().replace(/[^a-z0-9]+/g, " ").trim();

  function hash(value) {
    let result = 2166136261;
    for (const char of String(value)) result = Math.imul(result ^ char.charCodeAt(0), 16777619);
    return result >>> 0;
  }

  function dayKey(now = new Date()) {
    const date = new Date(now);
    if (!Number.isFinite(date.getTime())) throw new TypeError("Invalid daily selection date");
    return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
  }

  function safeSetUrl(raw) {
    try {
      const url = new URL(raw);
      if (url.protocol !== "https:" || url.username || url.password || url.port) return "";
      const host = url.hostname.toLowerCase().replace(/^www\./, "");
      if (host === "youtube.com" && url.pathname === "/watch" && /^[\w-]{11}$/.test(url.searchParams.get("v") || "")) {
        return `https://www.youtube.com/watch?v=${url.searchParams.get("v")}`;
      }
      if (host === "youtu.be" && /^\/[\w-]{11}$/.test(url.pathname)) return `https://www.youtube.com/watch?v=${url.pathname.slice(1)}`;
      if (host === "soundcloud.com" && /^\/[^/]+\/[^/]+\/?$/.test(url.pathname) && !/^\/(search|discover|you|stream)\//.test(url.pathname)) {
        return `https://soundcloud.com${url.pathname}`;
      }
    } catch (_) { /* A search page or unsafe URL is not a playable set. */ }
    return "";
  }

  function cleanItem(value) {
    if (!value || typeof value !== "object") return null;
    // A video headline or full album is not an identified DJ/set pairing.
    if (/\bmix\s*[●|]|\b(?:live|dj|full)\s+set\b|https?:\/\//i.test(text(value.artist))
      || /\b(?:full album|complete album|album completo|compilation)\b/i.test(text(value.title))) return null;
    const item = {
      key: text(value.key, 300), artist: text(value.artist), artistKey: normalize(value.artist),
      title: text(value.title), url: safeSetUrl(value.url), style: text(value.style, 80),
      styleLabel: text(value.styleLabel, 120), family: text(value.family, 80),
      platform: text(value.platform, 40), kind: ["fit", "explore", "starter", "refresh"].includes(value.kind) ? value.kind : "starter",
      reason: ["preference", "likes", "explore", "starter", "refresh"].includes(value.reason) ? value.reason : "starter"
    };
    return item.key && item.artistKey && item.title && item.url && item.style ? item : null;
  }

  function createState(raw, seed = "sonic") {
    const input = raw && typeof raw === "object" && raw.version === 1 ? raw : {};
    const history = [];
    const seenDays = new Set();
    for (const entry of Array.isArray(input.history) ? input.history : []) {
      if (!entry || !/^\d{4}-\d{2}-\d{2}$/.test(entry.date || "") || seenDays.has(entry.date)) continue;
      const parsedDate = new Date(`${entry.date}T12:00:00`);
      if (!Number.isFinite(parsedDate.getTime()) || dayKey(parsedDate) !== entry.date) continue;
      const artists = new Set();
      const items = (Array.isArray(entry.items) ? entry.items : []).map(cleanItem).filter((item) => {
        if (!item || artists.has(item.artistKey)) return false;
        artists.add(item.artistKey);
        return true;
      }).slice(0, 3);
      if (!items.length) continue;
      history.push({ date: entry.date, items });
      seenDays.add(entry.date);
    }
    const feedback = [];
    const seenArtists = new Set();
    for (const entry of Array.isArray(input.feedback) ? input.feedback : []) {
      const artistKey = normalize(entry?.artistKey);
      if (!artistKey || seenArtists.has(artistKey) || !["like", "known", "pass"].includes(entry?.action)) continue;
      seenArtists.add(artistKey);
      feedback.push({ artistKey, style: text(entry.style, 80), family: text(entry.family, 80), action: entry.action });
    }
    return {
      version: 1, seed: text(input.seed, 100) || text(seed, 100) || "sonic",
      preferences: Array.from(new Set((Array.isArray(input.preferences) ? input.preferences : []).map((value) => text(value, 80)).filter(Boolean))).slice(0, 3),
      history: history.sort((a, b) => b.date.localeCompare(a.date)).slice(0, HISTORY_LIMIT),
      feedback: feedback.slice(0, FEEDBACK_LIMIT)
    };
  }

  function recordFeedback(state, item, action) {
    if (!["like", "known", "pass"].includes(action)) return state;
    const artistKey = normalize(item.artist);
    if (!artistKey) return state;
    const prior = state.feedback.find((entry) => entry.artistKey === artistKey);
    const feedback = state.feedback.filter((entry) => entry.artistKey !== artistKey);
    if (prior?.action !== action) feedback.unshift({ artistKey, style: item.style, family: item.family, action });
    return { ...state, feedback: feedback.slice(0, FEEDBACK_LIMIT) };
  }

  function selectDaily({ catalog = [], state: raw, signals = {}, now = new Date() }) {
    const state = createState(raw);
    const date = dayKey(now);
    const existing = state.history.find((entry) => entry.date === date);
    if (existing) return { state, selection: existing, cached: true };

    const blocked = new Set((signals.blockedArtists || []).map(normalize));
    const known = new Set((signals.knownArtists || []).map(normalize));
    const weights = new Map();
    const bump = (style, value) => { if (style) weights.set(style, (weights.get(style) || 0) + value); };
    for (const style of signals.likedStyles || []) bump(style, 1);
    for (const entry of state.feedback) {
      if (entry.action === "like") bump(entry.style, 4);
      if (entry.action === "known" || entry.action === "like") known.add(entry.artistKey);
      if (entry.action === "pass") { blocked.add(entry.artistKey); bump(entry.style, -2); }
    }
    const preferences = new Set(state.preferences);
    const families = new Set();
    const sets = new Set();
    const candidates = catalog.map(cleanItem).filter((item) => {
      if (!item || blocked.has(item.artistKey) || known.has(item.artistKey) || sets.has(item.url)) return false;
      sets.add(item.url);
      return true;
    });
    candidates.forEach((item) => {
      if (preferences.has(item.style) || (weights.get(item.style) || 0) > 0) families.add(item.family);
    });
    const recent = new Map();
    state.history.filter((entry) => entry.date < date).forEach((entry, index) => {
      for (const item of entry.items) if (!recent.has(item.artistKey)) recent.set(item.artistKey, index);
    });
    const score = (item) => (preferences.has(item.style) ? 100 : 0)
      + Math.max(-20, Math.min(40, (weights.get(item.style) || 0) * 4))
      + (families.has(item.family) ? 8 : 0);
    const tie = (item) => hash(`${state.seed}:${date}:${item.key}`) / 4294967296;
    const order = (a, b) => score(b) - score(a) || tie(b) - tie(a) || a.key.localeCompare(b.key);
    const picked = [];
    const pick = (explore) => {
      let pool = candidates.filter((item) => !picked.some((entry) => entry.artistKey === item.artistKey));
      const fresh = pool.filter((item) => !recent.has(item.artistKey));
      if (fresh.length) pool = fresh;
      else if (pool.length) {
        // When a small catalog is exhausted, revisit the least recently shown DJ.
        const oldest = Math.max(...pool.map((item) => recent.get(item.artistKey) ?? -1));
        pool = pool.filter((item) => (recent.get(item.artistKey) ?? -1) === oldest);
      }
      if (explore && picked.length) {
        const different = pool.filter((item) => !picked.some((entry) => entry.style === item.style) && !preferences.has(item.style));
        if (different.length) pool = different;
      }
      pool.sort(order);
      const item = pool[0];
      if (!item) return;
      const revisited = recent.has(item.artistKey);
      const exploration = explore && !preferences.has(item.style) && !picked.some((entry) => entry.style === item.style);
      const reason = revisited ? "refresh" : exploration ? "explore" : preferences.has(item.style) ? "preference" : (weights.get(item.style) || 0) > 0 ? "likes" : "starter";
      picked.push({ ...item, kind: revisited ? "refresh" : exploration ? "explore" : ["preference", "likes"].includes(reason) ? "fit" : "starter", reason });
    };
    pick(false);
    pick(false);
    pick(true);
    const selection = { date, items: picked };
    // Do not cache an empty result: a temporarily unavailable catalog can recover.
    if (picked.length) state.history = [selection, ...state.history].sort((a, b) => b.date.localeCompare(a.date)).slice(0, HISTORY_LIMIT);
    return { state, selection, cached: false };
  }

  return Object.freeze({ HISTORY_LIMIT, FEEDBACK_LIMIT, normalize, hash, dayKey, safeSetUrl, createState, recordFeedback, selectDaily });
});
