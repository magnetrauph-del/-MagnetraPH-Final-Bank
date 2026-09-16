// input.js - UTAK - SEALED + DEVICE CHECK - SAFE & SMOOTH - FIXED V4
(()=>{"use strict";
const SEAL="m9x7p2-utak-v4";
try{localStorage.setItem("_mph_s",SEAL);}catch(e){}
const R=(s)=>{if(typeof s!=="string")return"";return s.replace(/[<>"'`;\\]/g,"").replace(/on\w+\s*=/gi,"").replace(/javascript\s*:/gi,"").trim().slice(0,500);};
const E=(e)=>/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(String(e).trim());
const P=(p)=>typeof p==="string"&&p.length>=8&&/[A-Z]/.test(p)&&/[0-9]/.test(p);
const A=(a)=>{let n=parseFloat(a);return Number.isFinite(n)&&n>0&&n<=1000000;};
const L=()=>{try{let t=parseInt(localStorage.getItem("_mph_t")||"0"),c=parseInt(localStorage.getItem("_mph_c")||"0"),now=Date.now();if(now-t>60000){c=0;t=now;}c++;localStorage.setItem("_mph_c",c);localStorage.setItem("_mph_t",t);return c<=5;}catch(e){return true;}};
const D=()=>{try{let d=localStorage.getItem("did");if(!d){d=(self.crypto&&crypto.randomUUID)?crypto.randomUUID():'did-'+Date.now()+'-'+Math.random().toString(36).slice(2,10);localStorage.setItem("did",d);}return d;}catch(e){return 'did-'+Date.now();}};
// C = CHECK DEVICE - safe at smooth - 5ms lang
const C=()=>{try{let ua=navigator.userAgent.toLowerCase();let isEmu=/emulator|bluestacks|ldplayer|nox|memu|genymotion|android sdk/.test(ua);if(isEmu)return{ok:false,reason:"EMULATOR DETECTED - Bawal sa emulator boss - tunay na CP lang"};let isBot=navigator.webdriver===true||/headless|phantomjs|selenium/.test(ua);if(isBot)return{ok:false,reason:"BOT DETECTED"};let isOld=/android\s[1-4]\./.test(ua)||/os\s([1-9]|10|11)_/.test(ua);if(isOld)return{ok:false,reason:"Luma CP - Need Android 5+ / iOS 12+"};if(!window.localStorage||!window.fetch)return{ok:false,reason:"Hindi supported browser"};return{ok:true,device:D(),safe:true};}catch(e){return{ok:true};}};
const H={R,E,P,A,L,D,C,SEAL};Object.freeze(H);window.MPH=H;
// AUTO CHECK PAG OPEN NG APP - smooth - hindi magpapabagal
setTimeout(()=>{let r=window.MPH.C();if(!r.ok){console.warn("DEVICE BLOCK:",r.reason);}},50);
})();