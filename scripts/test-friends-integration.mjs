import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import crypto from 'node:crypto';
import { createSocialLab, users } from './social-profile-lab.mjs';

const dataDir = await fs.mkdtemp(path.join(os.tmpdir(), 'sonic-friends-'));
users.caio = { id: '33333333-3333-4333-8333-333333333333', email: 'private-c@example.test', user_metadata: { name: 'Private OAuth C', picture: 'https://private.test/photo' } };
let lab = await createSocialLab({ port: 0, dataDir, friends: true });
const a = users.ana.id, b = users.bia.id, c = users.caio.id;
const uuid = () => crypto.randomUUID();
async function call(account, action, body, route = '/api/friends') {
  const response = await fetch(lab.origin + route + (!body ? '?' + new URLSearchParams({ action, ...(typeof action === 'object' ? action : {}) }) : ''), {
    method: body ? 'POST' : 'GET', headers: { 'Content-Type': 'application/json', ...(account ? { Authorization: `Bearer lab-${account}` } : {}) },
    body: body ? JSON.stringify({ action, ...body }) : undefined
  });
  return { status: response.status, body: await response.json() };
}
async function get(account, action, query = {}) {
  const response = await fetch(lab.origin + '/api/friends?' + new URLSearchParams({ action, ...query }), { headers: account ? { Authorization: `Bearer lab-${account}` } : {} });
  return { status: response.status, body: await response.json() };
}
async function ok(account, action, body) {
  const result = await call(account, action, body);
  assert.equal(result.status, 200, JSON.stringify({ action, ...result })); assert.equal(result.body.ok, true); return result.body;
}
const track = { artist: 'Dark Whisper', title: 'Rhythm of The Infinite', style: 'psycore', url: 'https://www.deezer.com/track/740834142', catalogId: 'dark whisper::rhythm of the infinite' };
try {
  await lab.db.query('insert into auth.users(id) values($1)', [c]);
  for (const [user, handle, name] of [[a, 'ana_app', 'Private App A'], [b, 'bia_app', 'Public App B'], [c, 'caio_app', 'Private App C']]) {
    await lab.db.query("insert into profiles(id,username,display_name,bio,sonic_dna,avatar_url) values($1,$2,$3,'PRIVATE BIO','{\"private\":true}','https://private.test/avatar')", [user, handle, name]);
  }
  await lab.db.query('update profiles set profile_public=true,profile_link_public=true where id=$1', [b]);
  assert.equal((await get(null, 'overview')).status, 401);
  assert.equal((await get('forged', 'overview')).status, 401);
  await lab.db.query("insert into social_request_usage(user_id,usage_day,request_count) values($1,(clock_timestamp() at time zone 'UTC')::date,7)", [a]);
  let overview = (await get('ana', 'overview')).body;
  assert.equal(overview.me.enabled, false); assert.equal(overview.me.identity.displayName, 'Private App A'); assert.equal(overview.me.identity.avatarUrl, '');
  assert.deepEqual(overview.friends, []);
  assert.equal((await lab.db.query('select request_count from social_request_usage where user_id=$1', [a])).rows[0].request_count, 7, 'Friends reads do not spend the existing comments allowance');
  assert.equal((await call('ana', 'request', { userId: b, clientRequestId: uuid() })).status, 403);
  assert.equal((await call('ana', 'settings', { displayName: 'private@example.test', username: 'ana_app' })).status, 400);
  assert.equal((await call('ana', 'settings', { displayName: 'Alias A', username: 'bia_app' })).status, 400);
  for (const [account, name, username] of [['ana', 'Alias A', 'ana_app'], ['bia', 'Alias B', 'bia_app'], ['caio', 'Alias C', 'caio_app']]) await ok(account, 'settings', { displayName: name, username });
  assert.equal((await get('ana', 'search', { q: 'caio' })).body.people.length, 0, 'Private people are not enumerable');
  assert.equal((await get('ana', 'search', { q: 'bia' })).body.people[0].displayName, 'Public App B', 'Search uses the explicitly public identity, not a private friends alias');
  assert.equal((await call('bia', 'request', { userId: a, clientRequestId: uuid() })).status, 404, 'Knowing a private UUID does not authorize a request');
  assert.equal((await call('bia', 'request', { userId: uuid(), clientRequestId: uuid() })).status, 404, 'Unknown UUID and unavailable private person use the same status');

  const inviteRequest = uuid();
  const invite = (await ok('ana', 'create-invite', { clientRequestId: inviteRequest })).invite;
  assert.equal(invite.token.length, 43);
  assert.deepEqual((await ok('ana', 'create-invite', { clientRequestId: inviteRequest })).invite, invite, 'Invite retry returns the same capability');
  const storedInvite = (await lab.db.query('select * from friend_invites')).rows[0];
  assert.equal(storedInvite.token, undefined); assert.notEqual(storedInvite.token_hash, invite.token);
  assert.equal((await call(null, 'invite-preview', { token: invite.token })).status, 401);
  const preview = await ok('bia', 'invite-preview', { token: invite.token });
  assert.deepEqual(preview.person, { id: a, displayName: 'Alias A', username: 'ana_app', avatarUrl: '' });
  assert.equal(preview.relationship, 'none');
  assert.equal((await lab.db.query('select count(*)::int n from friend_edges')).rows[0].n, 0, 'Opening a capability makes no relationship');
  const reqId = uuid();
  const requested = await ok('bia', 'request', { userId: a, inviteToken: invite.token, clientRequestId: reqId, user_id: c });
  assert.equal(requested.relationship, 'outgoing');
  const edge = requested.relationshipId;
  await ok('bia', 'request', { userId: a, inviteToken: invite.token, clientRequestId: reqId });
  assert.equal((await lab.db.query('select count(*)::int n from friend_edges')).rows[0].n, 1);
  const crossed = await ok('ana', 'request', { userId: b, clientRequestId: uuid() });
  assert.equal(crossed.relationship, 'incoming', 'Crossed requests never silently accept');
  assert.equal((await get('ana', 'overview')).body.incoming[0].person.displayName, 'Alias B');
  assert.equal((await get('bia', 'overview')).body.outgoing[0].person.displayName, 'Alias A');
  const postRequest = uuid();
  const post = (await ok('ana', 'share-track', { clientRequestId: postRequest, track: { ...track, history: 'PRIVATE HISTORY', coverArtUrl: 'https://private.test/photo' }, text: 'Escuta esta faixa.', author_id: c, audience: 'public' })).post;
  assert.deepEqual(post.track, track); assert.equal(post.author.id, a); assert.equal(post.audience, 'friends');
  assert.equal((await get('bia', 'feed')).body.posts.length, 0, 'Pending relationships do not grant post access');
  assert.equal((await get('bia', 'post', { postId: post.id })).status, 404);
  assert.equal((await call('bia', 'respond', { userId: a, relationshipId: edge, decision: 'accept' })).status, 404, 'Requester cannot accept its own request');
  await ok('ana', 'respond', { userId: b, relationshipId: edge, decision: 'accept' });
  await ok('ana', 'respond', { userId: b, relationshipId: edge, decision: 'accept' });
  assert.equal((await get('bia', 'feed')).body.posts[0].id, post.id);
  assert.equal((await get('bia', 'post', { postId: post.id })).body.post.author.displayName, 'Alias A');
  assert.equal((await get('caio', 'feed')).body.posts.length, 0);
  await lab.db.query('insert into follows(follower_id,following_id) values($1,$2)', [c, a]);
  assert.equal((await get('caio', 'post', { postId: post.id })).status, 404, 'A third account cannot fetch a known post ID');
  assert.equal((await get('caio', 'feed')).body.posts.length, 0, 'Public follows do not grant friends access');
  assert.equal((await get('bia', 'search', { q: 'ana' })).body.people.length, 0, 'Friendship does not widen private profile search');
  assert.equal((await lab.db.query('select profile_public from profiles where id=$1', [a])).rows[0].profile_public, false);
  const feedText = JSON.stringify((await get('bia', 'feed')).body);
  for (const forbidden of ['PRIVATE BIO', 'PRIVATE HISTORY', 'private.test', '@example.test', 'sonic_dna', 'liked_track_count', 'avatar_path']) assert.ok(!feedText.includes(forbidden), forbidden);
  await ok('ana', 'share-track', { clientRequestId: postRequest, track, text: 'Escuta esta faixa.' });
  assert.equal((await lab.db.query('select count(*)::int n from friend_posts')).rows[0].n, 1, 'Posting retry is idempotent');
  assert.equal((await call('ana', 'share-track', { clientRequestId: postRequest, track, text: 'Changed' })).status, 409);
  assert.equal((await call('ana', 'share-track', { clientRequestId: uuid(), track: { ...track, url: 'http://127.0.0.1/private' } })).status, 400);
  assert.equal((await call('ana', 'share-track', { clientRequestId: uuid(), track: { ...track, url: 'https://audio-ssl.itunes.apple.com/private-preview?token=secret' } })).status, 400);
  assert.equal((await call('ana', 'share-track', { clientRequestId: uuid(), track: { ...track, url: track.url + '?track=private-context' } })).status, 400);
  assert.equal((await call('caio', 'delete-post', { postId: post.id })).status, 404);
  assert.equal((await call('caio', 'report', { postId: post.id, reason: 'spam' })).status, 404);
  await ok('bia', 'report', { postId: post.id, reason: 'spam' });
  assert.equal((await lab.db.query("select count(*)::int n from lab_objects where path like '%/reports/%'")).rows[0].n, 1);

  const concurrentRequestId = uuid();
  const simultaneous = await Promise.all(Array.from({ length: 3 }, () => ok('caio', 'request', { userId: b, clientRequestId: concurrentRequestId })));
  assert.equal(new Set(simultaneous.map(row => row.relationshipId)).size, 1, 'Concurrent retries share one canonical relationship');
  const simultaneousId = simultaneous[0].relationshipId;
  const [cancelled, accepted] = await Promise.all([
    call('caio', 'cancel', { userId: b, relationshipId: simultaneousId }),
    call('bia', 'respond', { userId: c, relationshipId: simultaneousId, decision: 'accept' })
  ]);
  assert.equal(cancelled.status, 200);
  const remaining = (await lab.db.query('select * from friend_edges where id=$1', [simultaneousId])).rows[0];
  assert.ok((accepted.status === 404 && !remaining) || (accepted.status === 200 && remaining?.status === 'accepted'), 'Cancel vs accept has one serial outcome and cannot resurrect a cancelled request');
  if (remaining) await ok('bia', 'remove', { userId: c, relationshipId: simultaneousId });

  const safeFetch = global.fetch;
  global.fetch = async (url, options) => new URL(url).pathname.includes('/moderation/v1/blocks/') ? new Response('{}', { status: 503 }) : safeFetch(url, options);
  const outage = await get('bia', 'feed');
  global.fetch = safeFetch;
  assert.equal(outage.status, 503); assert.equal(outage.body.posts, undefined, 'Block-state outage never returns a cached/unfiltered feed');

  await lab.close(); lab = await createSocialLab({ port: 0, dataDir, friends: true });
  assert.equal((await get('bia', 'feed')).body.posts[0].id, post.id, 'Friendships/posts survive process restart and additive migration rerun');
  await ok('bia', 'remove', { userId: a, relationshipId: edge });
  assert.equal((await get('bia', 'post', { postId: post.id })).status, 404, 'Removing friendship immediately revokes historical post reads');
  await ok('bia', 'request', { userId: a, inviteToken: invite.token, clientRequestId: reqId });
  assert.equal((await lab.db.query('select count(*)::int n from friend_edges')).rows[0].n, 0, 'Retrying an old request cannot recreate a removed friendship');
  const next = await ok('bia', 'request', { userId: a, inviteToken: invite.token, clientRequestId: uuid() });
  assert.notEqual(next.relationshipId, edge);
  assert.equal((await call('bia', 'remove', { userId: a, relationshipId: edge })).status, 404, 'Stale removal cannot remove a newer request');
  await ok('bia', 'cancel', { userId: a, relationshipId: next.relationshipId });
  assert.equal((await call('ana', 'respond', { userId: b, relationshipId: next.relationshipId, decision: 'accept' })).status, 404, 'Cancelled request cannot be accepted');

  const request2 = await ok('bia', 'request', { userId: a, inviteToken: invite.token, clientRequestId: uuid() });
  await ok('ana', 'respond', { userId: b, relationshipId: request2.relationshipId, decision: 'accept' });
  const block = await call('bia', 'block', { userId: a, blocked: true }, '/api/comments');
  assert.equal(block.body.ok, true, JSON.stringify(block));
  assert.equal((await lab.db.query('select count(*)::int n from friend_edges')).rows[0].n, 0, 'Existing block action revokes mutual relationship');
  assert.equal((await get('ana', 'search', { q: 'bia' })).body.people.length, 0, 'Inbound blocks hide public search results');
  assert.equal((await get('bia', 'feed')).body.posts.length, 0);
  assert.equal((await get('bia', 'post', { postId: post.id })).status, 404);
  assert.equal((await call('bia', 'invite-preview', { token: invite.token })).status, 404);
  await call('bia', 'block', { userId: a, blocked: false }, '/api/comments');
  assert.equal((await get('bia', 'feed')).body.posts.length, 0, 'Unblocking does not recreate friendship');
  const state = (await lab.db.query('select * from friend_block_states where user_id=$1', [b])).rows[0];
  await lab.db.query('select sonic_friend_sync_blocks($1,$2,$3)', [b, [a], '2099-01-01T00:00:00Z']);
  await lab.db.query('select sonic_friend_sync_blocks($1,$2,$3)', [b, [], state.source_updated_at]);
  assert.deepEqual((await lab.db.query('select blocked_ids from friend_block_states where user_id=$1', [b])).rows[0].blocked_ids, [a], 'Delayed empty block snapshot cannot undo a newer block');
  await lab.db.query('select sonic_friend_sync_blocks($1,$2,$3)', [b, [], '2099-01-01T00:00:00Z']);
  assert.deepEqual((await lab.db.query('select blocked_ids from friend_block_states where user_id=$1', [b])).rows[0].blocked_ids, [a], 'Equal-version conflicts fail closed instead of dropping a block');
  await ok('ana', 'revoke-invite', { inviteId: invite.id });
  assert.equal((await call('ana', 'create-invite', { clientRequestId: inviteRequest })).status, 404, 'Old create retry cannot present a revoked capability as live');
  assert.equal((await call('caio', 'invite-preview', { token: invite.token })).status, 404);
  const expired = (await ok('ana', 'create-invite', { clientRequestId: uuid() })).invite;
  await lab.db.query("update friend_invites set expires_at=now()-interval '1 second' where id=$1", [expired.id]);
  assert.equal((await call('caio', 'invite-preview', { token: expired.token })).status, 404, 'Expired capabilities disclose no identity');
  await ok('ana', 'delete-post', { postId: post.id });
  assert.equal((await get('ana', 'post', { postId: post.id })).status, 404);
  assert.equal((await call('ana', 'share-track', { clientRequestId: postRequest, track, text: 'Escuta esta faixa.' })).status, 409, 'Retry never resurrects deleted post');

  const fullBlockPath = 'sonic-social-comments/moderation/v1/blocks/' + crypto.createHash('sha256').update(c).digest('hex').slice(0, 48) + '.json';
  const fullBlockBytes = Buffer.from(JSON.stringify({ blockedUserIds: Array.from({ length: 500 }, uuid), updatedAt: new Date().toISOString() }));
  await lab.db.query("insert into lab_objects(path,bytes,content_type) values($1,$2,'application/json') on conflict(path) do update set bytes=excluded.bytes", [fullBlockPath, fullBlockBytes]);
  const overCap = await call('caio', 'block', { userId: a, blocked: true }, '/api/comments');
  assert.equal(overCap.body.ok, false, 'A 501st block cannot falsely acknowledge revocation');
  assert.deepEqual(Buffer.from((await lab.db.query('select bytes from lab_objects where path=$1', [fullBlockPath])).rows[0].bytes), fullBlockBytes, 'Block cap failure preserves existing blocks');

  // Direct database access stays denied even if a forgotten permissive policy or
  // table grant is introduced. Only the verified backend can call mutations.
  const tables = ['friend_settings','friend_edges','friend_invites','friend_posts','friend_operations','friend_block_states','friend_request_usage'];
  await lab.db.exec('set role anon');
  for (const table of tables) await assert.rejects(lab.db.query('select * from ' + table), /permission denied/);
  await assert.rejects(lab.db.query("select sonic_friends_view($1,'overview')", [a]), /permission denied/);
  await lab.db.exec('reset role');
  for (const table of tables) await lab.db.exec(`grant all on ${table} to authenticated; create policy forgotten_access on ${table} for all to authenticated using(true) with check(true)`);
  await lab.db.exec('set role authenticated');
  for (const table of tables) assert.equal((await lab.db.query('select * from ' + table)).rows.length, 0, table + ' restrictive policy');
  await assert.rejects(lab.db.query("select sonic_friends_mutate($1,'settings',null,'{}')", [b]), /permission denied/);
  await assert.rejects(lab.db.query("insert into friend_settings(user_id,display_name) values($1,'Forged')", [c]), /row-level security/);
  await lab.db.exec('reset role');
  console.log(JSON.stringify({ passed: true, checks: ['real handlers + persistent PGlite + idempotent additive migration', 'private opt-in search', 'explicit consented alias; no OAuth/photo/history leakage', 'invite preview is nonmutating/revocable/hashed', 'mutual requests/accept/cancel/remove and stale retries', 'friends-only feed and direct post reads', 'durable explicit posts and owner-only deletion', 'moderation authorization without email', 'two-direction blocks and stale block versions', 'service-only RPCs and restrictive RLS'] }));
} finally { await lab.close(); delete users.caio; await fs.rm(dataDir, { recursive: true, force: true }); }
