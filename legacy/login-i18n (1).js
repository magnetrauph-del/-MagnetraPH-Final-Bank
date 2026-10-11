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
    faq0a: "MagnetraPH brings practical business tools together in one app. You can create promotional banners, prepare quotations, and draft follow-up messages based on a situation you select. Easy Actions helps you see a possible next step for your business, and the Help Center offers guides for using the app.",
    faq7q: "Can I use MagnetraPH on my phone and computer?",
    faq7a: "You can access MagnetraPH on a supported phone or computer through a web browser. Your Business Profile is saved only on the device where you enter it and is erased when you log out. If you switch devices, you may need to enter your business information again.",
    faq1q: "How do I log in?",
    faq1a: "Enter the email address and password associated with your account, then select Log in. If you created your account using Google, choose Continue with Google instead.",
    faq2q: "I forgot my password. What should I do?",
    faq2a: "On the login page, select Forgot password? and follow the instructions to reset your password. Make sure you enter the email address linked to your account.",
    faq3q: "Why can't I log in?",
    faq3a: "First, check that your email address and password are correct and that your internet connection is working. If you use Google to sign in, make sure you select the correct Google account. If you still can’t access your account, try Forgot password? or wait before trying again if you have made several unsuccessful attempts.",
    faq4q: "I haven't received my verification email. What should I do?",
    faq4a: "Check your Spam or Junk folder, as well as any other folder where the email may have been filtered. If the message is still missing, log in with your email address and password, then select Send verification email again to request another email. Give it a little time to arrive before requesting another one.",
    faq6q: "Why isn't Google sign-in working?",
    faq6a: "If you opened MagnetraPH inside Facebook or Messenger, try opening the page in your phone’s regular browser, such as Chrome. Then select Continue with Google and choose the Google account you use for MagnetraPH. If the problem continues, try again later.",
    faq9q: "How can I contact support?",
    faq9a: "For help, briefly describe the issue so we can understand what happened, and never include your password. Email us at",
    faq5q: "Is my account secure?",
    faq5a: "MagnetraPH uses measures designed to help protect your account, including email verification, reCAPTCHA, server-side checks, and HTTPS connections. No online service can guarantee complete security. Keep your password private and use a strong password that you do not use elsewhere.",
    faq8q: "Who can see my data?",
    faq8a: "In the current app, the banners, quotations, and follow-up messages you create are processed in your browser and are not uploaded to MagnetraPH’s server. The server stores your account ID and email address for account-related functions. Firebase separately handles the information needed for authentication.",

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
    faq0a: "Pinagsasama ng MagnetraPH ang mga tool na makatutulong sa pagpapatakbo at pag-promote ng iyong negosyo. Makakagawa ka ng promotional banner, makapaghahanda ng quotation, at makasusulat ng follow-up message batay sa sitwasyong pipiliin mo. Sa Easy Actions, makikita mo ang maaaring susunod na gawin para sa negosyo mo. May mga gabay din sa Help Center para matulungan kang gamitin ang app.",
    faq7q: "Puwede ko bang gamitin ang MagnetraPH sa phone at computer?",
    faq7a: "Maaari mong gamitin ang MagnetraPH sa suportadong cellphone o computer gamit ang web browser. Ang iyong Business Profile ay naka-save lamang sa device kung saan mo ito inilagay at nabubura kapag nag-log out ka. Kung lilipat ka ng device, maaaring kailanganin mong ilagay muli ang impormasyon ng iyong negosyo.",
    faq1q: "Paano mag-log in sa MagnetraPH?",
    faq1a: "Ilagay ang email address at password na nakarehistro sa iyong account, pagkatapos ay piliin ang Mag-log in. Kung Google ang ginamit mo sa paggawa ng account, piliin ang Magpatuloy gamit ang Google.",
    faq2q: "Nakalimutan ko ang password ko. Ano ang gagawin ko?",
    faq2a: "Sa login page, piliin ang Nakalimutan ang password? at sundin ang mga tagubilin para mapalitan ang iyong password. Tiyaking tama ang email address na naka-link sa iyong account.",
    faq3q: "Bakit hindi ako makapag-log in?",
    faq3a: "Tingnan muna kung tama ang iyong email address at password at kung maayos ang internet connection mo. Kung Google ang ginagamit mo sa pag-log in, tiyaking ang tamang Google account ang pinili mo. Kung hindi ka pa rin makapasok, subukan ang Nakalimutan ang password? Kung ilang beses nang hindi nagtagumpay ang pag-log in, maghintay muna bago muling subukan.",
    faq4q: "Hindi ko natanggap ang verification email. Ano ang dapat kong gawin?",
    faq4a: "Tingnan ang Spam o Junk folder at iba pang folder kung saan maaaring napunta ang email. Kung wala pa rin ito, mag-log in gamit ang iyong email address at password, pagkatapos ay piliin ang Ipadala ulit ang verification email para humiling ng panibagong email. Maghintay muna nang kaunti bago muling humiling.",
    faq6q: "Bakit hindi gumagana ang pag-log in gamit ang Google?",
    faq6a: "Kung binuksan mo ang MagnetraPH sa loob ng Facebook o Messenger, subukang buksan ang page sa regular na browser ng cellphone mo, gaya ng Chrome. Piliin ang Magpatuloy gamit ang Google at gamitin ang Google account na nakaugnay sa MagnetraPH. Kung hindi pa rin gumana, subukan muli mamaya.",
    faq9q: "Paano makipag-ugnayan sa MagnetraPH support?",
    faq9a: "Kung kailangan mo ng tulong, maikling ilarawan ang problemang nararanasan mo para maunawaan namin ang nangyari. Huwag isama sa mensahe ang iyong password. Mag-email sa amin sa",
    faq5q: "Ligtas ba ang account ko sa MagnetraPH?",
    faq5a: "Gumagamit ang MagnetraPH ng mga panseguridad na hakbang upang makatulong na maprotektahan ang iyong account. Kabilang dito ang email verification, reCAPTCHA, pagsusuri sa server, at HTTPS connection. Walang online service na makagagarantiya ng ganap na seguridad, kaya huwag ibahagi ang iyong password at gumamit ng matibay na password na hindi mo ginagamit sa ibang account.",
    faq8q: "Sino ang makakakita ng data ko?",
    faq8a: "Sa kasalukuyang app, ang mga banner, quotation, at follow-up message na ginagawa mo ay pinoproseso sa browser mo at hindi ina-upload sa server ng MagnetraPH. Iniimbak ng server ang account ID at email address mo para sa mga function na may kaugnayan sa account. Hiwalay na pinangangasiwaan ng Firebase ang impormasyong kailangan para sa pag-log in.",

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
