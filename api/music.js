const { sendJson } = require("../lib/api/_music-apis");

const handlers = {
  "artist-profile": require("../lib/api/_artist-profile"),
  "beta-access": require("../lib/api/_beta-access"),
  "beta-events": require("../lib/api/_beta-events"),
  comments: require("../lib/api/_comments"),
  community: require("../lib/api/_community"),
  "cover-art": require("../lib/api/_cover-art"),
  "event-radar": require("../lib/api/_event-radar"),
  "lastfm-artist": require("../lib/api/_lastfm-artist"),
  "news-editor": require("../lib/api/_news-editor"),
  "news-feed": require("../lib/api/_news-feed"),
  "radio-browser": require("../lib/api/_radio-browser"),
  "spotify-search": require("../lib/api/_spotify-search"),
  "track-metadata": require("../lib/api/_track-metadata"),
  waitlist: require("../lib/api/_waitlist")
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
