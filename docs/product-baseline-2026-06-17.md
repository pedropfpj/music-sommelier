# Sonic Search Product Baseline - 2026-06-17

Baseline id: `product-good-state-2026-06-17`
Code anchor: git `b354474` plus current local working state at the time this baseline was written.
Validation run: `/Users/pedrofreire/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/bin/node --check app.js`
Result: passed.

## Purpose

This document freezes the current approved product direction before the next improvement passes. It is the reference for avoiding regressions while improving copy, mobile clarity, onboarding, recommendation precision, and sharing.

The user-approved state is: the app feels visually strong, the spirit card direction is right, and the next work should improve quality without disturbing what is already working.

## Product Pillars To Preserve

1. Sonic Search must feel like a real electronic music discovery app, not a marketing landing page.
2. The first meaningful experience should remain the usable product flow: discover, listen, swipe, like, dislike, and build taste.
3. The "espirito musical" feature is a core emotional reward, not a decorative extra.
4. The visual language should stay premium, dark, neon, underground, musical, and shareable.
5. The app must respect electronic subgenre culture. Generic copy is a product bug when it misrepresents a style.

## Locked User-Facing Flows

These flows are baseline behavior and should be checked after any future change:

1. Intro / language / local profile flow
2. Main discovery screen
3. Track preview and fallback links
4. Swipe actions for like and dislike
5. Profile library for liked and dismissed tracks
6. Spirit progress before 10 likes
7. Spirit reveal after 10 likes
8. Spirit card generation
9. Shareable link copy
10. Instagram/story sharing controls
11. Mobile layout for the card and main product screens
12. Desktop layout for the main product screens

## Visual Baseline

Preserve:

1. Dark electronic atmosphere with luminous accents.
2. Strong central artwork for the musical spirit.
3. Compact premium-card feeling for share artifacts.
4. High contrast on primary titles and core stats.
5. Dense but intentional product UI.

Improve carefully:

1. Small text legibility on mobile.
2. Crowded card areas when labels, stats, and quotes compete.
3. Button and panel hierarchy where the user has too many choices at once.

Avoid:

1. Replacing product screens with landing-page composition.
2. Flattening the identity into generic purple gradient UI.
3. Adding decorative elements that do not help music discovery or sharing.

## Musical Copy Baseline

The app should describe styles like a curator who knows the scene.

Psycore:

1. Correct signals: extreme BPM, dark weight, dry cuts, high pressure, physical intensity, controlled chaos.
2. Avoid: slow journey, "sem pressa", soft ritual language, generic psytrance language, clubby techno wording.

Dark psy:

1. Correct signals: nocturnal tension, closed forest, dark psychedelia, creatures, sub pressure, ritual density.
2. Avoid: sadness as the main mood, commercial trance language, bright euphoric language.

Hi-tech:

1. Correct signals: high speed, precision, hyperactive leads, clear edits, technical aggression.
2. Avoid: simply calling it "fast psytrance" without technical character.

Techno:

1. Correct signals: repetition, tension, firm pulse, club pressure, machine groove, hypnotic control, clean texture.
2. Avoid: psy ritual language unless the track is explicitly hybrid.

Slambient:

1. Correct signals: dark ambient pressure, slow/dense atmosphere when appropriate, shadow, texture, ritual space.
2. Avoid: making it sound like ordinary chillout or generic ambient.

## Regression Rules

A future change should be rejected or reworked if it:

1. Breaks `node --check app.js`.
2. Makes the app harder to use on mobile.
3. Makes the spirit card less legible or less shareable.
4. Uses a generic family description where a specific subgenre description exists.
5. Changes recommendation behavior while claiming to be only a visual or copy change.
6. Mixes unrelated refactors with product improvements.
7. Removes existing fallback behavior for previews, links, or sharing.

## Minimum Check Before Each Improvement Batch

Run:

```bash
node scripts/product-verify.mjs
```

This includes:

```bash
/Users/pedrofreire/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/bin/node --check app.js
```

When copy changes:

1. Search for banned or mismatched style language.
2. Check Portuguese first, then English and Spanish if the same user-facing text exists.
3. Confirm style-specific copy is chosen before family fallback copy.

When UI changes:

1. Check mobile around 393 x 852.
2. Check desktop around 1440 x 960.
3. Confirm no text overlap, no clipped button labels, and no card text fighting with stats.
4. Run `node scripts/product-verify.mjs --screenshots` to update `reports/ui-desktop-latest.png` and `reports/ui-mobile-latest.png`.
5. Add `--strict-screenshots` when screenshot failure should block publishing.

When recommendation changes:

1. Test at least one fixed profile for psycore, dark psy, techno, house, and slambient.
2. Confirm the selected spirit, card text, and recommended tracks stay culturally coherent.

## Change Protocol

Work in small batches:

1. One improvement category per pass.
2. No unrelated redesign during copy work.
3. No recommendation changes during layout work unless explicitly needed.
4. Keep each pass reversible.
5. Record what was validated before moving to the next pass.
