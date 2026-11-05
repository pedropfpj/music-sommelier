// Explicit production smoke: only synthetic identities and isolated QA targets.
// Never reads tokens from a browser or changes an existing listener's content.
import fs from 'node:fs/promises';
import assert from 'node:assert/strict';
import crypto from 'node:crypto';
import sharp from 'sharp';
if (!process.argv.includes('--confirm-production')) throw Error('Requires --confirm-production');
process.loadEnvFile('.env.local');
const origin = 'https://sonicsearch.app';
const base = process.env.SUPABASE_URL;
assert.equal(base, 'https://bskjwpomegvpiyyfbwex.supabase.co');
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SERVICE_KEY;
const dir = '.vendor/production-release-20261105/';
const credentialsFile = dir + 'test-identities.json';
let identities = await fs.readFile(credentialsFile, 'utf8').then(JSON.parse).catch(() => ({}));
const config = await fetch(origin + '/api/social-config', {headers:{Origin:origin}}).then(r => r.json());
assert.equal(config.features.publicProfiles, true); assert.equal(config.features.socialV2, true);
const checks = [];
async function cloud(route, {admin=false, token, method='GET', body}={}) {
  const key = admin ? serviceKey : config.supabaseAnonKey;
  const response = await fetch(base + route, {method, headers:{apikey:key, ...(token ? {Authorization:'Bearer '+token} : admin ? {Authorization:'Bearer '+key} : {}),'Content-Type':'application/json'}, body:body ? JSON.stringify(body) : undefined, signal:AbortSignal.timeout(20000)});
  return {status:response.status, body:await response.json().catch(()=>null)};
}
async function account(name) {
  if (!identities[name]) {
    const email = `sonic-release-${name}-${crypto.randomUUID()}@example.test`, password = crypto.randomBytes(32).toString('base64url');
    const r = await cloud('/auth/v1/admin/users', {admin:true, method:'POST', body:{email,password,email_confirm:true,user_metadata:{display_name:'Sonic QA '+name}}});
    assert.equal(r.status,200,'Create synthetic account');
    identities[name] = {id:r.body.id,email,password};
    await fs.writeFile(credentialsFile,JSON.stringify(identities),{mode:0o600});
  }
  const r = await cloud('/auth/v1/token?grant_type=password',{method:'POST',body:identities[name]});
  assert.equal(r.status,200,'Sign in synthetic account');
  return {...identities[name], token:r.body.access_token,refresh:r.body.refresh_token};
}
let a, b, commentId;
const target = {targetType:'track',targetKey:'track:sonic_release_qa_20261105'};
async function request(route,{user=a,method='GET',body}={}) {
  const response = await fetch(origin+route,{method,headers:{Origin:origin,'Content-Type':'application/json',...(user?{Authorization:'Bearer '+user.token}:{})},body:body?JSON.stringify(body):undefined,signal:AbortSignal.timeout(45000)});
  return {status:response.status,body:await response.json(),store:response.headers.get('X-Sonic-Usage-Store')};
}
const handle='sonic_release_qa_20261105';
const own={displayName:'Sonic QA — teste de publicação',username:handle,bio:'Perfil sintético usado para verificar a publicação.',preferences:['idm','organic_house'],privacy:{public:false,link:false,photo:false,bio:false,styles:false}};
try {
  a=await account('a');b=await account('b');
  assert.equal((await request('/api/user-profile',{user:null})).status,401);
  const photo=(await sharp({create:{width:720,height:480,channels:3,background:'#80ffdc'}}).jpeg().withMetadata({exif:{IFD0:{Artist:'synthetic-private-metadata'}}}).toBuffer()).toString('base64');
  const saved=await request('/api/user-profile',{method:'POST',body:{...own,photo,id:b.id}});
  assert.equal(saved.status,200, 'Save profile: '+JSON.stringify(saved.body));
  assert.equal(saved.body.profile.id,a.id);assert.equal(saved.store,'supabase');
  const img=await fetch(saved.body.avatarUrl);assert.equal(img.status,200);
  const meta=await sharp(Buffer.from(await img.arrayBuffer())).metadata();assert.equal(meta.width,512);assert.equal(meta.exif,undefined);
  assert.equal((await request('/api/user-profile?username='+handle,{user:b})).status,404);
  assert.equal((await request('/api/user-profile',{user:b,method:'POST',body:own})).status,409);
  assert.equal((await request('/api/user-profile',{method:'POST',body:{...own,privacy:{public:true,link:true,photo:true,bio:false,styles:true}}})).status,200);
  const visitor=await request('/api/user-profile?username='+handle,{user:null});assert.equal(visitor.status,200);
  assert.deepEqual(Object.keys(visitor.body.publicProfile).sort(),['username','displayName','bio','styles','avatarUrl'].sort());assert.equal(visitor.body.publicProfile.bio,'');
  assert.deepEqual((await cloud('/rest/v1/profiles?id=eq.'+a.id+'&select=id',{token:b.token})).body,[]);
  assert.equal((await cloud('/rest/v1/profiles?select=id')).status,401);
  checks.push('Real production Auth, private photo storage, EXIF removal, owner-only RLS, unique handle, explicit public link');
  for(let i=0;i<2;i++){const liked=await request('/api/comments',{method:'POST',body:{action:'like-target',...target,liked:true}});assert.equal(liked.status,200,JSON.stringify(liked.body));assert.deepEqual(liked.body.targetReaction,{likes:1,liked:true});}
  const post={...target,body:'Verificação sintética de publicação do Sonic.',clientRequestId:crypto.randomUUID(),metadata:{displayName:'Forged author'}};
  const created=await request('/api/comments',{method:'POST',body:post});assert.equal(created.status,200,JSON.stringify(created.body));
  commentId=created.body.comment.id;assert.equal(created.body.comment.author.displayName,own.displayName);
  const retry=await request('/api/comments',{method:'POST',body:post});assert.equal(retry.body.comment.id,commentId);
  assert.equal((await request('/api/comments',{user:b,method:'PATCH',body:{...target,id:commentId,body:'Not allowed'}})).status,404);
  assert.equal((await request('/api/comments',{method:'PATCH',body:{...target,id:commentId,body:'Verificação sintética revisada.'}})).body.ok,true);
  assert.equal((await request('/api/comments?'+new URLSearchParams(target))).body.comments.length,1);
  checks.push('Production comments, verified author, edit ownership, retry idempotency and like idempotency');
  const refreshed=await cloud('/auth/v1/token?grant_type=refresh_token',{method:'POST',body:{refresh_token:a.refresh}});assert.equal(refreshed.status,200);a.token=refreshed.body.access_token;
  assert.equal((await request('/api/user-profile')).body.profile.username,handle);
  checks.push('Real refresh and persisted profile on public domain');
} finally {
  if(a){
    if(commentId) assert.equal((await request('/api/comments?'+new URLSearchParams({...target,id:commentId}),{method:'DELETE'})).body.ok,true);
    assert.equal((await request('/api/comments',{method:'POST',body:{action:'like-target',...target,liked:false}})).status,200);
    assert.equal((await request('/api/user-profile',{method:'POST',body:{...own,removePhoto:true}})).status,200);
  }
}
checks.push('Synthetic comment soft-deleted, target unliked and test profile private again');
await fs.writeFile('reports/public-release-20261105/social-production.json',JSON.stringify({at:new Date().toISOString(),origin,passed:true,checks,notTested:['Google/Apple completed OAuth callback','native iOS'],existingListenerDataChanged:false},null,2));
console.log(JSON.stringify({passed:true,checks},null,2));
