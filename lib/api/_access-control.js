const crypto = require("node:crypto");

const DEFAULT_OWNER_EMAIL = "pedropfpj@gmail.com";

function envText(name, fallback = "") {
  const raw = String(process.env[name] || "").trim();
  return raw || fallback;
}

function normalizeEmail(value = "") {
  return String(value || "").trim().toLowerCase();
}

function csvEmails(value = "") {
  return String(value || "")
    .split(",")
    .map(normalizeEmail)
    .filter(Boolean);
}

function configuredOwnerEmails() {
  return new Set(csvEmails(envText("SONIC_OWNER_EMAILS", DEFAULT_OWNER_EMAIL)));
}

function configuredAdminEmails(ownerEmails = configuredOwnerEmails()) {
  return new Set([...ownerEmails, ...csvEmails(envText("SONIC_ADMIN_EMAILS", ""))]);
}

function configuredPremiumEmails() {
  return new Set(csvEmails(envText("SONIC_PAID_USER_EMAILS", "")));
}

const FREE_PLAN = Object.freeze({
  code: "free",
  name: "Sonic Free",
  description: "Descoberta eletrônica essencial, com curtidas ilimitadas.",
  features: Object.freeze([
    "discovery_core",
    "likes_unlimited",
    "local_profile",
    "recent_history",
    "share_cards"
  ])
});

const PREMIUM_PLAN = Object.freeze({
  code: "premium",
  name: "Sonic Premium",
  description: "Memória contínua, radar diário e ferramentas avançadas de descoberta.",
  features: Object.freeze([
    ...FREE_PLAN.features,
    "cloud_profile",
    "cross_device_sync",
    "full_history",
    "daily_radar",
    "smart_collections",
    "advanced_discovery",
    "taste_reports"
  ])
});

function membershipSupabaseConfig() {
  return {
    url: envText("SUPABASE_URL").replace(/\/+$/, ""),
    serviceKey: envText("SUPABASE_SERVICE_ROLE_KEY")
  };
}

function safeMembershipStatus(value = "") {
  const status = String(value || "").trim().toLowerCase();
  return ["free", "trialing", "active", "past_due", "paused", "canceled", "expired", "incomplete"].includes(status)
    ? status
    : "free";
}

function activeMembershipRow(row = {}, now = Date.now()) {
  const status = safeMembershipStatus(row?.status);
  if (!["active", "trialing"].includes(status)) return false;
  const boundary = status === "trialing" && row?.trial_end ? row.trial_end : row?.current_period_end;
  if (!boundary) return true;
  const boundaryMs = Date.parse(boundary);
  return Number.isFinite(boundaryMs) && boundaryMs > now;
}

function planFallback(code = "free") {
  return code === "premium" ? PREMIUM_PLAN : FREE_PLAN;
}

function normalizePlan(row = {}, fallbackCode = "free") {
  const fallback = planFallback(fallbackCode);
  const features = Array.isArray(row?.features)
    ? row.features.map((feature) => String(feature || "").trim()).filter(Boolean)
    : [...fallback.features];
  return {
    code: String(row?.code || fallback.code).trim() || fallback.code,
    name: String(row?.name || fallback.name).trim() || fallback.name,
    description: String(row?.description || fallback.description).trim() || fallback.description,
    features: Array.from(new Set(features))
  };
}

function freeMembership(overrides = {}) {
  return {
    premium: false,
    plan: normalizePlan({}, "free"),
    status: "free",
    provider: "none",
    currentPeriodEnd: null,
    trialEnd: null,
    cancelAtPeriodEnd: false,
    source: "default",
    configured: false,
    setupNeeded: false,
    ...overrides
  };
}

async function fetchMembershipRecord(userId = "") {
  const cleanUserId = String(userId || "").trim();
  const config = membershipSupabaseConfig();
  if (!cleanUserId || !config.url || !config.serviceKey) {
    return { row: null, plan: null, configured: false, setupNeeded: false, error: "membership_not_configured" };
  }
  const params = new URLSearchParams({
    user_id: `eq.${cleanUserId}`,
    select: "plan_code,status,provider,current_period_end,trial_end,cancel_at_period_end,updated_at",
    limit: "1"
  });
  try {
    const membershipResponse = await fetch(`${config.url}/rest/v1/sonic_memberships?${params.toString()}`, {
      method: "GET",
      headers: {
        apikey: config.serviceKey,
        Authorization: `Bearer ${config.serviceKey}`,
        Accept: "application/json"
      }
    });
    const membershipPayload = await membershipResponse.json().catch(() => ([]));
    if (!membershipResponse.ok) {
      const code = String(membershipPayload?.code || "");
      return {
        row: null,
        plan: null,
        configured: true,
        setupNeeded: ["42P01", "PGRST205"].includes(code),
        error: "membership_lookup_failed"
      };
    }
    const row = Array.isArray(membershipPayload) ? membershipPayload[0] || null : null;
    if (!row) return { row: null, plan: null, configured: true, setupNeeded: false, error: "" };

    const planCode = String(row.plan_code || "free").trim() || "free";
    const planParams = new URLSearchParams({
      code: `eq.${planCode}`,
      select: "code,name,description,features",
      limit: "1"
    });
    const planResponse = await fetch(`${config.url}/rest/v1/sonic_plans?${planParams.toString()}`, {
      method: "GET",
      headers: {
        apikey: config.serviceKey,
        Authorization: `Bearer ${config.serviceKey}`,
        Accept: "application/json"
      }
    });
    const planPayload = await planResponse.json().catch(() => ([]));
    const plan = planResponse.ok && Array.isArray(planPayload) ? planPayload[0] || null : null;
    return { row, plan, configured: true, setupNeeded: false, error: "" };
  } catch (_error) {
    return { row: null, plan: null, configured: true, setupNeeded: false, error: "membership_lookup_failed" };
  }
}

async function resolveMembership({ userId = "", manualPremium = false, owner = false } = {}) {
  if (owner || manualPremium) {
    return freeMembership({
      premium: true,
      plan: normalizePlan({}, "premium"),
      status: "active",
      provider: "manual",
      source: owner ? "owner" : "environment",
      configured: true
    });
  }

  const lookup = await fetchMembershipRecord(userId);
  const row = lookup.row;
  if (!row || !activeMembershipRow(row) || String(row.plan_code || "free") === "free") {
    return freeMembership({
      configured: lookup.configured,
      setupNeeded: lookup.setupNeeded,
      source: lookup.error ? "fallback" : lookup.configured ? "database" : "default"
    });
  }
  const plan = normalizePlan(lookup.plan || {}, String(row.plan_code || "premium"));
  return freeMembership({
    premium: true,
    plan,
    status: safeMembershipStatus(row.status),
    provider: ["stripe", "apple", "google", "manual"].includes(row.provider) ? row.provider : "manual",
    currentPeriodEnd: row.current_period_end || null,
    trialEnd: row.trial_end || null,
    cancelAtPeriodEnd: row.cancel_at_period_end === true,
    source: "database",
    configured: true
  });
}

function configuredModeratorEmails(adminEmails = configuredAdminEmails()) {
  return new Set([...adminEmails, ...csvEmails(envText("SONIC_MODERATOR_EMAILS", ""))]);
}

function authTokenFromRequest(req, body = {}) {
  const headers = req?.headers || {};
  const headerToken = String(
    headers["x-sonic-auth-token"] ||
      headers["x-sonic-access-token"] ||
      headers["x-supabase-auth-token"] ||
      headers.authorization ||
      ""
  ).trim();
  const bodyToken = String(body?.authAccessToken || body?.supabaseAccessToken || "").trim();
  return (headerToken || bodyToken).replace(/^Bearer\s+/i, "").trim();
}

function tokenHash(token = "") {
  return crypto.createHash("sha256").update(String(token || "")).digest("hex").slice(0, 16);
}

function supabaseConfig() {
  const url = envText("SUPABASE_URL").replace(/\/+$/, "");
  const anonKey = envText("SUPABASE_ANON_KEY") || envText("NEXT_PUBLIC_SUPABASE_ANON_KEY");
  return { url, anonKey };
}

async function fetchSupabaseUser(accessToken = "") {
  const token = String(accessToken || "").trim();
  const { url, anonKey } = supabaseConfig();
  if (!token || !url || !anonKey) return { user: null, error: "auth_not_configured" };

  try {
    const response = await fetch(`${url}/auth/v1/user`, {
      method: "GET",
      headers: {
        apikey: anonKey,
        Authorization: `Bearer ${token}`,
        Accept: "application/json"
      }
    });
    const payload = await response.json().catch(() => ({}));
    if (!response.ok) {
      return {
        user: null,
        error: payload?.msg || payload?.message || payload?.error || "invalid_auth_token"
      };
    }
    return { user: payload?.user || payload, error: "" };
  } catch (error) {
    return { user: null, error: error?.message || "auth_lookup_failed" };
  }
}

function emailFromSupabaseUser(user = {}) {
  const metadata = user?.user_metadata || user?.raw_user_meta_data || {};
  return normalizeEmail(user?.email || metadata?.email || "");
}

async function resolveAccessContext(req, body = {}, options = {}) {
  const accessToken = authTokenFromRequest(req, body);
  const { user, error } = await fetchSupabaseUser(accessToken);
  const email = emailFromSupabaseUser(user);
  const ownerEmails = configuredOwnerEmails();
  const adminEmails = configuredAdminEmails(ownerEmails);
  const moderatorEmails = configuredModeratorEmails(adminEmails);
  const premiumEmails = configuredPremiumEmails();
  const owner = Boolean(email && ownerEmails.has(email));
  const admin = Boolean(owner || (email && adminEmails.has(email)));
  const moderator = Boolean(admin || (email && moderatorEmails.has(email)));
  const manualPremium = Boolean(email && premiumEmails.has(email));
  const membership = options.includeMembership
    ? await resolveMembership({ userId: String(user?.id || user?.sub || "").trim(), manualPremium, owner })
    : freeMembership({
      premium: Boolean(owner || manualPremium),
      plan: normalizePlan({}, owner || manualPremium ? "premium" : "free"),
      status: owner || manualPremium ? "active" : "free",
      provider: owner || manualPremium ? "manual" : "none",
      source: owner ? "owner" : manualPremium ? "environment" : "default",
      configured: Boolean(owner || manualPremium)
    });
  const premium = Boolean(membership.premium);

  return {
    authenticated: Boolean(user?.id || user?.sub || email),
    tokenPresent: Boolean(accessToken),
    tokenHash: accessToken ? tokenHash(accessToken) : "",
    authError: error || "",
    userId: String(user?.id || user?.sub || "").trim(),
    email,
    owner,
    admin,
    canAccessAdmin: admin,
    moderator,
    canModerate: moderator,
    premium,
    membership,
    role: owner ? "owner" : admin ? "admin" : moderator ? "moderator" : premium ? "premium" : email ? "free" : "anonymous"
  };
}

module.exports = {
  configuredAdminEmails,
  configuredModeratorEmails,
  configuredOwnerEmails,
  configuredPremiumEmails,
  activeMembershipRow,
  fetchMembershipRecord,
  freeMembership,
  normalizePlan,
  normalizeEmail,
  resolveMembership,
  resolveAccessContext
};
