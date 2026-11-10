const crypto = require('node:crypto');
const { resolveAccessContext } = require('./_access-control');
const { assessUserGeneratedText, readBlockSnapshot, createModerationReport } = require('./_ugc-safety');
const { publicName } = require('./_profile-identity');
const { envText, envInt, parseBody, requireMusicApi, sendJson } = require('./_music-apis');

const METHODS = ['GET', 'POST'];
const UUID = /^[a-f\d]{8}-[a-f\d]{4}-[a-f\d]{4}-[a-f\d]{4}-[a-f\d]{12}$/i;
const STYLES = new Set(Object.keys(require('../../data/runtime-catalog-v1/manifest.json').styles));
const SAFE_ERRORS = new Set(['login_required','invalid_action','invalid_settings','invalid_track','invalid_request_id','friends_identity_required','person_not_found','invite_not_found','relationship_not_found','post_not_found','request_conflict','relationship_changed','friends_limit_reached']);
function problem(code, status = 400) { return Object.assign(new Error(code), { code, status }); }
function config() { return { supabaseUrl: envText('SUPABASE_URL').replace(/\/+$/, ''), serviceKey: envText('SUPABASE_SERVICE_ROLE_KEY') || envText('SUPABASE_SERVICE_KEY') }; }
async function rest(cfg, path, body) {
  const response = await fetch(`${cfg.supabaseUrl}/rest/v1/${path}`, {
    method: body === undefined ? 'GET' : 'POST', signal: AbortSignal.timeout(10000),
    headers: { apikey: cfg.serviceKey, Authorization: `Bearer ${cfg.serviceKey}`, 'Content-Type': 'application/json' },
    body: body === undefined ? undefined : JSON.stringify(body)
  });
  const payload = await response.json().catch(() => null);
  if (!response.ok) {
    if (['42P01','42703','PGRST202','PGRST204','PGRST205'].includes(payload?.code)) throw problem('friends_setup_required', 503);
    const code = String(payload?.message || '');
    if (SAFE_ERRORS.has(code)) throw problem(code, /not_found$/.test(code) ? 404 : code === 'friends_identity_required' ? 403 : /conflict|changed/.test(code) ? 409 : code === 'friends_limit_reached' ? 429 : 400);
    throw problem('friends_unavailable', 503);
  }
  return payload;
}
const rpc = (cfg, name, body) => rest(cfg, `rpc/${name}`, body);
const view = (cfg, actor, action, query = '', tokenHash = '') => rpc(cfg, 'sonic_friends_view', { p_actor_id: actor, p_action: action, p_query: query, p_token_hash: tokenHash });
const hashToken = token => crypto.createHash('sha256').update(token).digest('hex');
function tokenValue(value) { if (typeof value !== 'string' || !/^[A-Za-z0-9_-]{43}$/.test(value)) throw problem('invite_not_found', 404); return value; }
function id(value, code = 'person_not_found') { if (typeof value !== 'string' || !UUID.test(value)) throw problem(code, code.endsWith('not_found') ? 404 : 400); return value; }
function requestId(value) { return id(value, 'invalid_request_id'); }

async function syncBlocks(cfg, users) {
  const ids = [...new Set(users.filter(value => UUID.test(value)))];
  let cursor = 0;
  const worker = async () => {
    while (cursor < ids.length) {
      const userId = ids[cursor++];
      const snapshot = await readBlockSnapshot(cfg, userId);
      const blocked = [...new Set(snapshot.blockedUserIds.filter(value => typeof value === 'string' && UUID.test(value) && value !== userId))].slice(0, 500);
      await rpc(cfg, 'sonic_friend_sync_blocks', { p_user_id: userId, p_blocked_ids: blocked, p_updated_at: snapshot.updatedAt });
    }
  };
  await Promise.all(Array.from({ length: Math.min(8, ids.length) }, worker));
}
function safePerson(person) {
  if (!person) return person;
  return { ...person, displayName: publicName(person.displayName) || 'Sonic listener', username: /^[a-z0-9][a-z0-9_]{2,29}$/.test(person.username || '') ? person.username : '', avatarUrl: '' };
}
function safeOverview(result) {
  const suggested = result.me?.identity;
  return {
    ...result, me: { ...result.me, identity: result.me?.enabled ? safePerson(suggested) : { ...safePerson(suggested), displayName: publicName(suggested?.displayName) || '' } },
    friends: result.friends.map(safePerson), incoming: result.incoming.map(row => ({ ...row, person: safePerson(row.person) })), outgoing: result.outgoing.map(row => ({ ...row, person: safePerson(row.person) }))
  };
}
function safePost(post) { return { ...post, author: safePerson(post.author) }; }
function safeTrack(raw) {
  if (!raw || typeof raw !== 'object' || Array.isArray(raw)) throw problem('invalid_track');
  const artist = typeof raw.artist === 'string' ? raw.artist.trim() : '';
  const title = typeof (raw.title || raw.song) === 'string' ? (raw.title || raw.song).trim() : '';
  const style = typeof raw.style === 'string' ? raw.style.trim() : '';
  if (!artist || [...artist].length > 160 || !title || [...title].length > 220 || !STYLES.has(style) || /[\u0000-\u001f\u007f]/.test(artist + title) || !assessUserGeneratedText([artist, title]).allowed) throw problem('invalid_track');
  const track = { artist, title, style };
  if (raw.catalogId !== undefined) {
    if (typeof raw.catalogId !== 'string' || raw.catalogId.length > 400 || /[\u0000-\u001f\u007f]/.test(raw.catalogId)) throw problem('invalid_track');
    track.catalogId = raw.catalogId;
  }
  if (raw.url) {
    let url;
    try { url = new URL(raw.url); } catch (_) { throw problem('invalid_track'); }
    const host = url.hostname.replace(/^www\./, '');
    const queryKeys = host === 'sonicsearch.app' ? ['track','style','lang'] : host === 'youtube.com' ? ['v'] : host === 'music.apple.com' ? ['i'] : [];
    const allowed = (host === 'sonicsearch.app' && url.pathname === '/' && [...url.searchParams.keys()].every(key => ['track','style','lang'].includes(key))) ||
      (host === 'deezer.com' && /^\/(?:[a-z]{2}\/)?track\/\d+\/?$/.test(url.pathname)) ||
      (host === 'open.spotify.com' && /^\/track\/[A-Za-z0-9]+$/.test(url.pathname)) ||
      (host === 'youtube.com' && url.pathname === '/watch' && /^[A-Za-z0-9_-]{11}$/.test(url.searchParams.get('v') || '') && [...url.searchParams.keys()].every(key => key === 'v')) ||
      (host === 'youtu.be' && /^\/[A-Za-z0-9_-]{11}$/.test(url.pathname)) ||
      (host.endsWith('.bandcamp.com') && /^\/track\/[^/]+$/.test(url.pathname)) ||
      (host === 'soundcloud.com' && /^\/[^/]+\/[^/]+$/.test(url.pathname) && !/^\/(?:search|discover|stream)\//.test(url.pathname)) ||
      (host === 'music.apple.com' && /^\/[a-z]{2}\/album\//.test(url.pathname) && /^\d+$/.test(url.searchParams.get('i') || ''));
    if (!allowed || url.protocol !== 'https:' || url.username || url.password || url.hash || url.href.length > 1200 ||
      [...url.searchParams.keys()].some(key => !queryKeys.includes(key))) throw problem('invalid_track');
    track.url = url.href;
  }
  return track;
}

module.exports = async function handler(req, res) {
  res.setHeader('Cache-Control', 'private, no-store, max-age=0');
  res.setHeader('Referrer-Policy', 'no-referrer');
  if (!requireMusicApi(req, res, { methods: METHODS, feature: 'friends', enabledEnv: 'SONIC_FRIENDS_ENABLED', defaultEnabled: false, allowGlobalFallback: false, budgetOnStart: false, betaAccess: false })) return;
  try {
    const cfg = config();
    if (!cfg.supabaseUrl || !cfg.serviceKey) throw problem('friends_setup_required', 503);
    const access = await resolveAccessContext(req, {}, { includeMembership: false });
    if (!access.authenticated || !UUID.test(access.userId)) throw problem('login_required', 401);
    const actor = access.userId;
    const dailyLimit = envInt('SONIC_FRIENDS_DAILY_LIMIT', 800, 1, 10000);
    const budget = await rpc(cfg, 'sonic_friend_consume_request_budget', { p_user_id: actor, p_daily_limit: dailyLimit });
    if (typeof budget?.allowed !== 'boolean' || !Number.isInteger(budget.remaining) || budget.remaining < 0 || budget.remaining > dailyLimit) throw problem('friends_unavailable', 503);
    if (!budget.allowed) throw problem('daily_music_api_limit_reached', 429);
    const params = new URL(req.url || '/', 'https://sonicsearch.app').searchParams;
    const body = req.method === 'POST' ? parseBody(req) : {};
    const action = String(body.action || req.query?.action || params.get('action') || 'overview');
    if (req.method === 'GET') {
      if (action === 'search') {
        const query = String(req.query?.q || params.get('q') || '').trim().replace(/^@+/, '').trim().slice(0, 60);
        const candidates = await view(cfg, actor, 'search-candidates', query);
        await syncBlocks(cfg, [actor, ...candidates]);
        return sendJson(req, res, 200, { ok: true, people: (await view(cfg, actor, 'search', query)).map(safePerson) }, METHODS);
      }
      if (!['overview','feed','post'].includes(action)) throw problem('invalid_action');
      const candidates = await view(cfg, actor, 'candidates');
      await syncBlocks(cfg, [actor, ...candidates]);
      if (action === 'overview') return sendJson(req, res, 200, { ok: true, ...safeOverview(await view(cfg, actor, action)) }, METHODS);
      if (action === 'feed') return sendJson(req, res, 200, { ok: true, posts: (await view(cfg, actor, action)).map(safePost) }, METHODS);
      const post = await view(cfg, actor, 'post', id(req.query?.postId || params.get('postId'), 'post_not_found'));
      return sendJson(req, res, 200, { ok: true, post: safePost(post) }, METHODS);
    }
    if (action === 'invite-preview') {
      const tokenHash = hashToken(tokenValue(body.token));
      const other = await view(cfg, actor, 'invite-candidate', '', tokenHash);
      await syncBlocks(cfg, [actor, other]);
      const result = await view(cfg, actor, 'invite', '', tokenHash);
      return sendJson(req, res, 200, { ok: true, ...result, person: safePerson(result.person) }, METHODS);
    }
    if (action === 'report') {
      const candidates = await view(cfg, actor, 'candidates');
      await syncBlocks(cfg, [actor, ...candidates]);
      const post = await view(cfg, actor, 'post', id(body.postId, 'post_not_found'));
      if (post.author.id === actor) throw problem('post_not_found', 404);
      const reason = ['inappropriate_content','spam','harassment','other'].includes(body.reason) ? body.reason : 'inappropriate_content';
      await createModerationReport(cfg, { reporterUserId: actor, reporter: { id: actor }, targetType: 'friend_post', targetId: post.id, targetAuthorId: post.author.id, reason, excerpt: String(post.text || '').slice(0, 280), parentType: 'friends' });
      return sendJson(req, res, 200, { ok: true }, METHODS);
    }
    const payload = {};
    let other = null, inviteToken = '';
    if (['request','cancel','respond','remove'].includes(action)) {
      other = id(body.userId);
      if (action === 'request') {
        payload.clientRequestId = requestId(body.clientRequestId);
        if (body.inviteToken) payload.inviteHash = hashToken(tokenValue(body.inviteToken));
        await view(cfg, actor, 'request-candidate', other, payload.inviteHash || '');
      } else {
        payload.relationshipId = id(body.relationshipId, 'relationship_not_found');
        if (!(await view(cfg, actor, 'candidates')).includes(other)) throw problem('relationship_not_found', 404);
        if (action === 'respond') { if (!['accept','decline'].includes(body.decision)) throw problem('invalid_action'); payload.decision = body.decision; }
      }
      await syncBlocks(cfg, [actor, other]);
    } else if (action === 'settings') {
      if (typeof body.displayName !== 'string' || !publicName(body.displayName) || (body.username !== undefined && (typeof body.username !== 'string' || (body.username && !/^[a-z0-9][a-z0-9_]{2,29}$/.test(body.username))))) throw problem('invalid_settings');
      payload.displayName = body.displayName.trim(); payload.username = body.username || '';
    } else if (action === 'create-invite') {
      payload.clientRequestId = requestId(body.clientRequestId);
      inviteToken = crypto.createHmac('sha256', cfg.serviceKey).update(`sonic-friend-invite:v1:${actor}:${payload.clientRequestId}`).digest('base64url');
      payload.tokenHash = hashToken(inviteToken);
    } else if (action === 'revoke-invite') payload.inviteId = id(body.inviteId, 'invite_not_found');
    else if (action === 'share-track') {
      payload.clientRequestId = requestId(body.clientRequestId); payload.track = safeTrack(body.track);
      if (body.text !== undefined && typeof body.text !== 'string') throw problem('invalid_track');
      payload.text = (body.text || '').trim();
      if ([...payload.text].length > 280 || /[\u0000-\u0008\u000b\u000c\u000e-\u001f\u007f]/.test(payload.text) || !assessUserGeneratedText(payload.text).allowed) throw problem('invalid_track');
    } else if (action === 'delete-post') payload.postId = id(body.postId, 'post_not_found');
    else throw problem('invalid_action');
    const result = await rpc(cfg, 'sonic_friends_mutate', { p_actor_id: actor, p_action: action, p_other_id: other, p_payload: payload });
    if (result.post) result.post = safePost(result.post);
    if (result.me) result.me.identity = safePerson(result.me.identity);
    if (inviteToken && result.invite) result.invite.token = inviteToken;
    sendJson(req, res, 200, { ok: true, ...result }, METHODS);
  } catch (error) {
    sendJson(req, res, error.status || 503, { ok: false, error: error.code || 'friends_unavailable' }, METHODS);
  }
};
module.exports.safeTrack = safeTrack;
