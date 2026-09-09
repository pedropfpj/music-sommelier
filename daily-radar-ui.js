(function (root) {
  "use strict";

  const COPY = {
    pt: {
      kicker: "SONIC PREMIUM · RADAR DIÁRIO", title: "Seu perfil vira descoberta.",
      description: "O radar aprende com suas reações e entrega afinidade, expansão e surpresa — com um motivo para cada escolha.",
      premium: "Premium ativo", preview: "Prévia local", locked: "Incluído no Premium", open: "Abrir o radar de hoje", close: "Recolher radar",
      upgrade: "Conhecer Sonic Premium", today: "Hoje", history: "Histórico", emptyHistory: "O histórico aparece conforme você abre novos radares.",
      anchor: "ALTA AFINIDADE", bridge: "EXPANSÃO", wildcard: "FORA DA BOLHA", refresh: "REVISITA INTELIGENTE",
      tasteReason: "Segue a direção que você escolheu no seu perfil.", likesReason: "Aprendeu com as faixas que você curtiu.",
      bridgeReason: "Amplia seu gosto sem sair da mesma família sonora.", wildcardReason: "Uma aposta de outra família para evitar uma bolha musical.",
      starterReason: "Um ponto de partida confiável; suas reações refinam os próximos dias.", refreshReason: "Uma revisita espaçada porque as opções inéditas deste recorte diminuíram.",
      listen: "Ouvir agora", like: "Curti", known: "Já conheço", pass: "Não combina", feedback: "Avaliar {song}, de {artist}",
      saved: "Sinal salvo. O radar de amanhã já leva isso em conta.", removed: "Sinal removido.", next: "Um novo radar chega amanhã.",
      sync: "Sincronizado com sua conta", local: "Salvo neste aparelho", syncError: "Salvo neste aparelho; a sincronização será tentada novamente.",
      loading: "Preparando seu radar…", unavailable: "O radar não encontrou três faixas reproduzíveis agora. Tente novamente em instantes.", summary: "{count} faixas · {date}"
    },
    en: {
      kicker: "SONIC PREMIUM · DAILY RADAR", title: "Your profile becomes discovery.",
      description: "The radar learns from your reactions and delivers affinity, expansion, and surprise — with a reason for every pick.",
      premium: "Premium active", preview: "Local preview", locked: "Included with Premium", open: "Open today's radar", close: "Collapse radar",
      upgrade: "Meet Sonic Premium", today: "Today", history: "History", emptyHistory: "History appears as you open new daily radars.",
      anchor: "HIGH AFFINITY", bridge: "EXPANSION", wildcard: "OUTSIDE THE BUBBLE", refresh: "SMART REVISIT",
      tasteReason: "Follows the direction you chose in your profile.", likesReason: "Learned from tracks you liked.",
      bridgeReason: "Expands your taste while staying in the same sonic family.", wildcardReason: "A pick from another family to avoid a music bubble.",
      starterReason: "A reliable starting point; your reactions refine future days.", refreshReason: "A spaced revisit after unseen options in this lane ran low.",
      listen: "Listen now", like: "Like", known: "Already know", pass: "Not for me", feedback: "Rate {song} by {artist}",
      saved: "Signal saved. Tomorrow's radar will use it.", removed: "Signal removed.", next: "A new radar arrives tomorrow.",
      sync: "Synced with your account", local: "Saved on this device", syncError: "Saved on this device; sync will retry.",
      loading: "Preparing your radar…", unavailable: "The radar could not find three playable tracks right now. Try again shortly.", summary: "{count} tracks · {date}"
    },
    es: {
      kicker: "SONIC PREMIUM · RADAR DIARIO", title: "Tu perfil se convierte en descubrimiento.",
      description: "El radar aprende de tus reacciones y entrega afinidad, expansión y sorpresa, con una razón para cada elección.",
      premium: "Premium activo", preview: "Vista previa local", locked: "Incluido en Premium", open: "Abrir el radar de hoy", close: "Ocultar radar",
      upgrade: "Conocer Sonic Premium", today: "Hoy", history: "Historial", emptyHistory: "El historial aparece a medida que abres nuevos radares.",
      anchor: "ALTA AFINIDAD", bridge: "EXPANSIÓN", wildcard: "FUERA DE LA BURBUJA", refresh: "REVISITA INTELIGENTE",
      tasteReason: "Sigue la dirección que elegiste en tu perfil.", likesReason: "Aprendió de las pistas que te gustaron.",
      bridgeReason: "Amplía tu gusto sin salir de la misma familia sonora.", wildcardReason: "Una apuesta de otra familia para evitar una burbuja musical.",
      starterReason: "Un punto de partida fiable; tus reacciones refinan los próximos días.", refreshReason: "Una revisita espaciada porque disminuyeron las opciones inéditas.",
      listen: "Escuchar ahora", like: "Me gusta", known: "Ya conozco", pass: "No va conmigo", feedback: "Evaluar {song}, de {artist}",
      saved: "Señal guardada. El radar de mañana la tendrá en cuenta.", removed: "Señal eliminada.", next: "Mañana llega un nuevo radar.",
      sync: "Sincronizado con tu cuenta", local: "Guardado en este dispositivo", syncError: "Guardado en este dispositivo; se reintentará la sincronización.",
      loading: "Preparando tu radar…", unavailable: "El radar no encontró tres pistas reproducibles ahora. Inténtalo de nuevo en unos instantes.", summary: "{count} pistas · {date}"
    }
  };

  function create(options) {
    const core = root.SonicDailyRadar;
    const host = options.root;
    if (!core || !host) return null;
    let identity = "";
    let storageKey = "";
    let state = null;
    let selection = null;
    let access = "unavailable";
    let opened = false;
    let view = "today";
    let cloudState = "local";
    let syncTimer = 0;
    let destroyed = false;

    const message = (key, vars = {}) => {
      let result = (COPY[options.getLanguage()] || COPY.en)[key] || key;
      Object.entries(vars).forEach(([name, value]) => { result = result.replaceAll(`{${name}}`, String(value)); });
      return result;
    };
    const element = (tag, className = "", content) => {
      const node = document.createElement(tag);
      if (className) node.className = className;
      if (content !== undefined) node.textContent = content;
      return node;
    };
    const button = (label, action, className = "") => {
      const node = element("button", className, label);
      node.type = "button";
      node.dataset.radarAction = action;
      return node;
    };

    function syncIdentity() {
      const nextIdentity = options.getIdentity();
      if (nextIdentity === identity && state) return false;
      identity = nextIdentity;
      storageKey = options.getStorageKey();
      let stored = null;
      try {
        const raw = storageKey ? root.localStorage.getItem(storageKey) : "";
        if (raw && raw.length < 1000000) stored = JSON.parse(raw);
      } catch (_) { /* The in-memory state remains available. */ }
      state = core.createState(stored, root.crypto?.randomUUID?.() || `${Date.now()}-${Math.random()}`);
      selection = null;
      opened = access === "premium";
      view = "today";
      cloudState = "local";
      return true;
    }

    function persistLocal() {
      try {
        if (storageKey) root.localStorage.setItem(storageKey, JSON.stringify(state));
      } catch (_) { /* Cloud sync can still preserve Premium state. */ }
    }

    function scheduleCloudSave() {
      if (access !== "premium" || !options.saveCloud) return;
      root.clearTimeout(syncTimer);
      cloudState = "saving";
      syncTimer = root.setTimeout(async () => {
        try {
          await options.saveCloud(state);
          if (!destroyed) { cloudState = "synced"; renderStatus(); }
        } catch (_) {
          if (!destroyed) { cloudState = "error"; renderStatus(); }
        }
      }, 260);
    }

    function save() {
      persistLocal();
      scheduleCloudSave();
    }

    function ensureSelection() {
      if (selection?.date === core.dayKey()) return selection;
      const result = core.selectDaily({ catalog: options.getCatalog(), state, signals: options.getSignals() });
      state = result.state;
      selection = result.selection;
      if (!result.cached) save();
      return selection;
    }

    function formatDate(date) {
      const [year, month, day] = String(date).split("-").map(Number);
      const locale = { pt: "pt-BR", es: "es", en: "en" }[options.getLanguage()] || "en";
      return new Intl.DateTimeFormat(locale, { day: "numeric", month: "long" }).format(new Date(year, month - 1, day, 12));
    }

    function reasonFor(item) {
      return message(`${item.reason}Reason`);
    }

    function renderCard(item, index) {
      const article = element("article", `daily-radar-card is-${item.lane}`);
      article.dataset.radarKey = item.key;
      const header = element("div", "daily-radar-card-head");
      header.append(element("span", "daily-radar-index", String(index + 1).padStart(2, "0")), element("span", "daily-radar-lane", message(item.lane)));
      const song = element("h4", "daily-radar-song", item.song);
      const artist = element("p", "daily-radar-artist", item.artist);
      const meta = element("p", "daily-radar-meta", [item.styleLabel, item.bpm, item.energy].filter(Boolean).join(" · "));
      const reason = element("p", "daily-radar-reason", reasonFor(item));
      const actions = element("div", "daily-radar-actions");
      const listen = button(message("listen"), "listen", "daily-radar-listen");
      listen.dataset.key = item.key;
      actions.append(listen);
      const feedback = element("div", "daily-radar-feedback");
      feedback.setAttribute("role", "group");
      feedback.setAttribute("aria-label", message("feedback", item));
      const current = state.feedback.find((entry) => entry.key === item.key)?.action || "";
      ["like", "known", "pass"].forEach((action) => {
        const control = button(message(action), "feedback");
        control.dataset.key = item.key;
        control.dataset.feedback = action;
        control.setAttribute("aria-pressed", String(current === action));
        feedback.append(control);
      });
      article.append(header, song, artist, meta, reason, actions, feedback);
      return article;
    }

    function renderStatus(textKey = "") {
      const node = host.querySelector(".daily-radar-status");
      if (!node) return;
      node.textContent = textKey ? message(textKey) : cloudState === "synced" ? message("sync") : cloudState === "error" ? message("syncError") : message("local");
    }

    function render() {
      syncIdentity();
      host.hidden = false;
      host.replaceChildren();
      const heading = element("div", "daily-radar-heading");
      const headingCopy = element("div", "daily-radar-heading-copy");
      headingCopy.append(element("p", "daily-radar-kicker", message("kicker")), element("h3", "daily-radar-title", message("title")));
      const badgeKey = access === "premium" ? "premium" : access === "preview" ? "preview" : "locked";
      heading.append(headingCopy, element("span", "daily-radar-badge", message(badgeKey)));
      host.append(heading, element("p", "daily-radar-description", message("description")));

      const canUse = access === "premium" || access === "preview";
      if (!canUse) {
        host.append(button(message("upgrade"), "upgrade", "daily-radar-upgrade"));
        return;
      }

      const toggle = button(message(opened ? "close" : "open"), "toggle", "daily-radar-toggle");
      toggle.setAttribute("aria-expanded", String(opened));
      toggle.setAttribute("aria-controls", "dailyRadarBody");
      host.append(toggle);
      if (!opened) return;

      const body = element("div", "daily-radar-body");
      body.id = "dailyRadarBody";
      const navigation = element("div", "daily-radar-navigation");
      navigation.setAttribute("role", "group");
      ["today", "history"].forEach((tab) => {
        const control = button(message(tab), tab);
        control.setAttribute("aria-pressed", String(view === tab));
        navigation.append(control);
      });
      body.append(navigation);

      if (view === "today") {
        const today = ensureSelection();
        if (!today?.items?.length) body.append(element("p", "daily-radar-empty", message("unavailable")));
        else {
          body.append(element("p", "daily-radar-summary", message("summary", { count: today.items.length, date: formatDate(today.date) })));
          const grid = element("div", "daily-radar-grid");
          today.items.forEach((item, index) => grid.append(renderCard(item, index)));
          body.append(grid, element("p", "daily-radar-next", message("next")));
        }
      } else {
        const history = state.history.filter((entry) => entry.date !== core.dayKey());
        if (!history.length) body.append(element("p", "daily-radar-empty", message("emptyHistory")));
        history.forEach((entry) => {
          const details = element("details", "daily-radar-history");
          details.append(element("summary", "", `${formatDate(entry.date)} · ${entry.items.map((item) => item.song).join(", ")}`));
          details.addEventListener("toggle", () => {
            if (!details.open || details.querySelector(".daily-radar-grid")) return;
            const grid = element("div", "daily-radar-grid");
            entry.items.forEach((item, index) => grid.append(renderCard(item, index)));
            details.append(grid);
          });
          body.append(details);
        });
      }
      const status = element("p", "daily-radar-status");
      status.setAttribute("role", "status");
      status.setAttribute("aria-live", "polite");
      body.append(status);
      host.append(body);
      renderStatus();
    }

    function findItem(key) {
      return state.history.flatMap((entry) => entry.items).find((item) => item.key === key) || null;
    }

    host.addEventListener("click", (event) => {
      const target = event.target.closest("[data-radar-action]");
      if (!target || !host.contains(target)) return;
      const action = target.dataset.radarAction;
      if (action === "upgrade") { options.onUpgrade?.(); return; }
      if (access !== "premium" && access !== "preview") return;
      if (action === "toggle") { opened = !opened; render(); return; }
      if (action === "today" || action === "history") { view = action; render(); return; }
      const item = findItem(target.dataset.key);
      if (!item) return;
      if (action === "listen") { options.onOpen?.(item); return; }
      if (action === "feedback") {
        const prior = state.feedback.find((entry) => entry.key === item.key)?.action || "";
        const selected = target.dataset.feedback;
        state = core.recordFeedback(state, item, selected);
        save();
        const current = state.feedback.find((entry) => entry.key === item.key)?.action || "";
        if (current) options.onFeedback?.(item, current, prior);
        render();
        renderStatus(current ? "saved" : "removed");
      }
    });

    async function resolveAccess() {
      try {
        access = await options.getAccess();
        if (!["premium", "preview"].includes(access)) access = "unavailable";
        syncIdentity();
        if (access === "premium" && options.loadCloud) {
          cloudState = "saving";
          const cloud = await options.loadCloud();
          if (cloud) {
            state = core.mergeStates(state, cloud, state.seed);
            persistLocal();
          }
          cloudState = "synced";
        }
      } catch (_) {
        if (access !== "preview") access = "unavailable";
        cloudState = "error";
      }
      render();
      return access;
    }

    syncIdentity();
    render();
    void resolveAccess();
    return {
      refresh: render,
      refreshAccess: resolveAccess,
      open() { opened = true; view = "today"; render(); },
      reset() { identity = ""; state = null; selection = null; render(); },
      destroy() { destroyed = true; root.clearTimeout(syncTimer); }
    };
  }

  root.SonicDailyRadarUi = Object.freeze({ create });
})(window);
