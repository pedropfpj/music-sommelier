import { cp, mkdir, rm, writeFile } from "node:fs/promises";
import { spawnSync } from "node:child_process";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const rootDir = path.resolve(__dirname, "..");
const webDir = path.join(rootDir, "www");
const iosAppDir = path.join(rootDir, "ios", "App", "App");
const iosPublicDir = path.join(iosAppDir, "public");

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

await rm(iosPublicDir, { recursive: true, force: true });
await mkdir(iosAppDir, { recursive: true });
await cp(webDir, iosPublicDir, { recursive: true, force: true });
await cp(path.join(rootDir, "capacitor.config.json"), path.join(iosAppDir, "capacitor.config.json"), { force: true });
// Xcode references Capacitor's generated Cordova resource even when the app
// has no Cordova plugins. A clean checkout must materialize it as well.
await writeFile(path.join(iosAppDir, "config.xml"), `<?xml version='1.0' encoding='utf-8'?>
<widget version="1.0.0" xmlns="http://www.w3.org/ns/widgets" xmlns:cdv="http://cordova.apache.org/ns/1.0">
  <access origin="*" />
</widget>\n`, { flag: "wx" }).catch(error => { if (error.code !== "EEXIST") throw error; });
stripMacosMetadata(iosPublicDir);
stripMacosMetadata(path.join(iosAppDir, "Assets.xcassets"));

console.log(`Copied iOS web bundle to ${path.relative(rootDir, iosPublicDir)}/`);
