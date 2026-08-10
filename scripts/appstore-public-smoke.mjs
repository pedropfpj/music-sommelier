#!/usr/bin/env node

const baseUrl = String(process.env.SONIC_APPSTORE_SMOKE_BASE_URL || process.argv[2] || "https://sonicsearch.app")
  .replace(/\/+$/, "");
const origin = String(process.env.SONIC_APPSTORE_SMOKE_ORIGIN || "capacitor://localhost").trim();

const requiredChecks = [];
const optionalChecks = [];

function addCheck(list, name, fn) {
  list.push({ name, fn });
}

function betaGateHint(payload = {}) {
  if (payload?.error !== "beta_access_required") return "";
  return " (set SONIC_REQUIRE_BETA_ACCESS_FOR_APIS=false for the public App Store runtime, then redeploy)";
}

async function request(path, options = {}) {
  const headers = {
    Origin: origin,
    Accept: "application/json",
    ...(options.headers || {})
  };
  if (options.body && !headers["Content-Type"]) headers["Content-Type"] = "application/json";

  const response = await fetch(`${baseUrl}${path}`, {
    method: options.method || "GET",
    headers,
    body: options.body ? JSON.stringify(options.body) : undefined
  });
  const text = await response.text();
  let payload = {};
  try {
    payload = text ? JSON.parse(text) : {};
  } catch (_err) {
    payload = { raw: text.slice(0, 500) };
  }
  return { response, payload };
}

async function requestHead(path) {
  return fetch(`${baseUrl}${path}`, { method: "HEAD" });
}

function assertJsonOk(name, result, predicate) {
  const { response, payload } = result;
  if (response.ok && predicate(payload)) return;
  const detail = payload?.error || payload?.message || response.statusText || "unexpected_response";
  throw new Error(`${name} returned ${response.status} ${detail}${betaGateHint(payload)}`);
}

addCheck(requiredChecks, "privacy page", async () => {
  const response = await requestHead("/privacy.html");
  if (!response.ok) throw new Error(`privacy page returned ${response.status}`);
});

addCheck(requiredChecks, "terms page", async () => {
  const response = await requestHead("/terms.html");
  if (!response.ok) throw new Error(`terms page returned ${response.status}`);
});

addCheck(requiredChecks, "social login config", async () => {
  const result = await request("/api/social-config");
  assertJsonOk(
    "social login config",
    result,
    (payload) =>
      payload?.ok === true &&
      payload?.enabled === true &&
      Boolean(payload?.supabaseUrl) &&
      Boolean(payload?.supabaseAnonKey) &&
      Array.isArray(payload?.providers) &&
      payload.providers.includes("apple") &&
      payload.providers.includes("google")
  );
});

for (const provider of ["apple", "google"]) {
  addCheck(requiredChecks, `${provider} login redirect`, async () => {
    const redirectTo = encodeURIComponent("sonicsearch://auth/callback");
    const result = await request(`/api/social-oauth-url?provider=${provider}&redirect_to=${redirectTo}`);
    assertJsonOk(
      `${provider} login redirect`,
      result,
      (payload) => payload?.ok === true && payload?.provider === provider && /^https:\/\//.test(payload?.url || "")
    );
  });
}

addCheck(requiredChecks, "news feed", async () => {
  const result = await request("/api/news-feed?limit=1");
  assertJsonOk("news feed", result, (payload) => payload?.ok === true && Array.isArray(payload.items));
});

addCheck(requiredChecks, "Jornal Sonic", async () => {
  const result = await request("/api/news-editor?limit=1");
  assertJsonOk(
    "Jornal Sonic",
    result,
    (payload) =>
      payload?.ok === true &&
      Array.isArray(payload.articles) &&
      payload.articles.some((article) => article?.status === "published" && Boolean(article?.title))
  );
});

addCheck(requiredChecks, "community feed", async () => {
  const result = await request("/api/community?limit=1");
  assertJsonOk("community feed", result, (payload) => payload?.ok === true && Array.isArray(payload.posts));
});

addCheck(requiredChecks, "track metadata", async () => {
  const result = await request("/api/track-metadata", {
    method: "POST",
    body: { artist: "Daft Punk", song: "One More Time", style: "house", releaseYear: 2000 }
  });
  assertJsonOk("track metadata", result, (payload) => payload?.enabled === true && Boolean(payload?.best?.previewUrl));
});

addCheck(requiredChecks, "cover art", async () => {
  const result = await request("/api/cover-art", {
    method: "POST",
    body: { artist: "Daft Punk", song: "One More Time", album: "Discovery", releaseYear: 2001 }
  });
  assertJsonOk("cover art", result, (payload) => Boolean(payload?.imageUrl || payload?.cover?.imageUrl));
});

addCheck(requiredChecks, "artist profile", async () => {
  const result = await request("/api/artist-profile", {
    method: "POST",
    body: { artist: "Astrix", language: "en" }
  });
  assertJsonOk("artist profile", result, (payload) => payload?.enabled === true && Boolean(payload?.profile));
});

addCheck(requiredChecks, "radio browser", async () => {
  const result = await request("/api/radio-browser", {
    method: "POST",
    body: { style: "hard_techno", limit: 2, healthyOnly: true }
  });
  assertJsonOk("radio browser", result, (payload) => payload?.enabled === true && Array.isArray(payload?.stations));
});

addCheck(optionalChecks, "integration health", async () => {
  const result = await request("/api/integration-health");
  assertJsonOk("integration health", result, (payload) => payload?.ok === true && Boolean(payload?.providers));
});

addCheck(optionalChecks, "catalog extra", async () => {
  const result = await request("/api/catalog-extra?limit=1");
  assertJsonOk("catalog extra", result, (payload) => payload?.enabled === true);
});

addCheck(optionalChecks, "events", async () => {
  const result = await request("/api/ticketmaster-events?artist=michael%20bibi&size=1");
  assertJsonOk("events", result, (payload) => Array.isArray(payload?.events));
});

async function runChecks(label, checks, failOnError) {
  let failed = 0;
  for (const check of checks) {
    try {
      await check.fn();
      console.log(`PASS ${label} ${check.name}`);
    } catch (error) {
      failed += 1;
      console.log(`${failOnError ? "FAIL" : "WARN"} ${label} ${check.name} - ${error.message}`);
    }
  }
  return failed;
}

console.log(`App Store public smoke: ${baseUrl}`);
console.log(`Origin: ${origin}`);

const requiredFailed = await runChecks("required", requiredChecks, true);
const optionalFailed = await runChecks("optional", optionalChecks, false);

if (optionalFailed) console.log(`${optionalFailed} optional check(s) need review.`);
if (requiredFailed) {
  console.error(`${requiredFailed} required App Store smoke check(s) failed.`);
  process.exit(1);
}

console.log("All required App Store smoke checks passed.");
