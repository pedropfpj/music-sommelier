// Read-only readiness check. Never reads profile rows, writes data or applies SQL.
import fs from 'node:fs/promises';
for (const file of ['.env.local', '.env']) { try { process.loadEnvFile(file); } catch {} }
const url = (process.env.SUPABASE_URL || '').replace(/\/+$/, '');
const key = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SERVICE_KEY;
const result = { checkedAt: new Date().toISOString(), readOnly: true, configured: Boolean(url && key), checks: {} };
if (url && key) {
  const checks = {
    profilePrivacy: '/rest/v1/profiles?select=profile_public,show_avatar,avatar_path&limit=0',
    publicLinks: '/rest/v1/profiles?select=profile_link_public&limit=0',
    explicitPreferences: '/rest/v1/profiles?select=musical_preferences&limit=0',
    commentsV2: '/rest/v1/comments?select=status,metadata&limit=0',
    commentRetries: '/rest/v1/comments?select=client_request_id&limit=0',
    targetLikes: '/rest/v1/social_target_likes?select=target_key&limit=0',
    profileBudget: '/rest/v1/profile_edit_usage?select=edit_count&limit=0',
    avatarBucket: '/storage/v1/bucket/sonic-profile-avatars',
    authSettings: '/auth/v1/settings'
  };
  for (const [name, path] of Object.entries(checks)) {
    try {
      const response = await fetch(url + path, { headers: { apikey: key, Authorization: `Bearer ${key}` }, signal: AbortSignal.timeout(12000) });
      const data = await response.json().catch(() => ({}));
      result.checks[name] = { ok: response.ok, status: response.status };
      if (!response.ok) result.checks[name].code = data?.code || data?.error_code || 'unavailable';
      if (name === 'avatarBucket' && response.ok) result.checks[name].private = data.public === false;
      if (name === 'authSettings' && response.ok) result.checks[name].providers = ['google','apple'].filter(p => data.external?.[p] === true);
    } catch { result.checks[name] = { ok: false, status: 'network_unavailable' }; }
  }
}
await fs.mkdir('reports/social-profiles-20261105', { recursive: true });
await fs.writeFile('reports/social-profiles-20261105/environment-readiness.json', JSON.stringify(result, null, 2) + '\n');
console.log(JSON.stringify(result, null, 2));
