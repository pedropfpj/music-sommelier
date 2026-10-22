import assert from 'node:assert/strict';
import { createRequire } from 'node:module';
import fs from 'node:fs/promises';
const require = createRequire(import.meta.url);
const sharp = require('sharp');
const handler = require('../lib/api/_user-profile.js');
const { validate, project } = require('../user-profile.js');
const userId = '11111111-1111-4111-8111-111111111111';
const otherId = '22222222-2222-4222-8222-222222222222';
const draft = { displayName: 'Ana', username: 'ana_sonic', bio: 'Rock, reggae e um bom samba.', privacy: { public: false, photo: false, bio: false, styles: false } };
assert.equal(validate(draft), '');
assert.equal(validate({ ...draft, username: '../escape' }), 'invalid_username');
assert.equal(validate({ ...draft, bio: 'a'.repeat(281) }), 'invalid_bio');
assert.equal(project(draft, ['reggae']), null);
assert.deepEqual(project({ ...draft, privacy: { public: true, photo: false, bio: false, styles: false } }, ['reggae']), {
  displayName: 'Ana', username: 'ana_sonic', bio: '', photo: false, styles: []
});
assert.throws(() => handler.validateProfile({ ...draft, privacy: { public: 'true' } }), /invalid_privacy/);
assert.throws(() => handler.validateProfile({ ...draft, displayName: { unexpected: true } }), /invalid_display_name/);
assert.throws(() => handler.validateProfile({ ...draft, photo: 123 }), /invalid_photo/);
assert.throws(() => handler.validateProfile({ ...draft, bio: 'Eu vou te matar' }), /profile_text_not_allowed/);
assert.equal(handler.publicProfile({ profile_public: false }), null);
assert.equal(handler.ownAvatarPath(`${otherId}/aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa.jpg`, userId), false);
assert.equal(handler.ownAvatarPath(`${userId}/../outside.jpg`, userId), false);
await assert.rejects(handler.preparePhoto(Buffer.from('<svg onload="alert(1)"/>').toString('base64')), /invalid_photo/);
await assert.rejects(handler.preparePhoto('a'.repeat(800000)), /invalid_photo/);
await assert.rejects(handler.preparePhoto(Buffer.alloc(30).toString('base64')), /invalid_photo/);
const original = await sharp({ create: { width: 800, height: 600, channels: 3, background: '#345678' } }).jpeg().withMetadata({ exif: { IFD0: { Artist: 'private-owner' } } }).toBuffer();
const sanitized = await handler.preparePhoto(original.toString('base64'));
const metadata = await sharp(sanitized).metadata();
assert.equal(metadata.width, 512); assert.equal(metadata.height, 512); assert.equal(metadata.format, 'jpeg'); assert.equal(metadata.exif, undefined);

const previousEnv = { ...process.env }, originalFetch = global.fetch;
Object.assign(process.env, { SONIC_SOCIAL_ENABLED: 'true', SUPABASE_URL: 'https://profile.test', SUPABASE_ANON_KEY: 'mock-anon', SUPABASE_SERVICE_ROLE_KEY: 'mock-service', SONIC_REQUIRE_DURABLE_RATE_LIMITS: 'false', SONIC_PROFILE_EDIT_DAILY_LIMIT: '40', NODE_ENV: 'test' });
const profiles = new Map(), photos = new Map(); let failSave = false, writes = 0;
let blockViewer = false;
let rpcBudget = null;
function reply(body, status = 200) { return { ok: status < 400, status, json: async () => body, text: async () => JSON.stringify(body) }; }
global.fetch = async (url, options = {}) => {
  const u = new URL(url), method = options.method || 'GET';
  if (u.pathname === '/auth/v1/user') return options.headers.Authorization === 'Bearer valid-user' ? reply({ id: userId, email: 'private@example.test' }) : reply({}, 401);
  if (u.pathname === '/rest/v1/rpc/sonic_consume_profile_edit_budget') {
    assert.deepEqual(JSON.parse(options.body), { p_user_id: userId, p_daily_limit: 40 });
    assert.equal(options.headers.Authorization, 'Bearer mock-service');
    return rpcBudget ? reply(rpcBudget) : reply({ code: 'PGRST202' }, 404);
  }
  if (u.pathname.startsWith('/storage/v1/bucket/')) return reply({});
  if (u.pathname.startsWith('/storage/v1/object/sonic-social-comments/moderation/')) return reply({ blockedUserIds: blockViewer ? [userId, otherId] : [] });
  if (u.pathname === '/rest/v1/profiles') {
    if (method === 'GET') {
      const row = u.searchParams.has('username') ? [...profiles.values()].find(p => p.username === u.searchParams.get('username').slice(3) && p.profile_public) : profiles.get(u.searchParams.get('id')?.slice(3));
      const fields = u.searchParams.get('select').split(',');
      return reply(row ? [Object.fromEntries(fields.map(f => [f, row[f]]))] : []);
    }
    if (failSave) return reply({ code: '23505' }, 409);
    const patch = JSON.parse(options.body)[0]; writes++;
    const row = { ...profiles.get(patch.id), ...patch, updated_at: new Date().toISOString(), secret: 'must-not-leak', sonic_dna: { private: true } };
    profiles.set(patch.id, row); return reply([row]);
  }
  if (u.pathname.startsWith('/storage/v1/object/sign/')) {
    assert.deepEqual(JSON.parse(options.body), { expiresIn: 60 });
    return reply({ signedURL: u.pathname.replace('/storage/v1', '') + '?token=mock-signature' });
  }
  if (u.pathname.startsWith('/storage/v1/object/sonic-profile-avatars/') && method === 'POST') {
    photos.set(u.pathname.split('/sonic-profile-avatars/')[1], options.body); return reply({ Key: u.pathname });
  }
  if (u.pathname === '/storage/v1/object/sonic-profile-avatars' && method === 'DELETE') {
    for (const path of JSON.parse(options.body).prefixes) photos.delete(path); return reply({});
  }
  throw new Error(`Unexpected mocked profile operation ${method} ${u.pathname}`);
};
async function call(method, body, token = 'valid-user', username = '') {
  const req = { method, url: `/api/user-profile${username ? `?username=${username}` : ''}`, headers: { host: '127.0.0.1', authorization: `Bearer ${token}` }, body };
  const res = { headers: {}, setHeader(k, v) { this.headers[k] = v; }, end(text) { this.result = JSON.parse(text); } };
  await handler(req, res); return res;
}
try {
  assert.equal((await call('GET', undefined, 'forged-token')).statusCode, 401);
  assert.equal(writes, 0);
  assert.equal((await call('GET')).result.profile, null);
  const saved = await call('POST', { ...draft, id: otherId, userId: otherId, photo: original.toString('base64') });
  assert.equal(saved.statusCode, 200); assert.equal(saved.result.profile.id, userId); assert.ok(!profiles.has(otherId));
  assert.equal(saved.headers['Cache-Control'], 'private, no-store, max-age=0');
  assert.ok(saved.result.avatarUrl.startsWith('https://profile.test/storage/v1/object/sign/'));
  assert.equal(saved.result.profile.secret, undefined); assert.equal(saved.result.profile.sonic_dna, undefined);
  assert.equal(photos.size, 1);
  assert.equal((await call('GET', undefined, 'valid-user', 'ana_sonic')).statusCode, 404, 'Private profile cannot be requested by handle');
  const visible = { ...draft, privacy: { public: true, photo: false, bio: true, styles: false } };
  assert.equal((await call('POST', visible)).statusCode, 200);
  const publicRead = (await call('GET', undefined, 'valid-user', 'ana_sonic')).result.publicProfile;
  assert.deepEqual(publicRead, { username: draft.username, displayName: draft.displayName, bio: draft.bio, styles: [], avatarUrl: '' });
  profiles.set(otherId, { id: otherId, username: 'other_user', display_name: 'Other', profile_public: true });
  blockViewer = true;
  assert.equal((await call('GET', undefined, 'valid-user', 'other_user')).statusCode, 404, 'Existing community blocking also protects public profile lookup');
  blockViewer = false;
  const existingPath = profiles.get(userId).avatar_path;
  failSave = true;
  assert.equal((await call('POST', { ...visible, photo: original.toString('base64') })).statusCode, 409);
  assert.equal(photos.size, 1, 'Failed profile save removes only its new orphan photo');
  assert.equal(profiles.get(userId).avatar_path, existingPath);
  failSave = false;
  const removed = await call('POST', { ...visible, removePhoto: true });
  assert.equal(removed.result.avatarUrl, ''); assert.equal(removed.result.profile.avatar_path, null); assert.equal(photos.size, 0);
  assert.equal((await call('POST', { ...draft, privacy: { public: 'yes' } })).statusCode, 400);
  assert.equal((await call('POST', { ...draft, photo: 'bad-value' })).statusCode, 400);
  assert.equal((await call('POST', { ...draft, bio: 'b'.repeat(281) })).statusCode, 400);
  const beforeBudget = writes;
  process.env.SONIC_PROFILE_EDIT_DAILY_LIMIT = '1';
  assert.equal((await call('POST', draft)).statusCode, 429, 'Verified account budget cannot be reset by a forged userId');
  assert.equal(writes, beforeBudget);
  process.env.SONIC_PROFILE_EDIT_DAILY_LIMIT = '40'; process.env.SONIC_REQUIRE_DURABLE_RATE_LIMITS = 'true';
  delete process.env.KV_REST_API_URL; delete process.env.KV_REST_API_TOKEN; delete process.env.UPSTASH_REDIS_REST_URL; delete process.env.UPSTASH_REDIS_REST_TOKEN;
  const unavailableBudget = await call('POST', draft);
  assert.equal(unavailableBudget.statusCode, 503);
  assert.equal(unavailableBudget.result.error, 'profile_setup_required');
  assert.equal(writes, beforeBudget);
  rpcBudget = { allowed: false, remaining: 0 };
  assert.equal((await call('POST', draft)).statusCode, 429);
  assert.equal(writes, beforeBudget);
  rpcBudget = { allowed: true, remaining: -1 };
  assert.equal((await call('POST', draft)).statusCode, 503, 'Invalid durable counter fails closed');
  assert.equal(writes, beforeBudget);
  rpcBudget = { allowed: true, remaining: 39 };
  const databaseBudget = await call('POST', { ...draft, userId: otherId });
  assert.equal(databaseBudget.statusCode, 200);
  assert.equal(databaseBudget.headers['X-Sonic-Usage-Store'], 'supabase');
  assert.equal(databaseBudget.headers['X-Sonic-Music-Durable-Remaining'], '39');
  const app = await fs.readFile(new URL('../app.js', import.meta.url), 'utf8');
  const sync = app.slice(app.indexOf('async function upsertSocialProfile()'), app.indexOf('async function insertSocialActivity('));
  assert.ok(sync.includes('resolution=ignore-duplicates'));
  assert.ok(sync.includes('body: { favorite_styles, liked_track_count, sonic_dna, updated_at }'), 'Automatic sync writes musical fields only');
  console.log('User profile tests passed: authorization, private defaults, publication allowlist, image validation/metadata removal, cancel-safe failures, removal, account budget and sync protection.');
} finally {
  global.fetch = originalFetch;
  for (const key of Object.keys(process.env)) if (!(key in previousEnv)) delete process.env[key];
  Object.assign(process.env, previousEnv);
}
