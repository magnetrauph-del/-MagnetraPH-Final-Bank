// Quick Business Setup (Phase 2A): dalawang tanong, muling gamit ng kategorya, at ang
// pagpasa sa umiiral na wizard. Walang tuntunin ng pagsusuri na nakabatay sa uri - estado
// at kontrata lang muna iyon; sa susunod na yugto ang validation.
// Start: python -m http.server 8876 --bind 127.0.0.1 --directory public
const{chromium}=require('playwright'),assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path');
const{env:makeEnv,step,settle,completeSetup,resetSelect,pickVisual}=require('./fixtures/banner-wizard.cjs');
const out=process.env.MAGNETRA_SETUP_ARTIFACTS||'/tmp/magnetra-setup';fs.mkdirSync(out,{recursive:true});
const results=[],contexts=[];let b;
async function env(o){const e=await makeEnv(b,o);contexts.push(e);return e;}
async function test(name,run){await run();results.push({name,result:'PASS'});console.log('PASS',name);}

const AD_TYPES=['physical','digital','service','promo'];
// 21 business category -> visual category. Ang limang hindi nabanggit (construction,
// transport, finance, community, abstract) ay naaabot pa rin sa kontrol ng Step 1.
const MAP={ecommerce:'retail',food:'food',beauty:'beauty',fashion:'retail',luxury:'retail',
 electronics:'technology',home:'home',services:'professional',property:'realestate',
 fitness:'health',education:'education',travel:'travel',automotive:'automotive',
 agriculture:'agriculture',pets:'pets',events:'events',grocery:'retail',b2b:'professional',
 digital:'technology',arts:'creative',other:'other'};
const COPY={
 en:{title:'Quick Business Setup',q1:'What kind of business do you run?',
     q2:'What do you want to advertise?',change:'Change',saved:'Business'},
 fil:{title:'Quick Business Setup',q1:'Anong uri ng negosyo mo?',
     q2:'Ano ang gusto mong i-advertise?',change:'Palitan',saved:'Business'},
 tl:{title:'Mabilisang Setup ng Negosyo',q1:'Anong uri ng negosyo mo?',
     q2:'Ano ang gusto mong i-advertise?',change:'Palitan',saved:'Negosyo'},
};
const adNames={physical:'Physical Product',digital:'Digital Product',service:'Service',promo:'General Promotion'};
const dot=(p,n)=>p.locator(`.stepDot[data-progress="${n}"]`).getAttribute('data-state');
const inSetup=p=>p.evaluate(()=>document.getElementById('main').dataset.phase==='setup');

(async()=>{b=await chromium.launch();try{

await test('A first-time setup asks both questions, preselects nothing, and will not pass until both are answered',async()=>{
 const{p}=await env({setup:false});
 assert(await inSetup(p),'hindi setup ang unang nakikita');
 // Nakatago ang wizard habang nasa setup, pero nakahanda na ito sa ilalim.
 for(const sel of['.wizardProgress','#bStep1','#bStep2','#bStep3','#bStep4'])
  assert.equal(await p.locator(sel).evaluate(n=>getComputedStyle(n).display),'none',sel+' nakikita pa');
 const fresh=await p.evaluate(()=>({cat:document.getElementById('bSetupCategory').value,
  picked:[...document.querySelectorAll('#bSetupTypes [data-ad-type]')]
   .filter(x=>x.getAttribute('aria-checked')==='true').length,
  cards:document.querySelectorAll('#bSetupTypes [data-ad-type]').length,
  savedHidden:document.getElementById('bSetupSaved').hidden}));
 assert.equal(fresh.cat,'','may pinilit na kategorya');
 assert.equal(fresh.picked,0,'may pinilit na uri');
 assert.equal(fresh.cards,4,'hindi apat ang uri');
 assert.equal(fresh.savedHidden,true,'may naka-save kahit bagong gumagamit');
 // Walang sagot: hindi pumapasa, at may sinasabing dahilan.
 await p.locator('#bSetupContinue').click();await settle(p);
 assert(await inSetup(p),'pumasa nang walang sagot');
 assert(await p.locator('#bStudioError').isVisible(),'walang mensahe');
 const needCat=(await p.locator('#bStudioError').textContent()).trim();
 assert(needCat.length>0);
 // Kategorya lang: hindi pa rin pumapasa, at nagbago ang dahilan.
 await p.locator('#bSetupCategory').selectOption('food');await settle(p);
 await p.locator('#bSetupContinue').click();await settle(p);
 assert(await inSetup(p),'pumasa nang walang uri');
 const needType=(await p.locator('#bSetupError, #bStudioError').first().textContent()).trim();
 assert.notEqual(needType,needCat,'pareho ang mensahe para sa dalawang kulang');
 // Pareho na: pumapasa.
 await p.locator('#bSetupTypes [data-ad-type="service"]').click();await settle(p);
 await p.locator('#bSetupContinue').click();
 await p.locator('#bStep1').waitFor({state:'visible'});
 assert.equal(await inSetup(p),false,'nasa setup pa rin');
 assert.equal(await p.locator('.wizardProgress').evaluate(n=>getComputedStyle(n).display)==='none',false);
});

await test('All four advertisement types are selectable, exclusive, and reachable from the keyboard',async()=>{
 for(const id of AD_TYPES){
  const{p}=await env({setup:false});
  await p.locator(`#bSetupTypes [data-ad-type="${id}"]`).click();await settle(p);
  const state=await p.evaluate(()=>[...document.querySelectorAll('#bSetupTypes [data-ad-type]')]
   .map(x=>[x.dataset.adType,x.getAttribute('aria-checked')]));
  assert.deepEqual(state.filter(([,c])=>c==='true').map(([k])=>k),[id],id+': hindi eksklusibo');
  // Ang pangalan ay English sa tatlong wika - label ng kategorya ito, gaya ng layout.
  const name=await p.locator(`#bSetupTypes [data-ad-type="${id}"] .setupCardName`).textContent();
  assert.equal(name.trim(),adNames[id],id+': mali ang pangalan');
  const desc=await p.locator(`#bSetupTypes [data-ad-type="${id}"] .setupCardDesc`).textContent();
  assert(desc.trim().length>20,id+': walang paliwanag');
 }
 // Keyboard: arrow ang pumipili, at Enter ang nagpapasok.
 const{p}=await env({setup:false});
 await p.locator('#bSetupTypes [data-ad-type="physical"]').focus();
 await p.keyboard.press('Enter');await settle(p);
 assert.equal(await p.locator('#bSetupTypes [data-ad-type="physical"]').getAttribute('aria-checked'),'true');
 await p.keyboard.press('ArrowRight');await settle(p);
 assert.equal(await p.locator('#bSetupTypes [data-ad-type="digital"]').getAttribute('aria-checked'),'true','hindi gumana ang arrow');
 assert.equal(await p.evaluate(()=>document.activeElement.dataset.adType),'digital','hindi sumunod ang focus');
 await p.keyboard.press('ArrowLeft');await settle(p);
 assert.equal(await p.locator('#bSetupTypes [data-ad-type="physical"]').getAttribute('aria-checked'),'true');
 // Nakikitang focus, at radiogroup ang semantics.
 const ring=await p.evaluate(()=>{const n=document.activeElement,s=getComputedStyle(n);
  return{role:n.getAttribute('role'),outline:s.outlineStyle,width:parseFloat(s.outlineWidth),
   group:n.closest('[role="radiogroup"]')?.getAttribute('aria-labelledby')};});
 assert.equal(ring.role,'radio');
 assert.equal(ring.group,'bSetupQ2','walang radiogroup na label');
});

await test('A returning visitor is not asked for the category again, but is always asked what to advertise',async()=>{
 const{p,c}=await env({setup:false});
 await completeSetup(p,{category:'pets',adType:'service'});
 assert.equal(await p.locator('#bCategory').inputValue(),'pets');
 // Parehong device, bagong pagbukas: naaalala ang kategorya.
 const p2=await c.newPage();
 await p2.goto(await p.url());await p2.locator('#app').waitFor({state:'visible'});
 await p2.locator('#bSetup').waitFor({state:'visible'});
 const again=await p2.evaluate(()=>({
  askHidden:document.getElementById('bSetupCatField').hidden,
  savedHidden:document.getElementById('bSetupSaved').hidden,
  savedName:document.getElementById('bSetupSavedName').textContent.trim(),
  picked:[...document.querySelectorAll('#bSetupTypes [data-ad-type]')]
   .filter(x=>x.getAttribute('aria-checked')==='true').length}));
 assert.equal(again.askHidden,true,'itinanong muli ang kategorya');
 assert.equal(again.savedHidden,false,'hindi ipinakita ang naka-save');
 assert.equal(again.savedName,'Pets & Animal Care','mali ang ipinakitang kategorya');
 // Ang uri ay HINDI naiimbak: itinatanong sa bawat bagong banner.
 assert.equal(again.picked,0,'naalala ang uri ng ina-advertise');
 await p2.locator('#bSetupContinue').click();await settle(p2);
 assert(await inSetup(p2),'pumasa nang walang bagong uri');
 await p2.close();
});

await test('The saved category can be changed, and the change is what the wizard receives',async()=>{
 const{p,c}=await env({setup:false});
 await completeSetup(p,{category:'food',adType:'physical'});
 const p2=await c.newPage();
 await p2.goto(await p.url());await p2.locator('#app').waitFor({state:'visible'});
 await p2.locator('#bSetup').waitFor({state:'visible'});
 // Ang Palitan ay nagbabalik ng tanong at hindi binubura ang luma hangga't walang bago.
 await p2.locator('#bSetupChange').click();await settle(p2);
 assert.equal(await p2.locator('#bSetupCatField').isHidden(),false,'hindi bumalik ang tanong');
 assert.equal(await p2.locator('#bSetupCategory').inputValue(),'food','nabura ang luma agad');
 assert.equal(await p2.evaluate(()=>document.activeElement.id),'bSetupCategory','hindi dumako ang focus');
 await p2.locator('#bSetupCategory').selectOption('beauty');
 await p2.locator('#bSetupTypes [data-ad-type="service"]').click();
 await p2.locator('#bSetupContinue').click();
 await p2.locator('#bStep1').waitFor({state:'visible'});
 await step(p2,3);
 assert.equal(await p2.locator('#bCategory').inputValue(),'beauty','hindi naipasa ang bago');
 await p2.close();
});

await test('Every one of the 21 categories hands the wizard a real design set, and the five unmapped sets stay reachable',async()=>{
 const{p}=await env({setup:false});
 const ids=await p.locator('#bSetupCategory').evaluate(n=>[...n.options].map(o=>o.value).filter(Boolean));
 assert.equal(ids.length,21,'hindi 21 ang kategorya');
 assert.deepEqual(ids.slice().sort(),Object.keys(MAP).slice().sort(),'nagbago ang mga id');
 // Ang bawat tinuturo ay tunay na visual category.
 const visualIds=await p.locator('#bVisualCategory').evaluate(n=>[...n.options].map(o=>o.value).filter(Boolean));
 for(const [cat,vc] of Object.entries(MAP))
  assert(visualIds.includes(vc),`${cat} -> ${vc}: wala sa katalogo`);
 // Ang limang hindi nabanggit ay naaabot pa rin, kaya walang nawawalang pagpipilian.
 for(const extra of['construction','transport','finance','community','abstract'])
  assert(visualIds.includes(extra),extra+': hindi na naaabot');
 assert.equal(visualIds.length,22,'hindi 22 ang visual category');
 // Tatlong halimbawa, buong daan: naipapasa ang tamang set, at tatlong mungkahi ito.
 for(const[cat,vc]of[['food','food'],['arts','creative'],['grocery','retail']]){
  const{p:q}=await env({setup:false});
  await completeSetup(q,{category:cat,adType:'physical'});
  assert.equal(await q.locator('#bVisualCategory').inputValue(),vc,`${cat}: mali ang design set`);
  assert.equal(await q.locator('#bVisualPicks .visualBtn').count(),3,`${cat}: hindi tatlo ang mungkahi`);
  // Walang pinipili para sa tao: nananatiling kailangan niyang pumili.
  assert.equal(await q.locator('#bVisualPicks .visualBtn[aria-pressed="true"]').count(),0,
   `${cat}: may pinili nang visual para sa tao`);
  assert.equal(await dot(q,1),'pending',`${cat}: kumpleto ang Step 1 nang walang pinili`);
 }
});

await test('The setup copy is right in all three languages, and switching language keeps every answer',async()=>{
 for(const lang of['en','fil','tl']){
  const{p}=await env({lang,setup:false});
  const got=await p.evaluate(()=>({
   title:document.getElementById('bSetupTitle').textContent.trim(),
   q1:document.querySelector('label[for="bSetupCategory"]').textContent.trim(),
   q2:document.getElementById('bSetupQ2').textContent.trim(),
   intro:document.querySelector('#bSetup .stepIntro').textContent.trim()}));
  assert.equal(got.title,COPY[lang].title,lang+' title');
  assert.equal(got.q1,COPY[lang].q1,lang+' q1');
  assert.equal(got.q2,COPY[lang].q2,lang+' q2');
  assert(got.intro.length>20,lang+': walang paliwanag');
  // Ang pangalan ng apat na uri ay English sa tatlo; isinasalin ang paliwanag.
  for(const id of AD_TYPES)
   assert.equal((await p.locator(`#bSetupTypes [data-ad-type="${id}"] .setupCardName`).textContent()).trim(),
    adNames[id],`${lang} ${id}: isinalin ang pangalan`);
 }
 // Paglipat ng wika sa loob ng setup: nananatili ang dalawang sagot.
 const{p}=await env({setup:false});
 await p.locator('#bSetupCategory').selectOption('travel');
 await p.locator('#bSetupTypes [data-ad-type="promo"]').click();await settle(p);
 for(const lang of['tl','en','fil']){
  await p.evaluate(l=>{localStorage.setItem('mgpref_lang',l);
   window.dispatchEvent(new StorageEvent('storage',{key:'mgpref_lang',newValue:l}));},lang);
  await settle(p);
  assert.equal(await p.locator('#bSetupCategory').inputValue(),'travel',lang+': nawala ang kategorya');
  assert.equal(await p.locator('#bSetupTypes [data-ad-type="promo"]').getAttribute('aria-checked'),'true',
   lang+': nawala ang uri');
  assert.equal(await p.locator('#bSetupTitle').textContent(),COPY[lang].title,lang+': hindi nagbago ang teksto');
 }
 // At pagkatapos pumasok, nananatili rin ang nilagay.
 await p.locator('#bSetupContinue').click();await p.locator('#bStep1').waitFor({state:'visible'});
 await step(p,2);await p.locator('#bProduct').fill('Tinapay ni Nanay');await settle(p);
 await p.evaluate(()=>{localStorage.setItem('mgpref_lang','tl');
  window.dispatchEvent(new StorageEvent('storage',{key:'mgpref_lang',newValue:'tl'}));});
 await settle(p);
 assert.equal(await p.locator('#bProduct').inputValue(),'Tinapay ni Nanay','nawala ang nilagay');
 await step(p,3);
 assert.equal(await p.locator('#bCategory').inputValue(),'travel','nawala ang kategorya');
});

await test('The saved category lives beside the Business Profile, so editing one never erases the other',async()=>{
 const{p}=await env({setup:false});
 // Isang v1 na profile, gaya ng naka-save na ng umiiral nang gumagamit.
 await p.evaluate(()=>localStorage.setItem('mag_bizprofile',
  JSON.stringify({v:1,name:'Panaderia ni Nanay',contact:'0917 000 0000'})));
 const state=await p.evaluate(async()=>{
  const m=await import('/local-state.js?v=3');
  const before=m.readBusinessProfile();
  m.saveBusinessCategory('pets');
  const afterCat=m.readBusinessProfile();
  const cat=m.readBusinessCategory();
  // Ganito nagsasave ang dashboard: { name, contact } lang, walang kategorya.
  m.saveBusinessProfile({name:'Panaderia ni Nanay',contact:'0917 000 0000'});
  return {before,afterCat,cat,catAfterProfileSave:m.readBusinessCategory(),
   profileAfter:m.readBusinessProfile(),
   keys:Object.keys(localStorage).filter(k=>k.startsWith('mag_')).sort()};
 });
 // Nababasa pa rin ang v1 na profile - walang migration, walang nasira.
 assert.deepEqual(state.before,{name:'Panaderia ni Nanay',contact:'0917 000 0000'},'nasira ang v1 na profile');
 assert.deepEqual(state.afterCat,state.before,'ginalaw ng kategorya ang profile');
 assert.equal(state.cat,'pets','hindi naimbak ang kategorya');
 // Ito ang mismong dahilan ng hiwalay na key: hindi nabubura ng pag-edit sa dashboard.
 assert.equal(state.catAfterProfileSave,'pets','nabura ng pag-save ng profile ang kategorya');
 assert.deepEqual(state.profileAfter,state.before,'nabago ang profile');
 assert.deepEqual(state.keys,['mag_bizcategory','mag_bizprofile'],'mali ang mga key: '+state.keys);
 // Ang hindi kilalang id ay hindi pinipilit sa tao.
 const bogus=await p.evaluate(async()=>{
  const m=await import('/local-state.js?v=3');
  m.saveBusinessCategory('not-a-real-category-id');
  const stored=m.readBusinessCategory();
  m.saveBusinessCategory('');
  return {stored,cleared:m.readBusinessCategory()};
 });
 assert.equal(bogus.stored,'not-a-real-category-id','hindi naimbak ang hilaw na id');
 assert.equal(bogus.cleared,null,'hindi nabubura');
 await p.reload();await p.locator('#bSetup').waitFor({state:'visible'});
 assert.equal(await p.locator('#bSetupCatField').isHidden(),false,
  'ipinakita ang hindi kilalang id bilang naka-save na kategorya');
});

await test('Setup fits an Android screen in both themes, and its motion respects the reduced-motion setting',async()=>{
 for(const theme of['light','dark'])for(const lang of['en','fil','tl']){
  const{p}=await env({lang,theme,width:360,setup:false});
  const m=await p.evaluate(()=>{
   const bad=[];
   for(const e of document.querySelectorAll('#bSetup label,#bSetup p,#bSetup select,#bSetup button')){
    const r=e.getBoundingClientRect();
    if(r.width===0&&r.height===0)continue;
    if(r.right>360.5||r.left<-0.5)bad.push((e.id||e.className)+' right='+r.right.toFixed(1));
   }
   const card=document.querySelector('#bSetupTypes [data-ad-type]').getBoundingClientRect();
   return {bad,scrollW:document.documentElement.scrollWidth,
    clientW:document.documentElement.clientWidth,cardH:card.height,
    contBox:document.getElementById('bSetupContinue').getBoundingClientRect().height};
  });
  assert.deepEqual(m.bad,[],`${lang}/${theme}: lumabas sa 360px`);
  assert.equal(m.scrollW,m.clientW,`${lang}/${theme}: may horizontal scroll`);
  assert(m.cardH>=48,`${lang}/${theme}: ${m.cardH}px lang ang card`);
  assert(m.contBox>=44,`${lang}/${theme}: maliit ang Continue`);
 }
 // Naka-reduce ang fixture, kaya walang animation ang panel dito.
 const{p}=await env({width:360,setup:false});
 const still=await p.locator('#bSetup').evaluate(n=>getComputedStyle(n).animationName);
 assert.equal(still,'none','may animation kahit reduced motion');
 // Sa context na may galaw, may tunay na entrance.
 const c2=await b.newContext({viewport:{width:360,height:844},serviceWorkers:'block'});
 contexts.push({c:c2,errors:[],external:[],writes:[]});
 const{install,base}=require('./fixtures/account.cjs');
 await install(c2,{lang:'fil',theme:'light'});
 const q=await c2.newPage();
 await q.goto(base+'/banner.html');await q.locator('#bSetup').waitFor({state:'visible'});
 const moving=await q.locator('#bSetup').evaluate(n=>{const s=getComputedStyle(n);
  return{name:s.animationName,ms:s.animationDuration};});
 assert.equal(moving.name,'mgStepIn','walang entrance sa setup');
 assert.equal(moving.ms,'0.22s','mali ang tagal ng entrance');
});

await test('Setup makes no network request, and the four-step wizard still renders a banner end to end',async()=>{
 const{p,external,writes}=await env({setup:false});
 await completeSetup(p,{category:'food',adType:'physical'});
 await pickVisual(p,'food-spotlight');
 await step(p,2);await p.locator('#bProduct').fill('Pandesal');
 await p.locator('#bHeadline').fill('Mainit at bago');await settle(p);
 await step(p,4);
 await p.locator('#bGenerate').click();
 await p.locator('#inspectDialog').waitFor({state:'visible',timeout:15000});
 const size=await p.evaluate(()=>{const c=document.getElementById('bCanvas');return[c.width,c.height];});
 assert.deepEqual(size,[1080,1080],'hindi gumuhit ng banner');
 await p.locator('#inspectClose').click();await settle(p);
 // Walang papalabas na kahilingan at walang isinusulat sa server.
 assert.deepEqual(external,[],'may panlabas na kahilingan: '+JSON.stringify(external));
 assert.deepEqual(writes,[],'may isinulat sa server: '+JSON.stringify(writes));
});

for(const e of contexts){assert.deepEqual(e.errors,[]);assert.deepEqual(e.external||[],[]);assert.deepEqual(e.writes||[],[]);}
assert.equal(results.length,9,'nawala ang isang test: '+results.length);
fs.writeFileSync(path.join(out,'setup-results.json'),JSON.stringify({result:'PASS',results,
 categories:21,visualCategories:22,adTypes:AD_TYPES.length,
 persistence:'mag_bizcategory (hiwalay sa mag_bizprofile; walang migration)',
 auth:'Mocked services; emulated viewports only - no physical Android device'},null,2));
}finally{await b.close()}})().catch(e=>{console.error(e);process.exitCode=1});
