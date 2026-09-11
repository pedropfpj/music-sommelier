const {
  envFlag,
  envText,
  requireMusicApi,
  sendJson,
  trimText
} = require("./_music-apis");
const universalMusic = require("../../universal-music");

const METHODS = ["GET", "OPTIONS"];

function supabaseConfig() {
  const url = envText("SUPABASE_URL").replace(/\/+$/, "");
  const key = envText("SUPABASE_ANON_KEY") || envText("NEXT_PUBLIC_SUPABASE_ANON_KEY");
  return {
    enabled: envFlag("SONIC_UNIVERSAL_CATALOG_ENABLED", false) && Boolean(url && key),
    url,
    key
  };
}

function languageFrom(req) {
  const requested = trimText(req.query?.language || req.query?.lang || "", 5).toLowerCase();
  return ["pt", "en", "es"].includes(requested) ? requested : "pt";
}

async function fetchSupabaseTaxonomy(config) {
  const headers = {
    apikey: config.key,
    Authorization: `Bearer ${config.key}`,
    Accept: "application/json"
  };
  const [universeResponse, genreResponse] = await Promise.all([
    fetch(`${config.url}/rest/v1/music_universes?status=eq.active&select=slug,display_name,display_names,sort_order&order=sort_order.asc`, { headers }),
    fetch(`${config.url}/rest/v1/music_genres?status=eq.active&select=slug,universe_slug,parent_slug,display_name,display_names,genre_kind&order=display_name.asc`, { headers })
  ]);
  if (!universeResponse.ok || !genreResponse.ok) throw new Error("universal_taxonomy_not_ready");
  const [universes, genres] = await Promise.all([universeResponse.json(), genreResponse.json()]);
  if (!Array.isArray(universes) || !universes.length || !Array.isArray(genres)) {
    throw new Error("universal_taxonomy_empty");
  }
  return { universes, genres };
}

module.exports = async function handler(req, res) {
  if (!requireMusicApi(req, res, {
    methods: ["GET"],
    feature: "music-universes",
    enabledEnv: "SONIC_MUSIC_UNIVERSES_ROUTE_ENABLED",
    defaultEnabled: true,
    allowGlobalFallback: false,
    budgetOnStart: false
  })) return;

  const language = languageFrom(req);
  const fallback = universalMusic.listUniverses(language);
  const config = supabaseConfig();
  res.setHeader("Cache-Control", "public, max-age=300, s-maxage=21600, stale-while-revalidate=86400");

  if (!config.enabled) {
    sendJson(req, res, 200, {
      ok: true,
      enabled: false,
      schemaVersion: universalMusic.schemaVersion,
      defaultUniverse: universalMusic.defaultUniverse,
      source: "bundled_taxonomy",
      universes: fallback
    }, METHODS);
    return;
  }

  try {
    const taxonomy = await fetchSupabaseTaxonomy(config);
    const genresByUniverse = new Map();
    taxonomy.genres.forEach((genre) => {
      const list = genresByUniverse.get(genre.universe_slug) || [];
      list.push({
        slug: genre.slug,
        parentSlug: genre.parent_slug || "",
        label: genre.display_names?.[language] || genre.display_name,
        labels: genre.display_names || {},
        kind: genre.genre_kind || "genre"
      });
      genresByUniverse.set(genre.universe_slug, list);
    });
    sendJson(req, res, 200, {
      ok: true,
      enabled: true,
      schemaVersion: universalMusic.schemaVersion,
      defaultUniverse: universalMusic.defaultUniverse,
      source: "supabase",
      universes: taxonomy.universes.map((universe) => ({
        slug: universe.slug,
        label: universe.display_names?.[language] || universe.display_name,
        labels: universe.display_names || {},
        sortOrder: universe.sort_order,
        genres: genresByUniverse.get(universe.slug) || []
      }))
    }, METHODS);
  } catch (_error) {
    sendJson(req, res, 200, {
      ok: true,
      enabled: false,
      setupNeeded: true,
      schemaVersion: universalMusic.schemaVersion,
      defaultUniverse: universalMusic.defaultUniverse,
      source: "bundled_taxonomy",
      universes: fallback
    }, METHODS);
  }
};
