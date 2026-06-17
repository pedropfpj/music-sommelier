const { envInt, envText, parseBody, requireMusicApi, sendJson, trimText } = require("./_music-apis");

const TOKEN_URL = "https://secure.soundcloud.com/oauth/token";
const TRACKS_URL = "https://api.soundcloud.com/tracks";
let cachedToken = null;

function safeLimit(value, fallback = 12) {
  const parsed = Number.parseInt(String(value || ""), 10);
  if (!Number.isFinite(parsed)) return fallback;
  return Math.max(1, Math.min(50, parsed));
}

function parseBpmFromText(...values) {
  const text = values.filter(Boolean).join(" ");
  const explicit = text.match(/\b([1-2]\d{2}|9\d)\s*bpm\b/i);
  if (explicit) return Number(explicit[1]) || 0;
  const bracketed = text.match(/(?:^|\D)([1-2]\d{2})(?=\D|$)/);
  const parsed = Number(bracketed?.[1] || 0);
  return parsed >= 80 && parsed <= 240 ? parsed : 0;
}

function cleanTitle(value = "") {
  return trimText(value, 160)
    .replace(/\s+\|\s+free\s+download.*$/i, "")
    .replace(/\s+\[\s*free\s+download\s*\].*$/i, "")
    .replace(/\s+\(\s*free\s+download\s*\).*$/i, "")
    .trim();
}

function selectPlayableTranscoding(row) {
  const transcodings = Array.isArray(row?.media?.transcodings) ? row.media.transcodings : [];
  const playable = transcodings.filter((item) => item?.url);
  if (!playable.length) return null;

  const progressiveMp3 = playable.find((item) => {
    const protocol = String(item?.format?.protocol || "").toLowerCase();
    const mime = String(item?.format?.mime_type || "").toLowerCase();
    return protocol === "progressive" && /mpeg|mp3/.test(mime);
  });
  if (progressiveMp3) return progressiveMp3;

  return playable.find((item) => String(item?.format?.protocol || "").toLowerCase() === "progressive") || null;
}

async function resolvePreviewUrl(row, token) {
  if (row?.streamable === false) return "";
  const transcoding = selectPlayableTranscoding(row);
  const endpoint = String(transcoding?.url || "").trim();
  if (!endpoint) return "";

  try {
    const response = await fetch(endpoint, {
      headers: {
        Authorization: `OAuth ${token}`,
        Accept: "application/json"
      }
    });
    const payload = await response.json().catch(() => ({}));
    if (!response.ok || !payload?.url) return "";
    return trimText(payload.url, 1800);
  } catch (_err) {
    return "";
  }
}

async function normalizeTrack(row, style, token, { resolvePreview = false } = {}) {
  const user = row?.user || {};
  const publisherArtist = trimText(row?.publisher_metadata?.artist || "", 90);
  const userName = trimText(user.username || "", 90);
  const genre = trimText(row?.genre || "", 90);
  const tags = trimText(row?.tag_list || "", 220);
  const title = cleanTitle(row?.title || "");
  const artist = publisherArtist || userName;
  if (!title || !artist || !row?.permalink_url) return null;

  const publisherLabel = row?.publisher_metadata?.p_line || row?.publisher_metadata?.label_name || "";
  const label = trimText(row?.label_name || publisherLabel || user.username || "SoundCloud", 90);
  const bpm = Number(row?.bpm) || parseBpmFromText(row?.title, row?.description, genre, tags);
  const durationMs = Number(row?.duration) || 0;
  const createdAt = String(row?.created_at || "").slice(0, 10);
  const releaseDate = String(row?.release_date || row?.display_date || createdAt || "").slice(0, 10);
  const previewUrl = resolvePreview ? await resolvePreviewUrl(row, token) : "";

  return {
    id: String(row.id || row.permalink_url),
    title,
    song: title,
    artist,
    soundcloudUser: userName,
    publisherArtist,
    label,
    style,
    genre,
    tags,
    bpmExact: bpm > 0 ? bpm : 0,
    durationSec: durationMs > 0 ? Math.round(durationMs / 1000) : 0,
    releaseDate: releaseDate || "SoundCloud",
    previewUrl,
    preview: previewUrl,
    previewCandidates: previewUrl ? [previewUrl] : [],
    previewSource: previewUrl ? "soundcloud_transcoding" : "",
    previewResolved: Boolean(previewUrl),
    streamable: row?.streamable !== false,
    soundcloudTrackUrl: row.permalink_url,
    artworkUrl: row.artwork_url || user.avatar_url || "",
    description: trimText(row.description || "", 700),
    playbackCount: Number(row.playback_count) || 0,
    likesCount: Number(row.likes_count) || 0,
    source: "soundcloud_api",
    soundcloudVerified: true,
    existenceVerified: true
  };
}

async function getSoundCloudToken() {
  const now = Date.now();
  if (cachedToken?.value && cachedToken.expiresAt > now + 30000) return cachedToken.value;

  const clientId = envText("SOUNDCLOUD_CLIENT_ID");
  const clientSecret = envText("SOUNDCLOUD_CLIENT_SECRET");
  if (!clientId || !clientSecret) {
    const error = new Error("missing_soundcloud_credentials");
    error.statusCode = 503;
    throw error;
  }

  const credentials = Buffer.from(`${clientId}:${clientSecret}`).toString("base64");
  const response = await fetch(TOKEN_URL, {
    method: "POST",
    headers: {
      Authorization: `Basic ${credentials}`,
      "Content-Type": "application/x-www-form-urlencoded",
      Accept: "application/json"
    },
    body: new URLSearchParams({ grant_type: "client_credentials" }).toString()
  });

  const payload = await response.json().catch(() => ({}));
  if (!response.ok || !payload?.access_token) {
    const error = new Error("soundcloud_auth_failed");
    error.statusCode = response.status || 502;
    error.detail = payload?.error_description || payload?.error || response.statusText;
    throw error;
  }

  const expiresIn = Math.max(60, Number(payload.expires_in) || 3600);
  cachedToken = {
    value: payload.access_token,
    expiresAt: now + (expiresIn * 1000) - 60000
  };
  return cachedToken.value;
}

async function fetchSoundCloudTracks({ query, style, limit, previewResolveLimit: requestedPreviewResolveLimit = null }) {
  const token = await getSoundCloudToken();
  const requestedLimit = Number.parseInt(String(requestedPreviewResolveLimit ?? ""), 10);
  const previewResolveLimit = envInt(
    "SONIC_SOUNDCLOUD_PREVIEW_RESOLVE_LIMIT",
    Number.isFinite(requestedLimit)
      ? Math.max(0, Math.min(20, requestedLimit))
      : Math.min(Number(limit) || 16, 16),
    0,
    20
  );
  const params = new URLSearchParams({
    q: query,
    limit: String(limit),
    linked_partitioning: "0"
  });

  const response = await fetch(`${TRACKS_URL}?${params.toString()}`, {
    headers: {
      Authorization: `OAuth ${token}`,
      Accept: "application/json"
    }
  });

  const payload = await response.json().catch(() => ({}));
  if (!response.ok) {
    const error = new Error("soundcloud_search_failed");
    error.statusCode = response.status || 502;
    error.detail = payload?.errors?.[0]?.error_message || payload?.error_description || payload?.error || response.statusText;
    throw error;
  }

  const rawRows = Array.isArray(payload) ? payload : Array.isArray(payload.collection) ? payload.collection : [];
  const tracks = (await Promise.all(
    rawRows.map((row, index) => normalizeTrack(row, style, token, {
      resolvePreview: index < previewResolveLimit
    }))
  )).filter(Boolean);

  return tracks;
}

module.exports = async function handler(req, res) {
  if (!requireMusicApi(req, res, {
    methods: ["POST"],
    feature: "soundcloud-search",
    enabledEnv: "SONIC_MUSIC_APIS_ENABLED",
    defaultEnabled: false,
    dailyLimitEnv: "SONIC_SOUNDCLOUD_SEARCH_DAILY_LIMIT",
    defaultDailyLimit: 80
  })) return;

  const body = parseBody(req);
  const query = trimText(body.query, 140);
  const style = trimText(body.style, 80);
  const limit = safeLimit(body.limit, envInt("SONIC_SOUNDCLOUD_SEARCH_LIMIT", 12, 1, 50));
  const requestedPreviewResolveLimit = Number.parseInt(String(body.previewResolveLimit || ""), 10);

  if (!query) {
    sendJson(req, res, 400, { error: "missing_query" });
    return;
  }

  try {
    const tracks = await fetchSoundCloudTracks({ query, style, limit, previewResolveLimit: requestedPreviewResolveLimit });
    sendJson(req, res, 200, {
      ok: true,
      source: "soundcloud",
      query,
      style,
      count: tracks.length,
      tracks
    });
  } catch (error) {
    sendJson(req, res, error.statusCode || 500, {
      error: error.message || "soundcloud_search_failed",
      detail: error.detail || ""
    });
  }
};
