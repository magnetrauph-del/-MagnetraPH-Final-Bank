// banner-i18n.js - v1.2 - mga salita ng Instant Banner page sa English at Filipino. Walang emoji.
// v1.2 (P1): natural na Taglish (photo, style, size, layout) ayon sa taste audit. Walang binagong English.
// Iisang preference ng wika ng buong app ("mgpref_lang"), sa pamamagitan ng frozen login-i18n.js. Walang bagong storage key.
// Default: Filipino/Taglish kapag wala pang piniling wika (local-state.js appLang); English kapag pinili ito.
// Ang text na tina-type ng user para sa banner ay HINDI dumadaan dito at hindi isinasalin.
import { getLang as prefGetLang } from "./login-i18n.js";
import { appLang } from "./local-state.js?v=2"; // Filipino/Taglish kapag wala pang piniling wika

const en = {
  pageTitle: "MagnetraPH - Instant Banner",
  loading: "Loading Instant Banner",
  loaderOffline: "You're offline. Connect to the internet so we can check your login, then reload.",
  appError: "Something went wrong while opening Instant Banner.",
  reload: "Reload",
  back: "Dashboard",
  backAria: "Back to Dashboard",
  offline: "You're offline. You can still make and save your banner.",
  eyebrow: "Grow",
  title: "Instant Banner",
  tagline: "Choose a style, type your text, then save it as an image.",

  step1: "Choose a style",
  format: "Format",
  fmtSquare: "Square",
  fmtPortrait: "Portrait",
  fmtStory: "Story",
  layout: "Layout",
  layCenter: "Centered",
  laySplit: "Photo on top",
  layCard: "Card",
  theme: "Color",
  thIndigo: "Indigo",
  thLavender: "Lavender",
  thCoral: "Coral",
  thTeal: "Teal",

  step2: "Type your text",
  headline: "Headline",
  detail: "Detail line",
  business: "Business name",
  contact: "Contact line",
  required: "Required",
  optional: "Optional",
  headlinePh: "What do you want to announce?",
  detailPh: "Add a short detail",
  businessPh: "Your shop or business name",
  contactPh: "Phone, page or how to order",
  limit: (n) => `Up to ${n} characters.`,
  headlineErr: "Type a headline first.",

  step3: "Add a photo",
  photoAdd: "Add photo",
  photoChange: "Change photo",
  photoRemove: "Remove photo",
  photoHint: "JPG, PNG or WebP, up to 15 MB. Your photo stays on this device.",
  photoReading: "Opening your photo...",
  photoAdded: "Photo added.",
  photoRemoved: "Photo removed.",
  photoType: "This file isn't a JPG, PNG or WebP photo.",
  photoBig: "This photo is larger than 15 MB. Choose a smaller one.",
  photoPixels: "This photo is too large to open here. Choose a smaller copy.",
  photoBad: "This photo can't be opened. Try another one.",
  photoWait: "Your photo is still opening. Try again in a moment.",

  step4: "Preview and save",
  emptyHint: "Type a headline to see your banner here.",
  previewAria: (f, w, h) => `Banner preview: ${f}, ${w} by ${h} pixels.`,
  save: "Save as PNG",
  saving: "Making your image...",
  saveFail: "Couldn't make the image. Please try again.",
  privacy: "Your text and photo stay on this device. Nothing is uploaded.",

  resultTitle: "Your banner is ready",
  resultAlt: (h) => `Your banner: ${h}`,
  noteDownload: (f) => `Downloading ${f}. If it doesn't appear, tap Download again, or press and hold the image to save it.`,
  noteSame: "Nothing changed since your last save. Tap Download again for another copy, or press and hold the image to save it.",
  noteInApp: "This app's browser may not save files. Press and hold the image to save it, or open magnetra.app in Chrome or Safari.",
  downloadAgain: "Download again",
  done: "Done",
  fromProfile: "Filled in from your Business Profile. You can change or clear them here.",
  nextTitle: "Next step · optional",
  nextText: "When someone asks the price, you can make a clear quotation.",
  nextLink: "Make a quotation",
  close: "Close",
  exitToast: "Tap back again to leave",
};

const fil = {
  pageTitle: "MagnetraPH - Instant Banner",
  loading: "Naglo-load ang Instant Banner",
  loaderOffline: "Offline ka. Kumonekta sa internet para ma-check ang login mo, saka i-reload.",
  appError: "May nangyaring mali habang binubuksan ang Instant Banner.",
  reload: "I-reload",
  back: "Dashboard",
  backAria: "Bumalik sa Dashboard",
  offline: "Offline ka. Puwede ka pa ring gumawa at mag-save ng banner.",
  eyebrow: "Grow",
  title: "Instant Banner",
  tagline: "Piliin ang style, i-type ang text mo, saka i-save bilang image.",

  step1: "Piliin ang style",
  format: "Size",
  fmtSquare: "Square",
  fmtPortrait: "Portrait",
  fmtStory: "Story",
  layout: "Layout",
  layCenter: "Nasa gitna",
  laySplit: "Photo sa taas",
  layCard: "Card",
  theme: "Kulay",
  thIndigo: "Indigo",
  thLavender: "Lavender",
  thCoral: "Coral",
  thTeal: "Teal",

  step2: "I-type ang text mo",
  headline: "Headline",
  detail: "Detalye",
  business: "Pangalan ng business",
  contact: "Contact",
  required: "Kailangan",
  optional: "Opsyonal",
  headlinePh: "Ano ang gusto mong i-promote?",
  detailPh: "Magdagdag ng maikling detalye",
  businessPh: "Pangalan ng tindahan o business mo",
  contactPh: "Numero, page, o paano umorder",
  limit: (n) => `Hanggang ${n} na character.`,
  headlineErr: "Mag-type muna ng headline.",

  step3: "Magdagdag ng photo",
  photoAdd: "Magdagdag ng photo",
  photoChange: "Palitan ang photo",
  photoRemove: "Alisin ang photo",
  photoHint: "JPG, PNG o WebP, hanggang 15 MB. Nasa device mo lang ang photo.",
  photoReading: "Binubuksan ang photo...",
  photoAdded: "Naidagdag ang photo.",
  photoRemoved: "Naalis ang photo.",
  photoType: "Hindi JPG, PNG o WebP na photo ang file na ito.",
  photoBig: "Lampas 15 MB ang photo na ito. Pumili ng mas maliit.",
  photoPixels: "Masyadong malaki ang photo para mabuksan dito. Pumili ng mas maliit na kopya.",
  photoBad: "Hindi mabuksan ang photo na ito. Subukan ang iba.",
  photoWait: "Binubuksan pa ang photo. Subukan ulit maya-maya.",

  step4: "Tingnan at i-save",
  emptyHint: "Mag-type ng headline para makita dito ang banner mo.",
  previewAria: (f, w, h) => `Preview ng banner: ${f}, ${w} by ${h} pixels.`,
  save: "I-save bilang PNG",
  saving: "Ginagawa na ang banner mo...",
  saveFail: "Hindi nagawa ang banner. Subukan ulit.",
  privacy: "Nasa device mo lang ang text at photo mo. Walang ina-upload.",

  resultTitle: "Handa na ang banner mo",
  resultAlt: (h) => `Ang banner mo: ${h}`,
  noteDownload: (f) => `Dina-download ang ${f}. Kung hindi lumabas, pindutin ang I-download ulit, o pindutin nang matagal ang banner para i-save.`,
  noteSame: "Walang nagbago mula sa huling save mo. Pindutin ang I-download ulit para sa isa pang kopya, o pindutin nang matagal ang banner para i-save.",
  noteInApp: "Baka hindi makapag-save ng file ang browser ng app na ito. Pindutin nang matagal ang banner para i-save, o buksan ang magnetra.app sa Chrome o Safari.",
  downloadAgain: "I-download ulit",
  done: "Tapos na",
  fromProfile: "Galing sa Business Profile mo. Puwede mo itong palitan o burahin dito.",
  nextTitle: "Next step · opsyonal",
  nextText: "Kapag may nagtanong ng presyo, puwede kang gumawa ng malinaw na quotation.",
  nextLink: "Gumawa ng quotation",
  close: "Isara",
  exitToast: "Pindutin ulit ang Back para umalis",
};

export const STRINGS = Object.freeze({ en: Object.freeze(en), fil: Object.freeze(fil) });
const has = (o, k) => o != null && Object.prototype.hasOwnProperty.call(o, k);

let fromOtherTab = null; // wikang pinili sa ibang tab; binabasa lang, hindi isinusulat ulit sa storage
const atLoad = appLang(prefGetLang()); // wika sa pagbukas ng page (pinili ng user, o Filipino/Taglish kapag wala pa)
export const getLang = () => {
  const l = fromOtherTab ?? atLoad;
  return has(STRINGS, l) ? l : "fil";
};

// Kapag pinalitan ang wika sa ibang tab (hal. sa Settings ng Dashboard), sundan ito nang walang reload.
// Ang frozen login-i18n.js pa rin ang may-ari ng "mgpref_lang"; dito binabasa lang ang storage event (walang isinusulat).
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

// Isinasalin ang mga elementong may data-i18n (text), data-i18n-ph (placeholder) at data-i18n-aria (aria-label)
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
