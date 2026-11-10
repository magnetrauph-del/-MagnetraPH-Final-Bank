// b34: explicit confirmation is separate from navigation, edits and live validity.
const{chromium}=require('playwright'),assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path');
const{env:makeEnv,step,brief,settle,pickVisual,completeSetup,resetSelect}=require('./fixtures/banner-wizard.cjs');
const out=process.env.MAGNETRA_CONFIRM_ARTIFACTS||'/tmp/magnetra-b34-review/confirmation';fs.mkdirSync(out,{recursive:true});
const results=[],contexts=[];let browser;
async function env(o){const e=await makeEnv(browser,o);contexts.push(e);return e;}
async function test(name,run){await run();results.push({name,result:'PASS'});console.log('PASS',name);}
const states=async p=>{await settle(p);return p.locator('.stepDot').evaluateAll(ns=>ns.map(n=>n.dataset.state));};
const jump=async(p,n)=>{await p.locator(`.stepDot[data-progress="${n}"]`).click();await settle(p);};
async function generate(p){await jump(p,4);await p.locator('#bGenerate').click();await p.locator('#inspectDialog').waitFor({state:'visible'});assert.deepEqual(await states(p),Array(4).fill('complete'));}
const PHOTO=path.join(__dirname,'fixtures/product-sample.png');
const HELP={en:'Tap a step number to view or edit. Select Continue to complete the step.',fil:'Tap ang step number para tingnan o i-edit. Pindutin ang Continue para makumpleto ang step.',tl:'Pindutin ang numero ng hakbang para tingnan o baguhin. Piliin ang Magpatuloy para makumpleto ito.'};
(async()=>{browser=await chromium.launch({executablePath:'/usr/bin/chromium',args:['--no-sandbox']});try{
await test('Fresh entry is pending; numbers and Back only navigate, preserve values and never confirm defaults',async()=>{
 const{c,p}=await env();assert.deepEqual(await states(p),Array(4).fill('pending'));assert.equal(await p.locator('.stepDot[aria-current]').getAttribute('data-progress'),'1');
 await jump(p,2);assert.deepEqual(await states(p),['pending','pending','pending','pending']);
 await p.locator('#bProduct').fill('Sample business');await p.locator('#bHeadline').fill('Exact headline');assert.equal((await states(p))[1],'incomplete');
 await jump(p,3);assert.equal((await states(p))[2],'pending');await p.locator('#bPrevious').click();assert.equal((await states(p))[2],'pending');
 assert.equal(await p.locator('#bHeadline').inputValue(),'Exact headline');await jump(p,4);assert.equal(await p.locator('#bCtaChoice').inputValue(),'order');
 assert(!(await states(p)).includes('complete'));await c.close();
});
await test('Viewing, focus, scroll and identical events stay pending; valid Step 3 defaults breathe and confirm without reselection',async()=>{
 const{c,p}=await env();await jump(p,2);await p.locator('#bProduct').focus();await p.locator('#bHeadline').focus();
 await p.locator('#bProduct').dispatchEvent('input');await p.evaluate(()=>scrollTo(0,150));await jump(p,1);
 assert.deepEqual(await states(p),Array(4).fill('pending'));
 await jump(p,3);assert.equal((await states(p))[2],'pending');assert(await p.locator('#bContinue').evaluate(n=>n.classList.contains('isReady')));
 assert.equal(await p.locator('#bContinue').evaluate(n=>getComputedStyle(n).animationName),'none');
 await p.emulateMedia({reducedMotion:'no-preference'});
 assert.equal(await p.locator('#bContinue').evaluate(n=>getComputedStyle(n).animationIterationCount),'3');
 const box=await p.locator('#bContinue').boundingBox();
 await p.locator('#bContinue').evaluate(n=>n.getAnimations().forEach(a=>a.finish()));await settle(p);
 assert.deepEqual(await p.locator('#bContinue').boundingBox(),box);
 await p.locator('#bCategory').focus();await settle(p);
 assert(await p.locator('#bContinue').evaluate(n=>n.getAnimations().every(a=>a.playState==='finished')));
 await p.locator('#bContinue').click();assert.equal((await states(p))[2],'complete');
 await jump(p,3);assert(!(await p.locator('#bContinue').evaluate(n=>n.classList.contains('isReady'))));
 await jump(p,2);assert(!(await p.locator('#bContinue').evaluate(n=>n.classList.contains('isReady'))));
 await p.locator('#bProduct').fill('Sample');assert(!(await p.locator('#bContinue').evaluate(n=>n.classList.contains('isReady'))));
 await p.locator('#bHeadline').fill('Headline');await settle(p);assert(await p.locator('#bContinue').evaluate(n=>n.classList.contains('isReady')));
 await p.locator('#bContinue').focus();await p.keyboard.press('Enter');assert.equal((await states(p))[1],'complete');
 await c.close();
});
await test('Manual design changes are edits; defaults can be restored to their confirmed effective values',async()=>{
 const{c,p}=await env();await jump(p,3);
 await p.locator('#bDesignStyle').selectOption('minimal');assert.equal((await states(p))[2],'incomplete');
 await p.locator('#bContinue').click();assert.equal((await states(p))[2],'complete');await jump(p,3);
 await p.locator('#bDesignStyle').selectOption('bold');assert.equal((await states(p))[2],'incomplete');
 await p.locator('#bDesignStyle').selectOption('minimal');assert.equal((await states(p))[2],'complete');
 await p.locator('#bCategory').selectOption('beauty');assert.equal((await states(p))[2],'incomplete');
 await c.close();
});
await test('Continue validates only the current step; empty optional Price and default style are accepted',async()=>{
 const{c,p}=await env();await p.locator('#bContinue').click();assert(await p.locator('#bStep1').isVisible());assert.equal(await p.evaluate(()=>document.activeElement.id),'bVisualCategory');
 await pickVisual(p,'food-spotlight');assert.equal((await states(p))[0],'incomplete');await p.locator('#bContinue').click();assert.equal((await states(p))[0],'complete');
 await p.locator('#bContinue').click();assert.equal(await p.evaluate(()=>document.activeElement.id),'bProduct');await p.locator('#bProduct').fill('Sample');await p.locator('#bContinue').click();assert.equal(await p.evaluate(()=>document.activeElement.id),'bHeadline');
 await p.locator('#bHeadline').fill('Exact headline');assert.equal(await p.locator('#bPrice').inputValue(),'');assert.equal((await states(p))[1],'incomplete');
 await p.locator('#bContinue').click();assert.equal((await states(p))[1],'complete');assert(await p.locator('#bStep3').isVisible());assert.equal(await p.locator('#bDesignStyle').inputValue(),'');
 await p.locator('#bContinue').click();assert.equal((await states(p))[2],'complete');assert.notEqual((await states(p))[3],'complete');await c.close();
});
await test('Material edits revoke green, with restoration of confirmed values; viewing and identical values preserve confirmation',async()=>{
 const{c,p}=await env();await jump(p,2);await p.locator('#bProduct').fill('Sample');await p.locator('#bHeadline').fill('Exact headline');await p.locator('#bContinue').click();assert.equal((await states(p))[1],'complete');
 await jump(p,2);await p.locator('#bHeadline').fill('  Exact headline  ');assert.equal((await states(p))[1],'complete');await p.locator('#bPrevious').click();assert.equal((await states(p))[1],'complete');
 await jump(p,2);await p.locator('#bPrice').fill('₱100');assert.equal((await states(p))[1],'incomplete');await p.locator('#bPrice').fill('');assert.equal((await states(p))[1],'complete');
 await p.locator('#bContinue').click();assert.equal((await states(p))[1],'complete');await jump(p,2);await p.locator('#bHeadline').fill('');assert.equal((await states(p))[1],'incomplete');await p.locator('#bContinue').click();assert(await p.locator('#bStep2').isVisible());assert.notEqual((await states(p))[1],'complete');await c.close();
});
await test('Invalid Generate marks owning steps red; fixing inputs stays orange until valid Generate confirms all skipped sections',async()=>{
 const{c,p}=await env();let downloads=0;p.on('download',()=>downloads++);await jump(p,4);await p.locator('#bGenerate').click();assert.deepEqual(await states(p),['invalid','invalid','pending','pending']);assert.equal(await p.evaluate(()=>document.activeElement.id),'bVisualCategory');assert(await p.locator('#inspectDialog').isHidden());assert.equal(downloads,0);
 await pickVisual(p,'food-spotlight');assert.equal((await states(p))[0],'incomplete');await jump(p,2);await p.locator('#bProduct').fill('Sample');await p.locator('#bHeadline').fill('Exact headline');assert.equal((await states(p))[1],'incomplete');
 await generate(p);assert.equal(downloads,0);await p.locator('#inspectClose').click();await jump(p,2);await p.locator('#bHeadline').fill('');assert.equal((await states(p))[1],'invalid');await p.locator('#bHeadline').fill('Exact headline');assert.equal((await states(p))[1],'complete');await p.locator('#bContinue').click();assert.equal((await states(p))[1],'complete');await c.close();
});
await test('Step 4 only confirms on successful Generate; No CTA works and format edits require reconfirmation',async()=>{
 const{c,p}=await env({setupCategory:'other'});await brief(p);await resetSelect(p,'#bCtaChoice');await p.locator('#bGenerate').click();assert.equal((await states(p))[3],'invalid');await p.locator('#bCtaChoice').selectOption('none');assert.equal((await states(p))[3],'incomplete');await generate(p);await p.locator('#inspectClose').click();
 await p.locator('input[name="bFormat"][value="story"]').check();assert.equal((await states(p))[3],'incomplete');await generate(p);await c.close();
});
await test('Category/CTA and theme/style dependencies revoke affected confirmations without auto-confirmation',async()=>{
 const{c,p}=await env();await pickVisual(p,'food-spotlight');await jump(p,2);await p.locator('#bProduct').fill('Sample');await p.locator('#bHeadline').fill('Exact headline');await generate(p);await p.locator('#inspectClose').click();
 await jump(p,3);await p.locator('#bCategory').selectOption('beauty');assert.equal(await p.locator('#bCtaChoice').inputValue(),'book');assert.deepEqual(await states(p),['complete','complete','incomplete','incomplete']);
 await generate(p);await p.locator('#inspectClose').click();await p.locator('#bAdvanced').evaluate(n=>n.open=true);await p.locator('input[name="bTheme"][value="teal"]').check();assert.equal((await states(p))[2],'incomplete');assert.equal((await states(p))[3],'incomplete');await c.close();
});
await test('Accepted photo/logo replacements revoke Step 1; rejected replacements preserve the actual confirmed assets',async()=>{
 const{c,p}=await env();await brief(p,{photo:true});await generate(p);await p.locator('#inspectClose').click();await jump(p,1);await p.locator('#bStep1 .optionalDetails summary').click();await p.locator('#bLogo').setInputFiles(PHOTO);await p.locator('#bLogoRemove').waitFor({state:'visible'});assert.equal((await states(p))[0],'incomplete');await p.locator('#bContinue').click();assert.equal((await states(p))[0],'complete');
 await jump(p,1);await p.locator('#bPhoto').setInputFiles({name:'bad.svg',mimeType:'image/svg+xml',buffer:Buffer.from('<svg/>')});await p.waitForFunction(()=>document.querySelector('#bPhotoMsg').classList.contains('isErr'));assert.equal((await states(p))[0],'complete');
 await p.locator('#bPhoto').setInputFiles(PHOTO);await p.waitForFunction(()=>!document.querySelector('#bPhotoMsg').classList.contains('isErr'));assert.equal((await states(p))[0],'incomplete');await c.close();
});
await test('Moderation failure never confirms a section and never paints an unrelated step red',async()=>{
 const{c,p}=await env();await brief(p);await jump(p,2);await p.locator('#bHeadline').fill('guaranteed sales');await jump(p,4);await p.locator('#bGenerate').click();assert(await p.locator('#inspectDialog').isHidden());assert.equal((await states(p))[1],'invalid');assert.notEqual((await states(p))[3],'invalid');assert(!(await states(p)).includes('complete'));await c.close();
});
await test('New banner and account invalidation reset confirmations, errors and private values',async()=>{
 const{c,p}=await env();await brief(p);await generate(p);await p.locator('#inspectClose').click();await p.reload();await p.locator('#app').waitFor({state:'visible'});await completeSetup(p);assert.deepEqual(await states(p),Array(4).fill('pending'));
 await jump(p,2);await p.locator('#bProduct').fill('Private sample');await p.locator('#bHeadline').fill('Exact headline');await p.locator('#bContinue').click();assert.equal((await states(p))[1],'complete');
 const cleared=await p.evaluate(()=>{window.__setUser({uid:'account-B',emailVerified:true});return{hidden:document.querySelector('#app').hidden,value:document.querySelector('#bProduct').value,states:[...document.querySelectorAll('.stepDot')].map(n=>n.dataset.state)};});assert(cleared.hidden);assert.equal(cleared.value,'');assert.deepEqual(cleared.states,Array(4).fill('pending'));await c.close();
});
for(const width of[320,360,390])for(const lang of['en','fil','tl'])for(const theme of['light','dark'])await test(`b34 helper/confirmation ${width}/${lang}/${theme}, keyboard and 200% text`,async()=>{
 const{c,p}=await env({width,lang,theme});assert.equal(await p.locator('#bStepHelp').textContent(),HELP[lang]);assert.equal(await p.locator('#bStepHelp').count(),1);
 await p.locator('.stepDot[data-progress="2"]').focus();await p.keyboard.press('Enter');await p.locator('#bProduct').fill('Sample');await p.locator('#bHeadline').fill('Exact headline');assert.equal((await states(p))[1],'incomplete');await p.locator('#bContinue').click();assert.equal((await states(p))[1],'complete');await jump(p,2);assert.equal((await states(p))[1],'complete');
 const next=lang==='en'?'fil':'en';await p.evaluate(l=>{localStorage.setItem('mgpref_lang',l);window.dispatchEvent(new StorageEvent('storage',{key:'mgpref_lang',newValue:l}));},next);await settle(p);assert.equal((await states(p))[1],'complete');assert.equal(await p.locator('#bStepHelp').textContent(),HELP[next]);await jump(p,4);assert((await p.locator('#bStepHelp').textContent()).includes('Generate Preview'));assert(await p.locator('#bContinue').isHidden());
 await p.evaluate(()=>{const ns=[document.documentElement,...document.querySelectorAll('body *')].filter(n=>n instanceof HTMLElement),sizes=ns.map(n=>parseFloat(getComputedStyle(n).fontSize)*2);ns.forEach((n,i)=>n.style.fontSize=sizes[i]+'px');});assert(await p.evaluate(()=>document.documentElement.scrollWidth<=innerWidth));const sizes=await p.locator('.stepDot').evaluateAll(ns=>ns.map(n=>{const r=n.getBoundingClientRect(),a=getComputedStyle(n,'::after');return [r.width-2*parseFloat(a.left),r.height-2*parseFloat(a.top)];}));assert(sizes.every(([w,h])=>w>=44&&h>=44));
 if(width===390)await p.screenshot({path:path.join(out,`b34-${lang}-${theme}.png`),fullPage:true});await c.close();
});
for(const e of contexts){assert.deepEqual(e.errors,[]);assert.deepEqual(e.external,[]);assert.deepEqual(e.writes,[]);}fs.writeFileSync(path.join(out,'confirmation-results.json'),JSON.stringify({result:'PASS',results,auth:'Mocked services; physical Android acceptance pending'},null,2));
}finally{await browser.close()}})().catch(e=>{console.error(e);fs.writeFileSync(path.join(out,'confirmation-results.json'),JSON.stringify({results,failure:e.message},null,2));process.exitCode=1});
