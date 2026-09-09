(function installSonicCatalogRuntime(globalScope) {
  "use strict";

  const BASE_PATH = "data/runtime-catalog-v1";
  const VERSION = "20260820-catalog-v21";
  let manifestPromise = null;
  let corePromise = null;
  const stylePromises = new Map();

  function normalizeStyle(value = "") {
    return String(value || "")
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "_")
      .replace(/^_+|_+$/g, "");
  }

  async function fetchJson(relativePath) {
    const separator = relativePath.includes("?") ? "&" : "?";
    const response = await fetch(`${relativePath}${separator}v=${VERSION}`, { cache: "force-cache" });
    if (!response.ok) throw new Error(`runtime_catalog_${response.status}`);
    return response.json();
  }

  function loadManifest() {
    if (!manifestPromise) {
      manifestPromise = fetchJson(`${BASE_PATH}/manifest.json`).catch((error) => {
        manifestPromise = null;
        throw error;
      });
    }
    return manifestPromise;
  }

  function loadCore() {
    if (!corePromise) {
      corePromise = loadManifest()
        .then((manifest) => fetchJson(`${BASE_PATH}/${manifest.core || "core.json"}`))
        .then((rows) => Array.isArray(rows) ? rows : [])
        .catch((error) => {
          corePromise = null;
          throw error;
        });
    }
    return corePromise;
  }

  function loadStyle(style = "") {
    const key = normalizeStyle(style);
    if (!key) return Promise.resolve([]);
    if (!stylePromises.has(key)) {
      const promise = loadManifest()
        .then((manifest) => {
          const relativePath = manifest?.styles?.[key];
          return relativePath ? fetchJson(`${BASE_PATH}/${relativePath}`) : [];
        })
        .then((rows) => Array.isArray(rows) ? rows : [])
        .catch((error) => {
          stylePromises.delete(key);
          throw error;
        });
      stylePromises.set(key, promise);
    }
    return stylePromises.get(key);
  }

  globalScope.SonicCatalogRuntime = Object.freeze({
    version: VERSION,
    normalizeStyle,
    loadCore,
    loadStyle
  });
})(window);
