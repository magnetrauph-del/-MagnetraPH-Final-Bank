const functions = require('firebase-functions');
const admin = require('firebase-admin');
admin.initializeApp();
const db = admin.firestore();

function getMax(plan){
 if(plan==='gold') return 500;
 if(plan==='basic') return 100;
 return 3;
}

exports.checkPostLimit = functions.https.onRequest(async (req,res)=>{
 res.set('Access-Control-Allow-Origin','*');
 res.set('Access-Control-Allow-Headers','Content-Type, Authorization');
 res.set('Access-Control-Allow-Methods','POST, OPTIONS');
 if(req.method==='OPTIONS'){ res.status(200).send('ok'); return; }
 try{
  const authHeader = req.headers.authorization || '';
  if(!authHeader.startsWith('Bearer ')){ res.status(401).json({allowed:false, message:'No auth'}); return; }
  const token = authHeader.replace('Bearer ','');
  const decoded = await admin.auth().verifyIdToken(token);
  const uid = decoded.uid;
  const userSnap = await db.collection('users').doc(uid).get();
  if(!userSnap.exists){ res.status(200).json({allowed:true, max:3, current:0}); return; }
  const userData = userSnap.data();
  const plan = userData.plan || userData.role || 'free';
  const max = getMax(plan);
  const snap = await db.collection('products').where('uid','==',uid).get();
  const current = snap.size;
  if(current >= max){
   res.status(200).json({allowed:false, message:'Limit reached '+current+'/'+max+' - Upgrade Basic 100 Gold 500', max:max, current:current, plan:plan});
   return;
  }
  res.status(200).json({allowed:true, max:max, current:current, plan:plan});
 }catch(e){
  res.status(500).json({allowed:false, message:e.message});
 }
});

exports.addMPoints = functions.https.onRequest(async (req,res)=>{
 res.set('Access-Control-Allow-Origin','*');
 res.set('Access-Control-Allow-Headers','Content-Type, Authorization');
 res.set('Access-Control-Allow-Methods','POST, OPTIONS');
 if(req.method==='OPTIONS'){ res.status(200).send('ok'); return; }
 try{
  const authHeader = req.headers.authorization || '';
  if(!authHeader.startsWith('Bearer ')){ res.status(401).json({success:false, message:'No auth'}); return; }
  const token = authHeader.replace('Bearer ','');
  const decoded = await admin.auth().verifyIdToken(token);
  const uid = decoded.uid;
  const amount = parseInt(req.body.amount) || 0;
  if(amount < 1 || amount > 10000){ res.status(400).json({success:false, message:'Invalid amount'}); return; }
  const userRef = db.collection('users').doc(uid);
  await userRef.set({ mPoints: admin.firestore.FieldValue.increment(amount), updatedAt: admin.firestore.FieldValue.serverTimestamp() }, {merge:true});
  const userSnap = await userRef.get();
  const newBalance = userSnap.data().mPoints || amount;
  await db.collection('transactions').add({ uid: uid, amount: amount, type: 'mpoints_add', provider: 'manual_paymongo_pending', status: 'pending_credit', time: admin.firestore.FieldValue.serverTimestamp() });
  res.status(200).json({success:true, newBalance:newBalance, added:amount});
 }catch(e){
  res.status(500).json({success:false, message:e.message});
 }
});

exports.googlePlayPurchase = functions.https.onRequest(async (req,res)=>{
 res.set('Access-Control-Allow-Origin','*');
 res.set('Access-Control-Allow-Headers','Content-Type, Authorization');
 res.set('Access-Control-Allow-Methods','POST, OPTIONS');
 if(req.method==='OPTIONS'){ res.status(200).send('ok'); return; }
 try{
  const {uid, productId} = req.body;
  if(!uid || !productId){ res.status(400).send('missing'); return; }
  let plan='free';
  let points=0;
  if(productId==='basic_499'){ plan='basic'; points=500; }
  if(productId==='gold_999'){ plan='gold'; points=1200; }
  if(productId==='mp_100'){ plan='free'; points=100; }
  if(productId==='mp_500'){ plan='free'; points=500; }
  const updateData = { mPoints: admin.firestore.FieldValue.increment(points), updatedAt: admin.firestore.FieldValue.serverTimestamp() };
  if(productId==='basic_499' || productId==='gold_999'){
   updateData.plan = plan;
   updateData.role = plan;
   updateData.basic = plan==='basic' || plan==='gold';
   updateData.gold = plan==='gold';
  }
  await db.collection('users').doc(uid).set(updateData, {merge:true});
  await db.collection('transactions').add({ uid: uid, productId: productId, provider: 'google_play', status: 'paid', points: points, plan: plan, time: admin.firestore.FieldValue.serverTimestamp() });
  res.status(200).send({ok:true, plan:plan, points:points});
 }catch(e){
  res.status(500).send('error '+e.message);
 }
});

exports.paymongoWebhook = functions.https.onRequest(async (req,res)=>{
 try{
  const body = req.body;
  const data = body.data;
  if(!data){ res.status(400).send('no data'); return; }
  const attr = data.attributes || {};
  if(attr.status !== 'paid' && body.type !== 'checkout_session.payment.paid'){ res.status(200).send('not paid'); return; }
  const meta = attr.metadata || {};
  const uid = meta.uid;
  if(!uid){ res.status(200).send('no uid'); return; }
  await db.collection('transactions').add({ uid: uid, amount: attr.amount || 0, provider: 'paymongo', status: 'paid', paymongoId: data.id, metadata: meta, time: admin.firestore.FieldValue.serverTimestamp() });
  if(meta.mp_amount){
   const mp = parseInt(meta.mp_amount) || 0;
   if(mp>0){ await db.collection('users').doc(uid).set({ mPoints: admin.firestore.FieldValue.increment(mp), updatedAt: admin.firestore.FieldValue.serverTimestamp() }, {merge:true}); }
  }
  res.status(200).send('ok');
 }catch(e){
  res.status(500).send('error');
 }
});
exports.createAccountSecure = functions.https.onRequest(async (req,res)=>{
 res.set('Access-Control-Allow-Origin','*');
 res.set('Access-Control-Allow-Headers','Content-Type, Authorization');
 res.set('Access-Control-Allow-Methods','POST, OPTIONS');
 if(req.method==='OPTIONS'){ res.status(200).send('ok'); return; }
 try{
  const authHeader = req.headers.authorization || '';
  if(!authHeader.startsWith('Bearer ')){ res.status(401).json({ok:false, message:'No auth'}); return; }
  const token = authHeader.replace('Bearer ','');
  const decoded = await admin.auth().verifyIdToken(token);
  const uid = decoded.uid;
  const body = req.body || {};
  const email = (body.email || decoded.email || '').toLowerCase();
  const pwdScore = parseInt(body.pwdScore) || 0;
  let trialEnd = new Date(Date.now() + 7*24*60*60*1000);
  if(body.trialEnd){ try{ trialEnd = new Date(body.trialEnd); }catch(_){} }
  const now = new Date();
  const userRef = db.collection('users').doc(uid);
  await userRef.set({
   email: email, uid: uid,
   createdAt: admin.firestore.FieldValue.serverTimestamp(),
   lastLogin: admin.firestore.FieldValue.serverTimestamp(),
   verified: false, pwdStrength: pwdScore,
   plan: 'free', role: 'free', mPoints: 0,
   marketplace: { totalPost: 0, maxPost: 3, updatedAt: admin.firestore.FieldValue.serverTimestamp() },
   basic: { status: 'trial', trialStart: now, trialEnd: trialEnd, active: true, price: 499 },
   gold: { status: 'locked', active: false, price: 999 },
   isAdmin: false, provider: 'email'
  }, {merge:true});
  res.status(200).json({ok:true, plan:'free', mPoints:0});
 }catch(e){ res.status(500).json({ok:false, message:e.message}); }
});
