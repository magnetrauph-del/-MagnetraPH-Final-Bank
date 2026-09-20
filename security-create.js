// security-create.js V2 Final Sealed 20 Years - No Emoji - MagnetraPH - Create Only
(function(){
"use strict";
var CFG={FAIL_PREFIX:"mp_fail_create_",LOCK_PREFIX:"mp_lock_create_",GFAIL:"mp_g_fail_create",GLOCK:"mp_g_lock_create",DEVICE:"mp_device_id_create",HP_ID:"hp_email_create",MAX_GLOBAL:10,GLOCK_TIME:15*60*1000,LOCK_3:30*1000,LOCK_4:60*1000,LOCK_5:2*60*1000,LOCK_6:60*60*1000,DELAY:800,SEALED:true};
Object.freeze(CFG);
function getDeviceId(){
try{
var id=localStorage.getItem(CFG.DEVICE);
if(id) return id;
var raw=(navigator.userAgent||"")+"|"+(screen.width||0)+"x"+(screen.height||0)+"|"+(navigator.language||"")+"|"+(Intl.DateTimeFormat().resolvedOptions().timeZone||"")+"|"+(navigator.hardwareConcurrency||0);
var h=0;for(var i=0;i<raw.length;i++){h=((h<<5)-h)+raw.charCodeAt(i);h=h&h;}
id="dev_create_"+Math.abs(h).toString(36)+"_"+Date.now().toString(36)+"_"+Math.random().toString(36).slice(2,6);
localStorage.setItem(CFG.DEVICE,id);
Object.defineProperty(localStorage,CFG.DEVICE,{writable:false,configurable:false});
return id;
}catch(e){return "dev_create_unknown";}
}
function isBot(){
try{
var hp=document.getElementById(CFG.HP_ID);
if(!hp) return false;
if(hp.value.trim()!=="") return true;
if(hp.offsetParent!==null) return true;
return false;
}catch(e){return false;}
}
function canAttempt(email){
try{
var now=Date.now();
var gLock=parseInt(localStorage.getItem(CFG.GLOCK)||"0",10);
if(now<gLock){var sec=Math.ceil((gLock-now)/1000);return {ok:false,msg:"Too many attempts. Try again in "+sec+"s"};}
if(!email) return {ok:true};
var lockKey=CFG.LOCK_PREFIX+email;
var lock=parseInt(localStorage.getItem(lockKey)||"0",10);
if(now<lock){var s=Math.ceil((lock-now)/1000);return {ok:false,msg:"Account locked. Try again in "+s+"s"};}
return {ok:true};
}catch(e){return {ok:true};}
}
function addFail(email){
try{
var now=Date.now();
var gf=parseInt(localStorage.getItem(CFG.GFAIL)||"0",10)+1;
localStorage.setItem(CFG.GFAIL,gf.toString());
if(gf>=CFG.MAX_GLOBAL){localStorage.setItem(CFG.GLOCK,(now+CFG.GLOCK_TIME).toString());}
if(email){
var k1=CFG.FAIL_PREFIX+email;var k2=CFG.LOCK_PREFIX+email;
var c=parseInt(localStorage.getItem(k1)||"0",10)+1;
localStorage.setItem(k1,c.toString());
if(c===3){localStorage.setItem(k2,(now+CFG.LOCK_3).toString());}
else if(c===4){localStorage.setItem(k2,(now+CFG.LOCK_4).toString());}
else if(c===5){localStorage.setItem(k2,(now+CFG.LOCK_5).toString());}
else if(c>=6){localStorage.setItem(k2,(now+CFG.LOCK_6).toString());}
}
}catch(e){}
}
function clearFail(email){
try{
if(email){localStorage.setItem(CFG.FAIL_PREFIX+email,"0");localStorage.setItem(CFG.LOCK_PREFIX+email,"0");}
localStorage.setItem(CFG.GFAIL,"0");localStorage.setItem(CFG.GLOCK,"0");
}catch(e){}
}
function constantDelay(start){var elapsed=Date.now()-start;var remain=CFG.DELAY-elapsed;return remain>0?remain:0;}
function sealAPI(){
try{
var api={getDeviceId:getDeviceId,isBot:isBot,canAttempt:canAttempt,addFail:addFail,clearFail:clearFail,constantDelay:constantDelay,CFG:CFG};
Object.freeze(api);Object.freeze(api.CFG);
Object.defineProperty(window,"CreateSecurity",{value:api,writable:false,configurable:false});
Object.freeze(window.CreateSecurity);
}catch(e){}
}
sealAPI();
})();
