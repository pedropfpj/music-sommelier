import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import sharp from 'sharp';
import { createSocialLab, users } from './social-profile-lab.mjs';

const dataDir = await fs.mkdtemp(path.join(os.tmpdir(), 'sonic-comment-identity-'));
const originalAna = structuredClone(users.ana);
let lab = await createSocialLab({ port: 0, dataDir });
const target = { targetType: 'track', targetKey: 'identity-fixture' };
const oauthPhoto = 'https://lh3.googleusercontent.com/fixture-public-photo';
async function request(route, { account = 'ana', method = 'GET', body } = {}) {
  const response = await fetch(lab.origin + route, {
    method, headers: { 'Content-Type': 'application/json', ...(account ? { Authorization: `Bearer lab-${account}` } : {}) },
    body: body ? JSON.stringify(body) : undefined
  });
  return { status: response.status, body: await response.json() };
}
const comments = account => request('/api/comments?' + new URLSearchParams(target), { account });
const hydrate = body => request('/api/user-profile', { method: 'POST', body: { action: 'hydrate-identity', ...body } });
async function resetGeneric() {
  await lab.db.query("update profiles set display_name='Sonic listener',username='sonic_user',profile_public=false,show_avatar=false,avatar_customized=false,avatar_path=null where id=$1", [users.ana.id]);
}
try {
  users.ana.user_metadata = { display_name: 'Ana Pública', username: 'ana_publica', avatar_url: oauthPhoto, private_note: 'DO_NOT_PUBLISH', email: 'private-metadata@example.test' };
  await lab.db.query("insert into profiles(id,username,display_name,bio,favorite_styles,sonic_dna) values($1,'sonic_user','Sonic listener','Private biography',array['private_history'],'{\"private\":true}')", [users.ana.id]);
  await lab.db.query("insert into profiles(id,username,display_name) values($1,'bia_lab','Bia Custom')", [users.bia.id]);
  const before = (await lab.db.query('select * from profiles where id=$1', [users.ana.id])).rows[0];
  assert.equal((await request('/api/user-profile')).body.avatarUrl, oauthPhoto);
  assert.equal((await lab.db.query('select display_name from profiles where id=$1', [users.ana.id])).rows[0].display_name, 'Sonic listener', 'GET never writes identity');
  const created = await request('/api/comments', { method: 'POST', body: { ...target, body: 'Comentário de teste isolado.', metadata: { displayName: 'Forged name', avatarUrl: 'https://forged.test/photo' } } });
  assert.equal(created.body.ok, true, JSON.stringify(created));
  const id = created.body.comment.id;
  assert.equal(created.body.comment.author.displayName, 'Ana Pública', 'A private author sees their own verified identity');
  assert.equal(created.body.comment.author.avatarUrl, oauthPhoto);
  let other = (await comments('bia')).body.comments[0];
  assert.deepEqual(other.author, { id: users.ana.id, username: '', displayName: 'Sonic listener', avatarUrl: '' }, 'Other viewers cannot see private app/OAuth identity');
  assert.ok(!JSON.stringify(other).includes('DO_NOT_PUBLISH'));
  assert.ok(!JSON.stringify(other).includes('@example.test'));

  const repaired = await hydrate({ id: users.bia.id, displayName: 'Forged override', avatarUrl: 'https://forged.test/photo' });
  assert.equal(repaired.status, 200, JSON.stringify(repaired));
  assert.equal(repaired.body.profile.id, users.ana.id);
  assert.equal(repaired.body.profile.display_name, 'Ana Pública');
  assert.equal(repaired.body.profile.username, 'ana_publica');
  assert.equal(repaired.body.avatarUrl, oauthPhoto);
  assert.equal(repaired.body.profile.profile_public, false);
  assert.equal(repaired.body.profile.show_avatar, false);
  assert.equal(repaired.body.profile.email, undefined);
  assert.equal(repaired.body.profile.private_note, undefined);
  const after = (await lab.db.query('select * from profiles where id=$1', [users.ana.id])).rows[0];
  for (const field of ['bio', 'favorite_styles', 'sonic_dna', 'avatar_url', 'avatar_path', 'avatar_customized', 'profile_public', 'show_avatar']) assert.deepEqual(after[field], before[field], field + ' preserved');
  assert.equal((await lab.db.query('select display_name from profiles where id=$1', [users.bia.id])).rows[0].display_name, 'Bia Custom');
  const writes = lab.requests.filter(r => r.method === 'PATCH' && r.path === '/rest/v1/profiles').length;
  await hydrate();
  assert.equal(lab.requests.filter(r => r.method === 'PATCH' && r.path === '/rest/v1/profiles').length, writes, 'Repeated hydration is a no-op');

  const draft = { displayName: 'Ana Curadoria', username: 'ana_curadoria', bio: 'Meu perfil escolhido.', privacy: { public: false, photo: false, bio: false, styles: false } };
  const photo = (await sharp({ create: { width: 64, height: 64, channels: 3, background: '#80ffdc' } }).jpeg().toBuffer()).toString('base64');
  const saved = await request('/api/user-profile', { method: 'POST', body: { ...draft, photo } });
  assert.equal(saved.status, 200);
  assert.ok(saved.body.avatarUrl.startsWith(lab.origin));
  const retainedPhoto = saved.body.profile.avatar_path;
  await hydrate();
  const custom = (await request('/api/user-profile')).body;
  assert.equal(custom.profile.display_name, 'Ana Curadoria');
  assert.equal(custom.profile.username, 'ana_curadoria');
  assert.equal(custom.profile.avatar_path, retainedPhoto, 'A custom photo is never replaced by OAuth');
  let own = (await comments('ana')).body.comments[0];
  assert.equal(own.id, id);
  assert.equal(own.author.displayName, 'Ana Curadoria', 'Historical comments join the current app profile');
  assert.ok(own.author.avatarUrl.startsWith(lab.origin));
  assert.equal((await comments('bia')).body.comments[0].author.avatarUrl, '');
  await request('/api/user-profile', { method: 'POST', body: { ...draft, privacy: { ...draft.privacy, public: true } } });
  other = (await comments('bia')).body.comments[0];
  assert.equal(other.author.displayName, 'Ana Curadoria');
  assert.equal(other.author.avatarUrl, '', 'Public profile without photo consent still hides the photo');
  await request('/api/user-profile', { method: 'POST', body: { ...draft, privacy: { ...draft.privacy, public: true, photo: true } } });
  assert.ok((await comments('bia')).body.comments[0].author.avatarUrl.startsWith(lab.origin));
  await request('/api/user-profile', { method: 'POST', body: { ...draft, removePhoto: true } });
  await hydrate();
  assert.equal((await request('/api/user-profile')).body.avatarUrl, '', 'Explicit removal cannot revive an OAuth photo');
  assert.equal((await comments('ana')).body.comments[0].author.avatarUrl, '');

  // Restart the actual handlers/database fixture to check reloaded historical rows.
  await lab.close(); lab = await createSocialLab({ port: 0, dataDir });
  own = (await comments('ana')).body.comments[0];
  assert.equal(own.id, id); assert.equal(own.author.displayName, 'Ana Curadoria'); assert.equal(own.author.avatarUrl, '');
  assert.equal((await comments('bia')).body.comments[0].author.displayName, 'Sonic listener');

  // An explicit public identity wins even when its text equals an old default.
  await resetGeneric();
  await lab.db.query('update profiles set profile_public=true where id=$1', [users.ana.id]);
  assert.equal((await hydrate()).body.profile.display_name, 'Sonic listener');
  assert.equal((await hydrate()).body.profile.username, 'sonic_user');
  assert.equal((await comments('bia')).body.comments[0].author.avatarUrl, '', 'OAuth photo is never implicitly published');

  // A racing editor save wins over the snapshot read by hydration.
  await resetGeneric();
  const realFetch = global.fetch;
  let raced = false;
  global.fetch = async (url, options) => {
    if (!raced && new URL(url).pathname === '/rest/v1/profiles' && options?.method === 'PATCH') {
      raced = true;
      await lab.db.query("update profiles set display_name='Editor wins',username='editor_wins' where id=$1", [users.ana.id]);
    }
    return realFetch(url, options);
  };
  const racedResult = await hydrate();
  global.fetch = realFetch;
  assert.equal(raced, true); assert.equal(racedResult.body.profile.display_name, 'Editor wins'); assert.equal(racedResult.body.profile.username, 'editor_wins');

  await resetGeneric();
  users.ana.user_metadata = { full_name: 'Ana Pública', username: 'bia_lab', avatar_url: oauthPhoto };
  const collision = await hydrate();
  assert.equal(collision.status, 200); assert.equal(collision.body.profile.display_name, 'Ana Pública'); assert.equal(collision.body.profile.username, 'sonic_user', 'Handle collision preserves the original handle without failing login');
  await resetGeneric();
  users.ana.user_metadata = { display_name: 'private@example.test', username: 'private@example.test', avatar_url: 'http://127.0.0.1/private', email: 'private@example.test', private_note: 'DO_NOT_PUBLISH' };
  const emailOnly = await hydrate();
  assert.equal(emailOnly.body.profile.display_name, 'Sonic listener'); assert.equal(emailOnly.body.profile.username, 'sonic_user'); assert.equal(emailOnly.body.avatarUrl, '');
  assert.equal((await comments('ana')).body.comments[0].author.displayName, 'Sonic listener', 'Email is never a display-name fallback');
  users.ana.user_metadata = { full_name: 'private@example.test', name: 'also-private@example.test' };
  assert.equal((await hydrate()).body.profile.display_name, 'Sonic listener', 'Email-valued provider full_name/name are rejected too');
  await lab.db.query("update profiles set display_name='legacy@example.test',profile_public=true where id=$1", [users.ana.id]);
  assert.equal((await comments('ana')).body.comments[0].author.displayName, 'Sonic listener', 'Own comment projection masks an old stored email name');
  assert.equal((await comments('bia')).body.comments[0].author.displayName, 'Sonic listener', 'Public comment projection masks an old stored email name');
  assert.equal((await request('/api/user-profile?username=sonic_user', { account: 'bia' })).body.publicProfile.displayName, 'Sonic listener');
  assert.equal((await lab.db.query('select display_name from profiles where id=$1', [users.ana.id])).rows[0].display_name, 'legacy@example.test', 'Masking preserves stored data');

  // Neither backend may replay an author-name snapshot when the current profile
  // is unavailable. The legacy storage thread also joins the same projection.
  const lookupFetch = global.fetch;
  let failProfiles = false, missingProfiles = false, storageFallback = false;
  const snapshot = { id: 'storage-comment', userId: users.ana.id, ...target, body: 'Legacy test', author: { displayName: 'Private snapshot name', avatarUrl: oauthPhoto }, createdAt: new Date().toISOString() };
  global.fetch = async (url, options = {}) => {
    const path = new URL(url).pathname;
    if (path === '/rest/v1/profiles' && (!options.method || options.method === 'GET')) {
      if (failProfiles) return new Response(JSON.stringify({ message: 'temporary profile outage' }), { status: 503 });
      if (missingProfiles) return new Response('[]');
    }
    if (storageFallback && path === '/rest/v1/comments') return new Response(JSON.stringify({ message: 'relation comments does not exist' }), { status: 404 });
    if (storageFallback && path.startsWith('/storage/v1/object/sonic-social-comments/comments/')) return new Response(JSON.stringify({ ...target, comments: [snapshot] }));
    return lookupFetch(url, options);
  };
  for (const legacy of [false, true]) {
    process.env.SONIC_TRACK_VIDEO_SOCIAL_V2_ENABLED = legacy ? 'false' : 'true';
    failProfiles = true;
    let fallback = await comments('bia');
    assert.equal(fallback.body.ok, true, JSON.stringify(fallback));
    assert.deepEqual(fallback.body.comments[0].author, { id: users.ana.id, username: '', displayName: 'Sonic listener', avatarUrl: '' });
    failProfiles = false; missingProfiles = true;
    fallback = await comments('bia');
    assert.equal(fallback.body.comments[0].author.displayName, 'Sonic listener');
    if (legacy) {
      storageFallback = true;
      fallback = await comments('bia');
      assert.equal(fallback.body.storageFallback, true, JSON.stringify(fallback));
      assert.deepEqual(fallback.body.comments[0].author, { id: users.ana.id, username: '', displayName: 'Sonic listener', avatarUrl: '' }, 'Storage snapshots are never a public identity fallback');
      missingProfiles = false;
      await lab.db.query("update profiles set display_name='Current public profile' where id=$1", [users.ana.id]);
      assert.equal((await comments('bia')).body.comments[0].author.displayName, 'Current public profile', 'Legacy storage joins the current public profile');
      storageFallback = false;
    }
    missingProfiles = false;
  }
  global.fetch = lookupFetch;
  process.env.SONIC_TRACK_VIDEO_SOCIAL_V2_ENABLED = 'true';
  assert.equal((await request('/api/user-profile', { account: null, method: 'POST', body: { action: 'hydrate-identity' } })).status, 401);
  console.log(JSON.stringify({ passed: true, backend: 'Real handlers + persistent PGlite and project migrations; loopback-only Auth/Storage fixtures', checks: ['generic identity repair from verified public metadata', 'no GET writes', 'private owner vs other viewer projection', 'custom name/handle/photo/removal preserved', 'photo visibility consent', 'existing comments join current profile after reload', 'no email/private metadata projection', 'idempotent hydration', 'editor race protection', 'handle collision recovery', 'profile lookup failure/missing row stays anonymous', 'legacy database/storage joins current profile'] }));
} finally {
  Object.assign(users.ana, originalAna);
  await lab.close(); await fs.rm(dataDir, { recursive: true, force: true });
}
