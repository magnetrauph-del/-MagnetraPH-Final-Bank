// ui-followup.js - v1.3 - controller ng Customer Follow-up Messages page. Walang emoji.
// v1.3 (P1): 4 na version bawat sitwasyon (umiikot ang "Ibang version"); "?" na tulong (help-sheet.js); tunog sa
// kumpirmadong kopya o share (sound.js, kapag naka-on); Friendly Care on/off para sa paalalang magpahinga; at ang alok
// na detalye mula sa huling quotation (session lang): walang inilalagay hangga't hindi pinipindot ang "Gamitin";
// pinupunan lang ang WALANG LAMAN na field; "Alisin" = buburahin ang alok at ang mga inilagay nito na hindi pa binago.
// - Login: frozen Auth Core (guardDashboard), parehong pattern ng Dashboard, Instant Banner at Quotes. Access gate lang ito:
//   ang message ay hindi gumagamit ng login, token, user ID, pangalan o email ng account.
// - Lahat ay nasa device: walang network call, walang storage, walang analytics. Ang pangalan ng customer at ang message
//   ay nasa memory lang ng page at nabubura sa Bagong message, pag-alis, reload o logout.
// - HINDI kailanman nagse-send ang MagnetraPH. Kopyahin (pangunahin) o I-share (kung kaya ng phone); ang user ang magse-send.
// - Ang mga message ay galing sa followup-templates.js (nakasulat na, walang AI). Ipinapakita gamit ang textarea.value at
//   textContent lang (walang innerHTML).
// - Galing sa Easy Actions ng Dashboard: ?situation=<isa sa limang sitwasyon> ang pumipili ng sitwasyon (wala nang iba).
//   Hindi ito ipinapakita bilang text; tinatanggal agad sa address bar.
import { guardDashboard } from "./auth-core-shared.js";
import { initExitGuard } from "./exit-guard-shared.js";
import { t, applyStatic, watchLang, getLang } from "./followup-i18n.js?v=3";
import { LIMITS, compose, isSituation, isMsgLang, otherVersion, DEFAULT_MSG_LANG, MSG_HTML_LANG, VERSIONS, toneOf, quoteDetail } from "./followup-templates.js?v=2";
import { markDone, careEnabled, readQuoteContext, clearQuoteContext } from "./local-state.js?v=2"; // bilang (session), Care, huling quotation
import { formatPeso } from "./quote-calc.js";
import { playDone } from "./sound.js?v=1";
import { mountHelpSheet } from "./help-sheet.js?v=1";

const $ = (id) => document.getElementById(id);
const el = {
  loader: $("loader"), loaderOffline: $("loaderOffline"), app: $("app"), appError: $("appError"), offlineMsg: $("offlineMsg"),
  backLink: $("backLink"), s2h: $("s2h"), empty: $("fEmpty"), ready: $("fReady"), text: $("fText"), version: $("fVersion"),
  editNote: $("fEditNote"), useNew: $("fUseNew"), copy: $("fCopy"), share: $("fShare"), other: $("fOther"),
  status: $("fStatus"), live: $("fLive"), copyBox: $("fCopyBox"), copyArea: $("fCopyArea"),
  next: $("fNext"), nextText: $("fNextText"), nextLink: $("fNextLink"), nextLinkText: $("fNextLinkText"), nextClose: $("fNextClose"),
  rest: $("fRest"), restCopy: $("fRestCopy"), restOk: $("fRestOk"), restGo: $("fRestGo"),
  persToggle: $("fPersToggle"), persBody: $("fPersBody"), newBtn: $("fNew"),
  dlg: $("fConfirm"), dlgTitle: $("fConfirmTitle"), dlgBody: $("fConfirmBody"), dlgOk: $("fConfirmOk"), dlgCancel: $("fConfirmCancel"), dlgClose: $("fConfirmClose"),
  ctx: $("fCtx"), ctxText: $("fCtxText"), ctxNote: $("fCtxNote"), ctxUse: $("fCtxUse"), ctxRemove: $("fCtxRemove"), helpBtn: $("helpBtn"),
};
const F = { name: $("fName"), product: $("fProduct"), detail: $("fDetail"), sender: $("fSender") };
const sitRadios = () => [...document.querySelectorAll('input[name="fSituation"]')];
const langRadios = () => [...document.querySelectorAll('input[name="fMsgLang"]')];

// Susunod na hakbang: same-site na link lang (walang data sa URL). Walang link ang "thinking" at "no-reply".
const NEXT_LINK = Object.freeze({
  inquiry: ["/quote.html", "nextLink.quote"],
  "quote-sent": ["/quote.html", "nextLink.quote"],
  "thank-you": ["/banner.html", "nextLink.banner"],
});
const DASHBOARD = "/dashboard.html";
// Paalala na magpahinga: minsan lang bawat pagbukas ng page, pagkatapos ng ika-6 na nakopya/na-share na message
// o 30 minuto ng aktibong paggamit (nakikita ang page at may galaw sa huling 2 minuto), alinman ang mauna.
const REST_AFTER_USES = 6;
const REST_AFTER_MS = 30 * 60 * 1000;
const ACTIVE_GAP_MS = 2 * 60 * 1000;
const TICK_MS = 15 * 1000;
const EXIT_WINDOW_MS = 2000; // kapareho ng pangalawang-Back na palugit ng frozen exit guard

let started = false;
let situation = "";        // "" hanggang pumili ang user
let version = 1;
let generated = "";        // ang huling message na ginawa ng page (para malaman kung na-edit ng user)
let used = false;          // nakopya o na-share na ang kasalukuyang message
let busy = false;
let statusKey = null;
let statusArgs = [];
let liveTimer = null;
let confirmMode = null;    // "version" | "situation" | "new" | "leave"
let confirmOpener = null;
let confirmTarget = "";    // para sa "leave": DASHBOARD o ang link ng susunod na hakbang
let pendingSituation = "";
const nextDismissed = new Set(); // mga sitwasyong isinara na ang suggestion (sa page na ito lang)
let nextFor = "";
let uses = 0;
let restShown = false;
let activeMs = 0;
let lastTick = 0;
let lastInput = 0;
let restTimer = null;
let disarmExit = () => Promise.resolve();
let guardOff = false;
let leaving = false;
let leaveOnPurpose = false; // sinadya ang pag-alis (hindi na kailangang itanong ulit ng browser)
let backFallback = null;
let lastPlainBack = 0;
let help = { open() {}, close: () => false, refresh() {} };
let qctx = null;      // alok mula sa huling quotation (o null)
let qApplied = null;  // { name, product, detail, lang } na talagang inilagay ng "Gamitin" (para sa "Alisin" at pagpalit ng wika)
const has = (o, k) => o != null && Object.prototype.hasOwnProperty.call(o, k);
const isOffline = () => typeof navigator !== "undefined" && navigator.onLine === false;

/* ---------- Basahin ang form ---------- */
const checked = (list) => { const r = list.find((x) => x.checked); return r ? r.value : ""; };
const msgLang = () => { const l = checked(langRadios()); return isMsgLang(l) ? l : DEFAULT_MSG_LANG; };
// Hilaw na tina-type; ang followup-templates.js ang maglilinis (cleanText) at maglilimita
const build = () => compose({ situation, lang: msgLang(), version,
  name: F.name.value, product: F.product.value, detail: F.detail.value, sender: F.sender.value });
const isEdited = () => !!situation && el.text.value !== generated;
const isDirty = () => isEdited() && !used; // na-edit at hindi pa nakokopya o na-share
const tone = (v) => t(toneOf(v) === 2 ? "tone2" : "tone1");

/* ---------- Mga mensahe sa user ---------- */
function setStatus(key, ...args) {
  statusKey = key;
  statusArgs = args;
  const text = key ? t(key, ...args) : "";
  if (text && el.status.textContent === text) {
    // Parehong text (hal. pangalawang Kopyahin): burahin muna para ma-announce ulit ng screen reader
    el.status.textContent = "";
    setTimeout(() => { if (statusKey === key) el.status.textContent = t(key, ...statusArgs); }, 60);
  } else {
    el.status.textContent = text;
  }
}
function announce(key) {
  clearTimeout(liveTimer);
  el.live.textContent = "";
  liveTimer = setTimeout(() => { el.live.textContent = t(key); }, 60);
}

/* ---------- Ang message ---------- */
function renderVersion() { el.version.textContent = t("version", version, tone(version), VERSIONS.length); }
function hideCopyBox() { el.copyBox.hidden = true; el.copyArea.value = ""; }
// Lumalaki ang textarea ayon sa haba ng message, para makita ang buong message bago kopyahin
function fitText() {
  if (el.ready.hidden) return;
  el.text.style.height = "auto";
  el.text.style.height = el.text.scrollHeight + 2 + "px";
}
function showMessage(text) {
  el.text.value = text;
  generated = el.text.value; // pareho ang ayos ng linya sa textarea
  el.text.setAttribute("lang", MSG_HTML_LANG[msgLang()]);
  used = false;
  el.editNote.hidden = true;
  hideCopyBox();
  renderVersion();
  fitText();
  syncRest();
}
// Nagbago ang detalye o ang wika ng message. Kapag na-edit na ng user ang message, HINDI ito papalitan:
// may kalmadong paalala na may "Gamitin ang bagong detalye".
function update() {
  if (!situation) return;
  const text = build();
  if (isEdited()) { el.editNote.hidden = text === generated; return; }
  if (text !== el.text.value) {
    showMessage(text);
    if (statusKey) setStatus(null);
  }
}
function applySituation(v) {
  situation = v;
  version = 1;
  for (const r of sitRadios()) r.checked = r.value === v;
  el.empty.hidden = true;
  el.ready.hidden = false;
  showMessage(build());
  setStatus(null);
  hideNext();
  announce("ready");
}
function onSituation(e) {
  const r = e.target;
  if (!r.matches('input[name="fSituation"]')) return;
  const v = r.value;
  if (!isSituation(v) || v === situation) return;
  if (isEdited()) {
    // Ibalik muna ang dating napili habang nagtatanong (Kanselahin = walang nagbago)
    pendingSituation = v;
    const cur = sitRadios().find((x) => x.value === situation);
    for (const x of sitRadios()) x.checked = x.value === situation;
    openConfirm("situation", cur || r);
    return;
  }
  applySituation(v);
}
function switchVersion() {
  version = otherVersion(version);
  showMessage(build());
  setStatus("versionShown", version, tone(version));
}
function onOther() {
  if (!situation) return;
  if (isEdited()) { openConfirm("version", el.other); return; }
  switchVersion();
}
function onUseNew() {
  if (!situation) return;
  showMessage(build());
  setStatus("rebuilt");
  el.text.focus();
}
function onTextInput() {
  used = false; // binago ang message: hindi pa ito ang nakopya
  hideCopyBox();
  if (!isEdited()) el.editNote.hidden = true;
  if (statusKey) setStatus(null);
  fitText();
  syncRest();
}

/* ---------- Kopyahin at I-share (hindi kailanman nagse-send ang MagnetraPH) ---------- */
const canShare = () => window.isSecureContext === true && typeof navigator.share === "function";
function markUsed(key) {
  used = true;
  markDone("followup"); // tinatawag lang pagkatapos ng kumpirmadong kopya, mano-manong kopya o share
  playDone(); // mahinang tunog, kapag naka-on lang sa Settings (laging may text din sa screen)
  setStatus(key);
  showNext();
  uses += 1;
  if (uses >= REST_AFTER_USES) showRest();
  syncRest();
}
async function onCopy() {
  if (busy || !situation) return;
  const text = el.text.value;
  if (!text.trim()) { setStatus("emptyMsg"); el.text.focus(); return; }
  busy = true;
  let ok = false;
  try {
    if (window.isSecureContext && navigator.clipboard && typeof navigator.clipboard.writeText === "function") {
      await navigator.clipboard.writeText(text);
      ok = true;
    }
  } catch { ok = false; }
  busy = false;
  if (ok) {
    hideCopyBox();
    markUsed("copied");
  } else {
    // Walang clipboard (o tinanggihan): ipakita ang text para ma-copy nang mano-mano
    el.copyArea.value = text;
    el.copyBox.hidden = false;
    setStatus("copyFallback");
    el.copyArea.focus();
    el.copyArea.select();
  }
}
// Mano-manong pag-copy mula sa fallback box: buong text lang ang binibilang na "nakopya"
function onManualCopy() {
  const a = el.copyArea;
  if (a.value && a.value === el.text.value && a.selectionStart === 0 && a.selectionEnd === a.value.length) markUsed("copied");
}
async function onShare() {
  if (busy || !situation || !canShare()) return;
  const text = el.text.value;
  if (!text.trim()) { setStatus("emptyMsg"); el.text.focus(); return; }
  const data = { text };
  try {
    if (typeof navigator.canShare === "function" && !navigator.canShare(data)) { setStatus("shareFailed"); return; }
  } catch { setStatus("shareFailed"); return; }
  busy = true;
  try {
    await navigator.share(data);
    busy = false;
    hideCopyBox();
    markUsed("shared"); // napili ang app; hindi ito patunay na na-send
  } catch (e) {
    busy = false;
    setStatus(e && e.name === "AbortError" ? "shareCancelled" : "shareFailed");
  }
}

/* ---------- Susunod na hakbang (isa lang, puwedeng isara, walang kusang paglipat ng page) ---------- */
function renderNext() {
  if (!nextFor) return;
  el.nextText.textContent = t("next." + nextFor);
  const link = has(NEXT_LINK, nextFor) ? NEXT_LINK[nextFor] : null;
  el.nextLink.hidden = !link;
  if (link) {
    el.nextLink.setAttribute("href", link[0]);
    el.nextLinkText.textContent = t(link[1]);
  }
}
function showNext() {
  if (!situation || nextDismissed.has(situation)) return;
  nextFor = situation;
  renderNext();
  el.next.hidden = false;
}
function hideNext() { el.next.hidden = true; nextFor = ""; }
function onNextClose() {
  if (nextFor) nextDismissed.add(nextFor);
  hideNext();
  (el.ready.hidden ? el.s2h : el.copy).focus();
}
function onNextLink(e) {
  if (e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return; // bagong tab: hayaan ang browser
  e.preventDefault();
  if (leaving || !has(NEXT_LINK, nextFor)) return;
  const url = NEXT_LINK[nextFor][0];
  if (isDirty()) openConfirm("leave", el.nextLink, url);
  else go(url);
}

/* ---------- Paalala na magpahinga (mungkahi lang; minsan lang; walang sine-save) ---------- */
function syncRest() { if (!el.rest.hidden) el.restCopy.hidden = !isDirty(); }
function showRest() {
  if (restShown || !careEnabled()) return; // Friendly Care: puwedeng i-off sa Settings
  restShown = true;
  clearInterval(restTimer);
  restTimer = null;
  el.rest.hidden = false;
  syncRest();
}
function hideRest() {
  const hadFocus = el.rest.contains(document.activeElement);
  el.rest.hidden = true;
  if (hadFocus) (el.ready.hidden ? el.s2h : el.copy).focus();
}
function tick() {
  const now = Date.now();
  const gap = Math.max(0, now - lastTick);
  lastTick = now;
  if (document.visibilityState === "visible" && now - lastInput <= ACTIVE_GAP_MS) activeMs += Math.min(gap, TICK_MS * 2);
  if (activeMs >= REST_AFTER_MS) showRest();
}
const noteInput = () => { lastInput = Date.now(); };
function startRestClock() {
  clearInterval(restTimer);
  uses = 0;
  activeMs = 0;
  restShown = false;
  el.rest.hidden = true;
  lastTick = lastInput = Date.now();
  restTimer = setInterval(tick, TICK_MS);
}

/* ---------- Alok mula sa huling quotation (session lang) ---------- */
function ctxSummary(c) {
  const item = c.item ? (c.count > 1 ? `${c.item} ${t("ctxMore", c.count - 1)}` : c.item) : "";
  return [c.customer, item, formatPeso(BigInt(c.total))].filter(Boolean).join(" · ");
}
function renderCtx() {
  if (!qctx) { el.ctx.hidden = true; return; }
  el.ctxText.textContent = ctxSummary(qctx);
  el.ctxUse.hidden = !!qApplied;
  el.ctxNote.hidden = !qApplied;
  el.ctx.hidden = false;
}
function loadCtx() {
  try { qctx = readQuoteContext(); } catch { qctx = null; }
  qApplied = null;
  renderCtx();
}
const ctxDetail = (lang) => quoteDetail(formatPeso(BigInt(qctx.total)), qctx.count, lang);
function onCtxUse() {
  if (!qctx || qApplied) return;
  const lang = msgLang();
  const want = { name: qctx.customer, product: qctx.item, detail: ctxDetail(lang) };
  const put = {};
  for (const k of ["name", "product", "detail"]) {
    if (want[k] && !F[k].value.trim()) { F[k].value = want[k]; put[k] = want[k]; } // walang laman lang ang pinupunan
  }
  if (!Object.keys(put).length) { setStatus("ctxNothing"); return; }
  qApplied = { ...put, lang };
  if (el.persToggle.getAttribute("aria-expanded") !== "true") onPersToggle(); // makita agad kung ano ang inilagay
  update();
  renderCtx();
  setStatus("ctxFilled");
  el.ctxRemove.focus();
}
function onCtxRemove() {
  if (qApplied) {
    for (const k of ["name", "product", "detail"]) if (qApplied[k] && F[k].value === qApplied[k]) F[k].value = ""; // ang hindi binago lang
  }
  try { clearQuoteContext(); } catch { /* ok lang */ }
  qctx = null;
  qApplied = null;
  renderCtx();
  update();
  setStatus("ctxRemoved");
  (el.ready.hidden ? sitRadios()[0] : el.copy).focus();
}
// Nagpalit ng wika ng message: kung hindi pa binabago ang detalye galing sa quotation, isalin din ito
function onMsgLang() {
  if (qctx && qApplied && qApplied.detail && F.detail.value === qApplied.detail) {
    const lang = msgLang();
    F.detail.value = qApplied.detail = ctxDetail(lang);
    qApplied.lang = lang;
  }
  update();
}

/* ---------- Bagong message ---------- */
// Binubura: sitwasyon, pangalan ng customer, produkto, detalye at ang message.
// Naiiwan (para sa page na ito lang, walang sine-save): wika ng message at ang pirma mo.
function clearCustomer() {
  situation = "";
  version = 1;
  generated = "";
  used = false;
  pendingSituation = "";
  for (const r of sitRadios()) r.checked = false;
  F.name.value = "";
  F.product.value = "";
  F.detail.value = "";
  el.text.value = "";
  el.ready.hidden = true;
  el.empty.hidden = false;
  el.editNote.hidden = true;
  hideCopyBox();
  hideNext();
  qApplied = null; // nabura na ang mga field: puwedeng gamitin ulit ang alok
  renderCtx();
}
function doNew() {
  clearCustomer();
  setStatus("newDone");
  const first = sitRadios()[0];
  if (first) first.focus();
}
function onNew() {
  if (isDirty()) { openConfirm("new", el.newBtn); return; }
  doNew();
}
// Buong pag-reset (simula ng page, o pagbalik mula sa ibang page): pati pirma at wika ng message
function resetAll() {
  clearCustomer();
  F.sender.value = "";
  for (const r of langRadios()) r.checked = r.value === DEFAULT_MSG_LANG;
  nextDismissed.clear();
  setStatus(null);
  el.live.textContent = "";
}

/* ---------- Kumpirmasyon (native dialog; walang confirm()) ---------- */
function openConfirm(mode, opener, target = DASHBOARD) {
  confirmMode = mode;
  confirmOpener = opener;
  confirmTarget = target;
  renderConfirm();
  if (!el.dlg.open) { try { el.dlg.showModal(); } catch { el.dlg.setAttribute("open", ""); } }
  el.dlgTitle.focus();
}
function renderConfirm() {
  const k = { version: "Replace", situation: "Replace", new: "New", leave: "Leave" }[confirmMode] || "Replace";
  el.dlgTitle.textContent = t(`dlg${k}Title`);
  el.dlgBody.textContent = t(`dlg${k}Body`);
  el.dlgOk.textContent = t(`dlg${k}Ok`);
  el.dlgCancel.textContent = t(confirmMode === "leave" ? "dlgStay" : confirmMode === "new" ? "dlgCancel" : "dlgKeep");
}
function closeConfirm() {
  if (!el.dlg.open) return false;
  try { el.dlg.close(); } catch { el.dlg.removeAttribute("open"); onConfirmClosed(); }
  return true;
}
function onConfirmClosed() {
  const opener = confirmOpener;
  confirmMode = null;
  confirmOpener = null;
  if (opener && !leaving && !el.app.hidden && opener.isConnected) opener.focus();
}
function onConfirmOk() {
  const mode = confirmMode;
  const target = confirmTarget;
  const pick = pendingSituation;
  confirmOpener = null; // ang aksyon na ang maglilipat ng focus
  closeConfirm();
  if (mode === "version") { switchVersion(); el.other.focus(); }
  else if (mode === "situation" && isSituation(pick)) {
    applySituation(pick);
    const r = sitRadios().find((x) => x.value === pick);
    if (r) r.focus();
  } else if (mode === "new") doNew();
  else if (mode === "leave") { if (target === DASHBOARD) goDashboard(); else go(target); }
  pendingSituation = "";
}

/* ---------- Pag-alis: Dashboard (walang dagdag na history entry) o ang tool ng susunod na hakbang ---------- */
function cameFromDashboard() {
  try {
    const r = new URL(document.referrer);
    return r.origin === location.origin && /^\/dashboard(\.html)?$/.test(r.pathname);
  } catch { return false; }
}
async function goDashboard() {
  if (leaving) return;
  leaving = true;
  leaveOnPurpose = true;
  try { await disarmExit(); } catch {}
  guardOff = true;
  if (cameFromDashboard() && history.length > 1) {
    history.back();
    backFallback = setTimeout(() => location.replace(DASHBOARD), 2500); // kung hindi umalis ang page
  } else {
    location.replace(DASHBOARD);
  }
}
async function go(url) {
  if (leaving) return;
  leaving = true;
  leaveOnPurpose = true;
  try { await disarmExit(); } catch {}
  guardOff = true;
  location.assign(url);
}
function onBack(e) {
  if (e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
  e.preventDefault();
  if (leaving) return;
  if (isDirty()) openConfirm("leave", el.backLink, DASHBOARD);
  else goDashboard();
}
// Back ng phone (frozen exit guard): isara muna ang dialog. Sa pangalawang Back sa loob ng palugit, aalis na
// ang page; hindi na itatanong ulit ng browser dahil nakita na ng user ang babala sa toast.
function closeOverlay() {
  if (help.close()) return true;
  if (closeConfirm()) return true;
  const now = Date.now();
  if (now - lastPlainBack < EXIT_WINDOW_MS) {
    leaveOnPurpose = true;
    setTimeout(() => { leaveOnPurpose = false; }, 3000);
  }
  lastPlainBack = now;
  return false;
}
function armExitGuard() {
  try {
    disarmExit = initExitGuard({ getText: () => t(isDirty() ? "exitDirty" : "exitToast"), closeOverlay });
  } catch { /* walang exit guard: gumagana pa rin ang page */ }
}

/* ---------- Gawing mas personal (bukas o sarado) ---------- */
function onPersToggle() {
  const open = el.persToggle.getAttribute("aria-expanded") !== "true";
  el.persToggle.setAttribute("aria-expanded", String(open));
  el.persBody.hidden = !open;
}

/* ---------- Wika ng page (sumusunod sa mgpref_lang). Hindi nagbabago ang wika ng MESSAGE. ---------- */
function renderHints() {
  for (const p of document.querySelectorAll("[data-limit]")) {
    const k = p.getAttribute("data-limit");
    if (has(LIMITS, k)) p.textContent = t("limit", LIMITS[k]);
  }
  for (const p of document.querySelectorAll("[data-hint]")) {
    const k = p.getAttribute("data-hint");
    p.textContent = t(k, k === "detailHint" ? LIMITS.detail : LIMITS.sender);
  }
}
function refreshText() {
  applyStatic(document);
  renderHints();
  if (situation) renderVersion();
  renderNext();
  if (confirmMode) renderConfirm();
  if (statusKey) el.status.textContent = t(statusKey, ...statusArgs);
  renderCtx();
  help.refresh();
}

/* ---------- Simula: pagkatapos lang makumpirma ng frozen Auth Core ang login ---------- */
function renderOffline() { el.offlineMsg.hidden = !isOffline(); }
function wire() {
  document.querySelector(".sitList").addEventListener("change", onSituation);
  for (const r of langRadios()) r.addEventListener("change", onMsgLang);
  el.ctxUse.addEventListener("click", onCtxUse);
  el.ctxRemove.addEventListener("click", onCtxRemove);
  for (const f of Object.values(F)) f.addEventListener("input", update);
  el.text.addEventListener("input", onTextInput);
  el.useNew.addEventListener("click", onUseNew);
  el.copy.addEventListener("click", onCopy);
  el.share.addEventListener("click", onShare);
  el.other.addEventListener("click", onOther);
  el.copyArea.addEventListener("focus", () => el.copyArea.select());
  el.copyArea.addEventListener("copy", onManualCopy);
  el.nextClose.addEventListener("click", onNextClose);
  el.nextLink.addEventListener("click", onNextLink);
  el.restOk.addEventListener("click", hideRest);
  el.restGo.addEventListener("click", hideRest);
  el.persToggle.addEventListener("click", onPersToggle);
  el.newBtn.addEventListener("click", onNew);
  el.dlgOk.addEventListener("click", onConfirmOk);
  el.dlgCancel.addEventListener("click", closeConfirm);
  el.dlgClose.addEventListener("click", closeConfirm);
  el.dlg.addEventListener("close", onConfirmClosed);
  el.backLink.addEventListener("click", onBack);
  for (const ev of ["pointerdown", "keydown", "input"]) window.addEventListener(ev, noteInput, { capture: true, passive: true });
  window.addEventListener("online", renderOffline);
  window.addEventListener("offline", renderOffline);
  let fitFrame = 0;
  window.addEventListener("resize", () => { if (!fitFrame) fitFrame = requestAnimationFrame(() => { fitFrame = 0; fitText(); }); });
  // Babala ng browser bago mag-refresh o magsara habang may na-edit na message na hindi pa nakokopya
  window.addEventListener("beforeunload", (e) => {
    if (leaveOnPurpose || !isDirty()) return;
    e.preventDefault();
    e.returnValue = "";
  });
  // Pag-alis sa page: burahin agad sa memory ang pangalan ng customer at ang message (kahit itabi ng browser ang page)
  window.addEventListener("pagehide", () => {
    clearTimeout(backFallback);
    closeConfirm();
    resetAll();
    hideRest();
  });
  window.addEventListener("pageshow", (e) => {
    if (!e.persisted) return;
    clearTimeout(backFallback);
    leaving = false;
    leaveOnPurpose = false;
    resetAll();
    loadCtx();
    startRestClock();
    if (guardOff) { guardOff = false; armExitGuard(); }
  });
  watchLang(refreshText);
}
// Sitwasyon mula sa Easy Actions (?situation=quote-sent). Tinatanggap lang ang limang kilalang sitwasyon; ang iba ay hindi pinapansin.
function presetSituation() {
  let v = "";
  try { v = new URLSearchParams(location.search).get("situation") || ""; } catch { v = ""; }
  if (location.search) {
    try { history.replaceState(history.state, "", location.pathname + location.hash); } catch { /* ok lang */ }
  }
  return isSituation(v) ? v : "";
}
function start() {
  if (started) return;
  started = true;
  applyStatic(document);
  renderHints();
  el.share.hidden = !canShare(); // ipinapakita lang kapag kaya ng phone/browser
  wire();
  resetAll(); // malinis na simula (kahit may naibalik ang browser sa mga field)
  loadCtx();
  try { help = mountHelpSheet({ button: el.helpBtn, topicId: "followup", getLang }); } catch { el.helpBtn.hidden = true; }
  const preset = presetSituation();
  if (preset) applySituation(preset);
  renderOffline();
  armExitGuard();
  startRestClock();
  el.loader.hidden = true;
  el.app.hidden = false;
}
function showFatal() {
  try { applyStatic(document); } catch {}
  el.app.hidden = true;
  el.loader.hidden = true;
  el.appError.hidden = false;
  document.documentElement.style.visibility = "";
}

// Habang chine-check ang login: kung offline, kalmadong paalala (walang awtomatikong retry)
const loaderOffline = () => { if (!started) el.loaderOffline.hidden = !isOffline(); };
try { applyStatic(document); } catch {}
loaderOffline();
window.addEventListener("online", loaderOffline);
window.addEventListener("offline", loaderOffline);

try {
  // Hindi ginagamit ang user object: walang pangalan, email o ID na lumalabas sa message
  guardDashboard(() => {
    try { start(); } catch { console.error("followup: start failed"); showFatal(); }
  }, { idleMinutes: 60 });
} catch {
  console.error("followup: auth guard failed");
  showFatal();
}
