#!/usr/bin/env node

import assert from "node:assert/strict";
import { createAppRuntimeTestContext } from "./app-runtime-test-harness.mjs";

const track = (artist, song, energy = "mid") => ({
  artist, song, energy, style: "house", bpmExact: 124,
  previewUrl: "https://example.test/preview.wav"
});
const liked = track("Frankie Knuckles", "The Whistle Song", "high");
const first = track("Kerri Chandler", "Atmosphere", "low");
const similar = track("Larry Heard", "Can You Feel It", "high");
const noop = () => {};

function testContext() {
  const context = createAppRuntimeTestContext();
  const idle = [];
  const effects = [];
  context.currentAuthUser = { mode: "login", username: "Feedback test profile" };
  context.currentRecommendation = liked;
  context.lastPrefs = { style: "house", bpm: "120-130" };
  context.swipeUserAnchoredStyle = "house";
  context.canUseMusicDiscovery = () => true;
  context.t = key => key;
  context.stopPlaybackForFeedbackTransition = noop;
  context.playUiSfx = noop;
  context.burstConfetti = noop;
  context.showToast = noop;
  context.shouldCelebrateSpiritUnlockOnSongs = () => false;
  context.syncQuickKnownDecision = noop;
  context.schedulePostBootIdleTask = callback => idle.push(callback);
  context.runPositiveFeedbackFollowups = async () => {};
  context.updateStats = noop;
  context.finishTrackLibraryFeedback = action => effects.push(action);
  context.recordDailyMusicAction = () => effects.push("daily");
  context.trackRecommendationEvent = (event, _track, _prefs, details) => effects.push([event, details.reason || ""]);
  context.trackBetaReactionMilestone = () => effects.push("milestone");
  context.saveProgress = () => effects.push("saved");
  return { context, idle, effects };
}

{
  const { context, idle, effects } = testContext();
  // Isolate only the available inventory and route verification. Eligibility,
  // affinity, queue reranking, Library mutation, and the swipe handler are real.
  context.styleEl = { value: "house", options: [{ value: "house" }] };
  context.catalog = [liked, first, similar];
  context.suggestionQueueTracks = [first, similar];
  context.prewarmedSwipeTrackKeys = new Set([first, similar].map(context.recommendationTrackKey));
  assert.equal(context.pickInstantSwipeTrack({ sourceTrack: liked }).track, first, "The original queue order wins without a reaction");
  let selected;
  context.advanceAfterSwipeFeedback = args => {
    assert.deepEqual(effects, [], "The next picker runs before storage, analytics, or Library rendering");
    assert.equal(context.likedTrackHistory[0].song, liked.song, "The explicit like is available in memory immediately");
    selected = context.pickInstantSwipeTrack({ sourceTrack: args.likedTrack }).track;
    return true;
  };
  assert.equal(await context.likeCurrentTrackFromSwipe(), true);
  assert.equal(selected, similar, "The real next picker reranks a cached queue using the energy of the liked recording");
  assert.equal(context.userStats.swipeTrainingSignals, 1);
  assert.equal(context.adaptiveModel.likedEnergies.get("high"), 0.6);
  idle.splice(0).forEach(callback => callback());
  assert.equal(context.adaptiveModel.likedEnergies.get("high"), 0.6, "Idle effects must not apply the taste signal twice");
  assert.deepEqual(effects, ["liked_track", "daily", ["track_liked", ""], "milestone", "saved"]);
}

{
  const { context } = testContext();
  const unrelated = { ...track("Robert Hood", "Museum", "high"), style: "techno", bpmExact: 126 };
  context.styleEl = { value: "house", options: [{ value: "house" }, { value: "techno" }] };
  context.catalog = [liked, first, unrelated];
  context.suggestionQueueTracks = [unrelated, first];
  context.prewarmedSwipeTrackKeys = new Set([unrelated, first].map(context.recommendationTrackKey));
  context.adaptiveModel.likedStyles.set("techno", 30);
  assert.equal(context.pickInstantSwipeTrack({ sourceTrack: liked }).track, first,
    "A highly preferred card in the old warmed queue cannot leak into an explicitly anchored style");
}

{
  const { context, idle, effects } = testContext();
  let neutralRuns = 0;
  context.runPrimaryRecommendationAction = ({ source }) => {
    assert.equal(source, "feedback_neutral");
    neutralRuns += 1;
    return true;
  };
  context.tryAdvanceNegativeFeedbackInstantly = () => assert.fail("Unheard feedback may not use the negative musical picker");
  assert.equal(await context.passCurrentTrackFromSwipe(), true);
  assert.equal(neutralRuns, 1);
  assert.equal(context.userStats.skipped, 1);
  assert.equal(context.swipeTrainingSignalCount(), 0);
  assert.equal(context.adaptiveModel.dislikedStyles.size, 0);
  assert.equal(context.rejectedArtists.size, 0);
  assert.equal(context.dislikedTrackHistory[0].source, "unheard_pass");
  assert.equal(context.seenTrackKeysMemory.has(context.recommendationTrackKey(liked)), true);
  idle.splice(0).forEach(callback => callback());
  assert.deepEqual(effects, ["disliked_track", ["track_disliked", "unheard_pass"], "saved"]);

  // Simulate a Library sync on another client. Source survives the row's round
  // trip, the individual recording stays seen, and no artist/style debt arrives.
  const { context: restored } = testContext();
  const restoredEntry = restored.socialDislikedTrackFromRow({
    target_key: context.recommendationTrackKey(liked), artist: liked.artist,
    song: liked.song, style: liked.style, source: "unheard_pass"
  });
  restored.dislikedTrackHistory = [restoredEntry];
  restored.applyCloudDislikedTrackSignals([restoredEntry]);
  assert.equal(restored.swipeTrainingSignalCount(), 0);
  assert.equal(restored.trackPreferenceSignals.size, 0);
  assert.equal(restored.adaptiveModel.dislikedStyles.size, 0);
  assert.equal(restored.seenTrackKeysMemory.has(restoredEntry.key), true);
}

{
  const { context } = testContext();
  context.swipeUserAnchoredStyle = "";
  context.bpmEl = { value: "120-130" };
  let filteredCalls = 0;
  context.runManualFilterSurprise = () => {
    filteredCalls += 1;
    return false;
  };
  context.pickWebOpeningSequenceTrack = () => assert.fail("An exhausted BPM-only swipe cannot reach the unfiltered ladder");
  context.runPrimaryRecommendationAction = () => assert.fail("An unheard BPM-only swipe must also keep the tempo lock");
  assert.equal(await context.advanceAfterSwipeFeedback({ likedTrack: liked, positive: true }), false);
  assert.equal(await context.advanceAfterSwipeFeedback({ likedTrack: liked, positive: false, feedbackReason: "unheard_pass" }), false);
  assert.equal(filteredCalls, 2);
}

{
  const { context, idle, effects } = testContext();
  const pending = context.registerTrackFeedback(liked, true, { source: "swipe_like", heard: true, deferEffects: true });
  assert.equal(pending, "liked");
  context.recommendationSessionGeneration += 1;
  idle.splice(0).forEach(callback => callback());
  assert.deepEqual(effects, [], "Old storage and analytics do not write to the newly active profile");
}

{
  const { context } = testContext();
  context.buildSwipeAdaptiveStylePlan = () => ({ styles: ["house", "deep_house"] });
  context.selectableSwipeStyle = value => value;
  let overlayCalls = 0;
  let releaseOverlay;
  context.generateRecommendationWithOverlay = () => {
    overlayCalls += 1;
    return new Promise(resolve => { releaseOverlay = resolve; });
  };
  const pending = context.generateAdaptiveSwipeNext({ sourceTrack: liked });
  assert.equal(overlayCalls, 1);
  context.recommendationSessionGeneration += 1;
  releaseOverlay(false);
  assert.equal(await pending, false);
  assert.equal(overlayCalls, 1, "An old adaptive retry may not select a card for the new account");
}

{
  const { context } = testContext();
  context.pickWebOpeningSequenceTrack = () => null;
  context.pickInstantPrimaryNextTrack = () => null;
  context.tryAdvanceSwipeInstantly = () => false;
  context.tryPresentInteractionBudgetRecommendation = () => false;
  context.swipeUserAnchoredStyle = "";
  let releaseAdaptive;
  context.generateAdaptiveSwipeNext = () => new Promise(resolve => { releaseAdaptive = resolve; });
  context.runSurpriseRecommendation = () => assert.fail("Old adaptive completion may not start a new surprise");
  const pending = context.advanceAfterSwipeFeedback({ likedTrack: liked });
  context.recommendationSessionGeneration += 1;
  releaseAdaptive(false);
  assert.equal(await pending, false);
}

{
  const { context } = testContext();
  const animatedEl = { classList: { add: noop, remove: noop }, style: { setProperty: noop } };
  context.swipeAnimationElement = () => animatedEl;
  context.animateSwipeCommit = noop;
  context.consumeDailyLike = () => true;
  context.resetSwipeCardPosition = () => assert.fail("An old swipe may not reset the position in the next profile");
  let releaseSwipe;
  context.likeCurrentTrackFromSwipe = () => new Promise(resolve => { releaseSwipe = resolve; });
  const pending = context.completeSwipeFeedback("like", animatedEl);
  context.recommendationSessionGeneration += 1;
  context.swipeFeedbackBusy = true; // the next profile already owns a new swipe
  releaseSwipe(true);
  await pending;
  assert.equal(context.swipeFeedbackBusy, true, "An old finally block may not unlock the next profile's swipe");
}

console.log("Swipe learning passed: immediate queued reranking, neutral unheard pass, cloud restore, and stale swipe isolation.");
