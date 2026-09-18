// security.js - MODULAR LOCK - SERVER AUTHORITATIVE
const Security = {
  COLLECTION: "users",

  async getRef(uid) {
    return db.collection(this.COLLECTION).doc(uid).collection("security").doc("lockout");
  },

  async isLocked(uid) {
    try {
      if (!uid) return false;
      const ref = await this.getRef(uid);
      const snap = await ref.get();
      if (!snap.exists) return false;
      const data = snap.data();
      if (!data.lockUntil) return false;
      return Date.now() < data.lockUntil;
    } catch (e) {
      return false;
    }
  },

  async getRemaining(uid) {
    try {
      const ref = await this.getRef(uid);
      const snap = await ref.get();
      if (!snap.exists) return 0;
      const data = snap.data();
      if (!data.lockUntil) return 0;
      const diff = data.lockUntil - Date.now();
      return diff > 0 ? Math.ceil(diff / 1000) : 0;
    } catch (e) {
      return 0;
    }
  },

  async addFail(uid, email) {
    try {
      const ref = await this.getRef(uid || email);
      const snap = await ref.get();
      let fails = 1;
      if (snap.exists) {
        const d = snap.data();
        const lastFail = d.lastFail || 0;
        const isWithinWindow = Date.now() - lastFail < 15 * 60 * 1000;
        fails = isWithinWindow ? (d.fails || 0) + 1 : 1;
      }

      let lockUntil = null;
      if (fails >= 5) {
        lockUntil = Date.now() + 5 * 60 * 1000;
      }

      await ref.set({
        fails: fails,
        lastFail: Date.now(),
        lockUntil: lockUntil,
        email: email || null,
        updatedAt: firebase.firestore.FieldValue.serverTimestamp()
      }, { merge: true });

      if (uid) {
        try {
          await db.collection("fails").add({
            uid: uid,
            email: email || null,
            time: firebase.firestore.FieldValue.serverTimestamp(),
            fails: fails
          });
        } catch (_) {}
      }

      return { locked: fails >= 5, fails: fails };
    } catch (e) {
      return { locked: false, fails: 0 };
    }
  },

  async resetFail(uid) {
    try {
      if (!uid) return;
      const ref = await this.getRef(uid);
      await ref.set({
        fails: 0,
        lockUntil: null,
        lastFail: null,
        updatedAt: firebase.firestore.FieldValue.serverTimestamp()
      }, { merge: true });
    } catch (e) {}
  },

  // client side UX only, hindi security
  isClientLocked() {
    const lock = parseInt(localStorage.getItem("mp_client_lock") || "0");
    return Date.now() < lock;
  },

  setClientLock(seconds) {
    localStorage.setItem("mp_client_lock", (Date.now() + seconds * 1000).toString());
  },

  clearClient() {
    localStorage.removeItem("mp_client_lock");
    localStorage.removeItem("mp_sealed");
    localStorage.removeItem("mp_bio_enrolled");
    localStorage.removeItem("mp_v2_key");
    localStorage.removeItem("mp_lock");
    localStorage.removeItem("mp_fail");
  }
};
