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

function configuredPremiumEmails() {
  return new Set(csvEmails(envText("SONIC_PAID_USER_EMAILS", "")));
}

function authTokenFromRequest(req, body = {}) {
  const headers = req?.headers || {};
  const headerToken = String(
    headers["x-sonic-auth-token"] ||
      headers["x-sonic-access-token"] ||
      headers["x-supabase-auth-token"] ||
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

async function resolveAccessContext(req, body = {}) {
  const accessToken = authTokenFromRequest(req, body);
  const { user, error } = await fetchSupabaseUser(accessToken);
  const email = emailFromSupabaseUser(user);
  const ownerEmails = configuredOwnerEmails();
  const premiumEmails = configuredPremiumEmails();
  const owner = Boolean(email && ownerEmails.has(email));
  const premium = Boolean(owner || (email && premiumEmails.has(email)));

  return {
    authenticated: Boolean(user?.id || user?.sub || email),
    tokenPresent: Boolean(accessToken),
    tokenHash: accessToken ? tokenHash(accessToken) : "",
    authError: error || "",
    userId: String(user?.id || user?.sub || "").trim(),
    email,
    owner,
    premium,
    role: owner ? "owner" : premium ? "premium" : email ? "free" : "anonymous"
  };
}

module.exports = {
  configuredOwnerEmails,
  configuredPremiumEmails,
  normalizeEmail,
  resolveAccessContext
};
