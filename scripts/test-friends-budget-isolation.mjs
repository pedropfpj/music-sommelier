// Actual loopback handlers/PostgreSQL fixture only; never loads real credentials.
import assert from 'node:assert/strict';
import { mkdtemp, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { randomUUID } from 'node:crypto';
const { createSocialLab } = await import(process.env.SONIC_FRIENDS_LAB_MODULE || new URL('./social-profile-lab.mjs', import.meta.url));
const dataDir = await mkdtemp(path.join(tmpdir(), 'sonic-friends-budget-isolation-'));
const lab = await createSocialLab({ port: 0, dataDir, friends: true });
async function request(account, route, body) {
  const response = await fetch(lab.origin + route, {
    method: body ? 'POST' : 'GET', headers: { Authorization: `Bearer lab-${account}`, 'Content-Type': 'application/json' },
    body: body ? JSON.stringify(body) : undefined
  });
  return { status: response.status, body: await response.json() };
}
try {
  process.env.SONIC_FRIENDS_DAILY_LIMIT = '2';
  process.env.SONIC_SOCIAL_COMMENTS_DAILY_LIMIT = '1';
  process.env.SONIC_REQUIRE_DURABLE_RATE_LIMITS = 'true';
  assert.equal((await request('ana', '/api/friends?action=overview')).status, 200);
  assert.equal((await request('ana', '/api/friends?action=feed')).status, 200);
  assert.equal((await request('ana', '/api/friends?action=overview')).status, 429, 'The dedicated friends budget remains enforced');
  const comment = await request('ana', '/api/comments', { targetType: 'track', targetKey: 'fixture-artist::fixture-recording', body: 'Private loopback test fixture only.', clientRequestId: randomUUID() });
  assert.equal(comment.status, 200, 'Friends reads must not spend the existing ordinary comments allowance');
  assert.equal(comment.body.ok, true);
  assert.equal((await request('ana', '/api/comments?targetType=track&targetKey=fixture-artist%3A%3Afixture-recording')).status, 429, 'Separating budgets must preserve the comments limit');
  assert.equal((await request('bia', '/api/friends?action=overview')).status, 200, 'A verified second account has its own independent friends allowance');
  assert.equal((await request('bia', '/api/comments', { targetType: 'track', targetKey: 'another-fixture', body: 'Second isolated test identity.', clientRequestId: randomUUID() })).status, 200);
  console.log('Friends budget isolation passed: friends browsing cannot consume comments allowance; both durable limits and account isolation remain enforced. Local fixture identities only.');
} finally { await lab.close(); await rm(dataDir, { recursive: true, force: true }); }
