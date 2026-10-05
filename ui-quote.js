// ui-quote.js - v1.1 - controller ng Quotes / Quote Maker page. Walang emoji.
// - Login: frozen Auth Core (guardDashboard), parehong pattern ng Dashboard at Instant Banner. Access gate lang ito:
//   ang quotation mismo ay hindi gumagamit ng login, token, user ID o anumang data ng account.
// - Lahat ay nasa device: walang network call, walang storage. Kapag nag-refresh, malinis ulit ang form.
// - Ang kuwenta ay nasa quote-calc.js (buong centavo). Dito: form, mga item, error, preview, print, copy, Back.
// - Ang quotation ay ginagawa gamit ang createElement/textContent lang (walang innerHTML).
// - v1.1 (Phase 1.1): "From" na galing sa naka-save na Business Profile (local-state.js; galing sa user; hindi
//   binibilang na hindi naka-save na trabaho). Pagkatapos talagang makopya o magsara ang print screen: isang mungkahing
//   next step (Follow-up "quote-sent"), na hindi nagsasabing naipadala na. Bilang na "natapos": kopya lang (kumpirmado).
import { guardDashboard, isInAppBrowser } from "./auth-core-shared.js";
import { initExitGuard } from "./exit-guard-shared.js";
import { cleanText } from "./security-core-shared.js";
import { t, applyStatic, getLang, watchLang, docLabels, DOC_LANGS } from "./quote-i18n.js?v=2";
import { readBusinessProfile, markDone } from "./local-state.js?v=1";
import { LIMITS, computeQuote, formatPeso, formatQty, formatHundredths, toPlainText } from "./quote-calc.js";

const $ = (id) => document.getElementById(id);
const el = {
  loader: $("loader"), loaderOffline: $("loaderOffline"), app: $("app"), appError: $("appError"), offlineMsg: $("offlineMsg"),
  backLink: $("backLink"), list: $("qItemList"), tplItem: $("tplItem"), addItem: $("qAddItem"), itemsErr: $("qItemsErr"),
  itemsLimit: $("qItemsLimit"), itemsMsg: $("qItemsMsg"), discRow: $("qDiscRow"), discLabel: $("qDiscLabel"), discErr: $("qDiscErr"),
  subtotal: $("qSubtotal"), discLine: $("qDiscLine"), discLineLabel: $("qDiscLineLabel"), discAmt: $("qDiscAmt"), total: $("qTotal"),
  totalNote: $("qTotalNote"), totalErr: $("qTotalErr"), totalLive: $("qTotalLive"),
  savePdf: $("qSavePdf"), inAppNote: $("qInAppNote"), copy: $("qCopy"), newQuote: $("qNew"), summary: $("qSummary"), saveMsg: $("qSaveMsg"),
  printHint: $("qPrintHint"), copyBox: $("qCopyBox"), copyArea: $("qCopyArea"), previewEmpty: $("qPreviewEmpty"), doc: $("qDoc"),
  next: $("qNext"), nextLink: $("qNextLink"), nextClose: $("qNextClose"), fromProfile: $("qFromProfile"),
  dlg: $("qConfirm"), dlgTitle: $("qConfirmTitle"), dlgBody: $("qConfirmBody"), dlgOk: $("qConfirmOk"), dlgCancel: $("qConfirmCancel"), dlgClose: $("qConfirmClose"),
};
const F = {
  bizName: $("qBizName"), bizContact: $("qBizContact"), custName: $("qCustName"), custContact: $("qCustContact"),
  notes: $("qNotes"), date: $("qDate"), validUntil: $("qValidUntil"), quoteNo: $("qQuoteNo"), discValue: $("qDiscValue"),
};
// Field ng quote-calc -> [input, lugar ng error]
const FIELD = {
  "from.name": [F.bizName, $("qBizNameErr")], "from.contact": [F.bizContact, $("qBizContactErr")],
  "to.name": [F.custName, $("qCustNameErr")], "to.contact": [F.custContact, $("qCustContactErr")],
  discount: [F.discValue, el.discErr], notes: [F.notes, $("qNotesErr")], date: [F.date, $("qDateErr")],
  validUntil: [F.validUntil, $("qValidUntilErr")], quoteNo: [F.quoteNo, $("qQuoteNoErr")],
  items: [el.addItem, el.itemsErr], total: [el.totalErr, el.totalErr],
};
const LIMIT_OF = { "from.name": LIMITS.name, "to.name": LIMITS.name, "from.contact": LIMITS.contact, "to.contact": LIMITS.contact, quoteNo: LIMITS.quoteNo, notes: LIMITS.notes };
const DASH = "\u2014";
const EXIT_WINDOW_MS = 2000; // kapareho ng pangalawang-Back na palugit ng frozen exit guard

let started = false;
let items = [];             // { seq, li, title, removeBtn, removeText, desc, qty, price, amount, err:{desc,qty,price} }
let itemSeq = 0;
let showAll = false;        // pagkatapos pindutin ang Save/Copy: ipakita na ang lahat ng kulang
const touched = new Set();  // mga field na naiwan na (blur) ng user: doon lang muna lumalabas ang error habang nagta-type
const fresh = new Set();    // bagong item pagkatapos ng Save/Copy: hindi agad pinupula hangga't hindi pa nagagalaw
let last = null;            // { m, r } ng huling kuwenta
let lastShown = new Set();  // mga field na may nakikitang error ngayon
let startDate = "";
let frame = 0;
let liveTimer = null;
let busy = false;
let saveMsgKey = null;
let saveMsgErr = false;
let confirmMode = null;     // "new" | "leave"
let confirmOpener = null;
let disarmExit = () => Promise.resolve();
let guardOff = false;
let leaving = false;
let leaveOnPurpose = false; // sinadya ang pag-alis (hindi na kailangang itanong ulit ng browser)
let backFallback = null;
let lastPlainBack = 0;
let prefill = { name: "", contact: "" }; // galing sa Business Profile (para hindi ituring na hindi naka-save)
let confirmUrl = null;                   // saan pupunta pagkatapos ng "Leave"
const DASHBOARD = "/dashboard.html";
const NEXT_URL = "/followup.html?situation=quote-sent";
const has = (o, k) => o != null && Object.prototype.hasOwnProperty.call(o, k);
const isOffline = () => typeof navigator !== "undefined" && navigator.onLine === false;
const pad = (n) => String(n).padStart(2, "0");
function today() { const d = new Date(); return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`; }

/* ---------- Basahin ang form (nililinis at nililimitahan ang text) ---------- */
const clean = (input, max) => cleanText(input.value, max);
const radio = (name) => { const r = document.querySelector(`input[name="${name}"]:checked`); return r ? r.value : ""; };
const discMode = () => (["amount", "percent"].includes(radio("qDiscMode")) ? radio("qDiscMode") : "none");
const docLang = () => (DOC_LANGS.includes(radio("qDocLang")) ? radio("qDocLang") : "en");
function model() {
  return {
    from: { name: clean(F.bizName, LIMITS.name), contact: clean(F.bizContact, LIMITS.contact) },
    to: { name: clean(F.custName, LIMITS.name), contact: clean(F.custContact, LIMITS.contact) },
    date: F.date.value, validUntil: F.validUntil.value, quoteNo: clean(F.quoteNo, LIMITS.quoteNo),
    items: items.map((it) => ({ desc: clean(it.desc, LIMITS.desc), qtyText: it.qty.value, priceText: it.price.value })),
    discount: { mode: discMode(), text: F.discValue.value },
    notes: clean(F.notes, LIMITS.notes),
  };
}
function isDirty() {
  // Ang galing sa Business Profile ay hindi bagong trabaho; ang binago lang ang binibilang
  if (F.bizName.value.trim() !== prefill.name || F.bizContact.value.trim() !== prefill.contact) return true;
  const textFields = [F.custName, F.custContact, F.notes, F.quoteNo, F.validUntil];
  if (textFields.some((f) => f.value.trim())) return true;
  if (F.date.value !== startDate || discMode() !== "none") return true;
  return items.some((it) => it.desc.value.trim() || it.qty.value.trim() || it.price.value.trim());
}

/* ---------- Mga mensahe ---------- */
function errMsg(field, code) {
  if (code === "long") return t("errLong", LIMIT_OF[field] || LIMITS.desc);
  if (field === "from.name") return t("errBizName");
  if (field === "to.name") return t("errCustName");
  if (field === "items") return t(code === "tooMany" ? "errTooMany" : "errItems");
  if (field === "total") return t("errTooLarge");
  if (field === "date") return t(code === "empty" ? "errDateEmpty" : "errDate");
  if (field === "validUntil") return t(code === "beforeDate" ? "errBeforeDate" : "errDate");
  if (field === "discount") {
    if (code === "empty") return t("errDiscEmpty");
    if (code === "negative") return t("errNegative");
    if (code === "decimals") return t("errDecimals");
    if (discMode() === "percent") return t("errDiscPct");
    if (code === "min") return t("errDiscMin");
    if (code === "over" || code === "max") return t("errDiscOver");
    return t("errDiscAmount");
  }
  const kind = field.split(".")[2];
  if (kind === "desc") return t("errDesc");
  if (kind === "qty") return t({ empty: "errQtyEmpty", max: "errQtyMax", negative: "errNegative", decimals: "errDecimals" }[code] || "errQty");
  if (kind === "price") return t({ empty: "errPriceEmpty", max: "errPriceMax", negative: "errNegative", decimals: "errDecimals", tooLarge: "errTooLarge" }[code] || "errPrice");
  return "";
}
function target(field) {
  if (has(FIELD, field)) return FIELD[field];
  const m = /^items\.(\d+)\.(desc|qty|price)$/.exec(field);
  const it = m ? items[Number(m[1])] : null;
  return it ? [it[m[2]], it.err[m[2]]] : null;
}
// Ipinapakita ang error kapag: pinindot na ang Save/Copy, o naiwan na (blur) ang field na may maling laman.
// Habang nagta-type sa isang field, hindi muna lalabas ang BAGONG error doon (hal. "1,5" papunta sa "1,500");
// ang dati nang nakikitang error ay sumasabay at nawawala agad kapag tama na.
const visible = (e) => {
  if (e.field === "total" || (e.field === "items" && e.code === "tooMany")) return true;
  const tg = target(e.field);
  if (tg && tg[0] === document.activeElement && !lastShown.has(e.field) && e.field !== "items") return false;
  if (showAll && !(tg && fresh.has(tg[0]))) return true;
  if (e.code === "empty" || e.code === "none") return false;
  return !!tg && touched.has(tg[0]);
};
function renderErrors(r) {
  const shown = new Map();
  for (const e of r.errors) if (visible(e) && !shown.has(e.field)) shown.set(e.field, e);
  const all = [...Object.keys(FIELD), ...items.flatMap((_, i) => ["desc", "qty", "price"].map((k) => `items.${i}.${k}`))];
  for (const f of all) {
    const tg = target(f);
    if (!tg) continue;
    const e = shown.get(f);
    const msg = e ? errMsg(f, e.code) : "";
    if (tg[1].textContent !== msg) tg[1].textContent = msg;
    tg[1].hidden = !e;
    if (tg[0] !== tg[1] && tg[0] !== el.addItem) { if (e) tg[0].setAttribute("aria-invalid", "true"); else tg[0].removeAttribute("aria-invalid"); }
  }
  lastShown = new Set(shown.keys());
  if (!el.summary.hidden) {
    const n = shown.size; // ang mga field na may nakikitang error (hindi kasama ang bagong item na hindi pa nagagalaw)
    const msg = t("fixFields", n);
    if (!n) el.summary.hidden = true; else if (el.summary.textContent !== msg) el.summary.textContent = msg;
  }
  return shown;
}
function setSaveMsg(key, err = false) {
  saveMsgKey = key;
  saveMsgErr = err;
  el.saveMsg.textContent = key ? t(key) : "";
  el.saveMsg.classList.toggle("isErr", !!(key && err));
}

/* ---------- Kuwenta, kabuuan at preview ---------- */
function update() {
  const m = model();
  const r = computeQuote(m);
  last = { m, r };
  const put = (n, v) => { if (n.textContent !== v) n.textContent = v; }; // walang pagbabago = walang dagdag na anunsyo
  items.forEach((it, i) => { const a = r.lines[i] && r.lines[i].amount; put(it.amount, a != null ? formatPeso(a) : DASH); });
  el.subtotal.textContent = r.subtotal !== null ? formatPeso(r.subtotal) : DASH;
  const mode = r.discount.mode;
  el.discLine.hidden = mode === "none";
  el.discLineLabel.textContent = mode === "percent" && r.discount.bp !== null ? `${t("discount")} (${formatHundredths(r.discount.bp)}%)` : t("discount");
  el.discAmt.textContent = r.discount.amount !== null && mode !== "none" ? "-" + formatPeso(r.discount.amount) : DASH;
  el.total.textContent = r.total !== null ? formatPeso(r.total) : DASH;
  const shown = renderErrors(r);
  const numErr = [...shown.keys()].some((f) => /^items\.\d+\.(qty|price)$/.test(f) || f === "discount");
  const linesIncomplete = r.subtotal === null && !r.errors.some((e) => e.field === "total");
  put(el.totalNote, r.total !== null ? "" : numErr ? t("totalCheck") : linesIncomplete ? t("totalPending") : "");
  clearTimeout(liveTimer);
  liveTimer = setTimeout(() => { el.totalLive.textContent = r.total !== null ? t("totalLive", formatPeso(r.total)) : ""; }, 800);
  if (!el.copyBox.hidden) { el.copyBox.hidden = true; el.copyArea.value = ""; }
  if (!frame) frame = requestAnimationFrame(() => { frame = 0; renderDoc(); });
}
function flushDoc() { if (frame) { cancelAnimationFrame(frame); frame = 0; } renderDoc(); }

function node(tag, cls, text) {
  const n = document.createElement(tag);
  if (cls) n.className = cls;
  if (text != null) n.textContent = text;
  return n;
}
// Ang quotation (preview = ipi-print). textContent lang; ang data-label ay para sa makitid na screen.
function renderDoc() {
  if (!last) return;
  const { m, r } = last;
  const ready = !!(m.from.name && m.to.name && r.lines.some((l, i) => l.amount !== null && m.items[i].desc));
  el.previewEmpty.hidden = ready;
  el.doc.hidden = !ready;
  if (!ready) { el.doc.replaceChildren(); return; }
  const L = docLabels(docLang());
  el.doc.setAttribute("lang", L.lang);

  const from = node("div", "dFrom");
  from.append(node("p", "dTitle", L.title), node("p", "dBiz", m.from.name));
  if (m.from.contact) from.append(node("p", "dContact", m.from.contact));
  const meta = node("dl", "dMeta");
  const metaRow = (k, v) => { const d = node("div", "dMetaRow"); d.append(node("dt", "", k), node("dd", "", v)); meta.append(d); };
  if (m.quoteNo) metaRow(L.quoteNo, m.quoteNo);
  metaRow(L.date, L.fmtDate(m.date) || DASH);
  if (m.validUntil) metaRow(L.validUntil, L.fmtDate(m.validUntil) || DASH);
  const head = node("header", "dHead");
  head.append(from, meta);

  const to = node("section", "dTo");
  to.append(node("p", "dLabel", L.preparedFor), node("p", "dName", m.to.name));
  if (m.to.contact) to.append(node("p", "dContact", m.to.contact));

  const table = node("table", "dItems");
  const hr = node("tr");
  hr.append(node("th", "cNo", L.colNo), node("th", "", L.colDesc), node("th", "num", L.colQty), node("th", "num", L.colPrice), node("th", "num", L.colAmount));
  const thead = node("thead");
  thead.append(hr);
  const tbody = node("tbody");
  m.items.forEach((it, i) => {
    const ln = r.lines[i];
    const tr = node("tr");
    const cell = (cls, text, label) => { const td = node("td", cls, text); if (label) td.setAttribute("data-label", label); return td; };
    tr.append(cell("cNo", String(i + 1)), cell("cDesc", it.desc || DASH),
      cell("num", ln.qty !== null ? formatQty(ln.qty) : DASH, L.colQty),
      cell("num", ln.price !== null ? formatPeso(ln.price) : DASH, L.colPrice),
      cell("num", ln.amount !== null ? formatPeso(ln.amount) : DASH, L.colAmount));
    tbody.append(tr);
  });
  table.append(thead, tbody);

  const totals = node("div", "dTotals");
  const tot = (label, value, cls) => { const d = node("div", "dTotRow" + (cls ? " " + cls : "")); d.append(node("span", "", label), node("span", "", value)); totals.append(d); };
  tot(L.subtotal, r.subtotal !== null ? formatPeso(r.subtotal) : DASH);
  if (r.discount.mode !== "none") {
    const label = r.discount.mode === "percent" && r.discount.bp !== null ? L.discountPct(formatHundredths(r.discount.bp)) : L.discount;
    tot(label, r.discount.amount !== null ? "-" + formatPeso(r.discount.amount) : DASH);
  }
  tot(L.total, r.total !== null ? formatPeso(r.total) : DASH, "grand");

  const parts = [head, to, table, totals];
  if (m.notes) {
    const notes = node("section", "dNotes");
    notes.append(node("p", "dLabel", L.notes), node("p", "dNotesText", m.notes.replace(/\r\n?/g, "\n")));
    parts.push(notes);
  }
  parts.push(node("p", "dDisc", L.disclaimer));
  el.doc.replaceChildren(...parts);
}

/* ---------- Mga item ---------- */
function relabel() {
  items.forEach((it, i) => {
    it.title.textContent = t("item", i + 1);
    it.removeText.textContent = t("remove");
    it.removeBtn.setAttribute("aria-label", t("removeItem", i + 1));
  });
  const full = items.length >= LIMITS.items;
  el.addItem.disabled = full;
  el.itemsLimit.hidden = !full;
}
function addItem(focus = true) {
  if (items.length >= LIMITS.items) return;
  const seq = ++itemSeq;
  const li = el.tplItem.content.firstElementChild.cloneNode(true);
  const q = (s) => li.querySelector(s);
  const it = { seq, li, title: q(".itemTitle"), removeBtn: q(".removeBtn"), removeText: q(".removeBtn span"),
    desc: q(".iDesc"), qty: q(".iQty"), price: q(".iPrice"), amount: q(".iAmount"), err: { desc: q(".eDesc"), qty: q(".eQty"), price: q(".ePrice") } };
  it.title.id = `it${seq}h`;
  for (const k of ["desc", "qty", "price"]) {
    const lab = q(`label[data-for="${k}"]`);
    it[k].id = `it${seq}${k}`;
    lab.id = `it${seq}${k}L`;
    lab.setAttribute("for", it[k].id);
    it.err[k].id = `it${seq}${k}E`;
    it[k].setAttribute("aria-labelledby", `${it.title.id} ${lab.id}`);
    it[k].setAttribute("aria-describedby", it.err[k].id + (k === "desc" ? "" : " qItemsHint"));
  }
  it.amount.setAttribute("aria-labelledby", it.title.id);
  it.removeBtn.addEventListener("click", () => removeItem(it));
  if (showAll) [it.desc, it.qty, it.price].forEach((f) => fresh.add(f));
  items.push(it);
  el.list.append(li);
  applyStatic(li);
  relabel();
  if (focus) { it.desc.focus(); el.itemsMsg.textContent = t("itemAdded", items.length); }
  update();
}
function removeItem(it) {
  const i = items.indexOf(it);
  if (i < 0) return;
  items.splice(i, 1);
  [it.desc, it.qty, it.price].forEach((f) => { touched.delete(f); fresh.delete(f); });
  it.li.remove();
  relabel();
  const next = items[i] || items[i - 1];
  (next ? next.desc : el.addItem).focus();
  el.itemsMsg.textContent = t("itemRemoved", i + 1);
  update();
}

/* ---------- Diskwento, wika ng quotation ---------- */
function syncDiscount() {
  const mode = discMode();
  el.discRow.hidden = mode === "none";
  el.discLabel.textContent = t(mode === "percent" ? "discPercentLabel" : "discAmountLabel");
}
function onDiscMode() {
  F.discValue.value = ""; // iba ang ibig sabihin ng numero sa P at sa %
  touched.delete(F.discValue);
  syncDiscount();
  update();
}

/* ---------- Save as PDF / Print at Copy as text ---------- */
function firstError(r) {
  const order = [F.bizName, F.bizContact, F.custName, F.custContact, ...items.flatMap((it) => [it.desc, it.qty, it.price]),
    el.addItem, F.discValue, el.totalErr, F.notes, F.date, F.validUntil, F.quoteNo];
  const bad = new Set(r.errors.map((e) => { const tg = target(e.field); return tg && tg[0]; }).filter(Boolean));
  return order.find((x) => bad.has(x)) || null;
}
function prepareOutput() {
  showAll = true;
  fresh.clear(); // sa bawat Save/Copy, ipakita na ang lahat ng kulang
  update();
  const { m, r } = last;
  if (!r.ok) {
    el.summary.textContent = t("fixFields", new Set(r.errors.map((e) => e.field)).size);
    el.summary.hidden = false;
    const f = firstError(r);
    if (f) f.focus();
    return null;
  }
  el.summary.hidden = true;
  flushDoc();
  return { m, r };
}
// Pangalan ng PDF (ginagamit ng Chrome ang title): walang control character at mga bawal sa file name
function fileTitle(m) {
  const raw = `Quotation - ${m.to.name} - ${m.date}`;
  return raw.replace(/[\u0000-\u001F\u007F/\\:*?"<>|]/g, "").replace(/\s+/g, " ").trim().slice(0, 100);
}
function onPrint() {
  if (busy) return;
  setSaveMsg(null);
  const o = prepareOutput();
  if (!o) return;
  if (isInAppBrowser() || typeof window.print !== "function") { setSaveMsg("inAppNote", true); return; }
  document.title = fileTitle(o.m);
  let done = false;
  const restore = () => {
    if (done) return;
    done = true;
    window.removeEventListener("afterprint", restore);
    window.removeEventListener("pointerdown", restore, true);
    window.removeEventListener("keydown", restore, true);
    document.title = t("pageTitle");
    setSaveMsg("printDone");
    showNext();
  };
  window.addEventListener("afterprint", restore);
  try {
    window.print();
  } catch {
    done = true;
    window.removeEventListener("afterprint", restore);
    document.title = t("pageTitle");
    setSaveMsg("printFailed", true);
    return;
  }
  // Sa ilang phone browser, hindi naghihintay ang print(): ibalik ang title sa susunod na galaw ng user
  setTimeout(() => {
    if (done) return;
    window.addEventListener("pointerdown", restore, true);
    window.addEventListener("keydown", restore, true);
  }, 0);
}
async function onCopy() {
  if (busy) return;
  setSaveMsg(null);
  const o = prepareOutput();
  if (!o) return;
  const text = toPlainText(o.m, o.r, docLabels(docLang()));
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
    el.copyBox.hidden = true;
    el.copyArea.value = "";
    setSaveMsg("copied");
    markDone("quote"); // kumpirmadong nakopya
    showNext();
  } else {
    // Walang clipboard (o tinanggihan): ipakita ang text para ma-copy nang mano-mano
    el.copyArea.value = text;
    el.copyBox.hidden = false;
    setSaveMsg("copyFallback");
    el.copyArea.focus();
    el.copyArea.select();
  }
}

/* ---------- Bagong quotation / Umalis (may kumpirmasyon kapag may laman) ---------- */
function resetForm() {
  for (const f of [F.bizName, F.bizContact, F.custName, F.custContact, F.notes, F.quoteNo, F.validUntil, F.discValue]) f.value = "";
  startDate = today();
  F.date.value = startDate;
  for (const r of document.querySelectorAll('input[name="qDiscMode"]')) r.checked = r.value === "none";
  for (const r of document.querySelectorAll('input[name="qDocLang"]')) r.checked = r.value === getLang();
  items.forEach((it) => it.li.remove());
  items = [];
  showAll = false;
  touched.clear();
  fresh.clear();
  el.summary.hidden = true;
  el.copyBox.hidden = true;
  el.copyArea.value = "";
  setSaveMsg(null);
  syncDiscount();
  addItem(false);
  hideNext();
  applyBusinessProfile();
}
// Business Profile: punan lang ang "From" (galing sa user; walang hinuhulaan)
function applyBusinessProfile() {
  const p = readBusinessProfile();
  prefill = { name: p && p.name ? cleanText(p.name, LIMITS.name) : "", contact: p && p.contact ? cleanText(p.contact, LIMITS.contact) : "" };
  if (prefill.name && !F.bizName.value.trim()) F.bizName.value = prefill.name;
  if (prefill.contact && !F.bizContact.value.trim()) F.bizContact.value = prefill.contact;
  el.fromProfile.hidden = !(prefill.name || prefill.contact);
  update();
}
const firstEmpty = () => (F.bizName.value.trim() ? F.custName : F.bizName);
/* ---------- Next step: mungkahi lang, pagkatapos ng totoong kopya o pagsara ng print screen ---------- */
let nextDismissed = false;
function showNext() { if (!nextDismissed) el.next.hidden = false; }
function hideNext() { el.next.hidden = true; nextDismissed = false; }
function closeNext() {
  const hadFocus = el.next.contains(document.activeElement);
  el.next.hidden = true;
  nextDismissed = true;
  if (hadFocus) el.copy.focus();
}
function onNextLink(e) {
  if (e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return; // bagong tab: hayaan ang browser
  e.preventDefault();
  if (leaving) return;
  if (isDirty()) openConfirm("leave", el.nextLink, NEXT_URL);
  else goTo(NEXT_URL);
}
function openConfirm(mode, opener, url = null) {
  confirmMode = mode;
  confirmOpener = opener;
  confirmUrl = url;
  renderConfirm();
  if (!el.dlg.open) { try { el.dlg.showModal(); } catch { el.dlg.setAttribute("open", ""); } }
  el.dlgTitle.focus();
}
function renderConfirm() {
  const leave = confirmMode === "leave";
  el.dlgTitle.textContent = t(leave ? "dlgLeaveTitle" : "dlgNewTitle");
  el.dlgBody.textContent = t(leave ? "dlgLeaveBody" : "dlgNewBody");
  el.dlgOk.textContent = t(leave ? "dlgLeaveOk" : "dlgNewOk");
  el.dlgCancel.textContent = t(leave ? "dlgStay" : "dlgCancel");
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
  if (opener && !leaving && !el.app.hidden) opener.focus();
}
function onConfirmOk() {
  const mode = confirmMode;
  confirmOpener = mode === "new" ? F.bizName : confirmOpener;
  closeConfirm();
  if (mode === "new") { resetForm(); setSaveMsg("cleared"); firstEmpty().focus(); }
  else if (mode === "leave") goTo(confirmUrl || DASHBOARD);
}
function onNew() {
  if (!isDirty()) { resetForm(); setSaveMsg("cleared"); firstEmpty().focus(); return; }
  openConfirm("new", el.newQuote);
}

/* ---------- Pabalik sa Dashboard (walang dagdag na history entry, tulad ng Instant Banner) ---------- */
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
    backFallback = setTimeout(() => location.replace("/dashboard.html"), 2500); // kung hindi umalis ang page
  } else {
    location.replace("/dashboard.html");
  }
}
// Papunta sa ibang tool (hal. Follow-up mula sa next step): umalis nang malinis, tulad ng Back
async function goTo(url) {
  if (url === DASHBOARD) return goDashboard();
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

/* ---------- Wika ng page (sumusunod sa mgpref_lang) ---------- */
function renderHints() {
  for (const p of document.querySelectorAll("[data-limit]")) {
    const k = p.getAttribute("data-limit");
    if (has(LIMITS, k)) p.textContent = t("limit", LIMITS[k]);
  }
}
function refreshText() {
  applyStatic(document);
  renderHints();
  relabel();
  syncDiscount();
  if (confirmMode) renderConfirm();
  setSaveMsg(saveMsgKey, saveMsgErr);
  update();
}

/* ---------- Simula: pagkatapos lang makumpirma ng frozen Auth Core ang login ---------- */
function renderOffline() { el.offlineMsg.hidden = !isOffline(); }
function wire() {
  const form = [...document.querySelectorAll(".qCol")];
  for (const area of form) {
    area.addEventListener("input", (e) => { if (e.target.matches("input, textarea")) update(); });
    area.addEventListener("change", (e) => {
      if (e.target.matches('input[name="qDiscMode"]')) return onDiscMode();
      if (e.target.matches("input:not([type=radio]), textarea")) { touched.add(e.target); fresh.delete(e.target); }
      update();
    });
    area.addEventListener("focusout", (e) => { if (e.target.matches("input:not([type=radio]), textarea") && e.target.value.trim()) { touched.add(e.target); fresh.delete(e.target); update(); } });
  }
  el.addItem.addEventListener("click", () => addItem(true));
  el.savePdf.addEventListener("click", onPrint);
  el.copy.addEventListener("click", onCopy);
  el.newQuote.addEventListener("click", onNew);
  el.copyArea.addEventListener("focus", () => el.copyArea.select());
  el.dlgOk.addEventListener("click", onConfirmOk);
  el.dlgCancel.addEventListener("click", closeConfirm);
  el.dlgClose.addEventListener("click", closeConfirm);
  el.dlg.addEventListener("close", onConfirmClosed);
  el.backLink.addEventListener("click", onBack);
  el.nextLink.addEventListener("click", onNextLink);
  el.nextClose.addEventListener("click", closeNext);
  window.addEventListener("online", renderOffline);
  window.addEventListener("offline", renderOffline);
  // Babala ng browser bago mag-refresh o magsara habang may hindi naka-save na quotation
  window.addEventListener("beforeunload", (e) => {
    if (leaveOnPurpose || !isDirty()) return;
    e.preventDefault();
    e.returnValue = "";
  });
  // Print mula sa menu ng browser (hindi ang button): ipakita ang pinakabagong quotation at ang tamang pangalan ng PDF
  window.addEventListener("beforeprint", () => {
    if (!last) return;
    flushDoc();
    if (last.r.ok && document.title === t("pageTitle")) {
      document.title = fileTitle(last.m);
      window.addEventListener("afterprint", () => { document.title = t("pageTitle"); }, { once: true });
    }
  });
  window.addEventListener("pagehide", () => clearTimeout(backFallback));
  window.addEventListener("pageshow", (e) => {
    if (!e.persisted) return;
    clearTimeout(backFallback);
    leaving = false;
    leaveOnPurpose = false;
    if (guardOff) { guardOff = false; armExitGuard(); }
  });
  watchLang(refreshText);
}
function start() {
  if (started) return;
  started = true;
  applyStatic(document);
  renderHints();
  const inApp = isInAppBrowser();
  el.savePdf.hidden = inApp;
  el.printHint.hidden = inApp;
  el.inAppNote.hidden = !inApp;
  wire();
  resetForm(); // malinis na form (kahit may naibalik ang browser sa mga field)
  renderOffline();
  armExitGuard();
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
  // Hindi ginagamit ang user object: walang pangalan, email o ID na lumalabas sa quotation
  guardDashboard(() => {
    try { start(); } catch { console.error("quote: start failed"); showFatal(); }
  }, { idleMinutes: 60 });
} catch {
  console.error("quote: auth guard failed");
  showFatal();
}
