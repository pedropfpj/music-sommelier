import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import vm from "node:vm";

const app = await readFile(process.env.SONIC_SOCIAL_IDENTITY_APP_PATH || new URL("../app.js", import.meta.url), "utf8");
function source(name) {
  const start = app.search(new RegExp(`(?:^|\\n)(?:async )?function ${name}\\(`));
  assert.ok(start >= 0, `Missing runtime function ${name}`);
  const end = app.indexOf("\n}", start);
  assert.ok(end > start);
  return app.slice(start, end + 2);
}
const identityNames = ["socialCleanUsername", "socialSessionMetadata", "socialPublicIdentityText", "socialDefaultIdentityName", "socialSafeAvatarUrl", "socialSuggestedUsername", "socialSuggestedDisplayName", "socialCurrentPublicIdentity", "socialCurrentProfilePayload", "socialCommentAuthorMeta", "socialCommentAuthorForDisplay", "hydrateSocialProfileIdentity"];
const a = "11111111-1111-4111-8111-111111111111", b = "22222222-2222-4222-8222-222222222222";
const generic = { id: a, username: "sonic_user", display_name: "Sonic listener", profile_public: false };
const canonical = { ...generic, username: "ana_sonic", display_name: "Ana Frequência", updated_at: "2026-11-09T12:00:00Z" };
function fixture() {
  const calls = [], logs = [];
  const ctx = vm.createContext({
    URL, URLSearchParams, Date, console: { warn: (...args) => logs.push(args.join(" ")) },
    window: { SonicReleaseFlags: { publicProfiles: true } }, activeId: a,
    socialState: { session: { access_token: "fixture-access-not-real", user: { id: a, email: "private@example.test", user_metadata: { full_name: "Ana Frequência", picture: "https://identity.fixture.test/ana.jpg" } } }, profile: { ...generic }, profileAvatarUrl: "" },
    currentAuthUser: { username: "old_email_prefix", avatar: "https://identity.fixture.test/wrong-account.jpg" },
    librarySessionMatchesOnlineAccount: () => ctx.activeId === ctx.socialState.session?.user?.id,
    librarySessionIdentity: () => `${ctx.socialState.session?.user?.id}:${ctx.activeId}`,
    sonicTinyCopy: pt => pt, currentApiAccessToken: async () => "fixture-access-not-real",
    resolveAppApiUrl: () => "https://identity.fixture.test/api/user-profile",
    fetchWithTimeout: async (url, options) => {
      calls.push({ url, ...options, body: JSON.parse(options.body) });
      return { ok: true, json: async () => ({ ok: true, profile: { ...canonical }, avatarUrl: "https://identity.fixture.test/ana.jpg" }) };
    },
    hydrateSocialProfileInputs() {}, renderSocialCommentsPanel() {}, socialTopStyleValues: () => [],
    musicUniverseWeightsFromHistory: () => ({}), likedTrackHistory: [], resolveFavoriteStyleLabel: () => "",
    adaptiveModel: { likedArtists: new Set() }, knownArtistsMemory: new Set(), currentLanguage: "pt"
  });
  vm.runInContext(`let socialProfileIdentityHydration = null;\n${identityNames.map(source).join("\n")}`, ctx);
  return { ctx, calls, logs };
}

{
  const { ctx, calls } = fixture();
  assert.equal(ctx.socialCurrentPublicIdentity().displayName, "Ana Frequência", "Only a generic legacy name may fall back to verified-session metadata");
  await ctx.hydrateSocialProfileIdentity();
  await ctx.hydrateSocialProfileIdentity();
  assert.equal(calls.length, 1, "A completed identity bootstrap must not repeat on every render/sync");
  assert.deepEqual(calls[0].body, { action: "hydrate-identity" }, "The client must send no guessed name, email, avatar, privacy or draft fields");
  assert.equal(ctx.socialState.profile.display_name, "Ana Frequência");
  const old = { mine: true, author: { id: a, displayName: "Sonic listener", username: "sonic_user", avatarUrl: "" } };
  assert.equal(ctx.socialCommentAuthorForDisplay(old).displayName, "Ana Frequência", "Historical own comments must use the current canonical identity");
  assert.equal(ctx.socialCommentAuthorForDisplay(old).avatarUrl, "https://identity.fixture.test/ana.jpg");
  const other = { mine: false, author: { id: b, displayName: "Sonic listener", avatarUrl: "" } };
  assert.equal(ctx.socialCommentAuthorForDisplay(other), other.author, "Another viewer's privacy-filtered author must stay untouched");
  const stale = { mine: true, author: { id: b, displayName: "Other Account" } };
  assert.equal(ctx.socialCommentAuthorForDisplay(stale), stale.author, "A stale mine flag cannot import another account's local identity");
  const unidentified = { mine: true, author: { displayName: "Unconfirmed author" } };
  assert.equal(ctx.socialCommentAuthorForDisplay(unidentified), unidentified.author, "A mine flag without the verified author UUID must not imply ownership");
  ctx.socialState.session.user.user_metadata.full_name = "New provider name";
  assert.equal(ctx.socialCurrentPublicIdentity().displayName, "Ana Frequência", "Later logins cannot overwrite a non-generic app identity");
  ctx.socialState.profile.avatar_customized = true; ctx.socialState.profile.avatar_path = `${a}/photo.jpg`;
  ctx.socialState.profileAvatarUrl = `https://identity.fixture.test/sign/${a}/photo.jpg?token=fixture-old`;
  const renewed = { ...old, author: { ...old.author, avatarUrl: `https://identity.fixture.test/sign/${a}/photo.jpg?token=fixture-new` } };
  assert.equal(ctx.socialCommentAuthorForDisplay(renewed).avatarUrl, renewed.author.avatarUrl, "A fresh comment read must renew the same custom photo instead of replacing it with an expired cached capability");
  ctx.socialState.profile.avatar_customized = true; ctx.socialState.profile.avatar_path = null;
  assert.equal(ctx.socialCurrentPublicIdentity().avatarUrl, "", "Explicit photo removal always wins over provider photo metadata");
  assert.equal(ctx.socialCommentAuthorForDisplay(renewed).avatarUrl, "", "Even a previously valid server avatar cannot undo explicit removal");
}

{
  const { ctx } = fixture();
  ctx.socialState.session.user.user_metadata = {};
  assert.equal(ctx.socialCurrentPublicIdentity().displayName, "Você");
  assert.equal(ctx.socialCurrentPublicIdentity().avatarUrl, "", "A missing photo must not borrow the local session's old avatar");
  const payload = ctx.socialCurrentProfilePayload();
  assert.equal(payload.display_name, "Sonic listener", "The translated owner label must never be stored as a person's name");
  assert.equal(payload.username, "sonic_user");
  assert.equal(payload.avatar_url, null, "Provider owner-only photos must not be copied into public profile rows");
  ctx.socialState.profile = { id: b, username: "another_account", display_name: "Other account" };
  ctx.socialState.profileAvatarUrl = "https://identity.fixture.test/other.jpg";
  assert.equal(ctx.socialCurrentPublicIdentity().avatarUrl, "", "A mismatched profile/avatar pair must not cross accounts");
  ctx.socialState.profile = { ...generic, display_name: "private@example.test", username: "private@example.test" };
  ctx.socialState.session.user.user_metadata = { full_name: "private@example.test", username: "private@example.test" };
  const identity = JSON.stringify(ctx.socialCurrentPublicIdentity());
  assert.ok(!identity.includes("private") && !identity.includes("old_email_prefix"), "Neither raw email nor its legacy local prefix may become public identity");
}

{
  const { ctx } = fixture(); let attempts = 0;
  ctx.fetchWithTimeout = async () => { attempts++; if (attempts === 1) throw new Error("temporary failure"); return { ok: true, json: async () => ({ ok: true, profile: canonical, avatarUrl: "" }) }; };
  assert.equal(await ctx.hydrateSocialProfileIdentity(), null);
  assert.equal(ctx.socialState.profile.display_name, generic.display_name);
  assert.equal((await ctx.hydrateSocialProfileIdentity()).display_name, canonical.display_name);
  assert.equal(attempts, 2, "A failed bootstrap remains retryable");
}

{
  const { ctx } = fixture(); let requests = 0;
  ctx.socialState.session.user.user_metadata = {};
  ctx.fetchWithTimeout = async () => ({ ok: true, json: async () => ({ ok: true, profile: ++requests === 1 ? generic : canonical, avatarUrl: "" }) });
  await ctx.hydrateSocialProfileIdentity();
  ctx.socialState.session.user.user_metadata = { full_name: canonical.display_name };
  await ctx.hydrateSocialProfileIdentity();
  assert.equal(requests, 2, "New real metadata can repair a previously metadata-less generic profile");
  assert.equal(ctx.socialState.profile.display_name, canonical.display_name);
}

{
  const { ctx } = fixture(); let finish;
  ctx.fetchWithTimeout = () => new Promise(resolve => { finish = resolve; });
  const pending = ctx.hydrateSocialProfileIdentity(); await new Promise(resolve => setTimeout(resolve, 0));
  ctx.activeId = b; ctx.socialState.session = { access_token: "fixture-b", user: { id: b, user_metadata: {} } };
  ctx.socialState.profile = { id: b, display_name: "Bia", username: "bia_sonic" }; ctx.socialState.profileAvatarUrl = "https://identity.fixture.test/bia.jpg";
  finish({ ok: true, json: async () => ({ ok: true, profile: canonical, avatarUrl: "https://identity.fixture.test/ana.jpg" }) });
  assert.equal(await pending, null);
  assert.equal(ctx.socialState.profile.display_name, "Bia");
  assert.equal(ctx.socialState.profileAvatarUrl, "https://identity.fixture.test/bia.jpg", "A late account A response cannot set account B's avatar");
}

{
  const { ctx } = fixture(); let adapter;
  ctx.userProfileController = null;
  ctx.window.SonicUserProfile = { mount: (_, value) => { adapter = value; return {}; } };
  ctx.document = { getElementById: () => ({}) };
  ctx.styleLabelByValue = value => value;
  ctx.renderSocialUi = () => {};
  vm.runInContext(source("mountUserProfileIfEnabled"), ctx);
  ctx.mountUserProfileIfEnabled();
  adapter.onLoaded({ id: b, display_name: "Bia" }, "https://identity.fixture.test/bia.jpg");
  adapter.onSaved({ id: b, display_name: "Bia" }, "https://identity.fixture.test/bia.jpg");
  assert.equal(ctx.socialState.profile.id, a);
  assert.equal(ctx.socialState.profileAvatarUrl, "", "Late editor load/save callbacks must guard avatar assignment as well as the profile row");
  adapter.onLoaded(canonical, "https://identity.fixture.test/ana.jpg");
  assert.equal(ctx.socialState.profile.display_name, canonical.display_name);
  assert.equal(ctx.socialState.profileAvatarUrl, "https://identity.fixture.test/ana.jpg");
}

function oauthFixture(url) {
  const logs = [], location = {};
  const update = value => { const parsed = new URL(value, "https://sonic.test"); Object.assign(location, { href: parsed.href, pathname: parsed.pathname, search: parsed.search, hash: parsed.hash }); };
  update(url);
  const ctx = vm.createContext({
    URL, URLSearchParams, Date, document: { title: "Sonic" }, pendingNativeSocialAuthCallbackUrl: "",
    window: { location, history: { state: { preserved: true }, replaceState(state, _, value) { update(value); } } },
    console: { warn: (...args) => logs.push(args.join(" ")) }, socialConfigReady: () => true,
    requestedAppTabFromUrl: () => "discover", socialFriendlyAuthError: () => "Sign-in failed", sonicTinyCopy: pt => pt,
    socialSetStatus() {}, setAuthFeedback() {}, socialState: {}, socialEmailInput: null,
    socialStoreSession: session => { ctx.socialState.session = session; }, ensureOnlineSocialUserSession() {},
    restoreSocialLikedTracksFromCloud: async () => {}, upsertSocialProfile: async () => {}, syncSocialLikedTracks: async () => {},
    continueWithOnlineSocialSession: async () => {}, clearSocialOAuthPkce() {}, resetSocialOAuthNavigationState() {}, renderSocialUi() {}, updateAuthProviderUi() {}
  });
  vm.runInContext(["socialParamsIncludeAuthSignal", "socialAuthParamsFromUrlString", "socialAuthHashParams", "socialClearAuthHash", "socialHandleAuthRedirect"].map(source).join("\n"), ctx);
  return { ctx, location, logs };
}
{
  const { ctx, location, logs } = oauthFixture("https://sonic.test/?track=exact-key&style=house&tab=discover#access_token=fixture-access-canary&refresh_token=fixture-refresh-canary&provider_token=fixture-provider-canary&expires_in=3600&section=comments");
  let userReady, profileReady;
  ctx.socialFetchAuthUser = () => new Promise(resolve => { userReady = resolve; });
  ctx.loadSocialProfile = () => new Promise(resolve => { profileReady = resolve; });
  const pending = ctx.socialHandleAuthRedirect();
  assert.ok(!location.href.includes("canary"), "Credentials must disappear before the first auth/profile/network await settles");
  assert.equal(new URL(location.href).searchParams.get("track"), "exact-key"); assert.equal(location.hash, "#section=comments");
  userReady({ id: a, email: "private@example.test" }); await new Promise(resolve => setTimeout(resolve, 0));
  assert.ok(!location.href.includes("canary")); profileReady();
  assert.equal(await pending, true);
  assert.equal(ctx.socialState.session.access_token, "fixture-access-canary", "Cleaning the URL must preserve the captured session used for sign-in");
  assert.ok(!logs.join(" ").includes("canary"));
}
{
  const { ctx, location } = oauthFixture("https://sonic.test/?track=exact-key&code=fixture-code-canary&state=fixture-state-canary#comments");
  ctx.socialExchangeAuthCodeForSession = async () => ({ access_token: "fixture-session", user: { id: a } });
  ctx.loadSocialProfile = async () => {};
  await ctx.socialHandleAuthRedirect();
  assert.equal(location.href, "https://sonic.test/?track=exact-key#comments", "PKCE cleanup preserves the recording query and ordinary comment anchor");
}

const { chromium } = await import(process.env.SONIC_PLAYWRIGHT_MODULE || "playwright");
const browser = await chromium.launch({ headless: true });
try {
  const page = await browser.newPage();
  await page.route("https://identity.fixture.test/**", route => route.fulfill({ contentType: "image/svg+xml", body: '<svg xmlns="http://www.w3.org/2000/svg" width="4" height="4"><rect width="4" height="4" fill="#73c9b4"/></svg>' }));
  await page.setContent('<main><section id="comments"></section><section id="userProfileCard"><button data-profile-edit>Editar perfil</button></section></main>');
  await page.evaluate(({ a }) => {
    Object.assign(window, {
      socialState: { session: { access_token: "fixture-only", user: { id: a, user_metadata: { full_name: "Ana Frequência", picture: "https://identity.fixture.test/ana.jpg" } } }, profile: { id: a, display_name: "Sonic listener", username: "sonic_user" }, profileAvatarUrl: "" },
      socialCommentsState: { enabled: true, reactionsEnabled: true, canModerate: false }, editingSocialCommentId: "",
      librarySessionMatchesOnlineAccount: () => true, sonicTinyCopy: pt => pt,
      socialCommentsSignedIn: () => true, socialCommentDateLabel: () => "", t: key => key === "socialCommentsMine" ? "você" : key,
      socialDiscussionDialog: { close: () => { window.closedDiscussion = true; } }, setActiveAppTab: tab => { window.activeTab = tab; }
    });
    window.SonicReleaseFlags = { publicProfiles: true };
  }, { a });
  await page.addScriptTag({ content: [...identityNames.filter(name => !["socialCurrentProfilePayload", "hydrateSocialProfileIdentity"].includes(name)), "ugcAuthorId", "renderSocialCommentItem"].map(source).join("\n") });
  await page.evaluate(({ a }) => {
    window.oldOwnComment = { id: "old-own", mine: true, author: { id: a, displayName: "Sonic listener", username: "sonic_user", avatarUrl: "" }, body: "Existing isolated fixture" };
    document.getElementById("comments").replaceChildren(renderSocialCommentItem(oldOwnComment));
  }, { a });
  assert.equal(await page.locator(".social-comment-author button").textContent(), "Ana Frequência (você)");
  assert.equal(await page.locator(".social-comment-avatar img").getAttribute("src"), "https://identity.fixture.test/ana.jpg");
  await page.evaluate(() => {
    socialState.profile.display_name = "Nome escolhido"; socialState.profile.avatar_customized = true; socialState.profile.avatar_path = null;
    document.getElementById("comments").replaceChildren(renderSocialCommentItem(oldOwnComment));
  });
  assert.equal(await page.locator(".social-comment-author button").textContent(), "Nome escolhido (você)");
  assert.equal(await page.locator(".social-comment-avatar img").count(), 0);
  await page.evaluate(() => {
    socialState.profile.display_name = "Sonic listener"; socialState.session.user.user_metadata = {};
    document.getElementById("comments").replaceChildren(renderSocialCommentItem(oldOwnComment));
  });
  assert.equal(await page.locator(".social-comment-author button").textContent(), "Você");
  await page.getByRole("button", { name: "Editar meu perfil", exact: true }).click();
  assert.equal(await page.evaluate(() => activeTab), "profile");
  assert.equal(await page.locator("[data-profile-edit]").evaluate(el => el === document.activeElement), true, "Missing identity has a direct accessible route to the existing editor");
} finally { await browser.close(); }

console.log("Social identity session passed: generic metadata bootstrap, custom/removal protection, no email-derived identity, A/B late-response isolation, historical own comments and edit route, early OAuth/PKCE cleanup with recording/comment context retained. No real account writes.");
