import assert from "node:assert/strict";
import { createRequire } from "node:module";

const require = createRequire(import.meta.url);
const {
  assessUserGeneratedText,
  createModerationReport,
  normalizedModerationText,
  readBlockedUserIds,
  setBlockedUser
} = require("../lib/api/_ugc-safety.js");

assert.equal(assessUserGeneratedText("Qual DJ vocês querem ver no próximo festival?").allowed, true);
assert.equal(assessUserGeneratedText("The Killers tocaram um set ótimo.").allowed, true);
assert.equal(assessUserGeneratedText("I will kill you").allowed, false);
assert.equal(assessUserGeneratedText("Eu vou te matar").allowed, false);
assert.equal(assessUserGeneratedText("child porn link").allowed, false);
assert.equal(
  assessUserGeneratedText("https://a.test https://b.test https://c.test https://d.test").code,
  "link_spam"
);
assert.equal(normalizedModerationText("violência na pista"), "violencia na pista");

const objects = new Map();
const originalFetch = global.fetch;
global.fetch = async (url, options = {}) => {
  const path = String(url).split("/storage/v1/")[1] || "";
  const method = options.method || "GET";
  if (path.startsWith("bucket/")) {
    return { ok: true, status: 200, text: async () => "{}" };
  }
  if (path.startsWith("object/")) {
    const key = path.replace(/^object\/sonic-social-comments\//, "");
    if (method === "GET") {
      if (!objects.has(key)) return { ok: false, status: 404, text: async () => "{}" };
      return { ok: true, status: 200, text: async () => JSON.stringify(objects.get(key)) };
    }
    if (method === "POST") {
      const payload = JSON.parse(options.body || "{}");
      objects.set(key, payload);
      return { ok: true, status: 200, text: async () => "{}" };
    }
  }
  throw new Error(`Unexpected storage request: ${method} ${path}`);
};

const config = { supabaseUrl: "https://example.supabase.co", serviceKey: "service-test" };
const blocked = await setBlockedUser(config, "viewer-1", "author-2", true);
assert.deepEqual(blocked, ["author-2"]);
assert.deepEqual(await readBlockedUserIds(config, "viewer-1"), ["author-2"]);
const unblocked = await setBlockedUser(config, "viewer-1", "author-2", false);
assert.deepEqual(unblocked, []);

const report = await createModerationReport(config, {
  reporterUserId: "viewer-1",
  targetType: "comment",
  targetId: "comment-1",
  targetAuthorId: "author-2",
  reason: "inappropriate_content",
  excerpt: "reported preview"
});
assert.equal(report.status, "open");
assert.equal(report.targetId, "comment-1");
assert.ok(Array.from(objects.keys()).some((key) => key.includes("moderation/v1/reports/")));

global.fetch = originalFetch;

console.log("UGC safety filter tests passed.");
