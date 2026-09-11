#!/usr/bin/env node

import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const rootDir = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const [indexSource, appSource, stylesSource] = await Promise.all([
  readFile(path.join(rootDir, "index.html"), "utf8"),
  readFile(path.join(rootDir, "app.js"), "utf8"),
  readFile(path.join(rootDir, "styles.css"), "utf8")
]);

assert.match(indexSource, /id="tasteCalibrationScreen"[^>]*aria-labelledby="tasteCalibrationTitle"/, "Calibration needs an accessible screen");
assert.match(indexSource, /id="tasteCalibrationScreen"[^>]*aria-describedby="tasteCalibrationIntro"/, "Calibration introduction must be associated with the screen");
assert.match(indexSource, /id="tasteCalibrationProgress"[^>]*role="progressbar"[^>]*aria-valuemax="3"/, "Calibration progress needs accessible progress semantics");
assert.match(indexSource, /id="tasteCalibrationStatus"[^>]*aria-live="polite"/, "Calibration needs an announced status region");
assert.equal((indexSource.match(/data-taste-step=/g) || []).length, 3, "Calibration must stay at three short steps");
assert.equal((indexSource.match(/data-taste-field="experience"/g) || []).length, 3, "Experience step needs three choices");
assert.equal((indexSource.match(/data-taste-field="goal"/g) || []).length, 3, "Goal step needs track, DJ and set choices");
assert.equal((indexSource.match(/data-taste-field="mood"/g) || []).length, 4, "Mood step needs four choices");
assert.doesNotMatch(indexSource, /data-taste-field="exploration"/, "Exploration must default to balanced instead of adding a fourth onboarding step");
assert.match(indexSource, /data-taste-value="intense"[^>]*><strong>Intenso<\/strong>/, "The intense choice must use the requested concise label");
assert.doesNotMatch(indexSource, /Intenso e de pista/i, "The old intense label must not return");
assert.match(indexSource, /id="tasteCalibrationReopenBtn"/, "Profile needs a recalibration control");

const eligibilitySource = appSource.slice(
  appSource.indexOf("function initialTasteCalibrationEligibleSession"),
  appSource.indexOf("function initialTasteCalibrationStorageKey")
);
assert.match(eligibilitySource, /mode === "google" \|\| mode === "apple"/, "Only online Google/Apple profiles should be eligible");
assert.doesNotMatch(eligibilitySource, /guest|visitor|test|login/, "Guest and local sessions must never trigger calibration");

assert.match(appSource, /INITIAL_TASTE_CALIBRATION_FINAL_STATES = new Set\(\["completed", "skipped"\]\)/, "Completed and skipped states must both suppress the automatic prompt");
assert.match(appSource, /storageKeyForSession\(INITIAL_TASTE_CALIBRATION_STORAGE_KEY/, "Calibration must be isolated by profile");
assert.match(appSource, /\/rest\/v1\/taste_snapshots/, "Calibration must sync through the private taste snapshot");
assert.match(appSource, /preferences: \{ \.\.\.existingPreferences, initialTasteCalibration: calibration \}/, "Cloud saves must preserve existing taste preferences");
assert.match(appSource, /initialTasteCalibration: safeReadJsonStorage\(calibrationKey\)/, "Portable profile backups must include calibration");
assert.match(appSource, /cloudUpdatedAt >= localUpdatedAt/, "Cross-device restore must prefer the newest final state");
assert.equal((appSource.match(/initialTasteCalibrationState = writeInitialTasteCalibrationLocal\(cloudValue\);/g) || []).length, 1, "Cloud calibration should only be persisted once");
assert.match(appSource, /const calibrationShown = await maybeShowInitialTasteCalibration\(continuation\)/, "Online sign-in continuation must check the one-time calibration");
assert.match(appSource, /restoredOnline[\s\S]*?await maybeShowInitialTasteCalibration/, "Stored online sessions must check the one-time calibration");
assert.match(appSource, /document\.body\?\.classList\.add\("taste-calibration-open"\)/, "Calibration must isolate the focused onboarding viewport");
assert.match(appSource, /calibrationBody\.scrollTop = 0/, "Every calibration step must start at the top of its question");
assert.match(appSource, /exploration: select\("exploration", "balanced"\)/, "The removed exploration step must receive a balanced default");
assert.match(appSource, /initialTasteCalibrationAdvanceTimer = window\.setTimeout/, "Each choice must advance the short calibration automatically");
assert.match(appSource, /if \(selectedStep >= 2\)[\s\S]*?completeInitialTasteCalibration/, "The third choice must complete calibration without another CTA tap");
assert.doesNotMatch(appSource, /tasteCalibrationNextBtn/, "The redundant Continue button must not return");

assert.match(appSource, /goal === "dj" \|\| calibration\.goal === "set" \? "djs" : "discover"/, "The result must route to the requested content type");
assert.match(appSource, /runPrimaryRecommendationAction\(\{ source: "initial_calibration" \}\)/, "Track calibration must generate a first recommendation");
assert.match(appSource, /activateDjIntent\(initialTasteCalibrationDjFilter\(calibration\)/, "DJ and set calibration must generate a playable DJ result");
assert.match(appSource, /hardgroove_techno/, "Experienced groovy listeners need a deeper mapped style");
assert.match(appSource, /hypnotic_techno/, "Hypnotic mood needs a mapped style");
assert.match(appSource, /hard_techno/, "Experienced intense listeners need a mapped style");

assert.match(stylesSource, /\.taste-calibration-options button[\s\S]*?min-height:\s*100px/, "Desktop choices need large touch targets");
assert.match(stylesSource, /@media \(max-width: 680px\)[\s\S]*?\.taste-calibration-options[\s\S]*?grid-template-columns:\s*minmax\(0, 1fr\)/, "Calibration choices must stack on phones");
assert.match(stylesSource, /\.taste-calibration-options button:focus-visible/, "Calibration choices need visible keyboard focus");
assert.match(stylesSource, /\.taste-calibration-actions button:disabled/, "Calibration actions need an explicit disabled state");
assert.match(stylesSource, /\.taste-calibration-tap-hint/, "One-tap progression needs a visible instruction");
assert.match(stylesSource, /body\.taste-calibration-open[\s\S]*?overflow:\s*hidden/, "Calibration must prevent competing page scroll");
assert.match(stylesSource, /@media \(max-width: 680px\) and \(max-height: 650px\)[\s\S]*?min-height:\s*48px/, "Short phones need compact, touch-safe choices");
assert.match(stylesSource, /@media \(max-height: 560px\)[\s\S]*?grid-template-areas:/, "Calibration needs a dedicated compact landscape layout");
assert.match(stylesSource, /@media \(prefers-reduced-motion: reduce\)[\s\S]*?taste-calibration-step/, "Calibration motion must respect reduced-motion preferences");

console.log("Initial taste calibration contract passed: one-time login gate, private sync, recalibration and personalized routing are wired.");
