import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import { PGlite } from '@electric-sql/pglite';
const db = new PGlite();
const a = '11111111-1111-4111-8111-111111111111';
const b = '22222222-2222-4222-8222-222222222222';
const core = (await fs.readFile(new URL('../supabase/migrations/20260619010700_sonic_search_core.sql', import.meta.url), 'utf8')).replace('create extension if not exists pgcrypto;', '');
const migration = await fs.readFile(new URL('../supabase/migrations/20261104000100_track_video_social.sql', import.meta.url), 'utf8');
try {
  await db.exec(`create role anon; create role authenticated; create role service_role bypassrls;
    create schema auth; create table auth.users(id uuid primary key);
    create function auth.uid() returns uuid language sql stable as $$ select nullif(current_setting('request.jwt.claim.sub',true),'')::uuid $$;
    grant usage on schema public, auth to anon, authenticated, service_role;
    insert into auth.users values ('${a}'), ('${b}');`);
  await db.exec(core);
  await db.query("insert into public.comments(user_id,target_type,target_key,body) values ($1,'track','track-1','Existing comment')", [a]);
  await db.exec(migration); await db.exec(migration);
  assert.equal((await db.query('select count(*)::int as n from comments')).rows[0].n, 1);
  for (const role of ['anon', 'authenticated']) {
    await db.exec(`set role ${role}`);
    for (const table of ['comments', 'comment_reactions', 'social_target_likes']) {
      await assert.rejects(db.query(`select * from ${table}`), /permission denied/);
    }
    await assert.rejects(db.query("select sonic_target_like($1,'video','youtube:abcdefghijk',true)", [a]), /permission denied/);
    await assert.rejects(db.query('select * from sonic_comment_reaction_summary(array[]::uuid[],$1)', [a]), /permission denied/);
    await db.exec('reset role');
  }
  // A forgotten broad grant cannot reopen tables behind the API.
  await db.exec('grant all on comments to authenticated; set role authenticated');
  assert.equal((await db.query('select * from comments')).rows.length, 0);
  await assert.rejects(db.query("insert into comments(user_id,target_type,target_key,body) values ($1,'video','v','bypass')", [a]), /row-level security/);
  await db.exec('reset role; set role service_role');
  const like = async (id, type, key, value) => (await db.query('select sonic_target_like($1,$2,$3,$4) as result', [id, type, key, value])).rows[0].result;
  assert.deepEqual(await like(a, 'video', 'youtube:abcdefghijk', true), { liked: true, likes: 1 });
  assert.deepEqual(await like(a, 'video', 'youtube:abcdefghijk', true), { liked: true, likes: 1 }, 'Retry is idempotent');
  assert.deepEqual(await like(b, 'video', 'youtube:abcdefghijk', null), { liked: false, likes: 1 }, 'Another device/account reads its own state');
  assert.deepEqual(await like(b, 'video', 'youtube:abcdefghijk', true), { liked: true, likes: 2 });
  assert.deepEqual(await like(a, 'track', 'youtube:abcdefghijk', null), { liked: false, likes: 0 }, 'Track and video identities never collide');
  assert.deepEqual(await like(a, 'video', 'youtube:abcdefghijk', false), { liked: false, likes: 1 });
  assert.deepEqual(await like(a, 'video', 'youtube:abcdefghijk', false), { liked: false, likes: 1 });
  await assert.rejects(like(a, 'unknown', 'x', true), /invalid_social_target/);
  await assert.rejects(like(a, 'video', ' ', true), /invalid_social_target/);
  for (const type of ['video', 'post', 'festival', 'track', 'dj']) {
    const row = (await db.query('insert into comments(user_id,target_type,target_key,body) values ($1,$2,$3,$4) returning id', [a, type, 'key', 'Nice selection'])).rows[0];
    await db.query('insert into comment_reactions(comment_id,user_id,value) values ($1,$2,1)', [row.id, b]);
    const summary = (await db.query('select * from sonic_comment_reaction_summary($1,$2)', [[row.id], b])).rows[0];
    assert.equal(Number(summary.likes), 1); assert.equal(Number(summary.dislikes), 0); assert.equal(summary.my_reaction, 1);
    assert.equal((await db.query('select * from sonic_comment_reaction_summary($1,$2)', [[row.id], a])).rows[0].my_reaction, 0);
    await db.query("update comments set status='hidden' where id=$1", [row.id]);
    assert.equal((await db.query('select * from sonic_comment_reaction_summary($1,$2)', [[row.id], b])).rows.length, 0);
    await db.query("update comments set status='visible' where id=$1", [row.id]);
    await assert.rejects(db.query('insert into comment_reactions(comment_id,user_id,value) values ($1,$2,1)', [row.id, b]), /unique constraint/);
  }
  await db.exec('reset role');
  await db.query('delete from auth.users where id=$1', [b]);
  assert.equal((await db.query('select count(*)::int as n from comment_reactions')).rows[0].n, 0);
  assert.equal((await db.query('select count(*)::int as n from social_target_likes')).rows[0].n, 0);
  console.log('Social PostgreSQL passed: idempotent migration, preserved comments, service-only access, retry-safe likes, account/target isolation, supported targets and account-deletion cascade.');
} finally { await db.close(); }
