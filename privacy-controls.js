(function (root) {
  "use strict";
  const key = "sonic_search:privacy:analytics:v1";
  const version = "2026-09-22";
  const versionKey = "sonic_search:privacy:analytics:version";
  const analyticsKeys = [
    "sonic_search:analytics_anonymous:v2", "sonic_search:analytics_session:v2",
    "sonic_search:beta_event_session:v1", "sonic_search:beta_event_once:v1",
    "sonic_search:beta_visit:v1"
  ];
  let controller = new AbortController();
  function nativeRuntime() {
    return Boolean(root.SONIC_SEARCH_DISABLE_ANALYTICS || root.SONIC_SEARCH_APP_STORE_MODE ||
      root.document?.documentElement?.dataset?.sonicNativeApp === "true" ||
      root.Capacitor?.isNativePlatform?.() || /^(capacitor:|ionic:|file:)$/.test(root.location?.protocol || ""));
  }
  function choice() {
    try {
      const value = root.localStorage.getItem(key);
      return value === "no" ? "no" : value === "yes" && root.localStorage.getItem(versionKey) === version ? "yes" : "";
    } catch (_) { return "no"; }
  }
  function allowed() { return !nativeRuntime() && choice() === "yes"; }
  function clearIdentifiers() {
    for (const name of analyticsKeys) {
      try { root.localStorage.removeItem(name); root.sessionStorage?.removeItem(name); } catch (_) {}
    }
  }
  function sync() {
    if (!allowed()) {
      controller.abort();
      clearIdentifiers();
      root.vaq = [];
    } else if (controller.signal.aborted) controller = new AbortController();
    root.dispatchEvent(new CustomEvent("sonic:privacy-change", { detail: { analytics: allowed() } }));
  }
  function setChoice(value) {
    if (!["yes", "no"].includes(value)) return false;
    try {
      root.localStorage.setItem(key, value);
      root.localStorage.setItem(versionKey, version);
    } catch (_) { return false; }
    sync();
    // A fresh document also removes any listeners installed by the third-party script.
    if (!allowed() && root.__sonicAnalyticsLoaded) root.location.reload();
    return true;
  }
  root.SonicPrivacy = { allowed, choice, setChoice, clearIdentifiers, version, signal: () => controller.signal };
  root.addEventListener("storage", event => {
    if (event.key === key || event.key === versionKey || event.key === null) {
      sync();
      if (!allowed() && root.__sonicAnalyticsLoaded) root.location.reload();
    }
  });
  if (!allowed()) clearIdentifiers();
})(window);
