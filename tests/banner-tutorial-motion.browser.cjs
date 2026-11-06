// Scroll stability at paglipat ng Quick Tutorial. Ang ibang suite ay tumatakbo lahat sa
// reducedMotion:'reduce', kaya dito lang nasusubok ang tunay na 200ms na transition.
// Start: python -m http.server 8876 --bind 127.0.0.1 --directory public
const{chromium}=require('playwright'),assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path');
const{base,install}=require('./fixtures/account.cjs');
const out=process.env.MAGNETRA_MOTION_ARTIFACTS||'/tmp/magnetra-tutorial-motion';fs.mkdirSync(out,{recursive:true});
const SAMPLE=path.join(__dirname,'fixtures/product-sample.png');
const results=[],contexts=[];let b;
const settle=p=>p.evaluate(()=>new Promise(r=>requestAnimationFrame(()=>requestAnimationFrame(r))));
async function env({width=360,height=640,lang='en',theme='light',motion='reduce'}={}){
 const c=await b.newContext({viewport:{width,height},deviceScaleFactor:1,reducedMotion:motion,serviceWorkers:'block'});
 const external=await install(c,{lang,theme}),errors=[],writes=[];
 const p=await c.newPage();
 p.on('pageerror',e=>errors.push(e.message));p.on('console',m=>{if(m.type()==='error')errors.push(m.text())});
 p.on('request',r=>{if(!['GET','HEAD'].includes(r.method()))writes.push(r.method()+' '+r.url())});
 await p.goto(base+'/banner.html');await p.locator('#app').waitFor({state:'visible'});
 const e={c,p,errors,external,writes};contexts.push(e);return e;
}
async function test(name,run){await run();results.push({name,result:'PASS'});console.log('PASS',name);}

const y=p=>p.evaluate(()=>Math.round(window.scrollY));
// Ang tamang sukatan ay HINDI ang scrollY: kapag may inalis na nilalaman sa itaas, kailangan
// ngang bumaba ang scrollY para manatili sa parehong lugar ang nakikita. Sinusukat natin ang
// posisyon ng kasalukuyang step sa loob ng viewport, at tinitiyak na walang galaw PABABA.
const place=p=>p.evaluate(()=>{const n=document.querySelector('[data-wizard-step]:not([hidden])');
 return{y:Math.round(window.scrollY),top:Math.round(n.getBoundingClientRect().top)};});
function stable(before,after,label,tol){
 assert(after.y<=before.y+tol,`${label}: tumalon PABABA ng ${after.y-before.y}px`);
 if(after.y>0)assert(Math.abs(after.top-before.top)<=VISIBLE,
  `${label}: gumalaw ang nakikita ng ${after.top-before.top}px`);
}
const at=p=>p.evaluate(()=>document.querySelector('[data-wizard-step]:not([hidden])').dataset.wizardStep);
// Walang focus na dapat maiwan sa loob ng nakatagong nilalaman.
const focusOk=p=>p.evaluate(()=>{const a=document.activeElement;
 if(!a||a===document.body)return 'body';
 if(a.closest('#bTutorial'))return 'nasa loob ng tutorial';
 if(a.offsetParent===null&&getComputedStyle(a).position!=='fixed')return 'nakatago: '+a.id;
 return 'ok';});
async function goStep(p,n){await p.locator(`.stepDot[data-progress="${n}"]`).click();await settle(p);}
async function fill(p){
 await p.locator('#bPhoto').setInputFiles(SAMPLE);await p.locator('#bPhotoRemove').waitFor({state:'visible'});await settle(p);
 await goStep(p,2);await p.locator('#bProduct').fill('Ceramic mug');await p.locator('#bHeadline').fill('Handmade mug');
 await p.locator('#bPrice').fill('₱350');await settle(p);
 await goStep(p,3);await p.locator('#bCategory').selectOption('food');await settle(p);
 await goStep(p,4);await p.locator('#bCtaChoice').selectOption('custom');await p.locator('#bCta').fill('Message us');await settle(p);
}
async function openTutorial(p){
 await p.locator('#helpBtn').click();await p.locator('#ctxHelp').waitFor({state:'visible'});
 await p.locator('#bStartTutorial').click();await p.locator('#bTutorial').waitFor({state:'visible'});await settle(p);
}
// 4px para sa pagtalon ng scroll. 12px para sa nakikitang posisyon: iyon ang natural na
// granularity ng scroll anchoring ng browser kapag may inalis na 214px na card - nasukat ko
// ang parehong 10px na natitira mayroon man o walang manual na kompensasyon.
const STABLE=4, VISIBLE=12;
// Bago sukatin ang scroll, pinipindot natin nang native. Ang click ng Playwright ay may
// sariling scroll-into-view na nagagalaw ng hanggang 294px kahit nakikita na ang button -
// artifact iyon ng harness, hindi ng app. Ang pagiging totoong napipindot ng mga kontrol
// ay sakop na ng ibang suite; dito ang scroll stability ang sinusukat.
const tap=(p,id)=>p.evaluate(sel=>document.querySelector(sel).click(),'#'+id);

(async()=>{b=await chromium.launch({executablePath:'/usr/bin/chromium',args:['--no-sandbox']});try{

await test('Skip keeps the page where it is on every step, from the top and from mid-scroll',async()=>{
 for(const step of[1,2,3,4]){
  const{c,p}=await env();
  await fill(p);await goStep(p,step);
  // Mula sa itaas: dito nangyari ang iniulat na pagtalon pababa.
  await openTutorial(p);await p.evaluate(()=>scrollTo(0,0));await settle(p);
  const before=await place(p);
  await tap(p,'bTutorialSkip');
  await p.locator('#bTutorial').waitFor({state:'hidden'});await settle(p);
  stable(before,await place(p),`step ${step} mula sa itaas`,STABLE);
  assert.equal(await focusOk(p),'ok',`step ${step}: masamang focus matapos ang Skip`);
  assert.equal(await at(p),String(step),`step ${step}: nagpalit ng wizard step ang Skip`);
  // Mula sa gitna ng pahina.
  await openTutorial(p);
  const mid=await p.evaluate(()=>{const max=document.documentElement.scrollHeight-innerHeight;
   const target=Math.max(0,Math.round(max/2));scrollTo(0,target);return Math.round(scrollY);});
  await settle(p);
  const before2=await place(p);
  await tap(p,'bTutorialSkip');
  await p.locator('#bTutorial').waitFor({state:'hidden'});await settle(p);
  stable(before2,await place(p),`step ${step} mula sa gitna (${mid})`,STABLE);
  await c.close();
 }
});

await test('Next, Back and Replay move the guidance without scrolling or changing the step',async()=>{
 const{c,p}=await env();
 await fill(p);await goStep(p,2);await openTutorial(p);
 await p.evaluate(()=>scrollTo(0,0));await settle(p);
 const start=await y(p);
 // Nagsisimula ang gabay sa tip na tugma sa bukas na step, kaya adaptive ang pag-ikot.
 let n=0;
 while(await p.locator('#bTutorialNext').isVisible()){
  await p.locator('#bTutorialNext').click();await settle(p);n++;
  assert(Math.abs(await y(p)-start)<=STABLE,`Next #${n} nag-scroll`);
  assert.equal(await at(p),'2',`Next #${n} nagpalit ng step`);
  assert(n<6,'hindi natatapos ang Next');
 }
 assert(n>=3,`${n} lang ang Next na nagawa`);
 assert(await p.locator('#bTutorialFinish').isVisible(),'walang Finish sa huling tip');
 let m=0;
 while(await p.locator('#bTutorialBack').isVisible()){
  await p.locator('#bTutorialBack').click();await settle(p);m++;
  assert(Math.abs(await y(p)-start)<=STABLE,`Back #${m} nag-scroll`);
  assert.equal(await at(p),'2',`Back #${m} nagpalit ng step`);
  assert(m<6,'hindi natatapos ang Back');
 }
 assert.equal(await p.locator('#bTutorialCount').textContent(),'Tip 1 of 5');
 // Replay: hindi dinadala ang user sa ibang bahagi, at nakikita ang card.
 await tap(p,'bTutorialSkip');await p.locator('#bTutorial').waitFor({state:'hidden'});await settle(p);
 const afterSkip=await y(p);
 await openTutorial(p);
 assert(Math.abs(await y(p)-afterSkip)<=STABLE,'nag-scroll ang Replay');
 assert(await p.locator('#bTutorial').isVisible());
 assert.equal(await at(p),'2','nagpalit ng step ang Replay');
 await c.close();
});

await test('Finish from the preview dismisses the guidance without moving the page',async()=>{
 const{c,p}=await env();
 await fill(p);await openTutorial(p);
 await p.locator('#bGenerate').click();await p.locator('#inspectDialog').waitFor({state:'visible'});await settle(p);
 await tap(p,'bTutorialFinish');
 await p.locator('#bTutorial').waitFor({state:'hidden'});await settle(p);
 assert(await p.locator('#inspectDialog').isVisible(),'isinara ng Finish ang preview');
 assert.equal(await p.evaluate(()=>document.activeElement.id),'bSave');
 await p.locator('#inspectClose').click();await settle(p);
 const before=await place(p);
 await openTutorial(p);
 await tap(p,'bTutorialSkip');await p.locator('#bTutorial').waitFor({state:'hidden'});await settle(p);
 stable(before,await place(p),'matapos ang Finish at Replay',STABLE);
 await c.close();
});

await test('With motion allowed the card fades over about 200ms; with reduced motion it goes at once',async()=>{
 // Pinapayagan ang motion: may transition at hindi agad nawawala ang card.
 const{c,p}=await env({motion:'no-preference'});
 await fill(p);await goStep(p,2);await openTutorial(p);
 const dur=await p.locator('#bTutorial').evaluate(n=>getComputedStyle(n).transitionDuration);
 assert(/^0\.2s|^200ms/.test(dur),`transition-duration=${dur}, inaasahan ~200ms`);
 await p.evaluate(()=>scrollTo(0,0));await settle(p);
 const before=await place(p);
 await tap(p,'bTutorialSkip');
 // Nasa labasan pa: nakikita pa rin, may data-anim, at kumukupas na.
 const mid=await p.locator('#bTutorial').evaluate(n=>({anim:n.dataset.anim||null,hidden:n.hidden,opacity:getComputedStyle(n).opacity}));
 assert.equal(mid.anim,'out','walang out state');
 assert.equal(mid.hidden,false,'agad nawala kahit may motion');
 await p.locator('#bTutorial').waitFor({state:'hidden',timeout:2000});
 stable(before,await place(p),'may transition',STABLE);
 assert.equal(await focusOk(p),'ok');
 await c.close();
 // Reduced motion: walang transition at walang paghihintay.
 const e2=await env({motion:'reduce'});
 await fill(e2.p);await goStep(e2.p,2);await openTutorial(e2.p);
 assert.equal(await e2.p.locator('#bTutorial').evaluate(n=>getComputedStyle(n).transitionDuration),'0s');
 await e2.p.evaluate(()=>scrollTo(0,0));await settle(e2.p);
 const b2=await place(e2.p);
 await tap(e2.p,'bTutorialSkip');
 assert.equal(await e2.p.locator('#bTutorial').evaluate(n=>n.hidden),true,'hindi agad nagtago sa reduced motion');
 stable(b2,await place(e2.p),'reduced motion',STABLE);
 await e2.c.close();
});

for(const lang of['en','fil','tl'])for(const theme of['light','dark'])
 await test(`Skip stays put at 360x640 in ${lang}/${theme}`,async()=>{
  const{c,p}=await env({lang,theme});
  await fill(p);await goStep(p,3);await openTutorial(p);
  await p.evaluate(()=>scrollTo(0,0));await settle(p);
  const before=await place(p);
  await tap(p,'bTutorialSkip');
  await p.locator('#bTutorial').waitFor({state:'hidden'});await settle(p);
  stable(before,await place(p),`${lang}/${theme}`,STABLE);
  assert.equal(await focusOk(p),'ok');
  // Buo pa rin ang nailagay at ang mga tuldok.
  await goStep(p,2);
  assert.equal(await p.locator('#bHeadline').inputValue(),'Handmade mug');
  assert.equal(await p.locator('.stepDot[data-progress="1"]').getAttribute('data-state'),'complete');
  await c.close();
 });

for(const e of contexts){assert.deepEqual(e.errors,[]);assert.deepEqual(e.external,[]);assert.deepEqual(e.writes,[]);}
fs.writeFileSync(path.join(out,'motion-results.json'),JSON.stringify({result:'PASS',results,
 auth:'Mocked services; emulated viewports only - no physical Android'},null,2));
}finally{await b.close()}})().catch(e=>{console.error(e);process.exitCode=1});
