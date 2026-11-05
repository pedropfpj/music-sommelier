(function (root) {
  "use strict";
  // Public web release. Enable social UI only in a separately validated staging build.
  const flags = Object.freeze({ socialV2: false, publicProfiles: false, premiumPromotion: false });
  if (typeof module !== "undefined" && module.exports) module.exports = flags;
  root.SonicReleaseFlags = flags;
  if (root.document) {
    const native = /^(capacitor:|ionic:)$/.test(root.location?.protocol || "") || root.SONIC_SEARCH_APP_STORE_MODE;
    if (!native) root.document.documentElement.dataset.webAudience = "true";
    root.document.documentElement.dataset.socialV2 = String(flags.socialV2);
    root.document.documentElement.dataset.premiumPromotion = String(flags.premiumPromotion);
    root.document.documentElement.dataset.publicProfiles = String(flags.publicProfiles);
  }
})(typeof window !== "undefined" ? window : globalThis);
