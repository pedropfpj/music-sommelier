import assert from "node:assert/strict";
import { auditAuthorizedCatalog } from "./authorized-catalog-coverage.mjs";

const at = "2026-11-16T00:00:00.000Z";
const pilotRow = {
  artist: "Crédito A",
  style: "full_on_night",
  availableFrom: at,
  expiresAt: "2026-11-17T00:00:00.000Z"
};
function recording(number, bpm, fields = {}) {
  const id = `isrc:QZAAA26000${number}`;
  const previewPath = `/api/authorized-audio?file=${number.padStart(64, "0")}.mp3`;
  return { ...pilotRow, id, bpm, title: `Faixa ${number}`, previewPath, ...fields };
}
const manifest = {
  version: 1,
  mode: "authorized-previews",
  recordings: [
    recording("01", 145),
    recording("02", 155, { artist: "  crédito a  " }),
    recording("03", 156),
    recording("04", 150, { expiresAt: at, availableFrom: "2026-11-15T00:00:00.000Z" }),
    recording("05", 150, { availableFrom: "2026-11-16T00:01:00.000Z" }),
    recording("06", 128, { style: "bleep_techno" })
  ]
};

const report = await auditAuthorizedCatalog(manifest, at);
const [fullOn, bleep, french] = report.slices;
assert.equal(report.auditedApprovedManifest, true);
assert.equal(report.asOf, new Date(at).toISOString());
assert.deepEqual(fullOn.activeApprovedPreviews, { exactRecordingIds: 2, artistCredits: 1 });
assert.deepEqual(bleep.activeApprovedPreviews, { exactRecordingIds: 1, artistCredits: 1 });
assert.deepEqual(french.activeApprovedPreviews, { exactRecordingIds: 0, artistCredits: 0 });

assert.equal(fullOn.shardWithinRequestedRange.rows, fullOn.shardWithinRequestedRange.numericBpmRows);
assert.ok(fullOn.runtimeShard.rows > fullOn.shardWithinRequestedRange.rows);
for (const slice of report.slices) {
  assert.equal(Object.values(slice.runtimeShard.routes).reduce((sum, count) => sum + count, 0), slice.runtimeShard.rows);
}
assert.equal(bleep.reviewedOverlay.rows, bleep.reviewedOverlay.providers.bandcamp + bleep.reviewedOverlay.providers.apple_music);

const unaudited = await auditAuthorizedCatalog(null, at);
assert.equal(unaudited.auditedApprovedManifest, false);
assert.ok(unaudited.slices.every(row => row.activeApprovedPreviews === null));

await assert.rejects(auditAuthorizedCatalog({ version: 0 }, at), /manifesto/);
await assert.rejects(auditAuthorizedCatalog(manifest, "invalid"), /--as-of/);
const badDates = { ...manifest, recordings: [recording("07", 150, { expiresAt: at })] };
const failClosed = await auditAuthorizedCatalog(badDates, at);
assert.ok(failClosed.slices.every(row => row.activeApprovedPreviews.exactRecordingIds === 0));

console.log("Authorized catalog coverage passed");
