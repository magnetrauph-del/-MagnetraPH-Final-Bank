import { CATEGORIES, CATEGORY_BY_ID, STYLES, PRESET_BY_ID, searchCategories } from './banner-catalog.js';
import { contentCheck, marketingPackage } from './banner-studio.js';
// Auth lifecycle is owned by ui-banner; this module has no Auth/API/storage access.
export function createStudio({t,getLang,onChange,active,getValues}) {
 const $=id=>document.getElementById(id),category=$('bCategory'),preset=$('bPreset'),style=$('bDesignStyle');
 let quality=null,lastCategory='other';
 const option=(value,label)=>{const n=document.createElement('option');n.value=value;n.textContent=label;return n;};
 function categories(){const selected=category.value||lastCategory,found=searchCategories($('bCategorySearch').value);category.replaceChildren(...found.map(c=>option(c.id,c.label)));if(!found.some(c=>c.id===selected))category.prepend(option(selected,CATEGORY_BY_ID[selected]?.label||CATEGORY_BY_ID.other.label));category.value=selected;$('bCategoryEmpty').hidden=found.length!==0;}
 function presets(){const current=preset.value,c=CATEGORY_BY_ID[category.value]||CATEGORY_BY_ID.other;preset.replaceChildren(option('',t('originalLayouts')),...c.presets.map(p=>option(p.id,p.label)));preset.value=PRESET_BY_ID[current]?.category===c.id?current:'';$('bCustomWrap').hidden=c.id!=='other';lastCategory=c.id;}
 function read(){return {category:category.value||'other',preset:preset.value,designStyle:style.value||'category',serviceVisual:$('bVisual').value,enhance:$('bEnhance').checked,customCategory:$('bCustomCategory').value};}
 function showError(key,field){const n=$('bStudioError');n.textContent=key?t(key):'';n.hidden=!key;for(const id of ['bProduct','bPreset','bVisual','bHeadline'])$(id).removeAttribute('aria-invalid');if(field)$(field).setAttribute('aria-invalid','true');return key?{key,field}:null;}
 function validate(v,photo){
  const problem=contentCheck({...v,customCategory:read().customCategory});if(problem.blocked)return showError(problem.reason,'bHeadline');
  if(!v.preset&&([v.product,v.offer,v.cta,v.badge].some(Boolean)||v.serviceVisual!=='photo'||!['category','brand'].includes(v.designStyle)))return showError('needsPreset','bPreset');
  if(v.preset&&!v.product)return showError('productRequired','bProduct');
  if(v.preset&&v.serviceVisual==='photo'&&!photo)return showError('pickVisual','bVisual');
  return showError(null);
 }
 function refresh(v){
  const copy=marketingPackage(v,getLang()),blocked=contentCheck({...v,customCategory:read().customCategory}).blocked;
  for(const [id,key] of [['bHook','hook'],['bCaption','caption'],['bPackageCta','cta'],['bHashtags','hashtags']]){const value=blocked?'':copy[key];if($(id).textContent!==value)$(id).textContent=value;}
  $('bPackage').hidden=blocked||!v.headline;$('bPackageEmpty').hidden=!!v.headline&&!blocked;
  const hints=quality?(quality.warnings.length?[...quality.warnings.map(t),t('qualityReview')]:[t('qualityReady')]):[];
  $('bPhotoQuality').className=quality?.warnings.length?'studioNotice':'hint';
  $('bPhotoQuality').textContent=hints.join(' ');$('bPhotoQuality').hidden=!quality;
 }
 function refreshLanguage(){const oldStyle=style.value;categories();presets();style.replaceChildren(...STYLES.map(s=>option(s.id,s.label)));style.value=STYLES.some(s=>s.id===oldStyle)?oldStyle:'category';$('bCopyStatus').textContent='';}
 categories();presets();style.replaceChildren(...STYLES.map(s=>option(s.id,s.label)));
 for(const button of document.querySelectorAll('.briefNav [data-step]'))button.addEventListener('click',()=>{if(!active())return;const target=$(button.dataset.step);target.tabIndex=-1;target.focus({preventScroll:true});target.scrollIntoView({block:'start',behavior:'instant'});});
 $('bCategorySearch').addEventListener('input',()=>{if(active())categories();});
 category.addEventListener('change',()=>{if(!active())return;presets();showError(null);onChange();});
 for(const n of [preset,style,$('bVisual'),$('bEnhance'),$('bCustomCategory')])n.addEventListener(n.id==='bCustomCategory'?'input':'change',()=>{if(!active())return;if(n===preset&&preset.value)$('bOriginalControls').open=false;showError(null);onChange();});
 for(const n of document.querySelectorAll('input[name="bLayout"]')){const original=()=>{if(active()){preset.value='';showError(null);onChange();}};n.addEventListener('click',original);n.addEventListener('change',original);}
 async function copyPackage(){
  if(!active())return null;const v=getValues();
  if(contentCheck(v).blocked){showError('copyBlocked');return 'copyBlocked';}
  if(!v.headline){showError('headlineErr','bHeadline');return 'headlineErr';}
  const p=marketingPackage(v,getLang());
  try{await navigator.clipboard.writeText([p.hook,p.caption,p.cta,p.hashtags].filter(Boolean).join('\n\n'));if(active())$('bCopyStatus').textContent=t('copied');return active()?'copied':null;}
  catch{if(active())$('bCopyStatus').textContent=t('copyFail');return active()?'copyFail':null;}
 }
 $('bCopyPackage').addEventListener('click',copyPackage);
 return {read,copyPackage,refresh,refreshLanguage,validate,showError,usePhoto(){ $('bVisual').value='photo'; },setQuality(q){quality=q;},clear(){quality=null;$('bCategorySearch').value='';$('bCustomCategory').value='';category.value='other';preset.value='';style.value='category';$('bVisual').value='photo';$('bEnhance').checked=false;for(const id of ['bHook','bCaption','bPackageCta','bHashtags','bCopyStatus','bPhotoQuality','bStudioError'])$(id).textContent='';$('bPhotoQuality').hidden=true;$('bStudioError').hidden=true;}};
}
