const {
  envText,
  parseBody,
  requireMusicApi,
  sendJson,
  trimText
} = require("./_music-apis");
const {
  hasDurableStore,
  hashStoreKey,
  incrementCounter,
  readMany,
  writeJson
} = require("./_usage-store");

const ALLOWED_METHODS = ["POST", "OPTIONS"];
const MAX_SNAPSHOT_ITEMS = 48;
const COUNTER_TTL_SECONDS = 60 * 60 * 36;
const RECENT_EXPOSURE_TTL_SECONDS = 120;
const SUPABASE_EXPOSURE_EVENT = "discovery_exposure";
const SUPABASE_EXPOSURE_LIMIT = 2000;

function supabaseConfig() {
  const supabaseUrl = envText("SUPABASE_URL").replace(/\/+$/, "");
  const serviceKey =
    envText("SUPABASE_SERVICE_ROLE_KEY") ||
    envText("SUPABASE_SERVICE_KEY") ||
    envText("SUPABASE_SERVICE_ROLE");
  return {
    enabled: Boolean(supabaseUrl && serviceKey),
    supabaseUrl,
    serviceKey
  };
}

function supabaseHeaders(config, extras = {}) {
  return {
    apikey: config.serviceKey,
    Authorization: `Bearer ${config.serviceKey}`,
    Accept: "application/json",
    ...extras
  };
}

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

async function recordSupabaseExposure(config, trackKey, artistKey, anonymousId) {
  const response = await fetch(`${config.supabaseUrl}/rest/v1/beta_events`, {
    method: "POST",
    headers: supabaseHeaders(config, {
      "Content-Type": "application/json",
      Prefer: "return=minimal"
    }),
    body: JSON.stringify([{
      event_name: SUPABASE_EXPOSURE_EVENT,
      source: "discovery_rotation_v2",
      client_hash: hashStoreKey(anonymousId).slice(0, 24),
      payload: {
        track_key: trackKey || "",
        artist_key: artistKey || ""
      }
    }])
  });
  if (!response.ok) throw new Error("supabase_exposure_insert_failed");
  return {
    trackCount: null,
    artistCount: null,
    durable: true,
    store: "supabase"
  };
}

async function supabaseExposureSnapshot(config, trackKeys, artistKeys) {
  const since = new Date(Date.now() - COUNTER_TTL_SECONDS * 1000).toISOString();
  const params = new URLSearchParams({
    select: "created_at,payload",
    event_name: `eq.${SUPABASE_EXPOSURE_EVENT}`,
    created_at: `gte.${since}`,
    order: "created_at.desc",
    limit: String(SUPABASE_EXPOSURE_LIMIT)
  });
  const response = await fetch(`${config.supabaseUrl}/rest/v1/beta_events?${params.toString()}`, {
    headers: supabaseHeaders(config)
  });
  if (!response.ok) throw new Error("supabase_exposure_snapshot_failed");
  const rows = await response.json();
  const requestedTracks = new Set(trackKeys);
  const requestedArtists = new Set(artistKeys);
  const tracks = Object.fromEntries(trackKeys.map((key) => [key, 0]));
  const artists = Object.fromEntries(artistKeys.map((key) => [key, 0]));
  const recentTracks = Object.fromEntries(trackKeys.map((key) => [key, 0]));

  (Array.isArray(rows) ? rows : []).forEach((row) => {
    const trackKey = cleanExposureKey(row?.payload?.track_key);
    const artistKey = cleanExposureKey(row?.payload?.artist_key);
    const createdAt = Math.max(0, Date.parse(row?.created_at || "") || 0);
    if (trackKey && requestedTracks.has(trackKey)) {
      tracks[trackKey] += 1;
      recentTracks[trackKey] = Math.max(recentTracks[trackKey], createdAt);
    }
    if (artistKey && requestedArtists.has(artistKey)) {
      artists[artistKey] += 1;
    }
  });
  return { tracks, artists, recentTracks, store: "supabase" };
}

async function recordExposure(trackKey, artistKey, anonymousId) {
  const config = supabaseConfig();
  if (!hasDurableStore() && config.enabled) {
    try {
      return await recordSupabaseExposure(config, trackKey, artistKey, anonymousId);
    } catch (_error) {
      // The in-memory counters keep recommendation delivery non-blocking during a provider outage.
    }
  }
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
    durable: results.some((result) => result?.store === "durable"),
    store: results.some((result) => result?.store === "durable") ? "redis" : "memory"
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

async function exposureSnapshot(trackKeys, artistKeys) {
  const config = supabaseConfig();
  if (!hasDurableStore() && config.enabled) {
    try {
      return await supabaseExposureSnapshot(config, trackKeys, artistKeys);
    } catch (_error) {
      // Fall through to the best-effort memory snapshot.
    }
  }
  const [tracks, artists, recentTracks] = await Promise.all([
    countSnapshot("track", trackKeys),
    countSnapshot("artist", artistKeys),
    recentTrackSnapshot(trackKeys)
  ]);
  return {
    tracks,
    artists,
    recentTracks,
    store: hasDurableStore() ? "redis" : "memory"
  };
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
      const recorded = await recordExposure(trackKey, artistKey, anonymousId);
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
    const snapshot = await exposureSnapshot(trackKeys, artistKeys);
    sendJson(req, res, 200, {
      ok: true,
      action,
      tracks: snapshot.tracks,
      artists: snapshot.artists,
      recentTracks: snapshot.recentTracks,
      ttlSeconds: COUNTER_TTL_SECONDS,
      recentTtlSeconds: RECENT_EXPOSURE_TTL_SECONDS,
      store: snapshot.store,
      storeConfigured: hasDurableStore() || supabaseConfig().enabled
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
