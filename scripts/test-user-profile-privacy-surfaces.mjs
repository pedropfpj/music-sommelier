import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import vm from 'node:vm';
const trimText = (value, max) => String(value || '').trim().slice(0, max);
function extract(source, name) {
  const start = source.indexOf(`function ${name}(`);
  const next = source.indexOf('\n}\n', start);
  assert.ok(start >= 0 && next > start);
  return source.slice(start, next + 2);
}
const comments = await fs.readFile(new URL('../lib/api/_comments.js', import.meta.url), 'utf8');
const community = await fs.readFile(new URL('../lib/api/_community.js', import.meta.url), 'utf8');
const commentContext = vm.createContext({ trimText });
vm.runInContext(`${extract(comments, 'publicProfile')}\n${extract(comments, 'storageAuthorFromMetadata')}`, commentContext);
const raw = { id: 'test-author', username: 'sonic_person', display_name: 'Sonic Person', avatar_url: 'https://private.test/old-photo', metadata: { avatarUrl: 'https://private.test/client-photo' } };
assert.equal(commentContext.publicProfile(raw).avatarUrl, '');
assert.equal(commentContext.storageAuthorFromMetadata({}, raw.metadata).avatarUrl, '');
const postContext = vm.createContext({ trimText, normalizeTopic: x => x, MAX_TITLE_LENGTH: 120, MAX_BODY_LENGTH: 1000, MAX_META_LENGTH: 160 });
vm.runInContext(`${extract(community, 'authorFromMetadata')}\n${extract(community, 'serializePost')}`, postContext);
assert.equal(postContext.authorFromMetadata({ userId: raw.id }, raw.metadata).avatarUrl, '');
const post = postContext.serializePost({ id: 'post-id', userId: raw.id, author: { ...raw, displayName: raw.display_name, avatarUrl: raw.avatar_url } });
assert.equal(post.author.avatarUrl, '');
assert.equal(post.author.displayName, 'Sonic Person', 'Explicit post identity stays readable, without publishing old portraits');
console.log('Profile privacy surfaces passed: comments, fallback storage, post creation and legacy feed snapshots never replay client-provided or OAuth photo URLs.');
