const { envFirst, envFlag, envInt, featureEnabled, requireMusicApi, sendJson } = require("./_music-apis");

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

module.exports = async function handler(req, res) {
  if (!requireMusicApi(req, res, {
    methods: ["GET", "POST"],
    feature: "health",
    enabledEnv: "SONIC_MUSIC_HEALTH_ENABLED",
    defaultEnabled: true
  })) return;

  const artistEventsEnabled = featureEnabled("SONIC_ARTIST_EVENTS_ENABLED", true);
  const ticketmasterConfigured = Boolean(envFirst(TICKETMASTER_KEY_ENVS));
  const ticketmasterSecretConfigured = Boolean(envFirst(TICKETMASTER_SECRET_ENVS));
  const bandsintownConfigured = Boolean(process.env.BANDSINTOWN_APP_ID);
  sendJson(req, res, 200, {
    ok: true,
    musicApisEnabled: envFlag("SONIC_MUSIC_APIS_ENABLED", false),
    providers: {
      soundcloud: {
        configured: Boolean(process.env.SOUNDCLOUD_CLIENT_ID && process.env.SOUNDCLOUD_CLIENT_SECRET),
        enabled: featureEnabled("SONIC_MUSIC_APIS_ENABLED", false)
      },
      youtube: {
        configured: Boolean(process.env.YOUTUBE_API_KEY || process.env.YOUTUBE_DATA_API_KEY),
        enabled: featureEnabled("SONIC_YOUTUBE_ENABLED", false)
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
        enabled: bandsintownConfigured &&
          artistEventsEnabled &&
          featureEnabled("SONIC_BANDSINTOWN_ENABLED", true)
      },
      localEvents: {
        configured: true,
        enabled: artistEventsEnabled
      },
      artistEvents: {
        configured: true,
        enabled: artistEventsEnabled
      }
    },
    endpoints: {
      soundcloudSearch: "/api/soundcloud-search",
      youtubeSearch: "/api/youtube-search",
      artistEvents: "/api/ticketmaster-events",
      artistBio: "/api/artist-bio"
    },
    limits: {
      freeDailyDiscovery: envInt("SONIC_DAILY_FREE_DISCOVERY_LIMIT", 50, 1, 1000),
      freeSpiritLimit: envInt("SONIC_FREE_SPIRIT_LIMIT", 3, 0, 100),
      soundcloudSearchDailyLimit: envInt("SONIC_SOUNDCLOUD_SEARCH_DAILY_LIMIT", 80, 0, 10000),
      youtubeSearchDailyLimit: envInt("SONIC_YOUTUBE_SEARCH_DAILY_LIMIT", 80, 0, 10000),
      ticketmasterEventsDailyLimit: envInt("SONIC_TICKETMASTER_EVENTS_DAILY_LIMIT", 80, 0, 10000)
    }
  }, ["GET", "POST", "OPTIONS"]);
};
