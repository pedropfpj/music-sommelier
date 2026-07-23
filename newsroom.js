(() => {
  "use strict";

  const CACHE_KEY = "sonic_search_editorial_cache_v2";
  const status = document.getElementById("sonicEditorialStatus");
  const list = document.getElementById("sonicEditorialList");
  const reader = document.getElementById("sonicNewsReader");
  const refreshButton = document.getElementById("dailyNewsRefreshBtn");
  const state = { articles: [], loading: false };

  if (!status || !list || !reader) return;

  function safeUrl(value = "") {
    const raw = String(value || "").trim();
    if (!raw) return "";
    try {
      const url = new URL(raw, window.location.origin);
      return ["https:", "http:"].includes(url.protocol) ? url.toString() : "";
    } catch (_error) {
      return "";
    }
  }

  function formatDate(value = "", options = {}) {
    const date = new Date(value);
    if (!Number.isFinite(date.getTime())) return "";
    try {
      return new Intl.DateTimeFormat("pt-BR", options).format(date);
    } catch (_error) {
      return "";
    }
  }

  function locationLabel(article = {}) {
    return [article.venueName, article.city, article.state]
      .map((value) => String(value || "").trim())
      .filter(Boolean)
      .join(" · ");
  }

  function articleMeta(article = {}) {
    const location = locationLabel(article);
    const date = formatDate(article.eventStartsAt || article.publishedAt, {
      day: "2-digit",
      month: "short",
      year: "numeric"
    });
    return [location, date].filter(Boolean).join(" · ") || "Jornal Sonic";
  }

  function saveCache(articles = []) {
    try {
      localStorage.setItem(CACHE_KEY, JSON.stringify({
        updatedAt: new Date().toISOString(),
        articles: Array.isArray(articles) ? articles.slice(0, 30) : []
      }));
    } catch (_error) {}
  }

  function loadCache() {
    try {
      const value = JSON.parse(localStorage.getItem(CACHE_KEY) || "{}");
      return Array.isArray(value.articles) ? value.articles : [];
    } catch (_error) {
      return [];
    }
  }

  function coverNode(article = {}) {
    const wrap = document.createElement("div");
    wrap.className = "sonic-editorial-image-wrap";
    const url = safeUrl(article.coverImageUrl);
    if (!url) {
      const fallback = document.createElement("span");
      fallback.textContent = "SS";
      wrap.appendChild(fallback);
      return wrap;
    }
    const image = document.createElement("img");
    image.src = url;
    image.alt = article.coverImageAlt || "";
    image.loading = "lazy";
    image.decoding = "async";
    image.addEventListener("error", () => {
      image.remove();
      const fallback = document.createElement("span");
      fallback.textContent = "SS";
      wrap.appendChild(fallback);
    }, { once: true });
    wrap.appendChild(image);
    return wrap;
  }

  function renderArticles(articles = []) {
    state.articles = Array.isArray(articles) ? articles : [];
    list.replaceChildren();
    if (!state.articles.length) {
      status.textContent = "A primeira edição está sendo preparada pela redação.";
      return;
    }

    state.articles.forEach((article) => {
      const card = document.createElement("button");
      card.type = "button";
      card.className = "sonic-editorial-card";
      card.dataset.sonicArticleId = String(article.id || "");

      const copy = document.createElement("div");
      copy.className = "sonic-editorial-copy";
      const kicker = document.createElement("p");
      const category = document.createElement("span");
      category.textContent = article.category || "Agenda";
      const brand = document.createElement("b");
      brand.textContent = article.isSponsored ? "CONTEÚDO EM PARCERIA" : "JORNAL SONIC";
      kicker.append(category, brand);

      const title = document.createElement("h5");
      title.textContent = article.title || "Matéria do Jornal Sonic";
      const excerpt = document.createElement("span");
      excerpt.textContent = article.excerpt || "";
      const meta = document.createElement("div");
      meta.className = "sonic-editorial-meta";
      meta.textContent = articleMeta(article);
      copy.append(kicker, title, excerpt, meta);
      card.append(coverNode(article), copy);
      list.appendChild(card);
    });

    status.textContent = state.articles.length === 1
      ? "1 matéria publicada pela redação."
      : `${state.articles.length} matérias publicadas pela redação.`;
    status.classList.remove("is-error");
  }

  async function refreshEditorial() {
    if (state.loading) return false;
    state.loading = true;
    status.textContent = "Buscando a edição mais recente…";
    status.classList.remove("is-error");
    try {
      const response = await fetch(`/api/news-editor?limit=20&_=${Date.now()}`, {
        method: "GET",
        cache: "no-store",
        headers: { Accept: "application/json" }
      });
      const payload = await response.json().catch(() => ({}));
      if (!response.ok || !payload.ok || !Array.isArray(payload.articles)) {
        throw new Error(payload.error || `newsroom_http_${response.status}`);
      }
      saveCache(payload.articles);
      renderArticles(payload.articles);
      return true;
    } catch (_error) {
      const cached = loadCache();
      if (cached.length) {
        renderArticles(cached);
        status.textContent = "Mostrando a última edição salva neste aparelho.";
        return true;
      }
      status.textContent = "O Jornal Sonic está temporariamente indisponível.";
      status.classList.add("is-error");
      return false;
    } finally {
      state.loading = false;
    }
  }

  function setText(id, value) {
    const element = document.getElementById(id);
    if (element) element.textContent = String(value || "");
  }

  function serviceItem(target, label, value) {
    const text = String(value || "").trim();
    if (!target || !text) return;
    const term = document.createElement("dt");
    const detail = document.createElement("dd");
    term.textContent = label;
    detail.textContent = text;
    target.append(term, detail);
  }

  function mediaEntries(article = {}) {
    const media = Array.isArray(article.serviceInfo?.media) ? article.serviceInfo.media : [];
    return media.map((entry, index) => ({
      id: `${index}-${String(entry?.url || "")}`,
      url: safeUrl(entry?.url),
      alt: String(entry?.alt || "").trim(),
      caption: String(entry?.caption || "").trim(),
      credit: String(entry?.credit || "").trim(),
      afterParagraph: Math.max(1, Number.parseInt(entry?.afterParagraph, 10) || 1)
    })).filter((entry) => entry.url);
  }

  function mediaFigure(media = {}) {
    const figure = document.createElement("figure");
    figure.className = "sonic-news-reader-media";
    const link = document.createElement("a");
    link.href = media.url;
    link.target = "_blank";
    link.rel = "noopener noreferrer";
    link.setAttribute(
      "aria-label",
      media.caption ? `Abrir imagem: ${media.caption}` : "Abrir imagem em tamanho maior"
    );
    const image = document.createElement("img");
    image.src = media.url;
    image.alt = media.alt;
    image.loading = "lazy";
    image.decoding = "async";
    image.addEventListener("error", () => figure.remove(), { once: true });
    link.appendChild(image);
    figure.appendChild(link);

    if (media.caption || media.credit) {
      const caption = document.createElement("figcaption");
      if (media.caption) {
        const text = document.createElement("span");
        text.textContent = media.caption;
        caption.appendChild(text);
      }
      if (media.credit) {
        const credit = document.createElement("small");
        credit.textContent = media.credit;
        caption.appendChild(credit);
      }
      figure.appendChild(caption);
    }
    return figure;
  }

  function closeReader() {
    if (typeof reader.close === "function" && reader.open) reader.close();
    else reader.removeAttribute("open");
    document.body.classList.remove("sonic-news-reader-open");
  }

  function openReader(article = {}) {
    if (!article?.id) return;
    const imageUrl = safeUrl(article.coverImageUrl);
    const hero = document.getElementById("sonicNewsReaderHero");
    const heroImage = document.getElementById("sonicNewsReaderImage");
    if (hero && heroImage) {
      hero.classList.toggle("hidden", !imageUrl);
      heroImage.src = imageUrl;
      heroImage.alt = article.coverImageAlt || "";
    }

    setText("sonicNewsReaderCategory", article.category || "Jornal Sonic");
    setText("sonicNewsReaderTitle", article.title || "Matéria");
    setText("sonicNewsReaderExcerpt", article.excerpt || "");
    setText("sonicNewsReaderByline", [
      `Por ${article.authorName || "Redação Sonic Search"}`,
      formatDate(article.publishedAt, { dateStyle: "long" })
    ].filter(Boolean).join(" · "));
    setText("sonicNewsReaderCredit", article.imageCredit || "");

    const disclosure = document.getElementById("sonicNewsReaderDisclosure");
    if (disclosure) {
      disclosure.textContent = article.disclosure || (article.isSponsored ? "Conteúdo em parceria" : "");
      disclosure.classList.toggle("hidden", !disclosure.textContent);
    }

    const body = document.getElementById("sonicNewsReaderBody");
    if (body) {
      body.replaceChildren();
      const blocks = String(article.body || "")
        .split(/\n{2,}/)
        .map((block) => block.trim())
        .filter(Boolean);
      const media = mediaEntries(article);
      const inserted = new Set();
      let paragraphNumber = 0;

      blocks.forEach((block) => {
        const headingMatch = block.match(/^##\s+(.+)$/s);
        if (headingMatch) {
          const heading = document.createElement("h3");
          heading.textContent = headingMatch[1].replace(/\s+/g, " ").trim();
          body.appendChild(heading);
          return;
        }
        paragraphNumber += 1;
        const paragraph = document.createElement("p");
        paragraph.textContent = block;
        body.appendChild(paragraph);
        media.filter((entry) => entry.afterParagraph === paragraphNumber).forEach((entry) => {
          body.appendChild(mediaFigure(entry));
          inserted.add(entry.id);
        });
      });
      media.filter((entry) => !inserted.has(entry.id)).forEach((entry) => {
        body.appendChild(mediaFigure(entry));
      });
    }

    const lineup = Array.isArray(article.lineup)
      ? article.lineup.filter((entry) => entry?.name)
      : [];
    const lineupSection = document.getElementById("sonicNewsReaderLineupSection");
    const lineupList = document.getElementById("sonicNewsReaderLineup");
    if (lineupList) {
      lineupList.replaceChildren();
      lineup.forEach((entry) => {
        const row = document.createElement("div");
        const name = document.createElement("strong");
        const detail = document.createElement("span");
        name.textContent = entry.name;
        detail.textContent = entry.time || entry.role || "";
        row.append(name, detail);
        lineupList.appendChild(row);
      });
    }
    lineupSection?.classList.toggle("hidden", !lineup.length);

    const serviceSection = document.getElementById("sonicNewsReaderService");
    const serviceList = document.getElementById("sonicNewsReaderServiceList");
    if (serviceList) {
      serviceList.replaceChildren();
      serviceItem(serviceList, "Quando", formatDate(article.eventStartsAt, {
        dateStyle: "full",
        timeStyle: "short"
      }));
      serviceItem(serviceList, "Horários", article.serviceInfo?.doorsTime);
      serviceItem(serviceList, "Onde", locationLabel(article));
      serviceItem(serviceList, "Endereço", article.serviceInfo?.address);
      serviceItem(serviceList, "Ingressos", article.serviceInfo?.price);
      serviceItem(serviceList, "Classificação", article.serviceInfo?.ageRating);
      serviceItem(serviceList, "Informações", article.serviceInfo?.notes);
    }
    serviceSection?.classList.toggle("hidden", !serviceList?.children.length);

    const actions = document.getElementById("sonicNewsReaderActions");
    if (actions) {
      actions.replaceChildren();
      const related = Array.isArray(article.serviceInfo?.relatedLinks)
        ? article.serviceInfo.relatedLinks
        : [];
      const links = [
        {
          url: safeUrl(article.ticketUrl),
          label: article.ctaLabel || "Ver evento",
          secondary: false
        },
        {
          url: safeUrl(article.instagramUrl),
          label: String(article.serviceInfo?.instagramLabel || "Instagram oficial").trim(),
          secondary: true
        },
        ...related.map((item) => ({
          url: safeUrl(item?.url),
          label: String(item?.label || "").trim(),
          secondary: true
        }))
      ].filter((item, index, input) => (
        item.url &&
        item.label &&
        input.findIndex((candidate) => candidate.url === item.url) === index
      ));

      links.forEach((item) => {
        const anchor = document.createElement("a");
        anchor.href = item.url;
        anchor.target = "_blank";
        anchor.rel = "noopener noreferrer";
        anchor.textContent = item.label;
        if (item.secondary) anchor.classList.add("secondary");
        actions.appendChild(anchor);
      });
    }

    document.body.classList.add("sonic-news-reader-open");
    if (typeof reader.showModal === "function") reader.showModal();
    else reader.setAttribute("open", "");
  }

  list.addEventListener("click", (event) => {
    const card = event.target instanceof Element
      ? event.target.closest("[data-sonic-article-id]")
      : null;
    if (!card) return;
    const article = state.articles.find((item) => (
      String(item.id || "") === String(card.dataset.sonicArticleId || "")
    ));
    if (article) openReader(article);
  });

  document.getElementById("sonicNewsReaderClose")?.addEventListener("click", closeReader);
  reader.addEventListener("click", (event) => {
    if (event.target === reader) closeReader();
  });
  reader.addEventListener("cancel", (event) => {
    event.preventDefault();
    closeReader();
  });
  refreshButton?.addEventListener("click", refreshEditorial);

  const cached = loadCache();
  if (cached.length) renderArticles(cached);
  refreshEditorial();
})();
