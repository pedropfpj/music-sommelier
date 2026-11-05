// Explicit cloud test, restricted to the separately authorized disposable project.
// Auth, REST, PostgreSQL and Storage are real. No Google/Apple OAuth is simulated.
import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import path from 'node:path';
import crypto from 'node:crypto';
import sharp from 'sharp';
import { startStagingRuntime, root } from './social-staging-runtime.mjs';
const app=await startStagingRuntime(); const e=app.env; const checks=[];
const stateFile=path.join(root,'.vendor/social-staging-tools/test-identities.json');
async function cloud(route,{method='GET',body,token,admin=false}={}) {
  const key=admin?e.STAGING_SUPABASE_SERVICE_ROLE_KEY:e.STAGING_SUPABASE_ANON_KEY;
  const res=await fetch(e.STAGING_SUPABASE_URL+route,{method,signal:AbortSignal.timeout(15000),headers:{apikey:key,...(token?{Authorization:'Bearer '+token}:{}),'Content-Type':'application/json'},body:body?JSON.stringify(body):undefined});
  return {status:res.status,body:await res.json().catch(()=>null)};
}
let identities=await fs.readFile(stateFile,'utf8').then(JSON.parse).catch(()=>({}));
async function account(name) {
  if(!identities[name]) {
    const email=`sonic-staging-${name}-${crypto.randomUUID()}@example.test`, password=crypto.randomBytes(32).toString('base64url');
    const created=await cloud('/auth/v1/admin/users',{method:'POST',admin:true,body:{email,password,email_confirm:true,user_metadata:{display_name:name}}});
    assert.equal(created.status,200,`Test identity creation: HTTP ${created.status}`);
    identities[name]={id:created.body.id,email,password};
    await fs.writeFile(stateFile,JSON.stringify(identities),{mode:0o600});
  }
  const result=await cloud('/auth/v1/token?grant_type=password',{method:'POST',body:{email:identities[name].email,password:identities[name].password}});
  assert.equal(result.status,200,`Real Auth sign-in: HTTP ${result.status}`);
  return {...identities[name],token:result.body.access_token,refresh:result.body.refresh_token};
}
let ana,bia;
async function request(route,{user=ana,method='GET',body}={}) {
  const response=await fetch(app.origin+route,{method,headers:{'Content-Type':'application/json',...(user?{Authorization:`Bearer ${user.token}`}:{})},body:body?JSON.stringify(body):undefined,signal:AbortSignal.timeout(45000)});
  return {status:response.status,body:await response.json(),store:response.headers.get('X-Sonic-Usage-Store')};
}
try {
  ana=await account('ana');bia=await account('bia');checks.push('two real Supabase Auth identities, confirmed without email delivery');
  assert.equal((await request('/api/user-profile',{user:null})).status,401);
  const suffix=crypto.randomBytes(4).toString('hex'),handle='ana_'+suffix;
  const profile={displayName:'Ana Frequência',username:' '+handle.toUpperCase()+' ',bio:'Texto privado de teste.',preferences:['idm','organic_house'],privacy:{public:false,link:false,photo:false,bio:false,styles:false}};
  const photo=(await sharp({create:{width:720,height:480,channels:3,background:'#80ffdc'}}).jpeg().withMetadata({exif:{IFD0:{Artist:'private-test-metadata'}}}).toBuffer()).toString('base64');
  const saved=await request('/api/user-profile',{method:'POST',body:{...profile,photo,id:bia.id}});
  assert.equal(saved.status,200,JSON.stringify(saved));assert.equal(saved.store,'supabase');assert.equal(saved.body.profile.id,ana.id);assert.equal(saved.body.profile.username,handle);
  const image=await fetch(saved.body.avatarUrl);assert.equal(image.status,200);const meta=await sharp(Buffer.from(await image.arrayBuffer())).metadata();assert.equal(meta.width,512);assert.equal(meta.exif,undefined);
  checks.push('real private Storage upload, signed retrieval, 512px image and stripped metadata; durable profile budget');
  assert.equal((await request('/api/user-profile?username='+handle,{user:bia})).status,404);
  assert.equal((await request('/api/user-profile',{user:bia,method:'POST',body:profile})).status,409);
  assert.equal((await request('/api/user-profile',{user:bia,method:'POST',body:{...profile,username:'bia_'+suffix,displayName:'Bia Sonora'}})).status,200);
  const publicProfile={...profile,username:handle,privacy:{public:true,photo:true,bio:false,styles:true}};
  assert.equal((await request('/api/user-profile',{method:'POST',body:publicProfile})).status,200);
  assert.equal((await request('/api/user-profile?username='+handle,{user:null})).status,401);
  assert.equal((await request('/api/user-profile',{method:'POST',body:{...publicProfile,privacy:{...publicProfile.privacy,link:true}}})).status,200);
  const visitor=await request('/api/user-profile?username='+handle,{user:null});
  assert.equal(visitor.status,200);assert.deepEqual(Object.keys(visitor.body.publicProfile).sort(),['username','displayName','bio','styles','avatarUrl'].sort());assert.equal(visitor.body.publicProfile.bio,'');assert.deepEqual(visitor.body.publicProfile.styles,profile.preferences);
  const own=await cloud('/rest/v1/profiles?select=id,musical_preferences',{token:ana.token});assert.equal(own.status,200);assert.equal(own.body.length,1);assert.equal(own.body[0].id,ana.id);
  const cross=await cloud('/rest/v1/profiles?id=eq.'+ana.id+'&select=id',{token:bia.token});assert.equal(cross.status,200);assert.deepEqual(cross.body,[]);
  assert.equal((await cloud('/rest/v1/profiles?select=id')).status,401);
  checks.push('unique normalized handle; explicit public-link consent; anonymous projection; actual owner-only RLS');
  const target={targetType:'video',targetKey:'youtube:'+crypto.randomBytes(9).toString('base64url').slice(0,11)};
  assert.equal((await request('/api/comments',{user:null,method:'POST',body:{action:'like-target',...target,liked:true}})).status,401);
  console.log('Remote profiles, Storage, privacy and RLS passed; checking social interactions.');
  for(let i=0;i<2;i++){const liked=await request('/api/comments',{method:'POST',body:{action:'like-target',...target,liked:true}});assert.equal(liked.status,200,JSON.stringify(liked));assert.deepEqual(liked.body.targetReaction,{likes:1,liked:true});}
  const post={...target,body:'Um achado para ouvir com atenção.',clientRequestId:crypto.randomUUID(),metadata:{displayName:'Forged name',avatarUrl:'https://invalid.test/photo'}};
  const created=await request('/api/comments',{method:'POST',body:post});assert.equal(created.status,200,JSON.stringify(created));assert.equal(created.body.ok,true,JSON.stringify(created));
  const id=created.body.comment.id;assert.equal(created.body.comment.author.displayName,'Ana Frequência');assert.ok(created.body.comment.author.avatarUrl);
  const retry=await request('/api/comments',{method:'POST',body:post});assert.equal(retry.body.comment.id,id);
  assert.equal((await request('/api/comments',{method:'POST',body:{...post,body:'Changed retry'}})).status,409);
  assert.equal((await request('/api/comments',{user:bia,method:'PATCH',body:{...target,id,body:'Outra pessoa'}})).status,404);
  assert.equal((await request('/api/comments',{method:'PATCH',body:{...target,id,body:'Comentário revisado.'}})).body.ok,true);
  assert.equal((await request('/api/comments',{user:bia,method:'POST',body:{action:'report',...target,id,reason:'spam'}})).body.ok,true);
  assert.equal((await request('/api/comments',{user:bia,method:'POST',body:{action:'block',userId:ana.id,blocked:true}})).body.ok,true);
  assert.equal((await request('/api/user-profile?username='+handle,{user:bia})).status,404);
  assert.equal((await request('/api/comments?'+new URLSearchParams(target),{user:bia})).body.comments.length,0);
  assert.equal((await request('/api/comments',{user:bia,method:'POST',body:{action:'block',userId:ana.id,blocked:false}})).body.ok,true);
  assert.equal((await request('/api/comments?'+new URLSearchParams({...target,id}),{method:'DELETE'})).body.ok,true);
  assert.equal((await request('/api/comments',{method:'POST',body:post})).status,409);
  checks.push('real comment creation/edit/delete/report/block, verified author, idempotent likes and retry, no resurrection');
  const refreshed=await cloud('/auth/v1/token?grant_type=refresh_token',{method:'POST',body:{refresh_token:ana.refresh}});assert.equal(refreshed.status,200);
  ana.token=refreshed.body.access_token;
  assert.equal((await request('/api/user-profile')).body.profile.username,handle);
  assert.equal((await request('/api/user-profile',{user:{token:'invalid'}})).status,401);
  checks.push('real token refresh; saved profile persists; invalid session rejected');
  const result={passed:true,projectRef:e.STAGING_PROJECT_REF,at:new Date().toISOString(),realServices:['Supabase Auth password and refresh','PostgREST','PostgreSQL RLS/RPC','Storage'],checks,notTested:['Google/Apple OAuth provider callback','iOS native','public deployment'],productionModified:false};
  await fs.writeFile(path.join(root,'reports/social-profiles-20261105/remote-results.json'),JSON.stringify(result,null,2)+'\n');console.log(JSON.stringify(result,null,2));
} catch(error) {
  const result={passed:false,projectRef:e.STAGING_PROJECT_REF,at:new Date().toISOString(),completedChecks:checks,error:error.message};
  await fs.writeFile(path.join(root,'reports/social-profiles-20261105/remote-results.json'),JSON.stringify(result,null,2)+'\n');console.error(result);process.exitCode=1;
} finally {await app.close();}
