// auth-core-create.js V5 Final Sealed 20 Years - No Emoji - MagnetraPH - Create Only
(function(){
"use strict";
var CFG={EXIT_MS:350,BLINK_MS:120,SHAKE_MS:900,DELAY:800};
Object.freeze(CFG);
function qs(id){return document.getElementById(id);}
function showStatus(m){var s=qs('status');if(s) s.textContent=m;}
function shakeField(id){
var el=qs(id);
if(!el) return;
el.classList.remove('shake');void el.offsetWidth;
el.classList.add('shake');el.classList.add('error');
setTimeout(function(){el.classList.remove('error');},CFG.SHAKE_MS);
}
function goPage(e,url){
if(e) e.preventDefault();
var card=qs('card');if(card) card.classList.add('page-exit');
setTimeout(function(){location.href=url;},CFG.EXIT_MS);
return false;
}
function toggleEye(pId,svgId,groupId){
try{
var p=qs(pId);var g=qs(groupId);
if(!p||!g) return;
g.classList.remove('blink-open','blink-close');void g.getBoundingClientRect();g.classList.add('blink-close');
setTimeout(function(){
var isPass=p.type==='password';p.type=isPass?'text':'password';
var svg=qs(svgId);if(!svg) return;
if(p.type==='text'){svg.innerHTML='<g id="'+groupId+'" class="blink-open"><path d="M2 12s3-7 10-7s10 7 10 7s-3 7-10 7s-10-7-10-7Z"/><path d="M9 12a3 3 0 1 0 6 0a3 3 0 0 0-6 0"/><path d="M3 3l18 18"/></g>';}
else{svg.innerHTML='<g id="'+groupId+'" class="blink-open"><path d="M1 12s4-7 11-7s11 7 11 7s-4 7-11 7s-11-7-11-7z"/><circle cx="12" cy="12" r="3.5"/></g>';}
},CFG.BLINK_MS);
}catch(e){}
}
function checkPwdStrength(){
var pwd=qs('password');var meter=qs('pwdMeter');var bar=qs('pwdBar');var txt=qs('pwdText');
if(!pwd||!meter||!bar||!txt) return;
var v=pwd.value;
if(v.length===0){meter.style.display='none';txt.textContent='';return;}
meter.style.display='block';
var score=0;
if(v.length>=6) score++;
if(v.length>=10) score++;
if(/[A-Z]/.test(v) && /[a-z]/.test(v)) score++;
if(/[0-9]/.test(v)) score++;
if(/[^A-Za-z0-9]/.test(v)) score++;
var pct=score*20;var color='#FF3B30';var label='Weak';
if(score>=2){color='#FF9500';label='Fair';}
if(score>=3){color='#FFCC00';label='Good';}
if(score>=4){color='#4CD964';label='Strong';}
if(score>=5){color='#7B2FFF';label='Very Strong';}
bar.style.width=pct+'%';bar.style.background=color;txt.textContent=label;txt.style.color=color;
}
async function createAccount(){
var start=Date.now();
var emailEl=qs('email');var passEl=qs('password');var confEl=qs('confirm');var btn=qs('btnCreate');
var email=emailEl?emailEl.value.trim().toLowerCase():'';var pwd=passEl?passEl.value:'';var conf=confEl?confEl.value:'';
if(window.CreateSecurity && CreateSecurity.isBot()){showStatus('Blocked');return;}
if(!email||email.indexOf('@')<1){shakeField('emailField');showStatus('Invalid email');return;}
if(!pwd||pwd.length<6){shakeField('passField');showStatus('Password must be 6+ chars');return;}
if(pwd!==conf){shakeField('confirmField');showStatus('Passwords do not match');return;}
if(window.CreateSecurity){
var chk=CreateSecurity.canAttempt(email);
if(!chk.ok){showStatus(chk.msg);return;}
}
if(btn){btn.disabled=true;btn.innerText='Creating...';}
showStatus('Creating account...');
try{
if(typeof auth==="undefined") throw new Error('no auth');
var cred=await auth.createUserWithEmailAndPassword(email,pwd);
if(window.CreateSecurity) CreateSecurity.clearFail(email);
try{
if(typeof db!=="undefined" && db.collection){
await db.collection('users').doc(cred.user.uid).set({email:email,createdAt:firebase.firestore.FieldValue.serverTimestamp(),lastDevice:window.CreateSecurity?CreateSecurity.getDeviceId():'unknown',provider:'password'},{merge:true});
}
}catch(e){}
var d=window.CreateSecurity?CreateSecurity.constantDelay(start):0;
setTimeout(function(){goPage(null,'dashboard.html');},d);
}catch(e){
if(window.CreateSecurity) CreateSecurity.addFail(email);
var d2=window.CreateSecurity?CreateSecurity.constantDelay(start):0;
setTimeout(function(){
var msg='Unable to create account';
if(e && e.code==='auth/email-already-in-use') msg='Email already in use';
if(e && e.code==='auth/invalid-email') msg='Invalid email';
showStatus(msg);
shakeField('emailField');
if(btn){btn.disabled=false;btn.innerText='Create Account';}
},d2);
}
}
function bindAll(){
var e1=qs('eyeBtn1');if(e1) e1.onclick=function(){toggleEye('password','eyeSvg1','eyeGroup1');};
var e2=qs('eyeBtn2');if(e2) e2.onclick=function(){toggleEye('confirm','eyeSvg2','eyeGroup2');};
var pwd=qs('password');if(pwd) pwd.addEventListener('input',checkPwdStrength);
var btn=qs('btnCreate');if(btn) btn.onclick=createAccount;
var back=qs('backBtn');if(back) back.onclick=function(e){goPage(e,'login.html');};
var link=qs('loginLink');if(link) link.onclick=function(e){goPage(e,'login.html');};
}
function seal(){
try{
var api={bindAll:bindAll};
Object.freeze(api);
Object.defineProperty(window,"AuthCoreCreate",{value:api,writable:false,configurable:false});
}catch(e){}
}
if(document.readyState==="loading"){document.addEventListener('DOMContentLoaded',function(){bindAll();seal();});}else{bindAll();seal();}
})();
