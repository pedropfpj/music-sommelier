import { readFile, rename, writeFile } from "node:fs/promises";
import { spawnSync } from "node:child_process";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const rootDir = path.resolve(__dirname, "..");
const webDir = path.join(rootDir, "www");

const result = spawnSync(process.execPath, [path.join(rootDir, "scripts", "build-ios-web.mjs")], {
  cwd: rootDir,
  stdio: "inherit"
});

if (result.status !== 0) {
  process.exit(result.status || 1);
}

const textFiles = [
  "index.html",
  "app.min.js",
  "privacy.html",
  "terms.html",
  "cookies.html",
  "styles.min.css",
  "sonic-ios-runtime.js"
];

const replacements = [
  [/sonic-ios-runtime\.js/g, "sonic-android-runtime.js"],
  [/configureSonicSearchIosRuntime/g, "configureSonicSearchAndroidRuntime"],
  [/sonic-ios-app/g, "sonic-android-app"],
  [/SONIC_SEARCH_IOS_APP/g, "SONIC_SEARCH_ANDROID_APP"],
  [/SONIC_SEARCH_IOS_CONFIG/g, "SONIC_SEARCH_ANDROID_CONFIG"],
  [/noopSonicIosAnalytics/g, "noopSonicAndroidAnalytics"],
  [/iOS App Store/g, "Google Play"],
  [/App Store/g, "Google Play"],
  [/Native iOS shell/g, "Native Android shell"],
  [/sonic-ios-app/g, "sonic-android-app"],
  [/versão iOS/g, "versão Android"],
  [/Versão iOS/g, "Versão Android"],
  [/versão empacotada para iOS/g, "versão empacotada para Android"],
  [/no iOS/g, "no Android"],
  [/No iOS/g, "No Android"],
  [/iOS version/g, "Android version"],
  [/iOS distributed/g, "Android distributed"],
  [/iOS does/g, "Android does"],
  [/iOS, /g, "Android, "],
  [/versión iOS/g, "versión Android"],
  [/nos termos da Apple/g, "nos termos da Google Play"],
  [/fora do sistema da Apple/g, "fora do sistema da Google Play"]
];

for (const fileName of textFiles) {
  const filePath = path.join(webDir, fileName);
  let content = await readFile(filePath, "utf8");
  for (const [pattern, replacement] of replacements) {
    content = content.replace(pattern, replacement);
  }
  await writeFile(filePath, content);
}

await rename(path.join(webDir, "sonic-ios-runtime.js"), path.join(webDir, "sonic-android-runtime.js"));

console.log(`Built Android web bundle at ${path.relative(rootDir, webDir)}/`);
