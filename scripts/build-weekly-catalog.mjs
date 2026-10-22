// Explicit snapshot: do not run during ordinary builds. Keeping v1 immutable
// keeps past weekly selections stable as the live discovery catalog changes.
import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const html = await fs.readFile(path.join(root, "index.html"), "utf8");
const select = html.match(/<select id="style"[\s\S]*?<\/select>/)[0];
const core = JSON.parse(await fs.readFile(path.join(root, "data/runtime-catalog-v1/core.json")));
const styles = [], tracks = [];
for (const group of select.matchAll(/<optgroup label="([^"]+)">([\s\S]*?)<\/optgroup>/g)) {
  for (const option of group[2].matchAll(/<option value="([^"]+)">([^<]+)<\/option>/g)) {
    const [_, id, label] = option;
    styles.push({ id, label, group: group[1] });
    const rows = await fs.readFile(path.join(root, `data/runtime-catalog-v1/styles/${id}.json`), "utf8").then(JSON.parse).catch(() => []);
    const seen = new Set(), counts = new Map();
    // Two rounds retain artist diversity without making sparse styles empty.
    for (const maxPerArtist of [1, 2, 4]) {
      for (const row of [...rows, ...core.filter(t => t.style === id)]) {
        const artist = String(row.artist || "").trim(), title = String(row.song || "").trim();
        const key = `${artist.toLowerCase()}|${title.toLowerCase()}`;
        if (!artist || !title || seen.has(key) || (counts.get(artist) || 0) >= maxPerArtist || row.confidence === "low") continue;
        if (tracks.filter(t => t.style === id).length >= 24) break;
        const direct = [row.bandcamp_track_url, row.youtube_track_url, row.spotify_track_url, row.source_url].find(url => {
          try { const u = new URL(url); return u.protocol === "https:" && ((u.hostname.endsWith(".bandcamp.com") && /^\/track\//.test(u.pathname)) || (["www.youtube.com", "youtube.com"].includes(u.hostname) && u.pathname === "/watch" && /^[\w-]{11}$/.test(u.searchParams.get("v") || "")) || (u.hostname === "open.spotify.com" && /^\/track\/[\w]+$/.test(u.pathname))); } catch { return false; }
        });
        const url = direct || (/^\d+$/.test(row.deezer_track_id || "") ? `https://www.deezer.com/track/${row.deezer_track_id}` : "");
        tracks.push({ id: `${id}:${key}`, style: id, artist, title, ...(url ? { url } : {}), ...( /^\d{4}-\d{2}-\d{2}$/.test(row.release_date || "") ? { releaseDate: row.release_date } : {}) });
        seen.add(key); counts.set(artist, (counts.get(artist) || 0) + 1);
      }
    }
  }
}
await fs.writeFile(path.join(root, "data/weekly-catalog-v1.json"), JSON.stringify({ version: 1, startsOn: "2026-09-16", styles, tracks }) + "\n");
console.log(JSON.stringify({ styles: styles.length, tracks: tracks.length, empty: styles.filter(s => !tracks.some(t => t.style === s.id)).map(s => s.id) }));
