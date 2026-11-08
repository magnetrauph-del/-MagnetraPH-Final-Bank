const {base,install}=require('./account.cjs');
const path=require('node:path');
const settle=p=>p.evaluate(()=>new Promise(r=>requestAnimationFrame(()=>requestAnimationFrame(r))));
async function env(browser,{width=390,lang='en',theme='light',touch=false}={}){
 const c=await browser.newContext({viewport:{width,height:844},deviceScaleFactor:1,reducedMotion:'reduce',serviceWorkers:'block',hasTouch:touch,isMobile:touch}),external=await install(c,{lang,theme}),errors=[],writes=[];
 const p=await c.newPage();p.on('pageerror',e=>errors.push(e.message));p.on('console',m=>{if(m.type()==='error')errors.push(m.text());});p.on('request',r=>{if(!['GET','HEAD'].includes(r.method()))writes.push(r.method()+' '+r.url())});
 await p.goto(base+'/banner.html');await p.locator('#app').waitFor({state:'visible'});return{c,p,external,errors,writes};
}
async function step(p,n){
 if(await p.locator('#inspectDialog').isVisible())await p.locator('#inspectClose').click();
 let current=Number(await p.locator('[data-wizard-step]:visible').getAttribute('data-wizard-step'));
 while(current<n){await p.locator('#bContinue').click();current++;await p.locator('#bStep'+current).waitFor({state:'visible'});}
 while(current>n){await p.locator('#bPrevious').click();current--;await p.locator('#bStep'+current).waitFor({state:'visible'});}
}
// Ang lumang tatlong pangalan ay tumuturo sa katumbas nilang bagong visual.
const VISUAL_ALIAS={workspace:'technology-spotlight',abstract:'abstract-spotlight',botanical:'agriculture-spotlight'};
async function pickVisual(p,visual='workspace'){
 const id=VISUAL_ALIAS[visual]||visual,cut=id.lastIndexOf('-');
 await p.locator('#bVisualCategory').selectOption(id.slice(0,cut));
 await p.locator(`#bVisualPicks .visualBtn[data-visual="${id}"]`).click();
}
// Card na ang buong listahan ng layout, kaya pinipindot, hindi pinipili sa select.
// Isang listahan ng card: binubuksan muna ang lima kung nakatago ang hinahanap.
async function openLayouts(p){
 if(await p.locator('#bMoreLayouts').getAttribute('aria-expanded')==='false')
  await p.locator('#bMoreLayouts').click();
}
async function pickLayout(p,id){
 const card=p.locator(`#bPreset .presetButton[data-preset="${id}"]`);
 if(!await card.isVisible())await openLayouts(p);
 await card.click();
}
const currentLayout=p=>p.locator('#bPreset').getAttribute('data-layout');
async function brief(p,{photo=false,category='food',preset=null,visual='workspace'}={}){
 if(photo){await p.locator('#bPhoto').setInputFiles(path.join(__dirname,'../../public/dashboard-banner-sample.webp'));await p.locator('#bPhotoRemove').waitFor({state:'visible'});}else await pickVisual(p,visual);
 await step(p,2);await p.locator('#bProduct').fill('Sample product');await p.locator('#bHeadline').fill('Your exact headline');await p.locator('#bPrice').fill('Sample ₱100');await step(p,3);await p.locator('#bCategory').selectOption(category);
 if(preset)await pickLayout(p,preset);
 await step(p,4);await p.locator('#bCtaChoice').selectOption('custom');await p.locator('#bCta').fill('View sample');await settle(p);
}
async function preview(p){await step(p,4);await p.locator('#bGenerate').click();await p.locator('#inspectDialog').waitFor({state:'visible'});await settle(p);}
async function exportPNG(p,file){
 if(!await p.locator('#inspectDialog').isVisible())await preview(p);
 const download=p.waitForEvent('download');await p.locator('#bSave').click();const d=await download;await d.saveAs(file);await p.locator('#resultNote').waitFor({state:'visible'});
 return p.locator('#resultImg').evaluate(async n=>{await n.decode();return{w:n.naturalWidth,h:n.naturalHeight};});
}
// Binabawi ang napiling visual sa pamamagitan ng muling pagpindot dito.
async function revertVisual(p){
 const chosen=p.locator('#bVisualPicks .visualBtn[aria-pressed="true"]');
 if(await chosen.count())await chosen.first().click();
}

// b27: hindi na mapipili ng tao ang paanyaya (disabled+hidden), kaya ang code na lang
// ang makakapagbalik dito - gaya ng ginagawa ng reset ng app. Ang pagpapatunay na
// hinaharang ang tao ay nasa sariling test, hindi rito.
const resetSelect=(p,sel)=>p.locator(sel).evaluate(n=>{n.value='';
  n.dispatchEvent(new Event('change',{bubbles:true}));});

module.exports={resetSelect,base,env,step,brief,preview,exportPNG,settle,pickVisual,revertVisual,pickLayout,currentLayout,openLayouts};
