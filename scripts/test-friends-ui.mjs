import assert from "node:assert/strict";
import fs from "node:fs/promises";
import { fileURLToPath } from "node:url";
const { chromium } = await import(process.env.SONIC_PLAYWRIGHT_MODULE || "playwright");
const browser = await chromium.launch({ headless: true, executablePath: process.env.SONIC_CHROMIUM_EXECUTABLE || "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome" });
const output = fileURLToPath(new URL("../.vercel/friends-ui/", import.meta.url));
await fs.mkdir(output, { recursive: true });
const A = "11111111-1111-4111-8111-111111111111", B = "22222222-2222-4222-8222-222222222222", C = "33333333-3333-4333-8333-333333333333";
const track = { artist: "Fixture Artist", title: "An exact chosen recording (Edit)", style: "house", url: "https://label.bandcamp.com/track/exact-chosen-recording", catalogId: "fixture-recording" };
async function checkRefinement(kind) {
  const page = await browser.newPage({ viewport: { width: 1440, height: 960 } });
  page.setDefaultTimeout(5000);
  try {
    await page.setContent('<!doctype html><html><body><section id="friendsPanel"></section></body></html>');
    await page.addStyleTag({ path: fileURLToPath(new URL("../friends.css", import.meta.url)) });
    await page.addScriptTag({ path: fileURLToPath(new URL("../friends.js", import.meta.url)) });
    await page.evaluate(async track => {
      window.refinement = { choose: [], navigation: [], release: null, settled: false };
      window.controller = SonicFriends.mount(document.getElementById("friendsPanel"), {
        getSessionKey: () => "fixture-account", getLanguage: () => "pt",
        chooseTrack: async context => { refinement.choose.push(context); if (context?.replace) { refinement.navigation.push("discover"); return null; } return track; },
        request: async input => {
          if (input.action === "overview") return { ok: true, me: { enabled: true, identity: { id: "self", displayName: "Fixture listener" } }, friends: [], incoming: [], outgoing: [], invites: [] };
          if (input.action === "feed") return { ok: true, posts: [] };
          if (input.action === "search") {
            if (input.q === "bia") await new Promise(resolve => { refinement.release = resolve; });
            const name = { ana: "Ana Sonora", bia: "Bia Radar", carla: "Carla Solar" }[input.q];
            return { ok: true, people: [{ id: input.q, displayName: name, relationship: "none" }] };
          }
          return { ok: false };
        }
      });
      await controller.open({ composeTrack: track });
    }, track);
    if (kind === "replace") {
      await page.locator("#friendsNote").fill("Keep this draft while browsing.");
      await page.locator('[data-friends-action="choose-track"]').click();
      assert.deepEqual(await page.evaluate(() => refinement.navigation), ["discover"], "Replace must ask the bridge to open Discover instead of selecting the current track again");
      assert.deepEqual(await page.evaluate(() => refinement.choose[0]), { replace: true, currentTrack: track });
      await page.evaluate(() => controller.open());
      assert.equal(await page.locator("#friendsNote").inputValue(), "Keep this draft while browsing.");
      assert.ok((await page.locator(".friends-chosen-track").textContent()).includes(track.title));
      await page.evaluate(track => controller.compose({ ...track, title: "Another explicitly chosen recording" }), track);
      assert.ok((await page.locator(".friends-chosen-track").textContent()).includes("Another explicitly chosen recording"));
      assert.equal(await page.locator("#friendsNote").inputValue(), "", "The draft changes only when a different recording is explicitly selected");
    } else {
      const submit = page.locator('[data-friends-form="search"] button');
      const results = page.locator('.friends-section:has([data-friends-form="search"])');
      await page.locator("#friendsSearch").fill("ana"); await submit.click(); await results.getByText("Ana Sonora", { exact: true }).waitFor();
      await page.locator("#friendsSearch").fill("bia"); await submit.click(); await page.waitForFunction(() => typeof refinement.release === "function");
      await page.locator("#friendsSearch").fill("carla"); await page.evaluate(() => refinement.release());
      await page.waitForFunction(() => !document.querySelector('[data-friends-form="search"] button').disabled);
      const obsolete = await results.innerText();
      assert.ok(!obsolete.includes("Ana Sonora") && !obsolete.includes("Resultados para “bia”"), "Editing a pending search must not relabel old people with the pending query");
      await page.locator("#friendsSearch").fill("bia"); await submit.click();
      await page.waitForFunction(() => document.querySelector('[data-friends-form="search"] button').disabled);
      await page.locator("#friendsSearch").fill("carla");
      assert.equal(await submit.isEnabled(), true, "A new query can be submitted before the obsolete response finishes");
      await submit.click(); await results.getByText("Carla Solar", { exact: true }).waitFor();
      await page.evaluate(() => refinement.release());
      await page.evaluate(() => new Promise(resolve => requestAnimationFrame(resolve)));
      assert.ok((await results.innerText()).includes("Resultados para “carla”"));
      assert.equal(await results.getByText("Bia Radar", { exact: true }).count(), 0, "A late obsolete response cannot replace the newer completed search");
      await page.locator("#friendsSearch").evaluate(input => { input.focus(); input.setSelectionRange(2, 2); });
      await page.keyboard.type("x");
      assert.deepEqual(await page.locator("#friendsSearch").evaluate(input => [input.value, input.selectionStart, document.activeElement === input]), ["caxrla", 3, true], "Clearing results must preserve the editing caret and focus");
    }
  } finally { await page.close(); }
}
try {
  const refinements = await Promise.allSettled([checkRefinement("search"), checkRefinement("replace")]);
  for (let index = 0; index < refinements.length; index++) if (refinements[index].status === "rejected") console.error(["search coherence", "replace draft continuity"][index] + ": " + refinements[index].reason.message);
  assert.ok(refinements.every(result => result.status === "fulfilled"), "Both Friends refinements must pass");
  console.log("PASS search editing/late response coherence and explicit replacement navigation with draft continuity");
  const page = await browser.newPage({ viewport: { width: 375, height: 812 }, reducedMotion: "reduce" });
  const errors = []; page.on("pageerror", error => errors.push(error.message));
  await page.setContent('<!doctype html><html lang="pt"><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><style>body{margin:0;background:#07121b;color:#eaf8f2;padding:16px}main{max-width:1200px;margin:auto}button,input,textarea{font:inherit}#publicComments{display:none}</style><main><section id="friendsPanel"></section><section id="publicComments">Public comments unchanged</section></main></html>');
  await page.addStyleTag({ path: fileURLToPath(new URL("../friends.css", import.meta.url)) });
  await page.addScriptTag({ path: fileURLToPath(new URL("../friends.js", import.meta.url)) });
  await page.evaluate(({ A, B, C, track }) => {
    window.fixture = {
      account: "", language: "pt", calls: [], callbacks: [], relationships: [], posts: [], invites: [], next: 1,
      users: {
        [A]: { id: A, displayName: "Ana Sonora", username: "ana_sonic", avatarUrl: "https://private.fixture.test/protected-owner-photo", enabled: false, discoverable: false },
        [B]: { id: B, displayName: "Bia Radar", username: "bia_radar", enabled: true, discoverable: true },
        [C]: { id: C, displayName: "Ciro Privado", username: "ciro_privado", enabled: true, discoverable: false }
      }, track, blocked: new Set(), hold: null, fail: ""
    };
    const person = id => { const u = fixture.users[id]; return { id, displayName: u.displayName, username: u.username, avatarUrl: u.avatarUrl || "" }; };
    const relation = (owner, other) => fixture.relationships.find(row => [row.sender, row.receiver].includes(owner) && [row.sender, row.receiver].includes(other));
    const relationship = (owner, other) => { const row = relation(owner, other); return !row ? { relationship: "none" } : { relationship: row.accepted ? "accepted" : row.sender === owner ? "outgoing" : "incoming", relationshipId: row.id }; };
    function response(input, owner) {
      const u = fixture.users[owner];
      if (!u) return { ok: false, error: "login_required" };
      if (input.action === "overview") return { ok: true, me: { enabled: u.enabled, identity: person(owner) },
        friends: fixture.relationships.filter(row => row.accepted && [row.sender, row.receiver].includes(owner)).map(row => ({ ...person(row.sender === owner ? row.receiver : row.sender), relationshipId: row.id })),
        incoming: fixture.relationships.filter(row => !row.accepted && row.receiver === owner).map(row => ({ id: row.id, person: person(row.sender), createdAt: "2026-11-10T12:00:00Z" })),
        outgoing: fixture.relationships.filter(row => !row.accepted && row.sender === owner).map(row => ({ id: row.id, person: person(row.receiver), createdAt: "2026-11-10T12:00:00Z" })),
        invites: fixture.invites.filter(row => row.owner === owner && row.active).map(row => ({ id: row.id, expiresAt: row.expiresAt })) };
      if (input.action === "feed") return { ok: true, posts: fixture.posts.filter(post => (post.author.id === owner || relation(owner, post.author.id)?.accepted) && !fixture.blocked.has(`${owner}:${post.author.id}`)).map(post => ({ ...post, mine: post.author.id === owner })) };
      if (input.action === "search") return { ok: true, people: Object.values(fixture.users).filter(user => user.id !== owner && user.discoverable && `${user.displayName} ${user.username}`.toLowerCase().includes(input.q.toLowerCase())).map(user => ({ ...person(user.id), ...relationship(owner, user.id) })) };
      if (input.action === "invite-preview") { const invite = fixture.invites.find(row => row.token === input.token && row.active); return invite ? { ok: true, person: person(invite.owner), ...relationship(owner, invite.owner) } : { ok: false, error: "invite_not_found" }; }
      if (input.action === "settings") { u.displayName = input.displayName; u.enabled = true; return { ok: true, me: { enabled: true, identity: person(owner) } }; }
      if (!u.enabled) return { ok: false, error: "friends_identity_required" };
      if (input.action === "request") { if (!relation(owner, input.userId)) fixture.relationships.push({ id: `relationship-${fixture.next++}`, sender: owner, receiver: input.userId, accepted: false }); return { ok: true, ...relationship(owner, input.userId) }; }
      if (input.action === "respond") { const row = fixture.relationships.find(row => row.id === input.relationshipId && row.receiver === owner); if (!row) return { ok: false, error: "relationship_not_found" }; if (input.decision === "accept") row.accepted = true; else fixture.relationships = fixture.relationships.filter(item => item !== row); return { ok: true, ...relationship(owner, input.userId) }; }
      if (["cancel", "remove"].includes(input.action)) { fixture.relationships = fixture.relationships.filter(row => row.id !== input.relationshipId); return { ok: true, ...relationship(owner, input.userId) }; }
      if (input.action === "create-invite") { const invite = { id: `invite-${fixture.next++}`, owner, token: `random-capability-${fixture.next++}`, expiresAt: "2026-11-17T12:00:00Z", active: true }; fixture.invites.push(invite); return { ok: true, invite }; }
      if (input.action === "revoke-invite") { const invite = fixture.invites.find(row => row.id === input.inviteId && row.owner === owner); if (invite) invite.active = false; return { ok: true }; }
      if (input.action === "share-track") { const post = { id: `post-${fixture.next++}`, author: person(owner), track: input.track, text: input.text, createdAt: "2026-11-10T12:00:00Z", audience: "friends" }; fixture.posts.push(post); return { ok: true, post }; }
      if (input.action === "delete-post") { fixture.posts = fixture.posts.filter(post => post.id !== input.postId || post.author.id !== owner); return { ok: true }; }
      return { ok: false, error: "invalid_action" };
    }
    window.controller = SonicFriends.mount(document.getElementById("friendsPanel"), {
      getLanguage: () => fixture.language, getSessionKey: () => fixture.account,
      request: async input => {
        const owner = fixture.account; fixture.calls.push({ ...input, owner });
        if (fixture.fail === input.action) { fixture.fail = ""; throw new Error("secret-canary-not-for-ui"); }
        const result = structuredClone(response(input, owner));
        if (fixture.hold?.action === input.action && fixture.hold.owner === owner) { fixture.hold = null; fixture.release = null; await new Promise(resolve => { fixture.release = resolve; }); }
        return result;
      },
      signIn: context => fixture.callbacks.push({ action: "signIn", context }),
      chooseTrack: async context => { fixture.callbacks.push({ action: "choose", context }); if (context?.replace) { fixture.callbacks.push({ action: "navigate", tab: "discover" }); return null; } return track; },
      openTrack: async (selected, post) => { fixture.callbacks.push({ action: "play", selected, post }); if (fixture.holdPlay) await new Promise(resolve => { fixture.releasePlay = resolve; }); return { ok: fixture.playReady !== false }; },
      onReport: async value => { fixture.callbacks.push({ action: "report", postId: value.post.id, userId: value.person.id }); return { ok: true }; },
      onBlock: async person => { fixture.callbacks.push({ action: "block", userId: person.id }); fixture.blocked.add(`${fixture.account}:${person.id}`); fixture.relationships = fixture.relationships.filter(row => ![row.sender, row.receiver].includes(fixture.account) || ![row.sender, row.receiver].includes(person.id)); return { ok: true }; },
      makeInviteUrl: token => `https://sonicsearch.app/?tab=friends#friendInvite=${encodeURIComponent(token)}`
    });
  }, { A, B, C, track });
  const action = (name, extra = "") => page.locator(`[data-friends-action="${name}"]${extra}`).first();
  const people = async () => { const tab = action("people"); if (await tab.isVisible()) await tab.click(); };
  const feed = async () => { const tab = action("feed"); if (await tab.isVisible()) await tab.click(); };
  async function account(id) {
    await page.evaluate(id => { fixture.account = id; controller.sessionChanged(); }, id);
    if (id) await page.waitForFunction(() => document.querySelector(".friends-own-identity,.friends-setup"));
  }
  await page.evaluate(() => controller.open({ inviteToken: "anonymous-capability" }));
  assert.equal(await page.evaluate(() => fixture.calls.length), 0, "Guest entry performs no API request or mutation");
  await action("sign-in").click();
  assert.equal(await page.evaluate(() => fixture.callbacks[0].context.inviteToken), "anonymous-capability");
  await account(A);
  await page.locator("#friendsName").fill("Ana do meu círculo");
  assert.match(await page.locator(".friends-identity-preview").textContent(), /Ana do meu círculo.*Amigos aceitos/);
  assert.equal(await page.locator("#friendsPanel img").count(), 0, "Protected owner/OAuth photos are never projected");
  assert.equal(await page.evaluate(() => fixture.calls.filter(call => call.method === "POST").length), 0, "Safe identity suggestions do not publish themselves");
  await page.getByRole("button", { name: "Usar este nome com amigos", exact: true }).click();
  await page.locator(".friends-own-identity").waitFor();
  const settings = await page.evaluate(() => fixture.calls.find(call => call.action === "settings"));
  assert.equal(settings.displayName, "Ana do meu círculo"); assert.equal(settings.username, "ana_sonic");
  assert.equal(settings.photo, undefined); assert.equal(settings.avatarUrl, undefined);
  await people(); await page.locator("#friendsSearch").fill("ciro");
  await page.locator('[data-friends-form="search"]').getByRole("button", { name: "Buscar", exact: true }).click();
  await page.getByText("Ninguém disponível corresponde a essa busca.", { exact: true }).waitFor();
  await page.locator("#friendsSearch").fill("bia");
  await page.locator('[data-friends-form="search"]').getByRole("button", { name: "Buscar", exact: true }).click();
  await action("request", `[data-user-id="${B}"]`).waitFor();
  await action("request", `[data-user-id="${B}"]`).click();
  assert.equal(await page.evaluate(() => fixture.calls.filter(call => call.action === "request").length), 0, "Previewing a person cannot send a request");
  assert.match(await page.locator(".friends-confirm").textContent(), /Bia Radar.*Ana do meu círculo.*Amigos aceitos/s);
  await page.keyboard.press("Escape");
  assert.equal(await page.locator(".friends-confirm").count(), 0);
  assert.equal(await page.evaluate(() => document.activeElement.dataset.friendsAction), "request", "Cancel returns focus to the person action");
  await action("request", `[data-user-id="${B}"]`).click();
  await action("confirm").click();
  await page.getByText("Solicitação enviada. Aguarde o aceite.", { exact: true }).waitFor();
  await action("cancel-request", `[data-user-id="${B}"]`).click();
  await page.getByText("Pedido cancelado.", { exact: true }).waitFor();
  await action("request", `[data-user-id="${B}"]`).click(); await action("confirm").click();
  await page.getByText("Solicitação enviada. Aguarde o aceite.", { exact: true }).waitFor();
  await account(B); await people();
  assert.ok(!(await page.locator("#friendsPanel").textContent()).includes("anonymous-capability"));
  await action("accept", `[data-user-id="${A}"]`).click();
  await page.getByText("Amizade aceita.", { exact: true }).waitFor();
  console.log("PASS explicit friends identity, private search, request confirmation/cancel/accept, no photos or automatic writes");

  await account(A); await feed(); await action("choose-track").click();
  await page.locator("#friendsNote").fill("Só o meu círculo pode ver esta descoberta.");
  await page.evaluate(() => { fixture.fail = "share-track"; });
  await page.getByRole("button", { name: "Compartilhar com amigos", exact: true }).click();
  await page.locator(".friends-feedback[role=alert]").waitFor();
  assert.equal(await page.locator("#friendsNote").inputValue(), "Só o meu círculo pode ver esta descoberta.");
  await action("choose-track").click();
  await page.evaluate(() => controller.open());
  assert.equal(await page.locator("#friendsNote").inputValue(), "Só o meu círculo pode ver esta descoberta.", "Browsing and returning preserves an ambiguous-post draft for safe retry");
  assert.ok(!(await page.locator("#friendsPanel").textContent()).includes("secret-canary"));
  await page.getByRole("button", { name: "Compartilhar com amigos", exact: true }).click();
  await page.getByText("Descoberta compartilhada com seus amigos.", { exact: true }).waitFor();
  const shareCalls = await page.evaluate(() => fixture.calls.filter(call => call.action === "share-track"));
  assert.equal(shareCalls.length, 2); assert.equal(shareCalls[0].clientRequestId, shareCalls[1].clientRequestId, "Ambiguous retry retains its idempotency key");
  assert.deepEqual(shareCalls[1].track, track);
  assert.equal(await page.locator("#publicComments").textContent(), "Public comments unchanged");
  await account(B); await feed();
  await page.locator(".friends-post").getByText("Só o meu círculo pode ver esta descoberta.", { exact: true }).waitFor();
  await page.evaluate(() => { fixture.playReady = false; });
  await action("play").click(); await page.getByText("Não foi possível abrir esta gravação agora. O link de origem continua disponível.", { exact: true }).waitFor();
  assert.equal(await page.locator(".friends-source").getAttribute("href"), track.url);
  await page.evaluate(() => { fixture.playReady = true; });
  await action("play").click(); await page.getByText("Faixa aberta no player.", { exact: true }).waitFor();
  assert.deepEqual(await page.evaluate(() => fixture.callbacks.filter(call => call.action === "play").at(-1).post), { id: "post-3" });
  await page.evaluate(() => controller.playbackUnavailable("unrelated-post"));
  assert.equal(await page.getByText("Faixa aberta no player.", { exact: true }).count(), 1, "An unrelated stale player failure cannot erase the current acknowledgement");
  await page.evaluate(() => controller.playbackUnavailable("post-3"));
  await page.getByText("Não foi possível abrir esta gravação agora. O link de origem continua disponível.", { exact: true }).waitFor();
  assert.equal(await page.getByText("Faixa aberta no player.", { exact: true }).count(), 0, "A late media error invalidates the successful acknowledgement");
  assert.equal(await page.locator(".friends-source").first().getAttribute("href"), track.url);
  await page.evaluate(() => { fixture.holdPlay = true; });
  await action("play").click();
  await page.waitForFunction(() => typeof fixture.releasePlay === "function");
  await page.evaluate(() => { controller.playbackUnavailable("post-3"); fixture.holdPlay = false; fixture.releasePlay(); });
  await page.getByText("Não foi possível abrir esta gravação agora. O link de origem continua disponível.", { exact: true }).waitFor();
  assert.equal(await page.getByText("Faixa aberta no player.", { exact: true }).count(), 0, "A delayed ready response cannot override a reported audio failure");
  await action("report").click();
  assert.equal(await page.evaluate(() => fixture.callbacks.at(-1).action), "report");
  for (const viewport of [{ width: 375, height: 812 }, { width: 852, height: 393 }, { width: 1440, height: 1000 }]) {
    await page.setViewportSize(viewport); await feed();
    const metrics = await page.locator("#friendsPanel").evaluate(root => ({ width: root.clientWidth, scrollWidth: root.scrollWidth,
      targets: [...root.querySelectorAll("button,a,input,textarea")].filter(el => el.getClientRects().length).map(el => el.getBoundingClientRect().height) }));
    assert.ok(metrics.scrollWidth <= metrics.width + 1, `No overflow at ${viewport.width}`);
    assert.ok(metrics.targets.every(height => height >= 44), "Every visible control has a touch target");
    await page.screenshot({ path: `${output}friends-${viewport.width}.png`, fullPage: true });
  }
  await page.setViewportSize({ width: 375, height: 812 }); await people();
  await action("remove", `[data-user-id="${A}"]`).click();
  assert.match(await page.locator(".friends-confirm").textContent(), /deixarão de ver/);
  await action("confirm").click(); await page.getByText("Amizade removida.", { exact: true }).waitFor();
  await feed(); assert.equal(await page.locator(".friends-post").count(), 0);
  await account(C); await feed(); assert.equal(await page.locator(".friends-post").count(), 0);
  console.log("PASS explicit track/text sharing, error-safe idempotent retry, exact play acknowledgment/source fallback, separate comments, remove/C-denial and responsive layouts");

  await account(A); await people(); await action("create-invite").click();
  await page.locator("#friendsInviteLink").waitFor();
  const link = await page.locator("#friendsInviteLink").inputValue();
  assert.equal(new URL(link).searchParams.get("tab"), "friends"); assert.ok(new URL(link).hash.includes("friendInvite=")); assert.ok(!link.includes(A));
  const token = new URLSearchParams(new URL(link).hash.slice(1)).get("friendInvite");
  await account(C); await page.evaluate(token => controller.open({ inviteToken: token }), token);
  const countBefore = await page.evaluate(() => fixture.relationships.length);
  assert.equal(countBefore, 0, "Opening a private invite cannot accept or request friendship");
  assert.match(await page.locator(".friends-received-invite").textContent(), /Ana do meu círculo/);
  await action("request", `[data-user-id="${A}"]`).click(); await action("confirm").click();
  await page.getByText("Solicitação enviada. Aguarde o aceite.", { exact: true }).waitFor();
  const invitedRequest = await page.evaluate(() => fixture.calls.filter(call => call.action === "request").at(-1));
  assert.equal(invitedRequest.inviteToken, token);
  await account(A); await people(); await action("decline", `[data-user-id="${C}"]`).click();
  await page.getByText("Pedido recusado.", { exact: true }).waitFor();
  await action("revoke-invite").click();
  await page.waitForFunction(() => fixture.invites.every(invite => !invite.active));
  await account(C); await page.evaluate(token => controller.open({ inviteToken: token }), token);
  await page.getByText("Este convite não está disponível. Ele pode ter expirado ou sido revogado.", { exact: true }).waitFor();
  console.log("PASS private capability preview/request/decline/revocation; no UUID link or automatic friendship");

  await account(A); await page.evaluate(() => { fixture.hold = { action: "overview", owner: fixture.account }; window.oldRefresh = controller.refresh(); });
  await page.waitForFunction(() => typeof fixture.release === "function");
  await account(B); await page.evaluate(() => { fixture.hold = null; fixture.release(); });
  await page.evaluate(() => window.oldRefresh);
  assert.match(await page.locator(".friends-own-identity").textContent(), /Bia Radar/);
  assert.ok(!(await page.locator(".friends-own-identity").textContent()).includes("Ana"));

  // Confirmed block/remove must discard cached content even if an older feed
  // response is still in flight. The real server authorization is tested by
  // the backend's separate PGlite suite.
  await page.evaluate(({ A, B, track }) => {
    fixture.relationships.push({ id: "edge-block", sender: A, receiver: B, accepted: true });
    fixture.posts.push({ id: "post-block", author: { id: A, displayName: "Ana private alias", username: "ana_sonic" }, track,
      text: 'Private cached note <img src=x onerror="window.bad=true">', createdAt: "2026-11-10T12:00:00Z", audience: "friends" });
  }, { A, B, track });
  await page.evaluate(() => controller.refresh()); await feed();
  assert.equal(await page.locator(".friends-post-note img").count(), 0, "Friend text remains text, never markup");
  await page.evaluate(() => { fixture.release = null; fixture.hold = { action: "feed", owner: fixture.account }; window.oldFeed = controller.refresh(); });
  await page.waitForFunction(() => typeof fixture.release === "function");
  await action("block", '[data-post-id="post-block"]').click();
  await page.waitForFunction(() => fixture.callbacks.at(-1)?.action === "block");
  await page.waitForFunction(() => document.querySelectorAll(".friends-post").length === 0);
  await page.evaluate(() => fixture.release()); await page.evaluate(() => window.oldFeed);
  assert.equal(await page.locator(".friends-post").count(), 0, "A stale feed reply cannot revive blocked posts");
  await people(); assert.ok(!(await page.locator("#friendsPanel").textContent()).includes("Ana private alias"));

  await account(A); await feed();
  await action("delete-post", '[data-post-id="post-3"]').click();
  assert.equal(await page.evaluate(() => fixture.posts.some(post => post.id === "post-3")), true, "Delete requires explicit confirmation");
  await action("confirm").click(); await page.getByText("Descoberta excluída.", { exact: true }).waitFor();
  assert.equal(await page.evaluate(() => fixture.posts.some(post => post.id === "post-3")), false);

  await page.evaluate(() => { fixture.release = null; fixture.hold = { action: "feed", owner: fixture.account }; window.oldAccountFeed = controller.refresh(); });
  await page.waitForFunction(() => typeof fixture.release === "function");
  await account(C); await page.evaluate(() => fixture.release()); await page.evaluate(() => window.oldAccountFeed);
  assert.equal(await page.locator(".friends-post").count(), 0, "Account C cannot receive a late account A feed");
  await account(A); await action("edit-identity").click();
  await page.locator("#friendsName").fill("A delayed alias");
  await page.evaluate(() => { fixture.release = null; fixture.hold = { action: "settings", owner: fixture.account }; });
  await page.getByRole("button", { name: "Usar este nome com amigos", exact: true }).click();
  await page.waitForFunction(() => typeof fixture.release === "function");
  await account(B); await page.evaluate(() => fixture.release());
  await page.waitForTimeout(30);
  assert.match(await page.locator(".friends-own-identity").textContent(), /Bia Radar/);
  assert.ok(!(await page.locator(".friends-own-identity").textContent()).includes("A delayed alias"));

  await page.evaluate(({ A, C }) => { fixture.relationships.push({ id: "edge-late-share", sender: A, receiver: C, accepted: true }); }, { A, C });
  await account(A); await feed(); await action("choose-track").click();
  await page.locator("#friendsNote").fill("Account A private pending note");
  await page.evaluate(() => { fixture.release = null; fixture.hold = { action: "share-track", owner: fixture.account }; });
  await page.getByRole("button", { name: "Compartilhar com amigos", exact: true }).click();
  await page.waitForFunction(() => typeof fixture.release === "function");
  await account(B); await feed(); await action("choose-track").click();
  await page.locator("#friendsNote").fill("Account B unsent draft");
  await page.evaluate(() => fixture.release()); await page.waitForTimeout(30);
  assert.equal(await page.locator("#friendsNote").inputValue(), "Account B unsent draft");
  assert.ok(!(await page.locator("#friendsPanel").textContent()).includes("Account A private pending note"));
  assert.equal(await page.locator(".friends-post").count(), 0);
  console.log("PASS confirmed block/delete cache purge, text safety, late feed/settings/share isolation and account B draft preservation");

  await page.evaluate(() => { fixture.language = "en"; window.dispatchEvent(new CustomEvent("sonic:language-changed")); });
  assert.equal(await page.locator("#friendsTitle").textContent(), "Friends");
  await page.evaluate(() => { fixture.language = "es"; window.dispatchEvent(new CustomEvent("sonic:language-changed")); });
  assert.equal(await page.locator(".friends-views [data-friends-action=feed]").textContent(), "Descubrimientos compartidos");
  await page.addStyleTag({ content: "html { font-size: 24px; }" });
  assert.ok(await page.locator("#friendsPanel").evaluate(root => root.scrollWidth <= root.clientWidth + 1), "Large text does not overflow");
  assert.deepEqual(errors, []);
  console.log("PASS account A/B late-read isolation, EN/ES, large text and no script errors. All people/posts/transport are fixtures; no real accounts or messages used.");
} finally { await browser.close(); }
