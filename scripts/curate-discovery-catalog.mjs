// Run only for a deliberately reviewed selection. Never infer subgenre from an artist's entire catalog.
import {readFile,writeFile,mkdir} from 'node:fs/promises';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const selection=JSON.parse(await readFile(path.join(root,'data/discovery-expansion-selection-v22.json'),'utf8'));
const normalize=value=>String(value||'').normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase().replace(/[^a-z0-9]+/g,'');
const report={checkedAt:new Date().toISOString(),passed:[],failed:[]};
const electronic=[],rock=[];
const quote=value=>'"'+String(value??'').replaceAll('"','""')+'"';
function allowedPage(value){const u=new URL(value);if(u.protocol!=='https:'||u.hostname!=='music.apple.com'||u.username||u.password)throw Error('Unexpected source');return u;}
async function fetchRecording(entry){
 const page=allowedPage(entry.url);
 const response=await fetch(page,{signal:AbortSignal.timeout(20000)});
 if(!response.ok)throw Error('Metadata HTTP '+response.status);
 allowedPage(response.url);
 const html=await response.text();let recording;
 for(const match of html.matchAll(/<script\b([^>]*)>([\s\S]*?)<\/script>/g)){
  if(!/type=["']application\/ld\+json["']/.test(match[1]))continue;
  const data=JSON.parse(match[2]);const item=data['@type']==='MusicRecording'?data:data.audio;
  if(item?.['@type']==='MusicRecording'&&normalize(item.name)===normalize(entry.song))recording=item;
 }
 if(!recording)throw Error('Exact recording not found');
 const artists=recording.byArtist||[];
 if(!artists.some(a=>normalize(a.name)===normalize(entry.artist)))throw Error('Artist mismatch');
 const previewUrl=recording.audio?.contentUrl||'';const audioUrl=new URL(previewUrl);
 if(audioUrl.protocol!=='https:'||!audioUrl.hostname.endsWith('.itunes.apple.com')||!audioUrl.pathname.includes('/AudioPreview'))throw Error('No Apple preview');
 const probe=await fetch(audioUrl,{headers:{Range:'bytes=0-1023'},signal:AbortSignal.timeout(15000)});
 const mediaType=probe.headers.get('content-type')||'';
 if(!probe.ok||!/(audio|video\/mp4|application\/octet-stream)/i.test(mediaType)){await probe.body?.cancel();throw Error('Audio HTTP '+probe.status+' '+mediaType);}
 await probe.body?.cancel();
 const duration=String(recording.duration||'').match(/PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?/);
 return {id:new URL(recording.url).pathname.split('/').pop(),artist:artists.map(a=>a.name).join(' & '),song:recording.name,releaseTitle:recording.inAlbum?.name||'',previewUrl,providerUrl:recording.url,coverUrl:recording.inAlbum?.image||recording.image||'',releaseDate:recording.datePublished||'',durationSec:duration?Number(duration[1]||0)*3600+Number(duration[2]||0)*60+Number(duration[3]||0):0,mediaType,providerGenre:recording.genre||[]};
}
for(const entry of selection.tracks){
 try{
  const t=await fetchRecording(entry);
  const evidence={sourceUrl:entry.url,checkedAt:report.checkedAt,identityMatch:true,audioHttpChecked:true,classification:'editorial',classificationNote:entry.reason};
  if(entry.universe==='rock')rock.push({key:'apple:'+t.id,artistKey:normalize(entry.artist),artist:t.artist,song:t.song,genre:entry.style,previewUrl:t.previewUrl,providerUrl:t.providerUrl,coverUrl:t.coverUrl,releaseTitle:t.releaseTitle,explicit:Boolean(entry.explicit),discoveryTier:entry.discoveryTier,listeningNote:entry.listeningNote,evidence});
  else electronic.push({style:entry.style,artist:t.artist,song:t.song,label:t.releaseTitle,preview_url:t.previewUrl,release_date:t.releaseDate,duration_sec:t.durationSec,artist_genre:entry.style,artist_profile_hint:entry.reason,source:'curated_diversity_v22_20261030',genre_evidence_url:entry.genreSource||entry.url,source_url:t.providerUrl,cover_art_url:t.coverUrl,source_tags:'curated_diversity_v22;apple_identity_verified;audio_http_checked;editorial_subgenre',confidence:'high',status:'published',source_note:'Artist and recording matched on the official Apple Music page; preview responded as audio. Subgenre is an editorial classification. Checked '+report.checkedAt});
  report.passed.push({artist:t.artist,song:t.song,style:entry.style,universe:entry.universe,sourceUrl:entry.url,previewUrl:t.previewUrl,mediaType:t.mediaType});
  console.log('OK',entry.style,t.artist,t.song);
 }catch(e){report.failed.push({...entry,error:e.message});console.log('SKIP',entry.artist,entry.song,e.message);}
 await new Promise(resolve=>setTimeout(resolve,180));
}
if(!electronic.length||!rock.length)throw Error('Both reviewed catalogs must have playable entries');
await mkdir(path.join(root,'reports/ux-refresh'),{recursive:true});
const keys=Object.keys(electronic[0]);
await writeFile(path.join(root,'data/curated_diversity_v22_20261030.csv'),[keys.map(quote).join(','),...electronic.map(t=>keys.map(k=>quote(t[k])).join(','))].join('\n')+'\n');
await writeFile(path.join(root,'data/rock-preview-v1.json'),JSON.stringify({schemaVersion:1,version:'20261030rock2',status:'preview',checkedAt:report.checkedAt,source:'Apple Music public recording metadata and promotional previews; no audio hosted by Sonic Search',tracks:rock},null,2)+'\n');
await writeFile(path.join(root,'reports/ux-refresh/catalog-expansion-validation.json'),JSON.stringify(report,null,2)+'\n');
console.log(JSON.stringify({electronic:electronic.length,rock:rock.length,failed:report.failed.length}));
