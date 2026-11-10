// Fresh in-memory identities only. Never reads env credentials or calls a service.
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { randomUUID } from 'node:crypto';
import { PGlite } from '@electric-sql/pglite';

const sql = await readFile(process.env.SONIC_FRIENDSHIP_MIGRATION || new URL('../supabase/migrations/20261110040007_private_friendships.sql', import.meta.url), 'utf8');
const db = new PGlite();
const a = '11111111-1111-4111-8111-111111111111', b = '22222222-2222-4222-8222-222222222222', c = '33333333-3333-4333-8333-333333333333';
async function asRole(role, query, values = []) {
  assert.ok(['anon', 'authenticated', 'service_role'].includes(role));
  return db.transaction(async tx => { await tx.exec(`set local role ${role}`); return (await tx.query(query, values)).rows; });
}
async function mutate(actor, action, other = null, payload = {}) {
  return (await asRole('service_role', 'select public.sonic_friends_mutate($1::uuid,$2,$3::uuid,$4::jsonb) as result', [actor, action, other, JSON.stringify(payload)]))[0].result;
}
async function view(actor, action, query = '', tokenHash = '') {
  return (await asRole('service_role', 'select public.sonic_friends_view($1::uuid,$2,$3,$4) as result', [actor, action, query, tokenHash]))[0].result;
}
async function blocks(actor, ids, stamp) {
  return asRole('service_role', 'select public.sonic_friend_sync_blocks($1::uuid,$2::uuid[],$3::timestamptz)', [actor, ids, stamp]);
}
try {
  await db.exec(`create role anon; create role authenticated; create role service_role bypassrls;
    create schema auth; create table auth.users(id uuid primary key);
    create table public.profiles(id uuid primary key references auth.users(id),display_name text,username text,profile_public boolean default false,profile_link_public boolean default false);
    grant usage on schema public to anon,authenticated,service_role;
    grant select on public.profiles to service_role;
    insert into auth.users values('${a}'),('${b}'),('${c}');
    insert into public.profiles values('${a}','Public alias','public_alias',true,true),('${b}','Private profile','private_alias',false,false),('${c}','Third account','third_alias',false,false);`);
  const baseline = JSON.stringify((await db.query('select * from public.profiles order by id')).rows);
  await db.exec(sql); await db.exec(sql);
  const tables = (await db.query("select relname,relrowsecurity from pg_catalog.pg_class c join pg_catalog.pg_namespace n on n.oid=c.relnamespace where n.nspname='public' and relname like 'friend_%' and relkind='r'")).rows;
  assert.ok(tables.length >= 6 && tables.every(row => row.relrowsecurity));
  for (const role of ['anon', 'authenticated']) {
    for (const table of tables) await assert.rejects(asRole(role, `select * from public.${table.relname}`), /permission denied/);
    await assert.rejects(asRole(role, 'select public.sonic_friends_view($1::uuid,$2)', [a, 'overview']), /permission denied/);
    await assert.rejects(asRole(role, 'select public.sonic_friends_mutate($1::uuid,$2,null,$3::jsonb)', [a, 'settings', JSON.stringify({ displayName: 'Forged identity' })]), /permission denied/);
    await assert.rejects(asRole(role, 'select public.sonic_friend_person($1::uuid,true)', [b]), /permission denied/, 'A helper RPC cannot expose a private friends alias to the browser');
  }
  for (const [id, name, username] of [[a, 'Friends Ana', 'public_alias'], [b, 'Friends Bia', 'private_alias'], [c, 'Friends Cora', 'third_alias']]) {
    await mutate(id, 'settings', null, { displayName: name, username });
  }
  assert.equal(JSON.stringify((await db.query('select * from public.profiles order by id')).rows), baseline, 'Friends opt-in must not publish or modify the existing app profile');
  await assert.rejects(mutate(a, 'request', b, { clientRequestId: randomUUID() }), /person_not_found/, 'Private identities cannot be enumerated/requested without an invite');
  const hash = 'a'.repeat(64);
  const invite = (await mutate(b, 'create-invite', null, { clientRequestId: randomUUID(), tokenHash: hash })).invite;
  assert.ok(Date.parse(invite.expiresAt) - Date.parse(invite.createdAt) <= 7 * 86400000 + 1000);
  const requestId = randomUUID();
  const outgoing = await mutate(a, 'request', b, { clientRequestId: requestId, inviteHash: hash });
  assert.equal(outgoing.relationship, 'outgoing');
  const crossRequest = await mutate(b, 'request', a, { clientRequestId: randomUUID() });
  assert.equal(crossRequest.relationship, 'incoming', 'Crossing requests must not silently accept a friendship');
  assert.equal((await view(a, 'overview')).friends.length, 0);
  await assert.rejects(mutate(a, 'respond', b, { relationshipId: outgoing.relationshipId, decision: 'accept' }), /relationship_not_found/, 'A requester cannot accept their own outgoing request');
  await assert.rejects(mutate(c, 'respond', a, { relationshipId: outgoing.relationshipId, decision: 'accept' }), /relationship_not_found/);
  assert.equal((await mutate(b, 'respond', a, { relationshipId: outgoing.relationshipId, decision: 'accept' })).relationship, 'accepted');
  const postRequestId = randomUUID();
  const track = { artist: 'Fixture Artist', title: 'Fixture Recording', style: 'house' };
  const post = (await mutate(a, 'share-track', null, { clientRequestId: postRequestId, track, text: 'Only accepted friends can read this fixture.' })).post;
  assert.equal((await view(b, 'feed'))[0].id, post.id);
  assert.equal((await view(b, 'post', post.id)).id, post.id);
  assert.equal((await view(c, 'feed')).length, 0);
  await assert.rejects(view(c, 'post', post.id), /post_not_found/, 'Knowing a private post ID must not grant access');
  await assert.rejects(mutate(c, 'delete-post', null, { postId: post.id }), /post_not_found/);
  await mutate(b, 'remove', a, { relationshipId: outgoing.relationshipId });
  assert.equal((await view(b, 'feed')).length, 0);
  await assert.rejects(view(b, 'post', post.id), /post_not_found/, 'Removing friendship immediately revokes direct post access');
  await assert.rejects(mutate(b, 'respond', a, { relationshipId: outgoing.relationshipId, decision: 'accept' }), /relationship_not_found/, 'A delayed old acceptance cannot recreate a removed edge');
  await mutate(a, 'request', b, { clientRequestId: requestId, inviteHash: hash });
  assert.equal((await view(b, 'overview')).incoming.length, 0, 'An old idempotent request cannot resurrect an edge after removal');
  const next = await mutate(a, 'request', b, { clientRequestId: randomUUID(), inviteHash: hash });
  await mutate(b, 'respond', a, { relationshipId: next.relationshipId, decision: 'accept' });
  const stamp = '2026-11-10T12:00:00.000Z';
  await blocks(a, [b], stamp);
  assert.equal((await view(b, 'feed')).length, 0);
  await assert.rejects(view(b, 'post', post.id), /post_not_found/);
  await blocks(a, [], '2026-11-10T11:59:00.000Z');
  assert.equal((await db.query('select public.sonic_friend_blocked($1::uuid,$2::uuid) as blocked', [a, b])).rows[0].blocked, true, 'An older block snapshot cannot undo a newer block');
  try { await blocks(a, [], stamp); } catch (_) { /* Explicit conflicting-version rejection is also fail closed. */ }
  assert.equal((await db.query('select public.sonic_friend_blocked($1::uuid,$2::uuid) as blocked', [a, b])).rows[0].blocked, true, 'A different snapshot with the same millisecond version cannot undo a newer block');
  await blocks(a, [], '2026-11-10T12:00:01.000Z');
  assert.equal((await view(b, 'feed')).length, 0, 'Unblocking never restores a revoked friendship');
  await mutate(a, 'delete-post', null, { postId: post.id });
  await assert.rejects(mutate(a, 'share-track', null, { clientRequestId: postRequestId, track, text: 'Only accepted friends can read this fixture.' }), /request_conflict/, 'Retry cannot resurrect a deleted post');
  await mutate(a, 'revoke-invite', null, { inviteId: invite.id });
  assert.equal((await view(a, 'invite', '', hash)).person.id, b, 'Only an invite owner can revoke it');
  await mutate(b, 'revoke-invite', null, { inviteId: invite.id });
  await assert.rejects(view(a, 'invite', '', hash), /invite_not_found/);
  console.log('Private friendship security passed: service-only SQL/RPC, unchanged public profiles, explicit mutual acceptance, third-account denial, direct-post/feed revocation, block versions, retry tombstones and owner-only invite revocation. Fresh local PostgreSQL fixtures only.');
} finally { await db.close(); }
