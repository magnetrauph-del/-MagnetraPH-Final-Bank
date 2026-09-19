const functions = require('firebase-functions');
const admin = require('firebase-admin');
admin.initializeApp();
const db = admin.firestore();

exports.checkPostLimit = functions.firestore.document('marketplace/{id}').onCreate(async (snap)=>{
  const data = snap.data();
  const uid = data.uid;
  if(!uid) return null;
  const userRef = db.collection('users').doc(uid);
  const userSnap = await userRef.get();
  if(!userSnap.exists) return null;
  const user = userSnap.data();
  const role = user.role || 'free';
  const total = user.marketplace?.totalPost || 0;
  let max = 3;
  if(role === 'basic') max = 100;
  if(role === 'gold') max = 500;
  if(total >= max){
    await snap.ref.delete();
    return null;
  }
  await userRef.set({
    marketplace: {
      totalPost: admin.firestore.FieldValue.increment(1),
      maxPost: max,
      updatedAt: admin.firestore.FieldValue.serverTimestamp()
    }
  }, {merge:true});
  return null;
});

exports.paymongoWebhook = functions.https.onRequest(async (req,res)=>{
  try{
    const body = req.body;
    const data = body.data;
    if(!data){ res.status(400).send('no data'); return; }
    const attr = data.attributes || {};
    if(attr.status !== 'paid' && body.type !== 'checkout_session.payment.paid'){
      res.status(200).send('not paid'); return;
    }
    const meta = attr.metadata || {};
    const uid = meta.uid;
    if(!uid){ res.status(200).send('no uid'); return; }
    await db.collection('transactions').add({
      uid: uid,
      amount: attr.amount || 0,
      provider: 'paymongo',
      status: 'paid',
      paymongoId: data.id,
      metadata: meta,
      time: admin.firestore.FieldValue.serverTimestamp()
    });
    res.status(200).send('ok');
  }catch(e){
    res.status(500).send('error');
  }
});

exports.googlePlayPurchase = functions.https.onRequest(async (req,res)=>{
  try{
    const {uid, productId} = req.body;
    if(!uid || !productId){ res.status(400).send('missing'); return; }
    let role='free'; let points=0;
    if(productId==='basic_499'){ role='basic'; points=500; }
    if(productId==='gold_999'){ role='gold'; points=1200; }
    await db.collection('users').doc(uid).set({
      role: role,
      basic: role==='basic' || role==='gold',
      gold: role==='gold',
      mPoints: admin.firestore.FieldValue.increment(points),
      updatedAt: admin.firestore.FieldValue.serverTimestamp()
    }, {merge:true});
    await db.collection('transactions').add({
      uid: uid,
      productId: productId,
      provider: 'google_play',
      status: 'paid',
      points: points,
      time: admin.firestore.FieldValue.serverTimestamp()
    });
    res.status(200).send({ok:true, role:role, points:points});
  }catch(e){
    res.status(500).send('error');
  }
});
