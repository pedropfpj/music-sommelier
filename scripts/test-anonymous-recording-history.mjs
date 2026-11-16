import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { createRequire } from "node:module";
import { createAppRuntimeTestContext } from "./app-runtime-test-harness.mjs";

const require = createRequire(import.meta.url);
const discovery = require("../discovery-experience.js");
const source = process.env.SONIC_ANONYMOUS_HISTORY_APP_PATH
  ? await readFile(process.env.SONIC_ANONYMOUS_HISTORY_APP_PATH, "utf8")
  : undefined;
const original = { artist: "Artist A", song: "Polyrhythm", isrc: "BRABC2600001" };
const sameRecording = { artist: "Artist A feat B", song: "Polyrhythm (2026 reissue)", isrc: "BR-ABC-26-00001" };
const remix = { ...sameRecording, song: "Polyrhythm (New Remix)", isrc: "BRABC2600002" };

function storageFixture() {
  const values = new Map();
  return {
    getItem: key => values.get(key) ?? null,
    setItem: (key, value) => values.set(key, String(value)),
    removeItem: key => values.delete(key)
  };
}

function visit(localStorage = storageFixture()) {
  const ctx = createAppRuntimeTestContext(source);
  ctx.currentAuthUser = { mode: "visitor", providerId: "fixture-visitor" };
  ctx.localStorage = localStorage;
  ctx.window.SonicDiscoveryExperience = discovery;
  ctx.recordGlobalDiscoveryExposure = async () => null;
  return ctx;
}

{
  const storage = storageFixture();
  const first = visit(storage);
  first.rememberAnonymousExposure(original);
  const returning = visit(storage);
  assert.equal(returning.trackBlockedByKnownSignals(sameRecording), true, "An exact recording reissue is not new just because the provider changed its title and credit");
  assert.equal(returning.trackBlockedByKnownSignals(remix), false, "A named remix with a different identity remains eligible");
  returning.currentAuthUser = { mode: "google", providerId: "fixture-account" };
  assert.equal(returning.trackBlockedByKnownSignals(sameRecording), false, "The visitor ledger stays separate from account decisions");
  assert.equal(visit().trackBlockedByKnownSignals(sameRecording), false, "A genuinely clean browser has no visitor history");
}

{
  const storage = storageFixture();
  const firstTab = visit(storage);
  const secondTab = visit(storage);
  assert.equal(secondTab.trackBlockedByKnownSignals(original), false, "Load the initially empty tab cache");
  firstTab.rememberAnonymousExposure(original);
  secondTab.invalidateAnonymousExposureFromStorage({ key: firstTab.ANONYMOUS_EXPOSURE_STORAGE_KEY });
  assert.equal(secondTab.trackBlockedByKnownSignals(original), true, "Another tab's display invalidates a cached exclusion set");
  const third = { artist: "Artist C", song: "Third track" };
  firstTab.rememberAnonymousExposure(third);
  // No storage event is delivered before this write. Read current storage so
  // recording a different display cannot discard the first tab's update.
  secondTab.rememberAnonymousExposure(remix);
  const reopened = visit(storage);
  assert.equal(reopened.trackBlockedByKnownSignals(third), true, "Both tabs' distinct presents must survive the next browser entry");
  assert.equal(reopened.trackBlockedByKnownSignals(remix), true);
  storage.removeItem(reopened.ANONYMOUS_EXPOSURE_STORAGE_KEY);
  reopened.invalidateAnonymousExposureFromStorage({ key: null });
  assert.equal(reopened.trackBlockedByKnownSignals(third), false, "Clearing site data clears this local history too");
}

{
  const storage = storageFixture();
  const first = visit(storage);
  const trackKey = first.recommendationTrackKey(original);
  storage.setItem(first.ANONYMOUS_EXPOSURE_STORAGE_KEY, JSON.stringify([{ trackKey, artistKey: "artist a", at: 1 }]));
  assert.equal(first.trackBlockedByKnownSignals(original), true, "Legacy title-only ledger remains supported");
  for (let i = 0; i < 54; i++) first.rememberAnonymousExposure({ artist: "Many releases", song: `Track ${i}` });
  assert.equal(visit(storage).trackBlockedByKnownSignals(original), true, "History covers multiple 20-swipe visits even after the former 50-record limit");
}

{
  const blockedStorage = { getItem() { throw new Error("read blocked"); }, setItem() { throw new Error("write blocked"); } };
  const ctx = visit(blockedStorage);
  ctx.rememberAnonymousExposure(original);
  ctx.rememberAnonymousExposure(remix);
  assert.equal(ctx.trackBlockedByKnownSignals(sameRecording), true, "Blocked storage still keeps the active tab's exposures");
  assert.equal(ctx.trackBlockedByKnownSignals(remix), true);
}

{
  const exactId = "soundcloud:123456";
  const first = visit();
  first.rememberAnonymousExposure({ ...original, isrc: "", catalogMetadata: { recording_id: exactId } });
  assert.equal(first.trackBlockedByKnownSignals({ ...sameRecording, isrc: "", catalogMetadata: { recording_id: exactId } }), true);
  assert.equal(first.trackBlockedByKnownSignals({ ...sameRecording, isrc: "", catalogMetadata: { recording_id: "bandcamp:123456" } }), false, "Two providers' numeric ids are independent");
}

{
  const storage = storageFixture();
  const recordingMusicBrainzId = "0d1f8c42-437d-482b-b0dc-e10893fd09fd";
  visit(storage).rememberAnonymousExposure({ ...original, isrc: "", recordingMusicBrainzId });
  const relinked = { ...sameRecording, isrc: "", catalogMetadata: { recording_id: `mbid:${recordingMusicBrainzId}` } };
  assert.equal(visit(storage).trackBlockedByKnownSignals(relinked), true, "A MusicBrainz identity survives browser storage and matches the reviewed id");
}

console.log("Anonymous recording history passed: alternate credit/edition identity, named remix, separate accounts, clean browsers, cross-tab updates, old storage and blocked storage.");
