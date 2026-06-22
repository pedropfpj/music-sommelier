const { sendJson } = require("./_music-apis");

const handlers = {
  "artist-profile": require("./_artist-profile"),
  "cover-art": require("./_cover-art"),
  "lastfm-artist": require("./_lastfm-artist"),
  "news-feed": require("./_news-feed"),
  "radio-browser": require("./_radio-browser"),
  "track-metadata": require("./_track-metadata")
};

function routeFromRequest(req) {
  const queryRoute = Array.isArray(req?.query?.route) ? req.query.route[0] : req?.query?.route;
  if (queryRoute) return String(queryRoute).trim();
  try {
    const url = new URL(req?.url || "", `https://${req?.headers?.host || "sonicsearch.app"}`);
    return String(url.searchParams.get("route") || "").trim();
  } catch (_error) {
    return "";
  }
}

module.exports = async function handler(req, res) {
  const route = routeFromRequest(req);
  const routeHandler = handlers[route];
  if (!routeHandler) {
    return sendJson(req, res, 404, {
      error: "music_route_not_found",
      route,
      availableRoutes: Object.keys(handlers)
    });
  }
  return routeHandler(req, res);
};
