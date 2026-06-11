# Discogs Bio Enrichment

Sonic Search uses Discogs as a verification/enrichment layer for artist bios. It is intentionally combined with MusicBrainz, official links, track metadata, and the local catalog instead of being treated as the only truth.

## Vercel Environment Variable

Add this variable to Production and Preview:

```txt
DISCOGS_USER_TOKEN=your_discogs_personal_access_token
```

Optional alias also works:

```txt
DISCOGS_TOKEN=your_discogs_personal_access_token
```

## Runtime Flow

1. `/api/artist-bio` receives the current track and local context.
2. The route looks up the artist on Discogs when a token is available.
3. The route looks up the artist on MusicBrainz for identity, area/country, and tags.
4. OpenAI writes a short bio using only the provided metadata and verified snippets.
5. The app displays source names and points the Discogs panel to the matched artist profile when available.

## Why This Is Safer

Discogs is strong for aliases, real names, groups, memberships, and discography clues. MusicBrainz is useful for identity, country/area, artist type, and tags. The local catalog still owns the recommendation context, so an artist with a broad catalog will not be forced into the selected subgenre unless the track itself fits.
