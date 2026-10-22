#!/usr/bin/env node
// Read-only activation check. Never prints credentials or profile rows.
import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
for (const name of ['.env.local', '.env']) {
  const text = await fs.readFile(path.join(root, name), 'utf8').catch(() => '');
  for (const line of text.split(/\r?\n/)) {
    const match = line.match(/^(?:export\s+)?([A-Za-z_][A-Za-z0-9_]*)\s*=\s*(.*)$/);
    if (match && !process.env[match[1]]) process.env[match[1]] = match[2].trim().replace(/^['"]|['"]$/g, '');
  }
}
const url = String(process.env.SUPABASE_URL || '').replace(/\/+$/, '');
const anon = process.env.SUPABASE_ANON_KEY;
const service = process.env.SUPABASE_SERVICE_ROLE_KEY;
const checks = [];
function record(name, passed, detail = '') { checks.push({ name, passed: Boolean(passed), detail }); }
async function read(endpoint, key) {
  const response = await fetch(`${url}${endpoint}`, { headers: { apikey: key, Authorization: `Bearer ${key}` }, signal: AbortSignal.timeout(15000) });
  return { status: response.status, body: await response.json().catch(() => null) };
}
record('server_credentials', url && anon && service);
if (url && anon && service) {
  for (const [name, endpoint] of [
    ['profile_columns', '/rest/v1/profiles?select=profile_public,show_avatar,show_bio,show_styles,avatar_path,avatar_customized&limit=0'],
    ['private_profile_counters', '/rest/v1/profile_edit_usage?select=user_id,usage_day,edit_count&limit=0']
  ]) {
    const result = await read(endpoint, service);
    record(name, result.status === 200, `HTTP ${result.status}`);
  }
  for (const table of ['profiles', 'activity_feed', 'likes', 'community_public_profiles', 'profile_edit_usage']) {
    const result = await read(`/rest/v1/${table}?select=*&limit=0`, anon);
    record(`anonymous_denied_${table}`, [401, 403].includes(result.status), `HTTP ${result.status}`);
  }
  const bucket = await read('/storage/v1/bucket/sonic-profile-avatars', service);
  record('private_avatar_bucket', bucket.status === 200 && bucket.body?.public === false && bucket.body?.file_size_limit === 524288 && bucket.body?.allowed_mime_types?.length === 1 && bucket.body.allowed_mime_types[0] === 'image/jpeg', `HTTP ${bucket.status}`);
  const metadata = await read('/rest/v1/', service);
  record('durable_profile_counter_rpc', metadata.status === 200 && metadata.body?.paths?.['/rpc/sonic_consume_profile_edit_budget']);
  const auth = await read('/auth/v1/settings', anon);
  record('google_login_enabled', auth.status === 200 && auth.body?.external?.google);
  record('apple_login_enabled', auth.status === 200 && auth.body?.external?.apple);
}
const base = process.argv.find(arg => /^https?:\/\//.test(arg));
if (base) {
  const app = new URL(base);
  const page = await fetch(app, { signal: AbortSignal.timeout(15000) });
  const html = await page.text();
  record('web_editor_published', page.status === 200 && html.includes('id="userProfileCard"') && html.includes('user-profile.js'), `HTTP ${page.status}`);
  const response = await fetch(new URL('/api/user-profile', app), { headers: { Origin: app.origin }, signal: AbortSignal.timeout(15000) });
  const body = await response.json().catch(() => null);
  record('profile_api_rejects_anonymous', response.status === 401 && body?.error === 'login_required', `HTTP ${response.status}`);
}
const result = { checkedAt: new Date().toISOString(), automatedPrerequisitesPassed: checks.every(check => check.passed), realAccountEndToEnd: 'not-tested-by-this-script', checks };
await fs.mkdir(path.join(root, 'reports'), { recursive: true });
await fs.writeFile(path.join(root, 'reports/user-profile-readiness-latest.json'), JSON.stringify(result, null, 2) + '\n');
for (const check of checks) console.log(`${check.passed ? 'PASS' : 'PENDING'} ${check.name}${check.detail ? ` (${check.detail})` : ''}`);
console.log('Real two-account, cross-device testing is still required; this check does not authenticate or save profiles.');
if (!result.automatedPrerequisitesPassed) process.exitCode = 1;
