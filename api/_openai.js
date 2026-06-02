const OPENAI_RESPONSES_URL = "https://api.openai.com/v1/responses";
const OPENAI_IMAGES_URL = "https://api.openai.com/v1/images/generations";

function setCors(res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");
}

function sendJson(res, statusCode, payload) {
  setCors(res);
  res.statusCode = statusCode;
  res.setHeader("Content-Type", "application/json; charset=utf-8");
  res.end(JSON.stringify(payload));
}

function handleOptions(req, res) {
  if (req.method !== "OPTIONS") return false;
  setCors(res);
  res.statusCode = 204;
  res.end();
  return true;
}

function requirePost(req, res) {
  if (handleOptions(req, res)) return false;
  if (req.method !== "POST") {
    sendJson(res, 405, { error: "method_not_allowed" });
    return false;
  }
  return true;
}

function hasOpenAiKey() {
  return Boolean(String(process.env.OPENAI_API_KEY || "").trim());
}

function parseBody(req) {
  if (!req.body) return {};
  if (typeof req.body === "object") return req.body;
  try {
    return JSON.parse(req.body);
  } catch (_error) {
    return {};
  }
}

function trimText(value, maxLength = 1200) {
  return String(value || "")
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, maxLength);
}

function extractResponseText(payload) {
  if (typeof payload?.output_text === "string") return payload.output_text;
  const output = Array.isArray(payload?.output) ? payload.output : [];
  for (const item of output) {
    const content = Array.isArray(item?.content) ? item.content : [];
    for (const part of content) {
      if (typeof part?.text === "string") return part.text;
      if (typeof part?.output_text === "string") return part.output_text;
    }
  }
  return "";
}

async function callOpenAiJson({ schemaName, schema, system, user, maxOutputTokens = 500 }) {
  if (!hasOpenAiKey()) {
    return { ok: false, status: 503, payload: { error: "missing_openai_api_key" } };
  }

  const model = String(process.env.OPENAI_TEXT_MODEL || "gpt-5-mini").trim();
  const response = await fetch(OPENAI_RESPONSES_URL, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      model,
      input: [
        {
          role: "system",
          content: [{ type: "input_text", text: system }]
        },
        {
          role: "user",
          content: [{ type: "input_text", text: user }]
        }
      ],
      text: {
        format: {
          type: "json_schema",
          name: schemaName,
          strict: true,
          schema
        }
      },
      max_output_tokens: maxOutputTokens
    })
  });

  const payload = await response.json().catch(() => ({}));
  if (!response.ok) {
    return {
      ok: false,
      status: response.status,
      payload: {
        error: "openai_request_failed",
        detail: payload?.error?.message || response.statusText
      }
    };
  }

  const outputText = extractResponseText(payload);
  try {
    return { ok: true, payload: JSON.parse(outputText) };
  } catch (_error) {
    return {
      ok: false,
      status: 502,
      payload: { error: "invalid_openai_json" }
    };
  }
}

async function callOpenAiImage({ prompt, size = "1024x1024", quality = "medium" }) {
  if (!hasOpenAiKey()) {
    return { ok: false, status: 503, payload: { error: "missing_openai_api_key" } };
  }

  const model = String(process.env.OPENAI_IMAGE_MODEL || "gpt-image-1-mini").trim();
  const response = await fetch(OPENAI_IMAGES_URL, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      model,
      prompt: trimText(prompt, 3800),
      size,
      quality,
      n: 1
    })
  });

  const payload = await response.json().catch(() => ({}));
  if (!response.ok) {
    return {
      ok: false,
      status: response.status,
      payload: {
        error: "openai_image_failed",
        detail: payload?.error?.message || response.statusText
      }
    };
  }

  const imageBase64 = String(payload?.data?.[0]?.b64_json || "").trim();
  const imageUrl = String(payload?.data?.[0]?.url || "").trim();
  if (!imageBase64 && !imageUrl) {
    return { ok: false, status: 502, payload: { error: "missing_image_output" } };
  }
  return {
    ok: true,
    payload: {
      imageBase64,
      imageUrl,
      model
    }
  };
}

module.exports = {
  callOpenAiImage,
  callOpenAiJson,
  parseBody,
  requirePost,
  sendJson,
  trimText
};
