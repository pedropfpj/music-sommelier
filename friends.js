(function installSonicFriends(scope) {
  "use strict";
  const copy = {
    pt: {
      title: "Amigos", kicker: "O SOM TAMBÉM APROXIMA", intro: "Gente do seu radar. Descobertas para ouvir juntos.",
      audience: "Amigos aceitos", privacy: "Seu perfil público e sua biblioteca continuam com as escolhas de privacidade atuais.",
      feed: "Descobertas compartilhadas", people: "Pessoas", refresh: "Atualizar", loading: "Buscando seu círculo…", retry: "Tentar novamente",
      login: "Entre para encontrar seus amigos", loginHint: "Use sua conta online para enviar pedidos e compartilhar faixas. Nada será publicado ao entrar.", signIn: "Entrar na minha conta",
      identityTitle: "Como seus amigos vão conhecer você?", identityHint: "Seu nome escolhido e o @ do perfil, se houver, aparecem nos pedidos e descobertas. Foto, email, biblioteca e histórico não são compartilhados aqui.",
      name: "Nome para amigos", handle: "Usuário do seu perfil", handleHint: "O usuário é o do perfil atual; altere-o no editor de Perfil.", identitySave: "Usar este nome com amigos", identityEdit: "Alterar meu nome para amigos", identitySaved: "Nome para amigos salvo.",
      actor: "Você aparece como", identityNeeded: "Escolha seu nome para amigos antes de enviar pedidos ou compartilhar.",
      incoming: "Pedidos recebidos", outgoing: "Pedidos enviados", friends: "Seus amigos", noneIncoming: "Nenhum pedido recebido por enquanto.", noneOutgoing: "Nenhum pedido aguardando resposta.", noneFriends: "Seu círculo começa com uma pessoa. Encontre alguém ou crie um convite privado.",
      accept: "Aceitar", decline: "Recusar", cancelRequest: "Cancelar pedido", remove: "Remover amigo", accepted: "Amigos", pending: "Pedido enviado", request: "Adicionar amigo",
      find: "Encontrar pessoas", searchLabel: "Nome ou usuário público", searchHint: "A busca mostra apenas quem permitiu ser encontrado por perfil público. Perfis privados entram por convite.", search: "Buscar", noResults: "Ninguém disponível corresponde a essa busca.", searchMin: "Digite pelo menos 2 caracteres.", results: "Resultados para", searching: "Buscando pessoas…",
      inviteTitle: "Convite privado", inviteHint: "Convide alguém sem tornar seu perfil pesquisável. Abrir o link não cria uma amizade; a pessoa ainda precisa enviar um pedido e você decide.", createInvite: "Criar link de convite", inviteReady: "Seu link privado está pronto.", inviteLink: "Link de convite privado", copy: "Copiar link", copied: "Link copiado.", manualCopy: "Não foi possível copiar automaticamente. Selecione o link acima e copie.", expires: "Válido até", revoke: "Revogar convite", activeInvite: "Convite ativo", noInvites: "Nenhum convite ativo.", inviteOpened: "Você recebeu um convite de", invitePreview: "Conferindo o convite…", inviteUnavailable: "Este convite não está disponível. Ele pode ter expirado ou sido revogado.", previewAgain: "Conferir convite novamente", inviteLogin: "Entre para conferir este convite privado. Abrir o convite não aceita uma amizade.",
      requestTitle: "Enviar um pedido de amizade?", requestAudience: "Essa pessoa verá seu nome para amigos. Só depois do aceite vocês poderão ver as descobertas compartilhadas um do outro.", sendRequest: "Enviar solicitação", requestSent: "Solicitação enviada. Aguarde o aceite.", acceptedMessage: "Amizade aceita.", declinedMessage: "Pedido recusado.", canceledMessage: "Pedido cancelado.",
      removeTitle: "Remover esta amizade?", removeHint: "Vocês deixarão de ver as descobertas compartilhadas um do outro.", removedMessage: "Amizade removida.", cancel: "Cancelar", confirmRemove: "Remover amizade",
      shareTitle: "Uma faixa para o seu círculo", chooseTrack: "Escolher uma faixa", replaceTrack: "Escolher outra faixa", chooseHint: "Escolha uma gravação no Descobrir. Seu histórico nunca é compartilhado automaticamente.", note: "O que te chamou a atenção? (opcional)", notePlaceholder: "Conte por que vale ouvir…", share: "Compartilhar com amigos", shareHint: "Este texto fica nas Descobertas compartilhadas, separado dos comentários públicos do player.", shareEmpty: "Adicione ou aceite um amigo antes de compartilhar. Sua faixa escolhida fica aqui enquanto esta conta estiver aberta.", shared: "Descoberta compartilhada com seus amigos.",
      noPosts: "A próxima descoberta pode vir de um amigo.", noPostsHint: "Quando alguém do seu círculo compartilhar uma faixa, ela aparece aqui. Você também pode abrir a conversa com uma descoberta sua.", play: "Ouvir esta faixa", opening: "Abrindo a faixa…", opened: "Faixa aberta no player.", source: "Fonte da faixa", noSource: "Sem link de origem", sharedBy: "Compartilhada por", delete: "Excluir descoberta", deleteTitle: "Excluir esta descoberta?", deleteHint: "Ela deixa de aparecer para você e seus amigos.", deleted: "Descoberta excluída.", report: "Denunciar", block: "Bloquear pessoa", working: "Aguarde…", error: "Não foi possível concluir agora. Tente novamente; suas alterações continuam aqui.", loginError: "Sua sessão precisa ser renovada. Entre novamente.", setupError: "Amigos ainda não está disponível nesta versão. Tente novamente mais tarde.", conflictError: "Este pedido mudou. Atualize para conferir a situação atual.", limitError: "Você fez muitas ações hoje. Tente novamente mais tarde.", invalidName: "Informe um nome com até 80 caracteres, sem email.", invalidTrack: "Escolha uma faixa com artista e título antes de compartilhar.", trackUnavailable: "Não foi possível abrir esta gravação agora. O link de origem continua disponível.", notFound: "Esta pessoa ou descoberta não está disponível. Atualize a página de Amigos."
    },
    en: {
      title: "Friends", kicker: "MUSIC BRINGS PEOPLE CLOSER", intro: "People in your orbit. Discoveries to hear together.", audience: "Accepted friends", privacy: "Your public profile and library keep their current privacy choices.", feed: "Shared discoveries", people: "People", refresh: "Refresh", loading: "Loading your circle…", retry: "Try again", login: "Sign in to find your friends", loginHint: "Use your online account to send requests and share tracks. Signing in publishes nothing.", signIn: "Sign in to my account",
      identityTitle: "How will your friends know you?", identityHint: "Your chosen name and profile @username, if present, appear on requests and shared discoveries. Your photo, email, library and history are not shared here.", name: "Name for friends", handle: "Your profile username", handleHint: "This is your current profile username; change it in the Profile editor.", identitySave: "Use this name with friends", identityEdit: "Change my name for friends", identitySaved: "Name for friends saved.", actor: "You appear as", identityNeeded: "Choose your name for friends before sending requests or sharing.",
      incoming: "Incoming requests", outgoing: "Sent requests", friends: "Your friends", noneIncoming: "No incoming requests yet.", noneOutgoing: "No requests awaiting a reply.", noneFriends: "Your circle starts with one person. Find someone or create a private invite.", accept: "Accept", decline: "Decline", cancelRequest: "Cancel request", remove: "Remove friend", accepted: "Friends", pending: "Request sent", request: "Add friend",
      find: "Find people", searchLabel: "Public name or username", searchHint: "Search only shows people who allowed discovery through their public profile. Private profiles use an invite.", search: "Search", noResults: "No available people match this search.", searchMin: "Enter at least 2 characters.", results: "Results for", searching: "Finding people…",
      inviteTitle: "Private invite", inviteHint: "Invite someone without making your profile searchable. Opening the link does not create a friendship; they still send a request and you decide.", createInvite: "Create invite link", inviteReady: "Your private link is ready.", inviteLink: "Private invite link", copy: "Copy link", copied: "Link copied.", manualCopy: "Automatic copy failed. Select the link above and copy it.", expires: "Valid until", revoke: "Revoke invite", activeInvite: "Active invite", noInvites: "No active invites.", inviteOpened: "You received an invite from", invitePreview: "Checking the invite…", inviteUnavailable: "This invite is unavailable. It may have expired or been revoked.", previewAgain: "Check invite again", inviteLogin: "Sign in to review this private invite. Opening it does not accept a friendship.",
      requestTitle: "Send a friend request?", requestAudience: "This person will see your name for friends. You can see each other's shared discoveries only after acceptance.", sendRequest: "Send request", requestSent: "Request sent. Wait for acceptance.", acceptedMessage: "Friend request accepted.", declinedMessage: "Request declined.", canceledMessage: "Request canceled.", removeTitle: "Remove this friendship?", removeHint: "You will no longer see each other's shared discoveries.", removedMessage: "Friend removed.", cancel: "Cancel", confirmRemove: "Remove friendship",
      shareTitle: "A track for your circle", chooseTrack: "Choose a track", replaceTrack: "Choose another track", chooseHint: "Choose a recording in Discover. Your history is never shared automatically.", note: "What caught your attention? (optional)", notePlaceholder: "Tell them why it is worth hearing…", share: "Share with friends", shareHint: "This text stays in Shared discoveries, separate from the player's public comments.", shareEmpty: "Add or accept a friend before sharing. Your selected track stays here while this account is open.", shared: "Discovery shared with your friends.", noPosts: "Your next discovery might come from a friend.", noPostsHint: "When someone in your circle shares a track, it appears here. You can start with a discovery of your own.", play: "Listen to this track", opening: "Opening track…", opened: "Track opened in the player.", source: "Track source", noSource: "No source link", sharedBy: "Shared by", delete: "Delete discovery", deleteTitle: "Delete this discovery?", deleteHint: "It will disappear for you and your friends.", deleted: "Discovery deleted.", report: "Report", block: "Block person", working: "Please wait…", error: "Could not finish right now. Try again; your changes remain here.", loginError: "Your session needs to be renewed. Sign in again.", setupError: "Friends is not available in this version yet. Try again later.", conflictError: "This request changed. Refresh to see its current state.", limitError: "Too many actions today. Try again later.", invalidName: "Enter a name of up to 80 characters, without an email.", invalidTrack: "Choose a track with an artist and title before sharing.", trackUnavailable: "This recording could not open right now. Its source link is still available.", notFound: "This person or discovery is unavailable. Refresh Friends."
    },
    es: {
      title: "Amigos", kicker: "LA MÚSICA TAMBIÉN ACERCA", intro: "Personas de tu radar. Descubrimientos para escuchar juntos.", audience: "Amigos aceptados", privacy: "Tu perfil público y tu biblioteca mantienen sus opciones de privacidad actuales.", feed: "Descubrimientos compartidos", people: "Personas", refresh: "Actualizar", loading: "Buscando tu círculo…", retry: "Reintentar", login: "Entra para encontrar a tus amigos", loginHint: "Usa tu cuenta online para enviar solicitudes y compartir temas. Entrar no publica nada.", signIn: "Entrar en mi cuenta",
      identityTitle: "¿Cómo te conocerán tus amigos?", identityHint: "Tu nombre elegido y el @usuario del perfil, si existe, aparecen en solicitudes y descubrimientos. Tu foto, email, biblioteca e historial no se comparten aquí.", name: "Nombre para amigos", handle: "Usuario de tu perfil", handleHint: "Es tu usuario actual; cámbialo en el editor de Perfil.", identitySave: "Usar este nombre con amigos", identityEdit: "Cambiar mi nombre para amigos", identitySaved: "Nombre para amigos guardado.", actor: "Apareces como", identityNeeded: "Elige tu nombre para amigos antes de enviar solicitudes o compartir.", incoming: "Solicitudes recibidas", outgoing: "Solicitudes enviadas", friends: "Tus amigos", noneIncoming: "Todavía no hay solicitudes recibidas.", noneOutgoing: "Ninguna solicitud espera respuesta.", noneFriends: "Tu círculo empieza con una persona. Encuentra a alguien o crea una invitación privada.", accept: "Aceptar", decline: "Rechazar", cancelRequest: "Cancelar solicitud", remove: "Quitar amigo", accepted: "Amigos", pending: "Solicitud enviada", request: "Añadir amigo",
      find: "Encontrar personas", searchLabel: "Nombre o usuario público", searchHint: "Solo aparecen quienes permitieron que se les encuentre por su perfil público. Los perfiles privados usan una invitación.", search: "Buscar", noResults: "Ninguna persona disponible coincide con la búsqueda.", searchMin: "Escribe al menos 2 caracteres.", results: "Resultados para", searching: "Buscando personas…", inviteTitle: "Invitación privada", inviteHint: "Invita a alguien sin hacer tu perfil buscable. Abrir el enlace no crea una amistad; esa persona aún envía una solicitud y tú decides.", createInvite: "Crear enlace de invitación", inviteReady: "Tu enlace privado está listo.", inviteLink: "Enlace de invitación privada", copy: "Copiar enlace", copied: "Enlace copiado.", manualCopy: "No se pudo copiar automáticamente. Selecciona el enlace de arriba y cópialo.", expires: "Válido hasta", revoke: "Revocar invitación", activeInvite: "Invitación activa", noInvites: "No hay invitaciones activas.", inviteOpened: "Recibiste una invitación de", invitePreview: "Comprobando invitación…", inviteUnavailable: "Esta invitación no está disponible. Puede haber caducado o sido revocada.", previewAgain: "Comprobar invitación de nuevo", inviteLogin: "Entra para revisar esta invitación privada. Abrirla no acepta una amistad.",
      requestTitle: "¿Enviar una solicitud de amistad?", requestAudience: "Esta persona verá tu nombre para amigos. Solo después de aceptar podrán ver sus descubrimientos compartidos.", sendRequest: "Enviar solicitud", requestSent: "Solicitud enviada. Espera la aceptación.", acceptedMessage: "Solicitud aceptada.", declinedMessage: "Solicitud rechazada.", canceledMessage: "Solicitud cancelada.", removeTitle: "¿Quitar esta amistad?", removeHint: "Dejarán de ver los descubrimientos compartidos de la otra persona.", removedMessage: "Amistad eliminada.", cancel: "Cancelar", confirmRemove: "Quitar amistad", shareTitle: "Un tema para tu círculo", chooseTrack: "Elegir un tema", replaceTrack: "Elegir otro tema", chooseHint: "Elige una grabación en Descubrir. Tu historial nunca se comparte automáticamente.", note: "¿Qué te llamó la atención? (opcional)", notePlaceholder: "Cuenta por qué vale la pena escucharlo…", share: "Compartir con amigos", shareHint: "Este texto queda en Descubrimientos compartidos, separado de los comentarios públicos del reproductor.", shareEmpty: "Añade o acepta a un amigo antes de compartir. Tu tema elegido queda aquí mientras esta cuenta esté abierta.", shared: "Descubrimiento compartido con tus amigos.", noPosts: "Tu próximo descubrimiento puede venir de un amigo.", noPostsHint: "Cuando alguien de tu círculo comparte un tema, aparece aquí. También puedes empezar con un descubrimiento tuyo.", play: "Escuchar este tema", opening: "Abriendo tema…", opened: "Tema abierto en el reproductor.", source: "Fuente del tema", noSource: "Sin enlace de origen", sharedBy: "Compartido por", delete: "Eliminar descubrimiento", deleteTitle: "¿Eliminar este descubrimiento?", deleteHint: "Dejará de aparecer para ti y tus amigos.", deleted: "Descubrimiento eliminado.", report: "Denunciar", block: "Bloquear persona", working: "Espera…", error: "No se pudo completar ahora. Reintenta; tus cambios siguen aquí.", loginError: "Tu sesión necesita renovarse. Entra de nuevo.", setupError: "Amigos todavía no está disponible en esta versión. Inténtalo más tarde.", conflictError: "Esta solicitud cambió. Actualiza para comprobar su estado.", limitError: "Demasiadas acciones hoy. Inténtalo más tarde.", invalidName: "Escribe un nombre de hasta 80 caracteres, sin email.", invalidTrack: "Elige un tema con artista y título antes de compartir.", trackUnavailable: "No se pudo abrir esta grabación ahora. Su enlace de origen sigue disponible.", notFound: "Esta persona o descubrimiento no está disponible. Actualiza Amigos."
    }
  };
  const escape = value => String(value ?? "").replace(/[&<>"']/g, char => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[char]));
  const safeUrl = value => { try { const url = new URL(String(value || "")); return ["https:", "http:"].includes(url.protocol) && !url.username && !url.password ? url.href : ""; } catch (_) { return ""; } };
  const safeName = value => { const text = String(value || "").trim().slice(0, 80); return /[@\u0000-\u001f\u007f]/.test(text) ? "" : text; };
  const safeHandle = value => /^[a-z0-9][a-z0-9_]{2,29}$/.test(String(value || "")) ? value : "";
  const newRequestId = () => scope.crypto?.randomUUID?.() || "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, char => { const n = Math.floor(Math.random() * 16); return (char === "x" ? n : (n & 3) | 8).toString(16); });
  function cleanTrack(track) {
    if (!track || typeof track !== "object") return null;
    const artist = String(track.artist || "").trim(), title = String(track.title || track.song || "").trim();
    if (!artist || !title || artist.length > 160 || title.length > 220) return null;
    return { artist, title, style: String(track.style || "").slice(0, 100), ...(safeUrl(track.url) ? { url: safeUrl(track.url) } : {}), ...(track.catalogId ? { catalogId: String(track.catalogId).slice(0, 160) } : {}) };
  }
  function mount(root, adapter = {}) {
    if (!root || root.dataset.friendsMounted) return null;
    root.dataset.friendsMounted = "true"; root.classList.add("sonic-friends");
    let epoch = 0, overviewSequence = 0, feedSequence = 0, searchSequence = 0, inviteSequence = 0, destroyed = false, focusMemory = null;
    const accountKey = () => String(adapter.getSessionKey?.() || "");
    const language = () => copy[adapter.getLanguage?.()] ? adapter.getLanguage() : "pt";
    const t = () => copy[language()];
    const freshState = account => ({ account, active: false, view: "feed", overview: null, overviewBusy: false, overviewError: "", feed: [], feedLoaded: false, feedBusy: false, feedError: "", searchQuery: "", searched: "", people: [], searchBusy: false, searchError: "", mutation: "", status: "", error: "", identityEditing: false, identityDraft: "", identityDirty: false, intent: null, invite: null, latestInvite: null, inviteRequestId: "", composer: { track: null, text: "", requestId: "" }, opening: "" });
    let state = freshState(accountKey()), playbackSequence = 0, openedPostId = "";
    const me = () => state.overview?.me || {};
    const enabled = () => me().enabled === true;
    const ownIdentity = () => me().identity || {};
    const current = (account, generation) => !destroyed && state.account === account && account === accountKey() && generation === epoch;
    const errorText = error => {
      const code = String(error?.code || error?.message || "");
      if (code === "login_required") return t().loginError;
      if (code === "friends_identity_required") return t().identityNeeded;
      if (code === "friends_setup_required") return t().setupError;
      if (["request_conflict", "relationship_changed"].includes(code)) return t().conflictError;
      if (code === "invite_not_found") return t().inviteUnavailable;
      if (["person_not_found", "relationship_not_found", "post_not_found"].includes(code)) return t().notFound;
      if (["daily_music_api_limit_reached", "friends_limit_reached"].includes(code)) return t().limitError;
      if (code === "invalid_settings") return t().invalidName;
      if (code === "invalid_track") return t().invalidTrack;
      return t().error;
    };
    async function api(action, payload = {}, method = "GET") {
      if (typeof adapter.request !== "function") throw new Error("friends_unavailable");
      const response = await adapter.request({ action, method, ...payload });
      if (response?.ok !== true) throw Object.assign(new Error("friends_unavailable"), { code: response?.error || "friends_unavailable" });
      return response;
    }
    function sessionChanged(reload = true) {
      const next = accountKey();
      if (state.account === next) return false;
      const active = state.active; epoch++; playbackSequence++; openedPostId = ""; focusMemory = null; state = freshState(next); state.active = active; render();
      if (reload && active && next) void refresh();
      return true;
    }
    async function loadOverview() {
      if (!state.account) return;
      const account = state.account, generation = epoch, sequence = ++overviewSequence;
      state.overviewBusy = true; state.overviewError = ""; render();
      try {
        const payload = await api("overview");
        if (!current(account, generation) || sequence !== overviewSequence) return;
        if (typeof payload.me?.enabled !== "boolean" || !payload.me.identity?.id) throw new Error("friends_unavailable");
        state.overview = { me: payload.me, friends: (Array.isArray(payload.friends) ? payload.friends : []).filter(person => person?.id), incoming: (Array.isArray(payload.incoming) ? payload.incoming : []).filter(row => row?.id && row.person?.id), outgoing: (Array.isArray(payload.outgoing) ? payload.outgoing : []).filter(row => row?.id && row.person?.id), invites: (Array.isArray(payload.invites) ? payload.invites : []).filter(invite => invite?.id) };
        if (!state.identityDirty) state.identityDraft = safeName(payload.me?.identity?.displayName);
      } catch (error) { if (current(account, generation) && sequence === overviewSequence) state.overviewError = errorText(error); }
      finally { if (current(account, generation) && sequence === overviewSequence) { state.overviewBusy = false; render(); } else sessionChanged(); }
    }
    async function loadFeed() {
      if (!state.account) return;
      const account = state.account, generation = epoch, sequence = ++feedSequence;
      state.feedBusy = true; state.feedError = ""; render();
      try {
        const payload = await api("feed");
        if (!current(account, generation) || sequence !== feedSequence) return;
        state.feed = Array.isArray(payload.posts) ? payload.posts : []; state.feedLoaded = true;
      } catch (error) { if (current(account, generation) && sequence === feedSequence) state.feedError = errorText(error); }
      finally { if (current(account, generation) && sequence === feedSequence) { state.feedBusy = false; render(); } else sessionChanged(); }
    }
    async function refresh() { sessionChanged(false); if (!state.account) { render(); return; } await Promise.allSettled([loadOverview(), loadFeed()]); }
    async function search() {
      if (sessionChanged() || !state.account || state.searchBusy) return;
      const query = state.searchQuery.trim();
      if (query.length < 2) { state.searchError = t().searchMin; render(); return; }
      const account = state.account, generation = epoch, sequence = ++searchSequence;
      focusMemory = { id: "friendsSearch" };
      state.searchBusy = true; state.searchError = ""; state.searched = query; render();
      try {
        const response = await api("search", { q: query });
        if (!current(account, generation) || sequence !== searchSequence || query !== state.searchQuery.trim()) return;
        state.people = (Array.isArray(response.people) ? response.people : []).filter(person => person.id && person.id !== ownIdentity().id);
      } catch (error) { if (current(account, generation) && sequence === searchSequence) state.searchError = errorText(error); }
      finally { if (current(account, generation) && sequence === searchSequence) { state.searchBusy = false; render(); } else sessionChanged(); }
    }
    async function previewInvite(token) {
      if (!state.account || !token) return;
      const account = state.account, generation = epoch, sequence = ++inviteSequence;
      state.invite = { token, busy: true, error: "", person: null }; render();
      try {
        const payload = await api("invite-preview", { token }, "POST");
        if (!current(account, generation) || sequence !== inviteSequence) return;
        state.invite = { token, busy: false, error: "", person: payload.person || null, relationship: payload.relationship || "none", relationshipId: payload.relationshipId || "" };
      } catch (error) { if (current(account, generation) && sequence === inviteSequence) state.invite = { token, busy: false, error: errorText(error), person: null }; }
      finally { if (current(account, generation) && sequence === inviteSequence) render(); else sessionChanged(); }
    }
    async function mutate(action, payload, success, complete) {
      if (sessionChanged() || !state.account || state.mutation) return;
      const account = state.account, generation = epoch;
      searchSequence++; state.searchBusy = false;
      state.mutation = action; state.error = ""; state.status = ""; render();
      try {
        const result = await api(action, payload, "POST");
        if (!current(account, generation)) return;
        complete?.(result); state.status = t()[typeof success === "function" ? success(result) : success] || ""; state.intent = null;
        await refresh();
        if (current(account, generation) && state.searched) await search();
        if (current(account, generation) && state.invite?.token) await previewInvite(state.invite.token);
      } catch (error) { if (current(account, generation)) state.error = errorText(error); }
      finally { if (current(account, generation)) { state.mutation = ""; render(); } else sessionChanged(); }
    }
    function compose(track) {
      sessionChanged();
      const next = cleanTrack(track);
      if (!next) { state.error = t().invalidTrack; render(); return false; }
      if (JSON.stringify(next) !== JSON.stringify(state.composer.track)) state.composer = { track: next, text: "", requestId: "" };
      state.view = "feed"; render(); root.querySelector("#friendsNote")?.focus({ preventScroll: true }); return true;
    }
    function identity(person = {}) {
      const name = safeName(person.displayName) || "Sonic listener", handle = safeHandle(person.username);
      return `<span class="friends-avatar" aria-hidden="true">${escape([...name][0] || "S")}</span><span class="friends-person-name"><strong>${escape(name)}</strong>${handle ? `<small>@${escape(handle)}</small>` : ""}</span>`;
    }
    const button = (action, label, attributes = "", extra = "") => `<button type="button" data-friends-action="${action}" class="friends-button ${extra}" ${state.mutation ? "disabled" : ""} ${attributes}>${escape(label)}</button>`;
    function relationFor(person) {
      const id = person.id, overview = state.overview;
      const friend = overview?.friends.find(row => row.id === id);
      if (friend) return { status: "accepted", id: friend.relationshipId };
      for (const kind of ["incoming", "outgoing"]) {
        const request = overview?.[kind].find(row => row.person?.id === id);
        if (request) return { status: kind, id: request.id };
      }
      return { status: person.relationship || "none", id: person.relationshipId || "" };
    }
    function applyRelationship(person, result = {}, blocked = false) {
      const status = result.relationship || "none", relationshipId = result.relationshipId || "";
      if (state.overview) {
        state.overview.friends = state.overview.friends.filter(row => row.id !== person.id);
        for (const kind of ["incoming", "outgoing"]) state.overview[kind] = state.overview[kind].filter(row => row.person.id !== person.id);
        if (!blocked && status === "accepted") state.overview.friends.push({ ...person, relationshipId });
        if (!blocked && ["incoming", "outgoing"].includes(status)) state.overview[status].push({ id: relationshipId, person });
      }
      if (blocked || status !== "accepted") state.feed = state.feed.filter(post => post.author?.id !== person.id);
      state.people = blocked ? state.people.filter(row => row.id !== person.id) : state.people.map(row => row.id === person.id ? { ...row, relationship: status, relationshipId } : row);
      if (state.invite?.person?.id === person.id) {
        if (blocked) state.invite = null;
        else { state.invite.relationship = status; state.invite.relationshipId = relationshipId; }
      }
    }
    function personCard(person, kind, relationshipId = "", inviteToken = "") {
      const attrs = `data-user-id="${escape(person.id)}" data-relationship-id="${escape(relationshipId)}"`;
      const controls = kind === "incoming" ? button("accept", t().accept, attrs, "primary") + button("decline", t().decline, attrs) :
        kind === "outgoing" ? button("cancel-request", t().cancelRequest, attrs) : kind === "accepted" ? button("remove", t().remove, attrs, "quiet") :
          button("request", t().request, `data-user-id="${escape(person.id)}" ${inviteToken ? 'data-from-invite="true"' : ""}`, "primary");
      return `<li class="friends-person"><div class="friends-person-identity">${identity(person)}</div><div class="friends-person-actions">${enabled() ? controls : `<p class="friends-muted">${t().identityNeeded}</p>`}</div></li>`;
    }
    function date(value) { const parsed = new Date(value); return Number.isNaN(parsed.getTime()) ? "" : new Intl.DateTimeFormat({ pt: "pt-BR", en: "en-GB", es: "es-ES" }[language()], { dateStyle: "medium" }).format(parsed); }
    function renderIdentity() {
      const person = ownIdentity();
      if (!state.overview) return "";
      if (enabled() && !state.identityEditing) return `<section class="friends-own-identity"><div><p class="friends-eyebrow">${t().actor}</p><div class="friends-person-identity">${identity(person)}</div></div><div><p class="friends-audience">${t().audience}</p>${button("edit-identity", t().identityEdit, "", "quiet")}</div></section>`;
      return `<section class="friends-setup" aria-labelledby="friendsIdentityTitle"><div><p class="friends-eyebrow">${t().actor}</p><h4 id="friendsIdentityTitle">${t().identityTitle}</h4><p class="friends-muted">${t().identityHint}</p></div><form data-friends-form="identity"><label for="friendsName">${t().name}</label><input id="friendsName" name="friendsName" maxlength="80" required autocomplete="nickname" value="${escape(state.identityDraft)}" ${state.mutation ? "disabled" : ""}><label for="friendsHandle">${t().handle}</label><input id="friendsHandle" value="${escape(safeHandle(person.username))}" readonly aria-describedby="friendsHandleHint"><p id="friendsHandleHint" class="friends-help">${t().handleHint}</p><div class="friends-identity-preview"><span id="friendsIdentityPreview">${escape(safeName(state.identityDraft) || t().name)}</span>${safeHandle(person.username) ? `<span>@${escape(safeHandle(person.username))}</span>` : ""}<span class="friends-audience">${t().audience}</span></div><div class="friends-actions"><button class="friends-button primary" type="submit" ${state.mutation ? "disabled" : ""}>${state.mutation === "settings" ? t().working : t().identitySave}</button>${enabled() ? button("cancel-identity", t().cancel) : ""}</div></form></section>`;
    }
    function renderIntent() {
      const intent = state.intent; if (!intent) return "";
      const request = intent.kind === "request", removing = intent.kind === "remove";
      return `<section class="friends-confirm" aria-labelledby="friendsConfirmTitle"><h4 id="friendsConfirmTitle">${request ? t().requestTitle : removing ? t().removeTitle : t().deleteTitle}</h4>${intent.person ? `<div class="friends-person-identity">${identity(intent.person)}</div>` : `<p class="friends-track-title">${escape(intent.post.track?.artist)} — ${escape(intent.post.track?.title)}</p>`}<p>${request ? t().requestAudience : removing ? t().removeHint : t().deleteHint}</p>${request ? `<div class="friends-actor-preview"><span>${t().actor}</span><strong>${escape(safeName(ownIdentity().displayName))}</strong>${safeHandle(ownIdentity().username) ? `<span>@${escape(safeHandle(ownIdentity().username))}</span>` : ""}<span class="friends-audience">${t().audience}</span></div>` : ""}<div class="friends-actions">${button("confirm", request ? t().sendRequest : removing ? t().confirmRemove : t().delete, 'data-friends-confirm="true"', request ? "primary" : "danger")}${button("cancel-intent", t().cancel)}</div></section>`;
    }
    function renderPeople() {
      const overview = state.overview;
      if (!overview) return "";
      const groups = ["incoming", "outgoing", "friends"].map(kind => {
        const rows = overview[kind];
        return `<section class="friends-section"><div class="friends-section-heading"><h4>${t()[kind]}</h4><span class="friends-count">${rows.length}</span></div>${rows.length ? `<ul class="friends-people-list">${rows.map(row => personCard(kind === "friends" ? row : row.person, kind === "friends" ? "accepted" : kind, kind === "friends" ? row.relationshipId : row.id)).join("")}</ul>` : `<p class="friends-muted">${t()[{ incoming: "noneIncoming", outgoing: "noneOutgoing", friends: "noneFriends" }[kind]]}</p>`}</section>`;
      }).join("");
      const invite = state.invite;
      const preview = invite ? `<section class="friends-section friends-received-invite"><h4>${t().inviteTitle}</h4>${invite.busy ? `<p role="status">${t().invitePreview}</p>` : invite.person ? `<p class="friends-muted">${t().inviteOpened}</p><ul class="friends-people-list">${personCard({ ...invite.person, relationship: invite.relationship, relationshipId: invite.relationshipId }, relationFor({ ...invite.person, relationship: invite.relationship }).status, invite.relationshipId, invite.token)}</ul>` : `<p role="alert">${escape(invite.error || t().inviteUnavailable)}</p>${button("retry-invite", t().previewAgain)}`}</section>` : "";
      const searchResults = state.searchBusy ? `<p role="status">${t().searching}</p>` : state.searchError ? `<p role="alert">${escape(state.searchError)}</p>` : state.searched ? `<p class="friends-help">${t().results} “${escape(state.searched)}”</p>${state.people.length ? `<ul class="friends-people-list">${state.people.map(person => { const relation = relationFor(person); return personCard(person, relation.status, relation.id); }).join("")}</ul>` : `<p class="friends-muted">${t().noResults}</p>`}` : "";
      const latest = state.latestInvite;
      return `${preview}${groups}<section class="friends-section"><h4>${t().find}</h4><form class="friends-search" data-friends-form="search"><label for="friendsSearch">${t().searchLabel}</label><div><input id="friendsSearch" type="search" value="${escape(state.searchQuery)}" minlength="2" maxlength="80" aria-describedby="friendsSearchHint"><button class="friends-button" type="submit" ${state.searchBusy ? "disabled" : ""}>${t().search}</button></div><p id="friendsSearchHint" class="friends-help">${t().searchHint}</p></form>${searchResults}</section><section class="friends-section friends-invites"><h4>${t().inviteTitle}</h4><p class="friends-muted">${t().inviteHint}</p>${enabled() ? button("create-invite", t().createInvite) : `<p class="friends-help">${t().identityNeeded}</p>`}${latest ? `<div class="friends-invite-link"><label for="friendsInviteLink">${t().inviteLink}</label><input id="friendsInviteLink" type="url" readonly value="${escape(latest.url)}"><p class="friends-help">${t().expires} ${escape(date(latest.expiresAt))}</p>${button("copy-invite", t().copy)}</div>` : ""}<ul class="friends-invite-list">${overview.invites.map(invite => `<li><span>${t().activeInvite}<small>${t().expires} ${escape(date(invite.expiresAt))}</small></span>${button("revoke-invite", t().revoke, `data-invite-id="${escape(invite.id)}"`, "quiet")}</li>`).join("")}</ul></section>`;
    }
    function renderComposer() {
      const track = state.composer.track;
      if (!enabled()) return "";
      return `<section class="friends-composer" aria-labelledby="friendsComposerTitle"><div class="friends-section-heading"><h4 id="friendsComposerTitle">${t().shareTitle}</h4><span class="friends-audience">${t().audience}</span></div><p class="friends-help">${t().actor} <strong>${escape(safeName(ownIdentity().displayName))}</strong>${safeHandle(ownIdentity().username) ? `<span>@${escape(safeHandle(ownIdentity().username))}</span>` : ""}</p>${track ? `<div class="friends-chosen-track"><p>${escape(track.artist)}</p><h5>${escape(track.title)}</h5>${track.style ? `<span>${escape(track.style)}</span>` : ""}</div>${button("choose-track", t().replaceTrack, "", "quiet")}<form data-friends-form="share"><label for="friendsNote">${t().note}</label><textarea id="friendsNote" maxlength="280" rows="3" placeholder="${t().notePlaceholder}" ${state.mutation ? "disabled" : ""}>${escape(state.composer.text)}</textarea><p class="friends-help friends-note-count"><span id="friendsNoteCount">${[...state.composer.text].length}</span>/280</p><p class="friends-help">${t().shareHint}</p>${!state.overview.friends.length ? `<p class="friends-muted">${t().shareEmpty}</p>` : ""}<button class="friends-button primary" type="submit" ${state.mutation || !state.overview.friends.length ? "disabled" : ""}>${state.mutation === "share-track" ? t().working : t().share}</button></form>` : `<p class="friends-muted">${t().chooseHint}</p>${button("choose-track", t().chooseTrack, "", "primary")}`}</section>`;
    }
    function renderFeed() {
      const body = state.feedError ? `<div class="friends-empty"><p role="alert">${escape(state.feedError)}</p>${button("retry-feed", t().retry)}</div>` : state.feedBusy && !state.feedLoaded ? `<p role="status" class="friends-empty">${t().loading}</p>` : !state.feed.length ? `<div class="friends-empty"><span class="friends-empty-mark" aria-hidden="true">↗</span><h4>${t().noPosts}</h4><p>${t().noPostsHint}</p>${button("people", t().find)}</div>` : `<ol class="friends-feed">${state.feed.map(post => {
        const own = post.mine === true && post.author?.id === ownIdentity().id;
        const track = cleanTrack(post.track), attrs = `data-post-id="${escape(post.id)}"`;
        return `<li><article class="friends-post"><div class="friends-post-author"><div class="friends-person-identity">${identity(post.author)}</div><time datetime="${escape(post.createdAt || "")}">${escape(date(post.createdAt))}</time></div><p class="friends-audience">${t().audience}</p><div class="friends-post-track"><p>${escape(track?.artist || "")}</p><h4>${escape(track?.title || t().invalidTrack)}</h4>${track?.style ? `<span>${escape(track.style)}</span>` : ""}</div>${post.text ? `<p class="friends-post-note">${escape(post.text)}</p>` : ""}<div class="friends-post-listen">${track ? button("play", state.opening === post.id ? t().opening : t().play, `${attrs} ${state.opening ? "disabled" : ""}`, "primary") : ""}${track?.url ? `<a class="friends-source" href="${escape(track.url)}" target="_blank" rel="noopener noreferrer">${t().source} ↗</a>` : `<span class="friends-help">${t().noSource}</span>`}</div><div class="friends-post-tools">${own ? button("delete-post", t().delete, attrs, "quiet") : `${typeof adapter.onReport === "function" ? button("report", t().report, attrs, "quiet") : ""}${typeof adapter.onBlock === "function" ? button("block", t().block, attrs, "quiet") : ""}`}</div></article></li>`;
      }).join("")}</ol>`;
      return `${renderComposer()}<section aria-labelledby="friendsFeedTitle"><div class="friends-section-heading"><h4 id="friendsFeedTitle">${t().feed}</h4>${button("retry-feed", t().refresh, "", "quiet")}</div>${body}</section>`;
    }
    function render() {
      if (destroyed) return;
      if (root.contains(document.activeElement)) focusMemory = focusDescription(document.activeElement) || focusMemory;
      root.dataset.friendsView = state.view;
      root.setAttribute("aria-busy", String(state.overviewBusy && !state.overview));
      root.innerHTML = `<header class="friends-header"><div><p class="friends-eyebrow">${t().kicker}</p><h3 tabindex="-1" id="friendsTitle">${t().title}</h3><p>${t().intro}</p></div><svg viewBox="0 0 96 72" fill="none" aria-hidden="true"><path d="M23 44 48 22 75 46M23 44h52"/><circle cx="23" cy="44" r="11"/><circle cx="48" cy="22" r="11"/><circle cx="75" cy="46" r="11"/></svg></header><p class="friends-privacy">${t().privacy}</p><div class="friends-feedback" tabindex="-1" role="${state.error ? "alert" : "status"}" aria-live="polite">${escape(state.error || state.status)}</div>${!state.account ? `<section class="friends-empty"><h4>${t().login}</h4><p>${state.invite?.token ? t().inviteLogin : t().loginHint}</p>${button("sign-in", t().signIn, "", "primary")}</section>` : `${state.overviewError ? `<div class="friends-empty"><p role="alert">${escape(state.overviewError)}</p>${button("refresh", t().retry)}</div>` : ""}${!state.overview ? state.overviewBusy ? `<p role="status" class="friends-empty">${t().loading}</p>` : "" : `${renderIdentity()}${renderIntent()}<nav class="friends-views" aria-label="${t().title}"><button type="button" data-friends-action="feed" aria-pressed="${state.view === "feed"}">${t().feed}</button><button type="button" data-friends-action="people" aria-pressed="${state.view === "people"}">${t().people}${state.overview.incoming.length ? ` <span>${state.overview.incoming.length}</span>` : ""}</button></nav><div class="friends-columns"><div class="friends-people-pane" data-friends-pane="people">${renderPeople()}</div><div class="friends-feed-pane" data-friends-pane="feed">${renderFeed()}</div></div>`}`}`;
      const focused = focusControl(focusMemory);
      if (focused) focused.focus({ preventScroll: true });
      else if (focusMemory && !state.mutation && state.status) root.querySelector(".friends-feedback")?.focus({ preventScroll: true });
    }
    function focusDescription(element) {
      if (element?.id) return { id: element.id };
      const action = element?.dataset?.friendsAction;
      return action ? { action, userId: element.dataset.userId || "", postId: element.dataset.postId || "", inviteId: element.dataset.inviteId || "", relationshipId: element.dataset.relationshipId || "" } : null;
    }
    function focusControl(description) {
      if (!description) return null;
      if (description.id) return root.querySelector(`#${description.id}`);
      return [...root.querySelectorAll("[data-friends-action]")].find(element => !element.disabled && element.getClientRects().length && element.dataset.friendsAction === description.action && ["userId", "postId", "inviteId", "relationshipId"].every(key => (element.dataset[key] || "") === description[key]));
    }
    function cancelIntent() {
      if (!state.intent || state.mutation) return;
      const origin = state.intent.origin; state.intent = null; render();
      focusMemory = origin; focusControl(origin)?.focus();
    }
    function showIntent(intent, origin) {
      state.intent = { ...intent, origin: focusDescription(origin) }; render();
      root.querySelector(".friends-confirm")?.scrollIntoView({ block: "center", behavior: "auto" });
      root.querySelector("[data-friends-confirm]")?.focus({ preventScroll: true });
    }
    function findPerson(id) {
      return [...(state.overview?.friends || []), ...(state.overview?.incoming || []).map(row => row.person), ...(state.overview?.outgoing || []).map(row => row.person), ...state.people, state.invite?.person].find(person => person?.id === id);
    }
    async function onClick(event) {
      const target = event.target.closest("[data-friends-action]");
      if (!target || !root.contains(target) || target.disabled || sessionChanged()) return;
      const action = target.dataset.friendsAction;
      if (action === "sign-in") { try { await adapter.signIn?.({ inviteToken: state.invite?.token || "", composeTrack: state.composer.track }); } catch (_) { state.error = t().error; render(); } return; }
      if (["people", "feed"].includes(action)) { state.view = action; render(); return; }
      if (action === "refresh") { await refresh(); return; }
      if (action === "retry-feed") { await loadFeed(); return; }
      if (action === "edit-identity") { state.identityEditing = true; state.identityDraft = safeName(ownIdentity().displayName); render(); root.querySelector("#friendsName")?.focus(); return; }
      if (action === "cancel-identity") { state.identityEditing = false; state.identityDirty = false; state.identityDraft = safeName(ownIdentity().displayName); render(); return; }
      if (action === "retry-invite") { await previewInvite(state.invite?.token); return; }
      if (action === "choose-track") {
        const account = state.account, generation = epoch;
        try { const track = await adapter.chooseTrack?.(); if (track && current(account, generation)) compose(track); }
        catch (_) { if (current(account, generation)) { state.error = t().error; render(); } }
        return;
      }
      if (action === "create-invite") {
        if (!enabled()) return;
        state.inviteRequestId ||= newRequestId();
        await mutate("create-invite", { clientRequestId: state.inviteRequestId }, "inviteReady", result => {
          const url = safeUrl(adapter.makeInviteUrl?.(result.invite?.token));
          if (!url) throw new Error("friends_unavailable");
          state.latestInvite = { ...result.invite, url }; state.inviteRequestId = "";
        }); return;
      }
      if (action === "copy-invite") {
        try { await scope.navigator.clipboard.writeText(state.latestInvite.url); state.status = t().copied; }
        catch (_) { state.status = t().manualCopy; }
        render(); root.querySelector("#friendsInviteLink")?.select(); return;
      }
      if (action === "revoke-invite") {
        await mutate("revoke-invite", { inviteId: target.dataset.inviteId }, "", () => { if (state.latestInvite?.id === target.dataset.inviteId) state.latestInvite = null; }); return;
      }
      if (action === "cancel-intent") { cancelIntent(); return; }
      if (action === "confirm") {
        const intent = state.intent; if (!intent || !enabled()) return;
        if (intent.kind === "request") await mutate("request", { userId: intent.person.id, ...(intent.inviteToken ? { inviteToken: intent.inviteToken } : {}), clientRequestId: intent.requestId }, result => result.relationship === "outgoing" ? "requestSent" : result.relationship === "accepted" ? "acceptedMessage" : "conflictError", result => applyRelationship(intent.person, result));
        if (intent.kind === "remove") await mutate("remove", { userId: intent.person.id, relationshipId: intent.relationshipId }, "removedMessage", result => applyRelationship(intent.person, result));
        if (intent.kind === "delete") await mutate("delete-post", { postId: intent.post.id }, "deleted", () => { state.feed = state.feed.filter(post => post.id !== intent.post.id); });
        return;
      }
      const person = findPerson(target.dataset.userId);
      if (["request", "remove"].includes(action) && person && enabled()) {
        showIntent({ kind: action, person, relationshipId: target.dataset.relationshipId, inviteToken: target.dataset.fromInvite ? state.invite?.token : "", requestId: newRequestId() }, target); return;
      }
      if (["accept", "decline", "cancel-request"].includes(action) && person && enabled()) {
        const cancel = action === "cancel-request";
        await mutate(cancel ? "cancel" : "respond", { userId: person.id, relationshipId: target.dataset.relationshipId, ...(!cancel ? { decision: action === "accept" ? "accept" : "decline" } : {}) }, cancel ? "canceledMessage" : action === "accept" ? "acceptedMessage" : "declinedMessage", result => applyRelationship(person, result)); return;
      }
      const post = state.feed.find(row => row.id === target.dataset.postId); if (!post) return;
      if (action === "delete-post" && post.mine === true && post.author?.id === ownIdentity().id) { showIntent({ kind: "delete", post }, target); return; }
      if (action === "play" && !state.opening) {
        const account = state.account, generation = epoch, playback = ++playbackSequence; openedPostId = ""; state.opening = post.id; state.status = ""; state.error = ""; render();
        try { const ready = await adapter.openTrack?.(post.track, { id: post.id }); if (current(account, generation) && playback === playbackSequence) { if (ready === true || ready?.ok === true) { openedPostId = post.id; state.status = t().opened; } else state.error = t().trackUnavailable; } }
        catch (_) { if (current(account, generation) && playback === playbackSequence) state.error = t().trackUnavailable; }
        finally { if (current(account, generation) && playback === playbackSequence) { state.opening = ""; render(); } else sessionChanged(); }
      }
      if (["block", "report"].includes(action) && post.author?.id !== ownIdentity().id) {
        const account = state.account, generation = epoch;
        try { const result = await (action === "block" ? adapter.onBlock?.(post.author) : adapter.onReport?.({ post, person: post.author })); if (current(account, generation) && (result === true || result?.ok === true)) { if (action === "block") { applyRelationship(post.author, { relationship: "none" }, true); render(); } await refresh(); } }
        catch (error) { if (current(account, generation)) { state.error = errorText(error); render(); } }
      }
    }
    function onInput(event) {
      if (event.target.id === "friendsSearch") state.searchQuery = event.target.value;
      if (event.target.id === "friendsName") { state.identityDraft = event.target.value; state.identityDirty = true; const preview = root.querySelector("#friendsIdentityPreview"); if (preview) preview.textContent = safeName(state.identityDraft) || t().name; }
      if (event.target.id === "friendsNote") { state.composer.text = event.target.value; state.composer.requestId = ""; const count = root.querySelector("#friendsNoteCount"); if (count) count.textContent = [...state.composer.text].length; }
    }
    async function onSubmit(event) {
      const form = event.target.closest("[data-friends-form]"); if (!form) return; event.preventDefault();
      if (sessionChanged() || state.mutation || !state.account) return;
      if (form.dataset.friendsForm === "search") { await search(); return; }
      if (form.dataset.friendsForm === "identity") {
        const name = state.identityDraft.trim();
        if (!name || [...name].length > 80 || !safeName(name)) { state.error = t().invalidName; render(); root.querySelector("#friendsName")?.focus(); return; }
        focusMemory = { id: "friendsName" };
        await mutate("settings", { displayName: name, username: safeHandle(ownIdentity().username) }, "identitySaved", result => { if (result.me?.enabled === true && result.me.identity?.id === ownIdentity().id) state.overview.me = result.me; state.identityDirty = false; state.identityEditing = false; }); return;
      }
      if (form.dataset.friendsForm === "share" && enabled() && state.overview?.friends.length) {
        const track = cleanTrack(state.composer.track); if (!track) { state.error = t().invalidTrack; render(); return; }
        focusMemory = { id: "friendsNote" };
        state.composer.requestId ||= newRequestId();
        await mutate("share-track", { track, text: state.composer.text.trim(), clientRequestId: state.composer.requestId }, "shared", () => { state.composer.text = ""; state.composer.requestId = ""; });
      }
    }
    const onSession = () => sessionChanged();
    const onLanguage = () => render();
    const onKeydown = event => { if (event.key === "Escape" && state.intent && !state.mutation) { event.preventDefault(); cancelIntent(); } };
    root.addEventListener("click", onClick); root.addEventListener("input", onInput); root.addEventListener("submit", onSubmit);
    root.addEventListener("keydown", onKeydown);
    scope.addEventListener("sonic:profile-changed", onSession); scope.addEventListener("sonic:online-session-changed", onSession); scope.addEventListener("sonic:language-changed", onLanguage);
    render();
    return {
      async open(options = {}) { sessionChanged(false); state.active = true; if (options.composeTrack) compose(options.composeTrack); if (options.inviteToken) { state.invite = { token: String(options.inviteToken).slice(0, 512), busy: false }; state.view = "people"; } render(); await refresh(); if (state.account && state.invite?.token) await previewInvite(state.invite.token); },
      compose, refresh, sessionChanged,
      playbackUnavailable(postId) {
        if (sessionChanged() || !postId || (openedPostId !== postId && state.opening !== postId)) return;
        playbackSequence++; openedPostId = ""; state.opening = ""; state.status = ""; state.error = t().trackUnavailable; render();
      },
      destroy() { destroyed = true; epoch++; root.removeEventListener("click", onClick); root.removeEventListener("input", onInput); root.removeEventListener("submit", onSubmit); root.removeEventListener("keydown", onKeydown); scope.removeEventListener("sonic:profile-changed", onSession); scope.removeEventListener("sonic:online-session-changed", onSession); scope.removeEventListener("sonic:language-changed", onLanguage); root.replaceChildren(); delete root.dataset.friendsMounted; }
    };
  }
  const api = Object.freeze({ mount, cleanTrack });
  if (typeof module !== "undefined" && module.exports) module.exports = api;
  else scope.SonicFriends = api;
})(typeof window !== "undefined" ? window : globalThis);
