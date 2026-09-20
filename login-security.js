// login-security.js V3 Final - No Emoji - MagnetraPH
(function(){
var LS_FAIL="mp_fail_";
var LS_LOCK="mp_lock_";
var LS_GFAIL="mp_g_fail";
var LS_GLOCK="mp_g_lock";
var LS_DEVICE="mp_device_id";
function getDeviceId(){
try{
var id=localStorage.getItem(LS_DEVICE);
if(id) return id;
var raw=(navigator.userAgent||"")+"|"+(screen.width||0)+"x"+(screen.height||0)+"|"+(Intl.DateTimeFormat().resolvedOptions().timeZone||"");
var h=0; for(var i=0;i<raw.length;i++){h=((h<<5)-h)+raw.charCodeAt(i);h=h&h;}
id="dev_"+Math.abs(h).toString(16)+"_"+Date.now().toString(16);
localStorage.setItem(LS_DEVICE,id);
return id;
}catch(e){return "dev_unknown";}
}
function isBot(){
try{
var hp=document.getElementById('hp_email');
if(hp&&hp.value.trim()!=="") return true;
return false;
}catch(e){return false;}
}
function canAttempt(email){
var now=Date.now();
var gLock=parseInt(localStorage.getItem(LS_GLOCK)||"0");
if(now<gLock){
var sec=Math.ceil((gLock-now)/1000);
return {ok:false,msg:"Too many attempts. Try again in "+sec+"s"};
}
if(!email) return {ok:true};
var key=LS_LOCK+email;
var lock=parseInt(localStorage.getItem(key)||"0");
if(now<lock){
var s=Math.ceil((lock-now)/1000);
return {ok:false,msg:"Account locked. Try again in "+s+"s"};
}
return {ok:true};
}
function addFail(email){
var now=Date.now();
var gf=parseInt(localStorage.getItem(LS_GFAIL)||"0")+1;
localStorage.setItem(LS_GFAIL,gf.toString());
if(gf>=10){localStorage.setItem(LS_GLOCK,(now+15*60*1000).toString());}
if(email){
var k1=LS_FAIL+email;
var k2=LS_LOCK+email;
var c=parseInt(localStorage.getItem(k1)||"0")+1;
localStorage.setItem(k1,c.toString());
if(c===3){localStorage.setItem(k2,(now+30*1000).toString());}
else if(c===4){localStorage.setItem(k2,(now+60*1000).toString());}
else if(c===5){localStorage.setItem(k2,(now+2*60*1000).toString());}
else if(c>=6){localStorage.setItem(k2,(now+60*60*1000).toString());}
}
}
function clearFail(email){
if(email){
localStorage.setItem(LS_FAIL+email,"0");
localStorage.setItem(LS_LOCK+email,"0");
}
localStorage.setItem(LS_GFAIL,"0");
localStorage.setItem(LS_GLOCK,"0");
}
function constantDelay(start){
var elapsed=Date.now()-start;
var remain=800-elapsed;
return remain>0?remain:0;
}
window.LoginSecurity={getDeviceId:getDeviceId,isBot:isBot,canAttempt:canAttempt,addFail:addFail,clearFail:clearFail,constantDelay:constantDelay};
})();
