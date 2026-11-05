// Account/Help languages use the existing preference key. Legacy fil means Taglish.
// Login and legacy tools keep their existing English/Filipino dictionaries.
import { getLang as legacyGet, setLang as legacySet } from './login-i18n.js';
export const ACCOUNT_LANGS = Object.freeze(['en', 'fil', 'tl']);
let language = 'fil';
try { const saved = localStorage.getItem('mgpref_lang'); if (ACCOUNT_LANGS.includes(saved)) language = saved; }
catch { if (ACCOUNT_LANGS.includes(legacyGet())) language = legacyGet(); }
export function getAccountLanguage() { return language; }
export function setAccountLanguage(next) {
  if (!ACCOUNT_LANGS.includes(next)) return language;
  language = next;
  if (next !== 'tl') legacySet(next);
  else { try { localStorage.setItem('mgpref_lang', next); } catch {} }
  return language;
}
export function syncAccountLanguage(value) {
  language = ACCOUNT_LANGS.includes(value) ? value : 'fil';
  return language;
}
