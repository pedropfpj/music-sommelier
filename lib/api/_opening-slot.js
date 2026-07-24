const { hasDurableStore, incrementCounter } = require("./_usage-store");
const { envText, requireMusicApi, sendJson } = require("./_music-apis");

const OPENING_ROTATION_COUNTER_KEY = "sonic:opening-rotation:v3";
const ALLOWED_METHODS = ["GET", "OPTIONS"];

async function nextSupabaseOpeningSlot() {
  const supabaseUrl = envText("SUPABASE_URL").replace(/\/+$/, "");
  const serviceKey =
    envText("SUPABASE_SERVICE_ROLE_KEY") ||
    envText("SUPABASE_SERVICE_KEY") ||
    envText("SUPABASE_SERVICE_ROLE");
  if (!supabaseUrl || !serviceKey) return { ok: false, error: "supabase_not_configured" };

  const response = await fetch(`${supabaseUrl}/rest/v1/rpc/next_sonic_opening_slot`, {
    method: "POST",
    headers: {
      apikey: serviceKey,
      Authorization: `Bearer ${serviceKey}`,
      "Content-Type": "application/json"
    },
    body: "{}"
  });
  if (!response.ok) {
    return { ok: false, error: "supabase_rotation_failed" };
  }
  const slot = Number(await response.json().catch(() => null));
  return Number.isSafeInteger(slot) && slot >= 0
    ? { ok: true, slot, store: "supabase" }
    : { ok: false, error: "invalid_supabase_rotation_slot" };
}

module.exports = async function handler(req, res) {
  if (!requireMusicApi(req, res, {
    methods: ["GET"],
    feature: "opening_rotation",
    enabledEnv: "SONIC_OPENING_ROTATION_ENABLED",
    defaultEnabled: true,
    allowGlobalFallback: false,
    betaAccess: false
  })) {
    return;
  }

  res.setHeader("Cache-Control", "no-store, max-age=0");

  try {
    let result = null;
    if (hasDurableStore()) {
      const counter = await incrementCounter(OPENING_ROTATION_COUNTER_KEY);
      if (counter.ok && counter.count) {
        result = {
          ok: true,
          slot: Math.max(0, Number(counter.count) - 1),
          store: "durable"
        };
      }
    }
    if (!result) {
      const supabaseResult = await nextSupabaseOpeningSlot();
      if (supabaseResult.ok) result = supabaseResult;
    }
    if (!result) {
      const memoryCounter = await incrementCounter(OPENING_ROTATION_COUNTER_KEY);
      if (memoryCounter.ok && memoryCounter.count) {
        result = {
          ok: true,
          slot: Math.max(0, Number(memoryCounter.count) - 1),
          store: "memory"
        };
      }
    }

    if (!result?.ok) {
      sendJson(req, res, 503, {
        ok: false,
        error: "opening_rotation_unavailable"
      }, ALLOWED_METHODS);
      return;
    }

    sendJson(req, res, 200, {
      ok: true,
      slot: result.slot,
      durable: result.store === "durable" || result.store === "supabase",
      store: result.store,
      rotationVersion: 3
    }, ALLOWED_METHODS);
  } catch (_error) {
    sendJson(req, res, 503, {
      ok: false,
      error: "opening_rotation_unavailable"
    }, ALLOWED_METHODS);
  }
};
