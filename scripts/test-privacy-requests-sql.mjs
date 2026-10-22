import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import { PGlite } from '@electric-sql/pglite';
const db = new PGlite();
const a = '11111111-1111-4111-8111-111111111111', b = '22222222-2222-4222-8222-222222222222';
const sql = await fs.readFile(new URL('../supabase/migrations/20260922120000_privacy_requests.sql', import.meta.url), 'utf8');
try {
  await db.exec(`create role anon; create role authenticated; create role service_role bypassrls;
    create schema auth; create table auth.users(id uuid primary key); insert into auth.users values ('${a}'),('${b}');
    grant usage on schema public, auth to anon, authenticated, service_role;`);
  await db.exec(sql); await db.exec(sql);
  for (const role of ['anon', 'authenticated']) {
    await db.exec(`set role ${role};`);
    await assert.rejects(db.query('select * from public.sonic_privacy_requests'), /permission denied/);
    await assert.rejects(db.query("select public.sonic_create_privacy_request($1,$2,'delete_account','','listener@example.com')", [a, b]), /permission denied/);
    await db.exec('reset role;');
  }
  await db.exec('set role service_role;');
  const create = (user, key) => db.query("select public.sonic_create_privacy_request($1,$2,'delete_account','','listener@example.com') as receipt", [user, key]);
  const first = (await create(a, b)).rows[0].receipt;
  assert.equal(first.status, 'open');
  assert.equal((await create(a, b)).rows[0].receipt.id, first.id, 'Retry returns same receipt');
  assert.notEqual((await create(b, b)).rows[0].receipt.id, first.id, 'Other account cannot retrieve same receipt by guessed key');
  for (let i = 0; i < 9; i++) await create(a, `33333333-3333-4333-8333-${String(i).padStart(12, '0')}`);
  await assert.rejects(create(a, '44444444-4444-4444-8444-444444444444'), /privacy_request_daily_limit/);
  assert.equal((await create(a, b)).rows[0].receipt.id, first.id, 'Retry works even at limit');
  await db.exec(`reset role; delete from auth.users where id='${a}';`);
  assert.equal((await db.query('select user_id from public.sonic_privacy_requests where id=$1', [first.id])).rows[0].user_id, null);
  console.log('PASS SQL migration: repeatable, private permissions, idempotency, account isolation, quota, retained receipt after account deletion');
} finally { await db.close(); }
