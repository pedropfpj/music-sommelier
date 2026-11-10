#!/usr/bin/env node
import assert from "node:assert/strict";
import fs from "node:fs";
import vm from "node:vm";
const appSource = fs.readFileSync(new URL("../app.js", import.meta.url), "utf8");
function functionSource(name) {
  const marker = `function ${name}`;
  const markerIndex = appSource.indexOf(marker);
  assert.ok(markerIndex >= 0, `Missing function: ${name}`);
  const asyncIndex = appSource.lastIndexOf("async ", markerIndex);
  const start = asyncIndex >= markerIndex - 8 ? asyncIndex : markerIndex;
  const signatureEnd = appSource.indexOf(") {", markerIndex);
  assert.ok(signatureEnd >= 0, `Missing function body: ${name}`);
  const bodyStart = signatureEnd + 2;
  let depth = 0;
  let quote = "";
  let escaped = false;
  let lineComment = false;
  let blockComment = false;

  for (let index = bodyStart; index < appSource.length; index += 1) {
    const character = appSource[index];
    const next = appSource[index + 1];
    if (lineComment) {
      if (character === "\n") lineComment = false;
      continue;
    }
    if (blockComment) {
      if (character === "*" && next === "/") {
        blockComment = false;
        index += 1;
      }
      continue;
    }
    if (quote) {
      if (escaped) escaped = false;
      else if (character === "\\") escaped = true;
      else if (character === quote) quote = "";
      continue;
    }
    if (character === "/" && next === "/") {
      lineComment = true;
      index += 1;
      continue;
    }
    if (character === "/" && next === "*") {
      blockComment = true;
      index += 1;
      continue;
    }
    if (character === '"' || character === "'" || character === "`") {
      quote = character;
      continue;
    }
    if (character === "{") depth += 1;
    if (character === "}") depth -= 1;
    if (depth === 0) return appSource.slice(start, index + 1);
  }
  throw new Error(`Unclosed function: ${name}`);
}


const functions = ["buildProgressSnapshot", "buildPreferencesSnapshot", "savePreferences", "safeReadJsonStorage", "buildProfileBackupPayload", "saveProgress", "loadProgress", "resetLibrarySyncState", "libraryHistorySignature", "librarySessionIdentity", "rememberLibraryRemoval", "mergeCloudLibraryEntries", "socialLibraryFeedbackRowsForSync", "librarySyncCopy", "libraryStorageUiCopy", "renderLibrarySyncStatus", "socialLibraryRowsFromCloud", "restoreSocialLikedTracksFromCloud", "restoreSocialDislikedTracksFromCloud", "socialTrackRowsForSync", "socialDislikedTrackRowsForSync", "socialParseMetadata", "socialLikedTrackFromRow", "socialDislikedTrackFromRow", "syncSocialLikedTracks", "queueSocialSync", "socialRequest", "socialHeaders", "socialRefreshSession", "socialSessionExpiresAt", "socialSessionExpiresSoon", "socialStoredRefreshToken", "removeLikedTrackFromHistory", "removeDislikedTrackFromHistory", "clearLikedTrackHistory", "clearDislikedTrackHistory"];
const values = new Map();
const cloud = { likes: [], track_feedback: [] };
const requests = [];
let failRead = "";
let failWrite = "";
let mutateDuringRead = null;
let refreshResponse = null;
const ctx = vm.createContext({
  console: { warn() {} }, Date, JSON, Number, String, Boolean, Math, Set, Map, URLSearchParams, Error, AbortSignal,
  setTimeout: () => 1, clearTimeout() {},
  localStorage: { setItem(k,v) { if (ctx.storageFailure) throw new Error("quota"); values.set(k,v); }, getItem:k => values.get(k) || null },
  fetch: async (url, options = {}) => {
    const parsed = new URL(url);
    requests.push({ path: parsed.pathname, method: options.method, body: options.body ? JSON.parse(options.body) : null });
    if (parsed.pathname.startsWith("/auth/")) {
      if (refreshResponse instanceof Error) throw refreshResponse;
      if (refreshResponse?.duringBody) return {ok:true,status:200,text:async()=>{refreshResponse.duringBody();return JSON.stringify(refreshResponse.body);}};
      return new Response(JSON.stringify(refreshResponse?.body || {}), { status: refreshResponse?.status || 200 });
    }
    const table = parsed.pathname.split("/").at(-1);
    if (options.method === "POST") {
      if (failWrite === table) return new Response('{"message":"write unavailable"}', { status:503 });
      for (const row of JSON.parse(options.body)) {
        const idx = cloud[table].findIndex(item => item.user_id === row.user_id && item.target_key === row.target_key);
        if (idx < 0) cloud[table].push(row); else cloud[table][idx] = row;
      }
      return new Response(null, { status:204 });
    }
    if (failRead === table) return new Response('{"message":"read unavailable"}', { status:503 });
    const userId = parsed.searchParams.get("user_id")?.slice(3);
    const offset = Number(parsed.searchParams.get("offset") || 0);
    const limit = Number(parsed.searchParams.get("limit") || 200);
    const result = cloud[table].filter(row => row.user_id === userId).slice(offset, offset + limit);
    if (mutateDuringRead) { const fn = mutateDuringRead; mutateDuringRead = null; fn(); }
    return new Response(JSON.stringify(result), { status:200 });
  }
});
vm.runInContext(`
  var socialState = {session:{access_token:"token-a",refresh_token:"refresh-a",expires_at:4102444800,user:{id:"a"}},config:{supabaseAnonKey:"anon"},enabled:true,lastSyncAt:0,librarySyncPhase:"idle",librarySyncedSignature:"",localSaveState:"saved"};
  var currentAuthUser = {id:"a",mode:"google"};
  var navigator = {onLine:true};
  var configured = true;
  var storageFailure = false;
  var likedTrackHistory = [], dislikedTrackHistory = [], libraryRemovedTrackHistory = [];
  var progressStorageReady = true;
  var userStats = {};
  var adaptiveModel = {likedStyles:new Map(),dislikedStyles:new Map(),likedArtists:new Map(),dislikedArtists:new Map(),likedEnergies:new Map(),dislikedEnergies:new Map()};
  var spiritSignalsByStyle = new Map(), currentSpiritId = "", spiritLastReviewedSongLikes = 0, spiritUnlocked = false;
  var blockedArtistsMemory = new Set(), discoveredArtistsInApp = new Set(), seenArtistsMemory = new Set(), seenTrackKeysMemory = new Set(), seenRecordingIdsMemory = new Set(), knownTrackTitlesMemory = new Set(), legacyKnownTrackTitlesMemory = new Set();
  var recentPresentedArtists = [], trackRatings = new Map(), trackRatingSignals = new Map(), trackPreferenceSignals = new Map(),trackPreviewIssueSignals = new Map(),trackRecommendationIssueSignals = new Map(),previewReliabilityByStyle = new Map();
  var quizAttemptsByStyle = new Map(),quizBestScoreByStyle = new Map(),quizNextOfferCountByStyle = new Map();
  var styleEl={value:"house"},contextEl=null,energyEl=null,bpmEl=null,vocalsEl=null,discoveryModeEl=null,knownArtistsEl=null;
  var currentRecommendation = null;
  const STORAGE_KEY="preferences",SPIRIT_COLLECTIBLE_STORAGE_KEY="collectible",SPIRIT_ART_SEED_STORAGE_KEY="seed",INITIAL_TASTE_CALIBRATION_STORAGE_KEY="calibration",PROFILE_BACKUP_APP_ID="sonic-search",PROFILE_BACKUP_VERSION=1;
  function getWeights(){return {style:1};}
  function djRecommendationStorageKey(){return "djs";}
  function legacyRockPreviewStorageKey(){return "rock";}
  var librarySyncStatus = null,librarySyncTitle = null,librarySyncHint = null,librarySyncRetryBtn = null;
  const AUTH_LOGIN_STANDBY=false, SOCIAL_SYNC_LIMIT=50, SOCIAL_CLOUD_RESTORE_LIMIT=200, LIKED_TRACK_HISTORY_LIMIT=80, PROGRESS_STORAGE_KEY="progress",RECENT_PRESENTED_ARTIST_LIMIT=80;
  function normalize(v="") { return String(v).toLowerCase(); }
  function sonicTinyCopy(pt) { return pt; }
  function socialConfigReady() { return configured; }
  function socialApiUrl(path) { return "https://cloud.test"+path; }
  function sessionProfileKey(user=currentAuthUser) { return user?.id || "guest"; }
  function normalizeUserSession(user) { return user || {}; }
  function isEphemeralSession(user) { return user.mode === "visitor"; }
  function likedTrackKeyFromEntry(entry) { return entry?.key || ""; }
  function likedTrackHistoryEntry(track,source,likedAt) { return track?.artist && track?.song ? {...track,key:track.key || track.artist+"-"+track.song,source,likedAt} : null; }
  function sanitizeLikedTrackHistory(rows) { return Array.isArray(rows) ? rows.slice(0,80) : []; }
  function musicUniverseOfTrack() { return "electronic"; }
  function ensureFreshSocialSession() { return Promise.resolve(Boolean(socialState.session?.access_token)); }
  function loadSocialProfile() { return Promise.resolve(null); }
  function upsertSocialProfile() { return Promise.resolve(null); }
  function applyCloudLikedTrackSignals() {}
  function applyCloudDislikedTrackSignals() {}
  function renderSocialUi() { renderLibrarySyncStatus(); }
  function socialSetStatus(message) { socialState.status=message; }
  function updateStats() { saveProgress(); }
  function renderLikedTrackHistory() {}
  function renderDislikedTrackHistory() {}
  function renderWeeklyHighlights() {}
  function showToast() {}
  function t(key) { return key; }
  function insertSocialActivity() { return Promise.resolve(); }
  function loadSocialFeed() { return Promise.resolve(); }
  function recalculateRatingStats() {}
  function totalLikedSongs() { return likedTrackHistory.length; }
  function storageKeyForSession(base) { return currentAuthUser.mode === "visitor" ? "" : base+":"+currentAuthUser.id; }
  function storageFallbackKeys(base) { return [storageKeyForSession(base)]; }
  function readFirstStoredJson(keys) { return {payload:JSON.parse(localStorage.getItem(keys[0]) || "null")}; }
  function mapEntriesForStorage(map) { return Array.from(map); }
  function setValuesForStorage(set) { return Array.from(set); }
  function hydrateMapFromStorage(map,items=[]) { map.clear(); for(const [k,v] of items) map.set(k,v); }
  function hydrateSetFromStorage(set,items=[]) { set.clear(); for(const item of items) set.add(item); }
  function spiritById() { return null; }
  function spiritReviewCheckpointFromSongLikes() { return 0; }
  function sanitizeRecentPresentedArtists(items=[]) { return items; }
  function migrateExplicitKnownTrackTitles() { return []; }
  function compactArtistIdentitySet() {}
  function backfillLikedTrackHistoryFromSignals() { return [{key:"removed",artist:"Artist",song:"Removed",likedAt:""}]; }
  function backfillDislikedTrackHistoryFromSignals() { return []; }
  function rememberRecordingIdentity() {}
  function updateSwipeFeedbackCard() {}
  function renderTrackRating() {}
  function renderMusicalSpirit() { return Promise.resolve(); }
  function socialStoreSession(session) { socialState.session=session; }
  function decodeJwtPayload() { return {}; }
  function socialFetchAuthUser() { return Promise.resolve({id:"a"}); }
  ${functions.map(functionSource).join("\n")}
`, ctx);
const run = source => vm.runInContext(source, ctx);
const phase = () => run("librarySyncCopy().phase");
const track = (key, day=9) => ({key,artist:"Artist",song:key,style:"house",likedAt:`2026-11-${String(day).padStart(2,"0")}T12:00:00.000Z`});
const row = (entry, sentiment="liked") => ({user_id:"a",target_key:entry.key,artist:entry.artist,song:entry.song,style:entry.style,source:entry.source || sentiment, sentiment, created_at:entry.likedAt, updated_at:entry.likedAt, metadata:sentiment === "liked" ? {likedAt:entry.likedAt} : {dislikedAt:entry.likedAt}});
function reset() {
  cloud.likes=[]; cloud.track_feedback=[]; requests.length=0; failRead=""; failWrite="";
  run('likedTrackHistory=[];dislikedTrackHistory=[];libraryRemovedTrackHistory=[];currentAuthUser={id:"a",mode:"google"};socialState.session={access_token:"token-a",refresh_token:"refresh-a",expires_at:4102444800,user:{id:"a"}};configured=true;navigator.onLine=true;storageFailure=false;resetLibrarySyncState();socialState.localSaveState="saved"');
}
// Being signed in is not proof of a completed read/write round trip.
assert.equal(phase(),"pending");
run('socialState.session=null'); assert.equal(phase(),"local");
run('configured=false'); assert.equal(phase(),"local");
run('currentAuthUser.mode="visitor"'); assert.match(run('librarySyncCopy().title'),/sessão/);
reset();
// Full retained library uploads across batches (old code silently uploaded 50/80).
ctx.likedTrackHistory=Array.from({length:80},(_,i)=>track("local-"+i));
assert.equal(await ctx.syncSocialLikedTracks({activity:false}),true);
assert.equal(cloud.likes.length,80); assert.equal(cloud.track_feedback.length,80); assert.equal(phase(),"synced");
assert.deepEqual(requests.filter(r=>r.path.endsWith("/likes") && r.method==="POST").map(r=>r.body.length),[50,30]);
// Local change during/after success must invalidate the claim; offline keeps data and sends nothing.
ctx.likedTrackHistory.unshift(track("new")); assert.equal(phase(),"pending");
run('navigator.onLine=false'); const beforeRequests=requests.length;
assert.equal(await ctx.syncSocialLikedTracks(),false); assert.equal(requests.length,beforeRequests); assert.equal(phase(),"offline");
assert.equal(run('likedTrackHistory.length'),81);
run('navigator.onLine=true');
// Failed restore cannot become success via a successful upload; local entries survive.
failRead="track_feedback";
assert.equal(await ctx.syncSocialLikedTracks(),false); assert.equal(phase(),"error"); assert.equal(run('likedTrackHistory.some(t=>t.key==="new")'),true);
assert.equal(requests.filter(r=>r.method==="POST").length,4);
failRead=""; failWrite="track_feedback";
assert.equal(await ctx.syncSocialLikedTracks(),false); assert.equal(phase(),"error");
failWrite=""; assert.equal(await ctx.syncSocialLikedTracks({activity:false}),true); assert.equal(phase(),"synced");
// Newer local likes beat stale cloud rejections; newer rejection still overrides a stale like.
reset(); ctx.likedTrackHistory=[track("same",9)]; cloud.track_feedback=[row(track("same",5),"disliked")];
await ctx.syncSocialLikedTracks({activity:false}); assert.equal(run('likedTrackHistory[0].key'),"same"); assert.equal(run('dislikedTrackHistory.length'),0);
reset(); ctx.likedTrackHistory=[track("same",5)]; cloud.track_feedback=[row(track("same",9),"disliked")];
await ctx.syncSocialLikedTracks({activity:false}); assert.equal(run('likedTrackHistory.length'),0); assert.equal(run('dislikedTrackHistory[0].key'),"same");
// Removal survives reload and a second device, and does not destroy old cloud data.
reset(); ctx.likedTrackHistory=[track("removed",5)]; cloud.likes=[row(track("removed",5))];
assert.equal(ctx.removeLikedTrackFromHistory("removed"),true);
ctx.saveProgress(); ctx.loadProgress(); assert.equal(run('likedTrackHistory.length'),0,"Backfill must not resurrect an explicit removal");
assert.equal(await ctx.syncSocialLikedTracks({activity:false}),true); assert.equal(cloud.likes.length,1,"Old record is preserved, removal is a separate action");
assert.equal(cloud.track_feedback[0].source,"library_removed");
run('likedTrackHistory=[];dislikedTrackHistory=[];libraryRemovedTrackHistory=[];resetLibrarySyncState()');
await ctx.syncSocialLikedTracks({activity:false}); assert.equal(run('likedTrackHistory.length'),0,"Another device must respect the removal");
// Pagination restores entries beyond the first 200 without dropping newer local entries.
reset(); cloud.likes=Array.from({length:240},(_,i)=>row(track("cloud-"+i,5))); ctx.likedTrackHistory=[track("newest",9)];
await ctx.syncSocialLikedTracks({activity:false}); assert.equal(run('likedTrackHistory.some(t=>t.key==="newest")'),true);
assert.ok(requests.filter(r=>r.path.endsWith("/likes") && r.method==="GET").length>=2);
// Late responses from account A never merge into account B or trigger uploads to it.
reset(); cloud.likes=[row(track("private-a"))];
mutateDuringRead=()=>run('currentAuthUser={id:"b",mode:"google"};socialState.session={access_token:"b",user:{id:"b"}};likedTrackHistory=[];dislikedTrackHistory=[];libraryRemovedTrackHistory=[];resetLibrarySyncState()');
assert.equal(await ctx.syncSocialLikedTracks({activity:false}),false); assert.equal(run('likedTrackHistory.length'),0); assert.equal(requests.some(r=>r.method==="POST"),false);
// Refresh: temporary network/server outages keep the account for retry; revoked sessions clear it.
reset(); refreshResponse=new Error("offline"); assert.equal(await ctx.socialRefreshSession({clearOnFailure:true}),false); assert.ok(run('socialState.session?.access_token'));
refreshResponse={status:503,body:{message:"temporary"}}; assert.equal(await ctx.socialRefreshSession({clearOnFailure:true}),false); assert.ok(run('socialState.session?.access_token'));
refreshResponse={status:401,body:{message:"revoked"}}; assert.equal(await ctx.socialRefreshSession({clearOnFailure:true}),false); assert.equal(run('socialState.session'),null);
// A delayed refresh response body cannot replace a different signed-in account.
reset(); refreshResponse={body:{access_token:"late-a",refresh_token:"a",user:{id:"a"}},duringBody:()=>run('socialState.session={access_token:"b",user:{id:"b"}}')};
assert.equal(await ctx.socialRefreshSession({clearOnFailure:true}),false);assert.equal(run('socialState.session.user.id'),"b");
// Backup exports current in-memory tracks/preferences even when there is no storage key.
reset();ctx.likedTrackHistory=[track("guest-track")];run('currentAuthUser.mode="visitor"');
let backup=JSON.parse(JSON.stringify(ctx.buildProfileBackupPayload()));
assert.equal(backup.data.progress.likedTrackHistory[0].key,"guest-track");assert.equal(backup.data.preferences.style,"house");assert.equal(backup.session.mode,"guest","An explicit import must be portable to persistent local storage");
reset();ctx.likedTrackHistory=[track("persisted")];ctx.saveProgress();ctx.likedTrackHistory=[track("unsaved-after-quota")];run('storageFailure=true');
backup=JSON.parse(JSON.stringify(ctx.buildProfileBackupPayload()));assert.equal(backup.data.progress.likedTrackHistory[0].key,"unsaved-after-quota","Export cannot silently use stale localStorage after a failed write");
// Local quota errors must not show a green saved state.
reset(); run('storageFailure=true; saveProgress()'); assert.equal(phase(),"error"); assert.match(run('librarySyncCopy().title'),/sem cópia/);
console.log("Saved-track sync passed: truthful states, all retained tracks, offline/failure recovery, timestamp merge, durable removals, pagination, account isolation, refresh and storage errors.");
