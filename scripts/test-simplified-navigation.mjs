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

const primaryTargets = Array.from(indexSource.matchAll(/data-app-tab-target="([^"]+)"[^>]*data-primary-app-tab/g), (match) => match[1]);
assert.deepEqual(primaryTargets, ["discover", "djs", "news", "profile", "more"], "Primary navigation order must stay focused");
assert.doesNotMatch(indexSource, /data-app-tab-target="filters"/, "Filters must not return to primary navigation");
assert.match(indexSource, /id="discoverFiltersBtn"/, "Discover needs a contextual filters shortcut");
assert.match(indexSource, /id="morePanel"[\s\S]*?data-more-tab-target="about"[\s\S]*?data-more-tab-target="support"[\s\S]*?data-more-tab-target="legal"/, "More must group institutional routes");
assert.match(appSource, /if \(safeTab === "filters"\) return "discover";/, "Filters must keep Discover selected");
assert.match(appSource, /\["more", "about", "support", "legal", "admin"\]\.includes\(safeTab\)\) return "more";/, "Secondary routes must keep More selected");
assert.match(appSource, /bind\(discoverFiltersBtn,[\s\S]*?setActiveAppTab\("filters"/, "Filters shortcut must navigate");
assert.match(appSource, /bind\(morePanel,[\s\S]*?data-more-tab-target[\s\S]*?setActiveAppTab\(nextTab/, "More cards must navigate");
assert.match(appSource, /const navElement = compactNav \? appMenuBtn : appTabBar;/, "Mobile panel focus must measure the compact menu button");
assert.match(stylesSource, /\.discover-filters-btn[\s\S]*?min-height:\s*44px/, "Filters shortcut needs an accessible touch target");
assert.match(stylesSource, /@media \(max-width: 760px\)[\s\S]*?\.more-route-grid[\s\S]*?grid-template-columns:\s*minmax\(0, 1fr\)/, "More cards must stack on phones");

console.log("Simplified navigation contract passed: five primary destinations with contextual Filters and More routes.");
