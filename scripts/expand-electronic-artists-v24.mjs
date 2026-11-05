// Reproducible primary-source catalog collection, with resumable evidence.
// Published artist/label tags support classification; no invented tempo/biography.
// Expiring audio URLs are probed but never shipped: the app uses the official player.
import fs from 'node:fs/promises';
import path from 'node:path';
import {createAppRuntimeTestContext} from './app-runtime-test-harness.mjs';
import {publisherEvidenceIssue} from './catalog-publisher-evidence.mjs';
const reportDir='reports/public-release-20261105';
const cacheDir='.vendor/catalog-v24';
await fs.mkdir(cacheDir,{recursive:true}); await fs.mkdir(reportDir,{recursive:true});
const before=JSON.parse(await fs.readFile(reportDir+'/catalog-before-raw.json','utf8'));
const manifest=JSON.parse(await fs.readFile('data/runtime-catalog-v1/manifest.json','utf8'));
const currentAudio=await fs.readFile(reportDir+'/catalog-before-audio.json','utf8').then(JSON.parse).catch(()=>({styles:{}}));
const normalize=s=>String(s||'').normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase().replace(/&amp;/g,' and ').replace(/[^a-z0-9]+/g,' ').trim();
const identity=s=>normalize(String(s||'').split(/\s+(?:feat\.?|ft\.?|featuring|vs\.?|x|presents|with)\s+|\s+&\s+|,\s*/i)[0]);
const aliases={
  wave:['wave','wave-music','wavemusic'],trance_uplifting:['uplifting-trance'],drum_and_bass:['drum-and-bass','drum-n-bass'],
  brazilian_funk:['brazilian-funk','baile-funk'],riddim:['riddim-dubstep'],
  // Festival progressive uses the separately reviewed label selection, because
  // generic self-applied "progressive EDM" tags proved musically ambiguous.
  halftime_bass:['halftime'],progressive_edm:[],big_room_house:[],
  minimal_deep_tech:['minimal-deep-tech','deep-tech'],ballroom_vogue_beats:['ballroom','vogue'],
  berlin_school:['berlin-school'],footwork_juke:['footwork','juke'],hi_nrg:['hi-nrg'],
  kuduro_eletronico:['kuduro'],liquid_dnb:['liquid-drum-and-bass','liquid-dnb'],
  full_on_morning:['morning-full-on','full-on-morning'],full_on_night:['night-full-on','full-on-night'],
  progressive_psy:['progressive-psytrance','progpsy'],forest_psy:['forest-psytrance','forest-psy'],
  dark_psy:['darkpsy','dark-psytrance'],hi_tech:['hitech','hi-tech'],
  twilight_psy:['twilight-psytrance','twilight-psy'],psy_comercial:['brazilian-psytrance'],
  psybreaks:['psybreaks','psychedelic-breaks'],uk_hardcore:['uk-hardcore'],
  hardgroove_techno:['hardgroove'],peak_time_techno:['peak-time-techno'],
  broken_techno:['broken-techno','broken-beat-techno'],bleep_techno:['bleep-techno','bleep'],
  kosmische_musik:['kosmische','kosmische-musik'],slambient:['slambient'],
  electronic_dance_pop:['electronic-dance-pop','dance-pop'],edm_trap:['edm-trap','trap-edm'],
  experimental_bass:['experimental-bass'],mainstage_techno:['mainstage-techno'],
  big_room_techno:['big-room-techno'],dark_experimental:['dark-experimental'],
  nu_skool_breaks:['nu-skool-breaks','nuskoolbreaks'],sambass:['sambass','samba-bass'],
  shangaan_electro:['shangaan-electro'],musique_concrete:['musique-concrete'],
  industrial_dance:['industrial-dance'],raw_techno:['raw-techno'],
};
const excludedTitle=/\b(?:demo|preview|snippet|teaser|remix|bootleg|edit|tribute|karaoke|dj mix|continuous mix|full album|interview|podcast|live set|intro|introduction)\b/i;
const excludedArtist=/^(?:various(?: artists)?|v\.?a\.?|unknown|compilation)$/i;
const badTags=new Set(['rock','metal','alternative-rock','indie-rock','folk','country','punk','post-punk','black-metal','death-metal','gospel']);
const result=await fs.readFile(reportDir+'/catalog-v24-evidence.json','utf8').then(JSON.parse).catch(()=>({startedAt:new Date().toISOString(),method:'Exact artist/label genre tags, published recording identity, current audio response, official Bandcamp player; no audition claim.',styles:{}}));
const runtime=createAppRuntimeTestContext();
for(const [style,state] of Object.entries(result.styles)){
 const valid=[];
 for(const row of state.accepted){
  const cached=JSON.parse(await fs.readFile(path.join(cacheDir,'album-'+Buffer.from(row.genre_evidence_url).toString('base64url')+'.json'),'utf8'));
  const issue=style==='big_room_house'?'Big room house is ambiguous with non-festival club house; use editorial label evidence':publisherEvidenceIssue({style,tags:cached.tags,albumArtist:cached.data.artist,artist:row.artist,title:cached.data.current?.title,trackTitle:row.song,styles:Object.keys(manifest.styles)});
  if(issue)state.rejected.push({url:row.genre_evidence_url,artist:row.artist,song:row.song,reason:issue});else valid.push(row);
 }
 state.accepted=valid;
}
function runtimeAccepts(row){
 row.source_tags='electronic_artist_diversity_v24;'+row.source_tags.replace(/^electronic_artist_diversity_v24;/,'');
 runtime.mergeExternalDatasetRows([row],'dataset_local_runtime');
 const actual=runtime.catalog.find(t=>runtime.recommendationTrackKey(t)===runtime.recommendationTrackKey(row));
 return actual && actual.style===row.style && runtime.isTrackEligibleForRecommendation(actual) && runtime.trackMatchesRequestedSubgenreEvidence(actual,{style:row.style});
}
for(const state of Object.values(result.styles)){
 const independent=[];
 state.accepted=state.accepted.filter(row=>{
  if(independent.some(old=>runtime.artistsShareIdentity(old.artist,row.artist))){state.rejected.push({url:row.genre_evidence_url,artist:row.artist,song:row.song,reason:'Artist credit overlaps another accepted recording; do not inflate artist diversity'});return false;}
  if(runtimeAccepts(row)){independent.push(row);return true;}
  state.rejected.push({url:row.genre_evidence_url,artist:row.artist,song:row.song,reason:'Actual app import/genre/eligibility rejected this recording'});return false;
 });
 if(state.accepted.length<state.targetNew)state.complete=false;
}
const htmlDecode=s=>String(s||'').replaceAll('&quot;','"').replaceAll('&#39;',"'").replaceAll('&#039;',"'").replaceAll('&amp;','&').replaceAll('&lt;','<').replaceAll('&gt;','>');
const slug=s=>normalize(s).replaceAll(' ','-');
let nextRequestAt=0;
async function fetchLimited(url,options={}) {
  // Publisher HTML/API requests are serialized. Tiny range probes go to the
  // separate media CDN, still bounded by the four collection workers.
  const mediaCdn=new URL(url).hostname.endsWith('.bcbits.com');
  const scheduled=mediaCdn?Date.now():Math.max(Date.now(),nextRequestAt);
  if(!mediaCdn)nextRequestAt=scheduled+1100;
  if(scheduled>Date.now())await new Promise(r=>setTimeout(r,scheduled-Date.now()));
  const r=await fetch(url,{...options,signal:AbortSignal.timeout(18000)});
  if(r.status===429){nextRequestAt=Math.max(nextRequestAt,Date.now()+60000);throw Error('RATE_LIMITED');}
  if(!r.ok)throw Error('HTTP '+r.status);return r;
}
async function cachedJson(name,load){const file=path.join(cacheDir,name+'.json');try{return JSON.parse(await fs.readFile(file,'utf8'));}catch{}const value=await load();await fs.writeFile(file,JSON.stringify(value));return value;}
async function discover(tag,page,cursor){return cachedJson('discover-'+tag+'-'+page,async()=>{
 const response=await fetchLimited('https://bandcamp.com/api/discover/1/discover_web',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({category_id:1,tag_norm_names:[tag],geoname_id:0,slice:'top',time_facet_id:null,cursor,size:48,include_result_types:['a','s'],followed_bands:false})});
 const data=await response.json();if(!Array.isArray(data.results))throw Error(data.error_type||'Invalid discovery result');return data;
});}
async function album(url){return cachedJson('album-'+Buffer.from(url).toString('base64url'),async()=>{
 const html=await(await fetchLimited(url)).text();const raw=html.match(/data-tralbum="([^"]+)"/)?.[1];if(!raw)throw Error('No public recording metadata');
 const data=JSON.parse(htmlDecode(raw));const tags=[...html.matchAll(/<a[^>]*class="[^"]*tag[^>]*>([\s\S]*?)<\/a>/g)].map(m=>htmlDecode(m[1].replace(/<[^>]+>/g,'')).trim());
 return {data,tags,url,checkedAt:new Date().toISOString()};
});}
let saveQueue=Promise.resolve();
function save(){saveQueue=saveQueue.then(async()=>{const file=reportDir+'/catalog-v24-evidence.json';await fs.writeFile(file+'.tmp',JSON.stringify(result,null,2));await fs.rename(file+'.tmp',file);});return saveQueue;}
async function collect(style){
 const old=JSON.parse(await fs.readFile('data/runtime-catalog-v1/'+manifest.styles[style],'utf8'));
 const existing=new Set(old.map(r=>identity(r.artist)));
 const verifiedBefore=currentAudio.styles[style]?.verifiedArtists||0;
 const target=Math.max(2,10-verifiedBefore);
 const state=result.styles[style]||{before:existing.size,targetNew:target,tags:aliases[style]||[style.replaceAll('_','-')],accepted:[],rejected:[],queries:[]};
 result.styles[style]=state;state.targetNew=target;state.tags=aliases[style]||[style.replaceAll('_','-')];state.verifiedBefore=verifiedBefore;
 if(state.complete && state.accepted.length>=target)return;
 const accepted=new Set(state.accepted.map(x=>identity(x.artist)));const seen=new Set(state.rejected.filter(x=>!x.reason.startsWith('Actual app')).map(x=>x.url));
 for(const tag of state.tags){let cursor=null;
  for(let page=0;page<2 && accepted.size<target;page++){
   let found;try{found=await discover(tag,page,cursor);}catch(e){state.queries.push({tag,page,error:e.message});if(e.message==='RATE_LIMITED')throw e;break;}
   state.queries.push({tag,page,resultCount:found.result_count});cursor=found.cursor;
   for(const item of found.results){
    if(accepted.size>=target)break;
    const url=item.item_url.split('?')[0];if(seen.has(url))continue;seen.add(url);
    const suggested=item.player_data?.artist_name || item.album_artist || item.featured_track?.band_name || item.band_name;
    if(existing.has(identity(suggested))||accepted.has(identity(suggested)))continue;
    if(excludedTitle.test(item.player_data?.title||item.featured_track?.title||'')||item.player_data?.is_streaming_disabled)continue;
    try{
     const pageData=await album(url);const {data,tags}=pageData;
     if(data.is_private_stream||data.tralbum_subscriber_only||data.is_preorder||data.current?.private||data.current?.killed)throw Error('Not a published public stream');
     const normalizedTags=tags.map(slug);
     if(!state.tags.some(t=>normalizedTags.includes(t)))throw Error('Exact subgenre tag absent on publisher page');
     if(normalizedTags.some(t=>badTags.has(t)||/(?:^|-)(?:rock|metal)$/.test(t)))throw Error('Conflicting non-electronic genre tag');
     if(style==='wave' && (!normalizedTags.some(t=>['bass','trap','hardwave','wave-music','wavemusic'].includes(t)) || normalizedTags.some(t=>['gothic','synthwave','new-wave'].includes(t))))throw Error('Wave tag is ambiguous with new wave/synthwave');
     if(style==='darkwave' && !normalizedTags.includes('electronic'))throw Error('Darkwave must have an electronic classification');
     const eligible=t=>t.file?.['mp3-128']&&t.streaming===1&&!t.private&&!t.is_draft&&!t.unreleased_track&&!excludedTitle.test(t.title)&&t.duration>=90&&t.duration<=1200;
     const tracks=data.trackinfo.filter(eligible).sort((a,b)=>Number(b.id===data.featured_track_id)-Number(a.id===data.featured_track_id));
     if(!tracks.length)throw Error('No eligible recording with public audio');
     if(/\b(?:a\.?k\.?a\.?|formerly known|alias)\b/i.test(data.current.about||''))throw Error('Alias needs manual identity review');
     for(const track of tracks){
     if(accepted.size>=target)break;
     const artist=htmlDecode(track.artist||data.artist||data.current.artist).trim();
     if(!artist||!identity(artist)||excludedArtist.test(artist)||/\b(?:records|recordings|various artists|compilation)\b/i.test(artist))continue;
     if(/\s+(?:feat\.?|ft\.?|featuring|vs\.?|x|with|and)\s+|\s+&\s+|[,;/]\s*/i.test(artist))continue;
     if(existing.has(identity(artist))||accepted.has(identity(artist)))continue;
     if(old.some(row=>runtime.artistsShareIdentity(row.artist,artist))||state.accepted.some(row=>runtime.artistsShareIdentity(row.artist,artist)))continue;
     const issue=publisherEvidenceIssue({style,tags,albumArtist:data.artist,artist,title:data.current?.title,trackTitle:track.title,styles:Object.keys(manifest.styles)});
     if(issue){state.rejected.push({url,artist,song:track.title,reason:issue});continue;}
     const stream=track.file['mp3-128'];const audio=await fetchLimited(stream,{headers:{Range:'bytes=0-1023'}});const mediaType=audio.headers.get('content-type')||'';await audio.body?.cancel();if(!/^audio\//.test(mediaType))throw Error('Not an audio response');
     const trackUrl=new URL(track.title_link,url).href;
     let song=htmlDecode(track.title).trim();if(song.startsWith(artist+' - '))song=song.slice(artist.length+3);
     const row={universe:'electronic',style,artist,song,bandcamp_track_url:trackUrl,bandcamp_track_id:String(track.id),cover_art_url:`https://f4.bcbits.com/img/a${data.art_id}_10.jpg`,release_date:data.album_release_date||data.current.publish_date||'',duration_sec:String(Math.round(track.duration)),artist_genre:state.tags.find(t=>normalizedTags.includes(t)).replaceAll('-',' '),genre_evidence_url:url,source_url:trackUrl,source:'electronic_artist_diversity_v24_20261105',source_tags:'publisher_genre_verified;recording_identity_verified;audio_http_checked;official_bandcamp_player',confidence:'high',status:'published'};
     if(!runtimeAccepts(row)){state.rejected.push({url,artist,song,reason:'Actual app import/genre/eligibility rejected this recording'});continue;}
     state.accepted.push({...row,evidence:{checkedAt:new Date().toISOString(),tags,albumArtist:data.artist,trackArtist:track.artist||null,audioStatus:audio.status,audioMediaType:mediaType,playback:'official Bandcamp embed; temporary stream URL not shipped',appImportAndGenreAccepted:true}});accepted.add(identity(artist));await save();
     }
    }catch(e){state.rejected.push({url,artist:suggested,reason:e.message});if(e.message==='RATE_LIMITED'){await save();throw e;}}
   }
   if(!found.results.length||found.results.length<48)break;
  }
 }
 state.complete=true;state.after=existing.size+accepted.size;state.verifiedAfter=verifiedBefore+accepted.size;await save();console.log(style,existing.size+' -> '+state.after,'new',accepted.size,'verified',state.verifiedAfter);
}
const selected=process.argv.slice(2).filter(x=>!x.startsWith('--'));
// Four bounded independent style chains; each style remains sequential and resumable.
const pending=process.argv.includes('--export-only') ? [] : before.filter(r=>!selected.length||selected.includes(r.style));
await Promise.all(Array.from({length:4},async()=>{while(pending.length){const row=pending.shift();await collect(row.style);}}));
await save();
const rows=Object.values(result.styles).flatMap(s=>s.accepted).map(({evidence,...row})=>row);
const columns=Object.keys(rows[0]||{});const quote=s=>'"'+String(s??'').replaceAll('"','""')+'"';
await fs.writeFile('data/electronic_artist_diversity_v24_20261105.csv',[columns,...rows.map(r=>columns.map(k=>r[k]))].map(r=>r.map(quote).join(',')).join('\n')+'\n');
console.log('Verified new recordings:',rows.length,'styles:',Object.keys(result.styles).length);
