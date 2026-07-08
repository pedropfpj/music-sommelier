#!/usr/bin/env node

const baseUrl = String(process.env.SONIC_API_AUDIT_BASE_URL || process.argv[2] || "https://sonicsearch.app")
  .replace(/\/+$/, "");

const requiredProviders = [
  "trackMetadata",
  "coverArt",
  "artistProfile",
  "radioBrowser",
  "catalogExtra",
  "artistEvents",
  "ticketmaster",
  "spotify",
  "youtube",
  "artistBio",
  "trackInsight",
  "newsTranslate",
  "spiritImage",
  "soundcloud",
  "lastfm",
  "bandsintown",
  "newsFeed",
  "catalogEnrichment"
];

const routeChecks = [
  {
    name: "spotify",
    path: "/api/spotify-search",
    method: "POST",
    body: { artist: "Daft Punk", song: "One More Time", style: "house" },
    ok(payload) {
      return Boolean(payload?.bestTrack?.spotifyTrackUrl);
    }
  },
  {
    name: "trackMetadata",
    path: "/api/track-metadata",
    method: "POST",
    body: { artist: "Daft Punk", song: "One More Time", style: "house", releaseYear: 2000 },
    ok(payload) {
      return Boolean(payload?.enabled && payload?.best?.previewUrl);
    }
  },
  {
    name: "coverArt",
    path: "/api/cover-art",
    method: "POST",
    body: { artist: "Daft Punk", song: "One More Time", album: "Discovery", releaseYear: 2001 },
    ok(payload) {
      return Boolean(payload?.imageUrl);
    }
  },
  {
    name: "artistProfile",
    path: "/api/artist-profile",
    method: "POST",
    body: { artist: "Avalon", language: "en" },
    ok(payload) {
      return Boolean(payload?.enabled && payload?.profile);
    }
  },
  {
    name: "radioBrowser",
    path: "/api/radio-browser",
    method: "POST",
    body: { style: "hard_techno", limit: 2, healthyOnly: true },
    ok(payload) {
      return Boolean(payload?.enabled && Array.isArray(payload?.stations) && payload.stations.length);
    }
  },
  {
    name: "catalogExtra",
    path: "/api/catalog-extra?limit=1",
    ok(payload) {
      return Boolean(payload?.enabled && ((payload?.artists?.length || 0) + (payload?.tracks?.length || 0)) > 0);
    }
  },
  {
    name: "newsFeed",
    path: "/api/news-feed?limit=2",
    ok(payload) {
      return Boolean(payload?.enabled && Array.isArray(payload?.items));
    }
  },
  {
    name: "events",
    path: "/api/ticketmaster-events?artist=michael%20bibi&size=2",
    ok(payload) {
      return Boolean(Array.isArray(payload?.events));
    }
  }
];

function providerStatus(item = {}) {
  if (item.status) return item.status;
  if (item.enabled) return "active";
  if (item.configured === false) return "needs_credentials";
  return "disabled";
}

async function fetchJson(path, options = {}) {
  const response = await fetch(`${baseUrl}${path}`, {
    method: options.method || "GET",
    headers: options.body ? { "Content-Type": "application/json" } : undefined,
    body: options.body ? JSON.stringify(options.body) : undefined
  });
  const payload = await response.json().catch(() => ({}));
  return { response, payload };
}

let failed = 0;

console.log(`API activation audit: ${baseUrl}`);

const { response: healthResponse, payload: health } = await fetchJson("/api/integration-health");
if (!healthResponse.ok || !health?.providers) {
  console.error(`not ok - integration-health (${healthResponse.status})`);
  process.exit(1);
}

for (const key of requiredProviders) {
  const item = health.providers[key] || {};
  const status = providerStatus(item);
  const line = `${key}: ${status}`;
  if (status === "active") {
    console.log(`ok - ${line}`);
  } else {
    failed += 1;
    const reason = item.reason ? ` (${item.reason})` : "";
    console.log(`not ok - ${line}${reason}`);
  }
}

for (const check of routeChecks) {
  const { response, payload } = await fetchJson(check.path, check);
  if (response.ok && check.ok(payload)) {
    console.log(`ok - route ${check.name}`);
  } else {
    failed += 1;
    console.log(`not ok - route ${check.name} (${response.status}${payload?.error ? ` ${payload.error}` : ""})`);
  }
}

if (failed) {
  console.error(`${failed} API activation checks still need attention.`);
  process.exit(1);
}

console.log("All API activation checks passed.");
