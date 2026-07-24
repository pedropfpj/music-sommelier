#!/usr/bin/env node

import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import path from "node:path";
import vm from "node:vm";
import { fileURLToPath } from "node:url";

const rootDir = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const appSource = await readFile(path.join(rootDir, "app.js"), "utf8");

function functionSource(name) {
  const marker = `function ${name}`;
  const markerIndex = appSource.indexOf(marker);
  assert.ok(markerIndex >= 0, `Missing function: ${name}`);
  const asyncIndex = appSource.lastIndexOf("async ", markerIndex);
  const start = asyncIndex >= markerIndex - 8 ? asyncIndex : markerIndex;
  const signatureEnd = appSource.indexOf(") {", markerIndex);
  assert.ok(signatureEnd >= 0, `Missing function body: ${name}`);
  const bodyStart = signatureEnd + 2;
  let depth = 0;
  let quote = "";
  let escaped = false;
  let lineComment = false;
  let blockComment = false;

  for (let index = bodyStart; index < appSource.length; index += 1) {
    const character = appSource[index];
    const next = appSource[index + 1];
    if (lineComment) {
      if (character === "\n") lineComment = false;
      continue;
    }
    if (blockComment) {
      if (character === "*" && next === "/") {
        blockComment = false;
        index += 1;
      }
      continue;
    }
    if (quote) {
      if (escaped) escaped = false;
      else if (character === "\\") escaped = true;
      else if (character === quote) quote = "";
      continue;
    }
    if (character === "/" && next === "/") {
      lineComment = true;
      index += 1;
      continue;
    }
    if (character === "/" && next === "*") {
      blockComment = true;
      index += 1;
      continue;
    }
    if (character === '"' || character === "'" || character === "`") {
      quote = character;
      continue;
    }
    if (character === "{") depth += 1;
    if (character === "}") depth -= 1;
    if (depth === 0) return appSource.slice(start, index + 1);
  }
  throw new Error(`Unclosed function: ${name}`);
}

const primaryAction = functionSource("runPrimaryRecommendationAction");
assert.match(
  primaryAction,
  /manualPrefsAreActive\(manualPrefs\)[\s\S]*runManualFilterSurprise\(\)/,
  "The primary CTA must route changed manual filters through the filtered recommendation flow"
);

const instantPresenter = functionSource("presentInstantSwipeRecommendation");
assert.match(
  instantPresenter,
  /requestedPrefs\.style[\s\S]*selectableSwipeStyle\(track\.style[\s\S]*!== requestedPrefs\.style[\s\S]*return false/,
  "Instant cards must reject a track outside the explicitly requested subgenre"
);
assert.match(
  instantPresenter,
  /trackBlockedByKnownSignals\(track\)[\s\S]*return false/,
  "Instant cards must reject tracks already shown or explicitly disliked"
);
assert.match(
  instantPresenter,
  /trackMatchesRequestedSubgenreEvidence\(track,\s*requestedPrefs\)[\s\S]*return false/,
  "Instant cards must reject unproven fine-subgenre classifications"
);
assert.match(
  instantPresenter,
  /recommendationArtistBlockedForPresentation\(track\)[\s\S]*return false/,
  "The final instant-card gate must reject a recently presented artist"
);

const subgenreEvidenceGate = functionSource("trackMatchesRequestedSubgenreEvidence");
assert.match(
  subgenreEvidenceGate,
  /FINE_SUBGENRE_EVIDENCE_STYLES\.has\(requestedStyle\)[\s\S]*trackStyleCertainty\(track\) === "confirmed"/,
  "Fine-subgenre requests must require confirmed catalog evidence"
);

const interactionPicker = functionSource("pickInteractionBudgetTrack");
assert.doesNotMatch(
  interactionPicker,
  /for \(const allowSeen of \[false,\s*true\]\)/,
  "The fast interaction path must not silently re-enable already seen tracks"
);
assert.match(
  interactionPicker,
  /if \(!normalizedPrefs\.style\) \{[\s\S]*const relaxedPrefs[\s\S]*for \(const track of catalog\)/,
  "Global catalog widening must be limited to sessions without an explicit subgenre"
);
assert.match(
  functionSource("interactionFallbackTrackAllowed"),
  /trackMatchesRequestedSubgenreEvidence\(track,\s*prefs\)[\s\S]*return false/,
  "The interaction fallback must keep the verified fine-subgenre contract"
);

const generator = functionSource("generateRecommendationFromPrefs");
assert.match(
  generator,
  /const isStyleFallbackLocked = \(\) => Boolean\(prefs\?\.style\)/,
  "An explicit subgenre must never be silently replaced with another style"
);
assert.match(
  generator,
  /recommendationSnapshot\.style !== prefs\.style \|\|[\s\S]*trackMatchesRequestedSubgenreEvidence\(recommendationSnapshot,\s*prefs\)/,
  "The final recommendation snapshot must pass the subgenre evidence gate"
);

const instantPrimaryPicker = functionSource("pickInstantPrimaryNextTrack");
assert.doesNotMatch(
  instantPrimaryPicker,
  /allowSeenTrack:\s*true/,
  "Other-track must not recycle a seen track when a subgenre is exhausted"
);
assert.doesNotMatch(
  instantPrimaryPicker,
  /allowSeenArtist:\s*true/,
  "Other-track must never relax the artist-repeat guard"
);
assert.match(
  instantPrimaryPicker,
  /buildGlobalArtistExclusionSet\(sourceTrack\?\.artist[\s\S]*artistSetHasMatch\(blockedArtists,\s*track\.artist\)/,
  "Other-track must exclude every artist already presented in the session"
);

const recentArtistGuard = functionSource("recommendationArtistBlockedForPresentation");
assert.match(
  recentArtistGuard,
  /artistsShareIdentity\(currentTrack\.artist,\s*candidateArtist\)[\s\S]*artistWasRecentlyPresented\(candidateArtist\)/,
  "Artist repeat protection must cover both the current card and the persisted recent window"
);

const playableReplacement = functionSource("pickPlayableReplacementForPrefs");
assert.match(
  playableReplacement,
  /buildRecentArtistExclusionSet\(currentTrack\?\.artist[\s\S]*artistSetHasMatch\(hardRecentArtists,\s*track\.artist\)/,
  "Preview recovery must not replace a failed track with another track by the same recent artist"
);

const artistGuardContext = {
  RECENT_PRESENTED_ARTIST_LIMIT: 12,
  recentPresentedArtists: [],
  currentRecommendation: null
};
vm.runInNewContext(
  [
    "normalize",
    "canonicalArtistIdentity",
    "artistMatchKey",
    "artistCreditComponents",
    "artistMatchingKeys",
    "addArtistKeysToSet",
    "artistSetHasMatch",
    "artistsShareIdentity",
    "sanitizeRecentPresentedArtists",
    "rememberRecentlyPresentedArtist",
    "buildRecentArtistExclusionSet",
    "artistWasRecentlyPresented",
    "recommendationArtistBlockedForPresentation"
  ].map(functionSource).join("\n") +
    "; this.remember = rememberRecentlyPresentedArtist;" +
    " this.blocked = recommendationArtistBlockedForPresentation;" +
    " this.sameArtist = artistsShareIdentity;",
  artistGuardContext
);
assert.equal(
  artistGuardContext.sameArtist("Amelie Lens", "Amelie Lens x Farrago"),
  true,
  "A collaboration credit must still match the already presented lead artist"
);
artistGuardContext.remember("Amelie Lens");
assert.equal(
  artistGuardContext.blocked({ artist: "Amelie Lens", song: "Another Track" }),
  true,
  "A different track by Amelie Lens must be rejected inside the recent-artist window"
);
assert.equal(
  artistGuardContext.blocked({ artist: "Charlotte de Witte", song: "Fresh Track" }),
  false,
  "A genuinely different artist must remain eligible"
);
[
  "Charlotte de Witte",
  "ANNA",
  "Adam Beyer",
  "Enrico Sangiuliano",
  "FJAAK",
  "Dax J",
  "Paula Temple",
  "Rene Wise",
  "Regal",
  "UMEK",
  "Layton Giordani",
  "Sama Abdulhadi"
].forEach(artistGuardContext.remember);
assert.equal(
  artistGuardContext.blocked({ artist: "Amelie Lens", song: "Later Discovery" }),
  false,
  "An artist may return after twelve genuinely different artists, but never in a consecutive burst"
);

const knownSignalGate = functionSource("trackBlockedByKnownSignals");
assert.match(
  knownSignalGate,
  /dislikedTrackHistory\.some/,
  "Persisted disliked history must be a hard exclusion signal"
);

const dislikeMemory = functionSource("rememberDislikedTrack");
assert.match(
  dislikeMemory,
  /seenTrackKeysMemory\.add\(entry\.key\)/,
  "A disliked track must immediately join the seen-track exclusion ledger"
);
assert.match(
  dislikeMemory,
  /queueSocialSync\("disliked_track"\)/,
  "A disliked track must be queued for account sync"
);

const socialSync = functionSource("syncSocialLikedTracks");
assert.match(
  socialSync,
  /restoreSocialDislikedTracksFromCloud/,
  "Account sync must restore disliked tracks before recommending"
);
assert.match(
  socialSync,
  /\/rest\/v1\/track_feedback\?on_conflict=user_id,target_key/,
  "Account sync must persist disliked tracks in the feedback table"
);

const cloudDislikeRestore = functionSource("restoreSocialDislikedTracksFromCloud");
assert.match(
  cloudDislikeRestore,
  /cloudDislikedKeys[\s\S]*likedTrackHistory = likedTrackHistory\.filter/,
  "A cloud rejection must override a stale local like for the same track"
);

console.log("Recommendation safety contract passed: manual subgenres and rejection history are hard constraints.");
