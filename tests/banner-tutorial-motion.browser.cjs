// Quick Tutorial: scroll stability, fade-and-collapse, at pagtukoy ng lumang cached asset.
// Ginagamit dito ang TUNAY na tap sa touch context at ang totoong sukat ng Android. Ito rin
// lang ang suite na tumatakbo nang may motion: ang iba ay reducedMotion:'reduce' lahat.
// Start: python -m http.server 8876 --bind 127.0.0.1 --directory public
const{chromium}=require('playwright'),assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path');
const{base,install}=require('./fixtures/account.cjs');
const out=process.env.MAGNETRA_MOTION_ARTIFACTS||'/tmp/magnetra-tutorial-motion';fs.mkdirSync(out,{recursive:true});
const SAMPLE=path.join(__dirname,'fixtures/product-sample.png');
const results=[],contexts=[];let b;
const settle=p=>p.evaluate(()=>new Promise(r=>requestAnimationFrame(()=>requestAnimationFrame(r))));
async function env({width=360,height=640,lang='en',theme='light',motion='reduce'}={}){
 const c=await b.newContext({viewport:{width,height},hasTouch:true,isMobile:true,deviceScaleFactor:1,
   reducedMotion:motion,serviceWorkers:'block'});
 const external=await install(c,{lang,theme}),errors=[],writes=[];
 const p=await c.newPage();
 p.on('pageerror',e=>errors.push(e.message));p.on('console',m=>{if(m.type()==='error')errors.push(m.text())});
 p.on('request',r=>{if(!['GET','HEAD'].includes(r.method()))writes.push(r.method()+' '+r.url())});
 await p.goto(base+'/banner.html');await p.locator('#app').waitFor({state:'visible'});
 const e={c,p,errors,external,writes};contexts.push(e);return e;
}
async function test(name,run){await run();results.push({name,result:'PASS'});console.log('PASS',name);}

const y=p=>p.evaluate(()=>Math.round(window.scrollY));
const at=p=>p.evaluate(()=>document.querySelector('[data-wizard-step]:not([hidden])').dataset.wizardStep);
const focusInfo=p=>p.evaluate(()=>{const a=document.activeElement;return{id:a.id,tag:a.tagName,
 type:a.getAttribute?a.getAttribute('type'):null,inCard:!!(a.closest&&a.closest('#bTutorial')),
 hidden:a.offsetParent===null&&getComputedStyle(a).position!=='fixed'};});
async function step(p,n){await p.locator(`.stepDot[data-progress="${n}"]`).tap();await settle(p);}
async function fill(p){
 await p.locator('#bPhoto').setInputFiles(SAMPLE);await p.locator('#bPhotoRemove').waitFor({state:'visible'});await settle(p);
 await step(p,2);await p.locator('#bProduct').fill('Ceramic mug');await p.locator('#bHeadline').fill('Handmade mug');
 await p.locator('#bPrice').fill('₱350');await settle(p);
 await step(p,3);await p.locator('#bCategory').selectOption('food');await settle(p);
 await step(p,4);await p.locator('#bCtaChoice').selectOption('custom');await p.locator('#bCta').fill('Message us');await settle(p);
}
async function openTutorial(p){
 await p.locator('#helpBtn').tap();await p.locator('#ctxHelp').waitFor({state:'visible'});
 await p.locator('#bStartTutorial').tap();await p.locator('#bTutorial').waitFor({state:'visible'});await settle(p);
}
const TOL=4;

(async()=>{b=await chromium.launch({executablePath:'/usr/bin/chromium',args:['--no-sandbox']});try{

// Ang pinakaunang dahilan kung bakit walang nakikitang pagbabago sa telepono: luma ang
// naka-cache na asset. Kapag nag-iba ang tatlong marka, hindi tugma ang HTML, CSS at JS.
await test('The HTML, CSS and JS all report the same build, so a stale cached asset is detectable',async()=>{
 const{c,p}=await env();
 const meta=await p.getAttribute('meta[name="mg-build"]','content');
 const js=await p.evaluate(()=>document.documentElement.dataset.mgStudio);
 const css=await p.evaluate(()=>document.documentElement.dataset.mgCss);
 assert(meta&&/^b\d+$/.test(meta),`walang maayos na mg-build: ${meta}`);
 assert.equal(js,meta,`luma ang JS: ${js} vs ${meta}`);
 assert.equal(css,meta,`luma ang CSS: ${css} vs ${meta}`);
 // Bawat binagong asset ay may sariling bersyon sa URL, kung hindi ay ibibigay ng cache ang luma.
 const html=await p.content();
 for(const ref of ['css-banner.css?v=','ui-banner.js?v='])assert(html.includes(ref),`walang bersyon ang ${ref}`);
 await c.close();
});

// Reproduksyon ng pangalawang sanhi: sa Android, ang focus sa text field sa loob ng isang tap
// ay nagbubukas ng keyboard, at ang pagsasara nito ang nagtutulak sa pahina.
await test('Opening the guidance never focuses a text field, so the Android keyboard stays closed',async()=>{
 for(const step1 of[1,2,3,4]){
  const{c,p}=await env();
  await fill(p);await step(p,step1);await openTutorial(p);
  const f=await focusInfo(p);
  assert(f.inCard,`step ${step1}: nasa labas ng gabay ang focus (${f.id})`);
  assert(f.tag!=='INPUT'&&f.tag!=='TEXTAREA',`step ${step1}: na-focus ang ${f.tag}#${f.id} - magbubukas ang keyboard`);
  assert(!f.hidden,`step ${step1}: nakatago ang na-focus`);
  // Pati sa pag-ikot ng mga tip: walang input na dapat matamaan.
  for(let i=0;i<4&&await p.locator('#bTutorialNext').isVisible();i++){
   await p.locator('#bTutorialNext').tap();await settle(p);
   const g=await focusInfo(p);
   assert(g.tag!=='INPUT'&&g.tag!=='TEXTAREA',`step ${step1} tip ${i+2}: na-focus ang ${g.tag}#${g.id}`);
  }
  await c.close();
 }
});

await test('A real tap on Skip holds the page still on every step, from the top and mid-scroll',async()=>{
 for(const s of[1,2,3,4]){
  const{c,p}=await env();
  await fill(p);await step(p,s);
  await openTutorial(p);await p.evaluate(()=>scrollTo(0,0));await settle(p);
  const b1=await y(p);
  await p.locator('#bTutorialSkip').tap();
  await p.locator('#bTutorial').waitFor({state:'hidden'});await settle(p);
  assert(await y(p)-b1<=TOL,`step ${s} mula sa itaas: bumaba ng ${await y(p)-b1}px`);
  assert.equal(await at(p),String(s),`step ${s}: nagpalit ng step ang Skip`);
  const f=await focusInfo(p);
  assert(!f.inCard&&!f.hidden,`step ${s}: naiwan ang focus sa nakatagong nilalaman (${f.id})`);
  // Mula sa gitna ng pahina.
  await openTutorial(p);
  await p.evaluate(()=>{const max=document.documentElement.scrollHeight-innerHeight;scrollTo(0,Math.max(0,Math.round(max/2)));});
  await settle(p);
  const b2=await y(p);
  await p.locator('#bTutorialSkip').tap();
  await p.locator('#bTutorial').waitFor({state:'hidden'});await settle(p);
  assert(await y(p)-b2<=TOL,`step ${s} mula sa gitna: bumaba ng ${await y(p)-b2}px`);
  await c.close();
 }
});

await test('Nothing scrolls during the dismissal either, and the card collapses as it fades',async()=>{
 const{c,p}=await env({motion:'no-preference'});
 await fill(p);await step(p,2);await openTutorial(p);
 await p.evaluate(()=>scrollTo(0,0));await settle(p);
 // Sinusundan ang scroll at ang taas sa BUONG paglabas, hindi lang sa dulo.
 await p.evaluate(()=>{window.__f=[];const t0=performance.now();
  const n=document.querySelector('#bTutorial');
  const tick=()=>{window.__f.push([Math.round(performance.now()-t0),Math.round(scrollY),
    n.hidden?-1:Math.round(n.getBoundingClientRect().height),n.hidden?0:+getComputedStyle(n).opacity]);
   if(performance.now()-t0<500)requestAnimationFrame(tick);};requestAnimationFrame(tick);});
 await p.locator('#bTutorialSkip').tap();
 await p.waitForTimeout(600);
 const frames=await p.evaluate(()=>window.__f);
 const ys=frames.map(f=>f[1]);
 assert(Math.max(...ys)-Math.min(...ys)<=TOL,`gumalaw ang scroll sa gitna ng paglabas: ${Math.min(...ys)}..${Math.max(...ys)}`);
 // Umuurong ang taas nang unti-unti, hindi biglaan.
 const live=frames.filter(f=>f[2]>0).map(f=>f[2]);
 assert(live.length>=3,`masyadong kaunting frame na may taas: ${live.length}`);
 assert(Math.min(...live)<Math.max(...live)*0.6,`hindi umurong ang taas: ${Math.max(...live)} -> ${Math.min(...live)}`);
 // At kumukupas.
 const op=frames.filter(f=>f[2]>0).map(f=>f[3]);
 assert(Math.min(...op)<0.5,`hindi kumupas: pinakamababang opacity ${Math.min(...op)}`);
 fs.writeFileSync(path.join(out,'dismiss-frames.json'),JSON.stringify(frames));
 await c.close();
});

await test('Next, Back, Finish and Replay move nothing on the page',async()=>{
 const{c,p}=await env({motion:'no-preference'});
 await fill(p);await step(p,2);await openTutorial(p);
 await p.evaluate(()=>scrollTo(0,0));await settle(p);
 const start=await y(p);
 let n=0;
 while(await p.locator('#bTutorialNext').isVisible()){
  await p.locator('#bTutorialNext').tap();await settle(p);n++;
  assert(Math.abs(await y(p)-start)<=TOL,`Next #${n} nag-scroll`);
  assert.equal(await at(p),'2',`Next #${n} nagpalit ng step`);
  assert(n<6,'hindi natatapos ang Next');
 }
 while(await p.locator('#bTutorialBack').isVisible()){
  await p.locator('#bTutorialBack').tap();await settle(p);
  assert(Math.abs(await y(p)-start)<=TOL,'Back nag-scroll');
  assert.equal(await at(p),'2','Back nagpalit ng step');
 }
 await p.locator('#bTutorialSkip').tap();await p.locator('#bTutorial').waitFor({state:'hidden'});await settle(p);
 const afterSkip=await y(p);
 await openTutorial(p);
 assert(Math.abs(await y(p)-afterSkip)<=TOL,'nag-scroll ang Replay');
 assert(await p.locator('#bTutorial').isVisible());
 // Finish mula sa preview: hindi isinasara ang preview at hindi gumagalaw ang pahina.
 await p.locator('.stepDot[data-progress="4"]').tap();await settle(p);
 await p.locator('#bGenerate').tap();await p.locator('#inspectDialog').waitFor({state:'visible'});await settle(p);
 await p.locator('#bTutorialFinish').tap();
 await p.locator('#bTutorial').waitFor({state:'hidden'});await settle(p);
 assert(await p.locator('#inspectDialog').isVisible(),'isinara ng Finish ang preview');
 assert.equal(await p.evaluate(()=>document.activeElement.id),'bSave');
 await c.close();
});

await test('Reduced motion dismisses at once with no transition and no movement',async()=>{
 const{c,p}=await env({motion:'reduce'});
 await fill(p);await step(p,3);await openTutorial(p);
 assert.equal(await p.locator('#bTutorial').evaluate(n=>getComputedStyle(n).transitionDuration),'0s');
 await p.evaluate(()=>scrollTo(0,0));await settle(p);
 const before=await y(p);
 await p.locator('#bTutorialSkip').tap();
 assert.equal(await p.locator('#bTutorial').evaluate(n=>n.hidden),true,'hindi agad nagtago');
 assert(Math.abs(await y(p)-before)<=TOL);
 await c.close();
});

for(const lang of['en','fil','tl'])for(const theme of['light','dark'])for(const motion of['reduce','no-preference'])
 await test(`Skip holds still at 360x640 in ${lang}/${theme}/${motion}`,async()=>{
  const{c,p}=await env({lang,theme,motion});
  await fill(p);await step(p,2);await openTutorial(p);
  await p.evaluate(()=>scrollTo(0,0));await settle(p);
  const before=await y(p);
  await p.locator('#bTutorialSkip').tap();
  await p.locator('#bTutorial').waitFor({state:'hidden'});await settle(p);
  assert(await y(p)-before<=TOL,`${lang}/${theme}/${motion}: bumaba ng ${await y(p)-before}px`);
  assert.equal(await p.locator('#bHeadline').inputValue(),'Handmade mug','nawala ang nailagay');
  assert.equal(await p.locator('.stepDot[data-progress="1"]').getAttribute('data-state'),'complete');
  const f=await focusInfo(p);assert(!f.inCard&&!f.hidden);
  await c.close();
 });

for(const e of contexts){assert.deepEqual(e.errors,[]);assert.deepEqual(e.external,[]);assert.deepEqual(e.writes,[]);}
fs.writeFileSync(path.join(out,'motion-results.json'),JSON.stringify({result:'PASS',results,
 auth:'Mocked services; emulated touch viewports only - no physical Android device'},null,2));
}finally{await b.close()}})().catch(e=>{console.error(e);process.exitCode=1});
