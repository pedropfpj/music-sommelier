import assert from "node:assert/strict";
import fs from "node:fs";
import vm from "node:vm";

const app = fs.readFileSync(new URL("../app.js", import.meta.url), "utf8");
const index = fs.readFileSync(new URL("../index.html", import.meta.url), "utf8");
const iosRuntime = fs.readFileSync(new URL("../mobile/sonic-ios-runtime.js", import.meta.url), "utf8");
const dailyUi = fs.readFileSync(new URL("../daily-djs-ui.js", import.meta.url), "utf8");
const address = "bc1qxreqyq0tvd59fsghqrged2lsfkhlvyq0em94z5";

function between(start, end) {
  const from = app.indexOf(start);
  const to = app.indexOf(end, from + start.length);
  assert.ok(from >= 0 && to > from, `missing source block: ${start}`);
  return app.slice(from, to);
}

function control() {
  const attributes = new Map();
  return {
    dataset: {}, title: "", textContent: "",
    setAttribute: (name, value) => attributes.set(name, String(value)),
    removeAttribute: (name) => attributes.delete(name),
    getAttribute: (name) => attributes.get(name)
  };
}

const values = new Map();
let storageWrites = 0;
const likeButton = control();
const quota = control();
const quotaText = control();
const quotaCompact = control();
const sandbox = vm.createContext({
  Date, JSON, Math, Number, String,
  DAILY_LIKE_STORAGE_KEY: "neonpulse:dailyLikes:v1",
  DAILY_LIKE_LIMIT_ENABLED: false,
  DAILY_LIKE_LIMIT: 20,
  dailyLikeMemoryKey: "",
  dailyLikeMemoryState: null,
  publicVisitorMode: false,
  currentAuthUser: { mode: "login", username: "tester" },
  isEphemeralSession: () => false,
  storageKeyForSession: (key) => `${key}:tester`,
  localStorage: {
    getItem: (key) => values.get(key) || null,
    setItem: (key, value) => { storageWrites += 1; values.set(key, value); }
  },
  sonicTinyCopy: (pt) => pt,
  showToast: (message) => { sandbox.lastToast = message; },
  feedbackMessage: control(), djSwipeStatus: control(),
  dailyLikeQuota: quota, dailyLikeQuotaText: quotaText, dailyLikeQuotaCompact: quotaCompact,
  topSwipeLikeBtn: likeButton, swipeLikeBtn: null, previewLikeBtn: null,
  noveltyLikedBtn: null, likeSongBtn: null, likeArtistBtn: null,
  likeDiscoveryBtn: null, djSwipeLikeBtn: null
});
vm.runInContext(between("function dailyLikeLocalDayKey", "function uniqueStorageKeys"), sandbox);

const legacyKey = "neonpulse:dailyLikes:v1:tester";
values.set(legacyKey, JSON.stringify({ version: 1, date: sandbox.dailyLikeLocalDayKey(), count: 20 }));
for (let count = 0; count < 100; count += 1) assert.equal(sandbox.consumeDailyLike(), true);
const usage = sandbox.renderDailyLikeQuota();
assert.equal(usage.unlimited, true);
assert.equal(usage.reached, false);
assert.equal(usage.remaining, Infinity);
assert.equal(storageWrites, 0, "unlimited likes must not increment the legacy quota storage");
assert.equal(quota.dataset.limitReached, "false");
assert.equal(quota.dataset.unlimited, "true");
assert.equal(likeButton.dataset.dailyLikeLimit, undefined);
assert.equal(likeButton.getAttribute("aria-disabled"), undefined);
assert.equal(quotaText.textContent, "Curtidas ilimitadas");
assert.equal(quotaCompact.textContent, "∞");
assert.equal(quotaCompact.dataset.unlimited, "true");
assert.match(quota.getAttribute("aria-label"), /Curtidas ilimitadas/);
assert.equal(sandbox.lastToast, undefined);

assert.match(app, /const DAILY_LIKE_LIMIT_ENABLED = false/);
assert.match(app, /freeDiscoveryLimit:\s*0/, "free discovery must remain open so unlimited likes are usable");
assert.match(index, /freeDiscoveryLimit:\s*0/, "the web runtime must not restore the legacy discovery cap");
assert.match(index, /dailyFreeDiscoveryLimit:\s*0/, "the web AI config must keep discovery unlimited");
assert.match(iosRuntime, /freeDiscoveryLimit:\s*0/, "the iOS runtime must explicitly keep discovery unlimited");
assert.match(iosRuntime, /dailyFreeDiscoveryLimit:\s*0/, "the iOS AI config must explicitly keep discovery unlimited");

for (const marker of [
  'if (direction === "like" && !consumeDailyLike()) return;',
  'bind(previewLikeBtn, "click", async () => {',
  'bind(noveltyLikedBtn, "click", async () => {',
  'bind(likeSongBtn, "click", async () => {',
  'bind(likeArtistBtn, "click", async () => {',
  'bind(likeDiscoveryBtn, "click", async () => {'
]) assert.ok(app.includes(marker), `missing like guard: ${marker}`);
assert.match(dailyUi, /options\.consumeLike\?\.\(\) === false/);
assert.ok(index.includes('id="dailyLikeQuota"'));
assert.ok(index.includes('id="dailyLikeQuotaText">Curtidas ilimitadas'));
assert.ok(index.includes('id="dailyLikeQuotaCompact" class="app-menu-kicker daily-like-quota-compact" aria-hidden="true">∞'));
assert.doesNotMatch(index, />0\/20 curtidas hoje</);

const bitcoin = vm.createContext({ SUPPORT_PAYMENT_CONFIG: { bitcoin: { address, uri: "bitcoin:wrong", lightning: "lnbcwrong" } } });
vm.runInContext(between("function configuredBitcoinAddress", "const LOCAL_QR_L_CONFIG"), bitcoin);
assert.equal(bitcoin.configuredBitcoinAddress(), address);
assert.equal(bitcoin.buildCryptoPayload(), address, "visible value, copy value and QR payload must be the exact address");

const charset = "qpzry9x8gf2tvdw0s3jn54khce6mua7l";
function bech32Polymod(input) {
  let checksum = 1;
  const generators = [0x3b6a57b2, 0x26508e6d, 0x1ea119fa, 0x3d4233dd, 0x2a1462b3];
  for (const value of input) {
    const top = checksum >>> 25;
    checksum = ((checksum & 0x1ffffff) << 5) ^ value;
    for (let bit = 0; bit < 5; bit += 1) if ((top >>> bit) & 1) checksum ^= generators[bit];
  }
  return checksum >>> 0;
}
const separator = address.lastIndexOf("1");
const hrp = address.slice(0, separator);
const data = [...address.slice(separator + 1)].map((char) => charset.indexOf(char));
const expanded = [...hrp].map((char) => char.charCodeAt(0) >>> 5).concat(0, [...hrp].map((char) => char.charCodeAt(0) & 31));
assert.ok(data.every((value) => value >= 0));
assert.equal(bech32Polymod(expanded.concat(data)), 1, "configured mainnet bech32 Bitcoin address must have a valid checksum");

assert.match(app, /supportBitcoinAddressValue\.textContent = cryptoPayload/);
assert.ok(fs.existsSync(new URL("../assets/payments/bitcoin-address-qr.png", import.meta.url)));
assert.match(app, /assets\/payments\/bitcoin-address-qr\.png\?v=20260828btc1/);
assert.match(app, /\{ assetUrl: verifiedBitcoinQr, allowGenerated: false \}/);
console.log("Unlimited likes and Bitcoin address/QR contracts passed.");
