const {
  callOpenAiImage,
  enforceOpenAiDailyBudget,
  envFlag,
  envInt,
  parseBody,
  requireOpenAiPost,
  sendJson,
  trimText
} = require("./_openai");
const {
  deleteKey,
  hasDurableStore,
  hashStoreKey,
  readJson,
  writeJson
} = require("./_usage-store");

const SPIRIT_IMAGE_STORE_PREFIX = "sonic:spirit-image:v3";

function spiritImageOwnerKey(body = {}) {
  const userIdentity = trimText(
    body.userKey ||
      body.userId ||
      body.userSignature ||
      body.profileOwner ||
      "",
    240
  );
  if (!userIdentity) return "";
  return `${SPIRIT_IMAGE_STORE_PREFIX}:${hashStoreKey(userIdentity)}`;
}

function spiritImageLockKey(imageKey = "") {
  return imageKey ? `${imageKey}:lock` : "";
}

function storedImageResponse(record = {}, reused = true) {
  return {
    imageBase64: record.imageBase64 || "",
    imageUrl: record.imageUrl || "",
    model: record.model || "",
    source: "openai",
    reused,
    uniquePerUser: true,
    generatedAt: record.generatedAt || "",
    generationCount: Math.max(1, Number(record.generationCount) || 1),
    betaRegeneration: Boolean(record.betaRegeneration),
    spiritId: record.spiritId || "",
    milestoneLikes: record.milestoneLikes || 0,
    store: record.store || ""
  };
}

module.exports = async function handler(req, res) {
  if (!requireOpenAiPost(req, res, {
    feature: "spirit-image",
    enabledEnv: "SONIC_AI_IMAGE_ENABLED",
    defaultEnabled: false,
    dailyLimitEnv: "SONIC_AI_IMAGE_DAILY_LIMIT",
    defaultDailyLimit: 3,
    budgetOnStart: false
  })) return;

  const body = parseBody(req);
  const requirePremium = envFlag("SONIC_AI_IMAGE_REQUIRE_PREMIUM", true);
  if (requirePremium && body.premiumUnlocked !== true) {
    sendJson(res, 402, { error: "premium_required" });
    return;
  }

  const imageKey = spiritImageOwnerKey(body);
  if (!imageKey) {
    sendJson(res, 400, { error: "missing_user_identity" });
    return;
  }

  if (envFlag("SONIC_AI_IMAGE_STORE_REQUIRED", false) && !hasDurableStore()) {
    sendJson(res, 503, { error: "durable_store_required" });
    return;
  }

  const allowBetaRegeneration = envFlag("SONIC_AI_IMAGE_ALLOW_BETA_REGENERATION", false);
  const maxPerUser = envInt("SONIC_AI_IMAGE_MAX_PER_USER", allowBetaRegeneration ? 5 : 1, 1, 20);
  const requestedGeneration = Math.max(1, Number(body.imageGenerationIndex) || 1);
  const forceRegenerate = body.forceRegenerate === true;
  const existing = await readJson(imageKey);
  const existingGenerationCount = Math.max(
    0,
    Number(existing?.generationCount) ||
      (existing?.imageBase64 || existing?.imageUrl ? 1 : 0)
  );

  if (existing?.imageBase64 || existing?.imageUrl) {
    if (!allowBetaRegeneration || !forceRegenerate) {
      sendJson(res, 200, storedImageResponse(existing, true));
      return;
    }
    if (existingGenerationCount >= maxPerUser || requestedGeneration > maxPerUser) {
      sendJson(res, 429, {
        error: "image_generation_limit_reached",
        maxPerUser,
        generationCount: existingGenerationCount
      });
      return;
    }
  }

  if (!existing && requestedGeneration > maxPerUser) {
    sendJson(res, 429, {
      error: "image_generation_limit_reached",
      maxPerUser,
      generationCount: 0
    });
    return;
  }

  const prompt = trimText(body.prompt, 3800);
  if (!prompt) {
    sendJson(res, 400, { error: "missing_prompt" });
    return;
  }

  const lockKey = spiritImageLockKey(imageKey);
  const lockAcquired = await writeJson(lockKey, {
    lockedAt: new Date().toISOString()
  }, {
    expiresInSeconds: 180,
    onlyIfMissing: true
  });
  if (!lockAcquired) {
    const lockedExisting = await readJson(imageKey);
    if (lockedExisting?.imageBase64 || lockedExisting?.imageUrl) {
      sendJson(res, 200, storedImageResponse(lockedExisting, true));
      return;
    }
    sendJson(res, 409, { error: "image_generation_pending" });
    return;
  }

  if (!enforceOpenAiDailyBudget(req, res, {
    feature: "spirit-image",
    dailyLimitEnv: "SONIC_AI_IMAGE_DAILY_LIMIT",
    defaultDailyLimit: 3
  })) {
    await deleteKey(lockKey);
    return;
  }

  const safePrompt = [
    prompt,
    "Square 1024x1024 premium collectible artwork centered on a fictional adult human-like musical spirit entity.",
    "Generate only the central realistic human entity artwork; the app will add all text, stats, frame, and UI later.",
    "The figure must have visible human presence: expressive face, head, shoulders or upper body, cinematic lighting, realistic skin/material detail, ritual or dark-club styling, luminous waveform aura, equalizer particles, sub-bass rings, and underground electronic-music intensity.",
    "Strict style: realistic, cinematic, editorial, high-detail and music-reactive; not cartoon, not anime, not mascot, not emoji, not doll, not flat vector, not robot, not creature, not skull, not generic avatar, not a literal DJ photo.",
    "Safety: fictional adult only; no real person or celebrity likeness, no minors, no nudity, no sexualized body, no gore, no logos, no watermarks, no readable text, no numbers, and no UI panels.",
    "Avoid generic stock portraits, plain party photos, clutter, turntables as the main subject, and any cute avatar language. Make the entity feel dark, premium, personal, and sonically alive."
  ].join(" ");

  try {
    const result = await callOpenAiImage({
      prompt: safePrompt,
      size: "1024x1024",
      quality: "medium"
    });
    if (!result.ok) {
      await deleteKey(lockKey);
      sendJson(res, result.status || 500, result.payload);
      return;
    }
    const record = {
      imageBase64: result.payload.imageBase64,
      imageUrl: result.payload.imageUrl,
      model: result.payload.model,
      source: "openai",
      generatedAt: new Date().toISOString(),
      generationCount: existingGenerationCount + 1,
      betaRegeneration: allowBetaRegeneration,
      spiritId: trimText(body.spiritId, 80),
      spiritName: trimText(body.spiritName, 160),
      milestoneLikes: Math.max(0, Number(body.milestoneLikes) || 0),
      profileSignature: trimText(body.profileSignature, 120),
      language: trimText(body.language, 8),
      store: hasDurableStore() ? "durable" : "memory"
    };
    const stored = await writeJson(imageKey, record, { onlyIfMissing: !allowBetaRegeneration });
    if (!stored) {
      const raceExisting = await readJson(imageKey);
      if (raceExisting?.imageBase64 || raceExisting?.imageUrl) {
        await deleteKey(lockKey);
        sendJson(res, 200, storedImageResponse(raceExisting, true));
        return;
      }
    }
    await deleteKey(lockKey);
    sendJson(res, 200, storedImageResponse(record, false));
  } catch (error) {
    await deleteKey(lockKey);
    sendJson(res, 500, { error: "spirit_image_failed", detail: error.message });
  }
};
