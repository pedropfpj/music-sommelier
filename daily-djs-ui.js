(function (root) {
  "use strict";
  const COPY = {
    pt: {
      title: "Recomendação Premium", kicker: "SEU RADAR DIÁRIO", intro: "Seu próximo DJ favorito começa aqui.",
      description: "Uma seleção diária de até 3 DJs: perto do seu gosto, com espaço para descobrir algo novo.",
      premium: "Premium ativo", preview: "Prévia local · sem cobrança", unavailable: "Em preparação · assinaturas indisponíveis",
      memberNote: "Seu plano Premium foi verificado. Esta seleção usa seus sinais para orientar os próximos dias.",
      accessNote: "Esta é uma versão de desenvolvimento. Nenhuma assinatura ou cobrança foi ativada.",
      lockedNote: "O pacote ainda não está à venda. A descoberta manual de DJs continua gratuita, logo abaixo.",
      open: "Experimentar a seleção diária", close: "Recolher seleção", today: "Hoje", history: "Histórico",
      preferences: "Seu ponto de partida", preferencesHint: "Escolha até dois estilos. Suas curtidas também ajudam a orientar os próximos dias.",
      primary: "Estilo principal", secondary: "Outro estilo (opcional)", learn: "Aprender com minhas curtidas", none: "Sem segundo estilo",
      generate: "Criar seleção de hoje", save: "Salvar preferências", adjust: "Ajustar preferências",
      saved: "Preferências salvas. A seleção de hoje permanece; o ajuste vale para os próximos dias.",
      local: "Histórico neste aparelho e neste perfil. A seleção se renova ao abrir o app em um novo dia, no horário local.",
      empty: "Nenhum set disponível para esta seleção. Tente novamente mais tarde ou use a descoberta manual abaixo.",
      retry: "Tentar novamente", partial: "Hoje encontramos {count} DJ(s) disponíveis. Não completamos a lista com repetições.",
      historyEmpty: "Suas próximas visitas vão preencher este histórico. Guardamos as últimas 30 seleções abertas.",
      fit: "NO SEU RADAR", explore: "PARA EXPLORAR", starter: "PRIMEIROS SINAIS", refresh: "PARA REVISITAR",
      preferenceReason: "Você escolheu {style}. Este set segue essa direção.", likesReason: "Suas curtidas apontam para {style}. Este set explora esse caminho.",
      exploreReason: "Uma outra direção: {style}, para ampliar sua descoberta de hoje.", starterReason: "Um ponto de partida em {style}. Sua avaliação ajuda a personalizar os próximos dias.",
      refreshReason: "Você já viu este DJ. Como as opções inéditas diminuíram, trouxemos uma oportunidade de revisitar.",
      listen: "Ouvir set", source: "Ver na fonte", like: "Curti", known: "Já conheço", pass: "Não combina", feedback: "Avaliar {artist}",
      feedbackSaved: "Avaliação salva para as próximas seleções.", feedbackRemoved: "Avaliação removida.",
      likeLimit: "Não foi possível registrar esta curtida agora. Tente novamente.",
      unavailableSet: "Este set não está disponível no player agora. Você pode conferir o link da fonte.",
      storageError: "Não foi possível salvar neste navegador. Sua seleção funciona nesta sessão, mas pode não ser mantida ao sair.",
      reminder: "Curadoria no seu tempo", reminderHint: "Receba um aviso para abrir a seleção do dia, no horário que você escolher. A permissão só é pedida depois do seu toque.",
      time: "Horário local", enable: "Ativar lembrete", disable: "Desativar lembrete", reminderOn: "Lembrete diário ativo às {time} neste aparelho.",
      reminderOff: "Lembrete desativado.", reminderUnsupported: "Avisos com o app fechado estão disponíveis no app para iPhone. No navegador, a seleção se atualiza quando você volta.",
      reminderDenied: "Notificações não autorizadas. Você pode permitir nas configurações do iPhone.", reminderError: "Não foi possível alterar o lembrete. Tente novamente.",
      working: "Salvando…", next: "Amanhã tem uma nova seleção.", summary: "{count} DJs · {date}"
    },
    en: {
      title: "Premium Recommendations", kicker: "YOUR DAILY RADAR", intro: "Your next favorite DJ starts here.",
      description: "A daily selection of up to 3 DJs: close to your taste, with room to discover something new.",
      premium: "Premium active", preview: "Local preview · no charge", unavailable: "In development · subscriptions unavailable",
      memberNote: "Your Premium plan was verified. This selection uses your signals to shape the next days.",
      accessNote: "This is a development version. No subscription or payment has been activated.", lockedNote: "This package is not on sale yet. Manual DJ discovery stays free below.",
      open: "Try the daily selection", close: "Collapse selection", today: "Today", history: "History", preferences: "Your starting point",
      preferencesHint: "Choose up to two styles. Your likes also help shape the next days.", primary: "Main style", secondary: "Another style (optional)",
      learn: "Learn from my likes", none: "No second style", generate: "Create today's selection", save: "Save preferences", adjust: "Adjust preferences",
      saved: "Preferences saved. Today's selection stays the same; changes apply to the next days.", local: "History stays on this device and profile. A new selection is prepared when you open the app on a new day, in local time.",
      empty: "No sets are available for this selection. Try again later or use manual discovery below.", retry: "Try again",
      partial: "We found {count} available DJ(s) today. We do not fill the list with duplicates.", historyEmpty: "Future visits will fill this history. We keep your last 30 opened daily selections.",
      fit: "ON YOUR RADAR", explore: "TO EXPLORE", starter: "FIRST SIGNALS", refresh: "TO REVISIT",
      preferenceReason: "You chose {style}. This set follows that direction.", likesReason: "Your likes point toward {style}. This set explores that path.",
      exploreReason: "Another direction: {style}, to widen today's discovery.", starterReason: "A starting point in {style}. Your feedback helps personalize future days.",
      refreshReason: "You have seen this DJ before. With fewer unseen options left, here is a chance to revisit.",
      listen: "Listen to set", source: "View source", like: "Like", known: "Already know", pass: "Not for me", feedback: "Rate {artist}",
      feedbackSaved: "Feedback saved for future selections.", feedbackRemoved: "Feedback removed.", unavailableSet: "This set is not available in the player right now. You can check its source link.",
      likeLimit: "This like could not be saved right now. Please try again.",
      storageError: "Could not save in this browser. Your selection works this session but may not persist after leaving.",
      reminder: "Curation on your time", reminderHint: "Get an alert to open the daily selection at your chosen time. Permission is only requested after your tap.",
      time: "Local time", enable: "Enable reminder", disable: "Disable reminder", reminderOn: "Daily reminder enabled at {time} on this device.", reminderOff: "Reminder disabled.",
      reminderUnsupported: "Alerts while the app is closed are available in the iPhone app. In the browser, your selection updates when you return.",
      reminderDenied: "Notifications were not allowed. You can enable them in iPhone settings.", reminderError: "Could not change the reminder. Please try again.",
      working: "Saving…", next: "A new selection awaits tomorrow.", summary: "{count} DJs · {date}"
    },
    es: {
      title: "Recomendación Premium", kicker: "TU RADAR DIARIO", intro: "Tu próximo DJ favorito empieza aquí.",
      description: "Una selección diaria de hasta 3 DJs: cerca de tus gustos, con espacio para descubrir algo nuevo.",
      premium: "Premium activo", preview: "Vista previa local · sin cobro", unavailable: "En preparación · suscripciones no disponibles",
      memberNote: "Tu plan Premium fue verificado. Esta selección usa tus señales para orientar los próximos días.",
      accessNote: "Esta es una versión de desarrollo. No se activó ninguna suscripción ni cobro.", lockedNote: "El paquete aún no está a la venta. El descubrimiento manual de DJs sigue gratis abajo.",
      open: "Probar la selección diaria", close: "Ocultar selección", today: "Hoy", history: "Historial", preferences: "Tu punto de partida",
      preferencesHint: "Elige hasta dos estilos. Tus favoritos también orientan los próximos días.", primary: "Estilo principal", secondary: "Otro estilo (opcional)",
      learn: "Aprender de mis favoritos", none: "Sin segundo estilo", generate: "Crear la selección de hoy", save: "Guardar preferencias", adjust: "Ajustar preferencias",
      saved: "Preferencias guardadas. La selección de hoy no cambia; el ajuste se aplica en los próximos días.", local: "Historial en este dispositivo y perfil. La selección se renueva al abrir la app en un nuevo día, en horario local.",
      empty: "No hay sets disponibles para esta selección. Intenta más tarde o usa el descubrimiento manual abajo.", retry: "Reintentar",
      partial: "Hoy encontramos {count} DJ(s) disponibles. No completamos la lista con repeticiones.", historyEmpty: "Tus próximas visitas llenarán este historial. Guardamos las últimas 30 selecciones diarias abiertas.",
      fit: "EN TU RADAR", explore: "PARA EXPLORAR", starter: "PRIMERAS SEÑALES", refresh: "PARA REVISITAR",
      preferenceReason: "Elegiste {style}. Este set sigue esa dirección.", likesReason: "Tus favoritos apuntan a {style}. Este set explora ese camino.",
      exploreReason: "Otra dirección: {style}, para ampliar el descubrimiento de hoy.", starterReason: "Un punto de partida en {style}. Tu evaluación ayuda a personalizar los próximos días.",
      refreshReason: "Ya viste este DJ. Como quedan menos opciones nuevas, te damos una oportunidad de revisitar.",
      listen: "Escuchar set", source: "Ver fuente", like: "Me gusta", known: "Ya conozco", pass: "No va conmigo", feedback: "Evaluar {artist}",
      feedbackSaved: "Evaluación guardada para próximas selecciones.", feedbackRemoved: "Evaluación eliminada.", unavailableSet: "Este set no está disponible en el reproductor ahora. Puedes consultar el enlace de la fuente.",
      likeLimit: "No se pudo guardar este Me gusta ahora. Inténtalo de nuevo.",
      storageError: "No se pudo guardar en este navegador. La selección funciona en esta sesión, pero puede perderse al salir.",
      reminder: "Curaduría a tu tiempo", reminderHint: "Recibe un aviso para abrir la selección diaria a la hora que elijas. El permiso solo se solicita después de tu toque.",
      time: "Hora local", enable: "Activar recordatorio", disable: "Desactivar recordatorio", reminderOn: "Recordatorio diario activo a las {time} en este dispositivo.", reminderOff: "Recordatorio desactivado.",
      reminderUnsupported: "Los avisos con la app cerrada están disponibles en la app para iPhone. En el navegador, la selección se actualiza cuando vuelves.",
      reminderDenied: "Notificaciones no autorizadas. Puedes permitirlas en los ajustes del iPhone.", reminderError: "No se pudo cambiar el recordatorio. Inténtalo de nuevo.",
      working: "Guardando…", next: "Mañana hay una nueva selección.", summary: "{count} DJs · {date}"
    }
  };

  function create(options) {
    const core = root.SonicDailyDjs;
    const host = options.root;
    if (!core || !host) return null;
    let identity = "", storageKey = "", state, opened = false, view = "today", storageFailed = false;
    let access = "unavailable", reminder = null, busy = false;
    const message = (key, vars = {}) => {
      const lang = options.getLanguage();
      let result = (COPY[lang] || COPY.en)[key] || key;
      Object.entries(vars).forEach(([name, value]) => { result = result.replaceAll(`{${name}}`, String(value)); });
      return result;
    };
    function element(tag, className, content) {
      const el = document.createElement(tag);
      if (className) el.className = className;
      if (content !== undefined) el.textContent = content;
      return el;
    }
    function button(label, action, className = "") {
      const el = element("button", className, label);
      el.type = "button";
      el.dataset.dailyAction = action;
      return el;
    }
    function announce(key, vars = {}) {
      const status = host.querySelector(".daily-dj-status");
      if (status) status.textContent = message(key, vars);
    }
    function save() {
      if (!storageKey) return;
      try { root.localStorage.setItem(storageKey, JSON.stringify(state)); storageFailed = false; }
      catch (_) { storageFailed = true; }
    }
    function syncIdentity() {
      const next = options.getIdentity();
      if (identity === next && state) return false;
      identity = next;
      storageKey = options.getStorageKey();
      let stored = null;
      storageFailed = false;
      try {
        const raw = storageKey ? root.localStorage.getItem(storageKey) : null;
        if (raw && raw.length < 1000000) stored = JSON.parse(raw);
      } catch (_) { storageFailed = true; }
      state = core.createState(stored, root.crypto?.randomUUID?.() || `${Date.now()}-${Math.random()}`);
      opened = false;
      view = "today";
      return true;
    }
    function generate() {
      const result = core.selectDaily({ catalog: options.getCatalog(), state, signals: options.getSignals() });
      state = result.state;
      save();
      return result.selection;
    }
    function formatDate(date) {
      const [year, month, day] = date.split("-").map(Number);
      return new Intl.DateTimeFormat({ pt: "pt-BR", es: "es", en: "en" }[options.getLanguage()] || "en", { day: "numeric", month: "long" }).format(new Date(year, month - 1, day, 12));
    }
    function preferencesForm(hasToday) {
      const form = element("form", "daily-dj-preferences");
      form.dataset.dailyForm = "preferences";
      const fieldset = element("fieldset");
      fieldset.append(element("legend", "", message("preferences")), element("p", "daily-dj-muted", message("preferencesHint")));
      const fields = element("div", "daily-dj-fields");
      const styles = new Map(options.getCatalog().map((item) => [item.style, item.styleLabel]));
      state.preferences.forEach((style) => { if (!styles.has(style)) styles.set(style, style); });
      for (let index = 0; index < 2; index += 1) {
        const label = element("label", "", message(index ? "secondary" : "primary"));
        const select = element("select");
        select.name = `style${index}`;
        const empty = element("option", "", message(index ? "none" : "learn"));
        empty.value = "";
        select.append(empty);
        [...styles].sort((a, b) => a[1].localeCompare(b[1])).forEach(([value, name]) => {
          const option = element("option", "", name);
          option.value = value;
          select.append(option);
        });
        select.value = state.preferences[index] || "";
        label.append(select);
        fields.append(label);
      }
      const submit = element("button", "daily-dj-primary", message(hasToday ? "save" : "generate"));
      submit.type = "submit";
      fieldset.append(fields, submit);
      form.append(fieldset);
      if (!hasToday) return form;
      const details = element("details", "daily-dj-settings");
      details.append(element("summary", "", message("adjust")), form);
      return details;
    }
    function card(item, index) {
      const article = element("article", `daily-dj-card daily-dj-${item.kind}`);
      article.dataset.dailyKey = item.key;
      const top = element("div", "daily-dj-card-top");
      top.append(element("span", "daily-dj-number", String(index + 1).padStart(2, "0")), element("span", "daily-dj-kind", message(item.kind)));
      const title = element("h5", "", item.artist);
      const reasonKey = `${item.reason}Reason`;
      const actions = element("div", "daily-dj-card-actions");
      const listen = button(message("listen"), "listen", "daily-dj-listen");
      listen.dataset.key = item.key;
      const source = element("a", "daily-dj-source", `${message("source")} ↗`);
      source.href = item.url;
      source.target = "_blank";
      source.rel = "noopener noreferrer";
      source.dataset.dailyAction = "source";
      actions.append(listen, source);
      const feedback = element("div", "daily-dj-feedback");
      feedback.setAttribute("role", "group");
      feedback.setAttribute("aria-label", message("feedback", { artist: item.artist }));
      const current = state.feedback.find((entry) => entry.artistKey === item.artistKey)?.action;
      const likeReached = options.getLikeUsage?.()?.reached === true;
      for (const action of ["like", "known", "pass"]) {
        const control = button(message(action), "feedback");
        control.dataset.key = item.key;
        control.dataset.feedback = action;
        control.setAttribute("aria-pressed", String(current === action));
        if (action === "like" && current !== action && likeReached) {
          control.dataset.dailyLikeLimit = "blocked";
          control.setAttribute("aria-disabled", "true");
          control.title = message("likeLimit");
        }
        feedback.append(control);
      }
      article.append(top, title, element("p", "daily-dj-style", `${item.styleLabel || item.style} · ${item.platform}`), element("p", "daily-dj-set", item.title), element("p", "daily-dj-reason", message(reasonKey, { style: item.styleLabel || item.style })), actions, feedback);
      return article;
    }
    function renderReminder() {
      const details = element("details", "daily-dj-settings");
      details.id = "dailyDjReminderSettings";
      details.append(element("summary", "", message("reminder")));
      if (!options.reminder || !reminder || (reminder.available !== true && reminder.developmentPreview !== true)) {
        details.append(element("p", "daily-dj-muted", message("reminderUnsupported")));
        return details;
      }
      const form = element("form", "daily-dj-reminder");
      form.dataset.dailyForm = "reminder";
      const label = element("label", "", message("time"));
      const time = element("input");
      time.type = "time"; time.name = "time"; time.required = true; time.value = reminder.time || "19:00";
      label.append(time);
      const submit = element("button", "", message(busy ? "working" : "enable"));
      submit.type = "submit"; submit.disabled = busy;
      form.append(element("p", "daily-dj-muted", message("reminderHint")), label, submit);
      if (reminder.enabled) {
        const disable = button(message("disable"), "disable-reminder");
        disable.disabled = busy;
        form.append(disable, element("p", "daily-dj-muted", message("reminderOn", { time: reminder.time })));
      }
      details.append(form);
      return details;
    }
    function render() {
      syncIdentity();
      host.hidden = false;
      host.replaceChildren();
      const header = element("div", "daily-dj-heading");
      const copy = element("div");
      const title = element("h4", "", message("title"));
      title.id = "dailyDjTitle";
      copy.append(element("p", "daily-dj-kicker", message("kicker")), title, element("p", "daily-dj-tagline", message("intro")));
      const badgeKey = access === "premium" ? "premium" : access === "preview" ? "preview" : "unavailable";
      header.append(copy, element("span", "daily-dj-badge", message(badgeKey)));
      host.append(header, element("p", "daily-dj-description", message("description")));
      const canUse = access === "preview" || access === "premium";
      host.append(element("p", "daily-dj-muted", message(access === "premium" ? "memberNote" : canUse ? "accessNote" : "lockedNote")));
      if (!canUse) return;
      const toggle = button(message(opened ? "close" : "open"), "toggle", opened ? "daily-dj-collapse" : "daily-dj-primary");
      toggle.setAttribute("aria-expanded", String(opened));
      toggle.setAttribute("aria-controls", "dailyDjBody");
      host.append(toggle);
      const body = element("div", "daily-dj-body");
      body.id = "dailyDjBody"; body.hidden = !opened;
      host.append(body);
      if (!opened) return;
      const hasHistory = state.history.length > 0;
      const selection = hasHistory ? generate() : null;
      const nav = element("div", "daily-dj-navigation");
      nav.setAttribute("role", "group"); nav.setAttribute("aria-label", message("title"));
      for (const tab of ["today", "history"]) {
        const control = button(message(tab), tab);
        control.setAttribute("aria-pressed", String(view === tab));
        nav.append(control);
      }
      body.append(nav);
      if (view === "today") {
        body.append(preferencesForm(Boolean(selection?.items.length)));
        if (selection) {
          body.append(element("p", "daily-dj-date", message("summary", { count: selection.items.length, date: formatDate(selection.date) })));
          const cards = element("div", "daily-dj-grid");
          selection.items.forEach((item, index) => cards.append(card(item, index)));
          body.append(cards);
          if (selection.items.length < 3) body.append(element("p", "daily-dj-muted", message(selection.items.length ? "partial" : "empty", { count: selection.items.length })));
          if (selection.items.length) body.append(element("p", "daily-dj-muted", message("next")));
        }
      } else {
        const history = state.history.filter((entry) => entry.date !== core.dayKey());
        if (!history.length) body.append(element("p", "daily-dj-muted", message("historyEmpty")));
        for (const entry of history) {
          const details = element("details", "daily-dj-history-entry");
          details.append(element("summary", "", `${formatDate(entry.date)} · ${entry.items.map((item) => item.artist).join(", ")}`));
          details.addEventListener("toggle", () => {
            if (!details.open || details.querySelector(".daily-dj-grid")) return;
            const cards = element("div", "daily-dj-grid");
            entry.items.forEach((item, index) => cards.append(card(item, index)));
            details.append(cards);
          });
          body.append(details);
        }
      }
      body.append(renderReminder(), element("p", "daily-dj-footnote", message("local")));
      const status = element("p", "daily-dj-status");
      status.setAttribute("role", "status"); status.setAttribute("aria-live", "polite");
      body.append(status);
      if (storageFailed) announce("storageError");
    }
    function findItem(key) { return state.history.flatMap((entry) => entry.items).find((item) => item.key === key); }
    async function updateReminder(time) {
      if (!options.reminder || (reminder?.available !== true && reminder?.developmentPreview !== true) || busy || (access !== "preview" && access !== "premium")) return;
      const context = identity;
      busy = true;
      render();
      host.querySelector("#dailyDjReminderSettings")?.setAttribute("open", "");
      try {
        const result = time ? await options.reminder.configure(time, options.getLanguage()) : await options.reminder.cancel();
        if (identity !== context) return;
        reminder = result;
        busy = false; render();
        host.querySelector("#dailyDjReminderSettings")?.setAttribute("open", "");
        announce(result.denied ? "reminderDenied" : time ? "reminderOn" : "reminderOff", { time: result.time });
      } catch (_) { if (identity === context) { busy = false; render(); host.querySelector("#dailyDjReminderSettings")?.setAttribute("open", ""); announce("reminderError"); } }
      finally { busy = false; }
    }
    host.addEventListener("click", (event) => {
      const target = event.target.closest("[data-daily-action]");
      if (!target || !host.contains(target) || (access !== "preview" && access !== "premium")) return;
      const action = target.dataset.dailyAction;
      if (action === "source") { options.onExternalOpen?.(); return; }
      if (action === "toggle") { opened = !opened; render(); host.querySelector('[data-daily-action="toggle"]')?.focus({ preventScroll: true }); return; }
      if (["today", "history"].includes(action)) { view = action; render(); host.querySelector(`[data-daily-action="${action}"]`)?.focus({ preventScroll: true }); return; }
      if (action === "disable-reminder") { void updateReminder(null); return; }
      const item = findItem(target.dataset.key);
      if (!item) return;
      if (action === "listen") {
        if (options.onOpen(item) === false) announce("unavailableSet");
      }
      if (action === "feedback") {
        const prior = state.feedback.find((entry) => entry.artistKey === item.artistKey)?.action;
        if (target.dataset.feedback === "like" && prior !== "like" && options.consumeLike?.() === false) {
          announce("likeLimit");
          return;
        }
        state = core.recordFeedback(state, item, target.dataset.feedback);
        save();
        // Update pressed state without replacing the focused control or collapsing history.
        const current = state.feedback.find((entry) => entry.artistKey === item.artistKey)?.action;
        options.onFeedback?.(item, current || "undo", prior || "");
        host.querySelectorAll('[data-daily-action="feedback"]').forEach((control) => {
          const candidate = findItem(control.dataset.key);
          if (candidate?.artistKey === item.artistKey) control.setAttribute("aria-pressed", String(control.dataset.feedback === current));
        });
        announce(storageFailed ? "storageError" : current ? "feedbackSaved" : "feedbackRemoved");
      }
    });
    host.addEventListener("submit", (event) => {
      const form = event.target;
      if (!form.dataset.dailyForm || (access !== "preview" && access !== "premium")) return;
      event.preventDefault();
      if (form.dataset.dailyForm === "reminder") { void updateReminder(form.elements.time.value); return; }
      const existing = state.history.some((entry) => entry.date === core.dayKey());
      state.preferences = [...new Set([form.elements.style0.value, form.elements.style1.value].filter(Boolean))];
      const selection = generate(); render();
      announce(storageFailed ? "storageError" : existing ? "saved" : selection.items.length ? "next" : "empty");
      host.querySelector(existing ? ".daily-dj-settings summary" : '[data-daily-action="listen"]')?.focus({ preventScroll: true });
    });
    let lastDate = core.dayKey();
    function refreshDay() {
      const date = core.dayKey();
      if (date === lastDate || document.hidden) return;
      lastDate = date;
      if (opened) render();
    }
    root.addEventListener("focus", refreshDay);
    document.addEventListener("visibilitychange", refreshDay);
    const timer = root.setInterval(refreshDay, 60000);
    syncIdentity();
    render();
    const resolveAccess = async () => {
      try {
        const mode = await options.getAccess();
        access = mode === "premium" || mode === "preview" ? mode : "unavailable";
      } catch (_) {
        access = "unavailable";
      }
      render();
      return access;
    };
    void resolveAccess();
    if (options.reminder) options.reminder.status().then((result) => { reminder = result; render(); }).catch(() => {});
    return {
      refresh: render,
      refreshAccess: resolveAccess,
      open() { syncIdentity(); opened = true; view = "today"; render(); },
      reset() { identity = ""; state = null; opened = false; render(); },
      destroy() { root.clearInterval(timer); root.removeEventListener("focus", refreshDay); document.removeEventListener("visibilitychange", refreshDay); }
    };
  }
  root.SonicDailyDjsUi = Object.freeze({ create });
})(window);
