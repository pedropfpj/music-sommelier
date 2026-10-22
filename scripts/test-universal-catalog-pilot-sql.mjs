#!/usr/bin/env node
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { PGlite } from "@electric-sql/pglite";

const migration = await readFile(new URL("../supabase/migrations/20260911000100_universal_music_foundation.sql", import.meta.url), "utf8");
const sql = await readFile(new URL("../supabase/seeds/universal_catalog_pilot_candidates.sql", import.meta.url), "utf8");
const dataset = JSON.parse(await readFile(new URL("../data/universal-catalog-pilot.json", import.meta.url), "utf8"));
assert.ok(dataset.tracks.length > 0, "Cannot validate an empty research pilot");
const ddl = migration.slice(migration.indexOf("create table if not exists public.music_universes"), migration.indexOf("create table if not exists public.user_music_preferences"));
const taxonomy = migration.slice(migration.indexOf("insert into public.music_universes"), migration.indexOf("-- Aliases are locale-aware"));
const view = migration.slice(migration.indexOf("create or replace view public.music_catalog_public_v1"), migration.indexOf("revoke all on public.music_universes"));
const keyFunction = `create function public.catalog_key(input text) returns text language sql immutable as $$
  select regexp_replace(lower(trim(input)), '[^[:alnum:]]+', '', 'g')
$$;`;

async function database() {
  const db = new PGlite();
  await db.exec(keyFunction + ddl + taxonomy + view);
  return db;
}
async function scalar(db, query, parameters = []) { return (await db.query(query, parameters)).rows[0].count; }

let db;
try {
  db = await database();
  await db.exec(sql);
  assert.equal(await scalar(db, "select count(*)::int as count from public.music_recordings"), dataset.tracks.length);
  assert.equal(await scalar(db, "select count(*)::int as count from public.music_recordings where status <> 'needs_review'"), 0);
  assert.equal(await scalar(db, "select count(*)::int as count from public.music_recording_genres where assertion_status <> 'candidate'"), 0);
  assert.equal(await scalar(db, "select count(*)::int as count from public.music_catalog_public_v1"), 0, "Candidates cannot enter the public catalog");
  assert.equal(await scalar(db, "select count(*)::int as count from public.music_provider_links where link_type <> 'external'"), 0);
  assert.equal(await scalar(db, "select count(*)::int as count from public.music_catalog_quarantine"), dataset.tracks.length);
  assert.equal(await scalar(db, "select count(*)::int as count from public.music_source_assertions"), dataset.tracks.length);
  assert.ok(await scalar(db, "select count(*)::int as count from public.music_works") > 0, "Classical works must survive SQL import");
  assert.ok(await scalar(db, "select count(*)::int as count from public.music_recording_artists where role = 'composer'") > 0);
  await db.exec(sql);
  assert.equal(await scalar(db, "select count(*)::int as count from public.music_recordings"), dataset.tracks.length, "Replay must be idempotent");
  assert.equal(await scalar(db, "select count(*)::int as count from public.music_catalog_quarantine"), dataset.tracks.length);
  await db.close();

  // Verify preservation of an authoritative legacy provider recording.
  db = await database();
  const track = dataset.tracks[0];
  const link = track.providerLinks[0];
  const artist = (await db.query("insert into public.music_artists (canonical_name,status) values ($1,'recommendable') returning id", [track.artist])).rows[0];
  await db.query("insert into public.music_artist_external_ids (artist_id,provider,external_id) values ($1,'apple_music',$2)", [artist.id, link.artistExternalId]);
  const legacy = (await db.query("insert into public.music_recordings (title,identity_key,status,metadata) values ('Original authoritative title','legacy:preserve','recommendable','{\"sentinel\":true}') returning id")).rows[0];
  await db.query("insert into public.music_provider_links (recording_id,provider,external_id,url) values ($1,'apple_music',$2,$3)", [legacy.id, link.externalId, link.url]);
  await db.exec(sql);
  const preserved = (await db.query("select title,status,metadata from public.music_recordings where id=$1", [legacy.id])).rows[0];
  assert.equal(preserved.title, "Original authoritative title");
  assert.equal(preserved.status, "recommendable");
  assert.deepEqual(preserved.metadata, { sentinel: true });
  assert.equal(await scalar(db, "select count(*)::int as count from public.music_provider_links where provider='apple_music' and external_id=$1", [link.externalId]), 1);
  assert.equal(await scalar(db, "select count(*)::int as count from public.music_catalog_quarantine where entity_key=$1", [track.key]), 0);
  await db.close();

  // A homonymous/misassigned artist ID must roll back the whole batch.
  db = await database();
  const other = (await db.query("insert into public.music_artists (canonical_name) values ('Wrong provider identity') returning id")).rows[0];
  await db.query("insert into public.music_artist_external_ids (artist_id,provider,external_id) values ($1,'apple_music',$2)", [other.id, link.artistExternalId]);
  await assert.rejects(db.exec(sql), /identity collision/);
  await db.exec("rollback;");
  assert.equal(await scalar(db, "select count(*)::int as count from public.music_recordings"), 0);
  assert.equal(await scalar(db, "select count(*)::int as count from public.music_artists"), 1);
  console.log(`Universal pilot SQL passed against in-memory PostgreSQL: ${dataset.tracks.length} candidates, classical credits, idempotency, legacy preservation and atomic collision rollback.`);
} catch (error) {
  console.error(`Universal pilot SQL failed: ${error.message}`);
  process.exitCode = 1;
} finally {
  if (db && !db.closed) await db.close();
}
