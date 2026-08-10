import { cp, mkdir, rm } from "node:fs/promises";
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
stripMacosMetadata(iosPublicDir);
stripMacosMetadata(path.join(iosAppDir, "Assets.xcassets"));

console.log(`Copied iOS web bundle to ${path.relative(rootDir, iosPublicDir)}/`);
