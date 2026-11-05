// Authenticated Account presentation; existing Auth Core owns auth and security operations.
import { auth } from './firebase-init.js';
import { guardDashboard, logout } from './auth-core-shared.js';
import { onAuthStateChanged } from 'https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js';
import { t, getLang, setLang } from './dashboard-i18n.js?v=13';
import { syncAccountLanguage } from './account-preferences.js';
import { mountSettings } from './dashboard-settings.js?v=6';
import { initAccountNavigation, safeAccountReferrer } from './account-navigation.js';

const $ = id => document.getElementById(id);
const sections = { profile: ['account', 'myProfile'], security: ['security', 'account.securityTitle'], preferences: ['preferences', 'account.preferences'] };
const requested = new URLSearchParams(location.search).get('section');
const section = Object.hasOwn(sections, requested) ? requested : 'profile';
const previous = safeAccountReferrer(document.referrer, location.origin, location.href);
let user = null, controller = null, navigation = null, started = false, loggingOut = false;
let resolveLeave = null, statusKey = '', statusKind = 'info';
const current = candidate => !!candidate?.uid && candidate.uid === user?.uid && candidate.uid === auth.currentUser?.uid && auth.currentUser?.emailVerified === true;
const readTheme = () => { try { return localStorage.getItem('mgpref_theme') === 'dark' ? 'dark' : 'light'; } catch { return 'light'; } };
let theme = document.documentElement.dataset.theme || readTheme();
function setTheme(value) {
  if (!['light', 'dark'].includes(value)) return theme;
  theme = value;
  document.documentElement.dataset.theme = value;
  document.querySelectorAll('meta[name="theme-color"]').forEach(meta => meta.content = value === 'dark' ? '#09090B' : '#F7F7F8');
  try { localStorage.setItem('mgpref_theme', value); } catch {}
  return value;
}
function status(key, kind = 'info') {
  statusKey = key; statusKind = kind;
  const node = $('accountPageStatus');
  node.hidden = !key; node.textContent = key ? t(key) : ''; node.dataset.kind = kind;
  node.setAttribute('role', kind === 'error' ? 'alert' : 'status');
}
function updateDirty() {
  const dirty = !!controller?.isDirty?.();
  $('accountDirty').hidden = !dirty;
  $('accountDirty').textContent = t('account.unsaved');
  if (dirty) navigation?.arm();
}
function refresh() {
  document.documentElement.lang = getLang();
  document.querySelectorAll('[data-account-text]').forEach(node => { node.textContent = t(node.dataset.accountText); });
  $('accountPageTitle').textContent = t(sections[section][1]);
  document.title = 'MagnetraPH — ' + t(sections[section][1]);
  controller?.refresh?.();
  status(statusKey, statusKind);
  updateDirty();
}
function closeConfirmation(allowed = false) {
  if (!$('accountLeave').open) return false;
  $('accountLeave').close();
  const resolve = resolveLeave; resolveLeave = null;
  resolve?.(allowed);
  return true;
}
function confirmLeave() {
  return new Promise(resolve => {
    resolveLeave = resolve;
    $('accountLeave').showModal();
    $('accountKeep').focus();
  });
}
function makeNavigation() {
  return initAccountNavigation({
    isDirty: () => !!controller?.isDirty?.(),
    isBusy: () => loggingOut || !!controller?.isBusy?.(),
    discard: () => { controller?.discardChanges?.(); updateDirty(); },
    confirmLeave, closeConfirm: () => closeConfirmation(false),
    closeOverlay: () => !!controller?.closeTop?.(),
    announceBusy: () => status('account.busy'), previous,
  });
}
function scrub() {
  $('app').hidden = true;
  closeConfirmation(false);
  navigation?.destroy();
  controller?.destroy?.(); controller = null;
  $('accountContent').replaceChildren();
  $('accountPageStatus').textContent = ''; $('accountDirty').textContent = '';
  user = null;
}
async function signOut() {
  if (loggingOut || !current(user)) return false;
  const originalUID = user.uid;
  loggingOut = true;
  try {
    await navigation.release();
    await logout();
    if (auth.currentUser) throw Error('sign-out-not-confirmed');
    return true;
  } catch {
    loggingOut = false;
    const now = auth.currentUser;
    if (!now?.emailVerified || now.uid !== originalUID) {
      scrub(); location.replace('/dashboard.html'); return false;
    }
    if (!controller) mount(now);
    navigation?.destroy(); navigation = makeNavigation();
    $('app').hidden = false;
    status('account.logoutFailed', 'error');
    return false;
  }
}
function mount(firebaseUser) {
  user = firebaseUser;
  controller = mountSettings({ body: $('accountContent'), user, target: sections[section][0], ctx: {
    t, getLang, isAccountCurrent: current,
    profileUpdated: candidate => { if (current(candidate)) user = candidate; },
    setLanguage: language => { setLang(language); refresh(); return getLang(); },
    getTheme: () => theme, setTheme,
    announce: message => {
      // Existing password/deletion controllers pass already-localized safe text.
      statusKey = '';
      const node = $('accountPageStatus'); node.hidden = !message; node.textContent = String(message || '');
      node.dataset.kind = 'info'; node.setAttribute('role', 'status');
    },
    isOffline: () => navigator.onLine === false,
    leave: async () => { await navigation?.release(); },
    signOut, closeSettings: () => {}, stateChanged: updateDirty,
  } });
  $('loader').hidden = true; $('app').hidden = false;
  refresh();
}
function start(firebaseUser) {
  if (started) return;
  started = true;
  mount(firebaseUser);
  navigation = makeNavigation();
  $('accountBack').href = previous || '/dashboard.html';
  $('accountPageTitle').focus({ preventScroll: true });
}
$('accountBack').addEventListener('click', event => {
  if (event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey || event.defaultPrevented) return;
  event.preventDefault(); void navigation?.request('back');
});
$('accountKeep').addEventListener('click', () => closeConfirmation(false));
$('accountDiscard').addEventListener('click', () => closeConfirmation(true));
$('accountLeave').addEventListener('cancel', event => { event.preventDefault(); closeConfirmation(false); });
document.addEventListener('keydown', event => {
  const dialog = event.target.closest?.('dialog[open]');
  if (!dialog || event.key !== 'Tab') return;
  const nodes = [...dialog.querySelectorAll('button,input,textarea,a[href],[tabindex]')].filter(node => !node.disabled && node.tabIndex >= 0 && node.getClientRects().length);
  const first = nodes[0], last = nodes.at(-1);
  if (first && event.shiftKey && (document.activeElement === first || !nodes.includes(document.activeElement))) { event.preventDefault(); last.focus(); }
  else if (last && !event.shiftKey && document.activeElement === last) { event.preventDefault(); first.focus(); }
});
window.addEventListener('storage', event => {
  if (event.key === 'mgpref_lang') { syncAccountLanguage(event.newValue); setLang(['en', 'tl'].includes(event.newValue) ? event.newValue : 'fil'); refresh(); }
  if (event.key === 'mgpref_theme' && ['light', 'dark'].includes(event.newValue)) { setTheme(event.newValue); controller?.refresh?.(); }
});
window.addEventListener('pagehide', scrub);
window.addEventListener('pageshow', event => { if (event.persisted) { scrub(); location.reload(); } });
// This observer only clears presentation. Existing Auth Core owns session invalidation/redirects.
onAuthStateChanged(auth, next => {
  if (!started) return;
  if (!next?.emailVerified) { scrub(); return; }
  if (next.uid !== user?.uid) { scrub(); if (!loggingOut) location.replace('/dashboard.html'); }
});
try { setTheme(theme); guardDashboard(start); }
catch { scrub(); document.documentElement.style.visibility = ''; $('loader').hidden = true; $('appError').textContent = t('account.loadError'); $('appError').hidden = false; }
