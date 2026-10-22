const crypto = require('node:crypto');
const sharp = require('sharp');
const { resolveAccessContext } = require('./_access-control');
const { assessUserGeneratedText, readBlockedUserIds } = require('./_ugc-safety');
const { envText, envInt, parseBody, requireMusicApi, sendJson, enforceDurableMusicDailyLimit, durableRateLimitsRequired } = require('./_music-apis');
const { hasDurableStore } = require('./_usage-store');

const BUCKET = 'sonic-profile-avatars';
const FIELDS = 'id,username,display_name,bio,favorite_styles,profile_public,show_avatar,show_bio,show_styles,avatar_path,avatar_customized,updated_at';
const UUID = /^[a-f\d]{8}-[a-f\d]{4}-[a-f\d]{4}-[a-f\d]{4}-[a-f\d]{12}$/i;
const MAX_PHOTO_BYTES = 524288;
const METHODS = ['GET', 'POST'];
function problem(code, status = 400) { return Object.assign(new Error(code), { status, code }); }
function config() {
  return { url: envText('SUPABASE_URL').replace(/\/+$/, ''), key: envText('SUPABASE_SERVICE_ROLE_KEY') || envText('SUPABASE_SERVICE_KEY') };
}
async function request(cfg, path, options = {}) {
  const response = await fetch(`${cfg.url}${path}`, {
    ...options, signal: AbortSignal.timeout(12000), headers: {
      apikey: cfg.key, Authorization: `Bearer ${cfg.key}`, 'Content-Type': 'application/json',
      ...options.headers
    }
  });
  const payload = await response.json().catch(() => null);
  if (!response.ok) {
    if (response.status === 409 || payload?.code === '23505') throw problem('username_taken', 409);
    if (['42703', '42P01', 'PGRST202', 'PGRST204', 'PGRST205'].includes(payload?.code)) throw problem('profile_setup_required', 503);
    throw problem('profile_storage_unavailable', 503);
  }
  return payload;
}
function ownAvatarPath(path, userId) {
  return typeof path === 'string' && path.startsWith(`${userId}/`) && UUID.test(path.slice(userId.length + 1, -4)) && path.endsWith('.jpg');
}
async function readProfile(cfg, userId) {
  const params = new URLSearchParams({ id: `eq.${userId}`, select: FIELDS, limit: '1' });
  return (await request(cfg, `/rest/v1/profiles?${params}`))?.[0] || null;
}
function publicProfile(row) {
  if (row?.profile_public !== true) return null;
  const name = String(row.display_name || '').slice(0, 80);
  const bio = String(row.bio || '').slice(0, 280);
  return {
    username: row.username, displayName: assessUserGeneratedText(name).allowed ? name : 'Sonic listener',
    bio: row.show_bio === true && assessUserGeneratedText(bio).allowed ? bio : '',
    styles: row.show_styles === true && Array.isArray(row.favorite_styles)
      ? row.favorite_styles.slice(0, 6).filter(style => typeof style === 'string' && style.length <= 60 && assessUserGeneratedText(style).allowed) : []
  };
}
async function signedAvatar(cfg, row, publicRead = false) {
  if (!row || (publicRead && (!row.profile_public || !row.show_avatar)) || !ownAvatarPath(row.avatar_path, row.id)) return '';
  const result = await request(cfg, `/storage/v1/object/sign/${BUCKET}/${row.avatar_path}`, {
    method: 'POST', body: JSON.stringify({ expiresIn: 60 })
  });
  const raw = result?.signedURL || result?.signedUrl || '';
  if (!raw) return '';
  const url = new URL(raw.startsWith('/object/') ? `/storage/v1${raw}` : raw, cfg.url);
  if (url.origin !== new URL(cfg.url).origin || !url.pathname.startsWith(`/storage/v1/object/sign/${BUCKET}/`)) return '';
  return url.href;
}
function validateProfile(body) {
  if (typeof body.displayName !== 'string') throw problem('invalid_display_name');
  if (typeof body.username !== 'string') throw problem('invalid_username');
  if (typeof body.bio !== 'string') throw problem('invalid_bio');
  if (body.photo !== undefined && typeof body.photo !== 'string') throw problem('invalid_photo');
  const displayName = String(body.displayName || '').trim();
  const username = String(body.username || '').trim().toLowerCase();
  const bio = String(body.bio || '').trim();
  if (!displayName || [...displayName].length > 80 || /[\u0000-\u001f\u007f]/.test(displayName)) throw problem('invalid_display_name');
  if (!/^[a-z0-9][a-z0-9_]{2,29}$/.test(username)) throw problem('invalid_username');
  if ([...bio].length > 280 || /[\u0000-\u0008\u000b\u000c\u000e-\u001f\u007f]/.test(bio)) throw problem('invalid_bio');
  if (![displayName, username, bio].every(text => assessUserGeneratedText(text).allowed)) throw problem('profile_text_not_allowed');
  const privacy = body.privacy || {};
  if (!['public', 'photo', 'bio', 'styles'].every(key => typeof privacy[key] === 'boolean')) throw problem('invalid_privacy');
  if (body.removePhoto !== undefined && typeof body.removePhoto !== 'boolean') throw problem('invalid_photo');
  if (body.removePhoto && body.photo) throw problem('invalid_photo');
  return {
    username, display_name: displayName, bio,
    profile_public: privacy.public, show_avatar: privacy.photo,
    show_bio: privacy.bio, show_styles: privacy.styles
  };
}
async function preparePhoto(value) {
  if (typeof value !== 'string' || value.length > 699052 || !/^[a-zA-Z\d+/]+={0,2}$/.test(value)) throw problem('invalid_photo');
  const bytes = Buffer.from(value, 'base64');
  if (bytes.length > MAX_PHOTO_BYTES || bytes.length < 12 || bytes.toString('base64') !== value) throw problem('invalid_photo');
  try {
    const image = sharp(bytes, { limitInputPixels: 16777216, failOn: 'warning', animated: false });
    const metadata = await image.metadata();
    if (!['jpeg', 'png', 'webp'].includes(metadata.format) || (metadata.pages || 1) !== 1) throw new Error('format');
    // Decode, orient, square-crop and re-encode. EXIF/GPS/metadata are not retained.
    return await image.rotate().resize(512, 512, { fit: 'cover' }).jpeg({ quality: 82 }).toBuffer();
  } catch (_) { throw problem('invalid_photo'); }
}
async function deleteAvatar(cfg, path, userId) {
  if (!ownAvatarPath(path, userId)) return;
  await request(cfg, `/storage/v1/object/${BUCKET}`, { method: 'DELETE', body: JSON.stringify({ prefixes: [path] }) });
}
async function enforceProfileEditBudget(cfg, req, res, userId) {
  // Existing Redis limits remain supported. Without Redis, the database provides
  // an atomic, service-only counter; never disable production limits to launch.
  if (hasDurableStore() || !durableRateLimitsRequired()) {
    const limitRequest = { ...req, headers: { ...req.headers, 'x-forwarded-for': userId, 'user-agent': 'verified-profile' } };
    return enforceDurableMusicDailyLimit(limitRequest, res, { feature: 'user-profile-edit', dailyLimitEnv: 'SONIC_PROFILE_EDIT_DAILY_LIMIT', defaultDailyLimit: 40, methods: METHODS });
  }
  const limit = envInt('SONIC_PROFILE_EDIT_DAILY_LIMIT', 40, 1, 10000);
  const budget = await request(cfg, '/rest/v1/rpc/sonic_consume_profile_edit_budget', {
    method: 'POST', body: JSON.stringify({ p_user_id: userId, p_daily_limit: limit })
  });
  if (!budget || typeof budget.allowed !== 'boolean' || !Number.isInteger(budget.remaining) || budget.remaining < 0 || budget.remaining > limit) {
    throw problem('profile_storage_unavailable', 503);
  }
  if (!budget.allowed) {
    sendJson(req, res, 429, { ok: false, error: 'daily_music_api_limit_reached', feature: 'user-profile-edit', limit }, METHODS);
    return false;
  }
  res.setHeader('X-Sonic-Music-Durable-Remaining', String(budget.remaining));
  res.setHeader('X-Sonic-Usage-Store', 'supabase');
  return true;
}

module.exports = async function handler(req, res) {
  res.setHeader('Cache-Control', 'private, no-store, max-age=0');
  if (!requireMusicApi(req, res, { methods: METHODS, feature: 'user-profile', enabledEnv: 'SONIC_SOCIAL_ENABLED', allowGlobalFallback: false, budgetOnStart: false, betaAccess: false })) return;
  try {
    const cfg = config();
    if (!cfg.url || !cfg.key) throw problem('profile_setup_required', 503);
    // A public profile still requires a verified community account, not a scraper endpoint.
    const access = await resolveAccessContext(req, {}, { includeMembership: false });
    if (!access.authenticated || !UUID.test(access.userId)) throw problem('login_required', 401);
    const query = new URL(req.url || '/', 'https://sonicsearch.app').searchParams;
    const handle = String(req.query?.username || query.get('username') || '').toLowerCase();
    if (req.method === 'GET' && handle) {
      if (!/^[a-z0-9][a-z0-9_]{2,29}$/.test(handle)) throw problem('profile_not_found', 404);
      const params = new URLSearchParams({ username: `eq.${handle}`, profile_public: 'eq.true', select: FIELDS, limit: '1' });
      const row = (await request(cfg, `/rest/v1/profiles?${params}`))?.[0];
      const profile = publicProfile(row);
      if (!profile) throw problem('profile_not_found', 404);
      const moderation = { supabaseUrl: cfg.url, serviceKey: cfg.key };
      const [viewerBlocks, authorBlocks] = await Promise.all([
        readBlockedUserIds(moderation, access.userId), readBlockedUserIds(moderation, row.id)
      ]);
      if (viewerBlocks.includes(row.id) || authorBlocks.includes(access.userId)) throw problem('profile_not_found', 404);
      profile.avatarUrl = await signedAvatar(cfg, row, true);
      sendJson(req, res, 200, { ok: true, publicProfile: profile }, METHODS);
      return;
    }
    if (req.method === 'GET') {
      const profile = await readProfile(cfg, access.userId);
      sendJson(req, res, 200, { ok: true, profile, avatarUrl: await signedAvatar(cfg, profile) }, METHODS);
      return;
    }
    const body = parseBody(req);
    const patch = validateProfile(body);
    // Budget keyed to the verified account (not a client-provided userId or email).
    if (!await enforceProfileEditBudget(cfg, req, res, access.userId)) return;
    const existing = await readProfile(cfg, access.userId);
    let uploadedPath = '';
    if (body.photo) {
      const photo = await preparePhoto(body.photo);
      uploadedPath = `${access.userId}/${crypto.randomUUID()}.jpg`;
      await request(cfg, `/storage/v1/object/${BUCKET}/${uploadedPath}`, {
        method: 'POST', headers: { 'Content-Type': 'image/jpeg', 'x-upsert': 'false' }, body: photo
      });
      patch.avatar_path = uploadedPath;
      patch.avatar_customized = true;
      patch.avatar_url = null;
    } else if (body.removePhoto) {
      patch.avatar_path = null; patch.avatar_url = null; patch.avatar_customized = true;
    }
    let profile;
    try {
      const rows = await request(cfg, '/rest/v1/profiles?on_conflict=id', {
        method: 'POST', headers: { Prefer: 'resolution=merge-duplicates,return=representation' },
        body: JSON.stringify([{ ...patch, id: access.userId }])
      });
      profile = rows?.[0];
      if (!profile?.id) throw problem('profile_storage_unavailable', 503);
    } catch (error) {
      if (uploadedPath) await deleteAvatar(cfg, uploadedPath, access.userId).catch(() => {});
      throw error;
    }
    // Do not erase the saved identity on a temporary photo-signing failure.
    const avatarUrl = await signedAvatar(cfg, profile).catch(() => '');
    if ((uploadedPath || body.removePhoto) && existing?.avatar_path !== profile.avatar_path) {
      await deleteAvatar(cfg, existing?.avatar_path, access.userId).catch(() => {});
    }
    // Own response uses an explicit allowlist, not the service-role SELECT * result.
    const safeOwn = Object.fromEntries(FIELDS.split(',').map(key => [key, profile[key]]));
    sendJson(req, res, 200, { ok: true, profile: safeOwn, avatarUrl }, METHODS);
  } catch (error) {
    sendJson(req, res, error.status || 503, { ok: false, error: error.code || 'profile_storage_unavailable' }, METHODS);
  }
};
module.exports.validateProfile = validateProfile;
module.exports.publicProfile = publicProfile;
module.exports.preparePhoto = preparePhoto;
module.exports.ownAvatarPath = ownAvatarPath;
