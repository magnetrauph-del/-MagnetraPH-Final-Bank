// Public legal reader. No Auth initialization, content fetch, tracking or draft import.
// Language follows Preferences only. This reader never writes a language preference.
import { getAccountLanguage, syncAccountLanguage } from './account-preferences.js';
const $ = id => document.getElementById(id);
const LANGS = ['en', 'fil', 'tl'];
const FOCUS_IDS = ['backLink', 'lOther', 'lHelp'];
const bodies = [...document.querySelectorAll('[data-legal-language]')];
const available = LANGS.filter(value => bodies.some(node => node.dataset.legalLanguage === value));
function preference() {
  try { return syncAccountLanguage(localStorage.getItem('mgpref_lang')); }
  catch { return getAccountLanguage(); }
}
// Discard the previous uncommitted reader's per-entry language choice. Keep only
// scroll/focus restoration; it must never override the saved Account preference.
try {
  const state = history.state;
  if (state?.mgLegalView && Object.hasOwn(state.mgLegalView, 'lang')) {
    const { lang: unused, ...view } = state.mgLegalView;
    history.replaceState({ ...state, mgLegalView: view }, '', location.href);
  }
} catch { /* Reading still works without history-state access. */ }
const FALLBACK = {
  en: 'This document is currently available in English. The existing English text is shown until full translations are approved.',
  fil: 'Sinusunod ang Taglish sa Preferences. English muna ang ipinapakitang dokumento habang hindi pa aprubado ang buong salin.',
  tl: 'Sinusunod ang Tagalog sa Preferences. Nasa English muna ang dokumento habang hindi pa aprubado ang buong salin.',
};

// Preserve the verified previous-page behavior; never trust a return URL parameter.
const inApp = new Set(['/index.html', '/login.html', '/create.html', '/dashboard.html', '/account.html', '/banner.html', '/quote.html', '/followup.html', '/help.html', '/help-answer.html', '/privacy.html', '/terms.html']);
let previous = null;
try {
  const source = new URL(document.referrer);
  if (source.origin === location.origin && !source.username && !source.password && inApp.has(source.pathname) && source.href !== location.href) previous = source.href;
} catch { /* Direct visits use the same-origin Login fallback. */ }
$('backLink').href = previous || '/login.html';
$('backText').textContent = 'Back';
$('backLink').setAttribute('aria-label', 'Go back');
function render(preferred = preference()) {
  const lang = available.includes(preferred) ? preferred : available.includes('en') ? 'en' : available[0];
  document.documentElement.lang = lang;
  document.documentElement.dataset.preferredLanguage = preferred;
  const note = $('legalLanguageNote');
  const reviewNote = note.dataset['note' + preferred[0].toUpperCase() + preferred.slice(1)];
  note.textContent = reviewNote || FALLBACK[preferred] || FALLBACK.en;
  note.lang = preferred;
  note.hidden = !reviewNote && lang === preferred;
  for (const body of bodies) body.hidden = body.dataset.legalLanguage !== lang;
  for (const summary of document.querySelectorAll('[data-lang]')) summary.hidden = summary.dataset.lang !== lang;
  for (const node of document.querySelectorAll('[data-en][data-fil]')) node.textContent = node.getAttribute('data-' + (lang === 'en' ? 'en' : 'fil'));
  document.querySelectorAll('meta[name="theme-color"]').forEach(meta => meta.content = document.documentElement.dataset.theme === 'dark' ? '#09090B' : '#F7F7F8');
  document.documentElement.dataset.legalReady = 'true';
}
function saveView() {
  try {
    const state = history.state && typeof history.state === 'object' && !Array.isArray(history.state) ? history.state : {};
    const active = document.activeElement;
    const focus = FOCUS_IDS.includes(active?.id) ? active.id : null;
    history.replaceState({ ...state, mgLegalView: { path: location.pathname, y: Math.max(0, scrollY), focus } }, '', location.href);
  } catch { /* Document reading and Back still work when history state is unavailable. */ }
}
function restoreView() {
  const view = history.state?.mgLegalView;
  if (view?.path !== location.pathname || !Number.isFinite(view.y)) return;
  requestAnimationFrame(() => {
    if (FOCUS_IDS.includes(view.focus)) $(view.focus).focus({ preventScroll: true });
    scrollTo({ top: Math.max(0, view.y), behavior: 'instant' });
  });
}
$('backLink').addEventListener('click', event => {
  if (event.defaultPrevented || event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
  saveView();
  if (previous && history.length > 1) { event.preventDefault(); history.back(); }
});
window.addEventListener('storage', event => {
  if (event.key === 'mgpref_lang') render(syncAccountLanguage(event.newValue));
  if (event.key === 'mgpref_theme' && ['light','dark'].includes(event.newValue)) { document.documentElement.dataset.theme = event.newValue; render(); }
});
window.addEventListener('pagehide', saveView);
window.addEventListener('pageshow', () => { render(); restoreView(); });
render();
restoreView();
