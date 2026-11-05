// Auth profile metadata only. No storage, backend profile, token handling or custom photos.
import { auth } from './firebase-init.js';
import { updateProfile } from 'https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js';

export function validateDisplayName(raw) {
  if (typeof raw !== 'string') return { ok: false, code: 'profile.required' };
  if (/[\p{Cc}\p{Cf}]/u.test(raw)) return { ok: false, code: 'profile.characters' };
  const value = raw.normalize('NFC').trim().replace(/\s+/gu, ' ');
  if (!value) return { ok: false, code: 'profile.required' };
  if (Array.from(value).length > 60) return { ok: false, code: 'profile.length' };
  if (!/^[\p{L}\p{M}\p{N}\p{Pd} .'’,_·]+$/u.test(value)) return { ok: false, code: 'profile.characters' };
  return { ok: true, value };
}
export async function saveDisplayName(candidate, raw) {
  const result = validateDisplayName(raw);
  if (!result.ok) throw Object.assign(new Error('Invalid display name'), { code: result.code });
  await auth.authStateReady();
  if (!candidate?.uid || candidate.uid !== auth.currentUser?.uid || !auth.currentUser.emailVerified) {
    throw Object.assign(new Error('Account changed'), { code: 'profile.accountChanged' });
  }
  await updateProfile(candidate, { displayName: result.value });
  if (candidate.uid !== auth.currentUser?.uid || !auth.currentUser?.emailVerified) {
    throw Object.assign(new Error('Account changed'), { code: 'profile.accountChanged' });
  }
  return result.value;
}
