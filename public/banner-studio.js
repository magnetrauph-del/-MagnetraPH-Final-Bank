// Local-only brief logic. Checks are advisory keyword rules, not comprehensive moderation.
export const STUDIO_LIMITS=Object.freeze({product:40,offer:64,cta:40,badge:24});
export function contentCheck(values) {
 const text=Object.values(values).filter(v=>typeof v==='string').join(' ').normalize('NFKC').replace(/[\u200B-\u200D\uFEFF]/g,'').replace(/\s+/g,' ').toLowerCase();
 const illegal=/\b(?:shabu|methamphetamine|cocaine|heroin|fentanyl|illegal drugs|droga|counterfeit money|fake currency|fake id|stolen credit cards?|child pornography|sexual services for minors)\b/;
 const fraud=/\b(?:guaranteed (?:sales|income|profit|returns)|risk[ -]?free investment|double your money|100% cure|cures? cancer|fake testimonials?|pekeng testimonial|garantisadong (?:kita|benta)|siguradong kita|no risk guaranteed)\b/;
 const unsafe=/\b(?:buy (?:an? )?(?:unlicensed gun|unregistered firearm)|suicide instructions|make a bomb|child sexual|sexual exploitation)\b/;
 if(illegal.test(text))return {blocked:true,reason:'blockedIllegal'};
 if(fraud.test(text))return {blocked:true,reason:'blockedClaims'};
 if(unsafe.test(text))return {blocked:true,reason:'blockedUnsafe'};
 return {blocked:false,reason:null};
}
export function marketingPackage(v,lang='en') {
 const strings=lang==='en'?{offer:'Offer',price:'Price'}:lang==='tl'?{offer:'Alok',price:'Presyo'}:{offer:'Offer',price:'Price'};
 const label=typeof v.product==='string'?v.product.trim():'';
 const tags=[...new Set((label.match(/[\p{L}\p{N}]+/gu)||[]).filter(w=>w.length>1))].slice(0,5).map(w=>'#'+w).join(' ');
 return {hook:v.headline||'',caption:[label,v.headline,v.detail,v.offer?`${strings.offer}: ${v.offer}`:'',v.price?`${strings.price}: ${v.price}`:'',v.business,v.contact].filter(Boolean).join('\n'),cta:v.cta||'',hashtags:tags};
}
// Bounded sample statistics cannot identify a product or read its packaging.
export function assessPhoto(data,width,height,originalWidth=width,originalHeight=height) {
 const gray=new Float32Array(width*height);let sum=0,sq=0,clipped=0;
 for(let i=0;i<gray.length;i++){const n=.2126*data[i*4]+.7152*data[i*4+1]+.0722*data[i*4+2];gray[i]=n;sum+=n;sq+=n*n;if(n<8||n>247)clipped++;}
 let lap=0,lap2=0,count=0;
 for(let y=1;y<height-1;y++)for(let x=1;x<width-1;x++){const i=y*width+x,n=4*gray[i]-gray[i-1]-gray[i+1]-gray[i-width]-gray[i+width];lap+=n;lap2+=n*n;count++;}
 const mean=sum/gray.length,contrast=Math.sqrt(Math.max(0,sq/gray.length-mean*mean)),sharpness=count?Math.max(0,lap2/count-(lap/count)**2):0;
 const warnings=[];if(Math.min(originalWidth,originalHeight)<600)warnings.push('qualitySmall');if(mean<45||mean>220||clipped/gray.length>.55)warnings.push('qualityExposure');if(sharpness<40)warnings.push('qualitySoft');
 return {mean,contrast,sharpness,warnings,originalWidth,originalHeight};
}
// Best-effort pre-decode dimension checks in a bounded header, followed by decoded-size checks.
export function imageDimensions(b) {
 const u16=i=>(b[i]<<8)|b[i+1],u32=i=>(b[i]*16777216+b[i+1]*65536+b[i+2]*256+b[i+3]);
 if(b.length>=24&&b[0]===137&&b[1]===80)return {width:u32(16),height:u32(20)};
 if(b[0]===255&&b[1]===216){let i=2;while(i+9<b.length){if(b[i]!==255){i++;continue;}const tag=b[i+1];if(tag===218||tag===217)break;const n=u16(i+2);if(n<2)break;if([192,193,194,195,197,198,199,201,202,203,205,206,207].includes(tag))return {width:u16(i+7),height:u16(i+5)};i+=n+2;}}
 if(b.length>=30&&String.fromCharCode(...b.slice(12,16))==='VP8X')return {width:1+b[24]+b[25]*256+b[26]*65536,height:1+b[27]+b[28]*256+b[29]*65536};
 return null;
}
