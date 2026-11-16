import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { mkdtemp, readFile, rm, symlink, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";
import { spawnSync } from "node:child_process";
import { test } from "node:test";
import { fileURLToPath } from "node:url";
import { buildAuthorizedCatalog } from "./lib/authorized-catalog-intake.mjs";

const nowMs = Date.parse("2026-11-16T15:00:00Z");
const isrc = "isrc:USABC2600001";
const mbid = "mbid:12345678-1234-4abc-9abc-123456789abc";
const cli = fileURLToPath(new URL("./build-authorized-catalog.mjs", import.meta.url));

function waveFixture(numberOfSamples = 800) {
  const samples = Buffer.alloc(numberOfSamples * 2);
  for (let index = 0; index < numberOfSamples; index++) {
    samples.writeInt16LE(Math.floor(1300 * Math.sin(index * Math.PI / 12)), index * 2);
  }
  const header = Buffer.alloc(44);
  header.write("RIFF", 0);
  header.writeUInt32LE(samples.length + 36, 4);
  header.write("WAVEfmt ", 8);
  header.writeUInt32LE(16, 16);
  header.writeUInt16LE(1, 20);
  header.writeUInt16LE(1, 22);
  header.writeUInt32LE(8000, 24);
  header.writeUInt32LE(16000, 28);
  header.writeUInt16LE(2, 32);
  header.writeUInt16LE(16, 34);
  header.write("data", 36);
  header.writeUInt32LE(samples.length, 40);
  return Buffer.concat([header, samples]);
}

function mp3HeaderFixture() {
  // Two MPEG-1 Layer III headers at the expected 128 kbps / 44.1 kHz frame boundaries.
  const id3 = Buffer.from([0x49, 0x44, 0x33, 4, 0, 0, 0, 0, 0, 0]);
  const frame = Buffer.alloc(417);
  Buffer.from([0xff, 0xfb, 0x90, 0x00]).copy(frame);
  return Buffer.concat([id3, frame, frame]);
}

function reviewedRecording(bytes, { id = isrc, extension = "wav" } = {}) {
  const sha256 = createHash("sha256").update(bytes).digest("hex");
  return {
    id,
    title: " Controlled tone ",
    artist: "Local test fixture",
    style: "full_on_night",
    styleEvidence: { recordingId: id, verified: true, evidenceRef: "private-style-reference" },
    bpm: { value: 150.25, recordingId: id, verified: true, evidenceRef: "private-tempo-reference" },
    preview: { file: `${sha256}.${extension}`, mimeType: extension === "wav" ? "audio/wav" : "audio/mpeg" },
    rights: {
      recordingId: id,
      decision: "approved",
      territory: "worldwide",
      scope: "web-preview-streaming",
      masterApproved: true,
      compositionApproved: true,
      approvalRef: "private-approval-reference",
      approvedPreviewSha256: sha256,
      availableFrom: "2026-11-01T00:00:00Z",
      expiresAt: "2099-11-01T00:00:00Z"
    }
  };
}

async function tempDirectory(t) {
  const directory = await mkdtemp(path.join(tmpdir(), "authorized-catalog-test-"));
  t.after(() => rm(directory, { recursive: true, force: true }));
  return directory;
}

test("publishes only recording metadata and the authorized audio route, including an empty batch", async t => {
  const mediaRoot = await tempDirectory(t);
  const wave = waveFixture();
  const mp3 = mp3HeaderFixture();
  const recording = reviewedRecording(wave);
  const scheduled = reviewedRecording(mp3, { id: mbid, extension: "mp3" });
  scheduled.rights.availableFrom = "2099-10-01T00:00:00Z";
  await Promise.all([
    writeFile(path.join(mediaRoot, recording.preview.file), wave),
    writeFile(path.join(mediaRoot, scheduled.preview.file), mp3)
  ]);

  const empty = { version: 1, mode: "authorized-previews", recordings: [] };
  assert.deepEqual(await buildAuthorizedCatalog({ version: 1, recordings: [] }), empty);
  const manifest = await buildAuthorizedCatalog({ version: 1, recordings: [recording, scheduled] }, { mediaRoot, nowMs });
  assert.deepEqual(manifest.recordings[0], {
    id: isrc,
    title: "Controlled tone",
    artist: "Local test fixture",
    style: "full_on_night",
    bpm: 150.25,
    previewPath: `/api/authorized-audio?file=${recording.preview.file}`,
    availableFrom: "2026-11-01T00:00:00.000Z",
    expiresAt: "2099-11-01T00:00:00.000Z"
  });
  assert.equal(manifest.recordings[1].id, mbid);
  assert.equal(manifest.recordings[1].availableFrom, "2099-10-01T00:00:00.000Z");
  assert.equal(manifest.recordings[1].previewPath, `/api/authorized-audio?file=${scheduled.preview.file}`);
  assert.doesNotMatch(JSON.stringify(manifest), /private-|approvalRef|masterApproved/);
});

test("unconfirmed or out-of-scope evidence prevents catalog publication", async t => {
  const checks = [
    [r => { r.id = "mbid:album-123"; }, /\.id:/],
    [r => { r.styleEvidence.recordingId = mbid; }, /\.styleEvidence:/],
    [r => { r.bpm.verified = false; }, /\.bpm:/],
    [r => { r.bpm.value = "150"; }, /\.bpm\.value:/],
    [r => { r.rights.recordingId = mbid; }, /\.rights\.recordingId:/],
    [r => { r.rights.decision = "revoked"; }, /\.rights\.decision:/],
    [r => { r.rights.territory = "BR"; }, /\.rights\.territory:/],
    [r => { r.rights.scope = "link-only"; }, /\.rights\.scope:/],
    [r => { r.rights.compositionApproved = false; }, /\.rights:/],
    [r => { r.rights.approvalRef = " "; }, /\.approvalRef:/],
    [r => { r.rights.approvedPreviewSha256 = "c".repeat(64); }, /\.approvedPreviewSha256:/],
    [r => { r.preview.file = `../${r.preview.file}`; }, /\.preview\.file:/],
    [r => { r.preview.file = `${r.preview.file}\n`; }, /\.preview\.file:/],
    [r => { r.preview.file = `https://example.com/${r.preview.file}`; }, /\.preview\.file:/],
    [r => { r.preview.mimeType = "audio/mpeg"; }, /\.preview\.mimeType:/],
    [r => { r.rights.expiresAt = "2026-11-16T15:00:00Z"; }, /permission has expired/],
    [r => { r.rights.expiresAt = "2099-02-29T00:00:00Z"; }, /invalid date/],
    [r => { r.rights.expiresAt = "2099-10-01T00:00:00+00:00"; }, /exact UTC timestamp/]
  ];
  for (const [mutate, error] of checks) {
    await t.test(String(error), async () => {
      const recording = reviewedRecording(waveFixture());
      mutate(recording);
      await assert.rejects(buildAuthorizedCatalog({ version: 1, recordings: [recording] }, { nowMs }), error);
    });
  }
});

test("duplicate identities and duplicate bytes are rejected before assets are read", async () => {
  const wave = waveFixture();
  const recording = reviewedRecording(wave);
  const alternate = reviewedRecording(waveFixture(900));
  const alias = reviewedRecording(wave, { id: mbid });
  await assert.rejects(buildAuthorizedCatalog({ version: 1, recordings: [recording, alternate] }, { nowMs }), /duplicate recording ID/);
  await assert.rejects(buildAuthorizedCatalog({ version: 1, recordings: [recording, alias] }, { nowMs }), /duplicate preview bytes/);
});

test("checks staged approved bytes, declared type, safe path and the delivery size limit", async t => {
  const mediaRoot = await tempDirectory(t);
  const compile = recording => buildAuthorizedCatalog({ version: 1, recordings: [recording] }, { mediaRoot, nowMs });
  const wave = waveFixture();
  const recording = reviewedRecording(wave);
  const asset = path.join(mediaRoot, recording.preview.file);
  await assert.rejects(compile(recording), /expected a staged regular file/);
  await writeFile(asset, waveFixture(900));
  await assert.rejects(compile(recording), /bytes do not match/);
  await writeFile(asset, Buffer.from("not audio"));
  await assert.rejects(compile(recording), /does not contain the declared audio format/);

  const largeBytes = Buffer.alloc(4 * 1024 * 1024 + 1);
  const large = reviewedRecording(largeBytes);
  await writeFile(path.join(mediaRoot, large.preview.file), largeBytes);
  await assert.rejects(compile(large), /preview must be 4 MiB or smaller/);

  await rm(asset);
  const actualAsset = path.join(mediaRoot, "actual.wav");
  await writeFile(actualAsset, wave);
  await symlink(actualAsset, asset);
  await assert.rejects(compile(recording), /without symlinks/);
});

test("CLI leaves the previous manifest intact on failure and never publishes private input", async t => {
  const privateDirectory = await tempDirectory(t);
  const mediaRoot = await tempDirectory(t);
  const input = path.join(privateDirectory, "intake.json");
  const output = path.join(privateDirectory, "manifest.json");
  const args = ["--input", input, "--media-root", mediaRoot, "--output", output];
  const run = cliArgs => spawnSync(process.execPath, [cli, ...cliArgs], { encoding: "utf8" });
  const wave = waveFixture();
  const recording = reviewedRecording(wave);
  await Promise.all([
    writeFile(input, JSON.stringify({ version: 1, recordings: [recording] })),
    writeFile(path.join(mediaRoot, recording.preview.file), wave)
  ]);

  const compiled = run(args);
  assert.equal(compiled.status, 0, compiled.stderr);
  const original = await readFile(output, "utf8");
  assert.equal(JSON.parse(original).recordings.length, 1);
  assert.doesNotMatch(original, /private-/);

  await writeFile(input, '{"approvalRef": "private-value",BROKEN');
  const failed = run(args);
  assert.equal(failed.status, 1);
  assert.match(failed.stderr, /Intake must contain valid JSON/);
  assert.doesNotMatch(failed.stderr, /private-value/);
  assert.equal(await readFile(output, "utf8"), original);

  const inCheckout = run(["--input", fileURLToPath(new URL("../package.json", import.meta.url)), "--media-root", mediaRoot, "--output", output]);
  assert.equal(inCheckout.status, 1);
  assert.match(inCheckout.stderr, /outside the source checkout/);
  assert.equal(await readFile(output, "utf8"), original);
});
