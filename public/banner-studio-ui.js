import { CATEGORIES, CATEGORY_BY_ID, STYLES, PRESET_BY_ID, searchCategories } from './banner-catalog.js';
import { contentCheck, marketingPackage } from './banner-studio.js';

// Presentation and wizard state only. Auth, pixels and export remain owned by ui-banner.
export function createStudio({t,getLang,onChange,active,getValues,getPhoto}) {
  const $=id=>document.getElementById(id);
  const category=$('bCategory'),preset=$('bPreset'),style=$('bDesignStyle');
  let quality=null,step=1,lastCategory='other',tutorialActive=false,previewing=false;
  const scrolls=new Map();
  const option=(value,label)=>{const node=document.createElement('option');node.value=value;node.textContent=label;return node;};
  function categories(){
    const selected=category.value||lastCategory,found=searchCategories($('bCategorySearch').value);
    category.replaceChildren(...found.map(c=>option(c.id,c.label)));
    if(!found.some(c=>c.id===selected))category.prepend(option(selected,CATEGORY_BY_ID[selected]?.label||CATEGORY_BY_ID.other.label));
    category.value=selected;$('bCategoryEmpty').hidden=found.length!==0;$('bCategoryClear').hidden=$('bCategorySearch').value.length===0;
  }
  function recommended(){
    const selected=preset.value,c=CATEGORY_BY_ID[category.value]||CATEGORY_BY_ID.other;
    $('bRecommended').replaceChildren(...c.presets.map(p=>{
      const b=document.createElement('button');b.type='button';b.className='presetButton';b.dataset.preset=p.id;b.setAttribute('aria-pressed',String(p.id===selected));
      const diagram=document.createElement('span');diagram.className='presetDiagram '+p.family;diagram.setAttribute('aria-hidden','true');
      const text=document.createElement('span');text.textContent=p.label;b.append(diagram,text);
      b.addEventListener('click',()=>{if(!active())return;preset.value=p.id;recommended();showError(null);onChange();$('bRecommended').querySelector(`[data-preset="${p.id}"]`)?.focus();});return b;
    }));
    $('bCustomWrap').hidden=c.id!=='other';lastCategory=c.id;
  }
  function allPresets(){
    const selected=preset.value;
    preset.replaceChildren(...CATEGORIES.map(c=>{const g=document.createElement('optgroup');g.label=c.label;g.append(...c.presets.map(p=>option(p.id,p.label)));return g;}));
    preset.value=PRESET_BY_ID[selected]?selected:CATEGORY_BY_ID[category.value||'other'].presets[0].id;
    recommended();
  }
  function read(){return {category:category.value||'other',preset:preset.value,designStyle:style.value||'category',serviceVisual:$('bVisual').value,enhance:$('bEnhance').checked,customCategory:$('bCustomCategory').value};}
  function progress(){
    $('bStepStatus').textContent=t('wizardStepCount',step);
    for(const n of document.querySelectorAll('[data-progress]')){if(Number(n.dataset.progress)===step)n.setAttribute('aria-current','step');else n.removeAttribute('aria-current');}
  }
  function goStep(next,{focus=true,restore=false}={}){
    if(!active())return;
    scrolls.set(step,window.scrollY);step=Math.max(1,Math.min(4,Number(next)||1));
    for(const panel of document.querySelectorAll('[data-wizard-step]'))panel.hidden=Number(panel.dataset.wizardStep)!==step;
    $('bPrevious').hidden=step===1;$('bContinue').hidden=step===4;$('bGenerate').hidden=step!==4;progress();renderTutorial();
    if(focus)$('s'+step+'h').focus({preventScroll:true});
    window.scrollTo({top:restore?(scrolls.get(step)||0):0,behavior:'instant'});
  }
  function reveal(field){
    const node=$(field);if(!node)return;
    const target=node.closest('[data-wizard-step]');if(target&&Number(target.dataset.wizardStep)!==step)goStep(target.dataset.wizardStep);
    for(let parent=node.parentElement;parent&&parent!==document.body;parent=parent.parentElement)if(parent.tagName==='DETAILS')parent.open=true;
    node.focus();
  }
  function showError(key,field){
    const node=$('bStudioError');node.textContent=key?t(key):'';node.hidden=!key;
    for(const field of document.querySelectorAll('#app [aria-invalid]'))field.removeAttribute('aria-invalid');
    if(key&&field){$(field)?.setAttribute('aria-invalid','true');reveal(field);}
    return key?{key,field}:null;
  }
  function validateStep(at,photo){
    const v=getValues();
    if(at===1&&v.serviceVisual==='photo'&&!photo)return showError('pickVisual','bVisual');
    if(at===2&&!v.product)return showError('productRequired','bProduct');
    if(at===2&&!v.headline)return showError('headlineErr','bHeadline');
    if(at===3&&!PRESET_BY_ID[v.preset])return showError('needsPreset','bPreset');
    const problem=contentCheck(at===2?{product:v.product,headline:v.headline,price:v.price}:at===4?v:{});
    if(problem.blocked){const key=Object.keys(v).find(k=>typeof v[k]==='string'&&contentCheck({text:v[k]}).blocked),field=key?'b'+key[0].toUpperCase()+key.slice(1):'bHeadline';return showError(problem.reason,document.getElementById(field)?field:'bHeadline');}
    return showError(null);
  }
  function validate(v,photo){for(const n of [1,2,3,4]){const error=validateStep(n,photo);if(error)return error;}return null;}
  function refresh(v){
    const copy=marketingPackage(v,getLang()),blocked=contentCheck(v).blocked;
    for(const [id,key] of [['bHook','hook'],['bCaption','caption'],['bPackageCta','cta'],['bHashtags','hashtags']])if($(id).textContent!==(blocked?'':copy[key]))$(id).textContent=blocked?'':copy[key];
    $('bPackage').hidden=blocked||!v.headline;$('bPackageEmpty').hidden=!!v.headline&&!blocked;
    $('bPhotoQuality').className=quality?.warnings.length?'studioNotice':'hint';
    $('bPhotoQuality').textContent=quality?(quality.warnings.length?[...quality.warnings.map(t),t('qualityReview')]:[t('qualityReady')]).join(' '):'';$('bPhotoQuality').hidden=!quality;
    $('bFormatSize').textContent=v.format==='story'?'1080 × 1920':v.format==='portrait'?'1080 × 1350':'1080 × 1080';
  }
  function refreshLanguage(){const old=style.value;categories();allPresets();style.replaceChildren(...STYLES.map(s=>option(s.id,s.label)));style.value=STYLES.some(s=>s.id===old)?old:'category';progress();renderTutorial();}
  async function copyPackage(){
    if(!active())return null;const v=getValues();if(contentCheck(v).blocked){showError('copyBlocked');return 'copyBlocked';}
    if(!v.headline){showError('headlineErr','bHeadline');return 'headlineErr';}
    const p=marketingPackage(v,getLang());
    try{await navigator.clipboard.writeText([p.hook,p.caption,p.cta,p.hashtags].filter(Boolean).join('\n\n'));return active()?'copied':null;}catch{return active()?'copyFail':null;}
  }
  function renderTutorial(){
    const panel=$('bTutorial');panel.hidden=!tutorialActive;
    if(!tutorialActive)return;
    const index=previewing?5:step;
    $('bTutorialCount').textContent=t('tutorialCount',index);
    $('bTutorialText').textContent=t(['','tutorialProduct','tutorialMessage','tutorialDesign','tutorialOffer','tutorialPreview'][index]);
    $('bTutorialBack').hidden=index===1;$('bTutorialNext').hidden=index===5;$('bTutorialFinish').hidden=index!==5;$('bTutorialSkip').hidden=index===5;
  }
  function focusTutorialControl(){if(!active())return;const node=previewing?$('bSave'):$(['','bPhoto','bProduct','bCategorySearch','bOffer'][step]);node?.focus();}
  function stopTutorial({focus=true}={}){tutorialActive=false;renderTutorial();if(focus&&active())(previewing?$('bSave'):step===4?$('bGenerate'):$('bContinue')).focus();}
  function startTutorial(){if(!active())return;previewing=false;tutorialActive=true;goStep(1);focusTutorialControl();}
  function previewOpened(){previewing=true;$('bPreviewGuidance').append($('bTutorial'));renderTutorial();}
  function previewClosed(){previewing=false;$('bStudioError').before($('bTutorial'));renderTutorial();}
  $('bTutorialSkip').addEventListener('click',()=>stopTutorial());
  $('bTutorialFinish').addEventListener('click',()=>stopTutorial());
  $('bTutorialBack').addEventListener('click',()=>{if(!active())return;if(previewing)$('inspectClose').click();else goStep(step-1,{restore:true});focusTutorialControl();});
  $('bTutorialNext').addEventListener('click',()=>{if(!active())return;if(step===4){$('bGenerate').click();return;}if(!validateStep(step,getPhoto())){goStep(step+1);focusTutorialControl();}});
  categories();allPresets();style.replaceChildren(...STYLES.map(s=>option(s.id,s.label)));goStep(1,{focus:false});
  $('bContinue').addEventListener('click',()=>{if(active()&&!validateStep(step,getPhoto()))goStep(step+1);});
  $('bPrevious').addEventListener('click',()=>{if(active()){showError(null);goStep(step-1,{restore:true});}});
  $('bCategorySearch').addEventListener('input',()=>{if(active())categories();});
  $('bCategoryClear').addEventListener('click',()=>{if(!active())return;$('bCategorySearch').value='';categories();$('bCategorySearch').focus();});
  category.addEventListener('change',()=>{if(!active())return;preset.value=CATEGORY_BY_ID[category.value].presets[0].id;recommended();showError(null);onChange();});
  preset.addEventListener('change',()=>{if(!active())return;lastCategory=PRESET_BY_ID[preset.value].category;category.value=lastCategory;categories();recommended();showError(null);onChange();});
  for(const node of [style,$('bVisual'),$('bEnhance'),$('bCustomCategory')])node.addEventListener(node.id==='bCustomCategory'?'input':'change',()=>{if(active()){showError(null);onChange();}});
  for(const color of document.querySelectorAll('input[name="bTheme"]'))color.addEventListener('change',()=>{if(active()){style.value='brand';showError(null);onChange();}});
  $('bCtaChoice').addEventListener('change',()=>{if(!active())return;const choice=$('bCtaChoice').value;$('bCtaCustom').hidden=choice!=='custom';if(choice!=='custom')$('bCta').value=choice?t('wizard'+({shop:'Shop',order:'Order',message:'Contact',book:'Book',learn:'Learn'}[choice])):'';else $('bCta').focus();showError(null);onChange();});
  return {read,refresh,refreshLanguage,validate,validateStep,showError,copyPackage,goStep,startTutorial,stopTutorial,previewOpened,previewClosed,getStep:()=>step,reveal,usePhoto(){ $('bVisual').value='photo'; },setQuality(q){quality=q;},clear(){stopTutorial({focus:false});previewing=false;previewClosed();quality=null;scrolls.clear();$('bCategoryClear').hidden=true;$('bCategorySearch').value='';$('bCustomCategory').value='';category.value='other';preset.value='other-spotlight';style.value='category';$('bVisual').value='photo';$('bEnhance').checked=false;$('bCtaChoice').value='';$('bCtaCustom').hidden=true;for(const id of ['bHook','bCaption','bPackageCta','bHashtags','bPhotoQuality','bStudioError'])$(id).textContent='';$('bPhotoQuality').hidden=true;$('bStudioError').hidden=true;}};
}

// Banner-specific help reuses the controller's overlay interface; shared Help Center is untouched.
export function mountStudioHelp({t,active,onTutorial}) {
  const $=id=>document.getElementById(id),dialog=$('ctxHelp'),button=$('helpBtn'),closeButton=$('ctxHelpClose');
  let faq=false,returnFocus=true;
  function render(){
    $('bHelpChoices').hidden=faq;$('bHelpFaq').hidden=!faq;
    $('ctxHelpTitle').textContent=t(faq?'helpFaqTitle':'wizardHelpTitle');
    button.setAttribute('aria-label',t('wizardHelpTitle'));
  }
  function refresh(){render();}
  function open(){if(!active()||dialog.open)return;faq=false;render();dialog.showModal();button.setAttribute('aria-expanded','true');$('ctxHelpTitle').focus();}
  function close(){if(!dialog.open)return false;dialog.close();return true;}
  button.setAttribute('aria-haspopup','dialog');button.setAttribute('aria-controls','ctxHelp');button.setAttribute('aria-expanded','false');button.addEventListener('click',open);closeButton.addEventListener('click',close);
  $('bOpenFaq').addEventListener('click',()=>{if(!active())return;faq=true;render();dialog.scrollTop=0;$('ctxHelpTitle').focus();});
  $('bHelpHome').addEventListener('click',()=>{faq=false;render();dialog.scrollTop=0;$('bOpenFaq').focus();});
  $('bStartTutorial').addEventListener('click',()=>{if(!active())return;returnFocus=false;close();onTutorial();});
  dialog.addEventListener('close',()=>{button.setAttribute('aria-expanded','false');if(returnFocus&&active())button.focus();returnFocus=true;faq=false;render();});
  dialog.addEventListener('keydown',e=>{if(e.key!=='Tab')return;const targets=[...dialog.querySelectorAll('button,a[href],summary')].filter(n=>n.getClientRects().length),first=targets[0],last=targets[targets.length-1];if(!targets.includes(document.activeElement)){e.preventDefault();(e.shiftKey?last:first).focus();}else if(e.shiftKey&&document.activeElement===first){e.preventDefault();last.focus();}else if(!e.shiftKey&&document.activeElement===last){e.preventDefault();first.focus();}});
  render();return {open,close,refresh};
}
