import fs from 'node:fs/promises';
import {createAppRuntimeTestContext} from './app-runtime-test-harness.mjs';
const dir='reports/public-release-20261105/';
const before=JSON.parse(await fs.readFile(dir+'catalog-v24-before-eligible.json','utf8'));
const after=JSON.parse(await fs.readFile(dir+'catalog-v24-audit.json','utf8'));
if(after.rejectedAdditions.length||after.selectionFailures.length)throw Error('Resolve catalog or selection failures before reporting this release');
const ctx=createAppRuntimeTestContext();
const rows=after.styles.map(s=>{
 const old=before.styles.find(t=>t.style===s.style);
 return {subgenero:ctx.styleLabelByValue(s.style),id:s.style,artistas_elegiveis_antes:old.eligibleArtists,artistas_elegiveis_depois:s.eligibleArtists,variacao:s.eligibleArtists-old.eligibleArtists,faixas_adicionadas:s.newTracks,artistas_com_audio_verificado:s.verifiedPlayableArtists,descobertas_imediatas_testadas_ate_10:s.immediateDistinctDiscoveries,faltam_para_10:Math.max(0,10-s.eligibleArtists)};
}).sort((a,b)=>a.artistas_elegiveis_depois-b.artistas_elegiveis_depois||a.subgenero.localeCompare(b.subgenero));
const headers=Object.keys(rows[0]);const quote=s=>'"'+String(s??'').replaceAll('"','""')+'"';
await fs.writeFile(dir+'artistas-por-subgenero.csv','\uFEFF'+[headers,...rows.map(r=>headers.map(h=>r[h]))].map(r=>r.map(quote).join(',')).join('\n')+'\n');
const summary={checkedAt:after.checkedAt,baselineCommit:'0554916f4724dbdc6aaa89852fb010efbc9cbb08',styles:rows.length,beforeAtLeast10:before.eligibleAtLeast10,afterAtLeast10:after.eligibleAtLeast10,below10:rows.filter(r=>r.faltam_para_10).length,newRecordings:rows.reduce((n,r)=>n+r.faixas_adicionadas,0),stylesWithNewRecordings:rows.filter(r=>r.faixas_adicionadas>0).length,verifiedAudioAtLeast10:after.verifiedAtLeast10,immediateDiscoveryAtLeast10:after.discoverableAtLeast10,discoveriesTested:after.discoveriesChecked,selectionFailures:after.selectionFailures.length,rejectedImports:after.rejectedAdditions.length,method:'Eligible means accepted by the real browser import, post-import guards and subgenre rules. Audio verification means an HTTP audio response checked against recording/source metadata; it is not human audition or a permanent availability promise. Immediate discoveries use the actual next-track picker without provider refresh. Collaborations count once; overlapping artist credits are grouped conservatively. Before loads the deployed source and catalog at the baseline commit. After loads the built release. Remote catalog additions are not included in either side.',remaining:rows.filter(r=>r.faltam_para_10),decreases:rows.filter(r=>r.variacao<0)};
await fs.writeFile(dir+'catalog-v24-summary.json',JSON.stringify(summary,null,2)+'\n');
console.log(JSON.stringify({...summary,remaining:summary.remaining.map(r=>[r.subgenero,r.artistas_elegiveis_depois])},null,2));
