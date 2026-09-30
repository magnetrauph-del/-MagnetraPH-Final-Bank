// login-i18n.js - v6.1 - mga salita ng login page sa English at Filipino.
// SHARED CODE: iisang file para sa DEV/SPCK at PROD/LIVE. Walang environment config dito.
// Ang napiling wika ay naka-save sa "mgpref_lang" (hindi "mag_" para hindi mabura sa logout).
// Kapag may kulang na salin (hal. lumang file sa cache), ang orihinal na text sa HTML ang lalabas,
// hindi kailanman ang pangalan ng key.
const PREF_KEY = "mgpref_lang";

export const STRINGS = {
  en: {
    pageTitle: "MagnetraPH - Log in",
    langSwitch: "Filipino",
    langSwitchAria: "Switch language to Filipino",
    tagline: "All your business tools, in one tap",
    emailPh: "Enter your email",
    emailAria: "Email",
    passPh: "Enter your password",
    passAria: "Password",
    showPw: "Show password",
    hidePw: "Hide password",
    capsLock: "Caps Lock is on",
    didYouMean: (e) => `Did you mean ${e}?`,
    forgot: "Forgot password?",
    faq: "FAQ",
    login: "Log in",
    screenLock: "Log in with screen lock",
    or: "or",
    google: "Continue with Google",
    noAccount: "Don't have an account?",
    create: "Create account",
    resend: "Send verification email again",
    lockReset: "Forgot your password? Reset it here",
    legalPre: "By continuing, you agree to our",
    terms: "Terms",
    and: "and",
    privacy: "Privacy Policy",
    termsFull: "Terms of Service",
    welcomeBack: "Welcome back!",
    welcomeSub: "Log in to keep your business moving.",
    close: "Close",

    faqTitle: "FAQ",
    faqGroupAbout: "About MagnetraPH",
    faqGroupAccount: "Account and login",
    faqGroupSafety: "Security and privacy",
    faq0q: "What is MagnetraPH?",
    faq0a: "MagnetraPH is a set of business tools for Filipino entrepreneurs, all in one app. You can start with ready-to-send follow-up emails for your customers, and more tools are on the way.",
    faq7q: "Can I use MagnetraPH on my phone and computer?",
    faq7a: "Yes. Open magnetra.app in Chrome or Safari on your phone or computer, and log in with the same account.",
    faq1q: "How do I log in to MagnetraPH?",
    faq1a: "Enter your email and password, then tap Log in.",
    faq2q: "I forgot my password. What should I do?",
    faq2a: "Tap Forgot password, enter your email, and we will send you a reset link. Check your Inbox and Spam folder. The link expires in 1 hour.",
    faq3q: "Why can't I log in to my account?",
    faq3a: "Check your email and password, and make sure you have verified your email. For your security, login is paused for a short time after several incorrect attempts. Try again later.",
    faq4q: "I did not get the verification email.",
    faq4a: "Check your Spam folder, then log in and tap Send verification email again.",
    faq6q: "Can I use Google to log in?",
    faq6a: "Yes. Tap Continue with Google and choose your Google account.",
    faq9q: "How do I contact MagnetraPH support?",
    faq9a: "Email us at",
    faq5q: "Is my MagnetraPH account safe?",
    faq5a: "We use verified sign-in and bot protection on secure servers. Never share your password with anyone, and log out when using a shared device.",
    faq8q: "Who can see my business data?",
    faq8a: "Your data is linked to your account and is not shown to other users. Our Privacy Policy explains what we collect and how we use it.",

    resetTitle: "Reset password",
    resetLabel: "Enter your email to receive a reset link",
    sendReset: "Send reset link",

    wrong: "Wrong email or password",
    invalidEmail: "That email address is not valid",
    tooMany: "Too many attempts. Please wait a few minutes and try again.",
    network: "No connection. Check your internet and try again.",
    offline: "You are offline. Check your internet connection.",
    disabled: "This account has been disabled",
    googleCancel: "Google sign-in was cancelled",
    popupBlocked: "Allow pop-ups to continue with Google",
    otherMethod: "An account with this email already exists. Log in with your email and password.",
    inApp: "Open this page in Chrome or Safari to sign in with Google",
    profileFailed: "We could not set up your account. Please try again.",
    googleUnverified: "The email on this Google account is not verified",
    notLoggedIn: "Log in first, then ask for a new verification email",
    generic: "Something went wrong. Please try again.",
    genericCode: (c) => `Something went wrong. Please try again. (Code: ${c})`,
    locked: (m) => `Too many attempts. Try again in ${m} minute${m === 1 ? "" : "s"}.`,
    cooldown: (s) => `Please wait ${s} seconds before trying again.`,
    enterValidEmail: "Enter a valid email address",
    enterPassword: "Enter your password",
    enterBoth: "Enter a valid email address and your password",
    signingIn: "Signing in...",
    welcome: "Welcome back. Opening your dashboard...",
    verifyFirst: "Please verify your email first. Open the link we sent to your inbox, then log in again.",
    verifiedLogin: "If you have verified your email, log in to continue.",
    loadFailed: (d) => `Could not load the login. Check your internet, then refresh the page.${d ? ` (${d})` : ""}`,
    blocked: "Sign-in blocked. Refresh the page and try again.",
    connectingGoogle: "Connecting to Google...",
    verifySent: "Verification email sent. Check your inbox and spam folder.",
    sending: "Sending...",
    resetDone: "If an account exists for this email, a reset link is on its way. Check your inbox and spam folder.",
    exitToast: "Tap back again to exit",
  },

  fil: {
    pageTitle: "MagnetraPH - Mag-log in",
    langSwitch: "English",
    langSwitchAria: "Palitan ang wika sa English",
    tagline: "Lahat ng business tools mo, sa isang tap",
    emailPh: "Ilagay ang iyong email",
    emailAria: "Email",
    passPh: "Ilagay ang iyong password",
    passAria: "Password",
    showPw: "Ipakita ang password",
    hidePw: "Itago ang password",
    capsLock: "Naka-on ang Caps Lock",
    didYouMean: (e) => `Ito ba ang ibig mong sabihin: ${e}?`,
    forgot: "Nakalimutan ang password?",
    faq: "FAQ",
    login: "Mag-log in",
    screenLock: "Mag-log in gamit ang screen lock",
    or: "o",
    google: "Magpatuloy gamit ang Google",
    noAccount: "Wala pang account?",
    create: "Gumawa ng account",
    resend: "Ipadala ulit ang verification email",
    lockReset: "Nakalimutan ang password? I-reset dito",
    legalPre: "Sa pagpapatuloy, sumasang-ayon ka sa aming",
    terms: "Terms",
    and: "at",
    privacy: "Privacy Policy",
    termsFull: "Terms of Service",
    welcomeBack: "Welcome back!",
    welcomeSub: "Mag-log in para tuloy-tuloy ang negosyo mo.",
    close: "Isara",

    faqTitle: "FAQ",
    faqGroupAbout: "Tungkol sa MagnetraPH",
    faqGroupAccount: "Account at pag-log in",
    faqGroupSafety: "Seguridad at privacy",
    faq0q: "Ano ang MagnetraPH?",
    faq0a: "Ang MagnetraPH ay koleksyon ng business tools para sa mga negosyanteng Pilipino, nasa iisang app. Puwede kang magsimula sa handa nang follow-up emails para sa mga customer mo, at may mga bagong tools pang darating.",
    faq7q: "Puwede ko bang gamitin ang MagnetraPH sa phone at computer?",
    faq7a: "Oo. Buksan ang magnetra.app sa Chrome o Safari sa phone o computer mo, at mag-log in gamit ang parehong account.",
    faq1q: "Paano mag-log in sa MagnetraPH?",
    faq1a: "Ilagay ang email at password mo, saka pindutin ang Mag-log in.",
    faq2q: "Nakalimutan ko ang password ko. Ano ang gagawin ko?",
    faq2a: "Pindutin ang Nakalimutan ang password, ilagay ang email mo, at padadalhan ka namin ng reset link. I-check ang Inbox at Spam folder. Mag-e-expire ang link pagkalipas ng 1 oras.",
    faq3q: "Bakit hindi ako makapag-log in?",
    faq3a: "I-check ang email at password mo, at siguraduhing na-verify mo na ang email mo. Para sa seguridad, pansamantalang naka-pause ang login pagkatapos ng ilang maling subok. Subukan ulit mamaya.",
    faq4q: "Hindi ko natanggap ang verification email.",
    faq4a: "I-check ang Spam folder mo, saka mag-log in at pindutin ang Ipadala ulit ang verification email.",
    faq6q: "Puwede ba akong mag-log in gamit ang Google?",
    faq6a: "Oo. Pindutin ang Magpatuloy gamit ang Google at piliin ang Google account mo.",
    faq9q: "Paano makipag-ugnayan sa MagnetraPH support?",
    faq9a: "Mag-email sa amin sa",
    faq5q: "Ligtas ba ang account ko sa MagnetraPH?",
    faq5a: "Gumagamit kami ng verified na sign-in at proteksyon laban sa bot sa mga secure na server. Huwag ibahagi ang password mo kahit kanino, at mag-log out kapag gumagamit ng shared na device.",
    faq8q: "Sino ang makakakita ng data ng negosyo ko?",
    faq8a: "Nakakabit ang data mo sa account mo at hindi ito ipinapakita sa ibang user. Nakasaad sa aming Privacy Policy kung ano ang kinokolekta namin at paano ito ginagamit.",

    resetTitle: "I-reset ang password",
    resetLabel: "Ilagay ang email mo para makatanggap ng reset link",
    sendReset: "Ipadala ang reset link",

    wrong: "Mali ang email o password",
    invalidEmail: "Hindi valid ang email address na ito",
    tooMany: "Masyadong maraming subok. Maghintay ng ilang minuto at subukan ulit.",
    network: "Walang koneksyon. I-check ang internet mo at subukan ulit.",
    offline: "Offline ka. I-check ang internet connection mo.",
    disabled: "Naka-disable ang account na ito",
    googleCancel: "Nakansela ang Google sign-in",
    popupBlocked: "I-allow ang pop-ups para magpatuloy gamit ang Google",
    otherMethod: "May account na ang email na ito. Mag-log in gamit ang email at password mo.",
    inApp: "Buksan ang page na ito sa Chrome o Safari para mag-sign in gamit ang Google",
    profileFailed: "Hindi namin ma-setup ang account mo. Subukan ulit.",
    googleUnverified: "Hindi pa verified ang email ng Google account na ito",
    notLoggedIn: "Mag-log in muna, saka humingi ng bagong verification email",
    generic: "May nangyaring mali. Subukan ulit.",
    genericCode: (c) => `May nangyaring mali. Subukan ulit. (Code: ${c})`,
    locked: (m) => `Masyadong maraming subok. Subukan ulit pagkalipas ng ${m} minuto.`,
    cooldown: (s) => `Maghintay ng ${s} segundo bago subukan ulit.`,
    enterValidEmail: "Maglagay ng valid na email address",
    enterPassword: "Ilagay ang iyong password",
    enterBoth: "Maglagay ng valid na email address at ng iyong password",
    signingIn: "Nagla-log in...",
    welcome: "Welcome back. Binubuksan ang dashboard mo...",
    verifyFirst: "I-verify muna ang email mo. Buksan ang link na ipinadala namin sa inbox mo, saka mag-log in ulit.",
    verifiedLogin: "Kung na-verify mo na ang email mo, mag-log in para magpatuloy.",
    loadFailed: (d) => `Hindi ma-load ang login. I-check ang internet mo, saka i-refresh ang page.${d ? ` (${d})` : ""}`,
    blocked: "Na-block ang sign-in. I-refresh ang page at subukan ulit.",
    connectingGoogle: "Kumokonekta sa Google...",
    verifySent: "Naipadala na ang verification email. I-check ang inbox at spam folder mo.",
    sending: "Ipinapadala...",
    resetDone: "Kung may account ang email na ito, may reset link na papunta. I-check ang inbox at spam folder mo.",
    exitToast: "Pindutin ulit ang Back para lumabas",
  },
};

// Sariling key lang ng object ang tinatanggap (hindi ang minana ng JavaScript gaya ng
// "__proto__", "constructor" o "toString"), para "en" at "fil" lang ang posibleng wika at
// mga totoong salin lang ang posibleng ibalik.
const has = (o, k) => Object.prototype.hasOwnProperty.call(o, k);

let lang = "en";
try {
  const saved = localStorage.getItem(PREF_KEY);
  if (saved && has(STRINGS, saved)) lang = saved;
} catch {}

export const getLang = () => lang;

export function setLang(next) {
  if (!has(STRINGS, next)) return;
  lang = next;
  try { localStorage.setItem(PREF_KEY, next); } catch {}
}

function lookup(key) {
  return has(STRINGS[lang], key)
    ? STRINGS[lang][key]
    : has(STRINGS.en, key)
      ? STRINGS.en[key]
      : undefined;
}

// t("wrong") o t("locked", 5). Kapag walang salin: English; kapag wala pa rin: generic na mensahe.
export function t(key, ...args) {
  let v = lookup(key);
  if (v === undefined) {
    console.warn("login-i18n: walang salin para sa", key);
    v = STRINGS[lang].generic;
  }
  return typeof v === "function" ? v(...args) : v;
}

// Pinapalitan ang lahat ng text sa page ayon sa napiling wika.
// Ang orihinal na text sa HTML ay itinatabi para gamitin kapag may kulang na salin.
export function applyStatic(root = document) {
  document.documentElement.lang = lang;
  document.title = lookup("pageTitle") ?? document.title;
  const swap = (selector, attr, read, write) => {
    root.querySelectorAll(selector).forEach((n) => {
      const key = n.getAttribute(attr);
      const store = attr + "-default";
      if (!n.hasAttribute(store)) n.setAttribute(store, read(n) ?? "");
      const v = lookup(key);
      write(n, typeof v === "string" ? v : n.getAttribute(store));
    });
  };
  swap("[data-i18n]", "data-i18n", (n) => n.textContent, (n, v) => { n.textContent = v; });
  swap("[data-i18n-ph]", "data-i18n-ph", (n) => n.placeholder, (n, v) => { n.placeholder = v; });
  swap("[data-i18n-aria]", "data-i18n-aria", (n) => n.getAttribute("aria-label"), (n, v) => { n.setAttribute("aria-label", v); });
}
