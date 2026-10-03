// dashboard-i18n.js - v1 (Phase 3) - mga salita ng Dashboard sa English at Filipino. Walang emoji.
// ANONG TEXT ang ipapakita lang ito (C3). Walang network, Firebase, login, API, AI, data o presyo.
// Ang napiling wika ay iisa sa buong app: "mgpref_lang", na hawak ng frozen login-i18n.js.
// Dito ay getLang/setLang lang ang kinukuha roon (walang kopya ng Login logic, walang bagong storage key).
// Kapag may kulang na salin: English; kapag wala pa rin: ang orihinal na text sa HTML (hindi ang key).
import { getLang as prefGetLang, setLang as prefSetLang } from "./login-i18n.js";

const has = (o, k) => o != null && Object.prototype.hasOwnProperty.call(o, k);

const en = {
  pageTitle: "MagnetraPH - Dashboard",
  loading: "Loading your dashboard",
  loadingSlow: "Still loading. Check your connection, then reload.",
  reload: "Reload",
  retry: "Try again",
  close: "Close",
  appError: "Something went wrong while loading your dashboard.",
  generic: "Something went wrong. Please try again.",
  offline: "You're offline. Some actions need a connection.",
  offlineNothingChanged: "You're offline. Nothing was changed.",
  exitToast: "Tap back again to exit",

  greetMorning: "Good morning",
  greetAfternoon: "Good afternoon",
  greetEvening: "Good evening",
  greetHello: "Hello",
  tagline: "All your business tools, in one tap.",

  askTitle: "Ask Magnetra",
  askLabel: "What do you want to get done?",
  askPh: "Try: quote, banner",
  find: "Find",
  askEmpty: "Type a word, like quote or banner.",
  askNone: "No match yet. Try another word, or browse the tools below.",
  askCount: (n) => (n === 1 ? "1 match" : `${n} matches`),

  quickTitle: "Quick actions",
  toolsTitle: "Your tools",
  groupTools: "Tools",
  growName: "Grow",
  growDesc: "Get noticed and bring in customers.",
  sellName: "Sell",
  sellDesc: "Turn interest into orders.",
  customersName: "Customers",
  customersDesc: "Keep customers coming back.",
  runName: "Run",
  runDesc: "Keep the business organized.",
  soon: "Coming soon",
  groupReady: (n) => `${n} ready`,

  nextTitle: "Next steps",
  resultsTitle: "Results",
  resultsEmpty: "Your business results will appear here.",
  resultsEmptyText: "Once you start using Magnetra's tools, your real progress will show here.",
  achTitle: "Achievements",

  "tool.marketing-studio": "Marketing Studio",
  "tool.marketing-studio.desc": "Make and organize your marketing in one place.",
  "tool.instant-banner": "Instant Banner",
  "tool.instant-banner.desc": "Make a simple banner for your shop.",
  "tool.content-repurposer": "Content Repurposer",
  "tool.content-repurposer.desc": "Turn one post into several.",
  "tool.video-ads": "Video Ads",
  "tool.video-ads.desc": "Short video ads for your products.",
  "tool.quotes": "Quotes",
  "tool.quotes.desc": "Send a clear quotation to a customer.",
  "tool.proposals": "Proposals",
  "tool.proposals.desc": "Write a simple proposal for a client.",
  "tool.catalogs": "Catalogs",
  "tool.catalogs.desc": "Show your products in one list.",
  "tool.offers": "Offers",
  "tool.offers.desc": "Prepare a special offer for customers.",
  "tool.customer-followup": "Customer Follow-up",
  "tool.customer-followup.desc": "Follow-up messages for your customers.",
  "tool.customers": "Customers",
  "tool.customers.desc": "Keep your customer list in one place.",
  "tool.leads": "Leads",
  "tool.leads.desc": "Keep track of people who asked.",
  "tool.products": "Products",
  "tool.products.desc": "Your product list and details.",
  "tool.inventory": "Inventory",
  "tool.inventory.desc": "Know what is still in stock.",
  "tool.documents": "Documents",
  "tool.documents.desc": "Keep your business documents in order.",
  "tool.business-numbers": "Business Numbers",
  "tool.business-numbers.desc": "Record your sales and expenses.",

  "qa.followUp": "Follow up",
  "qa.createPost": "Create post",
  "qa.createBanner": "Create banner",
  "qa.makeQuote": "Make a quote",
  "qa.addCustomer": "Add customer",
  "qa.addProduct": "Add product",
  "qa.createVideo": "Create video",
  "qa.createDocument": "Create document",

  settings: "Settings",
  settingsLoading: "Loading settings",
  settingsError: "Couldn't open Settings. Check your connection and try again.",
  account: "Account",
  accountName: "Name",
  accountEmail: "Email",
  accountMethod: "Sign-in method",
  methodPassword: "Email and password",
  methodGoogle: "Google",
  language: "Language",
  langEnglish: "English",
  langFilipino: "Filipino",
  security: "Security",
  changePassword: "Change password",
  currentPassword: "Current password",
  newPassword: "New password",
  confirmPassword: "Confirm new password",
  showPassword: "Show password",
  hidePassword: "Hide password",
  passwordOk: "Password looks good.",
  passwordMismatch: "Passwords don't match.",
  passwordChanged: "Your password was changed.",
  googlePassword: "You sign in with Google. Manage your password in your Google Account.",
  pwShort: (min) => `Use at least ${min} characters.`,
  pwLong: "This password is too long. Use a shorter one.",
  pwRepeat: "Too many repeated characters. Mix it up more.",
  pwDigitsOnly: "Don't use numbers only, like a phone number or birthday.",
  pwMix: "Add letters plus a number or symbol, or use a longer passphrase.",
  pwCommon: "This password is easy to guess. Add a word of your own.",
  pwEmail: "Don't use your email or name in your password.",
  deleteAccount: "Delete account",
  deleteWarn: "This deletes your MagnetraPH profile and login. This can't be undone.",
  deletePassword: "Enter your password to confirm",
  deleteGoogle: "You'll be asked to sign in with Google again to confirm.",
  deleteConfirm: "Delete my account",
  errWrongPassword: "That password isn't correct.",
  errTooMany: "Too many attempts. Please wait a few minutes and try again.",
  errNetwork: "No connection. Check your internet and try again.",
  errRecentLogin: "For your security, log in again, then try once more.",
  errPopupBlocked: "Allow pop-ups in your browser to continue.",
  errDeleteFailed: "We couldn't delete your account. Please try again.",
  errDeletePartial: "Your data was deleted, but your login wasn't. Log in again and try once more.",
  about: "About",
  aboutName: "MagnetraPH - Ultra Magnetic Traffic PH",
  aboutNoFunds: "MagnetraPH is a business-tools platform. It does not hold, transfer or store your money.",
  aboutVersion: "Dashboard 1.0",
  logout: "Log out",
  privacy: "Privacy Policy",
  terms: "Terms of Service",

  // reCAPTCHA notice: wording ni Google; English sa dalawang wika, kapareho ng login
  recaptchaPre: "This site is protected by reCAPTCHA and the Google",
  recaptchaPrivacy: "Privacy Policy",
  recaptchaAnd: "and",
  recaptchaTerms: "Terms of Service",
  recaptchaPost: "apply.",
};

const fil = {
  pageTitle: "MagnetraPH - Dashboard",
  loading: "Naglo-load ang dashboard mo",
  loadingSlow: "Naglo-load pa. I-check ang koneksyon mo, saka i-reload.",
  reload: "I-reload",
  retry: "Subukan ulit",
  close: "Isara",
  appError: "May nangyaring mali habang nilo-load ang dashboard mo.",
  generic: "May nangyaring mali. Subukan ulit.",
  offline: "Offline ka. May mga gawain na kailangan ng internet.",
  offlineNothingChanged: "Offline ka. Walang nabago.",
  exitToast: "Pindutin ulit ang Back para lumabas",

  greetMorning: "Magandang umaga",
  greetAfternoon: "Magandang hapon",
  greetEvening: "Magandang gabi",
  greetHello: "Kumusta",
  tagline: "Lahat ng business tools mo, isang tap lang.",

  askTitle: "Ask Magnetra",
  askLabel: "Ano ang gusto mong gawin?",
  askPh: "Hal. quote, banner",
  find: "Hanapin",
  askEmpty: "Mag-type ng salita, gaya ng quote o banner.",
  askNone: "Wala pang tugma. Sumubok ng ibang salita, o tingnan ang mga tool sa ibaba.",
  askCount: (n) => (n === 1 ? "1 tugma" : `${n} na tugma`),

  quickTitle: "Mabilisang gawain",
  toolsTitle: "Mga tool mo",
  groupTools: "Mga tool",
  growName: "Grow",
  growDesc: "Makilala at makakuha ng customer.",
  sellName: "Sell",
  sellDesc: "Gawing order ang interes.",
  customersName: "Customers",
  customersDesc: "Pabalikin ang mga customer.",
  runName: "Run",
  runDesc: "Ayusin ang takbo ng negosyo.",
  soon: "Malapit na",
  groupReady: (n) => `${n} handa na`,

  nextTitle: "Mga susunod na hakbang",
  resultsTitle: "Resulta",
  resultsEmpty: "Dito lalabas ang resulta ng negosyo mo.",
  resultsEmptyText: "Kapag ginamit mo na ang mga tool ng Magnetra, dito makikita ang totoong progreso mo.",
  achTitle: "Mga nakamit",

  "tool.marketing-studio": "Marketing Studio",
  "tool.marketing-studio.desc": "Gawin at ayusin ang marketing mo sa iisang lugar.",
  "tool.instant-banner": "Instant Banner",
  "tool.instant-banner.desc": "Gumawa ng simpleng banner para sa tindahan mo.",
  "tool.content-repurposer": "Content Repurposer",
  "tool.content-repurposer.desc": "Gawing ilang post ang isang post.",
  "tool.video-ads": "Video Ads",
  "tool.video-ads.desc": "Maiikling video ad para sa mga produkto mo.",
  "tool.quotes": "Quotation",
  "tool.quotes.desc": "Magpadala ng malinaw na quotation sa customer.",
  "tool.proposals": "Proposal",
  "tool.proposals.desc": "Gumawa ng simpleng proposal para sa kliyente.",
  "tool.catalogs": "Catalog",
  "tool.catalogs.desc": "Ipakita ang mga produkto mo sa iisang listahan.",
  "tool.offers": "Mga alok",
  "tool.offers.desc": "Maghanda ng espesyal na alok para sa customer.",
  "tool.customer-followup": "Customer Follow-up",
  "tool.customer-followup.desc": "Mga follow-up na mensahe para sa customer mo.",
  "tool.customers": "Mga customer",
  "tool.customers.desc": "Iisang lugar para sa listahan ng customer mo.",
  "tool.leads": "Leads",
  "tool.leads.desc": "Subaybayan ang mga nagtanong.",
  "tool.products": "Mga produkto",
  "tool.products.desc": "Listahan at detalye ng mga produkto mo.",
  "tool.inventory": "Imbentaryo",
  "tool.inventory.desc": "Alamin kung ano pa ang may stock.",
  "tool.documents": "Mga dokumento",
  "tool.documents.desc": "Ayusin ang mga dokumento ng negosyo mo.",
  "tool.business-numbers": "Numero ng negosyo",
  "tool.business-numbers.desc": "Itala ang benta at gastos mo.",

  "qa.followUp": "Mag-follow up",
  "qa.createPost": "Gumawa ng post",
  "qa.createBanner": "Gumawa ng banner",
  "qa.makeQuote": "Gumawa ng quotation",
  "qa.addCustomer": "Magdagdag ng customer",
  "qa.addProduct": "Magdagdag ng produkto",
  "qa.createVideo": "Gumawa ng video",
  "qa.createDocument": "Gumawa ng dokumento",

  settings: "Settings",
  settingsLoading: "Binubuksan ang Settings",
  settingsError: "Hindi mabuksan ang Settings. I-check ang koneksyon mo at subukan ulit.",
  account: "Account",
  accountName: "Pangalan",
  accountEmail: "Email",
  accountMethod: "Paraan ng pag-log in",
  methodPassword: "Email at password",
  methodGoogle: "Google",
  language: "Wika",
  langEnglish: "English",
  langFilipino: "Filipino",
  security: "Seguridad",
  changePassword: "Palitan ang password",
  currentPassword: "Kasalukuyang password",
  newPassword: "Bagong password",
  confirmPassword: "Ulitin ang bagong password",
  showPassword: "Ipakita ang password",
  hidePassword: "Itago ang password",
  passwordOk: "Ayos ang password.",
  passwordMismatch: "Hindi magkapareho ang password.",
  passwordChanged: "Napalitan na ang password mo.",
  googlePassword: "Google ang gamit mo sa pag-log in. Sa Google Account mo pinapalitan ang password.",
  pwShort: (min) => `Gumamit ng hindi bababa sa ${min} na character.`,
  pwLong: "Masyadong mahaba ang password. Paikliin ito.",
  pwRepeat: "Maraming paulit-ulit na character. Haluan pa.",
  pwDigitsOnly: "Huwag puro numero, gaya ng phone number o birthday.",
  pwMix: "Magdagdag ng letra at numero o simbolo, o gumamit ng mas mahabang passphrase.",
  pwCommon: "Madaling hulaan ang password na ito. Magdagdag ng sariling salita.",
  pwEmail: "Huwag gamitin ang email o pangalan mo sa password.",
  deleteAccount: "Burahin ang account",
  deleteWarn: "Buburahin nito ang MagnetraPH profile at login mo. Hindi na ito maibabalik.",
  deletePassword: "Ilagay ang password mo para kumpirmahin",
  deleteGoogle: "Hihilingin sa iyo na mag-sign in ulit sa Google para kumpirmahin.",
  deleteConfirm: "Burahin ang account ko",
  errWrongPassword: "Mali ang password.",
  errTooMany: "Masyadong maraming subok. Maghintay ng ilang minuto at subukan ulit.",
  errNetwork: "Walang koneksyon. I-check ang internet mo at subukan ulit.",
  errRecentLogin: "Para sa seguridad, mag-log in ulit at saka subukan ulit.",
  errPopupBlocked: "I-allow ang pop-up sa browser mo para makapagpatuloy.",
  errDeleteFailed: "Hindi mabura ang account mo. Subukan ulit.",
  errDeletePartial: "Nabura na ang data mo pero hindi pa ang login. Mag-log in ulit at subukan ulit.",
  about: "Tungkol",
  aboutName: "MagnetraPH - Ultra Magnetic Traffic PH",
  aboutNoFunds: "Ang MagnetraPH ay platform ng business tools. Hindi nito hawak, inililipat o iniimbak ang pera mo.",
  aboutVersion: "Dashboard 1.0",
  logout: "Mag-log out",
  privacy: "Privacy Policy",
  terms: "Terms of Service",

  recaptchaPre: "This site is protected by reCAPTCHA and the Google",
  recaptchaPrivacy: "Privacy Policy",
  recaptchaAnd: "and",
  recaptchaTerms: "Terms of Service",
  recaptchaPost: "apply.",
};

export const STRINGS = Object.freeze({ en: Object.freeze(en), fil: Object.freeze(fil) });
export const LANGS = Object.freeze(["en", "fil"]);

/* ---------- Wika (iisang preference ng buong app) ---------- */
export const getLang = () => {
  const l = prefGetLang();
  return has(STRINGS, l) ? l : "en";
};

// Para lang sa "en" at "fil"; ang frozen login-i18n.js ang nagsi-save sa mgpref_lang. Ibinabalik ang wika ngayon.
export function setLang(next) {
  if (has(STRINGS, next)) prefSetLang(next);
  return getLang();
}

function lookup(key) {
  const cur = STRINGS[getLang()];
  if (has(cur, key)) return cur[key];
  if (has(STRINGS.en, key)) return STRINGS.en[key];
  return undefined;
}

// t("askNone"), t("askCount", 3), t("pwShort", 8). Kapag walang salin kahit sa English: "" (hindi ang key).
export function t(key, ...args) {
  const v = lookup(key);
  if (v === undefined) {
    console.warn("dashboard-i18n: walang salin para sa", key);
    return "";
  }
  return typeof v === "function" ? v(...args) : v;
}

// Bati ayon sa oras ng device (0-23) at pangalan mula sa Firebase Auth displayName (ibinibigay ng ui-dashboard.js).
// Walang pangalan: "Good morning." lang. Hindi gumagawa ng pangalan mula sa email o kung saan pa.
export function greetingFor(hour, name) {
  const h = Number(hour);
  const key = !Number.isInteger(h) || h < 0 || h > 23 ? "greetHello"
    : h >= 5 && h < 12 ? "greetMorning"
    : h >= 12 && h < 18 ? "greetAfternoon"
    : "greetEvening";
  const base = t(key);
  const n = typeof name === "string" ? name.trim() : "";
  if (!n) return `${base}.`;
  return /[.!?]$/.test(n) ? `${base}, ${n}` : `${base}, ${n}.`;
}

/* ---------- Static text sa HTML ----------
   data-i18n (text), data-i18n-ph (placeholder), data-i18n-aria (aria-label).
   Ang orihinal na text sa HTML ay itinatabi para gamitin kapag may kulang na salin.
   root: document, isang element, o DocumentFragment (hal. kopya ng <template>). */
export function applyStatic(root = document) {
  const isDoc = root && root.nodeType === 9;
  if (isDoc) {
    root.documentElement.lang = getLang();
    const title = lookup("pageTitle");
    if (typeof title === "string") root.title = title;
  }
  const swap = (attr, read, write) => {
    const nodes = [...root.querySelectorAll(`[${attr}]`)];
    if (root.nodeType === 1 && root.hasAttribute(attr)) nodes.unshift(root);
    for (const n of nodes) {
      const key = n.getAttribute(attr);
      const store = attr + "-default";
      if (!n.hasAttribute(store)) n.setAttribute(store, read(n) ?? "");
      const v = lookup(key);
      write(n, typeof v === "string" ? v : n.getAttribute(store));
    }
  };
  swap("data-i18n", (n) => n.textContent, (n, v) => { n.textContent = v; });
  swap("data-i18n-ph", (n) => n.getAttribute("placeholder"), (n, v) => { n.setAttribute("placeholder", v); });
  swap("data-i18n-aria", (n) => n.getAttribute("aria-label"), (n, v) => { n.setAttribute("aria-label", v); });
}
