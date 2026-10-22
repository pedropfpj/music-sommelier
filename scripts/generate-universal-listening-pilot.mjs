#!/usr/bin/env node
// Read-only provider research. Stores metadata, never audio, thumbnails or API keys.
import fs from "node:fs/promises";
import { createRequire } from "node:module";
import { textKey } from "./universal-catalog-pilot-utils.mjs";
const require = createRequire(import.meta.url);
const listening = require("../universal-listening.js");
const root = new URL("../", import.meta.url);
const pilot = JSON.parse(await fs.readFile(new URL("data/universal-catalog-pilot.json", root), "utf8"));
const seeds = JSON.parse(await fs.readFile(new URL("data/universal-catalog-seeds.json", root), "utf8")).artists;
const overrides = JSON.parse(await fs.readFile(new URL("data/universal-listening-source-overrides.json", root), "utf8")).sources;
let playbackChecks = [];
try { playbackChecks = JSON.parse(await fs.readFile(new URL("data/universal-listening-playback-checks.json", root), "utf8")).checks; }
catch (error) { if (error.code !== "ENOENT") throw error; }
const cachePath = new URL("reports/universal-listening-provider-snapshot.json", root);
const fetchEnabled = process.argv.includes("--fetch");
const refresh = process.argv.includes("--refresh");
const retryMissing = process.argv.includes("--retry-missing");
const requestArgument = process.argv.find(a => a.startsWith("--max-requests="))?.split("=")[1];
const maxRequests = Math.max(0, Math.min(30, requestArgument === undefined ? 30 : Number(requestArgument)));
if (!Number.isInteger(maxRequests)) throw new Error("Invalid request budget");
const requestedGroups = process.argv.find(a => a.startsWith("--groups="))?.split("=")[1]?.split(",") || [];
if (requestedGroups.some(slug => !listening.groups.some(g => g.slug === slug))) throw new Error("Unknown research group");
const requestedTiers = process.argv.find(a => a.startsWith("--tiers="))?.split("=")[1]?.split(",") || [];
if (requestedTiers.some(tier => !["reference", "deep_cut", "discovery"].includes(tier))) throw new Error("Unknown research tier");
const selectedTiers = requestedTiers.length ? requestedTiers : ["reference", "deep_cut", "discovery"];
const requestedArtists = process.argv.find(a => a.startsWith("--artists="))?.split("=")[1]?.split(",").map(textKey) || [];
if (requestedArtists.some(artist => !seeds.some(seed => textKey(seed.artist) === artist))) throw new Error("Unknown research artist");
const selectedArtist = artist => !requestedArtists.length || requestedArtists.includes(textKey(artist));
const selectedGroups = requestedGroups.length ? requestedGroups.map(slug => listening.groups.find(g => g.slug === slug)) : listening.groups;
let requests = 0;
let cache = {};
try { cache = JSON.parse(await fs.readFile(cachePath, "utf8")); } catch (error) { if (error.code !== "ENOENT") throw error; }
const groups = listening.groups;
const targets = [];
// First recording of each artist in every group, then a second round. This
// bounds API quota and avoids spending the entire batch on one musical family.
const artistsByGroup = new Map(selectedGroups.map(group => {
  const rows = pilot.artists.filter(a => selectedArtist(a.name) && a.trackKeys.some(k => pilot.tracks.some(t => t.key === k && listening.groupForTrack(t) === group.slug)));
  const tiers = selectedTiers.map(tier => rows.filter(a => a.editorialTier === tier));
  const balanced = [];
  for (let index = 0; index < Math.max(...tiers.map(t => t.length)); index += 1) for (const tier of tiers) if (tier[index]) balanced.push(tier[index]);
  return [group.slug, balanced];
}));
for (let round = 0; round < 2; round += 1) {
  for (let index = 0; index < Math.max(...[...artistsByGroup.values()].map(a => a.length)); index += 1) {
    for (const group of selectedGroups) {
      const artist = artistsByGroup.get(group.slug)[index]; if (!artist) continue;
      const rows = pilot.tracks.filter(t => artist.trackKeys.includes(t.key) && listening.groupForTrack(t) === group.slug);
      if (rows[round]) targets.push({ track: rows[round], group });
    }
  }
}
async function research(track) {
  const seed = seeds.find(s => textKey(s.artist) === textKey(track.metadata.editorial_artist));
  const artist = seed.artist;
  const url = new URL("https://sonicsearch.app/api/youtube-search");
  const song = track.song.replace(/\s*[([](?:feat\.?|featuring|with special guest)\s[^)\]]*[)\]]/gi, "").trim();
  url.search = new URLSearchParams({ artist, song, limit: "10" });
  const response = await fetch(url, { headers: { Origin: "https://sonicsearch.app" }, signal: AbortSignal.timeout(20000) });
  const payload = await response.json();
  if (!response.ok || !Array.isArray(payload.videos)) throw new Error(payload.error || `search_http_${response.status}`);
  // Artist/label sources: bobmarley.com/videos and deckdisc.com.br/discos/fundamental-forro.
  const extraChannels = artist === "Bob Marley & The Wailers" ? ["Bob Marley"] : artist === "Falamansa" ? ["BandaFalamansa", "Deck"] : [];
  const compactName = name => textKey(name).replace(/ /g, "");
  const acceptedNames = [artist, ...(seed.aliases || []), track.artist, ...extraChannels].map(compactName);
  const officialName = name => acceptedNames.some(a => [a, `${a}topic`, `${a}vevo`, `${a}official`].includes(compactName(name)))
    || (track.universe === "classical" && ["deutsche grammophon dg", "deutsche grammophon", "decca classics", "sony classical"].includes(textKey(name)));
  const matches = [];
  for (const video of payload.videos) {
    const editorialChannel = (seed.youtubeChannels || []).find(channel => textKey(channel.name) === textKey(video.channelTitle));
    if (!video.identityMatch || video.qualityScore < 10 || !listening.videoId(video.url) || (!officialName(video.channelTitle) && !editorialChannel)) continue;
    if (/\b(karaoke|tribute|reaction|cover|shorts)\b/i.test(video.title)) continue;
    const oembedUrl = new URL("https://www.youtube.com/oembed");
    oembedUrl.search = new URLSearchParams({ url: video.url, format: "json" });
    const detailResponse = await fetch(oembedUrl, { signal: AbortSignal.timeout(15000) });
    if (!detailResponse.ok) continue;
    const detail = await detailResponse.json();
    if (textKey(detail.author_name) !== textKey(video.channelTitle)
      || (editorialChannel ? detail.author_url !== editorialChannel.url : !officialName(detail.author_name))) continue;
    const channel = listening.channelUrl(detail.author_url);
    if (!channel || detail.provider_name !== "YouTube" || !detail.title || !detail.html?.includes(`/embed/${video.videoId}`)) continue;
    matches.push({ checkedAt: new Date().toISOString(), videoId: video.videoId, url: video.url,
      title: detail.title, channelName: detail.author_name, channelUrl: channel,
      identityMatch: true, officialChannelMatch: true, embeddableSearch: true, oembedChecked: true,
      ...(editorialChannel ? { editorialSourceUrl: editorialChannel.sourceUrl } : {}),
      source: "sonic_youtube_data_api_and_youtube_oembed" });
    if (matches.length >= 3) break;
  }
  if (matches.length) return { ...matches[0], alternatives: matches.slice(1) };
  return { checkedAt: new Date().toISOString(), issue: "no_official_embeddable_match" };
}
const tracks = [];
const issues = [];
// Reproduce all cached groups even when the bounded research batch targets only
// a subset. Previously tested sources must never disappear during expansion.
const allTargets = pilot.tracks.map(track => ({ track, group: groups.find(g => g.slug === listening.groupForTrack(track)) })).filter(t => t.group);
for (const { track, group } of [...targets, ...allTargets.filter(t => !targets.some(target => target.track.key === t.track.key))]) {
  let evidence = cache[track.key];
  if (fetchEnabled && selectedGroups.includes(group) && selectedTiers.includes(track.discoveryTier)
    && selectedArtist(track.metadata.editorial_artist)
    && (refresh || !evidence || (retryMissing && evidence.issue) || !listening.fresh(evidence.checkedAt))) {
    if (requests >= maxRequests) { issues.push({ artist: track.artist, song: track.song, reason: "batch_quota_cap" }); }
    else {
    requests += 1;
    try { evidence = await research(track); } catch (error) {
      evidence = { checkedAt: new Date().toISOString(), issue: error.message };
      // Do not retry or continue spending quota after an account-wide limit.
      if (/limit|quota|disabled|key|origin/i.test(error.message)) requests = maxRequests;
    }
    cache[track.key] = evidence;
    await fs.writeFile(cachePath, `${JSON.stringify(cache, null, 2)}\n`);
    }
  }
  if (!evidence || evidence.issue || !listening.fresh(evidence.checkedAt)) {
    issues.push({ artist: track.artist, song: track.song, reason: evidence?.issue || "research_required" }); continue;
  }
  for (const source of [evidence, ...(evidence.alternatives || [])]) {
  const candidate = { key: `youtube:${source.videoId}`, referenceKey: track.key,
    artist: track.metadata.editorial_artist, artistKey: track.artistKey, song: track.song,
    group: group.slug, universe: track.universe, genre: track.genre, discoveryTier: track.discoveryTier,
    explicit: track.explicit, work: track.work, credits: track.credits,
    status: "needs_review", publicReady: false,
    recordingVersion: "provider_video", providerTitle: source.title,
    // The YouTube video is not asserted to be the same master as Apple Music.
    evidence: source, providerLinks: [{ provider: "youtube", externalId: source.videoId, url: source.url,
      linkType: "embed", capabilities: ["embed_playback", "open_provider"] }] };
  if (listening.previewEligible(candidate)) tracks.push(candidate);
  }
}
const unique = [...new Map(tracks.map(track => [track.key, track])).values()];
for (const override of overrides) {
  const reference = pilot.tracks.find(t => textKey(t.metadata.editorial_artist) === textKey(override.artist) && textKey(t.song) === textKey(override.song));
  const id = listening.videoId(override.url);
  if (!reference || !id || !listening.channelUrl(override.channelUrl)) throw new Error("Invalid curated source override");
  const cacheKey = `override:${id}`;
  let evidence = cache[cacheKey];
  if (fetchEnabled && (refresh || !evidence || !listening.fresh(evidence.checkedAt))) {
    const url = new URL("https://www.youtube.com/oembed");
    url.search = new URLSearchParams({ url: override.url, format: "json" });
    const response = await fetch(url, { signal: AbortSignal.timeout(15000) });
    if (!response.ok) throw new Error(`Curated source unavailable: ${id}`);
    const detail = await response.json();
    if (detail.provider_name !== "YouTube" || detail.author_url !== override.channelUrl || !textKey(detail.title).includes(textKey(override.song)) || !detail.html?.includes(`/embed/${id}`)) throw new Error(`Curated source identity mismatch: ${id}`);
    evidence = { checkedAt: new Date().toISOString(), videoId: id, url: override.url, title: detail.title,
      channelName: detail.author_name, channelUrl: detail.author_url,
      identityMatch: true, officialChannelMatch: true, oembedChecked: true, curatedSourceChecked: true,
      editorialSourceUrl: override.sourceUrl, source: "curated_official_youtube_oembed" };
    cache[cacheKey] = evidence;
    await fs.writeFile(cachePath, `${JSON.stringify(cache, null, 2)}\n`);
  }
  if (!evidence) { issues.push({ artist: override.artist, song: override.song, reason: "curated_source_requires_fetch" }); continue; }
  const candidate = { ...reference, key: `youtube:${id}`, referenceKey: reference.key, artist: override.artist,
    song: override.displaySong, group: listening.groupForTrack(reference), recordingVersion: override.recordingVersion,
    publicReady: false, providerTitle: evidence.title, evidence,
    providerLinks: [{ provider: "youtube", externalId: id, url: override.url, linkType: "embed", capabilities: ["embed_playback", "open_provider"] }] };
  if (listening.previewEligible(candidate)) {
    const index = unique.findIndex(t => t.key === candidate.key);
    if (index < 0) unique.push(candidate); else unique[index] = candidate;
  }
}
for (const track of unique) track.playbackCheck = playbackChecks.find(c => c.url === track.evidence.url) || null;
if (!unique.length) throw new Error("No fresh verified embed candidates; existing preview files are preserved.");
const coverage = groups.map(group => ({ ...group, ...listening.coverage(unique, group.slug) }));
const dataset = { schemaVersion: 1, batch: "universal_listening_20260912_v1", publicReady: false,
  generatedAt: new Date().toISOString(), rightsMode: "visible_provider_player_only", tracks: unique, coverage, issues };
await fs.writeFile(new URL("data/universal-listening-pilot.json", root), `${JSON.stringify(dataset, null, 2)}\n`);
const escape = s => String(s).replace(/[\[\]\\*_`|]/g, "\\$&");
const played = unique.filter(t => listening.playbackResult(t) === "played");
const blocked = unique.filter(t => listening.playbackResult(t) === "blocked");
const statusLabel = t => listening.playbackResult(t) === "played" ? "reproduziu no navegador" : listening.playbackResult(t) === "blocked" ? "bloqueada no teste de incorporação; não recebe botão Ouvir" : "reprodução não confirmada";
const report = `# Piloto de escuta — reggae, reggaeton, forró, samba e clássica\n\n${unique.length} fontes oficiais/Topic com identidade e oEmbed conferidos. **${played.length} reproduziram no teste real de navegador; ${blocked.length} falharam e ficam sem botão Ouvir.** Busca/oEmbed não comprovam reprodução em todos os aparelhos/países, nem transferem licença da gravação. Nenhum arquivo de mídia foi copiado.\n\nTela de teste: \`listening-preview.html\`. Catálogo público e cobrança continuam desligados.\n\n| Estilo | Fontes | Artistas pesquisados | Vídeos que reproduziram | Artistas que reproduziram |\n| --- | ---: | ---: | ---: | ---: |\n${coverage.map(g => `| ${g.label} | ${g.tracks} | ${g.artists} | ${g.testedPlayableTracks} | ${g.testedPlayableArtists} |`).join("\n")}\n\n${groups.map(g => `## ${g.label}\n\n${unique.filter(t => t.group === g.slug).map(t => `- ${escape(t.artist)} — [${escape(t.song)}](<${t.evidence.url}>) · ${escape(t.evidence.channelName)} · ${statusLabel(t)}${t.credits?.find(c => c.role === "composer") ? ` · compositor: ${escape(t.credits.find(c => c.role === "composer").artist)}` : ""}`).join("\n")}`).join("\n\n")}\n\n## Pendências\n\n${issues.map(i => `- ${escape(i.artist)} — ${escape(i.song)}: ${i.reason}`).join("\n")}\n\nAinda falta ampliar as fontes aprovadas, testar Safari/iPhone e países de lançamento, revisar a curadoria e promover a integração local ao perfil sincronizado, Radar e Premium.\n`;
await fs.writeFile(new URL("reports/universal-listening-pilot.md", root), report.replace("# Piloto de escuta — reggae, reggaeton, forró, samba e clássica", "# Piloto de escuta — expansão multigênero"));
console.log(JSON.stringify({ tracks: unique.length, providerSearchRequests: requests, coverage }, null, 2));
