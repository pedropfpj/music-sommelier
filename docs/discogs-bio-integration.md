# Discogs Bio Enrichment

Sonic Search uses Discogs as a verification/enrichment layer for artist bios. It is intentionally combined with MusicBrainz, official links, track metadata, and the local catalog instead of being treated as the only truth.

## Vercel Environment Variable

Discogs is opt-in. Enable it only after the project has accepted the provider terms and owns the token.

Add these variables to Production and Preview:

```txt
SONIC_DISCOGS_ENABLED=true
DISCOGS_USER_TOKEN=your_discogs_personal_access_token
```

Optional alias also works:

```txt
DISCOGS_TOKEN=your_discogs_personal_access_token
```

Useful defaults:

```txt
SONIC_ARTIST_BIO_ENABLED=true
SONIC_AI_BIO_DAILY_LIMIT=18
SONIC_ARTIST_BIO_REFERENCE_CACHE_SECONDS=86400
SONIC_REFERENCE_USER_AGENT=SonicSearch/1.0 (+https://sonicsearch.app)
```

## Runtime Flow

1. `/api/artist-bio` receives the current track and local context.
2. The route looks up the artist on Discogs only when `SONIC_DISCOGS_ENABLED=true` and a token is available.
3. The route looks up the artist on MusicBrainz for identity, area/country, and tags when `SONIC_MUSICBRAINZ_ENABLED=true`.
4. OpenAI writes a short bio using only the provided metadata and verified snippets.
5. The API returns `sources`, `sourceDetails` and `attribution`; the app displays source names and points the Discogs panel to the matched artist profile when available.

`/api/integration-health` reports the current `artistBio` state, including whether Discogs is configured/enabled and which cache/User-Agent settings are active.

## Why This Is Safer

Discogs is strong for aliases, real names, groups, memberships, and discography clues. MusicBrainz is useful for identity, country/area, artist type, and tags. The local catalog still owns the recommendation context, so an artist with a broad catalog will not be forced into the selected subgenre unless the track itself fits.
