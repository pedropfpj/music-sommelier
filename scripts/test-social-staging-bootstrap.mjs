import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import { PGlite } from '@electric-sql/pglite';
const db=new PGlite();
const sql=(await fs.readFile(new URL('../reports/social-profiles-20261105/staging-bootstrap.sql',import.meta.url),'utf8')).replace('create extension if not exists pgcrypto;','');
try {
 await db.exec(`create role anon;create role authenticated;create role service_role bypassrls;create schema auth;create schema storage;create table auth.users(id uuid primary key);create function auth.uid() returns uuid language sql stable as $$select nullif(current_setting('request.jwt.claim.sub',true),'')::uuid$$;create table storage.buckets(id text primary key,name text,public boolean,file_size_limit bigint,allowed_mime_types text[]);create table storage.objects(id uuid,bucket_id text,name text);alter table storage.objects enable row level security;`);
 await db.exec(sql);
 assert.equal((await db.query("select count(*)::int as n from information_schema.columns where table_name='profiles' and column_name in ('musical_preferences','profile_link_public')")).rows[0].n,2);
 await assert.rejects(db.exec(sql),/STAGING_NOT_EMPTY/); await db.exec('rollback');
 await db.exec('set role anon');await assert.rejects(db.query('select * from profiles'),/permission denied/);await db.exec('reset role;set role authenticated');await assert.rejects(db.query('select * from social_target_likes'),/permission denied/);
 console.log('Fresh staging bootstrap passed; existing projects refused; private social tables stay inaccessible to anonymous/browser roles.');
}finally{await db.close();}
