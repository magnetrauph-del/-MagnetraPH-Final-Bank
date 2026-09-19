// auth-core.js - Login Functions - MagnetraPH - Uses login-security.js - By Order Malinis - No Emoji
(function(){
var lastBackTap=0;

function showStatus(m){ var s=document.getElementById('status'); if(s) s.textContent=m; }
function shakeField(id){ var el=document.getElementById(id); if(!el) return; el.classList.remove('shake'); void el.offsetWidth; el.classList.add('shake'); el.classList.add('error'); setTimeout(function(){ el.classList.remove('error'); },900); }
function shakeBoth(){ shakeField('emailField'); shakeField('passField'); }
function goPage(e,url){ if(e) e.preventDefault(); var card=document.getElementById('card'); if(card) card.classList.add('page-exit'); setTimeout(function(){ location.href=url; },350); return false; }
function animateContent(id){ var el=document.getElementById(id); if(!el) return; el.classList.remove('active'); el.style.display='block'; void el.offsetWidth; setTimeout(function(){ el.classList.add('active'); },20); }
function openHelp(){ var hc=document.getElementById('helpContent'); var fc=document.getElementById('forgotContent'); if(hc) hc.style.display='block'; if(fc){ fc.style.display='none'; fc.classList.remove('active'); } var sheet=document.getElementById('sheet'); if(sheet) sheet.classList.add('open'); animateContent('helpContent'); }
function openForgot(){ var hc=document.getElementById('helpContent'); var fc=document.getElementById('forgotContent'); if(hc){ hc.style.display='none'; hc.classList.remove('active'); } if(fc) fc.style.display='block'; var sheet=document.getElementById('sheet'); if(sheet) sheet.classList.add('open'); var em=document.getElementById('email'); var re=document.getElementById('resetEmail'); if(em&&re) re.value=em.value; animateContent('forgotContent'); }
function closeSheet(){ var box=document.getElementById('sheetBox'); if(!box) return; box.style.transform='translateY(100%)'; setTimeout(function(){ var sheet=document.getElementById('sheet'); if(sheet) sheet.classList.remove('open'); box.style.transform=''; var hc=document.getElementById('helpContent'); var fc=document.getElementById('forgotContent'); if(hc) hc.classList.remove('active'); if(fc) fc.classList.remove('active'); },300); }
function toggleEye(){ var p=document.getElementById('password'); var g=document.getElementById('eyeGroup'); if(!p||!g) return; g.classList.remove('blink-open','blink-close'); void g.getBoundingClientRect(); g.classList.add('blink-close'); setTimeout(function(){ p.type=p.type==='password'?'text':'password'; var isText=p.type==='text'; var svg=document.getElementById('eyeSvg'); if(!svg) return; if(isText){ svg.innerHTML='<g id="eyeGroup" class="blink-open"><path d="M2 12s3-7 10-7s10 7 10 7s-3 7-10 7s-10-7-10-7Z"/><path d="M9 12a3 3 0 1 0 6 0a3 3 0 0 0-6 0"/><path d="M3 3l18 18"/></g>'; } else { svg.innerHTML='<g id="eyeGroup" class="blink-open"><path d="M1 12s4-7 11-7s11 7 11 7s-4 7-11 7s-11-7-11-7z"/><circle cx="12" cy="12" r="3.5"/></g>'; } },120); }
async function sendReset(){ var emailEl=document.getElementById('resetEmail'); var rs=document.getElementById('resetStatus'); var email=emailEl?emailEl.value.trim().toLowerCase():''; if(!email){ if(rs) rs.innerText='Enter email first'; shakeField('resetField'); return; } if(window.LoginSecurity){ var chk=LoginSecurity.canAttempt(email); if(!chk.ok){ if(rs) rs.innerText=chk.msg; return; } if(LoginSecurity.isBot()){ if(rs) rs.innerText='Blocked'; return; } } if(rs) rs.innerText='Sending...'; try{ await auth.sendPasswordResetEmail(email); if(rs) rs.innerText='Reset link sent! Check inbox and SPAM folder.'; }catch(err){ if(window.LoginSecurity) LoginSecurity.addFail(email); var msg='Unable to send reset link'; if(rs) rs.innerText=msg; shakeField('resetField'); } }

async function login(){
var start=Date.now();
var emailEl=document.getElementById('email');
var passEl=document.getElementById('password');
var btn=document.getElementById('btnLogin');
var email=emailEl?emailEl.value.trim().toLowerCase():'';
var password=passEl?passEl.value:'';
var emailRegex=/^[^\s@]+@[^\s@]+\.[^\s@]+$/;

if(window.LoginSecurity && LoginSecurity.isBot()){ showStatus('Blocked'); return; }
if(!email ||!emailRegex.test(email)){ shakeField('emailField'); showStatus('Invalid email format'); return; }
if(!password){ shakeField('passField'); showStatus('Enter password'); return; }

if(window.LoginSecurity){
var chk=LoginSecurity.canAttempt(email);
if(!chk.ok){ showStatus(chk.msg); return; }
}

if(btn){ btn.disabled=true; btn.innerText='Logging in...'; }
showStatus('Logging in...');

try{
var cred=await auth.signInWithEmailAndPassword(email,password);
if(window.LoginSecurity) LoginSecurity.clearFail(email);
try{ await db.collection('users').doc(cred.user.uid).set({lastLogin: firebase.firestore.FieldValue.serverTimestamp(), lastDevice: LoginSecurity.getDeviceId()}, {merge:true}); }catch(_){}
var delay=window.LoginSecurity?LoginSecurity.constantDelay(start):0;
setTimeout(function(){ goPage(null,'dashboard.html'); }, delay);
}catch(err){
if(window.LoginSecurity) LoginSecurity.addFail(email);
var delay2=window.LoginSecurity?LoginSecurity.constantDelay(start):0;
setTimeout(function(){
var generic='Invalid email or password';
showStatus(generic);
shakeBoth();
if(btn){ btn.disabled=false; btn.innerText='Log in'; }
}, delay2);
}
}

async function loginGoogle(){
var start=Date.now();
if(window.LoginSecurity){
var chk=LoginSecurity.canAttempt('google');
if(!chk.ok){ showStatus(chk.msg); return; }
if(LoginSecurity.isBot()){ showStatus('Blocked'); return; }
}
showStatus('Connecting to Google...');
try{
var provider=new firebase.auth.GoogleAuthProvider();
var cred=await auth.signInWithPopup(provider);
var user=cred.user;
try{
var ref=db.collection('users').doc(user.uid);
var snap=await ref.get();
if(!snap.exists){
await ref.set({email:user.email.toLowerCase(), uid:user.uid, createdAt: firebase.firestore.FieldValue.serverTimestamp(), lastLogin: firebase.firestore.FieldValue.serverTimestamp(), lastDevice: LoginSecurity.getDeviceId(), verified:false, pwdStrength:0, plan:'free', role:'free', mPoints:0, marketplace:{totalPost:0,maxPost:3,updatedAt:firebase.firestore.FieldValue.serverTimestamp()}, basic:{status:'trial',trialStart:new Date(),trialEnd:new Date(Date.now()+7*24*60*60*1000),active:true,price:499}, gold:{status:'locked',active:false,price:999}, isAdmin:false, provider:'google'}, {merge:true});
} else {
await ref.set({lastLogin: firebase.firestore.FieldValue.serverTimestamp(), lastDevice: LoginSecurity.getDeviceId()}, {merge:true});
}
}catch(_){}
var d=window.LoginSecurity?LoginSecurity.constantDelay(start):0;
setTimeout(function(){ goPage(null,'dashboard.html'); }, d);
}catch(err){
var d2=window.LoginSecurity?LoginSecurity.constantDelay(start):0;
setTimeout(function(){ showStatus('Unable to continue with Google'); }, d2);
}
}

async function loginBio(){ showStatus('Biometrics not yet enrolled. Please login with password first.'); }

try{
var eyeBtn=document.getElementById('eyeBtn'); if(eyeBtn) eyeBtn.addEventListener('click', toggleEye);
var btnLogin=document.getElementById('btnLogin'); if(btnLogin) btnLogin.addEventListener('click', login);
var btnBio=document.getElementById('btnBio'); if(btnBio) btnBio.addEventListener('click', loginBio);
var btnGoogle=document.getElementById('btnGoogle'); if(btnGoogle) btnGoogle.addEventListener('click', loginGoogle);
var forgotLink=document.getElementById('forgotLink'); if(forgotLink) forgotLink.addEventListener('click', openForgot);
var helpLink=document.getElementById('helpLink'); if(helpLink) helpLink.addEventListener('click', openHelp);
var closeHelp=document.getElementById('closeHelp'); if(closeHelp) closeHelp.addEventListener('click', closeSheet);
var closeForgot=document.getElementById('closeForgot'); if(closeForgot) closeForgot.addEventListener('click', closeSheet);
var btnSend=document.getElementById('btnSendReset'); if(btnSend) btnSend.addEventListener('click', sendReset);
var createLink=document.getElementById('createLink'); if(createLink) createLink.addEventListener('click', function(e){ goPage(e,'create.html'); });
var sheet=document.getElementById('sheet'); if(sheet) sheet.addEventListener('click', function(e){ if(e.target.id==='sheet') closeSheet(); });
document.addEventListener('keydown', function(e){ if(e.key==='Enter'){ var ae=document.activeElement; if(ae && (ae.id==='email' || ae.id==='password')) login(); } });
history.pushState(null,null,location.href);
window.addEventListener('popstate', function(){ var now=Date.now(); var toast=document.getElementById('exitToast'); if(now-lastBackTap<2000){ if(toast) toast.classList.remove('show'); setTimeout(function(){ try{window.close();}catch(_){} history.go(-1); },150); } else { lastBackTap=now; if(toast){ toast.classList.add('show'); setTimeout(function(){ toast.classList.remove('show'); },2000); } history.pushState(null,null,location.href); } });
}catch(_){}

window.toggleEye=toggleEye; window.login=login; window.loginBio=loginBio; window.loginGoogle=loginGoogle; window.goPage=goPage; window.openHelp=openHelp; window.openForgot=openForgot; window.closeSheet=closeSheet; window.sendReset=sendReset;
})();
