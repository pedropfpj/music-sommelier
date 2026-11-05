// Validates only the reviewed electronic selection; does not touch Rock or remote databases.
import { readFile, writeFile, mkdir } from 'node:fs/promises';
const root = new URL('../', import.meta.url);
const selection = JSON.parse(await readFile(new URL('data/electronic-editorial-selection-v24.json', root), 'utf8'));
const norm = value => String(value || '').normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase().replace(/[^a-z0-9]+/g, '');
const report = { checkedAt: new Date().toISOString(), passed: [], failed: [] };
const rows = [];
const keys = new Set();
for (const entry of selection.tracks) {
  try {
    if (entry.universe !== 'electronic') throw Error('Only electronic entries allowed');
    const url = new URL(entry.url);
    if (url.protocol !== 'https:' || url.hostname !== 'music.apple.com') throw Error('Unexpected provider');
    const response = await fetch(url, { signal: AbortSignal.timeout(20000) });
    if (!response.ok || new URL(response.url).hostname !== url.hostname) throw Error('Metadata HTTP ' + response.status);
    const html = await response.text();
    let recording;
    for (const match of html.matchAll(/<script\b([^>]*)>([\s\S]*?)<\/script>/g)) {
      if (!/type=["']application\/ld\+json["']/.test(match[1])) continue;
      const data = JSON.parse(match[2]);
      const item = data['@type'] === 'MusicRecording' ? data : data.audio;
      if (item?.['@type'] === 'MusicRecording' && norm(item.name) === norm(entry.song)) recording = item;
    }
    if (!recording) throw Error('Exact recording not found');
    const artists = recording.byArtist || [];
    if (!artists.some(a => norm(a.name) === norm(entry.artist)) && norm(artists.map(a => a.name).join(' & ')) !== norm(entry.artist)) throw Error('Artist mismatch: ' + artists.map(a => a.name).join(' & '));
    const preview = new URL(recording.audio?.contentUrl || '');
    if (preview.protocol !== 'https:' || !preview.hostname.endsWith('.itunes.apple.com') || !preview.pathname.includes('/AudioPreview')) throw Error('Unexpected audio route');
    const probe = await fetch(preview, {headers: {Range: 'bytes=0-1023'}, signal: AbortSignal.timeout(15000)});
    const type = probe.headers.get('content-type') || '';
    await probe.body?.cancel();
    if (!probe.ok || !/^(audio\/|video\/mp4|application\/octet-stream)/i.test(type)) throw Error('Audio HTTP ' + probe.status + ' ' + type);
    const key = norm(entry.artist) + '::' + norm(entry.song);
    if (keys.has(key)) throw Error('Duplicate recording');
    keys.add(key);
    const duration = String(recording.duration || '').match(/PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?/);
    rows.push({style: entry.style, artist: entry.artist, song: recording.name, label: entry.label, bpm: entry.bpm || '', preview_url: preview.href, release_date: recording.datePublished || '', duration_sec: duration ? Number(duration[1] || 0) * 3600 + Number(duration[2] || 0) * 60 + Number(duration[3] || 0) : '', artist_genre: entry.style.replaceAll('_', ' '), artist_profile_hint: entry.reason, source: 'electronic_editorial_v24_20261105', genre_evidence_url: entry.genreSource, source_url: recording.url, cover_art_url: recording.inAlbum?.image || recording.image || '', source_tags: 'electronic_editorial_v24;apple_identity_verified;audio_http_checked;editorial_subgenre', confidence: 'high', status: 'published', source_note: 'Editorial genre supported by the cited source; exact Apple recording and current audio response checked ' + report.checkedAt});
    report.passed.push({artist: entry.artist, song: recording.name, style: entry.style, sourceUrl: recording.url, genreEvidenceUrl: entry.genreSource, previewUrl: preview.href, audioHttpStatus: probe.status, mediaType: type, identityMatch: true});
    console.log('OK', entry.style, entry.artist, recording.name);
  } catch (error) {
    report.failed.push({...entry, error: error.message});
    console.log('FAIL', entry.artist, entry.song, error.message);
  }
}
await mkdir(new URL('reports/public-release-20261105/', root), {recursive: true});
await writeFile(new URL('reports/public-release-20261105/editorial-v24-validation.json', root), JSON.stringify(report, null, 2) + '\n');
if (report.failed.length) throw Error('Review failures before updating the catalog');
const quote = value => '"' + String(value ?? '').replaceAll('"', '""') + '"';
const columns = Object.keys(rows[0]);
await writeFile(new URL('data/electronic_editorial_v24_20261105.csv', root), [columns, ...rows.map(row => columns.map(key => row[key]))].map(row => row.map(quote).join(',')).join('\n') + '\n');
console.log(JSON.stringify({tracks: rows.length, artistCredits: new Set(rows.map(row => row.artist)).size, styles: new Set(rows.map(row => row.style)).size}));
