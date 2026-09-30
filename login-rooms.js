// login-rooms.js - v19
// Controller ng login page. Direktang gumagamit ng mga shared module (walang window.* global).
// Ang tunay na proteksyon ay nasa Worker at Firebase; ang mga check dito ay para sa UX.
import { checkLock, addFail, resetLock, cleanEmail, isValidEmail } from "./security-core-shared.js";
import { t, getLang, setLang, applyStatic } from "./login-i18n.js";
import { initExitGuard } from "./exit-guard-shared.js";

// Hiwalay na kinakarga ang login (Firebase at auth-core), simula agad pagbukas ng page.
// Dahil dito, gumagana agad ang FAQ, wika, eye button, Back at mga check kahit mabagal,
// walang internet, o may problema sa Firebase. Ang mga login button lang ang maghihintay.
let coreMod = null;   // auth-core + auth kapag na-load na
let coreFail = "";    // maikling dahilan kapag hindi na-load (para madaling ma-diagnose)
const CORE_FILES = ["auth-core-shared.js", "firebase-init.js", "appcheck-shared.js"];
const FIREBASE_SDK = "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";

// Kapag hindi na-load: alamin kung kulang ang file, sira ang code, o walang koneksyon sa Firebase
async function diagnoseCore(e) {
  const m = String((e && e.message) || e || "");
  if (e && e.name === "SyntaxError") return m.replace(/https?:\/\/\S+/g, "").slice(0, 100).trim();
  const missing = [];
  await Promise.all(CORE_FILES.map((f) => fetch(f, { cache: "no-store" })
    .then((r) => { if (!r.ok) missing.push(f); }, () => missing.push(f))));
  if (missing.length) return "missing: " + missing.join(", ");
  try { await fetch(FIREBASE_SDK, { mode: "no-cors", cache: "no-store" }); }
  catch { return "Firebase (gstatic.com) unreachable"; }
  return m.replace(/https?:\/\/\S+/g, "").slice(0, 90).trim();
}

const corePromise = Promise.all([import("./auth-core-shared.js"), import("./firebase-init.js")])
  .then(([core, fb]) => (coreMod = { ...core, auth: fb.auth }))
  .catch(async (e) => {
    console.error("login core:", e && e.message);
    try { coreFail = await diagnoseCore(e); } catch { coreFail = ""; }
    return null;
  });
async function core() {
  const c = coreMod || (await corePromise);
  if (!c) { const e = new Error("load"); e.code = "app/load-failed"; throw e; }
  return c;
}

const DASHBOARD = "/dashboard.html";
const REDUCED = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

// "Welcome back!" para lang sa user na nakapag-login na dati sa phone na ito.
// Tanda lang ito (walang email o personal na data). Hindi "mag_" ang simula ng key para hindi
// mabura sa logout, dahil ang nag-logout ay bumabalik na user pa rin.
const RETURNING_KEY = "mgpref_returning";
const GREET_MS = 3400; // mga 2 hanggang 3 segundong nakikita pagkatapos lumabas ang page
const isReturning = () => { try { return localStorage.getItem(RETURNING_KEY) === "1"; } catch { return false; } };
const markReturning = () => { try { localStorage.setItem(RETURNING_KEY, "1"); } catch {} };
const $ = (id) => document.getElementById(id);

const IDS = [
  "loginForm", "hp_email", "email", "password", "emailField", "passField", "eyeBtn", "eyeOpen", "eyeClosed",
  "forgotLink", "helpLink", "btnLogin", "btnGoogle", "createLink", "status", "btnResend", "card", "langBtn",
  "sheet", "sheetBox", "helpContent", "forgotContent", "closeHelp", "closeForgot",
  "resetEmail", "resetField", "btnSendReset", "resetStatus", "emailSuggest", "capsHint", "btnLockReset",
];

/* ---------- Karaniwang mali sa spelling ng email domain ---------- */
const DOMAIN_TYPOS = {
  "gmail.com": ["gmial.com", "gmai.com", "gmal.com", "gamil.com", "gnail.com", "gmaill.com", "gmil.com", "gmali.com", "gmail.co", "gmail.con", "gmail.cm", "gmail.om", "gmailcom"],
  "yahoo.com": ["yaho.com", "yahooo.com", "yhoo.com", "yaoo.com", "yahoo.co", "yahoo.con", "yahoo.cm"],
  "hotmail.com": ["hotmal.com", "hotmial.com", "homail.com", "hotmail.co", "hotmail.con"],
  "outlook.com": ["outlok.com", "outloo.com", "outlook.co", "outlook.con"],
  "icloud.com": ["iclod.com", "icoud.com", "icloud.co", "icloud.con"],
};
function suggestEmail(value) {
  const at = value.lastIndexOf("@");
  if (at < 1) return null;
  const domain = value.slice(at + 1);
  for (const [right, typos] of Object.entries(DOMAIN_TYPOS)) {
    if (typos.includes(domain)) return value.slice(0, at + 1) + right;
  }
  return null;
}

/* ---------- Mga mensahe (key ng login-i18n.js) ---------- */
const ERROR_KEYS = {
  "auth/invalid-credential": "wrong",
  "auth/wrong-password": "wrong",
  "auth/user-not-found": "wrong",
  "auth/invalid-email": "invalidEmail",
  "auth/too-many-requests": "tooMany",
  "auth/network-request-failed": "network",
  "auth/user-disabled": "disabled",
  "auth/popup-closed-by-user": "googleCancel",
  "auth/cancelled-popup-request": "googleCancel",
  "auth/popup-blocked": "popupBlocked",
  "auth/account-exists-with-different-credential": "otherMethod",
  "app/in-app-browser": "inApp",
  "app/profile-failed": "profileFailed",
  "app/email-not-verified": "googleUnverified",
  "app/not-logged-in": "notLoggedIn",
};

// Ibinabalik ang [key, ...args] para ma-render ulit kapag nagpalit ng wika.
function messageFor(err, waitSeconds) {
  const code = err && err.code;
  if (code === "app/load-failed") return ["loadFailed", coreFail];
  if (code === "app/locked") return ["locked", Number(err.minutes) || 1];
  if (code === "app/cooldown") return ["cooldown", waitSeconds || 30];
  if (err && (err.name === "TimeoutError" || err.name === "AbortError")) return ["network"];
  if (ERROR_KEYS[code]) return [ERROR_KEYS[code]];
  // Hindi inaasahang error: ipakita ang code (hal. "auth/operation-not-allowed") para madaling ma-diagnose.
  // Code lang ito, hindi ang buong teknikal na mensahe, kaya ligtas ipakita.
  if (typeof code === "string" && /^[a-z]+\/[a-z0-9-]+$/i.test(code)) return ["genericCode", code];
  return ["generic"];
}

function init() {
  // Kapag may kulang, ipapakita ng login-boot.js ang error na ito sa page (hindi tahimik na patay na page)
  const missing = IDS.filter((id) => !$(id));
  if (missing.length) throw new Error("login.html is missing: " + missing.join(", "));
  window.__magLoginReady = true;

  const email = $("email"), password = $("password"), hp = $("hp_email");
  const emailField = $("emailField"), passField = $("passField"), card = $("card");
  const btnLogin = $("btnLogin"), btnGoogle = $("btnGoogle"), btnResend = $("btnResend");
  const statusEl = $("status"), resetStatus = $("resetStatus");
  const sheet = $("sheet"), sheetBox = $("sheetBox");
  const helpContent = $("helpContent"), forgotContent = $("forgotContent");
  const resetEmail = $("resetEmail"), resetField = $("resetField"), btnSendReset = $("btnSendReset");
  const createLink = $("createLink"), eyeBtn = $("eyeBtn"), langBtn = $("langBtn");
  const emailSuggest = $("emailSuggest"), capsHint = $("capsHint"), btnLockReset = $("btnLockReset");

  let busy = false;
  let leaving = false;
  let statusMsg = null; // { msg: [key, ...args], kind }
  let resetMsg = null;  // [key, ...args]
  let disarmExit = null; // itatakda sa ibaba ng initExitGuard
  let credError = false;  // pula ang dalawang field dahil mali ang email o password
  let suggestion = null;  // mungkahing email (hal. gmail.com)
  let verifyWatch = false; // nasa "i-verify ang email" na screen: titingnan ulit pagbalik sa app
  let lastVerifyCheck = 0;

  /* ---------- Wika ---------- */
  function renderLanguage() {
    applyStatic();
    const shown = password.type === "text";
    eyeBtn.setAttribute("aria-label", t(shown ? "hidePw" : "showPw"));
    statusEl.textContent = statusMsg ? t(...statusMsg.msg) : "";
    resetStatus.textContent = resetMsg ? t(...resetMsg) : "";
    if (suggestion) emailSuggest.textContent = t("didYouMean", suggestion);
  }

  /* ---------- Maliliit na tulong ---------- */
  function setStatus(msg, kind) {
    statusMsg = msg ? { msg, kind } : null;
    statusEl.textContent = msg ? t(...msg) : "";
    statusEl.className = kind === "info" ? "info" : "";
  }
  function setResetStatus(msg) {
    resetMsg = msg || null;
    resetStatus.textContent = msg ? t(...msg) : "";
  }
  function setBusy(on, spinner = false) {
    busy = on;
    btnLogin.disabled = on;
    btnGoogle.disabled = on;
    btnLogin.classList.toggle("loading", on && spinner);
    btnLogin.setAttribute("aria-busy", on ? "true" : "false");
  }
  function shake(node) {
    if (!node || REDUCED) return;
    node.classList.remove("shake");
    void node.offsetWidth;
    node.classList.add("shake");
    setTimeout(() => node.classList.remove("shake"), 400);
  }
  const fieldError = (f) => f.classList.add("error");
  const clearFieldError = (f) => f.classList.remove("error");
  function clearErrors() { clearFieldError(emailField); clearFieldError(passField); credError = false; }
  function hideResend() { btnResend.hidden = true; btnLockReset.hidden = true; verifyWatch = false; }

  function goDashboard() {
    markReturning();
    leaving = true;
    // Hintayin matanggal ang Back guard at matapos ang animation bago lumipat
    const cleaned = disarmExit ? disarmExit() : Promise.resolve();
    setStatus(["welcome"], "info");
    card.classList.add("page-exit");
    const shown = new Promise((r) => setTimeout(r, REDUCED ? 0 : 400));
    const go = () => location.replace(DASHBOARD);
    Promise.all([cleaned, shown]).then(go, go);
  }

  function showVerifyNotice() {
    setStatus(["verifyFirst"], "info");
    btnResend.hidden = false;
    verifyWatch = true;
  }

  // Pagbalik sa app (hal. galing sa Gmail matapos i-click ang verification link), tingnan kung
  // verified na. Kapag oo, diretso sa dashboard nang hindi na kailangang mag-login ulit.
  async function checkVerifiedAgain() {
    if (!verifyWatch || busy || leaving || document.visibilityState !== "visible") return;
    const now = Date.now();
    if (now - lastVerifyCheck < 3000) return;
    lastVerifyCheck = now;
    if (!coreMod) return;
    try {
      if ((await coreMod.refreshVerification()) && verifyWatch && !busy && !leaving) {
        verifyWatch = false;
        goDashboard();
      }
    } catch { /* tahimik: susubukan ulit sa susunod na pagbalik, o puwedeng mag-login */ }
  }

  function botTripped() {
    const v = hp.value.trim().toLowerCase();
    // Kapag nilagyan ng autofill ng browser ang nakatagong field ng sariling email ng user,
    // hindi iyon bot, kaya hindi haharangin ang totoong tao.
    if (v === "" || v === cleanEmail(email.value)) { hp.value = ""; return false; }
    setStatus(["blocked"]);
    return true;
  }

  /* ---------- Login ---------- */
  const BAD_CREDENTIALS = ["auth/invalid-credential", "auth/wrong-password", "auth/user-not-found"];
  // Tama ang password sa mga ito (ibang bagay ang kulang), kaya ire-reset ang bilang ng mali
  const PASSWORD_WAS_RIGHT = ["app/email-not-verified", "app/profile-failed"];

  async function onLoginError(err, em) {
    const code = err && err.code;
    if (PASSWORD_WAS_RIGHT.includes(code)) await resetLock(em, "login");
    if (code === "app/email-not-verified") { showVerifyNotice(); return; }
    if (BAD_CREDENTIALS.includes(code)) {
      // Hindi natin sinasabi kung alin ang mali (para hindi malaman ng hacker kung may account ang email),
      // kaya parehong pula. Binubura ang password at doon ang cursor, tulad ng Google at mga bangko.
      fieldError(emailField); fieldError(passField); credError = true;
      password.value = "";
      password.focus();
      shake(card);
      try { await addFail(em, "login"); setStatus(messageFor(err)); }
      catch (lock) { setStatus(messageFor(lock)); btnLockReset.hidden = false; }
      return;
    }
    if (code === "app/locked" || code === "auth/too-many-requests") { btnLockReset.hidden = false; }
    if (code === "auth/invalid-email") { fieldError(emailField); email.focus(); }
    shake(card);
    setStatus(messageFor(err));
  }

  async function doLogin(event) {
    event.preventDefault();
    if (busy || leaving) return;
    if (botTripped()) return;
    clearErrors();
    hideResend();

    const em = cleanEmail(email.value);
    const pw = password.value;
    // Sabay na tinitingnan ang email at password: pula ang bawat mali, hindi lang ang una.
    const emailBad = !isValidEmail(em);
    const passBad = !pw;
    if (emailBad || passBad) {
      if (emailBad) fieldError(emailField);
      if (passBad) fieldError(passField);
      shake(card);
      setStatus([emailBad && passBad ? "enterBoth" : emailBad ? "enterValidEmail" : "enterPassword"]);
      (emailBad ? email : password).focus();
      return;
    }

    if (navigator.onLine === false) { setStatus(["offline"]); return; }
    hideSuggestion();

    setBusy(true, true);
    try {
      await checkLock(em, "login");
      setStatus(["signingIn"], "info");
      const c = await core();
      await c.loginAccount(em, pw); // verified email + profile sa Worker
      await resetLock(em, "login");
      goDashboard();
    } catch (err) {
      await onLoginError(err, em);
      setBusy(false);
    }
  }

  async function doGoogle() {
    if (busy || leaving) return;
    if (botTripped()) return;
    clearErrors();
    hideResend();
    if (navigator.onLine === false) { setStatus(["offline"]); return; }
    setBusy(true);
    setStatus(["connectingGoogle"], "info");
    try {
      // Kapag na-load na (karaniwan), diretsong binubuksan ang Google popup habang "tap" pa,
      // para hindi ito harangin ng browser.
      const c = coreMod || (await core());
      const user = await c.loginGoogle();
      if (user) { goDashboard(); return; }
      // null = nag-redirect sa Google; hayaang naka-disable ang mga button
    } catch (err) {
      shake(card);
      setStatus(messageFor(err));
      setBusy(false);
    }
  }

  async function doResend() {
    btnResend.disabled = true;
    try {
      await (await core()).resendVerification();
      setStatus(["verifySent"], "info");
    } catch (err) {
      setStatus(messageFor(err, coreMod ? coreMod.resendWaitSeconds() : 0));
    } finally {
      btnResend.disabled = false;
    }
  }

  /* ---------- Reset password ---------- */
  async function doReset() {
    if (btnSendReset.disabled) return; // may ipinapadala pa
    const em = cleanEmail(resetEmail.value);
    clearFieldError(resetField);
    if (!isValidEmail(em)) {
      fieldError(resetField); shake(resetField); setResetStatus(["enterValidEmail"]); resetEmail.focus(); return;
    }
    if (navigator.onLine === false) { setResetStatus(["offline"]); return; }
    btnSendReset.disabled = true;
    setResetStatus(["sending"]);
    try {
      await (await core()).forgotPassword(em);
      setResetStatus(["resetDone"]); // hindi sinasabi kung may account o wala
    } catch (err) {
      setResetStatus(messageFor(err, coreMod ? coreMod.resetWaitSeconds() : 0));
    } finally {
      btnSendReset.disabled = false;
    }
  }

  /* ---------- Sheet (FAQ at reset) ---------- */
  let lastFocus = null;

  function openSheet(which, trigger) {
    lastFocus = trigger || document.activeElement;
    helpContent.classList.toggle("active", which === "help");
    forgotContent.classList.toggle("active", which === "forgot");
    sheetBox.setAttribute("aria-labelledby", which === "help" ? "helpTitle" : "forgotTitle");
    if (which === "forgot") {
      resetEmail.value = cleanEmail(email.value);
      setResetStatus(null);
      clearFieldError(resetField);
    }
    sheet.classList.add("open");
    sheet.setAttribute("aria-hidden", "false");
    setTimeout(() => { if (sheet.classList.contains("open")) (which === "help" ? $("closeHelp") : resetEmail).focus(); }, REDUCED ? 0 : 150);
  }

  function closeSheet() {
    if (!sheet.classList.contains("open")) return;
    sheet.classList.remove("open");
    sheet.setAttribute("aria-hidden", "true");
    if (lastFocus && typeof lastFocus.focus === "function") lastFocus.focus();
  }

  function trapTab(e) {
    if (e.key !== "Tab" || !sheet.classList.contains("open")) return;
    const active = sheetBox.querySelector(".sContent.active");
    if (!active) return;
    const items = Array.from(active.querySelectorAll("button, input, a[href], summary")).filter((n) => !n.disabled && n.getClientRects().length);
    if (!items.length) return;
    const first = items[0], last = items[items.length - 1];
    if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
    else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
  }

  /* ---------- Mga event ---------- */
  $("loginForm").addEventListener("submit", doLogin);
  btnGoogle.addEventListener("click", doGoogle);
  btnResend.addEventListener("click", doResend);
  btnSendReset.addEventListener("click", doReset);
  resetEmail.addEventListener("keydown", (e) => { if (e.key === "Enter") { e.preventDefault(); doReset(); } });

  langBtn.addEventListener("click", () => {
    setLang(getLang() === "en" ? "fil" : "en");
    renderLanguage();
  });

  eyeBtn.addEventListener("click", () => {
    const show = password.type === "password";
    password.type = show ? "text" : "password";
    // toggleAttribute (hindi .hidden): ang SVG element ay walang .hidden property
    $("eyeClosed").toggleAttribute("hidden", show);
    $("eyeOpen").toggleAttribute("hidden", !show);
    eyeBtn.setAttribute("aria-label", t(show ? "hidePw" : "showPw"));
    eyeBtn.setAttribute("aria-pressed", show ? "true" : "false");
  });

  btnLockReset.addEventListener("click", () => openSheet("forgot", btnLockReset));
  $("forgotLink").addEventListener("click", (e) => { e.preventDefault(); openSheet("forgot", e.currentTarget); });
  $("helpLink").addEventListener("click", (e) => { e.preventDefault(); openSheet("help", e.currentTarget); });
  $("closeHelp").addEventListener("click", closeSheet);
  $("closeForgot").addEventListener("click", closeSheet);
  sheet.addEventListener("click", (e) => { if (e.target === sheet) closeSheet(); });
  document.addEventListener("keydown", (e) => { if (e.key === "Escape") closeSheet(); trapTab(e); });

  // Kapag mali ang email o password (parehong pula), aalisin ang pula sa dalawa pag nag-type ulit.
  email.addEventListener("input", () => {
    if (credError) clearErrors(); else clearFieldError(emailField);
    hideSuggestion();
  });
  password.addEventListener("input", () => { if (credError) clearErrors(); else clearFieldError(passField); });

  // Mungkahi kapag mali ang spelling ng email domain
  function hideSuggestion() { suggestion = null; emailSuggest.hidden = true; }
  function checkSuggestion() {
    suggestion = suggestEmail(cleanEmail(email.value));
    emailSuggest.hidden = !suggestion;
    if (suggestion) emailSuggest.textContent = t("didYouMean", suggestion);
  }
  email.addEventListener("blur", checkSuggestion);
  emailSuggest.addEventListener("click", () => {
    if (!suggestion) return;
    email.value = suggestion;
    hideSuggestion();
    clearErrors();
    password.focus();
  });

  // Enter sa email: lipat sa password kung wala pang laman (hindi agad magla-login)
  email.addEventListener("keydown", (e) => {
    if (e.key === "Enter" && !password.value) { e.preventDefault(); checkSuggestion(); password.focus(); }
  });

  // Babala kapag naka-on ang Caps Lock
  const capsCheck = (e) => {
    if (typeof e.getModifierState === "function") capsHint.hidden = !e.getModifierState("CapsLock");
  };
  password.addEventListener("keydown", capsCheck);
  password.addEventListener("keyup", capsCheck);
  password.addEventListener("blur", () => { capsHint.hidden = true; });

  // Pagbalik sa tab o app habang naghihintay ng verification
  document.addEventListener("visibilitychange", checkVerifiedAgain);
  window.addEventListener("focus", checkVerifiedAgain);

  // Kapag bumalik gamit ang Back (hal. galing sa Create account o sa Google) at ibinalik ng
  // browser ang lumang page, ibalik sa normal ang itsura para hindi ma-stuck ang mga button.
  window.addEventListener("pageshow", (e) => {
    if (!e.persisted) return;
    leaving = false;
    card.classList.remove("page-exit");
    setBusy(false);
    if (statusMsg && ["signingIn", "connectingGoogle", "welcome"].includes(statusMsg.msg[0])) setStatus(null);
  });

  // Offline / online
  window.addEventListener("offline", () => setStatus(["offline"]));
  window.addEventListener("online", () => { if (statusMsg && statusMsg.msg[0] === "offline") setStatus(null); });
  resetEmail.addEventListener("input", () => clearFieldError(resetField));

  createLink.addEventListener("click", (e) => {
    if (e.metaKey || e.ctrlKey || e.shiftKey || e.button !== 0) return;
    e.preventDefault();
    leaving = true;
    card.classList.add("page-exit");
    setTimeout(() => location.assign(createLink.href), REDUCED ? 0 : 350);
  });

  // Back button: isara muna ang sheet; kung wala, "Tap back again to exit"
  disarmExit = initExitGuard({
    getText: () => t("exitToast"),
    closeOverlay: () => {
      if (!sheet.classList.contains("open")) return false;
      closeSheet();
      return true;
    },
  });

  /* ---------- Welcome back ---------- */
  // Lumalabas lang sa bumabalik na user, tapos dahan-dahang nawawala at umaakyat ang form.
  // Nawawala rin agad kapag nagsimula nang mag-type ang user.
  const greet = $("welcomeBack");
  if (greet && isReturning() && !new URLSearchParams(location.search).has("verify")) {
    greet.hidden = false;
    let gone = false;
    const hideGreet = () => {
      if (gone) return;
      gone = true;
      greet.classList.add("greetOut");
      setTimeout(() => { greet.hidden = true; }, REDUCED ? 0 : 650);
    };
    setTimeout(hideGreet, GREET_MS);
    email.addEventListener("focus", hideGreet, { once: true });
    password.addEventListener("focus", hideGreet, { once: true });
  }

  /* ---------- Simula ---------- */
  renderLanguage();
  (async function start() {
    const c = await corePromise;
    if (!c) {
      // Gumagana pa rin ang FAQ, wika at iba pa; ang login lang ang hindi pa puwede
      if (!busy) setStatus(["loadFailed", coreFail]);
      return;
    }
    try {
      const user = await c.handleGoogleRedirect(); // kung galing sa Google redirect
      if (user) { goDashboard(); return; }
    } catch (err) {
      setStatus(messageFor(err));
    }

    // ?verify=1: galing sa signup, sa "Continue" ng verification email, o sa dashboard guard.
    // Kinukuha ang pinakabagong status sa Firebase (hindi ang lumang naka-save sa phone).
    if (new URLSearchParams(location.search).get("verify") === "1") {
      await c.auth.authStateReady();
      if (!c.auth.currentUser) {
        // Hal. binuksan ang link sa ibang browser (Gmail app): walang naka-login dito
        setStatus(["verifiedLogin"], "info");
        return;
      }
      try {
        if (await c.refreshVerification()) { goDashboard(); return; }
        showVerifyNotice();
      } catch (err) {
        setStatus(messageFor(err));
        verifyWatch = true; // susubukan ulit pagbalik sa app
      }
      return;
    }

    // guardGuest pa rin ang nagpapasya at naglilipat; tinatanggal lang muna ang Back guard kung lilipat
    await c.auth.authStateReady();
    if (c.auth.currentUser && c.auth.currentUser.emailVerified && disarmExit) await disarmExit();
    await c.guardGuest(DASHBOARD); // naka-login na at verified: diretso sa dashboard
  })();
}

init();
