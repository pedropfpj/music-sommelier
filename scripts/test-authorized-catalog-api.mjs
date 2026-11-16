import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { once } from "node:events";
import { createServer } from "node:http";
import { test } from "node:test";
import catalogApi from "../api/authorized-catalog.js";
import audioApi from "../api/authorized-audio.js";

const now = Date.parse("2026-11-16T12:00:00.000Z");
const env = {
  VERCEL_ENV: "preview",
  SUPABASE_URL: "https://example.supabase.co",
  SUPABASE_SERVICE_ROLE_KEY: "test-fixture-key"
};
const bytes = Buffer.from("test fixture for HTTP byte ranges, never published");
const hash = createHash("sha256").update(bytes).digest("hex");
const bucket = "authorized-web-previews";
const path = `/api/authorized-audio?file=${hash}.wav`;
const track = {
  id: "isrc:USABC2600001", title: "Fixture", artist: "Tester", style: "full_on_night", bpm: 150,
  previewPath: path, availableFrom: "2026-11-16T11:00:00.000Z", expiresAt: "2026-11-16T13:00:00.000Z"
};

function payload(recordings) {
  return { version: 1, mode: "authorized-previews", recordings };
}

function nextTrack(fields) {
  return { ...track, id: "mbid:ab012345-bcde-4fff-8abc-5678ab123456",
    previewPath: `/api/authorized-audio?file=${"b".repeat(64)}.mp3`, ...fields };
}

function privateStorage({ publicBucket = false, body = bytes, status = 200, headStatus = 200,
  headTag = '"fixture"', getTag = '"fixture"', calls = [] } = {}) {
  return async (url, options) => {
    assert.equal(url.origin, env.SUPABASE_URL);
    assert.equal(options.headers.apikey, env.SUPABASE_SERVICE_ROLE_KEY);
    assert.equal(options.headers.Authorization, `Bearer ${env.SUPABASE_SERVICE_ROLE_KEY}`);
    assert.equal(options.redirect, "error");
    assert.equal(options.cache, "no-store");
    calls.push([options.method, url.pathname]);
    if (url.pathname === `/storage/v1/bucket/${bucket}`) {
      return Response.json({ id: bucket, public: publicBucket });
    }
    assert.equal(url.pathname, `/storage/v1/object/authenticated/${bucket}/${hash}.wav`);
    return options.method === "HEAD"
      ? new Response(null, { status: headStatus, headers: { etag: headTag } })
      : new Response(body, { status, headers: { etag: getTag } });
  };
}

async function server(t, options) {
  const catalog = catalogApi.createHandler(options);
  const audio = audioApi.createHandler(options);
  const listener = createServer((req, res) => {
    const handler = req.url.split("?")[0] === "/api/authorized-catalog" ? catalog : audio;
    handler(req, res).catch(error => {
      res.destroy(error);
    });
  }).listen(0, "127.0.0.1");
  await once(listener, "listening");
  t.after(() => {
    listener.closeAllConnections();
    return new Promise(resolve => listener.close(resolve));
  });
  return `http://127.0.0.1:${listener.address().port}`;
}

test("the default preview manifest is empty without a storage request", async t => {
  let storageCalls = 0;
  const base = await server(t, { env: { VERCEL_ENV: "preview" }, now: () => now, fetcher: async () => ++storageCalls });
  const result = await fetch(base + "/api/authorized-catalog");
  assert.equal(result.status, 200);
  assert.match(result.headers.get("cache-control"), /no-store/);
  assert.deepEqual(await result.json(), payload([]));
  assert.equal((await fetch(base + path)).status, 404);
  assert.equal(storageCalls, 0);
});

test("production, local default and custom targets cannot expose manifest or audio", async t => {
  for (const targetEnv of [{ VERCEL_ENV: "production" }, { VERCEL_ENV: "development" },
    { VERCEL_ENV: "preview", VERCEL_TARGET_ENV: "staging" }, { VERCEL_ENV: "" }]) {
    let storageCalls = 0;
    const base = await server(t, {
      manifest: payload([track]), env: { ...env, ...targetEnv }, now: () => now,
      fetcher: async () => ++storageCalls
    });
    assert.equal((await fetch(base + "/api/authorized-catalog")).status, 404);
    assert.equal((await fetch(base + path)).status, 404);
    assert.equal(storageCalls, 0);
  }
});

test("catalog returns only current approvals and strips private metadata", async t => {
  const base = await server(t, {
    manifest: payload([{ ...track, availableFrom: new Date(now).toISOString(), approvalRef: "internal-only" },
      nextTrack({ expiresAt: new Date(now).toISOString() })]),
    env, now: () => now, fetcher: privateStorage()
  });
  const result = await fetch(base + "/api/authorized-catalog");
  assert.equal(result.status, 200);
  assert.equal(result.headers.get("cross-origin-resource-policy"), "same-origin");
  assert.deepEqual(await result.json(), payload([{ ...track, availableFrom: new Date(now).toISOString() }]));
  const invalidMethod = await fetch(base + "/api/authorized-catalog", { method: "POST" });
  assert.equal(invalidMethod.status, 405);
  assert.equal(invalidMethod.headers.get("allow"), "GET");
});

test("unknown, duplicate, future and wrong-file requests are rejected before storage", async t => {
  let storageCalls = 0;
  const base = await server(t, {
    manifest: payload([nextTrack({ availableFrom: "2026-11-16T12:00:00.001Z" })]),
    env, now: () => now, fetcher: async () => ++storageCalls
  });
  for (const target of [path, nextTrack().previewPath, "/api/authorized-audio?file=../clip.wav",
    "/api/authorized-audio?file=https://other.example/clip.wav",
    `${path}&file=${hash}.wav`]) {
    assert.equal((await fetch(base + target)).status, 404, target);
  }
  assert.equal(storageCalls, 0);
  const ambiguous = await server(t, {
    manifest: payload([track, nextTrack({ previewPath: path })]), env, now: () => now,
    fetcher: async () => ++storageCalls
  });
  assert.deepEqual(await (await fetch(ambiguous + "/api/authorized-catalog")).json(), payload([]));
  assert.equal((await fetch(ambiguous + path)).status, 404);
  assert.equal(storageCalls, 0);
});

test("full audio, HEAD and browser byte ranges return only exact approved bytes", async t => {
  const base = await server(t, { manifest: payload([track]), env, now: () => now, fetcher: privateStorage() });
  const direct = await fetch(base + path);
  assert.equal(direct.status, 200);
  assert.equal(direct.headers.get("content-type"), "audio/wav");
  assert.match(direct.headers.get("cache-control"), /no-store/);
  assert.equal(direct.headers.get("content-length"), String(bytes.length));
  assert.equal(direct.headers.get("accept-ranges"), "bytes");
  assert.equal(direct.headers.get("etag"), null);
  assert.equal(direct.headers.get("access-control-allow-origin"), null);
  assert.deepEqual(Buffer.from(await direct.arrayBuffer()), bytes);
  const head = await fetch(base + path, { method: "HEAD" });
  assert.equal(head.status, 200);
  assert.equal(head.headers.get("content-length"), String(bytes.length));
  assert.equal((await head.arrayBuffer()).byteLength, 0);

  for (const [range, start, end] of [["bytes=0-1", 0, 1], ["bytes=5-", 5, bytes.length - 1],
    ["bytes=-2", bytes.length - 2, bytes.length - 1], ["bytes=0-9999", 0, bytes.length - 1]]) {
    const response = await fetch(base + path, { headers: { range } });
    assert.equal(response.status, 206);
    assert.equal(response.headers.get("content-range"), `bytes ${start}-${end}/${bytes.length}`);
    assert.deepEqual(Buffer.from(await response.arrayBuffer()), bytes.subarray(start, end + 1));
  }
  for (const range of ["bytes=99-", "bytes=0-1,4-6", "bytes=-0", "bytes=9-8"]) {
    const result = await fetch(base + path, { headers: { range } });
    assert.equal(result.status, 416);
    assert.equal(result.headers.get("content-range"), `bytes */${bytes.length}`);
  }
});

test("public bucket, invalid origin or unavailable storage fail closed", async t => {
  for (const [supabaseUrl, fetcher, expectedCalls] of [
    [env.SUPABASE_URL, privateStorage({ publicBucket: true }), 2],
    ["https://example.supabase.co.other.invalid/", privateStorage(), 0],
    ["https://example.supabase.co@other.invalid/", privateStorage(), 0],
    [env.SUPABASE_URL, async () => { throw new Error("transport details"); }, 2]
  ]) {
    let storageCalls = 0;
    const base = await server(t, { manifest: payload([track]), env: { ...env, SUPABASE_URL: supabaseUrl },
      now: () => now, fetcher: (...args) => {
        storageCalls++;
        return fetcher(...args);
      }
    });
    const result = await fetch(base + "/api/authorized-catalog");
    assert.equal(result.status, 503);
    assert.equal(await result.text(), "");
    const audioResult = await fetch(base + path);
    assert.ok([502, 503].includes(audioResult.status));
    assert.equal(await audioResult.text(), "");
    assert.equal(storageCalls, expectedCalls);
  }
});

test("revoked cached, altered and replaced objects never return any audio", async t => {
  for (const [options, expectedStatus] of [
    [{ headStatus: 404 }, 404],
    [{ status: 404 }, 404],
    [{ body: Buffer.from("changed content") }, 502],
    [{ headTag: '"new-object-version"' }, 502]
  ]) {
    const base = await server(t, { manifest: payload([track]), env, now: () => now, fetcher: privateStorage(options) });
    const result = await fetch(base + path, { headers: { range: "bytes=0-1" } });
    assert.equal(result.status, expectedStatus);
    assert.equal((await result.arrayBuffer()).byteLength, 0);
  }
});

test("rights ending while the object is fetched block the response", async t => {
  let timestamp = now;
  const upstream = privateStorage();
  const base = await server(t, { manifest: payload([track]), env, now: () => timestamp, fetcher: (url, opts) => {
    if (opts.method === "HEAD") timestamp = Date.parse(track.expiresAt);
    return upstream(url, opts);
  } });
  const result = await fetch(base + path);
  assert.equal(result.status, 404);
  assert.equal((await result.arrayBuffer()).byteLength, 0);
});
