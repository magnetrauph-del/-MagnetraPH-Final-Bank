// Paglilinis ng Steps 1-4 at ang limang inaprubahang field-level help.
// Start: python -m http.server 8876 --bind 127.0.0.1 --directory public
const{chromium}=require('playwright'),assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path');
const{env:makeEnv,step,settle,pickVisual}=require('./fixtures/banner-wizard.cjs');
const out=process.env.MAGNETRA_HELP_ARTIFACTS||'/tmp/magnetra-help';fs.mkdirSync(out,{recursive:true});
const results=[],contexts=[];let b;
async function env(o){const e=await makeEnv(b,o);contexts.push(e);return e;}
async function test(name,run){await run();results.push({name,result:'PASS'});console.log('PASS',name);}
// Nasa loob ng Advanced ang pangatlong (?) ng Step 4, kaya binubuksan muna ito.
const openAdvanced=p=>p.locator('#bAdvanced').evaluate(n=>{n.open=true;});

// Naka-lock na teksto ng paanyaya, inaprubahan ng owner noong 2026-11-07.
const PROMPT={en:'Choose a Business Category',fil:'Pumili ng Business Category',tl:'Pumili ng kategorya ng negosyo'};
// Ang limang pinayagang (?) at wala nang iba.
const HELP_TARGETS=['bHeadline','bDesignStyle','bCtaChoice','wizardAspect','theme'];

(async()=>{b=await chromium.launch({executablePath:'/usr/bin/chromium',args:['--no-sandbox']});try{

await test('Step 1 drops the duplicate upload label and the Service Visual sentence, and keeps the upload button working',async()=>{
 for(const lang of['en','fil','tl']){
  const{c,p}=await env({lang,width:360});
  // Wala na ang dalawang label sa labas ng upload box.
  assert.equal(await p.locator('#bUploadHead, #bVisualHead').count(),0,lang+': may natirang label');
  const text=await p.locator('#bStep1').innerText();
  for(const gone of['O gumamit ng Service Visual','Or use a Service Visual'])
   assert(!text.includes(gone),`${lang}: nandiyan pa "${gone}"`);
  // Nananatili ang button sa loob ng box, at gumagana pa rin ang pag-upload.
  const btn=p.locator('#bPhotoAction');
  assert(await btn.isVisible(),lang+': nawala ang upload button');
  assert((await btn.textContent()).trim().length>4,lang+': walang teksto ang button');
  assert.equal(await btn.getAttribute('for'),'bPhoto');
  // Walang (?) sa Step 1 - lalo na sa Service Visual.
  assert.equal(await p.locator('#bStep1 .fieldHelp').count(),0,lang+': may (?) sa Step 1');
  // Buhay pa rin ang mga card ng disenyo.
  await p.locator('#bVisualCategory').selectOption('food');await settle(p);
  assert.equal(await p.locator('#bVisualPicks .visualBtn').count(),3,lang);
  await p.locator('#bVisualPicks .visualBtn').first().click();await settle(p);
  assert.equal(await p.locator('#bVisualPicks .visualBtn[aria-pressed="true"]').count(),1,lang);
  await c.close();
 }
});

await test('The real upload still accepts a file after the label was removed',async()=>{
 const{c,p}=await env();
 const SAMPLE=path.join(__dirname,'../public/dashboard-banner-sample.webp');
 await p.locator('#bPhoto').setInputFiles(SAMPLE);
 await p.locator('#bPhotoRemove').waitFor({state:'visible',timeout:15000});
 assert(await p.locator('#bPhotoThumb').evaluate(n=>n.width>0),'walang larawang na-upload');
 assert.equal(await p.locator('#bUploadArea').getAttribute('data-active'),'true');
 await c.close();
});

await test('Step 2 inputs are genuinely empty, with no example ghost text',async()=>{
 for(const lang of['en','fil','tl']){
  const{c,p}=await env({lang});
  await step(p,2);
  for(const id of['bProduct','bHeadline','bPrice']){
   const f=await p.locator('#'+id).evaluate(n=>({v:n.value,ph:n.getAttribute('placeholder'),i18n:n.getAttribute('data-i18n-ph')}));
   assert.equal(f.v,'',`${lang} ${id}: may laman`);
   assert.equal(f.ph,null,`${lang} ${id}: may placeholder "${f.ph}"`);
   assert.equal(f.i18n,null,`${lang} ${id}: may data-i18n-ph`);
  }
  // Nananatili ang mga label at ang required marker.
  assert.equal(await p.locator('#bProduct').getAttribute('aria-required'),'true');
  assert.equal(await p.locator('#bHeadline').getAttribute('aria-required'),'true');
  assert.equal(await p.locator('#bPrice').getAttribute('aria-required'),null);
  await c.close();
 }
});

await test('Both category dropdowns show the exact approved prompt, in the control itself, in all three languages',async()=>{
 for(const lang of['en','fil','tl']){
  const{c,p}=await env({lang,width:360});
  for(const[sel,at]of[['#bVisualCategory',1],['#bCategory',3]]){
   await step(p,at);
   const got=await p.locator(sel).evaluate(n=>({value:n.value,
    shown:n.options[n.selectedIndex].textContent.trim(),
    blanks:[...n.options].filter(o=>o.value==='').length}));
   assert.equal(got.shown,PROMPT[lang],`${lang} ${sel}: "${got.shown}"`);
   // Walang laman ang halaga, kaya hindi ito kategorya.
   assert.equal(got.value,'',`${lang} ${sel}: itinuturing na kategorya ang paanyaya`);
   assert.equal(got.blanks,1,`${lang} ${sel}: ${got.blanks} na walang laman na option`);
  }
  // Walang panlabas na label o talata na umuulit sa paanyaya.
  for(const at of[1,3]){
   await step(p,at);
   const text=await p.locator(`#bStep${at}`).innerText();
   const hits=text.split(PROMPT[lang]).length-1;
   assert(hits<=1,`${lang} Step ${at}: ${hits} beses lumabas ang paanyaya`);
  }
  await c.close();
 }
});

await test('Choosing a category replaces the prompt, and the choice survives navigation and a language change',async()=>{
 const{c,p}=await env({lang:'fil'});
 await p.locator('#bVisualCategory').selectOption('beauty');await settle(p);
 await step(p,3);await p.locator('#bCategory').selectOption('services');await settle(p);
 const shown=async sel=>p.locator(sel).evaluate(n=>n.options[n.selectedIndex].textContent.trim());
 assert.notEqual(await shown('#bCategory'),PROMPT.fil);
 // Tumutugma pa rin ang rekomendasyon sa napiling kategorya.
 const want=await p.evaluate(async()=>{const{CATEGORY_BY_ID}=await import('/banner-catalog.js?v=2');return CATEGORY_BY_ID.services.layouts.slice();});
 assert.deepEqual(await p.locator('#bPreset .presetButton[data-recommended="true"]').evaluateAll(ns=>ns.map(n=>n.dataset.preset)),want);
 // Hindi nawawala sa paglilibot.
 for(const n of[1,2,4,3,1,3]){await p.locator(`.stepDot[data-progress="${n}"]`).click();await settle(p);}
 assert.equal(await p.locator('#bCategory').inputValue(),'services');
 await step(p,1);
 assert.equal(await p.locator('#bVisualCategory').inputValue(),'beauty');
 // Hindi rin nawawala sa pagpapalit ng wika; ang pangalan lang ang nagbabago.
 await p.evaluate(()=>{localStorage.setItem('mgpref_lang','tl');window.dispatchEvent(new StorageEvent('storage',{key:'mgpref_lang',newValue:'tl'}));});
 await settle(p);
 assert.equal(await p.locator('#bVisualCategory').inputValue(),'beauty','nawala sa pagpapalit ng wika');
 await step(p,3);
 assert.equal(await p.locator('#bCategory').inputValue(),'services','nawala sa pagpapalit ng wika');
 assert.equal(await p.locator('#bCategory option[value=""]').textContent(),PROMPT.tl);
 await c.close();
});

await test('An empty category never forces a default and never blocks the wizard',async()=>{
 const{c,p}=await env();
 // Walang napiling kategorya, pero gumuguhit pa rin ang banner at bumubukas ang preview.
 await pickVisual(p,'food-spotlight');
 await step(p,2);await p.locator('#bProduct').fill('Pandesal');await p.locator('#bHeadline').fill('Mainit');await settle(p);
 await step(p,3);
 assert.equal(await p.locator('#bCategory').inputValue(),'','may pinilit na default');
 assert.equal(await p.locator('#bPreset .presetButton').count(),8,'nawala ang walong layout');
 await step(p,4);await p.locator('#bCtaChoice').selectOption('order');await settle(p);
 await p.locator('#bGenerate').click();
 await p.locator('#inspectDialog').waitFor({state:'visible',timeout:15000});
 assert(await p.evaluate(()=>document.querySelector('#bCanvas').width>0));
 await p.locator('#inspectClose').click();await settle(p);
 await c.close();
});

await test('Exactly five field-level help controls exist, on the approved fields only',async()=>{
 const{c,p}=await env({width:360});
 let total=0;
 for(const n of[1,2,3,4]){
  await step(p,n);
  total+=await p.locator(`#bStep${n} .fieldHelp`).count();
 }
 assert.equal(total,5,'hindi lima ang (?)');
 // Nasa tamang field ang bawat isa.
 await step(p,2);
 assert.equal(await p.locator('#bStep2 .fieldHelp').count(),1);
 assert.equal(await p.locator('label[for="bHeadline"] + .fieldHelp').count(),1,'wala sa Headline');
 await step(p,3);
 assert.equal(await p.locator('#bStep3 .fieldHelp').count(),1);
 assert.equal(await p.locator('label[for="bDesignStyle"] + .fieldHelp').count(),1,'wala sa Design Style');
 await step(p,4);
 assert.equal(await p.locator('#bStep4 .fieldHelp').count(),3);
 assert.equal(await p.locator('label[for="bCtaChoice"] + .fieldHelp').count(),1,'wala sa CTA');
 // Hindi nadoble ang pandaigdigang (?) sa header.
 assert.equal(await p.locator('#helpBtn').count(),1);
 await c.close();
});

await test('Each help control opens only when activated, says something accurate, and closes with Escape',async()=>{
 for(const lang of['en','fil','tl']){
  const{c,p}=await env({lang,width:360});
  for(const[at,n]of[[2,1],[3,1],[4,3]]){
   await step(p,at);
   if(at===4)await openAdvanced(p);
   for(let i=0;i<n;i++){
    const d=p.locator(`#bStep${at} .fieldHelp`).nth(i),sum=d.locator('summary'),body=d.locator('p');
    // Sarado sa simula, at walang nakikitang teksto.
    assert.equal(await d.evaluate(x=>x.open),false,`${lang} ${at}.${i}: bukas agad`);
    assert(await body.isHidden(),`${lang} ${at}.${i}: nakikita na ang teksto`);
    // May accessible name at umaabot sa 44px ang mapipindot.
    const aria=await sum.getAttribute('aria-label');
    assert(aria&&aria.length>5,`${lang} ${at}.${i}: walang accessible name`);
    // Nasa tabi ng <label>; sa <legend> ay nasa ilalim nito, dahil hindi kayang
    // ipantay sa legend nang hindi natatabunan ang mga kontrol sa ibaba.
    const place=await d.evaluate(x=>{const lb=x.previousElementSibling;if(!lb)return null;
     const a=lb.getBoundingClientRect(),h=x.getBoundingClientRect();
     return{legend:lb.tagName==='LEGEND',sameRow:Math.abs(a.top-h.top)<14,
      after:h.left>a.right-2,below:h.top>=a.bottom-2,aligned:Math.abs(h.left-a.left)<4};});
    assert(place,`${lang} ${at}.${i}: walang label`);
    if(place.legend)assert(place.below&&place.aligned,`${lang} ${at}.${i}: ${JSON.stringify(place)}`);
    else assert(place.sameRow&&place.after,`${lang} ${at}.${i}: hindi katabi ng label`);
    // Walang kontrol na natatabunan ang (?). Ini-scroll muna, dahil walang
    // ibinabalik ang elementFromPoint sa labas ng viewport.
    const clear=await sum.evaluate(x=>{x.scrollIntoView({block:'center'});
     const r=x.getBoundingClientRect();
     const top=document.elementFromPoint(r.left+r.width/2,r.top+r.height/2);
     return top?(top===x||x.contains(top)):'labas';});
    assert(clear===true,`${lang} ${at}.${i}: may ibang kontrol sa ibabaw ng (?) (${clear})`);
    const hit=await sum.evaluate(x=>{const r=x.getBoundingClientRect(),cs=getComputedStyle(x,'::before');
     const pad=Math.abs(parseFloat(cs.inset||cs.top||'0'))||0;return{w:r.width+pad*2,h:r.height+pad*2};});
    assert(hit.w>=44&&hit.h>=44,`${lang} ${at}.${i}: ${Math.round(hit.w)}x${Math.round(hit.h)} lang ang mapipindot`);
    // Bumubukas kapag pinindot, at may tunay na laman.
    await sum.click();await settle(p);
    assert.equal(await d.evaluate(x=>x.open),true,`${lang} ${at}.${i}: hindi bumukas`);
    const txt=(await body.textContent()).trim();
    assert(txt.length>40,`${lang} ${at}.${i}: masyadong maikli: "${txt}"`);
    assert(!/^help[A-Z]/.test(txt),`${lang} ${at}.${i}: hilaw na susi: ${txt}`);
    // Walang pag-apaw sa 360px.
    const box=await body.boundingBox();
    assert(box.x>=0&&box.x+box.width<=360.5,`${lang} ${at}.${i}: lumalabas sa gilid`);
    assert(await p.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),`${lang} ${at}.${i}: umapaw ang pahina`);
    // Isinasara ng Escape at bumabalik ang focus sa (?).
    await p.keyboard.press('Escape');await settle(p);
    assert.equal(await d.evaluate(x=>x.open),false,`${lang} ${at}.${i}: hindi isinara ng Escape`);
    assert.equal(await p.evaluate(()=>document.activeElement.tagName),'SUMMARY',`${lang} ${at}.${i}: nawala ang focus`);
   }
  }
  await c.close();
 }
});

await test('Opening help changes nothing the person typed or chose',async()=>{
 const{c,p}=await env();
 await pickVisual(p,'food-spotlight');
 await step(p,2);await p.locator('#bProduct').fill('Pandesal');await p.locator('#bHeadline').fill('Mainit tuwing umaga');
 await p.locator('#bPrice').fill('₱50');await settle(p);
 await step(p,3);await p.locator('#bCategory').selectOption('food');await settle(p);
 await step(p,4);await p.locator('#bCtaChoice').selectOption('learn');await settle(p);
 const before=await p.evaluate(()=>({product:document.querySelector('#bProduct').value,
  headline:document.querySelector('#bHeadline').value,price:document.querySelector('#bPrice').value,
  cat:document.querySelector('#bCategory').value,cta:document.querySelector('#bCtaChoice').value,
  layout:document.querySelector('#bPreset').dataset.layout,step:document.querySelector('.stepDot[aria-current="step"]')?.dataset.progress}));
 for(const at of[2,3,4]){
  await step(p,at);
  if(at===4)await openAdvanced(p);
  for(const d of await p.locator(`#bStep${at} .fieldHelp summary`).all()){await d.click();await settle(p);}
 }
 await step(p,4);
 const after=await p.evaluate(()=>({product:document.querySelector('#bProduct').value,
  headline:document.querySelector('#bHeadline').value,price:document.querySelector('#bPrice').value,
  cat:document.querySelector('#bCategory').value,cta:document.querySelector('#bCtaChoice').value,
  layout:document.querySelector('#bPreset').dataset.layout,step:document.querySelector('.stepDot[aria-current="step"]')?.dataset.progress}));
 assert.deepEqual(after,before,JSON.stringify([before,after]));
 await c.close();
});

await test('The Design Style and Theme Colors help describe what the renderer really does',async()=>{
 const{c,p}=await env();
 const measured=await p.evaluate(async()=>{
  const{renderBanner,THEMES}=await import('/banner-render.js?v=6');
  const{STYLES}=await import('/banner-catalog.js?v=2');
  const cv=document.createElement('canvas');
  const hash=()=>{const d=cv.getContext('2d',{willReadFrequently:true}).getImageData(0,0,cv.width,cv.height).data;
   let h=2166136261;for(let i=0;i<d.length;i+=4){h^=d[i]+d[i+1]*3+d[i+2]*7;h=Math.imul(h,16777619);}return (h>>>0).toString(16);};
  return Object.fromEntries(STYLES.map(st=>[st.id,new Set(Object.keys(THEMES).map(th=>{
   renderBanner(cv,{preset:'food-split-left',designStyle:st.id,theme:th,serviceVisual:'food-spotlight',
    product:'Sample',headline:'Your exact words',price:'₱99',cta:'Order Now'});return hash();})).size]));
 });
 // Ang sinasabi ng help ay tumutugma sa sinusukat: isang style lang ang sumusunod sa tema.
 assert.equal(measured.brand,4,JSON.stringify(measured));
 for(const st of['category','minimal','luxury','bold','tropical'])assert.equal(measured[st],1,st);
 await step(p,3);await p.locator('#bStep3 .fieldHelp summary').click();await settle(p);
 const style=(await p.locator('#bStep3 .fieldHelp p').textContent()).trim();
 assert(/Category Palette/.test(style)&&/Theme Colors/.test(style)&&/Step 4/.test(style),style);
 await step(p,4);await openAdvanced(p);
 const themeHelp=(await p.locator('#bStep4 .fieldHelp p').nth(2).textContent()).trim();
 assert(/Theme Colors/.test(themeHelp)&&/Step 3/.test(themeHelp),themeHelp);
 await c.close();
});

for(const theme of['light','dark'])
 await test(`Help panels are readable at 360px in ${theme} mode`,async()=>{
  const{c,p}=await env({width:360,lang:'fil',theme});
  await step(p,4);await openAdvanced(p);
  for(let i=0;i<3;i++){
   const d=p.locator('#bStep4 .fieldHelp').nth(i);
   await d.locator('summary').click();await settle(p);
   const seen=await d.locator('p').evaluate(n=>{const cs=getComputedStyle(n);
    return{color:cs.color,bg:cs.backgroundColor,w:n.getBoundingClientRect().width};});
   assert.notEqual(seen.color,seen.bg,`${theme} ${i}: parehong kulay ang teksto at likod`);
   assert(seen.w>200&&seen.w<=360,`${theme} ${i}: ${Math.round(seen.w)}px ang lapad`);
  }
  await p.locator('#bStep4').screenshot({path:path.join(out,`help-${theme}.png`)});
  await c.close();
 });

// Inaprubahan ng owner noong 2026-11-07; ang prompt ng Business category ay pinalitan
// ng owner noong 2026-11-08 (b24). Iisang prompt ang Step 1 at Step 3 - pareho ang teksto,
// pero magkahiwalay pa rin ang catalog at ang napiling halaga.
const LOCKED={
 en: {kind:'Business Category',design:'Choose a Design',cat:'Choose a Business Category',style:'Choose a style',cta:'Choose a CTA',theme:'Theme',noCta:'No CTA'},
 fil:{kind:'Business Category',design:'Pumili ng design',cat:'Pumili ng Business Category',style:'Pumili ng style',cta:'Pumili ng CTA',theme:'Theme',noCta:'Walang CTA'},
 tl: {kind:'Kategorya ng Negosyo',design:'Pumili ng disenyo',cat:'Pumili ng kategorya ng negosyo',style:'Pumili ng estilo',cta:'Pumili ng aksyon',theme:'Tema',noCta:'Walang CTA'},
};
// b24: inaprubahang paglalarawan ng apat na step, kada wika.
const INTRO={
 en:['Upload a product photo or choose a design for your business. You can also add a brand logo (optional).',
     'Enter your product name and headline. You can also add a price (optional).',
     'Choose the layout and style that suit your business.',
     'Add a special offer (optional) and choose what the customer should do next. You can also use Advanced Customization (optional).'],
 fil:['I-upload ang product photo o pumili ng design para sa iyong business. Maaari ka ring magdagdag ng brand logo (optional).',
     'Ilagay ang product name at headline. Maaari ka ring maglagay ng price (optional).',
     'Piliin ang layout at style na bagay sa iyong business.',
     'Magdagdag ng special offer (optional) at piliin ang susunod na action ng customer. Maaari mo ring gamitin ang Advanced Customization (optional).'],
 tl:['Mag-upload ng larawan ng produkto o pumili ng disenyo para sa iyong negosyo. Maaari ka ring magdagdag ng logo ng tatak (opsyonal).',
     'Ilagay ang pangalan ng produkto at ang headline. Maaari ka ring maglagay ng presyo (opsyonal).',
     'Piliin ang layout at estilong bagay sa iyong negosyo.',
     'Magdagdag ng natatanging alok (opsyonal) at piliin ang susunod na gagawin ng customer. Maaari mo ring gamitin ang Advanced Customization (opsyonal).'],
};

await test('The two category dropdowns stay independent, keep their ids, survive a language change, and the Step 1 error speaks the chosen language',async()=>{
 // Magkahiwalay ang dalawang catalog: iba ang bilang at iba ang mga halaga.
 const{c,p}=await env({width:360});
 const vals=sel=>p.locator(sel).evaluate(n=>[...n.options].map(o=>o.value));
 await step(p,3);
 const one=await vals('#bVisualCategory'),three=await vals('#bCategory');
 assert.notDeepEqual(one,three,'pinagsama ang dalawang catalog');
 // Hindi nagbago ang mga internal id ng Step 3.
 assert.deepEqual(three,['','ecommerce','food','beauty','fashion','luxury','electronics','home',
  'services','property','fitness','education','travel','automotive','agriculture','pets','events',
  'grocery','b2b','digital','arts','other'],'nagbago ang mga category id');
 // Magkahiwalay ang napiling halaga: ang pagpili sa isa ay hindi gumagalaw sa isa pa.
 await p.locator('#bCategory').selectOption('pets');await settle(p);
 await step(p,1);await p.locator('#bVisualCategory').selectOption('food');await settle(p);
 await step(p,3);
 assert.equal(await p.locator('#bCategory').inputValue(),'pets','naapektuhan ng Step 1 ang Step 3');
 // Ang paglipat ng wika ay nagpapalit ng teksto, hindi ng napili at hindi ng nilagay.
 await step(p,2);await p.locator('#bProduct').fill('Tinapay ni Nanay');await settle(p);
 for(const lang of['tl','fil','en']){
  await p.evaluate(l=>{localStorage.setItem('mgpref_lang',l);
   window.dispatchEvent(new StorageEvent('storage',{key:'mgpref_lang',newValue:l}));},lang);
  await settle(p);
  assert.equal(await p.locator('#bProduct').inputValue(),'Tinapay ni Nanay',lang+': nawala ang nilagay');
  await step(p,3);
  assert.equal(await p.locator('#bCategory').inputValue(),'pets',lang+': nawala ang napili');
  assert.equal(await p.locator('#bCategory').evaluate(n=>n.options[n.selectedIndex].value),'pets');
  await step(p,1);
  assert.equal(await p.locator('#bVisualCategory').inputValue(),'food',lang+': nawala ang napili sa Step 1');
 }
 await c.close();

 // Ang mensahe ng Step 1 ay nasa napiling wika. Ang lumalabas talaga ay pickVisual;
 // naisalin na rin ang wizardInvalidVisual, pero wala pang code na gumagamit nito.
 const seen=new Set();
 for(const lang of['en','fil','tl']){
  const{c,p}=await env({lang,width:360});
  await step(p,2);await p.locator('#bProduct').fill('Pandesal');
  await p.locator('#bHeadline').fill('Mainit');await settle(p);
  await step(p,4);await p.locator('#bCtaChoice').selectOption('none');await settle(p);
  await p.locator('#bGenerate').click();await settle(p);
  assert(await p.locator('#inspectDialog').isHidden(),lang+': bumukas nang walang larawan');
  assert.equal(await p.evaluate(()=>document.activeElement.id),'bVisualCategory',lang+': maling field');
  const msg=(await p.locator('#bStudioError').textContent()).trim();
  assert(msg.length>0,lang+': walang mensahe');
  seen.add(msg);
  const dict=await p.evaluate(async()=>{const{STRINGS}=await import('/banner-i18n.js?v=25');
   return {inv:STRINGS[document.documentElement.lang==='en'?'en':'fil'].wizardInvalidVisual};});
  assert(dict.inv&&dict.inv.length>0,lang+': walang salin ang wizardInvalidVisual');
  await c.close();
 }
 assert(seen.size>=2,'pareho ang mensahe sa lahat ng wika: '+JSON.stringify([...seen]));
});

await test('Every locked string is exact in its own language, with no Tagalog leaking into Taglish',async()=>{
 for(const lang of['en','fil','tl']){
  const{c,p}=await env({lang,width:360});
  const text=sel=>p.locator(sel).evaluate(n=>n.options?n.options[n.selectedIndex].textContent.trim():n.textContent.trim());
  const w=LOCKED[lang];
  assert.equal(await text('label[for="bVisualCategory"]'),w.kind,lang+' kind');
  assert.equal(await text('#bVisualPicksLabel'),w.design,lang+' design');
  assert.equal(await text('#bVisualCategory'),w.cat,lang+' Step1 category');
  await step(p,3);
  // Pareho ang LABEL ng dalawang step, at iba ito sa PROMPT ng dropdown.
  assert.equal(await text('label[for="bCategory"]'),w.kind,lang+' Step3 label');
  assert.equal(await text('#bCategory'),w.cat,lang+' Step3 category');
  assert.notEqual(w.kind,w.cat,lang+': pinagpareho ang label at ang prompt');
  assert.equal(await text('#bDesignStyle'),w.style,lang+' style');
  await step(p,4);
  assert.equal(await text('#bCtaChoice'),w.cta,lang+' cta');
  assert.equal((await p.locator('#bCtaChoice option[value="none"]').textContent()).trim(),w.noCta,lang+' no cta');
  await p.locator('#bAdvanced').evaluate(n=>{n.open=true;});
  assert.equal(await text('#bThemeLabel'),w.theme,lang+' theme');
  // Walang malalim na Tagalog na tumatagas sa Taglish.
  if(lang==='fil')for(const leak of['kategorya','estilo','aksyon','disenyo','Negosyo','Tema'])
   for(const v of Object.values(w))assert(!v.includes(leak),`fil: tumagas ang "${leak}" sa "${v}"`);
  await c.close();
 }
});

await test('Empty style and empty CTA are prompts, not choices, and both keep the banner rendering',async()=>{
 const{c,p}=await env();
 await pickVisual(p,'food-spotlight');
 await step(p,2);await p.locator('#bProduct').fill('Pandesal');await p.locator('#bHeadline').fill('Mainit');await settle(p);
 await step(p,3);
 assert.equal(await p.locator('#bDesignStyle').inputValue(),'');
 await step(p,4);
 assert.equal(await p.locator('#bCtaChoice').inputValue(),'');
 assert.equal(await p.locator('#bCta').inputValue(),'','may CTA text kahit walang napili');
 // Gumuguhit pa rin: ang walang laman na estilo ay bumabagsak sa Category Palette.
 const fallback=await p.evaluate(async()=>{
  const{renderBanner}=await import('/banner-render.js?v=6');
  const{palette,CATEGORY_BY_ID}=await import('/banner-catalog.js?v=2');
  const{THEMES}=await import('/banner-render.js?v=6');
  const cv=document.createElement('canvas');
  const a=palette('food','',THEMES.indigo),b=palette('food','category',THEMES.indigo);
  const r=renderBanner(cv,{preset:'food-split-left',designStyle:'',serviceVisual:'food-spotlight',
   product:'Pandesal',headline:'Mainit',cta:''});
  return {same:JSON.stringify(a)===JSON.stringify(b),fits:r.fits,
   ctaBox:r.boxes.some(x=>x.role==='cta')};
 });
 assert(fallback.same,'ang walang laman na estilo ay hindi tumutugma sa Category Palette');
 assert(fallback.fits,'hindi kasya ang banner');
 assert(!fallback.ctaBox,'may CTA sa banner kahit wala pang napili');
 // b24: ang paanyaya ay hindi pagpili, kaya hindi ito pumapasa sa gate. Hindi ito
 // tahimik na ginagawang "Walang CTA" - itinuturo ang dropdown at hinihintay ang pagpili.
 await p.locator('#bGenerate').click();await settle(p);
 assert(await p.locator('#inspectDialog').isHidden(),'bumukas ang preview nang walang piniling CTA');
 assert.equal(await p.locator('#bCtaChoice').getAttribute('aria-invalid'),'true');
 assert.equal(await p.evaluate(()=>document.activeElement.id),'bCtaChoice');
 assert.equal(await p.locator('#bCtaChoice').inputValue(),'','pinalitan ang paanyaya ng sarili nitong halaga');
 // Ang Walang CTA ay tahasan, naiiba sa paanyaya, at ito ang pumapasa.
 await p.locator('#bCtaChoice').selectOption('none');await settle(p);
 assert.equal(await p.locator('#bCtaChoice').inputValue(),'none');
 assert.equal(await p.locator('#bCta').inputValue(),'');
 await p.locator('#bGenerate').click();
 await p.locator('#inspectDialog').waitFor({state:'visible',timeout:15000});
 assert(await p.evaluate(()=>document.querySelector('#bCanvas').width>0));
 await p.locator('#inspectClose').click();await settle(p);
 await step(p,3);await p.locator('#bCategory').selectOption('food');await settle(p);
 await step(p,4);
 assert.equal(await p.locator('#bCtaChoice').inputValue(),'none','pinalitan ang tahasang Walang CTA');
 await c.close();
});

await test('Each step carries exactly one approved description, and the optional fields stay optional',async()=>{
 for(const lang of['en','fil','tl']){
  const{c,p}=await env({lang,width:360});
  for(const n of[1,2,3,4]){
   await step(p,n);
   const intro=p.locator(`#bStep${n} .stepIntro`);
   assert.equal(await intro.count(),1,`${lang} step${n}: dapat isang paglalarawan lang`);
   assert.equal((await intro.textContent()).trim(),INTRO[lang][n-1],`${lang} step${n}: mali ang paglalarawan`);
   assert(await intro.isVisible(),`${lang} step${n}: hindi nakikita ang paglalarawan`);
  }
  // Ang apat na opsyonal ay nananatiling opsyonal: walang required, at nakatikom pa rin
  // ang Advanced. Hindi dahil may opsyonal na field ay opsyonal na ang buong step.
  for(const id of['bLogo','bPrice','bOffer','bDetail','bBusiness','bContact','bBadge']){
   assert.equal(await p.locator('#'+id).getAttribute('required'),null,`${lang} ${id}: naging required`);
   assert.equal(await p.locator('#'+id).getAttribute('aria-required'),null,`${lang} ${id}: aria-required`);
  }
  assert.equal(await p.locator('#bAdvanced').getAttribute('open'),null,lang+': bukas ang Advanced');
  // Ang dalawang tunay na required ay may marka pa rin.
  for(const id of['bProduct','bHeadline'])
   assert.equal(await p.locator('#'+id).getAttribute('aria-required'),'true',`${lang} ${id}: nawala ang required`);
  await c.close();
 }
});

await test('Motion runs only on real navigation and respects reduced motion',async()=>{
 // May galaw ang context na ito; ang karaniwang fixture ay naka-reduce.
 const c=await b.newContext({viewport:{width:360,height:844},serviceWorkers:'block'});
 contexts.push({c,errors:[],external:[],writes:[]});
 const{install,base}=require('./fixtures/account.cjs');
 await install(c,{lang:'fil',theme:'light'});
 const p=await c.newPage();
 await p.goto(base+'/banner.html');await p.locator('#app').waitFor({state:'visible'});
 // Tunay na paglipat: may marka ang bagong panel, at nawawala ito pagkatapos.
 await p.locator('.stepDot[data-progress="2"]').click();
 assert.equal(await p.locator('#bStep2').getAttribute('data-entering'),'true','walang galaw sa paglipat');
 await p.waitForTimeout(400);
 assert.equal(await p.locator('#bStep2').getAttribute('data-entering'),null,'naiwan ang marka');
 const dur=await p.locator('#bStep2').evaluate(n=>{n.dataset.entering='true';
  const d=getComputedStyle(n).animationDuration;delete n.dataset.entering;return Math.round(parseFloat(d)*1000);});
 assert(dur>=200&&dur<=250,'transition na '+dur+'ms');
 // Parehong step muli: walang galaw.
 await p.locator('.stepDot[data-progress="2"]').click();
 assert.equal(await p.locator('#bStep2').getAttribute('data-entering'),null,'gumalaw kahit hindi lumipat');
 // Ang help ay kumukupas papasok at palabas.
 const d=p.locator('#bStep2 .fieldHelp');
 await d.locator('summary').click();await p.waitForTimeout(40);
 const inDur=await d.locator('p').evaluate(n=>Math.round(parseFloat(getComputedStyle(n).animationDuration)*1000));
 assert(inDur>=150&&inDur<=200,'help fade na '+inDur+'ms');
 await d.locator('summary').click();
 assert.equal(await d.getAttribute('data-closing'),'true','walang fade-out');
 await p.waitForTimeout(350);
 assert.equal(await d.evaluate(n=>n.open),false,'hindi nagsara');
 await c.close();
 // Sa reduced motion, walang animasyon at walang paghihintay.
 const{c:c2,p:p2}=await env({width:360});
 await p2.locator('.stepDot[data-progress="2"]').click();
 assert.equal(await p2.locator('#bStep2').getAttribute('data-entering'),null,'may galaw kahit reduced motion');
 const d2=p2.locator('#bStep2 .fieldHelp');
 await d2.locator('summary').click();await settle(p2);
 assert.equal(await d2.evaluate(n=>n.open),true);
 await d2.locator('summary').click();
 assert.equal(await d2.evaluate(n=>n.open),false,'hindi agad nagsara sa reduced motion');
 await c2.close();
});

await test('Generate Preview cannot be fired twice at once',async()=>{
 const{c,p}=await env();
 await pickVisual(p,'food-spotlight');
 await step(p,2);await p.locator('#bProduct').fill('Pandesal');await p.locator('#bHeadline').fill('Mainit');await settle(p);
 await step(p,4);await p.locator('#bCtaChoice').selectOption('order');await settle(p);
 const idle=(await p.locator('#bGenerate').textContent()).trim();
 // Tatlong magkakasunod na pindot: isang dialog lang ang dapat lumabas.
 await p.locator('#bGenerate').evaluate(n=>{n.click();n.click();n.click();});
 await p.locator('#inspectDialog').waitFor({state:'visible',timeout:15000});
 assert.equal(await p.locator('dialog[open]').count(),1,'higit sa isang dialog');
 assert.equal(await p.locator('#bGenerate').getAttribute('aria-busy'),null,'naiwang busy ang pindutan');
 assert.equal(await p.locator('#bGenerate').getAttribute('aria-disabled'),null,'naiwang disabled ang pindutan');
 assert.equal((await p.locator('#bGenerate').textContent()).trim(),idle,'hindi naibalik ang teksto ng pindutan');
 await p.locator('#inspectClose').click();await settle(p);
 await c.close();
});

for(const e of contexts){assert.deepEqual(e.errors,[]);assert.deepEqual(e.external,[]);assert.deepEqual(e.writes,[]);}
fs.writeFileSync(path.join(out,'help-results.json'),JSON.stringify({result:'PASS',results,
 helpTargets:HELP_TARGETS,prompt:PROMPT,
 auth:'Mocked services; emulated viewports only - no physical Android device'},null,2));
}finally{await b.close()}})().catch(e=>{console.error(e);process.exitCode=1});
