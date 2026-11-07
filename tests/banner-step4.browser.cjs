// Step 4 pagkatapos ng paglilinis: Special Offer, CTA, format at Advanced.
// Start: python -m http.server 8876 --bind 127.0.0.1 --directory public
const{chromium}=require('playwright'),assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path');
const{env:makeEnv,step,preview,exportPNG,settle,pickVisual}=require('./fixtures/banner-wizard.cjs');
const out=process.env.MAGNETRA_STEP4_ARTIFACTS||'/tmp/magnetra-step4';fs.mkdirSync(out,{recursive:true});
const results=[],contexts=[];let b;
async function env(o){const e=await makeEnv(b,o);contexts.push(e);return e;}
async function test(name,run){await run();results.push({name,result:'PASS'});console.log('PASS',name);}
const setCat=async(p,v)=>{await step(p,3);await p.locator('#bCategory').selectOption(v);await settle(p);await step(p,4);};
const openAdvanced=p=>p.locator('#bAdvanced').evaluate(n=>{n.open=true;});
// Isang kumpletong brief para makalabas ang preview at ang PNG.
async function brief4(p){
 await pickVisual(p,'food-spotlight');
 await step(p,2);await p.locator('#bProduct').fill('Pandesal');
 await p.locator('#bHeadline').fill('Mainit tuwing umaga');await p.locator('#bPrice').fill('₱50');
 await settle(p);await step(p,4);
}

// Inaprubahan ng owner noong 2026-11-07.
const CTA_CHOICES=[['','No CTA','Walang CTA'],['shop','Shop Now','Shop Now'],['order','Order Now','Order Now'],
 ['message','Message Us','Message Us'],['book','Book Now','Book Now'],['learn','Learn More','Learn More'],
 ['custom','Custom CTA','Custom CTA']];
const SUGGESTED={food:'order',ecommerce:'shop',fashion:'shop',luxury:'shop',electronics:'shop',grocery:'shop',
 arts:'shop',agriculture:'shop',beauty:'book',fitness:'book',events:'book',travel:'book',property:'book',
 services:'book',automotive:'book',pets:'book',education:'book',home:'message',b2b:'message',digital:'learn'};

(async()=>{b=await chromium.launch({executablePath:'/usr/bin/chromium',args:['--no-sandbox']});try{

await test('All seven CTA choices survive in order, with the approved wording in English and Filipino',async()=>{
 for(const[lang,idx]of[['en',1],['fil',2]]){
  const{c,p}=await env({lang});
  await step(p,4);
  const opts=await p.locator('#bCtaChoice option').evaluateAll(o=>o.map(n=>[n.value,n.textContent.trim()]));
  assert.deepEqual(opts,CTA_CHOICES.map(x=>[x[0],x[idx]]),lang);
  await c.close();
 }
});

await test('Each business category suggests a sensible CTA, and the suggestion writes the real button text',async()=>{
 const{c,p}=await env();
 for(const[cat,want]of Object.entries(SUGGESTED)){
  await setCat(p,cat);
  assert.equal(await p.locator('#bCtaChoice').inputValue(),want,cat);
  // Ang teksto ng pindutan ay naisusulat din, hindi lang ang pili.
  const label=CTA_CHOICES.find(x=>x[0]===want)[1];
  assert.equal(await p.locator('#bCta').inputValue(),label,cat+' text');
 }
 // Walang mungkahi ang "other": hinahayaan nito ang kasalukuyang pili.
 await setCat(p,'digital');
 assert.equal(await p.locator('#bCtaChoice').inputValue(),'learn');
 await setCat(p,'other');
 assert.equal(await p.locator('#bCtaChoice').inputValue(),'learn','pinalitan pala ng "other"');
 await c.close();
});

await test('A manual CTA is never overwritten by a category change, No CTA included',async()=>{
 const{c,p}=await env();
 await setCat(p,'food');
 assert.equal(await p.locator('#bCtaChoice').inputValue(),'order');
 // Manu-manong Learn More: mananatili sa lahat ng kategorya.
 await p.locator('#bCtaChoice').selectOption('learn');await settle(p);
 for(const cat of['ecommerce','beauty','b2b','food','travel']){
  await setCat(p,cat);
  assert.equal(await p.locator('#bCtaChoice').inputValue(),'learn',cat+': pinalitan ang manu-manong pili');
 }
 // Manu-manong Walang CTA: mananatiling walang laman.
 await p.locator('#bCtaChoice').selectOption('');await settle(p);
 for(const cat of['ecommerce','food','digital','services']){
  await setCat(p,cat);
  assert.equal(await p.locator('#bCtaChoice').inputValue(),'',cat+': pinalitan ang Walang CTA');
  assert.equal(await p.locator('#bCta').inputValue(),'',cat+': may naiwang teksto');
 }
 await c.close();
});

await test('Custom CTA reveals its input, keeps the typed words, and prints them on the exported PNG',async()=>{
 const{c,p}=await env();
 await brief4(p);
 assert(await p.locator('#bCtaCustom').isHidden());
 await p.locator('#bCtaChoice').selectOption('custom');await settle(p);
 assert(await p.locator('#bCtaCustom').isVisible());
 await p.locator('#bCta').fill('Reserve ngayon');await settle(p);
 // Hindi ito nawawala kapag nagpalit ng kategorya o naglibot sa mga step.
 await setCat(p,'travel');
 assert.equal(await p.locator('#bCtaChoice').inputValue(),'custom');
 assert.equal(await p.locator('#bCta').inputValue(),'Reserve ngayon');
 for(const n of[1,2,3,4]){await p.locator(`.stepDot[data-progress="${n}"]`).click();await settle(p);}
 assert.equal(await p.locator('#bCta').inputValue(),'Reserve ngayon','nawala sa paglilibot');
 // Umaabot ito sa canvas: may role na cta at nagbabago ang guhit kapag binago ang teksto.
 const roles=await p.evaluate(()=>window.__mgLastRoles||null);
 await preview(p);
 const file=path.join(out,'custom-cta.png');
 assert.deepEqual(await exportPNG(p,file),{w:1080,h:1080});
 assert(fs.statSync(file).size>8000);
 await p.locator('#inspectClose').click();await settle(p);
 await c.close();
});

await test('Square, Portrait and Story export at their real sizes and say so on the card',async()=>{
 const{c,p}=await env();
 await brief4(p);
 const SIZES=[['square',1080,1080,'1:1'],['portrait',1080,1350,'4:5'],['story',1080,1920,'9:16']];
 const labels=await p.locator('.formatFieldset .choice span').allTextContents();
 assert.deepEqual(labels.map(x=>x.trim()),['Square 1:1','Portrait 4:5','Story 9:16']);
 for(const[fmt,w,h,ratio]of SIZES){
  await p.locator(`input[name="bFormat"][value="${fmt}"]`).check();await settle(p);
  // Ang nakasulat na sukat ay tumutugma sa tunay na na-export.
  assert.equal((await p.locator('#bFormatSize').textContent()).trim(),`${w} × ${h}`,fmt);
  await preview(p);
  const file=path.join(out,`fmt-${fmt}.png`);
  assert.deepEqual(await exportPNG(p,file),{w,h},fmt+': maling sukat');
  // Ang nakasulat na ratio ay tumutugma rin sa tunay na sukat.
  const[rw,rh]=ratio.split(':').map(Number);
  assert.equal(Math.round(w/h*1000),Math.round(rw/rh*1000),fmt+': maling ratio sa label');
  await p.locator('#inspectClose').click();await settle(p);
 }
 await c.close();
});

await test('Advanced stays shut until opened, holds exactly four labelled fields in order, and hides nothing else behind clutter',async()=>{
 const ORDER=['Additional Details','Business Name','Contact Information','Highlight Badge'];
 for(const lang of['en','fil','tl']){
  const{c,p}=await env({lang,width:360});
  await step(p,4);
  assert.equal(await p.locator('#bAdvanced').evaluate(n=>n.open),false,'bukas agad ang Advanced');
  assert(await p.locator('#bDetail').isHidden());
  assert.equal((await p.locator('#bAdvanced > summary').textContent()).trim(),
   lang==='tl'?'Advanced Customization (Opsyonal)':'Advanced Customization (Optional)',lang);
  await openAdvanced(p);await settle(p);
  // Apat na field, sa inaprubahang pagkakasunod, bawat isa may label sa itaas.
  const got=await p.evaluate(()=>['bDetail','bBusiness','bContact','bBadge'].map(id=>{
   const lb=document.querySelector(`label[for="${id}"]`),inp=document.getElementById(id);
   return {label:lb.textContent.trim(),above:lb.compareDocumentPosition(inp)&Node.DOCUMENT_POSITION_FOLLOWING?true:false,
    value:inp.value,ph:inp.getAttribute('placeholder')||''};}));
  assert.deepEqual(got.map(x=>x.label),ORDER,lang);
  for(const f of got){
   assert(f.above,lang+' '+f.label+': wala sa itaas ang label');
   assert.equal(f.value,'',lang+' '+f.label+': may paunang laman');
   assert.equal(f.ph,'',lang+' '+f.label+': may halimbawa sa loob');
   assert(!/optional|opsyonal/i.test(f.label),lang+' '+f.label+': inuulit ang Optional');
  }
  // Wala nang permanenteng talata sa loob ng Advanced.
  assert.equal(await p.locator('#bContactHelp, #bBadgeHelp').count(),0,lang+': may natirang talata');
  assert.equal(await p.locator('#bAdvanced fieldset .hint').count(),0,lang+': may talata sa ilalim ng tema');
  await c.close();
 }
});

await test('Special Offer and Custom CTA start blank, with no example text inside them',async()=>{
 for(const lang of['en','fil','tl']){
  const{c,p}=await env({lang});
  await step(p,4);
  const offer=p.locator('#bOffer');
  assert.equal((await p.locator('label[for="bOffer"]').textContent()).trim(),
   lang==='tl'?'Special Offer (Opsyonal)':'Special Offer (Optional)',lang);
  assert.equal(await offer.inputValue(),'',lang+': may laman ang offer');
  assert.equal(await offer.getAttribute('placeholder'),null,lang+': may halimbawa sa offer');
  assert.equal(await p.locator('#bOfferHelp').count(),0,lang+': may talata sa ilalim ng offer');
  // Walang offer na lumalabas sa banner kung wala kang isinulat.
  const roles=await p.evaluate(async()=>{const{renderBanner}=await import('/banner-render.js?v=6');
   const cv=document.createElement('canvas');
   return renderBanner(cv,{preset:'food-split-left',serviceVisual:'food-spotlight',product:'Pandesal',
    headline:'Mainit',price:'\u20B150',cta:'Order Now'}).boxes.map(x=>x.role);});
  assert(!roles.includes('offer'),lang+': may offer kahit walang isinulat');
  await c.close();
 }
});

await test('Switching to Custom CTA clears the preset words instead of handing them over as the user text',async()=>{
 const{c,p}=await env();
 await setCat(p,'food');
 assert.equal(await p.locator('#bCta').inputValue(),'Order Now');
 // Ang Order Now ay isinulat ng app, kaya hindi ito dapat maging sariling teksto.
 await p.locator('#bCtaChoice').selectOption('custom');await settle(p);
 assert.equal(await p.locator('#bCta').inputValue(),'','naiwan ang teksto ng app sa Custom');
 assert(await p.locator('#bCtaCustom').isVisible());
 // Ang isinulat ng user ay nananatili kahit lumabas-pasok sa Custom.
 await p.locator('#bCta').fill('Reserve ngayon');await settle(p);
 await p.locator('#bCtaChoice').selectOption('book');await settle(p);
 assert.equal(await p.locator('#bCta').inputValue(),'Book Now');
 await p.locator('#bCtaChoice').selectOption('custom');await settle(p);
 assert.equal(await p.locator('#bCta').inputValue(),'','naiwan ang Book Now sa Custom');
 await c.close();
});

await test('Enhance Photo is out of the Step 4 UI, and the banner renders exactly as before without it',async()=>{
 const{c,p}=await env();
 await step(p,4);await openAdvanced(p);await settle(p);
 // Nakatago ang kontrol at ang paliwanag nito.
 assert(await p.locator('#bEnhanceRow').isHidden(),'nakikita pa ang Enhance Photo');
 assert.equal(await p.locator('#bAdvanced .studioToggle:visible').count(),0);
 assert(!(await p.locator('#bStep4').innerText()).includes('Enhance'),'may natirang teksto');
 // Nananatili sa DOM ang checkbox, naka-off, kaya hindi nagbabago ang read() at ang estado.
 assert.equal(await p.locator('#bEnhance').count(),1);
 assert.equal(await p.locator('#bEnhance').isChecked(),false);
 // Walang pangakong AI kahit saan sa Step 4.
 for(const lie of[/\bAI\b/i,/enhanc\w* by AI/i,/upscal/i,/restor/i])
  assert(!lie.test(await p.locator('#bStep4').innerText()),'may pangakong hindi totoo');
 // Ganoon pa rin ang guhit: ang default na enhance:false ang ginagamit noon at ngayon.
 const same=await p.evaluate(async()=>{
  const{renderBanner}=await import('/banner-render.js?v=6');
  const cv=document.createElement('canvas');
  const hash=()=>{const d=cv.getContext('2d',{willReadFrequently:true}).getImageData(0,0,cv.width,cv.height).data;
   let h=2166136261;for(let i=0;i<d.length;i+=4){h^=d[i]+d[i+1]*3+d[i+2]*7;h=Math.imul(h,16777619);}return (h>>>0).toString(16);};
  const base={preset:'food-split-left',serviceVisual:'food-spotlight',product:'Pandesal',headline:'Mainit',price:'\u20B150',cta:'Order Now'};
  renderBanner(cv,base);const a=hash();
  renderBanner(cv,{...base,enhance:false});const b2=hash();
  return a===b2;});
 assert(same,'nagbago ang guhit nang walang enhance');
 await c.close();
});

await test('All four Advanced fields stay optional and never block Generate Preview',async()=>{
 const{c,p}=await env();
 await brief4(p);
 // Walang laman ang apat, pero bumubukas pa rin ang preview at lumalabas ang PNG.
 await openAdvanced(p);
 for(const id of['bDetail','bBusiness','bContact','bBadge'])
  assert.equal(await p.locator('#'+id).inputValue(),'',id);
 await preview(p);
 assert.deepEqual(await exportPNG(p,path.join(out,'optional-empty.png')),{w:1080,h:1080});
 await p.locator('#inspectClose').click();await settle(p);
 // Hindi rin nawawala ang laman kapag isinara at binuksan muli ang Advanced.
 await p.locator('#bBadge').fill('BESTSELLER');await p.locator('#bContact').fill('0917 123 4567');await settle(p);
 await p.locator('#bAdvanced').evaluate(n=>{n.open=false;});await settle(p);
 await openAdvanced(p);await settle(p);
 assert.equal(await p.locator('#bBadge').inputValue(),'BESTSELLER');
 assert.equal(await p.locator('#bContact').inputValue(),'0917 123 4567');
 await c.close();
});

await test('Theme Colors only repaints when Design Style is Theme Colors, exactly as the helper text says',async()=>{
 const{c,p}=await env();
 const r=await p.evaluate(async()=>{
  const{renderBanner,THEMES}=await import('/banner-render.js?v=6');
  const{STYLES}=await import('/banner-catalog.js?v=2');
  const cv=document.createElement('canvas');
  const hash=()=>{const d=cv.getContext('2d',{willReadFrequently:true}).getImageData(0,0,cv.width,cv.height).data;
   let h=2166136261;for(let i=0;i<d.length;i+=4){h^=d[i]+d[i+1]*3+d[i+2]*7;h=Math.imul(h,16777619);}return (h>>>0).toString(16);};
  return STYLES.map(st=>({style:st.id,distinct:new Set(Object.keys(THEMES).map(th=>{
   renderBanner(cv,{preset:'food-split-left',designStyle:st.id,theme:th,serviceVisual:'food-spotlight',
    product:'Sample',headline:'Your exact words',price:'₱99',cta:'Order Now'});return hash();})).size}));
 });
 const byStyle=Object.fromEntries(r.map(x=>[x.style,x.distinct]));
 assert.equal(byStyle.brand,4,'hindi apat ang magkakaibang tema sa Theme Colors');
 for(const st of['category','minimal','luxury','bold','tropical'])
  assert.equal(byStyle[st],1,st+': may epekto pala ang tema rito');
 // Wala nang permanenteng talata sa Step 4; nasa Help na ang paliwanag.
 await step(p,4);await openAdvanced(p);
 assert.equal(await p.locator('#bAdvanced fieldset .hint').count(),0);
 const faq=await p.evaluate(async()=>{const{STRINGS}=await import('/banner-i18n.js?v=20');
  return ['en','fil','tl'].map(l=>STRINGS[l].faqCategoriesBody);});
 for(const body of faq)assert(/Theme Colors/.test(body)&&/Step 4/.test(body),body.slice(-120));
 // Apat pa rin ang tema at buo ang pagkakasunod.
 assert.deepEqual(await p.locator('#bAdvanced input[name="bTheme"]').evaluateAll(ns=>ns.map(n=>n.value)),
  ['indigo','lavender','coral','teal']);
 await c.close();
});


await test('Offer, business name, contact and badge all reach the banner and survive navigation',async()=>{
 const{c,p}=await env();
 await brief4(p);
 await p.locator('#bOffer').fill('10% off hanggang Linggo');
 await openAdvanced(p);
 await p.locator('#bDetail').fill('Lutong bahay araw-araw');
 await p.locator('#bBusiness').fill('Aling Nena Bakery');
 await p.locator('#bContact').fill('0917 123 4567');
 await p.locator('#bBadge').fill('BESTSELLER');
 await settle(p);
 // Lumalabas silang lahat sa canvas bilang sariling bahagi.
 const roles=await p.evaluate(async()=>{
  const{renderBanner}=await import('/banner-render.js?v=6');
  const cv=document.createElement('canvas');
  const r=renderBanner(cv,{preset:'food-split-left',serviceVisual:'food-spotlight',product:'Pandesal',
   headline:'Mainit tuwing umaga',price:'₱50',cta:'Order Now',offer:'10% off hanggang Linggo',
   detail:'Lutong bahay araw-araw',business:'Aling Nena Bakery',contact:'0917 123 4567',badge:'BESTSELLER'});
  return r.boxes.map(x=>x.role);
 });
 for(const role of['offer','business','contact','badge'])
  assert(roles.includes(role),role+' hindi umabot sa banner: '+roles.join(','));
 // Buo pa rin pagkatapos maglibot sa apat na step.
 for(const n of[1,2,3,4,1,4]){await p.locator(`.stepDot[data-progress="${n}"]`).click();await settle(p);}
 await openAdvanced(p);
 assert.equal(await p.locator('#bOffer').inputValue(),'10% off hanggang Linggo');
 assert.equal(await p.locator('#bDetail').inputValue(),'Lutong bahay araw-araw');
 assert.equal(await p.locator('#bBusiness').inputValue(),'Aling Nena Bakery');
 assert.equal(await p.locator('#bContact').inputValue(),'0917 123 4567');
 assert.equal(await p.locator('#bBadge').inputValue(),'BESTSELLER');
 await c.close();
});

for(const lang of['en','fil','tl'])for(const theme of['light','dark'])
 await test(`Step 4 is usable at 360px in ${lang}/${theme}`,async()=>{
  const{c,p}=await env({width:360,lang,theme});
  await step(p,4);await openAdvanced(p);await settle(p);
  // Naisalin ang lahat: walang natirang susi na nakikita bilang teksto.
  const text=await p.locator('#bStep4').innerText();
  assert(!/\b(wizard[A-Z]|fmt[A-Z]|th[A-Z][a-z]+$)/m.test(text),'may hindi naisaling susi: '+text.slice(0,200));
  // Wala nang permanenteng paliwanag sa Step 4: malinis ang anyo nito.
  assert.equal(await p.locator('#bOfferHelp, #bContactHelp, #bBadgeHelp').count(),0,`${lang}/${theme}: may natirang talata`);
  // Isang hint lang ang natitira: ang sukat sa ilalim ng format.
  const hints=await p.locator('#bStep4 .hint:visible').evaluateAll(ns=>ns.map(n=>n.id||n.textContent.trim()));
  assert.deepEqual(hints,['bFormatSize'],`${lang}/${theme}: `+JSON.stringify(hints));
  // Ang pipindutin ay ang label, hindi ang nakatagong radio. Dapat umabot sa 44px.
  for(const sel of['.formatFieldset .choice','#bAdvanced fieldset .choice'])
   for(const box of await p.locator(sel).evaluateAll(ns=>ns.map(n=>n.getBoundingClientRect().height)))
    assert(box>=44,`${lang}/${theme} ${sel}: ${Math.round(box)}px lang`);
  for(const sel of['#bCtaChoice','#bOffer','#bContact'])
   assert((await p.locator(sel).boundingBox()).height>=40,`${lang}/${theme} ${sel}`);
  assert(await p.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),`${lang}/${theme}: umapaw`);
  await c.close();
 });

await test('Nothing in Step 4 reaches the network or writes anything',async()=>{
 const{c,p}=await env();
 await brief4(p);
 await p.locator('#bOffer').fill('10% off');
 await p.locator('#bCtaChoice').selectOption('book');await settle(p);
 await openAdvanced(p);await p.locator('#bBadge').fill('NEW');
 await p.locator('input[name="bTheme"][value="coral"]').check();
 await settle(p);
 await preview(p);
 await c.close();
});

for(const e of contexts){assert.deepEqual(e.errors,[]);assert.deepEqual(e.external,[]);assert.deepEqual(e.writes,[]);}
fs.writeFileSync(path.join(out,'step4-results.json'),JSON.stringify({result:'PASS',results,
 ctaChoices:7,formats:3,
 auth:'Mocked services; emulated viewports only - no physical Android device'},null,2));
}finally{await b.close()}})().catch(e=>{console.error(e);process.exitCode=1});
