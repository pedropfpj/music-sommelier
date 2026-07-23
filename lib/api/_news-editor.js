const PUBLIC_FIELDS = [
  "id",
  "slug",
  "status",
  "category",
  "eyebrow",
  "title",
  "excerpt",
  "body",
  "cover_image_url",
  "cover_image_alt",
  "image_credit",
  "author_name",
  "venue_name",
  "city",
  "state",
  "event_starts_at",
  "event_ends_at",
  "lineup",
  "service_info",
  "ticket_url",
  "instagram_url",
  "cta_label",
  "is_sponsored",
  "disclosure",
  "published_at",
  "created_at",
  "updated_at"
].join(",");

function sendJson(res, statusCode, payload) {
  res.statusCode = statusCode;
  res.setHeader("Content-Type", "application/json; charset=utf-8");
  res.setHeader("Cache-Control", "no-store");
  res.setHeader("X-Content-Type-Options", "nosniff");
  res.end(JSON.stringify(payload));
}

function queryValue(req, key) {
  const direct = req?.query?.[key];
  if (Array.isArray(direct)) return String(direct[0] || "").trim();
  if (direct !== undefined) return String(direct || "").trim();
  try {
    const url = new URL(req?.url || "", `https://${req?.headers?.host || "sonicsearch.app"}`);
    return String(url.searchParams.get(key) || "").trim();
  } catch (_error) {
    return "";
  }
}

function publicArticle(row = {}) {
  return {
    id: row.id,
    slug: row.slug,
    status: row.status,
    category: row.category,
    eyebrow: row.eyebrow,
    title: row.title,
    excerpt: row.excerpt,
    body: row.body,
    coverImageUrl: row.cover_image_url,
    coverImageAlt: row.cover_image_alt,
    imageCredit: row.image_credit,
    authorName: row.author_name,
    venueName: row.venue_name,
    city: row.city,
    state: row.state,
    eventStartsAt: row.event_starts_at,
    eventEndsAt: row.event_ends_at,
    lineup: Array.isArray(row.lineup) ? row.lineup : [],
    serviceInfo: row.service_info && typeof row.service_info === "object" ? row.service_info : {},
    ticketUrl: row.ticket_url,
    instagramUrl: row.instagram_url,
    ctaLabel: row.cta_label,
    isSponsored: Boolean(row.is_sponsored),
    disclosure: row.disclosure,
    publishedAt: row.published_at,
    createdAt: row.created_at,
    updatedAt: row.updated_at
  };
}

module.exports = async function handler(req, res) {
  if (req.method === "OPTIONS") {
    res.statusCode = 204;
    res.setHeader("Allow", "GET, OPTIONS");
    res.setHeader("Cache-Control", "no-store");
    return res.end();
  }
  if (req.method !== "GET") {
    res.setHeader("Allow", "GET, OPTIONS");
    return sendJson(res, 405, { ok: false, error: "method_not_allowed" });
  }

  const supabaseUrl = String(process.env.SUPABASE_URL || "").trim().replace(/\/+$/, "");
  const serviceKey = String(
    process.env.SUPABASE_SERVICE_ROLE_KEY ||
    process.env.SUPABASE_SERVICE_KEY ||
    process.env.SUPABASE_SERVICE_ROLE ||
    ""
  ).trim();
  if (!supabaseUrl || !serviceKey) {
    return sendJson(res, 503, { ok: false, error: "newsroom_not_configured" });
  }

  const requestedLimit = Number.parseInt(queryValue(req, "limit"), 10);
  const limit = Math.max(1, Math.min(30, Number.isFinite(requestedLimit) ? requestedLimit : 20));
  const now = encodeURIComponent(new Date().toISOString());
  const endpoint =
    `${supabaseUrl}/rest/v1/news_articles` +
    `?select=${encodeURIComponent(PUBLIC_FIELDS)}` +
    "&status=eq.published" +
    `&published_at=lte.${now}` +
    "&order=published_at.desc.nullslast,created_at.desc" +
    `&limit=${limit}`;

  try {
    const response = await fetch(endpoint, {
      method: "GET",
      headers: {
        apikey: serviceKey,
        Authorization: `Bearer ${serviceKey}`,
        Accept: "application/json"
      }
    });
    const payload = await response.json().catch(() => null);
    if (!response.ok || !Array.isArray(payload)) {
      return sendJson(res, 503, {
        ok: false,
        error: response.status === 404 ? "newsroom_setup_required" : "newsroom_unavailable"
      });
    }
    return sendJson(res, 200, {
      ok: true,
      articles: payload.map(publicArticle)
    });
  } catch (_error) {
    return sendJson(res, 503, { ok: false, error: "newsroom_unavailable" });
  }
};
