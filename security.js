// security.js - MagnetraPH - By Order - Lock - No Wallet - MPoints Boost Only
const Security = {
 COLLECTION: "users",
 LOCK_DOC: "main",
 MAX_FAILS: 5,
 LOCK_MINUTES: 5,
 WINDOW_MINUTES: 15,
 FREE_MAX_POST: 3,
 BASIC_MAX_POST: 100,
 GOLD_MAX_POST: 500,

 async getRef(uid){
  return db.collection(this.COLLECTION).doc(uid).collection("security").doc(this.LOCK_DOC);
 },

 async isLocked(uid){
  try{
   if(!uid) return false;
   const ref = await this.getRef(uid);
   const snap = await ref.get();
   if(!snap.exists) return false;
   const data = snap.data();
   if(!data.lockUntil) return false;
   return Date.now() < data.lockUntil;
  }catch(e){ return false; }
 },

 async getRemaining(uid){
  try{
   const ref = await this.getRef(uid);
   const snap = await ref.get();
   if(!snap.exists) return 0;
   const data = snap.data();
   if(!data.lockUntil) return 0;
   const diff = data.lockUntil - Date.now();
   return diff > 0 ? Math.ceil(diff/1000) : 0;
  }catch(e){ return 0; }
 },

 async addFail(uid, email){
  try{
   if(!uid) return {locked:false, fails:0};
   const ref = await this.getRef(uid);
   const snap = await ref.get();
   let fails = 1;
   if(snap.exists){
    const d = snap.data();
    const lastFail = d.lastFail || 0;
    const within = Date.now() - lastFail < this.WINDOW_MINUTES * 60 * 1000;
    fails = within ? (d.fails || 0) + 1 : 1;
   }
   let lockUntil = null;
   if(fails >= this.MAX_FAILS){ lockUntil = Date.now() + this.LOCK_MINUTES * 60 * 1000; }
   await ref.set({ fails: fails, lastFail: Date.now(), lockUntil: lockUntil, email: email || null, updatedAt: firebase.firestore.FieldValue.serverTimestamp() }, {merge:true});
   try{ await db.collection("fails").add({ uid: uid, email: email || null, time: firebase.firestore.FieldValue.serverTimestamp(), fails: fails }); }catch(_){}
   return {locked: fails >= this.MAX_FAILS, fails: fails};
  }catch(e){ return {locked:false, fails:0}; }
 },

 async resetFail(uid){
  try{
   if(!uid) return;
   const ref = await this.getRef(uid);
   await ref.set({ fails: 0, lockUntil: null, lastFail: null, updatedAt: firebase.firestore.FieldValue.serverTimestamp() }, {merge:true});
  }catch(e){}
 },

 isClientLocked(){
  const lock = parseInt(localStorage.getItem("mp_client_lock") || "0");
  return Date.now() < lock;
 },

 setClientLock(seconds){
  localStorage.setItem("mp_client_lock", (Date.now() + seconds * 1000).toString());
 },

 clearClient(){
  localStorage.removeItem("mp_client_lock");
  localStorage.removeItem("mp_fail");
  localStorage.removeItem("mp_lock");
 },

 checkDomLock(){
  const c = document.getElementById('CFG-LOCK');
  const m = document.getElementById('S-DASH-MASTER');
  if(!c || c.dataset.lock !== "OWNER") return true;
  if(m && m.dataset.lock !== "OWNER") return true;
  if(c.dataset.modulock !== "SEAL") return true;
  if(m && m.dataset.modulock !== "DASHBOARD") return true;
  return false;
 },

 sanitize(text){
  if(!text) return "";
  return text.toString().replace(/<[^>]*>/g,"").slice(0,500);
 },

 async canPost(uid){
  try{
   if(!uid) return false;
   const snap = await db.collection("users").doc(uid).get();
   if(!snap.exists) return true;
   const d = snap.data();
   const total = d.marketplace?.totalPost || 0;
   const plan = d.plan || d.role || "free";
   if(plan === "gold") return total < 500;
   if(plan === "basic") return total < 100;
   return total < 3;
  }catch(e){ return true; }
 }
};
