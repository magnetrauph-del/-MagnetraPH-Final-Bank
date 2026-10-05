// dashboard-settings.js - v2 (Phase 1 polish) - laman ng Settings ng Dashboard. Walang emoji.
// UI at controller LANG ito. Ang login, password, pagbura ng account at logout ay galing lahat sa frozen
// Auth Core; walang Firebase, walang fetch, walang Worker o Supabase call, walang storage dito
// (ang itsura ay sine-save ng ui-dashboard.js sa pamamagitan ng ctx.setTheme).
// Kontrata (galing sa ui-dashboard.js, hindi binago):
//   mountSettings({ body, user, target, ctx }) -> { show(target), closeTop() }   (isang beses lang tinatawag)
//   ctx: t, getLang, setLanguage, getTheme, setTheme, announce, isOffline, closeSettings, leave
// Account (read-only), Language, Appearance (light / dark / kapareho ng phone), Change password, Delete account, About, Log out.
// Ang mga password ay nasa input lang habang bukas ang form; binubura pagsara, hindi kailanman sine-save o nilo-log.
import { changePassword, deleteAccount, logout, passwordProblem, PASSWORD_MIN } from "./auth-core-shared.js";
import { cleanText } from "./security-core-shared.js"; // parehong linis ng pangalan na gamit ng greeting (nakaload na)

// Mga salitang dito lang ginagamit (para hindi lumaki ang dashboard-i18n.js na nilo-load sa simula)
const LOCAL = {
  en: {
    notSet: "Not set",
    showPasswords: "Show passwords",
    enterCurrent: "Enter your current password.",
    confirmNew: "Confirm your new password.",
    enterPasswordDelete: "Enter your password to continue.",
    weakServer: "This password doesn't meet the requirements. Try a longer one.",
    cancelled: "Cancelled. Nothing was changed.",
    working: "Please wait...",
    wrongGoogle: "That Google account doesn't match this one. Choose the account you signed in with.",
    langChanged: (name) => `Language changed to ${name}.`,
  },
  fil: {
    notSet: "Wala pang nakalagay",
    showPasswords: "Ipakita ang mga password",
    enterCurrent: "Ilagay ang kasalukuyang password mo.",
    confirmNew: "Ulitin ang bagong password mo.",
    enterPasswordDelete: "Ilagay ang password mo para magpatuloy.",
    weakServer: "Hindi pasado ang password na ito. Subukan ang mas mahaba.",
    cancelled: "Kinansela. Walang nabago.",
    working: "Sandali lang...",
    wrongGoogle: "Hindi tugma ang napiling Google account. Piliin ang account na ginamit mo sa pag-sign in.",
    langChanged: (name) => `Napalitan ang wika: ${name}.`,
  },
};
const NS = "http://www.w3.org/2000/svg";
const has = (o, k) => o != null && Object.prototype.hasOwnProperty.call(o, k);

export function mountSettings({ body, user, target, ctx }) {
  const T = (k, ...a) => ctx.t(k, ...a);
  const L = (k, ...a) => {
    const set = has(LOCAL, ctx.getLang()) ? LOCAL[ctx.getLang()] : LOCAL.en;
    const v = has(set, k) ? set[k] : LOCAL.en[k];
    return typeof v === "function" ? v(...a) : v;
  };

  // Galing lang sa Firebase Auth user na ibinigay ng ui-dashboard.js (hindi sa URL, storage o input)
  const providers = Array.isArray(user?.providerData) ? user.providerData.map((p) => p && p.providerId) : [];
  const hasPassword = providers.includes("password");
  const hasGoogle = providers.includes("google.com");
  const name = cleanText(user?.displayName); // "" kung wala o hindi string
  const email = typeof user?.email === "string" ? user.email : "";

  /* ---------- Maliliit na helper sa paggawa ng DOM (walang innerHTML) ---------- */
  const texts = []; // [node, () => string] para maisalin ulit kapag nagpalit ng wika
  const labels = []; // [node, attr, () => string]
  function h(tag, attrs = {}, ...kids) {
    const n = document.createElement(tag);
    for (const [k, v] of Object.entries(attrs)) if (v !== false && v != null) n.setAttribute(k, v === true ? "" : String(v));
    n.append(...kids.filter((k) => k != null && k !== false));
    return n;
  }
  function tx(tag, attrs, fn) { const n = h(tag, attrs); n.textContent = fn(); texts.push([n, fn]); return n; }
  function lab(n, attr, fn) { n.setAttribute(attr, fn()); labels.push([n, attr, fn]); return n; }
  function icon(name, cls) {
    const s = document.createElementNS(NS, "svg");
    for (const [k, v] of [["width", "24"], ["height", "24"], ["aria-hidden", "true"], ["focusable", "false"]]) s.setAttribute(k, v);
    if (cls) s.setAttribute("class", cls);
    const u = document.createElementNS(NS, "use");
    u.setAttribute("href", "#" + name);
    s.append(u);
    return s;
  }
  // Mahabang email o pangalan: puwedeng putulin pagkatapos ng mga marka (hal. "@", ".") at bawat 12 letrang walang
  // espasyo, para hindi lumampas sa screen. Buong "grapheme" ang hinahati (hindi nasisira ang accent o emoji).
  const seg = typeof Intl !== "undefined" && typeof Intl.Segmenter === "function" ? new Intl.Segmenter(undefined, { granularity: "grapheme" }) : null;
  const graphemes = (s) => (seg ? Array.from(seg.segment(s), (x) => x.segment) : Array.from(s));
  function wrapNode(value, marks) {
    const span = h("span", { class: "tName" });
    let part = "", run = 0;
    for (const ch of graphemes(value)) {
      part += ch;
      run = /^\s+$/.test(ch) ? 0 : run + 1;
      if (marks.includes(ch) || run >= 12) { span.append(document.createTextNode(part), h("wbr")); part = ""; run = 0; }
    }
    if (part) span.append(document.createTextNode(part));
    return span;
  }
  const visible = (n) => !!n && n.isConnected && n.getClientRects().length > 0;

  /* ---------- Account (read-only) ---------- */
  const method = [hasPassword && (() => T("methodPassword")), hasGoogle && (() => T("methodGoogle"))].filter(Boolean);
  const accH = tx("h3", { class: "gName", id: "set-acc-h", tabindex: "-1" }, () => T("account"));
  const accList = h("ul", { class: "toolList" },
    h("li", { class: "toolRow soon" }, h("span", { class: "tText" },
      tx("span", { class: "tDesc" }, () => T("accountName")),
      name ? wrapNode(name, "") : tx("span", { class: "tName" }, () => L("notSet")))),
    email ? h("li", { class: "toolRow soon" }, h("span", { class: "tText" },
      tx("span", { class: "tDesc" }, () => T("accountEmail")), wrapNode(email, "@.-_+"))) : null,
    method.length ? h("li", { class: "toolRow soon" }, h("span", { class: "tText" },
      tx("span", { class: "tDesc" }, () => T("accountMethod")),
      tx("span", { class: "tName" }, () => method.map((f) => f()).join(", ")))) : null);
  const accSec = h("section", { "aria-labelledby": "set-acc-h" }, accH, accList);

  /* ---------- Language ---------- */
  const langH = tx("h3", { class: "gName", id: "set-lang-h", tabindex: "-1" }, () => T("language"));
  const radios = [];
  const langRow = (value, key) => {
    const r = h("input", { type: "radio", name: "set-lang", value, id: "set-lang-" + value });
    radios.push(r);
    return h("label", { class: "toolRow", for: "set-lang-" + value }, r, h("span", { class: "tText" }, tx("span", { class: "tName" }, () => T(key))));
  };
  const langGroup = h("div", { class: "toolList", role: "radiogroup", "aria-labelledby": "set-lang-h" },
    langRow("en", "langEnglish"), langRow("fil", "langFilipino"));
  const syncRadios = () => radios.forEach((r) => { r.checked = r.value === ctx.getLang(); });
  syncRadios();
  radios.forEach((r) => r.addEventListener("change", () => {
    if (!r.checked) return;
    const now = ctx.setLanguage(r.value); // lokal na preference lang (mgpref_lang); walang reload
    renderTexts();
    syncRadios();
    ctx.announce(L("langChanged", T(now === "fil" ? "langFilipino" : "langEnglish")));
  }));
  const langSec = h("section", { "aria-labelledby": "set-lang-h" }, langH, langGroup);

  /* ---------- Appearance: light, dark o kapareho ng phone (lalabas lang kung kaya ng Dashboard) ---------- */
  const canTheme = typeof ctx.getTheme === "function" && typeof ctx.setTheme === "function";
  const THEME_NAME = { system: "themeSystem", light: "themeLight", dark: "themeDark" };
  const themeH = tx("h3", { class: "gName", id: "set-theme-h", tabindex: "-1" }, () => T("appearance"));
  const themeRadios = [];
  const themeRow = (value) => {
    const r = h("input", { type: "radio", name: "set-theme", value, id: "set-theme-" + value });
    themeRadios.push(r);
    return h("label", { class: "toolRow", for: "set-theme-" + value }, r, h("span", { class: "tText" }, tx("span", { class: "tName" }, () => T(THEME_NAME[value]))));
  };
  const themeGroup = h("div", { class: "toolList", role: "radiogroup", "aria-labelledby": "set-theme-h" },
    themeRow("system"), themeRow("light"), themeRow("dark"));
  const syncTheme = () => { const cur = canTheme ? ctx.getTheme() : "system"; themeRadios.forEach((r) => { r.checked = r.value === cur; }); };
  syncTheme();
  themeRadios.forEach((r) => r.addEventListener("change", () => {
    if (!r.checked || !canTheme) return;
    const now = ctx.setTheme(r.value); // lokal na preference lang (mgpref_theme); walang reload
    syncTheme();
    ctx.announce(T("themeChanged", T(THEME_NAME[now] || "themeSystem")));
  }));
  const themeSec = canTheme ? h("section", { "aria-labelledby": "set-theme-h" }, themeH, themeGroup) : null;

  /* ---------- Security: Change password + Delete account ---------- */
  const secH = tx("h3", { class: "gName", id: "set-sec-h", tabindex: "-1" }, () => T("security"));
  const rowButton = (id, iconName, key) => h("button", { type: "button", class: "toolRow", id, "aria-haspopup": "dialog", "aria-expanded": "false" },
    icon(iconName, "tIco"), h("span", { class: "tText" }, tx("span", { class: "tName" }, () => T(key))), icon("i-chevron", "tGo"));
  const pwRow = hasPassword ? rowButton("set-pw-row", "i-lock", "changePassword")
    : h("div", { class: "toolRow soon", id: "set-pw-note" }, icon("i-lock", "tIco"), h("span", { class: "tText" },
      tx("span", { class: "tName" }, () => T("changePassword")), tx("span", { class: "tDesc" }, () => T("googlePassword"))));
  const delRow = rowButton("set-del-row", "i-alert", "deleteAccount");
  const secSec = h("section", { "aria-labelledby": "set-sec-h" }, secH, h("div", { class: "toolList" }, pwRow, delRow));

  /* ---------- About ---------- */
  const aboutH = tx("h3", { class: "gName", id: "set-about-h", tabindex: "-1" }, () => T("about"));
  const link = (href, key) => tx("a", { href, target: "_blank", rel: "noopener noreferrer" }, () => T(key));
  const aboutSec = h("section", { "aria-labelledby": "set-about-h" }, aboutH,
    h("div", { class: "empty" },
      tx("p", { class: "emptyTitle" }, () => T("aboutName")),
      tx("p", { class: "emptyText" }, () => T("tagline")),
      tx("p", { class: "emptyText" }, () => T("aboutVersion")),
      tx("p", { class: "emptyText" }, () => T("aboutNoFunds"))),
    h("p", { class: "recaptcha" }, icon("i-lock"), h("span", {},
      tx("span", {}, () => T("recaptchaPre")), " ", link("https://policies.google.com/privacy", "recaptchaPrivacy"), " ",
      tx("span", {}, () => T("recaptchaAnd")), " ", link("https://policies.google.com/terms", "recaptchaTerms"), " ",
      tx("span", {}, () => T("recaptchaPost")))));

  /* ---------- Log out (frozen Auth Core) ---------- */
  const logoutBtn = tx("button", { type: "button", class: "btn", id: "set-logout" }, () => T("logout"));
  const logoutSec = h("div", { class: "toolList" }, logoutBtn);

  /* ---------- Sub-dialog (native <dialog>, nasa loob ng body para isara ito kasama ng Settings) ---------- */
  let busy = false;
  const openers = new WeakMap();
  const titles = new WeakMap(); // sheet -> heading nito
  function sheet(id, titleKey) {
    const d = h("dialog", { class: "sheet", id, "aria-labelledby": id + "-h" });
    const title = tx("h2", { id: id + "-h", tabindex: "-1" }, () => T(titleKey));
    const close = lab(h("button", { type: "button", class: "closeBtn" }, icon("i-close")), "aria-label", () => T("close"));
    close.addEventListener("click", () => closeSheet(d));
    d.append(h("div", { class: "sheetHead" }, title, close));
    d.addEventListener("cancel", (e) => { if (busy) e.preventDefault(); }); // Escape habang may ginagawa: huwag isara
    d.addEventListener("close", () => onSheetClosed(d));
    titles.set(d, title);
    return d;
  }
  function openSheet(d, opener, focusEl) {
    if (busy) { ctx.announce(L("working")); return; } // may tinatapos pa (hal. nagsara ang sheet habang naghihintay)
    if (d.open) return;
    openers.set(d, opener);
    if (opener) opener.setAttribute("aria-expanded", "true");
    resetForms();
    try { d.showModal(); } catch { d.setAttribute("open", ""); }
    (focusEl || titles.get(d)).focus();
  }
  function closeSheet(d) {
    if (!d.open || busy) return false;
    try { d.close(); } catch { d.removeAttribute("open"); onSheetClosed(d); }
    return true;
  }
  function onSheetClosed(d) {
    resetForms(); // burahin ang mga password sa input
    const opener = openers.get(d);
    openers.delete(d);
    if (opener) {
      opener.setAttribute("aria-expanded", "false");
      if (visible(opener)) opener.focus();
    }
  }
  const field = (id, key, attrs) => {
    const input = h("input", { class: "askInput", id, type: "password", spellcheck: "false", autocapitalize: "off", autocorrect: "off", ...attrs });
    return { input, el: h("div", {}, tx("label", { class: "tName", for: id }, () => T(key)), h("div", { class: "askRow" }, input)) };
  };
  const errorBox = (id) => { const p = h("p"); return { p, el: h("div", { class: "sheetError", id, role: "alert", hidden: true }, p) }; };
  const showError = (box, text) => { box.p.textContent = text || ""; box.el.hidden = !text; };
  function fieldError(box, input, text) {
    showError(box, text);
    if (input) { input.setAttribute("aria-invalid", "true"); input.focus(); }
  }
  // Resulta ng operasyon: sa loob ng sheet kung bukas pa; kung naisara (hal. Back habang naghihintay), sa ctx.announce
  function report(d, box, btn, text) {
    if (d.open) { showError(box, text); btn.focus(); } else ctx.announce(text);
  }

  /* --- Change password --- */
  const pwSheet = sheet("set-pw", "changePassword");
  const cur = field("set-pw-cur", "currentPassword", { autocomplete: "current-password", "aria-describedby": "set-pw-err" });
  const nw = field("set-pw-new", "newPassword", { autocomplete: "new-password", "aria-describedby": "set-pw-hint set-pw-err" });
  const cf = field("set-pw-cf", "confirmPassword", { autocomplete: "new-password", "aria-describedby": "set-pw-err" });
  const pwHint = h("p", { class: "sheetNote", id: "set-pw-hint" });
  const pwShow = h("input", { type: "checkbox", id: "set-pw-show" });
  const pwErr = errorBox("set-pw-err");
  const pwWork = h("p", { class: "sheetNote", role: "status" });
  const pwSubmit = tx("button", { type: "submit", class: "askBtn" }, () => T("changePassword"));
  const pwForm = h("form", { novalidate: true },
    h("div", { class: "toolList" }, cur.el, nw.el, pwHint, cf.el,
      h("label", { class: "toolRow", for: "set-pw-show" }, pwShow, h("span", { class: "tText" }, tx("span", { class: "tName" }, () => L("showPasswords")))),
      pwErr.el, pwWork, h("div", { class: "askRow" }, pwSubmit)));
  pwSheet.append(pwForm);

  /* --- Delete account --- */
  const delSheet = sheet("set-del", "deleteAccount");
  // Ang babala ay binabasa ng screen reader kasama ng password field / ng dialog (Google) at ng pindutan
  const delPw = hasPassword ? field("set-del-pw", "deletePassword", { autocomplete: "current-password", "aria-describedby": "set-del-warn set-del-err" }) : null;
  if (!delPw) delSheet.setAttribute("aria-describedby", "set-del-warn set-del-google");
  const delErr = errorBox("set-del-err");
  const delWork = h("p", { class: "sheetNote", role: "status" });
  const delSubmit = tx("button", { type: "submit", class: "btn", "aria-describedby": "set-del-warn" }, () => T("deleteConfirm"));
  const delForm = h("form", { novalidate: true },
    h("div", { class: "toolList" },
      h("p", { class: "offlineMsg", id: "set-del-warn" }, icon("i-alert", "oIco"), tx("span", {}, () => T("deleteWarn"))),
      delPw ? delPw.el : tx("p", { class: "sheetNote", id: "set-del-google" }, () => T("deleteGoogle")),
      delErr.el, delWork, h("div", { class: "askRow" }, delSubmit)));
  delSheet.append(delForm);

  /* ---------- Pagbuo ---------- */
  body.replaceChildren(...[accSec, langSec, themeSec, secSec, aboutSec, logoutSec, pwSheet, delSheet].filter(Boolean));

  /* ---------- Mga mensahe ---------- */
  const PW_KEYS = { short: "pwShort", long: "pwLong", repeat: "pwRepeat", digitsOnly: "pwDigitsOnly", mix: "pwMix", common: "pwCommon", email: "pwEmail" };
  const pwText = (code) => (has(PW_KEYS, code) ? (code === "short" ? T("pwShort", PASSWORD_MIN) : T(PW_KEYS[code])) : L("weakServer"));
  // Code lang ang tinitingnan; hindi kailanman ipinapakita ang teknikal na mensahe ng error
  function errText(err) {
    const c = String(err?.code || "");
    if (["auth/wrong-password", "auth/invalid-credential", "auth/invalid-login-credentials"].includes(c)) return T("errWrongPassword");
    if (c === "auth/too-many-requests") return T("errTooMany");
    if (c === "auth/requires-recent-login" || c === "app/requires-recent-login") return T("errRecentLogin");
    if (c === "auth/popup-blocked" || c === "app/popup-blocked") return T("errPopupBlocked");
    if (["auth/popup-closed-by-user", "auth/cancelled-popup-request", "auth/user-cancelled"].includes(c)) return L("cancelled");
    if (c === "auth/user-mismatch") return L("wrongGoogle");
    if (c === "app/google-account") return T("googlePassword");
    if (c === "app/weak-password") return pwText(err.reason);
    if (c === "auth/weak-password" || c === "auth/password-does-not-meet-requirements") return L("weakServer");
    if (c === "app/delete-failed") return T("errDeleteFailed");
    if (c === "app/delete-partial") return T("errDeletePartial");
    if (c === "auth/network-request-failed" || ["TimeoutError", "AbortError"].includes(err?.name) || /failed to fetch|networkerror|load failed/i.test(String(err?.message || ""))) return T("errNetwork");
    return T("generic");
  }
  function updateHint() {
    const v = nw.input.value;
    const p = v ? passwordProblem(v, email) : null;
    pwHint.textContent = !v ? "" : p ? pwText(p) : T("passwordOk");
  }

  /* ---------- Busy at pag-reset ---------- */
  // aria-disabled + readOnly (hindi "disabled") para hindi mawala ang focus habang naghihintay; ang "busy" ang humaharang
  function setBusy(on, btn, work) {
    busy = on;
    btn.setAttribute("aria-disabled", on ? "true" : "false");
    btn.setAttribute("aria-busy", on ? "true" : "false");
    work.textContent = on ? L("working") : "";
    [cur, nw, cf, delPw].forEach((f) => { if (f) f.input.readOnly = on; });
  }
  const clearInvalid = () => [cur, nw, cf, delPw].forEach((f) => f && f.input.removeAttribute("aria-invalid"));
  function resetForms() {
    clearInvalid();
    [cur, nw, cf, delPw].forEach((f) => { if (f) { f.input.value = ""; f.input.type = "password"; } });
    pwShow.checked = false;
    pwHint.textContent = "";
    showError(pwErr, "");
    showError(delErr, "");
  }

  /* ---------- Mga aksyon ---------- */
  nw.input.addEventListener("input", updateHint);
  [cur, nw, cf, delPw].forEach((f) => f && f.input.addEventListener("input", () => f.input.removeAttribute("aria-invalid")));
  pwShow.addEventListener("change", () => [cur, nw, cf].forEach((f) => { f.input.type = pwShow.checked ? "text" : "password"; }));
  if (hasPassword) pwRow.addEventListener("click", () => openSheet(pwSheet, pwRow, cur.input));
  delRow.addEventListener("click", () => openSheet(delSheet, delRow, delPw ? delPw.input : titles.get(delSheet)));

  pwForm.addEventListener("submit", async (e) => {
    e.preventDefault();
    if (busy) return;
    showError(pwErr, "");
    clearInvalid();
    if (ctx.isOffline()) return showError(pwErr, T("offlineNothingChanged"));
    const a = cur.input.value, b = nw.input.value, c = cf.input.value;
    if (!a) return fieldError(pwErr, cur.input, L("enterCurrent"));
    const p = passwordProblem(b, email);
    if (p) return fieldError(pwErr, nw.input, pwText(p));
    if (!c) return fieldError(pwErr, cf.input, L("confirmNew"));
    if (b !== c) return fieldError(pwErr, cf.input, T("passwordMismatch"));
    setBusy(true, pwSubmit, pwWork);
    try {
      await changePassword(a, b); // frozen Auth Core: re-auth + Firebase password rules
      setBusy(false, pwSubmit, pwWork);
      closeSheet(pwSheet);
      ctx.announce(T("passwordChanged"));
    } catch (err) {
      setBusy(false, pwSubmit, pwWork);
      report(pwSheet, pwErr, pwSubmit, errText(err));
    }
  });

  delForm.addEventListener("submit", async (e) => {
    e.preventDefault();
    if (busy) return;
    showError(delErr, "");
    clearInvalid();
    if (ctx.isOffline()) return showError(delErr, T("offlineNothingChanged"));
    if (delPw && !delPw.input.value) return fieldError(delErr, delPw.input, L("enterPasswordDelete"));
    setBusy(true, delSubmit, delWork);
    try {
      await deleteAccount(delPw ? delPw.input.value : undefined); // frozen Auth Core: re-auth + Worker + Firebase
    } catch (err) {
      setBusy(false, delSubmit, delWork);
      report(delSheet, delErr, delSubmit, errText(err));
      return;
    }
    if (delPw) delPw.input.value = ""; // hindi na kailangan; burahin agad
    // Nabura na at naka-sign out na: ang frozen guard ang magdadala sa Login (isang navigation lang).
    // Kung nandito pa rin pagkalipas ng ilang saglit: tanggalin ang exit guard (ctx.leave), saka ang frozen logout.
    setTimeout(async () => { try { await ctx.leave(); } catch {} logout(); }, 1500);
  });

  let leaving = false;
  logoutBtn.addEventListener("click", async () => {
    if (busy) { ctx.announce(L("working")); return; }
    if (leaving) return;
    leaving = true;
    logoutBtn.setAttribute("aria-disabled", "true");
    logoutBtn.setAttribute("aria-busy", "true");
    try { await ctx.leave(); } catch {}
    await logout(); // frozen Auth Core: sign out, linis ng mag_* (naiiwan ang mgpref_lang), punta sa Login
  });

  /* ---------- Wika: isalin ulit ang lahat ng text ng Settings nang hindi binubuo ulit (para hindi mawala ang focus) ---------- */
  function renderTexts() {
    texts.forEach(([n, fn]) => { n.textContent = fn(); });
    labels.forEach(([n, attr, fn]) => n.setAttribute(attr, fn()));
    if (nw.input.value) updateHint();
  }

  /* ---------- Kontrata ---------- */
  function show(tg) {
    switch (tg) {
      case "account": accH.focus(); break;
      case "language": (radios.find((r) => r.checked) || radios[0]).focus(); break;
      case "appearance": if (themeSec) (themeRadios.find((r) => r.checked) || themeRadios[0]).focus(); break;
      case "change-password":
        if (hasPassword) openSheet(pwSheet, pwRow, cur.input);
        else secH.focus(); // Google: ang paliwanag ay nasa ilalim ng Security
        break;
      case "delete-account": openSheet(delSheet, delRow, delPw ? delPw.input : titles.get(delSheet)); break;
      case "logout": logoutBtn.focus(); break; // hindi kusang nagla-logout
      case "about": aboutH.focus(); break;
      default: break;
    }
  }
  function closeTop() {
    const open = [pwSheet, delSheet].find((d) => d.open);
    if (!open) return false;
    if (busy) return true; // may ginagawa pa: manatiling bukas
    closeSheet(open);
    return true;
  }

  show(target);
  return { show, closeTop };
}
