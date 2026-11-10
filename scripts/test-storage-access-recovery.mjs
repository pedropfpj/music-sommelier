import assert from 'node:assert/strict';
import { createAppRuntimeTestContext } from './app-runtime-test-harness.mjs';

const backing = new Map();
let denyRead = false, denyWrite = false, writes = 0;
const storage = {
  getItem(key) { if (denyRead) throw Object.assign(new Error('simulated browser access denial'), { name:'SecurityError' }); return backing.get(key) || null; },
  setItem(key,value) { writes++; if (denyWrite) throw Object.assign(new Error('simulated write denial'), { name:'QuotaExceededError' }); backing.set(key,String(value)); },
  removeItem(key) { backing.delete(key); }
};
const account = {mode:'google',providerId:'storage-test-account',email:'storage-test@example.test'};
function context() {
  const ctx=createAppRuntimeTestContext();ctx.localStorage=storage;ctx.console={...console,warn(){}};
  ctx.updateStats=()=>{};ctx.updateSwipeFeedbackCard=()=>{};ctx.renderTrackRating=()=>{};ctx.renderMusicalSpirit=async()=>{};
  return ctx;
}
const initial=context();initial.currentAuthUser=account;initial.loadProgress();
initial.userStats.likedSongs=82;
initial.likedTrackHistory=[initial.likedTrackHistoryEntry({artist:'Storage Fixture',song:'Account track',style:'house'},'liked','2026-11-09T12:00:00.000Z')];
initial.saveProgress();
const progressKey=initial.storageKeyForSession(initial.PROGRESS_STORAGE_KEY);
backing.set(initial.USER_SESSION_STORAGE_KEY,JSON.stringify(account));
backing.set(initial.SOCIAL_SESSION_STORAGE_KEY,JSON.stringify({access_token:'synthetic-test-session',user:{id:'storage-test-account'}}));
assert.equal(JSON.parse(backing.get(progressKey)).stats.likedSongs,82);
const beforeDenial=new Map(backing);

// Existing data can become inaccessible without having been cleared or overwritten.
denyRead=true;denyWrite=true;
const denied=context();
assert.equal(denied.readStoredUserSession(),null);
assert.equal(denied.socialLoadStoredSession(),null);
denied.currentAuthUser={mode:'guest',username:''};denied.loadProgress();denied.saveProgress();
assert.equal(denied.totalLikedSongs(),0);
assert.equal(denied.socialState.localSaveState,'unavailable');
assert.deepEqual([...backing],[...beforeDenial],'Denied browser storage must leave all account bytes untouched');

// Once read access returns, the same account key restores the previous history.
denyRead=false;denyWrite=false;
const restored=context();restored.currentAuthUser=restored.readStoredUserSession();restored.loadProgress();
assert.equal(restored.storageKeyForSession(restored.PROGRESS_STORAGE_KEY),progressKey);
assert.equal(restored.totalLikedSongs(),82);assert.equal(restored.likedTrackHistory[0].song,'Account track');
assert.equal(restored.socialLoadStoredSession().user.id,'storage-test-account');

// Ephemeral sessions return before constructing or serializing the snapshot.
restored.currentAuthUser={mode:'visitor'};restored.progressStorageReady=true;
restored.buildProgressSnapshot=()=>{throw new ReferenceError('simulated uninitialized dependency');};
const beforeEphemeral=writes;restored.saveProgress();
assert.equal(restored.socialState.localSaveState,'session');assert.equal(writes,beforeEphemeral);
assert.equal(restored.librarySyncCopy().phase,'local');

// An early guarded call also cannot reach snapshot dependencies before initialization.
restored.progressStorageReady=false;restored.currentAuthUser=account;
restored.storageKeyForSession=()=>{throw new ReferenceError('must not run before progress initialization');};
assert.doesNotThrow(()=>restored.saveProgress());

assert.deepEqual([...backing],[...beforeDenial]);
console.log('Storage access recovery passed: denied reads/writes can show guest0+unavailable without changing account bytes; restored access uses the same account key and recovers82; ephemeral and pre-initialization guards skip snapshot/write.');
