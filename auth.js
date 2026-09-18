const firebaseConfig = {
  apiKey: "PALITAN_MO_API_KEY_MO",
  authDomain: "PROJECT_ID.firebaseapp.com",
  projectId: "PROJECT_ID"
};
if(!firebase.apps.length) firebase.initializeApp(firebaseConfig);
const auth = firebase.auth();
const db = firebase.firestore();

document.addEventListener('DOMContentLoaded', ()=>{
  const email = document.getElementById('email');
  const pass = document.getElementById('password');
  const loginBtn = document.getElementById('loginBtn');
  const eyeBtn = document.getElementById('eyeBtn');
  const forgotBtn = document.getElementById('forgotBtn');
  const bioBtn = document.getElementById('bioBtn');
  const googleBtn = document.getElementById('googleBtn');

  eyeBtn.onclick = ()=>{ pass.type = pass.type==='password'?'text':'password'; };

  if(Security.isLocked()){
    loginBtn.textContent = "Locked 30s - Protected";
    loginBtn.disabled = true;
    setTimeout(()=>location.reload(),30000);
  }

  loginBtn.onclick = async ()=>{
    email.classList.remove('error'); pass.classList.remove('error');
    if(!email.value || !pass.value){
      if(!email.value) email.classList.add('error');
      if(!pass.value) pass.classList.add('error');
      if(navigator.vibrate) navigator.vibrate(100);
      return;
    }
    if(Security.isLocked()) return;
    loginBtn.textContent = "Verifying..."; loginBtn.disabled=true;
    try{
      const cred = await auth.signInWithEmailAndPassword(email.value.trim(), pass.value);
      const sealed = Security.seal({uid:cred.user.uid});
      localStorage.setItem('mp_sealed', sealed);
      await db.collection('users').doc(cred.user.uid).set({lastLogin: firebase.firestore.FieldValue.serverTimestamp(), safe:true},{merge:true});
      Security.resetFail();
      location.href = "home.html";
    }catch(e){
      email.classList.add('error'); pass.classList.add('error');
      if(navigator.vibrate) navigator.vibrate([80,40,80]);
      const locked = Security.addFail();
      if(locked) location.reload(); else { alert(e.message); loginBtn.textContent="Log in"; loginBtn.disabled=false; }
    }
  };

  forgotBtn.onclick = async ()=>{
    if(!email.value){ email.classList.add('error'); alert("Lagay mo email mo muna"); return; }
    try{ await auth.sendPasswordResetEmail(email.value.trim()); alert("Reset link sent sa "+email.value); }catch(e){ alert(e.message); }
  };

  googleBtn.onclick = async ()=>{
    try{
      const provider = new firebase.auth.GoogleAuthProvider();
      provider.setCustomParameters({prompt:'select_account'});
      const r = await auth.signInWithPopup(provider);
      const sealed = Security.seal({uid:r.user.uid});
      localStorage.setItem('mp_sealed', sealed);
      location.href = "home.html";
    }catch(e){ alert(e.message); }
  };

  bioBtn.onclick = async ()=>{
    if(!navigator.credentials){ alert("No biometric on this device"); return; }
    const enrolled = localStorage.getItem('mp_bio_enrolled');
    if(!enrolled){ alert("Mag login ka muna ng normal para ma-enroll biometric mo"); return; }
    try{
      const bio = JSON.parse(localStorage.getItem('mp_bio')||'[]');
      const cred = await navigator.credentials.get({publicKey:{challenge:new Uint8Array([1,2,3]), allowCredentials:bio, userVerification:"required"}});
      if(cred) location.href="home.html";
    }catch(e){}
  };

  // MAYA STYLE AUTO BIOMETRIC
  setTimeout(async ()=>{
    if(localStorage.getItem('mp_bio_enrolled') && localStorage.getItem('mp_bio')){
      try{
        const bio = JSON.parse(localStorage.getItem('mp_bio'));
        await navigator.credentials.get({publicKey:{challenge:new Uint8Array([1,2,3]), allowCredentials:bio, userVerification:"required"}});
      }catch(e){}
    }
  },800);
});
