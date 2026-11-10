import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { startTestPreviewServer } from './test-preview-server.mjs';
const { chromium } = await import(process.env.SONIC_PLAYWRIGHT_MODULE || 'playwright');
const preview = await startTestPreviewServer({ staticRoot: process.argv.includes('--ios') ? 'www' : '' });
const browser = await chromium.launch({ executablePath: '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome', headless: true });
const userA = '11111111-1111-4111-8111-111111111111', userB = '22222222-2222-4222-8222-222222222222';
let profileRevision = Date.now();
const nextProfileTimestamp = () => new Date(profileRevision = Math.max(Date.now(), profileRevision + 1)).toISOString();
const socialConfig = { ok: true, enabled: true, provider: 'supabase', providers: ['google'], supabaseUrl: 'https://profile.test', supabaseAuthUrl: 'https://profile.test', supabaseAnonKey: 'mock-public', features: { publicProfiles: true, socialV2: true } };
let saved = { id: userA, username: 'ana_sonic', display_name: 'Ana', bio: 'Rock, reggae e samba.', musical_preferences: ['idm', 'organic_house'], profile_public: false, profile_link_public: false, show_avatar: false, show_bio: false, show_styles: false, avatar_customized: false, avatar_path: null, updated_at: nextProfileTimestamp() };
let fail = '', submitted = [], delayed = null, savedAvatarUrl = '', photoBytes = null, identityHydrations = 0;
try {
  const page = await browser.newPage({ viewport: { width: 375, height: 812 }, reducedMotion: 'reduce' });
  const errors = []; page.on('pageerror', error => errors.push(error.message));
  await page.route('https://profile.test/**', async route => {
    const url = new URL(route.request().url());
    if (url.pathname.startsWith('/storage/v1/object/sign/')) return url.searchParams.has('fixtureBroken')
      ? route.fulfill({ status: 404, body: 'Fixture image unavailable' })
      : route.fulfill({ contentType: 'image/jpeg', body: photoBytes || Buffer.alloc(0) });
    if (url.pathname === '/rest/v1/profiles') {
      if (route.request().method() === 'PATCH') saved = { ...saved, ...route.request().postDataJSON(), updated_at: nextProfileTimestamp() };
      return route.fulfill({ json: [saved] });
    }
    return route.fulfill({ json: [] });
  });
  await page.route('**/api/**', async route => {
    const pathname = new URL(route.request().url()).pathname;
    if (pathname === '/api/social-config') return route.fulfill({ json: socialConfig });
    if (pathname !== '/api/user-profile') return route.fulfill({ json: { ok: true, enabled: false, tracks: [], count: 0 } });
    const ownerId = route.request().headers().authorization === 'Bearer mock-user-b' ? userB : userA;
    if (route.request().method() === 'GET') {
      if (delayed) await delayed.promise;
      return route.fulfill({ json: { ok: true, profile: saved.id === ownerId ? saved : null, avatarUrl: saved.id === ownerId ? savedAvatarUrl : '' } });
    }
    const body = route.request().postDataJSON();
    if (body.action === 'hydrate-identity') {
      identityHydrations++;
      assert.deepEqual(body, { action: 'hydrate-identity' });
      return route.fulfill({ json: { ok: true, profile: saved.id === ownerId ? saved : null, avatarUrl: saved.id === ownerId ? savedAvatarUrl : '' } });
    }
    submitted.push(body);
    if (fail) return route.fulfill({ status: 409, json: { ok: false, error: fail } });
    saved = { ...saved, display_name: body.displayName.trim(), username: body.username, bio: body.bio, musical_preferences: body.preferences, profile_public: body.privacy.public, profile_link_public: body.privacy.link, show_avatar: body.privacy.photo, show_bio: body.privacy.bio, show_styles: body.privacy.styles, updated_at: nextProfileTimestamp() };
    if (body.photo) {
      photoBytes = Buffer.from(body.photo, 'base64'); saved.avatar_customized = true; saved.avatar_path = `${ownerId}/fixture-photo.jpg`;
      savedAvatarUrl = `https://profile.test/storage/v1/object/sign/sonic-profile-avatars/${saved.avatar_path}?token=fixture-photo`;
    } else if (body.removePhoto) {
      saved.avatar_customized = true; saved.avatar_path = null; savedAvatarUrl = ''; photoBytes = null;
    }
    return route.fulfill({ json: { ok: true, profile: saved, avatarUrl: savedAvatarUrl } });
  });
  await page.addInitScript(() => { localStorage.setItem('sonic_search:privacy:analytics:v1', 'no'); });
  await page.goto(`${preview.baseUrl}/?qa=1&lang=pt&screenshot=1&recommendation=0&tab=profile`, { waitUntil: 'domcontentloaded' });
  await page.waitForSelector('#userProfileCard[data-profile-mounted=true]');
  assert.equal(await page.evaluate(() => window.SonicReleaseFlags.publicProfiles), true, 'The real social-config response activates the editor');
  await page.evaluate(() => setActiveAppTab('profile'));
  const root = page.locator('#userProfileCard');
  assert.ok(await root.locator('[data-profile-login-panel]').isVisible());
  assert.ok(!(await root.locator('[data-profile-content]').isVisible()));
  await page.evaluate(id => {
    socialStoreSession({ access_token: 'mock-user-a', expires_at: Math.floor(Date.now() / 1000) + 3600, user: { id, email: 'test@example.test', user_metadata: { full_name: 'Ana' } } });
  }, userA);
  await root.locator('[data-profile-content]').waitFor();
  assert.ok(identityHydrations > 0, 'The fixture exercises authenticated canonical identity bootstrap without counting it as an editor save');
  assert.equal(await root.locator('[data-profile-badge]').textContent(), 'Privado');
  await root.locator('[data-profile-edit]').click();
  assert.equal(await root.locator('[name=displayName]').inputValue(), 'Ana');
  assert.equal(await root.locator('[name=shareBio]').isEnabled(), false);
  await root.locator('[name=public]').check();
  await root.locator('[name=shareLink]').uncheck();
  assert.equal(await root.locator('[data-profile-badge]').textContent(), 'Privado', 'Unsaved preview cannot claim publication');
  assert.equal(await root.locator('[data-profile-preview-bio]').isVisible(), false);
  await root.locator('[name=shareBio]').check();
  assert.equal(await root.locator('[data-profile-preview-bio]').textContent(), saved.bio);
  await root.locator('[name=shareStyles]').check();
  assert.equal(await root.locator('[data-profile-preview-styles] span').count(), 2);
  await root.locator('[name=bio]').fill('<img src=x onerror=alert(1)> Gosto de samba.');
  assert.equal(await root.locator('[data-profile-preview-bio] img').count(), 0, 'Public bio is text, never HTML');
  assert.equal(await root.locator('[data-profile-bio-count]').textContent(), '44/280');
  await root.locator('[name=username]').fill('../bad');
  await root.locator('[data-profile-save]').click();
  assert.ok((await root.locator('[data-profile-status]').textContent()).includes('3 a 30'));
  assert.equal(submitted.length, 0);
  await root.locator('[name=username]').fill('ana_sonic');
  fail = 'username_taken';
  await root.locator('[data-profile-save]').click();
  await root.locator('[data-profile-status]').filter({ hasText: 'já está em uso' }).waitFor();
  assert.equal(await root.locator('[name=bio]').inputValue(), '<img src=x onerror=alert(1)> Gosto de samba.');
  assert.equal(await root.locator('form').isVisible(), true);
  fail = '';
  await root.locator('[data-profile-save]').click();
  await root.locator('[data-profile-status]').filter({ hasText: 'Perfil salvo.' }).waitFor();
  assert.equal(await root.locator('[data-profile-badge]').textContent(), 'Visível na comunidade');
  await root.locator('[data-profile-edit]').click();
  await root.locator('[name=bio]').fill('Must be discarded');
  await root.locator('[data-profile-cancel]').click();
  await root.locator('[data-profile-edit]').click();
  assert.equal(await root.locator('[name=bio]').inputValue(), saved.bio);
  // Browser processing is independent from the API's server-side image validation.
  const pixel = Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+/X1kAAAAASUVORK5CYII=', 'base64');
  await root.locator('[name=photo]').setInputFiles({ name: 'photo.png', mimeType: 'image/png', buffer: pixel });
  await root.locator('[data-profile-avatar] img').waitFor();
  await root.locator('[data-profile-save]').click();
  await root.locator('[data-profile-status]').filter({ hasText: 'Perfil salvo.' }).waitFor();
  assert.ok(submitted.at(-1).photo);
  assert.ok(submitted.at(-1).photo.length < 699052);
  await root.locator('[data-profile-avatar] img').evaluate(img => { img.src += '&fixtureBroken=1'; });
  await root.locator('[data-profile-avatar] img').waitFor({ state: 'detached' });
  assert.equal(await root.locator('[data-profile-avatar]').textContent(), 'A', 'A failed photo request falls back to the real saved name initial');
  await root.locator('[data-profile-edit]').click();
  await root.locator('[data-profile-remove]').click();
  await root.locator('[data-profile-save]').click();
  await root.locator('[data-profile-status]').filter({ hasText: 'Perfil salvo.' }).waitFor();
  assert.equal(submitted.at(-1).removePhoto, true);
  assert.equal(await root.locator('[data-profile-avatar] img').count(), 0);
  await root.locator('[data-profile-edit]').click();
  await root.locator('[name=bio]').fill('Rock, reggae e samba. Sempre procurando uma descoberta nova.');
  for (const viewport of [{ width: 375, height: 812 }, { width: 852, height: 393 }, { width: 1440, height: 960 }]) {
    await page.setViewportSize(viewport); await root.scrollIntoViewIfNeeded();
    const metrics = await root.evaluate(el => ({ width: el.getBoundingClientRect().width, scrollWidth: el.scrollWidth,
      targets: [...el.querySelectorAll('button,.profile-choice')].filter(b => b.getBoundingClientRect().height).map(b => b.getBoundingClientRect().height) }));
    assert.ok(metrics.scrollWidth <= Math.ceil(metrics.width) + 1, 'Profile has no horizontal overflow');
    assert.ok(metrics.targets.every(height => height >= 44), 'All actions have touch-sized targets');
    await root.screenshot({ path: fileURLToPath(new URL(`../reports/ui-user-profile-${viewport.width}${process.argv.includes('--ios') ? '-ios' : ''}-latest.png`, import.meta.url)) });
  }
  await page.setViewportSize({ width: 375, height: 812 });
  await page.addStyleTag({ content: '#userProfileCard { font-size: 24px; } #userProfileCard h4 { font-size: 2.5rem; }' });
  assert.ok(await root.evaluate(el => el.scrollWidth <= Math.ceil(el.getBoundingClientRect().width) + 1), 'Large text remains operable');
  await page.evaluate(() => setLanguage('en', { persist: false }));
  assert.equal(await root.locator('[data-profile-save]').textContent(), 'Save profile');
  await page.evaluate(() => setLanguage('es', { persist: false }));
  assert.equal(await root.locator('[data-profile-save]').textContent(), 'Guardar perfil');
  await page.evaluate(() => setLanguage('pt', { persist: false }));
  // A session change must immediately clear the old draft/photo, even before a new GET finishes.
  await root.locator('[name=bio]').fill('Private draft from user A');
  delayed = {}; delayed.promise = new Promise(resolve => delayed.resolve = resolve);
  await page.evaluate(id => socialStoreSession({ access_token: 'mock-user-b', expires_at: Math.floor(Date.now()/1000)+3600, user: { id } }), userB);
  assert.equal(await root.locator('[data-profile-content]').isVisible(), false);
  assert.equal(await root.locator('[name=bio]').inputValue(), '');
  assert.equal(await root.locator('[data-profile-avatar] img').count(), 0);
  saved = { id: userB, username: 'other_user', display_name: 'Other', bio: '', musical_preferences: [], avatar_customized: false, avatar_path: null, updated_at: nextProfileTimestamp() };
  delayed.resolve(); delayed = null;
  await root.locator('[data-profile-content]').waitFor();
  await page.evaluate(() => socialStoreSession(null));
  assert.equal(await root.locator('[data-profile-content]').isVisible(), false);
  assert.equal(await root.locator('[data-profile-login-panel]').isVisible(), true);
  assert.deepEqual(errors, []);
  const demo = await browser.newPage(); let previewProfileRequests = 0;
  await demo.route('**/api/**', route => {
    const pathname = new URL(route.request().url()).pathname;
    if (pathname === '/api/social-config') return route.fulfill({ json: socialConfig });
    if (pathname === '/api/user-profile') previewProfileRequests++;
    return route.fulfill({ json: { ok: true, enabled: false } });
  });
  await demo.goto(`${preview.baseUrl}/?qa=1&lang=pt&screenshot=1&recommendation=0&tab=profile&profilePreview=1`, { waitUntil: 'domcontentloaded' });
  await demo.waitForSelector('#userProfileCard[data-profile-mounted=true]');
  await demo.evaluate(() => setActiveAppTab('profile'));
  const demoRoot = demo.locator('#userProfileCard');
  await demoRoot.locator('[data-profile-content]').waitFor();
  assert.equal(await demoRoot.locator('[data-profile-demo]').isVisible(), true);
  await demoRoot.locator('[data-profile-edit]').click();
  await demoRoot.locator('[name=displayName]').fill('Local preview only');
  await demoRoot.locator('[data-profile-save]').click();
  assert.equal(previewProfileRequests, 0, 'Local preview never sends a profile or a photo to the real API');
  await demo.reload({ waitUntil: 'domcontentloaded' });
  await demoRoot.locator('[data-profile-content]').waitFor();
  assert.notEqual(await demoRoot.locator('[data-profile-own-name]').textContent(), 'Local preview only', 'Preview changes disappear on reload');
  await fs.writeFile(new URL(`../reports/user-profile-ui${process.argv.includes('--ios') ? '-ios' : ''}-latest.json`, import.meta.url), JSON.stringify({ passed: true, mode: process.argv.includes('--ios') ? 'ios-bundle-browser' : 'web', viewports: [375, 852, 1440], authAndNetwork: 'mocked', photoProcessing: 'browser-tested', crossAccountIsolation: true, previewNoWrites: true, errors }, null, 2) + '\n');
  console.log('Profile editor UI passed: anonymous/account states, opt-in preview, safe text, validation, retry, discard, photo processing/removal, phone/landscape/desktop/large-text layouts, three languages and session isolation. API and authentication are mocked.');
} finally { await browser.close(); await preview.stop(); }
