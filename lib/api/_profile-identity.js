const { assessUserGeneratedText } = require('./_ugc-safety');

function publicName(value) {
  if (typeof value !== 'string') return '';
  const name = value.trim();
  if (!name || [...name].length > 80 || /[@\u0000-\u001f\u007f]/.test(name) || !assessUserGeneratedText(name).allowed) return '';
  return name === 'Sonic listener' ? '' : name;
}

function publicUsername(value) {
  const name = publicName(value);
  const handle = name.normalize('NFKD').replace(/[\u0300-\u036f]/g, '').toLowerCase()
    .replace(/[^a-z0-9_]/g, '_').replace(/_+/g, '_').replace(/^_+|_+$/g, '').slice(0, 28);
  return /^[a-z0-9][a-z0-9_]{2,29}$/.test(handle) && handle !== 'sonic_user' ? handle : '';
}

// Select public identity fields from the server-verified Auth user. Never fall
// back to email, identity-provider IDs, or arbitrary/private metadata fields.
function profileIdentityFromUser(user) {
  const metadata = user?.user_metadata || user?.raw_user_meta_data || {};
  const displayName = [metadata.display_name, metadata.full_name, metadata.name].map(publicName).find(Boolean) || '';
  const username = [metadata.username, metadata.preferred_username, displayName].map(publicUsername).find(Boolean) || '';
  let avatarUrl = '';
  for (const value of [metadata.avatar_url, metadata.picture]) {
    if (typeof value !== 'string' || value.length > 2048) continue;
    try {
      const url = new URL(value);
      if (url.protocol === 'https:' && !url.username && !url.password && url.hostname.includes('.') &&
        !/^(?:localhost|127\.|0\.|169\.254\.|10\.|192\.168\.|172\.(?:1[6-9]|2\d|3[01])\.)/.test(url.hostname) &&
        !/\.(?:local|localhost|internal)$/.test(url.hostname)) {
        avatarUrl = url.href;
        break;
      }
    } catch (_) {}
  }
  return { displayName, username, avatarUrl };
}

function defaultIdentityPatch(row, identity = {}) {
  // Publishing an app profile is an explicit identity choice. Background
  // hydration never changes that identity or any visibility preference.
  if (!row || row.profile_public === true) return {};
  const patch = {};
  if ((!row.display_name || row.display_name === 'Sonic listener') && identity.displayName) patch.display_name = identity.displayName;
  if ((!row.username || row.username === 'sonic_user') && identity.username) patch.username = identity.username;
  return patch;
}

module.exports = { profileIdentityFromUser, defaultIdentityPatch, publicName };
