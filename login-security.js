// login-security.js - Login Security Only - MagnetraPH - By Order Malinis - No Emoji - Sealed
(function(){
var LS_KEY_FAIL="mp_fail";
var LS_KEY_LOCK="mp_lock";
var LS_KEY_DEVICE="mp_device_id";
var LS_KEY_GLOBAL="mp_global_fail";
var LS_KEY_GLOBAL_LOCK="mp_global_lock";
var MAX_PER_EMAIL=3;
var MAX_PER_DEVICE=10;
var WINDOW_MS=15*60*1000;

function getDeviceId(){
try{
var id=localStorage.getItem(LS_KEY_DEVICE);
if(id) return id;
var nav=navigator.userAgent||"";
var scr=(screen.width||0)+"x"+(screen.height||0);
var tz=Intl.DateTimeFormat().resolvedOptions().timeZone||"";
var lang=navigator.language||"";
var canvas=""; try{ var c=document.createElement('canvas'); var ctx=c.getContext('2d'); ctx.textBaseline="top"; ctx.font="14px Arial"; ctx.fillText(nav+scr,2,2); canvas=c.toDataURL().slice(-50); }catch(_){}
var raw=nav+"|"+scr+"|"+tz+"|"+lang+"|"+canvas;
var hash=0; for(var i=0;i<raw.length;i++){ var ch=raw.charCodeAt(i); hash=((hash<<5)-hash)+ch; hash=hash&hash; }
id="dev_"+Math.abs(hash).toString(16)+"_"+Date.now().toString(16);
localStorage.setItem(LS_KEY_DEVICE,id);
return id;
}catch(_){ return "dev_unknown"; }
}

function getFailData(){
try{
var data=JSON.parse(localStorage.getItem("mp_fail_data")||"{}");
return data;
}catch(_){ return {}; }
}
function setFailData(d){ try{ localStorage.setItem("mp_fail_data",JSON.stringify(d)); }catch(_){} }

function canAttempt(email){
var now=Date.now();
var e=(email||"").toLowerCase().trim();
var data=getFailData();
var dev=getDeviceId();

// check global device lock
var gLock=parseInt(localStorage.getItem(LS_KEY_GLOBAL_LOCK)||"0");
if(now<gLock){
var sec=Math.ceil((gLock-now)/1000);
return {ok:false, msg:"Too many attempts on this device. Try again in "+sec+"s"};
}

// check email lock
if(e && data[e]){
var rec=data[e];
if(rec.lockUntil && now<rec.lockUntil){
var s=Math.ceil((rec.lockUntil-now)/1000);
return {ok:false, msg:"Too many attempts. Try again in "+s+"s"};
}
if(rec.count>=MAX_PER_EMAIL && rec.firstFail && (now-rec.firstFail)<WINDOW_MS){
// exponential backoff based on count
var extra=Math.pow(2, rec.count-MAX_PER_EMAIL);
var lockMs=30000*extra;
if(lockMs>3600000) lockMs=3600000;
if(!rec.lockUntil || rec.lockUntil<now){
rec.lockUntil=now+lockMs;
setFailData(data);
}
var s2=Math.ceil((rec.lockUntil-now)/1000);
return {ok:false, msg:"Too many attempts. Try again in "+s2+"s"};
}
}

// check device count
var globalFail=parseInt(localStorage.getItem(LS_KEY_GLOBAL)||"0");
var globalFirst=parseInt(localStorage.getItem("mp_global_first")||"0");
if(globalFirst && (now-globalFirst)<WINDOW_MS && globalFail>=MAX_PER_DEVICE){
return {ok:false, msg:"Device temporarily blocked. Try again later."};
}
return {ok:true};
}

function addFail(email){
var now=Date.now();
var e=(email||"").toLowerCase().trim();
var data=getFailData();
if(!data[e]) data[e]={count:0, firstFail:now, lockUntil:0};
data[e].count++;
if(!data[e].firstFail) data[e].firstFail=now;
// reset window if old
if((now-data[e].firstFail)>WINDOW_MS){ data[e].count=1; data[e].firstFail=now; data[e].lockUntil=0; }
// lock logic
if(data[e].count>=MAX_PER_EMAIL){
var extra=Math.pow(2, data[e].count-MAX_PER_EMAIL);
var lockMs=30000*extra;
if(lockMs>3600000) lockMs=3600000;
data[e].lockUntil=now+lockMs;
}
setFailData(data);

// global
var gf=parseInt(localStorage.getItem(LS_KEY_GLOBAL)||"0")+1;
localStorage.setItem(LS_KEY_GLOBAL, gf.toString());
var gfFirst=parseInt(localStorage.getItem("mp_global_first")||"0");
if(!gfFirst){ localStorage.setItem("mp_global_first", now.toString()); }
if((now-gfFirst)>WINDOW_MS){ localStorage.setItem(LS_KEY_GLOBAL,"1"); localStorage.setItem("mp_global_first", now.toString()); }
if(gf>=MAX_PER_DEVICE){
localStorage.setItem(LS_KEY_GLOBAL_LOCK,(now+15*60*1000).toString());
}
}

function clearFail(email){
var e=(email||"").toLowerCase().trim();
var data=getFailData();
if(data[e]){ delete data[e]; setFailData(data); }
}

function constantDelay(start){
var elapsed=Date.now()-start;
var min=800;
if(elapsed<min){ return min-elapsed; }
return 0;
}

function isBot(){
try{
var hp=document.getElementById('hp_email');
if(hp && hp.value.trim()!=="") return true;
return false;
}catch(_){ return false; }
}

window.LoginSecurity={
getDeviceId: getDeviceId,
canAttempt: canAttempt,
addFail: addFail,
clearFail: clearFail,
constantDelay: constantDelay,
isBot: isBot
};
})();
