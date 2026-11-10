// Full shipped index/app.min + standalone Friends UI, with the real Friends
// handler and migration running in PGlite. Authentication is a local fixture;
// unrelated providers are offline. Never loads .env or contacts real accounts.
import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { startTestPreviewServer } from './test-preview-server.mjs';
import { createSocialLab, users } from './social-profile-lab.mjs';
const { chromium } = await import(process.env.SONIC_PLAYWRIGHT_MODULE || 'playwright');
const originalFetch = global.fetch;
const preview = await startTestPreviewServer();
const dataDir = await fs.mkdtemp(path.join(os.tmpdir(), 'sonic-friends-full-app-'));
users.caio = { id: '33333333-3333-4333-8333-333333333333', email: 'private-c@example.test', user_metadata: { display_name: 'Private OAuth C', picture: 'https://private.test/photo' } };
const lab = await createSocialLab({ port: 0, dataDir, friends: true });
const browser = await chromium.launch({ headless: true, executablePath: process.env.SONIC_CHROMIUM_EXECUTABLE || '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome' });
const output = fileURLToPath(new URL('../.vercel/friends-full-app/', import.meta.url));
await fs.mkdir(output, { recursive: true });
const errors = [], calls = [], pages = [];
const action = (page, name) => page.locator(`#friendsPanel [data-friends-action="${name}"]`).first();
const pane = async (page, name) => { const button = action(page, name); if (await button.isVisible()) await button.click(); };
async function tab(page, name) {
  const target = page.locator(`#appTabBar [data-app-tab-target=${name}]`);
  const menu = page.locator('#appMenuBtn');
  if (await menu.isVisible() && await menu.getAttribute('aria-expanded') !== 'true') await menu.click();
  await target.click();
}
async function newPage() {
  const context = await browser.newContext({ viewport: { width: 375, height: 812 }, reducedMotion: 'reduce' });
  const page = await context.newPage(); pages.push(page);
  page.setDefaultTimeout(10000);
  page.on('pageerror', error => errors.push(error.message));
  await page.addInitScript(() => localStorage.setItem('sonic_search:privacy:analytics:v1', 'no'));
  await page.route('**/*', async route => {
    const request = route.request(), url = new URL(request.url());
    const api = url.pathname.startsWith('/api/');
    const labProtocol = url.origin === lab.origin;
    if (api || labProtocol) {
      const real = labProtocol || ['/api/friends', '/api/social-config', '/api/user-profile', '/api/comments', '/api/access-context'].includes(url.pathname);
      if (!real) return route.fulfill({ json: { ok: true, enabled: false, items: [], tracks: [], providers: [] } });
      const headers = request.headers();
      const body = request.postDataBuffer();
      if (url.pathname === '/api/friends') calls.push({ method: request.method(), action: request.method() === 'POST' ? request.postDataJSON().action : url.searchParams.get('action'), account: headers.authorization?.replace('Bearer lab-', '') || 'guest' });
      const response = await originalFetch(lab.origin + url.pathname + url.search, { method: request.method(), headers: { ...(headers.authorization ? { Authorization: headers.authorization } : {}), ...(headers['content-type'] ? { 'Content-Type': headers['content-type'] } : {}) }, ...(body ? { body } : {}) });
      return route.fulfill({ status: response.status, contentType: response.headers.get('content-type') || 'application/json', body: Buffer.from(await response.arrayBuffer()) });
    }
    if (url.origin !== preview.baseUrl) return route.abort();
    return route.continue();
  });
  return page;
}
async function enter(page, suffix = '') {
  await page.goto(`${preview.baseUrl}/?qa=1&lang=pt&recommendation=0&tab=friends${suffix}`, { waitUntil: 'domcontentloaded' });
  await page.waitForSelector('#friendsPanel[data-friends-mounted=true]');
  await page.waitForFunction(() => window.SonicReleaseFlags?.friends === true);
  await page.locator('#appTabBar [data-app-tab-target=friends]').waitFor({ state: 'visible' });
}
async function login(page, name) {
  await page.evaluate(session => { socialStoreSession(session); ensureOnlineSocialUserSession(); setActiveAppTab('friends'); }, lab.session(name));
  await page.locator('#friendsName').waitFor();
}
async function setup(page, name) {
  await page.locator('#friendsName').fill(name);
  await page.locator('#friendsPanel [data-friends-form=identity] button[type=submit]').click();
  await page.locator('#friendsPanel .friends-own-identity strong').filter({ hasText: name }).waitFor();
}
try {
  await lab.db.query('insert into auth.users(id) values($1)', [users.caio.id]);
  for (const [account, display, username, isPublic] of [['ana', 'Ana App', 'ana_lab', false], ['bia', 'Bia Pública', 'bia_lab', true], ['caio', 'Caio Privado', 'caio_lab', false]]) {
    await lab.db.query('insert into profiles(id,username,display_name,profile_public,profile_link_public,show_avatar,avatar_url) values($1,$2,$3,$4,$4,false,$5)', [users[account].id, username, display, isPublic, 'https://private.test/owner-photo']);
  }
  const ana = await newPage(); await enter(ana);
  console.log('CHECK full app guest entry');
  await ana.locator('#friendsPanel').getByRole('button', { name: 'Entrar na minha conta' }).waitFor();
  assert.equal(calls.length, 0, 'Guest entry performs no Friends reads or writes');
  assert.deepEqual(await ana.locator('#appTabBar [data-primary-app-tab]:not([hidden])').allTextContents(), ['Descobrir', 'DJs', 'Jornal', 'Amigos', 'Perfil']);
  await tab(ana, 'profile');
  console.log('CHECK real Profile navigation');
  await ana.locator('#profileMoreBtn').click();
  await ana.waitForFunction(() => currentActiveAppTabName() === 'more');
  await tab(ana, 'friends');
  console.log('CHECK More access and return');
  await login(ana, 'ana');
  console.log('CHECK authenticated root transport');
  assert.equal(await ana.locator('#friendsName').inputValue(), 'Ana App', 'The suggestion comes from the saved app profile');
  assert.equal(calls.filter(call => call.method === 'POST').length, 0, 'Authentication alone cannot enable an alias or publish a discovery');
  await setup(ana, 'Ana Sonora');
  console.log('CHECK explicit friends alias');
  assert.equal(await ana.locator('#friendsPanel img').count(), 0, 'Protected owner/OAuth photos are never copied into Friends');
  const bia = await newPage(); await enter(bia); await login(bia, 'bia'); await setup(bia, 'Bia Radar');
  await pane(ana, 'people');
  await ana.locator('#friendsSearch').fill('bia'); await ana.locator('#friendsPanel [data-friends-form=search] button').click();
  await action(ana, 'request').waitFor(); await action(ana, 'request').click();
  assert.equal((await lab.db.query('select count(*)::int n from friend_edges')).rows[0].n, 0, 'The actor preview precedes the request');
  await action(ana, 'confirm').click();
  await ana.locator('#friendsPanel .friends-feedback').filter({ hasText: 'Solicitação enviada' }).waitFor();
  await bia.evaluate(() => friendsController.refresh()); await pane(bia, 'people');
  await action(bia, 'accept').click();
  await bia.locator('#friendsPanel .friends-feedback').filter({ hasText: 'Amizade aceita' }).waitFor();
  console.log('CHECK request and acceptance');
  await ana.evaluate(() => friendsController.refresh());
  const selected = await ana.evaluate(() => {
    const track = pickInstantOpeningTrack()?.track;
    if (!track) throw new Error('The local catalog fixture needs an eligible recording');
    restoreRecommendationSurfaceSnapshot({ track, prefs: { style: track.style }, discovery: null }, { restartPreview: false });
    setActiveAppTab('discover');
    return { artist: track.artist, title: track.song };
  });
  await ana.locator('#shareTrackWithFriendsBtn').click();
  await ana.locator('#friendsNote').waitFor();
  const chosen = await ana.locator('.friends-chosen-track').innerText();
  assert.ok(chosen.includes(selected.artist) && chosen.includes(selected.title));
  await ana.locator('#friendsNote').fill('Só para o círculo: uma gravação escolhida explicitamente.');
  await tab(ana, 'profile');
  await ana.locator('#profileFriendsBtn').click();
  assert.equal(await ana.locator('#friendsNote').inputValue(), 'Só para o círculo: uma gravação escolhida explicitamente.', 'A normal tab round trip retains the chosen-recording draft');
  await ana.locator('#friendsPanel [data-friends-form=share] button[type=submit]').click();
  await ana.locator('#friendsPanel .friends-feedback').filter({ hasText: 'Descoberta compartilhada' }).waitFor();
  console.log('CHECK chosen recording share and draft continuity');
  const stored = (await lab.db.query('select * from friend_posts')).rows[0];
  assert.ok(stored, 'The real handler persisted the explicit post');
  await bia.evaluate(() => friendsController.refresh()); await pane(bia, 'feed');
  await bia.locator('.friends-post-note').filter({ hasText: 'Só para o círculo' }).waitFor();
  assert.equal(await bia.locator('#friendsPanel img').count(), 0);
  const caio = await newPage(); await enter(caio); await login(caio, 'caio'); await setup(caio, 'Caio Reservado');
  assert.equal(await caio.locator('.friends-post').count(), 0);
  const denied = await caio.evaluate(async postId => { try { await requestFriendsApi({ action: 'post', postId }); return null; } catch (error) { return error.code; } }, stored.id);
  assert.equal(denied, 'post_not_found', 'A third signed-in account cannot fetch the known post ID through the root transport');
  console.log('CHECK third-account direct post denial');
  await pane(ana, 'people'); await action(ana, 'create-invite').click();
  await ana.locator('#friendsInviteLink').waitFor();
  const invitation = new URL(await ana.locator('#friendsInviteLink').inputValue());
  const guest = await newPage(); await enter(guest, invitation.hash);
  assert.equal(new URL(guest.url()).hash, '', 'The invite capability is scrubbed from the address bar after capture');
  assert.ok(await guest.evaluate(() => JSON.parse(sessionStorage.getItem('sonic:friends-entry:v1')).inviteToken));
  await action(guest, 'sign-in').click();
  const callback = new URL(guest.url());
  // A provider returns a new document. Changing only the hash on the same local
  // page would be a same-document navigation and would not run app bootstrap.
  callback.searchParams.set('fixtureAuthReturn', '1');
  callback.hash = new URLSearchParams({ access_token: 'lab-caio', refresh_token: 'lab-refresh-caio', expires_in: '3600', token_type: 'bearer' }).toString();
  await guest.goto(callback.href, { waitUntil: 'domcontentloaded' });
  await guest.waitForSelector('#friendsPanel[data-friends-mounted=true]', { state: 'attached' });
  await guest.evaluate(() => ensureSocialMvpReady());
  await guest.waitForFunction(() => Boolean(socialState.session?.user?.id));
  if (await guest.locator('#tasteCalibrationSkipBtn').isVisible()) await guest.locator('#tasteCalibrationSkipBtn').click();
  await guest.locator('.friends-received-invite').getByText('Ana Sonora', { exact: true }).waitFor();
  assert.equal(new URL(guest.url()).hash, '', 'Authentication credentials are removed after the callback');
  assert.equal((await lab.db.query('select count(*)::int n from friend_edges')).rows[0].n, 1, 'Login and invite preview do not create a friendship');
  for (const width of [375, 1440]) {
    await bia.setViewportSize({ width, height: width === 375 ? 812 : 960 });
    await bia.locator('#friendsPanel').scrollIntoViewIfNeeded();
    const size = await bia.evaluate(() => ({ viewport: innerWidth, width: document.documentElement.scrollWidth, panel: document.getElementById('friendsPanel').getBoundingClientRect().width, panelScroll: document.getElementById('friendsPanel').scrollWidth }));
    assert.ok(size.width <= size.viewport + 1 && size.panelScroll <= Math.ceil(size.panel) + 1, 'Whole-app styles and Friends do not overflow horizontally');
    await bia.screenshot({ path: path.join(output, `friends-${width}.png`), fullPage: true });
  }
  assert.deepEqual(errors, [], 'The complete minified application has no JavaScript errors');
  const report = { passed: true, application: 'complete index + app.min.js + real Friends handler and PGlite', auth: 'local fixtures only', media: 'not exercised here; exact media is covered by the weekly/preflight suites', viewports: [375, 1440], checks: ['guest no Friends requests or writes', 'five primary tabs and More through Profile', 'explicit saved-profile alias without photos', 'request preview and mutual acceptance', 'chosen-recording draft survives navigation', 'friends-only post through root authenticated transport', 'third-account known-post denial', 'invitation capture, authentication return, URL scrub and no automatic friendship'], requests: calls, errors };
  await fs.writeFile(path.join(output, 'report.json'), JSON.stringify(report, null, 2) + '\n');
  console.log('PASS full app Friends: guest/navigation, explicit identity/request/accept/share, draft continuity, private post denial, invitation login return and responsive screens. Real handler + PGlite; local auth fixtures; no production calls or writes.');
} catch (error) {
  const diagnostics = [];
  for (const [index, page] of pages.entries()) {
    diagnostics.push({ index, state: await page.evaluate(() => ({ tab: typeof currentActiveAppTabName === 'function' ? currentActiveAppTabName() : '', online: typeof socialState !== 'undefined' && Boolean(socialState.session), friends: document.getElementById('friendsPanel')?.innerText, authVisible: !document.getElementById('authScreen')?.classList.contains('hidden'), calibrationVisible: !document.getElementById('tasteCalibrationScreen')?.classList.contains('hidden') })).catch(() => null) });
    await page.screenshot({ path: path.join(output, `failure-${index}.png`) }).catch(() => {});
  }
  await fs.writeFile(path.join(output, 'failure.json'), JSON.stringify({ error: error.message, calls, labRequests: lab.requests, diagnostics, errors }, null, 2) + '\n');
  throw error;
} finally {
  await browser.close(); await lab.close(); await preview.stop(); delete users.caio; await fs.rm(dataDir, { recursive: true, force: true });
}
