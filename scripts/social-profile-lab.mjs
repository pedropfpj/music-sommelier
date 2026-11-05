// Local integration fixture: real handlers + PostgreSQL migrations and durable data.
// Auth/Storage protocol adapters are simulated. Never loads .env or contacts Supabase.
import http from 'node:http';
import fs from 'node:fs/promises';
import path from 'node:path';
import os from 'node:os';
import crypto from 'node:crypto';
import { createRequire } from 'node:module';
import { fileURLToPath } from 'node:url';
import { PGlite } from '@electric-sql/pglite';
const require = createRequire(import.meta.url);
const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
export const users = {
  ana: { id: '11111111-1111-4111-8111-111111111111', email: 'ana@example.test', user_metadata: { display_name: 'Ana', username: 'ana_lab' } },
  bia: { id: '22222222-2222-4222-8222-222222222222', email: 'bia@example.test', user_metadata: { display_name: 'Bia', username: 'bia_lab' } }
};
export async function createSocialLab({ port = 8801, dataDir = path.join(os.tmpdir(), 'sonic-social-profile-lab') } = {}) {
  await fs.mkdir(dataDir, { recursive: true });
  const db = new PGlite(path.join(dataDir, 'postgres'));
  if (!(await db.query("select to_regclass('public.profiles') as table_name")).rows[0].table_name) {
    await db.exec(`create role anon; create role authenticated; create role service_role bypassrls;
      create schema auth; create schema storage; create table auth.users(id uuid primary key);
      create function auth.uid() returns uuid language sql stable as $$ select nullif(current_setting('request.jwt.claim.sub',true),'')::uuid $$;
      create table storage.buckets(id text primary key,name text,public boolean,file_size_limit bigint,allowed_mime_types text[]);
      create table storage.objects(id uuid default gen_random_uuid(),bucket_id text,name text);
      alter table storage.objects enable row level security;
      grant usage on schema public,auth,storage to anon,authenticated,service_role;
      insert into auth.users values ('${users.ana.id}'),('${users.bia.id}');`);
    const core = (await fs.readFile(path.join(root,'supabase/migrations/20260619010700_sonic_search_core.sql'),'utf8')).replace('create extension if not exists pgcrypto;','');
    await db.exec(core);
    await db.exec('grant all on all tables in schema public to service_role;');
    for (const name of ['20260914160000_community_profile_privacy.sql','20260914170000_profile_edit_budget.sql','20261104000100_track_video_social.sql','20261105000200_explicit_musical_preferences.sql','20261105000300_comment_request_idempotency.sql','20261105000400_public_profile_links.sql','20261105000500_social_request_budget.sql']) {
      await db.exec(await fs.readFile(path.join(root,'supabase/migrations',name),'utf8'));
    }
    await db.exec('create table lab_objects(path text primary key, bytes bytea, content_type text);');
  }
  await db.exec(await fs.readFile(path.join(root,'supabase/migrations/20261105000400_public_profile_links.sql'),'utf8'));
  await db.exec('grant select,insert,update,delete on taste_snapshots,track_feedback,feedback_events,spirit_profiles,spirit_cards to authenticated;');
  const previousEnv = { ...process.env }, originalFetch = global.fetch;
  // Prevent inherited production settings from participating in the test process.
  for (const key of Object.keys(process.env)) if (/^(SUPABASE_|SONIC_|KV_|UPSTASH_|RESEND_)/.test(key)) delete process.env[key];
  const signatures = new Map(); const failures = { profileWrites: 0 }; const requests = [];
  let origin;
  const ident = value => { if (!/^[a-z_][a-z0-9_]*$/.test(value)) throw new Error('Invalid test SQL identifier'); return `"${value}"`; };
  const userFrom = req => users[String(req.headers.authorization || '').replace('Bearer lab-', '')] || null;
  const json = (res, code, body) => { res.writeHead(code, { 'Content-Type':'application/json', 'Cache-Control':'no-store' }); res.end(JSON.stringify(body)); };
  const session = name => ({ access_token: `lab-${name}`, refresh_token: `lab-refresh-${name}`, token_type:'bearer', expires_in:3600, expires_at:Math.floor(Date.now()/1000)+3600, user:users[name] });
  async function rest(req,res,url,body) {
    const service = req.headers.authorization === 'Bearer lab-service'; const user = userFrom(req);
    const resource = url.pathname.slice('/rest/v1/'.length);
    try {
      const rows = await db.transaction(async tx => {
        await tx.exec(`set local role ${service ? 'service_role' : user ? 'authenticated' : 'anon'}`);
        await tx.query("select set_config('request.jwt.claim.sub',$1,true)",[user?.id || '']);
        if (resource.startsWith('rpc/')) {
          const fn=ident(resource.slice(4)), args=Object.keys(body); const placeholders=args.map((a,i)=>`${ident(a)} => $${i+1}`).join(',');
          const result=await tx.query(`select ${fn}(${placeholders}) as result`,args.map(a=>body[a]));
          return result.rows.length === 1 ? result.rows[0].result : result.rows.map(r=>r.result);
        }
        const table=ident(resource), values=[], clauses=[];
        for (const [key,value] of url.searchParams) {
          if (['select','order','limit','on_conflict','offset'].includes(key)) continue;
          const column=ident(key);
          if (value.startsWith('eq.')) { values.push(value.slice(3)); clauses.push(`${column}=$${values.length}`); }
          else if (value.startsWith('in.(')) { const items=value.slice(4,-1).split(',').map(s=>s.replace(/^"|"$/g,'')); clauses.push(`${column} in (${items.map(item=>{values.push(item);return '$'+values.length;}).join(',')})`); }
          else throw new Error('Unsupported local query filter');
        }
        const where=clauses.length ? ' where '+clauses.join(' and ') : '';
        if (req.method === 'GET') {
          const columns=(url.searchParams.get('select') || '*').split(',').map(v=>v==='*'?'*':ident(v)).join(',');
          const order=url.searchParams.get('order')?.split('.') || [];
          const sort=order.length ? ` order by ${ident(order[0])} ${order[1]==='desc'?'desc':'asc'}` : '';
          return (await tx.query(`select ${columns} from ${table}${where}${sort} limit ${Math.min(500,Math.max(0,Number(url.searchParams.get('limit') || 500)))}`,values)).rows;
        }
        if (req.method === 'DELETE') return (await tx.query(`delete from ${table}${where} returning *`,values)).rows;
        if (req.method === 'PATCH') {
          const cols=Object.keys(body); const assignments=cols.map(k=>{values.push(body[k]);return `${ident(k)}=$${values.length}`;});
          return (await tx.query(`update ${table} set ${assignments.join(',')}${where} returning *`,values)).rows;
        }
        const result=[];
        for (const row of Array.isArray(body)?body:[body]) {
          const cols=Object.keys(row), conflict=url.searchParams.get('on_conflict');
          const ignore=String(req.headers.prefer).includes('ignore-duplicates');
          const resolution=conflict ? ` on conflict (${conflict.split(',').map(ident).join(',')}) do ${ignore ? 'nothing' : 'update set '+cols.map(c=>`${ident(c)}=excluded.${ident(c)}`).join(',')}` : '';
          result.push(...(await tx.query(`insert into ${table}(${cols.map(ident)}) values(${cols.map((_,i)=>'$'+(i+1))})${resolution} returning *`,cols.map(k=>row[k]))).rows);
        }
        return result;
      });
      json(res,200,rows);
    } catch(error) { json(res,error.code==='23505'?409:400,{ code:error.code || 'LAB_QUERY', message:error.message }); }
  }
  const server=http.createServer(async (req,res)=>{
    const url=new URL(req.url,origin || 'http://127.0.0.1'); const parts=[]; for await(const part of req) parts.push(part); const bytes=Buffer.concat(parts);
    let body={}; try { body=JSON.parse(bytes.toString() || '{}'); } catch (_) {}
    const route=url.pathname;
    try {
      if (route.startsWith('/api/') || route.startsWith('/rest/') || route.startsWith('/auth/')) requests.push({ method:req.method,path:route });
      if (route==='/auth/v1/user') return json(res,userFrom(req)?200:401,userFrom(req) || {message:'Invalid local session'});
      if (route==='/auth/v1/logout') return json(res,200,{});
      if (route==='/auth/v1/token') {
        const name=String(body.auth_code || body.refresh_token || '').replace(/^lab-code-|^lab-refresh-/,'');
        return json(res,users[name]?200:401,users[name]?session(name):{message:'Invalid local session'});
      }
      if (route==='/auth/v1/settings') return json(res,200,{external:{google:true,apple:true}});
      if (route==='/auth/v1/authorize' || route==='/__lab') {
        const redirect=url.searchParams.get('redirect_to') || origin+'/?lang=pt&tab=profile';
        const safe=new URL(redirect); if(safe.origin!==origin) return json(res,400,{error:'Local redirects only'});
        const links=Object.keys(users).map(name=>`<p><a href="/__login?account=${name}&return=${encodeURIComponent(safe.href)}">Entrar como ${users[name].user_metadata.display_name}</a></p>`).join('');
        res.writeHead(200,{'Content-Type':'text/html; charset=utf-8'});return res.end(`<html lang="pt"><title>Contas de teste — Sonic</title><body style="background:#081328;color:#edf7ff;font:20px system-ui;padding:3rem"><h1>Ambiente local de teste</h1><p>Autenticação simulada. APIs reais e PostgreSQL local persistente. Nenhum dado de produção.</p>${links}<a href="/?lang=pt" style="color:#80ffdc">Continuar como visitante</a></body></html>`);
      }
      if (route==='/__login') {
        const name=url.searchParams.get('account'); if(!users[name]) return json(res,400,{});
        const dest=new URL(url.searchParams.get('return') || origin+'/?lang=pt&tab=profile'); if(dest.origin!==origin)return json(res,400,{});
        // Implicit callback is supported by the existing app. Only this fixture issues these tokens.
        dest.hash=new URLSearchParams({access_token:`lab-${name}`,refresh_token:`lab-refresh-${name}`,expires_in:'3600',token_type:'bearer'}).toString();
        res.writeHead(302,{Location:dest.href}); return res.end();
      }
      if (route.startsWith('/rest/v1/')) return await rest(req,res,url,body);
      if (route.startsWith('/storage/v1/')) {
        const service=req.headers.authorization==='Bearer lab-service';
        const sub=route.slice('/storage/v1/'.length);
        if(sub.startsWith('object/sign/')) {
          const objectPath=sub.slice('object/sign/'.length);
          if(req.method==='POST' && service){const token=crypto.randomUUID();signatures.set(token,{path:objectPath,expires:Date.now()+60000});return json(res,200,{signedURL:`/object/sign/${objectPath}?token=${token}`});}
          const cap=signatures.get(url.searchParams.get('token')); if(!cap || cap.path!==objectPath || cap.expires<Date.now()) return json(res,403,{});
          const row=(await db.query('select * from lab_objects where path=$1',[objectPath])).rows[0];if(!row)return json(res,404,{});
          res.writeHead(200,{'Content-Type':row.content_type,'Cache-Control':'private,no-store'});return res.end(Buffer.from(row.bytes));
        }
        if(!service)return json(res,403,{});
        if(sub.startsWith('bucket')) return json(res,200,{});
        const objectPath=sub.slice('object/'.length);
        if(req.method==='GET'){const row=(await db.query('select * from lab_objects where path=$1',[objectPath])).rows[0];if(!row)return json(res,404,{});res.writeHead(200,{'Content-Type':row.content_type});return res.end(Buffer.from(row.bytes));}
        if(req.method==='DELETE'){for(const prefix of body.prefixes || [])await db.query('delete from lab_objects where path=$1',[objectPath+'/'+prefix]);return json(res,200,{});}
        await db.query('insert into lab_objects(path,bytes,content_type) values($1,$2,$3) on conflict(path) do update set bytes=excluded.bytes,content_type=excluded.content_type',[objectPath,bytes,req.headers['content-type'] || 'application/json']); return json(res,200,{Key:objectPath});
      }
      if(route.startsWith('/api/')) {
        req.query=Object.fromEntries(url.searchParams); req.body=body;
        const routes={'/api/user-profile':'lib/api/_user-profile.js','/api/comments':'lib/api/_comments.js','/api/social-config':'api/social-config.js'};
        if(route==='/api/user-profile' && req.method==='POST' && failures.profileWrites>0){failures.profileWrites--;return json(res,503,{ok:false,error:'profile_storage_unavailable'});}
        if(route==='/api/access-context') return json(res,200,{ok:true,viewer:{authenticated:!!userFrom(req),role:'free',canModerate:false,owner:false,admin:false}});
        if(route==='/api/social-oauth-url') return json(res,200,{ok:true,url:origin+'/auth/v1/authorize?redirect_to='+encodeURIComponent(req.query.redirect_to || origin+'/')});
        if(routes[route]){res.status=code=>{res.statusCode=code;return res;};res.json=data=>json(res,res.statusCode || 200,data);return await require(path.join(root,routes[route]))(req,res);}
        // Unrelated providers/admin/analytics are deliberately offline in this lab.
        return json(res,200,{ok:true,enabled:false,items:[],tracks:[],providers:[]});
      }
      const relative=route==='/'?'index.html':decodeURIComponent(route).replace(/^\//,'');
      const file=path.resolve(root,relative), ext=path.extname(file);
      if(!file.startsWith(root+path.sep) || /(^|\/)\./.test(relative) || !['.html','.js','.css','.json','.svg','.png','.jpg','.webp','.ico','.woff2'].includes(ext))return json(res,404,{});
      const content=await fs.readFile(file);const mime={'.html':'text/html; charset=utf-8','.js':'text/javascript','.css':'text/css','.json':'application/json','.svg':'image/svg+xml','.png':'image/png','.jpg':'image/jpeg','.webp':'image/webp'};
      res.writeHead(200,{'Content-Type':mime[ext] || 'application/octet-stream','Cache-Control':'no-store'});return res.end(content);
    }catch(error){if(!res.headersSent)json(res,500,{error:'local_lab_error',message:error.message});else res.end();}
  });
  await new Promise(resolve=>server.listen(port,'127.0.0.1',resolve)); origin=`http://127.0.0.1:${server.address().port}`;
  Object.assign(process.env,{ NODE_ENV:'test',SUPABASE_URL:origin,SUPABASE_AUTH_URL:origin+'/auth/v1',SUPABASE_ANON_KEY:'lab-anon',SUPABASE_SERVICE_ROLE_KEY:'lab-service',SONIC_SOCIAL_ENABLED:'true',SONIC_PUBLIC_PROFILES_ENABLED:'true',SONIC_TRACK_VIDEO_SOCIAL_V2_ENABLED:'true',SONIC_SOCIAL_COMMENTS_ENABLED:'true',SONIC_REQUIRE_DURABLE_RATE_LIMITS:'false',SONIC_SOCIAL_COMMENTS_DAILY_LIMIT:'10000',SONIC_PROFILE_EDIT_DAILY_LIMIT:'10000',SONIC_COMMUNITY_EMAIL_ENABLED:'false',SONIC_SOCIAL_VALIDATE_PROVIDERS:'false' });
  global.fetch=(url,options)=>{if(new URL(url).origin!==origin)throw new Error('External network disabled in local social lab');return originalFetch(url,options);};
  return { origin,db,requests,failures,session,async close(){await new Promise(resolve=>server.close(resolve));await db.close();global.fetch=originalFetch;for(const key of Object.keys(process.env))if(!(key in previousEnv))delete process.env[key];Object.assign(process.env,previousEnv);} };
}
if(process.argv[1]===fileURLToPath(import.meta.url)){
  const lab=await createSocialLab({port:Number(process.env.SOCIAL_LAB_PORT || 8801)});
  console.log(`Local social lab: ${lab.origin}/__lab — Auth/Storage simulated; APIs and PostgreSQL real; no remote writes.`);
  for(const signal of ['SIGINT','SIGTERM'])process.on(signal,async()=>{await lab.close();process.exit(0);});
}
