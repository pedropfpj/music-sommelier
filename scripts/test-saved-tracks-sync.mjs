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


const functions = ["sanitizedTrackDataIssueReports", "recommendationHistoryValues", "validProfileBackupPayload", "restoreProfileBackupPayload", "librarySessionMatchesOnlineAccount", "readPendingLocalLibraryTransfer", "storePendingLocalLibraryTransfer", "capturePendingLocalLibraryTransfer", "bindPendingLibraryTransferToAccount", "renderPendingLibraryTransfer", "importPendingLocalLibraryTransfer", "buildPendingLibraryTransferBackup", "buildProgressSnapshot", "buildPreferencesSnapshot", "savePreferences", "safeReadJsonStorage", "buildProfileBackupPayload", "saveProgress", "loadProgress", "resetLibrarySyncState", "libraryHistorySignature", "librarySessionIdentity", "rememberLibraryRemoval", "mergeCloudLibraryEntries", "socialLibraryFeedbackRowsForSync", "librarySyncCopy", "libraryStorageUiCopy", "renderLibrarySyncStatus", "socialLibraryRowsFromCloud", "restoreSocialLikedTracksFromCloud", "restoreSocialDislikedTracksFromCloud", "socialTrackRowsForSync", "socialDislikedTrackRowsForSync", "socialParseMetadata", "socialLikedTrackFromRow", "socialDislikedTrackFromRow", "syncSocialLikedTracks", "queueSocialSync", "socialRequest", "socialHeaders", "socialRefreshSession", "socialSessionExpiresAt", "socialSessionExpiresSoon", "socialStoredRefreshToken", "removeLikedTrackFromHistory", "removeDislikedTrackFromHistory", "clearLikedTrackHistory", "clearDislikedTrackHistory"];
const values = new Map();
const sessionValues = new Map();
const readGates = new Map();
const cloud = { likes: [], track_feedback: [] };
const requests = [];
let failRead = "";
let failWrite = "";
let mutateDuringRead = null;
let refreshResponse = null;
const ctx = vm.createContext({
  console: { warn() {} }, Date, JSON, Number, String, Boolean, Math, Set, Map, URLSearchParams, Error, AbortSignal,
  setTimeout: () => 1, clearTimeout() {}, AbortController,
  sessionStorage: {getItem:k=>sessionValues.get(k)||null,setItem:(k,v)=>sessionValues.set(k,v),removeItem:k=>sessionValues.delete(k)},
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
    if (readGates.has(userId)) await readGates.get(userId).promise;
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
  var trackDataIssueReports = new Map(), trackDataIssueSaveState = "session";
  ${appSource.match(/const RECOMMENDATION_ISSUE_REASONS = [^;]+;/)[0]}
  ${appSource.match(/const TRACK_DATA_ISSUE_REPORT_LIMIT = [^;]+;/)[0]}
  var pendingLocalLibraryTransfer=null,ephemeralProfileMode=false;
  const PENDING_LIBRARY_TRANSFER_STORAGE_KEY="pending-transfer";
  var libraryTransferPrompt=null,libraryTransferHint=null,libraryTransferBtn=null,libraryTransferExportBtn=null;
  var userStats = {};
  var adaptiveModel = {likedStyles:new Map(),dislikedStyles:new Map(),likedArtists:new Map(),dislikedArtists:new Map(),likedEnergies:new Map(),dislikedEnergies:new Map()};
  var spiritSignalsByStyle = new Map(), currentSpiritId = "", spiritLastReviewedSongLikes = 0, spiritUnlocked = false;
  var blockedArtistsMemory = new Set(), discoveredArtistsInApp = new Set(), seenArtistsMemory = new Set(), seenTrackKeysMemory = new Set(), seenRecordingIdsMemory = new Set(), knownTrackTitlesMemory = new Set(), legacyKnownTrackTitlesMemory = new Set();
  var recentPresentedArtists = [], trackRatings = new Map(), trackRatingSignals = new Map(), trackPreferenceSignals = new Map(),trackPreviewIssueSignals = new Map(),trackRecommendationIssueSignals = new Map(),previewReliabilityByStyle = new Map();
  var quizAttemptsByStyle = new Map(),quizBestScoreByStyle = new Map(),quizNextOfferCountByStyle = new Map();
  var styleEl={value:"house"},contextEl=null,energyEl=null,bpmEl=null,vocalsEl=null,discoveryModeEl=null,knownArtistsEl=null;
  var currentRecommendation = null;
  const STORAGE_KEY="preferences",SPIRIT_COLLECTIBLE_STORAGE_KEY="collectible",SPIRIT_ART_SEED_STORAGE_KEY="seed",INITIAL_TASTE_CALIBRATION_STORAGE_KEY="calibration",PROFILE_BACKUP_APP_ID="sonic-search",PROFILE_BACKUP_VERSION=1,PROFILE_BACKUP_LAST_EXPORT_STORAGE_KEY="last-export",USAGE_GUIDE_ACK_STORAGE_KEY="guide";
  function getWeights(){return {style:1};}
  function djRecommendationStorageKey(){return "djs";}
  function legacyRockPreviewStorageKey(){return "rock";}
  var librarySyncStatus = null,librarySyncTitle = null,librarySyncHint = null,librarySyncRetryBtn = null;
  const AUTH_LOGIN_STANDBY=false, SOCIAL_SYNC_LIMIT=50, SOCIAL_CLOUD_RESTORE_LIMIT=200, LIKED_TRACK_HISTORY_LIMIT=80, RECOMMENDATION_HISTORY_LIMIT=12000, PROGRESS_STORAGE_KEY="progress",RECENT_PRESENTED_ARTIST_LIMIT=80;
  function normalize(v="") { return String(v).toLowerCase(); }
  function sonicTinyCopy(pt) { return pt; }
  function socialConfigReady() { return configured; }
  function socialApiUrl(path) { return "https://cloud.test"+path; }
  function sessionProfileKey(user=currentAuthUser) { return user?.id || "guest"; }
  function normalizeUserSession(user) { return user || {}; }
  function isOnlineSocialMode(mode){return ["google","apple"].includes(mode);}
  function onlineSocialUserSession(){return {id:socialState.session?.user?.id,mode:"google"};}
  function persistUserSession(){}
  function activateUserSession(session){currentAuthUser=session;resetLibrarySyncState();loadProgress();bindPendingLibraryTransferToAccount();}
  function normalizeInitialTasteCalibration(value){return value;}
  function updateProfileBackupStatus(){}
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
  function storageKeyForSession(base,session=currentAuthUser) { return session.mode === "visitor" ? "" : base+":"+session.id; }
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
  function socialStoreSession(session) { if(socialState.session?.user?.id!==session?.user?.id) resetLibrarySyncState(); socialState.session=session; }
  function decodeJwtPayload() { return {}; }
  function socialFetchAuthUser() { return Promise.resolve({id:"a"}); }
  ${functions.map(functionSource).join("\n")}
`, ctx);
const run = source => vm.runInContext(source, ctx);
const phase = () => run("librarySyncCopy().phase");
const track = (key, day=9) => ({key,artist:"Artist",song:key,style:"house",likedAt:`2026-11-${String(day).padStart(2,"0")}T12:00:00.000Z`});
const row = (entry, sentiment="liked") => ({user_id:"a",target_key:entry.key,artist:entry.artist,song:entry.song,style:entry.style,source:entry.source || sentiment, sentiment, created_at:entry.likedAt, updated_at:entry.likedAt, metadata:sentiment === "liked" ? {likedAt:entry.likedAt} : {dislikedAt:entry.likedAt}});
function reset() {
  cloud.likes=[]; cloud.track_feedback=[]; requests.length=0; failRead=""; failWrite=""; sessionValues.clear(); readGates.clear();
  run('likedTrackHistory=[];dislikedTrackHistory=[];libraryRemovedTrackHistory=[];currentAuthUser={id:"a",mode:"google"};socialState.session={access_token:"token-a",refresh_token:"refresh-a",expires_at:4102444800,user:{id:"a"}};configured=true;navigator.onLine=true;storageFailure=false;pendingLocalLibraryTransfer=null;ephemeralProfileMode=false;resetLibrarySyncState();socialState.localSaveState="saved"');
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
// A profile mismatch is never sufficient authorization for cloud reads, queued sync or row building.
reset(); run('currentAuthUser={id:"b",mode:"google"}');
assert.equal(await ctx.syncSocialLikedTracks(),false);await ctx.restoreSocialLikedTracksFromCloud();await ctx.restoreSocialDislikedTracksFromCloud();ctx.queueSocialSync();
assert.equal(requests.length,0);assert.equal(run('socialTrackRowsForSync().length'),0);
// Importing B's portable backup while signed in as A disconnects A; matching B can sync afterward.
reset();
const otherBackup={app:"sonic-search",version:1,session:{id:"b",mode:"google"},data:{progress:{likedTrackHistory:[track("private-b")],dislikedTrackHistory:[]}}};
assert.equal(ctx.restoreProfileBackupPayload(otherBackup),true);assert.equal(run('socialState.session'),null);
assert.equal(await ctx.syncSocialLikedTracks({activity:false}),false);assert.equal(requests.length,0);
run('socialStoreSession({access_token:"b",expires_at:4102444800,user:{id:"b"}})');
assert.equal(await ctx.syncSocialLikedTracks({activity:false}),true);assert.equal(cloud.likes[0].user_id,"b");
// An abandoned A response cannot release B's newer pending sync/busy flags.
reset();
function gate(){let resolve;const promise=new Promise(r=>resolve=r);return {promise,resolve};}
const gateA=gate(),gateB=gate();readGates.set("a",gateA);readGates.set("b",gateB);
const syncA=ctx.syncSocialLikedTracks({activity:false});
while(!requests.length) await new Promise(setImmediate);
run('socialStoreSession({access_token:"b",expires_at:4102444800,user:{id:"b"}});currentAuthUser={id:"b",mode:"google"};likedTrackHistory=[];dislikedTrackHistory=[];libraryRemovedTrackHistory=[]');
const syncB=ctx.syncSocialLikedTracks({activity:false});
while(requests.length<2) await new Promise(setImmediate);
const ownerB=ctx.socialState.librarySyncOperation;gateA.resolve();assert.equal(await syncA,false);
assert.equal(ctx.socialState.librarySyncOperation,ownerB);assert.equal(ctx.socialState.librarySyncInProgress,true);assert.equal(ctx.socialState.busy,true);assert.equal(ctx.socialState.librarySyncPhase,"syncing");
readGates.delete("b");gateB.resolve();assert.equal(await syncB,true);assert.equal(ctx.socialState.librarySyncInProgress,false);assert.equal(ctx.socialState.busy,false);
// Guest snapshots survive the OAuth-style reload and require explicit matched-account consent.
reset();run('currentAuthUser={id:"guest",mode:"visitor"}');ctx.likedTrackHistory=[track("guest-like",9),track("conflict",9)];ctx.dislikedTrackHistory=[track("guest-reject",8)];
ctx.capturePendingLocalLibraryTransfer();const serialized=sessionValues.get("pending-transfer");assert.ok(serialized);assert.doesNotMatch(serialized,/access_token|refresh_token|token-a/);
run('pendingLocalLibraryTransfer=null;socialStoreSession({access_token:"a",expires_at:4102444800,user:{id:"a"}});currentAuthUser={id:"a",mode:"google"};likedTrackHistory=[];dislikedTrackHistory=[];libraryRemovedTrackHistory=[]');ctx.bindPendingLibraryTransferToAccount();
assert.equal(run('likedTrackHistory.length'),0,"Login alone cannot import anonymous tracks");assert.equal(requests.length,0);
ctx.likedTrackHistory=[track("guest-like",9)];ctx.dislikedTrackHistory=[track("conflict",5)];
assert.equal(ctx.importPendingLocalLibraryTransfer(),true);assert.equal(run('likedTrackHistory.filter(t=>t.key==="guest-like").length'),1);assert.equal(run('dislikedTrackHistory.some(t=>t.key==="conflict")'),false);assert.equal(run('dislikedTrackHistory.some(t=>t.key==="guest-reject")'),true);assert.equal(sessionValues.has("pending-transfer"),false);
// Snapshot bound to A stays private to A when B signs in, and quota errors keep it recoverable.
reset();run('currentAuthUser={id:"guest",mode:"guest"}');ctx.likedTrackHistory=[track("for-a")];ctx.capturePendingLocalLibraryTransfer();run('currentAuthUser={id:"a",mode:"google"};likedTrackHistory=[]');ctx.bindPendingLibraryTransferToAccount();
run('socialStoreSession({access_token:"b",user:{id:"b"}});currentAuthUser={id:"b",mode:"google"}');assert.equal(ctx.importPendingLocalLibraryTransfer(),false);assert.ok(sessionValues.get("pending-transfer"));
run('socialStoreSession({access_token:"a",user:{id:"a"}});currentAuthUser={id:"a",mode:"google"};storageFailure=true');assert.equal(ctx.importPendingLocalLibraryTransfer(),false);assert.ok(sessionValues.get("pending-transfer"));
// An unaccepted snapshot for A is not overwritten by a later guest session bound to B.
reset();run('currentAuthUser={id:"guest",mode:"guest"}');ctx.likedTrackHistory=[track("pending-a")];ctx.capturePendingLocalLibraryTransfer();run('currentAuthUser={id:"a",mode:"google"};likedTrackHistory=[]');ctx.bindPendingLibraryTransferToAccount();
run('currentAuthUser={id:"new-guest",mode:"visitor"}');ctx.likedTrackHistory=[track("pending-b")];ctx.capturePendingLocalLibraryTransfer();run('socialStoreSession({access_token:"b",user:{id:"b"}});currentAuthUser={id:"b",mode:"google"};likedTrackHistory=[]');ctx.bindPendingLibraryTransferToAccount();assert.equal(ctx.importPendingLocalLibraryTransfer(),true);assert.equal(run('likedTrackHistory[0].key'),"pending-b");
run('socialStoreSession({access_token:"a",user:{id:"a"}});currentAuthUser={id:"a",mode:"google"};likedTrackHistory=[]');assert.equal(ctx.importPendingLocalLibraryTransfer(),true);assert.equal(run('likedTrackHistory[0].key'),"pending-a");
// A full account library cannot silently consume older guest tracks that fail its retention cap.
reset();run('currentAuthUser={id:"guest",mode:"visitor"}');ctx.likedTrackHistory=[track("older-guest",5)];ctx.capturePendingLocalLibraryTransfer();run('currentAuthUser={id:"a",mode:"google"}');ctx.likedTrackHistory=Array.from({length:80},(_,i)=>track("newer-account-"+i,9));ctx.bindPendingLibraryTransferToAccount();
assert.equal(ctx.importPendingLocalLibraryTransfer(),false);assert.equal(run('likedTrackHistory.some(t=>t.key==="older-guest")'),false);assert.equal(run('readPendingLocalLibraryTransfer().liked[0].key'),"older-guest");
const overflowBackup=JSON.parse(JSON.stringify(ctx.buildPendingLibraryTransferBackup()));assert.equal(overflowBackup.data.progress.likedTrackHistory[0].key,"older-guest");assert.equal(overflowBackup.session.mode,"guest");assert.doesNotMatch(JSON.stringify(overflowBackup),/access_token|refresh_token/);
// Cancelled OAuth, remove the only guest like, retry OAuth: a removal-only state still updates the copy.
reset();run('currentAuthUser={id:"guest",mode:"visitor"}');ctx.likedTrackHistory=[track("cancelled-like",5)];ctx.capturePendingLocalLibraryTransfer();ctx.likedTrackHistory=[];ctx.libraryRemovedTrackHistory=[{...track("cancelled-like",9),source:"library_removed"}];ctx.capturePendingLocalLibraryTransfer();run('currentAuthUser={id:"a",mode:"google"};libraryRemovedTrackHistory=[]');ctx.bindPendingLibraryTransferToAccount();assert.equal(ctx.importPendingLocalLibraryTransfer(),true);assert.equal(run('likedTrackHistory.length'),0);assert.equal(run('libraryRemovedTrackHistory[0].key'),"cancelled-like");
// Older supported WebKit without AbortSignal.timeout still reaches the cloud through an AbortController.
reset();ctx.AbortSignal={};assert.equal(await ctx.syncSocialLikedTracks({activity:false}),true);ctx.AbortSignal=AbortSignal;
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
