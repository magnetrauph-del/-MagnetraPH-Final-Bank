// create-core.js - MagnetraPH - Create Account Core - By Order Malinis - Design intact
function toggleEye(inputId, svgId){
 const p = document.getElementById(inputId);
 const svg = document.getElementById(svgId);
 if(!p) return;
 const isPass = p.type === 'password';
 p.type = isPass? 'text' : 'password';
 if(svg){
  svg.innerHTML = isPass? '<g><path d="M2 12s3-7 10-7s10 7 10 7s-3 7-10 7s-10-7-10-7Z"/><path d="M9 12a3 3 0 1 0 6 0a3 3 0 0 0-6 0"/><path d="M3 3l18 18"/></g>' : '<g><path d="M1 12s4-7 11-7s11 7 11 7s-4 7-11 7s-11-7-11-7z"/><circle cx="12" cy="12" r="3.5"/></g>';
 }
}

function shakeField(id){ const el = document.getElementById(id); if(!el) return; el.classList.remove('shake');void el.offsetWidth;el.classList.add('shake');el.classList.add('error'); setTimeout(()=>el.classList.remove('error'),900); }

function goPage(e,url){
 if(e) e.preventDefault();
 const card = document.getElementById('card');
 if(card) card.classList.add('page-exit');
 setTimeout(()=>{ location.href=url; },350);
 return false;
}

const banned=["123456","password","qwerty","abc123","12345678","111111","000000","password1","qwerty123","letmein","admin123","123123"];
let pwdScore=0;
let pwdBlocked=false;

function checkPwd(v){
 const meter=document.getElementById('pwdMeter');
 const bar=document.getElementById('pwdBar');
 const txt=document.getElementById('pwdText');
 if(!meter||!bar||!txt) return;
 if(!v){meter.style.display='none';txt.innerText='';pwdScore=0;pwdBlocked=false;return;}
 meter.style.display='block';
 const low=v.toLowerCase();
 for(let b of banned){if(low.includes(b)){bar.style.width='100%';bar.style.background='#FF3B30';txt.innerText='Weak - too common, try stronger mix';txt.style.color='#FF3B30';pwdBlocked=true;pwdScore=0;return;}}
 if(/(.)\1{3,}/.test(v)){bar.style.width='30%';bar.style.background='#FF3B30';txt.innerText='Weak - avoid repeating characters';txt.style.color='#FF3B30';pwdBlocked=true;pwdScore=0;return;}
 pwdBlocked=false; pwdScore=0;
 if(v.length>=6) pwdScore++;
 if(v.length>=8) pwdScore++;
 if(/[A-Z]/.test(v)) pwdScore++;
 if(/[a-z]/.test(v)) pwdScore++;
 if(/[0-9]/.test(v)) pwdScore++;
 if(/[^A-Za-z0-9]/.test(v)) pwdScore++;
 if(pwdScore<=2){bar.style.width='25%';bar.style.background='#FF3B30';txt.innerText='Weak';txt.style.color='#FF3B30';}
 else if(pwdScore===3){bar.style.width='50%';bar.style.background='#FFB84D';txt.innerText='Medium - add uppercase and symbol';txt.style.color='#FFB84D';}
 else if(pwdScore===4){bar.style.width='75%';bar.style.background='#4DA3FF';txt.innerText='Strong';txt.style.color='#4DA3FF';}
 else {bar.style.width='100%';bar.style.background='#4DFF8A';txt.innerText='Very Strong - approved';txt.style.color='#4DFF8A';}
}

async function createAcc(){
 const emailEl=document.getElementById('email');
 const passEl=document.getElementById('password');
 const confirmEl=document.getElementById('confirm');
 const status=document.getElementById('status');
 const btn=document.getElementById('btnCreate');
 if(!emailEl||!passEl||!confirmEl) return;
 const email = emailEl.value.trim().toLowerCase();
 const pass = passEl.value;
 const confirm = confirmEl.value;
 const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
 if(!email ||!regex.test(email)){ shakeField('emailField'); status.innerText='Invalid email format'; return; }
 if(pwdBlocked){ shakeField('passField'); status.innerText='Too common password - please use stronger mix'; return; }
 if(pass.length < 6){ shakeField('passField'); status.innerText='Password must be 6+ characters'; return; }
 if(pwdScore < 3){ shakeField('passField'); status.innerText='Password too weak - make it Strong or Very Strong'; return; }
 if(pass!== confirm){ shakeField('confirmField'); status.innerText='Passwords do not match'; return; }
 if(email.split('@')[0] && pass.toLowerCase().includes(email.split('@')[0])){ shakeField('passField'); status.innerText='Avoid using email in password'; return; }
 status.innerText='Creating account...';
 if(btn) btn.disabled=true;
 try{
  const cred = await auth.createUserWithEmailAndPassword(email, pass);
  await cred.user.sendEmailVerification();
  const token = await cred.user.getIdToken();
  const now = new Date();
  const basicEnd = new Date(now.getTime() + 7*24*60*60*1000);
  try{
   const res = await fetch('https://us-central1-magnetra-ultra.cloudfunctions.net/createAccountSecure',{
    method:'POST',
    headers:{'Content-Type':'application/json','Authorization':'Bearer '+token},
    body: JSON.stringify({email: email, pwdScore: pwdScore, trialEnd: basicEnd.toISOString()})
   });
   if(!res.ok){
    await db.collection('users').doc(cred.user.uid).set({
     email: email,
     displayName: "",
     createdAt: firebase.firestore.FieldValue.serverTimestamp(),
     lastLogin: firebase.firestore.FieldValue.serverTimestamp(),
     verified: false,
     pwdStrength: pwdScore,
     plan: 'free',
     role: 'free',
     mPoints: 0,
     marketplace: { totalPost: 0, maxPost: 3, updatedAt: firebase.firestore.FieldValue.serverTimestamp() },
     basic: { status: 'trial', trialStart: now, trialEnd: basicEnd, active: true },
     gold: { status: 'locked', active: false },
     isAdmin: false,
     provider: 'email'
    }, {merge:true});
   }
  }catch(_){
   await db.collection('users').doc(cred.user.uid).set({
    email: email,
    displayName: "",
    createdAt: firebase.firestore.FieldValue.serverTimestamp(),
    lastLogin: firebase.firestore.FieldValue.serverTimestamp(),
    verified: false,
    pwdStrength: pwdScore,
    plan: 'free',
    role: 'free',
    mPoints: 0,
    marketplace: { totalPost: 0, maxPost: 3, updatedAt: firebase.firestore.FieldValue.serverTimestamp() },
    basic: { status: 'trial', trialStart: now, trialEnd: basicEnd, active: true },
    gold: { status: 'locked', active: false },
    isAdmin: false,
    provider: 'email'
   }, {merge:true});
  }
  status.innerText='Account created! Check inbox to verify.';
  setTimeout(()=>{ goPage(null,'verify.html'); },1200);
 }catch(err){
  status.innerText='Error: '+err.message;
  if(btn) btn.disabled=false;
  if(err.code==='auth/email-already-in-use'){ shakeField('emailField'); } else { shakeField('emailField'); shakeField('passField'); }
 }
}

(function(){
 const sheet=null;
 let lastBackTap=0;
 history.pushState(null,null,location.href);
 window.addEventListener('popstate',()=>{
  const now=Date.now(); const toast=document.getElementById('exitToast'); if(!toast) return;
  if(now-lastBackTap<2000){ toast.classList.remove('show'); setTimeout(()=>{ try{window.close();}catch(e){} history.go(-1); },150); }else{ lastBackTap=now; toast.classList.add('show'); setTimeout(()=>toast.classList.remove('show'),2000); history.pushState(null,null,location.href); }
 });
 document.addEventListener('contextmenu',e=>e.preventDefault());
 document.addEventListener('keydown',e=>{ if((e.ctrlKey && (e.key==='u' || e.key==='s')) || e.key==='F12'){ e.preventDefault(); } });
})();
