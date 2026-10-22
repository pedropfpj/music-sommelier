import assert from "node:assert/strict";
import fs from "node:fs/promises";
import { createRequire } from "node:module";
const require = createRequire(import.meta.url);
const weekly = require("../weekly-recommends.js");
const data = JSON.parse(await fs.readFile(new URL("../data/weekly-catalog-v1.json", import.meta.url)));

assert.equal(weekly.weekIndex(new Date("2026-09-23T02:59:59Z")), 0, "Brazil Tuesday must retain the current edition");
assert.equal(weekly.weekIndex(new Date("2026-09-23T03:00:00Z")), 1, "Rotate at Wednesday midnight in São Paulo");
assert.equal(weekly.weekIndex(new Date("2026-09-29T23:00:00Z")), 1);
assert.equal(weekly.weekDate(15), "2026-12-30");
assert.equal(weekly.weekDate(16), "2027-01-06");
for (const invalid of ["2027-01-06", "2026-09-15", "2026-09-17", "garbage", "2026-02-31"]) assert.equal(weekly.parseEdition(invalid, 2), 2);
assert.equal(weekly.parseEdition("2026-09-16", 2), 0);
for (const invalid of ["javascript:alert(1)", "https://bandcamp.com.evil.test/track/x", "http://a.bandcamp.com/track/x", "https://user:pass@a.bandcamp.com/track/x", "https://youtube.com/results?search_query=x"]) assert.equal(weekly.safeLink(invalid), "");
for (const t of weekly.special) assert.ok(weekly.safeLink(t.url));
assert.equal(weekly.special.length, 6);

const html = await fs.readFile(new URL("../index.html", import.meta.url), "utf8");
const select = html.match(/<select id="style"[\s\S]*?<\/select>/)[0];
const ids = [...select.matchAll(/<option value="([^"]+)">/g)].map(m => m[1]);
assert.deepEqual(data.styles.map(s => s.id), ids, "Every active app style is represented");
for (const filter of ["all", ...ids]) {
  let changed = false, prior = [];
  for (let week = 0; week < 12; week++) {
    const picked = weekly.selection(data, week, filter);
    assert.ok(picked.length > 0 && picked.length <= 6, `${filter}: needs a usable selection`);
    if (filter !== "all") assert.ok(picked.every(t => t.style === filter), "Never borrow from another genre to fill the list");
    assert.equal(new Set(picked.map(t => t.url || `${t.artist.toLowerCase()}|${t.title.toLowerCase()}`)).size, picked.length);
    assert.deepEqual(weekly.selection({ ...data, tracks: [...data.tracks].reverse() }, week, filter), picked, "Selections cannot depend on file ordering");
    const keys = picked.map(t => t.id);
    if (week && JSON.stringify(keys) !== JSON.stringify(prior)) changed = true;
    prior = keys;
  }
  assert.ok(changed, `${filter} should rotate over time`);
}
const general = weekly.selection(data, 0);
assert.equal(new Set(general.map(t => data.styles.find(s => s.id === t.style).group)).size, 6);
assert.deepEqual(weekly.selection(data, 0, "missing"), []);
assert.deepEqual(weekly.selection({ ...data, tracks: [] }, 0), []);
assert.deepEqual(weekly.selection({ ...data, tracks: [{ id: "future", style: "techno", title: "Future", artist: "Future", releaseDate: "2027-01-01" }] }, 0, "techno"), []);
console.log(`Weekly recommendations passed: ${ids.length} styles, 12 editions, deterministic rotation, Brazil timezone, archive dates, direct-link safety and genre isolation.`);
