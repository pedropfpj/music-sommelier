const { callOpenAiText, enforceOpenAiDailyBudget, parseBody, requireOpenAiPost, sendJson, trimText } = require("./_openai");
const { envFirst, envFlag, envInt, envText } = require("./_music-apis");

const DEFAULT_REFERENCE_USER_AGENT = "SonicSearch/1.0 (+https://sonicsearch.app)";
const ARTIST_LOOKUP_TIMEOUT_MS = 4500;
const DISCOGS_TOKEN_ENVS = ["DISCOGS_USER_TOKEN", "DISCOGS_TOKEN"];
const referenceCache = new Map();

function normalizeText(value = "") {
  return String(value || "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/&/g, " and ")
    .replace(/[^a-z0-9]+/g, " ")
    .trim();
}

function artistNameMatches(candidate = "", artist = "") {
  const left = normalizeText(candidate);
  const right = normalizeText(artist);
  if (!left || !right) return false;
  if (left === right) return true;
  return left.replace(/^the\s+/, "") === right.replace(/^the\s+/, "");
}

function uniqueSources(sources = []) {
  const seen = new Set();
  return sources
    .map((source) => ({
      name: trimText(source?.name, 80),
      url: trimText(source?.url, 280),
      note: trimText(source?.note, 240),
      used: source?.used !== false
    }))
    .filter((source) => {
      const key = `${source.name}|${source.url}`;
      if (!source.name || source.used === false || seen.has(key)) return false;
      seen.add(key);
      return true;
    })
    .map(({ name, url, note }) => ({ name, url, note }))
    .slice(0, 10);
}

function referenceUserAgent(provider = "") {
  if (provider === "discogs") {
    return envText("SONIC_DISCOGS_USER_AGENT", envText("SONIC_REFERENCE_USER_AGENT", DEFAULT_REFERENCE_USER_AGENT));
  }
  return envText("SONIC_REFERENCE_USER_AGENT", DEFAULT_REFERENCE_USER_AGENT);
}

function referenceCacheSeconds() {
  return envInt("SONIC_ARTIST_BIO_REFERENCE_CACHE_SECONDS", 86400, 60, 604800);
}

function referenceCacheRead(key) {
  const cached = referenceCache.get(key);
  if (!cached || cached.expiresAt <= Date.now()) {
    referenceCache.delete(key);
    return null;
  }
  return cached.value;
}

function referenceCacheWrite(key, value) {
  referenceCache.set(key, {
    value,
    expiresAt: Date.now() + referenceCacheSeconds() * 1000
  });
  if (referenceCache.size > 250) {
    const firstKey = referenceCache.keys().next().value;
    if (firstKey) referenceCache.delete(firstKey);
  }
  return value;
}

async function cachedReferenceLookup(key, loader) {
  const cached = referenceCacheRead(key);
  if (cached) return cached;
  return referenceCacheWrite(key, await loader());
}

async function fetchJson(url, options = {}) {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), options.timeoutMs || ARTIST_LOOKUP_TIMEOUT_MS);
  try {
    const response = await fetch(url, {
      method: "GET",
      headers: options.headers || {},
      signal: controller.signal
    });
    if (!response.ok) return { ok: false, status: response.status, payload: null };
    return { ok: true, status: response.status, payload: await response.json() };
  } catch (error) {
    return { ok: false, status: 0, payload: null, error: error.message };
  } finally {
    clearTimeout(timeout);
  }
}

function discogsHeaders() {
  const token = envFirst(DISCOGS_TOKEN_ENVS);
  const headers = {
    "User-Agent": referenceUserAgent("discogs"),
    Accept: "application/json"
  };
  if (token) headers.Authorization = `Discogs token=${token}`;
  return headers;
}

function discogsArtistWebUrl(profile = {}, fallbackId = "") {
  const uri = trimText(profile.uri, 240);
  if (/^https?:\/\//i.test(uri)) return uri;
  if (uri) return `https://www.discogs.com${uri}`;
  return fallbackId ? `https://www.discogs.com/artist/${encodeURIComponent(fallbackId)}` : "";
}

async function fetchDiscogsArtist(artistName = "") {
  const artist = trimText(artistName, 140);
  if (!artist) return null;
  const searchSource = {
    name: "Discogs",
    url: `https://www.discogs.com/search/?q=${encodeURIComponent(artist)}&type=artist`
  };
  const enabled = envFlag("SONIC_DISCOGS_ENABLED", true);
  const token = envFirst(DISCOGS_TOKEN_ENVS);
  if (!enabled) {
    return {
      configured: Boolean(token),
      enabled: false,
      source: { ...searchSource, note: "opt-in desativado", used: false }
    };
  }
  if (!token) {
    return {
      configured: false,
      enabled: true,
      source: { ...searchSource, note: "token ausente", used: false }
    };
  }

  return cachedReferenceLookup(`discogs:${normalizeText(artist)}:token`, async () => {
    const searchUrl = `https://api.discogs.com/database/search?type=artist&q=${encodeURIComponent(artist)}&per_page=5&page=1`;
    const search = await fetchJson(searchUrl, { headers: discogsHeaders() });
    const rows = Array.isArray(search.payload?.results) ? search.payload.results : [];
    const best = rows.find((row) => artistNameMatches(row?.title || "", artist)) || rows[0];
    if (!best?.id) {
      return {
        configured: true,
        enabled: true,
        source: { ...searchSource, note: "sem match exato" }
      };
    }

    const detail = await fetchJson(`https://api.discogs.com/artists/${encodeURIComponent(best.id)}`, {
      headers: discogsHeaders()
    });
    const profile = detail.payload || {};
    const aliases = Array.isArray(profile.aliases)
      ? profile.aliases.map((alias) => trimText(alias?.name, 80)).filter(Boolean).slice(0, 8)
      : [];
    const groups = Array.isArray(profile.groups)
      ? profile.groups.map((group) => trimText(group?.name, 80)).filter(Boolean).slice(0, 6)
      : [];
    const members = Array.isArray(profile.members)
      ? profile.members.map((member) => trimText(member?.name, 80)).filter(Boolean).slice(0, 6)
      : [];
    const urls = Array.isArray(profile.urls)
      ? profile.urls.map((url) => trimText(url, 220)).filter(Boolean).slice(0, 8)
      : [];

    return {
      configured: true,
      enabled: true,
      id: String(profile.id || best.id),
      name: trimText(profile.name || best.title || artist, 140),
      realName: trimText(profile.realname, 160),
      profile: trimText(profile.profile, 1200),
      aliases,
      groups,
      members,
      urls,
      source: {
        name: "Discogs",
        url: discogsArtistWebUrl(profile, best.id),
        note: profile.profile ? "perfil, aliases e discografia" : "match de artista"
      }
    };
  });
}

async function fetchMusicBrainzArtist(artistName = "") {
  const artist = trimText(artistName, 140);
  if (!artist) return null;
  const searchSource = {
    name: "MusicBrainz",
    url: `https://musicbrainz.org/search?query=${encodeURIComponent(artist)}&type=artist`
  };
  if (!envFlag("SONIC_MUSICBRAINZ_ENABLED", true)) {
    return {
      configured: true,
      enabled: false,
      source: { ...searchSource, note: "desativado por configuracao", used: false }
    };
  }

  return cachedReferenceLookup(`musicbrainz:${normalizeText(artist)}`, async () => {
    const query = `artist:"${artist.replace(/"/g, "")}"`;
    const url = `https://musicbrainz.org/ws/2/artist/?query=${encodeURIComponent(query)}&fmt=json&limit=5`;
    const result = await fetchJson(url, {
      headers: {
        "User-Agent": referenceUserAgent("musicbrainz"),
        Accept: "application/json"
      }
    });
    const rows = Array.isArray(result.payload?.artists) ? result.payload.artists : [];
    const best = rows.find((row) => artistNameMatches(row?.name || "", artist)) || rows[0];
    if (!best?.id) {
      return {
        configured: true,
        enabled: true,
        source: { ...searchSource, note: "sem match exato" }
      };
    }
    const tags = Array.isArray(best.tags)
      ? best.tags
          .sort((a, b) => (Number(b.count) || 0) - (Number(a.count) || 0))
          .map((tag) => trimText(tag?.name, 60))
          .filter(Boolean)
          .slice(0, 10)
      : [];
    return {
      configured: true,
      enabled: true,
      id: trimText(best.id, 80),
      name: trimText(best.name, 140),
      sortName: trimText(best["sort-name"], 160),
      country: trimText(best.country, 24),
      area: trimText(best.area?.name, 120),
      beginArea: trimText(best["begin-area"]?.name, 120),
      type: trimText(best.type, 60),
      disambiguation: trimText(best.disambiguation, 180),
      tags,
      score: Number(best.score) || 0,
      source: {
        name: "MusicBrainz",
        url: `https://musicbrainz.org/artist/${best.id}`,
        note: "identidade, pais/area e tags"
      }
    };
  });
}

function buildVerificationContext(track, discogs, musicBrainz) {
  const referenceStatus = {
    discogs: {
      configured: discogs?.configured !== false,
      enabled: discogs?.enabled !== false,
      source: discogs?.source || null
    },
    musicBrainz: {
      configured: musicBrainz?.configured !== false,
      enabled: musicBrainz?.enabled !== false,
      source: musicBrainz?.source || null
    }
  };
  const trackSources = (Array.isArray(track.sources) ? track.sources : []).filter((source) => {
    const name = normalizeText(source?.name || "").replace(/\s+/g, "");
    if (name === "discogs") return referenceStatus.discogs.configured && referenceStatus.discogs.enabled;
    if (name === "musicbrainz") return referenceStatus.musicBrainz.configured && referenceStatus.musicBrainz.enabled;
    return true;
  });
  const sources = uniqueSources([
    discogs?.source,
    musicBrainz?.source,
    ...trackSources
  ]);
  return {
    discogs: discogs?.configured === false || discogs?.enabled === false ? referenceStatus.discogs : {
      ...referenceStatus.discogs,
      name: discogs?.name || "",
      realName: discogs?.realName || "",
      profile: discogs?.profile || "",
      aliases: discogs?.aliases || [],
      groups: discogs?.groups || [],
      members: discogs?.members || [],
      urls: discogs?.urls || []
    },
    musicBrainz: {
      ...referenceStatus.musicBrainz,
      name: musicBrainz?.name || "",
      country: musicBrainz?.country || "",
      area: musicBrainz?.area || "",
      beginArea: musicBrainz?.beginArea || "",
      type: musicBrainz?.type || "",
      disambiguation: musicBrainz?.disambiguation || "",
      tags: musicBrainz?.tags || []
    },
    sources
  };
}

function sourceSummaryFor(sources = [], discogs) {
  const names = sources.map((source) => source.name).filter(Boolean);
  if (discogs?.enabled === false) {
    return names.length
      ? `Leitura cruzada com ${names.slice(0, 3).join(", ")} e sinais do catálogo. Discogs ficou em opt-in e nao foi chamado.`
      : "Leitura cruzada com sinais do catálogo. Discogs ficou em opt-in e nao foi chamado.";
  }
  if (discogs?.configured === false) {
    return names.length
      ? `Leitura cruzada com ${names.slice(0, 3).join(", ")} e sinais do catálogo. Discogs ainda precisa de token para enriquecer direto.`
      : "Leitura cruzada com sinais do catálogo. Discogs ainda precisa de token para enriquecer direto.";
  }
  return names.length
    ? `Leitura cruzada com ${names.slice(0, 3).join(", ")} e sinais do catálogo.`
    : "Leitura cruzada com sinais do catálogo.";
}

function sourceDetailsFor(sources = [], { discogs, musicBrainz } = {}) {
  const statusByName = {
    discogs: discogs ? {
      configured: discogs.configured !== false,
      enabled: discogs.enabled !== false,
      optIn: true
    } : null,
    musicbrainz: musicBrainz ? {
      configured: musicBrainz.configured !== false,
      enabled: musicBrainz.enabled !== false,
      optIn: false
    } : null
  };
  return uniqueSources(sources).map((source) => {
    const key = normalizeText(source.name).replace(/\s+/g, "");
    const status = statusByName[key] || {};
    return {
      ...source,
      backendOnly: true,
      configured: status.configured !== false,
      enabled: status.enabled !== false,
      optIn: Boolean(status.optIn)
    };
  });
}

module.exports = async function handler(req, res) {
  if (!requireOpenAiPost(req, res, {
    feature: "artist-bio",
    enabledEnv: "SONIC_AI_TEXT_ENABLED",
    defaultEnabled: true,
    dailyLimitEnv: "SONIC_AI_BIO_DAILY_LIMIT",
    defaultDailyLimit: 18,
    budgetOnStart: false
  })) return;

  if (!envFlag("SONIC_ARTIST_BIO_ENABLED", true)) {
    sendJson(res, 403, { error: "artist_bio_disabled", feature: "artist-bio" });
    return;
  }

  if (!enforceOpenAiDailyBudget(req, res, {
    feature: "artist-bio",
    dailyLimitEnv: "SONIC_AI_BIO_DAILY_LIMIT",
    defaultDailyLimit: 18
  })) return;

  const body = parseBody(req);
  const track = body.track || {};
  const language = trimText(body.language || "pt", 8) || "pt";
  const artist = trimText(track.artist, 140);
  const knownSources = Array.isArray(body.sources) ? body.sources.slice(0, 8) : [];

  const [discogs, musicBrainz] = await Promise.all([
    fetchDiscogsArtist(artist),
    fetchMusicBrainzArtist(artist)
  ]);
  const verification = buildVerificationContext({ ...track, sources: knownSources }, discogs, musicBrainz);

  const system = [
    "You are Sonic Search's artist bio assistant for an electronic music discovery app.",
    "Write in the requested language.",
    "Return plain text only, with no markdown and no JSON.",
    "Use the provided verification sources only as verification/enrichment signals, not as the only truth.",
    "Use only provided metadata and verified source snippets. Never invent a country, real name, alias, label, membership, or scene detail.",
    "If sources disagree or are weak, clearly frame the text as a sound/catalog reading instead of a verified biography.",
    "Do not force the artist into the requested subgenre. If needed, say the track fits the user's sonic path even if the artist catalog is broader.",
    "Prioritize factual identity from enabled source snippets, then sound behavior from the local catalog and track metadata.",
    "Keep the bio between 90 and 130 words in one compact paragraph."
  ].join(" ");

  const user = JSON.stringify({
    language,
    track: {
      artist,
      song: trimText(track.song, 120),
      style: trimText(track.style, 80),
      styleLabel: trimText(track.styleLabel, 120),
      label: trimText(track.label, 120),
      bpm: trimText(track.bpm, 80),
      energy: trimText(track.energy, 60),
      origin: trimText(track.origin, 120),
      genre: trimText(track.genre, 120),
      currentBio: trimText(track.currentBio, 900),
      profileHint: trimText(track.profileHint, 500),
      styleSummary: trimText(track.styleSummary, 700),
      recommendationContext: trimText(track.recommendationContext, 300)
    },
    verification,
    sources: verification.sources
  });

  try {
    const result = await callOpenAiText({
      system,
      user,
      maxOutputTokens: 1400
    });
    if (!result.ok) {
      sendJson(res, result.status || 500, result.payload);
      return;
    }

    const sourceNames = verification.sources.map((source) => source.name).filter(Boolean);
    const sourceDetails = sourceDetailsFor(verification.sources, { discogs, musicBrainz });
    const confidence = discogs?.profile || musicBrainz?.id
      ? "high"
      : track.currentBio || track.origin || track.genre
        ? "medium"
        : "low";

    sendJson(res, 200, {
      bio: trimText(result.payload.text, 900),
      sourceSummary: sourceSummaryFor(verification.sources, discogs),
      sources: verification.sources,
      sourceDetails,
      attribution: {
        label: "Fontes verificadas no backend",
        sources: sourceDetails
      },
      verification,
      confidence,
      origin: trimText(track.origin || musicBrainz?.area || musicBrainz?.beginArea || musicBrainz?.country, 120),
      genre: trimText(track.genre || musicBrainz?.tags?.slice(0, 3).join(", ") || track.styleLabel || track.style, 120),
      source: sourceNames.length ? "verified-openai" : "openai"
    });
  } catch (error) {
    sendJson(res, 500, { error: "artist_bio_failed", detail: error.message });
  }
};
