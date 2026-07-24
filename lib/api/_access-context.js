const { resolveAccessContext } = require("./_access-control");
const { sendJson } = require("./_music-apis");
const { setCorsHeaders } = require("./_request-security");

const ALLOWED_METHODS = ["GET", "OPTIONS"];

module.exports = async function handler(req, res) {
  if (req.method === "OPTIONS") {
    setCorsHeaders(req, res, {
      originEnvNames: ["SONIC_MUSIC_ALLOWED_ORIGINS", "SONIC_AI_ALLOWED_ORIGINS"],
      methods: ALLOWED_METHODS,
      allowedHeaders: "Content-Type, Authorization, X-Sonic-Auth-Token"
    });
    res.statusCode = 204;
    res.end();
    return;
  }
  if (req.method !== "GET") {
    sendJson(req, res, 405, { ok: false, error: "method_not_allowed" }, ALLOWED_METHODS);
    return;
  }

  res.setHeader("Cache-Control", "private, no-store, max-age=0");
  const access = await resolveAccessContext(req, {});
  if (!access.authenticated) {
    sendJson(req, res, 401, { ok: false, error: "login_required" }, ALLOWED_METHODS);
    return;
  }

  sendJson(req, res, 200, {
    ok: true,
    viewer: {
      email: access.email,
      role: access.role,
      owner: access.owner,
      admin: access.admin,
      canAccessAdmin: access.canAccessAdmin,
      canModerate: access.canModerate
    }
  }, ALLOWED_METHODS);
};
