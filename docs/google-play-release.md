# Sonic Search Google Play Release

Date: 2026-08-10

## Release build

- App name: Sonic Search
- Package/application ID: `app.sonicsearch.android`
- Version name: `1.0.0`
- Version code: `1`
- Target SDK: `36`
- Min SDK: `24`
- App Bundle: `reports/google-play/SonicSearch-GooglePlay-1.0.0-1.aab`
- SHA-256: `0a20b707939a8603e88b8ce18cb5d42f8c008b6ffc1afcd7c42692b7749c2990`
- Upload certificate: `reports/google-play/sonic-search-upload-cert.pem`

The release bundle passed Gradle compilation, release signing validation, unit tests, Android lint, API smoke tests, and an Android 16 emulator review. The signed bundle also passes `jarsigner -verify`. A self-signed upload certificate is expected for the local Google Play upload key; Google Play App Signing manages the distribution signing key after enrollment.

## Signing

The Android upload key is stored locally at:

- `android/keystores/sonic-search-upload.jks`
- `android/key.properties`

Both files are ignored by git. Keep a secure backup of them. Future Android updates must use this same upload key unless the key is reset through Google Play App Signing.

## Store listing — Portuguese (Brazil)

### App name

Sonic Search

### Short description

Descubra faixas, DJs e notícias da música eletrônica com contexto.

### Full description

O Sonic Search é um radar de descoberta para quem vive música eletrônica — de ouvintes curiosos a DJs e selectors.

Encontre uma faixa para o momento, ouça o preview e use o swipe para curtir ou passar. O app aprende com as escolhas armazenadas no seu aparelho e refina as próximas recomendações sem exigir uma conta.

Com o Sonic Search, você pode:

- descobrir faixas por subgênero, BPM, energia, vocais e momento;
- encontrar DJs e selectors por intenção musical e ouvir sets públicos;
- acompanhar o Jornal Sonic e outras notícias da cena eletrônica;
- participar de conversas públicas da comunidade após entrar com Apple ou Google;
- organizar curtidas, descartes e seu perfil musical;
- abrir fontes e links oficiais para ouvir artistas e faixas nas plataformas disponíveis.

O Sonic Search não hospeda um catálogo próprio de streaming. Ele recomenda, contextualiza e direciona você a previews, sets e fontes oficiais quando disponíveis.

### Category and contact

- Category: Music & Audio
- Privacy policy: https://sonicsearch.app/privacy.html
- Support website: https://sonicsearch.app/
- Support email: use the public address configured on the Contact screen and Play Console account

## Store assets

- App icon, 512 × 512 PNG with alpha: `reports/google-play/app-icon-512.png`
- Feature graphic, 1024 × 500 RGB PNG: `reports/google-play/feature-graphic-pt-BR.png`
- Five current phone screenshots, 1080 × 1920 RGB PNG: `reports/google-play/screenshots/pt-BR/`
  - Descobrir
  - DJs
  - Filtros
  - Jornal Sonic
  - Perfil

## Reviewer flow

Sonic Search is complete without an account.

1. Open the app and choose **Entrar sem login**.
2. Tap **Ouvir uma faixa** to open the first recommendation.
3. Use **Curti** or **Não curti** to train the local profile.
4. Open **DJs** to test selector discovery and public sets.
5. Open **Filtros** to test subgenre, BPM, energy, and listening-moment filters.
6. Open **Notícias** to review Jornal Sonic and source links.
7. Open **Perfil** to review the local music profile.
8. Apple and Google login are optional and enable publishing, comments, and reactions in Community.

No demo account, payment, subscription, microphone, precise location, contacts, photo library, or advertising identifier is required.

## Play Console notes

Use the `.aab` file for the first release. The bundle already targets API level 36, which satisfies Google Play's Android 16 target requirement effective August 31, 2026.

For personal developer accounts created after November 13, 2023, Google currently requires a closed test with at least 12 opted-in testers for 14 continuous days before applying for production access. Internal testing can begin without that production-access gate. Organization accounts follow their own identity-verification process.

Before rollout, complete the Play Console declarations for app access, ads, content rating, target audience, data safety, privacy policy, and account deletion where applicable. The Data safety answers must match the production privacy policy and the optional Apple/Google account and Community behavior.
