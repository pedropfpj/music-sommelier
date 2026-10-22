import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import vm from 'node:vm';
import { createRequire } from 'node:module';
const require = createRequire(import.meta.url);
const source = await fs.readFile(new URL('../privacy-controls.js', import.meta.url), 'utf8');
const app = await fs.readFile(new URL('../app.js', import.meta.url), 'utf8');
const key = 'sonic_search:privacy:analytics:v1', versionKey = 'sonic_search:privacy:analytics:version';
const uuid = '11111111-1111-4111-8111-111111111111';
function store(initial = {}) {
  const values = new Map(Object.entries(initial));
  return { getItem: k => values.get(k) ?? null, setItem: (k, v) => values.set(k, String(v)), removeItem: k => values.delete(k), values };
}
function browser(initial = {}, native = false) {
  const listeners = {}, localStorage = store(initial);
  const root = { localStorage, sessionStorage: store(), document: { documentElement: { dataset: {} } },
    location: { protocol: 'https:', reload() { root.reloaded = true; } }, SONIC_SEARCH_APP_STORE_MODE: native,
    addEventListener: (name, fn) => { listeners[name] = fn; }, dispatchEvent: event => listeners[event.type]?.(event) };
  const context = vm.createContext({ window: root, localStorage, AbortController, CustomEvent: class { constructor(type, data) { this.type = type; Object.assign(this, data); } } });
  vm.runInContext(source, context);
  return { root, context, listeners };
}
function fn(name) {
  const match = app.match(new RegExp(`^(?:async )?function ${name}\\([^]*?^}`, 'm'));
  assert.ok(match, name); return match[0];
}
for (const initial of [{}, { [key]: 'no' }, { [key]: 'yes' }]) {
  const { root, context } = browser({ ...initial, 'sonic_search:analytics_anonymous:v2': uuid });
  assert.equal(root.SonicPrivacy.allowed(), false);
  assert.equal(root.localStorage.getItem('sonic_search:analytics_anonymous:v2'), null);
  vm.runInContext(fn('analyticsCollectionAllowed'), context);
  const names = ['betaAnalyticsAnonymousId', 'resolveBetaAnalyticsSession', 'sendBetaAppSessionEvent', 'acknowledgeBetaAnalyticsSession', 'betaEventSessionId', 'trackBetaEvent', 'markBetaEventOnce', 'trackBetaReactionMilestone', 'trackBetaGateViewed', 'trackBetaAppSession', 'refreshGlobalDiscoveryExposure', 'recordGlobalDiscoveryExposure'];
  for (const name of names) { vm.runInContext(fn(name), context); await vm.runInContext(`${name}()`, context); }
  assert.equal(root.localStorage.values.size, Object.keys(initial).length, 'Denied app paths create no identifiers');
}
const { root, context, listeners } = browser();
assert.equal(root.SonicPrivacy.setChoice('yes'), true);
assert.equal(root.SonicPrivacy.allowed(), true);
assert.equal(root.localStorage.getItem(versionKey), '2026-09-22');
const pendingSignal = root.SonicPrivacy.signal();
let sent = [];
Object.assign(context, { fetch: async (url, options) => { sent.push({ url, ...options }); return { ok: true, json: async () => ({ ok: true }) }; },
  betaEventsEndpoint: () => '/api/beta-events', cleanBetaField: value => String(value), resolveBetaAnalyticsSession: () => ({ session_id: uuid }),
  createBetaAnalyticsUuid: () => uuid, betaAnalyticsAnonymousId: () => uuid, betaRuntimePlatform: () => 'web',
  betaAnalyticsEnvironment: () => 'test', SONIC_APP_BUILD_ID: 'test', betaAccessGranted: () => true, sanitizeBetaAnalyticsPathname: () => '/' });
vm.runInContext(fn('analyticsCollectionAllowed') + '\n' + fn('trackBetaEvent'), context);
await vm.runInContext('trackBetaEvent("test_event")', context);
assert.equal(sent.length, 1);
assert.equal(JSON.parse(sent[0].body).analytics_consent, true);
assert.equal(sent[0].signal, pendingSignal);
root.__sonicAnalyticsLoaded = true;
root.SonicPrivacy.setChoice('no');
assert.equal(pendingSignal.aborted, true);
assert.equal(root.reloaded, true);
await vm.runInContext('trackBetaEvent("test_event")', context);
assert.equal(sent.length, 1, 'Revocation blocks future events');
root.SonicPrivacy.setChoice('yes');
assert.equal(root.SonicPrivacy.signal().aborted, false);
root.localStorage.setItem(key, 'no'); listeners.storage({ key });
assert.equal(root.SonicPrivacy.allowed(), false);
assert.equal(root.SonicPrivacy.signal().aborted, true);
assert.equal(browser({ [key]: 'yes', [versionKey]: '2026-09-22' }, true).root.SonicPrivacy.allowed(), false);
console.log('PASS consent: no choice, legacy yes, rejection, native, app guards, grant, revoke, abort and cross-tab');

Object.assign(process.env, { NODE_ENV: 'test', SONIC_REQUIRE_DURABLE_RATE_LIMITS: 'false',
  SONIC_BETA_ACCESS_REQUIRED: 'false', SUPABASE_URL: 'https://db.example', SUPABASE_ANON_KEY: 'test-anon', SUPABASE_SERVICE_ROLE_KEY: 'test-service',
  SONIC_PRIVACY_REQUESTS_ENABLED: 'true', SONIC_BETA_EVENTS_ENABLED: 'true', SONIC_DISCOVERY_EXPOSURE_ENABLED: 'true' });
function request(body, method = 'POST') { return { method, query: {}, body, headers: { host: 'localhost', origin: 'http://localhost', authorization: 'Bearer test-token' } }; }
async function invoke(handler, req) {
  const res = { headers: {}, setHeader(k, v) { this.headers[k] = v; }, end(text) { this.text = text; } };
  await handler(req, res); res.body = res.text ? JSON.parse(res.text) : null; return res;
}
let calls = [];
global.fetch = async (...args) => { calls.push(args); throw new Error('Unexpected outbound request'); };
for (const filename of ['_beta-events', '_discovery-exposure']) {
  const handler = require(`../lib/api/${filename}.js`);
  for (const body of [{}, 'null', { analytics_consent: false }, { analytics_consent: true, consent_version: 'old', platform: 'web' }, { analytics_consent: true, consent_version: '2026-09-22', platform: 'ios' }]) {
    const res = await invoke(handler, request(body));
    assert.equal(res.statusCode, 202); assert.equal(res.body.stored, false);
  }
}
assert.equal(calls.length, 0, 'Rejected analytics must not contact any storage');
const deezer = require('../lib/api/_deezer-preview.js');
for (const [route, provider] of [['false', 'false'], ['true', 'false'], ['false', 'true']]) {
  Object.assign(process.env, { SONIC_DEEZER_PREVIEW_ROUTE_ENABLED: route, SONIC_DEEZER_ENABLED: provider });
  const res = await invoke(deezer, { ...request({}, 'GET'), query: { id: '123' } });
  assert.ok(res.statusCode >= 400);
}
assert.equal(calls.length, 0);
Object.assign(process.env, { SONIC_DEEZER_PREVIEW_ROUTE_ENABLED: 'true', SONIC_DEEZER_ENABLED: 'true' });
global.fetch = async () => ({ ok: true, json: async () => ({ preview: 'https://cdn.example/preview.mp3' }) });
const preview = await invoke(deezer, { ...request({}, 'GET'), query: { id: '123' } });
assert.equal(preview.statusCode, 302); assert.equal(preview.headers['Cache-Control'], 'no-store');
console.log('PASS server collection refusal and all Deezer switch combinations');

const privacy = require('../lib/api/_privacy-requests.js');
let authValid = true, failStore = false, malformedStore = false;
global.fetch = async (url, options) => {
  calls.push({ url, options });
  if (url.endsWith('/auth/v1/user')) return { ok: authValid, json: async () => authValid ? { id: uuid, email: 'listener@example.com' } : {} };
  if (failStore) return { ok: false, status: 500, json: async () => ({ message: 'sensitive internal error' }) };
  return { ok: true, json: async () => malformedStore ? null : url.includes('/rpc/') ? { id: uuid, status: 'open', kind: 'delete_account', created_at: '2026-09-22T00:00:00Z' } : [] };
};
const deletion = { kind: 'delete_account', requestId: uuid, message: '', confirmDeletion: true, userId: 'forged-other-user' };
authValid = false; calls = [];
assert.equal((await invoke(privacy, request(deletion))).statusCode, 401);
assert.equal(calls.length, 1);
authValid = true; calls = [];
assert.equal((await invoke(privacy, request({ ...deletion, confirmDeletion: false }))).statusCode, 400);
assert.equal(calls.length, 1);
let receipt = await invoke(privacy, request(deletion));
assert.equal(receipt.statusCode, 201); assert.equal(receipt.body.request.status, 'open');
assert.equal(JSON.parse(calls.at(-1).options.body).p_user_id, uuid, 'Body cannot choose another account');
await invoke(privacy, request({}, 'GET'));
assert.equal(new URL(calls.at(-1).url).searchParams.get('user_id'), `eq.${uuid}`, 'Listing is owner scoped');
failStore = true;
receipt = await invoke(privacy, request(deletion));
assert.equal(receipt.statusCode, 503); assert.equal(receipt.body.ok, undefined); assert.ok(!receipt.text.includes('sensitive'));
failStore = false; malformedStore = true;
assert.equal((await invoke(privacy, request(deletion))).statusCode, 503);
console.log('PASS requests: auth, deletion confirmation, identity isolation, receipt, owner listing and failed storage');

Object.assign(process.env, { SONIC_ARTIST_PROFILE_ENABLED: 'true', SONIC_MUSICBRAINZ_ENABLED: 'true',
  SONIC_MUSICBRAINZ_SUPPLEMENTARY_APPROVED: 'false', SONIC_WIKIPEDIA_ENABLED: 'false', SONIC_ITUNES_ENABLED: 'false',
  SONIC_CATALOG_ENRICHMENT_ENABLED: 'false' });
let musicCalls = [];
global.fetch = async url => {
  assert.equal(new URL(url).hostname, 'musicbrainz.org'); musicCalls.push(url);
  return { ok: true, json: async () => ({ artists: [{ id: uuid, name: 'Example Producer', score: 100, country: 'BR', type: 'Person', tags: [{ name: 'supplementary-test-tag', count: 10 }] }] }) };
};
const artistProfile = require('../lib/api/_artist-profile.js');
let artistResponse = await invoke(artistProfile, request({ artist: 'Example Producer' }));
assert.equal(artistResponse.statusCode, 200);
assert.equal(artistResponse.body.profile.country, 'BR');
assert.equal(artistResponse.body.profile.genre, '');
assert.equal(new URL(musicCalls[0]).searchParams.get('inc'), 'aliases');
process.env.SONIC_MUSICBRAINZ_SUPPLEMENTARY_APPROVED = 'true';
artistResponse = await invoke(artistProfile, request({ artist: 'Example Producer' }));
assert.equal(artistResponse.body.profile.genre, 'supplementary-test-tag');
assert.equal(musicCalls.length, 2);
process.env.SONIC_MUSICBRAINZ_SUPPLEMENTARY_APPROVED = 'false';
artistResponse = await invoke(artistProfile, request({ artist: 'Example Producer' }));
assert.equal(artistResponse.body.profile.genre, '', 'Previously approved cache must not bypass disabled supplementary data');
console.log('PASS MusicBrainz supplementary gate and cache isolation; core identity preserved');

// Evaluate the real billing module with provider SDKs replaced; no remote purchases.
const billingCode = await fs.readFile(new URL('../lib/api/_billing-store.js', import.meta.url), 'utf8');
class Stripe { constructor() { this.billingPortal = { sessions: { create: async () => ({ url: 'https://billing.example/manage' }) } }; } }
const billingContext = vm.createContext({ module: { exports: {} }, process, URL, URLSearchParams, fetch: async () => ({ ok: true, json: async () => [{ provider: 'stripe', provider_customer_ref: 'customer-test' }] }),
  require: name => name === 'stripe' ? Stripe : name === '@apple/app-store-server-library' ? {} : require(name) });
vm.runInContext(billingCode, billingContext);
const billing = billingContext.module.exports;
Object.assign(process.env, { SONIC_BILLING_ENABLED: 'true', SONIC_COMMERCIAL_RELEASE_APPROVED: 'false', STRIPE_SECRET_KEY: 'test' });
assert.equal(billing.billingAvailability().enabled, false);
await assert.rejects(billing.createCheckout({ userId: uuid }), /billing_disabled/);
process.env.SONIC_COMMERCIAL_RELEASE_APPROVED = 'true'; assert.equal(billing.billingAvailability().enabled, true);
process.env.SONIC_BILLING_ENABLED = 'false'; assert.equal(billing.billingAvailability().enabled, false);
assert.equal((await billing.createPortal({ userId: uuid }, 'https://sonicsearch.app')).url, 'https://billing.example/manage');
console.log('PASS new-sales gate and existing-customer portal while billing disabled');
