const urls = process.argv.slice(2);

if (!urls.length) {
  console.error("Usage: node scripts/inspect-bandcamp-release.mjs <bandcamp-release-url> [...]");
  process.exit(1);
}

function secondsFromIso(iso = "") {
  const match = String(iso).match(/P(?:(\d+)D)?T?(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?/);
  if (!match) return "";
  const [, days = 0, hours = 0, minutes = 0, seconds = 0] = match.map((part) => Number(part || 0));
  return days * 86400 + hours * 3600 + minutes * 60 + seconds;
}

function bpmFromTitle(title = "") {
  const match = String(title).match(/(?:\(|\[|\s)(\d{2,3})(?:\)|\]|\s*BPM)?\s*$/i);
  return match ? Number(match[1]) : "";
}

function splitArtistTitle(title = "", byArtist = "") {
  if (byArtist) {
    return { artist: byArtist, title: title.replace(/\s*(?:\(|\[)\d{2,3}(?:\)|\])\s*$/i, "").trim() };
  }
  const parts = title.split(/\s+-\s+/);
  if (parts.length >= 2) {
    return {
      artist: parts.shift().trim(),
      title: parts.join(" - ").replace(/\s*(?:\(|\[)\d{2,3}(?:\)|\])\s*$/i, "").trim()
    };
  }
  return { artist: "", title: title.replace(/\s*(?:\(|\[)\d{2,3}(?:\)|\])\s*$/i, "").trim() };
}

for (const url of urls) {
  const html = await fetch(url).then((response) => response.text());
  const match = html.match(/<script type="application\/ld\+json">\s*([\s\S]*?)\s*<\/script>/);
  if (!match) {
    console.log(`\n## ${url}\nNo JSON-LD found.`);
    continue;
  }
  const data = JSON.parse(match[1]);
  const publisher = data.publisher?.name || "";
  const publisherUrl = data.publisher?.["@id"] || "";
  const publisherLinks = (data.publisher?.mainEntityOfPage || [])
    .map((entry) => entry.url)
    .filter(Boolean);
  const tracks = data.track?.itemListElement || [];
  console.log(`\n## ${data.name}`);
  console.log(`url: ${url}`);
  console.log(`publisher: ${publisher} | ${publisherUrl}`);
  console.log(`datePublished: ${data.datePublished || ""}`);
  console.log(`keywords: ${(data.keywords || []).join(";")}`);
  console.log(`links: ${publisherLinks.join(";")}`);
  for (const item of tracks) {
    const track = item.item;
    const id = (track.additionalProperty || []).find((property) => property.name === "track_id")?.value || "";
    const parsed = splitArtistTitle(track.name, track.byArtist?.name || "");
    console.log([
      item.position,
      parsed.artist,
      parsed.title,
      bpmFromTitle(track.name),
      secondsFromIso(track.duration),
      id,
      track.mainEntityOfPage || track["@id"] || ""
    ].join(" | "));
  }
}
