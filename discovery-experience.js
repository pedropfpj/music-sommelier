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
  const api = { copy, normalize, selectTracks, mount };
  if (typeof module !== "undefined" && module.exports) module.exports = api;
  root.SonicDiscoveryExperience = api;
})(typeof window !== "undefined" ? window : globalThis);
