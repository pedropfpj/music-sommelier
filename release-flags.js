(function (root) {
  "use strict";
  // Social UI follows the server's explicit activation, never URL parameters.
  const flags = Object.freeze({ socialV2: false, publicProfiles: false, friends: false, premiumPromotion: false });
  if (typeof module !== "undefined" && module.exports) module.exports = flags;
  root.SonicReleaseFlags = flags;
  root.SonicConfigureSocialRelease = function (features = {}) {
    root.SonicReleaseFlags = Object.freeze({ ...flags, socialV2: features.socialV2 === true, publicProfiles: features.publicProfiles === true, friends: features.friends === true });
    if (root.document) {
      root.document.documentElement.dataset.socialV2 = String(root.SonicReleaseFlags.socialV2);
      root.document.documentElement.dataset.publicProfiles = String(root.SonicReleaseFlags.publicProfiles);
      root.document.documentElement.dataset.friends = String(root.SonicReleaseFlags.friends);
    }
    return root.SonicReleaseFlags;
  };
  if (root.document) {
    const native = /^(capacitor:|ionic:)$/.test(root.location?.protocol || "") || root.SONIC_SEARCH_APP_STORE_MODE;
    if (!native) root.document.documentElement.dataset.webAudience = "true";
    root.document.documentElement.dataset.socialV2 = String(flags.socialV2);
    root.document.documentElement.dataset.premiumPromotion = String(flags.premiumPromotion);
    root.document.documentElement.dataset.publicProfiles = String(flags.publicProfiles);
    root.document.documentElement.dataset.friends = String(flags.friends);
  }
})(typeof window !== "undefined" ? window : globalThis);
