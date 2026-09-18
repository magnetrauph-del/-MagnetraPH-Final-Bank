// functions/index.js - MAGNETRAPH - BANK CORE - SEALED 100%
const {onCall, HttpsError} = require("firebase-functions/v2/https");
const {onDocumentCreated} = require("firebase-functions/v2/firestore");
const admin = require("firebase-admin");

admin.initializeApp();
const db = admin.firestore();
const FieldValue = admin.firestore.FieldValue;

// AUTO CREATE WALLET PAG NEW USER
exports.onUserCreate = onDocumentCreated("users/{uid}", async (event) => {
  const uid = event.params.uid;
  const walletRef = db.collection("wallets").doc(uid);
  const snap = await walletRef.get();
  if (!snap.exists) {
    await walletRef.set({
      uid: uid,
      balance: 0,
      createdAt: FieldValue.serverTimestamp(),
      updatedAt: FieldValue.serverTimestamp()
    });
  }
});

// TRANSFER - SEALED, SERVER ONLY
exports.transferMoney = onCall(async (request) => {
  if (!request.auth) {
    throw new HttpsError("unauthenticated", "Login required");
  }

  const fromUid = request.auth.uid;
  const toEmail = (request.data.toEmail || "").trim().toLowerCase();
  const amount = Number(request.data.amount);
  const idempotencyKey = (request.data.key || "").trim();

  if (!toEmail ||!amount || amount <= 0) {
    throw new HttpsError("invalid-argument", "Invalid data");
  }

  if (amount < 1 || amount > 50000) {
    throw new HttpsError("invalid-argument", "Amount 1 to 50000 only");
  }

  if (!idempotencyKey) {
    throw new HttpsError("invalid-argument", "Missing key");
  }

  const toUserQuery = await db.collection("users").where("email", "==", toEmail).limit(1).get();
  if (toUserQuery.empty) {
    throw new HttpsError("not-found", "Receiver not found");
  }
  const toUid = toUserQuery.docs[0].id;

  if (fromUid === toUid) {
    throw new HttpsError("invalid-argument", "Cannot transfer to self");
  }

  const txRef = db.collection("transactions").doc(idempotencyKey);
  const existingTx = await txRef.get();
  if (existingTx.exists) {
    return {success: true, duplicate: true};
  }

  const fromWalletRef = db.collection("wallets").doc(fromUid);
  const toWalletRef = db.collection("wallets").doc(toUid);

  try {
    await db.runTransaction(async (t) => {
      const fromSnap = await t.get(fromWalletRef);
      const toSnap = await t.get(toWalletRef);

      if (!fromSnap.exists ||!toSnap.exists) {
        throw new HttpsError("not-found", "Wallet not found");
      }

      const fromBal = fromSnap.data().balance || 0;
      if (fromBal < amount) {
        throw new HttpsError("failed-precondition", "Insufficient balance");
      }

      t.update(fromWalletRef, {
        balance: fromBal - amount,
        updatedAt: FieldValue.serverTimestamp()
      });

      const toBal = toSnap.data().balance || 0;
      t.update(toWalletRef, {
        balance: toBal + amount,
        updatedAt: FieldValue.serverTimestamp()
      });

      t.set(txRef, {
        uid: fromUid,
        fromUid: fromUid,
        toUid: toUid,
        toEmail: toEmail,
        amount: amount,
        type: "transfer",
        status: "completed",
        createdAt: FieldValue.serverTimestamp()
      });

      const toTxRef = db.collection("transactions").doc();
      t.set(toTxRef, {
        uid: toUid,
        fromUid: fromUid,
        toUid: toUid,
        amount: amount,
        type: "receive",
        status: "completed",
        createdAt: FieldValue.serverTimestamp()
      });
    });

    return {success: true};

  } catch (e) {
    if (e instanceof HttpsError) throw e;
    throw new HttpsError("internal", e.message);
  }
});

// CASH IN REQUEST - USER REQUEST LANG, HINDI AGAD DAGDAG PERA
exports.requestCashIn = onCall(async (request) => {
  if (!request.auth) {
    throw new HttpsError("unauthenticated", "Login required");
  }

  const uid = request.auth.uid;
  const amount = Number(request.data.amount);
  const method = (request.data.method || "gcash").trim();
  const reference = (request.data.reference || "").trim();

  if (!amount || amount < 10 || amount > 50000) {
    throw new HttpsError("invalid-argument", "Amount 10 to 50000 only");
  }

  if (!reference || reference.length < 6) {
    throw new HttpsError("invalid-argument", "Invalid reference");
  }

  const reqRef = db.collection("cashInRequests").doc();
  await reqRef.set({
    id: reqRef.id,
    uid: uid,
    amount: amount,
    method: method,
    reference: reference,
    status: "pending",
    createdAt: FieldValue.serverTimestamp()
  });

  await db.collection("transactions").add({
    uid: uid,
    amount: amount,
    type: "cashin_pending",
    status: "pending",
    method: method,
    reference: reference,
    createdAt: FieldValue.serverTimestamp()
  });

  return {success: true, id: reqRef.id};
});

// APPROVE CASH IN - ADMIN ONLY - SERVER LANG GAGALAW NG PERA
exports.approveCashIn = onCall(async (request) => {
  if (!request.auth) {
    throw new HttpsError("unauthenticated", "Login required");
  }

  const callerUid = request.auth.uid;
  const adminDoc = await db.collection("admins").doc(callerUid).get();
  const isAdmin = adminDoc.exists || request.auth.token.admin === true;

  if (!isAdmin) {
    throw new HttpsError("permission-denied", "Admin only");
  }

  const requestId = (request.data.requestId || "").trim();
  if (!requestId) {
    throw new HttpsError("invalid-argument", "Missing requestId");
  }

  const reqRef = db.collection("cashInRequests").doc(requestId);
  const reqSnap = await reqRef.get();

  if (!reqSnap.exists) {
    throw new HttpsError("not-found", "Request not found");
  }

  const reqData = reqSnap.data();
  if (reqData.status!== "pending") {
    throw new HttpsError("failed-precondition", "Already processed");
  }

  const uid = reqData.uid;
  const amount = reqData.amount;
  const walletRef = db.collection("wallets").doc(uid);

  await db.runTransaction(async (t) => {
    const walletSnap = await t.get(walletRef);
    if (!walletSnap.exists) {
      throw new HttpsError("not-found", "Wallet not found");
    }

    const currentBal = walletSnap.data().balance || 0;

    t.update(walletRef, {
      balance: currentBal + amount,
      updatedAt: FieldValue.serverTimestamp()
    });

    t.update(reqRef, {
      status: "approved",
      approvedBy: callerUid,
      approvedAt: FieldValue.serverTimestamp()
    });

    const txRef = db.collection("transactions").doc();
    t.set(txRef, {
      uid: uid,
      amount: amount,
      type: "cashin_approved",
      status: "completed",
      method: reqData.method,
      reference: reqData.reference,
      requestId: requestId,
      createdAt: FieldValue.serverTimestamp()
    });
  });

  return {success: true};
});

// GET BALANCE - SERVER TRUTH - HINDI GALING SA LOCALSTORAGE
exports.getBalance = onCall(async (request) => {
  if (!request.auth) {
    throw new HttpsError("unauthenticated", "Login required");
  }
  const uid = request.auth.uid;
  const walletSnap = await db.collection("wallets").doc(uid).get();
  if (!walletSnap.exists) {
    return {balance: 0};
  }
  return {balance: walletSnap.data().balance || 0};
});
