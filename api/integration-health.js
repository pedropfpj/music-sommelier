const { envFlag, envInt, requireMusicApi, sendJson } = require("./_music-apis");

module.exports = async function handler(req, res) {
  if (!requireMusicApi(req, res, {
    methods: ["GET", "POST"],
    feature: "health",
    enabledEnv: "SONIC_MUSIC_HEALTH_ENABLED",
    defaultEnabled: true
  })) return;

  sendJson(req, res, 200, {
    ok: true,
    musicApisEnabled: envFlag("SONIC_MUSIC_APIS_ENABLED", false),
    providers: {
      soundcloud: {
        configured: Boolean(process.env.SOUNDCLOUD_CLIENT_ID && process.env.SOUNDCLOUD_CLIENT_SECRET),
        enabled: envFlag("SONIC_MUSIC_APIS_ENABLED", false)
      },
      youtube: {
        configured: Boolean(process.env.YOUTUBE_API_KEY || process.env.YOUTUBE_DATA_API_KEY),
        enabled: envFlag("SONIC_YOUTUBE_ENABLED", false)
      },
      ticketmaster: {
        configured: Boolean(process.env.TICKETMASTER_API_KEY || process.env.TICKETMASTER_CONSUMER_KEY),
        enabled: envFlag("SONIC_TICKETMASTER_ENABLED", false)
      }
    },
    endpoints: {
      soundcloudSearch: "/api/soundcloud-search",
      youtubeSearch: "/api/youtube-search",
      ticketmasterEvents: "/api/ticketmaster-events",
      artistBio: "/api/artist-bio"
    },
    limits: {
      freeDailyDiscovery: envInt("SONIC_DAILY_FREE_DISCOVERY_LIMIT", 80, 1, 1000),
      freeSpiritLimit: envInt("SONIC_FREE_SPIRIT_LIMIT", 5, 0, 100),
      soundcloudSearchDailyLimit: envInt("SONIC_SOUNDCLOUD_SEARCH_DAILY_LIMIT", 80, 0, 10000),
      youtubeSearchDailyLimit: envInt("SONIC_YOUTUBE_SEARCH_DAILY_LIMIT", 80, 0, 10000),
      ticketmasterEventsDailyLimit: envInt("SONIC_TICKETMASTER_EVENTS_DAILY_LIMIT", 80, 0, 10000)
    }
  }, ["GET", "POST", "OPTIONS"]);
};
