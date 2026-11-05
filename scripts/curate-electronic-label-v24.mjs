import fs from 'node:fs/promises';
const selection=JSON.parse(await fs.readFile('data/electronic-label-selection-v24.json','utf8'));
const decode=s=>s.replaceAll('&quot;','"').replaceAll('&#039;',"'").replaceAll('&#39;',"'").replaceAll('&amp;','&');
const clean=s=>decode(String(s||'')).replace(/[\u200b-\u200f\u2060\ufeff]/g,'').replace(/\s+/g,' ').trim();
const rows=[],report={checkedAt:new Date().toISOString(),passed:[],failed:[]};
for(const entry of selection.tracks){try{
 const url=new URL(entry.url);if(url.origin!=='https://www.revealedrecordings.com'||!url.pathname.startsWith('/releases/'))throw Error('Unreviewed publisher');
 const response=await fetch(url,{signal:AbortSignal.timeout(20000)});if(!response.ok)throw Error('Release HTTP '+response.status);
 const html=await response.text();
 const tracks=[...html.matchAll(/data-track-info="([^"]+)"/g)].map(m=>JSON.parse(decode(m[1])));
 const actual=tracks.find(t=>t.url===url.pathname);if(!actual)throw Error('Exact release preview unavailable');
 const title=clean(html.match(/<h1>([\s\S]*?)<\/h1>/)?.[1]?.replace(/<[^>]*>/g,''));
 if(title!==clean(actual.title))throw Error('Displayed release and preview identity differ');
 const audio=new URL(actual.track);if(audio.protocol!=='https:'||audio.hostname!=='p.scdn.co'||!audio.pathname.startsWith('/mp3-preview/'))throw Error('No public direct audio preview');
 const probe=await fetch(audio,{headers:{Range:'bytes=0-1023'},signal:AbortSignal.timeout(15000)});const type=probe.headers.get('content-type')||'';await probe.body?.cancel();
 if(!probe.ok||!type.startsWith('audio/'))throw Error('Preview HTTP '+probe.status);
 const date=html.match(/<time>([^<]+)<\/time>/)?.[1]||'';const parsed=Date.parse(date);if(Number.isFinite(parsed)&&parsed>Date.now())throw Error('Future release');
 const artist=clean(actual.artist);if(!artist||/^revealed/i.test(artist))throw Error('No individual artist credit');
 const row={universe:'electronic',style:entry.style,artist,song:title,label:'Revealed Recordings',preview_url:audio.href,release_date:Number.isFinite(parsed)?new Date(parsed).toISOString().slice(0,10):'',cover_art_url:new URL(actual.image_url,url.origin).href,artist_genre:entry.style.replaceAll('_',' '),genre_evidence_url:url.href,source_url:url.href,source_tags:'electronic_label_v24;publisher_genre_verified;recording_identity_verified;audio_http_checked',source:'electronic_label_v24_20261105',confidence:'high',status:'published'};
 rows.push(row);report.passed.push({...row,classification:entry.classification,audioStatus:probe.status,audioMediaType:type});console.log('OK',row.style,artist,title);
}catch(e){report.failed.push({...entry,error:e.message});console.log('FAIL',entry.url,e.message);}}
await fs.writeFile('reports/public-release-20261105/label-v24-validation.json',JSON.stringify(report,null,2)+'\n');
const keys=Object.keys(rows[0]||{}),quote=s=>'"'+String(s??'').replaceAll('"','""')+'"';
await fs.writeFile('data/electronic_label_v24_20261105.csv',[keys,...rows.map(r=>keys.map(k=>r[k]))].map(r=>r.map(quote).join(',')).join('\n')+'\n');
if(report.failed.length)process.exitCode=1;
