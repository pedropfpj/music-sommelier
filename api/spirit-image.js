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

const SPIRIT_IMAGE_PROMPT_VERSION = "human-spirit-v3";
const SPIRIT_IMAGE_STORE_PREFIX = "sonic:spirit-image:v4";

const SPIRIT_ENTITY_BRIEFS = {
  ritual_cosmico: "charismatic adult cosmic trance shaman, visible warm human face, kind commanding eyes, festival ritual robe, mandala halo, harmonic laser arcs, melodic psy and goa color energy",
  alquimista_sombrio: "adult shadow alchemist, magnetic human face, deep believable eyes, obsidian coat, spectral vapor, sub-bass pressure rings, dark ritual elegance, aqua and purple glow",
  oraculo_nevoa: "adult mist oracle, serene realistic face, compassionate eyes, translucent hood, slow waveform halos, fog spirals, slambient darkness, calm charismatic presence",
  feiticeiro_darkpsy: "adult dark-psy forest sorcerer, human charismatic face, alert wild eyes, magnetic grin, bioluminescent forest-club textiles, twisted psy spirals, nocturnal smoke",
  cirurgiao_psycore: "adult psycore surgeon, precise realistic human face, sharp confident eyes, futuristic clinical rave jacket, glitch trails, high-BPM light cuts, controlled chaos",
  guardiao_fullon_noite: "adult full-on night guardian, realistic festival face, awake playful eyes, confident smile, acid-neon midnight jacket, dense melodic neon arcs, post-midnight psy energy",
  viajante_sunrise: "adult sunrise psy voyager, warm realistic smile, bright eyes, golden skin light, soft festival layers, pink and gold melodic ribbons, uplifting morning atmosphere",
  estilista_tech_house: "adult tech-house stylist, stylish confident human face, visible eyes, relaxed smirk, sharp black clubwear, dry bass pulses, chopped vocal light fragments, social club charisma",
  alma_house: "adult house-soul entity, warm expressive human face, generous smile, amber clubwear, rounded bass waves, vocal warmth, golden clap particles, community dancefloor glow",
  operador_acido: "adult acid operator, focused realistic human face, visible eyes, structured industrial coat, acid-green reflective lines, 303 curves, hypnotic grid corridors, concrete club light",
  acelerador_quantico: "adult quantum accelerator, fearless human face, intense bright eyes, kinetic smirk, prismatic speed-suit jacket, atom arcs, micro-cut sparks, ultra-fast hi-tech aura",
  engenheiro_groove: "adult groove engineer, friendly realistic face, warm eyes, calm smile, studio-club vest, headphones around neck, holographic mixer lines, rounded bass loops",
  arquiteto_hipnotico: "adult hypnotic architect, focused realistic face, steady eyes, structured dark coat, blueprint-light tattoos, repeating pressure corridors, acid techno geometry",
  cacador_bass: "adult bass hunter, charismatic human face, sharp eyes, magnetic grin, heavy bass jacket, pressure-ring collar, subwoofer rings, magenta-blue drop shockwaves",
  viajante_organico: "adult organic voyager, serene realistic human face, gentle smile, woven organic layers, botanical signal filaments, green-gold downtempo waves, analog warmth",
  explorador_fractal: "adult fractal explorer, curious realistic human face, asymmetrical smile, patchwork technical jacket, fractal cubes, IDM micro-detail sparks, orange-cyan-violet geometry"
};

function spiritEntityBrief(body = {}) {
  const bodyBrief = trimText(body.humanEntityBrief || body.spiritHumanBrief || "", 1400);
  if (bodyBrief) return bodyBrief;
  const spiritId = trimText(body.spiritId, 80);
  return SPIRIT_ENTITY_BRIEFS[spiritId] || SPIRIT_ENTITY_BRIEFS.engenheiro_groove;
}

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
  const promptVersion = trimText(body.promptVersion || SPIRIT_IMAGE_PROMPT_VERSION, 80);
  const spiritId = trimText(body.spiritId, 80) || "spirit";
  const milestoneLikes = Math.max(0, Number(body.milestoneLikes) || 0);
  const profileSignature = trimText(body.profileSignature || "", 240);
  const scope = [
    promptVersion,
    userIdentity,
    spiritId,
    milestoneLikes,
    profileSignature || "profile"
  ].join(":");
  return `${SPIRIT_IMAGE_STORE_PREFIX}:${hashStoreKey(scope)}`;
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
    promptVersion: record.promptVersion || SPIRIT_IMAGE_PROMPT_VERSION,
    uniquePerSpirit: true,
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

  const prompt = trimText(body.prompt, 2200);
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

  const humanEntityBrief = spiritEntityBrief(body);
  const dominantStyles = trimText(body.dominantStyles, 220);
  const safePrompt = [
    `Prompt version: ${trimText(body.promptVersion || SPIRIT_IMAGE_PROMPT_VERSION, 80)}.`,
    "QUALITY GATE: produce a photorealistic, cinematic, editorial portrait or upper-body figure of a fictional adult human musical-spirit entity. It must read instantly as a charismatic real human presence, not as an avatar.",
    `Spirit-specific human brief: ${humanEntityBrief}.`,
    dominantStyles ? `Dominant music styles to embody visually: ${dominantStyles}.` : "",
    "The app will add all text, stats, frame, and UI later. Generate only the central artwork; no typography, captions, numbers, logos, watermarks, borders, or UI panels.",
    "The figure must have visible face, head, neck, shoulders or upper body; believable warm eyes; natural skin detail with pores and subtle asymmetry; expressive brow and mouth; cinematic lighting; realistic fabric/material detail; and a music-reactive aura tied to the spirit brief.",
    "Strict negative style: not mask-like, not mannequin-like, not plastic, not blank stare, not cartoon, not anime, not mascot, not emoji, not doll, not flat vector, not robot, not creature, not skull, not generic fantasy character, not generic stock portrait, not a literal DJ photo.",
    "Safety: fictional adult only; no real person or celebrity likeness, no minors, no nudity, no sexualized body, no gore, no readable text, and no brand marks.",
    "Make the entity feel premium, emotionally magnetic, underground, personal, sonically alive, and clearly shaped by the specific spirit characteristics.",
    prompt
  ].filter(Boolean).join(" ");

  try {
    const result = await callOpenAiImage({
      prompt: safePrompt,
      size: "1024x1024",
      quality: "high"
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
      promptVersion: trimText(body.promptVersion || SPIRIT_IMAGE_PROMPT_VERSION, 80),
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
