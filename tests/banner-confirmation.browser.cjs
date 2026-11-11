// Guided workflow integration: access, evidence and confirmation are independent.
const{chromium}=require('playwright'),assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path');
const{env:makeEnv,navigate:step,reach,brief,settle,pickVisual,completeSetup,resetSelect}=require('./fixtures/banner-wizard.cjs');
const out=process.env.MAGNETRA_CONFIRM_ARTIFACTS||'/tmp/magnetra-guided/confirmation';fs.mkdirSync(out,{recursive:true});
const results=[],contexts=[];let browser;
async function env(o){const e=await makeEnv(browser,o);contexts.push(e);return e;}
async function test(name,run){await run();results.push({name,result:'PASS'});console.log('PASS',name);}
const states=async p=>{await settle(p);return p.locator('.stepDot').evaluateAll(ns=>ns.map(n=>n.dataset.state));};
const jump=reach;
async function generate(p){await jump(p,4);await p.locator('#bGenerate').click();await p.locator('#inspectDialog').waitFor({state:'visible'});assert.deepEqual(await states(p),Array(4).fill('complete'));}
const PHOTO=path.join(__dirname,'fixtures/product-sample.png');
const HELP={en:'Tap a step number to view or edit. Select Continue to complete the step.',fil:'Tap ang step number para tingnan o i-edit. Pindutin ang Continue para makumpleto ang step.',tl:'Pindutin ang numero ng hakbang para tingnan o baguhin. Piliin ang Magpatuloy para makumpleto ito.'};
(async()=>{browser=await chromium.launch({executablePath:'/usr/bin/chromium',args:['--no-sandbox']});try{
for(const width of [320,360,390])for(const theme of ['light','dark'])for(const scale of [1.04,1.05])await test(`Inner breathing, stable target and keyboard focus ${width}/${theme}/${scale}`,async()=>{
 const{c,p}=await env({width,theme,lang:{320:'en',360:'fil',390:'tl'}[width]});await jump(p,3);await p.locator('#bContinue').evaluate((n,s)=>n.style.setProperty('--continue-scale',s),String(scale));await p.locator('#bPrevious').focus();await p.keyboard.press('Tab');
 assert.equal(await p.evaluate(()=>document.activeElement.id),'bContinue');
 await p.emulateMedia({reducedMotion:'no-preference'});await p.waitForFunction(()=>document.querySelector('#bContinue').classList.contains('isReady'));
 const sample=at=>p.locator('#bContinue').evaluate((n,at)=>{for(const a of n.getAnimations({subtree:true})){a.pause();a.currentTime=at;}
  const surface=n.querySelector('.continueSurface'),s=getComputedStyle(surface),button=getComputedStyle(n),a=new DOMMatrixReadOnly(s.transform),back=document.querySelector('#bPrevious').getBoundingClientRect(),inner=surface.getBoundingClientRect(),label=surface.firstElementChild.getBoundingClientRect();
  return{scale:a.a,flow:[n.offsetLeft,n.offsetTop,n.offsetWidth,n.offsetHeight],rect:[n.getBoundingClientRect().x,n.getBoundingClientRect().y,n.getBoundingClientRect().width,n.getBoundingClientRect().height],back:[back.x,back.y,back.width,back.height],inner:[inner.left,inner.top,inner.right,inner.bottom],labelWidth:label.width,outerTransform:button.transform,cycles:s.animationIterationCount,duration:s.animationDuration,
    focus:n.matches(':focus-visible')&&button.outlineStyle!=='none'&&parseFloat(button.outlineWidth)>0,overflow:document.documentElement.scrollWidth>innerWidth};},at);
 const start=await sample(0),peak=await sample(900);assert.equal(start.scale,1);assert(Math.abs(peak.scale-scale)<0.00001);
 assert.deepEqual(peak.flow,start.flow);assert.deepEqual(peak.rect,start.rect);assert.deepEqual(peak.back,start.back);assert.equal(peak.overflow,false);assert(peak.labelWidth>start.labelWidth);assert.equal(peak.outerTransform,'none');assert(peak.inner[0]>=peak.rect[0]-.1&&peak.inner[1]>=peak.rect[1]-.1&&peak.inner[2]<=peak.rect[0]+peak.rect[2]+.1&&peak.inner[3]<=peak.rect[1]+peak.rect[3]+.1,'surface escapes the stable target');assert(peak.rect[0]-(peak.back[0]+peak.back[2])>=9.9);assert.equal(peak.cycles,'3');assert.equal(peak.duration,'1.8s');assert(peak.focus);if(width===390)await p.screenshot({path:path.join(out,`continue-${theme}-${scale}.png`)});
 const end=await sample(5400);assert.equal(end.scale,1);
 await p.emulateMedia({reducedMotion:'reduce'});await settle(p);assert.equal(await p.locator('#bContinue .continueSurface').evaluate(n=>getComputedStyle(n).animationName),'none');
 await p.emulateMedia({reducedMotion:'no-preference'});await settle(p);assert(!(await p.locator('#bContinue').evaluate(n=>n.classList.contains('isReady'))));await c.close();
});
await test('Reduced motion and hidden document suppress attention; returning visible does not replay a consumed revision',async()=>{
 const{c,p}=await env();await jump(p,3);await p.locator('#bContinue').scrollIntoViewIfNeeded();await settle(p);
 assert(!(await p.locator('#bContinue').evaluate(n=>n.classList.contains('isReady'))));
 await p.evaluate(()=>{Object.defineProperty(document,'hidden',{configurable:true,value:true});document.dispatchEvent(new Event('visibilitychange'));});
 await p.emulateMedia({reducedMotion:'no-preference'});await settle(p);assert(!(await p.locator('#bContinue').evaluate(n=>n.classList.contains('isReady'))));
 await p.evaluate(()=>{Object.defineProperty(document,'hidden',{configurable:true,value:false});document.dispatchEvent(new Event('visibilitychange'));});
 await p.waitForFunction(()=>document.querySelector('#bContinue').classList.contains('isReady'));
 await p.evaluate(()=>{Object.defineProperty(document,'hidden',{configurable:true,value:true});document.dispatchEvent(new Event('visibilitychange'));});
 assert(!(await p.locator('#bContinue').evaluate(n=>n.classList.contains('isReady'))));
 await p.evaluate(()=>{Object.defineProperty(document,'hidden',{configurable:true,value:false});document.dispatchEvent(new Event('visibilitychange'));});
 await settle(p);assert(!(await p.locator('#bContinue').evaluate(n=>n.classList.contains('isReady'))));await c.close();
});
// Hold only the next decoder read; callers release it without adding timing delays.
async function holdDecode(p){await p.evaluate(()=>{const read=Blob.prototype.arrayBuffer;let hold=true;Blob.prototype.arrayBuffer=async function(){if(hold){hold=false;await new Promise(r=>window.__releaseTargetDecode=r);}return read.call(this);};});}
async function startHeld(p,selector,file){await holdDecode(p);await p.locator(selector).setInputFiles(file);await p.waitForFunction(()=>typeof window.__releaseTargetDecode==='function');}
const isAnimating=p=>p.locator('#bContinue').evaluate(n=>n.classList.contains('isReady'));
await test('Older photo completion retains the photo without overriding newer Service Visual intent; busy attention stops immediately and resumes when ready',async()=>{
 const{c,p}=await env({reducedMotion:'no-preference'});await pickVisual(p,'food-spotlight');await p.locator('#bContinue').scrollIntoViewIfNeeded();
 await p.waitForFunction(()=>document.querySelector('#bContinue').classList.contains('isReady'));
 await startHeld(p,'#bPhoto',PHOTO);assert.equal(await isAnimating(p),false);assert.equal((await states(p))[0],'pending');
 const newer=p.locator('#bVisualPicks .visualBtn').nth(1),id=await newer.getAttribute('data-visual');await newer.click();
 assert.equal(await p.locator('.visualBtn[aria-pressed="true"]').getAttribute('data-visual'),id);assert.equal(await isAnimating(p),false);
 await p.evaluate(()=>window.__releaseTargetDecode());await p.locator('#bPhotoRemove').waitFor({state:'visible'});await settle(p);
 assert.equal(await p.locator('#bUploadArea').getAttribute('data-active'),'false');
 assert.equal(await p.locator('.visualBtn[aria-pressed="true"]').getAttribute('data-visual'),id);
 assert(await p.locator('#bPhotoThumb').evaluate(n=>n.width>0&&n.height>0));
 await p.locator('#bContinue').scrollIntoViewIfNeeded();await p.waitForFunction(()=>document.querySelector('#bContinue').classList.contains('isReady'));
 await c.close();
});
await test('Current photo intent activates photo while retaining the inactive visual; removal reveals the same visual',async()=>{
 const{c,p}=await env();await pickVisual(p,'food-spotlight');await startHeld(p,'#bPhoto',PHOTO);
 assert.equal(await isAnimating(p),false);await p.evaluate(()=>window.__releaseTargetDecode());await p.locator('#bPhotoRemove').waitFor({state:'visible'});await settle(p);
 assert.equal(await p.locator('#bUploadArea').getAttribute('data-active'),'true');assert.equal(await p.locator('.visualBtn[aria-pressed="true"]').count(),0);
 await step(p,2);await step(p,1);await p.locator('#bPhotoRemove').click();await settle(p);assert.equal(await p.locator('.visualBtn[aria-pressed="true"]').getAttribute('data-visual'),'food-spotlight');assert.equal((await states(p))[0],'complete');await c.close();
});
await test('Rejected photo loading is a system transition and restores unchanged confirmation without orange',async()=>{
 const{c,p}=await env({reducedMotion:'no-preference'});await pickVisual(p,'food-spotlight');await p.locator('#bContinue').click();await jump(p,1);assert.equal((await states(p))[0],'complete');
 await startHeld(p,'#bPhoto',{name:'bad.svg',mimeType:'image/svg+xml',buffer:Buffer.from('<svg/>')});assert.equal(await isAnimating(p),false);assert.equal((await states(p))[0],'pending');
 await p.evaluate(()=>window.__releaseTargetDecode());await p.waitForFunction(()=>document.querySelector('#bPhotoMsg').classList.contains('isErr'));
 assert.equal((await states(p))[0],'complete');assert.equal(await isAnimating(p),false);await c.close();
});
await test('Logo loading also suppresses attention immediately and accepted completion becomes eligible',async()=>{
 const{c,p}=await env({reducedMotion:'no-preference'});await pickVisual(p,'food-spotlight');await p.locator('#bStep1 .optionalDetails summary').click();
 await p.locator('#bContinue').scrollIntoViewIfNeeded();await p.waitForFunction(()=>document.querySelector('#bContinue').classList.contains('isReady'));
 await startHeld(p,'#bLogo',PHOTO);assert.equal(await isAnimating(p),false);
 await p.evaluate(()=>window.__releaseTargetDecode());await p.locator('#bLogoRemove').waitFor({state:'visible'});
 await p.locator('#bContinue').scrollIntoViewIfNeeded();await p.waitForFunction(()=>document.querySelector('#bContinue').classList.contains('isReady'));await c.close();
});
await test('Every supported setup category yields pending, valid Step 3 defaults accepted by Continue',async()=>{
 const first=await env();const ids=await first.p.evaluate(async()=>{const m=await import('./banner-catalog.js?v=2');return m.CATEGORIES.map(c=>c.id)});await first.c.close();assert.equal(ids.length,21);
 for(const category of ids){const{c,p}=await env({setupCategory:category});assert.deepEqual(await states(p),Array(4).fill('pending'),category);await jump(p,3);assert.equal((await states(p))[2],'pending',category);await p.locator('#bContinue').click();assert.equal((await states(p))[2],'complete',category);await c.close();}
});
await test('Late accepted image cannot restore or confirm a different-account editor',async()=>{
 const{c,p}=await env();await p.route('**/dashboard.html',r=>r.fulfill({contentType:'text/html',body:'<!doctype html><title>Account switched</title><p>New account page</p>'}));await p.evaluate(()=>{const read=Blob.prototype.arrayBuffer;let hold=true;Blob.prototype.arrayBuffer=async function(){if(hold){hold=false;await new Promise(r=>window.__releaseDecode=r);}return read.call(this);};});
 await p.locator('#bPhoto').setInputFiles(PHOTO);await p.waitForFunction(()=>typeof window.__releaseDecode==='function');
 const cleared=await p.evaluate(()=>{window.__setUser({uid:'account-B',emailVerified:true});window.__releaseDecode();return{hidden:document.querySelector('#app').hidden,value:document.querySelector('#bProduct').value,states:[...document.querySelectorAll('.stepDot')].map(n=>n.dataset.state)};});
 assert(cleared.hidden);assert.equal(cleared.value,'');assert.deepEqual(cleared.states,Array(4).fill('pending'));
 await p.waitForURL('**/dashboard.html');assert.equal(await p.locator('#bPhoto').count(),0);await c.close();
});
await test('N1–N5: locked future steps resist DOM/controller events; invalid Continue focuses; green alone never unlocks',async()=>{
 const{c,p}=await env();assert.deepEqual(await states(p),Array(4).fill('pending'));
 for(const n of [2,3,4]){const dot=p.locator(`.stepDot[data-progress="${n}"]`);assert(await dot.isDisabled());assert.equal(await dot.getAttribute('aria-disabled'),'true');await dot.dispatchEvent('click');}
 assert(await p.locator('#bStep1').isVisible());await p.locator('#bContinue').click();assert.equal((await states(p))[0],'incomplete');assert.equal(await p.evaluate(()=>document.activeElement.id),'bVisualCategory');assert(await p.locator('.stepDot[data-progress="2"]').isDisabled());
 await pickVisual(p,'food-spotlight');assert.equal((await states(p))[0],'complete');assert(await p.locator('.stepDot[data-progress="2"]').isDisabled());
 await p.locator('#bContinue').click();assert(await p.locator('#bStep2').isVisible());assert(await p.locator('.stepDot[data-progress="3"]').isDisabled());
 await p.locator('#bProduct').fill('Beans');assert.equal((await states(p))[1],'incomplete');await p.locator('#bContinue').click();assert.equal((await states(p))[1],'incomplete');assert.equal(await p.evaluate(()=>document.activeElement.id),'bHeadline');assert(await p.locator('.stepDot[data-progress="3"]').isDisabled());
 await c.close();
});
await test('S1–S9/N6/N7: initial typing, completion loss, unchanged events, correction and retained access',async()=>{
 const{c,p}=await env();await pickVisual(p);await step(p,2);
 await p.locator('#bProduct').focus();await p.locator('#bProduct').dispatchEvent('input');await p.evaluate(()=>scrollTo(0,140));assert.equal((await states(p))[1],'pending');
 await p.locator('#bProduct').fill('Beans');assert.equal((await states(p))[1],'incomplete');await step(p,1);assert.equal((await states(p))[1],'incomplete');
 await step(p,2);await p.locator('#bHeadline').fill('Fresh roast');assert.equal((await states(p))[1],'complete');assert(await p.locator('.stepDot[data-progress="3"]').isDisabled());
 await step(p,3);await p.locator('#bContinue').click();await step(p,2);await p.locator('#bHeadline').fill('');assert.equal((await states(p))[1],'incomplete');
 await step(p,4);assert.equal((await states(p))[1],'incomplete');await step(p,1);assert(await p.locator('.stepDot[data-progress="4"]').isEnabled());await step(p,4);assert(await p.locator('#bGenerate').isVisible());await c.close();
});
await test('E3–E6: optional events cannot claim unseen system required values; manual design evidence is distinct',async()=>{
 const{c,p}=await env();await pickVisual(p);await step(p,2);
 await p.locator('#bHeadline').evaluate(n=>n.value='System headline');await p.locator('#bProduct').fill('User product');assert.equal((await states(p))[1],'pending');
 await p.locator('#bPrice').fill('₱100');assert.equal((await states(p))[1],'pending');await p.locator('#bHeadline').fill('User headline');assert.equal((await states(p))[1],'complete');
 await step(p,3);assert.equal((await states(p))[2],'pending');await p.locator('#bCategory').evaluate(n=>n.value='beauty');await settle(p);await step(p,2);await step(p,3);assert.equal((await states(p))[2],'pending');
 await p.locator('#bDesignStyle').selectOption('brand');assert.equal((await states(p))[2],'complete');assert(await p.locator('.stepDot[data-progress="4"]').isDisabled());await c.close();
});
await test('E7/E8/V1/V2: suggested CTA pending, No CTA green, Custom CTA requires text; optional safety remains authoritative',async()=>{
 const{c,p}=await env();await reach(p,4);assert.equal((await states(p))[3],'pending');await p.locator('#bCtaChoice').selectOption('none');assert.equal((await states(p))[3],'complete');
 await p.locator('#bCtaChoice').selectOption('custom');assert.equal((await states(p))[3],'incomplete');await p.locator('#bGenerate').click();assert.equal((await states(p))[3],'invalid');assert.equal(await p.evaluate(()=>document.activeElement.id),'bCta');
 await p.locator('#bCta').fill('Ask us');assert.equal((await states(p))[3],'complete');await p.locator('#bOffer').fill('guaranteed profit');await p.locator('#bGenerate').click();assert.equal((await states(p))[3],'invalid');assert.equal(await p.evaluate(()=>document.activeElement.id),'bOffer');
 await p.locator('#bOffer').fill('');await p.locator('#bCtaChoice').selectOption('none');await generate(p);assert.deepEqual(await states(p),Array(4).fill('complete'));await c.close();
});
await test('R1–R3/C1: optional valid edit revokes confirmation, green stays and attention returns; exact restoration suppresses attention',async()=>{
 const{c,p}=await env({reducedMotion:'no-preference'});await brief(p);await step(p,2);
 await p.locator('#bContinue').scrollIntoViewIfNeeded();await settle(p);assert.equal(await isAnimating(p),false);
 const price=await p.locator('#bPrice').inputValue();await p.locator('#bPrice').fill('₱200');assert.equal((await states(p))[1],'complete');await p.locator('#bContinue').scrollIntoViewIfNeeded();await p.waitForFunction(()=>document.querySelector('#bContinue').classList.contains('isReady'));
 await p.locator('#bPrice').fill(price);await settle(p);assert.equal((await states(p))[1],'complete');assert.equal(await isAnimating(p),false);
 await c.close();
});
await test('C1/C2: automatic green still awaits confirmation and attention starts only after offscreen waiting',async()=>{
 const{c,p}=await env({reducedMotion:'no-preference'});await p.setViewportSize({width:390,height:420});await pickVisual(p);await step(p,2);await p.locator('#bProduct').fill('Beans');await p.locator('#bHeadline').fill('Fresh roast');
 await p.setViewportSize({width:390,height:420});await p.evaluate(()=>scrollTo(0,0));await settle(p);assert(await p.locator('#bContinue').evaluate(n=>n.getBoundingClientRect().top>=innerHeight));assert.equal(await isAnimating(p),false);await p.waitForTimeout(5600);assert.equal(await isAnimating(p),false);
 await p.locator('#bContinue').scrollIntoViewIfNeeded();await p.waitForFunction(()=>document.querySelector('#bContinue').classList.contains('isReady'));assert.equal((await states(p))[1],'complete');
 await p.locator('#bContinue').click();assert(await p.locator('#bStep3').isVisible());await step(p,2);assert.equal(await isAnimating(p),false);await c.close();
});
await test('A3: leaving while an asset is unresolved defers orange until an actual failure',async()=>{
 const{c,p}=await env();await pickVisual(p,'food-spotlight');await step(p,2);await step(p,1);await pickVisual(p,'food-spotlight');
 await startHeld(p,'#bPhoto',{name:'bad.svg',mimeType:'image/svg+xml',buffer:Buffer.from('<svg/>')});await step(p,2);assert.equal((await states(p))[0],'pending');
 await p.evaluate(()=>window.__releaseTargetDecode());await p.waitForFunction(()=>document.querySelector('#bPhotoMsg').classList.contains('isErr'));assert.equal((await states(p))[0],'incomplete');await c.close();
});
await test('Continue-only content error resolves: red → green → orange on completion loss and invalid Continue; next step stays locked',async()=>{
 const{c,p}=await env();let generates=0,downloads=0;p.on('download',()=>downloads++);
 await p.exposeFunction('__reviewGenerate',()=>generates++);await p.locator('#bGenerate').evaluate(n=>n.addEventListener('click',()=>window.__reviewGenerate()));
 await pickVisual(p);await step(p,2);await p.locator('#bProduct').fill('Beans');await p.locator('#bHeadline').fill('guaranteed profit');await p.locator('#bContinue').click();
 assert.equal((await states(p))[1],'invalid');assert.equal(await p.evaluate(()=>document.activeElement.id),'bHeadline');assert(await p.locator('#bStudioError').isVisible());
 await p.locator('#bHeadline').fill('Fresh roast');assert.equal((await states(p))[1],'complete');assert(await p.locator('#bStudioError').isHidden());
 await p.locator('#bHeadline').fill('');assert.equal((await states(p))[1],'incomplete');assert(await p.locator('#bStudioError').isHidden());
 await p.locator('#bContinue').click();assert.equal((await states(p))[1],'incomplete');assert.equal(await p.evaluate(()=>document.activeElement.id),'bHeadline');assert.equal(await p.locator('#bHeadline').getAttribute('aria-invalid'),'true');
 assert.equal((await p.locator('#bStudioError').textContent()).trim(),'Type a headline first.');assert(await p.locator('.stepDot[data-progress="3"]').isDisabled());assert(await p.locator('#bStep2').isVisible());
 await p.locator('#bProduct').fill('');await p.locator('#bContinue').click();assert.equal((await states(p))[1],'incomplete');assert.equal(await p.evaluate(()=>document.activeElement.id),'bProduct');
 assert.equal(generates,0);assert.equal(downloads,0);assert(await p.locator('#inspectDialog').isHidden());await c.close();
});
await test('An unresolved Continue content error keeps red through unrelated required/optional edits, then clears when corrected',async()=>{
 const{c,p}=await env();await pickVisual(p);await step(p,2);await p.locator('#bProduct').fill('Beans');await p.locator('#bHeadline').fill('guaranteed profit');await p.locator('#bContinue').click();assert.equal((await states(p))[1],'invalid');
 await p.locator('#bPrice').fill('₱100');assert.equal((await states(p))[1],'invalid');await p.locator('#bProduct').fill('');assert.equal((await states(p))[1],'invalid');await p.locator('#bProduct').fill('Beans');assert.equal((await states(p))[1],'invalid');
 await p.locator('#bHeadline').fill('Fresh roast');assert.equal((await states(p))[1],'complete');await p.locator('#bHeadline').fill('');assert.equal((await states(p))[1],'incomplete');assert(await p.locator('.stepDot[data-progress="3"]').isDisabled());await c.close();
});
await test('Generate history remains red for later missing required values after a Continue content error is corrected',async()=>{
 const{c,p}=await env();await reach(p,4);await step(p,2);await p.locator('#bHeadline').fill('');await step(p,4);await p.locator('#bGenerate').click();assert.equal((await states(p))[1],'invalid');assert.equal(await p.evaluate(()=>document.activeElement.id),'bHeadline');
 await p.locator('#bHeadline').fill('guaranteed profit');await p.locator('#bContinue').click();assert.equal((await states(p))[1],'invalid');await p.locator('#bHeadline').fill('Fresh roast');assert.equal((await states(p))[1],'complete');
 await p.locator('#bHeadline').fill('');assert.equal((await states(p))[1],'invalid');await p.locator('#bContinue').click();assert.equal((await states(p))[1],'invalid');assert.equal(await p.evaluate(()=>document.activeElement.id),'bHeadline');
 assert.equal(await p.locator('#bHeadline').getAttribute('aria-invalid'),'true');assert(await p.locator('.stepDot[data-progress="3"]').isEnabled());assert(await p.locator('.stepDot[data-progress="4"]').isEnabled());assert(await p.locator('#inspectDialog').isHidden());await c.close();
});
await test('V3/V4/N8: final errors own the correct fields and navigation never generates or downloads',async()=>{
 const{c,p}=await env();let downloads=0;p.on('download',()=>downloads++);await reach(p,4);await step(p,2);await p.locator('#bProduct').fill('');await p.locator('#bHeadline').fill('');await step(p,4);await p.locator('#bGenerate').click();
 assert.equal(await p.evaluate(()=>document.activeElement.id),'bProduct');assert.equal((await states(p))[1],'invalid');assert.notEqual((await states(p))[3],'invalid');assert(await p.locator('#inspectDialog').isHidden());assert.equal(downloads,0);
 await p.locator('#bProduct').fill('Beans');await p.locator('#bHeadline').fill('guaranteed profit');await p.locator('#bContinue').click();assert.equal((await states(p))[1],'invalid');assert(await p.locator('#bStep2').isVisible());
 await p.locator('#bHeadline').fill('Fresh roast');assert.equal((await states(p))[1],'complete');await step(p,4);await generate(p);assert.equal(downloads,0);await c.close();
});
await test('V4: cross-field prohibited claims remain blocked with single-step ownership',async()=>{
 const{c,p}=await env();await brief(p);await step(p,2);await p.locator('#bHeadline').fill('guaranteed');await p.locator('#bPrice').fill('profit');await step(p,4);await p.locator('#bGenerate').click();assert(await p.locator('#inspectDialog').isHidden());assert.equal((await states(p))[1],'invalid');assert.notEqual((await states(p))[3],'invalid');await c.close();
});
await test('A5/R4: a new banner resets access, values and confirmations',async()=>{
 const{c,p}=await env();await brief(p);await generate(p);await p.locator('#inspectClose').click();await p.reload();await p.locator('#app').waitFor({state:'visible'});await completeSetup(p);assert.deepEqual(await states(p),Array(4).fill('pending'));assert(await p.locator('.stepDot[data-progress="2"]').isDisabled());assert.equal(await p.locator('#bProduct').inputValue(),'');await c.close();
});
await test('E3: optional logo alone never completes required Step 1 asset work',async()=>{
 const{c,p}=await env();await p.locator('#bStep1 .optionalDetails summary').click();await p.locator('#bLogo').setInputFiles(PHOTO);await p.locator('#bLogoRemove').waitFor({state:'visible'});assert.equal((await states(p))[0],'pending');assert(await p.locator('.stepDot[data-progress="2"]').isDisabled());await p.locator('#bContinue').click();assert.equal((await states(p))[0],'incomplete');assert.equal(await p.evaluate(()=>document.activeElement.id),'bVisualCategory');await c.close();
});
await test('E3/A2: optional logo loading does not hide a known missing required photo or visual',async()=>{
 const{c,p}=await env();await p.locator('#bStep1 .optionalDetails summary').click();await startHeld(p,'#bLogo',PHOTO);await p.locator('#bContinue').click();assert.equal((await states(p))[0],'incomplete');assert.equal(await p.evaluate(()=>document.activeElement.id),'bVisualCategory');assert(await p.locator('.stepDot[data-progress="2"]').isDisabled());assert.equal(await isAnimating(p),false);await p.evaluate(()=>window.__releaseTargetDecode());await p.locator('#bLogoRemove').waitFor({state:'visible'});assert.equal((await states(p))[0],'incomplete');await c.close();
});
await test('V5: failed render-fit cannot confirm edited work; attention still recognizes its pending Continue',async()=>{
 const{c,p}=await env();await brief(p);await step(p,2);await p.locator('#bHeadline').fill('W'.repeat(60));await step(p,4);await p.locator('#bAdvanced > summary').click();await p.locator('#bDetail').fill('W'.repeat(115));await p.locator('#bOffer').fill('W'.repeat(64));await p.locator('#bGenerate').click();assert(await p.locator('#inspectDialog').isHidden());assert(await p.locator('#bStudioError').isVisible());assert(await p.locator('#bStep2').isVisible());await p.emulateMedia({reducedMotion:'no-preference'});await p.locator('#bContinue').scrollIntoViewIfNeeded();await p.waitForFunction(()=>document.querySelector('#bContinue').classList.contains('isReady'));await c.close();
});
for(const width of [320,360,390])for(const lang of ['en','fil','tl'])for(const theme of ['light','dark'])await test(`U1/U2: guided access/status, marker geometry, keyboard, language, enlarged text ${width}/${lang}/${theme}`,async()=>{
 const{c,p}=await env({width,lang,theme});assert((await p.locator('.stepDot[data-progress="3"]').getAttribute('aria-label')).includes(lang==='en'?'locked':lang==='fil'?'naka-lock':'nakakandado'));
 await pickVisual(p);await p.locator('#bContinue').focus();await p.keyboard.press('Enter');assert(await p.locator('#bStep2').isVisible());await p.locator('#bContinue').click();assert.equal((await states(p))[1],'incomplete');
 const geometry=()=>p.locator('.stepDot[data-progress="2"]').evaluate(n=>{const s=getComputedStyle(n,'::before');return[s.width,s.height,s.top,s.right,s.borderRadius,s.boxShadow,s.borderWidth];});const orange=await geometry();assert.deepEqual(orange.slice(0,5),['11px','11px','-3px','-3px','50%']);assert.equal(orange[6],'0px');
 await p.locator('#bProduct').fill('Beans');await p.locator('#bHeadline').fill('Fresh roast');assert.equal((await states(p))[1],'complete');assert.deepEqual(await geometry(),orange);assert(await p.locator('.stepDot[data-progress="3"]').isDisabled());
 await p.locator('.stepDot[data-progress="1"]').focus();await p.keyboard.press('Enter');assert(await p.locator('#bStep1').isVisible());assert.equal((await states(p))[1],'complete');await step(p,2);
 const next=lang==='en'?'fil':'en';await p.evaluate(l=>{window.dispatchEvent(new StorageEvent('storage',{key:'mgpref_lang',newValue:l}));},next);await settle(p);assert.equal((await states(p))[1],'complete');assert(await p.locator('.stepDot[data-progress="3"]').isDisabled());
 await p.evaluate(()=>{const ns=[document.documentElement,...document.querySelectorAll('body *')].filter(n=>n instanceof HTMLElement),sizes=ns.map(n=>parseFloat(getComputedStyle(n).fontSize)*2);ns.forEach((n,i)=>n.style.fontSize=sizes[i]+'px');});assert(await p.evaluate(()=>document.documentElement.scrollWidth<=innerWidth));
 const taps=await p.locator('.stepDot').evaluateAll(ns=>ns.map(n=>{const r=n.getBoundingClientRect(),a=getComputedStyle(n,'::after');return[r.width-2*parseFloat(a.left),r.height-2*parseFloat(a.top)];}));assert(taps.every(([w,h])=>w>=44&&h>=44));await c.close();
});
const GUIDE={
 en:{physical:['Upload product photo','Product / service name'],digital:['Upload cover or screenshot','Digital product name'],service:['Upload service or portfolio image','Service name'],promo:['Upload promotional image','Name of what you are promoting']},
 fil:{physical:['Mag-upload ng product photo','Product / service name'],digital:['Mag-upload ng cover o screenshot','Pangalan ng digital product'],service:['Mag-upload ng service o portfolio image','Pangalan ng serbisyo'],promo:['Mag-upload ng promotional image','Pangalan ng pino-promote mo']},
 tl:{physical:['Mag-upload ng larawan ng produkto','Product / service name'],digital:['Mag-upload ng pabalat o screenshot','Pangalan ng digital na produkto'],service:['Mag-upload ng larawan ng serbisyo o portfolio','Pangalan ng serbisyo'],promo:['Mag-upload ng larawan para sa promosyon','Pangalan ng itinatampok mo']}
};
for(const [typeIndex,type] of ['physical','digital','service','promo'].entries())for(const [langIndex,lang] of ['en','fil','tl'].entries())await test(`Product-aware ${type}/${lang}: real photo OR generic visual, unchanged defaults, localized display-only guidance`,async()=>{
 const width=[320,360,390][langIndex],theme=typeIndex%2?'dark':'light';const{c,p}=await env({width,lang,theme,setupAdType:type,setupCategory:'food'});
 assert.equal((await p.locator('#bPhotoLabel').textContent()).trim(),GUIDE[lang][type][0]);assert.equal((await p.locator('label[for="bProduct"]').textContent()).trim(),GUIDE[lang][type][1]);
 const intro=await p.locator('#bStep1 .stepIntro').textContent();assert(intro.length>0);assert(!intro.includes('PDF'));
 assert.equal((await p.locator('#bVisualPicksLabel').textContent()).trim(),{en:'Choose a Design',fil:'Pumili ng design',tl:'Pumili ng disenyo'}[lang]);
 assert.deepEqual(await states(p),Array(4).fill('pending'));assert.equal(await p.locator('.visualBtn[aria-pressed="true"]').count(),0);
 assert.equal(await p.locator('#bVisualCategory').inputValue(),'food');assert.equal(await p.locator('#bProduct').inputValue(),'');assert.equal(await p.locator('#bHeadline').inputValue(),'');
 await p.locator('#bContinue').click();assert(await p.locator('#bStep1').isVisible());assert(await p.locator('.stepDot[data-progress="2"]').isDisabled());
 await pickVisual(p,'food-spotlight');assert.equal((await states(p))[0],'complete');assert.equal(await p.locator('#bUploadArea').getAttribute('data-active'),'false');assert(await p.locator('#bPhotoRemove').isHidden());
 await p.locator('#bPhoto').setInputFiles(PHOTO);await p.locator('#bPhotoRemove').waitFor({state:'visible'});const thumb=await p.locator('#bPhotoThumb').evaluate(n=>n.toDataURL());
 assert.equal(await p.locator('#bUploadArea').getAttribute('data-active'),'true');assert.equal(await p.locator('.visualBtn[aria-pressed="true"]').count(),0);assert.equal((await states(p))[0],'complete');
 await pickVisual(p,'food-spotlight');assert.equal(await p.locator('#bPhotoThumb').evaluate(n=>n.toDataURL()),thumb);assert.equal(await p.locator('#bUploadArea').getAttribute('data-active'),'false');
 await pickVisual(p,'food-spotlight');assert.equal(await p.locator('#bUploadArea').getAttribute('data-active'),'true');assert.equal(await p.locator('.visualBtn[aria-pressed="true"]').count(),0);
 await step(p,2);await p.locator('#bProduct').fill('My exact name');assert.equal((await states(p))[1],'incomplete');await p.locator('#bHeadline').fill('Clear details');assert.equal((await states(p))[1],'complete');
 await p.locator('#bPrice').fill('₱100');await p.locator('#bPrice').fill('');assert.equal((await states(p))[1],'complete');assert(await p.locator('.stepDot[data-progress="3"]').isDisabled());
 const before=await states(p),values=await p.locator('#bProduct,#bHeadline,#bPrice').evaluateAll(ns=>ns.map(n=>n.value));
 const next=lang==='en'?'tl':'en';await p.evaluate(l=>window.dispatchEvent(new StorageEvent('storage',{key:'mgpref_lang',newValue:l})),next);await settle(p);
 assert.equal((await p.locator('label[for="bProduct"]').textContent()).trim(),GUIDE[next][type][1]);assert.deepEqual(await states(p),before);assert.deepEqual(await p.locator('#bProduct,#bHeadline,#bPrice').evaluateAll(ns=>ns.map(n=>n.value)),values);
 assert.equal(await p.locator('#bContinue .continueSurface > [data-i18n="wizardContinue"]').count(),1);assert.equal(await p.locator('#bContinue').getAttribute('data-i18n'),null);
 assert.equal(await p.getByRole('button',{name:next==='tl'?'Magpatuloy':'Continue',exact:true}).count(),1);
 assert.equal(await p.locator('#bPriceHelp').count(),0);assert((await p.locator('#bStep2 [data-i18n="helpHeadline"]').textContent()).trim());await step(p,3);assert.equal(await p.locator('#bCategory').inputValue(),'food');assert.equal(await p.locator('#bPreset').getAttribute('data-layout'),'stack-photo');assert.deepEqual(await p.locator('#bPreset [data-recommended="true"]').evaluateAll(ns=>ns.map(n=>n.dataset.preset)),['menu-band','split-left','stack-photo']);assert.equal((await states(p))[2],'pending');assert.equal(await p.locator('#bDesignStyle').inputValue(),'');
 await step(p,4);assert((await p.locator('#bStep4 .stepIntro').textContent()).trim());assert.equal(await p.locator('#bCtaChoice').inputValue(),'order');assert.equal((await states(p))[3],'pending');assert.equal(await p.locator('#bOffer').inputValue(),'');assert.equal(await p.locator('#bDetail').inputValue(),'');assert(await p.locator('#bDetail').evaluate(n=>n.closest('#bAdvanced')!==null));
 await p.locator('#bCtaChoice').selectOption('none');await p.locator('#bGenerate').click();await p.locator('#inspectDialog').waitFor({state:'visible'});assert.deepEqual(await states(p),Array(4).fill('complete'));await c.close();
});
await test('Completion history: Product Name/Headline loss is orange before or after Continue; optional Price and exact restoration stay green',async()=>{
 for(const confirmed of [false,true]){const{c,p}=await env();await pickVisual(p);await step(p,2);await p.locator('#bProduct').fill('Exact name');assert.equal((await states(p))[1],'incomplete');await p.locator('#bHeadline').fill('Exact headline');assert.equal((await states(p))[1],'complete');
 if(confirmed){await step(p,3);await step(p,2);}for(const id of ['bProduct','bHeadline']){const value=await p.locator('#'+id).inputValue();await p.locator('#'+id).fill('');assert.equal((await states(p))[1],'incomplete');assert.equal(await p.locator('.stepDot[data-progress="3"]').isDisabled(),!confirmed);await p.locator('#'+id).fill(value);assert.equal((await states(p))[1],'complete');}
 await p.locator('#bPrice').fill('₱100');await p.locator('#bPrice').fill('');assert.equal((await states(p))[1],'complete');await c.close();}
});
await test('All upload types still reject a PDF while retaining the accepted image and current visual mode',async()=>{
 const{c,p}=await env({setupAdType:'digital'});await p.locator('#bPhoto').setInputFiles(PHOTO);await p.locator('#bPhotoRemove').waitFor({state:'visible'});const before=await p.locator('#bPhotoThumb').evaluate(n=>n.toDataURL());await p.locator('#bPhoto').setInputFiles({name:'ebook.pdf',mimeType:'application/pdf',buffer:Buffer.from('%PDF unsupported image')});await p.waitForFunction(()=>document.querySelector('#bPhotoMsg').classList.contains('isErr'));assert.equal(await p.locator('#bPhotoThumb').evaluate(n=>n.toDataURL()),before);assert.equal(await p.locator('#bUploadArea').getAttribute('data-active'),'true');assert.equal((await states(p))[0],'complete');await c.close();
});
await test('Longest localized service guidance and inner motion fit all mobile widths/themes at 200% text',async()=>{
 for(const width of [320,360,390])for(const theme of ['light','dark']){const{c,p}=await env({width,lang:'tl',theme,setupAdType:'service'});
 await p.evaluate(()=>{const ns=[document.documentElement,...document.querySelectorAll('body *')].filter(n=>n instanceof HTMLElement),sizes=ns.map(n=>parseFloat(getComputedStyle(n).fontSize)*2);ns.forEach((n,i)=>n.style.fontSize=sizes[i]+'px');});
 for(const n of [1,2,3,4]){await reach(p,n);assert(await p.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),`overflow ${width}/${theme}/step${n}`);}
 await step(p,3);await p.locator('#bDesignStyle').selectOption('brand');await p.locator('#bPrevious').focus();await p.keyboard.press('Tab');await p.locator('#bContinue').scrollIntoViewIfNeeded();await p.emulateMedia({reducedMotion:'no-preference'});await p.waitForFunction(()=>document.querySelector('#bContinue').classList.contains('isReady'));
 const before=await p.locator('#bContinue').evaluate(n=>{const r=n.getBoundingClientRect();return[r.left,r.top,r.width,r.height]});
 for(const scale of [1.04,1.05]){await p.locator('#bContinue').evaluate((n,scale)=>{n.style.setProperty('--continue-scale',scale);for(const a of n.getAnimations({subtree:true})){a.pause();a.currentTime=900;}},String(scale));const r=await p.locator('#bContinue').evaluate(n=>{const a=n.getBoundingClientRect(),b=n.querySelector('.continueSurface').getBoundingClientRect();return{outer:[a.left,a.top,a.width,a.height],contained:b.left>=a.left-.1&&b.top>=a.top-.1&&b.right<=a.right+.1&&b.bottom<=a.bottom+.1,focus:n.matches(':focus-visible')&&getComputedStyle(n).outlineStyle!=='none'}});assert.deepEqual(r.outer,before);assert(r.contained,`escaped ${width}/${theme}/${scale}`);assert(r.focus);}
 await c.close();}
});
const COPY={
  "en": {
    "wizardProduct": "Product",
    "wizardDesign": "Design",
    "step1DesignSet": "Design set",
    "step1PickDesign": "Choose a Design",
    "category": "Business Category",
    "designStyle": "Design style",
    "photoRemove": "Remove photo",
    "pickVisual": "Upload a product photo or select a design to continue.",
    "productRequired": "Add the product or service name for this banner.",
    "guidedSelectedImage": "Selected uploaded image",
    "guidedChangeImage": "Change photo",
    "guidedPhysicalUpload": "Upload product photo",
    "guidedPhysicalImage": "Upload a product photo or choose a design for your business. You can also add a brand logo (optional).",
    "guidedPhysicalName": "Product / service name",
    "guidedPhysicalMessage": "Enter your product name and headline. You can also add a price (optional).",
    "guidedDigitalUpload": "Upload cover or screenshot",
    "guidedDigitalImage": "Upload a cover, screenshot or mockup image, or choose a design for your business. You can also add a brand logo (optional).",
    "guidedDigitalName": "Digital product name",
    "guidedDigitalMessage": "Enter your digital product name and headline. You can also add a price (optional).",
    "guidedServiceUpload": "Upload service or portfolio image",
    "guidedServiceImage": "Upload a service photo or sample-work image, or choose a design for your business. You can also add a brand logo (optional).",
    "guidedServiceName": "Service name",
    "guidedServiceMessage": "Enter your service name and headline. You can also add a price (optional).",
    "guidedPromotionUpload": "Upload promotional image",
    "guidedPromotionImage": "Upload a promotional image, or choose a design for your business. You can also add a brand logo (optional).",
    "guidedPromotionName": "Name of what you are promoting",
    "guidedPromotionMessage": "Enter the name of what you are promoting and a headline. You can also add a price (optional).",
    "step3Intro": "Keep the suggested design or change it, then select Continue.",
    "step4Intro": "Add a special offer (optional) and choose what the customer should do next. You can also use Advanced Customization (optional).",
    "helpHeadline": "The headline is the main message people notice first on the banner. Keep it short, clear and true, and name one real benefit. Example: \"Freshly Made, Everyday.\"",
    "helpCta": "A call to action tells the customer what to do next, such as order, message or book. Pick the one that matches how you actually take orders. No CTA is a valid choice if you would rather leave the banner without a button."
  },
  "fil": {
    "wizardProduct": "Product",
    "wizardDesign": "Design",
    "step1DesignSet": "Design set",
    "step1PickDesign": "Pumili ng design",
    "category": "Business Category",
    "designStyle": "Design style",
    "photoRemove": "Alisin ang photo",
    "pickVisual": "Mag-upload ng product photo o pumili ng design para magpatuloy.",
    "productRequired": "Ilagay ang product o service name para sa banner na ito.",
    "guidedSelectedImage": "Napiling uploaded image",
    "guidedChangeImage": "Palitan ang photo",
    "guidedPhysicalUpload": "Mag-upload ng product photo",
    "guidedPhysicalImage": "I-upload ang product photo o pumili ng design para sa iyong business. Maaari ka ring magdagdag ng brand logo (optional).",
    "guidedPhysicalName": "Product / service name",
    "guidedPhysicalMessage": "Ilagay ang product name at headline. Maaari ka ring maglagay ng price (optional).",
    "guidedDigitalUpload": "Mag-upload ng cover o screenshot",
    "guidedDigitalImage": "I-upload ang cover, screenshot o mockup image, o pumili ng design para sa iyong business. Maaari ka ring magdagdag ng brand logo (optional).",
    "guidedDigitalName": "Pangalan ng digital product",
    "guidedDigitalMessage": "Ilagay ang digital product name at headline. Maaari ka ring maglagay ng price (optional).",
    "guidedServiceUpload": "Mag-upload ng service o portfolio image",
    "guidedServiceImage": "I-upload ang service photo o sample-work image, o pumili ng design para sa iyong business. Maaari ka ring magdagdag ng brand logo (optional).",
    "guidedServiceName": "Pangalan ng serbisyo",
    "guidedServiceMessage": "Ilagay ang service name at headline. Maaari ka ring maglagay ng price (optional).",
    "guidedPromotionUpload": "Mag-upload ng promotional image",
    "guidedPromotionImage": "I-upload ang promotional image, o pumili ng design para sa iyong business. Maaari ka ring magdagdag ng brand logo (optional).",
    "guidedPromotionName": "Pangalan ng pino-promote mo",
    "guidedPromotionMessage": "Ilagay ang pangalan ng pino-promote mo at headline. Maaari ka ring maglagay ng price (optional).",
    "step3Intro": "Puwedeng panatilihin o baguhin ang suggested design, saka pindutin ang Continue.",
    "step4Intro": "Magdagdag ng special offer (optional) at piliin ang susunod na action ng customer. Maaari mo ring gamitin ang Advanced Customization (optional).",
    "helpHeadline": "Ang headline ang pangunahing mensahe na unang mapapansin sa banner. Gawing maikli, malinaw at totoo, at banggitin ang isang tunay na benepisyo. Halimbawa: \"Freshly Made, Everyday.\"",
    "helpCta": "Sinasabi ng call to action kung ano ang susunod na gagawin ng customer, gaya ng mag-order, mag-message o mag-book. Piliin ang bagay sa totoong paraan mo ng pagtanggap ng order. Puwede rin ang Walang CTA kung ayaw mong maglagay ng button."
  },
  "tl": {
    "wizardProduct": "Product",
    "wizardDesign": "Design",
    "step1DesignSet": "Set ng disenyo",
    "step1PickDesign": "Pumili ng disenyo",
    "category": "Kategorya ng Negosyo",
    "designStyle": "Design style",
    "photoRemove": "Alisin ang larawan",
    "pickVisual": "Mag-upload ng larawan ng produkto o pumili ng disenyo para magpatuloy.",
    "productRequired": "Ilagay ang pangalan ng produkto o serbisyo para sa banner na ito.",
    "guidedSelectedImage": "Napiling na-upload na larawan",
    "guidedChangeImage": "Palitan ang larawan",
    "guidedPhysicalUpload": "Mag-upload ng larawan ng produkto",
    "guidedPhysicalImage": "Mag-upload ng larawan ng produkto o pumili ng disenyo para sa iyong negosyo. Maaari ka ring magdagdag ng logo ng tatak (opsyonal).",
    "guidedPhysicalName": "Product / service name",
    "guidedPhysicalMessage": "Ilagay ang pangalan ng produkto at ang headline. Maaari ka ring maglagay ng presyo (opsyonal).",
    "guidedDigitalUpload": "Mag-upload ng pabalat o screenshot",
    "guidedDigitalImage": "Mag-upload ng larawan ng pabalat, screenshot o mockup, o pumili ng disenyo para sa iyong negosyo. Maaari ka ring magdagdag ng logo ng tatak (opsyonal).",
    "guidedDigitalName": "Pangalan ng digital na produkto",
    "guidedDigitalMessage": "Ilagay ang pangalan ng digital na produkto at ang headline. Maaari ka ring maglagay ng presyo (opsyonal).",
    "guidedServiceUpload": "Mag-upload ng larawan ng serbisyo o portfolio",
    "guidedServiceImage": "Mag-upload ng larawan ng serbisyo o halimbawa ng gawa, o pumili ng disenyo para sa iyong negosyo. Maaari ka ring magdagdag ng logo ng tatak (opsyonal).",
    "guidedServiceName": "Pangalan ng serbisyo",
    "guidedServiceMessage": "Ilagay ang pangalan ng serbisyo at ang headline. Maaari ka ring maglagay ng presyo (opsyonal).",
    "guidedPromotionUpload": "Mag-upload ng larawan para sa promosyon",
    "guidedPromotionImage": "Mag-upload ng larawan para sa promosyon o pumili ng disenyo para sa iyong negosyo. Maaari ka ring magdagdag ng logo ng tatak (opsyonal).",
    "guidedPromotionName": "Pangalan ng itinatampok mo",
    "guidedPromotionMessage": "Ilagay ang pangalan ng itinatampok mo at ang headline. Maaari ka ring maglagay ng presyo (opsyonal).",
    "step3Intro": "Panatilihin o baguhin ang mungkahing disenyo, saka piliin ang Magpatuloy.",
    "step4Intro": "Magdagdag ng natatanging alok (opsyonal) at piliin ang susunod na gagawin ng customer. Maaari mo ring gamitin ang Advanced Customization (opsyonal).",
    "helpHeadline": "Ang headline ang pangunahing mensaheng unang mapapansin sa banner. Gawing maikli, malinaw at totoo, at banggitin ang isang tunay na pakinabang. Halimbawa: \"Freshly Made, Everyday.\"",
    "helpCta": "Sinasabi ng call to action kung ano ang susunod na gagawin ng customer, gaya ng mag-order, magpadala ng mensahe o magpa-book. Piliin ang bagay sa tunay mong paraan ng pagtanggap ng order. Puwede rin ang Walang CTA kung ayaw mong maglagay ng pindutan."
  }
};

for(const [i,type] of ['physical','digital','service','promo'].entries())for(const [j,lang] of ['en','fil','tl'].entries())await test('Owner recovery '+type+'/'+lang+': exact copy and complete scenario matrix',async()=>{
 const{c,p,errors,external,writes}=await env({width:[320,360,390][j],theme:i%2?'dark':'light',lang,setupAdType:type});
 const d=COPY[lang],suffix={physical:'Physical',digital:'Digital',service:'Service',promo:'Promotion'}[type];
 assert.deepEqual(await states(p),Array(4).fill('pending'));
 assert.equal((await p.locator('#s1h').textContent()).trim(),d.wizardProduct);
 assert.equal((await p.locator('#bStep1 .stepIntro').textContent()).trim(),d['guided'+suffix+'Image']);
 assert.equal((await p.locator('#bPhotoLabel').textContent()).trim(),d['guided'+suffix+'Upload']);
 assert.equal((await p.locator('label[for="bVisualCategory"]').textContent()).trim(),d.step1DesignSet);
 assert.equal((await p.locator('#bVisualPicksLabel').textContent()).trim(),d.step1PickDesign);
 assert.equal(await p.locator('#bPhoto').getAttribute('accept'),'image/jpeg,image/png,image/webp');
 await p.locator('.stepDot[data-progress="1"]').click();await p.locator('#bPhotoAction').focus();await p.keyboard.press('Tab');
 await p.evaluate(l=>window.dispatchEvent(new StorageEvent('storage',{key:'mgpref_lang',newValue:l})),lang==='en'?'fil':'en');await settle(p);
 await p.evaluate(l=>window.dispatchEvent(new StorageEvent('storage',{key:'mgpref_lang',newValue:l})),lang);assert.deepEqual(await states(p),Array(4).fill('pending'));
 // An optional logo does not substitute for, or fabricate editing of, the required source.
 await p.locator('#bStep1 .optionalDetails summary').click();await p.locator('#bLogo').setInputFiles(PHOTO);await p.locator('#bLogoRemove').waitFor({state:'visible'});assert.equal((await states(p))[0],'pending');await p.locator('#bLogoRemove').click();
 await p.locator('#bPhoto').setInputFiles({name:'unsupported.pdf',mimeType:'application/pdf',buffer:Buffer.from('%PDF not an image')});await p.waitForFunction(()=>document.querySelector('#bPhotoMsg').classList.contains('isErr'));assert.equal((await states(p))[0],'incomplete');assert(await p.locator('.stepDot[data-progress="2"]').isDisabled());
 await pickVisual(p,'food-spotlight');assert.equal((await states(p))[0],'complete');await pickVisual(p,'food-spotlight');assert.equal((await states(p))[0],'incomplete');await pickVisual(p,'food-spotlight');
 await p.locator('#bPhoto').setInputFiles(PHOTO);await p.locator('#bPhotoRemove').waitFor({state:'visible'});const photo=await p.locator('#bPhotoThumb').evaluate(n=>n.toDataURL());assert.equal((await p.locator('#bPhotoLabel').textContent()).trim(),d.guidedChangeImage);assert.equal((await p.locator('#bPhotoRemove').textContent()).trim(),d.photoRemove);
 await pickVisual(p,'food-spotlight');assert.equal(await p.locator('#bPhotoThumb').evaluate(n=>n.toDataURL()),photo);assert.equal(await p.locator('#bUploadArea').getAttribute('data-active'),'false');await p.locator('#bPhotoRemove').click();assert.equal((await states(p))[0],'complete');
 await step(p,2);assert.equal((await states(p))[1],'pending');assert.equal((await p.locator('label[for="bProduct"]').textContent()).trim(),d['guided'+suffix+'Name']);assert.equal((await p.locator('#bStep2 .stepIntro').textContent()).trim(),d['guided'+suffix+'Message']);assert.equal(await p.locator('#bPriceHelp').count(),0);
 await step(p,1);assert.equal((await states(p))[1],'pending');await step(p,2);
 // Price is optional, but a real Price-first edit is meaningful incomplete work.
 const price=p.locator('#bPrice');await price.focus();await p.locator('#bHeadline').focus();await price.fill('');assert.equal((await states(p))[1],'pending');
 await price.evaluate(n=>{n.value='₱100';n.dispatchEvent(new Event('input',{bubbles:true}));});assert.equal((await states(p))[1],'pending','programmatic initialization is not a user edit');
 await price.fill('₱100');assert.equal((await states(p))[1],'pending','unchanged effective Price is not an edit');
 await price.evaluate(n=>{n.value='';n.dispatchEvent(new Event('change',{bubbles:true}));});assert.equal((await states(p))[1],'pending');
 await p.evaluate(l=>window.dispatchEvent(new StorageEvent('storage',{key:'mgpref_lang',newValue:l})),lang==='en'?'fil':'en');assert.equal((await states(p))[1],'pending');
 await p.evaluate(l=>window.dispatchEvent(new StorageEvent('storage',{key:'mgpref_lang',newValue:l})),lang);assert.equal((await states(p))[1],'pending');
 await price.fill('₱100');assert.equal((await states(p))[1],'incomplete');assert.equal(await p.locator('#bProduct').inputValue(),'');assert.equal(await p.locator('#bHeadline').inputValue(),'');assert(await p.locator('.stepDot[data-progress="3"]').isDisabled());
 await price.fill('guaranteed profit');assert.equal((await states(p))[1],'incomplete');assert(await p.locator('#bStudioError').isHidden());
 await price.fill('');assert.equal((await states(p))[1],'incomplete');assert(await p.locator('.stepDot[data-progress="3"]').isDisabled());
 await p.locator('#bProduct').fill('Exact name');assert.equal((await states(p))[1],'incomplete');assert(await p.locator('.stepDot[data-progress="3"]').isDisabled());
 await p.locator('#bHeadline').fill('Fresh details');assert.equal((await states(p))[1],'complete');await p.locator('#bPrice').fill('₱100');await p.locator('#bPrice').fill('');assert.equal((await states(p))[1],'complete');
 await p.locator('#bHeadline').fill('');assert.equal((await states(p))[1],'incomplete');await p.locator('#bHeadline').fill('Fresh details');assert.equal((await states(p))[1],'complete');
 await p.locator('#bPrice').fill('guaranteed profit');assert.notEqual((await states(p))[1],'complete');await p.locator('#bContinue').click();assert.equal((await states(p))[1],'invalid');assert.equal(await p.evaluate(()=>document.activeElement.id),'bPrice');assert(await p.locator('.stepDot[data-progress="3"]').isDisabled());await p.locator('#bPrice').fill('');assert.equal((await states(p))[1],'complete');
 await step(p,3);assert.equal((await states(p))[2],'pending');assert.equal((await p.locator('#s3h').textContent()).trim(),d.wizardDesign);assert.equal((await p.locator('#bStep3 .stepIntro').textContent()).trim(),d.step3Intro);assert.equal((await p.locator('label[for="bCategory"]').textContent()).trim(),d.category);assert.equal((await p.locator('label[for="bDesignStyle"]').textContent()).trim(),d.designStyle);
 await step(p,4);assert.equal((await states(p))[2],'complete');assert.equal((await states(p))[3],'pending');assert.equal((await p.locator('#bStep4 .stepIntro').textContent()).trim(),d.step4Intro);await p.locator('#bOffer').fill('guaranteed profit');assert.equal((await states(p))[3],'incomplete');await p.locator('#bOffer').fill('');assert.equal((await states(p))[3],'pending');await p.locator('#bCtaChoice').selectOption('none');assert.equal((await states(p))[3],'complete');await p.locator('#bGenerate').click();await p.locator('#inspectDialog').waitFor({state:'visible'});assert.deepEqual(await states(p),Array(4).fill('complete'));
 await p.route('**/dashboard.html',r=>r.fulfill({contentType:'text/html',body:'<!doctype html><title>New account</title>'}));const reset=await p.evaluate(()=>{window.__setUser({uid:'recovery-account-B',emailVerified:true});return{hidden:document.querySelector('#app').hidden,fields:[...document.querySelectorAll('#bProduct,#bHeadline,#bPrice')].map(n=>n.value),states:[...document.querySelectorAll('.stepDot')].map(n=>n.dataset.state)}});assert(reset.hidden);assert.deepEqual(reset.fields,['','','']);assert.deepEqual(reset.states,Array(4).fill('pending'));await p.waitForURL('**/dashboard.html');
 assert.deepEqual(errors,[]);assert.deepEqual(external,[]);assert.deepEqual(writes,[]);await c.close();
});

for(const e of contexts){assert.deepEqual(e.errors,[]);assert.deepEqual(e.external,[]);assert.deepEqual(e.writes,[]);}fs.writeFileSync(path.join(out,'confirmation-results.json'),JSON.stringify({result:'PASS',results,auth:'Mocked services; physical Android acceptance pending'},null,2));
}finally{await browser.close()}})().catch(e=>{console.error(e);fs.writeFileSync(path.join(out,'confirmation-results.json'),JSON.stringify({results,failure:e.message},null,2));process.exitCode=1});
