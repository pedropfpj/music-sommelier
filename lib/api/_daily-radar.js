const { resolveAccessContext } = require("./_access-control");
const { parseBody, sendJson } = require("./_music-apis");
const { setCorsHeaders } = require("./_request-security");

const ALLOWED_METHODS = ["GET", "PUT", "OPTIONS"];
const MAX_BYTES = 1000000;
const HISTORY_LIMIT = 30;
const FEEDBACK_LIMIT = 600;

function config() {
  return {
    url: String(process.env.SUPABASE_URL || "").trim().replace(/\/+$/, ""),
    serviceKey: String(process.env.SUPABASE_SERVICE_ROLE_KEY || "").trim()
  };
}

function headers(serviceKey, extras = {}) {
  return {
    apikey: serviceKey,
    Authorization: `Bearer ${serviceKey}`,
    Accept: "application/json",
    ...extras
  };
}

function cleanText(value, limit = 240) {
  return typeof value === "string" ? value.trim().slice(0, limit) : "";
}

function cleanItem(value = {}) {
  const key = cleanText(value.key, 300);
  const artist = cleanText(value.artist);
  const song = cleanText(value.song);
  const style = cleanText(value.style, 80);
  if (!key || !artist || !song || !style) return null;
  return {
    key,
    artist,
    artistKey: cleanText(value.artistKey, 240),
    song,
    style,
    styleLabel: cleanText(value.styleLabel, 120),
    family: cleanText(value.family, 80),
    bpm: cleanText(value.bpm, 40),
    energy: cleanText(value.energy, 40),
    label: cleanText(value.label, 160),
    lane: ["anchor", "bridge", "wildcard", "refresh"].includes(value.lane) ? value.lane : "anchor",
    reason: ["taste", "likes", "bridge", "wildcard", "starter", "refresh"].includes(value.reason) ? value.reason : "starter"
  };
}

function sanitizeState(value = {}) {
  const input = value && typeof value === "object" ? value : {};
  const history = [];
  const dates = new Set();
  for (const entry of Array.isArray(input.history) ? input.history : []) {
    const date = cleanText(entry?.date, 10);
    if (!/^\d{4}-\d{2}-\d{2}$/.test(date) || dates.has(date)) continue;
    const itemKeys = new Set();
    const artistKeys = new Set();
    const items = (Array.isArray(entry?.items) ? entry.items : []).map(cleanItem).filter((item) => {
      const artistKey = cleanText(item?.artistKey, 240).toLowerCase();
      if (!item || itemKeys.has(item.key) || (artistKey && artistKeys.has(artistKey))) return false;
      itemKeys.add(item.key);
      if (artistKey) artistKeys.add(artistKey);
      return true;
    }).slice(0, 3);
    if (!items.length) continue;
    dates.add(date);
    history.push({ date, items });
    if (history.length >= HISTORY_LIMIT) break;
  }
  const feedback = [];
  const keys = new Set();
  for (const entry of Array.isArray(input.feedback) ? input.feedback : []) {
    const key = cleanText(entry?.key, 300);
    const action = cleanText(entry?.action, 20);
    if (!key || keys.has(key) || !["like", "known", "pass"].includes(action)) continue;
    keys.add(key);
    feedback.push({
      key,
      artistKey: cleanText(entry?.artistKey, 240),
      style: cleanText(entry?.style, 80),
      family: cleanText(entry?.family, 80),
      action
    });
    if (feedback.length >= FEEDBACK_LIMIT) break;
  }
  const state = { version: 1, seed: cleanText(input.seed, 120) || "sonic", history, feedback };
  return Buffer.byteLength(JSON.stringify(state)) <= MAX_BYTES ? state : null;
}

module.exports = async function handler(req, res) {
  if (req.method === "OPTIONS") {
    setCorsHeaders(req, res, {
      originEnvNames: ["SONIC_MUSIC_ALLOWED_ORIGINS"],
      methods: ALLOWED_METHODS,
      allowedHeaders: "Content-Type, Authorization, X-Sonic-Auth-Token"
    });
    res.statusCode = 204;
    res.end();
    return;
  }
  if (!ALLOWED_METHODS.includes(req.method)) {
    sendJson(req, res, 405, { ok: false, error: "method_not_allowed" }, ALLOWED_METHODS);
    return;
  }
  const access = await resolveAccessContext(req, req.method === "PUT" ? parseBody(req) : {}, { includeMembership: true });
  if (!access.authenticated) {
    sendJson(req, res, 401, { ok: false, error: "login_required" }, ALLOWED_METHODS);
    return;
  }
  if (!access.premium) {
    sendJson(req, res, 403, { ok: false, error: "premium_required" }, ALLOWED_METHODS);
    return;
  }
  const store = config();
  if (!store.url || !store.serviceKey) {
    sendJson(req, res, 503, { ok: false, error: "radar_store_not_configured" }, ALLOWED_METHODS);
    return;
  }
  const endpoint = `${store.url}/rest/v1/sonic_daily_radar_state?user_id=eq.${encodeURIComponent(access.userId)}`;
  try {
    if (req.method === "GET") {
      const response = await fetch(`${endpoint}&select=state,updated_at&limit=1`, { headers: headers(store.serviceKey) });
      const payload = await response.json().catch(() => ([]));
      if (!response.ok) throw new Error("radar_read_failed");
      const row = Array.isArray(payload) ? payload[0] || null : null;
      sendJson(req, res, 200, { ok: true, state: row?.state || null, updatedAt: row?.updated_at || null }, ALLOWED_METHODS);
      return;
    }
    const body = parseBody(req);
    const state = sanitizeState(body.state);
    if (!state) {
      sendJson(req, res, 400, { ok: false, error: "invalid_radar_state" }, ALLOWED_METHODS);
      return;
    }
    const response = await fetch(`${store.url}/rest/v1/sonic_daily_radar_state?on_conflict=user_id`, {
      method: "POST",
      headers: headers(store.serviceKey, { "Content-Type": "application/json", Prefer: "resolution=merge-duplicates,return=minimal" }),
      body: JSON.stringify([{ user_id: access.userId, state }])
    });
    if (!response.ok) throw new Error("radar_write_failed");
    sendJson(req, res, 200, { ok: true }, ALLOWED_METHODS);
  } catch (_error) {
    sendJson(req, res, 503, { ok: false, error: "radar_store_unavailable" }, ALLOWED_METHODS);
  }
};

module.exports.sanitizeState = sanitizeState;
