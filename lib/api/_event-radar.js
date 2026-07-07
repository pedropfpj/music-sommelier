const {
  enforceDurableMusicDailyLimit,
  envInt,
  parseBody,
  requireMusicApi,
  sendJson,
  trimText
} = require("./_music-apis");
const { listGoabaseSnapshotEvents } = require("./_event-sources");

function requestParam(req, body, name, maxLength = 120) {
  return trimText(body?.[name] || req?.query?.[name] || "", maxLength);
}

function safeSize(value, fallback = 50) {
  const parsed = Number.parseInt(String(value || ""), 10);
  if (!Number.isFinite(parsed)) return fallback;
  return Math.max(1, Math.min(100, parsed));
}

module.exports = async function handler(req, res) {
  if (!requireMusicApi(req, res, {
    methods: ["GET", "POST"],
    feature: "event-radar",
    enabledEnv: "SONIC_EVENT_RADAR_ENABLED",
    defaultEnabled: true,
    dailyLimitEnv: "SONIC_EVENT_RADAR_DAILY_LIMIT",
    defaultDailyLimit: 160,
    budgetOnStart: false
  })) return;

  if (!await enforceDurableMusicDailyLimit(req, res, {
    feature: "event-radar",
    dailyLimitEnv: "SONIC_EVENT_RADAR_DAILY_LIMIT",
    defaultDailyLimit: 160,
    methods: ["GET", "POST"]
  })) return;

  const body = parseBody(req);
  const countryCode = requestParam(req, body, "countryCode", 2).slice(0, 2);
  const style = requestParam(req, body, "style", 80);
  const artist = requestParam(req, body, "artist", 120);
  const size = safeSize(body?.size || req?.query?.size, envInt("SONIC_EVENT_RADAR_LIMIT", 50, 1, 100));
  const events = listGoabaseSnapshotEvents({ countryCode, style, artist, size });

  sendJson(req, res, 200, {
    ok: true,
    source: "goabase_snapshot",
    providers: events.length ? ["Goabase snapshot"] : [],
    count: events.length,
    countryCode: countryCode || "",
    style: style || "",
    artist: artist || "",
    events
  }, ["GET", "POST", "OPTIONS"]);
};
