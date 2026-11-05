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
const families = ['spotlight','editorial','showcase'];
const titles = {
 food:['Menu spotlight','Cafe editorial','Product showcase'], beauty:['Beauty spotlight','Beauty editorial','Care showcase'],
 fashion:['Collection spotlight','Fashion editorial','Collection showcase'], luxury:['Signature spotlight','Luxury editorial','Gallery showcase'],
 property:['Property spotlight','Property editorial','Listing showcase'], services:['Service spotlight','Professional editorial','Service showcase'],
};
// Geometry profiles reuse the same text/photo primitives; categories select real arrangements.
const compositionByCategory = Object.freeze({
 food: ['split-left','menu-band','stack-photo'],
 ecommerce: ['split-right','stack-photo','stack-copy'],
 luxury: ['inset-gallery','split-right','type-led'],
 beauty: ['split-left','stack-photo','inset-gallery'],
 services: ['split-left','service-header','stack-copy'],
});
const genericCompositions=['stack-photo','split-right','inset-gallery'];
export const CATEGORIES = Object.freeze(rows.map(([id,label,keywords,ink,paper]) => Object.freeze({
 id,label,keywords,ink,paper,presets:Object.freeze(families.map((family,i)=>Object.freeze({id:`${id}-${family}`,category:id,family,composition:(compositionByCategory[id]||genericCompositions)[i],label:(titles[id]||['Product spotlight','Brand editorial','Clean showcase'])[i]})))
})));
export const STYLES = Object.freeze([
 {id:'category',label:'Recommended palette'}, {id:'brand',label:'My selected color'}, {id:'minimal',label:'Minimal & Clean'},
 {id:'luxury',label:'Luxury & Refined'}, {id:'bold',label:'Bold Typography'}, {id:'tropical',label:'Natural & Tropical'},
].map(Object.freeze));
export const CATEGORY_BY_ID = Object.freeze(Object.fromEntries(CATEGORIES.map(c=>[c.id,c])));
export const PRESET_BY_ID = Object.freeze(Object.fromEntries(CATEGORIES.flatMap(c=>c.presets.map(p=>[p.id,p]))));
export function searchCategories(query='') {
 const terms=String(query).normalize('NFKC').toLocaleLowerCase().trim().split(/\s+/).filter(Boolean);
 return CATEGORIES.filter(c=>terms.every(t=>(c.label+' '+c.keywords).toLocaleLowerCase().includes(t)));
}
export function palette(category,style,theme) {
 const c=CATEGORY_BY_ID[category]||CATEGORY_BY_ID.other;
 if(style==='brand')return {paper:theme.bg[0],ink:theme.text.ink,muted:theme.text.sub,accent:theme.pill.bg,buttonInk:theme.pill.ink};
 if(style==='luxury')return {paper:'#19191E',ink:'#F5F0E5',muted:'#E0D9C8',accent:'#C9B47D',buttonInk:'#242128'};
 if(style==='bold')return {paper:'#30256E',ink:'#FFFFFF',muted:'#E5DFF7',accent:'#DDD0F5',buttonInk:'#30256E'};
 if(style==='tropical')return {paper:'#EBF1E5',ink:'#213F34',muted:'#39584B',accent:'#284E3B',buttonInk:'#FFFFFF'};
 return {paper:style==='minimal'?'#FAFAF8':c.paper,ink:c.ink,muted:c.ink,accent:c.ink,buttonInk:'#FFFFFF'};
}
