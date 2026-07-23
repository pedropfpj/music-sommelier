const {
  envText,
  parseBody,
  requireMusicApi,
  sendJson,
  trimText
} = require("./_music-apis");
const {
  hashStoreKey,
  incrementCounter,
  readMany,
  writeJson
} = require("./_usage-store");

const ALLOWED_METHODS = ["POST", "OPTIONS"];
const MAX_SNAPSHOT_ITEMS = 48;
const COUNTER_TTL_SECONDS = 60 * 60 * 36;
const RECENT_EXPOSURE_TTL_SECONDS = 120;

function cleanAnonymousId(value = "") {
  return trimText(value, 96)
    .replace(/[^a-zA-Z0-9_.:-]/g, "")
    .slice(0, 96);
}

function cleanExposureKey(value = "") {
  return trimText(value, 220)
    .toLowerCase()
    .replace(/[\u0000-\u001f\u007f]/g, "")
    .slice(0, 220);
}

function uniqueKeys(values = [], limit = MAX_SNAPSHOT_ITEMS) {
  const seen = new Set();
  const result = [];
  (Array.isArray(values) ? values : []).forEach((value) => {
    const key = cleanExposureKey(value);
    if (!key || seen.has(key) || result.length >= limit) return;
    seen.add(key);
    result.push(key);
  });
  return result;
}

function utcDayKey() {
  return new Date().toISOString().slice(0, 10);
}

function counterKey(type = "track", value = "") {
  return `sonic:discovery-exposure:${utcDayKey()}:${type}:${hashStoreKey(value)}`;
}

function recentTrackKey(value = "") {
  return `sonic:discovery-recent-track:${hashStoreKey(value)}`;
}

async function countSnapshot(type, keys) {
  const result = await readMany(keys.map((key) => counterKey(type, key)));
  const rows = keys.map((key, index) => [
    key,
    result.ok ? Math.max(0, Number(result.values[index]) || 0) : 0
  ]);
  return Object.fromEntries(rows);
}

async function recordExposure(trackKey, artistKey) {
  const results = await Promise.all([
    trackKey
      ? incrementCounter(counterKey("track", trackKey), { expiresInSeconds: COUNTER_TTL_SECONDS })
      : Promise.resolve({ ok: true, count: 0, store: "none" }),
    artistKey
      ? incrementCounter(counterKey("artist", artistKey), { expiresInSeconds: COUNTER_TTL_SECONDS })
      : Promise.resolve({ ok: true, count: 0, store: "none" }),
    trackKey
      ? writeJson(recentTrackKey(trackKey), { at: Date.now() }, {
          expiresInSeconds: RECENT_EXPOSURE_TTL_SECONDS
        })
      : Promise.resolve(false)
  ]);
  return {
    trackCount: results[0].count,
    artistCount: results[1].count,
    durable: results.some((result) => result.store === "durable")
  };
}

async function recentTrackSnapshot(keys) {
  const result = await readMany(keys.map((key) => recentTrackKey(key)));
  const rows = keys.map((key, index) => {
    const value = result.values[index];
    let parsed = value;
    if (typeof value === "string") {
      try {
        parsed = JSON.parse(value);
      } catch (_error) {
        parsed = null;
      }
    }
    return [key, Math.max(0, Number(parsed?.at) || 0)];
  });
  return Object.fromEntries(rows);
}

module.exports = async function handler(req, res) {
  if (!requireMusicApi(req, res, {
    methods: ["POST"],
    feature: "discovery_exposure",
    enabledEnv: "SONIC_DISCOVERY_EXPOSURE_ENABLED",
    defaultEnabled: true,
    allowGlobalFallback: false,
    budgetOnStart: false
  })) return;

  const body = parseBody(req);
  const action = trimText(body.action || "snapshot", 24).toLowerCase();
  const anonymousId = cleanAnonymousId(body.anonymousId || body.anonymous_id);
  if (!anonymousId) {
    sendJson(req, res, 400, { ok: false, error: "invalid_anonymous_id" }, ALLOWED_METHODS);
    return;
  }

  if (action === "record") {
    const trackKey = cleanExposureKey(body.trackKey);
    const artistKey = cleanExposureKey(body.artistKey);
    if (!trackKey && !artistKey) {
      sendJson(req, res, 400, { ok: false, error: "missing_exposure_key" }, ALLOWED_METHODS);
      return;
    }
    try {
      const recorded = await recordExposure(trackKey, artistKey);
      sendJson(req, res, 200, {
        ok: true,
        action,
        ...recorded
      }, ALLOWED_METHODS);
    } catch (_error) {
      sendJson(req, res, 202, {
        ok: false,
        action,
        error: "exposure_store_unavailable"
      }, ALLOWED_METHODS);
    }
    return;
  }

  if (action !== "snapshot") {
    sendJson(req, res, 400, { ok: false, error: "invalid_action" }, ALLOWED_METHODS);
    return;
  }

  const trackKeys = uniqueKeys(body.trackKeys);
  const artistKeys = uniqueKeys(body.artistKeys);
  try {
    const [tracks, artists, recentTracks] = await Promise.all([
      countSnapshot("track", trackKeys),
      countSnapshot("artist", artistKeys),
      recentTrackSnapshot(trackKeys)
    ]);
    sendJson(req, res, 200, {
      ok: true,
      action,
      tracks,
      artists,
      recentTracks,
      ttlSeconds: COUNTER_TTL_SECONDS,
      recentTtlSeconds: RECENT_EXPOSURE_TTL_SECONDS,
      storeConfigured: Boolean(
        envText("KV_REST_API_URL") ||
        envText("UPSTASH_REDIS_REST_URL")
      )
    }, ALLOWED_METHODS);
  } catch (_error) {
    sendJson(req, res, 202, {
      ok: false,
      action,
      error: "exposure_store_unavailable",
      tracks: {},
      artists: {}
    }, ALLOWED_METHODS);
  }
};
