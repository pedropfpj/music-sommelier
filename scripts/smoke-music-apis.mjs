#!/usr/bin/env node
import assert from "node:assert/strict";
import path from "node:path";
import { createRequire } from "node:module";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const rootDir = path.resolve(__dirname, "..");
const require = createRequire(import.meta.url);

const tests = [];

function test(name, fn) {
  tests.push({ name, fn });
}

function jsonResponse(payload, status = 200) {
  return {
    ok: status >= 200 && status < 300,
    status,
    statusText: status >= 200 && status < 300 ? "OK" : "ERROR",
    async json() {
      return payload;
    }
  };
}

function makeReq({ method = "POST", body = {}, query = {}, headers = {} } = {}) {
  return {
    method,
    body,
    query,
    headers: {
      host: "localhost",
      "user-agent": "sonic-smoke-test",
      ...headers
    }
  };
}

function makeRes() {
  return {
    statusCode: 200,
    headers: {},
    body: "",
    setHeader(name, value) {
      this.headers[name.toLowerCase()] = value;
    },
    end(value = "") {
      this.body = String(value || "");
    },
    json() {
      return this.body ? JSON.parse(this.body) : null;
    }
  };
}

async function callHandler(relativePath, options = {}) {
  const handlerPath = path.join(rootDir, relativePath);
  const handler = require(handlerPath);
  const req = makeReq(options);
  const res = makeRes();
  await handler(req, res);
  return res;
}

async function callMusicRoute(route, options = {}) {
  return callHandler("api/music.js", {
    ...options,
    query: {
      ...(options.query || {}),
      route
    }
  });
}

async function withEnv(updates, fn) {
  const previous = new Map();
  Object.keys(updates).forEach((key) => {
    previous.set(key, process.env[key]);
    const value = updates[key];
    if (value === undefined || value === null) delete process.env[key];
    else process.env[key] = String(value);
  });
  try {
    return await fn();
  } finally {
    previous.forEach((value, key) => {
      if (value === undefined) delete process.env[key];
      else process.env[key] = value;
    });
  }
}

async function withFetchMock(mock, fn) {
  const originalFetch = globalThis.fetch;
  const calls = [];
  globalThis.fetch = async (url, options = {}) => {
    calls.push({ url: String(url), options });
    return mock(String(url), options, calls);
  };
  try {
    return await fn(calls);
  } finally {
    globalThis.fetch = originalFetch;
  }
}

const safeDefaults = {
  SONIC_MUSIC_APIS_ENABLED: "false",
  SONIC_TRACK_METADATA_ENABLED: "true",
  SONIC_ITUNES_ENABLED: "true",
  SONIC_DEEZER_ENABLED: "false",
  SONIC_COVER_ART_ENABLED: "true",
  SONIC_ARTIST_PROFILE_ENABLED: "true",
  SONIC_MUSICBRAINZ_ENABLED: "true",
  SONIC_WIKIPEDIA_ENABLED: "true",
  SONIC_RADIO_BROWSER_ENABLED: "true",
  SONIC_AI_TEXT_ENABLED: "true",
  SONIC_AI_IMAGE_ENABLED: "true",
  SONIC_ARTIST_BIO_ENABLED: "true",
  SONIC_LASTFM_ENABLED: "true",
  SONIC_SPOTIFY_ENABLED: "true",
  SONIC_SOUNDCLOUD_ENABLED: "true",
  SONIC_YOUTUBE_ENABLED: "true",
  SONIC_BANDSINTOWN_ENABLED: "true",
  SONIC_CATALOG_EXTRA_ENABLED: "true",
  SONIC_CATALOG_ENRICHMENT_ENABLED: "true",
  SONIC_NEWS_FEED_ENABLED: "true",
  OPENAI_API_KEY: "",
  YOUTUBE_API_KEY: "",
  YOUTUBE_DATA_API_KEY: "",
  SOUNDCLOUD_CLIENT_ID: "",
  SOUNDCLOUD_CLIENT_SECRET: "",
  BANDSINTOWN_APP_ID: "",
  DISCOGS_USER_TOKEN: "",
  DISCOGS_TOKEN: "",
  SUPABASE_URL: "",
  SUPABASE_ANON_KEY: "",
  NEXT_PUBLIC_SUPABASE_ANON_KEY: "",
  LASTFM_API_KEY: "",
  SONIC_LASTFM_API_KEY: "",
  SPOTIFY_CLIENT_ID: "",
  SPOTIFY_CLIENT_SECRET: "",
  SONIC_SPOTIFY_CLIENT_ID: "",
  SONIC_SPOTIFY_CLIENT_SECRET: "",
  SUPABASE_SERVICE_ROLE_KEY: "",
  SUPABASE_SERVICE_KEY: "",
  SUPABASE_SERVICE_ROLE: ""
};

test("credentialed APIs require credentials when active", async () => {
  await withEnv(safeDefaults, async () => {
    const soundcloud = await callHandler("api/soundcloud-search.js", {
      body: { query: "test", style: "techno" }
    });
    const spotify = await callMusicRoute("spotify-search", {
      body: { query: "ANNA Hidden Beauties", artist: "ANNA", song: "Hidden Beauties", style: "techno" }
    });
    const youtube = await callHandler("api/youtube-search.js", {
      body: { query: "test", artist: "ANNA", song: "Hidden Beauties" }
    });
    assert.equal(soundcloud.statusCode, 503);
    assert.equal(soundcloud.json().error, "missing_soundcloud_credentials");
    assert.equal(spotify.statusCode, 503);
    assert.equal(spotify.json().error, "missing_spotify_credentials");
    assert.equal(youtube.statusCode, 503);
    assert.equal(youtube.json().error, "missing_youtube_api_key");
  });
});

test("integration health reports provider state", async () => {
  await withEnv(safeDefaults, async () => {
    const res = await callHandler("api/integration-health.js", { method: "GET" });
    const payload = res.json();
    assert.equal(res.statusCode, 200);
    assert.equal(payload.providers.spotify.status, "needs_credentials");
    assert.equal(payload.providers.soundcloud.status, "needs_credentials");
    assert.equal(payload.providers.youtube.status, "needs_credentials");
    assert.equal(payload.providers.lastfm.status, "needs_credentials");
    assert.equal(payload.providers.catalogExtra.status, "needs_credentials");
    assert.equal(payload.providers.catalogEnrichment.status, "needs_credentials");
    assert.equal(payload.providers.artistBio.status, "needs_credentials");
    assert.equal(payload.providers.trackInsight.status, "needs_credentials");
    assert.equal(payload.providers.newsTranslate.status, "needs_credentials");
    assert.equal(payload.providers.spiritImage.status, "needs_credentials");
    assert.equal(payload.providers.newsFeed.enabled, true);
    assert.equal(payload.providers.radioBrowser.enabled, true);
  });
});

test("Spotify search returns verified track links through backend credentials", async () => {
  await withEnv({
    ...safeDefaults,
    SPOTIFY_CLIENT_ID: "spotify-client",
    SPOTIFY_CLIENT_SECRET: "spotify-secret"
  }, async () => {
    await withFetchMock((url, options) => {
      if (url.includes("accounts.spotify.com/api/token")) {
        assert.equal(options.method, "POST");
        assert.match(String(options.headers?.Authorization || ""), /^Basic /);
        return jsonResponse({ access_token: "spotify-token", expires_in: 3600 });
      }
      if (url.includes("api.spotify.com/v1/search")) {
        assert.match(String(options.headers?.Authorization || ""), /^Bearer spotify-token$/);
        const parsedUrl = new URL(url);
        assert.equal(parsedUrl.searchParams.get("type"), "track");
        return jsonResponse({
          tracks: {
            items: [{
              id: "spotify-track-1",
              name: "Hidden Beauties",
              duration_ms: 390000,
              popularity: 64,
              preview_url: null,
              external_urls: { spotify: "https://open.spotify.com/track/spotify-track-1" },
              external_ids: { isrc: "BR1234567890" },
              artists: [{ name: "ANNA" }],
              album: {
                name: "Hidden Beauties",
                release_date: "2018-01-01",
                images: [{ url: "https://i.scdn.co/image/cover" }]
              }
            }]
          }
        });
      }
      return jsonResponse({}, 404);
    }, async () => {
      const res = await callMusicRoute("spotify-search", {
        body: {
          artist: "ANNA",
          song: "Hidden Beauties",
          style: "techno",
          limit: 3
        }
      });
      const payload = res.json();
      assert.equal(res.statusCode, 200);
      assert.equal(payload.bestTrack.spotifyTrackUrl, "https://open.spotify.com/track/spotify-track-1");
      assert.equal(payload.bestTrack.spotifyVerified, true);
      assert.ok(payload.attribution.providers.includes("Spotify"));
    });
  });
});

test("explicit flags can still disable sensitive APIs", async () => {
  await withEnv({
    ...safeDefaults,
    SONIC_LASTFM_ENABLED: "false",
    SONIC_SPOTIFY_ENABLED: "false",
    SONIC_SOUNDCLOUD_ENABLED: "false",
    SONIC_YOUTUBE_ENABLED: "false",
    SONIC_CATALOG_EXTRA_ENABLED: "false",
    SONIC_CATALOG_ENRICHMENT_ENABLED: "false"
  }, async () => {
    const res = await callHandler("api/integration-health.js", { method: "GET" });
    const payload = res.json();
    assert.equal(res.statusCode, 200);
    assert.equal(payload.providers.lastfm.status, "disabled");
    assert.equal(payload.providers.spotify.status, "disabled");
    assert.equal(payload.providers.soundcloud.status, "disabled");
    assert.equal(payload.providers.youtube.status, "disabled");
    assert.equal(payload.providers.catalogExtra.status, "disabled");
    assert.equal(payload.providers.catalogEnrichment.status, "disabled");
  });
});

test("track metadata prefers exact iTunes matches and returns attribution", async () => {
  await withEnv(safeDefaults, async () => {
    await withFetchMock((url) => {
      assert.match(url, /itunes\.apple\.com\/search/);
      const parsedUrl = new URL(url);
      assert.equal(parsedUrl.searchParams.get("media"), "music");
      assert.equal(parsedUrl.searchParams.get("limit"), "5");
      return jsonResponse({
        resultCount: 2,
        results: [
          {
            trackId: 1,
            artistName: "ANNA",
            trackName: "Hidden Beauties",
            collectionName: "Hidden Beauties",
            previewUrl: "https://audio.example/anna.m4a",
            releaseDate: "2018-01-01T00:00:00Z",
            trackTimeMillis: 390000,
            primaryGenreName: "Techno",
            artworkUrl100: "https://is1-ssl.mzstatic.com/image/thumb/a/100x100bb.jpg",
            trackViewUrl: "https://music.apple.com/track/1"
          },
          {
            trackId: 2,
            artistName: "ANNA",
            trackName: "Hidden Beauties Remix",
            collectionName: "Remixes",
            previewUrl: "https://audio.example/remix.m4a",
            releaseDate: "2019-01-01T00:00:00Z",
            trackTimeMillis: 420000,
            primaryGenreName: "Techno",
            artworkUrl100: "https://is1-ssl.mzstatic.com/image/thumb/b/100x100bb.jpg",
            trackViewUrl: "https://music.apple.com/track/2"
          }
        ]
      });
    }, async () => {
      const res = await callMusicRoute("track-metadata", {
        body: {
          artist: "ANNA",
          song: "Hidden Beauties",
          album: "Hidden Beauties",
          durationSec: 390,
          releaseYear: 2018,
          style: "techno"
        }
      });
      const payload = res.json();
      assert.equal(res.statusCode, 200);
      assert.equal(payload.best.song, "Hidden Beauties");
      assert.equal(payload.best.source, "itunes");
      assert.ok(payload.attribution.providers.includes("iTunes"));
    });
  });
});

test("cover art resolves MusicBrainz/Cover Art Archive through backend", async () => {
  await withEnv(safeDefaults, async () => {
    await withFetchMock((url) => {
      if (url.includes("musicbrainz.org/ws/2/release-group")) {
        return jsonResponse({
          "release-groups": [{
            id: "rg-1",
            title: "Hidden Beauties",
            score: 100,
            "artist-credit-phrase": "ANNA",
            "primary-type": "Single",
            "first-release-date": "2018-01-01"
          }]
        });
      }
      if (url.includes("coverartarchive.org/release-group/rg-1")) {
        return jsonResponse({
          images: [{
            front: true,
            thumbnails: { large: "https://img.example/hidden-beauties.jpg" }
          }]
        });
      }
      return jsonResponse({}, 404);
    }, async () => {
      const res = await callMusicRoute("cover-art", {
        body: { artist: "ANNA", song: "Hidden Beauties", album: "Hidden Beauties", releaseYear: 2018 }
      });
      const payload = res.json();
      assert.equal(res.statusCode, 200);
      assert.equal(payload.imageUrl, "https://img.example/hidden-beauties.jpg");
      assert.equal(payload.source, "cover-art-archive");
    });
  });
});

test("artist profile merges MusicBrainz, Wikipedia and iTunes signals", async () => {
  await withEnv(safeDefaults, async () => {
    await withFetchMock((url) => {
      if (url.includes("musicbrainz.org/ws/2/artist")) {
        return jsonResponse({
          artists: [{
            id: "artist-1",
            name: "Avalon",
            score: 100,
            type: "Person",
            country: "GB",
            area: { name: "London" },
            tags: [{ name: "psytrance", count: 10 }]
          }]
        });
      }
      if (url.includes("wikipedia.org/api/rest_v1/page/summary")) {
        return jsonResponse({
          title: "Avalon",
          description: "British musician",
          extract: "Avalon is a British musician, DJ and electronic music producer known for psytrance releases, albums, singles, festival performances and studio collaborations in the global electronic music scene.",
          content_urls: { desktop: { page: "https://en.wikipedia.org/wiki/Avalon" } }
        });
      }
      if (url.includes("itunes.apple.com/search")) {
        return jsonResponse({
          results: [{
            artistName: "Avalon",
            primaryGenreName: "Dance",
            collectionName: "Psytrance Collection",
            artistViewUrl: "https://music.apple.com/artist/avalon"
          }]
        });
      }
      return jsonResponse({}, 404);
    }, async () => {
      const res = await callMusicRoute("artist-profile", {
        body: { artist: "Avalon", language: "en" }
      });
      const payload = res.json();
      assert.equal(res.statusCode, 200);
      assert.equal(payload.profile.country, "GB");
      assert.match(payload.profile.wikiSummary, /electronic music producer/i);
      assert.ok(payload.attribution.providers.includes("MusicBrainz"));
    });
  });
});

test("Last.fm remains credential-gated", async () => {
  await withEnv({ ...safeDefaults, SONIC_LASTFM_ENABLED: "true" }, async () => {
    const res = await callMusicRoute("lastfm-artist", {
      body: { artist: "Avalon" }
    });
    assert.equal(res.statusCode, 503);
    assert.equal(res.json().error, "missing_lastfm_api_key");
  });
});

test("Radio Browser falls back from strict locale filters to style-family results", async () => {
  await withEnv(safeDefaults, async () => {
    await withFetchMock((url) => {
      const hasLocaleFilter = url.includes("countrycode=") || url.includes("language=");
      if (hasLocaleFilter) return jsonResponse([]);
      return jsonResponse([{
        stationuuid: "station-1",
        name: "Techno Test Radio",
        url_resolved: "https://radio.example/stream.mp3",
        homepage: "https://radio.example",
        tags: "techno,electronic",
        country: "Germany",
        countrycode: "DE",
        language: "German",
        codec: "MP3",
        bitrate: 192,
        votes: 42,
        clickcount: 1000,
        lastcheckok: 1
      }]);
    }, async () => {
      const res = await callMusicRoute("radio-browser", {
        body: {
          style: "hard_techno",
          country: "BR",
          language: "pt",
          minBitrate: 128,
          healthyOnly: true,
          limit: 4
        }
      });
      const payload = res.json();
      assert.equal(res.statusCode, 200);
      assert.equal(payload.stations.length, 1);
      assert.equal(payload.stations[0].name, "Techno Test Radio");
      assert.ok(payload.tags.includes("hard techno") || payload.tags.includes("techno"));
    });
  });
});

test("catalog enrichment persistence is safely no-op until enabled", async () => {
  await withEnv(safeDefaults, async () => {
    await withFetchMock(() => {
      throw new Error("Supabase should not be called while enrichment is disabled");
    }, async () => {
      const { persistCatalogEnrichments, supabaseConfig } = require(path.join(rootDir, "lib/api/_catalog-enrichment-store.js"));
      assert.equal(supabaseConfig().enabled, false);
      const result = await persistCatalogEnrichments({
        entityType: "artist",
        artist: "Avalon",
        source: "smoke-test",
        payload: { ok: true }
      });
      assert.equal(result.ok, true);
      assert.equal(result.enabled, false);
    });
  });
});

let failed = 0;
for (const item of tests) {
  try {
    await item.fn();
    console.log(`ok - ${item.name}`);
  } catch (error) {
    failed += 1;
    console.error(`not ok - ${item.name}`);
    console.error(error?.stack || error);
  }
}

if (failed) {
  console.error(`\n${failed}/${tests.length} smoke tests failed.`);
  process.exit(1);
}

console.log(`\n${tests.length} smoke tests passed.`);
