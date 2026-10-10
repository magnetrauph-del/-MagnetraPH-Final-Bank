// ui-help.js - v2 - controller ng Help Center (help.html). Walang emoji.
// - Public na page: walang Firebase, walang login check, walang network call, walang tracking.
// - Wika: ang piniling wika ng app (mgpref_lang sa pamamagitan ng frozen login-i18n.js; Taglish kapag wala pa).
//   Ang "English / Taglish" na pindutan ay nagse-save ng pinili, tulad ng Settings.
// - v2: kasama na ang 10 aprubadong tanong ng Login FAQ (kinukuha mismo sa login-i18n.js, hindi kinokopya),
//   nakaayos ayon sa kategorya kasama ang mga paksa ng help-content.js; "Mga karaniwang tanong"; malinaw na
//   pang-clear ng search; hiwalay na Terms of Service at Privacy Policy.
// - Paghahanap: lokal lang (help-content.js + login-i18n.js). Hindi AI.
// - Direktang link: help.html#banner (galing sa "?" ng tools) o help.html#faq-2 ay bubuksan ang paksang iyon.
// - "Mag-report ng problema": report.js (bubuksan ang email app ng user; ang user ang magse-send).
// - textContent at createElement lang (walang innerHTML).
import { getLang as prefGetLang, setLang as prefSetLang, STRINGS } from "./login-i18n.js";
import { appLang } from "./local-state.js?v=2";
import { ui, topicText, searchTopics, getTopic, normalize, SUPPORT_EMAIL } from "./help-content.js?v=1";
import { renderBlock } from "./help-sheet.js?v=1";
import { createReport } from "./report.js?v=1";

const $ = (id) => document.getElementById(id);
const el = {
  back: $("backLink"), backText: $("backText"), langBtn: $("langBtn"), eyebrow: $("hEyebrow"), title: $("hTitle"), tagline: $("hTagline"),
  search: $("hSearch"), label: $("hLabel"), input: $("hInput"), clear: $("hClear"), count: $("hCount"), topics: $("hTopics"),
  none: $("hNone"), noneText: $("hNoneText"), noneClear: $("hNoneClear"),
  stuck: $("hStuckTitle"), report: $("hReport"), contact: $("hContact"), privacy: $("fPrivacy"), terms: $("fTerms"),
};
const NS = "http://www.w3.org/2000/svg";
const BACK = { en: "Back", fil: "Bumalik" };
const BACK_ARIA = { en: "Go back", fil: "Bumalik" };

// Mga salita ng v2 (dagdag lang; ang iba ay galing pa rin sa help-content.js)
const TXT = {
  en: {
    searchPh: "How can we help?", clear: "Clear search", common: "Common questions", policies: "Policies",
    count: (n) => (n === 1 ? "1 result" : `${n} results`),
    cats: { start: "Getting started", account: "Account and login", tools: "Using the tools", settings: "Profile and settings",
      safety: "Security and privacy", help: "Getting help" },
  },
  fil: {
    searchPh: "Ano ang maitutulong namin?", clear: "I-clear ang search", common: "Mga karaniwang tanong", policies: "Mga patakaran",
    count: (n) => (n === 1 ? "1 resulta" : `${n} na resulta`),
    cats: { start: "Pagsisimula", account: "Account at pag-log in", tools: "Paggamit ng mga tool", settings: "Profile at settings",
      safety: "Seguridad at privacy", help: "Kung kailangan ng tulong" },
  },
};

// Login FAQ: ang numero ay ang key sa login-i18n.js (faqNq / faqNa). id sa page: "faq-N".
const fq = (n) => ({ faq: n });
const tp = (id) => ({ topic: id });
const CATS = [
  { id: "start", items: [fq(0), fq(7), tp("getting-started"), tp("easy-actions")] },
  { id: "account", items: [fq(1), fq(2), fq(3), fq(4), fq(6), tp("account")] },
  { id: "tools", items: [tp("banner"), tp("quote"), tp("followup")] },
  { id: "settings", items: [tp("business-profile"), tp("appearance"), tp("friendly-care"), tp("language"), tp("sounds")] },
  { id: "safety", items: [fq(5), fq(8), tp("privacy")] },
  { id: "help", items: [tp("troubleshooting"), tp("report"), fq(9)] },
];
const COMMON = [1, 2, 3, 4]; // pag-log in, nakalimutan ang password, hindi makapag-log in, verification email

let lang = appLang(prefGetLang()) === "en" ? "en" : "fil";
const t = (key) => TXT[lang][key];
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

/* ---------- Isang tanong o paksa ---------- */
const faqQ = (n, l = lang) => STRINGS[l]["faq" + n + "q"] || STRINGS.en["faq" + n + "q"];
const faqA = (n, l = lang) => STRINGS[l]["faq" + n + "a"] || STRINGS.en["faq" + n + "a"];

function row(id, head, body) {
  const d = h("details", { class: "hRow", id }, h("summary", {}, head, icon("i-chev", "hChev")), h("div", { class: "hBody" }, ...body));
  if (openIds.has(id)) d.open = true;
  d.addEventListener("toggle", () => { if (d.open) openIds.add(id); else openIds.delete(id); });
  return d;
}
function faqRow(n) {
  const answer = h("p", {}, faqA(n));
  if (n === 9) answer.append(" ", h("a", { href: "mailto:" + SUPPORT_EMAIL }, SUPPORT_EMAIL)); // tulad ng Login FAQ
  return row("faq-" + n, h("span", { class: "hQ" }, faqQ(n)), [answer]);
}
function topicRow(id) {
  const topic = getTopic(id);
  if (!topic) return null;
  const x = topicText(topic, lang);
  const body = x.body.map((b) => {
    if (b && b.report) {
      if (!report) return null;
      const btn = h("button", { type: "button", class: "btn", "aria-haspopup": "dialog", "aria-expanded": "false" }, ui(lang, "reportOpen"));
      btn.addEventListener("click", () => report.open(btn));
      reportButtons.push(btn);
      return btn;
    }
    return renderBlock(b, lang);
  }).filter(Boolean);
  return row(id, h("span", { class: "hSumText" }, h("span", { class: "hQ" }, x.title), h("span", { class: "hSub" }, x.summary)), body);
}
function linkRow(attrs, label) {
  return h("a", { class: "hLinkRow", ...attrs }, h("span", { class: "hQ" }, label), icon("i-chev", "hGo"));
}

/* ---------- Buong listahan ---------- */
function render() {
  reportButtons.length = 0;
  const secs = [];
  secs.push(h("section", { class: "hSec", id: "hCommon", "aria-labelledby": "hCommonTitle" },
    h("h2", { class: "hSecTitle", id: "hCommonTitle" }, t("common")),
    h("div", { class: "hGroup" }, ...COMMON.map((n) => {
      const a = linkRow({ href: "#faq-" + n }, faqQ(n));
      a.addEventListener("click", (e) => { e.preventDefault(); openItem("faq-" + n); }); // walang dagdag na history entry
      return a;
    }))));
  for (const c of CATS) {
    const rows = c.items.map((it) => (it.faq !== undefined ? faqRow(it.faq) : topicRow(it.topic))).filter(Boolean);
    secs.push(h("section", { class: "hSec hCat", "data-cat": c.id, "aria-labelledby": "hCat-" + c.id },
      h("h2", { class: "hSecTitle", id: "hCat-" + c.id }, t("cats")[c.id]), h("div", { class: "hGroup" }, ...rows)));
  }
  secs.push(h("section", { class: "hSec hCat", "data-cat": "policies", "aria-labelledby": "hCat-policies" },
    h("h2", { class: "hSecTitle", id: "hCat-policies" }, t("policies")),
    h("div", { class: "hGroup" },
      linkRow({ href: "/terms.html", "data-words": "terms service tuntunin patakaran policy kasunduan" }, ui(lang, "terms")),
      linkRow({ href: "/privacy.html", "data-words": "privacy policy data patakaran impormasyon" }, ui(lang, "privacy")))));
  el.topics.replaceChildren(...secs);
  applyFilter();
}

/* ---------- Paghahanap ---------- */
const STOP = new Set(["how", "do", "does", "to", "the", "my", "can", "is", "it", "what", "why", "an", "of", "in", "on", "for", "and", "or", "me",
  "paano", "pano", "ang", "ng", "sa", "mga", "ko", "mo", "na", "ba", "po", "ako", "yung", "mag", "ma", "nang", "at", "ano", "bakit"]);
// normalize() ng help-content.js ay hanggang 80 character (para sa tanong ng user); dito, hinahati ang mahabang teksto
const foldAll = (text) => (String(text).match(/[\s\S]{1,80}/g) || []).map(normalize).join(" ");
function words(q) {
  const all = normalize(q).split(" ").filter((w) => w.length > 1);
  const use = all.filter((w) => !STOP.has(w));
  return use.length ? use : all;
}
const hasAll = (hay, ws) => { const s = " " + foldAll(hay) + " "; return ws.length > 0 && ws.every((w) => s.includes(w)); };
// Tanong ng FAQ: hinahanap sa English at Taglish/Filipino, kaya gumagana ang "password" at "nakalimutan"
const faqText = (n) => [faqQ(n, "en"), faqA(n, "en"), faqQ(n, "fil"), faqA(n, "fil")].join(" ");

function applyFilter() {
  const q = el.input.value;
  const searching = !!q.trim();
  el.clear.hidden = !searching;
  const ws = words(q);
  const topicHits = new Set(searchTopics(q, lang).map((x) => x.id));
  let n = 0;
  let only = null;
  for (const sec of el.topics.querySelectorAll(".hCat")) {
    let shown = 0;
    for (const r of sec.querySelectorAll(".hRow, .hLinkRow")) {
      let ok = true;
      if (searching) {
        if (r.classList.contains("hLinkRow")) ok = hasAll(r.textContent + " " + (r.dataset.words || ""), ws);
        else if (r.id.startsWith("faq-")) ok = hasAll(faqText(Number(r.id.slice(4))), ws);
        else ok = topicHits.has(r.id);
      }
      r.hidden = !ok;
      if (ok) { shown += 1; only = r; }
    }
    sec.hidden = shown === 0;
    n += shown;
  }
  const common = $("hCommon");
  if (common) common.hidden = searching;
  if (searching && n === 1 && only && only.tagName === "DETAILS" && !only.open) only.open = true;
  el.none.hidden = !searching || n > 0;
  el.noneText.textContent = ui(lang, "none");
  el.count.textContent = searching && n ? t("count")(n) : "";
}
function clearSearch() {
  el.input.value = "";
  applyFilter();
  el.input.focus();
}

/* ---------- Buksan ang isang tanong o paksa ---------- */
function openItem(id) {
  const d = $(id);
  if (!d || d.tagName !== "DETAILS") return;
  if (el.input.value) { el.input.value = ""; applyFilter(); }
  d.hidden = false;
  d.open = true;
  const reduced = typeof matchMedia === "function" && matchMedia("(prefers-reduced-motion: reduce)").matches;
  d.scrollIntoView({ behavior: reduced ? "auto" : "smooth", block: "start" });
  const sum = d.querySelector("summary");
  if (sum) sum.focus({ preventScroll: true });
}
function openFromHash() {
  const id = decodeURIComponent((location.hash || "").slice(1));
  if (id) openItem(id);
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
  el.input.setAttribute("placeholder", t("searchPh"));
  el.clear.setAttribute("aria-label", t("clear"));
  el.noneClear.textContent = t("clear");
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
  render();
  if (report) report.refresh();
  el.langBtn.focus();
}

/* ---------- Bumalik: sa pinanggalingang page ng MagnetraPH (hal. Login), o sa Dashboard ---------- */
function onBack(e) {
  if (e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
  let same = false;
  try { same = new URL(document.referrer).origin === location.origin; } catch { same = false; }
  if (same && history.length > 1) { e.preventDefault(); history.back(); }
}

function start() {
  try { report = createReport({ getLang: () => lang }); } catch { report = null; }
  renderText();
  render();
  el.search.hidden = false;
  el.langBtn.hidden = false;
  el.report.hidden = !report;
  el.search.addEventListener("submit", (e) => { e.preventDefault(); applyFilter(); });
  el.input.addEventListener("input", () => applyFilter());
  el.clear.addEventListener("click", clearSearch);
  el.noneClear.addEventListener("click", clearSearch);
  el.langBtn.addEventListener("click", switchLang);
  el.report.addEventListener("click", () => { if (report) report.open(el.report); });
  el.back.addEventListener("click", onBack);
  window.addEventListener("hashchange", openFromHash);
  openFromHash();
}
start();
