const RESEND_EMAILS_ENDPOINT = "https://api.resend.com/emails";
const DEFAULT_APP_URL = "https://sonicsearch.app";
const DEFAULT_FROM = "Sonic Search <onboarding@resend.dev>";
const DEFAULT_TIMEOUT_MS = 5000;

function text(value = "", maxLength = 1000) {
  return String(value ?? "").trim().slice(0, maxLength);
}

function truthy(value = "") {
  return /^(1|true|yes|on)$/i.test(String(value || "").trim());
}

function escapeHtml(value = "") {
  return String(value ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function isEmailLike(value = "") {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/i.test(String(value || "").trim());
}

function actorName(actor = {}) {
  const displayName = text(actor.displayName || actor.display_name || "", 80);
  const username = text(actor.username || "", 60);
  if (displayName && !isEmailLike(displayName)) return displayName;
  if (username && !isEmailLike(username)) return username;
  return "Sonic listener";
}

function appUrlFromEnv(env = process.env) {
  const candidate = text(env.SONIC_PUBLIC_APP_URL || DEFAULT_APP_URL, 300).replace(/\/+$/, "");
  return /^https?:\/\//i.test(candidate) ? candidate : DEFAULT_APP_URL;
}

function recipientsFromEnv(env = process.env) {
  const configured = env.SONIC_COMMUNITY_NOTIFICATION_EMAIL || env.SONIC_OWNER_EMAILS || "";
  return String(configured)
    .split(",")
    .map((value) => value.trim().toLowerCase())
    .filter((value, index, all) => isEmailLike(value) && all.indexOf(value) === index)
    .slice(0, 10);
}

function notificationConfig(env = process.env) {
  return {
    enabled: truthy(env.SONIC_COMMUNITY_EMAIL_NOTIFICATIONS_ENABLED),
    apiKey: text(env.RESEND_API_KEY || "", 500),
    from: text(env.SONIC_COMMUNITY_NOTIFICATION_FROM || DEFAULT_FROM, 200),
    recipients: recipientsFromEnv(env),
    appUrl: appUrlFromEnv(env),
    timeoutMs: Math.max(1000, Math.min(Number(env.SONIC_COMMUNITY_EMAIL_TIMEOUT_MS) || DEFAULT_TIMEOUT_MS, 10000))
  };
}

function eventContext(event = {}) {
  const parts = [
    text(event.targetLabel || "", 240),
    text(event.artist || "", 160),
    text(event.song || "", 220),
    text(event.style || "", 80),
    text(event.context || "", 240)
  ].filter(Boolean);
  return Array.from(new Set(parts)).join(" · ");
}

function buildCommunityEmail(event = {}, config = notificationConfig()) {
  const isPost = event.kind === "post";
  const isReport = event.kind === "report";
  const actor = actorName(event.actor);
  const title = text(event.title || "", 120);
  const body = text(event.body || "", 1200);
  const topic = text(event.topic || "", 80);
  const context = eventContext(event);
  const targetType = text(event.targetType || "", 40);
  const targetId = text(event.targetId || "", 120);
  const targetAuthorId = text(event.targetAuthorId || "", 120);
  const reason = text(event.reason || "", 120);
  const createdAt = text(event.createdAt || new Date().toISOString(), 60);
  const heading = isReport
    ? "Denúncia de conteúdo na comunidade"
    : isPost
      ? "Nova publicação na comunidade"
      : "Novo comentário na comunidade";
  const subjectDetail = isReport
    ? targetType ? `: ${targetType}` : ""
    : isPost && title ? `: ${title}` : ` de ${actor}`;
  const subject = text(`[Sonic Search] ${heading}${subjectDetail}`, 180);
  const rows = [
    [isReport ? "Denunciante" : "Autor", actor],
    isPost && topic ? ["Tópico", topic] : null,
    isPost && title ? ["Título", title] : null,
    !isPost && targetType ? [isReport ? "Tipo denunciado" : "Onde", targetType] : null,
    isReport && targetId ? ["ID do conteúdo", targetId] : null,
    isReport && targetAuthorId ? ["ID do autor denunciado", targetAuthorId] : null,
    isReport && reason ? ["Motivo", reason] : null,
    context ? ["Contexto", context] : null,
    ["Data", createdAt]
  ].filter(Boolean);
  const plainRows = rows.map(([label, value]) => `${label}: ${value}`).join("\n");
  const textBody = `${heading}\n\n${plainRows}\n\nMensagem:\n${body || "(sem texto)"}\n\nAbrir Sonic Search: ${config.appUrl}`;
  const htmlRows = rows
    .map(([label, value]) => `<tr><td style="padding:4px 12px 4px 0;color:#6b7280;vertical-align:top">${escapeHtml(label)}</td><td style="padding:4px 0;color:#111827">${escapeHtml(value)}</td></tr>`)
    .join("");
  const htmlBody = `<!doctype html><html><body style="margin:0;background:#f3f4f6;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;color:#111827"><div style="max-width:640px;margin:0 auto;padding:32px 16px"><div style="background:#ffffff;border:1px solid #e5e7eb;border-radius:16px;padding:28px"><p style="margin:0 0 8px;color:#16a34a;font-size:13px;font-weight:700;letter-spacing:.08em;text-transform:uppercase">Sonic Search</p><h1 style="margin:0 0 20px;font-size:24px;line-height:1.25">${escapeHtml(heading)}</h1><table style="border-collapse:collapse;font-size:14px">${htmlRows}</table><div style="margin:22px 0;padding:18px;background:#f9fafb;border-radius:12px;white-space:pre-wrap;line-height:1.55">${escapeHtml(body || "(sem texto)")}</div><a href="${escapeHtml(config.appUrl)}" style="display:inline-block;background:#16a34a;color:#ffffff;text-decoration:none;font-weight:700;padding:11px 16px;border-radius:10px">Abrir Sonic Search</a></div></div></body></html>`;

  return {
    from: config.from,
    to: config.recipients,
    subject,
    text: textBody,
    html: htmlBody
  };
}

async function sendCommunityEmail(event = {}, options = {}) {
  const env = options.env || process.env;
  const config = notificationConfig(env);
  if (!config.enabled) return { sent: false, skipped: "disabled" };
  if (!config.apiKey || !config.recipients.length) return { sent: false, skipped: "not_configured" };
  const fetchImpl = options.fetchImpl || global.fetch;
  if (typeof fetchImpl !== "function") return { sent: false, skipped: "fetch_unavailable" };

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), config.timeoutMs);
  try {
    const eventId = text(event.id || `${event.kind || "activity"}-${event.createdAt || Date.now()}`, 180);
    const response = await fetchImpl(RESEND_EMAILS_ENDPOINT, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${config.apiKey}`,
        "Content-Type": "application/json",
        "Idempotency-Key": `sonic-community-${eventId}`.slice(0, 256)
      },
      body: JSON.stringify(buildCommunityEmail(event, config)),
      signal: controller.signal
    });
    const responseText = await response.text();
    if (!response.ok) {
      const error = new Error(`community_email_provider_${response.status}`);
      error.providerResponse = responseText.slice(0, 300);
      throw error;
    }
    let payload = {};
    try {
      payload = responseText ? JSON.parse(responseText) : {};
    } catch {
      payload = {};
    }
    return { sent: true, id: payload.id || "" };
  } finally {
    clearTimeout(timeout);
  }
}

async function notifyCommunityActivity(event = {}, options = {}) {
  try {
    return await sendCommunityEmail(event, options);
  } catch (error) {
    console.error("Community email notification failed", {
      message: error?.message || "delivery_failed",
      providerResponse: error?.providerResponse || ""
    });
    return { sent: false, error: "delivery_failed" };
  }
}

module.exports = {
  actorName,
  buildCommunityEmail,
  notificationConfig,
  notifyCommunityActivity,
  sendCommunityEmail
};
