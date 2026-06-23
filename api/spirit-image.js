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

const SPIRIT_IMAGE_PROMPT_VERSION = "electronic-party-bust-v33-visible-gear";
const SPIRIT_IMAGE_STORE_PREFIX = "sonic:spirit-image:v27";
const SPIRIT_IMAGE_MODEL = String(process.env.OPENAI_SPIRIT_IMAGE_MODEL || "gpt-image-1").trim();

const SPIRIT_ENTITY_BRIEFS = {
  ritual_cosmico: "adult psytrance/goa party archetype, joyful expressive human face, UV-reactive geometric ravewear, round tinted glasses, layered utility vest, mandala patches, neon makeup, a few festival beads, psychedelic club light, not carnival",
  alquimista_sombrio: "adult dark electronic party archetype, magnetic human face, deep believable eyes, black layered clubwear, smoked-lens accessories, sub-bass pressure graphics, aqua and purple underground light",
  oraculo_nevoa: "adult slambient/leftfield party archetype, serene realistic face, soft smile, translucent technical hood kept away from face, misty clubwear, slow waveform light, calm low-frequency atmosphere",
  feiticeiro_darkpsy: "adult dark-psy/forest rave archetype, charismatic human face, alert eyes, playful grin, bioluminescent dark textiles, organic rave accessories, nocturnal neon smoke, no fantasy sorcerer costume",
  cirurgiao_psycore: "adult psycore/hi-tech rave archetype, precise realistic face, sharp confident smile, futuristic clinical rave jacket, reflective seams, glitch accessories, high-BPM light cuts, controlled chaos",
  guardiao_fullon_noite: "adult full-on night psytrance party archetype, awake playful eyes, confident smile, acid-neon midnight jacket, curated psy accessories, dense melodic neon arcs, post-midnight rave energy",
  viajante_sunrise: "adult sunrise progressive/full-on party archetype, warm realistic smile, bright eyes, light festival layers, soft technical scarf, pink and gold melodic light, uplifting morning rave atmosphere",
  estilista_tech_house: "adult tech-house / bass-house groove pilot archetype, social club charisma, booth-aware confidence, visible happy face, technical mesh or transparent-vinyl clubwear, asymmetric utility zipper vest or crossbody harness, reflective fader LED seams, angular tinted glasses or transparent in-ear monitor, club wristband, single ear cuff or clean chain, cyan/lime/magenta club accents, DJ mixer fader geometry, CDJ jog-wheel arcs, equalizer blocks, chopped-vocal LED fragments, dry bass pulse bars, not a plain leather-jacket portrait, not a simple headshot",
  alma_house: "adult house/disco clubber archetype, warm expressive face, generous smile, glossy jacket or fitted shirt, amber jewelry, rounded bass waves, vocal warmth, social dancefloor glow",
  operador_acido: "adult acid techno operator archetype, focused realistic face, visible eyes, structured industrial coat, black mesh layer, acid-green reflective lines, 303 curves, concrete club light",
  acelerador_quantico: "adult hi-tech/psycore accelerator archetype, fearless human face, intense bright eyes, kinetic grin, prismatic technical jacket, speed-line accessories, micro-cut sparks, ultra-fast rave energy",
  engenheiro_groove: "adult groove/tech-house archetype, friendly realistic face, warm eyes, calm smile, studio-club vest, headphones around neck, tactile fabric, holographic mixer lines, rounded bass loops",
  arquiteto_hipnotico: "adult hypnotic techno archetype, focused realistic face, steady eyes, structured dark coat, minimal club tailoring, blueprint-light details, repeating pressure corridors, acid techno geometry",
  cacador_bass: "adult bass/DnB/dubstep rave archetype, charismatic human face, sharp eyes, magnetic grin, oversized or tactical bass jacket, headphones or pressure-ring collar, magenta-blue drop shockwaves",
  viajante_organico: "adult organic/downtempo party archetype, serene realistic face, gentle smile, woven layered clothes, botanical textile accents, analog jewelry, green-gold downtempo waves, warm lamps",
  explorador_fractal: "adult IDM/electro experimental club archetype, curious realistic face, asymmetrical smile, patchwork technical jacket, iridescent accents, glitch jewelry, orange-cyan-violet geometry",
  oraculo_trance: "adult trance club archetype, open emotional eyes, calm happy expression, elegant chrome-blue collar or jacket, refined light jewelry, violet-blue melodic frequency arcs, clean euphoric club light",
  catalisador_hard: "adult hard-dance/hardcore archetype, powerful human face, focused bright eyes, fearless non-aggressive smile, reflective black performance jacket, impact collar, red-cyan strobe pressure",
  navegante_breaks: "adult breaks/garage archetype, stylish human face, alert curious eyes, sideways smirk, asymmetric street-club jacket, lightweight headphones, broken-grid waveforms, magenta-cyan syncopated light"
};

function dominantStyleVisualRule(dominantStyles = "") {
  const text = String(dominantStyles || "").toLowerCase();
  if (/(hardstyle|hardcore|frenchcore|speedcore|rawstyle|gabber|schranz)/.test(text)) {
    return "Hard dance / hardcore visual family: adult hard-club party archetype with reflective black performance wear, impact collar, red-white-cyan strobe, euphoric kick pressure, athletic bust posture, non-aggressive confidence, no psytrance mandalas unless the styles explicitly include psy.";
  }
  if (/(trance|uplifting|tech trance|hard trance)/.test(text) && !/(psy|goa|full[- ]?on)/.test(text)) {
    return "Trance visual family: adult melodic club archetype with elegant chrome-blue/violet ravewear, clean euphoric light arcs, open emotional gaze, polished uplifting club styling, no forest-psy ritual styling.";
  }
  if (/(techno|acid|industrial|minimal|detroit|raw|ebm|peak)/.test(text)) {
    return "Techno visual family: adult warehouse/club archetype with industrial black tailoring, mesh or nylon layers, harness or reflective seams, concrete-room strobe, acid or steel light, precise posture, minimal high-fashion accessories, no psychedelic festival costume.";
  }
  if (/(house|afro|organic|deep|disco|jackin|garage house|tech house)/.test(text)) {
    return "House / tech-house visual family: warm adult clubber or groove connector with visible human warmth, booth-to-dancefloor confidence, technical clubwear, mesh/vinyl/utility seams, one curated accessory, mixer-fader/CDJ/equalizer geometry, dry-bass pulse light, and social club charisma. A plain person with leather jacket, necklace, glasses, and neon waveform is not enough.";
  }
  if (/(drum|dnb|jungle|neurofunk|jump up|dubstep|bass|trap|garage|breakbeat|footwork|wave)/.test(text)) {
    return "Bass / DnB / breaks visual family: adult bass-scene archetype with tactical street-club fashion, oversized hoodie or cargo details, pressure-ring collar, headphones around neck, kinetic shoulders, magenta-cyan impact light, no psytrance shaman styling.";
  }
  if (/(ambient|downtempo|chillout|trip hop|organic|leftfield|idm|electro|experimental)/.test(text)) {
    return "Ambient / leftfield visual family: adult atmospheric electronic-scene archetype, organic or cyber-editorial clothing depending on the brief, mist, subtle particles, contemplative happy gaze, no festival-psy default.";
  }
  if (/(psy|goa|full[- ]?on|forest|dark progressive|slambient|hitech|hi tech)/.test(text)) {
    return "Psychedelic visual family: adult psytrance rave archetype with UV/fractal details, geometric techwear, tinted glasses, beads, face gems, neon makeup, realistic premium face fully readable, no carnival or samba costume.";
  }
  return "General electronic visual family: follow the dominant styles and archetype brief exactly; do not default to psytrance. Build a distinct adult party/club archetype for the user's actual taste.";
}

function spiritEntityBrief(body = {}) {
  const bodyBrief = trimText(body.humanEntityBrief || body.spiritHumanBrief || "", 1400);
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
    feminine: "Character presentation requested by the user: fictional adult female-presenting person; keep it respectful, non-sexualized, and clearly adult.",
    female: "Character presentation requested by the user: fictional adult female-presenting person; keep it respectful, non-sexualized, and clearly adult.",
    masculine: "Character presentation requested by the user: fictional adult male-presenting person; keep it respectful, non-sexualized, and clearly adult.",
    male: "Character presentation requested by the user: fictional adult male-presenting person; keep it respectful, non-sexualized, and clearly adult.",
    androgynous: "Character presentation requested by the user: fictional adult androgynous electronic-scene person; keep it respectful, non-sexualized, and clearly adult."
  };
  const vibeMap = {
    dark_club: "User-selected visual vibe: dark underground club, low key warehouse light, sharp LEDs, premium after-hours atmosphere.",
    neon_festival: "User-selected visual vibe: neon festival energy, UV accents, expressive rave color, clean readable face.",
    techwear_editorial: "User-selected visual vibe: cyber-editorial techwear, structured materials, reflective seams, fashion-forward club styling.",
    organic_mystic: "User-selected visual vibe: organic mystical electronic mood, botanical or woven materials blended with sound-system light.",
    warm_house: "User-selected visual vibe: warm house groove, social dancefloor charisma, glossy clubwear, amber and cyan booth glow."
  };
  const accessoryMap = {
    headphones: "headphones or transparent in-ear monitor",
    visor: "single angular visor or tinted eyewear",
    harness: "utility harness or crossbody rig",
    piercings: "ear cuff or clean piercings",
    led_trim: "LED trim integrated into clothing",
    face_gems: "tasteful face gems or rave makeup",
    modular_cables: "abstract modular cable or patch-grid details",
    club_wristband: "club wristband"
  };

  const selectedAccessories = Array.from(new Set(accessories))
    .map((item) => accessoryMap[item])
    .filter(Boolean)
    .slice(0, 4);
  return [
    presentationMap[presentation] || "",
    vibeMap[vibe] || "",
    selectedAccessories.length
      ? `User-selected accessory accents to include if they fit the subgenre: ${selectedAccessories.join(", ")}. Keep accessories curated and non-duplicated.`
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
  const requireTrustedUser = envFlag("SONIC_SPIRIT_IMAGE_REQUIRE_TRUSTED_USER", true);
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
  const requirePremium = envFlag("SONIC_AI_IMAGE_REQUIRE_PREMIUM", true);
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

  const humanEntityBrief = spiritEntityBrief(body);
  const dominantStyles = trimText(body.dominantStyles, 220);
  const visualFamilyRule = dominantStyleVisualRule(dominantStyles || humanEntityBrief);
  const artParameterBrief = spiritArtParameterBrief(body);
  const characterRegeneration = body.forceRegenerate === true || body.characterRegeneration === true;
  const characterReplacementInstruction = characterRegeneration
    ? "USER REJECTED THE PREVIOUS CHARACTER: this regeneration must create a different fictional adult person and a complete visual redesign. Do not keep the same face, bust, head shape, hair, apparent presentation, skin tone, body silhouette, posture, expression, clothing silhouette, jacket, harness, collar, glasses, visor, headphones, jewelry, makeup pattern, color palette, lighting setup, background panel, or character identity. Preserve the same musical archetype, but replace the person and every visible styling decision."
    : "";
  const safePrompt = [
    `Prompt version: ${trimText(body.promptVersion || SPIRIT_IMAGE_PROMPT_VERSION, 80)}.`,
    "ELECTRONIC PERSONALITY LOCK: the result must be unmistakably electronic before it reads as a portrait. Include at least three visible electronic-culture cues integrated into wardrobe, light, or background: DJ mixer faders, CDJ jog-wheel arcs, modular-synth patch grid, cable silhouettes, equalizer blocks, speaker pressure rings, LED strips, club wristband, transparent in-ear monitor, reflective utility seams, mesh/vinyl clubwear, or booth light panels. Rejection criteria: a clean headshot, LinkedIn/passport/dating-profile portrait, plain person with colored neon, single waveform background, plain black leather jacket, plain black T-shirt, simple pendant necklace, or generic club photo is a failed result.",
    "SUBGENRE WARDROBE TEST: the viewer should be able to guess the electronic subgenre from the person's wearable design before reading any label. Add two wearable subgenre cues and two background/light-system cues. Tech house needs booth/CDJ/mixer-led geometry, mesh or transparent vinyl, utility zips, dry-bass pulse bars, and social after-hours styling. Techno needs concrete warehouse tailoring, mesh, harness or reflective seams, acid/steel strobe. Psytrance needs UV geometric ravewear and fractal/psy light without carnival. Bass/DnB/breaks needs tactical street-club layers, pressure rings, headphones or cargo details. Trance needs clean chrome-blue/violet euphoric clubwear.",
    "BUST FRAMING LOCK: show head, neck, both shoulders, and enough upper torso for the outfit to matter. The face should not consume the whole image; leave visible space for chest gear, straps, zippers, trims, and clubwear texture. A passport-like headshot crop fails.",
    "PARTY-GEAR MINIMUM: do not generate a normal unaccessorized person. The upper chest and shoulders must visibly include at least three electronic-scene gear cues: utility harness, asymmetric zipper vest, crossbody rig, transparent-vinyl or mesh club layer, reflective fader-like seams, angular tinted glasses or lifted visor, transparent in-ear monitor, club wristband, single ear cuff, headphones, LED trim, mixer/CDJ patch motif, or clean chain. Use different accessory roles, never duplicates. If the outfit is a simple shirt, plain jacket, ordinary fashion top, or only a simple crossbody strap with an equalizer background, the image fails.",
    "QUALITY GATE: create a polished semi-realistic / hyper-realistic digital-art bust portrait, chest-up only, centered, with head, neck, shoulders, and upper chest visible. The subject is a fictional adult human electronic-music party archetype linked to the user's dominant electronic subgenres, club culture, rhythm, dance, fashion, and nightlife. The face must be large, bright, clear, happy or warmly confident, and readable on a phone: expressive eyes, visible mouth, strong facial key light, no hidden shadow, no mask-like blankness, no face lost behind smoke, helmet, text, or effects. It must look like a distinct person from an electronic music scene, not a supernatural spirit, generic musician, carnival performer, fantasy character, mascot, or abstract icon.",
    characterReplacementInstruction,
    artParameterBrief,
    `Archetype-specific partygoer brief: ${humanEntityBrief}.`,
    dominantStyles ? `Dominant music styles to embody visually: ${dominantStyles}.` : "",
    visualFamilyRule,
    "TOTAL VARIATION RULE: every generated image must look substantially different from previous busts, even for the same archetype. Do not repeat the same outfit type, jacket cut, vest, harness/strap layout, collar, glasses or visor shape, headphones, jewelry set, hairstyle, makeup pattern, dominant color palette, pose, lighting direction, or background composition.",
    "ACCESSORY DISCIPLINE RULE: accessories must be curated, not duplicated. Use at most one eyewear item total; if glasses are on the face, do not place another pair on the head or forehead. Use at most one necklace or one pendant focal point; do not stack repeated necklaces, repeated beads, duplicate pendants, duplicate ear cuffs, duplicate rings, or multiple accessories serving the same visual role.",
    "ELECTRONIC-FIRST RULE: the image must read as electronic music before anything else. Build the look from recognizable club, rave, DJ booth, synth, and sound-system culture: abstract mixer-fader geometry, equalizer bars, waveform arcs, modular-synth patch-grid or cable silhouettes, speaker-pressure rings, laser lines, LED strips, UV-reactive seams, chrome, transparent vinyl, reflective nylon, mesh, and subgenre-specific clubwear. Keep these cues as abstract lights, fabric details, background geometry, or material design; do not add readable text, brand logos, duplicated accessories, or extra props.",
    "The app will add all text, stats, frame, and UI later. Generate only the central artwork: no typography, captions, numbers, logos, watermarks, borders, UI panels, poster text, label text or brand marks inside the image.",
    "Required visual language: modern electronic nightlife character portrait, cinematic and realistic but not a studio lifestyle photo, with realistic human skin texture, tasteful club/rave makeup, wearable accessories, detailed fabrics, reflective trims, piercings, ear cuffs, tinted glasses, transparent in-ear monitor, headphones, utility straps, mesh, nylon, transparent vinyl, chrome, LEDs, face gems, synth-interface details, mixer-line trims, frequency-grid lighting, and subgenre-specific styling. Keep the person joyful, alive, approachable, and premium.",
    "Required head and torso design: use subgenre-specific clothing and accessories rather than fantasy ornaments. Psytrance may use UV-reactive geometric techwear, round tinted glasses, beads, face gems, and fractal textile patterns; techno may use black industrial tailoring, mesh, harness straps, and acid-green reflective lines; house may use glossy fashion clubwear and warm jewelry; bass/DnB may use oversized streetwear, headphones, cargo details, and pressure-light accents; trance may use elegant chrome/violet clubwear; hard dance may use reflective performance jackets and strobe accents; leftfield may use organic or cyber-editorial layers. No crowns, armor, sacred medallions, ceremonial robes, acoustic instruments, guitars, lyres, tambourines, or generic floating music notes.",
    "Background: clean modular editable abstract neon studio background or light panel behind the bust, separated from the subject and easy to recolor or replace later, with abstract equalizer, waveform, mixer, modular-synth, laser, LED, or speaker-pressure geometry that signals electronic music without readable text. No crowd, no stage, no confetti.",
    "Respect the subgenre visual family embedded in the human brief: psychedelic styles should look psytrance/rave/UV/fractal, techno should look warehouse/industrial/minimal, house should feel warm/social/fashionable, trance should feel euphoric/melodic/clean, bass should feel physical and pressure-driven, hard dance should feel high-impact and euphoric, downtempo/ambient should feel atmospheric/organic, and experimental styles should look asymmetric cyber-editorial.",
    "Vary the person design across generations: change face identity, head shape, hair, skin tone, expression, wardrobe category, clothing silhouette, accessory family, lighting, background, and emotional presence. Adult male, adult female, and occasional androgynous adult variants are encouraged.",
    characterRegeneration ? "For this request, prioritize character replacement and styling replacement over continuity: another adult person from the same electronic subgenre scene with a totally different outfit and accessory set is better than a familiar face or repeated clothing with improved styling." : "",
    "Strict negative style: no duplicate accessories, no two pairs of glasses, no glasses on face plus glasses on forehead, no repeated necklaces, no repeated pendants, no excessive beads, no duplicated ear cuffs, no accessory clutter, no plain black leather jacket, no plain black T-shirt, no simple pendant-only styling, no plain outfit with only a neon background, no clean headshot, no centered passport composition, no corporate beauty portrait, no ordinary fashion portrait, no LinkedIn portrait, no dating-profile portrait, no carnival feathers, no samba costume, no circus/clown feeling, no cartoon, no anime, no childish illustration, no mascot, no emoji, no doll, no flat vector, no abstract crystal, no blank gradient, no placeholder, no robot body, no creature, no skull, no plastic mannequin, no deformed face, no crossed eyes, no hands dominating the frame, no full body, no aggressive expression, no generic fantasy character, no medieval costume, no acoustic instruments, no guitars, no lyres, no tambourines, no ordinary DJ press photo, no plain passport portrait.",
    "Safety: fictional adult only; no real person or celebrity likeness, no minors, no nudity, no sexualized body, no gore, no readable text, and no brand marks.",
    "Make the person feel premium, expressive, underground, personal, sonically alive, unmistakably electronic, and clearly shaped by the specific electronic subgenre archetype.",
    prompt
  ].filter(Boolean).join(" ");

  try {
    const result = await callOpenAiImage({
      prompt: safePrompt,
      size: "1024x1024",
      quality: "high",
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
