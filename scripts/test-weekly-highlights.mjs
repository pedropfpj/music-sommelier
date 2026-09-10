import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const [html, app, css, dailyDjsUi, iosBuild] = await Promise.all([
  readFile(path.join(root, "index.html"), "utf8"),
  readFile(path.join(root, "app.js"), "utf8"),
  readFile(path.join(root, "styles.css"), "utf8"),
  readFile(path.join(root, "daily-djs-ui.js"), "utf8"),
  readFile(path.join(root, "scripts/build-ios-web.mjs"), "utf8")
]);

assert.match(html, /id="weeklyHighlightsCard"[^>]+aria-labelledby="weeklyHighlightsTitle"/);
assert.match(html, /id="weeklyHighlightsToggleBtn"[^>]+aria-controls="weeklyHighlightsBody"/);
assert.match(html, /id="weeklyHighlightsBody"[^>]+class="weekly-highlights-body"/);
for (const id of [
  "weeklyHighlightsDiscovered",
  "weeklyHighlightsLiked",
  "weeklyHighlightsPassed",
  "weeklyHighlightsTracks",
  "weeklyHighlightsSpotlight",
  "weeklyHighlightsEmpty",
  "weeklyHighlightsLocked",
  "weeklyHighlightsShareBtn"
]) assert.match(html, new RegExp(`id="${id}"`));

assert.match(html, /id="premiumDialogClose"[\s\S]*?<svg[^>]+viewBox="0 0 24 24"/);
assert.match(html, /id="premiumDialogTitle" tabindex="-1"/);
assert.match(app, /function sanitizeDjRecommendationHistory\(/);
assert.match(app, /function weeklyHighlightsSnapshot\(/);
assert.match(app, /\(start\.getDay\(\) \+ 6\) % 7/);
assert.match(app, /recordDjRecommendationActivity\(currentDjRecommendation, "view"/);
assert.match(app, /recordDjRecommendationActivity\(seed, "like"/);
assert.match(app, /recordDjRecommendationActivity\(seed, "pass"/);
assert.match(app, /onFeedback: recordDailyDjFeedback/);
assert.match(dailyDjsUi, /options\.onFeedback\?\.\(item, current \|\| "undo", prior \|\| ""\)/);
assert.match(app, /weeklyDjActivity: sanitizeDjRecommendationHistory/);
assert.match(app, /select: "profile_key,preferences,progress,schema_version,client_updated_at,updated_at"/);
assert.match(app, /const premium = hasPremiumAccess\(\);[\s\S]*weeklyHighlightsCard\.dataset\.access = premium \? "premium" : "locked"/);
assert.match(app, /navigator\.share\(\{ title: copy\.kicker, text \}\)/);
assert.match(app, /premiumDialogTitle\?\.focus\(\{ preventScroll: true \}\)/);

assert.match(css, /\.premium-dialog-close\s*\{[\s\S]*?width: 44px;[\s\S]*?height: 44px;/);
assert.match(css, /\.premium-dialog-close:focus-visible\s*\{[\s\S]*?outline: 2px solid/);
assert.match(css, /\.weekly-highlights-card\s*\{/);
assert.match(css, /\.weekly-highlights-card\.is-collapsed\s*\{/);
assert.match(css, /@media \(max-width: 430px\)[\s\S]*?\.weekly-highlights-actions,[\s\S]*?width: 100%;/);
assert.match(app, /20260910premiumcollapse2/);
assert.match(iosBuild, /20260910premiumcollapse2ios1/);

console.log("Weekly Highlights and Premium modal checks passed.");
