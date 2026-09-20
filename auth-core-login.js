// auth-core-login.js V5 Final Sealed 20 Years - No Emoji - MagnetraPH - Login Only
(function(){
"use strict";
var CFG={EXIT_MS:350,BLINK_MS:120,SHAKE_MS:900,DELAY:800};
Object.freeze(CFG);
function qs(id){return document.getElementById(id);}
function showStatus(m){var s=qs('status');if(s) s.textContent=m;}
function shakeField(id){
var el=qs(id);
if(!el) return;
el.classList.remove('shake');
void el.offsetWidth;
el.classList.add('shake');
el.classList.add('error');
setTimeout(function(){el.classList.remove('error');},CFG.SHAKE_MS);
}
function shakeBoth(){shakeField('emailField');shakeField('passField');}
function goPage(e,url){
if(e) e.preventDefault();
var card=qs('card');
if(card) card.classList.add('page-exit');
setTimeout(function(){location.href=url;},CFG.EXIT_MS);
return false;
}
function animateContent(id){
var el=qs(id);
if(!el) return;
el.classList.remove('active');
el.style.display='block';
void el.offsetWidth;
setTimeout(function(){el.classList.add('active');},20);
}
function openHelp(){
var hc=qs('helpContent');
var fc=qs('forgotContent');
if(hc) hc.style.display='block';
if(fc){fc.style.display='none';fc.classList.remove('active');}
var sheet=qs('sheet');
if(sheet) sheet.classList.add('open');
animateContent('helpContent');
}
function openForgot(){
var hc=qs('helpContent');
var fc=qs('forgotContent');
if(hc){hc.style.display='none';hc.classList.remove('active');}
if(fc) fc.style.display='block';
var sheet=qs('sheet');
if(sheet) sheet.classList.add('open');
var em=qs('email');
var re=qs('resetEmail');
if(em&&re) re.value=em.value;
animateContent('forgotContent');
}
function closeSheet(){
var box=qs('sheetBox');
var sheet=qs('sheet');
if(!box||!sheet) return;
box.style.transform='translateY(100%)';
setTimeout(function(){
sheet.classList.remove('open');
box.style.transform='';
var hc=qs('helpContent');
var fc=qs('forgotContent');
if(hc) hc.classList.remove('active');
if(fc) fc.classList.remove('active');
},300);
}
function toggleEye(){
try{
var p=qs('password');
var g=qs('eyeGroup');
if(!p||!g) return;
g.classList.remove('blink-open','blink-close');
void g.getBoundingClientRect();
g.classList.add('blink-close');
setTimeout(function(){
var isPass=p.type==='password';
p.type=isPass?'text':'password';
var svg=qs('eyeSvg');
if(!svg) return;
if(p.type==='text'){
svg.innerHTML='<g id="eyeGroup" class="blink-open"><path d="M2 12s3-7 10-7s10 7 10 7s-3 7-10 7s-10-7-10-7s-10-7-10-7Z"/><path d="M9 12a3 3 0 1 0 6 0a3 3 0 0 0-6 0"/><path d="M3 3l18 18"/></g>';
}else{
svg.innerHTML='<g id="eyeGroup" class="blink-open"><path d="M1 12s4-7 11-7s11 7 11 7s-4 7-11 7s-11-7-11-7z"/><circle cx="12" cy="12" r="3.5"/></g>';
}
},CFG.BLINK_MS);
}catch(e){}
}
async function sendReset(){
var emailEl=qs('resetEmail');
var rs=qs('resetStatus');
var email=emailEl?emailEl.value.trim().toLowerCase():'';
if(!email){if(rs) rs.innerText='Enter email first';shakeField('resetField');return;}
if(window.LoginSecurity){
var chk=LoginSecurity.canAttempt(email);
if(!chk.ok){if(rs) rs.innerText=chk.msg;return;}
}
if(rs) rs.innerText='Sending...';
try{
if(typeof auth==="undefined"){if(rs) rs.innerText='Auth not ready';return;}
await auth.sendPasswordResetEmail(email);
if(rs) rs.innerText='Reset link sent. Check inbox.';
}catch(err){
if(window.LoginSecurity) LoginSecurity.addFail(email);
if(rs) rs.innerText='Unable to send';
}
}
async function login(){
var start=Date.now();
var emailEl=qs('email');
var passEl=qs('password');
var btn=qs('btnLogin');
var email=emailEl?emailEl.value.trim().toLowerCase():'';
var pwd=passEl?passEl.value:'';
if(window.LoginSecurity&&LoginSecurity.isBot()){showStatus('Blocked');return;}
if(!email||email.indexOf('@')<1){shakeField('emailField');showStatus('Invalid email');return;}
if(!pwd){shakeField('passField');showStatus('Enter password');return;}
if(window.LoginSecurity){
var chk=LoginSecurity.canAttempt(email);
if(!chk.ok){showStatus(chk.msg);return;}
}
if(btn){btn.disabled=true;btn.innerText='Logging in...';}
showStatus('Logging in...');
try{
if(typeof auth==="undefined") throw new Error('no auth');
var cred=await auth.signInWithEmailAndPassword(email,pwd);
if(window.LoginSecurity) LoginSecurity.clearFail(email);
try{
if(typeof db!=="undefined" && db.collection){
await db.collection('users').doc(cred.user.uid).set({lastLogin: firebase.firestore.FieldValue.serverTimestamp(),lastDevice: window.LoginSecurity?LoginSecurity.getDeviceId():'unknown'},{merge:true});
}
}catch(e){}
var d=window.LoginSecurity?LoginSecurity.constantDelay(start):0;
setTimeout(function(){goPage(null,'dashboard.html');},d);
}catch(e){
if(window.LoginSecurity) LoginSecurity.addFail(email);
var d2=window.LoginSecurity?LoginSecurity.constantDelay(start):0;
setTimeout(function(){
showStatus('Invalid email or password');
shakeBoth();
if(btn){btn.disabled=false;btn.innerText='Log in';}
},d2);
}
}
async function loginGoogle(){
var start=Date.now();
if(window.LoginSecurity){
var chk=LoginSecurity.canAttempt('google_login');
if(!chk.ok){showStatus(chk.msg);return;}
}
showStatus('Connecting...');
try{
if(typeof auth==="undefined") throw new Error('no auth');
var provider=new firebase.auth.GoogleAuthProvider();
var cred=await auth.signInWithPopup(provider);
var d=window.LoginSecurity?LoginSecurity.constantDelay(start):0;
setTimeout(function(){goPage(null,'dashboard.html');},d);
}catch(e){
var d2=window.LoginSecurity?LoginSecurity.constantDelay(start):0;
setTimeout(function(){showStatus('Unable to continue with Google');},d2);
}
}
function loginBio(){showStatus('Biometrics not yet enrolled');}
function bindAll(){
var eyeBtn=qs('eyeBtn');if(eyeBtn) eyeBtn.onclick=toggleEye;
var btnLogin=qs('btnLogin');if(btnLogin) btnLogin.onclick=login;
var btnBio=qs('btnBio');if(btnBio) btnBio.onclick=loginBio;
var btnGoogle=qs('btnGoogle');if(btnGoogle) btnGoogle.onclick=loginGoogle;
var forgotLink=qs('forgotLink');if(forgotLink) forgotLink.onclick=openForgot;
var helpLink=qs('helpLink');if(helpLink) helpLink.onclick=openHelp;
var closeHelp=qs('closeHelp');if(closeHelp) closeHelp.onclick=closeSheet;
var closeForgot=qs('closeForgot');if(closeForgot) closeForgot.onclick=closeSheet;
var btnSend=qs('btnSendReset');if(btnSend) btnSend.onclick=sendReset;
var createLink=qs('createLink');if(createLink) createLink.onclick=function(e){goPage(e,'create.html');};
var sheet=qs('sheet');if(sheet) sheet.addEventListener('click',function(e){if(e.target.id==='sheet') closeSheet();});
}
function seal(){
try{
var api={bindAll:bindAll};
Object.freeze(api);
Object.defineProperty(window,"AuthCoreLogin",{value:api,writable:false,configurable:false});
}catch(e){}
}
if(document.readyState==="loading"){
document.addEventListener('DOMContentLoaded',function(){bindAll();seal();});
}else{
bindAll();
seal();
}
})();
