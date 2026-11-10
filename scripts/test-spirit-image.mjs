#!/usr/bin/env node

import assert from "node:assert/strict";
import { createRequire } from "node:module";

const require = createRequire(import.meta.url);
const originalFetch = globalThis.fetch;
const environmentPattern = /^(SONIC_|OPENAI_|SUPABASE_|NEXT_PUBLIC_SUPABASE_|KV_|UPSTASH_)|^(NODE_ENV|VERCEL_ENV)$/;
const originalEnvironment = Object.fromEntries(Object.entries(process.env).filter(([key]) => environmentPattern.test(key)));
const calls = [];
const imageBase64 = "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAusB9Wl2nLkAAAAASUVORK5CYII=";
const imageResponse = () => Response.json({ data: [{ b64_json: imageBase64 }] });
let respond = imageResponse;

function setEnvironment(values = {}) {
  for (const key of Object.keys(process.env)) {
    if (environmentPattern.test(key)) delete process.env[key];
  }
  Object.assign(process.env, {
    NODE_ENV: "test",
    OPENAI_API_KEY: "test-image-key",
    SONIC_AI_IMAGE_ENABLED: "true",
    SONIC_AI_ALLOWED_ORIGINS: "http://localhost:4173",
    SONIC_REQUIRE_BETA_ACCESS_FOR_APIS: "false",
    SONIC_AI_IMAGE_REQUIRE_PREMIUM: "false",
    SONIC_SPIRIT_IMAGE_REQUIRE_TRUSTED_USER: "false",
    SONIC_AI_IMAGE_STORE_REQUIRED: "false",
    SONIC_REQUIRE_DURABLE_RATE_LIMITS: "false",
    SONIC_AI_IMAGE_DAILY_LIMIT: "25",
    SONIC_AI_IMAGE_MAX_PER_USER: "1",
    SONIC_AI_IMAGE_ALLOW_BETA_REGENERATION: "false",
    ...values
  });
}

try {
  setEnvironment();
  // Every external request must pass this fixture; no real network is used.
  globalThis.fetch = async (url, options) => {
    assert.equal(url, "https://api.openai.com/v1/images/generations");
    assert.equal(options.method, "POST");
    assert.equal(options.headers.Authorization, "Bearer test-image-key");
    assert.equal(options.headers["Content-Type"], "application/json");
    assert.ok(options.signal instanceof AbortSignal, "Image calls need a provider deadline");
    const body = JSON.parse(options.body);
    assert.equal(body.n, 1);
    assert.equal(body.size, "1024x1024");
    assert.equal(typeof body.prompt, "string");
    assert.ok(body.prompt.length > 0);
    assert.equal(body.response_format, undefined, "GPT Image returns base64 without legacy response_format");
    calls.push(body);
    return respond(body);
  };

  const { callOpenAiImage } = require("../lib/api/_openai.js");
  const handler = require("../api/spirit-image.js");
  const prompt = "Electronic studio with monitors, modular synths and warm groove lighting.";

  let result = await callOpenAiImage({ prompt });
  assert.equal(result.ok, true);
  assert.equal(result.payload.imageBase64, imageBase64);
  assert.equal(result.payload.model, "gpt-image-2.5-flare");
  assert.equal(calls.at(-1).quality, "medium");

  setEnvironment({ OPENAI_IMAGE_MODEL: "  gpt-image-1-mini  ", OPENAI_IMAGE_QUALITY: " low " });
  result = await callOpenAiImage({ prompt, model: "  ", quality: " " });
  assert.equal(result.payload.model, "gpt-image-1-mini", "Blank overrides must fall through to shared configuration");
  assert.equal(calls.at(-1).quality, "low");
  result = await callOpenAiImage({ prompt, model: " gpt-image-2.5-sunburst ", quality: " high " });
  assert.equal(result.payload.model, "gpt-image-2.5-sunburst");
  assert.equal(calls.at(-1).quality, "high");
  setEnvironment({ OPENAI_IMAGE_MODEL: " ", OPENAI_IMAGE_QUALITY: " " });
  result = await callOpenAiImage({ prompt });
  assert.equal(result.payload.model, "gpt-image-2.5-flare");
  assert.equal(calls.at(-1).quality, "medium");

  respond = () => Response.json({ data: [{ url: "https://images.example.test/system.png" }] });
  result = await callOpenAiImage({ prompt });
  assert.equal(result.payload.imageUrl, "https://images.example.test/system.png");
  respond = () => Response.json({ error: { message: "Model access denied" } }, { status: 403 });
  result = await callOpenAiImage({ prompt });
  assert.equal(result.status, 403);
  assert.equal(result.payload.error, "openai_image_failed");
  assert.equal(result.payload.detail, "Model access denied");
  respond = () => Response.json({ data: [] });
  result = await callOpenAiImage({ prompt });
  assert.equal(result.status, 502);
  assert.equal(result.payload.error, "missing_image_output");
  respond = () => new Response("invalid JSON", { status: 200 });
  result = await callOpenAiImage({ prompt });
  assert.equal(result.status, 502);
  assert.equal(result.payload.error, "missing_image_output");
  for (const name of ["TimeoutError", "AbortError"]) {
    respond = () => { throw new DOMException("Fixture timeout", name); };
    result = await callOpenAiImage({ prompt });
    assert.equal(result.status, 504);
    assert.equal(result.payload.error, "openai_image_timeout");
  }
  respond = () => { throw new TypeError("Fixture network failure"); };
  result = await callOpenAiImage({ prompt });
  assert.equal(result.status, 502);
  assert.equal(result.payload.error, "openai_image_unavailable");
  delete process.env.OPENAI_API_KEY;
  const beforeMissingKey = calls.length;
  result = await callOpenAiImage({ prompt });
  assert.equal(result.status, 503);
  assert.equal(result.payload.error, "missing_openai_api_key");
  assert.equal(calls.length, beforeMissingKey);

  async function invoke(body, { headers = {}, method = "POST" } = {}) {
    const req = {
      method,
      headers: { origin: "http://localhost:4173", "user-agent": "spirit-image-regression", ...headers },
      body
    };
    let rawBody = "";
    const res = {
      headers: {},
      setHeader(name, value) { this.headers[name] = value; },
      end(value = "") { rawBody += value; }
    };
    await handler(req, res);
    return { status: res.statusCode, body: JSON.parse(rawBody), headers: res.headers };
  }
  const profile = (userSignature, extra = {}) => ({
    userSignature, prompt, likes: 82, milestoneLikes: 70,
    spiritId: "engenheiro_groove", dominantStyles: "Tech House", ...extra
  });

  setEnvironment({ OPENAI_IMAGE_MODEL: "gpt-image-1-mini", OPENAI_IMAGE_QUALITY: "low" });
  respond = imageResponse;
  let response = await invoke(profile("shared-model-profile"));
  assert.equal(response.status, 200);
  assert.equal(response.body.model, "gpt-image-1-mini", "The route must honor the shared image model");
  assert.equal(calls.at(-1).quality, "low");
  assert.equal(response.body.imageBase64, imageBase64);
  assert.equal(response.body.reused, false);
  assert.equal(response.body.generationCount, 1);
  assert.equal(response.body.milestoneLikes, 70);
  const beforeReuse = calls.length;
  response = await invoke(profile("shared-model-profile", { spiritId: "alma_house", profileSignature: "changed-style" }));
  assert.equal(response.status, 200);
  assert.equal(response.body.reused, true);
  assert.equal(response.body.generationCount, 1);
  assert.equal(calls.length, beforeReuse, "The same user/milestone must reuse the stored artwork");
  response = await invoke(profile("shared-model-profile", { likes: 90, milestoneLikes: 90 }));
  assert.equal(response.status, 200);
  assert.equal(response.body.reused, false);
  assert.equal(calls.length, beforeReuse + 1, "A new milestone may generate its own artwork");

  setEnvironment({
    OPENAI_IMAGE_MODEL: "gpt-image-1-mini", OPENAI_IMAGE_QUALITY: "low",
    OPENAI_SPIRIT_IMAGE_MODEL: " gpt-image-2.5-sunburst ", OPENAI_SPIRIT_IMAGE_QUALITY: " high "
  });
  response = await invoke(profile("spirit-override-profile"));
  assert.equal(response.body.model, "gpt-image-2.5-sunburst");
  assert.equal(calls.at(-1).quality, "high");
  setEnvironment({
    OPENAI_IMAGE_MODEL: "gpt-image-1-mini", OPENAI_IMAGE_QUALITY: "low",
    OPENAI_SPIRIT_IMAGE_MODEL: " ", OPENAI_SPIRIT_IMAGE_QUALITY: " "
  });
  response = await invoke(profile("blank-spirit-override-profile"));
  assert.equal(response.body.model, "gpt-image-1-mini");
  assert.equal(calls.at(-1).quality, "low");

  const failures = [
    { name: "provider", status: 404, error: "openai_image_failed", respond: () => Response.json({ error: { message: "Unavailable model" } }, { status: 404 }) },
    { name: "empty", status: 502, error: "missing_image_output", respond: () => Response.json({ data: [] }) },
    { name: "timeout", status: 504, error: "openai_image_timeout", respond: () => { throw new DOMException("Fixture timeout", "TimeoutError"); } },
    { name: "body-timeout", status: 504, error: "openai_image_timeout", respond: () => ({ ok: true, json: async () => { throw new DOMException("Fixture body timeout", "AbortError"); } }) },
    { name: "network", status: 502, error: "openai_image_unavailable", respond: () => { throw new TypeError("Fixture network failure"); } }
  ];
  for (const failure of failures) {
    setEnvironment();
    respond = failure.respond;
    const body = profile(`retry-${failure.name}`);
    response = await invoke(body);
    assert.equal(response.status, failure.status);
    assert.equal(response.body.error, failure.error);
    respond = imageResponse;
    response = await invoke(body);
    assert.equal(response.status, 200, `${failure.name} must release the lock for a retry`);
    assert.equal(response.body.reused, false);
    assert.equal(response.body.generationCount, 1, "Failures must not consume the milestone artwork quota");
  }

  setEnvironment();
  let finishImage;
  let imageStarted;
  const started = new Promise((resolve) => { imageStarted = resolve; });
  respond = () => new Promise((resolve) => { finishImage = resolve; imageStarted(); });
  const pendingBody = profile("concurrent-profile");
  const first = invoke(pendingBody);
  await started;
  const beforeConcurrent = calls.length;
  response = await invoke(pendingBody);
  assert.equal(response.status, 409);
  assert.equal(response.body.error, "image_generation_pending");
  assert.equal(calls.length, beforeConcurrent, "Concurrent clicks must not generate duplicate images");
  finishImage(imageResponse());
  assert.equal((await first).status, 200);
  response = await invoke(pendingBody);
  assert.equal(response.body.reused, true);
  assert.equal(calls.length, beforeConcurrent);

  respond = imageResponse;
  setEnvironment({ SONIC_AI_IMAGE_DAILY_LIMIT: "1" });
  const budgetOptions = { headers: { "user-agent": "spirit-image-budget-regression" } };
  response = await invoke(profile("budget-cached"), budgetOptions);
  assert.equal(response.status, 200);
  const beforeCachedBudget = calls.length;
  response = await invoke(profile("budget-cached"), budgetOptions);
  assert.equal(response.status, 200, "Cached images must remain available after the daily budget is spent");
  response = await invoke(profile("budget-blocked"), budgetOptions);
  assert.equal(response.status, 429);
  assert.equal(calls.length, beforeCachedBudget);
  process.env.SONIC_AI_IMAGE_DAILY_LIMIT = "25";
  response = await invoke(profile("budget-blocked"), budgetOptions);
  assert.equal(response.status, 200, "A denied budget must also release the image lock");

  const beforeGuards = calls.length;
  setEnvironment({ SONIC_AI_IMAGE_REQUIRE_PREMIUM: "true" });
  response = await invoke(profile("free-profile"));
  assert.equal(response.status, 402);
  assert.equal(response.body.error, "premium_required");
  setEnvironment({ SONIC_AI_IMAGE_STORE_REQUIRED: "true" });
  response = await invoke(profile("store-required"));
  assert.equal(response.status, 503);
  assert.equal(response.body.error, "durable_store_required");
  setEnvironment({ SONIC_REQUIRE_DURABLE_RATE_LIMITS: "true" });
  response = await invoke(profile("durable-budget-required"));
  assert.equal(response.status, 503);
  assert.equal(response.body.error, "durable_rate_limit_required");
  setEnvironment({ SONIC_REQUIRE_BETA_ACCESS_FOR_APIS: "true" });
  response = await invoke(profile("beta-required"));
  assert.equal(response.status, 401);
  assert.equal(response.body.error, "beta_access_required");
  setEnvironment({ SONIC_AI_IMAGE_ENABLED: "false" });
  response = await invoke(profile("disabled"));
  assert.equal(response.status, 403);
  assert.equal(response.body.error, "ai_feature_disabled");
  setEnvironment();
  response = await invoke(profile("wrong-origin"), { headers: { origin: "https://untrusted.example.test" } });
  assert.equal(response.status, 403);
  assert.equal(response.body.error, "origin_not_allowed");
  response = await invoke(profile("wrong-method"), { method: "GET" });
  assert.equal(response.status, 405);
  assert.equal(calls.length, beforeGuards, "Access and storage gates must run before the image provider");

  console.log("Spirit image regression passed: model/quality precedence, provider contract, milestone reuse, concurrent clicks, failure retries, budgets and access guards.");
} finally {
  globalThis.fetch = originalFetch;
  for (const key of Object.keys(process.env)) {
    if (environmentPattern.test(key)) delete process.env[key];
  }
  Object.assign(process.env, originalEnvironment);
}
