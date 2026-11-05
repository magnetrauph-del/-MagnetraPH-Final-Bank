// Help Center list and separate article documents. No Auth or remote data access.
import { getAccountLanguage, setAccountLanguage, syncAccountLanguage } from './account-preferences.js';
import { HELP_TOPICS, HELP_LANGUAGES, HELP_ARTICLES, getHelpArticle, articleText, topicTitle, searchHelpArticles } from './help-articles.js?v=2';
import { createReport, SUPPORT_EMAIL } from './report.js?v=2';

const $ = id => document.getElementById(id);
const answerPage = document.body.dataset.helpPage === 'answer';
const params = new URLSearchParams(location.search);
const article = getHelpArticle(params.get('question'));
const COPY = {
  en: {
    title: 'Help Center', back: 'Back', dashboardBack: 'Back to Dashboard', questionsBack: 'Back to questions',
    search: 'Search help', clear: 'Clear search', none: 'No matching questions. Try another word.',
    language: 'Language', feedback: 'Help & Feedback', needHelp: 'Need help?',
    support: 'Share a question or suggestion.',
    privacy: 'Privacy Policy', terms: 'Terms of Service', legal: 'Legal information', skip: 'Skip to content',
    missing: 'This answer isn’t available.', missingBody: 'Return to the questions to find another answer.',
    results: n => `${n} ${n === 1 ? 'question' : 'questions'}`,
  },
  fil: {
    title: 'Help Center', back: 'Bumalik', dashboardBack: 'Bumalik sa Dashboard', questionsBack: 'Bumalik sa mga tanong',
    search: 'Maghanap ng tulong', clear: 'I-clear ang search', none: 'Walang nahanap na tanong. Subukan ang ibang salita.',
    language: 'Wika', feedback: 'Help & Feedback', needHelp: 'Kailangan ng tulong?',
    support: 'Ibahagi ang tanong o suggestion mo.',
    privacy: 'Privacy Policy', terms: 'Terms of Service', legal: 'Legal na impormasyon', skip: 'Pumunta sa content',
    missing: 'Hindi available ang sagot na ito.', missingBody: 'Bumalik sa mga tanong para makahanap ng ibang sagot.',
    results: n => `${n} tanong`,
  },
  tl: {
    title: 'Help Center', back: 'Bumalik', dashboardBack: 'Bumalik sa Dashboard', questionsBack: 'Bumalik sa mga tanong',
    search: 'Maghanap ng tulong', clear: 'Alisin ang hinanap', none: 'Walang katugmang tanong. Subukan ang ibang salita.',
    language: 'Wika', feedback: 'Help & Feedback', needHelp: 'Kailangan ng tulong?',
    support: 'Ibahagi ang tanong o mungkahi mo.',
    privacy: 'Privacy Policy', terms: 'Terms of Service', legal: 'Legal na impormasyon', skip: 'Pumunta sa nilalaman',
    missing: 'Hindi magagamit ang sagot na ito.', missingBody: 'Bumalik sa mga tanong upang makahanap ng ibang sagot.',
    results: n => `${n} tanong`,
  },
};
// URL language is a fallback for navigation when browser preference storage is unavailable.
let lang = getAccountLanguage();
try {
  if (!HELP_LANGUAGES.includes(localStorage.getItem('mgpref_lang')) && HELP_LANGUAGES.includes(params.get('lang'))) lang = params.get('lang');
} catch { if (HELP_LANGUAGES.includes(params.get('lang'))) lang = params.get('lang'); }
let report = null, feedbackEntry = false, closingFeedback = false;
let lastQuestion = '';

function h(tag, attrs = {}, ...children) {
  const node = document.createElement(tag);
  for (const [name, value] of Object.entries(attrs)) node.setAttribute(name, value);
  node.append(...children);
  return node;
}
function plainClick(event) {
  return event.button === 0 && !event.metaKey && !event.ctrlKey && !event.shiftKey && !event.altKey && !event.defaultPrevented;
}
function state() {
  return history.state && typeof history.state === 'object' && !Array.isArray(history.state) ? history.state : {};
}
function replaceState(next) { try { history.replaceState(next, '', location.href); } catch { /* navigation still works without restoration */ } }
function listState() {
  const saved = state().mgHelpList;
  if (!saved || saved.version !== 1) return null;
  return {
    query: typeof saved.query === 'string' ? saved.query.slice(0, 80) : '',
    scrollY: Number.isFinite(saved.scrollY) ? Math.max(0, Math.min(saved.scrollY, 10000000)) : 0,
    focus: saved.focus === 'hInput' || HELP_ARTICLES.some(item => 'q-' + item.id === saved.focus) ? saved.focus : '',
  };
}
function saveList() {
  if (answerPage) return;
  const focused = document.activeElement?.id;
  const focus = focused === 'hInput' || focused?.startsWith('q-') ? focused : lastQuestion;
  replaceState({ ...state(), mgHelpList: { version: 1, query: $('hInput').value, scrollY, focus } });
}
function answerURL(item) {
  const query = new URLSearchParams({ question: item.id, lang });
  return '/help-answer.html?' + query;
}
function listURL() {
  return '/help.html?lang=' + lang + (article ? '#' + article.topic : '');
}
function renderList() {
  const matches = searchHelpArticles($('hInput').value, lang);
  $('hTopics').replaceChildren(...HELP_TOPICS.flatMap(topic => {
    const items = matches.filter(item => item.topic === topic.id);
    if (!items.length) return [];
    const links = items.map(item => {
      const link = h('a', { class: 'help-question', id: 'q-' + item.id, href: answerURL(item) }, articleText(item, lang).question);
      link.addEventListener('click', event => {
        if (!plainClick(event)) return;
        lastQuestion = link.id;
        saveList(); // Leave the native link intact, including new-tab and browser history behavior.
      });
      return h('li', {}, link);
    });
    return [h('section', { class: 'help-topic', id: topic.id, 'aria-labelledby': topic.id + '-heading' },
      h('h2', { class: 'help-topic-title', id: topic.id + '-heading', tabindex: '-1' }, topicTitle(topic, lang)),
      h('ul', { class: 'help-question-list' }, ...links))];
  }));
  $('hNone').hidden = matches.length !== 0;
  $('hNoneText').textContent = COPY[lang].none;
  $('hNoneClear').textContent = COPY[lang].clear;
  $('hCount').textContent = COPY[lang].results(matches.length);
  $('hClear').hidden = !$('hInput').value;
}
function renderAnswer() {
  const copy = COPY[lang];
  const text = articleText(article, lang);
  const topic = article && HELP_TOPICS.find(topic => topic.id === article.topic);
  $('hAnswerTopic').textContent = topic ? topicTitle(topic, lang) : copy.title;
  $('hAnswerTitle').textContent = text?.question || copy.missing;
  $('hAnswerBody').replaceChildren(...(text?.body || [copy.missingBody]).map(block => {
    if (typeof block === 'string') return h('p', {}, block);
    const tag = Object.hasOwn(block, 'ol') ? 'ol' : 'ul';
    return h(tag, {}, ...block[tag].map(line => h('li', {}, line)));
  }));
  // The address is configured, not evidence that delivery or a monitored mailbox works.
  if (article?.id === 'contact-support') $('hAnswerBody').append(h('p', {}, h('a', { id: 'hSupportAddress', href: 'mailto:' + SUPPORT_EMAIL }, SUPPORT_EMAIL)));
  $('answerBack').href = listURL();
  $('answerBack').textContent = copy.questionsBack;
  $('backLink').href = listURL();
  document.title = 'MagnetraPH — ' + (text?.question || copy.missing);
}
function render() {
  const copy = COPY[lang];
  document.documentElement.lang = lang;
  document.title = 'MagnetraPH — ' + copy.title;
  $('hTitle').textContent = copy.title;
  $('backText').textContent = copy.back;
  $('backLink').setAttribute('aria-label', answerPage ? copy.questionsBack : copy.dashboardBack);
  $('helpLanguage').value = lang;
  $('hLanguageLabel').textContent = copy.language;
  $('helpSkip').textContent = copy.skip;
  $('hStuckTitle').textContent = copy.needHelp;
  $('hReport').textContent = copy.feedback;
  $('hSupportNote').textContent = copy.support;
  $('fPrivacy').textContent = copy.privacy;
  $('fTerms').textContent = copy.terms;
  $('hLegalNav').setAttribute('aria-label', copy.legal);
  if (answerPage) renderAnswer();
  else {
    $('hSearch').hidden = false;
    $('hLabel').textContent = copy.search;
    $('hInput').placeholder = copy.search;
    $('hClear').setAttribute('aria-label', copy.clear);
    renderList();
  }
  report?.refresh();
}
function fromHash() {
  if (answerPage) return;
  let id = location.hash.slice(1);
  const oldFAQ = ['what-can-i-create', 'login-error', 'password', 'login-error', 'verification-email', 'sign-out', 'google-sign-in', 'phone-and-computer', 'privacy-and-terms', 'contact-support'];
  const old = /^faq-(\d+)$/.exec(id);
  if (old) id = 'q-' + (oldFAQ[Number(old[1])] || '');
  if (!HELP_TOPICS.some(topic => topic.id === id) && !HELP_ARTICLES.some(item => 'q-' + item.id === id)) return;
  if (!$(id)) { $('hInput').value = ''; renderList(); }
  const target = $(id)?.querySelector('h2') || $(id);
  if (target) { target.focus({ preventScroll: true }); target.scrollIntoView({ block: 'start' }); }
}
function restoreList() {
  if (answerPage) return;
  const saved = listState();
  if (!saved) { fromHash(); return; }
  $('hInput').value = saved.query;
  renderList();
  requestAnimationFrame(() => {
    const target = $(saved.focus);
    if (target && target.getClientRects().length) target.focus({ preventScroll: true });
    scrollTo({ top: saved.scrollY, behavior: 'instant' });
  });
}
function back(event) {
  if (!plainClick(event)) return;
  try {
    const referrer = new URL(document.referrer);
    if (referrer.origin !== location.origin || history.length <= 1) return;
    const fromList = referrer.pathname === '/help.html';
    const outsideHelp = !['/help.html', '/help-answer.html'].includes(referrer.pathname);
    if ((answerPage && fromList) || (!answerPage && outsideHelp)) { event.preventDefault(); history.back(); }
  } catch { /* Direct visits use the explicit same-origin fallback href. */ }
}
function syncTheme() {
  const dark = document.documentElement.dataset.theme === 'dark';
  document.querySelectorAll('meta[name="theme-color"]').forEach(meta => meta.content = dark ? '#09090B' : '#F8F8FA');
}

try { report = createReport({ getLang: () => lang }); } catch { /* No success is claimed if the existing feedback dialog is unavailable. */ }
$('hReport').hidden = !report;
$('hReport').addEventListener('click', () => {
  if (!report || report.isOpen()) return;
  saveList();
  try { history.pushState({ ...state(), mgHelpFeedback: true }, '', location.href); feedbackEntry = true; } catch { feedbackEntry = false; }
  report.open($('hReport'));
});
report?.element.addEventListener('close', () => {
  if (feedbackEntry && state().mgHelpFeedback) {
    feedbackEntry = false; closingFeedback = true;
    history.back();
  }
});
// Keep keyboard traversal within this Help-owned modal, including the end of a Tab cycle.
report?.element.addEventListener('keydown', event => {
  if (event.key !== 'Tab' || !report.isOpen()) return;
  const nodes = [...report.element.querySelectorAll('button, a[href], input, textarea, select, [tabindex]')]
    .filter(node => !node.disabled && node.tabIndex >= 0 && node.getClientRects().length);
  const first = nodes[0], last = nodes.at(-1);
  if (!first) { event.preventDefault(); report.element.focus(); return; }
  if (event.shiftKey && (document.activeElement === first || !nodes.includes(document.activeElement))) {
    event.preventDefault(); last.focus();
  } else if (!event.shiftKey && document.activeElement === last) {
    event.preventDefault(); first.focus();
  }
});
window.addEventListener('popstate', () => {
  if (closingFeedback) { closingFeedback = false; return; }
  if (report?.isOpen()) { feedbackEntry = false; report.close(); return; }
  // Forward/reload must not reopen a discarded feedback form.
  if (state().mgHelpFeedback) { const next = { ...state() }; delete next.mgHelpFeedback; replaceState(next); return; }
  restoreList();
});
if (state().mgHelpFeedback) { const next = { ...state() }; delete next.mgHelpFeedback; replaceState(next); }
$('backLink').addEventListener('click', back);
$('answerBack')?.addEventListener('click', back);
if (!answerPage) {
  const clear = () => { $('hInput').value = ''; renderList(); $('hInput').focus(); saveList(); };
  $('hSearch').addEventListener('submit', event => { event.preventDefault(); renderList(); saveList(); });
  $('hInput').addEventListener('input', () => { renderList(); saveList(); });
  $('hClear').addEventListener('click', clear);
  $('hNoneClear').addEventListener('click', clear);
}
$('helpLanguage').addEventListener('change', event => {
  lang = setAccountLanguage(event.target.value);
  // Keep language working between public Help documents if preference storage is blocked.
  const url = new URL(location.href); url.searchParams.set('lang', lang);
  try { history.replaceState(state(), '', url); } catch {}
  render();
  saveList();
});
window.addEventListener('storage', event => {
  if (event.key === 'mgpref_lang') { lang = syncAccountLanguage(event.newValue); render(); }
  if (event.key === 'mgpref_theme' && ['light', 'dark'].includes(event.newValue)) { document.documentElement.dataset.theme = event.newValue; syncTheme(); }
});
window.addEventListener('hashchange', fromHash);
window.addEventListener('pagehide', saveList);
window.addEventListener('pageshow', event => {
  if (event.persisted) { lang = getAccountLanguage(); try { lang = syncAccountLanguage(localStorage.getItem('mgpref_lang')); } catch {} render(); }
  restoreList();
});
const saved = listState();
if (!answerPage && saved) $('hInput').value = saved.query;
render();
syncTheme();
restoreList();
