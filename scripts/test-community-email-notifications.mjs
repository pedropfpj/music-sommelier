import assert from "node:assert/strict";
import { createRequire } from "node:module";

const require = createRequire(import.meta.url);
const {
  actorName,
  buildCommunityEmail,
  notifyCommunityActivity
} = require("../lib/api/_community-email.js");

const env = {
  SONIC_COMMUNITY_EMAIL_NOTIFICATIONS_ENABLED: "true",
  SONIC_COMMUNITY_NOTIFICATION_EMAIL: "pedropfpj@gmail.com",
  SONIC_COMMUNITY_NOTIFICATION_FROM: "Sonic Search <onboarding@resend.dev>",
  SONIC_PUBLIC_APP_URL: "https://sonicsearch.app",
  RESEND_API_KEY: "re_test_key"
};

const event = {
  id: "comment-123",
  kind: "comment",
  actor: { displayName: "listener@example.com", username: "pedro_dj" },
  body: "Gostei de <Chemical Brothers> & Daft Punk.",
  targetType: "artist",
  targetLabel: "The Chemical Brothers",
  style: "Big Beat",
  createdAt: "2026-07-13T21:00:00.000Z"
};

assert.equal(actorName(event.actor), "pedro_dj");
const built = buildCommunityEmail(event, {
  from: env.SONIC_COMMUNITY_NOTIFICATION_FROM,
  recipients: [env.SONIC_COMMUNITY_NOTIFICATION_EMAIL],
  appUrl: env.SONIC_PUBLIC_APP_URL
});
assert.deepEqual(built.to, ["pedropfpj@gmail.com"]);
assert.match(built.subject, /Novo comentário/);
assert.match(built.text, /pedro_dj/);
assert.doesNotMatch(built.text, /listener@example\.com/);
assert.match(built.html, /&lt;Chemical Brothers&gt; &amp; Daft Punk/);

let request;
const result = await notifyCommunityActivity(event, {
  env,
  fetchImpl: async (url, options) => {
    request = { url, options };
    return {
      ok: true,
      status: 200,
      text: async () => JSON.stringify({ id: "email-123" })
    };
  }
});

assert.deepEqual(result, { sent: true, id: "email-123" });
assert.equal(request.url, "https://api.resend.com/emails");
assert.equal(request.options.headers.Authorization, "Bearer re_test_key");
assert.equal(request.options.headers["Idempotency-Key"], "sonic-community-comment-123");
assert.deepEqual(JSON.parse(request.options.body).to, ["pedropfpj@gmail.com"]);

const reportEmail = buildCommunityEmail({
  id: "report-123",
  kind: "report",
  actor: { displayName: "Moderation reporter" },
  body: "Reported content preview",
  targetType: "comment",
  targetId: "comment-456",
  targetAuthorId: "user-789",
  reason: "inappropriate_content",
  createdAt: "2026-07-21T22:00:00.000Z"
}, {
  from: env.SONIC_COMMUNITY_NOTIFICATION_FROM,
  recipients: [env.SONIC_COMMUNITY_NOTIFICATION_EMAIL],
  appUrl: env.SONIC_PUBLIC_APP_URL
});
assert.match(reportEmail.subject, /Denúncia de conteúdo/);
assert.match(reportEmail.text, /comment-456/);
assert.match(reportEmail.text, /inappropriate_content/);

const providerFailure = await notifyCommunityActivity(event, {
  env,
  fetchImpl: async () => ({
    ok: false,
    status: 422,
    text: async () => "invalid sender"
  })
});
assert.deepEqual(providerFailure, { sent: false, error: "delivery_failed" });

console.log("Community email notification tests passed.");
