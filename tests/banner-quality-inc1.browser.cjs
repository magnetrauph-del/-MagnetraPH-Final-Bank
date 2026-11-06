// Increment 1: totoong larawan sa preview at PNG, clickable na step 1-4, at hiwalay na tutorial.
// Start: python -m http.server 8876 --bind 127.0.0.1 --directory public
const{chromium}=require('playwright'),assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path');
const{env:makeEnv,step,preview,exportPNG,settle}=require('./fixtures/banner-wizard.cjs');
const out=process.env.MAGNETRA_INC1_ARTIFACTS||'/tmp/magnetra-banner-inc1-review';fs.mkdirSync(out,{recursive:true});
const results=[],contexts=[];let b;
async function env(opts){const e=await makeEnv(b,opts);contexts.push(e);return e;}
async function test(name,run){await run();results.push({name,result:'PASS'});console.log('PASS',name);}

// Natatanging kulay (#FF00AA) na walang katumbas sa anumang theme, preset o illustration.
const SAMPLE=path.join(__dirname,'fixtures/product-sample.png');
const mark=d=>{let n=0;for(let i=0;i<d.length;i+=4)if(d[i]>190&&d[i+1]<90&&d[i+2]>120&&d[i+2]<210)n++;return n;};
// Porsyento ng canvas na sakop ng larawan ng produkto.
const onCanvas=p=>p.evaluate(()=>{const c=document.querySelector('#bCanvas');if(!c.width)return 0;
 const s=document.createElement('canvas');s.width=240;s.height=Math.round(240*c.height/c.width);
 const x=s.getContext('2d',{willReadFrequently:true});x.drawImage(c,0,0,s.width,s.height);
 const d=x.getImageData(0,0,s.width,s.height).data;let n=0;
 for(let i=0;i<d.length;i+=4)if(d[i]>190&&d[i+1]<90&&d[i+2]>120&&d[i+2]<210)n++;
 return +(100*n/(s.width*s.height)).toFixed(2);});
// Ganoon din, pero sa totoong na-download na PNG - hindi sa canvas.
async function onExport(p,file){
 const data=fs.readFileSync(file).toString('base64');
 return p.evaluate(async src=>{const img=new Image();img.src=src;await img.decode();
  const s=document.createElement('canvas');s.width=240;s.height=Math.round(240*img.naturalHeight/img.naturalWidth);
  const x=s.getContext('2d',{willReadFrequently:true});x.drawImage(img,0,0,s.width,s.height);
  const d=x.getImageData(0,0,s.width,s.height).data;let n=0;
  for(let i=0;i<d.length;i+=4)if(d[i]>190&&d[i+1]<90&&d[i+2]>120&&d[i+2]<210)n++;
  return {w:img.naturalWidth,h:img.naturalHeight,pct:+(100*n/(s.width*s.height)).toFixed(2)};},'data:image/png;base64,'+data);
}
async function upload(p,file=SAMPLE){await p.locator('#bPhoto').setInputFiles(file);await p.locator('#bPhotoRemove').waitFor({state:'visible'});await settle(p);}
async function brief(p){
 await step(p,2);await p.locator('#bProduct').fill('Ceramic mug');await p.locator('#bHeadline').fill('Handmade mug');
 await p.locator('#bPrice').fill('₱350');await step(p,3);await p.locator('#bCategory').selectOption('food');
 await step(p,4);await p.locator('#bCtaChoice').selectOption('custom');await p.locator('#bCta').fill('Message us');await settle(p);
}

(async()=>{b=await chromium.launch({executablePath:'/usr/bin/chromium',args:['--no-sandbox']});try{

await test('The uploaded product photo reaches the preview and the exported PNG in all three formats',async()=>{
 const{c,p}=await env();await upload(p);await brief(p);
 for(const[format,w,h]of[['square',1080,1080],['portrait',1080,1350],['story',1080,1920]]){
  await p.locator(`input[name="bFormat"][value="${format}"]`).check();await settle(p);
  const live=await onCanvas(p);assert(live>0.5,`${format} preview: ${live}%`);
  const file=path.join(out,`photo-${format}.png`);
  assert.deepEqual(await exportPNG(p,file),{w,h});
  const png=await onExport(p,file);
  assert.deepEqual([png.w,png.h],[w,h]);
  assert(png.pct>0.5,`${format} export: ${png.pct}%`);
  // Ang PNG at ang preview ay iisang canvas: dapat halos magkapareho ang sukat ng larawan.
  assert(Math.abs(png.pct-live)<0.6,`${format} preview ${live}% vs export ${png.pct}%`);
  await p.locator('#inspectClose').click();
 }
 await c.close();
});

await test('A service visual can never silently replace an uploaded photo, and removing the photo restores the fallback',async()=>{
 const{c,p}=await env();
 assert(await p.locator('#bVisualLock').isHidden());
 assert.equal(await p.locator('#bVisual option:not([disabled])').count(),4);
 await upload(p);
 assert(await p.locator('#bVisualLock').isVisible());
 assert.equal(await p.locator('#bVisual').inputValue(),'photo');
 assert.equal(await p.locator('#bVisual option[disabled]').count(),3);
 await assert.rejects(()=>p.locator('#bVisual').selectOption('workspace',{timeout:2000}));
 assert.equal(await p.locator('#bVisual').inputValue(),'photo');
 await brief(p);
 assert((await onCanvas(p))>0.5);
 // Pag-alis: bumabalik ang service illustration bilang pagpipilian.
 await step(p,1);await p.locator('#bPhotoRemove').click();await settle(p);
 assert(await p.locator('#bVisualLock').isHidden());
 assert.equal(await p.locator('#bVisual option[disabled]').count(),0);
 await p.locator('#bVisual').selectOption('workspace');await settle(p);
 assert.equal(await onCanvas(p),0);
 await step(p,4);await preview(p);
 // Ang muling pag-upload ay muling kinukuha ang slot mula sa illustration.
 await p.locator('#inspectClose').click();await step(p,1);await upload(p);
 assert.equal(await p.locator('#bVisual').inputValue(),'photo');
 assert((await onCanvas(p))>0.5);
 await c.close();
});

await test('Photo and logo pixels stay complete: correct aspect, no upscale, no crop of the uploaded file',async()=>{
 const{c,p}=await env();await upload(p);
 await p.locator('#bStep1 .optionalDetails summary').click();
 await p.locator('#bLogo').setInputFiles(path.join(__dirname,'../public/dashboard-banner-sample.webp'));
 await p.locator('#bLogoRemove').waitFor({state:'visible'});
 await brief(p);
 const source=await p.evaluate(()=>{const t=document.querySelector('#bPhotoThumb');return{w:t.width,h:t.height};});
 assert(Math.abs(source.w/source.h-900/1200)<0.01,`thumb aspect ${source.w}x${source.h}`);
 // Ang fixture ay may magenta frame, kaya ang bounding box ng magenta = eksaktong hangganan ng larawan.
 const bbox=()=>p.evaluate(()=>{const c=document.querySelector('#bCanvas');
  const x=c.getContext('2d',{willReadFrequently:true}),d=x.getImageData(0,0,c.width,c.height).data;
  let x0=1e9,y0=1e9,x1=-1,y1=-1;
  for(let i=0;i<d.length;i+=4){if(!(d[i]>190&&d[i+1]<90&&d[i+2]>120&&d[i+2]<210))continue;
   const px=(i/4)%c.width,py=Math.floor((i/4)/c.width);
   if(px<x0)x0=px;if(px>x1)x1=px;if(py<y0)y0=py;if(py>y1)y1=py;}
  return x1<0?null:{w:x1-x0+1,h:y1-y0+1,x0,y0,x1,y1,canvas:{w:c.width,h:c.height}};});
 for(const format of['square','portrait','story']){
  await p.locator(`input[name="bFormat"][value="${format}"]`).check();await settle(p);
  const box=await bbox();
  assert(box,`${format}: walang larawan sa canvas`);
  // Tumpak na aspect: hindi kailanman iniinat o pinipiga ang larawan.
  assert(Math.abs(box.w/box.h-900/1200)/(900/1200)<0.02,`${format} baluktot: ${box.w}x${box.h}`);
  // Walang upscale lampas sa tunay na resolusyon ng file.
  assert(box.w<=900*1.02,`${format} nag-upscale sa ${box.w}px mula 900px`);
  // Buo: nasa loob ng canvas ang apat na gilid, walang naputol.
  assert(box.x0>=0&&box.y0>=0&&box.x1<box.canvas.w&&box.y1<box.canvas.h,`${format} naputol ang larawan`);
 }
 await c.close();
});

await test('Wizard steps 1-4 are clickable with real validation, preserved input and 44px targets',async()=>{
 const{c,p}=await env();
 assert.equal(await p.locator('.stepDot').count(),4);
 for(const n of[1,2,3,4]){
  const dot=p.locator(`.stepDot[data-progress="${n}"]`);
  const label=await dot.getAttribute('aria-label');
  assert(label&&label.includes(String(n)),`step ${n} aria-label: ${label}`);
  const size=await dot.evaluate(node=>{const r=node.getBoundingClientRect(),a=getComputedStyle(node,'::after');
   return{w:r.width+2*Math.abs(parseFloat(a.left)||0),h:r.height+2*Math.abs(parseFloat(a.top)||0)};});
  assert(size.w>=44&&size.h>=44,`step ${n} target ${size.w}x${size.h}`);
 }
 assert.equal(await p.locator('.stepDot[aria-current="step"]').getAttribute('data-progress'),'1');
 // Pasulong na walang larawan at walang visual: hinahadlangan, may error, at nananatili sa step 1.
 await p.locator('.stepDot[data-progress="4"]').click();await settle(p);
 assert(await p.locator('#bStep1').isVisible());assert(await p.locator('#bStudioError').isVisible());
 await upload(p);await brief(p);
 assert.equal(await p.locator('.stepDot[aria-current="step"]').getAttribute('data-progress'),'4');
 // Pabalik: laging pwede, at buo ang nailagay.
 await p.locator('.stepDot[data-progress="2"]').click();await settle(p);
 assert(await p.locator('#bStep2').isVisible());
 assert.equal(await p.locator('#bHeadline').inputValue(),'Handmade mug');
 assert.equal(await p.locator('#bPrice').inputValue(),'₱350');
 // Pasulong na may kulang: humihinto sa mismong step na may problema.
 await p.locator('#bHeadline').fill('');await settle(p);
 await p.locator('.stepDot[data-progress="4"]').click();await settle(p);
 assert(await p.locator('#bStep2').isVisible());assert(await p.locator('#bStudioError').isVisible());
 await p.locator('#bHeadline').fill('Handmade mug');
 await p.locator('.stepDot[data-progress="4"]').click();await settle(p);
 assert(await p.locator('#bStep4').isVisible());assert(await p.locator('#bStudioError').isHidden());
 await c.close();
});

await test('A step jump can never skip an unmet requirement, and Generate/Download re-check every step',async()=>{
 const{c,p}=await env();
 const at=async()=>await p.locator('[data-wizard-step]:visible').getAttribute('data-wizard-step');
 const jump=async n=>{await p.locator(`.stepDot[data-progress="${n}"]`).click();await settle(p);};
 // 1. Walang larawan at walang napiling visual: hindi makakalampas kahit saan.
 for(const target of[2,3,4]){
  await jump(target);
  assert.equal(await at(),'1',`nakalampas sa step ${target} nang walang visual`);
  assert(await p.locator('#bStudioError').isVisible());
 }
 // 2. Pasado na ang step 1, pero wala pang product: humihinto nang eksakto sa step 2.
 await upload(p);await jump(4);
 assert.equal(await at(),'2');assert(await p.locator('#bStudioError').isVisible());
 assert.equal(await p.evaluate(()=>document.activeElement.id),'bProduct');
 // 3. May product na, wala pang headline: humihinto pa rin sa step 2.
 await p.locator('#bProduct').fill('Ceramic mug');await jump(4);
 assert.equal(await at(),'2');assert(await p.locator('#bStudioError').isVisible());
 assert.equal(await p.evaluate(()=>document.activeElement.id),'bHeadline');
 // 4. Kumpleto na ang step 2: ngayon lang pumapayag ang paglukso.
 await p.locator('#bHeadline').fill('Handmade mug');await jump(4);
 assert.equal(await at(),'4');assert(await p.locator('#bStudioError').isHidden());
 // 5. Pagbabalik at pagbura: muling hinaharangan ang paglukso pasulong.
 await jump(2);assert.equal(await at(),'2');
 await p.locator('#bProduct').fill('');await settle(p);
 await jump(4);assert.equal(await at(),'2');assert(await p.locator('#bStudioError').isVisible());
 await jump(3);assert.equal(await at(),'2');  // kahit isang step lang pasulong
 await p.locator('#bProduct').fill('Ceramic mug');await jump(4);assert.equal(await at(),'4');
 // 6. Huling harang: kahit pilitin ang field na mawalan ng laman habang nasa step 4,
 //    tumatanggi pa rin ang Generate at hindi bumubukas ang preview.
 await p.evaluate(()=>{const n=document.querySelector('#bProduct');n.value='';n.dispatchEvent(new Event('input',{bubbles:true}));});
 await settle(p);
 await p.locator('#bGenerate').click();await settle(p);
 assert(await p.locator('#inspectDialog').isHidden(),'bumukas ang preview kahit kulang ang brief');
 assert(await p.locator('#bStudioError').isVisible());
 // Walang na-download dahil hindi naabot ang Download button.
 assert.equal(await p.locator('#bSave').count(),1);
 assert(await p.locator('#bSave').isHidden());
 await c.close();
});

await test('Quick Tutorial advances on its own without switching the wizard page or losing input',async()=>{
 const{c,p}=await env();await upload(p);await brief(p);
 await p.locator('.stepDot[data-progress="2"]').click();await settle(p);
 const before=await p.locator('#bHeadline').inputValue();
 await p.locator('#helpBtn').click();await p.locator('#ctxHelp').waitFor({state:'visible'});
 await p.locator('#bStartTutorial').click();await p.locator('#bTutorial').waitFor({state:'visible'});
 // Nagsisimula sa kinaroroonan ng user, hindi binabalik sa step 1.
 assert(await p.locator('#bStep2').isVisible());
 assert.equal(await p.locator('#bTutorialCount').textContent(),'Tip 2 of 5');
 for(const expected of['Tip 3 of 5','Tip 4 of 5','Tip 5 of 5']){
  await p.locator('#bTutorialNext').click();await settle(p);
  assert.equal(await p.locator('#bTutorialCount').textContent(),expected);
  assert(await p.locator('#bStep2').isVisible(),`nalipat ang pahina sa ${expected}`);
 }
 assert(await p.locator('#inspectDialog').isHidden());
 assert(await p.locator('#bTutorialNext').isHidden());assert(await p.locator('#bTutorialFinish').isVisible());
 for(const expected of['Tip 4 of 5','Tip 3 of 5','Tip 2 of 5','Tip 1 of 5']){
  await p.locator('#bTutorialBack').click();await settle(p);
  assert.equal(await p.locator('#bTutorialCount').textContent(),expected);
  assert(await p.locator('#bStep2').isVisible());
 }
 assert(await p.locator('#bTutorialBack').isHidden());
 assert.equal(await p.locator('#bHeadline').inputValue(),before);
 // Ang paggalaw sa wizard ay nagpapanatiling may kaugnayan ang gabay.
 await p.locator('.stepDot[data-progress="3"]').click();await settle(p);
 assert.equal(await p.locator('#bTutorialCount').textContent(),'Tip 3 of 5');
 await p.locator('#bTutorialSkip').click();
 assert(await p.locator('#bTutorial').isHidden());assert(await p.locator('#bStep3').isVisible());
 assert.equal(await p.locator('#bHeadline').inputValue(),before);
 await c.close();
});

for(const width of[320,360,390])for(const lang of['en','fil','tl'])for(const theme of['light','dark'])
 await test(`Increment 1 ${width}/${lang}/${theme}: photo, clickable steps and tutorial without overflow`,async()=>{
  const{c,p}=await env({width,lang,theme});
  await upload(p);await brief(p);
  assert((await onCanvas(p))>0.5);
  assert(await p.evaluate(()=>document.documentElement.scrollWidth<=innerWidth));
  await p.locator('.stepDot[data-progress="1"]').click();await settle(p);
  assert(await p.locator('#bStep1').isVisible());assert(await p.locator('#bVisualLock').isVisible());
  await p.locator('#helpBtn').click();await p.locator('#ctxHelp').waitFor({state:'visible'});
  await p.locator('#bStartTutorial').click();await p.locator('#bTutorial').waitFor({state:'visible'});
  await p.locator('#bTutorialNext').click();await settle(p);
  assert(await p.locator('#bStep1').isVisible());
  assert(await p.evaluate(()=>document.documentElement.scrollWidth<=innerWidth));
  // 200% na teksto: hindi pa rin dapat umapaw ang progress row.
  await p.evaluate(()=>{const all=[document.documentElement,...document.querySelectorAll('body *')].filter(n=>n instanceof HTMLElement);
   const sizes=all.map(n=>parseFloat(getComputedStyle(n).fontSize)*2);all.forEach((n,i)=>n.style.fontSize=sizes[i]+'px');});
  assert(await p.evaluate(()=>document.documentElement.scrollWidth<=innerWidth));
  const size=await p.locator('.stepDot[data-progress="3"]').evaluate(node=>{const r=node.getBoundingClientRect(),a=getComputedStyle(node,'::after');
   return{w:r.width+2*Math.abs(parseFloat(a.left)||0),h:r.height+2*Math.abs(parseFloat(a.top)||0)};});
  assert(size.w>=44&&size.h>=44,`${width}/${lang}/${theme} target ${size.w}x${size.h}`);
  await p.locator('#bTutorialSkip').click();
  await c.close();
 });

for(const e of contexts){assert.deepEqual(e.errors,[]);assert.deepEqual(e.external,[]);assert.deepEqual(e.writes,[]);}
fs.writeFileSync(path.join(out,'inc1-results.json'),JSON.stringify({result:'PASS',results,
 auth:'Mocked services; emulated viewports only - no physical Android and no production-backed test'},null,2));
}finally{await b.close()}})().catch(e=>{console.error(e);
 fs.writeFileSync(path.join(out,'inc1-results.json'),JSON.stringify({results,failure:e.message},null,2));process.exitCode=1});
