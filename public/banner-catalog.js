// Local, extensible business taxonomy. No provider, storage or network dependencies.
const rows = [
 ['ecommerce','E-commerce','online shop marketplace gifts accessories handmade dropshipping retail tindahan regalo', '#233148','#EEF2F8'],
 ['food','Food & Drinks','burger bakery cafe restaurant catering coffee milk tea dessert pagkain tinapay inumin', '#592D21','#FFF2DF'],
 ['beauty','Beauty & Personal Care','skincare cosmetics salon makeup spa hair nails perfume sabon', '#503043','#FAEDF1'],
 ['fashion','Fashion & Apparel','clothing shoes bags jewelry streetwear tailoring damit sapatos', '#30363D','#F1EFE9'],
 ['luxury','Luxury & Collectibles','watches designer fine jewelry art premium collectibles relo', '#25252C','#EAE2CF'],
 ['electronics','Electronics & Technology','phones computers gadgets appliances repair software cellphone laptop', '#153B51','#EAF5FA'],
 ['home','Home & Living','furniture decor kitchen lighting cleaning furnishings bahay kusina', '#3B453A','#F1F3E9'],
 ['services','Professional & Local Services','photography consultancy cleaning laundry salon design freelance legal accounting serbisyo', '#2E4262','#EEF1FA'],
 ['property','Property & Real Estate','house condo land rental office commercial apartment bahay lupa paupahan', '#263E38','#EEF1E8'],
 ['fitness','Fitness & Wellness','gym training sports yoga coaching equipment supplements exercise ehersisyo', '#23413C','#E6F4EE'],
 ['education','Education & Training','school courses tutoring books workshops learning lessons tutorial aral', '#3A3965','#F1EFFA'],
 ['travel','Travel & Hospitality','hotel resort tours transport accommodation tourism beach bakasyon biyahe', '#15464B','#E7F4F2'],
 ['automotive','Automotive & Transport','cars motorcycles parts detailing carwash mechanics rental kotse motor', '#323A47','#EDF0F4'],
 ['agriculture','Agriculture & Farming','seeds farm produce equipment livestock gardening fertilizer ani binhi', '#34482C','#F2F3E5'],
 ['pets','Pets & Animal Care','pet supplies grooming food veterinary accessories aso pusa alaga', '#47416A','#F3EFF9'],
 ['events','Events & Celebrations','wedding birthday catering flowers venue party printing kasal handaan', '#5D3547','#FAF0F2'],
 ['grocery','Grocery & Essentials','supermarket sari sari store staples vegetables fruit frozen goods bigas gulay', '#3D482E','#F6F3E7'],
 ['b2b','B2B & Industrial','wholesale manufacturing logistics supplies equipment printing distribution negosyo', '#26384B','#EDF1F6'],
 ['digital','Digital Products & Software','apps templates ebooks websites SaaS digital downloads online tools', '#393565','#F0EFF9'],
 ['arts','Arts & Handmade','craft art design pottery crochet custom gifts handicrafts sining gawang kamay', '#584339','#F9F1E8'],
 ['other','Other / Custom Business','custom business other iba pang negosyo', '#30256E','#F5F2FC'],
];
// The eight arrangements the canvas can actually draw. Each name states where the
// photo and the copy go, so no name claims a difference the renderer does not make.
// copyFirst marks the layouts that put the copy above the photo; the renderer uses
// it to choose a side when a narrow photo forces a split.
const layoutRows = [
 ['split-left',     'Split feature',  'Photo left, copy right',             false],
 ['menu-band',      'Menu split',     'Photo left, copy right, accent rule', false],
 ['split-right',    'Split reverse',  'Photo right, copy left',             false],
 ['stack-photo',    'Photo header',   'Photo on top, copy below',           false],
 ['service-header', 'Slim banner',    'Narrow photo on top, copy below',    false],
 ['stack-copy',     'Copy first',     'Copy on top, photo below',           true ],
 ['type-led',       'Copy first, ruled','Copy on top, photo below, accent rule', true ],
 ['inset-gallery',  'Inset gallery',  'Copy on top, framed photo below',    true ],
];
export const LAYOUTS = Object.freeze(layoutRows.map(([id,label,detail,copyFirst]) =>
 Object.freeze({id,label,detail,copyFirst})));
export const LAYOUT_BY_ID = Object.freeze(Object.fromEntries(LAYOUTS.map(l=>[l.id,l])));
// Three layouts chosen for each category because they suit what that business shows,
// not because every category needed three. Every one of the eight is recommended
// somewhere, so nothing in the catalogue is unreachable from a category.
const recommended = Object.freeze({
 ecommerce:   ['split-right','stack-photo','inset-gallery'],
 food:        ['menu-band','split-left','stack-photo'],
 beauty:      ['split-left','inset-gallery','stack-photo'],
 fashion:     ['split-right','inset-gallery','type-led'],
 luxury:      ['inset-gallery','type-led','split-right'],
 electronics: ['split-right','stack-photo','stack-copy'],
 home:        ['stack-photo','split-left','inset-gallery'],
 services:    ['service-header','stack-copy','split-left'],
 property:    ['stack-photo','split-left','inset-gallery'],
 fitness:     ['split-left','stack-photo','type-led'],
 education:   ['service-header','stack-copy','split-right'],
 travel:      ['stack-photo','inset-gallery','split-right'],
 automotive:  ['stack-photo','split-right','split-left'],
 agriculture: ['split-left','stack-photo','stack-copy'],
 pets:        ['split-left','inset-gallery','stack-photo'],
 events:      ['inset-gallery','type-led','stack-copy'],
 grocery:     ['menu-band','split-left','stack-photo'],
 b2b:         ['service-header','stack-copy','split-right'],
 digital:     ['type-led','service-header','stack-copy'],
 arts:        ['inset-gallery','split-left','stack-photo'],
 other:       ['stack-photo','split-right','inset-gallery'],
});
export const CATEGORIES = Object.freeze(rows.map(([id,label,keywords,ink,paper]) => Object.freeze({
 id,label,keywords,ink,paper,layouts:Object.freeze(recommended[id].slice())
})));
export const CATEGORY_BY_ID = Object.freeze(Object.fromEntries(CATEGORIES.map(c=>[c.id,c])));
// Inspect decoded alpha once, not a thumbnail: a small transparent edge matters.
// Unknown data must never be represented as a verified cutout.
export function photoTransparency(rgba) {
 if(!rgba||!rgba.length||rgba.length%4)return 'unknown';
 for(let i=3;i<rgba.length;i+=4)if(rgba[i]<255)return 'transparent';
 return 'opaque';
}
// One family, the existing eight arrangements. This ranks suggestions only;
// selection, validation and confirmation remain owned by the Studio controller.
export function recommendCommercial({category,adType,photo,format='square',textLength=0,fitEvidence={}}={}) {
 if(!photo||!(photo.width>0&&photo.height>0))return null;
 const c=CATEGORY_BY_ID[category]||CATEGORY_BY_ID.other,aspect=photo.width/photo.height;
 const ranked=LAYOUTS.map((layout,index)=>{
  const id=layout.id,place=c.layouts.indexOf(id),split=id.startsWith('split')||id==='menu-band';
  let score=place<0?0:30-place*4;
  if(aspect<1.2&&split)score+=32;
  if(aspect>=1.2&&['stack-photo','inset-gallery'].includes(id))score+=24;
  if(photo.transparency==='transparent'&&(split||id==='inset-gallery'))score+=10;
  if(adType==='service'&&id==='service-header'&&aspect>=1.2)score+=20;
  if(adType==='digital'&&id==='type-led')score+=16;
  if(adType==='promo'&&id==='stack-copy')score+=12;
  if(textLength>105&&['stack-copy','type-led','service-header'].includes(id))score+=28;
  if(format==='story'&&['stack-photo','stack-copy'].includes(id))score+=8;
  if(fitEvidence[id]?.fits===false)score-=200;
  else if(fitEvidence[id]?.fits===true)score+=4;
  return {layout:id,score,index};
 }).sort((a,b)=>b.score-a.score||a.index-b.index);
 return Object.freeze({family:'commercial-stage-v1',layout:ranked[0].layout,category:c.id});
}
// The three names the catalogue used when a preset was a category-and-family pair.
// They still resolve, to the layout at the same position in that category's three.
const LEGACY_FAMILY = Object.freeze({spotlight:0,editorial:1,showcase:2});
export const presetId = (category,layout) => `${category}-${layout}`;
// A preset is a category (which picks the palette) and a layout (which picks the
// arrangement). Nothing else was ever stored in the id.
export function resolvePreset(id) {
 const raw=String(id||''),cut=raw.indexOf('-');
 if(cut<1)return null;
 const category=raw.slice(0,cut),rest=raw.slice(cut+1),c=CATEGORY_BY_ID[category];
 if(!c)return null;
 const layout=LAYOUT_BY_ID[rest]?rest:(rest in LEGACY_FAMILY?c.layouts[LEGACY_FAMILY[rest]]:null);
 if(!layout)return null;
 const l=LAYOUT_BY_ID[layout];
 return Object.freeze({id:presetId(category,layout),category,layout,composition:layout,
  label:l.label,detail:l.detail,copyFirst:l.copyFirst,recommended:c.layouts.includes(layout)});
}
export const STYLES = Object.freeze([
 {id:'category',label:'Category palette'}, {id:'brand',label:'Your theme colour'}, {id:'minimal',label:'Minimal — off-white'},
 {id:'luxury',label:'Refined — dark and gold'}, {id:'bold',label:'Bold — deep violet'}, {id:'tropical',label:'Natural — green'},
].map(Object.freeze));
export function palette(category,style,theme) {
 const c=CATEGORY_BY_ID[category]||CATEGORY_BY_ID.other;
 if(style==='brand')return {paper:theme.bg[0],ink:theme.text.ink,muted:theme.text.sub,accent:theme.pill.bg,buttonInk:theme.pill.ink};
 if(style==='luxury')return {paper:'#19191E',ink:'#F5F0E5',muted:'#E0D9C8',accent:'#C9B47D',buttonInk:'#242128'};
 if(style==='bold')return {paper:'#30256E',ink:'#FFFFFF',muted:'#E5DFF7',accent:'#DDD0F5',buttonInk:'#30256E'};
 if(style==='tropical')return {paper:'#EBF1E5',ink:'#213F34',muted:'#39584B',accent:'#284E3B',buttonInk:'#FFFFFF'};
 return {paper:style==='minimal'?'#FAFAF8':c.paper,ink:c.ink,muted:c.ink,accent:c.ink,buttonInk:'#FFFFFF'};
}
