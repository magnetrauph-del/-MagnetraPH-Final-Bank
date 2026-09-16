import { initializeApp } from "firebase-admin/app";
import { getFirestore, FieldValue } from "firebase-admin/firestore";
import { onCall, HttpsError } from "firebase-functions/v2/https";
initializeApp();
const db = getFirestore();

// LAHAT NG FUNCTION - MAY APPCHECK + AUTH REQUIRED - WALANG BASTA MAKATAWAG
const opts = { enforceAppCheck: true, consumeAppCheckToken: true, region: "asia-southeast1" };

// WALLET - AUTO CREATE PAG UNANG LOGIN
export const ensureWallet = onCall(opts, async (req)=>{
  if(!req.auth) throw new HttpsError('unauthenticated','Login first');
  const uid = req.auth.uid;
  const ref = db.doc(`wallets/${uid}`);
  const snap = await ref.get();
  if(!snap.exists){
    await ref.set({uid, balance: 0, did: req.data?.did||'unknown', createdAt: FieldValue.serverTimestamp(), updatedAt: FieldValue.serverTimestamp()});
  }
  return {ok:true};
});

// CASH IN - USER REQUEST LANG - HINDI DIRECT DAGDAG - IKAW MAG APPROVE SA ADMIN
export const requestCashIn = onCall(opts, async (req)=>{
  if(!req.auth) throw new HttpsError('unauthenticated','Login first');
  const uid = req.auth.uid;
  const amount = Number(req.data.amount);
  const proofUrl = String(req.data.proofUrl||'').slice(0,500);
  const did = String(req.data.did||'unknown').slice(0,100);
  if(!(amount>=100 && amount<=50000)) throw new HttpsError('invalid-argument','100 to 50k only');
  if(!proofUrl.startsWith('https://')) throw new HttpsError('invalid-argument','Upload proof first');
  const ref = await db.collection('cashInRequests').add({
    uid, amount, proofUrl, did,
    status:'pending',
    createdAt: FieldValue.serverTimestamp()
  });
  await db.collection('transactions').add({
    uid, type:'cashin_request', amount, status:'pending', reqId: ref.id, did,
    createdAt: FieldValue.serverTimestamp()
  });
  return {ok:true, reqId: ref.id};
});

// ADMIN APPROVE - IKAW LANG TATAWAG NITO SA ADMIN PANEL MO - HINDI USER
export const approveCashIn = onCall(opts, async (req)=>{
  if(!req.auth) throw new HttpsError('unauthenticated','Login first');
  // TODO: palitan mo ng sarili mong admin uid check
  const ADMIN_UIDS = ['ILAGAY_MO_DITO_ADMIN_UID_MO'];
  if(!ADMIN_UIDS.includes(req.auth.uid)) throw new HttpsError('permission-denied','Admin only');
  const reqId = req.data.reqId;
  const reqSnap = await db.doc(`cashInRequests/${reqId}`).get();
  if(!reqSnap.exists) throw new HttpsError('not-found','Request not found');
  const data = reqSnap.data();
  if(data.status!=='pending') throw new HttpsError('already-exists','Already processed');
  
  const walletRef = db.doc(`wallets/${data.uid}`);
  await db.runTransaction(async (t)=>{
    const w = await t.get(walletRef);
    if(!w.exists) throw new HttpsError('not-found','Wallet not found');
    t.update(walletRef,{balance: FieldValue.increment(data.amount), updatedAt: FieldValue.serverTimestamp()});
    t.update(reqSnap.ref,{status:'approved', approvedAt: FieldValue.serverTimestamp(), approvedBy: req.auth.uid});
    t.set(db.collection('transactions').doc(),{
      uid: data.uid, type:'cashin_approved', amount: data.amount, status:'approved',
      reqId, did: data.did, createdAt: FieldValue.serverTimestamp()
    });
  });
  return {ok:true};
});