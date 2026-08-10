# Sonic Search Google Play Release

## Build

- Package/application ID: `app.sonicsearch.android`
- Version name: `1.0.0`
- Version code: `1`
- Target SDK: `36`
- Min SDK: `24`
- Bundle: `reports/google-play/SonicSearch-GooglePlay-1.0.0-1.aab`
- Upload certificate: `reports/google-play/sonic-search-upload-cert.pem`

## Signing

The Android upload key was generated locally at:

- `android/keystores/sonic-search-upload.jks`
- `android/key.properties`

Both files are ignored by git. Keep a secure backup of them. Future Android updates should be signed with this same upload key unless Google Play App Signing is used to reset it.

## Play Console Notes

Use the `.aab` file when creating the first Google Play release. New personal developer accounts may need a closed test with at least 12 opted-in testers for 14 continuous days before production access. Organization accounts can have different verification requirements.
