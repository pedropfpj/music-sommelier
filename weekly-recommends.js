(function installWeeklyRecommends(scope) {
  "use strict";
  const START = "2026-09-16", WEEK = 7 * 86400000;
  const startMs = Date.parse(`${START}T00:00:00Z`);
  const text = (pt, en, es) => ({ pt, en, es });
  const special = [
    { artist: "N3XU5", title: "Scanner Darkly", style: "dark_psy", tag: "Darkpsy / Forest", url: "https://moonkoradjirecords.bandcamp.com/track/n3xu5-scanner-darkly", note: text("O encontro entre as texturas forest e a atmosfera cyberpunk de Chrome.", "Forest textures meet the cyberpunk atmosphere of Chrome.", "Texturas forest y la atmósfera cyberpunk de Chrome."), releaseDate: "2026-02-12" },
    { artist: "Piazer & Creepy Deep", title: "Not A Lullaby", style: "dark_psy", tag: "Darkpsy / Night", url: "https://sangomarecs.bandcamp.com/track/not-a-lullaby", note: text("Uma escolha de Ode to the Abyss, compilação da Sangoma que explora a fronteira entre groove e escuridão.", "From Sangoma’s Ode to the Abyss, a compilation exploring the border between groove and darkness.", "De Ode to the Abyss de Sangoma, una compilación entre groove y oscuridad."), releaseDate: "2026-07-10" },
    { artist: "Arcek & Hyperactive 25", title: "Wicked Wicked Some People Saying Saying Saying Wicked", style: "hi_tech", tag: "Hi-Tech / Psycore", url: "https://multidimensionalmusic.bandcamp.com/track/arcek-hyperactive-25-wicked-wicked-some-people-saying-saying-saying-wicked", note: text("O lado Hi-Tech / Psycore do radar, com a dupla reunida no EP Hyzek.", "The Hi-Tech / Psycore side of the radar, from the duo’s Hyzek EP.", "El lado Hi-Tech / Psycore del radar, del EP Hyzek de la dupla."), releaseDate: "2026-03-11" },
    { artist: "Komfuzius", title: "Rotor Symphony", style: "hi_tech", tag: "Hi-Tech · 212 BPM", url: "https://osom-music.bandcamp.com/track/rotor-symphony-212bpm", note: text("O ponto de maior velocidade desta seleção: 212 BPM, no álbum The Renaissance.", "This selection’s fastest point: 212 BPM, from The Renaissance.", "El punto más veloz de esta selección: 212 BPM, de The Renaissance."), releaseDate: "2025-04-06" },
    { artist: "Tengri", title: "Ritual of Dust", style: "forest_psy", tag: "Forest", url: "https://beatspace-parvati.bandcamp.com/track/ritual-of-dust", note: text("A abertura de Gipsy Bag leva ao universo orgânico e atmosférico de Tengri, pela Parvati.", "Gipsy Bag’s opening track introduces Tengri’s organic, atmospheric world on Parvati.", "La apertura de Gipsy Bag presenta el universo orgánico y atmosférico de Tengri en Parvati."), releaseDate: "2026-03-13" },
    { artist: "Dylalien", title: "Portal Party Mix 5000", style: "forest_psy", tag: "Westpsy / Forest", url: "https://moonkoradjirecords.bandcamp.com/track/dylalien-portal-party-mix-5000", note: text("Uma entrada no psytrance pouco convencional de B. Whalian, do integrante do Fractal Cowboys.", "A doorway into the unconventional psytrance of B. Whalian, by the Fractal Cowboys member.", "Una entrada al psytrance poco convencional de B. Whalian, del integrante de Fractal Cowboys."), releaseDate: "2026-06-04" }
  ].map((track, i) => ({ ...track, id: `psy-radar-1:${i}` }));

  function weekIndex(now = new Date()) {
    const parts = new Intl.DateTimeFormat("en-CA", { timeZone: "America/Sao_Paulo", year: "numeric", month: "2-digit", day: "2-digit" }).formatToParts(now);
    const part = type => parts.find(p => p.type === type).value;
    return Math.max(0, Math.floor((Date.parse(`${part("year")}-${part("month")}-${part("day")}T00:00:00Z`) - startMs) / WEEK));
  }
  function weekDate(index) { return new Date(startMs + Math.max(0, index) * WEEK).toISOString().slice(0, 10); }
  function parseEdition(value, current) {
    if (!/^\d{4}-\d{2}-\d{2}$/.test(value || "")) return current;
    const index = (Date.parse(`${value}T00:00:00Z`) - startMs) / WEEK;
    return Number.isInteger(index) && index >= 0 && index <= current ? index : current;
  }
  function hash(value) { let h = 2166136261; for (const c of value) h = Math.imul(h ^ c.charCodeAt(0), 16777619); return h >>> 0; }
  function ordered(rows, salt) { return [...rows].sort((a, b) => hash(salt + a.id) - hash(salt + b.id) || (a.id < b.id ? -1 : a.id > b.id ? 1 : 0)); }
  function rotated(rows, offset) { if (!rows.length) return []; const n = offset % rows.length; return [...rows.slice(n), ...rows.slice(0, n)]; }
  function choose(rows, index, count, usedArtists = new Set(), usedTracks = new Set()) {
    const result = [], candidates = rotated(ordered(rows, "sonic-weekly-v1"), index * (rows.length <= count ? 1 : count));
    for (const uniqueArtists of [true, false]) {
      for (const t of candidates) {
        const artist = t.artist.toLowerCase(), key = t.url || `${artist}|${t.title.toLowerCase()}`;
        if (result.length === count) return result;
        if (usedTracks.has(key) || (uniqueArtists && usedArtists.has(artist))) continue;
        result.push(t); usedArtists.add(artist); usedTracks.add(key);
      }
    }
    return result;
  }
  function selection(data, index, filter = "all") {
    if (filter === "psy-radar") return special;
    const date = weekDate(index);
    const tracks = data.tracks.filter(t => !t.releaseDate || t.releaseDate <= date);
    if (filter !== "all") return choose(tracks.filter(t => t.style === filter), index, 6);
    const groups = [...new Set(data.styles.map(s => s.group))];
    const usedArtists = new Set(), usedTracks = new Set(), result = [];
    for (const group of rotated(groups, index * 6)) {
      const styles = new Set(data.styles.filter(s => s.group === group).map(s => s.id));
      result.push(...choose(tracks.filter(t => styles.has(t.style) && !usedArtists.has(t.artist.toLowerCase())), index, 1, usedArtists, usedTracks));
      if (result.length >= 6) break;
    }
    return result;
  }
  function safeLink(value) {
    try {
      const u = new URL(value);
      if (u.protocol !== "https:" || u.username || u.password) return "";
      if (u.hostname.endsWith(".bandcamp.com") && /^\/track\//.test(u.pathname)) return u.href;
      if (u.hostname === "www.deezer.com" && /^\/track\/\d+$/.test(u.pathname)) return u.href;
      if (u.hostname === "open.spotify.com" && /^\/track\/[\w]+$/.test(u.pathname)) return u.href;
      if (["youtube.com", "www.youtube.com"].includes(u.hostname) && u.pathname === "/watch" && /^[\w-]{11}$/.test(u.searchParams.get("v") || "")) return u.href;
    } catch (_) {}
    return "";
  }
  const copy = {
    pt: { title: "SonicSearch Recomenda", kicker: "DESCOBERTAS DA SEMANA", headline: "Novos sons.\nToda quarta.", intro: "Seis faixas para sair do replay. Uma nova seleção do nosso catálogo a cada quarta-feira.", cadence: "TODA QUARTA", all: "Misturar estilos", style: "Escolha seu estilo", special: "Especial · Psytrance Radar #1", edition: "Edição", count: "faixas para explorar", back: "Voltar para Descobrir", prev: "Edição anterior", next: "Próxima edição", upcoming: "Próxima seleção", dateNote: "Horário de Brasília", listen: "Ouvir no", search: "Buscar no YouTube", share: "Compartilhar seleção", copied: "Seleção copiada!", manualCopy: "Selecione e copie o texto abaixo.", loading: "Preparando as descobertas…", error: "Não foi possível carregar a seleção. Tente novamente.", retry: "Tentar novamente", empty: "Ainda não há faixas disponíveis para este estilo nesta edição.", note: "Seleções automáticas do catálogo SonicSearch, com até seis faixas por estilo. Descobertas podem incluir músicas de outras épocas; a data é da seleção. Links abrem na plataforma indicada.", specialNote: "Edição especial com fontes das gravadoras. Os estilos são recortes de curadoria, e as datas de lançamento aparecem em cada faixa.", launch: "Lançamento", why: "Do catálogo SonicSearch, uma porta de entrada para", archive: "Seleção da semana", open: "Explorar a semana", teaser: "Seu encontro de quarta com novas frequências.", read: "Seleção disponível", small: "Este estilo tem uma base menor. Algumas faixas podem voltar em outras semanas." },
    en: { title: "SonicSearch Recommends", kicker: "WEEKLY DISCOVERIES", headline: "New sounds.\nEvery Wednesday.", intro: "Six tracks to break the replay. A fresh selection from our catalog every Wednesday.", cadence: "EVERY WEDNESDAY", all: "Mix styles", style: "Choose your style", special: "Special · Psytrance Radar #1", edition: "Edition", count: "tracks to explore", back: "Back to Discover", prev: "Previous edition", next: "Next edition", upcoming: "Next selection", dateNote: "Brasília time", listen: "Listen on", search: "Search YouTube", share: "Share selection", copied: "Selection copied!", manualCopy: "Select and copy the text below.", loading: "Preparing discoveries…", error: "Could not load the selection. Please try again.", retry: "Try again", empty: "No tracks are available for this style in this edition yet.", note: "Automatic selections from the SonicSearch catalog, with up to six tracks per style. Discoveries can include older music; the date refers to the selection. Links open on the named platform.", specialNote: "A special edition with label sources. Styles reflect the editorial selection; release dates are shown on each track.", launch: "Released", why: "From the SonicSearch catalog, a doorway into", archive: "This week’s selection", open: "Explore this week", teaser: "Your Wednesday date with new frequencies.", read: "Selection available", small: "This style has a smaller catalog. Some tracks may return in other weeks." },
    es: { title: "SonicSearch Recomienda", kicker: "DESCUBRIMIENTOS SEMANALES", headline: "Nuevos sonidos.\nCada miércoles.", intro: "Seis temas para salir del replay. Una nueva selección del catálogo cada miércoles.", cadence: "CADA MIÉRCOLES", all: "Mezclar estilos", style: "Elige tu estilo", special: "Especial · Psytrance Radar #1", edition: "Edición", count: "temas para explorar", back: "Volver a Descubrir", prev: "Edición anterior", next: "Próxima edición", upcoming: "Próxima selección", dateNote: "Hora de Brasilia", listen: "Escuchar en", search: "Buscar en YouTube", share: "Compartir selección", copied: "¡Selección copiada!", manualCopy: "Selecciona y copia el texto de abajo.", loading: "Preparando descubrimientos…", error: "No se pudo cargar la selección. Inténtalo de nuevo.", retry: "Reintentar", empty: "Todavía no hay temas disponibles para este estilo en esta edición.", note: "Selecciones automáticas del catálogo SonicSearch, con hasta seis temas por estilo. Pueden incluir música de otras épocas; la fecha es de la selección. Los enlaces abren la plataforma indicada.", specialNote: "Edición especial con fuentes de los sellos. Los estilos son criterios editoriales; cada tema muestra su fecha de lanzamiento.", launch: "Lanzamiento", why: "Del catálogo SonicSearch, una puerta de entrada a", archive: "Selección de la semana", open: "Explorar la semana", teaser: "Tu encuentro de los miércoles con nuevas frecuencias.", read: "Selección disponible", small: "Este estilo tiene un catálogo menor. Algunos temas pueden volver en otras semanas." }
  };
  const escape = value => String(value ?? "").replace(/[&<>"']/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));

  function mount(root, { getLanguage = () => "pt", navigate = () => {}, beforeListen = () => {} } = {}) {
    if (!root) return null;
    let data = null, pending = null, failed = false, current = weekIndex();
    const params = new URLSearchParams(scope.location.search);
    let index = parseEdition(params.get("edition"), current), filter = params.get("weeklyStyle") || "all";
    let pinned = params.has("edition"), lastSignature = "";
    const lang = () => copy[getLanguage()] ? getLanguage() : "pt";
    const c = () => copy[lang()];
    const dateLabel = date => new Intl.DateTimeFormat({ pt: "pt-BR", en: "en-GB", es: "es-ES" }[lang()], { day: "2-digit", month: "short", year: "numeric", timeZone: "UTC" }).format(new Date(`${date}T12:00:00Z`));
    function refreshEntry() {
      const values = { weeklyTeaserKicker: c().cadence, weeklyTeaserTitle: c().title, weeklyTeaserText: c().teaser, weeklyTeaserOpen: c().open, moreRecommendsKicker: c().kicker, moreRecommendsTitle: c().title, moreRecommendsDescription: c().teaser };
      for (const [id, value] of Object.entries(values)) { const el = document.getElementById(id); if (el) el.textContent = value; }
    }
    function render() {
      const focused = root.contains(document.activeElement) ? document.activeElement.id : "";
      const t = c(), isSpecial = filter === "psy-radar", date = isSpecial ? START : weekDate(index);
      const items = data ? selection(data, index, filter) : [];
      const groups = data ? [...new Set(data.styles.map(s => s.group))] : [];
      const options = `<option value="all">${t.all}</option><option value="psy-radar">${t.special}</option>` + groups.map(group => `<optgroup label="${escape(group)}">${data.styles.filter(s => s.group === group).map(s => `<option value="${escape(s.id)}">${escape(s.label)}</option>`).join("")}</optgroup>`).join("");
      root.innerHTML = `
        <button id="weeklyBack" type="button" class="weekly-back">← ${t.back}</button>
        <header class="weekly-hero">
          <div class="weekly-hero-copy"><p class="weekly-kicker">${t.kicker}</p><h3 id="weeklyRecommendsTitle">${t.title}</h3><p class="weekly-headline">${t.headline.replace("\n", "<br>")}</p><p class="weekly-intro">${t.intro}</p></div>
          <div class="weekly-record" aria-hidden="true"><span>SS<span>SELECTS</span></span><i></i></div>
          <div class="weekly-cadence"><span class="weekly-live-dot"></span>${t.cadence}<span> / </span>${t.dateNote}</div>
        </header>
        <div class="weekly-toolbar"><div><label for="weeklyStyleSelect">${t.style}</label><select id="weeklyStyleSelect">${options}</select></div><button id="weeklyShare" class="weekly-share" type="button" ${!items.length ? "disabled" : ""}>${t.share} ↗</button></div>
        <div class="weekly-edition"><div><p>${isSpecial ? "PSYTRANCE RADAR #1" : `${t.edition} ${String(index + 1).padStart(3, "0")}`}</p><h4>${dateLabel(date)}</h4></div><span>${data ? items.length : "—"} ${t.count}</span><div class="weekly-edition-nav"><button id="weeklyPrev" type="button" aria-label="${t.prev}" ${index === 0 || isSpecial ? "disabled" : ""}>←</button><button id="weeklyNext" type="button" aria-label="${t.next}" ${index >= current || isSpecial ? "disabled" : ""}>→</button></div></div>
        <p id="weeklyStatus" class="weekly-status" role="status">${!data ? failed ? t.error : t.loading : items.length === 0 ? t.empty : (items.length < 6 || (filter !== "all" && !isSpecial && data.tracks.filter(track => track.style === filter).length <= 6)) ? t.small : ""}</p>
        ${failed ? `<button id="weeklyRetry" class="weekly-share" type="button">${t.retry}</button>` : ""}
        <ol class="weekly-track-list">${items.map((track, i) => {
          const style = data.styles.find(s => s.id === track.style)?.label || track.style;
          const direct = safeLink(track.url);
          const url = direct || `https://www.youtube.com/results?search_query=${encodeURIComponent(`${track.artist} ${track.title}`)}`;
          const provider = direct.includes("bandcamp.com") ? "Bandcamp" : direct.includes("deezer.com") ? "Deezer" : direct.includes("spotify.com") ? "Spotify" : "YouTube";
          const listen = direct ? `${t.listen} ${provider}` : t.search;
          const reason = track.note?.[lang()] || `${t.why} ${style}.`;
          return `<li class="weekly-track" data-weekly-track="${escape(track.id)}" style="--weekly-track-hue:${[160, 204, 38, 294, 8, 74][i]}"><span class="weekly-track-number" aria-hidden="true">${String(i + 1).padStart(2, "0")}</span><div class="weekly-track-copy"><div class="weekly-track-meta"><span>${escape(track.tag || style)}</span>${track.releaseDate ? `<small>${t.launch} · ${dateLabel(track.releaseDate)}</small>` : ""}</div><p class="weekly-artist">${escape(track.artist)}</p><h5>${escape(track.title)}</h5><p class="weekly-reason">${escape(reason)}</p></div><a class="weekly-listen" href="${escape(url)}" target="_blank" rel="noopener noreferrer" aria-label="${escape(`${listen}: ${track.artist} — ${track.title}`)}">${listen}<span aria-hidden="true">↗</span></a></li>`;
        }).join("")}</ol>
        <div id="weeklyCopyFallback" hidden><label for="weeklyCopyText">${t.manualCopy}</label><textarea id="weeklyCopyText" readonly rows="8"></textarea></div>
        <footer class="weekly-footer"><p>${isSpecial ? t.specialNote : t.note}</p><div><span>${t.upcoming}</span><strong>${dateLabel(weekDate(current + 1))}</strong></div></footer>`;
      root.querySelector("#weeklyStyleSelect").value = filter;
      root.setAttribute("aria-busy", String(!data && !failed));
      if (focused) root.querySelector(`#${focused}`)?.focus({ preventScroll: true });
    }
    async function load() {
      if (data) return;
      if (pending) return pending;
      failed = false; render();
      pending = (async () => {
        try {
          const controller = new AbortController();
          const timeout = scope.setTimeout(() => controller.abort(), 15000);
          let response;
          try { response = await fetch("data/weekly-catalog-v1.json?v=20260916weekly1", { cache: "force-cache", signal: controller.signal }); }
          finally { scope.clearTimeout(timeout); }
          if (!response.ok) throw new Error("weekly_catalog_unavailable");
          const result = await response.json();
          if (result.version !== 1 || !Array.isArray(result.styles) || !Array.isArray(result.tracks)) throw new Error("weekly_catalog_invalid");
          data = result;
          if (!["all", "psy-radar", ...data.styles.map(s => s.id)].includes(filter)) filter = "all";
        } catch (_) { failed = true; }
        finally { pending = null; render(); }
      })();
      return pending;
    }
    async function share() {
      if (!data) return;
      const t = c(), date = filter === "psy-radar" ? START : weekDate(index);
      const url = new URL("https://sonicsearch.app/");
      url.searchParams.set("tab", "recommends"); url.searchParams.set("edition", date); url.searchParams.set("weeklyStyle", filter);
      const content = `${t.title} · ${dateLabel(date)}\n\n` + selection(data, index, filter).map((track, i) => `${i + 1}. ${track.artist} — ${track.title}\n${safeLink(track.url) || `https://www.youtube.com/results?search_query=${encodeURIComponent(`${track.artist} ${track.title}`)}`}`).join("\n\n");
      try {
        if (navigator.share) { await navigator.share({ title: t.title, text: content, url: url.href }); return; }
        await navigator.clipboard.writeText(`${content}\n\n${url.href}`);
        root.querySelector("#weeklyStatus").textContent = t.copied;
      } catch (error) {
        if (error.name === "AbortError") return;
        root.querySelector("#weeklyCopyFallback").hidden = false;
        const field = root.querySelector("#weeklyCopyText"); field.value = `${content}\n\n${url.href}`; field.focus(); field.select();
      }
    }
    function refresh() {
      const next = weekIndex();
      if (next !== current) { current = next; if (!pinned) index = next; }
      refreshEntry();
      const signature = [lang(), current, index, filter].join("|");
      if (signature !== lastSignature) { lastSignature = signature; render(); }
    }
    root.addEventListener("click", event => {
      const link = event.target.closest(".weekly-listen"); if (link) beforeListen();
      const id = event.target.closest("button")?.id;
      if (id === "weeklyBack") navigate("discover");
      if (id === "weeklyRetry") void load();
      if (id === "weeklyShare") void share();
      if (id === "weeklyPrev" && index > 0) { index--; pinned = true; render(); }
      if (id === "weeklyNext" && index < current) { index++; pinned = index !== current; render(); }
    });
    root.addEventListener("change", event => { if (event.target.id === "weeklyStyleSelect") { filter = event.target.value; render(); } });
    document.getElementById("weeklyTeaserButton")?.addEventListener("click", () => navigate("recommends"));
    document.addEventListener("visibilitychange", () => { if (!document.hidden) refresh(); });
    scope.addEventListener("focus", refresh);
    // Also updates a page left open across midnight on Wednesday.
    scope.setInterval(() => { if (!document.hidden && weekIndex() !== current) refresh(); }, 60000);
    refresh();
    return { open() { refresh(); return load(); }, refresh };
  }
  const api = Object.freeze({ START, weekIndex, weekDate, parseEdition, selection, safeLink, special, mount });
  if (typeof module !== "undefined" && module.exports) module.exports = api;
  else scope.SonicWeeklyRecommends = api;
})(typeof window !== "undefined" ? window : globalThis);
