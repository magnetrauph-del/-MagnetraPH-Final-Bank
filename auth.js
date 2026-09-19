// ID: S-AUTH-PRO-MASTER - LOCK: OWNER SEALED - CONNECTED: CREATE + DASHBOARD + VAULT
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
      const locked = await db.collection('securityLocks').doc(user.uid).get();
      if (locked.exists && locked.data().lockedUntil && locked.data().lockedUntil.toDate() > new Date()) {
        await auth.signOut();
        const sec = Math.ceil((locked.data().lockedUntil.toDate() - new Date()) / 1000);
        if (loginBtn) {
          loginBtn.textContent = "Locked " + sec + "s";
          loginBtn.disabled = true;
        }
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
        const cred = await auth.signInWithEmailAndPassword(emailVal, passVal);
        if (!cred.user.emailVerified) {
          await auth.signOut();
          alert("Verify email muna - check Gmail mo");
          location.href = "verify.html";
          return;
        }
        const uDoc = await db.collection('users').doc(cred.user.uid).get();
        if (!uDoc.exists) {
          const now = new Date();
          const basicEnd = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
          await db.collection('users').doc(cred.user.uid).set({
            email: cred.user.email,
            displayName: cred.user.displayName || "",
            createdAt: firebase.firestore.FieldValue.serverTimestamp(),
            lastLogin: firebase.firestore.FieldValue.serverTimestamp(),
            marketplace: { free: true, maxPost: 3, totalPost: 0 },
            basic: { status: 'trial', trialStart: now, trialEnd: basicEnd, paid: false, price: 499, active: true },
            gold: { status: 'locked', trialStart: null, trialEnd: null, paid: false, price: 999 },
            mPoints: 0,
            walletBalance: 0,
            isAdmin: false,
            role: 'free',
            provider: 'email'
          }, { merge: true });
        } else {
          await db.collection('users').doc(cred.user.uid).update({
            lastLogin: firebase.firestore.FieldValue.serverTimestamp()
          });
        }
        location.href = "dashboard.html";
      } catch (e) {
        alert(e.message);
        loginBtn.textContent = "Login";
        loginBtn.disabled = false;
      }
    };
  }

  if (forgotBtn) {
    forgotBtn.onclick = async () => {
      const emailVal = email ? email.value.trim().toLowerCase() : "";
      if (!emailVal) { alert("Lagay email muna"); return; }
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
          const now = new Date();
          const basicEnd = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
          await db.collection('users').doc(result.user.uid).set({
            lastLogin: firebase.firestore.FieldValue.serverTimestamp(),
            email: result.user.email,
            displayName: result.user.displayName || "",
            provider: 'google',
            createdAt: firebase.firestore.FieldValue.serverTimestamp(),
            marketplace: { free: true, maxPost: 3, totalPost: 0 },
            basic: { status: 'trial', trialStart: now, trialEnd: basicEnd, paid: false, price: 499, active: true },
            gold: { status: 'locked', trialStart: null, trialEnd: null, paid: false, price: 999 },
            mPoints: 0,
            walletBalance: 0,
            isAdmin: false,
            role: 'free'
          }, { merge: true });
          location.href = "dashboard.html";
        }
      } catch (e) {
        alert(e.message);
      }
    };
  }

  auth.getRedirectResult().then(async (res) => {
    if (res && res.user) {
      const now = new Date();
      const basicEnd = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
      await db.collection('users').doc(res.user.uid).set({
        lastLogin: firebase.firestore.FieldValue.serverTimestamp(),
        email: res.user.email,
        displayName: res.user.displayName || "",
        provider: 'google',
        createdAt: firebase.firestore.FieldValue.serverTimestamp(),
        marketplace: { free: true, maxPost: 3, totalPost: 0 },
        basic: { status: 'trial', trialStart: now, trialEnd: basicEnd, paid: false, price: 499, active: true },
        gold: { status: 'locked', trialStart: null, trialEnd: null, paid: false, price: 999 },
        mPoints: 0,
        walletBalance: 0,
        isAdmin: false,
        role: 'free'
      }, { merge: true });
      location.href = "dashboard.html";
    }
  }).catch(() => {});

  if (bioBtn) {
    bioBtn.onclick = () => {
      alert("Biometrics: Mag login ka muna ng normal isang beses. Next login pwede na fingerprint");
    };
  }
});
