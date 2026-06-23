const {
  callOpenAiImage,
  enforceDurableOpenAiDailyBudget,
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
const { resolveAccessContext } = require("./_access-control");

const SPIRIT_IMAGE_PROMPT_VERSION = "personal-sound-system-v1";
const SPIRIT_IMAGE_STORE_PREFIX = "sonic:sound-system-image:v1";
const SPIRIT_IMAGE_MODEL = String(process.env.OPENAI_SPIRIT_IMAGE_MODEL || "gpt-image-1").trim();
const SOUND_SYSTEM_FREE_UNLOCK_LIKES = 10;

const SPIRIT_ENTITY_BRIEFS = {
  ritual_cosmico: "psytrance/goa sound system with UV speaker cones, fractal LED rings, stacked subs, modular synth glyphs, festival-grade light geometry, and clean premium psychedelic hardware",
  alquimista_sombrio: "dark electronic sound system with black glass racks, aqua-purple subwoofer pressure rings, industrial speaker towers, smoked light panels, and underground bass architecture",
  oraculo_nevoa: "slambient/leftfield listening studio with misty monitors, slow waveform meters, soft low-frequency light, acoustic panels, and serene cinematic equipment layout",
  feiticeiro_darkpsy: "dark-psy/forest sound system with nocturnal speaker stacks, bioluminescent cable paths, organic acoustic panels, dense sub-bass lights, and no fantasy character elements",
  cirurgiao_psycore: "psycore/hi-tech rig with precise modular racks, high-BPM LED cuts, clinical chrome panels, glitch meters, compact sub arrays, and controlled-chaos cable geometry",
  guardiao_fullon_noite: "full-on night psytrance system with midnight speaker stacks, acid-neon arcs, melodic LED tunnels, tuned monitors, and post-midnight rave energy",
  viajante_sunrise: "sunrise progressive/full-on home-to-stage system with warm monitors, pink-gold light rails, bright synth modules, soft subwoofer glow, and uplifting morning atmosphere",
  estilista_tech_house: "tech-house / bass-house booth system with CDJ jog-wheel arcs, mixer-fader light, dry-bass pulse bars, transparent acrylic panels, compact club subs, and cyan/lime/magenta LEDs",
  alma_house: "house/disco studio system with warm speaker cabinets, amber meters, rounded bass-wave lighting, glossy console surfaces, and social dancefloor glow",
  operador_acido: "acid techno system with industrial speaker columns, black mesh grilles, acid-green 303 curves, concrete-room strobes, steel racks, and minimal warehouse pressure",
  acelerador_quantico: "hi-tech/psycore accelerator rig with prismatic speaker shells, micro-cut LED sparks, fast waveform meters, modular cable grids, and ultra-fast rave architecture",
  engenheiro_groove: "groove/tech-house studio-club system with tactile mixer lines, rounded bass loops, nearfield monitors, holographic meters, and clean production-room structure",
  arquiteto_hipnotico: "hypnotic techno sound architecture with repeating speaker corridors, blueprint light panels, subwoofer columns, acid-steel meters, and minimal pressure geometry",
  cacador_bass: "bass/DnB/dubstep pressure system with heavyweight subs, tactical rack cases, magenta-blue impact lights, pressure-ring collars around speakers, and kinetic drop architecture",
  viajante_organico: "organic/downtempo listening studio with warm wood monitors, woven acoustic panels, analog knobs, green-gold slow waves, and botanical studio texture",
  explorador_fractal: "IDM/electro experimental studio with asymmetric modular racks, iridescent panels, glitch meters, fractured orange-cyan-violet lighting, and playful hardware geometry",
  oraculo_trance: "trance sound system with elegant chrome-blue/violet speaker arrays, euphoric melodic frequency arcs, clean booth architecture, and luminous polished scale",
  catalisador_hard: "hard-dance/hardcore rig with red-cyan strobe impact, powerful subwoofer wall, reflective performance speaker shells, kick-pressure meters, and euphoric high-impact light",
  navegante_breaks: "breaks/garage system with syncopated speaker blocks, lightweight monitors, broken-grid waveforms, magenta-cyan bass haze, and angular club/street equipment styling"
};

function dominantStyleVisualRule(dominantStyles = "") {
  const text = String(dominantStyles || "").toLowerCase();
  if (/(hardstyle|hardcore|frenchcore|speedcore|rawstyle|gabber|schranz)/.test(text)) {
    return "Hard dance / hardcore visual family: high-impact subwoofer wall, red-white-cyan strobe, kick-pressure meters, reflective speaker shells, festival power, no psytrance mandalas unless explicitly present.";
  }
  if (/(trance|uplifting|tech trance|hard trance)/.test(text) && !/(psy|goa|full[- ]?on)/.test(text)) {
    return "Trance visual family: chrome-blue/violet line arrays, clean euphoric frequency arcs, polished booth/stage geometry, melodic light, no forest-psy styling.";
  }
  if (/(techno|acid|industrial|minimal|detroit|raw|ebm|peak)/.test(text)) {
    return "Techno visual family: warehouse speaker stacks, concrete-room strobe, black mesh grilles, steel racks, acid or steel light, minimal precise architecture, no psychedelic festival costume.";
  }
  if (/(house|afro|organic|deep|disco|jackin|garage house|tech house)/.test(text)) {
    return "House / tech-house visual family: warm booth/studio system, rounded bass waves, CDJ/mixer/equalizer geometry, amber/cyan club glow, transparent acrylic, dry-bass pulse lights, social dancefloor warmth.";
  }
  if (/(drum|dnb|jungle|neurofunk|jump up|dubstep|bass|trap|garage|breakbeat|footwork|wave)/.test(text)) {
    return "Bass / DnB / breaks visual family: heavyweight sub arrays, pressure-ring lights, tactical road cases, kinetic speaker blocks, magenta-cyan drop shockwaves, no psytrance shaman styling.";
  }
  if (/(ambient|downtempo|chillout|trip hop|organic|leftfield|idm|electro|experimental)/.test(text)) {
    return "Ambient / leftfield visual family: atmospheric listening studio, organic or cyber-editorial equipment materials, mist, subtle meters, acoustic panels, no festival-psy default.";
  }
  if (/(psy|goa|full[- ]?on|forest|dark progressive|slambient|hitech|hi tech)/.test(text)) {
    return "Psychedelic visual family: UV/fractal speaker rings, geometric LED panels, stacked subs, modular synth glyphs, festival-grade hardware, no carnival or costume styling.";
  }
  return "General electronic visual family: follow the dominant styles and sound-system brief exactly; do not default to psytrance. Build a distinct equipment/studio/stage identity for the user's actual taste.";
}

function spiritEntityBrief(body = {}) {
  const bodyBrief = trimText(body.soundSystemBrief || body.systemBrief || body.humanEntityBrief || body.spiritHumanBrief || "", 1600);
  if (bodyBrief) return bodyBrief;
  const spiritId = trimText(body.spiritId, 80);
  return SPIRIT_ENTITY_BRIEFS[spiritId] || SPIRIT_ENTITY_BRIEFS.engenheiro_groove;
}

function normalizeParam(value = "") {
  return String(value || "")
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9_-]/g, "_")
    .replace(/_+/g, "_")
    .replace(/^_+|_+$/g, "");
}

function spiritArtParameterBrief(body = {}) {
  const rawParams = body.artParams && typeof body.artParams === "object" ? body.artParams : {};
  const presentation = normalizeParam(rawParams.presentation || rawParams.genderPresentation || rawParams.sex);
  const vibe = normalizeParam(rawParams.vibe || rawParams.mood);
  const accessories = Array.isArray(rawParams.accessories) ? rawParams.accessories.map(normalizeParam) : [];

  const presentationMap = {
    feminine: "User-selected system form: sleek vertical speaker towers with elegant studio proportions.",
    female: "User-selected system form: sleek vertical speaker towers with elegant studio proportions.",
    masculine: "User-selected system form: wide powerful subwoofer wall with heavy club-system proportions.",
    male: "User-selected system form: wide powerful subwoofer wall with heavy club-system proportions.",
    androgynous: "User-selected system form: balanced hybrid console with modular racks and sculptural line arrays."
  };
  const vibeMap = {
    dark_club: "User-selected visual vibe: dark underground club, low key warehouse light, sharp LEDs, premium after-hours atmosphere.",
    neon_festival: "User-selected visual vibe: neon festival energy, UV accents, expressive rave color, line arrays, and clean open-air stage light.",
    techwear_editorial: "User-selected visual vibe: cyber-editorial hardware, structured metal/glass materials, reflective seams, and premium club-system styling.",
    organic_mystic: "User-selected visual vibe: organic electronic mood, botanical or woven acoustic materials blended with sound-system light.",
    warm_house: "User-selected visual vibe: warm house groove, social dancefloor warmth, rounded speaker shapes, amber and cyan booth glow."
  };
  const accessoryMap = {
    headphones: "studio monitor pair or headphone dock",
    visor: "transparent holographic meter display",
    harness: "road-case straps, cable looms, and rack rails",
    piercings: "chrome patch points and connector details",
    led_trim: "music-reactive LED trim",
    face_gems: "small laser nodes and signal crystals",
    modular_cables: "modular cable or patch-grid details",
    club_wristband: "small club lighting tag or road-case sticker detail"
  };

  const selectedAccessories = Array.from(new Set(accessories))
    .map((item) => accessoryMap[item])
    .filter(Boolean)
    .slice(0, 4);
  return [
    presentationMap[presentation] || "",
    vibeMap[vibe] || "",
    selectedAccessories.length
      ? `User-selected sound-system modules to include if they fit the subgenre: ${selectedAccessories.join(", ")}. Keep modules curated and non-duplicated.`
      : ""
  ].filter(Boolean).join(" ");
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

function soundSystemFreeUnlock(body = {}) {
  const likes = Math.max(0, Number(body.likes) || 0);
  const milestoneLikes = Math.max(0, Number(body.milestoneLikes) || 0);
  const userIdentity = trimText(
    body.userSignature ||
      body.userKey ||
      body.userId ||
      body.profileOwner ||
      "",
    240
  );
  return Boolean(
    userIdentity &&
      likes >= SOUND_SYSTEM_FREE_UNLOCK_LIKES &&
      milestoneLikes >= SOUND_SYSTEM_FREE_UNLOCK_LIKES
  );
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
    defaultEnabled: true,
    dailyLimitEnv: "SONIC_AI_IMAGE_DAILY_LIMIT",
    defaultDailyLimit: 25,
    budgetOnStart: false
  })) return;

  const body = parseBody(req);
  const accessContext = await resolveAccessContext(req, body);
  const ownerUnlimited = accessContext.owner && envFlag("SONIC_OWNER_UNLIMITED_ACCESS", true);
  const freeSoundSystemUnlocked = soundSystemFreeUnlock(body);
  const requireTrustedUser = envFlag("SONIC_SPIRIT_IMAGE_REQUIRE_TRUSTED_USER", false) && !freeSoundSystemUnlocked;
  if (requireTrustedUser && !accessContext.premium) {
    sendJson(res, accessContext.tokenPresent && !accessContext.authenticated ? 401 : 402, {
      error: accessContext.tokenPresent && !accessContext.authenticated ? "login_required" : "premium_required",
      role: accessContext.role,
      authenticated: accessContext.authenticated,
      owner: accessContext.owner,
      premium: accessContext.premium
    });
    return;
  }
  const requirePremium = envFlag("SONIC_AI_IMAGE_REQUIRE_PREMIUM", false) && !freeSoundSystemUnlocked;
  if (requirePremium && !accessContext.premium) {
    sendJson(res, 402, { error: "premium_required", role: accessContext.role });
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
  const configuredMaxPerUser = envInt("SONIC_AI_IMAGE_MAX_PER_USER", 1, 1, 100);
  const maxPerUser = ownerUnlimited
    ? 0
    : allowBetaRegeneration
    ? Math.max(configuredMaxPerUser, 25)
    : configuredMaxPerUser;
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
    if (maxPerUser && existingGenerationCount >= maxPerUser) {
      sendJson(res, 429, {
        error: "image_generation_limit_reached",
        maxPerUser,
        generationCount: existingGenerationCount
      });
      return;
    }
  }

  const prompt = trimText(body.prompt, 4200);
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

  if (!ownerUnlimited && !await enforceDurableOpenAiDailyBudget(req, res, {
    feature: "spirit-image",
    dailyLimitEnv: "SONIC_AI_IMAGE_DAILY_LIMIT",
    defaultDailyLimit: 25
  })) {
    await deleteKey(lockKey);
    return;
  }

  const soundSystemBrief = spiritEntityBrief(body);
  const dominantStyles = trimText(body.dominantStyles, 220);
  const visualFamilyRule = dominantStyleVisualRule(dominantStyles || soundSystemBrief);
  const artParameterBrief = spiritArtParameterBrief(body);
  const systemRegeneration = body.forceRegenerate === true || body.systemRegeneration === true || body.characterRegeneration === true;
  const characterRegeneration = systemRegeneration;
  const systemReplacementInstruction = systemRegeneration
    ? "USER REQUESTED A FRESH SOUND SYSTEM: redesign the equipment layout, speaker silhouette, stage/studio architecture, lighting direction, material palette, cable/rack organization, scale, and camera angle. Preserve the same taste profile and milestone stage, but make the system visually distinct from the previous version."
    : "";
  const safePrompt = [
    `Prompt version: ${trimText(body.promptVersion || SPIRIT_IMAGE_PROMPT_VERSION, 80)}.`,
    "PERSONAL SOUND SYSTEM LOCK: create only a beautiful evolving electronic-music sound system, studio setup, club stage, festival stage, or futuristic sound architecture. The sound system is the hero subject. No people, no faces, no bodies, no character, no mascot, no animal, no creature, no humanoid robot, no portrait, no wearable fashion, and no crowd.",
    "ELECTRONIC EQUIPMENT MINIMUM: include at least five visible electronic-music equipment cues: speaker cones, subwoofers, studio monitors, line arrays, DJ booth, mixer faders, CDJ jog-wheel arcs, modular synth racks, patch cable grids, spectrum meters, equalizer blocks, LED strips, laser lines, acoustic panels, truss, road cases, cable runs, or speaker-pressure rings.",
    "EVOLUTION RULE: the stage must match the user's current milestone. Early milestones should feel like a starter sound system or home studio; middle milestones should feel like professional studio or club stage; high milestones should feel like festival-scale or impossible futuristic sound architecture.",
    "QUALITY GATE: polished premium digital art, semi-realistic / high-quality 3D illustration, slightly cartoony in shape language but expensive and detailed. Equipment silhouettes must be readable on a phone. Use cinematic lighting, rich materials, clear depth, and a shareable collectible finish.",
    systemReplacementInstruction,
    artParameterBrief,
    `Sound-system brief: ${soundSystemBrief}.`,
    dominantStyles ? `Dominant music styles to embody visually: ${dominantStyles}.` : "",
    visualFamilyRule,
    "TOTAL VARIATION RULE: every generated image must look substantially different from previous systems for the same profile. Change speaker layout, scale, room/stage type, camera angle, light direction, material palette, rack/cable organization, and background architecture.",
    "ELECTRONIC-FIRST RULE: the image must read as electronic music before anything else. Build the look from recognizable club, rave, DJ booth, synth, and sound-system culture: mixer-fader geometry, equalizer bars, waveform arcs, modular-synth patch grids, cable silhouettes, speaker-pressure rings, laser lines, LED strips, chrome, brushed metal, black glass, transparent acrylic, acoustic fabric, road cases, and truss.",
    "The app will add all text, stats, frame, and UI later. Generate only the central artwork: no typography, captions, numbers, logos, watermarks, borders, UI panels, poster text, label text or brand marks inside the image.",
    "Background: clean modular editable studio, club, or stage environment behind and around the system, separated from the equipment and easy to crop for a share card. No text, no crowd, no confetti, no human silhouettes.",
    "Strict negative style: no human, no face, no body, no portrait, no bust, no person, no child, no celebrity likeness, no mascot, no animal, no creature, no skull, no humanoid robot, no mannequin, no wearable outfit, no skin, no eyes, no mouth, no hands, no crowd, no ordinary DJ press photo, no lifestyle room with people, no acoustic instruments, no guitars, no lyres, no tambourines, no readable text, no brands, no logos, no watermark, no UI, no poster border, no blank gradient, no flat icon.",
    "Make the system feel premium, expressive, underground, personal, sonically alive, unmistakably electronic, and clearly shaped by the user's specific electronic subgenre taste.",
    prompt
  ].filter(Boolean).join(" ");

  try {
    const result = await callOpenAiImage({
      prompt: safePrompt,
      size: "1024x1024",
      quality: String(process.env.OPENAI_SPIRIT_IMAGE_QUALITY || "medium").trim() || "medium",
      model: SPIRIT_IMAGE_MODEL
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
      characterRegeneration,
      regenerationReason: trimText(body.regenerationReason, 120),
      profileSignature: trimText(body.profileSignature, 120),
      language: trimText(body.language, 8),
      accessRole: accessContext.role,
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
