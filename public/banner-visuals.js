// Service Visual Library. Lahat ay iginuguhit nang lokal gamit ang canvas paths: walang
// stock image, walang network, walang lisensyang pag-aalinlangan. Iisang drawVisual() ang
// ginagamit ng banner at ng maliliit na thumbnail, kaya hindi sila kailanman magkaiba.
//
// Bawat kategorya ay may sariling motif, at ang bawat motif ay inilalagay sa tatlong
// tunay na magkaibang komposisyon - hindi magkaparehong hugis na iba lang ang kulay.

const BOX = 600; // logical viewbox; square para hindi mabaluktot sa anumang format

/* ---------- maliliit na panulat ---------- */
const rr=(c,x,y,w,h,r)=>{const k=Math.min(r,w/2,h/2);c.beginPath();c.moveTo(x+k,y);
  c.arcTo(x+w,y,x+w,y+h,k);c.arcTo(x+w,y+h,x,y+h,k);c.arcTo(x,y+h,x,y,k);c.arcTo(x,y,x+w,y,k);c.closePath();};
const dot=(c,x,y,r)=>{c.beginPath();c.arc(x,y,r,0,Math.PI*2);c.closePath();};
const path=(c,pts)=>{c.beginPath();pts.forEach((p,i)=>i?c.lineTo(p[0],p[1]):c.moveTo(p[0],p[1]));};
const poly=(c,pts)=>{path(c,pts);c.closePath();};
const stroke=(c,p,w=14)=>{c.strokeStyle=p;c.lineWidth=w;c.lineCap='round';c.lineJoin='round';c.stroke();};

/* ---------- 22 motif, isa kada kategorya ---------- */
// Bawat isa ay gumuguhit sa loob ng 0..600 at gumagamit lamang ng ink at accent.
const MOTIF = {
  food(c,ink,accent){
    c.fillStyle=accent;poly(c,[[140,300],[460,300],[420,440],[180,440]]);c.fill();
    c.fillStyle=ink;rr(c,130,286,340,26,13);c.fill();
    for(const x of[236,300,364]){path(c,[[x,250],[x-18,210],[x,168]]);stroke(c,ink,12);}
    c.fillStyle=ink;rr(c,196,452,208,18,9);c.fill();
  },
  beauty(c,ink,accent){
    c.fillStyle=accent;rr(c,222,236,156,232,34);c.fill();
    c.fillStyle=ink;rr(c,268,176,64,62,14);c.fill();rr(c,286,128,28,54,12);c.fill();
    path(c,[[314,146],[372,146],[372,190]]);stroke(c,ink,14);
    c.fillStyle=ink;poly(c,[[300,300],[338,358],[300,398],[262,358]]);c.fill();
  },
  health(c,ink,accent){
    c.fillStyle=accent;
    c.beginPath();c.moveTo(300,420);c.bezierCurveTo(140,318,160,196,246,196);
    c.bezierCurveTo(284,196,300,224,300,236);c.bezierCurveTo(300,224,316,196,354,196);
    c.bezierCurveTo(440,196,460,318,300,420);c.closePath();c.fill();
    path(c,[[150,300],[228,300],[258,250],[300,348],[340,290],[372,300],[450,300]]);stroke(c,ink,16);
  },
  education(c,ink,accent){
    c.fillStyle=accent;poly(c,[[300,150],[480,224],[300,298],[120,224]]);c.fill();
    c.fillStyle=ink;rr(c,172,296,256,24,10);c.fill();
    path(c,[[452,238],[452,330]]);stroke(c,ink,12);dot(c,452,344,16);c.fillStyle=ink;c.fill();
    c.fillStyle=accent;rr(c,166,352,268,110,16);c.fill();
    path(c,[[300,352],[300,462]]);stroke(c,ink,12);
  },
  professional(c,ink,accent){
    c.fillStyle=accent;rr(c,124,228,352,228,26);c.fill();
    c.fillStyle=ink;rr(c,236,168,128,72,18);c.fill();
    c.fillStyle=accent;rr(c,262,196,76,40,10);c.fill();
    c.fillStyle=ink;rr(c,124,318,352,22,11);c.fill();rr(c,274,306,52,46,12);c.fill();
  },
  technology(c,ink,accent){
    c.strokeStyle=ink;rr(c,120,160,360,252,22);stroke(c,ink,14);
    c.fillStyle=accent;rr(c,120,160,360,54,22);c.fill();
    for(const x of[150,180,210])
      {dot(c,x,187,8);c.fillStyle=ink;c.fill();}
    path(c,[[244,270],[204,312],[244,354]]);stroke(c,accent,16);
    path(c,[[356,270],[396,312],[356,354]]);stroke(c,accent,16);
    c.fillStyle=ink;rr(c,246,432,108,18,9);c.fill();
  },
  home(c,ink,accent){
    c.fillStyle=accent;poly(c,[[300,138],[492,296],[108,296]]);c.fill();
    c.fillStyle=accent;rr(c,156,296,288,170,14);c.fill();
    c.fillStyle=ink;rr(c,262,356,76,110,10);c.fill();
    path(c,[[352,206],[398,160]]);stroke(c,ink,16);
    c.fillStyle=ink;dot(c,408,150,24);c.fill();
    c.fillStyle=accent;dot(c,408,150,10);c.fill();
  },
  construction(c,ink,accent){
    c.fillStyle=accent;
    c.beginPath();c.moveTo(130,330);c.bezierCurveTo(130,196,470,196,470,330);c.closePath();c.fill();
    c.fillStyle=ink;rr(c,108,330,384,34,17);c.fill();
    c.fillStyle=ink;rr(c,282,196,36,134,12);c.fill();
    for(let r=0;r<2;r++)for(let i=0;i<3;i++)
      {c.strokeStyle=ink;c.lineWidth=10;c.strokeRect(146+i*104+(r?52:0),392+r*54,92,44);}
  },
  realestate(c,ink,accent){
    c.fillStyle=accent;rr(c,124,196,188,270,14);c.fill();
    c.fillStyle=accent;rr(c,324,268,152,198,14);c.fill();
    c.fillStyle=ink;
    for(let r=0;r<3;r++)for(let i=0;i<2;i++){rr(c,156+i*78,230+r*76,50,46,8);c.fill();}
    for(let r=0;r<2;r++){rr(c,356+0,300+r*76,44,46,8);c.fill();rr(c,420,300+r*76,44,46,8);c.fill();}
    c.fillStyle=ink;rr(c,196,406,56,60,8);c.fill();
  },
  automotive(c,ink,accent){
    c.fillStyle=accent;
    c.beginPath();c.moveTo(108,372);c.lineTo(142,286);c.bezierCurveTo(176,232,424,232,458,286);
    c.lineTo(492,372);c.closePath();c.fill();
    c.fillStyle=ink;rr(c,92,352,416,52,26);c.fill();
    c.fillStyle=ink;dot(c,186,410,46);c.fill();dot(c,414,410,46);c.fill();
    c.fillStyle=accent;dot(c,186,410,18);c.fill();dot(c,414,410,18);c.fill();
    c.fillStyle=ink;rr(c,206,268,188,54,12);c.fill();
  },
  transport(c,ink,accent){
    c.fillStyle=accent;rr(c,96,236,244,168,14);c.fill();
    c.fillStyle=accent;poly(c,[[348,290],[438,290],[496,350],[496,404],[348,404]]);c.fill();
    c.fillStyle=ink;rr(c,86,396,428,30,15);c.fill();
    c.fillStyle=ink;dot(c,196,430,42);c.fill();dot(c,424,430,42);c.fill();
    c.fillStyle=accent;dot(c,196,430,16);c.fill();dot(c,424,430,16);c.fill();
    c.fillStyle=ink;rr(c,140,276,156,22,11);c.fill();
  },
  travel(c,ink,accent){
    c.fillStyle=accent;
    c.beginPath();c.moveTo(96,322);c.lineTo(470,214);c.lineTo(512,246);c.lineTo(286,372);c.closePath();c.fill();
    c.fillStyle=ink;poly(c,[[214,352],[150,420],[196,424],[268,374]]);c.fill();
    c.fillStyle=ink;poly(c,[[300,266],[262,186],[300,180],[360,246]]);c.fill();
    path(c,[[120,462],[480,462]]);stroke(c,ink,14);
  },
  events(c,ink,accent){
    c.fillStyle=accent;rr(c,128,250,344,196,22);c.fill();
    c.fillStyle=ink;dot(c,128,348,30);c.fill();dot(c,472,348,30);c.fill();
    c.fillStyle=ink;rr(c,290,274,20,148,10);c.fill();
    for(const [x,y] of[[170,180],[250,146],[344,158],[428,190]])
      {c.fillStyle=accent;poly(c,[[x,y-26],[x+18,y],[x,y+26],[x-18,y]]);c.fill();}
  },
  retail(c,ink,accent){
    c.fillStyle=accent;poly(c,[[150,248],[450,248],[420,468],[180,468]]);c.fill();
    c.strokeStyle=ink;c.lineWidth=16;c.beginPath();c.arc(300,248,78,Math.PI,0);c.stroke();
    c.fillStyle=ink;rr(c,140,236,320,26,13);c.fill();
    c.fillStyle=ink;poly(c,[[268,330],[378,330],[378,396],[322,430],[268,396]]);c.fill();
    c.fillStyle=accent;dot(c,323,356,13);c.fill();
  },
  finance(c,ink,accent){
    c.fillStyle=accent;
    c.beginPath();c.moveTo(300,142);c.lineTo(466,206);c.lineTo(466,318);
    c.bezierCurveTo(466,412,386,460,300,482);c.bezierCurveTo(214,460,134,412,134,318);
    c.lineTo(134,206);c.closePath();c.fill();
    c.fillStyle=ink;
    rr(c,206,322,46,96,10);c.fill();rr(c,278,274,46,144,10);c.fill();rr(c,350,228,46,190,10);c.fill();
  },
  agriculture(c,ink,accent){
    c.fillStyle=accent;dot(c,452,160,62);c.fill();
    path(c,[[300,470],[300,246]]);stroke(c,ink,16);
    c.fillStyle=accent;
    c.beginPath();c.ellipse(216,276,88,46,-0.55,0,Math.PI*2);c.fill();
    c.beginPath();c.ellipse(386,232,88,46,0.55,0,Math.PI*2);c.fill();
    c.fillStyle=ink;rr(c,140,470,320,26,13);c.fill();
  },
  pets(c,ink,accent){
    c.fillStyle=accent;
    c.beginPath();c.ellipse(300,370,110,92,0,0,Math.PI*2);c.fill();
    for(const [x,y,rx,ry,a] of[[172,246,44,58,-0.4],[256,196,42,60,-0.15],[344,196,42,60,0.15],[428,246,44,58,0.4]])
      {c.beginPath();c.ellipse(x,y,rx,ry,a,0,Math.PI*2);c.fill();}
    c.fillStyle=ink;dot(c,300,352,26);c.fill();
  },
  creative(c,ink,accent){
    c.fillStyle=accent;rr(c,112,226,376,250,26);c.fill();
    c.fillStyle=accent;rr(c,232,176,136,60,16);c.fill();
    c.fillStyle=ink;dot(c,300,350,88);c.fill();
    c.fillStyle=accent;dot(c,300,350,54);c.fill();
    c.fillStyle=ink;poly(c,[[284,322],[334,350],[284,378]]);c.fill();
    c.fillStyle=ink;dot(c,432,268,18);c.fill();
  },
  community(c,ink,accent){
    c.fillStyle=accent;dot(c,300,300,168);c.fill();
    c.fillStyle=ink;
    dot(c,228,256,38);c.fill();dot(c,372,256,38);c.fill();
    c.beginPath();c.moveTo(168,392);c.bezierCurveTo(192,310,264,310,288,392);c.closePath();c.fill();
    c.beginPath();c.moveTo(312,392);c.bezierCurveTo(336,310,408,310,432,392);c.closePath();c.fill();
  },
  lifestyle(c,ink,accent){
    c.fillStyle=accent;dot(c,300,300,164);c.fill();
    path(c,[[300,186],[300,300],[376,338]]);stroke(c,ink,18);
    c.fillStyle=ink;dot(c,300,300,20);c.fill();
    for(let i=0;i<12;i++){const a=i*Math.PI/6,r1=i%3?142:128;
      path(c,[[300+Math.cos(a)*r1,300+Math.sin(a)*r1],[300+Math.cos(a)*152,300+Math.sin(a)*152]]);stroke(c,ink,i%3?6:10);}
  },
  abstract(c,ink,accent){
    c.fillStyle=accent;rr(c,118,140,196,320,98);c.fill();
    c.globalAlpha=.45;c.fillStyle=accent;dot(c,392,344,132);c.fill();c.globalAlpha=1;
    c.strokeStyle=ink;c.lineWidth=14;c.beginPath();c.arc(392,228,96,Math.PI*0.9,Math.PI*1.9);c.stroke();
  },
  other(c,ink,accent){
    c.fillStyle=accent;rr(c,130,130,340,340,56);c.fill();
    c.fillStyle=ink;
    for(let r=0;r<3;r++)for(let i=0;i<3;i++){dot(c,206+i*94,206+r*94,i===1&&r===1?34:20);c.fill();}
  },
};

/* ---------- tatlong komposisyon ---------- */
// spotlight: isang malaking motif sa gitna, may malambot na bilog sa likod
// pattern:   inuulit na maliit na motif sa grid, may banda sa ibaba
// scene:     nakatayo ang motif sa horizon, may araw/disc sa sulok
const COMPOSITION = {
  spotlight(c,draw,p){
    c.save();c.globalAlpha=.16;c.fillStyle=p.accent;dot(c,300,300,246);c.fill();c.restore();
    c.save();c.translate(300,300);c.scale(.78,.78);c.translate(-300,-300);draw(c,p.ink,p.accent);c.restore();
  },
  pattern(c,draw,p){
    c.save();c.globalAlpha=.10;c.fillStyle=p.accent;rr(c,0,0,600,600,0);c.fill();c.restore();
    for(let r=0;r<3;r++)for(let i=0;i<3;i++){
      c.save();c.globalAlpha=(r+i)%2?.42:.9;
      c.translate(100+i*200,96+r*176);c.scale(.26,.26);c.translate(-300,-300);
      draw(c,p.ink,p.accent);c.restore();
    }
    c.save();c.globalAlpha=.22;c.fillStyle=p.ink;rr(c,0,520,600,80,0);c.fill();c.restore();
  },
  // Naka-frame na panel: may tinted na card sa likod at makapal na accent bar sa ilalim.
  scene(c,draw,p){
    c.save();c.globalAlpha=.14;c.fillStyle=p.accent;rr(c,44,44,512,512,44);c.fill();c.restore();
    c.save();c.globalAlpha=.55;c.strokeStyle=p.accent;c.lineWidth=6;rr(c,44,44,512,512,44);c.stroke();c.restore();
    c.save();c.translate(300,276);c.scale(.60,.60);c.translate(-300,-300);draw(c,p.ink,p.accent);c.restore();
    c.save();c.fillStyle=p.accent;rr(c,186,452,228,20,10);c.fill();c.restore();
    c.save();c.globalAlpha=.5;c.fillStyle=p.ink;rr(c,246,492,108,12,6);c.fill();c.restore();
  },
};
const FAMILIES=Object.freeze(['spotlight','pattern','scene']);

/* ---------- 22 kategorya ---------- */
const rows=[
  ['food','Food & Beverage','kainan restaurant cafe karinderya bakery coffee kape catering'],
  ['beauty','Beauty & Personal Care','salon spa parlor makeup nails hair kuko buhok barbero'],
  ['health','Health & Wellness','clinic dental gym fitness therapy massage kalusugan'],
  ['education','Education & Training','school tutor review seminar training paaralan guro'],
  ['professional','Professional Services','consulting legal accounting virtual assistant opisina'],
  ['technology','Technology & Digital','software it web app repair computer cellphone digital'],
  ['home','Home & Repair','aircon plumbing electrician cleaning pest repair bahay'],
  ['construction','Construction & Renovation','builder contractor renovation hardware karpintero'],
  ['realestate','Real Estate','property rental lot house condo broker bahay upa'],
  ['automotive','Automotive','car motor shop detailing carwash sakyanan mekaniko'],
  ['transport','Transport & Logistics','delivery courier trucking padala hatid cargo'],
  ['travel','Travel & Hospitality','hotel resort tours travel booking biyahe turista'],
  ['events','Events & Entertainment','party wedding birthday sound band host handaan'],
  ['retail','Retail & E-commerce','store shop online selling sari-sari tindahan ukay'],
  ['finance','Finance & Insurance','loan insurance remittance savings pera seguro'],
  ['agriculture','Agriculture & Gardening','farm plants garden halaman gulay poultry sakahan'],
  ['pets','Pets & Animal Care','vet grooming pet shop aso pusa alaga hayop'],
  ['creative','Creative & Media','photography video design printing content litrato'],
  ['community','Community & Nonprofit','church barangay charity ngo volunteer samahan'],
  ['lifestyle','Lifestyle & Personal Services','laundry errands concierge coaching tulong serbisyo'],
  ['abstract','Abstract & Minimal','simple clean plain minimal walang larawan'],
  ['other','Other / Custom','general iba custom lahat'],
];

export const VISUAL_CATEGORIES=Object.freeze(rows.map(([id,label,keywords])=>Object.freeze({
  id,label,keywords,
  visuals:Object.freeze(FAMILIES.map(family=>Object.freeze({
    id:`${id}-${family}`,category:id,family,
    label:family==='spotlight'?'Spotlight':family==='pattern'?'Pattern':'Scene',
  }))),
})));
export const VISUAL_CATEGORY_BY_ID=Object.freeze(Object.fromEntries(VISUAL_CATEGORIES.map(c=>[c.id,c])));
export const VISUAL_BY_ID=Object.freeze(Object.fromEntries(
  VISUAL_CATEGORIES.flatMap(c=>c.visuals.map(v=>[v.id,v]))));
export const VISUAL_BOX=BOX;
export function searchVisualCategories(query=''){
  const terms=String(query).normalize('NFKC').toLocaleLowerCase().trim().split(/\s+/).filter(Boolean);
  return VISUAL_CATEGORIES.filter(c=>terms.every(t=>(c.label+' '+c.keywords).toLocaleLowerCase().includes(t)));
}
// Ang tatlong lumang pangalan ay nananatiling gumagana para hindi masira ang anumang
// naunang pinili. Tumuturo sila sa pinakamalapit na bagong visual.
export const LEGACY_VISUALS=Object.freeze({
  abstract:'abstract-spotlight', workspace:'technology-spotlight', botanical:'agriculture-spotlight',
});
export function resolveVisual(id){
  if(!id||id==='photo')return null;
  return VISUAL_BY_ID[id]?id:(LEGACY_VISUALS[id]||null);
}
export function isVisualId(id){return !!resolveVisual(id);}

// Iginuguhit ang napiling visual sa isang 600x600 na logical box. Ito rin ang ginagamit ng
// mga thumbnail, kaya ang nakikita sa pagpili ay siya ring lalabas sa banner at sa PNG.
export function drawVisual(ctx,id,p){
  const v=VISUAL_BY_ID[resolveVisual(id)];
  if(!v)return false;
  const draw=MOTIF[v.category]||MOTIF.other,compose=COMPOSITION[v.family]||COMPOSITION.spotlight;
  ctx.save();
  compose(ctx,draw,{ink:p.ink,accent:p.accent});
  ctx.restore();
  return true;
}
