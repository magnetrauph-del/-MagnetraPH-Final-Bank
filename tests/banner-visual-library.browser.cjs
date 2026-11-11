// Service Visual Library: lahat ng 22 kategorya, ang picker, at ang paglabas sa PNG.
// Start: python -m http.server 8876 --bind 127.0.0.1 --directory public
const{chromium}=require('playwright'),assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path');
const{env:makeEnv,step,preview,exportPNG,settle,pickVisual}=require('./fixtures/banner-wizard.cjs');
const out=process.env.MAGNETRA_LIBRARY_ARTIFACTS||'/tmp/magnetra-visual-library';fs.mkdirSync(out,{recursive:true});
const SAMPLE=path.join(__dirname,'fixtures/product-sample.png');
const results=[],contexts=[];let b;
async function env(o){const e=await makeEnv(b,o);contexts.push(e);return e;}
async function test(name,run){await run();results.push({name,result:'PASS'});console.log('PASS',name);}

// Bilang ng pixel na may kulay sa isang thumbnail canvas.
const painted=loc=>loc.evaluate(cv=>{const c=cv.getContext('2d',{willReadFrequently:true});
 const d=c.getImageData(0,0,cv.width,cv.height).data;let n=0;
 for(let i=3;i<d.length;i+=4)if(d[i]>8)n++;return +(100*n/(cv.width*cv.height)).toFixed(1);});

(async()=>{b=await chromium.launch({executablePath:'/usr/bin/chromium',args:['--no-sandbox']});try{

await test('All 22 categories carry three visuals that really draw and are all different',async()=>{
 const{c,p}=await env();
 const report=await p.evaluate(async()=>{
  const m=await import('./banner-visuals.js?v=1');
  const pal={ink:'#1E1B4B',accent:'#4F46E5'},rows=[],seen={};
  for(const cat of m.VISUAL_CATEGORIES)for(const v of cat.visuals){
   const cv=document.createElement('canvas');cv.width=cv.height=240;
   const c2=cv.getContext('2d',{willReadFrequently:true});
   c2.fillStyle='#FFF';c2.fillRect(0,0,240,240);
   c2.save();c2.scale(240/m.VISUAL_BOX,240/m.VISUAL_BOX);
   const drew=m.drawVisual(c2,v.id,pal);c2.restore();
   const d=c2.getImageData(0,0,240,240).data;let ink=0,h=2166136261;
   for(let i=0;i<d.length;i+=4){
    if(d[i]!==255||d[i+1]!==255||d[i+2]!==255)ink++;
    h^=d[i]+d[i+1]*3+d[i+2]*7;h=Math.imul(h,16777619);
   }
   const key=(h>>>0).toString(16);
   rows.push({id:v.id,cat:cat.id,drew,ink:ink/57600,dup:seen[key]||null});
   seen[key]=v.id;
  }
  return {rows,cats:m.VISUAL_CATEGORIES.length,total:Object.keys(m.VISUAL_BY_ID).length};
 });
 assert.equal(report.cats,22,`${report.cats} kategorya, hindi 22`);
 assert.equal(report.total,66,`${report.total} visual, hindi 66`);
 for(const r of report.rows){
  assert(r.drew,`${r.id}: hindi nagawa`);
  assert(r.ink>0.05,`${r.id}: halos blangko (${(r.ink*100).toFixed(1)}%)`);
  assert(!r.dup,`${r.id}: kapareho ng pixel ng ${r.dup}`);
 }
 fs.writeFileSync(path.join(out,'coverage.json'),JSON.stringify(report.rows.map(r=>r.id)));
 await c.close();
});

await test('Every category is reachable from the dropdown and offers its three designs',async()=>{
 const{c,p}=await env();
 // Laging nakikita ang picker: wala nang mode switch at wala nang hiwalay na search.
 assert.equal(await p.locator('#bVisualCategory option:not([value=""])').count(),22);
 assert.equal(await p.locator('#bVisualPicks .visualBtn').count(),3,'hindi tatlo ang disenyo');
 assert.equal(await p.locator('#bVisualSearch').count(),0,'nandiyan pa ang search field');
 assert.equal(await p.locator('#bModePhoto, #bModeLibrary').count(),0,'nandiyan pa ang mode switch');
 // Bawat isa sa 22 ay nagbibigay ng tatlong iginuhit na disenyo - 66 ang kabuuan.
 const ids=await p.locator('#bVisualCategory option:not([value=""])').evaluateAll(o=>o.map(n=>n.value));
 assert.equal(ids.length,22);
 const seen=new Set();
 for(const cat of ids){
  await p.locator('#bVisualCategory').selectOption(cat);await settle(p);
  const shown=await p.locator('#bVisualPicks .visualBtn').evaluateAll(b=>b.map(n=>n.dataset.visual));
  assert.equal(shown.length,3,`${cat}: ${shown.length} disenyo`);
  for(const id of shown){assert(id.startsWith(cat+'-'),`${cat}: mali ang ${id}`);seen.add(id);}
  assert(await painted(p.locator('#bVisualPicks .visualBtn canvas').first())>10,`${cat}: blangko ang thumbnail`);
 }
 assert.equal(seen.size,66,`${seen.size} visual ang naabot, hindi 66`);
 await c.close();
});

await test('A chosen visual reaches the preview and the exported PNG in all three formats',async()=>{
 const{c,p}=await env();
 await pickVisual(p,'pets-spotlight');
 await step(p,2);await p.locator('#bProduct').fill('Pet grooming');await p.locator('#bHeadline').fill('Gentle grooming');
 await p.locator('#bPrice').fill('₱500');await settle(p);
 await step(p,3);await p.locator('#bCategory').selectOption('services');await settle(p);
 await step(p,4);await p.locator('#bCtaChoice').selectOption('book');await settle(p);
 for(const[format,w,h]of[['square',1080,1080],['portrait',1080,1350],['story',1080,1920]]){
  await p.locator(`input[name="bFormat"][value="${format}"]`).check();await settle(p);
  // Nasa canvas ang guhit.
  const live=await p.evaluate(()=>{const cv=document.querySelector('#bCanvas');
   const c2=cv.getContext('2d',{willReadFrequently:true});
   const d=c2.getImageData(0,0,cv.width,cv.height).data;let n=0;
   for(let i=0;i<d.length;i+=4)n++;return n>0;});
  assert(live);
  const file=path.join(out,`visual-${format}.png`);
  assert.deepEqual(await exportPNG(p,file),{w,h},`${format}: maling sukat`);
  assert(fs.statSync(file).size>8000,`${format}: masyadong maliit ang PNG`);
  await p.locator('#inspectClose').click();await settle(p);
 }
 await c.close();
});

await test('A chosen visual survives moving through steps 1 to 4 and back',async()=>{
 const{c,p}=await env();
 await pickVisual(p,'finance-pattern');
 await step(p,2);await p.locator('#bProduct').fill('Loan help');await p.locator('#bHeadline').fill('Fast approval');await settle(p);
 for(const n of[3,4,1,2,4,1]){await step(p,n);}
 assert.equal(await p.locator('#bUploadArea').getAttribute('data-active'),'false','naging aktibo ang walang larawang upload area');
 assert(await p.locator('.visualBtn[data-visual="finance-pattern"][aria-pressed="true"]').count(),'nawala ang napili');
 await step(p,2);
 assert.equal(await p.locator('#bHeadline').inputValue(),'Fast approval');
 await c.close();
});

for(const lang of['en','fil','tl'])for(const theme of['light','dark'])
 await test(`The library is usable at 360px in ${lang}/${theme}`,async()=>{
  const{c,p}=await env({width:360,lang,theme});
  // Naisalin ang tatlong pamuhatan ng Step 1.
  // Wala na ang dalawang label sa labas ng upload box; ang button sa loob ang natitira.
  assert.equal(await p.locator('#bUploadHead, #bVisualHead').count(),0,'may natirang dobleng label');
  assert(await p.locator('#bPhotoAction').isVisible(),'nawala ang upload button sa loob ng box');
  for(const id of['bVisualPicksLabel'])
   assert((await p.locator('#'+id).textContent()).trim().length>2,`${id} walang laman`);
  assert.equal(await p.locator('#bVisualPicks .visualBtn').count(),3);
  assert(await painted(p.locator('#bVisualPicks .visualBtn canvas').first())>10,'blangko ang thumbnail');
  // Tunay na button, may aria-pressed, at umaabot sa 44px.
  for(let i=0;i<3;i++){
   const btn=p.locator('#bVisualPicks .visualBtn').nth(i);
   assert.equal(await btn.evaluate(n=>n.tagName),'BUTTON');
   assert(['true','false'].includes(await btn.getAttribute('aria-pressed')));
   const box=await btn.boundingBox();
   assert(box.height>=44,`${lang}/${theme} thumbnail ${i}: ${box.height}px lang ang taas`);
  }
  // Wala nang mode switch: ang huling kilos ang nagtatakda kung alin ang aktibo.
  assert.equal(await p.locator('.modeBtn, #bModePhoto, #bModeLibrary').count(),0);
  // Walang pahalang na pag-apaw, kahit bukas ang See All.
  assert(await p.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),
   `${lang}/${theme}: umapaw ang pahina`);
  await pickVisual(p,'travel-scene');await settle(p);
  assert(await p.locator('.visualBtn[data-visual="travel-scene"][aria-pressed="true"]').count());
  await c.close();
 });

await test('Nothing in the library reaches the network or writes anything',async()=>{
 const{c,p}=await env();
 await pickVisual(p,'creative-pattern');
 await step(p,2);await p.locator('#bProduct').fill('Photo studio');await p.locator('#bHeadline').fill('Book a shoot');await settle(p);
 await step(p,4);await p.locator('#bCtaChoice').selectOption('book');await settle(p);
 await preview(p);
 await c.close();
});

for(const e of contexts){assert.deepEqual(e.errors,[]);assert.deepEqual(e.external,[]);assert.deepEqual(e.writes,[]);}
fs.writeFileSync(path.join(out,'library-results.json'),JSON.stringify({result:'PASS',results,
 categories:22,visuals:66,auth:'Mocked services; emulated viewports only - no physical Android device'},null,2));
}finally{await b.close()}})().catch(e=>{console.error(e);process.exitCode=1});
