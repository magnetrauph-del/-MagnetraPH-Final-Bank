import { CATEGORIES, CATEGORY_BY_ID, LAYOUTS, LAYOUT_BY_ID, STYLES, resolvePreset, presetId } from './banner-catalog.js?v=2';
import { contentCheck, marketingPackage } from './banner-studio.js';
import { VISUAL_CATEGORIES, VISUAL_CATEGORY_BY_ID, VISUAL_BY_ID, VISUAL_BOX, drawVisual, resolveVisual } from './banner-visuals.js?v=1';

// Presentation and wizard state only. Auth, pixels and export remain owned by ui-banner.
export const STUDIO_BUILD='b22';
export function createStudio({t,getLang,onChange,active,getValues,getPhoto}) {
  const $=id=>document.getElementById(id);
  const category=$('bCategory'),preset=$('bPreset'),style=$('bDesignStyle');
  // Ang "tip" ay hiwalay sa "step": hindi inililipat ng tutorial ang pahina ng wizard.
  let quality=null,step=1,tip=1,lastCategory='other',tutorialActive=false,previewing=false;
  // Dalawang mode. Ang larawan ay nasa ui-banner at hindi kailanman binubura ng paglipat.
  let visualMode='photo',visualId='',visualCat='',thumbSign='';
  const scrolls=new Map();
  const option=(value,label)=>{const node=document.createElement('option');node.value=value;node.textContent=label;return node;};
  // Ang pangalan ng layout ay nasa i18n: split-left -> layoutSplitLeft, + "Detail".
  const camel=id=>id.replace(/-(.)/g,(_,ch)=>ch.toUpperCase());
  const layoutKey=id=>'layout'+camel(id).charAt(0).toUpperCase()+camel(id).slice(1);
  const layoutName=id=>t(layoutKey(id));
  const layoutDetail=id=>t(layoutKey(id)+'Detail');
  const currentCategory=()=>CATEGORY_BY_ID[category.value]||CATEGORY_BY_ID.other;
  const DEFAULT_LAYOUT=CATEGORY_BY_ID.other.layouts[0];
  function categories(){
    const selected=category.value;
    category.replaceChildren(option('',t('chooseCategory')),
      ...CATEGORIES.map(c=>option(c.id,t('cat'+c.id.charAt(0).toUpperCase()+c.id.slice(1)))));
    // Nananatili ang tunay na napili; kung wala, ang paanyaya ang nakikita.
    category.value=CATEGORY_BY_ID[selected]?selected:'';
  }
  // Isang listahan lamang ang mga layout. Minsan lang lumalabas ang bawat isa.
  // Ang tatlong inirerekomenda ang nauuna; nakatago ang limang iba hangga't
  // hindi pinipindot ang "Lahat ng layout".
  let layoutsOpen=false;
  // Mungkahing CTA kada uri ng negosyo. Mungkahi lamang ito: kapag gumalaw ang user
  // sa pili ng CTA - kahit Walang CTA ang piliin - hindi na ito muling papalitan.
  const CTA_BY_CATEGORY={
    ecommerce:'shop',fashion:'shop',luxury:'shop',electronics:'shop',grocery:'shop',
    arts:'shop',agriculture:'shop',
    food:'order',
    beauty:'book',fitness:'book',events:'book',travel:'book',property:'book',
    services:'book',automotive:'book',pets:'book',education:'book',
    home:'message',b2b:'message',
    digital:'learn',
  };
  const CTA_LABEL={shop:'Shop',order:'Order',message:'Contact',book:'Book',learn:'Learn'};
  let ctaTouched=false;
  function layoutCard(id,selected,withTag){
    const b=document.createElement('button');b.type='button';b.className='presetButton';
    b.dataset.preset=id;b.dataset.recommended=String(!!withTag);b.setAttribute('aria-pressed',String(id===selected));
    const diagram=document.createElement('span');diagram.className='presetDiagram '+id;diagram.setAttribute('aria-hidden','true');
    const text=document.createElement('span');text.className='presetName';text.textContent=layoutName(id);
    const detail=document.createElement('span');detail.className='presetDetail';detail.textContent=layoutDetail(id);
    const wrap=document.createElement('span');wrap.className='presetText';wrap.append(text,detail);
    if(withTag){const tag=document.createElement('span');tag.className='presetTag';tag.textContent=t('layoutRecommendedTag');wrap.append(tag);}
    b.append(diagram,wrap);
    b.addEventListener('click',()=>{if(!active())return;pickLayout(id);});
    return b;
  }
  // Ang napiling layout ay nasa data-layout ng listahan: iisang pinagmumulan para
  // sa card, sa renderer at sa validation. Nananatili ito kahit nakatago ang card.
  const layoutValue=()=>LAYOUT_BY_ID[preset.dataset.layout]?preset.dataset.layout:DEFAULT_LAYOUT;
  function pickLayout(id){
    preset.dataset.layout=id;
    layoutGrids();showError(null);onChange();
    preset.querySelector(`[data-preset="${id}"]`)?.focus();
  }
  // Ang pagbukas at pagsara ay isang attribute lamang: hindi muling itinatayo ang
  // walong card, kaya walang nawawalang focus at walang muling pagguhit ng diagram.
  // Nananatili ang focus sa pindutan, ang karaniwang gawi ng disclosure.
  function toggleLayouts(){
    if(!active())return;
    layoutsOpen=!layoutsOpen;
    syncLayoutToggle();
  }
  function syncLayoutToggle(){
    preset.dataset.open=String(layoutsOpen);
    const more=$('bMoreLayouts');
    more.setAttribute('aria-expanded',String(layoutsOpen));
    more.textContent=t(layoutsOpen?'wizardSeeLess':'wizardSeeAll');
  }
  function layoutGrids(){
    const selected=layoutValue(),c=currentCategory();
    const extra=LAYOUTS.map(l=>l.id).filter(id=>!c.layouts.includes(id));
    preset.replaceChildren(
      ...c.layouts.map(id=>layoutCard(id,selected,true)),
      ...extra.map(id=>{const b=layoutCard(id,selected,false);b.classList.add('extra');return b;}));
    syncLayoutToggle();
    lastCategory=c.id;
  }
  const recommended=layoutGrids;
  function allPresets(){
    if(!LAYOUT_BY_ID[preset.dataset.layout])preset.dataset.layout=currentCategory().layouts[0]||DEFAULT_LAYOUT;
    layoutGrids();
  }
  // Ang pangalan ng design style ay isinasalin din, hindi naka-English lamang.
  function styleOptions(){
    style.replaceChildren(...STYLES.map(st=>option(st.id,t('style'+st.id.charAt(0).toUpperCase()+st.id.slice(1)))));
  }
  function read(){return {category:category.value||'other',preset:presetId(category.value||'other',layoutValue()),designStyle:style.value||'category',serviceVisual:(visualMode==='photo'&&getPhoto())?'photo':(visualId||'photo'),enhance:$('bEnhance').checked};}
  // Ang isang step ay "complete" lamang kapag may tunay na nailagay ang user DOON at
  // pumapasa ito sa mismong pagsusuring ginagamit ng Generate. Ang default na halaga ay
  // hindi tagumpay: kaya walang step na magmumukhang tapos nang wala pang ginawa.
  function stepFilled(at,photo,v){
    if(at===1)return v.serviceVisual==='photo'?!!photo:!!resolveVisual(v.serviceVisual);
    if(at===2)return !!v.product&&!!v.headline;
    if(at===3)return v.category!=='other'||v.preset!==presetId('other',DEFAULT_LAYOUT);
    return !!v.cta;
  }
  let progressSign='';
  function progress(values){
    $('bStepStatus').textContent=t('wizardStepCount',step);
    const v=values||getValues(),photo=getPhoto();
    const states=[1,2,3,4].map(at=>stepFilled(at,photo,v)&&!stepProblem(at,photo,v));
    const sign=step+'|'+states.join('')+'|'+getLang();
    if(sign===progressSign)return;
    progressSign=sign;
    for(const n of document.querySelectorAll('[data-progress]')){
      const at=Number(n.dataset.progress),done=states[at-1];
      if(at===step)n.setAttribute('aria-current','step');else n.removeAttribute('aria-current');
      n.dataset.state=done?'complete':'incomplete';
      n.setAttribute('aria-label',t('wizardStepGo',at,t(n.dataset.stepName))+' — '+t(done?'wizardStepDone':'wizardStepTodo'));
    }
  }
  function goStep(next,{focus=true,restore=false}={}){
    if(!active())return;
    scrolls.set(step,window.scrollY);step=Math.max(1,Math.min(4,Number(next)||1));
    tip=step; // sinusundan ng gabay ang pahina; hindi ang kabaligtaran
    for(const panel of document.querySelectorAll('[data-wizard-step]'))panel.hidden=Number(panel.dataset.wizardStep)!==step;
    if(step===4)suggestCta();
    $('bPrevious').hidden=step===1;$('bContinue').hidden=step===4;$('bGenerate').hidden=step!==4;progress();renderTutorial();
    if(focus)$('s'+step+'h').focus({preventScroll:true});
    window.scrollTo({top:restore?(scrolls.get(step)||0):0,behavior:'instant'});
  }
  // Malayang paglilibot sa apat na step, kahit hindi pa kumpleto. Walang binubura;
  // ang Generate Preview at Download ang humahadlang sa hindi kumpletong banner.
  function jumpStep(target){
    if(!active()||target===step)return;
    showError(null);
    goStep(target,{restore:target<step});
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
  // Dalisay na pagsusuri: wala itong binabagong UI. Iisang pinagmumulan ng katotohanan
  // para sa Generate, sa Download at sa katayuang ipinapakita ng step indicator.
  function stepProblem(at,photo,values){
    const v=values||getValues();
    // Wala pang pinagmumulan: ituturo ang picker ng disenyo, na siyang pinakamalapit na aksyon.
    if(at===1&&(v.serviceVisual==='photo'?!photo:!resolveVisual(v.serviceVisual)))
      return{key:'pickVisual',field:'bVisualCategory'};
    if(at===2&&!v.product)return{key:'productRequired',field:'bProduct'};
    if(at===2&&!v.headline)return{key:'headlineErr',field:'bHeadline'};
    if(at===3&&!resolvePreset(v.preset))return{key:'needsPreset',field:'bPreset'};
    if(contentCheck(at===2?{product:v.product,headline:v.headline,price:v.price}:at===4?v:{}).blocked)return contentProblem(v);
    return null;
  }
  // Ipinagbabawal na nilalaman lamang. Hindi ito tumitingin kung kumpleto ang mga field,
  // kaya nagagamit ito ng Continue nang hindi hinaharangan ang paglilibot.
  function contentProblem(values){
    const v=values||getValues();
    const problem=contentCheck(v);
    if(!problem.blocked)return null;
    const key=Object.keys(v).find(k=>typeof v[k]==='string'&&contentCheck({text:v[k]}).blocked);
    const field=key?'b'+key[0].toUpperCase()+key.slice(1):'bHeadline';
    return{key:problem.reason,field:document.getElementById(field)?field:'bHeadline'};
  }
  function validateStep(at,photo){
    const problem=stepProblem(at,photo);
    return problem?showError(problem.key,problem.field):showError(null);
  }
  function validate(v,photo){for(const n of [1,2,3,4]){const error=validateStep(n,photo);if(error)return error;}return null;}
  // Katulad ng validate pero wala itong ginagalaw sa UI, kaya magagamit ito ng Download
  // bago isara ang preview: habang bukas ang dialog, inert ang mga field sa labas nito.
  function firstProblem(photo,values){
    const v=values||getValues();
    for(const n of [1,2,3,4]){const problem=stepProblem(n,photo,v);if(problem)return problem;}
    return null;
  }
  function refresh(v){
    const copy=marketingPackage(v,getLang()),blocked=contentCheck(v).blocked;
    for(const [id,key] of [['bHook','hook'],['bCaption','caption'],['bPackageCta','cta'],['bHashtags','hashtags']])if($(id).textContent!==(blocked?'':copy[key]))$(id).textContent=blocked?'':copy[key];
    $('bPackage').hidden=blocked||!v.headline;$('bPackageEmpty').hidden=!!v.headline&&!blocked;
    $('bPhotoQuality').className=quality?.warnings.length?'studioNotice':'hint';
    $('bPhotoQuality').textContent=quality?(quality.warnings.length?[...quality.warnings.map(t),t('qualityReview')]:[t('qualityReady')]).join(' '):'';$('bPhotoQuality').hidden=!quality;
    $('bFormatSize').textContent=v.format==='story'?'1080 × 1920':v.format==='portrait'?'1080 × 1350':'1080 × 1080';
    progress(v); // sumasabay ang katayuan ng step sa tunay na nilalaman
    syncVisual(); // sumasabay ang mga thumbnail sa tema at wika
  }
  function refreshLanguage(){const old=style.value;categories();allPresets();styleOptions();style.value=STYLES.some(s=>s.id===old)?old:'category';progress();renderTutorial();}
  async function copyPackage(){
    if(!active())return null;const v=getValues();if(contentCheck(v).blocked){showError('copyBlocked');return 'copyBlocked';}
    if(!v.headline){showError('headlineErr','bHeadline');return 'headlineErr';}
    const p=marketingPackage(v,getLang());
    try{await navigator.clipboard.writeText([p.hook,p.caption,p.cta,p.hashtags].filter(Boolean).join('\n\n'));return active()?'copied':null;}catch{return active()?'copyFail':null;}
  }
  // Isang pinagmumulan lang ng larawan: kapag may na-upload na photo, iyon ang ginagamit sa banner.
  // ---------- Service Visual Library ----------
  function thumbColors(){
    const cs=getComputedStyle(document.documentElement);
    return {ink:cs.getPropertyValue('--ink').trim()||'#1E1B4B',
            accent:cs.getPropertyValue('--studio-focus').trim()||'#4F46E5'};
  }
  function thumb(id){
    const cv=document.createElement('canvas');cv.width=cv.height=132;
    const c=cv.getContext('2d');
    if(c){c.scale(132/VISUAL_BOX,132/VISUAL_BOX);drawVisual(c,id,thumbColors());}
    cv.setAttribute('aria-hidden','true');
    return cv;
  }
  function visualButton(v){
    const b=document.createElement('button');
    b.type='button';b.className='visualBtn';b.dataset.visual=v.id;
    b.setAttribute('aria-pressed',String(visualId===v.id&&!(visualMode==='photo'&&getPhoto())));
    const cat=VISUAL_CATEGORY_BY_ID[v.category];
    b.setAttribute('aria-label',`${cat.label} \u2014 ${t('fam'+v.family[0].toUpperCase()+v.family.slice(1))}`);
    b.append(thumb(v.id));
    const name=document.createElement('span');
    name.textContent=t('fam'+v.family[0].toUpperCase()+v.family.slice(1));
    b.append(name);
    b.addEventListener('click',()=>{if(!active())return;pickVisual(v.id);});
    return b;
  }
  // Ang muling pagpindot sa napiling visual ay nag-aalis ng pagkakapili: iyon ang paraan
  // para bawiin ang desisyon nang hindi kailangang mag-upload ng larawan.
  function pickVisual(id){
    const undo=visualId===id&&visualMode==='library';
    visualId=undo?'':id;visualMode=undo?'photo':'library';thumbSign='';
    syncVisual();showError(null);onChange();
  }
  function visualCategories(){
    const select=$('bVisualCategory');
    select.replaceChildren(option('',t('chooseCategory')),
      ...VISUAL_CATEGORIES.map(c=>option(c.id,c.label)));
    select.value=VISUAL_CATEGORY_BY_ID[visualCat]?visualCat:'';
  }
  function visualPicks(){
    // Habang walang pinipili, neutral na pangkat ang ipinapakita - hindi ito pagpili.
    const cat=VISUAL_CATEGORY_BY_ID[visualCat]||VISUAL_CATEGORY_BY_ID.other||VISUAL_CATEGORIES[0];
    $('bVisualPicks').replaceChildren(...cat.visuals.map(visualButton));
  }
  // Walang switch: ang huling kilos ang nagtatakda kung alin ang aktibo. Ang na-upload na
  // larawan at ang napiling visual ay parehong nananatili sa state.
  function syncVisual(){
    const photoMode=visualMode==='photo'&&!!getPhoto();
    $('bUploadArea').dataset.active=String(photoMode);
    const sign=visualCat+'|'+visualId+'|'+(photoMode?'p':'l')+'|'+getLang()+'|'+thumbColors().accent;
    if(sign===thumbSign)return;
    thumbSign=sign;
    visualCategories();visualPicks();
  }
  const REDUCED=window.matchMedia('(prefers-reduced-motion: reduce)');
  const ANIM_MS=200;
  let hideTimer=0;
  // Ang paglitaw at pagkawala ay hinahayaang hawakan ng scroll anchoring ng browser.
  // Sinukat ko ito: ang manual na pag-scroll ay nagbigay ng eksaktong parehong resulta,
  // kaya wala itong idinagdag kundi panganib ng dobleng kompensasyon.
  // Fade-and-collapse: unti-unting kumukupas AT umuurong ang taas, kaya walang biglaang
  // pagbagsak ng layout na siyang nagpapatalon ng pahina. Ang max-height ay sinusukat muna
  // para pantay ang bilis anuman ang haba ng teksto.
  function setTutorialVisible(on){
    const panel=$('bTutorial');
    clearTimeout(hideTimer);
    const clean=()=>{panel.removeAttribute('data-anim');panel.style.maxHeight='';};
    if(on){
      if(!panel.hidden&&panel.dataset.anim!=='out')return;
      panel.hidden=false;clean();
      if(REDUCED.matches)return;
      const full=panel.scrollHeight;
      panel.dataset.anim='out';panel.style.maxHeight='0px';
      void panel.offsetHeight;                       // pinipilit ang reflow bago ang galaw
      panel.removeAttribute('data-anim');panel.style.maxHeight=full+'px';
      hideTimer=setTimeout(()=>{panel.style.maxHeight='';},ANIM_MS);
      return;
    }
    if(panel.hidden)return;
    const done=()=>{panel.hidden=true;clean();};
    if(REDUCED.matches){done();return;}
    panel.style.maxHeight=panel.scrollHeight+'px';
    void panel.offsetHeight;
    panel.dataset.anim='out';panel.style.maxHeight='0px';
    hideTimer=setTimeout(done,ANIM_MS);
  }
  function renderTutorial(){
    setTutorialVisible(tutorialActive);
    if(!tutorialActive)return;
    const index=previewing?5:tip;
    $('bTutorialCount').textContent=t('tutorialCount',index);
    $('bTutorialTipTitle').textContent=t('tipTitle'+index);
    $('bTutorialText').textContent=t(['','tutorialProduct','tutorialMessage','tutorialDesign','tutorialOffer','tutorialPreview'][index]);
    $('bTutorialBack').hidden=index===1;$('bTutorialNext').hidden=index===5;$('bTutorialFinish').hidden=index!==5;$('bTutorialSkip').hidden=index===5;
  }
  // Kapag ang gabay ay nasa ibang step kaysa sa nakabukas na pahina, nananatili ang focus sa tutorial.
  // Lahat ng focus dito ay preventScroll. Ang #bContinue at #bGenerate ay nasa ilalim ng
  // form; ang karaniwang .focus() ay kusang nagsa-scroll pababa papunta sa kanila, at iyon
  // ang dahilan kung bakit tumatalon ang pahina sa pagpindot ng Skip.
  // Hindi na nagla-lagay ng focus sa text field ang gabay. Sa Android, ang focus sa input
  // sa loob ng isang tap ay nagbubukas ng on-screen keyboard: umuurong ang viewport at
  // nagsa-scroll ang pahina papunta sa input. Pagpindot ng Skip, nagsasara ang keyboard at
  // tumatalon muli ang pahina. Hindi ito nakikita ng desktop na test. Ang sariling button
  // ng gabay ang tumatanggap ng focus - nananatiling sarado ang keyboard.
  function focusTutorialControl(){
    if(!active())return;
    if(previewing){$('bSave').focus({preventScroll:true});return;}
    ($('bTutorialNext').hidden?$('bTutorialFinish'):$('bTutorialNext')).focus({preventScroll:true});
  }
  function stopTutorial({focus=true}={}){
    tutorialActive=false;renderTutorial();
    if(focus&&active())(previewing?$('bSave'):step===4?$('bGenerate'):$('bContinue')).focus({preventScroll:true});
  }
  function startTutorial(){if(!active())return;previewing=false;tutorialActive=true;tip=step;renderTutorial();focusTutorialControl();}
  function previewOpened(){previewing=true;$('bPreviewGuidance').append($('bTutorial'));renderTutorial();}
  function previewClosed(){previewing=false;tip=step;$('bStudioError').before($('bTutorial'));renderTutorial();}
  $('bTutorialSkip').addEventListener('click',()=>stopTutorial());
  $('bTutorialFinish').addEventListener('click',()=>stopTutorial());
  // Ang Back/Next ng tutorial ay gumagalaw lamang sa gabay. Hindi nito binubuksan ang ibang step,
  // hindi nagpapatakbo ng Generate at hindi nagbubura ng anumang nailagay na.
  $('bTutorialBack').addEventListener('click',()=>{if(!active())return;if(previewing){$('inspectClose').click();return;}tip=Math.max(1,tip-1);renderTutorial();focusTutorialControl();});
  $('bTutorialNext').addEventListener('click',()=>{if(!active()||previewing)return;tip=Math.min(5,tip+1);renderTutorial();focusTutorialControl();});
  for(const dot of document.querySelectorAll('.stepDot'))dot.addEventListener('click',()=>jumpStep(Number(dot.dataset.progress)));
  categories();allPresets();styleOptions();goStep(1,{focus:false});syncVisual();
  // Ang Continue ay gumagalaw nang kapareho ng step indicator: hindi ito hinaharangan ng
  // hindi pa kumpletong field. Nananatili ang hadlang sa ipinagbabawal na nilalaman.
  $('bContinue').addEventListener('click',()=>{
    if(!active())return;
    const problem=contentProblem();
    if(problem){showError(problem.key,problem.field);return;}
    showError(null);goStep(step+1);
  });
  $('bPrevious').addEventListener('click',()=>{if(active()){showError(null);goStep(step-1,{restore:true});}});
  $('bVisualCategory').addEventListener('change',()=>{
    if(!active())return;
    visualCat=$('bVisualCategory').value;thumbSign='';
    const chosen=VISUAL_BY_ID[resolveVisual(visualId)];
    if(chosen&&visualCat&&!(visualMode==='photo'&&getPhoto())){
      // Dala ang parehong disenyo papunta sa bagong uri ng negosyo.
      visualId=`${visualCat}-${chosen.family}`;showError(null);onChange();
    }
    syncVisual();
  });
  // Ang kategorya ay nagtatakda ng palette at ng tatlong rekomendasyon; hindi nito
  // binubura ang layout kung kasama pa rin ito sa bagong tatlo.
  // Isinasara ng Escape ang bukas na field help at ibinabalik ang focus sa (?).
  document.addEventListener('keydown',e=>{
    if(e.key!=='Escape')return;
    const open=document.querySelector('.fieldHelp[open]');
    if(!open)return;
    e.stopPropagation();open.open=false;open.querySelector('summary')?.focus();
  },true);
  $('bMoreLayouts').addEventListener('click',toggleLayouts);
  category.addEventListener('change',()=>{if(!active())return;
    const c=currentCategory();if(!c.layouts.includes(layoutValue()))preset.dataset.layout=c.layouts[0];
    layoutGrids();suggestCta();showError(null);onChange();});
  for(const node of [style,$('bEnhance')])node.addEventListener('change',()=>{if(active()){showError(null);onChange();}});
  for(const color of document.querySelectorAll('input[name="bTheme"]'))color.addEventListener('change',()=>{if(active()){style.value='brand';showError(null);onChange();}});
  // May tatak kung sino ang sumulat ng teksto ng CTA. Ang isinulat ng app ay
  // nililinis kapag lumipat sa Custom; ang isinulat ng user ay hindi ginagalaw.
  let ctaTextIsPreset=true;
  function applyCta(choice,{focus=false}={}){
    $('bCtaChoice').value=choice;
    $('bCtaCustom').hidden=choice!=='custom';
    if(choice!=='custom'){$('bCta').value=choice?t('wizard'+CTA_LABEL[choice]):'';ctaTextIsPreset=true;}
    else{
      if(ctaTextIsPreset)$('bCta').value='';
      ctaTextIsPreset=false;
      if(focus)$('bCta').focus();
    }
  }
  // Tumatakbo lang kapag hindi pa humipo ang user sa CTA.
  function suggestCta(){
    if(ctaTouched)return;
    const want=CTA_BY_CATEGORY[category.value]||'';
    if(!want||$('bCtaChoice').value===want)return;
    applyCta(want);onChange();
  }
  $('bCtaChoice').addEventListener('change',()=>{if(!active())return;
    ctaTouched=true;applyCta($('bCtaChoice').value,{focus:true});showError(null);onChange();});
  return {read,refresh,refreshLanguage,validate,validateStep,firstProblem,showError,copyPackage,goStep,startTutorial,stopTutorial,previewOpened,previewClosed,getStep:()=>step,reveal,usePhoto(){ visualMode='photo';thumbSign='';syncVisual(); },syncVisual,setQuality(q){quality=q;},clear(){stopTutorial({focus:false});previewing=false;previewClosed();quality=null;tip=1;scrolls.clear();category.value='';preset.dataset.layout=DEFAULT_LAYOUT;style.value='category';visualMode='photo';visualId='';visualCat='';thumbSign='';syncVisual();$('bEnhance').checked=false;ctaTouched=false;ctaTextIsPreset=true;$('bCtaChoice').value='';$('bCtaCustom').hidden=true;$('bCta').value='';for(const id of ['bHook','bCaption','bPackageCta','bHashtags','bPhotoQuality','bStudioError'])$(id).textContent='';$('bPhotoQuality').hidden=true;$('bStudioError').hidden=true;}};
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
