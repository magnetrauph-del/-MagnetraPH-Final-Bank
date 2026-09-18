// auth.js - PRO E-WALLET FLOW
const firebaseConfig = {
  apiKey: "AIzaSy...LAGAY_MO_TUNAY_NA_API_KEY_MO_DITO",
  authDomain: "x-ultra-5a5ea.firebaseapp.com",
  projectId: "x-ultra-5a5ea",
  appId: "1:...."
};
if(!firebase.apps.length) firebase.initializeApp(firebaseConfig);
const auth = firebase.auth();
const db = firebase.firestore();

document.addEventListener('DOMContentLoaded', ()=>{
  const email = document.getElementById('email');
  const pass = document.getElementById('password');
  const loginBtn = document.getElementById('loginBtn');
  const eyeBtn = document.getElementById('eyeBtn');
  const eyeOpen = document.getElementById('eyeOpen');
  const eyeClose = document.getElementById('eyeClose');
  const forgotBtn = document.getElementById('forgotBtn');
  const bioBtn = document.getElementById('bioBtn');
  const googleBtn = document.getElementById('googleBtn');

  // EYE FB STYLE
  if(eyeBtn){
    eyeBtn.onclick = ()=>{
      const isPass = pass.type === 'password';
      pass.type = isPass ? 'text' : 'password';
      eyeOpen.style.display = isPass ? 'none' : 'block';
      eyeClose.style.display = isPass ? 'block' : 'none';
    };
  }

  if(Security.isLocked()){
    loginBtn.textContent = "Protected - Try in 30s";
    loginBtn.disabled = true;
    setTimeout(()=>location.reload(),30000);
  }

  // LOGIN
  loginBtn.onclick = async ()=>{
    email.classList.remove('error'); pass.classList.remove('error');
    if(!email.value || !pass.value){
      if(!email.value) email.classList.add('error');
      if(!pass.value) pass.classList.add('error');
      if(navigator.vibrate) navigator.vibrate(100);
      return;
    }
    if(Security.isLocked()) return;
    loginBtn.textContent = "Verifying..."; loginBtn.disabled = true;
    try{
      const cred = await auth.signInWithEmailAndPassword(email.value.trim(), pass.value);
      const sealed = await Security.seal({uid: cred.user.uid}); // AWAIT - ITO ANG AYOS
      localStorage.setItem('mp_sealed', sealed);
      localStorage.setItem('mp_bio_enrolled', '1'); // Auto enroll para sa next biometric
      await db.collection('users').doc(cred.user.uid).set({lastLogin: firebase.firestore.FieldValue.serverTimestamp(), email: cred.user.email},{merge:true});
      Security.resetFail();
      location.href = "home.html";
    }catch(e){
      email.classList.add('error'); pass.classList.add('error');
      if(navigator.vibrate) navigator.vibrate([80,40,80]);
      const locked = await Security.addFail();
      // Log fail sa Firestore para hindi lang local
      try{ await db.collection('fails').add({email: email.value, time: firebase.firestore.FieldValue.serverTimestamp()}); }catch(_){}
      if(locked) location.reload(); 
      else { loginBtn.textContent="Log in"; loginBtn.disabled=false; alert("Mali ang email o password"); }
    }
  };

  // FORGOT
  forgotBtn.onclick = async ()=>{
    if(!email.value){ email.classList.add('error'); return; }
    try{ await auth.sendPasswordResetEmail(email.value.trim()); alert("Reset link sent sa "+email.value); }catch(e){ alert(e.message); }
  };

  // GOOGLE - AUTO SWITCH POPUP / REDIRECT PARA SA MOBILE
  googleBtn.onclick = async ()=>{
    const provider = new firebase.auth.GoogleAuthProvider();
    provider.setCustomParameters({prompt:'select_account'});
    try{
      if(/Android|iPhone/i.test(navigator.userAgent)){
        await auth.signInWithRedirect(provider);
      } else {
        const r = await auth.signInWithPopup(provider);
        const sealed = await Security.seal({uid:r.user.uid});
        localStorage.setItem('mp_sealed', sealed);
        localStorage.setItem('mp_bio_enrolled','1');
        location.href = "home.html";
      }
    }catch(e){ alert(e.message); }
  };

  // HANDLE REDIRECT RESULT
  auth.getRedirectResult().then(async (res)=>{
    if(res && res.user){
      const sealed = await Security.seal({uid:res.user.uid});
      localStorage.setItem('mp_sealed', sealed);
      localStorage.setItem('mp_bio_enrolled','1');
      location.href = "home.html";
    }
  });

  // BIOMETRICS SIMPLE
  bioBtn.onclick = async ()=>{
    if(!localStorage.getItem('mp_bio_enrolled')){
      alert("Mag login ka muna ng normal para ma-enroll");
      return;
    }
    alert("Biometric ready - next version WebAuthn enroll gagawin natin pag ok na login mo");
    location.href = "home.html";
  };
});
