const crypto = require("node:crypto");

const memoryStore = new Map();
const memoryCounters = new Map();

function storeUrl() {
  return String(
    process.env.KV_REST_API_URL ||
      process.env.UPSTASH_REDIS_REST_URL ||
      ""
  ).replace(/\/+$/, "");
}

function storeToken() {
  return String(
    process.env.KV_REST_API_TOKEN ||
      process.env.UPSTASH_REDIS_REST_TOKEN ||
      ""
  ).trim();
}

function hasDurableStore() {
  return Boolean(storeUrl() && storeToken());
}

function hashStoreKey(value = "") {
  return crypto
    .createHash("sha256")
    .update(String(value || ""))
    .digest("hex")
    .slice(0, 40);
}

async function redisCommand(command = []) {
  const url = storeUrl();
  const token = storeToken();
  if (!url || !token) return { ok: false, result: null, error: "store_not_configured" };
  const response = await fetch(url, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json"
    },
    body: JSON.stringify(command)
  });
  const payload = await response.json().catch(() => ({}));
  if (!response.ok) {
    return {
      ok: false,
      result: null,
      error: payload?.error || response.statusText || "store_request_failed"
    };
  }
  return { ok: true, result: payload?.result };
}

async function readJson(key) {
  if (!key) return null;
  if (!hasDurableStore()) {
    return memoryStore.get(key) || null;
  }
  const result = await redisCommand(["GET", key]);
  if (!result.ok || !result.result) return null;
  if (typeof result.result === "object") return result.result;
  try {
    return JSON.parse(String(result.result));
  } catch (_err) {
    return null;
  }
}

async function writeJson(key, value, options = {}) {
  if (!key || !value) return false;
  if (!hasDurableStore()) {
    if (options.onlyIfMissing && memoryStore.has(key)) return false;
    memoryStore.set(key, value);
    return true;
  }
  const command = ["SET", key, JSON.stringify(value)];
  if (options.expiresInSeconds) command.push("EX", Number(options.expiresInSeconds));
  if (options.onlyIfMissing) command.push("NX");
  const result = await redisCommand(command);
  return result.ok && (result.result === "OK" || result.result === "ok" || result.result === true);
}

async function deleteKey(key) {
  if (!key) return false;
  if (!hasDurableStore()) {
    memoryCounters.delete(key);
    return memoryStore.delete(key);
  }
  const result = await redisCommand(["DEL", key]);
  return result.ok;
}

function memoryCounterValue(key, expiresInSeconds = 0) {
  const now = Date.now();
  const current = memoryCounters.get(key);
  if (!current || (current.expiresAt && current.expiresAt <= now)) {
    const next = {
      count: 1,
      expiresAt: expiresInSeconds ? now + Number(expiresInSeconds) * 1000 : 0
    };
    memoryCounters.set(key, next);
    return next.count;
  }
  current.count = Math.max(0, Number(current.count) || 0) + 1;
  memoryCounters.set(key, current);
  return current.count;
}

async function incrementCounter(key, options = {}) {
  if (!key) return { ok: false, count: 0, store: "none", error: "missing_key" };
  const expiresInSeconds = Math.max(0, Number(options.expiresInSeconds) || 0);
  if (!hasDurableStore()) {
    return {
      ok: true,
      count: memoryCounterValue(key, expiresInSeconds),
      store: "memory"
    };
  }

  const result = await redisCommand(["INCR", key]);
  if (!result.ok) {
    return { ok: false, count: 0, store: "durable", error: result.error || "counter_failed" };
  }
  const count = Math.max(0, Number(result.result) || 0);
  if (count === 1 && expiresInSeconds) {
    await redisCommand(["EXPIRE", key, expiresInSeconds]);
  }
  return { ok: true, count, store: "durable" };
}

async function enforceDailyUsageLimit({ key = "", limit = 0, expiresInSeconds = 0 } = {}) {
  const safeLimit = Math.max(0, Number(limit) || 0);
  const store = hasDurableStore() ? "durable" : "memory";
  if (!safeLimit) return { ok: true, current: 0, remaining: null, limit: safeLimit, store };
  const counter = await incrementCounter(key, { expiresInSeconds });
  if (!counter.ok) {
    return { ok: false, current: 0, remaining: 0, limit: safeLimit, store: counter.store, error: counter.error };
  }
  const remaining = Math.max(0, safeLimit - counter.count);
  return {
    ok: counter.count <= safeLimit,
    current: counter.count,
    remaining,
    limit: safeLimit,
    store: counter.store
  };
}

module.exports = {
  deleteKey,
  enforceDailyUsageLimit,
  hasDurableStore,
  hashStoreKey,
  incrementCounter,
  readJson,
  writeJson
};
