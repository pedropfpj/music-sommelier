import assert from "node:assert/strict";
import { createRequire } from "node:module";

const require = createRequire(import.meta.url);
const handler = require(process.env.SONIC_OPENING_HANDLER_PATH || "../lib/api/_opening-slot.js");
const environmentPattern = /^(SONIC_|SUPABASE_|KV_|UPSTASH_)|^(NODE_ENV|VERCEL_ENV)$/;
const originalEnvironment = Object.fromEntries(Object.entries(process.env).filter(([key]) => environmentPattern.test(key)));
const originalFetch = globalThis.fetch;
const originalWarn = console.warn;
const originalError = console.error;
const logs = [];
const calls = [];
const canary = "fixture-secret-must-not-leak";
let redis = () => Response.json({ result: 7 });
let rpc = () => Response.json(42);

function configure({ durable = true, supabase = true, enabled = true } = {}) {
  for (const key of Object.keys(process.env)) if (environmentPattern.test(key)) delete process.env[key];
  Object.assign(process.env, {
    NODE_ENV: "production",
    SONIC_OPENING_ROTATION_ENABLED: String(enabled),
    SONIC_MUSIC_ALLOWED_ORIGINS: "https://sonic.example.test",
    ...(durable ? { KV_REST_API_URL: "https://redis.example.test", KV_REST_API_TOKEN: canary } : {}),
    ...(supabase ? { SUPABASE_URL: "https://db.example.test", SUPABASE_SERVICE_ROLE_KEY: canary } : {})
  });
  calls.length = 0;
}

async function invoke({ method = "GET", origin = "https://sonic.example.test" } = {}) {
  let body = "";
  const response = { headers: {}, setHeader(name, value) { this.headers[name] = value; }, end(value = "") { body = value; } };
  await handler({ method, headers: { origin, host: "api.example.test" } }, response);
  assert.ok(!body.includes(canary), "Provider exceptions must not expose credentials to the browser");
  return { status: response.statusCode, body: body ? JSON.parse(body) : null, headers: response.headers };
}

try {
  console.warn = (...args) => logs.push(args);
  console.error = (...args) => logs.push(args);
  globalThis.fetch = async (url, options) => {
    calls.push(url);
    assert.equal(options.method, "POST");
    assert.equal(options.headers.Authorization, `Bearer ${canary}`);
    if (url === "https://redis.example.test") {
      assert.deepEqual(JSON.parse(options.body), ["INCR", "sonic:opening-rotation:v3"]);
      return redis();
    }
    assert.equal(url, "https://db.example.test/rest/v1/rpc/next_sonic_opening_slot");
    assert.equal(options.headers.apikey, canary);
    assert.equal(options.body, "{}");
    return rpc();
  };

  configure();
  let response = await invoke();
  assert.equal(response.status, 200);
  assert.equal(response.body.slot, 6);
  assert.equal(response.body.store, "durable");
  assert.equal(response.body.durable, true);
  assert.equal(response.body.rotationVersion, 3);
  assert.equal(response.headers["Cache-Control"], "no-store, max-age=0");
  assert.deepEqual(calls, ["https://redis.example.test"], "A working Redis counter should not consume an RPC slot");

  for (const failure of [
    () => { throw new TypeError(canary); },
    () => Response.json({ error: canary }, { status: 503 }),
    () => Response.json({ result: "invalid-counter" }),
    () => Response.json({ result: Number.MAX_SAFE_INTEGER + 4 })
  ]) {
    configure(); redis = failure; rpc = () => Response.json(0);
    response = await invoke();
    assert.equal(response.status, 200, "Redis transport/HTTP/invalid counter errors must reach Supabase");
    assert.equal(response.body.store, "supabase");
    assert.equal(response.body.slot, 0, "A real RPC slot of zero is valid");
    assert.equal(response.body.durable, true);
    assert.deepEqual(calls, ["https://redis.example.test", "https://db.example.test/rest/v1/rpc/next_sonic_opening_slot"]);
  }

  for (const invalid of [null, "", false, {}, -1, Number.MAX_SAFE_INTEGER + 1]) {
    configure(); redis = () => { throw new Error(canary); }; rpc = () => Response.json(invalid);
    response = await invoke();
    assert.equal(response.status, 503, "An invalid RPC body must not invent slot zero");
    assert.deepEqual(response.body, { ok: false, error: "opening_rotation_unavailable" });
    assert.equal(calls.length, 2, "A failed configured Redis store must not be retried and mislabeled as memory");
  }
  for (const failure of [
    () => { throw new TypeError(canary); },
    () => Response.json({ error: canary }, { status: 503 }),
    () => new Response("not JSON", { status: 200 })
  ]) {
    configure(); redis = () => { throw new Error(canary); }; rpc = failure;
    response = await invoke();
    assert.equal(response.status, 503);
    assert.equal(response.body.error, "opening_rotation_unavailable");
    assert.equal(calls.length, 2);
  }

  configure({ durable: false }); rpc = () => Response.json("19");
  response = await invoke();
  assert.equal(response.status, 200);
  assert.equal(response.body.slot, 19);
  assert.equal(response.body.store, "supabase");
  assert.equal(calls.length, 1);

  configure({ durable: false }); rpc = () => { throw new Error(canary); };
  const first = await invoke();
  const second = await invoke();
  assert.equal(first.status, 200, "Local memory must remain usable when no Redis store is configured and RPC fails");
  assert.equal(first.body.store, "memory");
  assert.equal(first.body.durable, false);
  assert.equal(second.body.slot, first.body.slot + 1);
  configure({ durable: false, supabase: false });
  response = await invoke();
  assert.equal(response.status, 200);
  assert.equal(response.body.store, "memory");
  assert.equal(calls.length, 0);

  configure({ enabled: false });
  assert.equal((await invoke()).status, 403);
  assert.equal(calls.length, 0);
  configure();
  assert.equal((await invoke({ method: "POST" })).status, 405);
  assert.equal((await invoke({ origin: "https://untrusted.example.test" })).status, 403);
  assert.equal((await invoke({ method: "OPTIONS" })).status, 204);
  assert.equal(calls.length, 0, "Method, origin and feature guards must run before storage access");
  assert.deepEqual(logs, [], "Fallbacks must not log provider exceptions or keys");
  console.log("Opening store recovery passed: Redis errors reach Supabase, real zero slots work, malformed results fail safely, local memory and request guards remain available without secret logging.");
} finally {
  globalThis.fetch = originalFetch;
  console.warn = originalWarn;
  console.error = originalError;
  for (const key of Object.keys(process.env)) if (environmentPattern.test(key)) delete process.env[key];
  Object.assign(process.env, originalEnvironment);
}
