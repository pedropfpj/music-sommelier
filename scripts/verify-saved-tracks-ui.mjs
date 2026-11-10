import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { startTestPreviewServer } from './test-preview-server.mjs';
const { chromium } = await import(process.env.SONIC_PLAYWRIGHT_MODULE || 'playwright');
const preview = await startTestPreviewServer({staticRoot:process.argv.includes('--ios')?'www':''});
const browser = await chromium.launch({ executablePath:'/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',headless:true });
const cloud = {likes:[],track_feedback:[]}; let failure=false;
try {
  const context=await browser.newContext({viewport:{width:375,height:812},reducedMotion:'reduce'});
  const page=await context.newPage(); const errors=[]; page.on('pageerror',e=>errors.push(e.message));
  await page.route('**/api/**',route=>route.fulfill({json:{ok:true,enabled:false,tracks:[],count:0}}));
  await page.route('https://sync.test/**',async route=>{
    const req=route.request(), url=new URL(req.url()), table=url.pathname.split('/').at(-1);
    if(failure && table==='track_feedback') return route.fulfill({status:503,json:{message:'temporary test failure'}});
    if(req.method()==='POST') {
      const rows=req.postDataJSON(); if(cloud[table]) for(const row of rows){const index=cloud[table].findIndex(item=>item.target_key===row.target_key);if(index<0)cloud[table].push(row);else cloud[table][index]=row;}
      return route.fulfill({status:201,json:[]});
    }
    if(req.method()==='PATCH') return route.fulfill({json:[]});
    return route.fulfill({json:cloud[table] || []});
  });
  await page.addInitScript(()=>localStorage.setItem('sonic_search:privacy:analytics:v1','no'));
  await page.goto(`${preview.baseUrl}/?qa=1&lang=pt&screenshot=1&recommendation=0&tab=profile`,{waitUntil:'domcontentloaded'});
  await page.waitForFunction(()=>typeof renderLibrarySyncStatus==='function');
  await page.evaluate(()=>{
    setActiveAppTab('profile'); socialState.ready=true;socialState.enabled=true;socialState.config={supabaseUrl:'https://sync.test',supabaseAnonKey:'public-mock'};
    socialStoreSession({access_token:'local-test-only',refresh_token:'local-test-refresh',expires_at:Math.floor(Date.now()/1000)+3600,user:{id:'11111111-1111-4111-8111-111111111111',email:'test@example.test',app_metadata:{provider:'google'},user_metadata:{full_name:'Test Listener'}}});
    activateUserSession(onlineSocialUserSession());
    likedTrackHistory=[likedTrackHistoryEntry({artist:'Michael Bibi',song:'Hanging Tree',style:'tech_house',bpm:126},'liked','2026-11-09T12:00:00.000Z')];
    saveProgress();renderLikedTrackHistory();renderSocialUi({preserveStatus:true});
  });
  const status=page.locator('#librarySyncStatus'), retry=page.locator('#librarySyncRetryBtn');
  assert.equal(await status.getAttribute('data-state'),'pending');
  await retry.click(); await page.waitForFunction(()=>document.getElementById('librarySyncStatus').dataset.state==='synced');
  assert.equal(cloud.likes.length,1); assert.equal(cloud.track_feedback.length,1);
  assert.match(await page.locator('[data-web-copy=saveHint]').textContent(),/última sincronização/);
  assert.doesNotMatch(await page.locator('#profileLibraryHint').textContent(),/navegador|conta conectada/);
  assert.match(await page.locator('#socialLocalLikesLabel').textContent(),/neste aparelho/);
  for(const viewport of [{width:375,height:812},{width:852,height:393},{width:1440,height:960}]) {
    await page.setViewportSize(viewport); await status.scrollIntoViewIfNeeded();
    const metrics=await status.evaluate(el=>({width:el.getBoundingClientRect().width,scroll:el.scrollWidth,button:el.querySelector('button').getBoundingClientRect().height}));
    assert.ok(metrics.scroll<=Math.ceil(metrics.width)+1,'Status fits without horizontal overflow');assert.ok(metrics.button>=44,'Retry has a touch-sized target');
    await status.screenshot({path:fileURLToPath(new URL(`../reports/ui-saved-tracks-${viewport.width}${process.argv.includes('--ios')?'-ios':''}-latest.png`,import.meta.url))});
  }
  await context.setOffline(true); await page.waitForFunction(()=>document.getElementById('librarySyncStatus').dataset.state==='offline');
  assert.equal(await retry.isDisabled(),true);assert.equal(await page.locator('.liked-track-item').count(),1);
  failure=true; await context.setOffline(false); await page.waitForFunction(()=>document.getElementById('librarySyncStatus').dataset.state==='error');
  assert.equal(await page.locator('.liked-track-item').count(),1,'Failed cloud read preserves the visible local track');
  failure=false;await retry.click();await page.waitForFunction(()=>document.getElementById('librarySyncStatus').dataset.state==='synced');
  await page.evaluate(()=>setLanguage('en',{persist:false}));assert.equal(await page.locator('#librarySyncTitle').textContent(),'Likes and rejected tracks synced');
  await page.evaluate(()=>setLanguage('es',{persist:false}));assert.equal(await page.locator('#librarySyncTitle').textContent(),'Likes y descartes sincronizados');
  await page.setViewportSize({width:375,height:812});await page.addStyleTag({content:'.library-sync-status {font-size:24px}.library-sync-status strong{font-size:1.5em}'});
  assert.ok(await status.evaluate(el=>el.scrollWidth<=Math.ceil(el.getBoundingClientRect().width)+1),'Large text fits');
  await page.evaluate(()=>{socialStoreSession(null);renderSocialUi({preserveStatus:true});});assert.equal(await retry.isVisible(),false);
  assert.equal(await page.locator('.liked-track-item').count(),1,'Sign-out does not erase the account local copy');
  // Real guest backup is serialized from memory and imports into a persistent local profile.
  const restored=await page.evaluate(()=>{
    socialStoreSession(null);ephemeralProfileMode=true;currentAuthUser=normalizeUserSession({mode:'visitor'});
    likedTrackHistory=[likedTrackHistoryEntry({artist:'Guest Artist',song:'Guest Saved Track',style:'house'},'liked','2026-11-09T12:00:00.000Z')];
    dislikedTrackHistory=[likedTrackHistoryEntry({artist:'Guest Artist',song:'Guest Rejected Track',style:'house'},'disliked','2026-11-09T12:00:00.000Z')];
    const backup=JSON.parse(JSON.stringify(buildProfileBackupPayload()));
    const exported={likes:backup.data.progress?.likedTrackHistory.length,rejects:backup.data.progress?.dislikedTrackHistory.length};
    restoreProfileBackupPayload(backup);
    return {...exported,localKey:storageKeyForSession(PROGRESS_STORAGE_KEY),restoredLikes:likedTrackHistory.map(t=>t.song),restoredRejects:dislikedTrackHistory.map(t=>t.song)};
  });
  assert.equal(restored.likes,1);assert.equal(restored.rejects,1);assert.ok(restored.localKey.endsWith('guest:default'));
  assert.deepEqual(restored.restoredLikes,['Guest Saved Track']);assert.deepEqual(restored.restoredRejects,['Guest Rejected Track']);
  // The central login transition preserves anonymous tracks without silently adopting them.
  const beforeConsent=await page.evaluate(()=>{
    socialStoreSession(null);ephemeralProfileMode=true;currentAuthUser=normalizeUserSession({mode:'visitor'});
    likedTrackHistory=[likedTrackHistoryEntry({artist:'Session Artist',song:'Before Login',style:'house'},'liked','2026-11-09T12:00:00.000Z')];
    dislikedTrackHistory=[likedTrackHistoryEntry({artist:'Session Artist',song:'Rejected Before Login',style:'house'},'disliked','2026-11-09T12:00:00.000Z')];
    socialStoreSession({access_token:'local-test-only',expires_at:Math.floor(Date.now()/1000)+3600,user:{id:'11111111-1111-4111-8111-111111111111',app_metadata:{provider:'google'}}});
    activateUserSession(onlineSocialUserSession());renderSocialUi({preserveStatus:true});
    return {pending:readPendingLocalLibraryTransfer()?.liked.length,adopted:likedTrackHistory.some(item=>item.song==='Before Login')};
  });
  assert.equal(beforeConsent.pending,1);assert.equal(beforeConsent.adopted,false);
  const transfer=page.locator('#libraryTransferPrompt');assert.equal(await transfer.isVisible(),true);
  await page.setViewportSize({width:375,height:812});await transfer.scrollIntoViewIfNeeded();
  assert.ok(await transfer.evaluate(el=>el.scrollWidth<=Math.ceil(el.getBoundingClientRect().width)+1));
  assert.ok(await page.locator('#libraryTransferBtn').evaluate(el=>el.getBoundingClientRect().height>=44));
  await transfer.screenshot({path:fileURLToPath(new URL('../reports/ui-saved-tracks-transfer-375-latest.png',import.meta.url))});
  await page.locator('#libraryTransferBtn').click();
  const adopted=await page.evaluate(()=>({pending:readPendingLocalLibraryTransfer(),liked:likedTrackHistory.some(item=>item.song==='Before Login'),rejected:dislikedTrackHistory.some(item=>item.song==='Rejected Before Login')}));
  assert.equal(adopted.pending,null);assert.equal(adopted.liked,true);assert.equal(adopted.rejected,true);assert.equal(await transfer.isVisible(),false);
  // A backup's identity must never borrow the token from the previously connected account.
  const mismatched=await page.evaluate(async()=>{
    const backup=buildProfileBackupPayload();backup.session={mode:'google',providerId:'22222222-2222-4222-8222-222222222222',email:'b@example.test'};
    restoreProfileBackupPayload(backup);
    const disconnected=!socialState.session?.access_token;
    const syncAllowed=await syncSocialLikedTracks({activity:false});
    return {disconnected,syncAllowed};
  });
  assert.equal(mismatched.disconnected,true);assert.equal(mismatched.syncAllowed,false);
  // Older overflow remains available and downloadable when the account already has 80 newer likes.
  await page.evaluate(()=>{
    socialStoreSession(null);ephemeralProfileMode=true;currentAuthUser=normalizeUserSession({mode:'visitor'});
    likedTrackHistory=[likedTrackHistoryEntry({artist:'Overflow Artist',song:'Keep This Older Track',style:'house'},'liked','2026-11-05T12:00:00.000Z')];dislikedTrackHistory=[];libraryRemovedTrackHistory=[];capturePendingLocalLibraryTransfer();
    socialStoreSession({access_token:'local-test-only',expires_at:Math.floor(Date.now()/1000)+3600,user:{id:'11111111-1111-4111-8111-111111111111',app_metadata:{provider:'google'}}});activateUserSession(onlineSocialUserSession());
    likedTrackHistory=Array.from({length:80},(_,i)=>likedTrackHistoryEntry({artist:'Account Artist',song:'Newer Track '+i,style:'house'},'liked','2026-11-09T12:00:00.000Z'));dislikedTrackHistory=[];libraryRemovedTrackHistory=[];resetLibrarySyncState();saveProgress();renderSocialUi({preserveStatus:true});
  });
  await page.locator('#libraryTransferBtn').click();assert.equal(await page.locator('#libraryTransferBtn').isDisabled(),true);
  assert.match(await page.locator('#libraryTransferHint').textContent(),/80/);
  const downloadPromise=page.waitForEvent('download');await page.locator('#libraryTransferExportBtn').click();const download=await downloadPromise;
  const overflowFile=JSON.parse(await fs.readFile(await download.path(),'utf8'));
  assert.equal(overflowFile.data.progress.likedTrackHistory[0].song,'Keep This Older Track');
  assert.ok(await page.evaluate(()=>Boolean(readPendingLocalLibraryTransfer())),'Export does not consume the recovery copy');
  assert.deepEqual(errors,[]);
  console.log('Saved-track UI passed: pending/success/offline/error/retry, local track preservation, 375/852/1440 layouts, 44px action, large text, reduced motion, EN/ES and logout. Account/cloud API mocked; no production writes.');
} finally {await browser.close();await preview.stop();}
