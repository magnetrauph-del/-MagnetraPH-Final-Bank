// ui-dashboard.js - v1 (Phase 4) - controller ng Dashboard. Walang emoji.
// ANO ANG MANGYAYARI kapag gumamit ang user (C3). Ang login check, Firebase at App Check ay galing lahat
// sa frozen Auth Core (guardDashboard); walang sariling Firebase, token, API call o storage dito.
// - Nakatago ang #app hanggang makumpirma ng Auth Core ang login. Signed out: Login. Hindi verified: verify page.
// - Ang pangalan sa bati ay Firebase Auth displayName lang (C1); walang email, walang user ID.
// - Ask Magnetra V1: lokal na paghahanap sa dashboard-tools.js; walang network, hindi AI.
// - Settings: dito ang pagbukas at pagsara; ang laman ay sa dashboard-settings.js (Phase 5), nilo-load lang kapag binuksan.
import { guardDashboard } from "./auth-core-shared.js";
import { initExitGuard } from "./exit-guard-shared.js";
import { cleanText } from "./security-core-shared.js";
import { t, applyStatic, greetingFor, getLang, setLang } from "./dashboard-i18n.js";
import { GROUPS, STATUS, getGroup, getTool, getSetting, toolsInGroup, groupSummary, quickActions, findMatches } from "./dashboard-tools.js";

const $ = (id) => document.getElementById(id);
const el = {
  loader: $("loader"), app: $("app"), appError: $("appError"), offlineMsg: $("offlineMsg"), greeting: $("greeting"),
  settingsBtn: $("settingsBtn"), askForm: $("askForm"), askInput: $("askInput"), askStatus: $("askStatus"), askResults: $("askResults"),
  quickSection: $("quickSection"), quickList: $("quickList"),
  groupDialog: $("groupDialog"), groupTitle: $("groupDialogTitle"), groupDesc: $("groupDialogDesc"), groupList: $("groupToolList"), groupClose: $("groupDialogClose"),
  settingsDialog: $("settingsDialog"), settingsTitle: $("settingsTitle"), settingsClose: $("settingsClose"), settingsBody: $("settingsBody"),
  settingsLoading: $("settingsLoading"), settingsError: $("settingsError"), settingsRetry: $("settingsRetry"),
};

let user = null;          // Firebase Auth user mula sa guardDashboard; para sa display lang
let started = false;
let askQuery = null;      // huling hinanap (para maisalin ulit kapag nagpalit ng wika)
let openGroupId = null;
let settingsMod = null;   // dashboard-settings.js kapag na-load na
let settingsCtl = null;   // ibinabalik ng settings module (hal. closeTop)
let settingsTarget = null;
let settingsBusy = false;
let settingsHost = null;  // lalagyan ng laman ng Settings (ginagawa nang isang beses)
let sheetStatus = null;   // mensahe sa loob ng Settings (nakikita at nababasa habang bukas ito)
let disarmExit = () => Promise.resolve();
const openers = new WeakMap();  // dialog -> { el, key, fallback } para maibalik ang focus
const openedAt = new WeakMap(); // dialog -> oras ng pagbukas (para hindi sumara sa dobleng tap)

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

/* ---------- Bati ---------- */
function renderGreeting() {
  const raw = user && typeof user.displayName === "string" ? user.displayName : "";
  el.greeting.textContent = greetingFor(new Date().getHours(), cleanText(raw, 60));
}

/* ---------- Your Tools: status at mga pangalan ng tool sa bawat grupo ---------- */
function renderGroups() {
  for (const g of GROUPS) {
    const s = groupSummary(g.id);
    const peek = document.querySelector(`[data-peek="${g.id}"]`);
    const status = document.querySelector(`[data-status="${g.id}"]`);
    if (peek) peek.textContent = s.peek.map((id) => t(getTool(id).labelKey)).join(" \u00B7 ");
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

/* ---------- Quick Actions: lalabas lang kapag may gumaganang tool (wala sa V1) ---------- */
function renderQuick() {
  const items = quickActions().filter((q) => isSafeHref(getTool(q.tool)?.href));
  el.quickList.replaceChildren(...items.map((q) => {
    const li = fromTemplate("tplQuick");
    const tl = getTool(q.tool);
    setIcon(li.querySelector(".qIco"), tl.icon);
    li.querySelector(".qLabel").textContent = t(q.labelKey);
    li.querySelector("a").setAttribute("href", tl.href);
    return li;
  }));
  el.quickSection.hidden = items.length === 0;
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
    if (!visible(target) && rec.key) target = el.askResults.querySelector(`[data-key="${CSS.escape(rec.key)}"]`);
    if (!visible(target)) target = rec.fallback;
    if (visible(target)) { target.setAttribute("aria-expanded", "false"); target.focus({ preventScroll: true }); }
  }
  if (dialog === el.groupDialog) openGroupId = null;
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

/* ---------- Settings: pagbukas at pag-load ng dashboard-settings.js (Phase 5) ----------
   Kontrata para sa Phase 5:
   - export function mountSettings({ body, user, target, ctx }) -> controller (o Promise nito).
     Tinatawag NANG ISANG BESES lang. Ang body ay sariling lalagyan (hindi ang #settingsBody), kaya hindi
     nagagalaw ang loading at error ng Settings. Ang mga sub-dialog ay ilalagay sa loob ng body.
   - controller.show(target): tuwing bubuksan ulit ang Settings (target: "account", "language",
     "change-password", "delete-account", "logout", "about" o null).
   - controller.closeTop(): isara ang nakabukas na sub-dialog; true kung may isinara (para sa Back button).
   - ctx: t, getLang, setLanguage, announce, isOffline, closeSettings, leave (tawagin bago lumipat ng page). */
const settingsCtx = Object.freeze({
  t, getLang,
  setLanguage: (lang) => { setLang(lang); refreshText(); return getLang(); },
  announce: (msg) => announce(msg),
  isOffline,
  closeSettings: () => closeDialog(el.settingsDialog),
  leave: () => disarmExit(),
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
  const mod = await import(`./dashboard-settings.js?v=1${settingsAttempt > 1 ? "&r=" + settingsAttempt : ""}`);
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
  openDialog(el.settingsDialog, opener || el.settingsBtn, el.settingsTitle, el.settingsBtn);
  mountSettingsNow();
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
        rows.push(buttonRow("setting:" + s.id, "i-settings", t(s.labelKey), t("settings"), (btn) => openSettings(s.action.target, btn)));
      }
    }
  }
  el.askResults.replaceChildren(...rows);
  el.askResults.hidden = rows.length === 0;
  el.askStatus.textContent = !q ? t("askEmpty") : rows.length ? t("askCount", rows.length) : t("askNone");
}
function clearAsk() {
  askQuery = null;
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
  renderGroups();
  renderQuick();
  if (askQuery !== null) renderAsk(askQuery);
  if (el.groupDialog.open && openGroupId) fillGroup(openGroupId);
}

/* ---------- Back button: dialog muna, saka ang frozen exit guard ---------- */
function closeOverlay() {
  if (el.settingsDialog.open) {
    try { if (settingsCtl && typeof settingsCtl.closeTop === "function" && settingsCtl.closeTop() === true) return true; } catch {}
  }
  if (closeDialog(el.settingsDialog)) return true;
  if (closeDialog(el.groupDialog)) return true;
  return false;
}

/* ---------- Simula: pagkatapos lang makumpirma ng Auth Core ang login ---------- */
function wireEvents() {
  el.settingsBtn.setAttribute("aria-expanded", "false");
  el.settingsBtn.addEventListener("click", () => openSettings(null, el.settingsBtn));
  document.querySelectorAll(".groupCard[data-group]").forEach((btn) => {
    btn.setAttribute("aria-expanded", "false");
    btn.addEventListener("click", () => openGroup(btn.dataset.group, btn));
  });

  el.askForm.addEventListener("submit", (e) => { e.preventDefault(); renderAsk(el.askInput.value); });
  el.askInput.addEventListener("input", () => { if (!el.askInput.value.trim()) clearAsk(); });

  for (const d of [el.groupDialog, el.settingsDialog]) d.addEventListener("close", () => { if (!d.open) onDialogClosed(d); });
  el.groupClose.addEventListener("click", () => closeDialog(el.groupDialog));
  el.settingsClose.addEventListener("click", () => closeDialog(el.settingsDialog));
  // Pindot sa labas ng group sheet: isara (kung doon din nagsimula ang pindot, at hindi dobleng tap pagkabukas).
  // Sa Settings hindi, para hindi mawala ang tina-type.
  const outside = (d, e) => { const r = d.getBoundingClientRect(); return e.clientX < r.left || e.clientX > r.right || e.clientY < r.top || e.clientY > r.bottom; };
  let downOnBackdrop = false;
  el.groupDialog.addEventListener("pointerdown", (e) => { downOnBackdrop = e.target === el.groupDialog && outside(el.groupDialog, e); });
  el.groupDialog.addEventListener("click", (e) => {
    const ok = downOnBackdrop && e.target === el.groupDialog && outside(el.groupDialog, e)
      && performance.now() - (openedAt.get(el.groupDialog) || 0) > 400;
    downOnBackdrop = false;
    if (ok) closeDialog(el.groupDialog);
  });
  el.settingsRetry.addEventListener("click", () => mountSettingsNow(true));
  // Mensahe sa loob ng Settings: nandito na bago pa magkaroon ng laman (para mabasa ng screen reader)
  sheetStatus = document.createElement("p");
  sheetStatus.className = "sheetNote";
  sheetStatus.setAttribute("role", "status");
  el.settingsDialog.append(sheetStatus);

  window.addEventListener("online", renderOffline);
  window.addEventListener("offline", renderOffline);
  document.addEventListener("visibilitychange", () => { if (!document.hidden) renderGreeting(); });
}

function start(firebaseUser) {
  if (started) return;
  started = true;
  user = firebaseUser;
  applyStatic(document);
  renderGreeting();
  renderGroups();
  renderQuick();
  renderOffline();
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
