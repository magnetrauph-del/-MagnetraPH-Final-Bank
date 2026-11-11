// Increment 1: totoong larawan sa preview at PNG, clickable na step 1-4, at hiwalay na tutorial.
// Start: python -m http.server 8876 --bind 127.0.0.1 --directory public
const{chromium}=require('playwright'),assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path');
const{env:makeEnv,step,preview,exportPNG,settle,pickVisual,revertVisual,resetSelect}=require('./fixtures/banner-wizard.cjs');
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

await test('Photo and service visual coexist: neither deletes the other, and exactly one renders',async()=>{
 const{c,p}=await env();
 const active=()=>p.locator('#bUploadArea').getAttribute('data-active');
 // Walang pinagmumulan pa: hindi aktibo ang upload area.
 assert.equal(await active(),'false');
 assert.equal(await p.locator('#bVisualPicks .visualBtn').count(),3,'laging nakikita ang picker');
 await upload(p);
 const photoPixels=await p.locator('#bPhotoThumb').evaluate(n=>n.toDataURL());
 // Ang pag-upload mismo ang gumagawa sa larawan bilang aktibong pinagmumulan.
 assert.equal(await active(),'true');
 await brief(p);
 assert((await onCanvas(p))>0.5,'hindi lumabas ang larawan');
 // Pumili ng visual: NANANATILI ang larawan, pero ang visual na ang iginuguhit.
 await step(p,1);await pickVisual(p,'technology-spotlight');await settle(p);
 assert(await p.locator('#bPhotoRemove').isVisible(),'nabura ang larawan nang pumili ng visual');
 assert.equal(await p.locator('#bPhotoThumb').evaluate(n=>n.toDataURL()),photoPixels,'nabago ang larawan');
 assert.equal(await active(),'false');
 assert.equal(await onCanvas(p),0,'lumabas pa rin ang larawan kahit visual ang aktibo');
 assert(await p.locator('.visualBtn[data-visual="technology-spotlight"][aria-pressed="true"]').count());
 // Muling pindutin ang napili: bumabalik ang ORIHINAL na larawan bilang pinagmumulan.
 await pickVisual(p,'technology-spotlight');await settle(p);
 assert.equal(await active(),'true');
 assert.equal(await p.locator('#bPhotoThumb').evaluate(n=>n.toDataURL()),photoPixels);
 assert((await onCanvas(p))>0.5,'hindi naibalik ang larawan');
 // Pumili ulit, tapos alisin ang larawan: hindi nabubura ang napiling visual.
 await pickVisual(p,'technology-spotlight');await settle(p);
 await p.locator('#bPhotoRemove').click();await settle(p);
 assert(await p.locator('.visualBtn[data-visual="technology-spotlight"][aria-pressed="true"]').count(),
  'nawala ang napiling visual nang alisin ang larawan');
 // Ang Generate at ang PNG ay sumusunod sa AKTIBONG pinagmumulan.
 await step(p,4);
 assert.deepEqual(await exportPNG(p,path.join(out,'visual-active.png')),{w:1080,h:1080});
 assert.equal(await onCanvas(p),0,'ginamit ng export ang larawan sa halip na ang visual');
 await p.locator('#inspectClose').click();
 // Ang bagong upload ang muling kumukuha ng pagiging aktibo.
 await step(p,1);await upload(p);await settle(p);
 assert.equal(await active(),'true','hindi naging aktibo ang bagong upload');
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

await test('Reached steps remain editable without losing text, photo, visual or access',async()=>{
 const{c,p}=await env();await upload(p);await brief(p);
 const before=await p.locator('#bPhotoThumb').evaluate(n=>n.toDataURL());
 const values=await p.locator('#bProduct,#bHeadline,#bPrice,#bCta').evaluateAll(ns=>ns.map(n=>n.value));
 for(const n of [1,3,2,4,1,2])await step(p,n);
 assert.equal(await p.locator('#bPhotoThumb').evaluate(n=>n.toDataURL()),before);
 assert.deepEqual(await p.locator('#bProduct,#bHeadline,#bPrice,#bCta').evaluateAll(ns=>ns.map(n=>n.value)),values);
 await p.locator('#bHeadline').fill('');assert.equal(await p.locator('.stepDot[data-progress="2"]').getAttribute('data-state'),'pending');
 await step(p,4);assert.equal(await p.locator('.stepDot[data-progress="2"]').getAttribute('data-state'),'incomplete');assert(await p.locator('#bGenerate').isVisible());
 await c.close();
});
for(const width of [320,360,390])for(const theme of ['light','dark'])await test(`Completion dots reflect guided validity ${width}/${theme}`,async()=>{
 const{c,p}=await env({width,theme});const state=n=>p.locator(`.stepDot[data-progress="${n}"]`).getAttribute('data-state');
 assert.equal(await state(1),'pending');assert(await p.locator('.stepDot[data-progress="4"]').isDisabled());
 await upload(p);assert.equal(await state(1),'complete');await step(p,2);await p.locator('#bHeadline').fill('');await p.locator('#bProduct').fill('Mug');assert.equal(await state(2),'pending');
 await p.locator('#bHeadline').fill('Handmade mug');assert.equal(await state(2),'complete');await step(p,3);assert.equal(await state(3),'pending');
 const dots=await p.locator('.stepDot').evaluateAll(ns=>ns.map(n=>({state:n.dataset.state,active:n.hasAttribute('aria-current'),dot:getComputedStyle(n,'::before').content})));
 assert.equal(dots.filter(n=>n.active).length,1);assert(dots.filter(n=>n.state==='complete').every(n=>n.dot!=='none'));
 await step(p,2);await p.locator('#bHeadline').fill('');assert.equal(await state(2),'pending');await step(p,3);assert.equal(await state(2),'incomplete');await c.close();
});

await test('Generate and Download each refuse an invalid banner and point at the earliest missing field',async()=>{
 const{c,p}=await env();let downloads=0;p.on('download',()=>downloads++);
 const at=()=>p.locator('[data-wizard-step]:visible').getAttribute('data-wizard-step'),focus=()=>p.evaluate(()=>document.activeElement.id);
 await step(p,4);await step(p,1);await revertVisual(p);await step(p,2);await p.locator('#bProduct').fill('');await p.locator('#bHeadline').fill('');
 const tryGenerate=async()=>{await step(p,4);await p.locator('#bGenerate').click();await settle(p);};
 await tryGenerate();assert(await p.locator('#inspectDialog').isHidden());assert.equal(await at(),'1');assert.equal(await focus(),'bVisualCategory');assert.equal(await p.locator('#bVisualCategory').getAttribute('aria-invalid'),'true');
 // Pasado na ang step 1: sumusunod ang hadlang sa pinakaunang kulang.
 await upload(p);await tryGenerate();
 assert(await p.locator('#inspectDialog').isHidden());
 assert.equal(await at(),'2');assert.equal(await focus(),'bProduct');
 await p.locator('#bProduct').fill('Ceramic mug');await tryGenerate();
 assert(await p.locator('#inspectDialog').isHidden());
 assert.equal(await at(),'2');assert.equal(await focus(),'bHeadline');
 // b24: pumasa na ang step 2, kaya ang kulang na CTA na ang huling hadlang. Ang paanyaya
 // ay hindi pagpili, kaya hinaharang ito at itinuturo ang mismong dropdown.
 await p.locator('#bHeadline').fill('Handmade mug');
 // b29: nagmungkahi ng CTA ang kategoryang galing sa setup, kaya pinapawi muna ito para
 // maabot ang kalagayang sinusubok dito: walang piniling CTA.
 await resetSelect(p,'#bCtaChoice');await settle(p);
 await tryGenerate();
 assert(await p.locator('#inspectDialog').isHidden(),'bumukas ang preview nang walang piniling CTA');
 assert.equal(await at(),'4');assert.equal(await focus(),'bCtaChoice');
 assert.equal(await p.locator('#bCtaChoice').getAttribute('aria-invalid'),'true');
 // Ang tahasang "Walang CTA" ay tunay na pagpili at pumapasa.
 await p.locator('#bCtaChoice').selectOption('none');await settle(p);await tryGenerate();
 await p.locator('#inspectDialog').waitFor({state:'visible'});
 assert.equal(downloads,0);
 // Ang Download ay may sariling pagsusuri: pinapawalang-bisa habang bukas ang dialog.
 await p.evaluate(()=>{const n=document.querySelector('#bProduct');n.value='';n.dispatchEvent(new Event('input',{bubbles:true}));});
 await settle(p);
 await p.locator('#bSave').click();await settle(p);
 assert.equal(downloads,0,'nag-download kahit kulang ang brief');
 assert(await p.locator('#inspectDialog').isHidden(),'nanatiling bukas ang dialog kaya natago ang error');
 assert(await p.locator('#bStudioError').isVisible());
 assert.equal(await at(),'2');assert.equal(await focus(),'bProduct');
 // Naibalik: gumagana muli ang Download.
 await p.locator('#bProduct').fill('Ceramic mug');await settle(p);
 assert.deepEqual(await exportPNG(p,path.join(out,'gate-export.png')),{w:1080,h:1080});
 assert.equal(downloads,1);
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
 await p.locator('#bTutorial').waitFor({state:'hidden'});assert(await p.locator('#bStep3').isVisible());
 assert.equal(await p.locator('#bHeadline').inputValue(),before);
 await c.close();
});

await test('Quick Tutorial copy is professional, localized, step-matched and claims nothing that does not exist',async()=>{
 const EXPECT={
  en:['Start With Your Product','Build Your Marketing Message','Design Your Banner','Present Your Offer','Review Your Marketing Package'],
  fil:['Magsimula sa Produkto Mo','Buuin ang Marketing Message Mo','I-disenyo ang Banner Mo','Iprisinta ang Offer Mo','I-review ang Marketing Package Mo'],
  tl:['Magsimula sa Produkto Mo','Buuin ang Mensahe sa Pagmemerkado','Idisenyo ang Banner Mo','Ipakita ang Alok Mo','Suriin ang Marketing Package Mo']};
 for(const lang of['en','fil','tl']){
  const{c,p}=await env({lang});
  await p.locator('#helpBtn').click();await p.locator('#ctxHelp').waitFor({state:'visible'});
  await p.locator('#bStartTutorial').click();await p.locator('#bTutorial').waitFor({state:'visible'});
  const seen=[];
  for(let tip=1;tip<=5;tip++){
   const title=(await p.locator('#bTutorialTipTitle').textContent()).trim();
   const body=(await p.locator('#bTutorialText').textContent()).trim();
   seen.push(title);
   assert.equal(title,EXPECT[lang][tip-1],`${lang} tip ${tip} title`);
   assert(body.length>60,`${lang} tip ${tip} masyadong maikli: ${body.length}`);
   // Walang pangakong wala sa app: walang video, walang auto-posting, walang garantiya.
   assert(!/\bvideo\b|\bpanoorin\b/i.test(title+' '+body),`${lang} tip ${tip} may video claim`);
   assert(!/auto[- ]?post|automatically post|direktang (?:mag-?post|ipo-post)|i-post namin/i.test(body),`${lang} tip ${tip} may publishing claim`);
   assert(!/guarantee|guaranteed|garantisado|siguradong kita/i.test(body),`${lang} tip ${tip} may garantiya`);
   // Ang tip 5 ay dapat tumukoy sa mga bahaging TALAGANG umiiral, at sabihing tinipon lang
   // ang mga ito mula sa inilagay ng user - hindi ginawa para sa kanya.
   if(tip===5){
    for(const term of['hook','caption','CTA','hashtags'])
     assert(new RegExp(term,'i').test(body),`${lang} tip 5 walang ${term}`);
    assert(/assembled from your own inputs|tinipon ang mga ito mula sa inilagay mo mismo/i.test(body),
     `${lang} tip 5 hindi sinasabing tinipon lang mula sa inilagay`);
    assert(/Fit/.test(body)&&/100%/.test(body),`${lang} tip 5 walang tunay na zoom control`);
   }
   // Ang gabay ay hindi nagsusulat sa anumang field.
   assert.equal(await p.locator('#bHeadline').inputValue(),'');
   if(tip<5){await p.locator('#bTutorialNext').click();await settle(p);}
  }
  assert.equal(new Set(seen).size,5,`${lang}: may paulit-ulit na title`);
  // Tip 5: Finish ang nakikita, hindi Next o Skip.
  assert(await p.locator('#bTutorialNext').isHidden());
  assert(await p.locator('#bTutorialSkip').isHidden());
  assert(await p.locator('#bTutorialFinish').isVisible());
  // Pabalik hanggang tip 1: nawawala ang Back, bumabalik ang Next at Skip.
  for(let tip=4;tip>=1;tip--){await p.locator('#bTutorialBack').click();await settle(p);
   assert.equal((await p.locator('#bTutorialTipTitle').textContent()).trim(),EXPECT[lang][tip-1]);}
  assert(await p.locator('#bTutorialBack').isHidden());
  assert(await p.locator('#bTutorialNext').isVisible());
  assert(await p.locator('#bTutorialSkip').isVisible());
  // Skip at Replay: parehong nakukuha ang unang tip na tugma sa bukas na step.
  await p.locator('#bTutorialSkip').click();
  await p.locator('#bTutorial').waitFor({state:'hidden'});
  await p.locator('#helpBtn').click();await p.locator('#ctxHelp').waitFor({state:'visible'});
  await p.locator('#bStartTutorial').click();await p.locator('#bTutorial').waitFor({state:'visible'});
  assert.equal((await p.locator('#bTutorialTipTitle').textContent()).trim(),EXPECT[lang][0]);
  assert(await p.locator('#bStep1').isVisible());
  await c.close();
 }
});

for(const width of[320,360,390])for(const lang of['en','fil','tl'])for(const theme of['light','dark'])
 await test(`Increment 1 ${width}/${lang}/${theme}: photo, clickable steps and tutorial without overflow`,async()=>{
  const{c,p}=await env({width,lang,theme});
  await upload(p);await brief(p);
  assert((await onCanvas(p))>0.5);
  assert(await p.evaluate(()=>document.documentElement.scrollWidth<=innerWidth));
  await p.locator('.stepDot[data-progress="1"]').click();await settle(p);
  assert(await p.locator('#bStep1').isVisible());assert.equal(await p.locator('#bUploadArea').getAttribute('data-active'),'true');
  await p.locator('#helpBtn').click();await p.locator('#ctxHelp').waitFor({state:'visible'});
  await p.locator('#bStartTutorial').click();await p.locator('#bTutorial').waitFor({state:'visible'});
  assert((await p.locator('#bTutorialTipTitle').textContent()).trim().length>8);
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

await test('Final-validation red owns current errors and clears when corrected in both themes',async()=>{
 for(const theme of ['light','dark']){const{c,p}=await env({theme});await step(p,4);await step(p,1);await revertVisual(p);await step(p,2);await p.locator('#bProduct').fill('');await p.locator('#bHeadline').fill('');await step(p,4);await p.locator('#bGenerate').click();await settle(p);
 const state=n=>p.locator(`.stepDot[data-progress="${n}"]`).getAttribute('data-state');assert.equal(await state(1),'invalid');assert.equal(await state(2),'invalid');assert((await p.locator('.stepDot[data-progress="1"]').getAttribute('aria-label')).includes('needs fixing'));
 await pickVisual(p,'food-spotlight');await settle(p);assert.equal(await state(1),'complete');await step(p,2);await p.locator('#bProduct').fill('Bread');await p.locator('#bHeadline').fill('Fresh bread');assert.equal(await state(2),'complete');await step(p,4);await p.locator('#bCtaChoice').selectOption('none');await settle(p);assert.equal(await state(4),'complete');await c.close();}
});

// b32 lifecycle regressions: keep required fields and content checks unchanged.
const states=p=>p.locator('.stepDot').evaluateAll(ns=>ns.map(n=>n.dataset.state));
const jump=step;
await test('b32 automatic defaults never review unseen steps; deliberate navigation and Continue accept valid defaults',async()=>{
 const{c,p}=await env();assert.deepEqual(await states(p),Array(4).fill('pending'));
 await jump(p,3);assert.deepEqual(await states(p),['complete','complete','pending','pending']);
 await p.locator('#bCategory').selectOption('beauty');await settle(p);
 assert.equal(await p.locator('#bCtaChoice').inputValue(),'book');
 assert.equal((await states(p))[3],'pending','automatic CTA reviewed an unseen step');
 assert.equal(await p.locator('#bDesignStyle').inputValue(),'');
 await p.locator('#bContinue').click();await settle(p);
 assert.equal((await states(p))[2],'complete');assert.equal((await states(p))[3],'pending');
 assert.equal(await p.locator('#bDesignStyle').inputValue(),'','confirmation must not force a style');
 await p.locator('#bPrevious').click();assert.equal(await p.locator('#bCtaChoice').inputValue(),'book');await c.close();
});
await test('b32 Generate before review marks all actual errors red, leaves unseen valid defaults pending and focuses the earliest missing field',async()=>{
 const{c,p}=await env();let downloads=0;p.on('download',()=>downloads++);
 await jump(p,4);await jump(p,1);await revertVisual(p);await jump(p,2);await p.locator('#bProduct').fill('');await p.locator('#bHeadline').fill('');await jump(p,4);await p.locator('#bGenerate').click();await settle(p);
 assert.deepEqual(await states(p),['invalid','invalid','complete','pending']);
 assert.equal(await p.evaluate(()=>document.activeElement.id),'bVisualCategory');
 assert(await p.locator('#inspectDialog').isHidden());assert.equal(downloads,0);
 const current=p.locator('.stepDot[aria-current="step"]');assert.equal(await current.getAttribute('data-state'),'invalid');
 assert.equal(await current.evaluate(n=>getComputedStyle(n).backgroundColor),await p.evaluate(()=>{const x=document.createElement('div');x.style.background='var(--studio-primary)';document.body.append(x);const c=getComputedStyle(x).backgroundColor;x.remove();return c;}));
 await c.close();
});
await test('b32 optional category/style/offer/price/Advanced fields do not block valid defaults; CTA none and custom retain their contract',async()=>{
 const{c,p}=await env({setupCategory:'other'});await upload(p);await jump(p,2);
 await p.locator('#bProduct').fill('Sample product');await p.locator('#bHeadline').fill('Accurate headline');
 await jump(p,3);await resetSelect(p,'#bCategory');await jump(p,4);
 assert.equal(await p.locator('#bCtaChoice').inputValue(),'');await p.locator('#bGenerate').click();await settle(p);
 assert.equal(await p.evaluate(()=>document.activeElement.id),'bCtaChoice');assert.equal((await states(p))[3],'invalid');
 await p.locator('#bCtaChoice').selectOption('none');await settle(p);assert.equal((await states(p))[3],'complete');
 await p.locator('#bGenerate').click();await p.locator('#inspectDialog').waitFor({state:'visible'});
 assert.equal(await p.locator('#bDesignStyle').inputValue(),'');await p.locator('#inspectClose').click();
 await p.locator('#bCtaChoice').selectOption('custom');await settle(p);assert.equal((await states(p))[3],'invalid');
 await p.locator('#bCta').fill('Contact us');await settle(p);assert.equal((await states(p))[3],'complete');
 await p.locator('#bCta').fill('');await settle(p);assert.equal((await states(p))[3],'invalid');
 await c.close();
});
await test('b32 prohibited content belongs to its own step; Generate safety failures update dots and keep Preview closed',async()=>{
 const{c,p}=await env();await upload(p);await brief(p);
 await jump(p,2);await p.locator('#bHeadline').fill('guaranteed sales');await jump(p,4);
 await p.locator('#bGenerate').click();await settle(p);
 assert.deepEqual(await states(p),['complete','invalid','complete','complete']);
 assert.equal(await p.evaluate(()=>document.activeElement.id),'bHeadline');assert(await p.locator('#inspectDialog').isHidden());
 await p.locator('#bHeadline').fill('Accurate headline');await jump(p,4);await p.locator('#bOffer').fill('fake testimonials');
 await p.locator('#bGenerate').click();await settle(p);assert.deepEqual(await states(p),['complete','complete','complete','invalid']);
 assert.equal(await p.evaluate(()=>document.activeElement.id),'bOffer');
 await p.locator('#bOffer').fill('');await p.locator('#bAdvanced').evaluate(n=>n.open=true);await p.locator('#bDetail').fill('guaranteed sales');
 await p.locator('#bGenerate').click();await settle(p);assert.equal(await p.evaluate(()=>document.activeElement.id),'bDetail');
 assert.equal((await states(p))[1],'complete');assert.equal((await states(p))[3],'invalid');
 await p.locator('#bDetail').fill('');await jump(p,2);await p.locator('#bHeadline').fill('guaranteed sales');
 await jump(p,4);await p.locator('#bOffer').fill('fake testimonials');await p.locator('#bGenerate').click();await settle(p);
 assert.equal((await states(p))[1],'invalid');assert.equal((await states(p))[3],'invalid');
 await c.close();
});
await test('b32 full-brief safety still blocks prohibited phrases spanning fields, without marking an unrelated step',async()=>{
 const{c,p}=await env();await upload(p);await brief(p);await jump(p,2);await p.locator('#bHeadline').fill('guaranteed');
 await jump(p,4);await p.locator('#bAdvanced').evaluate(n=>n.open=true);await p.locator('#bDetail').fill('sales');
 await p.locator('#bGenerate').click();await settle(p);assert(await p.locator('#inspectDialog').isHidden());
 assert.equal((await states(p))[1],'invalid');assert.equal((await states(p))[3],'complete');
 assert.equal(await p.evaluate(()=>document.activeElement.id),'bHeadline');await c.close();
});
await test('b32 image-loading Generate cannot bypass validation or open Preview, and revalidates when decoding finishes',async()=>{
 const{c,p}=await env();await jump(p,2);await p.locator('#bProduct').fill('Sample product');await p.locator('#bHeadline').fill('Accurate headline');await jump(p,4);
 await p.evaluate(()=>{const original=Blob.prototype.arrayBuffer;let held=false;Blob.prototype.arrayBuffer=async function(){if(!held){held=true;await new Promise(r=>window.__releasePhoto=r);}return original.call(this);};});
 await jump(p,1);await p.locator('#bPhoto').setInputFiles(SAMPLE);await p.waitForFunction(()=>typeof window.__releasePhoto==='function');
 await jump(p,4);await p.locator('#bGenerate').click();await settle(p);assert(await p.locator('#inspectDialog').isHidden());assert.equal((await states(p))[0],'pending');
 await p.evaluate(()=>window.__releasePhoto());await p.waitForFunction(()=>!document.querySelector('#bPhotoRemove').hidden);await settle(p);
 assert.equal((await states(p))[0],'complete');await c.close();
});
for(const width of[320,360,390])for(const lang of['en','fil','tl'])for(const theme of['light','dark'])await test(`b32 status accessibility ${width}/${lang}/${theme}, 200% text and keyboard`,async()=>{
 const{c,p}=await env({width,lang,theme});assert.deepEqual(await states(p),Array(4).fill('pending'));
 await step(p,4);await step(p,2);await p.locator('#bHeadline').fill('');await p.locator('.stepDot[data-progress="2"]').focus();await p.keyboard.press('Enter');await settle(p);
 assert.equal((await states(p))[0],'complete');
 await p.locator('#bProduct').fill('Sample product');await p.locator('#bHeadline').fill('Accurate headline');await settle(p);
 assert.equal((await states(p))[1],'complete');await p.locator('#bHeadline').fill('');await settle(p);assert.equal((await states(p))[1],'pending');await p.locator('#bContinue').click();assert.equal((await states(p))[1],'incomplete');
 const label=await p.locator('.stepDot[data-progress="2"]').getAttribute('aria-label');assert(label.includes(lang==='en'?'incomplete — needs attention':'hindi pa kumpleto — may dapat ayusin'));
 const before=await states(p);const next=lang==='en'?'fil':'en';
 await p.evaluate(l=>{localStorage.setItem('mgpref_lang',l);window.dispatchEvent(new StorageEvent('storage',{key:'mgpref_lang',newValue:l}));},next);await settle(p);
 assert.deepEqual(await states(p),before);assert.equal(await p.locator('#bProduct').inputValue(),'Sample product');
 await p.evaluate(()=>{const ns=[document.documentElement,...document.querySelectorAll('body *')].filter(n=>n instanceof HTMLElement),sizes=ns.map(n=>parseFloat(getComputedStyle(n).fontSize)*2);ns.forEach((n,i)=>n.style.fontSize=sizes[i]+'px');});
 assert(await p.evaluate(()=>document.documentElement.scrollWidth<=innerWidth));
 const metrics=await p.locator('.stepDot').evaluateAll(ns=>ns.map(n=>{const r=n.getBoundingClientRect(),tap=getComputedStyle(n,'::after'),dot=getComputedStyle(n,'::before'),s=getComputedStyle(n);return{w:r.width-2*parseFloat(tap.left),h:r.height-2*parseFloat(tap.top),state:n.dataset.state,style:dot.borderStyle,color:dot.borderColor,bg:s.backgroundColor,active:n.hasAttribute('aria-current')};}));
 assert(metrics.every(n=>n.w>=44&&n.h>=44));assert.equal(metrics.filter(n=>n.active).length,1);assert.equal(metrics[1].style,'none');
 await p.locator('.stepDot[data-progress="4"]').click();await p.locator('#bGenerate').click();await settle(p);assert.equal((await states(p))[1],'invalid');
 const ring=await p.locator('.stepDot[data-progress="2"]').evaluate(n=>getComputedStyle(n,'::before').borderStyle);assert.equal(ring,'solid');
 if(width===390){await p.screenshot({path:path.join(out,`b32-errors-${lang}-${theme}.png`),fullPage:true});}
 await c.close();
});

for(const e of contexts){assert.deepEqual(e.errors,[]);assert.deepEqual(e.external,[]);assert.deepEqual(e.writes,[]);}
fs.writeFileSync(path.join(out,'inc1-results.json'),JSON.stringify({result:'PASS',results,
 auth:'Mocked services; emulated viewports only - no physical Android and no production-backed test'},null,2));
}finally{await b.close()}})().catch(e=>{console.error(e);
 fs.writeFileSync(path.join(out,'inc1-results.json'),JSON.stringify({results,failure:e.message},null,2));process.exitCode=1});
