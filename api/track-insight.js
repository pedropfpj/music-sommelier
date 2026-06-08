const { callOpenAiJson, parseBody, requireOpenAiPost, sendJson, trimText } = require("./_openai");

const TRACK_INSIGHT_SCHEMA = {
  type: "object",
  additionalProperties: false,
  required: ["message"],
  properties: {
    message: {
      type: "string"
    }
  }
};

module.exports = async function handler(req, res) {
  if (!requireOpenAiPost(req, res, {
    feature: "track-insight",
    enabledEnv: "SONIC_AI_TEXT_ENABLED",
    defaultEnabled: true,
    dailyLimitEnv: "SONIC_AI_TRACK_DAILY_LIMIT",
    defaultDailyLimit: 24
  })) return;

  const body = parseBody(req);
  const track = body.track || {};
  const language = trimText(body.language || "pt", 8) || "pt";
  const prompt = trimText(body.prompt, 1200);
  const context = trimText(body.context, 80);

  const system = [
    "You are Sonic Search's music discovery assistant.",
    "Return only valid JSON matching the schema.",
    "Write concise, practical, immersive insight for electronic music listeners.",
    "Do not invent metadata. Use only the provided track, style, BPM, energy, context, and vibe."
  ].join(" ");

  const user = JSON.stringify({
    language,
    instruction: prompt || "Create a short DJ-style track insight.",
    context,
    track: {
      song: trimText(track.song, 120),
      artist: trimText(track.artist, 120),
      style: trimText(track.style, 80),
      bpm: trimText(track.bpm, 80),
      bpmStatus: trimText(track.bpmStatus, 120),
      energy: trimText(track.energy, 60)
    }
  });

  try {
    const result = await callOpenAiJson({
      schemaName: "track_insight",
      schema: TRACK_INSIGHT_SCHEMA,
      system,
      user,
      maxOutputTokens: 220
    });
    if (!result.ok) {
      sendJson(res, result.status || 500, result.payload);
      return;
    }
    sendJson(res, 200, {
      message: trimText(result.payload.message, 420),
      source: "openai"
    });
  } catch (error) {
    sendJson(res, 500, { error: "track_insight_failed", detail: error.message });
  }
};
