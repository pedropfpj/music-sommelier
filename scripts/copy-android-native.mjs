import { cp, mkdir, readFile, rm, writeFile } from "node:fs/promises";
import { spawnSync } from "node:child_process";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const rootDir = path.resolve(__dirname, "..");
const webDir = path.join(rootDir, "www");
const androidAppDir = path.join(rootDir, "android", "app");
const androidAssetsDir = path.join(androidAppDir, "src", "main", "assets");
const androidPublicDir = path.join(androidAssetsDir, "public");

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

async function androidCapacitorConfig() {
  const config = JSON.parse(await readFile(path.join(rootDir, "capacitor.config.json"), "utf8"));
  return {
    ...config,
    appId: "app.sonicsearch.android",
    appName: "Sonic Search",
    android: {
      ...(config.android || {}),
      backgroundColor: "#020610"
    }
  };
}

await rm(androidPublicDir, { recursive: true, force: true });
await mkdir(androidAssetsDir, { recursive: true });
await cp(webDir, androidPublicDir, { recursive: true, force: true });

await writeFile(
  path.join(androidAssetsDir, "capacitor.config.json"),
  `${JSON.stringify(await androidCapacitorConfig(), null, 2)}\n`
);

await writeFile(
  path.join(androidAssetsDir, "capacitor.plugins.json"),
  `${JSON.stringify([
    { pkg: "@capacitor/app", classpath: "com.capacitorjs.plugins.app.AppPlugin" },
    { pkg: "@capacitor/browser", classpath: "com.capacitorjs.plugins.browser.BrowserPlugin" }
  ], null, "\t")}\n`
);

stripMacosMetadata(androidPublicDir);

console.log(`Copied Android web bundle to ${path.relative(rootDir, androidPublicDir)}/`);
