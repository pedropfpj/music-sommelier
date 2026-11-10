# Web discovery reliability and variety

Build: `20261110trust2`. Web only; no database schema change or native build.

This release combines catalog access fixes with recording-scoped musical evidence and clearer controls:

- Catalog Extra continues after filtered pages, resumes bounded partial loads and allows retry after transient failures. Completion reflects scanned source pages rather than the number of accepted tracks.
- Big Beat has six exact editorial recordings from six artists; Full-on Night has one exact artist-published recording. Artist-wide classification, strict BPM filters, curator blocks and no-repeat history remain enforced. A misclassified ambient recording is quarantined from psy recommendations without banning its artists.
- Missing vocal/context evidence remains unknown. Imported operational notes and album titles are not presented as artist biographies or record-label facts.
- Failed or exhausted searches preserve the current card and filters and provide retry/filter controls. A selected style gets an advance short-selection hint only after its local shard finishes loading; the hint counts confirmed eligible artists and does not guarantee audio availability.
- Recommendation explanations distinguish personal affinity, style evidence, BPM and audio state. Verified primary links appear in an accessible disclosure. No heuristic percentage is presented as calibrated certainty, and the ranking/model calculations are unchanged.
- “Revisar dados” records four local correction reasons, including wrong recording/version. It preserves playback, the current card and personal taste history; it reports storage failure honestly and does not claim submission to a moderation service.
- Entry coverage counts are generated from the current bundle: 9,147 distinct artist/title pairs across 169 styles (9,611 style-specific entries). This is metadata coverage, not a guarantee that all recordings have playable audio or equally strong classification evidence.
- Friends search invalidates stale results as the input changes. Replacing the chosen recording opens Discover while retaining the draft.

The six Apple preview samples were decoded and played in a native browser. An additional final UI check selected a reviewed Big Beat recording through the app’s controls and observed real native provider playback. Exact Apple refresh uses the known recording ID and cannot substitute a text-search result from another master.

For Full-on Night, a bounded 128 KiB sample freshly obtained from the official artist page was decoded and played. The app opened the exact Bandcamp embed and showed the expected title and eight-minute duration. Automated activation of the embedded native Play control was not established, so these observations do not assert complete embedded playback or playback of the entire recording.

Local verification includes the actual runtime catalog import/finalization/picker, identity negatives, strict BPM/history gates, pagination/resume, cached metadata migration, score equivalence against the prior implementation, source/minified UI in PT/EN/ES, keyboard/focus, decoded fixture audio and real media errors, correction persistence/account isolation, Friends end-to-end with local authentication/database fixtures, saved sync, weekly previews and responsive visual checks. Production verification separately compares the deployed assets, checks exact metadata lookup and public/guest flows. Release evidence is retained under the ignored `.vercel/trust-release-20261110/` directory; it is not bundled into the site.

The next proposed work is a direct artist/title/version search and expanding verified artist diversity in the styles with the shortest selections.
