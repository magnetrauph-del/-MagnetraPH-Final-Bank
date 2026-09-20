// create-security.js - Create Security Only - MagnetraPH - By Order Malinis - No Emoji - Sealed
(function(){
var BANNED=["123456","password","qwerty","abc123","12345678","111111","000000","password1","qwerty123","letmein","admin123","123123","iloveyou","admin","welcome"];
var LS_DEVICE="mp_device_id";
var LS_C_FAIL="mp_c_fail";
var LS_C_LOCK="mp_c_lock";

function getDeviceId(){
try{
var id=localStorage.getItem(LS_DEVICE);
if(id) return id;
var nav=navigator.userAgent||"";
var scr=(screen.width||0)+"x"+(screen.height||0);
var tz=Intl.DateTimeFormat().resolvedOptions().timeZone||"";
var raw=nav+"|"+scr+"|"+tz;
var h=0; for(var i=0;i<raw.length;i++){ h=((h<<5)-h)+raw.charCodeAt(i); h=h&h; }
id="dev_"+Math.abs(h).toString(16)+"_"+Date.now().toString(16);
localStorage.setItem(LS_DEVICE,id);
return id;
}catch(_){ return "dev_unknown"; }
}

function isBot(){
try{
var hp=document.getElementById('hp_email_create');
if(hp && hp.value.trim()!=="") return true;
return false;
}catch(_){ return false; }
}

function canAttempt(email){
var now=Date.now();
var lock=parseInt(localStorage.getItem(LS_C_LOCK)||"0");
if(now<lock){
var sec=Math.ceil((lock-now)/1000);
return {ok:false, msg:"Too many attempts. Try again in "+sec+"s"};
}
return {ok:true};
}

function addFail(){
var now=Date.now();
var c=parseInt(localStorage.getItem(LS_C_FAIL)||"0")+1;
localStorage.setItem(LS_C_FAIL,c.toString());
if(c>=5){
localStorage.setItem(LS_C_LOCK,(now+10*60*1000).toString());
}
if(c>=10){
localStorage.setItem(LS_C_LOCK,(now+60*60*1000).toString());
}
}

function clearFail(){
localStorage.setItem(LS_C_FAIL,"0");
localStorage.setItem(LS_C_LOCK,"0");
}

function checkPassword(pwd,email){
var low=pwd.toLowerCase();
var emailLocal="";
if(email){ emailLocal=email.split('@')[0].toLowerCase(); }
for(var i=0;i<BANNED.length;i++){ if(low.indexOf(BANNED[i])>-1){ return {ok:false, msg:"Too common password - use stronger mix", score:0, blocked:true}; } }
if(/(.)\1{3,}/.test(pwd)){ return {ok:false, msg:"Avoid repeating characters", score:0, blocked:true}; }
if(emailLocal && emailLocal.length>=3 && low.indexOf(emailLocal)>-1){ return {ok:false, msg:"Avoid using email in password", score:0, blocked:true}; }
var score=0;
if(pwd.length>=6) score++;
if(pwd.length>=8) score++;
if(/[A-Z]/.test(pwd)) score++;
if(/[a-z]/.test(pwd)) score++;
if(/[0-9]/.test(pwd)) score++;
if(/[^A-Za-z0-9]/.test(pwd)) score++;
if(score<3){ return {ok:false, msg:"Password too weak - make it Strong or Very Strong", score:score, blocked:false}; }
return {ok:true, score:score, blocked:false};
}

window.CreateSecurity={
getDeviceId: getDeviceId,
isBot: isBot,
canAttempt: canAttempt,
addFail: addFail,
clearFail: clearFail,
checkPassword: checkPassword
};
})();
