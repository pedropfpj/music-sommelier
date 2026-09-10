import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";

const [html, css, app, iosBuild] = await Promise.all([
  readFile(new URL("../index.html", import.meta.url), "utf8"),
  readFile(new URL("../styles.css", import.meta.url), "utf8"),
  readFile(new URL("../app.js", import.meta.url), "utf8"),
  readFile(new URL("./build-ios-web.mjs", import.meta.url), "utf8")
]);

for (const id of [
  "membershipHideBtn",
  "membershipHideLabel",
  "premiumPromoCollapsed",
  "premiumPromoCollapsedTitle",
  "premiumPromoShowBtn",
  "premiumDismissBtn"
]) {
  assert.match(html, new RegExp(`id=["']${id}["']`), `missing #${id}`);
  assert.match(app, new RegExp(`getElementById\\(["']${id}["']\\)`), `missing DOM binding for #${id}`);
}

assert.match(html, /id="membershipHideBtn"[^>]+aria-controls="membershipCard weeklyHighlightsCard"/);
assert.match(html, /id="premiumPromoCollapsed"[^>]+class="premium-promo-collapsed hidden"/);
assert.match(html, /id="premiumDismissBtn"[^>]+type="submit"[^>]+value="cancel"/);
assert.match(app, /PREMIUM_PROMO_VISIBILITY_STORAGE_KEY\s*=\s*"neonpulse:premiumPromoVisibility:v1"/);
assert.match(app, /PROFILE_DATA_STORAGE_KEYS\.filter\(\(key\) => key !== PREMIUM_PROMO_VISIBILITY_STORAGE_KEY\)/);
assert.match(app, /isEphemeralSession\(normalizedSession\)[\s\S]*?PREMIUM_PROMO_VISIBILITY_STORAGE_KEY}:device/);
assert.match(app, /function setPremiumPromoCollapsed\(collapsed\)[\s\S]*?if \(hasPremiumAccess\(\)\) return;/);
assert.match(app, /membershipCard\?\.classList\.toggle\("hidden", collapsed\)/);
assert.match(app, /weeklyHighlightsCard\?\.classList\.toggle\("hidden", collapsed\)/);
assert.match(app, /premiumPromoCollapsed\?\.classList\.toggle\("hidden", !collapsed\)/);
assert.match(app, /bind\(membershipHideBtn, "click",[\s\S]*?setPremiumPromoCollapsed\(true\)/);
assert.match(app, /bind\(premiumPromoShowBtn, "click",[\s\S]*?setPremiumPromoCollapsed\(false\)/);
assert.match(app, /sonicTinyCopy\("Agora não", "Not now", "Ahora no"\)/);
assert.match(css, /\.membership-hide-btn\s*\{[\s\S]*?min-height:\s*44px/);
assert.match(css, /\.premium-promo-show-btn\s*\{[\s\S]*?min-height:\s*44px/);
assert.match(app, /20260910premiumdismiss1/);
assert.match(iosBuild, /20260910premiumdismiss1ios1/);

console.log("Premium visibility checks passed.");
