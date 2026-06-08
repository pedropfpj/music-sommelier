const crypto = require("node:crypto");

const memoryStore = new Map();

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
    return memoryStore.delete(key);
  }
  const result = await redisCommand(["DEL", key]);
  return result.ok;
}

module.exports = {
  deleteKey,
  hasDurableStore,
  hashStoreKey,
  readJson,
  writeJson
};
