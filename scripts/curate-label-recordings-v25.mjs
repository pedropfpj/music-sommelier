// Exact recording checks from publisher release pages. No signed audio URL is shipped.
import fs from 'node:fs/promises';
const selection = [
  {style:'forest_psy',artist:'Karavel',song:'Artwing',albumArtist:'Karavel (Parvati Records)',album:'Inspiration',label:'Parvati Records',bpm:150,genreUrl:'https://parvati-records.com/karavel-inspiration-ep/',genreText:'pure and deep Forest style',url:'https://beatspace-parvati.bandcamp.com/album/inspiration'},
  {style:'dark_progressive',artist:'Hybrid',song:'Bottom Floor',albumArtist:'Hybrid',album:'Abstractions',label:'Zenon Records',genreUrl:'https://www.zenonrecords.com/release/hybrid-abstractions',genreText:'signature dark progressive sound',url:'https://zenonrecords.bandcamp.com/album/abstractions'}
];
const decode=s=>String(s||'').replaceAll('&quot;','"').replaceAll('&#39;',"'").replaceAll('&#039;',"'").replaceAll('&amp;','&');
const report={checkedAt:new Date().toISOString(),method:'Publisher names this release subgenre; its linked recording supplies exact title, artist and player ID. Audio checked by HTTP range response, not human audition.',passed:[],failed:[]};
const rows=[];
for(const entry of selection){try{
  const source=await fetch(entry.genreUrl,{signal:AbortSignal.timeout(20000)});
  if(!source.ok)throw Error('Publisher HTTP '+source.status);
  const page=decode(await source.text());
  if(!page.includes(entry.genreText)||!page.includes(entry.album)||!page.includes(entry.url))throw Error('Release classification or official recording link changed');
  const response=await fetch(entry.url,{signal:AbortSignal.timeout(20000)});
  if(!response.ok)throw Error('Recording HTTP '+response.status);
  const html=await response.text();
  const raw=html.match(/data-tralbum="([^"]+)"/)?.[1];
  if(!raw)throw Error('No public recording metadata');
  const data=JSON.parse(decode(raw));
  if(data.artist!==entry.albumArtist||data.current?.title!==entry.album)throw Error('Release identity changed');
  if(data.is_private_stream||data.tralbum_subscriber_only||data.is_preorder)throw Error('Not a public published release');
  const track=data.trackinfo.find(t=>t.title===entry.song);
  if(!track||track.streaming!==1||track.private||track.is_draft||track.unreleased_track||!track.file?.['mp3-128'])throw Error('Exact public recording missing');
  if(track.artist&&track.artist!==entry.artist)throw Error('Recording artist differs');
  const recording=new URL(track.title_link,entry.url);
  if(recording.origin!==new URL(entry.url).origin||!recording.pathname.startsWith('/track/'))throw Error('Unexpected player source');
  const media=new URL(track.file['mp3-128']);
  if(media.protocol!=='https:'||!media.hostname.endsWith('.bcbits.com'))throw Error('Unexpected preview provider');
  const audio=await fetch(media,{headers:{Range:'bytes=0-1023'},signal:AbortSignal.timeout(15000)});
  const mediaType=audio.headers.get('content-type');await audio.body?.cancel();
  if(!audio.ok||!mediaType?.startsWith('audio/'))throw Error('Audio unavailable');
  const row={style:entry.style,artist:entry.artist,song:entry.song,label:entry.label,bpm:entry.bpm||'',bandcamp_track_id:String(track.id),bandcamp_track_url:recording.href,bandcamp_url:entry.url,duration_sec:Math.round(track.duration),release_date:data.album_release_date?new Date(data.album_release_date).toISOString().slice(0,10):'',artist_genre:entry.style.replaceAll('_',' '),genre_evidence_url:entry.genreUrl,source_url:entry.url,source_tags:'electronic_label_recordings_v25;publisher_genre_verified;recording_identity_verified;audio_http_checked',source:'electronic_label_recordings_v25_20261105',confidence:'high',status:'published'};
  rows.push(row);report.passed.push({...row,audioStatus:audio.status,audioType:mediaType,genreEvidence:entry.genreText});
  console.log('OK',entry.style,entry.artist,entry.song);
}catch(error){report.failed.push({artist:entry.artist,url:entry.url,error:error.message});console.log('FAIL',entry.artist,error.message);}
await new Promise(resolve=>setTimeout(resolve,3000));}
await fs.mkdir('reports/catalog-next-sources-20261105',{recursive:true});
await fs.writeFile('reports/catalog-next-sources-20261105/label-v25-validation.json',JSON.stringify(report,null,2)+'\n');
if(report.failed.length)throw Error('Review failed records before updating catalog');
const keys=Object.keys(rows[0]),quote=s=>'"'+String(s??'').replaceAll('"','""')+'"';
await fs.writeFile('data/electronic_label_recordings_v25_20261105.csv',[keys,...rows.map(row=>keys.map(k=>row[k]))].map(row=>row.map(quote).join(',')).join('\n')+'\n');
