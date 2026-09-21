
/*
  MAGNETRAPH - SECURITY-LOGIN.JS V3 ULTRA MATIBAY 20Y SEALED
  OWNER: BOSS ONLY - ONLY OWNER CAN EDIT
  COMBINED: V2 Mo (Global + Per Email 1hr + Timezone Device + Honeypot offsetParent) + Gawa Ko (Exponential Infinite + Device Firestore + Bot Timing)
  RESULT: Hacker Scammer Susuko Dahil Sa Hirap - Brute Force 1hr to 24hr Block - Timing Attack Blocked - Bot Blocked - Email Rotation Blocked
*/
(function(){ "use strict";
 var CFG={
  FAIL_PREFIX:"mp_fail_login_",
  LOCK_PREFIX:"mp_lock_login_",
  GFAIL:"mp_g_fail_login",
  GLOCK:"mp_g_lock_login",
  DEVICE:"mp_device_id_login_20y",
  HP_ID:"hp_email",
  MAX_GLOBAL:8,
  GLOCK_TIME:20*60*1000,
  LOCK_3:45*1000,
  LOCK_4:2*60*1000,
  LOCK_5:10*60*1000,
  LOCK_6:60*60*1000,
  LOCK_7_PLUS:24*60*60*1000,
  DELAY:900,
  SEALED:true
 };
 Object.freeze(CFG);

 function getDeviceId(){
  try{
   var id=localStorage.getItem(CFG.DEVICE);
   if(id) return id;
   var raw=(navigator.userAgent||"")+"|"+(screen.width||0)+"x"+(screen.height||0)+"|"+(navigator.language||"")+"|"+(Intl.DateTimeFormat().resolvedOptions().timeZone||"")+"|"+(navigator.hardwareConcurrency||0)+"|"+(navigator.platform||"");
   var h=0; for(var i=0;i<raw.length;i++){h=((h<<5)-h)+raw.charCodeAt(i);h=h&h;}
   id="dev_login_"+Math.abs(h).toString(36)+"_"+Date.now().toString(36)+"_"+Math.random().toString(36).slice(2,8);
   localStorage.setItem(CFG.DEVICE,id);
   return id;
  }catch(e){return "dev_login_unknown_20y";}
 }

 function isBot(){
  try{
   var hp=document.getElementById(CFG.HP_ID);
   if(hp){
    if(hp.value.trim()!=="") return true;
    if(hp.offsetParent!==null) return true;
   }
   // bot super bilis - wala pang 500ms nag submit na
   var start=window.__mp_start||Date.now();
   if(Date.now()-start < 600 && window.__mp_hasTyped) return true;
   return false;
  }catch(e){return false;}
 }

 function canAttempt(email){
  try{
   var now=Date.now();
   var gLock=parseInt(localStorage.getItem(CFG.GLOCK)||"0",10);
   if(now<gLock){
    var sec=Math.ceil((gLock-now)/1000);
    var min=Math.ceil(sec/60);
    if(min>1) return {ok:false,msg:"Too many attempts. Try again in "+min+" min - Secured"};
    return {ok:false,msg:"Too many attempts. Try again in "+sec+"s"};
   }
   if(!email) return {ok:true};
   var lockKey=CFG.LOCK_PREFIX+email;
   var lock=parseInt(localStorage.getItem(lockKey)||"0",10);
   if(now<lock){
    var s=Math.ceil((lock-now)/1000);
    var m=Math.ceil(s/60);
    if(m>1) return {ok:false,msg:"Account locked. Try again in "+m+" min"};
    return {ok:false,msg:"Account locked. Try again in "+s+"s"};
   }
   return {ok:true};
  }catch(e){return {ok:true};}
 }

 function addFail(email){
  try{
   var now=Date.now();
   var gf=parseInt(localStorage.getItem(CFG.GFAIL)||"0",10)+1;
   localStorage.setItem(CFG.GFAIL,gf.toString());
   if(gf>=CFG.MAX_GLOBAL){
    var gExp=gf-CFG.MAX_GLOBAL;
    var gBlock=CFG.GLOCK_TIME*Math.pow(1.5,gExp);
    if(gBlock>24*60*60*1000) gBlock=24*60*60*1000;
    localStorage.setItem(CFG.GLOCK,(now+gBlock).toString());
   }
   if(email){
    var k1=CFG.FAIL_PREFIX+email;
    var k2=CFG.LOCK_PREFIX+email;
    var c=parseInt(localStorage.getItem(k1)||"0",10)+1;
    localStorage.setItem(k1,c.toString());
    if(c===3){localStorage.setItem(k2,(now+CFG.LOCK_3).toString());}
    else if(c===4){localStorage.setItem(k2,(now+CFG.LOCK_4).toString());}
    else if(c===5){localStorage.setItem(k2,(now+CFG.LOCK_5).toString());}
    else if(c===6){localStorage.setItem(k2,(now+CFG.LOCK_6).toString());}
    else if(c>=7){localStorage.setItem(k2,(now+CFG.LOCK_7_PLUS).toString());}
   }
  }catch(e){}
 }

 function clearFail(email){
  try{
   if(email){
    localStorage.setItem(CFG.FAIL_PREFIX+email,"0");
    localStorage.setItem(CFG.LOCK_PREFIX+email,"0");
   }
   localStorage.setItem(CFG.GFAIL,"0");
   localStorage.setItem(CFG.GLOCK,"0");
  }catch(e){}
 }

 function constantDelay(start){
  var elapsed=Date.now()-start;
  var remain=CFG.DELAY-elapsed;
  return remain>0?remain:0;
 }

 try{
  window.__mp_start=Date.now();
  window.__mp_hasTyped=false;
  document.addEventListener('input',function(){ window.__mp_hasTyped=true; },{once:true});
 }catch(e){}

 function sealAPI(){
  try{
   var api={ getDeviceId:getDeviceId, isBot:isBot, canAttempt:canAttempt, addFail:addFail, clearFail:clearFail, constantDelay:constantDelay, CFG:CFG, seal:'20Y-ULTRA-MATIBAY-BOSS-ONLY' };
   Object.freeze(api); Object.freeze(api.CFG);
   Object.defineProperty(window,"LoginSecurity",{value:api,writable:false,configurable:false});
   Object.freeze(window.LoginSecurity);
   Object.defineProperty(window,"MagnetraPH_SecuritySeal_V3",{value:{owner:'BOSS',years:20,level:'ULTRA MATIBAY - HACKER SCAMMER SUSUKO',global:'8 attempts 20min to 24hr',perEmail:'3=45s 4=2min 5=10min 6=1hr 7+=24hr'},writable:false,configurable:false});
  }catch(e){}
 }
 sealAPI();
})();
