import { readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { minifyCss, minifyJavaScript } from "./web-build-utils.mjs";
import { buildRuntimeCatalog } from "./build-runtime-catalog.mjs";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const rootDir = path.resolve(__dirname, "..");

async function buildAsset(sourceName, destinationName, transform) {
  const source = await readFile(path.join(rootDir, sourceName), "utf8");
  const output = await transform(source, sourceName);
  await writeFile(path.join(rootDir, destinationName), output);
  return {
    sourceBytes: Buffer.byteLength(source),
    outputBytes: Buffer.byteLength(output)
  };
}

await buildRuntimeCatalog();

const [javascript, catalogRuntime, css] = await Promise.all([
  buildAsset("app.js", "app.min.js", minifyJavaScript),
  buildAsset("catalog-runtime.js", "catalog-runtime.min.js", minifyJavaScript),
  buildAsset("styles.css", "styles.min.css", minifyCss)
]);

function reduction({ sourceBytes, outputBytes }) {
  return `${Math.round((1 - outputBytes / sourceBytes) * 100)}%`;
}

console.log(
  `Built optimized web assets: app.min.js ${reduction(javascript)} smaller, catalog-runtime.min.js ${reduction(catalogRuntime)} smaller, styles.min.css ${reduction(css)} smaller.`
);
