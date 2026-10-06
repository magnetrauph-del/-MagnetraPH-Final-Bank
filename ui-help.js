// ui-help.js - v1 (P1) - controller ng Help Center (help.html). Walang emoji.
// - Public na page: walang Firebase, walang login check, walang network call, walang tracking.
// - Wika: ang piniling wika ng app (mgpref_lang sa pamamagitan ng frozen login-i18n.js; Taglish kapag wala pa).
//   Ang "English / Taglish" na pindutan ay nagse-save ng pinili, tulad ng Settings.
// - Paghahanap: lokal lang (help-content.js). Hindi AI.
// - Direktang link sa paksa: help.html#banner (galing sa "?" ng tools) ay bubuksan ang paksang iyon.
// - "Mag-report ng problema": report.js (bubuksan ang email app ng user; ang user ang magse-send).
// - textContent at createElement lang (walang innerHTML).
import { getLang as prefGetLang, setLang as prefSetLang } from "./login-i18n.js";
import { appLang } from "./local-state.js?v=2";
import { TOPICS, ui, topicText, searchTopics, getTopic } from "./help-content.js?v=1";
import { renderBlock } from "./help-sheet.js?v=1";
import { createReport } from "./report.js?v=1";

const $ = (id) => document.getElementById(id);
const el = {
  back: $("backLink"), backText: $("backText"), langBtn: $("langBtn"), eyebrow: $("hEyebrow"), title: $("hTitle"), tagline: $("hTagline"),
  search: $("hSearch"), label: $("hLabel"), input: $("hInput"), count: $("hCount"), topics: $("hTopics"), none: $("hNone"), noneText: $("hNoneText"),
  stuck: $("hStuckTitle"), report: $("hReport"), contact: $("hContact"), privacy: $("fPrivacy"), terms: $("fTerms"),
};
const NS = "http://www.w3.org/2000/svg";
const BACK = { en: "Back", fil: "Bumalik" };
const BACK_ARIA = { en: "Go back", fil: "Bumalik" };

let lang = appLang(prefGetLang()) === "en" ? "en" : "fil";
let report = null;
const openIds = new Set();
const reportButtons = [];

function h(tag, attrs = {}, ...kids) {
  const n = document.createElement(tag);
  for (const [k, v] of Object.entries(attrs)) if (v !== false && v != null) n.setAttribute(k, v === true ? "" : String(v));
  n.append(...kids.filter((k) => k != null && k !== false));
  return n;
}
function icon(name, cls) {
  const s = document.createElementNS(NS, "svg");
  for (const [k, v] of [["width", "24"], ["height", "24"], ["aria-hidden", "true"], ["focusable", "false"]]) s.setAttribute(k, v);
  if (cls) s.setAttribute("class", cls);
  const u = document.createElementNS(NS, "use");
  u.setAttribute("href", "#" + name);
  s.append(u);
  return s;
}

/* ---------- Mga paksa ---------- */
function topicNode(tp) {
  const x = topicText(tp, lang);
  const body = h("div", { class: "hBody" }, ...x.body.map((b) => {
    if (b && b.report) {
      if (!report) return null;
      const btn = h("button", { type: "button", class: "btn", "aria-haspopup": "dialog", "aria-expanded": "false" }, ui(lang, "reportOpen"));
      btn.addEventListener("click", () => report.open(btn));
      reportButtons.push(btn);
      return btn;
    }
    return renderBlock(b, lang);
  }).filter(Boolean));
  const d = h("details", { class: "hTopic", id: tp.id },
    h("summary", {}, h("span", { class: "hSumText" }, h("span", { class: "hTitle" }, x.title), h("span", { class: "hSub" }, x.summary)), icon("i-chev", "hChev")),
    body);
  if (openIds.has(tp.id)) d.open = true;
  d.addEventListener("toggle", () => { if (d.open) openIds.add(tp.id); else openIds.delete(tp.id); });
  return d;
}
function renderTopics() {
  reportButtons.length = 0;
  el.topics.replaceChildren(...TOPICS.map(topicNode));
  applyFilter();
}
function applyFilter() {
  const q = el.input.value;
  const hits = new Set(searchTopics(q, lang).map((x) => x.id));
  let n = 0;
  for (const d of el.topics.children) {
    const show = hits.has(d.id);
    d.hidden = !show;
    if (show) n += 1;
  }
  const searching = !!q.trim();
  if (searching && n === 1) { const only = [...el.topics.children].find((d) => !d.hidden); if (only && !only.open) only.open = true; }
  el.none.hidden = n > 0;
  el.noneText.textContent = ui(lang, "none");
  el.count.textContent = searching ? (n ? ui(lang, "count", n) : "") : "";
}

/* ---------- Wika ---------- */
function renderText() {
  document.documentElement.lang = lang;
  document.title = ui(lang, "pageTitle");
  el.backText.textContent = BACK[lang];
  el.back.setAttribute("aria-label", BACK_ARIA[lang]);
  el.langBtn.textContent = ui(lang, "langSwitch");
  el.langBtn.setAttribute("aria-label", ui(lang, "langSwitchAria"));
  el.langBtn.setAttribute("lang", lang === "en" ? "fil" : "en");
  el.eyebrow.textContent = ui(lang, "eyebrow");
  el.title.textContent = ui(lang, "title");
  el.tagline.textContent = ui(lang, "tagline");
  el.label.textContent = ui(lang, "searchLabel");
  el.input.setAttribute("placeholder", ui(lang, "searchPh"));
  el.stuck.textContent = ui(lang, "stillStuck");
  el.report.textContent = ui(lang, "reportOpen");
  el.contact.textContent = ui(lang, "contact");
  el.privacy.textContent = ui(lang, "privacy");
  el.terms.textContent = ui(lang, "terms");
}
function switchLang() {
  lang = lang === "en" ? "fil" : "en";
  prefSetLang(lang); // iisang preference ng buong app (frozen login-i18n.js ang nagsi-save)
  renderText();
  renderTopics();
  if (report) report.refresh();
  el.langBtn.focus();
}

/* ---------- Direktang link (#paksa) ---------- */
function openFromHash() {
  const id = decodeURIComponent((location.hash || "").slice(1));
  if (!id || !getTopic(id)) return;
  if (el.input.value) { el.input.value = ""; applyFilter(); }
  const d = $(id);
  if (!d) return;
  d.hidden = false;
  d.open = true;
  const reduced = typeof matchMedia === "function" && matchMedia("(prefers-reduced-motion: reduce)").matches;
  d.scrollIntoView({ behavior: reduced ? "auto" : "smooth", block: "start" });
  const sum = d.querySelector("summary");
  if (sum) sum.focus({ preventScroll: true });
}

/* ---------- Bumalik: sa pinanggalingang page ng MagnetraPH, o sa Dashboard ---------- */
function onBack(e) {
  if (e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
  let same = false;
  try { same = new URL(document.referrer).origin === location.origin; } catch { same = false; }
  if (same && history.length > 1) { e.preventDefault(); history.back(); }
}

function start() {
  try { report = createReport({ getLang: () => lang }); } catch { report = null; }
  renderText();
  renderTopics();
  el.search.hidden = false;
  el.langBtn.hidden = false;
  el.report.hidden = !report;
  el.search.addEventListener("submit", (e) => { e.preventDefault(); applyFilter(); });
  el.input.addEventListener("input", () => applyFilter());
  el.langBtn.addEventListener("click", switchLang);
  el.report.addEventListener("click", () => { if (report) report.open(el.report); });
  el.back.addEventListener("click", onBack);
  window.addEventListener("hashchange", openFromHash);
  openFromHash();
}
start();
