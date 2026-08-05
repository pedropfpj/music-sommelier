#!/usr/bin/env node

import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const rootDir = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const source = fs.readFileSync(path.join(rootDir, "newsroom.js"), "utf8");
const styles = fs.readFileSync(path.join(rootDir, "newsroom.css"), "utf8");
const index = fs.readFileSync(path.join(rootDir, "index.html"), "utf8");

assert.match(source, /function selectArticleVisual[\s\S]*usedImageKeys\.has/);
assert.match(source, /const usedImageKeys = new Set\(\);[\s\S]*coverNode\(article, usedImageKeys\)/);
assert.match(source, /mediaEntries\(article\)[\s\S]*deduplicated/);
assert.match(source, /OUTRA LEITURA/);
assert.match(source, /articleMonogram/);
assert.match(styles, /data-visual-state="deduplicated"/);
assert.match(styles, /\.sonic-editorial-fallback/);
assert.match(index, /newsroom\.js\?v=20260805feedback1/);
assert.match(index, /newsroom\.css\?v=20260805feedback1/);

console.log("Newsroom visual policy passed: duplicate covers use alternate media or an editorial fallback.");
