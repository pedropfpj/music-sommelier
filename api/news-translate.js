const { callOpenAiJson, parseBody, requirePost, sendJson, trimText } = require("./_openai");

const NEWS_TRANSLATION_SCHEMA = {
  type: "object",
  additionalProperties: false,
  required: ["items"],
  properties: {
    items: {
      type: "array",
      items: {
        type: "object",
        additionalProperties: false,
        required: ["title", "summary"],
        properties: {
          title: { type: "string" },
          summary: { type: "string" }
        }
      }
    }
  }
};

module.exports = async function handler(req, res) {
  if (!requirePost(req, res)) return;

  const body = parseBody(req);
  const language = trimText(body.language || "pt", 8) || "pt";
  const items = Array.isArray(body.items) ? body.items.slice(0, 8) : [];

  const system = [
    "You translate electronic music news for Sonic Search.",
    "Return only valid JSON matching the schema.",
    "Translate title and summary into the requested language.",
    "Preserve artist names, festival names, brand names, publication names, dates, acronyms, and quoted titles.",
    "Do not add facts, opinions, links, or source claims. Do not summarize beyond the provided summary.",
    "Keep titles punchy and readable for an app card. Keep summaries under 190 characters."
  ].join(" ");

  const user = JSON.stringify({
    language,
    items: items.map((item) => ({
      title: trimText(item?.title, 220),
      summary: trimText(item?.summary, 360),
      source: trimText(item?.source, 80)
    }))
  });

  try {
    const result = await callOpenAiJson({
      schemaName: "daily_news_translation",
      schema: NEWS_TRANSLATION_SCHEMA,
      system,
      user,
      maxOutputTokens: 900
    });
    if (!result.ok) {
      sendJson(res, result.status || 500, result.payload);
      return;
    }

    const translatedItems = Array.isArray(result.payload.items) ? result.payload.items : [];
    sendJson(res, 200, {
      items: translatedItems.slice(0, items.length).map((item) => ({
        title: trimText(item?.title, 220),
        summary: trimText(item?.summary, 220)
      })),
      source: "openai"
    });
  } catch (error) {
    sendJson(res, 500, { error: "news_translate_failed", detail: error.message });
  }
};
