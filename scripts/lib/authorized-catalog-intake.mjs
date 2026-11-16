import { createHash } from "node:crypto";
import { constants } from "node:fs";
import { open } from "node:fs/promises";
import path from "node:path";

const RECORDING_ID = /^(?:isrc:[A-Z]{2}[A-Z0-9]{3}\d{7}|mbid:[0-9a-f]{8}(?:-[0-9a-f]{4}){3}-[0-9a-f]{12})$/;
const STYLE = /^[a-z0-9]+(?:_[a-z0-9]+)*$/;
const FILE_NAME = /^(?<sha256>[0-9a-f]{64})\.(?<extension>mp3|wav)$/;
const UTC_DATE = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(?:\.\d{3})?Z$/;
const MIME_TYPES = { mp3: "audio/mpeg", wav: "audio/wav" };
// Match the delivery function's response limit, leaving room below the host limit.
const MAX_PREVIEW_BYTES = 4 * 1024 * 1024;

function requireValue(condition, field, message) {
  if (!condition) throw new Error(`${field}: ${message}`);
}

function readObject(value, field) {
  requireValue(value && typeof value === "object" && !Array.isArray(value), field, "expected an object");
  return value;
}

function readText(value, field) {
  requireValue(typeof value === "string" && value.trim().length > 0, field, "required");
  return value.trim();
}

function readDate(value, field) {
  requireValue(typeof value === "string" && UTC_DATE.test(value), field, "expected an exact UTC timestamp");
  const timestamp = Date.parse(value);
  requireValue(Number.isFinite(timestamp), field, "invalid date");
  const canonical = new Date(timestamp).toISOString();
  requireValue(value === canonical || value === canonical.replace(/\.000Z$/, "Z"), field, "invalid date");
  return { timestamp, canonical };
}

function requireRecordingEvidence(value, id, field) {
  readObject(value, field);
  requireValue(value.verified === true && value.recordingId === id, field, "requires verified evidence for this exact recording");
  readText(value.evidenceRef, `${field}.evidenceRef`);
}

function readRecording(value, index, nowMs) {
  const field = `recordings[${index}]`;
  const { id, title, artist, style, styleEvidence, bpm, preview, rights } = readObject(value, field);
  requireValue(typeof id === "string" && id.trim() === id && RECORDING_ID.test(id), `${field}.id`, "expected a canonical ISRC or MusicBrainz recording ID");
  requireValue(typeof style === "string" && style.trim() === style && STYLE.test(style), `${field}.style`, "expected a lowercase catalog style slug");
  requireRecordingEvidence(styleEvidence, id, `${field}.styleEvidence`);

  requireRecordingEvidence(bpm, id, `${field}.bpm`);
  requireValue(Number.isFinite(bpm.value) && bpm.value > 0, `${field}.bpm.value`, "expected a positive BPM number");

  readObject(preview, `${field}.preview`);
  const file = typeof preview.file === "string" && FILE_NAME.exec(preview.file);
  requireValue(file && file[0] === preview.file, `${field}.preview.file`, "expected <lowercase SHA-256>.mp3 or <lowercase SHA-256>.wav");
  const { sha256, extension } = file.groups;
  requireValue(preview.mimeType === MIME_TYPES[extension], `${field}.preview.mimeType`, "format does not match file extension");

  readObject(rights, `${field}.rights`);
  requireValue(rights.recordingId === id, `${field}.rights.recordingId`, "approval must cover this exact recording");
  requireValue(rights.decision === "approved", `${field}.rights.decision`, "requires current explicit approval");
  requireValue(rights.territory === "worldwide", `${field}.rights.territory`, "this pilot requires worldwide permission");
  requireValue(rights.scope === "web-preview-streaming", `${field}.rights.scope`, "requires web preview streaming permission");
  requireValue(rights.masterApproved === true && rights.compositionApproved === true, `${field}.rights`, "both master and composition approvals are required");
  requireValue(rights.approvedPreviewSha256 === sha256, `${field}.rights.approvedPreviewSha256`, "approval must cover these exact preview bytes");
  readText(rights.approvalRef, `${field}.rights.approvalRef`);

  const availableFrom = readDate(rights.availableFrom, `${field}.rights.availableFrom`);
  const expiresAt = readDate(rights.expiresAt, `${field}.rights.expiresAt`);
  requireValue(availableFrom.timestamp < expiresAt.timestamp, `${field}.rights.expiresAt`, "must be later than the start of the permission");
  requireValue(expiresAt.timestamp > nowMs, `${field}.rights.expiresAt`, "permission has expired");

  return {
    file: preview.file,
    sha256,
    extension,
    field,
    publication: {
      id,
      title: readText(title, `${field}.title`),
      artist: readText(artist, `${field}.artist`),
      style,
      bpm: bpm.value,
      previewPath: `/api/authorized-audio?file=${preview.file}`,
      availableFrom: availableFrom.canonical,
      expiresAt: expiresAt.canonical
    }
  };
}

async function readHeader(handle, length, position) {
  const bytes = Buffer.alloc(length);
  const { bytesRead } = await handle.read(bytes, 0, length, position);
  return bytes.subarray(0, bytesRead);
}

async function hasWaveAudio(handle, size) {
  const riff = await readHeader(handle, 12, 0);
  if (riff.length !== 12 || riff.toString("ascii", 0, 4) !== "RIFF" || riff.toString("ascii", 8, 12) !== "WAVE") return false;
  const end = riff.readUInt32LE(4) + 8;
  if (end !== size) return false;

  let hasFormat = false;
  for (let position = 12; position + 8 <= end;) {
    const chunk = await readHeader(handle, 8, position);
    if (chunk.length !== 8) return false;
    const name = chunk.toString("ascii", 0, 4);
    const chunkSize = chunk.readUInt32LE(4);
    const dataStart = position + 8;
    const next = dataStart + chunkSize + (chunkSize % 2);
    if (next > end) return false;
    if (name === "fmt ") {
      const format = await readHeader(handle, Math.min(chunkSize, 16), dataStart);
      hasFormat = format.length === 16 && format.readUInt16LE(0) > 0 && format.readUInt16LE(2) > 0 && format.readUInt32LE(4) > 0;
    }
    if (name === "data" && hasFormat && chunkSize > 0) return true;
    position = next;
  }
  return false;
}

function mpegLayer3FrameLength(header) {
  if (header.length !== 4 || header[0] !== 0xff || (header[1] & 0xe0) !== 0xe0) return 0;
  const version = (header[1] >> 3) & 3;
  const layer = (header[1] >> 1) & 3;
  const bitrateIndex = (header[2] >> 4) & 15;
  const sampleRateIndex = (header[2] >> 2) & 3;
  if (version === 1 || layer !== 1 || bitrateIndex === 0 || bitrateIndex === 15 || sampleRateIndex === 3) return 0;
  const mpeg1Bitrates = [0, 32, 40, 48, 56, 64, 80, 96, 112, 128, 160, 192, 224, 256, 320];
  const lowerBitrates = [0, 8, 16, 24, 32, 40, 48, 56, 64, 80, 96, 112, 128, 144, 160];
  const sampleRate = [44100, 48000, 32000][sampleRateIndex] / (version === 3 ? 1 : version === 2 ? 2 : 4);
  const bitrate = (version === 3 ? mpeg1Bitrates : lowerBitrates)[bitrateIndex];
  const padding = (header[2] >> 1) & 1;
  return Math.floor((version === 3 ? 144000 : 72000) * bitrate / sampleRate) + padding;
}

async function hasMp3Audio(handle, size) {
  const header = await readHeader(handle, 10, 0);
  let audioStart = 0;
  if (header.length === 10 && header.toString("ascii", 0, 3) === "ID3") {
    const tagSize = header.subarray(6, 10);
    if (tagSize.some(byte => byte > 127)) return false;
    const footer = header[3] === 4 && (header[5] & 0x10) !== 0 ? 10 : 0;
    audioStart = 10 + tagSize.reduce((value, byte) => value * 128 + byte, 0) + footer;
  }

  const firstLength = mpegLayer3FrameLength(await readHeader(handle, 4, audioStart));
  if (!firstLength) return false;
  const secondPosition = audioStart + firstLength;
  const secondLength = mpegLayer3FrameLength(await readHeader(handle, 4, secondPosition));
  return secondLength > 0 && secondPosition + secondLength <= size;
}

async function verifyPreviewAsset(recording, mediaRoot) {
  let handle;
  const field = `${recording.field}.preview.file`;
  try {
    handle = await open(path.join(mediaRoot, recording.file), constants.O_RDONLY | constants.O_NOFOLLOW | constants.O_NONBLOCK);
  } catch {
    throw new Error(`${field}: expected a staged regular file with this name, without symlinks`);
  }

  try {
    const stat = await handle.stat();
    requireValue(stat.isFile(), field, "expected a staged regular file");
    requireValue(stat.size <= MAX_PREVIEW_BYTES, field, "preview must be 4 MiB or smaller");
    const hasAudio = recording.extension === "wav" ? hasWaveAudio : hasMp3Audio;
    requireValue(await hasAudio(handle, stat.size), field, "file header does not contain the declared audio format");
    const hash = createHash("sha256");
    for await (const chunk of handle.createReadStream({ start: 0, autoClose: false })) hash.update(chunk);
    requireValue(hash.digest("hex") === recording.sha256, field, "file bytes do not match the approved SHA-256");
  } finally {
    await handle.close();
  }
}

export async function buildAuthorizedCatalog(intake, { mediaRoot, nowMs = Date.now() } = {}) {
  readObject(intake, "intake");
  requireValue(intake.version === 1, "intake.version", "expected version 1");
  requireValue(Array.isArray(intake.recordings), "intake.recordings", "expected an array");
  requireValue(Number.isFinite(nowMs), "clock", "expected a finite timestamp");
  const recordings = intake.recordings.map((recording, index) => readRecording(recording, index, nowMs));
  const recordingIds = new Set();
  const previewHashes = new Set();
  for (const recording of recordings) {
    requireValue(!recordingIds.has(recording.publication.id), `${recording.field}.id`, "duplicate recording ID");
    requireValue(!previewHashes.has(recording.sha256), `${recording.field}.preview.file`, "duplicate preview bytes");
    recordingIds.add(recording.publication.id);
    previewHashes.add(recording.sha256);
  }
  for (const recording of recordings) await verifyPreviewAsset(recording, mediaRoot);

  return { version: 1, mode: "authorized-previews", recordings: recordings.map(recording => recording.publication) };
}
