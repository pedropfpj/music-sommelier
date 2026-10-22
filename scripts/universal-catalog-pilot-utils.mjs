import { createRequire } from "node:module";
import { createHash } from "node:crypto";

const require = createRequire(import.meta.url);
const universal = require("../universal-music.js");
export const TIERS = Object.freeze(["reference", "deep_cut", "discovery"]);
export const APPLE_API_DOCUMENTATION = "https://performance-partners.apple.com/search-api";

export function textKey(value = "") {
  return String(value).normalize("NFKD").replace(/[\u0300-\u036f]/g, "")
    .toLowerCase().replace(/[’‘]/g, "'").replace(/&/g, " and ")
    .replace(/[^a-z0-9]+/g, " ").trim().replace(/\s+/g, " ");
}

export function titleKey(value = "") {
  return textKey(String(value).replace(/\s*\((?:feat\.?|featuring)\s[^)]*\)/gi, "")
    .replace(/\s*\[(?:feat\.?|featuring)\s[^\]]*\]/gi, ""));
}

export function stableUuid(value) {
  const hash = createHash("sha256").update(String(value)).digest("hex");
  // Application-defined, deterministic UUIDv8 (not a namespace/SHA-1 UUIDv5).
  return `${hash.slice(0, 8)}-${hash.slice(8, 12)}-8${hash.slice(13, 16)}-a${hash.slice(17, 20)}-${hash.slice(20, 32)}`;
}

export function validateSeeds(manifest) {
  if (!manifest?.batch || !Array.isArray(manifest.artists) || !manifest.artists.length) throw new Error("Empty pilot manifest");
  const seen = new Set();
  for (const seed of manifest.artists) {
    const key = textKey(seed.artist);
    if (!key || seen.has(key)) throw new Error(`Empty or duplicate artist: ${seed.artist}`);
    seen.add(key);
    const taxonomy = universal.universes.find(item => item.slug === seed.universe);
    if (!taxonomy || !taxonomy.genres.includes(seed.genre)) throw new Error(`Invalid genre/universe: ${seed.artist}`);
    if (!TIERS.includes(seed.tier)) throw new Error(`Invalid editorial tier: ${seed.artist}`);
    if (seed.providerArtistId && (!Number.isSafeInteger(Number(seed.providerArtistId)) || Number(seed.providerArtistId) <= 0)) throw new Error(`Invalid provider artist ID: ${seed.artist}`);
    if (seed.providerLookup && !seed.providerArtistId) throw new Error(`Unanchored provider lookup: ${seed.artist}`);
    for (const channel of seed.youtubeChannels || []) {
      if (!channel.name || !/^https:\/\/www\.youtube\.com\/(?:@[\w.-]+|channel\/UC[\w-]+)$/.test(channel.url)
        || !/^https:\/\//.test(channel.sourceUrl)) throw new Error(`Invalid editorial channel: ${seed.artist}`);
    }
    for (const collaboration of seed.collaborations || []) {
      if (!seed.providerArtistId || !collaboration.name || !Array.isArray(collaboration.credits) || !collaboration.credits.length) throw new Error(`Unanchored collaboration: ${seed.artist}`);
    }
    if (!Array.isArray(seed.songs) || !seed.songs.length || seed.songs.some(song => !titleKey(song))) throw new Error(`Missing songs: ${seed.artist}`);
    if (seed.work && (!seed.work.title || !seed.work.composer)) throw new Error(`Incomplete classical work: ${seed.artist}`);
  }
  return manifest.artists;
}

export function searchUrl(seed, country = "BR") {
  if (seed.providerLookup && !seed.searchTerm) {
    const lookup = new URL("https://itunes.apple.com/lookup");
    lookup.search = new URLSearchParams({ id: String(seed.providerArtistId), entity: "song", country, limit: "50" });
    return lookup.href;
  }
  const url = new URL("https://itunes.apple.com/search");
  url.search = new URLSearchParams({ term: seed.searchTerm || seed.artist, media: "music", entity: "song",
    ...(seed.searchTerm ? {} : { attribute: "artistTerm" }), country, limit: "50", explicit: "Yes" });
  return url.href;
}

export function safeAppleTrackUrl(value, trackId) {
  try {
    const url = new URL(value);
    if (url.protocol !== "https:" || url.username || url.password || url.port) return "";
    if (!["music.apple.com", "itunes.apple.com"].includes(url.hostname)) return "";
    const linkedId = url.searchParams.get("i") || (url.hostname === "itunes.apple.com" ? url.searchParams.get("id") : "")
      || url.pathname.match(/\/(?:id)?(\d+)\/?$/)?.[1];
    return linkedId === String(trackId) ? url.href : "";
  } catch { return ""; }
}

// Explicit allowlist: neither promotional preview URLs nor artwork are saved.
export function sanitizeProviderTrack(row = {}) {
  return Object.fromEntries(["wrapperType", "kind", "trackId", "artistId", "artistName", "trackName",
    "collectionName", "trackViewUrl", "artistViewUrl", "releaseDate", "trackTimeMillis",
    "trackExplicitness", "primaryGenreName", "country"].filter(key => row[key] !== undefined).map(key => [key, row[key]]));
}

export function resolveSeed(seed, rows = [], { country = "BR", retrievedAt, sourceUrl, batch } = {}) {
  const names = new Set([seed.artist, ...(seed.aliases || [])].map(textKey));
  const collaborations = new Map((seed.collaborations || []).map(item => [textKey(item.name), item]));
  collaborations.forEach((_, key) => names.add(key));
  const exactArtistRows = rows.filter(row => names.has(textKey(row.artistName)) && row.kind === "song"
    && Number.isSafeInteger(row.trackId) && row.trackId > 0 && Number.isSafeInteger(row.artistId) && row.artistId > 0
    && (!seed.providerArtistId || Number(seed.providerArtistId) === row.artistId));
  const matchingRows = exactArtistRows.filter(row => seed.songs.some(song => titleKey(song) === titleKey(row.trackName)));
  const artistIds = new Set(matchingRows.map(row => row.artistId));
  if (artistIds.size > 1) return { tracks: [], issues: [{ artist: seed.artist, universe: seed.universe, reason: "ambiguous_provider_artist", artistIds: [...artistIds] }] };
  const tracks = [];
  const issues = [];
  for (const target of seed.songs) {
    const matches = matchingRows.filter(row => titleKey(row.trackName) === titleKey(target));
    const row = matches.find(item => safeAppleTrackUrl(item.trackViewUrl, item.trackId)
      && !/\b(karaoke|tribute|made famous|in the style of)\b/i.test(item.collectionName || ""));
    if (!row) { issues.push({ artist: seed.artist, song: target, universe: seed.universe, reason: "no_exact_provider_match" }); continue; }
    const trackId = String(row.trackId);
    const providerUrl = safeAppleTrackUrl(row.trackViewUrl, trackId);
    const work = seed.work ? { ...seed.work, identityKey: `pilot_work:${textKey(seed.work.composer)}:${textKey(seed.work.catalogNumber || seed.work.title)}` } : null;
    const composer = work?.composer || seed.composer || "";
    const collaboration = collaborations.get(textKey(row.artistName));
    const artist = collaboration ? seed.artist : row.artistName;
    tracks.push({
      key: `apple_music:${trackId}`, artistKey: universal.normalizeKey(seed.artist),
      artist, song: row.trackName, universe: seed.universe, genre: seed.genre,
      discoveryTier: seed.tier, status: "needs_review", verificationState: "provider_matched",
      playable: false, confidence: 0.7, releaseTitle: row.collectionName || "",
      releaseDate: /^\d{4}-\d{2}-\d{2}T/.test(row.releaseDate || "") ? row.releaseDate.slice(0, 10) : null,
      durationSec: Number.isFinite(row.trackTimeMillis) ? Math.round(row.trackTimeMillis / 1000) : null,
      explicit: row.trackExplicitness === "explicit", work,
      credits: [{ artist, role: "primary" }, ...(seed.universe === "classical" ? [{ artist, role: "performer" }] : []),
        ...(composer ? [{ artist: composer, role: "composer" }] : []), ...(collaboration?.credits || [])],
      providerLinks: [{ provider: "apple_music", externalId: trackId, artistExternalId: String(row.artistId),
        url: providerUrl, linkType: "external", capabilities: ["open_provider"], territories: [country],
        rightsNote: "External provider link only. No audio or artwork copied. Commercial presentation and territorial availability require review." }],
      source: { provider: "itunes_search_api", url: sourceUrl, retrievedAt, documentation: APPLE_API_DOCUMENTATION },
      metadata: { batch, discovery_tier: seed.tier, editorial_artist: seed.artist, provider_artist_credit: row.artistName, provider_genre: row.primaryGenreName || "",
        genre_assertion_status: "candidate", quality_gate: "pending_curatorial_and_rights_review", knowledge_tier_is_editorial: true,
        ...(seed.editorialSourceUrl ? { editorial_source_url: seed.editorialSourceUrl } : {}) }
    });
  }
  return { tracks, issues };
}

// Additional repertoire is anchored to an artist ID established by an exact
// editorial target. It is not auto-approved genre, popularity or audio evidence.
// Classical targets keep explicit work/composer credits; never reuse one work
// or composer for an automatically selected different composition.
export function expandArtistRepertoire(seed, rows, resolved, options, depth = 6) {
  if (seed.universe === "classical") return resolved;
  const names = new Set([seed.artist, ...(seed.aliases || [])].map(textKey));
  // Matching a name alone can select a homonym (for example the Brazilian
  // rapper and a Japanese band named Orochi). Require an exact title anchor.
  if (!resolved.tracks.length) return resolved;
  const anchoredIds = new Set(resolved.tracks.map(t => t.providerLinks[0].artistExternalId));
  if (anchoredIds.size !== 1) return resolved;
  const artistId = [...anchoredIds][0];
  const titleKeys = new Set(resolved.tracks.map(t => titleKey(t.song)));
  const targetDepth = Math.max(resolved.tracks.length, Math.min(12, Number(depth) || 6));
  for (const row of rows) {
    if (resolved.tracks.length >= targetDepth) break;
    if (String(row.artistId) !== artistId || !names.has(textKey(row.artistName)) || row.kind !== "song"
      || !row.trackName || titleKeys.has(titleKey(row.trackName))
      || /\b(karaoke|tribute|made famous|in the style of)\b/i.test(`${row.collectionName || ""} ${row.trackName}`)) continue;
    const extra = resolveSeed({ ...seed, providerArtistId: artistId, songs: [row.trackName] }, [row], options);
    if (!extra.tracks.length) continue;
    const track = extra.tracks[0];
    track.metadata.selection_method = "provider_repertoire_after_exact_artist_anchor";
    // Artist-level editorial tier is only a candidate hint, not a promise that
    // this additional song is known, obscure or in precisely the same genre.
    track.metadata.recording_tier_requires_review = true;
    resolved.tracks.push(track); titleKeys.add(titleKey(track.song));
  }
  return resolved;
}

export function pilotCoverage(seeds, tracks, issues) {
  return universal.universes.filter(item => item.slug !== "electronic").map(item => {
    const selected = seeds.filter(seed => seed.universe === item.slug);
    const matched = tracks.filter(track => track.universe === item.slug);
    const genres = new Set(matched.map(track => track.genre));
    return { universe: item.slug, label: item.labels.pt, plannedArtists: selected.length,
      matchedArtists: new Set(matched.map(track => track.artistKey)).size, matchedTracks: matched.length,
      genres: [...genres], uncoveredGenres: item.genres.filter(genre => !genres.has(genre)),
      tiers: Object.fromEntries(TIERS.map(tier => [tier, matched.filter(track => track.discoveryTier === tier).length])),
      issues: issues.filter(issue => issue.universe === item.slug).length, releaseReady: false };
  });
}
