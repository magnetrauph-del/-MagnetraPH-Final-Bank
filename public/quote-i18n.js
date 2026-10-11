// quote-i18n.js - v1.2 - mga salita ng Quotes page (English at Filipino) at mga label ng quotation mismo. Walang emoji.
// v1.2 (P1): natural na Taglish sa UI (hindi binago ang mga label ng quotation mismo), at tapat na privacy line
// (tinatandaan sa tab ang customer, unang item at total para sa Follow-up).
// Iisang preference ng wika ng buong app ("mgpref_lang") sa pamamagitan ng frozen login-i18n.js. Walang bagong storage key.
// Default: Filipino/Taglish kapag wala pang piniling wika (local-state.js appLang); English kapag pinili ito.
// Ang wika ng quotation (docLabels) ay hiwalay sa wika ng page: pinipili ito ng user para sa customer.
// Ang tina-type ng user ay HINDI dumadaan dito at hindi isinasalin.
import { getLang as prefGetLang } from "./login-i18n.js";
import { appLang } from "./local-state.js?v=2"; // Filipino/Taglish kapag wala pang piniling wika

const en = {
  pageTitle: "MagnetraPH - Quotes",
  loaderOffline: "You're offline. Connect to the internet so we can check your login, then reload.",
  appError: "Something went wrong while opening Quotes.",
  reload: "Reload",
  back: "Dashboard",
  backAria: "Back to Dashboard",
  offline: "You're offline. You can still make, save and copy your quote.",
  eyebrow: "Sell",
  title: "Quotes",
  tagline: "Make a clear quotation, then save it as PDF or copy it as text.",
  required: "Required",
  optional: "Optional",
  limit: (n) => `Up to ${n} characters.`,

  s1: "From (your business)",
  bizName: "Business name",
  bizContact: "Contact (phone, email or page)",
  s2: "To (customer)",
  custName: "Customer or company name",
  custContact: "Customer contact",
  s3: "Items",
  itemsHint: "Quantity: up to 2 decimals. Unit price in pesos, like 1500 or 1,500.50. \u20B10.00 is fine for a free item.",
  item: (n) => `Item ${n}`,
  desc: "Description",
  qty: "Quantity",
  price: "Unit price (\u20B1)",
  amount: "Amount",
  remove: "Remove",
  removeItem: (n) => `Remove item ${n}`,
  addItem: "Add item",
  maxItems: "You can add up to 30 items.",
  itemAdded: (n) => `Item ${n} added.`,
  itemRemoved: (n) => `Item ${n} removed.`,
  s4: "Discount and total",
  discount: "Discount",
  discNone: "None",
  discAmount: "Amount (\u20B1)",
  discPercent: "Percent (%)",
  discAmountLabel: "Discount amount (\u20B1)",
  discPercentLabel: "Discount percent (%)",
  subtotal: "Subtotal",
  total: "Total",
  totalPending: "Enter a quantity and price for each item to see the total.",
  totalCheck: "Check the highlighted items.",
  totalLive: (v) => `Total ${v}`,
  s5: "Notes and details",
  notes: "Notes & terms",
  notesHint: "Delivery, payment terms or other details, in your own words. Up to 600 characters.",
  date: "Quote date",
  validUntil: "Valid until",
  quoteNo: "Quote no.",
  quoteNoHint: "Your own reference. Up to 30 characters.",
  docLang: "Quote language",
  langEn: "English",
  langFil: "Filipino",
  s6: "Preview and save",
  emptyPreview: "Your quote preview appears here.",
  emptyPreviewHint: "Add your business name, the customer and one complete item.",
  previewAria: "Quote preview",
  savePdf: "Save as PDF / Print",
  copyText: "Copy as text",
  newQuote: "New quote",
  printHint: "In the print screen, choose Save as PDF. On iPhone, tap Share, then Save to Files.",
  inAppNote: "This app's browser can't save PDFs. Open magnetra.app in Chrome or Safari to save as PDF. Copy as text still works here.",
  printDone: "Print screen closed. Saved PDFs usually go to Downloads or Files.",
  printFailed: "Couldn't open the print screen. Try again, or use Copy as text.",
  copied: "Quote copied. You can paste it in Messenger or Viber.",
  copyFallback: "Copying isn't available here. Select the text below and copy it.",
  copyArea: "Quote text",
  fixFields: (n) => (n === 1 ? "Fix 1 field to continue." : `Fix ${n} fields to continue.`),
  privacy: "Your quote stays on this device. Nothing is uploaded. After you copy or open Print, this tab keeps the customer, first item and total for Follow-up for up to 12 hours (less if you close the tab, log out or tap Remove).",
  cleared: "Started a new quote.",
  fromProfile: "Filled in from your Business Profile. You can change them here.",
  nextTitle: "Next step · optional",
  nextClose: "Close suggestion",
  nextText: "When you've sent this quotation, you can follow up later with a ready message.",
  nextLink: "Make a follow-up message",
  close: "Close",
  exitToast: "Tap back again to leave",
  exitDirty: "Tap back again to leave. This quote isn't saved.",
  dlgNewTitle: "Clear this quote?",
  dlgNewBody: "Everything you typed will be removed. Nothing is saved.",
  dlgNewOk: "Clear",
  dlgLeaveTitle: "Leave this quote?",
  dlgLeaveBody: "It isn't saved. If you leave, what you typed will be removed.",
  dlgLeaveOk: "Leave",
  dlgStay: "Stay",
  dlgCancel: "Cancel",

  errBizName: "Enter your business name.",
  errCustName: "Enter the customer or company name.",
  errLong: (n) => `Use up to ${n} characters.`,
  errItems: "Add at least one item.",
  errTooMany: "A quote can have up to 30 items.",
  errDesc: "Describe this item.",
  errQtyEmpty: "Enter a quantity.",
  errQty: "Enter a quantity above 0, like 1 or 2.5.",
  errQtyMax: "Quantity can be up to 99,999.99.",
  errPriceEmpty: "Enter a price. \u20B10.00 is fine for a free item.",
  errPrice: "Enter a price like 1500 or 1,500.50.",
  errPriceMax: "Price can be up to \u20B19,999,999.99.",
  errDecimals: "Use up to 2 decimals.",
  errNegative: "Negative numbers aren't allowed. Use Discount to lower the total.",
  errTooLarge: "This total is too large for a quote.",
  errDiscEmpty: "Enter the discount, or choose None.",
  errDiscAmount: "Enter a discount like 100 or 150.50.",
  errDiscMin: "Enter a discount above 0.",
  errDiscOver: "Discount can't be more than the subtotal.",
  errDiscPct: "Enter a percent from 0.01 to 100.",
  errDate: "Enter a valid date.",
  errDateEmpty: "Enter the quote date.",
  errBeforeDate: "Valid until can't be before the quote date.",
};

const fil = {
  pageTitle: "MagnetraPH - Quotation",
  loaderOffline: "Offline ka. Kumonekta sa internet para ma-check ang login mo, saka i-reload.",
  appError: "May nangyaring mali habang binubuksan ang Quotation.",
  reload: "I-reload",
  back: "Dashboard",
  backAria: "Bumalik sa Dashboard",
  offline: "Offline ka. Puwede ka pa ring gumawa, mag-save at mag-copy ng quotation.",
  eyebrow: "Sell",
  title: "Quotation",
  tagline: "Gumawa ng malinaw na quotation, saka i-save bilang PDF o kopyahin bilang text.",
  required: "Kailangan",
  optional: "Opsyonal",
  limit: (n) => `Hanggang ${n} na character.`,

  s1: "Mula sa (business mo)",
  bizName: "Pangalan ng business",
  bizContact: "Contact (numero, email o page)",
  s2: "Para kay (customer)",
  custName: "Pangalan ng customer o kumpanya",
  custContact: "Contact ng customer",
  s3: "Mga item",
  itemsHint: "Dami: hanggang 2 decimal. Presyo bawat isa sa piso, gaya ng 1500 o 1,500.50. Puwede ang \u20B10.00 sa libreng item.",
  item: (n) => `Item ${n}`,
  desc: "Deskripsyon",
  qty: "Dami",
  price: "Presyo bawat isa (\u20B1)",
  amount: "Halaga",
  remove: "Alisin",
  removeItem: (n) => `Alisin ang item ${n}`,
  addItem: "Magdagdag ng item",
  maxItems: "Hanggang 30 item lang ang puwede.",
  itemAdded: (n) => `Naidagdag ang item ${n}.`,
  itemRemoved: (n) => `Naalis ang item ${n}.`,
  s4: "Diskwento at kabuuan",
  discount: "Diskwento",
  discNone: "Wala",
  discAmount: "Halaga (\u20B1)",
  discPercent: "Porsyento (%)",
  discAmountLabel: "Halaga ng diskwento (\u20B1)",
  discPercentLabel: "Porsyento ng diskwento (%)",
  subtotal: "Subtotal",
  total: "Kabuuan",
  totalPending: "Ilagay ang dami at presyo ng bawat item para makita ang kabuuan.",
  totalCheck: "Tingnan ang mga naka-highlight na item.",
  totalLive: (v) => `Kabuuan ${v}`,
  s5: "Notes at detalye",
  notes: "Notes at terms",
  notesHint: "Delivery, bayad o iba pang detalye, sa sarili mong salita. Hanggang 600 na character.",
  date: "Petsa ng quotation",
  validUntil: "Valid hanggang",
  quoteNo: "Quotation no.",
  quoteNoHint: "Sarili mong reference. Hanggang 30 na character.",
  docLang: "Wika ng quotation",
  langEn: "English",
  langFil: "Filipino",
  s6: "Tingnan at i-save",
  emptyPreview: "Dito lalabas ang preview ng quotation mo.",
  emptyPreviewHint: "Ilagay ang pangalan ng business, ang customer at isang kumpletong item.",
  previewAria: "Preview ng quotation",
  savePdf: "I-save bilang PDF / I-print",
  copyText: "Kopyahin bilang text",
  newQuote: "Bagong quotation",
  printHint: "Sa print screen, piliin ang Save as PDF. Sa iPhone, pindutin ang Share, saka Save to Files.",
  inAppNote: "Hindi makapag-save ng PDF ang browser ng app na ito. Buksan ang magnetra.app sa Chrome o Safari para mag-save ng PDF. Gumagana pa rin dito ang Kopyahin bilang text.",
  printDone: "Nagsara ang print screen. Kadalasan, nasa Downloads o Files ang na-save na PDF.",
  printFailed: "Hindi mabuksan ang print screen. Subukan ulit, o gamitin ang Kopyahin bilang text.",
  copied: "Nakopya ang quotation. Puwede mo na itong i-paste sa Messenger o Viber.",
  copyFallback: "Hindi puwedeng mag-copy dito. Piliin ang text sa ibaba at kopyahin ito.",
  copyArea: "Text ng quotation",
  fixFields: (n) => `Ayusin ang ${n} na field para magpatuloy.`,
  privacy: "Nasa device mo lang ang quotation. Walang ina-upload. Pagka-copy o pagbukas ng Print, tatandaan ng tab na ito ang customer, unang item at total para sa Follow-up nang hanggang 12 oras (mas maaga kung isinara ang tab, nag-log out, o pinindot ang Alisin).",
  cleared: "Nagsimula ng bagong quotation.",
  fromProfile: "Galing sa Business Profile mo. Puwede mo itong palitan dito.",
  nextTitle: "Next step · opsyonal",
  nextClose: "Isara ang suggestion",
  nextText: "Kapag naipadala mo na ang quotation, puwede kang mag-follow up gamit ang handang mensahe.",
  nextLink: "Gumawa ng follow-up na mensahe",
  close: "Isara",
  exitToast: "Pindutin ulit ang Back para umalis",
  exitDirty: "Pindutin ulit ang Back para umalis. Hindi naka-save ang quotation na ito.",
  dlgNewTitle: "Burahin ang quotation na ito?",
  dlgNewBody: "Mabubura ang lahat ng tina-type mo. Walang naka-save.",
  dlgNewOk: "Burahin",
  dlgLeaveTitle: "Iwan ang quotation na ito?",
  dlgLeaveBody: "Hindi ito naka-save. Kapag umalis ka, mabubura ang tina-type mo.",
  dlgLeaveOk: "Umalis",
  dlgStay: "Dito lang muna",
  dlgCancel: "Huwag na",

  errBizName: "Ilagay ang pangalan ng business mo.",
  errCustName: "Ilagay ang pangalan ng customer o kumpanya.",
  errLong: (n) => `Hanggang ${n} na character lang.`,
  errItems: "Magdagdag ng kahit isang item.",
  errTooMany: "Hanggang 30 item lang ang puwede sa isang quotation.",
  errDesc: "I-type kung ano ang item.",
  errQtyEmpty: "Ilagay ang dami.",
  errQty: "Ilagay ang dami na higit sa 0, gaya ng 1 o 2.5.",
  errQtyMax: "Hanggang 99,999.99 lang ang dami.",
  errPriceEmpty: "Ilagay ang presyo. Puwede ang \u20B10.00 sa libreng item.",
  errPrice: "Ilagay ang presyo gaya ng 1500 o 1,500.50.",
  errPriceMax: "Hanggang \u20B19,999,999.99 lang ang presyo.",
  errDecimals: "Hanggang 2 decimal lang.",
  errNegative: "Hindi puwede ang negative na numero. Gamitin ang Diskwento para bumaba ang total.",
  errTooLarge: "Masyadong malaki ang kabuuan para sa isang quotation.",
  errDiscEmpty: "Ilagay ang diskwento, o piliin ang Wala.",
  errDiscAmount: "Ilagay ang diskwento gaya ng 100 o 150.50.",
  errDiscMin: "Ilagay ang diskwento na higit sa 0.",
  errDiscOver: "Hindi puwedeng mas malaki ang diskwento sa subtotal.",
  errDiscPct: "Ilagay ang porsyento mula 0.01 hanggang 100.",
  errDate: "Maglagay ng tamang petsa.",
  errDateEmpty: "Ilagay ang petsa ng quotation.",
  errBeforeDate: "Hindi puwedeng mas maaga sa petsa ng quotation ang valid hanggang.",
};

// Mga label ng quotation mismo (sa napiling wika ng quotation)
const MONTHS = {
  en: ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"],
  fil: ["Enero", "Pebrero", "Marso", "Abril", "Mayo", "Hunyo", "Hulyo", "Agosto", "Setyembre", "Oktubre", "Nobyembre", "Disyembre"],
};
const DOC = {
  en: {
    title: "QUOTATION", quoteNo: "Quote no.", date: "Date", validUntil: "Valid until", from: "From", preparedFor: "Prepared for",
    items: "Items", colNo: "#", colDesc: "Description", colQty: "Qty", colPrice: "Unit price", colAmount: "Amount",
    subtotal: "Subtotal", discount: "Discount", discountPct: (p) => `Discount (${p}%)`, total: "Total", notes: "Notes & terms",
    disclaimer: "This is a price quotation. It is not an invoice or official receipt.",
  },
  fil: {
    title: "QUOTATION", quoteNo: "Quotation no.", date: "Petsa", validUntil: "Valid hanggang", from: "Mula sa", preparedFor: "Para kay",
    items: "Mga item", colNo: "#", colDesc: "Deskripsyon", colQty: "Dami", colPrice: "Presyo bawat isa", colAmount: "Halaga",
    subtotal: "Subtotal", discount: "Diskwento", discountPct: (p) => `Diskwento (${p}%)`, total: "Kabuuan", notes: "Mga tala at kondisyon",
    disclaimer: "Ito ay quotation ng presyo. Hindi ito invoice o opisyal na resibo.",
  },
};

export const STRINGS = Object.freeze({ en: Object.freeze(en), fil: Object.freeze(fil) });
export const DOC_LANGS = Object.freeze(["en", "fil"]);
const has = (o, k) => o != null && Object.prototype.hasOwnProperty.call(o, k);

let fromOtherTab = null; // wikang pinili sa ibang tab; binabasa lang, hindi isinusulat ulit sa storage
const atLoad = appLang(prefGetLang()); // wika sa pagbukas ng page (pinili ng user, o Filipino/Taglish kapag wala pa)
export const getLang = () => {
  const l = fromOtherTab ?? atLoad;
  return has(STRINGS, l) ? l : "fil";
};
// Kapag pinalitan ang wika sa ibang tab (hal. sa Settings ng Dashboard), sundan ito nang walang reload
export function watchLang(onChange) {
  window.addEventListener("storage", (e) => {
    if (e.key !== "mgpref_lang" || !has(STRINGS, e.newValue) || e.newValue === getLang()) return;
    fromOtherTab = e.newValue;
    onChange(getLang());
  });
}

function lookup(key) {
  const cur = STRINGS[getLang()];
  if (has(cur, key)) return cur[key];
  if (has(STRINGS.en, key)) return STRINGS.en[key];
  return undefined;
}
// t("limit", 60). Walang salin kahit sa English: "" (hindi ang pangalan ng key).
export function t(key, ...args) {
  const v = lookup(key);
  if (v === undefined) return "";
  return typeof v === "function" ? v(...args) : v;
}

// "2026-10-02" -> "October 2, 2026" / "Oktubre 2, 2026" (sariling buwan; hindi Intl)
export function formatDate(lang, iso) {
  const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(String(iso || ""));
  if (!m) return "";
  const names = MONTHS[has(MONTHS, lang) ? lang : "en"];
  return `${names[Number(m[2]) - 1]} ${Number(m[3])}, ${m[1]}`;
}
// Lahat ng label ng quotation sa isang wika, kasama ang fmtDate (para sa preview, print at text)
export function docLabels(lang) {
  const l = has(DOC, lang) ? lang : "en";
  return Object.freeze({ ...DOC[l], lang: l, fmtDate: (iso) => formatDate(l, iso) });
}

// Isinasalin ang data-i18n (text), data-i18n-ph (placeholder) at data-i18n-aria (aria-label)
export function applyStatic(root = document) {
  if (root && root.nodeType === 9) {
    root.documentElement.lang = getLang();
    root.title = t("pageTitle");
  }
  const swap = (attr, read, write) => {
    for (const n of root.querySelectorAll(`[${attr}]`)) {
      const store = attr + "-default";
      if (!n.hasAttribute(store)) n.setAttribute(store, read(n) ?? "");
      const v = lookup(n.getAttribute(attr));
      write(n, typeof v === "string" ? v : n.getAttribute(store));
    }
  };
  swap("data-i18n", (n) => n.textContent, (n, v) => { n.textContent = v; });
  swap("data-i18n-ph", (n) => n.getAttribute("placeholder"), (n, v) => { n.setAttribute("placeholder", v); });
  swap("data-i18n-aria", (n) => n.getAttribute("aria-label"), (n, v) => { n.setAttribute("aria-label", v); });
}
