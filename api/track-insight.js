const { callOpenAiText, parseBody, requireOpenAiPost, sendJson, trimText } = require("./_openai");

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
    "Write in the requested language.",
    "Return plain text only, with no markdown and no JSON.",
    "Write like a tasteful electronic music curator who actually listens.",
    "Make the insight useful, human, and specific: feeling first, then why it fits the listener's current route.",
    "Do not invent metadata, country, release history, or label facts. Use only the provided track, style, BPM, energy, context, and vibe.",
    "Avoid generic praise such as 'boa energia' unless it is tied to a concrete listening cue.",
    "Keep it to 2 short sentences."
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
    const result = await callOpenAiText({
      system,
      user,
      maxOutputTokens: 800
    });
    if (!result.ok) {
      sendJson(res, result.status || 500, result.payload);
      return;
    }
    sendJson(res, 200, {
      message: trimText(result.payload.text, 520),
      source: "openai"
    });
  } catch (error) {
    sendJson(res, 500, { error: "track_insight_failed", detail: error.message });
  }
};
