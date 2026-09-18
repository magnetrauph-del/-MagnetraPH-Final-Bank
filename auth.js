      // auth.js - PRO E-WALLET FLOW - SEALED MODULAR LOCK
const firebaseConfig = {
  apiKey: "AIzaSy...LAGAY_MO_TUNAY_NA_API_KEY_MO",
  authDomain: "x-ultra-5a5ea.firebaseapp.com",
  projectId: "x-ultra-5a5ea",
  appId: "1:...."
};

if (!firebase.apps.length) {
  firebase.initializeApp(firebaseConfig);
}
const auth = firebase.auth();
const db = firebase.firestore();

auth.setPersistence(firebase.auth.Auth.Persistence.LOCAL);

document.addEventListener('DOMContentLoaded', () => {
  const email = document.getElementById('email');
  const pass = document.getElementById('password');
  const loginBtn = document.getElementById('loginBtn');
  const eyeBtn = document.getElementById('eyeBtn');
  const eyeOpen = document.getElementById('eyeOpen');
  const eyeClose = document.getElementById('eyeClose');
  const forgotBtn = document.getElementById('forgotBtn');
  const bioBtn = document.getElementById('bioBtn');
  const googleBtn = document.getElementById('googleBtn');

  if (eyeBtn && pass) {
    eyeBtn.onclick = () => {
      const isPass = pass.type === 'password';
      pass.type = isPass ? 'text' : 'password';
      if (eyeOpen && eyeClose) {
        eyeOpen.style.display = isPass ? 'none' : 'block';
        eyeClose.style.display = isPass ? 'block' : 'none';
      }
    };
  }

  auth.onAuthStateChanged(async (user) => {
    if (user) {
      const locked = await Security.isLocked(user.uid);
      if (locked) {
        const sec = await Security.getRemaining(user.uid);
        if (loginBtn) {
          loginBtn.textContent = "Locked " + sec + "s";
          loginBtn.disabled = true;
        }
        await auth.signOut();
        Security.clearClient();
        setTimeout(() => location.reload(), sec * 1000);
      }
    }
  });

  if (loginBtn) {
    loginBtn.onclick = async () => {
      const emailVal = email ? email.value.trim().toLowerCase() : "";
      const passVal = pass ? pass.value : "";

      if (email) email.classList.remove('error');
      if (pass) pass.classList.remove('error');

      if (!emailVal || !passVal) {
        if (email && !emailVal) email.classList.add('error');
        if (pass && !passVal) pass.classList.add('error');
        if (navigator.vibrate) navigator.vibrate(100);
        return;
      }

      loginBtn.textContent = "Verifying...";
      loginBtn.disabled = true;

      try {
        const tempUid = emailVal;
        const preLocked = await Security.isLocked(tempUid);
        if (preLocked) {
          const rem = await Security.getRemaining(tempUid);
          loginBtn.textContent = "Locked " + rem + "s";
          loginBtn.disabled = true;
          Security.setClientLock(rem);
          setTimeout(() => location.reload(), rem * 1000);
          return;
        }

        const cred = await auth.signInWithEmailAndPassword(emailVal, passVal);

        const locked = await Security.isLocked(cred.user.uid);
        if (locked) {
          const rem = await Security.getRemaining(cred.user.uid);
          await auth.signOut();
          loginBtn.textContent = "Locked " + rem + "s";
          Security.setClientLock(rem);
          setTimeout(() => location.reload(), rem * 1000);
          return;
        }

        await db.collection('users').doc(cred.user.uid).set({
          lastLogin: firebase.firestore.FieldValue.serverTimestamp(),
          email: cred.user.email
        }, { merge: true });

        await Security.resetFail(cred.user.uid);
        Security.clearClient();

        location.href = "home.html";

      } catch (e) {
        if (email) email.classList.add('error');
        if (pass) pass.classList.add('error');
        if (navigator.vibrate) navigator.vibrate([80, 40, 80]);

        const result = await Security.addFail(emailVal, emailVal);
        if (result.locked) {
          Security.setClientLock(300);
          location.reload();
        } else {
          loginBtn.textContent = "Log in";
          loginBtn.disabled = false;
          const msg = e.code === 'auth/wrong-password' || e.code === 'auth/user-not-found' ? "Mali ang email o password" : e.message;
          alert(msg + " (Fail " + result.fails + "/5)");
        }
      }
    };
  }

  if (forgotBtn) {
    forgotBtn.onclick = async () => {
      const emailVal = email ? email.value.trim() : "";
      if (!emailVal) {
        if (email) email.classList.add('error');
        return;
      }
      try {
        await auth.sendPasswordResetEmail(emailVal);
        alert("Reset link sent sa " + emailVal);
      } catch (e) {
        alert(e.message);
      }
    };
  }

  if (googleBtn) {
    googleBtn.onclick = async () => {
      const provider = new firebase.auth.GoogleAuthProvider();
      provider.setCustomParameters({ prompt: 'select_account' });
      try {
        let result;
        if (/Android|iPhone|iPad/i.test(navigator.userAgent)) {
          await auth.signInWithRedirect(provider);
          return;
        } else {
          result = await auth.signInWithPopup(provider);
        }
        if (result && result.user) {
          await db.collection('users').doc(result.user.uid).set({
            lastLogin: firebase.firestore.FieldValue.serverTimestamp(),
            email: result.user.email,
            provider: 'google'
          }, { merge: true });
          await Security.resetFail(result.user.uid);
          Security.clearClient();
          location.href = "home.html";
        }
      } catch (e) {
        alert(e.message);
      }
    };
  }

  auth.getRedirectResult().then(async (res) => {
    if (res && res.user) {
      await db.collection('users').doc(res.user.uid).set({
        lastLogin: firebase.firestore.FieldValue.serverTimestamp(),
        email: res.user.email,
        provider: 'google'
      }, { merge: true });
      await Security.resetFail(res.user.uid);
      Security.clearClient();
      location.href = "home.html";
    }
  }).catch(() => {});

  if (bioBtn) {
    bioBtn.onclick = () => {
      alert("Biometrics: Mag login ka muna ng normal isang beses. Next update WebAuthn passkeys na gagamitin natin, naka ready na sa rules mo na passkeys/{uid}.");
    };
  }
});
