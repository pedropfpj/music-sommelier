const { callOpenAiText, parseBody, requireOpenAiPost, sendJson, trimText } = require("./_openai");

module.exports = async function handler(req, res) {
  if (!requireOpenAiPost(req, res, {
    feature: "artist-bio",
    enabledEnv: "SONIC_AI_TEXT_ENABLED",
    defaultEnabled: true,
    dailyLimitEnv: "SONIC_AI_BIO_DAILY_LIMIT",
    defaultDailyLimit: 18
  })) return;

  const body = parseBody(req);
  const track = body.track || {};
  const language = trimText(body.language || "pt", 8) || "pt";
  const knownSources = Array.isArray(body.sources) ? body.sources.slice(0, 8) : [];

  const system = [
    "You are Sonic Search's artist bio assistant for an electronic music discovery app.",
    "Write in the requested language.",
    "Use that language consistently. Do not mix English words into Portuguese or Spanish unless they are artist names, track names, label names, or established genre names.",
    "Return plain text only, with no markdown and no JSON.",
    "Use only provided metadata and listed source names/URLs. Never invent a real biography, country, label, alias, or scene detail.",
    "If metadata is weak, clearly frame it as a sound/catalog reading, not as a verified biography.",
    "Write like a concise electronic-music editor: vivid, useful, grounded, and easy to understand.",
    "Structure the text naturally in one compact paragraph:",
    "1) who/what the artist or project seems to be only when data supports it;",
    "2) how the sound behaves inside the subgenre;",
    "3) why this track entered the user's radar and what to listen for next.",
    "If the artist might not strictly belong to the requested subgenre, say that the track is being read by sonic fit instead of forcing a genre claim.",
    "Avoid filler, hype, fake certainty, and mythology unrelated to the music.",
    "Keep it between 90 and 130 words."
  ].join(" ");

  const user = JSON.stringify({
    language,
    track: {
      artist: trimText(track.artist, 120),
      song: trimText(track.song, 120),
      style: trimText(track.style, 80),
      styleLabel: trimText(track.styleLabel, 120),
      label: trimText(track.label, 120),
      bpm: trimText(track.bpm, 80),
      energy: trimText(track.energy, 60),
      origin: trimText(track.origin, 120),
      genre: trimText(track.genre, 120),
      currentBio: trimText(track.currentBio, 900),
      profileHint: trimText(track.profileHint, 500),
      styleSummary: trimText(track.styleSummary, 700),
      recommendationContext: trimText(track.recommendationContext, 300)
    },
    sources: knownSources.map((source) => ({
      name: trimText(source?.name, 60),
      url: trimText(source?.url, 240)
    }))
  });

  try {
    const result = await callOpenAiText({
      system,
      user,
      maxOutputTokens: 1400
    });
    if (!result.ok) {
      sendJson(res, result.status || 500, result.payload);
      return;
    }
    const sources = knownSources.map((source) => ({
      name: trimText(source?.name, 60),
      url: trimText(source?.url, 240)
    }));
    sendJson(res, 200, {
      bio: trimText(result.payload.text, 900),
      sourceSummary: sources.length
        ? `Leitura cruzada com ${sources.slice(0, 3).map((source) => source.name).join(", ")} e sinais do catálogo.`
        : "Leitura cruzada com sinais do catálogo.",
      sources,
      confidence: track.currentBio || track.origin || track.genre ? "medium" : "low",
      origin: trimText(track.origin, 120),
      genre: trimText(track.genre || track.styleLabel || track.style, 120),
      source: "openai"
    });
  } catch (error) {
    sendJson(res, 500, { error: "artist_bio_failed", detail: error.message });
  }
};
