// ui-create.js - v12 - controller ng Create Account page (ES module).
// v12 (design pass): spinner sa Create button habang gumagawa (tulad ng login), sa halip na palitan ang text.
// Direktang gumagamit ng mga frozen shared module; walang window.* global at walang sariling auth.
// Ginagawa lang dito: account sa Firebase Auth + verification email (lahat sa AuthCore createAccount),
// tapos lilipat sa login.html?verify=1. Walang room at walang Firestore dito. Ang profile ay ginagawa ng
// frozen Login flow pagkatapos ma-verify ang email (Worker + Supabase).
// Ang mga check dito ay para sa UX lang; ang Firebase Auth at ang Worker ang tunay na nagpapasya.
import { cleanEmail, isValidEmail } from "./security-core-shared.js";

// Hiwalay na kinakarga ang auth-core (pati Firebase), tulad ng login page: gumagana agad ang form,
// eye button at Back kahit mabagal, offline o may problema sa Firebase. Ang pag-create lang ang maghihintay.
let coreMod = null;
const corePromise = import("./auth-core-shared.js")
  .then((m) => (coreMod = m))
  .catch((e) => {
    console.error("create core:", e && e.message);
    return null;
  });
async function core() {
  const c = coreMod || (await corePromise);
  if (!c) { const e = new Error("load"); e.code = "app/load-failed"; throw e; }
  return c;
}

// Parehong path na ginagamit ng AuthCore at ng login page
const LOGIN = "/login.html";
const VERIFY = "/login.html?verify=1"; // kapareho ng "Continue" link ng verification email sa AuthCore
const REDUCED = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
const $ = (id) => document.getElementById(id);
const has = (o, k) => Object.prototype.hasOwnProperty.call(o, k);

/* ---------- Mga mensahe (English) ---------- */
// Ang password rules ay galing lahat sa AuthCore passwordProblem(). Dito ay text lang para sa bawat
// code na ibinabalik nito, hindi hiwalay na patakaran.
const PW_TEXT = {
  short: () => (coreMod ? `Use at least ${coreMod.PASSWORD_MIN} characters.` : "Use a longer password."),
  long: () => "This password is too long. Use a shorter one.",
  repeat: () => "Too many repeated characters. Mix it up more.",
  digitsOnly: () => "Don't use numbers only, like a phone number or birthday.",
  mix: () => "Add letters plus a number or symbol, or use a longer passphrase.",
  common: () => "This password is easy to guess. Add a word of your own.",
  email: () => "Don't use your email or name in your password.",
};
const TEXT = {
  enterValidEmail: "Enter a valid email address.",
  enterPassword: "Create a password.",
  confirmPassword: "Confirm your password.",
  mismatch: "Passwords don't match.",
  pwOk: "Password looks good.",
  emailInUse: "An account with this email already exists. Log in instead, or reset your password on the login page.",
  invalidEmail: "That email address is not valid.",
  weakServer: "This password doesn't meet the requirements. Try a longer one.",
  tooMany: "Too many attempts. Please wait a few minutes and try again.",
  network: "No connection. Check your internet and try again.",
  offline: "You are offline. Check your internet connection.",
  loadFailed: "Could not load sign-up. Check your internet, then refresh the page.",
  blocked: "Sign-up blocked. Refresh the page and try again.",
  creating: "Creating your account...",
  created: "Account created. Opening the verification page...",
  generic: "Something went wrong. Please try again.",
};
const genericCode = (c) => `Something went wrong. Please try again. (Code: ${c})`;
const pwText = (code) => (has(PW_TEXT, code) ? PW_TEXT[code]() : TEXT.weakServer);

// Batay lang sa error code (Firebase o AuthCore), hindi sa laman ng message.
function errorInfo(err) {
  const code = err && err.code;
  if (code === "app/weak-password") return { field: "password", text: pwText(err.reason) };
  if (code === "auth/email-already-in-use") return { field: "email", text: TEXT.emailInUse };
  if (code === "auth/invalid-email") return { field: "email", text: TEXT.invalidEmail };
  if (code === "auth/weak-password" || code === "auth/password-does-not-meet-requirements") {
    return { field: "password", text: TEXT.weakServer };
  }
  if (code === "auth/too-many-requests") return { text: TEXT.tooMany };
  if (code === "auth/network-request-failed" || (err && (err.name === "TimeoutError" || err.name === "AbortError"))) {
    return { text: TEXT.network };
  }
  if (code === "app/load-failed") return { text: TEXT.loadFailed };
  // Hindi inaasahang error: code lang ang ipapakita (hindi ang buong teknikal na mensahe), gaya ng login
  if (typeof code === "string" && /^[a-z]+\/[a-z0-9-]+$/i.test(code)) return { text: genericCode(code) };
  return { text: TEXT.generic };
}

function init() {
  const form = $("createForm"), hp = $("hp_email_create"), card = $("card");
  const email = $("email"), password = $("password"), confirm = $("confirm");
  const fields = { email: $("emailField"), password: $("passField"), confirm: $("confirmField") };
  const inputs = { email, password, confirm };
  const btnCreate = $("btnCreate"), statusEl = $("status"), hint = $("pwdHint");

  let busy = false;
  let leaving = false;
  let statusKind = "";
  let backFallback = 0;
  let backFailed = false; // hindi gumana ang history.back(): gagamit na ng replace sa susunod

  /* ---------- Maliliit na tulong ---------- */
  function setStatus(text, kind) {
    statusEl.textContent = text || "";
    statusKind = text ? kind || "error" : "";
    statusEl.className = kind === "info" ? "info" : "";
  }
  function setBusy(on) {
    busy = on;
    btnCreate.disabled = on;
    // Spinner (tulad ng login). Hindi pinapalitan ang text para hindi mabura ang icon;
    // ang #status ang nagsasabi ng "Creating your account..." (naririnig din ng screen reader).
    btnCreate.classList.toggle("loading", on);
    btnCreate.setAttribute("aria-busy", on ? "true" : "false");
  }
  function shake(node) {
    if (!node || REDUCED) return;
    node.classList.remove("shake");
    void node.offsetWidth;
    node.classList.add("shake");
    setTimeout(() => node.classList.remove("shake"), 400);
  }
  // Mensahe ng bawat maling field. Kapag inayos ng user ang isang field, mawawala ang mensahe nito
  // at ang susunod na natitirang mali (o wala na) ang ipapakita, para walang lumang pulang mensahe.
  const fieldMsgs = {};
  function markField(name, text) {
    fields[name].classList.add("error");
    inputs[name].setAttribute("aria-invalid", "true");
    fieldMsgs[name] = text;
  }
  function clearField(name) {
    if (!fieldMsgs[name]) return;
    delete fieldMsgs[name];
    fields[name].classList.remove("error");
    inputs[name].removeAttribute("aria-invalid");
    if (statusKind !== "error") return;
    const next = Object.keys(fields).find((n) => fieldMsgs[n]);
    setStatus(next ? fieldMsgs[next] : "");
  }
  function clearErrors() {
    Object.keys(fields).forEach((n) => {
      delete fieldMsgs[n];
      fields[n].classList.remove("error");
      inputs[n].removeAttribute("aria-invalid");
    });
  }

  // Gabay habang nagta-type: galing sa AuthCore passwordProblem(). Hindi pula; gabay lang.
  function updateHint() {
    if (!coreMod) return;
    const pw = password.value;
    const problem = pw ? coreMod.passwordProblem(pw, cleanEmail(email.value)) : "short";
    hint.textContent = pw && !problem ? TEXT.pwOk : pwText(problem);
    hint.classList.toggle("ok", !!pw && !problem);
  }

  // Pang-UX na salaan lang ng simpleng bot (nakatagong field). Ang tunay na proteksyon ay ang App Check
  // at Firebase Auth. Kapag nilagyan ng autofill ng sariling email ng user, hindi iyon bot.
  function botTripped() {
    const v = hp.value.trim().toLowerCase();
    if (v === "" || v === cleanEmail(email.value)) { hp.value = ""; return false; }
    setStatus(TEXT.blocked);
    return true;
  }

  /* ---------- Create account ---------- */
  async function doCreate(event) {
    event.preventDefault();
    if (busy || leaving) return;
    if (botTripped()) return;
    clearErrors();

    const em = cleanEmail(email.value);
    const pw = password.value;
    const cf = confirm.value;

    // Sabay na tinitingnan ang lahat ng field: pula ang bawat mali, hindi lang ang una.
    const bad = [];
    if (!isValidEmail(em)) bad.push(["email", TEXT.enterValidEmail]);
    if (!pw) bad.push(["password", TEXT.enterPassword]);
    else if (coreMod) {
      const problem = coreMod.passwordProblem(pw, em);
      if (problem) bad.push(["password", pwText(problem)]);
    }
    if (pw && !cf) bad.push(["confirm", TEXT.confirmPassword]);
    else if (pw && cf !== pw) bad.push(["confirm", TEXT.mismatch]);
    if (bad.length) {
      bad.forEach(([name, text]) => markField(name, text));
      setStatus(bad[0][1]);
      inputs[bad[0][0]].focus();
      shake(card);
      return;
    }

    if (navigator.onLine === false) { setStatus(TEXT.offline); return; }

    setBusy(true);
    setStatus(TEXT.creating, "info");
    try {
      const c = await core();
      // Sinusuri ulit ng AuthCore ang password bago gumawa (app/weak-password kapag hindi pasado),
      // gumagawa ng Firebase Auth account, at nagpapadala ng verification email.
      await c.createAccount(em, pw);
      setStatus(TEXT.created, "info");
      goVerify();
    } catch (err) {
      const info = errorInfo(err);
      if (info.field) { markField(info.field, info.text); inputs[info.field].focus(); }
      shake(card);
      setStatus(info.text);
      setBusy(false);
    }
  }

  /* ---------- Paglipat ---------- */
  // Bagong account (hindi pa verified): sa verify screen ng login, hindi sa dashboard.
  // replace: hindi na maiiwan ang Create sa history.
  function goVerify() {
    leaving = true;
    card.classList.add("page-exit");
    setTimeout(() => location.replace(VERIFY), REDUCED ? 0 : 400);
  }

  // Galing ba sa login page ang user (parehong site)?
  function cameFromLogin() {
    try {
      const r = new URL(document.referrer);
      return r.origin === location.origin && /\/login(\.html)?$/.test(r.pathname);
    } catch { return false; }
  }

  // Pabalik sa Login nang walang dagdag na history entry:
  // - galing sa Login: history.back(), kaya ang dating Login entry (at ang Back guard nito) ang babalikan
  // - direktang binuksan ang Create: location.replace, kaya ang Create ay napapalitan ng Login
  function goLogin(e) {
    if (e && (e.metaKey || e.ctrlKey || e.shiftKey || e.altKey || (typeof e.button === "number" && e.button !== 0))) return;
    if (e) e.preventDefault();
    // Habang ginagawa ang account, huwag munang umalis (para matapos ang verification email)
    if (leaving || busy) return;
    leaving = true;
    card.classList.add("page-exit");
    setTimeout(() => {
      if (!backFailed && cameFromLogin() && history.length > 1) {
        history.back();
        // Kung hindi umalis ang page, ibalik ang form (hindi magdadagdag ng history entry).
        // Sa susunod na pindot, replace na ang gagamitin.
        backFallback = setTimeout(() => {
          backFailed = true;
          leaving = false;
          card.classList.remove("page-exit");
        }, 2500);
      } else {
        location.replace(LOGIN);
      }
    }, REDUCED ? 0 : 350);
  }

  /* ---------- Eye buttons ---------- */
  function bindEye(btn, input, closedId, openId, showLabel, hideLabel) {
    btn.addEventListener("click", () => {
      const show = input.type === "password";
      input.type = show ? "text" : "password";
      // toggleAttribute (hindi .hidden): ang SVG element ay walang .hidden property
      $(closedId).toggleAttribute("hidden", show);
      $(openId).toggleAttribute("hidden", !show);
      btn.setAttribute("aria-label", show ? hideLabel : showLabel);
      btn.setAttribute("aria-pressed", show ? "true" : "false");
    });
  }
  bindEye($("eyeBtn1"), password, "eyeClosed1", "eyeOpen1", "Show password", "Hide password");
  bindEye($("eyeBtn2"), confirm, "eyeClosed2", "eyeOpen2", "Show confirm password", "Hide confirm password");

  /* ---------- Mga event ---------- */
  // Enter sa loob ng form lang nagsu-submit (native na submit). Walang Enter handler sa buong page,
  // kaya ang Enter sa Back, Log in o eye button ay hindi gagawa ng account.
  form.addEventListener("submit", doCreate);
  setBusy(false); // handa na ang page: puwede nang pindutin ang Create Account (disabled ito sa HTML)

  // Enter sa email o password: lipat sa susunod na field kung wala pang laman (hindi agad magsu-submit)
  email.addEventListener("keydown", (e) => {
    if (e.key === "Enter" && !e.isComposing && !password.value) { e.preventDefault(); password.focus(); }
  });
  password.addEventListener("keydown", (e) => {
    if (e.key === "Enter" && !e.isComposing && !confirm.value) { e.preventDefault(); confirm.focus(); }
  });

  email.addEventListener("input", () => { clearField("email"); updateHint(); });
  password.addEventListener("input", () => { clearField("password"); updateHint(); });
  confirm.addEventListener("input", () => clearField("confirm"));

  $("backBtn").addEventListener("click", goLogin);
  $("loginLink").addEventListener("click", goLogin);

  // Kapag umalis ang page, huwag nang ituloy ang fallback
  window.addEventListener("pagehide", () => clearTimeout(backFallback));

  // Kapag ibinalik ng browser ang lumang page gamit ang Back o Forward (bfcache),
  // ibalik sa normal ang itsura para hindi maiwang nakatago ang form o naka-disable ang button.
  window.addEventListener("pageshow", (e) => {
    if (!e.persisted) return;
    clearTimeout(backFallback);
    leaving = false;
    card.classList.remove("page-exit");
    setBusy(false);
    if (statusKind === "info") setStatus("");
  });

  /* ---------- Simula ---------- */
  (async function start() {
    const c = await corePromise;
    if (!c) {
      // Gumagana pa rin ang form, eye at Back; ang pag-create lang ang hindi pa puwede
      if (!busy) setStatus(TEXT.loadFailed);
      return;
    }
    updateHint();
    // Naka-login na at verified: diretso sa dashboard (parehong frozen guard ng login page)
    try { await c.guardGuest(); } catch {}
  })();
}

init();
