const OPENAI_RESPONSES_URL = "https://api.openai.com/v1/responses";
const OPENAI_IMAGES_URL = "https://api.openai.com/v1/images/generations";
const { betaAccessRequired, requestBetaGrant } = require("./_beta-grants");
const { enforceDailyUsageLimit, hashStoreKey, hasDurableStore } = require("./_usage-store");
const {
  allowedOrigin,
  isProductionLike,
  requestBodyTooLarge,
  setCorsHeaders
} = require("./_request-security");
const dailyBudget = new Map();

function envFlag(name, fallback = false) {
  const raw = String(process.env[name] || "").trim().toLowerCase();
  if (!raw) return Boolean(fallback);
  return ["1", "true", "yes", "on", "enabled"].includes(raw);
}

function envInt(name, fallback, min = 0, max = 100000) {
  const parsed = Number.parseInt(String(process.env[name] || ""), 10);
  if (!Number.isFinite(parsed)) return fallback;
  return Math.max(min, Math.min(max, parsed));
}

function envText(name, fallback = "") {
  const raw = String(process.env[name] || "").trim();
  return raw || fallback;
}

function setCors(res) {
  setCorsHeaders(res.req, res, {
    originEnvNames: ["SONIC_AI_ALLOWED_ORIGINS"],
    methods: ["POST", "OPTIONS"],
    allowedHeaders: "Content-Type, Authorization, X-Sonic-Auth-Token, X-Sonic-Access-Token"
  });
}

function originAllowed(req) {
  return allowedOrigin(req, ["SONIC_AI_ALLOWED_ORIGINS"]);
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
  res.req = req;
  if (handleOptions(req, res)) return false;
  if (req.method !== "POST") {
    sendJson(res, 405, { error: "method_not_allowed" });
    return false;
  }
  if (requestBodyTooLarge(req, envInt("SONIC_API_MAX_BODY_BYTES", 1048576, 1024, 5242880))) {
    sendJson(res, 413, { error: "request_body_too_large" });
    return false;
  }
  return true;
}

function bearerToken(req) {
  const header = String(req.headers?.authorization || "");
  const match = header.match(/^Bearer\s+(.+)$/i);
  return match?.[1]?.trim() || "";
}

function requestClientId(req) {
  const forwarded = String(req.headers?.["x-forwarded-for"] || "").split(",")[0].trim();
  const realIp = String(req.headers?.["x-real-ip"] || "").trim();
  const userAgent = String(req.headers?.["user-agent"] || "").slice(0, 90);
  return `${forwarded || realIp || "unknown"}:${userAgent}`;
}

function todayKey() {
  return new Date().toISOString().slice(0, 10);
}

function enforceDailyBudget(req, feature, limit) {
  const safeLimit = Math.max(0, Number(limit) || 0);
  if (!safeLimit) return { ok: true, remaining: null };
  const key = `${todayKey()}:${feature}:${requestClientId(req)}`;
  const current = Number(dailyBudget.get(key) || 0);
  if (current >= safeLimit) return { ok: false, remaining: 0 };
  dailyBudget.set(key, current + 1);
  return { ok: true, remaining: safeLimit - current - 1 };
}

function enforceOpenAiDailyBudget(req, res, {
  feature = "text",
  dailyLimitEnv = "SONIC_AI_TEXT_DAILY_LIMIT",
  defaultDailyLimit = 80
} = {}) {
  const budget = enforceDailyBudget(req, feature, envInt(dailyLimitEnv, defaultDailyLimit, 0, 10000));
  if (!budget.ok) {
    sendJson(res, 429, { error: "daily_ai_limit_reached", feature });
    return false;
  }

  if (budget.remaining !== null) {
    res.setHeader("X-Sonic-AI-Remaining", String(budget.remaining));
  }

  return true;
}

function secondsUntilNextUtcDay() {
  const now = Date.now();
  const next = new Date(now);
  next.setUTCHours(24, 0, 0, 0);
  return Math.max(60, Math.ceil((next.getTime() - now) / 1000) + 3600);
}

function durableRateLimitsRequired() {
  return envFlag("SONIC_REQUIRE_DURABLE_RATE_LIMITS", isProductionLike());
}

async function enforceDurableOpenAiDailyBudget(req, res, {
  feature = "text",
  dailyLimitEnv = "SONIC_AI_TEXT_DAILY_LIMIT",
  defaultDailyLimit = 80
} = {}) {
  const dailyLimit = envInt(dailyLimitEnv, defaultDailyLimit, 0, 10000);
  if (dailyLimit && durableRateLimitsRequired() && !hasDurableStore()) {
    sendJson(res, 503, { error: "durable_rate_limit_required", feature });
    return false;
  }

  const key = `sonic:usage:ai:${feature}:${todayKey()}:${hashStoreKey(requestClientId(req))}`;
  const budget = await enforceDailyUsageLimit({
    key,
    limit: dailyLimit,
    expiresInSeconds: secondsUntilNextUtcDay()
  });
  if (!budget.ok) {
    sendJson(res, 429, { error: budget.error || "daily_ai_limit_reached", feature, limit: dailyLimit });
    return false;
  }

  if (budget.remaining !== null) res.setHeader("X-Sonic-AI-Durable-Remaining", String(budget.remaining));
  res.setHeader("X-Sonic-Usage-Store", budget.store || "memory");
  return true;
}

function requireOpenAiPost(req, res, {
  feature = "text",
  enabledEnv = "SONIC_AI_TEXT_ENABLED",
  defaultEnabled = true,
  dailyLimitEnv = "SONIC_AI_TEXT_DAILY_LIMIT",
  defaultDailyLimit = 80,
  budgetOnStart = true,
  betaAccess
} = {}) {
  if (!requirePost(req, res)) return false;

  if (!originAllowed(req)) {
    sendJson(res, 403, { error: "origin_not_allowed" });
    return false;
  }

  if (!envFlag(enabledEnv, defaultEnabled)) {
    sendJson(res, 403, { error: "ai_feature_disabled", feature });
    return false;
  }

  if (betaAccessRequired(feature, betaAccess)) {
    const grant = requestBetaGrant(req, parseBody(req));
    if (!grant.ok) {
      const status = grant.error === "beta_access_secret_not_configured" ? 503 : 401;
      sendJson(res, status, {
        error: "beta_access_required",
        reason: grant.error,
        feature
      });
      return false;
    }
  }

  const serverToken = String(process.env.SONIC_AI_SERVER_TOKEN || "").trim();
  if (serverToken && bearerToken(req) !== serverToken) {
    sendJson(res, 401, { error: "invalid_ai_token" });
    return false;
  }

  if (budgetOnStart) {
    return enforceOpenAiDailyBudget(req, res, {
      feature,
      dailyLimitEnv,
      defaultDailyLimit
    });
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

function extractJsonFromText(text = "") {
  const source = String(text || "").trim();
  if (!source) return "";
  if (source.startsWith("{") && source.endsWith("}")) return source;

  const fenced = source.match(/```(?:json)?\s*([\s\S]*?)```/i);
  if (fenced?.[1]) {
    const fencedJson = fenced[1].trim();
    if (fencedJson.startsWith("{") && fencedJson.endsWith("}")) return fencedJson;
  }

  const firstBrace = source.indexOf("{");
  const lastBrace = source.lastIndexOf("}");
  if (firstBrace >= 0 && lastBrace > firstBrace) {
    return source.slice(firstBrace, lastBrace + 1).trim();
  }
  return source;
}

function parseOpenAiJsonText(outputText = "") {
  const jsonText = extractJsonFromText(outputText);
  if (!jsonText) return null;
  try {
    return JSON.parse(jsonText);
  } catch (_error) {
    return null;
  }
}

function modelSupportsReasoningOptions(model = "") {
  return /^gpt-5(?:\.|$|-)/i.test(String(model || "").trim());
}

function responseIncompleteDetail(payload = {}) {
  const status = String(payload?.status || "").trim();
  const reason = String(payload?.incomplete_details?.reason || "").trim();
  if (status === "incomplete" || reason) {
    return [status || "incomplete", reason].filter(Boolean).join(": ");
  }
  return "";
}

async function callOpenAiJson({ schemaName, schema, system, user, maxOutputTokens = 500 }) {
  if (!hasOpenAiKey()) {
    return { ok: false, status: 503, payload: { error: "missing_openai_api_key" } };
  }

  const model = envText("OPENAI_TEXT_MODEL", "gpt-5-mini");
  const tokenCap = envInt("SONIC_AI_TEXT_MAX_OUTPUT_TOKENS", 1400, 200, 3000);
  const requestBody = {
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
    max_output_tokens: Math.min(Math.max(200, Number(maxOutputTokens) || 500), tokenCap)
  };
  const reasoningEffort = envText("OPENAI_REASONING_EFFORT", modelSupportsReasoningOptions(model) ? "minimal" : "");
  if (reasoningEffort) {
    requestBody.reasoning = { effort: reasoningEffort };
  }

  const response = await fetch(OPENAI_RESPONSES_URL, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
      "Content-Type": "application/json"
    },
    body: JSON.stringify(requestBody)
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
  const parsed = parseOpenAiJsonText(outputText);
  if (parsed) {
    return { ok: true, payload: parsed };
  }

  const incompleteDetail = responseIncompleteDetail(payload);
  if (incompleteDetail) {
    return {
      ok: false,
      status: 502,
      payload: {
        error: "openai_incomplete_output",
        detail: incompleteDetail
      }
    };
  }

  return {
    ok: false,
    status: 502,
    payload: {
      error: "invalid_openai_json",
      detail: outputText ? "Structured response was not valid JSON." : "OpenAI returned no visible text output."
    }
  };
}

async function callOpenAiText({ system, user, maxOutputTokens = 500 }) {
  if (!hasOpenAiKey()) {
    return { ok: false, status: 503, payload: { error: "missing_openai_api_key" } };
  }

  const model = envText("OPENAI_TEXT_MODEL", "gpt-5-mini");
  const tokenCap = envInt("SONIC_AI_TEXT_MAX_OUTPUT_TOKENS", 1400, 200, 3000);
  const requestBody = {
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
    max_output_tokens: Math.min(Math.max(200, Number(maxOutputTokens) || 500), tokenCap)
  };
  const reasoningEffort = envText("OPENAI_REASONING_EFFORT", modelSupportsReasoningOptions(model) ? "minimal" : "");
  if (reasoningEffort) {
    requestBody.reasoning = { effort: reasoningEffort };
  }

  const response = await fetch(OPENAI_RESPONSES_URL, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
      "Content-Type": "application/json"
    },
    body: JSON.stringify(requestBody)
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

  const outputText = trimText(extractResponseText(payload), maxOutputTokens * 6);
  if (outputText) return { ok: true, payload: { text: outputText } };

  const incompleteDetail = responseIncompleteDetail(payload);
  return {
    ok: false,
    status: 502,
    payload: {
      error: incompleteDetail ? "openai_incomplete_output" : "empty_openai_text",
      detail: incompleteDetail || "OpenAI returned no visible text output."
    }
  };
}

async function callOpenAiImage({ prompt, size = "1024x1024", quality = "medium", model: requestedModel = "" }) {
  if (!hasOpenAiKey()) {
    return { ok: false, status: 503, payload: { error: "missing_openai_api_key" } };
  }

  const model = String(requestedModel || process.env.OPENAI_IMAGE_MODEL || "gpt-image-1").trim();
  const safeQuality = String(quality || process.env.OPENAI_IMAGE_QUALITY || "medium").trim();
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
      quality: safeQuality,
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
  callOpenAiText,
  enforceOpenAiDailyBudget,
  enforceDurableOpenAiDailyBudget,
  envFlag,
  envInt,
  parseBody,
  requireOpenAiPost,
  requirePost,
  sendJson,
  trimText
};
