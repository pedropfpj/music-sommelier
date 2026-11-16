const { createHash } = require("node:crypto");
const media = require("./_authorized-media");

const MAX_BYTES = 4 * 1024 * 1024;

function requestedFile(url) {
  try {
    const files = new URL(url || "", "http://localhost").searchParams.getAll("file");
    return files.length === 1 && media.filePattern.test(files[0]) ? files[0] : "";
  } catch {
    return "";
  }
}

async function readVerifiedObject(response, file) {
  if (response.status !== 200 || !response.body || Number(response.headers.get("content-length")) > MAX_BYTES) {
    await response.body?.cancel();
    return null;
  }
  const chunks = [];
  let size = 0;
  const digest = createHash("sha256");
  for await (const chunk of response.body) {
    size += chunk.length;
    if (size > MAX_BYTES) return null;
    digest.update(chunk);
    chunks.push(chunk);
  }
  return size > 0 && digest.digest("hex") === file.slice(0, 64) ? Buffer.concat(chunks, size) : null;
}

function byteRange(value, size) {
  const match = /^bytes=(\d*)-(\d*)$/.exec(value);
  if (!match || (!match[1] && !match[2])) return null;
  const start = match[1] ? Number(match[1]) : Math.max(0, size - Number(match[2]));
  const end = match[1] && match[2] ? Math.min(size - 1, Number(match[2])) : size - 1;
  if (!Number.isSafeInteger(start) || !Number.isSafeInteger(end) || start > end || start >= size) return null;
  return { start, end };
}

function createHandler({ manifest = media.manifest, env = process.env, now = Date.now, fetcher = fetch } = {}) {
  return async function handler(req, res) {
    media.setResponseHeaders(res);
    if (!media.isPreview(env)) return media.respond(res, 404);
    if (!["GET", "HEAD"].includes(req.method)) {
      res.setHeader("Allow", "GET, HEAD");
      return media.respond(res, 405);
    }
    const file = requestedFile(req.url);
    const active = () => file && media.activeRecordings(manifest, now())
      .some(row => row.previewPath === `/api/authorized-audio?file=${file}`);
    if (!active()) return media.respond(res, 404);

    let bytes;
    try {
      const storage = media.createStorage(env, fetcher);
      if (!await storage?.isPrivate()) return media.respond(res, 503);
      const object = await storage.object(file);
      if (object.status === 404) {
        await object.body?.cancel();
        return media.respond(res, 404);
      }
      bytes = await readVerifiedObject(object, file);
      if (!bytes) return media.respond(res, 502);

      // A cached GET can outlive revocation. Storage checks an authenticated HEAD at origin.
      const head = await storage.object(file, "HEAD");
      if (head.status !== 200) return media.respond(res, head.status === 404 ? 404 : 502);
      const etag = head.headers.get("etag");
      if (etag && object.headers.get("etag") && etag !== object.headers.get("etag")) return media.respond(res, 502);
    } catch {
      return media.respond(res, 502);
    }
    if (!active()) return media.respond(res, 404);

    const size = bytes.length;
    res.setHeader("Accept-Ranges", "bytes");
    if (req.method === "GET" && req.headers.range && !req.headers["if-range"]) {
      const range = byteRange(req.headers.range, size);
      if (!range) {
        res.setHeader("Content-Range", `bytes */${size}`);
        return media.respond(res, 416);
      }
      res.statusCode = 206;
      res.setHeader("Content-Range", `bytes ${range.start}-${range.end}/${size}`);
      bytes = bytes.subarray(range.start, range.end + 1);
    } else {
      res.statusCode = 200;
    }
    res.setHeader("Content-Type", file.endsWith(".mp3") ? "audio/mpeg" : "audio/wav");
    res.setHeader("Content-Length", bytes.length);
    res.end(req.method === "HEAD" ? undefined : bytes);
  };
}

module.exports = createHandler();
module.exports.createHandler = createHandler;
