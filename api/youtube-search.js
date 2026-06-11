const { envInt, envText, parseBody, requireMusicApi, sendJson, trimText } = require("./_music-apis");

const SEARCH_URL = "https://www.googleapis.com/youtube/v3/search";

function safeLimit(value, fallback = 5) {
  const parsed = Number.parseInt(String(value || ""), 10);
  if (!Number.isFinite(parsed)) return fallback;
  return Math.max(1, Math.min(10, parsed));
}

function normalizeVideo(row = {}) {
  const videoId = trimText(row?.id?.videoId || "", 80);
  const snippet = row?.snippet || {};
  if (!videoId) return null;
  const url = `https://www.youtube.com/watch?v=${encodeURIComponent(videoId)}`;
  return {
    videoId,
    title: trimText(snippet.title || "", 180),
    channelTitle: trimText(snippet.channelTitle || "", 140),
    description: trimText(snippet.description || "", 500),
    publishedAt: trimText(snippet.publishedAt || "", 40),
    thumbnailUrl: snippet.thumbnails?.medium?.url || snippet.thumbnails?.default?.url || "",
    url,
    youtubeTrackUrl: url,
    embedUrl: `https://www.youtube-nocookie.com/embed/${encodeURIComponent(videoId)}`,
    source: "youtube_api",
    youtubeVerified: true
  };
}

async function fetchYouTubeVideos({ query, limit }) {
  const apiKey = envText("YOUTUBE_API_KEY") || envText("YOUTUBE_DATA_API_KEY");
  if (!apiKey) {
    const error = new Error("missing_youtube_api_key");
    error.statusCode = 503;
    throw error;
  }

  const params = new URLSearchParams({
    key: apiKey,
    part: "snippet",
    type: "video",
    videoEmbeddable: "true",
    videoSyndicated: "true",
    safeSearch: "none",
    maxResults: String(limit),
    q: query
  });

  const response = await fetch(`${SEARCH_URL}?${params.toString()}`, {
    headers: { Accept: "application/json" }
  });
  const payload = await response.json().catch(() => ({}));
  if (!response.ok) {
    const error = new Error("youtube_search_failed");
    error.statusCode = response.status || 502;
    error.detail = payload?.error?.message || response.statusText;
    throw error;
  }

  return (Array.isArray(payload.items) ? payload.items : [])
    .map(normalizeVideo)
    .filter(Boolean);
}

module.exports = async function handler(req, res) {
  if (!requireMusicApi(req, res, {
    methods: ["POST"],
    feature: "youtube-search",
    enabledEnv: "SONIC_YOUTUBE_ENABLED",
    defaultEnabled: false,
    dailyLimitEnv: "SONIC_YOUTUBE_SEARCH_DAILY_LIMIT",
    defaultDailyLimit: 80
  })) return;

  const body = parseBody(req);
  const query = trimText(body.query, 180);
  const style = trimText(body.style, 80);
  const limit = safeLimit(body.limit, envInt("SONIC_YOUTUBE_SEARCH_LIMIT", 5, 1, 10));

  if (!query) {
    sendJson(req, res, 400, { error: "missing_query" });
    return;
  }

  try {
    const videos = await fetchYouTubeVideos({ query, limit });
    sendJson(req, res, 200, {
      ok: true,
      source: "youtube",
      query,
      style,
      count: videos.length,
      videos
    });
  } catch (error) {
    sendJson(req, res, error.statusCode || 500, {
      error: error.message || "youtube_search_failed",
      detail: error.detail || ""
    });
  }
};
