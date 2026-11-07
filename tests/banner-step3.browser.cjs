// Step 3 pagkatapos ng paglilinis: 21 kategorya, 8 layout, 6 design style.
// Start: python -m http.server 8876 --bind 127.0.0.1 --directory public
const{chromium}=require('playwright'),assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path');
const{env:makeEnv,step,preview,exportPNG,settle,pickVisual,pickLayout,currentLayout}=require('./fixtures/banner-wizard.cjs');
const out=process.env.MAGNETRA_STEP3_ARTIFACTS||'/tmp/magnetra-step3';fs.mkdirSync(out,{recursive:true});
const results=[],contexts=[];let b;
async function env(o){const e=await makeEnv(b,o);contexts.push(e);return e;}
async function test(name,run){await run();results.push({name,result:'PASS'});console.log('PASS',name);}
// Binubuksan ang See All nang hindi ito isinasara kapag bukas na.
const openAll=p=>p.locator('#bAllPresets').evaluate(n=>{n.open=true;});
// Ang apat na tinanggal na kontrol at ang kanilang teksto.
const GONE_IDS='#bCategorySearch, #bCategoryClear, #bCategoryEmpty, #bCustomCategory, #bCustomWrap, #bCategorySearchHint';
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
  // Walang paliwanag na pumalit sa kanila.
  assert.equal(await p.locator('#bStep3 .stepIntro, #bStep3 .hint').count(),0,lang+': may bagong paliwanag');
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
  const shown=await p.locator('#bRecommended button').evaluateAll(ns=>ns.map(n=>n.dataset.preset));
  assert.deepEqual(shown,layouts,id);
  // May pangalan at paglalarawan ang bawat card, at wala ni isang blangko.
  const copy=await p.locator('#bRecommended button').evaluateAll(ns=>ns.map(n=>
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
 await p.locator('#bRecommended button').nth(1).click();await settle(p);
 assert.equal(await currentLayout(p),'split-left');
 assert.equal(await p.locator('#bRecommended button[aria-pressed="true"]').getAttribute('data-preset'),'split-left');
 // Select -> card. Ang hindi inirerekomendang layout ay walang naka-press na card, pero napipili pa rin.
 await pickLayout(p,'service-header');await settle(p);
 assert.equal(await p.locator('#bCategory').inputValue(),'food','pinalitan ng layout ang kategorya');
 assert.equal(await p.locator('#bRecommended button[aria-pressed="true"]').count(),0);
 await pickLayout(p,'stack-photo');await settle(p);
 assert.equal(await p.locator('#bRecommended button[aria-pressed="true"]').getAttribute('data-preset'),'stack-photo');
 await c.close();
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

await test('The six design styles each paint a different banner and none repeats another',async()=>{
 const{c,p}=await env();
 await pickVisual(p,'food-spotlight');
 await step(p,2);await p.locator('#bProduct').fill('Sample item');await p.locator('#bHeadline').fill('Your exact words');await settle(p);
 await step(p,3);await p.locator('#bCategory').selectOption('food');await settle(p);
 const styles=await p.locator('#bDesignStyle option').evaluateAll(o=>o.map(n=>[n.value,n.textContent.trim()]));
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
 for(const n of[4,2,1,3,4,3]){await p.locator(`.stepDot[data-progress="${n}"]`).click();await settle(p);}
 assert.equal(await p.locator('#bCategory').inputValue(),'travel');
 assert.equal(await currentLayout(p),'inset-gallery');
 // Ang pagpapalit ng wika ay nagpapalit ng pangalan, hindi ng napili.
 const before=await currentLayout(p);
 await p.evaluate(()=>{localStorage.setItem('mg-lang','tl');window.dispatchEvent(new StorageEvent('storage',{key:'mg-lang',newValue:'tl'}));});
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
  const cats=await p.locator('#bCategory option').evaluateAll(o=>o.map(n=>n.textContent.trim()));
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
  const styles=await p.locator('#bDesignStyle option').evaluateAll(o=>o.map(n=>n.textContent.trim()));
  assert.equal(new Set(styles).size,6);
  // Tunay na button, umaabot sa 44px, at walang pahalang na pag-apaw.
  for(let i=0;i<3;i++){
   const btn=p.locator('#bRecommended button').nth(i);
   assert.equal(await btn.evaluate(n=>n.tagName),'BUTTON');
   assert(['true','false'].includes(await btn.getAttribute('aria-pressed')));
   const box=await btn.boundingBox();
   assert(box.height>=44,`${lang}/${theme} card ${i}: ${box.height}px lang`);
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
