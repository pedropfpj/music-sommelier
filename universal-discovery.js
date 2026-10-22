(function install(scope, factory) {
  const music = typeof module !== "undefined" && module.exports ? require("./universal-music.js") : scope.SonicUniversalMusic;
  const listening = typeof module !== "undefined" && module.exports ? require("./universal-listening.js") : scope.SonicUniversalListening;
  const api = factory(music, listening);
  if (typeof module !== "undefined" && module.exports) module.exports = api;
  if (scope) scope.SonicUniversalDiscovery = api;
})(typeof globalThis !== "undefined" ? globalThis : this, function factory(music, listening) {
  "use strict";
  const key = value => music.normalizeKey(value);
  const recordingKey = track => String(track.referenceKey || `${key(track.artistKey || track.artist)}:${key(track.song)}`);
  const groupExists = group => listening.groups.some(g => g.slug === group);
  const REPEAT_COOLDOWN_MS = 7 * 24 * 60 * 60 * 1000;
  // Editorial tiers are hints, not proof that an artist is unknown to a person.
  // References remain entry points; exploration becomes dominant with experience.
  const CADENCE = {
    beginner: ["reference", "affinity", "expansion", "reference", "surprise", "affinity"],
    familiar: ["affinity", "expansion", "surprise", "reference", "expansion", "surprise"],
    expert: ["affinity", "expansion", "surprise", "expansion", "surprise", "reference"]
  };
  function normalizeState(value = {}) {
    const source = value && typeof value === "object" ? value : {};
    const experiences = {};
    for (const [group, experience] of Object.entries(source.experienceByGroup || {})) {
      if (groupExists(group) && ["beginner", "familiar", "expert"].includes(experience)) experiences[group] = experience;
    }
    const history = Array.isArray(source.history) ? source.history.filter(h => h && ["like", "pass", "known", "block"].includes(h.action)
      && h.key && h.artistKey && groupExists(h.group)) : [];
    const deliveries = Array.isArray(source.deliveries) ? source.deliveries.filter(d => d && d.key && d.artistKey
      && d.referenceKey && groupExists(d.group) && Number.isFinite(Date.parse(d.deliveredAt))).slice(-500) : [];
    const deliveryCounts = {};
    for (const group of listening.groups) {
      const count = source.deliveryCounts?.[group.slug];
      deliveryCounts[group.slug] = Number.isSafeInteger(count) && count >= 0 ? count
        : deliveries.filter(d => d.group === group.slug).length;
    }
    return { version: 2, group: groupExists(source.group) ? source.group : "rock",
      experienceByGroup: experiences, history: history.slice(-500), deliveries, deliveryCounts };
  }
  function react(state, track, action, now = new Date().toISOString()) {
    const safe = normalizeState(state);
    if (!["like", "pass", "known", "block"].includes(action) || !listening.previewEligible(track) || listening.playbackResult(track) !== "played") return safe;
    const entry = { key: track.key, artistKey: key(track.artistKey || track.artist), artist: track.artist,
      referenceKey: recordingKey(track), song: track.song, group: track.group, universe: track.universe, genre: track.genre,
      url: track.evidence.url, action, reactedAt: now };
    // Reactions are editable, not accumulated counters for repeat clicks.
    safe.history = [...safe.history.filter(h => h.key !== entry.key && recordingKey(h) !== entry.referenceKey), entry].slice(-500);
    return safe;
  }
  function recordDelivery(state, track, now = new Date().toISOString(), lane = "") {
    const safe = normalizeState(state), timestamp = Date.parse(now);
    if (!Number.isFinite(timestamp) || track?.group !== safe.group || !listening.previewEligible(track, timestamp)
      || listening.playbackResult(track, timestamp) !== "played") return safe;
    const referenceKey = recordingKey(track);
    if (safe.deliveries.some(d => (d.referenceKey === referenceKey || d.key === track.key) && recent(d.deliveredAt, timestamp))) return safe;
    safe.deliveries = [...safe.deliveries, { key: track.key, referenceKey, artistKey: key(track.artistKey || track.artist),
      group: track.group, genre: track.genre, lane: Object.values(CADENCE).flat().includes(lane) ? lane : "",
      deliveredAt: now }].slice(-500);
    safe.deliveryCounts[track.group] = Math.min(Number.MAX_SAFE_INTEGER, safe.deliveryCounts[track.group] + 1);
    return safe;
  }
  function recent(value, now) {
    const age = now - Date.parse(value);
    return age >= -5 * 60 * 1000 && age < REPEAT_COOLDOWN_MS;
  }
  function ranked(tracks, rawState, { now = Date.now(), limit = 24, includeExplicit = true } = {}) {
    const state = normalizeState(rawState);
    const seenRecordings = new Set();
    const history = state.history, experience = state.experienceByGroup[state.group] || "beginner";
    const intendedLane = CADENCE[experience][state.deliveryCounts[state.group] % CADENCE[experience].length];
    const recentDeliveries = state.deliveries.filter(d => d.group === state.group && recent(d.deliveredAt, now));
    const deliveredVideos = new Set(recentDeliveries.map(d => d.key));
    const byKey = new Map(tracks.map(track => [track.key, track]));
    const excludedRecordings = new Set(history.filter(h => ["like", "pass", "known"].includes(h.action)).map(h => {
      const original = byKey.get(h.key);
      return original ? recordingKey(original) : recordingKey(h);
    }));
    for (const delivery of recentDeliveries) excludedRecordings.add(delivery.referenceKey);
    const blockedArtists = new Set(history.filter(h => h.action === "block").map(h => key(h.artistKey)));
    const knownArtists = new Set(history.filter(h => ["like", "known"].includes(h.action)).map(h => key(h.artistKey)));
    const eligible = tracks.filter(t => t.group === state.group && !blockedArtists.has(key(t.artistKey || t.artist)) && listening.previewEligible(t, now)
      && listening.playbackResult(t, now) === "played" && (includeExplicit || !t.explicit));
    const distinct = eligible.filter(t => {
      const id = recordingKey(t);
      if (seenRecordings.has(id) || excludedRecordings.has(id) || deliveredVideos.has(t.key)) return false;
      seenRecordings.add(id); return true;
    });
    // Affinity is transferred to new artists through style, not by repeatedly
    // returning the artist who received the like. A single pass is not a ban.
    const genreWeights = {};
    for (const item of history.filter(h => h.group === state.group)) {
      if (item.action === "like") {
        genreWeights[item.genre] = Math.min(1, (genreWeights[item.genre] || 0) + .35);
      }
    }
    const references = distinct.filter(t => t.discoveryTier === "reference");
    const exploration = distinct.filter(t => ["deep_cut", "discovery"].includes(t.discoveryTier)
      && !knownArtists.has(key(t.artistKey || t.artist)));
    let lane = intendedLane, pool;
    if (intendedLane === "reference") {
      pool = references.length ? references : exploration;
      if (!references.length) lane = "affinity";
    } else {
      pool = exploration;
      // Never advertise a famous-only fallback as less-obvious discovery.
      if (!pool.length && experience !== "expert") { pool = references; lane = "reference"; }
    }
    const newestArtists = new Set(recentDeliveries.slice(-3).map(d => key(d.artistKey)));
    const rotated = pool.filter(t => !newestArtists.has(key(t.artistKey || t.artist)));
    if (rotated.length) pool = rotated;
    const previousGenre = recentDeliveries.at(-1)?.genre;
    const shared = music.rankCandidates(pool.map(t => ({ ...t, status: "tested_preview", playable: true })),
      { primaryUniverse: eligible[0]?.universe, universes: [...new Set(eligible.map(t => t.universe))], experience,
        experienceByUniverse: Object.fromEntries(eligible.map(t => [t.universe, experience])),
        genreWeights: lane === "affinity" ? genreWeights : {},
        novelty: experience === "expert" ? .9 : experience === "familiar" ? .55 : .2 },
      { limit: 100, perArtistLimit: 1,
        excludedKeys: history.filter(h => ["like", "pass"].includes(h.action)).map(h => h.key),
        knownKeys: history.filter(h => h.action === "known").map(h => h.key),
        rejectedArtistKeys: history.filter(h => h.action === "block").map(h => h.artistKey),
        knownArtistKeys: [...knownArtists], discoverNewArtists: lane !== "reference" });
    const result = shared.map(r => {
      const candidate = pool.find(t => t.evidence.videoId === r.candidate.evidence.videoId);
      const laneScore = lane === "expansion" ? (candidate.genre !== previousGenre ? .9 : 0)
        : lane === "surprise" ? (candidate.discoveryTier === "discovery" ? .8 : 0) + (1 - (genreWeights[candidate.genre] || 0)) * .6 : 0;
      return { ...r, score: r.score + laneScore, candidate, selectionLane: lane, intendedLane,
        feedbackAffinity: lane === "affinity" && Boolean(genreWeights[candidate.genre]) };
    });
    return result.sort((a, b) => b.score - a.score || a.candidate.key.localeCompare(b.candidate.key)).slice(0, Math.max(0, Math.min(100, limit)));
  }
  function catalogCoverage(catalog, tracks, now = Date.now()) {
    return listening.groups.map(g => {
      const references = catalog.filter(t => listening.groupForTrack(t) === g.slug);
      const source = listening.coverage(tracks, g.slug, now);
      return { ...g, ...source, catalogArtists: new Set(references.map(t => t.artistKey)).size,
        catalogTracks: references.length, discoveryReady: source.testedPlayableTracks >= 1,
        launchReady: false };
    }).filter(g => g.catalogArtists > 0);
  }
  function explanation(track, state, language = "pt", selection = {}) {
    const safe = normalizeState(state), experience = safe.experienceByGroup[track.group] || "beginner";
    const tier = track.discoveryTier;
    const copies = {
      pt: { reference: "Uma referência para começar por este estilo.", deep_cut: "Um caminho de aprofundamento na seleção deste estilo.", discovery: "Um nome escolhido para ampliar sua exploração.",
        expert: "Seu perfil pede mais exploração; a disponibilidade de fontes pode limitar a seleção.", affinity: "Uma direção próxima aos estilos que você curtiu, com outro artista.", expansion: "Outro caminho dentro deste estilo, dando espaço a artistas diferentes.", surprise: "Uma escolha de exploração para sair das recomendações habituais." },
      en: { reference: "A reference to start exploring this style.", deep_cut: "A deeper path in this style's selection.", discovery: "An artist selected to broaden your exploration.", expert: "Your profile asks for more exploration; available sources may limit the selection.", affinity: "Close to the styles you liked, with a different artist.", expansion: "Another path within this style, making room for different artists.", surprise: "An exploratory choice beyond habitual recommendations." },
      es: { reference: "Una referencia para empezar a explorar este estilo.", deep_cut: "Una ruta para profundizar en este estilo.", discovery: "Un artista elegido para ampliar tu exploración.", expert: "Tu perfil pide más exploración; las fuentes disponibles pueden limitar la selección.", affinity: "Cerca de los estilos que te gustaron, con otro artista.", expansion: "Otro camino dentro de este estilo, dando espacio a artistas diferentes.", surprise: "Una elección para explorar más allá de las recomendaciones habituales." }
    };
    const copy = copies[language] || copies.pt;
    if (selection.selectionLane === "reference") return copy.reference;
    if (selection.selectionLane === "affinity" && selection.feedbackAffinity) return copy.affinity;
    if (["expansion", "surprise"].includes(selection.selectionLane)) return copy[selection.selectionLane];
    return experience === "expert" && tier === "reference" ? copy.expert : copy[tier] || copy.reference;
  }
  function previewEnabled(location, explicit = false) {
    if (explicit === true) return true;
    return ["localhost", "127.0.0.1", "[::1]"].includes(location?.hostname)
      && new URLSearchParams(location?.search || "").get("universalPreview") === "1";
  }
  return { normalizeState, react, recordDelivery, ranked, recordingKey, catalogCoverage, explanation, previewEnabled };
});
