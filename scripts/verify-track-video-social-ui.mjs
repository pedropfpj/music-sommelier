import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { startTestPreviewServer } from './test-preview-server.mjs';
const { chromium } = await import(process.env.SONIC_PLAYWRIGHT_MODULE || 'playwright');
const ios = process.argv.includes('--ios');
const preview = await startTestPreviewServer({ staticRoot: ios ? 'www' : '' });
const browser = await chromium.launch({ executablePath: '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome', headless: true });
const a = '11111111-1111-4111-8111-111111111111';
let failed = false, delayPost = null, delayGet = null;
const comments = new Map(), likes = new Map(), writes = [];
try {
  const page = await browser.newPage({ viewport: { width: 375, height: 812 }, reducedMotion: 'reduce' });
  const errors = []; page.on('pageerror', error => errors.push(error.message));
  await page.route('**/api/**', async route => {
    const req = route.request(), url = new URL(req.url());
    if (url.pathname !== '/api/comments') return route.fulfill({ json: { ok: true, enabled: false, tracks: [], count: 0 } });
    if (req.method() === 'GET') {
      if (delayGet) await delayGet.promise;
      const key = `${url.searchParams.get('targetType')}:${url.searchParams.get('targetKey')}`;
      return route.fulfill({ json: { ok: true, enabled: true, reactionsEnabled: true, comments: comments.get(key) || [], targetReaction: { likes: likes.get(key) ? 1 : 0, liked: Boolean(likes.get(key)) } } });
    }
    const body = req.postDataJSON(); writes.push(body);
    if (failed) return route.fulfill({ status: 503, json: { ok: false, error: 'service_unavailable' } });
    if (delayPost) await delayPost.promise;
    const key = `${body.targetType}:${body.targetKey}`;
    if (body.action === 'like-target') {
      likes.set(key, body.liked);
      return route.fulfill({ json: { ok: true, targetReaction: { likes: body.liked ? 1 : 0, liked: body.liked } } });
    }
    if (body.action === 'react') return route.fulfill({ json: { ok: true } });
    if (req.method() === 'PATCH') {
      (comments.get(key) || []).find(c => c.id === body.id).body = body.body;
      return route.fulfill({ json: { ok: true } });
    }
    const row = { id: `comment-${writes.length}`, targetType: body.targetType, targetKey: body.targetKey, body: body.body, mine: true, author: { id: a, displayName: 'Ana' }, createdAt: new Date().toISOString(), reactions: { likes: 0, dislikes: 0, myReaction: 0 } };
    comments.set(key, [...comments.get(key) || [], row]);
    return route.fulfill({ json: { ok: true, comment: row } });
  });
  await page.addInitScript(() => localStorage.setItem('sonic_search:privacy:analytics:v1', 'no'));
  await page.goto(`${preview.baseUrl}/?qa=1&lang=pt&screenshot=1&recommendation=0`, { waitUntil: 'domcontentloaded' });
  await page.waitForFunction(() => typeof openSocialDiscussion === 'function' && typeof socialState !== 'undefined' && document.getElementById('userProfileCard').dataset.profileMounted === 'true');
  await page.evaluate(() => {
    currentRecommendation = { artist: 'Sonic Artist', song: 'Night Drive', style: 'techno', youtubeUrl: 'https://www.youtube.com/watch?v=abcdefghijk' };
    currentDjRecommendation = { name: 'Sonic DJ', setTitle: 'Sunrise set', style: 'house', platform: 'YouTube', setUrl: 'https://youtu.be/lmnopqrstuv' };
    setActiveAppTab('discover');
  });
  await page.locator('[data-open-discussion="track"]').click();
  const dialog = page.locator('#socialDiscussionDialog');
  await dialog.waitFor();
  assert.ok(await page.locator('#socialCommentsLoginPrompt').isVisible());
  assert.equal(await page.locator('#socialCommentsComposer').isVisible(), false);
  await page.locator('#socialDiscussionClose').click();
  await page.evaluate(id => {
    socialState.enabled = true; socialState.config = { supabaseUrl: 'https://social.test', supabaseAnonKey: 'mock' };
    socialStoreSession({ access_token: 'user-a', expires_at: Math.floor(Date.now()/1000)+3600, user: { id } });
  }, a);
  await page.locator('[data-open-discussion="track"]').click();
  await page.locator('#socialCommentsComposer').waitFor();
  await page.locator('#socialTargetLikeBtn').click();
  await page.waitForFunction(() => document.getElementById('socialTargetLikeBtn').getAttribute('aria-pressed') === 'true');
  assert.equal(writes.at(-1).targetType, 'track');
  await page.locator('#socialCommentsVideoTab').click();
  await page.waitForFunction(() => !socialCommentsState.loading && socialCommentsState.targetType === 'video');
  assert.equal(await page.locator('#socialTargetLikeBtn').getAttribute('aria-pressed'), 'false');
  const input = page.locator('#socialCommentsInput');
  await input.fill('Esse vídeo merece replay. <img src=x onerror=alert(1)>');
  await page.locator('#socialCommentsSubmitBtn').click();
  await page.locator('.social-comment-body').filter({ hasText: 'merece replay' }).waitFor();
  assert.equal(writes.at(-1).targetKey, 'youtube:abcdefghijk');
  assert.equal(await dialog.locator('.social-comment-body img').count(), 0);
  await page.locator('[data-comment-action="like"]').click();
  await page.waitForFunction(() => socialCommentsState.comments[0]?.reactions.myReaction === 1);
  await page.locator('[data-comment-action="edit"]').click();
  await page.locator('[data-comment-edit-input]').fill('Vídeo editado');
  await page.locator('[data-comment-action="edit-save"]').click();
  await page.locator('.social-comment-body').filter({ hasText: 'Vídeo editado' }).waitFor();
  failed = true;
  await input.fill('Preserve este rascunho');
  await page.locator('#socialCommentsSubmitBtn').click();
  await page.locator('#socialCommentsStatus').filter({ hasText: 'Não consegui publicar' }).waitFor();
  assert.equal(await input.inputValue(), 'Preserve este rascunho');
  await page.locator('#socialTargetLikeBtn').click();
  await page.locator('#socialCommentsStatus').filter({ hasText: 'reação' }).waitFor();
  assert.equal(await page.locator('#socialTargetLikeBtn').getAttribute('aria-pressed'), 'false');
  failed = false;
  await input.fill('');
  await page.locator('#socialTargetLikeBtn').click();
  await page.waitForFunction(() => socialCommentsState.targetReaction?.liked);
  for (const width of [375, 852, 1440]) {
    await page.setViewportSize({ width, height: width === 852 ? 393 : 900 });
    assert.ok(await dialog.evaluate(el => el.scrollWidth <= el.clientWidth + 1), `No horizontal overflow at ${width}`);
    const heights = await dialog.locator('button:visible').evaluateAll(buttons => buttons.map(b => b.getBoundingClientRect().height));
    assert.ok(heights.every(h => h >= 44), `Touch targets at ${width}`);
    await fs.mkdir(new URL('../reports/social/', import.meta.url), { recursive: true });
    await page.screenshot({ path: fileURLToPath(new URL(`../reports/social/${ios ? 'ios' : 'web'}-${width}.png`, import.meta.url)) });
  }
  for (const [lang, title] of [['en', 'Video discussion'], ['es', 'Conversación del video'], ['pt', 'Conversa sobre o vídeo']]) {
    await page.evaluate(lang => setLanguage(lang, { persist: false }), lang);
    assert.equal(await page.locator('#socialCommentsTitle').textContent(), title);
  }
  // A response to an old request must not leak to a different target/account.
  delayPost = {}; delayPost.promise = new Promise(resolve => { delayPost.resolve = resolve; });
  await input.fill('Comentário em trânsito');
  const before = writes.length;
  await page.locator('#socialCommentsSubmitBtn').click();
  await page.waitForFunction(() => socialCommentsState.submitting);
  for (let tries = 0; writes.length === before && tries < 100; tries++) await new Promise(resolve => setTimeout(resolve, 10));
  assert.ok(writes.length > before, 'Delayed request reached the server');
  await page.locator('#socialCommentsTrackTab').click();
  await page.waitForFunction(() => !socialCommentsState.loading);
  await input.fill('Rascunho de outra faixa');
  delayPost.resolve(); delayPost = null;
  await page.waitForFunction(() => !socialCommentsState.submitting);
  assert.equal(await input.inputValue(), 'Rascunho de outra faixa');
  await page.locator('#socialDiscussionClose').click();
  await page.evaluate(() => openSocialDiscussion('dj-video'));
  await page.waitForFunction(() => !socialCommentsState.loading && socialCommentsState.targetKey === 'youtube:lmnopqrstuv');
  assert.equal(await page.locator('#socialCommentsTrackTab').isVisible(), false);
  await page.locator('#socialTargetLikeBtn').click();
  await page.waitForFunction(() => socialCommentsState.targetReaction?.liked);
  assert.equal(writes.at(-1).targetKey, 'youtube:lmnopqrstuv');
  delayGet = {}; delayGet.promise = new Promise(resolve => { delayGet.resolve = resolve; });
  await page.evaluate(() => void loadSocialComments());
  await page.evaluate(() => socialStoreSession(null));
  delayGet.resolve(); delayGet = null;
  await page.locator('#socialCommentsLoginPrompt').waitFor();
  assert.equal(await input.inputValue(), '');
  assert.equal(await page.locator('.social-comment-item').count(), 0);
  assert.equal(await page.locator('#socialTargetLikeBtn').getAttribute('aria-pressed'), 'false');
  await page.locator('#socialDiscussionProfile').click();
  assert.equal(await dialog.isVisible(), false);
  assert.ok(await page.locator('#userProfileCard').isVisible());
  assert.deepEqual(errors, []);
  console.log(`Social UI passed (${ios ? 'iOS bundle' : 'web'}): visitors, profile shortcut, tracks/videos/DJ sets, likes, comments, edits, safe text, failure drafts, cross-target/session races, 3 layouts and 3 languages. Auth/API mocked.`);
} finally { delayPost?.resolve(); delayGet?.resolve(); await browser.close(); await preview.stop(); }
