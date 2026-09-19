// auth-core.js - MagnetraPH - Auth Core - By Order Malinis - Design intact
let failCount = parseInt(localStorage.getItem('mp_fail')||'0');
let lockUntil = parseInt(localStorage.getItem('mp_lock')||'0');

function toggleEye(){
 const p = document.getElementById('password');
 const g = document.getElementById('eyeGroup');
 if(!g) return;
 g.classList.remove('blink-open','blink-close');void g.getBoundingClientRect();g.classList.add('blink-close');
 setTimeout(()=>{
  p.type = p.type === 'password' ? 'text' : 'password';
  const isText = p.type === 'text';
  document.getElementById('eyeSvg').innerHTML = isText ? '<g id="eyeGroup" class="blink-open"><path d="M2 12s3-7 10-7s10 7 10 7s-3 7-10 7s-10-7-10-7Z"/><path d="M9 12a3 3 0 1 0 6 0a3 3 0 0 0-6 0"/><path d="M3 3l18 18"/></g>' : '<g id="eyeGroup" class="blink-open"><path d="M1 12s4-7 11-7s11 7 11 7s-4 7-11 7s-11-7-11-7z"/><circle cx="12" cy="12" r="3.5"/></g>';
 },120);
}

function shakeField(id){ const el = document.getElementById(id); el.classList.remove('shake');void el.offsetWidth;el.classList.add('shake');el.classList.add('error'); setTimeout(()=>el.classList.remove('error'),900); }
function shakeBoth(){ shakeField('emailField');shakeField('passField'); }

function checkLock(){
 const now = Date.now();
 if(now < lockUntil){
  const sec = Math.ceil((lockUntil-now)/1000);
  const btn = document.getElementById('btnLogin');
  if(btn){ btn.disabled=true; btn.innerText='Try again in '+sec+'s'; }
  const st = document.getElementById('status');
  if(st) st.innerText='Too many attempts. Wait '+sec+' seconds.';
  setTimeout(checkLock,1000);
  return true;
 }else{
  if(lockUntil>0){failCount=0;localStorage.setItem('mp_fail','0');localStorage.removeItem('mp_lock');}
  const btn = document.getElementById('btnLogin');
  if(btn){ btn.disabled=false; btn.innerText='Log in'; }
  return false;
 }
}

function goPage(e,url){
 if(e) e.preventDefault();
 const card = document.getElementById('card');
 if(card) card.classList.add('page-exit');
 setTimeout(()=>{ location.href=url; },350);
 return false;
}

function animateContent(id){ const el = document.getElementById(id); if(!el) return; el.classList.remove('active'); el.style.display='block'; void el.offsetWidth; setTimeout(()=>el.classList.add('active'),20); }
function openHelp(){ const h = document.getElementById('helpContent'); const f = document.getElementById('forgotContent'); if(!h||!f) return; h.style.display='block'; f.style.display='none'; f.classList.remove('active'); document.getElementById('sheet').classList.add('open'); animateContent('helpContent'); }
function openForgot(){ const h = document.getElementById('helpContent'); const f = document.getElementById('forgotContent'); if(!h||!f) return; h.style.display='none'; h.classList.remove('active'); f.style.display='block'; document.getElementById('sheet').classList.add('open'); const em = document.getElementById('email'); const re = document.getElementById('resetEmail'); if(em&&re) re.value=em.value; animateContent('forgotContent'); }
function closeSheet(){ const box = document.getElementById('sheetBox'); if(!box) return; box.style.transform='translateY(100%)'; setTimeout(()=>{ document.getElementById('sheet').classList.remove('open'); box.style.transform=''; const h = document.getElementById('helpContent'); const f = document.getElementById('forgotContent'); if(h) h.classList.remove('active'); if(f) f.classList.remove('active'); },300); }

async function sendReset(){
 const email = document.getElementById('resetEmail').value.trim();
 const rs = document.getElementById('resetStatus');
 if(!email){ if(rs) rs.innerText='Enter email first'; shakeField('resetField'); return; }
 if(rs) rs.innerText='Sending...';
 try{ await auth.sendPasswordResetEmail(email); if(rs) rs.innerText='Reset link sent! Check inbox and SPAM folder.'; }catch(err){ if(rs) rs.innerText='Error: '+err.message; shakeField('resetField'); }
}

async function login(){
 if(checkLock()) return;
 const email = document.getElementById('email').value.trim();
 const password = document.getElementById('password').value;
 const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
 if(!email || !emailRegex.test(email)){ shakeField('emailField'); const st=document.getElementById('status'); if(st) st.innerText="Invalid email format"; return; }
 if(!password){ shakeField('passField'); const st=document.getElementById('status'); if(st) st.innerText="Enter password"; return; }
 const st=document.getElementById('status'); if(st) st.innerText="Logging in...";
 try{
  const cred = await auth.signInWithEmailAndPassword(email,password);
  if(!cred.user.emailVerified){ shakeBoth(); if(st) st.innerText="Please verify email first. Check inbox."; await auth.signOut(); return; }
  localStorage.setItem('mp_fail','0'); localStorage.removeItem('mp_lock');
  try{ if(typeof Security!=='undefined' && cred.user.uid){ await Security.resetFail(cred.user.uid); } }catch(_){}
  goPage(null,'dashboard.html');
 }catch(err){
  failCount++; localStorage.setItem('mp_fail',failCount.toString());
  try{ if(typeof Security!=='undefined'){ await Security.addFail(null, email); } }catch(_){}
  if(err.code==='auth/user-not-found' || err.code==='auth/invalid-email'){ shakeField('emailField'); } else if(err.code==='auth/wrong-password'){ shakeField('passField'); } else { shakeBoth(); }
  const s=document.getElementById('status'); if(s) s.innerText="Error: "+err.message;
  if(failCount>=3){ lockUntil=Date.now()+30000; localStorage.setItem('mp_lock',lockUntil.toString()); checkLock(); }
 }
}

async function loginGoogle(){
 if(checkLock()) return;
 const st=document.getElementById('status'); if(st) st.innerText="Connecting to Google...";
 try{ const provider = new firebase.auth.GoogleAuthProvider(); await auth.signInWithPopup(provider); goPage(null,'dashboard.html'); }catch(err){ if(st) st.innerText="Error: "+err.message; }
}

async function loginBio(){
 if(checkLock()) return;
 const st=document.getElementById('status'); if(st) st.innerText="Biometrics not yet enrolled. Please login with password first.";
}

(function(){
 checkLock();
 const sheet=document.getElementById('sheet');
 if(sheet){ sheet.addEventListener('click',(e)=>{ if(e.target.id==='sheet') closeSheet(); }); }
 let lastBackTap=0;
 history.pushState(null,null,location.href);
 window.addEventListener('popstate',()=>{
  const now=Date.now(); const toast=document.getElementById('exitToast'); if(!toast) return;
  if(now-lastBackTap<2000){ toast.classList.remove('show'); setTimeout(()=>{ try{window.close();}catch(e){} history.go(-1); },150); }else{ lastBackTap=now; toast.classList.add('show'); setTimeout(()=>toast.classList.remove('show'),2000); history.pushState(null,null,location.href); }
 });
 document.addEventListener('contextmenu',e=>e.preventDefault());
 document.addEventListener('keydown',e=>{ if((e.ctrlKey && (e.key==='u' || e.key==='s')) || e.key==='F12'){ e.preventDefault(); } });
})();
