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
    faq0a: "MagnetraPH is a business growth platform designed to simplify your marketing and sales tasks. In one app, you can create promotional banners, prepare quotations, and write follow-up messages for your customers. Our goal is to make everyday business tasks easier, so you can spend less time on scattered work and more time connecting with your customers.",
    faq7q: "Can I use MagnetraPH on my phone and computer?",
    faq7a: "Yes. You can open MagnetraPH in a supported web browser on your phone or computer. For the best experience, use an up-to-date browser and a stable internet connection. Your Business Profile is saved only on the device where you enter it and is erased when you log out. If you switch devices or log out, you may need to enter your business information again.",
    faq1q: "How do I log in to MagnetraPH?",
    faq1a: "Enter the email address and password associated with your MagnetraPH account, then select Log in. If you created your account with Google, select Continue with Google instead. If you don't have an account yet, select Create account to get started.",
    faq2q: "I forgot my password. What should I do?",
    faq2a: "On the login page, select Forgot password? and enter the email address linked to your account. Then follow the instructions in the email we send you. If you don't see the email, check your Spam or Junk folder. If you still can't reset your password, contact MagnetraPH support.",
    faq3q: "Why can't I log in to my account?",
    faq3a: "Check that your email address and password are correct and that your internet connection is working. If you haven't verified your email address yet, complete that step first. If you can't remember your password, use Forgot password? on the login page. If you have made several unsuccessful attempts, wait a few minutes before trying again. If the problem continues, contact support and describe the error message you see, but never share your password.",
    faq4q: "I didn't get the verification email. What should I do?",
    faq4a: "Check that you entered the correct email address, then look in your Spam or Junk folder. If the email still isn't there, log in with your email address and password. The Send verification email again button appears after you log in. Select it, then wait a few minutes before requesting another one. If you still don't receive it, contact MagnetraPH support.",
    faq6q: "Why isn't Google sign-in working?",
    faq6a: "If you opened MagnetraPH inside Facebook or Messenger, try opening the page in your phone’s regular browser, such as Chrome. Then select Continue with Google and choose the Google account you use for MagnetraPH. If the problem continues, try again later.",
    faq9q: "How do I contact MagnetraPH support?",
    faq9a: "For help with your account or with logging in, briefly describe the problem and include any error message you see. For your security, never include your password or any verification or password reset link in your message. Email us at",
    faq5q: "Is my MagnetraPH account safe?",
    faq5a: "MagnetraPH uses measures designed to help protect your account, including email verification, reCAPTCHA, server-side checks, and HTTPS connections. No online service can guarantee complete security, so you can help too. Use a strong password that you don't use anywhere else, keep your login details private, and never share your verification or password reset links. If you notice unusual activity, contact MagnetraPH support right away.",
    faq8q: "Who can see my business data?",
    faq8a: "In the current app, the banners, quotations, and follow-up messages you create are processed in your browser and are not uploaded to MagnetraPH's server. Your Business Profile is saved only on your device. The server stores only your account ID and email address for account-related functions. Firebase separately handles the information needed for login. To learn more, read our Privacy Policy.",

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
    faq0a: "Ang MagnetraPH ay isang platform para sa pagpapalago ng negosyo na idinisenyong gawing mas simple ang iyong marketing at sales. Sa iisang app, makagagawa ka ng promotional banner, makapaghahanda ng quotation, at makasusulat ng follow-up message para sa iyong mga customer. Layunin naming gawing mas madali ang pang-araw-araw na gawain sa negosyo upang mas makapagtuon ka ng oras sa pakikipag-ugnayan sa iyong mga customer.",
    faq7q: "Maaari ko bang gamitin ang MagnetraPH sa cellphone at computer?",
    faq7a: "Oo. Maaari mong buksan ang MagnetraPH gamit ang suportadong web browser sa iyong cellphone o computer. Para sa mas maayos na paggamit, gumamit ng updated na browser at maayos na internet connection. Ang iyong Business Profile ay naka-save lamang sa device kung saan mo ito inilagay at nabubura kapag nag-log out ka. Kung lilipat ka ng device o mag-log out, maaaring kailanganin mong ilagay muli ang impormasyon ng iyong negosyo.",
    faq1q: "Paano ako magla-log in sa MagnetraPH?",
    faq1a: "Ilagay ang email address at password na nakarehistro sa iyong MagnetraPH account, pagkatapos ay piliin ang Mag-log in. Kung Google ang ginamit mo sa paggawa ng account, piliin ang Magpatuloy gamit ang Google. Kung wala ka pang account, piliin ang Gumawa ng account upang makapagsimula.",
    faq2q: "Nakalimutan ko ang password ko. Ano ang dapat kong gawin?",
    faq2a: "Sa login page, piliin ang Nakalimutan ang password? at ilagay ang email address na naka-link sa iyong account. Pagkatapos, sundin ang mga tagubilin sa email na ipapadala namin. Kung hindi mo makita ang email, tingnan ang iyong Spam o Junk folder. Kung hindi mo pa rin ma-reset ang iyong password, makipag-ugnayan sa MagnetraPH support.",
    faq3q: "Bakit hindi ako makapag-log in sa aking account?",
    faq3a: "Tiyaking tama ang iyong email address at password at maayos ang iyong internet connection. Kung hindi mo pa na-verify ang iyong email address, kumpletuhin muna ito. Kung hindi mo maalala ang iyong password, gamitin ang Nakalimutan ang password? sa login page. Kung ilang beses nang hindi nagtagumpay ang pag-log in, maghintay nang ilang minuto bago muling subukan. Kung nagpapatuloy ang problema, makipag-ugnayan sa support at ilarawan ang error na lumalabas, pero huwag kailanman ibahagi ang iyong password.",
    faq4q: "Hindi ko natanggap ang verification email. Ano ang dapat kong gawin?",
    faq4a: "Tiyaking tama ang email address na inilagay mo, pagkatapos ay tingnan ang iyong Spam o Junk folder. Kung wala pa rin ang email, mag-log in gamit ang iyong email address at password. Lalabas ang button na Ipadala ulit ang verification email pagkatapos mong mag-log in. Piliin ito, pagkatapos ay maghintay nang ilang minuto bago muling humiling. Kung hindi mo pa rin ito natatanggap, makipag-ugnayan sa MagnetraPH support.",
    faq6q: "Bakit hindi gumagana ang pag-log in gamit ang Google?",
    faq6a: "Kung binuksan mo ang MagnetraPH sa loob ng Facebook o Messenger, subukang buksan ang page sa regular na browser ng cellphone mo, gaya ng Chrome. Piliin ang Magpatuloy gamit ang Google at gamitin ang Google account na nakaugnay sa MagnetraPH. Kung hindi pa rin gumana, subukan muli mamaya.",
    faq9q: "Paano ako makikipag-ugnayan sa MagnetraPH support?",
    faq9a: "Kung kailangan mo ng tulong sa iyong account o sa pag-log in, maikling ilarawan ang problema at isama ang anumang error message na lumalabas. Para sa iyong seguridad, huwag isama sa mensahe ang iyong password o anumang verification o password reset link. Mag-email sa amin sa",
    faq5q: "Ligtas ba ang aking MagnetraPH account?",
    faq5a: "Gumagamit ang MagnetraPH ng mga panseguridad na hakbang upang makatulong na maprotektahan ang iyong account, kabilang ang email verification, reCAPTCHA, pagsusuri sa server, at HTTPS connection. Walang online service na makagagarantiya ng ganap na seguridad, kaya makatutulong ka rin. Gumamit ng matibay na password na hindi mo ginagamit sa ibang account, ingatan ang iyong login details, at huwag ibahagi ang iyong verification o password reset link. Kung may mapansin kang kahina-hinalang aktibidad, makipag-ugnayan agad sa MagnetraPH support.",
    faq8q: "Sino ang makakakita ng aking business data?",
    faq8a: "Sa kasalukuyang app, ang mga banner, quotation, at follow-up message na ginagawa mo ay pinoproseso sa browser mo at hindi ina-upload sa server ng MagnetraPH. Naka-save lamang sa device mo ang iyong Business Profile. Ang iniimbak lang ng server ay ang iyong account ID at email address para sa mga function na may kaugnayan sa account. Hiwalay na pinangangasiwaan ng Firebase ang impormasyong kailangan para sa pag-log in. Para sa karagdagang detalye, basahin ang aming Privacy Policy.",

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
