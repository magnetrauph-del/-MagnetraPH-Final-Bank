// dashboard-i18n.js - v3 (Phase 1.1) - mga salita ng Dashboard sa English at Filipino. Walang emoji.
// ANONG TEXT ang ipapakita lang ito (C3). Walang network, Firebase, login, API, AI, data o presyo.
// Ang napiling wika ay iisa sa buong app: "mgpref_lang", na hawak ng frozen login-i18n.js.
// Dito ay getLang/setLang lang ang kinukuha roon (walang kopya ng Login logic, walang bagong storage key).
// Default: Filipino/Taglish kapag wala pang piniling wika (local-state.js appLang); English kapag pinili ito.
// Kapag may kulang na salin: English; kapag wala pa rin: ang orihinal na text sa HTML (hindi ang key).
import { getLang as prefGetLang, setLang as prefSetLang } from "./login-i18n.js";
import { appLang } from "./local-state.js?v=1";

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
  greetDawn: "Hi",
  // Madaling-araw (00:00-05:59): "Hi, Juan." + ISANG linya mula sa listahang ito (sinuri ng tao; walang AI, walang random).
  // Totoo para sa lahat: gising pa mula kagabi, maagang nagsimula (panadero, palengke), o nagtatrabaho. Walang "late", walang "bukas".
  greetDawnNotes: Object.freeze(["Rest when you can.", "Take it slow, one thing at a time.", "Take care of yourself too."]),
  greetLate: "Good evening",
  pageHeading: "Your dashboard",

  welcomeTitle: "Welcome to MagnetraPH",
  welcomeText: "Pick where your business is now. We'll show the next step.",
  welcomeStart: "Start",
  welcomeLater: "Later",

  easyEyebrow: "Easy Actions",
  easyTitle: "Where is your business right now?",
  easyHelp: "Pick the closest one. Magnetra shows one next step, and you decide.",
  easyHelpAria: "What is Easy Actions?",
  "easy.promote": "I have a promo",
  "easy.promote.title": "Make a promo banner",
  "easy.promote.text": "Type your promo, then save or share it.",
  "easy.price": "Someone asked the price",
  "easy.price.title": "Make a clear quotation",
  "easy.price.text": "You still send it to the customer yourself.",
  "easy.quote-sent": "I sent a quote",
  "easy.quote-sent.title": "Follow up on the quote",
  "easy.quote-sent.text": "A ready message. You send it yourself.",
  "easy.no-reply": "No reply yet",
  "easy.no-reply.title": "Send a polite reminder",
  "easy.no-reply.text": "A ready message. You send it yourself.",
  "easy.bought": "Someone bought",
  "easy.bought.title": "Thank your customer",
  "easy.bought.text": "A ready message. You send it yourself.",
  "easy.alt.inquiry": "Reply to the question first",
  "easy.alt.thinking": "They said they'll think about it",
  easyOpen: (name) => `Open ${name}`,
  easyMore: "Other ways",
  "easy.other": "I need something else",
  otherHint: "Search, or pick from all tools below.",

  profile: "Profile",
  profileAria: "Profile and settings",
  profileNoName: "Your account",
  myProfile: "My Profile",
  bizProfile: "Business Profile",
  help: "Help",
  bizIntro: "Save it once. Instant Banner and Quotes will fill it in for you.",
  bizName: "Business name",
  bizNamePh: "Your shop or business name",
  bizContact: "Contact details",
  bizContactPh: "Phone, page or how to order",
  bizLimit: (n) => `Up to ${n} characters.`,
  bizPrivacy: "Saved on this phone only. Erased when you log out.",
  bizSave: "Save",
  bizSaved: "Saved. Instant Banner and Quotes will fill these in for you.",
  bizCleared: "Business Profile cleared.",
  bizNothing: "Type your business name or contact first.",
  bizSaveFail: "Couldn't save on this phone. Your browser may be blocking storage.",
  helpEasyTitle: "Easy Actions",
  helpEasy: "Pick where your business is now. Magnetra shows one next step, and you decide.",
  helpToolsTitle: "Your free tools",
  helpTools: "Instant Banner, Quotes and Customer Follow-up work on your phone. You do the sending; MagnetraPH never sends anything for you.",
  helpBizTitle: "Business Profile",
  helpBiz: "Save your business name and contact once, so you type less.",
  helpContactTitle: "Need more help?",
  helpContact: "Email us:",
  careText: (n) => `You've finished ${n} tasks for your business. Take a short break if you need one.`,
  careOk: "Okay",
  careAria: "Friendly reminder",
  freeTitle: "Your free tools",
  viewAll: "View all",
  allTitle: "All tools",
  askSrLabel: "Ask Magnetra: search tools and settings",
  askPh2: "Search tools or settings",
  appearance: "Appearance",
  themeSystem: "Same as phone",
  themeLight: "Light",
  themeDark: "Dark",
  themeChanged: (name) => `Appearance changed to ${name}.`,

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
  langFilipino: "Taglish",
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
  greetDawn: "Hi",
  greetDawnNotes: Object.freeze(["Pahinga rin kapag kaya.", "Dahan-dahan lang, isa-isa lang.", "Alagaan mo rin ang sarili mo."]),
  greetLate: "Magandang gabi",
  pageHeading: "Ang dashboard mo",

  welcomeTitle: "Welcome sa MagnetraPH",
  welcomeText: "Piliin kung nasaan na ang business mo. Ituturo namin ang next step.",
  welcomeStart: "Simulan",
  welcomeLater: "Mamaya na",

  easyEyebrow: "Easy Actions",
  easyTitle: "Nasaan ka na ngayon sa Business mo?",
  easyHelp: "Piliin ang pinakamalapit. Isang next step ang ituturo, ikaw ang magpapasya.",
  easyHelpAria: "Ano ang Easy Actions?",
  "easy.promote": "May ipo-promote",
  "easy.promote.title": "Gumawa ng promo banner",
  "easy.promote.text": "Ilagay ang promo mo, tapos i-save o i-share.",
  "easy.price": "May nagtanong ng presyo",
  "easy.price.title": "Gumawa ng malinaw na quotation",
  "easy.price.text": "Ikaw pa rin ang magpapadala sa customer.",
  "easy.quote-sent": "Nag-send na ng quote",
  "easy.quote-sent.title": "Mag-follow up sa quote",
  "easy.quote-sent.text": "May handang mensahe. Ikaw ang magpapadala.",
  "easy.no-reply": "Wala pang sagot",
  "easy.no-reply.title": "Magpadala ng magalang na paalala",
  "easy.no-reply.text": "May handang mensahe. Ikaw ang magpapadala.",
  "easy.bought": "May bumili na",
  "easy.bought.title": "Magpasalamat sa customer",
  "easy.bought.text": "May handang mensahe. Ikaw ang magpapadala.",
  "easy.alt.inquiry": "Sagutin muna ang tanong",
  "easy.alt.thinking": "Sabi niya, pag-iisipan niya",
  easyOpen: (name) => `Buksan ang ${name}`,
  easyMore: "Iba pang paraan",
  "easy.other": "Iba ang kailangan ko",
  otherHint: "Maghanap, o pumili sa lahat ng tools sa ibaba.",

  profile: "Profile",
  profileAria: "Profile at settings",
  profileNoName: "Ang account mo",
  myProfile: "Profile ko",
  bizProfile: "Business Profile",
  help: "Tulong",
  bizIntro: "I-save nang isang beses. Ilalagay na ito ng Instant Banner at Quotation para sa iyo.",
  bizName: "Pangalan ng business",
  bizNamePh: "Pangalan ng tindahan o business mo",
  bizContact: "Contact details",
  bizContactPh: "Phone, page, o paano umorder",
  bizLimit: (n) => `Hanggang ${n} na character.`,
  bizPrivacy: "Sa phone na ito lang naka-save. Mabubura kapag nag-log out ka.",
  bizSave: "I-save",
  bizSaved: "Na-save. Ilalagay na ito ng Instant Banner at Quotation para sa iyo.",
  bizCleared: "Nabura ang Business Profile.",
  bizNothing: "I-type muna ang pangalan o contact ng business mo.",
  bizSaveFail: "Hindi ma-save sa phone na ito. Baka naka-block ang storage ng browser mo.",
  helpEasyTitle: "Easy Actions",
  helpEasy: "Piliin kung nasaan na ang business mo. Isang next step ang ituturo ni Magnetra, at ikaw ang magdedesisyon.",
  helpToolsTitle: "Mga free tool mo",
  helpTools: "Gumagana sa phone mo ang Instant Banner, Quotation at Customer Follow-up. Ikaw ang nagpapadala; walang ipinapadala ang MagnetraPH para sa iyo.",
  helpBizTitle: "Business Profile",
  helpBiz: "I-save nang isang beses ang pangalan at contact ng business mo, para mas kaunti ang ita-type.",
  helpContactTitle: "Kailangan pa ng tulong?",
  helpContact: "Mag-email sa:",
  careText: (n) => `Nakatapos ka na ng ${n} gawain para sa business mo. Pahinga muna kung kailangan.`,
  careOk: "Sige",
  careAria: "Paalala",
  freeTitle: "Mga free tool mo",
  viewAll: "Tingnan lahat",
  allTitle: "Lahat ng tools",
  askSrLabel: "Ask Magnetra: maghanap ng tool o setting",
  askPh2: "Hanapin ang tool o setting",
  appearance: "Itsura",
  themeSystem: "Kapareho ng phone",
  themeLight: "Light",
  themeDark: "Dark",
  themeChanged: (name) => `Napalitan ang itsura: ${name}.`,

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
  runDesc: "Ayusin ang takbo ng business.",
  soon: "Malapit na",
  groupReady: (n) => `${n} handa na`,

  nextTitle: "Mga susunod na hakbang",
  resultsTitle: "Resulta",
  resultsEmpty: "Dito lalabas ang resulta ng business mo.",
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
  "tool.documents.desc": "Ayusin ang mga dokumento ng business mo.",
  "tool.business-numbers": "Numero ng business",
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
  langFilipino: "Taglish",
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
let current = appLang(prefGetLang()); // wika sa pagbukas ng page (pinili ng user, o Filipino/Taglish kapag wala pa)
export const getLang = () => (has(STRINGS, current) ? current : "fil");

// Para lang sa "en" at "fil"; ang frozen login-i18n.js ang nagsi-save sa mgpref_lang. Ibinabalik ang wika ngayon.
export function setLang(next) {
  if (has(STRINGS, next)) { prefSetLang(next); current = next; }
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

// Bahagi ng araw ayon sa oras ng device (0-23, lokal na oras ng phone; walang hula). Ang madaling-araw ay HINDI gabi.
//   00:00-05:59 madaling-araw, 06:00-11:59 umaga, 12:00-17:59 hapon, 18:00-21:59 gabi, 22:00-23:59 hatinggabi
//   (late night: parehong natural na bati gaya ng gabi; iba lang ang icon)
//   Madaling-araw: walang pormal na bati (hindi natural); "Hi, Juan." + isang tahimik na linya mula sa greetDawnNotes.
export function periodFor(hour) {
  const h = Number(hour);
  if (!Number.isInteger(h) || h < 0 || h > 23) return null;
  return h < 6 ? "dawn" : h < 12 ? "morning" : h < 18 ? "afternoon" : h < 22 ? "evening" : "late";
}
const PERIOD_KEY = Object.freeze({ dawn: "greetDawn", morning: "greetMorning", afternoon: "greetAfternoon", evening: "greetEvening", late: "greetLate" });

// Bati ayon sa oras ng device at pangalan mula sa Firebase Auth displayName (ibinibigay ng ui-dashboard.js).
// Walang pangalan: "Good morning." lang. Hindi gumagawa ng pangalan mula sa email o kung saan pa.
export function greetingFor(hour, name) {
  const p = periodFor(hour);
  const base = t(p ? PERIOD_KEY[p] : "greetHello");
  const n = typeof name === "string" ? name.trim() : "";
  if (!n) return `${base}.`;
  return /[.!?]$/.test(n) ? `${base}, ${n}` : `${base}, ${n}.`;
}
// Isang maikling linya sa ilalim ng "Hi, Juan.", sa madaling-araw lang; "" kung hindi madaling-araw.
// Pinipili ayon sa PETSA sa phone (pareho buong araw, iba bukas): walang random, walang AI, galing lang sa listahan.
// Kapag walang listahan o hindi mabasa ang petsa: walang linya ("Hi, Juan." lang), hindi pinipilit.
export function greetingNote(hour, date = new Date()) {
  if (periodFor(hour) !== "dawn") return "";
  const list = lookup("greetDawnNotes");
  if (!Array.isArray(list) || !list.length) return "";
  const t0 = date instanceof Date ? Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()) : NaN;
  if (!Number.isFinite(t0)) return "";
  const day = Math.floor(t0 / 864e5);
  return list[((day % list.length) + list.length) % list.length];
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
