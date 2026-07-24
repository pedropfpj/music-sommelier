const { resolveAccessContext } = require("./_access-control");
const { envText, sendJson } = require("./_music-apis");
const { setCorsHeaders } = require("./_request-security");

const ALLOWED_METHODS = ["GET", "OPTIONS"];
const PAGE_SIZE = 1000;
const MAX_SESSION_ROWS = 50000;
const MAX_ACTIVITY_ROWS = 30000;
const ENGAGEMENT_EVENTS = [
  "three_reactions_session",
  "discovery_artist_liked",
  "new_artist_confirmed",
  "share_card_clicked"
];
const FUNNEL_EVENTS = [
  "recommendation_generated",
  "preview_played",
  "track_liked",
  "track_disliked",
  "discovery_artist_liked",
  "new_artist_confirmed",
  "share_card_clicked"
];
const ISSUE_EVENT_NAME = "track_disliked";
const RETURN_GAP_MS = 6 * 60 * 60 * 1000;

function supabaseConfig() {
  const supabaseUrl = envText("SUPABASE_URL").replace(/\/+$/, "");
  const serviceKey =
    envText("SUPABASE_SERVICE_ROLE_KEY") ||
    envText("SUPABASE_SERVICE_KEY") ||
    envText("SUPABASE_SERVICE_ROLE");
  return {
    enabled: Boolean(supabaseUrl && serviceKey),
    supabaseUrl,
    serviceKey
  };
}

function isoDaysAgo(days = 0, now = Date.now()) {
  return new Date(now - Math.max(0, Number(days) || 0) * 86400000).toISOString();
}

function dateKey(value) {
  const parsed = new Date(value);
  return Number.isFinite(parsed.getTime()) ? parsed.toISOString().slice(0, 10) : "";
}

function cleanSessionId(value = "") {
  return String(value || "").trim().slice(0, 80);
}

function isAndroidRow(row = {}) {
  const source = String(row.source || "").toLowerCase();
  const userAgent = String(row.user_agent || "").toLowerCase();
  return source.includes("android") || userAgent.includes("android");
}

function isIosRow(row = {}) {
  const source = String(row.source || "").toLowerCase();
  const userAgent = String(row.user_agent || "").toLowerCase();
  return source.includes("ios") || /iphone|ipad|ipod/.test(userAgent);
}

async function fetchRows(config, filters = {}, maxRows = MAX_ACTIVITY_ROWS) {
  const rows = [];
  let offset = 0;
  let truncated = false;

  while (rows.length < maxRows) {
    const limit = Math.min(PAGE_SIZE, maxRows - rows.length);
    const params = new URLSearchParams({
      select: "created_at,occurred_at,event_name,event_id,anonymous_id,user_id,session_id,schema_version,platform,environment,source,user_agent,payload",
      order: "created_at.asc",
      limit: String(limit),
      offset: String(offset)
    });
    Object.entries(filters).forEach(([key, value]) => {
      if (value) params.set(key, String(value));
    });
    const response = await fetch(`${config.supabaseUrl}/rest/v1/beta_events?${params}`, {
      method: "GET",
      headers: {
        apikey: config.serviceKey,
        Authorization: `Bearer ${config.serviceKey}`,
        Accept: "application/json"
      }
    });
    const payload = await response.json().catch(() => []);
    if (!response.ok) {
      const detail = payload?.message || payload?.error || response.statusText || "analytics_query_failed";
      throw new Error(String(detail));
    }
    const page = Array.isArray(payload) ? payload : [];
    rows.push(...page);
    if (page.length < limit) break;
    offset += page.length;
    if (rows.length >= maxRows) truncated = true;
  }

  return { rows, truncated };
}

function uniqueSessionCount(rows = []) {
  return new Set(rows.map((row) => cleanSessionId(row.session_id)).filter(Boolean)).size;
}

function rowTimestamp(row = {}) {
  const timestamp = Date.parse(row.occurred_at || row.created_at || "");
  return Number.isFinite(timestamp) ? timestamp : 0;
}

function rowIdentity(row = {}) {
  return String(row.anonymous_id || row.session_id || "").trim();
}

function uniqueUserCount(rows = []) {
  return new Set(rows.map(rowIdentity).filter(Boolean)).size;
}

function productionRows(rows = []) {
  return rows.filter((row) => {
    const environment = String(row.environment || "").trim().toLowerCase();
    return !environment || environment === "production";
  });
}

function periodMetric(sessionRows = [], days = 1, now = Date.now()) {
  const cutoff = now - Math.max(1, Number(days) || 1) * 86400000;
  const rows = sessionRows.filter((row) => rowTimestamp(row) >= cutoff);
  return {
    days,
    users: uniqueUserCount(rows),
    sessions: uniqueSessionCount(rows)
  };
}

function platformMetrics(sessionRows = [], days = 30, now = Date.now()) {
  const cutoff = now - Math.max(1, Number(days) || 1) * 86400000;
  const recent = sessionRows.filter((row) => rowTimestamp(row) >= cutoff);
  const buckets = {
    android: new Set(),
    ios: new Set(),
    web: new Set()
  };
  recent.forEach((row) => {
    const identity = rowIdentity(row);
    if (!identity) return;
    const platform = String(row.platform || "").trim().toLowerCase();
    if (platform === "android" || isAndroidRow(row)) buckets.android.add(identity);
    else if (platform === "ios" || isIosRow(row)) buckets.ios.add(identity);
    else buckets.web.add(identity);
  });
  return {
    android: buckets.android.size,
    ios: buckets.ios.size,
    web: buckets.web.size
  };
}

function dailyTrend(sessionRows = [], now = Date.now(), days = 30) {
  const output = [];
  const rowsByDay = new Map();
  sessionRows.forEach((row) => {
    const day = dateKey(row.occurred_at || row.created_at);
    if (!day) return;
    if (!rowsByDay.has(day)) rowsByDay.set(day, []);
    rowsByDay.get(day).push(row);
  });
  for (let index = days - 1; index >= 0; index -= 1) {
    const day = dateKey(now - index * 86400000);
    const rows = rowsByDay.get(day) || [];
    output.push({
      date: day,
      users: uniqueUserCount(rows),
      sessions: uniqueSessionCount(rows),
      android: uniqueUserCount(rows.filter((row) => String(row.platform || "").toLowerCase() === "android" || isAndroidRow(row)))
    });
  }
  return output;
}

function engagementMetrics(activityRows = []) {
  return Object.fromEntries(ENGAGEMENT_EVENTS.map((eventName) => {
    const rows = activityRows.filter((row) => row.event_name === eventName);
    return [eventName, {
      users: uniqueUserCount(rows),
      events: rows.length
    }];
  }));
}

function retentionMetrics(sessionRows = [], days = 30, now = Date.now()) {
  const cutoff = now - Math.max(1, Number(days) || 30) * 86400000;
  const recent = sessionRows.filter((row) => rowTimestamp(row) >= cutoff && rowIdentity(row));
  const byUser = new Map();
  recent.forEach((row) => {
    const identity = rowIdentity(row);
    if (!byUser.has(identity)) byUser.set(identity, []);
    byUser.get(identity).push(rowTimestamp(row));
  });
  let returningUsers = 0;
  byUser.forEach((timestamps) => {
    const ordered = [...new Set(timestamps.filter(Boolean))].sort((a, b) => a - b);
    const returned = ordered.some((timestamp, index) => (
      index > 0 && timestamp - ordered[index - 1] >= RETURN_GAP_MS
    ));
    if (returned) returningUsers += 1;
  });
  return {
    days,
    returningUsers,
    rate: byUser.size ? Math.round((returningUsers / byUser.size) * 1000) / 10 : 0
  };
}

function funnelMetrics(sessionRows = [], activityRows = [], now = Date.now(), days = 30) {
  const cutoff = now - Math.max(1, Number(days) || 30) * 86400000;
  const recentSessions = sessionRows.filter((row) => rowTimestamp(row) >= cutoff);
  const recentActivity = activityRows.filter((row) => rowTimestamp(row) >= cutoff);
  const stageRows = {
    opened: recentSessions,
    recommended: recentActivity.filter((row) => row.event_name === "recommendation_generated"),
    listened: recentActivity.filter((row) => row.event_name === "preview_played"),
    reacted: recentActivity.filter((row) => ["track_liked", "track_disliked"].includes(row.event_name)),
    valued: recentActivity.filter((row) => ["discovery_artist_liked", "new_artist_confirmed", "share_card_clicked"].includes(row.event_name))
  };
  const openedUsers = Math.max(1, uniqueUserCount(stageRows.opened));
  return {
    days,
    stages: Object.fromEntries(Object.entries(stageRows).map(([key, rows]) => {
      const users = uniqueUserCount(rows);
      return [key, {
        users,
        events: key === "opened" ? uniqueSessionCount(rows) : rows.length,
        rate: Math.min(100, Math.round((users / openedUsers) * 1000) / 10)
      }];
    }))
  };
}

function payloadObject(value) {
  if (value && typeof value === "object" && !Array.isArray(value)) return value;
  if (typeof value !== "string") return {};
  try {
    const parsed = JSON.parse(value);
    return parsed && typeof parsed === "object" && !Array.isArray(parsed) ? parsed : {};
  } catch (_error) {
    return {};
  }
}

function issueMetrics(activityRows = [], now = Date.now(), days = 30) {
  const cutoff = now - Math.max(1, Number(days) || 30) * 86400000;
  const allowedReasons = new Set(["preview_issue", "style_issue", "bpm_issue", "image_issue"]);
  const rows = activityRows
    .filter((row) => row.event_name === ISSUE_EVENT_NAME && rowTimestamp(row) >= cutoff)
    .map((row) => ({ row, payload: payloadObject(row.payload) }))
    .filter(({ payload }) => allowedReasons.has(String(payload.reason || "")));
  const byReason = Object.fromEntries([...allowedReasons].map((reason) => [reason, 0]));
  const targets = new Map();
  rows.forEach(({ payload }) => {
    const reason = String(payload.reason || "");
    byReason[reason] += 1;
    const artist = String(payload.artist || "").trim();
    const song = String(payload.song || "").trim();
    const style = String(payload.style || "").trim();
    const key = `${artist}::${song}::${reason}`;
    const current = targets.get(key) || { artist, song, style, reason, reports: 0 };
    current.reports += 1;
    targets.set(key, current);
  });
  return {
    days,
    total: rows.length,
    byReason,
    affectedUsers: uniqueUserCount(rows.map(({ row }) => row)),
    top: [...targets.values()].sort((a, b) => b.reports - a.reports).slice(0, 8)
  };
}

function measurementQuality(sessionRows = []) {
  const total = sessionRows.length;
  const precise = sessionRows.filter((row) => String(row.anonymous_id || "").trim()).length;
  return {
    preciseRows: precise,
    legacyRows: Math.max(0, total - precise),
    preciseRate: total ? Math.round((precise / total) * 1000) / 10 : 100,
    userDefinition: "Identificador anonimo persistente por navegador ou aparelho.",
    sessionDefinition: "Sessao unica reiniciada apos cerca de 30 minutos de inatividade."
  };
}

function aggregateAnalytics(sessionRows = [], activityRows = [], options = {}) {
  const now = Number(options.now) || Date.now();
  const cleanSessions = productionRows(sessionRows);
  const cleanActivity = productionRows(activityRows);
  return {
    generatedAt: new Date(now).toISOString(),
    definition: "Pessoas sao aproximadas por identificador anonimo persistente; sessoes usam um identificador separado com janela de inatividade.",
    periods: {
      day: periodMetric(cleanSessions, 1, now),
      week: periodMetric(cleanSessions, 7, now),
      month: periodMetric(cleanSessions, 30, now),
      all: {
        users: uniqueUserCount(cleanSessions),
        sessions: uniqueSessionCount(cleanSessions)
      }
    },
    retention: retentionMetrics(cleanSessions, 30, now),
    platforms: {
      days: 30,
      ...platformMetrics(cleanSessions, 30, now)
    },
    trend: dailyTrend(cleanSessions, now, 30),
    engagement: engagementMetrics(cleanActivity),
    funnel: funnelMetrics(cleanSessions, cleanActivity, now, 30),
    issues: issueMetrics(cleanActivity, now, 30),
    measurement: measurementQuality(cleanSessions),
    partial: Boolean(options.partial)
  };
}

module.exports = async function handler(req, res) {
  if (req.method === "OPTIONS") {
    setCorsHeaders(req, res, {
      originEnvNames: ["SONIC_MUSIC_ALLOWED_ORIGINS", "SONIC_AI_ALLOWED_ORIGINS"],
      methods: ALLOWED_METHODS,
      allowedHeaders: "Content-Type, Authorization, X-Sonic-Auth-Token"
    });
    res.statusCode = 204;
    res.end();
    return;
  }
  if (req.method !== "GET") {
    sendJson(req, res, 405, { ok: false, error: "method_not_allowed" }, ALLOWED_METHODS);
    return;
  }

  res.setHeader("Cache-Control", "private, no-store, max-age=0");
  const access = await resolveAccessContext(req, {});
  if (!access.authenticated) {
    sendJson(req, res, 401, { ok: false, error: "login_required" }, ALLOWED_METHODS);
    return;
  }
  if (!access.canAccessAdmin) {
    sendJson(req, res, 403, { ok: false, error: "admin_required" }, ALLOWED_METHODS);
    return;
  }

  const config = supabaseConfig();
  if (!config.enabled) {
    sendJson(req, res, 503, { ok: false, error: "analytics_not_configured" }, ALLOWED_METHODS);
    return;
  }

  try {
    const sinceThirtyDays = isoDaysAgo(30);
    const [sessionsResult, activityResult] = await Promise.all([
      fetchRows(config, { event_name: "eq.app_session_started" }, MAX_SESSION_ROWS),
      fetchRows(config, {
        event_name: `in.(${[...new Set([...ENGAGEMENT_EVENTS, ...FUNNEL_EVENTS, ISSUE_EVENT_NAME])].join(",")})`,
        created_at: `gte.${sinceThirtyDays}`
      }, MAX_ACTIVITY_ROWS)
    ]);
    const analytics = aggregateAnalytics(sessionsResult.rows, activityResult.rows, {
      partial: sessionsResult.truncated || activityResult.truncated
    });
    sendJson(req, res, 200, {
      ok: true,
      viewer: { email: access.email, role: access.role },
      analytics
    }, ALLOWED_METHODS);
  } catch (error) {
    sendJson(req, res, 502, {
      ok: false,
      error: "analytics_query_failed",
      detail: error?.message || "unknown_error"
    }, ALLOWED_METHODS);
  }
};

module.exports._private = {
  aggregateAnalytics,
  dailyTrend,
  engagementMetrics,
  isAndroidRow,
  isIosRow,
  issueMetrics,
  funnelMetrics,
  measurementQuality,
  periodMetric,
  platformMetrics,
  retentionMetrics,
  rowIdentity,
  uniqueUserCount,
  uniqueSessionCount
};
