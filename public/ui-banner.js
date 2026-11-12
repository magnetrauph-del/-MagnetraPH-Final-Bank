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
import { t, applyStatic, watchLang, getLang } from "./banner-i18n.js?v=35.1-publish1";
import { readBusinessProfile, markDone } from "./local-state.js?v=3";
import { playDone } from "./sound.js?v=1";
import { FORMATS, LAYOUTS, THEMES, LIMITS, renderBanner } from "./banner-render.js?v=6";

import { createStudio, mountStudioHelp, STUDIO_BUILD } from './banner-studio-ui.js?v=35.1-visual1';
import { assessPhoto, imageDimensions, contentCheck, marketingPackage } from './banner-studio.js';

let studio=null;
const $ = (id) => document.getElementById(id);
const el = {
  loader: $("loader"), loaderOffline: $("loaderOffline"), app: $("app"), appError: $("appError"), offlineMsg: $("offlineMsg"),
  backLink: $("backLink"), canvas: $("bCanvas"), save: $("bSave"), saveMsg: $("bSaveMsg"),
  fitMsg: $("bFitMsg"), photoFitMsg:$("bPhotoFitMsg"),
  inspect:$("inspectDialog"),inspectButton:$("bGenerate"),inspectCanvas:$("bCanvas"),inspectViewport:$("inspectViewport"),inspectTitle:$("inspectTitle"),inspectClose:$("inspectClose"),
  resultCopy:$("resultCopy"),resultCopyStatus:$("resultCopyStatus"),
  shareButtons:[...document.querySelectorAll('[data-share-platform]')],shareStatus:$("bShareStatus"),shareHelp:$("bShareHelp"),shareOpen:$("bShareOpen"),
  headlineErr: $("bHeadlineErr"),
  photoIn: $("bPhoto"), photoLabel: $("bPhotoLabel"), photoRemove: $("bPhotoRemove"), photoMsg: $("bPhotoMsg"),
  resultImg: $("resultImg"), resultNote: $("resultNote"),
  fromProfile: $("bFromProfile"), helpBtn: $("helpBtn"),
  depart: $("leaveDialog"), keep: $("bKeepEditing"), leave: $("bLeaveEditor"),
};
// Inihahayag ang bersyon ng bawat asset para makita kung luma ang naka-cache sa browser.
document.documentElement.dataset.mgStudio=STUDIO_BUILD;
document.documentElement.dataset.mgCss=getComputedStyle(document.documentElement)
  .getPropertyValue('--mg-build').trim().replace(/^"|"$/g,'');
// Nakikita rin ito ng tao, hindi lang ng DevTools. Ang b27 ay ipinadala nang tama pero
// lumang asset ang tumatakbo sa telepono ng owner, at walang paraan noon para malaman
// iyon sa pagtingin lang. Nasa ilalim ng Help ang linyang ito: kung hindi magkatugma ang
// tatlong bersyon, may naka-cache na luma - at sinasabi na nito kung alin.
(function showBuild(){
  const html=document.documentElement;
  const doc=document.querySelector('meta[name="mg-build"]')?.content||'?';
  const js=html.dataset.mgStudio||'?',css=html.dataset.mgCss||'?';
  const node=$('bBuildStamp');
  if(!node)return;
  const agree=doc===js&&doc===css;
  node.textContent=agree?('Build '+doc):('Build mismatch - page '+doc+', script '+js+', style '+css);
  node.dataset.stale=agree?'false':'true';
})();
const FIELDS = { headline: $("bHeadline"), detail: $("bDetail"), business: $("bBusiness"), contact: $("bContact"), price: $("bPrice"), product: $("bProduct"), offer: $("bOffer"), cta: $("bCta"), badge: $("bBadge") };
const FORMAT_KEY = { square: "fmtSquare", portrait: "fmtPortrait", story: "fmtStory" };
const PHOTO_ERRORS = { photoBig: 1, photoType: 1, photoPixels: 1, photoBad: 1 };
const MAX_BYTES = 15 * 1024 * 1024; // 15 MB
const MAX_PIXELS = 60e6;            // hindi bubuksan ang napakalaking larawan (iwas crash sa phone)
const MAX_SIDE = 2160;              // pinapaliit ang larawan sa device bago gamitin
const SHARE_PLATFORMS=Object.freeze({
  facebook:{name:'Facebook',url:'https://www.facebook.com/'},
  tiktok:{name:'TikTok',url:'https://www.tiktok.com/',video:true},
  youtube:{name:'YouTube',url:'https://www.youtube.com/',video:true},
  instagram:{name:'Instagram',url:'https://www.instagram.com/'}
});

let started = false;
let busy = false;           // habang ginagawa ang PNG: walang dobleng save
let frame = 0;
let photo = null;           // { source: <canvas> sa memory, width, height, id }; hindi sine-save kahit saan
let photoSeq = 0;
let photoJob = 0;           // para hindi gamitin ang luma kapag mabilis na nagpalit ng larawan
let logo=null,logoJob=0,logoLoading=false;
let photoLoading = false;   // habang binubuksan ang larawan: maghintay muna bago mag-save
let saved = null;           // { sig, url, name, headline } ng huling PNG (para hindi ulitin ang parehong trabaho)
let resultNoteKey = null;
let shareJob=null,shareFeedback=null;
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
  const res = renderBanner(el.canvas, screen.blocked?{format:v.format,theme:v.theme}:{ ...v, logo, photo:photo?{...photo,enhance:v.enhance,preserve:true,matte:THEMES[v.theme].bg[0]}:null });
  studio?.refresh(v,res);
  el.photoFitMsg.hidden=!res.photoFit?.fallback;
  el.photoFitMsg.textContent=res.photoFit?.fallback?t("photoFallback"):"";
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
    if(name==="photo")node.classList.toggle("sr-only",!!m&&!m.err&&["photoAdded","photoRemoved"].includes(m.key));
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
  if(!studio)el.photoLabel.textContent = t(photo ? "photoChange" : "photoAdd");
  el.photoRemove.hidden = !photo;$("bPhotoAction").classList.toggle("primary",!photo);$("bPhotoAction").classList.toggle("secondary",!!photo);
  const thumb=$("bPhotoThumb");thumb.hidden=!photo;$("bUploadIcon").toggleAttribute("hidden",!!photo);thumb.closest(".uploadArea").classList.toggle("hasPhoto",!!photo);
  const scale=photo?Math.min(150/photo.width,150/photo.height):0;thumb.width=photo?Math.max(1,Math.round(photo.width*scale)):0;thumb.height=photo?Math.max(1,Math.round(photo.height*scale)):0;
  if(photo)thumb.getContext('2d').drawImage(photo.source,0,0,thumb.width,thumb.height);
  studio?.syncVisual(); // ang pagkakaroon ng larawan ang nagtatakda ng service-visual na pagpipilian
  studio?.refreshGuidance();
}
const noteText = (key) => (key === "noteDownload" && saved ? t(key, saved.name) : t(key));
function refreshText() {
  applyStatic(document);
  const themeColor=getComputedStyle(document.documentElement).getPropertyValue("--studio-canvas").trim();
  if(themeColor)for(const meta of document.querySelectorAll('meta[name="theme-color"]'))meta.content=themeColor;
  renderHints();
  renderMsgs();
  syncPhotoUI();
  if (saved) el.resultImg.alt = t("resultAlt", saved.headline);
  if (resultNoteKey) el.resultNote.textContent = noteText(resultNoteKey);
  help.refresh();
  studio?.refreshLanguage();
  if(inspecting)setGenerateBusy(true);
  renderShareFeedback();
  schedule();
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
  const job = ++photoJob, intent = studio?.beginPhotoSelection();
  photoLoading = true;
  studio?.refreshAssetState();
  setMsg("photo", "photoReading");
  let next = null, errKey = null;
  try { next = await readPhoto(file); } catch (e) { errKey = e && has(PHOTO_ERRORS, e.key) ? e.key : "photoBad"; }
  if (job !== photoJob || !editorActive()) { if (next) { next.source.width = 0; next.source.height = 0; } return; }
  photoLoading = false;
  el.photoIn.value = ""; // tapos nang basahin: hindi na itinatabi ang file sa input
  // Retain the accepted photo, but activate it only if its selection intent is still current.
  if (next) { dropPhoto(); photo = next; studio?.usePhoto(intent); studio?.setQuality(next.quality); setMsg("photo", "photoAdded"); } else { studio?.rejectPhoto(intent); setMsg("photo", errKey, true); }
  syncPhotoUI();
  studio?.refreshAssetState();
  schedule();
}
function removePhoto() {
  if (!editorActive()) return;
  photoJob++;
  photoLoading = false;
  el.photoIn.value = "";
  dropPhoto();
  studio?.setQuality(null);
  studio?.recordChange('user',[1]);
  studio?.refreshAssetState();
  setMsg("photo", "photoRemoved");
  syncPhotoUI();
  schedule();
  el.photoIn.focus();
}

function dropLogo(){if(logo){logo.source.width=0;logo.source.height=0;}logo=null;}
function syncLogo(){const thumb=$('bLogoThumb');thumb.hidden=!logo;$('bLogoRemove').hidden=!logo;const scale=logo?Math.min(64/logo.width,64/logo.height):0;thumb.width=logo?Math.max(1,Math.round(logo.width*scale)):0;thumb.height=logo?Math.max(1,Math.round(logo.height*scale)):0;if(logo)thumb.getContext('2d').drawImage(logo.source,0,0,thumb.width,thumb.height);}
async function onLogoChange(){
  if(!editorActive())return;const file=$('bLogo').files?.[0];if(!file)return;const job=++logoJob;logoLoading=true;studio?.refreshAssetState();$('bLogoMsg').textContent=t('photoReading');let next=null,error=null;
  try{next=await readPhoto(file);}catch(e){error=has(PHOTO_ERRORS,e.key)?e.key:'photoBad';}
  if(job!==logoJob||!editorActive()){if(next){next.source.width=0;next.source.height=0;}return;}
  logoLoading=false;$('bLogo').value='';
  if(next){dropLogo();logo=next;studio?.recordChange('user',[1]);$('bLogoMsg').textContent=t('wizardLogoReady');}else $('bLogoMsg').textContent=t(error);
  $('bLogoMsg').classList.toggle('isErr',!!error);syncLogo();studio?.refreshAssetState();schedule();
}

/* Separate preview uses the same render canvas; CSS zoom never encodes a PNG. */
function setInspectionZoom(mode) {
  const width=mode==='fit'?'100%':`${el.canvas.width*(mode==='zoom'?2:1)}px`;
  el.canvas.style.width=width;el.resultImg.style.width=width;
  for(const [id,value] of [['inspectFit','fit'],['inspectActual','actual'],['inspectZoom','zoom']])$(id).setAttribute('aria-pressed',String(mode===value));
}
// Lock synchronously, then use the next rendering frame; no minimum loading delay.
// The watchdog cancels work that never starts. Synchronous Canvas work cannot be preempted.
let inspecting=false,generation=null;
const GENERATE_TIMEOUT=12000;
function setGenerateBusy(on) {
  const b=el.inspectButton;
  b.disabled=on;
  if(on){
    b.setAttribute('aria-busy','true');b.setAttribute('aria-disabled','true');
    b.textContent=t('wizardGenerating');
  } else {
    b.removeAttribute('aria-busy');b.removeAttribute('aria-disabled');
    b.textContent=t('wizardGenerate');
  }
  if(editorActive())studio?.refreshReadiness();
}
function finishGeneration(job,error){
  if(generation!==job)return;
  cancelAnimationFrame(job.frame);clearTimeout(job.timer);generation=null;inspecting=false;
  if(error&&editorActive())studio?.invalidateRenderFit();
  setGenerateBusy(false);
  if(error&&editorActive())studio?.showError(error);
}
function openInspection() {
  if(!editorActive()||inspecting||el.inspect.open)return;
  const job={ticket:studio.generationTicket(),step:studio.getStep(),frame:0,timer:0};
  generation=job;inspecting=true;setGenerateBusy(true);
  // Keep existing field/content guidance synchronous; failed attempts do no render work.
  try{if(!validateInspection()){queueMicrotask(()=>finishGeneration(job));return;}}
  catch{finishGeneration(job,'inspectionFail');return;}
  if(frame){cancelAnimationFrame(frame);frame=0;}
  job.timer=setTimeout(()=>finishGeneration(job,'previewTimeout'),GENERATE_TIMEOUT);
  job.frame=requestAnimationFrame(()=>{
    if(generation!==job)return;
    if(!editorActive()||studio.getStep()!==job.step||!studio.currentGeneration(job.ticket)){finishGeneration(job);return;}
    try{attemptInspection(job);}catch{finishGeneration(job,'inspectionFail');}
    finally{finishGeneration(job);}
  });
}
function validateInspection() {
  const v=values(),problem=studio?.validate(v,photo);
  if(photoLoading||logoLoading){studio?.showError("photoWait",problem?.field);return null;}
  if(problem)return null;
  // Retain the whole-brief safety gate even if a future field is not yet mapped.
  const screen=contentCheck(v);
  if(screen.blocked){studio?.showError(screen.reason,'bHeadline');return null;}
  return v;
}
function attemptInspection(job) {
  if(!validateInspection())return;
  const rendered=flush();
  if(generation!==job||!editorActive()||!studio.currentGeneration(job.ticket))return;
  if(!rendered?.fits){studio?.showError('fitExport','bHeadline');return;}
  try {
    el.inspectCanvas.setAttribute('aria-label',el.canvas.getAttribute('aria-label'));
    el.canvas.hidden=false;el.resultImg.hidden=true;el.resultNote.hidden=true;el.inspectTitle.textContent=t('wizardPreview');
    setInspectionZoom('fit');el.inspect.showModal();studio?.confirmAll();studio?.previewOpened();el.inspectViewport.scrollTo(0,0);el.inspectTitle.focus();
  } catch { clearInspection();studio?.showError('inspectionFail'); }
}
function clearInspection() {
  el.inspectCanvas.style.width='100%';
  resetShareFeedback();
}
function onInspectionClosed() {
  clearInspection();studio?.previewClosed();
  // Ang close event ng dialog ay dumarating pagkatapos ng Download na tumanggi. Kapag may
  // ipinapakitang error, ang field na kailangang punan ang may focus - huwag itong ilipat.
  if(!$("bStudioError").hidden)return;
  if(editorActive()&&!el.depart.open){if(studio.getStep()===4)el.inspectButton.focus();else $("s"+studio.getStep()+"h").focus();}
}
function closeInspection() {
  if(!el.inspect.open)return false;
  resetShareFeedback();
  try { el.inspect.close();studio?.previewClosed(); } catch { el.inspect.removeAttribute('open');onInspectionClosed(); }
  return true;
}

/* Text sharing only. PNG export stays behind its existing Download validation. */
function setShareBusy(on){
  for(const button of el.shareButtons){button.disabled=on;if(on)button.setAttribute('aria-busy','true');else button.removeAttribute('aria-busy');}
}
function renderShareFeedback(){
  const platform=shareFeedback&&SHARE_PLATFORMS[shareFeedback.platform];
  el.shareStatus.textContent=platform?t(shareFeedback.key,platform.name):'';
  el.shareHelp.hidden=!platform;el.shareHelp.textContent=platform?t(platform.video?'publishVideoHelp':'publishImageHelp'):'';
  el.shareOpen.hidden=!platform;el.shareOpen.textContent=platform?t('publishOpen',platform.name):'';
  if(platform)el.shareOpen.href=platform.url;else el.shareOpen.removeAttribute('href');
}
function resetShareFeedback(){
  if(shareJob)shareJob.closed=true;
  shareFeedback=null;renderShareFeedback();
}
function showShareFeedback(platform,key){shareFeedback={platform,key};renderShareFeedback();}
function currentShare(job){return shareJob===job&&!job.closed&&editorActive()&&el.inspect.open&&studio.currentGeneration(job.ticket);}
async function sharePublishing(id){
  const platform=Object.prototype.hasOwnProperty.call(SHARE_PLATFORMS,id)?SHARE_PLATFORMS[id]:null;
  if(!platform||!editorActive()||!el.inspect.open||shareJob||busy||inspecting)return;
  if(photoLoading||logoLoading){showShareFeedback(id,'photoWait');return;}
  const v=values(),problem=studio.firstProblem(photo,v);
  if(problem){closeInspection();studio.showError(problem.key,problem.field);return;}
  const safety=contentCheck(v);
  if(safety.blocked){closeInspection();studio.showError(safety.reason,'bHeadline');return;}
  const copy=marketingPackage(v,getLang()),text=[copy.hook,copy.caption,copy.cta,copy.hashtags].filter(Boolean).join('\n\n');
  const job={ticket:studio.generationTicket(),closed:false};shareJob=job;setShareBusy(true);showShareFeedback(id,'publishChoose');
  try{
    if(typeof navigator.share==='function'){
      try{await navigator.share({title:t('packageTitle'),text});if(currentShare(job))showShareFeedback(id,'publishShared');return;}
      catch(error){if(!currentShare(job))return;if(error?.name==='AbortError'){showShareFeedback(id,'publishCancelled');return;}}
    }
    if(!currentShare(job))return;
    try{await navigator.clipboard.writeText(text);if(currentShare(job))showShareFeedback(id,'publishCopied');}
    catch{if(currentShare(job))showShareFeedback(id,'publishManual');}
  }finally{
    if(shareJob===job){
      const current=currentShare(job);shareJob=null;
      if(editorActive()){
        setShareBusy(false);
        if(!current){shareFeedback=null;renderShareFeedback();}
        else if(document.activeElement===document.body)el.shareButtons.find(button=>button.dataset.sharePlatform===id)?.focus({preventScroll:true});
      }
    }
  }
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
  if (photoLoading||logoLoading) { setMsg("save", "photoWait", true); return; } // para hindi lumabas ang luma o walang larawan
  const v = values();
  if (!v.headline) {
    setMsg("headline", "headlineErr", true);
    studio?.reveal("bHeadline");
    return;
  }
  setMsg("headline", null);
  // Sariling pagsusuri ang Download sa lahat ng apat na step. Tinitingnan muna nang tahimik,
  // isinasara ang preview, saka ipinapakita ang error: habang bukas ang dialog ay inert ang
  // mga field sa labas nito, kaya hindi mapupunta sa tamang field ang focus.
  const problem=studio?.firstProblem(photo,v);
  if(problem){closeInspection();studio?.showError(problem.key,problem.field);return;}
  const check=flush();
  if(!check?.fits){studio?.showError("fitExport");return;}
  setMsg("save", null);
  busy = true;
  setSaveBusy(true);
  try {
    const sig = JSON.stringify([v, photo ? photo.id : 0,logo?logo.id:0]);
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
    if (!inApp) download();
    openResult(inApp ? "noteInApp" : fresh ? "noteDownload" : "noteSame", inApp);
  } catch {
    setMsg("save", "saveFail", true);
  } finally {
    busy = false;
    if (editorActive()) setSaveBusy(false);
  }
}
function openResult(noteKey, inApp) {
  resultNoteKey=noteKey;
  el.resultImg.src=saved.url;
  el.resultImg.alt=t("resultAlt",saved.headline);
  el.resultImg.hidden=!inApp;
  el.canvas.hidden=inApp;
  el.resultNote.textContent=noteText(noteKey);
  el.resultNote.hidden=false;
  el.inspectTitle.textContent=t("resultTitle");
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
    values().format, values().layout, values().theme, studio?.read(), photo ? photo.id : 0,logo?logo.id:0]);
}
function hasUnsavedChanges() {
  return editorActive() && (photoLoading || logoLoading || editorState() !== initialState);
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
  if(studio?.getStep()>1){studio.showError(null);studio.goStep(studio.getStep()-1,{restore:true});return;}
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
  if (help.close() || closeInspection()) return true;
  if(studio?.getStep()>1){studio.showError(null);studio.goStep(studio.getStep()-1,{restore:true});return true;}
  if (!hasUnsavedChanges()) return false;
  requestDeparture(goBack);
  return true; // the shared guard restores its own history entry; no second popstate handler
}
function clearPrivateState() {
  invalidated = true;
  leaving = true;
  if(generation)finishGeneration(generation);
  document.documentElement.style.visibility = "hidden";
  el.app.hidden = true;
  clearTimeout(backFallback);
  cancelAnimationFrame(frame);
  frame = 0;
  logoJob++;logoLoading=false;dropLogo();$("bLogo").value="";$("bLogoMsg").textContent="";syncLogo();
  photoJob++; // late photo decoding must not repopulate another account's page
  photoLoading = false;
  cancelDeparture();
  closeInspection();
  clearInspection();
  el.resultCopyStatus.textContent="";el.photoFitMsg.textContent="";
  shareJob=null;setShareBusy(false);
  help.close();
  for (const input of Object.values(FIELDS)) input.value = "";
  studio?.clear();
  studio?.disposeAttention();
  el.photoIn.value = "";
  dropPhoto();syncPhotoUI();
  if (saved) URL.revokeObjectURL(saved.url);
  saved = null;
  resultNoteKey = null;
  el.resultImg.removeAttribute("src");
  el.resultImg.alt = "";
  el.resultNote.textContent = "";
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
  for (const r of document.querySelectorAll('input[name="bFormat"]')) r.addEventListener("change", schedule);
  for (const input of Object.values(FIELDS)) input.addEventListener("input", () => { studio?.showError(null);schedule(); });
  FIELDS.headline.addEventListener("input", () => { if (msgs.headline && FIELDS.headline.value.trim()) setMsg("headline", null); });
  el.photoIn.addEventListener("change", onPhotoChange);
  el.photoRemove.addEventListener("click", removePhoto);
  el.save.addEventListener("click", onSave);
  el.inspectButton.addEventListener('click',openInspection);
  $('bEdit').addEventListener('click',()=>{if(!editorActive())return;closeInspection();studio.goStep($('bEditStep').value);});
  $('bLogo').addEventListener('change',onLogoChange);
  $('bLogoRemove').addEventListener('click',()=>{if(!editorActive())return;logoJob++;logoLoading=false;dropLogo();syncLogo();studio?.recordChange('user',[1]);studio?.refreshAssetState();$('bLogoMsg').textContent=t('wizardLogoRemoved');schedule();});
  el.inspectClose.addEventListener('click',closeInspection);
  el.inspect.addEventListener('close',onInspectionClosed);
  el.inspect.addEventListener('keydown',event=>{
    if(event.key!=='Tab')return;
    const targets=[...el.inspect.querySelectorAll('button,a[href],select,input,summary,[tabindex="0"]')].filter(n=>!n.hidden&&n.getClientRects().length);
    const first=targets[0],last=targets[targets.length-1],current=document.activeElement;
    if(!targets.includes(current)){event.preventDefault();(event.shiftKey?last:first).focus();}
    else if(event.shiftKey&&current===first){event.preventDefault();last.focus();}
    else if(!event.shiftKey&&current===last){event.preventDefault();first.focus();}
  });
  for(const [id,mode] of [['inspectFit','fit'],['inspectActual','actual'],['inspectZoom','zoom']])$(id).addEventListener('click',()=>{if(editorActive())setInspectionZoom(mode);});
  el.resultCopy.addEventListener('click',async()=>{const key=await studio?.copyPackage();if(editorActive())el.resultCopyStatus.textContent=key?t(key):'';});
  for(const button of el.shareButtons)button.addEventListener('click',()=>sharePublishing(button.dataset.sharePlatform));
  el.backLink.addEventListener("click", onBack);
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
  studio=createStudio({t,getLang,onChange:schedule,active:editorActive,getValues:values,getPhoto:()=>photo,getAssets:()=>({logoId:logo?.id||0,busy:photoLoading||logoLoading,photoLoading}),
    onBaseline:()=>{initialState=editorState();}});
  applyBusinessProfile();
  initialState = editorState();
  onAuthStateChanged(auth, checkOwner);
  try { help = mountStudioHelp({t,active:editorActive,onTutorial:()=>studio.startTutorial(),
    inSetup:()=>studio.isSetupOpen()}); } catch { el.helpBtn.hidden = true; }
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
