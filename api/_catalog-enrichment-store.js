const crypto = require("node:crypto");
const { envFlag, envText, trimText } = require("./_music-apis");

function normalizeKey(value = "") {
  return String(value || "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/&/g, " and ")
    .replace(/[^a-z0-9]+/g, "_")
    .replace(/^_+|_+$/g, "")
    .replace(/_+/g, "_");
}

function supabaseConfig() {
  const supabaseUrl = envText("SUPABASE_URL").replace(/\/+$/, "");
  const serviceKey =
    envText("SUPABASE_SERVICE_ROLE_KEY") ||
    envText("SUPABASE_SERVICE_KEY") ||
    envText("SUPABASE_SERVICE_ROLE");
  const enabled = envFlag("SONIC_CATALOG_ENRICHMENT_ENABLED", envFlag("SONIC_CATALOG_EXTRA_ENABLED", false)) &&
    Boolean(supabaseUrl && serviceKey);
  return { enabled, supabaseUrl, serviceKey };
}

function entityKeyFor(record = {}) {
  const type = normalizeKey(record.entityType || record.entity_type || "track");
  const style = normalizeKey(record.style || "");
  const artist = normalizeKey(record.artist || "");
  const song = normalizeKey(record.song || record.title || "");
  const source = normalizeKey(record.source || "");
  const base = type === "artist"
    ? [type, artist].filter(Boolean).join("::")
    : type === "radio_style"
      ? [type, style || normalizeKey(record.tag || record.query || "")].filter(Boolean).join("::")
      : [type, artist, song || style].filter(Boolean).join("::");
  if (base) return base;
  const hash = crypto.createHash("sha1").update(JSON.stringify(record.payload || record)).digest("hex").slice(0, 20);
  return [type || "enrichment", source || "unknown", hash].join("::");
}

function compactPayload(payload = {}) {
  const json = JSON.stringify(payload || {});
  if (json.length <= 24000) return payload || {};
  return {
    truncated: true,
    originalBytes: json.length,
    summary: trimText(payload?.summary || payload?.bioSummary || payload?.imageUrl || payload?.source || "", 1000)
  };
}

function normalizeRecord(record = {}) {
  const entityType = trimText(record.entityType || record.entity_type || "track", 40) || "track";
  const source = trimText(record.source || "api_enrichment", 80) || "api_enrichment";
  const payload = compactPayload(record.payload || {});
  return {
    entity_type: entityType,
    entity_key: trimText(record.entityKey || record.entity_key || entityKeyFor({ ...record, entityType, source }), 220),
    style: trimText(record.style || "", 80) || null,
    artist: trimText(record.artist || "", 160) || null,
    song: trimText(record.song || record.title || "", 220) || null,
    source,
    source_url: trimText(record.sourceUrl || record.source_url || "", 900) || null,
    confidence: Number.isFinite(Number(record.confidence)) ? Math.max(0, Math.min(1, Number(record.confidence))) : null,
    payload,
    status: trimText(record.status || "published", 30) || "published"
  };
}

async function persistCatalogEnrichments(records = []) {
  const rows = (Array.isArray(records) ? records : [records]).map(normalizeRecord).filter((row) => row.entity_key);
  if (!rows.length) return { ok: true, enabled: false, count: 0 };
  const config = supabaseConfig();
  if (!config.enabled) return { ok: true, enabled: false, count: 0 };

  try {
    const response = await fetch(`${config.supabaseUrl}/rest/v1/catalog_enrichments?on_conflict=entity_type,entity_key,source`, {
      method: "POST",
      headers: {
        apikey: config.serviceKey,
        Authorization: `Bearer ${config.serviceKey}`,
        "Content-Type": "application/json",
        Prefer: "resolution=merge-duplicates,return=minimal"
      },
      body: JSON.stringify(rows)
    });
    if (!response.ok) {
      const payload = await response.json().catch(() => ({}));
      return {
        ok: false,
        enabled: true,
        count: 0,
        error: payload?.message || payload?.error || response.statusText
      };
    }
    return { ok: true, enabled: true, count: rows.length };
  } catch (error) {
    return { ok: false, enabled: true, count: 0, error: error.message };
  }
}

module.exports = {
  entityKeyFor,
  persistCatalogEnrichments,
  supabaseConfig
};
