# Recording-scoped genre evidence

The runtime catalog now imports six specific Apple Music recordings from the official Big Beat Essentials playlist and one Full-on Night recording tagged by its artist on Bandcamp. These recordings had no strictly confirmed candidates in the previous cold selection audit. This update supplies recording evidence without changing the genre of an artist's whole discography.

- Big Beat evidence: https://music.apple.com/us/playlist/big-beat-essentials/pl.78e98b7f1ea842dc807bd646ab37083e
- Full-on Night evidence: https://virtuallight.bandcamp.com/track/virtual-light-module-virus-extreme-transmission
- Selection observations and exact provider identities are stored in the two v26 selection JSON files. Six Apple previews were decoded and played in a real browser. The Bandcamp exact track embed and a bounded MPEG audio response were checked; this is not a claim of browser-decoded Bandcamp playback.

`reviewedRecordingStyleProof` requires an approved style, full artist credit, title including version, exact provider recording ID, source URL, evidence URL and checked provenance tags. It does not authorize another title, master or artist. Importing these rows skips artist-wide seeds and overrides. All candidate, cache, purge and presentation paths pass the recording to the existing artist gate; general artist-only classification stays unchanged.

The builder treats each reviewed recording as an atomic snapshot. A legacy duplicate cannot contribute a different provider ID, old preview or inferred BPM. Runtime import repairs a legacy duplicate with a new object while preserving the card already on screen. The existing no-repeat history remains intact. Missing BPM, vocals, energy and listening contexts stay unknown; an explicit BPM constraint excludes these unmeasured recordings.

The rebuilt catalog contains 9,611 rows across 169 styles, with 2,028 core rows. This is catalog coverage, not a guarantee that every row has working audio or equally strong subgenre evidence. The actual cold core/shard import, finalization, purge and picker regression delivers the six Big Beat artists once each and returns no result on exhaustion. It also exercises identity negatives, strict BPM rejection, atomic builder merges, cache replacement and reload.

Validation: `node scripts/test-reviewed-recording-catalog.mjs` and `node scripts/test-big-beat-editorial-recordings-v26.mjs`. The live evidence verifier is bounded and opt-in; routine tests use the stored observations instead of repeatedly calling providers.
