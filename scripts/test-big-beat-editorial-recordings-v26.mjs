import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import vm from 'node:vm';
import { PLAYLIST_URL, SELECTION_PATH, CSV_PATH, parseEditorialPlaylist, verifyRecordingIdentity, verifyStoredSelection, selectionCsv, appleRecordingId } from './verify-big-beat-editorial-recordings-v26.mjs';

const selection = JSON.parse(await readFile(new URL(`../${SELECTION_PATH}`, import.meta.url), 'utf8'));
assert.equal(verifyStoredSelection(selection), true);
assert.equal(await readFile(new URL(`../${CSV_PATH}`, import.meta.url), 'utf8'), selectionCsv(selection));
assert.equal(new Set(selection.tracks.map(track => track.artist)).size, 6);
const first = selection.tracks[0];
const playlist = selection.playlistObservation;
const lookup = first.lookupObservation;
assert.equal(verifyRecordingIdentity(first, playlist, lookup).id, first.appleTrackId);

// The source author and exact playlist are part of the evidence, not a flag
// attached to every recording in a featured artist's wider discography.
const html = author => `<script type="application/ld+json">${JSON.stringify({ '@type': 'MusicPlaylist', name: 'Big Beat Essentials', author: { name: author }, numTracks: playlist.tracks.length, track: playlist.tracks.map(track => ({ '@type': 'MusicRecording', name: track.title, url: track.recordingUrl, duration: track.durationIso })) })}</script>`;
assert.equal(parseEditorialPlaylist(html('Apple Music')).tracks.length, 49);
assert.throws(() => parseEditorialPlaylist(html('Community listener')), /Community playlists/);
assert.throws(() => parseEditorialPlaylist(html('Apple Music').replace('Big Beat Essentials', 'Electronic Mix')), /Big Beat Essentials/);
assert.throws(() => verifyRecordingIdentity(first, { ...playlist, author: 'Community listener' }, lookup));
assert.throws(() => verifyRecordingIdentity(first, { ...playlist, url: PLAYLIST_URL.replace('78e98b7f1ea842dc807bd646ab37083e', 'community') }, lookup));
assert.throws(() => verifyRecordingIdentity(first, { ...playlist, tracks: playlist.tracks.filter(track => track.id !== first.appleTrackId) }, lookup), /not in the editorial playlist/);
assert.throws(() => verifyRecordingIdentity(first, playlist, { ...lookup, trackId: 9999999999 }), /different Apple ID/);
assert.throws(() => verifyRecordingIdentity(first, playlist, { ...lookup, artistName: 'Different exact artist' }), /Artist identity mismatch/);
assert.throws(() => verifyRecordingIdentity(first, playlist, { ...lookup, trackName: `${lookup.trackName} (Radio Edit)` }), /Title\/version mismatch/);
assert.throws(() => verifyRecordingIdentity(first, playlist, { ...lookup, trackTimeMillis: lookup.trackTimeMillis + 15000 }), /Master duration/);
assert.throws(() => verifyRecordingIdentity(first, playlist, { ...lookup, previewUrl: 'https://unverified.fixture.test/recording.m4a' }));
assert.equal(appleRecordingId('https://music.apple.com/us/artist/artist-name/1635966361?i=1635966361'), '', 'An artist page is not a recording URL');

function changed(mutator) { const copy = structuredClone(selection); mutator(copy); return copy; }
assert.throws(() => verifyStoredSelection(changed(copy => { copy.tracks[0].editorialMembership.title += ' (Remix)'; })));
assert.throws(() => verifyStoredSelection(changed(copy => { copy.tracks[0].bpm = 109; })), /no BPM evidence/);
assert.throws(() => verifyStoredSelection(changed(copy => { copy.tracks[0].audioVerification.currentTimeAfter = copy.tracks[0].audioVerification.currentTimeBefore; })), /Actual playback must advance/);
assert.throws(() => verifyStoredSelection(changed(copy => { copy.tracks[0].audioVerification.mediaError = 3; })));
assert.throws(() => verifyStoredSelection(changed(copy => { copy.tracks[0].audioVerification.bytes = 0; copy.tracks[0].playable = true; })), 'A naked playable flag cannot replace decoded media evidence');
assert.throws(() => verifyStoredSelection(changed(copy => { copy.tracks[1] = structuredClone(copy.tracks[0]); })));

// Run the app's actual strict BPM predicate. A fallback range is not a measured
// BPM for this master, even though the recording has independent genre proof.
const app = await readFile(process.env.SONIC_EDITORIAL_APP_PATH || new URL('../app.js', import.meta.url), 'utf8');
function actualFunction(name) {
  const start = app.indexOf(`function ${name}(`);
  assert.ok(start >= 0);
  return app.slice(start, app.indexOf('\n}', start) + 2);
}
const context = vm.createContext({});
vm.runInContext(`${actualFunction('parseBpmRangeValue')}\n${actualFunction('trackMatchesBpmPreference')}`, context);
const ranges = ['60-90', '90-110', '110-124', '124-135', '135-145', '145-155', '155-175', '175+'];
for (const track of selection.tracks) {
  const runtime = { ...track, bpm: '110-130', bpmExact: undefined };
  assert.equal(context.trackMatchesBpmPreference(runtime, ''), true);
  for (const range of ranges) assert.equal(context.trackMatchesBpmPreference(runtime, range), false, `${track.song} has no measured BPM for ${range}`);
}
assert.equal(context.trackMatchesBpmPreference({ bpmExact: 125 }, '124-135'), true);
console.log('Big Beat editorial data passed: six exact recordings/artists, author/membership/version/master boundaries, captured native media evidence and 48 actual unknown-BPM rejections. No network requests.');
