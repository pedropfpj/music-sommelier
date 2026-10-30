(function (scope) {
  'use strict';
  const copy = {
    pt: {badge:'PRÉVIA · NOVOS CAMINHOS',title:'Agora, rock também.',intro:'Dos riffs ao inesperado. Escolha uma vertente e encontre seu próximo achado.',teaser:'Rock está chegando.',teaserText:'Experimente a primeira seleção de guitarras, vozes e novas direções.',explore:'Explorar rock',back:'Voltar à eletrônica',all:'Todas as vertentes',genres:{alternative_rock:'Alternativo',indie_rock:'Indie',psychedelic:'Psicodélico',punk:'Punk & hardcore',metal:'Metal',post_punk:'Post-punk'},loading:'Preparando a seleção de rock…',retry:'Tentar novamente',error:'Não foi possível carregar o rock agora. Tente novamente quando estiver conectado.',play:'Ouvir prévia',pause:'Pausar',next:'Outra faixa',like:'Curtir',liked:'Curtida',provider:'Ouvir no Apple Music ↗',note:'Prévias promocionais da Apple Music. A disponibilidade pode variar por região.',saved:'Suas curtidas de rock',emptySaved:'As faixas que você curtir aparecem aqui.',savedNote:'Salvas neste perfil e neste aparelho.',storageError:'Não foi possível salvar neste aparelho. Suas escolhas valem enquanto esta página estiver aberta.',end:'Você explorou esta seleção.',endText:'Experimente outra vertente ou comece uma nova rodada.',restart:'Começar nova rodada',audioError:'Esta prévia está indisponível agora. Abra no Apple Music ou escolha outra faixa.',loadingAudio:'Carregando a prévia…',ready:'Toque para ouvir um trecho.',playing:'Prévia em reprodução.',ended:'Fim da prévia. Curta ou descubra outra faixa.',explicit:'Explícita',count:(n,a)=>`${n} faixas · ${a} artistas nesta prévia`,progress:(n,total)=>`${n} de ${total} descobertas nesta seleção`},
    en: {badge:'PREVIEW · NEW DIRECTIONS',title:'Now, rock too.',intro:'From riffs to the unexpected. Choose a style and find your next discovery.',teaser:'Rock is on its way.',teaserText:'Try our first selection of guitars, voices and new directions.',explore:'Explore rock',back:'Back to electronic',all:'All styles',genres:{alternative_rock:'Alternative',indie_rock:'Indie',psychedelic:'Psychedelic',punk:'Punk & hardcore',metal:'Metal',post_punk:'Post-punk'},loading:'Preparing the rock selection…',retry:'Try again',error:'Rock could not load. Try again when you are connected.',play:'Play preview',pause:'Pause',next:'Another track',like:'Like',liked:'Liked',provider:'Listen on Apple Music ↗',note:'Promotional previews from Apple Music. Availability may vary by region.',saved:'Your rock likes',emptySaved:'Tracks you like will appear here.',savedNote:'Saved to this profile on this device.',storageError:'This device could not save your choices. They will last while this page is open.',end:'You explored this selection.',endText:'Try another style or start a new round.',restart:'Start a new round',audioError:'This preview is unavailable. Open Apple Music or choose another track.',loadingAudio:'Loading the preview…',ready:'Tap to hear a preview.',playing:'Preview playing.',ended:'Preview finished. Like it or discover another track.',explicit:'Explicit',count:(n,a)=>`${n} tracks · ${a} artists in this preview`,progress:(n,total)=>`${n} of ${total} discoveries in this selection`},
    es: {badge:'VISTA PREVIA · NUEVOS CAMINOS',title:'Ahora, también rock.',intro:'De los riffs a lo inesperado. Elige un estilo y encuentra tu próximo descubrimiento.',teaser:'El rock está llegando.',teaserText:'Prueba la primera selección de guitarras, voces y nuevas direcciones.',explore:'Explorar rock',back:'Volver a electrónica',all:'Todos los estilos',genres:{alternative_rock:'Alternativo',indie_rock:'Indie',psychedelic:'Psicodélico',punk:'Punk & hardcore',metal:'Metal',post_punk:'Post-punk'},loading:'Preparando la selección de rock…',retry:'Intentar de nuevo',error:'No se pudo cargar el rock. Inténtalo de nuevo cuando tengas conexión.',play:'Escuchar preview',pause:'Pausar',next:'Otra pista',like:'Me gusta',liked:'Te gusta',provider:'Escuchar en Apple Music ↗',note:'Previews promocionales de Apple Music. La disponibilidad puede variar por región.',saved:'Tus favoritos de rock',emptySaved:'Las pistas que te gusten aparecerán aquí.',savedNote:'Guardados en este perfil y este dispositivo.',storageError:'No se pudo guardar en este dispositivo. Tus elecciones durarán mientras esta página esté abierta.',end:'Exploraste esta selección.',endText:'Prueba otro estilo o empieza una nueva ronda.',restart:'Empezar nueva ronda',audioError:'Este preview no está disponible. Abre Apple Music o elige otra pista.',loadingAudio:'Cargando el preview…',ready:'Toca para escuchar un fragmento.',playing:'Reproduciendo preview.',ended:'Terminó el preview. Dale me gusta o descubre otra pista.',explicit:'Explícita',count:(n,a)=>`${n} pistas · ${a} artistas en esta vista previa`,progress:(n,total)=>`${n} de ${total} descubrimientos en esta selección`}
  };
  Object.assign(copy.pt,{includeReferences:'Incluir clássicos conhecidos',curator:'O que ouvir',tiers:{discovery:'Descoberta',deep_cut:'Outro lado do artista',reference:'Referência'}});
  Object.assign(copy.en,{includeReferences:'Include familiar classics',curator:'Listen for',tiers:{discovery:'Discovery',deep_cut:'Another side of the artist',reference:'Reference'}});
  Object.assign(copy.es,{includeReferences:'Incluir clásicos conocidos',curator:'Qué escuchar',tiers:{discovery:'Descubrimiento',deep_cut:'Otra faceta del artista',reference:'Referencia'}});
  const normalize = s => String(s || '').normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase().replace(/[^a-z0-9]+/g,'');
  function safeUrl(value, hosts) {
    try { const u=new URL(value); return u.protocol==='https:' && !u.username && !u.password && !u.port && hosts.some(h=>u.hostname===h||u.hostname.endsWith('.'+h)) ? u.href : ''; } catch { return ''; }
  }
  function validTracks(rows) {
    const identities=new Set();
    return (Array.isArray(rows)?rows:[]).filter(t=>{
      if(!['discovery','deep_cut','reference'].includes(t?.discoveryTier)||!['pt','en','es'].every(lang=>typeof t?.listeningNote?.[lang]==='string'&&t.listeningNote[lang].trim())||!t?.key||!t.artist||!t.song||!t.artistKey||!copy.pt.genres[t.genre]||!safeUrl(t.providerUrl,['music.apple.com'])||!safeUrl(t.previewUrl,['itunes.apple.com'])||!t.evidence?.identityMatch||!t.evidence?.audioHttpChecked)return false;
      const identity=normalize(t.artist)+'::'+normalize(t.song);
      if(identities.has(identity))return false;identities.add(identity);return true;
    });
  }
  function storageKey(profile) { return 'sonic_search:rock_preview:v1:'+String(profile||'local'); }
  function readState(storage,profile) { try{return JSON.parse(storage?.getItem(storageKey(profile))||'{}')||{};}catch{return {};} }
  function writeState(storage,profile,state) {try{storage.setItem(storageKey(profile),JSON.stringify(state));return true;}catch{return false;} }
  function createModel(tracks,state={},random=Math.random) {
    const keys=new Set(tracks.map(t=>t.key));
    const asKeys = v => new Set((Array.isArray(v)?v:[]).filter(k=>keys.has(k)));
    const seen=asKeys(state.seen),likes=asKeys(state.likes);
    let lastArtist=String(state.lastArtist||'');
    let includeReferences=state.includeReferences===true;
    const pool=genre=>tracks.filter(t=>(!genre||t.genre===genre)&&(includeReferences||t.discoveryTier!=='reference'));
    return {
      pool,likes,seen,
      get includeReferences(){return includeReferences;},
      setIncludeReferences(value){includeReferences=value===true;},
      next(genre='') {
        let available=pool(genre).filter(t=>!seen.has(t.key));
        if(!available.length)return null;
        const other=available.filter(t=>t.artistKey!==lastArtist);if(other.length)available=other;
        // Give underexposed artists their turn before returning to their other recordings.
        const counts=new Map();for(const t of tracks)if(seen.has(t.key))counts.set(t.artistKey,(counts.get(t.artistKey)||0)+1);
        const min=Math.min(...available.map(t=>counts.get(t.artistKey)||0));
        available=available.filter(t=>(counts.get(t.artistKey)||0)===min);
        const likedGenres=new Set(tracks.filter(t=>likes.has(t.key)).map(t=>t.genre));
        const weighted=available.flatMap(t=>Array((t.discoveryTier==='discovery'?3:t.discoveryTier==='deep_cut'?2:1)*(!genre&&likedGenres.has(t.genre)?2:1)).fill(t));
        const track=weighted[Math.min(weighted.length-1,Math.max(0,Math.floor(random()*weighted.length)))];
        seen.add(track.key);lastArtist=track.artistKey;return track;
      },
      toggleLike(key){if(!keys.has(key))return;likes.has(key)?likes.delete(key):likes.add(key);},
      restart(genre=''){for(const t of pool(genre))seen.delete(t.key);},
      snapshot(){return {seen:[...seen],likes:[...likes],lastArtist,includeReferences};}
    };
  }
  function mount(panel,adapter) {
    if(!panel)return null;
    const doc=scope.document;
    let tracks=[],model=null,current=null,genre='',loading=null,generation=0,statusKey='ready',storage;
    try{storage=scope.localStorage;}catch{}
    let profile=adapter.getProfileKey();
    const c=()=>copy[adapter.getLanguage()]||copy.pt;
    const make=(tag,cls,text)=>{const e=doc.createElement(tag);if(cls)e.className=cls;if(text)e.textContent=text;return e;};
    const button=(cls,fn)=>{const b=make('button',cls);b.type='button';b.addEventListener('click',fn);return b;};
    const back=button('rock-back',()=>adapter.navigate('discover'));
    const header=make('header','rock-heading'),badge=make('p','rock-kicker'),title=make('h2'),intro=make('p','rock-intro'),count=make('p','rock-count');
    title.id='rockTitle';title.tabIndex=-1;header.append(badge,title,intro,count);
    const filters=make('div','rock-filters');filters.setAttribute('role','group');
    const preference=make('label','rock-preference'),references=make('input'),preferenceText=make('span');references.type='checkbox';references.addEventListener('change',()=>{model?.setIncludeReferences(references.checked);choose();render();});preference.append(references,preferenceText);
    const message=make('p','rock-message');message.setAttribute('role','status');
    const retry=button('rock-retry',()=>void open());retry.hidden=true;
    const card=make('article','rock-card');card.hidden=true;
    const artwork=make('img','rock-art');artwork.alt='';artwork.decoding='async';artwork.loading='lazy';
    artwork.addEventListener('error',()=>{artwork.hidden=true;});
    const text=make('div','rock-track-text'),style=make('p','rock-kicker'),song=make('h3'),artist=make('p','rock-artist'),album=make('p','rock-album');
    song.id='rockTrackTitle';song.tabIndex=-1;card.setAttribute('aria-labelledby',song.id);text.append(style,song,artist,album);
    const editorial=make('div','rock-editorial'),tier=make('p','rock-tier'),noteTitle=make('strong'),listeningNote=make('p');editorial.append(tier,noteTitle,listeningNote);
    const audio=make('audio');audio.preload='none';audio.setAttribute('playsinline','');audio.id='rockAudio';
    const playbackStatus=make('p','rock-playback-status');playbackStatus.setAttribute('role','status');
    const controls=make('div','rock-controls');
    const play=button('rock-play',()=>void playCurrent()),like=button('rock-like',()=>{if(!current)return;model.toggleLike(current.key);persist();adapter.onChange?.();renderActions();renderSaved();}),next=button('rock-next',()=>choose());
    controls.append(play,like,next);
    const provider=make('a','rock-provider');provider.target='_blank';provider.rel='noopener noreferrer';provider.addEventListener('click',stop);
    const note=make('p','rock-note'),progress=make('p','rock-progress');
    card.append(artwork,text,editorial,audio,controls,playbackStatus,provider,note,progress);
    const end=make('div','rock-end'),endTitle=make('h3'),endText=make('p'),restart=button('rock-restart',()=>{model?.restart(genre);choose();});end.append(endTitle,endText,restart);end.hidden=true;
    const saved=make('details','rock-saved'),savedTitle=make('summary'),savedNote=make('p','rock-note'),savedList=make('div','rock-saved-list');saved.append(savedTitle,savedNote,savedList);
    const storageWarning=make('p','rock-note');storageWarning.setAttribute('role','status');storageWarning.hidden=true;
    panel.replaceChildren(back,header,filters,preference,message,retry,card,end,saved,storageWarning);
    function syncAudio(state=adapter.getAudioState?.()||{}) { audio.muted=Boolean(state.muted);audio.volume=Math.max(0,Math.min(1,Number.isFinite(state.volume)?state.volume:0.8)); }
    function persist(){if(model&&!writeState(storage,profile,model.snapshot())){storageWarning.textContent=c().storageError;storageWarning.hidden=false;}}
    function stop(){generation++;audio.pause();audio.removeAttribute('src');audio.load();statusKey='ready';renderActions();}
    function renderActions(){
      play.textContent=!audio.paused?c().pause:c().play;
      const liked=Boolean(current&&model?.likes.has(current.key));like.textContent=liked?'♥ '+c().liked:'♡ '+c().like;like.setAttribute('aria-pressed',String(liked));
      next.textContent=c().next;playbackStatus.textContent=c()[statusKey]||'';
    }
    function renderSaved(){
      savedTitle.textContent=`${c().saved} (${model?.likes.size||0})`;savedNote.textContent=c().savedNote;savedList.replaceChildren();
      const liked=tracks.filter(t=>model?.likes.has(t.key));
      if(!liked.length){savedList.append(make('p','rock-note',c().emptySaved));return;}
      for(const t of liked){const b=button('rock-saved-track',()=>{stop();current=t;renderTrack();song.focus({preventScroll:true});card.scrollIntoView({block:'nearest'});});b.textContent=`${t.song} — ${t.artist}`;savedList.append(b);}
    }
    function renderTrack(){
      card.hidden=!current;end.hidden=Boolean(current)||!model;
      if(current){
        song.textContent=current.song;artist.textContent=current.artist;album.textContent=current.releaseTitle;
        tier.textContent=c().tiers[current.discoveryTier];noteTitle.textContent=c().curator;listeningNote.textContent=current.listeningNote[adapter.getLanguage()]||current.listeningNote.pt;
        style.textContent=c().genres[current.genre]+(current.explicit?' · '+c().explicit:'');
        const cover=safeUrl(current.coverUrl,['mzstatic.com']);artwork.hidden=!cover;if(cover&&artwork.getAttribute('src')!==cover)artwork.src=cover;
        provider.href=current.providerUrl;provider.textContent=c().provider;note.textContent=c().note;
        const p=model.pool(genre);progress.textContent=c().progress(p.filter(t=>model.seen.has(t.key)).length,p.length);
      }
      endTitle.textContent=c().end;endText.textContent=c().endText;restart.textContent=c().restart;renderActions();
    }
    function renderFilters(){
      filters.setAttribute('aria-label',c().all);filters.replaceChildren();
      for(const [key,label] of [['',c().all],...Object.entries(c().genres)]){
        if(key&&tracks.length&&!tracks.some(t=>t.genre===key))continue;
        const b=button('rock-filter',()=>{if(genre===key)return;genre=key;choose();render();filters.querySelector('[aria-pressed="true"]')?.focus({preventScroll:true});});
        b.textContent=label;b.setAttribute('aria-pressed',String(genre===key));b.dataset.genre=key;filters.append(b);
      }
    }
    function render(){
      back.textContent='← '+c().back;badge.textContent=c().badge;title.textContent=c().title;intro.textContent=c().intro;
      const active=model?.pool(genre)||[];count.textContent=active.length?c().count(active.length,new Set(active.map(t=>t.artistKey)).size):'';
      preferenceText.textContent=c().includeReferences;references.checked=Boolean(model?.includeReferences);references.disabled=!model;
      doc.querySelectorAll('[data-rock-copy]').forEach(el=>{el.textContent=c()[el.dataset.rockCopy]||'';});
      retry.textContent=c().retry;renderFilters();renderTrack();renderSaved();
    }
    function choose(){if(!model)return;stop();current=model.next(genre);persist();renderTrack();}
    async function playCurrent(){
      if(!current)return;
      if(!audio.paused){audio.pause();return;}
      const track=current;
      const resumeAt=audio.getAttribute('src')===track.previewUrl&&!audio.ended?audio.currentTime:0;
      adapter.beforePlay(); // Stops every player, including any prior rock request, before setting this source.
      const version=++generation;const owner=profile;
      audio.src=track.previewUrl;syncAudio();
      if(resumeAt>0)try{audio.currentTime=resumeAt;}catch{}
      statusKey='loadingAudio';renderActions();
      try{await audio.play();if(version!==generation||owner!==profile)return;statusKey='playing';renderActions();}
      catch{if(version!==generation||owner!==profile)return;statusKey='audioError';renderActions();}
    }
    audio.addEventListener('play',()=>{statusKey='playing';renderActions();});
    audio.addEventListener('pause',()=>{if(statusKey==='playing')statusKey='ready';renderActions();});
    audio.addEventListener('ended',()=>{statusKey='ended';renderActions();});
    audio.addEventListener('error',()=>{if(!audio.getAttribute('src'))return;statusKey='audioError';renderActions();});
    async function open(){
      if(model){render();return;}
      if(loading)return loading;
      message.hidden=false;message.textContent=c().loading;retry.hidden=true;
      loading=(async()=>{
        try{
          const response=await scope.fetch('data/rock-preview-v1.json?v=20261030rock2',{signal:AbortSignal.timeout(15000)});
          if(!response.ok)throw Error('catalog');const payload=await response.json();tracks=validTracks(payload.tracks);if(!tracks.length)throw Error('empty');
          profile=adapter.getProfileKey();model=createModel(tracks,readState(storage,profile));choose();message.hidden=true;render();
        }catch{message.textContent=c().error;retry.hidden=false;}finally{loading=null;}
      })();return loading;
    }
    doc.getElementById('rockTeaserButton')?.addEventListener('click',()=>adapter.navigate('rock'));
    scope.addEventListener('sonic:stop-universal-playback',stop);
    scope.addEventListener('sonic:profile-changed',()=>{stop();profile=adapter.getProfileKey();current=null;genre='';storageWarning.hidden=true;if(tracks.length){model=createModel(tracks,readState(storage,profile));choose();}render();});
    scope.addEventListener('sonic:language-changed',render);
    scope.addEventListener('pagehide',stop);
    doc.addEventListener('visibilitychange',()=>{if(doc.hidden)stop();});
    render();syncAudio();return {open,stop,syncAudio};
  }
  const api={copy,normalize,safeUrl,validTracks,storageKey,readState,writeState,createModel,mount};
  if(typeof module!=='undefined'&&module.exports)module.exports=api;
  scope.SonicRockPreview=api;
})(typeof window!=='undefined'?window:globalThis);
