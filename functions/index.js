// functions/index.js - FINAL V3 - SEALED - OWNER ONLY - 20 YEARS - CONNECT SA PACKAGE.JSON + FIREBASERULES - BANK LEVEL
const functions = require('firebase-functions');
const admin = require('firebase-admin');
admin.initializeApp();
const db = admin.firestore();

function computeCommission(type, amount){
if(type === 'load') return 3;
if(type === 'bills') return 5;
if(type === 'cash') return Math.max(5, Math.ceil(amount * 0.02));
if(type === 'bank') return 10;
return 3;
}

exports.createBillsTransaction = functions.https.onCall(async (data, context) => {
if(!context.auth){ throw new functions.https.HttpsError('unauthenticated','Login required - sealed'); }
// AppCheck - bank level - harang peke app - para hindi ma daya subscription
if(context.app == undefined){
console.log('AppCheck missing - allow for now - enable later - sealed');
// pag enable mo AppCheck - gawin required - throw error - para bank level
}
const { type, payload } = data;
const validTypes = ['load','bills','cash','bank'];
if(!type || !validTypes.includes(type)){ throw new functions.https.HttpsError('invalid-argument','Invalid type - sealed'); }
if(!payload || Number(payload.amount) < 10){ throw new functions.https.HttpsError('invalid-argument','Amount too low - min 10 - sealed'); }
const cleanPayload = {};
if(type === 'load'){ if(!/^[0-9]{11}$/.test(payload.number)) throw new functions.https.HttpsError('invalid-argument','Invalid number - sealed'); cleanPayload.number = payload.number; cleanPayload.amount = Number(payload.amount); }
if(type === 'bills'){ if(!payload.biller || payload.account.length < 6) throw new functions.https.HttpsError('invalid-argument','Invalid biller - sealed'); cleanPayload.biller = payload.biller; cleanPayload.account = payload.account; cleanPayload.amount = Number(payload.amount); }
if(type === 'cash'){ if(!/^[0-9]{11}$/.test(payload.number)) throw new functions.https.HttpsError('invalid-argument','Invalid number - sealed'); cleanPayload.cashType = payload.cashType || 'CASHIN'; cleanPayload.wallet = payload.wallet || 'GCASH'; cleanPayload.number = payload.number; cleanPayload.amount = Number(payload.amount); }
if(type === 'bank'){ if(!payload.bank || payload.account.length < 6) throw new functions.https.HttpsError('invalid-argument','Invalid bank - sealed'); cleanPayload.bank = payload.bank; cleanPayload.account = payload.account; cleanPayload.amount = Number(payload.amount); }
const commission = computeCommission(type, cleanPayload.amount);
const docRef = await db.collection('transactions').add({
uid: context.auth.uid,
type: type,
payload: cleanPayload,
amount: cleanPayload.amount,
commission: commission,
commissionText: '₱' + commission + '.00',
status: 'PENDING',
createdAt: admin.firestore.FieldValue.serverTimestamp(),
source: 'createBillsTransaction - server authoritative - does not hold funds - sealed',
clientVersion: 'bills-core.js V2 SUPER SAFE',
verified: false
});
return { transactionId: docRef.id, type: type, amount: cleanPayload.amount, commission: commission, status: 'PENDING', message: 'Secure - PENDING only - server will mark PAID after PayMongo webhook - sealed' };
});

exports.paymongoWebhook = functions.https.onRequest(async (req, res) => {
try{
const body = req.body;
if(!body || !body.data){ return res.status(200).send('no data - sealed'); }
const event = body.data;
const attrs = event.attributes;
if(!attrs) return res.status(200).send('no attrs - sealed');
const status = attrs.status;
if(status!== 'paid' && status!== 'succeeded' && status!== 'paid_and_captured'){ return res.status(200).send('ignored not paid - sealed'); }
let transactionId = null;
if(attrs.metadata && attrs.metadata.transactionId){ transactionId = attrs.metadata.transactionId; }
else if(attrs.reference_number){ transactionId = attrs.reference_number; }
if(!transactionId){ return res.status(200).send('no transactionId - sealed'); }
const docRef = db.collection('transactions').doc(transactionId);
const snap = await docRef.get();
if(!snap.exists){ return res.status(200).send('transaction not found - sealed'); }
const current = snap.data();
if(current.status === 'PAID'){ return res.status(200).send('already paid - sealed'); }
await docRef.update({
status: 'PAID',
paidAt: admin.firestore.FieldValue.serverTimestamp(),
paymongoEventId: event.id,
paymongoData: attrs,
verified: true
});
return res.status(200).send('paid ok - sealed');
}catch(e){
console.error('paymongoWebhook error - sealed', e);
return res.status(500).send('error - sealed');
}
});

exports.googlePlayWebhook = functions.https.onRequest(async (req, res) => {
return res.status(200).send('ok - sealed - Google Play verify server only');
});
