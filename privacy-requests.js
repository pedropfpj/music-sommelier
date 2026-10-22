(function (root) {
  'use strict';
  const copy = {
    pt: { title: 'Conta, dados e atendimento', intro: 'Solicite exclusão da conta online, cópia ou correção dos dados e análise de reembolso. Apagar dados deste aparelho não exclui a conta online.', kind: 'Tipo de solicitação', delete_account: 'Excluir minha conta e dados online', export: 'Receber cópia dos dados online', correction: 'Corrigir dados', refund: 'Cancelamento, arrependimento ou reembolso', message: 'Detalhes (opcional, até 2.000 caracteres). Não envie senhas, CPF ou dados de cartão.', confirm: 'Confirmo que quero solicitar a exclusão da minha conta e dos dados online associados.', send: 'Registrar solicitação', refresh: 'Consultar meus protocolos', login: 'Entre na sua conta para registrar ou consultar solicitações.', signIn: 'Entrar na conta', pending: 'Registrando…', receipt: 'Solicitação registrada. Protocolo: ', notice: 'O registro inicia o atendimento; a exclusão ou o reembolso depende do processamento. Você receberá uma resposta no e-mail da conta. Assinaturas da loja também podem ser gerenciadas nos ajustes da loja.', empty: 'Nenhum protocolo encontrado.', failure: 'Não foi possível confirmar o registro. Tente novamente com o mesmo pedido ou escreva para pedropfpj@gmail.com. Guarde o protocolo se ele já foi exibido.', open: 'Recebido', processing: 'Em atendimento', completed: 'Concluído', awaiting_user: 'Aguardando sua resposta', closed_with_reason: 'Encerrado com justificativa enviada por e-mail' },
    en: { title: 'Account, data and support', intro: 'Request account deletion, a copy or correction of your data, or a refund review. Clearing this device does not delete your online account.', kind: 'Request type', delete_account: 'Delete my account and online data', export: 'Get a copy of my online data', correction: 'Correct my data', refund: 'Cancellation, withdrawal or refund', message: 'Details (optional, up to 2,000 characters). Do not send passwords, government IDs or card details.', confirm: 'I confirm that I want to request deletion of my account and associated online data.', send: 'Submit request', refresh: 'View my requests', login: 'Sign in to submit or view requests.', signIn: 'Sign in', pending: 'Submitting…', receipt: 'Request received. Reference: ', notice: 'Submitting starts the support process; deletion or refund requires processing. We will respond to your account email. Store subscriptions can also be managed in store settings.', empty: 'No requests found.', failure: 'Could not confirm receipt. Retry the same request or email pedropfpj@gmail.com. Keep any reference already shown.', open: 'Received', processing: 'In progress', completed: 'Completed', awaiting_user: 'Awaiting your response', closed_with_reason: 'Closed with explanation sent by email' },
    es: { title: 'Cuenta, datos y atención', intro: 'Solicita la eliminación de tu cuenta, copia o corrección de datos o revisión de reembolso. Borrar este dispositivo no elimina tu cuenta online.', kind: 'Tipo de solicitud', delete_account: 'Eliminar mi cuenta y datos online', export: 'Recibir copia de mis datos online', correction: 'Corregir mis datos', refund: 'Cancelación, desistimiento o reembolso', message: 'Detalles (opcional, hasta 2.000 caracteres). No envíes contraseñas, documentos ni datos de tarjeta.', confirm: 'Confirmo que quiero solicitar la eliminación de mi cuenta y sus datos online.', send: 'Registrar solicitud', refresh: 'Consultar mis solicitudes', login: 'Entra para registrar o consultar solicitudes.', signIn: 'Entrar', pending: 'Registrando…', receipt: 'Solicitud recibida. Referencia: ', notice: 'El registro inicia la atención; la eliminación o el reembolso requiere procesamiento. Recibirás una respuesta en el correo de la cuenta. Las suscripciones también se gestionan en los ajustes de la tienda.', empty: 'No hay solicitudes.', failure: 'No se pudo confirmar el registro. Reintenta la misma solicitud o escribe a pedropfpj@gmail.com. Guarda la referencia si ya se mostró.', open: 'Recibida', processing: 'En proceso', completed: 'Completada', awaiting_user: 'Esperando tu respuesta', closed_with_reason: 'Cerrada con explicación enviada por correo' }
  };
  function mount(card, adapter) {
    if (!card) return null;
    const $ = selector => card.querySelector(selector), form = $('form');
    const status = $('[data-request-status]'), list = $('[data-request-list]');
    let account = '', generation = 0, busy = false, requestId = '', signature = '';
    const c = () => copy[adapter.language()] || copy.pt;
    function sync() {
      const next = adapter.session()?.user?.id || '';
      if (account !== next) { account = next; generation++; requestId = ''; signature = ''; form.reset(); list.replaceChildren(); status.textContent = ''; }
      card.querySelectorAll('[data-request-copy]').forEach(el => { el.textContent = c()[el.dataset.requestCopy] || ''; });
      $('[data-request-login]').hidden = Boolean(account);
      form.hidden = !account;
      $('[data-request-confirm]').hidden = form.elements.kind.value !== 'delete_account';
      form.elements.confirmDeletion.required = form.elements.kind.value === 'delete_account';
    }
    function lock(value) {
      busy = value;
      form.querySelectorAll('button,input,textarea,select').forEach(el => { el.disabled = value; });
      card.setAttribute('aria-busy', String(value));
    }
    async function call(body) {
      const user = account, session = await adapter.freshSession();
      if (!user || !session?.access_token || session.user?.id !== user) throw new Error('login_required');
      const response = await fetch(adapter.endpoint(), { method: body ? 'POST' : 'GET', cache: 'no-store',
        signal: AbortSignal.timeout(20000), headers: { Authorization: `Bearer ${session.access_token}`, 'Content-Type': 'application/json' },
        body: body ? JSON.stringify(body) : undefined });
      const result = await response.json();
      if (!response.ok || !result.ok) throw new Error(result.error || 'request_failed');
      return result;
    }
    function renderRows(rows) {
      list.replaceChildren();
      if (!rows.length) { list.textContent = c().empty; return; }
      for (const row of rows) {
        const li = document.createElement('li');
        li.textContent = `${c()[row.kind] || row.kind} — ${c()[row.status] || row.status} — ${row.id} — ${new Date(row.created_at).toLocaleDateString(adapter.language())}`;
        list.append(li);
      }
    }
    form.addEventListener('change', sync);
    $('[data-request-signin]').addEventListener('click', adapter.signIn);
    $('[data-request-refresh]').addEventListener('click', async () => {
      if (busy) return;
      const current = generation; lock(true);
      try { const result = await call(); if (current === generation) renderRows(result.requests); }
      catch (_) { if (current === generation) status.textContent = c().failure; }
      finally { lock(false); }
    });
    form.addEventListener('submit', async event => {
      event.preventDefault(); if (busy || !form.reportValidity()) return;
      const current = generation;
      const body = { kind: form.elements.kind.value, message: form.elements.message.value,
        confirmDeletion: form.elements.confirmDeletion.checked };
      const next = JSON.stringify(body);
      if (!requestId || signature !== next) { requestId = crypto.randomUUID(); signature = next; }
      body.requestId = requestId;
      lock(true); status.textContent = c().pending;
      try {
        const result = await call(body);
        if (current !== generation) return;
        status.textContent = `${c().receipt}${result.request.id}. ${c()[result.request.status] || result.request.status}.`;
        renderRows([result.request]);
        // Preserve the idempotency key for a repeated click on the same request.
      } catch (_) { if (current === generation) status.textContent = c().failure; }
      finally { lock(false); }
    });
    sync();
    return { sync };
  }
  root.SonicPrivacyRequests = { mount };
})(window);
