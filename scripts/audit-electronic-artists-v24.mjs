import fs from 'node:fs/promises';
import {execFileSync} from 'node:child_process';
import {createAppRuntimeTestContext} from './app-runtime-test-harness.mjs';
const root='reports/public-release-20261105/';
const baseline=process.argv.includes('--baseline');
const baselineCommit='0554916f4724dbdc6aaa89852fb010efbc9cbb08';
const baselineText=file=>execFileSync('git',['show',baselineCommit+':'+file],{encoding:'utf8',maxBuffer:16*1024*1024});
const readCatalog=async file=>JSON.parse(baseline?baselineText(file):await fs.readFile(file,'utf8'));
const ctx=createAppRuntimeTestContext(baseline?baselineText('app.js'):undefined);
const evidence=JSON.parse(await fs.readFile(root+'catalog-v24-evidence.json','utf8'));
const previous=JSON.parse(await fs.readFile(root+'catalog-before-audio.json','utf8'));
const editorial=JSON.parse(await fs.readFile(root+'editorial-v24-validation.json','utf8'));
const label=JSON.parse(await fs.readFile(root+'label-v24-validation.json','utf8'));
const manifest=await readCatalog('data/runtime-catalog-v1/manifest.json');
const additions=Object.values(evidence.styles).flatMap(s=>s.accepted);
const verification=new Map();
for(const [style,value] of Object.entries(previous.styles))for(const row of value.verified)verification.set(style+':'+ctx.recommendationTrackKey(row),'existing audio response');
for(const row of additions)verification.set(row.style+':'+ctx.recommendationTrackKey(row),'publisher identity/genre and public audio response');
for(const row of editorial.passed)verification.set(row.style+':'+ctx.recommendationTrackKey(row),'label genre, Apple identity and audio response');
for(const row of label.passed)verification.set(row.style+':'+ctx.recommendationTrackKey(row),'label release identity, genre and audio response');
if(process.argv.includes('--pending')){
 ctx.mergeExternalDatasetRows(additions,'dataset_local_runtime');
 ctx.mergeExternalDatasetRows(label.passed,'dataset_local_runtime');
 ctx.mergeExternalDatasetRows(editorial.passed.map(row=>({style:row.style,artist:row.artist,song:row.song,preview_url:row.previewUrl,artist_genre:row.style.replaceAll('_',' '),genre_evidence_url:row.genreEvidenceUrl,source_url:row.sourceUrl,source_tags:'electronic_editorial_v24;apple_identity_verified;editorial_subgenre;audio_http_checked'})),'dataset_local_runtime');
}
const runtimeSource=baseline?'runtime_catalog_v1':'dataset_local_runtime';
ctx.mergeExternalDatasetRows(await readCatalog('data/runtime-catalog-v1/'+manifest.core),runtimeSource+'_core');
for(const [style,file] of Object.entries(manifest.styles))ctx.mergeExternalDatasetRows(await readCatalog('data/runtime-catalog-v1/'+file),runtimeSource+'_'+style);
// These are the same post-import guards used by hydrateExternalDatasetPackInBackground.
ctx.finalizeExternalDatasetRuntimeMerge({tracksImported:1});

// A collaboration counts once; aliases are not extra discoveries.
// Conflicting credits: conservatively group Nozinja/Zinja Hlungwani pending a
// definitive identity review (Boiler Room interview versus Apple/AllMusic bio).
const canonical=s=>ctx.artistMatchKey(s).replace(/^zinja hlungwani$/,'nozinja');
function distinct(tracks){const out=[];for(const t of tracks)if(!out.some(old=>canonical(old.artist)===canonical(t.artist)||ctx.artistsShareIdentity(old.artist,t.artist)))out.push(t);return out;}
const styles=[];
const selectionFailures=[];
let discoveriesChecked=0;
for(const style of Object.keys(ctx.STYLE_BPM_RULES)){
 const rows=ctx.catalog.filter(t=>t.style===style);
 const eligible=rows.filter(t=>ctx.isTrackEligibleForRecommendation(t)&&ctx.trackMatchesRequestedSubgenreEvidence(t,{style}));
 const verified=eligible.filter(t=>verification.has(style+':'+ctx.recommendationTrackKey(t)));
 const unique=distinct(verified);
 const heard=[];
 if(!baseline && process.argv.includes('--selection')){
  for(const name of ['seenTrackKeysMemory','seenRecordingIdsMemory','knownTrackTitlesMemory','seenArtistsMemory','discoveredArtistsInApp','knownArtistsMemory','rejectedArtists','blockedArtistsMemory'])ctx[name]=new Set();
  ctx.recentPresentedArtists=[];ctx.currentRecommendation=null;ctx.suggestionQueueTracks=[];
  for(let i=0;i<10;i++){
   const next=ctx.pickInstantPrimaryNextTrack(heard.at(-1)||null,style);
   if(!next)break;
   if(next.style!==style||heard.some(t=>ctx.recommendationTrackKey(t)===ctx.recommendationTrackKey(next)||ctx.artistsShareIdentity(t.artist,next.artist)))selectionFailures.push({style,artist:next.artist,song:next.song});
   heard.push(next);ctx.markRecommendationPresented(next);discoveriesChecked++;
  }
 }
 styles.push({style,tracks:rows.length,eligibleTracks:eligible.length,eligibleArtists:distinct(eligible).length,verifiedPlayableArtists:unique.length,verifiedArtists:unique.map(t=>t.artist),newTracks:additions.filter(t=>t.style===style).length+editorial.passed.filter(t=>t.style===style).length+label.passed.filter(t=>t.style===style).length,collectionComplete:!!evidence.styles[style]?.complete,...(!baseline&&process.argv.includes('--selection')?{immediateDistinctDiscoveries:heard.length}: {})});
}
const rejected=(baseline?[]:[...additions,...editorial.passed,...label.passed]).flatMap(row=>{
 const track=ctx.catalog.find(t=>ctx.recommendationTrackKey(t)===ctx.recommendationTrackKey(row));
 const reasons=[];
 if(!track)reasons.push('not imported');
 else {
  if(track.style!==row.style)reasons.push('recording already assigned to '+track.style);
  if(!ctx.isTrackEligibleForRecommendation(track))reasons.push('recommendation eligibility');
  if(!ctx.trackMatchesRequestedSubgenreEvidence(track,{style:row.style}))reasons.push('subgenre evidence');
 }
 return reasons.length?[{style:row.style,artist:row.artist,song:row.song,reasons}]:[];
});
const report={checkedAt:new Date().toISOString(),mode:baseline?'before-release':process.argv.includes('--pending')?'pending-import':'built-runtime',method:'Actual app core then shard import and post-import guards; conservative overlapping artist credits; only source/audio checked recordings counted as verified. Existing provider refresh routes may still work but are not counted without verification.',styles,eligibleAtLeast10:styles.filter(s=>s.eligibleArtists>=10).length,verifiedAtLeast10:styles.filter(s=>s.verifiedPlayableArtists>=10).length,discoverableAtLeast10:styles.filter(s=>s.immediateDistinctDiscoveries>=10).length,discoveriesChecked,selectionFailures,rejectedAdditions:rejected};
await fs.writeFile(root+(baseline?'catalog-v24-before-eligible.json':process.argv.includes('--pending')?'catalog-v24-pending-audit.json':'catalog-v24-audit.json'),JSON.stringify(report,null,2)+'\n');
console.log(JSON.stringify({styles:styles.length,eligibleAtLeast10:report.eligibleAtLeast10,verifiedAtLeast10:report.verifiedAtLeast10,rejectedAdditions:rejected.length,gaps:styles.filter(s=>s.eligibleArtists<10).map(({style,eligibleArtists,verifiedPlayableArtists})=>({style,eligibleArtists,verifiedPlayableArtists})),rejected:rejected.slice(0,12)},null,2));
if(!baseline&&(rejected.length||selectionFailures.length))process.exitCode=1;
