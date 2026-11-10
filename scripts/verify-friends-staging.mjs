// Explicit disposable-account rehearsal. No production destination is accepted.
import assert from 'node:assert/strict';
import { readFile, stat, writeFile, mkdir } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { parseEnv } from 'node:util';
import { createRequire } from 'node:module';
import { randomUUID, randomBytes, createHash } from 'node:crypto';
if (!process.argv.includes('--staging')) throw new Error('Explicit --staging is required');
const root = process.env.SONIC_FRIENDS_SOURCE_ROOT || path.resolve(import.meta.dirname, '..');
const configFile = process.env.SONIC_FRIENDS_STAGING_ENV_PATH || path.join(root, '.env.social-staging.local');
const reportFile = process.env.SONIC_FRIENDS_STAGING_REPORT || fileURLToPath(new URL('../reports/friends-staging-20261110.json', import.meta.url));
if ((await stat(configFile)).mode & 0o077) throw new Error('Staging configuration must have mode 0600');
const env = parseEnv(await readFile(configFile, 'utf8'));
const ref = 'uauhiqrflfjhestbupjv';
if (env.STAGING_PROJECT_REF !== ref || env.STAGING_SUPABASE_URL !== `https://${ref}.supabase.co` || !env.STAGING_SUPABASE_SERVICE_ROLE_KEY || !env.STAGING_SUPABASE_ANON_KEY) throw new Error('Unknown staging destination');
for (const key of Object.keys(process.env)) if (/^(SUPABASE_|SONIC_|KV_|UPSTASH_|RESEND_)/.test(key)) delete process.env[key];
Object.assign(process.env, { NODE_ENV: 'production', SUPABASE_URL: env.STAGING_SUPABASE_URL, SUPABASE_AUTH_URL: env.STAGING_SUPABASE_URL, SUPABASE_ANON_KEY: env.STAGING_SUPABASE_ANON_KEY, SUPABASE_SERVICE_ROLE_KEY: env.STAGING_SUPABASE_SERVICE_ROLE_KEY, SONIC_FRIENDS_ENABLED: 'true', SONIC_FRIENDS_DAILY_LIMIT: '800', SONIC_SOCIAL_ENABLED: 'true', SONIC_TRACK_VIDEO_SOCIAL_V2_ENABLED: 'true', SONIC_SOCIAL_COMMENTS_ENABLED: 'true', SONIC_REQUIRE_DURABLE_RATE_LIMITS: 'true', SONIC_COMMUNITY_EMAIL_ENABLED: 'false' });
const require = createRequire(import.meta.url);
const friends = require(path.join(root, 'lib/api/_friends.js'));
const comments = require(path.join(root, 'lib/api/_comments.js'));
const accounts = [], checks = [];
const report = { projectRef: ref, passed: false, realServices: ['Supabase Auth', 'PostgREST/RPC', 'PostgreSQL', 'private moderation Storage'], fixtureAccountsCreated: 0, fixtureAccountsDeleted: 0, cleanupComplete: false, checks };
async function cloud(route, { method = 'GET', body, token, admin = false } = {}) {
  const key = admin ? env.STAGING_SUPABASE_SERVICE_ROLE_KEY : env.STAGING_SUPABASE_ANON_KEY;
  const response = await fetch(env.STAGING_SUPABASE_URL + route, { method, signal: AbortSignal.timeout(15000), headers: { apikey: key, Authorization: `Bearer ${token || key}`, 'Content-Type': 'application/json' }, body: body === undefined ? undefined : JSON.stringify(body) });
  return { status: response.status, body: await response.json().catch(() => null) };
}
async function account(index) {
  const email = `sonic-friends-disposable-${randomUUID()}@example.test`, password = randomBytes(32).toString('base64url');
  const created = await cloud('/auth/v1/admin/users', { method: 'POST', admin: true, body: { email, password, email_confirm: true, user_metadata: { full_name: `QA metadata ${index}`, picture: 'https://private.invalid/never-use-this-photo' } } });
  assert.equal(created.status, 200, 'Disposable staging Auth creation failed');
  const result = { id: created.body.id, alias: `Disposable friends ${index}` };
  accounts.push(result); report.fixtureAccountsCreated++;
  const signed = await cloud('/auth/v1/token?grant_type=password', { method: 'POST', body: { email, password } });
  assert.equal(signed.status, 200, 'Disposable staging Auth sign-in failed');
  result.token = signed.body.access_token;
  return result;
}
async function call(actor, action, body, query = {}, handler = friends) {
  const params = new URLSearchParams({ action, ...query });
  const request = { method: body === undefined ? 'GET' : 'POST', url: '/api/friends?' + params, query: Object.fromEntries(params), headers: { host: '127.0.0.1', origin: 'http://127.0.0.1', ...(actor ? { authorization: `Bearer ${actor.token}` } : {}) }, body: body === undefined ? {} : { action, ...body }, socket: { remoteAddress: '127.0.0.1' } };
  const response = { statusCode: 200, setHeader() {}, end(value) { this.body = JSON.parse(value); } };
  await handler(request, response);
  return { status: response.statusCode, body: response.body };
}
async function ok(actor, action, body, query = {}, handler = friends) {
  const result = await call(actor, action, body, query, handler);
  assert.equal(result.status, 200, `${action}: HTTP ${result.status}, code ${result.body?.error || 'unknown'}`);
  assert.equal(result.body.ok, true);
  return result.body;
}
async function clearPair(actor, other) {
  const overview = await ok(actor, 'overview');
  const edge = overview.friends.find(row => row.id === other.id)?.relationshipId || [...overview.incoming, ...overview.outgoing].find(row => row.person.id === other.id)?.id;
  if (edge) await ok(actor, 'remove', { userId: other.id, relationshipId: edge });
}
try {
  assert.equal((await call(null, 'overview')).status, 401);
  const [a, b, c] = [await account('A'), await account('B'), await account('C')];
  for (const user of accounts) await ok(user, 'settings', { displayName: user.alias, username: '' });
  checks.push('three newly created/disposable real Auth identities; no confirmation email or real user interaction');
  const deniedRpc = await cloud('/rest/v1/rpc/sonic_friends_view', { method: 'POST', token: b.token, body: { p_actor_id: a.id, p_action: 'overview' } });
  assert.ok([401, 403].includes(deniedRpc.status), 'A client JWT cannot call the backend-only RPC with a forged actor');
  const deniedTable = await cloud(`/rest/v1/friend_posts?select=id&author_id=eq.${a.id}&limit=0`, { token: b.token });
  assert.ok([401, 403].includes(deniedTable.status), 'Authenticated table grants stay revoked');
  checks.push('actual PostgREST table and RPC grants deny client JWT access');
  const inviteAId = randomUUID(), inviteBId = randomUUID();
  const inviteA = (await ok(a, 'create-invite', { clientRequestId: inviteAId })).invite;
  const inviteB = (await ok(b, 'create-invite', { clientRequestId: inviteBId })).invite;
  assert.equal((await ok(b, 'invite-preview', { token: inviteA.token })).relationship, 'none');
  const pending = await ok(b, 'request', { userId: a.id, inviteToken: inviteA.token, clientRequestId: randomUUID() });
  assert.equal(pending.relationship, 'outgoing');
  const crossed = await ok(a, 'request', { userId: b.id, inviteToken: inviteB.token, clientRequestId: randomUUID() });
  assert.equal(crossed.relationship, 'incoming');
  assert.equal((await ok(a, 'overview')).friends.length, 0);
  const postRequest = randomUUID(), track = { artist: 'Disposable fixture artist', title: 'Disposable exact recording', style: 'house' };
  const post = (await ok(a, 'share-track', { clientRequestId: postRequest, track, text: 'Isolated staging fixture only.' })).post;
  assert.equal((await call(b, 'post', undefined, { postId: post.id })).status, 404);
  await ok(a, 'respond', { userId: b.id, relationshipId: pending.relationshipId, decision: 'accept' });
  const visible = await ok(b, 'post', undefined, { postId: post.id });
  assert.equal(visible.post.author.displayName, a.alias); assert.equal(visible.post.author.avatarUrl, '');
  assert.equal((await call(c, 'post', undefined, { postId: post.id })).status, 404);
  assert.equal((await ok(c, 'feed')).posts.length, 0);
  checks.push('preview/crossed requests never auto-accept; pending/third-account direct post denied; explicit acceptance grants only private alias/no photo');
  await clearPair(a, b);
  const races = await Promise.all([
    call(a, 'request', { userId: b.id, inviteToken: inviteB.token, clientRequestId: randomUUID() }),
    call(b, 'request', { userId: a.id, inviteToken: inviteA.token, clientRequestId: randomUUID() })
  ]);
  assert.ok(races.every(row => row.status === 200));
  assert.deepEqual(races.map(row => row.body.relationship).sort(), ['incoming', 'outgoing']);
  assert.equal((await ok(a, 'overview')).friends.length, 0);
  checks.push('real concurrent PostgreSQL crossed requests produce exactly one pending edge');
  for (let iteration = 0; iteration < 3; iteration++) {
    await clearPair(a, b);
    const [request, block] = await Promise.all([
      call(b, 'request', { userId: a.id, inviteToken: inviteA.token, clientRequestId: randomUUID() }),
      call(a, 'block', { userId: b.id, blocked: true }, {}, comments)
    ]);
    assert.ok([200, 404].includes(request.status), 'Concurrent request must succeed pending or be denied by block');
    assert.equal(block.status, 200); assert.equal(block.body.ok, true);
    assert.equal((await call(b, 'post', undefined, { postId: post.id })).status, 404);
    await ok(a, 'block', { userId: b.id, blocked: false }, {}, comments);
    const after = await ok(a, 'overview');
    assert.equal(after.friends.length + after.incoming.length + after.outgoing.length, 0, 'First-edge block race cannot leave a relationship that resurfaces after unblock');
  }
  checks.push('three real concurrent first-request/block races; block/unblock never restores relationship or historical post access');
  await ok(a, 'revoke-invite', { inviteId: inviteA.id });
  assert.equal((await call(b, 'invite-preview', { token: inviteA.token })).status, 404);
  assert.equal((await call(a, 'create-invite', { clientRequestId: inviteAId })).status, 404, 'Retry cannot revive a revoked capability');
  await ok(a, 'delete-post', { postId: post.id });
  assert.equal((await call(a, 'share-track', { clientRequestId: postRequest, track, text: 'Isolated staging fixture only.' })).status, 409);
  checks.push('revoked invitation retry and deleted-post retry cannot resurrect access/content');
  report.passed = true;
} finally {
  let clean = true;
  if (accounts.length) {
    const prefixes = accounts.map(user => 'moderation/v1/blocks/' + createHash('sha256').update(user.id).digest('hex').slice(0, 48) + '.json');
    const objects = await cloud('/storage/v1/object/sonic-social-comments', { method: 'DELETE', admin: true, body: { prefixes } }).catch(() => ({ status: 0 }));
    if (![200, 204, 400, 404].includes(objects.status)) clean = false;
    for (const user of accounts) {
      const removed = await cloud('/auth/v1/admin/users/' + user.id, { method: 'DELETE', admin: true }).catch(() => ({ status: 0 }));
      if ([200, 204].includes(removed.status)) report.fixtureAccountsDeleted++; else clean = false;
      const absent = await cloud('/auth/v1/admin/users/' + user.id, { admin: true }).catch(() => ({ status: 0 }));
      if (absent.status !== 404) clean = false;
    }
  }
  report.cleanupComplete = clean && report.fixtureAccountsCreated === report.fixtureAccountsDeleted;
  report.finishedAt = new Date().toISOString();
  await mkdir(path.dirname(reportFile), { recursive: true });
  await writeFile(reportFile, JSON.stringify(report, null, 2) + '\n');
  console.log(JSON.stringify(report));
  if (!report.cleanupComplete) throw new Error('Disposable staging fixture cleanup incomplete');
}
