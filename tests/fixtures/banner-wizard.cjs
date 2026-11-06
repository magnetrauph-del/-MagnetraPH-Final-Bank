const {base,install}=require('./account.cjs');
const path=require('node:path');
const settle=p=>p.evaluate(()=>new Promise(r=>requestAnimationFrame(()=>requestAnimationFrame(r))));
async function env(browser,{width=390,lang='en',theme='light'}={}){
 const c=await browser.newContext({viewport:{width,height:844},deviceScaleFactor:1,reducedMotion:'reduce',serviceWorkers:'block'}),external=await install(c,{lang,theme}),errors=[],writes=[];
 const p=await c.newPage();p.on('pageerror',e=>errors.push(e.message));p.on('console',m=>{if(m.type()==='error')errors.push(m.text());});p.on('request',r=>{if(!['GET','HEAD'].includes(r.method()))writes.push(r.method()+' '+r.url())});
 await p.goto(base+'/banner.html');await p.locator('#app').waitFor({state:'visible'});return{c,p,external,errors,writes};
}
async function step(p,n){
 if(await p.locator('#inspectDialog').isVisible())await p.locator('#inspectClose').click();
 let current=Number(await p.locator('[data-wizard-step]:visible').getAttribute('data-wizard-step'));
 while(current<n){await p.locator('#bContinue').click();current++;await p.locator('#bStep'+current).waitFor({state:'visible'});}
 while(current>n){await p.locator('#bPrevious').click();current--;await p.locator('#bStep'+current).waitFor({state:'visible'});}
}
async function brief(p,{photo=false,category='food',preset=null,visual='workspace'}={}){
 if(photo){await p.locator('#bPhoto').setInputFiles(path.join(__dirname,'../../public/dashboard-banner-sample.webp'));await p.locator('#bPhotoRemove').waitFor({state:'visible'});}else await p.locator('#bVisual').selectOption(visual);
 await step(p,2);await p.locator('#bProduct').fill('Sample product');await p.locator('#bHeadline').fill('Your exact headline');await p.locator('#bPrice').fill('Sample ₱100');await step(p,3);await p.locator('#bCategory').selectOption(category);
 if(preset){await p.locator('#bAllPresets summary').click();await p.locator('#bPreset').selectOption(preset);}
 await step(p,4);await p.locator('#bCtaChoice').selectOption('custom');await p.locator('#bCta').fill('View sample');await settle(p);
}
async function preview(p){await step(p,4);await p.locator('#bGenerate').click();await p.locator('#inspectDialog').waitFor({state:'visible'});await settle(p);}
async function exportPNG(p,file){
 if(!await p.locator('#inspectDialog').isVisible())await preview(p);
 const download=p.waitForEvent('download');await p.locator('#bSave').click();const d=await download;await d.saveAs(file);await p.locator('#resultNote').waitFor({state:'visible'});
 return p.locator('#resultImg').evaluate(async n=>{await n.decode();return{w:n.naturalWidth,h:n.naturalHeight};});
}
module.exports={base,env,step,brief,preview,exportPNG,settle};
