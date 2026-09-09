import billingStore from "../lib/api/_billing-store.js";

function json(payload, status = 200) {
  return new Response(JSON.stringify(payload), {
    status,
    headers: { "Content-Type": "application/json; charset=utf-8", "Cache-Control": "no-store" }
  });
}

export default {
  async fetch(request) {
    if (request.method !== "POST") return json({ ok: false, error: "method_not_allowed" }, 405);
    const rawBody = await request.text();
    if (!rawBody || rawBody.length > 600000) return json({ ok: false, error: "invalid_body" }, 400);
    const provider = new URL(request.url).searchParams.get("provider") || "";
    try {
      if (provider === "stripe") {
        const signature = request.headers.get("stripe-signature") || "";
        if (!signature) return json({ ok: false, error: "missing_signature" }, 400);
        const result = await billingStore.processStripeWebhook(rawBody, signature);
        return json({ ok: true, ...result });
      }
      if (provider === "apple") {
        const result = await billingStore.processAppleNotification(rawBody);
        return json({ ok: true, ...result });
      }
      return json({ ok: false, error: "provider_not_found" }, 404);
    } catch (error) {
      const code = String(error?.message || "webhook_failed");
      const status = /invalid|signature|missing|not_allowed/.test(code) ? 400 : /not_configured|disabled/.test(code) ? 503 : 500;
      return json({ ok: false, error: code }, status);
    }
  }
};
