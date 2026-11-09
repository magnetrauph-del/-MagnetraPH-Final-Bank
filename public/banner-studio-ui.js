import { CATEGORIES, CATEGORY_BY_ID, LAYOUTS, LAYOUT_BY_ID, STYLES, resolvePreset, presetId } from './banner-catalog.js?v=2';
import { contentCheck, marketingPackage } from './banner-studio.js';
import { VISUAL_CATEGORIES, VISUAL_CATEGORY_BY_ID, VISUAL_BY_ID, VISUAL_BOX, drawVisual, resolveVisual } from './banner-visuals.js?v=1';
import { readBusinessCategory, saveBusinessCategory } from './local-state.js?v=3';

// Apat na uri ng ina-advertise. Ang pangalan ay English sa tatlong wika nang sinadya:
// label ng kategorya ang mga ito, gaya ng walong layout. Isinasalin ang paliwanag.
// Para sa Phase 2A ay estado at kontrata lang ito - wala pang tuntunin ng pagsusuri
// na nakabatay dito, at iyon ang susunod na yugto.
// Ang larawan ay ibinigay at inaprubahan ng owner (b31). Lokal lahat - walang panlabas
// na host - at 320x320 WebP para sa 60px na bilog kahit sa pinakamatalas na cellphone.
export const AD_TYPES=Object.freeze([
 Object.freeze({id:'physical',name:'adPhysical',desc:'adPhysicalDesc',photo:'setup-ad-physical.webp?v=1'}),
 Object.freeze({id:'digital', name:'adDigital', desc:'adDigitalDesc', photo:'setup-ad-digital.webp?v=1'}),
 Object.freeze({id:'service', name:'adService', desc:'adServiceDesc', photo:'setup-ad-service.webp?v=1'}),
 Object.freeze({id:'promo',   name:'adPromo',   desc:'adPromoDesc',   photo:'setup-ad-promo.webp?v=1'}),
]);
export const AD_TYPE_BY_ID=Object.freeze(Object.fromEntries(AD_TYPES.map(a=>[a.id,a])));

// Dalawang magkaibang katalogo: 21 business category (palette at rekomendasyon) at 22
// visual category (kung aling tatlong service visual ang ipapakita). Hindi sila
// pinagsasama; ito ang tulay para makapagmungkahi ang Setup ng tamang set ng disenyo.
// Ang hindi nabanggit dito - construction, transport, finance, community, abstract - ay
// naaabot pa rin sa kontrol ng Step 1, kaya walang nawawalang pagpipilian.
export const VISUAL_FOR_CATEGORY=Object.freeze({
 ecommerce:'retail', food:'food', beauty:'beauty', fashion:'retail',
 luxury:'retail', electronics:'technology', home:'home', services:'professional',
 property:'realestate', fitness:'health', education:'education', travel:'travel',
 automotive:'automotive', agriculture:'agriculture', pets:'pets', events:'events',
 grocery:'retail', b2b:'professional', digital:'technology', arts:'creative', other:'other',
});

// Presentation and wizard state only. Auth, pixels and export remain owned by ui-banner.
export const STUDIO_BUILD='b31';
export function createStudio({t,getLang,onChange,active,getValues,getPhoto,onBaseline}) {
  const $=id=>document.getElementById(id);
  const category=$('bCategory'),preset=$('bPreset'),style=$('bDesignStyle');
  // Ang "tip" ay hiwalay sa "step": hindi inililipat ng tutorial ang pahina ng wizard.
  let quality=null,step=1,tip=1,lastCategory='other',tutorialActive=false,previewing=false;
  // Dalawang mode. Ang larawan ay nasa ui-banner at hindi kailanman binubura ng paglipat.
  let visualMode='photo',visualId='',visualCat='',thumbSign='';
  // Quick Business Setup. Ang kategorya ay naiimbak at ginagamit muli; ang uri ng
  // ina-advertise ay HINDI naiimbak - tinatanong ito sa bawat bagong banner.
  let adType='',setupOpen=true,catFromStore=false;
  const main=()=>document.getElementById('main');
  const setupCategory=()=>$('bSetupCategory');
  const scrolls=new Map();
  const option=(value,label)=>{const node=document.createElement('option');node.value=value;node.textContent=label;return node;};
  // Ang paanyaya ay panuto, hindi pagpipilian. Tatlong attribute ang kailangan nito:
  //   selected - ito ang nakikita sa nakasarang field habang walang pinili
  //   disabled - hindi ito kayang piliin, kahit lumabas pa ito sa listahan
  //   hidden   - inaalis ito sa bukas na listahan sa Blink at Gecko
  // Ang 'hidden' ay hindi pare-pareho sa lahat ng Android browser, kaya ang 'disabled'
  // ang sumasalo: sa pinakamalalang kaso ay nakikita ito pero hindi mapipili.
  // Ang pagtatakda ng select.value='' sa code ay gumagana pa rin, kaya buo ang reset.
  const promptOption=label=>{const node=option('',label);node.disabled=true;node.hidden=true;node.selected=true;return node;};
  // Ang pangalan ng layout ay nasa i18n: split-left -> layoutSplitLeft, + "Detail".
  const camel=id=>id.replace(/-(.)/g,(_,ch)=>ch.toUpperCase());
  const layoutKey=id=>'layout'+camel(id).charAt(0).toUpperCase()+camel(id).slice(1);
  const layoutName=id=>t(layoutKey(id));
  const layoutDetail=id=>t(layoutKey(id)+'Detail');
  const currentCategory=()=>CATEGORY_BY_ID[category.value]||CATEGORY_BY_ID.other;
  const DEFAULT_LAYOUT=CATEGORY_BY_ID.other.layouts[0];
  function categories(){
    const selected=category.value;
    category.replaceChildren(promptOption(t('chooseCategory')),
      ...CATEGORIES.map(c=>option(c.id,t('cat'+c.id.charAt(0).toUpperCase()+c.id.slice(1)))));
    // Nananatili ang tunay na napili; kung wala, ang paanyaya ang nakikita.
    category.value=CATEGORY_BY_ID[selected]?selected:'';
  }
  // Isang listahan lamang ang mga layout. Minsan lang lumalabas ang bawat isa.
  // Ang tatlong inirerekomenda ang nauuna; nakatago ang limang iba hangga't
  // hindi pinipindot ang "Lahat ng layout".
  let layoutsOpen=false;
  const stillPreferred=()=>matchMedia('(prefers-reduced-motion: reduce)').matches;
  // Isang maikling marka lang: ang CSS ang gumagawa ng galaw, at wala itong
  // ginagawa kapag ayaw ng gumagamit ng animasyon.
  function enterPanel(panel){
    delete panel.dataset.entering;
    if(stillPreferred())return;
    void panel.offsetWidth;
    panel.dataset.entering='true';
    panel.addEventListener('animationend',()=>{delete panel.dataset.entering;},{once:true});
  }
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
    style.replaceChildren(promptOption(t('chooseStyle')),
      ...STYLES.map(st=>option(st.id,t('style'+st.id.charAt(0).toUpperCase()+st.id.slice(1)))));
  }

  /* ---------- Quick Business Setup ---------- */
  const catLabel=id=>t('cat'+id.charAt(0).toUpperCase()+id.slice(1));
  // Parehong 21 na kategorya ng Step 3, at parehong naka-lock na paanyaya.
  function setupCategories(){
    const chosen=setupCategory().value;
    setupCategory().replaceChildren(promptOption(t('chooseCategory')),
      ...CATEGORIES.map(c=>option(c.id,catLabel(c.id))));
    setupCategory().value=CATEGORY_BY_ID[chosen]?chosen:'';
  }
  function setupCard(a){
    const b=document.createElement('button');
    b.type='button';b.className='setupCard';b.dataset.adType=a.id;
    b.setAttribute('role','radio');
    b.setAttribute('aria-checked',String(adType===a.id));
    // Pang-ilustrasyon lang ang larawan: alt="" at aria-hidden, kaya ang pangalan at
    // paliwanag pa rin ang binabasa ng screen reader - hindi nadadagdagan ng ingay.
    const photo=document.createElement('span');
    photo.className='setupCardPhoto';photo.setAttribute('aria-hidden','true');
    const img=document.createElement('img');
    img.src=a.photo;img.alt='';img.width=60;img.height=60;img.decoding='async';img.draggable=false;
    // Kapag hindi nakarating ang larawan, inaalis ang buong puwesto nito: bumabalik ang
    // card sa malinis na teksto-at-tanda, walang sirang icon at walang blangkong bilog.
    img.addEventListener('error',()=>{photo.remove();b.dataset.photo='off';},{once:true});
    photo.append(img);
    const text=document.createElement('span');
    text.className='setupCardText';
    const name=document.createElement('span');
    name.className='setupCardName';name.textContent=t(a.name);
    const desc=document.createElement('p');
    desc.className='setupCardDesc';desc.textContent=t(a.desc);
    text.append(name,desc);
    // Ang tanda ay walang laman hangga't walang pinili, kaya pagpili ang sinasabi nito.
    const mark=document.createElement('span');
    mark.className='setupCardMark';mark.setAttribute('aria-hidden','true');
    const svg=document.createElementNS('http://www.w3.org/2000/svg','svg');
    svg.setAttribute('width','14');svg.setAttribute('height','14');
    const use=document.createElementNS('http://www.w3.org/2000/svg','use');
    use.setAttribute('href','#i-check');
    svg.append(use);mark.append(svg);
    b.append(photo,text,mark);
    return b;
  }
  function setupCards(){
    $('bSetupTypes').replaceChildren(...AD_TYPES.map(setupCard));
  }
  // Ang naka-save na kategorya ay hindi na itinatanong: sinasabi na lang, at may
  // paraang palitan. Kapag walang naka-save, ang tanong ang lumalabas.
  function setupSavedView(){
    const saved=setupCategory().value;
    const reuse=catFromStore&&!!CATEGORY_BY_ID[saved];
    $('bSetupCatField').hidden=reuse;
    $('bSetupSaved').hidden=!reuse;
    if(reuse)$('bSetupSavedName').textContent=catLabel(saved);
  }
  function setupRefresh(){setupCategories();setupCards();setupSavedView();}
  function setupPhase(open){
    setupOpen=!!open;
    main()?.setAttribute('data-phase',setupOpen?'setup':'wizard');
  }
  function openSetup({focus=true}={}){
    // Ginagamit muli ang naka-save na kategorya kung kasapi pa rin ito sa katalogo.
    // Ang hindi na kilalang id ay itinatapon nang tahimik - hindi ito pinipilit.
    // Buuin MUNA ang listahan: ang pagtatakda ng .value na walang katugmang option ay
    // tahimik na nagiging blangko, at doon nawawala ang naka-save na kategorya.
    setupCategories();
    const stored=readBusinessCategory();
    if(stored&&CATEGORY_BY_ID[stored]){setupCategory().value=stored;catFromStore=true;}
    else catFromStore=false;
    setupPhase(true);showError(null);setupRefresh();
    $('bSetupDone').hidden=true;setupBusy=false;setupGoBusy(false);
    if(focus)($('bSetupCatField').hidden?$('bSetupChange'):setupCategory())?.focus();
  }
  // Pumapasa lang kapag pareho: balidong kategorya AT tahasang uri. Ang paanyaya ay
  // hindi pagpili - iyon ang tinitingnan ng CATEGORY_BY_ID.
  function setupProblem(){
    if(!CATEGORY_BY_ID[setupCategory().value])return{key:'setupNeedCategory',field:'bSetupCategory'};
    if(!AD_TYPE_BY_ID[adType])return{key:'setupNeedAdType',field:null};
    return null;
  }
  // Ibinibigay ang dalawang sagot sa umiiral na wizard. Ang kategorya ng Step 3 ay
  // pinupunan pero NANANATILING OPSYONAL (Option A). Ang set ng disenyo sa Step 1 ay
  // itinuturo sa tugmang visual category - ipinapakita ang tatlong mungkahi nito, pero
  // WALANG pinipili para sa tao: nananatiling kailangan niyang pumili.
  // Ang pag-save ay nasa finishSetup, kung saan tinitingnan ang tunay na resulta nito.
  // Dito ay paghahatid lang sa wizard - isang pagsusulat lamang kada setup.
  function handOff(){
    const chosen=setupCategory().value;
    if(!category.value)category.value=chosen;
    const vc=VISUAL_FOR_CATEGORY[chosen];
    if(vc&&VISUAL_CATEGORY_BY_ID[vc]&&!visualCat){visualCat=vc;thumbSign='';}
    categories();layoutGrids();syncVisual();
  }
  // Isang trabaho lamang: naitatakda ang bantay bago ang anumang gawain, kaya walang
  // dobleng pagpindot na makakasingit.
  let setupBusy=false;
  function setupGoBusy(on){
    const go=$('bSetupContinue');
    if(on){go.setAttribute('aria-busy','true');go.setAttribute('aria-disabled','true');}
    else{go.removeAttribute('aria-busy');go.removeAttribute('aria-disabled');}
  }
  // Pagkatapos ng maikling kumpirmasyon ay ang paglipat. Ang tagal ay ang mismong 170ms
  // na fade - walang idinagdag na paghihintay, at walang fade kapag reduced motion.
  function enterWizard(){
    $('bSetupDone').hidden=true;
    setupPhase(false);goStep(1,{focus:true});onChange();onBaseline?.();
    setupBusy=false;setupGoBusy(false);
  }
  function finishSetup(){
    if(setupBusy)return false;
    const problem=setupProblem();
    if(problem){showError(problem.key,problem.field);return false;}
    setupBusy=true;setupGoBusy(true);
    // Hindi ipinapakita ang tagumpay hangga't hindi tiningnan ang tunay na resulta ng
    // pag-save. Kapag hindi tumatago ng lokal na datos ang browser, sinasabi ito at
    // nagpapatuloy pa rin - session-only, hindi inaangking naka-save.
    const saved=saveBusinessCategory(setupCategory().value);
    handOff();
    if(!saved.ok){showError('setupSaveFailed',null);enterWizard();return true;}
    showError(null);
    const note=$('bSetupDone');note.hidden=false;
    if(stillPreferred()){enterWizard();return true;}
    let done=false;
    const once=()=>{if(done)return;done=true;enterWizard();};
    note.addEventListener('animationend',once,{once:true});
    setTimeout(once,260);
    return true;
  }
  // Kasama na ang piniling CTA, hindi lang ang teksto nito: pareho kasing walang teksto
  // ang paanyaya at ang "Walang CTA", kaya ang halaga lang ang makakapagkilala sa dalawa.
  // Dalawang bagay ang kailangan sa kategorya, at hindi puwedeng isa lang:
  //   category       - ang ginagamit ng renderer, na bumabagsak sa 'other' kapag walang pinili
  //   categoryChosen - ang hilaw na pinili ng tao, blangko kapag paanyaya pa
  // Dati ay 'category' lang ang mayroon, at dahil 'other' ay TUNAY na id sa katalogo,
  // hindi na mapagkaiba ng pagsusuri ang "walang pinili" sa "pinili ang Other". Iyon ang
  // nagpaberde sa Step 3 nang walang kategorya, at nagpahindi-berde sa tunay na Other.
  function read(){return {category:category.value||'other',categoryChosen:category.value,preset:presetId(category.value||'other',layoutValue()),designStyle:style.value||'category',serviceVisual:(visualMode==='photo'&&getPhoto())?'photo':(visualId||'photo'),ctaChoice:$('bCtaChoice').value,adType,enhance:$('bEnhance').checked};}
  // Apat na estado, at isa lang ang pinagmumulan ng katotohanan: ang stepProblem, na siya
  // ring ginagamit ng Generate at ng Download. Walang hiwalay na lohika para sa indicator.
  //   complete - walang problema sa step
  //   invalid  - may problema AT nasubukan nang i-validate (Generate o Download)
  //   pending  - may problema pero wala pang pagsusuring naganap
  // Hiwalay na aspeto ang "active" (aria-current), kaya kapwa nananatiling nakikita ang
  // kasalukuyang step at ang pagkakamali nito.
  const attempted=new Set();
  function markAttempted(){for(const n of [1,2,3,4])attempted.add(n);}
  function clearAttempts(){attempted.clear();}
  // May tunay na nailagay ba ang user DITO? Hiwalay ito sa pagsusuri, at kailangan dahil
  // may step na pumapasa sa gate gamit lang ang default na halaga: pumapasa ang Step 3 sa
  // default na layout, pero hindi tagumpay ang default - kaya hindi ito berde hangga't
  // walang pinili. Berde lang ang step kapag pumasa ito AT may ginawa nga ang user.
  function stepEngaged(at,photo,v){
    if(at===1)return v.serviceVisual==='photo'?!!photo:!!resolveVisual(v.serviceVisual);
    if(at===2)return !!v.product&&!!v.headline;
    // Kasapi sa katalogo ang batayan, hindi ang teksto at hindi ang pagkakaroon ng halaga:
    // kaya hindi kayang pumasa ng paanyaya kahit anong layout ang napili, at pumapasa ang
    // tunay na pagpili ng Other. Ang layout ay may balidong default (b21), kaya hindi ito
    // bahagi ng pagsukat kung may ginawa nga ang tao sa step na ito.
    if(at===3)return !!CATEGORY_BY_ID[v.categoryChosen];
    return !!v.ctaChoice; // ang tahasang "Walang CTA" ay pagpili rin, at dating hindi nabibilang
  }
  function stepState(at,photo,v){
    if(stepProblem(at,photo,v))return attempted.has(at)?'invalid':'pending';
    return stepEngaged(at,photo,v)?'complete':'pending';
  }
  let progressSign='';
  function progress(values){
    $('bStepStatus').textContent=t('wizardStepCount',step);
    const v=values||getValues(),photo=getPhoto();
    const states=[1,2,3,4].map(at=>stepState(at,photo,v));
    const sign=step+'|'+states.join(',')+'|'+getLang();
    if(sign===progressSign)return;
    progressSign=sign;
    const WORD={complete:'wizardStepDone',invalid:'wizardStepInvalid',pending:'wizardStepPending'};
    for(const n of document.querySelectorAll('[data-progress]')){
      const at=Number(n.dataset.progress),state=states[at-1];
      if(at===step)n.setAttribute('aria-current','step');else n.removeAttribute('aria-current');
      n.dataset.state=state;
      // Hindi kulay lang ang nagsasabi ng estado: nasa aria-label ito nang nakasulat.
      n.setAttribute('aria-label',t('wizardStepGo',at,t(n.dataset.stepName))+' — '+t(WORD[state]));
    }
  }
  function goStep(next,{focus=true,restore=false}={}){
    if(!active())return;
    const before=step;
    scrolls.set(step,window.scrollY);step=Math.max(1,Math.min(4,Number(next)||1));
    tip=step; // sinusundan ng gabay ang pahina; hindi ang kabaligtaran
    const moved=before!==step;
    for(const panel of document.querySelectorAll('[data-wizard-step]')){
      const mine=Number(panel.dataset.wizardStep)===step;
      panel.hidden=!mine;
      if(mine&&moved)enterPanel(panel);else delete panel.dataset.entering;
    }
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
    // Hindi pagpili ang paanyaya; ang "Walang CTA" ay tunay na pagpili at pumapasa dito.
    // Ang offer, presyo, logo at Advanced ay opsyonal at hindi hinahanap kailanman.
    if(at===4&&!v.ctaChoice)return{key:'ctaRequired',field:'bCtaChoice'};
    if(at===4&&v.ctaChoice==='custom'&&!v.cta)return{key:'ctaTextRequired',field:'bCta'};
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
  // Ito ang tanging pintuan bago mag-render: sinusuri ang apat na step. Dito rin nagiging
  // "nasubukan na" ang mga step, kaya pagkatapos nito pula na ang may tunay na pagkakamali.
  function validate(v,photo){
    markAttempted();
    let first=null;
    for(const n of [1,2,3,4]){const error=validateStep(n,photo);if(error){first=error;break;}}
    progress();
    return first;
  }
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
  function refreshLanguage(){const old=style.value;categories();allPresets();styleOptions();style.value=STYLES.some(s=>s.id===old)?old:'';setupRefresh();progress();renderTutorial();}
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
    select.replaceChildren(promptOption(t('chooseCategory')),
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
  categories();allPresets();styleOptions();style.value='';goStep(1,{focus:false});syncVisual();

  /* ---------- Mga kontrol ng Quick Business Setup ---------- */
  setupCategory().addEventListener('change',()=>{
    if(!active())return;
    catFromStore=false;setupSavedView();
    if(CATEGORY_BY_ID[setupCategory().value])showError(null);
  });
  $('bSetupChange').addEventListener('click',()=>{
    if(!active())return;
    catFromStore=false;setupSavedView();setupCategory().focus();
  });
  function pickAdType(id){
    if(!AD_TYPE_BY_ID[id])return;
    adType=id;
    for(const b of $('bSetupTypes').querySelectorAll('[data-ad-type]'))
      b.setAttribute('aria-checked',String(b.dataset.adType===id));
    showError(null);
  }
  $('bSetupTypes').addEventListener('click',e=>{
    if(!active())return;
    const card=e.target.closest('[data-ad-type]');
    if(card)pickAdType(card.dataset.adType);
  });
  // Arrow key sa loob ng radiogroup, gaya ng inaasahan sa isang radio group.
  $('bSetupTypes').addEventListener('keydown',e=>{
    if(!active())return;
    const step=e.key==='ArrowRight'||e.key==='ArrowDown'?1:e.key==='ArrowLeft'||e.key==='ArrowUp'?-1:0;
    if(!step)return;
    e.preventDefault();
    const cards=[...$('bSetupTypes').querySelectorAll('[data-ad-type]')];
    const at=cards.findIndex(c=>c.dataset.adType===adType);
    const next=cards[(at<0?0:at+step+cards.length)%cards.length];
    if(next){pickAdType(next.dataset.adType);next.focus();}
  });
  $('bSetupContinue').addEventListener('click',()=>{if(active())finishSetup();});
  // Ang setup ang unang nakikita. Ang apat na step ay nakahanda na sa ilalim nito.
  openSetup({focus:false});

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
  // Hinihintay munang kumupas ang panel bago isara ang details, kaya may fade-out
  // at hindi lang biglang nawawala. Ang Enter at Space ay nagpapadala rin ng click.
  function closeHelp(d,{focus=true}={}){
    if(!d.open||d.dataset.closing)return;
    if(stillPreferred()){d.open=false;if(focus)d.querySelector('summary')?.focus();return;}
    d.dataset.closing='true';
    const done=()=>{delete d.dataset.closing;d.open=false;if(focus)d.querySelector('summary')?.focus();};
    d.querySelector('p')?.addEventListener('animationend',done,{once:true});
    setTimeout(()=>{if(d.dataset.closing)done();},260);
  }
  for(const d of document.querySelectorAll('.fieldHelp')){
    d.querySelector('summary')?.addEventListener('click',e=>{
      if(!d.open||d.dataset.closing)return;
      e.preventDefault();closeHelp(d);
    });
  }
  // Isinasara ng pagpindot sa labas ang bukas na help. Sa click, hindi sa pointerdown:
  // kung sa pointerdown, gumagalaw ang layout bago tumama ang tap at puwedeng pumalya.
  document.addEventListener('click',e=>{
    for(const d of document.querySelectorAll('.fieldHelp[open]'))
      if(!d.contains(e.target))closeHelp(d,{focus:false});
  });
  // Isinasara ng Escape ang bukas na field help at ibinabalik ang focus sa (?).
  document.addEventListener('keydown',e=>{
    if(e.key!=='Escape')return;
    const open=document.querySelector('.fieldHelp[open]');
    if(!open)return;
    e.stopPropagation();closeHelp(open);
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
    if(choice!=='custom'){$('bCta').value=CTA_LABEL[choice]?t('wizard'+CTA_LABEL[choice]):'';ctaTextIsPreset=true;}
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
  return {read,refresh,refreshLanguage,validate,validateStep,firstProblem,showError,copyPackage,goStep,openSetup,finishSetup,setupProblem,getAdType:()=>adType,isSetupOpen:()=>setupOpen,startTutorial,stopTutorial,previewOpened,previewClosed,getStep:()=>step,reveal,usePhoto(){ visualMode='photo';thumbSign='';syncVisual(); },syncVisual,setQuality(q){quality=q;},clear(){stopTutorial({focus:false});previewing=false;previewClosed();quality=null;tip=1;scrolls.clear();clearAttempts();progressSign='';adType='';setupCategory().value='';openSetup({focus:false});category.value='';preset.dataset.layout=DEFAULT_LAYOUT;style.value='';visualMode='photo';visualId='';visualCat='';thumbSign='';syncVisual();$('bEnhance').checked=false;ctaTouched=false;ctaTextIsPreset=true;$('bCtaChoice').value='';$('bCtaCustom').hidden=true;$('bCta').value='';for(const id of ['bHook','bCaption','bPackageCta','bHashtags','bPhotoQuality','bStudioError'])$(id).textContent='';$('bPhotoQuality').hidden=true;$('bStudioError').hidden=true;}};
}

// Banner-specific help reuses the controller's overlay interface; shared Help Center is untouched.
export function mountStudioHelp({t,active,onTutorial,inSetup}) {
  const $=id=>document.getElementById(id),dialog=$('ctxHelp'),button=$('helpBtn'),closeButton=$('ctxHelpClose');
  let faq=false,returnFocus=true,setup=false;
  // Habang nasa Business Setup, ang Help ng setup ang bumubukas - hindi ang gabay sa
  // apat na hakbang, dahil wala pa roon ang tao. Pagpasok sa wizard ay bumabalik ito.
  function render(){
    $('bHelpSetup').hidden=!setup;
    $('bHelpChoices').hidden=setup||faq;
    $('bHelpFaq').hidden=setup||!faq;
    const title=setup?'helpSetupTitle':faq?'helpFaqTitle':'wizardHelpTitle';
    $('ctxHelpTitle').textContent=t(title);
    button.setAttribute('aria-label',t(title));
  }
  function refresh(){render();}
  function open(){if(!active()||dialog.open)return;faq=false;setup=!!inSetup?.();render();dialog.showModal();button.setAttribute('aria-expanded','true');$('ctxHelpTitle').focus();}
  function close(){if(!dialog.open)return false;dialog.close();return true;}
  button.setAttribute('aria-haspopup','dialog');button.setAttribute('aria-controls','ctxHelp');button.setAttribute('aria-expanded','false');button.addEventListener('click',open);closeButton.addEventListener('click',close);
  $('bOpenFaq').addEventListener('click',()=>{if(!active())return;faq=true;render();dialog.scrollTop=0;$('ctxHelpTitle').focus();});
  $('bHelpHome').addEventListener('click',()=>{faq=false;render();dialog.scrollTop=0;$('bOpenFaq').focus();});
  $('bStartTutorial').addEventListener('click',()=>{if(!active())return;returnFocus=false;close();onTutorial();});
  dialog.addEventListener('close',()=>{button.setAttribute('aria-expanded','false');if(returnFocus&&active())button.focus();returnFocus=true;faq=false;setup=!!inSetup?.();render();});
  dialog.addEventListener('keydown',e=>{if(e.key!=='Tab')return;const targets=[...dialog.querySelectorAll('button,a[href],summary')].filter(n=>n.getClientRects().length),first=targets[0],last=targets[targets.length-1];if(!targets.includes(document.activeElement)){e.preventDefault();(e.shiftKey?last:first).focus();}else if(e.shiftKey&&document.activeElement===first){e.preventDefault();last.focus();}else if(!e.shiftKey&&document.activeElement===last){e.preventDefault();first.focus();}});
  render();return {open,close,refresh};
}
