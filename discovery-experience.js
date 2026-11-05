(function (root) {
  "use strict";
  const copy = {
    pt: { search: "Buscar nas suas faixas", placeholder: "Faixa, artista ou estilo", sort: "Ordenar faixas", recent: "Mais recentes", title: "Nome da faixa", artist: "Artista", empty: "Nenhuma faixa encontrada. Tente outro nome ou estilo.", play: "Ouvir aqui", opening: "Abrindo…", unavailable: "Não encontrei um preview desta faixa. Use os links da sua biblioteca para ouvir.", details: "Sobre esta faixa e mais opções", library: "Minhas faixas", outside: "Ouvir nas plataformas", preview: "Preview e fontes de áudio", count: (n, total) => `${n} de ${total} ${total === 1 ? "faixa" : "faixas"}` },
    en: { search: "Search your tracks", placeholder: "Track, artist or style", sort: "Sort tracks", recent: "Most recent", title: "Track name", artist: "Artist", empty: "No tracks found. Try another name or style.", play: "Listen here", opening: "Opening…", unavailable: "No preview found for this track. Use the links in your library to listen.", details: "About this track and more options", library: "My tracks", outside: "Listen on other platforms", preview: "Preview and audio sources", count: (n, total) => `${n} of ${total} ${total === 1 ? "track" : "tracks"}` },
    es: { search: "Buscar en tus pistas", placeholder: "Pista, artista o estilo", sort: "Ordenar pistas", recent: "Más recientes", title: "Nombre de la pista", artist: "Artista", empty: "No se encontraron pistas. Prueba otro nombre o estilo.", play: "Escuchar aquí", opening: "Abriendo…", unavailable: "No encontré un preview de esta pista. Usa los enlaces de tu biblioteca para escuchar.", details: "Sobre esta pista y más opciones", library: "Mis pistas", outside: "Escuchar en otras plataformas", preview: "Preview y fuentes de audio", count: (n, total) => `${n} de ${total} ${total === 1 ? "pista" : "pistas"}` }
  };
  function normalize(value) {
    return String(value || "").normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLocaleLowerCase().trim();
  }
  const webCopy = {
    pt: { share: "Copiar link da faixa", saveHint: "Curta para guardar. Suas faixas ficam neste navegador.", copyManually: "Copie este link para compartilhar", close: "Fechar", shared: "Link da faixa pronto para compartilhar.", opening: "Abrindo a faixa compartilhada…", opened: "Uma descoberta chegou até você. Dê play para ouvir.", missing: "Esta faixa não está disponível no catálogo agora. Você pode ouvir uma nova descoberta.", libraryHint: "Salvas neste navegador. Use Salvar cópia do perfil para levar sua biblioteca a outro dispositivo." },
    en: { share: "Copy track link", saveHint: "Like to save. Your tracks stay in this browser.", copyManually: "Copy this link to share", close: "Close", shared: "Track link ready to share.", opening: "Opening the shared track…", opened: "A discovery found its way to you. Press play to listen.", missing: "This track is not available in the catalog right now. You can listen to a new discovery.", libraryHint: "Saved in this browser. Use Save profile backup to take your library to another device." },
    es: { share: "Copiar enlace de la pista", saveHint: "Dale me gusta para guardar. Tus pistas quedan en este navegador.", copyManually: "Copia este enlace para compartir", close: "Cerrar", shared: "Enlace de la pista listo para compartir.", opening: "Abriendo la pista compartida…", opened: "Una nueva música llegó hasta ti. Pulsa reproducir para escuchar.", missing: "Esta pista no está disponible en el catálogo ahora. Puedes escuchar un nuevo descubrimiento.", libraryHint: "Guardadas en este navegador. Usa Guardar copia del perfil para llevar tu biblioteca a otro dispositivo." }
  };
  function parseTrackLink(value) {
    try {
      const url = new URL(value);
      if (!url.searchParams.has("track")) return null;
      const key = url.searchParams.get("track") || "";
      const style = url.searchParams.get("style") || "";
      if (!key || key.length > 300 || !/^[a-z0-9_ ]+$/.test(key) || !/^[a-z][a-z0-9_]{0,79}$/.test(style)) return { invalid: true };
      return { key, style };
    } catch (_) { return null; }
  }
  function buildTrackLink({ key, style, language = "en", baseUrl = "https://sonicsearch.app/" }) {
    // Share a catalog identity, never a user-supplied media URL or profile data.
    const url = new URL("/", baseUrl);
    if (!/^https?:$/.test(url.protocol)) throw new Error("Invalid share origin");
    url.searchParams.set("track", key);
    url.searchParams.set("style", style);
    url.searchParams.set("lang", ["pt", "en", "es"].includes(language) ? language : "en");
    const parsed = parseTrackLink(url.href);
    if (!parsed || parsed.invalid) throw new Error("Invalid catalog identity");
    return url.href;
  }
  function selectTracks(entries, query = "", order = "recent", locale = "pt", labelStyle = value => value) {
    const terms = normalize(query).split(/\s+/).filter(Boolean);
    const matches = entries.filter(entry => {
      const text = normalize([entry.song, entry.artist, entry.style, labelStyle(entry.style)].join(" "));
      return terms.every(term => text.includes(term));
    });
    if (order === "title" || order === "artist") {
      const key = order === "title" ? "song" : "artist";
      matches.sort((a, b) => String(a[key] || "").localeCompare(String(b[key] || ""), locale, { sensitivity: "base" }));
    } else matches.sort((a, b) => (Date.parse(b.likedAt) || 0) - (Date.parse(a.likedAt) || 0));
    return matches;
  }
  function mount(adapter) {
    const doc = root.document;
    const c = () => copy[adapter.language()] || copy.pt;
    function render() {
      doc.querySelectorAll("[data-experience-copy]").forEach(el => { el.textContent = c()[el.dataset.experienceCopy] || ""; });
      const web = webCopy[adapter.language()] || webCopy.en;
      doc.querySelectorAll("[data-web-copy]").forEach(el => { el.textContent = web[el.dataset.webCopy] || ""; });
      const hint = doc.getElementById("profileLibraryHint");
      if (hint) hint.textContent = web.libraryHint;
      const search = doc.getElementById("librarySearch");
      if (search) search.placeholder = c().placeholder;
      adapter.renderLibrary();
    }
    doc.getElementById("librarySearch")?.addEventListener("input", () => adapter.renderLibrary());
    doc.getElementById("libraryOrder")?.addEventListener("change", () => adapter.renderLibrary());
    doc.getElementById("discoveryLibraryBtn")?.addEventListener("click", () => {
      adapter.openLibrary();
      root.requestAnimationFrame(() => {
        doc.getElementById("librarySearch")?.focus({ preventScroll: true });
        doc.getElementById("profileLibraryTitle")?.scrollIntoView({ behavior: "auto", block: "start" });
      });
    });
    root.addEventListener("sonic:language-changed", render);
    render();
  }
  const api = { copy, webCopy, normalize, selectTracks, parseTrackLink, buildTrackLink, mount };
  if (typeof module !== "undefined" && module.exports) module.exports = api;
  root.SonicDiscoveryExperience = api;
})(typeof window !== "undefined" ? window : globalThis);
