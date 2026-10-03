// followup-i18n.js - v1 - mga salita ng Follow-up Messages page (English at Filipino). Walang emoji.
// Iisang preference ng wika ng buong app ("mgpref_lang") sa pamamagitan ng frozen login-i18n.js; binabasa lang. Walang bagong storage key.
// Ang wika ng MESSAGE (Taglish, Filipino, English) ay hiwalay at nasa followup-templates.js; hindi ito nagbabago kapag
// pinalitan ang wika ng page. Ang tina-type ng user ay HINDI dumadaan dito at hindi isinasalin.
import { getLang as prefGetLang } from "./login-i18n.js";

const en = {
  pageTitle: "MagnetraPH - Follow-up Messages",
  loaderOffline: "You're offline. Connect to the internet so we can check your login, then reload.",
  appError: "Something went wrong while opening Follow-up Messages.",
  reload: "Reload",
  back: "Dashboard",
  backAria: "Back to Dashboard",
  offline: "You're offline. You can still make and copy your message.",
  eyebrow: "Customers",
  title: "Follow-up Messages",
  tagline: "What do I say next? Choose, copy, send.",
  required: "Required",
  optional: "Optional",
  limit: (n) => `Up to ${n} characters.`,
  close: "Close",

  s1: "What happened?",
  "sit.inquiry": "They asked (info or price)",
  "sit.quote-sent": "You sent a quotation",
  "sit.thinking": "They said: \"Let me think about it\"",
  "sit.no-reply": "They stopped replying",
  "sit.thank-you": "They already bought",

  s2: "Your message",
  msgLang: "Message language",
  emptyTitle: "Your message appears here.",
  emptyText: "Choose what happened in step 1 first.",
  msgLabel: "Message (you can edit it)",
  version: (n, tone) => `Version ${n} of 2 · ${tone}`,
  tone1: "Warm & caring",
  tone2: "Simple & direct",
  editKept: "You edited the message, so we didn't replace it.",
  useNew: "Use the new details",
  copy: "Copy",
  share: "Share",
  other: "Other version",
  copyArea: "Message text",

  s3: "Make it more personal",
  name: "Customer's name",
  product: "Product or service",
  detail: "Detail to mention",
  detailHint: (n) => `For example a price, delivery or validity. Added as its own sentence. Up to ${n} characters.`,
  sender: "Your name (sign-off)",
  senderHint: (n) => `You type this; it's never taken from your account. Up to ${n} characters.`,

  newMsg: "New message",
  privacy: "The message and your customer's name stay on this device. MagnetraPH doesn't save or send anything.",

  ready: "Your message is ready.",
  copied: "Copied. Paste it in your customer's chat, then send it.",
  copyFallback: "Copying isn't available here. Select the text below and copy it.",
  shared: "Passed to the app you chose. You send it from there.",
  shareCancelled: "Sharing was cancelled. You can still copy the message.",
  shareFailed: "Couldn't share here. Use Copy instead.",
  emptyMsg: "The message is empty. Type something first, or tap Other version.",
  versionShown: (n, tone) => `Showing version ${n}: ${tone}.`,
  rebuilt: "Message updated with the new details.",
  newDone: "New message. Choose what happened in step 1.",

  nextTitle: "Next step (optional)",
  nextClose: "Close suggestion",
  "next.inquiry": "If they ask for a detailed price, you can make a quotation.",
  "next.quote-sent": "If they want changes, make a new quotation.",
  "next.thinking": "One follow-up is enough for now. Let them decide.",
  "next.no-reply": "If there's still no reply, that's okay. No need to keep repeating it.",
  "next.thank-you": "Have a new product or promo? Make a banner for your next customer.",
  "nextLink.quote": "Make a quotation",
  "nextLink.banner": "Make a banner",

  restText: "Water break? We can pick this up when you're ready.",
  restCopyFirst: "Copy your message first before you rest.",
  restOk: "Okay",
  restGo: "I'll keep going",

  exitToast: "Tap back again to leave",
  exitDirty: "Tap back again to leave. Your edited message isn't copied yet.",
  dlgReplaceTitle: "Replace your edited message?",
  dlgReplaceBody: "Your changes to the message will be lost.",
  dlgReplaceOk: "Replace",
  dlgKeep: "Keep editing",
  dlgNewTitle: "Start a new message?",
  dlgNewBody: "Your edited message hasn't been copied yet. It will be cleared, along with the customer's name, product and detail.",
  dlgNewOk: "New message",
  dlgLeaveTitle: "Leave this message?",
  dlgLeaveBody: "Your edited message hasn't been copied yet. If you leave, it will be removed.",
  dlgLeaveOk: "Leave",
  dlgStay: "Stay",
  dlgCancel: "Cancel",
};

const fil = {
  pageTitle: "MagnetraPH - Follow-up Messages",
  loaderOffline: "Offline ka. Kumonekta sa internet para ma-check ang login mo, saka i-reload.",
  appError: "May nangyaring mali habang binubuksan ang Follow-up Messages.",
  reload: "I-reload",
  back: "Dashboard",
  backAria: "Bumalik sa Dashboard",
  offline: "Offline ka. Puwede ka pa ring gumawa at kumopya ng message.",
  eyebrow: "Customers",
  title: "Follow-up Messages",
  tagline: "Ano ang sasabihin ko next? Pumili, kopyahin, i-send.",
  required: "Kailangan",
  optional: "Opsyonal",
  limit: (n) => `Hanggang ${n} na letra.`,
  close: "Isara",

  s1: "Ano ang nangyari?",
  "sit.inquiry": "Nagtanong sila (info o presyo)",
  "sit.quote-sent": "Pinadalhan mo ng quotation",
  "sit.thinking": "Sabi nila: \"Pag-iisipan ko muna\"",
  "sit.no-reply": "Hindi na sila nag-reply",
  "sit.thank-you": "Nakabili na sila",

  s2: "Ang message mo",
  msgLang: "Wika ng message",
  emptyTitle: "Dito lalabas ang message mo.",
  emptyText: "Pumili muna ng nangyari sa step 1.",
  msgLabel: "Message (puwede mong i-edit)",
  version: (n, tone) => `Version ${n} sa 2 · ${tone}`,
  tone1: "Magiliw at maalaga",
  tone2: "Simple at diretso",
  editKept: "Na-edit mo ang message, kaya hindi namin ito pinalitan.",
  useNew: "Gamitin ang bagong detalye",
  copy: "Kopyahin",
  share: "I-share",
  other: "Ibang version",
  copyArea: "Text ng message",

  s3: "Gawing mas personal",
  name: "Pangalan ng customer",
  product: "Produkto o serbisyo",
  detail: "Detalye na babanggitin",
  detailHint: (n) => `Hal. presyo, delivery o hanggang kailan valid. Idadagdag bilang hiwalay na pangungusap. Hanggang ${n} na letra.`,
  sender: "Pangalan mo (pirma)",
  senderHint: (n) => `Ikaw ang magta-type nito; hindi ito kinukuha sa account mo. Hanggang ${n} na letra.`,

  newMsg: "Bagong message",
  privacy: "Nasa device mo lang ang message at pangalan ng customer. Walang sine-save o ipinapadala ang MagnetraPH.",

  ready: "Handa na ang message.",
  copied: "Nakopya na. I-paste sa chat ng customer mo, saka i-send.",
  copyFallback: "Hindi puwedeng mag-copy dito. Piliin ang text sa ibaba at kopyahin ito.",
  shared: "Naipasa na sa app na pinili mo. Doon mo ito ise-send.",
  shareCancelled: "Hindi itinuloy ang pag-share. Puwede mo pa ring kopyahin ang message.",
  shareFailed: "Hindi ma-share dito. Gamitin ang Kopyahin.",
  emptyMsg: "Walang laman ang message. Mag-type muna, o pindutin ang Ibang version.",
  versionShown: (n, tone) => `Version ${n} ang ipinapakita: ${tone}.`,
  rebuilt: "Na-update ang message gamit ang bagong detalye.",
  newDone: "Bagong message. Pumili ng nangyari sa step 1.",

  nextTitle: "Susunod na hakbang (opsyonal)",
  nextClose: "Isara ang suggestion",
  "next.inquiry": "Kung hihingi sila ng detalyadong presyo, puwede kang gumawa ng quotation.",
  "next.quote-sent": "Kung may babaguhin sila, gumawa ng bagong quotation.",
  "next.thinking": "Isang follow-up lang muna. Hayaan natin silang magdesisyon.",
  "next.no-reply": "Kung wala pa ring sagot, okay lang. Hindi kailangang ulit-ulitin.",
  "next.thank-you": "May bago kang produkto o promo? Gumawa ng banner para sa susunod mong customer.",
  "nextLink.quote": "Gumawa ng quotation",
  "nextLink.banner": "Gumawa ng banner",

  restText: "Water muna? Puwede nating ituloy kapag ready ka na.",
  restCopyFirst: "Kopyahin muna ang message bago magpahinga.",
  restOk: "Sige",
  restGo: "Tuloy lang ako",

  exitToast: "Pindutin ulit ang Back para umalis",
  exitDirty: "Pindutin ulit ang Back para umalis. Hindi pa nakokopya ang na-edit mong message.",
  dlgReplaceTitle: "Palitan ang na-edit mong message?",
  dlgReplaceBody: "Mawawala ang mga binago mo sa message.",
  dlgReplaceOk: "Palitan",
  dlgKeep: "Huwag muna",
  dlgNewTitle: "Magsimula ng bagong message?",
  dlgNewBody: "Hindi pa nakokopya ang na-edit mong message. Mabubura ito, pati ang pangalan ng customer, produkto at detalye.",
  dlgNewOk: "Bagong message",
  dlgLeaveTitle: "Iwan ang message na ito?",
  dlgLeaveBody: "Hindi pa nakokopya ang na-edit mong message. Kapag umalis ka, mabubura ito.",
  dlgLeaveOk: "Umalis",
  dlgStay: "Manatili",
  dlgCancel: "Kanselahin",
};

export const STRINGS = Object.freeze({ en: Object.freeze(en), fil: Object.freeze(fil) });
const has = (o, k) => o != null && Object.prototype.hasOwnProperty.call(o, k);

let fromOtherTab = null; // wikang pinili sa ibang tab; binabasa lang, hindi isinusulat ulit sa storage
export const getLang = () => {
  const l = fromOtherTab ?? prefGetLang();
  return has(STRINGS, l) ? l : "en";
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
// t("limit", 40). Walang salin kahit sa English: "" (hindi ang pangalan ng key).
export function t(key, ...args) {
  const v = lookup(key);
  if (v === undefined) return "";
  return typeof v === "function" ? v(...args) : v;
}

// Isinasalin ang data-i18n (text) at data-i18n-aria (aria-label)
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
  swap("data-i18n-aria", (n) => n.getAttribute("aria-label"), (n, v) => { n.setAttribute("aria-label", v); });
}
