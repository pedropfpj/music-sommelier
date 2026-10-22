import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import path from 'node:path';
import vm from 'node:vm';
import { fileURLToPath } from 'node:url';
const { chromium } = await import(process.env.SONIC_PLAYWRIGHT_MODULE || 'playwright');
const root = fileURLToPath(new URL('../', import.meta.url));
const read = name => fs.readFile(path.join(root, name), 'utf8');
const index = await read('index.html');
const buildUrl = new URL('build-ios-web.mjs', import.meta.url);
const build = (await fs.readFile(buildUrl, 'utf8')).split('assertAssetsMaterialized();')[0]
  .replace(/^import[^\n]+\n/gm, '').replaceAll('import.meta.url', JSON.stringify(buildUrl.href));
const native = vm.createContext({ path, fileURLToPath });
vm.runInContext(build + '\nglobalThis.transforms = { buildIosIndexHtml, buildIosAppJs, buildIosPrivacyHtml, buildIosTermsHtml, buildIosCookiesHtml };', native);
const iosIndex = native.transforms.buildIosIndexHtml(index);
assert.ok(iosIndex.includes('SONIC_SEARCH_DISABLE_ANALYTICS = true'));
assert.ok(iosIndex.includes('privacy-requests.js?v=20260922privacy1ios1'));
assert.ok(!iosIndex.includes('id="privacyConsentBanner"'));
native.transforms.buildIosAppJs(await read('app.js'));
for (const [filename, fn] of [['privacy.html', 'buildIosPrivacyHtml'], ['terms.html', 'buildIosTermsHtml'], ['cookies.html', 'buildIosCookiesHtml']]) native.transforms[fn](await read(filename));
console.log('PASS native source transforms, privacy disable and versioned request assets');

const browser = await chromium.launch({ headless: true });
const folder = path.join(root, 'reports/legal-audit-2026-09-22/remediation');
await fs.mkdir(folder, { recursive: true });
try {
  const page = await browser.newPage({ viewport: { width: 390, height: 844 }, reducedMotion: 'reduce' });
  const errors = []; page.on('pageerror', error => errors.push(error.message));
  const card = index.match(/<article id="privacyRequestsCard"[^]*?<\/article>/)[0];
  const fixture = `<!doctype html><html lang="pt-BR"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1"><style>${await read('styles.css')}\n${await read('privacy-requests.css')}\nbody{padding:20px}main{max-width:960px;margin:auto}.privacy-requests-card{display:grid;gap:24px}</style></head><body><main>${card}</main><script src="privacy-requests.js"></script></body></html>`;
  const requests = []; let fail = false;
  const id = '11111111-1111-4111-8111-111111111111';
  await page.route('**/*', async route => {
    const url = new URL(route.request().url());
    if (url.pathname === '/privacy-requests.js') return route.fulfill({ contentType: 'text/javascript; charset=utf-8', body: await read('privacy-requests.js') });
    if (url.pathname === '/api/privacy-requests') {
      if (fail) return route.fulfill({ status: 503, json: { error: 'privacy_storage_unavailable' } });
      if (route.request().method() === 'POST') {
        requests.push(route.request().postDataJSON());
        return route.fulfill({ status: 201, json: { ok: true, request: { id, kind: 'delete_account', status: 'open', created_at: '2026-09-22T12:00:00Z' } } });
      }
      return route.fulfill({ json: { ok: true, requests: [] } });
    }
    if (url.pathname === '/') return route.fulfill({ contentType: 'text/html; charset=utf-8', body: fixture });
    return route.abort();
  });
  await page.goto('https://compliance.test/');
  await page.evaluate(id => {
    window.testSession = null;
    window.controller = SonicPrivacyRequests.mount(document.querySelector('#privacyRequestsCard'), {
      session: () => window.testSession, freshSession: async () => window.testSession,
      endpoint: () => '/api/privacy-requests', language: () => 'pt', signIn: () => {}
    });
    window.testId = id;
  }, id);
  assert.equal(await page.locator('form').isVisible(), false);
  await page.evaluate(() => { window.testSession = { user: { id: testId }, access_token: 'synthetic-token' }; controller.sync(); });
  assert.equal(await page.locator('form').isVisible(), true);
  await page.locator('[type=submit]').click();
  assert.equal(requests.length, 0, 'Deletion needs explicit confirmation');
  await page.locator('[name=confirmDeletion]').check();
  await page.locator('[type=submit]').click();
  await page.locator('[data-request-status]').filter({ hasText: id }).waitFor();
  assert.equal(requests.length, 1);
  assert.equal(requests[0].confirmDeletion, true);
  assert.ok(!Object.hasOwn(requests[0], 'userId'));
  await page.locator('[type=submit]').click();
  await page.waitForFunction(() => document.querySelector('[data-request-status]').textContent.includes('Protocolo:'));
  assert.equal(requests.length, 2);
  assert.equal(requests[0].requestId, requests[1].requestId, 'Retry is idempotent');
  assert.equal(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth), true);
  await page.screenshot({ path: path.join(folder, 'requests-mobile.png'), fullPage: true });
  fail = true;
  await page.locator('[name=kind]').selectOption('export');
  await page.locator('[type=submit]').click();
  await page.locator('[data-request-status]').filter({ hasText: 'Não foi possível confirmar' }).waitFor({ timeout: 5000 }).catch(async error => {
    console.log(await page.evaluate(() => ({ status: document.querySelector('[data-request-status]').textContent, kind: document.querySelector('[name=kind]').value, valid: document.querySelector('form').checkValidity(), form: document.querySelector('form').outerHTML })));
    console.log(errors); throw error;
  });
  await page.evaluate(() => { window.testSession = null; controller.sync(); });
  assert.equal(await page.locator('[data-request-status]').textContent(), '');
  assert.equal(await page.locator('form').isVisible(), false);
  assert.equal(await page.locator('[data-request-list]').textContent(), '');
  await page.setViewportSize({ width: 1440, height: 1000 });
  await page.screenshot({ path: path.join(folder, 'requests-desktop.png'), fullPage: true });
  assert.deepEqual(errors, []);
  await fs.writeFile(path.join(folder, 'browser-results.json'), JSON.stringify({ passed: true, tested: ['native transforms', 'unauthenticated form hidden', 'explicit deletion confirmation', 'durable receipt rendering', 'idempotent retry', 'error does not claim receipt', 'logout clears private state', 'mobile overflow'], externalRequests: 0, syntheticRequests: requests.length }, null, 2));
  console.log('PASS Chromium request form: login, confirmation, receipt, retry, failure, logout, 390px layout; no external requests');
  await page.close();
  const bootstrap = index.match(/<script>\s*window\.va = window\.va[^]*?<\/script>/)[0];
  const consentScript = index.match(/<script>\s*\(function \(\) \{\s*const key = window\.SONIC_PRIVACY_ANALYTICS_STORAGE_KEY[^]*?<\/script>/)[0];
  const banner = index.match(/<section id="privacyConsentBanner"[^]*?<\/section>/)[0];
  for (const initial of ['', 'no', 'yes', 'native']) {
    const context = await browser.newContext();
    await context.addInitScript(initial => {
      if (!localStorage.getItem('compliance-test-seeded')) {
        localStorage.setItem('compliance-test-seeded', '1');
        if (initial && initial !== 'native') localStorage.setItem('sonic_search:privacy:analytics:v1', initial);
      }
      if (initial === 'native') window.SONIC_SEARCH_APP_STORE_MODE = true;
    }, initial);
    let loads = 0;
    const consentPage = await context.newPage();
    await consentPage.route('**/*', async route => {
      const url = new URL(route.request().url());
      if (url.pathname === '/privacy-controls.js') return route.fulfill({ contentType: 'text/javascript; charset=utf-8', body: await read('privacy-controls.js') });
      if (url.pathname === '/_vercel/insights/script.js') { loads++; return route.fulfill({ contentType: 'text/javascript', body: '' }); }
      return route.fulfill({ contentType: 'text/html; charset=utf-8', body: `<!doctype html><html><head><meta charset="UTF-8"><style>.hidden{display:none}</style><script src="privacy-controls.js"></script>${bootstrap}</head><body>${banner}<button data-privacy-settings>Preferences</button>${consentScript}</body></html>` });
    });
    await consentPage.goto('https://consent.test/');
    assert.equal(loads, 0, `No initial analytics for ${initial || 'no choice'}`);
    assert.equal(await consentPage.evaluate(() => SonicPrivacy.allowed()), false);
    if (initial !== 'native') {
      if (initial === 'no') await consentPage.locator('[data-privacy-settings]').click();
      assert.equal(await consentPage.locator('#privacyConsentBanner').isVisible(), true);
      await consentPage.locator('#privacyAnalyticsBtn').click();
      await consentPage.waitForFunction(() => window.__sonicAnalyticsLoaded === true);
      assert.equal(loads, 1);
      assert.equal(await consentPage.evaluate(() => SonicPrivacy.allowed()), true);
      await consentPage.locator('[data-privacy-settings]').click();
      await Promise.all([consentPage.waitForEvent('load'), consentPage.locator('#privacyEssentialBtn').click()]);
      assert.equal(await consentPage.evaluate(() => SonicPrivacy.allowed()), false);
      assert.equal(loads, 1, 'Revocation reload must not inject analytics again');
    }
    await context.close();
  }
  console.log('PASS real consent banner/bootstrap in Chromium: no choice, no, legacy yes, accept, revoke/reload and native');
} finally { await browser.close(); }
