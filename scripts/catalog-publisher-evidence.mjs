const slug=s=>String(s||'').normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase().replace(/&/g,' and ').replace(/[^a-z0-9]+/g,'-').replace(/^-|-$/g,'');
export function publisherEvidenceIssue({style,tags,albumArtist,artist,title,trackTitle='',styles}) {
 const normalized=tags.map(slug);
 if(/\b(?:minimix|megamix|mixtape|rework|rewerk|bootleg|remix|edit)\b/i.test(trackTitle))return 'Mix/rework needs separate recording and original artist verification';
 const creditParts=trackTitle.split(' - ');
 if(creditParts.length>1){
  const prefix=slug(creditParts[0].replace(/^\[[^\]]+\]\s*/,''));
  const suffix=slug(creditParts.at(-1).replace(/\s*\([^)]*\)\s*$/,''));
  if(prefix!==slug(artist)&&suffix!==slug(artist)&&!/^\w?\d+$/.test(prefix)&&!/^part-\d+$/.test(suffix))return 'Title contains a different artist or ambiguous credit; manual identity review required';
 }
 if(/^(?:burial-sade|nightcore4totalsluts)$/i.test(artist))return 'Third-party mashup/nightcore account needs original recording verification';
 if(/\b(?:sample[s]?|sample pack|soundtrack|dj[ -]kicks|dj mix|compilation|tribute|karaoke|bootleg)\b/i.test(title||''))return 'Collection/sample/soundtrack tags do not establish this individual recording subgenre';
 if(albumArtist&&slug(albumArtist)!==slug(artist))return 'Album genre belongs to a compilation or different artist; individual track needs editorial evidence';
 if(normalized.some(t=>/(?:^|-)(?:rock|metal|soundtrack|samples|sample-pack)$/.test(t)))return 'Conflicting rock/metal, soundtrack or sample-pack classification';
 const specific=new Set(styles.map(slug).filter(x=>!['house','techno','ambient','edm','psytrance','trance','electro','trap','downtempo','chillout'].includes(x)));
 if(normalized.filter(t=>specific.has(t)).length>3)return 'Release spans too many fine subgenres; individual track needs editorial evidence';
 if(style==='ballroom_vogue_beats'&&!normalized.some(t=>['vogue','voguing','ballroom-house','ballroom-beats'].includes(t))&&!normalized.some(t=>['club','club-music','jersey-club','house'].includes(t)))return 'Ballroom is ambiguous with historical ballroom recordings rather than vogue club music';
 return '';
}
