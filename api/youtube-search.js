const { envInt, envText, parseBody, requireMusicApi, sendJson, trimText } = require("./_music-apis");

const SEARCH_URL = "https://www.googleapis.com/youtube/v3/search";

function requestParam(req, body, name, maxLength = 180) {
  return trimText(body?.[name] || req?.query?.[name] || "", maxLength);
}

function safeLimit(value, fallback = 5) {
  const parsed = Number.parseInt(String(value || ""), 10);
  if (!Number.isFinite(parsed)) return fallback;
  return Math.max(1, Math.min(10, parsed));
}

function normalizeForMatch(value = "") {
  return String(value || "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/&amp;/g, "&")
    .replace(/[^a-z0-9]+/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function tokenHit(haystack, needle) {
  const normalizedNeedle = normalizeForMatch(needle);
  if (!normalizedNeedle) return false;
  return normalizeForMatch(haystack).includes(normalizedNeedle);
}

function scoreVideo(video, { artist = "", song = "", style = "", query = "" } = {}) {
  const title = normalizeForMatch(video.title);
  const channel = normalizeForMatch(video.channelTitle);
  const description = normalizeForMatch(video.description);
  const artistNorm = normalizeForMatch(artist);
  const songNorm = normalizeForMatch(song);
  const queryNorm = normalizeForMatch(query);
  let score = 0;

  if (artistNorm && title.includes(artistNorm)) score += 6;
  if (songNorm && title.includes(songNorm)) score += 8;
  if (artistNorm && channel.includes(artistNorm)) score += 4;
  if (artistNorm && description.includes(artistNorm)) score += 1.2;
  if (songNorm && description.includes(songNorm)) score += 1.2;
  if (queryNorm && title.includes(queryNorm)) score += 1.5;
  if (tokenHit(title, style)) score += 0.5;
  if (/\bofficial\b|\baudio\b|\btopic\b|\bprovided to youtube\b/i.test(`${video.title} ${video.channelTitle} ${video.description}`)) score += 2;
  if (/\blive\b|\bfull set\b|\bdj set\b|\bplaylist\b|\bmix\b|\breaction\b|\bcover\b|\bremix\b/i.test(video.title)) score -= 2.5;
  if (/\bshorts\b|\btiktok\b/i.test(video.title)) score -= 2;
  return score;
}

function minimumQualityScore({ artist = "", song = "" } = {}) {
  const defaultScore = artist && song ? 7 : 2.5;
  return envInt("SONIC_YOUTUBE_MIN_QUALITY_SCORE", defaultScore, 0, 30);
}

function videoMatchesRequestedIdentity(video, { artist = "", song = "" } = {}) {
  const artistNorm = normalizeForMatch(artist);
  const songNorm = normalizeForMatch(song);
  const title = `${video?.title || ""}`;
  const fullText = `${video?.title || ""} ${video?.channelTitle || ""} ${video?.description || ""}`;
  const artistOk = !artistNorm || tokenHit(fullText, artistNorm);
  const songOk = !songNorm || tokenHit(`${title} ${video?.description || ""}`, songNorm);
  return artistOk && songOk;
}

function normalizeVideo(row = {}, query = "") {
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
    youtubeVerified: true,
    query
  };
}

async function fetchYouTubeVideos({ query, limit, artist, song, style }) {
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
  const categoryId = envText("YOUTUBE_VIDEO_CATEGORY_ID", "10");
  if (categoryId) params.set("videoCategoryId", categoryId);

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
    .map((row) => normalizeVideo(row, query))
    .filter(Boolean)
    .map((video) => ({
      ...video,
      identityMatch: videoMatchesRequestedIdentity(video, { artist, song }),
      qualityScore: scoreVideo(video, { artist, song, style, query })
    }))
    .filter((video) => video.identityMatch || (!artist && !song))
    .sort((a, b) => b.qualityScore - a.qualityScore);
}

function buildQueryList(body, req) {
  const fromBody = Array.isArray(body?.queries)
    ? body.queries
    : typeof body?.queries === "string"
      ? body.queries.split("|")
      : [];
  const directQuery = requestParam(req, body, "query") || requestParam(req, body, "q");
  const artist = requestParam(req, body, "artist", 120);
  const song = requestParam(req, body, "song", 140) || requestParam(req, body, "track", 140);
  const style = requestParam(req, body, "style", 80);
  const generated = [
    directQuery,
    artist && song ? `${artist} ${song} official audio` : "",
    artist && song ? `"${artist}" "${song}" audio` : "",
    artist && song && style ? `${artist} ${song} ${style} music` : ""
  ];
  const all = [...fromBody, ...generated]
    .map((item) => trimText(item, 180))
    .filter(Boolean);
  const unique = [];
  const seen = new Set();
  all.forEach((query) => {
    const key = normalizeForMatch(query);
    if (!key || seen.has(key)) return;
    seen.add(key);
    unique.push(query);
  });
  return { queries: unique, artist, song, style };
}

module.exports = async function handler(req, res) {
  if (!requireMusicApi(req, res, {
    methods: ["GET", "POST"],
    feature: "youtube-search",
    enabledEnv: "SONIC_YOUTUBE_ENABLED",
    defaultEnabled: false,
    dailyLimitEnv: "SONIC_YOUTUBE_SEARCH_DAILY_LIMIT",
    defaultDailyLimit: 80
  })) return;

  const body = parseBody(req);
  const { queries, artist, song, style } = buildQueryList(body, req);
  const query = queries[0] || "";
  const limit = safeLimit(body.limit, envInt("SONIC_YOUTUBE_SEARCH_LIMIT", 5, 1, 10));
  const maxQueries = envInt("SONIC_YOUTUBE_QUERY_VARIANTS_LIMIT", 2, 1, 4);

  if (!query) {
    sendJson(req, res, 400, { error: "missing_query" }, ["GET", "POST", "OPTIONS"]);
    return;
  }

  try {
    const merged = [];
    const seenIds = new Set();
    for (const searchQuery of queries.slice(0, maxQueries)) {
      const videos = await fetchYouTubeVideos({ query: searchQuery, limit, artist, song, style });
      videos.forEach((video) => {
        if (!video?.videoId || seenIds.has(video.videoId)) return;
        seenIds.add(video.videoId);
        merged.push(video);
      });
      if (merged.some((video) => video.qualityScore >= 10)) break;
    }
    const minQualityScore = minimumQualityScore({ artist, song });
    const rankedVideos = merged.sort((a, b) => b.qualityScore - a.qualityScore);
    const videos = rankedVideos.filter((video) => video.qualityScore >= minQualityScore).slice(0, limit);
    sendJson(req, res, 200, {
      ok: true,
      source: "youtube",
      query,
      queries: queries.slice(0, maxQueries),
      style,
      count: videos.length,
      minQualityScore,
      rejectedCount: Math.max(0, rankedVideos.length - videos.length),
      bestVideo: videos[0] || null,
      videos
    }, ["GET", "POST", "OPTIONS"]);
  } catch (error) {
    sendJson(req, res, error.statusCode || 500, {
      error: error.message || "youtube_search_failed",
      detail: error.detail || ""
    }, ["GET", "POST", "OPTIONS"]);
  }
};
