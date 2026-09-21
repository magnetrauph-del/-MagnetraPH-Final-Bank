/* MAGNETRAPH - AUTH-CORE-LOGIN.JS V4 FINAL - 20-YEAR SEALED LOCK OWNER: BOSS ONLY - BPI BANK LEVEL - CONNECT SECURITY-LOGIN.JS V3 - SEALED: 2026-2046 */
(function(){
  "use strict";
  try{ Object.defineProperty(window,'MagnetraPH_SEAL',{value:{owner:'BOSS',years:20,start:2026,end:2046,sealed:true,signature:'BlackPurple #0e061e #3E18E0 #7B2FFF + RedBlend #C93A5A'},writable:false,configurable:false}); }catch(e){}
  var CFG={EXIT_MS:380,BLINK_MS:120,SHAKE_MS:350,DELAY:800,OWNER_KEY:"MAGNETRA_ULTRA_OWNER_2026",MIN_DELAY:800,MAX_DELAY:900};
  Object.freeze(CFG);
  function qs(id){return document.getElementById(id);}
  function showStatus(m){var s=qs('status');if(s) s.textContent=m;}
  function clearErr(){var e=qs('emailField');var p=qs('passField');if(e)e.classList.remove('error','shake');if(p)p.classList.remove('error','shake');}
  function triggerRed(type){ var eF=qs('emailField');var pF=qs('passField'); clearErr(); void document.body.offsetWidth; if(type==='email'&&eF){eF.classList.add('error','shake');} if(type==='password'&&pF){pF.classList.add('error','shake');} if(type==='both'){if(eF)eF.classList.add('error','shake');if(pF)pF.classList.add('error','shake');} setTimeout(function(){if(eF)eF.classList.remove('shake');if(pF)pF.classList.remove('shake');},CFG.SHAKE_MS); }
  function goPage(e,url){ if(e) e.preventDefault(); var card=qs('card'); if(card) card.classList.add('page-exit'); setTimeout(function(){location.href=url;},CFG.EXIT_MS); return false; }
  function animateContent(id){ var el=qs(id); if(!el) return; el.classList.remove('active'); el.style.display='block'; void el.offsetWidth; setTimeout(function(){el.classList.add('active');},20); }
  function openHelp(){ var hc=qs('helpContent'); var fc=qs('forgotContent'); if(hc) hc.style.display='block'; if(fc){fc.style.display='none';fc.classList.remove('active');} var sheet=qs('sheet'); if(sheet) sheet.classList.add('open'); animateContent('helpContent'); }
  function openForgot(){ var hc=qs('helpContent'); var fc=qs('forgotContent'); if(hc){hc.style.display='none';hc.classList.remove('active');} if(fc) fc.style.display='block'; var sheet=qs('sheet'); if(sheet) sheet.classList.add('open'); var em=qs('email'); var re=qs('resetEmail'); if(em&&re) re.value=em.value; animateContent('forgotContent'); }
  function closeSheet(){ var box=qs('sheetBox'); var sheet=qs('sheet'); if(!box||!sheet) return; box.style.transform='translateY(100%)'; setTimeout(function(){ sheet.classList.remove('open'); box.style.transform=''; var hc=qs('helpContent'); var fc=qs('forgotContent'); if(hc) hc.classList.remove('active'); if(fc) fc.classList.remove('active'); },300); }
  function toggleEye(){ try{ var p=qs('password'); var g=qs('eyeGroup'); var svg=qs('eyeSvg'); if(!p||!g||!svg) return; g.classList.remove('blink-open','blink-close'); void g.getBoundingClientRect(); g.classList.add('blink-close'); setTimeout(function(){ var isPass=p.type==='password'; p.type=isPass?'text':'password'; if(p.type==='text'){ svg.innerHTML='<g id="eyeGroup" class="blink-open"><path d="M2 12s3-7 10-7s10 7 10 7s-3 7-10 7s-10-7-10-7Z"/><path d="M9 12a3 3 0 1 0 6 0a3 3 0 0 0-6 0"/><path d="M3 3l18 18"/></g>'; }else{ svg.innerHTML='<g id="eyeGroup" class="blink-open"><path d="M1 12s4-7 11-7s11 7 11 7s-4 7-11 7s-11-7-11-7z"/><circle cx="12" cy="12" r="3.5"/></g>'; } var ng=qs('eyeGroup'); if(ng){ ng.classList.add('blink-open'); setTimeout(function(){ng.classList.remove('blink-open');},180); } },CFG.BLINK_MS); }catch(e){} }
  function getDeviceId(){try{var k="mp_device_id_20y";var d=localStorage.getItem(k);if(!d){d="dev_"+Date.now()+"_"+Math.random().toString(36).slice(2);localStorage.setItem(k,d);}return d;}catch(e){return "dev_unknown";}}
  function isPasswordSafeSilent(pwd){if(!pwd) return {ok:false,hack:true}; if(/\s/.test(pwd)) return {ok:false,hack:false}; var hackChars=/[<>'"`$\\\/=+\|&*%!@#^(){}\[\];:{}\x00-\x1F]/; if(hackChars.test(pwd)) return {ok:false,hack:true}; return {ok:true,hack:false};}
  async function sendReset(){
    var emailEl=qs('resetEmail'); var rs=qs('resetStatus'); var hpEl=qs('hp_email');
    var email=emailEl?emailEl.value.trim().toLowerCase():'';
    if(hpEl&&hpEl.value!==""){if(rs) rs.innerText='Blocked'; if(window.LoginSecurity) LoginSecurity.addFail('hp_'+getDeviceId(),true); return;}
    if(window.LoginSecurity&&LoginSecurity.isBot&&LoginSecurity.isBot()){if(rs) rs.innerText='Blocked';return;}
    if(window.LoginSecurity&&LoginSecurity.isEmailSafe){
      var chkEmail=LoginSecurity.isEmailSafe(email);
      if(!chkEmail.ok){if(rs) rs.innerText=chkEmail.msg; triggerRed('email'); if(chkEmail.hack&&window.LoginSecurity) LoginSecurity.addFail(email,true); return;}
      email=chkEmail.email;
    }else{
      if(!email){if(rs) rs.innerText='Enter email first';triggerRed('email');return;}
    }
    if(window.LoginSecurity){ var chk=LoginSecurity.canAttempt(email); if(!chk.ok){if(rs) rs.innerText=chk.msg;return;} }
    if(rs) rs.innerText='Sending...';
    try{ if(typeof auth==="undefined"){if(rs) rs.innerText='Auth not ready';return;} await auth.sendPasswordResetEmail(email); if(rs) rs.innerText='Reset link sent. Check inbox.'; }catch(err){ if(window.LoginSecurity) LoginSecurity.addFail(email); if(rs) rs.innerText='Unable to send'; }
  }
  async function login(){
    var start=Date.now(); var emailEl=qs('email'); var passEl=qs('password'); var btn=qs('btnLogin'); var hpEl=qs('hp_email');
    var email=emailEl?emailEl.value.trim().toLowerCase():''; var pwd=passEl?passEl.value:'';
    if(hpEl&&hpEl.value!==""){showStatus('Blocked'); if(window.LoginSecurity) LoginSecurity.addFail('hp_'+getDeviceId(),true); return;}
    if(window.LoginSecurity&&LoginSecurity.isBot&&LoginSecurity.isBot()){showStatus('Blocked');return;}
    if(window.LoginSecurity&&LoginSecurity.isEmailSafe){
      var chkEmail=LoginSecurity.isEmailSafe(email);
      if(!chkEmail.ok){triggerRed('email');showStatus(chkEmail.msg); if(chkEmail.hack&&window.LoginSecurity) LoginSecurity.addFail(email,true); return;}
      email=chkEmail.email;
    }else{
      if(!email||email.indexOf('@')<1){triggerRed('email');showStatus('Invalid email');return;}
    }
    if(!pwd){triggerRed('password');showStatus('Enter password');return;}
    var pwdSafe=isPasswordSafeSilent(pwd); if(!pwdSafe.ok){triggerRed('password');showStatus(pwdSafe.hack?'Invalid password':'Enter password'); if(window.LoginSecurity) LoginSecurity.addFail(email,pwdSafe.hack); return;}
    if(window.LoginSecurity){ var chk=LoginSecurity.canAttempt(email); if(!chk.ok){showStatus(chk.msg);return;} }
    if(btn){btn.disabled=true;btn.innerText='Logging in...';} showStatus('Logging in...');
    try{ if(typeof auth==="undefined") throw new Error('no auth'); var cred=await auth.signInWithEmailAndPassword(email,pwd); if(window.LoginSecurity) LoginSecurity.clearFail(email); try{ if(typeof db!=="undefined" && db.collection){ await db.collection('users').doc(cred.user.uid).set({lastLogin: firebase.firestore.FieldValue.serverTimestamp(),lastDevice: window.LoginSecurity?LoginSecurity.getDeviceId():getDeviceId()},{merge:true}); } }catch(e){} var d=window.LoginSecurity?LoginSecurity.constantDelay(start):800; setTimeout(function(){goPage(null,'dashboard.html');},d); }catch(e){ if(window.LoginSecurity) LoginSecurity.addFail(email); var d2=window.LoginSecurity?LoginSecurity.constantDelay(start):800; setTimeout(function(){ if(e.code==='auth/user-not-found'||e.code==='auth/invalid-email'){triggerRed('email');showStatus('Wrong email');} else if(e.code==='auth/wrong-password'){triggerRed('password');showStatus('Wrong password');} else{triggerRed('both');showStatus('Invalid email or password');} if(btn){btn.disabled=false;btn.innerText='Log in';} },d2); }
  }
  async function loginGoogle(){
    var start=Date.now();
    if(window.LoginSecurity&&LoginSecurity.isBot&&LoginSecurity.isBot()){showStatus('Blocked');return;}
    if(window.LoginSecurity){ var chk=LoginSecurity.canAttempt('google_login_'+getDeviceId()); if(!chk.ok){showStatus(chk.msg);return;} }
    showStatus('Connecting...');
    try{ if(typeof auth==="undefined") throw new Error('no auth'); var provider=new firebase.auth.GoogleAuthProvider(); var cred=await auth.signInWithPopup(provider); if(window.LoginSecurity) LoginSecurity.clearFail('google_login_'+getDeviceId()); var d=window.LoginSecurity?LoginSecurity.constantDelay(start):800; setTimeout(function(){goPage(null,'dashboard.html');},d); }catch(e){ if(window.LoginSecurity) LoginSecurity.addFail('google_login_'+getDeviceId()); var d2=window.LoginSecurity?LoginSecurity.constantDelay(start):800; setTimeout(function(){showStatus('Unable to continue with Google');},d2); }
  }
  async function loginBio(){
    try{
      if(window.LoginSecurity&&LoginSecurity.isBot&&LoginSecurity.isBot()){showStatus('Blocked');return;}
      if(window.LoginSecurity){ var chk=LoginSecurity.canAttempt('bio_'+getDeviceId()); if(!chk.ok){showStatus(chk.msg);return;} }
      if(!window.PublicKeyCredential){showStatus('Walang Screen Lock');return;}
      var ok=await PublicKeyCredential.isUserVerifyingPlatformAuthenticatorAvailable(); if(!ok){showStatus('Enable muna Screen Lock');return;}
      showStatus('Tap fingerprint / face / PIN...');
      await navigator.credentials.get({publicKey:{challenge:new Uint8Array([1,2,3,4,5,6,7,8]),userVerification:'required',timeout:60000}});
      if(window.LoginSecurity) LoginSecurity.clearFail('bio_'+getDeviceId());
      showStatus('Screen Lock verified'); setTimeout(function(){goPage(null,'dashboard.html');},300);
    }catch(e){ if(window.LoginSecurity) LoginSecurity.addFail('bio_'+getDeviceId(),true); showStatus('Screen Lock cancelled');}
  }
  function bindAll(){ var eyeBtn=qs('eyeBtn');if(eyeBtn){eyeBtn.onclick=toggleEye; eyeBtn.addEventListener('touchend',function(e){e.preventDefault();toggleEye();},{passive:false});} var btnLogin=qs('btnLogin');if(btnLogin) btnLogin.onclick=login; var btnBio=qs('btnBio');if(btnBio) btnBio.onclick=loginBio; var btnScreenLock=qs('btnScreenLock');if(btnScreenLock) btnScreenLock.onclick=loginBio; var btnGoogle=qs('btnGoogle');if(btnGoogle) btnGoogle.onclick=loginGoogle; var forgotLink=qs('forgotLink');if(forgotLink) forgotLink.onclick=openForgot; var helpLink=qs('helpLink');if(helpLink) helpLink.onclick=openHelp; var closeHelp=qs('closeHelp');if(closeHelp) closeHelp.onclick=closeSheet; var closeForgot=qs('closeForgot');if(closeForgot) closeForgot.onclick=closeSheet; var btnSend=qs('btnSendReset');if(btnSend) btnSend.onclick=sendReset; var createLink=qs('createLink');if(createLink) createLink.onclick=function(e){goPage(e,'create.html');}; var sheet=qs('sheet');if(sheet) sheet.addEventListener('click',function(e){if(e.target.id==='sheet') closeSheet();}); var emailIn=qs('email');if(emailIn) emailIn.addEventListener('input',clearErr); var passIn=qs('password');if(passIn) passIn.addEventListener('input',clearErr); var card=qs('card');var exitToast=qs('exitToast');var lastBack=0; function showToast(){if(!exitToast)return;exitToast.classList.add('show');setTimeout(function(){exitToast.classList.remove('show');},2200);} function handleBack(){var now=Date.now();if(now-lastBack<2000){if(window.Android&&window.Android.exitApp){window.Android.exitApp();}else{window.close();}}else{showToast();lastBack=now;}} document.addEventListener('backbutton',handleBack,false); document.addEventListener('click',function(e){if(e.target.closest('#card')||e.target.closest('#sheet'))return;var now=Date.now();if(now-lastBack<400&&now-lastBack>50){handleBack();}}); }
  function seal(){ try{ var isOwner=(()=>{try{return localStorage.getItem('mp_owner_20y')===CFG.OWNER_KEY;}catch(e){return false;}})(); if(!isOwner){ try{Object.freeze(auth);}catch(e){} try{Object.seal(db);}catch(e){} try{Object.defineProperty(window,'auth',{writable:false,configurable:false});}catch(e){} } var api={bindAll:bindAll,triggerRed:triggerRed,owner:'BOSS',seal:'20Y'}; Object.freeze(api); Object.defineProperty(window,"AuthCoreLogin",{value:api,writable:false,configurable:false}); Object.freeze(window.AuthCoreLogin); console.log('BPI V4 LOGIN LOCKED - 10 LAYER - SEALED 20Y'); }catch(e){} }
  if(document.readyState==="loading"){ document.addEventListener('DOMContentLoaded',function(){bindAll();seal();}); }else{ bindAll(); seal(); }
  window.triggerRed=triggerRed; window.MagnetraErrorHook=triggerRed; try{ Object.freeze(window.triggerRed); }catch(e){}
})();
