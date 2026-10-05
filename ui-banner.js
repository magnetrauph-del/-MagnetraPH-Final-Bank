// ui-banner.js - v1.1 - controller ng Instant Banner page. Walang emoji.
// - Login: frozen Auth Core (guardDashboard), parehong pattern ng Dashboard. Walang sariling Firebase, token o API call.
//   Access gate lang ito para sa UX: walang server data ang page na ito.
// - Lahat ay nasa device: ang text at larawan ay hindi ina-upload, hindi sine-save sa storage at hindi nilo-log.
// - Hindi inilalagay ang pangalan o email ng account sa banner. Ang text sa banner ay galing lang sa user.
// - v1.1 (Phase 1.1): kapag may naka-save na Business Profile (local-state.js; galing sa user), inilalagay ang
//   pangalan at contact sa mga walang lamang field, may paalala, at puwedeng palitan o burahin. Pagkatapos talagang
//   magawa ang PNG: isang mungkahing next step (Quotes) at bilang na "natapos" para sa Friendly Care (session lang).
import { guardDashboard, isInAppBrowser } from "./auth-core-shared.js";
import { initExitGuard } from "./exit-guard-shared.js";
import { cleanText } from "./security-core-shared.js";
import { t, applyStatic, watchLang } from "./banner-i18n.js?v=2";
import { readBusinessProfile, markDone } from "./local-state.js?v=1";
import { FORMATS, LAYOUTS, THEMES, LIMITS, renderBanner } from "./banner-render.js";

const $ = (id) => document.getElementById(id);
const el = {
  loader: $("loader"), loaderOffline: $("loaderOffline"), app: $("app"), appError: $("appError"), offlineMsg: $("offlineMsg"),
  backLink: $("backLink"), canvas: $("bCanvas"), empty: $("bEmpty"), save: $("bSave"), saveMsg: $("bSaveMsg"),
  headlineErr: $("bHeadlineErr"),
  photoIn: $("bPhoto"), photoLabel: $("bPhotoLabel"), photoRemove: $("bPhotoRemove"), photoMsg: $("bPhotoMsg"),
  result: $("resultDialog"), resultTitle: $("resultTitle"), resultImg: $("resultImg"), resultNote: $("resultNote"),
  resultDownload: $("resultDownload"), resultClose: $("resultClose"), resultDone: $("resultDone"),
  fromProfile: $("bFromProfile"), nextLink: $("bNextLink"),
};
const FIELDS = { headline: $("bHeadline"), detail: $("bDetail"), business: $("bBusiness"), contact: $("bContact") };
const FORMAT_KEY = { square: "fmtSquare", portrait: "fmtPortrait", story: "fmtStory" };
const PHOTO_ERRORS = { photoBig: 1, photoType: 1, photoPixels: 1, photoBad: 1 };
const MAX_BYTES = 15 * 1024 * 1024; // 15 MB
const MAX_PIXELS = 60e6;            // hindi bubuksan ang napakalaking larawan (iwas crash sa phone)
const MAX_SIDE = 2160;              // pinapaliit ang larawan sa device bago gamitin

let started = false;
let busy = false;           // habang ginagawa ang PNG: walang dobleng save
let frame = 0;
let photo = null;           // { source: <canvas> sa memory, width, height, id }; hindi sine-save kahit saan
let photoSeq = 0;
let photoJob = 0;           // para hindi gamitin ang luma kapag mabilis na nagpalit ng larawan
let photoLoading = false;   // habang binubuksan ang larawan: maghintay muna bago mag-save
let saved = null;           // { sig, url, name, headline } ng huling PNG (para hindi ulitin ang parehong trabaho)
let resultNoteKey = null;
const msgs = { headline: null, photo: null, save: null };
let disarmExit = () => Promise.resolve();
let guardOff = false;       // tinanggal ang exit guard (papunta sa Dashboard); ibabalik kapag bumalik ang page mula sa cache
let leaving = false;
let backFallback = null;
const has = (o, k) => o != null && Object.prototype.hasOwnProperty.call(o, k);
const isOffline = () => typeof navigator !== "undefined" && navigator.onLine === false;

/* ---------- Mga napili at tina-type (nililinis at nililimitahan bago iguhit) ---------- */
function picked(name, allowed, fallback) {
  const r = document.querySelector(`input[name="${name}"]:checked`);
  return r && allowed.includes(r.value) ? r.value : fallback;
}
function values() {
  const v = {
    format: picked("bFormat", Object.keys(FORMATS), "square"),
    layout: picked("bLayout", LAYOUTS, "center"),
    theme: picked("bTheme", Object.keys(THEMES), "indigo"),
  };
  for (const [k, input] of Object.entries(FIELDS)) v[k] = cleanText(input.value, LIMITS[k]);
  return v;
}

/* ---------- Preview (iisang canvas; ito rin ang ginagawang PNG) ---------- */
function draw() {
  frame = 0;
  const v = values();
  renderBanner(el.canvas, { ...v, photo });
  el.empty.hidden = !!v.headline;
  const f = FORMATS[v.format];
  el.canvas.setAttribute("aria-label", t("previewAria", t(FORMAT_KEY[v.format]), f.w, f.h));
}
function schedule() { if (!frame) frame = requestAnimationFrame(draw); }
function flush() { if (frame) cancelAnimationFrame(frame); draw(); }

/* ---------- Mga mensahe (naka-key para maisalin ulit kapag nagpalit ng wika) ---------- */
function setMsg(name, key, err = false) {
  msgs[name] = key ? { key, err } : null;
  renderMsgs();
}
function renderMsgs() {
  const h = msgs.headline;
  el.headlineErr.textContent = h ? t(h.key) : "";
  el.headlineErr.hidden = !h;
  if (h) FIELDS.headline.setAttribute("aria-invalid", "true");
  else FIELDS.headline.removeAttribute("aria-invalid");
  for (const [name, node] of [["photo", el.photoMsg], ["save", el.saveMsg]]) {
    const m = msgs[name];
    node.textContent = m ? t(m.key) : "";
    node.classList.toggle("isErr", !!(m && m.err));
  }
}
function renderHints() {
  for (const p of document.querySelectorAll("[data-limit]")) {
    const k = p.getAttribute("data-limit");
    if (has(LIMITS, k)) p.textContent = t("limit", LIMITS[k]);
  }
}
function syncPhotoUI() {
  el.photoLabel.textContent = t(photo ? "photoChange" : "photoAdd");
  el.photoRemove.hidden = !photo;
}
const noteText = (key) => (key === "noteDownload" && saved ? t(key, saved.name) : t(key));
function refreshText() {
  applyStatic(document);
  renderHints();
  renderMsgs();
  syncPhotoUI();
  if (saved) el.resultImg.alt = t("resultAlt", saved.headline);
  if (resultNoteKey) el.resultNote.textContent = noteText(resultNoteKey);
  schedule();
}
function paintSwatches() {
  for (const s of document.querySelectorAll(".swatch[data-theme]")) {
    const th = THEMES[s.getAttribute("data-theme")];
    if (th) s.style.background = `linear-gradient(135deg, ${th.bg[0]}, ${th.bg[1]})`;
  }
}

/* ---------- Larawan: binubuksan at pinapaliit sa device lang ---------- */
function photoError(key) { const e = new Error(key); e.key = key; return e; }
// Tinitingnan ang unang bytes ng file (hindi lang ang pangalan o type na sinabi ng phone)
function sniff(b) {
  if (b.length >= 3 && b[0] === 0xFF && b[1] === 0xD8 && b[2] === 0xFF) return "jpeg";
  if (b.length >= 8 && [0x89, 0x50, 0x4E, 0x47, 0x0D, 0x0A, 0x1A, 0x0A].every((x, i) => b[i] === x)) return "png";
  if (b.length >= 12 && b[0] === 0x52 && b[1] === 0x49 && b[2] === 0x46 && b[3] === 0x46
    && b[8] === 0x57 && b[9] === 0x45 && b[10] === 0x42 && b[11] === 0x50) return "webp";
  return "";
}
function loadImage(url) {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = () => reject(photoError("photoBad"));
    img.src = url;
  });
}
async function readPhoto(file) {
  if (!file || !file.size) throw photoError("photoBad");
  if (file.size > MAX_BYTES) throw photoError("photoBig");
  let head;
  try { head = new Uint8Array(await file.slice(0, 12).arrayBuffer()); } catch { throw photoError("photoBad"); }
  if (!sniff(head)) throw photoError("photoType");
  const url = URL.createObjectURL(file); // pansamantala; binubura agad pagkabukas
  let img = null;
  try {
    img = await loadImage(url);
    const w = img.naturalWidth, h = img.naturalHeight;
    if (!w || !h) throw photoError("photoBad");
    if (w * h > MAX_PIXELS) throw photoError("photoPixels");
    const s = Math.min(1, MAX_SIDE / Math.max(w, h));
    const c = document.createElement("canvas");
    c.width = Math.max(1, Math.round(w * s));
    c.height = Math.max(1, Math.round(h * s));
    const cx = c.getContext("2d");
    cx.imageSmoothingEnabled = true;
    cx.imageSmoothingQuality = "high";
    cx.drawImage(img, 0, 0, c.width, c.height);
    return { source: c, width: c.width, height: c.height, id: ++photoSeq };
  } finally {
    URL.revokeObjectURL(url);
    if (img) img.removeAttribute("src");
  }
}
function dropPhoto() {
  if (photo) { photo.source.width = 0; photo.source.height = 0; } // bitawan ang memory
  photo = null;
}
async function onPhotoChange() {
  const file = el.photoIn.files && el.photoIn.files[0];
  if (!file) return;
  const job = ++photoJob;
  photoLoading = true;
  setMsg("photo", "photoReading");
  let next = null, errKey = null;
  try { next = await readPhoto(file); } catch (e) { errKey = e && has(PHOTO_ERRORS, e.key) ? e.key : "photoBad"; }
  if (job !== photoJob) { if (next) { next.source.width = 0; next.source.height = 0; } return; }
  photoLoading = false;
  el.photoIn.value = ""; // tapos nang basahin: hindi na itinatabi ang file sa input
  if (next) { dropPhoto(); photo = next; setMsg("photo", "photoAdded"); } else setMsg("photo", errKey, true);
  syncPhotoUI();
  schedule();
}
function removePhoto() {
  photoJob++;
  photoLoading = false;
  el.photoIn.value = "";
  dropPhoto();
  setMsg("photo", "photoRemoved");
  syncPhotoUI();
  schedule();
  el.photoIn.focus();
}

/* ---------- Save as PNG (isang trabaho lang kahit maraming pindot) ---------- */
function setSaveBusy(on) {
  el.save.setAttribute("aria-disabled", on ? "true" : "false");
  el.save.setAttribute("aria-busy", on ? "true" : "false");
  if (on) setMsg("save", "saving");
  else if (msgs.save && msgs.save.key === "saving") setMsg("save", null);
}
function download() {
  const a = document.createElement("a");
  a.href = saved.url;
  a.download = saved.name;
  a.hidden = true;
  document.body.append(a);
  a.click();
  a.remove();
}
async function onSave() {
  if (busy) return;
  if (photoLoading) { setMsg("save", "photoWait", true); return; } // para hindi lumabas ang luma o walang larawan
  const v = values();
  if (!v.headline) {
    setMsg("headline", "headlineErr", true);
    FIELDS.headline.focus();
    return;
  }
  setMsg("headline", null);
  setMsg("save", null);
  busy = true;
  setSaveBusy(true);
  try {
    flush();
    const sig = JSON.stringify([v.format, v.layout, v.theme, v.headline, v.detail, v.business, v.contact, photo ? photo.id : 0]);
    let fresh = false;
    if (!saved || saved.sig !== sig) {
      const blob = await new Promise((resolve) => { try { el.canvas.toBlob(resolve, "image/png"); } catch { resolve(null); } });
      if (!blob) throw new Error("png");
      const f = FORMATS[v.format];
      if (saved) URL.revokeObjectURL(saved.url); // ang lumang PNG ay hindi na kailangan
      saved = { sig, url: URL.createObjectURL(blob), name: `magnetraph-banner-${v.format}-${f.w}x${f.h}.png`, headline: v.headline };
      fresh = true;
      markDone("banner"); // talagang nagawa ang PNG (bagong banner lang ang binibilang)
    }
    // Sa browser ng FB/Messenger, maaaring hindi gumana ang download: larawan lang (pindutin nang matagal)
    const inApp = isInAppBrowser();
    if (fresh && !inApp) download();
    openResult(inApp ? "noteInApp" : fresh ? "noteDownload" : "noteSame", inApp);
  } catch {
    setMsg("save", "saveFail", true);
  } finally {
    busy = false;
    setSaveBusy(false);
  }
}
function openResult(noteKey, inApp) {
  resultNoteKey = noteKey;
  el.resultImg.src = saved.url;
  el.resultImg.alt = t("resultAlt", saved.headline);
  el.resultNote.textContent = noteText(noteKey);
  el.resultDownload.hidden = inApp;
  if (inApp) el.resultDownload.removeAttribute("href");
  else { el.resultDownload.href = saved.url; el.resultDownload.download = saved.name; }
  if (!el.result.open) { try { el.result.showModal(); } catch { el.result.setAttribute("open", ""); } }
  el.resultTitle.focus();
}
function onResultClosed() {
  resultNoteKey = null;
  if (!el.app.hidden) el.save.focus();
}
// Escape, Close, Done at Back (sa pamamagitan ng frozen exit guard)
function closeResult() {
  if (!el.result.open) return false;
  try { el.result.close(); } catch { el.result.removeAttribute("open"); onResultClosed(); }
  return true;
}

/* ---------- Business Profile: punan lang ang walang lamang field (galing sa user; walang hinuhulaan) ---------- */
function applyBusinessProfile() {
  const p = readBusinessProfile();
  let used = false;
  if (p && p.name && !FIELDS.business.value.trim()) { FIELDS.business.value = cleanText(p.name, LIMITS.business); used = true; }
  if (p && p.contact && !FIELDS.contact.value.trim()) { FIELDS.contact.value = cleanText(p.contact, LIMITS.contact); used = true; }
  el.fromProfile.hidden = !used;
}
// Next step (Quotes): umalis nang malinis (tanggalin muna ang exit guard, tulad ng Back)
async function onNextLink(e) {
  if (e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return; // bagong tab: hayaan ang browser
  e.preventDefault();
  if (leaving) return;
  leaving = true;
  try { await disarmExit(); } catch {}
  guardOff = true;
  location.assign("/quote.html");
}

/* ---------- Simula: pagkatapos lang makumpirma ng frozen Auth Core ang login ---------- */
function renderOffline() { el.offlineMsg.hidden = !isOffline(); }
function cameFromDashboard() {
  try {
    const r = new URL(document.referrer);
    return r.origin === location.origin && /^\/dashboard(\.html)?$/.test(r.pathname);
  } catch { return false; }
}
// Pabalik sa Dashboard nang walang dagdag na history entry (tulad ng Create Account -> Login):
// galing sa Dashboard: history.back(); kung hindi: palitan ang page na ito ng Dashboard.
async function onBack(e) {
  if (e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
  e.preventDefault();
  if (leaving) return;
  leaving = true;
  try { await disarmExit(); } catch {}
  guardOff = true;
  if (cameFromDashboard() && history.length > 1) {
    history.back();
    backFallback = setTimeout(() => location.replace("/dashboard.html"), 2500); // kung hindi umalis ang page
  } else {
    location.replace("/dashboard.html");
  }
}
function armExitGuard() {
  try {
    disarmExit = initExitGuard({ getText: () => t("exitToast"), closeOverlay: closeResult });
  } catch { /* walang exit guard: gumagana pa rin ang page */ }
}
function wire() {
  for (const r of document.querySelectorAll('input[name="bFormat"], input[name="bLayout"], input[name="bTheme"]')) r.addEventListener("change", schedule);
  for (const input of Object.values(FIELDS)) input.addEventListener("input", schedule);
  FIELDS.headline.addEventListener("input", () => { if (msgs.headline && FIELDS.headline.value.trim()) setMsg("headline", null); });
  el.photoIn.addEventListener("change", onPhotoChange);
  el.photoRemove.addEventListener("click", removePhoto);
  el.save.addEventListener("click", onSave);
  el.result.addEventListener("close", onResultClosed);
  el.resultClose.addEventListener("click", closeResult);
  el.resultDone.addEventListener("click", closeResult);
  el.backLink.addEventListener("click", onBack);
  el.nextLink.addEventListener("click", onNextLink);
  window.addEventListener("online", renderOffline);
  window.addEventListener("offline", renderOffline);
  window.addEventListener("pagehide", () => clearTimeout(backFallback));
  // Ibinalik ng browser ang page mula sa cache (Back/Forward): ibalik ang exit guard kung tinanggal natin ito
  window.addEventListener("pageshow", (e) => {
    if (!e.persisted) return;
    clearTimeout(backFallback);
    leaving = false;
    if (guardOff) { guardOff = false; armExitGuard(); }
  });
  watchLang(refreshText);
}
function start() {
  if (started) return;
  started = true;
  paintSwatches();
  applyBusinessProfile();
  wire();
  refreshText();
  flush();
  renderOffline();
  armExitGuard();
  el.loader.hidden = true;
  el.app.hidden = false;
}
function showFatal() {
  try { applyStatic(document); } catch {}
  el.app.hidden = true;
  el.loader.hidden = true;
  el.appError.hidden = false;
  document.documentElement.style.visibility = "";
}

// Habang chine-check ang login: kung offline, kalmadong paalala (walang awtomatikong retry)
const loaderOffline = () => { if (!started) el.loaderOffline.hidden = !isOffline(); };
try { applyStatic(document); } catch {}
loaderOffline();
window.addEventListener("online", loaderOffline);
window.addEventListener("offline", loaderOffline);

try {
  // Hindi ginagamit ang user object: walang pangalan, email o ID na lumalabas sa banner
  guardDashboard(() => {
    try { start(); } catch { console.error("banner: start failed"); showFatal(); }
  }, { idleMinutes: 60 });
} catch {
  console.error("banner: auth guard failed");
  showFatal();
}
