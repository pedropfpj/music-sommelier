const crypto = require("node:crypto");
const fs = require("node:fs");
const path = require("node:path");
const Stripe = require("stripe");
const {
  Environment,
  SignedDataVerifier
} = require("@apple/app-store-server-library");

const APPLE_BUNDLE_ID = "app.sonicsearch.ios";
const APPLE_MONTHLY_PRODUCT_ID = "app.sonicsearch.ios.premium.monthly";
const APPLE_YEARLY_PRODUCT_ID = "app.sonicsearch.ios.premium.yearly";

function env(name, fallback = "") {
  const value = String(process.env[name] || "").trim();
  return value || fallback;
}

function enabled() {
  return ["1", "true", "yes", "on", "enabled"].includes(env("SONIC_BILLING_ENABLED").toLowerCase());
}

function stripeWebhooksEnabled() {
  return ["1", "true", "yes", "on", "enabled"].includes(env("SONIC_STRIPE_WEBHOOKS_ENABLED").toLowerCase());
}

function supabaseConfig() {
  return {
    url: env("SUPABASE_URL").replace(/\/+$/, ""),
    serviceKey: env("SUPABASE_SERVICE_ROLE_KEY")
  };
}

function supabaseHeaders(serviceKey, extras = {}) {
  return {
    apikey: serviceKey,
    Authorization: `Bearer ${serviceKey}`,
    Accept: "application/json",
    ...extras
  };
}

function stripeClient() {
  const secret = env("STRIPE_SECRET_KEY");
  return secret ? new Stripe(secret) : null;
}

function stripePriceIds() {
  return {
    monthly: env("STRIPE_PREMIUM_MONTHLY_PRICE_ID"),
    yearly: env("STRIPE_PREMIUM_YEARLY_PRICE_ID")
  };
}

function appleProductIds() {
  return {
    monthly: env("APPLE_PREMIUM_MONTHLY_PRODUCT_ID", APPLE_MONTHLY_PRODUCT_ID),
    yearly: env("APPLE_PREMIUM_YEARLY_PRODUCT_ID", APPLE_YEARLY_PRODUCT_ID)
  };
}

function premiumTrialDays() {
  const value = Number.parseInt(env("SONIC_PREMIUM_TRIAL_DAYS", "14"), 10);
  return Number.isFinite(value) ? Math.max(0, Math.min(31, value)) : 14;
}

function launchPreviewPlans() {
  const trialDays = premiumTrialDays();
  return [
    {
      cadence: "monthly",
      interval: "month",
      trialDays,
      trialEligible: true,
      preview: true,
      regionalPrices: {
        BRL: "R$ 9,90",
        EUR: "€ 2,99",
        USD: "US$ 2.99"
      }
    },
    {
      cadence: "yearly",
      interval: "year",
      trialDays,
      trialEligible: true,
      preview: true,
      regionalPrices: {
        BRL: "R$ 79,90",
        EUR: "€ 24,99",
        USD: "US$ 24.99"
      }
    }
  ];
}

function billingAvailability() {
  const prices = stripePriceIds();
  const appleAppId = Number.parseInt(env("APPLE_APP_ID"), 10);
  return {
    enabled: enabled(),
    web: Boolean(enabled() && stripeClient() && prices.monthly && prices.yearly && env("STRIPE_WEBHOOK_SECRET")),
    appleSandbox: enabled(),
    appleProduction: Boolean(enabled() && Number.isFinite(appleAppId) && appleAppId > 0),
    appleProductIds: appleProductIds(),
    trialDays: premiumTrialDays()
  };
}

function assertStoreConfigured() {
  const config = supabaseConfig();
  if (!config.url || !config.serviceKey) throw new Error("billing_store_not_configured");
  return config;
}

async function readMembership(userId) {
  const config = assertStoreConfigured();
  const query = new URLSearchParams({
    user_id: `eq.${userId}`,
    select: "user_id,plan_code,status,provider,provider_customer_ref,provider_subscription_ref,current_period_start,current_period_end,cancel_at_period_end,metadata",
    limit: "1"
  });
  const response = await fetch(`${config.url}/rest/v1/sonic_memberships?${query}`, {
    headers: supabaseHeaders(config.serviceKey)
  });
  const rows = await response.json().catch(() => ([]));
  if (!response.ok) throw new Error("membership_read_failed");
  return Array.isArray(rows) ? rows[0] || null : null;
}

async function upsertMembership(row) {
  const config = assertStoreConfigured();
  const response = await fetch(`${config.url}/rest/v1/sonic_memberships?on_conflict=user_id`, {
    method: "POST",
    headers: supabaseHeaders(config.serviceKey, {
      "Content-Type": "application/json",
      Prefer: "resolution=merge-duplicates,return=representation"
    }),
    body: JSON.stringify([row])
  });
  const rows = await response.json().catch(() => ([]));
  if (!response.ok) throw new Error("membership_write_failed");
  return Array.isArray(rows) ? rows[0] || row : row;
}

async function claimBillingEvent(provider, eventId, eventType, rawPayload = "") {
  const config = assertStoreConfigured();
  const payloadHash = crypto.createHash("sha256").update(String(rawPayload || "")).digest("hex");
  const response = await fetch(`${config.url}/rest/v1/rpc/claim_sonic_billing_event`, {
    method: "POST",
    headers: supabaseHeaders(config.serviceKey, {
      "Content-Type": "application/json",
      Prefer: "return=representation"
    }),
    body: JSON.stringify({
      event_provider: provider,
      event_id: eventId,
      event_kind: eventType,
      event_payload_hash: payloadHash
    })
  });
  const claimed = await response.json().catch(() => false);
  if (!response.ok) throw new Error("billing_event_claim_failed");
  return claimed === true;
}

async function finishBillingEvent(provider, eventId, error = "") {
  const config = assertStoreConfigured();
  const query = new URLSearchParams({ provider: `eq.${provider}`, provider_event_id: `eq.${eventId}` });
  const response = await fetch(`${config.url}/rest/v1/sonic_billing_events?${query}`, {
    method: "PATCH",
    headers: supabaseHeaders(config.serviceKey, { "Content-Type": "application/json", Prefer: "return=minimal" }),
    body: JSON.stringify({
      processed: !error,
      processing_error: error ? String(error).slice(0, 600) : null,
      processing_started_at: null,
      processed_at: new Date().toISOString()
    })
  });
  if (!response.ok) throw new Error("billing_event_finish_failed");
}

function originUrl(value = "") {
  const allowed = new Set([
    env("SONIC_APP_ORIGIN", "https://sonicsearch.app").replace(/\/+$/, ""),
    "https://sonicsearch.app",
    "https://www.sonicsearch.app"
  ]);
  try {
    const parsed = new URL(value);
    const origin = parsed.origin.replace(/\/+$/, "");
    if (allowed.has(origin) || /^(http:\/\/localhost|http:\/\/127\.0\.0\.1)(:\d+)?$/.test(origin)) return origin;
  } catch (_) { /* Use the canonical production origin. */ }
  return env("SONIC_APP_ORIGIN", "https://sonicsearch.app").replace(/\/+$/, "");
}

function unixIso(value) {
  const seconds = Number(value) || 0;
  return seconds > 0 ? new Date(seconds * 1000).toISOString() : null;
}

function stripePeriod(subscription = {}) {
  const item = subscription?.items?.data?.[0] || {};
  return {
    start: unixIso(subscription.current_period_start || item.current_period_start),
    end: unixIso(subscription.current_period_end || item.current_period_end)
  };
}

function sonicStripeStatus(status = "") {
  const value = String(status || "").toLowerCase();
  if (value === "active") return "active";
  if (value === "trialing") return "trialing";
  if (value === "past_due" || value === "unpaid") return "past_due";
  if (value === "paused") return "paused";
  if (value === "canceled") return "canceled";
  if (value === "incomplete" || value === "incomplete_expired") return "incomplete";
  return "expired";
}

async function userIdForStripeSubscription(stripe, subscription) {
  const direct = String(subscription?.metadata?.sonic_user_id || "").trim();
  if (direct) return direct;
  const customerId = typeof subscription?.customer === "string" ? subscription.customer : subscription?.customer?.id;
  if (!customerId) return "";
  const customer = await stripe.customers.retrieve(customerId);
  return String(customer?.metadata?.sonic_user_id || "").trim();
}

async function applyStripeSubscription(subscription, userId = "") {
  const stripe = stripeClient();
  if (!stripe) throw new Error("stripe_not_configured");
  const resolvedUserId = userId || await userIdForStripeSubscription(stripe, subscription);
  if (!resolvedUserId) throw new Error("stripe_user_mapping_missing");
  const status = sonicStripeStatus(subscription.status);
  const period = stripePeriod(subscription);
  const customerId = typeof subscription.customer === "string" ? subscription.customer : subscription.customer?.id || null;
  return upsertMembership({
    user_id: resolvedUserId,
    plan_code: "premium",
    status,
    provider: "stripe",
    provider_customer_ref: customerId,
    provider_subscription_ref: subscription.id,
    current_period_start: period.start,
    current_period_end: period.end,
    cancel_at_period_end: subscription.cancel_at_period_end === true,
    metadata: {
      stripe_price_id: String(subscription?.items?.data?.[0]?.price?.id || ""),
      stripe_customer_id: String(customerId || ""),
      stripe_trial_used: Number(subscription?.trial_start || 0) > 0
    }
  });
}

async function stripeTrialAvailable(stripe, customer, userId) {
  const membership = await readMembership(userId);
  if (membership?.metadata?.stripe_trial_used === true) return false;
  const prices = new Set(Object.values(stripePriceIds()).filter(Boolean));
  const subscriptions = await stripe.subscriptions.list({ customer, status: "all", limit: 100 });
  return !(subscriptions?.data || []).some((subscription) =>
    (subscription?.items?.data || []).some((item) => prices.has(String(item?.price?.id || "")))
  );
}

async function stripeCustomerForAccess(access) {
  const stripe = stripeClient();
  if (!stripe) throw new Error("stripe_not_configured");
  const membership = await readMembership(access.userId);
  const fromMetadata = String(membership?.metadata?.stripe_customer_id || "").trim();
  const direct = membership?.provider === "stripe" ? String(membership.provider_customer_ref || "").trim() : "";
  const existing = direct || fromMetadata;
  if (existing) return existing;
  const customer = await stripe.customers.create({
    email: access.email || undefined,
    metadata: { sonic_user_id: access.userId }
  }, { idempotencyKey: `sonic-customer-${access.userId}` });
  const existingRow = membership
    ? {
        ...membership,
        user_id: access.userId,
        metadata: { ...(membership.metadata || {}), stripe_customer_id: customer.id }
      }
    : {
        user_id: access.userId,
        plan_code: "free",
        status: "free",
        provider: "stripe",
        provider_customer_ref: customer.id,
        provider_subscription_ref: null,
        current_period_start: null,
        current_period_end: null,
        cancel_at_period_end: false,
        metadata: { stripe_customer_id: customer.id }
      };
  await upsertMembership(existingRow);
  return customer.id;
}

async function publicPlans() {
  const prices = stripePriceIds();
  const stripe = stripeClient();
  const availability = billingAvailability();
  const productionRuntime = env("VERCEL_ENV") === "production" || env("SONIC_APP_ENV") === "production";
  const result = {
    ok: true,
    enabled: enabled(),
    webConfigured: false,
    appleConfigured: productionRuntime ? availability.appleProduction : availability.appleSandbox,
    appleProductIds: appleProductIds(),
    trialDays: premiumTrialDays(),
    previewPlans: launchPreviewPlans(),
    plans: []
  };
  if (!enabled() || !stripe || !prices.monthly || !prices.yearly) return result;
  try {
    const rows = await Promise.all(["monthly", "yearly"].map(async (cadence) => {
      const price = await stripe.prices.retrieve(prices[cadence]);
      const amount = Number(price.unit_amount || 0) / 100;
      return {
        cadence,
        currency: String(price.currency || "").toUpperCase(),
        amount,
        formattedPrice: new Intl.NumberFormat("pt-BR", { style: "currency", currency: String(price.currency || "BRL").toUpperCase() }).format(amount),
        interval: price.recurring?.interval || (cadence === "yearly" ? "year" : "month"),
        trialDays: premiumTrialDays(),
        trialEligible: true
      };
    }));
    result.webConfigured = Boolean(env("STRIPE_WEBHOOK_SECRET"));
    result.plans = rows;
  } catch (_) {
    result.webConfigured = false;
  }
  return result;
}

async function createCheckout(access, cadence = "monthly", requestOrigin = "") {
  if (!enabled()) throw new Error("billing_disabled");
  const stripe = stripeClient();
  const prices = stripePriceIds();
  const priceId = prices[cadence === "yearly" ? "yearly" : "monthly"];
  if (!stripe || !priceId || !env("STRIPE_WEBHOOK_SECRET")) throw new Error("web_billing_not_configured");
  const customer = await stripeCustomerForAccess(access);
  const origin = originUrl(requestOrigin);
  const subscriptionData = { metadata: { sonic_user_id: access.userId, sonic_plan: "premium" } };
  const trialDays = premiumTrialDays();
  if (trialDays > 0 && await stripeTrialAvailable(stripe, customer, access.userId)) {
    subscriptionData.trial_period_days = trialDays;
  }
  const session = await stripe.checkout.sessions.create({
    mode: "subscription",
    customer,
    client_reference_id: access.userId,
    line_items: [{ price: priceId, quantity: 1 }],
    allow_promotion_codes: true,
    success_url: `${origin}/?billing=success&tab=profile`,
    cancel_url: `${origin}/?billing=canceled&tab=profile`,
    subscription_data: subscriptionData,
    metadata: { sonic_user_id: access.userId, sonic_plan: "premium" }
  }, { idempotencyKey: `sonic-checkout-${access.userId}-${cadence}-${Math.floor(Date.now() / 60000)}` });
  if (!session.url) throw new Error("checkout_url_missing");
  return { url: session.url };
}

async function createPortal(access, requestOrigin = "") {
  if (!enabled()) throw new Error("billing_disabled");
  const stripe = stripeClient();
  if (!stripe) throw new Error("stripe_not_configured");
  const membership = await readMembership(access.userId);
  const customer = String(
    (membership?.provider === "stripe" ? membership.provider_customer_ref : "") ||
    membership?.metadata?.stripe_customer_id ||
    ""
  ).trim();
  if (!customer) throw new Error("stripe_customer_missing");
  const session = await stripe.billingPortal.sessions.create({
    customer,
    return_url: `${originUrl(requestOrigin)}/?tab=profile`
  });
  return { url: session.url };
}

async function processStripeWebhook(rawBody, signature) {
  const stripe = stripeClient();
  const secret = env("STRIPE_WEBHOOK_SECRET");
  if (!stripeWebhooksEnabled() || !stripe || !secret) throw new Error("stripe_webhook_not_configured");
  const event = stripe.webhooks.constructEvent(rawBody, signature, secret);
  const claimed = await claimBillingEvent("stripe", event.id, event.type, rawBody);
  if (!claimed) return { duplicate: true, eventId: event.id };
  try {
    const object = event.data?.object || {};
    if (["customer.subscription.created", "customer.subscription.updated", "customer.subscription.deleted"].includes(event.type)) {
      await applyStripeSubscription(object);
    } else if (event.type === "checkout.session.completed" && object.subscription) {
      const subscription = await stripe.subscriptions.retrieve(String(object.subscription));
      await applyStripeSubscription(subscription, String(object.client_reference_id || object.metadata?.sonic_user_id || ""));
    } else if (["invoice.payment_failed", "invoice.payment_succeeded"].includes(event.type)) {
      const invoiceSubscription = object.subscription || object.parent?.subscription_details?.subscription;
      const subscriptionId = typeof invoiceSubscription === "string" ? invoiceSubscription : invoiceSubscription?.id;
      if (subscriptionId) await applyStripeSubscription(await stripe.subscriptions.retrieve(subscriptionId));
    }
    await finishBillingEvent("stripe", event.id);
    return { duplicate: false, eventId: event.id };
  } catch (error) {
    await finishBillingEvent("stripe", event.id, error?.message || "stripe_processing_failed").catch(() => null);
    throw error;
  }
}

function appleRootCertificates() {
  const root = path.resolve(__dirname, "../../assets/apple-pki");
  return ["AppleIncRootCertificate.cer", "AppleRootCA-G2.cer", "AppleRootCA-G3.cer"].map((name) => fs.readFileSync(path.join(root, name)));
}

function appleVerifier(environment) {
  const appAppleId = Number.parseInt(env("APPLE_APP_ID"), 10);
  if (environment === Environment.PRODUCTION && (!Number.isFinite(appAppleId) || appAppleId <= 0)) return null;
  return new SignedDataVerifier(
    appleRootCertificates(),
    true,
    environment,
    env("APPLE_APP_BUNDLE_ID", APPLE_BUNDLE_ID),
    environment === Environment.PRODUCTION ? appAppleId : undefined
  );
}

async function verifyAppleSignedData(value, kind = "transaction") {
  const signed = String(value || "").trim();
  if (!signed || signed.length > 120000) throw new Error("invalid_apple_signed_data");
  let lastError = null;
  for (const environment of [Environment.PRODUCTION, Environment.SANDBOX]) {
    const verifier = appleVerifier(environment);
    if (!verifier) continue;
    try {
      const payload = kind === "notification"
        ? await verifier.verifyAndDecodeNotification(signed)
        : await verifier.verifyAndDecodeTransaction(signed);
      return { payload, verifier, environment };
    } catch (error) {
      lastError = error;
    }
  }
  throw new Error(lastError ? "apple_signature_invalid" : "apple_verifier_not_configured");
}

function appleMembershipRow(transaction, renewal = null) {
  const productIds = new Set(Object.values(appleProductIds()));
  if (!productIds.has(String(transaction?.productId || ""))) throw new Error("apple_product_not_allowed");
  const expirationMs = Number(transaction?.expiresDate || 0);
  const revoked = Number(transaction?.revocationDate || 0) > 0 || transaction?.isUpgraded === true;
  const active = !revoked && expirationMs > Date.now();
  const status = active ? "active" : revoked ? "canceled" : "expired";
  const userId = String(transaction?.appAccountToken || renewal?.appAccountToken || "").trim().toLowerCase();
  if (!/^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/.test(userId)) throw new Error("apple_user_mapping_missing");
  return {
    user_id: userId,
    plan_code: "premium",
    status,
    provider: "apple",
    provider_customer_ref: null,
    provider_subscription_ref: String(transaction.originalTransactionId || transaction.transactionId || ""),
    current_period_start: Number(transaction.purchaseDate || 0) > 0 ? new Date(Number(transaction.purchaseDate)).toISOString() : null,
    current_period_end: expirationMs > 0 ? new Date(expirationMs).toISOString() : null,
    cancel_at_period_end: renewal ? Number(renewal.autoRenewStatus) === 0 : false,
    metadata: {
      apple_product_id: String(transaction.productId || ""),
      apple_environment: String(transaction.environment || ""),
      apple_transaction_id: String(transaction.transactionId || "")
    }
  };
}

async function verifyAppleTransactionForAccess(access, signedTransaction) {
  if (!enabled()) throw new Error("billing_disabled");
  const verified = await verifyAppleSignedData(signedTransaction, "transaction");
  const row = appleMembershipRow(verified.payload);
  if (row.user_id !== String(access.userId || "").trim().toLowerCase()) throw new Error("apple_account_mismatch");
  await upsertMembership(row);
  return {
    active: row.status === "active",
    productId: row.metadata.apple_product_id,
    currentPeriodEnd: row.current_period_end,
    environment: verified.environment
  };
}

async function processAppleNotification(rawBody) {
  if (!enabled()) throw new Error("apple_notifications_not_configured");
  let parsed;
  try { parsed = JSON.parse(rawBody); } catch (_) { throw new Error("invalid_apple_notification_body"); }
  const signedPayload = String(parsed?.signedPayload || "").trim();
  const notification = await verifyAppleSignedData(signedPayload, "notification");
  const payload = notification.payload;
  const eventId = String(payload.notificationUUID || "").trim();
  if (!eventId) throw new Error("apple_notification_id_missing");
  const claimed = await claimBillingEvent("apple", eventId, String(payload.notificationType || "unknown"), rawBody);
  if (!claimed) return { duplicate: true, eventId };
  try {
    const signedTransaction = String(payload?.data?.signedTransactionInfo || "").trim();
    if (signedTransaction) {
      const transaction = await notification.verifier.verifyAndDecodeTransaction(signedTransaction);
      const signedRenewal = String(payload?.data?.signedRenewalInfo || "").trim();
      const renewal = signedRenewal ? await notification.verifier.verifyAndDecodeRenewalInfo(signedRenewal) : null;
      await upsertMembership(appleMembershipRow(transaction, renewal));
    }
    await finishBillingEvent("apple", eventId);
    return { duplicate: false, eventId };
  } catch (error) {
    await finishBillingEvent("apple", eventId, error?.message || "apple_processing_failed").catch(() => null);
    throw error;
  }
}

module.exports = {
  APPLE_BUNDLE_ID,
  APPLE_MONTHLY_PRODUCT_ID,
  APPLE_YEARLY_PRODUCT_ID,
  appleMembershipRow,
  billingAvailability,
  createCheckout,
  createPortal,
  processAppleNotification,
  processStripeWebhook,
  launchPreviewPlans,
  premiumTrialDays,
  publicPlans,
  originUrl,
  sonicStripeStatus,
  stripePeriod,
  stripeWebhooksEnabled,
  verifyAppleTransactionForAccess
};
