import {readFile,writeFile,mkdir} from 'node:fs/promises';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const runtime=path.join(root,'data/runtime-catalog-v1');
const manifest=JSON.parse(await readFile(path.join(runtime,'manifest.json'),'utf8'));
const norm=value=>String(value||'').normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase().replace(/[^a-z0-9]+/g,' ').trim();
const route=track=>Boolean(track.preview_url||track.deezer_track_id||track.bandcamp_track_id||track.bandcamp_track_url||track.soundcloud_track_url);
const rows=[];
for(const [style,file] of Object.entries(manifest.styles)){
 const tracks=JSON.parse(await readFile(path.join(runtime,file),'utf8'));
 const routed=tracks.filter(route);
 const frequencies=new Map();for(const t of routed){const artist=norm(t.artist);if(artist)frequencies.set(artist,(frequencies.get(artist)||0)+1);}
 const unique=new Set(tracks.map(t=>`${norm(t.artist)}::${norm(t.song)}`));
 rows.push({style,tracks:tracks.length,artists:new Set(tracks.map(t=>norm(t.artist)).filter(Boolean)).size,tracksWithAudioRoute:routed.length,artistsWithAudioRoute:frequencies.size,largestArtistShare:routed.length?Math.max(0,...frequencies.values())/routed.length:0,duplicateRows:tracks.length-unique.size,artistGap:Math.max(0,12-frequencies.size),trackGap:Math.max(0,40-routed.length)});
}
rows.sort((a,b)=>a.artistsWithAudioRoute-b.artistsWithAudioRoute||a.tracksWithAudioRoute-b.tracksWithAudioRoute||b.largestArtistShare-a.largestArtistShare);
const report={generatedAt:new Date().toISOString(),note:'Audio routes are catalog metadata, not a guarantee that the remote audio plays today. Artist credits are normalized, not fully resolved identities. Initial editorial targets: 12 artists and 40 tracks with audio routes per subgenre.',styles:rows.length,totalStyleTrackRows:rows.reduce((n,r)=>n+r.tracks,0),belowInitialTarget:rows.filter(r=>r.artistGap||r.trackGap).length,duplicateRows:rows.reduce((n,r)=>n+r.duplicateRows,0),rows};
await mkdir(path.join(root,'reports/ux-refresh'),{recursive:true});
await writeFile(path.join(root,'reports/ux-refresh/catalog-coverage.json'),JSON.stringify(report,null,2)+'\n');
console.log(JSON.stringify({...report,rows:rows.slice(0,20)},null,2));
