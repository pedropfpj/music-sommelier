const { callOpenAiJson, parseBody, requirePost, sendJson, trimText } = require("./_openai");

const ARTIST_BIO_SCHEMA = {
  type: "object",
  additionalProperties: false,
  required: ["bio", "sourceSummary", "sources", "confidence", "origin", "genre"],
  properties: {
    bio: {
      type: "string"
    },
    sourceSummary: {
      type: "string"
    },
    sources: {
      type: "array",
      items: {
        type: "object",
        additionalProperties: false,
        required: ["name", "url"],
        properties: {
          name: { type: "string" },
          url: { type: "string" }
        }
      }
    },
    confidence: {
      type: "string",
      enum: ["high", "medium", "low"]
    },
    origin: {
      type: "string"
    },
    genre: {
      type: "string"
    }
  }
};

module.exports = async function handler(req, res) {
  if (!requirePost(req, res)) return;

  const body = parseBody(req);
  const track = body.track || {};
  const language = trimText(body.language || "pt", 8) || "pt";
  const knownSources = Array.isArray(body.sources) ? body.sources.slice(0, 8) : [];

  const system = [
    "You are Sonic Search's artist bio assistant for an electronic music discovery app.",
    "Return only valid JSON matching the schema.",
    "Use only provided metadata and listed source names/URLs. Never invent a real biography, country, label, alias, or scene detail.",
    "If metadata is weak, say it is a contextual reading based on catalog/style signals.",
    "Keep the copy useful, attractive, and honest for a user deciding whether to explore the artist."
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
      profileHint: trimText(track.profileHint, 500)
    },
    sources: knownSources.map((source) => ({
      name: trimText(source?.name, 60),
      url: trimText(source?.url, 240)
    }))
  });

  try {
    const result = await callOpenAiJson({
      schemaName: "artist_bio",
      schema: ARTIST_BIO_SCHEMA,
      system,
      user,
      maxOutputTokens: 520
    });
    if (!result.ok) {
      sendJson(res, result.status || 500, result.payload);
      return;
    }
    sendJson(res, 200, {
      bio: trimText(result.payload.bio, 760),
      sourceSummary: trimText(result.payload.sourceSummary, 180),
      sources: Array.isArray(result.payload.sources) ? result.payload.sources : [],
      confidence: result.payload.confidence || "low",
      origin: trimText(result.payload.origin, 120),
      genre: trimText(result.payload.genre, 120),
      source: "openai"
    });
  } catch (error) {
    sendJson(res, 500, { error: "artist_bio_failed", detail: error.message });
  }
};
