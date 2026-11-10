import assert from 'node:assert/strict';
import { readFile, writeFile, mkdir } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { createHash } from 'node:crypto';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
export const PLAYLIST_URL = 'https://music.apple.com/us/playlist/big-beat-essentials/pl.78e98b7f1ea842dc807bd646ab37083e';
export const SELECTION_PATH = 'data/electronic_editorial_recordings_v26_20261110.selection.json';
export const CSV_PATH = 'data/electronic_editorial_recordings_v26_20261110.csv';
const SOURCE = 'big_beat_editorial_v26_20261110';
const sha = value => createHash('sha256').update(value).digest('hex');
const textKey = value => String(value || '').normalize('NFKC').replace(/[’‘]/g, "'").toLowerCase().replace(/\s+/g, ' ').trim();

export function appleRecordingId(value) {
  const url = new URL(value);
  assert.equal(url.protocol, 'https:'); assert.equal(url.hostname, 'music.apple.com');
  if (/^\/us\/album\/[^/]+\/\d+\/?$/.test(url.pathname)) return url.searchParams.get('i') || '';
  return url.pathname.match(/^\/us\/song\/[^/]+\/(\d+)\/?$/)?.[1] || '';
}

export function durationSeconds(iso = '') {
  const match = String(iso).match(/^PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+(?:\.\d+)?)S)?$/);
  assert.ok(match, 'A recording needs an explicit ISO duration');
  return Number(match[1] || 0) * 3600 + Number(match[2] || 0) * 60 + Number(match[3] || 0);
}

export function parseEditorialPlaylist(html) {
  const blocks = [...html.matchAll(/<script[^>]+type="application\/ld\+json"[^>]*>([\s\S]*?)<\/script>/gi)].map(match => JSON.parse(match[1]));
  const playlist = blocks.find(item => item['@type'] === 'MusicPlaylist');
  assert.ok(playlist, 'Missing MusicPlaylist structured data');
  assert.equal(playlist.name, 'Big Beat Essentials');
  assert.equal(playlist.author?.name, 'Apple Music', 'Community playlists cannot inherit this editorial proof');
  assert.ok(Array.isArray(playlist.track) && playlist.track.length >= 6);
  return { name: playlist.name, author: 'Apple Music', url: PLAYLIST_URL, numTracks: playlist.numTracks, tracks: playlist.track.map((track, index) => {
    assert.equal(track['@type'], 'MusicRecording');
    const id = appleRecordingId(track.url); assert.match(id, /^\d+$/);
    return { id, title: track.name, recordingUrl: track.url, durationIso: track.duration, durationSeconds: durationSeconds(track.duration), position: index + 1 };
  }) };
}

export function verifyRecordingIdentity(expected, playlist, lookup) {
  assert.equal(playlist.name, 'Big Beat Essentials');
  assert.equal(playlist.author, 'Apple Music');
  assert.equal(playlist.url, PLAYLIST_URL);
  const id = String(expected.appleTrackId);
  const member = playlist.tracks.find(track => track.id === id);
  assert.ok(member, `Recording ${id} is not in the editorial playlist`);
  assert.equal(textKey(member.title), textKey(expected.song), 'Playlist membership must name this exact version');
  assert.equal(String(lookup.trackId), id, 'A different Apple ID cannot substitute for a playlist recording');
  assert.equal(lookup.wrapperType, 'track'); assert.equal(lookup.kind, 'song');
  assert.equal(textKey(lookup.artistName), textKey(expected.artist), 'Artist identity mismatch');
  assert.equal(textKey(lookup.trackName), textKey(expected.song), 'Title/version mismatch');
  assert.equal(appleRecordingId(lookup.trackViewUrl), id);
  assert.ok(Math.abs(Number(lookup.trackTimeMillis) / 1000 - member.durationSeconds) <= 1.5, 'Master duration differs from the playlist recording');
  const preview = new URL(lookup.previewUrl);
  assert.equal(preview.protocol, 'https:'); assert.equal(preview.hostname, 'audio-ssl.itunes.apple.com');
  assert.match(preview.pathname, /\.m4a$/);
  return member;
}

async function publicGet(url, maxBytes, counter, kind) {
  counter[kind]++;
  assert.ok(counter.provider <= 7 && counter.audio <= 6, 'Public request budget exceeded');
  const response = await fetch(url, { signal: AbortSignal.timeout(12000), redirect: 'error' });
  assert.equal(response.status, 200, `${kind} HTTP ${response.status}`);
  const reader = response.body.getReader(); const chunks = []; let bytes = 0;
  for (;;) {
    const { done, value } = await reader.read(); if (done) break;
    bytes += value.length;
    if (bytes > maxBytes) { await reader.cancel(); throw new Error(`${kind} body exceeded bound`); }
    chunks.push(Buffer.from(value));
  }
  return { body: Buffer.concat(chunks), status: response.status, contentType: response.headers.get('content-type') || '' };
}

export function verifyStoredSelection(selection) {
  assert.equal(selection.tracks.length, 6);
  assert.equal(new Set(selection.tracks.map(track => track.appleTrackId)).size, 6);
  assert.ok(new Set(selection.tracks.map(track => track.artist)).size >= 4);
  assert.equal(selection.genreEvidence.kind, 'apple_music_editorial_playlist_recording');
  assert.equal(selection.genreEvidence.url, PLAYLIST_URL);
  assert.equal(selection.genreEvidence.author, 'Apple Music');
  for (const track of selection.tracks) {
    assert.equal(track.style, 'big_beat');
    assert.equal(track.bpm, null, 'There is no BPM evidence for these exact masters');
    assert.equal(track.bpmSource, null);
    const member = verifyRecordingIdentity(track, selection.playlistObservation, track.lookupObservation);
    assert.equal(track.lookupObservation.httpStatus, 200);
    assert.deepEqual(track.editorialMembership, member);
    assert.equal(track.audioVerification.httpStatus, 200);
    assert.ok(track.audioVerification.bytes > 10000 && track.audioVerification.bytes <= 4_000_000);
    assert.match(track.audioVerification.contentType, /^(audio\/|video\/mp4)/i);
    assert.match(track.audioVerification.sha256, /^[a-f0-9]{64}$/);
    assert.ok(track.audioVerification.mediaDurationSeconds > 2);
    assert.ok(track.audioVerification.currentTimeAfter > track.audioVerification.currentTimeBefore + 0.2, 'Actual playback must advance');
    assert.equal(track.audioVerification.mediaError, null);
    assert.equal(track.audioVerification.previewUrl, track.lookupObservation.previewUrl);
  }
  return true;
}

export function selectionCsv(selection) {
  const fields = ['style', 'artist', 'song', 'label', 'bpm', 'preview_url', 'duration_sec', 'release_date', 'cover_art_url', 'artist_genre', 'genre_evidence_url', 'genre_evidence_kind', 'genre_evidence_author', 'genre_evidence_playlist_id', 'genre_evidence_recording_url', 'genre_evidence_recording_id', 'genre_evidence_recording_title', 'genre_evidence_recording_duration_iso', 'recording_id', 'source_url', 'source_tags', 'source', 'confidence', 'status'];
  const quote = value => `"${String(value ?? '').replace(/"/g, '""')}"`;
  const rows = selection.tracks.map(track => ({
    style: 'big_beat', artist: track.artist, song: track.song, label: '', bpm: '',
    preview_url: track.lookupObservation.previewUrl, duration_sec: String(Math.round(track.lookupObservation.trackTimeMillis / 1000)),
    release_date: track.lookupObservation.releaseDate?.slice(0, 10) || '', cover_art_url: track.lookupObservation.artworkUrl100 || '',
    artist_genre: 'Big Beat — classificação editorial desta gravação', genre_evidence_url: PLAYLIST_URL,
    genre_evidence_kind: selection.genreEvidence.kind, genre_evidence_author: 'Apple Music', genre_evidence_playlist_id: 'pl.78e98b7f1ea842dc807bd646ab37083e',
    genre_evidence_recording_url: track.editorialMembership.recordingUrl, genre_evidence_recording_id: track.appleTrackId,
    genre_evidence_recording_title: track.editorialMembership.title, genre_evidence_recording_duration_iso: track.editorialMembership.durationIso,
    recording_id: `apple_music:${track.appleTrackId}`, source_url: track.editorialMembership.recordingUrl,
    source_tags: 'reviewed_recording_style_v26;big_beat_editorial_v26;apple_editorial_recording;recording_identity_verified;audio_browser_decoded;bpm_unknown',
    source: SOURCE, confidence: 'high', status: 'published'
  }));
  return [fields.map(quote).join(','), ...rows.map(row => fields.map(field => quote(row[field])).join(','))].join('\n') + '\n';
}

async function main() {
  const selection = JSON.parse(await readFile(path.join(root, SELECTION_PATH), 'utf8'));
  const cacheArg = process.argv.indexOf('--observations-cache');
  const cachedDir = cacheArg >= 0 ? path.resolve(process.argv[cacheArg + 1]) : '';
  if (!process.argv.includes('--live') && !cachedDir) {
    verifyStoredSelection(selection);
    assert.equal(await readFile(path.join(root, CSV_PATH), 'utf8'), selectionCsv(selection));
    console.log('Stored Big Beat evidence passed: six exact recordings, six artists, editorial membership and captured browser playback. Use --live to refresh public evidence.');
    return;
  }
  const counter = { provider: 0, audio: 0 };
  const playlistHtml = cachedDir ? await readFile(path.join(cachedDir, 'playlist.html'), 'utf8') : (await publicGet(PLAYLIST_URL, 3_000_000, counter, 'provider')).body.toString('utf8');
  const playlist = parseEditorialPlaylist(playlistHtml);
  const cachedLookups = cachedDir ? JSON.parse(await readFile(path.join(cachedDir, 'lookups.json'), 'utf8')) : [];
  const { chromium } = await import(process.env.SONIC_PLAYWRIGHT_MODULE || 'playwright');
  const browser = await chromium.launch({ headless: true, executablePath: process.env.SONIC_CHROMIUM_EXECUTABLE || '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome' });
  const media = new Map();
  try {
    const page = await browser.newPage();
    await page.route('**/*', route => {
      const id = new URL(route.request().url()).pathname.slice(1);
      const clip = media.get(id);
      return clip ? route.fulfill({ contentType: clip.contentType, body: clip.body }) : route.abort();
    });
    await page.setContent('<audio id="preview" muted preload="auto"></audio>');
    const verified = [];
    for (const expected of selection.tracks) {
      const lookupUrl = `https://itunes.apple.com/lookup?id=${expected.appleTrackId}&entity=song&country=us`;
      const lookup = cachedDir ? cachedLookups.find(row => String(row.trackId) === String(expected.appleTrackId)) : JSON.parse((await publicGet(lookupUrl, 200_000, counter, 'provider')).body.toString()).results.find(row => String(row.trackId) === String(expected.appleTrackId));
      assert.ok(lookup, 'Missing exact lookup result');
      const member = verifyRecordingIdentity(expected, playlist, lookup);
      const clip = await publicGet(lookup.previewUrl, 4_000_000, counter, 'audio');
      assert.match(clip.contentType, /^(audio\/|video\/mp4)/i);
      media.set(String(expected.appleTrackId), clip);
      const before = await page.evaluate(async id => {
        const audio = document.getElementById('preview'); audio.pause();
        audio.src = `https://bigbeat-audio.fixture.test/${id}`; audio.load();
        await new Promise((resolve, reject) => {
          const timer = setTimeout(() => reject(new Error('Real media decode timeout')), 8000);
          audio.addEventListener('loadeddata', () => { clearTimeout(timer); resolve(); }, { once: true });
          audio.addEventListener('error', () => { clearTimeout(timer); reject(new Error(`Media decoder error ${audio.error?.code}`)); }, { once: true });
        });
        await audio.play(); return audio.currentTime;
      }, String(expected.appleTrackId));
      await page.waitForFunction(start => document.getElementById('preview').currentTime > start + 0.3, before, { timeout: 4000 });
      const playback = await page.evaluate(() => { const audio = document.getElementById('preview'); audio.pause(); return { mediaDurationSeconds: audio.duration, currentTimeAfter: audio.currentTime, mediaError: audio.error?.code || null }; });
      const lookupObservation = { ...Object.fromEntries(['wrapperType', 'kind', 'trackId', 'artistId', 'artistName', 'trackName', 'trackViewUrl', 'collectionId', 'collectionName', 'trackTimeMillis', 'releaseDate', 'previewUrl', 'artworkUrl100', 'primaryGenreName'].map(key => [key, lookup[key]])), httpStatus: cachedDir ? lookup.httpStatus : 200, observedAt: lookup.observedAt || new Date().toISOString() };
      verified.push({ ...expected, bpm: null, bpmSource: null, editorialMembership: member, lookupObservation, lookupUrl, audioVerification: { observedAt: new Date().toISOString(), previewUrl: lookup.previewUrl, httpStatus: clip.status, contentType: clip.contentType, bytes: clip.body.length, sha256: sha(clip.body), decoder: 'Chromium HTMLMediaElement, unmodified native AAC decode and playback', currentTimeBefore: before, ...playback } });
      console.log(`Verified ${expected.artist} — ${expected.song}: HTTP ${clip.status}, native decoded playback advanced.`);
    }
    const report = { ...selection, observedAt: new Date().toISOString(), playlistObservation: playlist, playlistHtmlSha256: sha(playlistHtml), requestsThisRun: counter, tracks: verified };
    verifyStoredSelection(report);
    const reportDir = path.join(root, '.vercel/big-beat-editorial-20261110'); await mkdir(reportDir, { recursive: true });
    await writeFile(path.join(reportDir, 'verification.json'), JSON.stringify(report, null, 2) + '\n');
    if (process.argv.includes('--write')) {
      await writeFile(path.join(root, SELECTION_PATH), JSON.stringify(report, null, 2) + '\n');
      await writeFile(path.join(root, CSV_PATH), selectionCsv(report));
    }
    console.log(`Big Beat verified: ${verified.length} recordings; ${new Set(verified.map(track => track.artist)).size} artists; ${counter.provider} fresh metadata and ${counter.audio} audio GETs; no BPM inferred.`);
  } finally { await browser.close(); }
}

if (path.resolve(process.argv[1] || '') === fileURLToPath(import.meta.url)) await main();
