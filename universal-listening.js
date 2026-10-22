(function install(globalScope, factory) {
  "use strict";
  const api = factory();
  if (typeof module !== "undefined" && module.exports) module.exports = api;
  if (globalScope) globalScope.SonicUniversalListening = api;
})(typeof globalThis !== "undefined" ? globalThis : this, function factory() {
  "use strict";
  const MAX_AGE_MS = 30 * 24 * 60 * 60 * 1000;
  const groups = Object.freeze([
    { slug: "rock", label: "Rock e metal", genres: ["rock", "alternative_rock", "punk", "metal", "progressive_metal", "hardcore_punk"] },
    { slug: "indie", label: "Indie e post-punk", genres: ["indie_rock", "post_punk"] },
    { slug: "rap", label: "Hip-hop e rap", genres: ["hip_hop", "rap", "boom_bap", "experimental_hip_hop", "grime", "drill"] },
    { slug: "trap", label: "Trap", genres: ["trap_rap", "trap_brasileiro"] },
    { slug: "reggae", label: "Reggae, dub e ska", genres: ["reggae", "roots_reggae", "dub", "ska", "rocksteady", "dancehall"] },
    { slug: "reggaeton", label: "Reggaeton", genres: ["reggaeton"] },
    { slug: "forro", label: "Forró", genres: ["forro"] },
    { slug: "samba", label: "Samba", genres: ["samba"] },
    { slug: "classical", label: "Música clássica", universe: "classical" },
    { slug: "pop", label: "Pop", universe: "pop" },
    { slug: "soul", label: "R&B, soul e funk", universe: "rnb_soul_funk" },
    { slug: "jazz", label: "Jazz e blues", universe: "jazz_blues" },
    { slug: "brazilian", label: "Música brasileira", universe: "brazilian" },
    { slug: "latin", label: "Latina e caribenha", universe: "latin_caribbean" },
    { slug: "global", label: "Africana e global", universe: "african_global" },
    { slug: "folk", label: "Folk, country e tradições", universe: "folk_country_traditional" },
    { slug: "ambient", label: "Ambient e trilhas", universe: "ambient_experimental_soundtracks" }
  ]);
  function videoId(value) {
    try {
      const u = new URL(value);
      if (u.protocol !== "https:" || u.hostname !== "www.youtube.com" || u.username || u.password || u.port || u.pathname !== "/watch") return "";
      const id = u.searchParams.get("v");
      return /^[a-zA-Z0-9_-]{11}$/.test(id || "") ? id : "";
    } catch { return ""; }
  }
  function channelUrl(value) {
    try {
      const u = new URL(value);
      if (u.protocol !== "https:" || u.hostname !== "www.youtube.com" || u.username || u.password || u.port) return "";
      return /^\/(channel\/UC[a-zA-Z0-9_-]{22}|@[^/?#]+)\/?$/.test(u.pathname) ? u.href : "";
    } catch { return ""; }
  }
  function fresh(value, now = Date.now()) {
    const timestamp = Date.parse(value);
    return Number.isFinite(timestamp) && timestamp <= now + 5 * 60 * 1000 && now - timestamp < MAX_AGE_MS;
  }
  function groupForTrack(track = {}) {
    if (!track || typeof track !== "object" || Array.isArray(track)) return "";
    return groups.find(g => g.universe ? track.universe === g.universe : g.genres.includes(track.genre))?.slug || "";
  }
  function previewEligible(track = {}, now = Date.now()) {
    if (!track || typeof track !== "object" || Array.isArray(track)) return false;
    const e = track.evidence || {};
    const link = Array.isArray(track.providerLinks) ? track.providerLinks.find(l => l?.provider === "youtube" && l.linkType === "embed") : null;
    return Boolean(track.key && track.artist && track.song && groupForTrack(track) === track.group && link
      && videoId(link.url) === e.videoId && link.externalId === e.videoId && track.key === `youtube:${e.videoId}`
      && videoId(e.url) === e.videoId && channelUrl(e.channelUrl) && e.channelName
      && link.capabilities?.includes("embed_playback") && e.identityMatch === true
      && e.officialChannelMatch === true && e.oembedChecked === true
      && (e.embeddableSearch === true && e.source === "sonic_youtube_data_api_and_youtube_oembed"
        || e.curatedSourceChecked === true && e.source === "curated_official_youtube_oembed" && /^https:\/\//.test(e.editorialSourceUrl || ""))
      && fresh(e.checkedAt, now));
  }
  function playbackResult(track = {}, now = Date.now()) {
    if (!track || typeof track !== "object" || Array.isArray(track)) return "unconfirmed";
    // Ranker normalizes the candidate key; provider/evidence identity remains intact.
    if (!previewEligible({ ...track, key: `youtube:${track.evidence?.videoId || ""}` }, now)) return "unconfirmed";
    const check = track.playbackCheck;
    if (!check || check.url !== track.evidence.url || !fresh(check.checkedAt, now)) return "unconfirmed";
    return ["played", "blocked"].includes(check.result) ? check.result : "unconfirmed";
  }
  function coverage(tracks = [], group, now = Date.now()) {
    const eligible = tracks.filter(t => t.group === group && previewEligible(t, now));
    const artists = new Set(eligible.map(t => t.artistKey || t.artist)).size;
    const tiers = new Set(eligible.map(t => t.discoveryTier));
    const played = eligible.filter(t => playbackResult(t, now) === "played");
    return { tracks: eligible.length, artists, testedPlayableTracks: played.length,
      testedPlayableRecordings: new Set(played.map(t => t.referenceKey || t.key)).size,
      testedPlayableArtists: new Set(played.map(t => t.artistKey || t.artist)).size,
      previewReady: eligible.length >= 3 && artists >= 3 && tiers.size >= 2 };
  }
  return { groups, videoId, channelUrl, fresh, groupForTrack, previewEligible, playbackResult, coverage };
});
