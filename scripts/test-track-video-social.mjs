import assert from 'node:assert/strict';
import { createRequire } from 'node:module';
import fs from 'node:fs/promises';
import vm from 'node:vm';
const require = createRequire(import.meta.url);
const handler = require('../lib/api/_comments.js');
const app = await fs.readFile(new URL('../app.js', import.meta.url), 'utf8');
const start = app.indexOf('function extractYouTubeVideoId('), end = app.indexOf('\nfunction trackHasDirectYouTubeVideo', start);
const context = vm.createContext({ URL }); vm.runInContext(app.slice(start, end), context);
for (const url of ['https://www.youtube.com/watch?v=abcdefghijk', 'https://youtu.be/abcdefghijk?t=10', 'https://www.youtube-nocookie.com/embed/abcdefghijk', 'https://m.youtube.com/shorts/abcdefghijk']) assert.equal(context.extractYouTubeVideoId(url), 'abcdefghijk');
assert.equal(context.extractYouTubeVideoId('https://youtube.com.attacker.test/watch?v=abcdefghijk'), '');
const a = '11111111-1111-4111-8111-111111111111';
const b = '22222222-2222-4222-8222-222222222222';
Object.assign(process.env, { SUPABASE_URL: 'https://social.test', SUPABASE_ANON_KEY: 'anon-test', SUPABASE_SERVICE_ROLE_KEY: 'service-test', SONIC_REQUIRE_DURABLE_RATE_LIMITS: 'false', SONIC_SOCIAL_COMMENTS_ENABLED: 'true', SONIC_TRACK_VIDEO_SOCIAL_V2_ENABLED: 'true', SONIC_SOCIAL_COMMENTS_DAILY_LIMIT: '10000', SONIC_COMMUNITY_EMAIL_ENABLED: 'false', NODE_ENV: 'test' });
const originalFetch = global.fetch;
const comments = new Map(); const likes = new Map();
let schemaMissing = false; let blocked = false;
const reply = (data, status = 200) => ({ ok: status < 400, status, text: async () => JSON.stringify(data), json: async () => data });
global.fetch = async (url, options = {}) => {
  const u = new URL(url), method = options.method || 'GET';
  const body = options.body ? JSON.parse(options.body) : undefined;
  if (u.pathname === '/auth/v1/user') {
    const token = options.headers.Authorization;
    return token === 'Bearer user-a' ? reply({ id: a }) : token === 'Bearer user-b' ? reply({ id: b }) : reply({}, 401);
  }
  if (u.pathname.startsWith('/storage/v1/bucket/')) return reply({});
  if (u.pathname.startsWith('/storage/v1/object/')) {
    assert.equal(method, 'GET', 'Comments never write a fallback JSON thread');
    assert.ok(u.pathname.includes('/moderation/'), 'Only blocklists use storage');
    return reply({ blockedUserIds: blocked ? [b] : [] });
  }
  if (u.pathname === '/rest/v1/profiles') return reply([{ id: a, username: 'private_name', display_name: 'Private', profile_public: false }, { id: b, username: 'public_name', display_name: 'Public', profile_public: true }]);
  if (u.pathname === '/rest/v1/activity_feed') return reply([]);
  if (u.pathname === '/rest/v1/comments') {
    if (schemaMissing) return reply({ message: 'column status does not exist' }, 400);
    if (method === 'POST') {
      const row = { ...body[0], id: String(comments.size + 1), status: 'visible', created_at: new Date().toISOString() };
      comments.set(row.id, row); return reply([row]);
    }
    const selected = [...comments.values()].filter(row => ['id', 'user_id', 'target_type', 'target_key', 'status'].every(key => !u.searchParams.has(key) || row[key] === u.searchParams.get(key).slice(3)));
    if (method === 'PATCH') selected.forEach(row => Object.assign(row, body));
    return reply(selected);
  }
  if (u.pathname === '/rest/v1/comment_reactions' || u.pathname === '/rest/v1/rpc/sonic_comment_reaction_summary') return reply([]);
  if (u.pathname === '/rest/v1/rpc/sonic_target_like') {
    assert.equal(options.headers.Authorization, 'Bearer service-test');
    const { p_user_id: user, p_target_type: type, p_target_key: key, p_liked: liked } = body;
    const id = `${type}:${key}`; const voters = likes.get(id) || new Set();
    if (liked === true) voters.add(user); if (liked === false) voters.delete(user); likes.set(id, voters);
    return reply({ liked: voters.has(user), likes: voters.size });
  }
  throw new Error(`Unexpected operation ${method} ${u.pathname}`);
};
async function call(method, body, token = 'user-a', query = {}) {
  const req = { method, url: '/api/comments', query, headers: { host: '127.0.0.1', authorization: `Bearer ${token}` }, body };
  const res = { headers: {}, setHeader(k, v) { this.headers[k] = v; }, end(text) { this.result = JSON.parse(text); } };
  await handler(req, res); return res;
}
const target = { targetType: 'video', targetKey: 'youtube:abcdefghijk' };
try {
  assert.equal((await call('GET', undefined, 'forged', target)).statusCode, 401);
  assert.equal((await call('POST', { ...target, body: 'Hi', userId: b }, 'forged')).statusCode, 401);
  const created = await call('POST', { ...target, body: 'Great set!', userId: b, metadata: { displayName: 'Forged owner', username: 'admin', avatarUrl: 'https://evil.test/pic' } });
  assert.equal(created.result.ok, true); assert.equal(comments.get('1').user_id, a);
  assert.equal(created.result.comment.author.displayName, 'Private', 'A verified author sees their current private app identity');
  assert.equal(created.result.comment.author.username, 'private_name');
  assert.equal(created.result.comment.author.avatarUrl, '');
  assert.equal((await call('POST', { ...target, body: 'Second listener' }, 'user-b')).result.comment.author.displayName, 'Public');
  let list = await call('GET', undefined, 'user-a', target);
  assert.equal(list.result.comments.length, 2);
  const otherView = await call('GET', undefined, 'user-b', target);
  assert.equal(otherView.result.comments.find(comment => comment.id === '1').author.displayName, 'Sonic listener');
  assert.equal(otherView.result.comments.find(comment => comment.id === '1').author.username, '');
  assert.equal(list.headers['Cache-Control'], 'private, no-store, max-age=0');
  assert.deepEqual(list.result.targetReaction, { likes: 0, liked: false });
  for (let n = 0; n < 2; n++) assert.deepEqual((await call('POST', { ...target, action: 'like-target', liked: true, userId: b })).result.targetReaction, { likes: 1, liked: true });
  assert.deepEqual((await call('GET', undefined, 'user-b', target)).result.targetReaction, { likes: 1, liked: false });
  assert.deepEqual((await call('POST', { ...target, action: 'like-target', liked: false })).result.targetReaction, { likes: 0, liked: false });
  assert.equal((await call('POST', { ...target, action: 'like-target', liked: 'yes' })).statusCode, 400);
  assert.equal((await call('PATCH', { id: '2', body: 'Stolen edit' })).statusCode, 404);
  assert.equal((await call('PATCH', { id: '1', body: 'Edited' })).result.ok, true);
  assert.equal((await call('POST', { ...target, body: 'Eu vou te matar' })).statusCode, 422);
  blocked = true;
  assert.equal((await call('GET', undefined, 'user-a', target)).result.comments.length, 1);
  assert.equal((await call('POST', { ...target, action: 'react', commentId: '2', value: 1 })).statusCode, 404);
  blocked = false;
  assert.equal((await call('DELETE', { id: '1' })).result.ok, true);
  assert.equal((await call('GET', undefined, 'user-a', target)).result.comments.length, 1);
  assert.equal((await call('POST', { ...target, action: 'react', commentId: '1', value: 1 })).statusCode, 404);
  schemaMissing = true;
  assert.equal((await call('GET', undefined, 'user-a', target)).result.setupNeeded, true);
  assert.equal((await call('POST', { ...target, body: 'Must not fall back to storage' })).result.ok, false);
  console.log('Social API passed: authenticated reads, verified identity, profile privacy, target likes, retries, ownership, moderation, hidden comments and no fallback writes.');
} finally { global.fetch = originalFetch; }
