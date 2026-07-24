#!/usr/bin/env node

import assert from "node:assert/strict";
import { createRequire } from "node:module";

const require = createRequire(import.meta.url);
const handler = require("../lib/api/_discovery-exposure");

function request(body) {
  return {
    method: "POST",
    body,
    url: "/api/discovery-exposure",
    headers: {
      host: "sonicsearch.app",
      origin: "https://sonicsearch.app",
      "user-agent": "sonic-test",
      "x-forwarded-for": "127.0.0.1"
    }
  };
}

function response() {
  let payload = null;
  return {
    statusCode: 0,
    headers: {},
    setHeader(name, value) {
      this.headers[String(name).toLowerCase()] = value;
    },
    end(value = "") {
      payload = value ? JSON.parse(value) : null;
    },
    get payload() {
      return payload;
    }
  };
}

const anonymousId = "00000000-0000-4000-8000-000000000001";
const recordResponse = response();
await handler(request({
  action: "record",
  anonymousId,
  trackKey: "artist-a::track-a",
  artistKey: "artist-a"
}), recordResponse);
assert.equal(recordResponse.statusCode, 200);
assert.equal(recordResponse.payload.ok, true);
assert.equal(recordResponse.payload.trackCount, 1);
assert.equal(recordResponse.payload.artistCount, 1);

const secondRecordResponse = response();
await handler(request({
  action: "record",
  anonymousId,
  trackKey: "artist-a::track-a",
  artistKey: "artist-a"
}), secondRecordResponse);
assert.equal(secondRecordResponse.payload.trackCount, 2);

const snapshotResponse = response();
await handler(request({
  action: "snapshot",
  anonymousId,
  trackKeys: ["artist-a::track-a", "artist-b::track-b"],
  artistKeys: ["artist-a", "artist-b"]
}), snapshotResponse);
assert.equal(snapshotResponse.statusCode, 200);
assert.equal(snapshotResponse.payload.ok, true);
assert.equal(snapshotResponse.payload.tracks["artist-a::track-a"], 2);
assert.equal(snapshotResponse.payload.tracks["artist-b::track-b"], 0);
assert.equal(snapshotResponse.payload.artists["artist-a"], 2);
assert(Number(snapshotResponse.payload.recentTracks["artist-a::track-a"]) > 0);

const invalidResponse = response();
await handler(request({ action: "record", anonymousId: "", trackKey: "x" }), invalidResponse);
assert.equal(invalidResponse.statusCode, 400);
assert.equal(invalidResponse.payload.error, "invalid_anonymous_id");

const originalFetch = globalThis.fetch;
const originalSupabaseUrl = process.env.SUPABASE_URL;
const originalSupabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
process.env.SUPABASE_URL = "https://sonic-test.supabase.co";
process.env.SUPABASE_SERVICE_ROLE_KEY = "test-service-key";
const supabaseCalls = [];
globalThis.fetch = async (url, options = {}) => {
  supabaseCalls.push({ url: String(url), method: options.method || "GET" });
  if (options.method === "POST") return { ok: true };
  return {
    ok: true,
    async json() {
      return [{
        created_at: new Date().toISOString(),
        payload: {
          track_key: "artist-s::track-s",
          artist_key: "artist-s"
        }
      }];
    }
  };
};

const durableRecordResponse = response();
await handler(request({
  action: "record",
  anonymousId,
  trackKey: "artist-s::track-s",
  artistKey: "artist-s"
}), durableRecordResponse);
assert.equal(durableRecordResponse.statusCode, 200);
assert.equal(durableRecordResponse.payload.durable, true);
assert.equal(durableRecordResponse.payload.store, "supabase");
assert.equal(durableRecordResponse.payload.trackCount, null);

const durableSnapshotResponse = response();
await handler(request({
  action: "snapshot",
  anonymousId,
  trackKeys: ["artist-s::track-s"],
  artistKeys: ["artist-s"]
}), durableSnapshotResponse);
assert.equal(durableSnapshotResponse.payload.storeConfigured, true);
assert.equal(durableSnapshotResponse.payload.store, "supabase");
assert.equal(durableSnapshotResponse.payload.tracks["artist-s::track-s"], 1);
assert.equal(durableSnapshotResponse.payload.artists["artist-s"], 1);
assert(Number(durableSnapshotResponse.payload.recentTracks["artist-s::track-s"]) > 0);
assert(supabaseCalls.some((call) => call.method === "POST"));
assert(supabaseCalls.some((call) => call.method === "GET"));

globalThis.fetch = originalFetch;
if (originalSupabaseUrl === undefined) delete process.env.SUPABASE_URL;
else process.env.SUPABASE_URL = originalSupabaseUrl;
if (originalSupabaseServiceKey === undefined) delete process.env.SUPABASE_SERVICE_ROLE_KEY;
else process.env.SUPABASE_SERVICE_ROLE_KEY = originalSupabaseServiceKey;

console.log(
  "Discovery exposure API tests passed: bounded anonymous counters use Redis, Supabase, or memory fallback."
);
