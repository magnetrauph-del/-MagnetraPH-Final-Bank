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
// b30: ang pamagat at ang pindutang pampatuloy ay binago ng owner noong 2026-11-09.
const COPY={
 en:{title:'Business Setup',q1:'What kind of business do you run?',
     q2:'What do you want to advertise?',change:'Change',saved:'Business',
     go:'Start Banner Studio',done:'Setup Complete'},
 fil:{title:'Business Setup',q1:'Anong uri ng negosyo mo?',
     q2:'Ano ang gusto mong i-advertise?',change:'Palitan',saved:'Business',
     go:'Simulan ang Banner Studio',done:'Handa na ang Banner Studio mo'},
 tl:{title:'Setup ng Negosyo',q1:'Anong uri ng negosyo mo?',
     q2:'Ano ang gusto mong i-advertise?',change:'Palitan',saved:'Negosyo',
     go:'Simulan ang Banner Studio',done:'Handa na ang Banner Studio mo'},
};
const adNames={physical:'Physical Product',digital:'Digital Product',service:'Service',promo:'General Promotion'};
const dot=(p,n)=>p.locator(`.stepDot[data-progress="${n}"]`).getAttribute('data-state');
const inSetup=p=>p.evaluate(()=>document.getElementById('main').dataset.phase==='setup');

(async()=>{b=await chromium.launch({executablePath:'/usr/bin/chromium',args:['--no-sandbox']});try{

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
   intro:document.querySelector('#bSetup .setupIntro').textContent.trim(),
   brand:document.querySelector('#bSetup .setupBrand').textContent.trim(),
   go:document.getElementById('bSetupGoLabel').textContent.trim()}));
  assert.equal(got.title,COPY[lang].title,lang+' title');
  assert.equal(got.q1,COPY[lang].q1,lang+' q1');
  assert.equal(got.q2,COPY[lang].q2,lang+' q2');
  assert(got.intro.length>20,lang+': walang paliwanag');
  assert.equal(got.brand,'Pro Max Banner Studio',lang+': mali ang brand line');
  assert.equal(got.go,COPY[lang].go,lang+': mali ang pindutan');
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

/* ---------- b30 - Phase 2A.1: premium polish ---------- */

// Ang galaw ay kailangan sa dalawang test sa ibaba: sa reduced motion ay walang
// kumpirmasyong makikita dahil diretso na ang paglipat.
async function moving(o={}){
 const{install,base}=require('./fixtures/account.cjs');
 const c=await b.newContext({viewport:{width:o.width||390,height:844},deviceScaleFactor:1,serviceWorkers:'block'});
 const external=await install(c,{lang:o.lang||'en',theme:o.theme||'light'}),errors=[],writes=[];
 const q=await c.newPage();
 q.on('pageerror',e=>errors.push(e.message));
 q.on('console',m=>{if(m.type()==='error')errors.push(m.text());});
 q.on('request',r=>{if(!['GET','HEAD'].includes(r.method()))writes.push(r.method()+' '+r.url())});
 if(o.init)await q.addInitScript(o.init);
 // Tunay na pagkabigo ng network, hindi pekeng pagtatago: hinaharang ang file bago pa
 // ito maabot, kaya ang mismong error handler ng larawan ang nasusubok.
 if(o.abort)await c.route(o.abort,r=>r.abort('failed'));
 await q.goto(base+'/banner.html');await q.locator('#bSetup').waitFor({state:'visible'});
 contexts.push({c,errors,external,writes});
 return{p:q,errors,writes};
}

await test('The four cards carry a real photograph in the circle, stay compact, and the mark fills only once a type is chosen',async()=>{
 const{p}=await env({width:360,setup:false});
 const cards=await p.evaluate(()=>[...document.querySelectorAll('#bSetupTypes [data-ad-type]')].map(c=>{
  const r=c.getBoundingClientRect(),mark=c.querySelector('.setupCardMark');
  const ms=getComputedStyle(mark),mr=mark.getBoundingClientRect();
  // Bawat bilog na malaki at walang laman sa loob ng card - iyon ang pinatanggal.
  const hollow=[...c.querySelectorAll('*')].filter(n=>{
   const st=getComputedStyle(n),b=n.getBoundingClientRect();
   return /50%|9999px/.test(st.borderRadius)&&b.width>=36&&!n.textContent.trim()&&!n.querySelector('img,picture');
  }).length;
  return{id:c.dataset.adType,h:Math.round(r.height),
   name:c.querySelectorAll('.setupCardName').length,desc:c.querySelectorAll('.setupCardDesc').length,
   marks:c.querySelectorAll('.setupCardMark').length,imgs:c.querySelectorAll('img').length,
   hollow,markW:Math.round(mr.width),markBg:ms.backgroundColor,markInk:ms.color,
   checked:c.getAttribute('aria-checked')};
 }));
 assert.equal(cards.length,4);
 for(const c of cards){
  assert.equal(c.name,1,c.id+': hindi isa ang pangalan');
  assert.equal(c.desc,1,c.id+': hindi isa ang paliwanag');
  assert.equal(c.marks,1,c.id+': hindi isa ang tanda');
  assert.equal(c.imgs,1,c.id+': hindi isa ang larawan');
  // Walang bilog na walang laman: bawat malaking bilog ay may tunay na larawan sa loob.
  assert.equal(c.hollow,0,c.id+': may malaking bilog na walang laman');
  assert.equal(c.markW,24,c.id+': hindi 24px ang tanda - hindi ito puwesto ng larawan');
  assert.equal(c.markInk,'rgba(0, 0, 0, 0)',c.id+': may check kahit walang pinili');
  assert.equal(c.markBg,'rgba(0, 0, 0, 0)',c.id+': puno ang tanda kahit walang pinili');
  assert.equal(c.checked,'false',c.id+': may pinilit na pinili');
  // Compact pa rin kahit may larawan: hindi lumalaki nang higit sa taas ng larawan
  // kasama ang padding at ang tatlong linyang paliwanag.
  assert(c.h>=56&&c.h<=116,c.id+': hindi compact ang taas - '+c.h+'px');
 }
 // Pagpili: dito lang napupuno ang tanda.
 await p.locator('#bSetupTypes [data-ad-type="service"]').focus();
 await p.keyboard.press('Enter');await settle(p);
 const after=await p.evaluate(()=>{const c=document.querySelector('#bSetupTypes [data-ad-type="service"]');
  const ms=getComputedStyle(c.querySelector('.setupCardMark'));
  return{checked:c.getAttribute('aria-checked'),bg:ms.backgroundColor,ink:ms.color};});
 assert.equal(after.checked,'true','hindi naitala ang pagpili');
 assert.notEqual(after.bg,'rgba(0, 0, 0, 0)','walang laman ang tanda matapos pumili');
 assert.notEqual(after.ink,'rgba(0, 0, 0, 0)','walang check matapos pumili');
});

await test('The header Help opens Business Setup Help on setup, and the four-step Help once inside the wizard',async()=>{
 const{p}=await env({setup:false});
 await p.locator('#helpBtn').click();
 await p.locator('#ctxHelp').waitFor({state:'visible'});
 const onSetup=await p.evaluate(()=>({title:document.getElementById('ctxHelpTitle').textContent.trim(),
  setup:!document.getElementById('bHelpSetup').hidden,
  choices:!document.getElementById('bHelpChoices').hidden,
  faq:!document.getElementById('bHelpFaq').hidden,
  sections:[...document.querySelectorAll('#bHelpSetup h3')].map(h=>h.textContent.trim()),
  bodies:[...document.querySelectorAll('#bHelpSetup p')].map(x=>x.textContent.trim().length)}));
 assert.equal(onSetup.title,'Business Setup Help','mali ang pamagat ng tulong sa setup');
 assert.equal(onSetup.setup,true,'hindi bumukas ang tulong ng setup');
 assert.equal(onSetup.choices,false,'nakikita ang gabay sa apat na hakbang habang nasa setup');
 assert.equal(onSetup.faq,false,'bumukas ang FAQ');
 assert.equal(onSetup.sections.length,5,'hindi lima ang bahagi ng tulong');
 for(const h of onSetup.sections)assert(h.length>0,'walang pamagat ang isang bahagi');
 for(const n of onSetup.bodies)assert(n>20,'walang paliwanag ang isang bahagi');
 await p.locator('#ctxHelpClose').click();await settle(p);
 // Sa loob ng wizard ay bumabalik ang dating tulong.
 await completeSetup(p,{category:'beauty',adType:'service'});
 await p.locator('#helpBtn').click();
 await p.locator('#ctxHelp').waitFor({state:'visible'});
 const inWizard=await p.evaluate(()=>({title:document.getElementById('ctxHelpTitle').textContent.trim(),
  setup:!document.getElementById('bHelpSetup').hidden,
  choices:!document.getElementById('bHelpChoices').hidden}));
 assert.equal(inWizard.setup,false,'nanatili ang tulong ng setup sa loob ng wizard');
 assert.equal(inWizard.choices,true,'hindi bumalik ang gabay sa apat na hakbang');
 assert.equal(inWizard.title,'Banner Studio Help','hindi bumalik ang pamagat');
});

await test('Continue confirms only after a verified save, shows no fake loading, and a second press cannot slip in',async()=>{
 // Reduced motion: diretso ang paglipat, at naka-save ang kategorya.
 const{p}=await env({setup:false});
 await p.locator('#bSetupCategory').selectOption('fitness');
 await p.locator('#bSetupTypes [data-ad-type="promo"]').focus();await p.keyboard.press('Enter');
 await p.locator('#bSetupContinue').focus();await p.keyboard.press('Enter');
 await p.locator('#bStep1').waitFor({state:'visible'});
 const stored=await p.evaluate(()=>localStorage.getItem('mag_bizcategory'));
 assert.equal(stored,JSON.stringify({v:1,id:'fitness'}),'hindi naitala ang kategorya: '+stored);
 assert.equal(await p.locator('#bSetupDone').isHidden(),true,'nanatili ang kumpirmasyon');
 assert.equal(await p.locator('#bStudioError').isHidden(),true,'may mensahe ng mali kahit tama');

 // May galaw: may nakikitang berdeng kumpirmasyon, at 170ms lang - walang pabigat.
 const{p:q,writes}=await moving();
 await q.locator('#bSetupCategory').selectOption('pets');
 await q.locator('#bSetupTypes [data-ad-type="digital"]').focus();await q.keyboard.press('Enter');
 const began=Date.now();
 await q.locator('#bSetupContinue').focus();await q.keyboard.press('Enter');
 const note=await q.evaluate(()=>{const n=document.getElementById('bSetupDone'),s=getComputedStyle(n);
  return{shown:!n.hidden,text:n.textContent.trim(),mark:!!n.querySelector('.setupDoneMark'),
   role:n.getAttribute('role'),anim:s.animationName,ms:s.animationDuration,ink:s.color,
   busy:document.getElementById('bSetupContinue').getAttribute('aria-busy')};});
 assert.equal(note.shown,true,'walang kumpirmasyon kahit may galaw');
 assert.equal(note.text,'Setup Complete','mali ang kumpirmasyon: '+note.text);
 assert.equal(note.mark,true,'walang check mark');
 assert.equal(note.role,'status','hindi inaanunsyo sa screen reader');
 assert.equal(note.anim,'mgHelpIn','walang entrance ang kumpirmasyon');
 assert.equal(note.ms,'0.17s','hindi 170ms ang kumpirmasyon: '+note.ms);
 assert.equal(note.busy,'true','hindi naka-busy ang pindutan habang kumukumpirma');
 // Ang pangalawang pindot habang kumukumpirma ay walang bisa.
 await q.evaluate(()=>document.getElementById('bSetupContinue').click());
 await q.locator('#bStep1').waitFor({state:'visible'});
 const took=Date.now()-began;
 assert(took<2000,'may pakitang-tao na paghihintay: '+took+'ms');
 const end=await q.evaluate(()=>({step:document.querySelector('[data-wizard-step]:not([hidden])')?.dataset.wizardStep,
  phase:document.getElementById('main').dataset.phase,
  done:document.getElementById('bSetupDone').hidden,
  busy:document.getElementById('bSetupContinue').getAttribute('aria-busy'),
  stored:localStorage.getItem('mag_bizcategory')}));
 assert.equal(end.phase,'wizard','hindi pumasok sa wizard');
 assert.equal(end.step,'1','hindi Step 1 ang bumungad');
 assert.equal(end.done,true,'nanatiling nakikita ang kumpirmasyon');
 assert.equal(end.busy,null,'nanatiling busy ang pindutan');
 assert.equal(end.stored,JSON.stringify({v:1,id:'pets'}),'nagdoble o nawala ang pagsulat');
 assert.deepEqual(writes,[],'may isinulat sa server');
});

await test('When the browser will not keep local data, the truth is shown instead of a success claim',async()=>{
 const{p}=await moving({init:()=>{
  const real=Storage.prototype.setItem;
  Storage.prototype.setItem=function(k,v){
   if(k==='mag_bizcategory')throw new DOMException('QuotaExceededError');
   return real.call(this,k,v);};
 }});
 await p.locator('#bSetupCategory').selectOption('travel');
 await p.locator('#bSetupTypes [data-ad-type="service"]').focus();await p.keyboard.press('Enter');
 await p.locator('#bSetupContinue').focus();await p.keyboard.press('Enter');
 await p.locator('#bStep1').waitFor({state:'visible'});
 const after=await p.evaluate(()=>({msg:document.getElementById('bStudioError').textContent.trim(),
  shown:!document.getElementById('bStudioError').hidden,
  done:document.getElementById('bSetupDone').hidden,
  stored:localStorage.getItem('mag_bizcategory'),
  phase:document.getElementById('main').dataset.phase,
  category:document.getElementById('bCategory').value}));
 assert.equal(after.shown,true,'walang sinasabi kahit hindi naka-save');
 assert(/not keeping local data/i.test(after.msg),'hindi ito ang tapat na mensahe: '+after.msg);
 assert.equal(after.done,true,'ipinakita ang berdeng check kahit hindi naka-save');
 assert.equal(after.stored,null,'may naitala kahit tumanggi ang storage');
 // Patuloy pa rin: session-only ang sagot, at naipasa pa rin sa wizard.
 assert.equal(after.phase,'wizard','hinarang ang tao dahil sa storage');
 assert.equal(after.category,'travel','hindi naipasa ang sagot sa Step 3');
});

await test('The primary action is violet - not orange or green - full width and keyboard-visible, and the panel holds at 360px in both themes',async()=>{
 for(const theme of['light','dark']){
  const{p}=await env({width:360,theme,setup:false});
  const look=await p.evaluate(()=>{
   const go=document.getElementById('bSetupContinue'),s=getComputedStyle(go);
   const r=go.getBoundingClientRect(),host=document.getElementById('bSetup').getBoundingClientRect();
   const token=getComputedStyle(document.documentElement).getPropertyValue('--studio-primary').trim();
   return{h:Math.round(r.height),w:Math.round(r.width),hostW:Math.round(host.width),
    token,layers:s.backgroundImage.split('linear-gradient').length-1,
    radius:s.borderRadius,weight:s.fontWeight,
    scroll:document.documentElement.scrollWidth<=document.documentElement.clientWidth};
  });
  assert(look.h>=48,theme+': manipis ang pindutan - '+look.h+'px');
  assert(look.w>=look.hostW-2,theme+': hindi buong lapad ang pindutan');
  assert.equal(look.layers,2,theme+': nawala ang pinigilang gloss');
  assert(Number(look.weight)>=600,theme+': hindi matingkad ang teksto');
  assert.equal(look.scroll,true,theme+': may pahalang na scroll sa 360px');
  // Lila ang hue: hindi orange (20-60) at hindi berde (90-160).
  const m=/^#([0-9a-f]{6})$/i.exec(look.token);
  assert(m,theme+': hindi hex ang --studio-primary: '+look.token);
  const [r8,g8,b8]=[0,2,4].map(i=>parseInt(m[1].slice(i,i+2),16)/255);
  const mx=Math.max(r8,g8,b8),mn=Math.min(r8,g8,b8);let hue=0;
  if(mx!==mn){const d=mx-mn;
   hue=mx===r8?((g8-b8)/d+(g8<b8?6:0)):mx===g8?((b8-r8)/d+2):((r8-g8)/d+4);hue*=60;}
  assert(hue>=240&&hue<=300,theme+': hindi lila ang pangunahing kulay - hue '+Math.round(hue));
  // Tanging pagpindot sa keyboard ang nagpapakita ng singsing.
  await p.locator('#bSetupContinue').focus();
  const ring=await p.locator('#bSetupContinue').evaluate(n=>{const s=getComputedStyle(n);
   return{w:s.outlineWidth,style:s.outlineStyle};});
  assert.equal(ring.style,'solid',theme+': walang singsing sa keyboard focus');
  assert.equal(ring.w,'2px',theme+': manipis ang singsing');
  // Walang kontrol na natatakpan ng iba.
  const clear=await p.evaluate(()=>{
   const ids=['bSetupCategory','bSetupContinue',...[...document.querySelectorAll('#bSetupTypes [data-ad-type]')].map(c=>c.dataset.adType)];
   const bad=[];
   for(const id of ids){
    const n=document.getElementById(id)||document.querySelector(`[data-ad-type="${id}"]`);
    const r=n.getBoundingClientRect();
    if(r.height===0)continue;
    const hit=document.elementFromPoint(r.left+r.width/2,r.top+Math.min(r.height/2,12));
    if(hit&&!n.contains(hit)&&!hit.contains(n))bad.push(id);
   }
   return bad;});
  assert.deepEqual(clear,[],theme+': may natatakpang kontrol - '+clear.join(','));
  await p.screenshot({path:path.join(out,`setup-b30-360-${theme}.png`),fullPage:true});
 }
});

/* ---------- b31 - Phase 2A.1: ang apat na larawang inaprubahan ng owner ---------- */

const PHOTO={physical:'setup-ad-physical.webp',digital:'setup-ad-digital.webp',
 service:'setup-ad-service.webp',promo:'setup-ad-promo.webp'};

await test('Each card shows its own approved photograph, decoded from a local file, and the four still choose one at a time',async()=>{
 const{p,external}=await env({width:360,setup:false});
 const shots=await p.evaluate(()=>[...document.querySelectorAll('#bSetupTypes [data-ad-type]')].map(c=>{
  const im=c.querySelector('.setupCardPhoto img'),slot=c.querySelector('.setupCardPhoto');
  const r=im.getBoundingClientRect(),cs=getComputedStyle(slot);
  return{id:c.dataset.adType,src:im.getAttribute('src'),abs:im.src,
   nat:[im.naturalWidth,im.naturalHeight],complete:im.complete,
   w:Math.round(r.width),h:Math.round(r.height),fit:getComputedStyle(im).objectFit,
   round:cs.borderRadius,clip:cs.overflow,alt:im.alt,hidden:slot.getAttribute('aria-hidden'),
   label:c.textContent.trim()};}));
 assert.equal(shots.length,4);
 const seen=new Set();
 for(const s of shots){
  // Tamang larawan sa tamang uri.
  assert(s.src.startsWith(PHOTO[s.id]),s.id+': maling file - '+s.src);
  assert(!seen.has(s.src),s.id+': nagamit nang dalawang beses ang larawan');seen.add(s.src);
  // Tunay na nakarating at nabasa - hindi lang nakasulat sa markup.
  assert.equal(s.complete,true,s.id+': hindi natapos ang larawan');
  assert.deepEqual(s.nat,[320,320],s.id+': hindi 320x320 ang tunay na larawan - '+s.nat);
  // Lokal: kaparehong origin ng pahina, walang panlabas na host.
  assert(s.abs.startsWith('http://127.0.0.1:8876/'),s.id+': hindi lokal - '+s.abs);
  // Bilog, pinuputol nang tama, at nasa sukat na sinukat na nababasa sa cellphone.
  assert.equal(s.w,60,s.id+': maling lapad - '+s.w);
  assert.equal(s.h,60,s.id+': maling taas - '+s.h);
  assert.equal(s.fit,'cover',s.id+': hindi cover ang pagputol');
  assert.equal(s.round,'50%',s.id+': hindi bilog');
  assert.equal(s.clip,'hidden',s.id+': lumalabas sa bilog ang larawan');
  // Pang-ilustrasyon: walang idinadagdag sa binabasa ng screen reader.
  assert.equal(s.alt,'',s.id+': may alt ang pang-ilustrasyong larawan');
  assert.equal(s.hidden,'true',s.id+': hindi nakatago sa screen reader ang puwesto');
  assert(s.label.length>0,s.id+': nawala ang teksto ng card');
 }
 // Pumipili pa rin, at isa lang.
 for(const id of AD_TYPES){
  await p.locator(`#bSetupTypes [data-ad-type="${id}"]`).focus();
  await p.keyboard.press('Enter');await settle(p);
  const on=await p.evaluate(()=>[...document.querySelectorAll('#bSetupTypes [data-ad-type]')]
   .filter(c=>c.getAttribute('aria-checked')==='true').map(c=>c.dataset.adType));
  assert.deepEqual(on,[id],id+': hindi isa ang napili - '+on.join(','));
 }
 assert.deepEqual(external,[],'may panlabas na kahilingan: '+JSON.stringify(external));
});

await test('A photograph that cannot load takes its slot with it, and the card still works',async()=>{
 // Pinapalitan ang isang pangalan ng file bago pa bumuo ang pahina, kaya tunay na
 // pagkabigo ang nasusubok - hindi lang itinatago ang larawan pagkatapos.
 const{p,errors}=await moving({abort:'**/setup-ad-service.webp*'});
 await p.locator('#bSetupTypes [data-ad-type="service"] .setupCardPhoto').waitFor({state:'detached'});
 const after=await p.evaluate(()=>{
  const c=document.querySelector('#bSetupTypes [data-ad-type="service"]');
  const ok=document.querySelector('#bSetupTypes [data-ad-type="promo"]');
  return{slots:c.querySelectorAll('.setupCardPhoto').length,flag:c.dataset.photo,
   text:c.querySelector('.setupCardName').textContent.trim(),
   mark:c.querySelectorAll('.setupCardMark').length,
   h:Math.round(c.getBoundingClientRect().height),
   left:Math.round(c.querySelector('.setupCardText').getBoundingClientRect().left
        -c.getBoundingClientRect().left),
   others:ok.querySelectorAll('.setupCardPhoto img').length};});
 assert.equal(after.slots,0,'naiwan ang blangkong puwesto ng larawan');
 assert.equal(after.flag,'off','hindi naitala ang nawalang larawan');
 assert.equal(after.text,'Service','nawala ang pangalan');
 assert.equal(after.mark,1,'nawala ang tanda ng pagpili');
 assert(after.left<=16,'may naiwang puwang kung saan dapat ang larawan - '+after.left+'px');
 assert.equal(after.others,1,'naapektuhan ang ibang card');
 // Napipili pa rin ito, at naipapasa pa rin sa wizard.
 await p.locator('#bSetupCategory').selectOption('beauty');
 await p.locator('#bSetupTypes [data-ad-type="service"]').focus();await p.keyboard.press('Enter');
 await p.locator('#bSetupContinue').focus();await p.keyboard.press('Enter');
 await p.locator('#bStep1').waitFor({state:'visible'});
 assert.equal(await p.evaluate(()=>document.getElementById('main').dataset.phase),'wizard',
  'hinarang ng nawalang larawan ang pagpasok');
 // Ang tanging reklamo ay ang sinadya nating harangan. Inaalis ito rito para manatiling
 // mahigpit ang panghuling pagsusuri - at para mahuli pa rin ang kahit anong iba pa.
 const expected=errors.filter(e=>/Failed to load resource/.test(e));
 assert.equal(expected.length,1,'hindi isa ang pagkabigo ng larawan: '+errors.join(' | '));
 errors.length=0;
});

await test('The photographs hold at 360px in both themes and in all three languages, with nothing clipped and nothing overflowing',async()=>{
 for(const theme of['light','dark'])for(const lang of['en','fil','tl']){
  const{p}=await env({width:360,theme,lang,setup:false});
  const look=await p.evaluate(()=>{
   const out={over:document.documentElement.scrollWidth>document.documentElement.clientWidth,cards:[]};
   for(const c of document.querySelectorAll('#bSetupTypes [data-ad-type]')){
    // Ang elementFromPoint ay null sa labas ng viewport, kaya iniisa-isa muna ang card.
    c.scrollIntoView({block:'center'});
    const cr=c.getBoundingClientRect(),im=c.querySelector('.setupCardPhoto img').getBoundingClientRect();
    const tx=c.querySelector('.setupCardText').getBoundingClientRect();
    const mk=c.querySelector('.setupCardMark').getBoundingClientRect();
    out.cards.push({id:c.dataset.adType,
     // Walang bahagi ng larawan, teksto o tanda na lumalabas sa card.
     inside:im.left>=cr.left-0.5&&im.right<=cr.right+0.5&&im.top>=cr.top-0.5&&im.bottom<=cr.bottom+0.5,
     textIn:tx.right<=cr.right+0.5,markIn:mk.right<=cr.right+0.5,
     // Walang nagkakapatong: larawan, teksto, tanda - magkasunod.
     order:im.right<=tx.left+0.5&&tx.right<=mk.left+0.5,
     h:Math.round(cr.height),
     // Napipindot pa rin ang buong card.
     hit:document.elementFromPoint(cr.left+cr.width/2,cr.top+cr.height/2)});
   }
   return out;});
  assert.equal(look.over,false,`${theme}/${lang}: may pahalang na scroll`);
  for(const c of look.cards){
   const w=`${theme}/${lang} ${c.id}: `;
   assert.equal(c.inside,true,w+'lumalabas ang larawan sa card');
   assert.equal(c.textIn,true,w+'naputol ang teksto');
   assert.equal(c.markIn,true,w+'lumabas ang tanda');
   assert.equal(c.order,true,w+'nagkakapatong ang larawan, teksto at tanda');
   assert(c.h>=56&&c.h<=116,w+'hindi compact - '+c.h+'px');
   assert(c.hit,w+'hindi naaabot ang card');
  }
  if(lang==='en')await p.screenshot({path:path.join(out,`setup-b31-360-${theme}.png`),fullPage:true});
 }
});

// b32: Setup values are not interaction with the four editor steps.
await test('b32 fresh handoff is pending in every language/theme; all four ad types preserve existing validation',async()=>{
 for(const lang of ['en','fil','tl'])for(const theme of ['light','dark'])for(const adType of AD_TYPES){
  const {c,p}=await env({lang,theme,setupAdType:adType});
  assert.deepEqual(await p.locator('.stepDot').evaluateAll(ns=>ns.map(n=>n.dataset.state)),['pending','pending','pending','pending']);
  assert.equal(await p.locator('.stepDot[aria-current="step"]').getAttribute('data-progress'),'1');
  assert.equal(await p.locator('#bDesignStyle').inputValue(),'');
  assert.equal(await p.locator('#bCtaChoice').inputValue(),'');
  await c.close();
 }
});
await test('b32 changing Setup answers and reusing a saved category never confirms wizard defaults',async()=>{
 const {c,p}=await env({setup:false});
 await p.locator('#bSetupCategory').selectOption('food');
 await p.locator('[data-ad-type="physical"]').click();
 await p.locator('#bSetupCategory').selectOption('beauty');
 await p.locator('[data-ad-type="service"]').click();
 await p.locator('#bSetupContinue').click();await p.locator('#bStep1').waitFor({state:'visible'});
 assert.deepEqual(await p.locator('.stepDot').evaluateAll(ns=>ns.map(n=>n.dataset.state)),Array(4).fill('pending'));
 await p.reload();await p.locator('#app').waitFor({state:'visible'});
 assert.equal(await p.locator('#bSetupCategory').inputValue(),'beauty');
 await p.locator('[data-ad-type="promo"]').click();await p.locator('#bSetupContinue').click();await p.locator('#bStep1').waitFor({state:'visible'});
 assert.deepEqual(await p.locator('.stepDot').evaluateAll(ns=>ns.map(n=>n.dataset.state)),Array(4).fill('pending'));
 await c.close();
});
await test('b32 a new banner resets red/orange/green history; account invalidation clears private editor state and status history',async()=>{
 const {c,p}=await env();await step(p,4);await p.locator('#bGenerate').click();await settle(p);
 assert.equal(await dot(p,1),'invalid');
 await p.reload();await p.locator('#app').waitFor({state:'visible'});
 assert(await inSetup(p));await completeSetup(p);
 for(const n of [1,2,3,4])assert.equal(await dot(p,n),'pending');
 await step(p,2);await p.locator('#bProduct').fill('Private sample');await p.locator('#bHeadline').fill('Accurate headline');
 const cleared=await p.evaluate(()=>{window.__setUser({uid:'account-B',emailVerified:true});return {hidden:document.querySelector('#app').hidden,product:document.querySelector('#bProduct').value,states:[...document.querySelectorAll('.stepDot')].map(n=>n.dataset.state)};});
 assert.equal(cleared.hidden,true);assert.equal(cleared.product,'');
 assert.deepEqual(cleared.states,Array(4).fill('pending'));
 await p.waitForURL('**/dashboard.html');
 await c.close();
});

for(const e of contexts){assert.deepEqual(e.errors,[]);assert.deepEqual(e.external||[],[]);assert.deepEqual(e.writes||[],[]);}
assert.equal(results.length,20,'nawala ang isang test: '+results.length);
fs.writeFileSync(path.join(out,'setup-results.json'),JSON.stringify({result:'PASS',results,
 categories:21,visualCategories:22,adTypes:AD_TYPES.length,
 persistence:'mag_bizcategory (hiwalay sa mag_bizprofile; walang migration)',
 auth:'Mocked services; emulated viewports only - no physical Android device'},null,2));
}finally{await b.close()}})().catch(e=>{console.error(e);process.exitCode=1});
