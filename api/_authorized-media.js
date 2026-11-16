const manifest = require("./_authorized-catalog.json");

const mode = "authorized-previews";
const bucket = "authorized-web-previews";
const filePattern = /^[0-9a-f]{64}\.(mp3|wav)$/;
const pathPattern = /^\/api\/authorized-audio\?file=([0-9a-f]{64}\.(?:mp3|wav))$/;
const idPattern = /^(?:isrc:[A-Z]{2}[A-Z0-9]{3}\d{7}|mbid:[0-9a-f]{8}(?:-[0-9a-f]{4}){3}-[0-9a-f]{12})$/;

function isPreview(env) {
  return env.VERCEL_ENV === "preview" && (!env.VERCEL_TARGET_ENV || env.VERCEL_TARGET_ENV === "preview");
}

function dateMillis(value) {
  if (typeof value !== "string") return NaN;
  const milliseconds = Date.parse(value);
  return Number.isFinite(milliseconds) && new Date(milliseconds).toISOString() === value ? milliseconds : NaN;
}

function activeRecordings(payload, now) {
  if (payload?.version !== 1 || payload.mode !== mode || !Array.isArray(payload.recordings)) return [];
  const rows = [];
  const ids = new Set();
  const files = new Set();
  for (const row of payload.recordings) {
    if (!row || typeof row.id !== "string" || !idPattern.test(row.id) ||
        typeof row.style !== "string" || !/^[a-z0-9]+(?:_[a-z0-9]+)*$/.test(row.style) ||
        typeof row.previewPath !== "string" || !Number.isFinite(row.bpm) || row.bpm <= 0 ||
        typeof row.title !== "string" || !row.title.trim() || typeof row.artist !== "string" || !row.artist.trim()) return [];
    const file = pathPattern.exec(row.previewPath)?.[1];
    const available = dateMillis(row.availableFrom);
    const expiry = dateMillis(row.expiresAt);
    if (!file || !(available < expiry) || ids.has(row.id) || files.has(file)) return [];
    ids.add(row.id);
    files.add(file);
    if (!(available <= now && now < expiry)) continue;
    const { id, title, artist, style, bpm, previewPath, availableFrom, expiresAt } = row;
    rows.push({ id, title, artist, style, bpm, previewPath, availableFrom, expiresAt });
  }
  return rows;
}

function setResponseHeaders(res) {
  res.setHeader("Cache-Control", "private, no-store");
  res.setHeader("Cross-Origin-Resource-Policy", "same-origin");
  res.setHeader("X-Content-Type-Options", "nosniff");
}

function respond(res, status, data) {
  res.statusCode = status;
  if (data === undefined) {
    res.end();
    return;
  }
  res.setHeader("Content-Type", "application/json; charset=utf-8");
  res.end(JSON.stringify(data));
}

function createStorage(env, fetcher) {
  let origin;
  try {
    origin = new URL(env.SUPABASE_URL);
  } catch {
    return null;
  }
  const key = (env.SUPABASE_SECRET_KEY || env.SUPABASE_SERVICE_ROLE_KEY || env.SUPABASE_SERVICE_KEY || "").trim();
  if (!key || origin.protocol !== "https:" || !/^[a-z0-9-]+\.supabase\.co$/.test(origin.hostname) ||
      origin.port || origin.username || origin.password || origin.pathname !== "/" || origin.search || origin.hash) return null;

  const headers = { apikey: key };
  if (!key.startsWith("sb_secret_")) headers.Authorization = `Bearer ${key}`;
  const signal = AbortSignal.timeout(8000);
  const request = (path, method = "GET") => fetcher(new URL(path, origin), {
    method, headers, cache: "no-store", redirect: "error", signal
  });

  return {
    async isPrivate() {
      const response = await request(`/storage/v1/bucket/${bucket}`);
      if (!response.ok) {
        await response.body?.cancel();
        return false;
      }
      const data = await response.json();
      return data?.id === bucket && data.public === false;
    },
    object(file, method) {
      return request(`/storage/v1/object/authenticated/${bucket}/${file}`, method);
    }
  };
}

module.exports = { manifest, mode, filePattern, isPreview, activeRecordings, setResponseHeaders, respond, createStorage };
