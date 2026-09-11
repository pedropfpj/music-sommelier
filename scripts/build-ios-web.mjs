import { copyFile, cp, mkdir, readFile, rm, writeFile } from "node:fs/promises";
import { spawnSync } from "node:child_process";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { minifyCss, minifyJavaScript } from "./web-build-utils.mjs";
import { buildRuntimeCatalog } from "./build-runtime-catalog.mjs";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const rootDir = path.resolve(__dirname, "..");
const webDir = path.join(rootDir, "www");
const apiBaseUrl = "https://sonicsearch.app";
const runtimeScriptName = "sonic-ios-runtime.js";
const appStoreBuildId = "20260911reliability1ios1";
const iosRuntimeAssetNames = [
  "styles.min.css",
  "daily-djs.css",
  "daily-radar.css",
  "catalog-runtime.min.js",
  "daily-djs.js",
  "daily-djs-ui.js",
  "daily-radar.js",
  "daily-radar-ui.js",
  runtimeScriptName,
  "app.min.js"
];
const appStoreModeCss = `
html.app-store-mode #authSocialDivider,
html.app-store-mode #authGoogleNativeSlot,
html.app-store-mode #betaTesterRibbon,
html.app-store-mode [data-privacy-settings],
html.app-store-mode [data-app-tab-target="studio"],
html.app-store-mode [data-app-tab~="studio"],
html.app-store-mode .support-amounts,
html.app-store-mode .support-payment-grid {
  display: none !important;
}
`;

function assertAssetsMaterialized() {
  const result = spawnSync("find", ["assets", "-flags", "+dataless", "-print"], {
    cwd: rootDir,
    encoding: "utf8"
  });

  if (result.error || result.status !== 0) {
    return;
  }

  const datalessAssets = result.stdout
    .split("\n")
    .map((assetPath) => assetPath.trim())
    .filter(Boolean);

  if (!datalessAssets.length) {
    return;
  }

  const preview = datalessAssets.slice(0, 12).join("\n  ");
  const remaining = datalessAssets.length > 12 ? `\n  ...and ${datalessAssets.length - 12} more` : "";
  throw new Error(
    [
      "Cannot build iOS web bundle because some assets are still macOS/iCloud dataless placeholders.",
      "Materialize them locally, then rerun this command:",
      "",
      "  brctl download assets/image-bank assets/image-bank-share.zip",
      "",
      "Dataless assets:",
      `  ${preview}${remaining}`
    ].join("\n")
  );
}

function stripMacosMetadata(targetPath) {
  spawnSync("find", [targetPath, "-name", ".DS_Store", "-delete"], {
    cwd: rootDir,
    stdio: "ignore"
  });
  spawnSync("xattr", ["-cr", targetPath], {
    cwd: rootDir,
    stdio: "ignore"
  });
}

async function copyPath(source, destination) {
  await cp(path.join(rootDir, source), path.join(webDir, destination || source), {
    recursive: true,
    force: true
  });
}

async function writeTransformedPath(source, destination, transform) {
  const input = await readFile(path.join(rootDir, source), "utf8");
  await writeFile(path.join(webDir, destination || source), transform(input));
}

async function writeOptimizedPath(source, destination, transform, optimize) {
  const input = await readFile(path.join(rootDir, source), "utf8");
  const transformed = transform(input);
  await writeFile(path.join(webDir, destination), await optimize(transformed, source));
}

function replaceAllRequired(source, replacements, label) {
  return replacements.reduce((output, [from, to]) => {
    if (!output.includes(from)) {
      throw new Error(`Could not apply iOS App Store transform for ${label}: missing "${from.slice(0, 90)}"`);
    }
    return output.replaceAll(from, to);
  }, source);
}

function replaceSupportBadgesForIos(js) {
  const badgeLabels = ["Suporte", "Support", "Soporte"];
  let index = 0;
  const output = js.replace(/supportBadge: "Tips"/g, () => {
    const label = badgeLabels[index];
    index += 1;
    return `supportBadge: "${label}"`;
  });

  if (index !== badgeLabels.length) {
    throw new Error(`Could not apply iOS App Store transform for app.js: expected ${badgeLabels.length} support badges, found ${index}`);
  }

  return output;
}

function buildIosIndexHtml(html) {
  let output = html;

  output = output.replace(
    /\s*<script defer src="\/_vercel\/insights\/script\.js"><\/script>/,
    ""
  );

  const analyticsScriptPattern = /\n    <script>\n      window\.va = window\.va[\s\S]*?\n    <\/script>/;
  if (!analyticsScriptPattern.test(output)) {
    throw new Error("Could not replace analytics bootstrap in the iOS App Store bundle.");
  }
  output = output.replace(
    analyticsScriptPattern,
    `
    <script>
      window.va = window.va || function () {};
      window.SONIC_PRIVACY_ANALYTICS_STORAGE_KEY = "sonic_search:privacy:analytics:v1";
      window.SONIC_SEARCH_DISABLE_ANALYTICS = true;
      window.loadSonicAnalytics = function noopSonicIosAnalytics() {};
    </script>`
  );

  output = output.replace(
    /href="\/api\/social-oauth-url/g,
    `href="${apiBaseUrl}/api/social-oauth-url`
  );

  const privacyBannerPattern = /\n    <section id="privacyConsentBanner"[\s\S]*?\n    <\/section>/;
  if (!privacyBannerPattern.test(output)) {
    throw new Error("Could not remove privacy consent banner from the iOS App Store bundle.");
  }
  output = output.replace(privacyBannerPattern, "");

  const privacyPreferencesScriptPattern = /\n    <script>\n      \(function \(\) \{\n        const key = window\.SONIC_PRIVACY_ANALYTICS_STORAGE_KEY[\s\S]*?\n      \}\)\(\);\n    <\/script>/;
  if (!privacyPreferencesScriptPattern.test(output)) {
    throw new Error("Could not replace privacy preferences script in the iOS App Store bundle.");
  }
  output = output.replace(
    privacyPreferencesScriptPattern,
    `
    <script>
      (function () {
        const key = window.SONIC_PRIVACY_ANALYTICS_STORAGE_KEY || "sonic_search:privacy:analytics:v1";
        try {
          localStorage.setItem(key, "no");
        } catch (_) {}
        document.querySelectorAll("[data-privacy-settings]").forEach((button) => {
          button.hidden = true;
          button.setAttribute("aria-hidden", "true");
        });
        document.documentElement.classList.remove("privacy-consent-visible");
      })();
    </script>`
  );

  output = replaceAllRequired(output, [
    ["<h3 id=\"supportTitle\">Contato e apoio</h3>", "<h3 id=\"supportTitle\">Contato</h3>"],
    ["<span id=\"supportStatusBadge\" class=\"chip alt\">Tips</span>", "<span id=\"supportStatusBadge\" class=\"chip alt\">Suporte</span>"],
    [
      "Fale com Pedro Freire sobre feedback, bugs, parcerias ou catálogo. Apoios voluntários ficam logo abaixo.",
      "Fale com Pedro Freire sobre feedback, bugs, parcerias ou catálogo. O app prepara um e-mail para você revisar antes de enviar."
    ],
    [
      "Seu perfil pode ficar salvo neste aparelho. Links e integrações externas seguem suas próprias políticas. Tips são apoio voluntário.",
      "Seu perfil pode ficar salvo neste aparelho. Assinaturas do Sonic Premium, quando disponíveis, são processadas pela App Store."
    ]
  ], "index.html");

  output = output.replace(
    /<script defer src="app(?:\.min)?\.js\?v=([^"]+)"><\/script>/,
    `<script defer src="${runtimeScriptName}?v=$1"></script>\n    <script defer src="app.min.js?v=$1"></script>`
  );

  if (!output.includes(runtimeScriptName)) {
    throw new Error(`Could not inject ${runtimeScriptName} before app.js`);
  }

  for (const assetName of iosRuntimeAssetNames) {
    const versionPattern = new RegExp(`(${assetName.replaceAll(".", "\\.")}\\?v=)[^\"]+`, "g");
    if (!versionPattern.test(output)) {
      throw new Error(`Could not version iOS runtime asset: ${assetName}`);
    }
    output = output.replace(versionPattern, `$1${appStoreBuildId}`);
  }

  return output;
}

function buildIosAppJs(js) {
  const buildIdPattern = /const SONIC_APP_BUILD_ID = "[^"]+";/;
  if (!buildIdPattern.test(js)) {
    throw new Error("Could not apply iOS App Store transform for app.js: missing SONIC_APP_BUILD_ID");
  }

  const versionedJs = js.replace(
    buildIdPattern,
    `const SONIC_APP_BUILD_ID = "${appStoreBuildId}";`
  );

  const output = replaceAllRequired(versionedJs, [
    ["Contato e apoio", "Contato"],
    [
      "Fale com Pedro Freire sobre feedback, bugs, parcerias ou catálogo. Apoios voluntários ficam logo abaixo.",
      "Fale com Pedro Freire sobre feedback, bugs, parcerias ou catálogo. O app prepara um e-mail para você revisar antes de enviar."
    ],
    [
      "Na versão iOS, apoio financeiro fica fora do app. Use o contato para falar com Pedro.",
      "Na versão iOS, esta aba fica dedicada a suporte, feedback e contato direto."
    ],
    [
      "Apoio voluntário ao projeto. Não é assinatura, compra de música ou garantia de benefício.",
      "Gorjetas não são oferecidas no iOS. Assinaturas do Sonic Premium são processadas pela App Store."
    ],
    [
      "Sonic Search é um produto Pedro Freire / CBK Labs. Os documentos completos explicam dados, cookies, uso permitido e responsabilidade.",
      "Sonic Search é um produto Pedro Freire / CBK Labs. Os documentos completos explicam dados, privacidade, uso permitido e responsabilidade."
    ],
    [
      "Seu perfil musical fica local por padrão. Contato, login social, comentários, eventos do produto e IA podem usar backend quando você aciona esses recursos.",
      "Seu perfil musical fica local por padrão. Login online, Comunidade, contato, notícias e IA podem usar backend quando você aciona esses recursos."
    ],
    [
      "Cookies essenciais mantêm segurança, sessão e preferências. Não usamos cookies de anúncio ou tracking; analytics do site só carrega depois do aceite.",
      "Dados essenciais mantêm segurança, sessão e preferências. A versão iOS não carrega analytics, anúncios ou cookies de tracking."
    ],
    [
      "Você chegou ao limite gratuito de {limit} músicas descobertas. Assine premium para continuar descobrindo.",
      "Você chegou ao limite diário de {limit} descobertas neste aparelho. Volte mais tarde ou apague o perfil local se quiser recomeçar."
    ],
    ["A API pediu acesso premium para gerar esta arte.", "A geração online dessa arte está indisponível agora."],
    [
      "Entre com o Google autorizado ou assine premium para gerar esta arte.",
      "A geração online dessa arte precisa de uma conta autorizada. A versão local continua disponível."
    ],
    ["Contact and support", "Contact"],
    [
      "Contact Pedro Freire about feedback, bugs, partnerships, or catalog notes. Voluntary support options sit below.",
      "Contact Pedro Freire about feedback, bugs, partnerships, or catalog notes. The app prepares an email for you to review before sending."
    ],
    [
      "In the iOS version, financial support stays outside the app. Use contact to reach Pedro.",
      "In the iOS version, this tab is dedicated to support, feedback, and direct contact."
    ],
    [
      "Voluntary project support. It is not a subscription, music purchase, or guaranteed benefit.",
      "Tips are not offered on iOS. Sonic Premium subscriptions are processed by the App Store."
    ],
    [
      "Sonic Search is a Pedro Freire / CBK Labs product. The full documents explain data, cookies, permitted use, and responsibility.",
      "Sonic Search is a Pedro Freire / CBK Labs product. The full documents explain data, privacy, permitted use, and responsibility."
    ],
    [
      "Your music profile stays local by default. Contact, social login, comments, product events, and AI may use the backend when you trigger those features.",
      "Your music profile stays local by default. Online login, Community, contact, news, and AI may use the backend when you trigger those features."
    ],
    [
      "Essential cookies keep security, session, and preferences. We do not use advertising or tracking cookies; site analytics only loads after consent.",
      "Essential data keeps security, session, and preferences. The iOS version does not load analytics, ads, or tracking cookies."
    ],
    [
      "You reached the free limit of {limit} discovered tracks. Subscribe to premium to keep discovering.",
      "You reached the daily limit of {limit} discoveries on this device. Come back later or erase the local profile to start over."
    ],
    ["The API requested premium access to generate this artwork.", "Online artwork generation is unavailable right now."],
    [
      "Sign in with the authorized Google account or subscribe to premium to generate this artwork.",
      "Online artwork generation requires an authorized account. The local version remains available."
    ],
    ["Contacto y apoyo", "Contacto"],
    [
      "Habla con Pedro Freire sobre feedback, bugs, alianzas o catálogo. Los apoyos voluntarios quedan abajo.",
      "Habla con Pedro Freire sobre feedback, bugs, alianzas o catálogo. La app prepara un e-mail para revisar antes de enviar."
    ],
    [
      "En la versión iOS, el apoyo financiero queda fuera de la app. Usa contacto para hablar con Pedro.",
      "En la versión iOS, esta pestaña queda dedicada a soporte, feedback y contacto directo."
    ],
    [
      "Apoyo voluntario al proyecto. No es suscripción, compra de música ni garantía de beneficio.",
      "No se ofrecen propinas en iOS. Las suscripciones a Sonic Premium se procesan en la App Store."
    ],
    [
      "Sonic Search es un producto de Pedro Freire / CBK Labs. Los documentos completos explican datos, cookies, uso permitido y responsabilidad.",
      "Sonic Search es un producto de Pedro Freire / CBK Labs. Los documentos completos explican datos, privacidad, uso permitido y responsabilidad."
    ],
    [
      "Tu perfil musical queda local por defecto. Contacto, login social, comentarios, eventos del producto e IA pueden usar backend cuando activas esos recursos.",
      "Tu perfil musical queda local por defecto. Login online, Comunidad, contacto, noticias e IA pueden usar backend cuando activas esos recursos."
    ],
    [
      "Las cookies esenciales mantienen seguridad, sesión y preferencias. No usamos cookies de anuncios ni tracking; analytics del sitio solo carga después del consentimiento.",
      "Los datos esenciales mantienen seguridad, sesión y preferencias. La versión iOS no carga analytics, anuncios ni cookies de tracking."
    ],
    [
      "Llegaste al límite gratuito de {limit} canciones descubiertas. Suscríbete a premium para seguir descubriendo.",
      "Llegaste al límite diario de {limit} descubrimientos en este dispositivo. Vuelve más tarde o borra el perfil local para empezar de nuevo."
    ],
    ["La API pidió acceso premium para generar este arte.", "La generación online de este arte no está disponible ahora."],
    [
      "Entra con el Google autorizado o suscríbete a premium para generar este arte.",
      "La generación online de este arte requiere una cuenta autorizada. La versión local sigue disponible."
    ],
  ], "app.js");

  return replaceSupportBadgesForIos(output);
}

function buildIosStylesCss(css) {
  if (css.includes("html.app-store-mode")) {
    throw new Error("Root styles.css already contains App Store mode CSS; keep it isolated in the iOS build transform.");
  }
  const output = replaceAllRequired(css, [
    [`,\nhtml[data-sonic-screenshot="true"] #privacyConsentBanner`, ""],
    [`,\nhtml[data-sonic-store-screenshot="true"] #privacyConsentBanner`, ""]
  ], "styles.css");
  return `${output.trimEnd()}\n${appStoreModeCss}`;
}

function buildIosPrivacyHtml(html) {
  let output = replaceAllRequired(html, [
    [
      "<strong>Contato e apoio</strong>\n            <span>O formulário de contato prepara um e-mail local; os dados só são enviados se você confirmar no app de e-mail. Pix e Bitcoin são apoios voluntários e não exigem cadastro no Sonic Search.</span>",
      "<strong>Contato</strong>\n            <span>O formulário de contato prepara um e-mail local; os dados só são enviados se você confirmar no app de e-mail.</span>"
    ],
    [
      "Podemos usar Vercel para hospedagem, logs e analytics opcional no site; Supabase para autenticação, banco e storage;",
      "Podemos usar Vercel para hospedagem e logs; Supabase para autenticação, banco e storage;"
    ]
  ], "privacy.html");

  return output;
}

function buildIosTermsHtml(html) {
  return replaceAllRequired(html, [
    ["<h2>9. Sonic Premium, pagamentos e cancelamento</h2>", "<h2>9. Assinaturas do Sonic Premium</h2>"],
    [
      "O Sonic Premium é uma assinatura renovável que libera os recursos indicados na oferta, como o Radar Diário e a\n          sincronização do histórico. No site, a contratação e o gerenciamento são processados pela Stripe. No iOS, a\n          contratação, renovação, restauração e o cancelamento são processados pela App Store. O acesso fica associado à mesma\n          conta usada no Sonic Search e permanece ativo até o fim do período pago, inclusive após o cancelamento da renovação.",
      "Na versão iOS, o Sonic Premium é oferecido como assinatura renovável pela App Store. A cobrança ocorre na conta Apple\n          após a confirmação da compra; compras podem ser restauradas e a renovação automática pode ser cancelada nos ajustes de\n          assinaturas da Apple. O acesso fica associado à conta do Sonic Search e permanece ativo até o fim do período pago."
    ]
  ], "terms.html");
}

function buildIosCookiesHtml(html) {
  return replaceAllRequired(html, [
    [
      "<strong>Preferência de analytics</strong>\n            <span><code>sonic_search:privacy:analytics:v1</code>: salva \"yes\" ou \"no\" para lembrar sua escolha sobre Vercel Insights.</span>",
      "<strong>Analytics desativado no iOS</strong>\n            <span>A versão iOS não carrega Vercel Insights, não exibe prompt de analytics e não usa cookies de tracking.</span>"
    ],
    [
      "<strong>Login social</strong>\n            <span><code>neonpulse:socialSession:v1</code>: pode guardar sessão local quando login social está ativo. O provedor de autenticação também pode usar seus próprios cookies.</span>",
      "<strong>Login social</strong>\n            <span><code>neonpulse:socialSession:v1</code>: pode guardar sessão local quando login social está ativo. O provedor de autenticação também pode usar seus próprios cookies.</span>"
    ],
    [
      `<h2>4. Analytics do site</h2>
        <p>
          O Sonic Search não carrega Vercel Insights automaticamente. O script de analytics só é inserido depois que você clica
          em "Aceitar analytics". Se escolher "Só essenciais", essa preferência também fica registrada e o analytics não carrega.
        </p>
        <p>
          Essa opção vale para o site. Na versão iOS da App Store, o banner de analytics fica removido, Vercel Insights não é
          carregado e não há cookies de tracking. Você também pode limpar os dados do site no navegador para apagar a escolha.
        </p>`,
      `<h2>4. Sem analytics na versão iOS</h2>
        <p>
          A versão iOS da App Store não carrega Vercel Insights, não exibe prompt de analytics e não usa cookies de tracking.
          O armazenamento local e eventuais cookies essenciais são usados somente para funcionamento, segurança e preferências.
        </p>
        <p>
          No site, analytics continua opcional e separado da versão iOS. Você pode limpar os dados do site no navegador para
          apagar preferências locais.
        </p>`
    ]
  ], "cookies.html");
}

assertAssetsMaterialized();
await buildRuntimeCatalog();

await rm(webDir, { recursive: true, force: true });
await mkdir(webDir, { recursive: true });

const indexHtml = await readFile(path.join(rootDir, "index.html"), "utf8");
await writeFile(path.join(webDir, "index.html"), buildIosIndexHtml(indexHtml));

await Promise.all([
  writeOptimizedPath("app.js", "app.min.js", buildIosAppJs, minifyJavaScript),
  writeOptimizedPath("catalog-runtime.js", "catalog-runtime.min.js", (source) => source, minifyJavaScript),
  writeOptimizedPath("styles.css", "styles.min.css", buildIosStylesCss, minifyCss),
  copyPath("legal.css"),
  copyPath("daily-djs.js"),
  copyPath("daily-djs-ui.js"),
  copyPath("daily-djs.css"),
  copyPath("daily-radar.js"),
  copyPath("daily-radar-ui.js"),
  copyPath("daily-radar.css"),
  writeTransformedPath("privacy.html", "privacy.html", buildIosPrivacyHtml),
  writeTransformedPath("terms.html", "terms.html", buildIosTermsHtml),
  writeTransformedPath("cookies.html", "cookies.html", buildIosCookiesHtml),
  copyPath("assets"),
  copyPath("data"),
  copyPath(path.join("mobile", runtimeScriptName), runtimeScriptName)
]);

stripMacosMetadata(webDir);

console.log(`Built iOS web bundle at ${path.relative(rootDir, webDir)}/`);
