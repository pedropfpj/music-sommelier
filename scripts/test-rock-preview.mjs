import assert from 'node:assert/strict';
import {createRequire} from 'node:module';
import {readFile} from 'node:fs/promises';
import {selectCoreTracks} from './build-runtime-catalog.mjs';
const require=createRequire(import.meta.url);
const api=require('../rock-preview.js');
const data=JSON.parse(await readFile(new URL('../data/rock-preview-v1.json',import.meta.url),'utf8'));
const tracks=api.validTracks(data.tracks);
assert.equal(tracks.length,data.tracks.length,'Every published rock recording must have trusted provider/audio URLs and identity evidence');
assert.ok(tracks.length>=40);assert.ok(new Set(tracks.map(t=>t.artistKey)).size>=20);assert.equal(new Set(tracks.map(t=>t.genre)).size,6);
for(let iteration=0;iteration<100;iteration++){
 const model=api.createModel(tracks,{includeReferences:true});const delivered=[];
 while(true){const next=model.next();if(!next)break;delivered.push(next);assert.ok(delivered.length<=tracks.length);}
 assert.equal(delivered.length,tracks.length);assert.equal(new Set(delivered.map(t=>t.key)).size,tracks.length,'No implicit replay after exhaustion');
 for(let i=1;i<delivered.length;i++){
  const remaining=tracks.filter(t=>!delivered.slice(0,i).some(p=>p.key===t.key));
  if(remaining.some(t=>t.artistKey!==delivered[i-1].artistKey))assert.notEqual(delivered[i].artistKey,delivered[i-1].artistKey,'Avoid adjacent artists whenever another remains');
 }
}
const discoveries=api.createModel(tracks);const discoveryKeys=[];
while(true){const t=discoveries.next();if(!t)break;assert.notEqual(t.discoveryTier,'reference','Familiar classics must require opting in');discoveryKeys.push(t.key);}
assert.equal(discoveryKeys.length,tracks.filter(t=>t.discoveryTier!=='reference').length);
discoveries.setIncludeReferences(true);const reference=discoveries.next();assert.equal(reference.discoveryTier,'reference');discoveries.toggleLike(reference.key);discoveries.setIncludeReferences(false);
assert.ok(discoveries.likes.has(reference.key),'Changing curation mode must preserve likes');assert.ok(discoveries.seen.has(reference.key),'Changing curation mode must preserve history');
assert.equal(api.createModel(tracks,discoveries.snapshot()).includeReferences,false);
assert.equal(api.validTracks([{...tracks[0],listeningNote:{pt:'Only Portuguese'}}]).length,0,'Editorial notes must exist in all supported languages');
for(const genre of Object.keys(api.copy.pt.genres))assert.ok(tracks.filter(t=>t.genre===genre&&t.discoveryTier!=='reference').length>=2,'Every style must support discovery without classic hits');
const state=api.createModel(tracks,{},()=>0),first=state.next('punk');state.toggleLike(first.key);
assert.ok(state.likes.has(first.key));assert.equal(state.next('metal').genre,'metal');
const restored=api.createModel(tracks,state.snapshot(),()=>0);assert.ok(restored.likes.has(first.key));assert.notEqual(restored.next('punk').key,first.key,'Reload must preserve discovery history');
const before=new Set(restored.seen);restored.restart('punk');assert.ok(restored.likes.has(first.key));assert.ok([...before].filter(k=>tracks.find(t=>t.key===k).genre!=='punk').every(k=>restored.seen.has(k)),'Restart only clears the selected style');
const backing=new Map(),storage={getItem:k=>backing.get(k),setItem:(k,v)=>backing.set(k,v)};
api.writeState(storage,'one',state.snapshot());assert.equal(api.readState(storage,'two').likes,undefined,'Profiles cannot share likes');
assert.ok(api.readState(storage,'one').likes.includes(first.key));assert.deepEqual(api.readState({getItem:()=>'{broken'},'one'),{});assert.equal(api.writeState({setItem(){throw Error('quota');}},'one',{}),false);
assert.equal(api.validTracks([{...tracks[0],previewUrl:'https://audio-ssl.itunes.apple.com.evil.example/audio.mp3'}]).length,0);
assert.equal(api.validTracks([tracks[0],{...tracks[0],key:'other'}]).length,1,'Duplicate recordings with another provider key must be removed');
const input=[...Array(20)].map((_,i)=>({artist:'One',song:String(i)})).concat([{artist:'Two',song:'A'},{artist:'Three',song:'B'}]);
const selected=selectCoreTracks(input,5);assert.deepEqual(selected.slice(0,3).map(t=>t.artist),['One','Two','Three']);assert.equal(input.length,22);
console.log(`Rock preview passed: ${tracks.length} recordings, 6 styles, 100 complete no-repeat rounds, artist diversity, explicit restart, profile isolation, storage failure, unsafe URL rejection and balanced core selection.`);
