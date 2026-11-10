# Catalog counts shown on entry

The beta entry page previously displayed historical and projected figures (98k searchable, 16,484 audited, 5,179 indexed artists). Those figures do not describe the current bundled recommendation catalog or prove available audio.

The build now derives the entry counts from the actual runtime rows. It deduplicates artist/title pairs across style shards while retaining named versions and publishes the counts in the runtime manifest and HTML together. The current build has 9,147 distinct artist/title pairs across 169 styles (9,611 style-specific rows). It labels them as cataloged tracks and explains that style and audio confirmation vary by track. These counts describe metadata coverage, not available recommendations for a particular set of filters.

Displayed numbers use the selected interface language. A regression recomputes all shard counts independently and checks the generated HTML and manifest, so future catalog builds cannot quietly retain an obsolete projected total.

Validation: `node scripts/test-published-catalog-counts.mjs`.
