# Sonic Search Improvement Layers - 2026-06-17

This plan separates improvements into isolated packages. Each package must enter alone, with its own validation, and must respect `docs/product-baseline-2026-06-17.md`.

## Rule For All Packages

Do not mix categories in the same pass. If a change starts as copy, it cannot quietly become a layout, recommendation, or refactor pass.

Every package must finish with:

1. Scope summary
2. Files changed
3. Validation run
4. Known risk, if any
5. Confirmation that baseline flows were not intentionally changed

## Package 1 - Copy And Musical Precision

Goal: make the app sound like a curator who understands each electronic subgenre.

Allowed:

1. Improve short UI phrases, card phrases, style explanations, and spirit descriptions.
2. Add style-specific copy where the app currently falls back to broad family copy.
3. Align Portuguese, English, and Spanish when the same text exists in all languages.
4. Add small helper maps only when needed to choose the correct copy.

Not allowed:

1. Changing recommendation scoring.
2. Changing layout or spacing.
3. Adding new visual components.
4. Renaming styles unless there is a clear bug.

Validation:

1. Run `node scripts/product-verify.mjs`.
2. Check `docs/style-bible-2026-06-17.md` before writing or approving style copy.
3. Search for mismatched language such as psycore using slow/soft copy.
4. Confirm style-specific copy wins over family fallback.

Priority styles:

1. Psycore
2. Dark psy
3. Hi-tech
4. Slambient
5. Prog dark / zenonesque
6. Techno
7. Hard techno
8. House / deep / afro
9. Drum and bass / neurofunk
10. Bass music

## Package 2 - Mobile Legibility

Goal: keep the current visual identity, but make the app easier to read and scan on phones.

Allowed:

1. Adjust font sizes, line heights, max widths, spacing, and wrapping.
2. Reduce crowding in dense panels.
3. Improve tap target spacing.
4. Fix clipped text, overlapping labels, and tiny metadata.

Not allowed:

1. Redesigning the full page.
2. Replacing the visual theme.
3. Moving major workflows to new screens.
4. Changing recommendation or copy logic except for text length needed to fit.

Validation:

1. Check mobile around `393 x 852`.
2. Check desktop around `1440 x 960`.
3. Confirm buttons, cards, quote text, and stats do not overlap.
4. Run `node scripts/product-verify.mjs --screenshots`.

Priority screens:

1. Spirit card / share card
2. Main discovery card
3. Profile summary
4. Preview area
5. Onboarding screens

## Package 3 - Onboarding And First Experience

Goal: make the first session feel guided without turning the app into a landing page.

Allowed:

1. Clarify the first action the user should take.
2. Reduce choices before the user reaches discovery.
3. Improve labels and sequence in intro, language, guide, and local profile flow.
4. Add lightweight empty states if they help the user move forward.

Not allowed:

1. Adding a marketing-style landing page.
2. Forcing login.
3. Hiding the main product behind too much explanation.
4. Changing core discovery behavior.

Validation:

1. Start from a clean local profile.
2. Reach the main discovery screen without confusion.
3. Like/dislike at least one track.
4. Confirm the app still works without login.

## Package 4 - Recommendation By Subgenre

Goal: improve trust by making recommendations match the selected niche more consistently.

Allowed:

1. Improve style evidence, artist anchors, and mismatch filters.
2. Add small verified seed data for weak subgenres.
3. Tune scoring only for specific documented failures.
4. Add test profiles for important styles.

Not allowed:

1. Broad scoring rewrites without measured failures.
2. Mixing recommendation work with visual redesign.
3. Removing fallback behavior that protects the user from empty results.
4. Trusting API genre labels blindly for niche psy styles.

Validation:

1. Test fixed profiles for psycore, dark psy, hi-tech, slambient, techno, house, and dnb.
2. Confirm recommendations are not generic family matches.
3. Confirm playable/preview behavior still works.
4. Record any intentional scoring change.

## Package 5 - Shareable Card

Goal: make the spirit/share card more legible, more accurate, and more desirable to post.

Allowed:

1. Improve text hierarchy inside the card.
2. Adjust quote length and wrapping.
3. Improve stat placement.
4. Improve exported/share image quality if needed.

Not allowed:

1. Changing the whole app layout.
2. Changing spirit selection logic.
3. Replacing the current premium/dark visual identity.
4. Adding unrelated sharing features.

Validation:

1. Generate a spirit card after 10 likes.
2. Check the card on mobile.
3. Check the exported/shared image.
4. Confirm copy matches the unlocked spirit.

## Package 6 - Technical Cleanup And Stability

Goal: reduce fragility without changing product behavior.

Allowed:

1. Extract small helpers when they reduce repeated logic.
2. Add checks around fragile flows.
3. Remove dead code only when clearly proven unused.
4. Improve naming where it reduces future mistakes.

Not allowed:

1. Large refactors without tests.
2. Behavior changes hidden as cleanup.
3. Removing fallbacks.
4. Formatting the entire file just for style.

Validation:

1. Run `node scripts/product-verify.mjs`.
2. Re-run the affected flow manually or with scripted checks.
3. Compare behavior against the baseline doc.

## Recommended Order

1. Copy and musical precision
2. Mobile legibility
3. Shareable card
4. Onboarding and first experience
5. Recommendation by subgenre
6. Technical cleanup and stability

Reason: copy and legibility have high product impact with low technical risk. Recommendation and cleanup are more sensitive and should happen after the visible experience is stable.
