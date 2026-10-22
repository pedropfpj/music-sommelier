(function (global) {
  'use strict';
  const copy = {
    pt: {
      kicker: 'SUA PRESENÇA NO SONIC', title: 'Um perfil. Novas conexões.',
      intro: 'Apresente-se pelo que você gosta de ouvir. Você escolhe o que compartilhar.',
      login: 'Entre para criar seu perfil', loginHint: 'Use sua conta online para guardar foto e bio no site e no iPhone.',
      edit: 'Editar perfil', photo: 'Escolher foto', remove: 'Remover foto', photoHint: 'JPG, PNG ou WebP, até 8 MB. Recorte quadrado automático.',
      name: 'Como você quer ser chamado?', handle: 'Seu nome de usuário', handleHint: 'De 3 a 30 caracteres: letras sem acento, números e _.',
      bio: 'Sua bio', bioHint: 'Conte um pouco sobre você e o som que te move.',
      privacy: 'Quem pode ver seu perfil?', public: 'Aparecer para outras pessoas no Sonic',
      publicHint: 'Quem tem uma conta no Sonic poderá ver seu nome e @usuário.',
      sharePhoto: 'Mostrar minha foto', shareBio: 'Mostrar minha bio', shareStyles: 'Mostrar meus estilos favoritos',
      privateNote: 'Seu histórico, descartes, dados da conta e Sonic DNA não fazem parte do perfil público. Publicações que você fizer na comunidade continuam visíveis por suas próprias regras.',
      preview: 'É assim que as outras pessoas verão você', privateTitle: 'Por enquanto, só você.', privateHint: 'Ative a visibilidade para fazer parte da comunidade com este perfil.',
      save: 'Salvar perfil', saving: 'Salvando…', unsaved: 'Alterações ainda não salvas.', cancel: 'Descartar alterações', loading: 'Carregando seu perfil…',
      saved: 'Perfil salvo. Suas escolhas de visibilidade foram atualizadas.', retry: 'Tentar novamente',
      demo: 'Prévia local do editor — sem login real, sem envio de foto e sem publicação. As mudanças são descartadas ao recarregar.',
      privateBadge: 'Privado', publicBadge: 'Visível na comunidade', emptyBio: 'Sua bio pode começar com uma música.',
      errors: {
        login_required: 'Sua sessão expirou. Entre novamente para salvar.', profile_setup_required: 'O editor aguarda a atualização do banco. Nada foi publicado. Tente novamente depois da configuração.',
        music_api_disabled: 'O perfil online está indisponível nesta versão. Nada foi salvo.', profile_storage_unavailable: 'Não foi possível conectar. Suas alterações continuam na tela; tente salvar novamente.',
        username_taken: 'Esse @usuário já está em uso. Escolha outro.', invalid_username: 'Use de 3 a 30 letras sem acento, números ou _.',
        invalid_display_name: 'Informe um nome com até 80 caracteres.', invalid_bio: 'A bio deve ter até 280 caracteres.', invalid_privacy: 'Revise as escolhas de visibilidade.',
        invalid_photo: 'Não consegui abrir essa foto. Escolha um JPG, PNG ou WebP válido.', photo_too_large: 'A foto deve ter até 8 MB.',
        profile_text_not_allowed: 'Revise o nome e a bio para manter a comunidade respeitosa.', durable_rate_limit_required: 'A proteção de edições ainda não foi configurada. Nada foi salvo.',
        daily_music_api_limit_reached: 'Você fez muitas edições hoje. Tente novamente mais tarde.', photo_processing: 'Aguarde a preparação da foto antes de salvar.'
      }
    },
    en: {
      kicker: 'YOUR PLACE IN SONIC', title: 'One profile. New connections.', intro: 'Introduce yourself through the music you love. You choose what to share.',
      login: 'Sign in to create your profile', loginHint: 'Use your online account to keep your photo and bio on the web and iPhone.', edit: 'Edit profile',
      photo: 'Choose photo', remove: 'Remove photo', photoHint: 'JPG, PNG or WebP, up to 8 MB. Automatic square crop.',
      name: 'What should we call you?', handle: 'Your username', handleHint: '3–30 characters: unaccented letters, numbers and _.', bio: 'Your bio', bioHint: 'A little about you and the music that moves you.',
      privacy: 'Who can see your profile?', public: 'Appear to other people on Sonic', publicHint: 'People with a Sonic account can see your name and @username.',
      sharePhoto: 'Show my photo', shareBio: 'Show my bio', shareStyles: 'Show my favorite styles',
      privateNote: 'Your history, rejected tracks, account data and Sonic DNA are not part of your public profile. Community posts remain visible under their own rules.',
      preview: 'This is how other people will see you', privateTitle: 'Just you, for now.', privateHint: 'Enable visibility to join the community with this profile.',
      save: 'Save profile', saving: 'Saving…', unsaved: 'Changes not saved yet.', cancel: 'Discard changes', loading: 'Loading your profile…', saved: 'Profile saved. Visibility choices updated.', retry: 'Try again',
      demo: 'Local editor preview — no real login, photo upload or publication. Changes disappear on reload.', privateBadge: 'Private', publicBadge: 'Visible in the community', emptyBio: 'Your bio could start with a song.',
      errors: { login_required: 'Your session expired. Sign in again to save.', profile_setup_required: 'The editor needs the database update. Nothing was published. Try again after setup.', music_api_disabled: 'Online profiles are unavailable in this version. Nothing was saved.', profile_storage_unavailable: 'Could not connect. Your changes remain on screen; try saving again.', username_taken: 'That @username is taken. Choose another.', invalid_username: 'Use 3–30 unaccented letters, numbers or _.', invalid_display_name: 'Enter a name with up to 80 characters.', invalid_bio: 'Your bio must be 280 characters or fewer.', invalid_privacy: 'Review your visibility choices.', invalid_photo: 'Could not open that photo. Choose a valid JPG, PNG or WebP.', photo_too_large: 'Photos must be 8 MB or smaller.', profile_text_not_allowed: 'Review your name and bio to keep the community respectful.', durable_rate_limit_required: 'Edit protection has not been configured. Nothing was saved.', daily_music_api_limit_reached: 'Too many edits today. Try again later.', photo_processing: 'Wait for the photo to finish processing before saving.' }
    },
    es: {
      kicker: 'TU ESPACIO EN SONIC', title: 'Un perfil. Nuevas conexiones.', intro: 'Preséntate a través de la música que te gusta. Tú eliges qué compartir.',
      login: 'Entra para crear tu perfil', loginHint: 'Usa tu cuenta online para guardar foto y bio en la web y el iPhone.', edit: 'Editar perfil',
      photo: 'Elegir foto', remove: 'Quitar foto', photoHint: 'JPG, PNG o WebP, hasta 8 MB. Recorte cuadrado automático.',
      name: '¿Cómo quieres que te llamemos?', handle: 'Tu nombre de usuario', handleHint: 'De 3 a 30 caracteres: letras sin acento, números y _.', bio: 'Tu bio', bioHint: 'Un poco sobre ti y la música que te mueve.',
      privacy: '¿Quién puede ver tu perfil?', public: 'Aparecer para otras personas en Sonic', publicHint: 'Quienes tengan una cuenta en Sonic podrán ver tu nombre y @usuario.',
      sharePhoto: 'Mostrar mi foto', shareBio: 'Mostrar mi bio', shareStyles: 'Mostrar mis estilos favoritos',
      privateNote: 'Tu historial, pistas descartadas, datos de cuenta y Sonic DNA no forman parte del perfil público. Las publicaciones de la comunidad siguen sus propias reglas.',
      preview: 'Así te verán otras personas', privateTitle: 'Por ahora, solo tú.', privateHint: 'Activa la visibilidad para participar en la comunidad con este perfil.',
      save: 'Guardar perfil', saving: 'Guardando…', unsaved: 'Cambios aún no guardados.', cancel: 'Descartar cambios', loading: 'Cargando tu perfil…', saved: 'Perfil guardado. Visibilidad actualizada.', retry: 'Intentar de nuevo',
      demo: 'Vista previa local — sin login real, envío de foto ni publicación. Los cambios desaparecen al recargar.', privateBadge: 'Privado', publicBadge: 'Visible en la comunidad', emptyBio: 'Tu bio puede empezar con una canción.',
      errors: { login_required: 'Tu sesión caducó. Entra de nuevo para guardar.', profile_setup_required: 'El editor necesita actualizar la base de datos. Nada se publicó. Inténtalo después de la configuración.', music_api_disabled: 'El perfil online no está disponible en esta versión. Nada se guardó.', profile_storage_unavailable: 'No se pudo conectar. Tus cambios siguen en pantalla; intenta guardar de nuevo.', username_taken: 'Ese @usuario ya está en uso. Elige otro.', invalid_username: 'Usa de 3 a 30 letras sin acento, números o _.', invalid_display_name: 'Escribe un nombre de hasta 80 caracteres.', invalid_bio: 'La bio debe tener hasta 280 caracteres.', invalid_privacy: 'Revisa las opciones de visibilidad.', invalid_photo: 'No pude abrir esa foto. Elige un JPG, PNG o WebP válido.', photo_too_large: 'La foto debe tener hasta 8 MB.', profile_text_not_allowed: 'Revisa el nombre y la bio para mantener una comunidad respetuosa.', durable_rate_limit_required: 'La protección de ediciones aún no está configurada. Nada se guardó.', daily_music_api_limit_reached: 'Demasiadas ediciones hoy. Inténtalo más tarde.', photo_processing: 'Espera a que se prepare la foto antes de guardar.' }
    }
  };
  function validate(draft) {
    if (!draft.displayName.trim() || [...draft.displayName.trim()].length > 80 || /[\u0000-\u001f\u007f]/.test(draft.displayName)) return 'invalid_display_name';
    if (!/^[a-z0-9][a-z0-9_]{2,29}$/.test(draft.username.trim().toLowerCase())) return 'invalid_username';
    if ([...draft.bio.trim()].length > 280) return 'invalid_bio';
    return '';
  }
  function project(draft, styles = []) {
    if (!draft.privacy.public) return null;
    return { displayName: draft.displayName, username: draft.username,
      bio: draft.privacy.bio ? draft.bio : '', photo: draft.privacy.photo,
      styles: draft.privacy.styles ? styles : [] };
  }
  function mount(root, adapter) {
    if (!root || root.dataset.profileMounted) return null;
    root.dataset.profileMounted = 'true';
    const $ = selector => root.querySelector(selector);
    const form = $('form'), name = $('[name=displayName]'), handle = $('[name=username]'), bio = $('[name=bio]');
    const photoInput = $('[name=photo]'), status = $('[data-profile-status]');
    const save = $('[data-profile-save]'), edit = $('[data-profile-edit]');
    const controls = { public: $('[name=public]'), photo: $('[name=sharePhoto]'), bio: $('[name=shareBio]'), styles: $('[name=shareStyles]') };
    const local = /^(localhost|127\.0\.0\.1)$/.test(global.location.hostname);
    const query = new URLSearchParams(global.location.search);
    const previewMode = local && query.get('qa') === '1' && query.get('profilePreview') === '1';
    let userId = '', generation = 0, loaded = false, loading = false, attempted = false, busy = false, dirty = false, editing = false;
    let savedRow = null, avatarUrl = '', photoData = '', photoPreparing = false, photoGeneration = 0, removePhoto = false, timer = 0;
    function c() { return copy[adapter.language()] || copy.pt; }
    function tell(key, error = false) {
      status.textContent = c().errors[key] || c()[key] || c().errors.profile_storage_unavailable;
      status.classList.toggle('error', error);
      status.setAttribute('role', error ? 'alert' : 'status');
    }
    function draft() {
      return { displayName: name.value, username: handle.value.toLowerCase(), bio: bio.value,
        privacy: Object.fromEntries(Object.entries(controls).map(([key, el]) => [key, el.checked])) };
    }
    function setAvatar(el, url, label) {
      el.replaceChildren();
      if (/^(https?:\/\/|data:image\/jpeg;base64,)/.test(url || '')) {
        const img = document.createElement('img'); img.src = url; img.alt = ''; img.width = 80; img.height = 80; img.referrerPolicy = 'no-referrer';
        img.onerror = () => { el.textContent = (label || 'S').slice(0, 1).toUpperCase(); };
        el.append(img);
      } else el.textContent = (label || 'S').slice(0, 1).toUpperCase();
    }
    function renderPreview() {
      const value = draft(), view = project(value, savedRow?.favorite_styles || []);
      const photo = photoData ? `data:image/jpeg;base64,${photoData}` : removePhoto ? '' : avatarUrl;
      setAvatar($('[data-profile-avatar]'), photo, value.displayName);
      $('[data-profile-own-name]').textContent = savedRow?.display_name || value.displayName;
      $('[data-profile-own-handle]').textContent = savedRow?.username ? `@${savedRow.username}` : '';
      $('[data-profile-own-bio]').textContent = savedRow?.bio || '';
      $('[data-profile-own-bio]').hidden = !savedRow?.bio;
      $('[data-profile-private-preview]').hidden = Boolean(view);
      $('[data-profile-public-preview]').hidden = !view;
      if (view) {
        setAvatar($('[data-profile-preview-avatar]'), view.photo ? photo : '', view.displayName);
        $('[data-profile-preview-name]').textContent = view.displayName || c().name;
        $('[data-profile-preview-handle]').textContent = value.username ? `@${value.username}` : '@sonic';
        $('[data-profile-preview-bio]').textContent = view.bio;
        $('[data-profile-preview-bio]').hidden = !view.bio;
        const styles = $('[data-profile-preview-styles]'); styles.replaceChildren();
        for (const style of view.styles.slice(0, 6)) {
          const span = document.createElement('span'); span.textContent = adapter.styleLabel?.(style) || style; styles.append(span);
        }
      }
      $('[data-profile-bio-count]').textContent = `${[...bio.value].length}/280`;
      $('[data-profile-badge]').textContent = savedRow?.profile_public === true ? c().publicBadge : c().privateBadge;
      for (const key of ['photo', 'bio', 'styles']) controls[key].disabled = !value.privacy.public || busy;
      $('[data-profile-remove]').disabled = busy || (!photoData && !avatarUrl);
    }
    function render() {
      root.querySelectorAll('[data-profile-copy]').forEach(el => { el.textContent = c()[el.dataset.profileCopy] || ''; });
      $('[data-profile-demo]').hidden = !previewMode;
      $('[data-profile-login-panel]').hidden = Boolean(userId);
      $('[data-profile-content]').hidden = !userId || !loaded;
      $('[data-profile-retry]').hidden = !userId || loaded || loading;
      form.hidden = !editing;
      edit.hidden = editing || !loaded;
      root.setAttribute('aria-busy', String(busy || loading));
      form.querySelectorAll('input,textarea,button').forEach(el => { el.disabled = busy; });
      save.textContent = busy ? c().saving : c().save;
      save.disabled = busy || photoPreparing || !dirty;
      renderPreview();
    }
    function resetDraft() {
      const row = savedRow || {};
      name.value = row.display_name || adapter.suggestName() || '';
      handle.value = row.username || adapter.suggestUsername() || '';
      bio.value = row.bio || '';
      controls.public.checked = row.profile_public === true;
      controls.photo.checked = row.show_avatar === true;
      controls.bio.checked = row.show_bio === true;
      controls.styles.checked = row.show_styles === true;
      photoData = ''; removePhoto = false; photoPreparing = false; photoGeneration++; photoInput.value = ''; dirty = false;
      render();
    }
    async function call(body) {
      const session = await adapter.freshSession();
      if (!session?.access_token || session.user?.id !== userId) throw new Error('login_required');
      const response = await fetch(adapter.endpoint(), {
        method: body ? 'POST' : 'GET', cache: 'no-store', signal: AbortSignal.timeout(20000),
        headers: { Authorization: `Bearer ${session.access_token}`, 'Content-Type': 'application/json' },
        body: body ? JSON.stringify(body) : undefined
      });
      const result = await response.json();
      if (!response.ok || !result.ok) throw new Error(result.error || 'profile_storage_unavailable');
      return result;
    }
    async function load() {
      if (!userId || loading) return;
      const token = generation; loading = true; attempted = true; tell('loading'); render();
      try {
        const result = previewMode ? { profile: { display_name: 'Sonic Listener', username: 'sonic_listener', bio: '', favorite_styles: ['indie', 'reggae', 'house'] } } : await call();
        if (token !== generation) return;
        savedRow = result.profile; avatarUrl = result.avatarUrl || ''; loaded = true; editing = !savedRow;
        if (!previewMode) adapter.onLoaded?.(savedRow, avatarUrl);
        resetDraft(); status.textContent = '';
      } catch (error) { if (token === generation) tell(error.message, true); }
      finally { if (token === generation) { loading = false; render(); } }
    }
    function sync() {
      const id = previewMode ? 'local-profile-editor-preview' : adapter.session()?.user?.id || '';
      if (id !== userId) {
        generation++; userId = id; loaded = false; loading = false; attempted = false; busy = false; savedRow = null; avatarUrl = ''; editing = false;
        status.textContent = ''; resetDraft();
      }
      render();
      if (userId && !loaded && !loading && !attempted) void load();
    }
    async function choosePhoto(file) {
      if (!file) return;
      if (file.size > 8 * 1024 * 1024) { tell('photo_too_large', true); return; }
      if (!['image/jpeg', 'image/png', 'image/webp'].includes(file.type)) { tell('invalid_photo', true); return; }
      const token = generation, selection = ++photoGeneration;
      photoPreparing = true; render();
      const url = URL.createObjectURL(file);
      try {
        const img = new Image(); img.src = url; await img.decode();
        if (!img.width || !img.height || img.width * img.height > 40000000) throw new Error('invalid_photo');
        const canvas = document.createElement('canvas'); canvas.width = 512; canvas.height = 512;
        const size = Math.min(img.width, img.height);
        canvas.getContext('2d').drawImage(img, (img.width - size) / 2, (img.height - size) / 2, size, size, 0, 0, 512, 512);
        const data = canvas.toDataURL('image/jpeg', 0.82).split(',')[1];
        if (!data || data.length > 699052) throw new Error('invalid_photo');
        if (token !== generation || selection !== photoGeneration) return;
        photoData = data; removePhoto = false; dirty = true; tell('unsaved');
      } catch (error) { if (token === generation && selection === photoGeneration) tell(error.message, true); }
      finally { URL.revokeObjectURL(url); if (token === generation && selection === photoGeneration) { photoPreparing = false; render(); } }
    }
    edit.addEventListener('click', () => { editing = true; resetDraft(); status.textContent = ''; name.focus(); });
    $('[data-profile-cancel]').addEventListener('click', () => { editing = false; resetDraft(); status.textContent = ''; edit.focus(); });
    $('[data-profile-photo]').addEventListener('click', () => photoInput.click());
    photoInput.addEventListener('change', () => void choosePhoto(photoInput.files?.[0]));
    $('[data-profile-remove]').addEventListener('click', () => { photoGeneration++; photoPreparing = false; photoData = ''; removePhoto = true; dirty = true; photoInput.value = ''; tell('unsaved'); render(); });
    form.addEventListener('input', event => { if (event.target !== photoInput) { dirty = true; tell('unsaved'); render(); } });
    $('[data-profile-login]').addEventListener('click', () => adapter.signIn());
    $('[data-profile-retry]').addEventListener('click', () => void load());
    form.addEventListener('submit', async event => {
      event.preventDefault();
      if (busy || !dirty) return;
      if (photoPreparing) { tell('photo_processing', true); return; }
      const body = draft(), invalid = validate(body);
      if (invalid) { tell(invalid, true); ({ invalid_display_name: name, invalid_username: handle, invalid_bio: bio }[invalid]).focus(); return; }
      const token = generation; busy = true; tell('saving'); render();
      try {
        const result = previewMode ? {
          profile: { ...savedRow, display_name: body.displayName.trim(), username: body.username.trim(), bio: body.bio.trim(),
            profile_public: body.privacy.public, show_avatar: body.privacy.photo, show_bio: body.privacy.bio, show_styles: body.privacy.styles },
          avatarUrl: photoData ? `data:image/jpeg;base64,${photoData}` : removePhoto ? '' : avatarUrl
        } : await call({ ...body, ...(photoData ? { photo: photoData } : {}), removePhoto });
        if (token !== generation) return;
        savedRow = result.profile; avatarUrl = result.avatarUrl || ''; editing = false;
        if (!previewMode) adapter.onSaved(savedRow, avatarUrl);
        resetDraft(); tell('saved'); edit.focus();
      } catch (error) { if (token === generation) tell(error.message, true); }
      finally { if (token === generation) { busy = false; render(); } }
    });
    global.addEventListener('beforeunload', event => { if (dirty && !previewMode) { event.preventDefault(); event.returnValue = ''; } });
    global.addEventListener('sonic:profile-changed', sync);
    global.addEventListener('sonic:online-session-changed', sync);
    global.addEventListener('sonic:language-changed', render);
    // Refresh owner photo capabilities only when this card is visible; never publish a URL.
    timer = global.setInterval(async () => {
      if (!userId || !loaded || busy || previewMode || !root.getBoundingClientRect().height || document.hidden) return;
      const token = generation;
      try {
        const result = await call();
        if (token !== generation || busy) return;
        if (!editing && !dirty) {
          savedRow = result.profile; avatarUrl = result.avatarUrl || ''; adapter.onLoaded?.(savedRow, avatarUrl); resetDraft();
        } else if (result.profile?.avatar_path === savedRow?.avatar_path) {
          // Renew the saved photo, not the in-progress draft or chosen replacement.
          avatarUrl = result.avatarUrl || ''; renderPreview();
        }
      } catch (_) {}
    }, 45000);
    sync();
    return { sync, destroy() { clearInterval(timer); } };
  }
  global.SonicUserProfile = { mount, validate, project };
  if (typeof module === 'object' && module.exports) module.exports = { validate, project };
})(typeof window !== 'undefined' ? window : globalThis);
