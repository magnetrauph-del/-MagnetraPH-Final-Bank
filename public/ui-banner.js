// ui-banner.js - v1.2 - controller ng Instant Banner page. Walang emoji.
// v1.2 (P1): "?" na tulong (help-sheet.js) at mahinang tunog kapag talagang nagawa ang PNG (sound.js; kapag naka-on lang).
// Studio foundation: shared deterministic presets extend the original Canvas renderer.
// - Login: frozen Auth Core (guardDashboard), parehong pattern ng Dashboard. Walang sariling token o API call.
// - Auth observer below only clears volatile editor data; it does not replace the shared access guard.
//   Access gate lang ito para sa UX: walang server data ang page na ito.
// - Lahat ay nasa device: ang text at larawan ay hindi ina-upload, hindi sine-save sa storage at hindi nilo-log.
// - Hindi inilalagay ang pangalan o email ng account sa banner. Ang text sa banner ay galing lang sa user.
// - v1.1 (Phase 1.1): kapag may naka-save na Business Profile (local-state.js; galing sa user), inilalagay ang
//   pangalan at contact sa mga walang lamang field, may paalala, at puwedeng palitan o burahin. Pagkatapos talagang
//   magawa ang PNG: isang mungkahing next step (Quotes) at bilang na "natapos" para sa Friendly Care (session lang).
import { guardDashboard, isInAppBrowser } from "./auth-core-shared.js";
import { auth } from "./firebase-init.js";
import { onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";
import { initExitGuard } from "./exit-guard-shared.js";
import { cleanText } from "./security-core-shared.js";
import { t, applyStatic, watchLang, getLang } from "./banner-i18n.js?v=6";
import { readBusinessProfile, markDone } from "./local-state.js?v=2";
import { playDone } from "./sound.js?v=1";
import { mountHelpSheet } from "./help-sheet.js?v=1";
import { FORMATS, LAYOUTS, THEMES, LIMITS, renderBanner } from "./banner-render.js?v=3";

import { createStudio } from './banner-studio-ui.js?v=2';
import { assessPhoto, imageDimensions, contentCheck } from './banner-studio.js';

let studio=null;
const $ = (id) => document.getElementById(id);
const el = {
  loader: $("loader"), loaderOffline: $("loaderOffline"), app: $("app"), appError: $("appError"), offlineMsg: $("offlineMsg"),
  backLink: $("backLink"), canvas: $("bCanvas"), empty: $("bEmpty"), save: $("bSave"), saveMsg: $("bSaveMsg"),
  fitMsg: $("bFitMsg"), photoFitMsg:$("bPhotoFitMsg"),
  inspect:$("inspectDialog"),inspectButton:$("bInspect"),inspectCanvas:$("inspectCanvas"),inspectViewport:$("inspectViewport"),inspectTitle:$("inspectTitle"),inspectClose:$("inspectClose"),
  resultCopy:$("resultCopy"),resultCopyStatus:$("resultCopyStatus"),
  headlineErr: $("bHeadlineErr"),
  photoIn: $("bPhoto"), photoLabel: $("bPhotoLabel"), photoRemove: $("bPhotoRemove"), photoMsg: $("bPhotoMsg"),
  result: $("resultDialog"), resultTitle: $("resultTitle"), resultImg: $("resultImg"), resultNote: $("resultNote"),
  resultDownload: $("resultDownload"), resultClose: $("resultClose"), resultDone: $("resultDone"),
  fromProfile: $("bFromProfile"), nextLink: $("bNextLink"), helpBtn: $("helpBtn"),
  depart: $("leaveDialog"), keep: $("bKeepEditing"), leave: $("bLeaveEditor"),
};
const FIELDS = { headline: $("bHeadline"), detail: $("bDetail"), business: $("bBusiness"), contact: $("bContact"), price: $("bPrice"), product: $("bProduct"), offer: $("bOffer"), cta: $("bCta"), badge: $("bBadge") };
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
const msgs = { headline: null, photo: null, save: null, fit: null };
let lastFit = "";           // huling fit state; para hindi magsulat sa DOM kada frame
let fitRole = "";           // role key ("headline"/"detail"/"business"/"contact") para sa fitCut
let disarmExit = () => Promise.resolve();
let leaving = false;
let backFallback = null;
let ownerUid = null;
let invalidated = false;
let initialState = "";
let pendingDeparture = null;
let departureFocus = null;
let help = { open() {}, close: () => false, refresh() {} };
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
  return { ...v, ...studio?.read() };
}

/* ---------- Preview (iisang canvas; ito rin ang ginagawang PNG) ---------- */
// Status ng fitting mula sa renderBanner. Ang "fits" ay kabuuang resulta; ang sanhi ay galing sa
// "boxes": kapag may box na cut === true, may text na nagtapos sa "..."; kapag walang cut pero
// hindi pa rin kasya, masikip lang ang espasyo at walang naputol. Nagsusulat lang sa DOM kapag
// nagbago ang state, para walang kislap habang nagta-type.
function updateFit(res) {
  const cut = res && Array.isArray(res.boxes) ? res.boxes.filter((b) => b.cut).map((b) => b.role) : [];
  const state = !res || res.fits ? "" : cut.length === 1 ? "cut:" + cut[0] : cut.length ? "cutMany" : "tight";
  if (state === lastFit) return;
  lastFit = state;
  if (!state) { setMsg("fit", null); return; }
  if (state === "tight") { setMsg("fit", "fitTight"); return; }
  if (state === "cutMany") { setMsg("fit", "fitCutMany"); return; }
  fitRole = cut[0];
  setMsg("fit", "fitCut");
}

function draw() {
  frame = 0;
  if (!editorActive()) return;
  const v = values();
  const screen=contentCheck(v);
  const res = renderBanner(el.canvas, screen.blocked?{format:v.format,theme:v.theme}:{ ...v, photo:photo?{...photo,enhance:v.enhance,preserve:true,matte:THEMES[v.theme].bg[0]}:null });
  studio?.refresh(v);
  el.photoFitMsg.hidden=!res.photoFit?.fallback;
  el.photoFitMsg.textContent=res.photoFit?.fallback?t("photoFallback"):"";
  document.documentElement.classList.toggle("studioPreset",!!v.preset);
  el.empty.hidden = !!v.headline&&!screen.blocked;
  el.empty.textContent=screen.blocked?t(screen.reason):t("emptyHint");
  updateFit(v.headline ? res : null); // walang paalala habang wala pang headline: empty hint pa ang nasa stage
  const f = FORMATS[v.format];
  el.canvas.setAttribute("aria-label", screen.blocked?t(screen.reason):t("previewAria", t(FORMAT_KEY[v.format]), f.w, f.h));
  return res;
}
function schedule() { if (editorActive() && !frame) frame = requestAnimationFrame(draw); }
function flush() { if (frame) cancelAnimationFrame(frame); return draw(); }

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
  // Fit status: paalala lang, hindi error (walang isErr). Ang role ay isinasalin sa render time,
  // kaya tama ang wika kahit magpalit habang nakikita ang mensahe.
  const fitM = msgs.fit;
  el.fitMsg.textContent = fitM ? (fitM.key === "fitCut" ? t(fitM.key, t(fitRole)) : t(fitM.key)) : "";
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
  help.refresh();
  studio?.refreshLanguage();
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
  const dimensions=imageDimensions(new Uint8Array(await file.slice(0,262144).arrayBuffer()));
  if(dimensions&&dimensions.width*dimensions.height>MAX_PIXELS)throw photoError("photoPixels");
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
    let quality=null;
    try { const sample=document.createElement("canvas");sample.width=128;sample.height=128;const sc=sample.getContext("2d",{willReadFrequently:true});sc.drawImage(c,0,0,128,128);quality=assessPhoto(sc.getImageData(0,0,128,128).data,128,128,w,h);sample.width=sample.height=0; } catch {}
    return { source: c, width: c.width, height: c.height, id: ++photoSeq, quality };
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
  if (!editorActive()) return;
  const file = el.photoIn.files && el.photoIn.files[0];
  if (!file) return;
  const visualBefore=studio?.read().serviceVisual;
  const job = ++photoJob;
  photoLoading = true;
  setMsg("photo", "photoReading");
  let next = null, errKey = null;
  try { next = await readPhoto(file); } catch (e) { errKey = e && has(PHOTO_ERRORS, e.key) ? e.key : "photoBad"; }
  if (job !== photoJob || !editorActive()) { if (next) { next.source.width = 0; next.source.height = 0; } return; }
  photoLoading = false;
  el.photoIn.value = ""; // tapos nang basahin: hindi na itinatabi ang file sa input
  if (next) { dropPhoto(); photo = next; if(studio?.read().serviceVisual===visualBefore)studio?.usePhoto(); studio?.setQuality(next.quality); setMsg("photo", "photoAdded"); } else setMsg("photo", errKey, true);
  syncPhotoUI();
  schedule();
}
function removePhoto() {
  if (!editorActive()) return;
  photoJob++;
  photoLoading = false;
  el.photoIn.value = "";
  dropPhoto();
  studio?.setQuality(null);
  setMsg("photo", "photoRemoved");
  syncPhotoUI();
  schedule();
  el.photoIn.focus();
}

/* ---------- Inspection copies current pixels only; it never encodes, downloads or saves a project. ---------- */
function setInspectionZoom(mode) {
  el.inspectCanvas.style.width=mode==='fit'?'100%':`${el.inspectCanvas.width*(mode==='zoom'?2:1)}px`;
  for(const [id,value] of [['inspectFit','fit'],['inspectActual','actual'],['inspectZoom','zoom']])$(id).setAttribute('aria-pressed',String(mode===value));
}
function openInspection() {
  if(!editorActive())return;
  if(photoLoading){setMsg('save','photoWait',true);return;}
  const v=values(),screen=contentCheck(v);
  if(screen.blocked){studio?.showError(screen.reason,'bHeadline');return;}
  if(!v.headline){setMsg('headline','headlineErr',true);FIELDS.headline.focus();return;}
  flush();
  try {
    el.inspectCanvas.width=el.canvas.width;el.inspectCanvas.height=el.canvas.height;
    el.inspectCanvas.getContext('2d').drawImage(el.canvas,0,0);
    el.inspectCanvas.setAttribute('aria-label',el.canvas.getAttribute('aria-label'));
    setInspectionZoom('fit');el.inspect.showModal();el.inspectViewport.scrollTo(0,0);el.inspectTitle.focus();
  } catch { clearInspection();studio?.showError('inspectionFail'); }
}
function clearInspection() {
  el.inspectCanvas.width=0;el.inspectCanvas.height=0;el.inspectCanvas.style.width='100%';
  el.inspectCanvas.setAttribute('aria-label',t('inspectTitle'));
}
function onInspectionClosed() {
  clearInspection();
  if(editorActive()&&!el.depart.open&&!el.result.open)el.inspectButton.focus();
}
function closeInspection() {
  if(!el.inspect.open)return false;
  try { el.inspect.close(); } catch { el.inspect.removeAttribute('open');onInspectionClosed(); }
  return true;
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
  if (busy || !editorActive()) return;
  if (photoLoading) { setMsg("save", "photoWait", true); return; } // para hindi lumabas ang luma o walang larawan
  const v = values();
  if (!v.headline) {
    setMsg("headline", "headlineErr", true);
    FIELDS.headline.focus();
    return;
  }
  setMsg("headline", null);
  const problem=studio?.validate(v,photo);
  if(problem){$(problem.field||"bHeadline").focus();return;}
  const check=flush();
  if(!check?.fits){studio?.showError("fitExport");return;}
  setMsg("save", null);
  busy = true;
  setSaveBusy(true);
  try {
    const sig = JSON.stringify([v, photo ? photo.id : 0]);
    let fresh = false;
    if (!saved || saved.sig !== sig) {
      const blob = await new Promise((resolve) => { try { el.canvas.toBlob(resolve, "image/png"); } catch { resolve(null); } });
      if (!editorActive()) return; // logout/account change while PNG encoding was in flight
      if (!blob) throw new Error("png");
      const f = FORMATS[v.format];
      if (saved) URL.revokeObjectURL(saved.url); // ang lumang PNG ay hindi na kailangan
      saved = { sig, url: URL.createObjectURL(blob), name: `magnetraph-banner-${v.format}-${f.w}x${f.h}.png`, headline: v.headline };
      fresh = true;
      markDone("banner"); // talagang nagawa ang PNG (bagong banner lang ang binibilang)
      playDone(); // kapag naka-on lang sa Settings (laging may mensahe rin sa screen)
    }
    // Sa browser ng FB/Messenger, maaaring hindi gumana ang download: larawan lang (pindutin nang matagal)
    const inApp = isInAppBrowser();
    if (fresh && !inApp) download();
    openResult(inApp ? "noteInApp" : fresh ? "noteDownload" : "noteSame", inApp);
  } catch {
    setMsg("save", "saveFail", true);
  } finally {
    busy = false;
    if (editorActive()) setSaveBusy(false);
  }
}
function openResult(noteKey, inApp) {
  $("bOtherTools").open=false;el.resultCopyStatus.textContent="";
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
/* ---------- Navigation safety only: no editable project is persistently saved ---------- */
function editorActive() {
  const u = auth.currentUser;
  return !invalidated && !!ownerUid && u?.uid === ownerUid && u.emailVerified === true;
}
function editorState() {
  // Compare raw editable text, not only the renderer's cleaned/truncated values.
  return JSON.stringify([Object.values(FIELDS).map((input) => input.value),
    values().format, values().layout, values().theme, studio?.read(), photo ? photo.id : 0]);
}
function hasUnsavedChanges() {
  return editorActive() && (photoLoading || editorState() !== initialState);
}
function cancelDeparture() {
  pendingDeparture = null;
  if (el.depart.open) el.depart.close();
  const target = departureFocus;
  departureFocus = null;
  if (!editorActive()) return;
  (target?.isConnected && target.getClientRects().length ? target : el.backLink).focus();
}
async function leaveEditor(action) {
  if (leaving || !editorActive()) return;
  leaving = true;
  try { await disarmExit(); } catch {}
  if (editorActive()) action();
}
function requestDeparture(action) {
  if (leaving || pendingDeparture || !editorActive()) return;
  if (!hasUnsavedChanges()) { void leaveEditor(action); return; }
  departureFocus = document.activeElement;
  closeInspection();
  help.close();
  closeResult();
  pendingDeparture = action;
  try { el.depart.showModal(); el.keep.focus(); }
  catch {
    pendingDeparture = null;
    setMsg("save", "leaveUnavailable", true); // fail safe: keep the editor and its work
  }
}
function confirmDeparture() {
  const action = pendingDeparture;
  pendingDeparture = null;
  departureFocus = null;
  el.depart.close();
  if (action) void leaveEditor(action);
}
function plainClick(e) {
  return e.button === 0 && !e.metaKey && !e.ctrlKey && !e.shiftKey && !e.altKey;
}
function onNextLink(e) {
  if (!plainClick(e)) return; // bagong tab: hayaan ang browser
  e.preventDefault();
  requestDeparture(() => location.assign("/quote.html"));
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
function onBack(e) {
  if (!plainClick(e)) return;
  e.preventDefault();
  requestDeparture(() => {
    if (cameFromDashboard() && history.length > 1) goBack();
    else location.replace("/dashboard.html");
  });
}
function goBack() {
  history.back();
  backFallback = setTimeout(() => location.replace("/dashboard.html"), 2500);
}
function onOtherLink(e) {
  if (e.defaultPrevented || !plainClick(e)) return;
  const a = e.target.closest?.("a[href]");
  if (!a || a.hasAttribute("download") || (a.target && a.target !== "_self")) return;
  const url = new URL(a.href, location.href);
  if (!/^https?:$/.test(url.protocol)) return;
  if (url.origin === location.origin && url.pathname === location.pathname && url.search === location.search && url.hash) return;
  if (!hasUnsavedChanges()) return;
  e.preventDefault();
  requestDeparture(() => location.assign(url.href));
}
function closeOverlayOrProtect() {
  if (el.depart.open) { cancelDeparture(); return true; }
  if (closeInspection() || help.close() || closeResult()) return true;
  if (!hasUnsavedChanges()) return false;
  requestDeparture(goBack);
  return true; // the shared guard restores its own history entry; no second popstate handler
}
function clearPrivateState() {
  invalidated = true;
  leaving = true;
  document.documentElement.style.visibility = "hidden";
  el.app.hidden = true;
  clearTimeout(backFallback);
  cancelAnimationFrame(frame);
  frame = 0;
  photoJob++; // late photo decoding must not repopulate another account's page
  photoLoading = false;
  cancelDeparture();
  closeInspection();
  clearInspection();
  el.resultCopyStatus.textContent="";el.photoFitMsg.textContent="";
  help.close();
  closeResult();
  for (const input of Object.values(FIELDS)) input.value = "";
  studio?.clear();
  el.photoIn.value = "";
  dropPhoto();
  if (saved) URL.revokeObjectURL(saved.url);
  saved = null;
  resultNoteKey = null;
  el.resultImg.removeAttribute("src");
  el.resultImg.alt = "";
  el.resultNote.textContent = "";
  el.resultDownload.removeAttribute("href");
  el.resultDownload.removeAttribute("download");
  el.canvas.width = 0;
  el.canvas.height = 0;
  initialState = "";
}
function checkOwner(user) {
  if (invalidated || (user?.uid === ownerUid && user.emailVerified === true)) return;
  clearPrivateState();
  // Null/unverified users follow the unchanged shared Auth guard's redirect.
  if (user?.emailVerified) location.replace("/dashboard.html");
}
function armExitGuard() {
  try {
    disarmExit = initExitGuard({ getText: () => t("exitToast"), closeOverlay: closeOverlayOrProtect });
  } catch { /* walang exit guard: gumagana pa rin ang page */ }
}
function wire() {
  for (const r of document.querySelectorAll('input[name="bFormat"], input[name="bLayout"], input[name="bTheme"]')) r.addEventListener("change", schedule);
  for (const input of Object.values(FIELDS)) input.addEventListener("input", () => { studio?.showError(null);schedule(); });
  FIELDS.headline.addEventListener("input", () => { if (msgs.headline && FIELDS.headline.value.trim()) setMsg("headline", null); });
  el.photoIn.addEventListener("change", onPhotoChange);
  el.photoRemove.addEventListener("click", removePhoto);
  el.save.addEventListener("click", onSave);
  el.inspectButton.addEventListener('click',openInspection);
  el.inspectClose.addEventListener('click',closeInspection);
  el.inspect.addEventListener('close',onInspectionClosed);
  el.inspect.addEventListener('keydown',event=>{
    if(event.key!=='Tab')return;
    const targets=[el.inspectClose,$('inspectFit'),$('inspectActual'),$('inspectZoom'),el.inspectViewport];
    const first=targets[0],last=targets[targets.length-1],current=document.activeElement;
    if(!targets.includes(current)){event.preventDefault();(event.shiftKey?last:first).focus();}
    else if(event.shiftKey&&current===first){event.preventDefault();last.focus();}
    else if(!event.shiftKey&&current===last){event.preventDefault();first.focus();}
  });
  for(const [id,mode] of [['inspectFit','fit'],['inspectActual','actual'],['inspectZoom','zoom']])$(id).addEventListener('click',()=>{if(editorActive())setInspectionZoom(mode);});
  el.resultCopy.addEventListener('click',async()=>{const key=await studio?.copyPackage();if(editorActive())el.resultCopyStatus.textContent=key?t(key):'';});
  el.result.addEventListener("close", onResultClosed);
  el.resultClose.addEventListener("click", closeResult);
  el.resultDone.addEventListener("click", closeResult);
  el.backLink.addEventListener("click", onBack);
  el.nextLink.addEventListener("click", onNextLink);
  document.addEventListener("click", onOtherLink);
  el.keep.addEventListener("click", cancelDeparture);
  el.leave.addEventListener("click", confirmDeparture);
  el.depart.addEventListener("cancel", (e) => { e.preventDefault(); cancelDeparture(); });
  el.depart.addEventListener("close", () => { pendingDeparture = null; });
  el.depart.addEventListener("keydown", (e) => {
    if (e.key !== "Tab") return;
    if (e.shiftKey && document.activeElement === el.keep) { e.preventDefault(); el.leave.focus(); }
    else if (!e.shiftKey && document.activeElement === el.leave) { e.preventDefault(); el.keep.focus(); }
  });
  window.addEventListener("online", renderOffline);
  window.addEventListener("offline", renderOffline);
  // A departed document must not retain private content for a different account's history restore.
  // This is not draft persistence: a confirmed departure discards the editable work.
  window.addEventListener("pagehide", clearPrivateState);
  window.addEventListener("pageshow", (e) => {
    if (!e.persisted) return;
    clearPrivateState();
    location.reload(); // fresh shared Auth check; never reveal the cached editor first
  });
  watchLang(refreshText);
}
function start(user) {
  if (started) return;
  if (!user?.uid || !user.emailVerified || auth.currentUser?.uid !== user.uid) return;
  started = true;
  ownerUid = user.uid;
  studio=createStudio({t,getLang,onChange:schedule,active:editorActive,getValues:values});
  paintSwatches();
  applyBusinessProfile();
  initialState = editorState();
  onAuthStateChanged(auth, checkOwner);
  try { help = mountHelpSheet({ button: el.helpBtn, topicId: "banner", getLang }); } catch { el.helpBtn.hidden = true; }
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
  // UID is used only to invalidate volatile work on account changes; never rendered or stored.
  guardDashboard((user) => {
    try { start(user); } catch { console.error("banner: start failed"); showFatal(); }
  }, { idleMinutes: 60 });
} catch {
  console.error("banner: auth guard failed");
  showFatal();
}
