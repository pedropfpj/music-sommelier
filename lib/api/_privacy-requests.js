const { resolveAccessContext } = require('./_access-control');
const { envText, parseBody, requireMusicApi, sendJson } = require('./_music-apis');

const METHODS = ['GET', 'POST'];
const UUID = /^[a-f\d]{8}-[a-f\d]{4}-[a-f\d]{4}-[a-f\d]{4}-[a-f\d]{12}$/i;
const KINDS = new Set(['delete_account', 'export', 'correction', 'refund']);
const FIELDS = 'id,kind,status,created_at,updated_at';

module.exports = async function handler(req, res) {
  res.setHeader('Cache-Control', 'private, no-store, max-age=0');
  if (!requireMusicApi(req, res, { methods: METHODS, feature: 'privacy-requests',
    enabledEnv: 'SONIC_PRIVACY_REQUESTS_ENABLED', defaultEnabled: true,
    allowGlobalFallback: false, budgetOnStart: false, betaAccess: false })) return;
  try {
    const url = envText('SUPABASE_URL').replace(/\/+$/, '');
    const key = envText('SUPABASE_SERVICE_ROLE_KEY');
    if (!url || !key) return sendJson(req, res, 503, { error: 'privacy_setup_required' }, METHODS);
    // Account identity comes only from the verified bearer token, never the body.
    const access = await resolveAccessContext(req, {});
    if (!access.authenticated || !UUID.test(access.userId)) {
      return sendJson(req, res, 401, { error: 'login_required' }, METHODS);
    }
    let path, options = {};
    if (req.method === 'GET') {
      const params = new URLSearchParams({ user_id: `eq.${access.userId}`, select: FIELDS, order: 'created_at.desc', limit: '50' });
      path = `/rest/v1/sonic_privacy_requests?${params}`;
    } else {
      const body = parseBody(req);
      if (!body || typeof body !== 'object' || Array.isArray(body) || Buffer.byteLength(JSON.stringify(body)) > 12000) {
        return sendJson(req, res, 400, { error: 'invalid_request' }, METHODS);
      }
      if (!KINDS.has(body.kind) || !UUID.test(String(body.requestId || '')) ||
          typeof body.message !== 'string' || body.message.length > 2000 ||
          (body.kind === 'delete_account' && body.confirmDeletion !== true)) {
        return sendJson(req, res, 400, { error: 'invalid_request' }, METHODS);
      }
      path = '/rest/v1/rpc/sonic_create_privacy_request';
      options = { method: 'POST', body: JSON.stringify({ p_user_id: access.userId,
        p_request_key: body.requestId, p_kind: body.kind, p_message: body.message.trim(),
        p_contact_email: access.email }) };
    }
    const response = await fetch(`${url}${path}`, { ...options, signal: AbortSignal.timeout(12000),
      headers: { apikey: key, Authorization: `Bearer ${key}`, 'Content-Type': 'application/json' } });
    const payload = await response.json().catch(() => null);
    if (!response.ok) {
      const limited = payload?.message === 'privacy_request_daily_limit';
      return sendJson(req, res, limited ? 429 : 503,
        { error: limited ? 'privacy_request_daily_limit' : 'privacy_storage_unavailable' }, METHODS);
    }
    if (req.method === 'GET') {
      if (!Array.isArray(payload)) throw new Error('invalid_response');
      return sendJson(req, res, 200, { ok: true, requests: payload }, METHODS);
    }
    if (!payload || !UUID.test(payload.id || '') || !payload.status || !payload.created_at) throw new Error('invalid_response');
    // Receipt only: no claim of erasure or refund completion.
    return sendJson(req, res, 201, { ok: true, request: payload }, METHODS);
  } catch (_) {
    return sendJson(req, res, 503, { error: 'privacy_storage_unavailable' }, METHODS);
  }
};
