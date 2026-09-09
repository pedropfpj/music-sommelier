(function configureSonicSearchIosRuntime() {
  const apiBaseUrl = "https://sonicsearch.app";
  const absoluteApi = (path) => `${apiBaseUrl}${path}`;

  document.documentElement.classList.add("sonic-ios-app", "app-store-mode");

  window.SONIC_SEARCH_IOS_APP = true;
  window.SONIC_SEARCH_APP_STORE_MODE = true;
  window.SONIC_SEARCH_DISABLE_ANALYTICS = true;
  window.loadSonicAnalytics = function noopSonicIosAnalytics() {};
  window.SONIC_SEARCH_IOS_CONFIG = {
    ...(window.SONIC_SEARCH_IOS_CONFIG || {}),
    appStoreMode: true,
    autoEnterDiscovery: false,
    showAuthOnBoot: true,
    hideSocialLogin: false,
    disableSupportPayments: true,
    disableSocialComments: false
  };
  window.SONIC_SEARCH_API_BASE_URL = apiBaseUrl;
  window.SONIC_SEARCH_NATIVE_REDIRECT_URL = "sonicsearch://auth/callback";

  window.SONIC_SEARCH_ACCESS_CONFIG = {
    ...(window.SONIC_SEARCH_ACCESS_CONFIG || {}),
    freeDiscoveryLimit: 0,
    betaGateEnabled: false,
    betaAccessCodes: ["SONIC-BETA"],
    betaAccessApiEndpoint: "",
    betaEventsEndpoint: ""
  };

  window.SONIC_SEARCH_AI_CONFIG = {
    ...(window.SONIC_SEARCH_AI_CONFIG || {}),
    dailyFreeDiscoveryLimit: 0
  };

  window.SONIC_SEARCH_SUPPORT_CONFIG = {
    ...(window.SONIC_SEARCH_SUPPORT_CONFIG || {}),
    paymentsEnabled: false,
    pix: {
      ...((window.SONIC_SEARCH_SUPPORT_CONFIG || {}).pix || {}),
      key: ""
    },
    bitcoin: {
      ...((window.SONIC_SEARCH_SUPPORT_CONFIG || {}).bitcoin || {}),
      address: "",
      lightning: "",
      uri: ""
    }
  };

  window.SONIC_SEARCH_AUTH_CONFIG = {
    ...(window.SONIC_SEARCH_AUTH_CONFIG || {}),
    googleClientId: "",
    appleClientId: "",
    appleRedirectURI: ""
  };

  window.SONIC_INTEGRATION_HEALTH_API_URL = absoluteApi("/api/integration-health");
  window.SONIC_TRACK_METADATA_API_URL = absoluteApi("/api/track-metadata");
  window.SONIC_COVER_ART_API_URL = absoluteApi("/api/cover-art");
  window.SONIC_ARTIST_PROFILE_API_URL = absoluteApi("/api/artist-profile");
  window.SONIC_LASTFM_ARTIST_API_URL = absoluteApi("/api/lastfm-artist");
  window.SONIC_RADIO_BROWSER_API_URL = absoluteApi("/api/radio-browser");
  window.SONIC_SOUNDCLOUD_SEARCH_API_URL = absoluteApi("/api/soundcloud-search");
  window.SONIC_YOUTUBE_SEARCH_API_URL = absoluteApi("/api/youtube-search");
  window.SONIC_TICKETMASTER_EVENTS_API_URL = absoluteApi("/api/ticketmaster-events");
  window.SONIC_NEWS_FEED_API_URL = absoluteApi("/api/news-feed");
  window.SONIC_NEWSROOM_API_URL = absoluteApi("/api/news-editor");
  window.SONIC_SOCIAL_COMMENTS_API_URL = absoluteApi("/api/comments");

  window.NEONPULSE_ARTIST_BIO_URL = absoluteApi("/api/artist-bio");
  window.NEONPULSE_TRACK_AI_URL = absoluteApi("/api/track-insight");
  window.NEONPULSE_NEWS_TRANSLATE_API_URL = absoluteApi("/api/news-translate");
  window.NEONPULSE_IMAGE_API_URL = absoluteApi("/api/spirit-image");
})();
