(function installUniversalDiscoveryUi(scope) {
  "use strict";
  function mount(root, { getProfileKey = () => "", getLanguage = () => "pt", beforePlay = () => {} } = {}) {
    if (!root || !scope.SonicUniversalDiscovery.previewEnabled(location, scope.SONIC_MULTI_UNIVERSE_UI_ENABLED === true)) return null;
    const model = scope.SonicUniversalDiscovery, listening = scope.SonicUniversalListening;
    let tracks = [], catalog = [], state = model.normalizeState(), scopeKey = "", current = null, selection = null, player = null, generation = 0, loadEpoch = 0, ytReady = null, nativeBusy = false;
    const groupLabels = {
      en: { rock: "Rock and metal", indie: "Indie and post-punk", rap: "Hip-hop and rap", trap: "Trap", reggae: "Reggae, dub and ska", reggaeton: "Reggaeton", forro: "Forró", samba: "Samba", classical: "Classical music", pop: "Pop", soul: "R&B, soul and funk", jazz: "Jazz and blues", brazilian: "Brazilian music", latin: "Latin and Caribbean", global: "African and global", folk: "Folk, country and traditions", ambient: "Ambient and soundtracks" },
      es: { rock: "Rock y metal", indie: "Indie y post-punk", rap: "Hip-hop y rap", trap: "Trap", reggae: "Reggae, dub y ska", reggaeton: "Reggaeton", forro: "Forró", samba: "Samba", classical: "Música clásica", pop: "Pop", soul: "R&B, soul y funk", jazz: "Jazz y blues", brazilian: "Música brasileña", latin: "Latina y caribeña", global: "Africana y global", folk: "Folk, country y tradiciones", ambient: "Ambient y bandas sonoras" }
    };
    const copies = {
      pt: { kicker: "EXPANSÃO EM TESTE", title: "Seu Sonic, outros sons.", intro: "Escolha um estilo. Ouça uma fonte testada e ensine o Sonic com suas reações.", style: "O que você quer explorar?", experience: "Quanto você conhece este estilo?", beginner: "Estou começando", familiar: "Já conheço e quero explorar", expert: "Quero nomes menos óbvios", play: "Ouvir no player", next: "Outra recomendação", like: "Curti", pass: "Não combinou", known: "Já conhecia", block: "Ocultar artista", close: "Fechar player", history: "Minhas reações nesta prévia", catalog: "Artistas e repertório em revisão", empty: "As fontes testadas desta seleção acabaram ou estão em revisão. Não vamos trocar seu estilo nem repetir descartes.", loading: "Conferindo catálogo e fontes…", retry: "Tentar novamente", error: "Não foi possível carregar a seleção. Confira sua conexão e tente novamente.", scope: "Reações desta prévia ficam neste navegador e perfil. Ainda não entram no Radar, Premium ou histórico público.", source: "Fonte", opening: "Preparando o player…", ready: "Player pronto. Toque em reproduzir se necessário.", playing: "Reproduzindo no YouTube.", paused: "Reprodução pausada.", ended: "Música concluída.", native: "Player do iPhone aberto; use os controles dele para ouvir e fechar.", playbackError: "Esta fonte não reproduziu aqui. Tente outra recomendação ou abra no YouTube.", external: "Abrir no YouTube", apple: "Abrir referência no Apple Music", clear: "Recomeçar a seleção de teste", evidence: "Reproduziu no teste de navegador; iPhone e disponibilidade regional ainda precisam de validação.", reviewed: "referências de catálogo", tested: "fontes reproduzidas no navegador", artist: "artistas", explicit: "Conteúdo explícito", composer: "Compositor", saved: "Reação salva nesta prévia.", clearDone: "Reações desta seleção de teste limpas." },
      en: { kicker: "EXPANSION PREVIEW", title: "Your Sonic, other sounds.", intro: "Choose a style. Hear a tested source and teach Sonic with your reactions.", style: "What would you like to explore?", experience: "How well do you know this style?", beginner: "I'm just starting", familiar: "I know it and want to explore", expert: "I want less obvious artists", play: "Open player", next: "Another recommendation", like: "Like", pass: "Not for me", known: "Already knew it", block: "Hide artist", close: "Close player", history: "My preview reactions", catalog: "Artists and repertoire under review", empty: "Tested sources are exhausted or under review. We won't switch your style or repeat rejected tracks.", loading: "Checking catalog and sources…", retry: "Try again", error: "Could not load this selection. Check your connection and retry.", scope: "Preview reactions stay in this browser and profile. They do not enter Radar, Premium or public history yet.", source: "Source", opening: "Preparing player…", ready: "Player ready. Tap play if needed.", playing: "Playing on YouTube.", paused: "Playback paused.", ended: "Track finished.", native: "iPhone player opened; use its controls to listen and close.", playbackError: "This source could not play here. Try another recommendation or open YouTube.", external: "Open YouTube", apple: "Open reference on Apple Music", clear: "Restart preview selection", evidence: "Played in browser testing; iPhone and regional availability still need validation.", reviewed: "catalog references", tested: "sources played in browser", artist: "artists", explicit: "Explicit content", composer: "Composer", saved: "Reaction saved in this preview.", clearDone: "Preview reactions for this selection cleared." },
      es: { kicker: "EXPANSIÓN EN PRUEBA", title: "Tu Sonic, otros sonidos.", intro: "Elige un estilo. Escucha una fuente probada y enseña al Sonic con tus reacciones.", style: "¿Qué quieres explorar?", experience: "¿Cuánto conoces este estilo?", beginner: "Estoy empezando", familiar: "Ya conozco y quiero explorar", expert: "Quiero artistas menos obvios", play: "Abrir reproductor", next: "Otra recomendación", like: "Me gustó", pass: "No es para mí", known: "Ya conocía", block: "Ocultar artista", close: "Cerrar reproductor", history: "Mis reacciones en esta prueba", catalog: "Artistas y repertorio en revisión", empty: "Las fuentes probadas se agotaron o están en revisión. No cambiaremos tu estilo ni repetiremos descartes.", loading: "Revisando catálogo y fuentes…", retry: "Reintentar", error: "No se pudo cargar la selección. Revisa tu conexión e inténtalo de nuevo.", scope: "Las reacciones quedan en este navegador y perfil. Aún no entran en Radar, Premium ni historial público.", source: "Fuente", opening: "Preparando reproductor…", ready: "Reproductor listo. Toca reproducir si es necesario.", playing: "Reproduciendo en YouTube.", paused: "Reproducción pausada.", ended: "Canción terminada.", native: "Reproductor del iPhone abierto; utiliza sus controles para escuchar y cerrar.", playbackError: "Esta fuente no pudo reproducirse aquí. Prueba otra recomendación o abre YouTube.", external: "Abrir YouTube", apple: "Abrir referencia en Apple Music", clear: "Reiniciar selección de prueba", evidence: "Reprodujo en pruebas del navegador; falta validar iPhone y disponibilidad regional.", reviewed: "referencias del catálogo", tested: "fuentes reproducidas en navegador", artist: "artistas", explicit: "Contenido explícito", composer: "Compositor", saved: "Reacción guardada en esta prueba.", clearDone: "Reacciones de esta selección de prueba borradas." }
    };
    const copy = () => copies[getLanguage()] || copies.pt;
    const node = (tag, text = "", className = "") => { const n = document.createElement(tag); n.textContent = text; n.className = className; return n; };
    const button = (text, action, className = "") => { const b = node("button", text, className); b.type = "button"; b.addEventListener("click", action); return b; };
    const link = (text, href) => { const a = node("a", text); a.href = href; a.target = "_blank"; a.rel = "noopener noreferrer"; return a; };
    const title = node("h3", "", "universal-title"), intro = node("p"), kicker = node("p", "", "section-kicker");
    title.tabIndex = -1;
    const styles = node("select"), experience = node("select"); styles.id = "universalGenreSelect"; experience.id = "universalExperienceSelect";
    const controls = node("div", "", "universal-controls"), styleLabel = node("label"), experienceLabel = node("label"); styleLabel.htmlFor = styles.id; experienceLabel.htmlFor = experience.id;
    const field = (label, select) => { const d = node("div"); d.append(label, select); return d; };
    controls.append(field(styleLabel, styles), field(experienceLabel, experience));
    const coverage = node("p", "", "universal-muted"), card = node("article", "", "universal-track-card"), status = node("p"); status.setAttribute("role", "status"); status.setAttribute("aria-live", "polite");
    const playerBox = node("section", "", "universal-player"), host = node("div", "", "universal-player-host"), playerStatus = node("p"), playerTitle = node("h4"); playerStatus.setAttribute("role", "status");
    playerBox.hidden = true; playerTitle.tabIndex = -1;
    const close = button("", () => stop()), provider = link("", "https://www.youtube.com/");
    playerBox.append(playerTitle, close, host, playerStatus, provider);
    const historyBox = node("details"), historySummary = node("summary"), historyList = node("ul"), reset = button("", () => {
      state.history = state.history.filter(h => h.group !== state.group);
      state.deliveries = state.deliveries.filter(d => d.group !== state.group); state.deliveryCounts[state.group] = 0;
      persist(); choose(); status.textContent = copy().clearDone;
    }); historyBox.append(historySummary, historyList, reset);
    const catalogBox = node("details"), catalogSummary = node("summary"), catalogList = node("ul"); catalogBox.append(catalogSummary, catalogList);
    const scopeNote = node("p", "", "universal-muted"), retry = button("", () => load()); retry.hidden = true;
    root.replaceChildren(kicker, title, intro, controls, coverage, card, playerBox, status, retry, historyBox, catalogBox, scopeNote);
    root.classList.remove("hidden"); root.hidden = false;
    function storageKey() { return getProfileKey() ? `sonic_search:universalDiscoveryPreview:v1:${getProfileKey()}` : ""; }
    function hydrate() {
      scopeKey = storageKey(); state = model.normalizeState();
      if (scopeKey) try { state = model.normalizeState(JSON.parse(localStorage.getItem(scopeKey) || "{}")); } catch (_) {}
    }
    function persist() { if (scopeKey) try { localStorage.setItem(scopeKey, JSON.stringify(state)); } catch (_) {} }
    function stop() { generation += 1; try { player?.destroy(); } catch (_) {} player = null; host.replaceChildren(); playerBox.hidden = true; }
    function choose() {
      if (storageKey() !== scopeKey) hydrate();
      stop(); selection = model.ranked(tracks, state, { limit: 1 })[0] || null; current = selection?.candidate || null;
      if (current) { state = model.recordDelivery(state, current, new Date().toISOString(), selection.selectionLane); persist(); }
      render();
    }
    function render() {
      const c = copy(); kicker.textContent = c.kicker; title.textContent = c.title; intro.textContent = c.intro;
      styleLabel.textContent = c.style; experienceLabel.textContent = c.experience; scopeNote.textContent = c.scope; retry.textContent = c.retry;
      const groups = model.catalogCoverage(catalog, tracks);
      const pending = { pt: "fontes em revisão", en: "sources under review", es: "fuentes en revisión" }[getLanguage()] || "fontes em revisão";
      styles.replaceChildren(...groups.map(g => { const label = groupLabels[getLanguage()]?.[g.slug] || g.label;
        const o = node("option", g.discoveryReady ? label : `${label} — ${pending}`); o.value = g.slug; o.disabled = !g.discoveryReady; return o; }));
      styles.value = state.group;
      experience.replaceChildren(...["beginner", "familiar", "expert"].map(value => { const o = node("option", c[value]); o.value = value; return o; }));
      experience.value = state.experienceByGroup[state.group] || "beginner";
      const g = groups.find(g => g.slug === state.group);
      const playableCounts = {
        pt: (artists, songs) => `${artists} ${artists === 1 ? "artista" : "artistas"} para ouvir · ${songs} ${songs === 1 ? "música testada" : "músicas testadas"}`,
        en: (artists, songs) => `${artists} ${artists === 1 ? "artist" : "artists"} to listen to · ${songs} tested ${songs === 1 ? "song" : "songs"}`,
        es: (artists, songs) => `${artists} ${artists === 1 ? "artista" : "artistas"} para escuchar · ${songs} ${songs === 1 ? "canción probada" : "canciones probadas"}`
      };
      coverage.textContent = g ? (playableCounts[getLanguage()] || playableCounts.pt)(g.testedPlayableArtists, g.testedPlayableRecordings) : "";
      card.replaceChildren(); status.textContent = "";
      if (current) {
        const artist = node("h4", current.artist), song = node("p", current.song, "universal-song");
        const credits = current.credits?.find(cr => cr.role === "composer")?.artist;
        const detail = node("p", `${credits ? `${c.composer}: ${credits} · ` : ""}${c.source}: YouTube · ${current.evidence.channelName}${current.explicit ? ` · ${c.explicit}` : ""}`, "universal-muted");
        const actions = node("div", "", "universal-actions");
        actions.append(button(c.play, () => play(current), "primary"), button(c.next, () => choose()));
        const reactions = node("div", "", "universal-reactions");
        for (const action of ["like", "pass", "known", "block"]) reactions.append(button(c[action], () => {
          if (!current) return; state = model.react(state, current, action); persist(); choose(); status.textContent = c.saved;
        }));
        const version = current.providerTitle && current.providerTitle !== current.song ? node("p", current.providerTitle, "universal-muted") : node("span");
        card.append(artist, song, version, node("p", model.explanation(current, state, getLanguage(), selection)), detail, node("p", c.evidence, "universal-muted"), actions, reactions);
        card.dataset.trackKey = current.key; card.dataset.artist = current.artist;
      } else { delete card.dataset.trackKey; delete card.dataset.artist; card.append(node("p", c.empty)); }
      historySummary.textContent = c.history; catalogSummary.textContent = g ? `${c.catalog} · ${g.catalogTracks} ${c.reviewed}` : c.catalog; reset.textContent = c.clear;
      historyList.replaceChildren(...state.history.filter(h => h.group === state.group).slice(-20).reverse().map(h => node("li", `${h.artist} — ${h.song} · ${c[h.action]}`)));
      const references = catalog.filter(t => listening.groupForTrack(t) === state.group);
      const artistRows = [...new Set(references.map(t => t.artistKey))];
      catalogList.replaceChildren(...artistRows.map(id => {
        const rows = references.filter(t => t.artistKey === id), li = node("li"); li.append(node("strong", rows[0].artist));
        const p = node("p", rows.map(t => t.song).join(" · ")); li.append(p);
        // A reference link is explicitly external, never a promise of audio.
        if (rows[0].providerLinks?.[0]?.url?.startsWith("https://music.apple.com/")) li.append(link(c.apple, rows[0].providerLinks[0].url));
        return li;
      }));
    }
    async function loadYT() {
      if (scope.YT?.Player) return scope.YT;
      if (ytReady) return ytReady;
      ytReady = new Promise((resolve, reject) => {
        const prev = scope.onYouTubeIframeAPIReady, script = node("script"); script.src = "https://www.youtube.com/iframe_api";
        const timer = setTimeout(() => { script.remove(); ytReady = null; reject(new Error("timeout")); }, 15000);
        scope.onYouTubeIframeAPIReady = () => { clearTimeout(timer); if (typeof prev === "function") prev(); resolve(scope.YT); };
        script.onerror = () => { clearTimeout(timer); script.remove(); ytReady = null; reject(new Error("network")); }; document.head.append(script);
      }); return ytReady;
    }
    async function play(track) {
      if (nativeBusy || listening.playbackResult(track) !== "played") return;
      beforePlay(); stop(); const token = generation; playerBox.hidden = false;
      playerTitle.textContent = `${track.song} — ${track.artist}`; playerStatus.textContent = copy().opening; close.textContent = copy().close;
      provider.textContent = copy().external; provider.href = track.evidence.url; playerTitle.focus({ preventScroll: true });
      try {
        if (scope.Capacitor?.getPlatform?.() === "ios" || location.protocol === "capacitor:") {
          const plugin = scope.Capacitor?.Plugins?.YouTubePlayer;
          if (!plugin?.open) throw new Error("native_player_missing");
          nativeBusy = true; try { await plugin.open({ videoId: track.evidence.videoId, title: playerTitle.textContent.slice(0, 180) }); } finally { nativeBusy = false; }
          if (token === generation) playerStatus.textContent = copy().native; return;
        }
        const YT = await loadYT(); if (token !== generation) return;
        const mount = node("div"); host.replaceChildren(mount);
        player = new YT.Player(mount, { host: "https://www.youtube-nocookie.com", videoId: track.evidence.videoId,
          playerVars: { playsinline: 1, controls: 1, origin: location.origin, rel: 0 }, events: {
            onReady(e) { if (token !== generation) { e.target.destroy(); return; } const iframe = e.target.getIframe(); iframe.title = `YouTube: ${track.song} — ${track.artist}`; iframe.referrerPolicy = "strict-origin-when-cross-origin"; playerStatus.textContent = copy().ready; if (!document.hidden) e.target.playVideo(); },
            onStateChange(e) { if (token !== generation) return; if (e.data === 1 && document.hidden) { e.target.pauseVideo(); return; } playerStatus.textContent = e.data === 1 ? copy().playing : e.data === 2 ? copy().paused : e.data === 0 ? copy().ended : copy().ready; },
            onError() { if (token !== generation) return; playerStatus.textContent = copy().playbackError;
              // A failure in this session removes that source from further picks.
              track.playbackCheck = { url: track.evidence.url, result: "blocked", checkedAt: new Date().toISOString() }; }
          } });
      } catch (_) { if (token === generation) playerStatus.textContent = copy().playbackError; }
    }
    async function load() {
      const token = ++loadEpoch; status.textContent = copy().loading; retry.hidden = true; styles.disabled = experience.disabled = true;
      try {
        const results = await Promise.all(["data/universal-listening-pilot.json", "data/universal-catalog-pilot.json"].map(async url => {
          const response = await fetch(url, { cache: "no-store", signal: AbortSignal.timeout(15000) }); if (!response.ok) throw new Error("catalog");
          const data = await response.json(); if (data.schemaVersion !== 1 || !Array.isArray(data.tracks)) throw new Error("schema"); return data.tracks;
        })); if (token !== loadEpoch) return;
        tracks = results[0].filter(t => listening.previewEligible(t)); catalog = results[1]; choose();
      } catch (_) { if (token === loadEpoch) { status.textContent = copy().error; retry.hidden = false; } }
      finally { if (token === loadEpoch) styles.disabled = experience.disabled = false; }
    }
    styles.addEventListener("change", () => { state.group = styles.value; persist(); choose(); });
    experience.addEventListener("change", () => { state.experienceByGroup[state.group] = experience.value; persist(); choose(); });
    document.addEventListener("visibilitychange", () => { if (document.hidden) try { player?.pauseVideo(); } catch (_) {} });
    scope.addEventListener("sonic:stop-universal-playback", () => stop());
    scope.addEventListener("sonic:profile-changed", () => { hydrate(); choose(); if (root.offsetHeight) title.focus({ preventScroll: true }); });
    scope.addEventListener("sonic:language-changed", () => render());
    scope.addEventListener("pagehide", () => stop());
    hydrate(); load(); return { stop, refresh: () => render() };
  }
  scope.SonicUniversalDiscoveryUi = { mount };
})(globalThis);
