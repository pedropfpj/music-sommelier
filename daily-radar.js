/* Sonic Daily Radar: deterministic track curation shared by the UI and tests. */
(function (root, factory) {
  const api = factory();
  if (typeof module === "object" && module.exports) module.exports = api;
  else root.SonicDailyRadar = api;
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
    if (!Number.isFinite(date.getTime())) throw new TypeError("Invalid daily radar date");
    return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
  }

  function cleanItem(value) {
    if (!value || typeof value !== "object") return null;
    const artist = text(value.artist);
    const song = text(value.song);
    const style = text(value.style, 80);
    const key = text(value.key, 300) || normalize(`${artist}::${song}`);
    if (!key || !artist || !song || !style) return null;
    return {
      key,
      artist,
      artistKey: normalize(artist),
      song,
      style,
      styleLabel: text(value.styleLabel, 120) || style,
      family: text(value.family, 80) || "other",
      bpm: text(value.bpm, 40),
      energy: text(value.energy, 40),
      label: text(value.label, 160),
      lane: ["anchor", "bridge", "wildcard", "refresh"].includes(value.lane) ? value.lane : "anchor",
      reason: ["taste", "likes", "bridge", "wildcard", "starter", "refresh"].includes(value.reason) ? value.reason : "starter"
    };
  }

  function createState(raw, seed = "sonic") {
    const input = raw && typeof raw === "object" && raw.version === 1 ? raw : {};
    const history = [];
    const seenDates = new Set();
    for (const entry of Array.isArray(input.history) ? input.history : []) {
      const date = text(entry?.date, 10);
      if (!/^\d{4}-\d{2}-\d{2}$/.test(date) || seenDates.has(date)) continue;
      const artists = new Set();
      const tracks = new Set();
      const items = (Array.isArray(entry?.items) ? entry.items : []).map(cleanItem).filter((item) => {
        if (!item || artists.has(item.artistKey) || tracks.has(item.key)) return false;
        artists.add(item.artistKey);
        tracks.add(item.key);
        return true;
      }).slice(0, 3);
      if (!items.length) continue;
      history.push({ date, items });
      seenDates.add(date);
    }

    const feedback = [];
    const seenFeedback = new Set();
    for (const entry of Array.isArray(input.feedback) ? input.feedback : []) {
      const key = text(entry?.key, 300);
      const action = text(entry?.action, 20);
      if (!key || seenFeedback.has(key) || !["like", "known", "pass"].includes(action)) continue;
      seenFeedback.add(key);
      feedback.push({
        key,
        artistKey: normalize(entry?.artistKey),
        style: text(entry?.style, 80),
        family: text(entry?.family, 80),
        action
      });
    }

    return {
      version: 1,
      seed: text(input.seed, 120) || text(seed, 120) || "sonic",
      history: history.sort((a, b) => b.date.localeCompare(a.date)).slice(0, HISTORY_LIMIT),
      feedback: feedback.slice(0, FEEDBACK_LIMIT)
    };
  }

  function mergeStates(localRaw, cloudRaw, seed = "sonic") {
    const local = createState(localRaw, seed);
    const cloud = createState(cloudRaw, local.seed);
    const byDate = new Map();
    [...cloud.history, ...local.history].forEach((entry) => {
      if (!byDate.has(entry.date)) byDate.set(entry.date, entry);
    });
    const byKey = new Map();
    [...cloud.feedback, ...local.feedback].forEach((entry) => {
      if (!byKey.has(entry.key)) byKey.set(entry.key, entry);
    });
    return createState({
      version: 1,
      seed: cloud.seed || local.seed,
      history: [...byDate.values()],
      feedback: [...byKey.values()]
    }, seed);
  }

  function recordFeedback(stateRaw, itemRaw, action) {
    const state = createState(stateRaw);
    const item = cleanItem(itemRaw);
    if (!item || !["like", "known", "pass"].includes(action)) return state;
    const prior = state.feedback.find((entry) => entry.key === item.key);
    state.feedback = state.feedback.filter((entry) => entry.key !== item.key);
    if (prior?.action !== action) {
      state.feedback.unshift({ key: item.key, artistKey: item.artistKey, style: item.style, family: item.family, action });
    }
    state.feedback = state.feedback.slice(0, FEEDBACK_LIMIT);
    return state;
  }

  function countSignals(values = []) {
    const result = new Map();
    (Array.isArray(values) ? values : []).forEach((value) => {
      const key = text(value, 80);
      if (key) result.set(key, (result.get(key) || 0) + 1);
    });
    return result;
  }

  function selectDaily({ catalog = [], state: stateRaw, signals = {}, now = new Date() }) {
    const state = createState(stateRaw);
    const date = dayKey(now);
    const existing = state.history.find((entry) => entry.date === date);
    if (existing) return { state, selection: existing, cached: true };

    const liked = countSignals(signals.likedStyles);
    const preferred = countSignals(signals.preferredStyles);
    const disliked = countSignals(signals.dislikedStyles);
    const blockedKeys = new Set((signals.blockedTrackKeys || []).map((value) => text(value, 300)).filter(Boolean));
    const knownKeys = new Set((signals.knownTrackKeys || []).map((value) => text(value, 300)).filter(Boolean));
    const blockedArtists = new Set((signals.blockedArtists || []).map(normalize).filter(Boolean));
    for (const entry of state.feedback) {
      if (entry.action === "like") liked.set(entry.style, (liked.get(entry.style) || 0) + 3);
      if (entry.action === "pass") {
        blockedKeys.add(entry.key);
        disliked.set(entry.style, (disliked.get(entry.style) || 0) + 2);
      }
      if (entry.action === "known") knownKeys.add(entry.key);
    }

    const candidates = [];
    const seenKeys = new Set();
    for (const raw of Array.isArray(catalog) ? catalog : []) {
      const item = cleanItem(raw);
      if (!item || seenKeys.has(item.key) || blockedKeys.has(item.key) || knownKeys.has(item.key) || blockedArtists.has(item.artistKey)) continue;
      seenKeys.add(item.key);
      candidates.push(item);
    }

    const recentTrack = new Map();
    const recentArtist = new Map();
    state.history.filter((entry) => entry.date < date).forEach((entry, index) => {
      entry.items.forEach((item) => {
        if (!recentTrack.has(item.key)) recentTrack.set(item.key, index);
        if (!recentArtist.has(item.artistKey)) recentArtist.set(item.artistKey, index);
      });
    });

    const styleScore = (style) => (liked.get(style) || 0) * 5 + (preferred.get(style) || 0) * 8 - (disliked.get(style) || 0) * 6;
    const rankedStyles = [...new Set(candidates.map((item) => item.style))].sort((a, b) => styleScore(b) - styleScore(a) || a.localeCompare(b));
    const leadStyle = rankedStyles[0] || "";
    const leadFamily = candidates.find((item) => item.style === leadStyle)?.family || "";
    const score = (item, lane) => {
      let value = styleScore(item.style);
      if (lane === "anchor" && item.style === leadStyle) value += 60;
      if (lane === "bridge" && leadFamily && item.family === leadFamily && item.style !== leadStyle) value += 42;
      if (lane === "wildcard" && leadFamily && item.family !== leadFamily) value += 38;
      if (!recentTrack.has(item.key)) value += 18;
      if (!recentArtist.has(item.artistKey)) value += 12;
      return value + hash(`${state.seed}:${date}:${lane}:${item.key}`) / 4294967296;
    };

    const picked = [];
    const choose = (lane) => {
      let pool = candidates.filter((item) => !picked.some((pickedItem) => pickedItem.key === item.key || pickedItem.artistKey === item.artistKey));
      if (lane === "anchor" && leadStyle) {
        const matching = pool.filter((item) => item.style === leadStyle);
        if (matching.length) pool = matching;
      }
      if (lane === "bridge" && leadFamily) {
        const bridge = pool.filter((item) => item.family === leadFamily && item.style !== leadStyle);
        const family = pool.filter((item) => item.family === leadFamily);
        if (bridge.length || family.length) pool = bridge.length ? bridge : family;
      }
      if (lane === "wildcard" && leadFamily) {
        const wildcard = pool.filter((item) => item.family !== leadFamily);
        if (wildcard.length) pool = wildcard;
      }
      const fresh = pool.filter((item) => !recentTrack.has(item.key) && !recentArtist.has(item.artistKey));
      if (fresh.length) pool = fresh;
      pool.sort((a, b) => score(b, lane) - score(a, lane) || a.key.localeCompare(b.key));
      const item = pool[0];
      if (!item) return;
      const revisited = recentTrack.has(item.key) || recentArtist.has(item.artistKey);
      const reason = revisited
        ? "refresh"
        : lane === "wildcard"
          ? "wildcard"
          : lane === "bridge"
            ? "bridge"
            : (liked.get(item.style) || 0) > 0
              ? "likes"
              : (preferred.get(item.style) || 0) > 0
                ? "taste"
                : "starter";
      picked.push({ ...item, lane: revisited ? "refresh" : lane, reason });
    };

    choose("anchor");
    choose("bridge");
    choose("wildcard");
    const selection = { date, items: picked };
    if (picked.length) state.history = [selection, ...state.history].slice(0, HISTORY_LIMIT);
    return { state, selection, cached: false };
  }

  return Object.freeze({ HISTORY_LIMIT, FEEDBACK_LIMIT, normalize, hash, dayKey, cleanItem, createState, mergeStates, recordFeedback, selectDaily });
});
