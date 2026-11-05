# Sonic Search App Store Submission Pack

Date: 2026-11-05

## Submission Status

- Public App Store version checked in App Store Connect on 2026-11-04: **1.0.9**, build **23**.
- Latest existing TestFlight build checked on 2026-11-04: **1.1.0 (24)**.
- Updated candidate: **1.1.0 (26)**, archived locally and code-signature verified. Its bundled JavaScript matches the reviewed iOS bundle (`20261105quality1ios1`). It has **not** been uploaded or submitted for review.
- Apple App ID: `6786758494`; bundle ID: `app.sonicsearch.ios`.
- On 2026-11-04, App Store Connect required the Account Holder to review and accept an updated Apple Developer Program License Agreement before updates can be submitted. Do not represent this as completed or accept it without the user's explicit confirmation at that step.
- The 2026-11-04 public smoke checks passed against `https://sonicsearch.app` using the native origin `capacitor://localhost`.
- Billing configuration and subscription products were not changed in this revision. Paid features remain disabled.
- **Not ready for submission:** the parallel track/video social work needs its staging activation and real-account checks before production. See [activation checklist](track-video-social-activation.md). No remote migration or production promotion was performed in this review.

## November release candidate

- Electronic-only interface, retaining the expansion of 69 electronic tracks and the saved-track library. The rock preview and install invitation are absent from the app interface.
- Discovery prioritizes ready local tracks before provider lookups. Both automatic discovery and the filtered selection/replacement flow share an eight-second provider-wait budget per request; individual waits are capped at 1.2 seconds. This budget applies to provider selection waits, not all rendering, CPU work or media loading.
- Explicit playback through native controls, the app's play button, or the saved library enables audio without raising the chosen volume. Automatic playback still respects mute; a zero volume is preserved.
- A completed search cannot hide the loading indicator of a newer search.
- The November 5 regression run and scope are recorded in [the quality review](discovery-quality-review-20261105.md). Browser checks are separate from automated API/SQL tests; simulated accounts are not a substitute for real authenticated staging checks.
- Browser review used the actual generated iOS web bundle at 390 and 320 px: no horizontal overflow, primary controls at least 44 px, saved likes preserved after reload, accent-insensitive search, library playback, native play/mute and the Premium collapse control verified. These are browser checks, not a claim of physical-device playback verification.
- Xcode Release archive succeeded. Simulator compilation was also exercised, but the Simulator app could not be opened through the available UI controls. Live Apple/Google account sign-in and StoreKit purchases were not repeated.

- November 5 adds 21 verified electronic recordings across Disco House, Future Bass, Minimal/Deep Tech, Tech Trance and Trap. The selection favors new artist credits in underrepresented styles.
- Automatic history now excludes recordings rather than every unrelated song with the same title. Explicit typed exclusions remain separate, with legacy values archived. Recording identifiers are used when present and do not inflate the discovery count.
- Artist collaboration aliases, explicit-filter continuity and the verified 130 BPM Minimal/Deep Tech boundary are corrected.

### What's New — Português (Brasil)

Mais variedade na música eletrônica, com novos artistas e faixas nos subgêneros de nicho.
Busca e organização das faixas salvas, com reprodução no app.
Melhorias nos controles de áudio e no tempo de espera da descoberta.
Histórico mais preciso e filtros preservados ao pedir outra faixa.

### What's New — English (U.S.)

More variety in electronic music, with new artists and tracks across niche styles.
Search and organize saved tracks, and listen again in the app.
Improved audio controls and bounded discovery waits.
More precise listening history and filters that stay selected when requesting another track.

### What's New — Español

Más variedad en música electrónica, con nuevos artistas y pistas en estilos de nicho.
Busca y organiza tus pistas guardadas y vuelve a escucharlas en la app.
Mejoras en los controles de audio y en los tiempos de espera al descubrir música.
Historial más preciso y filtros que se mantienen al pedir otra pista.

The listing drafts below must be reconciled with the public metadata and approved screenshots before store edits. Paid subscriptions are not advertised in this candidate. Social capabilities must pass the staging gate before any related claims are included.

## App Store Connect Metadata

- App name: Sonic Search
- Bundle ID: app.sonicsearch.ios
- SKU: sonic-search-ios
- Version: 1.1.0
- Build: 26
- Primary category: Music
- Secondary category: Entertainment
- Age rating suggestion: 12+
- Privacy Policy URL: https://sonicsearch.app/privacy.html
- Support URL: https://sonicsearch.app/
- Marketing URL: https://sonicsearch.app/

## Portuguese (Brazil)

### Subtitle

Descubra música eletrônica

### Promotional Text

Descubra música eletrônica além do óbvio. Explore subgêneros, ouça prévias e reencontre suas faixas favoritas em uma biblioteca pesquisável.

### Description

O Sonic Search é um radar de descoberta para quem vive música eletrônica — de ouvintes curiosos a DJs e selectors.

Encontre uma faixa para o momento, ouça o preview e use o swipe para curtir ou passar. O app aprende com as escolhas armazenadas no seu aparelho e refina as próximas recomendações sem exigir uma conta.

Com o Sonic Search, você pode:

- descobrir faixas por subgênero, BPM, energia, vocais e momento;
- encontrar DJs e selectors por intenção musical e ouvir sets públicos;
- acompanhar notícias da cena eletrônica e acessar as fontes originais;
- organizar curtidas, descartes e seu perfil musical local;
- abrir links oficiais para ouvir artistas e faixas nas plataformas disponíveis.

O Sonic Search não hospeda um catálogo próprio de streaming. Ele recomenda, contextualiza e direciona você a previews, sets e fontes oficiais quando disponíveis.

### Keywords

música eletrônica,techno,house,psytrance,DJ,sets,faixas,BPM,festivais,notícias

## English (U.S.)

### Subtitle

Electronic music discovery

### Promotional Text

Discover electronic music beyond familiar names. Explore subgenres, listen to previews, and revisit your favorites in a searchable library.

### Description

Sonic Search is a discovery radar for electronic music listeners, DJs, and selectors.

Find a track for the moment, listen to a preview, then swipe to like or pass. The app learns from choices stored on your device and sharpens future recommendations without requiring an account.

With Sonic Search, you can:

- discover tracks by subgenre, BPM, energy, vocals, and mood;
- find DJs and selectors by musical intent and listen to public sets;
- follow electronic music news and open the original sources;
- organize likes, passes, and your local music profile;
- open official links to hear artists and tracks on available platforms.

Sonic Search does not host its own streaming catalog. It recommends, adds context, and links to previews, sets, and official sources when available.

### Keywords

electronic music,techno,house,psytrance,DJ,sets,tracks,BPM,festivals,news

## Release Gate

Do not submit a build that exposes Google login unless Sign in with Apple is also enabled and verified.

Verified on 2026-08-11:

- Google OAuth through Supabase redirects correctly.
- Sign in with Apple through Supabase redirects correctly.
- The iOS callback uses the registered `sonicsearch://auth/callback` URL and PKCE.
- Build 26 is the current local candidate for version 1.1.0; build 24 was the latest TestFlight upload checked on November 4. Version 1.0.9 was the approved release at that check. This candidate has not been uploaded.

## Review Notes

Sonic Search for iOS is a complete discovery experience and does not require login.

Reviewer flow:

1. Open the app.
2. The access screen appears with Apple, Google, and "Entrar sem login" / "Continue without login".
3. Choose "Entrar sem login" / "Continue without login" to review the full app without a demo account, or use either configured provider to test optional synchronization.
4. Use "Outra faixa" / "Another track" to generate a recommendation.
5. Use "Curti" / "Like" or "Não curti" / "Not for me" to train the local profile.
6. Open "DJs" to test musical-intent set discovery.
7. Open "Ajustar descoberta" / "Adjust discovery" to test subgenre, BPM, and moment filters. Request another track and confirm that the explicit filters are retained.
8. Open "Notícias" / "News" to review source links.
9. Open "Minhas faixas" / "My tracks", search a saved artist or song, and replay it.
10. Open "Perfil" / "Profile" to review the local music profile.
11. Reopen the app and confirm saved likes remain. Authenticated social review steps are pending the staging activation gate; do not submit this draft yet.

Important:

- Core discovery and the local library can be reviewed without an account. Paid subscriptions are disabled and must not be described as available for purchase.
- Apple/Google sign-in and real-account social behavior must be verified in the final production candidate; the older sign-in evidence above does not replace that check.
- User-generated content is filtered before publication. Every post and comment from another user offers Report and Block controls. Reports are saved in the private moderation store and notify the moderation contact; blocking immediately hides that user's posts and comments.
- The public Contact screen publishes the support channel for safety and moderation requests.
- StoreKit integration is retained but subscriptions are disabled. The iOS build does not offer Pix, crypto, tips, Stripe checkout, or another external purchase method.
- App Tracking Transparency is not shown because the iOS build does not track users. It does not use IDFA, ad SDKs, advertising cookies, tracking cookies, tracking domains, Vercel Insights, or cross-app/cross-site advertising measurement.
- The app uses remote APIs at https://sonicsearch.app for metadata, news, covers, AI text/image features, and optional enrichment. Backend services must remain live during review.
- Studio is temporarily unavailable in this build, and the app does not request microphone access.
- Sonic Search is not a streaming service; it recommends and links to official listening sources.

Response for Guideline 5.1.2(i):

```text
Hello App Review,

We do not collect cookies for tracking purposes on Apple devices. The iOS build has been updated to remove the cookie/analytics prompt, disable Vercel Insights, and clarify in the Privacy Policy and Cookie Policy that the App Store build does not use IDFA, ad SDKs, advertising cookies, tracking cookies, tracking domains, or cross-app/cross-site advertising measurement.

Any local storage or essential cookies are used only for app functionality, security, preferences, local music profile, and abuse prevention. The app does not link app data with third-party data for targeted advertising or advertising measurement, and does not share data with data brokers. For this reason, App Tracking Transparency is not requested.
```

## App Privacy Answers Draft

Use this as the App Store Connect privacy worksheet, then verify against current production backend settings.

- Tracking: No.
- Data linked to the user: An account is optional. When a user signs in, the account profile, Community content, reactions, reports, blocks, and synced preferences are linked to that account.
- Contact Info: Name and email are collected for optional Apple/Google account login and may also be provided in support requests. Purposes: App Functionality and Customer Support. Linked to the user. Not used for tracking.
- User Content: Community posts, comments, moderation reports, and optional support messages. Purposes: App Functionality, Safety, and Customer Support. Community and moderation content are linked to the signed-in user. Not used for tracking.
- Identifiers: Internal user ID for authentication, account security, Community ownership, moderation, and synchronization. Purpose: App Functionality. Linked to the user. Not used for tracking.
- Purchases: Disabled in this release candidate. Reconcile privacy answers against any previously retained transactions and the production backend; do not infer data deletion from disabled billing.
- Usage Data: Reactions, likes, blocks, Daily Radar feedback/history, synced preferences, and feature interaction may be stored or appear in backend logs. Purposes: App Functionality and Safety. Account activity is linked when the user is signed in. Not used for tracking.
- Diagnostics: Error/performance logs may be collected by hosting/backend providers. Purposes: App Functionality. Not used for tracking.
- Search/Browsing style data: Music query context such as artist, track, style, BPM, and selected filters may be sent to backend APIs to provide recommendations and metadata. Purpose: App Functionality.
- Audio Data: No. Studio is unavailable in this build and microphone permission is not declared.
- Precise Location: No.
- Contacts: No.
- Photos/Videos: No.
- Advertising Data: No.
- IDFA/Tracking permission: No.

## Backend Readiness

- Keep https://sonicsearch.app live during review.
- Set `SONIC_REQUIRE_BETA_ACCESS_FOR_APIS=false` for the public App Store runtime; otherwise native iOS requests can return `401 beta_access_required` for discovery enrichment routes.
- Configure allowed origins for the iOS WebView:
  - capacitor://localhost
  - ionic://localhost
- Ensure music/news/AI routes accept the native origin and return stable JSON.
- Run `pnpm run appstore:smoke https://sonicsearch.app` after the production environment change and before submitting.
- Keep the beta gate, billing, Pix, crypto, tips, and Stripe checkout disabled in the iOS bundle. Do not activate social APIs until the migration, legacy-data reconciliation and real-account staging checks are complete.

## Future subscription work — outside this release

This historical plan is not authorization to activate purchases or create products. It is not a submission requirement while subscriptions remain disabled.

### Future verification

- Create one auto-renewable subscription group in App Store Connect.
- Create `app.sonicsearch.ios.premium.monthly` and `app.sonicsearch.ios.premium.yearly` with localized name, description and selected price.
- Configure a **2-week free-trial introductory offer** on both products. Apple enforces one introductory offer per eligible customer in the subscription group.
- Launch prices: EUR 2.99 monthly / EUR 24.99 yearly; BRL 9.90 monthly / BRL 79.90 yearly; USD 2.99 monthly / USD 24.99 yearly, using the closest available App Store price points.
- Add the Terms of Use and Privacy Policy links to the subscription metadata and app listing.
- Configure App Store Server Notifications V2 for sandbox and production at `https://sonicsearch.app/api/webhooks/apple`.
- Apple App ID `6786758494` is configured in Vercel; keep `SONIC_BILLING_ENABLED=false` until sandbox verification passes.
- Test purchase, pending approval, restore, cancellation, renewal, expiration and refund with sandbox accounts.
- Add an active sandbox review account and precise Premium navigation steps to App Review Information.
- The first subscription must be selected in the app version submission before sending the build for review.

## Screenshots To Capture

- Portuguese and English sets for iPhone 6.9", iPhone 6.5", and iPad 13".
- Proposed storefront order: discovery with Like/Not for me actions, searchable saved library, precision filters, DJ discovery, and electronic news. Do not use Rock or inactive paid/social features in the screenshots.
- Use fully localized Portuguese (Brazil) and English (U.S.) sets with the same five-screen order.

## Final Local Checks

```bash
pnpm run check
pnpm run ios:copy
xcodebuild -project ios/App/App.xcodeproj -scheme App -configuration Release -destination 'generic/platform=iOS' -derivedDataPath /tmp/sonic-ios-release-build build
xcodebuild -project ios/App/App.xcodeproj -scheme App -configuration Release -destination 'generic/platform=iOS' -archivePath reports/app-store-build/SonicSearch-AppStore-1.1.0-26.xcarchive archive
```

Universal iPhone/iPad confirmation:

```bash
grep -n "TARGETED_DEVICE_FAMILY" ios/App/App.xcodeproj/project.pbxproj
plutil -p ios/App/App/Info.plist | grep -A4 "UISupportedInterfaceOrientations~ipad"
```

Upload still requires an Apple Developer account with App Store Connect provider access, an Apple Distribution certificate, and an App Store provisioning profile for `app.sonicsearch.ios`.
