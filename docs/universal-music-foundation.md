# Sonic Search universal music foundation

## Product decision

Sonic Search should not ask a new listener to browse hundreds of genres. The
first layer is a small set of musical universes; the Sonic DNA keeps the deeper
genre, artist, mood, context and novelty signals underneath. A listener can
start with one universe and expand later without rebuilding the profile.

The 13 initial universes are:

1. Electronic
2. Pop
3. Rock & metal
4. Hip-hop & rap
5. R&B, soul & funk
6. Brazilian music
7. Latin & Caribbean
8. Classical & opera
9. Jazz & blues
10. Reggae & dub
11. African & global
12. Folk, country & traditional
13. Ambient, experimental & scores

This is not a claim that music fits into only 13 boxes. It is a low-friction
entry layer. Recordings may carry several genre assertions and artist roles.
Classical music separates a work from its recordings so composer, conductor,
orchestra and performance are not collapsed into one generic artist field.

## What is implemented

- Shared browser/server taxonomy and a genre-agnostic candidate ranker.
- Sonic DNA schema v2 with universe weights and backward-compatible electronic defaults.
- Universal Supabase schema for artists, works, recordings, genres, provider links, evidence and quarantine.
- Locale-aware aliases, including separate meanings for funk and funk brasileiro.
- Read-only taxonomy and catalog APIs with rate limits, RLS and safe empty fallbacks.
- Existing verified electronic catalog migration into the universal model.
- Web, iPhone and Android bundles include the same universal runtime.

## Safe rollout order

1. Apply `supabase/migrations/20260911000100_universal_music_foundation.sql`.
2. Keep `SONIC_UNIVERSAL_CATALOG_ENABLED=false`.
3. Import a small reviewed pilot for each universe, with playable official provider links.
4. Reject or quarantine ambiguous identity, genre and rights data.
5. Run catalog, playback, mobile and recommendation tests.
6. Enable the universal catalog API in Preview only.
7. Add the progressive universe selector to onboarding and profile.
8. Release to Production after the pilot passes quality targets.

Do not expose an empty universe. A universe becomes selectable only when it has
enough diverse, playable and reviewed recordings. The current electronic
experience remains the production fallback throughout the rollout.

## Catalog quality gate

A public recommendation must have:

- canonical artist and recording identity;
- at least one verified genre assertion;
- at least one active HTTPS provider link;
- recommendable status for both recording and primary artist;
- no unresolved quarantine issue;
- artist diversity limits in the resulting recommendation list.

Billing is unrelated to this migration and remains disabled until the separate
Stripe/App Store subscription work is legally, fiscally and technically ready.
