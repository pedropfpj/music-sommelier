const media = require("./_authorized-media");

function createHandler({ manifest = media.manifest, env = process.env, now = Date.now, fetcher = fetch } = {}) {
  return async function handler(req, res) {
    media.setResponseHeaders(res);
    if (!media.isPreview(env)) return media.respond(res, 404);
    if (req.method !== "GET") {
      res.setHeader("Allow", "GET");
      return media.respond(res, 405);
    }

    let recordings = media.activeRecordings(manifest, now());
    if (recordings.length) {
      try {
        if (!await media.createStorage(env, fetcher)?.isPrivate()) return media.respond(res, 503);
      } catch {
        return media.respond(res, 503);
      }
      recordings = media.activeRecordings(manifest, now());
    }
    return media.respond(res, 200, { version: 1, mode: media.mode, recordings });
  };
}

module.exports = createHandler();
module.exports.createHandler = createHandler;
