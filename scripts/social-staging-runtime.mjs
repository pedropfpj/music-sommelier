// Isolated, opt-in staging harness. Never loads the application's production .env.
import fs from 'node:fs/promises';
import http from 'node:http';
import path from 'node:path';
import { parseEnv } from 'node:util';
import { createRequire } from 'node:module';
import { fileURLToPath } from 'node:url';
import { execFileSync } from 'node:child_process';
const require = createRequire(import.meta.url);
export const root = path.resolve(import.meta.dirname, '..');
export async function stagingConfig() {
  const file = path.join(root, '.env.social-staging.local');
  if ((await fs.stat(file)).mode & 0o077) throw Error('Staging secrets require mode 0600');
  const env = parseEnv(await fs.readFile(file, 'utf8'));
  if (env.STAGING_PROJECT_REF !== 'uauhiqrflfjhestbupjv' || env.STAGING_SUPABASE_URL !== 'https://uauhiqrflfjhestbupjv.supabase.co') throw Error('Refusing unknown staging destination');
  if (!env.STAGING_SUPABASE_ANON_KEY || !env.STAGING_SUPABASE_SERVICE_ROLE_KEY) throw Error('Staging API keys missing');
  return env;
}
export async function startStagingRuntime({ port = 0 } = {}) {
  const env = await stagingConfig();
  for (const key of Object.keys(process.env)) if (/^(SUPABASE_|SONIC_|KV_|UPSTASH_|RESEND_)/.test(key)) delete process.env[key];
  Object.assign(process.env, {
    NODE_ENV: 'production', SUPABASE_URL: env.STAGING_SUPABASE_URL,
    SUPABASE_AUTH_URL: env.STAGING_SUPABASE_URL, SUPABASE_ANON_KEY: env.STAGING_SUPABASE_ANON_KEY,
    SUPABASE_SERVICE_ROLE_KEY: env.STAGING_SUPABASE_SERVICE_ROLE_KEY,
    SONIC_SOCIAL_ENABLED: 'true', SONIC_PUBLIC_PROFILES_ENABLED: 'true',
    SONIC_TRACK_VIDEO_SOCIAL_V2_ENABLED: 'true', SONIC_SOCIAL_COMMENTS_ENABLED: 'true',
    SONIC_REQUIRE_DURABLE_RATE_LIMITS: 'true', SONIC_SOCIAL_COMMENTS_DAILY_LIMIT: '1000',
    SONIC_PROFILE_EDIT_DAILY_LIMIT: '1000', SONIC_COMMUNITY_EMAIL_ENABLED: 'false'
  });
  const routes = {'/api/user-profile':'lib/api/_user-profile.js','/api/comments':'lib/api/_comments.js','/api/social-config':'api/social-config.js','/api/access-context':'lib/api/_access-context.js'};
  const trackedAssets=new Set(execFileSync('git',['ls-files','-z'],{cwd:root,encoding:'utf8'}).split('\0'));
  let origin;
  const server = http.createServer(async (req,res) => {
    const json = (status, body) => { res.writeHead(status, {'Content-Type':'application/json','Cache-Control':'no-store'}); res.end(JSON.stringify(body)); };
    try {
      const url = new URL(req.url, 'http://127.0.0.1'); const parts=[];
      for await (const part of req) {parts.push(part); if (parts.reduce((n,p)=>n+p.length,0)>800000) return json(413,{});}
      const raw=Buffer.concat(parts).toString();
      req.body=req.headers['content-type']?.includes('application/x-www-form-urlencoded')?Object.fromEntries(new URLSearchParams(raw)):JSON.parse(raw || '{}'); req.query=Object.fromEntries(url.searchParams);
      res.status=code=>{res.statusCode=code;return res;};res.json=body=>json(res.statusCode || 200,body);
      if(routes[url.pathname]) return await require(path.join(root,routes[url.pathname]))(req,res);
      if (url.pathname==='/__staging' && req.method==='GET') {
        res.writeHead(200,{'Content-Type':'text/html; charset=utf-8','Cache-Control':'no-store'});
        return res.end('<!doctype html><html lang="pt"><title>Sonic — teste remoto isolado</title><body style="background:#081328;color:#edf7ff;font:20px system-ui;max-width:760px;margin:4rem auto;padding:1rem"><h1>Teste remoto dos perfis</h1><p>Contas fictícias. Autenticação, banco e fotos no Supabase de staging. Nenhum dado de produção.</p><p>Este acesso usa senha de teste. Google e Apple não estão configurados neste projeto.</p><form method="post" action="/__staging_login"><button name="account" value="ana">Entrar como Ana</button> <button name="account" value="bia">Entrar como Bia</button></form><p><a style="color:#80ffdc" href="/?lang=pt">Continuar como visitante</a></p></body></html>');
      }
      if (url.pathname==='/__staging_login' && req.method==='POST') {
        if(req.headers.origin!==origin || !['ana','bia'].includes(req.body.account))return json(403,{});
        const users=JSON.parse(await fs.readFile(path.join(root,'.vendor/social-staging-tools/test-identities.json'),'utf8'));
        const user=users[req.body.account];
        const auth=await fetch(env.STAGING_SUPABASE_URL+'/auth/v1/token?grant_type=password',{method:'POST',signal:AbortSignal.timeout(15000),headers:{apikey:env.STAGING_SUPABASE_ANON_KEY,'Content-Type':'application/json'},body:JSON.stringify({email:user.email,password:user.password})});
        if(!auth.ok)return json(503,{error:'staging_login_unavailable'});
        const session=await auth.json();const hash=new URLSearchParams({access_token:session.access_token,refresh_token:session.refresh_token,expires_in:String(session.expires_in),token_type:'bearer'});
        res.writeHead(303,{Location:origin+'/?lang=pt&tab=profile#'+hash,'Cache-Control':'no-store'});return res.end();
      }
      if(url.pathname.startsWith('/api/')) return json(200,{ok:true,enabled:false,items:[],tracks:[],providers:[]});
      const relative=url.pathname==='/'?'index.html':decodeURIComponent(url.pathname).slice(1),file=path.resolve(root,relative),ext=path.extname(file);
      // Only public web assets; secrets and test reports cannot be served.
      if(!trackedAssets.has(relative)||!file.startsWith(root+path.sep)||/(^|\/)(\.|reports|scripts|lib|supabase)/.test(relative)||!['.html','.js','.css','.json','.svg','.png','.jpg','.webp','.ico','.woff2'].includes(ext))return json(404,{});
      const content=await fs.readFile(file);const mime={'.html':'text/html; charset=utf-8','.js':'text/javascript','.css':'text/css','.json':'application/json','.svg':'image/svg+xml','.png':'image/png','.jpg':'image/jpeg','.webp':'image/webp'};
      res.writeHead(200,{'Content-Type':mime[ext]||'application/octet-stream','Cache-Control':'no-store'});return res.end(content);
    } catch (_) {if(!res.headersSent)json(500,{error:'staging_request_failed'});else res.end();}
  });
  await new Promise(resolve=>server.listen(port,'127.0.0.1',resolve));
  origin=`http://127.0.0.1:${server.address().port}`;
  return {env,origin,close:()=>new Promise(resolve=>server.close(resolve))};
}
if(process.argv[1]===fileURLToPath(import.meta.url)){
  const app=await startStagingRuntime({port:8802});console.log('Isolated real Supabase preview: '+app.origin+'/__staging');
  for(const signal of ['SIGINT','SIGTERM'])process.on(signal,async()=>{await app.close();process.exit(0);});
}
