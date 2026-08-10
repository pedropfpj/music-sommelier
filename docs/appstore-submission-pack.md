# Sonic Search App Store Submission Pack

Date: 2026-08-10

## App Store Connect Metadata

- App name: Sonic Search
- Bundle ID: app.sonicsearch.ios
- SKU: sonic-search-ios
- Version: 1.0.7
- Build: 21
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

Descubra faixas e DJs, acompanhe notícias e conversas da cena eletrônica e receba recomendações mais rápidas com filtros por estilo, BPM, energia e momento.

### Description

O Sonic Search é um radar de descoberta para quem vive música eletrônica — de ouvintes curiosos a DJs e selectors.

Encontre uma faixa para o momento, ouça o preview e use o swipe para curtir ou passar. O app aprende com as escolhas armazenadas no seu aparelho e refina as próximas recomendações sem exigir uma conta.

Com o Sonic Search, você pode:

- descobrir faixas por subgênero, BPM, energia, vocais e momento;
- encontrar DJs e selectors por intenção musical e ouvir sets públicos;
- acompanhar notícias da cena eletrônica e acessar as fontes originais;
- acompanhar conversas públicas da comunidade sobre faixas, DJs, festas e festivais;
- organizar curtidas, descartes e seu perfil musical local;
- abrir links oficiais para ouvir artistas e faixas nas plataformas disponíveis.

O Sonic Search não hospeda um catálogo próprio de streaming. Ele recomenda, contextualiza e direciona você a previews, sets e fontes oficiais quando disponíveis.

### Keywords

música eletrônica,techno,house,psytrance,DJ,sets,faixas,BPM,festivais,notícias

## English (U.S.)

### Subtitle

Electronic music discovery

### Promotional Text

Discover tracks and DJs, follow electronic music news and community conversations, and get faster recommendations with filters for style, BPM, energy, and mood.

### Description

Sonic Search is a discovery radar for electronic music listeners, DJs, and selectors.

Find a track for the moment, listen to a preview, then swipe to like or pass. The app learns from choices stored on your device and sharpens future recommendations without requiring an account.

With Sonic Search, you can:

- discover tracks by subgenre, BPM, energy, vocals, and mood;
- find DJs and selectors by musical intent and listen to public sets;
- follow electronic music news and open the original sources;
- follow public community conversations about tracks, DJs, parties, and festivals;
- organize likes, passes, and your local music profile;
- open official links to hear artists and tracks on available platforms.

Sonic Search does not host its own streaming catalog. It recommends, adds context, and links to previews, sets, and official sources when available.

### Keywords

electronic music,techno,house,psytrance,DJ,sets,tracks,BPM,festivals,news

## What's New

Portuguese (Brazil):

```text
As recomendações ficaram mais rápidas e estáveis, com uma primeira faixa local quando a rede demora, previews sem travar e um deck que evita repetir músicas já descartadas. Também melhoramos o Jornal Sonic, o catálogo eletrônico, a descoberta de DJs e a segurança da comunidade.
```

English:

```text
Recommendations are now faster and more stable, with a local first track when the network is slow, previews that no longer get stuck, and a deck that avoids tracks you already passed. We also improved Sonic Journal, the electronic catalog, DJ discovery, and community safety.
```

## Release Gate

Do not submit a build that exposes Google login unless Sign in with Apple is also enabled and verified.

Verified on 2026-08-10:

- Google OAuth through Supabase redirects correctly.
- Sign in with Apple through Supabase redirects correctly.
- The iOS callback uses the registered `sonicsearch://auth/callback` URL and PKCE.
- Build 21 is the current release candidate. Build 20 remains superseded after build 21 is uploaded.

## Review Notes

Sonic Search for iOS is a complete discovery experience and does not require login.

Reviewer flow:

1. Open the app.
2. The access screen appears with Apple, Google, and "Entrar sem login" / "Continue without login".
3. Choose "Entrar sem login" / "Continue without login" to review the full app without a demo account, or use either configured provider to test optional synchronization.
4. Use "Outra faixa" / "Another track" to generate a recommendation.
5. Use "Curti" / "Like" or "Não curti" / "Not for me" to train the local profile.
6. Open "DJs" to test musical-intent set discovery.
7. Open "Filtros" / "Filters" to test subgenre, BPM, and moment filters.
8. Open "Notícias" / "News" to review source links.
9. Open "Comunidade" / "Community" to browse public conversations. After signing in with Apple or Google, users can publish, comment, and react.
10. Open "Perfil" / "Profile" to review the local music profile.

Important:

- No demo account is required.
- Apple and Google login are available. Signed-in users can publish, comment, and react in Community.
- User-generated content is filtered before publication. Every post and comment from another user offers Report and Block controls. Reports are saved in the private moderation store and notify the moderation contact; blocking immediately hides that user's posts and comments.
- The public Contact screen publishes the support channel for safety and moderation requests.
- In-app payments, Pix, crypto, subscriptions, and paid digital unlocks are disabled in the iOS build.
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
- Usage Data: Reactions, likes, blocks, synced preferences, and feature interaction may be stored or appear in backend logs. Purposes: App Functionality and Safety. Account activity is linked when the user is signed in. Not used for tracking.
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
- Keep the beta gate, Pix, crypto, and paid digital unlocks disabled in the iOS bundle. Keep Apple/Google login and the moderated Community enabled.

## Screenshots To Capture

- Portuguese and English sets for iPhone 6.9", iPhone 6.5", and iPad 13".
- Storefront order: discovery with Like/Not for me actions, News, Profile, Community, and DJ intent discovery.
- Use fully localized Portuguese (Brazil) and English (U.S.) sets with the same five-screen order.

## Final Local Checks

```bash
pnpm run check
pnpm run ios:copy
xcodebuild -project ios/App/App.xcodeproj -scheme App -configuration Release -destination 'generic/platform=iOS' -derivedDataPath /tmp/sonic-ios-release-build build
xcodebuild -project ios/App/App.xcodeproj -scheme App -configuration Release -destination 'generic/platform=iOS' -archivePath /tmp/SonicSearch-AppStore-1.0.7-21.xcarchive archive
```

Universal iPhone/iPad confirmation:

```bash
grep -n "TARGETED_DEVICE_FAMILY" ios/App/App.xcodeproj/project.pbxproj
plutil -p ios/App/App/Info.plist | grep -A4 "UISupportedInterfaceOrientations~ipad"
```

Upload still requires an Apple Developer account with App Store Connect provider access, an Apple Distribution certificate, and an App Store provisioning profile for `app.sonicsearch.ios`.
