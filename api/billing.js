const { resolveAccessContext } = require("../lib/api/_access-control");
const {
  createCheckout,
  createPortal,
  publicPlans,
  verifyAppleTransactionForAccess
} = require("../lib/api/_billing-store");
const { parseBody, sendJson } = require("../lib/api/_music-apis");
const { allowedOrigin, requestBodyTooLarge } = require("../lib/api/_request-security");

const METHODS = ["GET", "POST", "OPTIONS"];

function route(req) {
  const queryValue = Array.isArray(req?.query?.route) ? req.query.route[0] : req?.query?.route;
  if (queryValue) return String(queryValue).trim().toLowerCase();
  try { return new URL(req.url || "", `https://${req.headers?.host || "sonicsearch.app"}`).searchParams.get("route") || "plans"; }
  catch (_) { return "plans"; }
}

function requestOrigin(req) {
  return String(req?.headers?.origin || req?.headers?.referer || "").trim();
}

module.exports = async function handler(req, res) {
  if (req.method === "OPTIONS") {
    sendJson(req, res, 204, {}, METHODS);
    return;
  }
  if (!METHODS.includes(req.method)) {
    sendJson(req, res, 405, { ok: false, error: "method_not_allowed" }, METHODS);
    return;
  }
  if (!allowedOrigin(req, ["SONIC_MUSIC_ALLOWED_ORIGINS"])) {
    sendJson(req, res, 403, { ok: false, error: "origin_not_allowed" }, METHODS);
    return;
  }
  if (requestBodyTooLarge(req, 160000)) {
    sendJson(req, res, 413, { ok: false, error: "request_body_too_large" }, METHODS);
    return;
  }

  const action = route(req);
  if (req.method === "GET" && action === "plans") {
    sendJson(req, res, 200, await publicPlans(), METHODS);
    return;
  }
  if (req.method !== "POST") {
    sendJson(req, res, 405, { ok: false, error: "method_not_allowed" }, METHODS);
    return;
  }

  const body = parseBody(req);
  const access = await resolveAccessContext(req, body, { includeMembership: true });
  if (!access.authenticated || !access.userId) {
    sendJson(req, res, 401, { ok: false, error: "login_required" }, METHODS);
    return;
  }

  try {
    if (action === "checkout") {
      const cadence = body.cadence === "yearly" ? "yearly" : "monthly";
      sendJson(req, res, 200, { ok: true, ...(await createCheckout(access, cadence, requestOrigin(req))) }, METHODS);
      return;
    }
    if (action === "portal") {
      sendJson(req, res, 200, { ok: true, ...(await createPortal(access, requestOrigin(req))) }, METHODS);
      return;
    }
    if (action === "apple-transaction") {
      const result = await verifyAppleTransactionForAccess(access, body.signedTransaction);
      sendJson(req, res, 200, { ok: true, ...result }, METHODS);
      return;
    }
    sendJson(req, res, 404, { ok: false, error: "billing_route_not_found" }, METHODS);
  } catch (error) {
    const code = String(error?.message || "billing_failed");
    const status = /not_configured|disabled/.test(code) ? 503 : /mismatch|invalid|not_allowed|missing/.test(code) ? 400 : 502;
    sendJson(req, res, status, { ok: false, error: code }, METHODS);
  }
};
