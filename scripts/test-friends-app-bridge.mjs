import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import vm from 'node:vm';
const source = await fs.readFile(new URL('../app.js', import.meta.url), 'utf8');
const begin = source.indexOf('function friendsSessionKey()');
const end = source.indexOf('function selectLibraryTracks(', begin);
assert.ok(begin > 0 && end > begin);
const plain = value => JSON.parse(JSON.stringify(value));
function fixture() {
  const storage = new Map(), calls = [];
  const c = {
    URL, URLSearchParams, Date, Object, JSON, Error, console,
    socialState: { session: { user: { id: 'account-a' } } },
    librarySessionMatchesOnlineAccount: () => true,
    sessionProfileKey: () => 'profile-a', recommendationSessionGeneration: 1,
    isNativeAppRuntime: () => false, isAppStoreRuntimeMode: () => false,
    window: { SonicReleaseFlags: { friends: true }, location: { href: 'https://sonicsearch.app/?tab=friends&lang=pt', origin: 'https://sonicsearch.app' },
      history: { replaceState: (_state, _title, url) => calls.push(['replace', url]) } },
    document: { title: 'Sonic', getElementById: () => null }, currentLanguage: 'pt',
    pendingFriendsEntry: null, friendsEntryOperation: 0, friendsPlaybackContext: null,
    friendsExplicitTracks: new WeakSet(),
    sessionStorage: { setItem: (k, v) => storage.set(k, v), getItem: k => storage.get(k), removeItem: k => storage.delete(k) },
    ensureFreshSocialSession: async () => {}, currentApiAccessToken: async () => 'fixture-bearer',
    resolveAppApiUrl: path => path,
    fetchWithTimeout: async (url, options, timeout) => { calls.push(['fetch', url, options, timeout]); return { ok: true, json: async () => ({ ok: true }) }; },
    STYLE_BPM_RULES: { house: {} }, recommendationTrackKey: t => `${t.artist}::${t.song}`,
    ensureSocialMvpReady: async () => {}, authHasOnlineSession: () => true, ensureOnlineSocialUserSession() {},
    activeTab: 'friends', currentActiveAppTabName: () => c.activeTab, friendsController: { open: async options => calls.push(['open', options]) },
    currentRecommendation: { artist: 'Old Artist', song: 'Old track', style: 'house' },
    setActiveAppTab: tab => { c.activeTab = tab; calls.push(['tab', tab]); }, currentAppUrl: () => new URL('https://sonicsearch.app/?lang=pt'), showAuthScreen() {},
    recommendationRunBusy: false, swipeFeedbackBusy: false, firstRecommendationBusy: false,
    recommendationSessionIsCurrent: n => n === c.recommendationSessionGeneration,
    prepareExplicitPreviewAudio: () => calls.push(['gesture']), stopAllActivePlayback: () => calls.push(['stop']),
    weeklyEditionPreviewCache: new Map(), weeklyEditionItemKey: item => JSON.stringify(item),
    prepareWeeklyEditionTracks: async items => { calls.push(['prepare', items]); const item = items[0]; c.weeklyEditionPreviewCache.set(c.weeklyEditionItemKey(item), { track: { artist: item.artist, song: item.title, style: item.style } }); return { results: [{ status: 'playable' }] }; },
    restoreRecommendationSurfaceSnapshot: (snapshot, options) => { calls.push(['restore', snapshot, options]); c.currentRecommendation = snapshot.track; },
    renderPreview: async (_track, options) => { calls.push(['render', options]); return true; },
    waitForWeeklyPreviewMedia: async () => true, firstRecommendationCompleted: false,
    markRecommendationPresented: track => calls.push(['present', track]), updateStats: () => calls.push(['stats']),
    sonicTinyCopy: pt => pt
  };
  vm.createContext(c); vm.runInContext(source.slice(begin, end), c);
  return { c, calls, storage };
}
{
  const { c, calls } = fixture();
  await c.requestFriendsApi({ action: 'invite-preview', method: 'POST', token: 'private-capability' });
  const fetch = calls.find(row => row[0] === 'fetch');
  assert.equal(fetch[1], 'https://sonicsearch.app/api/friends');
  assert.equal(fetch[2].headers.Authorization, 'Bearer fixture-bearer');
  assert.equal(fetch[2].cache, 'no-store');
  assert.deepEqual(JSON.parse(fetch[2].body), { token: 'private-capability', action: 'invite-preview' });
  assert.equal(fetch[3], 15000);
  c.socialState.session = null;
  await assert.rejects(c.requestFriendsApi({ action: 'overview' }), { code: 'login_required' });
  assert.equal(calls.filter(row => row[0] === 'fetch').length, 1, 'Guests never send account requests');
}
{
  const { c, calls } = fixture();
  c.ensureFreshSocialSession = async () => { c.socialState.session.user.id = 'account-b'; };
  await assert.rejects(c.requestFriendsApi({ action: 'share-track', method: 'POST' }), { code: 'session_changed' });
  assert.equal(calls.length, 0, 'An account change before transport cancels the request');
}
{
  const { c } = fixture();
  c.fetchWithTimeout = async () => ({ ok: true, json: async () => { c.socialState.session.user.id = 'account-b'; return { ok: true, posts: [{ text: 'private-a' }] }; } });
  await assert.rejects(c.requestFriendsApi({ action: 'feed' }), { code: 'session_changed' });
}
{
  const { c, calls } = fixture();
  const token = 'a'.repeat(43);
  const link = new URL(c.makeFriendsInviteUrl(token));
  assert.equal(link.searchParams.get('tab'), 'friends');
  assert.equal(link.searchParams.has('friendInvite'), false);
  assert.equal(new URLSearchParams(link.hash.slice(1)).get('friendInvite'), token);
  c.window.location.href = link.href + '&unrelated=keep';
  assert.equal(c.captureFriendsInviteFromUrl(), true);
  assert.equal(c.readFriendsEntry().inviteToken, token);
  assert.ok(!calls[0][1].includes(token));
  assert.ok(calls[0][1].includes('unrelated=keep'));
  c.window.location.href = 'https://sonicsearch.app/?tab=friends#unrelated=keep';
  assert.equal(c.captureFriendsInviteFromUrl(), false, 'An unrelated hash cannot create a new invite entry');
  await c.ensureFriendsReady();
  assert.equal(calls.find(row => row[0] === 'open')[1].inviteToken, token);
  assert.equal(calls.filter(row => row[0] === 'fetch').length, 0, 'Opening the entry itself cannot create a friendship');
  c.saveFriendsEntry({ composeTrack: { artist: 'Chosen' }, accountId: 'different-account' });
  await c.ensureFriendsReady();
  assert.equal(c.readFriendsEntry(), null);
  assert.deepEqual(plain(calls.at(-1)[1]), {}, 'An owned draft cannot transfer to another account');
}
{
  const { c, calls } = fixture();
  c.currentRecommendation = { artist: 'Chosen Artist', song: 'Chosen Track', style: 'house', deezerTrackId: 123,
    previewUrl: 'https://signed.invalid/audio?token=secret', history: ['private'], text: 'private note', coverArtUrl: 'https://private.invalid/photo' };
  assert.deepEqual(plain(c.friendsTrackSnapshot()), { artist: 'Chosen Artist', title: 'Chosen Track', style: 'house', catalogId: 'Chosen Artist::Chosen Track', url: 'https://www.deezer.com/track/123' });
  await c.shareCurrentTrackWithFriends();
  assert.equal(calls.filter(row => row[0] === 'fetch').length, 0, 'The discovery button chooses a draft and does not post');
  assert.equal(c.readFriendsEntry().accountId, 'account-a');
  assert.equal(c.friendsTrackSnapshot({ artist: 'Artist', song: 'Track', style: 'house', soundcloudTrackUrl: 'https://soundcloud.com/artist/recording/?context=private' }).url, 'https://soundcloud.com/artist/recording');
  assert.equal(c.friendsTrackSnapshot({ artist: 'Artist', song: 'Track', style: 'house', bandcampTrackUrl: 'https://label.bandcamp.com/track/recording/' }).url, 'https://label.bandcamp.com/track/recording');
}
const post = { id: 'post-fixture', text: 'PRIVATE NOTE MUST STAY IN FRIENDS', track: { artist: 'Exact Artist', title: 'Exact Track', style: 'house' } };
{
  const { c } = fixture(); let resolveOpen;
  c.saveFriendsEntry({ composeTrack: { artist: 'Draft A' }, accountId: 'account-a' });
  c.friendsController.open = () => new Promise(resolve => { resolveOpen = resolve; });
  const opening = c.ensureFriendsReady();
  while (!resolveOpen) await Promise.resolve();
  c.socialState.session.user.id = 'account-b';
  c.saveFriendsEntry({ composeTrack: { artist: 'Draft B' }, accountId: 'account-b' });
  resolveOpen(); await opening;
  assert.equal(c.readFriendsEntry().composeTrack.artist, 'Draft B', 'A late open cannot consume the next account’s draft');
}
function playbackFixture() {
  const f = fixture();
  f.c.requestFriendsApi = async data => { f.calls.push(['authorize', data]); return { ok: true, post }; };
  return f;
}
{
  const { c, calls } = playbackFixture();
  assert.deepEqual(plain(await c.openFriendsDiscovery({ artist: 'Untrusted DTO' }, post)), { ok: true });
  assert.deepEqual(plain(calls.find(row => row[0] === 'authorize')[1]), { action: 'post', postId: post.id });
  const restore = calls.find(row => row[0] === 'restore');
  assert.equal(restore[1].track.song, 'Exact Track');
  assert.equal(c.activeTab, 'discover', 'A prepared friend recording opens the visible discovery player');
  assert.ok(!JSON.stringify(restore).includes(post.text), 'Private notes never enter the general discovery/comments surface');
  assert.equal(calls.find(row => row[0] === 'render')[1].exactRecordingOnly, true);
  assert.equal(calls.filter(row => row[0] === 'present').length, 1);
  c.friendsPlaybackContext = null;
  assert.equal(c.friendsRequiresExactRecording(c.currentRecommendation), true, 'Revoking friend context cannot convert an exact chosen recording into fuzzy recovery');
  assert.equal(c.recommendationRunBusy, false);
}
{
  const { c, calls } = playbackFixture();
  c.waitForWeeklyPreviewMedia = async () => false;
  assert.deepEqual(plain(await c.openFriendsDiscovery({}, post)), { ok: false, reason: 'unavailable' });
  assert.equal(calls.filter(row => row[0] === 'present').length, 0);
  assert.equal(c.weeklyEditionPreviewCache.size, 0, 'A failed main player invalidates prior readiness');
  assert.equal(c.friendsPlaybackContext.failed, true);
}
{
  const { c, calls } = playbackFixture(); const previous = c.currentRecommendation;
  c.requestFriendsApi = async () => { throw new Error('post_not_found'); };
  assert.equal((await c.openFriendsDiscovery({}, post)).ok, false);
  assert.equal(c.currentRecommendation, previous);
  assert.equal(calls.filter(row => row[0] === 'prepare' || row[0] === 'present').length, 0);
}
{
  const { c, calls } = playbackFixture(); const prepare = c.prepareWeeklyEditionTracks;
  c.prepareWeeklyEditionTracks = async items => { const result = await prepare(items); c.socialState.session.user.id = 'account-b'; return result; };
  assert.equal((await c.openFriendsDiscovery({}, post)).reason, 'canceled');
  assert.equal(calls.filter(row => row[0] === 'restore' || row[0] === 'present').length, 0);
}
{
  const { c } = fixture();
  c.resolveConfiguredAppApiEndpoint = () => 'https://sonicsearch.app/api/comments';
  c.SOCIAL_COMMENTS_ENDPOINT = '/api/comments'; c.SOCIAL_COMMENTS_API_TIMEOUT_MS = 15000;
  const start = source.indexOf('async function socialCommentsRequest(');
  const end = source.indexOf('\n}', start) + 2;
  vm.runInContext(source.slice(start, end), c);
  c.fetchWithTimeout = async () => ({ text: async () => { c.socialState.session.user.id = 'account-b'; return '{"ok":true}'; } });
  await assert.rejects(c.socialCommentsRequest('/api/comments', { method: 'POST', body: { action: 'block', userId: 'fixture-person', blocked: true } }), /session_changed/, 'A late shared moderation response cannot update another account’s blocked people');
}
console.log('Friends app bridge passed: authenticated body-only capabilities, stale-account guards, explicit draft, private note isolation, fresh post authorization and truthful exact-media acknowledgement.');
