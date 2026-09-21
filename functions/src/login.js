// functions/src/login.js - LOGIN UTAK ONLY - 20Y SEALED OWNER ONLY
const functions = require("firebase-functions");
const admin = require("firebase-admin");
const db = admin.firestore();

exports.checkLoginAttempt = functions.https.onCall(async (data, context) => {
  if (!context.app) throw new functions.https.HttpsError('failed-precondition','AppCheck required');
  const email = (data.email||'').toLowerCase();
  const ref = db.collection('_loginAttempts').doc(email);
  const doc = await ref.get();
  const now = Date.now();
  let rec = doc.exists ? doc.data() : {count:0, blockUntil:0};
  if (rec.blockUntil && now < rec.blockUntil) {
    const sec = Math.ceil((rec.blockUntil-now)/1000);
    throw new functions.https.HttpsError('resource-exhausted','Locked '+sec+'s');
  }
  return {ok:true};
});
exports.recordFail = functions.https.onCall(async (data, context) => {
  if (!context.app) throw new functions.https.HttpsError('failed-precondition','AppCheck required');
  const email = (data.email||'').toLowerCase();
  const ref = db.collection('_loginAttempts').doc(email);
  const doc = await ref.get();
  let rec = doc.exists ? doc.data() : {count:0, blockUntil:0};
  const now = Date.now();
  rec.count += 1;
  if (rec.count === 3) rec.blockUntil = now + 45*1000;
  else if (rec.count === 4) rec.blockUntil = now + 2*60*1000;
  else if (rec.count === 5) rec.blockUntil = now + 10*60*1000;
  else if (rec.count === 6) rec.blockUntil = now + 60*60*1000;
  else if (rec.count >= 7) rec.blockUntil = now + 24*60*60*1000;
  await ref.set(rec);
  return {ok:true};
});
exports.clearFailServer = functions.https.onCall(async (data, context) => {
  if (!context.auth) throw new functions.https.HttpsError('unauthenticated','Auth required');
  const email = (data.email||'').toLowerCase();
  if (email) await db.collection('_loginAttempts').doc(email).delete();
  return {ok:true};
});
