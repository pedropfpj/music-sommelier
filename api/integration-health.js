const { envFirst, envFlag, envInt, envText, featureEnabled, requireMusicApi, sendJson } = require("../lib/api/_music-apis");
const { hasDurableStore } = require("../lib/api/_usage-store");
const { supabaseConfig } = require("../lib/api/_catalog-enrichment-store");

const TICKETMASTER_KEY_ENVS = [
  "TICKETMASTER_API_KEY",
  "TICKETMASTER_CONSUMER_KEY",
  "TICKETMASTER_CUSTOMER_KEY",
  "TICKETMASTER_COSTUMER_KEY",
  "TICKETMASTER_DISCOVERY_API_KEY",
  "TM_CONSUMER_KEY"
];
const TICKETMASTER_SECRET_ENVS = [
  "TICKETMASTER_CONSUMER_SECRET",
  "TICKETMASTER_API_SECRET",
  "TICKETMASTER_SECRET",
  "TM_CONSUMER_SECRET"
];
const DISCOGS_TOKEN_ENVS = ["DISCOGS_USER_TOKEN", "DISCOGS_TOKEN"];

function providerState({ configured = true, routeEnabled = true, enabled = false, disabledReason = "disabled_by_config" } = {}) {
  if (!routeEnabled) return { status: "disabled", reason: disabledReason };
  if (!configured) return { status: "needs_credentials", reason: "missing_credentials" };
  if (!enabled) return { status: "disabled", reason: disabledReason };
  return { status: "active", reason: "ready" };
}

module.exports = async function handler(req, res) {
  if (!requireMusicApi(req, res, {
    methods: ["GET", "POST"],
    feature: "health",
    enabledEnv: "SONIC_MUSIC_HEALTH_ENABLED",
    defaultEnabled: true,
    allowGlobalFallback: false
  })) return;

  const artistEventsEnabled = featureEnabled("SONIC_ARTIST_EVENTS_ENABLED", true);
  const goabaseEnabled = featureEnabled("SONIC_GOABASE_ENABLED", true, { allowGlobalFallback: false });
  const eventRadarEnabled = featureEnabled("SONIC_EVENT_RADAR_ENABLED", true, { allowGlobalFallback: false });
  const ticketmasterConfigured = Boolean(envFirst(TICKETMASTER_KEY_ENVS));
  const ticketmasterSecretConfigured = Boolean(envFirst(TICKETMASTER_SECRET_ENVS));
  const bandsintownConfigured = Boolean(process.env.BANDSINTOWN_APP_ID);
  const soundcloudConfigured = Boolean(process.env.SOUNDCLOUD_CLIENT_ID && process.env.SOUNDCLOUD_CLIENT_SECRET);
  const soundcloudRouteEnabled = featureEnabled("SONIC_SOUNDCLOUD_ENABLED", true, { allowGlobalFallback: false });
  const youtubeConfigured = Boolean(process.env.YOUTUBE_API_KEY || process.env.YOUTUBE_DATA_API_KEY);
  const youtubeRouteEnabled = featureEnabled("SONIC_YOUTUBE_ENABLED", true, { allowGlobalFallback: false });
  const bandsintownRouteEnabled = featureEnabled("SONIC_BANDSINTOWN_ENABLED", true, { allowGlobalFallback: false });
  const openAiConfigured = Boolean(process.env.OPENAI_API_KEY);
  const aiTextRouteEnabled = envFlag("SONIC_AI_TEXT_ENABLED", true);
  const aiImageRouteEnabled = envFlag("SONIC_AI_IMAGE_ENABLED", true);
  const artistBioRouteEnabled = aiTextRouteEnabled && envFlag("SONIC_ARTIST_BIO_ENABLED", true);
  const discogsConfigured = Boolean(envFirst(DISCOGS_TOKEN_ENVS));
  const discogsEnabled = envFlag("SONIC_DISCOGS_ENABLED", true);
  const musicBrainzEnabled = envFlag("SONIC_MUSICBRAINZ_ENABLED", true);
  const newsFeedRouteEnabled = envFlag("SONIC_NEWS_FEED_ROUTE_ENABLED", true);
  const newsFeedEnabled = envFlag("SONIC_NEWS_FEED_ENABLED", true);
  const coverArtEnabled = featureEnabled("SONIC_COVER_ART_ENABLED", true, { allowGlobalFallback: false });
  const radioBrowserEnabled = featureEnabled("SONIC_RADIO_BROWSER_ENABLED", true, { allowGlobalFallback: false });
  const catalogExtraSupabaseUrl = envText("SUPABASE_URL").replace(/\/+$/, "");
  const catalogExtraAnonKey = envText("SUPABASE_ANON_KEY") || envText("NEXT_PUBLIC_SUPABASE_ANON_KEY");
  const catalogExtraRouteEnabled = envFlag("SONIC_CATALOG_EXTRA_ENABLED", envFlag("SONIC_SOCIAL_ENABLED", false));
  const catalogExtraConfigured = Boolean(catalogExtraSupabaseUrl && catalogExtraAnonKey);
  const catalogExtraEnabled = catalogExtraConfigured && catalogExtraRouteEnabled;
  const catalogEnrichment = supabaseConfig();
  const catalogEnrichmentRouteEnabled = catalogEnrichment.enabled || envFlag("SONIC_CATALOG_ENRICHMENT_ENABLED", true);
  const lastfmConfigured = Boolean(envText("LASTFM_API_KEY") || envText("SONIC_LASTFM_API_KEY"));
  const lastfmRouteEnabled = featureEnabled("SONIC_LASTFM_ENABLED", true, { allowGlobalFallback: false });
  const lastfmEnabled = lastfmConfigured && lastfmRouteEnabled;
  const durableUsageStore = hasDurableStore();
  sendJson(req, res, 200, {
    ok: true,
    musicApisEnabled: envFlag("SONIC_MUSIC_APIS_ENABLED", false),
    providers: {
      soundcloud: {
        configured: soundcloudConfigured,
        routeEnabled: soundcloudRouteEnabled,
        enabled: soundcloudConfigured && soundcloudRouteEnabled,
        ...providerState({
          configured: soundcloudConfigured,
          routeEnabled: soundcloudRouteEnabled,
          enabled: soundcloudConfigured && soundcloudRouteEnabled,
          disabledReason: "explicitly_disabled_until_official_credentials"
        }),
        compliance: {
          backendOnly: true,
          requiresCredentials: true,
          requiresExplicitEnable: true,
          attributionVisible: true,
          tokenCached: true
        }
      },
      youtube: {
        configured: youtubeConfigured,
        routeEnabled: youtubeRouteEnabled,
        enabled: youtubeConfigured && youtubeRouteEnabled,
        ...providerState({
          configured: youtubeConfigured,
          routeEnabled: youtubeRouteEnabled,
          enabled: youtubeConfigured && youtubeRouteEnabled,
          disabledReason: "explicitly_disabled_until_official_api_key"
        }),
        compliance: {
          backendOnly: true,
          requiresCredentials: true,
          requiresExplicitEnable: true,
          attributionVisible: true,
          safeEmbeds: true,
          minQualityScore: envInt("SONIC_YOUTUBE_MIN_QUALITY_SCORE", 7, 0, 30)
        }
      },
      trackMetadata: {
        configured: envFlag("SONIC_ITUNES_ENABLED", true) || envFlag("SONIC_DEEZER_ENABLED", false),
        enabled: featureEnabled("SONIC_TRACK_METADATA_ENABLED", true, { allowGlobalFallback: false }),
        providers: {
          deezer: envFlag("SONIC_DEEZER_ENABLED", false),
          itunes: envFlag("SONIC_ITUNES_ENABLED", true)
        },
        compliance: {
          defaultProvider: "itunes",
          deezerOptIn: true,
          attributionVisible: true,
          userAgent: envText("SONIC_TRACK_METADATA_USER_AGENT", envText("SONIC_REFERENCE_USER_AGENT", "SonicSearch/1.0 (+https://sonicsearch.app)")),
          cacheSeconds: envInt("SONIC_TRACK_METADATA_CACHE_SECONDS", 3600, 60, 86400)
        }
      },
      coverArt: {
        configured: true,
        enabled: coverArtEnabled,
        providers: {
          musicbrainz: envFlag("SONIC_MUSICBRAINZ_ENABLED", true),
          coverArtArchive: true
        },
        compliance: {
          backendOnly: true,
          requiresCredentials: false,
          attributionVisible: true,
          userAgent: envText("SONIC_REFERENCE_USER_AGENT", "SonicSearch/1.0 (+https://sonicsearch.app)"),
          musicbrainzMinIntervalMs: envInt("SONIC_MUSICBRAINZ_MIN_INTERVAL_MS", 1100, 1000, 10000),
          cacheSeconds: envInt("SONIC_COVER_ART_CACHE_SECONDS", 86400, 300, 604800)
        }
      },
      artistProfile: {
        configured: envFlag("SONIC_MUSICBRAINZ_ENABLED", true) || envFlag("SONIC_WIKIPEDIA_ENABLED", true) || envFlag("SONIC_ITUNES_ENABLED", true),
        enabled: featureEnabled("SONIC_ARTIST_PROFILE_ENABLED", true, { allowGlobalFallback: false }),
        providers: {
          musicbrainz: envFlag("SONIC_MUSICBRAINZ_ENABLED", true),
          wikipedia: envFlag("SONIC_WIKIPEDIA_ENABLED", true),
          itunes: envFlag("SONIC_ITUNES_ENABLED", true)
        },
        compliance: {
          backendOnly: true,
          attributionVisible: true,
          userAgent: envText("SONIC_REFERENCE_USER_AGENT", "SonicSearch/1.0 (+https://sonicsearch.app)"),
          musicbrainzMinIntervalMs: envInt("SONIC_MUSICBRAINZ_MIN_INTERVAL_MS", 1100, 1000, 10000),
          cacheSeconds: envInt("SONIC_ARTIST_PROFILE_CACHE_SECONDS", 86400, 300, 604800)
        }
      },
      artistBio: {
        configured: openAiConfigured,
        routeEnabled: artistBioRouteEnabled,
        enabled: openAiConfigured && artistBioRouteEnabled,
        ...providerState({
          configured: openAiConfigured,
          routeEnabled: artistBioRouteEnabled,
          enabled: openAiConfigured && artistBioRouteEnabled,
          disabledReason: "disabled_until_openai_api_key"
        }),
        providers: {
          openai: openAiConfigured,
          musicbrainz: musicBrainzEnabled,
          discogs: discogsEnabled && discogsConfigured
        },
        compliance: {
          backendOnly: true,
          attributionVisible: true,
          discogsOptIn: true,
          discogsConfigured,
          discogsEnabled,
          discogsStatus: providerState({
            configured: discogsConfigured,
            routeEnabled: discogsEnabled,
            enabled: discogsConfigured && discogsEnabled,
            disabledReason: "explicitly_disabled_until_discogs_token"
          }).status,
          userAgent: envText("SONIC_REFERENCE_USER_AGENT", "SonicSearch/1.0 (+https://sonicsearch.app)"),
          discogsUserAgent: envText("SONIC_DISCOGS_USER_AGENT", envText("SONIC_REFERENCE_USER_AGENT", "SonicSearch/1.0 (+https://sonicsearch.app)")),
          cacheSeconds: envInt("SONIC_ARTIST_BIO_REFERENCE_CACHE_SECONDS", 86400, 60, 604800)
        }
      },
      trackInsight: {
        configured: openAiConfigured,
        routeEnabled: aiTextRouteEnabled,
        enabled: openAiConfigured && aiTextRouteEnabled,
        ...providerState({
          configured: openAiConfigured,
          routeEnabled: aiTextRouteEnabled,
          enabled: openAiConfigured && aiTextRouteEnabled,
          disabledReason: "disabled_until_openai_api_key"
        }),
        compliance: {
          backendOnly: true,
          requiresCredentials: true,
          dailyLimit: envInt("SONIC_AI_TRACK_DAILY_LIMIT", 24, 0, 10000)
        }
      },
      newsTranslate: {
        configured: openAiConfigured,
        routeEnabled: aiTextRouteEnabled,
        enabled: openAiConfigured && aiTextRouteEnabled,
        ...providerState({
          configured: openAiConfigured,
          routeEnabled: aiTextRouteEnabled,
          enabled: openAiConfigured && aiTextRouteEnabled,
          disabledReason: "disabled_until_openai_api_key"
        }),
        compliance: {
          backendOnly: true,
          requiresCredentials: true,
          dailyLimit: envInt("SONIC_AI_NEWS_DAILY_LIMIT", 24, 0, 10000)
        }
      },
      spiritImage: {
        configured: openAiConfigured,
        routeEnabled: aiImageRouteEnabled,
        enabled: openAiConfigured && aiImageRouteEnabled,
        ...providerState({
          configured: openAiConfigured,
          routeEnabled: aiImageRouteEnabled,
          enabled: openAiConfigured && aiImageRouteEnabled,
          disabledReason: "disabled_until_openai_api_key"
        }),
        compliance: {
          backendOnly: true,
          requiresCredentials: true,
          premiumGateAvailable: envFlag("SONIC_AI_IMAGE_REQUIRE_PREMIUM", false),
          guestUnlockAvailable: true,
          guestUnlockLikes: 10,
          uniquePerUser: true,
          dailyLimit: envInt("SONIC_AI_IMAGE_DAILY_LIMIT", 50, 0, 10000)
        }
      },
      lastfm: {
        configured: lastfmConfigured,
        routeEnabled: lastfmRouteEnabled,
        enabled: lastfmEnabled,
        ...providerState({
          configured: lastfmConfigured,
          routeEnabled: lastfmRouteEnabled,
          enabled: lastfmEnabled,
          disabledReason: "explicitly_disabled_until_lastfm_api_key"
        }),
        compliance: {
          backendOnly: true,
          requiresCredentials: true,
          optIn: true,
          attributionVisible: true,
          cacheSeconds: envInt("SONIC_LASTFM_CACHE_SECONDS", 86400, 300, 604800)
        }
      },
      catalogExtra: {
        configured: catalogExtraConfigured,
        routeEnabled: catalogExtraRouteEnabled,
        enabled: catalogExtraEnabled,
        ...providerState({
          configured: catalogExtraConfigured,
          routeEnabled: catalogExtraRouteEnabled,
          enabled: catalogExtraEnabled,
          disabledReason: "disabled_until_supabase_catalog_is_configured"
        }),
        compliance: {
          backendOnly: true,
          requiresCredentials: true,
          requiresExplicitEnable: true,
          publicSelectOnly: true,
          table: "catalog_artists/catalog_tracks"
        }
      },
      radioBrowser: {
        configured: true,
        enabled: radioBrowserEnabled,
        compliance: {
          backendOnly: true,
          requiresCredentials: false,
          attributionVisible: true,
          userAgent: envText("SONIC_RADIO_BROWSER_USER_AGENT", envText("SONIC_REFERENCE_USER_AGENT", "SonicSearch/1.0 (+https://sonicsearch.app)")),
          cacheSeconds: envInt("SONIC_RADIO_BROWSER_CACHE_SECONDS", 21600, 300, 604800)
        }
      },
      catalogEnrichment: {
        configured: Boolean(catalogEnrichment.supabaseUrl && catalogEnrichment.serviceKey),
        enabled: catalogEnrichment.enabled,
        ...providerState({
          configured: Boolean(catalogEnrichment.supabaseUrl && catalogEnrichment.serviceKey),
          routeEnabled: catalogEnrichmentRouteEnabled,
          enabled: catalogEnrichment.enabled,
          disabledReason: "disabled_until_supabase_service_role_is_configured"
        }),
        compliance: {
          backendOnly: true,
          requiresCredentials: true,
          requiresExplicitEnable: true,
          serviceRoleServerOnly: true,
          publicSelectOnly: true,
          table: "catalog_enrichments"
        }
      },
      newsFeed: {
        configured: true,
        enabled: newsFeedRouteEnabled && newsFeedEnabled,
        routeEnabled: newsFeedRouteEnabled,
        feedEnabled: newsFeedEnabled,
        compliance: {
          backendOnly: true,
          attributionVisible: true,
          directBrowserFetchBlocked: true,
          publicProxyFree: true,
          durableUsageStore,
          userAgent: envText("SONIC_NEWS_USER_AGENT", "SonicSearch/1.0 (+https://sonicsearch.app)"),
          cacheSeconds: envInt("SONIC_NEWS_FEED_CACHE_SECONDS", 900, 60, 86400),
          timeoutMs: envInt("SONIC_NEWS_FEED_TIMEOUT_MS", 5200, 1000, 15000)
        }
      },
      goabase: {
        configured: true,
        routeEnabled: goabaseEnabled,
        enabled: artistEventsEnabled && goabaseEnabled,
        ...providerState({
          configured: true,
          routeEnabled: artistEventsEnabled && goabaseEnabled,
          enabled: artistEventsEnabled && goabaseEnabled,
          disabledReason: "disabled_by_config"
        }),
        compliance: {
          backendOnly: true,
          requiresCredentials: false,
          attributionVisible: true,
          backlinkRequired: true,
          publicJsonApi: true,
          userAgent: envText("SONIC_REFERENCE_USER_AGENT", "SonicSearch/1.0 (+https://sonicsearch.app)"),
          listLimit: envInt("SONIC_GOABASE_LIST_LIMIT", 40, 1, 50),
          detailLimit: envInt("SONIC_GOABASE_DETAIL_LIMIT", 20, 1, 50)
        }
      },
      ticketmaster: {
        configured: ticketmasterConfigured,
        consumerKeyConfigured: ticketmasterConfigured,
        consumerSecretConfigured: ticketmasterSecretConfigured,
        enabled: ticketmasterConfigured &&
          artistEventsEnabled &&
          featureEnabled("SONIC_TICKETMASTER_ENABLED", true)
      },
      bandsintown: {
        configured: bandsintownConfigured,
        routeEnabled: bandsintownRouteEnabled,
        enabled: bandsintownConfigured &&
          artistEventsEnabled &&
          bandsintownRouteEnabled,
        ...providerState({
          configured: bandsintownConfigured,
          routeEnabled: artistEventsEnabled && bandsintownRouteEnabled,
          enabled: bandsintownConfigured && artistEventsEnabled && bandsintownRouteEnabled,
          disabledReason: "explicitly_disabled_until_bandsintown_app_id"
        }),
        compliance: {
          backendOnly: true,
          requiresCredentials: true,
          requiresExplicitEnable: true,
          attributionVisible: true
        }
      },
      localEvents: {
        configured: true,
        enabled: artistEventsEnabled
      },
      artistEvents: {
        configured: true,
        enabled: artistEventsEnabled
      },
      eventRadar: {
        configured: true,
        routeEnabled: eventRadarEnabled,
        enabled: eventRadarEnabled,
        compliance: {
          backendOnly: true,
          requiresCredentials: false,
          source: "Goabase snapshot",
          attributionVisible: true
        }
      }
    },
    endpoints: {
      soundcloudSearch: "/api/soundcloud-search",
      youtubeSearch: "/api/youtube-search",
      trackMetadata: "/api/track-metadata",
      coverArt: "/api/cover-art",
      artistProfile: "/api/artist-profile",
      artistEvents: "/api/ticketmaster-events",
      eventRadar: "/api/event-radar",
      artistBio: "/api/artist-bio",
      trackInsight: "/api/track-insight",
      newsTranslate: "/api/news-translate",
      spiritImage: "/api/spirit-image",
      lastfmArtist: "/api/lastfm-artist",
      radioBrowser: "/api/radio-browser",
      catalogExtra: "/api/catalog-extra",
      catalogEnrichment: "supabase/rest/v1/catalog_enrichments",
      newsFeed: "/api/news-feed"
    },
    limits: {
      freeDailyDiscovery: envInt("SONIC_DAILY_FREE_DISCOVERY_LIMIT", 50, 1, 1000),
      freeSpiritLimit: envInt("SONIC_FREE_SPIRIT_LIMIT", 3, 0, 100),
      soundcloudSearchDailyLimit: envInt("SONIC_SOUNDCLOUD_SEARCH_DAILY_LIMIT", 80, 0, 10000),
      youtubeSearchDailyLimit: envInt("SONIC_YOUTUBE_SEARCH_DAILY_LIMIT", 80, 0, 10000),
      trackMetadataDailyLimit: envInt("SONIC_TRACK_METADATA_DAILY_LIMIT", 120, 0, 10000),
      coverArtDailyLimit: envInt("SONIC_COVER_ART_DAILY_LIMIT", 100, 0, 10000),
      artistProfileDailyLimit: envInt("SONIC_ARTIST_PROFILE_DAILY_LIMIT", 80, 0, 10000),
      artistBioDailyLimit: envInt("SONIC_AI_BIO_DAILY_LIMIT", 18, 0, 10000),
      lastfmDailyLimit: envInt("SONIC_LASTFM_DAILY_LIMIT", 80, 0, 10000),
      radioBrowserDailyLimit: envInt("SONIC_RADIO_BROWSER_DAILY_LIMIT", 120, 0, 10000),
      newsFeedDailyLimit: envInt("SONIC_NEWS_FEED_DAILY_LIMIT", 80, 0, 10000),
      ticketmasterEventsDailyLimit: envInt("SONIC_TICKETMASTER_EVENTS_DAILY_LIMIT", 80, 0, 10000),
      eventRadarDailyLimit: envInt("SONIC_EVENT_RADAR_DAILY_LIMIT", 160, 0, 10000)
    }
  }, ["GET", "POST", "OPTIONS"]);
};
