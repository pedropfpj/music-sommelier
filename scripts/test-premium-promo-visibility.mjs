import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";

const [html, css, app, iosBuild] = await Promise.all([
  readFile(new URL("../index.html", import.meta.url), "utf8"),
  readFile(new URL("../styles.css", import.meta.url), "utf8"),
  readFile(new URL("../app.js", import.meta.url), "utf8"),
  readFile(new URL("./build-ios-web.mjs", import.meta.url), "utf8")
]);

for (const id of [
  "weeklyHighlightsToggleBtn",
  "weeklyHighlightsToggleLabel",
  "weeklyHighlightsBody",
  "premiumDismissBtn"
]) {
  assert.match(html, new RegExp(`id=["']${id}["']`), `missing #${id}`);
  assert.match(app, new RegExp(`getElementById\\(["']${id}["']\\)`), `missing DOM binding for #${id}`);
}

assert.match(html, /id="weeklyHighlightsToggleBtn"[^>]+aria-controls="weeklyHighlightsBody"[^>]+aria-expanded="true"/);
assert.match(html, /id="weeklyHighlightsBody"[^>]+class="weekly-highlights-body"/);
assert.doesNotMatch(html, /id="membershipHideBtn"/);
assert.doesNotMatch(html, /id="premiumPromoCollapsed"/);
assert.match(html, /id="premiumDismissBtn"[^>]+type="submit"[^>]+value="cancel"/);
assert.match(app, /PREMIUM_PROMO_VISIBILITY_STORAGE_KEY\s*=\s*"neonpulse:premiumPromoVisibility:v1"/);
assert.match(app, /PROFILE_DATA_STORAGE_KEYS\.filter\(\(key\) => key !== PREMIUM_PROMO_VISIBILITY_STORAGE_KEY\)/);
assert.match(app, /isEphemeralSession\(normalizedSession\)[\s\S]*?PREMIUM_PROMO_VISIBILITY_STORAGE_KEY}:device/);
assert.match(app, /function setPremiumPromoCollapsed\(collapsed\)[\s\S]*?if \(hasPremiumAccess\(\)\) return;/);
assert.match(app, /weeklyHighlightsCard\?\.classList\.toggle\("is-collapsed", collapsed\)/);
assert.match(app, /weeklyHighlightsBody\?\.classList\.toggle\("hidden", collapsed\)/);
assert.match(app, /weeklyHighlightsToggleBtn\?\.classList\.toggle\("hidden", premium\)/);
assert.match(app, /bind\(weeklyHighlightsToggleBtn, "click",[\s\S]*?setPremiumPromoCollapsed\(!readPremiumPromoCollapsed\(\)\)/);
assert.match(app, /sonicTinyCopy\("Agora não", "Not now", "Ahora no"\)/);
assert.match(css, /\.weekly-highlights-toggle-btn\s*\{[\s\S]*?min-height:\s*44px/);
assert.match(css, /\.weekly-highlights-toggle-btn:focus-visible\s*\{[\s\S]*?outline:\s*3px solid/);
const webBuildId = app.match(/const SONIC_APP_BUILD_ID = "([^"]+)";/)?.[1] || "";
const iosBuildId = iosBuild.match(/const appStoreBuildId = "([^"]+)";/)?.[1] || "";
assert.ok(webBuildId, "Web build ID must be defined");
assert.equal(iosBuildId, `${webBuildId}ios1`, "iOS and web build IDs must stay aligned");

console.log("Premium visibility checks passed.");
