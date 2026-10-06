// ui-dashboard.js - v4 (P0/P1) - controller ng Dashboard. Walang emoji.
// v4: Help sheet na may Help Center at "Mag-report ng problema" (report.js; email app ng user, walang server),
// Settings: Tunog (sound.js, naka-off sa simula), Friendly Care on/off, Privacy at data (pagbura ng Business Profile sa
// phone na ito), Night Mode Soft Indigo, at tamang icon ng hapon (araw hanggang 15:59, papalubog mula 16:00).
// ANO ANG MANGYAYARI kapag gumamit ang user (C3). Ang login check, Firebase at App Check ay galing lahat
// sa frozen Auth Core (guardDashboard); walang sariling Firebase, token o API call dito.
// - Nakatago ang #app hanggang makumpirma ng Auth Core ang login. Signed out: Login. Hindi verified: verify page.
// - Ang pangalan sa bati ay Firebase Auth displayName lang (C1); walang email, walang user ID.
// - Bati: sandali lang (8 segundo), isang beses bawat login session (mag_greeted sa sessionStorage, na binubura ng
//   frozen logout). Nagfe-fade sa iisang puwang, kaya walang gumagalaw sa page.
// - Welcome: bagong account lang (14 araw pababa, ayon sa Firebase Auth creationTime) at hindi pa isinara sa device
//   na ito (mgpref_welcome). Walang ebidensya, walang welcome.
// - Easy Actions: limang pagpipilian; isang tap = isang rekomendasyon at isang link papunta sa tool. Lokal lang.
// - Ask Magnetra V1: lokal na paghahanap sa dashboard-tools.js; walang network, hindi AI. Nasa "All tools" na.
// - Itsura: light, dark o kapareho ng phone (mgpref_theme); ang theme-boot.js ang naglalagay bago lumabas ang page.
// - Settings: dito ang pagbukas at pagsara; ang laman ay sa dashboard-settings.js, nilo-load lang kapag binuksan.
// - Phase 1.1: Profile sheet (My Profile, Business Profile, Settings, Help, Log out), "Iba ang kailangan ko",
//   Friendly Care (may ebidensya lang: 3+ natapos na gawain sa session, isang beses bawat session), late-night na bati.
// - Huling ayos bago i-upload: Taglish ang default na wika kapag wala pang pinili (local-state.js); sa madaling-araw,
//   "Hi, Juan." + isang tahimik na linya mula sa sinuring listahan (ayon sa petsa), hindi pormal na bati. Lokal na oras lang.
//   Ang Business Profile at ang bilang ng natapos ay nasa local-state.js (phone lang; binubura ng frozen logout).
import { guardDashboard, logout } from "./auth-core-shared.js";
import { initExitGuard } from "./exit-guard-shared.js";
import { cleanText } from "./security-core-shared.js";
import { t, applyStatic, greetingFor, greetingNote, periodFor, getLang, setLang } from "./dashboard-i18n.js?v=4";
import { GROUPS, STATUS, getGroup, getTool, getSetting, toolsInGroup, groupSummary, findMatches,
  freeTools, EASY_STEPS, getEasyStep, easyHref } from "./dashboard-tools.js?v=4";
import { BIZ_LIMITS, readBusinessProfile, saveBusinessProfile, readDone, doneTotal, careShown, setCareShown,
  careEnabled, setCareEnabled } from "./local-state.js?v=2";
import { soundOn, setSoundOn, playDone } from "./sound.js?v=1";
import { createReport } from "./report.js?v=1";

const $ = (id) => document.getElementById(id);
const el = {
  loader: $("loader"), app: $("app"), appError: $("appError"), offlineMsg: $("offlineMsg"),
  hello: $("hello"), greeting: $("greeting"), greetText: $("greetText"), greetNote: $("greetNote"), greetUse: $("greetUse"),
  welcome: $("welcome"), welcomeStart: $("welcomeStart"), welcomeLater: $("welcomeLater"),
  easyTitle: $("easyTitle"), easyHelpBtn: $("easyHelpBtn"), easyHelp: $("easyHelp"), easyList: $("easyList"),
  easyDialog: $("easyDialog"), easyDialogTitle: $("easyDialogTitle"), easyDialogText: $("easyDialogText"), easyDialogClose: $("easyDialogClose"),
  easyGo: $("easyGo"), easyMoreBtn: $("easyMoreBtn"), easyMore: $("easyMore"),
  viewAll: $("viewAll"), allSection: $("allSection"),
  profileBtn: $("profileBtn"), profileBtnName: $("profileBtnName"), askForm: $("askForm"), askInput: $("askInput"), askStatus: $("askStatus"), askResults: $("askResults"),
  quickSection: $("quickSection"), quickList: $("quickList"),
  groupDialog: $("groupDialog"), groupTitle: $("groupDialogTitle"), groupDesc: $("groupDialogDesc"), groupList: $("groupToolList"), groupClose: $("groupDialogClose"),
  settingsDialog: $("settingsDialog"), settingsTitle: $("settingsTitle"), settingsClose: $("settingsClose"), settingsBody: $("settingsBody"),
  settingsLoading: $("settingsLoading"), settingsError: $("settingsError"), settingsRetry: $("settingsRetry"),
  profileDialog: $("profileDialog"), profileName: $("profileName"), profileEmail: $("profileEmail"), profileClose: $("profileClose"),
  profMine: $("profMine"), profBiz: $("profBiz"), profBizDesc: $("profBizDesc"), profSettings: $("profSettings"), profHelp: $("profHelp"),
  profLogout: $("profLogout"),
  bizDialog: $("bizDialog"), bizTitle: $("bizTitle"), bizClose: $("bizClose"), bizForm: $("bizForm"), bizName: $("bizNameIn"),
  bizContact: $("bizContactIn"), bizStatus: $("bizStatus"),
  helpDialog: $("helpDialog"), helpTitle: $("helpTitle"), helpClose: $("helpClose"),
  care: $("care"), careText: $("careText"), careOk: $("careOk"), helpReport: $("helpReport"),
};

let user = null;          // Firebase Auth user mula sa guardDashboard; para sa display lang
let started = false;
let askQuery = null;      // huling hinanap (para maisalin ulit kapag nagpalit ng wika)
let openGroupId = null;
let easyStepId = null;    // nakabukas na rekomendasyon ng Easy Actions
let settingsMod = null;   // dashboard-settings.js kapag na-load na
let settingsCtl = null;   // ibinabalik ng settings module (hal. closeTop)
let settingsTarget = null;
let settingsBusy = false;
let settingsHost = null;  // lalagyan ng laman ng Settings (ginagawa nang isang beses)
let sheetStatus = null;   // mensahe sa loob ng Settings (nakikita at nababasa habang bukas ito)
let disarmExit = () => Promise.resolve();
let report = null;        // "Mag-report ng problema" sheet (report.js)
const openers = new WeakMap();  // dialog -> { el, key, fallback } para maibalik ang focus
const openedAt = new WeakMap(); // dialog -> oras ng pagbukas (para hindi sumara sa dobleng tap)
const REDUCED = typeof matchMedia === "function" && matchMedia("(prefers-reduced-motion: reduce)").matches;

/* ---------- Ligtas na mga helper ---------- */
const ICON_OK = /^i-[a-z0-9-]+$/;
// Same-site path lang (walang ibang site, walang user ID o token sa URL)
function isSafeHref(h) {
  return typeof h === "string" && h.startsWith("/") && !h.startsWith("//") && !/[\s\\]/.test(h)
    && !/[?&#](uid|userid|user|token|email|id_token)=/i.test(h);
}
function setIcon(svg, icon) {
  const use = svg && svg.querySelector("use");
  if (use && ICON_OK.test(icon || "")) use.setAttribute("href", "#" + icon);
}
const fromTemplate = (id) => $(id).content.firstElementChild.cloneNode(true);
const isOffline = () => navigator.onLine === false;
// Storage (lokal na preference lang). Ligtas kahit naka-block ang storage ng browser: walang error, default lang.
const store = (kind) => { try { return kind === "session" ? window.sessionStorage : window.localStorage; } catch { return null; } };
const readPref = (kind, key) => { try { return store(kind)?.getItem(key) ?? null; } catch { return null; } };
const writePref = (kind, key, value) => {
  try { const st = store(kind); if (!st) return; if (value === null) st.removeItem(key); else st.setItem(key, value); } catch {}
};

/* ---------- Itsura (light / dark / kapareho ng phone) ---------- */
const THEME_KEY = "mgpref_theme";
const THEMES = ["system", "light", "dark"];
const THEME_COLOR = { light: "#F6F4FE", dark: "#1A1937" };
let theme = THEMES.includes(readPref("local", THEME_KEY)) ? readPref("local", THEME_KEY) : "system";
function applyTheme() {
  const root = document.documentElement;
  if (theme === "light" || theme === "dark") root.setAttribute("data-theme", theme);
  else root.removeAttribute("data-theme");
  // Kulay ng address bar: sumusunod sa piniling itsura (o sa phone kapag "system")
  for (const m of document.querySelectorAll('meta[name="theme-color"]')) {
    const forDark = /dark/.test(m.getAttribute("media") || "");
    m.setAttribute("content", theme === "system" ? THEME_COLOR[forDark ? "dark" : "light"] : THEME_COLOR[theme]);
  }
}
function setTheme(next) {
  if (!THEMES.includes(next)) return theme;
  theme = next;
  writePref("local", THEME_KEY, next === "system" ? null : next);
  applyTheme();
  return theme;
}

/* ---------- Bati (sandali lang, isang beses bawat session) ---------- */
const GREET_KEY = "mag_greeted"; // sessionStorage: binubura ng frozen logout, kaya babati ulit sa susunod na login
const GREET_MS = 8000;
const GREET_ICON = { dawn: "s-dawn", morning: "s-sun", afternoon: "s-sun", evening: "s-moon", late: "s-night" };
// Hapon: mataas pa ang araw hanggang 15:59; papalubog na (araw sa abot-tanaw) mula 16:00 hanggang 17:59
const greetIcon = (hour) => (periodFor(hour) === "afternoon" && hour >= 16 ? "s-sunlow" : GREET_ICON[periodFor(hour)] || "s-sun");
// Unang pangalan lang ("Juan" mula sa "Juan Dela Cruz"); kapag pinaikli ang una (hal. "Ma."), dalawang salita.
function firstName(raw) {
  const parts = cleanText(raw, 60).split(/\s+/).filter(Boolean);
  if (!parts.length) return "";
  let n = parts[0];
  if (parts.length > 1 && (/\.$/.test(n) || Array.from(n).length <= 2)) n = `${n} ${parts[1]}`;
  const g = Array.from(n);
  return g.length > 24 ? g.slice(0, 23).join("") + "…" : n;
}
function renderGreeting() {
  const raw = user && typeof user.displayName === "string" ? user.displayName : "";
  const now = new Date(); // oras at petsa ng phone lang; walang hula
  const hour = now.getHours();
  el.greetText.textContent = greetingFor(hour, firstName(raw));
  const note = greetingNote(hour, now); // madaling-araw lang: "Hi, Juan." + isang linya mula sa listahan (ayon sa petsa)
  el.greetNote.textContent = note;
  el.greetNote.hidden = !note;
  el.greeting.classList.toggle("hasNote", !!note);
  el.greetUse.setAttribute("href", "#" + greetIcon(hour));
}
function startGreeting() {
  if (readPref("session", GREET_KEY) === "1") return; // nabati na sa session na ito: slogan lang
  writePref("session", GREET_KEY, "1");
  el.hello.classList.remove("done");
  // Pagkatapos lumabas ang page, saka pa lang may transition (para sa malambot na fade palabas)
  requestAnimationFrame(() => requestAnimationFrame(() => el.hello.classList.remove("instant")));
  setTimeout(() => el.hello.classList.add("done"), GREET_MS);
}

/* ---------- Welcome (bagong account lang, isang beses sa device na ito) ---------- */
const WELCOME_KEY = "mgpref_welcome";
const NEW_ACCOUNT_MS = 14 * 24 * 60 * 60 * 1000;
function isNewAccount(u) {
  const created = Date.parse(u && u.metadata ? u.metadata.creationTime || "" : "");
  if (!Number.isFinite(created)) return false; // walang ebidensya: walang welcome
  const age = Date.now() - created;
  return age >= -5 * 60 * 1000 && age <= NEW_ACCOUNT_MS;
}
function renderWelcome() {
  el.welcome.hidden = !(isNewAccount(user) && readPref("local", WELCOME_KEY) !== "1");
}
function dismissWelcome(focusEl) {
  writePref("local", WELCOME_KEY, "1");
  if (focusEl) focusEl.focus();
  if (el.welcome.hidden) return;
  el.welcome.classList.add("leaving");
  setTimeout(() => { el.welcome.hidden = true; el.welcome.classList.remove("leaving"); }, REDUCED ? 0 : 200);
}

/* ---------- Your Tools: status at mga pangalan ng tool sa bawat grupo ---------- */
function renderGroups() {
  for (const g of GROUPS) {
    const s = groupSummary(g.id);
    const peek = document.querySelector(`[data-peek="${g.id}"]`);
    const status = document.querySelector(`[data-status="${g.id}"]`);
    if (peek) peek.textContent = s.peek.map((id) => t(getTool(id).labelKey)).join(" · ");
    if (status) status.textContent = s.ready > 0 ? t("groupReady", s.ready) : t("soon");
  }
}

// Isang tool: link kung talagang gumagana (may ligtas na href), kung hindi ay "Coming soon" na hindi napipindot
function toolRow(tool) {
  const live = tool.status === STATUS.LIVE && isSafeHref(tool.href);
  const li = fromTemplate(live ? "tplToolLink" : "tplToolSoon");
  setIcon(li.querySelector(".tIco"), tool.icon);
  li.querySelector(".tName").textContent = t(tool.labelKey);
  li.querySelector(".tDesc").textContent = t(tool.descKey);
  if (live) li.querySelector("a").setAttribute("href", tool.href);
  applyStatic(li);
  return li;
}

// Hanay na pindutan (grupo o setting) sa resulta ng Ask Magnetra
function buttonRow(key, icon, name, desc, onPick) {
  const li = fromTemplate("tplAskSetting");
  setIcon(li.querySelector(".tIco"), icon);
  li.querySelector(".tName").textContent = name;
  li.querySelector(".tDesc").textContent = desc;
  const btn = li.querySelector("button");
  btn.dataset.key = key;
  btn.setAttribute("aria-haspopup", "dialog");
  btn.setAttribute("aria-expanded", "false");
  btn.addEventListener("click", () => onPick(btn));
  return li;
}

/* ---------- Mga Free Tool mo: ang mga tool na talagang gumagana (icon at pangalan lang) ---------- */
function renderQuick() {
  const items = freeTools().filter((tl) => isSafeHref(tl.href));
  el.quickList.replaceChildren(...items.map((tl) => {
    const li = fromTemplate("tplQuick");
    setIcon(li.querySelector(".qIco"), tl.icon);
    li.querySelector(".qLabel").textContent = t(tl.labelKey);
    li.querySelector("a").setAttribute("href", tl.href);
    return li;
  }));
  el.quickSection.hidden = items.length === 0;
}

/* ---------- Easy Actions ---------- */
function renderEasy() {
  const ok = (st) => st.special === "all-tools" || isSafeHref(easyHref(st.tool, st.preset));
  const items = EASY_STEPS.filter(ok).map((st) => {
    const li = fromTemplate("tplEasy");
    const btn = li.querySelector("button");
    setIcon(li.querySelector(".eIco"), st.icon);
    li.querySelector(".eText").textContent = t(st.labelKey);
    btn.dataset.key = "easy:" + st.id;
    btn.dataset.step = st.id;
    if (st.special === "all-tools") {
      // Walang rekomendasyon at walang hula: dinadala lang sa All tools na handa na ang search
      btn.removeAttribute("aria-haspopup");
      btn.removeAttribute("aria-controls");
      btn.removeAttribute("aria-expanded");
      btn.classList.add("easyOther");
      btn.addEventListener("click", goOther);
    } else {
      btn.addEventListener("click", () => openEasy(st.id, btn));
    }
    return li;
  });
  el.easyList.replaceChildren(...items);
}
// "Iba ang kailangan ko": All tools + search na handa nang i-type-an
let otherHintShown = false;
function goOther() {
  if (!el.welcome.hidden) dismissWelcome(null);
  if (!el.askInput.value.trim()) { otherHintShown = true; el.askStatus.textContent = t("otherHint"); }
  el.askInput.focus({ preventScroll: true }); // focus muna, saka mag-scroll (hindi napuputol ang malambot na scroll)
  el.allSection.scrollIntoView({ behavior: REDUCED ? "auto" : "smooth", block: "start" });
}
// Pagpalit ng wika: palitan lang ang text (hindi binubuo ulit, para hindi mawala ang focus)
function renderEasyText() {
  for (const btn of el.easyList.querySelectorAll("button[data-step]")) {
    const st = getEasyStep(btn.dataset.step);
    if (st) btn.querySelector(".eText").textContent = t(st.labelKey);
  }
}
function altRow(alt, href) {
  const li = fromTemplate("tplToolLink");
  const tl = getTool(alt.tool);
  setIcon(li.querySelector(".tIco"), tl.icon);
  li.querySelector(".tName").textContent = t(alt.labelKey);
  li.querySelector(".tDesc").textContent = t(tl.labelKey);
  li.querySelector("a").setAttribute("href", href);
  return li;
}
function fillEasy(id) {
  const st = getEasyStep(id);
  const href = st ? easyHref(st.tool, st.preset) : null;
  if (!st || !isSafeHref(href)) return false;
  el.easyDialogTitle.textContent = t(st.titleKey);
  el.easyDialogText.textContent = t(st.textKey);
  el.easyGo.setAttribute("href", href);
  el.easyGo.textContent = t("easyOpen", t(getTool(st.tool).labelKey));
  const alts = st.alts.map((a) => ({ a, href: easyHref(a.tool, a.preset) })).filter((x) => isSafeHref(x.href));
  el.easyMoreBtn.hidden = alts.length === 0;
  el.easyMore.replaceChildren(...alts.map(({ a, href: h }) => altRow(a, h)));
  return true;
}
function openEasy(id, opener) {
  if (el.easyDialog.open || !fillEasy(id)) return;
  easyStepId = id;
  el.easyMore.hidden = true;
  el.easyMoreBtn.setAttribute("aria-expanded", "false");
  if (!el.welcome.hidden) dismissWelcome(null); // nagamit na ang Easy Actions: hindi na kailangan ang welcome
  openDialog(el.easyDialog, opener, el.easyDialogTitle, el.easyTitle);
}
function toggleEasyMore() {
  const open = el.easyMoreBtn.getAttribute("aria-expanded") !== "true";
  el.easyMoreBtn.setAttribute("aria-expanded", String(open));
  el.easyMore.hidden = !open;
}
function toggleEasyHelp() {
  const open = el.easyHelpBtn.getAttribute("aria-expanded") !== "true";
  el.easyHelpBtn.setAttribute("aria-expanded", String(open));
  el.easyHelp.hidden = !open;
}

/* ---------- Mga dialog (native <dialog>): focus, Escape, pagsara ---------- */
function openDialog(dialog, opener, focusEl, fallback) {
  if (dialog.open) return;
  if (opener) {
    openers.set(dialog, { el: opener, key: opener.dataset.key || "", fallback });
    opener.setAttribute("aria-expanded", "true");
  }
  try { dialog.showModal(); } catch { dialog.setAttribute("open", ""); }
  openedAt.set(dialog, performance.now());
  (focusEl || dialog).focus({ preventScroll: true });
}
const visible = (n) => !!n && n.isConnected && n.getClientRects().length > 0;
function closeDialog(dialog) {
  if (!dialog.open) return false;
  // Isara muna ang anumang nakabukas na dialog sa loob nito (hal. sub-dialog ng Settings)
  dialog.querySelectorAll("dialog[open]").forEach((d) => { try { d.close(); } catch { d.removeAttribute("open"); } });
  try { dialog.close(); } catch { dialog.removeAttribute("open"); }
  onDialogClosed(dialog); // agad; ang "close" event (hal. Escape) ay dumarating nang kaunti pang huli
  return true;
}
function onDialogClosed(dialog) {
  const rec = openers.get(dialog);
  openers.delete(dialog);
  if (rec) {
    rec.el.setAttribute("aria-expanded", "false");
    // Kung napalitan ang pindutang nagbukas (hal. nag-iba ang wika), hanapin ang kapalit nito; kung wala, ang fallback
    let target = rec.el;
    if (!visible(target) && rec.key) target = document.querySelector(`[data-key="${CSS.escape(rec.key)}"]`);
    if (!visible(target)) target = rec.fallback;
    if (visible(target)) { target.setAttribute("aria-expanded", "false"); target.focus({ preventScroll: true }); }
  }
  if (dialog === el.groupDialog) openGroupId = null;
  if (dialog === el.easyDialog) easyStepId = null;
}

/* ---------- Group sheet ---------- */
function fillGroup(id) {
  const g = getGroup(id);
  el.groupTitle.textContent = t(g.nameKey);
  el.groupDesc.textContent = t(g.descKey);
  el.groupList.replaceChildren(...toolsInGroup(id).map(toolRow));
}
function openGroup(id, opener) {
  if (!getGroup(id) || el.groupDialog.open) return;
  openGroupId = id;
  fillGroup(id);
  openDialog(el.groupDialog, opener, el.groupTitle, $("grp-" + id));
}

/* ---------- Settings: pagbukas at pag-load ng dashboard-settings.js ----------
   Kontrata:
   - export function mountSettings({ body, user, target, ctx }) -> controller (o Promise nito).
     Tinatawag NANG ISANG BESES lang. Ang body ay sariling lalagyan (hindi ang #settingsBody), kaya hindi
     nagagalaw ang loading at error ng Settings. Ang mga sub-dialog ay ilalagay sa loob ng body.
   - controller.show(target): tuwing bubuksan ulit ang Settings (target: "account", "language", "appearance",
     "change-password", "delete-account", "logout", "about" o null).
   - controller.closeTop(): isara ang nakabukas na sub-dialog; true kung may isinara (para sa Back button).
   - ctx: t, getLang, setLanguage, getTheme, setTheme, announce, isOffline, closeSettings, leave.
     v4: getSound, setSound, previewSound, getCare, setCare, openReport, hasBusinessProfile, clearBusinessProfile. */
const settingsCtx = Object.freeze({
  t, getLang,
  setLanguage: (lang) => { setLang(lang); refreshText(); return getLang(); },
  getTheme: () => theme,
  setTheme: (next) => setTheme(next),
  announce: (msg) => announce(msg),
  isOffline,
  closeSettings: () => closeDialog(el.settingsDialog),
  leave: () => disarmExit(),
  getSound: () => soundOn(),
  setSound: (on) => setSoundOn(!!on),
  previewSound: () => playDone({ preview: true }),
  getCare: () => careEnabled(),
  setCare: (on) => { setCareEnabled(!!on); if (!on) el.care.hidden = true; },
  openReport: (opener) => { if (report) report.open(opener); },
  hasBusinessProfile: () => !!readBusinessProfile(),
  clearBusinessProfile: () => { const r = saveBusinessProfile({}); renderProfile(); return r.ok && !readBusinessProfile(); },
});

function showSettingsState(state) {
  el.settingsLoading.hidden = state !== "loading";
  el.settingsError.hidden = state !== "error";
}

let settingsAttempt = 0;
async function loadSettings() {
  if (settingsMod) return settingsMod;
  if (isOffline()) throw new Error("offline");
  // Bagong URL sa bawat ulit: hindi na kinukuha ulit ng browser ang module na pumalya sa parehong URL
  settingsAttempt += 1;
  const mod = await import(`./dashboard-settings.js?v=3${settingsAttempt > 1 ? "&r=" + settingsAttempt : ""}`);
  if (typeof mod.mountSettings !== "function") throw new Error("bad module");
  settingsMod = mod;
  return mod;
}

async function mountSettingsNow(fromRetry = false) {
  if (settingsBusy) return;
  settingsBusy = true;
  if (fromRetry) el.settingsTitle.focus({ preventScroll: true }); // huwag mawala ang focus habang nakatago ang Try again
  el.settingsRetry.disabled = true;
  showSettingsState("loading");
  try {
    const mod = await loadSettings();
    if (!el.settingsDialog.open) return;
    if (!settingsHost) {
      settingsHost = document.createElement("div");
      el.settingsBody.append(settingsHost);
    }
    if (!settingsCtl) {
      settingsHost.replaceChildren();
      const ctl = await mod.mountSettings({ body: settingsHost, user, target: settingsTarget, ctx: settingsCtx });
      settingsCtl = ctl && typeof ctl === "object" ? ctl : {};
    } else if (typeof settingsCtl.show === "function") {
      await settingsCtl.show(settingsTarget);
    }
    if (el.settingsDialog.open) showSettingsState("none");
  } catch {
    if (el.settingsDialog.open) {
      showSettingsState("error");
      if (fromRetry) {
        el.settingsRetry.disabled = false;
        el.settingsRetry.focus({ preventScroll: true });
      }
    }
  } finally {
    settingsBusy = false;
    el.settingsRetry.disabled = false;
  }
}

function openSettings(target, opener) {
  if (el.settingsDialog.open) return;
  settingsTarget = target && getSetting(target) ? target : null;
  if (sheetStatus) sheetStatus.textContent = "";
  openDialog(el.settingsDialog, opener || el.profileBtn, el.settingsTitle, el.profileBtn);
  mountSettingsNow();
}

/* ---------- Profile sheet (Phase 1.1) ----------
   Pangalan at email: galing lang sa Firebase Auth (display). Walang larawang kinukuha sa ibang site: neutral na
   placeholder lang. Ang bawat item ay nagbubukas ng sarili nitong sheet; ang Log out ay ang frozen logout. */
function displayName() { return cleanText(user && typeof user.displayName === "string" ? user.displayName : "", 60).replace(/\s+/g, " "); }
function renderProfile() {
  const name = displayName();
  el.profileName.textContent = name || t("profileNoName");
  el.profileEmail.textContent = user && typeof user.email === "string" ? user.email : "";
  el.profileBtnName.textContent = firstName(name);
  const biz = readBusinessProfile();
  el.profBizDesc.textContent = biz && biz.name ? biz.name : "";
}
function openProfile() {
  if (el.profileDialog.open) return;
  renderProfile();
  openDialog(el.profileDialog, el.profileBtn, el.profileName, el.profileBtn);
}
// Mula sa Profile sheet o sa Ask Magnetra: isara muna ang Profile, saka buksan ang napili
function openProfileItem(which, opener) {
  const from = opener || el.profileBtn;
  if (el.profileDialog.open) closeDialog(el.profileDialog);
  const back = el.profileDialog.contains(from) ? el.profileBtn : from;
  if (which === "account") openSettings("account", back);
  else if (which === "settings") openSettings(null, back);
  else if (which === "business") openBiz(back);
  else if (which === "help") openHelp(back);
  else if (which === "report" && report) report.open(back);
}
let loggingOut = false;
async function onLogout() {
  if (loggingOut) return;
  loggingOut = true;
  el.profLogout.setAttribute("aria-disabled", "true");
  el.profLogout.setAttribute("aria-busy", "true");
  try { await disarmExit(); } catch {}
  await logout(); // frozen Auth Core: sign out, linis ng mag_* at session, punta sa Login
}

/* ---------- Business Profile (phone lang; binubura ng frozen logout) ---------- */
function renderBizHints() {
  for (const p of document.querySelectorAll("[data-bizlimit]")) {
    const k = p.getAttribute("data-bizlimit");
    if (k === "name" || k === "contact") p.textContent = t("bizLimit", BIZ_LIMITS[k]);
  }
}
let bizStatusKey = null;
function setBizStatus(key) { bizStatusKey = key; el.bizStatus.textContent = key ? t(key) : ""; }
function openBiz(opener) {
  if (el.bizDialog.open) return;
  const p = readBusinessProfile();
  el.bizName.value = p ? p.name : "";
  el.bizContact.value = p ? p.contact : "";
  setBizStatus(null);
  renderBizHints();
  openDialog(el.bizDialog, opener || el.profileBtn, el.bizTitle, el.profileBtn);
}
function onBizSave(e) {
  e.preventDefault();
  const before = readBusinessProfile();
  const name = el.bizName.value, contact = el.bizContact.value;
  if (!name.trim() && !contact.trim() && !before) { setBizStatus("bizNothing"); el.bizName.focus(); return; }
  const r = saveBusinessProfile({ name, contact });
  if (!r.ok) { setBizStatus("bizSaveFail"); return; }
  el.bizName.value = r.profile ? r.profile.name : "";
  el.bizContact.value = r.profile ? r.profile.contact : "";
  setBizStatus(r.profile ? "bizSaved" : "bizCleared");
  renderProfile();
}

/* ---------- Help ---------- */
function openHelp(opener) {
  if (el.helpDialog.open) return;
  openDialog(el.helpDialog, opener || el.profileBtn, el.helpTitle, el.profileBtn);
}

/* ---------- Friendly Care: may ebidensya lang ----------
   Ebidensya: 3 o higit pang talagang natapos na gawain sa session na ito (banner na nagawa, quotation na nakopya,
   follow-up na nakopya o na-share). Isang beses lang bawat session; puwedeng isara; hindi lumalabas kasabay ng welcome.
   Walang oras, streak, pressure o "dapat". */
const CARE_MIN = 3;
let careCount = 0;
function renderCare() {
  if (!careEnabled()) { el.care.hidden = true; return; } // pinatay ng user sa Settings
  if (!el.care.hidden) { el.careText.textContent = t("careText", careCount); return; }
  if (careShown() || !el.welcome.hidden) return;
  const n = doneTotal(readDone());
  if (n < CARE_MIN) return;
  careCount = n;
  setCareShown();
  el.careText.textContent = t("careText", n);
  el.care.hidden = false;
}
function dismissCare() {
  el.care.hidden = true;
  el.easyTitle.focus({ preventScroll: true });
}

/* ---------- Ask Magnetra (lokal lang) ---------- */
function renderAsk(query) {
  askQuery = query;
  const q = String(query ?? "").trim();
  const rows = [];
  if (q) {
    for (const m of findMatches(q, 5)) {
      if (m.kind === "tool") {
        rows.push(toolRow(getTool(m.id)));
      } else if (m.kind === "group") {
        const g = getGroup(m.id);
        rows.push(buttonRow("group:" + g.id, g.icon, t(g.nameKey), t(g.descKey), (btn) => openGroup(g.id, btn)));
      } else if (m.kind === "setting") {
        const s = getSetting(m.id);
        if (s.action.type === "sheet") {
          const icon = s.action.target === "business" ? "i-store" : s.action.target === "report" ? "i-mail" : "i-help";
          rows.push(buttonRow("setting:" + s.id, icon, t(s.labelKey), t("profile"), (btn) => openProfileItem(s.action.target, btn)));
        } else {
          rows.push(buttonRow("setting:" + s.id, "i-settings", t(s.labelKey), t("settings"), (btn) => openSettings(s.action.target, btn)));
        }
      }
    }
  }
  el.askResults.replaceChildren(...rows);
  el.askResults.hidden = rows.length === 0;
  el.askStatus.textContent = !q ? t("askEmpty") : rows.length ? t("askCount", rows.length) : t("askNone");
}
function clearAsk() {
  askQuery = null;
  otherHintShown = false;
  el.askResults.replaceChildren();
  el.askResults.hidden = true;
  el.askStatus.textContent = "";
}

/* ---------- Mga mensahe, offline, wika ---------- */
let statusTimer = null;
// Habang bukas ang Settings, sa loob nito ang mensahe (natatakpan at hindi nababasa ang nasa likod ng modal)
function announce(msg) {
  const box = el.settingsDialog.open && sheetStatus ? sheetStatus : $("status");
  if (!box) return;
  clearTimeout(statusTimer);
  box.textContent = String(msg ?? "");
  statusTimer = setTimeout(() => { box.textContent = ""; }, 4000);
}
function renderOffline() { el.offlineMsg.hidden = !isOffline(); }

function refreshText() {
  applyStatic(document);
  renderGreeting();
  renderProfile();
  renderBizHints();
  if (bizStatusKey) el.bizStatus.textContent = t(bizStatusKey);
  if (!el.care.hidden) el.careText.textContent = t("careText", careCount);
  if (otherHintShown && askQuery === null) el.askStatus.textContent = t("otherHint");
  renderGroups();
  renderQuick();
  renderEasyText();
  if (askQuery !== null) renderAsk(askQuery);
  if (el.groupDialog.open && openGroupId) fillGroup(openGroupId);
  if (report) report.refresh();
  if (el.easyDialog.open && easyStepId) {
    const more = el.easyMoreBtn.getAttribute("aria-expanded") === "true";
    fillEasy(easyStepId);
    el.easyMore.hidden = !more;
  }
}

/* ---------- "View all": dalhin sa All tools nang hindi nagdadagdag ng history (para sa Back button) ---------- */
function goAllTools(e) {
  e.preventDefault();
  el.allSection.scrollIntoView({ behavior: REDUCED ? "auto" : "smooth", block: "start" });
  el.allSection.focus({ preventScroll: true });
}

/* ---------- Back button: dialog muna, saka ang frozen exit guard ---------- */
function closeOverlay() {
  if (report && report.close()) return true; // nasa ibabaw ng lahat (bukas mula sa Settings o Help)
  if (el.settingsDialog.open) {
    try { if (settingsCtl && typeof settingsCtl.closeTop === "function" && settingsCtl.closeTop() === true) return true; } catch {}
  }
  if (closeDialog(el.settingsDialog)) return true;
  if (closeDialog(el.bizDialog)) return true;
  if (closeDialog(el.helpDialog)) return true;
  if (closeDialog(el.profileDialog)) return true;
  if (closeDialog(el.easyDialog)) return true;
  if (closeDialog(el.groupDialog)) return true;
  return false;
}

/* ---------- Simula: pagkatapos lang makumpirma ng Auth Core ang login ---------- */
// Pindot sa labas ng sheet: isara (kung doon din nagsimula ang pindot, at hindi dobleng tap pagkabukas).
// Sa Settings hindi, para hindi mawala ang tina-type.
function closeOnBackdrop(dialog) {
  const outside = (e) => { const r = dialog.getBoundingClientRect(); return e.clientX < r.left || e.clientX > r.right || e.clientY < r.top || e.clientY > r.bottom; };
  let downOnBackdrop = false;
  dialog.addEventListener("pointerdown", (e) => { downOnBackdrop = e.target === dialog && outside(e); });
  dialog.addEventListener("click", (e) => {
    const ok = downOnBackdrop && e.target === dialog && outside(e) && performance.now() - (openedAt.get(dialog) || 0) > 400;
    downOnBackdrop = false;
    if (ok) closeDialog(dialog);
  });
}

function wireEvents() {
  el.profileBtn.addEventListener("click", openProfile);
  el.profMine.addEventListener("click", () => openProfileItem("account", el.profMine));
  el.profBiz.addEventListener("click", () => openProfileItem("business", el.profBiz));
  el.profSettings.addEventListener("click", () => openProfileItem("settings", el.profSettings));
  el.profHelp.addEventListener("click", () => openProfileItem("help", el.profHelp));
  el.profLogout.addEventListener("click", onLogout);
  el.bizForm.addEventListener("submit", onBizSave);
  el.careOk.addEventListener("click", dismissCare);
  document.querySelectorAll(".groupCard[data-group]").forEach((btn) => {
    btn.setAttribute("aria-expanded", "false");
    btn.addEventListener("click", () => openGroup(btn.dataset.group, btn));
  });

  el.askForm.addEventListener("submit", (e) => { e.preventDefault(); renderAsk(el.askInput.value); });
  el.askInput.addEventListener("input", () => { if (!el.askInput.value.trim()) clearAsk(); });

  el.welcomeStart.addEventListener("click", () => dismissWelcome(el.easyList.querySelector("button") || el.easyTitle));
  el.welcomeLater.addEventListener("click", () => dismissWelcome(el.easyTitle));
  el.easyHelpBtn.addEventListener("click", toggleEasyHelp);
  el.easyMoreBtn.addEventListener("click", toggleEasyMore);
  el.viewAll.addEventListener("click", goAllTools);

  for (const d of [el.groupDialog, el.easyDialog, el.settingsDialog, el.profileDialog, el.bizDialog, el.helpDialog]) d.addEventListener("close", () => { if (!d.open) onDialogClosed(d); });
  el.profileClose.addEventListener("click", () => closeDialog(el.profileDialog));
  el.bizClose.addEventListener("click", () => closeDialog(el.bizDialog));
  el.helpClose.addEventListener("click", () => closeDialog(el.helpDialog));
  el.helpReport.addEventListener("click", () => { if (report) report.open(el.helpReport); });
  closeOnBackdrop(el.profileDialog);
  closeOnBackdrop(el.helpDialog);
  el.groupClose.addEventListener("click", () => closeDialog(el.groupDialog));
  el.easyDialogClose.addEventListener("click", () => closeDialog(el.easyDialog));
  el.settingsClose.addEventListener("click", () => closeDialog(el.settingsDialog));
  closeOnBackdrop(el.groupDialog);
  closeOnBackdrop(el.easyDialog);
  el.settingsRetry.addEventListener("click", () => mountSettingsNow(true));
  // Mensahe sa loob ng Settings: nandito na bago pa magkaroon ng laman (para mabasa ng screen reader)
  sheetStatus = document.createElement("p");
  sheetStatus.className = "sheetNote";
  sheetStatus.setAttribute("role", "status");
  el.settingsDialog.append(sheetStatus);

  window.addEventListener("online", renderOffline);
  window.addEventListener("offline", renderOffline);
  document.addEventListener("visibilitychange", () => { if (!document.hidden) renderGreeting(); });
  // Bumalik mula sa tool gamit ang Back (page mula sa cache): i-check ulit ang ebidensya ng Friendly Care
  window.addEventListener("pageshow", (e) => { if (e.persisted) { renderCare(); renderProfile(); } });
}

function start(firebaseUser) {
  if (started) return;
  started = true;
  user = firebaseUser;
  applyTheme();
  applyStatic(document);
  renderGreeting();
  startGreeting();
  renderWelcome();
  renderCare();
  renderProfile();
  renderEasy();
  renderGroups();
  renderQuick();
  renderOffline();
  try { report = createReport({ getLang }); } catch { report = null; } // kung pumalya: may email pa rin sa Help
  if (!report) el.helpReport.hidden = true;
  wireEvents();
  try {
    disarmExit = initExitGuard({ getText: () => t("exitToast"), closeOverlay });
  } catch { /* walang exit guard: gumagana pa rin ang Dashboard */ }
  el.loader.hidden = true;
  el.app.hidden = false;
}

// Kapag talagang pumalya ang pagsisimula: nakatago pa rin ang Dashboard; kalmadong mensahe at Reload lang.
function showFatal() {
  try { applyStatic(document); } catch {}
  el.app.hidden = true;
  el.loader.hidden = true;
  el.appError.hidden = false;
  document.documentElement.style.visibility = "";
}

try {
  guardDashboard((firebaseUser) => {
    try { start(firebaseUser); } catch { console.error("dashboard: start failed"); showFatal(); }
  }, { idleMinutes: 60 });
} catch {
  console.error("dashboard: auth guard failed");
  showFatal();
}
