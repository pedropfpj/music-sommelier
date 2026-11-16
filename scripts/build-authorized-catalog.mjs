#!/usr/bin/env node

import { mkdtemp, readFile, realpath, rename, rm, stat, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { parseArgs } from "node:util";
import { buildAuthorizedCatalog } from "./lib/authorized-catalog-intake.mjs";

const usage = "Usage: node scripts/build-authorized-catalog.mjs --input <private JSON> --media-root <private folder> --output <manifest JSON>";

function isInside(directory, target) {
  const relative = path.relative(directory, target);
  return relative !== ".." && !relative.startsWith(`..${path.sep}`) && !path.isAbsolute(relative);
}

async function readIntake(input) {
  if (!(await stat(input)).isFile()) throw new Error("Intake must be a regular JSON file.");
  const source = await readFile(input, "utf8");
  try {
    return JSON.parse(source);
  } catch {
    throw new Error("Intake must contain valid JSON.");
  }
}

async function writeManifest(outputPath, manifest) {
  const temporaryDirectory = await mkdtemp(path.join(path.dirname(outputPath), ".authorized-catalog-"));
  const temporaryManifest = path.join(temporaryDirectory, "manifest.json");
  try {
    await writeFile(temporaryManifest, `${JSON.stringify(manifest, null, 2)}\n`, { flag: "wx" });
    await rename(temporaryManifest, outputPath);
  } finally {
    await rm(temporaryDirectory, { recursive: true, force: true });
  }
}

async function main() {
  const { values } = parseArgs({
    options: {
      input: { type: "string" },
      "media-root": { type: "string" },
      output: { type: "string" },
      help: { type: "boolean" }
    }
  });
  if (values.help) {
    console.log(usage);
    return;
  }
  if (!values.input || !values["media-root"] || !values.output) throw new Error(usage);

  const checkout = await realpath(fileURLToPath(new URL("../", import.meta.url)));
  const input = await realpath(values.input);
  const mediaRoot = await realpath(values["media-root"]);
  const outputDir = await realpath(path.dirname(values.output));
  const output = path.join(outputDir, path.basename(values.output));
  if (isInside(checkout, input) || isInside(checkout, mediaRoot)) {
    throw new Error("Keep the private intake and staged media outside the source checkout.");
  }
  if (isInside(mediaRoot, output) || output === input) throw new Error("Use a separate manifest output path.");
  if (!(await stat(mediaRoot)).isDirectory()) throw new Error("Media root must be a directory.");

  const manifest = await buildAuthorizedCatalog(await readIntake(input), { mediaRoot });
  await writeManifest(output, manifest);
  console.log(`Compiled ${manifest.recordings.length} authorized preview(s).`);
}

try {
  await main();
} catch (error) {
  console.error(error.message);
  process.exitCode = 1;
}
