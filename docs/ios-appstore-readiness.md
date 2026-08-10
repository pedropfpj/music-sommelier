# Sonic Search iOS / App Store Readiness

Data: 2026-07-29

## Estado atual

- Projeto iOS criado em `ios/App/App.xcodeproj` com Capacitor.
- Bundle web do app gerado por `scripts/build-ios-web.mjs` em `www/`.
- `cap sync ios` executado com sucesso.
- AppIcon e Splash nativos foram atualizados com os assets do Sonic Search.
- Chamadas `/api/*` no runtime iOS apontam para `https://sonicsearch.app`.
- Rotas serverless precisam aceitar `capacitor://localhost` e `ionic://localhost` em CORS para Noticias, Comunidade, Comentarios e APIs opcionais funcionarem no WebView.
- Páginas legais adicionadas para produção e bundle iOS: `/privacy.html`, `/terms.html` e `/cookies.html`.
- Vercel Insights fica opt-in no site e desativado no bundle iOS da App Store, sem prompt de cookies/analytics no app.
- `scripts/build-ios-web.mjs` agora detecta assets `dataless` do macOS/iCloud antes de copiar, evitando builds pendurados quando arquivos ainda não foram materializados localmente.
- Artefatos locais de build do Xcode/SPM ficam ignorados em `.gitignore` e `ios/.gitignore` (`ios/App/build/` e `ios/App/CapApp-SPM/build/`).
- Build iOS em iPhone físico validado via `xcodebuild` + `xcrun devicectl`.
- Runtime iOS tem modo App Store: mostra primeiro a tela de acesso com Apple, Google e perfil local opcional, sem beta gate e sem Pix/crypto dentro do app.
- Modo App Store remove banner de cookies/analytics, esconde ribbon beta, Estúdio e qualquer UI de apoio financeiro, mantendo login Apple/Google e Comunidade moderada habilitados.
- App Tracking Transparency não é solicitado porque o iOS 1.0 não usa IDFA, SDKs de anúncios, Vercel Insights, cookies de tracking, domínios de tracking ou mensuração cross-app/cross-site.
- Target iOS ajustado para universal (`TARGETED_DEVICE_FAMILY = "1,2"`) para disponibilizar no iPhone e no iPad.
- O Estúdio está temporariamente desativado no runtime iOS e `NSMicrophoneUsageDescription` foi removido enquanto o recurso não estiver disponível.
- Textos legais foram limpos para submissão pública: sem produto beta, sem promessa premium e sem Pix/crypto na versão iOS.
- `docs/appstore-submission-pack.md` reúne metadata, review notes, privacy worksheet e checklist de envio.
- Perfil ganhou ação explícita para apagar dados deste aparelho.
- `PrivacyInfo.xcprivacy` foi adicionado ao target iOS.
- iPhone e iPad ficam restritos a orientação retrato com `UIRequiresFullScreen=true` para evitar layout não revisado em landscape na primeira submissão universal.

## Comandos principais

Depois de instalar/ativar Node no shell:

```bash
pnpm install
pnpm run ios:sync
open ios/App/App.xcodeproj
```

Se preferir npm:

```bash
npm install
npm run ios:sync
open ios/App/App.xcodeproj
```

Se o build web avisar sobre assets `dataless`, materialize os arquivos do banco de imagens e rode de novo:

```bash
brctl download assets/image-bank assets/image-bank-share.zip
pnpm run ios:sync
```

Se `cap sync ios` ficar pendurado em um workspace sincronizado pelo iCloud, verifique se `node_modules` foi descarregado:

```bash
find node_modules -flags +dataless -print | wc -l
rm -rf node_modules
pnpm install
pnpm run ios:sync
```

## Validação local

Último fluxo validado em aparelho físico:

```bash
node scripts/build-ios-web.mjs
node scripts/copy-ios-native.mjs
xcodebuild -project ios/App/App.xcodeproj -scheme App -configuration Debug -destination 'id=00008110-000138800E46201E' -derivedDataPath /tmp/sonic-ios-build build
xcrun devicectl device install app --device 00008110-000138800E46201E /tmp/sonic-ios-build/Build/Products/Debug-iphoneos/App.app --timeout 120
xcrun devicectl device process launch --device 00008110-000138800E46201E --terminate-existing app.sonicsearch.ios
```

Bundle ID atual: `app.sonicsearch.ios`.

## Confirmações no Xcode

- Team: selecionar a conta Apple Developer correta.
- Bundle Identifier: confirmar ou trocar `app.sonicsearch.ios`.
- Display Name: `Sonic Search`.
- Version: começar em `1.0`.
- Build: começar em `1`.
- Devices: Universal (iPhone e iPad).
- Signing: usar automatic signing para TestFlight.
- Testar em iPhone e iPad real ou simulador iPad, especialmente áudio de previews, links externos, swipe, notícias, perfil local, apagar dados e contato.

## Confirmações no Vercel

- `SONIC_REQUIRE_BETA_ACCESS_FOR_APIS=false` para o runtime publico da App Store. Se ficar true em producao, o iOS recebe `401 beta_access_required` em rotas como metadata, capa, perfil, radio e catalogo extra.
- `SONIC_NATIVE_APP_ALLOWED_ORIGINS=capacitor://localhost,ionic://localhost`.
- `SONIC_MUSIC_ALLOWED_ORIGINS` deve conter `https://sonicsearch.app`, `https://www.sonicsearch.app`, `capacitor://localhost` e `ionic://localhost`.
- `SONIC_AI_ALLOWED_ORIGINS` deve conter os mesmos dominios quando traduçao de noticias, bio IA ou arte IA estiverem ligados.
- Depois do deploy das variaveis, rode `pnpm run appstore:smoke https://sonicsearch.app` e confirme que nao ha falha obrigatoria. Mantenha APIs caras de IA com limites diarios/durable store ou desligadas se nao forem parte do 1.0.

## App Store Connect

Antes de enviar para review:

- Criar o app no App Store Connect com o mesmo Bundle ID.
- Preencher Privacy Policy URL com `https://sonicsearch.app/privacy.html` e Support URL com `https://sonicsearch.app/`.
- Preencher App Privacy com dados usados por APIs remotas, contato/suporte opcional, diagnóstico/logs e integrações. Marcar Tracking como No.
- Usar `docs/appstore-submission-pack.md` como base para descrição, keywords, review notes e App Privacy.
- Preparar screenshots iPhone e iPad.
- Revisar copy da descrição, categoria e keywords.
- Evitar prometer streaming próprio: o app recomenda e linka para plataformas oficiais.
- Se premium ou recursos digitais pagos entrarem no app, configurar In-App Purchase antes de submeter.
- Em Review Notes, explicar que a tela de acesso aparece ao abrir, mas o perfil local continua disponível sem login obrigatório.
- Em Review Notes ou resposta à revisão 5.1.2(i), explicar que o iOS não coleta cookies para tracking e que o prompt de cookies/analytics foi removido do bundle.

## Riscos para primeira review

- App Store pode rejeitar app que pareça somente um site em WebView. Para reduzir risco, manter navegação mobile polida, ícone/splash nativos, compartilhamento, persistência local e fluxo de descoberta direto.
- Login Apple/Google, comunidade e comentários ficam visíveis no runtime iOS; manter Supabase, callback nativo, moderação, denúncia/bloqueio e exclusão de conta verificados antes de cada envio.
- O app usa APIs remotas; manter `https://sonicsearch.app` e rotas serverless ativos durante TestFlight e review.
- Se doações, assinatura, premium ou recursos digitais pagos entrarem no iOS, revisar Apple In-App Purchase antes de reativar qualquer pagamento no app.

## Referências Apple

- App Review Guidelines: https://developer.apple.com/app-store/review/guidelines/
- App Privacy Details: https://developer.apple.com/app-store/app-privacy-details/
- Manage app privacy: https://developer.apple.com/help/app-store-connect/manage-app-information/manage-app-privacy/
- Privacy manifest files: https://developer.apple.com/documentation/bundleresources/privacy-manifest-files
