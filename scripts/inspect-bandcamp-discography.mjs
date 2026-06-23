const pages = process.argv.slice(2);

if (!pages.length) {
  console.error("Usage: node scripts/inspect-bandcamp-discography.mjs <bandcamp-music-url> [...]");
  process.exit(1);
}

function cleanHtml(value = "") {
  return value
    .replace(/<br><span class="artist-override">([\s\S]*?)<\/span>/g, " - $1")
    .replace(/<[^>]+>/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&#39;/g, "'")
    .replace(/&quot;/g, '"')
    .replace(/\s+/g, " ")
    .trim();
}

for (const page of pages) {
  const html = await fetch(page).then((response) => response.text());
  const matches = [
    ...html.matchAll(
      /<li[^>]+data-item-id="([^"]+)"[\s\S]*?<a href="([^"]+)"[\s\S]*?<p class="title">([\s\S]*?)<\/p>/g
    )
  ];
  const seen = new Set();
  console.log(`\n## ${page}`);
  for (const match of matches) {
    const kind = match[1].split("-")[0];
    const href = new URL(match[2], page).href;
    const title = cleanHtml(match[3]);
    if (seen.has(href)) continue;
    seen.add(href);
    console.log(`${kind} | ${title} | ${href}`);
  }
}
