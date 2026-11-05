import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import { createRequire } from 'node:module';
import { PGlite } from '@electric-sql/pglite';
const db=new PGlite();
const a='11111111-1111-4111-8111-111111111111',b='22222222-2222-4222-8222-222222222222';
await db.exec(`create role anon;create role authenticated;create role service_role bypassrls;create schema auth;create table auth.users(id uuid primary key);insert into auth.users values('${a}'),('${b}');grant usage on schema public to anon,authenticated,service_role;`);
const sql=await fs.readFile(new URL('../supabase/migrations/20261105000500_social_request_budget.sql',import.meta.url),'utf8');await db.exec(sql);await db.exec(sql);
try {
  await db.exec('set role service_role');
  const take=async(id,limit)=>(await db.query('select sonic_consume_social_request_budget($1,$2) result',[id,limit])).rows[0].result;
  const attempts=await Promise.all(Array.from({length:12},()=>take(a,3)));
  assert.equal(attempts.filter(r=>r.allowed).length,3);assert.ok(attempts.every(r=>r.remaining>=0));
  assert.deepEqual(await take(b,3),{allowed:true,remaining:2});
  await assert.rejects(()=>take(a,0),/invalid_social_budget/);
  await db.exec('reset role;set role authenticated');
  await assert.rejects(()=>take(a,3),/permission denied/);await assert.rejects(()=>db.query('select * from social_request_usage'),/permission denied/);
  await db.exec('reset role;set role anon');await assert.rejects(()=>take(a,3),/permission denied/);
} finally {await db.close();}
const require=createRequire(import.meta.url);const handler=require('../lib/api/_comments.js');
for(const k of Object.keys(process.env)) if(/^(SUPABASE_|SONIC_|KV_|UPSTASH_)/.test(k)) delete process.env[k];
Object.assign(process.env,{NODE_ENV:'production',SUPABASE_URL:'https://test.invalid',SUPABASE_ANON_KEY:'test-anon',SUPABASE_SERVICE_ROLE_KEY:'test-service',SONIC_TRACK_VIDEO_SOCIAL_V2_ENABLED:'true',SONIC_SOCIAL_COMMENTS_ENABLED:'true',SONIC_REQUIRE_DURABLE_RATE_LIMITS:'true'});
let mode='denied',budgetCalls=0;const original=global.fetch;
global.fetch=async(url,options)=>{
  if(url.endsWith('/auth/v1/user'))return new Response(JSON.stringify({id:a}),{status:200});
  if(url.endsWith('/rest/v1/rpc/sonic_consume_social_request_budget')){budgetCalls++;assert.equal(JSON.parse(options.body).p_user_id,a);return new Response(JSON.stringify(mode==='denied'?{allowed:false,remaining:0}:mode==='broken'?{allowed:true,remaining:-1}:{message:'missing function'}),{status:mode==='missing'?404:200});}
  throw Error('Unexpected request '+new URL(url).pathname);
};
const call=async(token=true)=>{const req={method:'POST',headers:{host:'localhost',...(token?{authorization:'Bearer valid'}:{})},body:{userId:b}};const res={setHeader(){},end(s){this.body=JSON.parse(s);}};await handler(req,res);return res;};
try{
  assert.equal((await call(false)).statusCode,401);assert.equal(budgetCalls,0);
  assert.equal((await call()).statusCode,429);
  process.env.SONIC_REQUIRE_DURABLE_RATE_LIMITS='false';
  assert.equal((await call()).statusCode,429,'Legacy global override cannot bypass durable social limits in production');
  mode='missing';assert.equal((await call()).statusCode,503);
  mode='broken';assert.equal((await call()).statusCode,503);
  console.log('Social limits passed: atomic cap, account isolation, private RPC, no beta-code dependency, and fail-closed errors.');
}finally{global.fetch=original;}
