(function bootListeningPreview() {
  "use strict";
  const listening = globalThis.SonicUniversalListening;
  const music = globalThis.SonicUniversalMusic;
  const el = id => document.getElementById(id);
  let tracks = [];
  let selectedGroup = "";
  let player = null;
  let playerGeneration = 0;
  let youtubeReady = null;
  let nativePlayerOpen = false;
  const experienceByGroup = new Map();
  const tierLabels = { reference: "Referência", deep_cut: "Aprofundamento", discovery: "Descoberta" };
  function node(tag, text, className) {
    const element = document.createElement(tag);
    if (text) element.textContent = text;
    if (className) element.className = className;
    return element;
  }
  function stopPlayer({ focus = false } = {}) {
    playerGeneration += 1;
    try { player?.destroy(); } catch (_) {}
    player = null;
    el("player-host").replaceChildren();
    el("player-section").hidden = true;
    // The native YouTube modal has its own visible Done/close control.
    if (focus) document.querySelector(".play-button")?.focus();
  }
  function loadYouTube() {
    if (globalThis.YT?.Player) return Promise.resolve(globalThis.YT);
    if (youtubeReady) return youtubeReady;
    youtubeReady = new Promise((resolve, reject) => {
      const previousReady = globalThis.onYouTubeIframeAPIReady;
      const script = node("script");
      script.src = "https://www.youtube.com/iframe_api";
      const timer = setTimeout(() => { script.remove(); youtubeReady = null; reject(new Error("player_timeout")); }, 15000);
      globalThis.onYouTubeIframeAPIReady = () => {
        clearTimeout(timer);
        if (typeof previousReady === "function") previousReady();
        resolve(globalThis.YT);
      };
      script.onerror = () => { clearTimeout(timer); script.remove(); youtubeReady = null; reject(new Error("player_unavailable")); };
      document.head.append(script);
    });
    return youtubeReady;
  }
  function isNativeIos() {
    return globalThis.Capacitor?.getPlatform?.() === "ios"
      || (location.protocol === "capacitor:" && globalThis.Capacitor?.getPlatform?.() !== "android");
  }
  async function listen(track, button) {
    if (!listening.previewEligible(track) || listening.playbackResult(track) === "blocked" || nativePlayerOpen) return;
    stopPlayer();
    const generation = playerGeneration;
    const section = el("player-section");
    section.hidden = false;
    const title = `${track.song} — ${track.artist}`;
    el("playing-title").textContent = title;
    const composer = track.credits?.find(c => c.role === "composer")?.artist;
    el("playing-credits").textContent = [composer ? `Compositor: ${composer}` : "", `Fonte: ${track.evidence.channelName}`].filter(Boolean).join(" · ");
    el("provider-link").href = track.evidence.url;
    el("player-status").textContent = "Preparando o player do YouTube…";
    el("playing-title").focus({ preventScroll: true });
    section.scrollIntoView({ behavior: matchMedia("(prefers-reduced-motion: reduce)").matches ? "instant" : "smooth", block: "start" });
    button.disabled = true;
    try {
      if (isNativeIos()) {
        // Reuse Sonic's native player: WKWebView embeds can reject missing app referrers.
        const plugin = globalThis.Capacitor?.Plugins?.YouTubePlayer;
        const browser = globalThis.Capacitor?.Plugins?.Browser;
        el("player-host").classList.add("native");
        if (plugin?.open) {
          nativePlayerOpen = true;
          try { await plugin.open({ videoId: track.evidence.videoId, title: title.slice(0, 180) }); }
          finally { nativePlayerOpen = false; }
          if (generation === playerGeneration) el("player-status").textContent = "Player do iPhone aberto. Use os controles dele para ouvir e fechar.";
        } else if (browser?.open) {
          await browser.open({ url: track.evidence.url, presentationStyle: "fullscreen" });
          if (generation === playerGeneration) el("player-status").textContent = "Música aberta no YouTube. O player nativo não está disponível nesta versão de teste.";
        } else throw new Error("native_player_unavailable");
        return;
      }
      el("player-host").classList.remove("native");
      const YT = await loadYouTube();
      if (generation !== playerGeneration) return;
      const mount = node("div");
      el("player-host").replaceChildren(mount);
      player = new YT.Player(mount, {
        host: "https://www.youtube-nocookie.com", videoId: track.evidence.videoId,
        playerVars: { playsinline: 1, controls: 1, origin: location.origin, rel: 0 },
        events: {
          onReady(event) {
            if (generation !== playerGeneration) { event.target.destroy(); return; }
            const iframe = event.target.getIframe();
            iframe.title = `YouTube: ${title}`;
            iframe.referrerPolicy = "strict-origin-when-cross-origin";
            el("player-status").textContent = "Player pronto. Toque em reproduzir se necessário.";
            if (!document.hidden) event.target.playVideo();
          },
          onStateChange(event) {
            if (generation !== playerGeneration) return;
            if (event.data === 1) {
              if (document.hidden) { event.target.pauseVideo(); return; }
              el("player-status").textContent = "Reproduzindo no YouTube.";
            } else if (event.data === 2) el("player-status").textContent = "Reprodução pausada.";
            else if (event.data === 0) el("player-status").textContent = "Música concluída.";
          },
          onError(event) {
            if (generation !== playerGeneration) return;
            el("player-status").textContent = `O YouTube não conseguiu reproduzir aqui (código ${event.data}). Você pode abrir a música no link abaixo.`;
          }
        }
      });
    } catch (_) {
      if (generation === playerGeneration) el("player-status").textContent = "Não foi possível carregar o player. Confira sua conexão ou abra esta música no YouTube pelo link abaixo.";
    } finally { button.disabled = false; }
  }
  function renderTracks() {
    const group = listening.groups.find(g => g.slug === selectedGroup);
    if (!group) return;
    const coverage = listening.coverage(tracks, group.slug);
    el("room-heading").textContent = group.label;
    el("coverage-note").textContent = `${coverage.tracks} fontes · ${coverage.artists} artistas · ${coverage.testedPlayableTracks} reproduziram no teste de navegador`;
    const experience = el("experience").value;
    const eligible = tracks.filter(t => t.group === group.slug && listening.previewEligible(t));
    // Preview-only ranking. This clone never enters the public API, user history or DB.
    const ranked = music.rankCandidates(eligible.map(t => ({ ...t, status: "review_preview", playable: true })),
      { primaryUniverse: eligible[0]?.universe, experience }, { limit: 60, perArtistLimit: 2 });
    ranked.sort((a, b) => Number(listening.playbackResult(b.candidate) === "played") - Number(listening.playbackResult(a.candidate) === "played"));
    el("track-list").replaceChildren(...ranked.map(({ candidate }) => {
      // Ranker normalizes keys. Playback must use the original provider identity.
      const track = eligible.find(original => original.evidence.videoId === candidate.evidence.videoId);
      const item = node("li", "", "track");
      const content = node("div");
      content.append(node("h4", track.artist), node("p", track.song, "song"), node("span", tierLabels[track.discoveryTier] || "Seleção", "tier"));
      const composer = track.credits?.find(c => c.role === "composer")?.artist;
      if (composer) content.append(node("p", `Compositor: ${composer}`, "detail"));
      content.append(node("p", `YouTube · ${track.evidence.channelName}${track.explicit ? " · Conteúdo explícito" : ""}`, "detail"));
      const result = listening.playbackResult(track);
      content.append(node("p", result === "played" ? "Reproduziu no teste de navegador · iPhone ainda precisa de teste real"
        : result === "blocked" ? "Bloqueada no teste de incorporação · outra fonte em revisão" : "Reprodução ainda não confirmada", "detail"));
      if (result === "blocked") {
        const link = node("a", "Abrir no YouTube", "external-source");
        link.href = track.evidence.url; link.target = "_blank"; link.rel = "noopener noreferrer";
        link.setAttribute("aria-label", `Abrir ${track.song}, de ${track.artist}, fora do Sonic no YouTube`);
        item.append(content, link); return item;
      }
      const button = node("button", "", "play-button");
      button.type = "button";
      button.setAttribute("aria-label", `Ouvir ${track.song}, de ${track.artist}`);
      const svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
      svg.setAttribute("viewBox", "0 0 16 16"); svg.setAttribute("aria-hidden", "true");
      const path = document.createElementNS(svg.namespaceURI, "path"); path.setAttribute("d", "M4 2L14 8L4 14Z"); svg.append(path);
      button.append(svg, node("span", result === "played" ? "Ouvir" : "Testar fonte"));
      button.addEventListener("click", () => listen(track, button));
      item.append(content, button); return item;
    }));
    el("load-status").textContent = ranked.length ? "" : "Nenhuma música com fonte de reprodução válida nesta seleção.";
    document.querySelectorAll("#genre-nav button").forEach(b => b.setAttribute("aria-pressed", String(b.dataset.group === selectedGroup)));
  }
  function selectGroup(group) {
    experienceByGroup.set(selectedGroup, el("experience").value);
    selectedGroup = group;
    el("experience").value = experienceByGroup.get(group) || "beginner";
    stopPlayer(); renderTracks();
  }
  async function loadCatalog() {
    el("retry-load").hidden = true;
    el("load-status").textContent = "Conferindo as fontes de reprodução…";
    try {
      const response = await fetch("data/universal-listening-pilot.json", { cache: "no-store", signal: AbortSignal.timeout(15000) });
      if (!response.ok) throw new Error("catalog_unavailable");
      const dataset = await response.json();
      if (dataset.schemaVersion !== 1 || !Array.isArray(dataset.tracks)) throw new Error("invalid_catalog");
      tracks = dataset.tracks.filter(t => listening.previewEligible(t));
      const available = listening.groups.filter(g => listening.coverage(tracks, g.slug).previewReady);
      if (!available.length) throw new Error("catalog_requires_refresh");
      el("genre-nav").replaceChildren(...available.map(g => {
        const button = node("button", g.label);
        button.type = "button"; button.dataset.group = g.slug;
        button.addEventListener("click", () => selectGroup(g.slug)); return button;
      }));
      const requested = new URLSearchParams(location.search).get("genre");
      selectedGroup = available.some(g => g.slug === requested) ? requested : available[0].slug;
      renderTracks();
    } catch (_) {
      el("room-heading").textContent = "Vamos tentar novamente?";
      el("load-status").textContent = "Não foi possível obter uma seleção válida. Confira sua conexão; as fontes também podem precisar de uma nova verificação.";
      el("retry-load").hidden = false;
    }
  }
  el("experience").addEventListener("change", renderTracks);
  el("stop-player").addEventListener("click", () => stopPlayer({ focus: true }));
  el("retry-load").addEventListener("click", loadCatalog);
  document.addEventListener("visibilitychange", () => { if (document.hidden) { try { player?.pauseVideo(); } catch (_) {} } });
  window.addEventListener("pagehide", () => stopPlayer());
  loadCatalog();
})();
