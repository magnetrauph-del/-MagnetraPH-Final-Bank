// Step 3 pagkatapos ng paglilinis: 21 kategorya, 8 layout, 6 design style.
// Start: python -m http.server 8876 --bind 127.0.0.1 --directory public
const{chromium}=require('playwright'),assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path');
const{env:makeEnv,step,preview,exportPNG,settle,pickVisual,pickLayout,currentLayout,openLayouts,completeSetup}=require('./fixtures/banner-wizard.cjs');
const out=process.env.MAGNETRA_STEP3_ARTIFACTS||'/tmp/magnetra-step3';fs.mkdirSync(out,{recursive:true});
const results=[],contexts=[];let b;
async function env(o){const e=await makeEnv(b,o);contexts.push(e);return e;}
async function test(name,run){await run();results.push({name,result:'PASS'});console.log('PASS',name);}
// Binubuksan ang See All nang hindi ito isinasara kapag bukas na.
const openAll=p=>openLayouts(p);
// Ang apat na tinanggal na kontrol at ang kanilang teksto.
const GONE_IDS='#bCategorySearch, #bCategoryClear, #bCategoryEmpty, #bCustomCategory, #bCustomWrap, #bCategorySearchHint';
// b24: inaprubahan ng owner noong 2026-11-08 ang paglalarawan ng Step 3.
const STEP3_INTRO={
 "en": "Keep the suggested banner layout or choose another arrangement for your product image and text.",
 "fil": "Panatilihin ang suggested banner layout o pumili ng ibang ayos para sa product image at text.",
 "tl": "Panatilihin ang mungkahing ayos ng banner o pumili ng ibang ayos para sa larawan at teksto ng produkto."
};
const GONE_TEXT={
 fil:['Pumili ng category at layout na bagay sa mensahe mo.','Hanapin ang business category mo',
      'Hanapin ang uri ng produkto o service mo','Category ng business mo'],
 en: ['Choose a category, then a layout','Find your business category',
      'Search what you sell or the service you offer','Your business category'],
 tl: ['Pumili ng category at layout na bagay sa mensahe mo.','Hanapin ang business category mo',
      'Hanapin ang uri ng produkto o serbisyong inaalok mo','Category ng negosyo mo'],
};

(async()=>{b=await chromium.launch({executablePath:'/usr/bin/chromium',args:['--no-sandbox']});try{

await test('The four removed controls and their text are gone from Step 3 in all three languages',async()=>{
 for(const lang of['en','fil','tl']){
  const{c,p}=await env({lang});
  await step(p,3);
  assert.equal(await p.locator(GONE_IDS).count(),0,lang+': may natirang kontrol');
  const text=await p.locator('#bStep3').innerText();
  for(const g of GONE_TEXT[lang])assert(!text.includes(g),`${lang}: nandiyan pa "${g}"`);
  // b24: walang helper paragraph sa ilalim ng mga field, pero may isang inaprubahang
  // paglalarawan ng step sa itaas - eksaktong isa, at eksakto ang teksto.
  assert.equal(await p.locator('#bStep3 .hint').count(),0,lang+': may helper paragraph');
  const intro=p.locator('#bStep3 .stepIntro');
  assert.equal(await intro.count(),1,lang+': dapat isang step description lang');
  assert.equal((await intro.textContent()).trim(),STEP3_INTRO[lang],lang+': mali ang step description');
  await c.close();
 }
});

await test('Every one of the 21 categories offers the three layouts the catalogue says it does',async()=>{
 const{c,p}=await env();
 await step(p,3);
 const expected=await p.evaluate(async()=>{const{CATEGORIES}=await import('/banner-catalog.js');
  return CATEGORIES.map(x=>[x.id,x.layouts.slice()]);});
 assert.equal(expected.length,21);
 for(const[id,layouts]of expected){
  await p.locator('#bCategory').selectOption(id);await settle(p);
  const shown=await p.locator('#bPreset .presetButton[data-recommended="true"]').evaluateAll(ns=>ns.map(n=>n.dataset.preset));
  assert.deepEqual(shown,layouts,id);
  // May pangalan at paglalarawan ang bawat card, at wala ni isang blangko.
  const copy=await p.locator('#bPreset .presetButton[data-recommended="true"]').evaluateAll(ns=>ns.map(n=>
   [n.querySelector('.presetName').textContent.trim(),n.querySelector('.presetDetail').textContent.trim()]));
  for(const[name,detail]of copy){assert(name.length>2,id+' walang pangalan');assert(detail.length>8,id+' walang paglalarawan');}
 }
 // Lahat ng walong layout ay naaabot mula sa kahit isang kategorya.
 assert.equal(new Set(expected.flatMap(([,l])=>l)).size,8);
 fs.writeFileSync(path.join(out,'category-layouts.json'),JSON.stringify(Object.fromEntries(expected),null,2));
 await c.close();
});

await test('See All and the recommended cards are one selection, and a layout no longer switches the business category',async()=>{
 const{c,p}=await env();
 await step(p,3);
 await p.locator('#bCategory').selectOption('food');await settle(p);
 await openAll(p);
 assert.equal(await p.locator('#bPreset .presetButton').count(),8);
 assert.equal(await p.locator('#bPreset select, #bPreset option, #bPreset optgroup').count(),0,'may ulit-ulit na pamagat ng kategorya');
 // Card -> select.
 await p.locator('#bPreset .presetButton[data-recommended="true"]').nth(1).click();await settle(p);
 assert.equal(await currentLayout(p),'split-left');
 assert.equal(await p.locator('#bPreset .presetButton[data-recommended="true"][aria-pressed="true"]').getAttribute('data-preset'),'split-left');
 // Select -> card. Ang hindi inirerekomendang layout ay walang naka-press na card, pero napipili pa rin.
 await pickLayout(p,'service-header');await settle(p);
 assert.equal(await p.locator('#bCategory').inputValue(),'food','pinalitan ng layout ang kategorya');
 assert.equal(await p.locator('#bPreset .presetButton[data-recommended="true"][aria-pressed="true"]').count(),0);
 await pickLayout(p,'stack-photo');await settle(p);
 assert.equal(await p.locator('#bPreset .presetButton[data-recommended="true"][aria-pressed="true"]').getAttribute('data-preset'),'stack-photo');
 await c.close();
});

// Inaprubahan ng owner noong 2026-11-07. Nakapako rito ang eksaktong teksto, kaya
// anumang pagbabago sa pangalan ay babagsak hanggang muli itong aprubahan.
const APPROVED={
 'split-left':      ['Split Feature',    'Photo left, text right',                'Product photo sa kaliwa, details sa kanan'],
 'menu-band':       ['Menu Split',       'Photo left, text right, accent line',   'Product photo sa kaliwa, details sa kanan, may accent line'],
 'split-right':     ['Split Reverse',    'Photo right, text left',                'Product photo sa kanan, details sa kaliwa'],
 'stack-photo':     ['Photo Header',     'Photo on top, text below',              'Main photo sa itaas, details sa ibaba'],
 'service-header':  ['Slim Banner',      'Slim photo on top, text below',         'Slim photo sa itaas, details sa ibaba'],
 'stack-copy':      ['Text First',       'Text on top, photo below',              'Main message sa itaas, photo sa ibaba'],
 'type-led':        ['Text First Accent','Text on top, photo below, accent line', 'Main message sa itaas, photo sa ibaba, may accent line'],
 'inset-gallery':   ['Inset Gallery',    'Text on top, framed photo below',       'Main message sa itaas, framed photo sa ibaba'],
};

await test('One list of cards: three collapsed, eight expanded with five newly revealed, each layout exactly once',async()=>{
 const{c,p}=await env();
 await step(p,3);await p.locator('#bCategory').selectOption('food');await settle(p);
 const ids=sel=>p.locator(sel).evaluateAll(ns=>ns.map(n=>n.dataset.preset));
 const more=p.locator('#bMoreLayouts');

 // Walang dropdown at walang "Layout ng Studio" na label kahit saan sa pahina.
 assert.equal(await p.locator('#bStep3 select:not(#bCategory):not(#bDesignStyle)').count(),0,'may natirang dropdown');
 assert.equal(await p.locator('#bPresetLabel, #bAllPresets, #bRecommended').count(),0,'may natirang lumang kontrol');
 for(const dead of['Layout ng Studio','Studio layout preset','Studio layout'])
  assert(!(await p.locator('#bStep3').innerText()).includes(dead),'nandiyan pa: '+dead);

 // Tatlo sa simula, at pawang inirerekomenda ng napiling kategorya.
 const collapsed=await ids('#bPreset .presetButton:visible');
 assert.equal(collapsed.length,3,JSON.stringify(collapsed));
 const expected=await p.evaluate(async()=>{const{CATEGORY_BY_ID}=await import('/banner-catalog.js');
  return CATEGORY_BY_ID.food.layouts.slice();});
 assert.deepEqual(collapsed,expected);
 assert.equal(await more.getAttribute('aria-expanded'),'false');

 // Walo pagkabukas, at lima ang bagong lumitaw.
 await more.click();await settle(p);
 const expandedIds=await ids('#bPreset .presetButton:visible');
 assert.equal(expandedIds.length,8,JSON.stringify(expandedIds));
 assert.equal(await more.getAttribute('aria-expanded'),'true');
 const revealed=expandedIds.filter(id=>!collapsed.includes(id));
 assert.equal(revealed.length,5,JSON.stringify(revealed));
 // Minsan lang lumalabas ang bawat layout, at walo silang lahat.
 assert.equal(new Set(expandedIds).size,8,'may dobleng card');
 const all=await p.evaluate(async()=>{const{LAYOUTS}=await import('/banner-catalog.js');return LAYOUTS.map(l=>l.id);});
 assert.deepEqual([...expandedIds].sort(),[...all].sort());
 // Pare-pareho ang anyo ng walo: may diagram, pangalan at paglalarawan, at button lahat.
 const shape=await p.locator('#bPreset .presetButton').evaluateAll(ns=>ns.map(n=>
  [n.tagName,!!n.querySelector('.presetDiagram'),!!n.querySelector('.presetName'),!!n.querySelector('.presetDetail'),n.className]));
 for(const[tag,d,n2,det,cls]of shape){
  assert.equal(tag,'BUTTON');assert(d&&n2&&det,JSON.stringify([d,n2,det]));
  // Iisang component: ang 'extra' lang ang pinapayagang dagdag na klase, at iyon ay
  // para sa pagbukas, hindi para sa ibang anyo.
  assert.deepEqual(cls.split(' ').filter(x=>x&&x!=='extra'),['presetButton'],'magkaibang klase ang card: '+cls);
 }
 // Tatlo lang ang may tatak, at English ito.
 const tags=await p.locator('#bPreset .presetTag').allTextContents();
 assert.equal(tags.length,3);
 for(const x of tags)assert.equal(x,'Recommended');

 // Nananatili ang pagpili kapag isinara, kahit nakatago ang napiling card.
 const hidden=revealed[0];
 await p.locator(`#bPreset .presetButton[data-preset="${hidden}"]`).click();await settle(p);
 assert.equal(await currentLayout(p),hidden);
 await more.click();await settle(p);
 assert.equal((await ids('#bPreset .presetButton:visible')).length,3);
 assert.equal(await currentLayout(p),hidden,'nawala ang pagpili sa pagsasara');
 await more.click();await settle(p);
 assert.equal(await p.locator(`#bPreset .presetButton[data-preset="${hidden}"]`).getAttribute('aria-pressed'),'true');
 await c.close();
});

await test('Expanding and collapsing animates only the five extra cards, keeps the page still, and reuses the same DOM',async()=>{
 // Hindi 'reduce' ang context na ito, kaya nasusukat ang tunay na transition.
 const c=await b.newContext({viewport:{width:360,height:844},serviceWorkers:'block'});
 contexts.push({c,errors:[],external:[],writes:[]});
 const{install,base}=require('./fixtures/account.cjs');
 await install(c,{lang:'fil',theme:'light'});
 const p=await c.newPage();
 await p.goto(base+'/banner.html');await p.locator('#app').waitFor({state:'visible'});
 await completeSetup(p,{category:'food',adType:'physical'});
 await step(p,3);await settle(p);
 const grid=p.locator('#bPreset'),more=p.locator('#bMoreLayouts');
 // Ang lima lang ang may klaseng extra; ang tatlong inirerekomenda ay wala.
 const classes=await p.locator('#bPreset .presetButton').evaluateAll(ns=>ns.map(n=>
  [n.dataset.preset,n.classList.contains('extra'),n.dataset.recommended]));
 assert.equal(classes.filter(x=>x[1]).length,5,JSON.stringify(classes));
 assert.equal(classes.filter(x=>!x[1]).length,3);
 for(const[,isExtra,rec]of classes)assert.equal(isExtra,rec!=='true','hindi tugma ang extra at recommended');

 // May tunay na transition, at nasa 180-240ms ang haba.
 const dur=await p.locator('#bPreset .presetButton.extra').first().evaluate(n=>{
  const cs=getComputedStyle(n);
  return cs.transitionDuration.split(',').map(x=>Math.round(parseFloat(x)*1000));
 });
 const longest=Math.max(...dur);
 assert(longest>=180&&longest<=240,'transition na '+longest+'ms, hindi 180-240ms');

 // Ang pagbukas ay attribute lamang: pareho pa rin ang mga elemento pagkatapos.
 const stamp=()=>p.evaluate(()=>{const ns=[...document.querySelectorAll('#bPreset .presetButton')];
  ns.forEach((n,i)=>{n.dataset.probe=String(i);});return ns.length;});
 assert.equal(await stamp(),8);
 await p.evaluate(()=>document.getElementById('bMoreLayouts').click());
 await p.waitForTimeout(350);
 const kept=await p.locator('#bPreset .presetButton').evaluateAll(ns=>ns.map(n=>n.dataset.probe));
 assert.deepEqual(kept,['0','1','2','3','4','5','6','7'],'muling itinayo ang DOM sa pagbukas');
 assert.equal(await grid.getAttribute('data-open'),'true');
 assert.equal(await more.getAttribute('aria-expanded'),'true');
 assert.equal(await p.locator('#bPreset .presetButton:visible').count(),8);

 // Hindi tumatalon ang pahina sa pagbukas o pagsara (native click, walang scroll ng harness).
 const spot=()=>p.evaluate(()=>[scrollY,Math.round(document.querySelector('#bPreset').getBoundingClientRect().top)]);
 const before=await spot();
 await p.evaluate(()=>document.getElementById('bMoreLayouts').click());
 const during=[];
 for(let i=0;i<10;i++){await p.waitForTimeout(30);during.push(await spot());}
 for(const f of during)assert.deepEqual(f,before,'gumalaw ang pahina: '+JSON.stringify([before,f]));
 assert.equal(await grid.getAttribute('data-open'),'false');
 assert.equal(await p.locator('#bPreset .presetButton:visible').count(),3);
 // Hindi maaabot ng tab ang nakatagong lima.
 assert.equal(await p.evaluate(()=>[...document.querySelectorAll('#bPreset .presetButton')]
  .filter(n=>getComputedStyle(n).visibility!=='hidden').length),3);
 // Ang focus ay nananatili sa pindutan, hindi lumilipat sa card.
 await more.focus();await more.press('Enter');await p.waitForTimeout(350);
 assert.equal(await p.evaluate(()=>document.activeElement.id),'bMoreLayouts');
 assert.equal(await more.getAttribute('aria-expanded'),'true');
 await c.close();
});

await test('With reduced motion the five cards appear at once, with no transition',async()=>{
 const{c,p}=await env({width:360,lang:'fil'});
 await step(p,3);await openLayouts(p);
 const dur=await p.locator('#bPreset .presetButton.extra').first().evaluate(n=>
  getComputedStyle(n).transitionDuration.split(',').map(x=>parseFloat(x)).reduce((a,x)=>a+x,0));
 assert.equal(dur,0,'may transition pa rin kahit reduced motion: '+dur);
 assert.equal(await p.locator('#bPreset .presetButton:visible').count(),8);
 await c.close();
});

await test('Every one of the eight cards can be selected and really changes the banner',async()=>{
 const{c,p}=await env();
 await pickVisual(p,'food-spotlight');
 await step(p,2);await p.locator('#bProduct').fill('Pandesal');await p.locator('#bHeadline').fill('Mainit tuwing umaga');await settle(p);
 await step(p,3);await p.locator('#bCategory').selectOption('food');await openLayouts(p);await settle(p);
 const all=await p.locator('#bPreset .presetButton').evaluateAll(ns=>ns.map(n=>n.dataset.preset));
 const seen={};
 for(const id of all){
  await p.locator(`#bPreset .presetButton[data-preset="${id}"]`).click();await settle(p);
  assert.equal(await currentLayout(p),id);
  assert.equal(await p.locator(`#bPreset .presetButton[data-preset="${id}"]`).getAttribute('aria-pressed'),'true');
  assert.equal(await p.locator('#bPreset .presetButton[aria-pressed="true"]').count(),1,id+': higit sa isa ang napili');
  seen[id]=await p.evaluate(()=>{const cv=document.querySelector('#bCanvas');
   const d=cv.getContext('2d',{willReadFrequently:true}).getImageData(0,0,cv.width,cv.height).data;
   let h=2166136261;for(let i=0;i<d.length;i+=4){h^=d[i]+d[i+1]*3+d[i+2]*7;h=Math.imul(h,16777619);}
   return (h>>>0).toString(16);});
 }
 // Walong magkakaibang banner: tunay na nagbabago ang guhit, hindi lang ang napili.
 assert.equal(new Set(Object.values(seen)).size,8,JSON.stringify(seen));
 await c.close();
});

await test('Switching business category refreshes the three without ever duplicating a card',async()=>{
 const{c,p}=await env();
 await step(p,3);
 const expected=await p.evaluate(async()=>{const{CATEGORIES}=await import('/banner-catalog.js');
  return CATEGORIES.map(x=>[x.id,x.layouts.slice()]);});
 for(const[id,layouts]of expected){
  await p.locator('#bCategory').selectOption(id);await settle(p);
  const vis=await p.locator('#bPreset .presetButton:visible').evaluateAll(ns=>ns.map(n=>n.dataset.preset));
  assert.deepEqual(vis,layouts,id);
  const total=await p.locator('#bPreset .presetButton').evaluateAll(ns=>ns.map(n=>n.dataset.preset));
  assert.equal(total.length,8,id+': '+total.length+' na card');
  assert.equal(new Set(total).size,8,id+': may dobleng card');
 }
 // Ganoon din habang bukas ang lima.
 await openLayouts(p);
 for(const[id]of expected.slice(0,6)){
  await p.locator('#bCategory').selectOption(id);await settle(p);
  const total=await p.locator('#bPreset .presetButton:visible').evaluateAll(ns=>ns.map(n=>n.dataset.preset));
  assert.equal(new Set(total).size,8,id+': may dobleng card habang bukas');
 }
 await c.close();
});

await test('A touch tap selects a card, and the toggle is reachable by keyboard',async()=>{
 const{c,p}=await env({width:360,touch:true});
 await step(p,3);await p.locator('#bCategory').selectOption('services');await settle(p);
 await p.locator('#bPreset .presetButton').nth(1).tap();await settle(p);
 assert.equal(await p.locator('#bPreset .presetButton').nth(1).getAttribute('aria-pressed'),'true');
 // Ang pindutan ay tunay na button, may aria-expanded at umaabot sa 44px.
 const more=p.locator('#bMoreLayouts');
 assert.equal(await more.evaluate(n=>n.tagName),'BUTTON');
 assert((await more.boundingBox()).height>=44);
 await more.tap();await settle(p);
 assert.equal(await more.getAttribute('aria-expanded'),'true');
 assert.equal(await p.locator('#bPreset .presetButton:visible').count(),8);
 await c.close();
});

await test('The eight cards carry the exact approved titles and descriptions in all three languages, on both grids',async()=>{
 for(const lang of['en','fil','tl']){
  const{c,p}=await env({lang});
  await step(p,3);await openAll(p);
  const read=sel=>p.locator(sel).evaluateAll(ns=>ns.map(n=>[n.dataset.preset,
   n.querySelector('.presetName').textContent,n.querySelector('.presetDetail').textContent,
   n.querySelector('.presetTag')?.textContent||'']));
  const all=await read('#bPreset .presetButton');
  assert.equal(all.length,8,lang);
  for(const[id,name,detail,tag]of all){
   const[title,en,taglish]=APPROVED[id];
   assert.equal(name,title,`${lang} ${id}: pamagat`);
   assert.equal(detail,lang==='en'?en:taglish,`${lang} ${id}: paglalarawan`);
   // English ang badge sa lahat ng wika.
   if(tag)assert.equal(tag,'Recommended',`${lang} ${id}: badge`);
  }
  // Pareho ang teksto sa tatlong inirerekomenda at sa buong listahan.
  const rec=await read('#bPreset .presetButton[data-recommended="true"]');
  const byId=Object.fromEntries(all.map(r=>[r[0],r]));
  for(const[id,name,detail]of rec){
   assert.equal(name,byId[id][1],`${lang} ${id}: magkaiba ang pamagat sa dalawang grid`);
   assert.equal(detail,byId[id][2],`${lang} ${id}: magkaiba ang paglalarawan sa dalawang grid`);
  }
  // Ganoon din ang napiling card: hindi nagbabago ang teksto kapag napili.
  await p.locator(`#bPreset .presetButton[data-preset="inset-gallery"]`).click();await settle(p);
  const picked=await p.locator('#bPreset .presetButton[data-preset="inset-gallery"]').evaluate(n=>
   [n.getAttribute('aria-pressed'),n.querySelector('.presetName').textContent,n.querySelector('.presetDetail').textContent]);
  assert.deepEqual(picked,['true',APPROVED['inset-gallery'][0],APPROVED['inset-gallery'][lang==='en'?1:2]],lang);
  await c.close();
 }
});

await test('Each of the eight cards draws its own diagram, and the diagram matches what the renderer really does',async()=>{
 const{c,p}=await env();
 await step(p,3);await openAll(p);
 const seen=await p.locator('#bPreset .presetButton').evaluateAll(ns=>ns.map(n=>{
  const d=n.querySelector('.presetDiagram'),cs=getComputedStyle(d);
  const photo=getComputedStyle(d,'::before'),copy=getComputedStyle(d,'::after');
  return {id:n.dataset.preset,dir:cs.flexDirection,
   photoFlex:photo.flexGrow,copyFlex:copy.flexGrow,
   inset:photo.marginLeft,rule:copy.borderBottomWidth};
 }));
 assert.equal(seen.length,8);
 const by=Object.fromEntries(seen.map(x=>[x.id,x]));
 // Ang direksyon ng diagram ay tumutugma sa kung saan talaga inilalagay ng renderer ang larawan.
 assert.equal(by['split-left'].dir,'row');
 assert.equal(by['menu-band'].dir,'row');
 assert.equal(by['split-right'].dir,'row-reverse');
 assert.equal(by['stack-photo'].dir,'column');
 assert.equal(by['service-header'].dir,'column');
 assert.equal(by['stack-copy'].dir,'column-reverse');
 assert.equal(by['type-led'].dir,'column-reverse');
 assert.equal(by['inset-gallery'].dir,'column-reverse');
 // Mas manipis ang larawan ng Slim banner kaysa sa Photo header, gaya sa tunay na banner.
 assert(Number(by['service-header'].photoFlex)<Number(by['stack-photo'].photoFlex));
 // Naka-inset ang larawan ng Inset gallery, at ito lang.
 assert.notEqual(by['inset-gallery'].inset,'0px');
 for(const id of ['split-left','stack-photo','stack-copy'])assert.equal(by[id].inset,'0px',id);
 // May guhit sa diagram ang tatlong layout na talagang gumuguhit nito, at sila lang.
 const ruled=seen.filter(x=>parseFloat(x.rule)>0).map(x=>x.id).sort();
 assert.deepEqual(ruled,['menu-band','service-header','type-led'],JSON.stringify(ruled));
 // Walang dalawang card na parehong-pareho ang diagram.
 const shape=x=>[x.dir,x.photoFlex,x.copyFlex,x.inset,x.rule].join('|');
 assert.equal(new Set(seen.map(shape)).size,8,JSON.stringify(seen.map(shape)));
 await c.close();
});

await test('All eight layouts reach the preview and the exported PNG, and each exports different pixels',async()=>{
 const{c,p}=await env();
 await pickVisual(p,'pets-spotlight');
 await step(p,2);await p.locator('#bProduct').fill('Sample item');await p.locator('#bHeadline').fill('Your exact words');
 await p.locator('#bPrice').fill('₱200');await settle(p);
 await step(p,4);await p.locator('#bCtaChoice').selectOption('book');await settle(p);
 const layouts=await p.evaluate(async()=>{const{LAYOUTS}=await import('/banner-catalog.js');return LAYOUTS.map(l=>l.id);});
 const hashes={};
 for(const id of layouts){
  await step(p,3);await openAll(p);
  await pickLayout(p,id);await settle(p);
  await step(p,4);await preview(p);
  const file=path.join(out,`layout-${id}.png`);
  assert.deepEqual(await exportPNG(p,file),{w:1080,h:1080},id+': maling sukat');
  const bytes=fs.readFileSync(file);
  assert(bytes.length>8000,id+': masyadong maliit ang PNG');
  hashes[id]=require('node:crypto').createHash('sha256').update(bytes).digest('hex');
  await p.locator('#inspectClose').click();await settle(p);
 }
 assert.equal(new Set(Object.values(hashes)).size,8,'may dalawang layout na parehong PNG: '+JSON.stringify(hashes));
 fs.writeFileSync(path.join(out,'layout-hashes.json'),JSON.stringify(hashes,null,2));
 await c.close();
});

// Inaprubahan ng owner noong 2026-11-07, para sa Filipino at Taglish na setting.
const STYLE_LABELS_FIL={category:'Category Palette',brand:'Theme Colors',
 minimal:'Minimal \u2014 Off-White',luxury:'Refined \u2014 Dark & Gold',
 bold:'Bold \u2014 Deep Violet',tropical:'Natural \u2014 Green'};

await test('The collapse button reads correctly in each language, and no translation key is missing',async()=>{
 const EXPECT={en:['See all layouts \u00b7 8','Show recommended only'],
  fil:['Lahat ng layout \u00b7 8','Recommended layouts lang'],
  tl: ['Lahat ng layout \u00b7 8','Recommended layouts lang']};
 for(const lang of['en','fil','tl']){
  const{c,p}=await env({lang,width:360});
  await step(p,3);
  const more=p.locator('#bMoreLayouts');
  assert.equal((await more.textContent()).trim(),EXPECT[lang][0],lang+': sarado');
  await openLayouts(p);await settle(p);
  assert.equal((await more.textContent()).trim(),EXPECT[lang][1],lang+': bukas');
  // Hindi Ingles ang lumalabas sa Filipino at Tagalog.
  if(lang!=='en')assert.notEqual((await more.textContent()).trim(),EXPECT.en[1],lang+': Ingles ang bumagsak dito');
  await c.close();
 }
 // Walang nawawalang susi sa alinmang wika. Noong b24 ay may isang kulang pa
 // (wizardInvalidVisual); naisalin na ito, kaya wala nang pinapayagang butas.
 const{c,p}=await env();
 const gaps=await p.evaluate(async()=>{
  const{STRINGS}=await import('/banner-i18n.js?v=18');
  const miss=(a,b)=>Object.keys(a).filter(k=>!(k in b));
  return {filMissing:miss(STRINGS.en,STRINGS.fil),tlMissing:miss(STRINGS.en,STRINGS.tl),
   enMissing:[...new Set([...miss(STRINGS.fil,STRINGS.en),...miss(STRINGS.tl,STRINGS.en)])],
   dupes:Object.keys(STRINGS.en).length-new Set(Object.keys(STRINGS.en)).size};
 });
 assert.deepEqual(gaps.enMissing,[],JSON.stringify(gaps));
 assert.deepEqual(gaps.filMissing,[],JSON.stringify(gaps.filMissing));
 assert.deepEqual(gaps.tlMissing,[],JSON.stringify(gaps.tlMissing));
 await c.close();
});

await test('The design style labels are exact in Filipino, and the second one really follows the app theme rather than any colour the user supplies',async()=>{
 const{c,p}=await env({lang:'fil'});
 await step(p,3);
 // Ang unang option ay ang paanyaya; ang anim na estilo ang sinusuri rito.
 assert.equal((await p.locator('#bDesignStyle option').first().textContent()).trim(),'Pumili ng style');
 assert.equal(await p.locator('#bDesignStyle').inputValue(),'','may paunang napiling estilo');
 const shown=await p.locator('#bDesignStyle option:not([value=""])').evaluateAll(o=>o.map(n=>[n.value,n.textContent]));
 assert.deepEqual(shown,Object.entries(STYLE_LABELS_FIL));
 // Ang Category Palette ay tunay na mapipili pa rin.
 await p.locator('#bDesignStyle').selectOption('category');await settle(p);
 assert.equal(await p.locator('#bDesignStyle').inputValue(),'category');
 // Walang anumang paraan para magbigay ang user ng sariling kulay sa buong app.
 assert.equal(await p.locator('input[type="color"]').count(),0,'may color picker pala');
 // Ang "brand" ay sumusunod sa napiling tema sa Step 4: iba ang kulay kapag iba ang tema,
 // at tumutugma ito sa mismong halaga ng temang iyon - kaya Theme Colors ang tamang label.
 const paint=await p.evaluate(async()=>{
  const{palette}=await import('/banner-catalog.js?v=2'),{THEMES}=await import('/banner-render.js?v=6');
  return Object.keys(THEMES).map(id=>({id,
   got:palette('food','brand',THEMES[id]).paper,want:THEMES[id].bg[0],
   ignoresCategory:palette('luxury','brand',THEMES[id]).paper===palette('food','brand',THEMES[id]).paper}));
 });
 assert(paint.length>=4,JSON.stringify(paint));
 for(const x of paint){
  assert.equal(x.got,x.want,x.id+': hindi sinusunod ang tema');
  assert(x.ignoresCategory,x.id+': nakadepende pala sa kategorya');
 }
 assert.equal(new Set(paint.map(x=>x.got)).size,paint.length,'pareho ang kulay ng lahat ng tema');
 await c.close();
});

await test('The six design styles each paint a different banner and none repeats another',async()=>{
 const{c,p}=await env();
 await pickVisual(p,'food-spotlight');
 await step(p,2);await p.locator('#bProduct').fill('Sample item');await p.locator('#bHeadline').fill('Your exact words');await settle(p);
 await step(p,3);await p.locator('#bCategory').selectOption('food');await settle(p);
 const styles=await p.locator('#bDesignStyle option:not([value=""])').evaluateAll(o=>o.map(n=>[n.value,n.textContent.trim()]));
 assert.equal(styles.length,6);
 for(const[,label]of styles)assert(label.length>4,'maikling label: '+label);
 const seen={};
 for(const[id]of styles){
  await p.locator('#bDesignStyle').selectOption(id);await settle(p);
  seen[id]=await p.evaluate(()=>{const cv=document.querySelector('#bCanvas');
   const d=cv.getContext('2d',{willReadFrequently:true}).getImageData(0,0,cv.width,cv.height).data;
   let h=2166136261;for(let i=0;i<d.length;i+=4){h^=d[i]+d[i+1]*3+d[i+2]*7;h=Math.imul(h,16777619);}
   return (h>>>0).toString(16);});
 }
 assert.equal(new Set(Object.values(seen)).size,6,'may design style na pareho ang guhit: '+JSON.stringify(seen));
 await c.close();
});

await test('Back and Continue keep the Step 3 choice, and the choice survives a language change',async()=>{
 const{c,p}=await env();
 await pickVisual(p,'travel-scene');
 await step(p,2);await p.locator('#bProduct').fill('Island tour');await p.locator('#bHeadline').fill('Book your seat');await settle(p);
 await step(p,3);await p.locator('#bCategory').selectOption('travel');await settle(p);
 await openAll(p);await pickLayout(p,'inset-gallery');await settle(p);
 for(const n of[4,2,1,3,4,3]){await step(p,n);}
 assert.equal(await p.locator('#bCategory').inputValue(),'travel');
 assert.equal(await currentLayout(p),'inset-gallery');
 // Ang pagpapalit ng wika ay nagpapalit ng pangalan, hindi ng napili.
 const before=await currentLayout(p);
 await p.evaluate(()=>{localStorage.setItem('mgpref_lang','tl');window.dispatchEvent(new StorageEvent('storage',{key:'mgpref_lang',newValue:'tl'}));});
 await settle(p);
 assert.equal(await currentLayout(p),before,'nawala ang layout sa pagpapalit ng wika');
 assert.equal(await p.locator('#bCategory').inputValue(),'travel','nawala ang kategorya sa pagpapalit ng wika');
 await step(p,2);
 assert.equal(await p.locator('#bHeadline').inputValue(),'Book your seat');
 await c.close();
});

for(const lang of['en','fil','tl'])for(const theme of['light','dark'])
 await test(`Step 3 is usable at 360px in ${lang}/${theme}`,async()=>{
  const{c,p}=await env({width:360,lang,theme});
  await step(p,3);
  // Naisalin ang kategorya, ang layout at ang design style - walang naiwang English na label.
  const cats=await p.locator('#bCategory option:not([value=""])').evaluateAll(o=>o.map(n=>n.textContent.trim()));
  assert.equal(cats.length,21);
  for(const label of cats)assert(label.length>2,'blangkong kategorya');
  await openAll(p);
  const layouts=await p.locator('#bPreset .presetButton').evaluateAll(ns=>ns.map(n=>
   [n.dataset.preset,n.querySelector('.presetName').textContent.trim(),n.querySelector('.presetDetail').textContent.trim(),
    !!n.querySelector('.presetDiagram'),!!n.querySelector('.presetTag')]));
  assert.equal(layouts.length,8);
  // Bawat card sa buong listahan: may sariling diagram, pangalan at paglalarawan.
  for(const[id,name,detail,diagram]of layouts){
   assert(diagram,id+': walang diagram');
   assert(name.length>2,id+': walang pangalan');
   assert(detail.length>8,id+': walang paglalarawan');
  }
  assert.equal(new Set(layouts.map(l=>l[1])).size,8,'may dalawang layout na parehong pangalan');
  assert.equal(layouts.filter(l=>l[4]).length,3,'hindi tatlo ang may tatak na Recommended');
  const styles=await p.locator('#bDesignStyle option:not([value=""])').evaluateAll(o=>o.map(n=>n.textContent.trim()));
  assert.equal(new Set(styles).size,6);
  // Tunay na button, umaabot sa 44px, at walang pahalang na pag-apaw.
  for(let i=0;i<3;i++){
   const btn=p.locator('#bPreset .presetButton[data-recommended="true"]').nth(i);
   assert.equal(await btn.evaluate(n=>n.tagName),'BUTTON');
   assert(['true','false'].includes(await btn.getAttribute('aria-pressed')));
   const box=await btn.boundingBox();
   assert(box.height>=44,`${lang}/${theme} card ${i}: ${box.height}px lang`);
  }
  // Bumabalot ang teksto, hindi naputol: walang nag-aapaw at kasya ang lahat sa card.
  const fit=await p.locator('#bPreset .presetButton').evaluateAll(ns=>ns.map(n=>{
   const t=n.querySelector('.presetText'),d=n.querySelector('.presetDetail');
   return {id:n.dataset.preset,overX:t.scrollWidth-t.clientWidth,overY:n.scrollHeight-n.clientHeight,
    lines:Math.round(d.getBoundingClientRect().height/parseFloat(getComputedStyle(d).lineHeight)),
    right:Math.round(n.getBoundingClientRect().right)};
  }));
  for(const f of fit){
   assert(f.overX<=1,`${lang}/${theme} ${f.id}: lumalabas ang teksto sa card (${f.overX}px)`);
   assert(f.overY<=1,`${lang}/${theme} ${f.id}: naputol ang card (${f.overY}px)`);
   assert(f.lines<=3,`${lang}/${theme} ${f.id}: ${f.lines} linya ang paglalarawan`);
   assert(f.right<=360,`${lang}/${theme} ${f.id}: lumampas sa 360px`);
  }
  assert(await p.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),`${lang}/${theme}: umapaw ang pahina`);
  await c.close();
 });

await test('Nothing in Step 3 reaches the network or writes anything',async()=>{
 const{c,p}=await env();
 await pickVisual(p,'creative-pattern');
 await step(p,2);await p.locator('#bProduct').fill('Photo studio');await p.locator('#bHeadline').fill('Book a shoot');await settle(p);
 await step(p,3);await p.locator('#bCategory').selectOption('arts');
 await openAll(p);await pickLayout(p,'type-led');
 await p.locator('#bDesignStyle').selectOption('luxury');await settle(p);
 await step(p,4);await preview(p);
 await c.close();
});

for(const e of contexts){assert.deepEqual(e.errors,[]);assert.deepEqual(e.external,[]);assert.deepEqual(e.writes,[]);}
fs.writeFileSync(path.join(out,'step3-results.json'),JSON.stringify({result:'PASS',results,
 categories:21,layouts:8,styles:6,
 auth:'Mocked services; emulated viewports only - no physical Android device'},null,2));
}finally{await b.close()}})().catch(e=>{console.error(e);process.exitCode=1});
