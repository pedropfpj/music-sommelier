const { callOpenAiImage, parseBody, requirePost, sendJson, trimText } = require("./_openai");

module.exports = async function handler(req, res) {
  if (!requirePost(req, res)) return;

  const body = parseBody(req);
  const prompt = trimText(body.prompt, 3800);
  if (!prompt) {
    sendJson(res, 400, { error: "missing_prompt" });
    return;
  }

  const safePrompt = [
    prompt,
    "Square 1024x1024 premium collectible artwork.",
    "The image must feature one central cosmic electronic music spirit/entity with a strong silhouette, mystical neon waveform energy, sacred geometry, synth light, and psychedelic club atmosphere.",
    "Make it elegant, polished, readable at small card size, and visually distinct for the provided user signature.",
    "Avoid generic abstract circles, avoid plain DJ or turntable imagery, avoid clutter.",
    "No readable text, no logos, no real people, no celebrity likeness."
  ].join(" ");

  try {
    const result = await callOpenAiImage({
      prompt: safePrompt,
      size: "1024x1024",
      quality: "high"
    });
    if (!result.ok) {
      sendJson(res, result.status || 500, result.payload);
      return;
    }
    sendJson(res, 200, {
      imageBase64: result.payload.imageBase64,
      imageUrl: result.payload.imageUrl,
      model: result.payload.model,
      source: "openai"
    });
  } catch (error) {
    sendJson(res, 500, { error: "spirit_image_failed", detail: error.message });
  }
};
