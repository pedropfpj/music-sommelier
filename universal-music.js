(function installSonicUniversalMusic(globalScope, factory) {
  "use strict";

  const api = factory();
  if (typeof module !== "undefined" && module.exports) module.exports = api;
  if (globalScope) globalScope.SonicUniversalMusic = api;
})(typeof globalThis !== "undefined" ? globalThis : this, function createSonicUniversalMusic() {
  "use strict";

  const SCHEMA_VERSION = 2;
  const DEFAULT_UNIVERSE = "electronic";

  const UNIVERSES = Object.freeze([
    {
      slug: "electronic",
      labels: { pt: "Eletrônica", en: "Electronic", es: "Electrónica" },
      genres: ["electronic", "house", "techno", "trance", "psytrance", "drum_and_bass", "bass_music", "hard_dance"]
    },
    {
      slug: "pop",
      labels: { pt: "Pop", en: "Pop", es: "Pop" },
      genres: ["pop", "contemporary_pop", "art_pop", "indie_pop", "synth_pop", "k_pop", "j_pop"]
    },
    {
      slug: "rock_metal",
      labels: { pt: "Rock e metal", en: "Rock & metal", es: "Rock y metal" },
      genres: ["rock", "indie_rock", "alternative_rock", "punk", "post_punk", "metal", "progressive_metal", "hardcore_punk"]
    },
    {
      slug: "hip_hop_rap",
      labels: { pt: "Hip-hop e rap", en: "Hip-hop & rap", es: "Hip-hop y rap" },
      genres: ["hip_hop", "rap", "boom_bap", "trap_rap", "drill", "grime", "experimental_hip_hop"]
    },
    {
      slug: "rnb_soul_funk",
      labels: { pt: "R&B, soul e funk", en: "R&B, soul & funk", es: "R&B, soul y funk" },
      genres: ["rnb", "soul", "neo_soul", "funk_soul", "p_funk", "disco", "gospel"]
    },
    {
      slug: "brazilian",
      labels: { pt: "Música brasileira", en: "Brazilian music", es: "Música brasileña" },
      genres: ["mpb", "samba", "pagode", "bossa_nova", "forro", "sertanejo", "funk_brasileiro", "trap_brasileiro", "manguebeat"]
    },
    {
      slug: "latin_caribbean",
      labels: { pt: "Latina e caribenha", en: "Latin & Caribbean", es: "Latina y caribeña" },
      genres: ["latin_pop", "reggaeton", "salsa", "cumbia", "bachata", "merengue", "son_cubano"]
    },
    {
      slug: "classical",
      labels: { pt: "Erudita e ópera", en: "Classical & opera", es: "Clásica y ópera" },
      genres: ["classical", "baroque", "classical_period", "romantic_classical", "modern_classical", "contemporary_classical", "opera", "choral", "chamber_music"]
    },
    {
      slug: "jazz_blues",
      labels: { pt: "Jazz e blues", en: "Jazz & blues", es: "Jazz y blues" },
      genres: ["jazz", "blues", "bebop", "cool_jazz", "jazz_fusion", "spiritual_jazz", "free_jazz", "electric_blues"]
    },
    {
      slug: "reggae_dub",
      labels: { pt: "Reggae e dub", en: "Reggae & dub", es: "Reggae y dub" },
      genres: ["reggae", "roots_reggae", "dub", "dancehall", "ska", "rocksteady"]
    },
    {
      slug: "african_global",
      labels: { pt: "Africana e global", en: "African & global", es: "Africana y global" },
      genres: ["afrobeat", "afrobeats", "amapiano", "highlife", "soukous", "gnawa", "rai", "global_bass"]
    },
    {
      slug: "folk_country_traditional",
      labels: { pt: "Folk, country e regional", en: "Folk, country & traditional", es: "Folk, country y tradicional" },
      genres: ["folk", "country", "bluegrass", "americana", "flamenco", "fado", "traditional_music", "singer_songwriter"]
    },
    {
      slug: "ambient_experimental_soundtracks",
      labels: { pt: "Ambient, experimental e trilhas", en: "Ambient, experimental & scores", es: "Ambient, experimental y bandas sonoras" },
      genres: ["ambient", "experimental", "drone", "electroacoustic", "new_age", "soundtrack", "film_score", "game_music"]
    }
  ]);

  const universeBySlug = new Map(UNIVERSES.map((universe) => [universe.slug, universe]));
  const universeByGenre = new Map();
  const universeByAlias = new Map();
  UNIVERSES.forEach((universe) => {
    universeByAlias.set(normalizeKey(universe.slug), universe.slug);
    Object.values(universe.labels).forEach((label) => universeByAlias.set(normalizeKey(label), universe.slug));
    universe.genres.forEach((genre) => universeByGenre.set(genre, universe.slug));
  });

  function normalizeKey(value = "") {
    return String(value || "")
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "_")
      .replace(/^_+|_+$/g, "");
  }

  function normalizeUniverse(value = "", fallback = DEFAULT_UNIVERSE) {
    const key = normalizeKey(value);
    if (universeByAlias.has(key)) return universeByAlias.get(key);
    const safeFallback = normalizeKey(fallback);
    return universeByAlias.get(safeFallback) || DEFAULT_UNIVERSE;
  }

  function isKnownUniverse(value = "") {
    return universeByAlias.has(normalizeKey(value));
  }

  function universeForGenre(genre = "", fallback = DEFAULT_UNIVERSE) {
    const key = normalizeKey(genre);
    return universeByGenre.get(key) || normalizeUniverse(fallback);
  }

  function universeLabel(universe = DEFAULT_UNIVERSE, language = "pt") {
    const item = universeBySlug.get(normalizeUniverse(universe));
    const locale = ["pt", "en", "es"].includes(language) ? language : "pt";
    return item?.labels?.[locale] || item?.labels?.pt || universe;
  }

  function listUniverses(language = "pt") {
    return UNIVERSES.map((universe, index) => ({
      slug: universe.slug,
      label: universeLabel(universe.slug, language),
      labels: { ...universe.labels },
      sortOrder: (index + 1) * 10,
      seedGenres: [...universe.genres]
    }));
  }

  function normalizeWeightMap(value = {}) {
    const source = value && typeof value === "object" && !Array.isArray(value) ? value : {};
    const output = {};
    Object.entries(source).forEach(([rawKey, rawWeight]) => {
      const key = normalizeKey(rawKey);
      const weight = Number(rawWeight);
      if (!key || !Number.isFinite(weight) || weight === 0) return;
      output[key] = Math.max(-100, Math.min(100, weight));
    });
    return output;
  }

  function normalizeTasteProfile(value = {}) {
    const source = value && typeof value === "object" && !Array.isArray(value) ? value : {};
    const rawUniverses = Array.isArray(source.universes) ? source.universes : [source.primaryUniverse || DEFAULT_UNIVERSE];
    const universes = Array.from(new Set(rawUniverses.map((item) => normalizeUniverse(item)).filter(Boolean))).slice(0, 5);
    const primaryUniverse = normalizeUniverse(source.primaryUniverse || universes[0] || DEFAULT_UNIVERSE);
    if (!universes.includes(primaryUniverse)) universes.unshift(primaryUniverse);
    return {
      schemaVersion: SCHEMA_VERSION,
      primaryUniverse,
      universes: universes.slice(0, 5),
      universeWeights: normalizeWeightMap(source.universeWeights),
      genreWeights: normalizeWeightMap(source.genreWeights),
      artistWeights: normalizeWeightMap(source.artistWeights),
      moodWeights: normalizeWeightMap(source.moodWeights),
      contextWeights: normalizeWeightMap(source.contextWeights),
      novelty: Math.max(0, Math.min(1, Number(source.novelty) || 0.5))
    };
  }

  function canonicalCandidate(value = {}) {
    const source = value && typeof value === "object" && !Array.isArray(value) ? value : {};
    const genre = normalizeKey(source.genre || source.style || "");
    const universe = normalizeUniverse(source.universe || universeForGenre(genre));
    return {
      ...source,
      key: normalizeKey(source.key || `${source.artist || ""}_${source.song || source.title || ""}`),
      artistKey: normalizeKey(source.artistKey || source.artist || ""),
      genre,
      universe,
      moods: Array.isArray(source.moods) ? source.moods.map(normalizeKey).filter(Boolean) : [],
      contexts: Array.isArray(source.contexts) ? source.contexts.map(normalizeKey).filter(Boolean) : [],
      playable: source.playable !== false && Boolean(source.previewUrl || source.providerLinks?.length || source.youtubeUrl || source.soundcloudUrl || source.appleMusicUrl),
      confidence: Math.max(0, Math.min(1, Number(source.confidence) || 0.5))
    };
  }

  function candidateScore(candidate, rawProfile = {}, options = {}) {
    const item = canonicalCandidate(candidate);
    if (!item.key || !item.playable) return Number.NEGATIVE_INFINITY;
    const rejected = options.rejectedKeys instanceof Set ? options.rejectedKeys : new Set(options.rejectedKeys || []);
    if (rejected.has(item.key)) return Number.NEGATIVE_INFINITY;
    const profile = normalizeTasteProfile(rawProfile);
    const universeWeight = Number(profile.universeWeights[item.universe] || 0);
    const genreWeight = Number(profile.genreWeights[item.genre] || 0);
    const artistWeight = Number(profile.artistWeights[item.artistKey] || 0);
    const moodScore = item.moods.reduce((sum, mood) => sum + Number(profile.moodWeights[mood] || 0), 0);
    const contextScore = item.contexts.reduce((sum, context) => sum + Number(profile.contextWeights[context] || 0), 0);
    const preferredUniverse = profile.universes.includes(item.universe) ? 2.4 : 0;
    const explorationBoost = profile.novelty * (profile.primaryUniverse === item.universe ? 0.3 : 1.4);
    return preferredUniverse + universeWeight * 1.25 + genreWeight * 1.1 + artistWeight * 1.35 + moodScore * 0.7 + contextScore * 0.55 + explorationBoost + item.confidence;
  }

  function rankCandidates(candidates = [], profile = {}, options = {}) {
    const limit = Math.max(1, Math.min(100, Number(options.limit) || 24));
    const perArtistLimit = Math.max(1, Math.min(5, Number(options.perArtistLimit) || 2));
    const artistCounts = new Map();
    return (Array.isArray(candidates) ? candidates : [])
      .map((candidate) => ({ candidate: canonicalCandidate(candidate), score: candidateScore(candidate, profile, options) }))
      .filter((entry) => Number.isFinite(entry.score))
      .sort((a, b) => b.score - a.score || a.candidate.key.localeCompare(b.candidate.key))
      .filter((entry) => {
        const artistKey = entry.candidate.artistKey || entry.candidate.key;
        const count = artistCounts.get(artistKey) || 0;
        if (count >= perArtistLimit) return false;
        artistCounts.set(artistKey, count + 1);
        return true;
      })
      .slice(0, limit);
  }

  return Object.freeze({
    schemaVersion: SCHEMA_VERSION,
    defaultUniverse: DEFAULT_UNIVERSE,
    universes: UNIVERSES,
    normalizeKey,
    isKnownUniverse,
    normalizeUniverse,
    universeForGenre,
    universeLabel,
    listUniverses,
    normalizeTasteProfile,
    canonicalCandidate,
    candidateScore,
    rankCandidates
  });
});
