import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
const { chromium } = await import(process.env.SONIC_PLAYWRIGHT_MODULE || 'playwright');
const html = (await fs.readFile(new URL('../index.html', import.meta.url), 'utf8'))
  .replace(/<script\b[^>]*>[\s\S]*?<\/script>/gi, '').replace(/<link\b[^>]*>/gi, '');
const source = await fs.readFile(process.env.SONIC_PROFILE_REFRESH_SOURCE || new URL('../user-profile.js', import.meta.url), 'utf8');
const browser = await chromium.launch({ headless: true, executablePath: process.env.SONIC_CHROMIUM_EXECUTABLE || '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome' });
const id = '11111111-1111-4111-8111-111111111111';
const old = { id, username: 'ana_sonic', display_name: 'Old chosen name', bio: '', musical_preferences: [],
  profile_public: false, show_avatar: false, show_bio: false, show_styles: false,
  avatar_customized: true, avatar_path: `${id}/22222222-2222-4222-8222-222222222222.jpg`, updated_at: '2026-11-09T12:00:00Z' };
let saved = { ...old }, reads = 0, releaseRead, readStarted;
const gate = new Promise(resolve => { releaseRead = resolve; });
const started = new Promise(resolve => { readStarted = resolve; });
try {
  const page = await browser.newPage();
  const errors = []; page.on('pageerror', error => errors.push(error.message));
  await page.route('https://identity.fixture.test/**', async route => {
    if (new URL(route.request().url()).pathname !== '/api/user-profile') return route.fulfill({ contentType: 'image/svg+xml', body: '<svg xmlns="http://www.w3.org/2000/svg" width="4" height="4"/>' });
    if (route.request().method() === 'GET') {
      // Capture before waiting: this response represents a read already made
      // before the later save, not a database read performed after release.
      const snapshot = structuredClone(saved);
      if (++reads === 2) { readStarted(); await gate; }
      return route.fulfill({ json: { ok: true, profile: snapshot, avatarUrl: snapshot.avatar_path ? 'https://identity.fixture.test/custom-photo.jpg' : '' } });
    }
    const body = route.request().postDataJSON();
    assert.equal(body.removePhoto, true);
    saved = { ...saved, display_name: body.displayName, profile_public: body.privacy.public,
      avatar_customized: true, avatar_path: null, updated_at: '2026-11-09T12:01:00Z' };
    return route.fulfill({ json: { ok: true, profile: saved, avatarUrl: '' } });
  });
  await page.setContent(html);
  await page.evaluate(({ id }) => {
    // Run the real periodic callback deterministically rather than waiting 45s.
    window.setInterval = (callback, ms) => { if (ms === 45000) window.profileRefresh = callback; return 1; };
    window.identityCallbacks = [];
    window.profileAdapter = {
      session: () => ({ access_token: 'fixture-only', user: { id } }),
      freshSession: async () => ({ access_token: 'fixture-only', user: { id } }),
      endpoint: () => 'https://identity.fixture.test/api/user-profile', language: () => 'pt',
      suggestName: () => 'Ana', suggestUsername: () => 'ana_sonic', styles: () => [], styleLabel: value => value,
      signOut() {}, signIn() {},
      onLoaded: (profile, avatar) => identityCallbacks.push({ type: 'loaded', profile, avatar }),
      onSaved: (profile, avatar) => identityCallbacks.push({ type: 'saved', profile, avatar })
    };
  }, { id });
  await page.addScriptTag({ content: source });
  await page.evaluate(() => SonicUserProfile.mount(document.getElementById('userProfileCard'), profileAdapter));
  const card = page.locator('#userProfileCard');
  await card.locator('[data-profile-edit]').waitFor({ state: 'visible' });
  await page.evaluate(() => { window.pendingRefresh = window.profileRefresh(); });
  await started;
  await card.locator('[data-profile-edit]').click();
  await card.locator('[name=displayName]').fill('New chosen name');
  await card.locator('[name=public]').check();
  await card.locator('[data-profile-remove]').click();
  await card.locator('[data-profile-save]').click();
  await card.locator('[data-profile-status]').filter({ hasText: 'Perfil salvo.' }).waitFor();
  assert.equal(await card.locator('[data-profile-own-name]').textContent(), 'New chosen name');
  assert.equal(await card.locator('[data-profile-avatar] img').count(), 0);
  releaseRead();
  await page.evaluate(() => window.pendingRefresh);
  assert.equal(await card.locator('[data-profile-own-name]').textContent(), 'New chosen name', 'A refresh started before save cannot rewind the chosen name');
  assert.equal(await card.locator('[data-profile-avatar] img').count(), 0, 'An older refresh cannot revive a removed custom photo');
  assert.equal(await card.locator('[data-profile-badge]').textContent(), 'Visível na comunidade', 'The saved visibility choice survives the stale response');
  const callbacks = await page.evaluate(() => identityCallbacks);
  assert.deepEqual(callbacks.map(call => call.type), ['loaded', 'saved'], 'The stale snapshot must not reach app onLoaded/comments callbacks');
  assert.equal(callbacks.at(-1).profile.display_name, 'New chosen name');
  assert.equal(callbacks.at(-1).avatar, '');
  await page.evaluate(() => window.profileRefresh());
  assert.deepEqual(await page.evaluate(() => identityCallbacks.map(call => call.type)), ['loaded', 'saved', 'loaded'], 'A refresh begun after the save still renews the current profile normally');
  assert.equal(await card.locator('[data-profile-own-name]').textContent(), 'New chosen name');
  assert.deepEqual(errors, []);
  console.log('Profile refresh/save race passed: real editor save/removal/privacy controls, delayed old GET rejected before widget and callbacks, later fresh refresh retained. Fixture transport only; no real account writes.');
} finally { releaseRead(); await browser.close(); }
